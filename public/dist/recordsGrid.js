import{r as t,j as e,a as _e,R as $e,c as lt}from"./chunks/client-CkWOIrXP.js";import{u as dt}from"./chunks/index-CjVSFo3p.js";import{C as Ke}from"./chunks/CardRenderer-1-YZ47CB.js";import{u as ct,a as Te,D as ut,c as pt,b as ft,d as xt,s as ht,K as mt,T as gt,M as bt,e as vt,S as kt,v as yt,f as wt,C as jt}from"./chunks/sortable.esm-DQ9-A8Dw.js";const Be=[{id:"table",label:"Tableau",icon:e.jsxs("svg",{viewBox:"0 0 24 24",fill:"none",className:"h-4 w-4",children:[e.jsx("path",{d:"M3 7H21",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"}),e.jsx("path",{d:"M3 12H21",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"}),e.jsx("path",{d:"M3 17H21",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"})]})},{id:"kanban",label:"Kanban",icon:e.jsxs("svg",{viewBox:"0 0 24 24",fill:"none",className:"h-4 w-4",children:[e.jsx("rect",{x:"3",y:"3",width:"5",height:"18",rx:"1",stroke:"currentColor",strokeWidth:"1.5"}),e.jsx("rect",{x:"10",y:"3",width:"5",height:"12",rx:"1",stroke:"currentColor",strokeWidth:"1.5"}),e.jsx("rect",{x:"17",y:"3",width:"4",height:"15",rx:"1",stroke:"currentColor",strokeWidth:"1.5"})]})},{id:"notes",label:"Notes",icon:e.jsxs("svg",{viewBox:"0 0 24 24",fill:"none",className:"h-4 w-4",children:[e.jsx("path",{d:"M2 12C2 7.28595 2 4.92893 3.46447 3.46447C4.92893 2 7.28595 2 12 2C16.714 2 19.0711 2 20.5355 3.46447C22 4.92893 22 7.28595 22 12C22 16.714 22 19.0711 20.5355 20.5355C19.0711 22 16.714 22 12 22C7.28595 22 4.92893 22 3.46447 20.5355C2 19.0711 2 16.714 2 12Z",stroke:"currentColor",strokeWidth:"1.5"}),e.jsx("path",{opacity:"0.5",d:"M2 12H22",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"}),e.jsx("path",{opacity:"0.5",d:"M12 2V22",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"})]})},{id:"calendar",label:"Calendrier",icon:e.jsxs("svg",{viewBox:"0 0 24 24",fill:"none",className:"h-4 w-4",children:[e.jsx("rect",{x:"3",y:"4",width:"18",height:"18",rx:"2",stroke:"currentColor",strokeWidth:"1.5"}),e.jsx("path",{d:"M16 2V6M8 2V6M3 10H21",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"}),e.jsx("circle",{cx:"12",cy:"16",r:"1",fill:"currentColor"}),e.jsx("circle",{cx:"16",cy:"16",r:"1",fill:"currentColor"}),e.jsx("circle",{cx:"8",cy:"16",r:"1",fill:"currentColor"})]})}];function Ct({searchQuery:r,onSearch:n,columns:a,preferences:s,onPreferencesChange:l,loading:b,accountNumber:d,entitySlug:j,viewId:f,showSidebar:x,onToggleSidebar:k,activeView:h,onViewChange:T,enabledViews:C=["table","kanban","notes"],onEnabledViewsChange:$,hasActiveFilters:A=!1,onOpenSaveView:Q}){var K,ne,p;const[M,m]=t.useState(!1),[Y,J]=t.useState(!1),[P,X]=t.useState(!1),[u,g]=t.useState(!1),[te,V]=t.useState(""),H=t.useRef(null),B=t.useRef(null),L=t.useRef(null),W=t.useRef(null),_=t.useRef(null),oe=t.useRef(null),ae=t.useRef(null),ue=t.useRef(null),fe=()=>{m(!1),J(!1),X(!1),g(!1)};t.useEffect(()=>{const o=N=>{N.key==="Escape"&&fe()};return document.addEventListener("keydown",o),()=>document.removeEventListener("keydown",o)},[]);const v=(o,N,U,S)=>{t.useEffect(()=>{const se=z=>{o&&N.current&&!N.current.contains(z.target)&&U.current&&!U.current.contains(z.target)&&S(!1)};return o&&setTimeout(()=>document.addEventListener("mousedown",se),0),()=>document.removeEventListener("mousedown",se)},[o])};v(M,_,H,m),v(Y,oe,B,J),v(P,ae,L,X),v(u,ue,W,g);const F=o=>{if(o==="table")return;const N=C.includes(o)?C.filter(U=>U!==o):[...C,o];$(N),h===o&&!N.includes(o)&&T("table")},Z=Be.filter(o=>C.includes(o.id)),R=o=>{const N=s.columns.some(S=>S.id===o);let U;N?U=s.columns.map(S=>S.id===o?{...S,visible:!S.visible}:S):U=[...s.columns,{id:o,visible:!1}],l("columns",U)},q=o=>{if(!(o!=null&&o.current))return{top:0,right:0};const N=o.current.getBoundingClientRect();return{top:N.bottom+8,right:window.innerWidth-N.right}},D=te.trim()?a.filter(o=>o.name.toLowerCase().includes(te.toLowerCase())):a;return e.jsxs("div",{className:"dataTable-top flex items-center mb-0 justify-between gap-2",children:[e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsxs("a",{href:`/account/${d}/record/${j}/add`,className:"btn-add-expandable block rounded-full p-2 bg-white-light/40 hover:bg-white-light/90 hover:text-primary dark:bg-dark/40 dark:hover:bg-dark/60",title:"Ajouter",children:[e.jsx("svg",{className:"btn-add-icon",viewBox:"0 0 24 24",fill:"none",children:e.jsx("path",{d:"M12 5V19M5 12H19",stroke:"currentColor",strokeWidth:"2.5",strokeLinecap:"round"})}),e.jsx("span",{className:"btn-add-label",children:"Ajouter"})]}),e.jsxs("div",{className:"dataTable-search relative w-64",style:{marginLeft:0},children:[e.jsxs("svg",{className:"absolute left-4 top-1/2 ml-2 -translate-y-1/2 h-4 w-4 text-gray-400",viewBox:"0 0 24 24",fill:"none",children:[e.jsx("circle",{cx:"11",cy:"11",r:"8",stroke:"currentColor",strokeWidth:"1.5"}),e.jsx("path",{d:"M16.5 16.5L21 21",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"})]}),e.jsx("input",{type:"text",value:r,onChange:o=>n(o.target.value),placeholder:"Rechercher...",className:"dataTable-input form-input w-full pl-11 pr-10",style:{"padding-left":"33px"}}),b&&e.jsx("div",{className:"absolute right-3 top-1/2 -translate-y-1/2",children:e.jsx("div",{className:"animate-spin rounded-full h-4 w-4 border-b-2 border-primary"})})]})]}),e.jsxs("div",{className:"flex items-center gap-2",children:[Z.map(o=>e.jsx("button",{type:"button",onClick:()=>T(o.id),title:o.label,className:`block rounded-full p-2 transition-all ${h===o.id?"bg-primary/20 text-primary":"bg-white-light/40 hover:bg-white-light/90 hover:text-primary dark:bg-dark/40 dark:hover:bg-dark/60"}`,children:o.icon},o.id)),e.jsx("button",{ref:W,type:"button",onClick:()=>{g(!u),m(!1),J(!1),X(!1)},className:`block rounded-full p-2 transition-all ${u?"bg-primary/20 text-primary":"bg-white-light/40 hover:bg-white-light/90 hover:text-primary dark:bg-dark/40 dark:hover:bg-dark/60"}`,title:"Configurer les vues",children:e.jsxs("svg",{className:"h-4 w-4",viewBox:"0 0 24 24",fill:"none",children:[e.jsx("circle",{cx:"12",cy:"12",r:"3",stroke:"currentColor",strokeWidth:"1.5"}),e.jsx("path",{d:"M12 2V4M12 20V22M2 12H4M20 12H22M4.93 4.93L6.34 6.34M17.66 17.66L19.07 19.07M4.93 19.07L6.34 17.66M17.66 6.34L19.07 4.93",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"})]})}),e.jsx("div",{className:"w-px h-5 bg-gray-200 dark:bg-gray-700 mx-0.5"}),e.jsx("button",{type:"button",onClick:Q,className:`block rounded-full p-2 transition-all ${A?"bg-primary/20 text-primary":"bg-white-light/40 hover:bg-white-light/90 hover:text-primary dark:bg-dark/40 dark:hover:bg-dark/60"}`,title:"Filtrer & enregistrer la vue",children:e.jsx("svg",{className:"h-4 w-4",viewBox:"0 0 24 24",fill:"none",children:e.jsx("path",{d:"M22 3H2L10 12.46V19L14 21V12.46L22 3Z",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round"})})}),h==="table"&&(()=>{var N,U;const o=((N=s.sort)==null?void 0:N.field)!=="createdAt"||((U=s.sort)==null?void 0:U.direction)!=="desc";return e.jsx("button",{ref:B,type:"button",onClick:()=>{J(!Y),m(!1),X(!1),g(!1)},className:`block rounded-full p-2 transition-all ${Y||o?"bg-primary/20 text-primary":"bg-white-light/40 hover:bg-white-light/90 hover:text-primary dark:bg-dark/40 dark:hover:bg-dark/60"}`,title:"Trier",children:e.jsxs("svg",{className:"h-4 w-4",viewBox:"0 0 24 24",fill:"none",children:[e.jsx("path",{d:"M16 18L16 6M16 6L20 10M16 6L12 10",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round"}),e.jsx("path",{d:"M8 6L8 18M8 18L12 14M8 18L4 14",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round"})]})})})(),e.jsx("button",{ref:H,type:"button",onClick:()=>{m(!M),J(!1),X(!1),g(!1)},className:`block rounded-full p-2 transition-all ${M?"bg-primary/20 text-primary":"bg-white-light/40 hover:bg-white-light/90 hover:text-primary dark:bg-dark/40 dark:hover:bg-dark/60"}`,title:"Mode d'affichage",children:e.jsxs("svg",{className:"h-4 w-4",viewBox:"0 0 24 24",fill:"none",children:[e.jsx("path",{d:"M3 7H21",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"}),e.jsx("path",{d:"M6 12H18",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"}),e.jsx("path",{d:"M10 17H14",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"})]})}),h==="table"&&e.jsx("button",{ref:L,type:"button",onClick:()=>{X(!P),m(!1),J(!1),g(!1)},className:`block rounded-full p-2 transition-all ${P?"bg-primary/20 text-primary":"bg-white-light/40 hover:bg-white-light/90 hover:text-primary dark:bg-dark/40 dark:hover:bg-dark/60"}`,title:"Colonnes visibles",children:e.jsxs("svg",{className:"h-4 w-4",viewBox:"0 0 24 24",fill:"none",children:[e.jsx("path",{d:"M9 3H4C3.44772 3 3 3.44772 3 4V11C3 11.5523 3.44772 12 4 12H9C9.55228 12 10 11.5523 10 11V4C10 3.44772 9.55228 3 9 3Z",stroke:"currentColor",strokeWidth:"1.5"}),e.jsx("path",{d:"M20 3H15C14.4477 3 14 3.44772 14 4V7C14 7.55228 14.4477 8 15 8H20C20.5523 8 21 7.55228 21 7V4C21 3.44772 20.5523 3 20 3Z",stroke:"currentColor",strokeWidth:"1.5"}),e.jsx("path",{d:"M20 12H15C14.4477 12 14 12.4477 14 13V20C14 20.5523 14.4477 21 15 21H20C20.5523 21 21 20.5523 21 20V13C21 12.4477 20.5523 12 20 12Z",stroke:"currentColor",strokeWidth:"1.5"}),e.jsx("path",{d:"M9 16H4C3.44772 16 3 16.4477 3 17V20C3 20.5523 3.44772 21 4 21H9C9.55228 21 10 20.5523 10 20V17C10 16.4477 9.55228 16 9 16Z",stroke:"currentColor",strokeWidth:"1.5"})]})}),e.jsxs("button",{type:"button",onClick:k,className:"btn-sidebar-toggle block rounded-full p-2 bg-white-light/40 hover:bg-white-light/90 hover:text-primary dark:bg-dark/40 dark:hover:bg-dark/60",title:x?"Masquer le panneau":"Afficher le panneau",children:[e.jsxs("svg",{className:"btn-sidebar-icon",viewBox:"0 0 24 24",fill:"none",children:[e.jsx("rect",{x:"3",y:"3",width:"18",height:"18",rx:"2",stroke:"currentColor",strokeWidth:"1.5"}),e.jsx("path",{d:"M9 3V21",stroke:"currentColor",strokeWidth:"1.5"})]}),e.jsx("span",{className:"btn-sidebar-label",children:x?"Masquer":"Panneau"})]})]}),Y&&_e.createPortal(e.jsxs(e.Fragment,{children:[e.jsx("div",{className:"fixed inset-0",style:{zIndex:9998},onClick:()=>J(!1)}),e.jsxs("div",{ref:oe,className:"fixed rounded-xl shadow-xl p-4 w-72 bg-white dark:bg-[#0e1726] border border-gray-100 dark:border-white/10",style:{zIndex:9999,top:q(B).top,right:q(B).right,animation:"popoverSlide 0.15s ease-out"},children:[e.jsx("div",{className:"text-xs font-medium text-gray-500 dark:text-white-dark mb-2",children:"Trier par"}),e.jsxs("div",{className:"flex gap-2",children:[e.jsxs("select",{value:((K=s.sort)==null?void 0:K.field)||"createdAt",onChange:o=>l("sort",{...s.sort,field:o.target.value}),className:"flex-1 px-2 py-1.5 text-xs border border-gray-200 dark:border-white/10 rounded-lg bg-white dark:bg-[#1b2e4b] text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary/50",children:[e.jsx("option",{value:"createdAt",children:"Date de création"}),e.jsx("option",{value:"title",children:"Titre"}),a.filter(o=>o.id!=="title"&&o.id!=="actions").map(o=>e.jsx("option",{value:o.id,children:o.name},o.id))]}),e.jsx("button",{onClick:()=>{var o;return l("sort",{...s.sort,direction:((o=s.sort)==null?void 0:o.direction)==="asc"?"desc":"asc"})},className:"p-1.5 border border-gray-200 dark:border-white/10 rounded-lg bg-white dark:bg-[#1b2e4b] hover:bg-gray-50 dark:hover:bg-[#253b5c] transition-all",title:((ne=s.sort)==null?void 0:ne.direction)==="asc"?"Croissant":"Décroissant",children:e.jsx("svg",{className:`h-4 w-4 text-gray-600 dark:text-white transition-transform ${((p=s.sort)==null?void 0:p.direction)==="asc"?"rotate-180":""}`,viewBox:"0 0 24 24",fill:"none",children:e.jsx("path",{d:"M12 5V19M12 19L6 13M12 19L18 13",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round"})})}),e.jsx("button",{onClick:()=>l("sort",{field:"createdAt",direction:"desc"}),className:"p-1.5 border border-gray-200 dark:border-white/10 rounded-lg bg-white dark:bg-[#1b2e4b] hover:bg-red-50 hover:border-red-300 hover:text-red-500 dark:hover:bg-red-900/20 transition-all",title:"Réinitialiser le tri",children:e.jsxs("svg",{className:"h-4 w-4 text-gray-600 dark:text-white",viewBox:"0 0 24 24",fill:"none",children:[e.jsx("path",{d:"M4.06189 13C4.02104 12.6724 4 12.3387 4 12C4 7.58172 7.58172 4 12 4C14.5006 4 16.7332 5.14727 18.2002 6.94416M19.9381 11C19.979 11.3276 20 11.6613 20 12C20 16.4183 16.4183 20 12 20C9.49944 20 7.26681 18.8527 5.79984 17.0558",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round"}),e.jsx("path",{d:"M15 7H19V3",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round"}),e.jsx("path",{d:"M9 17H5V21",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round"})]})})]})]})]}),document.body),M&&_e.createPortal(e.jsxs(e.Fragment,{children:[e.jsx("div",{className:"fixed inset-0",style:{zIndex:9998},onClick:()=>m(!1)}),e.jsxs("div",{ref:_,className:"fixed rounded-xl shadow-xl p-4 w-72 bg-white dark:bg-[#0e1726] border border-gray-100 dark:border-white/10",style:{zIndex:9999,top:q(H).top,right:q(H).right,animation:"popoverSlide 0.15s ease-out"},children:[e.jsxs("div",{className:"mb-4",children:[e.jsx("div",{className:"text-xs font-medium text-gray-500 dark:text-white-dark mb-2",children:"Densité"}),e.jsx("div",{className:"flex gap-1",children:["compact","normal","comfortable"].map(o=>e.jsx("button",{onClick:()=>l("density",o),className:`flex-1 px-2 py-1.5 text-xs rounded-lg transition-all ${s.density===o?"bg-primary text-white":"bg-gray-100 dark:bg-dark/40 text-gray-600 dark:text-white-dark/70 hover:bg-gray-200 dark:hover:bg-dark/60"}`,children:o==="compact"?"Compact":o==="normal"?"Normal":"Confort"},o))})]}),e.jsxs("div",{className:"mb-4",children:[e.jsx("div",{className:"text-xs font-medium text-gray-500 dark:text-white-dark mb-2",children:"Lignes par page"}),e.jsx("div",{className:"flex gap-1",children:[10,25,50,100].map(o=>e.jsx("button",{onClick:()=>l("pageSize",o),className:`flex-1 px-2 py-1.5 text-xs rounded-lg transition-all ${s.pageSize===o?"bg-primary text-white":"bg-gray-100 dark:bg-dark/40 text-gray-600 dark:text-white-dark/70 hover:bg-gray-200 dark:hover:bg-dark/60"}`,children:o},o))})]})]})]}),document.body),P&&_e.createPortal(e.jsxs(e.Fragment,{children:[e.jsx("div",{className:"fixed inset-0",style:{zIndex:9998},onClick:()=>X(!1)}),e.jsxs("div",{ref:ae,className:"fixed rounded-xl shadow-xl p-4 w-64 bg-white dark:bg-[#0e1726] border border-gray-100 dark:border-white/10",style:{zIndex:9999,top:q(L).top,right:q(L).right,animation:"popoverSlide 0.15s ease-out"},children:[e.jsx("div",{className:"text-xs font-medium text-gray-500 dark:text-white-dark mb-2",children:"Colonnes visibles"}),e.jsx("div",{className:"relative mb-2",children:e.jsx("input",{type:"text",value:te,onChange:o=>V(o.target.value),placeholder:"Filtrer...",className:"w-full px-3 py-1.5 text-xs border border-gray-200 dark:border-white/10 rounded-lg bg-white dark:bg-[#1b2e4b] text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary/50"})}),e.jsx("div",{className:"space-y-0.5 max-h-48 overflow-y-auto",children:D.map(o=>{const N=s.columns.find(S=>S.id===o.id),U=N?N.visible!==!1:!0;return e.jsxs("label",{className:"flex items-center gap-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 px-2 py-1.5 rounded-lg",children:[e.jsx("input",{type:"checkbox",checked:U,onChange:()=>R(o.id),className:"form-checkbox text-primary w-3.5 h-3.5 rounded"}),e.jsx("span",{className:"text-xs text-gray-700 dark:text-gray-300",children:o.name})]},o.id)})}),e.jsx("div",{className:"border-t border-gray-100 dark:border-white/10 mt-3 mb-2"}),e.jsxs("div",{children:[e.jsx("div",{className:"text-xs font-medium text-gray-500 dark:text-white-dark mb-2",children:"Affichage titre"}),e.jsx("div",{className:"flex gap-1",children:[{value:"avatar",label:"Avatar"},{value:"icon",label:"Icône"},{value:"none",label:"Aucun"}].map(o=>e.jsx("button",{onClick:()=>l("titleDisplay",o.value),className:`flex-1 px-2 py-1.5 text-xs rounded-lg transition-all ${(s.titleDisplay||"avatar")===o.value?"bg-primary text-white":"bg-gray-100 dark:bg-dark/40 text-gray-600 dark:text-white-dark/70 hover:bg-gray-200 dark:hover:bg-dark/60"}`,children:o.label},o.value))})]}),e.jsx("div",{className:"border-t border-gray-100 dark:border-white/10 mt-3 mb-2"}),e.jsx("div",{children:e.jsxs("div",{className:"flex items-center justify-between",children:[e.jsx("span",{className:"text-xs font-medium text-gray-500 dark:text-white-dark",children:"Sélection multiple"}),e.jsx("button",{type:"button",onClick:()=>l("showCheckboxes",s.showCheckboxes===!1),style:{position:"relative",width:36,height:20,borderRadius:10,border:"none",cursor:"pointer",transition:"background 0.2s ease",background:s.showCheckboxes!==!1?"#4361ee":"#d1d5db",padding:0},children:e.jsx("span",{style:{position:"absolute",top:2,left:s.showCheckboxes!==!1?18:2,width:16,height:16,borderRadius:"50%",background:"#fff",boxShadow:"0 1px 3px rgba(0,0,0,0.2)",transition:"left 0.2s ease"}})})]})})]})]}),document.body),u&&_e.createPortal(e.jsxs(e.Fragment,{children:[e.jsx("div",{className:"fixed inset-0",style:{zIndex:9998},onClick:()=>g(!1)}),e.jsxs("div",{ref:ue,className:"fixed rounded-xl shadow-xl p-4 w-64 bg-white dark:bg-[#0e1726] border border-gray-100 dark:border-white/10",style:{zIndex:9999,top:q(W).top,right:q(W).right,animation:"popoverSlide 0.15s ease-out"},children:[e.jsx("div",{className:"text-xs font-medium text-gray-500 dark:text-white-dark mb-3",children:"Vues disponibles"}),e.jsx("div",{className:"space-y-1",children:Be.map(o=>{const N=C.includes(o.id),U=o.id==="table";return e.jsxs("label",{className:`flex items-center gap-3 cursor-pointer px-2 py-2 rounded-lg transition-all ${U?"opacity-60 cursor-not-allowed":"hover:bg-gray-50 dark:hover:bg-gray-800"}`,children:[e.jsx("input",{type:"checkbox",checked:N,onChange:()=>F(o.id),disabled:U,className:"form-checkbox text-primary w-4 h-4 rounded"}),e.jsxs("span",{className:`flex items-center gap-2 text-sm ${N?"text-gray-700 dark:text-gray-300":"text-gray-400 dark:text-gray-600"}`,children:[o.icon,o.label]})]},o.id)})}),e.jsx("div",{className:"border-t border-gray-100 dark:border-white/10 mt-3 pt-2",children:e.jsx("p",{className:"text-[10px] text-gray-400 dark:text-gray-600",children:"Le tableau est toujours activé par défaut."})})]})]}),document.body),e.jsx("style",{children:`
                @keyframes popoverSlide {
                    from { opacity: 0; transform: translateY(-4px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                /* Expandable pill buttons - only animation overrides, colors from Tailwind classes */
                .btn-add-expandable,
                .btn-sidebar-toggle {
                    display: inline-flex;
                    align-items: center;
                    gap: 0;
                    height: 34px;
                    padding: 0 9px;
                    cursor: pointer;
                    text-decoration: none;
                    overflow: hidden;
                    white-space: nowrap;
                    font-size: 13px;
                    font-weight: 600;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    border: none;
                }
                .btn-add-expandable:hover,
                .btn-sidebar-toggle:hover {
                    gap: 6px;
                    height: 34px;
                    padding: 0 16px;
                    background-color: #22bce9 !important;
                    color: #fff !important;
                    box-shadow: 0 4px 12px rgba(34, 188, 233, 0.4);
                    transform: translateY(-1px);
                }
                .btn-add-icon,
                .btn-sidebar-icon {
                    width: 16px;
                    height: 16px;
                    flex-shrink: 0;
                }
                .btn-add-label,
                .btn-sidebar-label {
                    max-width: 0;
                    opacity: 0;
                    overflow: hidden;
                    transition: max-width 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.2s ease;
                }
                .btn-add-expandable:hover .btn-add-label,
                .btn-sidebar-toggle:hover .btn-sidebar-label {
                    max-width: 80px;
                    opacity: 1;
                }
            `})]})}function Nt({records:r,columns:n,virtualizer:a,sort:s,onSort:l,onColumnReorder:b,density:d,titleDisplay:j,entityIcon:f,accountNumber:x,entitySlug:k,selectedIds:h,onToggleSelect:T,onSelectAll:C,allPageSelected:$,showCheckboxes:A=!0}){var u;const[Q,M]=t.useState(null),[m,Y]=t.useState(null),J=a.getVirtualItems(),P={compact:{rowHeight:36,cellClass:"py-1",fontSize:"text-xs",imageSize:"w-6 h-6",fontWeight:"font-medium"},normal:{rowHeight:44,cellClass:"py-2",fontSize:"text-sm",imageSize:"w-9 h-9",fontWeight:"font-semibold"},comfortable:{rowHeight:56,cellClass:"py-3",fontSize:"text-sm",imageSize:"w-9 h-9",fontWeight:"font-semibold"}},X=P[d]||P.comfortable;return h&&h.size>0,e.jsxs("table",{className:"table-hover whitespace-nowrap dataTable-table w-full",children:[e.jsx("thead",{className:"sticky top-0 bg-white dark:bg-[#1b2e4b] z-10",children:e.jsxs("tr",{children:[A&&e.jsx("th",{style:{width:40,padding:"0 8px"},children:e.jsxs("label",{className:"bulk-checkbox-wrapper",style:{display:"flex",alignItems:"center",justifyContent:"center"},children:[e.jsx("input",{type:"checkbox",checked:$&&r.length>0,onChange:()=>C&&C(),className:"bulk-checkbox"}),e.jsx("span",{className:"bulk-checkbox-custom"})]})}),n.map(g=>{const te=(s==null?void 0:s.field)===g.id||g.id==="title"&&(s==null?void 0:s.field)==="title"||g.id==="createdAt"&&(s==null?void 0:s.field)==="createdAt",V=(s==null?void 0:s.direction)||"desc",H=Q===g.id,B=m===g.id&&Q!==g.id,L=g.id!=="actions";return e.jsx("th",{"data-sortable":g.sortable!==!1?"":void 0,"data-column-id":g.id,onDragEnter:W=>{W.preventDefault(),g.id!=="actions"&&Q&&Q!==g.id&&Y(g.id)},onDragOver:W=>{W.preventDefault()},onDrop:W=>{W.preventDefault(),Q&&Q!==g.id&&g.id!=="actions"&&b&&b(Q,g.id),M(null),Y(null)},className:`px-2 ${H?"opacity-50":""} ${B?"border-l-2 border-l-primary bg-primary/5":""}`,style:{transition:"opacity 0.15s, border-color 0.15s, background 0.15s",...g.id==="actions"?{width:"1%",whiteSpace:"nowrap"}:{},...g.id==="title"?{minWidth:220}:{}},children:e.jsxs("div",{className:"flex items-center gap-1",children:[L&&e.jsx("span",{draggable:"true",onDragStart:W=>{M(g.id),W.dataTransfer.effectAllowed="move",W.dataTransfer.setData("text/plain",g.id)},onDragEnd:()=>{M(null),Y(null)},className:"cursor-grab text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300",children:e.jsxs("svg",{className:"h-3 w-3",viewBox:"0 0 24 24",fill:"currentColor",children:[e.jsx("circle",{cx:"9",cy:"6",r:"1.5"}),e.jsx("circle",{cx:"15",cy:"6",r:"1.5"}),e.jsx("circle",{cx:"9",cy:"12",r:"1.5"}),e.jsx("circle",{cx:"15",cy:"12",r:"1.5"}),e.jsx("circle",{cx:"9",cy:"18",r:"1.5"}),e.jsx("circle",{cx:"15",cy:"18",r:"1.5"})]})}),g.sortable!==!1?e.jsxs("a",{href:"#",className:"dataTable-sorter flex items-center gap-1",draggable:"false",onClick:W=>{W.preventDefault(),l(g.id)},children:[g.name,te&&e.jsx("svg",{className:`h-3 w-3 text-primary transition-transform ${V==="asc"?"rotate-180":""}`,viewBox:"0 0 24 24",fill:"none",children:e.jsx("path",{d:"M12 5V19M12 19L6 13M12 19L18 13",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round"})})]}):g.name]})},g.id)})]})}),e.jsxs("tbody",{children:[J.length>0&&J[0].start>0&&e.jsx("tr",{children:e.jsx("td",{colSpan:n.length+1,style:{height:J[0].start,padding:0}})}),J.map(g=>{const te=r[g.index];if(!te)return null;const V={compact:"4px 8px",normal:"8px 12px",comfortable:"12px 12px"}[d]||"12px 12px",H=h&&h.has(te._id);return e.jsxs("tr",{"data-index":g.index,ref:a.measureElement,style:{minHeight:X.rowHeight},className:H?"bulk-row-selected":"",children:[A&&e.jsx("td",{style:{padding:"0 8px",width:40},children:e.jsxs("label",{className:"bulk-checkbox-wrapper",style:{display:"flex",alignItems:"center",justifyContent:"center"},onClick:B=>{B.preventDefault(),T&&T(te._id,g.index,B.shiftKey)},children:[e.jsx("input",{type:"checkbox",checked:H,readOnly:!0,className:"bulk-checkbox"}),e.jsx("span",{className:"bulk-checkbox-custom"})]})}),n.map(B=>e.jsx("td",{className:`${X.fontSize}`,style:{padding:V,...B.id==="actions"?{width:"1%",whiteSpace:"nowrap"}:{},...B.id==="title"?{minWidth:220}:{}},children:St(te,B,x,k,X,j,f)},B.id))]},te._id)}),J.length>0&&e.jsx("tr",{children:e.jsx("td",{colSpan:n.length+1,style:{height:Math.max(0,a.getTotalSize()-(((u=J[J.length-1])==null?void 0:u.end)||0)),padding:0}})})]})]})}function St(r,n,a,s,l,b,d){var j,f;switch(n.id){case"title":{const x=r.referenceTitle||r.title||"Sans titre";x.charAt(0).toUpperCase();const k=Math.abs(x.charCodeAt(0)||65)%35+1,h=r.image||`/assets/images/profile-${k}.jpeg`;return e.jsxs("div",{className:"flex items-center gap-2",children:[b==="avatar"&&e.jsx("img",{src:h,alt:x,className:`${l.imageSize} rounded-full max-w-none`}),b==="icon"&&d&&e.jsx("div",{className:`${l.imageSize} rounded-lg max-w-none flex items-center justify-center bg-primary/10 text-primary shrink-0`,children:e.jsx("iconify-icon",{icon:d,width:"16"})}),e.jsx("a",{href:`/account/${a}/record/${s}/${r._id}/edit`,className:`${l.fontWeight} hover:text-primary transition-colors truncate`,title:x,children:x})]})}case"createdAt":return new Date(r.createdAt).toLocaleDateString("fr-FR");case"actions":return e.jsxs("div",{className:"flex items-center gap-0",children:[e.jsx("a",{href:`/account/${a}/record/${s}/${r._id}`,className:"p-1 rounded-lg text-gray-500 hover:text-primary hover:bg-primary/10 transition-all",title:"Voir",children:e.jsxs("svg",{className:"h-4 w-4",viewBox:"0 0 24 24",fill:"none",children:[e.jsx("path",{d:"M15 12C15 13.6569 13.6569 15 12 15C10.3431 15 9 13.6569 9 12C9 10.3431 10.3431 9 12 9C13.6569 9 15 10.3431 15 12Z",stroke:"currentColor",strokeWidth:"1.5"}),e.jsx("path",{d:"M12 5C7.5 5 3.73 7.94 2 12C3.73 16.06 7.5 19 12 19C16.5 19 20.27 16.06 22 12C20.27 7.94 16.5 5 12 5Z",stroke:"currentColor",strokeWidth:"1.5"})]})}),e.jsx("a",{href:`/account/${a}/record/${s}/${r._id}/edit`,className:"p-1 rounded-lg text-gray-500 hover:text-info hover:bg-info/10 transition-all",title:"Modifier",children:e.jsx("svg",{className:"h-4 w-4",viewBox:"0 0 24 24",fill:"none",children:e.jsx("path",{d:"M16.862 4.487L18.55 2.8C19.33 2.02 20.59 2.02 21.37 2.8C22.15 3.58 22.15 4.84 21.37 5.62L19.681 7.307M16.862 4.487L4.162 17.187C3.882 17.467 3.682 17.818 3.592 18.198L2.732 21.596C2.642 21.966 2.952 22.296 3.322 22.226L6.892 21.556C7.242 21.486 7.572 21.306 7.832 21.046L20.513 8.366M16.862 4.487L19.681 7.307",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round"})})}),e.jsx("button",{type:"button",className:"p-1 rounded-lg text-gray-500 hover:text-danger hover:bg-danger/10 transition-all",title:"Supprimer",onClick:()=>{confirm("Êtes-vous sûr de vouloir supprimer cet enregistrement ?")&&console.log("Delete record:",r._id)},children:e.jsxs("svg",{className:"h-4 w-4",viewBox:"0 0 24 24",fill:"none",children:[e.jsx("path",{d:"M20.5 6H3.5",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"}),e.jsx("path",{d:"M18.833 8.5L18.373 15.4C18.196 18.054 18.108 19.381 17.243 20.19C16.378 21 15.048 21 12.387 21H11.613C8.952 21 7.622 21 6.757 20.19C5.892 19.381 5.804 18.054 5.627 15.4L5.167 8.5",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"}),e.jsx("path",{d:"M9.5 11L10 16",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"}),e.jsx("path",{d:"M14.5 11L14 16",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"}),e.jsx("path",{d:"M6.5 6C6.556 5.367 6.612 5.1 6.877 4.714C7.178 4.275 7.945 3.917 9.484 3.2L9.924 2.984C10.683 2.589 11.06 2.392 11.476 2.318C11.823 2.254 12.177 2.254 12.524 2.318C12.94 2.392 13.317 2.589 14.076 2.984L14.516 3.2C16.055 3.917 16.822 4.275 17.123 4.714C17.388 5.1 17.444 5.367 17.5 6",stroke:"currentColor",strokeWidth:"1.5"})]})})]});default:{if(n.id.startsWith("rel:")){const x=n.id.substring(4),h=(((j=r._denorm)==null?void 0:j.relations)||[]).find(C=>C.relationKey===x);if(((f=h==null?void 0:h.records)==null?void 0:f.length)>0)return e.jsx("div",{className:"flex flex-wrap gap-1",children:h.records.map((C,$)=>e.jsx("a",{href:`/account/${a}/record/${C.entitySlug||s}/${C._id}`,className:"text-primary hover:underline text-xs",children:C.title||"Sans titre"},$))});const T=(r.relations||[]).find(C=>C.relationKey===x);return T!=null&&T.value?"—":""}if(n.id.startsWith("classif:")){const x=n.id.substring(8),k=(r.classificationValues||[]).find(h=>{var C,$,A;return(((C=h.classificationId)==null?void 0:C.$oid)||((A=($=h.classificationId)==null?void 0:$.toString)==null?void 0:A.call($))||h.classificationId)===x});if(k!=null&&k.label){const h=k.color||"#888";return e.jsx("span",{className:"inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap",style:{backgroundColor:`${h}15`,color:h,border:`1px solid ${h}30`},children:k.label})}return k!=null&&k.value?e.jsx("span",{className:"inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20",children:k.value}):""}if(r.customFields){const x=r.customFields.find(h=>{var C;const T=((C=h.field_id)==null?void 0:C._id)||h.field_id;return(T==null?void 0:T.toString())===n.id});if(!x)return"";const k=x.value;if(k&&typeof k=="object"&&k._v){const h=[];return Object.entries(k).forEach(([T,C])=>{T==="_v"||T==="customText"||(Array.isArray(C)?C.forEach($=>h.push($)):C&&h.push(C))}),k.customText&&h.push(k.customText),e.jsx("div",{className:"flex flex-wrap gap-1",children:h.map((T,C)=>e.jsx("span",{className:"inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20",children:T},C))})}return k||""}return""}}}function De(r,n=.1){if(!r)return`rgba(99, 102, 241, ${n})`;const a=parseInt(r.slice(1,3),16),s=parseInt(r.slice(3,5),16),l=parseInt(r.slice(5,7),16);return`rgba(${a}, ${s}, ${l}, ${n})`}function Lt({field:r,record:n}){const a=(n.customFields||[]).find(l=>{var d;const b=((d=l.field_id)==null?void 0:d._id)||l.field_id;return(b==null?void 0:b.toString())===r.id});if(!a)return e.jsx("span",{className:"text-gray-400 dark:text-gray-600 text-sm italic",children:"—"});const s=a.value;if(s==null||s==="")return e.jsx("span",{className:"text-gray-400 dark:text-gray-600 text-sm italic",children:"—"});if(r.type==="date"||r.type==="datetime")try{return e.jsx("span",{className:"text-sm text-gray-700 dark:text-gray-300",children:new Date(s).toLocaleDateString("fr-FR")})}catch{return e.jsx("span",{className:"text-sm text-gray-700 dark:text-gray-300",children:String(s)})}return r.type==="boolean"||r.type==="checkbox"?e.jsxs("span",{className:`inline-flex items-center gap-1 text-sm ${s?"text-success":"text-gray-400"}`,children:[s?e.jsxs("svg",{width:"16",height:"16",viewBox:"0 0 24 24",fill:"none",children:[e.jsx("path",{d:"M9 12l2 2 4-4",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round"}),e.jsx("circle",{cx:"12",cy:"12",r:"10",stroke:"currentColor",strokeWidth:"1.5"})]}):e.jsx("svg",{width:"16",height:"16",viewBox:"0 0 24 24",fill:"none",children:e.jsx("circle",{cx:"12",cy:"12",r:"10",stroke:"currentColor",strokeWidth:"1.5"})}),s?"Oui":"Non"]}):r.type==="relation"?Array.isArray(s)?e.jsx("div",{className:"flex flex-wrap gap-1",children:s.map((l,b)=>e.jsx("span",{className:"inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-primary/10 text-primary font-medium",children:l.title||l.label||l.name||String(l)},b))}):e.jsx("span",{className:"text-sm text-gray-700 dark:text-gray-300",children:s.title||s.label||String(s)}):r.type==="number"?e.jsx("span",{className:"text-sm font-mono text-gray-700 dark:text-gray-300",children:Number(s).toLocaleString("fr-FR")}):e.jsx("span",{className:"text-sm text-gray-700 dark:text-gray-300",children:String(s)})}function Mt({record:r,columns:n,accountNumber:a,entitySlug:s,onClose:l}){var M;const b=t.useRef(null),[d,j]=t.useState(!1);t.useEffect(()=>{requestAnimationFrame(()=>j(!0))},[]);const f=t.useCallback(()=>{j(!1),setTimeout(()=>l(),250)},[l]);if(t.useEffect(()=>{const m=Y=>{Y.key==="Escape"&&f()};return document.addEventListener("keydown",m),()=>document.removeEventListener("keydown",m)},[f]),!r)return null;const x=((M=r._id)==null?void 0:M.$oid)||r._id,k=r.referenceTitle||r.title||r.computedTitle||"Sans titre",h=r.description||"",T=r.createdAt?new Date(r.createdAt).toLocaleDateString("fr-FR",{day:"2-digit",month:"long",year:"numeric"}):null,C=r.updatedAt?new Date(r.updatedAt).toLocaleDateString("fr-FR",{day:"2-digit",month:"long",year:"numeric"}):null,$=(r.classificationValues||[]).filter(m=>m.optionLabel||m.label).map(m=>({label:m.optionLabel||m.label,color:m.optionColor||m.color||"#6366f1",classificationName:m.classificationName||"Classification"})),A={};$.forEach(m=>{A[m.classificationName]||(A[m.classificationName]=[]),A[m.classificationName].push(m)});const Q=n.filter(m=>m.id!=="title"&&m.id!=="actions"&&!m.id.startsWith("class:"));return _e.createPortal(e.jsxs(e.Fragment,{children:[e.jsx("div",{className:`fixed inset-0 bg-black/40 backdrop-blur-[2px] transition-opacity duration-250 ${d?"opacity-100":"opacity-0"}`,style:{zIndex:1e4},onMouseDown:f,onTouchEnd:m=>{m.preventDefault(),f()}}),e.jsxs("div",{ref:b,className:`fixed right-0 top-0 h-full bg-white dark:bg-[#0e1726] shadow-2xl border-l border-gray-200 dark:border-gray-700 flex flex-col transition-transform duration-250 ease-out ${d?"translate-x-0":"translate-x-full"}`,style:{zIndex:10001,width:"min(520px, 90vw)"},onClick:m=>m.stopPropagation(),children:[e.jsxs("div",{className:"flex items-center justify-between gap-3 px-6 py-4 border-b border-gray-100 dark:border-gray-700/50 flex-shrink-0",children:[e.jsxs("div",{className:"flex items-center gap-2 min-w-0",children:[e.jsx("div",{className:"w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0",children:e.jsxs("svg",{width:"16",height:"16",viewBox:"0 0 24 24",fill:"none",children:[e.jsx("path",{d:"M2 12C2 7.28595 2 4.92893 3.46447 3.46447C4.92893 2 7.28595 2 12 2C16.714 2 19.0711 2 20.5355 3.46447C22 4.92893 22 7.28595 22 12C22 16.714 22 19.0711 20.5355 20.5355C19.0711 22 16.714 22 12 22C7.28595 22 4.92893 22 3.46447 20.5355C2 19.0711 2 16.714 2 12Z",stroke:"#4361ee",strokeWidth:"1.5"}),e.jsx("path",{d:"M8 12H16M12 8V16",stroke:"#4361ee",strokeWidth:"1.5",strokeLinecap:"round"})]})}),e.jsx("h3",{className:"text-base font-semibold text-gray-900 dark:text-white truncate",children:k})]}),e.jsxs("div",{className:"flex items-center gap-1 flex-shrink-0",children:[e.jsx("a",{href:`/account/${a}/record/${s}/${x}`,className:"p-2 rounded-lg text-gray-400 hover:text-primary hover:bg-primary/10 transition-all",title:"Ouvrir la page complète",children:e.jsxs("svg",{width:"16",height:"16",viewBox:"0 0 24 24",fill:"none",children:[e.jsx("path",{d:"M10 4H6C4.89543 4 4 4.89543 4 6V18C4 19.1046 4.89543 20 6 20H18C19.1046 20 20 19.1046 20 18V14",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"}),e.jsx("path",{d:"M14 4H20V10",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round"}),e.jsx("path",{d:"M20 4L11 13",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"})]})}),e.jsx("a",{href:`/account/${a}/record/${s}/${x}/edit`,className:"p-2 rounded-lg text-gray-400 hover:text-info hover:bg-info/10 transition-all",title:"Modifier",children:e.jsx("svg",{width:"16",height:"16",viewBox:"0 0 24 24",fill:"none",children:e.jsx("path",{d:"M16.862 4.487L18.55 2.8C19.33 2.02 20.59 2.02 21.37 2.8C22.15 3.58 22.15 4.84 21.37 5.62L19.681 7.307M16.862 4.487L4.162 17.187C3.882 17.467 3.682 17.818 3.592 18.198L2.732 21.596C2.642 21.966 2.952 22.296 3.322 22.226L6.892 21.556C7.242 21.486 7.572 21.306 7.832 21.046L20.513 8.366",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"})})}),e.jsx("button",{onClick:f,className:"p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all",title:"Fermer",children:e.jsx("svg",{width:"16",height:"16",viewBox:"0 0 24 24",fill:"none",children:e.jsx("path",{d:"M18 6L6 18M6 6L18 18",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round"})})})]})]}),e.jsxs("div",{className:"flex-1 overflow-y-auto",children:[Object.keys(A).length>0&&e.jsx("div",{className:"px-6 py-4 border-b border-gray-100 dark:border-gray-700/50",children:Object.entries(A).map(([m,Y])=>e.jsxs("div",{className:"mb-3 last:mb-0",children:[e.jsx("div",{className:"text-[11px] uppercase tracking-wider font-semibold text-gray-400 dark:text-gray-500 mb-1.5",children:m}),e.jsx("div",{className:"flex flex-wrap gap-1.5",children:Y.map((J,P)=>e.jsxs("span",{className:"inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium transition-all hover:scale-105",style:{backgroundColor:De(J.color,.15),color:J.color,border:`1px solid ${De(J.color,.3)}`},children:[e.jsx("span",{className:"w-2 h-2 rounded-full flex-shrink-0",style:{backgroundColor:J.color}}),J.label]},P))})]},m))}),h&&e.jsxs("div",{className:"px-6 py-4 border-b border-gray-100 dark:border-gray-700/50",children:[e.jsx("div",{className:"text-[11px] uppercase tracking-wider font-semibold text-gray-400 dark:text-gray-500 mb-2",children:"Description"}),e.jsx("p",{className:"text-sm text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-wrap",children:h})]}),e.jsxs("div",{className:"px-6 py-4",children:[e.jsx("div",{className:"text-[11px] uppercase tracking-wider font-semibold text-gray-400 dark:text-gray-500 mb-3",children:"Détails"}),e.jsxs("div",{className:"space-y-0",children:[Q.map(m=>e.jsxs("div",{className:"flex items-start gap-3 py-2.5 border-b border-gray-50 dark:border-gray-800/50 last:border-0",children:[e.jsx("div",{className:"w-32 flex-shrink-0 text-xs font-medium text-gray-500 dark:text-gray-400 pt-0.5 truncate",children:m.name}),e.jsx("div",{className:"flex-1 min-w-0",children:e.jsx(Lt,{field:m,record:r})})]},m.id)),(r.relations||[]).map((m,Y)=>{var J;return e.jsxs("div",{className:"flex items-start gap-3 py-2.5 border-b border-gray-50 dark:border-gray-800/50 last:border-0",children:[e.jsx("div",{className:"w-32 flex-shrink-0 text-xs font-medium text-gray-500 dark:text-gray-400 pt-0.5 truncate",children:m.label||m.key||"Relation"}),e.jsx("div",{className:"flex-1 min-w-0",children:((J=m.records)==null?void 0:J.length)>0?e.jsx("div",{className:"flex flex-wrap gap-1",children:m.records.map((P,X)=>e.jsx("a",{href:`/account/${a}/record/${m.entitySlug||s}/${P._id}`,className:"inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-primary/10 text-primary font-medium hover:bg-primary/20 transition-colors",children:P.referenceTitle||P.title||"Sans titre"},X))}):e.jsx("span",{className:"text-gray-400 dark:text-gray-600 text-sm italic",children:"—"})})]},`rel-${Y}`)})]})]})]}),e.jsx("div",{className:"flex-shrink-0 px-6 py-3 border-t border-gray-100 dark:border-gray-700/50 bg-gray-50/50 dark:bg-[#0a0f1e]/50",children:e.jsxs("div",{className:"flex items-center justify-between text-[11px] text-gray-400 dark:text-gray-500",children:[e.jsxs("div",{className:"flex items-center gap-3",children:[T&&e.jsxs("span",{className:"flex items-center gap-1",children:[e.jsxs("svg",{width:"12",height:"12",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"1.5",children:[e.jsx("circle",{cx:"12",cy:"12",r:"10"}),e.jsx("path",{d:"M12 6V12L16 14",strokeLinecap:"round"})]}),"Créé le ",T]}),C&&e.jsxs("span",{className:"flex items-center gap-1",children:[e.jsx("svg",{width:"12",height:"12",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"1.5",children:e.jsx("path",{d:"M4.06 13C4.02 12.67 4 12.34 4 12C4 7.58 7.58 4 12 4C14.5 4 16.73 5.15 18.2 6.94M19.94 11C19.98 11.33 20 11.66 20 12C20 16.42 16.42 20 12 20C9.5 20 7.27 18.85 5.8 17.06",strokeLinecap:"round",strokeLinejoin:"round"})}),"Modifié le ",C]})]}),e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx("a",{href:`/account/${a}/record/${s}/${x}`,className:"px-3 py-1.5 bg-primary/10 text-primary text-xs font-medium rounded-lg hover:bg-primary/20 transition-colors",children:"Voir"}),e.jsx("a",{href:`/account/${a}/record/${s}/${x}/edit`,className:"px-3 py-1.5 bg-primary text-white text-xs font-medium rounded-lg hover:bg-primary/90 transition-colors",children:"Modifier"})]})]})})]})]}),document.body)}function ze(r,n=.1){const a=/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(r);return a?`rgba(${parseInt(a[1],16)}, ${parseInt(a[2],16)}, ${parseInt(a[3],16)}, ${n})`:`rgba(128,128,128,${n})`}function Xe({record:r,accountNumber:n,entitySlug:a,isDragging:s=!1,onQuickView:l,cardTemplate:b,entityData:d}){var J;const j=t.useRef(null),f=t.useRef(!1),x=String(((J=r._id)==null?void 0:J.$oid)||r._id),{attributes:k,listeners:h,setNodeRef:T,transform:C,transition:$,isDragging:A}=wt({id:x}),Q={transform:jt.Transform.toString(C),transition:$,opacity:s||A?.7:1,touchAction:"manipulation"},M=P=>{j.current={x:P.clientX,y:P.clientY,time:Date.now()},f.current=!1},m=P=>{if(j.current){const X=Math.abs(P.clientX-j.current.x),u=Math.abs(P.clientY-j.current.y);(X>5||u>5)&&(f.current=!0)}},Y=P=>{if(!j.current)return;const X=Date.now()-j.current.time;!f.current&&X<400&&l&&!P.target.closest("a, button")&&setTimeout(()=>l(r),50),j.current=null};return e.jsx("div",{ref:T,style:Q,className:`kanban-card cursor-pointer transition-all group ${s||A?"shadow-lg ring-2 ring-primary/30 cursor-move":""}`,"data-dnd":"card",onPointerDown:M,onPointerMove:m,onPointerUp:Y,...k,...h,children:e.jsx(Ke,{record:r,cardTemplate:b,context:"kanban",entityData:d,accountNumber:n,entitySlug:a,className:"bg-white hover:shadow-md border border-gray-200/80 dark:border-0 dark:bg-dark/40 dark:hover:bg-dark/60",style:{borderRadius:8}})})}function _t({column:r,records:n,recordIds:a,accountNumber:s,entitySlug:l,onQuickView:b,cardTemplate:d,entityData:j}){const{setNodeRef:f,isOver:x}=vt({id:String(r.id)}),k=typeof document<"u"&&document.documentElement.classList.contains("dark"),h=ze(r.color,k?.12:.06),T=ze(r.color,k?.3:.15);return e.jsxs("div",{ref:f,className:`flex-none rounded-lg overflow-hidden transition-all ${x?"ring-2 ring-primary/50 ring-offset-2":""}`,style:{width:"300px",maxWidth:"320px",backgroundColor:x?ze(r.color,.15):h,border:`1px solid ${T}`},"data-dnd":"column",children:[e.jsx("div",{style:{height:"4px",backgroundColor:r.color}}),e.jsx("div",{className:"px-3 py-2 flex justify-between items-center",children:e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx("span",{className:"inline-flex items-center gap-1.5 px-2 py-0 rounded text-xs font-semibold uppercase tracking-wide",style:{backgroundColor:r.color,color:"#fff"},children:r.title}),e.jsx("span",{className:"text-xs text-gray-500 font-medium",children:n.length})]})}),e.jsx("div",{className:"px-2 pb-3",children:e.jsx(kt,{items:a,strategy:yt,children:e.jsx("div",{className:`space-y-2 min-h-[80px] rounded-lg transition-all ${x?"bg-primary/5 p-2":""}`,children:n.length===0?e.jsx("div",{className:"text-xs text-gray-300 dark:text-gray-600 text-center py-8 italic",children:"Aucun enregistrement"}):n.map(C=>{var $;return e.jsx(Xe,{record:C,accountNumber:s,entitySlug:l,onQuickView:b,cardTemplate:d,entityData:j},(($=C._id)==null?void 0:$.$oid)||C._id)})})})}),e.jsx("div",{className:"px-3 pb-3",children:e.jsxs("button",{type:"button",className:"flex items-center gap-1 text-xs text-gray-400 hover:text-primary transition-colors",children:[e.jsx("svg",{width:"14",height:"14",viewBox:"0 0 24 24",fill:"none",children:e.jsx("path",{d:"M12 6V18M6 12H18",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round"})}),"Ajouter"]})})]})}function It({records:r,columns:n,accountNumber:a,entitySlug:s,viewId:l,entityData:b}){const d=t.useRef(null),j=t.useRef(null),[f,x]=t.useState(r),[k,h]=t.useState({}),[T,C]=t.useState(null),[$,A]=t.useState(null),Q=t.useCallback(v=>{A(v)},[]),[M,m]=t.useState(null);t.useEffect(()=>{var F;if(!(b!=null&&b._id))return;const v=((F=b._id)==null?void 0:F.$oid)||b._id;fetch(`/account/${a}/api/entity/${v}/cards/default/kanban`,{credentials:"include"}).then(Z=>Z.json()).then(Z=>{Z.success&&Z.card&&m(Z.card)}).catch(()=>{})},[b==null?void 0:b._id,a]),t.useEffect(()=>{x(r)},[r]);const Y=t.useRef(!1),J=t.useRef(0),P=t.useRef(0),X=t.useCallback(v=>{if(T||v.button!==0||v.target.closest('a, button, .dropdown, [data-dnd="card"]'))return;const F=d.current;F&&(Y.current=!0,J.current=v.pageX-F.offsetLeft,P.current=F.scrollLeft,F.style.cursor="grabbing")},[T]),u=t.useCallback(v=>{if(T){Y.current=!1;return}if(!Y.current)return;v.preventDefault();const F=d.current;if(!F)return;const R=(v.pageX-F.offsetLeft-J.current)*1.5;F.scrollLeft=P.current-R},[T]),g=t.useCallback(()=>{Y.current=!1,d.current&&(d.current.style.cursor="grab")},[]),te=ct(Te(bt,{activationConstraint:{distance:8}}),Te(gt,{activationConstraint:{delay:500,tolerance:10}}),Te(mt,{coordinateGetter:ht})),V=t.useMemo(()=>{if(b){const R=b.statusClassification;if(R&&R.options&&R.options.length>0){const D=R.options.map(K=>({id:String(K._id),title:K.label,color:K.color||"#6366f1",optionId:String(K._id)}));return D.push({id:"__none__",title:"Sans Statut",color:"#9ca3af",optionId:"none"}),{classId:String(R._id),columns:D}}const q=b.classifications||[];for(const D of q)if(D.options&&D.options.length>0){const K=D.options.map(ne=>({id:String(ne._id),title:ne.label,color:ne.color||"#6366f1",optionId:String(ne._id)}));return K.push({id:"__none__",title:"Non classé",color:"#9ca3af",optionId:"none"}),{classId:String(D._id),columns:K}}}const v={};f.forEach(R=>{(R.classificationValues||[]).forEach(q=>{var o,N;const D=((o=q.classificationId)==null?void 0:o.$oid)||q.classificationId||q.classification_id;if(!D)return;v[D]||(v[D]={count:0,options:{}}),v[D].count++;const K=q.optionLabel||q.label||"Sans label",ne=q.optionColor||q.color||"#9ca3af",p=((N=q.optionId)==null?void 0:N.$oid)||q.optionId||K;v[D].options[K]||(v[D].options[K]={label:K,color:ne,optionId:String(p),count:0}),v[D].options[K].count++})});let F=null,Z=0;if(Object.entries(v).forEach(([R,q])=>{q.count>Z&&(Z=q.count,F=R)}),F&&v[F]){const q=Object.values(v[F].options).map(D=>({id:D.label,title:D.label,color:D.color,optionId:D.optionId}));return q.push({id:"__none__",title:"Sans classification",color:"#9ca3af",optionId:"none"}),{classId:F,columns:q}}return{classId:null,columns:[{id:"__all__",title:"Tous les enregistrements",color:"#4361ee",optionId:null}]}},[f,b]),H=t.useMemo(()=>{const v={};if(V.columns.forEach(F=>v[F.id]=[]),!V.classId)v.__all__=f;else{const F={};V.columns.forEach(R=>{R.optionId&&R.optionId!=="none"&&(F[String(R.optionId)]=R.id)});const Z={};V.columns.forEach(R=>{Z[R.title]=R.id}),f.forEach(R=>{var K;const D=(R.classificationValues||[]).find(ne=>{var o;return(((o=ne.classificationId)==null?void 0:o.$oid)||ne.classificationId||ne.classification_id)===V.classId});if(D){const ne=String(((K=D.optionId)==null?void 0:K.$oid)||D.optionId||""),p=F[ne];if(p&&v[p])v[p].push(R);else{const o=D.optionLabel||D.label||"Sans label";v[o]?v[o].push(R):v.__none__&&v.__none__.push(R)}}else v.__none__&&v.__none__.push(R)})}for(const F of Object.keys(v)){const Z=k[F]||[];Z.length&&v[F].sort((R,q)=>{var ne,p;const D=Z.indexOf(String(((ne=R._id)==null?void 0:ne.$oid)||R._id)),K=Z.indexOf(String(((p=q._id)==null?void 0:p.$oid)||q._id));return D===-1&&K===-1?0:D===-1?1:K===-1?-1:D-K})}return v},[V,f,k]),B=t.useMemo(()=>{const v={};for(const F of V.columns)v[F.id]=(H[F.id]||[]).map(Z=>{var R;return String(((R=Z._id)==null?void 0:R.$oid)||Z._id)});return v},[V.columns,H]),L=t.useCallback(v=>{var Z;const F=String(v);for(const R of Object.keys(B))if((Z=B[R])!=null&&Z.includes(F))return R;return null},[B]),W=t.useMemo(()=>T&&f.find(v=>{var F;return String(((F=v._id)==null?void 0:F.$oid)||v._id)===String(T)})||null,[T,f]),_=t.useCallback(v=>{l&&(j.current&&clearTimeout(j.current),j.current=setTimeout(async()=>{try{await fetch(`/account/${a}/api/user/view-preferences`,{method:"POST",headers:{"Content-Type":"application/json"},credentials:"include",body:JSON.stringify({viewId:l,preferences:{kanban:{orderByColumn:v}}})})}catch{}},250))},[a,l]),oe=t.useCallback(async(v,F)=>{if(!V.classId)return;const Z=V.columns.find(R=>R.id===F);if(Z)try{await fetch(`/account/${a}/api/record/update-classification`,{method:"POST",headers:{"Content-Type":"application/json"},credentials:"include",body:JSON.stringify({recordId:v,classificationId:V.classId,optionId:Z.optionId==="none"?null:Z.optionId})})}catch(R){console.error("[RecordsKanban] Update error:",R)}},[a,V]),ae=v=>{C(String(v.active.id))},ue=()=>{C(null)},fe=v=>{const{active:F,over:Z}=v;if(C(null),!Z)return;const R=String(F.id),q=String(Z.id),D=L(R),K=V.columns.some(S=>String(S.id)===q)?q:L(q);if(!D||!K)return;if(D===K){const S=B[D]||[],se=S.indexOf(R),z=S.indexOf(q);if(se===-1||z===-1||se===z)return;const le=xt(S,se,z),xe={...k,[D]:le};h(xe),_(xe);return}const ne=[...B[D]||[]].filter(S=>S!==R),p=[...B[K]||[]],N=V.columns.some(S=>String(S.id)===q)?p.length:Math.max(0,p.indexOf(q));p.splice(N,0,R);const U={...k,[D]:ne,[K]:p};if(h(U),_(U),V.classId){const S=V.columns.find(se=>se.id===K);x(se=>se.map(z=>{var xe;if(String(((xe=z._id)==null?void 0:xe.$oid)||z._id)!==R)return z;const le=(z.classificationValues||[]).filter(c=>{var G;return(((G=c.classificationId)==null?void 0:G.$oid)||c.classificationId||c.classification_id)!==V.classId});return K!=="__none__"&&S&&le.push({classificationId:V.classId,optionId:S.optionId,optionLabel:S.title,optionColor:S.color}),{...z,classificationValues:le}})),oe(R,K)}};return e.jsxs("div",{ref:d,className:"h-full overflow-x-auto overflow-y-auto",style:{cursor:"grab",userSelect:"none",WebkitUserSelect:"none"},onMouseDown:X,onMouseMove:u,onMouseUp:g,onMouseLeave:g,children:[e.jsxs(ut,{sensors:te,collisionDetection:pt,autoScroll:{threshold:{x:.15,y:.15},interval:10,acceleration:5},onDragStart:ae,onDragEnd:fe,onDragCancel:ue,children:[e.jsx("div",{style:{display:"flex",flexWrap:"nowrap",alignItems:"flex-start",gap:"1.25rem",padding:"0.5rem",width:"max-content",minHeight:"100%"},children:V.columns.map(v=>{const F=H[v.id]||[];return v.id==="__none__"&&F.length===0?null:e.jsx(_t,{column:v,records:F,recordIds:B[v.id]||[],accountNumber:a,entitySlug:s,onQuickView:Q,cardTemplate:M,entityData:b},v.id)})}),e.jsx(ft,{children:W?e.jsx(Xe,{record:W,accountNumber:a,entitySlug:s,isDragging:!0,cardTemplate:M,entityData:b}):null})]}),$&&e.jsx(Mt,{record:$,columns:n,accountNumber:a,entitySlug:s,onClose:()=>A(null)})]})}const Pe=[{bg:"bg-primary-light shadow-primary",text:"text-primary",dot:"#4361ee"},{bg:"bg-info-light shadow-info",text:"text-info",dot:"#2196f3"},{bg:"bg-warning-light shadow-warning",text:"text-warning",dot:"#e2a03f"},{bg:"bg-danger-light shadow-danger",text:"text-danger",dot:"#e7515a"},{bg:"bg-success-light shadow-success",text:"text-success",dot:"#00ab55"},{bg:"bg-secondary-light shadow-secondary",text:"text-secondary",dot:"#805dca"}];function $t(r){return Pe[r%Pe.length]}function Rt(){return e.jsxs("svg",{width:"24",height:"24",viewBox:"0 0 24 24",fill:"none",className:"h-5 w-5 rotate-90 opacity-70 hover:opacity-100",children:[e.jsx("circle",{cx:"5",cy:"12",r:"2",stroke:"currentColor",strokeWidth:"1.5"}),e.jsx("circle",{opacity:"0.5",cx:"12",cy:"12",r:"2",stroke:"currentColor",strokeWidth:"1.5"}),e.jsx("circle",{cx:"19",cy:"12",r:"2",stroke:"currentColor",strokeWidth:"1.5"})]})}function Wt(){return e.jsxs("svg",{width:"24",height:"24",viewBox:"0 0 24 24",fill:"none",className:"h-4 w-4 ltr:mr-3 rtl:ml-3",children:[e.jsx("path",{d:"M15.2869 3.15178L14.3601 4.07866L5.83882 12.5999C5.26166 13.1771 4.97308 13.4656 4.7249 13.7838C4.43213 14.1592 4.18114 14.5653 3.97634 14.995C3.80273 15.3593 3.67368 15.7465 3.41556 16.5208L2.32181 19.8021L2.05445 20.6042C1.92743 20.9852 2.0266 21.4053 2.31063 21.6894C2.59466 21.9734 3.01478 22.0726 3.39584 21.9456L4.19792 21.6782L7.47918 20.5844C8.25353 20.3263 8.6407 20.1973 9.00498 20.0237C9.43469 19.8189 9.84082 19.5679 10.2162 19.2751C10.5344 19.0269 10.8229 18.7383 11.4001 18.1612L19.9213 9.63993L20.8482 8.71306C22.3839 7.17735 22.3839 4.68748 20.8482 3.15178C19.3125 1.61607 16.8226 1.61607 15.2869 3.15178Z",stroke:"currentColor",strokeWidth:"1.5"}),e.jsx("path",{opacity:"0.5",d:"M14.36 4.07812C14.36 4.07812 14.4759 6.04774 16.2138 7.78564C17.9517 9.52354 19.9213 9.6394 19.9213 9.6394M4.19789 21.6777L2.32178 19.8015",stroke:"currentColor",strokeWidth:"1.5"})]})}function Et(){return e.jsxs("svg",{width:"24",height:"24",viewBox:"0 0 24 24",fill:"none",className:"h-4.5 w-4.5 ltr:mr-3 rtl:ml-3",children:[e.jsx("path",{opacity:"0.5",d:"M3.27489 15.2957C2.42496 14.1915 2 13.6394 2 12C2 10.3606 2.42496 9.80853 3.27489 8.70433C4.97196 6.49956 7.81811 4 12 4C16.1819 4 19.028 6.49956 20.7251 8.70433C21.575 9.80853 22 10.3606 22 12C22 13.6394 21.575 14.1915 20.7251 15.2957C19.028 17.5004 16.1819 20 12 20C7.81811 20 4.97196 17.5004 3.27489 15.2957Z",stroke:"currentColor",strokeWidth:"1.5"}),e.jsx("path",{d:"M15 12C15 13.6569 13.6569 15 12 15C10.3431 15 9 13.6569 9 12C9 10.3431 10.3431 9 12 9C13.6569 9 15 10.3431 15 12Z",stroke:"currentColor",strokeWidth:"1.5"})]})}function Tt({filled:r}){return e.jsx("svg",{width:"24",height:"24",viewBox:"0 0 24 24",fill:"none",className:`h-4.5 w-4.5 group-hover:fill-warning ${r?"fill-warning":""}`,children:e.jsx("path",{d:"M9.15316 5.40838C10.4198 3.13613 11.0531 2 12 2C12.9469 2 13.5802 3.13612 14.8468 5.40837L15.1745 5.99623C15.5345 6.64193 15.7144 6.96479 15.9951 7.17781C16.2757 7.39083 16.6251 7.4699 17.3241 7.62805L17.9605 7.77203C20.4201 8.32856 21.65 8.60682 21.9426 9.54773C22.2352 10.4886 21.3968 11.4691 19.7199 13.4299L19.2861 13.9372C18.8096 14.4944 18.5713 14.773 18.4641 15.1177C18.357 15.4624 18.393 15.8341 18.465 16.5776L18.5306 17.2544C18.7841 19.8706 18.9109 21.1787 18.1449 21.7602C17.3788 22.3417 16.2273 21.8115 13.9243 20.7512L13.3285 20.4768C12.6741 20.1755 12.3469 20.0248 12 20.0248C11.6531 20.0248 11.3259 20.1755 10.6715 20.4768L10.0757 20.7512C7.77268 21.8115 6.62118 22.3417 5.85515 21.7602C5.08912 21.1787 5.21588 19.8706 5.4694 17.2544L5.53498 16.5776C5.60703 15.8341 5.64305 15.4624 5.53586 15.1177C5.42868 14.773 5.19043 14.4944 4.71392 13.9372L4.2801 13.4299C2.60325 11.4691 1.76482 10.4886 2.05742 9.54773C2.35002 8.60682 3.57986 8.32856 6.03954 7.77203L6.67589 7.62805C7.37485 7.4699 7.72433 7.39083 8.00494 7.17781C8.28555 6.96479 8.46553 6.64194 8.82547 5.99623L9.15316 5.40838Z",stroke:"currentColor",strokeWidth:"1.5"})})}function zt(){return e.jsx("svg",{width:"24",height:"24",viewBox:"0 0 24 24",fill:"none",className:"h-3 w-3 rotate-45",children:e.jsx("path",{d:"M2 12C2 7.28595 2 4.92893 3.46447 3.46447C4.92893 2 7.28595 2 12 2C16.714 2 19.0711 2 20.5355 3.46447C22 4.92893 22 7.28595 22 12C22 16.714 22 19.0711 20.5355 20.5355C19.0711 22 16.714 22 12 22C7.28595 22 4.92893 22 3.46447 20.5355C2 19.0711 2 16.714 2 12Z",stroke:"currentColor",strokeWidth:"1.5"})})}function Ft({record:r,accountNumber:n,entitySlug:a}){var j;const[s,l]=t.useState(!1),b=t.useRef(null);t.useEffect(()=>{if(!s)return;const f=x=>{b.current&&!b.current.contains(x.target)&&l(!1)};return document.addEventListener("mousedown",f),()=>document.removeEventListener("mousedown",f)},[s]);const d=((j=r._id)==null?void 0:j.$oid)||r._id;return e.jsxs("div",{ref:b,className:"dropdown relative",children:[e.jsx("button",{type:"button",className:"text-primary",onClick:f=>{f.preventDefault(),f.stopPropagation(),l(!s)},children:e.jsx(Rt,{})}),s&&e.jsxs("ul",{className:"absolute z-50 min-w-[140px] rounded-md bg-white dark:bg-[#1b2e4b] shadow-lg border dark:border-gray-700 py-1 text-sm font-medium ltr:right-0 rtl:left-0 top-full mt-1",style:{animation:"fadeIn 0.15s ease-out"},children:[e.jsx("li",{children:e.jsxs("a",{href:`/account/${n}/record/${a}/${d}/edit`,className:"flex items-center px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 w-full",onClick:f=>f.stopPropagation(),children:[e.jsx(Wt,{})," Edit"]})}),e.jsx("li",{children:e.jsxs("a",{href:`/account/${n}/record/${a}/${d}`,className:"flex items-center px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 w-full",onClick:f=>f.stopPropagation(),children:[e.jsx(Et,{})," View"]})})]})]})}function Ot({record:r,accountNumber:n,entitySlug:a,style:s,favorites:l,onToggleFav:b}){var T,C;const d=l[r._id]||!1,j=((T=r._id)==null?void 0:T.$oid)||r._id,f=r.referenceTitle||r.title||r.computedTitle||"Sans titre",x=r.createdAt?new Date(r.createdAt).toLocaleDateString("fr-FR",{day:"2-digit",month:"short",year:"numeric"}):"",k=(r.customFields||[]).find($=>{var A,Q,M,m,Y,J;return((Q=(A=$.field_id)==null?void 0:A.label)==null?void 0:Q.toLowerCase().includes("descri"))||((m=(M=$.field_id)==null?void 0:M.label)==null?void 0:m.toLowerCase().includes("note"))||((J=(Y=$.field_id)==null?void 0:Y.label)==null?void 0:J.toLowerCase().includes("contenu"))}),h=(k==null?void 0:k.value)||r.description||"";return(r.classificationValues||[]).filter($=>$.optionLabel).map($=>({label:$.optionLabel,color:$.optionColor||$.color||s.dot})),e.jsxs("div",{className:`panel pb-12 relative ${s.bg}`,children:[e.jsxs("div",{className:"min-h-[142px]",children:[e.jsxs("div",{className:"flex justify-between",children:[e.jsxs("div",{className:"flex w-max items-center",children:[e.jsx("div",{className:"flex-none",children:e.jsx("div",{className:"rounded-full bg-gray-300 p-2 dark:bg-gray-700",children:e.jsxs("svg",{width:"24",height:"24",viewBox:"0 0 24 24",fill:"none",className:"h-4.5 w-4.5",children:[e.jsx("circle",{cx:"12",cy:"6",r:"4",stroke:"currentColor",strokeWidth:"1.5"}),e.jsx("ellipse",{opacity:"0.5",cx:"12",cy:"17",rx:"7",ry:"4",stroke:"currentColor",strokeWidth:"1.5"})]})})}),e.jsxs("div",{className:"ltr:ml-2 rtl:mr-2",children:[e.jsx("div",{className:"font-semibold",children:((C=r.createdBy)==null?void 0:C.name)||"Utilisateur"}),e.jsx("div",{className:"text-sx text-white-dark",children:x})]})]}),e.jsx(Ft,{record:r,accountNumber:n,entitySlug:a})]}),e.jsxs("div",{children:[e.jsx("h4",{className:"mt-4 font-semibold",children:e.jsx("a",{href:`/account/${n}/record/${a}/${j}`,className:"hover:text-primary transition-colors",children:f})}),h&&e.jsx("p",{className:"mt-2 text-white-dark line-clamp-3",children:h})]})]}),e.jsx("div",{className:"absolute bottom-5 left-0 w-full px-5",children:e.jsxs("div",{className:"mt-2 flex items-center justify-between",children:[e.jsx("div",{className:s.text,children:e.jsx(zt,{})}),e.jsx("div",{className:"flex items-center gap-2",children:e.jsx("button",{type:"button",className:"group text-warning ltr:ml-2 rtl:mr-2",onClick:$=>{$.preventDefault(),$.stopPropagation(),b(r._id)},children:e.jsx(Tt,{filled:d})})})]})})]})}function At({records:r,accountNumber:n,entitySlug:a}){const[s,l]=t.useState({}),b=t.useCallback(d=>{l(j=>({...j,[d]:!j[d]}))},[]);return e.jsx("div",{className:"h-full overflow-y-auto",children:e.jsx("div",{className:"grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",children:r.length===0?e.jsx("div",{className:"col-span-full text-center py-20 text-gray-400 dark:text-gray-600 italic",children:"Aucun enregistrement"}):r.map((d,j)=>{var f;return e.jsx(Ot,{record:d,accountNumber:n,entitySlug:a,style:$t(j),favorites:s,onToggleFav:b},((f=d._id)==null?void 0:f.$oid)||d._id)})})})}const Ae={Planifié:{className:"primary",bg:"#4361ee",text:"#fff"},Confirmé:{className:"info",bg:"#2196f3",text:"#fff"},Terminé:{className:"success",bg:"#00ab55",text:"#fff"},Annulé:{className:"danger",bg:"#e7515a",text:"#fff"},"Non présenté":{className:"warning",bg:"#e2a03f",text:"#fff"}},Ie=[{className:"primary",bg:"#4361ee",text:"#fff"},{className:"info",bg:"#2196f3",text:"#fff"},{className:"success",bg:"#00ab55",text:"#fff"},{className:"danger",bg:"#e7515a",text:"#fff"},{className:"warning",bg:"#e2a03f",text:"#fff"}];function Vt(r,n){if(n){const a=(r.customFields||[]).find(s=>{var b,d,j;return(((d=(b=s.field_id)==null?void 0:b._id)==null?void 0:d.toString())||((j=s.field_id)==null?void 0:j.toString()))===n});if(a!=null&&a.value){const s=new Date(a.value);if(!isNaN(s))return s}}if(r.date){const a=new Date(r.date);if(!isNaN(a))return a}if(r.createdAt){const a=new Date(r.createdAt);if(!isNaN(a))return a}return null}function Bt(r,n){if(!n)return 30;const a=(r.customFields||[]).find(s=>{var b,d,j;return(((d=(b=s.field_id)==null?void 0:b._id)==null?void 0:d.toString())||((j=s.field_id)==null?void 0:j.toString()))===n});return parseInt(a==null?void 0:a.value)||30}function Dt(r){const n=r.classificationValues||[];for(const a of n)if(a.label||a.optionLabel)return a.label||a.optionLabel;return null}function Pt(r){const n=["Dimanche","Lundi","Mardi","Mercredi","Jeudi","Vendredi","Samedi"],a=["janvier","février","mars","avril","mai","juin","juillet","août","septembre","octobre","novembre","décembre"];return`${n[r.getDay()]} ${r.getDate()} ${a[r.getMonth()]} ${r.getFullYear()}`}function Ht(r){const n=r.getFullYear(),a=String(r.getMonth()+1).padStart(2,"0"),s=String(r.getDate()).padStart(2,"0"),l=String(r.getHours()).padStart(2,"0"),b=String(r.getMinutes()).padStart(2,"0");return`${n}-${a}-${s}T${l}:${b}`}function Jt({message:r,type:n="success",onClose:a}){t.useEffect(()=>{const b=setTimeout(a,3e3);return()=>clearTimeout(b)},[a]);const s={success:{bg:"#00ab55",icon:"✓"},error:{bg:"#e7515a",icon:"✕"},info:{bg:"#4361ee",icon:"ℹ"}},l=s[n]||s.info;return e.jsxs("div",{style:{position:"fixed",bottom:24,right:24,zIndex:1e4,display:"flex",alignItems:"center",gap:10,padding:"12px 20px",borderRadius:12,backgroundColor:l.bg,color:"#fff",boxShadow:"0 8px 32px rgba(0,0,0,0.18)",animation:"slideInRight 0.3s ease",fontSize:13,fontWeight:600},children:[e.jsx("span",{style:{fontSize:16},children:l.icon}),r]})}function Ut({isOpen:r,onClose:n,onSave:a,initialDate:s,entityData:l,accountNumber:b}){const[d,j]=t.useState(""),[f,x]=t.useState(""),[k,h]=t.useState("30"),[T,C]=t.useState(!1),$=t.useRef(null);if(t.useEffect(()=>{r&&s&&(x(Ht(s)),j(""),h("30"),setTimeout(()=>{var M;return(M=$.current)==null?void 0:M.focus()},100))},[r,s]),!r)return null;const A=async M=>{if(M.preventDefault(),!!d.trim()){C(!0);try{await a({title:d.trim(),date:f,duration:parseInt(k)}),n()}catch(m){console.error(m)}C(!1)}},Q=[15,30,45,60,90,120];return e.jsx("div",{style:{position:"fixed",inset:0,zIndex:9999,backgroundColor:"rgba(0,0,0,0.4)",backdropFilter:"blur(4px)",display:"flex",alignItems:"center",justifyContent:"center",animation:"fadeIn 0.2s ease"},onClick:M=>{M.target===M.currentTarget&&n()},children:e.jsxs("div",{style:{backgroundColor:"#fff",borderRadius:16,width:"100%",maxWidth:440,boxShadow:"0 24px 80px rgba(0,0,0,0.2)",animation:"slideUp 0.3s ease",overflow:"hidden"},children:[e.jsxs("div",{style:{padding:"20px 24px 16px",display:"flex",alignItems:"center",justifyContent:"space-between",borderBottom:"1px solid #f0f0f0"},children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:10},children:[e.jsx("div",{style:{width:36,height:36,borderRadius:10,background:"linear-gradient(135deg, #4361ee, #805cf6)",display:"flex",alignItems:"center",justifyContent:"center"},children:e.jsx("svg",{viewBox:"0 0 24 24",fill:"none",style:{width:18,height:18,color:"#fff"},children:e.jsx("path",{d:"M12 5V19M5 12H19",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round"})})}),e.jsxs("div",{children:[e.jsx("h3",{style:{margin:0,fontSize:16,fontWeight:700,color:"#1a1a2e"},children:"Nouveau rendez-vous"}),e.jsx("p",{style:{margin:0,fontSize:11,color:"#888",marginTop:2},children:s?Pt(s):""})]})]}),e.jsx("button",{onClick:n,style:{border:"none",background:"#f5f5f5",borderRadius:8,width:32,height:32,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer"},children:e.jsx("svg",{viewBox:"0 0 24 24",fill:"none",style:{width:16,height:16,color:"#666"},children:e.jsx("path",{d:"M18 6L6 18M6 6L18 18",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round"})})})]}),e.jsxs("form",{onSubmit:A,style:{padding:"20px 24px 24px"},children:[e.jsxs("div",{style:{marginBottom:16},children:[e.jsx("label",{style:{display:"block",fontSize:12,fontWeight:600,color:"#555",marginBottom:6},children:"Titre *"}),e.jsx("input",{ref:$,type:"text",value:d,onChange:M=>j(M.target.value),placeholder:"Ex: Consultation Dr. Martin",required:!0,style:{width:"100%",padding:"10px 14px",border:"1.5px solid #e0e0e0",borderRadius:10,fontSize:14,outline:"none",transition:"border 0.2s",boxSizing:"border-box"},onFocus:M=>M.target.style.borderColor="#4361ee",onBlur:M=>M.target.style.borderColor="#e0e0e0"})]}),e.jsxs("div",{style:{marginBottom:16},children:[e.jsx("label",{style:{display:"block",fontSize:12,fontWeight:600,color:"#555",marginBottom:6},children:"Date et heure"}),e.jsx("input",{type:"datetime-local",value:f,onChange:M=>x(M.target.value),style:{width:"100%",padding:"10px 14px",border:"1.5px solid #e0e0e0",borderRadius:10,fontSize:14,outline:"none",transition:"border 0.2s",boxSizing:"border-box"},onFocus:M=>M.target.style.borderColor="#4361ee",onBlur:M=>M.target.style.borderColor="#e0e0e0"})]}),e.jsxs("div",{style:{marginBottom:20},children:[e.jsx("label",{style:{display:"block",fontSize:12,fontWeight:600,color:"#555",marginBottom:8},children:"Durée"}),e.jsx("div",{style:{display:"flex",flexWrap:"wrap",gap:6},children:Q.map(M=>e.jsx("button",{type:"button",onClick:()=>h(String(M)),style:{padding:"6px 14px",borderRadius:20,fontSize:12,fontWeight:600,border:k===String(M)?"1.5px solid #4361ee":"1.5px solid #e0e0e0",backgroundColor:k===String(M)?"#4361ee":"#fff",color:k===String(M)?"#fff":"#555",cursor:"pointer",transition:"all 0.2s"},children:M<60?`${M} min`:`${M/60}h`},M))})]}),e.jsxs("div",{style:{display:"flex",gap:10,justifyContent:"flex-end"},children:[e.jsx("button",{type:"button",onClick:n,style:{padding:"10px 20px",borderRadius:10,fontSize:13,fontWeight:600,border:"1.5px solid #e0e0e0",backgroundColor:"#fff",color:"#555",cursor:"pointer",transition:"all 0.2s"},children:"Annuler"}),e.jsx("button",{type:"submit",disabled:T||!d.trim(),style:{padding:"10px 24px",borderRadius:10,fontSize:13,fontWeight:600,border:"none",background:d.trim()?"linear-gradient(135deg, #4361ee, #805cf6)":"#ccc",color:"#fff",cursor:d.trim()?"pointer":"not-allowed",transition:"all 0.2s",opacity:T?.7:1},children:T?"Création...":"Créer le RDV"})]})]})]})})}function qt({event:r,position:n,onClose:a,onEdit:s,onDelete:l,accountNumber:b,entitySlug:d,cardTemplate:j}){var A,Q;const f=t.useRef(null);if(t.useEffect(()=>{const M=m=>{f.current&&!f.current.contains(m.target)&&a()};return document.addEventListener("mousedown",M),()=>document.removeEventListener("mousedown",M)},[a]),!r)return null;const x=r.start?new Date(r.start):null,k=r.end?new Date(r.end):null,h=(A=r.extendedProps)==null?void 0:A.status,T=h?Ae[h]:null,$={_id:((Q=r.extendedProps)==null?void 0:Q.recordId)||r.id,referenceTitle:r.title,_start:x,_end:k,classificationValues:h?[{optionLabel:h,optionColor:T?T.bg:"#4361ee"}]:[],createdAt:x,...r.extendedProps};return e.jsx("div",{ref:f,style:{position:"fixed",top:Math.min(n.y,window.innerHeight-280),left:Math.min(n.x,window.innerWidth-340),zIndex:9998,width:320,backgroundColor:"#fff",borderRadius:14,boxShadow:"0 16px 64px rgba(0,0,0,0.18)",animation:"slideUp 0.2s ease",overflow:"hidden"},children:e.jsx(Ke,{record:$,cardTemplate:j,context:"calendar",accountNumber:b,entitySlug:d,callbacks:{onClose:a},style:{borderRadius:0}})})}function Yt({records:r=[],columns:n=[],accountNumber:a,entitySlug:s,entityData:l}){var q,D,K,ne;const b=t.useRef(null),d=t.useRef(null),[j,f]=t.useState(!1),[x,k]=t.useState(!1),[h,T]=t.useState(null),[C,$]=t.useState(null),[A,Q]=t.useState({x:0,y:0}),[M,m]=t.useState(null),[Y,J]=t.useState(r),[P,X]=t.useState(!1),[u,g]=t.useState({weekStartsOn:1,startHour:"07:00",endHour:"20:00",hideWeekend:!1,slotDuration:"00:15:00",slotLabelInterval:"01:00"});t.useEffect(()=>{var o;if(!(l!=null&&l._id))return;const p=((o=l._id)==null?void 0:o.$oid)||l._id;fetch(`/account/${a}/api/user/view-preferences?viewId=calendar_${p}`,{credentials:"include"}).then(N=>N.json()).then(N=>{var U;N.success&&((U=N.preferences)!=null&&U.calendarSettings)&&g(S=>({...S,...N.preferences.calendarSettings}))}).catch(()=>{})},[l==null?void 0:l._id,a]);const te=t.useCallback(async p=>{var N;g(p),X(!1);const o=((N=l==null?void 0:l._id)==null?void 0:N.$oid)||(l==null?void 0:l._id);if(o)try{await fetch(`/account/${a}/api/user/view-preferences`,{method:"POST",headers:{"Content-Type":"application/json"},credentials:"include",body:JSON.stringify({viewId:`calendar_${o}`,preferences:{calendarSettings:p}})}),m({message:"Paramètres sauvegardés",type:"success"})}catch{m({message:"Erreur sauvegarde paramètres",type:"error"})}},[a,l]);t.useEffect(()=>{J(r)},[r]);const[V,H]=t.useState(null);t.useEffect(()=>{var o;if(!(l!=null&&l._id))return;const p=((o=l._id)==null?void 0:o.$oid)||l._id;fetch(`/account/${a}/api/entity/${p}/cards/default/calendar`,{credentials:"include"}).then(N=>N.json()).then(N=>{N.success&&N.card&&H(N.card)}).catch(()=>{})},[l==null?void 0:l._id,a]);const{dateFieldId:B,durationFieldId:L}=t.useMemo(()=>{var z,le,xe,c,E;if(!l)return{dateFieldId:null,durationFieldId:null};const p=l.customFields||[],o=p.filter(G=>G.type==="date"||G.inputType==="date"||G.inputType==="datetime-local"),N=o.find(G=>/^date/i.test(G.name||"")||/date/i.test(G.label||"")),U=((z=N==null?void 0:N._id)==null?void 0:z.toString())||((xe=(le=o[0])==null?void 0:le._id)==null?void 0:xe.toString())||null,se=((E=(c=p.filter(G=>G.type==="number"&&(/dur/i.test(G.name||"")||/dur/i.test(G.label||"")))[0])==null?void 0:c._id)==null?void 0:E.toString())||null;return{dateFieldId:U,durationFieldId:se}},[l]),W=(q=l==null?void 0:l._id)==null?void 0:q.toString(),_=(K=(D=l==null?void 0:l.statusClassification)==null?void 0:D._id)==null?void 0:K.toString(),oe=((ne=l==null?void 0:l.statusClassification)==null?void 0:ne.options)||[],ae=oe.find(p=>/planif/i.test(p.label))||oe[0],ue=t.useMemo(()=>Y.map((p,o)=>{const N=Vt(p,B);if(!N)return null;const U=Bt(p,L),S=new Date(N.getTime()+U*6e4),se=p.referenceTitle||p.computedTitle||p.title||"Sans titre",z=Dt(p),le=z&&Ae[z]||Ie[o%Ie.length];return{id:p._id,title:se,start:N.toISOString(),end:S.toISOString(),className:le.className,extendedProps:{recordId:p._id,status:z,entitySlug:s,accountNumber:a,dateFieldId:B,durationFieldId:L}}}).filter(Boolean),[Y,B,L,s,a]),fe=t.useCallback(p=>{p.jsEvent.preventDefault(),p.jsEvent.stopPropagation();const o=p.el.getBoundingClientRect();Q({x:o.right+8,y:o.top}),$(p.event)},[]),v=t.useCallback(p=>{$(null);const o=p.start;T(o),k(!0),d.current&&d.current.unselect()},[]),F=t.useCallback(async p=>{var z,le,xe;const o=((z=p.event.extendedProps)==null?void 0:z.recordId)||p.event.id,N=p.event.start.toISOString(),U=(le=p.event.end)==null?void 0:le.toISOString(),S=(xe=p.event.extendedProps)==null?void 0:xe.dateFieldId;let se;p.event.start&&p.event.end&&(se=Math.round((p.event.end-p.event.start)/6e4));try{if(!(await fetch(`/account/${a}/api/records/${o}/date`,{method:"PATCH",headers:{"Content-Type":"application/json"},credentials:"include",body:JSON.stringify({dateFieldId:S,newStart:N,newEnd:U,duration:se})})).ok)throw new Error("Failed");m({message:"RDV déplacé avec succès",type:"success"})}catch{p.revert(),m({message:"Erreur lors du déplacement",type:"error"})}},[a]),Z=t.useCallback(async p=>{var se,z;const o=((se=p.event.extendedProps)==null?void 0:se.recordId)||p.event.id,N=p.event.start.toISOString(),U=(z=p.event.extendedProps)==null?void 0:z.dateFieldId;let S;p.event.start&&p.event.end&&(S=Math.round((p.event.end-p.event.start)/6e4));try{if(!(await fetch(`/account/${a}/api/records/${o}/date`,{method:"PATCH",headers:{"Content-Type":"application/json"},credentials:"include",body:JSON.stringify({dateFieldId:U,newStart:N,duration:S})})).ok)throw new Error("Failed");m({message:`Durée modifiée (${S} min)`,type:"success"})}catch{p.revert(),m({message:"Erreur lors du redimensionnement",type:"error"})}},[a]),R=t.useCallback(async({title:p,date:o,duration:N})=>{var se;if(!W||!B)return;const U=await fetch(`/account/${a}/api/entity/${W}/records/quick-add`,{method:"POST",headers:{"Content-Type":"application/json"},credentials:"include",body:JSON.stringify({title:p,dateFieldId:B,dateValue:new Date(o).toISOString(),duration:N,durationFieldId:L,statusOptionId:(se=ae==null?void 0:ae._id)==null?void 0:se.toString(),statusClassificationId:_})});if(!U.ok)throw new Error("Failed to create");const S=await U.json();S.record&&J(z=>[...z,S.record]),m({message:`"${p}" créé avec succès !`,type:"success"})},[a,W,B,L,ae,_]);return t.useEffect(()=>{if(typeof FullCalendar<"u"){f(!0);return}const p=setInterval(()=>{typeof FullCalendar<"u"&&(f(!0),clearInterval(p))},200);if(!document.querySelector('script[src*="fullcalendar"]')){const o=document.createElement("link");o.rel="stylesheet",o.href="/assets/css/fullcalendar.min.css",document.head.appendChild(o);const N=document.createElement("script");N.src="/assets/js/fullcalendar.min.js",N.onload=()=>f(!0),document.head.appendChild(N)}return()=>clearInterval(p)},[]),t.useEffect(()=>{if(!j||!b.current||typeof FullCalendar>"u")return;d.current&&d.current.destroy();const p=u.hideWeekend?[0,6]:[],o=new FullCalendar.Calendar(b.current,{initialView:"timeGridWeek",headerToolbar:{left:"prev,next today",center:"title",right:"dayGridMonth,timeGridWeek,timeGridDay"},locale:"fr",buttonText:{today:"Aujourd'hui",month:"Mois",week:"Semaine",day:"Jour"},editable:!0,selectable:!0,selectMirror:!0,dayMaxEvents:3,height:"auto",firstDay:u.weekStartsOn,hiddenDays:p,slotDuration:u.slotDuration,snapDuration:u.slotDuration,slotLabelInterval:u.slotLabelInterval,slotLabelFormat:{hour:"2-digit",minute:"2-digit",hour12:!1},slotMinTime:u.startHour+":00",slotMaxTime:u.endHour+":00",businessHours:{daysOfWeek:u.hideWeekend?[1,2,3,4,5]:[0,1,2,3,4,5,6],startTime:u.startHour,endTime:u.endHour},scrollTime:u.startHour+":00",nowIndicator:!0,events:ue,eventClick:fe,select:v,eventDrop:F,eventResize:Z,eventDidMount:N=>{var S;N.el.style.cursor="pointer",N.el.style.borderRadius="6px",N.el.style.border="none",N.el.style.fontSize="12px",N.el.style.fontWeight="600";const U=(S=N.event.extendedProps)==null?void 0:S.status;N.el.title=N.event.title+(U?` — ${U}`:"")},dayHeaderFormat:{weekday:"short",day:"numeric",month:"short"},allDaySlot:!1});return o.render(),d.current=o,()=>{d.current&&(d.current.destroy(),d.current=null)}},[j,ue,fe,v,F,Z,u]),j?!B&&r.length>0?e.jsxs("div",{style:{display:"flex",alignItems:"center",justifyContent:"center",padding:"48px 0",flexDirection:"column"},children:[e.jsxs("svg",{viewBox:"0 0 24 24",fill:"none",style:{width:48,height:48,marginBottom:12,color:"#ccc"},children:[e.jsx("rect",{x:"3",y:"4",width:"18",height:"18",rx:"2",stroke:"currentColor",strokeWidth:"1.5"}),e.jsx("path",{d:"M16 2V6M8 2V6M3 10H21",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"})]}),e.jsx("p",{style:{fontSize:14,fontWeight:500,color:"#888"},children:"Aucun champ date trouvé"}),e.jsx("p",{style:{fontSize:12,color:"#aaa",marginTop:4},children:"Ajoutez un champ date à cette entité"})]}):e.jsxs("div",{style:{position:"relative"},children:[e.jsx("style",{children:`
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes slideUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
                @keyframes slideInRight { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: translateX(0); } }
                .fc .fc-timegrid-slot { height: 40px !important; }
                .fc .fc-event { transition: box-shadow 0.2s, transform 0.15s !important; }
                .fc .fc-event:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.15) !important; transform: scale(1.02) !important; z-index: 10 !important; }
                .fc .fc-timegrid-now-indicator-line { border-color: #e7515a !important; border-width: 2px !important; }
                .fc .fc-timegrid-now-indicator-arrow { border-color: #e7515a !important; }
                .fc .fc-highlight { background: rgba(67, 97, 238, 0.08) !important; }
                .fc .fc-col-header-cell { font-weight: 600 !important; }
                .fc .fc-button-primary { border-radius: 8px !important; font-weight: 600 !important; font-size: 12px !important; }
                .fc .fc-button-group .fc-button { border-radius: 0 !important; }
                .fc .fc-button-group .fc-button:first-child { border-radius: 8px 0 0 8px !important; }
                .fc .fc-button-group .fc-button:last-child { border-radius: 0 8px 8px 0 !important; }
                .fc .fc-toolbar-title { font-size: 18px !important; font-weight: 700 !important; }
                .fc .fc-timegrid-slot-label { font-size: 11px !important; color: #888 !important; }
                .fc-theme-standard td, .fc-theme-standard th { border-color: #f0f0f0 !important; }
                .fc .fc-non-business { background: #fafbfc !important; }
                .cal-settings-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.12); z-index: 999; animation: fadeIn 0.15s ease; }
                .cal-settings-panel {
                    position: fixed; top: 0; right: 0; bottom: 0; width: 380px; max-width: 90vw;
                    background: #fff; z-index: 1000; box-shadow: -4px 0 32px rgba(0,0,0,0.12);
                    animation: slideInRight 0.25s ease; display: flex; flex-direction: column;
                }
                .cal-settings-panel .header {
                    display: flex; align-items: center; justify-content: space-between;
                    padding: 20px 24px; border-bottom: 1px solid #f0f0f0;
                }
                .cal-settings-panel .header h3 { margin: 0; font-size: 16px; font-weight: 700; color: #1e293b; }
                .cal-settings-panel .body { flex: 1; overflow-y: auto; padding: 24px; }
                .cal-settings-panel .footer {
                    padding: 16px 24px; border-top: 1px solid #f0f0f0;
                    display: flex; gap: 10px; justify-content: flex-end;
                }
                .cal-field { margin-bottom: 20px; }
                .cal-field label { display: block; font-size: 12px; font-weight: 600; color: #64748b; margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.5px; }
                .cal-field select, .cal-field input[type="time"] {
                    width: 100%; padding: 10px 12px; border: 1px solid #e2e8f0; border-radius: 8px;
                    font-size: 14px; color: #334155; background: #fff; outline: none; transition: border 0.2s;
                }
                .cal-field select:focus, .cal-field input[type="time"]:focus { border-color: #4361ee; box-shadow: 0 0 0 3px rgba(67,97,238,0.1); }
                .cal-toggle { display: flex; align-items: center; justify-content: space-between; padding: 12px 0; }
                .cal-toggle-label { font-size: 14px; color: #334155; font-weight: 500; }
                .cal-toggle-desc { font-size: 12px; color: #94a3b8; margin-top: 2px; }
                .cal-switch { position: relative; width: 44px; height: 24px; flex-shrink: 0; }
                .cal-switch input { opacity: 0; width: 0; height: 0; }
                .cal-switch .slider {
                    position: absolute; cursor: pointer; inset: 0;
                    background: #cbd5e1; border-radius: 24px; transition: 0.3s;
                }
                .cal-switch .slider:before {
                    content: ''; position: absolute; width: 18px; height: 18px;
                    left: 3px; bottom: 3px; background: #fff; border-radius: 50%;
                    transition: 0.3s; box-shadow: 0 1px 3px rgba(0,0,0,0.15);
                }
                .cal-switch input:checked + .slider { background: #4361ee; }
                .cal-switch input:checked + .slider:before { transform: translateX(20px); }
                .cal-btn {
                    padding: 10px 20px; border: none; border-radius: 8px; font-size: 13px;
                    font-weight: 600; cursor: pointer; transition: all 0.2s;
                }
                .cal-btn-primary { background: #4361ee; color: #fff; }
                .cal-btn-primary:hover { background: #3651d4; }
                .cal-btn-ghost { background: transparent; color: #64748b; }
                .cal-btn-ghost:hover { background: #f1f5f9; }
            `}),e.jsxs("div",{style:{marginBottom:12,display:"flex",flexWrap:"wrap",gap:12,alignItems:"center",justifyContent:"space-between",padding:"8px 0"},children:[e.jsx("div",{style:{display:"flex",flexWrap:"wrap",gap:10},children:Object.entries(Ae).map(([p,o])=>e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:5,fontSize:11,color:"#666"},children:[e.jsx("div",{style:{width:8,height:8,borderRadius:2,backgroundColor:o.bg}}),p]},p))}),e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:12},children:[e.jsx("span",{style:{fontSize:11,color:"#aaa",fontStyle:"italic"},children:"Cliquer pour ajouter • Glisser pour déplacer"}),e.jsxs("button",{onClick:()=>X(!0),style:{display:"flex",alignItems:"center",gap:6,padding:"6px 14px",border:"1px solid #e2e8f0",borderRadius:8,background:"#fff",cursor:"pointer",fontSize:12,fontWeight:600,color:"#475569",transition:"all 0.2s"},onMouseEnter:p=>{p.currentTarget.style.borderColor="#4361ee",p.currentTarget.style.color="#4361ee"},onMouseLeave:p=>{p.currentTarget.style.borderColor="#e2e8f0",p.currentTarget.style.color="#475569"},children:[e.jsx("iconify-icon",{icon:"solar:settings-linear",width:"15"}),"Config"]})]})]}),e.jsx("div",{className:"calendar-wrapper",ref:b}),P&&e.jsx(Zt,{settings:u,onSave:te,onClose:()=>X(!1)}),e.jsx(Ut,{isOpen:x,onClose:()=>k(!1),onSave:R,initialDate:h,entityData:l,accountNumber:a}),C&&e.jsx(qt,{event:C,position:A,onClose:()=>$(null),accountNumber:a,entitySlug:s,cardTemplate:V}),M&&e.jsx(Jt,{message:M.message,type:M.type,onClose:()=>m(null)})]}):e.jsxs("div",{style:{display:"flex",alignItems:"center",justifyContent:"center",padding:"48px 0"},children:[e.jsx("div",{className:"animate-spin rounded-full h-8 w-8 border-b-2 border-primary"}),e.jsx("span",{style:{marginLeft:12,color:"#888"},children:"Chargement du calendrier..."})]})}function Zt({settings:r,onSave:n,onClose:a}){const[s,l]=t.useState({...r}),b=[];for(let d=0;d<24;d++){const j=`${String(d).padStart(2,"0")}:00`;b.push(j)}return e.jsxs(e.Fragment,{children:[e.jsx("div",{className:"cal-settings-overlay",onClick:a}),e.jsxs("div",{className:"cal-settings-panel",children:[e.jsxs("div",{className:"header",children:[e.jsxs("h3",{children:[e.jsx("iconify-icon",{icon:"solar:settings-bold-duotone",width:"20",style:{verticalAlign:"middle",marginRight:8,color:"#4361ee"}}),"Paramètres du calendrier"]}),e.jsx("button",{onClick:a,style:{background:"none",border:"none",cursor:"pointer",padding:4,borderRadius:6,color:"#94a3b8"},children:e.jsx("iconify-icon",{icon:"solar:close-circle-linear",width:"22"})})]}),e.jsxs("div",{className:"body",children:[e.jsxs("div",{className:"cal-field",children:[e.jsx("label",{children:"Premier jour de la semaine"}),e.jsxs("select",{value:s.weekStartsOn,onChange:d=>l({...s,weekStartsOn:parseInt(d.target.value)}),children:[e.jsx("option",{value:1,children:"Lundi"}),e.jsx("option",{value:0,children:"Dimanche"}),e.jsx("option",{value:6,children:"Samedi"})]})]}),e.jsxs("div",{style:{display:"flex",gap:12},children:[e.jsxs("div",{className:"cal-field",style:{flex:1},children:[e.jsx("label",{children:"Heure de début"}),e.jsx("select",{value:s.startHour,onChange:d=>l({...s,startHour:d.target.value}),children:b.map(d=>e.jsx("option",{value:d,children:d},d))})]}),e.jsxs("div",{className:"cal-field",style:{flex:1},children:[e.jsx("label",{children:"Heure de fin"}),e.jsx("select",{value:s.endHour,onChange:d=>l({...s,endHour:d.target.value}),children:b.map(d=>e.jsx("option",{value:d,children:d},d))})]})]}),e.jsxs("div",{className:"cal-field",children:[e.jsx("label",{children:"Intervalle des créneaux"}),e.jsxs("select",{value:s.slotDuration,onChange:d=>l({...s,slotDuration:d.target.value}),children:[e.jsx("option",{value:"00:05:00",children:"5 minutes"}),e.jsx("option",{value:"00:10:00",children:"10 minutes"}),e.jsx("option",{value:"00:15:00",children:"15 minutes"}),e.jsx("option",{value:"00:30:00",children:"30 minutes"}),e.jsx("option",{value:"01:00:00",children:"1 heure"})]})]}),e.jsxs("div",{className:"cal-field",children:[e.jsx("label",{children:"Affichage des heures"}),e.jsxs("select",{value:s.slotLabelInterval,onChange:d=>l({...s,slotLabelInterval:d.target.value}),children:[e.jsx("option",{value:"00:30:00",children:"Toutes les 30 min"}),e.jsx("option",{value:"01:00:00",children:"Toutes les heures"}),e.jsx("option",{value:"02:00:00",children:"Toutes les 2 heures"})]})]}),e.jsx("div",{style:{height:1,background:"#f1f5f9",margin:"8px 0 20px"}}),e.jsxs("div",{className:"cal-toggle",children:[e.jsxs("div",{children:[e.jsx("div",{className:"cal-toggle-label",children:"Masquer le weekend"}),e.jsx("div",{className:"cal-toggle-desc",children:"Afficher uniquement du lundi au vendredi"})]}),e.jsxs("label",{className:"cal-switch",children:[e.jsx("input",{type:"checkbox",checked:s.hideWeekend,onChange:d=>l({...s,hideWeekend:d.target.checked})}),e.jsx("span",{className:"slider"})]})]})]}),e.jsxs("div",{className:"footer",children:[e.jsx("button",{className:"cal-btn cal-btn-ghost",onClick:a,children:"Annuler"}),e.jsxs("button",{className:"cal-btn cal-btn-primary",onClick:()=>n(s),children:[e.jsx("iconify-icon",{icon:"solar:check-circle-bold",width:"16",style:{verticalAlign:"middle",marginRight:4}}),"Appliquer"]})]})]})]})}const Qe={contains:{label:"Contient",icon:"⊃",types:["text","email","phone","url","textarea","title","relation"]},not_contains:{label:"Ne contient pas",icon:"⊅",types:["text","email","phone","url","textarea","title","relation"]},equals:{label:"Est égal à",icon:"=",types:["text","email","phone","url","number","date","title","select","relation","classification"]},not_equals:{label:"N'est pas égal à",icon:"≠",types:["text","email","phone","url","number","date","title","select","relation","classification"]},starts_with:{label:"Commence par",icon:"A…",types:["text","email","phone","url","title"]},ends_with:{label:"Se termine par",icon:"…Z",types:["text","email","phone","url","title"]},gt:{label:"Supérieur à",icon:">",types:["number","date"]},gte:{label:"Supérieur ou égal",icon:"≥",types:["number","date"]},lt:{label:"Inférieur à",icon:"<",types:["number","date"]},lte:{label:"Inférieur ou égal",icon:"≤",types:["number","date"]},between:{label:"Entre",icon:"↔",types:["number","date"]},is_empty:{label:"Est vide",icon:"∅",types:["text","email","phone","url","number","date","textarea","title","select","relation","classification"]},is_not_empty:{label:"N'est pas vide",icon:"∃",types:["text","email","phone","url","number","date","textarea","title","select","relation","classification"]}};function Fe(r){const n=r||"text";return Object.entries(Qe).filter(([a,s])=>s.types.includes(n)).map(([a,s])=>({key:a,...s}))}function He(r){return["number","currency","percent"].includes(r)?"number":["date","datetime"].includes(r)?"date":"text"}function Kt({columns:r=[],fieldFilters:n=[],onFieldFiltersChange:a,allRecords:s=[],sidebarFilters:l=[]}){const[b,d]=t.useState(n.length>0),[j,f]=t.useState(null),[x,k]=t.useState(!1),h=t.useRef(null);t.useEffect(()=>{const u=g=>{x&&h.current&&!h.current.contains(g.target)&&k(!1)};return x&&document.addEventListener("mousedown",u),()=>document.removeEventListener("mousedown",u)},[x]);const T=$e.useMemo(()=>{const u={};return l.forEach(g=>{u[`classif:${g.id}`]=g.options||[]}),u},[l]),C=r.filter(u=>u.id!=="actions"),$=t.useCallback(u=>{const g=C.find(L=>L.id===u);if(!g)return;const te=u.startsWith("classif:"),V=Fe(g.type),H=te?V.find(L=>L.key==="equals")||V[0]:V.find(L=>L.key==="contains")||V[0],B={fieldId:u,fieldName:g.name,fieldType:g.type||"text",operator:H.key,value:"",value2:"",logic:"AND"};a([...n,B]),k(!1),f(n.length)},[C,n,a]),A=t.useCallback((u,g)=>{const te=n.map((V,H)=>H===u?{...V,...g}:V);a(te)},[n,a]),Q=t.useCallback(u=>{const g=n.filter((te,V)=>V!==u);a(g),j===u&&f(null)},[n,a,j]),M=t.useCallback(()=>{a([]),f(null)},[a]),m=u=>["is_empty","is_not_empty"].includes(u),Y=u=>u==="between",J=u=>u&&u.startsWith("classif:"),P=u=>T[u]||[],X=(u,g)=>{const V=P(u).find(H=>H.id===g||H.label===g);return V?V.label:g};return e.jsxs("div",{className:"adv-filters-container",children:[e.jsxs("button",{type:"button",className:"adv-filters-header",onClick:()=>d(!b),children:[e.jsxs("div",{className:"adv-filters-header-left",children:[e.jsx("svg",{viewBox:"0 0 24 24",fill:"none",className:"adv-filters-header-icon",children:e.jsx("path",{d:"M22 3H2L10 12.46V19L14 21V12.46L22 3Z",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round"})}),e.jsx("span",{children:"Filtres avancés"}),n.length>0&&e.jsx("span",{className:"adv-filters-count",children:n.length})]}),e.jsx("svg",{viewBox:"0 0 24 24",fill:"none",className:`adv-filters-chevron ${b?"adv-filters-chevron--open":""}`,children:e.jsx("path",{d:"M9 18L15 12L9 6",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round"})})]}),b&&e.jsxs("div",{className:"adv-filters-body",children:[n.map((u,g)=>{var W;C.find(_=>_.id===u.fieldId);const te=Fe(u.fieldType),V=j===g,H=J(u.fieldId),B=H?P(u.fieldId):[],L=u.logic||"AND";return e.jsxs($e.Fragment,{children:[g>0&&e.jsxs("div",{className:"adv-filter-connector",children:[e.jsx("span",{className:"adv-filter-connector-line"}),e.jsx("button",{type:"button",className:`adv-filter-connector-badge ${L==="OR"?"adv-filter-connector-badge--or":""}`,onClick:()=>{A(g,{logic:L==="AND"?"OR":"AND"})},title:"Cliquez pour basculer entre ET/OU",children:L==="OR"?"OU":"ET"}),e.jsx("span",{className:"adv-filter-connector-line"})]}),e.jsx("div",{className:`adv-filter-pill ${V?"adv-filter-pill--editing":""}`,children:V?e.jsxs("div",{className:"adv-filter-edit",children:[e.jsxs("div",{className:"adv-filter-row",children:[e.jsx("label",{className:"adv-filter-label",children:"Champ"}),e.jsx("select",{value:u.fieldId,onChange:_=>{const oe=C.find(ae=>ae.id===_.target.value);if(oe){const ae=Fe(oe.type),fe=_.target.value.startsWith("classif:")?ae.find(v=>v.key==="equals")||ae[0]:ae.find(v=>v.key===u.operator)||ae[0];A(g,{fieldId:oe.id,fieldName:oe.name,fieldType:oe.type||"text",operator:fe.key,value:"",value2:""})}},className:"adv-filter-select",children:C.map(_=>e.jsx("option",{value:_.id,children:_.name},_.id))})]}),e.jsxs("div",{className:"adv-filter-row",children:[e.jsx("label",{className:"adv-filter-label",children:"Condition"}),e.jsx("select",{value:u.operator,onChange:_=>A(g,{operator:_.target.value,value:m(_.target.value)?"":u.value,value2:""}),className:"adv-filter-select",children:te.map(_=>e.jsx("option",{value:_.key,children:_.label},_.key))})]}),!m(u.operator)&&e.jsxs("div",{className:"adv-filter-row",children:[e.jsx("label",{className:"adv-filter-label",children:Y(u.operator)?"Valeur min":"Valeur"}),H&&B.length>0?e.jsxs("select",{value:u.value,onChange:_=>A(g,{value:_.target.value}),className:"adv-filter-select",children:[e.jsx("option",{value:"",children:"Sélectionnez..."}),B.map(_=>e.jsx("option",{value:_.label,children:_.label},_.id))]}):e.jsx("input",{type:He(u.fieldType),value:u.value,onChange:_=>A(g,{value:_.target.value}),placeholder:"Saisir une valeur...",className:"adv-filter-input",autoFocus:!0})]}),Y(u.operator)&&e.jsxs("div",{className:"adv-filter-row",children:[e.jsx("label",{className:"adv-filter-label",children:"Valeur max"}),e.jsx("input",{type:He(u.fieldType),value:u.value2||"",onChange:_=>A(g,{value2:_.target.value}),placeholder:"Saisir une valeur max...",className:"adv-filter-input"})]}),e.jsxs("div",{className:"adv-filter-row adv-filter-row--actions",children:[e.jsxs("button",{type:"button",className:"adv-filter-btn-done",onClick:()=>f(null),children:[e.jsx("svg",{viewBox:"0 0 24 24",fill:"none",className:"h-3.5 w-3.5",children:e.jsx("path",{d:"M5 13L9 17L19 7",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round"})}),"OK"]}),e.jsx("button",{type:"button",className:"adv-filter-btn-delete",onClick:()=>Q(g),children:e.jsxs("svg",{viewBox:"0 0 24 24",fill:"none",className:"h-3.5 w-3.5",children:[e.jsx("path",{d:"M20.5001 6H3.5",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"}),e.jsx("path",{d:"M18.8334 8.5L18.3735 15.3991C18.1965 18.054 18.108 19.3815 17.243 20.1907C16.378 21 15.0476 21 12.3868 21H11.6134C8.9526 21 7.6222 21 6.75719 20.1907C5.89218 19.3815 5.80368 18.054 5.62669 15.3991L5.16675 8.5",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"})]})})]})]}):e.jsxs("button",{type:"button",className:"adv-filter-pill-summary",onClick:()=>f(g),children:[e.jsx("span",{className:"adv-filter-pill-field",children:u.fieldName}),e.jsx("span",{className:"adv-filter-pill-op",children:((W=Qe[u.operator])==null?void 0:W.label)||u.operator}),!m(u.operator)&&e.jsx("span",{className:"adv-filter-pill-value",children:Y(u.operator)?`${u.value||"?"} – ${u.value2||"?"}`:H?X(u.fieldId,u.value):u.value||"..."}),e.jsx("button",{type:"button",className:"adv-filter-pill-remove",onClick:_=>{_.stopPropagation(),Q(g)},children:e.jsx("svg",{viewBox:"0 0 24 24",fill:"none",className:"h-3 w-3",children:e.jsx("path",{d:"M18 6L6 18M6 6L18 18",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round"})})})]})})]},g)}),e.jsxs("div",{className:"adv-filter-add-row",ref:h,children:[e.jsxs("button",{type:"button",className:"adv-filter-add-btn",onClick:()=>k(!x),children:[e.jsx("svg",{viewBox:"0 0 24 24",fill:"none",className:"h-3.5 w-3.5",children:e.jsx("path",{d:"M12 5V19M5 12H19",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round"})}),"Ajouter un filtre"]}),x&&e.jsxs("div",{className:"adv-filter-field-dropdown",children:[e.jsx("div",{className:"adv-filter-field-dropdown-title",children:"Choisir un champ"}),C.map(u=>e.jsxs("button",{type:"button",className:"adv-filter-field-option",onClick:()=>$(u.id),children:[e.jsx("span",{className:"adv-filter-field-type-badge",children:Xt(u.type)}),u.name]},u.id))]})]}),n.length>0&&e.jsx("button",{type:"button",className:"adv-filter-clear",onClick:M,children:"Effacer tous les filtres"})]}),e.jsx("style",{children:`
                /* ── Advanced Filters Container ──────────────────── */
                .adv-filters-container {
                    border-top: 1px solid #e0e6ed;
                    margin-top: 4px;
                }
                .dark .adv-filters-container {
                    border-color: #1b2e4b;
                }

                .adv-filters-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    width: 100%;
                    padding: 10px 4px;
                    border: none;
                    background: none;
                    cursor: pointer;
                    font-size: 12px;
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 0.04em;
                    color: #888ea8;
                    transition: color 0.15s;
                }
                .adv-filters-header:hover {
                    color: var(--primary, #4361ee);
                }
                .adv-filters-header-left {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                }
                .adv-filters-header-icon {
                    width: 14px;
                    height: 14px;
                    flex-shrink: 0;
                }
                .adv-filters-count {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    min-width: 18px;
                    height: 18px;
                    padding: 0 5px;
                    border-radius: 9px;
                    font-size: 10px;
                    font-weight: 700;
                    background: var(--primary, #4361ee);
                    color: #fff;
                }
                .adv-filters-chevron {
                    width: 14px;
                    height: 14px;
                    transition: transform 0.2s ease;
                }
                .adv-filters-chevron--open {
                    transform: rotate(90deg);
                }

                .adv-filters-body {
                    padding: 0 2px 8px;
                    display: flex;
                    flex-direction: column;
                    gap: 6px;
                }


                /* ── Filter Connector (AND/OR between pills) ──────────────────── */
                .adv-filter-connector {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    padding: 0 4px;
                }
                .adv-filter-connector-line {
                    flex: 1;
                    height: 1px;
                    background: #e2e8f0;
                }
                .dark .adv-filter-connector-line {
                    background: rgba(255,255,255,0.08);
                }
                .adv-filter-connector-badge {
                    font-size: 9px;
                    font-weight: 800;
                    letter-spacing: 0.05em;
                    color: var(--primary, #4361ee);
                    background: rgba(67, 97, 238, 0.08);
                    padding: 1px 10px;
                    border-radius: 4px;
                    text-transform: uppercase;
                    border: 1.5px solid rgba(67, 97, 238, 0.2);
                    cursor: pointer;
                    transition: all 0.15s;
                }
                .adv-filter-connector-badge:hover {
                    background: rgba(67, 97, 238, 0.18);
                    border-color: var(--primary, #4361ee);
                    transform: scale(1.05);
                }
                .adv-filter-connector-badge--or {
                    color: #f59e0b;
                    background: rgba(245, 158, 11, 0.1);
                    border-color: rgba(245, 158, 11, 0.25);
                }
                .adv-filter-connector-badge--or:hover {
                    background: rgba(245, 158, 11, 0.2);
                    border-color: #f59e0b;
                }

                /* ── Filter Pill (compact view) ──────────────────── */
                .adv-filter-pill {
                    border-radius: 10px;
                    overflow: hidden;
                    transition: all 0.2s ease;
                }
                .adv-filter-pill-summary {
                    display: flex;
                    align-items: center;
                    gap: 4px;
                    width: 100%;
                    padding: 6px 8px;
                    border: 1.5px solid #e2e8f0;
                    border-radius: 10px;
                    background: #f8fafc;
                    cursor: pointer;
                    font-size: 11.5px;
                    transition: all 0.15s;
                    text-align: left;
                }
                .dark .adv-filter-pill-summary {
                    background: rgba(255,255,255,0.03);
                    border-color: rgba(255,255,255,0.08);
                }
                .adv-filter-pill-summary:hover {
                    border-color: var(--primary, #4361ee);
                    background: rgba(67, 97, 238, 0.04);
                }
                .adv-filter-pill-field {
                    font-weight: 600;
                    color: #334155;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    max-width: 80px;
                }
                .dark .adv-filter-pill-field {
                    color: #e2e8f0;
                }
                .adv-filter-pill-op {
                    color: var(--primary, #4361ee);
                    font-weight: 500;
                    white-space: nowrap;
                    font-size: 10.5px;
                }
                .adv-filter-pill-value {
                    color: #64748b;
                    font-weight: 500;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    max-width: 80px;
                }
                .dark .adv-filter-pill-value {
                    color: #94a3b8;
                }
                .adv-filter-pill-remove {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 18px;
                    height: 18px;
                    border-radius: 50%;
                    border: none;
                    background: none;
                    color: #94a3b8;
                    cursor: pointer;
                    margin-left: auto;
                    flex-shrink: 0;
                    transition: all 0.15s;
                }
                .adv-filter-pill-remove:hover {
                    background: #fee2e2;
                    color: #dc2626;
                }
                .dark .adv-filter-pill-remove:hover {
                    background: rgba(220,38,38,0.15);
                    color: #ef4444;
                }

                /* ── Filter Edit (expanded) ──────────────────── */
                .adv-filter-pill--editing {
                    border: 1.5px solid var(--primary, #4361ee);
                    border-radius: 10px;
                    background: #f8fafc;
                    box-shadow: 0 2px 8px rgba(67, 97, 238, 0.08);
                }
                .dark .adv-filter-pill--editing {
                    background: rgba(255,255,255,0.03);
                    border-color: var(--primary, #4361ee);
                }
                .adv-filter-edit {
                    padding: 10px;
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }
                .adv-filter-row {
                    display: flex;
                    flex-direction: column;
                    gap: 3px;
                }
                .adv-filter-row--actions {
                    flex-direction: row;
                    justify-content: flex-end;
                    gap: 6px;
                    margin-top: 2px;
                }
                .adv-filter-label {
                    font-size: 10px;
                    font-weight: 600;
                    color: #94a3b8;
                    text-transform: uppercase;
                    letter-spacing: 0.03em;
                }
                .dark .adv-filter-label {
                    color: #64748b;
                }
                .adv-filter-select {
                    width: 100%;
                    padding: 6px 8px;
                    border: 1.5px solid #e2e8f0;
                    border-radius: 8px;
                    font-size: 12px;
                    color: #334155;
                    background: #fff;
                    outline: none;
                    cursor: pointer;
                    transition: border-color 0.15s;
                }
                .dark .adv-filter-select {
                    background: #1b2e4b;
                    border-color: rgba(255,255,255,0.1);
                    color: #e2e8f0;
                }
                .adv-filter-select:focus {
                    border-color: var(--primary, #4361ee);
                }
                .adv-filter-input {
                    width: 100%;
                    padding: 6px 8px;
                    border: 1.5px solid #e2e8f0;
                    border-radius: 8px;
                    font-size: 12px;
                    color: #334155;
                    background: #fff;
                    outline: none;
                    transition: border-color 0.15s;
                }
                .dark .adv-filter-input {
                    background: #1b2e4b;
                    border-color: rgba(255,255,255,0.1);
                    color: #e2e8f0;
                }
                .adv-filter-input:focus {
                    border-color: var(--primary, #4361ee);
                }
                .adv-filter-input::placeholder {
                    color: #94a3b8;
                }

                .adv-filter-btn-done {
                    display: inline-flex;
                    align-items: center;
                    gap: 4px;
                    padding: 4px 12px;
                    border-radius: 6px;
                    border: none;
                    background: var(--primary, #4361ee);
                    color: #fff;
                    font-size: 11px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.15s;
                }
                .adv-filter-btn-done:hover {
                    opacity: 0.9;
                    transform: translateY(-1px);
                }
                .adv-filter-btn-delete {
                    display: inline-flex;
                    align-items: center;
                    padding: 4px 8px;
                    border-radius: 6px;
                    border: none;
                    background: #fee2e2;
                    color: #dc2626;
                    cursor: pointer;
                    transition: all 0.15s;
                }
                .dark .adv-filter-btn-delete {
                    background: rgba(220,38,38,0.12);
                    color: #ef4444;
                }
                .adv-filter-btn-delete:hover {
                    background: #fecaca;
                }

                /* ── Add Filter Button ──────────────────── */
                .adv-filter-add-row {
                    position: relative;
                }
                .adv-filter-add-btn {
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    padding: 6px 10px;
                    border: 1.5px dashed #cbd5e1;
                    border-radius: 8px;
                    background: transparent;
                    color: #94a3b8;
                    font-size: 11.5px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.15s;
                    width: 100%;
                    justify-content: center;
                }
                .adv-filter-add-btn:hover {
                    border-color: var(--primary, #4361ee);
                    color: var(--primary, #4361ee);
                    background: rgba(67,97,238,0.04);
                }
                .dark .adv-filter-add-btn {
                    border-color: #475569;
                    color: #64748b;
                }
                .dark .adv-filter-add-btn:hover {
                    border-color: var(--primary, #4361ee);
                    color: var(--primary, #4361ee);
                }

                /* ── Field Selector Dropdown ──────────────── */
                .adv-filter-field-dropdown {
                    position: absolute;
                    left: 0;
                    right: 0;
                    bottom: calc(100% + 4px);
                    z-index: 100;
                    background: #fff;
                    border: 1px solid #e2e8f0;
                    border-radius: 10px;
                    padding: 4px;
                    box-shadow: 0 8px 24px rgba(0,0,0,0.12);
                    max-height: 240px;
                    overflow-y: auto;
                    animation: advFilterDropIn 0.12s ease-out;
                }
                .dark .adv-filter-field-dropdown {
                    background: #0e1726;
                    border-color: rgba(255,255,255,0.1);
                    box-shadow: 0 8px 24px rgba(0,0,0,0.4);
                }
                @keyframes advFilterDropIn {
                    from { opacity: 0; transform: translateY(4px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .adv-filter-field-dropdown-title {
                    padding: 6px 10px 4px;
                    font-size: 10px;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.04em;
                    color: #94a3b8;
                }
                .adv-filter-field-option {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    width: 100%;
                    padding: 7px 10px;
                    border: none;
                    background: none;
                    font-size: 12px;
                    color: #475569;
                    cursor: pointer;
                    border-radius: 6px;
                    transition: all 0.12s;
                    text-align: left;
                }
                .dark .adv-filter-field-option {
                    color: #cbd5e1;
                }
                .adv-filter-field-option:hover {
                    background: #f1f5f9;
                    color: #1e293b;
                }
                .dark .adv-filter-field-option:hover {
                    background: rgba(255,255,255,0.06);
                    color: #f1f5f9;
                }

                .adv-filter-field-type-badge {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    width: 20px;
                    height: 20px;
                    border-radius: 4px;
                    background: #f1f5f9;
                    font-size: 10px;
                    color: #64748b;
                    flex-shrink: 0;
                }
                .dark .adv-filter-field-type-badge {
                    background: rgba(255,255,255,0.06);
                    color: #94a3b8;
                }

                /* ── Clear All ──────────────────── */
                .adv-filter-clear {
                    display: block;
                    width: 100%;
                    padding: 5px 0;
                    border: none;
                    background: none;
                    color: #94a3b8;
                    font-size: 11px;
                    font-weight: 500;
                    cursor: pointer;
                    text-align: center;
                    transition: color 0.15s;
                }
                .adv-filter-clear:hover {
                    color: #dc2626;
                }
            `})]})}function Xt(r){return{text:"Aa",title:"T",email:"@",phone:"☎",url:"🔗",number:"#",currency:"$",percent:"%",date:"📅",datetime:"🕐",textarea:"¶",select:"☰",relation:"↗",classification:"●"}[r]||"Aa"}const Je=229,Ue=500,qe=280;function Qt({entityName:r,entityNamePlural:n,entityIcon:a,accountNumber:s,entitySlug:l,showSidebar:b,onToggleSidebar:d,filters:j=[],activeFilters:f={},onFilterChange:x,columns:k=[],fieldFilters:h=[],onFieldFiltersChange:T,allRecords:C=[],sidebarWidth:$,onSidebarWidthChange:A}){const[Q,M]=t.useState(!1),m=t.useRef(null),[Y,J]=t.useState($||qe),P=t.useRef(!1),X=t.useRef(0),u=t.useRef(0),g=t.useRef($||qe),te=t.useRef(A);t.useEffect(()=>{te.current=A},[A]),t.useEffect(()=>{g.current=Y},[Y]),t.useEffect(()=>{$&&!P.current&&J($)},[$]);const V=t.useCallback(L=>{L.preventDefault(),P.current=!0,X.current=L.clientX,u.current=g.current,document.body.style.cursor="col-resize",document.body.style.userSelect="none"},[]);if(t.useEffect(()=>{const L=_=>{if(!P.current)return;const oe=_.clientX-X.current,ae=Math.min(Ue,Math.max(Je,u.current+oe));J(ae)},W=()=>{P.current&&(P.current=!1,document.body.style.cursor="",document.body.style.userSelect="",te.current&&te.current(g.current))};return document.addEventListener("mousemove",L),document.addEventListener("mouseup",W),()=>{document.removeEventListener("mousemove",L),document.removeEventListener("mouseup",W)}},[]),t.useEffect(()=>{const L=W=>{Q&&m.current&&!m.current.contains(W.target)&&M(!1)};return Q&&document.addEventListener("mousedown",L),()=>document.removeEventListener("mousedown",L)},[Q]),!b)return null;const H=(L,W)=>{const _={...f},oe=_[L]||[];if(W==="__all__")delete _[L];else{const ae=oe.indexOf(W);ae>-1?(oe.splice(ae,1),oe.length===0?delete _[L]:_[L]=[...oe]):_[L]=[...oe,W]}x(_)},B=Object.keys(f).length>0;return e.jsxs("div",{style:{position:"relative",width:Y,minWidth:Je,maxWidth:Ue,flexShrink:0},children:[e.jsxs("div",{className:"panel z-10 space-y-4 overflow-y-auto p-4 h-full",style:{display:"flex",flexDirection:"column",width:"100%"},children:[e.jsxs("div",{className:"flex items-center justify-between",children:[e.jsx("div",{className:"flex items-center",children:e.jsxs("div",{className:"flex items-center text-center",children:[e.jsx("div",{children:a?e.jsx("iconify-icon",{icon:a,width:"22",style:{color:"var(--primary)"}}):e.jsxs("svg",{width:"24",height:"24",viewBox:"0 0 24 24",fill:"none",xmlns:"http://www.w3.org/2000/svg",className:"h-5 w-5",children:[e.jsx("path",{d:"M20.3116 12.6473L20.8293 10.7154C21.4335 8.46034 21.7356 7.3328 21.5081 6.35703C21.3285 5.58657 20.9244 4.88668 20.347 4.34587C19.6157 3.66095 18.4881 3.35883 16.2331 2.75458C13.978 2.15033 12.8504 1.84821 11.8747 2.07573C11.1042 2.25537 10.4043 2.65945 9.86351 3.23687C9.27709 3.86298 8.97128 4.77957 8.51621 6.44561C8.43979 6.7254 8.35915 7.02633 8.27227 7.35057L8.27222 7.35077L7.75458 9.28263C7.15033 11.5377 6.84821 12.6652 7.07573 13.641C7.25537 14.4115 7.65945 15.1114 8.23687 15.6522C8.96815 16.3371 10.0957 16.6392 12.3508 17.2435L12.3508 17.2435C14.3834 17.7881 15.4999 18.0873 16.415 17.9744C16.5152 17.9621 16.6129 17.9448 16.7092 17.9223C17.4796 17.7427 18.1795 17.3386 18.7203 16.7612C19.4052 16.0299 19.7074 14.9024 20.3116 12.6473Z",stroke:"currentColor",strokeWidth:"1.5"}),e.jsx("path",{opacity:"0.5",d:"M16.415 17.9741C16.2065 18.6126 15.8399 19.1902 15.347 19.6519C14.6157 20.3368 13.4881 20.6389 11.2331 21.2432C8.97798 21.8474 7.85044 22.1495 6.87466 21.922C6.10421 21.7424 5.40432 21.3383 4.86351 20.7609C4.17859 20.0296 3.87647 18.9021 3.27222 16.647L2.75458 14.7151C2.15033 12.46 1.84821 11.3325 2.07573 10.3567C2.25537 9.58627 2.65945 8.88638 3.23687 8.34557C3.96815 7.66065 5.09569 7.35853 7.35077 6.75428C7.77741 6.63996 8.16368 6.53646 8.51621 6.44531",stroke:"currentColor",strokeWidth:"1.5"}),e.jsx("path",{d:"M11.7769 10L16.6065 11.2941",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"}),e.jsx("path",{opacity:"0.5",d:"M11 12.8975L13.8978 13.6739",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"})]})}),e.jsx("h3",{className:"text-lg font-semibold ltr:ml-3 rtl:mr-3",children:r})]})}),e.jsxs("div",{className:"dropdown relative",ref:m,children:[e.jsx("button",{type:"button",className:"flex h-8 w-8 items-center justify-center rounded-full bg-[#f4f4f4] hover:bg-primary-light dark:bg-[#1b2e4b]",onClick:()=>M(!Q),children:e.jsxs("svg",{width:"24",height:"24",viewBox:"0 0 24 24",fill:"none",xmlns:"http://www.w3.org/2000/svg",className:"h-5 w-5 opacity-70",children:[e.jsx("circle",{cx:"5",cy:"12",r:"2",stroke:"currentColor",strokeWidth:"1.5"}),e.jsx("circle",{opacity:"0.5",cx:"12",cy:"12",r:"2",stroke:"currentColor",strokeWidth:"1.5"}),e.jsx("circle",{cx:"19",cy:"12",r:"2",stroke:"currentColor",strokeWidth:"1.5"})]})}),Q&&e.jsxs("ul",{className:"whitespace-nowrap absolute right-0 top-full mt-1 z-50 min-w-[160px] rounded-md border border-gray-200 bg-white py-1 shadow-lg dark:border-[#1b2e4b] dark:bg-[#0e1726]",children:[e.jsx("li",{children:e.jsxs("a",{href:"javascript:;",onClick:()=>M(!1),className:"flex items-center px-4 py-2 text-sm hover:bg-gray-100 hover:text-primary dark:hover:bg-[#181F32] dark:hover:text-primary",children:[e.jsx("iconify-icon",{icon:"solar:settings-bold-duotone",className:"h-4.5 w-4.5 shrink-0 ltr:mr-1 rtl:ml-1",width:"18",style:{marginRight:"6px"}}),"Paramètres"]})}),e.jsx("li",{children:e.jsxs("a",{href:"javascript:;",onClick:()=>M(!1),className:"flex items-center px-4 py-2 text-sm hover:bg-gray-100 hover:text-primary dark:hover:bg-[#181F32] dark:hover:text-primary",children:[e.jsx("iconify-icon",{icon:"solar:question-circle-bold-duotone",className:"h-4.5 w-4.5 shrink-0 ltr:mr-1 rtl:ml-1",width:"18",style:{marginRight:"6px"}}),"Aide"]})})]})]})]}),e.jsx("div",{className:"h-px w-full border-b border-[#e0e6ed] dark:border-[#1b2e4b]"}),e.jsx("div",{className:"!mt-0",style:{flex:1,display:"flex",flexDirection:"column"},children:e.jsxs("div",{className:"flex h-full flex-col pb-16",style:{position:"relative"},children:[e.jsx("div",{className:"relative -mr-3.5 h-full grow pr-3.5 overflow-auto",children:e.jsxs("div",{className:"space-y-1",children:[e.jsx("button",{type:"button",className:`flex h-10 w-full items-center justify-between rounded-md p-2 font-medium hover:bg-white-dark/10 hover:text-primary dark:hover:bg-[#181F32] dark:hover:text-primary ${B?"":"bg-gray-100 dark:text-primary text-primary dark:bg-[#181F32]"}`,onClick:()=>x({}),children:e.jsxs("div",{className:"flex items-center",children:[e.jsx("iconify-icon",{icon:"solar:checklist-minimalistic-bold-duotone",width:"20"}),e.jsxs("div",{className:"ltr:ml-3 rtl:mr-3",children:["Toutes les ",n||r+"s"]})]})}),e.jsx("button",{type:"button",className:`flex h-10 w-full items-center justify-between rounded-md p-2 font-medium hover:bg-white-dark/10 hover:text-primary dark:hover:bg-[#181F32] dark:hover:text-primary ${f.__favourites?"bg-gray-100 dark:text-primary text-primary dark:bg-[#181F32]":""}`,onClick:()=>{const L={...f};L.__favourites?delete L.__favourites:L.__favourites=!0,x(L)},children:e.jsxs("div",{className:"flex items-center",children:[e.jsx("svg",{width:"24",height:"24",viewBox:"0 0 24 24",fill:"none",xmlns:"http://www.w3.org/2000/svg",className:"h-5 w-5",children:e.jsx("path",{d:"M9.15316 5.40838C10.4198 3.13613 11.0531 2 12 2C12.9469 2 13.5802 3.13612 14.8468 5.40837L15.1745 5.99623C15.5345 6.64193 15.7144 6.96479 15.9951 7.17781C16.2757 7.39083 16.6251 7.4699 17.3241 7.62805L17.9605 7.77203C20.4201 8.32856 21.65 8.60682 21.9426 9.54773C22.2352 10.4886 21.3968 11.4691 19.7199 13.4299L19.2861 13.9372C18.8096 14.4944 18.5713 14.773 18.4641 15.1177C18.357 15.4624 18.393 15.8341 18.465 16.5776L18.5306 17.2544C18.7841 19.8706 18.9109 21.1787 18.1449 21.7602C17.3788 22.3417 16.2273 21.8115 13.9243 20.7512L13.3285 20.4768C12.6741 20.1755 12.3469 20.0248 12 20.0248C11.6531 20.0248 11.3259 20.1755 10.6715 20.4768L10.0757 20.7512C7.77268 21.8115 6.62118 22.3417 5.85515 21.7602C5.08912 21.1787 5.21588 19.8706 5.4694 17.2544L5.53498 16.5776C5.60703 15.8341 5.64305 15.4624 5.53586 15.1177C5.42868 14.773 5.19043 14.4944 4.71392 13.9372L4.2801 13.4299C2.60325 11.4691 1.76482 10.4886 2.05742 9.54773C2.35002 8.60682 3.57986 8.32856 6.03954 7.77203L6.67589 7.62805C7.37485 7.4699 7.72433 7.39083 8.00494 7.17781C8.28555 6.96479 8.46553 6.64194 8.82547 5.99623L9.15316 5.40838Z",stroke:"currentColor",strokeWidth:"1.5"})}),e.jsx("div",{className:"ltr:ml-3 rtl:mr-3",children:"Favourites"})]})}),j.map(L=>e.jsxs("div",{children:[e.jsx("div",{className:"h-px w-full border-b border-[#e0e6ed] dark:border-[#1b2e4b] my-2"}),e.jsx("div",{className:"px-1 py-2 text-white-dark text-xs uppercase font-semibold tracking-wider",children:L.name}),L.type==="tags"?e.jsx("div",{className:"flex flex-wrap gap-1.5 px-1",children:L.options.map(W=>{const _=(f[L.id]||[]).includes(W.id);return e.jsxs("button",{type:"button",className:"mb-0 py-0.5 px-2.5 text-xs rounded-full cursor-pointer transition-all font-medium",style:{border:`1.5px solid ${W.color||"#9ca3af"}`,color:_?"#fff":W.color||"#9ca3af",backgroundColor:_?W.color||"#9ca3af":"transparent"},onClick:()=>H(L.id,W.id),children:[W.label,W.count!==void 0&&e.jsx("span",{style:{opacity:.7,marginLeft:"2px"},children:W.count})]},W.id)})}):e.jsx("div",{className:"space-y-0.5",children:L.options.map(W=>{const _=(f[L.id]||[]).includes(W.id);return e.jsxs("button",{type:"button",className:`flex h-9 w-full items-center rounded-md px-2 py-1.5 text-sm font-medium transition-colors hover:bg-white-dark/10 hover:text-primary dark:hover:bg-[#181F32] dark:hover:text-primary ${_?"bg-gray-100 text-primary dark:bg-[#181F32] dark:text-primary":""}`,onClick:()=>H(L.id,W.id),children:[e.jsx("span",{className:"inline-block w-3 h-3 rounded-full mr-2.5 flex-shrink-0",style:{backgroundColor:W.color||"#9ca3af"}}),e.jsx("span",{className:"truncate",children:W.label}),W.count!==void 0&&e.jsx("span",{className:"ml-auto text-xs opacity-60",children:W.count})]},W.id)})})]},L.id)),e.jsx(Kt,{columns:k,fieldFilters:h,onFieldFiltersChange:T,allRecords:C,sidebarFilters:j})]})}),e.jsx("div",{className:"absolute bottom-0 w-full p-4 left-0",children:e.jsxs("a",{href:`/account/${s}/record/${l}/add`,className:"btn btn-primary w-full",children:[e.jsxs("svg",{xmlns:"http://www.w3.org/2000/svg",width:"24px",height:"24px",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round",className:"h-5 w-5 ltr:mr-2 rtl:ml-2",children:[e.jsx("line",{x1:"12",y1:"5",x2:"12",y2:"19"}),e.jsx("line",{x1:"5",y1:"12",x2:"19",y2:"12"})]}),"Ajouter"]})})]})})]}),e.jsx("div",{onMouseDown:V,style:{position:"absolute",top:0,right:-3,width:6,height:"100%",cursor:"col-resize",zIndex:20,display:"flex",alignItems:"center",justifyContent:"center"},onMouseEnter:L=>{L.currentTarget.querySelector(".resize-bar").style.opacity="1"},onMouseLeave:L=>{P.current||(L.currentTarget.querySelector(".resize-bar").style.opacity="0")},children:e.jsx("div",{className:"resize-bar",style:{width:3,height:"100%",borderRadius:2,background:"var(--primary, #4361ee)",opacity:0,transition:"opacity 0.2s ease"}})})]})}const Gt=["#4361ee","#805dca","#e2a03f","#00ab55","#e7515a","#2196d4","#3b3f5c","#009688","#ff5722","#607d8b"],er={contains:{label:"Contient",icon:"⊃",types:["text","email","phone","url","textarea","title","relation"]},not_contains:{label:"Ne contient pas",icon:"⊅",types:["text","email","phone","url","textarea","title","relation"]},equals:{label:"Est égal à",icon:"=",types:["text","email","phone","url","number","date","title","select","relation","classification"]},not_equals:{label:"N'est pas égal à",icon:"≠",types:["text","email","phone","url","number","date","title","select","relation","classification"]},starts_with:{label:"Commence par",icon:"A…",types:["text","email","phone","url","title"]},ends_with:{label:"Se termine par",icon:"…Z",types:["text","email","phone","url","title"]},gt:{label:"Supérieur à",icon:">",types:["number","date"]},gte:{label:"Supérieur ou égal",icon:"≥",types:["number","date"]},lt:{label:"Inférieur à",icon:"<",types:["number","date"]},lte:{label:"Inférieur ou égal",icon:"≤",types:["number","date"]},between:{label:"Entre",icon:"↔",types:["number","date"]},is_empty:{label:"Est vide",icon:"∅",types:["text","email","phone","url","number","date","textarea","title","select","relation","classification"]},is_not_empty:{label:"N'est pas vide",icon:"∃",types:["text","email","phone","url","number","date","textarea","title","select","relation","classification"]}};function Oe(r){const n=r||"text";return Object.entries(er).filter(([a,s])=>s.types.includes(n)).map(([a,s])=>({key:a,...s}))}function Ye(r){return["number","currency","percent"].includes(r)?"number":["date","datetime"].includes(r)?"date":"text"}function tr({savedViews:r=[],activeViewId:n,onSelectView:a,onCreateView:s,onDeleteView:l,onRenameView:b,onUpdateViewFilters:d,hasActiveFilters:j=!1,activeFilters:f={},fieldFilters:x=[],sidebarFilters:k=[],columns:h=[],externalOpenCreate:T=!1,onCloseExternalCreate:C}){const[$,A]=t.useState(!1),[Q,M]=t.useState(!1),[m,Y]=t.useState(""),[J,P]=t.useState("#4361ee"),[X,u]=t.useState(null),[g,te]=t.useState(null),[V,H]=t.useState(""),[B,L]=t.useState(null),[W,_]=t.useState([]),[oe,ae]=t.useState({}),[ue,fe]=t.useState(!1),v=t.useRef(null),F=t.useRef(null),Z=t.useRef(null),R=t.useRef(null);t.useEffect(()=>{const c=E=>{X&&F.current&&!F.current.contains(E.target)&&u(null)};return X&&document.addEventListener("mousedown",c),()=>document.removeEventListener("mousedown",c)},[X]),t.useEffect(()=>{$&&Z.current&&setTimeout(()=>{var c;return(c=Z.current)==null?void 0:c.focus()},100)},[$]),t.useEffect(()=>{T&&(A(!0),_([...x]),C==null||C())},[T]),t.useEffect(()=>{$&&!B&&(_([...x]),ae(JSON.parse(JSON.stringify(f||{}))))},[$]),t.useEffect(()=>{const c=E=>{ue&&v.current&&!v.current.contains(E.target)&&fe(!1)};return ue&&document.addEventListener("mousedown",c),()=>document.removeEventListener("mousedown",c)},[ue]),t.useEffect(()=>{g&&R.current&&(R.current.focus(),R.current.select())},[g]);const q=(c,E)=>{c.preventDefault(),u({viewId:E,x:c.clientX,y:c.clientY})},D=()=>{m.trim()&&(s({name:m.trim(),color:J,filters:oe,fieldFilters:W}),Y(""),P("#4361ee"),_([]),ae({}),A(!1))},K=t.useMemo(()=>h.filter(c=>c.id!=="actions"),[h]),ne=t.useMemo(()=>{const c={};return k.forEach(E=>{c[`classif:${E.id}`]=E.options||[]}),c},[k]),p=t.useCallback(c=>{const E=K.find(he=>he.id===c);if(!E)return;const G=c.startsWith("classif:"),pe=Oe(E.type),ke=G?pe.find(he=>he.key==="equals")||pe[0]:pe.find(he=>he.key==="contains")||pe[0],we={fieldId:c,fieldName:E.name,fieldType:E.type||"text",operator:ke.key,value:"",value2:"",logic:"AND"};_(he=>[...he,we]),fe(!1)},[K]),o=t.useCallback((c,E)=>{_(G=>G.map((pe,ke)=>ke===c?{...pe,...E}:pe))},[]),N=t.useCallback(c=>{_(E=>E.filter((G,pe)=>pe!==c))},[]),U=c=>{const E=r.find(G=>G._id===c);E&&(te(c),H(E.name)),u(null)},S=()=>{g&&V.trim()&&b(g,V.trim()),te(null),H("")},se=c=>{l(c),u(null)},z=c=>{const E=r.find(G=>G._id===c);E&&(L(c),Y(E.name||""),P(E.color||"#4361ee"),_(E.fieldFilters?JSON.parse(JSON.stringify(E.fieldFilters)):[]),ae(E.filters?JSON.parse(JSON.stringify(E.filters)):{}),A(!0),u(null))},le=()=>{!m.trim()||!B||(d(B,oe,W,m.trim(),J),Y(""),P("#4361ee"),_([]),ae({}),L(null),A(!1))},xe=c=>{var G;let E=0;return c.filters&&(E+=Object.keys(c.filters).filter(pe=>pe!=="__favourites").length),(G=c.fieldFilters)!=null&&G.length&&(E+=c.fieldFilters.length),E};return e.jsxs(e.Fragment,{children:[e.jsxs("div",{className:"saved-views-tabs",children:[e.jsxs("button",{type:"button",className:`saved-view-tab ${n?"":"saved-view-tab--active"}`,onClick:()=>a(null),children:[e.jsxs("svg",{className:"saved-view-tab-icon",viewBox:"0 0 24 24",fill:"none",children:[e.jsx("path",{d:"M2 12C2 7.28595 2 4.92893 3.46447 3.46447C4.92893 2 7.28595 2 12 2C16.714 2 19.0711 2 20.5355 3.46447C22 4.92893 22 7.28595 22 12C22 16.714 22 19.0711 20.5355 20.5355C19.0711 22 16.714 22 12 22C7.28595 22 4.92893 22 3.46447 20.5355C2 19.0711 2 16.714 2 12Z",stroke:"currentColor",strokeWidth:"1.5"}),e.jsx("path",{d:"M6 12H18",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"}),e.jsx("path",{d:"M6 8H18",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"}),e.jsx("path",{d:"M6 16H18",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"})]}),"Tout"]}),r.map(c=>e.jsx("button",{type:"button",className:`saved-view-tab ${n===c._id?"saved-view-tab--active":""}`,style:{"--tab-color":c.color||"#4361ee"},onClick:()=>a(c._id),onContextMenu:E=>q(E,c._id),children:g===c._id?e.jsx("input",{ref:R,type:"text",value:V,onChange:E=>H(E.target.value),onBlur:S,onKeyDown:E=>{E.key==="Enter"&&S(),E.key==="Escape"&&(te(null),H(""))},className:"saved-view-tab-edit-input",onClick:E=>E.stopPropagation()}):e.jsxs(e.Fragment,{children:[e.jsx("span",{className:"saved-view-tab-dot",style:{backgroundColor:c.color||"#4361ee"}}),e.jsx("span",{className:"saved-view-tab-name",children:c.name}),xe(c)>0&&e.jsx("span",{className:"saved-view-tab-badge",children:xe(c)})]})},c._id)),e.jsx("button",{type:"button",className:"saved-view-tab saved-view-tab--add",onClick:()=>{L(null),Y(""),P("#4361ee"),A(!0)},title:"Enregistrer une vue",children:e.jsx("svg",{viewBox:"0 0 24 24",fill:"none",className:"h-3.5 w-3.5",children:e.jsx("path",{d:"M12 5V19M5 12H19",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round"})})})]}),X&&e.jsxs("div",{ref:F,className:"saved-view-context-menu",style:{position:"fixed",top:X.y,left:X.x,zIndex:10001},children:[e.jsxs("button",{className:"saved-view-context-item",onClick:()=>U(X.viewId),children:[e.jsx("svg",{viewBox:"0 0 24 24",fill:"none",className:"h-4 w-4",children:e.jsx("path",{d:"M13.9027 6.37027L17.6297 10.0973M4 20.0001H8L18.5 9.50006C18.9978 9.00236 19.2786 8.32622 19.2786 7.62142C19.2786 6.91661 18.9978 6.24047 18.5 5.74277C18.0023 5.24508 17.3261 4.96426 16.6213 4.96426C15.9165 4.96426 15.2404 5.24508 14.7427 5.74277L4 16.0001V20.0001Z",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round"})}),"Renommer"]}),e.jsxs("button",{className:"saved-view-context-item",onClick:()=>z(X.viewId),children:[e.jsxs("svg",{viewBox:"0 0 24 24",fill:"none",className:"h-4 w-4",children:[e.jsx("path",{d:"M4.06189 13C4.02104 12.6724 4 12.3387 4 12C4 7.58172 7.58172 4 12 4C14.5006 4 16.7332 5.14727 18.2002 6.94416M19.9381 11C19.979 11.3276 20 11.6613 20 12C20 16.4183 16.4183 20 12 20C9.49944 20 7.26681 18.8527 5.79984 17.0558",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round"}),e.jsx("path",{d:"M15 7H19V3",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round"}),e.jsx("path",{d:"M9 17H5V21",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round"})]}),"Modifier la vue"]}),e.jsx("div",{className:"saved-view-context-separator"}),e.jsxs("button",{className:"saved-view-context-item saved-view-context-item--danger",onClick:()=>se(X.viewId),children:[e.jsxs("svg",{viewBox:"0 0 24 24",fill:"none",className:"h-4 w-4",children:[e.jsx("path",{d:"M20.5001 6H3.5",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"}),e.jsx("path",{d:"M18.8334 8.5L18.3735 15.3991C18.1965 18.054 18.108 19.3815 17.243 20.1907C16.378 21 15.0476 21 12.3868 21H11.6134C8.9526 21 7.6222 21 6.75719 20.1907C5.89218 19.3815 5.80368 18.054 5.62669 15.3991L5.16675 8.5",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"}),e.jsx("path",{d:"M9.5 11L10 16",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"}),e.jsx("path",{d:"M14.5 11L14 16",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"}),e.jsx("path",{d:"M6.5 6C6.55588 6 6.58382 6 6.60915 5.99936C7.43259 5.97849 8.15902 5.45491 8.43922 4.68032C8.44784 4.65649 8.45667 4.62999 8.47434 4.57697L8.57143 4.28571C8.65431 4.03708 8.69575 3.91276 8.75071 3.8072C8.97001 3.38607 9.37574 3.09364 9.84461 3.01877C9.96213 3 10.0932 3 10.3553 3H13.6447C13.9068 3 14.0379 3 14.1554 3.01877C14.6243 3.09364 15.03 3.38607 15.2493 3.8072C15.3043 3.91276 15.3457 4.03708 15.4286 4.28571L15.5257 4.57697C15.5433 4.62992 15.5522 4.65651 15.5608 4.68032C15.841 5.45491 16.5674 5.97849 17.3909 5.99936C17.4162 6 17.4441 6 17.5 6",stroke:"currentColor",strokeWidth:"1.5"})]}),"Supprimer"]})]}),$&&e.jsx("div",{className:"saved-view-modal-overlay",onClick:()=>A(!1),children:e.jsxs("div",{className:"saved-view-modal",onClick:c=>c.stopPropagation(),children:[e.jsxs("div",{className:"saved-view-modal-header",children:[e.jsx("h3",{children:B?"Modifier la vue":"Enregistrer la vue"}),e.jsx("button",{type:"button",className:"saved-view-modal-close",onClick:()=>{A(!1),L(null)},children:e.jsx("svg",{viewBox:"0 0 24 24",fill:"none",className:"h-5 w-5",children:e.jsx("path",{d:"M18 6L6 18M6 6L18 18",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"})})})]}),e.jsxs("div",{className:"saved-view-modal-body",children:[e.jsxs("div",{className:"saved-view-form-group",children:[e.jsx("label",{className:"saved-view-form-label",children:"Nom de la vue"}),e.jsx("input",{ref:Z,type:"text",value:m,onChange:c=>Y(c.target.value),onKeyDown:c=>{c.key==="Enter"&&D()},placeholder:"Ex: Hôtels, Clients VIP...",className:"saved-view-form-input"})]}),e.jsxs("div",{className:"saved-view-form-group",children:[e.jsx("label",{className:"saved-view-form-label",children:"Couleur"}),e.jsx("div",{className:"saved-view-color-grid",children:Gt.map(c=>e.jsx("button",{type:"button",className:`saved-view-color-swatch ${J===c?"saved-view-color-swatch--active":""}`,style:{backgroundColor:c},onClick:()=>P(c),children:J===c&&e.jsx("svg",{viewBox:"0 0 24 24",fill:"none",className:"h-3 w-3",children:e.jsx("path",{d:"M5 13L9 17L19 7",stroke:"white",strokeWidth:"2.5",strokeLinecap:"round",strokeLinejoin:"round"})})},c))})]}),k.length>0&&e.jsxs("div",{className:"saved-view-form-group",children:[e.jsx("label",{className:"saved-view-form-label",children:"Filtres de classification"}),e.jsx("div",{className:"svm-classif-editor",children:k.map(c=>{const E=oe[c.id]||[];return e.jsxs("div",{className:"svm-classif-group",children:[e.jsx("span",{className:"svm-classif-group-label",children:c.name}),e.jsx("div",{className:"svm-classif-options",children:(c.options||[]).map(G=>{const pe=E.includes(G.id);return e.jsxs("button",{type:"button",className:`svm-classif-pill ${pe?"svm-classif-pill--active":""}`,style:{"--pill-color":G.color||"#9ca3af"},onClick:()=>{ae(ke=>{const we=ke[c.id]||[];let he;pe?he=we.filter(je=>je!==G.id):he=[...we,G.id];const ye={...ke};return he.length>0?ye[c.id]=he:delete ye[c.id],ye})},children:[pe&&e.jsx("svg",{viewBox:"0 0 24 24",fill:"none",className:"svm-classif-check",children:e.jsx("path",{d:"M5 13L9 17L19 7",stroke:"currentColor",strokeWidth:"2.5",strokeLinecap:"round",strokeLinejoin:"round"})}),G.label]},G.id)})})]},c.id)})})]}),e.jsxs("div",{className:"saved-view-form-group",children:[e.jsx("label",{className:"saved-view-form-label",children:"Filtres avancés"}),e.jsxs("div",{className:"svm-filter-builder",children:[W.map((c,E)=>{var je;const G=(je=c.fieldId)==null?void 0:je.startsWith("classif:"),pe=G?ne[c.fieldId]||[]:[],ke=Oe(c.fieldType),we=["is_empty","is_not_empty"].includes(c.operator),he=c.operator==="between",ye=c.logic||"AND";return e.jsxs($e.Fragment,{children:[E>0&&e.jsxs("div",{className:"svm-filter-connector",children:[e.jsx("span",{className:"svm-filter-connector-line"}),e.jsx("button",{type:"button",className:`svm-filter-connector-badge ${ye==="OR"?"svm-filter-connector-badge--or":""}`,onClick:()=>o(E,{logic:ye==="AND"?"OR":"AND"}),title:"Cliquez pour basculer ET/OU",children:ye==="OR"?"OU":"ET"}),e.jsx("span",{className:"svm-filter-connector-line"})]}),e.jsxs("div",{className:"svm-filter-row",children:[e.jsx("select",{value:c.fieldId,onChange:ce=>{const Ce=K.find(Me=>Me.id===ce.target.value);if(Ce){const Me=ce.target.value.startsWith("classif:"),Ne=Oe(Ce.type),Se=Me?Ne.find(be=>be.key==="equals")||Ne[0]:Ne.find(be=>be.key===c.operator)||Ne[0];o(E,{fieldId:Ce.id,fieldName:Ce.name,fieldType:Ce.type||"text",operator:Se.key,value:"",value2:""})}},className:"svm-filter-select svm-filter-select--field",children:K.map(ce=>e.jsx("option",{value:ce.id,children:ce.name},ce.id))}),e.jsx("select",{value:c.operator,onChange:ce=>o(E,{operator:ce.target.value,value:["is_empty","is_not_empty"].includes(ce.target.value)?"":c.value,value2:""}),className:"svm-filter-select svm-filter-select--op",children:ke.map(ce=>e.jsx("option",{value:ce.key,children:ce.label},ce.key))}),!we&&(G&&pe.length>0?e.jsxs("select",{value:c.value,onChange:ce=>o(E,{value:ce.target.value}),className:"svm-filter-select svm-filter-select--val",children:[e.jsx("option",{value:"",children:"Sélectionnez..."}),pe.map(ce=>e.jsx("option",{value:ce.label,children:ce.label},ce.id))]}):e.jsx("input",{type:Ye(c.fieldType),value:c.value,onChange:ce=>o(E,{value:ce.target.value}),placeholder:"Valeur...",className:"svm-filter-input"})),he&&e.jsx("input",{type:Ye(c.fieldType),value:c.value2||"",onChange:ce=>o(E,{value2:ce.target.value}),placeholder:"Max...",className:"svm-filter-input"}),e.jsx("button",{type:"button",className:"svm-filter-remove",onClick:()=>N(E),title:"Supprimer ce filtre",children:e.jsx("svg",{viewBox:"0 0 24 24",fill:"none",className:"h-3.5 w-3.5",children:e.jsx("path",{d:"M18 6L6 18M6 6L18 18",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round"})})})]})]},E)}),e.jsxs("div",{className:"svm-filter-add-row",ref:v,children:[e.jsxs("button",{type:"button",className:"svm-filter-add-btn",onClick:()=>fe(!ue),children:[e.jsx("svg",{viewBox:"0 0 24 24",fill:"none",className:"h-3.5 w-3.5",children:e.jsx("path",{d:"M12 5V19M5 12H19",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round"})}),"Ajouter un filtre"]}),ue&&e.jsxs("div",{className:"svm-filter-field-dropdown",children:[e.jsx("div",{className:"svm-filter-field-dropdown-title",children:"Choisir un champ"}),K.map(c=>e.jsx("button",{type:"button",className:"svm-filter-field-option",onClick:()=>p(c.id),children:c.name},c.id))]})]})]})]})]}),e.jsxs("div",{className:"saved-view-modal-footer",children:[e.jsx("button",{type:"button",className:"saved-view-btn saved-view-btn--cancel",onClick:()=>{A(!1),L(null)},children:"Annuler"}),e.jsxs("button",{type:"button",className:"saved-view-btn saved-view-btn--save",onClick:B?le:D,disabled:!m.trim(),children:[e.jsx("svg",{viewBox:"0 0 24 24",fill:"none",className:"h-4 w-4",children:e.jsx("path",{d:"M5 13L9 17L19 7",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round"})}),B?"Mettre à jour":"Enregistrer"]})]})]})}),e.jsx("style",{children:`
                /* ── Saved Views Tabs Bar ──────────────────────── */
                .saved-views-tabs {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    padding: 6px 0 2px;
                    overflow-x: auto;
                    scrollbar-width: none;
                    -ms-overflow-style: none;
                }
                .saved-views-tabs::-webkit-scrollbar { display: none; }

                .saved-view-tab {
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    padding: 5px 14px;
                    border-radius: 20px;
                    font-size: 12.5px;
                    font-weight: 500;
                    white-space: nowrap;
                    cursor: pointer;
                    border: 1.5px solid transparent;
                    background: rgba(0,0,0,0.03);
                    color: #64748b;
                    transition: all 0.2s ease;
                    line-height: 1.4;
                }
                .dark .saved-view-tab {
                    background: rgba(255,255,255,0.04);
                    color: #94a3b8;
                }
                .saved-view-tab:hover {
                    background: rgba(0,0,0,0.06);
                    color: #334155;
                }
                .dark .saved-view-tab:hover {
                    background: rgba(255,255,255,0.08);
                    color: #cbd5e1;
                }

                .saved-view-tab--active {
                    background: var(--tab-color, #4361ee) !important;
                    color: #fff !important;
                    border-color: var(--tab-color, #4361ee) !important;
                    box-shadow: 0 2px 8px rgba(67, 97, 238, 0.3);
                    font-weight: 600;
                }
                .saved-view-tab--active:first-child {
                    --tab-color: #4361ee;
                }

                .saved-view-tab--add {
                    padding: 5px 10px;
                    border: 1.5px dashed #cbd5e1;
                    background: transparent;
                    color: #94a3b8;
                }
                .dark .saved-view-tab--add {
                    border-color: #475569;
                    color: #64748b;
                }
                .saved-view-tab--add:hover {
                    border-color: #4361ee;
                    color: #4361ee;
                    background: rgba(67, 97, 238, 0.05);
                }

                .saved-view-tab-icon {
                    width: 14px;
                    height: 14px;
                    flex-shrink: 0;
                }

                .saved-view-tab-dot {
                    width: 8px;
                    height: 8px;
                    border-radius: 50%;
                    flex-shrink: 0;
                }

                .saved-view-tab-name {
                    max-width: 140px;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }

                .saved-view-tab-badge {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    min-width: 16px;
                    height: 16px;
                    padding: 0 4px;
                    border-radius: 8px;
                    font-size: 10px;
                    font-weight: 700;
                    background: rgba(0,0,0,0.1);
                    color: inherit;
                }
                .saved-view-tab--active .saved-view-tab-badge {
                    background: rgba(255,255,255,0.25);
                }

                .saved-view-tab-edit-input {
                    width: 100px;
                    padding: 0 4px;
                    border: none;
                    border-bottom: 1.5px solid #4361ee;
                    background: transparent;
                    color: inherit;
                    font-size: 12.5px;
                    font-weight: 500;
                    outline: none;
                }

                /* ── Context Menu ──────────────────────── */
                .saved-view-context-menu {
                    min-width: 180px;
                    background: #fff;
                    border: 1px solid #e2e8f0;
                    border-radius: 10px;
                    padding: 4px;
                    box-shadow: 0 8px 30px rgba(0,0,0,0.12);
                    animation: svContextSlide 0.12s ease-out;
                }
                .dark .saved-view-context-menu {
                    background: #0e1726;
                    border-color: rgba(255,255,255,0.1);
                }
                @keyframes svContextSlide {
                    from { opacity: 0; transform: translateY(-4px) scale(0.97); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                }
                .saved-view-context-item {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    width: 100%;
                    padding: 8px 12px;
                    border: none;
                    background: none;
                    font-size: 13px;
                    color: #475569;
                    cursor: pointer;
                    border-radius: 6px;
                    transition: all 0.15s;
                }
                .dark .saved-view-context-item {
                    color: #cbd5e1;
                }
                .saved-view-context-item:hover {
                    background: #f1f5f9;
                    color: #1e293b;
                }
                .dark .saved-view-context-item:hover {
                    background: rgba(255,255,255,0.06);
                    color: #f1f5f9;
                }
                .saved-view-context-item--danger:hover {
                    background: #fef2f2;
                    color: #dc2626;
                }
                .dark .saved-view-context-item--danger:hover {
                    background: rgba(220,38,38,0.1);
                    color: #ef4444;
                }
                .saved-view-context-separator {
                    height: 1px;
                    background: #e2e8f0;
                    margin: 4px 8px;
                }
                .dark .saved-view-context-separator {
                    background: rgba(255,255,255,0.08);
                }

                /* ── Modal ──────────────────────── */
                .saved-view-modal-overlay {
                    position: fixed;
                    inset: 0;
                    z-index: 10000;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: rgba(0,0,0,0.45);
                    backdrop-filter: blur(4px);
                    animation: svFadeIn 0.2s ease;
                }
                @keyframes svFadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                .saved-view-modal {
                    width: 440px;
                    max-width: 90vw;
                    background: #fff;
                    border-radius: 16px;
                    box-shadow: 0 24px 48px rgba(0,0,0,0.2);
                    overflow: hidden;
                    animation: svModalSlide 0.25s ease-out;
                }
                .dark .saved-view-modal {
                    background: #0e1726;
                    box-shadow: 0 24px 48px rgba(0,0,0,0.5);
                }
                @keyframes svModalSlide {
                    from { opacity: 0; transform: translateY(12px) scale(0.97); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                }
                .saved-view-modal-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 18px 24px;
                    border-bottom: 1px solid #e2e8f0;
                }
                .dark .saved-view-modal-header {
                    border-color: rgba(255,255,255,0.08);
                }
                .saved-view-modal-header h3 {
                    font-size: 16px;
                    font-weight: 600;
                    color: #1e293b;
                    margin: 0;
                }
                .dark .saved-view-modal-header h3 {
                    color: #f1f5f9;
                }
                .saved-view-modal-close {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 32px;
                    height: 32px;
                    border-radius: 8px;
                    border: none;
                    background: none;
                    color: #94a3b8;
                    cursor: pointer;
                    transition: all 0.15s;
                }
                .saved-view-modal-close:hover {
                    background: #f1f5f9;
                    color: #475569;
                }
                .dark .saved-view-modal-close:hover {
                    background: rgba(255,255,255,0.06);
                    color: #cbd5e1;
                }
                .saved-view-modal-body {
                    padding: 20px 24px;
                }
                .saved-view-modal-footer {
                    display: flex;
                    justify-content: flex-end;
                    gap: 10px;
                    padding: 16px 24px;
                    border-top: 1px solid #e2e8f0;
                }
                .dark .saved-view-modal-footer {
                    border-color: rgba(255,255,255,0.08);
                }

                /* ── Form elements ──────────────────────── */
                .saved-view-form-group {
                    margin-bottom: 16px;
                }
                .saved-view-form-group:last-child {
                    margin-bottom: 0;
                }
                .saved-view-form-label {
                    display: block;
                    font-size: 12px;
                    font-weight: 600;
                    color: #64748b;
                    margin-bottom: 8px;
                    text-transform: uppercase;
                    letter-spacing: 0.03em;
                }
                .dark .saved-view-form-label {
                    color: #94a3b8;
                }
                .saved-view-form-input {
                    width: 100%;
                    padding: 10px 14px;
                    border: 1.5px solid #e2e8f0;
                    border-radius: 10px;
                    font-size: 14px;
                    color: #1e293b;
                    background: #fff;
                    transition: all 0.2s;
                    outline: none;
                }
                .dark .saved-view-form-input {
                    background: #1b2e4b;
                    border-color: rgba(255,255,255,0.1);
                    color: #f1f5f9;
                }
                .saved-view-form-input:focus {
                    border-color: #4361ee;
                    box-shadow: 0 0 0 3px rgba(67,97,238,0.1);
                }
                .saved-view-form-input::placeholder {
                    color: #94a3b8;
                }

                .saved-view-color-grid {
                    display: flex;
                    gap: 8px;
                    flex-wrap: wrap;
                }
                .saved-view-color-swatch {
                    width: 28px;
                    height: 28px;
                    border-radius: 50%;
                    border: 2.5px solid transparent;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.15s;
                }
                .saved-view-color-swatch:hover {
                    transform: scale(1.15);
                }
                .saved-view-color-swatch--active {
                    border-color: #1e293b;
                    transform: scale(1.1);
                    box-shadow: 0 2px 8px rgba(0,0,0,0.2);
                }
                .dark .saved-view-color-swatch--active {
                    border-color: #fff;
                }

                .saved-view-filter-summary {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                    padding: 12px;
                    background: #f8fafc;
                    border-radius: 10px;
                    border: 1px solid #e2e8f0;
                }
                .dark .saved-view-filter-summary {
                    background: rgba(255,255,255,0.03);
                    border-color: rgba(255,255,255,0.06);
                }
                .saved-view-filter-group {
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                }
                .saved-view-filter-group-label {
                    font-size: 11px;
                    font-weight: 600;
                    color: #64748b;
                    text-transform: uppercase;
                }
                .dark .saved-view-filter-group-label {
                    color: #94a3b8;
                }
                .saved-view-filter-tags {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 4px;
                }
                .saved-view-filter-tag {
                    display: inline-flex;
                    padding: 2px 8px;
                    border-radius: 10px;
                    font-size: 11px;
                    font-weight: 500;
                    border: 1.5px solid;
                }
                .saved-view-no-filters {
                    font-size: 13px;
                    color: #94a3b8;
                    font-style: italic;
                    margin: 0;
                    padding: 12px;
                    background: #f8fafc;
                    border-radius: 10px;
                    text-align: center;
                }
                .dark .saved-view-no-filters {
                    background: rgba(255,255,255,0.03);
                    color: #64748b;
                }

                /* ── Buttons ──────────────────────── */
                .saved-view-btn {
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    padding: 8px 18px;
                    border-radius: 10px;
                    font-size: 13px;
                    font-weight: 600;
                    cursor: pointer;
                    border: none;
                    transition: all 0.2s;
                }
                .saved-view-btn--cancel {
                    background: #f1f5f9;
                    color: #475569;
                }
                .dark .saved-view-btn--cancel {
                    background: rgba(255,255,255,0.06);
                    color: #94a3b8;
                }
                .saved-view-btn--cancel:hover {
                    background: #e2e8f0;
                }
                .dark .saved-view-btn--cancel:hover {
                    background: rgba(255,255,255,0.1);
                }
                .saved-view-btn--save {
                    background: #4361ee;
                    color: #fff;
                    box-shadow: 0 2px 8px rgba(67,97,238,0.3);
                }
                .saved-view-btn--save:hover {
                    background: #3b54d4;
                    box-shadow: 0 4px 12px rgba(67,97,238,0.4);
                    transform: translateY(-1px);
                }
                .saved-view-btn--save:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                    transform: none;
                    box-shadow: none;
                }

                /* ── Modal Classification Filter Editor ────────── */
                .svm-classif-editor {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                    padding: 12px;
                    background: #f8fafc;
                    border-radius: 10px;
                    border: 1px solid #e2e8f0;
                }
                .dark .svm-classif-editor {
                    background: rgba(255,255,255,0.03);
                    border-color: rgba(255,255,255,0.08);
                }
                .svm-classif-group {
                    display: flex;
                    flex-direction: column;
                    gap: 6px;
                }
                .svm-classif-group-label {
                    font-size: 11px;
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    color: #64748b;
                }
                .dark .svm-classif-group-label {
                    color: #94a3b8;
                }
                .svm-classif-options {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 6px;
                }
                .svm-classif-pill {
                    display: inline-flex;
                    align-items: center;
                    gap: 4px;
                    padding: 4px 12px;
                    border-radius: 20px;
                    font-size: 12px;
                    font-weight: 500;
                    cursor: pointer;
                    border: 1.5px solid var(--pill-color);
                    background: transparent;
                    color: var(--pill-color);
                    transition: all 0.2s ease;
                    line-height: 1.4;
                }
                .svm-classif-pill:hover {
                    background: color-mix(in srgb, var(--pill-color) 12%, transparent);
                }
                .svm-classif-pill--active {
                    background: var(--pill-color) !important;
                    color: #fff !important;
                    border-color: var(--pill-color);
                    box-shadow: 0 1px 4px color-mix(in srgb, var(--pill-color) 40%, transparent);
                }
                .svm-classif-check {
                    width: 12px;
                    height: 12px;
                    flex-shrink: 0;
                }

                /* ── Modal Inline Filter Builder ──────────────────── */
                .svm-filter-builder {
                    display: flex;
                    flex-direction: column;
                    gap: 6px;
                }
                .svm-filter-row {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    padding: 6px 8px;
                    background: #f8fafc;
                    border: 1.5px solid #e2e8f0;
                    border-radius: 8px;
                    transition: border-color 0.15s;
                }
                .dark .svm-filter-row {
                    background: rgba(255,255,255,0.03);
                    border-color: rgba(255,255,255,0.08);
                }
                .svm-filter-row:hover {
                    border-color: var(--primary, #4361ee);
                }
                .svm-filter-select {
                    padding: 4px 6px;
                    border: 1px solid #e2e8f0;
                    border-radius: 6px;
                    font-size: 11.5px;
                    color: #334155;
                    background: #fff;
                    outline: none;
                    cursor: pointer;
                    transition: border-color 0.15s;
                }
                .dark .svm-filter-select {
                    background: #1b2e4b;
                    border-color: rgba(255,255,255,0.1);
                    color: #e2e8f0;
                }
                .svm-filter-select:focus {
                    border-color: var(--primary, #4361ee);
                }
                .svm-filter-select--field {
                    flex: 1;
                    min-width: 0;
                    font-weight: 600;
                }
                .svm-filter-select--op {
                    min-width: 100px;
                }
                .svm-filter-select--val {
                    flex: 1;
                    min-width: 0;
                }
                .svm-filter-input {
                    flex: 1;
                    min-width: 0;
                    padding: 4px 6px;
                    border: 1px solid #e2e8f0;
                    border-radius: 6px;
                    font-size: 11.5px;
                    color: #334155;
                    background: #fff;
                    outline: none;
                    transition: border-color 0.15s;
                }
                .dark .svm-filter-input {
                    background: #1b2e4b;
                    border-color: rgba(255,255,255,0.1);
                    color: #e2e8f0;
                }
                .svm-filter-input:focus {
                    border-color: var(--primary, #4361ee);
                }
                .svm-filter-input::placeholder {
                    color: #94a3b8;
                }
                .svm-filter-remove {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 22px;
                    height: 22px;
                    border-radius: 50%;
                    border: none;
                    background: none;
                    color: #94a3b8;
                    cursor: pointer;
                    flex-shrink: 0;
                    transition: all 0.15s;
                }
                .svm-filter-remove:hover {
                    background: #fee2e2;
                    color: #dc2626;
                }
                .dark .svm-filter-remove:hover {
                    background: rgba(220,38,38,0.15);
                    color: #ef4444;
                }

                /* ── Modal Filter Connector ──────────────────── */
                .svm-filter-connector {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    padding: 0 8px;
                }
                .svm-filter-connector-line {
                    flex: 1;
                    height: 1px;
                    background: #e2e8f0;
                }
                .dark .svm-filter-connector-line {
                    background: rgba(255,255,255,0.08);
                }
                .svm-filter-connector-badge {
                    font-size: 9px;
                    font-weight: 800;
                    letter-spacing: 0.05em;
                    color: var(--primary, #4361ee);
                    background: rgba(67, 97, 238, 0.08);
                    padding: 1px 10px;
                    border-radius: 4px;
                    text-transform: uppercase;
                    border: 1.5px solid rgba(67, 97, 238, 0.2);
                    cursor: pointer;
                    transition: all 0.15s;
                }
                .svm-filter-connector-badge:hover {
                    background: rgba(67, 97, 238, 0.18);
                    border-color: var(--primary, #4361ee);
                    transform: scale(1.05);
                }
                .svm-filter-connector-badge--or {
                    color: #f59e0b;
                    background: rgba(245, 158, 11, 0.1);
                    border-color: rgba(245, 158, 11, 0.25);
                }
                .svm-filter-connector-badge--or:hover {
                    background: rgba(245, 158, 11, 0.2);
                    border-color: #f59e0b;
                }

                /* ── Modal Add Filter ──────────────────── */
                .svm-filter-add-row {
                    position: relative;
                }
                .svm-filter-add-btn {
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    padding: 6px 10px;
                    border: 1.5px dashed #cbd5e1;
                    border-radius: 8px;
                    background: transparent;
                    color: #94a3b8;
                    font-size: 11.5px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.15s;
                    width: 100%;
                    justify-content: center;
                }
                .svm-filter-add-btn:hover {
                    border-color: var(--primary, #4361ee);
                    color: var(--primary, #4361ee);
                    background: rgba(67,97,238,0.04);
                }
                .dark .svm-filter-add-btn {
                    border-color: #475569;
                    color: #64748b;
                }
                .dark .svm-filter-add-btn:hover {
                    border-color: var(--primary, #4361ee);
                    color: var(--primary, #4361ee);
                }
                .svm-filter-field-dropdown {
                    position: absolute;
                    left: 0;
                    right: 0;
                    bottom: calc(100% + 4px);
                    z-index: 100;
                    background: #fff;
                    border: 1px solid #e2e8f0;
                    border-radius: 10px;
                    padding: 4px;
                    box-shadow: 0 8px 24px rgba(0,0,0,0.12);
                    max-height: 200px;
                    overflow-y: auto;
                    animation: svmFilterDropIn 0.12s ease-out;
                }
                .dark .svm-filter-field-dropdown {
                    background: #0e1726;
                    border-color: rgba(255,255,255,0.1);
                    box-shadow: 0 8px 24px rgba(0,0,0,0.4);
                }
                @keyframes svmFilterDropIn {
                    from { opacity: 0; transform: translateY(4px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .svm-filter-field-dropdown-title {
                    padding: 6px 10px 4px;
                    font-size: 10px;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.04em;
                    color: #94a3b8;
                }
                .svm-filter-field-option {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    width: 100%;
                    padding: 7px 10px;
                    border: none;
                    background: none;
                    font-size: 12px;
                    color: #475569;
                    cursor: pointer;
                    border-radius: 6px;
                    transition: all 0.12s;
                    text-align: left;
                }
                .dark .svm-filter-field-option {
                    color: #cbd5e1;
                }
                .svm-filter-field-option:hover {
                    background: #f1f5f9;
                    color: #1e293b;
                }
                .dark .svm-filter-field-option:hover {
                    background: rgba(255,255,255,0.06);
                    color: #f1f5f9;
                }
            `})]})}function rr(r,n){var s,l,b;if(n==="title")return r.referenceTitle||r.computedTitle||r.title||"";if(n==="createdAt")return r.createdAt||"";if(n==="updatedAt")return r.updatedAt||"";if(n.startsWith("rel:")){const d=n.replace("rel:",""),f=(((s=r._denorm)==null?void 0:s.relations)||[]).find(h=>h.relationKey===d);if(((l=f==null?void 0:f.records)==null?void 0:l.length)>0)return f.records.map(h=>h.title||h.computedTitle||"").join(", ");const x=(r.relations||[]).find(h=>h.key===d||h.relationKey===d);if(x)return x.title||x.computedTitle||x.value||"";const k=(b=r._denorm)==null?void 0:b[d];return k&&(k.title||k.computedTitle)||""}if(n.startsWith("classif:")){const d=n.replace("classif:","");return(r.classificationValues||[]).filter(x=>{var k;return((k=x.classificationId)==null?void 0:k.toString())===d}).map(x=>x.label||x.optionLabel||"").join(", ")}const a=(r.customFields||[]).find(d=>{var j,f,x;return((f=(j=d.field_id)==null?void 0:j._id)==null?void 0:f.toString())===n||((x=d.field_id)==null?void 0:x.toString())===n});return(a==null?void 0:a.value)??""}function sr(r,n){const{operator:a,value:s,value2:l,fieldType:b}=n,d=["number","currency","percent"].includes(b),j=["date","datetime"].includes(b),f=String(r??"").trim(),x=f.toLowerCase(),k=String(s??"").trim().toLowerCase();switch(a){case"contains":return x.includes(k);case"not_contains":return!x.includes(k);case"equals":return d?parseFloat(f)===parseFloat(s):x===k;case"not_equals":return d?parseFloat(f)!==parseFloat(s):x!==k;case"starts_with":return x.startsWith(k);case"ends_with":return x.endsWith(k);case"gt":return j?new Date(r)>new Date(s):parseFloat(f)>parseFloat(s);case"gte":return j?new Date(r)>=new Date(s):parseFloat(f)>=parseFloat(s);case"lt":return j?new Date(r)<new Date(s):parseFloat(f)<parseFloat(s);case"lte":return j?new Date(r)<=new Date(s):parseFloat(f)<=parseFloat(s);case"between":{if(j){const T=new Date(r);return T>=new Date(s)&&T<=new Date(l)}const h=parseFloat(f);return h>=parseFloat(s)&&h<=parseFloat(l)}case"is_empty":return f===""||r==null;case"is_not_empty":return f!==""&&r!=null;default:return!0}}function ar({accountId:r,accountNumber:n,entityId:a,viewId:s,entityName:l,entityNamePlural:b,entitySlug:d}){const[j,f]=t.useState([]),[x,k]=t.useState([]),[h,T]=t.useState([]),[C,$]=t.useState([]),[A,Q]=t.useState(!0),[M,m]=t.useState(null),[Y,J]=t.useState(""),[P,X]=t.useState("table"),[u,g]=t.useState(""),[te,V]=t.useState(null),[H,B]=t.useState(new Set),[L,W]=t.useState(!1),_=t.useRef(null),[oe,ae]=t.useState([]),[ue,fe]=t.useState({}),[v,F]=t.useState([]),[Z,R]=t.useState([]),[q,D]=t.useState(null),[K,ne]=t.useState(!1),[p,o]=t.useState(null),N=t.useRef(null),U=t.useCallback((i,y="success")=>{N.current&&clearTimeout(N.current),o({message:i,type:y}),N.current=setTimeout(()=>o(null),2500)},[]),[S,se]=t.useState({columns:[],sort:{field:"createdAt",direction:"desc"},density:"normal",pageSize:10,titleDisplay:"avatar",showSidebar:!0,sidebarWidth:280,viewMode:null,enabledViews:["table","kanban","notes","calendar"]}),[z,le]=t.useState({page:1,limit:10,total:0,pages:0}),xe=t.useRef(null),c=t.useCallback(async()=>{var i,y;try{Q(!0),m(null);const I=new URLSearchParams({limit:1e4,sort:`${S.sort.field}:${S.sort.direction}`}),O=await fetch(`/account/${n}/api/entity/${a}/views/${s}/records?${I}`,{credentials:"include"});if(!O.ok)throw new Error(`HTTP ${O.status}`);const w=await O.json();if(f(w.records||[]),k(w.records||[]),w.entity&&(V(w.entity),w.entity.icon&&g(w.entity.icon)),w.filters&&ae(w.filters),w.preferences)if(se(re=>{var ee,ie;return{...re,...w.preferences,columns:(ee=w.preferences.columns)!=null&&ee.length?w.preferences.columns:((ie=w.columns)==null?void 0:ie.map(de=>({id:de.id,visible:!0})))||[]}}),w.preferences.pageSize&&le(re=>({...re,limit:w.preferences.pageSize})),w.preferences.viewMode&&X(w.preferences.viewMode),(i=w.preferences.columns)!=null&&i.length&&((y=w.columns)!=null&&y.length)){const re=[];w.preferences.columns.forEach(ee=>{const ie=w.columns.find(de=>de.id===ee.id);ie&&re.push(ie)}),w.columns.forEach(ee=>{re.find(ie=>ie.id===ee.id)||re.push(ee)}),$(re)}else $(w.columns||[]);else w.columns&&($(w.columns||[]),se(re=>({...re,columns:w.columns.map(ee=>({id:ee.id,visible:!0}))})))}catch(I){console.error("[RecordsGrid] Fetch error:",I),m(I.message)}finally{Q(!1)}},[n,a,s,S.sort]),E=t.useCallback(async()=>{try{const i=await fetch(`/account/${n}/api/entity/${a}/saved-views`,{credentials:"include"});if(i.ok){const y=await i.json();R(y.views||[])}}catch(i){console.error("[RecordsGrid] Fetch saved views error:",i)}},[n,a]),G=t.useCallback(async({name:i,color:y,filters:I,fieldFilters:O})=>{try{const w=await fetch(`/account/${n}/api/entity/${a}/saved-views`,{method:"POST",headers:{"Content-Type":"application/json"},credentials:"include",body:JSON.stringify({name:i,color:y,filters:I,fieldFilters:O})});if(w.ok){const re=await w.json();R(ee=>[...ee,re.view]),D(re.view._id)}}catch(w){console.error("[RecordsGrid] Create saved view error:",w)}},[n,a]),pe=t.useCallback(async i=>{try{(await fetch(`/account/${n}/api/entity/${a}/saved-views/${i}`,{method:"DELETE",credentials:"include"})).ok&&(R(I=>I.filter(O=>O._id!==i)),q===i&&(D(null),fe({}),le(I=>({...I,page:1}))))}catch(y){console.error("[RecordsGrid] Delete saved view error:",y)}},[n,a,q]),ke=t.useCallback(async(i,y)=>{try{(await fetch(`/account/${n}/api/entity/${a}/saved-views/${i}`,{method:"PUT",headers:{"Content-Type":"application/json"},credentials:"include",body:JSON.stringify({name:y})})).ok&&R(O=>O.map(w=>w._id===i?{...w,name:y}:w))}catch(I){console.error("[RecordsGrid] Rename saved view error:",I)}},[n,a]),we=t.useCallback(async(i,y,I,O,w)=>{var re;try{const ee={filters:y,fieldFilters:I||[]};if(O&&(ee.name=O),w&&(ee.color=w),(await fetch(`/account/${n}/api/entity/${a}/saved-views/${i}`,{method:"PUT",headers:{"Content-Type":"application/json"},credentials:"include",body:JSON.stringify(ee)})).ok){const de=JSON.parse(JSON.stringify(y||{})),me=JSON.parse(JSON.stringify(I||[]));R(ve=>ve.map(Le=>{if(Le._id!==i)return Le;const Ee={...Le,filters:de,fieldFilters:me};return O&&(Ee.name=O),w&&(Ee.color=w),Ee}));const ge=O||((re=Z.find(ve=>ve._id===i))==null?void 0:re.name)||"Vue";U(`Vue "${ge}" mise à jour`)}else U("Erreur lors de la mise à jour","error")}catch(ee){console.error("[RecordsGrid] Update saved view error:",ee),U("Erreur lors de la mise à jour","error")}},[n,a,Z,U]),he=t.useCallback(i=>{if(!i){D(null),fe({}),F([]),le(I=>({...I,page:1}));return}const y=Z.find(I=>I._id===i);y&&(D(i),fe(JSON.parse(JSON.stringify(y.filters||{}))),F(JSON.parse(JSON.stringify(y.fieldFilters||[]))),le(I=>({...I,page:1})))},[Z]);t.useEffect(()=>{c(),E()},[]);const ye=t.useMemo(()=>{if(!j.length)return[];const{field:i,direction:y}=S.sort,I=y==="asc"?1:-1;return[...j].sort((O,w)=>{let re,ee;if(i==="title")re=(O.referenceTitle||O.title||"").toLowerCase(),ee=(w.referenceTitle||w.title||"").toLowerCase();else if(i==="createdAt"||i==="updatedAt")re=new Date(O[i]||0).getTime(),ee=new Date(w[i]||0).getTime();else{const ie=(O.customFields||[]).find(me=>{var ve;const ge=((ve=me.field_id)==null?void 0:ve._id)||me.field_id;return(ge==null?void 0:ge.toString())===i}),de=(w.customFields||[]).find(me=>{var ve;const ge=((ve=me.field_id)==null?void 0:ve._id)||me.field_id;return(ge==null?void 0:ge.toString())===i});re=((ie==null?void 0:ie.value)||"").toString().toLowerCase(),ee=((de==null?void 0:de.value)||"").toString().toLowerCase()}return re<ee?-1*I:re>ee?1*I:0})},[j,S.sort.field,S.sort.direction]),je=t.useMemo(()=>ye.map(i=>({...i,_searchIndex:[i.title||"",i.referenceTitle||"",i.computedTitle||"",...(i.customFields||[]).map(y=>y.value||"")].join(" ").toLowerCase()})),[ye]),ce=t.useCallback((i,y,I,O)=>{let w=i;if(y&&y.trim()){const ee=y.toLowerCase();w=w.filter(ie=>ie._searchIndex.includes(ee))}const re=Object.keys(I).filter(ee=>ee!=="__favourites");return re.length>0&&(w=w.filter(ee=>{const ie=ee.classificationValues||[];return re.every(de=>{const me=I[de];return!me||me.length===0?!0:ie.some(ge=>{var ve,Le;return((ve=ge.classificationId)==null?void 0:ve.toString())===de&&me.includes((Le=ge.optionId)==null?void 0:Le.toString())})})})),O&&O.length>0&&(w=w.filter(ee=>{const ie=[[O[0]]];for(let de=1;de<O.length;de++)(O[de].logic||"AND")==="OR"?ie.push([O[de]]):ie[ie.length-1].push(O[de]);return ie.some(de=>de.every(me=>{const ge=rr(ee,me.fieldId);return sr(ge,me)}))})),w},[]),Ce=t.useCallback(i=>{var I;const y=typeof i=="string"?i:((I=i==null?void 0:i.target)==null?void 0:I.value)||"";J(y),le(O=>({...O,page:1}))},[]),Me=t.useCallback(i=>{fe(i),le(y=>({...y,page:1}))},[]),Ne=t.useCallback(i=>{F(i),le(y=>({...y,page:1}))},[]);t.useEffect(()=>{const i=ce(je,Y,ue,v);k(i)},[je,Y,ue,v,ce]),t.useEffect(()=>{const i=(z.page-1)*z.limit,y=i+z.limit,I=x.slice(i,y);T(I),le(O=>({...O,total:x.length,pages:Math.ceil(x.length/z.limit)}))},[x,z.page,z.limit]);const Se=t.useCallback(async i=>{try{await fetch(`/account/${n}/api/user/view-preferences`,{method:"POST",headers:{"Content-Type":"application/json"},credentials:"include",body:JSON.stringify({viewId:s,preferences:i})})}catch(y){console.error("[RecordsGrid] Save preferences error:",y)}},[n,s]),be=t.useCallback((i,y)=>{const I={...S,[i]:y};se(I),Se(I),i==="pageSize"&&le(O=>({...O,limit:y,page:1}))},[S,Se]),Ge=t.useCallback(i=>{X(i),se(y=>{const I={...y,viewMode:i};return Se(I),I})},[Se]),Re=t.useCallback(i=>{le(y=>({...y,page:i}))},[]),et=t.useCallback((i,y,I)=>{if(I&&_.current!==null&&_.current!==y){const O=Math.min(_.current,y),w=Math.max(_.current,y);B(re=>{const ee=new Set(re);for(let ie=O;ie<=w;ie++)h[ie]&&ee.add(h[ie]._id);return ee})}else B(O=>{const w=new Set(O);return w.has(i)?w.delete(i):w.add(i),w});_.current=y},[h]),tt=t.useCallback(()=>{B(i=>{const y=h.map(w=>w._id),I=y.every(w=>i.has(w)),O=new Set(i);return I?y.forEach(w=>O.delete(w)):y.forEach(w=>O.add(w)),O})},[h]),rt=t.useCallback(()=>{B(i=>{const y=x.map(I=>I._id);return i.size===y.length?new Set:new Set(y)})},[x]),st=t.useCallback(()=>{B(new Set)},[]),at=t.useMemo(()=>h.length===0?!1:h.every(i=>H.has(i._id)),[h,H]),ot=t.useCallback(async()=>{if(!(H.size===0||!(typeof Swal<"u"?await Swal.fire({title:"Confirmer la suppression",html:`<p>Vous allez supprimer <strong>${H.size}</strong> enregistrement(s).</p><p style="color:#e7515a;font-size:13px;margin-top:8px;">Cette action est irréversible.</p>`,icon:"warning",showCancelButton:!0,confirmButtonColor:"#e7515a",cancelButtonText:"Annuler",confirmButtonText:"Supprimer"}).then(y=>y.isConfirmed):confirm(`Supprimer ${H.size} enregistrement(s) ?`)))){W(!0);try{const I=await(await fetch(`/account/${n}/record/api/bulk-delete`,{method:"POST",headers:{"Content-Type":"application/json"},credentials:"include",body:JSON.stringify({ids:[...H]})})).json();I.success?(f(O=>O.filter(w=>!H.has(w._id))),B(new Set),U(`${I.deletedCount} enregistrement(s) supprimé(s)`)):U(I.error||"Erreur lors de la suppression","error")}catch(y){console.error("[RecordsGrid] Bulk delete error:",y),U("Erreur lors de la suppression","error")}finally{W(!1)}}},[H,n,U]),nt=t.useCallback((i,y)=>{$(I=>{const O=I.findIndex(de=>de.id===i),w=I.findIndex(de=>de.id===y);if(O===-1||w===-1)return I;const re=[...I],[ee]=re.splice(O,1);re.splice(w,0,ee);const ie=re.map(de=>S.columns.find(ge=>ge.id===de.id)||{id:de.id,visible:!0});return be("columns",ie),re})},[S.columns,be]),Ve=t.useMemo(()=>{switch(S.density){case"compact":return 36;case"comfortable":return 56;default:return 44}},[S.density]),We=dt({count:h.length,getScrollElement:()=>xe.current,estimateSize:()=>Ve,overscan:10});t.useEffect(()=>{We.measure()},[Ve,We]);const it=t.useMemo(()=>{var I;let i;(I=S.columns)!=null&&I.length?i=C.filter(O=>{const w=S.columns.find(re=>re.id===O.id);return w?w.visible!==!1:!0}):i=C;const y=i.findIndex(O=>O.id==="actions");if(y>-1&&y<i.length-1){const[O]=i.splice(y,1);i=[...i,O]}return i},[C,S.columns]);return A&&h.length===0?e.jsx("div",{className:"flex items-center justify-center h-64",children:e.jsx("div",{className:"animate-spin rounded-full h-8 w-8 border-b-2 border-primary"})}):M&&h.length===0?e.jsx("div",{className:"flex items-center justify-center h-64 text-danger",children:e.jsxs("span",{children:["Erreur: ",M]})}):e.jsxs("div",{className:"relative flex h-full gap-5 sm:min-h-0",children:[e.jsx(Qt,{entityName:l,entityNamePlural:b,entityIcon:u,accountNumber:n,entitySlug:d,showSidebar:S.showSidebar!==!1,onToggleSidebar:()=>be("showSidebar",!S.showSidebar),filters:oe,activeFilters:ue,onFilterChange:Me,columns:C,fieldFilters:v,onFieldFiltersChange:Ne,allRecords:j,sidebarWidth:S.sidebarWidth,onSidebarWidthChange:i=>be("sidebarWidth",i)}),e.jsxs("div",{className:`panel p-4 flex-1 flex flex-col h-full ${P==="calendar"?"overflow-auto":"overflow-hidden"}`,children:[e.jsx(Ct,{searchQuery:Y,onSearch:Ce,columns:C,preferences:S,onPreferencesChange:be,loading:A,accountNumber:n,entitySlug:d,viewId:s,showSidebar:S.showSidebar!==!1,onToggleSidebar:()=>be("showSidebar",!S.showSidebar),activeView:P,onViewChange:Ge,enabledViews:S.enabledViews||["table","kanban","notes"],onEnabledViewsChange:i=>be("enabledViews",i),hasActiveFilters:Object.keys(ue).filter(i=>i!=="__favourites").length>0||v.length>0,onOpenSaveView:()=>ne(!0)}),e.jsx(tr,{savedViews:Z,activeViewId:q,onSelectView:he,onCreateView:G,onDeleteView:pe,onRenameView:ke,onUpdateViewFilters:we,hasActiveFilters:Object.keys(ue).filter(i=>i!=="__favourites").length>0||v.length>0,activeFilters:ue,fieldFilters:v,sidebarFilters:oe,columns:C,externalOpenCreate:K,onCloseExternalCreate:()=>ne(!1)}),e.jsx("div",{className:`flex-1 flex flex-col mt-4 ${P==="calendar"?"overflow-auto":"overflow-hidden"}`,children:P==="kanban"?e.jsx(It,{records:x,columns:C,accountNumber:n,entitySlug:d,viewId:s,entityData:te}):P==="calendar"?e.jsx(Yt,{records:x,columns:C,accountNumber:n,entitySlug:d,entityData:te}):P==="notes"?e.jsx(At,{records:x,accountNumber:n,entitySlug:d}):e.jsxs("div",{className:"dataTable-wrapper flex-1 flex flex-col overflow-hidden",children:[e.jsx("div",{className:"dataTable-container flex-1 overflow-auto",ref:xe,children:e.jsx(Nt,{records:h,columns:it,virtualizer:We,sort:S.sort,onSort:i=>{const y=S.sort.field===i&&S.sort.direction==="asc"?"desc":"asc";be("sort",{field:i,direction:y})},onColumnReorder:nt,density:S.density,titleDisplay:S.titleDisplay||"avatar",entityIcon:u,accountNumber:n,entitySlug:d,selectedIds:H,onToggleSelect:et,onSelectAll:tt,allPageSelected:at,showCheckboxes:S.showCheckboxes!==!1})}),e.jsxs("div",{className:"dataTable-bottom flex items-center justify-between border-t pt-4 dark:border-gray-800",children:[e.jsxs("div",{className:"dataTable-info text-gray-500 dark:text-gray-400",children:["Affichage de ",(z.page-1)*z.limit+1," à ",Math.min(z.page*z.limit,z.total)," sur ",z.total]}),e.jsx("nav",{className:"dataTable-pagination",children:e.jsxs("ul",{className:"inline-flex items-center space-x-1 rtl:space-x-reverse",children:[e.jsx("li",{children:e.jsx("button",{onClick:()=>Re(z.page-1),disabled:z.page<=1,className:"flex justify-center font-semibold p-2 rounded-full transition bg-white-light text-dark hover:text-white hover:bg-primary dark:text-white-light dark:bg-[#191e3a] dark:hover:bg-primary disabled:opacity-50",children:"«"})}),Array.from({length:Math.min(z.pages,5)},(i,y)=>{let I;return z.pages<=5||z.page<=3?I=y+1:z.page>=z.pages-2?I=z.pages-4+y:I=z.page-2+y,e.jsx("li",{children:e.jsx("button",{onClick:()=>Re(I),className:`flex justify-center font-semibold px-3.5 py-2 rounded-full transition ${I===z.page?"bg-primary text-white dark:bg-primary dark:text-white-light":"bg-white-light text-dark hover:text-white hover:bg-primary dark:text-white-light dark:bg-[#191e3a] dark:hover:bg-primary"}`,children:I})},I)}),e.jsx("li",{children:e.jsx("button",{onClick:()=>Re(z.page+1),disabled:z.page>=z.pages,className:"flex justify-center font-semibold p-2 rounded-full transition bg-white-light text-dark hover:text-white hover:bg-primary dark:text-white-light dark:bg-[#191e3a] dark:hover:bg-primary disabled:opacity-50",children:"»"})})]})})]})]})})]}),H.size>0&&e.jsxs("div",{className:"bulk-action-bar",style:{position:"fixed",bottom:"24px",left:"50%",transform:"translateX(-50%)",zIndex:99999,display:"flex",alignItems:"center",gap:"12px",padding:"10px 20px",borderRadius:"14px",background:"linear-gradient(135deg, #1b2e4b 0%, #0e1726 100%)",boxShadow:"0 8px 32px rgba(0,0,0,0.3), 0 0 0 1px rgba(67,97,238,0.2)",animation:"bulkBarSlideUp 0.3s cubic-bezier(0.16,1,0.3,1)",backdropFilter:"blur(12px)"},children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"8px"},children:[e.jsx("div",{style:{width:28,height:28,borderRadius:"8px",background:"rgba(67,97,238,0.2)",color:"#4361ee",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"12px",fontWeight:700},children:H.size}),e.jsxs("span",{style:{color:"#e0e6ed",fontSize:"13px",fontWeight:500,whiteSpace:"nowrap"},children:["sélectionné",H.size>1?"s":""]})]}),e.jsx("div",{style:{width:1,height:24,background:"rgba(255,255,255,0.1)"}}),H.size<x.length&&e.jsxs("button",{onClick:rt,style:{padding:"6px 12px",borderRadius:"8px",border:"1px solid rgba(67,97,238,0.3)",background:"rgba(67,97,238,0.1)",color:"#93b4fd",fontSize:"12px",fontWeight:600,cursor:"pointer",transition:"all 0.15s",whiteSpace:"nowrap"},onMouseEnter:i=>{i.target.style.background="rgba(67,97,238,0.2)",i.target.style.color="#b8cffe"},onMouseLeave:i=>{i.target.style.background="rgba(67,97,238,0.1)",i.target.style.color="#93b4fd"},children:["Tout sélectionner (",x.length,")"]}),e.jsx("div",{style:{width:1,height:24,background:"rgba(255,255,255,0.1)"}}),e.jsxs("button",{onClick:ot,disabled:L,style:{display:"flex",alignItems:"center",gap:"6px",padding:"6px 14px",borderRadius:"8px",border:"none",background:"rgba(231,81,90,0.15)",color:"#ff6b6b",fontSize:"12px",fontWeight:600,cursor:L?"wait":"pointer",transition:"all 0.15s",whiteSpace:"nowrap",opacity:L?.6:1},onMouseEnter:i=>{L||(i.target.style.background="rgba(231,81,90,0.25)",i.target.style.color="#ff8a8a")},onMouseLeave:i=>{i.target.style.background="rgba(231,81,90,0.15)",i.target.style.color="#ff6b6b"},children:[e.jsxs("svg",{viewBox:"0 0 24 24",fill:"none",style:{width:14,height:14},children:[e.jsx("path",{d:"M20.5 6H3.5",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"}),e.jsx("path",{d:"M18.833 8.5L18.373 15.4C18.196 18.054 18.108 19.381 17.243 20.19C16.378 21 15.048 21 12.387 21H11.613C8.952 21 7.622 21 6.757 20.19C5.892 19.381 5.804 18.054 5.627 15.4L5.167 8.5",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"})]}),L?"Suppression...":"Supprimer"]}),e.jsx("div",{style:{width:1,height:24,background:"rgba(255,255,255,0.1)"}}),e.jsx("button",{onClick:st,style:{width:28,height:28,borderRadius:"8px",border:"none",background:"rgba(255,255,255,0.08)",color:"#888ea8",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",transition:"all 0.15s"},onMouseEnter:i=>{i.target.style.background="rgba(255,255,255,0.15)",i.target.style.color="#e0e6ed"},onMouseLeave:i=>{i.target.style.background="rgba(255,255,255,0.08)",i.target.style.color="#888ea8"},title:"Désélectionner tout",children:e.jsx("svg",{viewBox:"0 0 24 24",fill:"none",style:{width:14,height:14},children:e.jsx("path",{d:"M18 6L6 18M6 6L18 18",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round"})})})]}),p&&e.jsxs("div",{style:{position:"fixed",bottom:H.size>0?"80px":"24px",right:"24px",zIndex:99999,padding:"10px 20px",borderRadius:"10px",fontSize:"13px",fontWeight:500,color:"#fff",background:p.type==="error"?"#e7515a":"#00ab55",boxShadow:"0 4px 20px rgba(0,0,0,0.15)",animation:"toastSlideIn 0.25s ease-out",display:"flex",alignItems:"center",gap:"8px",transition:"bottom 0.3s ease"},children:[e.jsx("svg",{viewBox:"0 0 24 24",fill:"none",style:{width:16,height:16,flexShrink:0},children:p.type==="error"?e.jsx("path",{d:"M12 8V12M12 16H12.01M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"}):e.jsx("path",{d:"M5 13L9 17L19 7",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round"})}),p.message]}),e.jsx("style",{children:`
                @keyframes toastSlideIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes bulkBarSlideUp {
                    from { opacity: 0; transform: translate(-50%, 20px); }
                    to { opacity: 1; transform: translate(-50%, 0); }
                }
                /* Bulk select checkboxes */
                .bulk-checkbox-wrapper {
                    position: relative;
                    cursor: pointer;
                    user-select: none;
                }
                .bulk-checkbox {
                    position: absolute;
                    opacity: 0;
                    width: 0;
                    height: 0;
                }
                .bulk-checkbox-custom {
                    display: inline-block;
                    width: 16px;
                    height: 16px;
                    border-radius: 4px;
                    border: 2px solid #d1d5db;
                    background: #fff;
                    transition: all 0.15s ease;
                    position: relative;
                }
                .dark .bulk-checkbox-custom {
                    border-color: #4b5563;
                    background: #1f2937;
                }
                .bulk-checkbox:checked + .bulk-checkbox-custom {
                    background: #4361ee;
                    border-color: #4361ee;
                }
                .bulk-checkbox:checked + .bulk-checkbox-custom::after {
                    content: '';
                    position: absolute;
                    left: 4px;
                    top: 1px;
                    width: 5px;
                    height: 9px;
                    border: solid #fff;
                    border-width: 0 2px 2px 0;
                    transform: rotate(45deg);
                }
                .bulk-checkbox-wrapper:hover .bulk-checkbox-custom {
                    border-color: #4361ee;
                }
                .bulk-row-selected {
                    background: rgba(67, 97, 238, 0.04) !important;
                }
                .bulk-row-selected td {
                    background: rgba(67, 97, 238, 0.04) !important;
                }
                .dark .bulk-row-selected {
                    background: rgba(67, 97, 238, 0.08) !important;
                }
                .dark .bulk-row-selected td {
                    background: rgba(67, 97, 238, 0.08) !important;
                }
            `})]})}function Ze(){document.querySelectorAll('[data-island="records-grid"]').forEach(r=>{if(r.dataset.mounted==="1")return;r.dataset.mounted="1";const n={accountId:r.dataset.accountId,accountNumber:r.dataset.accountNumber,entityId:r.dataset.entityId,viewId:r.dataset.viewId,entityName:r.dataset.entityName||"Records",entityNamePlural:r.dataset.entityNamePlural||"",entitySlug:r.dataset.entitySlug||"records"};console.log("[RecordsGrid Island] Mounting:",n),lt(r).render(e.jsx($e.StrictMode,{children:e.jsx(ar,{...n})}))})}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",Ze):Ze();
