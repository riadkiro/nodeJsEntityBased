import{r,j as e,a as _e,R as $e,c as dt}from"./chunks/client-CkWOIrXP.js";import{u as ct}from"./chunks/index-CjVSFo3p.js";import{u as ut,a as Te,D as pt,c as ft,b as xt,d as ht,s as mt,K as gt,T as bt,M as vt,e as kt,S as yt,v as wt,f as jt,C as Ct}from"./chunks/sortable.esm-DQ9-A8Dw.js";const Ve=[{id:"table",label:"Tableau",icon:e.jsxs("svg",{viewBox:"0 0 24 24",fill:"none",className:"h-4 w-4",children:[e.jsx("path",{d:"M3 7H21",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"}),e.jsx("path",{d:"M3 12H21",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"}),e.jsx("path",{d:"M3 17H21",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"})]})},{id:"kanban",label:"Kanban",icon:e.jsxs("svg",{viewBox:"0 0 24 24",fill:"none",className:"h-4 w-4",children:[e.jsx("rect",{x:"3",y:"3",width:"5",height:"18",rx:"1",stroke:"currentColor",strokeWidth:"1.5"}),e.jsx("rect",{x:"10",y:"3",width:"5",height:"12",rx:"1",stroke:"currentColor",strokeWidth:"1.5"}),e.jsx("rect",{x:"17",y:"3",width:"4",height:"15",rx:"1",stroke:"currentColor",strokeWidth:"1.5"})]})},{id:"notes",label:"Notes",icon:e.jsxs("svg",{viewBox:"0 0 24 24",fill:"none",className:"h-4 w-4",children:[e.jsx("path",{d:"M2 12C2 7.28595 2 4.92893 3.46447 3.46447C4.92893 2 7.28595 2 12 2C16.714 2 19.0711 2 20.5355 3.46447C22 4.92893 22 7.28595 22 12C22 16.714 22 19.0711 20.5355 20.5355C19.0711 22 16.714 22 12 22C7.28595 22 4.92893 22 3.46447 20.5355C2 19.0711 2 16.714 2 12Z",stroke:"currentColor",strokeWidth:"1.5"}),e.jsx("path",{opacity:"0.5",d:"M2 12H22",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"}),e.jsx("path",{opacity:"0.5",d:"M12 2V22",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"})]})},{id:"calendar",label:"Calendrier",icon:e.jsxs("svg",{viewBox:"0 0 24 24",fill:"none",className:"h-4 w-4",children:[e.jsx("rect",{x:"3",y:"4",width:"18",height:"18",rx:"2",stroke:"currentColor",strokeWidth:"1.5"}),e.jsx("path",{d:"M16 2V6M8 2V6M3 10H21",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"}),e.jsx("circle",{cx:"12",cy:"16",r:"1",fill:"currentColor"}),e.jsx("circle",{cx:"16",cy:"16",r:"1",fill:"currentColor"}),e.jsx("circle",{cx:"8",cy:"16",r:"1",fill:"currentColor"})]})}];function Nt({searchQuery:t,onSearch:o,columns:a,preferences:s,onPreferencesChange:g,loading:S,accountNumber:h,entitySlug:M,viewId:p,showSidebar:x,onToggleSidebar:b,activeView:c,onViewChange:T,enabledViews:j=["table","kanban","notes"],onEnabledViewsChange:R,hasActiveFilters:E=!1,onOpenSaveView:G}){var X,se,de;const[_,m]=r.useState(!1),[Z,P]=r.useState(!1),[A,Y]=r.useState(!1),[f,l]=r.useState(!1),[q,J]=r.useState(""),V=r.useRef(null),C=r.useRef(null),v=r.useRef(null),D=r.useRef(null),W=r.useRef(null),oe=r.useRef(null),ne=r.useRef(null),w=r.useRef(null),O=()=>{m(!1),P(!1),Y(!1),l(!1)};r.useEffect(()=>{const d=H=>{H.key==="Escape"&&O()};return document.addEventListener("keydown",d),()=>document.removeEventListener("keydown",d)},[]);const U=(d,H,Q,$)=>{r.useEffect(()=>{const me=ee=>{d&&H.current&&!H.current.contains(ee.target)&&Q.current&&!Q.current.contains(ee.target)&&$(!1)};return d&&setTimeout(()=>document.addEventListener("mousedown",me),0),()=>document.removeEventListener("mousedown",me)},[d])};U(_,W,V,m),U(Z,oe,C,P),U(A,ne,v,Y),U(f,w,D,l);const i=d=>{if(d==="table")return;const H=j.includes(d)?j.filter(Q=>Q!==d):[...j,d];R(H),c===d&&!H.includes(d)&&T("table")},N=Ve.filter(d=>j.includes(d.id)),L=d=>{const H=s.columns.some($=>$.id===d);let Q;H?Q=s.columns.map($=>$.id===d?{...$,visible:!$.visible}:$):Q=[...s.columns,{id:d,visible:!1}],g("columns",Q)},F=d=>{if(!(d!=null&&d.current))return{top:0,right:0};const H=d.current.getBoundingClientRect();return{top:H.bottom+8,right:window.innerWidth-H.right}},K=q.trim()?a.filter(d=>d.name.toLowerCase().includes(q.toLowerCase())):a;return e.jsxs("div",{className:"dataTable-top flex items-center mb-0 justify-between gap-2",children:[e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsxs("a",{href:`/account/${h}/record/${M}/add`,className:"btn-add-expandable block rounded-full p-2 bg-white-light/40 hover:bg-white-light/90 hover:text-primary dark:bg-dark/40 dark:hover:bg-dark/60",title:"Ajouter",children:[e.jsx("svg",{className:"btn-add-icon",viewBox:"0 0 24 24",fill:"none",children:e.jsx("path",{d:"M12 5V19M5 12H19",stroke:"currentColor",strokeWidth:"2.5",strokeLinecap:"round"})}),e.jsx("span",{className:"btn-add-label",children:"Ajouter"})]}),e.jsxs("div",{className:"dataTable-search relative w-64",style:{marginLeft:0},children:[e.jsxs("svg",{className:"absolute left-4 top-1/2 ml-2 -translate-y-1/2 h-4 w-4 text-gray-400",viewBox:"0 0 24 24",fill:"none",children:[e.jsx("circle",{cx:"11",cy:"11",r:"8",stroke:"currentColor",strokeWidth:"1.5"}),e.jsx("path",{d:"M16.5 16.5L21 21",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"})]}),e.jsx("input",{type:"text",value:t,onChange:d=>o(d.target.value),placeholder:"Rechercher...",className:"dataTable-input form-input w-full pl-11 pr-10",style:{"padding-left":"33px"}}),S&&e.jsx("div",{className:"absolute right-3 top-1/2 -translate-y-1/2",children:e.jsx("div",{className:"animate-spin rounded-full h-4 w-4 border-b-2 border-primary"})})]})]}),e.jsxs("div",{className:"flex items-center gap-2",children:[N.map(d=>e.jsx("button",{type:"button",onClick:()=>T(d.id),title:d.label,className:`block rounded-full p-2 transition-all ${c===d.id?"bg-primary/20 text-primary":"bg-white-light/40 hover:bg-white-light/90 hover:text-primary dark:bg-dark/40 dark:hover:bg-dark/60"}`,children:d.icon},d.id)),e.jsx("button",{ref:D,type:"button",onClick:()=>{l(!f),m(!1),P(!1),Y(!1)},className:`block rounded-full p-2 transition-all ${f?"bg-primary/20 text-primary":"bg-white-light/40 hover:bg-white-light/90 hover:text-primary dark:bg-dark/40 dark:hover:bg-dark/60"}`,title:"Configurer les vues",children:e.jsxs("svg",{className:"h-4 w-4",viewBox:"0 0 24 24",fill:"none",children:[e.jsx("circle",{cx:"12",cy:"12",r:"3",stroke:"currentColor",strokeWidth:"1.5"}),e.jsx("path",{d:"M12 2V4M12 20V22M2 12H4M20 12H22M4.93 4.93L6.34 6.34M17.66 17.66L19.07 19.07M4.93 19.07L6.34 17.66M17.66 6.34L19.07 4.93",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"})]})}),e.jsx("div",{className:"w-px h-5 bg-gray-200 dark:bg-gray-700 mx-0.5"}),e.jsx("button",{type:"button",onClick:G,className:`block rounded-full p-2 transition-all ${E?"bg-primary/20 text-primary":"bg-white-light/40 hover:bg-white-light/90 hover:text-primary dark:bg-dark/40 dark:hover:bg-dark/60"}`,title:"Filtrer & enregistrer la vue",children:e.jsx("svg",{className:"h-4 w-4",viewBox:"0 0 24 24",fill:"none",children:e.jsx("path",{d:"M22 3H2L10 12.46V19L14 21V12.46L22 3Z",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round"})})}),c==="table"&&(()=>{var H,Q;const d=((H=s.sort)==null?void 0:H.field)!=="createdAt"||((Q=s.sort)==null?void 0:Q.direction)!=="desc";return e.jsx("button",{ref:C,type:"button",onClick:()=>{P(!Z),m(!1),Y(!1),l(!1)},className:`block rounded-full p-2 transition-all ${Z||d?"bg-primary/20 text-primary":"bg-white-light/40 hover:bg-white-light/90 hover:text-primary dark:bg-dark/40 dark:hover:bg-dark/60"}`,title:"Trier",children:e.jsxs("svg",{className:"h-4 w-4",viewBox:"0 0 24 24",fill:"none",children:[e.jsx("path",{d:"M16 18L16 6M16 6L20 10M16 6L12 10",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round"}),e.jsx("path",{d:"M8 6L8 18M8 18L12 14M8 18L4 14",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round"})]})})})(),e.jsx("button",{ref:V,type:"button",onClick:()=>{m(!_),P(!1),Y(!1),l(!1)},className:`block rounded-full p-2 transition-all ${_?"bg-primary/20 text-primary":"bg-white-light/40 hover:bg-white-light/90 hover:text-primary dark:bg-dark/40 dark:hover:bg-dark/60"}`,title:"Mode d'affichage",children:e.jsxs("svg",{className:"h-4 w-4",viewBox:"0 0 24 24",fill:"none",children:[e.jsx("path",{d:"M3 7H21",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"}),e.jsx("path",{d:"M6 12H18",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"}),e.jsx("path",{d:"M10 17H14",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"})]})}),c==="table"&&e.jsx("button",{ref:v,type:"button",onClick:()=>{Y(!A),m(!1),P(!1),l(!1)},className:`block rounded-full p-2 transition-all ${A?"bg-primary/20 text-primary":"bg-white-light/40 hover:bg-white-light/90 hover:text-primary dark:bg-dark/40 dark:hover:bg-dark/60"}`,title:"Colonnes visibles",children:e.jsxs("svg",{className:"h-4 w-4",viewBox:"0 0 24 24",fill:"none",children:[e.jsx("path",{d:"M9 3H4C3.44772 3 3 3.44772 3 4V11C3 11.5523 3.44772 12 4 12H9C9.55228 12 10 11.5523 10 11V4C10 3.44772 9.55228 3 9 3Z",stroke:"currentColor",strokeWidth:"1.5"}),e.jsx("path",{d:"M20 3H15C14.4477 3 14 3.44772 14 4V7C14 7.55228 14.4477 8 15 8H20C20.5523 8 21 7.55228 21 7V4C21 3.44772 20.5523 3 20 3Z",stroke:"currentColor",strokeWidth:"1.5"}),e.jsx("path",{d:"M20 12H15C14.4477 12 14 12.4477 14 13V20C14 20.5523 14.4477 21 15 21H20C20.5523 21 21 20.5523 21 20V13C21 12.4477 20.5523 12 20 12Z",stroke:"currentColor",strokeWidth:"1.5"}),e.jsx("path",{d:"M9 16H4C3.44772 16 3 16.4477 3 17V20C3 20.5523 3.44772 21 4 21H9C9.55228 21 10 20.5523 10 20V17C10 16.4477 9.55228 16 9 16Z",stroke:"currentColor",strokeWidth:"1.5"})]})}),e.jsxs("button",{type:"button",onClick:b,className:"btn-sidebar-toggle block rounded-full p-2 bg-white-light/40 hover:bg-white-light/90 hover:text-primary dark:bg-dark/40 dark:hover:bg-dark/60",title:x?"Masquer le panneau":"Afficher le panneau",children:[e.jsxs("svg",{className:"btn-sidebar-icon",viewBox:"0 0 24 24",fill:"none",children:[e.jsx("rect",{x:"3",y:"3",width:"18",height:"18",rx:"2",stroke:"currentColor",strokeWidth:"1.5"}),e.jsx("path",{d:"M9 3V21",stroke:"currentColor",strokeWidth:"1.5"})]}),e.jsx("span",{className:"btn-sidebar-label",children:x?"Masquer":"Panneau"})]})]}),Z&&_e.createPortal(e.jsxs(e.Fragment,{children:[e.jsx("div",{className:"fixed inset-0",style:{zIndex:9998},onClick:()=>P(!1)}),e.jsxs("div",{ref:oe,className:"fixed rounded-xl shadow-xl p-4 w-72 bg-white dark:bg-[#0e1726] border border-gray-100 dark:border-white/10",style:{zIndex:9999,top:F(C).top,right:F(C).right,animation:"popoverSlide 0.15s ease-out"},children:[e.jsx("div",{className:"text-xs font-medium text-gray-500 dark:text-white-dark mb-2",children:"Trier par"}),e.jsxs("div",{className:"flex gap-2",children:[e.jsxs("select",{value:((X=s.sort)==null?void 0:X.field)||"createdAt",onChange:d=>g("sort",{...s.sort,field:d.target.value}),className:"flex-1 px-2 py-1.5 text-xs border border-gray-200 dark:border-white/10 rounded-lg bg-white dark:bg-[#1b2e4b] text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary/50",children:[e.jsx("option",{value:"createdAt",children:"Date de création"}),e.jsx("option",{value:"title",children:"Titre"}),a.filter(d=>d.id!=="title"&&d.id!=="actions").map(d=>e.jsx("option",{value:d.id,children:d.name},d.id))]}),e.jsx("button",{onClick:()=>{var d;return g("sort",{...s.sort,direction:((d=s.sort)==null?void 0:d.direction)==="asc"?"desc":"asc"})},className:"p-1.5 border border-gray-200 dark:border-white/10 rounded-lg bg-white dark:bg-[#1b2e4b] hover:bg-gray-50 dark:hover:bg-[#253b5c] transition-all",title:((se=s.sort)==null?void 0:se.direction)==="asc"?"Croissant":"Décroissant",children:e.jsx("svg",{className:`h-4 w-4 text-gray-600 dark:text-white transition-transform ${((de=s.sort)==null?void 0:de.direction)==="asc"?"rotate-180":""}`,viewBox:"0 0 24 24",fill:"none",children:e.jsx("path",{d:"M12 5V19M12 19L6 13M12 19L18 13",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round"})})}),e.jsx("button",{onClick:()=>g("sort",{field:"createdAt",direction:"desc"}),className:"p-1.5 border border-gray-200 dark:border-white/10 rounded-lg bg-white dark:bg-[#1b2e4b] hover:bg-red-50 hover:border-red-300 hover:text-red-500 dark:hover:bg-red-900/20 transition-all",title:"Réinitialiser le tri",children:e.jsxs("svg",{className:"h-4 w-4 text-gray-600 dark:text-white",viewBox:"0 0 24 24",fill:"none",children:[e.jsx("path",{d:"M4.06189 13C4.02104 12.6724 4 12.3387 4 12C4 7.58172 7.58172 4 12 4C14.5006 4 16.7332 5.14727 18.2002 6.94416M19.9381 11C19.979 11.3276 20 11.6613 20 12C20 16.4183 16.4183 20 12 20C9.49944 20 7.26681 18.8527 5.79984 17.0558",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round"}),e.jsx("path",{d:"M15 7H19V3",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round"}),e.jsx("path",{d:"M9 17H5V21",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round"})]})})]})]})]}),document.body),_&&_e.createPortal(e.jsxs(e.Fragment,{children:[e.jsx("div",{className:"fixed inset-0",style:{zIndex:9998},onClick:()=>m(!1)}),e.jsxs("div",{ref:W,className:"fixed rounded-xl shadow-xl p-4 w-72 bg-white dark:bg-[#0e1726] border border-gray-100 dark:border-white/10",style:{zIndex:9999,top:F(V).top,right:F(V).right,animation:"popoverSlide 0.15s ease-out"},children:[e.jsxs("div",{className:"mb-4",children:[e.jsx("div",{className:"text-xs font-medium text-gray-500 dark:text-white-dark mb-2",children:"Densité"}),e.jsx("div",{className:"flex gap-1",children:["compact","normal","comfortable"].map(d=>e.jsx("button",{onClick:()=>g("density",d),className:`flex-1 px-2 py-1.5 text-xs rounded-lg transition-all ${s.density===d?"bg-primary text-white":"bg-gray-100 dark:bg-dark/40 text-gray-600 dark:text-white-dark/70 hover:bg-gray-200 dark:hover:bg-dark/60"}`,children:d==="compact"?"Compact":d==="normal"?"Normal":"Confort"},d))})]}),e.jsxs("div",{className:"mb-4",children:[e.jsx("div",{className:"text-xs font-medium text-gray-500 dark:text-white-dark mb-2",children:"Lignes par page"}),e.jsx("div",{className:"flex gap-1",children:[10,25,50,100].map(d=>e.jsx("button",{onClick:()=>g("pageSize",d),className:`flex-1 px-2 py-1.5 text-xs rounded-lg transition-all ${s.pageSize===d?"bg-primary text-white":"bg-gray-100 dark:bg-dark/40 text-gray-600 dark:text-white-dark/70 hover:bg-gray-200 dark:hover:bg-dark/60"}`,children:d},d))})]})]})]}),document.body),A&&_e.createPortal(e.jsxs(e.Fragment,{children:[e.jsx("div",{className:"fixed inset-0",style:{zIndex:9998},onClick:()=>Y(!1)}),e.jsxs("div",{ref:ne,className:"fixed rounded-xl shadow-xl p-4 w-64 bg-white dark:bg-[#0e1726] border border-gray-100 dark:border-white/10",style:{zIndex:9999,top:F(v).top,right:F(v).right,animation:"popoverSlide 0.15s ease-out"},children:[e.jsx("div",{className:"text-xs font-medium text-gray-500 dark:text-white-dark mb-2",children:"Colonnes visibles"}),e.jsx("div",{className:"relative mb-2",children:e.jsx("input",{type:"text",value:q,onChange:d=>J(d.target.value),placeholder:"Filtrer...",className:"w-full px-3 py-1.5 text-xs border border-gray-200 dark:border-white/10 rounded-lg bg-white dark:bg-[#1b2e4b] text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary/50"})}),e.jsx("div",{className:"space-y-0.5 max-h-48 overflow-y-auto",children:K.map(d=>{const H=s.columns.find($=>$.id===d.id),Q=H?H.visible!==!1:!0;return e.jsxs("label",{className:"flex items-center gap-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 px-2 py-1.5 rounded-lg",children:[e.jsx("input",{type:"checkbox",checked:Q,onChange:()=>L(d.id),className:"form-checkbox text-primary w-3.5 h-3.5 rounded"}),e.jsx("span",{className:"text-xs text-gray-700 dark:text-gray-300",children:d.name})]},d.id)})}),e.jsx("div",{className:"border-t border-gray-100 dark:border-white/10 mt-3 mb-2"}),e.jsxs("div",{children:[e.jsx("div",{className:"text-xs font-medium text-gray-500 dark:text-white-dark mb-2",children:"Affichage titre"}),e.jsx("div",{className:"flex gap-1",children:[{value:"avatar",label:"Avatar"},{value:"icon",label:"Icône"},{value:"none",label:"Aucun"}].map(d=>e.jsx("button",{onClick:()=>g("titleDisplay",d.value),className:`flex-1 px-2 py-1.5 text-xs rounded-lg transition-all ${(s.titleDisplay||"avatar")===d.value?"bg-primary text-white":"bg-gray-100 dark:bg-dark/40 text-gray-600 dark:text-white-dark/70 hover:bg-gray-200 dark:hover:bg-dark/60"}`,children:d.label},d.value))})]}),e.jsx("div",{className:"border-t border-gray-100 dark:border-white/10 mt-3 mb-2"}),e.jsx("div",{children:e.jsxs("div",{className:"flex items-center justify-between",children:[e.jsx("span",{className:"text-xs font-medium text-gray-500 dark:text-white-dark",children:"Sélection multiple"}),e.jsx("button",{type:"button",onClick:()=>g("showCheckboxes",s.showCheckboxes===!1),style:{position:"relative",width:36,height:20,borderRadius:10,border:"none",cursor:"pointer",transition:"background 0.2s ease",background:s.showCheckboxes!==!1?"#4361ee":"#d1d5db",padding:0},children:e.jsx("span",{style:{position:"absolute",top:2,left:s.showCheckboxes!==!1?18:2,width:16,height:16,borderRadius:"50%",background:"#fff",boxShadow:"0 1px 3px rgba(0,0,0,0.2)",transition:"left 0.2s ease"}})})]})})]})]}),document.body),f&&_e.createPortal(e.jsxs(e.Fragment,{children:[e.jsx("div",{className:"fixed inset-0",style:{zIndex:9998},onClick:()=>l(!1)}),e.jsxs("div",{ref:w,className:"fixed rounded-xl shadow-xl p-4 w-64 bg-white dark:bg-[#0e1726] border border-gray-100 dark:border-white/10",style:{zIndex:9999,top:F(D).top,right:F(D).right,animation:"popoverSlide 0.15s ease-out"},children:[e.jsx("div",{className:"text-xs font-medium text-gray-500 dark:text-white-dark mb-3",children:"Vues disponibles"}),e.jsx("div",{className:"space-y-1",children:Ve.map(d=>{const H=j.includes(d.id),Q=d.id==="table";return e.jsxs("label",{className:`flex items-center gap-3 cursor-pointer px-2 py-2 rounded-lg transition-all ${Q?"opacity-60 cursor-not-allowed":"hover:bg-gray-50 dark:hover:bg-gray-800"}`,children:[e.jsx("input",{type:"checkbox",checked:H,onChange:()=>i(d.id),disabled:Q,className:"form-checkbox text-primary w-4 h-4 rounded"}),e.jsxs("span",{className:`flex items-center gap-2 text-sm ${H?"text-gray-700 dark:text-gray-300":"text-gray-400 dark:text-gray-600"}`,children:[d.icon,d.label]})]},d.id)})}),e.jsx("div",{className:"border-t border-gray-100 dark:border-white/10 mt-3 pt-2",children:e.jsx("p",{className:"text-[10px] text-gray-400 dark:text-gray-600",children:"Le tableau est toujours activé par défaut."})})]})]}),document.body),e.jsx("style",{children:`
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
            `})]})}function St({records:t,columns:o,virtualizer:a,sort:s,onSort:g,onColumnReorder:S,density:h,titleDisplay:M,entityIcon:p,accountNumber:x,entitySlug:b,selectedIds:c,onToggleSelect:T,onSelectAll:j,allPageSelected:R,showCheckboxes:E=!0}){var f;const[G,_]=r.useState(null),[m,Z]=r.useState(null),P=a.getVirtualItems(),A={compact:{rowHeight:36,cellClass:"py-1",fontSize:"text-xs",imageSize:"w-6 h-6",fontWeight:"font-medium"},normal:{rowHeight:44,cellClass:"py-2",fontSize:"text-sm",imageSize:"w-9 h-9",fontWeight:"font-semibold"},comfortable:{rowHeight:56,cellClass:"py-3",fontSize:"text-sm",imageSize:"w-9 h-9",fontWeight:"font-semibold"}},Y=A[h]||A.comfortable;return c&&c.size>0,e.jsxs("table",{className:"table-hover whitespace-nowrap dataTable-table w-full",children:[e.jsx("thead",{className:"sticky top-0 bg-white dark:bg-[#1b2e4b] z-10",children:e.jsxs("tr",{children:[E&&e.jsx("th",{style:{width:40,padding:"0 8px"},children:e.jsxs("label",{className:"bulk-checkbox-wrapper",style:{display:"flex",alignItems:"center",justifyContent:"center"},children:[e.jsx("input",{type:"checkbox",checked:R&&t.length>0,onChange:()=>j&&j(),className:"bulk-checkbox"}),e.jsx("span",{className:"bulk-checkbox-custom"})]})}),o.map(l=>{const q=(s==null?void 0:s.field)===l.id||l.id==="title"&&(s==null?void 0:s.field)==="title"||l.id==="createdAt"&&(s==null?void 0:s.field)==="createdAt",J=(s==null?void 0:s.direction)||"desc",V=G===l.id,C=m===l.id&&G!==l.id,v=l.id!=="actions";return e.jsx("th",{"data-sortable":l.sortable!==!1?"":void 0,"data-column-id":l.id,onDragEnter:D=>{D.preventDefault(),l.id!=="actions"&&G&&G!==l.id&&Z(l.id)},onDragOver:D=>{D.preventDefault()},onDrop:D=>{D.preventDefault(),G&&G!==l.id&&l.id!=="actions"&&S&&S(G,l.id),_(null),Z(null)},className:`px-2 ${V?"opacity-50":""} ${C?"border-l-2 border-l-primary bg-primary/5":""}`,style:{transition:"opacity 0.15s, border-color 0.15s, background 0.15s",...l.id==="actions"?{width:"1%",whiteSpace:"nowrap"}:{},...l.id==="title"?{minWidth:220}:{}},children:e.jsxs("div",{className:"flex items-center gap-1",children:[v&&e.jsx("span",{draggable:"true",onDragStart:D=>{_(l.id),D.dataTransfer.effectAllowed="move",D.dataTransfer.setData("text/plain",l.id)},onDragEnd:()=>{_(null),Z(null)},className:"cursor-grab text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300",children:e.jsxs("svg",{className:"h-3 w-3",viewBox:"0 0 24 24",fill:"currentColor",children:[e.jsx("circle",{cx:"9",cy:"6",r:"1.5"}),e.jsx("circle",{cx:"15",cy:"6",r:"1.5"}),e.jsx("circle",{cx:"9",cy:"12",r:"1.5"}),e.jsx("circle",{cx:"15",cy:"12",r:"1.5"}),e.jsx("circle",{cx:"9",cy:"18",r:"1.5"}),e.jsx("circle",{cx:"15",cy:"18",r:"1.5"})]})}),l.sortable!==!1?e.jsxs("a",{href:"#",className:"dataTable-sorter flex items-center gap-1",draggable:"false",onClick:D=>{D.preventDefault(),g(l.id)},children:[l.name,q&&e.jsx("svg",{className:`h-3 w-3 text-primary transition-transform ${J==="asc"?"rotate-180":""}`,viewBox:"0 0 24 24",fill:"none",children:e.jsx("path",{d:"M12 5V19M12 19L6 13M12 19L18 13",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round"})})]}):l.name]})},l.id)})]})}),e.jsxs("tbody",{children:[P.length>0&&P[0].start>0&&e.jsx("tr",{children:e.jsx("td",{colSpan:o.length+1,style:{height:P[0].start,padding:0}})}),P.map(l=>{const q=t[l.index];if(!q)return null;const J={compact:"4px 8px",normal:"8px 12px",comfortable:"12px 12px"}[h]||"12px 12px",V=c&&c.has(q._id);return e.jsxs("tr",{"data-index":l.index,ref:a.measureElement,style:{minHeight:Y.rowHeight},className:V?"bulk-row-selected":"",children:[E&&e.jsx("td",{style:{padding:"0 8px",width:40},children:e.jsxs("label",{className:"bulk-checkbox-wrapper",style:{display:"flex",alignItems:"center",justifyContent:"center"},onClick:C=>{C.preventDefault(),T&&T(q._id,l.index,C.shiftKey)},children:[e.jsx("input",{type:"checkbox",checked:V,readOnly:!0,className:"bulk-checkbox"}),e.jsx("span",{className:"bulk-checkbox-custom"})]})}),o.map(C=>e.jsx("td",{className:`${Y.fontSize}`,style:{padding:J,...C.id==="actions"?{width:"1%",whiteSpace:"nowrap"}:{},...C.id==="title"?{minWidth:220}:{}},children:Lt(q,C,x,b,Y,M,p)},C.id))]},q._id)}),P.length>0&&e.jsx("tr",{children:e.jsx("td",{colSpan:o.length+1,style:{height:Math.max(0,a.getTotalSize()-(((f=P[P.length-1])==null?void 0:f.end)||0)),padding:0}})})]})]})}function Lt(t,o,a,s,g,S,h){var M,p;switch(o.id){case"title":{const x=t.referenceTitle||t.title||"Sans titre";x.charAt(0).toUpperCase();const b=Math.abs(x.charCodeAt(0)||65)%35+1,c=t.image||`/assets/images/profile-${b}.jpeg`;return e.jsxs("div",{className:"flex items-center gap-2",children:[S==="avatar"&&e.jsx("img",{src:c,alt:x,className:`${g.imageSize} rounded-full max-w-none`}),S==="icon"&&h&&e.jsx("div",{className:`${g.imageSize} rounded-lg max-w-none flex items-center justify-center bg-primary/10 text-primary shrink-0`,children:e.jsx("iconify-icon",{icon:h,width:"16"})}),e.jsx("a",{href:`/account/${a}/record/${s}/${t._id}/edit`,className:`${g.fontWeight} hover:text-primary transition-colors truncate`,title:x,children:x})]})}case"createdAt":return new Date(t.createdAt).toLocaleDateString("fr-FR");case"actions":return e.jsxs("div",{className:"flex items-center gap-0",children:[e.jsx("a",{href:`/account/${a}/record/${s}/${t._id}`,className:"p-1 rounded-lg text-gray-500 hover:text-primary hover:bg-primary/10 transition-all",title:"Voir",children:e.jsxs("svg",{className:"h-4 w-4",viewBox:"0 0 24 24",fill:"none",children:[e.jsx("path",{d:"M15 12C15 13.6569 13.6569 15 12 15C10.3431 15 9 13.6569 9 12C9 10.3431 10.3431 9 12 9C13.6569 9 15 10.3431 15 12Z",stroke:"currentColor",strokeWidth:"1.5"}),e.jsx("path",{d:"M12 5C7.5 5 3.73 7.94 2 12C3.73 16.06 7.5 19 12 19C16.5 19 20.27 16.06 22 12C20.27 7.94 16.5 5 12 5Z",stroke:"currentColor",strokeWidth:"1.5"})]})}),e.jsx("a",{href:`/account/${a}/record/${s}/${t._id}/edit`,className:"p-1 rounded-lg text-gray-500 hover:text-info hover:bg-info/10 transition-all",title:"Modifier",children:e.jsx("svg",{className:"h-4 w-4",viewBox:"0 0 24 24",fill:"none",children:e.jsx("path",{d:"M16.862 4.487L18.55 2.8C19.33 2.02 20.59 2.02 21.37 2.8C22.15 3.58 22.15 4.84 21.37 5.62L19.681 7.307M16.862 4.487L4.162 17.187C3.882 17.467 3.682 17.818 3.592 18.198L2.732 21.596C2.642 21.966 2.952 22.296 3.322 22.226L6.892 21.556C7.242 21.486 7.572 21.306 7.832 21.046L20.513 8.366M16.862 4.487L19.681 7.307",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round"})})}),e.jsx("button",{type:"button",className:"p-1 rounded-lg text-gray-500 hover:text-danger hover:bg-danger/10 transition-all",title:"Supprimer",onClick:()=>{confirm("Êtes-vous sûr de vouloir supprimer cet enregistrement ?")&&console.log("Delete record:",t._id)},children:e.jsxs("svg",{className:"h-4 w-4",viewBox:"0 0 24 24",fill:"none",children:[e.jsx("path",{d:"M20.5 6H3.5",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"}),e.jsx("path",{d:"M18.833 8.5L18.373 15.4C18.196 18.054 18.108 19.381 17.243 20.19C16.378 21 15.048 21 12.387 21H11.613C8.952 21 7.622 21 6.757 20.19C5.892 19.381 5.804 18.054 5.627 15.4L5.167 8.5",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"}),e.jsx("path",{d:"M9.5 11L10 16",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"}),e.jsx("path",{d:"M14.5 11L14 16",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"}),e.jsx("path",{d:"M6.5 6C6.556 5.367 6.612 5.1 6.877 4.714C7.178 4.275 7.945 3.917 9.484 3.2L9.924 2.984C10.683 2.589 11.06 2.392 11.476 2.318C11.823 2.254 12.177 2.254 12.524 2.318C12.94 2.392 13.317 2.589 14.076 2.984L14.516 3.2C16.055 3.917 16.822 4.275 17.123 4.714C17.388 5.1 17.444 5.367 17.5 6",stroke:"currentColor",strokeWidth:"1.5"})]})})]});default:{if(o.id.startsWith("rel:")){const x=o.id.substring(4),c=(((M=t._denorm)==null?void 0:M.relations)||[]).find(j=>j.relationKey===x);if(((p=c==null?void 0:c.records)==null?void 0:p.length)>0)return e.jsx("div",{className:"flex flex-wrap gap-1",children:c.records.map((j,R)=>e.jsx("a",{href:`/account/${a}/record/${j.entitySlug||s}/${j._id}`,className:"text-primary hover:underline text-xs",children:j.title||"Sans titre"},R))});const T=(t.relations||[]).find(j=>j.relationKey===x);return T!=null&&T.value?"—":""}if(o.id.startsWith("classif:")){const x=o.id.substring(8),b=(t.classificationValues||[]).find(c=>{var j,R,E;return(((j=c.classificationId)==null?void 0:j.$oid)||((E=(R=c.classificationId)==null?void 0:R.toString)==null?void 0:E.call(R))||c.classificationId)===x});if(b!=null&&b.label){const c=b.color||"#888";return e.jsx("span",{className:"inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap",style:{backgroundColor:`${c}15`,color:c,border:`1px solid ${c}30`},children:b.label})}return b!=null&&b.value?e.jsx("span",{className:"inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20",children:b.value}):""}if(t.customFields){const x=t.customFields.find(c=>{var j;const T=((j=c.field_id)==null?void 0:j._id)||c.field_id;return(T==null?void 0:T.toString())===o.id});if(!x)return"";const b=x.value;if(b&&typeof b=="object"&&b._v){const c=[];return Object.entries(b).forEach(([T,j])=>{T==="_v"||T==="customText"||(Array.isArray(j)?j.forEach(R=>c.push(R)):j&&c.push(j))}),b.customText&&c.push(b.customText),e.jsx("div",{className:"flex flex-wrap gap-1",children:c.map((T,j)=>e.jsx("span",{className:"inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20",children:T},j))})}return b||""}return""}}}function Ae(t,o=.1){if(!t)return`rgba(99, 102, 241, ${o})`;const a=parseInt(t.slice(1,3),16),s=parseInt(t.slice(3,5),16),g=parseInt(t.slice(5,7),16);return`rgba(${a}, ${s}, ${g}, ${o})`}function Mt({field:t,record:o}){const a=(o.customFields||[]).find(g=>{var h;const S=((h=g.field_id)==null?void 0:h._id)||g.field_id;return(S==null?void 0:S.toString())===t.id});if(!a)return e.jsx("span",{className:"text-gray-400 dark:text-gray-600 text-sm italic",children:"—"});const s=a.value;if(s==null||s==="")return e.jsx("span",{className:"text-gray-400 dark:text-gray-600 text-sm italic",children:"—"});if(t.type==="date"||t.type==="datetime")try{return e.jsx("span",{className:"text-sm text-gray-700 dark:text-gray-300",children:new Date(s).toLocaleDateString("fr-FR")})}catch{return e.jsx("span",{className:"text-sm text-gray-700 dark:text-gray-300",children:String(s)})}return t.type==="boolean"||t.type==="checkbox"?e.jsxs("span",{className:`inline-flex items-center gap-1 text-sm ${s?"text-success":"text-gray-400"}`,children:[s?e.jsxs("svg",{width:"16",height:"16",viewBox:"0 0 24 24",fill:"none",children:[e.jsx("path",{d:"M9 12l2 2 4-4",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round"}),e.jsx("circle",{cx:"12",cy:"12",r:"10",stroke:"currentColor",strokeWidth:"1.5"})]}):e.jsx("svg",{width:"16",height:"16",viewBox:"0 0 24 24",fill:"none",children:e.jsx("circle",{cx:"12",cy:"12",r:"10",stroke:"currentColor",strokeWidth:"1.5"})}),s?"Oui":"Non"]}):t.type==="relation"?Array.isArray(s)?e.jsx("div",{className:"flex flex-wrap gap-1",children:s.map((g,S)=>e.jsx("span",{className:"inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-primary/10 text-primary font-medium",children:g.title||g.label||g.name||String(g)},S))}):e.jsx("span",{className:"text-sm text-gray-700 dark:text-gray-300",children:s.title||s.label||String(s)}):t.type==="number"?e.jsx("span",{className:"text-sm font-mono text-gray-700 dark:text-gray-300",children:Number(s).toLocaleString("fr-FR")}):e.jsx("span",{className:"text-sm text-gray-700 dark:text-gray-300",children:String(s)})}function _t({record:t,columns:o,accountNumber:a,entitySlug:s,onClose:g}){var _;const S=r.useRef(null),[h,M]=r.useState(!1);r.useEffect(()=>{requestAnimationFrame(()=>M(!0))},[]);const p=r.useCallback(()=>{M(!1),setTimeout(()=>g(),250)},[g]);if(r.useEffect(()=>{const m=Z=>{Z.key==="Escape"&&p()};return document.addEventListener("keydown",m),()=>document.removeEventListener("keydown",m)},[p]),!t)return null;const x=((_=t._id)==null?void 0:_.$oid)||t._id,b=t.referenceTitle||t.title||t.computedTitle||"Sans titre",c=t.description||"",T=t.createdAt?new Date(t.createdAt).toLocaleDateString("fr-FR",{day:"2-digit",month:"long",year:"numeric"}):null,j=t.updatedAt?new Date(t.updatedAt).toLocaleDateString("fr-FR",{day:"2-digit",month:"long",year:"numeric"}):null,R=(t.classificationValues||[]).filter(m=>m.optionLabel||m.label).map(m=>({label:m.optionLabel||m.label,color:m.optionColor||m.color||"#6366f1",classificationName:m.classificationName||"Classification"})),E={};R.forEach(m=>{E[m.classificationName]||(E[m.classificationName]=[]),E[m.classificationName].push(m)});const G=o.filter(m=>m.id!=="title"&&m.id!=="actions"&&!m.id.startsWith("class:"));return _e.createPortal(e.jsxs(e.Fragment,{children:[e.jsx("div",{className:`fixed inset-0 bg-black/40 backdrop-blur-[2px] transition-opacity duration-250 ${h?"opacity-100":"opacity-0"}`,style:{zIndex:1e4},onMouseDown:p,onTouchEnd:m=>{m.preventDefault(),p()}}),e.jsxs("div",{ref:S,className:`fixed right-0 top-0 h-full bg-white dark:bg-[#0e1726] shadow-2xl border-l border-gray-200 dark:border-gray-700 flex flex-col transition-transform duration-250 ease-out ${h?"translate-x-0":"translate-x-full"}`,style:{zIndex:10001,width:"min(520px, 90vw)"},onClick:m=>m.stopPropagation(),children:[e.jsxs("div",{className:"flex items-center justify-between gap-3 px-6 py-4 border-b border-gray-100 dark:border-gray-700/50 flex-shrink-0",children:[e.jsxs("div",{className:"flex items-center gap-2 min-w-0",children:[e.jsx("div",{className:"w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0",children:e.jsxs("svg",{width:"16",height:"16",viewBox:"0 0 24 24",fill:"none",children:[e.jsx("path",{d:"M2 12C2 7.28595 2 4.92893 3.46447 3.46447C4.92893 2 7.28595 2 12 2C16.714 2 19.0711 2 20.5355 3.46447C22 4.92893 22 7.28595 22 12C22 16.714 22 19.0711 20.5355 20.5355C19.0711 22 16.714 22 12 22C7.28595 22 4.92893 22 3.46447 20.5355C2 19.0711 2 16.714 2 12Z",stroke:"#4361ee",strokeWidth:"1.5"}),e.jsx("path",{d:"M8 12H16M12 8V16",stroke:"#4361ee",strokeWidth:"1.5",strokeLinecap:"round"})]})}),e.jsx("h3",{className:"text-base font-semibold text-gray-900 dark:text-white truncate",children:b})]}),e.jsxs("div",{className:"flex items-center gap-1 flex-shrink-0",children:[e.jsx("a",{href:`/account/${a}/record/${s}/${x}`,className:"p-2 rounded-lg text-gray-400 hover:text-primary hover:bg-primary/10 transition-all",title:"Ouvrir la page complète",children:e.jsxs("svg",{width:"16",height:"16",viewBox:"0 0 24 24",fill:"none",children:[e.jsx("path",{d:"M10 4H6C4.89543 4 4 4.89543 4 6V18C4 19.1046 4.89543 20 6 20H18C19.1046 20 20 19.1046 20 18V14",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"}),e.jsx("path",{d:"M14 4H20V10",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round"}),e.jsx("path",{d:"M20 4L11 13",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"})]})}),e.jsx("a",{href:`/account/${a}/record/${s}/${x}/edit`,className:"p-2 rounded-lg text-gray-400 hover:text-info hover:bg-info/10 transition-all",title:"Modifier",children:e.jsx("svg",{width:"16",height:"16",viewBox:"0 0 24 24",fill:"none",children:e.jsx("path",{d:"M16.862 4.487L18.55 2.8C19.33 2.02 20.59 2.02 21.37 2.8C22.15 3.58 22.15 4.84 21.37 5.62L19.681 7.307M16.862 4.487L4.162 17.187C3.882 17.467 3.682 17.818 3.592 18.198L2.732 21.596C2.642 21.966 2.952 22.296 3.322 22.226L6.892 21.556C7.242 21.486 7.572 21.306 7.832 21.046L20.513 8.366",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"})})}),e.jsx("button",{onClick:p,className:"p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all",title:"Fermer",children:e.jsx("svg",{width:"16",height:"16",viewBox:"0 0 24 24",fill:"none",children:e.jsx("path",{d:"M18 6L6 18M6 6L18 18",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round"})})})]})]}),e.jsxs("div",{className:"flex-1 overflow-y-auto",children:[Object.keys(E).length>0&&e.jsx("div",{className:"px-6 py-4 border-b border-gray-100 dark:border-gray-700/50",children:Object.entries(E).map(([m,Z])=>e.jsxs("div",{className:"mb-3 last:mb-0",children:[e.jsx("div",{className:"text-[11px] uppercase tracking-wider font-semibold text-gray-400 dark:text-gray-500 mb-1.5",children:m}),e.jsx("div",{className:"flex flex-wrap gap-1.5",children:Z.map((P,A)=>e.jsxs("span",{className:"inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium transition-all hover:scale-105",style:{backgroundColor:Ae(P.color,.15),color:P.color,border:`1px solid ${Ae(P.color,.3)}`},children:[e.jsx("span",{className:"w-2 h-2 rounded-full flex-shrink-0",style:{backgroundColor:P.color}}),P.label]},A))})]},m))}),c&&e.jsxs("div",{className:"px-6 py-4 border-b border-gray-100 dark:border-gray-700/50",children:[e.jsx("div",{className:"text-[11px] uppercase tracking-wider font-semibold text-gray-400 dark:text-gray-500 mb-2",children:"Description"}),e.jsx("p",{className:"text-sm text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-wrap",children:c})]}),e.jsxs("div",{className:"px-6 py-4",children:[e.jsx("div",{className:"text-[11px] uppercase tracking-wider font-semibold text-gray-400 dark:text-gray-500 mb-3",children:"Détails"}),e.jsxs("div",{className:"space-y-0",children:[G.map(m=>e.jsxs("div",{className:"flex items-start gap-3 py-2.5 border-b border-gray-50 dark:border-gray-800/50 last:border-0",children:[e.jsx("div",{className:"w-32 flex-shrink-0 text-xs font-medium text-gray-500 dark:text-gray-400 pt-0.5 truncate",children:m.name}),e.jsx("div",{className:"flex-1 min-w-0",children:e.jsx(Mt,{field:m,record:t})})]},m.id)),(t.relations||[]).map((m,Z)=>{var P;return e.jsxs("div",{className:"flex items-start gap-3 py-2.5 border-b border-gray-50 dark:border-gray-800/50 last:border-0",children:[e.jsx("div",{className:"w-32 flex-shrink-0 text-xs font-medium text-gray-500 dark:text-gray-400 pt-0.5 truncate",children:m.label||m.key||"Relation"}),e.jsx("div",{className:"flex-1 min-w-0",children:((P=m.records)==null?void 0:P.length)>0?e.jsx("div",{className:"flex flex-wrap gap-1",children:m.records.map((A,Y)=>e.jsx("a",{href:`/account/${a}/record/${m.entitySlug||s}/${A._id}`,className:"inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-primary/10 text-primary font-medium hover:bg-primary/20 transition-colors",children:A.referenceTitle||A.title||"Sans titre"},Y))}):e.jsx("span",{className:"text-gray-400 dark:text-gray-600 text-sm italic",children:"—"})})]},`rel-${Z}`)})]})]})]}),e.jsx("div",{className:"flex-shrink-0 px-6 py-3 border-t border-gray-100 dark:border-gray-700/50 bg-gray-50/50 dark:bg-[#0a0f1e]/50",children:e.jsxs("div",{className:"flex items-center justify-between text-[11px] text-gray-400 dark:text-gray-500",children:[e.jsxs("div",{className:"flex items-center gap-3",children:[T&&e.jsxs("span",{className:"flex items-center gap-1",children:[e.jsxs("svg",{width:"12",height:"12",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"1.5",children:[e.jsx("circle",{cx:"12",cy:"12",r:"10"}),e.jsx("path",{d:"M12 6V12L16 14",strokeLinecap:"round"})]}),"Créé le ",T]}),j&&e.jsxs("span",{className:"flex items-center gap-1",children:[e.jsx("svg",{width:"12",height:"12",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"1.5",children:e.jsx("path",{d:"M4.06 13C4.02 12.67 4 12.34 4 12C4 7.58 7.58 4 12 4C14.5 4 16.73 5.15 18.2 6.94M19.94 11C19.98 11.33 20 11.66 20 12C20 16.42 16.42 20 12 20C9.5 20 7.27 18.85 5.8 17.06",strokeLinecap:"round",strokeLinejoin:"round"})}),"Modifié le ",j]})]}),e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx("a",{href:`/account/${a}/record/${s}/${x}`,className:"px-3 py-1.5 bg-primary/10 text-primary text-xs font-medium rounded-lg hover:bg-primary/20 transition-colors",children:"Voir"}),e.jsx("a",{href:`/account/${a}/record/${s}/${x}/edit`,className:"px-3 py-1.5 bg-primary text-white text-xs font-medium rounded-lg hover:bg-primary/90 transition-colors",children:"Modifier"})]})]})})]})]}),document.body)}function We(t,o=.1){const a=/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(t);return a?`rgba(${parseInt(a[1],16)}, ${parseInt(a[2],16)}, ${parseInt(a[3],16)}, ${o})`:`rgba(128,128,128,${o})`}function Xe({record:t,accountNumber:o,entitySlug:a,isDragging:s=!1,onQuickView:g}){var q,J,V;const S=r.useRef(null),h=r.useRef(!1),M=String(((q=t._id)==null?void 0:q.$oid)||t._id),{attributes:p,listeners:x,setNodeRef:b,transform:c,transition:T,isDragging:j}=jt({id:M}),R={transform:Ct.Transform.toString(c),transition:T,opacity:s||j?.7:1,touchAction:"manipulation"},E=((J=t._id)==null?void 0:J.$oid)||t._id,G=t.referenceTitle||t.title||t.computedTitle||"Sans titre",_=t.description||"",m=t.dueDate?new Date(t.dueDate).toLocaleDateString("fr-FR",{day:"2-digit",month:"2-digit",year:"2-digit"}):null,Z=t.createdAt?new Date(t.createdAt).toLocaleDateString("fr-FR"):null,P=(t.classificationValues||[]).filter(C=>C.optionLabel||C.label).map(C=>({label:C.optionLabel||C.label,color:C.optionColor||C.color||"#6366f1"})),A=t.tags||[],Y=C=>{S.current={x:C.clientX,y:C.clientY,time:Date.now()},h.current=!1},f=C=>{if(S.current){const v=Math.abs(C.clientX-S.current.x),D=Math.abs(C.clientY-S.current.y);(v>5||D>5)&&(h.current=!0)}},l=C=>{if(!S.current)return;const v=Date.now()-S.current.time;!h.current&&v<400&&g&&!C.target.closest("a, button")&&setTimeout(()=>g(t),50),S.current=null};return e.jsxs("div",{ref:b,style:R,className:`kanban-card cursor-pointer rounded-lg transition-all group bg-white hover:shadow-md border border-gray-200/80 dark:border-0 dark:bg-dark/40 dark:hover:bg-dark/60 ${s||j?"shadow-lg ring-2 ring-primary/30 cursor-move":"shadow-sm"}`,"data-dnd":"card",onPointerDown:Y,onPointerMove:f,onPointerUp:l,...p,...x,children:[e.jsxs("div",{className:"p-3",children:[e.jsx("div",{className:"text-sm font-semibold text-gray-800 dark:text-white-dark leading-5 line-clamp-2 mb-2",children:G}),_&&e.jsx("p",{className:"text-xs text-gray-500 dark:text-white-dark/70 line-clamp-2 mb-2",children:_}),e.jsx("div",{className:"flex flex-wrap items-center gap-1 mb-2",children:P.length>0?P.slice(0,3).map((C,v)=>e.jsxs("span",{className:"inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded font-medium",style:{backgroundColor:We(C.color,.15),color:C.color},children:[e.jsx("span",{className:"w-1.5 h-1.5 rounded-full flex-shrink-0",style:{backgroundColor:C.color}}),C.label]},v)):A.length>0?A.slice(0,2).map((C,v)=>e.jsx("span",{className:"inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary",children:C},v)):e.jsxs("span",{className:"text-[10px] text-gray-400 dark:text-white-dark/50 italic flex items-center gap-1",children:[e.jsx("svg",{width:"10",height:"10",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"1.5",children:e.jsx("path",{d:"M4.172 3.172C3 4.343 3 6.229 3 10v4c0 3.771 0 5.657 1.172 6.828C5.343 22 7.229 22 11 22h2c3.771 0 5.657 0 6.828-1.172C21 19.657 21 17.771 21 14v-1.22c0-1.835 0-2.752-.379-3.55-.378-.798-1.07-1.39-2.455-2.576l-1.5-1.282c-1.97-1.687-2.955-2.531-4.136-2.605-.17-.01-.343-.01-.56 0-1.18.074-2.166.918-4.136 2.605L6.334 6.654"})}),"Sans tag"]})}),e.jsxs("div",{className:"flex items-center gap-3 text-xs text-gray-400 dark:text-white-dark/50",children:[((V=t.attachments)==null?void 0:V.length)>0&&e.jsxs("span",{className:"flex items-center gap-1",children:[e.jsx("svg",{width:"12",height:"12",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",children:e.jsx("path",{d:"M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"})}),t.attachments.length]}),e.jsxs("span",{className:"flex items-center gap-1",children:[e.jsx("svg",{width:"12",height:"12",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",children:e.jsx("path",{d:"M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"})}),"0"]})]})]}),e.jsxs("div",{className:"px-3 py-2 border-t border-gray-100 dark:border-0 flex items-center justify-between",children:[e.jsxs("div",{className:"flex items-center gap-1 text-[11px] text-gray-400 dark:text-white-dark/50",children:[e.jsxs("svg",{width:"12",height:"12",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"1.5",children:[e.jsx("rect",{x:"3",y:"4",width:"18",height:"18",rx:"2"}),e.jsx("path",{d:"M3 10H21"}),e.jsx("path",{d:"M8 2V6"}),e.jsx("path",{d:"M16 2V6"})]}),e.jsx("span",{children:m||Z||"—"})]}),e.jsxs("div",{className:"flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity",style:{pointerEvents:"auto"},children:[e.jsx("a",{href:`/account/${o}/record/${a}/${E}/edit`,className:"p-1 hover:text-info rounded hover:bg-gray-100 dark:hover:bg-gray-700",onClick:C=>C.stopPropagation(),onPointerDown:C=>C.stopPropagation(),children:e.jsx("svg",{width:"14",height:"14",viewBox:"0 0 24 24",fill:"none",children:e.jsx("path",{d:"M16.862 4.487L18.55 2.8C19.33 2.02 20.59 2.02 21.37 2.8C22.15 3.58 22.15 4.84 21.37 5.62L19.681 7.307M16.862 4.487L4.162 17.187C3.882 17.467 3.682 17.818 3.592 18.198L2.732 21.596C2.642 21.966 2.952 22.296 3.322 22.226L6.892 21.556C7.242 21.486 7.572 21.306 7.832 21.046L20.513 8.366M16.862 4.487L19.681 7.307",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"})})}),e.jsx("a",{href:`/account/${o}/record/${a}/${E}`,className:"p-1 hover:text-primary rounded hover:bg-gray-100 dark:hover:bg-gray-700",onClick:C=>C.stopPropagation(),onPointerDown:C=>C.stopPropagation(),children:e.jsxs("svg",{width:"14",height:"14",viewBox:"0 0 24 24",fill:"none",children:[e.jsx("path",{opacity:"0.5",d:"M3.27489 15.2957C2.42496 14.1915 2 13.6394 2 12C2 10.3606 2.42496 9.80853 3.27489 8.70433C4.97196 6.49956 7.81811 4 12 4C16.1819 4 19.028 6.49956 20.7251 8.70433C21.575 9.80853 22 10.3606 22 12C22 13.6394 21.575 14.1915 20.7251 15.2957C19.028 17.5004 16.1819 20 12 20C7.81811 20 4.97196 17.5004 3.27489 15.2957Z",stroke:"currentColor",strokeWidth:"1.5"}),e.jsx("path",{d:"M15 12C15 13.6569 13.6569 15 12 15C10.3431 15 9 13.6569 9 12C9 10.3431 10.3431 9 12 9C13.6569 9 15 10.3431 15 12Z",stroke:"currentColor",strokeWidth:"1.5"})]})})]})]})]})}function It({column:t,records:o,recordIds:a,accountNumber:s,entitySlug:g,onQuickView:S}){const{setNodeRef:h,isOver:M}=kt({id:String(t.id)}),p=typeof document<"u"&&document.documentElement.classList.contains("dark"),x=We(t.color,p?.12:.06),b=We(t.color,p?.3:.15);return e.jsxs("div",{ref:h,className:`flex-none rounded-lg overflow-hidden transition-all ${M?"ring-2 ring-primary/50 ring-offset-2":""}`,style:{width:"300px",maxWidth:"320px",backgroundColor:M?We(t.color,.15):x,border:`1px solid ${b}`},"data-dnd":"column",children:[e.jsx("div",{style:{height:"4px",backgroundColor:t.color}}),e.jsx("div",{className:"px-3 py-2 flex justify-between items-center",children:e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx("span",{className:"inline-flex items-center gap-1.5 px-2 py-0 rounded text-xs font-semibold uppercase tracking-wide",style:{backgroundColor:t.color,color:"#fff"},children:t.title}),e.jsx("span",{className:"text-xs text-gray-500 font-medium",children:o.length})]})}),e.jsx("div",{className:"px-2 pb-3",children:e.jsx(yt,{items:a,strategy:wt,children:e.jsx("div",{className:`space-y-2 min-h-[80px] rounded-lg transition-all ${M?"bg-primary/5 p-2":""}`,children:o.length===0?e.jsx("div",{className:"text-xs text-gray-300 dark:text-gray-600 text-center py-8 italic",children:"Aucun enregistrement"}):o.map(c=>{var T;return e.jsx(Xe,{record:c,accountNumber:s,entitySlug:g,onQuickView:S},((T=c._id)==null?void 0:T.$oid)||c._id)})})})}),e.jsx("div",{className:"px-3 pb-3",children:e.jsxs("button",{type:"button",className:"flex items-center gap-1 text-xs text-gray-400 hover:text-primary transition-colors",children:[e.jsx("svg",{width:"14",height:"14",viewBox:"0 0 24 24",fill:"none",children:e.jsx("path",{d:"M12 6V18M6 12H18",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round"})}),"Ajouter"]})})]})}function Wt({records:t,columns:o,accountNumber:a,entitySlug:s,viewId:g,entityData:S}){const h=r.useRef(null),M=r.useRef(null),[p,x]=r.useState(t),[b,c]=r.useState({}),[T,j]=r.useState(null),[R,E]=r.useState(null),G=r.useCallback(w=>{E(w)},[]);r.useEffect(()=>{x(t)},[t]);const _=r.useRef(!1),m=r.useRef(0),Z=r.useRef(0),P=r.useCallback(w=>{if(T||w.button!==0||w.target.closest('a, button, .dropdown, [data-dnd="card"]'))return;const O=h.current;O&&(_.current=!0,m.current=w.pageX-O.offsetLeft,Z.current=O.scrollLeft,O.style.cursor="grabbing")},[T]),A=r.useCallback(w=>{if(T){_.current=!1;return}if(!_.current)return;w.preventDefault();const O=h.current;if(!O)return;const i=(w.pageX-O.offsetLeft-m.current)*1.5;O.scrollLeft=Z.current-i},[T]),Y=r.useCallback(()=>{_.current=!1,h.current&&(h.current.style.cursor="grab")},[]),f=ut(Te(vt,{activationConstraint:{distance:8}}),Te(bt,{activationConstraint:{delay:500,tolerance:10}}),Te(gt,{coordinateGetter:mt})),l=r.useMemo(()=>{if(S){const i=S.statusClassification;if(i&&i.options&&i.options.length>0){const L=i.options.map(F=>({id:String(F._id),title:F.label,color:F.color||"#6366f1",optionId:String(F._id)}));return L.push({id:"__none__",title:"Sans Statut",color:"#9ca3af",optionId:"none"}),{classId:String(i._id),columns:L}}const N=S.classifications||[];for(const L of N)if(L.options&&L.options.length>0){const F=L.options.map(K=>({id:String(K._id),title:K.label,color:K.color||"#6366f1",optionId:String(K._id)}));return F.push({id:"__none__",title:"Non classé",color:"#9ca3af",optionId:"none"}),{classId:String(L._id),columns:F}}}const w={};p.forEach(i=>{(i.classificationValues||[]).forEach(N=>{var se,de;const L=((se=N.classificationId)==null?void 0:se.$oid)||N.classificationId||N.classification_id;if(!L)return;w[L]||(w[L]={count:0,options:{}}),w[L].count++;const F=N.optionLabel||N.label||"Sans label",K=N.optionColor||N.color||"#9ca3af",X=((de=N.optionId)==null?void 0:de.$oid)||N.optionId||F;w[L].options[F]||(w[L].options[F]={label:F,color:K,optionId:String(X),count:0}),w[L].options[F].count++})});let O=null,U=0;if(Object.entries(w).forEach(([i,N])=>{N.count>U&&(U=N.count,O=i)}),O&&w[O]){const N=Object.values(w[O].options).map(L=>({id:L.label,title:L.label,color:L.color,optionId:L.optionId}));return N.push({id:"__none__",title:"Sans classification",color:"#9ca3af",optionId:"none"}),{classId:O,columns:N}}return{classId:null,columns:[{id:"__all__",title:"Tous les enregistrements",color:"#4361ee",optionId:null}]}},[p,S]),q=r.useMemo(()=>{const w={};if(l.columns.forEach(O=>w[O.id]=[]),!l.classId)w.__all__=p;else{const O={};l.columns.forEach(i=>{i.optionId&&i.optionId!=="none"&&(O[String(i.optionId)]=i.id)});const U={};l.columns.forEach(i=>{U[i.title]=i.id}),p.forEach(i=>{var F;const L=(i.classificationValues||[]).find(K=>{var se;return(((se=K.classificationId)==null?void 0:se.$oid)||K.classificationId||K.classification_id)===l.classId});if(L){const K=String(((F=L.optionId)==null?void 0:F.$oid)||L.optionId||""),X=O[K];if(X&&w[X])w[X].push(i);else{const se=L.optionLabel||L.label||"Sans label";w[se]?w[se].push(i):w.__none__&&w.__none__.push(i)}}else w.__none__&&w.__none__.push(i)})}for(const O of Object.keys(w)){const U=b[O]||[];U.length&&w[O].sort((i,N)=>{var K,X;const L=U.indexOf(String(((K=i._id)==null?void 0:K.$oid)||i._id)),F=U.indexOf(String(((X=N._id)==null?void 0:X.$oid)||N._id));return L===-1&&F===-1?0:L===-1?1:F===-1?-1:L-F})}return w},[l,p,b]),J=r.useMemo(()=>{const w={};for(const O of l.columns)w[O.id]=(q[O.id]||[]).map(U=>{var i;return String(((i=U._id)==null?void 0:i.$oid)||U._id)});return w},[l.columns,q]),V=r.useCallback(w=>{var U;const O=String(w);for(const i of Object.keys(J))if((U=J[i])!=null&&U.includes(O))return i;return null},[J]),C=r.useMemo(()=>T&&p.find(w=>{var O;return String(((O=w._id)==null?void 0:O.$oid)||w._id)===String(T)})||null,[T,p]),v=r.useCallback(w=>{g&&(M.current&&clearTimeout(M.current),M.current=setTimeout(async()=>{try{await fetch(`/account/${a}/api/user/view-preferences`,{method:"POST",headers:{"Content-Type":"application/json"},credentials:"include",body:JSON.stringify({viewId:g,preferences:{kanban:{orderByColumn:w}}})})}catch{}},250))},[a,g]),D=r.useCallback(async(w,O)=>{if(!l.classId)return;const U=l.columns.find(i=>i.id===O);if(U)try{await fetch(`/account/${a}/api/record/update-classification`,{method:"POST",headers:{"Content-Type":"application/json"},credentials:"include",body:JSON.stringify({recordId:w,classificationId:l.classId,optionId:U.optionId==="none"?null:U.optionId})})}catch(i){console.error("[RecordsKanban] Update error:",i)}},[a,l]),W=w=>{j(String(w.active.id))},oe=()=>{j(null)},ne=w=>{const{active:O,over:U}=w;if(j(null),!U)return;const i=String(O.id),N=String(U.id),L=V(i),F=l.columns.some(H=>String(H.id)===N)?N:V(N);if(!L||!F)return;if(L===F){const H=J[L]||[],Q=H.indexOf(i),$=H.indexOf(N);if(Q===-1||$===-1||Q===$)return;const me=ht(H,Q,$),ee={...b,[L]:me};c(ee),v(ee);return}const K=[...J[L]||[]].filter(H=>H!==i),X=[...J[F]||[]],de=l.columns.some(H=>String(H.id)===N)?X.length:Math.max(0,X.indexOf(N));X.splice(de,0,i);const d={...b,[L]:K,[F]:X};if(c(d),v(d),l.classId){const H=l.columns.find(Q=>Q.id===F);x(Q=>Q.map($=>{var ee;if(String(((ee=$._id)==null?void 0:ee.$oid)||$._id)!==i)return $;const me=($.classificationValues||[]).filter(pe=>{var u;return(((u=pe.classificationId)==null?void 0:u.$oid)||pe.classificationId||pe.classification_id)!==l.classId});return F!=="__none__"&&H&&me.push({classificationId:l.classId,optionId:H.optionId,optionLabel:H.title,optionColor:H.color}),{...$,classificationValues:me}})),D(i,F)}};return e.jsxs("div",{ref:h,className:"h-full overflow-x-auto overflow-y-auto",style:{cursor:"grab",userSelect:"none",WebkitUserSelect:"none"},onMouseDown:P,onMouseMove:A,onMouseUp:Y,onMouseLeave:Y,children:[e.jsxs(pt,{sensors:f,collisionDetection:ft,autoScroll:{threshold:{x:.15,y:.15},interval:10,acceleration:5},onDragStart:W,onDragEnd:ne,onDragCancel:oe,children:[e.jsx("div",{style:{display:"flex",flexWrap:"nowrap",alignItems:"flex-start",gap:"1.25rem",padding:"0.5rem",width:"max-content",minHeight:"100%"},children:l.columns.map(w=>{const O=q[w.id]||[];return w.id==="__none__"&&O.length===0?null:e.jsx(It,{column:w,records:O,recordIds:J[w.id]||[],accountNumber:a,entitySlug:s,onQuickView:G},w.id)})}),e.jsx(xt,{children:C?e.jsx(Xe,{record:C,accountNumber:a,entitySlug:s,isDragging:!0}):null})]}),R&&e.jsx(_t,{record:R,columns:o,accountNumber:a,entitySlug:s,onClose:()=>E(null)})]})}const Pe=[{bg:"bg-primary-light shadow-primary",text:"text-primary",dot:"#4361ee"},{bg:"bg-info-light shadow-info",text:"text-info",dot:"#2196f3"},{bg:"bg-warning-light shadow-warning",text:"text-warning",dot:"#e2a03f"},{bg:"bg-danger-light shadow-danger",text:"text-danger",dot:"#e7515a"},{bg:"bg-success-light shadow-success",text:"text-success",dot:"#00ab55"},{bg:"bg-secondary-light shadow-secondary",text:"text-secondary",dot:"#805dca"}];function $t(t){return Pe[t%Pe.length]}function Rt(){return e.jsxs("svg",{width:"24",height:"24",viewBox:"0 0 24 24",fill:"none",className:"h-5 w-5 rotate-90 opacity-70 hover:opacity-100",children:[e.jsx("circle",{cx:"5",cy:"12",r:"2",stroke:"currentColor",strokeWidth:"1.5"}),e.jsx("circle",{opacity:"0.5",cx:"12",cy:"12",r:"2",stroke:"currentColor",strokeWidth:"1.5"}),e.jsx("circle",{cx:"19",cy:"12",r:"2",stroke:"currentColor",strokeWidth:"1.5"})]})}function Et(){return e.jsxs("svg",{width:"24",height:"24",viewBox:"0 0 24 24",fill:"none",className:"h-4 w-4 ltr:mr-3 rtl:ml-3",children:[e.jsx("path",{d:"M15.2869 3.15178L14.3601 4.07866L5.83882 12.5999C5.26166 13.1771 4.97308 13.4656 4.7249 13.7838C4.43213 14.1592 4.18114 14.5653 3.97634 14.995C3.80273 15.3593 3.67368 15.7465 3.41556 16.5208L2.32181 19.8021L2.05445 20.6042C1.92743 20.9852 2.0266 21.4053 2.31063 21.6894C2.59466 21.9734 3.01478 22.0726 3.39584 21.9456L4.19792 21.6782L7.47918 20.5844C8.25353 20.3263 8.6407 20.1973 9.00498 20.0237C9.43469 19.8189 9.84082 19.5679 10.2162 19.2751C10.5344 19.0269 10.8229 18.7383 11.4001 18.1612L19.9213 9.63993L20.8482 8.71306C22.3839 7.17735 22.3839 4.68748 20.8482 3.15178C19.3125 1.61607 16.8226 1.61607 15.2869 3.15178Z",stroke:"currentColor",strokeWidth:"1.5"}),e.jsx("path",{opacity:"0.5",d:"M14.36 4.07812C14.36 4.07812 14.4759 6.04774 16.2138 7.78564C17.9517 9.52354 19.9213 9.6394 19.9213 9.6394M4.19789 21.6777L2.32178 19.8015",stroke:"currentColor",strokeWidth:"1.5"})]})}function Dt(){return e.jsxs("svg",{width:"24",height:"24",viewBox:"0 0 24 24",fill:"none",className:"h-4.5 w-4.5 ltr:mr-3 rtl:ml-3",children:[e.jsx("path",{opacity:"0.5",d:"M3.27489 15.2957C2.42496 14.1915 2 13.6394 2 12C2 10.3606 2.42496 9.80853 3.27489 8.70433C4.97196 6.49956 7.81811 4 12 4C16.1819 4 19.028 6.49956 20.7251 8.70433C21.575 9.80853 22 10.3606 22 12C22 13.6394 21.575 14.1915 20.7251 15.2957C19.028 17.5004 16.1819 20 12 20C7.81811 20 4.97196 17.5004 3.27489 15.2957Z",stroke:"currentColor",strokeWidth:"1.5"}),e.jsx("path",{d:"M15 12C15 13.6569 13.6569 15 12 15C10.3431 15 9 13.6569 9 12C9 10.3431 10.3431 9 12 9C13.6569 9 15 10.3431 15 12Z",stroke:"currentColor",strokeWidth:"1.5"})]})}function Tt({filled:t}){return e.jsx("svg",{width:"24",height:"24",viewBox:"0 0 24 24",fill:"none",className:`h-4.5 w-4.5 group-hover:fill-warning ${t?"fill-warning":""}`,children:e.jsx("path",{d:"M9.15316 5.40838C10.4198 3.13613 11.0531 2 12 2C12.9469 2 13.5802 3.13612 14.8468 5.40837L15.1745 5.99623C15.5345 6.64193 15.7144 6.96479 15.9951 7.17781C16.2757 7.39083 16.6251 7.4699 17.3241 7.62805L17.9605 7.77203C20.4201 8.32856 21.65 8.60682 21.9426 9.54773C22.2352 10.4886 21.3968 11.4691 19.7199 13.4299L19.2861 13.9372C18.8096 14.4944 18.5713 14.773 18.4641 15.1177C18.357 15.4624 18.393 15.8341 18.465 16.5776L18.5306 17.2544C18.7841 19.8706 18.9109 21.1787 18.1449 21.7602C17.3788 22.3417 16.2273 21.8115 13.9243 20.7512L13.3285 20.4768C12.6741 20.1755 12.3469 20.0248 12 20.0248C11.6531 20.0248 11.3259 20.1755 10.6715 20.4768L10.0757 20.7512C7.77268 21.8115 6.62118 22.3417 5.85515 21.7602C5.08912 21.1787 5.21588 19.8706 5.4694 17.2544L5.53498 16.5776C5.60703 15.8341 5.64305 15.4624 5.53586 15.1177C5.42868 14.773 5.19043 14.4944 4.71392 13.9372L4.2801 13.4299C2.60325 11.4691 1.76482 10.4886 2.05742 9.54773C2.35002 8.60682 3.57986 8.32856 6.03954 7.77203L6.67589 7.62805C7.37485 7.4699 7.72433 7.39083 8.00494 7.17781C8.28555 6.96479 8.46553 6.64194 8.82547 5.99623L9.15316 5.40838Z",stroke:"currentColor",strokeWidth:"1.5"})})}function Ft(){return e.jsx("svg",{width:"24",height:"24",viewBox:"0 0 24 24",fill:"none",className:"h-3 w-3 rotate-45",children:e.jsx("path",{d:"M2 12C2 7.28595 2 4.92893 3.46447 3.46447C4.92893 2 7.28595 2 12 2C16.714 2 19.0711 2 20.5355 3.46447C22 4.92893 22 7.28595 22 12C22 16.714 22 19.0711 20.5355 20.5355C19.0711 22 16.714 22 12 22C7.28595 22 4.92893 22 3.46447 20.5355C2 19.0711 2 16.714 2 12Z",stroke:"currentColor",strokeWidth:"1.5"})})}function zt({record:t,accountNumber:o,entitySlug:a}){var M;const[s,g]=r.useState(!1),S=r.useRef(null);r.useEffect(()=>{if(!s)return;const p=x=>{S.current&&!S.current.contains(x.target)&&g(!1)};return document.addEventListener("mousedown",p),()=>document.removeEventListener("mousedown",p)},[s]);const h=((M=t._id)==null?void 0:M.$oid)||t._id;return e.jsxs("div",{ref:S,className:"dropdown relative",children:[e.jsx("button",{type:"button",className:"text-primary",onClick:p=>{p.preventDefault(),p.stopPropagation(),g(!s)},children:e.jsx(Rt,{})}),s&&e.jsxs("ul",{className:"absolute z-50 min-w-[140px] rounded-md bg-white dark:bg-[#1b2e4b] shadow-lg border dark:border-gray-700 py-1 text-sm font-medium ltr:right-0 rtl:left-0 top-full mt-1",style:{animation:"fadeIn 0.15s ease-out"},children:[e.jsx("li",{children:e.jsxs("a",{href:`/account/${o}/record/${a}/${h}/edit`,className:"flex items-center px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 w-full",onClick:p=>p.stopPropagation(),children:[e.jsx(Et,{})," Edit"]})}),e.jsx("li",{children:e.jsxs("a",{href:`/account/${o}/record/${a}/${h}`,className:"flex items-center px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 w-full",onClick:p=>p.stopPropagation(),children:[e.jsx(Dt,{})," View"]})})]})]})}function Ot({record:t,accountNumber:o,entitySlug:a,style:s,favorites:g,onToggleFav:S}){var T,j;const h=g[t._id]||!1,M=((T=t._id)==null?void 0:T.$oid)||t._id,p=t.referenceTitle||t.title||t.computedTitle||"Sans titre",x=t.createdAt?new Date(t.createdAt).toLocaleDateString("fr-FR",{day:"2-digit",month:"short",year:"numeric"}):"",b=(t.customFields||[]).find(R=>{var E,G,_,m,Z,P;return((G=(E=R.field_id)==null?void 0:E.label)==null?void 0:G.toLowerCase().includes("descri"))||((m=(_=R.field_id)==null?void 0:_.label)==null?void 0:m.toLowerCase().includes("note"))||((P=(Z=R.field_id)==null?void 0:Z.label)==null?void 0:P.toLowerCase().includes("contenu"))}),c=(b==null?void 0:b.value)||t.description||"";return(t.classificationValues||[]).filter(R=>R.optionLabel).map(R=>({label:R.optionLabel,color:R.optionColor||R.color||s.dot})),e.jsxs("div",{className:`panel pb-12 relative ${s.bg}`,children:[e.jsxs("div",{className:"min-h-[142px]",children:[e.jsxs("div",{className:"flex justify-between",children:[e.jsxs("div",{className:"flex w-max items-center",children:[e.jsx("div",{className:"flex-none",children:e.jsx("div",{className:"rounded-full bg-gray-300 p-2 dark:bg-gray-700",children:e.jsxs("svg",{width:"24",height:"24",viewBox:"0 0 24 24",fill:"none",className:"h-4.5 w-4.5",children:[e.jsx("circle",{cx:"12",cy:"6",r:"4",stroke:"currentColor",strokeWidth:"1.5"}),e.jsx("ellipse",{opacity:"0.5",cx:"12",cy:"17",rx:"7",ry:"4",stroke:"currentColor",strokeWidth:"1.5"})]})})}),e.jsxs("div",{className:"ltr:ml-2 rtl:mr-2",children:[e.jsx("div",{className:"font-semibold",children:((j=t.createdBy)==null?void 0:j.name)||"Utilisateur"}),e.jsx("div",{className:"text-sx text-white-dark",children:x})]})]}),e.jsx(zt,{record:t,accountNumber:o,entitySlug:a})]}),e.jsxs("div",{children:[e.jsx("h4",{className:"mt-4 font-semibold",children:e.jsx("a",{href:`/account/${o}/record/${a}/${M}`,className:"hover:text-primary transition-colors",children:p})}),c&&e.jsx("p",{className:"mt-2 text-white-dark line-clamp-3",children:c})]})]}),e.jsx("div",{className:"absolute bottom-5 left-0 w-full px-5",children:e.jsxs("div",{className:"mt-2 flex items-center justify-between",children:[e.jsx("div",{className:s.text,children:e.jsx(Ft,{})}),e.jsx("div",{className:"flex items-center gap-2",children:e.jsx("button",{type:"button",className:"group text-warning ltr:ml-2 rtl:mr-2",onClick:R=>{R.preventDefault(),R.stopPropagation(),S(t._id)},children:e.jsx(Tt,{filled:h})})})]})})]})}function Bt({records:t,accountNumber:o,entitySlug:a}){const[s,g]=r.useState({}),S=r.useCallback(h=>{g(M=>({...M,[h]:!M[h]}))},[]);return e.jsx("div",{className:"h-full overflow-y-auto",children:e.jsx("div",{className:"grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",children:t.length===0?e.jsx("div",{className:"col-span-full text-center py-20 text-gray-400 dark:text-gray-600 italic",children:"Aucun enregistrement"}):t.map((h,M)=>{var p;return e.jsx(Ot,{record:h,accountNumber:o,entitySlug:a,style:$t(M),favorites:s,onToggleFav:S},((p=h._id)==null?void 0:p.$oid)||h._id)})})})}const Oe={Planifié:{className:"primary",bg:"#4361ee",text:"#fff"},Confirmé:{className:"info",bg:"#2196f3",text:"#fff"},Terminé:{className:"success",bg:"#00ab55",text:"#fff"},Annulé:{className:"danger",bg:"#e7515a",text:"#fff"},"Non présenté":{className:"warning",bg:"#e2a03f",text:"#fff"}},Ie=[{className:"primary",bg:"#4361ee",text:"#fff"},{className:"info",bg:"#2196f3",text:"#fff"},{className:"success",bg:"#00ab55",text:"#fff"},{className:"danger",bg:"#e7515a",text:"#fff"},{className:"warning",bg:"#e2a03f",text:"#fff"}];function Vt(t,o){if(o){const a=(t.customFields||[]).find(s=>{var S,h,M;return(((h=(S=s.field_id)==null?void 0:S._id)==null?void 0:h.toString())||((M=s.field_id)==null?void 0:M.toString()))===o});if(a!=null&&a.value){const s=new Date(a.value);if(!isNaN(s))return s}}if(t.date){const a=new Date(t.date);if(!isNaN(a))return a}if(t.createdAt){const a=new Date(t.createdAt);if(!isNaN(a))return a}return null}function At(t,o){if(!o)return 30;const a=(t.customFields||[]).find(s=>{var S,h,M;return(((h=(S=s.field_id)==null?void 0:S._id)==null?void 0:h.toString())||((M=s.field_id)==null?void 0:M.toString()))===o});return parseInt(a==null?void 0:a.value)||30}function Pt(t){const o=t.classificationValues||[];for(const a of o)if(a.label||a.optionLabel)return a.label||a.optionLabel;return null}function He(t){return`${String(t.getHours()).padStart(2,"0")}:${String(t.getMinutes()).padStart(2,"0")}`}function Qe(t){const o=["Dimanche","Lundi","Mardi","Mercredi","Jeudi","Vendredi","Samedi"],a=["janvier","février","mars","avril","mai","juin","juillet","août","septembre","octobre","novembre","décembre"];return`${o[t.getDay()]} ${t.getDate()} ${a[t.getMonth()]} ${t.getFullYear()}`}function Ht(t){const o=t.getFullYear(),a=String(t.getMonth()+1).padStart(2,"0"),s=String(t.getDate()).padStart(2,"0"),g=String(t.getHours()).padStart(2,"0"),S=String(t.getMinutes()).padStart(2,"0");return`${o}-${a}-${s}T${g}:${S}`}function Jt({message:t,type:o="success",onClose:a}){r.useEffect(()=>{const S=setTimeout(a,3e3);return()=>clearTimeout(S)},[a]);const s={success:{bg:"#00ab55",icon:"✓"},error:{bg:"#e7515a",icon:"✕"},info:{bg:"#4361ee",icon:"ℹ"}},g=s[o]||s.info;return e.jsxs("div",{style:{position:"fixed",bottom:24,right:24,zIndex:1e4,display:"flex",alignItems:"center",gap:10,padding:"12px 20px",borderRadius:12,backgroundColor:g.bg,color:"#fff",boxShadow:"0 8px 32px rgba(0,0,0,0.18)",animation:"slideInRight 0.3s ease",fontSize:13,fontWeight:600},children:[e.jsx("span",{style:{fontSize:16},children:g.icon}),t]})}function Ut({isOpen:t,onClose:o,onSave:a,initialDate:s,entityData:g,accountNumber:S}){const[h,M]=r.useState(""),[p,x]=r.useState(""),[b,c]=r.useState("30"),[T,j]=r.useState(!1),R=r.useRef(null);if(r.useEffect(()=>{t&&s&&(x(Ht(s)),M(""),c("30"),setTimeout(()=>{var _;return(_=R.current)==null?void 0:_.focus()},100))},[t,s]),!t)return null;const E=async _=>{if(_.preventDefault(),!!h.trim()){j(!0);try{await a({title:h.trim(),date:p,duration:parseInt(b)}),o()}catch(m){console.error(m)}j(!1)}},G=[15,30,45,60,90,120];return e.jsx("div",{style:{position:"fixed",inset:0,zIndex:9999,backgroundColor:"rgba(0,0,0,0.4)",backdropFilter:"blur(4px)",display:"flex",alignItems:"center",justifyContent:"center",animation:"fadeIn 0.2s ease"},onClick:_=>{_.target===_.currentTarget&&o()},children:e.jsxs("div",{style:{backgroundColor:"#fff",borderRadius:16,width:"100%",maxWidth:440,boxShadow:"0 24px 80px rgba(0,0,0,0.2)",animation:"slideUp 0.3s ease",overflow:"hidden"},children:[e.jsxs("div",{style:{padding:"20px 24px 16px",display:"flex",alignItems:"center",justifyContent:"space-between",borderBottom:"1px solid #f0f0f0"},children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:10},children:[e.jsx("div",{style:{width:36,height:36,borderRadius:10,background:"linear-gradient(135deg, #4361ee, #805cf6)",display:"flex",alignItems:"center",justifyContent:"center"},children:e.jsx("svg",{viewBox:"0 0 24 24",fill:"none",style:{width:18,height:18,color:"#fff"},children:e.jsx("path",{d:"M12 5V19M5 12H19",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round"})})}),e.jsxs("div",{children:[e.jsx("h3",{style:{margin:0,fontSize:16,fontWeight:700,color:"#1a1a2e"},children:"Nouveau rendez-vous"}),e.jsx("p",{style:{margin:0,fontSize:11,color:"#888",marginTop:2},children:s?Qe(s):""})]})]}),e.jsx("button",{onClick:o,style:{border:"none",background:"#f5f5f5",borderRadius:8,width:32,height:32,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer"},children:e.jsx("svg",{viewBox:"0 0 24 24",fill:"none",style:{width:16,height:16,color:"#666"},children:e.jsx("path",{d:"M18 6L6 18M6 6L18 18",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round"})})})]}),e.jsxs("form",{onSubmit:E,style:{padding:"20px 24px 24px"},children:[e.jsxs("div",{style:{marginBottom:16},children:[e.jsx("label",{style:{display:"block",fontSize:12,fontWeight:600,color:"#555",marginBottom:6},children:"Titre *"}),e.jsx("input",{ref:R,type:"text",value:h,onChange:_=>M(_.target.value),placeholder:"Ex: Consultation Dr. Martin",required:!0,style:{width:"100%",padding:"10px 14px",border:"1.5px solid #e0e0e0",borderRadius:10,fontSize:14,outline:"none",transition:"border 0.2s",boxSizing:"border-box"},onFocus:_=>_.target.style.borderColor="#4361ee",onBlur:_=>_.target.style.borderColor="#e0e0e0"})]}),e.jsxs("div",{style:{marginBottom:16},children:[e.jsx("label",{style:{display:"block",fontSize:12,fontWeight:600,color:"#555",marginBottom:6},children:"Date et heure"}),e.jsx("input",{type:"datetime-local",value:p,onChange:_=>x(_.target.value),style:{width:"100%",padding:"10px 14px",border:"1.5px solid #e0e0e0",borderRadius:10,fontSize:14,outline:"none",transition:"border 0.2s",boxSizing:"border-box"},onFocus:_=>_.target.style.borderColor="#4361ee",onBlur:_=>_.target.style.borderColor="#e0e0e0"})]}),e.jsxs("div",{style:{marginBottom:20},children:[e.jsx("label",{style:{display:"block",fontSize:12,fontWeight:600,color:"#555",marginBottom:8},children:"Durée"}),e.jsx("div",{style:{display:"flex",flexWrap:"wrap",gap:6},children:G.map(_=>e.jsx("button",{type:"button",onClick:()=>c(String(_)),style:{padding:"6px 14px",borderRadius:20,fontSize:12,fontWeight:600,border:b===String(_)?"1.5px solid #4361ee":"1.5px solid #e0e0e0",backgroundColor:b===String(_)?"#4361ee":"#fff",color:b===String(_)?"#fff":"#555",cursor:"pointer",transition:"all 0.2s"},children:_<60?`${_} min`:`${_/60}h`},_))})]}),e.jsxs("div",{style:{display:"flex",gap:10,justifyContent:"flex-end"},children:[e.jsx("button",{type:"button",onClick:o,style:{padding:"10px 20px",borderRadius:10,fontSize:13,fontWeight:600,border:"1.5px solid #e0e0e0",backgroundColor:"#fff",color:"#555",cursor:"pointer",transition:"all 0.2s"},children:"Annuler"}),e.jsx("button",{type:"submit",disabled:T||!h.trim(),style:{padding:"10px 24px",borderRadius:10,fontSize:13,fontWeight:600,border:"none",background:h.trim()?"linear-gradient(135deg, #4361ee, #805cf6)":"#ccc",color:"#fff",cursor:h.trim()?"pointer":"not-allowed",transition:"all 0.2s",opacity:T?.7:1},children:T?"Création...":"Créer le RDV"})]})]})]})})}function Zt({event:t,position:o,onClose:a,onEdit:s,onDelete:g,accountNumber:S,entitySlug:h}){var j,R;const M=r.useRef(null);if(r.useEffect(()=>{const E=G=>{M.current&&!M.current.contains(G.target)&&a()};return document.addEventListener("mousedown",E),()=>document.removeEventListener("mousedown",E)},[a]),!t)return null;const p=t.start?new Date(t.start):null,x=t.end?new Date(t.end):null,b=(j=t.extendedProps)==null?void 0:j.status,c=b?Oe[b]:null,T=((R=t.extendedProps)==null?void 0:R.recordId)||t.id;return e.jsxs("div",{ref:M,style:{position:"fixed",top:Math.min(o.y,window.innerHeight-280),left:Math.min(o.x,window.innerWidth-340),zIndex:9998,width:320,backgroundColor:"#fff",borderRadius:14,boxShadow:"0 16px 64px rgba(0,0,0,0.18)",animation:"slideUp 0.2s ease",overflow:"hidden"},children:[e.jsx("div",{style:{height:4,background:c?c.bg:"#4361ee"}}),e.jsxs("div",{style:{padding:"16px 20px"},children:[e.jsx("h4",{style:{margin:0,fontSize:15,fontWeight:700,color:"#1a1a2e",marginBottom:8},children:t.title}),p&&e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:8,marginBottom:6,fontSize:12,color:"#666"},children:[e.jsxs("svg",{viewBox:"0 0 24 24",fill:"none",style:{width:14,height:14,flexShrink:0},children:[e.jsx("circle",{cx:"12",cy:"12",r:"9",stroke:"currentColor",strokeWidth:"1.5"}),e.jsx("path",{d:"M12 7V12L15 15",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"})]}),He(p),x&&` — ${He(x)}`]}),p&&e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:8,marginBottom:6,fontSize:12,color:"#666"},children:[e.jsxs("svg",{viewBox:"0 0 24 24",fill:"none",style:{width:14,height:14,flexShrink:0},children:[e.jsx("rect",{x:"3",y:"4",width:"18",height:"18",rx:"2",stroke:"currentColor",strokeWidth:"1.5"}),e.jsx("path",{d:"M16 2V6M8 2V6M3 10H21",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"})]}),Qe(p)]}),b&&e.jsx("div",{style:{marginTop:10},children:e.jsxs("span",{style:{display:"inline-flex",alignItems:"center",gap:4,padding:"4px 10px",borderRadius:20,fontSize:11,fontWeight:600,backgroundColor:c?c.bg+"18":"#f0f0f0",color:c?c.bg:"#555"},children:[e.jsx("span",{style:{width:6,height:6,borderRadius:"50%",backgroundColor:c?c.bg:"#888"}}),b]})})]}),e.jsxs("div",{style:{display:"flex",borderTop:"1px solid #f0f0f0"},children:[e.jsxs("a",{href:`/account/${S}/record/${h}/edit/${T}`,style:{flex:1,display:"flex",alignItems:"center",justifyContent:"center",gap:6,padding:"12px",fontSize:12,fontWeight:600,color:"#4361ee",textDecoration:"none",transition:"background 0.2s",borderRight:"1px solid #f0f0f0"},onMouseEnter:E=>E.currentTarget.style.backgroundColor="#f8f9ff",onMouseLeave:E=>E.currentTarget.style.backgroundColor="transparent",children:[e.jsx("svg",{viewBox:"0 0 24 24",fill:"none",style:{width:14,height:14},children:e.jsx("path",{d:"M12 20H21M3.5 20L4.586 15.414A2 2 0 0 1 5.172 14.586L16.5 3.258a2 2 0 0 1 2.828 0L20.742 4.672a2 2 0 0 1 0 2.828L9.414 18.828a2 2 0 0 1-.828.586L3.5 20Z",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round"})}),"Ouvrir la fiche"]}),e.jsx("button",{onClick:a,style:{flex:1,display:"flex",alignItems:"center",justifyContent:"center",gap:6,padding:"12px",fontSize:12,fontWeight:600,color:"#888",border:"none",backgroundColor:"transparent",cursor:"pointer",transition:"background 0.2s"},onMouseEnter:E=>E.currentTarget.style.backgroundColor="#fafafa",onMouseLeave:E=>E.currentTarget.style.backgroundColor="transparent",children:"Fermer"})]})]})}function Yt({records:t=[],columns:o=[],accountNumber:a,entitySlug:s,entityData:g}){var ne,w,O,U;const S=r.useRef(null),h=r.useRef(null),[M,p]=r.useState(!1),[x,b]=r.useState(!1),[c,T]=r.useState(null),[j,R]=r.useState(null),[E,G]=r.useState({x:0,y:0}),[_,m]=r.useState(null),[Z,P]=r.useState(t);r.useEffect(()=>{P(t)},[t]);const{dateFieldId:A,durationFieldId:Y}=r.useMemo(()=>{var se,de,d,H,Q;if(!g)return{dateFieldId:null,durationFieldId:null};const i=g.customFields||[],N=i.filter($=>$.type==="date"||$.inputType==="date"||$.inputType==="datetime-local"),L=N.find($=>/^date/i.test($.name||"")||/date/i.test($.label||"")),F=((se=L==null?void 0:L._id)==null?void 0:se.toString())||((d=(de=N[0])==null?void 0:de._id)==null?void 0:d.toString())||null,X=((Q=(H=i.filter($=>$.type==="number"&&(/dur/i.test($.name||"")||/dur/i.test($.label||"")))[0])==null?void 0:H._id)==null?void 0:Q.toString())||null;return{dateFieldId:F,durationFieldId:X}},[g]),f=(ne=g==null?void 0:g._id)==null?void 0:ne.toString(),l=(O=(w=g==null?void 0:g.statusClassification)==null?void 0:w._id)==null?void 0:O.toString(),q=((U=g==null?void 0:g.statusClassification)==null?void 0:U.options)||[],J=q.find(i=>/planif/i.test(i.label))||q[0],V=r.useMemo(()=>Z.map((i,N)=>{const L=Vt(i,A);if(!L)return null;const F=At(i,Y),K=new Date(L.getTime()+F*6e4),X=i.referenceTitle||i.computedTitle||i.title||"Sans titre",se=Pt(i),de=se&&Oe[se]||Ie[N%Ie.length];return{id:i._id,title:X,start:L.toISOString(),end:K.toISOString(),className:de.className,extendedProps:{recordId:i._id,status:se,entitySlug:s,accountNumber:a,dateFieldId:A,durationFieldId:Y}}}).filter(Boolean),[Z,A,Y,s,a]),C=r.useCallback(i=>{i.jsEvent.preventDefault(),i.jsEvent.stopPropagation();const N=i.el.getBoundingClientRect();G({x:N.right+8,y:N.top}),R(i.event)},[]),v=r.useCallback(i=>{R(null);const N=i.start;T(N),b(!0),h.current&&h.current.unselect()},[]),D=r.useCallback(async i=>{var se,de,d;const N=((se=i.event.extendedProps)==null?void 0:se.recordId)||i.event.id,L=i.event.start.toISOString(),F=(de=i.event.end)==null?void 0:de.toISOString(),K=(d=i.event.extendedProps)==null?void 0:d.dateFieldId;let X;i.event.start&&i.event.end&&(X=Math.round((i.event.end-i.event.start)/6e4));try{if(!(await fetch(`/account/${a}/api/records/${N}/date`,{method:"PATCH",headers:{"Content-Type":"application/json"},credentials:"include",body:JSON.stringify({dateFieldId:K,newStart:L,newEnd:F,duration:X})})).ok)throw new Error("Failed");m({message:"RDV déplacé avec succès",type:"success"})}catch{i.revert(),m({message:"Erreur lors du déplacement",type:"error"})}},[a]),W=r.useCallback(async i=>{var X,se;const N=((X=i.event.extendedProps)==null?void 0:X.recordId)||i.event.id,L=i.event.start.toISOString(),F=(se=i.event.extendedProps)==null?void 0:se.dateFieldId;let K;i.event.start&&i.event.end&&(K=Math.round((i.event.end-i.event.start)/6e4));try{if(!(await fetch(`/account/${a}/api/records/${N}/date`,{method:"PATCH",headers:{"Content-Type":"application/json"},credentials:"include",body:JSON.stringify({dateFieldId:F,newStart:L,duration:K})})).ok)throw new Error("Failed");m({message:`Durée modifiée (${K} min)`,type:"success"})}catch{i.revert(),m({message:"Erreur lors du redimensionnement",type:"error"})}},[a]),oe=r.useCallback(async({title:i,date:N,duration:L})=>{var X;if(!f||!A)return;const F=await fetch(`/account/${a}/api/entity/${f}/records/quick-add`,{method:"POST",headers:{"Content-Type":"application/json"},credentials:"include",body:JSON.stringify({title:i,dateFieldId:A,dateValue:new Date(N).toISOString(),duration:L,durationFieldId:Y,statusOptionId:(X=J==null?void 0:J._id)==null?void 0:X.toString(),statusClassificationId:l})});if(!F.ok)throw new Error("Failed to create");const K=await F.json();K.record&&P(se=>[...se,K.record]),m({message:`"${i}" créé avec succès !`,type:"success"})},[a,f,A,Y,J,l]);return r.useEffect(()=>{if(typeof FullCalendar<"u"){p(!0);return}const i=setInterval(()=>{typeof FullCalendar<"u"&&(p(!0),clearInterval(i))},200);if(!document.querySelector('script[src*="fullcalendar"]')){const N=document.createElement("link");N.rel="stylesheet",N.href="/assets/css/fullcalendar.min.css",document.head.appendChild(N);const L=document.createElement("script");L.src="/assets/js/fullcalendar.min.js",L.onload=()=>p(!0),document.head.appendChild(L)}return()=>clearInterval(i)},[]),r.useEffect(()=>{if(!M||!S.current||typeof FullCalendar>"u")return;h.current&&h.current.destroy();const i=new FullCalendar.Calendar(S.current,{initialView:"timeGridWeek",headerToolbar:{left:"prev,next today",center:"title",right:"dayGridMonth,timeGridWeek,timeGridDay"},locale:"fr",buttonText:{today:"Aujourd'hui",month:"Mois",week:"Semaine",day:"Jour"},editable:!0,selectable:!0,selectMirror:!0,dayMaxEvents:3,height:"auto",slotDuration:"00:15:00",snapDuration:"00:15:00",slotLabelInterval:"01:00",slotLabelFormat:{hour:"2-digit",minute:"2-digit",hour12:!1},businessHours:{daysOfWeek:[1,2,3,4,5],startTime:"08:00",endTime:"19:00"},scrollTime:"08:00:00",nowIndicator:!0,events:V,eventClick:C,select:v,eventDrop:D,eventResize:W,eventDidMount:N=>{var F;N.el.style.cursor="pointer",N.el.style.borderRadius="6px",N.el.style.border="none",N.el.style.fontSize="12px",N.el.style.fontWeight="600";const L=(F=N.event.extendedProps)==null?void 0:F.status;N.el.title=N.event.title+(L?` — ${L}`:"")},dayHeaderFormat:{weekday:"short",day:"numeric",month:"short"},allDaySlot:!1});return i.render(),h.current=i,()=>{h.current&&(h.current.destroy(),h.current=null)}},[M,V,C,v,D,W]),M?!A&&t.length>0?e.jsxs("div",{style:{display:"flex",alignItems:"center",justifyContent:"center",padding:"48px 0",flexDirection:"column"},children:[e.jsxs("svg",{viewBox:"0 0 24 24",fill:"none",style:{width:48,height:48,marginBottom:12,color:"#ccc"},children:[e.jsx("rect",{x:"3",y:"4",width:"18",height:"18",rx:"2",stroke:"currentColor",strokeWidth:"1.5"}),e.jsx("path",{d:"M16 2V6M8 2V6M3 10H21",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"})]}),e.jsx("p",{style:{fontSize:14,fontWeight:500,color:"#888"},children:"Aucun champ date trouvé"}),e.jsx("p",{style:{fontSize:12,color:"#aaa",marginTop:4},children:"Ajoutez un champ date à cette entité"})]}):e.jsxs("div",{style:{position:"relative"},children:[e.jsx("style",{children:`
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
            `}),e.jsxs("div",{style:{marginBottom:12,display:"flex",flexWrap:"wrap",gap:12,alignItems:"center",justifyContent:"space-between",padding:"8px 0"},children:[e.jsx("div",{style:{display:"flex",flexWrap:"wrap",gap:10},children:Object.entries(Oe).map(([i,N])=>e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:5,fontSize:11,color:"#666"},children:[e.jsx("div",{style:{width:8,height:8,borderRadius:2,backgroundColor:N.bg}}),i]},i))}),e.jsx("div",{style:{fontSize:11,color:"#aaa",fontStyle:"italic"},children:"Cliquer pour ajouter • Glisser pour déplacer"})]}),e.jsx("div",{className:"calendar-wrapper",ref:S}),e.jsx(Ut,{isOpen:x,onClose:()=>b(!1),onSave:oe,initialDate:c,entityData:g,accountNumber:a}),j&&e.jsx(Zt,{event:j,position:E,onClose:()=>R(null),accountNumber:a,entitySlug:s}),_&&e.jsx(Jt,{message:_.message,type:_.type,onClose:()=>m(null)})]}):e.jsxs("div",{style:{display:"flex",alignItems:"center",justifyContent:"center",padding:"48px 0"},children:[e.jsx("div",{className:"animate-spin rounded-full h-8 w-8 border-b-2 border-primary"}),e.jsx("span",{style:{marginLeft:12,color:"#888"},children:"Chargement du calendrier..."})]})}const Ge={contains:{label:"Contient",icon:"⊃",types:["text","email","phone","url","textarea","title","relation"]},not_contains:{label:"Ne contient pas",icon:"⊅",types:["text","email","phone","url","textarea","title","relation"]},equals:{label:"Est égal à",icon:"=",types:["text","email","phone","url","number","date","title","select","relation","classification"]},not_equals:{label:"N'est pas égal à",icon:"≠",types:["text","email","phone","url","number","date","title","select","relation","classification"]},starts_with:{label:"Commence par",icon:"A…",types:["text","email","phone","url","title"]},ends_with:{label:"Se termine par",icon:"…Z",types:["text","email","phone","url","title"]},gt:{label:"Supérieur à",icon:">",types:["number","date"]},gte:{label:"Supérieur ou égal",icon:"≥",types:["number","date"]},lt:{label:"Inférieur à",icon:"<",types:["number","date"]},lte:{label:"Inférieur ou égal",icon:"≤",types:["number","date"]},between:{label:"Entre",icon:"↔",types:["number","date"]},is_empty:{label:"Est vide",icon:"∅",types:["text","email","phone","url","number","date","textarea","title","select","relation","classification"]},is_not_empty:{label:"N'est pas vide",icon:"∃",types:["text","email","phone","url","number","date","textarea","title","select","relation","classification"]}};function Fe(t){const o=t||"text";return Object.entries(Ge).filter(([a,s])=>s.types.includes(o)).map(([a,s])=>({key:a,...s}))}function Je(t){return["number","currency","percent"].includes(t)?"number":["date","datetime"].includes(t)?"date":"text"}function qt({columns:t=[],fieldFilters:o=[],onFieldFiltersChange:a,allRecords:s=[],sidebarFilters:g=[]}){const[S,h]=r.useState(o.length>0),[M,p]=r.useState(null),[x,b]=r.useState(!1),c=r.useRef(null);r.useEffect(()=>{const f=l=>{x&&c.current&&!c.current.contains(l.target)&&b(!1)};return x&&document.addEventListener("mousedown",f),()=>document.removeEventListener("mousedown",f)},[x]);const T=$e.useMemo(()=>{const f={};return g.forEach(l=>{f[`classif:${l.id}`]=l.options||[]}),f},[g]),j=t.filter(f=>f.id!=="actions"),R=r.useCallback(f=>{const l=j.find(v=>v.id===f);if(!l)return;const q=f.startsWith("classif:"),J=Fe(l.type),V=q?J.find(v=>v.key==="equals")||J[0]:J.find(v=>v.key==="contains")||J[0],C={fieldId:f,fieldName:l.name,fieldType:l.type||"text",operator:V.key,value:"",value2:"",logic:"AND"};a([...o,C]),b(!1),p(o.length)},[j,o,a]),E=r.useCallback((f,l)=>{const q=o.map((J,V)=>V===f?{...J,...l}:J);a(q)},[o,a]),G=r.useCallback(f=>{const l=o.filter((q,J)=>J!==f);a(l),M===f&&p(null)},[o,a,M]),_=r.useCallback(()=>{a([]),p(null)},[a]),m=f=>["is_empty","is_not_empty"].includes(f),Z=f=>f==="between",P=f=>f&&f.startsWith("classif:"),A=f=>T[f]||[],Y=(f,l)=>{const J=A(f).find(V=>V.id===l||V.label===l);return J?J.label:l};return e.jsxs("div",{className:"adv-filters-container",children:[e.jsxs("button",{type:"button",className:"adv-filters-header",onClick:()=>h(!S),children:[e.jsxs("div",{className:"adv-filters-header-left",children:[e.jsx("svg",{viewBox:"0 0 24 24",fill:"none",className:"adv-filters-header-icon",children:e.jsx("path",{d:"M22 3H2L10 12.46V19L14 21V12.46L22 3Z",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round"})}),e.jsx("span",{children:"Filtres avancés"}),o.length>0&&e.jsx("span",{className:"adv-filters-count",children:o.length})]}),e.jsx("svg",{viewBox:"0 0 24 24",fill:"none",className:`adv-filters-chevron ${S?"adv-filters-chevron--open":""}`,children:e.jsx("path",{d:"M9 18L15 12L9 6",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round"})})]}),S&&e.jsxs("div",{className:"adv-filters-body",children:[o.map((f,l)=>{var D;j.find(W=>W.id===f.fieldId);const q=Fe(f.fieldType),J=M===l,V=P(f.fieldId),C=V?A(f.fieldId):[],v=f.logic||"AND";return e.jsxs($e.Fragment,{children:[l>0&&e.jsxs("div",{className:"adv-filter-connector",children:[e.jsx("span",{className:"adv-filter-connector-line"}),e.jsx("button",{type:"button",className:`adv-filter-connector-badge ${v==="OR"?"adv-filter-connector-badge--or":""}`,onClick:()=>{E(l,{logic:v==="AND"?"OR":"AND"})},title:"Cliquez pour basculer entre ET/OU",children:v==="OR"?"OU":"ET"}),e.jsx("span",{className:"adv-filter-connector-line"})]}),e.jsx("div",{className:`adv-filter-pill ${J?"adv-filter-pill--editing":""}`,children:J?e.jsxs("div",{className:"adv-filter-edit",children:[e.jsxs("div",{className:"adv-filter-row",children:[e.jsx("label",{className:"adv-filter-label",children:"Champ"}),e.jsx("select",{value:f.fieldId,onChange:W=>{const oe=j.find(ne=>ne.id===W.target.value);if(oe){const ne=Fe(oe.type),O=W.target.value.startsWith("classif:")?ne.find(U=>U.key==="equals")||ne[0]:ne.find(U=>U.key===f.operator)||ne[0];E(l,{fieldId:oe.id,fieldName:oe.name,fieldType:oe.type||"text",operator:O.key,value:"",value2:""})}},className:"adv-filter-select",children:j.map(W=>e.jsx("option",{value:W.id,children:W.name},W.id))})]}),e.jsxs("div",{className:"adv-filter-row",children:[e.jsx("label",{className:"adv-filter-label",children:"Condition"}),e.jsx("select",{value:f.operator,onChange:W=>E(l,{operator:W.target.value,value:m(W.target.value)?"":f.value,value2:""}),className:"adv-filter-select",children:q.map(W=>e.jsx("option",{value:W.key,children:W.label},W.key))})]}),!m(f.operator)&&e.jsxs("div",{className:"adv-filter-row",children:[e.jsx("label",{className:"adv-filter-label",children:Z(f.operator)?"Valeur min":"Valeur"}),V&&C.length>0?e.jsxs("select",{value:f.value,onChange:W=>E(l,{value:W.target.value}),className:"adv-filter-select",children:[e.jsx("option",{value:"",children:"Sélectionnez..."}),C.map(W=>e.jsx("option",{value:W.label,children:W.label},W.id))]}):e.jsx("input",{type:Je(f.fieldType),value:f.value,onChange:W=>E(l,{value:W.target.value}),placeholder:"Saisir une valeur...",className:"adv-filter-input",autoFocus:!0})]}),Z(f.operator)&&e.jsxs("div",{className:"adv-filter-row",children:[e.jsx("label",{className:"adv-filter-label",children:"Valeur max"}),e.jsx("input",{type:Je(f.fieldType),value:f.value2||"",onChange:W=>E(l,{value2:W.target.value}),placeholder:"Saisir une valeur max...",className:"adv-filter-input"})]}),e.jsxs("div",{className:"adv-filter-row adv-filter-row--actions",children:[e.jsxs("button",{type:"button",className:"adv-filter-btn-done",onClick:()=>p(null),children:[e.jsx("svg",{viewBox:"0 0 24 24",fill:"none",className:"h-3.5 w-3.5",children:e.jsx("path",{d:"M5 13L9 17L19 7",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round"})}),"OK"]}),e.jsx("button",{type:"button",className:"adv-filter-btn-delete",onClick:()=>G(l),children:e.jsxs("svg",{viewBox:"0 0 24 24",fill:"none",className:"h-3.5 w-3.5",children:[e.jsx("path",{d:"M20.5001 6H3.5",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"}),e.jsx("path",{d:"M18.8334 8.5L18.3735 15.3991C18.1965 18.054 18.108 19.3815 17.243 20.1907C16.378 21 15.0476 21 12.3868 21H11.6134C8.9526 21 7.6222 21 6.75719 20.1907C5.89218 19.3815 5.80368 18.054 5.62669 15.3991L5.16675 8.5",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"})]})})]})]}):e.jsxs("button",{type:"button",className:"adv-filter-pill-summary",onClick:()=>p(l),children:[e.jsx("span",{className:"adv-filter-pill-field",children:f.fieldName}),e.jsx("span",{className:"adv-filter-pill-op",children:((D=Ge[f.operator])==null?void 0:D.label)||f.operator}),!m(f.operator)&&e.jsx("span",{className:"adv-filter-pill-value",children:Z(f.operator)?`${f.value||"?"} – ${f.value2||"?"}`:V?Y(f.fieldId,f.value):f.value||"..."}),e.jsx("button",{type:"button",className:"adv-filter-pill-remove",onClick:W=>{W.stopPropagation(),G(l)},children:e.jsx("svg",{viewBox:"0 0 24 24",fill:"none",className:"h-3 w-3",children:e.jsx("path",{d:"M18 6L6 18M6 6L18 18",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round"})})})]})})]},l)}),e.jsxs("div",{className:"adv-filter-add-row",ref:c,children:[e.jsxs("button",{type:"button",className:"adv-filter-add-btn",onClick:()=>b(!x),children:[e.jsx("svg",{viewBox:"0 0 24 24",fill:"none",className:"h-3.5 w-3.5",children:e.jsx("path",{d:"M12 5V19M5 12H19",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round"})}),"Ajouter un filtre"]}),x&&e.jsxs("div",{className:"adv-filter-field-dropdown",children:[e.jsx("div",{className:"adv-filter-field-dropdown-title",children:"Choisir un champ"}),j.map(f=>e.jsxs("button",{type:"button",className:"adv-filter-field-option",onClick:()=>R(f.id),children:[e.jsx("span",{className:"adv-filter-field-type-badge",children:Kt(f.type)}),f.name]},f.id))]})]}),o.length>0&&e.jsx("button",{type:"button",className:"adv-filter-clear",onClick:_,children:"Effacer tous les filtres"})]}),e.jsx("style",{children:`
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
            `})]})}function Kt(t){return{text:"Aa",title:"T",email:"@",phone:"☎",url:"🔗",number:"#",currency:"$",percent:"%",date:"📅",datetime:"🕐",textarea:"¶",select:"☰",relation:"↗",classification:"●"}[t]||"Aa"}const Ue=229,Ze=500,Ye=280;function Xt({entityName:t,entityNamePlural:o,entityIcon:a,accountNumber:s,entitySlug:g,showSidebar:S,onToggleSidebar:h,filters:M=[],activeFilters:p={},onFilterChange:x,columns:b=[],fieldFilters:c=[],onFieldFiltersChange:T,allRecords:j=[],sidebarWidth:R,onSidebarWidthChange:E}){const[G,_]=r.useState(!1),m=r.useRef(null),[Z,P]=r.useState(R||Ye),A=r.useRef(!1),Y=r.useRef(0),f=r.useRef(0),l=r.useRef(R||Ye),q=r.useRef(E);r.useEffect(()=>{q.current=E},[E]),r.useEffect(()=>{l.current=Z},[Z]),r.useEffect(()=>{R&&!A.current&&P(R)},[R]);const J=r.useCallback(v=>{v.preventDefault(),A.current=!0,Y.current=v.clientX,f.current=l.current,document.body.style.cursor="col-resize",document.body.style.userSelect="none"},[]);if(r.useEffect(()=>{const v=W=>{if(!A.current)return;const oe=W.clientX-Y.current,ne=Math.min(Ze,Math.max(Ue,f.current+oe));P(ne)},D=()=>{A.current&&(A.current=!1,document.body.style.cursor="",document.body.style.userSelect="",q.current&&q.current(l.current))};return document.addEventListener("mousemove",v),document.addEventListener("mouseup",D),()=>{document.removeEventListener("mousemove",v),document.removeEventListener("mouseup",D)}},[]),r.useEffect(()=>{const v=D=>{G&&m.current&&!m.current.contains(D.target)&&_(!1)};return G&&document.addEventListener("mousedown",v),()=>document.removeEventListener("mousedown",v)},[G]),!S)return null;const V=(v,D)=>{const W={...p},oe=W[v]||[];if(D==="__all__")delete W[v];else{const ne=oe.indexOf(D);ne>-1?(oe.splice(ne,1),oe.length===0?delete W[v]:W[v]=[...oe]):W[v]=[...oe,D]}x(W)},C=Object.keys(p).length>0;return e.jsxs("div",{style:{position:"relative",width:Z,minWidth:Ue,maxWidth:Ze,flexShrink:0},children:[e.jsxs("div",{className:"panel z-10 space-y-4 overflow-y-auto p-4 h-full",style:{display:"flex",flexDirection:"column",width:"100%"},children:[e.jsxs("div",{className:"flex items-center justify-between",children:[e.jsx("div",{className:"flex items-center",children:e.jsxs("div",{className:"flex items-center text-center",children:[e.jsx("div",{children:a?e.jsx("iconify-icon",{icon:a,width:"22",style:{color:"var(--primary)"}}):e.jsxs("svg",{width:"24",height:"24",viewBox:"0 0 24 24",fill:"none",xmlns:"http://www.w3.org/2000/svg",className:"h-5 w-5",children:[e.jsx("path",{d:"M20.3116 12.6473L20.8293 10.7154C21.4335 8.46034 21.7356 7.3328 21.5081 6.35703C21.3285 5.58657 20.9244 4.88668 20.347 4.34587C19.6157 3.66095 18.4881 3.35883 16.2331 2.75458C13.978 2.15033 12.8504 1.84821 11.8747 2.07573C11.1042 2.25537 10.4043 2.65945 9.86351 3.23687C9.27709 3.86298 8.97128 4.77957 8.51621 6.44561C8.43979 6.7254 8.35915 7.02633 8.27227 7.35057L8.27222 7.35077L7.75458 9.28263C7.15033 11.5377 6.84821 12.6652 7.07573 13.641C7.25537 14.4115 7.65945 15.1114 8.23687 15.6522C8.96815 16.3371 10.0957 16.6392 12.3508 17.2435L12.3508 17.2435C14.3834 17.7881 15.4999 18.0873 16.415 17.9744C16.5152 17.9621 16.6129 17.9448 16.7092 17.9223C17.4796 17.7427 18.1795 17.3386 18.7203 16.7612C19.4052 16.0299 19.7074 14.9024 20.3116 12.6473Z",stroke:"currentColor",strokeWidth:"1.5"}),e.jsx("path",{opacity:"0.5",d:"M16.415 17.9741C16.2065 18.6126 15.8399 19.1902 15.347 19.6519C14.6157 20.3368 13.4881 20.6389 11.2331 21.2432C8.97798 21.8474 7.85044 22.1495 6.87466 21.922C6.10421 21.7424 5.40432 21.3383 4.86351 20.7609C4.17859 20.0296 3.87647 18.9021 3.27222 16.647L2.75458 14.7151C2.15033 12.46 1.84821 11.3325 2.07573 10.3567C2.25537 9.58627 2.65945 8.88638 3.23687 8.34557C3.96815 7.66065 5.09569 7.35853 7.35077 6.75428C7.77741 6.63996 8.16368 6.53646 8.51621 6.44531",stroke:"currentColor",strokeWidth:"1.5"}),e.jsx("path",{d:"M11.7769 10L16.6065 11.2941",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"}),e.jsx("path",{opacity:"0.5",d:"M11 12.8975L13.8978 13.6739",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"})]})}),e.jsx("h3",{className:"text-lg font-semibold ltr:ml-3 rtl:mr-3",children:t})]})}),e.jsxs("div",{className:"dropdown relative",ref:m,children:[e.jsx("button",{type:"button",className:"flex h-8 w-8 items-center justify-center rounded-full bg-[#f4f4f4] hover:bg-primary-light dark:bg-[#1b2e4b]",onClick:()=>_(!G),children:e.jsxs("svg",{width:"24",height:"24",viewBox:"0 0 24 24",fill:"none",xmlns:"http://www.w3.org/2000/svg",className:"h-5 w-5 opacity-70",children:[e.jsx("circle",{cx:"5",cy:"12",r:"2",stroke:"currentColor",strokeWidth:"1.5"}),e.jsx("circle",{opacity:"0.5",cx:"12",cy:"12",r:"2",stroke:"currentColor",strokeWidth:"1.5"}),e.jsx("circle",{cx:"19",cy:"12",r:"2",stroke:"currentColor",strokeWidth:"1.5"})]})}),G&&e.jsxs("ul",{className:"whitespace-nowrap absolute right-0 top-full mt-1 z-50 min-w-[160px] rounded-md border border-gray-200 bg-white py-1 shadow-lg dark:border-[#1b2e4b] dark:bg-[#0e1726]",children:[e.jsx("li",{children:e.jsxs("a",{href:"javascript:;",onClick:()=>_(!1),className:"flex items-center px-4 py-2 text-sm hover:bg-gray-100 hover:text-primary dark:hover:bg-[#181F32] dark:hover:text-primary",children:[e.jsx("iconify-icon",{icon:"solar:settings-bold-duotone",className:"h-4.5 w-4.5 shrink-0 ltr:mr-1 rtl:ml-1",width:"18",style:{marginRight:"6px"}}),"Paramètres"]})}),e.jsx("li",{children:e.jsxs("a",{href:"javascript:;",onClick:()=>_(!1),className:"flex items-center px-4 py-2 text-sm hover:bg-gray-100 hover:text-primary dark:hover:bg-[#181F32] dark:hover:text-primary",children:[e.jsx("iconify-icon",{icon:"solar:question-circle-bold-duotone",className:"h-4.5 w-4.5 shrink-0 ltr:mr-1 rtl:ml-1",width:"18",style:{marginRight:"6px"}}),"Aide"]})})]})]})]}),e.jsx("div",{className:"h-px w-full border-b border-[#e0e6ed] dark:border-[#1b2e4b]"}),e.jsx("div",{className:"!mt-0",style:{flex:1,display:"flex",flexDirection:"column"},children:e.jsxs("div",{className:"flex h-full flex-col pb-16",style:{position:"relative"},children:[e.jsx("div",{className:"relative -mr-3.5 h-full grow pr-3.5 overflow-auto",children:e.jsxs("div",{className:"space-y-1",children:[e.jsx("button",{type:"button",className:`flex h-10 w-full items-center justify-between rounded-md p-2 font-medium hover:bg-white-dark/10 hover:text-primary dark:hover:bg-[#181F32] dark:hover:text-primary ${C?"":"bg-gray-100 dark:text-primary text-primary dark:bg-[#181F32]"}`,onClick:()=>x({}),children:e.jsxs("div",{className:"flex items-center",children:[e.jsx("iconify-icon",{icon:"solar:checklist-minimalistic-bold-duotone",width:"20"}),e.jsxs("div",{className:"ltr:ml-3 rtl:mr-3",children:["Toutes les ",o||t+"s"]})]})}),e.jsx("button",{type:"button",className:`flex h-10 w-full items-center justify-between rounded-md p-2 font-medium hover:bg-white-dark/10 hover:text-primary dark:hover:bg-[#181F32] dark:hover:text-primary ${p.__favourites?"bg-gray-100 dark:text-primary text-primary dark:bg-[#181F32]":""}`,onClick:()=>{const v={...p};v.__favourites?delete v.__favourites:v.__favourites=!0,x(v)},children:e.jsxs("div",{className:"flex items-center",children:[e.jsx("svg",{width:"24",height:"24",viewBox:"0 0 24 24",fill:"none",xmlns:"http://www.w3.org/2000/svg",className:"h-5 w-5",children:e.jsx("path",{d:"M9.15316 5.40838C10.4198 3.13613 11.0531 2 12 2C12.9469 2 13.5802 3.13612 14.8468 5.40837L15.1745 5.99623C15.5345 6.64193 15.7144 6.96479 15.9951 7.17781C16.2757 7.39083 16.6251 7.4699 17.3241 7.62805L17.9605 7.77203C20.4201 8.32856 21.65 8.60682 21.9426 9.54773C22.2352 10.4886 21.3968 11.4691 19.7199 13.4299L19.2861 13.9372C18.8096 14.4944 18.5713 14.773 18.4641 15.1177C18.357 15.4624 18.393 15.8341 18.465 16.5776L18.5306 17.2544C18.7841 19.8706 18.9109 21.1787 18.1449 21.7602C17.3788 22.3417 16.2273 21.8115 13.9243 20.7512L13.3285 20.4768C12.6741 20.1755 12.3469 20.0248 12 20.0248C11.6531 20.0248 11.3259 20.1755 10.6715 20.4768L10.0757 20.7512C7.77268 21.8115 6.62118 22.3417 5.85515 21.7602C5.08912 21.1787 5.21588 19.8706 5.4694 17.2544L5.53498 16.5776C5.60703 15.8341 5.64305 15.4624 5.53586 15.1177C5.42868 14.773 5.19043 14.4944 4.71392 13.9372L4.2801 13.4299C2.60325 11.4691 1.76482 10.4886 2.05742 9.54773C2.35002 8.60682 3.57986 8.32856 6.03954 7.77203L6.67589 7.62805C7.37485 7.4699 7.72433 7.39083 8.00494 7.17781C8.28555 6.96479 8.46553 6.64194 8.82547 5.99623L9.15316 5.40838Z",stroke:"currentColor",strokeWidth:"1.5"})}),e.jsx("div",{className:"ltr:ml-3 rtl:mr-3",children:"Favourites"})]})}),M.map(v=>e.jsxs("div",{children:[e.jsx("div",{className:"h-px w-full border-b border-[#e0e6ed] dark:border-[#1b2e4b] my-2"}),e.jsx("div",{className:"px-1 py-2 text-white-dark text-xs uppercase font-semibold tracking-wider",children:v.name}),v.type==="tags"?e.jsx("div",{className:"flex flex-wrap gap-1.5 px-1",children:v.options.map(D=>{const W=(p[v.id]||[]).includes(D.id);return e.jsxs("button",{type:"button",className:"mb-0 py-0.5 px-2.5 text-xs rounded-full cursor-pointer transition-all font-medium",style:{border:`1.5px solid ${D.color||"#9ca3af"}`,color:W?"#fff":D.color||"#9ca3af",backgroundColor:W?D.color||"#9ca3af":"transparent"},onClick:()=>V(v.id,D.id),children:[D.label,D.count!==void 0&&e.jsx("span",{style:{opacity:.7,marginLeft:"2px"},children:D.count})]},D.id)})}):e.jsx("div",{className:"space-y-0.5",children:v.options.map(D=>{const W=(p[v.id]||[]).includes(D.id);return e.jsxs("button",{type:"button",className:`flex h-9 w-full items-center rounded-md px-2 py-1.5 text-sm font-medium transition-colors hover:bg-white-dark/10 hover:text-primary dark:hover:bg-[#181F32] dark:hover:text-primary ${W?"bg-gray-100 text-primary dark:bg-[#181F32] dark:text-primary":""}`,onClick:()=>V(v.id,D.id),children:[e.jsx("span",{className:"inline-block w-3 h-3 rounded-full mr-2.5 flex-shrink-0",style:{backgroundColor:D.color||"#9ca3af"}}),e.jsx("span",{className:"truncate",children:D.label}),D.count!==void 0&&e.jsx("span",{className:"ml-auto text-xs opacity-60",children:D.count})]},D.id)})})]},v.id)),e.jsx(qt,{columns:b,fieldFilters:c,onFieldFiltersChange:T,allRecords:j,sidebarFilters:M})]})}),e.jsx("div",{className:"absolute bottom-0 w-full p-4 left-0",children:e.jsxs("a",{href:`/account/${s}/record/${g}/add`,className:"btn btn-primary w-full",children:[e.jsxs("svg",{xmlns:"http://www.w3.org/2000/svg",width:"24px",height:"24px",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round",className:"h-5 w-5 ltr:mr-2 rtl:ml-2",children:[e.jsx("line",{x1:"12",y1:"5",x2:"12",y2:"19"}),e.jsx("line",{x1:"5",y1:"12",x2:"19",y2:"12"})]}),"Ajouter"]})})]})})]}),e.jsx("div",{onMouseDown:J,style:{position:"absolute",top:0,right:-3,width:6,height:"100%",cursor:"col-resize",zIndex:20,display:"flex",alignItems:"center",justifyContent:"center"},onMouseEnter:v=>{v.currentTarget.querySelector(".resize-bar").style.opacity="1"},onMouseLeave:v=>{A.current||(v.currentTarget.querySelector(".resize-bar").style.opacity="0")},children:e.jsx("div",{className:"resize-bar",style:{width:3,height:"100%",borderRadius:2,background:"var(--primary, #4361ee)",opacity:0,transition:"opacity 0.2s ease"}})})]})}const Qt=["#4361ee","#805dca","#e2a03f","#00ab55","#e7515a","#2196d4","#3b3f5c","#009688","#ff5722","#607d8b"],Gt={contains:{label:"Contient",icon:"⊃",types:["text","email","phone","url","textarea","title","relation"]},not_contains:{label:"Ne contient pas",icon:"⊅",types:["text","email","phone","url","textarea","title","relation"]},equals:{label:"Est égal à",icon:"=",types:["text","email","phone","url","number","date","title","select","relation","classification"]},not_equals:{label:"N'est pas égal à",icon:"≠",types:["text","email","phone","url","number","date","title","select","relation","classification"]},starts_with:{label:"Commence par",icon:"A…",types:["text","email","phone","url","title"]},ends_with:{label:"Se termine par",icon:"…Z",types:["text","email","phone","url","title"]},gt:{label:"Supérieur à",icon:">",types:["number","date"]},gte:{label:"Supérieur ou égal",icon:"≥",types:["number","date"]},lt:{label:"Inférieur à",icon:"<",types:["number","date"]},lte:{label:"Inférieur ou égal",icon:"≤",types:["number","date"]},between:{label:"Entre",icon:"↔",types:["number","date"]},is_empty:{label:"Est vide",icon:"∅",types:["text","email","phone","url","number","date","textarea","title","select","relation","classification"]},is_not_empty:{label:"N'est pas vide",icon:"∃",types:["text","email","phone","url","number","date","textarea","title","select","relation","classification"]}};function ze(t){const o=t||"text";return Object.entries(Gt).filter(([a,s])=>s.types.includes(o)).map(([a,s])=>({key:a,...s}))}function qe(t){return["number","currency","percent"].includes(t)?"number":["date","datetime"].includes(t)?"date":"text"}function er({savedViews:t=[],activeViewId:o,onSelectView:a,onCreateView:s,onDeleteView:g,onRenameView:S,onUpdateViewFilters:h,hasActiveFilters:M=!1,activeFilters:p={},fieldFilters:x=[],sidebarFilters:b=[],columns:c=[],externalOpenCreate:T=!1,onCloseExternalCreate:j}){const[R,E]=r.useState(!1),[G,_]=r.useState(!1),[m,Z]=r.useState(""),[P,A]=r.useState("#4361ee"),[Y,f]=r.useState(null),[l,q]=r.useState(null),[J,V]=r.useState(""),[C,v]=r.useState(null),[D,W]=r.useState([]),[oe,ne]=r.useState({}),[w,O]=r.useState(!1),U=r.useRef(null),i=r.useRef(null),N=r.useRef(null),L=r.useRef(null);r.useEffect(()=>{const u=z=>{Y&&i.current&&!i.current.contains(z.target)&&f(null)};return Y&&document.addEventListener("mousedown",u),()=>document.removeEventListener("mousedown",u)},[Y]),r.useEffect(()=>{R&&N.current&&setTimeout(()=>{var u;return(u=N.current)==null?void 0:u.focus()},100)},[R]),r.useEffect(()=>{T&&(E(!0),W([...x]),j==null||j())},[T]),r.useEffect(()=>{R&&!C&&(W([...x]),ne(JSON.parse(JSON.stringify(p||{}))))},[R]),r.useEffect(()=>{const u=z=>{w&&U.current&&!U.current.contains(z.target)&&O(!1)};return w&&document.addEventListener("mousedown",u),()=>document.removeEventListener("mousedown",u)},[w]),r.useEffect(()=>{l&&L.current&&(L.current.focus(),L.current.select())},[l]);const F=(u,z)=>{u.preventDefault(),f({viewId:z,x:u.clientX,y:u.clientY})},K=()=>{m.trim()&&(s({name:m.trim(),color:P,filters:oe,fieldFilters:D}),Z(""),A("#4361ee"),W([]),ne({}),E(!1))},X=r.useMemo(()=>c.filter(u=>u.id!=="actions"),[c]),se=r.useMemo(()=>{const u={};return b.forEach(z=>{u[`classif:${z.id}`]=z.options||[]}),u},[b]),de=r.useCallback(u=>{const z=X.find(fe=>fe.id===u);if(!z)return;const ce=u.startsWith("classif:"),ue=ze(z.type),ve=ce?ue.find(fe=>fe.key==="equals")||ue[0]:ue.find(fe=>fe.key==="contains")||ue[0],ye={fieldId:u,fieldName:z.name,fieldType:z.type||"text",operator:ve.key,value:"",value2:"",logic:"AND"};W(fe=>[...fe,ye]),O(!1)},[X]),d=r.useCallback((u,z)=>{W(ce=>ce.map((ue,ve)=>ve===u?{...ue,...z}:ue))},[]),H=r.useCallback(u=>{W(z=>z.filter((ce,ue)=>ue!==u))},[]),Q=u=>{const z=t.find(ce=>ce._id===u);z&&(q(u),V(z.name)),f(null)},$=()=>{l&&J.trim()&&S(l,J.trim()),q(null),V("")},me=u=>{g(u),f(null)},ee=u=>{const z=t.find(ce=>ce._id===u);z&&(v(u),Z(z.name||""),A(z.color||"#4361ee"),W(z.fieldFilters?JSON.parse(JSON.stringify(z.fieldFilters)):[]),ne(z.filters?JSON.parse(JSON.stringify(z.filters)):{}),E(!0),f(null))},pe=()=>{!m.trim()||!C||(h(C,oe,D,m.trim(),P),Z(""),A("#4361ee"),W([]),ne({}),v(null),E(!1))},Ce=u=>{var ce;let z=0;return u.filters&&(z+=Object.keys(u.filters).filter(ue=>ue!=="__favourites").length),(ce=u.fieldFilters)!=null&&ce.length&&(z+=u.fieldFilters.length),z};return e.jsxs(e.Fragment,{children:[e.jsxs("div",{className:"saved-views-tabs",children:[e.jsxs("button",{type:"button",className:`saved-view-tab ${o?"":"saved-view-tab--active"}`,onClick:()=>a(null),children:[e.jsxs("svg",{className:"saved-view-tab-icon",viewBox:"0 0 24 24",fill:"none",children:[e.jsx("path",{d:"M2 12C2 7.28595 2 4.92893 3.46447 3.46447C4.92893 2 7.28595 2 12 2C16.714 2 19.0711 2 20.5355 3.46447C22 4.92893 22 7.28595 22 12C22 16.714 22 19.0711 20.5355 20.5355C19.0711 22 16.714 22 12 22C7.28595 22 4.92893 22 3.46447 20.5355C2 19.0711 2 16.714 2 12Z",stroke:"currentColor",strokeWidth:"1.5"}),e.jsx("path",{d:"M6 12H18",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"}),e.jsx("path",{d:"M6 8H18",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"}),e.jsx("path",{d:"M6 16H18",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"})]}),"Tout"]}),t.map(u=>e.jsx("button",{type:"button",className:`saved-view-tab ${o===u._id?"saved-view-tab--active":""}`,style:{"--tab-color":u.color||"#4361ee"},onClick:()=>a(u._id),onContextMenu:z=>F(z,u._id),children:l===u._id?e.jsx("input",{ref:L,type:"text",value:J,onChange:z=>V(z.target.value),onBlur:$,onKeyDown:z=>{z.key==="Enter"&&$(),z.key==="Escape"&&(q(null),V(""))},className:"saved-view-tab-edit-input",onClick:z=>z.stopPropagation()}):e.jsxs(e.Fragment,{children:[e.jsx("span",{className:"saved-view-tab-dot",style:{backgroundColor:u.color||"#4361ee"}}),e.jsx("span",{className:"saved-view-tab-name",children:u.name}),Ce(u)>0&&e.jsx("span",{className:"saved-view-tab-badge",children:Ce(u)})]})},u._id)),e.jsx("button",{type:"button",className:"saved-view-tab saved-view-tab--add",onClick:()=>{v(null),Z(""),A("#4361ee"),E(!0)},title:"Enregistrer une vue",children:e.jsx("svg",{viewBox:"0 0 24 24",fill:"none",className:"h-3.5 w-3.5",children:e.jsx("path",{d:"M12 5V19M5 12H19",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round"})})})]}),Y&&e.jsxs("div",{ref:i,className:"saved-view-context-menu",style:{position:"fixed",top:Y.y,left:Y.x,zIndex:10001},children:[e.jsxs("button",{className:"saved-view-context-item",onClick:()=>Q(Y.viewId),children:[e.jsx("svg",{viewBox:"0 0 24 24",fill:"none",className:"h-4 w-4",children:e.jsx("path",{d:"M13.9027 6.37027L17.6297 10.0973M4 20.0001H8L18.5 9.50006C18.9978 9.00236 19.2786 8.32622 19.2786 7.62142C19.2786 6.91661 18.9978 6.24047 18.5 5.74277C18.0023 5.24508 17.3261 4.96426 16.6213 4.96426C15.9165 4.96426 15.2404 5.24508 14.7427 5.74277L4 16.0001V20.0001Z",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round"})}),"Renommer"]}),e.jsxs("button",{className:"saved-view-context-item",onClick:()=>ee(Y.viewId),children:[e.jsxs("svg",{viewBox:"0 0 24 24",fill:"none",className:"h-4 w-4",children:[e.jsx("path",{d:"M4.06189 13C4.02104 12.6724 4 12.3387 4 12C4 7.58172 7.58172 4 12 4C14.5006 4 16.7332 5.14727 18.2002 6.94416M19.9381 11C19.979 11.3276 20 11.6613 20 12C20 16.4183 16.4183 20 12 20C9.49944 20 7.26681 18.8527 5.79984 17.0558",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round"}),e.jsx("path",{d:"M15 7H19V3",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round"}),e.jsx("path",{d:"M9 17H5V21",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round"})]}),"Modifier la vue"]}),e.jsx("div",{className:"saved-view-context-separator"}),e.jsxs("button",{className:"saved-view-context-item saved-view-context-item--danger",onClick:()=>me(Y.viewId),children:[e.jsxs("svg",{viewBox:"0 0 24 24",fill:"none",className:"h-4 w-4",children:[e.jsx("path",{d:"M20.5001 6H3.5",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"}),e.jsx("path",{d:"M18.8334 8.5L18.3735 15.3991C18.1965 18.054 18.108 19.3815 17.243 20.1907C16.378 21 15.0476 21 12.3868 21H11.6134C8.9526 21 7.6222 21 6.75719 20.1907C5.89218 19.3815 5.80368 18.054 5.62669 15.3991L5.16675 8.5",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"}),e.jsx("path",{d:"M9.5 11L10 16",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"}),e.jsx("path",{d:"M14.5 11L14 16",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"}),e.jsx("path",{d:"M6.5 6C6.55588 6 6.58382 6 6.60915 5.99936C7.43259 5.97849 8.15902 5.45491 8.43922 4.68032C8.44784 4.65649 8.45667 4.62999 8.47434 4.57697L8.57143 4.28571C8.65431 4.03708 8.69575 3.91276 8.75071 3.8072C8.97001 3.38607 9.37574 3.09364 9.84461 3.01877C9.96213 3 10.0932 3 10.3553 3H13.6447C13.9068 3 14.0379 3 14.1554 3.01877C14.6243 3.09364 15.03 3.38607 15.2493 3.8072C15.3043 3.91276 15.3457 4.03708 15.4286 4.28571L15.5257 4.57697C15.5433 4.62992 15.5522 4.65651 15.5608 4.68032C15.841 5.45491 16.5674 5.97849 17.3909 5.99936C17.4162 6 17.4441 6 17.5 6",stroke:"currentColor",strokeWidth:"1.5"})]}),"Supprimer"]})]}),R&&e.jsx("div",{className:"saved-view-modal-overlay",onClick:()=>E(!1),children:e.jsxs("div",{className:"saved-view-modal",onClick:u=>u.stopPropagation(),children:[e.jsxs("div",{className:"saved-view-modal-header",children:[e.jsx("h3",{children:C?"Modifier la vue":"Enregistrer la vue"}),e.jsx("button",{type:"button",className:"saved-view-modal-close",onClick:()=>{E(!1),v(null)},children:e.jsx("svg",{viewBox:"0 0 24 24",fill:"none",className:"h-5 w-5",children:e.jsx("path",{d:"M18 6L6 18M6 6L18 18",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"})})})]}),e.jsxs("div",{className:"saved-view-modal-body",children:[e.jsxs("div",{className:"saved-view-form-group",children:[e.jsx("label",{className:"saved-view-form-label",children:"Nom de la vue"}),e.jsx("input",{ref:N,type:"text",value:m,onChange:u=>Z(u.target.value),onKeyDown:u=>{u.key==="Enter"&&K()},placeholder:"Ex: Hôtels, Clients VIP...",className:"saved-view-form-input"})]}),e.jsxs("div",{className:"saved-view-form-group",children:[e.jsx("label",{className:"saved-view-form-label",children:"Couleur"}),e.jsx("div",{className:"saved-view-color-grid",children:Qt.map(u=>e.jsx("button",{type:"button",className:`saved-view-color-swatch ${P===u?"saved-view-color-swatch--active":""}`,style:{backgroundColor:u},onClick:()=>A(u),children:P===u&&e.jsx("svg",{viewBox:"0 0 24 24",fill:"none",className:"h-3 w-3",children:e.jsx("path",{d:"M5 13L9 17L19 7",stroke:"white",strokeWidth:"2.5",strokeLinecap:"round",strokeLinejoin:"round"})})},u))})]}),b.length>0&&e.jsxs("div",{className:"saved-view-form-group",children:[e.jsx("label",{className:"saved-view-form-label",children:"Filtres de classification"}),e.jsx("div",{className:"svm-classif-editor",children:b.map(u=>{const z=oe[u.id]||[];return e.jsxs("div",{className:"svm-classif-group",children:[e.jsx("span",{className:"svm-classif-group-label",children:u.name}),e.jsx("div",{className:"svm-classif-options",children:(u.options||[]).map(ce=>{const ue=z.includes(ce.id);return e.jsxs("button",{type:"button",className:`svm-classif-pill ${ue?"svm-classif-pill--active":""}`,style:{"--pill-color":ce.color||"#9ca3af"},onClick:()=>{ne(ve=>{const ye=ve[u.id]||[];let fe;ue?fe=ye.filter(we=>we!==ce.id):fe=[...ye,ce.id];const ke={...ve};return fe.length>0?ke[u.id]=fe:delete ke[u.id],ke})},children:[ue&&e.jsx("svg",{viewBox:"0 0 24 24",fill:"none",className:"svm-classif-check",children:e.jsx("path",{d:"M5 13L9 17L19 7",stroke:"currentColor",strokeWidth:"2.5",strokeLinecap:"round",strokeLinejoin:"round"})}),ce.label]},ce.id)})})]},u.id)})})]}),e.jsxs("div",{className:"saved-view-form-group",children:[e.jsx("label",{className:"saved-view-form-label",children:"Filtres avancés"}),e.jsxs("div",{className:"svm-filter-builder",children:[D.map((u,z)=>{var we;const ce=(we=u.fieldId)==null?void 0:we.startsWith("classif:"),ue=ce?se[u.fieldId]||[]:[],ve=ze(u.fieldType),ye=["is_empty","is_not_empty"].includes(u.operator),fe=u.operator==="between",ke=u.logic||"AND";return e.jsxs($e.Fragment,{children:[z>0&&e.jsxs("div",{className:"svm-filter-connector",children:[e.jsx("span",{className:"svm-filter-connector-line"}),e.jsx("button",{type:"button",className:`svm-filter-connector-badge ${ke==="OR"?"svm-filter-connector-badge--or":""}`,onClick:()=>d(z,{logic:ke==="AND"?"OR":"AND"}),title:"Cliquez pour basculer ET/OU",children:ke==="OR"?"OU":"ET"}),e.jsx("span",{className:"svm-filter-connector-line"})]}),e.jsxs("div",{className:"svm-filter-row",children:[e.jsx("select",{value:u.fieldId,onChange:le=>{const je=X.find(Me=>Me.id===le.target.value);if(je){const Me=le.target.value.startsWith("classif:"),Ne=ze(je.type),Se=Me?Ne.find(ge=>ge.key==="equals")||Ne[0]:Ne.find(ge=>ge.key===u.operator)||Ne[0];d(z,{fieldId:je.id,fieldName:je.name,fieldType:je.type||"text",operator:Se.key,value:"",value2:""})}},className:"svm-filter-select svm-filter-select--field",children:X.map(le=>e.jsx("option",{value:le.id,children:le.name},le.id))}),e.jsx("select",{value:u.operator,onChange:le=>d(z,{operator:le.target.value,value:["is_empty","is_not_empty"].includes(le.target.value)?"":u.value,value2:""}),className:"svm-filter-select svm-filter-select--op",children:ve.map(le=>e.jsx("option",{value:le.key,children:le.label},le.key))}),!ye&&(ce&&ue.length>0?e.jsxs("select",{value:u.value,onChange:le=>d(z,{value:le.target.value}),className:"svm-filter-select svm-filter-select--val",children:[e.jsx("option",{value:"",children:"Sélectionnez..."}),ue.map(le=>e.jsx("option",{value:le.label,children:le.label},le.id))]}):e.jsx("input",{type:qe(u.fieldType),value:u.value,onChange:le=>d(z,{value:le.target.value}),placeholder:"Valeur...",className:"svm-filter-input"})),fe&&e.jsx("input",{type:qe(u.fieldType),value:u.value2||"",onChange:le=>d(z,{value2:le.target.value}),placeholder:"Max...",className:"svm-filter-input"}),e.jsx("button",{type:"button",className:"svm-filter-remove",onClick:()=>H(z),title:"Supprimer ce filtre",children:e.jsx("svg",{viewBox:"0 0 24 24",fill:"none",className:"h-3.5 w-3.5",children:e.jsx("path",{d:"M18 6L6 18M6 6L18 18",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round"})})})]})]},z)}),e.jsxs("div",{className:"svm-filter-add-row",ref:U,children:[e.jsxs("button",{type:"button",className:"svm-filter-add-btn",onClick:()=>O(!w),children:[e.jsx("svg",{viewBox:"0 0 24 24",fill:"none",className:"h-3.5 w-3.5",children:e.jsx("path",{d:"M12 5V19M5 12H19",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round"})}),"Ajouter un filtre"]}),w&&e.jsxs("div",{className:"svm-filter-field-dropdown",children:[e.jsx("div",{className:"svm-filter-field-dropdown-title",children:"Choisir un champ"}),X.map(u=>e.jsx("button",{type:"button",className:"svm-filter-field-option",onClick:()=>de(u.id),children:u.name},u.id))]})]})]})]})]}),e.jsxs("div",{className:"saved-view-modal-footer",children:[e.jsx("button",{type:"button",className:"saved-view-btn saved-view-btn--cancel",onClick:()=>{E(!1),v(null)},children:"Annuler"}),e.jsxs("button",{type:"button",className:"saved-view-btn saved-view-btn--save",onClick:C?pe:K,disabled:!m.trim(),children:[e.jsx("svg",{viewBox:"0 0 24 24",fill:"none",className:"h-4 w-4",children:e.jsx("path",{d:"M5 13L9 17L19 7",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round"})}),C?"Mettre à jour":"Enregistrer"]})]})]})}),e.jsx("style",{children:`
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
            `})]})}function tr(t,o){var s,g,S;if(o==="title")return t.referenceTitle||t.computedTitle||t.title||"";if(o==="createdAt")return t.createdAt||"";if(o==="updatedAt")return t.updatedAt||"";if(o.startsWith("rel:")){const h=o.replace("rel:",""),p=(((s=t._denorm)==null?void 0:s.relations)||[]).find(c=>c.relationKey===h);if(((g=p==null?void 0:p.records)==null?void 0:g.length)>0)return p.records.map(c=>c.title||c.computedTitle||"").join(", ");const x=(t.relations||[]).find(c=>c.key===h||c.relationKey===h);if(x)return x.title||x.computedTitle||x.value||"";const b=(S=t._denorm)==null?void 0:S[h];return b&&(b.title||b.computedTitle)||""}if(o.startsWith("classif:")){const h=o.replace("classif:","");return(t.classificationValues||[]).filter(x=>{var b;return((b=x.classificationId)==null?void 0:b.toString())===h}).map(x=>x.label||x.optionLabel||"").join(", ")}const a=(t.customFields||[]).find(h=>{var M,p,x;return((p=(M=h.field_id)==null?void 0:M._id)==null?void 0:p.toString())===o||((x=h.field_id)==null?void 0:x.toString())===o});return(a==null?void 0:a.value)??""}function rr(t,o){const{operator:a,value:s,value2:g,fieldType:S}=o,h=["number","currency","percent"].includes(S),M=["date","datetime"].includes(S),p=String(t??"").trim(),x=p.toLowerCase(),b=String(s??"").trim().toLowerCase();switch(a){case"contains":return x.includes(b);case"not_contains":return!x.includes(b);case"equals":return h?parseFloat(p)===parseFloat(s):x===b;case"not_equals":return h?parseFloat(p)!==parseFloat(s):x!==b;case"starts_with":return x.startsWith(b);case"ends_with":return x.endsWith(b);case"gt":return M?new Date(t)>new Date(s):parseFloat(p)>parseFloat(s);case"gte":return M?new Date(t)>=new Date(s):parseFloat(p)>=parseFloat(s);case"lt":return M?new Date(t)<new Date(s):parseFloat(p)<parseFloat(s);case"lte":return M?new Date(t)<=new Date(s):parseFloat(p)<=parseFloat(s);case"between":{if(M){const T=new Date(t);return T>=new Date(s)&&T<=new Date(g)}const c=parseFloat(p);return c>=parseFloat(s)&&c<=parseFloat(g)}case"is_empty":return p===""||t==null;case"is_not_empty":return p!==""&&t!=null;default:return!0}}function sr({accountId:t,accountNumber:o,entityId:a,viewId:s,entityName:g,entityNamePlural:S,entitySlug:h}){const[M,p]=r.useState([]),[x,b]=r.useState([]),[c,T]=r.useState([]),[j,R]=r.useState([]),[E,G]=r.useState(!0),[_,m]=r.useState(null),[Z,P]=r.useState(""),[A,Y]=r.useState("table"),[f,l]=r.useState(""),[q,J]=r.useState(null),[V,C]=r.useState(new Set),[v,D]=r.useState(!1),W=r.useRef(null),[oe,ne]=r.useState([]),[w,O]=r.useState({}),[U,i]=r.useState([]),[N,L]=r.useState([]),[F,K]=r.useState(null),[X,se]=r.useState(!1),[de,d]=r.useState(null),H=r.useRef(null),Q=r.useCallback((n,k="success")=>{H.current&&clearTimeout(H.current),d({message:n,type:k}),H.current=setTimeout(()=>d(null),2500)},[]),[$,me]=r.useState({columns:[],sort:{field:"createdAt",direction:"desc"},density:"normal",pageSize:10,titleDisplay:"avatar",showSidebar:!0,sidebarWidth:280,viewMode:null,enabledViews:["table","kanban","notes","calendar"]}),[ee,pe]=r.useState({page:1,limit:10,total:0,pages:0}),Ce=r.useRef(null),u=r.useCallback(async()=>{var n,k;try{G(!0),m(null);const I=new URLSearchParams({limit:1e4,sort:`${$.sort.field}:${$.sort.direction}`}),B=await fetch(`/account/${o}/api/entity/${a}/views/${s}/records?${I}`,{credentials:"include"});if(!B.ok)throw new Error(`HTTP ${B.status}`);const y=await B.json();if(p(y.records||[]),b(y.records||[]),y.entity&&(J(y.entity),y.entity.icon&&l(y.entity.icon)),y.filters&&ne(y.filters),y.preferences)if(me(re=>{var te,ae;return{...re,...y.preferences,columns:(te=y.preferences.columns)!=null&&te.length?y.preferences.columns:((ae=y.columns)==null?void 0:ae.map(ie=>({id:ie.id,visible:!0})))||[]}}),y.preferences.pageSize&&pe(re=>({...re,limit:y.preferences.pageSize})),y.preferences.viewMode&&Y(y.preferences.viewMode),(n=y.preferences.columns)!=null&&n.length&&((k=y.columns)!=null&&k.length)){const re=[];y.preferences.columns.forEach(te=>{const ae=y.columns.find(ie=>ie.id===te.id);ae&&re.push(ae)}),y.columns.forEach(te=>{re.find(ae=>ae.id===te.id)||re.push(te)}),R(re)}else R(y.columns||[]);else y.columns&&(R(y.columns||[]),me(re=>({...re,columns:y.columns.map(te=>({id:te.id,visible:!0}))})))}catch(I){console.error("[RecordsGrid] Fetch error:",I),m(I.message)}finally{G(!1)}},[o,a,s,$.sort]),z=r.useCallback(async()=>{try{const n=await fetch(`/account/${o}/api/entity/${a}/saved-views`,{credentials:"include"});if(n.ok){const k=await n.json();L(k.views||[])}}catch(n){console.error("[RecordsGrid] Fetch saved views error:",n)}},[o,a]),ce=r.useCallback(async({name:n,color:k,filters:I,fieldFilters:B})=>{try{const y=await fetch(`/account/${o}/api/entity/${a}/saved-views`,{method:"POST",headers:{"Content-Type":"application/json"},credentials:"include",body:JSON.stringify({name:n,color:k,filters:I,fieldFilters:B})});if(y.ok){const re=await y.json();L(te=>[...te,re.view]),K(re.view._id)}}catch(y){console.error("[RecordsGrid] Create saved view error:",y)}},[o,a]),ue=r.useCallback(async n=>{try{(await fetch(`/account/${o}/api/entity/${a}/saved-views/${n}`,{method:"DELETE",credentials:"include"})).ok&&(L(I=>I.filter(B=>B._id!==n)),F===n&&(K(null),O({}),pe(I=>({...I,page:1}))))}catch(k){console.error("[RecordsGrid] Delete saved view error:",k)}},[o,a,F]),ve=r.useCallback(async(n,k)=>{try{(await fetch(`/account/${o}/api/entity/${a}/saved-views/${n}`,{method:"PUT",headers:{"Content-Type":"application/json"},credentials:"include",body:JSON.stringify({name:k})})).ok&&L(B=>B.map(y=>y._id===n?{...y,name:k}:y))}catch(I){console.error("[RecordsGrid] Rename saved view error:",I)}},[o,a]),ye=r.useCallback(async(n,k,I,B,y)=>{var re;try{const te={filters:k,fieldFilters:I||[]};if(B&&(te.name=B),y&&(te.color=y),(await fetch(`/account/${o}/api/entity/${a}/saved-views/${n}`,{method:"PUT",headers:{"Content-Type":"application/json"},credentials:"include",body:JSON.stringify(te)})).ok){const ie=JSON.parse(JSON.stringify(k||{})),xe=JSON.parse(JSON.stringify(I||[]));L(be=>be.map(Le=>{if(Le._id!==n)return Le;const De={...Le,filters:ie,fieldFilters:xe};return B&&(De.name=B),y&&(De.color=y),De}));const he=B||((re=N.find(be=>be._id===n))==null?void 0:re.name)||"Vue";Q(`Vue "${he}" mise à jour`)}else Q("Erreur lors de la mise à jour","error")}catch(te){console.error("[RecordsGrid] Update saved view error:",te),Q("Erreur lors de la mise à jour","error")}},[o,a,N,Q]),fe=r.useCallback(n=>{if(!n){K(null),O({}),i([]),pe(I=>({...I,page:1}));return}const k=N.find(I=>I._id===n);k&&(K(n),O(JSON.parse(JSON.stringify(k.filters||{}))),i(JSON.parse(JSON.stringify(k.fieldFilters||[]))),pe(I=>({...I,page:1})))},[N]);r.useEffect(()=>{u(),z()},[]);const ke=r.useMemo(()=>{if(!M.length)return[];const{field:n,direction:k}=$.sort,I=k==="asc"?1:-1;return[...M].sort((B,y)=>{let re,te;if(n==="title")re=(B.referenceTitle||B.title||"").toLowerCase(),te=(y.referenceTitle||y.title||"").toLowerCase();else if(n==="createdAt"||n==="updatedAt")re=new Date(B[n]||0).getTime(),te=new Date(y[n]||0).getTime();else{const ae=(B.customFields||[]).find(xe=>{var be;const he=((be=xe.field_id)==null?void 0:be._id)||xe.field_id;return(he==null?void 0:he.toString())===n}),ie=(y.customFields||[]).find(xe=>{var be;const he=((be=xe.field_id)==null?void 0:be._id)||xe.field_id;return(he==null?void 0:he.toString())===n});re=((ae==null?void 0:ae.value)||"").toString().toLowerCase(),te=((ie==null?void 0:ie.value)||"").toString().toLowerCase()}return re<te?-1*I:re>te?1*I:0})},[M,$.sort.field,$.sort.direction]),we=r.useMemo(()=>ke.map(n=>({...n,_searchIndex:[n.title||"",n.referenceTitle||"",n.computedTitle||"",...(n.customFields||[]).map(k=>k.value||"")].join(" ").toLowerCase()})),[ke]),le=r.useCallback((n,k,I,B)=>{let y=n;if(k&&k.trim()){const te=k.toLowerCase();y=y.filter(ae=>ae._searchIndex.includes(te))}const re=Object.keys(I).filter(te=>te!=="__favourites");return re.length>0&&(y=y.filter(te=>{const ae=te.classificationValues||[];return re.every(ie=>{const xe=I[ie];return!xe||xe.length===0?!0:ae.some(he=>{var be,Le;return((be=he.classificationId)==null?void 0:be.toString())===ie&&xe.includes((Le=he.optionId)==null?void 0:Le.toString())})})})),B&&B.length>0&&(y=y.filter(te=>{const ae=[[B[0]]];for(let ie=1;ie<B.length;ie++)(B[ie].logic||"AND")==="OR"?ae.push([B[ie]]):ae[ae.length-1].push(B[ie]);return ae.some(ie=>ie.every(xe=>{const he=tr(te,xe.fieldId);return rr(he,xe)}))})),y},[]),je=r.useCallback(n=>{var I;const k=typeof n=="string"?n:((I=n==null?void 0:n.target)==null?void 0:I.value)||"";P(k),pe(B=>({...B,page:1}))},[]),Me=r.useCallback(n=>{O(n),pe(k=>({...k,page:1}))},[]),Ne=r.useCallback(n=>{i(n),pe(k=>({...k,page:1}))},[]);r.useEffect(()=>{const n=le(we,Z,w,U);b(n)},[we,Z,w,U,le]),r.useEffect(()=>{const n=(ee.page-1)*ee.limit,k=n+ee.limit,I=x.slice(n,k);T(I),pe(B=>({...B,total:x.length,pages:Math.ceil(x.length/ee.limit)}))},[x,ee.page,ee.limit]);const Se=r.useCallback(async n=>{try{await fetch(`/account/${o}/api/user/view-preferences`,{method:"POST",headers:{"Content-Type":"application/json"},credentials:"include",body:JSON.stringify({viewId:s,preferences:n})})}catch(k){console.error("[RecordsGrid] Save preferences error:",k)}},[o,s]),ge=r.useCallback((n,k)=>{const I={...$,[n]:k};me(I),Se(I),n==="pageSize"&&pe(B=>({...B,limit:k,page:1}))},[$,Se]),et=r.useCallback(n=>{Y(n),me(k=>{const I={...k,viewMode:n};return Se(I),I})},[Se]),Re=r.useCallback(n=>{pe(k=>({...k,page:n}))},[]),tt=r.useCallback((n,k,I)=>{if(I&&W.current!==null&&W.current!==k){const B=Math.min(W.current,k),y=Math.max(W.current,k);C(re=>{const te=new Set(re);for(let ae=B;ae<=y;ae++)c[ae]&&te.add(c[ae]._id);return te})}else C(B=>{const y=new Set(B);return y.has(n)?y.delete(n):y.add(n),y});W.current=k},[c]),rt=r.useCallback(()=>{C(n=>{const k=c.map(y=>y._id),I=k.every(y=>n.has(y)),B=new Set(n);return I?k.forEach(y=>B.delete(y)):k.forEach(y=>B.add(y)),B})},[c]),st=r.useCallback(()=>{C(n=>{const k=x.map(I=>I._id);return n.size===k.length?new Set:new Set(k)})},[x]),at=r.useCallback(()=>{C(new Set)},[]),ot=r.useMemo(()=>c.length===0?!1:c.every(n=>V.has(n._id)),[c,V]),nt=r.useCallback(async()=>{if(!(V.size===0||!(typeof Swal<"u"?await Swal.fire({title:"Confirmer la suppression",html:`<p>Vous allez supprimer <strong>${V.size}</strong> enregistrement(s).</p><p style="color:#e7515a;font-size:13px;margin-top:8px;">Cette action est irréversible.</p>`,icon:"warning",showCancelButton:!0,confirmButtonColor:"#e7515a",cancelButtonText:"Annuler",confirmButtonText:"Supprimer"}).then(k=>k.isConfirmed):confirm(`Supprimer ${V.size} enregistrement(s) ?`)))){D(!0);try{const I=await(await fetch(`/account/${o}/record/api/bulk-delete`,{method:"POST",headers:{"Content-Type":"application/json"},credentials:"include",body:JSON.stringify({ids:[...V]})})).json();I.success?(p(B=>B.filter(y=>!V.has(y._id))),C(new Set),Q(`${I.deletedCount} enregistrement(s) supprimé(s)`)):Q(I.error||"Erreur lors de la suppression","error")}catch(k){console.error("[RecordsGrid] Bulk delete error:",k),Q("Erreur lors de la suppression","error")}finally{D(!1)}}},[V,o,Q]),it=r.useCallback((n,k)=>{R(I=>{const B=I.findIndex(ie=>ie.id===n),y=I.findIndex(ie=>ie.id===k);if(B===-1||y===-1)return I;const re=[...I],[te]=re.splice(B,1);re.splice(y,0,te);const ae=re.map(ie=>$.columns.find(he=>he.id===ie.id)||{id:ie.id,visible:!0});return ge("columns",ae),re})},[$.columns,ge]),Be=r.useMemo(()=>{switch($.density){case"compact":return 36;case"comfortable":return 56;default:return 44}},[$.density]),Ee=ct({count:c.length,getScrollElement:()=>Ce.current,estimateSize:()=>Be,overscan:10});r.useEffect(()=>{Ee.measure()},[Be,Ee]);const lt=r.useMemo(()=>{var I;let n;(I=$.columns)!=null&&I.length?n=j.filter(B=>{const y=$.columns.find(re=>re.id===B.id);return y?y.visible!==!1:!0}):n=j;const k=n.findIndex(B=>B.id==="actions");if(k>-1&&k<n.length-1){const[B]=n.splice(k,1);n=[...n,B]}return n},[j,$.columns]);return E&&c.length===0?e.jsx("div",{className:"flex items-center justify-center h-64",children:e.jsx("div",{className:"animate-spin rounded-full h-8 w-8 border-b-2 border-primary"})}):_&&c.length===0?e.jsx("div",{className:"flex items-center justify-center h-64 text-danger",children:e.jsxs("span",{children:["Erreur: ",_]})}):e.jsxs("div",{className:"relative flex h-full gap-5 sm:min-h-0",children:[e.jsx(Xt,{entityName:g,entityNamePlural:S,entityIcon:f,accountNumber:o,entitySlug:h,showSidebar:$.showSidebar!==!1,onToggleSidebar:()=>ge("showSidebar",!$.showSidebar),filters:oe,activeFilters:w,onFilterChange:Me,columns:j,fieldFilters:U,onFieldFiltersChange:Ne,allRecords:M,sidebarWidth:$.sidebarWidth,onSidebarWidthChange:n=>ge("sidebarWidth",n)}),e.jsxs("div",{className:`panel p-4 flex-1 flex flex-col h-full ${A==="calendar"?"overflow-auto":"overflow-hidden"}`,children:[e.jsx(Nt,{searchQuery:Z,onSearch:je,columns:j,preferences:$,onPreferencesChange:ge,loading:E,accountNumber:o,entitySlug:h,viewId:s,showSidebar:$.showSidebar!==!1,onToggleSidebar:()=>ge("showSidebar",!$.showSidebar),activeView:A,onViewChange:et,enabledViews:$.enabledViews||["table","kanban","notes"],onEnabledViewsChange:n=>ge("enabledViews",n),hasActiveFilters:Object.keys(w).filter(n=>n!=="__favourites").length>0||U.length>0,onOpenSaveView:()=>se(!0)}),e.jsx(er,{savedViews:N,activeViewId:F,onSelectView:fe,onCreateView:ce,onDeleteView:ue,onRenameView:ve,onUpdateViewFilters:ye,hasActiveFilters:Object.keys(w).filter(n=>n!=="__favourites").length>0||U.length>0,activeFilters:w,fieldFilters:U,sidebarFilters:oe,columns:j,externalOpenCreate:X,onCloseExternalCreate:()=>se(!1)}),e.jsx("div",{className:`flex-1 flex flex-col mt-4 ${A==="calendar"?"overflow-auto":"overflow-hidden"}`,children:A==="kanban"?e.jsx(Wt,{records:x,columns:j,accountNumber:o,entitySlug:h,viewId:s,entityData:q}):A==="calendar"?e.jsx(Yt,{records:x,columns:j,accountNumber:o,entitySlug:h,entityData:q}):A==="notes"?e.jsx(Bt,{records:x,accountNumber:o,entitySlug:h}):e.jsxs("div",{className:"dataTable-wrapper flex-1 flex flex-col overflow-hidden",children:[e.jsx("div",{className:"dataTable-container flex-1 overflow-auto",ref:Ce,children:e.jsx(St,{records:c,columns:lt,virtualizer:Ee,sort:$.sort,onSort:n=>{const k=$.sort.field===n&&$.sort.direction==="asc"?"desc":"asc";ge("sort",{field:n,direction:k})},onColumnReorder:it,density:$.density,titleDisplay:$.titleDisplay||"avatar",entityIcon:f,accountNumber:o,entitySlug:h,selectedIds:V,onToggleSelect:tt,onSelectAll:rt,allPageSelected:ot,showCheckboxes:$.showCheckboxes!==!1})}),e.jsxs("div",{className:"dataTable-bottom flex items-center justify-between border-t pt-4 dark:border-gray-800",children:[e.jsxs("div",{className:"dataTable-info text-gray-500 dark:text-gray-400",children:["Affichage de ",(ee.page-1)*ee.limit+1," à ",Math.min(ee.page*ee.limit,ee.total)," sur ",ee.total]}),e.jsx("nav",{className:"dataTable-pagination",children:e.jsxs("ul",{className:"inline-flex items-center space-x-1 rtl:space-x-reverse",children:[e.jsx("li",{children:e.jsx("button",{onClick:()=>Re(ee.page-1),disabled:ee.page<=1,className:"flex justify-center font-semibold p-2 rounded-full transition bg-white-light text-dark hover:text-white hover:bg-primary dark:text-white-light dark:bg-[#191e3a] dark:hover:bg-primary disabled:opacity-50",children:"«"})}),Array.from({length:Math.min(ee.pages,5)},(n,k)=>{let I;return ee.pages<=5||ee.page<=3?I=k+1:ee.page>=ee.pages-2?I=ee.pages-4+k:I=ee.page-2+k,e.jsx("li",{children:e.jsx("button",{onClick:()=>Re(I),className:`flex justify-center font-semibold px-3.5 py-2 rounded-full transition ${I===ee.page?"bg-primary text-white dark:bg-primary dark:text-white-light":"bg-white-light text-dark hover:text-white hover:bg-primary dark:text-white-light dark:bg-[#191e3a] dark:hover:bg-primary"}`,children:I})},I)}),e.jsx("li",{children:e.jsx("button",{onClick:()=>Re(ee.page+1),disabled:ee.page>=ee.pages,className:"flex justify-center font-semibold p-2 rounded-full transition bg-white-light text-dark hover:text-white hover:bg-primary dark:text-white-light dark:bg-[#191e3a] dark:hover:bg-primary disabled:opacity-50",children:"»"})})]})})]})]})})]}),V.size>0&&e.jsxs("div",{className:"bulk-action-bar",style:{position:"fixed",bottom:"24px",left:"50%",transform:"translateX(-50%)",zIndex:99999,display:"flex",alignItems:"center",gap:"12px",padding:"10px 20px",borderRadius:"14px",background:"linear-gradient(135deg, #1b2e4b 0%, #0e1726 100%)",boxShadow:"0 8px 32px rgba(0,0,0,0.3), 0 0 0 1px rgba(67,97,238,0.2)",animation:"bulkBarSlideUp 0.3s cubic-bezier(0.16,1,0.3,1)",backdropFilter:"blur(12px)"},children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"8px"},children:[e.jsx("div",{style:{width:28,height:28,borderRadius:"8px",background:"rgba(67,97,238,0.2)",color:"#4361ee",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"12px",fontWeight:700},children:V.size}),e.jsxs("span",{style:{color:"#e0e6ed",fontSize:"13px",fontWeight:500,whiteSpace:"nowrap"},children:["sélectionné",V.size>1?"s":""]})]}),e.jsx("div",{style:{width:1,height:24,background:"rgba(255,255,255,0.1)"}}),V.size<x.length&&e.jsxs("button",{onClick:st,style:{padding:"6px 12px",borderRadius:"8px",border:"1px solid rgba(67,97,238,0.3)",background:"rgba(67,97,238,0.1)",color:"#93b4fd",fontSize:"12px",fontWeight:600,cursor:"pointer",transition:"all 0.15s",whiteSpace:"nowrap"},onMouseEnter:n=>{n.target.style.background="rgba(67,97,238,0.2)",n.target.style.color="#b8cffe"},onMouseLeave:n=>{n.target.style.background="rgba(67,97,238,0.1)",n.target.style.color="#93b4fd"},children:["Tout sélectionner (",x.length,")"]}),e.jsx("div",{style:{width:1,height:24,background:"rgba(255,255,255,0.1)"}}),e.jsxs("button",{onClick:nt,disabled:v,style:{display:"flex",alignItems:"center",gap:"6px",padding:"6px 14px",borderRadius:"8px",border:"none",background:"rgba(231,81,90,0.15)",color:"#ff6b6b",fontSize:"12px",fontWeight:600,cursor:v?"wait":"pointer",transition:"all 0.15s",whiteSpace:"nowrap",opacity:v?.6:1},onMouseEnter:n=>{v||(n.target.style.background="rgba(231,81,90,0.25)",n.target.style.color="#ff8a8a")},onMouseLeave:n=>{n.target.style.background="rgba(231,81,90,0.15)",n.target.style.color="#ff6b6b"},children:[e.jsxs("svg",{viewBox:"0 0 24 24",fill:"none",style:{width:14,height:14},children:[e.jsx("path",{d:"M20.5 6H3.5",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"}),e.jsx("path",{d:"M18.833 8.5L18.373 15.4C18.196 18.054 18.108 19.381 17.243 20.19C16.378 21 15.048 21 12.387 21H11.613C8.952 21 7.622 21 6.757 20.19C5.892 19.381 5.804 18.054 5.627 15.4L5.167 8.5",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"})]}),v?"Suppression...":"Supprimer"]}),e.jsx("div",{style:{width:1,height:24,background:"rgba(255,255,255,0.1)"}}),e.jsx("button",{onClick:at,style:{width:28,height:28,borderRadius:"8px",border:"none",background:"rgba(255,255,255,0.08)",color:"#888ea8",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",transition:"all 0.15s"},onMouseEnter:n=>{n.target.style.background="rgba(255,255,255,0.15)",n.target.style.color="#e0e6ed"},onMouseLeave:n=>{n.target.style.background="rgba(255,255,255,0.08)",n.target.style.color="#888ea8"},title:"Désélectionner tout",children:e.jsx("svg",{viewBox:"0 0 24 24",fill:"none",style:{width:14,height:14},children:e.jsx("path",{d:"M18 6L6 18M6 6L18 18",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round"})})})]}),de&&e.jsxs("div",{style:{position:"fixed",bottom:V.size>0?"80px":"24px",right:"24px",zIndex:99999,padding:"10px 20px",borderRadius:"10px",fontSize:"13px",fontWeight:500,color:"#fff",background:de.type==="error"?"#e7515a":"#00ab55",boxShadow:"0 4px 20px rgba(0,0,0,0.15)",animation:"toastSlideIn 0.25s ease-out",display:"flex",alignItems:"center",gap:"8px",transition:"bottom 0.3s ease"},children:[e.jsx("svg",{viewBox:"0 0 24 24",fill:"none",style:{width:16,height:16,flexShrink:0},children:de.type==="error"?e.jsx("path",{d:"M12 8V12M12 16H12.01M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"}):e.jsx("path",{d:"M5 13L9 17L19 7",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round"})}),de.message]}),e.jsx("style",{children:`
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
            `})]})}function Ke(){document.querySelectorAll('[data-island="records-grid"]').forEach(t=>{if(t.dataset.mounted==="1")return;t.dataset.mounted="1";const o={accountId:t.dataset.accountId,accountNumber:t.dataset.accountNumber,entityId:t.dataset.entityId,viewId:t.dataset.viewId,entityName:t.dataset.entityName||"Records",entityNamePlural:t.dataset.entityNamePlural||"",entitySlug:t.dataset.entitySlug||"records"};console.log("[RecordsGrid Island] Mounting:",o),dt(t).render(e.jsx($e.StrictMode,{children:e.jsx(sr,{...o})}))})}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",Ke):Ke();
