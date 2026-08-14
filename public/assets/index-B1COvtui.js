import{g as w}from"./gsap-CzGW6FVa.js";import{g as ct,a as dt,b as ht}from"./index-BMUe7iZr.js";import{W as _,M as N,S as O,U as $,T as z,F as m,N as ut}from"./content-DRgEOFBw.js";import{l as ft}from"./dict-DtWlo-lz.js";import"./three-sQPBrRwf.js";const pt=5,R=1e-6,Q=(a,t)=>1-3*t+3*a,J=(a,t)=>3*t-6*a,tt=a=>3*a,M=(a,t,e)=>((Q(t,e)*a+J(t,e))*a+tt(t))*a,mt=(a,t,e)=>3*Q(t,e)*a*a+2*J(t,e)*a+tt(t);function gt(a,t,e){let s=a;for(let o=0;o<pt;o++){const l=mt(s,t,e);if(Math.abs(l)<R)break;const c=s-(M(s,t,e)-a)/l;if(c<0||c>1||!Number.isFinite(c))break;if(s=c,Math.abs(M(s,t,e)-a)<R)return s}let n=0,r=1;s=a;for(let o=0;o<24;o++){const l=M(s,t,e);if(Math.abs(l-a)<R)break;l>a?r=s:n=s,s=(n+r)/2}return s}function I(a,t,e,s){return a===t&&e===s?n=>n:n=>n<=0?0:n>=1?1:M(gt(n,a,e),t,s)}const b={out:I(.16,1,.3,1),wet:I(.19,.94,.24,1),settle:I(.28,.86,.2,1)},vt=/[\u2E80-\u303F\u3040-\u30FF\u3190-\u319F\u31F0-\u31FF\u3400-\u4DBF\u4E00-\u9FFF\uF900-\uFAFF\uFE30-\uFE4F\uFF00-\uFFEF]/,_t=new Set(Array.from("、。，．：；！？）」』】》〉｝］〕｀´,.!?:;)]}…‥‧·・％%°”’〟»›ーヽヾ々〻゛゜〜～")),wt=new Set(Array.from("（「『【《〈｛［〔([{“‘〝«‹＄＃＠$#@")),V=typeof Intl<"u"&&typeof Intl.Segmenter=="function"?new Intl.Segmenter(void 0,{granularity:"grapheme"}):null;function bt(a){if(!V)return Array.from(a);const t=[];for(const e of V.segment(a))t.push(e.segment);return t}function yt(a,t="lines"){const e=bt(a),s=[];let n="";const r=()=>{n&&(s.push({text:n,space:!1,br:!1}),n="")};for(const o of e){if(o===`
`||o==="\r"){r(),s.push({text:"",space:!1,br:!0});continue}if(/^\s$/.test(o)){r(),s.push({text:" ",space:!0,br:!1});continue}if(t==="chars"||vt.test(o)){r(),s.push({text:o,space:!1,br:!1});continue}n+=o}return r(),kt(s)}function kt(a){const t=[];for(let e=0;e<a.length;e++){const s=a[e];if(!s.space&&!s.br&&s.text.length===1){const n=t[t.length-1];if(_t.has(s.text)&&n&&!n.space&&!n.br){n.text+=s.text;continue}if(wt.has(s.text)){const r=a[e+1];if(r&&!r.space&&!r.br){r.text=s.text+r.text;continue}}}t.push({...s})}return t}function et(a,t){const e=[],s=(n,r)=>{for(const o of n.childNodes)if(o.nodeType===Node.TEXT_NODE)for(const l of yt(o.data,t))e.push({...l,path:r});else o.nodeType===Node.ELEMENT_NODE&&(o.tagName==="BR"?e.push({text:"",space:!1,br:!0,path:r}):s(o,r.concat(o)))};return s(a,[]),e}function st(a){const t=a.cloneNode(!1);return t.removeAttribute("data-i18n"),t.removeAttribute("id"),t.setAttribute("data-split-part",""),t}function at(a,t){let e=null,s=a,n="";const r=()=>{n&&(s.append(n),n="")};for(const o of t)if(!o.br){if(o.path!==e){r(),e=o.path,s=a;for(const l of o.path){const c=st(l);s.append(c),s=c}}n+=o.space?" ":o.text}r()}function xt(a){for(const t of a.childNodes)if(t.nodeType===Node.ELEMENT_NODE&&t.tagName!=="BR")return!0;return!1}function Et(a){const t=[];let e=null;for(const r of[...a.childNodes]){if(r.nodeType===Node.ELEMENT_NODE&&r.tagName==="BR"){e=null;continue}if(!(r.nodeType===Node.TEXT_NODE&&!r.data.trim())){if(r.nodeType===Node.ELEMENT_NODE){t.push([r]),e=null;continue}e||(e=[],t.push(e)),e.push(r)}}if(!t.length)return[];const s=document.createDocumentFragment(),n=[];return t.forEach((r,o)=>{const l=document.createElement("span");l.className="ln",l.setAttribute("data-ln",String(o)),l.style.setProperty("--i",String(o)),l.style.setProperty("--n",String(t.length));const c=document.createElement("span");c.className="ln__i",c.append(...r),l.append(c),s.append(l),n.push(c)}),a.replaceChildren(s),a.setAttribute("data-split-state","nodes"),n}function At(a){const t=a.getAttribute("data-split-state");if(!a.querySelector(":scope > .ln, :scope > .split__vis")){a.removeAttribute("data-split-state");return}const s=t==="chars"?a.querySelector(":scope > .split__sr")?.textContent??[...a.querySelectorAll(".ch")].map(n=>n.textContent).join(""):[...a.querySelectorAll(":scope > .ln")].map(n=>n.textContent).join("");a.textContent=s,a.removeAttribute("data-split-state")}function St(a){const t=a.querySelectorAll(":scope > .ln");if(!t.length){a.removeAttribute("data-split-state");return}const e=document.createDocumentFragment();for(const s of t){const n=s.firstElementChild;e.append(...n?n.childNodes:s.childNodes)}a.replaceChildren(e),a.removeAttribute("data-split-state")}function Ft(a){const t=et(a,"lines");if(!t.length)return[];const e=document.createDocumentFragment();Ct(e,t),a.replaceChildren(e);const s=getComputedStyle(a),n=parseFloat(s.lineHeight),r=parseFloat(s.fontSize)||16,o=Math.max(2,(Number.isFinite(n)?n:r*1.3)*.45),l=[];let c=null,u=0;for(const f of t){if(f.br){c=null;continue}if(f.space){c&&c.push(f);continue}const v=f.node.offsetTop;(!c||v-u>o)&&(c=[],l.push(c),u=v),c.push(f)}const d=document.createDocumentFragment(),p=[];return l.forEach((f,v)=>{const F=Nt(f);if(!F.length)return;const x=document.createElement("span");x.className="ln",x.setAttribute("data-ln",String(v)),x.style.setProperty("--i",String(v)),x.style.setProperty("--n",String(l.length));const C=document.createElement("span");C.className="ln__i",at(C,F),x.append(C),d.append(x),p.push(C)}),a.replaceChildren(d),a.setAttribute("data-split-state","lines"),p}function Ct(a,t){let e=null,s=a;for(const n of t){if(n.path!==e){e=n.path,s=a;for(const o of n.path){const l=st(o);s.append(l),s=l}}if(n.br){s.append(document.createElement("br"));continue}if(n.space){s.append(document.createTextNode(" "));continue}const r=document.createElement("span");r.textContent=n.text,n.node=r,s.append(r)}}function Nt(a){let t=0,e=a.length;for(;t<e&&a[t].space;)t++;for(;e-1>t&&a[e-1].space&&a[e-2].space;)e--;return a.slice(t,e)}function Pt(a){const t=et(a,"chars");if(!t.length)return[];const e=document.createDocumentFragment(),s=[],n=t.filter(c=>!c.space&&!c.br).length;let r=0;for(const c of t){if(c.br)continue;if(c.space){e.append(D("span","ch ch--sp"," "));continue}const u=D("span","ch");u.setAttribute("data-ch",String(r)),u.style.setProperty("--i",String(r)),u.style.setProperty("--n",String(n));const d=D("span","ch__i");at(d,[c]),u.append(d),e.append(u),s.push(d),r++}const o=document.createElement("span");o.className="split__vis",o.setAttribute("aria-hidden","true"),o.append(e);const l=document.createElement("span");return l.className="sr-only split__sr",l.textContent=t.map(c=>c.space?" ":c.text).join(""),a.replaceChildren(o,l),a.setAttribute("data-split-state","chars"),s}function D(a,t,e){const s=document.createElement(a);return s.className=t,e!=null&&(s.textContent=e),s}const Lt=.085,Tt=.09,$t=80,K=a=>a.hasAttribute("data-split")?a.getAttribute("data-split")||"lines":a.getAttribute("data-reveal-part")||a.getAttribute("data-reveal")||"lift";class zt{constructor(t){this.ctx=t,this.records=new Map,this.originals=new WeakMap,this.pending=new Set,this.dirty=new Set,this.healFrame=0,this.enabled=!1,this.io=new IntersectionObserver(this.onIntersect,{rootMargin:"0px 0px -10% 0px",threshold:[0,.08]}),this.mo=new MutationObserver(this.onMutate)}scan(t=document,e=null){const s=t.querySelectorAll('[data-reveal="group"]');for(const r of s)this.add(r,"group",e?.has(r));const n=t.querySelectorAll("[data-split], [data-reveal]");for(const r of n)r.getAttribute("data-reveal")!=="group"&&(r.closest('[data-reveal="group"]')||r.closest("[data-reveal-part]")||this.add(r,K(r),e?.has(r)))}scanSettled(t=document){if(this.ctx.reducedMotion){this.scan(t);return}const e=window.innerHeight,s=new Set;for(const n of t.querySelectorAll("[data-split], [data-reveal]")){if(this.records.has(n))continue;const r=n.getBoundingClientRect();(r.width||r.height)&&r.top<e+$t&&s.add(n)}this.scan(t,s)}add(t,e,s=!1){if(this.records.has(t))return;const n={el:t,kind:e,beats:[],played:!1,timeline:null};if(this.records.set(t,n),this.ctx.reducedMotion){t.setAttribute("data-revealed",""),n.played=!0;return}try{if(this.build(n),s){n.played=!0,this.setFinalState(n);return}this.setPreState(n)}catch(r){console.warn("[sections] reveal skipped for",t.className||t.tagName,r?.message||r),t.setAttribute("data-revealed",""),n.played=!0;return}this.io.observe(t)}build(t){const e=t.kind==="group"?[...t.el.querySelectorAll("[data-reveal-part], [data-split]")]:[t.el];t.beats=e.map(s=>{const n=K(s),r=parseFloat(s.getAttribute("data-reveal-at"));return{el:s,kind:n,targets:this.targetsFor(s,n),at:Number.isFinite(r)?r:null}}),this.mo.takeRecords()}targetsFor(t,e){switch(e){case"lines":return this.resplitNode(t,"lines");case"chars":return this.resplitNode(t,"chars");case"mask":return[t.querySelector("[data-mask-inner]")||t.firstElementChild||t];case"stagger":return[...t.children];case"media":return[t,t.querySelector("img")].filter(Boolean);default:return[t]}}resplitNode(t,e){this.unsplit(t);let s;return e==="chars"?(this.remember(t),s=Pt(t)):xt(t)?s=Et(t):(this.remember(t),s=Ft(t)),this.observeSource(t),s}remember(t){this.originals.has(t)||this.originals.set(t,Bt(t))}observeSource(t){this.mo.observe(t,{childList:!0,characterData:!0,subtree:!0})}unsplit(t){const e=t.getAttribute("data-split-state");if(e){if(e==="nodes"){St(t);return}if(this.originals.has(t)){this.restore(t);return}At(t)}}restore(t){const e=this.originals.get(t);e&&(t.replaceChildren(e.cloneNode(!0)),t.removeAttribute("data-split-state"))}releaseForLang(){for(const t of this.records.values())for(const e of t.beats)e.kind!=="lines"&&e.kind!=="chars"||(this.originals.delete(e.el),this.unsplit(e.el));this.mo.takeRecords()}onMutate=t=>{for(const e of t){const n=(e.target.nodeType===Node.ELEMENT_NODE?e.target:e.target.parentElement)?.closest("[data-split]");n&&this.dirty.add(n)}this.dirty.size&&(cancelAnimationFrame(this.healFrame),this.healFrame=requestAnimationFrame(this.heal))};heal=()=>{this.dirty.size&&this.refresh()};refresh(){if(!this.ctx.reducedMotion){cancelAnimationFrame(this.healFrame);for(const t of this.dirty)this.originals.delete(t);this.dirty.clear();for(const t of this.records.values())if(t.beats.some(s=>s.kind==="lines"||s.kind==="chars")){t.timeline?.kill(),t.timeline=null;try{this.build(t)}catch{t.el.setAttribute("data-revealed",""),t.played=!0;continue}t.played?this.setFinalState(t):this.setPreState(t)}this.mo.takeRecords()}}prune(){for(const[t,e]of this.records)t.isConnected||(e.timeline?.kill(),this.io.unobserve(t),this.records.delete(t),this.pending.delete(e))}setPreState(t){for(const e of t.beats){const{targets:s,kind:n}=e;if(s.length)switch(n){case"lines":w.set(s,{yPercent:116,rotate:2.4,transformOrigin:"0% 0%"});break;case"chars":w.set(s,{yPercent:108,rotate:5,transformOrigin:"0% 100%"});break;case"mask":w.set(s,{yPercent:112,rotate:1.6,transformOrigin:"0% 0%"});break;case"media":w.set(e.el,{clipPath:"inset(0% 0% 100% 0%)"}),s[1]&&w.set(s[1],{scale:1.18,yPercent:3});break;case"rule":w.set(s,{scaleX:0,transformOrigin:"0% 50%"});break;case"stagger":w.set(s,{y:20,opacity:0});break;default:w.set(s,{y:26,opacity:0})}}}setFinalState(t){for(const e of t.beats)if(e.targets.length){if(e.kind==="media"){w.set(e.el,{clearProps:"clipPath"}),e.targets[1]&&w.set(e.targets[1],{clearProps:"transform"});continue}w.set(e.targets,{clearProps:"transform,opacity,willChange"})}t.el.setAttribute("data-revealed","")}onIntersect=t=>{for(const e of t){const s=this.records.get(e.target);if(!s||s.played)continue;if(e.isIntersecting){this.io.unobserve(e.target),this.enabled?this.play(s):this.pending.add(s);continue}const n=e.rootBounds?e.rootBounds.top:0;e.boundingClientRect.bottom<n&&(this.io.unobserve(e.target),s.played=!0,this.setFinalState(s))}};sweep(){const t=[];for(const e of this.records.values()){if(e.played)continue;const s=e.el.getBoundingClientRect();s.height>0&&s.bottom<0&&t.push(e)}for(const e of t)this.io.unobserve(e.el),this.pending.delete(e),e.played=!0,this.setFinalState(e)}enable(){if(this.enabled)return;this.enabled=!0,this.sweep();const t=[...this.pending].sort((e,s)=>e.el.getBoundingClientRect().top-s.el.getBoundingClientRect().top);this.pending.clear(),t.forEach((e,s)=>this.play(e,s*Tt))}play(t,e=0){if(t.played)return;if(t.played=!0,this.ctx.reducedMotion){t.el.setAttribute("data-revealed","");return}const s=w.timeline({delay:e,onComplete:()=>{t.el.setAttribute("data-revealed",""),t.timeline=null,s.kill()}});t.timeline=s,t.beats.forEach((n,r)=>{const o=n.at!=null?n.at:r*Lt;this.addBeat(s,n,o)}),s.getChildren().length||(s.kill(),t.el.setAttribute("data-revealed",""),t.timeline=null)}addBeat(t,e,s){const{targets:n,kind:r}=e;if(n.length)switch(r){case"lines":t.to(n,{yPercent:0,rotate:0,duration:1.15,ease:b.wet,stagger:.075,clearProps:"transform"},s);break;case"chars":t.to(n,{yPercent:0,rotate:0,duration:.92,ease:b.wet,stagger:.026,clearProps:"transform"},s);break;case"mask":t.to(n,{yPercent:0,rotate:0,duration:1.05,ease:b.wet,stagger:.06,clearProps:"transform"},s);break;case"media":t.to(e.el,{clipPath:"inset(0% 0% 0% 0%)",duration:1.3,ease:b.settle,clearProps:"clipPath"},s),n[1]&&t.to(n[1],{scale:1,yPercent:0,duration:1.6,ease:b.settle,clearProps:"transform"},s);break;case"rule":t.to(n,{scaleX:1,duration:1.1,ease:b.out,clearProps:"transform"},s);break;case"stagger":t.to(n,{y:0,opacity:1,duration:.85,ease:b.out,stagger:.055,clearProps:"transform,opacity"},s);break;default:t.to(n,{y:0,opacity:1,duration:.95,ease:b.out,clearProps:"transform,opacity"},s)}}dispose(){this.io.disconnect(),this.mo.disconnect(),cancelAnimationFrame(this.healFrame);for(const t of this.records.values())t.timeline?.kill();this.records.clear(),this.pending.clear(),this.dirty.clear()}}class Mt{constructor(t){this.ctx=t,this.current=null,this.io=new IntersectionObserver(this.onIntersect,{rootMargin:"-45% 0px -45% 0px",threshold:0})}observe(t=document){for(const e of t.querySelectorAll("[data-section]"))this.io.observe(e)}onIntersect=t=>{for(const e of t){const s=e.target.getAttribute("data-section");e.isIntersecting?(e.target.setAttribute("data-inview",""),s&&s!==this.current&&(this.current=s,this.ctx.bus.emit("section:enter",s))):e.target.removeAttribute("data-inview")}};dispose(){this.io.disconnect()}}function Bt(a){const t=document.createDocumentFragment();for(const e of a.childNodes)t.append(e.cloneNode(!0));return t}function U(a,t){if(t==null||t===!1)return a;if(Array.isArray(t)){for(const e of t)U(a,e);return a}return a.append(t instanceof Node?t:document.createTextNode(String(t))),a}function i(a,t,e){const s=document.createElement(a);if(t)for(const n in t){const r=t[n];if(!(r==null||r===!1))if(n==="style"&&typeof r=="object")for(const o in r)s.style.setProperty(o,String(r[o]));else r===!0?s.setAttribute(n,""):s.setAttribute(n,String(r))}return U(s,e),s}function Ot(a){return U(document.createDocumentFragment(),a)}function k(a,t){return a?(a.replaceChildren(Ot(t)),a):null}const h=(a,t)=>{const e=typeof a=="string"?a:a?.[t]??a?.zh??a?.en??"";return t==="en"?ft(e):e},g=a=>a==="en"?"en":"zh-Hant",Rt=/[\u3005\u3006\u3040-\u30FF\u3400-\u4DBF\u4E00-\u9FFF\uF900-\uFAFF]/,It=a=>Rt.test(String(a??""))?"zh-Hant":null;function nt(a){return String(a).split(/\s*[；;·・･]\s*/).map(t=>t.trim()).filter(Boolean)}const y=a=>String(a+1).padStart(2,"0");function Dt(a,t){const e=_.find(s=>s.id===a);return e?h(e,t):""}function qt(a,t){return{full:ht(t),tex:dt(t),thumb:ct(t)}}const Wt=`
:where(.craft__frame, .team__frame) {
  --pane-fog: clamp(8px, 0.95vw, 17px);
  -webkit-mask-image:
    linear-gradient(to right, transparent 0, #000 var(--pane-fog),
      #000 calc(100% - var(--pane-fog)), transparent 100%),
    linear-gradient(to bottom, transparent 0, #000 var(--pane-fog),
      #000 calc(100% - var(--pane-fog) * 1.9), transparent 100%);
  mask-image:
    linear-gradient(to right, transparent 0, #000 var(--pane-fog),
      #000 calc(100% - var(--pane-fog)), transparent 100%),
    linear-gradient(to bottom, transparent 0, #000 var(--pane-fog),
      #000 calc(100% - var(--pane-fog) * 1.9), transparent 100%);
  -webkit-mask-composite: source-in;
  mask-composite: intersect;
}
:where(.craft__frame, .team__frame)::before {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
  mix-blend-mode: screen;
  background:
    linear-gradient(to top,
      color-mix(in srgb, var(--harbour) 7%, transparent) 0,
      color-mix(in srgb, var(--harbour) 24%, transparent) 6%,
      color-mix(in srgb, var(--harbour) 9%, transparent) 12%,
      transparent 26%),
    linear-gradient(to bottom,
      color-mix(in srgb, var(--bone) 2%, transparent) 0,
      color-mix(in srgb, var(--bone) 6%, transparent) 3%,
      transparent 10%);
}
`;function rt(){if(typeof document>"u"||document.head.querySelector("style[data-at13-pane]"))return;const a=document.createElement("style");a.setAttribute("data-at13-pane",""),a.textContent=Wt,document.head.appendChild(a)}function B(a,{id:t,w:e,h:s,alt:n="",className:r,sizes:o,eager:l=!1,part:c}){const{full:u,tex:d,thumb:p}=qt(a,t),f=Math.max(e,s)>1024?Math.round(1024*e/Math.max(e,s)):e,v=i("img",{class:r,crossorigin:"anonymous",src:d,srcset:`${p} ${Math.round(e/3)}w, ${d} ${f}w, ${u} ${e}w`,sizes:o,width:e,height:s,alt:n,loading:l?"eager":"lazy",decoding:"async",draggable:"false","data-asset":t,"data-img-part":c});return v.addEventListener("error",Ht,{once:!0}),v}function Ht(a){const t=a.currentTarget;t.closest("[data-media]")?.setAttribute("data-img-error",""),t.removeAttribute("srcset")}const q=(a,t,e)=>a<t?t:a>e?e:a,P=(a,t,e,s)=>a+(t-a)*(1-Math.exp(-e*s)),W=.0015,Yt=.5,jt="(hover: hover) and (pointer: fine)";class Ut{constructor(t){this.ctx=t,this.entries=[],this.active=new Set,this.rails=[],this.railVelocity=0,this.reduced=!!t.reducedMotion,this.hoverMedia=typeof matchMedia=="function"?matchMedia(jt):null,this.mediaBound=!1,this.enabled=this.allows(),this.lastScrollY=null,this.onMediaChange=()=>{if(this.enabled=this.allows(),!this.enabled)for(const e of[...this.active])e.hovering=!1,e.focused=!1,e.target=0,this.sleep(e)}}allows(){return!this.reduced&&(!this.hoverMedia||this.hoverMedia.matches)}bindMedia(){this.mediaBound||!this.hoverMedia||(this.mediaBound=!0,this.hoverMedia.addEventListener?.("change",this.onMediaChange))}addCard(t,e,s={}){if(this.reduced||!t)return;this.bindMedia();const n={item:t,frame:e.frame||null,image:e.image||null,numeral:e.numeral||null,lift:s.lift??1,drift:s.drift??1,hover:0,target:0,px:0,py:0,tx:0,ty:0,rect:null,hovering:!1,focused:!1,steering:!1,onPointerEnter:null,onPointerLeave:null,onFocusIn:null,onFocusOut:null},r=()=>{this.enabled&&(n.target=1,this.wake(n))},o=()=>{n.hovering||n.focused||n.target===0&&!this.active.has(n)||(n.target=0,n.steering=!1,this.wake(n))};n.onPointerEnter=()=>{this.enabled&&(n.hovering=!0,n.steering=!0,n.rect=null,r())},n.onPointerLeave=()=>{n.hovering=!1,n.steering=!1,o()},n.onFocusIn=()=>{n.focused=!0,n.hovering||(n.steering=!1,n.tx=0,n.ty=0),r()},n.onFocusOut=()=>{n.focused=!1,o()},t.addEventListener("pointerenter",n.onPointerEnter),t.addEventListener("pointerleave",n.onPointerLeave),t.addEventListener("focusin",n.onFocusIn),t.addEventListener("focusout",n.onFocusOut),this.entries.push(n)}addRail(t){t&&this.rails.push(t)}wake(t){this.active.add(t),t.frame&&(t.frame.style.willChange="transform"),t.image&&(t.image.style.willChange="transform")}sleep(t){this.active.delete(t),t.hover=0,t.px=0,t.py=0,t.tx=0,t.ty=0,t.rect=null,t.steering=!1,t.frame&&(t.frame.style.transform="",t.frame.style.willChange=""),t.image&&(t.image.style.transform="",t.image.style.willChange=""),t.numeral&&(t.numeral.style.transform=""),t.item.style.setProperty("--hover","0")}update(t){if(!this.reduced){if(this.enabled&&this.active.size){const e=this.ctx.scroll?.y??0;if(this.lastScrollY===null||Math.abs(e-this.lastScrollY)>=Yt){this.lastScrollY=e;for(const s of this.active)s.rect=null}}if(this.enabled)for(const e of this.active){if(!e.item.hasAttribute("data-revealed")){e.target===0&&(this.active.delete(e),e.frame&&(e.frame.style.willChange=""),e.image&&(e.image.style.willChange=""));continue}if(e.target>0&&e.steering){const l=e.rect||(e.rect=e.item.getBoundingClientRect());l.width>0&&l.height>0&&(e.tx=q((this.ctx.pointer.x-l.left)/l.width*2-1,-1,1),e.ty=q((this.ctx.pointer.y-l.top)/l.height*2-1,-1,1))}const s=e.target>0;e.hover=P(e.hover,e.target,e.target>e.hover?10:3.5,t),e.px=P(e.px,s?e.tx:0,s?8:4.5,t),e.py=P(e.py,s?e.ty:0,s?8:4.5,t);const n=e.hover,r=e.px*n,o=e.py*n;e.frame&&(e.frame.style.transform=`translate3d(${(r*7*e.lift).toFixed(3)}px, ${(o*5*e.lift).toFixed(3)}px, 0) rotate(${(r*.75*e.lift).toFixed(3)}deg) scale(${(1+.026*n*e.lift).toFixed(4)})`),e.image&&(e.image.style.transform=`translate3d(${(-r*8*e.drift).toFixed(3)}px, ${(-o*6*e.drift).toFixed(3)}px, 0) scale(${(1+.085*n*e.drift).toFixed(4)})`),e.numeral&&(e.numeral.style.transform=`translate3d(${(-r*9).toFixed(3)}px, ${(-o*5).toFixed(3)}px, 0)`),e.item.style.setProperty("--hover",n.toFixed(4)),e.item.style.setProperty("--mx",(.5+e.px*.5).toFixed(4)),e.item.style.setProperty("--my",(.5+e.py*.5).toFixed(4)),e.target===0&&n<W&&Math.abs(e.px)<W&&Math.abs(e.py)<W&&this.sleep(e)}if(this.rails.length){const e=q(this.ctx.scroll.velocity||0,-3,3),s=P(this.railVelocity,e,5,t);if(Math.abs(s-this.railVelocity)>.001){this.railVelocity=s;const n=s.toFixed(4);for(const r of this.rails)r.style.setProperty("--vel",n)}}}}dispose(){for(const t of this.entries)t.item.removeEventListener("pointerenter",t.onPointerEnter),t.item.removeEventListener("pointerleave",t.onPointerLeave),t.item.removeEventListener("focusin",t.onFocusIn),t.item.removeEventListener("focusout",t.onFocusOut);this.entries.length=0,this.rails.length=0,this.active.clear(),this.mediaBound&&(this.mediaBound=!1,this.hoverMedia?.removeEventListener?.("change",this.onMediaChange))}}const X=["lede","argument","coda"];function Vt(a,t,e){k(t.manifestoBody,N.body.map((s,n)=>i("p",{class:`mani__p mani__p--${X[n]||"argument"}`,"data-index":n,"data-role":X[n]||"argument","data-split":"lines","data-reveal-at":(n*.14).toFixed(2),lang:g(e),style:{"--i":n,"--n":N.body.length}},h(s,e)))),k(t.manifestoStats,N.stat.map((s,n)=>i("li",{class:"stat","data-index":n,"data-reveal":"group",style:{"--i":n,"--n":N.stat.length}},[i("span",{class:"stat__rule","data-reveal-part":"rule","aria-hidden":"true"}),i("span",{class:"stat__no","data-reveal-part":"mask","aria-hidden":"true"},[i("span",{class:"mask__i","data-mask-inner":!0},y(n))]),i("span",{class:"stat__v","data-split":"chars"},s.v),i("span",{class:"stat__k","data-reveal-part":"mask",lang:g(e)},[i("span",{class:"mask__i","data-mask-inner":!0},h(s.k,e))])])))}const H=[{align:"lead",weight:"major"},{align:"trail",weight:"minor"},{align:"lead",weight:"minor"},{align:"trail",weight:"major"},{align:"lead",weight:"minor"},{align:"trail",weight:"minor"}],Kt="(max-width: 700px) 100vw, (max-width: 1100px) 92vw, 46vw";function Xt(a,t,e,s){const n=t.craftList;n&&(rt(),k(n,O.map((r,o)=>{const l=H[o]||H[H.length-1],c=B(a,{id:r.img,w:1100,h:1100,alt:"",className:"craft__img",sizes:Kt,part:"craft"});c.setAttribute("data-craft-img","");const u=i("span",{class:"craft__frame","data-craft-shot":!0},c),d=i("li",{class:"craft__item",id:`craft-${r.id}`,"data-craft-item":!0,"data-service":r.id,"data-index":o,"data-align":l.align,"data-weight":l.weight,"data-reveal":"group",style:{"--i":o,"--n":O.length}},[i("span",{class:"craft__rule","data-reveal-part":"rule","aria-hidden":"true"}),i("div",{class:"craft__index","aria-hidden":"true"},[i("span",{class:"craft__numeral","data-craft-numeral":!0,"data-reveal-part":"mask"},[i("span",{class:"mask__i","data-mask-inner":!0},r.idx)]),i("span",{class:"craft__count","data-reveal-part":"mask"},[i("span",{class:"mask__i","data-mask-inner":!0},`${y(o)} / ${y(O.length-1)}`)])]),i("figure",{class:"craft__media","data-media":!0,"data-reveal-part":"media"},[u,i("span",{class:"craft__sheen","aria-hidden":"true"})]),i("div",{class:"craft__text"},[i("h3",{class:"craft__name"},[i("span",{class:"craft__name-en","data-reveal-part":"mask",lang:"en"},[i("span",{class:"mask__i","data-mask-inner":!0},r.en)]),i("span",{class:"craft__name-zh","data-reveal-part":"mask",lang:"zh-Hant"},[i("span",{class:"mask__i","data-mask-inner":!0},r.zh)])]),i("ul",{class:"craft__terms","data-reveal-part":"stagger",lang:g(e)},nt(h(r.tag,e)).map((p,f)=>i("li",{class:"craft__term",style:{"--i":f}},p))),i("p",{class:"craft__body","data-split":"lines",lang:g(e)},h(r.body,e))])]);return s?.addCard(d,{frame:u,image:c,numeral:d.querySelector("[data-craft-numeral] .mask__i")},{lift:1,drift:1}),d})))}const E={close:$.close,prev:$.prev,next:$.next,viewer:{zh:"作品檢視",en:"Work viewer"},of:{zh:"／",en:"/"}},A=(a,t)=>t==="en"?a.en:a.zh,Z="cubic-bezier(0.7, 0, 0.84, 0)",Zt="cubic-bezier(0.16, 1, 0.3, 1)",Gt=[{clipPath:"inset(0% 0% 0% 0%)",transform:"translate3d(0, 0, 0)"},{clipPath:"inset(0% 0% 100% 0%)",transform:"translate3d(0, -1.4vh, 0)"}],Qt=[{clipPath:"inset(0% 0% 100% 0%)",transform:"translate3d(0, 2.2vh, 0)"},{clipPath:"inset(0% 0% 0% 0%)",transform:"translate3d(0, 0, 0)"}],Jt=[{clipPath:"inset(0% 0% 0% 0%)",transform:"translate3d(0, 0, 0)"},{clipPath:"inset(100% 0% 0% 0%)",transform:"translate3d(0, 2.2vh, 0)"}],te=380,ee=720,se=420,ae=`
:where(.wv) {
  position: fixed;
  inset: 0;
  width: 100%;
  max-width: none;
  height: 100%;
  max-height: none;
  margin: 0;
  padding: 0;
  border: 0;
  overflow: hidden;
  background: transparent;
  color: var(--bone);
}
:where(.wv:focus) { outline: none; }
:where(.wv)::backdrop {
  background: color-mix(in srgb, var(--ink) 95%, transparent);
  -webkit-backdrop-filter: blur(18px) saturate(0.86);
  backdrop-filter: blur(18px) saturate(0.86);
}
/* No top layer (no showModal): stand in for it. */
:where(.wv.is-flat) {
  z-index: 200;
  background: color-mix(in srgb, var(--ink) 96%, transparent);
}
:where(.wv__inner) {
  position: relative;
  display: grid;
  grid-template-rows: minmax(0, 1fr) auto;
  gap: clamp(1.1rem, 2.4vw, 2.1rem);
  height: 100%;
  padding:
    clamp(3.6rem, 8vh, 6.5rem)
    var(--pad-x, clamp(1.5rem, 4.2vw, 5.5rem))
    clamp(1.6rem, 4.5vh, 3.2rem);
}
:where(.wv__stage) {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 0;
}
:where(.wv__fig) {
  position: relative;
  display: block;
  max-width: min(100%, 54rem);
  max-height: 100%;
  margin: 0;
  background: var(--ink-2);
  overflow: hidden;
}
:where(.wv__img) {
  display: block;
  width: auto;
  height: auto;
  max-width: 100%;
  max-height: min(72vh, 100%);
  object-fit: contain;
  filter: var(--img-grade, none);
}
:where(.wv__bar) {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  justify-content: space-between;
  gap: 1.2rem 2rem;
  padding-top: clamp(0.8rem, 1.6vh, 1.4rem);
  border-top: 1px solid var(--line-soft, rgba(237, 232, 225, 0.11));
}
:where(.wv__cap) {
  position: relative;
  display: grid;
  gap: 0.28em;
  padding-left: clamp(1rem, 2vw, 1.9rem);
  min-width: 0;
}
/* the falling line: a brass hairline dropped beside the caption */
:where(.wv__cap)::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0.1em;
  bottom: 0.1em;
  width: 1px;
  background: var(--brass, #C6A15B);
  transform-origin: 50% 0%;
}
:where(.wv__no) {
  font: 500 var(--t-micro, 0.7rem) / 1 var(--f-ui, sans-serif);
  letter-spacing: 0.24em;
  color: var(--brass, #C6A15B);
}
:where(.wv__title) {
  margin: 0;
  font-family: var(--f-display, serif);
  font-variation-settings: var(--fv-sub-sm, normal);
  font-size: var(--t-d3, 1.6rem);
  font-weight: 400;
  line-height: 1.14;
  color: var(--bone, #EDE8E1);
}
:where(.wv__title:lang(zh-Hant)) {
  font-family: var(--f-han, serif);
  font-variation-settings: var(--fv-han-title, normal);
  font-size: calc(var(--t-d3, 1.6rem) * 0.86);
}
:where(.wv__meta) {
  margin: 0;
  font: var(--t-meta, 0.8rem) / 1.3 var(--f-ui, sans-serif);
  letter-spacing: 0.08em;
  color: var(--bone-dim, #8B857D);
}
:where(.wv__nav) {
  display: flex;
  align-items: center;
  gap: clamp(0.9rem, 2vw, 1.8rem);
  margin-left: auto;
}
:where(.wv__count) {
  font: 500 var(--t-micro, 0.7rem) / 1 var(--f-ui, sans-serif);
  letter-spacing: 0.2em;
  color: var(--bone-dim, #8B857D);
  font-variant-numeric: tabular-nums;
}
:where(.wv__btn) {
  padding: 0.55em 0;
  border: 0;
  background: none;
  color: var(--bone-2, #C7C1B8);
  font: 500 var(--t-micro, 0.7rem) / 1 var(--f-ui, sans-serif);
  letter-spacing: 0.2em;
  text-transform: uppercase;
  cursor: pointer;
  transition: color 320ms var(--e-out, ease);
}
:where(.wv__btn:hover, .wv__btn:focus-visible) { color: var(--brass-hi, #E4C88B); }
:where(.wv__close) {
  position: absolute;
  top: clamp(1rem, 3.2vh, 2.4rem);
  right: var(--pad-x, clamp(1.5rem, 4.2vw, 5.5rem));
  display: inline-flex;
  align-items: center;
  gap: 0.7em;
  padding: 0.6em 0;
  border: 0;
  background: none;
  color: var(--bone-2, #C7C1B8);
  font: 500 var(--t-micro, 0.7rem) / 1 var(--f-ui, sans-serif);
  letter-spacing: 0.2em;
  text-transform: uppercase;
  cursor: pointer;
  transition: color 320ms var(--e-out, ease);
}
:where(.wv__close)::after {
  content: '';
  width: 1.1em;
  height: 1.1em;
  background:
    linear-gradient(currentColor, currentColor) 50% 50% / 100% 1px no-repeat,
    linear-gradient(currentColor, currentColor) 50% 50% / 1px 100% no-repeat;
  transform: rotate(45deg);
  transition: transform 520ms var(--e-out, ease);
}
:where(.wv__close:hover, .wv__close:focus-visible) { color: var(--brass-hi, #E4C88B); }
:where(.wv__close:hover)::after { transform: rotate(135deg); }

@media (prefers-reduced-motion: no-preference) {
  :where(.wv[open])::backdrop { animation: wv-veil 460ms var(--e-out, ease) both; }
  :where(.wv[open]) :where(.wv__fig) { animation: wv-plate 720ms var(--e-out, ease) both; }
  :where(.wv[open]) :where(.wv__bar) { animation: wv-bar 620ms 120ms var(--e-out, ease) both; }
  :where(.wv[open]) :where(.wv__cap)::before { animation: wv-drop 900ms 180ms var(--e-drop, ease) both; }
  /* The blur plate leaves the way it arrived. ::backdrop cannot be reached by
     Element.animate(), so the drain that close() plays on .wv__inner is joined
     here by a class-driven counterpart — declared AFTER the [open] rule above
     so it wins the animation shorthand at equal (zero) specificity. On the
     no-showModal path there is no ::backdrop at all: the dialog itself is
     carrying the veil (.wv.is-flat), so it takes the same fade. */
  :where(.wv.is-closing)::backdrop { animation: wv-veil-out 420ms var(--e-in, ease) both; }
  :where(.wv.is-flat.is-closing) { animation: wv-veil-out 420ms var(--e-in, ease) both; }
}
@keyframes wv-veil { from { opacity: 0 } to { opacity: 1 } }
@keyframes wv-veil-out { from { opacity: 1 } to { opacity: 0 } }
@keyframes wv-plate {
  from { opacity: 0; transform: translate3d(0, 2.2vh, 0) scale(1.03); clip-path: inset(0 0 12% 0) }
  to   { opacity: 1; transform: none; clip-path: inset(0 0 0 0) }
}
@keyframes wv-bar { from { opacity: 0; transform: translate3d(0, 1.1rem, 0) } to { opacity: 1; transform: none } }
@keyframes wv-drop { from { transform: scaleY(0) } to { transform: scaleY(1) } }

@media (max-width: 720px) {
  :where(.wv__bar) { align-items: flex-start; }
  :where(.wv__nav) { width: 100%; justify-content: space-between; margin-left: 0; }
}
`;function ne(){if(document.head.querySelector("style[data-at13-viewer]"))return;const a=document.createElement("style");a.setAttribute("data-at13-viewer",""),a.textContent=ae,document.head.appendChild(a)}class re{constructor(t){this.ctx=t,this.dlg=null,this.index=-1,this.opener=null,this.wiping=!1,this.closing=!1,this.disposed=!1,this.anims=new Set,this.offs=[],this.offs.push(t.bus.on("lang",()=>{this.isOpen&&this.paint()}))}get isOpen(){return!!this.dlg&&this.index>=0}open(t,e){if(_[t]){if(e&&(this.opener=e),this.isOpen){if(this.index=t,!this.animates()){this.paint();return}this.wiping||this.wipe();return}if(this.build(),this.index=t,this.paint(),typeof this.dlg.showModal=="function")try{this.dlg.showModal()}catch{this.flat()}else this.flat();queueMicrotask(()=>{this.isOpen&&this.ctx.modules.get("scroll")?.lock?.("overlay")}),this.ctx.modules.has("gallery")||this.ctx.bus.emit("work:open",{index:t,id:_[t].id,el:this.opener}),this.dlg.focus({preventScroll:!0})}}close(t=!1){if(!this.dlg||this.closing)return;if(!this.dlg.open){this.onClosed();return}if(t||!this.animates()){this.dlg.close();return}this.closing=!0,this.dlg.classList.add("is-closing");const e=this.play(this.inner,Jt,{duration:se,easing:Z,fill:"forwards"}),s=()=>{this.closing=!1,this.dlg?.open?this.dlg.close():this.onClosed()};e.finished.then(s,s)}animates(){return!this.disposed&&!this.ctx.reducedMotion&&typeof this.figure?.animate=="function"}play(t,e,s){const n=t.animate(e,s);this.anims.add(n);const r=()=>this.anims.delete(n);return n.finished.then(r,r),n}cancelAnims(){for(const t of[...this.anims])t.cancel();this.anims.clear()}flat(){this.dlg.classList.add("is-flat"),this.dlg.setAttribute("open",""),this.dlg.setAttribute("role","dialog"),this.dlg.setAttribute("aria-modal","true")}build(){this.dlg||(ne(),this.figure=i("figure",{class:"wv__fig","data-media":!0}),this.no=i("span",{class:"wv__no"}),this.title=i("h2",{class:"wv__title"}),this.meta=i("p",{class:"wv__meta"}),this.count=i("span",{class:"wv__count"}),this.prevBtn=i("button",{type:"button",class:"wv__btn","data-wv-prev":!0}),this.nextBtn=i("button",{type:"button",class:"wv__btn","data-wv-next":!0}),this.closeBtn=i("button",{type:"button",class:"wv__close","data-wv-close":!0}),this.closeLabel=i("span"),this.closeBtn.append(this.closeLabel),this.stage=i("div",{class:"wv__stage"},this.figure),this.inner=i("div",{class:"wv__inner"},[this.stage,i("div",{class:"wv__bar"},[i("div",{class:"wv__cap"},[this.no,this.title,this.meta]),i("div",{class:"wv__nav"},[this.prevBtn,this.count,this.nextBtn])]),this.closeBtn]),this.dlg=i("dialog",{class:"wv",tabindex:"-1","data-work-viewer":!0},[this.inner]),this.dlg.addEventListener("close",this.onClosed),this.dlg.addEventListener("cancel",()=>{}),this.dlg.addEventListener("click",this.onClick),this.dlg.addEventListener("keydown",this.onKey),document.body.appendChild(this.dlg))}onClick=t=>{const e=t.target instanceof Element?t.target:null;if(e){if(e.closest("[data-wv-close]")){this.close();return}if(e.closest("[data-wv-prev]")){this.step(-1);return}if(e.closest("[data-wv-next]")){this.step(1);return}(e===this.dlg||e===this.stage)&&this.close()}};onKey=t=>{if(t.key==="Escape"){t.preventDefault(),this.close();return}t.key==="ArrowLeft"?(t.preventDefault(),this.step(-1)):t.key==="ArrowRight"&&(t.preventDefault(),this.step(1))};step(t){if(this.isOpen){if(this.index=(this.index+t+_.length)%_.length,!this.animates()){this.paint();return}this.wiping||this.wipe()}}wipe(){this.wiping=!0;const t=this.play(this.figure,Gt,{duration:te,easing:Z,fill:"forwards"}),e=()=>{if(this.wiping=!1,!this.isOpen||this.closing){t.cancel();return}this.paint(),t.cancel(),this.play(this.figure,Qt,{duration:ee,easing:Zt})};t.finished.then(e,e)}paint(){const{ctx:t}=this,e=t.lang,s=_[this.index];if(!s)return;const n=h(s,e),r=h(s.meta,e);this.figure.replaceChildren(B(t,{id:s.id,w:1200,h:1600,alt:e==="en"?`${n} (${r})`:`${n}（${r}）`,className:"wv__img",sizes:"92vw",eager:!0,part:"viewer"})),this.figure.removeAttribute("data-img-error"),this.no.textContent=y(this.index),this.title.textContent=n,this.title.setAttribute("lang",g(e)),this.meta.textContent=r,this.meta.setAttribute("lang",g(e)),this.count.textContent=`${y(this.index)} ${A(E.of,e)} ${y(_.length-1)}`,this.prevBtn.textContent=A(E.prev,e),this.nextBtn.textContent=A(E.next,e),this.closeLabel.textContent=A(E.close,e),this.dlg.setAttribute("aria-label",`${A(E.viewer,e)}: ${n}`)}onClosed=()=>{if(this.index<0)return;const t=this.index;this.index=-1,this.wiping=!1,this.closing=!1,this.cancelAnims(),this.dlg?.classList.remove("is-flat"),this.dlg?.classList.remove("is-closing"),this.dlg?.removeAttribute("open"),this.ctx.modules.get("scroll")?.unlock?.("overlay"),this.ctx.bus.emit("work:close",{index:t});const e=this.opener;this.opener=null,e?.isConnected&&e.focus({preventScroll:!0})};dispose(){for(const t of this.offs)t();this.offs.length=0,this.disposed=!0,this.cancelAnims(),this.isOpen&&this.close(!0),this.dlg?.remove(),this.dlg=null}}const Y=[{size:"xl",shift:0},{size:"sm",shift:26},{size:"md",shift:-12},{size:"lg",shift:9},{size:"sm",shift:32},{size:"md",shift:-6},{size:"xl",shift:14},{size:"sm",shift:-16},{size:"md",shift:20},{size:"lg",shift:2},{size:"sm",shift:28},{size:"md",shift:-10}],ie={xl:1,lg:.78,md:.58,sm:.38},oe="(max-width: 460px) 100vw, (max-width: 700px) 446px, (max-width: 1200px) 44vw, 36vw",L={work:{zh:"髮型作品",en:"Hair work"},view:{zh:"放大檢視",en:"View"}};function le(a,t,e,s){const n=t.workRail;n&&(n.setAttribute("data-count",String(_.length)),k(n,_.map((r,o)=>{const l=Y[o]||Y[Y.length-1],c=h(r,e),u=h(r.meta,e),d=B(a,{id:r.id,w:1200,h:1600,alt:e==="en"?`${L.work.en}: ${c} (${u})`:`${L.work.zh}：${c}（${u}）`,className:"work__img",sizes:oe,part:"work"});d.setAttribute("data-work-img","");const p=i("span",{class:"work__plate","data-work-plate":!0},[d,i("span",{class:"work__sheen","aria-hidden":"true"})]),f=i("button",{type:"button",class:"work__trigger","data-work-open":o,"data-magnetic":!0,"aria-label":e==="en"?`${L.view.en}: ${c}`:`${L.view.zh}：${c}`},p),v=i("figure",{class:"work__item","data-work-index":o,"data-work-id":r.id,"data-gl-target":!0,"data-size":l.size,"data-reveal":"group",style:{"--i":o,"--n":_.length,"--shift":l.shift,"--depth":ie[l.size]}},[i("span",{class:"work__box","data-media":!0,"data-gl-media":!0,"data-reveal-part":"media"},f),i("figcaption",{class:"work__cap"},[i("span",{class:"work__no","data-reveal-part":"mask","aria-hidden":"true"},[i("span",{class:"mask__i","data-mask-inner":!0},y(o))]),i("span",{class:"work__title","data-reveal-part":"mask",lang:g(e)},[i("span",{class:"mask__i","data-mask-inner":!0},c)]),i("span",{class:"work__meta","data-reveal-part":"mask",lang:g(e)},[i("span",{class:"mask__i","data-mask-inner":!0},u)])])]);return s?.addCard(v,{frame:p,image:d},{lift:.7,drift:.9}),v})),s?.addRail(n))}const ce=5200;function de(a,t){const e=t.workRail;if(!e)return null;const s=new re(a);let n=0,r=null;const o=()=>{clearTimeout(n),n=0},l=d=>{const p=d.target.closest?.("[data-work-open]");if(!p||!e.contains(p))return;const f=Number(p.getAttribute("data-work-open"));if(!(!Number.isInteger(f)||!_[f])){if(o(),r=p,!a.modules.has("gallery")){s.open(f,p);return}a.bus.emit("work:open",{index:f,id:_[f].id,el:p.closest("[data-work-index]")}),n=setTimeout(()=>{n=0,!document.documentElement.hasAttribute("data-work-open")&&a.bus.emit("work:open:reject",{index:f,reason:"no-answer"})},ce)}},c=d=>{o();const p=d?.index??-1;Number.isInteger(p)&&_[p]&&s.open(p,r)};e.addEventListener("click",l);const u=[a.bus.on("work:open:reject",c),a.bus.on("work:close",o)];return()=>{o(),e.removeEventListener("click",l);for(const d of u)d();s.dispose()}}const he={lead:"(max-width: 700px) 100vw, (max-width: 1100px) 92vw, 38vw",full:"(max-width: 700px) 100vw, (max-width: 1100px) 61vw, 30vw",std:"(max-width: 700px) 100vw, (max-width: 1100px) 45vw, 22vw"},ue=48,fe=[-1,0,1,1,-1,0,0,1,-1,-1,0,1],pe=fe.map(a=>a*ue),S={work:{zh:"作品",en:"Work"}},me={zh:"｜",en:" — "},j={facebook:"Facebook",instagram:"Instagram",line:"LINE",messenger:"Messenger"},it={zh:`${m.name} 官方帳號`,en:`${m.name} channels`},ge=(a,t)=>t==="en"?`${m.name} — ${j[a]}`:`${j[a]}（${it.zh}）`,ve=a=>a===0?"lead":a===3||a===8?"full":"std",we=a=>!!a.spec&&!a.spec.ph;function be(a,t,e,s){const n=t.teamRail;n&&(rt(),n.setAttribute("data-count",String(z.length)),k(n,z.map((r,o)=>{const l=ve(o),c=/^\d+$/.test(r.no),u=Dt(r.img,e),d=B(a,{id:r.img,w:1200,h:1600,alt:u?"":`${r.name}${h(me,e)}${h(r.role,e)}`,className:"team__art",sizes:he[l]??he.std,part:"team"});d.setAttribute("data-team-art","");const p=i("span",{class:"team__frame","data-team-plate":!0},d),f=i("article",{class:"team__card","data-team-card":!0,"data-index":o,"data-no":r.no,"data-no-kind":c?"numeral":"mark","data-rank":l,"data-align":o%2===0?"lead":"trail","data-reveal":"group",style:{"--i":o,"--n":z.length,"--drift":pe[o]??0}},[i("span",{class:"team__rule","data-reveal-part":"rule","aria-hidden":"true"}),i("span",{class:"team__no","data-reveal-part":"mask","aria-hidden":"true"},[i("span",{class:"mask__i","data-mask-inner":!0},r.no)]),i("figure",{class:"team__plate","data-media":!0,"data-reveal-part":"media"},[p,u?i("figcaption",{class:"team__credit",lang:g(e)},`${h(S.work,e)}${h(me,e)}${u}`):null]),i("div",{class:"team__meta"},[i("h3",{class:"team__name","data-reveal-part":"mask",lang:It(r.name)},[i("span",{class:"mask__i","data-mask-inner":!0},r.name)]),i("p",{class:"team__role","data-reveal-part":"mask",lang:g(e)},[i("span",{class:"mask__i","data-mask-inner":!0},h(r.role,e))]),we(r)?i("ul",{class:"team__spec","data-reveal-part":"stagger",lang:g(e)},nt(h(r.spec,e)).map((v,F)=>i("li",{class:"team__term",style:{"--i":F}},v))):null,r.note?i("p",{class:"team__note","data-split":"lines",lang:g(e)},h(r.note,e)):null,ye(r,e)])]);return s?.addCard(f,{frame:p,image:d,numeral:f.querySelector(".team__no .mask__i")},{lift:.55,drift:.75}),f})),s?.addRail(n))}function ye(a,t){const e=(a.links||[]).filter(s=>m.social[s]);return e.length?i("ul",{class:"team__links","data-reveal-part":"stagger","aria-label":h(it,t)},e.map((s,n)=>i("li",{class:"team__link-item",style:{"--i":n}},[i("a",{class:"team__link",href:m.social[s],target:"_blank",rel:"noopener noreferrer","data-social":s,"data-magnetic":!0,"aria-label":ge(s,t)},[i("span",{class:"team__link-label",lang:"en"},j[s]),i("span",{class:"team__link-rule","aria-hidden":"true"})])]))):null}const ke={address:{zh:"地址",en:"Address"},phone:{zh:"預約專線",en:"Reservations"},hours:{zh:"營業時間",en:"Open"}},lt=()=>`https://www.google.com/maps/search/?api=1&query=${m.geo.lat},${m.geo.lng}`;function xe(a,t,e){const s=t.visitInfo;if(!s)return;const n=[{key:"address",value:i("a",{class:"info__link",href:lt(),target:"_blank",rel:"noopener noreferrer","data-magnetic":!0,lang:g(e)},h(m.address,e))},{key:"phone",value:i("a",{class:"info__link info__link--tel",href:m.phoneHref,"data-magnetic":!0},m.phone)},{key:"hours",value:i("span",{class:"info__text",lang:g(e)},h(m.hours,e))}];k(s,n.map((r,o)=>i("div",{class:"info__row","data-info":r.key,"data-reveal":"group",style:{"--i":o,"--n":n.length}},[i("dt",{class:"info__k",lang:g(e)},[i("span",{class:"info__rule","data-reveal-part":"rule","aria-hidden":"true"}),i("span",{class:"info__label","data-reveal-part":"mask"},[i("span",{class:"mask__i","data-mask-inner":!0},h(ke[r.key],e))])]),i("dd",{class:"info__v","data-reveal-part":"mask"},[i("span",{class:"mask__i","data-mask-inner":!0},r.value)])])))}const Ee={index:$.index,contact:{zh:"聯絡",en:"Contact"},social:{zh:"社群",en:"Social"},group:{zh:"集團",en:"Group"}},Ae=`
.ftr__lnk {
  font-size: var(--t-meta);
  letter-spacing: var(--tr-meta-text);
  color: var(--bone-2);
}
.ftr__lnk--tel {
  font-family: var(--f-display);
  font-variation-settings: var(--fv-title);
  font-size: var(--t-lede);
  line-height: var(--lh-snug);
  letter-spacing: var(--tr-lede);
  color: var(--bone);
  font-feature-settings: 'pnum' 1, 'lnum' 1;
  font-variant-numeric: proportional-nums lining-nums;
}
.ftr__legal :lang(zh-Hant) { font-family: var(--f-han); }
`;function Se(){if(document.head.querySelector("style[data-at13-footer-type]"))return;const a=document.createElement("style");a.setAttribute("data-at13-footer-type",""),a.textContent=Ae,document.head.appendChild(a)}const Fe=["instagram","facebook","line","messenger"],Ce={instagram:"Instagram",facebook:"Facebook",line:"LINE",messenger:"Messenger"};function Ne(a,t,e){const s=t.footerCols;s&&(Se(),k(s,[T(0,"index",e,i("nav",{class:"ftr__nav","aria-label":e==="en"?"Footer navigation":"頁尾導覽"},i("ul",{class:"ftr__list","data-reveal-part":"stagger"},ut.map((n,r)=>i("li",{class:"ftr__row",style:{"--i":r}},[i("a",{class:"ftr__lnk",href:`#${n.id}`,"data-magnetic":!0,"data-nav-to":n.id},[i("span",{class:"ftr__idx","aria-hidden":"true"},n.idx),i("span",{class:"ftr__lbl",lang:g(e)},h(n,e))])]))))),T(1,"contact",e,i("ul",{class:"ftr__list","data-reveal-part":"stagger"},[i("li",{class:"ftr__row",style:{"--i":0}},i("a",{class:"ftr__lnk ftr__lnk--tel",href:m.phoneHref,"data-magnetic":!0},m.phone)),i("li",{class:"ftr__row",style:{"--i":1}},i("a",{class:"ftr__lnk ftr__text",href:lt(),target:"_blank",rel:"noopener noreferrer","data-magnetic":!0,lang:g(e)},h(m.address,e))),i("li",{class:"ftr__row",style:{"--i":2}},i("span",{class:"ftr__text",lang:g(e)},h(m.hours,e)))])),T(2,"social",e,i("ul",{class:"ftr__list","data-reveal-part":"stagger"},Fe.filter(n=>m.social[n]).map((n,r)=>i("li",{class:"ftr__row",style:{"--i":r}},[i("a",{class:"ftr__lnk",href:m.social[n],target:"_blank",rel:"noopener noreferrer","data-social":n,"data-magnetic":!0,lang:"en"},Ce[n])])))),T(3,"group",e,i("ul",{class:"ftr__list","data-reveal-part":"stagger"},[i("li",{class:"ftr__row",style:{"--i":0}},i("span",{class:"ftr__text ftr__text--name",lang:"en"},m.name)),i("li",{class:"ftr__row",style:{"--i":1}},i("span",{class:"ftr__text",lang:g(e)},h(m.branch,e))),i("li",{class:"ftr__row",style:{"--i":2}},i("span",{class:"ftr__text",lang:g(e)},h(m.group,e)))]))]),Pe(e))}function Pe(a){const t=document.querySelector(".ftr__legal");if(!t)return;const e=new Date().getFullYear();t.replaceChildren(`© ${e} ${m.name} · `,i("span",{lang:g(a)},h(m.group,a)))}function T(a,t,e,s){return i("div",{class:"ftr__col","data-ftr-col":t,"data-reveal":"group",style:{"--i":a}},[i("p",{class:"ftr__ttl","data-reveal-part":"mask",lang:g(e)},[i("span",{class:"mask__i","data-mask-inner":!0},h(Ee[t],e))]),i("span",{class:"ftr__rule","data-reveal-part":"rule","aria-hidden":"true"}),s])}const G={manifestoBody:"[data-manifesto-body]",manifestoStats:"[data-manifesto-stats]",craftList:"[data-craft-list]",workRail:"[data-work-rail]",teamRail:"[data-team-rail]",visitInfo:"[data-visit-info]",footerCols:"[data-ftr-cols]"},Le=2200;class Oe{static id="sections";constructor(t){this.ctx=t,this.mounts={},this.reveal=null,this.spy=null,this.physics=null,this.unbind=[],this.resizeTimer=0,this.langFrame=0,this.lastWidth=window.innerWidth,this.lastSweepY=window.scrollY,this.renderedLang=null,this.langPending=!1}async init(){const t=this.ctx;for(const s in G)this.mounts[s]=document.querySelector(G[s]);Object.values(this.mounts).some(Boolean)||console.warn("[sections] no content mounts found — markup contract changed"),this.physics=new Ut(t),this.reveal=new zt(t),this.spy=new Mt(t),this.renderAll(t.lang),this.reveal.scan(document),this.spy.observe(document);const e=de(t,this.mounts);e&&this.unbind.push(e),t.started?this.reveal.enable():this.unbind.push(t.bus.on("start",()=>this.reveal.enable())),this.unbind.push(t.bus.on("i18n:before-apply",this.onBeforeApply)),this.unbind.push(t.bus.on("lang",this.onLang)),Promise.race([document.fonts?.ready??Promise.resolve(),new Promise(s=>setTimeout(s,Le))]).then(()=>this.reveal?.refresh())}renderAll(t){this.physics?.dispose(),Vt(this.ctx,this.mounts,t),Xt(this.ctx,this.mounts,t,this.physics),le(this.ctx,this.mounts,t,this.physics),be(this.ctx,this.mounts,t,this.physics),xe(this.ctx,this.mounts,t),Ne(this.ctx,this.mounts,t),this.renderedLang=t,document.documentElement.setAttribute("data-sections","ready")}onBeforeApply=({lang:t}={})=>{const e=t||this.ctx.lang;cancelAnimationFrame(this.langFrame),this.langPending=!1,this.reveal?.releaseForLang(),this.renderAll(e),this.reveal?.prune(),this.reveal?.scanSettled(document),this.langFrame=requestAnimationFrame(()=>this.reveal?.refresh())};onLang=()=>{this.langPending||this.renderedLang!==this.ctx.lang&&(this.langPending=!0,this.reveal?.releaseForLang(),this.langFrame=requestAnimationFrame(()=>{this.langPending=!1,this.renderAll(this.ctx.lang),this.reveal?.prune(),this.reveal?.refresh(),this.reveal?.scan(document)}))};onResize(t){t!==this.lastWidth&&(this.lastWidth=t,clearTimeout(this.resizeTimer),this.resizeTimer=setTimeout(()=>this.reveal?.refresh(),140))}update(t){this.physics?.update(t),this.ctx.lang!==this.renderedLang&&this.onLang();const e=window.scrollY,s=e-this.lastSweepY;Math.abs(s)>window.innerHeight*.8&&(this.lastSweepY=e,s>0&&this.reveal?.sweep())}dispose(){for(const t of this.unbind)t();this.unbind.length=0,clearTimeout(this.resizeTimer),cancelAnimationFrame(this.langFrame),this.physics?.dispose(),this.reveal?.dispose(),this.spy?.dispose()}registerReveals(t){this.reveal?.scan(t)}refreshReveals(){this.reveal?.refresh()}}export{Oe as default};
