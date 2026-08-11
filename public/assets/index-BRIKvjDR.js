import{g as O}from"./gsap-CzGW6FVa.js";import{c as mt,a as vt,w as gt,L as yt,d as xt,V as W,j as ct,u as F,i as wt,a6 as bt,K as kt,l as it,I as Mt,z as P,a7 as H,k as at}from"./three-sQPBrRwf.js";const E=4,Tt=3,L=14,At=3/4,ot=8/255,St=.85;function Dt(v){return v==="high"?1024:v==="medium"?768:512}class Ct{constructor(e){this.count=e,this.canvas=document.createElement("canvas"),this.g=this.canvas.getContext("2d"),this.texture=null,this.tileW=0,this.tileH=0,this.ready=new Array(e).fill(!1),this.uploaded=new Uint8Array(e),this.dirty=!1,this.lastUpload=0,this.keyGain=new Float32Array(e).fill(1),this.keyLift=new Float32Array(e),this.keyTrimR=new Float32Array(e).fill(1),this.keyTrimB=new Float32Array(e).fill(1),this._probe=null}allocate(e,t=8){this.tileW=Dt(e),this.tileH=Math.round(this.tileW/At),this.canvas.width=E*this.tileW,this.canvas.height=Tt*this.tileH,this.g.fillStyle="#101114",this.g.fillRect(0,0,this.canvas.width,this.canvas.height),this.ready.fill(!1),this.uploaded.fill(0),this.texture?.dispose();const s=new mt(this.canvas);s.colorSpace=vt,s.wrapS=s.wrapT=gt,s.generateMipmaps=!0,s.minFilter=yt,s.magFilter=xt,s.anisotropy=Math.min(4,t),this.texture=s,this.dirty=!0}window(e,t){const s=e%E,n=e/E|0,i=this.canvas.width,o=this.canvas.height,a=(s*this.tileW+L)/i,l=1-(n*this.tileH+L)/o,r=(this.tileW-2*L)/i,c=(this.tileH-2*L)/o;return t[0]=a,t[1]=l-c,t[2]=r,t[3]=c,t}blit(e,t){if(!t||!t.width||!this.tileW)return!1;const s=this.g,n=e%E,i=e/E|0,o=n*this.tileW,a=i*this.tileH;s.drawImage(t,o,a,this.tileW,this.tileH);const l=this.tileW-2*L,r=this.tileH-2*L,c=Math.max(l/t.width,r/t.height),f=l/c,y=r/c,u=(t.width-f)*.5,d=(t.height-y)*.5;s.drawImage(t,u,d,f,y,o+L,a+L,l,r),this.ready[e]=!0,this.dirty=!0;const g=this._measureKey(t);return this.keyGain[e]=g.gain,this.keyLift[e]=g.lift,this.keyTrimR[e]=g.trimR,this.keyTrimB[e]=g.trimB,!0}_measureKey(e){const t={gain:1,lift:0,trimR:1,trimB:1};try{this._probe||(this._probe=document.createElement("canvas"),this._probe.width=32,this._probe.height=43);const s=this._probe.getContext("2d",{willReadFrequently:!0});s.clearRect(0,0,32,43),s.drawImage(e,0,0,32,43);const n=s.getImageData(0,0,32,43).data,i=1376,o=new Float32Array(i);for(let w=0;w<i;w++){const k=w*4;o[w]=(.2126*n[k]+.7152*n[k+1]+.0722*n[k+2])/255}const a=Float32Array.from(o).sort(),l=Math.min(.3,Math.max(0,a[i*.02|0])),r=1/Math.max(1-l,.001),c=Math.max(0,a[i*.99|0]-l)*r,f=Math.pow(c,2.2)*1.78,y=Math.max(.35,Math.min(1,.62/Math.max(f,.001))),u=Math.pow(y,1/2.2);let d=0,g=0;for(let w=0;w<i;w++){const k=w*4;d+=Math.max(0,n[k]/255-l),g+=Math.max(0,n[k+2]/255-l)}d=d/i*r*u,g=g/i*r*u;const x=d+g,T=(x+ot)*.5,b=(x-ot)*.5,A=(w,k)=>Math.max(.8,Math.min(1.25,1+St*(w/Math.max(k,.001)-1)));return{gain:y,lift:l,trimR:A(T,d),trimB:A(b,g)}}catch{return t}}flush(e,t,s=!1){if(!(!this.dirty||!this.texture)&&!(!t&&(s||e-this.lastUpload<1200))){this.texture.needsUpdate=!0,this.dirty=!1,this.lastUpload=e;for(let n=0;n<this.count;n++)this.ready[n]&&(this.uploaded[n]=1)}}dispose(){this.texture?.dispose(),this.texture=null,this.canvas.width=this.canvas.height=1}}const Lt=`
#ifdef INSTANCED
attribute vec4 aXform;   // world centre xy, world size zw
attribute vec4 aDyn;     // charge, dim, pointer u, pointer v (plane uv)
attribute vec4 aMeta;    // exposure keyGain, depth weight, seed, visible
attribute vec4 aWin;     // atlas uv window: offset xy, scale zw
attribute vec4 aKey;     // keyLift, trimR, trimB, spare
#else
uniform vec4 aXform;
uniform vec4 aDyn;
uniform vec4 aMeta;
uniform vec4 aWin;
uniform vec4 aKey;
#endif

uniform vec2 uView;      // world size of the viewport at the gallery plane
uniform float uShear;    // damped scroll lean, signed
uniform float uPan;      // inner-parallax master amplitude
uniform vec4 uLens;      // post's barrel: k1, k2, corner, enabled
uniform vec2 uLensAspect;

varying vec2 vUv;
varying vec4 vDyn;
varying vec3 vMeta;      // keyGain, depth, seed
varying vec2 vSize;      // world size of this plane
varying vec4 vWin;
varying float vPan;
varying float vR2;       // lens-space radius², for the vignette counter
varying vec3 vKey;       // keyLift, trimR, trimB

void main() {
  vUv = uv;
  vDyn = aDyn;
  vMeta = aMeta.xyz;
  vSize = aXform.zw;
  vWin = aWin;
  vKey = aKey.xyz;

  // position.xy is a unit plane, -0.5..0.5
  vec2 local = position.xy * aXform.zw;

  // The lean: wet cloth dragged by the scroll. Sheared in x by height,
  // weighted by the plate's depth so near plates lean harder, plus a slight
  // centre-heavy bow so the plate bends rather than hinges.
  float lean = uShear * aMeta.y;
  local.x += position.y * aXform.w * lean;
  local.y -= (position.x * position.x - 0.0833) * aXform.w * lean * lean * 2.4;

  // aMeta.w gates visibility — a hidden instance collapses to a point
  local *= aMeta.w;

  // Inner parallax phase — how far this plate sits from the optical centre.
  vPan = clamp(aXform.y / max(uView.y, 1e-4), -0.75, 0.75) * uPan * aMeta.y;

  vec3 world = vec3(aXform.xy + local, 0.0);
  vec4 clip = projectionMatrix * modelViewMatrix * vec4(world, 1.0);

  // Pre-distort against post's lens. The composite samples the scene through
  // a barrel (magnifying the centre ~6%), which would push a DOM-synced plane
  // off its figure; drawing at the barrel's pre-image cancels it exactly.
  vec2 ndc = clip.xy / max(clip.w, 1e-5);
  vec2 pp = ndc * uLensAspect * 0.5;
  float r2 = dot(pp, pp);
  float d = (1.0 + uLens.x * r2 + uLens.y * r2 * r2) * uLens.z;
  ndc *= mix(1.0, d, uLens.w);
  clip.xy = ndc * clip.w;
  vR2 = dot(ndc * uLensAspect * 0.5, ndc * uLensAspect * 0.5);
  gl_Position = clip;
}
`,Ft=`
uniform sampler2D uAtlas;
uniform sampler2D uStrand;
uniform float uHasStrand;

uniform sampler2D uFluidVel;
uniform sampler2D uFluidDye;
uniform vec2 uFluidTexel;
uniform float uHasFluid;

uniform vec2 uResolution;     // device px of the scene target
uniform float uTime;
uniform float uPxPerWorld;    // css px per world unit at the gallery plane
uniform float uSplitPx;       // rgb split, css px
uniform float uOverscan;      // cover zoom that funds the parallax travel
uniform float uGain;          // veil compensation, linear
uniform vec3 uInkLift;        // the black point the shadows settle onto
uniform float uFilAmp;        // filament displacement, image-uv units
uniform vec2 uVig;            // post's vignette: uVigK, amount (0 = off)

#ifndef INSTANCED
uniform sampler2D uHiTex;
uniform float uHiMix;
#endif

varying vec2 vUv;
varying vec4 vDyn;
varying vec3 vMeta;      // keyGain, depth, seed
varying vec2 vSize;
varying vec4 vWin;
varying float vPan;
varying float vR2;
varying vec3 vKey;

const float IMG_ASPECT = 0.75;

float hash12(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}

vec3 toDisplay(vec3 c) { return pow(max(c, vec3(0.0)), vec3(1.0 / 2.2)); }
vec3 toLinear(vec3 c) { return pow(max(c, vec3(0.0)), vec3(2.2)); }

void main() {
  float charge = vDyn.x;
  float dim = vDyn.y;

  // ---- cover fit --------------------------------------------------------
  float pa = vSize.x / max(vSize.y, 1e-5);
  vec2 win = (pa > IMG_ASPECT) ? vec2(1.0, IMG_ASPECT / pa) : vec2(pa / IMG_ASPECT, 1.0);
  win /= uOverscan;
  vec2 iuv = 0.5 + (vUv - 0.5) * win;
  iuv.y += vPan * win.y;

  // ---- distance to the plate's own border, in css px --------------------
  // Read twice below. The plate is a physical object: its EDGE is a property
  // of the object, not of the image inside it, so nothing that displaces the
  // image is allowed to move it.
  vec2 pxSize = vSize * uPxPerWorld;
  vec2 eDist = min(vUv, 1.0 - vUv) * pxSize;

  // ---- wet-glass refraction where the air has been disturbed ------------
  if (uHasFluid > 0.5) {
    vec2 suv = gl_FragCoord.xy / uResolution;
    vec2 fv = texture2D(uFluidVel, suv).xy * uFluidTexel;
    vec4 fd = texture2D(uFluidDye, suv);
    // energy (g) marks a live gesture; ink mass (r) a settling one
    vec2 wr = fv * (0.20 + 1.35 * fd.g + 0.45 * fd.r) * 0.030;
    wr.x *= 0.35; // the water runs down the pane, not across it
    iuv += wr * win;
  }

  // ---- the falling line: strand displacement under the pointer ----------
  float px = vUv.x * vSize.x * uPxPerWorld; // css px across the plane
  float colCoord = px / 7.0;                // ~7px filaments
  float colId = floor(colCoord);
  vec2 pl = vec2(vDyn.z, vDyn.w);
  float pd = length((vUv - pl) * vec2(pa, 1.0));
  float mask = 1.0 - smoothstep(0.0, 0.62, pd);
  // …and released across the last 3 css px of the plate. Displacing the image
  // right up to the border SHEARS the border: the crop slides, the clamp holds
  // it, and the silhouette steps by however many pixels the drop was worth —
  // an axis-aligned rectangular notch that reads as a rendering fault, not as
  // a torn edge. The wet displacement is an interior effect; the plate's own
  // outline is not allowed to move.
  float hold = smoothstep(0.0, 3.0, eDist.x) * smoothstep(0.0, 3.0, eDist.y);
  float amp = charge * mask * mask * hold;

  float drop = 0.0;
  if (amp > 0.002) {
    float n1;
    float n2;
    if (uHasStrand > 0.5) {
      n1 = texture2D(uStrand, vec2(colId * 0.0173 + vMeta.z, vMeta.z * 3.7)).r;
      n2 = texture2D(uStrand, vec2(vUv.x * 1.31 + vMeta.z, vUv.y * 0.21 - uTime * 0.045)).g;
    } else {
      n1 = hash12(vec2(colId, vMeta.z * 91.7));
      n2 = hash12(vec2(floor(vUv.x * 47.0), floor(vUv.y * 9.0 - uTime * 2.0)));
    }
    // biased downward — filaments fall, they do not float
    drop = ((n1 - 0.32) * 1.5 + (n2 - 0.5) * 0.6);
    iuv.y += drop * amp * uFilAmp;
    iuv.x += (fract(colCoord) - 0.5) * amp * amp * 0.004;
  }

  iuv = clamp(iuv, 0.0, 1.0);

  // ---- fetch, with a vertical chromatic split at scroll speed -----------
  float so = (uSplitPx / max(vSize.y * uPxPerWorld, 1.0)) * win.y;

  vec2 uvG = vWin.xy + iuv * vWin.zw;
  vec2 uvR = vWin.xy + vec2(iuv.x, clamp(iuv.y + so, 0.0, 1.0)) * vWin.zw;
  vec2 uvB = vWin.xy + vec2(iuv.x, clamp(iuv.y - so, 0.0, 1.0)) * vWin.zw;

  vec3 col;
  col.g = texture2D(uAtlas, uvG).g;
  col.r = texture2D(uAtlas, uvR).r;
  col.b = texture2D(uAtlas, uvB).b;

#ifndef INSTANCED
  if (uHiMix > 0.001) {
    vec3 hi;
    hi.g = texture2D(uHiTex, iuv).g;
    hi.r = texture2D(uHiTex, vec2(iuv.x, clamp(iuv.y + so, 0.0, 1.0))).r;
    hi.b = texture2D(uHiTex, vec2(iuv.x, clamp(iuv.y - so, 0.0, 1.0))).b;
    col = mix(col, hi, uHiMix);
  }
#endif

  // filaments carry their own shadow — displaced ink darkens
  col *= 1.0 - min(abs(drop) * amp * 2.6, 0.30);

  // ---- the shared key: black point, exposure, temperature ---------------
  // Measured per tile at blit time (atlas._measureKey) and applied here in the
  // order a colourist works in. All three live in DISPLAY space because that
  // is the space the probe read them in; multiplying display by pow(g, 1/2.2)
  // is EXACTLY a linear multiply by g, so the exposure key is unchanged in
  // meaning by moving here — it just no longer has to happen in a different
  // space from its two siblings.
  //
  // Matching p99 alone was never a grade, only a white balance on the peaks:
  // it left four adjacent plates with black points from 4.7 to 19.6 and mean
  // R−B from +2 to +30, i.e. four film stocks on one rail. Lift lands every
  // tile on a true zero (the material's single uInkLift then puts the one site
  // black under all of them); the trim rotates each tile's R/B onto the one
  // site temperature without touching G, so it changes a plate's lean and
  // never its level.
  float heat = clamp(charge * 1.2, 0.0, 1.0);
  vec3 s = toDisplay(col);
  s = max(s - vKey.x, 0.0) / max(1.0 - vKey.x, 1e-3);   // black point
  s *= pow(max(vMeta.x, 0.25), 1.0 / 2.2);              // exposure
  s *= vec3(vKey.y, 1.0, vKey.z);                       // temperature

  // ---- grade: land on --img-grade THROUGH the post chain -----------------
  // The DOM images take the CSS grade and stop. These planes also pass
  // through post (ACES, S-curve, uSat 0.80, brass highlight tint, vignette)
  // and sit under the section veil, so the in-material numbers are chosen to
  // ARRIVE at the CSS look after all of that, not to copy its values.
  // ±1/255 breakup on the fetch: 8-bit banding baked into the source tiles
  // arrives quantised, and the composite's own dither cannot fix contour
  // rings it never caused. One static hash per pixel, display-space, before
  // the grade stretches anything.
  s += (hash12(gl_FragCoord.xy * 0.7137) - 0.5) * (2.0 / 255.0);
  float lum = dot(s, vec3(0.2126, 0.7152, 0.0722));
  s = mix(s, vec3(lum), mix(0.06, 0.0, heat));             // post desats too
  lum = dot(s, vec3(0.2126, 0.7152, 0.0722));
  s = mix(vec3(lum), s, mix(1.06, 1.16, heat));            // counter uSat 0.8
  s *= mix(0.94, 1.02, heat);
  // Counter the composite's brass highlight tint — but only HALF way. At full
  // strength the plates arrived silver-neutral on an amber page and read as
  // pasted in from a colder site; the hiCap ceiling below already does the
  // ash-protection, so the counter-tint only needs to keep highlights from
  // going fully amber, not to neutralise them. Peak whites should land within
  // a few delta-E of the page's brass-hi.
  float hiM = smoothstep(0.22, 0.85, lum);
  s *= mix(vec3(1.0), vec3(0.945, 1.0, 1.10), hiM * 0.35);
  // Lifted blacks: shadows settle onto ink, not onto #000. uInkLift is stated
  // HERE, in the material's own display space, but it has to SURVIVE to the
  // screen — and between here and the screen sits composite's grade(), whose
  // very first line is  c = max(c - uBlack, 0) * uBlackGain . See the uniform
  // for the arithmetic; the short version is that the old value was subtracted
  // straight back out and the plates rendered as holes cut in the page.
  float sh = 1.0 - smoothstep(0.0, 0.46, dot(s, vec3(0.333)));
  s = mix(s, max(s, uInkLift), sh * 0.85);

  // highlight ceiling: every plate's peak converges on brass-hi (#E4C88B),
  // never paper white. Channel-wise soft roll toward the cap — the shared top
  // note that makes four differently-lit photographs read as one grade.
  vec3 hiCap = vec3(0.894, 0.784, 0.545);
  vec3 knee = hiCap * 0.78;
  vec3 ex = max(s - knee, vec3(0.0));
  s = min(s, knee) + ex / (1.0 + ex / (hiCap * 0.22));

  vec3 c = toLinear(s) * uGain;

  // counter post's vignette so the plates read evenly lit like the DOM rail
  float vig = 1.0 / pow(1.0 + vR2 * uVig.x, 2.0);
  c /= mix(1.0, vig, uVig.y);

  // Shoulder: bloom's threshold is 1.05 — roll the peak off so the plates can
  // be pushed hard against the veil without ever glowing. A tile whose
  // exposure key was pulled hard (keyGain toward the floor — a genuinely hot
  // source) starts its roll earlier, at 0.70, so even its residual highlight
  // mass arrives as texture, not as a clipped plateau.
  float kneeHi = mix(0.85, 0.70, smoothstep(0.55, 0.36, vMeta.x));
  vec3 over = max(c - vec3(kneeHi), vec3(0.0));
  c = min(c, vec3(kneeHi)) + over / (1.0 + 6.0 * over);

  // open-state recession for the plates left behind
  c *= 1.0 - 0.85 * dim;

  // ---- the silhouette ----------------------------------------------------
  // 1.5 css px of coverage falloff at the border. A photographic plate lit in
  // a room has a contact edge; a rectangle whose alpha goes 1 → 0 in the space
  // of one device pixel is a die-cut, and that is what a juror sees when they
  // zoom the rail. This is the ONLY reason the material blends: the interior
  // is alpha 1 and therefore bit-identical to the old NoBlending write.
  float cover = smoothstep(0.0, 1.5, eDist.x) * smoothstep(0.0, 1.5, eDist.y);

  gl_FragColor = vec4(c, cover);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
`;function nt(v,{instanced:e}){const t={uAtlas:{value:null},uStrand:{value:null},uHasStrand:{value:0},uFluidVel:{value:null},uFluidDye:{value:null},uFluidTexel:{value:new W(.004878048780487805,.0078125)},uHasFluid:{value:0},uResolution:v.uniforms.uResolution,uTime:v.uniforms.uTime,uLens:{value:new F(0,0,1,0)},uLensAspect:{value:new W(1.6,1)},uView:{value:new W(1,1)},uPxPerWorld:{value:100},uShear:{value:0},uPan:{value:.045},uSplitPx:{value:0},uOverscan:{value:1.035},uGain:{value:1.78},uInkLift:{value:new ct(.183,.188,.188)},uFilAmp:{value:.085},uVig:{value:new W(.42,0)}};return e||(t.aXform={value:new F(0,0,1,1)},t.aDyn={value:new F(0,0,.5,.5)},t.aMeta={value:new F(0,0,.5,1)},t.aWin={value:new F(0,0,1,1)},t.aKey={value:new F(0,1,1,0)},t.uHiTex={value:null},t.uHiMix={value:0}),{mat:new wt({uniforms:t,vertexShader:Lt,fragmentShader:Ft,defines:e?{INSTANCED:""}:{},transparent:!0,blending:kt,depthTest:!0,depthFunc:bt,depthWrite:!0,toneMapped:!0}),uniforms:t}}function ut(v,e,t,s){const n=3*v-3*t+1,i=3*t-6*v,o=3*v,a=3*e-3*s+1,l=3*s-6*e,r=3*e,c=u=>((n*u+i)*u+o)*u,f=u=>((a*u+l)*u+r)*u,y=u=>(3*n*u+2*i)*u+o;return u=>{if(u<=0)return 0;if(u>=1)return 1;let d=u;for(let g=0;g<5;g++){const x=y(d);if(Math.abs(x)<1e-6)break;d-=(c(d)-u)/x}if(d<0||d>1||Math.abs(c(d)-u)>1e-4){let g=0,x=1;d=u;for(let T=0;T<24;T++){const b=c(d);if(Math.abs(b-u)<1e-5)break;b<u?g=d:x=d,d=(g+x)*.5}}return f(d)}}const rt=ut(.76,0,.24,1),ht=ut(.16,1,.3,1),C=(v,e,t,s)=>v+(e-v)*(1-Math.exp(-t*s)),N=v=>v<0?0:v>1?1:v,p=12,It=0,_t={xl:1,lg:.78,md:.58,sm:.38},lt="at13-gallery-style",Pt=`
.work__item.is-gl .work__img{visibility:hidden}
.work__item.is-gl .work__plate{background:transparent}
.work__item.is-gl .work__sheen{display:none}
.glx-catcher{position:fixed;inset:0;z-index:40;display:none;background:transparent}
.glx-catcher.is-on{display:block;cursor:pointer}
.glx-close{position:absolute;top:0;right:0;width:1px;height:1px;padding:0;margin:0;border:0;overflow:hidden;clip-path:inset(50%);white-space:nowrap;background:transparent;color:var(--bone);cursor:pointer;-webkit-appearance:none;appearance:none}
.glx-close:focus-visible{top:24px;right:24px;width:auto;height:auto;min-height:44px;overflow:visible;clip-path:none;display:inline-flex;align-items:center;padding:0 20px;border:1px solid var(--bone);background:color-mix(in srgb,var(--ink) 74%,transparent);font-family:var(--font-ui,ui-sans-serif,system-ui);font-size:11px;line-height:1;letter-spacing:.24em;text-transform:uppercase;outline:2px solid var(--brass);outline-offset:3px}
html[data-gl-work] .work::before{background:linear-gradient(to bottom,var(--veil) 0,color-mix(in srgb,var(--ink) 30%,transparent) 26%,color-mix(in srgb,var(--ink) 30%,transparent) 74%,var(--veil) 100%)}
html[data-gl-work] :is(.mani,.craft,.work,.team,.visit)::before{transition:opacity 860ms cubic-bezier(0.76,0,0.24,1)}
html[data-work-open] :is(.mani,.craft,.work,.team,.visit)::before{opacity:0}
@media (prefers-reduced-motion:reduce){html[data-gl-work] :is(.mani,.craft,.work,.team,.visit)::before{transition:none}}
`,U=v=>`work-${String(v+1).padStart(2,"0")}`;class Kt{static id="gallery";constructor(e){this.ctx=e,this.items=null,this.rail=null,this.adopted=new Uint8Array(p),this.errored=new Uint8Array(p),this.pending=-1,this.pendingT=0,this.visible=new Uint8Array(p),this.charge=new Float32Array(p),this.dim=new Float32Array(p),this.rect=new Float32Array(p*4),this.shear=0,this.split=0,this.velCharge=0,this.anyAdopted=!1,this.framesVisible=0,this.scanCooldown=0,this.rescanNeeded=!1,this.lastScrollY=-1,this.lastRailLeft=-1,this.forceMeasure=!0,this.measureTick=0,this.state="closed",this.openIndex=-1,this.p=0,this.pFrom=0,this.pTo=0,this.pT=0,this.pDur=1,this.hiTex=null,this.hiMix=0,this.heroCharge=0,this.offs=[],this.mo=null,this.observedRail=null,this.styleEl=null,this.catcher=null,this.capTargets=[],this._railGain=1.78}async init(){const e=this.ctx;this.atlas=new Ct(p),this.atlas.allocate(e.quality.tier,e.renderer?.capabilities.getMaxAnisotropy()||1);const t=nt(e,{instanced:!0});this.mat=t.mat,this.u=t.uniforms;const s=nt(e,{instanced:!1});this.heroMat=s.mat,this.hu=s.uniforms,this.u.uAtlas.value=this.atlas.texture,this.hu.uAtlas.value=this.atlas.texture,this.hu.uHiTex.value=this.atlas.texture,this.hu.uPan.value=0,this.strand=e.assetLib?.load("tex-strand",{srgb:!1,wrap:!0,aniso:2})||null,this.strand&&(this.u.uStrand.value=this.strand,this.hu.uStrand.value=this.strand);const n=new it(1,1,18,18),i=new Mt;i.index=n.index,i.setAttribute("position",n.getAttribute("position")),i.setAttribute("uv",n.getAttribute("uv")),i.instanceCount=p,this.baseGeo=n,this.aXform=new P(new Float32Array(p*4),4).setUsage(H),this.aDyn=new P(new Float32Array(p*4),4).setUsage(H),this.aMeta=new P(new Float32Array(p*4),4).setUsage(H),this.aWin=new P(new Float32Array(p*4),4),this.aKey=new P(new Float32Array(p*4),4).setUsage(H);for(let a=0;a<p;a++)this.aKey.array[a*4+1]=1,this.aKey.array[a*4+2]=1;i.setAttribute("aXform",this.aXform),i.setAttribute("aDyn",this.aDyn),i.setAttribute("aMeta",this.aMeta),i.setAttribute("aWin",this.aWin),i.setAttribute("aKey",this.aKey),this.geo=i,this.syncWindows(),this.mesh=new at(i,this.mat),this.mesh.frustumCulled=!1,this.mesh.renderOrder=40,this.mesh.visible=!1,this.mesh.matrixAutoUpdate=!1,e.scene.add(this.mesh),this.heroGeo=new it(1,1,18,18),this.heroMesh=new at(this.heroGeo,this.heroMat),this.heroMesh.frustumCulled=!1,this.heroMesh.renderOrder=44,this.heroMesh.visible=!1,this.heroMesh.matrixAutoUpdate=!1,e.scene.add(this.heroMesh),this.texKick=-1,this.lastKickAt=0,this.offs.push(e.bus.on("start",()=>{this.texKick<0&&(this.texKick=0)})),this.offs.push(e.bus.on("asset:loaded",a=>this.onAsset(a))),this.injectStyle(),this.makeCatcher(),this.onKey=a=>{if(this.state==="opening"||this.state==="open"){if(a.key==="Escape"){this.close();return}a.key==="Tab"&&(a.preventDefault(),this.closeBtn.focus({preventScroll:!0}))}},window.addEventListener("keydown",this.onKey);let o=-1;this.disabled=!1;try{const a=new URLSearchParams(location.search);o=parseInt(a.get("workopen")??"-1",10),this.disabled=a.get("workgl")==="0"}catch{o=-1}this.debugOpen=Number.isInteger(o)?o:-1,this.offs.push(e.bus.on("work:open",a=>this.onOpen(a))),this.offs.push(e.bus.on("nav:open",()=>{(this.state==="opening"||this.state==="open")&&this.close(!0)})),this.offs.push(e.bus.on("lang",()=>{this.rescanNeeded=!0})),this.offs.push(e.bus.on("quality",()=>this.onQuality())),this._v=new ct}injectStyle(){if(document.getElementById(lt))return;const e=document.createElement("style");e.id=lt,e.textContent=Pt,document.head.appendChild(e),this.styleEl=e}makeCatcher(){const e=document.createElement("div");e.className="glx-catcher",e.setAttribute("aria-hidden","true"),e.addEventListener("click",()=>this.close());const t=document.createElement("button");t.type="button",t.className="glx-close",t.tabIndex=-1,t.addEventListener("click",s=>{s.stopPropagation(),this.close()}),e.appendChild(t),document.body.appendChild(e),this.catcher=e,this.closeBtn=t,this.inerted=[]}setOutsideInert(e){const t="body > header, body > main, body > footer, body > .skip-link, body > #preloader";if(e){this.inerted=[...document.querySelectorAll(t)].filter(s=>!s.inert);for(const s of this.inerted)s.inert=!0}else{for(const s of this.inerted)s.inert=!1;this.inerted=[]}}onAsset(e){if(!e||!e.startsWith("work-")){e==="tex-strand"&&this.syncStrand();return}const t=parseInt(e.slice(5),10)-1;if(t<0||t>=p)return;const s=this.ctx.assets.textures.get(e);s?.image?.width&&this.atlas.blit(t,s.image)}syncStrand(){const e=!!this.strand?.image?.width;this.u.uHasStrand.value=e?1:0,this.hu.uHasStrand.value=e?1:0}syncWindows(){const e=this.aWin.array,t=[0,0,1,1];for(let s=0;s<p;s++)this.atlas.window(s,t),e[s*4]=t[0],e[s*4+1]=t[1],e[s*4+2]=t[2],e[s*4+3]=t[3];this.aWin.needsUpdate=!0}onQuality(){const e=this.ctx;this.atlas.allocate(e.quality.tier,e.renderer?.capabilities.getMaxAnisotropy()||1);for(let t=0;t<p;t++){const s=e.assets.textures.get(U(t));s?.image?.width&&this.atlas.blit(t,s.image)}this.u.uAtlas.value=this.atlas.texture,this.hu.uAtlas.value=this.atlas.texture,this.hiTex||(this.hu.uHiTex.value=this.atlas.texture),this.syncWindows()}scan(){const e=document.querySelector("[data-work-rail]");if(!e)return!1;const t=e.querySelectorAll("[data-gl-target]");if(!t.length)return!1;const s=[];for(let i=0;i<Math.min(t.length,p);i++){const o=t[i],a=o.querySelector("[data-gl-media]"),l=o.querySelector("[data-work-img]")||o.querySelector(".work__img");if(!a||!l)continue;const r=parseInt(o.dataset.workIndex??i,10),c=o.dataset.size||"md",f=parseFloat(o.style.getPropertyValue("--depth"))||_t[c]||.6;s[r]={fig:o,box:a,img:l,trigger:o.querySelector("[data-work-open]"),cap:o.querySelector(".work__cap"),id:o.dataset.workId||U(r),depth:f,seed:r*.6180339887%1}}if(!s.length)return!1;this.items=s,this.rail=e,this.adopted.fill(0),this.errored.fill(0),this.forceMeasure=!0;const n=this.aMeta.array;for(let i=0;i<p;i++){const o=s[i];n[i*4]=1,n[i*4+1]=o?o.depth:0,n[i*4+2]=o?o.seed:0,n[i*4+3]=0}return this.aMeta.needsUpdate=!0,this.observedRail!==e&&(this.mo?.disconnect(),this.mo=new MutationObserver(()=>{this.rescanNeeded=!0}),this.mo.observe(e,{childList:!0}),this.observedRail=e),!0}adopt(e){const t=this.items[e];if(t){if(t.box.hasAttribute("data-img-error")){this.errored[e]=1;return}t.fig.classList.add("is-gl"),t.img.style.visibility="hidden",this.adopted[e]=1,this.anyAdopted||(this.anyAdopted=!0,document.documentElement.setAttribute("data-gl-work",""))}}release(e){const t=this.items?.[e];t&&(t.fig.classList.remove("is-gl"),t.img.style.visibility="",this.adopted[e]=0)}measure(){const{w:e,h:t}=this.ctx.sizes,s=this.rect,n=Math.max(e,t)*.25,i=this.rail,o=i?i.style.getPropertyValue("--vel"):"";i&&i.style.setProperty("--vel","0");for(let a=0;a<p;a++){const l=this.items[a];if(!l){this.visible[a]=0;continue}const r=l.box.getBoundingClientRect();s[a*4]=r.left+r.width*.5,s[a*4+1]=r.top+r.height*.5,s[a*4+2]=r.width,s[a*4+3]=r.height,this.visible[a]=r.bottom>-n&&r.top<t+n&&r.right>-n&&r.left<e+n?1:0}i&&(o?i.style.setProperty("--vel",o):i.style.removeProperty("--vel")),this.measBaseSy=this.ctx.scroll.y,this.measBaseRl=this.rail?this.rail.scrollLeft:0}shift(e,t){const s=e-this.measBaseSy,n=t-this.measBaseRl;if(s===0&&n===0)return;const{w:i,h:o}=this.ctx.sizes,a=Math.max(i,o)*.25,l=this.rect;for(let r=0;r<p;r++){if(!this.items[r])continue;const c=r*4;l[c]-=n,l[c+1]-=s;const f=l[c+2]*.5,y=l[c+3]*.5;this.visible[r]=l[c+1]+y>-a&&l[c+1]-y<o+a&&l[c]+f>-a&&l[c]-f<i+a?1:0}this.measBaseSy=e,this.measBaseRl=t}onOpen(e){const t=e?.index??-1;if(this.state!=="closed"||t<0||t>=p)return;if(!this.items?.[t]||this.errored[t]){this.pending=-1,this.ctx.bus.emit("work:open:reject",{index:t,reason:"unavailable"});return}if(!this.adopted[t]||!this.atlas.uploaded[t]){this.texKick<0&&(this.texKick=0);const c=this.ctx.assetLib?.load(this.items[t].id);c?.image?.width&&this.atlas.blit(t,c.image),this.atlas.flush(performance.now(),!0),this.pending=t,this.pendingT=0;return}this.pending=-1;const s=this.ctx;this.state="opening",this.openIndex=t,this.heroCharge=this.charge[t],this.hiMix=0,this.hu.uHiMix.value=0,s.reducedMotion?(this.p=this.pFrom=this.pTo=1,this.pT=this.pDur=1,this.state="open"):(this.p=0,this.pFrom=0,this.pTo=1,this.pT=0,this.pDur=.92),document.documentElement.setAttribute("data-work-open",""),this.catcher.classList.add("is-on"),this.catcher.setAttribute("aria-hidden","false");const n=this.items[t].cap,i=(n?.querySelector(".work__title")?.textContent||n?.textContent||"").trim().replace(/\s+/g," "),o=s.lang==="en";this.catcher.setAttribute("role","dialog"),this.catcher.setAttribute("aria-modal","true"),this.catcher.setAttribute("aria-label",i||(o?"Work viewer":"作品檢視")),this.closeBtn.textContent=o?"Close":"關閉",this.closeBtn.setAttribute("aria-label",o?"Close work viewer":"關閉作品檢視"),this.closeBtn.tabIndex=0,this.setOutsideInert(!0),this.closeBtn.focus({preventScroll:!0}),this.capTargets.length=0;for(let c=0;c<p;c++){const f=this.items[c];f?.cap&&c!==t&&this.capTargets.push(f.cap)}const a=document.querySelector(".sec-head--work");a&&this.capTargets.push(a),this.capTargets.length&&O.to(this.capTargets,{opacity:0,y:12,duration:s.reducedMotion?.001:.55,ease:c=>ht(c),overwrite:"auto",onComplete:()=>{if(this.state==="opening"||this.state==="open")for(const c of this.capTargets)c.style.visibility="hidden"}});const l=s.assetLib?.load(this.items[t].id);this.hiTex=l||null;const r=[0,0,1,1];this.atlas.window(t,r),this.hu.aWin.value.set(r[0],r[1],r[2],r[3]),this.hu.aMeta.value.set(this.atlas.keyGain[t]||1,0,this.items[t].seed,1),this.hu.aKey.value.set(this.atlas.keyLift[t],this.atlas.keyTrimR[t]||1,this.atlas.keyTrimB[t]||1,0),this.heroMesh.visible=!0}close(e=!1){if(this.state!=="opening"&&this.state!=="open")return;const t=this.ctx;if(this.state="closing",document.documentElement.removeAttribute("data-work-open"),this.catcher.classList.remove("is-on"),this.catcher.setAttribute("aria-hidden","true"),this.catcher.removeAttribute("role"),this.catcher.removeAttribute("aria-modal"),this.closeBtn.tabIndex=-1,this.setOutsideInert(!1),t.bus.emit("work:close",{index:this.openIndex}),this.capTargets.length){for(const n of this.capTargets)n.style.visibility="";O.to(this.capTargets,{opacity:1,y:0,duration:t.reducedMotion?.001:.7,ease:n=>rt(n),overwrite:"auto",clearProps:"opacity,y,visibility"})}this.items?.[this.openIndex]?.trigger?.focus?.({preventScroll:!0}),t.reducedMotion?(this.p=this.pFrom=this.pTo=0,this.pT=this.pDur=1,this.settleClosed()):(this.pFrom=this.p,this.pTo=0,this.pT=0,this.pDur=e?.45:.78)}settleClosed(){this.state="closed",this.openIndex=-1,this.heroMesh.visible=!1,this.hiTex=null,this.hiMix=0,this.hu.uHiMix.value=0,this.hu.uHiTex.value=this.atlas.texture}update(e){const t=this.ctx;if(this.disabled||(!this.items||this.rescanNeeded)&&(--this.scanCooldown<=0&&(this.scanCooldown=20,this.scan()&&(this.rescanNeeded=!1)),!this.items))return;if(this.atlas.flush(performance.now(),!1,this.pending<0&&Math.abs(t.scroll.velocity||0)>.05),this.pending>=0){const h=this.pending;this.pendingT+=e,this.state!=="closed"||this.errored[h]||!this.items?.[h]?(this.pending=-1,this.state==="closed"&&t.bus.emit("work:open:reject",{index:h,reason:"unavailable"})):this.adopted[h]&&this.atlas.uploaded[h]?this.onOpen({index:h}):this.pendingT>4&&(this.pending=-1,t.bus.emit("work:open:reject",{index:h,reason:"timeout"}))}this.u.uHasStrand.value===0&&this.syncStrand();const s=t.fluid,n=!!(s?.texture&&s?.velocity)&&!t.reducedMotion;this.u.uHasFluid.value=n?1:0,this.hu.uHasFluid.value=n?1:0,n&&(this.u.uFluidVel.value=s.velocity,this.u.uFluidDye.value=s.texture,this.hu.uFluidVel.value=s.velocity,this.hu.uFluidDye.value=s.texture,s.texelSim&&(this.u.uFluidTexel.value.copy(s.texelSim),this.hu.uFluidTexel.value.copy(s.texelSim)));const i=t.modules.get("post");if(i&&!this._lensU&&i.ready)try{this._lensU=i.params.composite}catch{this._lensU=null}const o=!!(this._lensU&&i?.ready&&!i.bypass),a=this.u.uLens.value;o&&i.flags?.lens?(a.set(this._lensU.uK1.value,this._lensU.uK2.value,this._lensU.uCorner.value,1),this.u.uLensAspect.value.copy(this._lensU.uAspect.value)):a.w=0;const l=this.u.uVig.value;o&&i.flags?.vignette?l.set(this._lensU.uVigK.value,this._lensU.uVignette.value):l.y=0,this.hu.uLens.value.copy(a),this.hu.uLensAspect.value.copy(this.u.uLensAspect.value),this.hu.uVig.value.copy(l);const r=t.camera,c=Math.abs(r.position.z-It),f=2*Math.tan(r.fov*Math.PI/360)*c,y=f*r.aspect,u=t.sizes.w,d=t.sizes.h;this.u.uView.value.set(y,f),this.hu.uView.value.set(y,f);const g=d/f;this.u.uPxPerWorld.value=g,this.hu.uPxPerWorld.value=g;const x=t.scroll.y,T=this.rail?this.rail.scrollLeft:0;if(this.measureTick++,this.forceMeasure||this.measureTick>=45?(this.measure(),this.forceMeasure=!1,this.measureTick=0):(x!==this.lastScrollY||T!==this.lastRailLeft)&&this.shift(x,T),this.lastScrollY=x,this.lastRailLeft=T,this.texKick===-1)if(this.debugOpen>=0)this.texKick=0;else{const h=d*2.5;for(let S=0;S<p;S++){if(!this.items[S])continue;const m=this.rect[S*4+1];if(m>-h&&m<d+h){this.texKick=0;break}}}if(this.texKick>=0&&this.texKick<p){const h=performance.now(),S=Math.abs(t.scroll.velocity||0)<.05;let m=this.pending>=0;if(!m)for(let M=0;M<p;M++){if(!this.items[M])continue;const D=this.rect[M*4+1];if(D>-d&&D<d*2){m=!0;break}}if(S||m&&h-this.lastKickAt>400){this.lastKickAt=h;const M=this.items[this.texKick],D=t.assetLib?.load(M?M.id:U(this.texKick));D?.image?.width&&this.atlas.blit(this.texKick,D.image),this.texKick++}}const b=t.reducedMotion,A=this.state!=="closed",w=b||A?0:t.scroll.velocity,k=w*.052;this.shear=C(this.shear,k,Math.abs(k)>Math.abs(this.shear)?8.5:3,e);const X=b||A?0:N((Math.abs(w)-.3)*1.9)*2.1;this.split=C(this.split,X,X>this.split?9:3.2,e),this.u.uShear.value=this.shear,this.u.uSplitPx.value=this.split,this.u.uPan.value=b?0:.045,this.u.uFilAmp.value=b?0:.085,this.hu.uFilAmp.value=b?0:.06;const I=t.pointer;this.velCharge=C(this.velCharge,N(I.speed*.45),I.speed>this.velCharge?6:1.8,e);const q=I.x,j=I.y,R=this.aXform.array,z=this.aDyn.array,B=this.aMeta.array,G=this.aKey.array;let Y=!1;for(let h=0;h<p;h++){const S=this.items[h],m=h*4;if(!S){B[m+3]=0;continue}const M=this.rect[m],D=this.rect[m+1],_=this.rect[m+2],K=this.rect[m+3],Z=this.atlas.uploaded[h]&&!this.errored[h]&&t.started&&(this.adopted[h]||b||S.fig.hasAttribute("data-revealed"));!this.adopted[h]&&Z&&this.framesVisible>1&&this.adopt(h);const $=Z&&this.visible[h]&&_>1,dt=A&&h===this.openIndex;if(B[m]=this.atlas.keyGain[h]||1,G[m]=this.atlas.keyLift[h],G[m+1]=this.atlas.keyTrimR[h]||1,G[m+2]=this.atlas.keyTrimB[h]||1,B[m+3]=$&&!dt?1:0,!$){this.charge[h]=C(this.charge[h],0,6,e);continue}Y=!0,R[m]=(M/u-.5)*y,R[m+1]=(.5-D/d)*f,R[m+2]=_/u*y,R[m+3]=K/d*f;let V=0,J=.5,tt=.5;if(I.inside&&!A){const et=Math.max(Math.abs(q-M)-_*.5,0),st=Math.max(Math.abs(j-D)-K*.5,0),ft=Math.sqrt(et*et+st*st);V=Math.exp(-ft/130)*(.42+.58*this.velCharge),J=(q-(M-_*.5))/_,tt=1-(j-(D-K*.5))/K}this.charge[h]=C(this.charge[h],V,V>this.charge[h]?9:3.1,e);const pt=A&&h!==this.openIndex?this.p*.82:0;this.dim[h]=C(this.dim[h],pt,7,e),z[m]=this.charge[h],z[m+1]=this.dim[h],z[m+2]=J,z[m+3]=tt}this.aXform.needsUpdate=!0,this.aDyn.needsUpdate=!0,this.aMeta.needsUpdate=!0,this.aKey.needsUpdate=!0;const Q=Y&&!!this.atlas.texture;this.mesh.visible=Q,(Q||A)&&this.framesVisible++,this.debugOpen>=0&&this.state==="closed"&&this.framesVisible>8&&this.adopted[this.debugOpen]&&(t.bus.emit("work:open",{index:this.debugOpen,id:U(this.debugOpen)}),this.state!=="closed"&&(this.debugOpen=-1)),A&&this.updateOpen(e,y,f)}updateOpen(e,t,s){const n=this.ctx,o=this.openIndex*4;if(this.pT<this.pDur){this.pT=Math.min(this.pT+e,this.pDur);const T=(this.pTo>this.pFrom?rt:ht)(N(this.pT/this.pDur));if(this.p=this.pFrom+(this.pTo-this.pFrom)*T,this.pT>=this.pDur){if(this.p=this.pTo,this.state==="opening")this.state="open";else if(this.state==="closing"){this.settleClosed();return}}}const a=n.sizes.w,l=n.sizes.h,r=(this.rect[o]/a-.5)*t,c=(.5-this.rect[o+1]/l)*s,f=this.rect[o+2]/a*t,y=this.rect[o+3]/l*s,u=this.p;this.hu.aXform.value.set(r*(1-u),c*(1-u),f+(t*1.02-f)*u,y+(s*1.02-y)*u),this.heroCharge=C(this.heroCharge,0,2.5,e),this.hu.aDyn.value.set(this.heroCharge,0,.5,.5),this.hiTex?.image?.width&&this.state==="open"?(this.hu.uHiTex.value=this.hiTex,this.hiMix=C(this.hiMix,1,5,e)):this.state==="closing"&&(this.hiMix=C(this.hiMix,0,9,e)),this.hu.uHiMix.value=this.hiMix,this.hu.uGain.value=this._railGain+(1-this._railGain)*u,this.hu.uShear.value=0,this.hu.uSplitPx.value=0}onResize(){this.forceMeasure=!0}dispose(){const e=this.ctx;for(const t of this.offs)t?.();if(this.offs.length=0,this.capTargets.length&&O.killTweensOf(this.capTargets),window.removeEventListener("keydown",this.onKey),this.mo?.disconnect(),this.mo=null,this.items)for(let t=0;t<p;t++)this.adopted[t]&&this.release(t);this.setOutsideInert(!1),document.documentElement.removeAttribute("data-gl-work"),document.documentElement.removeAttribute("data-work-open"),this.styleEl?.remove(),this.catcher?.remove(),e.scene.remove(this.mesh),e.scene.remove(this.heroMesh),this.geo?.dispose(),this.baseGeo?.dispose(),this.heroGeo?.dispose(),this.mat?.dispose(),this.heroMat?.dispose(),this.atlas?.dispose(),this.items=null,this.mesh=this.heroMesh=null}}export{Kt as default};
