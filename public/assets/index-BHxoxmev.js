import{v as V}from"./index-BMUe7iZr.js";import{T as z}from"./content-DRgEOFBw.js";import{z as S,I as q,y as W,e as C,V as M,i as k,j as F,K as Y,D,s as j,G as U,k as H}from"./three-sQPBrRwf.js";const f=12,I=`
uniform float uTime;
uniform float uRow;        // 1 / (rings - 1): one ring step in t
uniform float uFieldW;     // world width the 12 slots spread across
uniform float uTop;        // world y the strands hang from (offscreen)
uniform float uWidth;      // half ribbon width, world units (device-px locked)
uniform float uMotion;     // 0 under prefers-reduced-motion
uniform float uGrow;       // 0..1 master reveal, staggered per filament
uniform vec2  uPush;       // damped pointer + scroll shear, applied at the tip
uniform float uExcite[${f}];
uniform float uPulse[${f}];
uniform float uAnchor[${f}]; // world-x drift toward the hovered card
#ifdef GLOW
uniform float uGlowW;      // width multiplier of the additive halo pass
#endif

attribute vec4 iA;         // u slot (0..1), rest z, length, sway phase
attribute vec4 iB;         // filament id, seed, sway amp, brightness
attribute vec2 iC;         // width multiplier, role (0 core / 1 echo)

varying vec3  vWorld;
varying vec3  vT;
varying vec3  vB;
varying vec3  vNf;
varying float vSide;
varying float vT01;
varying float vEx;
varying float vGlow;
varying float vBright;
varying float vFace;
varying float vSeed;

/*
 * The strand: anchored at uTop, drawn downward by g (the reveal — a raindrop
 * running the line in), swaying as a damped pendulum. Amplitude grows with
 * the fraction fallen (root pinned, tip free) on a 1.55 power — the heavy,
 * wet curve, not a springy sine. Under reduced motion uMotion zeroes the
 * clock term, so the same sinusoids freeze into a gentle static bend.
 */
vec3 strandPoint(float t, float g, float ex, float pu, float ax) {
  float te = t * g;
  float sag = pow(te, 1.55);
  float tt = uTime * (0.30 + 0.11 * iB.y) * uMotion + iA.w;
  // excitement widens the sway; frozen frames keep a calmer built-in bend
  float amp = iB.z * mix(0.55, 1.0 + 2.2 * ex, uMotion);
  float sway = sin(tt + te * 2.3) * 0.62
             + sin(tt * 1.71 + te * 4.7 + iB.y * 6.28) * 0.26
             + sin(tt * 0.53 + iB.y * 3.1) * 0.12;
  float swz  = sin(tt * 0.83 + te * 3.4 + 1.7);
  // the travelling drop drags the strand a touch as it passes
  float drop = exp(-pow((t - pu) * 8.5, 2.0));
  // the drift toward a hovered card arrives root-first, like attention turning
  float x = (iA.x - 0.5) * uFieldW
          + ax * mix(1.0, 0.72, te)
          + sway * amp * sag
          + uPush.x * sag
          + drop * 0.020 * uMotion * sin(tt * 2.6);
  // an excited strand reaches further down — to the foot of its card
  float y = uTop - te * iA.z * (1.0 + 0.22 * ex) - drop * 0.016;
  // an excited strand steps toward the camera — nearer, larger, more present
  float z = iA.y + (0.45 - iA.y) * 0.55 * ex
          + swz * amp * 0.55 * sag + uPush.y * sag * 0.4;
  return vec3(x, y, z);
}

void main() {
  int id = int(iB.x + 0.5);
  float ex = uExcite[id];
  float pu = uPulse[id];
  float ax = uAnchor[id];

  // staggered reveal: each filament starts at its own moment, heavy ease-out
  float dly = fract(iB.y * 7.13) * 0.42;
  float g0 = clamp((uGrow - dly) / 0.58, 0.0, 1.0);
  float g = 1.0 - pow(1.0 - g0, 3.0);

  float t = position.y;
  vec3 p  = strandPoint(t, g, ex, pu, ax);
  vec3 p2 = strandPoint(t + uRow, g, ex, pu, ax); // extrapolates fine past 1

  vec3 Tn = normalize(p2 - p);
  vec3 Vv = normalize(cameraPosition - p);
  vec3 c  = cross(Tn, Vv);
  float face = length(c);
  vec3 Bn = c / max(face, 1e-4);

  float drop = exp(-pow((t - pu) * 8.5, 2.0));
  float taper = mix(1.0, 0.46, t);
  float w = uWidth * iC.x * taper
          * (1.0 + (0.55 * ex + 1.15 * drop) * uMotion);
#ifdef GLOW
  // the halo swells mid-strand, not at the anchor — a lantern, not a spotlight.
  // Excitement widens it into a soft column of light behind the hovered card,
  // which is what carries the hover through the section's ink veil.
  w *= uGlowW * (0.40 + 0.60 * smoothstep(0.0, 0.35, t)) * (1.0 + 3.0 * ex);
#endif

  vec3 world = p + Bn * (position.x * w);

  // the luminous head while the line draws itself in, plus the passing drop
  float head = exp(-pow((t - g) * 7.0, 2.0)) * (1.0 - g * g);
#ifdef GLOW
  // the halo sees a broader, heavier drop — the knot of light that travels
  vGlow = drop * 1.7 + exp(-pow((t - pu) * 4.0, 2.0)) * 0.9 + head * 1.3;
#else
  vGlow = drop + head * 1.3;
#endif
  vEx = ex;
  vBright = iB.w;
  vSide = position.x;
  vT01 = t;
  vSeed = iB.y;
  vFace = smoothstep(0.04, 0.30, face);
  vWorld = world;
  vT = Tn;
  vB = Bn;
  vNf = normalize(cross(Bn, Tn));

  gl_Position = projectionMatrix * viewMatrix * vec4(world, 1.0);
}
`,$=`
uniform vec3  uKeyPos;
uniform vec3  uKeyCol;
uniform vec3  uKeyDir;
uniform vec2  uKeyCone;
uniform vec3  uRimPos;
uniform vec3  uRimCol;
uniform vec3  uRimDir;
uniform vec2  uRimCone;
uniform float uLightScale;
uniform vec3  uAmbSky;
uniform vec3  uAmbGround;
uniform float uAmbInt;
uniform vec3  uBaseCol;    // fibre albedo at rest — dim silver-bone
uniform vec3  uHotCol;     // fibre albedo excited — brass
uniform vec3  uEmisBase;   // luminous core at rest
uniform vec3  uEmisHot;    // luminous core excited
uniform float uEmisAmt;
uniform float uPulseGain;
uniform float uFade;       // section presence master

varying vec3  vWorld;
varying vec3  vT;
varying vec3  vB;
varying vec3  vNf;
varying float vSide;
varying float vT01;
varying float vEx;
varying float vGlow;
varying float vBright;
varying float vFace;
varying float vSeed;

//__FOG__

float strandSpec(vec3 T, vec3 V, vec3 L, float e) {
  float tl = dot(T, L);
  float tv = dot(T, V);
  float c = tl * tv + sqrt(max(0.0, 1.0 - tl * tl)) * sqrt(max(0.0, 1.0 - tv * tv));
  return pow(max(c, 0.0), e);
}

void main() {
  float cov = smoothstep(1.0, 0.30, abs(vSide));
  // an excited strand stays lit to its end; a resting one dissolves away
  float tipA = 1.0 - smoothstep(0.70, 1.0, vT01) * (0.78 - 0.52 * vEx);
  float alpha = cov * tipA * vFace * uFade;
  if (alpha < 0.012) discard;

  vec3 T = normalize(vT);
  // flat ribbon shaded as a cylinder cross-section: lit side, turned side
  float aa = vSide * 1.25;
  vec3 N = normalize(normalize(vB) * sin(aa) + normalize(vNf) * cos(aa));
  vec3 V = normalize(cameraPosition - vWorld);

  vec3 base = mix(uBaseCol, uHotCol, vEx);
  // specular shift jittered per strand, low-frequency along the length
  float j = 0.30 * sin(vT01 * 7.0 + vSeed * 61.0);
  vec3 T1 = normalize(T + N * (-0.085 + j * 0.05));

  vec3 col = vec3(0.0);

  // ---- key: warm, shaping --------------------------------------------------
  {
    vec3 d = uKeyPos - vWorld;
    float d2 = dot(d, d);
    vec3 L = d * inversesqrt(max(d2, 1e-6));
    float att = uLightScale / max(d2, 0.35);
    float cone = smoothstep(uKeyCone.x, uKeyCone.y, dot(-L, uKeyDir));
    float dif = mix(0.16, 1.0, sqrt(max(0.0, 1.0 - dot(T, L) * dot(T, L))));
    dif *= 0.45 + 0.55 * max(dot(N, L), 0.0);
    float s = strandSpec(T1, V, L, 30.0);
    col += uKeyCol * (att * cone) * (base * dif * 1.05 + vec3(1.0) * (s + s * s * s * 2.6) * 0.10);
  }

  // ---- rim: the hotter light — the band that draws a filament --------------
  {
    vec3 d = uRimPos - vWorld;
    float d2 = dot(d, d);
    vec3 L = d * inversesqrt(max(d2, 1e-6));
    float att = uLightScale / max(d2, 0.35);
    float cone = smoothstep(uRimCone.x, uRimCone.y, dot(-L, uRimDir));
    float dif = mix(0.12, 1.0, sqrt(max(0.0, 1.0 - dot(T, L) * dot(T, L))));
    float s = strandSpec(T1, V, L, 22.0);
    col += uRimCol * (att * cone) * (base * dif * 0.65 + vec3(1.0) * s * 0.22);
  }

  // ---- ambient -------------------------------------------------------------
  col += mix(uAmbGround, uAmbSky, N.y * 0.5 + 0.5) * base * uAmbInt;

  // ---- the luminous core — what survives the veil --------------------------
  float core = smoothstep(1.0, 0.0, abs(vSide));
  // fibre imperfection: the light along the line breathes, never uniform
  float fibre = 0.86 + 0.26 * sin(vT01 * 23.0 + vSeed * 37.0);
  vec3 emis = mix(uEmisBase, uEmisHot, vEx) * (vBright * uEmisAmt * fibre);
  col += emis * (0.35 + 0.65 * core * core);
  col += uEmisHot * (vGlow * uPulseGain * vBright);

  col = at13ApplyFog(col, vWorld, cameraPosition);

  gl_FragColor = vec4(col, alpha);

  #include <tonemapping_fragment>
  #include <colorspace_fragment>

  // premultiplied AFTER tone mapping, matching the site's hair pass
  gl_FragColor.rgb *= gl_FragColor.a;
}
`,Z=`
uniform vec3  uEmisBase;
uniform vec3  uEmisHot;
uniform float uPulseGain;
uniform float uGlowAmt;
uniform float uGlowHot;
uniform float uFade;

varying vec3  vWorld;
varying float vSide;
varying float vT01;
varying float vEx;
varying float vGlow;
varying float vBright;
varying float vFace;
varying float vSeed;

//__FOG__

void main() {
  float fall = exp(-vSide * vSide * 4.5);
  float tipA = 1.0 - smoothstep(0.55, 1.0, vT01) * (0.82 - 0.56 * vEx);
  float rootA = smoothstep(0.0, 0.22, vT01);
  float breathe = 0.80 + 0.34 * sin(vT01 * 11.0 + vSeed * 25.0);

  vec3 emis = mix(uEmisBase * uGlowAmt, uEmisHot * uGlowHot, vEx)
            + uEmisHot * (vGlow * uPulseGain);
  vec3 col = emis * (fall * tipA * rootA * breathe * vBright * vFace * uFade);

  // transmittance only: fogged energy minus what the fog itself would add
  vec3 fogZero = at13ApplyFog(vec3(0.0), vWorld, cameraPosition);
  col = max(at13ApplyFog(col, vWorld, cameraPosition) - fogZero, vec3(0.0));

  gl_FragColor = vec4(col, 1.0);

  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
`,O=r=>r-Math.floor(r),x=(r,t)=>O(Math.sin(r*127.1+t*311.7)*43758.5453);function X(r){const t=Math.max(20,Math.round((r.segments||18)*2)),e=r.strands>=2e3?3:r.strands>=900?2:1,o=Math.max(10,Math.round(t/3));return{rings:t,per:e,glowRings:o}}function N(){const r=[],t=Math.min(z.length,f);for(let e=0;e<t;e++){const o=String(z[e]?.no??e),s=/^\d+$/.test(o)?parseInt(o,10):40+e,n=(e+.5)/f;r.push({id:e,u:n+(x(s,1)-.5)*.05,z:-1.35+x(s,2)*1.95,len:4.1+x(s,3)*1.6,phase:x(s,4)*Math.PI*2,seed:x(s,5),amp:.045+x(s,6)*.075,thick:.78+x(s,7)*.5,bright:.72+x(s,8)*.5,num:s})}return r}function K(r){const t=new q,e=new Float32Array(r*2*3);for(let s=0;s<r;s++){const n=s/(r-1);e[s*2*3+0]=-1,e[s*2*3+1]=n,e[(s*2+1)*3+0]=1,e[(s*2+1)*3+1]=n}const o=new Uint16Array((r-1)*6);for(let s=0,n=0;s<r-1;s++){const i=s*2;o[n++]=i,o[n++]=i+1,o[n++]=i+2,o[n++]=i+1,o[n++]=i+3,o[n++]=i+2}return t.setAttribute("position",new W(e,3)),t.setIndex(new W(o,1)),t}function J(r){const{rings:t,per:e,glowRings:o}=X(r),s=N(),n=s.length,i=n*e,a=new Float32Array(i*4),l=new Float32Array(i*4),g=new Float32Array(i*2),_=(m,u,G,L,d,T,c,y,R)=>{const E=m*4;a[E+0]=u.u+G,a[E+1]=u.z+L,a[E+2]=u.len*T,a[E+3]=u.phase+d,l[E+0]=u.id,l[E+1]=O(u.seed+R*.37),l[E+2]=u.amp,l[E+3]=u.bright*y,g[m*2+0]=u.thick*c,g[m*2+1]=R};for(let m=0;m<n;m++)_(m,s[m],0,0,0,1,1,1,0);let b=n;for(let m=1;m<e;m++)for(let u=0;u<n;u++){const G=s[u];_(b++,G,(x(G.num,10+m)-.5)*.011,(x(G.num,20+m)-.5)*.26,1.4+1.9*m,.8+x(G.num,30+m)*.22,.6,.32,m)}const w=new S(a,4),h=new S(l,4),p=new S(g,2),A=K(t);A.setAttribute("iA",w),A.setAttribute("iB",h),A.setAttribute("iC",p),A.instanceCount=i;const v=K(o);return v.setAttribute("iA",w),v.setAttribute("iB",h),v.setAttribute("iC",p),v.instanceCount=n,{geo:A,glowGeo:v,rings:t,glowRings:o,per:e,instances:i}}const B=(r,t,e,o)=>r+(t-r)*(1-Math.exp(-e*o)),P=r=>Math.min(1,Math.max(0,r)),Q=(r,t,e)=>{const o=P((e-r)/(t-r));return o*o*(3-2*o)},tt=3.45,et=.62,ot=7,it=1.55,st=90;class lt{static id="designers";constructor(t){this.ctx=t,this._hover=-1,this._focus=-1,this._entered=!1,this._grow=0,this._gate=0,this._secTop=0,this._secH=1,this._parY=0,this._offs=[],this._dom=[],this._exTarget=new Float32Array(f),this._exPrev=new Float32Array(f)}async init(){const t=this.ctx,e=t.env,o=e?.palette,s=o?.boneDim?.clone()??new C("#9A958E"),n=o?.rimCool?.clone()??new C("#A6C8D6"),i=o?.brass?.clone()??new C("#C6A15B"),a=s.clone().lerp(n,.28).multiplyScalar(.9),l=s.clone().lerp(n,.42),g=i.clone().multiply(new C(1,.8,.42)).multiplyScalar(2.6);this.exArr=new Float32Array(f),this.puArr=new Float32Array(f).fill(-1),this.anArr=new Float32Array(f),this._anTarget=new Float32Array(f),this.params=N();const _={uTime:{value:0},uFieldW:{value:7},uTop:{value:tt},uWidth:{value:.0045},uMotion:{value:t.reducedMotion?0:1},uGrow:{value:0},uPush:{value:new M},uExcite:{value:this.exArr},uPulse:{value:this.puArr},uAnchor:{value:this.anArr},uEmisBase:{value:l},uEmisHot:{value:g},uPulseGain:{value:4.5},uGlowAmt:{value:.7},uGlowHot:{value:2.8},uFade:{value:0}};this.uni=_;const b=e?.fog?.glsl??`vec3 at13ApplyFog(vec3 c, vec3 w, vec3 v) { return c; }
`;this.matLit=new k({vertexShader:I,fragmentShader:$.replace("//__FOG__",b),transparent:!0,depthWrite:!1,depthTest:!0,side:D,blending:Y,premultipliedAlpha:!0,uniforms:{..._,uRow:{value:1/47},uKeyPos:{value:new F},uKeyCol:{value:new C},uKeyDir:{value:new F(0,-1,0)},uKeyCone:{value:new M(.7,.99)},uRimPos:{value:new F},uRimCol:{value:new C},uRimDir:{value:new F(0,-1,0)},uRimCone:{value:new M(.5,.98)},uLightScale:{value:.16},uAmbSky:{value:o?.skyDim?.clone()??new C("#18232A")},uAmbGround:{value:o?.groundDim?.clone()??new C("#0B0908")},uAmbInt:{value:.85},uBaseCol:{value:a},uHotCol:{value:i.clone()},uEmisAmt:{value:3}}}),e?.applyFog?.(this.matLit),this.matGlow=new k({defines:{GLOW:""},vertexShader:I,fragmentShader:Z.replace("//__FOG__",b),transparent:!0,depthWrite:!1,depthTest:!0,side:D,blending:j,premultipliedAlpha:!0,uniforms:{..._,uRow:{value:1/15},uGlowW:{value:10}}}),e?.applyFog?.(this.matGlow);const w=(h,p)=>{if(!h)return;const A=h.angle??.5,v=h.penumbra??.9;p.set(Math.cos(A),Math.cos(A*(1-v)))};w(e?.key,this.matLit.uniforms.uKeyCone.value),w(e?.rim,this.matLit.uniforms.uRimCone.value),this._buildGeometry(),this.group=new U,this.group.visible=!1,this.group.matrixAutoUpdate=!0,this.group.add(this.meshLit,this.meshGlow),t.scene.add(this.group),this._wireDom(),this._offs.push(t.bus.on("quality",()=>this._rebuild()),t.bus.on("section:enter",h=>{const p=typeof h=="string"?h:h?.id??h?.el?.id;this._entered=p==="team",this._measure()}),t.bus.on("lang",()=>{this._hover=-1,this._focus=-1})),this.onResize(t.sizes.w,t.sizes.h,t.sizes.dpr),t.designers={group:this.group,uniforms:this.uni,excite:(h,p=!0)=>{h>=0&&h<f&&(p?this._hover=h:this._hover=-1)}}}_buildGeometry(){const t=J(this.ctx.quality);if(this._built=t,this.matLit.uniforms.uRow.value=1/(t.rings-1),this.matGlow.uniforms.uRow.value=1/(t.glowRings-1),this.meshLit)this.meshLit.geometry=t.geo,this.meshGlow.geometry=t.glowGeo;else{this.meshLit=new H(t.geo,this.matLit),this.meshGlow=new H(t.glowGeo,this.matGlow);for(const e of[this.meshLit,this.meshGlow])e.frustumCulled=!1,e.castShadow=!1,e.receiveShadow=!1;this.meshLit.renderOrder=7,this.meshGlow.renderOrder=8}}_rebuild(){const t=[this.meshLit?.geometry,this.meshGlow?.geometry];this._buildGeometry();for(const e of t)e&&e!==this.meshLit.geometry&&e!==this.meshGlow.geometry&&e.dispose()}_wireDom(){if(this.teamEl=document.getElementById("team"),this.rail=document.querySelector("[data-team-rail]"),!this.rail)return;const t=i=>i?.closest?.("[data-team-card]")??null,e=i=>{if(!i)return-1;const a=parseInt(i.getAttribute("data-index")??"-1",10);return a>=0&&a<f?a:-1},o=i=>{const a=t(i.target);return a&&!(i.relatedTarget&&a.contains(i.relatedTarget))},s=(i,a)=>{if(i<0||!a||this.ctx.reducedMotion)return;const l=this.ctx.camera,g=this.params[i];if(!l||!g)return;const _=this.ctx.sizes.w||window.innerWidth||1,b=a.getBoundingClientRect(),w=b.left+b.width/2,h=Math.tan(l.fov*Math.PI/360)*(l.position.z-g.z)*(l.aspect||1),p=(w/_*2-1)*h;this._anTarget[i]=p-(g.u-.5)*this.uni.uFieldW.value},n=(i,a)=>{this.rail.addEventListener(i,a,{passive:!0}),this._dom.push([i,a])};n("pointerover",i=>{const a=t(i.target),l=e(a);l>=0&&(this._hover=l,s(l,a))}),n("pointerout",i=>{o(i)&&e(t(i.target))===this._hover&&(this._hover=-1)}),n("focusin",i=>{const a=t(i.target),l=e(a);l>=0&&(this._focus=l,s(l,a))}),n("focusout",i=>{o(i)&&e(t(i.target))===this._focus&&(this._focus=-1)})}_measure(){if(this.teamEl||(this.teamEl=document.getElementById("team")),!this.teamEl)return;const t=this.teamEl.getBoundingClientRect();this._secTop=t.top+window.scrollY,this._secH=Math.max(t.height,1)}onResize(){const t=this.ctx;if(!t.camera||!this.uni)return;const e=V(t.camera,0);this.uni.uFieldW.value=e.w*.94;const o=Math.max(2,t.sizes.h*t.sizes.dpr);this.uni.uWidth.value=1.9*e.h/o;const s=t.camera.aspect||1.6;this._dens=Math.min(1,Math.max(.45,s/1.2)),this._measure()}update(t){const e=this.ctx;if(!this.group||!this.uni)return;const o=e.reducedMotion,s=this.uni;e.frame%st===0&&this._measure();const n=e.scroll.y||0,i=e.sizes.h||1,a=this._secTop-n,l=a+this._secH,g=Math.min(l,i)-Math.max(a,0),_=P(g/i),b=Q(.1,.48,_);this._gate=o?this._entered?1:0:B(this._gate,this._entered?1:0,this._entered?2.6:1.9,t);const w=b*this._gate;if(this._grow=o?w:B(this._grow,w,w>this._grow?2.1:1.7,t),s.uGrow.value=this._grow,s.uFade.value=Math.pow(this._grow,.6)*(this._dens??1),this.group.visible=this._grow>.005,!this.group.visible)return;s.uMotion.value=o?0:1,o||(s.uTime.value=e.time);const h=P((n+i*.5-this._secTop)/this._secH),p=Math.max(-3,Math.min(3,e.scroll.velocity||0)),A=o?0:(.5-h)*.55+p*.045;this._parY=o?0:B(this._parY,A,3.2,t),this.group.position.y=this._parY;const v=s.uPush.value;o?v.set(0,0):(v.x=B(v.x,e.pointer.sx*.085,2.2,t),v.y=B(v.y,e.pointer.sy*.03,2.2,t));const m=this.exArr,u=this.puArr,G=this._exTarget,L=this._exPrev;for(let c=0;c<f;c++){const y=c===this._hover||c===this._focus?1:0;G[c]=y,!o&&y&&L[c]<.5&&u[c]<-.5&&(u[c]=-.06),L[c]=y,m[c]=o?y:B(m[c],y,y?ot:it,t),this.anArr[c]=o?0:B(this.anArr[c],y?this._anTarget[c]:0,y?3.4:1.1,t),u[c]>=-.5&&(u[c]+=t*et,u[c]>1.35&&(u[c]=y&&!o?-.18:-1))}const d=e.env,T=this.matLit.uniforms;d?.key&&(T.uKeyPos.value.copy(d.key.position),T.uKeyCol.value.copy(d.key.color).multiplyScalar(d.key.intensity),T.uKeyDir.value.copy(d.key.target.position).sub(d.key.position).normalize()),d?.rim&&(T.uRimPos.value.copy(d.rim.position),T.uRimCol.value.copy(d.rim.color).multiplyScalar(d.rim.intensity),T.uRimDir.value.copy(d.rim.target.position).sub(d.rim.position).normalize())}dispose(){const t=this.ctx;for(const e of this._offs)e?.();if(this._offs.length=0,this.rail)for(const[e,o]of this._dom)this.rail.removeEventListener(e,o);this._dom.length=0,this.group&&(t.scene.remove(this.group),this.meshLit?.geometry?.dispose(),this.meshGlow?.geometry?.dispose(),this.matLit?.dispose(),this.matGlow?.dispose()),this.group=this.meshLit=this.meshGlow=null,this.matLit=this.matGlow=this.uni=null,t.designers&&(t.designers=null)}}export{lt as default};
