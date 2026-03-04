import{r as t,j as e,a as _e,R as $e,c as lt}from"./chunks/client-CkWOIrXP.js";import{u as dt}from"./chunks/index-CjVSFo3p.js";import{C as Ke}from"./chunks/CardRenderer-BfJgMJGc.js";import{u as ct,a as Te,D as ut,c as pt,b as ft,d as xt,s as ht,K as mt,T as gt,M as bt,e as vt,S as kt,v as yt,f as wt,C as jt}from"./chunks/sortable.esm-DQ9-A8Dw.js";const Be=[{id:"table",label:"Tableau",icon:e.jsxs("svg",{viewBox:"0 0 24 24",fill:"none",className:"h-4 w-4",children:[e.jsx("path",{d:"M3 7H21",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"}),e.jsx("path",{d:"M3 12H21",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"}),e.jsx("path",{d:"M3 17H21",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"})]})},{id:"kanban",label:"Kanban",icon:e.jsxs("svg",{viewBox:"0 0 24 24",fill:"none",className:"h-4 w-4",children:[e.jsx("rect",{x:"3",y:"3",width:"5",height:"18",rx:"1",stroke:"currentColor",strokeWidth:"1.5"}),e.jsx("rect",{x:"10",y:"3",width:"5",height:"12",rx:"1",stroke:"currentColor",strokeWidth:"1.5"}),e.jsx("rect",{x:"17",y:"3",width:"4",height:"15",rx:"1",stroke:"currentColor",strokeWidth:"1.5"})]})},{id:"notes",label:"Notes",icon:e.jsxs("svg",{viewBox:"0 0 24 24",fill:"none",className:"h-4 w-4",children:[e.jsx("path",{d:"M2 12C2 7.28595 2 4.92893 3.46447 3.46447C4.92893 2 7.28595 2 12 2C16.714 2 19.0711 2 20.5355 3.46447C22 4.92893 22 7.28595 22 12C22 16.714 22 19.0711 20.5355 20.5355C19.0711 22 16.714 22 12 22C7.28595 22 4.92893 22 3.46447 20.5355C2 19.0711 2 16.714 2 12Z",stroke:"currentColor",strokeWidth:"1.5"}),e.jsx("path",{opacity:"0.5",d:"M2 12H22",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"}),e.jsx("path",{opacity:"0.5",d:"M12 2V22",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"})]})},{id:"calendar",label:"Calendrier",icon:e.jsxs("svg",{viewBox:"0 0 24 24",fill:"none",className:"h-4 w-4",children:[e.jsx("rect",{x:"3",y:"4",width:"18",height:"18",rx:"2",stroke:"currentColor",strokeWidth:"1.5"}),e.jsx("path",{d:"M16 2V6M8 2V6M3 10H21",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"}),e.jsx("circle",{cx:"12",cy:"16",r:"1",fill:"currentColor"}),e.jsx("circle",{cx:"16",cy:"16",r:"1",fill:"currentColor"}),e.jsx("circle",{cx:"8",cy:"16",r:"1",fill:"currentColor"})]})}];function Ct({searchQuery:r,onSearch:n,columns:a,preferences:s,onPreferencesChange:l,loading:v,accountNumber:d,entitySlug:S,viewId:h,showSidebar:c,onToggleSidebar:b,activeView:f,onViewChange:M,enabledViews:k=["table","kanban","notes"],onEnabledViewsChange:R,hasActiveFilters:F=!1,onOpenSaveView:Q}){var K,ne,x;const[_,m]=t.useState(!1),[Y,U]=t.useState(!1),[H,X]=t.useState(!1),[p,g]=t.useState(!1),[te,B]=t.useState(""),J=t.useRef(null),D=t.useRef(null),L=t.useRef(null),E=t.useRef(null),I=t.useRef(null),oe=t.useRef(null),ae=t.useRef(null),ue=t.useRef(null),fe=()=>{m(!1),U(!1),X(!1),g(!1)};t.useEffect(()=>{const o=j=>{j.key==="Escape"&&fe()};return document.addEventListener("keydown",o),()=>document.removeEventListener("keydown",o)},[]);const y=(o,j,V,w)=>{t.useEffect(()=>{const se=z=>{o&&j.current&&!j.current.contains(z.target)&&V.current&&!V.current.contains(z.target)&&w(!1)};return o&&setTimeout(()=>document.addEventListener("mousedown",se),0),()=>document.removeEventListener("mousedown",se)},[o])};y(_,I,J,m),y(Y,oe,D,U),y(H,ae,L,X),y(p,ue,E,g);const O=o=>{if(o==="table")return;const j=k.includes(o)?k.filter(V=>V!==o):[...k,o];R(j),f===o&&!j.includes(o)&&M("table")},Z=Be.filter(o=>k.includes(o.id)),W=o=>{const j=s.columns.some(w=>w.id===o);let V;j?V=s.columns.map(w=>w.id===o?{...w,visible:!w.visible}:w):V=[...s.columns,{id:o,visible:!1}],l("columns",V)},q=o=>{if(!(o!=null&&o.current))return{top:0,right:0};const j=o.current.getBoundingClientRect();return{top:j.bottom+8,right:window.innerWidth-j.right}},P=te.trim()?a.filter(o=>o.name.toLowerCase().includes(te.toLowerCase())):a;return e.jsxs("div",{className:"dataTable-top flex items-center mb-0 justify-between gap-2",children:[e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsxs("a",{href:`/account/${d}/record/${S}/add`,className:"btn-add-expandable block rounded-full p-2 bg-white-light/40 hover:bg-white-light/90 hover:text-primary dark:bg-dark/40 dark:hover:bg-dark/60",title:"Ajouter",children:[e.jsx("svg",{className:"btn-add-icon",viewBox:"0 0 24 24",fill:"none",children:e.jsx("path",{d:"M12 5V19M5 12H19",stroke:"currentColor",strokeWidth:"2.5",strokeLinecap:"round"})}),e.jsx("span",{className:"btn-add-label",children:"Ajouter"})]}),e.jsxs("div",{className:"dataTable-search relative w-64",style:{marginLeft:0},children:[e.jsxs("svg",{className:"absolute left-4 top-1/2 ml-2 -translate-y-1/2 h-4 w-4 text-gray-400",viewBox:"0 0 24 24",fill:"none",children:[e.jsx("circle",{cx:"11",cy:"11",r:"8",stroke:"currentColor",strokeWidth:"1.5"}),e.jsx("path",{d:"M16.5 16.5L21 21",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"})]}),e.jsx("input",{type:"text",value:r,onChange:o=>n(o.target.value),placeholder:"Rechercher...",className:"dataTable-input form-input w-full pl-11 pr-10",style:{"padding-left":"33px"}}),v&&e.jsx("div",{className:"absolute right-3 top-1/2 -translate-y-1/2",children:e.jsx("div",{className:"animate-spin rounded-full h-4 w-4 border-b-2 border-primary"})})]})]}),e.jsxs("div",{className:"flex items-center gap-2",children:[Z.map(o=>e.jsx("button",{type:"button",onClick:()=>M(o.id),title:o.label,className:`block rounded-full p-2 transition-all ${f===o.id?"bg-primary/20 text-primary":"bg-white-light/40 hover:bg-white-light/90 hover:text-primary dark:bg-dark/40 dark:hover:bg-dark/60"}`,children:o.icon},o.id)),e.jsx("button",{ref:E,type:"button",onClick:()=>{g(!p),m(!1),U(!1),X(!1)},className:`block rounded-full p-2 transition-all ${p?"bg-primary/20 text-primary":"bg-white-light/40 hover:bg-white-light/90 hover:text-primary dark:bg-dark/40 dark:hover:bg-dark/60"}`,title:"Configurer les vues",children:e.jsxs("svg",{className:"h-4 w-4",viewBox:"0 0 24 24",fill:"none",children:[e.jsx("circle",{cx:"12",cy:"12",r:"3",stroke:"currentColor",strokeWidth:"1.5"}),e.jsx("path",{d:"M12 2V4M12 20V22M2 12H4M20 12H22M4.93 4.93L6.34 6.34M17.66 17.66L19.07 19.07M4.93 19.07L6.34 17.66M17.66 6.34L19.07 4.93",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"})]})}),e.jsx("div",{className:"w-px h-5 bg-gray-200 dark:bg-gray-700 mx-0.5"}),e.jsx("button",{type:"button",onClick:Q,className:`block rounded-full p-2 transition-all ${F?"bg-primary/20 text-primary":"bg-white-light/40 hover:bg-white-light/90 hover:text-primary dark:bg-dark/40 dark:hover:bg-dark/60"}`,title:"Filtrer & enregistrer la vue",children:e.jsx("svg",{className:"h-4 w-4",viewBox:"0 0 24 24",fill:"none",children:e.jsx("path",{d:"M22 3H2L10 12.46V19L14 21V12.46L22 3Z",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round"})})}),f==="table"&&(()=>{var j,V;const o=((j=s.sort)==null?void 0:j.field)!=="createdAt"||((V=s.sort)==null?void 0:V.direction)!=="desc";return e.jsx("button",{ref:D,type:"button",onClick:()=>{U(!Y),m(!1),X(!1),g(!1)},className:`block rounded-full p-2 transition-all ${Y||o?"bg-primary/20 text-primary":"bg-white-light/40 hover:bg-white-light/90 hover:text-primary dark:bg-dark/40 dark:hover:bg-dark/60"}`,title:"Trier",children:e.jsxs("svg",{className:"h-4 w-4",viewBox:"0 0 24 24",fill:"none",children:[e.jsx("path",{d:"M16 18L16 6M16 6L20 10M16 6L12 10",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round"}),e.jsx("path",{d:"M8 6L8 18M8 18L12 14M8 18L4 14",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round"})]})})})(),e.jsx("button",{ref:J,type:"button",onClick:()=>{m(!_),U(!1),X(!1),g(!1)},className:`block rounded-full p-2 transition-all ${_?"bg-primary/20 text-primary":"bg-white-light/40 hover:bg-white-light/90 hover:text-primary dark:bg-dark/40 dark:hover:bg-dark/60"}`,title:"Mode d'affichage",children:e.jsxs("svg",{className:"h-4 w-4",viewBox:"0 0 24 24",fill:"none",children:[e.jsx("path",{d:"M3 7H21",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"}),e.jsx("path",{d:"M6 12H18",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"}),e.jsx("path",{d:"M10 17H14",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"})]})}),f==="table"&&e.jsx("button",{ref:L,type:"button",onClick:()=>{X(!H),m(!1),U(!1),g(!1)},className:`block rounded-full p-2 transition-all ${H?"bg-primary/20 text-primary":"bg-white-light/40 hover:bg-white-light/90 hover:text-primary dark:bg-dark/40 dark:hover:bg-dark/60"}`,title:"Colonnes visibles",children:e.jsxs("svg",{className:"h-4 w-4",viewBox:"0 0 24 24",fill:"none",children:[e.jsx("path",{d:"M9 3H4C3.44772 3 3 3.44772 3 4V11C3 11.5523 3.44772 12 4 12H9C9.55228 12 10 11.5523 10 11V4C10 3.44772 9.55228 3 9 3Z",stroke:"currentColor",strokeWidth:"1.5"}),e.jsx("path",{d:"M20 3H15C14.4477 3 14 3.44772 14 4V7C14 7.55228 14.4477 8 15 8H20C20.5523 8 21 7.55228 21 7V4C21 3.44772 20.5523 3 20 3Z",stroke:"currentColor",strokeWidth:"1.5"}),e.jsx("path",{d:"M20 12H15C14.4477 12 14 12.4477 14 13V20C14 20.5523 14.4477 21 15 21H20C20.5523 21 21 20.5523 21 20V13C21 12.4477 20.5523 12 20 12Z",stroke:"currentColor",strokeWidth:"1.5"}),e.jsx("path",{d:"M9 16H4C3.44772 16 3 16.4477 3 17V20C3 20.5523 3.44772 21 4 21H9C9.55228 21 10 20.5523 10 20V17C10 16.4477 9.55228 16 9 16Z",stroke:"currentColor",strokeWidth:"1.5"})]})}),e.jsxs("button",{type:"button",onClick:b,className:"btn-sidebar-toggle block rounded-full p-2 bg-white-light/40 hover:bg-white-light/90 hover:text-primary dark:bg-dark/40 dark:hover:bg-dark/60",title:c?"Masquer le panneau":"Afficher le panneau",children:[e.jsxs("svg",{className:"btn-sidebar-icon",viewBox:"0 0 24 24",fill:"none",children:[e.jsx("rect",{x:"3",y:"3",width:"18",height:"18",rx:"2",stroke:"currentColor",strokeWidth:"1.5"}),e.jsx("path",{d:"M9 3V21",stroke:"currentColor",strokeWidth:"1.5"})]}),e.jsx("span",{className:"btn-sidebar-label",children:c?"Masquer":"Panneau"})]})]}),Y&&_e.createPortal(e.jsxs(e.Fragment,{children:[e.jsx("div",{className:"fixed inset-0",style:{zIndex:9998},onClick:()=>U(!1)}),e.jsxs("div",{ref:oe,className:"fixed rounded-xl shadow-xl p-4 w-72 bg-white dark:bg-[#0e1726] border border-gray-100 dark:border-white/10",style:{zIndex:9999,top:q(D).top,right:q(D).right,animation:"popoverSlide 0.15s ease-out"},children:[e.jsx("div",{className:"text-xs font-medium text-gray-500 dark:text-white-dark mb-2",children:"Trier par"}),e.jsxs("div",{className:"flex gap-2",children:[e.jsxs("select",{value:((K=s.sort)==null?void 0:K.field)||"createdAt",onChange:o=>l("sort",{...s.sort,field:o.target.value}),className:"flex-1 px-2 py-1.5 text-xs border border-gray-200 dark:border-white/10 rounded-lg bg-white dark:bg-[#1b2e4b] text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary/50",children:[e.jsx("option",{value:"createdAt",children:"Date de création"}),e.jsx("option",{value:"title",children:"Titre"}),a.filter(o=>o.id!=="title"&&o.id!=="actions").map(o=>e.jsx("option",{value:o.id,children:o.name},o.id))]}),e.jsx("button",{onClick:()=>{var o;return l("sort",{...s.sort,direction:((o=s.sort)==null?void 0:o.direction)==="asc"?"desc":"asc"})},className:"p-1.5 border border-gray-200 dark:border-white/10 rounded-lg bg-white dark:bg-[#1b2e4b] hover:bg-gray-50 dark:hover:bg-[#253b5c] transition-all",title:((ne=s.sort)==null?void 0:ne.direction)==="asc"?"Croissant":"Décroissant",children:e.jsx("svg",{className:`h-4 w-4 text-gray-600 dark:text-white transition-transform ${((x=s.sort)==null?void 0:x.direction)==="asc"?"rotate-180":""}`,viewBox:"0 0 24 24",fill:"none",children:e.jsx("path",{d:"M12 5V19M12 19L6 13M12 19L18 13",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round"})})}),e.jsx("button",{onClick:()=>l("sort",{field:"createdAt",direction:"desc"}),className:"p-1.5 border border-gray-200 dark:border-white/10 rounded-lg bg-white dark:bg-[#1b2e4b] hover:bg-red-50 hover:border-red-300 hover:text-red-500 dark:hover:bg-red-900/20 transition-all",title:"Réinitialiser le tri",children:e.jsxs("svg",{className:"h-4 w-4 text-gray-600 dark:text-white",viewBox:"0 0 24 24",fill:"none",children:[e.jsx("path",{d:"M4.06189 13C4.02104 12.6724 4 12.3387 4 12C4 7.58172 7.58172 4 12 4C14.5006 4 16.7332 5.14727 18.2002 6.94416M19.9381 11C19.979 11.3276 20 11.6613 20 12C20 16.4183 16.4183 20 12 20C9.49944 20 7.26681 18.8527 5.79984 17.0558",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round"}),e.jsx("path",{d:"M15 7H19V3",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round"}),e.jsx("path",{d:"M9 17H5V21",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round"})]})})]})]})]}),document.body),_&&_e.createPortal(e.jsxs(e.Fragment,{children:[e.jsx("div",{className:"fixed inset-0",style:{zIndex:9998},onClick:()=>m(!1)}),e.jsxs("div",{ref:I,className:"fixed rounded-xl shadow-xl p-4 w-72 bg-white dark:bg-[#0e1726] border border-gray-100 dark:border-white/10",style:{zIndex:9999,top:q(J).top,right:q(J).right,animation:"popoverSlide 0.15s ease-out"},children:[e.jsxs("div",{className:"mb-4",children:[e.jsx("div",{className:"text-xs font-medium text-gray-500 dark:text-white-dark mb-2",children:"Densité"}),e.jsx("div",{className:"flex gap-1",children:["compact","normal","comfortable"].map(o=>e.jsx("button",{onClick:()=>l("density",o),className:`flex-1 px-2 py-1.5 text-xs rounded-lg transition-all ${s.density===o?"bg-primary text-white":"bg-gray-100 dark:bg-dark/40 text-gray-600 dark:text-white-dark/70 hover:bg-gray-200 dark:hover:bg-dark/60"}`,children:o==="compact"?"Compact":o==="normal"?"Normal":"Confort"},o))})]}),e.jsxs("div",{className:"mb-4",children:[e.jsx("div",{className:"text-xs font-medium text-gray-500 dark:text-white-dark mb-2",children:"Lignes par page"}),e.jsx("div",{className:"flex gap-1",children:[10,25,50,100].map(o=>e.jsx("button",{onClick:()=>l("pageSize",o),className:`flex-1 px-2 py-1.5 text-xs rounded-lg transition-all ${s.pageSize===o?"bg-primary text-white":"bg-gray-100 dark:bg-dark/40 text-gray-600 dark:text-white-dark/70 hover:bg-gray-200 dark:hover:bg-dark/60"}`,children:o},o))})]})]})]}),document.body),H&&_e.createPortal(e.jsxs(e.Fragment,{children:[e.jsx("div",{className:"fixed inset-0",style:{zIndex:9998},onClick:()=>X(!1)}),e.jsxs("div",{ref:ae,className:"fixed rounded-xl shadow-xl p-4 w-64 bg-white dark:bg-[#0e1726] border border-gray-100 dark:border-white/10",style:{zIndex:9999,top:q(L).top,right:q(L).right,animation:"popoverSlide 0.15s ease-out"},children:[e.jsx("div",{className:"text-xs font-medium text-gray-500 dark:text-white-dark mb-2",children:"Colonnes visibles"}),e.jsx("div",{className:"relative mb-2",children:e.jsx("input",{type:"text",value:te,onChange:o=>B(o.target.value),placeholder:"Filtrer...",className:"w-full px-3 py-1.5 text-xs border border-gray-200 dark:border-white/10 rounded-lg bg-white dark:bg-[#1b2e4b] text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary/50"})}),e.jsx("div",{className:"space-y-0.5 max-h-48 overflow-y-auto",children:P.map(o=>{const j=s.columns.find(w=>w.id===o.id),V=j?j.visible!==!1:!0;return e.jsxs("label",{className:"flex items-center gap-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 px-2 py-1.5 rounded-lg",children:[e.jsx("input",{type:"checkbox",checked:V,onChange:()=>W(o.id),className:"form-checkbox text-primary w-3.5 h-3.5 rounded"}),e.jsx("span",{className:"text-xs text-gray-700 dark:text-gray-300",children:o.name})]},o.id)})}),e.jsx("div",{className:"border-t border-gray-100 dark:border-white/10 mt-3 mb-2"}),e.jsxs("div",{children:[e.jsx("div",{className:"text-xs font-medium text-gray-500 dark:text-white-dark mb-2",children:"Affichage titre"}),e.jsx("div",{className:"flex gap-1",children:[{value:"avatar",label:"Avatar"},{value:"icon",label:"Icône"},{value:"none",label:"Aucun"}].map(o=>e.jsx("button",{onClick:()=>l("titleDisplay",o.value),className:`flex-1 px-2 py-1.5 text-xs rounded-lg transition-all ${(s.titleDisplay||"avatar")===o.value?"bg-primary text-white":"bg-gray-100 dark:bg-dark/40 text-gray-600 dark:text-white-dark/70 hover:bg-gray-200 dark:hover:bg-dark/60"}`,children:o.label},o.value))})]}),e.jsx("div",{className:"border-t border-gray-100 dark:border-white/10 mt-3 mb-2"}),e.jsx("div",{children:e.jsxs("div",{className:"flex items-center justify-between",children:[e.jsx("span",{className:"text-xs font-medium text-gray-500 dark:text-white-dark",children:"Sélection multiple"}),e.jsx("button",{type:"button",onClick:()=>l("showCheckboxes",s.showCheckboxes===!1),style:{position:"relative",width:36,height:20,borderRadius:10,border:"none",cursor:"pointer",transition:"background 0.2s ease",background:s.showCheckboxes!==!1?"#4361ee":"#d1d5db",padding:0},children:e.jsx("span",{style:{position:"absolute",top:2,left:s.showCheckboxes!==!1?18:2,width:16,height:16,borderRadius:"50%",background:"#fff",boxShadow:"0 1px 3px rgba(0,0,0,0.2)",transition:"left 0.2s ease"}})})]})})]})]}),document.body),p&&_e.createPortal(e.jsxs(e.Fragment,{children:[e.jsx("div",{className:"fixed inset-0",style:{zIndex:9998},onClick:()=>g(!1)}),e.jsxs("div",{ref:ue,className:"fixed rounded-xl shadow-xl p-4 w-64 bg-white dark:bg-[#0e1726] border border-gray-100 dark:border-white/10",style:{zIndex:9999,top:q(E).top,right:q(E).right,animation:"popoverSlide 0.15s ease-out"},children:[e.jsx("div",{className:"text-xs font-medium text-gray-500 dark:text-white-dark mb-3",children:"Vues disponibles"}),e.jsx("div",{className:"space-y-1",children:Be.map(o=>{const j=k.includes(o.id),V=o.id==="table";return e.jsxs("label",{className:`flex items-center gap-3 cursor-pointer px-2 py-2 rounded-lg transition-all ${V?"opacity-60 cursor-not-allowed":"hover:bg-gray-50 dark:hover:bg-gray-800"}`,children:[e.jsx("input",{type:"checkbox",checked:j,onChange:()=>O(o.id),disabled:V,className:"form-checkbox text-primary w-4 h-4 rounded"}),e.jsxs("span",{className:`flex items-center gap-2 text-sm ${j?"text-gray-700 dark:text-gray-300":"text-gray-400 dark:text-gray-600"}`,children:[o.icon,o.label]})]},o.id)})}),e.jsx("div",{className:"border-t border-gray-100 dark:border-white/10 mt-3 pt-2",children:e.jsx("p",{className:"text-[10px] text-gray-400 dark:text-gray-600",children:"Le tableau est toujours activé par défaut."})})]})]}),document.body),e.jsx("style",{children:`
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
            `})]})}function Nt({records:r,columns:n,virtualizer:a,sort:s,onSort:l,onColumnReorder:v,density:d,titleDisplay:S,entityIcon:h,accountNumber:c,entitySlug:b,selectedIds:f,onToggleSelect:M,onSelectAll:k,allPageSelected:R,showCheckboxes:F=!0}){var p;const[Q,_]=t.useState(null),[m,Y]=t.useState(null),U=a.getVirtualItems(),H={compact:{rowHeight:36,cellClass:"py-1",fontSize:"text-xs",imageSize:"w-6 h-6",fontWeight:"font-medium"},normal:{rowHeight:44,cellClass:"py-2",fontSize:"text-sm",imageSize:"w-9 h-9",fontWeight:"font-semibold"},comfortable:{rowHeight:56,cellClass:"py-3",fontSize:"text-sm",imageSize:"w-9 h-9",fontWeight:"font-semibold"}},X=H[d]||H.comfortable;return f&&f.size>0,e.jsxs("table",{className:"table-hover whitespace-nowrap dataTable-table w-full",children:[e.jsx("thead",{className:"sticky top-0 bg-white dark:bg-[#1b2e4b] z-10",children:e.jsxs("tr",{children:[F&&e.jsx("th",{style:{width:40,padding:"0 8px"},children:e.jsxs("label",{className:"bulk-checkbox-wrapper",style:{display:"flex",alignItems:"center",justifyContent:"center"},children:[e.jsx("input",{type:"checkbox",checked:R&&r.length>0,onChange:()=>k&&k(),className:"bulk-checkbox"}),e.jsx("span",{className:"bulk-checkbox-custom"})]})}),n.map(g=>{const te=(s==null?void 0:s.field)===g.id||g.id==="title"&&(s==null?void 0:s.field)==="title"||g.id==="createdAt"&&(s==null?void 0:s.field)==="createdAt",B=(s==null?void 0:s.direction)||"desc",J=Q===g.id,D=m===g.id&&Q!==g.id,L=g.id!=="actions";return e.jsx("th",{"data-sortable":g.sortable!==!1?"":void 0,"data-column-id":g.id,onDragEnter:E=>{E.preventDefault(),g.id!=="actions"&&Q&&Q!==g.id&&Y(g.id)},onDragOver:E=>{E.preventDefault()},onDrop:E=>{E.preventDefault(),Q&&Q!==g.id&&g.id!=="actions"&&v&&v(Q,g.id),_(null),Y(null)},className:`px-2 ${J?"opacity-50":""} ${D?"border-l-2 border-l-primary bg-primary/5":""}`,style:{transition:"opacity 0.15s, border-color 0.15s, background 0.15s",...g.id==="actions"?{width:"1%",whiteSpace:"nowrap"}:{},...g.id==="title"?{minWidth:220}:{}},children:e.jsxs("div",{className:"flex items-center gap-1",children:[L&&e.jsx("span",{draggable:"true",onDragStart:E=>{_(g.id),E.dataTransfer.effectAllowed="move",E.dataTransfer.setData("text/plain",g.id)},onDragEnd:()=>{_(null),Y(null)},className:"cursor-grab text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300",children:e.jsxs("svg",{className:"h-3 w-3",viewBox:"0 0 24 24",fill:"currentColor",children:[e.jsx("circle",{cx:"9",cy:"6",r:"1.5"}),e.jsx("circle",{cx:"15",cy:"6",r:"1.5"}),e.jsx("circle",{cx:"9",cy:"12",r:"1.5"}),e.jsx("circle",{cx:"15",cy:"12",r:"1.5"}),e.jsx("circle",{cx:"9",cy:"18",r:"1.5"}),e.jsx("circle",{cx:"15",cy:"18",r:"1.5"})]})}),g.sortable!==!1?e.jsxs("a",{href:"#",className:"dataTable-sorter flex items-center gap-1",draggable:"false",onClick:E=>{E.preventDefault(),l(g.id)},children:[g.name,te&&e.jsx("svg",{className:`h-3 w-3 text-primary transition-transform ${B==="asc"?"rotate-180":""}`,viewBox:"0 0 24 24",fill:"none",children:e.jsx("path",{d:"M12 5V19M12 19L6 13M12 19L18 13",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round"})})]}):g.name]})},g.id)})]})}),e.jsxs("tbody",{children:[U.length>0&&U[0].start>0&&e.jsx("tr",{children:e.jsx("td",{colSpan:n.length+1,style:{height:U[0].start,padding:0}})}),U.map(g=>{const te=r[g.index];if(!te)return null;const B={compact:"4px 8px",normal:"8px 12px",comfortable:"12px 12px"}[d]||"12px 12px",J=f&&f.has(te._id);return e.jsxs("tr",{"data-index":g.index,ref:a.measureElement,style:{minHeight:X.rowHeight},className:J?"bulk-row-selected":"",children:[F&&e.jsx("td",{style:{padding:"0 8px",width:40},children:e.jsxs("label",{className:"bulk-checkbox-wrapper",style:{display:"flex",alignItems:"center",justifyContent:"center"},onClick:D=>{D.preventDefault(),M&&M(te._id,g.index,D.shiftKey)},children:[e.jsx("input",{type:"checkbox",checked:J,readOnly:!0,className:"bulk-checkbox"}),e.jsx("span",{className:"bulk-checkbox-custom"})]})}),n.map(D=>e.jsx("td",{className:`${X.fontSize}`,style:{padding:B,...D.id==="actions"?{width:"1%",whiteSpace:"nowrap"}:{},...D.id==="title"?{minWidth:220}:{}},children:St(te,D,c,b,X,S,h)},D.id))]},te._id)}),U.length>0&&e.jsx("tr",{children:e.jsx("td",{colSpan:n.length+1,style:{height:Math.max(0,a.getTotalSize()-(((p=U[U.length-1])==null?void 0:p.end)||0)),padding:0}})})]})]})}function St(r,n,a,s,l,v,d){var S,h;switch(n.id){case"title":{const c=r.referenceTitle||r.title||"Sans titre";c.charAt(0).toUpperCase();const b=Math.abs(c.charCodeAt(0)||65)%35+1,f=r.image||`/assets/images/profile-${b}.jpeg`;return e.jsxs("div",{className:"flex items-center gap-2",children:[v==="avatar"&&e.jsx("img",{src:f,alt:c,className:`${l.imageSize} rounded-full max-w-none`}),v==="icon"&&d&&e.jsx("div",{className:`${l.imageSize} rounded-lg max-w-none flex items-center justify-center bg-primary/10 text-primary shrink-0`,children:e.jsx("iconify-icon",{icon:d,width:"16"})}),e.jsx("a",{href:`/account/${a}/record/${s}/${r._id}/edit`,className:`${l.fontWeight} hover:text-primary transition-colors truncate`,title:c,children:c})]})}case"createdAt":return new Date(r.createdAt).toLocaleDateString("fr-FR");case"actions":return e.jsxs("div",{className:"flex items-center gap-0",children:[e.jsx("a",{href:`/account/${a}/record/${s}/${r._id}`,className:"p-1 rounded-lg text-gray-500 hover:text-primary hover:bg-primary/10 transition-all",title:"Voir",children:e.jsxs("svg",{className:"h-4 w-4",viewBox:"0 0 24 24",fill:"none",children:[e.jsx("path",{d:"M15 12C15 13.6569 13.6569 15 12 15C10.3431 15 9 13.6569 9 12C9 10.3431 10.3431 9 12 9C13.6569 9 15 10.3431 15 12Z",stroke:"currentColor",strokeWidth:"1.5"}),e.jsx("path",{d:"M12 5C7.5 5 3.73 7.94 2 12C3.73 16.06 7.5 19 12 19C16.5 19 20.27 16.06 22 12C20.27 7.94 16.5 5 12 5Z",stroke:"currentColor",strokeWidth:"1.5"})]})}),e.jsx("a",{href:`/account/${a}/record/${s}/${r._id}/edit`,className:"p-1 rounded-lg text-gray-500 hover:text-info hover:bg-info/10 transition-all",title:"Modifier",children:e.jsx("svg",{className:"h-4 w-4",viewBox:"0 0 24 24",fill:"none",children:e.jsx("path",{d:"M16.862 4.487L18.55 2.8C19.33 2.02 20.59 2.02 21.37 2.8C22.15 3.58 22.15 4.84 21.37 5.62L19.681 7.307M16.862 4.487L4.162 17.187C3.882 17.467 3.682 17.818 3.592 18.198L2.732 21.596C2.642 21.966 2.952 22.296 3.322 22.226L6.892 21.556C7.242 21.486 7.572 21.306 7.832 21.046L20.513 8.366M16.862 4.487L19.681 7.307",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round"})})}),e.jsx("button",{type:"button",className:"p-1 rounded-lg text-gray-500 hover:text-danger hover:bg-danger/10 transition-all",title:"Supprimer",onClick:()=>{confirm("Êtes-vous sûr de vouloir supprimer cet enregistrement ?")&&console.log("Delete record:",r._id)},children:e.jsxs("svg",{className:"h-4 w-4",viewBox:"0 0 24 24",fill:"none",children:[e.jsx("path",{d:"M20.5 6H3.5",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"}),e.jsx("path",{d:"M18.833 8.5L18.373 15.4C18.196 18.054 18.108 19.381 17.243 20.19C16.378 21 15.048 21 12.387 21H11.613C8.952 21 7.622 21 6.757 20.19C5.892 19.381 5.804 18.054 5.627 15.4L5.167 8.5",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"}),e.jsx("path",{d:"M9.5 11L10 16",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"}),e.jsx("path",{d:"M14.5 11L14 16",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"}),e.jsx("path",{d:"M6.5 6C6.556 5.367 6.612 5.1 6.877 4.714C7.178 4.275 7.945 3.917 9.484 3.2L9.924 2.984C10.683 2.589 11.06 2.392 11.476 2.318C11.823 2.254 12.177 2.254 12.524 2.318C12.94 2.392 13.317 2.589 14.076 2.984L14.516 3.2C16.055 3.917 16.822 4.275 17.123 4.714C17.388 5.1 17.444 5.367 17.5 6",stroke:"currentColor",strokeWidth:"1.5"})]})})]});default:{if(n.id.startsWith("rel:")){const c=n.id.substring(4),f=(((S=r._denorm)==null?void 0:S.relations)||[]).find(k=>k.relationKey===c);if(((h=f==null?void 0:f.records)==null?void 0:h.length)>0)return e.jsx("div",{className:"flex flex-wrap gap-1",children:f.records.map((k,R)=>e.jsx("a",{href:`/account/${a}/record/${k.entitySlug||s}/${k._id}`,className:"text-primary hover:underline text-xs",children:k.title||"Sans titre"},R))});const M=(r.relations||[]).find(k=>k.relationKey===c);return M!=null&&M.value?"—":""}if(n.id.startsWith("classif:")){const c=n.id.substring(8),b=(r.classificationValues||[]).find(f=>{var k,R,F;return(((k=f.classificationId)==null?void 0:k.$oid)||((F=(R=f.classificationId)==null?void 0:R.toString)==null?void 0:F.call(R))||f.classificationId)===c});if(b!=null&&b.label){const f=b.color||"#888";return e.jsx("span",{className:"inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap",style:{backgroundColor:`${f}15`,color:f,border:`1px solid ${f}30`},children:b.label})}return b!=null&&b.value?e.jsx("span",{className:"inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20",children:b.value}):""}if(n.computed&&r._computedFields){const c=r._computedFields[n.id];if(!c||c.value===null||c.value===void 0)return"—";const b=n.computedDisplay||"text",f=n.computedColor||"#4361ee";if(b==="badge")return e.jsx("span",{className:"inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap",style:{background:`${f}15`,color:f,border:`1px solid ${f}30`},children:c.formatted||c.value});if(b==="currency")return e.jsx("span",{style:{fontWeight:600,color:"#334155"},children:c.formatted||`${Number(c.value).toFixed(2)} €`});if(b==="stars"){const M=Number(c.value)||0,k=Number(c.max)||5;return e.jsxs("span",{style:{display:"inline-flex",alignItems:"center",gap:1},children:[Array.from({length:Math.floor(M)}).map((R,F)=>e.jsx("iconify-icon",{icon:"solar:star-bold",width:"14",style:{color:"#f59e0b"}},`f${F}`)),M-Math.floor(M)>=.5&&e.jsx("iconify-icon",{icon:"solar:star-bold-duotone",width:"14",style:{color:"#f59e0b"}}),Array.from({length:k-Math.ceil(M)}).map((R,F)=>e.jsx("iconify-icon",{icon:"solar:star-line-duotone",width:"14",style:{color:"#e2e8f0"}},`e${F}`)),e.jsx("span",{style:{fontSize:11,color:"#9ca3af",marginLeft:4},children:c.formatted})]})}if(b==="progress"){const M=Math.min(Math.max(Number(c.percentage||c.value)||0,0),100),k=M>=80?"#10b981":M>=50?"#f59e0b":"#ef4444";return e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:6,minWidth:80},children:[e.jsx("div",{style:{flex:1,height:5,background:"#e2e8f0",borderRadius:3,overflow:"hidden"},children:e.jsx("div",{style:{width:`${M}%`,height:"100%",background:k,borderRadius:3}})}),e.jsxs("span",{style:{fontSize:11,fontWeight:600,color:k},children:[M,"%"]})]})}return c.formatted||c.value||""}if(r.customFields){const c=r.customFields.find(f=>{var k;const M=((k=f.field_id)==null?void 0:k._id)||f.field_id;return(M==null?void 0:M.toString())===n.id});if(!c)return"";const b=c.value;if(b&&typeof b=="object"&&b._v){const f=[];return Object.entries(b).forEach(([M,k])=>{M==="_v"||M==="customText"||(Array.isArray(k)?k.forEach(R=>f.push(R)):k&&f.push(k))}),b.customText&&f.push(b.customText),e.jsx("div",{className:"flex flex-wrap gap-1",children:f.map((M,k)=>e.jsx("span",{className:"inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20",children:M},k))})}return b||""}return""}}}function De(r,n=.1){if(!r)return`rgba(99, 102, 241, ${n})`;const a=parseInt(r.slice(1,3),16),s=parseInt(r.slice(3,5),16),l=parseInt(r.slice(5,7),16);return`rgba(${a}, ${s}, ${l}, ${n})`}function Lt({field:r,record:n}){const a=(n.customFields||[]).find(l=>{var d;const v=((d=l.field_id)==null?void 0:d._id)||l.field_id;return(v==null?void 0:v.toString())===r.id});if(!a)return e.jsx("span",{className:"text-gray-400 dark:text-gray-600 text-sm italic",children:"—"});const s=a.value;if(s==null||s==="")return e.jsx("span",{className:"text-gray-400 dark:text-gray-600 text-sm italic",children:"—"});if(r.type==="date"||r.type==="datetime")try{return e.jsx("span",{className:"text-sm text-gray-700 dark:text-gray-300",children:new Date(s).toLocaleDateString("fr-FR")})}catch{return e.jsx("span",{className:"text-sm text-gray-700 dark:text-gray-300",children:String(s)})}return r.type==="boolean"||r.type==="checkbox"?e.jsxs("span",{className:`inline-flex items-center gap-1 text-sm ${s?"text-success":"text-gray-400"}`,children:[s?e.jsxs("svg",{width:"16",height:"16",viewBox:"0 0 24 24",fill:"none",children:[e.jsx("path",{d:"M9 12l2 2 4-4",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round"}),e.jsx("circle",{cx:"12",cy:"12",r:"10",stroke:"currentColor",strokeWidth:"1.5"})]}):e.jsx("svg",{width:"16",height:"16",viewBox:"0 0 24 24",fill:"none",children:e.jsx("circle",{cx:"12",cy:"12",r:"10",stroke:"currentColor",strokeWidth:"1.5"})}),s?"Oui":"Non"]}):r.type==="relation"?Array.isArray(s)?e.jsx("div",{className:"flex flex-wrap gap-1",children:s.map((l,v)=>e.jsx("span",{className:"inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-primary/10 text-primary font-medium",children:l.title||l.label||l.name||String(l)},v))}):e.jsx("span",{className:"text-sm text-gray-700 dark:text-gray-300",children:s.title||s.label||String(s)}):r.type==="number"?e.jsx("span",{className:"text-sm font-mono text-gray-700 dark:text-gray-300",children:Number(s).toLocaleString("fr-FR")}):e.jsx("span",{className:"text-sm text-gray-700 dark:text-gray-300",children:String(s)})}function Mt({record:r,columns:n,accountNumber:a,entitySlug:s,onClose:l}){var _;const v=t.useRef(null),[d,S]=t.useState(!1);t.useEffect(()=>{requestAnimationFrame(()=>S(!0))},[]);const h=t.useCallback(()=>{S(!1),setTimeout(()=>l(),250)},[l]);if(t.useEffect(()=>{const m=Y=>{Y.key==="Escape"&&h()};return document.addEventListener("keydown",m),()=>document.removeEventListener("keydown",m)},[h]),!r)return null;const c=((_=r._id)==null?void 0:_.$oid)||r._id,b=r.referenceTitle||r.title||r.computedTitle||"Sans titre",f=r.description||"",M=r.createdAt?new Date(r.createdAt).toLocaleDateString("fr-FR",{day:"2-digit",month:"long",year:"numeric"}):null,k=r.updatedAt?new Date(r.updatedAt).toLocaleDateString("fr-FR",{day:"2-digit",month:"long",year:"numeric"}):null,R=(r.classificationValues||[]).filter(m=>m.optionLabel||m.label).map(m=>({label:m.optionLabel||m.label,color:m.optionColor||m.color||"#6366f1",classificationName:m.classificationName||"Classification"})),F={};R.forEach(m=>{F[m.classificationName]||(F[m.classificationName]=[]),F[m.classificationName].push(m)});const Q=n.filter(m=>m.id!=="title"&&m.id!=="actions"&&!m.id.startsWith("class:"));return _e.createPortal(e.jsxs(e.Fragment,{children:[e.jsx("div",{className:`fixed inset-0 bg-black/40 backdrop-blur-[2px] transition-opacity duration-250 ${d?"opacity-100":"opacity-0"}`,style:{zIndex:1e4},onMouseDown:h,onTouchEnd:m=>{m.preventDefault(),h()}}),e.jsxs("div",{ref:v,className:`fixed right-0 top-0 h-full bg-white dark:bg-[#0e1726] shadow-2xl border-l border-gray-200 dark:border-gray-700 flex flex-col transition-transform duration-250 ease-out ${d?"translate-x-0":"translate-x-full"}`,style:{zIndex:10001,width:"min(520px, 90vw)"},onClick:m=>m.stopPropagation(),children:[e.jsxs("div",{className:"flex items-center justify-between gap-3 px-6 py-4 border-b border-gray-100 dark:border-gray-700/50 flex-shrink-0",children:[e.jsxs("div",{className:"flex items-center gap-2 min-w-0",children:[e.jsx("div",{className:"w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0",children:e.jsxs("svg",{width:"16",height:"16",viewBox:"0 0 24 24",fill:"none",children:[e.jsx("path",{d:"M2 12C2 7.28595 2 4.92893 3.46447 3.46447C4.92893 2 7.28595 2 12 2C16.714 2 19.0711 2 20.5355 3.46447C22 4.92893 22 7.28595 22 12C22 16.714 22 19.0711 20.5355 20.5355C19.0711 22 16.714 22 12 22C7.28595 22 4.92893 22 3.46447 20.5355C2 19.0711 2 16.714 2 12Z",stroke:"#4361ee",strokeWidth:"1.5"}),e.jsx("path",{d:"M8 12H16M12 8V16",stroke:"#4361ee",strokeWidth:"1.5",strokeLinecap:"round"})]})}),e.jsx("h3",{className:"text-base font-semibold text-gray-900 dark:text-white truncate",children:b})]}),e.jsxs("div",{className:"flex items-center gap-1 flex-shrink-0",children:[e.jsx("a",{href:`/account/${a}/record/${s}/${c}`,className:"p-2 rounded-lg text-gray-400 hover:text-primary hover:bg-primary/10 transition-all",title:"Ouvrir la page complète",children:e.jsxs("svg",{width:"16",height:"16",viewBox:"0 0 24 24",fill:"none",children:[e.jsx("path",{d:"M10 4H6C4.89543 4 4 4.89543 4 6V18C4 19.1046 4.89543 20 6 20H18C19.1046 20 20 19.1046 20 18V14",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"}),e.jsx("path",{d:"M14 4H20V10",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round"}),e.jsx("path",{d:"M20 4L11 13",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"})]})}),e.jsx("a",{href:`/account/${a}/record/${s}/${c}/edit`,className:"p-2 rounded-lg text-gray-400 hover:text-info hover:bg-info/10 transition-all",title:"Modifier",children:e.jsx("svg",{width:"16",height:"16",viewBox:"0 0 24 24",fill:"none",children:e.jsx("path",{d:"M16.862 4.487L18.55 2.8C19.33 2.02 20.59 2.02 21.37 2.8C22.15 3.58 22.15 4.84 21.37 5.62L19.681 7.307M16.862 4.487L4.162 17.187C3.882 17.467 3.682 17.818 3.592 18.198L2.732 21.596C2.642 21.966 2.952 22.296 3.322 22.226L6.892 21.556C7.242 21.486 7.572 21.306 7.832 21.046L20.513 8.366",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"})})}),e.jsx("button",{onClick:h,className:"p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all",title:"Fermer",children:e.jsx("svg",{width:"16",height:"16",viewBox:"0 0 24 24",fill:"none",children:e.jsx("path",{d:"M18 6L6 18M6 6L18 18",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round"})})})]})]}),e.jsxs("div",{className:"flex-1 overflow-y-auto",children:[Object.keys(F).length>0&&e.jsx("div",{className:"px-6 py-4 border-b border-gray-100 dark:border-gray-700/50",children:Object.entries(F).map(([m,Y])=>e.jsxs("div",{className:"mb-3 last:mb-0",children:[e.jsx("div",{className:"text-[11px] uppercase tracking-wider font-semibold text-gray-400 dark:text-gray-500 mb-1.5",children:m}),e.jsx("div",{className:"flex flex-wrap gap-1.5",children:Y.map((U,H)=>e.jsxs("span",{className:"inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium transition-all hover:scale-105",style:{backgroundColor:De(U.color,.15),color:U.color,border:`1px solid ${De(U.color,.3)}`},children:[e.jsx("span",{className:"w-2 h-2 rounded-full flex-shrink-0",style:{backgroundColor:U.color}}),U.label]},H))})]},m))}),f&&e.jsxs("div",{className:"px-6 py-4 border-b border-gray-100 dark:border-gray-700/50",children:[e.jsx("div",{className:"text-[11px] uppercase tracking-wider font-semibold text-gray-400 dark:text-gray-500 mb-2",children:"Description"}),e.jsx("p",{className:"text-sm text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-wrap",children:f})]}),e.jsxs("div",{className:"px-6 py-4",children:[e.jsx("div",{className:"text-[11px] uppercase tracking-wider font-semibold text-gray-400 dark:text-gray-500 mb-3",children:"Détails"}),e.jsxs("div",{className:"space-y-0",children:[Q.map(m=>e.jsxs("div",{className:"flex items-start gap-3 py-2.5 border-b border-gray-50 dark:border-gray-800/50 last:border-0",children:[e.jsx("div",{className:"w-32 flex-shrink-0 text-xs font-medium text-gray-500 dark:text-gray-400 pt-0.5 truncate",children:m.name}),e.jsx("div",{className:"flex-1 min-w-0",children:e.jsx(Lt,{field:m,record:r})})]},m.id)),(r.relations||[]).map((m,Y)=>{var U;return e.jsxs("div",{className:"flex items-start gap-3 py-2.5 border-b border-gray-50 dark:border-gray-800/50 last:border-0",children:[e.jsx("div",{className:"w-32 flex-shrink-0 text-xs font-medium text-gray-500 dark:text-gray-400 pt-0.5 truncate",children:m.label||m.key||"Relation"}),e.jsx("div",{className:"flex-1 min-w-0",children:((U=m.records)==null?void 0:U.length)>0?e.jsx("div",{className:"flex flex-wrap gap-1",children:m.records.map((H,X)=>e.jsx("a",{href:`/account/${a}/record/${m.entitySlug||s}/${H._id}`,className:"inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-primary/10 text-primary font-medium hover:bg-primary/20 transition-colors",children:H.referenceTitle||H.title||"Sans titre"},X))}):e.jsx("span",{className:"text-gray-400 dark:text-gray-600 text-sm italic",children:"—"})})]},`rel-${Y}`)})]})]})]}),e.jsx("div",{className:"flex-shrink-0 px-6 py-3 border-t border-gray-100 dark:border-gray-700/50 bg-gray-50/50 dark:bg-[#0a0f1e]/50",children:e.jsxs("div",{className:"flex items-center justify-between text-[11px] text-gray-400 dark:text-gray-500",children:[e.jsxs("div",{className:"flex items-center gap-3",children:[M&&e.jsxs("span",{className:"flex items-center gap-1",children:[e.jsxs("svg",{width:"12",height:"12",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"1.5",children:[e.jsx("circle",{cx:"12",cy:"12",r:"10"}),e.jsx("path",{d:"M12 6V12L16 14",strokeLinecap:"round"})]}),"Créé le ",M]}),k&&e.jsxs("span",{className:"flex items-center gap-1",children:[e.jsx("svg",{width:"12",height:"12",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"1.5",children:e.jsx("path",{d:"M4.06 13C4.02 12.67 4 12.34 4 12C4 7.58 7.58 4 12 4C14.5 4 16.73 5.15 18.2 6.94M19.94 11C19.98 11.33 20 11.66 20 12C20 16.42 16.42 20 12 20C9.5 20 7.27 18.85 5.8 17.06",strokeLinecap:"round",strokeLinejoin:"round"})}),"Modifié le ",k]})]}),e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx("a",{href:`/account/${a}/record/${s}/${c}`,className:"px-3 py-1.5 bg-primary/10 text-primary text-xs font-medium rounded-lg hover:bg-primary/20 transition-colors",children:"Voir"}),e.jsx("a",{href:`/account/${a}/record/${s}/${c}/edit`,className:"px-3 py-1.5 bg-primary text-white text-xs font-medium rounded-lg hover:bg-primary/90 transition-colors",children:"Modifier"})]})]})})]})]}),document.body)}function ze(r,n=.1){const a=/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(r);return a?`rgba(${parseInt(a[1],16)}, ${parseInt(a[2],16)}, ${parseInt(a[3],16)}, ${n})`:`rgba(128,128,128,${n})`}function Xe({record:r,accountNumber:n,entitySlug:a,isDragging:s=!1,onQuickView:l,cardTemplate:v,entityData:d}){var U;const S=t.useRef(null),h=t.useRef(!1),c=String(((U=r._id)==null?void 0:U.$oid)||r._id),{attributes:b,listeners:f,setNodeRef:M,transform:k,transition:R,isDragging:F}=wt({id:c}),Q={transform:jt.Transform.toString(k),transition:R,opacity:s||F?.7:1,touchAction:"manipulation"},_=H=>{S.current={x:H.clientX,y:H.clientY,time:Date.now()},h.current=!1},m=H=>{if(S.current){const X=Math.abs(H.clientX-S.current.x),p=Math.abs(H.clientY-S.current.y);(X>5||p>5)&&(h.current=!0)}},Y=H=>{if(!S.current)return;const X=Date.now()-S.current.time;!h.current&&X<400&&l&&!H.target.closest("a, button")&&setTimeout(()=>l(r),50),S.current=null};return e.jsx("div",{ref:M,style:Q,className:`kanban-card cursor-pointer transition-all group ${s||F?"shadow-lg ring-2 ring-primary/30 cursor-move":""}`,"data-dnd":"card",onPointerDown:_,onPointerMove:m,onPointerUp:Y,...b,...f,children:e.jsx(Ke,{record:r,cardTemplate:v,context:"kanban",entityData:d,accountNumber:n,entitySlug:a,className:"bg-white hover:shadow-md border border-gray-200/80 dark:border-0 dark:bg-dark/40 dark:hover:bg-dark/60",style:{borderRadius:8}})})}function _t({column:r,records:n,recordIds:a,accountNumber:s,entitySlug:l,onQuickView:v,cardTemplate:d,entityData:S}){const{setNodeRef:h,isOver:c}=vt({id:String(r.id)}),b=typeof document<"u"&&document.documentElement.classList.contains("dark"),f=ze(r.color,b?.12:.06),M=ze(r.color,b?.3:.15);return e.jsxs("div",{ref:h,className:`flex-none rounded-lg overflow-hidden transition-all ${c?"ring-2 ring-primary/50 ring-offset-2":""}`,style:{width:"300px",maxWidth:"320px",backgroundColor:c?ze(r.color,.15):f,border:`1px solid ${M}`},"data-dnd":"column",children:[e.jsx("div",{style:{height:"4px",backgroundColor:r.color}}),e.jsx("div",{className:"px-3 py-2 flex justify-between items-center",children:e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx("span",{className:"inline-flex items-center gap-1.5 px-2 py-0 rounded text-xs font-semibold uppercase tracking-wide",style:{backgroundColor:r.color,color:"#fff"},children:r.title}),e.jsx("span",{className:"text-xs text-gray-500 font-medium",children:n.length})]})}),e.jsx("div",{className:"px-2 pb-3",children:e.jsx(kt,{items:a,strategy:yt,children:e.jsx("div",{className:`space-y-2 min-h-[80px] rounded-lg transition-all ${c?"bg-primary/5 p-2":""}`,children:n.length===0?e.jsx("div",{className:"text-xs text-gray-300 dark:text-gray-600 text-center py-8 italic",children:"Aucun enregistrement"}):n.map(k=>{var R;return e.jsx(Xe,{record:k,accountNumber:s,entitySlug:l,onQuickView:v,cardTemplate:d,entityData:S},((R=k._id)==null?void 0:R.$oid)||k._id)})})})}),e.jsx("div",{className:"px-3 pb-3",children:e.jsxs("button",{type:"button",className:"flex items-center gap-1 text-xs text-gray-400 hover:text-primary transition-colors",children:[e.jsx("svg",{width:"14",height:"14",viewBox:"0 0 24 24",fill:"none",children:e.jsx("path",{d:"M12 6V18M6 12H18",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round"})}),"Ajouter"]})})]})}function It({records:r,columns:n,accountNumber:a,entitySlug:s,viewId:l,entityData:v}){const d=t.useRef(null),S=t.useRef(null),[h,c]=t.useState(r),[b,f]=t.useState({}),[M,k]=t.useState(null),[R,F]=t.useState(null),Q=t.useCallback(y=>{F(y)},[]),[_,m]=t.useState(null);t.useEffect(()=>{var O;if(!(v!=null&&v._id))return;const y=((O=v._id)==null?void 0:O.$oid)||v._id;fetch(`/account/${a}/api/entity/${y}/cards/default/kanban`,{credentials:"include"}).then(Z=>Z.json()).then(Z=>{Z.success&&Z.card&&m(Z.card)}).catch(()=>{})},[v==null?void 0:v._id,a]),t.useEffect(()=>{c(r)},[r]);const Y=t.useRef(!1),U=t.useRef(0),H=t.useRef(0),X=t.useCallback(y=>{if(M||y.button!==0||y.target.closest('a, button, .dropdown, [data-dnd="card"]'))return;const O=d.current;O&&(Y.current=!0,U.current=y.pageX-O.offsetLeft,H.current=O.scrollLeft,O.style.cursor="grabbing")},[M]),p=t.useCallback(y=>{if(M){Y.current=!1;return}if(!Y.current)return;y.preventDefault();const O=d.current;if(!O)return;const W=(y.pageX-O.offsetLeft-U.current)*1.5;O.scrollLeft=H.current-W},[M]),g=t.useCallback(()=>{Y.current=!1,d.current&&(d.current.style.cursor="grab")},[]),te=ct(Te(bt,{activationConstraint:{distance:8}}),Te(gt,{activationConstraint:{delay:500,tolerance:10}}),Te(mt,{coordinateGetter:ht})),B=t.useMemo(()=>{if(v){const W=v.statusClassification;if(W&&W.options&&W.options.length>0){const P=W.options.map(K=>({id:String(K._id),title:K.label,color:K.color||"#6366f1",optionId:String(K._id)}));return P.push({id:"__none__",title:"Sans Statut",color:"#9ca3af",optionId:"none"}),{classId:String(W._id),columns:P}}const q=v.classifications||[];for(const P of q)if(P.options&&P.options.length>0){const K=P.options.map(ne=>({id:String(ne._id),title:ne.label,color:ne.color||"#6366f1",optionId:String(ne._id)}));return K.push({id:"__none__",title:"Non classé",color:"#9ca3af",optionId:"none"}),{classId:String(P._id),columns:K}}}const y={};h.forEach(W=>{(W.classificationValues||[]).forEach(q=>{var o,j;const P=((o=q.classificationId)==null?void 0:o.$oid)||q.classificationId||q.classification_id;if(!P)return;y[P]||(y[P]={count:0,options:{}}),y[P].count++;const K=q.optionLabel||q.label||"Sans label",ne=q.optionColor||q.color||"#9ca3af",x=((j=q.optionId)==null?void 0:j.$oid)||q.optionId||K;y[P].options[K]||(y[P].options[K]={label:K,color:ne,optionId:String(x),count:0}),y[P].options[K].count++})});let O=null,Z=0;if(Object.entries(y).forEach(([W,q])=>{q.count>Z&&(Z=q.count,O=W)}),O&&y[O]){const q=Object.values(y[O].options).map(P=>({id:P.label,title:P.label,color:P.color,optionId:P.optionId}));return q.push({id:"__none__",title:"Sans classification",color:"#9ca3af",optionId:"none"}),{classId:O,columns:q}}return{classId:null,columns:[{id:"__all__",title:"Tous les enregistrements",color:"#4361ee",optionId:null}]}},[h,v]),J=t.useMemo(()=>{const y={};if(B.columns.forEach(O=>y[O.id]=[]),!B.classId)y.__all__=h;else{const O={};B.columns.forEach(W=>{W.optionId&&W.optionId!=="none"&&(O[String(W.optionId)]=W.id)});const Z={};B.columns.forEach(W=>{Z[W.title]=W.id}),h.forEach(W=>{var K;const P=(W.classificationValues||[]).find(ne=>{var o;return(((o=ne.classificationId)==null?void 0:o.$oid)||ne.classificationId||ne.classification_id)===B.classId});if(P){const ne=String(((K=P.optionId)==null?void 0:K.$oid)||P.optionId||""),x=O[ne];if(x&&y[x])y[x].push(W);else{const o=P.optionLabel||P.label||"Sans label";y[o]?y[o].push(W):y.__none__&&y.__none__.push(W)}}else y.__none__&&y.__none__.push(W)})}for(const O of Object.keys(y)){const Z=b[O]||[];Z.length&&y[O].sort((W,q)=>{var ne,x;const P=Z.indexOf(String(((ne=W._id)==null?void 0:ne.$oid)||W._id)),K=Z.indexOf(String(((x=q._id)==null?void 0:x.$oid)||q._id));return P===-1&&K===-1?0:P===-1?1:K===-1?-1:P-K})}return y},[B,h,b]),D=t.useMemo(()=>{const y={};for(const O of B.columns)y[O.id]=(J[O.id]||[]).map(Z=>{var W;return String(((W=Z._id)==null?void 0:W.$oid)||Z._id)});return y},[B.columns,J]),L=t.useCallback(y=>{var Z;const O=String(y);for(const W of Object.keys(D))if((Z=D[W])!=null&&Z.includes(O))return W;return null},[D]),E=t.useMemo(()=>M&&h.find(y=>{var O;return String(((O=y._id)==null?void 0:O.$oid)||y._id)===String(M)})||null,[M,h]),I=t.useCallback(y=>{l&&(S.current&&clearTimeout(S.current),S.current=setTimeout(async()=>{try{await fetch(`/account/${a}/api/user/view-preferences`,{method:"POST",headers:{"Content-Type":"application/json"},credentials:"include",body:JSON.stringify({viewId:l,preferences:{kanban:{orderByColumn:y}}})})}catch{}},250))},[a,l]),oe=t.useCallback(async(y,O)=>{if(!B.classId)return;const Z=B.columns.find(W=>W.id===O);if(Z)try{await fetch(`/account/${a}/api/record/update-classification`,{method:"POST",headers:{"Content-Type":"application/json"},credentials:"include",body:JSON.stringify({recordId:y,classificationId:B.classId,optionId:Z.optionId==="none"?null:Z.optionId})})}catch(W){console.error("[RecordsKanban] Update error:",W)}},[a,B]),ae=y=>{k(String(y.active.id))},ue=()=>{k(null)},fe=y=>{const{active:O,over:Z}=y;if(k(null),!Z)return;const W=String(O.id),q=String(Z.id),P=L(W),K=B.columns.some(w=>String(w.id)===q)?q:L(q);if(!P||!K)return;if(P===K){const w=D[P]||[],se=w.indexOf(W),z=w.indexOf(q);if(se===-1||z===-1||se===z)return;const le=xt(w,se,z),xe={...b,[P]:le};f(xe),I(xe);return}const ne=[...D[P]||[]].filter(w=>w!==W),x=[...D[K]||[]],j=B.columns.some(w=>String(w.id)===q)?x.length:Math.max(0,x.indexOf(q));x.splice(j,0,W);const V={...b,[P]:ne,[K]:x};if(f(V),I(V),B.classId){const w=B.columns.find(se=>se.id===K);c(se=>se.map(z=>{var xe;if(String(((xe=z._id)==null?void 0:xe.$oid)||z._id)!==W)return z;const le=(z.classificationValues||[]).filter(u=>{var G;return(((G=u.classificationId)==null?void 0:G.$oid)||u.classificationId||u.classification_id)!==B.classId});return K!=="__none__"&&w&&le.push({classificationId:B.classId,optionId:w.optionId,optionLabel:w.title,optionColor:w.color}),{...z,classificationValues:le}})),oe(W,K)}};return e.jsxs("div",{ref:d,className:"h-full overflow-x-auto overflow-y-auto",style:{cursor:"grab",userSelect:"none",WebkitUserSelect:"none"},onMouseDown:X,onMouseMove:p,onMouseUp:g,onMouseLeave:g,children:[e.jsxs(ut,{sensors:te,collisionDetection:pt,autoScroll:{threshold:{x:.15,y:.15},interval:10,acceleration:5},onDragStart:ae,onDragEnd:fe,onDragCancel:ue,children:[e.jsx("div",{style:{display:"flex",flexWrap:"nowrap",alignItems:"flex-start",gap:"1.25rem",padding:"0.5rem",width:"max-content",minHeight:"100%"},children:B.columns.map(y=>{const O=J[y.id]||[];return y.id==="__none__"&&O.length===0?null:e.jsx(_t,{column:y,records:O,recordIds:D[y.id]||[],accountNumber:a,entitySlug:s,onQuickView:Q,cardTemplate:_,entityData:v},y.id)})}),e.jsx(ft,{children:E?e.jsx(Xe,{record:E,accountNumber:a,entitySlug:s,isDragging:!0,cardTemplate:_,entityData:v}):null})]}),R&&e.jsx(Mt,{record:R,columns:n,accountNumber:a,entitySlug:s,onClose:()=>F(null)})]})}const Pe=[{bg:"bg-primary-light shadow-primary",text:"text-primary",dot:"#4361ee"},{bg:"bg-info-light shadow-info",text:"text-info",dot:"#2196f3"},{bg:"bg-warning-light shadow-warning",text:"text-warning",dot:"#e2a03f"},{bg:"bg-danger-light shadow-danger",text:"text-danger",dot:"#e7515a"},{bg:"bg-success-light shadow-success",text:"text-success",dot:"#00ab55"},{bg:"bg-secondary-light shadow-secondary",text:"text-secondary",dot:"#805dca"}];function $t(r){return Pe[r%Pe.length]}function Rt(){return e.jsxs("svg",{width:"24",height:"24",viewBox:"0 0 24 24",fill:"none",className:"h-5 w-5 rotate-90 opacity-70 hover:opacity-100",children:[e.jsx("circle",{cx:"5",cy:"12",r:"2",stroke:"currentColor",strokeWidth:"1.5"}),e.jsx("circle",{opacity:"0.5",cx:"12",cy:"12",r:"2",stroke:"currentColor",strokeWidth:"1.5"}),e.jsx("circle",{cx:"19",cy:"12",r:"2",stroke:"currentColor",strokeWidth:"1.5"})]})}function Wt(){return e.jsxs("svg",{width:"24",height:"24",viewBox:"0 0 24 24",fill:"none",className:"h-4 w-4 ltr:mr-3 rtl:ml-3",children:[e.jsx("path",{d:"M15.2869 3.15178L14.3601 4.07866L5.83882 12.5999C5.26166 13.1771 4.97308 13.4656 4.7249 13.7838C4.43213 14.1592 4.18114 14.5653 3.97634 14.995C3.80273 15.3593 3.67368 15.7465 3.41556 16.5208L2.32181 19.8021L2.05445 20.6042C1.92743 20.9852 2.0266 21.4053 2.31063 21.6894C2.59466 21.9734 3.01478 22.0726 3.39584 21.9456L4.19792 21.6782L7.47918 20.5844C8.25353 20.3263 8.6407 20.1973 9.00498 20.0237C9.43469 19.8189 9.84082 19.5679 10.2162 19.2751C10.5344 19.0269 10.8229 18.7383 11.4001 18.1612L19.9213 9.63993L20.8482 8.71306C22.3839 7.17735 22.3839 4.68748 20.8482 3.15178C19.3125 1.61607 16.8226 1.61607 15.2869 3.15178Z",stroke:"currentColor",strokeWidth:"1.5"}),e.jsx("path",{opacity:"0.5",d:"M14.36 4.07812C14.36 4.07812 14.4759 6.04774 16.2138 7.78564C17.9517 9.52354 19.9213 9.6394 19.9213 9.6394M4.19789 21.6777L2.32178 19.8015",stroke:"currentColor",strokeWidth:"1.5"})]})}function Et(){return e.jsxs("svg",{width:"24",height:"24",viewBox:"0 0 24 24",fill:"none",className:"h-4.5 w-4.5 ltr:mr-3 rtl:ml-3",children:[e.jsx("path",{opacity:"0.5",d:"M3.27489 15.2957C2.42496 14.1915 2 13.6394 2 12C2 10.3606 2.42496 9.80853 3.27489 8.70433C4.97196 6.49956 7.81811 4 12 4C16.1819 4 19.028 6.49956 20.7251 8.70433C21.575 9.80853 22 10.3606 22 12C22 13.6394 21.575 14.1915 20.7251 15.2957C19.028 17.5004 16.1819 20 12 20C7.81811 20 4.97196 17.5004 3.27489 15.2957Z",stroke:"currentColor",strokeWidth:"1.5"}),e.jsx("path",{d:"M15 12C15 13.6569 13.6569 15 12 15C10.3431 15 9 13.6569 9 12C9 10.3431 10.3431 9 12 9C13.6569 9 15 10.3431 15 12Z",stroke:"currentColor",strokeWidth:"1.5"})]})}function Tt({filled:r}){return e.jsx("svg",{width:"24",height:"24",viewBox:"0 0 24 24",fill:"none",className:`h-4.5 w-4.5 group-hover:fill-warning ${r?"fill-warning":""}`,children:e.jsx("path",{d:"M9.15316 5.40838C10.4198 3.13613 11.0531 2 12 2C12.9469 2 13.5802 3.13612 14.8468 5.40837L15.1745 5.99623C15.5345 6.64193 15.7144 6.96479 15.9951 7.17781C16.2757 7.39083 16.6251 7.4699 17.3241 7.62805L17.9605 7.77203C20.4201 8.32856 21.65 8.60682 21.9426 9.54773C22.2352 10.4886 21.3968 11.4691 19.7199 13.4299L19.2861 13.9372C18.8096 14.4944 18.5713 14.773 18.4641 15.1177C18.357 15.4624 18.393 15.8341 18.465 16.5776L18.5306 17.2544C18.7841 19.8706 18.9109 21.1787 18.1449 21.7602C17.3788 22.3417 16.2273 21.8115 13.9243 20.7512L13.3285 20.4768C12.6741 20.1755 12.3469 20.0248 12 20.0248C11.6531 20.0248 11.3259 20.1755 10.6715 20.4768L10.0757 20.7512C7.77268 21.8115 6.62118 22.3417 5.85515 21.7602C5.08912 21.1787 5.21588 19.8706 5.4694 17.2544L5.53498 16.5776C5.60703 15.8341 5.64305 15.4624 5.53586 15.1177C5.42868 14.773 5.19043 14.4944 4.71392 13.9372L4.2801 13.4299C2.60325 11.4691 1.76482 10.4886 2.05742 9.54773C2.35002 8.60682 3.57986 8.32856 6.03954 7.77203L6.67589 7.62805C7.37485 7.4699 7.72433 7.39083 8.00494 7.17781C8.28555 6.96479 8.46553 6.64194 8.82547 5.99623L9.15316 5.40838Z",stroke:"currentColor",strokeWidth:"1.5"})})}function zt(){return e.jsx("svg",{width:"24",height:"24",viewBox:"0 0 24 24",fill:"none",className:"h-3 w-3 rotate-45",children:e.jsx("path",{d:"M2 12C2 7.28595 2 4.92893 3.46447 3.46447C4.92893 2 7.28595 2 12 2C16.714 2 19.0711 2 20.5355 3.46447C22 4.92893 22 7.28595 22 12C22 16.714 22 19.0711 20.5355 20.5355C19.0711 22 16.714 22 12 22C7.28595 22 4.92893 22 3.46447 20.5355C2 19.0711 2 16.714 2 12Z",stroke:"currentColor",strokeWidth:"1.5"})})}function Ft({record:r,accountNumber:n,entitySlug:a}){var S;const[s,l]=t.useState(!1),v=t.useRef(null);t.useEffect(()=>{if(!s)return;const h=c=>{v.current&&!v.current.contains(c.target)&&l(!1)};return document.addEventListener("mousedown",h),()=>document.removeEventListener("mousedown",h)},[s]);const d=((S=r._id)==null?void 0:S.$oid)||r._id;return e.jsxs("div",{ref:v,className:"dropdown relative",children:[e.jsx("button",{type:"button",className:"text-primary",onClick:h=>{h.preventDefault(),h.stopPropagation(),l(!s)},children:e.jsx(Rt,{})}),s&&e.jsxs("ul",{className:"absolute z-50 min-w-[140px] rounded-md bg-white dark:bg-[#1b2e4b] shadow-lg border dark:border-gray-700 py-1 text-sm font-medium ltr:right-0 rtl:left-0 top-full mt-1",style:{animation:"fadeIn 0.15s ease-out"},children:[e.jsx("li",{children:e.jsxs("a",{href:`/account/${n}/record/${a}/${d}/edit`,className:"flex items-center px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 w-full",onClick:h=>h.stopPropagation(),children:[e.jsx(Wt,{})," Edit"]})}),e.jsx("li",{children:e.jsxs("a",{href:`/account/${n}/record/${a}/${d}`,className:"flex items-center px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 w-full",onClick:h=>h.stopPropagation(),children:[e.jsx(Et,{})," View"]})})]})]})}function Ot({record:r,accountNumber:n,entitySlug:a,style:s,favorites:l,onToggleFav:v}){var M,k;const d=l[r._id]||!1,S=((M=r._id)==null?void 0:M.$oid)||r._id,h=r.referenceTitle||r.title||r.computedTitle||"Sans titre",c=r.createdAt?new Date(r.createdAt).toLocaleDateString("fr-FR",{day:"2-digit",month:"short",year:"numeric"}):"",b=(r.customFields||[]).find(R=>{var F,Q,_,m,Y,U;return((Q=(F=R.field_id)==null?void 0:F.label)==null?void 0:Q.toLowerCase().includes("descri"))||((m=(_=R.field_id)==null?void 0:_.label)==null?void 0:m.toLowerCase().includes("note"))||((U=(Y=R.field_id)==null?void 0:Y.label)==null?void 0:U.toLowerCase().includes("contenu"))}),f=(b==null?void 0:b.value)||r.description||"";return(r.classificationValues||[]).filter(R=>R.optionLabel).map(R=>({label:R.optionLabel,color:R.optionColor||R.color||s.dot})),e.jsxs("div",{className:`panel pb-12 relative ${s.bg}`,children:[e.jsxs("div",{className:"min-h-[142px]",children:[e.jsxs("div",{className:"flex justify-between",children:[e.jsxs("div",{className:"flex w-max items-center",children:[e.jsx("div",{className:"flex-none",children:e.jsx("div",{className:"rounded-full bg-gray-300 p-2 dark:bg-gray-700",children:e.jsxs("svg",{width:"24",height:"24",viewBox:"0 0 24 24",fill:"none",className:"h-4.5 w-4.5",children:[e.jsx("circle",{cx:"12",cy:"6",r:"4",stroke:"currentColor",strokeWidth:"1.5"}),e.jsx("ellipse",{opacity:"0.5",cx:"12",cy:"17",rx:"7",ry:"4",stroke:"currentColor",strokeWidth:"1.5"})]})})}),e.jsxs("div",{className:"ltr:ml-2 rtl:mr-2",children:[e.jsx("div",{className:"font-semibold",children:((k=r.createdBy)==null?void 0:k.name)||"Utilisateur"}),e.jsx("div",{className:"text-sx text-white-dark",children:c})]})]}),e.jsx(Ft,{record:r,accountNumber:n,entitySlug:a})]}),e.jsxs("div",{children:[e.jsx("h4",{className:"mt-4 font-semibold",children:e.jsx("a",{href:`/account/${n}/record/${a}/${S}`,className:"hover:text-primary transition-colors",children:h})}),f&&e.jsx("p",{className:"mt-2 text-white-dark line-clamp-3",children:f})]})]}),e.jsx("div",{className:"absolute bottom-5 left-0 w-full px-5",children:e.jsxs("div",{className:"mt-2 flex items-center justify-between",children:[e.jsx("div",{className:s.text,children:e.jsx(zt,{})}),e.jsx("div",{className:"flex items-center gap-2",children:e.jsx("button",{type:"button",className:"group text-warning ltr:ml-2 rtl:mr-2",onClick:R=>{R.preventDefault(),R.stopPropagation(),v(r._id)},children:e.jsx(Tt,{filled:d})})})]})})]})}function At({records:r,accountNumber:n,entitySlug:a}){const[s,l]=t.useState({}),v=t.useCallback(d=>{l(S=>({...S,[d]:!S[d]}))},[]);return e.jsx("div",{className:"h-full overflow-y-auto",children:e.jsx("div",{className:"grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",children:r.length===0?e.jsx("div",{className:"col-span-full text-center py-20 text-gray-400 dark:text-gray-600 italic",children:"Aucun enregistrement"}):r.map((d,S)=>{var h;return e.jsx(Ot,{record:d,accountNumber:n,entitySlug:a,style:$t(S),favorites:s,onToggleFav:v},((h=d._id)==null?void 0:h.$oid)||d._id)})})})}const Ae={Planifié:{className:"primary",bg:"#4361ee",text:"#fff"},Confirmé:{className:"info",bg:"#2196f3",text:"#fff"},Terminé:{className:"success",bg:"#00ab55",text:"#fff"},Annulé:{className:"danger",bg:"#e7515a",text:"#fff"},"Non présenté":{className:"warning",bg:"#e2a03f",text:"#fff"}},Ie=[{className:"primary",bg:"#4361ee",text:"#fff"},{className:"info",bg:"#2196f3",text:"#fff"},{className:"success",bg:"#00ab55",text:"#fff"},{className:"danger",bg:"#e7515a",text:"#fff"},{className:"warning",bg:"#e2a03f",text:"#fff"}];function Vt(r,n){if(n){const a=(r.customFields||[]).find(s=>{var v,d,S;return(((d=(v=s.field_id)==null?void 0:v._id)==null?void 0:d.toString())||((S=s.field_id)==null?void 0:S.toString()))===n});if(a!=null&&a.value){const s=new Date(a.value);if(!isNaN(s))return s}}if(r.date){const a=new Date(r.date);if(!isNaN(a))return a}if(r.createdAt){const a=new Date(r.createdAt);if(!isNaN(a))return a}return null}function Bt(r,n){if(!n)return 30;const a=(r.customFields||[]).find(s=>{var v,d,S;return(((d=(v=s.field_id)==null?void 0:v._id)==null?void 0:d.toString())||((S=s.field_id)==null?void 0:S.toString()))===n});return parseInt(a==null?void 0:a.value)||30}function Dt(r){const n=r.classificationValues||[];for(const a of n)if(a.label||a.optionLabel)return a.label||a.optionLabel;return null}function Pt(r){const n=["Dimanche","Lundi","Mardi","Mercredi","Jeudi","Vendredi","Samedi"],a=["janvier","février","mars","avril","mai","juin","juillet","août","septembre","octobre","novembre","décembre"];return`${n[r.getDay()]} ${r.getDate()} ${a[r.getMonth()]} ${r.getFullYear()}`}function Ht(r){const n=r.getFullYear(),a=String(r.getMonth()+1).padStart(2,"0"),s=String(r.getDate()).padStart(2,"0"),l=String(r.getHours()).padStart(2,"0"),v=String(r.getMinutes()).padStart(2,"0");return`${n}-${a}-${s}T${l}:${v}`}function Jt({message:r,type:n="success",onClose:a}){t.useEffect(()=>{const v=setTimeout(a,3e3);return()=>clearTimeout(v)},[a]);const s={success:{bg:"#00ab55",icon:"✓"},error:{bg:"#e7515a",icon:"✕"},info:{bg:"#4361ee",icon:"ℹ"}},l=s[n]||s.info;return e.jsxs("div",{style:{position:"fixed",bottom:24,right:24,zIndex:1e4,display:"flex",alignItems:"center",gap:10,padding:"12px 20px",borderRadius:12,backgroundColor:l.bg,color:"#fff",boxShadow:"0 8px 32px rgba(0,0,0,0.18)",animation:"slideInRight 0.3s ease",fontSize:13,fontWeight:600},children:[e.jsx("span",{style:{fontSize:16},children:l.icon}),r]})}function Ut({isOpen:r,onClose:n,onSave:a,initialDate:s,entityData:l,accountNumber:v}){const[d,S]=t.useState(""),[h,c]=t.useState(""),[b,f]=t.useState("30"),[M,k]=t.useState(!1),R=t.useRef(null);if(t.useEffect(()=>{r&&s&&(c(Ht(s)),S(""),f("30"),setTimeout(()=>{var _;return(_=R.current)==null?void 0:_.focus()},100))},[r,s]),!r)return null;const F=async _=>{if(_.preventDefault(),!!d.trim()){k(!0);try{await a({title:d.trim(),date:h,duration:parseInt(b)}),n()}catch(m){console.error(m)}k(!1)}},Q=[15,30,45,60,90,120];return e.jsx("div",{style:{position:"fixed",inset:0,zIndex:9999,backgroundColor:"rgba(0,0,0,0.4)",backdropFilter:"blur(4px)",display:"flex",alignItems:"center",justifyContent:"center",animation:"fadeIn 0.2s ease"},onClick:_=>{_.target===_.currentTarget&&n()},children:e.jsxs("div",{style:{backgroundColor:"#fff",borderRadius:16,width:"100%",maxWidth:440,boxShadow:"0 24px 80px rgba(0,0,0,0.2)",animation:"slideUp 0.3s ease",overflow:"hidden"},children:[e.jsxs("div",{style:{padding:"20px 24px 16px",display:"flex",alignItems:"center",justifyContent:"space-between",borderBottom:"1px solid #f0f0f0"},children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:10},children:[e.jsx("div",{style:{width:36,height:36,borderRadius:10,background:"linear-gradient(135deg, #4361ee, #805cf6)",display:"flex",alignItems:"center",justifyContent:"center"},children:e.jsx("svg",{viewBox:"0 0 24 24",fill:"none",style:{width:18,height:18,color:"#fff"},children:e.jsx("path",{d:"M12 5V19M5 12H19",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round"})})}),e.jsxs("div",{children:[e.jsx("h3",{style:{margin:0,fontSize:16,fontWeight:700,color:"#1a1a2e"},children:"Nouveau rendez-vous"}),e.jsx("p",{style:{margin:0,fontSize:11,color:"#888",marginTop:2},children:s?Pt(s):""})]})]}),e.jsx("button",{onClick:n,style:{border:"none",background:"#f5f5f5",borderRadius:8,width:32,height:32,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer"},children:e.jsx("svg",{viewBox:"0 0 24 24",fill:"none",style:{width:16,height:16,color:"#666"},children:e.jsx("path",{d:"M18 6L6 18M6 6L18 18",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round"})})})]}),e.jsxs("form",{onSubmit:F,style:{padding:"20px 24px 24px"},children:[e.jsxs("div",{style:{marginBottom:16},children:[e.jsx("label",{style:{display:"block",fontSize:12,fontWeight:600,color:"#555",marginBottom:6},children:"Titre *"}),e.jsx("input",{ref:R,type:"text",value:d,onChange:_=>S(_.target.value),placeholder:"Ex: Consultation Dr. Martin",required:!0,style:{width:"100%",padding:"10px 14px",border:"1.5px solid #e0e0e0",borderRadius:10,fontSize:14,outline:"none",transition:"border 0.2s",boxSizing:"border-box"},onFocus:_=>_.target.style.borderColor="#4361ee",onBlur:_=>_.target.style.borderColor="#e0e0e0"})]}),e.jsxs("div",{style:{marginBottom:16},children:[e.jsx("label",{style:{display:"block",fontSize:12,fontWeight:600,color:"#555",marginBottom:6},children:"Date et heure"}),e.jsx("input",{type:"datetime-local",value:h,onChange:_=>c(_.target.value),style:{width:"100%",padding:"10px 14px",border:"1.5px solid #e0e0e0",borderRadius:10,fontSize:14,outline:"none",transition:"border 0.2s",boxSizing:"border-box"},onFocus:_=>_.target.style.borderColor="#4361ee",onBlur:_=>_.target.style.borderColor="#e0e0e0"})]}),e.jsxs("div",{style:{marginBottom:20},children:[e.jsx("label",{style:{display:"block",fontSize:12,fontWeight:600,color:"#555",marginBottom:8},children:"Durée"}),e.jsx("div",{style:{display:"flex",flexWrap:"wrap",gap:6},children:Q.map(_=>e.jsx("button",{type:"button",onClick:()=>f(String(_)),style:{padding:"6px 14px",borderRadius:20,fontSize:12,fontWeight:600,border:b===String(_)?"1.5px solid #4361ee":"1.5px solid #e0e0e0",backgroundColor:b===String(_)?"#4361ee":"#fff",color:b===String(_)?"#fff":"#555",cursor:"pointer",transition:"all 0.2s"},children:_<60?`${_} min`:`${_/60}h`},_))})]}),e.jsxs("div",{style:{display:"flex",gap:10,justifyContent:"flex-end"},children:[e.jsx("button",{type:"button",onClick:n,style:{padding:"10px 20px",borderRadius:10,fontSize:13,fontWeight:600,border:"1.5px solid #e0e0e0",backgroundColor:"#fff",color:"#555",cursor:"pointer",transition:"all 0.2s"},children:"Annuler"}),e.jsx("button",{type:"submit",disabled:M||!d.trim(),style:{padding:"10px 24px",borderRadius:10,fontSize:13,fontWeight:600,border:"none",background:d.trim()?"linear-gradient(135deg, #4361ee, #805cf6)":"#ccc",color:"#fff",cursor:d.trim()?"pointer":"not-allowed",transition:"all 0.2s",opacity:M?.7:1},children:M?"Création...":"Créer le RDV"})]})]})]})})}function qt({event:r,position:n,onClose:a,onEdit:s,onDelete:l,accountNumber:v,entitySlug:d,cardTemplate:S}){var F,Q;const h=t.useRef(null);if(t.useEffect(()=>{const _=m=>{h.current&&!h.current.contains(m.target)&&a()};return document.addEventListener("mousedown",_),()=>document.removeEventListener("mousedown",_)},[a]),!r)return null;const c=r.start?new Date(r.start):null,b=r.end?new Date(r.end):null,f=(F=r.extendedProps)==null?void 0:F.status,M=f?Ae[f]:null,R={_id:((Q=r.extendedProps)==null?void 0:Q.recordId)||r.id,referenceTitle:r.title,_start:c,_end:b,classificationValues:f?[{optionLabel:f,optionColor:M?M.bg:"#4361ee"}]:[],createdAt:c,...r.extendedProps};return e.jsx("div",{ref:h,style:{position:"fixed",top:Math.min(n.y,window.innerHeight-280),left:Math.min(n.x,window.innerWidth-340),zIndex:9998,width:320,backgroundColor:"#fff",borderRadius:14,boxShadow:"0 16px 64px rgba(0,0,0,0.18)",animation:"slideUp 0.2s ease",overflow:"hidden"},children:e.jsx(Ke,{record:R,cardTemplate:S,context:"calendar",accountNumber:v,entitySlug:d,callbacks:{onClose:a},style:{borderRadius:0}})})}function Yt({records:r=[],columns:n=[],accountNumber:a,entitySlug:s,entityData:l}){var q,P,K,ne;const v=t.useRef(null),d=t.useRef(null),[S,h]=t.useState(!1),[c,b]=t.useState(!1),[f,M]=t.useState(null),[k,R]=t.useState(null),[F,Q]=t.useState({x:0,y:0}),[_,m]=t.useState(null),[Y,U]=t.useState(r),[H,X]=t.useState(!1),[p,g]=t.useState({weekStartsOn:1,startHour:"07:00",endHour:"20:00",hideWeekend:!1,slotDuration:"00:15:00",slotLabelInterval:"01:00",compactMode:!1});t.useEffect(()=>{var o;if(!(l!=null&&l._id))return;const x=((o=l._id)==null?void 0:o.$oid)||l._id;fetch(`/account/${a}/api/user/view-preferences?viewId=calendar_${x}`,{credentials:"include"}).then(j=>j.json()).then(j=>{var V;j.success&&((V=j.preferences)!=null&&V.calendarSettings)&&g(w=>({...w,...j.preferences.calendarSettings}))}).catch(()=>{})},[l==null?void 0:l._id,a]);const te=t.useCallback(async x=>{var j;g(x),X(!1);const o=((j=l==null?void 0:l._id)==null?void 0:j.$oid)||(l==null?void 0:l._id);if(o)try{await fetch(`/account/${a}/api/user/view-preferences`,{method:"POST",headers:{"Content-Type":"application/json"},credentials:"include",body:JSON.stringify({viewId:`calendar_${o}`,preferences:{calendarSettings:x}})}),m({message:"Paramètres sauvegardés",type:"success"})}catch{m({message:"Erreur sauvegarde paramètres",type:"error"})}},[a,l]);t.useEffect(()=>{U(r)},[r]);const[B,J]=t.useState(null);t.useEffect(()=>{var o;if(!(l!=null&&l._id))return;const x=((o=l._id)==null?void 0:o.$oid)||l._id;fetch(`/account/${a}/api/entity/${x}/cards/default/calendar`,{credentials:"include"}).then(j=>j.json()).then(j=>{j.success&&j.card&&J(j.card)}).catch(()=>{})},[l==null?void 0:l._id,a]);const{dateFieldId:D,durationFieldId:L}=t.useMemo(()=>{var z,le,xe,u,T;if(!l)return{dateFieldId:null,durationFieldId:null};const x=l.customFields||[],o=x.filter(G=>G.type==="date"||G.inputType==="date"||G.inputType==="datetime-local"),j=o.find(G=>/^date/i.test(G.name||"")||/date/i.test(G.label||"")),V=((z=j==null?void 0:j._id)==null?void 0:z.toString())||((xe=(le=o[0])==null?void 0:le._id)==null?void 0:xe.toString())||null,se=((T=(u=x.filter(G=>G.type==="number"&&(/dur/i.test(G.name||"")||/dur/i.test(G.label||"")))[0])==null?void 0:u._id)==null?void 0:T.toString())||null;return{dateFieldId:V,durationFieldId:se}},[l]),E=(q=l==null?void 0:l._id)==null?void 0:q.toString(),I=(K=(P=l==null?void 0:l.statusClassification)==null?void 0:P._id)==null?void 0:K.toString(),oe=((ne=l==null?void 0:l.statusClassification)==null?void 0:ne.options)||[],ae=oe.find(x=>/planif/i.test(x.label))||oe[0],ue=t.useMemo(()=>Y.map((x,o)=>{const j=Vt(x,D);if(!j)return null;const V=Bt(x,L),w=new Date(j.getTime()+V*6e4),se=x.referenceTitle||x.computedTitle||x.title||"Sans titre",z=Dt(x),le=z&&Ae[z]||Ie[o%Ie.length];return{id:x._id,title:se,start:j.toISOString(),end:w.toISOString(),className:le.className,extendedProps:{recordId:x._id,status:z,entitySlug:s,accountNumber:a,dateFieldId:D,durationFieldId:L}}}).filter(Boolean),[Y,D,L,s,a]),fe=t.useCallback(x=>{x.jsEvent.preventDefault(),x.jsEvent.stopPropagation();const o=x.el.getBoundingClientRect();Q({x:o.right+8,y:o.top}),R(x.event)},[]),y=t.useCallback(x=>{R(null);const o=x.start;M(o),b(!0),d.current&&d.current.unselect()},[]),O=t.useCallback(async x=>{var z,le,xe;const o=((z=x.event.extendedProps)==null?void 0:z.recordId)||x.event.id,j=x.event.start.toISOString(),V=(le=x.event.end)==null?void 0:le.toISOString(),w=(xe=x.event.extendedProps)==null?void 0:xe.dateFieldId;let se;x.event.start&&x.event.end&&(se=Math.round((x.event.end-x.event.start)/6e4));try{if(!(await fetch(`/account/${a}/api/records/${o}/date`,{method:"PATCH",headers:{"Content-Type":"application/json"},credentials:"include",body:JSON.stringify({dateFieldId:w,newStart:j,newEnd:V,duration:se})})).ok)throw new Error("Failed");m({message:"RDV déplacé avec succès",type:"success"})}catch{x.revert(),m({message:"Erreur lors du déplacement",type:"error"})}},[a]),Z=t.useCallback(async x=>{var se,z;const o=((se=x.event.extendedProps)==null?void 0:se.recordId)||x.event.id,j=x.event.start.toISOString(),V=(z=x.event.extendedProps)==null?void 0:z.dateFieldId;let w;x.event.start&&x.event.end&&(w=Math.round((x.event.end-x.event.start)/6e4));try{if(!(await fetch(`/account/${a}/api/records/${o}/date`,{method:"PATCH",headers:{"Content-Type":"application/json"},credentials:"include",body:JSON.stringify({dateFieldId:V,newStart:j,duration:w})})).ok)throw new Error("Failed");m({message:`Durée modifiée (${w} min)`,type:"success"})}catch{x.revert(),m({message:"Erreur lors du redimensionnement",type:"error"})}},[a]),W=t.useCallback(async({title:x,date:o,duration:j})=>{var se;if(!E||!D)return;const V=await fetch(`/account/${a}/api/entity/${E}/records/quick-add`,{method:"POST",headers:{"Content-Type":"application/json"},credentials:"include",body:JSON.stringify({title:x,dateFieldId:D,dateValue:new Date(o).toISOString(),duration:j,durationFieldId:L,statusOptionId:(se=ae==null?void 0:ae._id)==null?void 0:se.toString(),statusClassificationId:I})});if(!V.ok)throw new Error("Failed to create");const w=await V.json();w.record&&U(z=>[...z,w.record]),m({message:`"${x}" créé avec succès !`,type:"success"})},[a,E,D,L,ae,I]);return t.useEffect(()=>{if(typeof FullCalendar<"u"){h(!0);return}const x=setInterval(()=>{typeof FullCalendar<"u"&&(h(!0),clearInterval(x))},200);if(!document.querySelector('script[src*="fullcalendar"]')){const o=document.createElement("link");o.rel="stylesheet",o.href="/assets/css/fullcalendar.min.css",document.head.appendChild(o);const j=document.createElement("script");j.src="/assets/js/fullcalendar.min.js",j.onload=()=>h(!0),document.head.appendChild(j)}return()=>clearInterval(x)},[]),t.useEffect(()=>{if(!S||!v.current||typeof FullCalendar>"u")return;d.current&&d.current.destroy();const x=p.hideWeekend?[0,6]:[],o=new FullCalendar.Calendar(v.current,{initialView:"timeGridWeek",headerToolbar:{left:"prev,next today",center:"title",right:"dayGridMonth,timeGridWeek,timeGridDay"},locale:"fr",buttonText:{today:"Aujourd'hui",month:"Mois",week:"Semaine",day:"Jour"},editable:!0,selectable:!0,selectMirror:!0,dayMaxEvents:3,height:"auto",firstDay:p.weekStartsOn,hiddenDays:x,slotDuration:p.slotDuration,snapDuration:p.slotDuration,slotLabelInterval:p.slotLabelInterval,slotLabelFormat:{hour:"2-digit",minute:"2-digit",hour12:!1},slotMinTime:p.startHour+":00",slotMaxTime:p.endHour+":00",businessHours:{daysOfWeek:p.hideWeekend?[1,2,3,4,5]:[0,1,2,3,4,5,6],startTime:p.startHour,endTime:p.endHour},scrollTime:p.startHour+":00",nowIndicator:!0,events:ue,eventClick:fe,select:y,eventDrop:O,eventResize:Z,eventContent:j=>{const V=j.event.start,w=j.event.end,se=V?`${String(V.getHours()).padStart(2,"0")}:${String(V.getMinutes()).padStart(2,"0")}`:"",z=w?`${String(w.getHours()).padStart(2,"0")}:${String(w.getMinutes()).padStart(2,"0")}`:"";return{html:`<div style="line-height:1.2;padding:2px 4px;overflow:hidden;"><div style="font-weight:700;font-size:11px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin:0;">${j.event.title}</div><div style="font-size:10px;opacity:0.85;margin:0;font-weight:500;">De ${se} à ${z}</div></div>`}},eventDidMount:j=>{var w;j.el.style.cursor="pointer",j.el.style.borderRadius="6px",j.el.style.border="none",j.el.style.overflow="hidden";const V=(w=j.event.extendedProps)==null?void 0:w.status;j.el.title=j.event.title+(V?` — ${V}`:"")},dayHeaderFormat:{weekday:"short",day:"numeric",month:"short"},allDaySlot:!1});return o.render(),d.current=o,()=>{d.current&&(d.current.destroy(),d.current=null)}},[S,ue,fe,y,O,Z,p]),S?!D&&r.length>0?e.jsxs("div",{style:{display:"flex",alignItems:"center",justifyContent:"center",padding:"48px 0",flexDirection:"column"},children:[e.jsxs("svg",{viewBox:"0 0 24 24",fill:"none",style:{width:48,height:48,marginBottom:12,color:"#ccc"},children:[e.jsx("rect",{x:"3",y:"4",width:"18",height:"18",rx:"2",stroke:"currentColor",strokeWidth:"1.5"}),e.jsx("path",{d:"M16 2V6M8 2V6M3 10H21",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"})]}),e.jsx("p",{style:{fontSize:14,fontWeight:500,color:"#888"},children:"Aucun champ date trouvé"}),e.jsx("p",{style:{fontSize:12,color:"#aaa",marginTop:4},children:"Ajoutez un champ date à cette entité"})]}):e.jsxs("div",{style:{position:"relative"},children:[e.jsx("style",{children:`
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes slideUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
                @keyframes slideInRight { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: translateX(0); } }
                .fc .fc-timegrid-slot { height: ${p.compactMode?"20px":"40px"} !important; }
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
            `}),e.jsxs("div",{style:{marginBottom:12,display:"flex",flexWrap:"wrap",gap:12,alignItems:"center",justifyContent:"space-between",padding:"8px 0"},children:[e.jsx("div",{style:{display:"flex",flexWrap:"wrap",gap:10},children:Object.entries(Ae).map(([x,o])=>e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:5,fontSize:11,color:"#666"},children:[e.jsx("div",{style:{width:8,height:8,borderRadius:2,backgroundColor:o.bg}}),x]},x))}),e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:12},children:[e.jsx("span",{style:{fontSize:11,color:"#aaa",fontStyle:"italic"},children:"Cliquer pour ajouter • Glisser pour déplacer"}),e.jsxs("button",{onClick:()=>X(!0),style:{display:"flex",alignItems:"center",gap:6,padding:"6px 14px",border:"1px solid #e2e8f0",borderRadius:8,background:"#fff",cursor:"pointer",fontSize:12,fontWeight:600,color:"#475569",transition:"all 0.2s"},onMouseEnter:x=>{x.currentTarget.style.borderColor="#4361ee",x.currentTarget.style.color="#4361ee"},onMouseLeave:x=>{x.currentTarget.style.borderColor="#e2e8f0",x.currentTarget.style.color="#475569"},children:[e.jsx("iconify-icon",{icon:"solar:settings-linear",width:"15"}),"Config"]})]})]}),e.jsx("div",{className:"calendar-wrapper",ref:v}),H&&e.jsx(Zt,{settings:p,onSave:te,onClose:()=>X(!1)}),e.jsx(Ut,{isOpen:c,onClose:()=>b(!1),onSave:W,initialDate:f,entityData:l,accountNumber:a}),k&&e.jsx(qt,{event:k,position:F,onClose:()=>R(null),accountNumber:a,entitySlug:s,cardTemplate:B}),_&&e.jsx(Jt,{message:_.message,type:_.type,onClose:()=>m(null)})]}):e.jsxs("div",{style:{display:"flex",alignItems:"center",justifyContent:"center",padding:"48px 0"},children:[e.jsx("div",{className:"animate-spin rounded-full h-8 w-8 border-b-2 border-primary"}),e.jsx("span",{style:{marginLeft:12,color:"#888"},children:"Chargement du calendrier..."})]})}function Zt({settings:r,onSave:n,onClose:a}){const[s,l]=t.useState({...r}),v=[];for(let d=0;d<24;d++){const S=`${String(d).padStart(2,"0")}:00`;v.push(S)}return e.jsxs(e.Fragment,{children:[e.jsx("div",{className:"cal-settings-overlay",onClick:a}),e.jsxs("div",{className:"cal-settings-panel",children:[e.jsxs("div",{className:"header",children:[e.jsxs("h3",{children:[e.jsx("iconify-icon",{icon:"solar:settings-bold-duotone",width:"20",style:{verticalAlign:"middle",marginRight:8,color:"#4361ee"}}),"Paramètres du calendrier"]}),e.jsx("button",{onClick:a,style:{background:"none",border:"none",cursor:"pointer",padding:4,borderRadius:6,color:"#94a3b8"},children:e.jsx("iconify-icon",{icon:"solar:close-circle-linear",width:"22"})})]}),e.jsxs("div",{className:"body",children:[e.jsxs("div",{className:"cal-field",children:[e.jsx("label",{children:"Premier jour de la semaine"}),e.jsxs("select",{value:s.weekStartsOn,onChange:d=>l({...s,weekStartsOn:parseInt(d.target.value)}),children:[e.jsx("option",{value:1,children:"Lundi"}),e.jsx("option",{value:0,children:"Dimanche"}),e.jsx("option",{value:6,children:"Samedi"})]})]}),e.jsxs("div",{style:{display:"flex",gap:12},children:[e.jsxs("div",{className:"cal-field",style:{flex:1},children:[e.jsx("label",{children:"Heure de début"}),e.jsx("select",{value:s.startHour,onChange:d=>l({...s,startHour:d.target.value}),children:v.map(d=>e.jsx("option",{value:d,children:d},d))})]}),e.jsxs("div",{className:"cal-field",style:{flex:1},children:[e.jsx("label",{children:"Heure de fin"}),e.jsx("select",{value:s.endHour,onChange:d=>l({...s,endHour:d.target.value}),children:v.map(d=>e.jsx("option",{value:d,children:d},d))})]})]}),e.jsxs("div",{className:"cal-field",children:[e.jsx("label",{children:"Intervalle des créneaux"}),e.jsxs("select",{value:s.slotDuration,onChange:d=>l({...s,slotDuration:d.target.value}),children:[e.jsx("option",{value:"00:05:00",children:"5 minutes"}),e.jsx("option",{value:"00:10:00",children:"10 minutes"}),e.jsx("option",{value:"00:15:00",children:"15 minutes"}),e.jsx("option",{value:"00:30:00",children:"30 minutes"}),e.jsx("option",{value:"01:00:00",children:"1 heure"})]})]}),e.jsxs("div",{className:"cal-field",children:[e.jsx("label",{children:"Affichage des heures"}),e.jsxs("select",{value:s.slotLabelInterval,onChange:d=>l({...s,slotLabelInterval:d.target.value}),children:[e.jsx("option",{value:"00:30:00",children:"Toutes les 30 min"}),e.jsx("option",{value:"01:00:00",children:"Toutes les heures"}),e.jsx("option",{value:"02:00:00",children:"Toutes les 2 heures"})]})]}),e.jsx("div",{style:{height:1,background:"#f1f5f9",margin:"8px 0 20px"}}),e.jsxs("div",{className:"cal-toggle",children:[e.jsxs("div",{children:[e.jsx("div",{className:"cal-toggle-label",children:"Mode compact"}),e.jsx("div",{className:"cal-toggle-desc",children:"Réduit l'espacement des créneaux pour une vue d'ensemble"})]}),e.jsxs("label",{className:"cal-switch",children:[e.jsx("input",{type:"checkbox",checked:s.compactMode,onChange:d=>l({...s,compactMode:d.target.checked})}),e.jsx("span",{className:"slider"})]})]}),e.jsxs("div",{className:"cal-toggle",children:[e.jsxs("div",{children:[e.jsx("div",{className:"cal-toggle-label",children:"Masquer le weekend"}),e.jsx("div",{className:"cal-toggle-desc",children:"Afficher uniquement du lundi au vendredi"})]}),e.jsxs("label",{className:"cal-switch",children:[e.jsx("input",{type:"checkbox",checked:s.hideWeekend,onChange:d=>l({...s,hideWeekend:d.target.checked})}),e.jsx("span",{className:"slider"})]})]})]}),e.jsxs("div",{className:"footer",children:[e.jsx("button",{className:"cal-btn cal-btn-ghost",onClick:a,children:"Annuler"}),e.jsxs("button",{className:"cal-btn cal-btn-primary",onClick:()=>n(s),children:[e.jsx("iconify-icon",{icon:"solar:check-circle-bold",width:"16",style:{verticalAlign:"middle",marginRight:4}}),"Appliquer"]})]})]})]})}const Qe={contains:{label:"Contient",icon:"⊃",types:["text","email","phone","url","textarea","title","relation"]},not_contains:{label:"Ne contient pas",icon:"⊅",types:["text","email","phone","url","textarea","title","relation"]},equals:{label:"Est égal à",icon:"=",types:["text","email","phone","url","number","date","title","select","relation","classification"]},not_equals:{label:"N'est pas égal à",icon:"≠",types:["text","email","phone","url","number","date","title","select","relation","classification"]},starts_with:{label:"Commence par",icon:"A…",types:["text","email","phone","url","title"]},ends_with:{label:"Se termine par",icon:"…Z",types:["text","email","phone","url","title"]},gt:{label:"Supérieur à",icon:">",types:["number","date"]},gte:{label:"Supérieur ou égal",icon:"≥",types:["number","date"]},lt:{label:"Inférieur à",icon:"<",types:["number","date"]},lte:{label:"Inférieur ou égal",icon:"≤",types:["number","date"]},between:{label:"Entre",icon:"↔",types:["number","date"]},is_empty:{label:"Est vide",icon:"∅",types:["text","email","phone","url","number","date","textarea","title","select","relation","classification"]},is_not_empty:{label:"N'est pas vide",icon:"∃",types:["text","email","phone","url","number","date","textarea","title","select","relation","classification"]}};function Fe(r){const n=r||"text";return Object.entries(Qe).filter(([a,s])=>s.types.includes(n)).map(([a,s])=>({key:a,...s}))}function He(r){return["number","currency","percent"].includes(r)?"number":["date","datetime"].includes(r)?"date":"text"}function Kt({columns:r=[],fieldFilters:n=[],onFieldFiltersChange:a,allRecords:s=[],sidebarFilters:l=[]}){const[v,d]=t.useState(n.length>0),[S,h]=t.useState(null),[c,b]=t.useState(!1),f=t.useRef(null);t.useEffect(()=>{const p=g=>{c&&f.current&&!f.current.contains(g.target)&&b(!1)};return c&&document.addEventListener("mousedown",p),()=>document.removeEventListener("mousedown",p)},[c]);const M=$e.useMemo(()=>{const p={};return l.forEach(g=>{p[`classif:${g.id}`]=g.options||[]}),p},[l]),k=r.filter(p=>p.id!=="actions"),R=t.useCallback(p=>{const g=k.find(L=>L.id===p);if(!g)return;const te=p.startsWith("classif:"),B=Fe(g.type),J=te?B.find(L=>L.key==="equals")||B[0]:B.find(L=>L.key==="contains")||B[0],D={fieldId:p,fieldName:g.name,fieldType:g.type||"text",operator:J.key,value:"",value2:"",logic:"AND"};a([...n,D]),b(!1),h(n.length)},[k,n,a]),F=t.useCallback((p,g)=>{const te=n.map((B,J)=>J===p?{...B,...g}:B);a(te)},[n,a]),Q=t.useCallback(p=>{const g=n.filter((te,B)=>B!==p);a(g),S===p&&h(null)},[n,a,S]),_=t.useCallback(()=>{a([]),h(null)},[a]),m=p=>["is_empty","is_not_empty"].includes(p),Y=p=>p==="between",U=p=>p&&p.startsWith("classif:"),H=p=>M[p]||[],X=(p,g)=>{const B=H(p).find(J=>J.id===g||J.label===g);return B?B.label:g};return e.jsxs("div",{className:"adv-filters-container",children:[e.jsxs("button",{type:"button",className:"adv-filters-header",onClick:()=>d(!v),children:[e.jsxs("div",{className:"adv-filters-header-left",children:[e.jsx("svg",{viewBox:"0 0 24 24",fill:"none",className:"adv-filters-header-icon",children:e.jsx("path",{d:"M22 3H2L10 12.46V19L14 21V12.46L22 3Z",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round"})}),e.jsx("span",{children:"Filtres avancés"}),n.length>0&&e.jsx("span",{className:"adv-filters-count",children:n.length})]}),e.jsx("svg",{viewBox:"0 0 24 24",fill:"none",className:`adv-filters-chevron ${v?"adv-filters-chevron--open":""}`,children:e.jsx("path",{d:"M9 18L15 12L9 6",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round"})})]}),v&&e.jsxs("div",{className:"adv-filters-body",children:[n.map((p,g)=>{var E;k.find(I=>I.id===p.fieldId);const te=Fe(p.fieldType),B=S===g,J=U(p.fieldId),D=J?H(p.fieldId):[],L=p.logic||"AND";return e.jsxs($e.Fragment,{children:[g>0&&e.jsxs("div",{className:"adv-filter-connector",children:[e.jsx("span",{className:"adv-filter-connector-line"}),e.jsx("button",{type:"button",className:`adv-filter-connector-badge ${L==="OR"?"adv-filter-connector-badge--or":""}`,onClick:()=>{F(g,{logic:L==="AND"?"OR":"AND"})},title:"Cliquez pour basculer entre ET/OU",children:L==="OR"?"OU":"ET"}),e.jsx("span",{className:"adv-filter-connector-line"})]}),e.jsx("div",{className:`adv-filter-pill ${B?"adv-filter-pill--editing":""}`,children:B?e.jsxs("div",{className:"adv-filter-edit",children:[e.jsxs("div",{className:"adv-filter-row",children:[e.jsx("label",{className:"adv-filter-label",children:"Champ"}),e.jsx("select",{value:p.fieldId,onChange:I=>{const oe=k.find(ae=>ae.id===I.target.value);if(oe){const ae=Fe(oe.type),fe=I.target.value.startsWith("classif:")?ae.find(y=>y.key==="equals")||ae[0]:ae.find(y=>y.key===p.operator)||ae[0];F(g,{fieldId:oe.id,fieldName:oe.name,fieldType:oe.type||"text",operator:fe.key,value:"",value2:""})}},className:"adv-filter-select",children:k.map(I=>e.jsx("option",{value:I.id,children:I.name},I.id))})]}),e.jsxs("div",{className:"adv-filter-row",children:[e.jsx("label",{className:"adv-filter-label",children:"Condition"}),e.jsx("select",{value:p.operator,onChange:I=>F(g,{operator:I.target.value,value:m(I.target.value)?"":p.value,value2:""}),className:"adv-filter-select",children:te.map(I=>e.jsx("option",{value:I.key,children:I.label},I.key))})]}),!m(p.operator)&&e.jsxs("div",{className:"adv-filter-row",children:[e.jsx("label",{className:"adv-filter-label",children:Y(p.operator)?"Valeur min":"Valeur"}),J&&D.length>0?e.jsxs("select",{value:p.value,onChange:I=>F(g,{value:I.target.value}),className:"adv-filter-select",children:[e.jsx("option",{value:"",children:"Sélectionnez..."}),D.map(I=>e.jsx("option",{value:I.label,children:I.label},I.id))]}):e.jsx("input",{type:He(p.fieldType),value:p.value,onChange:I=>F(g,{value:I.target.value}),placeholder:"Saisir une valeur...",className:"adv-filter-input",autoFocus:!0})]}),Y(p.operator)&&e.jsxs("div",{className:"adv-filter-row",children:[e.jsx("label",{className:"adv-filter-label",children:"Valeur max"}),e.jsx("input",{type:He(p.fieldType),value:p.value2||"",onChange:I=>F(g,{value2:I.target.value}),placeholder:"Saisir une valeur max...",className:"adv-filter-input"})]}),e.jsxs("div",{className:"adv-filter-row adv-filter-row--actions",children:[e.jsxs("button",{type:"button",className:"adv-filter-btn-done",onClick:()=>h(null),children:[e.jsx("svg",{viewBox:"0 0 24 24",fill:"none",className:"h-3.5 w-3.5",children:e.jsx("path",{d:"M5 13L9 17L19 7",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round"})}),"OK"]}),e.jsx("button",{type:"button",className:"adv-filter-btn-delete",onClick:()=>Q(g),children:e.jsxs("svg",{viewBox:"0 0 24 24",fill:"none",className:"h-3.5 w-3.5",children:[e.jsx("path",{d:"M20.5001 6H3.5",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"}),e.jsx("path",{d:"M18.8334 8.5L18.3735 15.3991C18.1965 18.054 18.108 19.3815 17.243 20.1907C16.378 21 15.0476 21 12.3868 21H11.6134C8.9526 21 7.6222 21 6.75719 20.1907C5.89218 19.3815 5.80368 18.054 5.62669 15.3991L5.16675 8.5",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"})]})})]})]}):e.jsxs("button",{type:"button",className:"adv-filter-pill-summary",onClick:()=>h(g),children:[e.jsx("span",{className:"adv-filter-pill-field",children:p.fieldName}),e.jsx("span",{className:"adv-filter-pill-op",children:((E=Qe[p.operator])==null?void 0:E.label)||p.operator}),!m(p.operator)&&e.jsx("span",{className:"adv-filter-pill-value",children:Y(p.operator)?`${p.value||"?"} – ${p.value2||"?"}`:J?X(p.fieldId,p.value):p.value||"..."}),e.jsx("button",{type:"button",className:"adv-filter-pill-remove",onClick:I=>{I.stopPropagation(),Q(g)},children:e.jsx("svg",{viewBox:"0 0 24 24",fill:"none",className:"h-3 w-3",children:e.jsx("path",{d:"M18 6L6 18M6 6L18 18",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round"})})})]})})]},g)}),e.jsxs("div",{className:"adv-filter-add-row",ref:f,children:[e.jsxs("button",{type:"button",className:"adv-filter-add-btn",onClick:()=>b(!c),children:[e.jsx("svg",{viewBox:"0 0 24 24",fill:"none",className:"h-3.5 w-3.5",children:e.jsx("path",{d:"M12 5V19M5 12H19",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round"})}),"Ajouter un filtre"]}),c&&e.jsxs("div",{className:"adv-filter-field-dropdown",children:[e.jsx("div",{className:"adv-filter-field-dropdown-title",children:"Choisir un champ"}),k.map(p=>e.jsxs("button",{type:"button",className:"adv-filter-field-option",onClick:()=>R(p.id),children:[e.jsx("span",{className:"adv-filter-field-type-badge",children:Xt(p.type)}),p.name]},p.id))]})]}),n.length>0&&e.jsx("button",{type:"button",className:"adv-filter-clear",onClick:_,children:"Effacer tous les filtres"})]}),e.jsx("style",{children:`
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
            `})]})}function Xt(r){return{text:"Aa",title:"T",email:"@",phone:"☎",url:"🔗",number:"#",currency:"$",percent:"%",date:"📅",datetime:"🕐",textarea:"¶",select:"☰",relation:"↗",classification:"●"}[r]||"Aa"}const Je=229,Ue=500,qe=280;function Qt({entityName:r,entityNamePlural:n,entityIcon:a,accountNumber:s,entitySlug:l,showSidebar:v,onToggleSidebar:d,filters:S=[],activeFilters:h={},onFilterChange:c,columns:b=[],fieldFilters:f=[],onFieldFiltersChange:M,allRecords:k=[],sidebarWidth:R,onSidebarWidthChange:F}){const[Q,_]=t.useState(!1),m=t.useRef(null),[Y,U]=t.useState(R||qe),H=t.useRef(!1),X=t.useRef(0),p=t.useRef(0),g=t.useRef(R||qe),te=t.useRef(F);t.useEffect(()=>{te.current=F},[F]),t.useEffect(()=>{g.current=Y},[Y]),t.useEffect(()=>{R&&!H.current&&U(R)},[R]);const B=t.useCallback(L=>{L.preventDefault(),H.current=!0,X.current=L.clientX,p.current=g.current,document.body.style.cursor="col-resize",document.body.style.userSelect="none"},[]);if(t.useEffect(()=>{const L=I=>{if(!H.current)return;const oe=I.clientX-X.current,ae=Math.min(Ue,Math.max(Je,p.current+oe));U(ae)},E=()=>{H.current&&(H.current=!1,document.body.style.cursor="",document.body.style.userSelect="",te.current&&te.current(g.current))};return document.addEventListener("mousemove",L),document.addEventListener("mouseup",E),()=>{document.removeEventListener("mousemove",L),document.removeEventListener("mouseup",E)}},[]),t.useEffect(()=>{const L=E=>{Q&&m.current&&!m.current.contains(E.target)&&_(!1)};return Q&&document.addEventListener("mousedown",L),()=>document.removeEventListener("mousedown",L)},[Q]),!v)return null;const J=(L,E)=>{const I={...h},oe=I[L]||[];if(E==="__all__")delete I[L];else{const ae=oe.indexOf(E);ae>-1?(oe.splice(ae,1),oe.length===0?delete I[L]:I[L]=[...oe]):I[L]=[...oe,E]}c(I)},D=Object.keys(h).length>0;return e.jsxs("div",{style:{position:"relative",width:Y,minWidth:Je,maxWidth:Ue,flexShrink:0},children:[e.jsxs("div",{className:"panel z-10 space-y-4 overflow-y-auto p-4 h-full",style:{display:"flex",flexDirection:"column",width:"100%"},children:[e.jsxs("div",{className:"flex items-center justify-between",children:[e.jsx("div",{className:"flex items-center",children:e.jsxs("div",{className:"flex items-center text-center",children:[e.jsx("div",{children:a?e.jsx("iconify-icon",{icon:a,width:"22",style:{color:"var(--primary)"}}):e.jsxs("svg",{width:"24",height:"24",viewBox:"0 0 24 24",fill:"none",xmlns:"http://www.w3.org/2000/svg",className:"h-5 w-5",children:[e.jsx("path",{d:"M20.3116 12.6473L20.8293 10.7154C21.4335 8.46034 21.7356 7.3328 21.5081 6.35703C21.3285 5.58657 20.9244 4.88668 20.347 4.34587C19.6157 3.66095 18.4881 3.35883 16.2331 2.75458C13.978 2.15033 12.8504 1.84821 11.8747 2.07573C11.1042 2.25537 10.4043 2.65945 9.86351 3.23687C9.27709 3.86298 8.97128 4.77957 8.51621 6.44561C8.43979 6.7254 8.35915 7.02633 8.27227 7.35057L8.27222 7.35077L7.75458 9.28263C7.15033 11.5377 6.84821 12.6652 7.07573 13.641C7.25537 14.4115 7.65945 15.1114 8.23687 15.6522C8.96815 16.3371 10.0957 16.6392 12.3508 17.2435L12.3508 17.2435C14.3834 17.7881 15.4999 18.0873 16.415 17.9744C16.5152 17.9621 16.6129 17.9448 16.7092 17.9223C17.4796 17.7427 18.1795 17.3386 18.7203 16.7612C19.4052 16.0299 19.7074 14.9024 20.3116 12.6473Z",stroke:"currentColor",strokeWidth:"1.5"}),e.jsx("path",{opacity:"0.5",d:"M16.415 17.9741C16.2065 18.6126 15.8399 19.1902 15.347 19.6519C14.6157 20.3368 13.4881 20.6389 11.2331 21.2432C8.97798 21.8474 7.85044 22.1495 6.87466 21.922C6.10421 21.7424 5.40432 21.3383 4.86351 20.7609C4.17859 20.0296 3.87647 18.9021 3.27222 16.647L2.75458 14.7151C2.15033 12.46 1.84821 11.3325 2.07573 10.3567C2.25537 9.58627 2.65945 8.88638 3.23687 8.34557C3.96815 7.66065 5.09569 7.35853 7.35077 6.75428C7.77741 6.63996 8.16368 6.53646 8.51621 6.44531",stroke:"currentColor",strokeWidth:"1.5"}),e.jsx("path",{d:"M11.7769 10L16.6065 11.2941",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"}),e.jsx("path",{opacity:"0.5",d:"M11 12.8975L13.8978 13.6739",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"})]})}),e.jsx("h3",{className:"text-lg font-semibold ltr:ml-3 rtl:mr-3",children:r})]})}),e.jsxs("div",{className:"dropdown relative",ref:m,children:[e.jsx("button",{type:"button",className:"flex h-8 w-8 items-center justify-center rounded-full bg-[#f4f4f4] hover:bg-primary-light dark:bg-[#1b2e4b]",onClick:()=>_(!Q),children:e.jsxs("svg",{width:"24",height:"24",viewBox:"0 0 24 24",fill:"none",xmlns:"http://www.w3.org/2000/svg",className:"h-5 w-5 opacity-70",children:[e.jsx("circle",{cx:"5",cy:"12",r:"2",stroke:"currentColor",strokeWidth:"1.5"}),e.jsx("circle",{opacity:"0.5",cx:"12",cy:"12",r:"2",stroke:"currentColor",strokeWidth:"1.5"}),e.jsx("circle",{cx:"19",cy:"12",r:"2",stroke:"currentColor",strokeWidth:"1.5"})]})}),Q&&e.jsxs("ul",{className:"whitespace-nowrap absolute right-0 top-full mt-1 z-50 min-w-[160px] rounded-md border border-gray-200 bg-white py-1 shadow-lg dark:border-[#1b2e4b] dark:bg-[#0e1726]",children:[e.jsx("li",{children:e.jsxs("a",{href:"javascript:;",onClick:()=>_(!1),className:"flex items-center px-4 py-2 text-sm hover:bg-gray-100 hover:text-primary dark:hover:bg-[#181F32] dark:hover:text-primary",children:[e.jsx("iconify-icon",{icon:"solar:settings-bold-duotone",className:"h-4.5 w-4.5 shrink-0 ltr:mr-1 rtl:ml-1",width:"18",style:{marginRight:"6px"}}),"Paramètres"]})}),e.jsx("li",{children:e.jsxs("a",{href:"javascript:;",onClick:()=>_(!1),className:"flex items-center px-4 py-2 text-sm hover:bg-gray-100 hover:text-primary dark:hover:bg-[#181F32] dark:hover:text-primary",children:[e.jsx("iconify-icon",{icon:"solar:question-circle-bold-duotone",className:"h-4.5 w-4.5 shrink-0 ltr:mr-1 rtl:ml-1",width:"18",style:{marginRight:"6px"}}),"Aide"]})})]})]})]}),e.jsx("div",{className:"h-px w-full border-b border-[#e0e6ed] dark:border-[#1b2e4b]"}),e.jsx("div",{className:"!mt-0",style:{flex:1,display:"flex",flexDirection:"column"},children:e.jsxs("div",{className:"flex h-full flex-col pb-16",style:{position:"relative"},children:[e.jsx("div",{className:"relative -mr-3.5 h-full grow pr-3.5 overflow-auto",children:e.jsxs("div",{className:"space-y-1",children:[e.jsx("button",{type:"button",className:`flex h-10 w-full items-center justify-between rounded-md p-2 font-medium hover:bg-white-dark/10 hover:text-primary dark:hover:bg-[#181F32] dark:hover:text-primary ${D?"":"bg-gray-100 dark:text-primary text-primary dark:bg-[#181F32]"}`,onClick:()=>c({}),children:e.jsxs("div",{className:"flex items-center",children:[e.jsx("iconify-icon",{icon:"solar:checklist-minimalistic-bold-duotone",width:"20"}),e.jsxs("div",{className:"ltr:ml-3 rtl:mr-3",children:["Toutes les ",n||r+"s"]})]})}),e.jsx("button",{type:"button",className:`flex h-10 w-full items-center justify-between rounded-md p-2 font-medium hover:bg-white-dark/10 hover:text-primary dark:hover:bg-[#181F32] dark:hover:text-primary ${h.__favourites?"bg-gray-100 dark:text-primary text-primary dark:bg-[#181F32]":""}`,onClick:()=>{const L={...h};L.__favourites?delete L.__favourites:L.__favourites=!0,c(L)},children:e.jsxs("div",{className:"flex items-center",children:[e.jsx("svg",{width:"24",height:"24",viewBox:"0 0 24 24",fill:"none",xmlns:"http://www.w3.org/2000/svg",className:"h-5 w-5",children:e.jsx("path",{d:"M9.15316 5.40838C10.4198 3.13613 11.0531 2 12 2C12.9469 2 13.5802 3.13612 14.8468 5.40837L15.1745 5.99623C15.5345 6.64193 15.7144 6.96479 15.9951 7.17781C16.2757 7.39083 16.6251 7.4699 17.3241 7.62805L17.9605 7.77203C20.4201 8.32856 21.65 8.60682 21.9426 9.54773C22.2352 10.4886 21.3968 11.4691 19.7199 13.4299L19.2861 13.9372C18.8096 14.4944 18.5713 14.773 18.4641 15.1177C18.357 15.4624 18.393 15.8341 18.465 16.5776L18.5306 17.2544C18.7841 19.8706 18.9109 21.1787 18.1449 21.7602C17.3788 22.3417 16.2273 21.8115 13.9243 20.7512L13.3285 20.4768C12.6741 20.1755 12.3469 20.0248 12 20.0248C11.6531 20.0248 11.3259 20.1755 10.6715 20.4768L10.0757 20.7512C7.77268 21.8115 6.62118 22.3417 5.85515 21.7602C5.08912 21.1787 5.21588 19.8706 5.4694 17.2544L5.53498 16.5776C5.60703 15.8341 5.64305 15.4624 5.53586 15.1177C5.42868 14.773 5.19043 14.4944 4.71392 13.9372L4.2801 13.4299C2.60325 11.4691 1.76482 10.4886 2.05742 9.54773C2.35002 8.60682 3.57986 8.32856 6.03954 7.77203L6.67589 7.62805C7.37485 7.4699 7.72433 7.39083 8.00494 7.17781C8.28555 6.96479 8.46553 6.64194 8.82547 5.99623L9.15316 5.40838Z",stroke:"currentColor",strokeWidth:"1.5"})}),e.jsx("div",{className:"ltr:ml-3 rtl:mr-3",children:"Favourites"})]})}),S.map(L=>e.jsxs("div",{children:[e.jsx("div",{className:"h-px w-full border-b border-[#e0e6ed] dark:border-[#1b2e4b] my-2"}),e.jsx("div",{className:"px-1 py-2 text-white-dark text-xs uppercase font-semibold tracking-wider",children:L.name}),L.type==="tags"?e.jsx("div",{className:"flex flex-wrap gap-1.5 px-1",children:L.options.map(E=>{const I=(h[L.id]||[]).includes(E.id);return e.jsxs("button",{type:"button",className:"mb-0 py-0.5 px-2.5 text-xs rounded-full cursor-pointer transition-all font-medium",style:{border:`1.5px solid ${E.color||"#9ca3af"}`,color:I?"#fff":E.color||"#9ca3af",backgroundColor:I?E.color||"#9ca3af":"transparent"},onClick:()=>J(L.id,E.id),children:[E.label,E.count!==void 0&&e.jsx("span",{style:{opacity:.7,marginLeft:"2px"},children:E.count})]},E.id)})}):e.jsx("div",{className:"space-y-0.5",children:L.options.map(E=>{const I=(h[L.id]||[]).includes(E.id);return e.jsxs("button",{type:"button",className:`flex h-9 w-full items-center rounded-md px-2 py-1.5 text-sm font-medium transition-colors hover:bg-white-dark/10 hover:text-primary dark:hover:bg-[#181F32] dark:hover:text-primary ${I?"bg-gray-100 text-primary dark:bg-[#181F32] dark:text-primary":""}`,onClick:()=>J(L.id,E.id),children:[e.jsx("span",{className:"inline-block w-3 h-3 rounded-full mr-2.5 flex-shrink-0",style:{backgroundColor:E.color||"#9ca3af"}}),e.jsx("span",{className:"truncate",children:E.label}),E.count!==void 0&&e.jsx("span",{className:"ml-auto text-xs opacity-60",children:E.count})]},E.id)})})]},L.id)),e.jsx(Kt,{columns:b,fieldFilters:f,onFieldFiltersChange:M,allRecords:k,sidebarFilters:S})]})}),e.jsx("div",{className:"absolute bottom-0 w-full p-4 left-0",children:e.jsxs("a",{href:`/account/${s}/record/${l}/add`,className:"btn btn-primary w-full",children:[e.jsxs("svg",{xmlns:"http://www.w3.org/2000/svg",width:"24px",height:"24px",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round",className:"h-5 w-5 ltr:mr-2 rtl:ml-2",children:[e.jsx("line",{x1:"12",y1:"5",x2:"12",y2:"19"}),e.jsx("line",{x1:"5",y1:"12",x2:"19",y2:"12"})]}),"Ajouter"]})})]})})]}),e.jsx("div",{onMouseDown:B,style:{position:"absolute",top:0,right:-3,width:6,height:"100%",cursor:"col-resize",zIndex:20,display:"flex",alignItems:"center",justifyContent:"center"},onMouseEnter:L=>{L.currentTarget.querySelector(".resize-bar").style.opacity="1"},onMouseLeave:L=>{H.current||(L.currentTarget.querySelector(".resize-bar").style.opacity="0")},children:e.jsx("div",{className:"resize-bar",style:{width:3,height:"100%",borderRadius:2,background:"var(--primary, #4361ee)",opacity:0,transition:"opacity 0.2s ease"}})})]})}const Gt=["#4361ee","#805dca","#e2a03f","#00ab55","#e7515a","#2196d4","#3b3f5c","#009688","#ff5722","#607d8b"],er={contains:{label:"Contient",icon:"⊃",types:["text","email","phone","url","textarea","title","relation"]},not_contains:{label:"Ne contient pas",icon:"⊅",types:["text","email","phone","url","textarea","title","relation"]},equals:{label:"Est égal à",icon:"=",types:["text","email","phone","url","number","date","title","select","relation","classification"]},not_equals:{label:"N'est pas égal à",icon:"≠",types:["text","email","phone","url","number","date","title","select","relation","classification"]},starts_with:{label:"Commence par",icon:"A…",types:["text","email","phone","url","title"]},ends_with:{label:"Se termine par",icon:"…Z",types:["text","email","phone","url","title"]},gt:{label:"Supérieur à",icon:">",types:["number","date"]},gte:{label:"Supérieur ou égal",icon:"≥",types:["number","date"]},lt:{label:"Inférieur à",icon:"<",types:["number","date"]},lte:{label:"Inférieur ou égal",icon:"≤",types:["number","date"]},between:{label:"Entre",icon:"↔",types:["number","date"]},is_empty:{label:"Est vide",icon:"∅",types:["text","email","phone","url","number","date","textarea","title","select","relation","classification"]},is_not_empty:{label:"N'est pas vide",icon:"∃",types:["text","email","phone","url","number","date","textarea","title","select","relation","classification"]}};function Oe(r){const n=r||"text";return Object.entries(er).filter(([a,s])=>s.types.includes(n)).map(([a,s])=>({key:a,...s}))}function Ye(r){return["number","currency","percent"].includes(r)?"number":["date","datetime"].includes(r)?"date":"text"}function tr({savedViews:r=[],activeViewId:n,onSelectView:a,onCreateView:s,onDeleteView:l,onRenameView:v,onUpdateViewFilters:d,hasActiveFilters:S=!1,activeFilters:h={},fieldFilters:c=[],sidebarFilters:b=[],columns:f=[],externalOpenCreate:M=!1,onCloseExternalCreate:k}){const[R,F]=t.useState(!1),[Q,_]=t.useState(!1),[m,Y]=t.useState(""),[U,H]=t.useState("#4361ee"),[X,p]=t.useState(null),[g,te]=t.useState(null),[B,J]=t.useState(""),[D,L]=t.useState(null),[E,I]=t.useState([]),[oe,ae]=t.useState({}),[ue,fe]=t.useState(!1),y=t.useRef(null),O=t.useRef(null),Z=t.useRef(null),W=t.useRef(null);t.useEffect(()=>{const u=T=>{X&&O.current&&!O.current.contains(T.target)&&p(null)};return X&&document.addEventListener("mousedown",u),()=>document.removeEventListener("mousedown",u)},[X]),t.useEffect(()=>{R&&Z.current&&setTimeout(()=>{var u;return(u=Z.current)==null?void 0:u.focus()},100)},[R]),t.useEffect(()=>{M&&(F(!0),I([...c]),k==null||k())},[M]),t.useEffect(()=>{R&&!D&&(I([...c]),ae(JSON.parse(JSON.stringify(h||{}))))},[R]),t.useEffect(()=>{const u=T=>{ue&&y.current&&!y.current.contains(T.target)&&fe(!1)};return ue&&document.addEventListener("mousedown",u),()=>document.removeEventListener("mousedown",u)},[ue]),t.useEffect(()=>{g&&W.current&&(W.current.focus(),W.current.select())},[g]);const q=(u,T)=>{u.preventDefault(),p({viewId:T,x:u.clientX,y:u.clientY})},P=()=>{m.trim()&&(s({name:m.trim(),color:U,filters:oe,fieldFilters:E}),Y(""),H("#4361ee"),I([]),ae({}),F(!1))},K=t.useMemo(()=>f.filter(u=>u.id!=="actions"),[f]),ne=t.useMemo(()=>{const u={};return b.forEach(T=>{u[`classif:${T.id}`]=T.options||[]}),u},[b]),x=t.useCallback(u=>{const T=K.find(he=>he.id===u);if(!T)return;const G=u.startsWith("classif:"),pe=Oe(T.type),ke=G?pe.find(he=>he.key==="equals")||pe[0]:pe.find(he=>he.key==="contains")||pe[0],we={fieldId:u,fieldName:T.name,fieldType:T.type||"text",operator:ke.key,value:"",value2:"",logic:"AND"};I(he=>[...he,we]),fe(!1)},[K]),o=t.useCallback((u,T)=>{I(G=>G.map((pe,ke)=>ke===u?{...pe,...T}:pe))},[]),j=t.useCallback(u=>{I(T=>T.filter((G,pe)=>pe!==u))},[]),V=u=>{const T=r.find(G=>G._id===u);T&&(te(u),J(T.name)),p(null)},w=()=>{g&&B.trim()&&v(g,B.trim()),te(null),J("")},se=u=>{l(u),p(null)},z=u=>{const T=r.find(G=>G._id===u);T&&(L(u),Y(T.name||""),H(T.color||"#4361ee"),I(T.fieldFilters?JSON.parse(JSON.stringify(T.fieldFilters)):[]),ae(T.filters?JSON.parse(JSON.stringify(T.filters)):{}),F(!0),p(null))},le=()=>{!m.trim()||!D||(d(D,oe,E,m.trim(),U),Y(""),H("#4361ee"),I([]),ae({}),L(null),F(!1))},xe=u=>{var G;let T=0;return u.filters&&(T+=Object.keys(u.filters).filter(pe=>pe!=="__favourites").length),(G=u.fieldFilters)!=null&&G.length&&(T+=u.fieldFilters.length),T};return e.jsxs(e.Fragment,{children:[e.jsxs("div",{className:"saved-views-tabs",children:[e.jsxs("button",{type:"button",className:`saved-view-tab ${n?"":"saved-view-tab--active"}`,onClick:()=>a(null),children:[e.jsxs("svg",{className:"saved-view-tab-icon",viewBox:"0 0 24 24",fill:"none",children:[e.jsx("path",{d:"M2 12C2 7.28595 2 4.92893 3.46447 3.46447C4.92893 2 7.28595 2 12 2C16.714 2 19.0711 2 20.5355 3.46447C22 4.92893 22 7.28595 22 12C22 16.714 22 19.0711 20.5355 20.5355C19.0711 22 16.714 22 12 22C7.28595 22 4.92893 22 3.46447 20.5355C2 19.0711 2 16.714 2 12Z",stroke:"currentColor",strokeWidth:"1.5"}),e.jsx("path",{d:"M6 12H18",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"}),e.jsx("path",{d:"M6 8H18",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"}),e.jsx("path",{d:"M6 16H18",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"})]}),"Tout"]}),r.map(u=>e.jsx("button",{type:"button",className:`saved-view-tab ${n===u._id?"saved-view-tab--active":""}`,style:{"--tab-color":u.color||"#4361ee"},onClick:()=>a(u._id),onContextMenu:T=>q(T,u._id),children:g===u._id?e.jsx("input",{ref:W,type:"text",value:B,onChange:T=>J(T.target.value),onBlur:w,onKeyDown:T=>{T.key==="Enter"&&w(),T.key==="Escape"&&(te(null),J(""))},className:"saved-view-tab-edit-input",onClick:T=>T.stopPropagation()}):e.jsxs(e.Fragment,{children:[e.jsx("span",{className:"saved-view-tab-dot",style:{backgroundColor:u.color||"#4361ee"}}),e.jsx("span",{className:"saved-view-tab-name",children:u.name}),xe(u)>0&&e.jsx("span",{className:"saved-view-tab-badge",children:xe(u)})]})},u._id)),e.jsx("button",{type:"button",className:"saved-view-tab saved-view-tab--add",onClick:()=>{L(null),Y(""),H("#4361ee"),F(!0)},title:"Enregistrer une vue",children:e.jsx("svg",{viewBox:"0 0 24 24",fill:"none",className:"h-3.5 w-3.5",children:e.jsx("path",{d:"M12 5V19M5 12H19",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round"})})})]}),X&&e.jsxs("div",{ref:O,className:"saved-view-context-menu",style:{position:"fixed",top:X.y,left:X.x,zIndex:10001},children:[e.jsxs("button",{className:"saved-view-context-item",onClick:()=>V(X.viewId),children:[e.jsx("svg",{viewBox:"0 0 24 24",fill:"none",className:"h-4 w-4",children:e.jsx("path",{d:"M13.9027 6.37027L17.6297 10.0973M4 20.0001H8L18.5 9.50006C18.9978 9.00236 19.2786 8.32622 19.2786 7.62142C19.2786 6.91661 18.9978 6.24047 18.5 5.74277C18.0023 5.24508 17.3261 4.96426 16.6213 4.96426C15.9165 4.96426 15.2404 5.24508 14.7427 5.74277L4 16.0001V20.0001Z",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round"})}),"Renommer"]}),e.jsxs("button",{className:"saved-view-context-item",onClick:()=>z(X.viewId),children:[e.jsxs("svg",{viewBox:"0 0 24 24",fill:"none",className:"h-4 w-4",children:[e.jsx("path",{d:"M4.06189 13C4.02104 12.6724 4 12.3387 4 12C4 7.58172 7.58172 4 12 4C14.5006 4 16.7332 5.14727 18.2002 6.94416M19.9381 11C19.979 11.3276 20 11.6613 20 12C20 16.4183 16.4183 20 12 20C9.49944 20 7.26681 18.8527 5.79984 17.0558",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round"}),e.jsx("path",{d:"M15 7H19V3",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round"}),e.jsx("path",{d:"M9 17H5V21",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round"})]}),"Modifier la vue"]}),e.jsx("div",{className:"saved-view-context-separator"}),e.jsxs("button",{className:"saved-view-context-item saved-view-context-item--danger",onClick:()=>se(X.viewId),children:[e.jsxs("svg",{viewBox:"0 0 24 24",fill:"none",className:"h-4 w-4",children:[e.jsx("path",{d:"M20.5001 6H3.5",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"}),e.jsx("path",{d:"M18.8334 8.5L18.3735 15.3991C18.1965 18.054 18.108 19.3815 17.243 20.1907C16.378 21 15.0476 21 12.3868 21H11.6134C8.9526 21 7.6222 21 6.75719 20.1907C5.89218 19.3815 5.80368 18.054 5.62669 15.3991L5.16675 8.5",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"}),e.jsx("path",{d:"M9.5 11L10 16",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"}),e.jsx("path",{d:"M14.5 11L14 16",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"}),e.jsx("path",{d:"M6.5 6C6.55588 6 6.58382 6 6.60915 5.99936C7.43259 5.97849 8.15902 5.45491 8.43922 4.68032C8.44784 4.65649 8.45667 4.62999 8.47434 4.57697L8.57143 4.28571C8.65431 4.03708 8.69575 3.91276 8.75071 3.8072C8.97001 3.38607 9.37574 3.09364 9.84461 3.01877C9.96213 3 10.0932 3 10.3553 3H13.6447C13.9068 3 14.0379 3 14.1554 3.01877C14.6243 3.09364 15.03 3.38607 15.2493 3.8072C15.3043 3.91276 15.3457 4.03708 15.4286 4.28571L15.5257 4.57697C15.5433 4.62992 15.5522 4.65651 15.5608 4.68032C15.841 5.45491 16.5674 5.97849 17.3909 5.99936C17.4162 6 17.4441 6 17.5 6",stroke:"currentColor",strokeWidth:"1.5"})]}),"Supprimer"]})]}),R&&e.jsx("div",{className:"saved-view-modal-overlay",onClick:()=>F(!1),children:e.jsxs("div",{className:"saved-view-modal",onClick:u=>u.stopPropagation(),children:[e.jsxs("div",{className:"saved-view-modal-header",children:[e.jsx("h3",{children:D?"Modifier la vue":"Enregistrer la vue"}),e.jsx("button",{type:"button",className:"saved-view-modal-close",onClick:()=>{F(!1),L(null)},children:e.jsx("svg",{viewBox:"0 0 24 24",fill:"none",className:"h-5 w-5",children:e.jsx("path",{d:"M18 6L6 18M6 6L18 18",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"})})})]}),e.jsxs("div",{className:"saved-view-modal-body",children:[e.jsxs("div",{className:"saved-view-form-group",children:[e.jsx("label",{className:"saved-view-form-label",children:"Nom de la vue"}),e.jsx("input",{ref:Z,type:"text",value:m,onChange:u=>Y(u.target.value),onKeyDown:u=>{u.key==="Enter"&&P()},placeholder:"Ex: Hôtels, Clients VIP...",className:"saved-view-form-input"})]}),e.jsxs("div",{className:"saved-view-form-group",children:[e.jsx("label",{className:"saved-view-form-label",children:"Couleur"}),e.jsx("div",{className:"saved-view-color-grid",children:Gt.map(u=>e.jsx("button",{type:"button",className:`saved-view-color-swatch ${U===u?"saved-view-color-swatch--active":""}`,style:{backgroundColor:u},onClick:()=>H(u),children:U===u&&e.jsx("svg",{viewBox:"0 0 24 24",fill:"none",className:"h-3 w-3",children:e.jsx("path",{d:"M5 13L9 17L19 7",stroke:"white",strokeWidth:"2.5",strokeLinecap:"round",strokeLinejoin:"round"})})},u))})]}),b.length>0&&e.jsxs("div",{className:"saved-view-form-group",children:[e.jsx("label",{className:"saved-view-form-label",children:"Filtres de classification"}),e.jsx("div",{className:"svm-classif-editor",children:b.map(u=>{const T=oe[u.id]||[];return e.jsxs("div",{className:"svm-classif-group",children:[e.jsx("span",{className:"svm-classif-group-label",children:u.name}),e.jsx("div",{className:"svm-classif-options",children:(u.options||[]).map(G=>{const pe=T.includes(G.id);return e.jsxs("button",{type:"button",className:`svm-classif-pill ${pe?"svm-classif-pill--active":""}`,style:{"--pill-color":G.color||"#9ca3af"},onClick:()=>{ae(ke=>{const we=ke[u.id]||[];let he;pe?he=we.filter(je=>je!==G.id):he=[...we,G.id];const ye={...ke};return he.length>0?ye[u.id]=he:delete ye[u.id],ye})},children:[pe&&e.jsx("svg",{viewBox:"0 0 24 24",fill:"none",className:"svm-classif-check",children:e.jsx("path",{d:"M5 13L9 17L19 7",stroke:"currentColor",strokeWidth:"2.5",strokeLinecap:"round",strokeLinejoin:"round"})}),G.label]},G.id)})})]},u.id)})})]}),e.jsxs("div",{className:"saved-view-form-group",children:[e.jsx("label",{className:"saved-view-form-label",children:"Filtres avancés"}),e.jsxs("div",{className:"svm-filter-builder",children:[E.map((u,T)=>{var je;const G=(je=u.fieldId)==null?void 0:je.startsWith("classif:"),pe=G?ne[u.fieldId]||[]:[],ke=Oe(u.fieldType),we=["is_empty","is_not_empty"].includes(u.operator),he=u.operator==="between",ye=u.logic||"AND";return e.jsxs($e.Fragment,{children:[T>0&&e.jsxs("div",{className:"svm-filter-connector",children:[e.jsx("span",{className:"svm-filter-connector-line"}),e.jsx("button",{type:"button",className:`svm-filter-connector-badge ${ye==="OR"?"svm-filter-connector-badge--or":""}`,onClick:()=>o(T,{logic:ye==="AND"?"OR":"AND"}),title:"Cliquez pour basculer ET/OU",children:ye==="OR"?"OU":"ET"}),e.jsx("span",{className:"svm-filter-connector-line"})]}),e.jsxs("div",{className:"svm-filter-row",children:[e.jsx("select",{value:u.fieldId,onChange:ce=>{const Ce=K.find(Me=>Me.id===ce.target.value);if(Ce){const Me=ce.target.value.startsWith("classif:"),Ne=Oe(Ce.type),Se=Me?Ne.find(be=>be.key==="equals")||Ne[0]:Ne.find(be=>be.key===u.operator)||Ne[0];o(T,{fieldId:Ce.id,fieldName:Ce.name,fieldType:Ce.type||"text",operator:Se.key,value:"",value2:""})}},className:"svm-filter-select svm-filter-select--field",children:K.map(ce=>e.jsx("option",{value:ce.id,children:ce.name},ce.id))}),e.jsx("select",{value:u.operator,onChange:ce=>o(T,{operator:ce.target.value,value:["is_empty","is_not_empty"].includes(ce.target.value)?"":u.value,value2:""}),className:"svm-filter-select svm-filter-select--op",children:ke.map(ce=>e.jsx("option",{value:ce.key,children:ce.label},ce.key))}),!we&&(G&&pe.length>0?e.jsxs("select",{value:u.value,onChange:ce=>o(T,{value:ce.target.value}),className:"svm-filter-select svm-filter-select--val",children:[e.jsx("option",{value:"",children:"Sélectionnez..."}),pe.map(ce=>e.jsx("option",{value:ce.label,children:ce.label},ce.id))]}):e.jsx("input",{type:Ye(u.fieldType),value:u.value,onChange:ce=>o(T,{value:ce.target.value}),placeholder:"Valeur...",className:"svm-filter-input"})),he&&e.jsx("input",{type:Ye(u.fieldType),value:u.value2||"",onChange:ce=>o(T,{value2:ce.target.value}),placeholder:"Max...",className:"svm-filter-input"}),e.jsx("button",{type:"button",className:"svm-filter-remove",onClick:()=>j(T),title:"Supprimer ce filtre",children:e.jsx("svg",{viewBox:"0 0 24 24",fill:"none",className:"h-3.5 w-3.5",children:e.jsx("path",{d:"M18 6L6 18M6 6L18 18",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round"})})})]})]},T)}),e.jsxs("div",{className:"svm-filter-add-row",ref:y,children:[e.jsxs("button",{type:"button",className:"svm-filter-add-btn",onClick:()=>fe(!ue),children:[e.jsx("svg",{viewBox:"0 0 24 24",fill:"none",className:"h-3.5 w-3.5",children:e.jsx("path",{d:"M12 5V19M5 12H19",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round"})}),"Ajouter un filtre"]}),ue&&e.jsxs("div",{className:"svm-filter-field-dropdown",children:[e.jsx("div",{className:"svm-filter-field-dropdown-title",children:"Choisir un champ"}),K.map(u=>e.jsx("button",{type:"button",className:"svm-filter-field-option",onClick:()=>x(u.id),children:u.name},u.id))]})]})]})]})]}),e.jsxs("div",{className:"saved-view-modal-footer",children:[e.jsx("button",{type:"button",className:"saved-view-btn saved-view-btn--cancel",onClick:()=>{F(!1),L(null)},children:"Annuler"}),e.jsxs("button",{type:"button",className:"saved-view-btn saved-view-btn--save",onClick:D?le:P,disabled:!m.trim(),children:[e.jsx("svg",{viewBox:"0 0 24 24",fill:"none",className:"h-4 w-4",children:e.jsx("path",{d:"M5 13L9 17L19 7",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round"})}),D?"Mettre à jour":"Enregistrer"]})]})]})}),e.jsx("style",{children:`
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
            `})]})}function rr(r,n){var s,l,v;if(n==="title")return r.referenceTitle||r.computedTitle||r.title||"";if(n==="createdAt")return r.createdAt||"";if(n==="updatedAt")return r.updatedAt||"";if(n.startsWith("rel:")){const d=n.replace("rel:",""),h=(((s=r._denorm)==null?void 0:s.relations)||[]).find(f=>f.relationKey===d);if(((l=h==null?void 0:h.records)==null?void 0:l.length)>0)return h.records.map(f=>f.title||f.computedTitle||"").join(", ");const c=(r.relations||[]).find(f=>f.key===d||f.relationKey===d);if(c)return c.title||c.computedTitle||c.value||"";const b=(v=r._denorm)==null?void 0:v[d];return b&&(b.title||b.computedTitle)||""}if(n.startsWith("classif:")){const d=n.replace("classif:","");return(r.classificationValues||[]).filter(c=>{var b;return((b=c.classificationId)==null?void 0:b.toString())===d}).map(c=>c.label||c.optionLabel||"").join(", ")}const a=(r.customFields||[]).find(d=>{var S,h,c;return((h=(S=d.field_id)==null?void 0:S._id)==null?void 0:h.toString())===n||((c=d.field_id)==null?void 0:c.toString())===n});return(a==null?void 0:a.value)??""}function sr(r,n){const{operator:a,value:s,value2:l,fieldType:v}=n,d=["number","currency","percent"].includes(v),S=["date","datetime"].includes(v),h=String(r??"").trim(),c=h.toLowerCase(),b=String(s??"").trim().toLowerCase();switch(a){case"contains":return c.includes(b);case"not_contains":return!c.includes(b);case"equals":return d?parseFloat(h)===parseFloat(s):c===b;case"not_equals":return d?parseFloat(h)!==parseFloat(s):c!==b;case"starts_with":return c.startsWith(b);case"ends_with":return c.endsWith(b);case"gt":return S?new Date(r)>new Date(s):parseFloat(h)>parseFloat(s);case"gte":return S?new Date(r)>=new Date(s):parseFloat(h)>=parseFloat(s);case"lt":return S?new Date(r)<new Date(s):parseFloat(h)<parseFloat(s);case"lte":return S?new Date(r)<=new Date(s):parseFloat(h)<=parseFloat(s);case"between":{if(S){const M=new Date(r);return M>=new Date(s)&&M<=new Date(l)}const f=parseFloat(h);return f>=parseFloat(s)&&f<=parseFloat(l)}case"is_empty":return h===""||r==null;case"is_not_empty":return h!==""&&r!=null;default:return!0}}function ar({accountId:r,accountNumber:n,entityId:a,viewId:s,entityName:l,entityNamePlural:v,entitySlug:d}){const[S,h]=t.useState([]),[c,b]=t.useState([]),[f,M]=t.useState([]),[k,R]=t.useState([]),[F,Q]=t.useState(!0),[_,m]=t.useState(null),[Y,U]=t.useState(""),[H,X]=t.useState("table"),[p,g]=t.useState(""),[te,B]=t.useState(null),[J,D]=t.useState(new Set),[L,E]=t.useState(!1),I=t.useRef(null),[oe,ae]=t.useState([]),[ue,fe]=t.useState({}),[y,O]=t.useState([]),[Z,W]=t.useState([]),[q,P]=t.useState(null),[K,ne]=t.useState(!1),[x,o]=t.useState(null),j=t.useRef(null),V=t.useCallback((i,C="success")=>{j.current&&clearTimeout(j.current),o({message:i,type:C}),j.current=setTimeout(()=>o(null),2500)},[]),[w,se]=t.useState({columns:[],sort:{field:"createdAt",direction:"desc"},density:"normal",pageSize:10,titleDisplay:"avatar",showSidebar:!0,sidebarWidth:280,viewMode:null,enabledViews:["table","kanban","notes","calendar"]}),[z,le]=t.useState({page:1,limit:10,total:0,pages:0}),xe=t.useRef(null),u=t.useCallback(async()=>{var i,C;try{Q(!0),m(null);const $=new URLSearchParams({limit:1e4,sort:`${w.sort.field}:${w.sort.direction}`}),A=await fetch(`/account/${n}/api/entity/${a}/views/${s}/records?${$}`,{credentials:"include"});if(!A.ok)throw new Error(`HTTP ${A.status}`);const N=await A.json();if(h(N.records||[]),b(N.records||[]),N.entity&&(B(N.entity),N.entity.icon&&g(N.entity.icon)),N.filters&&ae(N.filters),N.preferences)if(se(re=>{var ee,ie;return{...re,...N.preferences,columns:(ee=N.preferences.columns)!=null&&ee.length?N.preferences.columns:((ie=N.columns)==null?void 0:ie.map(de=>({id:de.id,visible:!0})))||[]}}),N.preferences.pageSize&&le(re=>({...re,limit:N.preferences.pageSize})),N.preferences.viewMode&&X(N.preferences.viewMode),(i=N.preferences.columns)!=null&&i.length&&((C=N.columns)!=null&&C.length)){const re=[];N.preferences.columns.forEach(ee=>{const ie=N.columns.find(de=>de.id===ee.id);ie&&re.push(ie)}),N.columns.forEach(ee=>{re.find(ie=>ie.id===ee.id)||re.push(ee)}),R(re)}else R(N.columns||[]);else N.columns&&(R(N.columns||[]),se(re=>({...re,columns:N.columns.map(ee=>({id:ee.id,visible:!0}))})))}catch($){console.error("[RecordsGrid] Fetch error:",$),m($.message)}finally{Q(!1)}},[n,a,s,w.sort]),T=t.useCallback(async()=>{try{const i=await fetch(`/account/${n}/api/entity/${a}/saved-views`,{credentials:"include"});if(i.ok){const C=await i.json();W(C.views||[])}}catch(i){console.error("[RecordsGrid] Fetch saved views error:",i)}},[n,a]),G=t.useCallback(async({name:i,color:C,filters:$,fieldFilters:A})=>{try{const N=await fetch(`/account/${n}/api/entity/${a}/saved-views`,{method:"POST",headers:{"Content-Type":"application/json"},credentials:"include",body:JSON.stringify({name:i,color:C,filters:$,fieldFilters:A})});if(N.ok){const re=await N.json();W(ee=>[...ee,re.view]),P(re.view._id)}}catch(N){console.error("[RecordsGrid] Create saved view error:",N)}},[n,a]),pe=t.useCallback(async i=>{try{(await fetch(`/account/${n}/api/entity/${a}/saved-views/${i}`,{method:"DELETE",credentials:"include"})).ok&&(W($=>$.filter(A=>A._id!==i)),q===i&&(P(null),fe({}),le($=>({...$,page:1}))))}catch(C){console.error("[RecordsGrid] Delete saved view error:",C)}},[n,a,q]),ke=t.useCallback(async(i,C)=>{try{(await fetch(`/account/${n}/api/entity/${a}/saved-views/${i}`,{method:"PUT",headers:{"Content-Type":"application/json"},credentials:"include",body:JSON.stringify({name:C})})).ok&&W(A=>A.map(N=>N._id===i?{...N,name:C}:N))}catch($){console.error("[RecordsGrid] Rename saved view error:",$)}},[n,a]),we=t.useCallback(async(i,C,$,A,N)=>{var re;try{const ee={filters:C,fieldFilters:$||[]};if(A&&(ee.name=A),N&&(ee.color=N),(await fetch(`/account/${n}/api/entity/${a}/saved-views/${i}`,{method:"PUT",headers:{"Content-Type":"application/json"},credentials:"include",body:JSON.stringify(ee)})).ok){const de=JSON.parse(JSON.stringify(C||{})),me=JSON.parse(JSON.stringify($||[]));W(ve=>ve.map(Le=>{if(Le._id!==i)return Le;const Ee={...Le,filters:de,fieldFilters:me};return A&&(Ee.name=A),N&&(Ee.color=N),Ee}));const ge=A||((re=Z.find(ve=>ve._id===i))==null?void 0:re.name)||"Vue";V(`Vue "${ge}" mise à jour`)}else V("Erreur lors de la mise à jour","error")}catch(ee){console.error("[RecordsGrid] Update saved view error:",ee),V("Erreur lors de la mise à jour","error")}},[n,a,Z,V]),he=t.useCallback(i=>{if(!i){P(null),fe({}),O([]),le($=>({...$,page:1}));return}const C=Z.find($=>$._id===i);C&&(P(i),fe(JSON.parse(JSON.stringify(C.filters||{}))),O(JSON.parse(JSON.stringify(C.fieldFilters||[]))),le($=>({...$,page:1})))},[Z]);t.useEffect(()=>{u(),T()},[]);const ye=t.useMemo(()=>{if(!S.length)return[];const{field:i,direction:C}=w.sort,$=C==="asc"?1:-1;return[...S].sort((A,N)=>{let re,ee;if(i==="title")re=(A.referenceTitle||A.title||"").toLowerCase(),ee=(N.referenceTitle||N.title||"").toLowerCase();else if(i==="createdAt"||i==="updatedAt")re=new Date(A[i]||0).getTime(),ee=new Date(N[i]||0).getTime();else{const ie=(A.customFields||[]).find(me=>{var ve;const ge=((ve=me.field_id)==null?void 0:ve._id)||me.field_id;return(ge==null?void 0:ge.toString())===i}),de=(N.customFields||[]).find(me=>{var ve;const ge=((ve=me.field_id)==null?void 0:ve._id)||me.field_id;return(ge==null?void 0:ge.toString())===i});re=((ie==null?void 0:ie.value)||"").toString().toLowerCase(),ee=((de==null?void 0:de.value)||"").toString().toLowerCase()}return re<ee?-1*$:re>ee?1*$:0})},[S,w.sort.field,w.sort.direction]),je=t.useMemo(()=>ye.map(i=>({...i,_searchIndex:[i.title||"",i.referenceTitle||"",i.computedTitle||"",...(i.customFields||[]).map(C=>C.value||"")].join(" ").toLowerCase()})),[ye]),ce=t.useCallback((i,C,$,A)=>{let N=i;if(C&&C.trim()){const ee=C.toLowerCase();N=N.filter(ie=>ie._searchIndex.includes(ee))}const re=Object.keys($).filter(ee=>ee!=="__favourites");return re.length>0&&(N=N.filter(ee=>{const ie=ee.classificationValues||[];return re.every(de=>{const me=$[de];return!me||me.length===0?!0:ie.some(ge=>{var ve,Le;return((ve=ge.classificationId)==null?void 0:ve.toString())===de&&me.includes((Le=ge.optionId)==null?void 0:Le.toString())})})})),A&&A.length>0&&(N=N.filter(ee=>{const ie=[[A[0]]];for(let de=1;de<A.length;de++)(A[de].logic||"AND")==="OR"?ie.push([A[de]]):ie[ie.length-1].push(A[de]);return ie.some(de=>de.every(me=>{const ge=rr(ee,me.fieldId);return sr(ge,me)}))})),N},[]),Ce=t.useCallback(i=>{var $;const C=typeof i=="string"?i:(($=i==null?void 0:i.target)==null?void 0:$.value)||"";U(C),le(A=>({...A,page:1}))},[]),Me=t.useCallback(i=>{fe(i),le(C=>({...C,page:1}))},[]),Ne=t.useCallback(i=>{O(i),le(C=>({...C,page:1}))},[]);t.useEffect(()=>{const i=ce(je,Y,ue,y);b(i)},[je,Y,ue,y,ce]),t.useEffect(()=>{const i=(z.page-1)*z.limit,C=i+z.limit,$=c.slice(i,C);M($),le(A=>({...A,total:c.length,pages:Math.ceil(c.length/z.limit)}))},[c,z.page,z.limit]);const Se=t.useCallback(async i=>{try{await fetch(`/account/${n}/api/user/view-preferences`,{method:"POST",headers:{"Content-Type":"application/json"},credentials:"include",body:JSON.stringify({viewId:s,preferences:i})})}catch(C){console.error("[RecordsGrid] Save preferences error:",C)}},[n,s]),be=t.useCallback((i,C)=>{const $={...w,[i]:C};se($),Se($),i==="pageSize"&&le(A=>({...A,limit:C,page:1}))},[w,Se]),Ge=t.useCallback(i=>{X(i),se(C=>{const $={...C,viewMode:i};return Se($),$})},[Se]),Re=t.useCallback(i=>{le(C=>({...C,page:i}))},[]),et=t.useCallback((i,C,$)=>{if($&&I.current!==null&&I.current!==C){const A=Math.min(I.current,C),N=Math.max(I.current,C);D(re=>{const ee=new Set(re);for(let ie=A;ie<=N;ie++)f[ie]&&ee.add(f[ie]._id);return ee})}else D(A=>{const N=new Set(A);return N.has(i)?N.delete(i):N.add(i),N});I.current=C},[f]),tt=t.useCallback(()=>{D(i=>{const C=f.map(N=>N._id),$=C.every(N=>i.has(N)),A=new Set(i);return $?C.forEach(N=>A.delete(N)):C.forEach(N=>A.add(N)),A})},[f]),rt=t.useCallback(()=>{D(i=>{const C=c.map($=>$._id);return i.size===C.length?new Set:new Set(C)})},[c]),st=t.useCallback(()=>{D(new Set)},[]),at=t.useMemo(()=>f.length===0?!1:f.every(i=>J.has(i._id)),[f,J]),ot=t.useCallback(async()=>{if(!(J.size===0||!(typeof Swal<"u"?await Swal.fire({title:"Confirmer la suppression",html:`<p>Vous allez supprimer <strong>${J.size}</strong> enregistrement(s).</p><p style="color:#e7515a;font-size:13px;margin-top:8px;">Cette action est irréversible.</p>`,icon:"warning",showCancelButton:!0,confirmButtonColor:"#e7515a",cancelButtonText:"Annuler",confirmButtonText:"Supprimer"}).then(C=>C.isConfirmed):confirm(`Supprimer ${J.size} enregistrement(s) ?`)))){E(!0);try{const $=await(await fetch(`/account/${n}/record/api/bulk-delete`,{method:"POST",headers:{"Content-Type":"application/json"},credentials:"include",body:JSON.stringify({ids:[...J]})})).json();$.success?(h(A=>A.filter(N=>!J.has(N._id))),D(new Set),V(`${$.deletedCount} enregistrement(s) supprimé(s)`)):V($.error||"Erreur lors de la suppression","error")}catch(C){console.error("[RecordsGrid] Bulk delete error:",C),V("Erreur lors de la suppression","error")}finally{E(!1)}}},[J,n,V]),nt=t.useCallback((i,C)=>{R($=>{const A=$.findIndex(de=>de.id===i),N=$.findIndex(de=>de.id===C);if(A===-1||N===-1)return $;const re=[...$],[ee]=re.splice(A,1);re.splice(N,0,ee);const ie=re.map(de=>w.columns.find(ge=>ge.id===de.id)||{id:de.id,visible:!0});return be("columns",ie),re})},[w.columns,be]),Ve=t.useMemo(()=>{switch(w.density){case"compact":return 36;case"comfortable":return 56;default:return 44}},[w.density]),We=dt({count:f.length,getScrollElement:()=>xe.current,estimateSize:()=>Ve,overscan:10});t.useEffect(()=>{We.measure()},[Ve,We]);const it=t.useMemo(()=>{var $;let i;($=w.columns)!=null&&$.length?i=k.filter(A=>{const N=w.columns.find(re=>re.id===A.id);return N?N.visible!==!1:!0}):i=k;const C=i.findIndex(A=>A.id==="actions");if(C>-1&&C<i.length-1){const[A]=i.splice(C,1);i=[...i,A]}return i},[k,w.columns]);return F&&f.length===0?e.jsx("div",{className:"flex items-center justify-center h-64",children:e.jsx("div",{className:"animate-spin rounded-full h-8 w-8 border-b-2 border-primary"})}):_&&f.length===0?e.jsx("div",{className:"flex items-center justify-center h-64 text-danger",children:e.jsxs("span",{children:["Erreur: ",_]})}):e.jsxs("div",{className:"relative flex h-full gap-5 sm:min-h-0",children:[e.jsx(Qt,{entityName:l,entityNamePlural:v,entityIcon:p,accountNumber:n,entitySlug:d,showSidebar:w.showSidebar!==!1,onToggleSidebar:()=>be("showSidebar",!w.showSidebar),filters:oe,activeFilters:ue,onFilterChange:Me,columns:k,fieldFilters:y,onFieldFiltersChange:Ne,allRecords:S,sidebarWidth:w.sidebarWidth,onSidebarWidthChange:i=>be("sidebarWidth",i)}),e.jsxs("div",{className:`panel p-4 flex-1 flex flex-col h-full ${H==="calendar"?"overflow-auto":"overflow-hidden"}`,children:[e.jsx(Ct,{searchQuery:Y,onSearch:Ce,columns:k,preferences:w,onPreferencesChange:be,loading:F,accountNumber:n,entitySlug:d,viewId:s,showSidebar:w.showSidebar!==!1,onToggleSidebar:()=>be("showSidebar",!w.showSidebar),activeView:H,onViewChange:Ge,enabledViews:w.enabledViews||["table","kanban","notes"],onEnabledViewsChange:i=>be("enabledViews",i),hasActiveFilters:Object.keys(ue).filter(i=>i!=="__favourites").length>0||y.length>0,onOpenSaveView:()=>ne(!0)}),e.jsx(tr,{savedViews:Z,activeViewId:q,onSelectView:he,onCreateView:G,onDeleteView:pe,onRenameView:ke,onUpdateViewFilters:we,hasActiveFilters:Object.keys(ue).filter(i=>i!=="__favourites").length>0||y.length>0,activeFilters:ue,fieldFilters:y,sidebarFilters:oe,columns:k,externalOpenCreate:K,onCloseExternalCreate:()=>ne(!1)}),e.jsx("div",{className:`flex-1 flex flex-col mt-4 ${H==="calendar"?"overflow-auto":"overflow-hidden"}`,children:H==="kanban"?e.jsx(It,{records:c,columns:k,accountNumber:n,entitySlug:d,viewId:s,entityData:te}):H==="calendar"?e.jsx(Yt,{records:c,columns:k,accountNumber:n,entitySlug:d,entityData:te}):H==="notes"?e.jsx(At,{records:c,accountNumber:n,entitySlug:d}):e.jsxs("div",{className:"dataTable-wrapper flex-1 flex flex-col overflow-hidden",children:[e.jsx("div",{className:"dataTable-container flex-1 overflow-auto",ref:xe,children:e.jsx(Nt,{records:f,columns:it,virtualizer:We,sort:w.sort,onSort:i=>{const C=w.sort.field===i&&w.sort.direction==="asc"?"desc":"asc";be("sort",{field:i,direction:C})},onColumnReorder:nt,density:w.density,titleDisplay:w.titleDisplay||"avatar",entityIcon:p,accountNumber:n,entitySlug:d,selectedIds:J,onToggleSelect:et,onSelectAll:tt,allPageSelected:at,showCheckboxes:w.showCheckboxes!==!1})}),e.jsxs("div",{className:"dataTable-bottom flex items-center justify-between border-t pt-4 dark:border-gray-800",children:[e.jsxs("div",{className:"dataTable-info text-gray-500 dark:text-gray-400",children:["Affichage de ",(z.page-1)*z.limit+1," à ",Math.min(z.page*z.limit,z.total)," sur ",z.total]}),e.jsx("nav",{className:"dataTable-pagination",children:e.jsxs("ul",{className:"inline-flex items-center space-x-1 rtl:space-x-reverse",children:[e.jsx("li",{children:e.jsx("button",{onClick:()=>Re(z.page-1),disabled:z.page<=1,className:"flex justify-center font-semibold p-2 rounded-full transition bg-white-light text-dark hover:text-white hover:bg-primary dark:text-white-light dark:bg-[#191e3a] dark:hover:bg-primary disabled:opacity-50",children:"«"})}),Array.from({length:Math.min(z.pages,5)},(i,C)=>{let $;return z.pages<=5||z.page<=3?$=C+1:z.page>=z.pages-2?$=z.pages-4+C:$=z.page-2+C,e.jsx("li",{children:e.jsx("button",{onClick:()=>Re($),className:`flex justify-center font-semibold px-3.5 py-2 rounded-full transition ${$===z.page?"bg-primary text-white dark:bg-primary dark:text-white-light":"bg-white-light text-dark hover:text-white hover:bg-primary dark:text-white-light dark:bg-[#191e3a] dark:hover:bg-primary"}`,children:$})},$)}),e.jsx("li",{children:e.jsx("button",{onClick:()=>Re(z.page+1),disabled:z.page>=z.pages,className:"flex justify-center font-semibold p-2 rounded-full transition bg-white-light text-dark hover:text-white hover:bg-primary dark:text-white-light dark:bg-[#191e3a] dark:hover:bg-primary disabled:opacity-50",children:"»"})})]})})]})]})})]}),J.size>0&&e.jsxs("div",{className:"bulk-action-bar",style:{position:"fixed",bottom:"24px",left:"50%",transform:"translateX(-50%)",zIndex:99999,display:"flex",alignItems:"center",gap:"12px",padding:"10px 20px",borderRadius:"14px",background:"linear-gradient(135deg, #1b2e4b 0%, #0e1726 100%)",boxShadow:"0 8px 32px rgba(0,0,0,0.3), 0 0 0 1px rgba(67,97,238,0.2)",animation:"bulkBarSlideUp 0.3s cubic-bezier(0.16,1,0.3,1)",backdropFilter:"blur(12px)"},children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"8px"},children:[e.jsx("div",{style:{width:28,height:28,borderRadius:"8px",background:"rgba(67,97,238,0.2)",color:"#4361ee",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"12px",fontWeight:700},children:J.size}),e.jsxs("span",{style:{color:"#e0e6ed",fontSize:"13px",fontWeight:500,whiteSpace:"nowrap"},children:["sélectionné",J.size>1?"s":""]})]}),e.jsx("div",{style:{width:1,height:24,background:"rgba(255,255,255,0.1)"}}),J.size<c.length&&e.jsxs("button",{onClick:rt,style:{padding:"6px 12px",borderRadius:"8px",border:"1px solid rgba(67,97,238,0.3)",background:"rgba(67,97,238,0.1)",color:"#93b4fd",fontSize:"12px",fontWeight:600,cursor:"pointer",transition:"all 0.15s",whiteSpace:"nowrap"},onMouseEnter:i=>{i.target.style.background="rgba(67,97,238,0.2)",i.target.style.color="#b8cffe"},onMouseLeave:i=>{i.target.style.background="rgba(67,97,238,0.1)",i.target.style.color="#93b4fd"},children:["Tout sélectionner (",c.length,")"]}),e.jsx("div",{style:{width:1,height:24,background:"rgba(255,255,255,0.1)"}}),e.jsxs("button",{onClick:ot,disabled:L,style:{display:"flex",alignItems:"center",gap:"6px",padding:"6px 14px",borderRadius:"8px",border:"none",background:"rgba(231,81,90,0.15)",color:"#ff6b6b",fontSize:"12px",fontWeight:600,cursor:L?"wait":"pointer",transition:"all 0.15s",whiteSpace:"nowrap",opacity:L?.6:1},onMouseEnter:i=>{L||(i.target.style.background="rgba(231,81,90,0.25)",i.target.style.color="#ff8a8a")},onMouseLeave:i=>{i.target.style.background="rgba(231,81,90,0.15)",i.target.style.color="#ff6b6b"},children:[e.jsxs("svg",{viewBox:"0 0 24 24",fill:"none",style:{width:14,height:14},children:[e.jsx("path",{d:"M20.5 6H3.5",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"}),e.jsx("path",{d:"M18.833 8.5L18.373 15.4C18.196 18.054 18.108 19.381 17.243 20.19C16.378 21 15.048 21 12.387 21H11.613C8.952 21 7.622 21 6.757 20.19C5.892 19.381 5.804 18.054 5.627 15.4L5.167 8.5",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"})]}),L?"Suppression...":"Supprimer"]}),e.jsx("div",{style:{width:1,height:24,background:"rgba(255,255,255,0.1)"}}),e.jsx("button",{onClick:st,style:{width:28,height:28,borderRadius:"8px",border:"none",background:"rgba(255,255,255,0.08)",color:"#888ea8",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",transition:"all 0.15s"},onMouseEnter:i=>{i.target.style.background="rgba(255,255,255,0.15)",i.target.style.color="#e0e6ed"},onMouseLeave:i=>{i.target.style.background="rgba(255,255,255,0.08)",i.target.style.color="#888ea8"},title:"Désélectionner tout",children:e.jsx("svg",{viewBox:"0 0 24 24",fill:"none",style:{width:14,height:14},children:e.jsx("path",{d:"M18 6L6 18M6 6L18 18",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round"})})})]}),x&&e.jsxs("div",{style:{position:"fixed",bottom:J.size>0?"80px":"24px",right:"24px",zIndex:99999,padding:"10px 20px",borderRadius:"10px",fontSize:"13px",fontWeight:500,color:"#fff",background:x.type==="error"?"#e7515a":"#00ab55",boxShadow:"0 4px 20px rgba(0,0,0,0.15)",animation:"toastSlideIn 0.25s ease-out",display:"flex",alignItems:"center",gap:"8px",transition:"bottom 0.3s ease"},children:[e.jsx("svg",{viewBox:"0 0 24 24",fill:"none",style:{width:16,height:16,flexShrink:0},children:x.type==="error"?e.jsx("path",{d:"M12 8V12M12 16H12.01M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"}):e.jsx("path",{d:"M5 13L9 17L19 7",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round"})}),x.message]}),e.jsx("style",{children:`
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
