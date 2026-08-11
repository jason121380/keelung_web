import{V as x,u as J,e as q,$ as C,y as V,S as K,k as P,a0 as z,Y as X,o as $,r as S,a1 as j,a2 as F,q as Z,w as R,d as L,N as ee,a3 as O,U as G,a4 as W,X as te,a5 as se}from"./three-sQPBrRwf.js";var B=`precision highp float;

attribute vec3 position;
varying vec2 vUv;

void main() {
  vUv = position.xy * 0.5 + 0.5;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}`,ie=`precision highp float;

uniform sampler2D uVelocity;
uniform sampler2D uDye;
uniform vec2  uTexel;       
uniform float uDt;
uniform float uDissipation;
uniform float uGravity;     
uniform float uBreath;      
uniform float uTime;
uniform float uAspect;

varying vec2 vUv;

vec2 breath(vec2 uv, float t) {
  vec2 p = vec2(uv.x * uAspect, uv.y);
  float k1 = 4.10, k2 = 3.05;
  
  float sx = sin(k1 * p.x + 0.21 * t);
  float cx = cos(k1 * p.x + 0.21 * t);
  float sy = sin(k2 * p.y - 0.13 * t);
  float cy = cos(k2 * p.y - 0.13 * t);
  vec2 v = vec2(k2 * sx * cy, -k1 * cx * sy);
  
  float s2x = sin(1.63 * p.x - 0.09 * t);
  float c2x = cos(1.63 * p.x - 0.09 * t);
  float s2y = sin(2.11 * p.y + 0.07 * t);
  float c2y = cos(2.11 * p.y + 0.07 * t);
  v += 1.45 * vec2(2.11 * s2x * c2y, -1.63 * c2x * s2y);
  return v;
}

void main() {
  vec2 v0 = texture2D(uVelocity, vUv).xy;
  vec2 coord = vUv - v0 * uDt * uTexel;
  vec2 v = texture2D(uVelocity, coord).xy;

  
  
  float ink = texture2D(uDye, vUv).x;
  v.y -= uGravity * ink * uDt;

  v += breath(vUv, uTime) * uBreath * uDt;

  v *= 1.0 / (1.0 + uDt * uDissipation);

  
  
  
  
  gl_FragColor = vec4(clamp(v, -2400.0, 2400.0), 0.0, 1.0);
}`,ne=`precision highp float;

uniform sampler2D uDye;
uniform sampler2D uVelocity;
uniform vec2  uTexelSim;    
uniform vec2  uTexelDye;    
uniform float uDt;
uniform vec4  uDissipation; 
uniform float uEdgeFade;
uniform float uFloorSink;

varying vec2 vUv;

vec2 flow(vec2 uv) {
  return texture2D(uVelocity, uv).xy * uDt * uTexelSim;
}

void main() {
  vec2 p1 = vUv - flow(vUv);
  vec4 d1 = texture2D(uDye, p1);

#ifdef BFECC
  vec4 d0 = texture2D(uDye, vUv);
  vec4 d2 = texture2D(uDye, p1 + flow(p1));
  vec4 dc = d1 + 0.5 * (d0 - d2);

  vec4 a = texture2D(uDye, p1 + vec2(-uTexelDye.x, -uTexelDye.y));
  vec4 b = texture2D(uDye, p1 + vec2( uTexelDye.x, -uTexelDye.y));
  vec4 c = texture2D(uDye, p1 + vec2(-uTexelDye.x,  uTexelDye.y));
  vec4 d = texture2D(uDye, p1 + vec2( uTexelDye.x,  uTexelDye.y));
  vec4 lo = min(min(a, b), min(c, d));
  vec4 hi = max(max(a, b), max(c, d));
  d1 = clamp(dc, lo, hi);
#endif

  
  
  
  
  float sink = 1.0 + uFloorSink * (1.0 - smoothstep(0.0, 0.26, vUv.y))
                   + uFloorSink * 0.45 * (1.0 - smoothstep(0.0, 0.17, 1.0 - vUv.y));
  d1 /= (1.0 + uDt * uDissipation * sink);

  
  
  vec2 e = smoothstep(vec2(0.0), vec2(uEdgeFade), vUv) *
           smoothstep(vec2(0.0), vec2(uEdgeFade), 1.0 - vUv);
  d1 *= e.x * e.y;

  gl_FragColor = max(d1, vec4(0.0));
}`,re=`precision highp float;

#ifndef MAX_SPLATS
#define MAX_SPLATS 12
#endif

uniform sampler2D uTarget;
uniform vec2  uPos[MAX_SPLATS];
uniform vec2  uVec[MAX_SPLATS];   
uniform vec4  uMeta[MAX_SPLATS];  
uniform int   uCount;
uniform float uAspect;
uniform float uScrollForce;       
uniform float uTime;

varying vec2 vUv;

void main() {
  vec2 v = texture2D(uTarget, vUv).xy;

  for (int i = 0; i < MAX_SPLATS; i++) {
    if (i >= uCount) break;
    vec2 d = (vUv - uPos[i]) * vec2(uAspect, 1.0);
    float k = exp(-dot(d, d) / uMeta[i].x);
    v += uVec[i] * k;
  }

  
  
  
  if (abs(uScrollForce) > 0.0001) {
    float w = sin(vUv.x * 8.7 + uTime * 0.31) * 0.34
            + sin(vUv.x * 3.1 - 1.71) * 0.46;
    float prof = smoothstep(0.0, 0.16, vUv.y) * smoothstep(0.0, 0.16, 1.0 - vUv.y);
    v += vec2(w * uScrollForce * 0.30, uScrollForce) * prof;
  }

  gl_FragColor = vec4(v, 0.0, 1.0);
}`,le=`precision highp float;

#ifndef MAX_SPLATS
#define MAX_SPLATS 12
#endif

uniform sampler2D uTarget;
uniform sampler2D uFibre;
uniform float uHasFibre;
uniform vec2  uPos[MAX_SPLATS];
uniform vec4  uMeta[MAX_SPLATS];  
uniform int   uCount;
uniform float uAspect;
uniform float uScrollDye;
uniform float uTime;

varying vec2 vUv;

float hash12(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}

float vnoise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash12(i), hash12(i + vec2(1.0, 0.0)), f.x),
             mix(hash12(i + vec2(0.0, 1.0)), hash12(i + vec2(1.0, 1.0)), f.x), f.y);
}

float fibreAt(vec2 uv, float seed) {
  float a = seed * 0.907;
  float ca = cos(a), sa = sin(a);
  vec2 q = mat2(ca, -sa, sa, ca) * (uv * vec2(uAspect, 1.0)) * 1.12
         + vec2(seed * 0.37, seed * 0.71);
  float f;
  if (uHasFibre > 0.5) {
    f = 1.0 - dot(texture2D(uFibre, q).rgb, vec3(0.299, 0.587, 0.114));
    f = smoothstep(0.06, 0.72, f);
  } else {
    f = vnoise(q * 7.0) * 0.62 + vnoise(q * 17.0) * 0.38;
  }
  return f;
}

void main() {
  vec4 d = texture2D(uTarget, vUv);

  for (int i = 0; i < MAX_SPLATS; i++) {
    if (i >= uCount) break;
    vec2 off = (vUv - uPos[i]) * vec2(uAspect, 1.0);
    float k = exp(-dot(off, off) / uMeta[i].x);
    
    
    
    
    float f = fibreAt(vUv, uMeta[i].w);
    d.x += uMeta[i].y * k * mix(1.0, k, 0.65) * (0.34 + 1.05 * f);
    d.y += uMeta[i].z * k;
    d.z += uMeta[i].y * k * f * 2.1;
  }

  
  
  
  
  if (uScrollDye > 0.0001) {
    float prof = smoothstep(0.0, 0.30, vUv.y) * smoothstep(0.0, 0.30, 1.0 - vUv.y);
    float n = vnoise(vec2(vUv.x * uAspect * 6.1, vUv.y * 1.3 + uTime * 0.09));
    float ribbon = smoothstep(0.56, 0.94, n);
    d.x += uScrollDye * prof * ribbon * 0.55;
    d.z += uScrollDye * prof * ribbon * 1.5;
  }

  gl_FragColor = min(d, vec4(3.2, 2.4, 3.2, 1.0));
}`,ae=`precision highp float;

uniform sampler2D uVelocity;
uniform vec2 uTexel;
varying vec2 vUv;

void main() {
  float L = texture2D(uVelocity, vUv - vec2(uTexel.x, 0.0)).x;
  float R = texture2D(uVelocity, vUv + vec2(uTexel.x, 0.0)).x;
  float B = texture2D(uVelocity, vUv - vec2(0.0, uTexel.y)).y;
  float T = texture2D(uVelocity, vUv + vec2(0.0, uTexel.y)).y;

  
  
  vec2 c = texture2D(uVelocity, vUv).xy;
  if (vUv.x - uTexel.x < 0.0) L = -c.x;
  if (vUv.x + uTexel.x > 1.0) R = -c.x;
  if (vUv.y - uTexel.y < 0.0) B = -c.y;
  if (vUv.y + uTexel.y > 1.0) T = -c.y;

  gl_FragColor = vec4(0.5 * ((R - L) + (T - B)), 0.0, 0.0, 1.0);
}`,ue=`precision highp float;

uniform sampler2D uPressure;
uniform sampler2D uDivergence;
uniform vec2  uTexel;
uniform float uWarm;

varying vec2 vUv;

float sweep(vec2 uv) {
  float L = texture2D(uPressure, uv - vec2(uTexel.x, 0.0)).x;
  float R = texture2D(uPressure, uv + vec2(uTexel.x, 0.0)).x;
  float B = texture2D(uPressure, uv - vec2(0.0, uTexel.y)).x;
  float T = texture2D(uPressure, uv + vec2(0.0, uTexel.y)).x;
  float d = texture2D(uDivergence, uv).x;
  return ((L + R + B + T) * uWarm - d) * 0.25;
}

void main() {
  float L = sweep(vUv - vec2(uTexel.x, 0.0));
  float R = sweep(vUv + vec2(uTexel.x, 0.0));
  float B = sweep(vUv - vec2(0.0, uTexel.y));
  float T = sweep(vUv + vec2(0.0, uTexel.y));
  float d = texture2D(uDivergence, vUv).x;
  gl_FragColor = vec4((L + R + B + T - d) * 0.25, 0.0, 0.0, 1.0);
}`,oe=`precision highp float;

uniform sampler2D uPressure;
uniform sampler2D uVelocity;
uniform vec2 uTexel;
uniform vec2 uWall;   

varying vec2 vUv;

void main() {
  float L = texture2D(uPressure, vUv - vec2(uTexel.x, 0.0)).x;
  float R = texture2D(uPressure, vUv + vec2(uTexel.x, 0.0)).x;
  float B = texture2D(uPressure, vUv - vec2(0.0, uTexel.y)).x;
  float T = texture2D(uPressure, vUv + vec2(0.0, uTexel.y)).x;

  vec2 v = texture2D(uVelocity, vUv).xy - 0.5 * vec2(R - L, T - B);

  
  
  
  vec2 e = smoothstep(vec2(0.0), uWall, vUv) * smoothstep(vec2(0.0), uWall, 1.0 - vUv);
  v.x *= e.x;
  v.y *= e.y;

  gl_FragColor = vec4(v, 0.0, 1.0);
}`,he=`precision highp float;

uniform sampler2D uVelocity;
uniform vec2 uTexel;
varying vec2 vUv;

void main() {
  float L = texture2D(uVelocity, vUv - vec2(uTexel.x, 0.0)).y;
  float R = texture2D(uVelocity, vUv + vec2(uTexel.x, 0.0)).y;
  float B = texture2D(uVelocity, vUv - vec2(0.0, uTexel.y)).x;
  float T = texture2D(uVelocity, vUv + vec2(0.0, uTexel.y)).x;
  gl_FragColor = vec4(0.5 * ((R - L) - (T - B)), 0.0, 0.0, 1.0);
}`,ve=`precision highp float;

uniform sampler2D uVelocity;
uniform sampler2D uCurl;
uniform vec2  uTexel;
uniform float uEps;
uniform float uDt;

varying vec2 vUv;

void main() {
  float L = texture2D(uCurl, vUv - vec2(uTexel.x, 0.0)).x;
  float R = texture2D(uCurl, vUv + vec2(uTexel.x, 0.0)).x;
  float B = texture2D(uCurl, vUv - vec2(0.0, uTexel.y)).x;
  float T = texture2D(uCurl, vUv + vec2(0.0, uTexel.y)).x;
  float C = texture2D(uCurl, vUv).x;

  vec2 N = vec2(abs(R) - abs(L), abs(T) - abs(B)) * 0.5;
  N /= length(N) + 1e-5;

  
  vec2 force = uEps * vec2(N.y, -N.x) * C;

  vec2 v = texture2D(uVelocity, vUv).xy + force * uDt;
  gl_FragColor = vec4(clamp(v, -2400.0, 2400.0), 0.0, 1.0);
}`;const m=12,f=5;class ce{constructor(){this.pos=new Float32Array(m*2),this.vec=new Float32Array(m*2),this.meta=new Float32Array(m*4),this.count=0}reset(){this.count=0,this.pos.fill(0),this.vec.fill(0),this.meta.fill(0)}add(e,t,s,n,r,l,a,u){if(this.count>=m)return!1;const i=this.count++;return this.pos[i*2]=e,this.pos[i*2+1]=t,this.vec[i*2]=s,this.vec[i*2+1]=n,this.meta[i*4]=r*r,this.meta[i*4+1]=l,this.meta[i*4+2]=a,this.meta[i*4+3]=u,!0}}class fe{constructor(){this.t=new Float32Array(f),this.dur=new Float32Array(f),this.x=new Float32Array(f),this.y=new Float32Array(f),this.dx=new Float32Array(f),this.dy=new Float32Array(f),this.str=new Float32Array(f),this.rad=new Float32Array(f),this.seed=new Float32Array(f),this.live=new Uint8Array(f)}fire(e,t,s,n,r,l,a,u){let i=-1,c=-1,o=-1;for(let h=0;h<f;h++){if(!this.live[h]){i=h;break}const p=this.t[h]/this.dur[h];p>o&&(o=p,c=h)}i===-1&&(i=c),this.t[i]=0,this.dur[i]=l,this.x[i]=e,this.y[i]=t,this.dx[i]=s,this.dy[i]=n,this.str[i]=r,this.rad[i]=a,this.seed[i]=u,this.live[i]=1}get active(){for(let e=0;e<f;e++)if(this.live[e])return!0;return!1}pump(e,t,s,n){for(let r=0;r<f;r++){if(!this.live[r])continue;this.t[r]+=t;const l=this.t[r]/this.dur[r];if(l>=1){this.live[r]=0;continue}const a=Math.pow(Math.sin(Math.PI*Math.min(l,1)),1.35)*(1-l*.45),u=l*.3,i=this.str[r]*a;e.add(this.x[r]+this.dx[r]*u,this.y[r]+this.dy[r]*u,this.dx[r]*i*s,this.dy[r]*i*n,this.rad[r]*(.72+l*.85),.052*a*this.str[r],.3*a*this.str[r],this.seed[r]+l*3.1)}}}class T{constructor(){this.t=0,this.lx=0,this.ly=0,this.lx2=0,this.ly2=0,this.primed=!1}static ease(e){return e*e*(3-2*e)}static path(e,t){const s=T.ease(e),n=s*Math.PI;t[0]=.245+.455*s+.125*Math.sin(n*1.35),t[1]=.975-1.09*s+.052*Math.sin(n*2.6)}static path2(e,t){const s=T.ease((e+.47)%1),n=s*Math.PI;t[0]=.855-.47*s-.095*Math.sin(n*.95),t[1]=.76-.76*s+.085*Math.sin(n*1.85)}}const g=new Float32Array(2),pe={depthBuffer:!1,stencilBuffer:!1,generateMipmaps:!1,minFilter:L,magFilter:L,wrapS:R,wrapT:R};function b(v,e,t,s){const n=new Z(v,e,{...pe,format:t,type:s});return n.texture.colorSpace=ee,n}class U{constructor(e,t,s,n){this.a=b(e,t,s,n),this.b=b(e,t,s,n)}get read(){return this.a}get write(){return this.b}swap(){const e=this.a;this.a=this.b,this.b=e}setSize(e,t){this.a.setSize(e,t),this.b.setSize(e,t)}dispose(){this.a.dispose(),this.b.dispose()}}class me{constructor(e){this.ctx=e,this.renderer=e.renderer,this.ok=!1;const t=this.renderer.extensions;this.halfFloat=t.has("EXT_color_buffer_float")||t.has("EXT_color_buffer_half_float"),this.halfFloat&&(this.dyeSize=new x(1,1),this.simSize=new x(1,1),this.dyeTexel=new x(1,1),this.simTexel=new x(1,1),this.wall=new x(.02,.02),this.dissipation=new J(.46,1.7,.48,0),this._clearColor=new q,this.geo=new C,this.geo.setAttribute("position",new V(new Float32Array([-1,-1,0,3,-1,0,-1,3,0]),3)),this.passScene=new K,this.passScene.matrixWorldAutoUpdate=!1,this.mesh=new P(this.geo,null),this.mesh.frustumCulled=!1,this.mesh.matrixAutoUpdate=!1,this.passScene.add(this.mesh),this.mat={},this._buildMaterials(),this.iterations=10,this.vorticityOn=!0,this.ok=!0)}_pass(e,t,s){return new z({vertexShader:B,fragmentShader:e,uniforms:t,defines:{MAX_SPLATS:String(m),...s},depthTest:!1,depthWrite:!1,blending:X})}_buildMaterials(){const e={value:this.simTexel},t={value:this.dyeTexel};this.mat.curl=this._pass(he,{uVelocity:{value:null},uTexel:e}),this.mat.vorticity=this._pass(ve,{uVelocity:{value:null},uCurl:{value:null},uTexel:e,uEps:{value:5.2},uDt:{value:0}}),this.mat.advectVel=this._pass(ie,{uVelocity:{value:null},uDye:{value:null},uTexel:e,uDt:{value:0},uDissipation:{value:.22},uGravity:{value:20},uBreath:{value:1},uTime:{value:0},uAspect:{value:1}}),this.mat.splatVel=this._pass(re,{uTarget:{value:null},uPos:{value:new Float32Array(m*2)},uVec:{value:new Float32Array(m*2)},uMeta:{value:new Float32Array(m*4)},uCount:{value:0},uAspect:{value:1},uScrollForce:{value:0},uTime:{value:0}}),this.mat.divergence=this._pass(ae,{uVelocity:{value:null},uTexel:e}),this.mat.pressure=this._pass(ue,{uPressure:{value:null},uDivergence:{value:null},uTexel:e,uWarm:{value:1}}),this.mat.gradient=this._pass(oe,{uPressure:{value:null},uVelocity:{value:null},uTexel:e,uWall:{value:this.wall}}),this.mat.advectDye=this._pass(ne,{uDye:{value:null},uVelocity:{value:null},uTexelSim:e,uTexelDye:t,uDt:{value:0},uDissipation:{value:this.dissipation},uEdgeFade:{value:.055},uFloorSink:{value:4.5}},{BFECC:""}),this.mat.splatDye=this._pass(le,{uTarget:{value:null},uFibre:{value:null},uHasFibre:{value:0},uPos:{value:new Float32Array(m*2)},uMeta:{value:new Float32Array(m*4)},uCount:{value:0},uAspect:{value:1},uScrollDye:{value:0},uTime:{value:0}})}build(e,t){if(!this.ok)return;const s=this.ctx.quality,n=Math.max(e,1)/Math.max(t,1),r=h=>{const p=Math.min(Math.round(h*Math.max(n,1/n)),h*3);return n>=1?[p,h]:[h,p]},[l,a]=r(Math.max(64,s.fluidRes|0)),[u,i]=r(Math.max(32,s.simRes|0));this.aspect=n;for(const h of["advectVel","splatVel","splatDye"])this.mat[h].uniforms.uAspect.value=n;const c=!this.dye;(c||l!==this.dyeSize.x||a!==this.dyeSize.y||u!==this.simSize.x||i!==this.simSize.y)&&(c?(this.dye=new U(l,a,$,S),this.vel=new U(u,i,j,S),this.pressure=new U(u,i,F,S),this.divergence=b(u,i,F,S),this.curl=b(u,i,F,S)):(this.dye.setSize(l,a),this.vel.setSize(u,i),this.pressure.setSize(u,i),this.divergence.setSize(u,i),this.curl.setSize(u,i)),this.dyeSize.set(l,a),this.simSize.set(u,i),this.dyeTexel.set(1/l,1/a),this.simTexel.set(1/u,1/i),this.wall.set(2.5/u,2.5/i),this.clear())}applyQuality(){if(!this.ok)return;const e=this.ctx.quality.tier;this.iterations=e==="high"||e==="medium"?10:8,this.vorticityOn=!0,this.mat.vorticity.uniforms.uEps.value=e==="low"?3:5.2;const t=e!=="low",s=this.mat.advectDye,n="BFECC"in s.defines;t!==n&&(t?s.defines.BFECC="":delete s.defines.BFECC,s.needsUpdate=!0)}clear(){if(!this.ok)return;const e=this.renderer,t=e.getRenderTarget(),s=e.autoClear;e.getClearColor(this._clearColor);const n=e.getClearAlpha();e.setClearColor(0,0),e.autoClear=!0;for(const r of[this.dye.a,this.dye.b,this.vel.a,this.vel.b,this.pressure.a,this.pressure.b,this.divergence,this.curl])e.setRenderTarget(r),e.clear(!0,!1,!1);e.setRenderTarget(t),e.setClearColor(this._clearColor,n),e.autoClear=s}_blit(e,t){this.mesh.material=e,this.renderer.setRenderTarget(t),this.renderer.render(this.passScene,this.ctx.ortho)}step(e,t,s,n,r){if(!this.ok)return;const l=this.renderer,a=l.getRenderTarget(),u=l.autoClear;l.autoClear=!1;const i=this.mat,c=s.count>0;if(this.vorticityOn&&(i.curl.uniforms.uVelocity.value=this.vel.read.texture,this._blit(i.curl,this.curl),i.vorticity.uniforms.uVelocity.value=this.vel.read.texture,i.vorticity.uniforms.uCurl.value=this.curl.texture,i.vorticity.uniforms.uDt.value=e,this._blit(i.vorticity,this.vel.write),this.vel.swap()),i.advectVel.uniforms.uVelocity.value=this.vel.read.texture,i.advectVel.uniforms.uDye.value=this.dye.read.texture,i.advectVel.uniforms.uDt.value=e,i.advectVel.uniforms.uTime.value=t,this._blit(i.advectVel,this.vel.write),this.vel.swap(),c||n!==0){const o=i.splatVel.uniforms;o.uTarget.value=this.vel.read.texture,o.uPos.value.set(s.pos),o.uVec.value.set(s.vec),o.uMeta.value.set(s.meta),o.uCount.value=s.count,o.uScrollForce.value=n,o.uTime.value=t,this._blit(i.splatVel,this.vel.write),this.vel.swap()}i.divergence.uniforms.uVelocity.value=this.vel.read.texture,this._blit(i.divergence,this.divergence),i.pressure.uniforms.uDivergence.value=this.divergence.texture;for(let o=0;o<this.iterations;o++)i.pressure.uniforms.uPressure.value=this.pressure.read.texture,i.pressure.uniforms.uWarm.value=o===0?.74:1,this._blit(i.pressure,this.pressure.write),this.pressure.swap();if(i.gradient.uniforms.uPressure.value=this.pressure.read.texture,i.gradient.uniforms.uVelocity.value=this.vel.read.texture,this._blit(i.gradient,this.vel.write),this.vel.swap(),i.advectDye.uniforms.uDye.value=this.dye.read.texture,i.advectDye.uniforms.uVelocity.value=this.vel.read.texture,i.advectDye.uniforms.uDt.value=e,this._blit(i.advectDye,this.dye.write),this.dye.swap(),c||r>0){const o=i.splatDye.uniforms;o.uTarget.value=this.dye.read.texture,o.uPos.value.set(s.pos),o.uMeta.value.set(s.meta),o.uCount.value=s.count,o.uScrollDye.value=r,o.uTime.value=t,this._blit(i.splatDye,this.dye.write),this.dye.swap()}l.setRenderTarget(a),l.autoClear=u}setFibre(e){this.ok&&(this.mat.splatDye.uniforms.uFibre.value=e,this.mat.splatDye.uniforms.uHasFibre.value=e?1:0)}get dyeTexture(){return this.ok?this.dye.read.texture:null}get velocityTexture(){return this.ok?this.vel.read.texture:null}get curlTexture(){return this.ok?this.curl.texture:null}dispose(){if(this.ok){this.dye.dispose(),this.vel.dispose(),this.pressure.dispose(),this.divergence.dispose(),this.curl.dispose();for(const e in this.mat)this.mat[e].dispose();this.geo.dispose(),this.passScene.clear(),this.mesh.material=null,this.dye=this.vel=this.pressure=this.divergence=this.curl=null,this.ok=!1}}}var de=`precision highp float;

uniform sampler2D uDye;
uniform sampler2D uVelocity;
uniform sampler2D uFibre;
uniform float uHasFibre;

uniform vec2  uTexelDye;
uniform vec2  uTexelSim;
uniform float uAspect;
uniform float uTime;

uniform vec3  uInk;         
uniform vec3  uScatter;     
uniform vec3  uBrass;

uniform float uOpacity;     
uniform float uAbsorb;
uniform float uScatterGain;
uniform float uFilamentGain;
uniform float uBrassGain;
uniform float uSharpen;
uniform float uDetailScale;
uniform float uDetailWarp;
uniform float uFlowWarp;
uniform float uSpeedScale;
uniform float uGrain;
uniform float uGrainDrift;

varying vec2 vUv;

float hash12(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}

float vnoise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash12(i), hash12(i + vec2(1.0, 0.0)), f.x),
             mix(hash12(i + vec2(0.0, 1.0)), hash12(i + vec2(1.0, 1.0)), f.x), f.y);
}

float fibreTap(vec2 q) {
  if (uHasFibre > 0.5) {
    return 1.0 - dot(texture2D(uFibre, q).rgb, vec3(0.299, 0.587, 0.114));
  }
  return vnoise(q * 6.0) * 0.6 + vnoise(q * 15.0) * 0.4;
}

void main() {
  vec2 t = uTexelDye;
  vec4 c  = texture2D(uDye, vUv);
  float l = texture2D(uDye, vUv - vec2(t.x, 0.0)).x;
  float r = texture2D(uDye, vUv + vec2(t.x, 0.0)).x;
  float b = texture2D(uDye, vUv - vec2(0.0, t.y)).x;
  float u = texture2D(uDye, vUv + vec2(0.0, t.y)).x;

  
  
  
  float avg = (l + r + b + u) * 0.25;
  float ink = max(c.x + (c.x - avg) * uSharpen, 0.0);
  vec2  grad = vec2(r - l, u - b) * 0.5;
  float edge = clamp(length(grad) * 9.0, 0.0, 1.4);

  
  
  float striate = clamp(c.z / (ink + 0.03), 0.0, 2.0);

  
  
  
  
  
  
  
  
  
  vec2 vel = texture2D(uVelocity, vUv).xy;
  mat2 rot = mat2(0.4540, -0.8910, 0.8910, 0.4540);
  vec2 gdir = grad / (length(grad) + 1e-4);
  vec2 p = (vUv + vel * uTexelSim * uFlowWarp) * vec2(uAspect, 1.0);
  float d1 = fibreTap(p * uDetailScale + gdir * uDetailWarp * ink);
  float d2 = fibreTap(rot * p * uDetailScale * 0.63 - gdir * uDetailWarp * 1.7 * ink + 0.37);
  float det = smoothstep(0.07, 0.82, d1 * 0.72 + d2 * 0.28);

  float mass = ink * (0.40 + 0.68 * striate) * (0.28 + 1.30 * det);
  mass = min(mass, 24.0);

  float a = (1.0 - exp(-mass * uAbsorb)) * uOpacity;

  
  
  float thin = mass * exp(-mass * 2.15);
  vec3 emissive = uScatter * (thin + edge * 0.22) * uScatterGain;

  
  
  
  
  
  
  
  
  
  
  float fil = pow(det, 2.0) * smoothstep(0.012, 0.26, ink) * (0.34 + 0.60 * striate)
            * (0.18 + 0.92 * clamp(edge * 2.4, 0.0, 1.0));
  emissive += uScatter * fil * uFilamentGain;

  
  
  
  
  float speed = length(vel) * uSpeedScale;
  float hot = clamp(c.y, 0.0, 1.6) * smoothstep(0.18, 0.90, speed);
  emissive += uBrass * hot * pow(edge, 1.45) * (0.40 + 0.85 * det) * uBrassGain;

  
  
  
  emissive = emissive / (1.0 + emissive * 0.62);

  
  
  float n = hash12(gl_FragCoord.xy + floor(uTime * uGrainDrift) * 17.13) - 0.5;
  a *= 1.0 + n * uGrain;
  emissive *= 1.0 + n * uGrain * 0.7;
  a += (hash12(gl_FragCoord.xy * 1.7) - 0.5) * (1.0 / 255.0);

  a = clamp(a, 0.0, 0.86);

  gl_FragColor = vec4(uInk * a + emissive, a);
}`,ye=`precision highp float;

uniform sampler2D uDye;
uniform sampler2D uVelocity;
uniform sampler2D uCurl;
uniform int uMode;

varying vec2 vUv;

void main() {
  vec3 col;
  if (uMode == 1) {
    vec4 d = texture2D(uDye, vUv);
    col = vec3(d.x * 0.5, d.y * 0.5, d.z * 0.3);
  } else if (uMode == 2) {
    vec2 v = texture2D(uVelocity, vUv).xy * 0.004;
    col = vec3(v * 0.5 + 0.5, 0.35);
  } else {
    float c = texture2D(uCurl, vUv).x * 0.02;
    col = vec3(max(c, 0.0), 0.0, max(-c, 0.0)) + 0.04;
  }
  gl_FragColor = vec4(col, 1.0);
}`;function A(v){const e=new q(v),t=e.clone().convertLinearToSRGB();return{linear:e,display:t}}class xe{constructor(e){this.ctx=e,this.cInk=A("#0B1315"),this.cScatter=A("#C8D2D6"),this.cBrass=A("#C6A15B"),this.geo=new C,this.geo.setAttribute("position",new V(new Float32Array([-1,-1,0,3,-1,0,-1,3,0]),3)),this.material=new z({vertexShader:B,fragmentShader:de,uniforms:{uDye:{value:null},uVelocity:{value:null},uFibre:{value:null},uHasFibre:{value:0},uTexelDye:{value:new x(1/256,1/160)},uTexelSim:{value:new x(1/128,1/80)},uAspect:{value:1},uTime:{value:0},uInk:{value:this.cInk.display.clone()},uScatter:{value:this.cScatter.display.clone()},uBrass:{value:this.cBrass.display.clone()},uOpacity:{value:1},uAbsorb:{value:2.5},uScatterGain:{value:.3},uFilamentGain:{value:.27},uBrassGain:{value:.42},uSharpen:{value:1.15},uDetailScale:{value:2.6},uDetailWarp:{value:.085},uFlowWarp:{value:.32},uSpeedScale:{value:.01},uGrain:{value:.19},uGrainDrift:{value:24}},transparent:!0,depthTest:!1,depthWrite:!1,blending:te,blendEquation:W,blendSrc:G,blendDst:O,blendEquationAlpha:W,blendSrcAlpha:G,blendDstAlpha:O}),this.mesh=new P(this.geo,this.material),this.mesh.frustumCulled=!1,this.mesh.matrixAutoUpdate=!1,this.mesh.renderOrder=940,this.mesh.name="fluid:veil"}setOpacity(e){this.material.uniforms.uOpacity.value=e}setFibre(e){this.material.uniforms.uFibre.value=e,this.material.uniforms.uHasFibre.value=e?1:0}setStill(e){this.material.uniforms.uGrainDrift.value=e?0:24}setLinearOutput(e){const t=this.material.uniforms;t.uInk.value.copy(e?this.cInk.linear:this.cInk.display),t.uScatter.value.copy(e?this.cScatter.linear:this.cScatter.display),t.uBrass.value.copy(e?this.cBrass.linear:this.cBrass.display)}resize(e,t){this.material.uniforms.uAspect.value=e/Math.max(t,1)}dispose(){this.mesh.removeFromParent(),this.geo.dispose(),this.material.dispose()}}class De{constructor(e){this.geo=new C,this.geo.setAttribute("position",new V(new Float32Array([-1,-1,0,3,-1,0,-1,3,0]),3)),this.material=new z({vertexShader:B,fragmentShader:ye,uniforms:{uDye:{value:null},uVelocity:{value:null},uCurl:{value:null},uMode:{value:e==="vel"?2:e==="curl"?3:1}},depthTest:!1,depthWrite:!1,blending:X,transparent:!0}),this.mesh=new P(this.geo,this.material),this.mesh.frustumCulled=!1,this.mesh.matrixAutoUpdate=!1,this.mesh.renderOrder=999,this.mesh.name="fluid:debug"}dispose(){this.mesh.removeFromParent(),this.geo.dispose(),this.material.dispose()}}const y=(v,e,t)=>v<e?e:v>t?t:v,ge=(v,e,t)=>{const s=y((t-v)/(e-v),0,1);return s*s*(3-2*s)},M=(v,e,t,s)=>v+(e-v)*(1-Math.exp(-t*s)),k=190,Te=6,Se=.68;class we{static id="fluid";constructor(e){this.ctx=e,this.splats=new ce,this.emitters=new fe,this.stroke=new T,this.lastUx=.5,this.lastUy=.5,this.pointerPrimed=!1,this.seed=0,this.lastScrollY=0,this.scrollForce=0,this.scrollDye=0,this.scrollPrimed=!1,this.stepEvery=1,this.pendingDt=0,this.warm=0,this.frozen=!1,this.idleT=0,this._present=1,this._veilMaster=1,this._veilEnabled=!0,this._offs=[];const t=new URLSearchParams(location.search);this.strokeOn=t.get("stroke")==="1",this.debugMode=t.get("fluid")}async init(){const e=this.ctx;if(this.solver=new me(e),!this.solver.ok){console.warn("[fluid] half-float render targets unavailable — solver disabled");return}if(this.solver.applyQuality(),this.solver.build(e.sizes.w,e.sizes.h),this.veil=new xe(e),this.veil.resize(e.sizes.w,e.sizes.h),this.veil.material.uniforms.uTexelDye.value=this.solver.dyeTexel,this.veil.material.uniforms.uTexelSim.value=this.solver.simTexel,this.veil.setStill(e.reducedMotion),e.scene.add(this.veil.mesh),this.debugMode&&(this.debug=new De(this.debugMode),e.scene.add(this.debug.mesh)),e.assetLib){const t=e.assetLib.load("mood-01",{srgb:!1,aniso:4,wrap:!0});e.assetLib.preload(["mood-01"]).then(()=>{!this.solver?.ok||!t.image||(t.wrapS=t.wrapT=se,t.needsUpdate=!0,this.solver.setFibre(t),this.veil?.setFibre(t))}).catch(()=>{})}this._offs.push(e.bus.on("quality",()=>{this.solver.applyQuality(),this.solver.build(e.sizes.w,e.sizes.h),this.veil.material.uniforms.uTexelDye.value=this.solver.dyeTexel,this.veil.material.uniforms.uTexelSim.value=this.solver.simTexel,this.stepEvery=e.quality.tier==="low"?2:1})),this._offs.push(e.bus.on("nav:open",()=>{this.impulse(.84,.88,-.58,-.6,1,1.05,.24)})),this._offs.push(e.bus.on("nav:close",()=>{this.impulse(.5,.14,.14,.86,.72,.95,.28)})),this._offs.push(e.bus.on("work:open",()=>{this.impulse(.5,.52,.66,.26,.88,.9,.25),this.impulse(.5,.48,-.66,-.26,.88,.9,.25)})),this.stepEvery=e.quality.tier==="low"?2:1,this._publish()}splat(e,t,s,n,r=1){if(!this.solver?.ok||this.frozen)return;const l=y(r,0,4),a=this.solver.simSize.x,u=this.solver.simSize.y,i=Math.hypot(s,n),c=y(i/2.2,0,1);this.seed=(this.seed+.618)%64,this.splats.add(e,t,s*a*l,n*u*l,(.034+.02*c)*(.6+.4*l),(.03+.105*c)*l,(.1+.62*c)*l,this.seed)}splatFromEvent(e,t=0,s=0,n=1){const r=this.ctx.sizes.w||1,l=this.ctx.sizes.h||1,a=e.touches?.[0]||e;this.splat((a.clientX||0)/r,1-(a.clientY||0)/l,t,s,n)}impulse(e,t,s,n,r=1,l=.95,a=.24){!this.solver?.ok||this.frozen||(this.seed=(this.seed+.618)%64,this.emitters.fire(e,t,s,n,y(r,0,3),l,a,this.seed))}setVeilOpacity(e){this._veilMaster=y(e,0,1),this.veil?.setOpacity(this._veilMaster*this._present)}setVeilEnabled(e){this._veilEnabled=!!e,this.veil&&(this.veil.mesh.visible=this._veilEnabled&&this._present>0)}setLinearOutput(e){this.veil?.setLinearOutput(!!e)}setStroke(e){this.strokeOn=!!e,this.stroke.primed=!1}onResize(e,t){this.solver?.ok&&(this.solver.build(e,t),this.veil.material.uniforms.uTexelDye.value=this.solver.dyeTexel,this.veil.material.uniforms.uTexelSim.value=this.solver.simTexel,this.veil.resize(e,t),this.pointerPrimed=!1,this.scrollPrimed=!1)}update(e,t){const s=this.ctx;if(!this.solver?.ok)return;if(s.reducedMotion)return this._updateStill(t);this._gatherPointer(e),this._gatherScroll(e),this.emitters.pump(this.splats,e,this.solver.simSize.x,this.solver.simSize.y);const n=this.splats.count>0||this.scrollForce!==0||this.scrollDye!==0;this.idleT=n?0:this.idleT+e;const r=this.idleT>5?this.stepEvery*4:this.stepEvery,l=this.idleT>9?0:1;if(this._present=M(this._present,l,l>this._present?9:.9,e),this._present<.004&&(this._present=l?.004:0),this.veil.setOpacity(this._veilMaster*this._present),this.veil.mesh.visible=this._veilEnabled&&this._veilMaster*this._present>0,this.idleT>14){this.pendingDt=0;return}if(this.pendingDt+=e,s.frame%r!==0)return;const a=y(this.pendingDt,1/240,1/24);this.pendingDt=0,this.solver.step(a,t,this.splats,this.scrollForce,this.scrollDye),this.splats.reset(),this._sync(t)}_updateStill(e){if(!this.frozen){this.solver.mat.advectVel.uniforms.uBreath.value=.35;for(let t=0;t<Te&&this.warm<k;t++,this.warm++){const s=this.warm/60;this.warm<k*Se&&this._gatherStroke(1/60,s,!0),this.solver.step(1/60,s,this.splats,0,0),this.splats.reset()}this._sync(e),this.warm>=k&&(this.frozen=!0,this.solver.mat.advectVel.uniforms.uBreath.value=0)}}_sync(e){const t=this.veil.material.uniforms;if(t.uDye.value=this.solver.dyeTexture,t.uVelocity.value=this.solver.velocityTexture,t.uTime.value=e,this.pub&&(this.pub.texture=this.solver.dyeTexture,this.pub.velocity=this.solver.velocityTexture),this.debug){const s=this.debug.material.uniforms;s.uDye.value=this.solver.dyeTexture,s.uVelocity.value=this.solver.velocityTexture,s.uCurl.value=this.solver.curlTexture}}_gatherPointer(e){if(this.strokeOn)return this._gatherStroke(e,this.ctx.time,!1);const t=this.ctx.pointer,s=t.nx*.5+.5,n=t.ny*.5+.5;if(!t.inside||!this.pointerPrimed){this.lastUx=s,this.lastUy=n,this.pointerPrimed=t.inside;return}const r=s-this.lastUx,l=n-this.lastUy;if(this.lastUx=s,this.lastUy=n,Math.abs(r)<1e-5&&Math.abs(l)<1e-5&&!t.down)return;const a=1/Math.max(e,.001),u=r*a*.55+t.vx*.5*.45,i=l*a*.55+t.vy*.5*.45;this._trail(this.lastUx-r,this.lastUy-l,r,l,u,i,t.down?1.55:1)}_gatherStroke(e,t,s){const n=this.stroke;n.t+=e;const l=n.t/2.55%1;T.path(l,g);const a=g[0],u=g[1];T.path2(l,g);const i=g[0],c=g[1];if(!n.primed){n.lx=a,n.ly=u,n.lx2=i,n.ly2=c,n.primed=!0;return}const o=1/Math.max(e,.001),h=a-n.lx,p=u-n.ly,d=i-n.lx2,D=c-n.ly2;Math.hypot(h,p)<.25&&this._trail(n.lx,n.ly,h,p,h*o,p*o,s?1.7:1),Math.hypot(d,D)<.25&&this._trail(n.lx2,n.ly2,d,D,d*o,D*o,(s?1.7:1)*.62),n.lx=a,n.ly=u,n.lx2=i,n.ly2=c}_trail(e,t,s,n,r,l,a){const u=this.solver.simSize.x,i=this.solver.simSize.y,c=Math.hypot(s,n),o=Math.hypot(r,l);if(o<.001&&a<=1)return;const h=Math.min(o,3.6),p=o>1e-5?h/o:0,d=y(h/1.25,0,1),D=Math.min(4,Math.max(1,Math.ceil(c/.018))),w=1/D,I=r*p*u*1.45*a*w,H=l*p*i*1.45*a*w,N=(.02+.016*d)*(a>1?1.35:1),Y=(.02+.098*d)*a,Q=(.1+.85*d)*a;for(let _=1;_<=D;_++){const E=_*w;if(this.seed=(this.seed+.618)%64,!this.splats.add(e+s*E,t+n*E,I,H,N,Y,Q,this.seed))break}}_gatherScroll(e){const t=this.ctx,s=t.scroll.y||0;if(!this.scrollPrimed){this.lastScrollY=s,this.scrollPrimed=!0;return}const n=(s-this.lastScrollY)/Math.max(t.sizes.h,1);this.lastScrollY=s;const r=n/Math.max(e,.001),l=ge(.3,2.1,Math.abs(r)),a=Math.sign(r)*l*Math.min(Math.abs(r),6)*this.solver.simSize.y*.085;this.scrollForce=M(this.scrollForce,a,9,e),Math.abs(this.scrollForce)<.02&&(this.scrollForce=0),this.scrollDye=M(this.scrollDye,l*.0055,7,e),this.scrollDye<2e-4&&(this.scrollDye=0)}_publish(){const e=this.solver;this.pub={texture:e.dyeTexture,velocity:e.velocityTexture,res:this.ctx.quality.fluidRes,dyeSize:e.dyeSize,simSize:e.simSize,texelDye:e.dyeTexel,texelSim:e.simTexel,splat:(t,s,n,r,l)=>this.splat(t,s,n,r,l),splatFromEvent:(t,s,n,r)=>this.splatFromEvent(t,s,n,r),impulse:(t,s,n,r,l,a,u)=>this.impulse(t,s,n,r,l,a,u),setVeilOpacity:t=>this.setVeilOpacity(t),setVeilEnabled:t=>this.setVeilEnabled(t),setLinearOutput:t=>this.setLinearOutput(t),setStroke:t=>this.setStroke(t),veil:this.veil.mesh},this.ctx.fluid=this.pub}dispose(){for(const e of this._offs)e();this._offs.length=0,this.debug?.dispose(),this.veil?.dispose(),this.solver?.dispose(),this.debug=null,this.veil=null,this.solver=null,this.ctx.fluid===this.pub&&(this.ctx.fluid=null),this.pub=null}}export{we as default};
