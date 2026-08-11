import{t as W,r as G,O as U,l as X,S as O,k as E,V as S,j as f,u as P,i as D,v as K,e as y,q as j,w as _,x as T,o as L,N as H,n as Y,I as J,y as C,z as A,E as Z,J as ee,K as te,D as N,U as R,X as ae,G as se,d as V}from"./three-sQPBrRwf.js";const B=`
float hairHash11(float p) {
  p = fract(p * 0.1031);
  p *= p + 33.33;
  p *= p + p;
  return fract(p);
}

vec2 hairHash21(float p) {
  vec3 p3 = fract(vec3(p) * vec3(0.1031, 0.1030, 0.0973));
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.xx + p3.yz) * p3.zy);
}

/** Branchless orthonormal basis around n (Duff et al. 2017). */
void hairBasis(vec3 n, out vec3 b1, out vec3 b2) {
  float s = n.z >= 0.0 ? 1.0 : -1.0;
  float a = -1.0 / (s + n.z);
  float b = n.x * n.y * a;
  b1 = vec3(1.0 + s * n.x * n.x * a, s * b, -s * n.x);
  b2 = vec3(b, s + n.y * n.y * a, -n.y);
}

vec3 hairClampLen(vec3 v, float m) {
  float l = length(v);
  return l > m ? v * (m / max(l, 1e-6)) : v;
}
`,ie=`
vec3 hairWind(vec3 p, float t) {
  vec3 c = vec3(0.0);
  c += vec3(-0.42, 0.00,  0.55)        * cos(dot(vec3(0.55, 0.31,  0.42), p) + t * 0.230);
  c += vec3( 0.00, -0.36, -0.71) * 0.85 * cos(dot(vec3(0.28, 0.71, -0.36), p) + t * 0.310 + 2.1);
  c += vec3( 0.22, -0.93,  0.00) * 0.70 * cos(dot(vec3(0.93, 0.22,  0.61), p) + t * 0.170 + 4.4);
  c += vec3(-1.55, 0.00,  1.90) * 0.14 * cos(dot(vec3(1.90, 1.35,  1.55), p) + t * 0.440 + 1.3);
  return c;
}

/** Two detuned envelopes so gusts swell and die instead of cycling. */
float hairGust(float t) {
  float a = 0.5 + 0.5 * sin(t * 0.1150 + 1.10);
  float b = 0.5 + 0.5 * sin(t * 0.0731 - 0.40);
  return 0.28 + 0.72 * pow(a * 0.65 + b * 0.35, 2.1);
}
`,oe=`
uniform vec4  uW;
uniform vec3  uHead;
uniform float uHeadR;
uniform float uLength;
uniform float uSweep;
uniform float uTwist;
uniform float uSpin;
uniform vec2  uLean;
uniform float uPart;

const float HAIR_HALF_PI = 1.5707963;
const float HAIR_BRAID_Y = 0.71;   // vertical drop paid back to the helix's lateral arc

vec3 hairPt(float th, float rad, float y) {
  return vec3(uHead.x + sin(th) * rad, y, uHead.z + cos(th) * rad);
}

vec3 hairRest(vec4 gA, vec4 gB, float t) {
  float th   = gA.x;
  float phi0 = gA.y;
  float relO = gA.z;
  float seed = gA.w;
  float len  = uLength * gB.x;
  float curl = gB.y;
  float rj   = gB.w;

  // a perfect sphere gives a perfect arc for a silhouette, which reads as a
  // moulded form; two low harmonics are enough to make it a head
  float R = uHeadR * (1.0 + 0.055 * sin(th * 3.1 + 0.7) + 0.028 * sin(th * 5.7 - 1.9));

  // arc travelled from the root; the strand hugs the scalp until rel.
  // uPart tilts that latitude with theta: one side of the head keeps its hair
  // against the skull further down than the other, which is what a parting
  // does, and it is the cheapest way to kill the mannequin symmetry.
  float arc = t * len;
  float rel = HAIR_HALF_PI + relO + uPart * th - uW.w * 0.42;
  float onScalp = max(rel - phi0, 0.0) * R;
  float phi = min(phi0 + arc / R, rel);
  float free = max(arc - onScalp, 0.0);

  float y0  = uHead.y + R * cos(phi) - free;
  float rad = R * sin(phi);

  // fr is the fraction THROUGH THIS STRAND'S OWN free length, so it reaches 1
  // for every strand regardless of how long it is or how late it released.
  // Measuring it against a fixed distance instead leaves short strands stuck
  // part-way through the pose: the braid then winds only its longest strands
  // and renders a bulb with a whisker hanging off it.
  float tRel = onScalp / max(len, 1e-3);
  float fr = clamp((t - tRel) / max(1.0 - tRel, 1e-3), 0.0, 1.0);

  // The free length sweeps across as it descends and the very tips curl back:
  // an S, not a lean. This is doing two jobs at once — it turns the silhouette
  // from a capsule into a shape, and it makes the tangent rotate continuously
  // down the strand, which is the only thing that can drag a coherent
  // anisotropic band across a mass of otherwise parallel filaments.
  float sweepF = fr * fr * (3.0 - 2.0 * fr);
  float curlBack = smoothstep(0.55, 1.0, fr);
  vec2 lean = uLean * ((sweepF - 0.30 * curlBack * curlBack) * (0.78 + rj * 0.44));

  // a long fall is widest at the shoulder and tapers below it — a column of
  // constant width is the single most synthetic thing hair can do
  float taper = 1.0 + 0.20 * fr - 0.78 * fr * fr;

  // ---- loose fall: a slow outward belly, a lazy curl, no two alike ---------
  float dRF = (rj * 0.20 * R + 0.15 * sin(free * 1.05 + curl) + 0.09) * fr;
  float dAF = 0.115 * sin(free * 1.55 + curl * 1.3) * fr;
  vec3  pF = hairPt(th + dAF, (rad + dRF) * taper, y0);
  pF.xz += lean;

  // ---- combed: gathered inward, flattened to a sheet, a sweep passing through
  float sweep = exp(-pow((th - uSweep) * 1.85, 2.0));
  float dRC = (-0.26 * R + 0.05) * fr;
  float dAC = (-th * 0.34 + sweep * 0.30) * fr;
  vec3  pC = hairPt(th + dAC, (rad + dRC) * mix(1.0, taper, 0.25), y0);
  pC.z = uHead.z + (pC.z - uHead.z) * (1.0 - 0.50 * fr);
  pC.x += sweep * 0.22 * fr * fr + lean.x * 0.55;

  // ---- braid: the free length winds onto a common, slowly turning helix ----
  // ARC BUDGET. A strand has a fixed length and the solver's distance
  // constraints enforce it absolutely, so any target shape that asks for more
  // arc than the strand owns simply cannot be reached — the constraints win,
  // pull the strand taut, and the pose renders as a bulb with a whisker.
  // A helix of radius r through uTwist radians spends r*uTwist on lateral
  // travel, so the vertical drop has to be paid down to match. Radius, twist
  // and HAIR_BRAID_Y are balanced against each other here, not chosen freely.
  float kB = smoothstep(0.15, 0.85, fr);
  float twistPh = fr * uTwist + uSpin;
  float aB = mix(th, th * 0.45 + twistPh, kB);
  // Three plait lobes whose phase advances with height. This is what actually
  // reads as a braid from the front: half a turn of a thin helix is just a
  // taper, but a radius modulation that spirals costs no arc length at all and
  // lays visible diagonal facets down the rope.
  float lobes = 1.0 + 0.34 * sin(3.0 * aB - free * 2.3 - uSpin);
  float rBase = (0.62 + rj * 0.24) * lobes + 0.06 * sin(free * 3.1 + curl);
  float rB = mix(rad, rBase, kB);
  vec3  pB = hairPt(aB, rB, uHead.y + R * cos(phi) - free * mix(1.0, HAIR_BRAID_Y, kB));
  pB.xz += lean * 0.42;

  // ---- dissolve: released, then genuinely vertical -------------------------
  // Same budget problem, worse: fanning strands apart *along* their length asks
  // for lateral arc they do not have, and the field renders as a cone off the
  // crown. So dissolve does not fan them — it lets go of the root entirely and
  // rebuilds each strand as an independent vertical line at a scattered
  // position and height. Arc cost: zero. The result is rain, which is the
  // whole point of the section.
  float sp  = hairHash11(seed * 3.77 + 11.3);
  float sp2 = hairHash11(seed * 9.13 + 4.10);
  float aD  = th * 1.15 + (sp - 0.5) * 1.30;
  float rD  = rad * 0.30 + 0.55 + sp * 2.35;
  float yD  = uHead.y + R * 0.92 + (sp2 - 0.5) * 1.70 - t * len;
  vec3  pD = hairPt(aD, rD, yD);

  return pF * uW.x + pC * uW.y + pB * uW.z + pD * uW.w;
}
`,q=`
uniform sampler2D uPos;
uniform float uSegN;
uniform float uGuideN;
uniform float uBaseWidth;
uniform float uClump;
uniform float uFly;
uniform float uPxPerWorld;  // world units per device pixel at distance 1

attribute float aSeg;
attribute float aSide;
attribute float iGuide;
attribute float iSeed;
attribute vec3  iClump;   // cos, sin, radius
attribute vec4  iShape;   // widthScale, lengthTrim, alphaScale, tint

/** width taper root -> tip; hair narrows to almost nothing at the point */
float hairWidthProfile(float t) {
  return pow(max(1.0 - 0.955 * t, 0.0), 0.62) * (0.86 + 0.14 * (1.0 - t) * (1.0 - t));
}

/** a lock converges toward the tip, then frays a little */
float hairClumpProfile(float t) {
  return mix(1.0, 0.16, pow(t, 0.70)) + 0.30 * t * t;
}

struct HairVert {
  vec3 world;     // ribbon-expanded world position
  vec3 center;    // strand centre-line, before the ribbon expansion
  vec3 tangent;
  vec3 binormal;
  vec3 facing;
  float t;        // 0..1 along the drawn strand
  float speed;
  float face;     // sin(angle between tangent and view) — see below
  float thin;     // coverage of a width-floored ribbon: unclamped_hw / hw
};

HairVert hairBuildVert() {
  float du = 1.0 / uSegN;
  float v  = (iGuide + 0.5) / uGuideN;

  float tDraw = aSeg / max(uSegN - 1.0, 1.0);
  float sf    = aSeg * iShape.y;              // fractional index into the guide
  float s0    = floor(sf);
  float fr    = sf - s0;

  float i0 = clamp(s0 - 1.0, 0.0, uSegN - 1.0);
  float i1 = clamp(s0,       0.0, uSegN - 1.0);
  float i2 = clamp(s0 + 1.0, 0.0, uSegN - 1.0);
  float i3 = clamp(s0 + 2.0, 0.0, uSegN - 1.0);

  vec4 p0 = texture2D(uPos, vec2((i0 + 0.5) * du, v));
  vec4 p1 = texture2D(uPos, vec2((i1 + 0.5) * du, v));
  vec4 p2 = texture2D(uPos, vec2((i2 + 0.5) * du, v));
  vec4 p3 = texture2D(uPos, vec2((i3 + 0.5) * du, v));

  vec3 pos = mix(p1.xyz, p2.xyz, fr);
  vec3 tan0 = p2.xyz - p0.xyz;
  vec3 tan1 = p3.xyz - p1.xyz;
  vec3 T = mix(tan0, tan1, fr);
  float tl = length(T);
  T = tl > 1e-6 ? T / tl : vec3(0.0, -1.0, 0.0);

  vec3 b1, b2;
  hairBasis(T, b1, b2);

  float cp = hairClumpProfile(tDraw);
  vec3 off = (b1 * iClump.x + b2 * iClump.y) * (iClump.z * cp * uClump);

  // per-strand flyaway: no two filaments share a path
  float ph = iSeed * 41.7;
  off += (b1 * sin(tDraw * 9.3 + ph) + b2 * cos(tDraw * 7.1 + ph * 1.7)) * (uFly * tDraw);

  vec3 c = pos + off;

  vec3 V = cameraPosition - c;
  float vl = length(V);
  V = vl > 1e-6 ? V / vl : vec3(0.0, 0.0, 1.0);

  // |cross(T,V)| is sin(angle between the fibre and the view ray). As it goes to
  // zero the ribbon's width direction is undefined and the quad snaps to an
  // arbitrary basis — a filament pointing at the camera flips wide open and
  // rasterises as a bright dash. It is also physically foreshortened to nothing
  // at that angle, so the fix and the correct answer are the same: fade it.
  vec3 B = cross(T, V);
  float bl = length(B);
  B = bl > 1e-4 ? B / bl : b1;
  vec3 Nf = normalize(cross(B, T));

  float hw = uBaseWidth * iShape.x * hairWidthProfile(tDraw);

  // Projected-pixel width floor — the analytic line-AA trick. A ribbon
  // narrower than ~0.6 device px rasterises as dashed stipple and crawls in
  // motion; clamping the width up and paying the difference back as COVERAGE
  // turns further thinning into transparency instead of aliasing. The AA pass
  // downstream assumes this floor exists.
  float pxW = vl * uPxPerWorld;
  float hwMin = pxW * 0.6;
  float thin = 1.0;
  if (hw < hwMin && hwMin > 0.0) {
    thin = hw / hwMin;
    hw = hwMin;
  }

  HairVert o;
  o.center   = c;
  o.world    = c + B * (aSide * hw);
  o.tangent  = T;
  o.binormal = B;
  o.facing   = Nf;
  o.t        = tDraw;
  o.speed    = mix(p1.w, p2.w, fr);
  o.face     = bl;
  o.thin     = thin;
  return o;
}
`,I=`
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`,re=`
precision highp float;
varying vec2 vUv;

uniform sampler2D uCur;
uniform sampler2D uPrev;
uniform sampler2D uGuideA;
uniform sampler2D uGuideB;

uniform float uSegN;
uniform float uDt;
uniform float uDtRatio;
uniform float uDrag;
uniform float uTime;
uniform float uGravity;
uniform float uWindAmp;
uniform float uGsc;
uniform float uMaxStep;
uniform float uSeedMode;

uniform vec3  uPtrPos;
uniform vec3  uPtrVel;
uniform float uPtrFall;
uniform float uPtrPush;
uniform float uPtrDrag;
uniform vec3  uScrollF;

uniform sampler2D uFluid;
uniform float uHasFluid;
uniform float uFluidAmp;
uniform mat4  uViewProj;
uniform vec3  uCamRight;
uniform vec3  uCamUp;

${B}
${ie}
${oe}

void main() {
  float segIdx = floor(vUv.x * uSegN);
  float t = segIdx / max(uSegN - 1.0, 1.0);

  vec4 gA = texture2D(uGuideA, vec2(vUv.y, 0.5));
  vec4 gB = texture2D(uGuideB, vec2(vUv.y, 0.5));

  vec3 rest = hairRest(gA, gB, t);

  // seeding: no history to read, just stamp the rest pose into both buffers
  if (uSeedMode > 0.5) {
    gl_FragColor = vec4(rest, 0.0);
    return;
  }

  // the root texel IS the anchor — pinned, never integrated
  if (segIdx < 0.5) {
    gl_FragColor = vec4(rest, 0.0);
    return;
  }

  vec4 curS  = texture2D(uCur, vUv);
  vec3 cur   = curS.xyz;
  vec3 prev  = texture2D(uPrev, vUv).xyz;

  // roots barely move; tips take the full force
  float segW = smoothstep(0.0, 0.24, t);
  float mass = gB.z;

  vec3 acc = vec3(0.0, -uGravity, 0.0);

  acc += hairWind(cur * 0.75, uTime) * (uWindAmp * hairGust(uTime) * segW * mass);

  // pointer: mostly entrainment along the hand's motion, a little radial parting.
  // The settle and follow-through are not scripted — they fall out of the Verlet
  // history once the force is removed.
  vec3 d = cur - uPtrPos;
  float fo = exp(-dot(d, d) * uPtrFall);
  vec3 dn = d / max(length(d), 1e-4);
  acc += (dn * uPtrPush + uPtrVel * uPtrDrag) * (fo * segW);

  acc += uScrollF * segW;

  if (uHasFluid > 0.5) {
    vec4 cp = uViewProj * vec4(cur, 1.0);
    vec2 suv = cp.xy / max(cp.w, 1e-4) * 0.5 + 0.5;
    if (suv.x > 0.0 && suv.x < 1.0 && suv.y > 0.0 && suv.y < 1.0) {
      vec2 fv = texture2D(uFluid, suv).xy;
      acc += (uCamRight * fv.x + uCamUp * fv.y) * (uFluidAmp * segW);
    }
  }

  acc = hairClampLen(acc, 90.0);

  // time-corrected Verlet — a variable dt must not inject energy
  vec3 vel = (cur - prev) * (uDtRatio * uDrag);
  vel = hairClampLen(vel, uMaxStep);

  vec3 p = cur + vel + acc * (uDt * uDt);

  // global shape constraint — the choreography. Strong near the root, released
  // toward the tip so the tips stay physical even when the mass is posed.
  p += (rest - p) * (uGsc * mix(1.0, 0.28, t));

  p = cur + hairClampLen(p - cur, uMaxStep * 2.0);

  // never let a strand leave its own root's reach
  vec3 anchor = hairRest(gA, gB, 0.0);
  vec3 fromRoot = p - anchor;
  float maxR = uLength * gB.x * 1.02;
  if (dot(fromRoot, fromRoot) > maxR * maxR) p = anchor + normalize(fromRoot) * maxR;

  // the implied skull, and the shoulder taper below it. Without this the mass
  // collapses through its own axis under gravity and the silhouette caves in.
  float shrink = (1.0 - uW.z * 0.85) * (1.0 - uW.w * 0.90);
  if (p.y > uHead.y) {
    vec3 hd = p - uHead;
    float hl = length(hd);
    float rmin = uHeadR * 0.985 * shrink;
    if (hl < rmin && hl > 1e-4) p = uHead + hd * (rmin / hl);
  } else {
    vec2 rr = p.xz - uHead.xz;
    float rl = length(rr);
    float rmin = uHeadR * 0.96 * exp(-(uHead.y - p.y) * 0.80) * shrink;
    if (rl < rmin && rl > 1e-4) p.xz = uHead.xz + rr * (rmin / rl);
  }

  if (!(dot(p, p) < 1.0e8)) p = rest;

  gl_FragColor = vec4(p, length(p - cur) / max(uDt, 1e-4));
}
`,ne=`
precision highp float;
varying vec2 vUv;

uniform sampler2D uPos;
uniform sampler2D uGuideB;
uniform float uSegN;
uniform float uLenBase;
uniform float uStiff;

void main() {
  float segIdx = floor(vUv.x * uSegN);
  vec4 c = texture2D(uPos, vUv);

  if (segIdx < 0.5) { gl_FragColor = c; return; }

  float du = 1.0 / uSegN;
  float lenScale = texture2D(uGuideB, vec2(vUv.y, 0.5)).x;
  float rest = uLenBase * lenScale;

  vec3 p = c.xyz;
  vec3 corr = vec3(0.0);

  // left edge — the neighbour toward the root
  vec3 pl = texture2D(uPos, vec2(vUv.x - du, vUv.y)).xyz;
  vec3 dl = p - pl;
  float ll = length(dl);
  // the root does not move, so the texel next to it takes the whole correction
  float wl = (segIdx < 1.5 || segIdx > uSegN - 1.5) ? 1.0 : 0.5;
  corr += (dl / max(ll, 1e-6)) * ((rest - ll) * wl);

  // right edge — absent for the tip
  if (segIdx < uSegN - 1.5) {
    vec3 pr = texture2D(uPos, vec2(vUv.x + du, vUv.y)).xyz;
    vec3 dr = p - pr;
    float lr = length(dr);
    corr += (dr / max(lr, 1e-6)) * ((rest - lr) * 0.5);
  }

  p += corr * uStiff;

  gl_FragColor = vec4(p, c.w);
}
`;class le{constructor(e,t,a){this.seg=t.seg,this.guides=t.guides,this.iters=t.iters;const i=!!e.getContext().getExtension("EXT_color_buffer_float");this.type=i?W:G,i||console.warn("[hair] no float render targets — falling back to half precision"),this.rt=[];for(let l=0;l<4;l++)this.rt.push(this._makeRT());this.prev=0,this.cur=1,this.free=[2,3],this.guideA=this._makeGuideTex(a.a),this.guideB=this._makeGuideTex(a.b),this.camera=new U(-1,1,1,-1,0,1),this.quad=new X(2,2),this.scene=new O,this.mesh=new E(this.quad,null),this.mesh.frustumCulled=!1,this.scene.add(this.mesh);const r={uSegN:{value:this.seg},uW:{value:new P(1,0,0,0)},uHead:{value:new f},uHeadR:{value:1.35},uLength:{value:3.9},uSweep:{value:0},uTwist:{value:2.9},uSpin:{value:0},uLean:{value:new S(1.55,.22)},uPart:{value:.2}};this.shared=r,this.integrateMat=new D({vertexShader:I,fragmentShader:re,depthTest:!1,depthWrite:!1,toneMapped:!1,uniforms:{uCur:{value:null},uPrev:{value:null},uGuideA:{value:this.guideA},uGuideB:{value:this.guideB},uDt:{value:1/60},uDtRatio:{value:1},uDrag:{value:.986},uTime:{value:0},uGravity:{value:5.6},uWindAmp:{value:1},uGsc:{value:.06},uMaxStep:{value:.055},uSeedMode:{value:0},uPtrPos:{value:new f(0,0,40)},uPtrVel:{value:new f},uPtrFall:{value:1/(.85*.85)},uPtrPush:{value:5.5},uPtrDrag:{value:9},uScrollF:{value:new f},uFluid:{value:null},uHasFluid:{value:0},uFluidAmp:{value:2.2},uViewProj:{value:new K},uCamRight:{value:new f(1,0,0)},uCamUp:{value:new f(0,1,0)},...r}}),this.constrainMat=new D({vertexShader:I,fragmentShader:ne,depthTest:!1,depthWrite:!1,toneMapped:!1,uniforms:{uPos:{value:null},uGuideB:{value:this.guideB},uSegN:{value:this.seg},uLenBase:{value:r.uLength.value/Math.max(this.seg-1,1)},uStiff:{value:1}}}),this._clearColor=new y,this._seeded=!1}get texture(){return this.rt[this.cur].texture}_makeRT(){const e=new j(this.seg,this.guides,{type:this.type,format:L,minFilter:T,magFilter:T,depthBuffer:!1,stencilBuffer:!1,generateMipmaps:!1,wrapS:_,wrapT:_});return e.texture.colorSpace=H,e}_makeGuideTex(e){const t=new Y(e,this.guides,1,L,W);return t.minFilter=T,t.magFilter=T,t.wrapS=_,t.wrapT=_,t.generateMipmaps=!1,t.colorSpace=H,t.needsUpdate=!0,t}setLength(e){this.shared.uLength.value=e,this.constrainMat.uniforms.uLenBase.value=e/Math.max(this.seg-1,1)}_draw(e,t,a){this.mesh.material=a;const s=e.getRenderTarget();e.setRenderTarget(t),e.render(this.scene,this.camera),e.setRenderTarget(s)}seed(e){const t=this.integrateMat.uniforms;t.uCur.value=null,t.uPrev.value=null,t.uSeedMode.value=1,this._draw(e,this.rt[this.cur],this.integrateMat),this._draw(e,this.rt[this.prev],this.integrateMat),t.uSeedMode.value=0,this._seeded=!0}step(e,t,a){this._seeded||this.seed(e);const s=this.integrateMat.uniforms;s.uDt.value=t,s.uDtRatio.value=Math.min(t/Math.max(a,1e-4),1.6),s.uCur.value=this.rt[this.cur].texture,s.uPrev.value=this.rt[this.prev].texture;let i=this.free[0],r=this.free[1];this._draw(e,this.rt[i],this.integrateMat);const l=this.constrainMat.uniforms;for(let c=0;c<this.iters;c++){const d=r;r=i,i=d,l.uPos.value=this.rt[r].texture,this._draw(e,this.rt[i],this.constrainMat)}const h=this.prev;this.prev=this.cur,this.cur=i,this.free[0]=r,this.free[1]=h}dispose(){for(const e of this.rt)e.dispose();this.rt.length=0,this.guideA.dispose(),this.guideB.dispose(),this.quad.dispose(),this.integrateMat.dispose(),this.constrainMat.dispose()}}function Q(n){return function(){n|=0,n=n+1831565813|0;let e=Math.imul(n^n>>>15,1|n);return e=e+Math.imul(e^e>>>7,61|e)^e,((e^e>>>14)>>>0)/4294967296}}function he(n,e){const t=Q(1096036659),a=new Float32Array(n*4),s=new Float32Array(n*4),{thetaMin:i,thetaMax:r,phiMin:l,phiMax:h}=e,c=Math.cos(l),d=Math.cos(h);for(let u=0;u<n;u++){const m=(u+t())/n*2-1,w=Math.sign(m)*Math.pow(Math.abs(m),1.12)*.5+.5,o=i+(r-i)*w,g=Math.acos(c+(d-c)*t());a[u*4+0]=o,a[u*4+1]=g,a[u*4+2]=(t()-.5)*.34,a[u*4+3]=t()*97,s[u*4+0]=.78+Math.pow(t(),.85)*.4,s[u*4+1]=t()*6.2831853,s[u*4+2]=.68+t()*.64,s[u*4+3]=t()-.5}return{a,b:s}}function ue(n,e,t){const a=Q(195911405),s=e*2,i=new Float32Array(s),r=new Float32Array(s),l=new Float32Array(s*3);for(let o=0;o<e;o++)i[o*2+0]=o,i[o*2+1]=o,r[o*2+0]=-1,r[o*2+1]=1;const h=new Uint16Array((e-1)*6);for(let o=0;o<e-1;o++){const g=o*2;h[o*6+0]=g,h[o*6+1]=g+1,h[o*6+2]=g+2,h[o*6+3]=g+1,h[o*6+4]=g+3,h[o*6+5]=g+2}const c=new Int32Array(n);for(let o=0;o<n;o++)c[o]=o%t;for(let o=n-1;o>0;o--){const g=a()*(o+1)|0,M=c[o];c[o]=c[g],c[g]=M}const d=new Float32Array(n),u=new Float32Array(n),p=new Float32Array(n*3),m=new Float32Array(n*4);for(let o=0;o<n;o++){d[o]=c[o],u[o]=a();const g=a()*Math.PI*2;let M=Math.sqrt(a());a()<.03&&(M*=2.4+a()*1.6),p[o*3+0]=Math.cos(g),p[o*3+1]=Math.sin(g),p[o*3+2]=M;const $=a();m[o*4+0]=.58+Math.pow($,1.6)*1.05,m[o*4+1]=.66+Math.pow(a(),.8)*.34,m[o*4+2]=.72+a()*.28,m[o*4+3]=a()}const w=new J;return w.setAttribute("position",new C(l,3)),w.setAttribute("aSeg",new C(i,1)),w.setAttribute("aSide",new C(r,1)),w.setIndex(new C(h,1)),w.setAttribute("iGuide",new A(d,1)),w.setAttribute("iSeed",new A(u,1)),w.setAttribute("iClump",new A(p,3)),w.setAttribute("iShape",new A(m,4)),w.instanceCount=n,w.boundingSphere=new Z(new f(0,0,0),64),w}const ce=`
precision highp float;

uniform mat4  uLightMat;
uniform vec3  uCenter;
uniform vec2  uAoRange;

#ifdef HAIR_ENVMAP
uniform sampler2D envMap;
uniform float uEnvInt;
#endif

${B}
${q}

#ifdef HAIR_ENVMAP
#include <cube_uv_reflection_fragment>
#endif

varying vec3  vWorld;
varying vec3  vT;
varying vec3  vB;
varying vec3  vNf;
varying vec3  vLight;
varying vec3  vEnv;
varying float vSide;
varying float vT01;
varying float vSeed;
varying float vAlpha;
varying float vAo;
varying float vSpeed;
varying float vFace;
varying vec3  vBase;
varying vec3  vTint2;
varying vec2  vRand;   // x = specular shift jitter, y = tip-fade start

uniform vec3  uBase;
uniform vec3  uSpecCol2;
uniform vec3  uBrass;
uniform float uTipFade;

void main() {
  HairVert h = hairBuildVert();

  vWorld = h.world;
  vT     = h.tangent;
  vB     = h.binormal;
  vNf    = h.facing;
  vSide  = aSide;
  vT01   = h.t;
  vSeed  = iSeed;
  // h.thin folds the projected width floor back in as coverage — a strand
  // thinner than the floor draws at the floor width but proportionally
  // more transparent, so tips dissolve instead of dashing.
  vAlpha = iShape.z * h.thin;

  // Everything below is constant per instance. Evaluating it per fragment on a
  // fill-rate-bound pass is pure waste — three hashes and a branch, eight
  // million times a frame, for values that never vary across the filament.
  vBase  = uBase * mix(0.72, 1.35, hairHash11(iSeed * 7.31));
  vTint2 = mix(uSpecCol2, uBrass, step(0.962, iShape.w));
  vRand  = vec2(hairHash11(iSeed * 127.1) * 2.0 - 1.0,
                uTipFade + hairHash11(iSeed * 13.71) * 0.30 - 0.15);
  vSpeed = h.speed;
  vFace  = smoothstep(0.035, 0.30, h.face);

  // cheap view-independent occlusion: how far this filament sits from the axis
  // of the mass. The interior of a head of hair is darker than its silhouette.
  float rad = length(h.center.xz - uCenter.xz);
  float o = smoothstep(uAoRange.x, uAoRange.y, rad);
  vAo = clamp(mix(0.30, 1.0, o) + h.t * 0.30, 0.0, 1.2);

  vec4 lp = uLightMat * vec4(h.center, 1.0);
  vLight = lp.xyz / max(lp.w, 1e-5) * 0.5 + 0.5;

  // Environment ambient is sampled PER VERTEX. textureCubeUV costs several
  // dependent fetches plus face-selection branching, and this pass is fill-rate
  // bound — 115k vertices instead of eight million fragments, for an irradiance
  // term that is low-frequency by definition and lands on near-black fibre.
  vEnv = vec3(0.0);
#ifdef HAIR_ENVMAP
  vec3 nAmb = normalize(h.center - uCenter);
  vEnv = textureCubeUV(envMap, nAmb, 0.72).rgb * uEnvInt;
#endif

  gl_Position = projectionMatrix * viewMatrix * vec4(h.world, 1.0);
}
`,de=`
precision highp float;

uniform vec3  uKeyPos;
uniform vec3  uKeyCol;
uniform vec3  uKeyDir;
uniform vec2  uKeyCone;
uniform vec3  uRimPos;
uniform vec3  uRimCol;
uniform vec3  uRimDir;
uniform vec2  uRimCone;
uniform vec3  uFillPos;
uniform vec3  uFillCol;

uniform vec3  uBase;
uniform vec3  uSpecCol1;
uniform vec3  uSpecCol2;
uniform vec3  uBrass;
uniform vec3  uTransCol;
uniform vec3  uAmbSky;
uniform vec3  uAmbGround;

uniform float uShift1;
uniform float uShift2;
uniform float uExp1;
uniform float uExp2;
uniform float uSpec1;
uniform float uSpec2;
uniform float uJit;
uniform float uDiffuse;
uniform float uLightScale;
uniform float uAmbInt;
uniform float uAlphaMul;
uniform float uTipFade;

uniform sampler2D uOsm;
uniform float uOsmScale;
uniform float uShadowK;
uniform float uTransK;
uniform float uTransPow;
uniform float uTransAmt;
uniform float uRimSpec;
uniform float uFillAmb;

${B}
//__FOG__

varying vec3  vWorld;
varying vec3  vT;
varying vec3  vB;
varying vec3  vNf;
varying vec3  vLight;
varying vec3  vEnv;
varying float vSide;
varying float vT01;
varying float vSeed;
varying float vAlpha;
varying float vAo;
varying float vSpeed;
varying float vFace;
varying vec3  vBase;
varying vec3  vTint2;
varying vec2  vRand;

float strandSpec(vec3 T, vec3 V, vec3 L, float e) {
  float tl = dot(T, L);
  float tv = dot(T, V);
  float c = tl * tv + sqrt(max(0.0, 1.0 - tl * tl)) * sqrt(max(0.0, 1.0 - tv * tv));
  return pow(max(c, 0.0), e);
}

/**
 * T1/T2 depend only on the fibre, never on the light — hoist them.
 *
 * uSpecCol1 is deliberately neutral: the primary lobe is a surface reflection,
 * so its hue is the LIGHT's. Tinting it warm made the cool back light render a
 * sickly green where the two lobes met. The tinted lobe is the secondary one,
 * which is coloured by the path through the fibre and so keeps its brown under
 * any light.
 *
 * The broad lobe is reused at low weight in the primary's colour: a real
 * specular lobe has a soft halo around its core, and without one the exponent
 * draws a hard geometric edge straight across the mass.
 */
vec3 hairLobe(vec3 L, vec3 V, vec3 T1, vec3 T2, vec3 tint2, float halo, float dens) {
  float s1 = strandSpec(T1, V, L, uExp1);
  // the broad lobe is worth a pow only where it is actually weighted in
  float s2 = halo > 0.5 ? strandSpec(T2, V, L, uExp2) : 0.0;
  // s1*s1*s1 is c^(3*uExp1) for two multiplies: a narrow hot core sitting inside
  // a broad soft halo. A single tight exponent draws a hard geometric edge
  // straight across the mass; a single broad one is a grey wash. This is both.
  //
  // halo scales the WHOLE primary group, core included. It is 1 for the key
  // (full sheen) and 0.18 for the back light, whose job is a narrow cool rake on
  // the silhouette, not a second body colour — and the rim fixture is the hotter
  // of the two (420 vs the key's 265, env/lights.js). Leaving the core outside
  // the gate, as it was, made the rim's hot core the loudest specular term in
  // the frame and painted a blown cool-white patch across the camera-right side
  // of the crown. Factored in, the key's contribution is bit-identical (halo is
  // exactly 1.0 there) and the rim's core drops to where a rake belongs.
  float core = s1 * s1 * s1;
  // …and the core is gated by how much fibre stands behind this one. Where the
  // mass is thin, a lobe this narrow is satisfied by a handful of strands per
  // pixel and the "band" resolves as 2–3 px dashes on an otherwise smooth dome:
  // sparks, not sheen — and because the satisfying subset changes per frame as
  // the field solves, they crawl. Behind real mass there is a band; in front of
  // nothing there is only a glint. That is both physically right and the whole
  // sparse-coverage sparkle gone.
  core *= mix(0.30, 1.0, dens);
  return uSpecCol1 * ((s1 + core * 3.4 + s2 * 0.14) * halo * uSpec1)
       + tint2 * (s2 * uSpec2 * halo);
}

void main() {
  vec3 T  = normalize(vT);
  vec3 Bn = normalize(vB);
  vec3 Nf = normalize(vNf);
  vec3 V  = normalize(cameraPosition - vWorld);

  // treat the flat ribbon as a cylinder cross-section: the normal sweeps across
  // the width, so every filament gets a lit side and a turned-away side
  float a = vSide * 1.30;
  vec3 N = normalize(Bn * sin(a) + Nf * cos(a));

  float cov = smoothstep(1.0, 0.40, abs(vSide));
  // stagger where each filament starts thinning out, or the whole mass fades
  // along one clean horizontal line and reads as a gradient, not as hair ends
  float tip = 1.0 - smoothstep(vRand.y, 1.0, vT01);
  float alpha = cov * vAlpha * vFace * (0.16 + 0.84 * tip) * uAlphaMul;
  // this pass is fill-rate bound and the tips run a long way past the point
  // where they contribute a visible value — bail before the opacity-map fetch
  // and the two light blocks, not after
  if (alpha < 0.013) discard;

  // ---- deep opacity map: how much hair stands between here and the key ------
  vec4 slabs = texture2D(uOsm, vLight.xy);
  float inside = step(0.0, vLight.x) * step(vLight.x, 1.0) *
                 step(0.0, vLight.y) * step(vLight.y, 1.0);
  float z = clamp(vLight.z, 0.0, 1.0) * 4.0;
  float front = dot(slabs, clamp(vec4(z) - vec4(0.0, 1.0, 2.0, 3.0), 0.0, 1.0));
  float total = dot(slabs, vec4(1.0));
  front *= uOsmScale * inside;
  total *= uOsmScale * inside;
  float back = max(total - front, 0.0);
  // How much fibre stands behind this fragment along the key's axis, as a 0..1
  // "is there a mass here" signal. It is the only cheap measure of local strand
  // density the shader already has, and it is what tells the primary lobe's hot
  // core whether it is sitting on a body of hair or on a lone travelling fibre.
  float dens = smoothstep(0.15, 0.85, total);

  float shK = exp(-uShadowK * front);
  float shR = exp(-uShadowK * 0.80 * back);
  float trans = exp(-uTransK * back);

  // Per-strand, low-frequency along the length. Crank either term and the band
  // stops being a band and becomes sparkle: at full ±1 per-strand shift the
  // hero's primary R-band shattered into scattered scratches across the crown.
  // Neighbouring strands have to broadly AGREE on where the band sits — the
  // breakup should read as fibres inside one band, not as no band at all.
  float j = vRand.x * 0.5 + 0.18 * sin(vT01 * 9.0 + vSeed * 61.0);
  vec3 tint2 = vTint2;
  vec3 base = vBase;

  vec3 T1 = normalize(T + N * (uShift1 + j * uJit));
  vec3 T2 = normalize(T + N * (uShift2 - j * uJit * 0.7));

  vec3 col = vec3(0.0);

  // The R lobe is a surface reflection off the outermost cuticle, so it is only
  // weakly occluded by the fibres behind it. Feeding it the full shadow term
  // kills the highlight exactly where the mass is thickest — which is where the
  // highlight is supposed to be.
  float shKs = mix(1.0, shK, 0.55);

  // ---- key: warm, shaping, casts the self-shadow ---------------------------
  {
    vec3 d = uKeyPos - vWorld;
    float d2 = dot(d, d);
    vec3 L = d * inversesqrt(max(d2, 1e-6));
    float att = uLightScale / max(d2, 0.35);
    float cone = smoothstep(uKeyCone.x, uKeyCone.y, dot(-L, uKeyDir));
    float dif = mix(0.16, 1.0, sqrt(max(0.0, 1.0 - dot(T, L) * dot(T, L))));
    dif *= 0.45 + 0.55 * max(dot(N, L), 0.0);
    col += uKeyCol * (att * cone) *
           (base * (dif * uDiffuse * shK) + hairLobe(L, V, T1, T2, tint2, 1.0, dens) * shKs);
  }

  // ---- rim: the hotter light, behind. This is the band that draws hair. -----
  {
    vec3 d = uRimPos - vWorld;
    float d2 = dot(d, d);
    vec3 L = d * inversesqrt(max(d2, 1e-6));
    float att = uLightScale / max(d2, 0.35);
    float cone = smoothstep(uRimCone.x, uRimCone.y, dot(-L, uRimDir));
    float dif = mix(0.12, 1.0, sqrt(max(0.0, 1.0 - dot(T, L) * dot(T, L))));
    // The back light's specular is gated by the SQUARE of the occlusion behind
    // this fibre, so it only fires where the mass is thin — which is exactly
    // where a rake light lives. Ungated it paints a wide cool slab through the
    // body and the hair reads as going silver.
    float rake = shR * shR * uRimSpec;
    col += uRimCol * (att * cone) *
           (base * (dif * uDiffuse * 0.7 * shR) + hairLobe(L, V, T1, T2, tint2, 0.18, dens) * rake);

    // forward scatter through the mass — only the thin edges glow
    float tt = pow(max(dot(-L, V), 0.0), uTransPow);
    col += uTransCol * uRimCol * (att * cone * tt * trans * uTransAmt);
  }

  // The fill light is folded into the ambient below rather than evaluated as a
  // third point light: at this albedo its own contribution measured about half
  // a percent of the frame, for a normalize, a sqrt and a divide per fragment.

  // ---- ambient -------------------------------------------------------------
  vec3 amb = mix(uAmbGround, uAmbSky, N.y * 0.5 + 0.5) + vEnv + uFillCol * uFillAmb;
  col += amb * base * (uAmbInt * vAo * (0.25 + 0.75 * exp(-uShadowK * 0.35 * total)));

  // a filament in motion catches a little more of the wet light
  col += uSpecCol1 * (min(vSpeed, 3.0) * 0.0075 * vAo);

  col = at13ApplyFog(col, vWorld, cameraPosition);

  gl_FragColor = vec4(col, alpha);

  #include <tonemapping_fragment>
  #include <colorspace_fragment>

  // premultiplied AFTER tone mapping — tone mapping a premultiplied colour
  // crushes the fine tips into the background
  gl_FragColor.rgb *= gl_FragColor.a;
}
`,fe=`
precision highp float;
uniform mat4 uLightMat;

${B}
${q}

varying float vSide;
varying float vZ01;
varying float vT01;
varying float vFace;

void main() {
  HairVert h = hairBuildVert();
  vSide = aSide;
  vT01 = h.t;
  vFace = smoothstep(0.035, 0.30, h.face);
  vec4 p = uLightMat * vec4(h.world, 1.0);
  vZ01 = p.z * 0.5 + 0.5;
  gl_Position = p;
}
`,me=`
precision highp float;
uniform float uDensity;
uniform float uTipFade;
varying float vSide;
varying float vZ01;
varying float vT01;
varying float vFace;

void main() {
  float cov = smoothstep(1.0, 0.40, abs(vSide));
  float tip = 1.0 - smoothstep(uTipFade, 1.0, vT01);
  float a = cov * vFace * (0.16 + 0.84 * tip) * uDensity;
  float z = clamp(vZ01, 0.0, 1.0) * 4.0;
  z = clamp(z, 0.5, 3.5);
  vec4 tent = clamp(1.0 - abs(z - vec4(0.5, 1.5, 2.5, 3.5)), 0.0, 1.0);
  gl_FragColor = tent * a;
}
`;function ve(n,e){const t=n.env,a=t?.palette,s=(p,m)=>new y(a?.[p]?a[p].getHex():m),i={uPos:{value:null},uSegN:{value:e.seg},uGuideN:{value:e.guides},uClump:{value:.075},uFly:{value:.0075},uPxPerWorld:{value:5e-4}},r={value:new K};let l=null,h={};if(t?.envMap?.image?.height&&t.envMap.mapping===ee){const p=t.envMap.image.height,m=Math.log2(p)-2;Number.isFinite(m)&&m>0&&(l=t.envMap,h={HAIR_ENVMAP:"",ENVMAP_TYPE_CUBE_UV:"",CUBEUV_TEXEL_WIDTH:(1/(3*Math.max(Math.pow(2,m),112))).toFixed(10),CUBEUV_TEXEL_HEIGHT:(1/p).toFixed(10),CUBEUV_MAX_MIP:`${m}.0`})}const c=t?.fog?.glsl??`
    vec3 at13ApplyFog(vec3 c, vec3 w, vec3 v) { return c; }
  `,d=new D({defines:h,vertexShader:ce,fragmentShader:de.replace("//__FOG__",c),transparent:!0,depthWrite:!1,depthTest:!0,side:N,blending:te,premultipliedAlpha:!0,uniforms:{...i,uLightMat:r,uBaseWidth:{value:.0011},uCenter:{value:new f},uAoRange:{value:new S(.35,1.55)},uKeyPos:{value:new f},uKeyCol:{value:new y},uKeyDir:{value:new f(0,-1,0)},uKeyCone:{value:new S(.7,.99)},uRimPos:{value:new f},uRimCol:{value:new y},uRimDir:{value:new f(0,-1,0)},uRimCone:{value:new S(.5,.98)},uFillPos:{value:new f},uFillCol:{value:new y},uBase:{value:new y("#1E140E")},uSpecCol1:{value:new y("#FFF7EF")},uSpecCol2:{value:new y("#8A5228")},uBrass:{value:s("brass",13017435)},uTransCol:{value:new y("#7A4322")},uAmbSky:{value:s("skyDim",1581866)},uAmbGround:{value:s("groundDim",723208)},uShift1:{value:-.085},uShift2:{value:.115},uExp1:{value:22},uExp2:{value:17},uSpec1:{value:.09},uSpec2:{value:.15},uJit:{value:.05},uDiffuse:{value:1.15},uLightScale:{value:.175},uAmbInt:{value:.95},uAlphaMul:{value:1},uTipFade:{value:.56},uOsm:{value:null},uOsmScale:{value:1},uShadowK:{value:1.3},uTransK:{value:1.55},uTransPow:{value:7},uTransAmt:{value:1.15},uRimSpec:{value:1.3},uFillAmb:{value:.013},...l?{envMap:{value:l},uEnvInt:{value:.45}}:{}}});t?.applyFog?.(d);const u=new D({vertexShader:fe,fragmentShader:me,transparent:!0,depthTest:!1,depthWrite:!1,side:N,toneMapped:!1,blending:ae,blendSrc:R,blendDst:R,blendSrcAlpha:R,blendDstAlpha:R,uniforms:{...i,uLightMat:r,uBaseWidth:{value:.0011*19},uDensity:{value:1/19},uTipFade:{value:.58}}});return{render:d,osm:u,strandUniforms:i,lightMat:r}}const x=(n,e,t,a)=>n+(e-n)*(1-Math.exp(-t*a)),F=n=>n<0?0:n>1?1:n,b=(n,e,t)=>{const a=F((t-n)/(e-n));return a*a*(3-2*a)},v={x:-.34,y:.92,z:-.45},z=1.34,pe=-1.24,ge=1.58,we=.3,ye=1.1,xe=4.25,be=[.055,.175,.31,.045],_e=[1,.52,.36,1.34],Se=[.1,.062,.044,.148],Me=[5.6,5.35,4.9,6.5],Te=[.0052,.0034,.0026,.008],Ce=[1,.7,.88,1],Ae={fall:0,comb:1,braid:2,dissolve:3},Re=.95,k=9,Pe=90;class De{static id="hair";constructor(e){this.ctx=e,this.group=new se,this.group.name="hair",this._w=new P(1,0,0,0),this._wTarget=new P(1,0,0,0),this._forced=null,this._ptr=new f,this._ptrPrev=new f,this._ptrVel=new f,this._ray=new f,this._camPos=new f,this._lightDir=new f,this._massCenter=new f(v.x,v.y-.75,v.z),this._tmp=new f,this._col=new y,this._savedClear=new y,this._scrollF=new f,this._scrollEnv=0,this._ptrEnv=0,this._spin=0,this._sweep=-1.9,this._dtPrev=1/60,this._settled=!1,this._osmDone=!1,this._lastW=new P(-9,-9,-9,-9),this._secCraft=NaN,this._secWork=NaN,this._secTeam=NaN,this._headOff=new S(0,0),this._onQuality=this._onQuality.bind(this)}async init(){this._build(),this.ctx.scene.add(this.group),this.ctx.hair={group:this.group,setMode:e=>this.setMode(e),uniforms:this.mat.render.uniforms,mesh:this.mesh,weights:this._w,center:this._massCenter,counts:{strands:this.strands,guides:this.guides,segments:this.seg},get texture(){return this.__sim?.texture??null}},this.ctx.hair.__sim=this.sim,this._offQuality=this.ctx.bus.on("quality",this._onQuality)}_readTopology(){const e=this.ctx.quality;this.seg=Math.max(6,e.segments|0),this.maxStrands=Math.max(64,Math.round((e.strands|0)*1.25));const t=Math.max(32,e.simRes|0);this.guides=Math.max(96,Math.min(1400,Math.floor(t*t/this.seg))),this.osmSize=e.tier==="low"?256:384}_readQuality(){const e=this.ctx.quality;this.strands=Math.min(this.maxStrands,Math.max(64,Math.round((e.strands|0)*1.25))),this.iters=e.tier==="high"?5:e.tier==="medium"?4:3,this.osmInstances=Math.min(this.strands,e.tier==="high"?440:300),this.osmEvery=e.tier==="high"||e.tier==="medium"?3:4}_build(){const e=this.ctx;this._readTopology(),this._readQuality();const t=he(this.guides,{thetaMin:pe,thetaMax:ge,phiMin:we,phiMax:ye});this.sim=new le(e.renderer,{seg:this.seg,guides:this.guides,iters:this.iters},t),this.sim.shared.uHead.value.set(v.x,v.y,v.z),this.sim.shared.uHeadR.value=z,this.sim.setLength(xe),this.geo=ue(this.maxStrands,this.seg,this.guides),this.geo.instanceCount=this.strands,this.mat=ve(e,{seg:this.seg,guides:this.guides}),this.mat.render.uniforms.uCenter.value.set(v.x,v.y,v.z),this.mat.render.uniforms.uOsmScale.value=this.strands/this.osmInstances,this._spec1=this.mat.render.uniforms.uSpec1.value,this.mesh=new E(this.geo,this.mat.render),this.mesh.frustumCulled=!1,this.mesh.matrixAutoUpdate=!1,this.mesh.renderOrder=6,this.group.add(this.mesh),this.osmRT=new j(this.osmSize,this.osmSize,{type:G,format:L,minFilter:V,magFilter:V,depthBuffer:!1,stencilBuffer:!1,generateMipmaps:!1,wrapS:_,wrapT:_}),this.osmRT.texture.colorSpace=H,this.mat.render.uniforms.uOsm.value=this.osmRT.texture,this.osmScene=new O,this.osmMesh=new E(this.geo,this.mat.osm),this.osmMesh.frustumCulled=!1,this.osmMesh.matrixAutoUpdate=!1,this.osmScene.add(this.osmMesh);const a=4.2;this.osmCam=new U(-a,a,a,-a,k-4.4,k+4.4);const s=e.env,i=(r,l)=>{if(!r)return;const h=r.angle??.5,c=r.penumbra??.9;l.set(Math.cos(h),Math.cos(h*(1-c)))};i(s?.key,this.mat.render.uniforms.uKeyCone.value),i(s?.rim,this.mat.render.uniforms.uRimCone.value),this.onResize(),this._pushSimUniforms(1/60,0),this.sim.seed(e.renderer);for(let r=0;r<48;r++)this.sim.step(e.renderer,1/60,1/60);this._settled=!0}setMode(e){if(!e||e==="auto"){this._forced=null;return}const t=Ae[e];t!==void 0&&(this._forced=t)}_blend(e){const t=this._w;return e[0]*t.x+e[1]*t.y+e[2]*t.z+e[3]*t.w}_measureSections(){const e=t=>{const a=document.getElementById(t);return a?a.getBoundingClientRect().top+window.scrollY:NaN};this._secCraft=e("craft"),this._secWork=e("work"),this._secTeam=e("team")}_updateWeights(e){const t=this._wTarget;if(this._forced===null){let r,l,h;const c=this.ctx.sizes?.h||window.innerHeight||1,d=this.ctx.scroll.y??0;if(Number.isFinite(this._secCraft)&&Number.isFinite(this._secWork)&&Number.isFinite(this._secTeam))r=b(this._secCraft-c*.6,this._secCraft+c*.2,d),l=b(this._secWork-c*.8,this._secWork+c*.1,d),h=b(this._secTeam-c*.8,this._secTeam+c*.1,d);else{const u=F(this.ctx.scroll.progress);r=b(.1,.3,u),l=b(.36,.56,u),h=b(.64,.84,u)}l=Math.min(l,r),h=Math.min(h,l),t.set(1-r,r-l,l-h,h)}else t.set(0,0,0,0),this._forced===0?t.x=1:this._forced===1?t.y=1:this._forced===2?t.z=1:t.w=1;const a=this.ctx.reducedMotion?40:2.6,s=this._w;s.x=x(s.x,t.x,a,e),s.y=x(s.y,t.y,a,e),s.z=x(s.z,t.z,a,e),s.w=x(s.w,t.w,a,e);const i=s.x+s.y+s.z+s.w||1;s.multiplyScalar(1/i)}_updatePointer(e){const t=this.ctx,a=t.camera;if(t.reducedMotion||!t.pointer.inside){this._ptr.set(0,0,999),this._ptrVel.set(0,0,0),this._ptrEnv=x(this._ptrEnv,0,4,e);return}a.getWorldPosition(this._camPos),this._ray.set(t.pointer.sx,t.pointer.sy,.5).unproject(a).sub(this._camPos);const s=v.z+z*.6,i=Math.abs(this._ray.z)<1e-4?1e-4:this._ray.z,r=(s-this._camPos.z)/i;this._tmp.copy(this._ray).multiplyScalar(r).add(this._camPos),this._ptr.z>900&&this._ptr.copy(this._tmp),this._ptrPrev.copy(this._ptr),this._ptr.copy(this._tmp),this._tmp.subVectors(this._ptr,this._ptrPrev).multiplyScalar(1/Math.max(e,.001)),this._ptrVel.x=x(this._ptrVel.x,this._tmp.x,9,e),this._ptrVel.y=x(this._ptrVel.y,this._tmp.y,9,e),this._ptrVel.z=x(this._ptrVel.z,this._tmp.z,9,e);const l=this._ptrVel.length();l>9&&this._ptrVel.multiplyScalar(9/l),this._ptrEnv=x(this._ptrEnv,1,3.2,e)}_pushSimUniforms(e,t){const a=this.ctx,s=this.sim.integrateMat.uniforms,i=this.sim.shared,r=a.reducedMotion;i.uW.value.copy(this._w),i.uSweep.value=this._sweep,i.uSpin.value=this._spin,i.uTwist.value=2.9,s.uTime.value=r?3:t,s.uDrag.value=Math.pow(.9865,Math.min(e,1/20)*60),s.uGravity.value=this._blend(Me),s.uWindAmp.value=r?0:this._blend(_e),s.uGsc.value=this._blend(be)*(r?3:1),r?(s.uPtrPush.value=0,s.uPtrDrag.value=0,s.uScrollF.value.set(0,0,0)):(s.uPtrPush.value=5.2*this._ptrEnv,s.uPtrDrag.value=8.5*this._ptrEnv,s.uPtrPos.value.copy(this._ptr),s.uPtrVel.value.copy(this._ptrVel),s.uScrollF.value.copy(this._scrollF));const l=a.fluid?.texture??null;l?(s.uFluid.value=l,s.uHasFluid.value=1,s.uViewProj.value.multiplyMatrices(a.camera.projectionMatrix,a.camera.matrixWorldInverse),s.uCamRight.value.setFromMatrixColumn(a.camera.matrixWorld,0),s.uCamUp.value.setFromMatrixColumn(a.camera.matrixWorld,1)):s.uHasFluid.value=0}_pushRenderUniforms(){const t=this.ctx.env,a=this.mat.render.uniforms;this.mat.strandUniforms.uPos.value=this.sim.texture,this.mat.strandUniforms.uClump.value=this._blend(Se),this.mat.strandUniforms.uFly.value=this._blend(Te),a.uSpec1.value=this._spec1*this._blend(Ce),t?.key&&(a.uKeyPos.value.copy(t.key.position),a.uKeyCol.value.copy(t.key.color).multiplyScalar(t.key.intensity),this._tmp.copy(t.key.target.position).sub(t.key.position).normalize(),a.uKeyDir.value.copy(this._tmp)),t?.rim&&(a.uRimPos.value.copy(t.rim.position),a.uRimCol.value.copy(t.rim.color).multiplyScalar(t.rim.intensity*Re),this._tmp.copy(t.rim.target.position).sub(t.rim.position).normalize(),a.uRimDir.value.copy(this._tmp)),t?.fill&&(a.uFillPos.value.copy(t.fill.position),a.uFillCol.value.copy(t.fill.color).multiplyScalar(t.fill.intensity));const s=.3-this._w.z*.2,i=z*1.06-this._w.z*.95+this._w.w*.95;a.uAoRange.value.set(s,i)}_renderOsm(){const e=this.ctx,t=e.env,a=e.renderer;t?.key?this._lightDir.copy(t.key.position).sub(this._massCenter).normalize():this._lightDir.set(-.48,.85,.23),this.osmCam.position.copy(this._massCenter).addScaledVector(this._lightDir,k),this.osmCam.up.set(0,1,0),this.osmCam.lookAt(this._massCenter),this.osmCam.updateMatrixWorld(),this.osmCam.matrixWorldInverse.copy(this.osmCam.matrixWorld).invert(),this.mat.lightMat.value.multiplyMatrices(this.osmCam.projectionMatrix,this.osmCam.matrixWorldInverse);const s=a.getRenderTarget();a.getClearColor(this._savedClear);const i=a.getClearAlpha();this.geo.instanceCount=this.osmInstances,a.setClearColor(0,0),a.setRenderTarget(this.osmRT),a.render(this.osmScene,this.osmCam),a.setRenderTarget(s),a.setClearColor(this._savedClear,i),this.geo.instanceCount=this.strands}update(e,t){const a=this.ctx,s=a.reducedMotion,i=Math.min(Math.max(e,1/240),1/30);a.frame%Pe===0&&this._measureSections(),this._updateWeights(e);let r;if(Number.isFinite(this._secCraft)&&Number.isFinite(this._secWork)){const d=a.sizes?.h||1,u=a.scroll.y??0,p=this._secCraft-d*.5,m=this._secWork-d*.9;r=b(p,Math.max(m,p+1),u)}else r=b(.12,.52,F(a.scroll.progress));this._sweep=-1.9+r*3.8+(s?0:Math.sin(t*.21)*.22),s||(this._spin+=i*.44);const l=s?0:Math.max(-4,Math.min(4,a.scroll.velocity*3.4));this._scrollEnv=x(this._scrollEnv,l,Math.abs(l)>Math.abs(this._scrollEnv)?14:1.7,e),this._scrollF.set(this._scrollEnv*1.15,this._scrollEnv*3.1,this._scrollEnv*-.5),this._updatePointer(e),this._pushSimUniforms(i,t);let h=!0;if(s){const d=this._w,u=this._lastW;h=Math.abs(d.x-u.x)+Math.abs(d.y-u.y)+Math.abs(d.z-u.z)+Math.abs(d.w-u.w)>1e-4,h&&u.copy(d)}h&&(this.sim.step(a.renderer,i,this._dtPrev),this._dtPrev=i),this._pushRenderUniforms();const c=this._w.w>.9?this.osmEvery*4:this.osmEvery;(a.frame%c===0||!this._osmDone)&&(this._renderOsm(),this._osmDone=!0)}_onQuality(){this._readQuality(),this.geo&&(this.geo.instanceCount=this.strands),this.sim&&(this.sim.iters=this.iters),this.mat&&(this.mat.render.uniforms.uOsmScale.value=this.strands/this.osmInstances),this.ctx.hair&&(this.ctx.hair.counts={strands:this.strands,guides:this.guides,segments:this.seg})}_applyFraming(){const e=this.ctx.camera,t=e?e.aspect:1.6,a=F((.85-t)/(.85-.45));this._headOff.set(.5*a,-.3*a);const s=v.x+this._headOff.x,i=v.y+this._headOff.y;this.sim&&this.sim.shared.uHead.value.set(s,i,v.z),this.mat&&this.mat.render.uniforms.uCenter.value.set(s,i,v.z),this._massCenter.set(s,i-.75,v.z)}onResize(){const e=this.ctx;this._applyFraming();const t=Math.max(2,e.renderer?.domElement?.height||2),a=e.camera?.fov??38;this.mat&&(this.mat.strandUniforms.uPxPerWorld.value=2*Math.tan(a*Math.PI/360)/t),this._measureSections()}_teardown(){this.mesh&&this.group.remove(this.mesh),this.osmScene&&this.osmMesh&&this.osmScene.remove(this.osmMesh),this.geo?.dispose(),this.mat?.render.dispose(),this.mat?.osm.dispose(),this.osmRT?.dispose(),this.sim?.dispose(),this.geo=null,this.mat=null,this.osmRT=null,this._osmDone=!1,this.sim=null,this.mesh=null,this.osmMesh=null}dispose(){this._offQuality?.(),this._offQuality=null,this._teardown(),this.ctx.scene.remove(this.group),this.ctx.hair&&(this.ctx.hair=null)}}export{De as default};
