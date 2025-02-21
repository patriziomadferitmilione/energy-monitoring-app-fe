import{c as V,b as d,h as B,e as C,af as R,u as E,g as p,k as L,b3 as w,r as x,U as A,ab as M,j as Q,w as S,b4 as U,m as $,n as T,al as D,o as I,a$ as P,b5 as j}from"./index-ivNLawW7.js";const F=V({name:"QItemSection",props:{avatar:Boolean,thumbnail:Boolean,side:Boolean,top:Boolean,noWrap:Boolean},setup(e,{slots:o}){const l=d(()=>`q-item__section column q-item__section--${e.avatar===!0||e.side===!0||e.thumbnail===!0?"side":"main"}`+(e.top===!0?" q-item__section--top justify-start":" justify-center")+(e.avatar===!0?" q-item__section--avatar":"")+(e.thumbnail===!0?" q-item__section--thumbnail":"")+(e.noWrap===!0?" q-item__section--nowrap":""));return()=>B("div",{class:l.value},C(o.default))}}),N=V({name:"QItem",props:{...E,...R,tag:{type:String,default:"div"},active:{type:Boolean,default:null},clickable:Boolean,dense:Boolean,insetLevel:Number,tabindex:[String,Number],focused:Boolean,manualFocus:Boolean},emits:["click","keyup"],setup(e,{slots:o,emit:l}){const{proxy:{$q:i}}=p(),r=L(e,i),{hasLink:f,linkAttrs:g,linkClass:u,linkTag:s,navigateOnClick:q}=w(),n=x(null),m=x(null),v=d(()=>e.clickable===!0||f.value===!0||e.tag==="label"),c=d(()=>e.disable!==!0&&v.value===!0),b=d(()=>"q-item q-item-type row no-wrap"+(e.dense===!0?" q-item--dense":"")+(r.value===!0?" q-item--dark":"")+(f.value===!0&&e.active===null?u.value:e.active===!0?` q-item--active${e.activeClass!==void 0?` ${e.activeClass}`:""}`:"")+(e.disable===!0?" disabled":"")+(c.value===!0?" q-item--clickable q-link cursor-pointer "+(e.manualFocus===!0?"q-manual-focusable":"q-focusable q-hoverable")+(e.focused===!0?" q-manual-focusable--focused":""):"")),k=d(()=>e.insetLevel===void 0?null:{["padding"+(i.lang.rtl===!0?"Right":"Left")]:16+e.insetLevel*56+"px"});function y(a){c.value===!0&&(m.value!==null&&(a.qKeyEvent!==!0&&document.activeElement===n.value?m.value.focus():document.activeElement===m.value&&n.value.focus()),q(a))}function h(a){if(c.value===!0&&A(a,[13,32])===!0){M(a),a.qKeyEvent=!0;const _=new MouseEvent("click",a);_.qKeyEvent=!0,n.value.dispatchEvent(_)}l("keyup",a)}function t(){const a=Q(o.default,[]);return c.value===!0&&a.unshift(B("div",{class:"q-focus-helper",tabindex:-1,ref:m})),a}return()=>{const a={ref:n,class:b.value,style:k.value,role:"listitem",onClick:y,onKeyup:h};return c.value===!0?(a.tabindex=e.tabindex||"0",Object.assign(a,g.value)):v.value===!0&&(a["aria-disabled"]="true"),B(s.value,a,t())}}}),K=["ul","ol"],O=V({name:"QList",props:{...E,bordered:Boolean,dense:Boolean,separator:Boolean,padding:Boolean,tag:{type:String,default:"div"}},setup(e,{slots:o}){const l=p(),i=L(e,l.proxy.$q),r=d(()=>K.includes(e.tag)?null:"list"),f=d(()=>"q-list"+(e.bordered===!0?" q-list--bordered":"")+(e.dense===!0?" q-list--dense":"")+(e.separator===!0?" q-list--separator":"")+(i.value===!0?" q-list--dark":"")+(e.padding===!0?" q-list--padding":""));return()=>B(e.tag,{class:f.value,role:r.value},C(o.default))}}),W={modelValue:{type:Boolean,default:null},"onUpdate:modelValue":[Function,Array]},z=["beforeShow","show","beforeHide","hide"];function G({showing:e,canShow:o,hideOnRouteChange:l,handleShow:i,handleHide:r,processOnMount:f}){const g=p(),{props:u,emit:s,proxy:q}=g;let n;function m(t){e.value===!0?b(t):v(t)}function v(t){if(u.disable===!0||t!==void 0&&t.qAnchorHandled===!0||o!==void 0&&o(t)!==!0)return;const a=u["onUpdate:modelValue"]!==void 0;a===!0&&(s("update:modelValue",!0),n=t,T(()=>{n===t&&(n=void 0)})),(u.modelValue===null||a===!1)&&c(t)}function c(t){e.value!==!0&&(e.value=!0,s("beforeShow",t),i!==void 0?i(t):s("show",t))}function b(t){if(u.disable===!0)return;const a=u["onUpdate:modelValue"]!==void 0;a===!0&&(s("update:modelValue",!1),n=t,T(()=>{n===t&&(n=void 0)})),(u.modelValue===null||a===!1)&&k(t)}function k(t){e.value!==!1&&(e.value=!1,s("beforeHide",t),r!==void 0?r(t):s("hide",t))}function y(t){u.disable===!0&&t===!0?u["onUpdate:modelValue"]!==void 0&&s("update:modelValue",!1):t===!0!==e.value&&(t===!0?c:k)(n)}S(()=>u.modelValue,y),l!==void 0&&U(g)===!0&&S(()=>q.$route.fullPath,()=>{l.value===!0&&e.value===!0&&b()}),f===!0&&$(()=>{y(u.modelValue)});const h={show:v,hide:b,toggle:m};return Object.assign(q,h),h}function J(){let e=null;const o=p();function l(){e!==null&&(clearTimeout(e),e=null)}return D(l),I(l),{removeTimeout:l,registerTimeout(i,r){l(),P(o)===!1&&(e=setTimeout(()=>{e=null,i()},r))}}}function X(){if(window.getSelection!==void 0){const e=window.getSelection();e.empty!==void 0?e.empty():e.removeAllRanges!==void 0&&(e.removeAllRanges(),j.is.mobile!==!0&&e.addRange(document.createRange()))}else document.selection!==void 0&&document.selection.empty()}export{O as Q,W as a,J as b,G as c,N as d,F as e,X as f,z as u};
