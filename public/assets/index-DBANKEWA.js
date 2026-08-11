import{I as ue,y as he,E as ce,j as y,V as S,i as H,D as ae,s as de,k as G,z as $,q as Z,w as z,d as E,o as se,r as ie,N,u as I,l as X,S as pe,Y as fe,Z as me,_ as oe,n as ve,R as ge,L as we,G as be,Q as ye,e as xe}from"./three-sQPBrRwf.js";const q=`
float rnHash11(float p) { p = fract(p * 0.1031); p *= p + 33.33; p *= p + p; return fract(p); }

float rnHash12(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}

vec2 rnHash22(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * vec3(0.1031, 0.1030, 0.0973));
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.xx + p3.yz) * p3.zy);
}

vec4 rnHash42(vec2 p) {
  vec4 p4 = fract(vec4(p.xyxy) * vec4(0.1031, 0.1030, 0.0973, 0.1099));
  p4 += dot(p4, p4.wzxy + 33.33);
  return fract((p4.xxyz + p4.yzzw) * p4.zywx);
}

float rnIgn(vec2 p) {
  return fract(52.9829189 * fract(0.06711056 * p.x + 0.00583715 * p.y));
}
`,re=`
vec3 rnToLinear(vec3 c) { return c * c; }
vec3 rnToSrgb(vec3 c) { return sqrt(max(c, 0.0)); }
float rnLuma(vec3 c) { return dot(c, vec3(0.2126, 0.7152, 0.0722)); }
`,ne=`
// The grab is whatever buffer was bound: the sRGB canvas by default, or a
// linear HDR target if post took over the draw and told us so.
#ifdef RN_SOURCE_LINEAR
  #define RN_DEC(c) (c)
  #define RN_ENC(c) (c)
#else
  #define RN_DEC(c) rnToLinear(c)
  #define RN_ENC(c) rnToSrgb(c)
#endif
`,_e=`
float rnSpot(vec3 P, vec3 lp, vec3 axis, vec2 cone, float k) {
  vec3 L = P - lp;
  float d = max(length(L), 0.001);
  float c = dot(L / d, axis);
  return smoothstep(cone.x, cone.y, c) / (1.0 + d * d * k);
}
`,Se=`
precision highp float;

attribute vec4 aCell;  // x,y = lateral cell + wobble phase, z = depth t, w = fall phase
attribute vec4 aRnd;   // x = size/speed, y = wander, z = brightness, w = spare

uniform vec3  uCamPos;
uniform vec3  uCamRight;
uniform vec3  uCamUp;
uniform vec3  uCamFwd;
uniform float uTanHalfFov;
uniform float uAspect;

uniform float uTime;
uniform float uNear;
uniform float uFar;
uniform vec2  uWind;      // world x,z shear per world unit fallen
uniform float uFall;      // world units / second
uniform float uLen;       // base streak length at d = 6
uniform float uPxWidth;   // streak width in device pixels
uniform float uPxPerWorld;// world units per device pixel at distance 1
uniform float uIntensity;
uniform vec2  uFarFade;   // (start, end) of the far-population recession

uniform vec3  uKeyPos;
uniform vec3  uKeyAxis;
uniform vec2  uKeyCone;
uniform vec3  uKeyCol;
uniform vec3  uRimPos;
uniform vec3  uRimAxis;
uniform vec2  uRimCone;
uniform vec3  uRimCol;
uniform vec3  uBaseCol;
uniform float uKeyGain;
uniform float uRimGain;

uniform sampler2D uScene;
uniform float uSceneAmt;

varying vec2  vUv;
varying vec3  vTint;
varying float vFade;
varying float vBlur;

${q}
${_e}
${re}
${ne}

// Vertex texture fetch. three compiles ShaderMaterial as GLSL ES 3.00 on a
// WebGL2 context and shims texture2D -> texture, but nothing shims the explicit
// -Lod form, so it has to be spelled both ways.
#if __VERSION__ >= 300
  #define rnTexLod(s, u) textureLod(s, u, 0.0)
#else
  #define rnTexLod(s, u) texture2DLod(s, u, 0.0)
#endif

void main() {
  // ---- depth: log-uniform, equal drops per octave --------------------------
  float d = uNear * pow(uFar / uNear, aCell.z);
  float hh = uTanHalfFov * d;
  float hw = hh * uAspect;

  // size and speed share one random so a fast drop is also a long one — a
  // streak IS the motion blur of a drop over the exposure
  float sz = 0.55 + 0.90 * aRnd.x;
  float speed = uFall * (0.78 + 0.44 * aRnd.x);
  // Almost a constant WORLD length, so screen length falls off as ~1/d. Let the
  // exponent creep up and the far population stops being mist and starts being
  // a second curtain of strokes laid over the first.
  float lenW = uLen * sz * pow(d / 6.0, 0.12);

  // ---- placement -----------------------------------------------------------
  vec3 axis = uCamPos + uCamFwd * d;
  float spanY = 2.0 * hh * 1.45 + lenW;

  vec3 p = axis + uCamRight * (aCell.x * hw * (1.30 + abs(uWind.x) * 0.55));
  float travel = mod(uTime * speed + aCell.w * spanY * 4.0, spanY);
  p.y = axis.y + spanY * 0.5 - travel;

  // shear grows with distance fallen, centred so the column stays in frame
  float fallen = travel - spanY * 0.5;
  p.x += uWind.x * fallen;
  p.z += uWind.y * fallen;

  // a hair of lateral wander so the column is not a perfect ruled grid
  p.x += sin(uTime * 0.7 + aCell.y * 31.0) * 0.035 * d * aRnd.y;

  // ---- billboard along the velocity vector ---------------------------------
  vec3 vdir = normalize(vec3(uWind.x, -1.0, uWind.y));
  vec3 toCam = uCamPos - p;
  float dist = max(length(toCam), 0.05);
  vec3 vcam = toCam / dist;
  vec3 side = cross(vdir, vcam);
  float sl = length(side);
  side = sl > 1e-4 ? side / sl : vec3(1.0, 0.0, 0.0);

  // very near drops sit inside the lens's circle of confusion: wider and softer
  float defocus = smoothstep(4.2, 1.5, d);

  // Analytic line AA — the same trick hairBuildVert uses, and for the same
  // reason. uPxWidth is 1.3 DEVICE px, and the fragment's gaussian core keeps
  // only the middle ~60 % of the quad, so a mid-distance streak was covering
  // roughly 0.8 px of an unmultisampled target: pixel centres fell inside and
  // outside it alternately along the length and every streak rasterised as a
  // dotted chain. That stipple — not the condensation beads, which were the
  // obvious suspect — is what made the rain read as beaded thread at 100 % and
  // as knitted cloth once the population was dense. Floor the half width at
  // one device pixel (so the core spans a full 2 px and every centre on the
  // line is covered) and pay the widening back as COVERAGE, which turns
  // further thinning into transparency instead of aliasing. Energy per streak
  // is unchanged; only its distribution stops beating against the pixel grid.
  float halfPx = uPxWidth * 0.5 * (1.0 + defocus * 2.9);
  float thin = min(1.0, halfPx / 1.0);
  halfPx = max(halfPx, 1.0);
  float halfW = dist * uPxPerWorld * halfPx;

  vec3 wp = p + vdir * (position.y * lenW) + side * (position.x * halfW * 2.0);

  vUv = vec2(position.x + 0.5, 0.5 - position.y); // y: 0 = head, 1 = tail
  vBlur = defocus;

  // ---- how much light this drop is standing in -----------------------------
  // Steep inverse-square, real cone angles. This is the single control that
  // decides whether the rain is weather inside the room or a texture over it:
  // slacken it and every drop in the volume lights up at once.
  float kl = rnSpot(p, uKeyPos, uKeyAxis, uKeyCone, 0.115) * uKeyGain;
  float rl = rnSpot(p, uRimPos, uRimAxis, uRimCone, 0.070) * uRimGain;
  vTint = uBaseCol + uKeyCol * kl + uRimCol * rl;

  // Distance does two separate things. Beyond ~20 units a drop is a mist mote,
  // not a streak, so it keeps only a third of its energy; and inside the circle
  // of confusion the same energy is smeared over a much wider quad.
  // Most of the population lives out here — the depth distribution is uniform
  // per OCTAVE, so the far half is the numerous half. It has to fall back hard
  // or the high tier's extra drops arrive as a second curtain laid over the
  // first instead of as the fine mist behind it.
  // uFarFade is aspect-tuned by the module: (19, 4.5) in landscape, pulled in
  // to ~(14, 3) on portrait phones where the same population over a quarter of
  // the pixels stacks the distant octaves into cloth instead of mist.
  float far = smoothstep(uFar, uFar * 0.30, d) * (0.15 + 0.85 * smoothstep(uFarFade.x, uFarFade.y, d));
  vFade = uIntensity * (0.30 + 0.70 * aRnd.z) * far * (1.0 - defocus * 0.62) * thin;

  vec4 clip = projectionMatrix * viewMatrix * vec4(wp, 1.0);
  gl_Position = clip;

  // Rain is a highlight, and a highlight vanishes against a highlight. Sample
  // last frame's composite and pull the streak back where the frame is already
  // bright — this is what stops the rain reading as an overlay.
  //
  // Done PER VERTEX, not per fragment. Per fragment it is a dependent fetch
  // into the 25 MB framebuffer grab, with a different address for every streak,
  // which is about the worst texture access pattern available — and it made the
  // suppression vary ALONG each streak, so streaks crossing the light pool came
  // out dashed. A drop is either standing in a bright part of the frame or it
  // is not; that is a per-drop fact, and four fetches beat two hundred.
  if (uSceneAmt > 0.5) {
    vec2 suv = clamp(clip.xy / max(clip.w, 1e-4) * 0.5 + 0.5, 0.0, 1.0);
    // RN_DEC, not rnToLinear. post always renders the scene into a LINEAR
    // RGBA16F target and calls setSourceEncoding('linear'), which sets
    // RN_SOURCE_LINEAR on THIS material too — squaring an already-linear grab
    // turned a luma of 0.20 into 0.04 and left the suppression effectively off
    // in the only configuration that ships.
    float lum = rnLuma(RN_DEC(rnTexLod(uScene, suv).rgb));
    // 0.55, not 0.42: with the decode finally correct the term actually fires,
    // and at 0.42 the key-light pool went visibly dry of rain — a hole in the
    // weather exactly where the eye is. Enough to stop the overlay reading, not
    // enough to clear the shaft.
    vFade *= mix(1.0, 0.55, smoothstep(0.02, 0.55, lum));
  }
}
`,Te=`
precision highp float;

varying vec2  vUv;
varying vec3  vTint;
varying float vFade;
varying float vBlur;

void main() {
  // across: a soft core, widened when the drop is inside the circle of confusion
  float x = vUv.x * 2.0 - 1.0;
  float core = exp(-x * x * mix(3.6, 1.15, vBlur));

  // along: bright at the head, fading to nothing at the tail
  float y = vUv.y;
  float along = smoothstep(0.0, 0.05, y) * smoothstep(1.0, 0.58, y);
  along *= 0.38 + 0.62 * exp(-y * y * 6.5);

  // No discard: it costs early-Z on a tile renderer and buys nothing on an
  // additive pass, where a zero contribution is already free at the blender.
  float a = core * along * vFade;

  gl_FragColor = vec4(vTint * a, 1.0);

  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
`;function Re(o,e,a){const t=new ue;t.setAttribute("position",new he(new Float32Array([-.5,-.5,0,.5,-.5,0,.5,.5,0,-.5,.5,0]),3)),t.setIndex([0,1,2,0,2,3]),t.boundingSphere=new ce(new y,1e6);const s={uCamPos:{value:new y},uCamRight:{value:new y(1,0,0)},uCamUp:{value:new y(0,1,0)},uCamFwd:{value:new y(0,0,-1)},uTanHalfFov:{value:.344},uAspect:{value:1.6},uTime:{value:0},uNear:{value:1.6},uFar:{value:34},uWind:{value:new S(.14,.05)},uFall:{value:7.4},uLen:{value:.32},uPxWidth:{value:1.3},uPxPerWorld:{value:4e-4},uIntensity:{value:1},uFarFade:{value:new S(19,4.5)},uKeyPos:{value:new y(-2.6,4.6,1.2)},uKeyAxis:{value:new y(0,-1,0)},uKeyCone:{value:new S(.92,.999)},uKeyCol:{value:e.keyWarm.clone().multiplyScalar(1)},uKeyGain:{value:2.35},uRimPos:{value:new y(3.55,4.35,-6.1)},uRimAxis:{value:new y(0,-1,0)},uRimCone:{value:new S(.83,.999)},uRimCol:{value:e.rimCool.clone()},uRimGain:{value:3.35},uBaseCol:{value:e.rimCool.clone().multiplyScalar(.009)},uScene:{value:a},uInvRes:{value:new S(1/1600,1/1e3)},uSceneAmt:{value:0}},i=new H({uniforms:s,vertexShader:Se,fragmentShader:Te,transparent:!0,blending:de,depthTest:!0,depthWrite:!1,side:ae,fog:!1}),r=new G(t,i);r.name="rain:streaks",r.frustumCulled=!1,r.renderOrder=20;let n=0,l=0;const d=c=>{l=c;const p=new Float32Array(c*4),g=new Float32Array(c*4);let m=49734321;const u=()=>(m=Math.imul(m,1664525)+1013904223>>>0,m/4294967296),b=new Int32Array(c);for(let h=0;h<c;h++)b[h]=h;for(let h=c-1;h>0;h--){const f=u()*(h+1)|0,R=b[h];b[h]=b[f],b[f]=R}for(let h=0;h<c;h++){const f=h*4;p[f]=u()*2-1,p[f+1]=u(),p[f+2]=(b[h]+u())/c,p[f+3]=u(),g[f]=u(),g[f+1]=u()*2-1,g[f+2]=u(),g[f+3]=u()}t.deleteAttribute("aCell"),t.deleteAttribute("aRnd"),t.setAttribute("aCell",new $(p,4)),t.setAttribute("aRnd",new $(g,4))},x=c=>{c>l&&d(c),c!==n&&(n=c,t.instanceCount=c)},_=o.quality.tier;return d(Math.max(64,_==="high"?6500:_==="medium"?3200:o.quality.rainDrops|0)),x(Math.max(64,Math.min(l,o.quality.rainDrops|0))),{mesh:r,uniforms:s,setCount:x,get count(){return n},dispose(){t.dispose(),i.dispose()}}}const Ae=`
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`,ke=`
precision highp float;

#ifndef NTAP
#define NTAP 9
#endif

uniform sampler2D uPrev;
uniform sampler2D uGrain;
uniform sampler2D uDirt;
uniform vec2  uTexel;
uniform float uAspect;
uniform float uTime;
uniform float uDt;
uniform float uSpawn;
uniform float uFlow;
uniform float uShear;
uniform float uDry;
uniform float uEvap;
uniform float uRefog;
uniform float uBead;
uniform vec4  uWipe;     // current.xy, previous.xy in uv
uniform float uWipeAmt;
uniform float uWipeR;
uniform vec4  uSubject;  // uv centre xy, 1/radius² (aspect-corrected), strength

varying vec2 vUv;

${q}

const float H_REF = 1.0;
const float H_MOB = 0.50;

/**
 * Slide speed in texels per second. Only heavy water moves at all.
 *
 * The ramp is deliberately WIDE. A steep one means the middle of a droplet is
 * at full speed while its own edge is still parked, and that shear tears the
 * trailing edge into fingers and notches every frame — real as a physical
 * instability, unmistakably broken at this scale.
 */
float rnSpeed(float h) {
  float m = smoothstep(H_MOB * 0.72, H_MOB * 2.40, h);
  return uFlow * m * (0.45 + 0.55 * min(h / (H_MOB * 3.0), 1.0));
}

/**
 * One scale of droplet seeding. Cells are square in SCREEN space (the y count
 * is divided by the aspect), so a blob is round, not an ellipse.
 * Only the nearest 2x2 cells are visited: blob centres are confined to the
 * middle of their cell and radii to under half a cell, so nothing can reach
 * further than that.
 */
float rnSeed(vec2 uv, float n, float rad, float mass, float live, float idOff) {
  vec2 cells = vec2(n, max(2.0, floor(n / uAspect)));
  vec2 g = uv * cells;
  vec2 base = floor(g - 0.5);
  float acc = 0.0;
  for (int j = 0; j < 2; j++) {
    for (int i = 0; i < 2; i++) {
      vec2 id = base + vec2(float(i), float(j));
      vec4 h = rnHash42(id + idOff);
      // Most cells are simply empty. Without this the grid saturates and the
      // pane reads as a windscreen instead of a window.
      if (h.y > live) continue;
      // the centre re-rolls every few seconds so a cell never wears a groove
      float per = 7.0 + 11.0 * h.x;
      float gen = floor(uTime / per + h.y * 7.0);
      vec2 jit = rnHash22(id * 1.37 + gen * 31.7 + idOff) - 0.5;
      vec2 c = id + 0.5 + jit * 0.62;
      float r = rad * (0.52 + 0.80 * h.z);
      // slightly taller than wide: a drop clinging to a vertical pane is pulled
      // by gravity long before it is heavy enough to let go
      vec2 dd = (g - c) * vec2(1.0, 0.86);
      float q2 = dot(dd, dd) / (r * r);
      if (q2 < 1.0) {
        float prof = 1.0 - q2;
        prof *= prof;
        // each cell breathes on its own clock so they never pulse in lockstep
        float br = smoothstep(0.15, 0.85, 0.5 + 0.5 * sin(uTime * (0.07 + 0.17 * h.w) + h.x * 41.0));
        acc += mass * prof * br * (0.35 + 0.65 * h.z);
      }
    }
  }
  return acc;
}

void main() {
  vec4 prev = texture2D(uPrev, vUv);
  // Where the pane likes to hold water. Two scales, and the LOW one matters
  // most: an evenly seeded pane reads as polka dots. Real glass is wet in
  // patches and clear in others, and that clustering is most of what sells it.
  // uDirt is the tex-water plate when it loaded and a flat tile when it did
  // not, so it only ever adds character.
  float cluster = texture2D(uGrain, vUv * vec2(0.55 * uAspect, 0.55) + 0.19).a;
  cluster = 0.32 + 1.30 * cluster * cluster;
  float grain = (0.45 + 0.75 * texture2D(uGrain, vUv * vec2(1.9 * uAspect, 1.9)).r)
              * (0.62 + 0.95 * texture2D(uDirt, vUv * vec2(1.15 * uAspect, 1.15)).r)
              * cluster;

  // ---- flow direction ------------------------------------------------------
  // A low-frequency wander field: a whole droplet must agree on which way it is
  // drifting, or the gather tears it in half.
  float wob = texture2D(uGrain, vUv * vec2(1.1 * uAspect, 1.1) + vec2(0.0, uTime * 0.0045)).g - 0.5;
  vec2 up = normalize(vec2(-uShear + wob * 0.42, 1.0));

  // ---- mass-conserving gather ---------------------------------------------
  float h = 0.0;
  for (int i = 0; i <= NTAP; i++) {
    vec2 suv = vUv + up * uTexel * float(i);
    vec4 s = texture2D(uPrev, suv);
    float sp = min(rnSpeed(s.r) * uDt, float(NTAP));
    float w = max(0.0, 1.0 - abs(sp - float(i)));
    h += s.r * w;
  }

  // A whisper of isotropic diffusion. Two HALF-texel diagonal taps: bilinear
  // makes each one the mean of its 2x2 neighbourhood, so a symmetric pair is a
  // full 3x3 smoother for two fetches. Its job is to eat the texel-scale seed
  // that the surface-tension term would otherwise amplify into a standing
  // pattern inside every large droplet.
  float sm = 0.5 * (texture2D(uPrev, vUv + uTexel * 0.5).r
                  + texture2D(uPrev, vUv - uTexel * 0.5).r);
  h = mix(h, sm, 0.17);

  // ---- seeding -------------------------------------------------------------
  // Gated by what is already here: a cell feeds its droplet only until it is
  // heavy enough to leave.
  // The gate has to close ABOVE the mobility threshold, not at it. Close it at
  // H_MOB and the droplet parks exactly there, where evaporation slightly
  // exceeds the surface-tension gain, and it sits and quietly shrinks instead
  // of ever letting go. Feeding well past the threshold is what makes a drop
  // swell, break loose, and run.
  float gate = 1.0 - smoothstep(H_MOB * 1.35, H_MOB * 2.30, h);
  // Masses are near-equal on purpose. They look like they should scale with
  // cell size, but the mobility threshold is an absolute HEIGHT: give the small
  // scales a small mass and they equilibrate below it, never bead up, and the
  // pane ends up with three cell grids' worth of invisible damp and one or two
  // visible drops. Size variety comes from the cell size and radius, not mass.
  float feed = rnSeed(vUv, 13.0, 0.30, 1.70, 0.30, 0.0)
             + rnSeed(vUv, 28.0, 0.28, 1.30, 0.30, 17.3)
             + rnSeed(vUv, 58.0, 0.26, 0.90, 0.22, 91.7);
  // drier toward the top of the pane; sliding water then pools the lower third
  float band = 0.42 + 0.58 * smoothstep(0.92, 0.10, vUv.y);
  h += feed * uSpawn * grain * band * gate * uDt;

  // ---- losses --------------------------------------------------------------
  float sp = rnSpeed(h);
  h *= 1.0 - min(0.45, sp * uDt * 0.030);        // sliding water sheds a film
  h *= exp(-uEvap * uDt);

  // ---- surface tension: S-curve, fixed point at the threshold -------------
  // Bounded at both ends — the (1 - a) factor takes the gain to zero at full
  // height. Keep the coefficient modest: this term amplifies whatever is above
  // the threshold, texel-scale noise included, and pushed too hard it turns
  // into a growth instability that speckles the inside of every large droplet
  // with a cauliflower pattern.
  float a = h / H_REF;
  a += uBead * uDt * 60.0 * a * (a - H_MOB) * (1.0 - min(a, 1.0));
  h = clamp(a, 0.0, 1.6) * H_REF;

  // a dry lip at the very top: clamp-to-edge sampling above the frame would
  // otherwise replicate whatever sits in the top row down the whole buffer
  h *= smoothstep(0.0, 2.5 * uTexel.y, 1.0 - vUv.y);

  // ---- pointer wipe: a capsule between last frame's pointer and this one ---
  vec2 A = vec2(uWipe.z * uAspect, uWipe.w);
  vec2 B = vec2(uWipe.x * uAspect, uWipe.y);
  vec2 P = vec2(vUv.x * uAspect, vUv.y);
  vec2 ab = B - A;
  float t = clamp(dot(P - A, ab) / max(dot(ab, ab), 1e-6), 0.0, 1.0);
  float wd = 1.0 - smoothstep(0.10 * uWipeR, uWipeR, distance(P, A + ab * t));
  float wipe = wd * wd * uWipeAmt;   // squared: a soft-edged hand, not a stencil

  h *= 1.0 - wipe * 0.88;

  // ---- trail ---------------------------------------------------------------
  // Thresholded so only the core writes a trail — a real trail is narrower than
  // the head that made it. Written from BOTH the old height and the freshly
  // advected one: a fast droplet crosses several texels per frame, and marking
  // only where it was leaves a dotted line instead of a wet streak.
  // A third tap at the MIDPOINT of the hop closes the remaining gap: at low sim
  // resolutions a droplet core is 1–2 texels wide and a 3-texel hop leaves a
  // chain of discrete beads — the midpoint upstream sample bridges them into a
  // continuous streak at any resolution.
  vec4 midT = texture2D(uPrev, vUv + up * uTexel * (rnSpeed(h) * uDt * 0.5));
  float trail = max(max(smoothstep(H_MOB * 0.80, H_MOB * 1.75, prev.r),
                        smoothstep(H_MOB * 0.80, H_MOB * 1.75, midT.r)),
                    smoothstep(H_MOB * 0.55, H_MOB * 1.30, h));
  float w = max(prev.g * exp(-uDry * uDt), trail);
  w *= 1.0 - wipe * 0.70;

  // ---- condensation --------------------------------------------------------
  // Regrowth is gated AWAY from the subject: condensation blooming across the
  // hair mass carries the bead layer with it and stipples the hero — the pane
  // stays clearest exactly where the eye is parked.
  vec2 sd = (vUv - uSubject.xy) * vec2(uAspect, 1.0);
  float subj = uSubject.w * exp(-dot(sd, sd) * uSubject.z);
  float f = prev.b;
  f += (1.0 - f) * uRefog * uDt * (1.0 - 0.85 * subj);
  f -= min(f, (smoothstep(0.03, 0.26, h) * 2.4 + w * 1.1) * uDt);
  f -= wipe;
  f = clamp(f, 0.0, 1.0);

  gl_FragColor = vec4(h, clamp(w, 0.0, 1.0), f, clamp(sp / max(uFlow, 1e-3), 0.0, 1.0));
}
`,Me=`
void main() { gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
`,De=`
precision highp float;

uniform sampler2D uScene;
uniform sampler2D uState;
uniform sampler2D uGrain;
uniform vec2  uInvRes;
uniform vec2  uStateTexel;
uniform float uAspect;
uniform float uRefract;
uniform float uBeadRefract;
uniform float uDisp;
uniform float uSlope;
uniform float uTrailH;
uniform float uBeadN;
uniform float uBeadAmt;
uniform float uFogAmt;
uniform float uFogBlur;
uniform vec3  uFogTint;
uniform vec2  uKeyScreen;
uniform vec2  uRimScreen;
uniform vec3  uKeyCol;
uniform vec3  uRimCol;
uniform float uSpecK;
uniform float uSpecR;
uniform float uSpecPow;
uniform float uSheen;
uniform float uFresnel;
uniform float uWet;
uniform float uMistAmt;
uniform float uMistTime;
uniform vec3  uMistA;
uniform vec3  uMistB;
uniform vec4  uSubject;  // uv centre xy, 1/radius² (aspect-corrected), strength

${q}
${re}
${ne}

/** Spherical cap from a blobby height field — near-vertical slope at the rim. */
float rnDome(float h) {
  float a = clamp(h * 1.35, 0.0, 1.0);
  float b = 1.0 - a;
  return sqrt(max(1e-6, 1.0 - b * b));
}

/**
 * Only the droplets have height.
 *
 * A wet trail modelled as a raised plateau refracts at its edges and nowhere
 * else, so it renders as a wandering OUTLINE — a contour drawing of where the
 * drop went, unmistakably a shader artefact, and the long lens reach below
 * amplifies it into something you cannot miss. What a real trail does is strip
 * the condensation off the pane: it reads as a CLEAR streak through the fog.
 * That already happens in the simulation's F channel and needs no height.
 */
float rnHeight(vec2 uv) {
  return rnDome(texture2D(uState, uv).r);
}

void main() {
  vec2 uv = gl_FragCoord.xy * uInvRes;
  vec4 st = texture2D(uState, uv);

  // ---- gradient of the simulated field ------------------------------------
  // A DIAGONAL stencil, not an axis-aligned one. Bilinear interpolation makes
  // the height field piecewise linear, so a straight central difference returns
  // a piecewise-CONSTANT gradient and the droplets render as axis-aligned
  // facets — a visible staircase that gives away the buffer resolution. The
  // four diagonal taps average across both axes and the kinks disappear.
  vec2 e = uStateTexel * 1.4;
  float hpp = rnHeight(uv + e);
  float hpm = rnHeight(uv + vec2(e.x, -e.y));
  float hmp = rnHeight(uv + vec2(-e.x, e.y));
  float hmm = rnHeight(uv - e);
  vec2 grad = vec2((hpp + hpm) - (hmp + hmm), (hpp + hmp) - (hpm + hmm)) * (0.25 * uSlope);

  // ---- analytic condensation beads ----------------------------------------
  // Closed-form gradient of a hemisphere, so these stay pin-sharp at any
  // resolution while the simulation buffer stays small and cheap.
  //
  // Three things stop it reading as the grid it actually is, and all three are
  // required: a smooth warp of the sample space so the lattice is not axis
  // aligned, a hash gate that leaves most cells EMPTY, and enough jitter that a
  // bead can sit anywhere in its cell — which in turn is why the 2x2
  // neighbourhood has to be visited rather than just the cell underfoot.
  float fog = st.b * uFogAmt;
  float dry = (1.0 - smoothstep(0.02, 0.22, st.r)) * (1.0 - st.g * 0.85);
  // The subject mask: beads over the hair mass convert continuous strands into
  // strings of refracted dots — a global stipple that reads as compression
  // noise in stills. The sim already slows refog there; this gate removes what
  // condensation remains from the bead layer entirely, with a soft falloff.
  vec2 sdv = (uv - uSubject.xy) * vec2(uAspect, 1.0);
  float subjGate = 1.0 - uSubject.w * exp(-dot(sdv, sdv) * uSubject.z);
  // Belt to the disc's braces: gate by what is ACTUALLY behind this texel, not
  // only by where the subject is supposed to be. Anywhere the scene carries
  // lit detail (strands, filaments, the light pool) a bead field dices it into
  // dots; over true dark a bead is invisible anyway, so the beads are kept to
  // the DIM band in between — which is exactly where condensation reads.
  //
  // DILATED over one bead cell, not point-sampled. A rain streak is ~1.3
  // device px wide and a bead is ~18: a point probe lands in the black BETWEEN
  // streaks, passes the gate, and the bead that grows there then refracts the
  // streaks crossing its rim into a dotted chain — the "beaded chain / knit"
  // read on the rain, and the single loudest craft failure at 100 %. Taking
  // the max over the bead's own footprint means one lit filament anywhere
  // under a bead is enough to keep that bead off. Four taps, and they buy back
  // most of their own cost by emptying the inner 2x2 loop over the whole
  // rain-lit half of the frame.
  // half a bead cell, in uv (the bead grid is uv * vec2(uAspect, 1) * uBeadN)
  vec2 lstep = vec2(0.5 / max(uBeadN * uAspect, 1.0), 0.5 / max(uBeadN, 1.0));
  float subjLum = rnLuma(RN_DEC(texture2D(uScene, uv).rgb));
  subjLum = max(subjLum, rnLuma(RN_DEC(texture2D(uScene, uv + vec2(lstep.x, 0.0)).rgb)));
  subjLum = max(subjLum, rnLuma(RN_DEC(texture2D(uScene, uv - vec2(lstep.x, 0.0)).rgb)));
  subjLum = max(subjLum, rnLuma(RN_DEC(texture2D(uScene, uv + vec2(0.0, lstep.y)).rgb)));
  subjLum = max(subjLum, rnLuma(RN_DEC(texture2D(uScene, uv - vec2(0.0, lstep.y)).rgb)));
  subjGate *= 1.0 - smoothstep(0.020, 0.13, subjLum);
  vec2 bgrad = vec2(0.0);
  float bdome = 0.0;
  float beadMask = 0.0;
  if (fog * dry * subjGate > 0.004) {
    vec2 bguv = uv * vec2(uAspect, 1.0) * uBeadN;
    bguv += vec2(sin(bguv.y * 0.37) + sin(bguv.y * 0.113 + 1.7) * 2.2,
                 cos(bguv.x * 0.29) + cos(bguv.x * 0.091 - 0.6) * 2.4) * 0.9;
    vec2 bbase = floor(bguv - 0.5);
    for (int j = 0; j < 2; j++) {
      for (int i = 0; i < 2; i++) {
        vec2 bid = bbase + vec2(float(i), float(j));
        vec4 bh = rnHash42(bid + 3.17);
        // 80% of cells stay empty: at higher occupancy the beads stop reading
        // as condensation and start reading as a screen-door over the frame
        if (bh.w < 0.80) continue;
        vec2 bd = bguv - (bid + 0.5 + (bh.xy - 0.5) * 0.60);
        float br = 0.09 + 0.15 * bh.z * bh.z;
        float q2 = dot(bd, bd) / (br * br);
        if (q2 >= 1.0) continue;
        float dome = sqrt(1.0 - q2);
        // taper to zero at the rim — clipping at q2 = 1 draws a hard ring, which
        // is what makes a bead field read as soap bubbles
        float m = fog * dry * subjGate * smoothstep(1.0, 0.45, q2);
        bgrad += -bd / (br * max(dome, 0.35)) * (uBeadAmt * m);
        bdome = max(bdome, dome);
        beadMask = max(beadMask, m);
      }
    }
  }

  // Shading normal: everything, combined.
  vec3 n = normalize(vec3(-(grad + bgrad), 1.0));

  // ---- refraction ----------------------------------------------------------
  // MINUS the gradient, and with a LONG reach on the simulated droplets. A
  // droplet is a ball lens: it does not nudge what is behind it, it gathers a
  // whole hemisphere and shows it inverted and minified. Against a near-black
  // salon that gather is the ONLY reason a drop is visible at all — a short
  // offset just samples more black and the drop reads as a dark smudge.
  // The condensation beads get their own, much shorter reach; at this length
  // their steep little gradients would fling the sample across the frame.
  // Reach scales with local DEPTH. Refraction is proportional to how much water
  // the ray crosses, so a millimetre of film bends almost nothing while a bead
  // bends everything — and that is also exactly what stops the long reach from
  // turning every faint gradient in the buffer into a visible filament.
  float lens = smoothstep(0.015, 0.16, st.r);
  vec2 nd = normalize(vec3(-grad, 1.0)).xy;
  vec2 nb = normalize(vec3(-bgrad, 1.0)).xy;
  vec2 duvDrop = nd * (uRefract * lens * (0.72 + 0.28 * uWet)) * uInvRes;

  // ---- and BOUNDED BY THE DROP ITSELF -------------------------------------
  // A ball lens gathers from a disc the size of the lens. It does not reach a
  // fixed fraction of the frame — and that is precisely what the reach used to
  // do: 130 device px, ~4% of the frame width, never checked against the drop's
  // own projected radius. Combined with the spherical cap normal, whose slope
  // goes near-vertical at the rim, the gather folded the background several
  // times inside a single drop and every droplet rendered as a set of nested
  // hollow contour rings with visible banding — the same "screen-space normal
  // pushed past its own feature" failure the uBeadRefract note names below. The
  // bead layer was capped from the start; this layer was not.
  //
  // The luminance probe underneath is NOT a cap. It only pulls the reach in
  // over a DARK backdrop, so over the volumetric shaft and the gallery plates
  // it ran at full length — which is exactly where the artefact was loudest.
  //
  // Express the bound in the only unit that tracks the drop: sim texels. The
  // droplet's height blob is a few texels across, so its projected radius is
  // ~2–7 texels of device pixels depending on how big it has grown, and the
  // lens term (which rides st.r) is already the size signal. This also makes
  // the reach PROPORTIONAL to radius wherever it binds, which is the correct
  // behaviour, not a degradation of it.
  float texPx = uStateTexel.x / max(uInvRes.x, 1e-9);   // device px per sim texel
  float capPx = texPx * (2.0 + 5.0 * lens);
  duvDrop *= min(1.0, capPx / max(length(duvDrop / uInvRes), 1e-4));

  // The long reach is only honest when there is something bright to gather. A
  // full-reach gather into a near-black backdrop shows mud — and worse, it
  // folds the surrounding strands RADIALLY around the drop centre, which
  // renders as a kaleidoscope whorl parked in the hero. Probe the far sample
  // first and pull the reach in wherever the gathered scene is dark; the drop
  // then reads as edge + catchlight, which is what a drop on a dark pane is.
  if (lens > 0.002) {
    float probe = rnLuma(RN_DEC(texture2D(uScene, uv + duvDrop).rgb));
    duvDrop *= mix(0.28, 1.0, smoothstep(0.010, 0.10, probe));
  }
  vec2 duv = duvDrop + nb * uBeadRefract * uInvRes;
  float blur = uFogBlur * fog;
  // TWO taps, not three. The scene texture is the full drawing buffer — by far
  // the most expensive fetch on the page — and a two-tap split still gives real
  // dispersion (red off one side, blue off the other, green the mean) plus a
  // usable blur kernel for the condensation. Both collapse to the same texel
  // when there is no water, so dry glass is a bit-exact passthrough.
  vec2 b0 = vec2(0.866, 0.500) * blur * uInvRes;
  vec2 b1 = vec2(-0.866, -0.500) * blur * uInvRes;

  // Dispersion rides the same luma probe as the reach: a dark gather has
  // nothing to split, and the paired orange/cyan dots it produced at droplet
  // rims against the near-black salon read as insects on the pane. The fringe
  // separation is also capped at ~1.5 device px so it can never resolve as two
  // distinct dots — at most a soft chromatic edge.
  float disp = uDisp;
  if (lens > 0.002) {
    float probeD = rnLuma(RN_DEC(texture2D(uScene, uv + duv).rgb));
    disp *= smoothstep(0.010, 0.10, probeD);
    float sepPx = 2.0 * disp * length(duv / uInvRes);
    disp *= min(1.0, 1.5 / max(sepPx, 1e-4));
  }
  vec3 t0 = RN_DEC(texture2D(uScene, uv + duv * (1.0 + disp) + b0).rgb);
  vec3 t1 = RN_DEC(texture2D(uScene, uv + duv * (1.0 - disp) + b1).rgb);

  vec3 col = vec3(t0.r, (t0.g + t1.g) * 0.5, t1.b);
  col = mix(col, (t0 + t1) * 0.5, clamp(fog * 2.2, 0.0, 0.7));

  // ---- condensation veil ---------------------------------------------------
  // Deliberately readable: the fog is the canvas that the sliding drops and the
  // pointer WIPE, and a veil you cannot see is a wipe you cannot see either.
  // Weighted toward BLUR and desaturation, not toward a lift. Lift too much and
  // wiping the pane reads as smearing it darker instead of clearing it.
  col = mix(col, mix(vec3(rnLuma(col)), uFogTint, 0.40), fog * 0.34);
  col += uFogTint * (fog * 0.013) * (0.5 + 3.0 * rnLuma(col));

  // ---- the water itself ----------------------------------------------------
  float body = smoothstep(0.05, 0.34, st.r);
  float film = smoothstep(0.02, 0.85, st.g);
  float wet = clamp(body + beadMask * bdome * 0.80 + film * 0.30, 0.0, 1.0);

  // Everything below is water shading, and the overwhelming majority of the
  // pane has no water on it. Four pow()s and a normalize are worth branching
  // around: droplets are spatially clustered, so a dry warp is genuinely dry.
  if (wet > 0.003) {
    col *= mix(1.0, 0.94, body);                   // a little absorption

    vec3 V = vec3(0.0, 0.0, 1.0);
    vec2 sp = (uv * 2.0 - 1.0) * vec2(uAspect, 1.0);
    vec3 Lk = normalize(vec3(uKeyScreen * vec2(uAspect, 1.0) - sp, 1.35));
    vec3 Lr = normalize(vec3(uRimScreen * vec2(uAspect, 1.0) - sp, 1.35));
    float dk = max(dot(n, normalize(Lk + V)), 0.0);
    float dr = max(dot(n, normalize(Lr + V)), 0.0);
    // two lobes per fixture: a tight catchlight and a broad wet sheen. One lobe
    // alone gives either a hard dot or a plastic gloss; water has both.
    float sk = pow(dk, uSpecPow) + uSheen * pow(dk, 6.0);
    float sr = pow(dr, uSpecPow * 0.65) + uSheen * pow(dr, 5.0);
    col += (uKeyCol * (sk * uSpecK) + uRimCol * (sr * uSpecR)) * wet;

    // grazing rim — a drop against a dark room is mostly edge
    float fres = pow(1.0 - n.z, 2.2);
    col += uRimCol * (fres * uFresnel * wet);

    // The trail, rendered as a MATERIAL change rather than as geometry: wetted
    // glass is glossier and a shade denser than dry glass. No height, so no
    // outline; it reads as the tail because it is also the streak the drop has
    // just wiped clear of condensation. FULLY luminance-driven — gloss on glass
    // is invisible without something to reflect, and any constant floor paints
    // flat pale-grey smudges over the black that read as a dirty screen.
    // GATED AT BOTH ENDS. The luminance drive alone (with its ceiling of 2.0)
    // put a constant 0.032*2.0 of rimCool on every trail texel over anything
    // bright — and because the trails are near-vertical, the whole lit band
    // came out as regular vertical corduroy ribbing: brushed metal, not water.
    // Against a hot backdrop a reflection is swamped and should contribute
    // nothing; the mid-tones are where wet glass actually out-glosses dry.
    float trailL = rnLuma(col);
    col += uRimCol * (film * uTrailH) * min(trailL * 3.0, 2.0)
         * (1.0 - smoothstep(0.25, 0.60, trailL));
    col *= 1.0 - film * 0.035;
  }

  // ---- LAYER 3: wet air, folded in here ------------------------------------
  // It lives inside the pane's shader rather than in its own fullscreen quad
  // purely for cost: this is already a full-frame pass, and a second one over
  // six million pixels to add a veil this faint is the most expensive cheap
  // thing on the page. Drawn over the water instead of under it — at this
  // amplitude nothing in the frame can tell.
  {
    vec2 q = vec2(uv.x * uAspect, uv.y);
    float n1 = texture2D(uGrain, q * 0.62 + vec2(uMistTime * 0.0090, -uMistTime * 0.0035)).r;
    float n2 = texture2D(uGrain, q * 1.55 + vec2(-uMistTime * 0.0145, uMistTime * 0.0062) + 0.37).a;
    float m = smoothstep(0.34, 0.92, 0.60 * n1 + 0.40 * n2);
    float gr = smoothstep(0.40, -0.04, uv.y);
    gr *= gr * gr;
    float a = (gr + smoothstep(0.11, -0.03, uv.y) * 0.75) * m * uMistAmt;
    a *= smoothstep(0.0, 0.10, uv.x) * smoothstep(1.0, 0.90, uv.x);
    col += mix(uMistA, uMistB, m) * a;

    // the pane is not optically perfect — a whisper of dirt, riding the mist's
    // first fetch rather than paying for a full-resolution tap of its own
    col *= 1.0 - (n1 - 0.5) * 0.030;
  }

  // dither: this is a very shallow signal over a near-black frame, which is
  // precisely what 8-bit posterises worst
  col += (rnIgn(gl_FragCoord.xy * 1.37) - 0.5) * (1.3 / 255.0);

  // The grab is copied in onBeforeRender, i.e. immediately before this draw, so
  // it is always this frame's salon — never a stale or uninitialised one.
  gl_FragColor = vec4(RN_ENC(col), 1.0);
}
`;function Ce(o){return Math.max(448,Math.min(896,Math.round((o.fluidRes||192)*3)))}function J(o){return o.tier==="high"?9:o.tier==="medium"?7:5}function Le(o,e,a,t){const s={depthBuffer:!1,stencilBuffer:!1,type:ie,format:se,minFilter:E,magFilter:E,wrapS:z,wrapT:z,generateMipmaps:!1},i=new Z(4,4,s),r=new Z(4,4,s);i.texture.colorSpace=N,r.texture.colorSpace=N;const n={uPrev:{value:i.texture},uGrain:{value:a},uDirt:{value:t||a},uTexel:{value:new S(1/512,1/320)},uAspect:{value:1.6},uTime:{value:0},uDt:{value:1/60},uSpawn:{value:.36},uFlow:{value:210},uShear:{value:.05},uDry:{value:.32},uEvap:{value:.03},uRefog:{value:.045},uBead:{value:.017},uWipe:{value:new I(2,2,2,2)},uWipeAmt:{value:0},uWipeR:{value:.105},uSubject:{value:new I(.5,.5,4,0)}},l=new X(2,2),d=new H({uniforms:n,vertexShader:Ae,fragmentShader:ke,defines:{NTAP:J(o.quality)},depthTest:!1,depthWrite:!1,toneMapped:!1}),x=new pe,_=new G(l,d);_.frustumCulled=!1,x.add(_);const c={uScene:{value:null},uState:{value:r.texture},uGrain:{value:a},uInvRes:{value:new S(1/1600,1/1e3)},uStateTexel:{value:new S(1/512,1/320)},uAspect:{value:1.6},uRefract:{value:70},uBeadRefract:{value:1.2},uDisp:{value:.045},uSlope:{value:5.2},uTrailH:{value:.02},uBeadN:{value:110},uBeadAmt:{value:.12},uFogAmt:{value:.46},uFogBlur:{value:7.5},uFogTint:{value:e.rimCool.clone().multiplyScalar(.55)},uKeyScreen:{value:new S(-.35,.55)},uRimScreen:{value:new S(.45,.6)},uKeyCol:{value:e.keyWarm.clone()},uRimCol:{value:e.rimCool.clone()},uSpecK:{value:.92},uSpecR:{value:.55},uSpecPow:{value:150},uSheen:{value:.016},uFresnel:{value:.16},uWet:{value:0},uMistAmt:{value:.05},uMistTime:{value:0},uMistA:{value:e.rimCool.clone().multiplyScalar(.55)},uMistB:{value:e.harbour.clone().lerp(e.bone,.3)},uSubject:{value:new I(.5,.5,4,0)}},p=new X(2,2),g=new H({uniforms:c,vertexShader:Me,fragmentShader:De,transparent:!0,blending:fe,depthTest:!1,depthWrite:!1,side:ae,toneMapped:!1,fog:!1}),m=new G(p,g);m.name="rain:glass",m.frustumCulled=!1,m.renderOrder=9990,m.position.z=-.6;let u=null,b=oe,h=r,f=i,R=4,U=4,j=!1,K=!0,V=0,Q=0;const B=(v,w)=>{const T=2*Math.tan(w.fov*Math.PI/360)*.6*1.06;m.scale.set(T*w.aspect/2,T/2,1);const k=Math.max(2,V||v.domElement.width||2),D=Math.max(2,Q||v.domElement.height||2),C=k/D;c.uInvRes.value.set(1/k,1/D),c.uAspect.value=C,n.uAspect.value=C,c.uBeadN.value=Math.min(110,k/(12*Math.max(C,.001)));const Y=Math.max(Ce(o.quality),Math.min(896,Math.round(Math.max(k,D)/4))),M=C>=1?Math.min(Y,k):Math.round(Math.min(Y,D)*C),L=Math.max(2,Math.round(M/C));(M!==R||L!==U)&&(R=M,U=L,i.setSize(M,L),r.setSize(M,L),n.uTexel.value.set(1/M,1/L),c.uStateTexel.value.set(1/M,1/L)),(!u||u.image.width!==k||u.image.height!==D)&&(o.contextLost||u?.dispose(),u=new me(k,D),u.type=b,u.minFilter=E,u.magFilter=E,u.wrapS=u.wrapT=z,u.generateMipmaps=!1,u.colorSpace=N,c.uScene.value=u,j=!1)},le=(v,w)=>{n.uDt.value=w,n.uPrev.value=h.texture;const A=v.getRenderTarget();v.setRenderTarget(f),v.render(x,o.ortho),v.setRenderTarget(A);const T=h;h=f,f=T,c.uState.value=h.texture};return m.onBeforeRender=v=>{if(!(!u||!K))try{v.copyFramebufferToTexture(u),j=!0}catch(w){K=!1,m.visible=!1,console.warn("[rain] framebuffer grab unavailable, glass disabled:",w?.message||w)}},{mesh:m,simUniforms:n,compUniforms:c,resize:B,step:le,get texture(){return h.texture},get grab(){return u},get grabbed(){return j},get res(){return[R,U]},setSourceSize(v,w,A,T){V=v|0,Q=w|0,B(A,T)},setGrabType(v,w,A){v!==b&&(b=v,o.contextLost||u?.dispose(),u=null,j=!1,B(w,A))},setQuality(v,w,A){const T=J(v);d.defines.NTAP!==T&&(d.defines.NTAP=T,d.needsUpdate=!0),B(w,A)},dispose(){m.onBeforeRender=()=>{},l.dispose(),d.dispose(),p.dispose(),g.dispose(),i.dispose(),r.dispose(),u?.dispose(),u=null,x.clear()}}}const ee=o=>o*o*(3-2*o);function P(o,e,a){let t=Math.imul(o,374761393)+Math.imul(e,668265263)+Math.imul(a,1274126177);return t=(t^t>>>13)>>>0,t=Math.imul(t,1274126177)>>>0,((t^t>>>16)>>>0)/4294967295}function Fe(o,e,a,t){const s=Math.floor(o),i=Math.floor(e),r=ee(o-s),n=ee(e-i),l=(s%a+a)%a,d=(i%a+a)%a,x=(l+1)%a,_=(d+1)%a,c=P(l,d,t),p=P(x,d,t),g=P(l,_,t),m=P(x,_,t);return c+(p-c)*r+(g+(m-g)*r-(c+(p-c)*r))*n}function O(o,e,a,t,s){let i=.5,r=0,n=0,l=a;for(let d=0;d<s;d++)r+=i*Fe(o*(l/a),e*(l/a),l,t+d*17),n+=i,i*=.5,l*=2;return r/n}function Ee(o=128){const e=new Uint8Array(o*o*4),a=8;for(let s=0;s<o;s++)for(let i=0;i<o;i++){const r=i/o*a,n=s/o*a,l=(s*o+i)*4;e[l]=Math.round(255*O(r,n,a,1,4)),e[l+1]=Math.round(255*O(r*.5,n*.5,a,91,2)),e[l+2]=Math.round(255*P(i,s,7)),e[l+3]=Math.round(255*O(r*.75,n*.75,a,313,2))}const t=new ve(e,o,o,se);return t.wrapS=t.wrapT=ge,t.minFilter=we,t.magFilter=E,t.generateMipmaps=!0,t.colorSpace=N,t.needsUpdate=!0,t}const W=(o,e,a,t)=>o+(e-o)*(1-Math.exp(-a*t)),F=(o,e,a)=>o<e?e:o>a?a:o,te={ink:"#08090B",bone:"#EDE8E1",brass:"#C6A15B",harbour:"#2E4F52",keyWarm:"#FFC489",rimCool:"#A6C8D6"};class je{static id="rain";constructor(e){this.ctx=e,this.group=new be,this.group.name="rain",this._q=new ye,this._v=new y,this._axis=new y,this._proj=new y,this._wind=0,this._gust=0,this._wipe=0,this._wet=0,this._px=0,this._py=0,this._simT=0,this._warm=!1,this._master=1,this._lowTier=e.quality.tier==="low",this._portrait=!1,this._popDim=1,this._warmDebt=0,this._onQuality=this._onQuality.bind(this)}async init(){const e=this.ctx,a=this._palette();this.grain=Ee(128);try{this.water=e.assetLib?.load("tex-water",{srgb:!1,aniso:4,wrap:!0})||null}catch{this.water=null}this.glass=Le(e,a,this.grain,this.water),this.glass.resize(e.renderer,e.camera),this.streaks=Re(e,a,this.glass.grab),this.group.add(this.streaks.mesh),this._applyPopulation(),e.camera.add(this.glass.mesh),e.scene.add(this.group),this._readEnv(0),this.onResize(e.sizes.w,e.sizes.h,e.sizes.dpr),this._warmUp(),this.uniforms={uRainIntensity:this.streaks.uniforms.uIntensity,uWind:this.streaks.uniforms.uWind,uWetness:this.glass.compUniforms.uWet,uGlassState:this.glass.compUniforms.uState,uMist:this.glass.compUniforms.uMistAmt},e.rain={group:this.group,uniforms:this.uniforms,glass:{mesh:this.glass.mesh,uniforms:this.glass.compUniforms,sim:this.glass.simUniforms,state:this.glass.compUniforms.uState,res:this.glass.res},streaks:{mesh:this.streaks.mesh,uniforms:this.streaks.uniforms},setSourceEncoding:t=>this._setSourceEncoding(t),setSourceSize:(t,s)=>{this.glass?.setSourceSize(t,s,e.renderer,e.camera),this.streaks.uniforms.uScene.value=this.glass?.grab||null,this.streaks.uniforms.uSceneAmt.value=0},setIntensity:t=>{this._master=F(t,0,1)}},this._offQuality=e.bus.on("quality",this._onQuality)}_palette(){const e=this.ctx.env?.palette;if(e)return e;const a={};for(const t in te)a[t]=new xe(te[t]);return a}_setSourceEncoding(e){const a=e==="linear",t=this.glass?.mesh?.material,s=this.streaks?.mesh?.material;for(const i of[t,s])i&&(a?i.defines.RN_SOURCE_LINEAR=1:delete i.defines.RN_SOURCE_LINEAR,i.needsUpdate=!0);this.glass?.setGrabType(a?ie:oe,this.ctx.renderer,this.ctx.camera)}_warmUp(e=96){const a=this.ctx,t=this.glass,s=t.simUniforms.uSpawn.value;t.simUniforms.uSpawn.value=s*2.1;const i=1/34;for(let r=0;r<e;r++)this._simT+=i,t.simUniforms.uTime.value=this._simT,t.step(a.renderer,i);t.simUniforms.uSpawn.value=s,this._warm=!0}_drainWarm(e){if(!this._warmDebt||!this.glass)return;const a=Math.min(e,this._warmDebt);this._warmDebt-=a,this._warmUp(a)}_readEnv(e){const a=this.ctx.env;if(!a)return;const t=this.streaks.uniforms,s=this.glass.compUniforms;if(a.key){t.uKeyPos.value.copy(a.key.position),this._axis.copy(a.key.target?.position||this._v.set(0,-1,0)).sub(a.key.position).normalize(),t.uKeyAxis.value.copy(this._axis);const i=a.key.angle||.35;t.uKeyCone.value.set(Math.cos(i*1.05),Math.cos(i*.25)),this._projectLight(a.key.position,s.uKeyScreen.value)}if(a.rim){t.uRimPos.value.copy(a.rim.position),this._axis.copy(a.rim.target?.position||this._v.set(0,-1,0)).sub(a.rim.position).normalize(),t.uRimAxis.value.copy(this._axis);const i=a.rim.angle||.58;t.uRimCone.value.set(Math.cos(i*1),Math.cos(i*.2)),this._projectLight(a.rim.position,s.uRimScreen.value)}}_updateSubject(e,a){const t=this.ctx.hair?.center,s=e.uSubject.value;if(!t){s.w=0,a.uSubject.value.w=0;return}const i=this.ctx.camera;if(i.aspect<1){s.set(.5,.5,.5,1),a.uSubject.value.copy(s);return}if(this._proj.copy(t).project(i),this._proj.z>1||this._proj.z<-1){s.w=0,a.uSubject.value.w=0;return}const r=this._proj.x*.5+.5,n=this._proj.y*.5+.5;this._v.set(t.x,t.y+2,t.z).project(i);const l=Math.max(Math.abs(this._v.y-this._proj.y)*.5,.05);s.set(r,n,1/(l*l),.9),a.uSubject.value.copy(s)}_projectLight(e,a){const t=this.ctx.camera;this._proj.copy(e).project(t);const s=this._proj.z>1;a.set(F(s?-this._proj.x*3:this._proj.x,-3,3),F(s?-this._proj.y*3:this._proj.y,-3,3))}_applyPopulation(){const e=this.ctx.quality,a=e.tier==="high"?6500:e.tier==="medium"?3200:e.rainDrops|0;let t=Math.min(Math.max(64,e.rainDrops|0),a);this._portrait&&(t=Math.max(64,Math.round(t*.5))),this.streaks.setCount(t)}_onQuality(){const e=this.ctx;this._applyPopulation(),this.glass.setQuality(e.quality,e.renderer,e.camera),this.streaks.uniforms.uScene.value=this.glass.grab,this._lowTier=e.quality.tier==="low",this._warmDebt=96}onResize(e,a,t){const s=this.ctx;if(!this.glass)return;this.glass.resize(s.renderer,s.camera),this.streaks.uniforms.uScene.value=this.glass.grab;const i=Math.max(2,s.renderer.domElement.width),r=Math.max(2,s.renderer.domElement.height),n=this.streaks.uniforms;n.uInvRes.value.set(1/i,1/r),n.uAspect.value=s.camera.aspect,n.uTanHalfFov.value=Math.tan(s.camera.fov*Math.PI/360),n.uPxPerWorld.value=2*n.uTanHalfFov.value/r,n.uSceneAmt.value=0;const l=(e||0)<768||s.camera.aspect<1;this._popDim=l?.6:1,n.uFarFade.value.set(l?14:19,l?3:4.5),l!==this._portrait&&(this._portrait=l,this._applyPopulation())}update(e,a){const t=this.ctx,s=t.reducedMotion,i=t.camera,r=this.streaks.uniforms,n=this.glass.simUniforms,l=this.glass.compUniforms;i.getWorldQuaternion(this._q),i.getWorldPosition(r.uCamPos.value),r.uCamRight.value.set(1,0,0).applyQuaternion(this._q),r.uCamUp.value.set(0,1,0).applyQuaternion(this._q),r.uCamFwd.value.set(0,0,-1).applyQuaternion(this._q),this._readEnv(e);const d=s?0:F(t.scroll.velocity*3.2,-1,1),x=F(t.scroll.progress,0,1),_=Math.abs(d);this._gust=W(this._gust,_,this._gust<_?6:.85,e),this._wind=W(this._wind,d,2.1,e),this._wet=W(this._wet,s?.45:.3+x*.55,.7,e);const c=this._master,p=this._gust,g=.195+this._wind*.34,m=.045-this._wind*.06;r.uTime.value=s?6:a,r.uWind.value.set(g,m),r.uFall.value=7.2*(1+p*.55),r.uIntensity.value=c*this._popDim*(.72+p*.8)*(.85+this._wet*.3),r.uLen.value=.32*(1+p*.34),r.uSceneAmt.value=this.glass.grabbed?1:0,l.uMistTime.value=s?12:a,l.uMistAmt.value=c*(.05+this._wet*.038+p*.03)*(this._lowTier?.8:1),this._updateSubject(l,n);const u=t.pointer.sx*.5+.5,b=t.pointer.sy*.5+.5,h=n.uWipe.value;h.z=h.x,h.w=h.y,h.x=u,h.y=b;const f=Math.hypot(h.x-h.z,h.y-h.w)/Math.max(e,.001),R=t.pointer.inside&&!s&&f>.02;this._wipe=W(this._wipe,R?Math.min(1,.35+f*2.6):0,R?14:3.2,e),n.uWipeAmt.value=this._wipe*.6*e*60,n.uShear.value=.06+this._wind*.42,n.uFlow.value=190*(1+p*1.3),n.uSpawn.value=.36*(.7+this._wet*.75+p*.5),n.uDry.value=.42-this._wet*.16,l.uWet.value=this._wet,l.uFogAmt.value=.46*(1-p*.3),this._drainWarm(8),s?this._warm||this._warmUp():(this._simT+=e,n.uTime.value=this._simT,this.glass.step(t.renderer,Math.min(e,1/40)))}dispose(){const e=this.ctx;this._offQuality?.(),this._offQuality=null,this.glass&&(e.camera?.remove(this.glass.mesh),this.glass.dispose(),this.glass=null),this.streaks&&(this.group.remove(this.streaks.mesh),this.streaks.dispose(),this.streaks=null),this.grain?.dispose(),this.grain=null,e.scene.remove(this.group),e.rain&&(e.rain=null)}}export{je as default};
