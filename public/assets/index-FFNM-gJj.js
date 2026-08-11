import{U as W}from"./content-DRgEOFBw.js";const c=(o,t,e,s)=>o+(t-o)*(1-Math.exp(-e*s)),v=(o,t,e)=>o<t?t:o>e?e:o,U=o=>o<0?0:o>1?1:o,q=o=>{const t=U(o);return t*t*(3-2*t)},x=(o,t,e,s)=>c(o,t,t>o?e.in:e.out,s);class S{constructor(t=0){this.value=t,this.target=t,this.velocity=0}step(t,e,s){return this.velocity+=((this.target-this.value)*e-this.velocity*s)*t,this.value+=this.velocity*t,this.value}get settled(){return Math.abs(this.velocity)<.02&&Math.abs(this.target-this.value)<.02}set(t){this.value=t,this.target=t,this.velocity=0}}const M=.1,H=.4,_=28,P=1.4,V={k:200,d:27},K={k:108,d:17},O={soft:.62,strong:1.45};class G{constructor(t,{selector:e="[data-magnetic]"}={}){this.ctx=t,this.selector=e,this.entries=new Map,this.enabled=!0,this.dirty=!0,this.sinceMeasure=M,this.lastPx=Number.NaN,this.lastPy=Number.NaN,this.offs=[]}init(){this.scan(document.body);const t=r=>{this.scan(r),this.dirty=!0},e=()=>{this.dirty=!0},s=this.ctx.bus;this.offs.push(s.on("dom:added",t),s.on("ready",()=>t(document.body)),s.on("start",e),s.on("nav:open",e),s.on("nav:close",e),s.on("work:open",e),s.on("work:close",e),s.on("lang",e))}scan(t){const e=[];if(t instanceof Element)e.push(t);else if(Array.isArray(t))for(const s of t)s instanceof Element&&e.push(s);else t&&t.root instanceof Element?e.push(t.root):t&&t.el instanceof Element?e.push(t.el):document.body&&e.push(document.body);for(const s of e){s.matches?.(this.selector)&&this.register(s);const r=s.querySelectorAll?.(this.selector);if(r)for(const n of r)this.register(n)}}register(t){if(!(t instanceof Element)||this.entries.has(t))return;const e=t.getAttribute("data-magnetic")||"",s=O[e]??1,r=v(Number(t.dataset.magneticStrength)||s,0,3);this.entries.set(t,{el:t,inner:t.querySelector("[data-magnetic-inner]"),strength:r,radius:Number(t.dataset.magneticRadius)||0,live:!1,cx:0,cy:0,hw:0,hh:0,field:48,cap:_,sx:new S(0),sy:new S(0),prox:0,wx:0,wy:0,wp:-1,flagged:!1}),this.dirty=!0}unregister(t){const e=this.entries.get(t);e&&(this.clearEntry(e),this.entries.delete(t))}refresh(){this.dirty=!0}measure(){for(const t of this.entries.values()){if(!t.el.isConnected){this.entries.delete(t.el);continue}const e=t.el.getBoundingClientRect();if(e.width===0&&e.height===0){t.live=!1;continue}t.live=!0,t.hw=e.width*.5,t.hh=e.height*.5,t.cx=e.left+t.hw-t.sx.value,t.cy=e.top+t.hh-t.sy.value,t.field=t.radius>0?t.radius:v(Math.max(t.hw,t.hh)*.85+32,34,104),t.cap=Math.min(_,Math.max(t.hw,t.hh)*.55)*t.strength}}update(t,e,s,r){if(this.entries.size===0)return null;const n=this.enabled&&r===!0;this.sinceMeasure+=t;const a=e!==this.lastPx||s!==this.lastPy,f=Math.abs(this.ctx.scroll?.velocity||0)>.01;(this.dirty||n&&(a||f)&&this.sinceMeasure>=M)&&(this.measure(),this.dirty=!1,this.sinceMeasure=0),this.lastPx=e,this.lastPy=s;let h=null;for(const i of this.entries.values()){const y=e-i.cx,b=s-i.cy;let l=0;if(n&&i.live){const d=y/(i.hw+i.field),u=b/(i.hh+i.field);l=q(1-Math.sqrt(d*d+u*u))}if(i.prox=l,l>0){const d=H*l*i.strength;i.sx.target=v(y*d,-i.cap,i.cap),i.sy.target=v(b*d,-i.cap,i.cap)}else i.sx.target=0,i.sy.target=0;const g=l>0?V:K;i.sx.step(t,g.k,g.d),i.sy.step(t,g.k,g.d),this.write(i),l>0&&(h===null||l>h.prox)&&(h=i)}return h}write(t){const e=Math.round(t.sx.value*100)/100,s=Math.round(t.sy.value*100)/100;(e!==t.wx||s!==t.wy)&&(t.wx=e,t.wy=s,e===0&&s===0&&t.sx.settled&&t.sy.settled?(t.el.style.removeProperty("translate"),t.inner&&t.inner.style.removeProperty("translate")):(t.el.style.translate=`${e}px ${s}px`,t.inner&&(t.inner.style.translate=`${e*P}px ${s*P}px`)));const r=Math.round(t.prox*50)/50;if(r!==t.wp){t.wp=r,t.el.style.setProperty("--mag-p",String(r));const n=r>0;n!==t.flagged&&(t.flagged=n,n?t.el.setAttribute("data-magnetic-active",""):t.el.removeAttribute("data-magnetic-active"))}}clearEntry(t){t.sx.set(0),t.sy.set(0),t.prox=0,t.wx=0,t.wy=0,t.wp=-1,t.flagged=!1,t.el.style.removeProperty("translate"),t.el.style.removeProperty("--mag-p"),t.el.removeAttribute("data-magnetic-active"),t.inner&&t.inner.style.removeProperty("translate")}reset(){for(const t of this.entries.values())this.clearEntry(t)}dispose(){for(const t of this.offs)t();this.offs.length=0,this.reset(),this.entries.clear()}}const j=`/* ══════════════════════════════════════════════════════════════════
   AT13 — cursor layer.

   Two blocks, on purpose:

   1. UNLAYERED — native-cursor suppression only. It has to outrank
      unlayered component rules such as \`button { cursor: pointer }\`,
      so it cannot live in a cascade layer. The \`.at13-cursor\` class
      is added by JS *after* the module initialises, so if the module
      never runs, every element keeps its normal, usable cursor.

   2. @layer at13-cursor — everything else. Cascade layers always lose
      to unlayered rules, so src/styles/** can restyle any of this by
      simply declaring it, with no specificity war and no !important.

   Every value below reads from a custom property with a token
   fallback, so restyling is usually a matter of setting one variable.
   See MARKUP.md for the full contract.
   ══════════════════════════════════════════════════════════════════ */

html.at13-cursor,
html.at13-cursor *:not(input):not(textarea) { cursor: none; }

/* Belt and braces: even if the class were somehow applied, a coarse
   pointer or a reduced-motion preference must never see this layer. */
@media (prefers-reduced-motion: reduce), (pointer: coarse), (hover: none) {
  .cursor { display: none !important; }
}

/* Forced colors / more contrast: the user may depend on an enlarged or
   high-contrast system cursor. Never suppress it, and never draw the
   blended replacement — a 6px exclusion-blend dot can melt into mid-gray
   photography exactly where an assistive cursor is needed most. The JS
   mirrors these checks (applyActive), but the stylesheet must hold alone. */
@media (forced-colors: active), (prefers-contrast: more) {
  html.at13-cursor,
  html.at13-cursor *:not(input):not(textarea) { cursor: auto; }
  .cursor { display: none !important; }
}

@layer at13-cursor {
  .cursor {
    /* ── written every frame by src/ui/cursor/index.js ── */
    --cursor-reveal: 0;   /* 0 → 1  pointer present in the window   */
    --cursor-link: 0;     /* 0 → 1  over a link / button            */
    --cursor-disc: 0;     /* 0 → 1  over a work figure (disc state) */
    --cursor-press: 0;    /* 0 → 1  pointer down                    */
    --cursor-speed: 0;    /* 0 → 1  normalised pointer speed        */

    /* ── free to override from the design system ── */
    --cursor-blend: exclusion;
    --cursor-field: 400px;
    --cursor-dot-size: 7px;
    --cursor-ring-size: 40px;
    --cursor-ink: var(--bone, #ede8e1);
    --cursor-dot-ink: var(--brass, #c6a15b);
    --cursor-label-ink: var(--ink, #08090b);

    position: fixed;
    top: 0;
    left: 0;
    /* A bounded box that rides the pointer. Everything the cursor draws
       lives well inside it, which keeps the blended region small — a
       full-viewport blend layer would force a whole-screen read-back
       every frame on top of the WebGL canvas. */
    width: var(--cursor-field);
    height: var(--cursor-field);
    z-index: var(--z-cursor, 100);
    pointer-events: none;
    display: none;
    opacity: var(--cursor-reveal);
    transform: translate3d(-100vw, -100vh, 0);

    /* The blend keeps the cursor legible on ink and on bright imagery
       alike, and inverts the disc together with its label, so the label
       is always the exact negative of the disc it sits on.

       Exclusion rather than difference: over bone, difference punches a
       pure #000 hole, blacker than --ink and outside the palette, while
       exclusion lands around #212121 — ink-3 territory. Over the brass
       accent both resolve to a cool marine blue (exclusion's is the
       lighter and less saturated of the two); that is the honest cost
       of a subtractive blend and it at least rhymes with --harbour.
       A large brass field can opt out with data-cursor-blend="normal". */
    mix-blend-mode: var(--cursor-blend);
  }

  html.at13-cursor .cursor { display: block; }

  /* Children are placed at the centre of the tracking box and then
     offset from it, so every transform they carry is a small number
     relative to the pointer rather than an absolute page coordinate. */
  .cursor__dot,
  .cursor__ring,
  .cursor__label {
    position: absolute;
    top: 50%;
    left: 50%;
    will-change: transform;
    transform: translate3d(0, 0, 0) translate(-50%, -50%) scale(0);
  }

  .cursor__dot {
    width: var(--cursor-dot-size);
    height: var(--cursor-dot-size);
    border-radius: 50%;
    background: var(--cursor-dot-ink);
  }

  .cursor__ring {
    width: var(--cursor-ring-size);
    height: var(--cursor-ring-size);
    border-radius: 50%;
    border: 1px solid var(--cursor-ink);
    /* A hairline at rest sits back at 0.62; the moment it means something —
       a link, or the filled disc — it comes up to full strength. */
    opacity: calc(
      0.62 + 0.38 * max(var(--cursor-link), var(--cursor-disc))
      - 0.16 * var(--cursor-press)
    );
  }

  /* The filled disc of the work-figure state. Kept as a pseudo-element
     so the ring's own hairline never has to animate its width. */
  .cursor__ring::before {
    content: '';
    position: absolute;
    inset: -1px;
    border-radius: 50%;
    background: var(--cursor-ink);
    opacity: var(--cursor-disc);
  }

  .cursor__label {
    display: block;
    text-align: center;
    white-space: nowrap;
    font-family: var(--f-ui, system-ui, sans-serif);
    font-size: var(--t-micro, 0.7rem);
    font-weight: 500;
    line-height: 1;
    color: var(--cursor-label-ink);
    opacity: var(--cursor-disc);
    user-select: none;
  }

  /* Latin is tracked out; the trailing letter-space is compensated so
     the word stays optically centred in the disc. */
  .cursor[data-lang='en'] .cursor__label {
    text-transform: uppercase;
    letter-spacing: var(--tr-micro, 0.24em);
    text-indent: var(--tr-micro, 0.24em);
  }

  /* 繁體中文 is never tracked per character — it is set in the Han
     serif at its own optical size instead. */
  .cursor[data-lang='zh'] .cursor__label {
    font-family: var(--f-han, 'Noto Serif TC', serif);
    font-weight: 400;
    font-size: calc(var(--t-micro, 0.7rem) * 1.25);
    letter-spacing: 0;
    text-indent: 0;
    text-transform: none;
  }
}
`,J='a[href], button, [role="button"], summary, select, label[for], [data-magnetic], [data-cursor]',Q='[data-gl-target], [data-cursor="disc"]',Z={disc:"next",next:"next",prev:"prev",close:"close",enter:"enter",index:"index",all:"allWork",menu:"menu"},X=68,Y=18,tt=11,et=1250,st=.4,rt=.78,nt=21,it=6.2,ot=1.95,at=3.45,ht=.45,ct=1.35,lt=.018,w={link:{in:16,out:8.5},disc:{in:12.5,out:7},press:{in:34,out:10},reveal:{in:6.5,out:15}},C={in:26,out:10},p=o=>Math.round(o*100)/100,m=o=>Math.round(o*1e3)/1e3;class ut{static id="cursor";constructor(t){this.ctx=t,this.root=null,this.dot=null,this.ring=null,this.label=null,this.magnetic=new G(t),this.active=!1,this.settled=!1,this.pointerSeen=!1,this.inWindow=!0,this.needsTeleport=!0,this.pressed=!1,this.dotX=0,this.dotY=0,this.ringX=0,this.ringY=0,this.ringPrevX=0,this.ringPrevY=0,this.stretchX=0,this.stretchY=0,this.stretchLen=0,this.stretchAngle=0,this.link=0,this.disc=0,this.press=0,this.reveal=0,this.linkTarget=0,this.discTarget=0,this.breathPhase=0,this.breathAmt=0,this.idleFor=0,this.mode="default",this.hoverEl=null,this.langSeen=null,this.langDirty=!1,this.labelSwap=1,this.pendingText="",this.wrote={root:"",dot:"",ring:"",label:"",state:"",lang:"",blend:"",text:null},this.vars=Object.create(null),this.offs=[]}async init(){this.injectStyles(),this.root=document.getElementById("cursor"),this.dot=this.root?.querySelector("[data-cursor-dot]")||null,this.ring=this.root?.querySelector("[data-cursor-ring]")||null,this.label=this.root?.querySelector("[data-cursor-label]")||null,this.root&&this.label&&(this.label.classList.add("cursor__label"),this.label.parentElement!==this.root&&this.root.appendChild(this.label)),this.dot?.classList.add("cursor__dot"),this.ring?.classList.add("cursor__ring"),this.bindMedia(),this.bindPointer(),this.magnetic.init();const t=this.ctx.bus;this.offs.push(t.on("lang",()=>this.onLang()),t.on("resize",()=>this.magnetic.refresh()),t.on("nav:open",()=>this.setMode("default",null)),t.on("nav:close",()=>this.magnetic.refresh()),t.on("work:open",()=>this.setMode("default",null)),t.on("work:close",()=>this.magnetic.refresh())),this.applyActive()}injectStyles(){document.querySelector("style[data-at13-cursor]")?.remove(),this.styleEl=document.createElement("style"),this.styleEl.setAttribute("data-at13-cursor",""),this.styleEl.textContent=j,document.head.appendChild(this.styleEl)}bindMedia(){this.coarse=window.matchMedia("(pointer: coarse), (hover: none)"),this.reduced=window.matchMedia("(prefers-reduced-motion: reduce)"),this.contrast=window.matchMedia("(forced-colors: active), (prefers-contrast: more)");const t=()=>this.applyActive();this.coarse.addEventListener("change",t),this.reduced.addEventListener("change",t),this.contrast.addEventListener("change",t),this.offs.push(()=>this.coarse.removeEventListener("change",t),()=>this.reduced.removeEventListener("change",t),()=>this.contrast.removeEventListener("change",t))}applyActive(){const t=!!this.root&&!this.coarse.matches&&!this.reduced.matches&&!this.contrast.matches&&!this.ctx.reducedMotion;if(this.settled&&t===this.active)return;this.settled=!0,this.active=t,this.magnetic.enabled=t;const e=document.documentElement;t?(e.classList.add("at13-cursor"),this.root.style.removeProperty("display"),this.needsTeleport=!0,this.onLang()):(e.classList.remove("at13-cursor"),this.root&&(this.root.style.display="none"),this.magnetic.reset())}bindPointer(){const t=document,e=()=>{(!this.pointerSeen||!this.inWindow)&&(this.needsTeleport=!0),this.pointerSeen=!0,this.inWindow=!0},s=h=>{e(),this.resolve(h.target)},r=h=>{h.relatedTarget?this.resolve(h.relatedTarget):(this.inWindow=!1,this.setMode("default",null))},n=()=>{this.pressed=!0},a=()=>{this.pressed=!1},f=()=>{this.pressed=!1,this.inWindow=!1};t.addEventListener("pointermove",e,{passive:!0}),t.addEventListener("pointerover",s,{passive:!0}),t.addEventListener("pointerout",r,{passive:!0}),t.addEventListener("pointerdown",n,{passive:!0}),t.addEventListener("pointerup",a,{passive:!0}),t.addEventListener("pointercancel",a,{passive:!0}),window.addEventListener("blur",f),this.offs.push(()=>t.removeEventListener("pointermove",e),()=>t.removeEventListener("pointerover",s),()=>t.removeEventListener("pointerout",r),()=>t.removeEventListener("pointerdown",n),()=>t.removeEventListener("pointerup",a),()=>t.removeEventListener("pointercancel",a),()=>window.removeEventListener("blur",f))}resolve(t){if(!(t instanceof Element)){this.setMode("default",null);return}const e=t.closest(Q);if(e){this.setMode("disc",e);return}const s=t.closest(J);if(s){this.setMode("link",s);return}this.setMode("default",null)}setMode(t,e){if(t===this.mode&&e===this.hoverEl)return;this.mode=t,this.hoverEl=e,this.linkTarget=t==="link"?1:0,this.discTarget=t==="disc"?1:0,this.setText(this.labelFor(e,t)),this.setAttr("state","data-cursor-state",t);const s=e?.closest?.("[data-cursor-blend]");this.setBlend(s?s.getAttribute("data-cursor-blend")||"normal":""),this.ctx.bus.emit("cursor:state",{state:t,el:e})}labelFor(t,e){if(!t)return"";const s=t.closest("[data-cursor-text]");if(s){const a=s.getAttribute("data-cursor-text-en");return this.lang()==="en"&&a||s.getAttribute("data-cursor-text")||""}const r=t.closest("[data-cursor]"),n=Z[r?.getAttribute("data-cursor")]||(e==="disc"?"next":"");return n?this.translate(n):""}lang(){return this.ctx.lang==="en"?"en":"zh"}translate(t){const e=this.ctx.modules.get("i18n"),s=e&&(e.t||e.translate);if(typeof s=="function"){const n=`ui.${t}`,a=s.call(e,n);if(typeof a=="string"&&a&&a!==n)return a}const r=W[t];return r&&(r[this.lang()]||r.zh)||""}setText(t){this.pendingText=t||""}commitText(){!this.label||this.pendingText===this.wrote.text||(this.wrote.text=this.pendingText,this.label.textContent=this.pendingText)}onLang(){this.setAttr("lang","data-lang",this.lang()),this.langDirty=!0,this.magnetic.refresh()}refreshLabel(){if(this.wrote.text=null,this.hoverEl&&!this.hoverEl.isConnected){const t=document.elementFromPoint(this.ctx.pointer.x,this.ctx.pointer.y);this.hoverEl=null,this.mode="",this.resolve(t);return}this.setText(this.labelFor(this.hoverEl,this.mode))}onResize(){this.magnetic.refresh()}update(t){if(!this.active)return;const e=this.ctx.pointer,s=Number.isFinite(e.x)?e.x:this.dotX,r=Number.isFinite(e.y)?e.y:this.dotY;this.langDirty&&(this.langDirty=!1,this.refreshLabel()),this.ctx.lang!==this.langSeen&&(this.langSeen=this.ctx.lang,this.onLang());const n=this.magnetic.update(t,s,r,this.pointerSeen&&this.inWindow);if(!this.pointerSeen)return;this.needsTeleport&&(this.dotX=this.ringX=this.ringPrevX=s,this.dotY=this.ringY=this.ringPrevY=r,this.stretchX=this.stretchY=this.stretchLen=0,this.needsTeleport=!1);let a=s,f=r;if(n){const T=ht*n.prox;a+=(n.cx+n.sx.value-s)*T,f+=(n.cy+n.sy.value-r)*T}this.ringPrevX=this.ringX,this.ringPrevY=this.ringY;const h=Y+(tt-Y)*this.stretchLen;this.ringX=c(this.ringX,a,h,t),this.ringY=c(this.ringY,f,h,t),this.dotX=c(this.dotX,s,X,t),this.dotY=c(this.dotY,r,X,t);const i=(this.ringX-this.ringPrevX)/t,y=(this.ringY-this.ringPrevY)/t,b=e.vx*this.ctx.sizes.w*.5,l=-e.vy*this.ctx.sizes.h*.5,g=i*.62+b*.38,d=y*.62+l*.38,u=Math.hypot(g,d),E=1-Math.exp(-u/et),R=u>1?g/u*E:0,N=u>1?d/u*E:0,k=E>this.stretchLen?nt:it;this.stretchX=c(this.stretchX,R,k,t),this.stretchY=c(this.stretchY,N,k,t),this.stretchLen=Math.hypot(this.stretchX,this.stretchY),this.stretchLen>.001&&(this.stretchAngle=Math.atan2(this.stretchY,this.stretchX)),this.link=x(this.link,this.linkTarget,w.link,t),this.disc=x(this.disc,this.discTarget,w.disc,t),this.press=x(this.press,this.pressed?1:0,w.press,t),this.reveal=x(this.reveal,this.inWindow?1:0,w.reveal,t),this.pendingText!==this.wrote.text?this.disc>.4&&this.wrote.text?(this.labelSwap=c(this.labelSwap,0,C.in,t),this.labelSwap<.05&&this.commitText()):this.commitText():this.labelSwap=c(this.labelSwap,1,C.out,t),this.breathPhase+=t*ct;const z=this.stretchLen<.02&&!n&&this.link<.02&&this.disc<.02;this.idleFor=z?this.idleFor+t:0,this.breathAmt=c(this.breathAmt,this.idleFor>1.2?1:0,2.4,t);const $=Math.sin(this.breathPhase)*lt*this.breathAmt,L=1+this.link*(ot-1)+this.disc*(at-1)-this.press*.14+$,A=this.stretchLen*st*(1-.6*this.disc),D=L*(1+A)*this.reveal,F=L/(1+A*rt)*this.reveal,B=v(1-this.link*.7+this.press*.5,0,3)*(1-this.disc)*this.reveal,I=(.84+.16*this.disc)*this.reveal*this.labelSwap;this.writeTransform("root",this.root,`translate3d(${p(s)}px, ${p(r)}px, 0) translate(-50%, -50%)`),this.writeTransform("dot",this.dot,`translate3d(${p(this.dotX-s)}px, ${p(this.dotY-r)}px, 0) translate(-50%, -50%) scale(${m(B)})`),this.writeTransform("ring",this.ring,`translate3d(${p(this.ringX-s)}px, ${p(this.ringY-r)}px, 0) translate(-50%, -50%) rotate(${m(this.stretchAngle)}rad) scale(${m(D)}, ${m(F)})`),this.writeTransform("label",this.label,`translate3d(${p(this.ringX-s)}px, ${p(this.ringY-r)}px, 0) translate(-50%, -50%) scale(${m(I)})`),this.setVar("--cursor-reveal",this.reveal),this.setVar("--cursor-link",this.link),this.setVar("--cursor-disc",this.disc),this.setVar("--cursor-press",this.press),this.setVar("--cursor-speed",Math.round(this.stretchLen*50)/50)}writeTransform(t,e,s){!e||s===this.wrote[t]||(this.wrote[t]=s,e.style.transform=s)}setVar(t,e){const s=Math.round(e*1e3)/1e3;this.vars[t]!==s&&(this.vars[t]=s,this.root.style.setProperty(t,String(s)))}setAttr(t,e,s){!this.root||this.wrote[t]===s||(this.wrote[t]=s,this.root.setAttribute(e,s))}setBlend(t){!this.root||this.wrote.blend===t||(this.wrote.blend=t,t?this.root.style.setProperty("--cursor-blend",t):this.root.style.removeProperty("--cursor-blend"))}register(t){this.magnetic.register(t)}unregister(t){this.magnetic.unregister(t)}refresh(){this.magnetic.refresh()}scan(t){this.magnetic.scan(t)}dispose(){for(const t of this.offs)t();if(this.offs.length=0,this.magnetic.dispose(),this.styleEl?.remove(),document.documentElement.classList.remove("at13-cursor"),!!this.root){this.root.style.display="none",this.root.style.removeProperty("transform");for(const t of["--cursor-reveal","--cursor-link","--cursor-disc","--cursor-press","--cursor-speed","--cursor-blend"])this.root.style.removeProperty(t)}}}export{ut as default};
