import{r as Se,$ as we,y as le,E as be,j as C,k as Ue,S as ye,O as Me,q as Te,w as de,d as me,o as De,N as ne,a8 as Ee,a9 as Re,aa as ze,x as ue,V as T,i as H,Y as I,s as Le,e as Ae,U as pe,ab as Ne,X as Ge,ac as Oe,n as Pe,_ as _e,R as We,ad as ge,A as Be}from"./three-sQPBrRwf.js";class He{constructor(){const e=new we;e.setAttribute("position",new le(new Float32Array([-1,-1,0,3,-1,0,-1,3,0]),3)),e.setAttribute("uv",new le(new Float32Array([0,0,2,0,0,2]),2)),e.boundingSphere=new be(new C,4),this.geo=e,this.mesh=new Ue(e,null),this.mesh.frustumCulled=!1,this.mesh.matrixAutoUpdate=!1,this.scene=new ye,this.scene.add(this.mesh),this.camera=new Me(-1,1,1,-1,0,1)}run(e,t,s){this.mesh.material=t,e.setRenderTarget(s||null),e.render(this.scene,this.camera)}dispose(){this.geo.dispose(),this.scene.clear(),this.mesh.material=null}}const Ce={format:De,minFilter:me,magFilter:me,wrapS:de,wrapT:de,depthBuffer:!1,stencilBuffer:!1,generateMipmaps:!1};function P(S,e,t=Se){const s=new Te(Math.max(1,S|0),Math.max(1,e|0),{...Ce,type:t});return s.texture.colorSpace=ne,s.texture.generateMipmaps=!1,s}function qe(S,e){const t=new Te(Math.max(1,S|0),Math.max(1,e|0),{...Ce,type:Se,depthBuffer:!0});t.texture.colorSpace=ne,t.texture.generateMipmaps=!1;const s=new Ee(Math.max(1,S|0),Math.max(1,e|0));return s.format=Re,s.type=ze,s.minFilter=ue,s.magFilter=ue,s.generateMipmaps=!1,t.depthTexture=s,t}const V=`
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`,J=`
float at13Luma(vec3 c) { return dot(c, vec3(0.2126, 0.7152, 0.0722)); }
`,Fe=`
float at13Ign(vec2 p) {
  return fract(52.9829189 * fract(dot(p, vec2(0.06711056, 0.00583715))));
}
`,Ze=`
vec3 at13RRTAndODTFit(vec3 v) {
  vec3 a = v * (v + 0.0245786) - 0.000090537;
  vec3 b = v * (0.983729 * v + 0.4329510) + 0.238081;
  return a / b;
}
vec3 at13ACES(vec3 color, float exposure) {
  const mat3 IN = mat3(
    0.59719, 0.07600, 0.02840,
    0.35458, 0.90834, 0.13383,
    0.04823, 0.01566, 0.83777
  );
  const mat3 OUT = mat3(
     1.60475, -0.10208, -0.00327,
    -0.53108,  1.10813, -0.07276,
    -0.07367, -0.00605,  1.07602
  );
  color *= exposure / 0.6;
  color = IN * color;
  color = at13RRTAndODTFit(color);
  color = OUT * color;
  return clamp(color, 0.0, 1.0);
}
`,Ie=`
vec3 at13LinearToSRGB(vec3 c) {
  vec3 lo = c * 12.92;
  vec3 hi = 1.055 * pow(max(c, vec3(1e-5)), vec3(0.4166666667)) - 0.055;
  return mix(hi, lo, step(c, vec3(0.0031308)));
}
vec3 at13SRGBToLinear(vec3 c) {
  vec3 lo = c / 12.92;
  vec3 hi = pow((c + 0.055) / 1.055, vec3(2.4));
  return mix(hi, lo, step(c, vec3(0.04045)));
}
`,Ve=`
float at13ViewZ(float d, float near, float far) {
  float z = d * 2.0 - 1.0;
  return (2.0 * near * far) / (far + near - z * (far - near));
}
`,Ke=`
precision highp float;
varying vec2 vUv;
uniform sampler2D uTex;
uniform vec2 uTexel;       // texel size of the SOURCE
uniform float uStep;       // 1 = 2x downsample, 2 = 4x downsample
uniform float uExposure;   // the composite's exposure, so the cut tracks it
uniform float uThreshold;
uniform float uKnee;
uniform float uClamp;
${J}

vec3 fetch(vec2 uv) { return min(texture2D(uTex, uv).rgb, vec3(uClamp)); }
// Karis: weight each box by 1/(1+luma) so a single 40.0 pixel cannot dominate
float kw(vec3 c) { return 1.0 / (1.0 + at13Luma(c)); }

void main() {
  vec2 t = uTexel * uStep;
  vec3 a = fetch(vUv + t * vec2(-2.0,  2.0));
  vec3 b = fetch(vUv + t * vec2( 0.0,  2.0));
  vec3 c = fetch(vUv + t * vec2( 2.0,  2.0));
  vec3 d = fetch(vUv + t * vec2(-2.0,  0.0));
  vec3 e = fetch(vUv);
  vec3 f = fetch(vUv + t * vec2( 2.0,  0.0));
  vec3 g = fetch(vUv + t * vec2(-2.0, -2.0));
  vec3 h = fetch(vUv + t * vec2( 0.0, -2.0));
  vec3 i = fetch(vUv + t * vec2( 2.0, -2.0));
  vec3 j = fetch(vUv + t * vec2(-1.0,  1.0));
  vec3 k = fetch(vUv + t * vec2( 1.0,  1.0));
  vec3 l = fetch(vUv + t * vec2(-1.0, -1.0));
  vec3 m = fetch(vUv + t * vec2( 1.0, -1.0));

  vec3 g0 = (j + k + l + m) * 0.25;
  vec3 g1 = (a + b + d + e) * 0.25;
  vec3 g2 = (b + c + e + f) * 0.25;
  vec3 g3 = (d + e + g + h) * 0.25;
  vec3 g4 = (e + f + h + i) * 0.25;
  float w0 = kw(g0) * 0.5, w1 = kw(g1) * 0.125, w2 = kw(g2) * 0.125;
  float w3 = kw(g3) * 0.125, w4 = kw(g4) * 0.125;
  vec3 col = (g0 * w0 + g1 * w1 + g2 * w2 + g3 * w3 + g4 * w4) / max(w0 + w1 + w2 + w3 + w4, 1e-5);

  // Soft-knee threshold: a quadratic shoulder through the knee so nothing pops
  // on or off as a highlight drifts across the cut.
  //
  // The cut is measured on the EXPOSED value, not the raw one. This scene's
  // linear radiances mostly sit under 1.0 — env's rig is calibrated so that
  // ACES at the end of the chain lands them where they belong — so a
  // threshold of "1.0" picks up literally nothing, which is exactly the bug
  // this shipped with first. Scaling by the composite's exposure means
  // retuning exposure cannot silently switch bloom off.
  float br = max(col.r, max(col.g, col.b)) * uExposure;
  float knee = uThreshold * uKnee + 1e-5;
  float soft = clamp(br - uThreshold + knee, 0.0, 2.0 * knee);
  soft = soft * soft / (4.0 * knee);
  col *= max(soft, br - uThreshold) / max(br, 1e-5);   // dimensionless factor

  gl_FragColor = vec4(max(col, vec3(0.0)), 1.0);
}
`,$e=`
precision highp float;
varying vec2 vUv;
uniform sampler2D uTex;
uniform vec2 uTexel;
vec3 fetch(vec2 uv) { return texture2D(uTex, uv).rgb; }
void main() {
  vec2 t = uTexel;
  vec3 a = fetch(vUv + t * vec2(-2.0,  2.0));
  vec3 b = fetch(vUv + t * vec2( 0.0,  2.0));
  vec3 c = fetch(vUv + t * vec2( 2.0,  2.0));
  vec3 d = fetch(vUv + t * vec2(-2.0,  0.0));
  vec3 e = fetch(vUv);
  vec3 f = fetch(vUv + t * vec2( 2.0,  0.0));
  vec3 g = fetch(vUv + t * vec2(-2.0, -2.0));
  vec3 h = fetch(vUv + t * vec2( 0.0, -2.0));
  vec3 i = fetch(vUv + t * vec2( 2.0, -2.0));
  vec3 j = fetch(vUv + t * vec2(-1.0,  1.0));
  vec3 k = fetch(vUv + t * vec2( 1.0,  1.0));
  vec3 l = fetch(vUv + t * vec2(-1.0, -1.0));
  vec3 m = fetch(vUv + t * vec2( 1.0, -1.0));
  vec3 col = e * 0.125;
  col += (a + c + g + i) * 0.03125;
  col += (b + d + f + h) * 0.0625;
  col += (j + k + l + m) * 0.125;
  gl_FragColor = vec4(col, 1.0);
}
`,je=`
precision highp float;
varying vec2 vUv;
uniform sampler2D uTex;
uniform vec2 uTexel;       // texel size of the SOURCE (the smaller mip)
uniform float uRadius;
void main() {
  vec2 t = uTexel * uRadius;
  vec3 a = texture2D(uTex, vUv + vec2(-t.x,  t.y)).rgb;
  vec3 b = texture2D(uTex, vUv + vec2( 0.0,  t.y)).rgb;
  vec3 c = texture2D(uTex, vUv + vec2( t.x,  t.y)).rgb;
  vec3 d = texture2D(uTex, vUv + vec2(-t.x,  0.0)).rgb;
  vec3 e = texture2D(uTex, vUv).rgb;
  vec3 f = texture2D(uTex, vUv + vec2( t.x,  0.0)).rgb;
  vec3 g = texture2D(uTex, vUv + vec2(-t.x, -t.y)).rgb;
  vec3 h = texture2D(uTex, vUv + vec2( 0.0, -t.y)).rgb;
  vec3 i = texture2D(uTex, vUv + vec2( t.x, -t.y)).rgb;
  vec3 col = e * 0.25;
  col += (b + d + f + h) * 0.125;
  col += (a + c + g + i) * 0.0625;
  gl_FragColor = vec4(col, 1.0);
}
`,Qe=`
precision highp float;
varying vec2 vUv;
uniform sampler2D uTex;
uniform vec2 uTexel;
uniform float uStride;
uniform float uCut;        // extra threshold, first pass only
uniform float uFirst;
${J}
void main() {
  vec3 sum = vec3(0.0);
  float wsum = 0.0;
  for (int i = -6; i <= 6; i++) {
    float fi = float(i);
    float w = exp(-fi * fi / 14.0);
    vec3 s = texture2D(uTex, vUv + vec2(fi * uStride * uTexel.x, 0.0)).rgb;
    if (uFirst > 0.5) s = max(s - vec3(uCut), vec3(0.0));
    sum += s * w;
    wsum += w;
  }
  gl_FragColor = vec4(sum / wsum, 1.0);
}
`;class Xe{constructor(e,t){this.ctx=e,this.fsq=t,this.levels=6,this.mips=[],this.streakA=null,this.streakB=null,this.uPre={uTex:{value:null},uTexel:{value:new T},uStep:{value:2},uExposure:{value:1.42},uThreshold:{value:.3},uKnee:{value:.72},uClamp:{value:42}},this.uDown={uTex:{value:null},uTexel:{value:new T}},this.uUp={uTex:{value:null},uTexel:{value:new T},uRadius:{value:1}},this.uStreak={uTex:{value:null},uTexel:{value:new T},uStride:{value:1},uCut:{value:.02},uFirst:{value:1}};const s=(i,a,c)=>new H({uniforms:a,vertexShader:V,fragmentShader:i,depthTest:!1,depthWrite:!1,toneMapped:!1,blending:c||I});this.mPre=s(Ke,this.uPre),this.mDown=s($e,this.uDown),this.mUp=s(je,this.uUp,Le),this.mStreak=s(Qe,this.uStreak)}levelsForTier(e){return e==="low"?3:e==="medium"?4:5}get _dead(){return!!this.ctx.contextLost}resize(e,t,s){const i=this._dead;this.levels=this.levelsForTier(s);let a=Math.max(2,e>>2),c=Math.max(2,t>>2);for(let x=0;x<this.levels;x++)!this.mips[x]||i?this.mips[x]=P(a,c):this.mips[x].setSize(a,c),a=Math.max(2,a>>1),c=Math.max(2,c>>1);if(!i)for(let x=this.levels;x<this.mips.length;x++)this.mips[x].dispose();this.mips.length=this.levels;const u=this.mips[0],h=u.width,p=u.height;!this.streakA||i?(this.streakA=P(h,p),this.streakB=P(h,p)):(this.streakA.setSize(h,p),this.streakB.setSize(h,p))}render(e,t,s,i,a){const c=this.fsq;this.uPre.uTex.value=t,this.uPre.uTexel.value.set(1/s,1/i),c.run(e,this.mPre,this.mips[0]);for(let u=1;u<this.levels;u++){const h=this.mips[u-1];this.uDown.uTex.value=h.texture,this.uDown.uTexel.value.set(1/h.width,1/h.height),c.run(e,this.mDown,this.mips[u])}a&&(this.uStreak.uTex.value=this.mips[0].texture,this.uStreak.uTexel.value.set(1/this.streakA.width,1/this.streakA.height),this.uStreak.uStride.value=1,this.uStreak.uFirst.value=1,c.run(e,this.mStreak,this.streakA),this.uStreak.uTex.value=this.streakA.texture,this.uStreak.uStride.value=8,this.uStreak.uFirst.value=0,c.run(e,this.mStreak,this.streakB));for(let u=this.levels-1;u>0;u--){const h=this.mips[u];this.uUp.uTex.value=h.texture,this.uUp.uTexel.value.set(1/h.width,1/h.height),c.run(e,this.mUp,this.mips[u-1])}return this.mips[0].texture}dispose(){for(const e of this.mips)e.dispose();this.mips.length=0,this.streakA?.dispose(),this.streakB?.dispose(),this.mPre.dispose(),this.mDown.dispose(),this.mUp.dispose(),this.mStreak.dispose()}}const Je=`
precision highp float;
varying vec2 vUv;
uniform sampler2D uColor;
uniform sampler2D uDepth;
uniform sampler2D uHairZ;
uniform vec2 uTexel;        // full-res texel
uniform vec2 uHairTexel;    // texel of the quarter-res hair mask
uniform float uNear;
uniform float uFar;
uniform float uFocus;
uniform float uCocScale;
uniform float uMaxNear;
uniform float uMaxFar;
uniform float uField;       // field curvature: defocus that grows radially
uniform vec2 uFieldDead;    // x = radius² of the flat core, y = renormaliser
uniform vec2 uAspect;
uniform float uHasHair;
${Ve}

float sceneZ(vec2 uv) {
  float raw = texture2D(uDepth, uv).x;
  return raw >= 0.999995 ? uFar : at13ViewZ(raw, uNear, uFar);
}

float cocFromZ(float z) {
  float c = uCocScale * (z - uFocus) / max(z, 1e-3);
  return c < 0.0 ? max(c, -1.0) * uMaxNear : min(c, 1.0) * uMaxFar;
}

void main() {
  vec2 o = uTexel * 0.5;
  vec3 c0 = texture2D(uColor, vUv + vec2(-o.x, -o.y)).rgb;
  vec3 c1 = texture2D(uColor, vUv + vec2( o.x, -o.y)).rgb;
  vec3 c2 = texture2D(uColor, vUv + vec2(-o.x,  o.y)).rgb;
  vec3 c3 = texture2D(uColor, vUv + vec2( o.x,  o.y)).rgb;
  vec3 col = (c0 + c1 + c2 + c3) * 0.25;

  // nearest hair node under this texel, dilated by one half-res texel so the
  // mask edge is a gradient rather than a staircase of point sprites
  float zh = 1.0e6;
  if (uHasHair > 0.5) {
    vec2 t = uHairTexel;
    float iz = texture2D(uHairZ, vUv).r;
    iz = max(iz, texture2D(uHairZ, vUv + vec2( t.x,  t.y)).r);
    iz = max(iz, texture2D(uHairZ, vUv + vec2(-t.x,  t.y)).r);
    iz = max(iz, texture2D(uHairZ, vUv + vec2( t.x, -t.y)).r);
    iz = max(iz, texture2D(uHairZ, vUv + vec2(-t.x, -t.y)).r);
    if (iz > 1.0e-4) zh = 1.0 / iz;
  }

  float a0 = cocFromZ(min(sceneZ(vUv + vec2(-o.x, -o.y)), zh));
  float a1 = cocFromZ(min(sceneZ(vUv + vec2( o.x, -o.y)), zh));
  float a2 = cocFromZ(min(sceneZ(vUv + vec2(-o.x,  o.y)), zh));
  float a3 = cocFromZ(min(sceneZ(vUv + vec2( o.x,  o.y)), zh));

  // keep the NEAREST of the four. Two reasons, both load-bearing: losing
  // near-field coverage at a downsample is what puts a hard edge around a
  // defocused foreground, and on a texel straddling the subject's silhouette
  // it picks the SHARP side, so the background blur cannot eat into the hair.
  float c = min(min(a0, a1), min(a2, a3));

  // Field curvature. A fast lens does not have a flat focal plane: the corners
  // focus in front of the centre and never come in. Adding a radial floor to
  // the far CoC is that, and it earns its place three times over here — it
  // melts the rain where the rain is loudest (the edges), it pulls the eye to
  // the middle without painting a mask over anything, and it makes the frame
  // read as glass rather than as a render. It is the one non-physical term in
  // this pass and it is the most photographic thing in it.
  //
  // With a DEAD ZONE, though. A pure r² floor starts blurring one pixel out
  // from the optical centre, so a frame whose subject is a head-sized mass
  // filling the middle third had no critically sharp region anywhere — the
  // whole picture read as mud with no plane for the eye to land on, which is
  // the opposite of what a fast lens does (it is *brutally* sharp on axis).
  // Inside uFieldDead.x the term is exactly zero; outside it the ramp is
  // renormalised (uFieldDead.y) so the corners melt by precisely the amount
  // authored in uField. Sharp core, same edges.
  vec2 rp = (vUv - 0.5) * uAspect;
  float fr2 = max(dot(rp, rp) - uFieldDead.x, 0.0) * uFieldDead.y;
  c = max(c, uField * fr2);

  gl_FragColor = vec4(col, c);
}
`,Ye=`
precision highp float;
varying vec2 vUv;
uniform sampler2D uTex;      // rgb = colour, a = signed CoC in half-res px
uniform vec2 uTexel;         // half-res texel
uniform float uRadius;       // hard ceiling on the search
uniform float uNearSearch;   // floor on the search, so near-field can reach in
uniform float uHex;          // 0 = circular aperture, 1 = hexagonal
uniform float uJitter;
${Fe}

const float GA = 2.39996323;
const float SIXTY = 1.04719755;

// map the unit disc onto a hexagon — a real iris has blades
float apertureScale(float ang) {
  float a = mod(ang, SIXTY) - 0.52359878;
  return mix(1.0, 0.86602540 / cos(a), uHex);
}

void main() {
  vec4 cs = texture2D(uTex, vUv);
  float cocC = cs.a;

  vec3 farSum = cs.rgb;
  float farW = 1.0;
  vec3 nearSum = vec3(0.0);
  float nearW = 0.0;

  float rot = at13Ign(gl_FragCoord.xy + uJitter) * 6.2831853;
  // search only as far as this pixel can possibly be reached from: a sharp
  // pixel still has to look out to the largest near-field radius, but a
  // background pixel gathers over its own disc and no further, which is what
  // keeps the tap density up instead of scattering 32 taps over the worst case
  float rMax = min(uRadius, max(abs(cocC), uNearSearch));

  for (int i = 0; i < DOF_TAPS; i++) {
    float fi = float(i) + 0.5;
    float rn = sqrt(fi / float(DOF_TAPS));
    float ang = fi * GA + rot;
    float r = rn * rMax * apertureScale(ang);
    vec2 off = vec2(cos(ang), sin(ang)) * r;
    vec4 s = texture2D(uTex, vUv + off * uTexel);
    float ac = abs(s.a);
    float reach = clamp(ac - r + 1.0, 0.0, 1.0);
    float isNear = step(s.a, -0.0001);
    nearSum += s.rgb * (reach * isNear);
    nearW += reach * isNear;
    float wf = reach * (1.0 - isNear);
    farSum += s.rgb * wf;
    farW += wf;
  }

  vec3 far = farSum / max(farW, 1e-4);
  vec3 near = nearSum / max(nearW, 1e-4);
  float nearA = clamp(nearW / (float(DOF_TAPS) * 0.45), 0.0, 1.0);
  vec3 col = mix(far, near, nearA);

  float farA = smoothstep(0.55, 1.60, cocC);
  gl_FragColor = vec4(col, max(nearA, farA));
}
`;class et{constructor(e,t){this.ctx=e,this.fsq=t,this.rtCoc=null,this.rtBlur=null,this.w=2,this.h=2,this.uCoc={uColor:{value:null},uDepth:{value:null},uHairZ:{value:null},uTexel:{value:new T},uHairTexel:{value:new T},uNear:{value:.1},uFar:{value:120},uFocus:{value:7},uCocScale:{value:1.15},uMaxNear:{value:5},uMaxFar:{value:3.1},uField:{value:4.3},uFieldDead:{value:new T(.16,1)},uAspect:{value:new T(1.6,1)},uHasHair:{value:0}},this.uGather={uTex:{value:null},uTexel:{value:new T},uRadius:{value:5},uNearSearch:{value:2.8},uHex:{value:.4},uJitter:{value:0}},this.mCoc=new H({uniforms:this.uCoc,vertexShader:V,fragmentShader:Je,depthTest:!1,depthWrite:!1,toneMapped:!1,blending:I}),this.mGather=new H({uniforms:this.uGather,vertexShader:V,fragmentShader:Ye,defines:{DOF_TAPS:24},depthTest:!1,depthWrite:!1,toneMapped:!1,blending:I}),this.nearCss=5,this.farCss=3.1,this.fieldCss=4.3}setTaps(e){this.mGather.defines.DOF_TAPS!==e&&(this.mGather.defines.DOF_TAPS=e,this.mGather.needsUpdate=!0)}resize(e,t,s,i){this.w=Math.max(2,e>>1),this.h=Math.max(2,t>>1);const a=!!this.ctx.contextLost;!this.rtCoc||a?(this.rtCoc=P(this.w,this.h),this.rtBlur=P(this.w,this.h)):(this.rtCoc.setSize(this.w,this.h),this.rtBlur.setSize(this.w,this.h));const c=e*t/1e6;this.setTaps(s==="high"&&c<=3?20:16);const u=Math.max(.5,(i||1)*.5);this.uCoc.uMaxNear.value=this.nearCss*u,this.uCoc.uMaxFar.value=this.farCss*u,this.uGather.uRadius.value=Math.max(this.uCoc.uMaxNear.value,this.uCoc.uMaxFar.value),this.uGather.uNearSearch.value=this.uCoc.uMaxNear.value*.55,this.uCoc.uField.value=this.fieldCss*u;const h=e/Math.max(1,t);this.uCoc.uAspect.value.set(h,1);const p=.25*(h*h+1),x=Math.min(p*.55,.3*h/Math.PI);this.uCoc.uFieldDead.value.set(x,p/Math.max(p-x,.001))}render(e,t,s,i,a,c,u,h){return this.uCoc.uColor.value=t.texture,this.uCoc.uDepth.value=t.depthTexture,this.uCoc.uHairZ.value=c||null,this.uCoc.uHasHair.value=c?1:0,c&&this.uCoc.uHairTexel.value.set(1/(u||2),1/(h||2)),this.uCoc.uTexel.value.set(1/s,1/i),this.fsq.run(e,this.mCoc,this.rtCoc),this.uGather.uTex.value=this.rtCoc.texture,this.uGather.uTexel.value.set(1/this.w,1/this.h),this.uGather.uJitter.value=a,this.fsq.run(e,this.mGather,this.rtBlur),this.rtBlur.texture}dispose(){this.rtCoc?.dispose(),this.rtBlur?.dispose(),this.mCoc.dispose(),this.mGather.dispose()}}const re=3,tt=`
precision highp float;
uniform sampler2D uPos;
uniform float uPointSize;
uniform float uSegStep;
uniform float uRefZ;
varying float vInvZ;
void main() {
  // position = (u of node n, v of guide, t toward node n+1)
  vec3 p0 = texture2D(uPos, position.xy).xyz;
  vec3 p1 = texture2D(uPos, vec2(position.x + uSegStep, position.y)).xyz;
  vec3 wp = mix(p0, p1, position.z);
  vec4 mv = modelViewMatrix * vec4(wp, 1.0);
  gl_Position = projectionMatrix * mv;
  float z = max(-mv.z, 0.05);
  vInvZ = 1.0 / z;
  gl_PointSize = clamp(uPointSize * (uRefZ / z), uPointSize * 0.5, uPointSize * 2.5);
}
`,st=`
precision highp float;
varying float vInvZ;
void main() {
  // round the sprite off so the mask edge is not a grid of squares
  vec2 d = gl_PointCoord - 0.5;
  if (dot(d, d) > 0.25) discard;
  gl_FragColor = vec4(vInvZ, 0.0, 0.0, 1.0);
}
`;class it{constructor(e){this.ctx=e,this.rt=null,this.geo=null,this.points=null,this.scene=new ye,this.key="",this.w=2,this.h=2,this._clear=new Ae,this.uniforms={uPos:{value:null},uPointSize:{value:5},uSegStep:{value:1/24},uRefZ:{value:7}},this.mat=new H({uniforms:this.uniforms,vertexShader:tt,fragmentShader:st,depthTest:!1,depthWrite:!1,toneMapped:!1,blending:Ge,blendEquation:Ne,blendSrc:pe,blendDst:pe})}build(){const e=this.ctx.hair,t=e?.counts?.segments|0,s=e?.counts?.guides|0;if(t<2||s<2)return this._clearMesh(),!1;const i=`${t}x${s}`;if(this.key===i&&this.geo)return!0;this._clearMesh();const a=t-1,c=s*(a*re+1),u=new Float32Array(c*3);let h=0;for(let p=0;p<s;p++){const x=(p+.5)/s;for(let R=0;R<a;R++){const k=(R+.5)/t;for(let A=0;A<re;A++)u[h++]=k,u[h++]=x,u[h++]=A/re}u[h++]=(t-.5)/t,u[h++]=x,u[h++]=0}return this.geo=new we,this.geo.setAttribute("position",new le(u,3)),this.geo.boundingSphere=new be(new C,1e6),this.points=new Oe(this.geo,this.mat),this.points.frustumCulled=!1,this.points.matrixAutoUpdate=!1,this.scene.add(this.points),this.uniforms.uSegStep.value=1/t,this.key=i,!0}_clearMesh(){this.points&&this.scene.remove(this.points),this.geo?.dispose(),this.geo=null,this.points=null,this.key=""}resize(e,t,s){this.w=Math.max(2,e>>2),this.h=Math.max(2,t>>2),this.rt?this.rt.setSize(this.w,this.h):this.rt=P(this.w,this.h),this.uniforms.uPointSize.value=Math.max(2.5,9*(s||1)*.25)}render(e){const t=this.ctx.hair?.texture;if(!t||!this.build())return null;this.uniforms.uPos.value=t;const s=this.ctx.hair?.center;s&&(this.uniforms.uRefZ.value=Math.max(1,this.ctx.camera.position.distanceTo(s))),e.getClearColor(this._clear);const i=e.getClearAlpha();return e.setClearColor(0,0),e.setRenderTarget(this.rt),e.clear(!0,!1,!1),e.render(this.scene,this.ctx.camera),e.setClearColor(this._clear,i),this.rt.texture}dispose(){this._clearMesh(),this.rt?.dispose(),this.rt=null,this.mat.dispose(),this.scene.clear()}}const at=`
precision highp float;
varying vec2 vUv;

uniform sampler2D uScene;
uniform sampler2D uDof;
uniform sampler2D uBloom;
uniform sampler2D uStreak;
uniform sampler2D uFluidVel;
uniform sampler2D uFluidDye;
uniform sampler2D uNoise;

uniform vec2 uTexel;
uniform vec2 uAspect;        // (aspect, 1)
uniform float uTime;

uniform float uExposure;
uniform float uBloomStrength;
uniform float uStreakStrength;
uniform vec3 uStreakTint;

uniform float uK1;
uniform float uK2;
uniform float uCorner;       // 1 / distortion at the corner
uniform float uCA;

uniform float uFluidAmt;
uniform vec2 uFluidTexel;
uniform float uFluidLag;

uniform float uVignette;
uniform float uVigK;

uniform vec3 uBlack;
uniform vec3 uBlackGain;
uniform vec3 uSlope;
uniform vec3 uOffset;
uniform vec3 uPower;
uniform vec3 uShadowTint;
uniform float uShadowAmt;
uniform float uShRange;
uniform vec3 uHighTint;
uniform float uHighAmt;
uniform vec2 uHiRange;
uniform float uSCurve;
uniform float uSat;

uniform float uDither;
uniform float uDebug;

${J}
${Fe}
${Ze}
${Ie}

vec3 grade(vec3 c) {
  c = max(c - uBlack, vec3(0.0)) * uBlackGain;
  c = clamp(c * uSlope + uOffset, vec3(0.0), vec3(1.0));
  c = pow(c, uPower);

  float l = at13Luma(c);
  float sh = 1.0 - smoothstep(0.0, uShRange, l);
  c += uShadowTint * (uShadowAmt * sh);
  float hi = smoothstep(uHiRange.x, uHiRange.y, l);
  c = mix(c, c * uHighTint, uHighAmt * hi);

  vec3 s = c * c * (3.0 - 2.0 * clamp(c, 0.0, 1.0));
  c = mix(c, s, uSCurve);

  c = mix(vec3(at13Luma(c)), c, uSat);
  return clamp(c, vec3(0.0), vec3(1.0));
}

void main() {
  vec2 p = (vUv - 0.5) * uAspect;
  float r2 = dot(p, p);

  vec2 duv = vUv;
  float caK = 0.0;
#ifdef USE_LENS
  float d = (1.0 + uK1 * r2 + uK2 * r2 * r2) * uCorner;
  vec2 pd = p * d;
  duv = 0.5 + pd / uAspect;
  caK = uCA * r2;                       // zero in the middle, corners only
#endif

#ifdef USE_FLUID
  vec2 vel = texture2D(uFluidVel, vUv).xy * uFluidTexel;
  vec3 dye = texture2D(uFluidDye, vUv).rgb;
  // 1.5-texel offsets and a magnitude clamp: at 3 texels the gradient aliases
  // the droplet edges and the height saturates into stepped rings — thin
  // bright topographic outlines that read as cling-film, not water. Rolled
  // edges need a short baseline and a bounded slope.
  vec2 e = uTexel * 1.5;
  float dx = texture2D(uFluidDye, vUv + vec2(e.x, 0.0)).r - dye.r;
  float dy = texture2D(uFluidDye, vUv + vec2(0.0, e.y)).r - dye.r;
  // The refraction gain falls with dye mass: the fattest drips would otherwise
  // ring their perimeters with bright topographic double-outlines (the
  // cling-film read). A shallower slope on the big masses dissolves the
  // outline into a soft lens smear while small droplets keep their sparkle.
  vec2 refr = vec2(dx, dy) * mix(0.85, 0.55, smoothstep(0.4, 0.8, dye.r));
  refr *= min(1.0, 0.5 / max(length(refr), 1e-5));
  duv += (vel * uFluidLag + refr) * uFluidAmt * (0.30 + 1.6 * dye.r + 2.2 * dye.g);
#endif

  vec2 dir = duv - vec2(0.5);
  vec2 uvR = duv + dir * caK;
  vec2 uvB = duv - dir * caK;
  // Fringing under a third of a texel is invisible, and it covers the middle
  // of the frame — where, by construction, radial CA is zero. Collapsing to a
  // single fetch there saves two dependent RGBA16F reads over roughly a
  // quarter of a 6.4 megapixel pass.
  bool split = caK > 3.0e-4;

  vec3 col;
#ifdef USE_DOF
  vec4 dG = texture2D(uDof, duv);
  float k = dG.a;
  vec3 sharp = vec3(0.0);
  vec3 soft = vec3(0.0);
  // fully defocused pixels never need the sharp image, and fully sharp pixels
  // never need the blurred one; in this frame that is most of the screen
  if (k < 0.996) {
    sharp = split
      ? vec3(texture2D(uScene, uvR).r, texture2D(uScene, duv).g, texture2D(uScene, uvB).b)
      : texture2D(uScene, duv).rgb;
  }
  if (k > 0.004) {
    soft = split
      ? vec3(texture2D(uDof, uvR).r, dG.g, texture2D(uDof, uvB).b)
      : dG.rgb;
  }
  col = mix(sharp, soft, k);
#else
  col = split
    ? vec3(texture2D(uScene, uvR).r, texture2D(uScene, duv).g, texture2D(uScene, uvB).b)
    : texture2D(uScene, duv).rgb;
#endif

#ifdef USE_BLOOM
  vec3 bl = texture2D(uBloom, duv).rgb;
  col += bl * uBloomStrength;
#endif
#ifdef USE_STREAK
  vec3 st = texture2D(uStreak, duv).rgb;
  col += st * uStreakTint * uStreakStrength;
#endif

#ifdef USE_VIGNETTE
  float vig = 1.0 / pow(1.0 + r2 * uVigK, 2.0);
  col *= mix(1.0, vig, uVignette);
#endif

  col = at13ACES(max(col, vec3(0.0)), uExposure);
  col = at13LinearToSRGB(col);

#ifdef USE_GRADE
  col = grade(col);
#endif

  // Dither BEFORE the 8-bit intermediate, not after. The grade is the only
  // operation on this site that stretches a near-black gradient, so this is
  // the one quantisation that can band, and a single blue-noise sample
  // remapped from uniform to triangular is what stops it. Two samples averaged
  // would also be triangular but would no longer be blue, which is the entire
  // point of paying for the tile.
  float bn = texture2D(uNoise, gl_FragCoord.xy / 64.0).r;
  float td = bn * 2.0 - 1.0;
  td = sign(td) * (1.0 - sqrt(max(1.0 - abs(td), 0.0)));
  col += td * uDither * (1.0 / 255.0);

  if (uDebug > 0.5) {
    if (uDebug < 1.5) col = vec3(texture2D(uBloom, vUv).rgb * 4.0);
    else if (uDebug < 2.5) {
      float c = texture2D(uDof, vUv).a;
      col = vec3(max(c, 0.0), 0.0, max(-c, 0.0));
    } else if (uDebug < 3.5) col = texture2D(uStreak, vUv).rgb * 6.0;
    else if (uDebug < 4.5) col = vec3(length(texture2D(uFluidVel, vUv).xy) * 0.02);
  }

  gl_FragColor = vec4(col, 1.0);
}
`;function ot(S){const e={uScene:{value:null},uDof:{value:null},uBloom:{value:null},uStreak:{value:null},uFluidVel:{value:null},uFluidDye:{value:null},uNoise:{value:null},uTexel:{value:new T(625e-6,.001)},uAspect:{value:new T(1.6,1)},uTime:{value:0},uExposure:{value:1.42},uBloomStrength:{value:.34},uStreakStrength:{value:.42},uStreakTint:{value:new Ae(.86,.9,1)},uK1:{value:.026},uK2:{value:.014},uCorner:{value:1},uCA:{value:.0022},uFluidAmt:{value:1},uFluidTexel:{value:new T(.004878048780487805,.0078125)},uFluidLag:{value:.055},uVignette:{value:.48},uVigK:{value:.3},uBlack:{value:new C(.052,.062,.078)},uBlackGain:{value:new C(1,1,1)},uSlope:{value:new C(1.035,1.005,.958)},uOffset:{value:new C(-.002,.001,.004)},uPower:{value:new C(1,1.01,1.045)},uShadowTint:{value:new C(.007,.026,.03)},uShadowAmt:{value:.9},uShRange:{value:.38},uHighTint:{value:new C(1.075,1,.845)},uHighAmt:{value:.6},uHiRange:{value:new T(.35,.85)},uSCurve:{value:.22},uSat:{value:.8},uDither:{value:1},uDebug:{value:0}},t=new H({uniforms:e,vertexShader:V,fragmentShader:at,defines:{USE_LENS:"",USE_BLOOM:"",USE_STREAK:"",USE_GRADE:"",USE_VIGNETTE:""},depthTest:!1,depthWrite:!1,toneMapped:!1,blending:I}),s=()=>{const i=e.uBlack.value;e.uBlackGain.value.set(1/(1-i.x),1/(1-i.y),1/(1-i.z))};return s(),{mat:t,uniforms:e,syncGain:s}}const rt=`
precision highp float;
varying vec2 vUv;
uniform sampler2D uTex;
uniform sampler2D uNoise;
uniform vec2 uTexel;
uniform float uDpr;
uniform float uSubpix;
uniform float uEdgeThresh;
uniform float uEdgeMin;
uniform float uGrain;
uniform float uGrainScale;
uniform vec2 uGrainOffset;
${J}

float L(vec2 uv) { return at13Luma(texture2D(uTex, uv).rgb); }

vec3 fxaa(vec2 uv) {
  vec3 rgbM = texture2D(uTex, uv).rgb;
  float lM = at13Luma(rgbM);
  float lN = L(uv + vec2(0.0,  uTexel.y));
  float lS = L(uv + vec2(0.0, -uTexel.y));
  float lE = L(uv + vec2( uTexel.x, 0.0));
  float lW = L(uv + vec2(-uTexel.x, 0.0));

  float mx = max(lM, max(max(lN, lS), max(lE, lW)));
  float mn = min(lM, min(min(lN, lS), min(lE, lW)));
  float range = mx - mn;
  if (range < max(uEdgeMin, mx * uEdgeThresh)) return rgbM;

  float lNW = L(uv + vec2(-uTexel.x,  uTexel.y));
  float lNE = L(uv + vec2( uTexel.x,  uTexel.y));
  float lSW = L(uv + vec2(-uTexel.x, -uTexel.y));
  float lSE = L(uv + vec2( uTexel.x, -uTexel.y));

  float lNS = lN + lS;
  float lWE = lW + lE;
  float edgeH = abs(-2.0 * lW + lNW + lSW) + abs(-2.0 * lM + lNS) * 2.0 + abs(-2.0 * lE + lNE + lSE);
  float edgeV = abs(-2.0 * lS + lSW + lSE) + abs(-2.0 * lM + lWE) * 2.0 + abs(-2.0 * lN + lNW + lNE);
  bool horz = edgeH >= edgeV;

  float l1 = horz ? lS : lW;
  float l2 = horz ? lN : lE;
  float g1 = l1 - lM;
  float g2 = l2 - lM;
  bool pick1 = abs(g1) >= abs(g2);
  float gradScaled = 0.25 * max(abs(g1), abs(g2));

  float stepLen = horz ? uTexel.y : uTexel.x;
  float lLocal;
  if (pick1) { stepLen = -stepLen; lLocal = 0.5 * (l1 + lM); }
  else { lLocal = 0.5 * (l2 + lM); }

  vec2 cur = uv;
  if (horz) cur.y += stepLen * 0.5; else cur.x += stepLen * 0.5;

  vec2 off = horz ? vec2(uTexel.x, 0.0) : vec2(0.0, uTexel.y);
  vec2 uv1 = cur - off;
  vec2 uv2 = cur + off;
  float e1 = L(uv1) - lLocal;
  float e2 = L(uv2) - lLocal;
  bool done1 = abs(e1) >= gradScaled;
  bool done2 = abs(e2) >= gradScaled;
  if (!done1) uv1 -= off;
  if (!done2) uv2 += off;

  if (!done1 || !done2) {
    for (int i = 0; i < 7; i++) {
      // 1,1,1.5,2,2,4,8 — the FXAA 3.11 ladder, shortened. Past 7 steps it is
      // only chasing edges longer than ~20 px, and on a frame made of
      // one-pixel filaments and rain streaks there are none.
      float q = i < 2 ? 1.0 : (i == 2 ? 1.5 : (i < 5 ? 2.0 : (i == 5 ? 4.0 : 8.0)));
      if (!done1) { e1 = L(uv1) - lLocal; done1 = abs(e1) >= gradScaled; }
      if (!done2) { e2 = L(uv2) - lLocal; done2 = abs(e2) >= gradScaled; }
      if (done1 && done2) break;
      if (!done1) uv1 -= off * q;
      if (!done2) uv2 += off * q;
    }
  }

  float d1 = horz ? (uv.x - uv1.x) : (uv.y - uv1.y);
  float d2 = horz ? (uv2.x - uv.x) : (uv2.y - uv.y);
  bool near1 = d1 < d2;
  float dist = min(d1, d2);
  float span = d1 + d2;
  float pixOff = -dist / max(span, 1e-6) + 0.5;

  bool lumMLess = lM < lLocal;
  bool good = ((near1 ? e1 : e2) < 0.0) != lumMLess;
  float finalOff = good ? pixOff : 0.0;

  float lAvg = (1.0 / 12.0) * (2.0 * (lNS + lWE) + lNW + lNE + lSW + lSE);
  float sub = clamp(abs(lAvg - lM) / max(range, 1e-6), 0.0, 1.0);
  sub = (-2.0 * sub + 3.0) * sub * sub;
  sub = sub * sub * uSubpix;
  finalOff = max(finalOff, sub);

  vec2 fuv = uv;
  if (horz) fuv.y += finalOff * stepLen; else fuv.x += finalOff * stepLen;
  return texture2D(uTex, fuv).rgb;
}

void main() {
  vec3 col = fxaa(vUv);

  // ---- grain: film, not video. Peaks in the mids, gone in the highlights.
  // ONE octave. A second octave at a fractional scale beat against the first
  // and against the pixel grid, and the result read as a woven texture laid
  // over the picture rather than as grain in it — the give-away that there is
  // a repeating tile underneath. One grain per RENDER pixel, from the
  // blue-noise tile, remapped uniform -> triangular so the distribution is
  // film-like.
  //
  // Per RENDER pixel, not per CSS pixel. Dividing gl_FragCoord by dpr strides
  // the NearestFilter tile at a fractional texel step (0.8 texel/px at GL dpr
  // 1.25), which drops/duplicates texels in a regular lattice; the browser's
  // subsequent canvas upscale then turns that lattice into a woven screen-door
  // moiré across every dark field. Whole-texel addressing keeps the tile
  // blue; the upscale makes each grain ~1.6 device px — coarser emulsion,
  // tile-free.
  //
  // Two weights, summed: the mid-peaked film response, PLUS an inverse
  // luminance-weighted shadow floor. The DOM #grain overlay is blended with
  // overlay mode, which contributes ~2*a*b and vanishes exactly on near-black,
  // so the darkest fields of the page would read as smooth digital video while
  // the photos above them are grained. The shadow term (~1.7% at black,
  // gone by L 0.35) is what keeps the blacks emulsion.
  // TRANSPOSED (.yx), and half a tile along.
  //
  // The four channels of the tile are one field rotated by coprime offsets, so
  // composite's dither (.r at gl_FragCoord.xy/64) and this grain (.g) are pure
  // TRANSLATIONS of each other. Two translations of the same field laid over
  // the same pixels can only add coherently, and whatever residual structure
  // the tile still carries gets counted twice in the blacks — where both terms
  // are at their strongest. Transposing breaks the relationship outright: no
  // translation maps a field onto its own transpose. Still whole-texel
  // addressing (scale 1, a 32-texel offset), which is what the note above
  // requires; the grain itself is unchanged in character.
  vec2 nuv = gl_FragCoord.yx * (uGrainScale / 64.0) + uGrainOffset + 0.5;
  float n = texture2D(uNoise, nuv).g * 2.0 - 1.0;
  float gr = sign(n) * (1.0 - sqrt(max(1.0 - abs(n), 0.0)));
  float l = at13Luma(col);
  float w = uGrain * mix(0.34, 1.0, 4.0 * l * (1.0 - l)) * (1.0 - smoothstep(0.55, 1.0, l))
          + uGrain * 0.45 * (1.0 - smoothstep(0.0, 0.35, l));
  col += gr * w;

  gl_FragColor = vec4(col, 1.0);
}
`;function lt(){const S={uTex:{value:null},uNoise:{value:null},uTexel:{value:new T},uDpr:{value:1},uSubpix:{value:.2},uEdgeThresh:{value:.125},uEdgeMin:{value:.0312},uGrain:{value:.024},uGrainScale:{value:1},uGrainOffset:{value:new T}};return{mat:new H({uniforms:S,vertexShader:V,fragmentShader:rt,depthTest:!1,depthWrite:!1,toneMapped:!1,blending:I}),uniforms:S}}function ut(S=64){const e=S,t=e*e,s=new Uint8Array(t),i=new Float32Array(t),a=3,c=2*1.9*1.9,u=2*a+1,h=new Float32Array(u*u);for(let r=-a;r<=a;r++)for(let n=-a;n<=a;n++)h[(r+a)*u+(n+a)]=Math.exp(-(n*n+r*r)/c);const p=(r,n)=>{const d=r%e,U=r/e|0;for(let m=-a;m<=a;m++){const $=(U+m+e)%e*e,j=(m+a)*u;for(let z=-a;z<=a;z++)i[$+(d+z+e)%e]+=n*h[j+(z+a)]}},x=()=>{let r=-1,n=-1/0;for(let d=0;d<t;d++)s[d]===1&&i[d]>n&&(n=i[d],r=d);return r},R=()=>{let r=-1,n=1/0;for(let d=0;d<t;d++)s[d]===0&&i[d]<n&&(n=i[d],r=d);return r},k=Math.max(16,Math.floor(t*.1));let A=2654435769;const Y=()=>(A^=A<<13,A^=A>>>17,A^=A<<5,(A>>>0)/4294967296);let K=0;for(;K<k;){const r=Y()*t|0;s[r]===0&&(s[r]=1,p(r,1),K++)}for(let r=0;r<t*2;r++){const n=x();s[n]=0,p(n,-1);const d=R();if(d===n){s[n]=1,p(n,1);break}s[d]=1,p(d,1)}const ee=s.slice(),F=i.slice(),D=new Int32Array(t).fill(-1);for(let r=k-1;r>=0;r--){const n=x();if(n<0)break;s[n]=0,p(n,-1),D[n]=r}s.set(ee),i.set(F);for(let r=k;r<t;r++){const n=R();if(n<0)break;s[n]=1,p(n,1),D[n]=r}const _=(()=>{const r=new Float64Array(e),n=new Float64Array(e);for(let v=0;v<e;v++)r[v]=Math.cos(2*Math.PI*v/e),n[v]=Math.sin(2*Math.PI*v/e);const d=Math.round(Math.log2(e)),U=new Int32Array(e);for(let v=0;v<e;v++){let f=0;for(let l=0;l<d;l++)v&1<<l&&(f|=1<<d-1-l);U[v]=f}const m=new Float64Array(e),b=new Float64Array(e),$=()=>{for(let v=0;v<e;v++){const f=U[v];if(f>v){let l=m[v];m[v]=m[f],m[f]=l,l=b[v],b[v]=b[f],b[f]=l}}for(let v=2;v<=e;v<<=1){const f=v>>1,l=e/v;for(let M=0;M<e;M+=v)for(let o=0;o<f;o++){const g=o*l,Z=r[g],B=-n[g],N=M+o,E=N+f,G=m[E]*Z-b[E]*B,O=m[E]*B+b[E]*Z;m[E]=m[N]-G,b[E]=b[N]-O,m[N]+=G,b[N]+=O}}},j=new Float64Array(e*e),z=new Float64Array(e*e),L=new Float64Array(e*e),te=new Float64Array(e*e),ke=v=>{for(let f=0;f<e;f++){for(let l=0;l<e;l++)m[l]=v[f*e+l],b[l]=0;$();for(let l=0;l<e;l++)j[f*e+l]=m[l],z[f*e+l]=b[l]}for(let f=0;f<e;f++){for(let l=0;l<e;l++)m[l]=j[l*e+f],b[l]=z[l*e+f];$();for(let l=0;l<e;l++)L[l*e+f]=m[l],te[l*e+f]=b[l]}},he=new Float64Array(t),se=new Float64Array(t),ie=new Array(t),ae=new Float64Array(t),ce=e/2*e+0,fe=0*e+e/2;let oe=0,Q=0,X=0;for(let v=0;v<8;v++){for(let o=0;o<t;o++)he[o]=D[o]/t;ke(he);const f=[];for(let o=0;o<e;o++)for(let g=0;g<e;g++){if(g===0&&o===0)continue;const Z=(e-g)%e;(e-o)%e*e+Z<o*e+g||f.push({u:g,v:o,m:Math.hypot(L[o*e+g],te[o*e+g])})}f.sort((o,g)=>g.m-o.m);const l=Math.max(f[f.length>>1].m,1e-9);if(oe=f[0].m/l,Q=Math.abs(L[ce])/(t/2),X=Math.abs(L[fe])/(t/2),oe<=12&&Q<.0015&&X<.0015)break;const M=[];for(let o=0;o<6&&f[o].m>l*4;o++)M.push(f[o]);if(Q>=.0015&&M.push({u:0,v:e/2,m:Math.abs(L[ce])}),X>=.0015&&M.push({u:e/2,v:0,m:Math.abs(L[fe])}),!M.length)break;ae.fill(0);for(const{u:o,v:g}of M){const B=((e-o)%e===o&&(e-g)%e===g?1:2)/t,N=L[g*e+o]*B,E=te[g*e+o]*B;for(let G=0;G<e;G++)for(let O=0;O<e;O++){const ve=(o*O+g*G)%e;ae[G*e+O]+=N*r[ve]-E*n[ve]}}for(let o=0;o<t;o++)se[o]=D[o]-ae[o]*t,ie[o]=o;ie.sort((o,g)=>se[o]-se[g]||o-g);for(let o=0;o<t;o++)D[ie[o]]=o}return{worst:oe,parRow:Q,parCol:X}})();typeof console<"u"&&(_.worst>20||_.parRow>=.002||_.parCol>=.002)&&console.warn("[post] blue-noise tile still carries a fixed pattern",_.worst.toFixed(1),_.parRow.toFixed(4),_.parCol.toFixed(4));const q=new Uint8Array(t*4),W=[0,0,23,41,17,7,53,29];for(let r=0;r<4;r++){const n=W[r*2],d=W[r*2+1];for(let U=0;U<e;U++)for(let m=0;m<e;m++){const b=(U+d)%e*e+(m+n)%e;q[(U*e+m)*4+r]=Math.min(255,Math.floor(D[b]/t*256))}}const w=new Pe(q,e,e,De,_e);return w.wrapS=w.wrapT=We,w.minFilter=w.magFilter=ue,w.generateMipmaps=!1,w.colorSpace=ne,w.needsUpdate=!0,w}const nt=new C(0,0,0),ht=(S,e,t,s)=>S+(e-S)*(1-Math.exp(-2.4*s)),xe=["bloom","streak","dof","lens","fluid","grade","vignette","grain","dither","aa"];class ft{static id="post";constructor(e){this.ctx=e,this.ready=!1,this.bypass=!1,this.flags={bloom:!0,streak:!0,dof:!0,lens:!0,fluid:!0,grade:!0,vignette:!0,grain:!0,dither:!0,aa:!0},this.W=2,this.H=2,this._focus=7,this._hasFluid=!1,this._prevToneMapping=null,this._offQuality=null,this._v=new C,this._fwd=new C,this._hz=null,this._doStreak=!0,this._stressName=null,this._stressN=0,this._stageFns=null}async init(){const e=this.ctx,t=e.renderer;this.fsq=new He,this.noise=ut(64),this.bloom=new Xe(e,this.fsq),this.dof=new et(e,this.fsq),this.hairZ=new it(e);const s=ot();this.mComposite=s.mat,this.uComp=s.uniforms,this._syncGain=s.syncGain;const i=lt();this.mAA=i.mat,this.uAA=i.uniforms,this.uAA.uNoise.value=this.noise,this.uComp.uNoise.value=this.noise,this.rtScene=qe(2,2),this.rtLDR=P(2,2,_e),this._stageFns={scene:()=>this._scene(),hairz:()=>this._hairz(),bloom:()=>this._bloom(),dof:()=>this._dof(),composite:()=>this._composite(this.rtLDR),aa:()=>this._aa(null),post:()=>{this._dofOn()&&(this._hairz(),this._dof()),this.flags.bloom&&this.ctx.quality.bloom&&this._bloom(),this._composite(this.rtLDR),this.flags.aa&&this._aa(null)}},this._readFlagsFromURL(),this._prevToneMapping=t.toneMapping,t.toneMapping=ge,e.fluid?.setLinearOutput?.(!0),this.onResize(e.sizes.w,e.sizes.h,e.sizes.dpr),this._applyDefines(),this._offQuality=e.bus.on("quality",()=>{const a=Math.min(window.devicePixelRatio||1,e.quality.dpr);this.onResize(e.sizes.w,e.sizes.h,a),this._applyDefines()}),this.ready=!0}onResize(e,t,s){const i=this.ctx,a=s||i.sizes.dpr||1;this.W=Math.max(2,Math.round(e*a)),this.H=Math.max(2,Math.round(t*a)),this.rtScene.setSize(this.W,this.H),this.rtLDR.setSize(this.W,this.H),this.bloom.resize(this.W,this.H,i.quality.tier),this.dof.resize(this.W,this.H,i.quality.tier,a),this.hairZ.resize(this.W,this.H,a),this.uComp.uTexel.value.set(1/this.W,1/this.H),this.uComp.uAspect.value.set(this.W/this.H,1),this.uAA.uTexel.value.set(1/this.W,1/this.H),this.uAA.uDpr.value=a;const c=this.W/this.H,u=.25*(c*c+1),h=this.uComp.uK1.value,p=this.uComp.uK2.value;this.uComp.uCorner.value=1/(1+h*u+p*u*u),this.dof.uCoc.uNear.value=i.camera?.near??.1,this.dof.uCoc.uFar.value=i.camera?.far??120,this._syncRain()}_syncRain(){const e=this.ctx.rain;if(e)try{e.setSourceEncoding?.("linear"),e.setSourceSize?.(this.W,this.H)}catch(t){console.warn("[post] could not configure rain for the HDR target:",t?.message||t)}}_dofOn(){const e=this.ctx.quality;return this.flags.dof&&(e.dof||e.tier==="medium")}update(e){if(!this.ready)return;const t=this.ctx,s=t.hair?.center||nt;this._v.copy(s).sub(t.camera.position),t.camera.getWorldDirection(this._fwd);const i=Math.max(.6,this._v.dot(this._fwd));this._focus=t.reducedMotion?i:ht(this._focus,i,2.4,e),this.dof.uCoc.uFocus.value=this._focus,this.uComp.uTime.value=t.time,this.bloom.uPre.uExposure.value=this.uComp.uExposure.value;const a=t.fluid,c=!!(a?.texture&&a?.velocity);c&&(this.uComp.uFluidDye.value=a.texture,this.uComp.uFluidVel.value=a.velocity,a.texelSim&&this.uComp.uFluidTexel.value.copy(a.texelSim)),c!==this._hasFluid&&(this._hasFluid=c,this._applyDefines()),t.reducedMotion?(this.uAA.uGrainOffset.value.set(.13,.71),this.dof.uGather.uJitter.value=0):this.uAA.uGrainOffset.value.set((Math.random()*64|0)/64,(Math.random()*64|0)/64),this.dof.uGather.uJitter.value=0}_scene(){const e=this.ctx.renderer;e.autoClear=!0,e.setRenderTarget(this.rtScene),e.render(this.ctx.scene,this.ctx.camera),e.autoClear=!1}_hairz(){this._hz=this.hairZ.render(this.ctx.renderer)}_bloom(){const e=this.ctx.renderer;this.uComp.uBloom.value=this.bloom.render(e,this.rtScene.texture,this.W,this.H,this._doStreak),this.uComp.uStreak.value=this._doStreak?this.bloom.streakB.texture:null}_dof(){this.uComp.uDof.value=this.dof.render(this.ctx.renderer,this.rtScene,this.W,this.H,this.dof.uGather.uJitter.value,this._hz,this.hairZ.w,this.hairZ.h)}_composite(e){this.uComp.uScene.value=this.rtScene.texture,this.fsq.run(this.ctx.renderer,this.mComposite,e)}_aa(e){this.uAA.uTex.value=this.rtLDR.texture,this.fsq.run(this.ctx.renderer,this.mAA,e)}render(){const e=this.ctx,t=e.renderer;if(this._profiling)return;if(!this.ready||this.bypass){t.setRenderTarget(null),t.render(e.scene,e.camera);return}const s=t.autoClear,i=e.quality,a=this.flags.bloom&&i.bloom;this._doStreak=a&&this.flags.streak;const c=this._dofOn();if(this._scene(),c&&(this._hairz(),this._dof()),a&&this._bloom(),this._composite(this.flags.aa?this.rtLDR:null),this.flags.aa&&this._aa(null),this._stressN>0){const u=this._stageFns[this._stressName];if(u)for(let h=0;h<this._stressN;h++)u()}t.autoClear=s}set(e,t){return e in this.flags?(this.flags[e]=!!t,e==="grain"&&(this.uAA.uGrain.value=t?this._grainAmt():0),e==="dither"&&(this.uComp.uDither.value=t?1:0),this._applyDefines(),this):this}toggle(e){return this.set(e,!this.flags[e])}only(e){for(const t of xe)this.flags[t]=t===e;return this.uAA.uGrain.value=this.flags.grain?this._grainAmt():0,this.uComp.uDither.value=this.flags.dither?1:0,this._applyDefines(),this}all(e=!0){for(const t of xe)this.flags[t]=!!e;return this.uAA.uGrain.value=this.flags.grain?this._grainAmt():0,this.uComp.uDither.value=this.flags.dither?1:0,this._applyDefines(),this}setEnabled(e){this.bypass=!e;const t=this.ctx.renderer;return this.bypass?(t.toneMapping=this._prevToneMapping??Be,this.ctx.rain?.setSourceEncoding?.("srgb"),this.ctx.rain?.setSourceSize?.(0,0),this.ctx.fluid?.setLinearOutput?.(!1)):(t.toneMapping=ge,this.ctx.fluid?.setLinearOutput?.(!0),this._syncRain()),this}debug(e){const t={off:0,bloom:1,coc:2,streak:3,fluid:4};return this.uComp.uDebug.value=t[e]??0,this}stress(e,t=40){return this._stressName=e,this._stressN=e?t:0,this}get params(){return{composite:this.uComp,aa:this.uAA,bloom:{prefilter:this.bloom.uPre,up:this.bloom.uUp,streak:this.bloom.uStreak},dof:{coc:this.dof.uCoc,gather:this.dof.uGather,hairZ:this.hairZ.uniforms}}}_grainAmt(){return .024}_applyDefines(){const e=this.mComposite.defines,t={USE_LENS:this.flags.lens,USE_BLOOM:this.flags.bloom&&this.ctx.quality.bloom,USE_STREAK:this.flags.bloom&&this.flags.streak&&this.ctx.quality.bloom,USE_DOF:this._dofOn(),USE_FLUID:this.flags.fluid&&this._hasFluid,USE_GRADE:this.flags.grade,USE_VIGNETTE:this.flags.vignette};let s=!1;for(const i in t){const a=t[i];a&&!(i in e)?(e[i]="",s=!0):!a&&i in e&&(delete e[i],s=!0)}s&&(this.mComposite.needsUpdate=!0),this.uAA.uGrain.value=this.flags.grain?this._grainAmt():0,this.uComp.uDither.value=this.flags.dither?1:0}_readFlagsFromURL(){let e;try{e=new URLSearchParams(location.search).get("post")}catch{return}if(e)for(const t of e.split(",")){const s=t.trim();if(s){if(s==="off"){this.bypass=!0;continue}if(s.startsWith("only:")){this.only(s.slice(5));continue}if(s.startsWith("debug:")){this.debug(s.slice(6));continue}if(s.startsWith("exp:")){this.uComp.uExposure.value=parseFloat(s.slice(4))||1;continue}if(s.startsWith("no")){this.flags[s.slice(2)]=!1;continue}if(s.startsWith("-")){this.flags[s.slice(1)]=!1;continue}s in this.flags&&(this.flags[s]=!0)}}}async profile(e=26){const t=this.ctx,s=t.renderer,i=s.getContext(),a=i.getExtension("EXT_disjoint_timer_query_webgl2");if(!a)return{error:"EXT_disjoint_timer_query_webgl2 unavailable"};const k=[()=>{s.autoClear=!0,s.setRenderTarget(this.rtScene),s.render(t.scene,t.camera),s.autoClear=!1},()=>{this._hz=this.hairZ.render(s)},()=>{this.uComp.uBloom.value=this.bloom.render(s,this.rtScene.texture,this.W,this.H,this.flags.streak),this.uComp.uStreak.value=this.bloom.streakB.texture},()=>{this.uComp.uDof.value=this.dof.render(s,this.rtScene,this.W,this.H,0,this._hz)},()=>{this.uComp.uScene.value=this.rtScene.texture,this.fsq.run(s,this.mComposite,this.rtLDR)},()=>{this.uAA.uTex.value=this.rtLDR.texture,this.fsq.run(s,this.mAA,null)}],A=["scene","hairz","bloom","dof","composite","aa"],Y=y=>{for(let _=0;_<=y;_++)k[_]()},K=async y=>{const _=[];for(let w=0;w<e;w++){await new Promise(n=>requestAnimationFrame(n));const r=i.createQuery();i.beginQuery(a.TIME_ELAPSED_EXT,r),Y(y),i.endQuery(a.TIME_ELAPSED_EXT),_.push(r)}await new Promise(w=>setTimeout(w,120));let q=0,W=0;for(const w of _)i.getQueryParameter(w,i.QUERY_RESULT_AVAILABLE)&&(q+=i.getQueryParameter(w,i.QUERY_RESULT),W++),i.deleteQuery(w);return W?q/W/1e6:-1},ee=s.autoClear;this._profiling=!0;const F=[];try{for(let y=0;y<k.length;y++)F.push(await K(y))}finally{this._profiling=!1}const D={};for(let y=0;y<k.length;y++)D[A[y]]=+(y===0?F[0]:F[y]-F[y-1]).toFixed(3);return D.post=+(F[F.length-1]-F[0]).toFixed(3),D.frame=+F[F.length-1].toFixed(3),D.size=`${this.W}x${this.H}`,D.dpr=t.sizes.dpr,D.tier=t.quality.tier,s.autoClear=ee,D}dispose(){this.ready=!1,this._offQuality?.(),this._offQuality=null;const e=this.ctx.renderer;e&&this._prevToneMapping!==null&&(e.toneMapping=this._prevToneMapping),this.ctx.rain?.setSourceEncoding?.("srgb"),this.ctx.rain?.setSourceSize?.(0,0),this.ctx.fluid?.setLinearOutput?.(!1),this.rtScene?.depthTexture?.dispose(),this.rtScene?.dispose(),this.rtLDR?.dispose(),this.bloom?.dispose(),this.dof?.dispose(),this.hairZ?.dispose(),this.mComposite?.dispose(),this.mAA?.dispose(),this.noise?.dispose(),this.fsq?.dispose(),this.rtScene=this.rtLDR=null,this.bloom=this.dof=this.hairZ=null,this.mComposite=this.mAA=this.noise=this.fsq=null,e?.setRenderTarget(null)}}export{ft as default};
