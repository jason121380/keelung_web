import{e as F,G as W,f as z,g as J,H as Z,M as ee,S as q,h as Q,i as A,B as j,j as g,k as C,l as P,D as U,m as te,n as L,o as E,R as H,L as oe,d as k,N as I,p as ae,q as ie,r as ne,V as re,s as se,Q as le,F as ue}from"./three-sQPBrRwf.js";function fe(){return{ink:new F("#08090B"),ink2:new F("#101114"),bone:new F("#EDE8E1"),boneDim:new F("#9A958E"),brass:new F("#C6A15B"),harbour:new F("#2E4F52"),keyWarm:new F("#FFC489"),rimCool:new F("#A6C8D6"),bounce:new F("#44585C"),skyDim:new F("#18232A"),groundDim:new F("#0B0908"),windowCool:new F("#B4CEDA"),lampWarm:new F("#FFB776")}}const G=`
float at13Hash13(vec3 p) {
  p = fract(p * 0.3183099 + vec3(0.1, 0.2, 0.3));
  p *= 17.0;
  return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
}

float at13Noise(vec3 x) {
  vec3 i = floor(x);
  vec3 f = fract(x);
  f = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(mix(at13Hash13(i + vec3(0.0, 0.0, 0.0)), at13Hash13(i + vec3(1.0, 0.0, 0.0)), f.x),
        mix(at13Hash13(i + vec3(0.0, 1.0, 0.0)), at13Hash13(i + vec3(1.0, 1.0, 0.0)), f.x), f.y),
    mix(mix(at13Hash13(i + vec3(0.0, 0.0, 1.0)), at13Hash13(i + vec3(1.0, 0.0, 1.0)), f.x),
        mix(at13Hash13(i + vec3(0.0, 1.0, 1.0)), at13Hash13(i + vec3(1.0, 1.0, 1.0)), f.x), f.y),
    f.z);
}

float at13Fbm(vec3 p) {
  float a = 0.5;
  float s = 0.0;
  for (int i = 0; i < 4; i++) { s += a * at13Noise(p); p *= 2.03; a *= 0.5; }
  return s;
}

/** Interleaved gradient noise — cheap blue-noise-ish, the standard band killer. */
float at13Ign(vec2 p) {
  return fract(52.9829189 * fract(0.06711056 * p.x + 0.00583715 * p.y));
}
`,$=`
uniform vec3  uFogColor;
uniform float uFogDensity;
uniform float uFogHeight;
uniform float uFogFalloff;
uniform float uFogNear;

float at13FogFactor(vec3 worldPos, vec3 camPos) {
  vec3 d = worldPos - camPos;
  float len = length(d);
  float dist = max(len - uFogNear, 0.0);
  if (dist <= 0.0) return 0.0;
  vec3 dir = d / max(len, 1e-5);
  float k = uFogFalloff;
  float base = uFogDensity * exp(-k * (camPos.y - uFogHeight));
  float dy = dir.y * dist;
  float integ;
  if (abs(dy) < 1e-3) integ = base * dist;
  else integ = base * dist * (1.0 - exp(-k * dy)) / (k * dy);
  return 1.0 - exp(-integ);
}

vec3 at13ApplyFog(vec3 col, vec3 worldPos, vec3 camPos) {
  return mix(col, uFogColor, clamp(at13FogFactor(worldPos, camPos), 0.0, 1.0));
}
`;function ce(t,e){const r=t.quality,o=new W;o.name="env:rig";const a=new z(16777215,265,30,.345,.92,2);a.color.copy(e.keyWarm),a.position.set(-2.6,4.6,1.2),a.target.position.set(.35,-.6,-.2),a.name="env:key";const l=new z(16777215,420,40,.58,.96,2);l.color.copy(e.rimCool),l.position.set(3.55,4.35,-6.1),l.target.position.set(-.25,.55,.35),l.name="env:rim";const c=new J(16777215,44,24,2);c.color.copy(e.bounce),c.position.set(2.1,-2.05,4.1),c.name="env:fill";const i=new Z(16777215,16777215,.22);return i.color.copy(e.skyDim),i.groundColor.copy(e.groundDim),i.position.set(0,8,0),i.name="env:ambient",o.add(a,a.target,l,l.target,c,i),Y(a,l,r),{group:o,key:a,rim:l,fill:c,ambient:i}}function Y(t,e,r){const o=!!r.shadows,a=r.shadowSize||1024;t.castShadow=o,o&&(t.shadow.mapSize.set(a,a),t.shadow.camera.near=1.4,t.shadow.camera.far=22,t.shadow.camera.fov=ee.radToDeg(t.angle)*2,t.shadow.bias=-9e-4,t.shadow.normalBias=.042,t.shadow.radius=a>=1024?4:2,t.shadow.blurSamples=a>=1024?16:8,t.shadow.camera.updateProjectionMatrix(),t.shadow.map&&t.shadow.map.width!==a&&(t.shadow.map.dispose(),t.shadow.map=null)),e.castShadow=!1}const K=`
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`,X=`
uniform vec3  uColor;
uniform float uIntensity;
uniform float uSoft;
uniform float uGradient;
varying vec2 vUv;

void main() {
  // soft rectangular falloff so PMREM sees a diffused source, not a hard card
  float mx = smoothstep(0.0, uSoft, vUv.x) * smoothstep(1.0, 1.0 - uSoft, vUv.x);
  float my = smoothstep(0.0, uSoft * 0.8, vUv.y) * smoothstep(1.0, 1.0 - uSoft * 0.8, vUv.y);
  float m = mx * my;
  m *= m;
  // windows are brighter at the top
  float g = mix(1.0 - uGradient, 1.0 + uGradient, vUv.y);
  gl_FragColor = vec4(uColor * (uIntensity * m * g), 1.0);
}
`,he=`
varying vec3 vDir;
void main() {
  vDir = normalize(position);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`,me=`
uniform vec3 uTop;
uniform vec3 uHorizon;
uniform vec3 uBottom;
uniform vec3 uGlowDir;
uniform vec3 uGlowColor;
uniform float uGlow;
varying vec3 vDir;

void main() {
  vec3 d = normalize(vDir);
  float y = d.y;
  vec3 c = mix(uHorizon, uBottom, smoothstep(0.0, -0.55, y));
  c = mix(c, uTop, smoothstep(0.02, 0.75, y));
  // a broad wash of rain-light spilling off the window wall
  float g = pow(max(dot(d, normalize(uGlowDir)), 0.0), 2.6);
  c += uGlowColor * (uGlow * g);
  gl_FragColor = vec4(c, 1.0);
}
`;function R(t,e,r,o,a,l,c){const i=new P(t,e),d=new A({uniforms:{uColor:{value:o.clone()},uIntensity:{value:a},uSoft:{value:l},uGradient:{value:c}},vertexShader:K,fragmentShader:X,side:U,depthWrite:!1,toneMapped:!1}),v=new C(i,d);return v.position.copy(r),v.lookAt(0,0,0),v}function de(t,e){const r=new q,o=[],a=[],l=new Q(24,32,20),c=new A({uniforms:{uTop:{value:e.ink2.clone().multiplyScalar(.55)},uHorizon:{value:new F("#151B1F").multiplyScalar(.62)},uBottom:{value:e.ink.clone().multiplyScalar(.35)},uGlowDir:{value:new g(.62,.42,-.66).normalize()},uGlowColor:{value:e.windowCool.clone()},uGlow:{value:.34}},vertexShader:he,fragmentShader:me,side:j,depthWrite:!1,toneMapped:!1});r.add(new C(l,c)),o.push(l),a.push(c);const i=R(11,13,new g(9,5.2,-12),e.windowCool,5.6,.3,.26);r.add(i),o.push(i.geometry),a.push(i.material);const d=R(7,9,new g(-7.5,4.4,-12.5),e.windowCool,1.5,.36,.2);r.add(d),o.push(d.geometry),a.push(d.material);const v=R(5,4,new g(-9.5,6,6.5),e.lampWarm,2.4,.34,-.15);r.add(v),o.push(v.geometry),a.push(v.material);const y=new P(34,34),p=new A({uniforms:{uColor:{value:new F("#2A2622")},uIntensity:{value:.42},uSoft:{value:.42},uGradient:{value:0}},vertexShader:K,fragmentShader:X,side:U,depthWrite:!1,toneMapped:!1}),h=new C(y,p);h.rotation.x=-Math.PI/2,h.position.y=-7.5,r.add(h),o.push(y),a.push(p);const n=new te(t),s=n.fromScene(r,.035,.1,60);n.dispose();for(const f of o)f.dispose();for(const f of a)f.dispose();return r.clear(),{texture:s.texture,dispose(){s.dispose()}}}function pe(t=64,e=8){const r=new Float32Array(e*e);for(let i=0;i<r.length;i++)r[i]=Math.random();const o=(i,d)=>r[d%e*e+i%e],a=i=>i*i*(3-2*i),l=new Uint8Array(t*t*4);for(let i=0;i<t;i++)for(let d=0;d<t;d++){let v=0,y=.5,p=1;for(let s=0;s<3;s++){const f=d/t*e*p,m=i/t*e*p,b=Math.floor(f),x=Math.floor(m),w=a(f-b),_=a(m-x),u=e*p,S=o((b%u+u)%u%e,(x%u+u)%u%e),M=o(((b+1)%u+u)%u%e,(x%u+u)%u%e),T=o((b%u+u)%u%e,((x+1)%u+u)%u%e),D=o(((b+1)%u+u)%u%e,((x+1)%u+u)%u%e);v+=y*(S*(1-w)*(1-_)+M*w*(1-_)+T*(1-w)*_+D*w*_),y*=.5,p*=2}const h=(i*t+d)*4,n=Math.max(0,Math.min(255,Math.round(v*255)));l[h]=n,l[h+1]=n,l[h+2]=n,l[h+3]=255}const c=new L(l,t,t,E);return c.wrapS=c.wrapT=H,c.minFilter=k,c.magFilter=k,c.generateMipmaps=!1,c.colorSpace=I,c.needsUpdate=!0,c}const O=.01;function ve(t=128,e=16){const r=n=>{const s=new Float32Array(n);for(let f=0;f<n;f++)s[f]=Math.random();return s},o=r(e*e),a=r(e*2*e*2),l=r(16),c=n=>n*n*(3-2*n),i=(n,s,f)=>n+(s-n)*f,d=(n,s,f,m)=>{const b=f*s,x=m*s,w=Math.floor(b),_=Math.floor(x),u=c(b-w),S=c(x-_),M=(T,D)=>n[(D%s+s)%s*s+(T%s+s)%s];return i(i(M(w,_),M(w+1,_),u),i(M(w,_+1),M(w+1,_+1),u),S)},v=(n,s)=>d(o,e,n,s)*.68+d(a,e*2,n,s)*.32,y=new Uint8Array(t*t*4),p=1/t;for(let n=0;n<t;n++)for(let s=0;s<t;s++){const f=s/t,m=n/t,b=v(f,m),x=(v(f+p,m)-v(f-p,m))/(2*p),w=(v(f,m+p)-v(f,m-p))/(2*p),_=d(l,4,f,m),u=(n*t+s)*4,S=M=>Math.max(0,Math.min(255,Math.round(M*255)));y[u]=S(b),y[u+1]=S(.5+x*O),y[u+2]=S(.5+w*O),y[u+3]=S(_)}const h=new L(y,t,t,E);return h.wrapS=h.wrapT=H,h.minFilter=oe,h.magFilter=k,h.generateMipmaps=!0,h.colorSpace=I,h.needsUpdate=!0,h}const ge=`
varying vec3 vDir;
void main() {
  vDir = normalize(position);
  gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.0);
}
`,we=`
precision highp float;

uniform vec3  uInk;
uniform vec3  uFogColor;
uniform vec3  uWindow;
uniform vec3  uLamp;
uniform vec3  uWindowDir;
uniform vec3  uLampDir;
uniform float uWindowGain;
uniform float uLampGain;
uniform float uHorizonGain;
uniform float uTime;
uniform float uGrain;

varying vec3 vDir;

${G}

void main() {
  vec3 d = normalize(vDir);

  vec3 col = uInk;

  // one soft lobe of lit haze sitting just ABOVE the floor line. It is what
  // gives the room a far wall without ever drawing one.
  float lift = exp(-pow((d.y - 0.11) * 4.4, 2.0));
  col += uWindow * (lift * uHorizonGain);

  // rain window bloom, upper right, wide and cold
  float w = pow(max(dot(d, normalize(uWindowDir)), 0.0), 3.0);
  col += uWindow * (w * uWindowGain);

  // interior lamp spill, upper left, tighter and warmer
  float l = pow(max(dot(d, normalize(uLampDir)), 0.0), 5.0);
  col += uLamp * (l * uLampGain);

  // CRITICAL: everything at or below the floor's vanishing line collapses to
  // exactly the fog colour. The floor plane fogs to the same value long before
  // its own edge, so the two meet at identical values and there is no seam —
  // no horizon, no cyclorama, no studio.
  col = mix(uFogColor, col, smoothstep(-0.055, 0.235, d.y));

  // Fine emulsion grain so a gradient this shallow can never post. Blue-noise
  // (interleaved gradient), not value noise — three ops instead of eight hash
  // evaluations, on every background pixel in the frame, and better distributed.
  float g = at13Ign(gl_FragCoord.xy + uTime * 60.0);
  col += (g - 0.5) * uGrain;

  gl_FragColor = vec4(max(col, 0.0), 1.0);

  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
`,xe=`
uniform float uTime;
uniform float uDetail;
uniform float uWet;
uniform float uPlasterMix;
uniform sampler2D uPlaster;
uniform sampler2D uSurf;
varying vec3 vAt13World;
${$}
`;function ye(t,e,r,o){const a=new W;a.name="env:backdrop";const l=new Q(64,32,24),c=new A({uniforms:{uInk:{value:e.ink.clone()},uFogColor:r.uFogColor,uWindow:{value:e.rimCool.clone()},uLamp:{value:e.keyWarm.clone()},uWindowDir:{value:new g(.4,.22,-.89).normalize()},uLampDir:{value:new g(-.48,.4,-.78).normalize()},uWindowGain:{value:.055},uLampGain:{value:.012},uHorizonGain:{value:.019},uGrain:{value:.004},uTime:{value:0}},vertexShader:ge,fragmentShader:we,side:j,depthWrite:!1,fog:!1}),i=new C(l,c);i.name="env:shell",i.renderOrder=-100,i.frustumCulled=!1,i.matrixAutoUpdate=!1,i.updateMatrix(),a.add(i);const d=o?_e(o,"tex-plaster"):null,v=d?null:Fe(),y=ve(128,16);y.anisotropy=Math.min(8,t.renderer?.capabilities?.getMaxAnisotropy?.()||1);const p={uSurf:{value:y},uTime:{value:0},uDetail:{value:1},uWet:{value:.62},uPlasterMix:{value:0},uPlaster:{value:d||v}},h=new P(170,170,1,1),n=new ae({color:new F("#34383F"),roughness:.84,metalness:.03,envMapIntensity:.34,dithering:!0,fog:!1});n.customProgramCacheKey=()=>"at13-env-floor-v5",n.onBeforeCompile=m=>{Object.assign(m.uniforms,p,r),m.vertexShader=m.vertexShader.replace("#include <common>",`#include <common>
varying vec3 vAt13World;`).replace("#include <begin_vertex>",`#include <begin_vertex>
vAt13World = (modelMatrix * vec4(transformed, 1.0)).xyz;`),m.fragmentShader=m.fragmentShader.replace("#include <common>",`#include <common>
`+xe).replace("#include <map_fragment>",`
        #include <map_fragment>
        float at13Far = distance(vAt13World, cameraPosition);
        // Two fetches at incommensurate scales: a broad blotch and, warped by
        // it, the micro tile. Warping the micro UV by the blotch is what stops
        // a 128px tile repeating every 2.4 world units from reading as a grid.
        vec4 at13Blot = texture2D(uSurf, vAt13World.xz * 0.022);
        vec4 at13Micro = texture2D(uSurf, vAt13World.xz * 0.26 + at13Blot.r * 0.60);
        {
          float far = smoothstep(16.0, 42.0, at13Far);
          float m = mix(0.58 + 0.74 * at13Blot.r, 1.0, far) * mix(0.74, 1.26, at13Micro.r);
          diffuseColor.rgb *= m;
        }
`).replace("#include <roughnessmap_fragment>",`
        #include <roughnessmap_fragment>
        {
          // broad damp patches, not puddles — the floor is wet, not flooded
          float wet = texture2D(uSurf, vAt13World.xz * 0.009).a;
          float plaster = texture2D(uPlaster, vAt13World.xz * 0.055).r;
          wet = mix(wet, wet * (0.62 + 0.8 * plaster), uPlasterMix);
          float far = smoothstep(8.0, 34.0, at13Far);
          float shiny = mix(0.88, 0.40, uWet);
          float r = mix(0.88, shiny, smoothstep(0.36, 0.70, wet));
          roughnessFactor = mix(r, 0.84, far);
        }
`).replace("#include <normal_fragment_maps>",`
        #include <normal_fragment_maps>
        {
          float amp = uDetail * (1.0 - smoothstep(12.0, 34.0, at13Far));
          if (amp > 0.002) {
            // gradient comes straight out of GB — no central differences, no
            // three extra height evaluations per pixel. Slope stays under about
            // 4 degrees: this is tooth on a hard floor, not a wave.
            vec3 nd = normalize(vec3(
              (at13Micro.g - 0.5) * 0.85,
              1.0,
              (at13Micro.b - 0.5) * 0.85));
            normal = normalize(mix(normal, nd, 0.90 * amp));
          }
        }
        `).replace("#include <opaque_fragment>",`
        #include <opaque_fragment>
        gl_FragColor.rgb = at13ApplyFog(gl_FragColor.rgb, vAt13World, cameraPosition);
        `),n.userData.shader=m};const s=new C(h,n);s.name="env:floor",s.rotation.x=-Math.PI/2,s.position.y=-2.35,s.receiveShadow=!0,s.matrixAutoUpdate=!1,s.updateMatrix(),a.add(s);let f=null;return d&&o&&(f=t.bus.on("asset:loaded",m=>{m==="tex-plaster"&&(p.uPlasterMix.value=1,f?.(),f=null)}),d.image&&(p.uPlasterMix.value=1)),{group:a,shell:i,floor:s,shellMat:c,floorMat:n,floorUniforms:p,setDetail(m){p.uDetail.value=m},update(m){c.uniforms.uTime.value=m,p.uTime.value=m},dispose(){f?.(),l.dispose(),c.dispose(),h.dispose(),n.dispose(),y.dispose(),v?.dispose()}}}function _e(t,e){try{const r=t.load(e,{srgb:!1,aniso:8,wrap:!0});return r&&(r.wrapS=r.wrapT=H),r}catch{return null}}function Fe(){const t=new L(new Uint8Array([128,128,128,255]),1,1);return t.needsUpdate=!0,t}const be=`
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`,Se=`
precision highp float;

#ifndef STEPS
#define STEPS 22
#endif

uniform vec3  uCamPos;
uniform vec3  uCamRight;
uniform vec3  uCamUp;
uniform vec3  uCamFwd;
uniform float uTanHalfFov;
uniform float uAspect;

uniform vec3  uOrigin;
uniform vec3  uDir;
uniform vec3  uAxisU;
uniform vec3  uAxisV;
uniform vec3  uColor;
uniform float uIntensity;
uniform float uSpread;
uniform float uTime;
uniform float uSlat;
uniform float uDust;
uniform float uFogHeight;
uniform float uFogFalloff;
uniform float uNearFade;
uniform float uReach;
uniform sampler2D uNoise;

varying vec2 vUv;

${G}

// analytic ray/sphere — bounds the march to the volume that can possibly matter
bool at13Sphere(vec3 ro, vec3 rd, vec3 c, float r, out float t0, out float t1) {
  vec3 oc = ro - c;
  float b = dot(oc, rd);
  float cc = dot(oc, oc) - r * r;
  float h = b * b - cc;
  if (h < 0.0) return false;
  h = sqrt(h);
  t0 = -b - h;
  t1 = -b + h;
  return t1 > 0.0;
}

float at13Density(vec3 p) {
  vec3 rel = p - uOrigin;
  float t = dot(rel, uDir);
  if (t <= 0.05) return 0.0;

  // cone profile — gaussian, so it is soft all the way out and never shows a rim
  float radius = uSpread * t;
  vec2 off = vec2(dot(rel, uAxisU), dot(rel, uAxisV));
  float r = length(off) / max(radius, 1e-4);
  float cone = exp(-r * r * 2.0);
  if (cone < 0.003) return 0.0;

  // Window mullions. Measured as an ANGLE off the axis, not a distance, so the
  // blades DIVERGE with throw exactly like real shadows cast from a window
  // frame. Two incommensurate pitches keep it off a regular grating.
  //
  // Both terms stay STRICTLY POSITIVE. A cosine that dips negative subtracts
  // density from the integral and quietly cancels the pattern back to flat
  // grey — which is exactly how a gobo goes invisible.
  // sqrt() fattens the lit bar and narrows the dark gap, the right way round
  // for a thin mullion against a big pane, and is far cheaper than pow().
  float ang = off.x / max(t, 0.35);
  float slatA = sqrt(0.5 + 0.5 * cos(ang * 26.0 + 0.7));
  float slatB = 0.56 + 0.44 * (0.5 + 0.5 * cos(ang * 9.5 - 1.3));
  float slats = mix(1.0, slatA * slatB, uSlat * smoothstep(1.1, 4.2, t));

  // falloff along the throw, plus a soft end so it never clips to an edge
  float att = 1.0 / (1.0 + 0.021 * t * t);
  att *= 1.0 - smoothstep(uReach * 0.55, uReach, t);

  // humid air pools near the floor — this is the whole reason it reads as air
  float h = exp(-(p.y - uFogHeight) * uFogFalloff * 2.2);
  h = clamp(h, 0.30, 2.0);

  // Drifting dust — one texture fetch. An inline 3D value noise here is eight
  // hash evaluations per sample, per step, per pixel. The .y shear stops the
  // tile reading as a vertical extrusion; low frequency is deliberate, since
  // fine detail averages to a constant once integrated along the view ray.
  vec2 nuv = p.xz * 0.055 + p.y * 0.021 + vec2(uTime * 0.006, -uTime * 0.011);
  float dust = mix(1.0, 0.32 + 1.40 * texture2D(uNoise, nuv).r, uDust);

  return cone * slats * att * h * dust;
}

void main() {
  vec2 ndc = vUv * 2.0 - 1.0;
  vec3 ro = uCamPos;
  vec3 rd = normalize(
    uCamFwd +
    uCamRight * (ndc.x * uTanHalfFov * uAspect) +
    uCamUp * (ndc.y * uTanHalfFov));

  vec3 centre = uOrigin + uDir * (uReach * 0.42);
  float t0, t1;
  if (!at13Sphere(ro, rd, centre, uReach * 0.72, t0, t1)) { gl_FragColor = vec4(0.0); return; }

  // Closest approach between this view ray and the cone axis. Two things come
  // out of it: a cheap reject for the large part of the frame nowhere near the
  // shaft, and a much tighter march interval.
  {
    vec3 w0 = ro - uOrigin;
    float b = dot(rd, uDir);
    float dd = 1.0 - b * b;
    float sAxis, sRay;
    if (dd < 1e-4) { sRay = 0.0; sAxis = dot(w0, uDir); }
    else {
      float d0 = dot(rd, w0);
      float e0 = dot(uDir, w0);
      sRay = (b * e0 - d0) / dd;
      sAxis = (e0 - b * d0) / dd;
    }
    sAxis = clamp(sAxis, 0.0, uReach);
    sRay = max(sRay, 0.0);
    float miss = distance(ro + rd * sRay, uOrigin + uDir * sAxis);
    if (miss > uSpread * uReach * 1.9 + 0.5) { gl_FragColor = vec4(0.0); return; }

    // Re-bound the march to a sphere around the closest point ON THE AXIS,
    // sized to the cone there. The outer bounding sphere is enormous and mostly
    // empty; without this the fixed step budget is spent marching vacuum.
    vec3 axisPt = uOrigin + uDir * sAxis;
    float rr = uSpread * sAxis * 2.2 + 0.9;
    float a0, a1;
    if (at13Sphere(ro, rd, axisPt, rr, a0, a1)) {
      t0 = max(t0, a0);
      t1 = min(t1, a1);
    }
  }

  t0 = max(t0, uNearFade);
  t1 = min(t1, 60.0);
  if (t1 <= t0) { gl_FragColor = vec4(0.0); return; }

  float dt = (t1 - t0) / float(STEPS);
  float jitter = at13Ign(gl_FragCoord.xy + vec2(uTime * 37.0, uTime * 19.0));
  float t = t0 + dt * jitter;

  float acc = 0.0;
  for (int i = 0; i < STEPS; i++) {
    vec3 p = ro + rd * t;
    // fade the first few units so there is never a wall of haze on the lens
    acc += at13Density(p) * smoothstep(uNearFade, uNearFade + 5.0, t);
    t += dt;
  }
  acc *= dt;

  // HDR, linear, untonemapped — the composite pass owns the transfer curve.
  gl_FragColor = vec4(uColor * (acc * uIntensity), 1.0);
}
`,Me=`
void main() {
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`,Ce=`
precision highp float;
uniform sampler2D uShaft;
uniform vec2 uTexel;

${G}

void main() {
  vec3 col = texture2D(uShaft, gl_FragCoord.xy * uTexel).rgb;

  // Dither in output space. The shaft is a very shallow gradient over a near
  // black frame, which is precisely the signal 8-bit posterises worst.
  float g = at13Ign(gl_FragCoord.xy + 13.7);
  col += (g - 0.5) * (1.6 / 255.0);

  gl_FragColor = vec4(max(col, 0.0), 1.0);

  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
`;function V(t){return t.tier==="high"?18:t.tier==="medium"?14:10}function N(t){return t.tier==="high"?.45:t.tier==="medium"?.32:.26}function Te(t,e,r){const o=pe(64,8),a={uNoise:{value:o},uCamPos:{value:new g},uCamRight:{value:new g(1,0,0)},uCamUp:{value:new g(0,1,0)},uCamFwd:{value:new g(0,0,-1)},uTanHalfFov:{value:.34},uAspect:{value:1.6},uOrigin:{value:new g(-3.7,5.2,3.4)},uDir:{value:new g(.53,-.7,-.47)},uAxisU:{value:new g(1,0,0)},uAxisV:{value:new g(0,0,1)},uColor:{value:e.keyWarm.clone().lerp(e.bone,.16)},uIntensity:{value:.112},uSpread:{value:.2},uTime:{value:0},uSlat:{value:.8},uDust:{value:.85},uFogHeight:r.uFogHeight,uFogFalloff:r.uFogFalloff,uNearFade:{value:.9},uReach:{value:24}},l=new ie(2,2,{depthBuffer:!1,stencilBuffer:!1,type:ne,format:E,minFilter:k,magFilter:k,generateMipmaps:!1});l.texture.colorSpace=I;const c=new P(2,2),i=new A({uniforms:a,vertexShader:be,fragmentShader:Se,defines:{STEPS:V(t.quality)},depthTest:!1,depthWrite:!1,toneMapped:!1}),d=new q,v=new C(c,i);v.frustumCulled=!1,d.add(v);const y={uShaft:{value:l.texture},uTexel:{value:new re(1,1)}},p=new P(2,2),h=new A({uniforms:y,vertexShader:Me,fragmentShader:Ce,transparent:!0,blending:se,depthTest:!1,depthWrite:!1,side:U,fog:!1}),n=new C(p,h);n.name="env:shaft",n.frustumCulled=!1,n.renderOrder=900,n.position.z=-1;let s=N(t.quality);const f=(x,w)=>{const u=2*Math.tan(w.fov*Math.PI/360)*1*1.04;n.scale.set(u*w.aspect/2,u/2,1);const S=x.domElement.width||2,M=x.domElement.height||2,T=Math.max(2,Math.round(S*s)),D=Math.max(2,Math.round(M*s));(l.width!==T||l.height!==D)&&l.setSize(T,D),y.uTexel.value.set(1/S,1/M)},m=new le;return{mesh:n,uniforms:a,resize:f,render:(x,w)=>{w.getWorldQuaternion(m),w.getWorldPosition(a.uCamPos.value),a.uCamRight.value.set(1,0,0).applyQuaternion(m),a.uCamUp.value.set(0,1,0).applyQuaternion(m),a.uCamFwd.value.set(0,0,-1).applyQuaternion(m),a.uTanHalfFov.value=Math.tan(w.fov*Math.PI/360),a.uAspect.value=w.aspect;const _=x.getRenderTarget();x.setRenderTarget(l),x.render(d,t.ortho),x.setRenderTarget(_)},setQuality(x,w,_){const u=V(x);i.defines.STEPS!==u&&(i.defines.STEPS=u,i.needsUpdate=!0),s=N(x),f(w,_)},dispose(){c.dispose(),i.dispose(),p.dispose(),h.dispose(),l.dispose(),o.dispose(),d.clear()}}}const B=(t,e,r,o)=>t+(e-t)*(1-Math.exp(-r*o)),De=new g(0,1,0);class Pe{static id="env";constructor(e){this.ctx=e,this.group=new W,this.group.name="env",this.palette=fe(),this.fogUniforms={uFogColor:{value:this.palette.ink.clone()},uFogDensity:{value:.062},uFogHeight:{value:-1.9},uFogFalloff:{value:.15},uFogNear:{value:1.3}},this._v=new g,this._u=new g,this._d=new g,this._fwd=new g,this._keyBase=new g,this._rimBase=new g,this._fillBase=new g,this._keyTgt=new g,this._px=0,this._py=0,this._vel=0,this._driftTime=0,this._onQuality=this._onQuality.bind(this)}async init(){const e=this.ctx,r=this.palette,o=ce(e,r);this.rig=o,this.group.add(o.group),this._keyBase.copy(o.key.position),this._rimBase.copy(o.rim.position),this._fillBase.copy(o.fill.position),this._keyTgt.copy(o.key.target.position);let a=null;try{this._env=de(e.renderer,r),a=this._env.texture}catch(l){console.warn("[env] environment map unavailable:",l?.message||l)}a&&(e.scene.environment=a,e.scene.environmentIntensity=.4,e.assets.env=a),e.scene.fog=new ue(r.ink.getHex(),.0245),this.backdrop=ye(e,r,this.fogUniforms,e.assetLib),this.group.add(this.backdrop.group),this.shaft=Te(e,r,this.fogUniforms),this.shaft.resize(e.renderer,e.camera),e.camera.add(this.shaft.mesh),this.shaft.mesh.visible=!!e.quality.volumetric,e.scene.add(this.group),e.env={key:o.key,rim:o.rim,fill:o.fill,ambient:o.ambient,envMap:a,fog:{uniforms:this.fogUniforms,glsl:$,color:this.fogUniforms.uFogColor.value},palette:r,group:this.group,rig:o.group,noiseGLSL:G,backdrop:{floor:this.backdrop.floor,shell:this.backdrop.shell,floorY:-2.35},shaft:{mesh:this.shaft.mesh,uniforms:this.shaft.uniforms},keyPos:o.key.position,rimPos:o.rim.position,fillPos:o.fill.position,applyFog:l=>this.applyFog(l)},this._offQuality=e.bus.on("quality",this._onQuality)}applyFog(e){return e&&(e.uniforms&&Object.assign(e.uniforms,this.fogUniforms),e.fog=!1,e)}_onQuality(){const e=this.ctx.quality;Y(this.rig.key,this.rig.rim,e),this.ctx.renderer.shadowMap.enabled=!!e.shadows,this.rig.key.shadow.needsUpdate=!0,this.shaft.setQuality(e,this.ctx.renderer,this.ctx.camera),this.shaft.mesh.visible=!!e.volumetric,this.backdrop.setDetail(e.tier==="low"?.45:1),this.ctx.scene.environmentIntensity!==void 0&&(this.ctx.scene.environmentIntensity=e.tier==="low"?.5:.4)}onResize(){this.shaft&&this.shaft.resize(this.ctx.renderer,this.ctx.camera)}update(e,r){const o=this.ctx,a=o.reducedMotion;this._driftTime=a?2:this._driftTime+e;const l=a?0:o.pointer.sx,c=a?0:o.pointer.sy;this._px=B(this._px,l,1.35,e),this._py=B(this._py,c,1.35,e);const i=Math.sin(this._driftTime*.17)*(a?0:1),d=this.rig.key,v=this.rig.rim,y=this.rig.fill;d.position.set(this._keyBase.x+this._px*.46+i*.07,this._keyBase.y+this._py*.24,this._keyBase.z+this._px*.16),v.position.set(this._rimBase.x-this._px*.34,this._rimBase.y+this._py*.16-i*.05,this._rimBase.z),y.position.set(this._fillBase.x-this._px*.2,this._fillBase.y,this._fillBase.z+this._py*.12);const p=Math.min(Math.abs(o.scroll.velocity)*2.2,1);this._vel=B(this._vel,a?0:p,this._vel<p?5.5:1.1,e),this.backdrop.update(r);const h=this.shaft;if(h.mesh.visible){const n=this._d.copy(this._keyTgt).sub(d.position).normalize(),s=this._fwd.set(0,0,-1).applyQuaternion(o.camera.quaternion),f=this._u.crossVectors(n,s);f.lengthSq()<1e-5&&f.crossVectors(n,De),f.normalize();const m=this._v.crossVectors(n,f).normalize();h.uniforms.uOrigin.value.copy(d.position).addScaledVector(n,-1.6),h.uniforms.uDir.value.copy(n),h.uniforms.uAxisU.value.copy(f),h.uniforms.uAxisV.value.copy(m),h.uniforms.uTime.value=this._driftTime,h.uniforms.uIntensity.value=.112*(1+this._vel*.3),h.render(o.renderer,o.camera)}}dispose(){const e=this.ctx;this._offQuality?.(),this._offQuality=null,this.shaft&&(e.camera?.remove(this.shaft.mesh),this.shaft.dispose(),this.shaft=null),this.backdrop&&(this.group.remove(this.backdrop.group),this.backdrop.dispose(),this.backdrop=null),this.rig&&(this.rig.key.shadow?.map?.dispose(),this.rig.key.dispose?.(),this.rig.rim.dispose?.(),this.rig.fill.dispose?.(),this.rig.ambient.dispose?.(),this.rig=null),this._env&&(e.scene.environment===this._env.texture&&(e.scene.environment=null),e.assets.env===this._env.texture&&(e.assets.env=null),this._env.dispose(),this._env=null),e.scene.fog=null,e.scene.remove(this.group),e.env&&(e.env=null)}}export{Pe as default};
