import{r,j as e,a as _e,R as $e,c as lt}from"./chunks/client-CkWOIrXP.js";import{u as dt}from"./chunks/index-CjVSFo3p.js";import{C as Ke}from"./chunks/CardRenderer-1-YZ47CB.js";import{u as ct,a as Te,D as ut,c as pt,b as ft,d as xt,s as ht,K as mt,T as gt,M as bt,e as vt,S as kt,v as yt,f as wt,C as jt}from"./chunks/sortable.esm-DQ9-A8Dw.js";const Ae=[{id:"table",label:"Tableau",icon:e.jsxs("svg",{viewBox:"0 0 24 24",fill:"none",className:"h-4 w-4",children:[e.jsx("path",{d:"M3 7H21",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"}),e.jsx("path",{d:"M3 12H21",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"}),e.jsx("path",{d:"M3 17H21",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"})]})},{id:"kanban",label:"Kanban",icon:e.jsxs("svg",{viewBox:"0 0 24 24",fill:"none",className:"h-4 w-4",children:[e.jsx("rect",{x:"3",y:"3",width:"5",height:"18",rx:"1",stroke:"currentColor",strokeWidth:"1.5"}),e.jsx("rect",{x:"10",y:"3",width:"5",height:"12",rx:"1",stroke:"currentColor",strokeWidth:"1.5"}),e.jsx("rect",{x:"17",y:"3",width:"4",height:"15",rx:"1",stroke:"currentColor",strokeWidth:"1.5"})]})},{id:"notes",label:"Notes",icon:e.jsxs("svg",{viewBox:"0 0 24 24",fill:"none",className:"h-4 w-4",children:[e.jsx("path",{d:"M2 12C2 7.28595 2 4.92893 3.46447 3.46447C4.92893 2 7.28595 2 12 2C16.714 2 19.0711 2 20.5355 3.46447C22 4.92893 22 7.28595 22 12C22 16.714 22 19.0711 20.5355 20.5355C19.0711 22 16.714 22 12 22C7.28595 22 4.92893 22 3.46447 20.5355C2 19.0711 2 16.714 2 12Z",stroke:"currentColor",strokeWidth:"1.5"}),e.jsx("path",{opacity:"0.5",d:"M2 12H22",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"}),e.jsx("path",{opacity:"0.5",d:"M12 2V22",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"})]})},{id:"calendar",label:"Calendrier",icon:e.jsxs("svg",{viewBox:"0 0 24 24",fill:"none",className:"h-4 w-4",children:[e.jsx("rect",{x:"3",y:"4",width:"18",height:"18",rx:"2",stroke:"currentColor",strokeWidth:"1.5"}),e.jsx("path",{d:"M16 2V6M8 2V6M3 10H21",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"}),e.jsx("circle",{cx:"12",cy:"16",r:"1",fill:"currentColor"}),e.jsx("circle",{cx:"16",cy:"16",r:"1",fill:"currentColor"}),e.jsx("circle",{cx:"8",cy:"16",r:"1",fill:"currentColor"})]})}];function Ct({searchQuery:t,onSearch:o,columns:a,preferences:s,onPreferencesChange:u,loading:j,accountNumber:m,entitySlug:S,viewId:p,showSidebar:f,onToggleSidebar:v,activeView:x,onViewChange:W,enabledViews:C=["table","kanban","notes"],onEnabledViewsChange:$,hasActiveFilters:D=!1,onOpenSaveView:K}){var z,X,Q;const[M,g]=r.useState(!1),[U,H]=r.useState(!1),[P,q]=r.useState(!1),[c,h]=r.useState(!1),[G,V]=r.useState(""),B=r.useRef(null),J=r.useRef(null),L=r.useRef(null),E=r.useRef(null),_=r.useRef(null),se=r.useRef(null),oe=r.useRef(null),de=r.useRef(null),pe=()=>{g(!1),H(!1),q(!1),h(!1)};r.useEffect(()=>{const l=Z=>{Z.key==="Escape"&&pe()};return document.addEventListener("keydown",l),()=>document.removeEventListener("keydown",l)},[]);const b=(l,Z,ee,R)=>{r.useEffect(()=>{const ce=A=>{l&&Z.current&&!Z.current.contains(A.target)&&ee.current&&!ee.current.contains(A.target)&&R(!1)};return l&&setTimeout(()=>document.addEventListener("mousedown",ce),0),()=>document.removeEventListener("mousedown",ce)},[l])};b(M,_,B,g),b(U,se,J,H),b(P,oe,L,q),b(c,de,E,h);const F=l=>{if(l==="table")return;const Z=C.includes(l)?C.filter(ee=>ee!==l):[...C,l];$(Z),x===l&&!Z.includes(l)&&W("table")},Y=Ae.filter(l=>C.includes(l.id)),i=l=>{const Z=s.columns.some(R=>R.id===l);let ee;Z?ee=s.columns.map(R=>R.id===l?{...R,visible:!R.visible}:R):ee=[...s.columns,{id:l,visible:!1}],u("columns",ee)},k=l=>{if(!(l!=null&&l.current))return{top:0,right:0};const Z=l.current.getBoundingClientRect();return{top:Z.bottom+8,right:window.innerWidth-Z.right}},N=G.trim()?a.filter(l=>l.name.toLowerCase().includes(G.toLowerCase())):a;return e.jsxs("div",{className:"dataTable-top flex items-center mb-0 justify-between gap-2",children:[e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsxs("a",{href:`/account/${m}/record/${S}/add`,className:"btn-add-expandable block rounded-full p-2 bg-white-light/40 hover:bg-white-light/90 hover:text-primary dark:bg-dark/40 dark:hover:bg-dark/60",title:"Ajouter",children:[e.jsx("svg",{className:"btn-add-icon",viewBox:"0 0 24 24",fill:"none",children:e.jsx("path",{d:"M12 5V19M5 12H19",stroke:"currentColor",strokeWidth:"2.5",strokeLinecap:"round"})}),e.jsx("span",{className:"btn-add-label",children:"Ajouter"})]}),e.jsxs("div",{className:"dataTable-search relative w-64",style:{marginLeft:0},children:[e.jsxs("svg",{className:"absolute left-4 top-1/2 ml-2 -translate-y-1/2 h-4 w-4 text-gray-400",viewBox:"0 0 24 24",fill:"none",children:[e.jsx("circle",{cx:"11",cy:"11",r:"8",stroke:"currentColor",strokeWidth:"1.5"}),e.jsx("path",{d:"M16.5 16.5L21 21",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"})]}),e.jsx("input",{type:"text",value:t,onChange:l=>o(l.target.value),placeholder:"Rechercher...",className:"dataTable-input form-input w-full pl-11 pr-10",style:{"padding-left":"33px"}}),j&&e.jsx("div",{className:"absolute right-3 top-1/2 -translate-y-1/2",children:e.jsx("div",{className:"animate-spin rounded-full h-4 w-4 border-b-2 border-primary"})})]})]}),e.jsxs("div",{className:"flex items-center gap-2",children:[Y.map(l=>e.jsx("button",{type:"button",onClick:()=>W(l.id),title:l.label,className:`block rounded-full p-2 transition-all ${x===l.id?"bg-primary/20 text-primary":"bg-white-light/40 hover:bg-white-light/90 hover:text-primary dark:bg-dark/40 dark:hover:bg-dark/60"}`,children:l.icon},l.id)),e.jsx("button",{ref:E,type:"button",onClick:()=>{h(!c),g(!1),H(!1),q(!1)},className:`block rounded-full p-2 transition-all ${c?"bg-primary/20 text-primary":"bg-white-light/40 hover:bg-white-light/90 hover:text-primary dark:bg-dark/40 dark:hover:bg-dark/60"}`,title:"Configurer les vues",children:e.jsxs("svg",{className:"h-4 w-4",viewBox:"0 0 24 24",fill:"none",children:[e.jsx("circle",{cx:"12",cy:"12",r:"3",stroke:"currentColor",strokeWidth:"1.5"}),e.jsx("path",{d:"M12 2V4M12 20V22M2 12H4M20 12H22M4.93 4.93L6.34 6.34M17.66 17.66L19.07 19.07M4.93 19.07L6.34 17.66M17.66 6.34L19.07 4.93",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"})]})}),e.jsx("div",{className:"w-px h-5 bg-gray-200 dark:bg-gray-700 mx-0.5"}),e.jsx("button",{type:"button",onClick:K,className:`block rounded-full p-2 transition-all ${D?"bg-primary/20 text-primary":"bg-white-light/40 hover:bg-white-light/90 hover:text-primary dark:bg-dark/40 dark:hover:bg-dark/60"}`,title:"Filtrer & enregistrer la vue",children:e.jsx("svg",{className:"h-4 w-4",viewBox:"0 0 24 24",fill:"none",children:e.jsx("path",{d:"M22 3H2L10 12.46V19L14 21V12.46L22 3Z",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round"})})}),x==="table"&&(()=>{var Z,ee;const l=((Z=s.sort)==null?void 0:Z.field)!=="createdAt"||((ee=s.sort)==null?void 0:ee.direction)!=="desc";return e.jsx("button",{ref:J,type:"button",onClick:()=>{H(!U),g(!1),q(!1),h(!1)},className:`block rounded-full p-2 transition-all ${U||l?"bg-primary/20 text-primary":"bg-white-light/40 hover:bg-white-light/90 hover:text-primary dark:bg-dark/40 dark:hover:bg-dark/60"}`,title:"Trier",children:e.jsxs("svg",{className:"h-4 w-4",viewBox:"0 0 24 24",fill:"none",children:[e.jsx("path",{d:"M16 18L16 6M16 6L20 10M16 6L12 10",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round"}),e.jsx("path",{d:"M8 6L8 18M8 18L12 14M8 18L4 14",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round"})]})})})(),e.jsx("button",{ref:B,type:"button",onClick:()=>{g(!M),H(!1),q(!1),h(!1)},className:`block rounded-full p-2 transition-all ${M?"bg-primary/20 text-primary":"bg-white-light/40 hover:bg-white-light/90 hover:text-primary dark:bg-dark/40 dark:hover:bg-dark/60"}`,title:"Mode d'affichage",children:e.jsxs("svg",{className:"h-4 w-4",viewBox:"0 0 24 24",fill:"none",children:[e.jsx("path",{d:"M3 7H21",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"}),e.jsx("path",{d:"M6 12H18",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"}),e.jsx("path",{d:"M10 17H14",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"})]})}),x==="table"&&e.jsx("button",{ref:L,type:"button",onClick:()=>{q(!P),g(!1),H(!1),h(!1)},className:`block rounded-full p-2 transition-all ${P?"bg-primary/20 text-primary":"bg-white-light/40 hover:bg-white-light/90 hover:text-primary dark:bg-dark/40 dark:hover:bg-dark/60"}`,title:"Colonnes visibles",children:e.jsxs("svg",{className:"h-4 w-4",viewBox:"0 0 24 24",fill:"none",children:[e.jsx("path",{d:"M9 3H4C3.44772 3 3 3.44772 3 4V11C3 11.5523 3.44772 12 4 12H9C9.55228 12 10 11.5523 10 11V4C10 3.44772 9.55228 3 9 3Z",stroke:"currentColor",strokeWidth:"1.5"}),e.jsx("path",{d:"M20 3H15C14.4477 3 14 3.44772 14 4V7C14 7.55228 14.4477 8 15 8H20C20.5523 8 21 7.55228 21 7V4C21 3.44772 20.5523 3 20 3Z",stroke:"currentColor",strokeWidth:"1.5"}),e.jsx("path",{d:"M20 12H15C14.4477 12 14 12.4477 14 13V20C14 20.5523 14.4477 21 15 21H20C20.5523 21 21 20.5523 21 20V13C21 12.4477 20.5523 12 20 12Z",stroke:"currentColor",strokeWidth:"1.5"}),e.jsx("path",{d:"M9 16H4C3.44772 16 3 16.4477 3 17V20C3 20.5523 3.44772 21 4 21H9C9.55228 21 10 20.5523 10 20V17C10 16.4477 9.55228 16 9 16Z",stroke:"currentColor",strokeWidth:"1.5"})]})}),e.jsxs("button",{type:"button",onClick:v,className:"btn-sidebar-toggle block rounded-full p-2 bg-white-light/40 hover:bg-white-light/90 hover:text-primary dark:bg-dark/40 dark:hover:bg-dark/60",title:f?"Masquer le panneau":"Afficher le panneau",children:[e.jsxs("svg",{className:"btn-sidebar-icon",viewBox:"0 0 24 24",fill:"none",children:[e.jsx("rect",{x:"3",y:"3",width:"18",height:"18",rx:"2",stroke:"currentColor",strokeWidth:"1.5"}),e.jsx("path",{d:"M9 3V21",stroke:"currentColor",strokeWidth:"1.5"})]}),e.jsx("span",{className:"btn-sidebar-label",children:f?"Masquer":"Panneau"})]})]}),U&&_e.createPortal(e.jsxs(e.Fragment,{children:[e.jsx("div",{className:"fixed inset-0",style:{zIndex:9998},onClick:()=>H(!1)}),e.jsxs("div",{ref:se,className:"fixed rounded-xl shadow-xl p-4 w-72 bg-white dark:bg-[#0e1726] border border-gray-100 dark:border-white/10",style:{zIndex:9999,top:k(J).top,right:k(J).right,animation:"popoverSlide 0.15s ease-out"},children:[e.jsx("div",{className:"text-xs font-medium text-gray-500 dark:text-white-dark mb-2",children:"Trier par"}),e.jsxs("div",{className:"flex gap-2",children:[e.jsxs("select",{value:((z=s.sort)==null?void 0:z.field)||"createdAt",onChange:l=>u("sort",{...s.sort,field:l.target.value}),className:"flex-1 px-2 py-1.5 text-xs border border-gray-200 dark:border-white/10 rounded-lg bg-white dark:bg-[#1b2e4b] text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary/50",children:[e.jsx("option",{value:"createdAt",children:"Date de création"}),e.jsx("option",{value:"title",children:"Titre"}),a.filter(l=>l.id!=="title"&&l.id!=="actions").map(l=>e.jsx("option",{value:l.id,children:l.name},l.id))]}),e.jsx("button",{onClick:()=>{var l;return u("sort",{...s.sort,direction:((l=s.sort)==null?void 0:l.direction)==="asc"?"desc":"asc"})},className:"p-1.5 border border-gray-200 dark:border-white/10 rounded-lg bg-white dark:bg-[#1b2e4b] hover:bg-gray-50 dark:hover:bg-[#253b5c] transition-all",title:((X=s.sort)==null?void 0:X.direction)==="asc"?"Croissant":"Décroissant",children:e.jsx("svg",{className:`h-4 w-4 text-gray-600 dark:text-white transition-transform ${((Q=s.sort)==null?void 0:Q.direction)==="asc"?"rotate-180":""}`,viewBox:"0 0 24 24",fill:"none",children:e.jsx("path",{d:"M12 5V19M12 19L6 13M12 19L18 13",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round"})})}),e.jsx("button",{onClick:()=>u("sort",{field:"createdAt",direction:"desc"}),className:"p-1.5 border border-gray-200 dark:border-white/10 rounded-lg bg-white dark:bg-[#1b2e4b] hover:bg-red-50 hover:border-red-300 hover:text-red-500 dark:hover:bg-red-900/20 transition-all",title:"Réinitialiser le tri",children:e.jsxs("svg",{className:"h-4 w-4 text-gray-600 dark:text-white",viewBox:"0 0 24 24",fill:"none",children:[e.jsx("path",{d:"M4.06189 13C4.02104 12.6724 4 12.3387 4 12C4 7.58172 7.58172 4 12 4C14.5006 4 16.7332 5.14727 18.2002 6.94416M19.9381 11C19.979 11.3276 20 11.6613 20 12C20 16.4183 16.4183 20 12 20C9.49944 20 7.26681 18.8527 5.79984 17.0558",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round"}),e.jsx("path",{d:"M15 7H19V3",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round"}),e.jsx("path",{d:"M9 17H5V21",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round"})]})})]})]})]}),document.body),M&&_e.createPortal(e.jsxs(e.Fragment,{children:[e.jsx("div",{className:"fixed inset-0",style:{zIndex:9998},onClick:()=>g(!1)}),e.jsxs("div",{ref:_,className:"fixed rounded-xl shadow-xl p-4 w-72 bg-white dark:bg-[#0e1726] border border-gray-100 dark:border-white/10",style:{zIndex:9999,top:k(B).top,right:k(B).right,animation:"popoverSlide 0.15s ease-out"},children:[e.jsxs("div",{className:"mb-4",children:[e.jsx("div",{className:"text-xs font-medium text-gray-500 dark:text-white-dark mb-2",children:"Densité"}),e.jsx("div",{className:"flex gap-1",children:["compact","normal","comfortable"].map(l=>e.jsx("button",{onClick:()=>u("density",l),className:`flex-1 px-2 py-1.5 text-xs rounded-lg transition-all ${s.density===l?"bg-primary text-white":"bg-gray-100 dark:bg-dark/40 text-gray-600 dark:text-white-dark/70 hover:bg-gray-200 dark:hover:bg-dark/60"}`,children:l==="compact"?"Compact":l==="normal"?"Normal":"Confort"},l))})]}),e.jsxs("div",{className:"mb-4",children:[e.jsx("div",{className:"text-xs font-medium text-gray-500 dark:text-white-dark mb-2",children:"Lignes par page"}),e.jsx("div",{className:"flex gap-1",children:[10,25,50,100].map(l=>e.jsx("button",{onClick:()=>u("pageSize",l),className:`flex-1 px-2 py-1.5 text-xs rounded-lg transition-all ${s.pageSize===l?"bg-primary text-white":"bg-gray-100 dark:bg-dark/40 text-gray-600 dark:text-white-dark/70 hover:bg-gray-200 dark:hover:bg-dark/60"}`,children:l},l))})]})]})]}),document.body),P&&_e.createPortal(e.jsxs(e.Fragment,{children:[e.jsx("div",{className:"fixed inset-0",style:{zIndex:9998},onClick:()=>q(!1)}),e.jsxs("div",{ref:oe,className:"fixed rounded-xl shadow-xl p-4 w-64 bg-white dark:bg-[#0e1726] border border-gray-100 dark:border-white/10",style:{zIndex:9999,top:k(L).top,right:k(L).right,animation:"popoverSlide 0.15s ease-out"},children:[e.jsx("div",{className:"text-xs font-medium text-gray-500 dark:text-white-dark mb-2",children:"Colonnes visibles"}),e.jsx("div",{className:"relative mb-2",children:e.jsx("input",{type:"text",value:G,onChange:l=>V(l.target.value),placeholder:"Filtrer...",className:"w-full px-3 py-1.5 text-xs border border-gray-200 dark:border-white/10 rounded-lg bg-white dark:bg-[#1b2e4b] text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary/50"})}),e.jsx("div",{className:"space-y-0.5 max-h-48 overflow-y-auto",children:N.map(l=>{const Z=s.columns.find(R=>R.id===l.id),ee=Z?Z.visible!==!1:!0;return e.jsxs("label",{className:"flex items-center gap-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 px-2 py-1.5 rounded-lg",children:[e.jsx("input",{type:"checkbox",checked:ee,onChange:()=>i(l.id),className:"form-checkbox text-primary w-3.5 h-3.5 rounded"}),e.jsx("span",{className:"text-xs text-gray-700 dark:text-gray-300",children:l.name})]},l.id)})}),e.jsx("div",{className:"border-t border-gray-100 dark:border-white/10 mt-3 mb-2"}),e.jsxs("div",{children:[e.jsx("div",{className:"text-xs font-medium text-gray-500 dark:text-white-dark mb-2",children:"Affichage titre"}),e.jsx("div",{className:"flex gap-1",children:[{value:"avatar",label:"Avatar"},{value:"icon",label:"Icône"},{value:"none",label:"Aucun"}].map(l=>e.jsx("button",{onClick:()=>u("titleDisplay",l.value),className:`flex-1 px-2 py-1.5 text-xs rounded-lg transition-all ${(s.titleDisplay||"avatar")===l.value?"bg-primary text-white":"bg-gray-100 dark:bg-dark/40 text-gray-600 dark:text-white-dark/70 hover:bg-gray-200 dark:hover:bg-dark/60"}`,children:l.label},l.value))})]}),e.jsx("div",{className:"border-t border-gray-100 dark:border-white/10 mt-3 mb-2"}),e.jsx("div",{children:e.jsxs("div",{className:"flex items-center justify-between",children:[e.jsx("span",{className:"text-xs font-medium text-gray-500 dark:text-white-dark",children:"Sélection multiple"}),e.jsx("button",{type:"button",onClick:()=>u("showCheckboxes",s.showCheckboxes===!1),style:{position:"relative",width:36,height:20,borderRadius:10,border:"none",cursor:"pointer",transition:"background 0.2s ease",background:s.showCheckboxes!==!1?"#4361ee":"#d1d5db",padding:0},children:e.jsx("span",{style:{position:"absolute",top:2,left:s.showCheckboxes!==!1?18:2,width:16,height:16,borderRadius:"50%",background:"#fff",boxShadow:"0 1px 3px rgba(0,0,0,0.2)",transition:"left 0.2s ease"}})})]})})]})]}),document.body),c&&_e.createPortal(e.jsxs(e.Fragment,{children:[e.jsx("div",{className:"fixed inset-0",style:{zIndex:9998},onClick:()=>h(!1)}),e.jsxs("div",{ref:de,className:"fixed rounded-xl shadow-xl p-4 w-64 bg-white dark:bg-[#0e1726] border border-gray-100 dark:border-white/10",style:{zIndex:9999,top:k(E).top,right:k(E).right,animation:"popoverSlide 0.15s ease-out"},children:[e.jsx("div",{className:"text-xs font-medium text-gray-500 dark:text-white-dark mb-3",children:"Vues disponibles"}),e.jsx("div",{className:"space-y-1",children:Ae.map(l=>{const Z=C.includes(l.id),ee=l.id==="table";return e.jsxs("label",{className:`flex items-center gap-3 cursor-pointer px-2 py-2 rounded-lg transition-all ${ee?"opacity-60 cursor-not-allowed":"hover:bg-gray-50 dark:hover:bg-gray-800"}`,children:[e.jsx("input",{type:"checkbox",checked:Z,onChange:()=>F(l.id),disabled:ee,className:"form-checkbox text-primary w-4 h-4 rounded"}),e.jsxs("span",{className:`flex items-center gap-2 text-sm ${Z?"text-gray-700 dark:text-gray-300":"text-gray-400 dark:text-gray-600"}`,children:[l.icon,l.label]})]},l.id)})}),e.jsx("div",{className:"border-t border-gray-100 dark:border-white/10 mt-3 pt-2",children:e.jsx("p",{className:"text-[10px] text-gray-400 dark:text-gray-600",children:"Le tableau est toujours activé par défaut."})})]})]}),document.body),e.jsx("style",{children:`
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
            `})]})}function Nt({records:t,columns:o,virtualizer:a,sort:s,onSort:u,onColumnReorder:j,density:m,titleDisplay:S,entityIcon:p,accountNumber:f,entitySlug:v,selectedIds:x,onToggleSelect:W,onSelectAll:C,allPageSelected:$,showCheckboxes:D=!0}){var c;const[K,M]=r.useState(null),[g,U]=r.useState(null),H=a.getVirtualItems(),P={compact:{rowHeight:36,cellClass:"py-1",fontSize:"text-xs",imageSize:"w-6 h-6",fontWeight:"font-medium"},normal:{rowHeight:44,cellClass:"py-2",fontSize:"text-sm",imageSize:"w-9 h-9",fontWeight:"font-semibold"},comfortable:{rowHeight:56,cellClass:"py-3",fontSize:"text-sm",imageSize:"w-9 h-9",fontWeight:"font-semibold"}},q=P[m]||P.comfortable;return x&&x.size>0,e.jsxs("table",{className:"table-hover whitespace-nowrap dataTable-table w-full",children:[e.jsx("thead",{className:"sticky top-0 bg-white dark:bg-[#1b2e4b] z-10",children:e.jsxs("tr",{children:[D&&e.jsx("th",{style:{width:40,padding:"0 8px"},children:e.jsxs("label",{className:"bulk-checkbox-wrapper",style:{display:"flex",alignItems:"center",justifyContent:"center"},children:[e.jsx("input",{type:"checkbox",checked:$&&t.length>0,onChange:()=>C&&C(),className:"bulk-checkbox"}),e.jsx("span",{className:"bulk-checkbox-custom"})]})}),o.map(h=>{const G=(s==null?void 0:s.field)===h.id||h.id==="title"&&(s==null?void 0:s.field)==="title"||h.id==="createdAt"&&(s==null?void 0:s.field)==="createdAt",V=(s==null?void 0:s.direction)||"desc",B=K===h.id,J=g===h.id&&K!==h.id,L=h.id!=="actions";return e.jsx("th",{"data-sortable":h.sortable!==!1?"":void 0,"data-column-id":h.id,onDragEnter:E=>{E.preventDefault(),h.id!=="actions"&&K&&K!==h.id&&U(h.id)},onDragOver:E=>{E.preventDefault()},onDrop:E=>{E.preventDefault(),K&&K!==h.id&&h.id!=="actions"&&j&&j(K,h.id),M(null),U(null)},className:`px-2 ${B?"opacity-50":""} ${J?"border-l-2 border-l-primary bg-primary/5":""}`,style:{transition:"opacity 0.15s, border-color 0.15s, background 0.15s",...h.id==="actions"?{width:"1%",whiteSpace:"nowrap"}:{},...h.id==="title"?{minWidth:220}:{}},children:e.jsxs("div",{className:"flex items-center gap-1",children:[L&&e.jsx("span",{draggable:"true",onDragStart:E=>{M(h.id),E.dataTransfer.effectAllowed="move",E.dataTransfer.setData("text/plain",h.id)},onDragEnd:()=>{M(null),U(null)},className:"cursor-grab text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300",children:e.jsxs("svg",{className:"h-3 w-3",viewBox:"0 0 24 24",fill:"currentColor",children:[e.jsx("circle",{cx:"9",cy:"6",r:"1.5"}),e.jsx("circle",{cx:"15",cy:"6",r:"1.5"}),e.jsx("circle",{cx:"9",cy:"12",r:"1.5"}),e.jsx("circle",{cx:"15",cy:"12",r:"1.5"}),e.jsx("circle",{cx:"9",cy:"18",r:"1.5"}),e.jsx("circle",{cx:"15",cy:"18",r:"1.5"})]})}),h.sortable!==!1?e.jsxs("a",{href:"#",className:"dataTable-sorter flex items-center gap-1",draggable:"false",onClick:E=>{E.preventDefault(),u(h.id)},children:[h.name,G&&e.jsx("svg",{className:`h-3 w-3 text-primary transition-transform ${V==="asc"?"rotate-180":""}`,viewBox:"0 0 24 24",fill:"none",children:e.jsx("path",{d:"M12 5V19M12 19L6 13M12 19L18 13",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round"})})]}):h.name]})},h.id)})]})}),e.jsxs("tbody",{children:[H.length>0&&H[0].start>0&&e.jsx("tr",{children:e.jsx("td",{colSpan:o.length+1,style:{height:H[0].start,padding:0}})}),H.map(h=>{const G=t[h.index];if(!G)return null;const V={compact:"4px 8px",normal:"8px 12px",comfortable:"12px 12px"}[m]||"12px 12px",B=x&&x.has(G._id);return e.jsxs("tr",{"data-index":h.index,ref:a.measureElement,style:{minHeight:q.rowHeight},className:B?"bulk-row-selected":"",children:[D&&e.jsx("td",{style:{padding:"0 8px",width:40},children:e.jsxs("label",{className:"bulk-checkbox-wrapper",style:{display:"flex",alignItems:"center",justifyContent:"center"},onClick:J=>{J.preventDefault(),W&&W(G._id,h.index,J.shiftKey)},children:[e.jsx("input",{type:"checkbox",checked:B,readOnly:!0,className:"bulk-checkbox"}),e.jsx("span",{className:"bulk-checkbox-custom"})]})}),o.map(J=>e.jsx("td",{className:`${q.fontSize}`,style:{padding:V,...J.id==="actions"?{width:"1%",whiteSpace:"nowrap"}:{},...J.id==="title"?{minWidth:220}:{}},children:St(G,J,f,v,q,S,p)},J.id))]},G._id)}),H.length>0&&e.jsx("tr",{children:e.jsx("td",{colSpan:o.length+1,style:{height:Math.max(0,a.getTotalSize()-(((c=H[H.length-1])==null?void 0:c.end)||0)),padding:0}})})]})]})}function St(t,o,a,s,u,j,m){var S,p;switch(o.id){case"title":{const f=t.referenceTitle||t.title||"Sans titre";f.charAt(0).toUpperCase();const v=Math.abs(f.charCodeAt(0)||65)%35+1,x=t.image||`/assets/images/profile-${v}.jpeg`;return e.jsxs("div",{className:"flex items-center gap-2",children:[j==="avatar"&&e.jsx("img",{src:x,alt:f,className:`${u.imageSize} rounded-full max-w-none`}),j==="icon"&&m&&e.jsx("div",{className:`${u.imageSize} rounded-lg max-w-none flex items-center justify-center bg-primary/10 text-primary shrink-0`,children:e.jsx("iconify-icon",{icon:m,width:"16"})}),e.jsx("a",{href:`/account/${a}/record/${s}/${t._id}/edit`,className:`${u.fontWeight} hover:text-primary transition-colors truncate`,title:f,children:f})]})}case"createdAt":return new Date(t.createdAt).toLocaleDateString("fr-FR");case"actions":return e.jsxs("div",{className:"flex items-center gap-0",children:[e.jsx("a",{href:`/account/${a}/record/${s}/${t._id}`,className:"p-1 rounded-lg text-gray-500 hover:text-primary hover:bg-primary/10 transition-all",title:"Voir",children:e.jsxs("svg",{className:"h-4 w-4",viewBox:"0 0 24 24",fill:"none",children:[e.jsx("path",{d:"M15 12C15 13.6569 13.6569 15 12 15C10.3431 15 9 13.6569 9 12C9 10.3431 10.3431 9 12 9C13.6569 9 15 10.3431 15 12Z",stroke:"currentColor",strokeWidth:"1.5"}),e.jsx("path",{d:"M12 5C7.5 5 3.73 7.94 2 12C3.73 16.06 7.5 19 12 19C16.5 19 20.27 16.06 22 12C20.27 7.94 16.5 5 12 5Z",stroke:"currentColor",strokeWidth:"1.5"})]})}),e.jsx("a",{href:`/account/${a}/record/${s}/${t._id}/edit`,className:"p-1 rounded-lg text-gray-500 hover:text-info hover:bg-info/10 transition-all",title:"Modifier",children:e.jsx("svg",{className:"h-4 w-4",viewBox:"0 0 24 24",fill:"none",children:e.jsx("path",{d:"M16.862 4.487L18.55 2.8C19.33 2.02 20.59 2.02 21.37 2.8C22.15 3.58 22.15 4.84 21.37 5.62L19.681 7.307M16.862 4.487L4.162 17.187C3.882 17.467 3.682 17.818 3.592 18.198L2.732 21.596C2.642 21.966 2.952 22.296 3.322 22.226L6.892 21.556C7.242 21.486 7.572 21.306 7.832 21.046L20.513 8.366M16.862 4.487L19.681 7.307",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round"})})}),e.jsx("button",{type:"button",className:"p-1 rounded-lg text-gray-500 hover:text-danger hover:bg-danger/10 transition-all",title:"Supprimer",onClick:()=>{confirm("Êtes-vous sûr de vouloir supprimer cet enregistrement ?")&&console.log("Delete record:",t._id)},children:e.jsxs("svg",{className:"h-4 w-4",viewBox:"0 0 24 24",fill:"none",children:[e.jsx("path",{d:"M20.5 6H3.5",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"}),e.jsx("path",{d:"M18.833 8.5L18.373 15.4C18.196 18.054 18.108 19.381 17.243 20.19C16.378 21 15.048 21 12.387 21H11.613C8.952 21 7.622 21 6.757 20.19C5.892 19.381 5.804 18.054 5.627 15.4L5.167 8.5",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"}),e.jsx("path",{d:"M9.5 11L10 16",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"}),e.jsx("path",{d:"M14.5 11L14 16",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"}),e.jsx("path",{d:"M6.5 6C6.556 5.367 6.612 5.1 6.877 4.714C7.178 4.275 7.945 3.917 9.484 3.2L9.924 2.984C10.683 2.589 11.06 2.392 11.476 2.318C11.823 2.254 12.177 2.254 12.524 2.318C12.94 2.392 13.317 2.589 14.076 2.984L14.516 3.2C16.055 3.917 16.822 4.275 17.123 4.714C17.388 5.1 17.444 5.367 17.5 6",stroke:"currentColor",strokeWidth:"1.5"})]})})]});default:{if(o.id.startsWith("rel:")){const f=o.id.substring(4),x=(((S=t._denorm)==null?void 0:S.relations)||[]).find(C=>C.relationKey===f);if(((p=x==null?void 0:x.records)==null?void 0:p.length)>0)return e.jsx("div",{className:"flex flex-wrap gap-1",children:x.records.map((C,$)=>e.jsx("a",{href:`/account/${a}/record/${C.entitySlug||s}/${C._id}`,className:"text-primary hover:underline text-xs",children:C.title||"Sans titre"},$))});const W=(t.relations||[]).find(C=>C.relationKey===f);return W!=null&&W.value?"—":""}if(o.id.startsWith("classif:")){const f=o.id.substring(8),v=(t.classificationValues||[]).find(x=>{var C,$,D;return(((C=x.classificationId)==null?void 0:C.$oid)||((D=($=x.classificationId)==null?void 0:$.toString)==null?void 0:D.call($))||x.classificationId)===f});if(v!=null&&v.label){const x=v.color||"#888";return e.jsx("span",{className:"inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap",style:{backgroundColor:`${x}15`,color:x,border:`1px solid ${x}30`},children:v.label})}return v!=null&&v.value?e.jsx("span",{className:"inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20",children:v.value}):""}if(t.customFields){const f=t.customFields.find(x=>{var C;const W=((C=x.field_id)==null?void 0:C._id)||x.field_id;return(W==null?void 0:W.toString())===o.id});if(!f)return"";const v=f.value;if(v&&typeof v=="object"&&v._v){const x=[];return Object.entries(v).forEach(([W,C])=>{W==="_v"||W==="customText"||(Array.isArray(C)?C.forEach($=>x.push($)):C&&x.push(C))}),v.customText&&x.push(v.customText),e.jsx("div",{className:"flex flex-wrap gap-1",children:x.map((W,C)=>e.jsx("span",{className:"inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20",children:W},C))})}return v||""}return""}}}function Be(t,o=.1){if(!t)return`rgba(99, 102, 241, ${o})`;const a=parseInt(t.slice(1,3),16),s=parseInt(t.slice(3,5),16),u=parseInt(t.slice(5,7),16);return`rgba(${a}, ${s}, ${u}, ${o})`}function Lt({field:t,record:o}){const a=(o.customFields||[]).find(u=>{var m;const j=((m=u.field_id)==null?void 0:m._id)||u.field_id;return(j==null?void 0:j.toString())===t.id});if(!a)return e.jsx("span",{className:"text-gray-400 dark:text-gray-600 text-sm italic",children:"—"});const s=a.value;if(s==null||s==="")return e.jsx("span",{className:"text-gray-400 dark:text-gray-600 text-sm italic",children:"—"});if(t.type==="date"||t.type==="datetime")try{return e.jsx("span",{className:"text-sm text-gray-700 dark:text-gray-300",children:new Date(s).toLocaleDateString("fr-FR")})}catch{return e.jsx("span",{className:"text-sm text-gray-700 dark:text-gray-300",children:String(s)})}return t.type==="boolean"||t.type==="checkbox"?e.jsxs("span",{className:`inline-flex items-center gap-1 text-sm ${s?"text-success":"text-gray-400"}`,children:[s?e.jsxs("svg",{width:"16",height:"16",viewBox:"0 0 24 24",fill:"none",children:[e.jsx("path",{d:"M9 12l2 2 4-4",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round"}),e.jsx("circle",{cx:"12",cy:"12",r:"10",stroke:"currentColor",strokeWidth:"1.5"})]}):e.jsx("svg",{width:"16",height:"16",viewBox:"0 0 24 24",fill:"none",children:e.jsx("circle",{cx:"12",cy:"12",r:"10",stroke:"currentColor",strokeWidth:"1.5"})}),s?"Oui":"Non"]}):t.type==="relation"?Array.isArray(s)?e.jsx("div",{className:"flex flex-wrap gap-1",children:s.map((u,j)=>e.jsx("span",{className:"inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-primary/10 text-primary font-medium",children:u.title||u.label||u.name||String(u)},j))}):e.jsx("span",{className:"text-sm text-gray-700 dark:text-gray-300",children:s.title||s.label||String(s)}):t.type==="number"?e.jsx("span",{className:"text-sm font-mono text-gray-700 dark:text-gray-300",children:Number(s).toLocaleString("fr-FR")}):e.jsx("span",{className:"text-sm text-gray-700 dark:text-gray-300",children:String(s)})}function Mt({record:t,columns:o,accountNumber:a,entitySlug:s,onClose:u}){var M;const j=r.useRef(null),[m,S]=r.useState(!1);r.useEffect(()=>{requestAnimationFrame(()=>S(!0))},[]);const p=r.useCallback(()=>{S(!1),setTimeout(()=>u(),250)},[u]);if(r.useEffect(()=>{const g=U=>{U.key==="Escape"&&p()};return document.addEventListener("keydown",g),()=>document.removeEventListener("keydown",g)},[p]),!t)return null;const f=((M=t._id)==null?void 0:M.$oid)||t._id,v=t.referenceTitle||t.title||t.computedTitle||"Sans titre",x=t.description||"",W=t.createdAt?new Date(t.createdAt).toLocaleDateString("fr-FR",{day:"2-digit",month:"long",year:"numeric"}):null,C=t.updatedAt?new Date(t.updatedAt).toLocaleDateString("fr-FR",{day:"2-digit",month:"long",year:"numeric"}):null,$=(t.classificationValues||[]).filter(g=>g.optionLabel||g.label).map(g=>({label:g.optionLabel||g.label,color:g.optionColor||g.color||"#6366f1",classificationName:g.classificationName||"Classification"})),D={};$.forEach(g=>{D[g.classificationName]||(D[g.classificationName]=[]),D[g.classificationName].push(g)});const K=o.filter(g=>g.id!=="title"&&g.id!=="actions"&&!g.id.startsWith("class:"));return _e.createPortal(e.jsxs(e.Fragment,{children:[e.jsx("div",{className:`fixed inset-0 bg-black/40 backdrop-blur-[2px] transition-opacity duration-250 ${m?"opacity-100":"opacity-0"}`,style:{zIndex:1e4},onMouseDown:p,onTouchEnd:g=>{g.preventDefault(),p()}}),e.jsxs("div",{ref:j,className:`fixed right-0 top-0 h-full bg-white dark:bg-[#0e1726] shadow-2xl border-l border-gray-200 dark:border-gray-700 flex flex-col transition-transform duration-250 ease-out ${m?"translate-x-0":"translate-x-full"}`,style:{zIndex:10001,width:"min(520px, 90vw)"},onClick:g=>g.stopPropagation(),children:[e.jsxs("div",{className:"flex items-center justify-between gap-3 px-6 py-4 border-b border-gray-100 dark:border-gray-700/50 flex-shrink-0",children:[e.jsxs("div",{className:"flex items-center gap-2 min-w-0",children:[e.jsx("div",{className:"w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0",children:e.jsxs("svg",{width:"16",height:"16",viewBox:"0 0 24 24",fill:"none",children:[e.jsx("path",{d:"M2 12C2 7.28595 2 4.92893 3.46447 3.46447C4.92893 2 7.28595 2 12 2C16.714 2 19.0711 2 20.5355 3.46447C22 4.92893 22 7.28595 22 12C22 16.714 22 19.0711 20.5355 20.5355C19.0711 22 16.714 22 12 22C7.28595 22 4.92893 22 3.46447 20.5355C2 19.0711 2 16.714 2 12Z",stroke:"#4361ee",strokeWidth:"1.5"}),e.jsx("path",{d:"M8 12H16M12 8V16",stroke:"#4361ee",strokeWidth:"1.5",strokeLinecap:"round"})]})}),e.jsx("h3",{className:"text-base font-semibold text-gray-900 dark:text-white truncate",children:v})]}),e.jsxs("div",{className:"flex items-center gap-1 flex-shrink-0",children:[e.jsx("a",{href:`/account/${a}/record/${s}/${f}`,className:"p-2 rounded-lg text-gray-400 hover:text-primary hover:bg-primary/10 transition-all",title:"Ouvrir la page complète",children:e.jsxs("svg",{width:"16",height:"16",viewBox:"0 0 24 24",fill:"none",children:[e.jsx("path",{d:"M10 4H6C4.89543 4 4 4.89543 4 6V18C4 19.1046 4.89543 20 6 20H18C19.1046 20 20 19.1046 20 18V14",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"}),e.jsx("path",{d:"M14 4H20V10",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round"}),e.jsx("path",{d:"M20 4L11 13",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"})]})}),e.jsx("a",{href:`/account/${a}/record/${s}/${f}/edit`,className:"p-2 rounded-lg text-gray-400 hover:text-info hover:bg-info/10 transition-all",title:"Modifier",children:e.jsx("svg",{width:"16",height:"16",viewBox:"0 0 24 24",fill:"none",children:e.jsx("path",{d:"M16.862 4.487L18.55 2.8C19.33 2.02 20.59 2.02 21.37 2.8C22.15 3.58 22.15 4.84 21.37 5.62L19.681 7.307M16.862 4.487L4.162 17.187C3.882 17.467 3.682 17.818 3.592 18.198L2.732 21.596C2.642 21.966 2.952 22.296 3.322 22.226L6.892 21.556C7.242 21.486 7.572 21.306 7.832 21.046L20.513 8.366",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"})})}),e.jsx("button",{onClick:p,className:"p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all",title:"Fermer",children:e.jsx("svg",{width:"16",height:"16",viewBox:"0 0 24 24",fill:"none",children:e.jsx("path",{d:"M18 6L6 18M6 6L18 18",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round"})})})]})]}),e.jsxs("div",{className:"flex-1 overflow-y-auto",children:[Object.keys(D).length>0&&e.jsx("div",{className:"px-6 py-4 border-b border-gray-100 dark:border-gray-700/50",children:Object.entries(D).map(([g,U])=>e.jsxs("div",{className:"mb-3 last:mb-0",children:[e.jsx("div",{className:"text-[11px] uppercase tracking-wider font-semibold text-gray-400 dark:text-gray-500 mb-1.5",children:g}),e.jsx("div",{className:"flex flex-wrap gap-1.5",children:U.map((H,P)=>e.jsxs("span",{className:"inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium transition-all hover:scale-105",style:{backgroundColor:Be(H.color,.15),color:H.color,border:`1px solid ${Be(H.color,.3)}`},children:[e.jsx("span",{className:"w-2 h-2 rounded-full flex-shrink-0",style:{backgroundColor:H.color}}),H.label]},P))})]},g))}),x&&e.jsxs("div",{className:"px-6 py-4 border-b border-gray-100 dark:border-gray-700/50",children:[e.jsx("div",{className:"text-[11px] uppercase tracking-wider font-semibold text-gray-400 dark:text-gray-500 mb-2",children:"Description"}),e.jsx("p",{className:"text-sm text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-wrap",children:x})]}),e.jsxs("div",{className:"px-6 py-4",children:[e.jsx("div",{className:"text-[11px] uppercase tracking-wider font-semibold text-gray-400 dark:text-gray-500 mb-3",children:"Détails"}),e.jsxs("div",{className:"space-y-0",children:[K.map(g=>e.jsxs("div",{className:"flex items-start gap-3 py-2.5 border-b border-gray-50 dark:border-gray-800/50 last:border-0",children:[e.jsx("div",{className:"w-32 flex-shrink-0 text-xs font-medium text-gray-500 dark:text-gray-400 pt-0.5 truncate",children:g.name}),e.jsx("div",{className:"flex-1 min-w-0",children:e.jsx(Lt,{field:g,record:t})})]},g.id)),(t.relations||[]).map((g,U)=>{var H;return e.jsxs("div",{className:"flex items-start gap-3 py-2.5 border-b border-gray-50 dark:border-gray-800/50 last:border-0",children:[e.jsx("div",{className:"w-32 flex-shrink-0 text-xs font-medium text-gray-500 dark:text-gray-400 pt-0.5 truncate",children:g.label||g.key||"Relation"}),e.jsx("div",{className:"flex-1 min-w-0",children:((H=g.records)==null?void 0:H.length)>0?e.jsx("div",{className:"flex flex-wrap gap-1",children:g.records.map((P,q)=>e.jsx("a",{href:`/account/${a}/record/${g.entitySlug||s}/${P._id}`,className:"inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-primary/10 text-primary font-medium hover:bg-primary/20 transition-colors",children:P.referenceTitle||P.title||"Sans titre"},q))}):e.jsx("span",{className:"text-gray-400 dark:text-gray-600 text-sm italic",children:"—"})})]},`rel-${U}`)})]})]})]}),e.jsx("div",{className:"flex-shrink-0 px-6 py-3 border-t border-gray-100 dark:border-gray-700/50 bg-gray-50/50 dark:bg-[#0a0f1e]/50",children:e.jsxs("div",{className:"flex items-center justify-between text-[11px] text-gray-400 dark:text-gray-500",children:[e.jsxs("div",{className:"flex items-center gap-3",children:[W&&e.jsxs("span",{className:"flex items-center gap-1",children:[e.jsxs("svg",{width:"12",height:"12",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"1.5",children:[e.jsx("circle",{cx:"12",cy:"12",r:"10"}),e.jsx("path",{d:"M12 6V12L16 14",strokeLinecap:"round"})]}),"Créé le ",W]}),C&&e.jsxs("span",{className:"flex items-center gap-1",children:[e.jsx("svg",{width:"12",height:"12",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"1.5",children:e.jsx("path",{d:"M4.06 13C4.02 12.67 4 12.34 4 12C4 7.58 7.58 4 12 4C14.5 4 16.73 5.15 18.2 6.94M19.94 11C19.98 11.33 20 11.66 20 12C20 16.42 16.42 20 12 20C9.5 20 7.27 18.85 5.8 17.06",strokeLinecap:"round",strokeLinejoin:"round"})}),"Modifié le ",C]})]}),e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx("a",{href:`/account/${a}/record/${s}/${f}`,className:"px-3 py-1.5 bg-primary/10 text-primary text-xs font-medium rounded-lg hover:bg-primary/20 transition-colors",children:"Voir"}),e.jsx("a",{href:`/account/${a}/record/${s}/${f}/edit`,className:"px-3 py-1.5 bg-primary text-white text-xs font-medium rounded-lg hover:bg-primary/90 transition-colors",children:"Modifier"})]})]})})]})]}),document.body)}function Fe(t,o=.1){const a=/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(t);return a?`rgba(${parseInt(a[1],16)}, ${parseInt(a[2],16)}, ${parseInt(a[3],16)}, ${o})`:`rgba(128,128,128,${o})`}function Xe({record:t,accountNumber:o,entitySlug:a,isDragging:s=!1,onQuickView:u,cardTemplate:j,entityData:m}){var H;const S=r.useRef(null),p=r.useRef(!1),f=String(((H=t._id)==null?void 0:H.$oid)||t._id),{attributes:v,listeners:x,setNodeRef:W,transform:C,transition:$,isDragging:D}=wt({id:f}),K={transform:jt.Transform.toString(C),transition:$,opacity:s||D?.7:1,touchAction:"manipulation"},M=P=>{S.current={x:P.clientX,y:P.clientY,time:Date.now()},p.current=!1},g=P=>{if(S.current){const q=Math.abs(P.clientX-S.current.x),c=Math.abs(P.clientY-S.current.y);(q>5||c>5)&&(p.current=!0)}},U=P=>{if(!S.current)return;const q=Date.now()-S.current.time;!p.current&&q<400&&u&&!P.target.closest("a, button")&&setTimeout(()=>u(t),50),S.current=null};return e.jsx("div",{ref:W,style:K,className:`kanban-card cursor-pointer transition-all group ${s||D?"shadow-lg ring-2 ring-primary/30 cursor-move":""}`,"data-dnd":"card",onPointerDown:M,onPointerMove:g,onPointerUp:U,...v,...x,children:e.jsx(Ke,{record:t,cardTemplate:j,context:"kanban",entityData:m,accountNumber:o,entitySlug:a,className:"bg-white hover:shadow-md border border-gray-200/80 dark:border-0 dark:bg-dark/40 dark:hover:bg-dark/60",style:{borderRadius:8}})})}function _t({column:t,records:o,recordIds:a,accountNumber:s,entitySlug:u,onQuickView:j,cardTemplate:m,entityData:S}){const{setNodeRef:p,isOver:f}=vt({id:String(t.id)}),v=typeof document<"u"&&document.documentElement.classList.contains("dark"),x=Fe(t.color,v?.12:.06),W=Fe(t.color,v?.3:.15);return e.jsxs("div",{ref:p,className:`flex-none rounded-lg overflow-hidden transition-all ${f?"ring-2 ring-primary/50 ring-offset-2":""}`,style:{width:"300px",maxWidth:"320px",backgroundColor:f?Fe(t.color,.15):x,border:`1px solid ${W}`},"data-dnd":"column",children:[e.jsx("div",{style:{height:"4px",backgroundColor:t.color}}),e.jsx("div",{className:"px-3 py-2 flex justify-between items-center",children:e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx("span",{className:"inline-flex items-center gap-1.5 px-2 py-0 rounded text-xs font-semibold uppercase tracking-wide",style:{backgroundColor:t.color,color:"#fff"},children:t.title}),e.jsx("span",{className:"text-xs text-gray-500 font-medium",children:o.length})]})}),e.jsx("div",{className:"px-2 pb-3",children:e.jsx(kt,{items:a,strategy:yt,children:e.jsx("div",{className:`space-y-2 min-h-[80px] rounded-lg transition-all ${f?"bg-primary/5 p-2":""}`,children:o.length===0?e.jsx("div",{className:"text-xs text-gray-300 dark:text-gray-600 text-center py-8 italic",children:"Aucun enregistrement"}):o.map(C=>{var $;return e.jsx(Xe,{record:C,accountNumber:s,entitySlug:u,onQuickView:j,cardTemplate:m,entityData:S},(($=C._id)==null?void 0:$.$oid)||C._id)})})})}),e.jsx("div",{className:"px-3 pb-3",children:e.jsxs("button",{type:"button",className:"flex items-center gap-1 text-xs text-gray-400 hover:text-primary transition-colors",children:[e.jsx("svg",{width:"14",height:"14",viewBox:"0 0 24 24",fill:"none",children:e.jsx("path",{d:"M12 6V18M6 12H18",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round"})}),"Ajouter"]})})]})}function It({records:t,columns:o,accountNumber:a,entitySlug:s,viewId:u,entityData:j}){const m=r.useRef(null),S=r.useRef(null),[p,f]=r.useState(t),[v,x]=r.useState({}),[W,C]=r.useState(null),[$,D]=r.useState(null),K=r.useCallback(b=>{D(b)},[]),[M,g]=r.useState(null);r.useEffect(()=>{var F;if(!(j!=null&&j._id))return;const b=((F=j._id)==null?void 0:F.$oid)||j._id;fetch(`/account/${a}/api/entity/${b}/cards/default/kanban`,{credentials:"include"}).then(Y=>Y.json()).then(Y=>{Y.success&&Y.card&&g(Y.card)}).catch(()=>{})},[j==null?void 0:j._id,a]),r.useEffect(()=>{f(t)},[t]);const U=r.useRef(!1),H=r.useRef(0),P=r.useRef(0),q=r.useCallback(b=>{if(W||b.button!==0||b.target.closest('a, button, .dropdown, [data-dnd="card"]'))return;const F=m.current;F&&(U.current=!0,H.current=b.pageX-F.offsetLeft,P.current=F.scrollLeft,F.style.cursor="grabbing")},[W]),c=r.useCallback(b=>{if(W){U.current=!1;return}if(!U.current)return;b.preventDefault();const F=m.current;if(!F)return;const i=(b.pageX-F.offsetLeft-H.current)*1.5;F.scrollLeft=P.current-i},[W]),h=r.useCallback(()=>{U.current=!1,m.current&&(m.current.style.cursor="grab")},[]),G=ct(Te(bt,{activationConstraint:{distance:8}}),Te(gt,{activationConstraint:{delay:500,tolerance:10}}),Te(mt,{coordinateGetter:ht})),V=r.useMemo(()=>{if(j){const i=j.statusClassification;if(i&&i.options&&i.options.length>0){const N=i.options.map(z=>({id:String(z._id),title:z.label,color:z.color||"#6366f1",optionId:String(z._id)}));return N.push({id:"__none__",title:"Sans Statut",color:"#9ca3af",optionId:"none"}),{classId:String(i._id),columns:N}}const k=j.classifications||[];for(const N of k)if(N.options&&N.options.length>0){const z=N.options.map(X=>({id:String(X._id),title:X.label,color:X.color||"#6366f1",optionId:String(X._id)}));return z.push({id:"__none__",title:"Non classé",color:"#9ca3af",optionId:"none"}),{classId:String(N._id),columns:z}}}const b={};p.forEach(i=>{(i.classificationValues||[]).forEach(k=>{var l,Z;const N=((l=k.classificationId)==null?void 0:l.$oid)||k.classificationId||k.classification_id;if(!N)return;b[N]||(b[N]={count:0,options:{}}),b[N].count++;const z=k.optionLabel||k.label||"Sans label",X=k.optionColor||k.color||"#9ca3af",Q=((Z=k.optionId)==null?void 0:Z.$oid)||k.optionId||z;b[N].options[z]||(b[N].options[z]={label:z,color:X,optionId:String(Q),count:0}),b[N].options[z].count++})});let F=null,Y=0;if(Object.entries(b).forEach(([i,k])=>{k.count>Y&&(Y=k.count,F=i)}),F&&b[F]){const k=Object.values(b[F].options).map(N=>({id:N.label,title:N.label,color:N.color,optionId:N.optionId}));return k.push({id:"__none__",title:"Sans classification",color:"#9ca3af",optionId:"none"}),{classId:F,columns:k}}return{classId:null,columns:[{id:"__all__",title:"Tous les enregistrements",color:"#4361ee",optionId:null}]}},[p,j]),B=r.useMemo(()=>{const b={};if(V.columns.forEach(F=>b[F.id]=[]),!V.classId)b.__all__=p;else{const F={};V.columns.forEach(i=>{i.optionId&&i.optionId!=="none"&&(F[String(i.optionId)]=i.id)});const Y={};V.columns.forEach(i=>{Y[i.title]=i.id}),p.forEach(i=>{var z;const N=(i.classificationValues||[]).find(X=>{var l;return(((l=X.classificationId)==null?void 0:l.$oid)||X.classificationId||X.classification_id)===V.classId});if(N){const X=String(((z=N.optionId)==null?void 0:z.$oid)||N.optionId||""),Q=F[X];if(Q&&b[Q])b[Q].push(i);else{const l=N.optionLabel||N.label||"Sans label";b[l]?b[l].push(i):b.__none__&&b.__none__.push(i)}}else b.__none__&&b.__none__.push(i)})}for(const F of Object.keys(b)){const Y=v[F]||[];Y.length&&b[F].sort((i,k)=>{var X,Q;const N=Y.indexOf(String(((X=i._id)==null?void 0:X.$oid)||i._id)),z=Y.indexOf(String(((Q=k._id)==null?void 0:Q.$oid)||k._id));return N===-1&&z===-1?0:N===-1?1:z===-1?-1:N-z})}return b},[V,p,v]),J=r.useMemo(()=>{const b={};for(const F of V.columns)b[F.id]=(B[F.id]||[]).map(Y=>{var i;return String(((i=Y._id)==null?void 0:i.$oid)||Y._id)});return b},[V.columns,B]),L=r.useCallback(b=>{var Y;const F=String(b);for(const i of Object.keys(J))if((Y=J[i])!=null&&Y.includes(F))return i;return null},[J]),E=r.useMemo(()=>W&&p.find(b=>{var F;return String(((F=b._id)==null?void 0:F.$oid)||b._id)===String(W)})||null,[W,p]),_=r.useCallback(b=>{u&&(S.current&&clearTimeout(S.current),S.current=setTimeout(async()=>{try{await fetch(`/account/${a}/api/user/view-preferences`,{method:"POST",headers:{"Content-Type":"application/json"},credentials:"include",body:JSON.stringify({viewId:u,preferences:{kanban:{orderByColumn:b}}})})}catch{}},250))},[a,u]),se=r.useCallback(async(b,F)=>{if(!V.classId)return;const Y=V.columns.find(i=>i.id===F);if(Y)try{await fetch(`/account/${a}/api/record/update-classification`,{method:"POST",headers:{"Content-Type":"application/json"},credentials:"include",body:JSON.stringify({recordId:b,classificationId:V.classId,optionId:Y.optionId==="none"?null:Y.optionId})})}catch(i){console.error("[RecordsKanban] Update error:",i)}},[a,V]),oe=b=>{C(String(b.active.id))},de=()=>{C(null)},pe=b=>{const{active:F,over:Y}=b;if(C(null),!Y)return;const i=String(F.id),k=String(Y.id),N=L(i),z=V.columns.some(R=>String(R.id)===k)?k:L(k);if(!N||!z)return;if(N===z){const R=J[N]||[],ce=R.indexOf(i),A=R.indexOf(k);if(ce===-1||A===-1||ce===A)return;const fe=xt(R,ce,A),ve={...v,[N]:fe};x(ve),_(ve);return}const X=[...J[N]||[]].filter(R=>R!==i),Q=[...J[z]||[]],Z=V.columns.some(R=>String(R.id)===k)?Q.length:Math.max(0,Q.indexOf(k));Q.splice(Z,0,i);const ee={...v,[N]:X,[z]:Q};if(x(ee),_(ee),V.classId){const R=V.columns.find(ce=>ce.id===z);f(ce=>ce.map(A=>{var ve;if(String(((ve=A._id)==null?void 0:ve.$oid)||A._id)!==i)return A;const fe=(A.classificationValues||[]).filter(d=>{var ie;return(((ie=d.classificationId)==null?void 0:ie.$oid)||d.classificationId||d.classification_id)!==V.classId});return z!=="__none__"&&R&&fe.push({classificationId:V.classId,optionId:R.optionId,optionLabel:R.title,optionColor:R.color}),{...A,classificationValues:fe}})),se(i,z)}};return e.jsxs("div",{ref:m,className:"h-full overflow-x-auto overflow-y-auto",style:{cursor:"grab",userSelect:"none",WebkitUserSelect:"none"},onMouseDown:q,onMouseMove:c,onMouseUp:h,onMouseLeave:h,children:[e.jsxs(ut,{sensors:G,collisionDetection:pt,autoScroll:{threshold:{x:.15,y:.15},interval:10,acceleration:5},onDragStart:oe,onDragEnd:pe,onDragCancel:de,children:[e.jsx("div",{style:{display:"flex",flexWrap:"nowrap",alignItems:"flex-start",gap:"1.25rem",padding:"0.5rem",width:"max-content",minHeight:"100%"},children:V.columns.map(b=>{const F=B[b.id]||[];return b.id==="__none__"&&F.length===0?null:e.jsx(_t,{column:b,records:F,recordIds:J[b.id]||[],accountNumber:a,entitySlug:s,onQuickView:K,cardTemplate:M,entityData:j},b.id)})}),e.jsx(ft,{children:E?e.jsx(Xe,{record:E,accountNumber:a,entitySlug:s,isDragging:!0,cardTemplate:M,entityData:j}):null})]}),$&&e.jsx(Mt,{record:$,columns:o,accountNumber:a,entitySlug:s,onClose:()=>D(null)})]})}const Pe=[{bg:"bg-primary-light shadow-primary",text:"text-primary",dot:"#4361ee"},{bg:"bg-info-light shadow-info",text:"text-info",dot:"#2196f3"},{bg:"bg-warning-light shadow-warning",text:"text-warning",dot:"#e2a03f"},{bg:"bg-danger-light shadow-danger",text:"text-danger",dot:"#e7515a"},{bg:"bg-success-light shadow-success",text:"text-success",dot:"#00ab55"},{bg:"bg-secondary-light shadow-secondary",text:"text-secondary",dot:"#805dca"}];function $t(t){return Pe[t%Pe.length]}function Rt(){return e.jsxs("svg",{width:"24",height:"24",viewBox:"0 0 24 24",fill:"none",className:"h-5 w-5 rotate-90 opacity-70 hover:opacity-100",children:[e.jsx("circle",{cx:"5",cy:"12",r:"2",stroke:"currentColor",strokeWidth:"1.5"}),e.jsx("circle",{opacity:"0.5",cx:"12",cy:"12",r:"2",stroke:"currentColor",strokeWidth:"1.5"}),e.jsx("circle",{cx:"19",cy:"12",r:"2",stroke:"currentColor",strokeWidth:"1.5"})]})}function Wt(){return e.jsxs("svg",{width:"24",height:"24",viewBox:"0 0 24 24",fill:"none",className:"h-4 w-4 ltr:mr-3 rtl:ml-3",children:[e.jsx("path",{d:"M15.2869 3.15178L14.3601 4.07866L5.83882 12.5999C5.26166 13.1771 4.97308 13.4656 4.7249 13.7838C4.43213 14.1592 4.18114 14.5653 3.97634 14.995C3.80273 15.3593 3.67368 15.7465 3.41556 16.5208L2.32181 19.8021L2.05445 20.6042C1.92743 20.9852 2.0266 21.4053 2.31063 21.6894C2.59466 21.9734 3.01478 22.0726 3.39584 21.9456L4.19792 21.6782L7.47918 20.5844C8.25353 20.3263 8.6407 20.1973 9.00498 20.0237C9.43469 19.8189 9.84082 19.5679 10.2162 19.2751C10.5344 19.0269 10.8229 18.7383 11.4001 18.1612L19.9213 9.63993L20.8482 8.71306C22.3839 7.17735 22.3839 4.68748 20.8482 3.15178C19.3125 1.61607 16.8226 1.61607 15.2869 3.15178Z",stroke:"currentColor",strokeWidth:"1.5"}),e.jsx("path",{opacity:"0.5",d:"M14.36 4.07812C14.36 4.07812 14.4759 6.04774 16.2138 7.78564C17.9517 9.52354 19.9213 9.6394 19.9213 9.6394M4.19789 21.6777L2.32178 19.8015",stroke:"currentColor",strokeWidth:"1.5"})]})}function Et(){return e.jsxs("svg",{width:"24",height:"24",viewBox:"0 0 24 24",fill:"none",className:"h-4.5 w-4.5 ltr:mr-3 rtl:ml-3",children:[e.jsx("path",{opacity:"0.5",d:"M3.27489 15.2957C2.42496 14.1915 2 13.6394 2 12C2 10.3606 2.42496 9.80853 3.27489 8.70433C4.97196 6.49956 7.81811 4 12 4C16.1819 4 19.028 6.49956 20.7251 8.70433C21.575 9.80853 22 10.3606 22 12C22 13.6394 21.575 14.1915 20.7251 15.2957C19.028 17.5004 16.1819 20 12 20C7.81811 20 4.97196 17.5004 3.27489 15.2957Z",stroke:"currentColor",strokeWidth:"1.5"}),e.jsx("path",{d:"M15 12C15 13.6569 13.6569 15 12 15C10.3431 15 9 13.6569 9 12C9 10.3431 10.3431 9 12 9C13.6569 9 15 10.3431 15 12Z",stroke:"currentColor",strokeWidth:"1.5"})]})}function Tt({filled:t}){return e.jsx("svg",{width:"24",height:"24",viewBox:"0 0 24 24",fill:"none",className:`h-4.5 w-4.5 group-hover:fill-warning ${t?"fill-warning":""}`,children:e.jsx("path",{d:"M9.15316 5.40838C10.4198 3.13613 11.0531 2 12 2C12.9469 2 13.5802 3.13612 14.8468 5.40837L15.1745 5.99623C15.5345 6.64193 15.7144 6.96479 15.9951 7.17781C16.2757 7.39083 16.6251 7.4699 17.3241 7.62805L17.9605 7.77203C20.4201 8.32856 21.65 8.60682 21.9426 9.54773C22.2352 10.4886 21.3968 11.4691 19.7199 13.4299L19.2861 13.9372C18.8096 14.4944 18.5713 14.773 18.4641 15.1177C18.357 15.4624 18.393 15.8341 18.465 16.5776L18.5306 17.2544C18.7841 19.8706 18.9109 21.1787 18.1449 21.7602C17.3788 22.3417 16.2273 21.8115 13.9243 20.7512L13.3285 20.4768C12.6741 20.1755 12.3469 20.0248 12 20.0248C11.6531 20.0248 11.3259 20.1755 10.6715 20.4768L10.0757 20.7512C7.77268 21.8115 6.62118 22.3417 5.85515 21.7602C5.08912 21.1787 5.21588 19.8706 5.4694 17.2544L5.53498 16.5776C5.60703 15.8341 5.64305 15.4624 5.53586 15.1177C5.42868 14.773 5.19043 14.4944 4.71392 13.9372L4.2801 13.4299C2.60325 11.4691 1.76482 10.4886 2.05742 9.54773C2.35002 8.60682 3.57986 8.32856 6.03954 7.77203L6.67589 7.62805C7.37485 7.4699 7.72433 7.39083 8.00494 7.17781C8.28555 6.96479 8.46553 6.64194 8.82547 5.99623L9.15316 5.40838Z",stroke:"currentColor",strokeWidth:"1.5"})})}function Ft(){return e.jsx("svg",{width:"24",height:"24",viewBox:"0 0 24 24",fill:"none",className:"h-3 w-3 rotate-45",children:e.jsx("path",{d:"M2 12C2 7.28595 2 4.92893 3.46447 3.46447C4.92893 2 7.28595 2 12 2C16.714 2 19.0711 2 20.5355 3.46447C22 4.92893 22 7.28595 22 12C22 16.714 22 19.0711 20.5355 20.5355C19.0711 22 16.714 22 12 22C7.28595 22 4.92893 22 3.46447 20.5355C2 19.0711 2 16.714 2 12Z",stroke:"currentColor",strokeWidth:"1.5"})})}function zt({record:t,accountNumber:o,entitySlug:a}){var S;const[s,u]=r.useState(!1),j=r.useRef(null);r.useEffect(()=>{if(!s)return;const p=f=>{j.current&&!j.current.contains(f.target)&&u(!1)};return document.addEventListener("mousedown",p),()=>document.removeEventListener("mousedown",p)},[s]);const m=((S=t._id)==null?void 0:S.$oid)||t._id;return e.jsxs("div",{ref:j,className:"dropdown relative",children:[e.jsx("button",{type:"button",className:"text-primary",onClick:p=>{p.preventDefault(),p.stopPropagation(),u(!s)},children:e.jsx(Rt,{})}),s&&e.jsxs("ul",{className:"absolute z-50 min-w-[140px] rounded-md bg-white dark:bg-[#1b2e4b] shadow-lg border dark:border-gray-700 py-1 text-sm font-medium ltr:right-0 rtl:left-0 top-full mt-1",style:{animation:"fadeIn 0.15s ease-out"},children:[e.jsx("li",{children:e.jsxs("a",{href:`/account/${o}/record/${a}/${m}/edit`,className:"flex items-center px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 w-full",onClick:p=>p.stopPropagation(),children:[e.jsx(Wt,{})," Edit"]})}),e.jsx("li",{children:e.jsxs("a",{href:`/account/${o}/record/${a}/${m}`,className:"flex items-center px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 w-full",onClick:p=>p.stopPropagation(),children:[e.jsx(Et,{})," View"]})})]})]})}function Ot({record:t,accountNumber:o,entitySlug:a,style:s,favorites:u,onToggleFav:j}){var W,C;const m=u[t._id]||!1,S=((W=t._id)==null?void 0:W.$oid)||t._id,p=t.referenceTitle||t.title||t.computedTitle||"Sans titre",f=t.createdAt?new Date(t.createdAt).toLocaleDateString("fr-FR",{day:"2-digit",month:"short",year:"numeric"}):"",v=(t.customFields||[]).find($=>{var D,K,M,g,U,H;return((K=(D=$.field_id)==null?void 0:D.label)==null?void 0:K.toLowerCase().includes("descri"))||((g=(M=$.field_id)==null?void 0:M.label)==null?void 0:g.toLowerCase().includes("note"))||((H=(U=$.field_id)==null?void 0:U.label)==null?void 0:H.toLowerCase().includes("contenu"))}),x=(v==null?void 0:v.value)||t.description||"";return(t.classificationValues||[]).filter($=>$.optionLabel).map($=>({label:$.optionLabel,color:$.optionColor||$.color||s.dot})),e.jsxs("div",{className:`panel pb-12 relative ${s.bg}`,children:[e.jsxs("div",{className:"min-h-[142px]",children:[e.jsxs("div",{className:"flex justify-between",children:[e.jsxs("div",{className:"flex w-max items-center",children:[e.jsx("div",{className:"flex-none",children:e.jsx("div",{className:"rounded-full bg-gray-300 p-2 dark:bg-gray-700",children:e.jsxs("svg",{width:"24",height:"24",viewBox:"0 0 24 24",fill:"none",className:"h-4.5 w-4.5",children:[e.jsx("circle",{cx:"12",cy:"6",r:"4",stroke:"currentColor",strokeWidth:"1.5"}),e.jsx("ellipse",{opacity:"0.5",cx:"12",cy:"17",rx:"7",ry:"4",stroke:"currentColor",strokeWidth:"1.5"})]})})}),e.jsxs("div",{className:"ltr:ml-2 rtl:mr-2",children:[e.jsx("div",{className:"font-semibold",children:((C=t.createdBy)==null?void 0:C.name)||"Utilisateur"}),e.jsx("div",{className:"text-sx text-white-dark",children:f})]})]}),e.jsx(zt,{record:t,accountNumber:o,entitySlug:a})]}),e.jsxs("div",{children:[e.jsx("h4",{className:"mt-4 font-semibold",children:e.jsx("a",{href:`/account/${o}/record/${a}/${S}`,className:"hover:text-primary transition-colors",children:p})}),x&&e.jsx("p",{className:"mt-2 text-white-dark line-clamp-3",children:x})]})]}),e.jsx("div",{className:"absolute bottom-5 left-0 w-full px-5",children:e.jsxs("div",{className:"mt-2 flex items-center justify-between",children:[e.jsx("div",{className:s.text,children:e.jsx(Ft,{})}),e.jsx("div",{className:"flex items-center gap-2",children:e.jsx("button",{type:"button",className:"group text-warning ltr:ml-2 rtl:mr-2",onClick:$=>{$.preventDefault(),$.stopPropagation(),j(t._id)},children:e.jsx(Tt,{filled:m})})})]})})]})}function Dt({records:t,accountNumber:o,entitySlug:a}){const[s,u]=r.useState({}),j=r.useCallback(m=>{u(S=>({...S,[m]:!S[m]}))},[]);return e.jsx("div",{className:"h-full overflow-y-auto",children:e.jsx("div",{className:"grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",children:t.length===0?e.jsx("div",{className:"col-span-full text-center py-20 text-gray-400 dark:text-gray-600 italic",children:"Aucun enregistrement"}):t.map((m,S)=>{var p;return e.jsx(Ot,{record:m,accountNumber:o,entitySlug:a,style:$t(S),favorites:s,onToggleFav:j},((p=m._id)==null?void 0:p.$oid)||m._id)})})})}const De={Planifié:{className:"primary",bg:"#4361ee",text:"#fff"},Confirmé:{className:"info",bg:"#2196f3",text:"#fff"},Terminé:{className:"success",bg:"#00ab55",text:"#fff"},Annulé:{className:"danger",bg:"#e7515a",text:"#fff"},"Non présenté":{className:"warning",bg:"#e2a03f",text:"#fff"}},Ie=[{className:"primary",bg:"#4361ee",text:"#fff"},{className:"info",bg:"#2196f3",text:"#fff"},{className:"success",bg:"#00ab55",text:"#fff"},{className:"danger",bg:"#e7515a",text:"#fff"},{className:"warning",bg:"#e2a03f",text:"#fff"}];function Vt(t,o){if(o){const a=(t.customFields||[]).find(s=>{var j,m,S;return(((m=(j=s.field_id)==null?void 0:j._id)==null?void 0:m.toString())||((S=s.field_id)==null?void 0:S.toString()))===o});if(a!=null&&a.value){const s=new Date(a.value);if(!isNaN(s))return s}}if(t.date){const a=new Date(t.date);if(!isNaN(a))return a}if(t.createdAt){const a=new Date(t.createdAt);if(!isNaN(a))return a}return null}function At(t,o){if(!o)return 30;const a=(t.customFields||[]).find(s=>{var j,m,S;return(((m=(j=s.field_id)==null?void 0:j._id)==null?void 0:m.toString())||((S=s.field_id)==null?void 0:S.toString()))===o});return parseInt(a==null?void 0:a.value)||30}function Bt(t){const o=t.classificationValues||[];for(const a of o)if(a.label||a.optionLabel)return a.label||a.optionLabel;return null}function Pt(t){const o=["Dimanche","Lundi","Mardi","Mercredi","Jeudi","Vendredi","Samedi"],a=["janvier","février","mars","avril","mai","juin","juillet","août","septembre","octobre","novembre","décembre"];return`${o[t.getDay()]} ${t.getDate()} ${a[t.getMonth()]} ${t.getFullYear()}`}function Ht(t){const o=t.getFullYear(),a=String(t.getMonth()+1).padStart(2,"0"),s=String(t.getDate()).padStart(2,"0"),u=String(t.getHours()).padStart(2,"0"),j=String(t.getMinutes()).padStart(2,"0");return`${o}-${a}-${s}T${u}:${j}`}function Jt({message:t,type:o="success",onClose:a}){r.useEffect(()=>{const j=setTimeout(a,3e3);return()=>clearTimeout(j)},[a]);const s={success:{bg:"#00ab55",icon:"✓"},error:{bg:"#e7515a",icon:"✕"},info:{bg:"#4361ee",icon:"ℹ"}},u=s[o]||s.info;return e.jsxs("div",{style:{position:"fixed",bottom:24,right:24,zIndex:1e4,display:"flex",alignItems:"center",gap:10,padding:"12px 20px",borderRadius:12,backgroundColor:u.bg,color:"#fff",boxShadow:"0 8px 32px rgba(0,0,0,0.18)",animation:"slideInRight 0.3s ease",fontSize:13,fontWeight:600},children:[e.jsx("span",{style:{fontSize:16},children:u.icon}),t]})}function Ut({isOpen:t,onClose:o,onSave:a,initialDate:s,entityData:u,accountNumber:j}){const[m,S]=r.useState(""),[p,f]=r.useState(""),[v,x]=r.useState("30"),[W,C]=r.useState(!1),$=r.useRef(null);if(r.useEffect(()=>{t&&s&&(f(Ht(s)),S(""),x("30"),setTimeout(()=>{var M;return(M=$.current)==null?void 0:M.focus()},100))},[t,s]),!t)return null;const D=async M=>{if(M.preventDefault(),!!m.trim()){C(!0);try{await a({title:m.trim(),date:p,duration:parseInt(v)}),o()}catch(g){console.error(g)}C(!1)}},K=[15,30,45,60,90,120];return e.jsx("div",{style:{position:"fixed",inset:0,zIndex:9999,backgroundColor:"rgba(0,0,0,0.4)",backdropFilter:"blur(4px)",display:"flex",alignItems:"center",justifyContent:"center",animation:"fadeIn 0.2s ease"},onClick:M=>{M.target===M.currentTarget&&o()},children:e.jsxs("div",{style:{backgroundColor:"#fff",borderRadius:16,width:"100%",maxWidth:440,boxShadow:"0 24px 80px rgba(0,0,0,0.2)",animation:"slideUp 0.3s ease",overflow:"hidden"},children:[e.jsxs("div",{style:{padding:"20px 24px 16px",display:"flex",alignItems:"center",justifyContent:"space-between",borderBottom:"1px solid #f0f0f0"},children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:10},children:[e.jsx("div",{style:{width:36,height:36,borderRadius:10,background:"linear-gradient(135deg, #4361ee, #805cf6)",display:"flex",alignItems:"center",justifyContent:"center"},children:e.jsx("svg",{viewBox:"0 0 24 24",fill:"none",style:{width:18,height:18,color:"#fff"},children:e.jsx("path",{d:"M12 5V19M5 12H19",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round"})})}),e.jsxs("div",{children:[e.jsx("h3",{style:{margin:0,fontSize:16,fontWeight:700,color:"#1a1a2e"},children:"Nouveau rendez-vous"}),e.jsx("p",{style:{margin:0,fontSize:11,color:"#888",marginTop:2},children:s?Pt(s):""})]})]}),e.jsx("button",{onClick:o,style:{border:"none",background:"#f5f5f5",borderRadius:8,width:32,height:32,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer"},children:e.jsx("svg",{viewBox:"0 0 24 24",fill:"none",style:{width:16,height:16,color:"#666"},children:e.jsx("path",{d:"M18 6L6 18M6 6L18 18",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round"})})})]}),e.jsxs("form",{onSubmit:D,style:{padding:"20px 24px 24px"},children:[e.jsxs("div",{style:{marginBottom:16},children:[e.jsx("label",{style:{display:"block",fontSize:12,fontWeight:600,color:"#555",marginBottom:6},children:"Titre *"}),e.jsx("input",{ref:$,type:"text",value:m,onChange:M=>S(M.target.value),placeholder:"Ex: Consultation Dr. Martin",required:!0,style:{width:"100%",padding:"10px 14px",border:"1.5px solid #e0e0e0",borderRadius:10,fontSize:14,outline:"none",transition:"border 0.2s",boxSizing:"border-box"},onFocus:M=>M.target.style.borderColor="#4361ee",onBlur:M=>M.target.style.borderColor="#e0e0e0"})]}),e.jsxs("div",{style:{marginBottom:16},children:[e.jsx("label",{style:{display:"block",fontSize:12,fontWeight:600,color:"#555",marginBottom:6},children:"Date et heure"}),e.jsx("input",{type:"datetime-local",value:p,onChange:M=>f(M.target.value),style:{width:"100%",padding:"10px 14px",border:"1.5px solid #e0e0e0",borderRadius:10,fontSize:14,outline:"none",transition:"border 0.2s",boxSizing:"border-box"},onFocus:M=>M.target.style.borderColor="#4361ee",onBlur:M=>M.target.style.borderColor="#e0e0e0"})]}),e.jsxs("div",{style:{marginBottom:20},children:[e.jsx("label",{style:{display:"block",fontSize:12,fontWeight:600,color:"#555",marginBottom:8},children:"Durée"}),e.jsx("div",{style:{display:"flex",flexWrap:"wrap",gap:6},children:K.map(M=>e.jsx("button",{type:"button",onClick:()=>x(String(M)),style:{padding:"6px 14px",borderRadius:20,fontSize:12,fontWeight:600,border:v===String(M)?"1.5px solid #4361ee":"1.5px solid #e0e0e0",backgroundColor:v===String(M)?"#4361ee":"#fff",color:v===String(M)?"#fff":"#555",cursor:"pointer",transition:"all 0.2s"},children:M<60?`${M} min`:`${M/60}h`},M))})]}),e.jsxs("div",{style:{display:"flex",gap:10,justifyContent:"flex-end"},children:[e.jsx("button",{type:"button",onClick:o,style:{padding:"10px 20px",borderRadius:10,fontSize:13,fontWeight:600,border:"1.5px solid #e0e0e0",backgroundColor:"#fff",color:"#555",cursor:"pointer",transition:"all 0.2s"},children:"Annuler"}),e.jsx("button",{type:"submit",disabled:W||!m.trim(),style:{padding:"10px 24px",borderRadius:10,fontSize:13,fontWeight:600,border:"none",background:m.trim()?"linear-gradient(135deg, #4361ee, #805cf6)":"#ccc",color:"#fff",cursor:m.trim()?"pointer":"not-allowed",transition:"all 0.2s",opacity:W?.7:1},children:W?"Création...":"Créer le RDV"})]})]})]})})}function Yt({event:t,position:o,onClose:a,onEdit:s,onDelete:u,accountNumber:j,entitySlug:m,cardTemplate:S}){var D,K;const p=r.useRef(null);if(r.useEffect(()=>{const M=g=>{p.current&&!p.current.contains(g.target)&&a()};return document.addEventListener("mousedown",M),()=>document.removeEventListener("mousedown",M)},[a]),!t)return null;const f=t.start?new Date(t.start):null,v=t.end?new Date(t.end):null,x=(D=t.extendedProps)==null?void 0:D.status,W=x?De[x]:null,$={_id:((K=t.extendedProps)==null?void 0:K.recordId)||t.id,referenceTitle:t.title,_start:f,_end:v,classificationValues:x?[{optionLabel:x,optionColor:W?W.bg:"#4361ee"}]:[],createdAt:f,...t.extendedProps};return e.jsx("div",{ref:p,style:{position:"fixed",top:Math.min(o.y,window.innerHeight-280),left:Math.min(o.x,window.innerWidth-340),zIndex:9998,width:320,backgroundColor:"#fff",borderRadius:14,boxShadow:"0 16px 64px rgba(0,0,0,0.18)",animation:"slideUp 0.2s ease",overflow:"hidden"},children:e.jsx(Ke,{record:$,cardTemplate:S,context:"calendar",accountNumber:j,entitySlug:m,callbacks:{onClose:a},style:{borderRadius:0}})})}function Zt({records:t=[],columns:o=[],accountNumber:a,entitySlug:s,entityData:u}){var pe,b,F,Y;const j=r.useRef(null),m=r.useRef(null),[S,p]=r.useState(!1),[f,v]=r.useState(!1),[x,W]=r.useState(null),[C,$]=r.useState(null),[D,K]=r.useState({x:0,y:0}),[M,g]=r.useState(null),[U,H]=r.useState(t);r.useEffect(()=>{H(t)},[t]);const[P,q]=r.useState(null);r.useEffect(()=>{var k;if(!(u!=null&&u._id))return;const i=((k=u._id)==null?void 0:k.$oid)||u._id;fetch(`/account/${a}/api/entity/${i}/cards/default/calendar`,{credentials:"include"}).then(N=>N.json()).then(N=>{N.success&&N.card&&q(N.card)}).catch(()=>{})},[u==null?void 0:u._id,a]);const{dateFieldId:c,durationFieldId:h}=r.useMemo(()=>{var l,Z,ee,R,ce;if(!u)return{dateFieldId:null,durationFieldId:null};const i=u.customFields||[],k=i.filter(A=>A.type==="date"||A.inputType==="date"||A.inputType==="datetime-local"),N=k.find(A=>/^date/i.test(A.name||"")||/date/i.test(A.label||"")),z=((l=N==null?void 0:N._id)==null?void 0:l.toString())||((ee=(Z=k[0])==null?void 0:Z._id)==null?void 0:ee.toString())||null,Q=((ce=(R=i.filter(A=>A.type==="number"&&(/dur/i.test(A.name||"")||/dur/i.test(A.label||"")))[0])==null?void 0:R._id)==null?void 0:ce.toString())||null;return{dateFieldId:z,durationFieldId:Q}},[u]),G=(pe=u==null?void 0:u._id)==null?void 0:pe.toString(),V=(F=(b=u==null?void 0:u.statusClassification)==null?void 0:b._id)==null?void 0:F.toString(),B=((Y=u==null?void 0:u.statusClassification)==null?void 0:Y.options)||[],J=B.find(i=>/planif/i.test(i.label))||B[0],L=r.useMemo(()=>U.map((i,k)=>{const N=Vt(i,c);if(!N)return null;const z=At(i,h),X=new Date(N.getTime()+z*6e4),Q=i.referenceTitle||i.computedTitle||i.title||"Sans titre",l=Bt(i),Z=l&&De[l]||Ie[k%Ie.length];return{id:i._id,title:Q,start:N.toISOString(),end:X.toISOString(),className:Z.className,extendedProps:{recordId:i._id,status:l,entitySlug:s,accountNumber:a,dateFieldId:c,durationFieldId:h}}}).filter(Boolean),[U,c,h,s,a]),E=r.useCallback(i=>{i.jsEvent.preventDefault(),i.jsEvent.stopPropagation();const k=i.el.getBoundingClientRect();K({x:k.right+8,y:k.top}),$(i.event)},[]),_=r.useCallback(i=>{$(null);const k=i.start;W(k),v(!0),m.current&&m.current.unselect()},[]),se=r.useCallback(async i=>{var l,Z,ee;const k=((l=i.event.extendedProps)==null?void 0:l.recordId)||i.event.id,N=i.event.start.toISOString(),z=(Z=i.event.end)==null?void 0:Z.toISOString(),X=(ee=i.event.extendedProps)==null?void 0:ee.dateFieldId;let Q;i.event.start&&i.event.end&&(Q=Math.round((i.event.end-i.event.start)/6e4));try{if(!(await fetch(`/account/${a}/api/records/${k}/date`,{method:"PATCH",headers:{"Content-Type":"application/json"},credentials:"include",body:JSON.stringify({dateFieldId:X,newStart:N,newEnd:z,duration:Q})})).ok)throw new Error("Failed");g({message:"RDV déplacé avec succès",type:"success"})}catch{i.revert(),g({message:"Erreur lors du déplacement",type:"error"})}},[a]),oe=r.useCallback(async i=>{var Q,l;const k=((Q=i.event.extendedProps)==null?void 0:Q.recordId)||i.event.id,N=i.event.start.toISOString(),z=(l=i.event.extendedProps)==null?void 0:l.dateFieldId;let X;i.event.start&&i.event.end&&(X=Math.round((i.event.end-i.event.start)/6e4));try{if(!(await fetch(`/account/${a}/api/records/${k}/date`,{method:"PATCH",headers:{"Content-Type":"application/json"},credentials:"include",body:JSON.stringify({dateFieldId:z,newStart:N,duration:X})})).ok)throw new Error("Failed");g({message:`Durée modifiée (${X} min)`,type:"success"})}catch{i.revert(),g({message:"Erreur lors du redimensionnement",type:"error"})}},[a]),de=r.useCallback(async({title:i,date:k,duration:N})=>{var Q;if(!G||!c)return;const z=await fetch(`/account/${a}/api/entity/${G}/records/quick-add`,{method:"POST",headers:{"Content-Type":"application/json"},credentials:"include",body:JSON.stringify({title:i,dateFieldId:c,dateValue:new Date(k).toISOString(),duration:N,durationFieldId:h,statusOptionId:(Q=J==null?void 0:J._id)==null?void 0:Q.toString(),statusClassificationId:V})});if(!z.ok)throw new Error("Failed to create");const X=await z.json();X.record&&H(l=>[...l,X.record]),g({message:`"${i}" créé avec succès !`,type:"success"})},[a,G,c,h,J,V]);return r.useEffect(()=>{if(typeof FullCalendar<"u"){p(!0);return}const i=setInterval(()=>{typeof FullCalendar<"u"&&(p(!0),clearInterval(i))},200);if(!document.querySelector('script[src*="fullcalendar"]')){const k=document.createElement("link");k.rel="stylesheet",k.href="/assets/css/fullcalendar.min.css",document.head.appendChild(k);const N=document.createElement("script");N.src="/assets/js/fullcalendar.min.js",N.onload=()=>p(!0),document.head.appendChild(N)}return()=>clearInterval(i)},[]),r.useEffect(()=>{if(!S||!j.current||typeof FullCalendar>"u")return;m.current&&m.current.destroy();const i=new FullCalendar.Calendar(j.current,{initialView:"timeGridWeek",headerToolbar:{left:"prev,next today",center:"title",right:"dayGridMonth,timeGridWeek,timeGridDay"},locale:"fr",buttonText:{today:"Aujourd'hui",month:"Mois",week:"Semaine",day:"Jour"},editable:!0,selectable:!0,selectMirror:!0,dayMaxEvents:3,height:"auto",slotDuration:"00:15:00",snapDuration:"00:15:00",slotLabelInterval:"01:00",slotLabelFormat:{hour:"2-digit",minute:"2-digit",hour12:!1},businessHours:{daysOfWeek:[1,2,3,4,5],startTime:"08:00",endTime:"19:00"},scrollTime:"08:00:00",nowIndicator:!0,events:L,eventClick:E,select:_,eventDrop:se,eventResize:oe,eventDidMount:k=>{var z;k.el.style.cursor="pointer",k.el.style.borderRadius="6px",k.el.style.border="none",k.el.style.fontSize="12px",k.el.style.fontWeight="600";const N=(z=k.event.extendedProps)==null?void 0:z.status;k.el.title=k.event.title+(N?` — ${N}`:"")},dayHeaderFormat:{weekday:"short",day:"numeric",month:"short"},allDaySlot:!1});return i.render(),m.current=i,()=>{m.current&&(m.current.destroy(),m.current=null)}},[S,L,E,_,se,oe]),S?!c&&t.length>0?e.jsxs("div",{style:{display:"flex",alignItems:"center",justifyContent:"center",padding:"48px 0",flexDirection:"column"},children:[e.jsxs("svg",{viewBox:"0 0 24 24",fill:"none",style:{width:48,height:48,marginBottom:12,color:"#ccc"},children:[e.jsx("rect",{x:"3",y:"4",width:"18",height:"18",rx:"2",stroke:"currentColor",strokeWidth:"1.5"}),e.jsx("path",{d:"M16 2V6M8 2V6M3 10H21",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"})]}),e.jsx("p",{style:{fontSize:14,fontWeight:500,color:"#888"},children:"Aucun champ date trouvé"}),e.jsx("p",{style:{fontSize:12,color:"#aaa",marginTop:4},children:"Ajoutez un champ date à cette entité"})]}):e.jsxs("div",{style:{position:"relative"},children:[e.jsx("style",{children:`
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
            `}),e.jsxs("div",{style:{marginBottom:12,display:"flex",flexWrap:"wrap",gap:12,alignItems:"center",justifyContent:"space-between",padding:"8px 0"},children:[e.jsx("div",{style:{display:"flex",flexWrap:"wrap",gap:10},children:Object.entries(De).map(([i,k])=>e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:5,fontSize:11,color:"#666"},children:[e.jsx("div",{style:{width:8,height:8,borderRadius:2,backgroundColor:k.bg}}),i]},i))}),e.jsx("div",{style:{fontSize:11,color:"#aaa",fontStyle:"italic"},children:"Cliquer pour ajouter • Glisser pour déplacer"})]}),e.jsx("div",{className:"calendar-wrapper",ref:j}),e.jsx(Ut,{isOpen:f,onClose:()=>v(!1),onSave:de,initialDate:x,entityData:u,accountNumber:a}),C&&e.jsx(Yt,{event:C,position:D,onClose:()=>$(null),accountNumber:a,entitySlug:s,cardTemplate:P}),M&&e.jsx(Jt,{message:M.message,type:M.type,onClose:()=>g(null)})]}):e.jsxs("div",{style:{display:"flex",alignItems:"center",justifyContent:"center",padding:"48px 0"},children:[e.jsx("div",{className:"animate-spin rounded-full h-8 w-8 border-b-2 border-primary"}),e.jsx("span",{style:{marginLeft:12,color:"#888"},children:"Chargement du calendrier..."})]})}const Qe={contains:{label:"Contient",icon:"⊃",types:["text","email","phone","url","textarea","title","relation"]},not_contains:{label:"Ne contient pas",icon:"⊅",types:["text","email","phone","url","textarea","title","relation"]},equals:{label:"Est égal à",icon:"=",types:["text","email","phone","url","number","date","title","select","relation","classification"]},not_equals:{label:"N'est pas égal à",icon:"≠",types:["text","email","phone","url","number","date","title","select","relation","classification"]},starts_with:{label:"Commence par",icon:"A…",types:["text","email","phone","url","title"]},ends_with:{label:"Se termine par",icon:"…Z",types:["text","email","phone","url","title"]},gt:{label:"Supérieur à",icon:">",types:["number","date"]},gte:{label:"Supérieur ou égal",icon:"≥",types:["number","date"]},lt:{label:"Inférieur à",icon:"<",types:["number","date"]},lte:{label:"Inférieur ou égal",icon:"≤",types:["number","date"]},between:{label:"Entre",icon:"↔",types:["number","date"]},is_empty:{label:"Est vide",icon:"∅",types:["text","email","phone","url","number","date","textarea","title","select","relation","classification"]},is_not_empty:{label:"N'est pas vide",icon:"∃",types:["text","email","phone","url","number","date","textarea","title","select","relation","classification"]}};function ze(t){const o=t||"text";return Object.entries(Qe).filter(([a,s])=>s.types.includes(o)).map(([a,s])=>({key:a,...s}))}function He(t){return["number","currency","percent"].includes(t)?"number":["date","datetime"].includes(t)?"date":"text"}function qt({columns:t=[],fieldFilters:o=[],onFieldFiltersChange:a,allRecords:s=[],sidebarFilters:u=[]}){const[j,m]=r.useState(o.length>0),[S,p]=r.useState(null),[f,v]=r.useState(!1),x=r.useRef(null);r.useEffect(()=>{const c=h=>{f&&x.current&&!x.current.contains(h.target)&&v(!1)};return f&&document.addEventListener("mousedown",c),()=>document.removeEventListener("mousedown",c)},[f]);const W=$e.useMemo(()=>{const c={};return u.forEach(h=>{c[`classif:${h.id}`]=h.options||[]}),c},[u]),C=t.filter(c=>c.id!=="actions"),$=r.useCallback(c=>{const h=C.find(L=>L.id===c);if(!h)return;const G=c.startsWith("classif:"),V=ze(h.type),B=G?V.find(L=>L.key==="equals")||V[0]:V.find(L=>L.key==="contains")||V[0],J={fieldId:c,fieldName:h.name,fieldType:h.type||"text",operator:B.key,value:"",value2:"",logic:"AND"};a([...o,J]),v(!1),p(o.length)},[C,o,a]),D=r.useCallback((c,h)=>{const G=o.map((V,B)=>B===c?{...V,...h}:V);a(G)},[o,a]),K=r.useCallback(c=>{const h=o.filter((G,V)=>V!==c);a(h),S===c&&p(null)},[o,a,S]),M=r.useCallback(()=>{a([]),p(null)},[a]),g=c=>["is_empty","is_not_empty"].includes(c),U=c=>c==="between",H=c=>c&&c.startsWith("classif:"),P=c=>W[c]||[],q=(c,h)=>{const V=P(c).find(B=>B.id===h||B.label===h);return V?V.label:h};return e.jsxs("div",{className:"adv-filters-container",children:[e.jsxs("button",{type:"button",className:"adv-filters-header",onClick:()=>m(!j),children:[e.jsxs("div",{className:"adv-filters-header-left",children:[e.jsx("svg",{viewBox:"0 0 24 24",fill:"none",className:"adv-filters-header-icon",children:e.jsx("path",{d:"M22 3H2L10 12.46V19L14 21V12.46L22 3Z",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round"})}),e.jsx("span",{children:"Filtres avancés"}),o.length>0&&e.jsx("span",{className:"adv-filters-count",children:o.length})]}),e.jsx("svg",{viewBox:"0 0 24 24",fill:"none",className:`adv-filters-chevron ${j?"adv-filters-chevron--open":""}`,children:e.jsx("path",{d:"M9 18L15 12L9 6",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round"})})]}),j&&e.jsxs("div",{className:"adv-filters-body",children:[o.map((c,h)=>{var E;C.find(_=>_.id===c.fieldId);const G=ze(c.fieldType),V=S===h,B=H(c.fieldId),J=B?P(c.fieldId):[],L=c.logic||"AND";return e.jsxs($e.Fragment,{children:[h>0&&e.jsxs("div",{className:"adv-filter-connector",children:[e.jsx("span",{className:"adv-filter-connector-line"}),e.jsx("button",{type:"button",className:`adv-filter-connector-badge ${L==="OR"?"adv-filter-connector-badge--or":""}`,onClick:()=>{D(h,{logic:L==="AND"?"OR":"AND"})},title:"Cliquez pour basculer entre ET/OU",children:L==="OR"?"OU":"ET"}),e.jsx("span",{className:"adv-filter-connector-line"})]}),e.jsx("div",{className:`adv-filter-pill ${V?"adv-filter-pill--editing":""}`,children:V?e.jsxs("div",{className:"adv-filter-edit",children:[e.jsxs("div",{className:"adv-filter-row",children:[e.jsx("label",{className:"adv-filter-label",children:"Champ"}),e.jsx("select",{value:c.fieldId,onChange:_=>{const se=C.find(oe=>oe.id===_.target.value);if(se){const oe=ze(se.type),pe=_.target.value.startsWith("classif:")?oe.find(b=>b.key==="equals")||oe[0]:oe.find(b=>b.key===c.operator)||oe[0];D(h,{fieldId:se.id,fieldName:se.name,fieldType:se.type||"text",operator:pe.key,value:"",value2:""})}},className:"adv-filter-select",children:C.map(_=>e.jsx("option",{value:_.id,children:_.name},_.id))})]}),e.jsxs("div",{className:"adv-filter-row",children:[e.jsx("label",{className:"adv-filter-label",children:"Condition"}),e.jsx("select",{value:c.operator,onChange:_=>D(h,{operator:_.target.value,value:g(_.target.value)?"":c.value,value2:""}),className:"adv-filter-select",children:G.map(_=>e.jsx("option",{value:_.key,children:_.label},_.key))})]}),!g(c.operator)&&e.jsxs("div",{className:"adv-filter-row",children:[e.jsx("label",{className:"adv-filter-label",children:U(c.operator)?"Valeur min":"Valeur"}),B&&J.length>0?e.jsxs("select",{value:c.value,onChange:_=>D(h,{value:_.target.value}),className:"adv-filter-select",children:[e.jsx("option",{value:"",children:"Sélectionnez..."}),J.map(_=>e.jsx("option",{value:_.label,children:_.label},_.id))]}):e.jsx("input",{type:He(c.fieldType),value:c.value,onChange:_=>D(h,{value:_.target.value}),placeholder:"Saisir une valeur...",className:"adv-filter-input",autoFocus:!0})]}),U(c.operator)&&e.jsxs("div",{className:"adv-filter-row",children:[e.jsx("label",{className:"adv-filter-label",children:"Valeur max"}),e.jsx("input",{type:He(c.fieldType),value:c.value2||"",onChange:_=>D(h,{value2:_.target.value}),placeholder:"Saisir une valeur max...",className:"adv-filter-input"})]}),e.jsxs("div",{className:"adv-filter-row adv-filter-row--actions",children:[e.jsxs("button",{type:"button",className:"adv-filter-btn-done",onClick:()=>p(null),children:[e.jsx("svg",{viewBox:"0 0 24 24",fill:"none",className:"h-3.5 w-3.5",children:e.jsx("path",{d:"M5 13L9 17L19 7",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round"})}),"OK"]}),e.jsx("button",{type:"button",className:"adv-filter-btn-delete",onClick:()=>K(h),children:e.jsxs("svg",{viewBox:"0 0 24 24",fill:"none",className:"h-3.5 w-3.5",children:[e.jsx("path",{d:"M20.5001 6H3.5",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"}),e.jsx("path",{d:"M18.8334 8.5L18.3735 15.3991C18.1965 18.054 18.108 19.3815 17.243 20.1907C16.378 21 15.0476 21 12.3868 21H11.6134C8.9526 21 7.6222 21 6.75719 20.1907C5.89218 19.3815 5.80368 18.054 5.62669 15.3991L5.16675 8.5",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"})]})})]})]}):e.jsxs("button",{type:"button",className:"adv-filter-pill-summary",onClick:()=>p(h),children:[e.jsx("span",{className:"adv-filter-pill-field",children:c.fieldName}),e.jsx("span",{className:"adv-filter-pill-op",children:((E=Qe[c.operator])==null?void 0:E.label)||c.operator}),!g(c.operator)&&e.jsx("span",{className:"adv-filter-pill-value",children:U(c.operator)?`${c.value||"?"} – ${c.value2||"?"}`:B?q(c.fieldId,c.value):c.value||"..."}),e.jsx("button",{type:"button",className:"adv-filter-pill-remove",onClick:_=>{_.stopPropagation(),K(h)},children:e.jsx("svg",{viewBox:"0 0 24 24",fill:"none",className:"h-3 w-3",children:e.jsx("path",{d:"M18 6L6 18M6 6L18 18",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round"})})})]})})]},h)}),e.jsxs("div",{className:"adv-filter-add-row",ref:x,children:[e.jsxs("button",{type:"button",className:"adv-filter-add-btn",onClick:()=>v(!f),children:[e.jsx("svg",{viewBox:"0 0 24 24",fill:"none",className:"h-3.5 w-3.5",children:e.jsx("path",{d:"M12 5V19M5 12H19",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round"})}),"Ajouter un filtre"]}),f&&e.jsxs("div",{className:"adv-filter-field-dropdown",children:[e.jsx("div",{className:"adv-filter-field-dropdown-title",children:"Choisir un champ"}),C.map(c=>e.jsxs("button",{type:"button",className:"adv-filter-field-option",onClick:()=>$(c.id),children:[e.jsx("span",{className:"adv-filter-field-type-badge",children:Kt(c.type)}),c.name]},c.id))]})]}),o.length>0&&e.jsx("button",{type:"button",className:"adv-filter-clear",onClick:M,children:"Effacer tous les filtres"})]}),e.jsx("style",{children:`
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
            `})]})}function Kt(t){return{text:"Aa",title:"T",email:"@",phone:"☎",url:"🔗",number:"#",currency:"$",percent:"%",date:"📅",datetime:"🕐",textarea:"¶",select:"☰",relation:"↗",classification:"●"}[t]||"Aa"}const Je=229,Ue=500,Ye=280;function Xt({entityName:t,entityNamePlural:o,entityIcon:a,accountNumber:s,entitySlug:u,showSidebar:j,onToggleSidebar:m,filters:S=[],activeFilters:p={},onFilterChange:f,columns:v=[],fieldFilters:x=[],onFieldFiltersChange:W,allRecords:C=[],sidebarWidth:$,onSidebarWidthChange:D}){const[K,M]=r.useState(!1),g=r.useRef(null),[U,H]=r.useState($||Ye),P=r.useRef(!1),q=r.useRef(0),c=r.useRef(0),h=r.useRef($||Ye),G=r.useRef(D);r.useEffect(()=>{G.current=D},[D]),r.useEffect(()=>{h.current=U},[U]),r.useEffect(()=>{$&&!P.current&&H($)},[$]);const V=r.useCallback(L=>{L.preventDefault(),P.current=!0,q.current=L.clientX,c.current=h.current,document.body.style.cursor="col-resize",document.body.style.userSelect="none"},[]);if(r.useEffect(()=>{const L=_=>{if(!P.current)return;const se=_.clientX-q.current,oe=Math.min(Ue,Math.max(Je,c.current+se));H(oe)},E=()=>{P.current&&(P.current=!1,document.body.style.cursor="",document.body.style.userSelect="",G.current&&G.current(h.current))};return document.addEventListener("mousemove",L),document.addEventListener("mouseup",E),()=>{document.removeEventListener("mousemove",L),document.removeEventListener("mouseup",E)}},[]),r.useEffect(()=>{const L=E=>{K&&g.current&&!g.current.contains(E.target)&&M(!1)};return K&&document.addEventListener("mousedown",L),()=>document.removeEventListener("mousedown",L)},[K]),!j)return null;const B=(L,E)=>{const _={...p},se=_[L]||[];if(E==="__all__")delete _[L];else{const oe=se.indexOf(E);oe>-1?(se.splice(oe,1),se.length===0?delete _[L]:_[L]=[...se]):_[L]=[...se,E]}f(_)},J=Object.keys(p).length>0;return e.jsxs("div",{style:{position:"relative",width:U,minWidth:Je,maxWidth:Ue,flexShrink:0},children:[e.jsxs("div",{className:"panel z-10 space-y-4 overflow-y-auto p-4 h-full",style:{display:"flex",flexDirection:"column",width:"100%"},children:[e.jsxs("div",{className:"flex items-center justify-between",children:[e.jsx("div",{className:"flex items-center",children:e.jsxs("div",{className:"flex items-center text-center",children:[e.jsx("div",{children:a?e.jsx("iconify-icon",{icon:a,width:"22",style:{color:"var(--primary)"}}):e.jsxs("svg",{width:"24",height:"24",viewBox:"0 0 24 24",fill:"none",xmlns:"http://www.w3.org/2000/svg",className:"h-5 w-5",children:[e.jsx("path",{d:"M20.3116 12.6473L20.8293 10.7154C21.4335 8.46034 21.7356 7.3328 21.5081 6.35703C21.3285 5.58657 20.9244 4.88668 20.347 4.34587C19.6157 3.66095 18.4881 3.35883 16.2331 2.75458C13.978 2.15033 12.8504 1.84821 11.8747 2.07573C11.1042 2.25537 10.4043 2.65945 9.86351 3.23687C9.27709 3.86298 8.97128 4.77957 8.51621 6.44561C8.43979 6.7254 8.35915 7.02633 8.27227 7.35057L8.27222 7.35077L7.75458 9.28263C7.15033 11.5377 6.84821 12.6652 7.07573 13.641C7.25537 14.4115 7.65945 15.1114 8.23687 15.6522C8.96815 16.3371 10.0957 16.6392 12.3508 17.2435L12.3508 17.2435C14.3834 17.7881 15.4999 18.0873 16.415 17.9744C16.5152 17.9621 16.6129 17.9448 16.7092 17.9223C17.4796 17.7427 18.1795 17.3386 18.7203 16.7612C19.4052 16.0299 19.7074 14.9024 20.3116 12.6473Z",stroke:"currentColor",strokeWidth:"1.5"}),e.jsx("path",{opacity:"0.5",d:"M16.415 17.9741C16.2065 18.6126 15.8399 19.1902 15.347 19.6519C14.6157 20.3368 13.4881 20.6389 11.2331 21.2432C8.97798 21.8474 7.85044 22.1495 6.87466 21.922C6.10421 21.7424 5.40432 21.3383 4.86351 20.7609C4.17859 20.0296 3.87647 18.9021 3.27222 16.647L2.75458 14.7151C2.15033 12.46 1.84821 11.3325 2.07573 10.3567C2.25537 9.58627 2.65945 8.88638 3.23687 8.34557C3.96815 7.66065 5.09569 7.35853 7.35077 6.75428C7.77741 6.63996 8.16368 6.53646 8.51621 6.44531",stroke:"currentColor",strokeWidth:"1.5"}),e.jsx("path",{d:"M11.7769 10L16.6065 11.2941",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"}),e.jsx("path",{opacity:"0.5",d:"M11 12.8975L13.8978 13.6739",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"})]})}),e.jsx("h3",{className:"text-lg font-semibold ltr:ml-3 rtl:mr-3",children:t})]})}),e.jsxs("div",{className:"dropdown relative",ref:g,children:[e.jsx("button",{type:"button",className:"flex h-8 w-8 items-center justify-center rounded-full bg-[#f4f4f4] hover:bg-primary-light dark:bg-[#1b2e4b]",onClick:()=>M(!K),children:e.jsxs("svg",{width:"24",height:"24",viewBox:"0 0 24 24",fill:"none",xmlns:"http://www.w3.org/2000/svg",className:"h-5 w-5 opacity-70",children:[e.jsx("circle",{cx:"5",cy:"12",r:"2",stroke:"currentColor",strokeWidth:"1.5"}),e.jsx("circle",{opacity:"0.5",cx:"12",cy:"12",r:"2",stroke:"currentColor",strokeWidth:"1.5"}),e.jsx("circle",{cx:"19",cy:"12",r:"2",stroke:"currentColor",strokeWidth:"1.5"})]})}),K&&e.jsxs("ul",{className:"whitespace-nowrap absolute right-0 top-full mt-1 z-50 min-w-[160px] rounded-md border border-gray-200 bg-white py-1 shadow-lg dark:border-[#1b2e4b] dark:bg-[#0e1726]",children:[e.jsx("li",{children:e.jsxs("a",{href:"javascript:;",onClick:()=>M(!1),className:"flex items-center px-4 py-2 text-sm hover:bg-gray-100 hover:text-primary dark:hover:bg-[#181F32] dark:hover:text-primary",children:[e.jsx("iconify-icon",{icon:"solar:settings-bold-duotone",className:"h-4.5 w-4.5 shrink-0 ltr:mr-1 rtl:ml-1",width:"18",style:{marginRight:"6px"}}),"Paramètres"]})}),e.jsx("li",{children:e.jsxs("a",{href:"javascript:;",onClick:()=>M(!1),className:"flex items-center px-4 py-2 text-sm hover:bg-gray-100 hover:text-primary dark:hover:bg-[#181F32] dark:hover:text-primary",children:[e.jsx("iconify-icon",{icon:"solar:question-circle-bold-duotone",className:"h-4.5 w-4.5 shrink-0 ltr:mr-1 rtl:ml-1",width:"18",style:{marginRight:"6px"}}),"Aide"]})})]})]})]}),e.jsx("div",{className:"h-px w-full border-b border-[#e0e6ed] dark:border-[#1b2e4b]"}),e.jsx("div",{className:"!mt-0",style:{flex:1,display:"flex",flexDirection:"column"},children:e.jsxs("div",{className:"flex h-full flex-col pb-16",style:{position:"relative"},children:[e.jsx("div",{className:"relative -mr-3.5 h-full grow pr-3.5 overflow-auto",children:e.jsxs("div",{className:"space-y-1",children:[e.jsx("button",{type:"button",className:`flex h-10 w-full items-center justify-between rounded-md p-2 font-medium hover:bg-white-dark/10 hover:text-primary dark:hover:bg-[#181F32] dark:hover:text-primary ${J?"":"bg-gray-100 dark:text-primary text-primary dark:bg-[#181F32]"}`,onClick:()=>f({}),children:e.jsxs("div",{className:"flex items-center",children:[e.jsx("iconify-icon",{icon:"solar:checklist-minimalistic-bold-duotone",width:"20"}),e.jsxs("div",{className:"ltr:ml-3 rtl:mr-3",children:["Toutes les ",o||t+"s"]})]})}),e.jsx("button",{type:"button",className:`flex h-10 w-full items-center justify-between rounded-md p-2 font-medium hover:bg-white-dark/10 hover:text-primary dark:hover:bg-[#181F32] dark:hover:text-primary ${p.__favourites?"bg-gray-100 dark:text-primary text-primary dark:bg-[#181F32]":""}`,onClick:()=>{const L={...p};L.__favourites?delete L.__favourites:L.__favourites=!0,f(L)},children:e.jsxs("div",{className:"flex items-center",children:[e.jsx("svg",{width:"24",height:"24",viewBox:"0 0 24 24",fill:"none",xmlns:"http://www.w3.org/2000/svg",className:"h-5 w-5",children:e.jsx("path",{d:"M9.15316 5.40838C10.4198 3.13613 11.0531 2 12 2C12.9469 2 13.5802 3.13612 14.8468 5.40837L15.1745 5.99623C15.5345 6.64193 15.7144 6.96479 15.9951 7.17781C16.2757 7.39083 16.6251 7.4699 17.3241 7.62805L17.9605 7.77203C20.4201 8.32856 21.65 8.60682 21.9426 9.54773C22.2352 10.4886 21.3968 11.4691 19.7199 13.4299L19.2861 13.9372C18.8096 14.4944 18.5713 14.773 18.4641 15.1177C18.357 15.4624 18.393 15.8341 18.465 16.5776L18.5306 17.2544C18.7841 19.8706 18.9109 21.1787 18.1449 21.7602C17.3788 22.3417 16.2273 21.8115 13.9243 20.7512L13.3285 20.4768C12.6741 20.1755 12.3469 20.0248 12 20.0248C11.6531 20.0248 11.3259 20.1755 10.6715 20.4768L10.0757 20.7512C7.77268 21.8115 6.62118 22.3417 5.85515 21.7602C5.08912 21.1787 5.21588 19.8706 5.4694 17.2544L5.53498 16.5776C5.60703 15.8341 5.64305 15.4624 5.53586 15.1177C5.42868 14.773 5.19043 14.4944 4.71392 13.9372L4.2801 13.4299C2.60325 11.4691 1.76482 10.4886 2.05742 9.54773C2.35002 8.60682 3.57986 8.32856 6.03954 7.77203L6.67589 7.62805C7.37485 7.4699 7.72433 7.39083 8.00494 7.17781C8.28555 6.96479 8.46553 6.64194 8.82547 5.99623L9.15316 5.40838Z",stroke:"currentColor",strokeWidth:"1.5"})}),e.jsx("div",{className:"ltr:ml-3 rtl:mr-3",children:"Favourites"})]})}),S.map(L=>e.jsxs("div",{children:[e.jsx("div",{className:"h-px w-full border-b border-[#e0e6ed] dark:border-[#1b2e4b] my-2"}),e.jsx("div",{className:"px-1 py-2 text-white-dark text-xs uppercase font-semibold tracking-wider",children:L.name}),L.type==="tags"?e.jsx("div",{className:"flex flex-wrap gap-1.5 px-1",children:L.options.map(E=>{const _=(p[L.id]||[]).includes(E.id);return e.jsxs("button",{type:"button",className:"mb-0 py-0.5 px-2.5 text-xs rounded-full cursor-pointer transition-all font-medium",style:{border:`1.5px solid ${E.color||"#9ca3af"}`,color:_?"#fff":E.color||"#9ca3af",backgroundColor:_?E.color||"#9ca3af":"transparent"},onClick:()=>B(L.id,E.id),children:[E.label,E.count!==void 0&&e.jsx("span",{style:{opacity:.7,marginLeft:"2px"},children:E.count})]},E.id)})}):e.jsx("div",{className:"space-y-0.5",children:L.options.map(E=>{const _=(p[L.id]||[]).includes(E.id);return e.jsxs("button",{type:"button",className:`flex h-9 w-full items-center rounded-md px-2 py-1.5 text-sm font-medium transition-colors hover:bg-white-dark/10 hover:text-primary dark:hover:bg-[#181F32] dark:hover:text-primary ${_?"bg-gray-100 text-primary dark:bg-[#181F32] dark:text-primary":""}`,onClick:()=>B(L.id,E.id),children:[e.jsx("span",{className:"inline-block w-3 h-3 rounded-full mr-2.5 flex-shrink-0",style:{backgroundColor:E.color||"#9ca3af"}}),e.jsx("span",{className:"truncate",children:E.label}),E.count!==void 0&&e.jsx("span",{className:"ml-auto text-xs opacity-60",children:E.count})]},E.id)})})]},L.id)),e.jsx(qt,{columns:v,fieldFilters:x,onFieldFiltersChange:W,allRecords:C,sidebarFilters:S})]})}),e.jsx("div",{className:"absolute bottom-0 w-full p-4 left-0",children:e.jsxs("a",{href:`/account/${s}/record/${u}/add`,className:"btn btn-primary w-full",children:[e.jsxs("svg",{xmlns:"http://www.w3.org/2000/svg",width:"24px",height:"24px",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round",className:"h-5 w-5 ltr:mr-2 rtl:ml-2",children:[e.jsx("line",{x1:"12",y1:"5",x2:"12",y2:"19"}),e.jsx("line",{x1:"5",y1:"12",x2:"19",y2:"12"})]}),"Ajouter"]})})]})})]}),e.jsx("div",{onMouseDown:V,style:{position:"absolute",top:0,right:-3,width:6,height:"100%",cursor:"col-resize",zIndex:20,display:"flex",alignItems:"center",justifyContent:"center"},onMouseEnter:L=>{L.currentTarget.querySelector(".resize-bar").style.opacity="1"},onMouseLeave:L=>{P.current||(L.currentTarget.querySelector(".resize-bar").style.opacity="0")},children:e.jsx("div",{className:"resize-bar",style:{width:3,height:"100%",borderRadius:2,background:"var(--primary, #4361ee)",opacity:0,transition:"opacity 0.2s ease"}})})]})}const Qt=["#4361ee","#805dca","#e2a03f","#00ab55","#e7515a","#2196d4","#3b3f5c","#009688","#ff5722","#607d8b"],Gt={contains:{label:"Contient",icon:"⊃",types:["text","email","phone","url","textarea","title","relation"]},not_contains:{label:"Ne contient pas",icon:"⊅",types:["text","email","phone","url","textarea","title","relation"]},equals:{label:"Est égal à",icon:"=",types:["text","email","phone","url","number","date","title","select","relation","classification"]},not_equals:{label:"N'est pas égal à",icon:"≠",types:["text","email","phone","url","number","date","title","select","relation","classification"]},starts_with:{label:"Commence par",icon:"A…",types:["text","email","phone","url","title"]},ends_with:{label:"Se termine par",icon:"…Z",types:["text","email","phone","url","title"]},gt:{label:"Supérieur à",icon:">",types:["number","date"]},gte:{label:"Supérieur ou égal",icon:"≥",types:["number","date"]},lt:{label:"Inférieur à",icon:"<",types:["number","date"]},lte:{label:"Inférieur ou égal",icon:"≤",types:["number","date"]},between:{label:"Entre",icon:"↔",types:["number","date"]},is_empty:{label:"Est vide",icon:"∅",types:["text","email","phone","url","number","date","textarea","title","select","relation","classification"]},is_not_empty:{label:"N'est pas vide",icon:"∃",types:["text","email","phone","url","number","date","textarea","title","select","relation","classification"]}};function Oe(t){const o=t||"text";return Object.entries(Gt).filter(([a,s])=>s.types.includes(o)).map(([a,s])=>({key:a,...s}))}function Ze(t){return["number","currency","percent"].includes(t)?"number":["date","datetime"].includes(t)?"date":"text"}function er({savedViews:t=[],activeViewId:o,onSelectView:a,onCreateView:s,onDeleteView:u,onRenameView:j,onUpdateViewFilters:m,hasActiveFilters:S=!1,activeFilters:p={},fieldFilters:f=[],sidebarFilters:v=[],columns:x=[],externalOpenCreate:W=!1,onCloseExternalCreate:C}){const[$,D]=r.useState(!1),[K,M]=r.useState(!1),[g,U]=r.useState(""),[H,P]=r.useState("#4361ee"),[q,c]=r.useState(null),[h,G]=r.useState(null),[V,B]=r.useState(""),[J,L]=r.useState(null),[E,_]=r.useState([]),[se,oe]=r.useState({}),[de,pe]=r.useState(!1),b=r.useRef(null),F=r.useRef(null),Y=r.useRef(null),i=r.useRef(null);r.useEffect(()=>{const d=T=>{q&&F.current&&!F.current.contains(T.target)&&c(null)};return q&&document.addEventListener("mousedown",d),()=>document.removeEventListener("mousedown",d)},[q]),r.useEffect(()=>{$&&Y.current&&setTimeout(()=>{var d;return(d=Y.current)==null?void 0:d.focus()},100)},[$]),r.useEffect(()=>{W&&(D(!0),_([...f]),C==null||C())},[W]),r.useEffect(()=>{$&&!J&&(_([...f]),oe(JSON.parse(JSON.stringify(p||{}))))},[$]),r.useEffect(()=>{const d=T=>{de&&b.current&&!b.current.contains(T.target)&&pe(!1)};return de&&document.addEventListener("mousedown",d),()=>document.removeEventListener("mousedown",d)},[de]),r.useEffect(()=>{h&&i.current&&(i.current.focus(),i.current.select())},[h]);const k=(d,T)=>{d.preventDefault(),c({viewId:T,x:d.clientX,y:d.clientY})},N=()=>{g.trim()&&(s({name:g.trim(),color:H,filters:se,fieldFilters:E}),U(""),P("#4361ee"),_([]),oe({}),D(!1))},z=r.useMemo(()=>x.filter(d=>d.id!=="actions"),[x]),X=r.useMemo(()=>{const d={};return v.forEach(T=>{d[`classif:${T.id}`]=T.options||[]}),d},[v]),Q=r.useCallback(d=>{const T=z.find(xe=>xe.id===d);if(!T)return;const ie=d.startsWith("classif:"),ue=Oe(T.type),ke=ie?ue.find(xe=>xe.key==="equals")||ue[0]:ue.find(xe=>xe.key==="contains")||ue[0],we={fieldId:d,fieldName:T.name,fieldType:T.type||"text",operator:ke.key,value:"",value2:"",logic:"AND"};_(xe=>[...xe,we]),pe(!1)},[z]),l=r.useCallback((d,T)=>{_(ie=>ie.map((ue,ke)=>ke===d?{...ue,...T}:ue))},[]),Z=r.useCallback(d=>{_(T=>T.filter((ie,ue)=>ue!==d))},[]),ee=d=>{const T=t.find(ie=>ie._id===d);T&&(G(d),B(T.name)),c(null)},R=()=>{h&&V.trim()&&j(h,V.trim()),G(null),B("")},ce=d=>{u(d),c(null)},A=d=>{const T=t.find(ie=>ie._id===d);T&&(L(d),U(T.name||""),P(T.color||"#4361ee"),_(T.fieldFilters?JSON.parse(JSON.stringify(T.fieldFilters)):[]),oe(T.filters?JSON.parse(JSON.stringify(T.filters)):{}),D(!0),c(null))},fe=()=>{!g.trim()||!J||(m(J,se,E,g.trim(),H),U(""),P("#4361ee"),_([]),oe({}),L(null),D(!1))},ve=d=>{var ie;let T=0;return d.filters&&(T+=Object.keys(d.filters).filter(ue=>ue!=="__favourites").length),(ie=d.fieldFilters)!=null&&ie.length&&(T+=d.fieldFilters.length),T};return e.jsxs(e.Fragment,{children:[e.jsxs("div",{className:"saved-views-tabs",children:[e.jsxs("button",{type:"button",className:`saved-view-tab ${o?"":"saved-view-tab--active"}`,onClick:()=>a(null),children:[e.jsxs("svg",{className:"saved-view-tab-icon",viewBox:"0 0 24 24",fill:"none",children:[e.jsx("path",{d:"M2 12C2 7.28595 2 4.92893 3.46447 3.46447C4.92893 2 7.28595 2 12 2C16.714 2 19.0711 2 20.5355 3.46447C22 4.92893 22 7.28595 22 12C22 16.714 22 19.0711 20.5355 20.5355C19.0711 22 16.714 22 12 22C7.28595 22 4.92893 22 3.46447 20.5355C2 19.0711 2 16.714 2 12Z",stroke:"currentColor",strokeWidth:"1.5"}),e.jsx("path",{d:"M6 12H18",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"}),e.jsx("path",{d:"M6 8H18",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"}),e.jsx("path",{d:"M6 16H18",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"})]}),"Tout"]}),t.map(d=>e.jsx("button",{type:"button",className:`saved-view-tab ${o===d._id?"saved-view-tab--active":""}`,style:{"--tab-color":d.color||"#4361ee"},onClick:()=>a(d._id),onContextMenu:T=>k(T,d._id),children:h===d._id?e.jsx("input",{ref:i,type:"text",value:V,onChange:T=>B(T.target.value),onBlur:R,onKeyDown:T=>{T.key==="Enter"&&R(),T.key==="Escape"&&(G(null),B(""))},className:"saved-view-tab-edit-input",onClick:T=>T.stopPropagation()}):e.jsxs(e.Fragment,{children:[e.jsx("span",{className:"saved-view-tab-dot",style:{backgroundColor:d.color||"#4361ee"}}),e.jsx("span",{className:"saved-view-tab-name",children:d.name}),ve(d)>0&&e.jsx("span",{className:"saved-view-tab-badge",children:ve(d)})]})},d._id)),e.jsx("button",{type:"button",className:"saved-view-tab saved-view-tab--add",onClick:()=>{L(null),U(""),P("#4361ee"),D(!0)},title:"Enregistrer une vue",children:e.jsx("svg",{viewBox:"0 0 24 24",fill:"none",className:"h-3.5 w-3.5",children:e.jsx("path",{d:"M12 5V19M5 12H19",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round"})})})]}),q&&e.jsxs("div",{ref:F,className:"saved-view-context-menu",style:{position:"fixed",top:q.y,left:q.x,zIndex:10001},children:[e.jsxs("button",{className:"saved-view-context-item",onClick:()=>ee(q.viewId),children:[e.jsx("svg",{viewBox:"0 0 24 24",fill:"none",className:"h-4 w-4",children:e.jsx("path",{d:"M13.9027 6.37027L17.6297 10.0973M4 20.0001H8L18.5 9.50006C18.9978 9.00236 19.2786 8.32622 19.2786 7.62142C19.2786 6.91661 18.9978 6.24047 18.5 5.74277C18.0023 5.24508 17.3261 4.96426 16.6213 4.96426C15.9165 4.96426 15.2404 5.24508 14.7427 5.74277L4 16.0001V20.0001Z",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round"})}),"Renommer"]}),e.jsxs("button",{className:"saved-view-context-item",onClick:()=>A(q.viewId),children:[e.jsxs("svg",{viewBox:"0 0 24 24",fill:"none",className:"h-4 w-4",children:[e.jsx("path",{d:"M4.06189 13C4.02104 12.6724 4 12.3387 4 12C4 7.58172 7.58172 4 12 4C14.5006 4 16.7332 5.14727 18.2002 6.94416M19.9381 11C19.979 11.3276 20 11.6613 20 12C20 16.4183 16.4183 20 12 20C9.49944 20 7.26681 18.8527 5.79984 17.0558",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round"}),e.jsx("path",{d:"M15 7H19V3",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round"}),e.jsx("path",{d:"M9 17H5V21",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round"})]}),"Modifier la vue"]}),e.jsx("div",{className:"saved-view-context-separator"}),e.jsxs("button",{className:"saved-view-context-item saved-view-context-item--danger",onClick:()=>ce(q.viewId),children:[e.jsxs("svg",{viewBox:"0 0 24 24",fill:"none",className:"h-4 w-4",children:[e.jsx("path",{d:"M20.5001 6H3.5",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"}),e.jsx("path",{d:"M18.8334 8.5L18.3735 15.3991C18.1965 18.054 18.108 19.3815 17.243 20.1907C16.378 21 15.0476 21 12.3868 21H11.6134C8.9526 21 7.6222 21 6.75719 20.1907C5.89218 19.3815 5.80368 18.054 5.62669 15.3991L5.16675 8.5",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"}),e.jsx("path",{d:"M9.5 11L10 16",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"}),e.jsx("path",{d:"M14.5 11L14 16",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"}),e.jsx("path",{d:"M6.5 6C6.55588 6 6.58382 6 6.60915 5.99936C7.43259 5.97849 8.15902 5.45491 8.43922 4.68032C8.44784 4.65649 8.45667 4.62999 8.47434 4.57697L8.57143 4.28571C8.65431 4.03708 8.69575 3.91276 8.75071 3.8072C8.97001 3.38607 9.37574 3.09364 9.84461 3.01877C9.96213 3 10.0932 3 10.3553 3H13.6447C13.9068 3 14.0379 3 14.1554 3.01877C14.6243 3.09364 15.03 3.38607 15.2493 3.8072C15.3043 3.91276 15.3457 4.03708 15.4286 4.28571L15.5257 4.57697C15.5433 4.62992 15.5522 4.65651 15.5608 4.68032C15.841 5.45491 16.5674 5.97849 17.3909 5.99936C17.4162 6 17.4441 6 17.5 6",stroke:"currentColor",strokeWidth:"1.5"})]}),"Supprimer"]})]}),$&&e.jsx("div",{className:"saved-view-modal-overlay",onClick:()=>D(!1),children:e.jsxs("div",{className:"saved-view-modal",onClick:d=>d.stopPropagation(),children:[e.jsxs("div",{className:"saved-view-modal-header",children:[e.jsx("h3",{children:J?"Modifier la vue":"Enregistrer la vue"}),e.jsx("button",{type:"button",className:"saved-view-modal-close",onClick:()=>{D(!1),L(null)},children:e.jsx("svg",{viewBox:"0 0 24 24",fill:"none",className:"h-5 w-5",children:e.jsx("path",{d:"M18 6L6 18M6 6L18 18",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"})})})]}),e.jsxs("div",{className:"saved-view-modal-body",children:[e.jsxs("div",{className:"saved-view-form-group",children:[e.jsx("label",{className:"saved-view-form-label",children:"Nom de la vue"}),e.jsx("input",{ref:Y,type:"text",value:g,onChange:d=>U(d.target.value),onKeyDown:d=>{d.key==="Enter"&&N()},placeholder:"Ex: Hôtels, Clients VIP...",className:"saved-view-form-input"})]}),e.jsxs("div",{className:"saved-view-form-group",children:[e.jsx("label",{className:"saved-view-form-label",children:"Couleur"}),e.jsx("div",{className:"saved-view-color-grid",children:Qt.map(d=>e.jsx("button",{type:"button",className:`saved-view-color-swatch ${H===d?"saved-view-color-swatch--active":""}`,style:{backgroundColor:d},onClick:()=>P(d),children:H===d&&e.jsx("svg",{viewBox:"0 0 24 24",fill:"none",className:"h-3 w-3",children:e.jsx("path",{d:"M5 13L9 17L19 7",stroke:"white",strokeWidth:"2.5",strokeLinecap:"round",strokeLinejoin:"round"})})},d))})]}),v.length>0&&e.jsxs("div",{className:"saved-view-form-group",children:[e.jsx("label",{className:"saved-view-form-label",children:"Filtres de classification"}),e.jsx("div",{className:"svm-classif-editor",children:v.map(d=>{const T=se[d.id]||[];return e.jsxs("div",{className:"svm-classif-group",children:[e.jsx("span",{className:"svm-classif-group-label",children:d.name}),e.jsx("div",{className:"svm-classif-options",children:(d.options||[]).map(ie=>{const ue=T.includes(ie.id);return e.jsxs("button",{type:"button",className:`svm-classif-pill ${ue?"svm-classif-pill--active":""}`,style:{"--pill-color":ie.color||"#9ca3af"},onClick:()=>{oe(ke=>{const we=ke[d.id]||[];let xe;ue?xe=we.filter(je=>je!==ie.id):xe=[...we,ie.id];const ye={...ke};return xe.length>0?ye[d.id]=xe:delete ye[d.id],ye})},children:[ue&&e.jsx("svg",{viewBox:"0 0 24 24",fill:"none",className:"svm-classif-check",children:e.jsx("path",{d:"M5 13L9 17L19 7",stroke:"currentColor",strokeWidth:"2.5",strokeLinecap:"round",strokeLinejoin:"round"})}),ie.label]},ie.id)})})]},d.id)})})]}),e.jsxs("div",{className:"saved-view-form-group",children:[e.jsx("label",{className:"saved-view-form-label",children:"Filtres avancés"}),e.jsxs("div",{className:"svm-filter-builder",children:[E.map((d,T)=>{var je;const ie=(je=d.fieldId)==null?void 0:je.startsWith("classif:"),ue=ie?X[d.fieldId]||[]:[],ke=Oe(d.fieldType),we=["is_empty","is_not_empty"].includes(d.operator),xe=d.operator==="between",ye=d.logic||"AND";return e.jsxs($e.Fragment,{children:[T>0&&e.jsxs("div",{className:"svm-filter-connector",children:[e.jsx("span",{className:"svm-filter-connector-line"}),e.jsx("button",{type:"button",className:`svm-filter-connector-badge ${ye==="OR"?"svm-filter-connector-badge--or":""}`,onClick:()=>l(T,{logic:ye==="AND"?"OR":"AND"}),title:"Cliquez pour basculer ET/OU",children:ye==="OR"?"OU":"ET"}),e.jsx("span",{className:"svm-filter-connector-line"})]}),e.jsxs("div",{className:"svm-filter-row",children:[e.jsx("select",{value:d.fieldId,onChange:le=>{const Ce=z.find(Me=>Me.id===le.target.value);if(Ce){const Me=le.target.value.startsWith("classif:"),Ne=Oe(Ce.type),Se=Me?Ne.find(ge=>ge.key==="equals")||Ne[0]:Ne.find(ge=>ge.key===d.operator)||Ne[0];l(T,{fieldId:Ce.id,fieldName:Ce.name,fieldType:Ce.type||"text",operator:Se.key,value:"",value2:""})}},className:"svm-filter-select svm-filter-select--field",children:z.map(le=>e.jsx("option",{value:le.id,children:le.name},le.id))}),e.jsx("select",{value:d.operator,onChange:le=>l(T,{operator:le.target.value,value:["is_empty","is_not_empty"].includes(le.target.value)?"":d.value,value2:""}),className:"svm-filter-select svm-filter-select--op",children:ke.map(le=>e.jsx("option",{value:le.key,children:le.label},le.key))}),!we&&(ie&&ue.length>0?e.jsxs("select",{value:d.value,onChange:le=>l(T,{value:le.target.value}),className:"svm-filter-select svm-filter-select--val",children:[e.jsx("option",{value:"",children:"Sélectionnez..."}),ue.map(le=>e.jsx("option",{value:le.label,children:le.label},le.id))]}):e.jsx("input",{type:Ze(d.fieldType),value:d.value,onChange:le=>l(T,{value:le.target.value}),placeholder:"Valeur...",className:"svm-filter-input"})),xe&&e.jsx("input",{type:Ze(d.fieldType),value:d.value2||"",onChange:le=>l(T,{value2:le.target.value}),placeholder:"Max...",className:"svm-filter-input"}),e.jsx("button",{type:"button",className:"svm-filter-remove",onClick:()=>Z(T),title:"Supprimer ce filtre",children:e.jsx("svg",{viewBox:"0 0 24 24",fill:"none",className:"h-3.5 w-3.5",children:e.jsx("path",{d:"M18 6L6 18M6 6L18 18",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round"})})})]})]},T)}),e.jsxs("div",{className:"svm-filter-add-row",ref:b,children:[e.jsxs("button",{type:"button",className:"svm-filter-add-btn",onClick:()=>pe(!de),children:[e.jsx("svg",{viewBox:"0 0 24 24",fill:"none",className:"h-3.5 w-3.5",children:e.jsx("path",{d:"M12 5V19M5 12H19",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round"})}),"Ajouter un filtre"]}),de&&e.jsxs("div",{className:"svm-filter-field-dropdown",children:[e.jsx("div",{className:"svm-filter-field-dropdown-title",children:"Choisir un champ"}),z.map(d=>e.jsx("button",{type:"button",className:"svm-filter-field-option",onClick:()=>Q(d.id),children:d.name},d.id))]})]})]})]})]}),e.jsxs("div",{className:"saved-view-modal-footer",children:[e.jsx("button",{type:"button",className:"saved-view-btn saved-view-btn--cancel",onClick:()=>{D(!1),L(null)},children:"Annuler"}),e.jsxs("button",{type:"button",className:"saved-view-btn saved-view-btn--save",onClick:J?fe:N,disabled:!g.trim(),children:[e.jsx("svg",{viewBox:"0 0 24 24",fill:"none",className:"h-4 w-4",children:e.jsx("path",{d:"M5 13L9 17L19 7",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round"})}),J?"Mettre à jour":"Enregistrer"]})]})]})}),e.jsx("style",{children:`
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
            `})]})}function tr(t,o){var s,u,j;if(o==="title")return t.referenceTitle||t.computedTitle||t.title||"";if(o==="createdAt")return t.createdAt||"";if(o==="updatedAt")return t.updatedAt||"";if(o.startsWith("rel:")){const m=o.replace("rel:",""),p=(((s=t._denorm)==null?void 0:s.relations)||[]).find(x=>x.relationKey===m);if(((u=p==null?void 0:p.records)==null?void 0:u.length)>0)return p.records.map(x=>x.title||x.computedTitle||"").join(", ");const f=(t.relations||[]).find(x=>x.key===m||x.relationKey===m);if(f)return f.title||f.computedTitle||f.value||"";const v=(j=t._denorm)==null?void 0:j[m];return v&&(v.title||v.computedTitle)||""}if(o.startsWith("classif:")){const m=o.replace("classif:","");return(t.classificationValues||[]).filter(f=>{var v;return((v=f.classificationId)==null?void 0:v.toString())===m}).map(f=>f.label||f.optionLabel||"").join(", ")}const a=(t.customFields||[]).find(m=>{var S,p,f;return((p=(S=m.field_id)==null?void 0:S._id)==null?void 0:p.toString())===o||((f=m.field_id)==null?void 0:f.toString())===o});return(a==null?void 0:a.value)??""}function rr(t,o){const{operator:a,value:s,value2:u,fieldType:j}=o,m=["number","currency","percent"].includes(j),S=["date","datetime"].includes(j),p=String(t??"").trim(),f=p.toLowerCase(),v=String(s??"").trim().toLowerCase();switch(a){case"contains":return f.includes(v);case"not_contains":return!f.includes(v);case"equals":return m?parseFloat(p)===parseFloat(s):f===v;case"not_equals":return m?parseFloat(p)!==parseFloat(s):f!==v;case"starts_with":return f.startsWith(v);case"ends_with":return f.endsWith(v);case"gt":return S?new Date(t)>new Date(s):parseFloat(p)>parseFloat(s);case"gte":return S?new Date(t)>=new Date(s):parseFloat(p)>=parseFloat(s);case"lt":return S?new Date(t)<new Date(s):parseFloat(p)<parseFloat(s);case"lte":return S?new Date(t)<=new Date(s):parseFloat(p)<=parseFloat(s);case"between":{if(S){const W=new Date(t);return W>=new Date(s)&&W<=new Date(u)}const x=parseFloat(p);return x>=parseFloat(s)&&x<=parseFloat(u)}case"is_empty":return p===""||t==null;case"is_not_empty":return p!==""&&t!=null;default:return!0}}function sr({accountId:t,accountNumber:o,entityId:a,viewId:s,entityName:u,entityNamePlural:j,entitySlug:m}){const[S,p]=r.useState([]),[f,v]=r.useState([]),[x,W]=r.useState([]),[C,$]=r.useState([]),[D,K]=r.useState(!0),[M,g]=r.useState(null),[U,H]=r.useState(""),[P,q]=r.useState("table"),[c,h]=r.useState(""),[G,V]=r.useState(null),[B,J]=r.useState(new Set),[L,E]=r.useState(!1),_=r.useRef(null),[se,oe]=r.useState([]),[de,pe]=r.useState({}),[b,F]=r.useState([]),[Y,i]=r.useState([]),[k,N]=r.useState(null),[z,X]=r.useState(!1),[Q,l]=r.useState(null),Z=r.useRef(null),ee=r.useCallback((n,y="success")=>{Z.current&&clearTimeout(Z.current),l({message:n,type:y}),Z.current=setTimeout(()=>l(null),2500)},[]),[R,ce]=r.useState({columns:[],sort:{field:"createdAt",direction:"desc"},density:"normal",pageSize:10,titleDisplay:"avatar",showSidebar:!0,sidebarWidth:280,viewMode:null,enabledViews:["table","kanban","notes","calendar"]}),[A,fe]=r.useState({page:1,limit:10,total:0,pages:0}),ve=r.useRef(null),d=r.useCallback(async()=>{var n,y;try{K(!0),g(null);const I=new URLSearchParams({limit:1e4,sort:`${R.sort.field}:${R.sort.direction}`}),O=await fetch(`/account/${o}/api/entity/${a}/views/${s}/records?${I}`,{credentials:"include"});if(!O.ok)throw new Error(`HTTP ${O.status}`);const w=await O.json();if(p(w.records||[]),v(w.records||[]),w.entity&&(V(w.entity),w.entity.icon&&h(w.entity.icon)),w.filters&&oe(w.filters),w.preferences)if(ce(re=>{var te,ae;return{...re,...w.preferences,columns:(te=w.preferences.columns)!=null&&te.length?w.preferences.columns:((ae=w.columns)==null?void 0:ae.map(ne=>({id:ne.id,visible:!0})))||[]}}),w.preferences.pageSize&&fe(re=>({...re,limit:w.preferences.pageSize})),w.preferences.viewMode&&q(w.preferences.viewMode),(n=w.preferences.columns)!=null&&n.length&&((y=w.columns)!=null&&y.length)){const re=[];w.preferences.columns.forEach(te=>{const ae=w.columns.find(ne=>ne.id===te.id);ae&&re.push(ae)}),w.columns.forEach(te=>{re.find(ae=>ae.id===te.id)||re.push(te)}),$(re)}else $(w.columns||[]);else w.columns&&($(w.columns||[]),ce(re=>({...re,columns:w.columns.map(te=>({id:te.id,visible:!0}))})))}catch(I){console.error("[RecordsGrid] Fetch error:",I),g(I.message)}finally{K(!1)}},[o,a,s,R.sort]),T=r.useCallback(async()=>{try{const n=await fetch(`/account/${o}/api/entity/${a}/saved-views`,{credentials:"include"});if(n.ok){const y=await n.json();i(y.views||[])}}catch(n){console.error("[RecordsGrid] Fetch saved views error:",n)}},[o,a]),ie=r.useCallback(async({name:n,color:y,filters:I,fieldFilters:O})=>{try{const w=await fetch(`/account/${o}/api/entity/${a}/saved-views`,{method:"POST",headers:{"Content-Type":"application/json"},credentials:"include",body:JSON.stringify({name:n,color:y,filters:I,fieldFilters:O})});if(w.ok){const re=await w.json();i(te=>[...te,re.view]),N(re.view._id)}}catch(w){console.error("[RecordsGrid] Create saved view error:",w)}},[o,a]),ue=r.useCallback(async n=>{try{(await fetch(`/account/${o}/api/entity/${a}/saved-views/${n}`,{method:"DELETE",credentials:"include"})).ok&&(i(I=>I.filter(O=>O._id!==n)),k===n&&(N(null),pe({}),fe(I=>({...I,page:1}))))}catch(y){console.error("[RecordsGrid] Delete saved view error:",y)}},[o,a,k]),ke=r.useCallback(async(n,y)=>{try{(await fetch(`/account/${o}/api/entity/${a}/saved-views/${n}`,{method:"PUT",headers:{"Content-Type":"application/json"},credentials:"include",body:JSON.stringify({name:y})})).ok&&i(O=>O.map(w=>w._id===n?{...w,name:y}:w))}catch(I){console.error("[RecordsGrid] Rename saved view error:",I)}},[o,a]),we=r.useCallback(async(n,y,I,O,w)=>{var re;try{const te={filters:y,fieldFilters:I||[]};if(O&&(te.name=O),w&&(te.color=w),(await fetch(`/account/${o}/api/entity/${a}/saved-views/${n}`,{method:"PUT",headers:{"Content-Type":"application/json"},credentials:"include",body:JSON.stringify(te)})).ok){const ne=JSON.parse(JSON.stringify(y||{})),he=JSON.parse(JSON.stringify(I||[]));i(be=>be.map(Le=>{if(Le._id!==n)return Le;const Ee={...Le,filters:ne,fieldFilters:he};return O&&(Ee.name=O),w&&(Ee.color=w),Ee}));const me=O||((re=Y.find(be=>be._id===n))==null?void 0:re.name)||"Vue";ee(`Vue "${me}" mise à jour`)}else ee("Erreur lors de la mise à jour","error")}catch(te){console.error("[RecordsGrid] Update saved view error:",te),ee("Erreur lors de la mise à jour","error")}},[o,a,Y,ee]),xe=r.useCallback(n=>{if(!n){N(null),pe({}),F([]),fe(I=>({...I,page:1}));return}const y=Y.find(I=>I._id===n);y&&(N(n),pe(JSON.parse(JSON.stringify(y.filters||{}))),F(JSON.parse(JSON.stringify(y.fieldFilters||[]))),fe(I=>({...I,page:1})))},[Y]);r.useEffect(()=>{d(),T()},[]);const ye=r.useMemo(()=>{if(!S.length)return[];const{field:n,direction:y}=R.sort,I=y==="asc"?1:-1;return[...S].sort((O,w)=>{let re,te;if(n==="title")re=(O.referenceTitle||O.title||"").toLowerCase(),te=(w.referenceTitle||w.title||"").toLowerCase();else if(n==="createdAt"||n==="updatedAt")re=new Date(O[n]||0).getTime(),te=new Date(w[n]||0).getTime();else{const ae=(O.customFields||[]).find(he=>{var be;const me=((be=he.field_id)==null?void 0:be._id)||he.field_id;return(me==null?void 0:me.toString())===n}),ne=(w.customFields||[]).find(he=>{var be;const me=((be=he.field_id)==null?void 0:be._id)||he.field_id;return(me==null?void 0:me.toString())===n});re=((ae==null?void 0:ae.value)||"").toString().toLowerCase(),te=((ne==null?void 0:ne.value)||"").toString().toLowerCase()}return re<te?-1*I:re>te?1*I:0})},[S,R.sort.field,R.sort.direction]),je=r.useMemo(()=>ye.map(n=>({...n,_searchIndex:[n.title||"",n.referenceTitle||"",n.computedTitle||"",...(n.customFields||[]).map(y=>y.value||"")].join(" ").toLowerCase()})),[ye]),le=r.useCallback((n,y,I,O)=>{let w=n;if(y&&y.trim()){const te=y.toLowerCase();w=w.filter(ae=>ae._searchIndex.includes(te))}const re=Object.keys(I).filter(te=>te!=="__favourites");return re.length>0&&(w=w.filter(te=>{const ae=te.classificationValues||[];return re.every(ne=>{const he=I[ne];return!he||he.length===0?!0:ae.some(me=>{var be,Le;return((be=me.classificationId)==null?void 0:be.toString())===ne&&he.includes((Le=me.optionId)==null?void 0:Le.toString())})})})),O&&O.length>0&&(w=w.filter(te=>{const ae=[[O[0]]];for(let ne=1;ne<O.length;ne++)(O[ne].logic||"AND")==="OR"?ae.push([O[ne]]):ae[ae.length-1].push(O[ne]);return ae.some(ne=>ne.every(he=>{const me=tr(te,he.fieldId);return rr(me,he)}))})),w},[]),Ce=r.useCallback(n=>{var I;const y=typeof n=="string"?n:((I=n==null?void 0:n.target)==null?void 0:I.value)||"";H(y),fe(O=>({...O,page:1}))},[]),Me=r.useCallback(n=>{pe(n),fe(y=>({...y,page:1}))},[]),Ne=r.useCallback(n=>{F(n),fe(y=>({...y,page:1}))},[]);r.useEffect(()=>{const n=le(je,U,de,b);v(n)},[je,U,de,b,le]),r.useEffect(()=>{const n=(A.page-1)*A.limit,y=n+A.limit,I=f.slice(n,y);W(I),fe(O=>({...O,total:f.length,pages:Math.ceil(f.length/A.limit)}))},[f,A.page,A.limit]);const Se=r.useCallback(async n=>{try{await fetch(`/account/${o}/api/user/view-preferences`,{method:"POST",headers:{"Content-Type":"application/json"},credentials:"include",body:JSON.stringify({viewId:s,preferences:n})})}catch(y){console.error("[RecordsGrid] Save preferences error:",y)}},[o,s]),ge=r.useCallback((n,y)=>{const I={...R,[n]:y};ce(I),Se(I),n==="pageSize"&&fe(O=>({...O,limit:y,page:1}))},[R,Se]),Ge=r.useCallback(n=>{q(n),ce(y=>{const I={...y,viewMode:n};return Se(I),I})},[Se]),Re=r.useCallback(n=>{fe(y=>({...y,page:n}))},[]),et=r.useCallback((n,y,I)=>{if(I&&_.current!==null&&_.current!==y){const O=Math.min(_.current,y),w=Math.max(_.current,y);J(re=>{const te=new Set(re);for(let ae=O;ae<=w;ae++)x[ae]&&te.add(x[ae]._id);return te})}else J(O=>{const w=new Set(O);return w.has(n)?w.delete(n):w.add(n),w});_.current=y},[x]),tt=r.useCallback(()=>{J(n=>{const y=x.map(w=>w._id),I=y.every(w=>n.has(w)),O=new Set(n);return I?y.forEach(w=>O.delete(w)):y.forEach(w=>O.add(w)),O})},[x]),rt=r.useCallback(()=>{J(n=>{const y=f.map(I=>I._id);return n.size===y.length?new Set:new Set(y)})},[f]),st=r.useCallback(()=>{J(new Set)},[]),at=r.useMemo(()=>x.length===0?!1:x.every(n=>B.has(n._id)),[x,B]),ot=r.useCallback(async()=>{if(!(B.size===0||!(typeof Swal<"u"?await Swal.fire({title:"Confirmer la suppression",html:`<p>Vous allez supprimer <strong>${B.size}</strong> enregistrement(s).</p><p style="color:#e7515a;font-size:13px;margin-top:8px;">Cette action est irréversible.</p>`,icon:"warning",showCancelButton:!0,confirmButtonColor:"#e7515a",cancelButtonText:"Annuler",confirmButtonText:"Supprimer"}).then(y=>y.isConfirmed):confirm(`Supprimer ${B.size} enregistrement(s) ?`)))){E(!0);try{const I=await(await fetch(`/account/${o}/record/api/bulk-delete`,{method:"POST",headers:{"Content-Type":"application/json"},credentials:"include",body:JSON.stringify({ids:[...B]})})).json();I.success?(p(O=>O.filter(w=>!B.has(w._id))),J(new Set),ee(`${I.deletedCount} enregistrement(s) supprimé(s)`)):ee(I.error||"Erreur lors de la suppression","error")}catch(y){console.error("[RecordsGrid] Bulk delete error:",y),ee("Erreur lors de la suppression","error")}finally{E(!1)}}},[B,o,ee]),nt=r.useCallback((n,y)=>{$(I=>{const O=I.findIndex(ne=>ne.id===n),w=I.findIndex(ne=>ne.id===y);if(O===-1||w===-1)return I;const re=[...I],[te]=re.splice(O,1);re.splice(w,0,te);const ae=re.map(ne=>R.columns.find(me=>me.id===ne.id)||{id:ne.id,visible:!0});return ge("columns",ae),re})},[R.columns,ge]),Ve=r.useMemo(()=>{switch(R.density){case"compact":return 36;case"comfortable":return 56;default:return 44}},[R.density]),We=dt({count:x.length,getScrollElement:()=>ve.current,estimateSize:()=>Ve,overscan:10});r.useEffect(()=>{We.measure()},[Ve,We]);const it=r.useMemo(()=>{var I;let n;(I=R.columns)!=null&&I.length?n=C.filter(O=>{const w=R.columns.find(re=>re.id===O.id);return w?w.visible!==!1:!0}):n=C;const y=n.findIndex(O=>O.id==="actions");if(y>-1&&y<n.length-1){const[O]=n.splice(y,1);n=[...n,O]}return n},[C,R.columns]);return D&&x.length===0?e.jsx("div",{className:"flex items-center justify-center h-64",children:e.jsx("div",{className:"animate-spin rounded-full h-8 w-8 border-b-2 border-primary"})}):M&&x.length===0?e.jsx("div",{className:"flex items-center justify-center h-64 text-danger",children:e.jsxs("span",{children:["Erreur: ",M]})}):e.jsxs("div",{className:"relative flex h-full gap-5 sm:min-h-0",children:[e.jsx(Xt,{entityName:u,entityNamePlural:j,entityIcon:c,accountNumber:o,entitySlug:m,showSidebar:R.showSidebar!==!1,onToggleSidebar:()=>ge("showSidebar",!R.showSidebar),filters:se,activeFilters:de,onFilterChange:Me,columns:C,fieldFilters:b,onFieldFiltersChange:Ne,allRecords:S,sidebarWidth:R.sidebarWidth,onSidebarWidthChange:n=>ge("sidebarWidth",n)}),e.jsxs("div",{className:`panel p-4 flex-1 flex flex-col h-full ${P==="calendar"?"overflow-auto":"overflow-hidden"}`,children:[e.jsx(Ct,{searchQuery:U,onSearch:Ce,columns:C,preferences:R,onPreferencesChange:ge,loading:D,accountNumber:o,entitySlug:m,viewId:s,showSidebar:R.showSidebar!==!1,onToggleSidebar:()=>ge("showSidebar",!R.showSidebar),activeView:P,onViewChange:Ge,enabledViews:R.enabledViews||["table","kanban","notes"],onEnabledViewsChange:n=>ge("enabledViews",n),hasActiveFilters:Object.keys(de).filter(n=>n!=="__favourites").length>0||b.length>0,onOpenSaveView:()=>X(!0)}),e.jsx(er,{savedViews:Y,activeViewId:k,onSelectView:xe,onCreateView:ie,onDeleteView:ue,onRenameView:ke,onUpdateViewFilters:we,hasActiveFilters:Object.keys(de).filter(n=>n!=="__favourites").length>0||b.length>0,activeFilters:de,fieldFilters:b,sidebarFilters:se,columns:C,externalOpenCreate:z,onCloseExternalCreate:()=>X(!1)}),e.jsx("div",{className:`flex-1 flex flex-col mt-4 ${P==="calendar"?"overflow-auto":"overflow-hidden"}`,children:P==="kanban"?e.jsx(It,{records:f,columns:C,accountNumber:o,entitySlug:m,viewId:s,entityData:G}):P==="calendar"?e.jsx(Zt,{records:f,columns:C,accountNumber:o,entitySlug:m,entityData:G}):P==="notes"?e.jsx(Dt,{records:f,accountNumber:o,entitySlug:m}):e.jsxs("div",{className:"dataTable-wrapper flex-1 flex flex-col overflow-hidden",children:[e.jsx("div",{className:"dataTable-container flex-1 overflow-auto",ref:ve,children:e.jsx(Nt,{records:x,columns:it,virtualizer:We,sort:R.sort,onSort:n=>{const y=R.sort.field===n&&R.sort.direction==="asc"?"desc":"asc";ge("sort",{field:n,direction:y})},onColumnReorder:nt,density:R.density,titleDisplay:R.titleDisplay||"avatar",entityIcon:c,accountNumber:o,entitySlug:m,selectedIds:B,onToggleSelect:et,onSelectAll:tt,allPageSelected:at,showCheckboxes:R.showCheckboxes!==!1})}),e.jsxs("div",{className:"dataTable-bottom flex items-center justify-between border-t pt-4 dark:border-gray-800",children:[e.jsxs("div",{className:"dataTable-info text-gray-500 dark:text-gray-400",children:["Affichage de ",(A.page-1)*A.limit+1," à ",Math.min(A.page*A.limit,A.total)," sur ",A.total]}),e.jsx("nav",{className:"dataTable-pagination",children:e.jsxs("ul",{className:"inline-flex items-center space-x-1 rtl:space-x-reverse",children:[e.jsx("li",{children:e.jsx("button",{onClick:()=>Re(A.page-1),disabled:A.page<=1,className:"flex justify-center font-semibold p-2 rounded-full transition bg-white-light text-dark hover:text-white hover:bg-primary dark:text-white-light dark:bg-[#191e3a] dark:hover:bg-primary disabled:opacity-50",children:"«"})}),Array.from({length:Math.min(A.pages,5)},(n,y)=>{let I;return A.pages<=5||A.page<=3?I=y+1:A.page>=A.pages-2?I=A.pages-4+y:I=A.page-2+y,e.jsx("li",{children:e.jsx("button",{onClick:()=>Re(I),className:`flex justify-center font-semibold px-3.5 py-2 rounded-full transition ${I===A.page?"bg-primary text-white dark:bg-primary dark:text-white-light":"bg-white-light text-dark hover:text-white hover:bg-primary dark:text-white-light dark:bg-[#191e3a] dark:hover:bg-primary"}`,children:I})},I)}),e.jsx("li",{children:e.jsx("button",{onClick:()=>Re(A.page+1),disabled:A.page>=A.pages,className:"flex justify-center font-semibold p-2 rounded-full transition bg-white-light text-dark hover:text-white hover:bg-primary dark:text-white-light dark:bg-[#191e3a] dark:hover:bg-primary disabled:opacity-50",children:"»"})})]})})]})]})})]}),B.size>0&&e.jsxs("div",{className:"bulk-action-bar",style:{position:"fixed",bottom:"24px",left:"50%",transform:"translateX(-50%)",zIndex:99999,display:"flex",alignItems:"center",gap:"12px",padding:"10px 20px",borderRadius:"14px",background:"linear-gradient(135deg, #1b2e4b 0%, #0e1726 100%)",boxShadow:"0 8px 32px rgba(0,0,0,0.3), 0 0 0 1px rgba(67,97,238,0.2)",animation:"bulkBarSlideUp 0.3s cubic-bezier(0.16,1,0.3,1)",backdropFilter:"blur(12px)"},children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"8px"},children:[e.jsx("div",{style:{width:28,height:28,borderRadius:"8px",background:"rgba(67,97,238,0.2)",color:"#4361ee",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"12px",fontWeight:700},children:B.size}),e.jsxs("span",{style:{color:"#e0e6ed",fontSize:"13px",fontWeight:500,whiteSpace:"nowrap"},children:["sélectionné",B.size>1?"s":""]})]}),e.jsx("div",{style:{width:1,height:24,background:"rgba(255,255,255,0.1)"}}),B.size<f.length&&e.jsxs("button",{onClick:rt,style:{padding:"6px 12px",borderRadius:"8px",border:"1px solid rgba(67,97,238,0.3)",background:"rgba(67,97,238,0.1)",color:"#93b4fd",fontSize:"12px",fontWeight:600,cursor:"pointer",transition:"all 0.15s",whiteSpace:"nowrap"},onMouseEnter:n=>{n.target.style.background="rgba(67,97,238,0.2)",n.target.style.color="#b8cffe"},onMouseLeave:n=>{n.target.style.background="rgba(67,97,238,0.1)",n.target.style.color="#93b4fd"},children:["Tout sélectionner (",f.length,")"]}),e.jsx("div",{style:{width:1,height:24,background:"rgba(255,255,255,0.1)"}}),e.jsxs("button",{onClick:ot,disabled:L,style:{display:"flex",alignItems:"center",gap:"6px",padding:"6px 14px",borderRadius:"8px",border:"none",background:"rgba(231,81,90,0.15)",color:"#ff6b6b",fontSize:"12px",fontWeight:600,cursor:L?"wait":"pointer",transition:"all 0.15s",whiteSpace:"nowrap",opacity:L?.6:1},onMouseEnter:n=>{L||(n.target.style.background="rgba(231,81,90,0.25)",n.target.style.color="#ff8a8a")},onMouseLeave:n=>{n.target.style.background="rgba(231,81,90,0.15)",n.target.style.color="#ff6b6b"},children:[e.jsxs("svg",{viewBox:"0 0 24 24",fill:"none",style:{width:14,height:14},children:[e.jsx("path",{d:"M20.5 6H3.5",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"}),e.jsx("path",{d:"M18.833 8.5L18.373 15.4C18.196 18.054 18.108 19.381 17.243 20.19C16.378 21 15.048 21 12.387 21H11.613C8.952 21 7.622 21 6.757 20.19C5.892 19.381 5.804 18.054 5.627 15.4L5.167 8.5",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"})]}),L?"Suppression...":"Supprimer"]}),e.jsx("div",{style:{width:1,height:24,background:"rgba(255,255,255,0.1)"}}),e.jsx("button",{onClick:st,style:{width:28,height:28,borderRadius:"8px",border:"none",background:"rgba(255,255,255,0.08)",color:"#888ea8",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",transition:"all 0.15s"},onMouseEnter:n=>{n.target.style.background="rgba(255,255,255,0.15)",n.target.style.color="#e0e6ed"},onMouseLeave:n=>{n.target.style.background="rgba(255,255,255,0.08)",n.target.style.color="#888ea8"},title:"Désélectionner tout",children:e.jsx("svg",{viewBox:"0 0 24 24",fill:"none",style:{width:14,height:14},children:e.jsx("path",{d:"M18 6L6 18M6 6L18 18",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round"})})})]}),Q&&e.jsxs("div",{style:{position:"fixed",bottom:B.size>0?"80px":"24px",right:"24px",zIndex:99999,padding:"10px 20px",borderRadius:"10px",fontSize:"13px",fontWeight:500,color:"#fff",background:Q.type==="error"?"#e7515a":"#00ab55",boxShadow:"0 4px 20px rgba(0,0,0,0.15)",animation:"toastSlideIn 0.25s ease-out",display:"flex",alignItems:"center",gap:"8px",transition:"bottom 0.3s ease"},children:[e.jsx("svg",{viewBox:"0 0 24 24",fill:"none",style:{width:16,height:16,flexShrink:0},children:Q.type==="error"?e.jsx("path",{d:"M12 8V12M12 16H12.01M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"}):e.jsx("path",{d:"M5 13L9 17L19 7",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round"})}),Q.message]}),e.jsx("style",{children:`
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
            `})]})}function qe(){document.querySelectorAll('[data-island="records-grid"]').forEach(t=>{if(t.dataset.mounted==="1")return;t.dataset.mounted="1";const o={accountId:t.dataset.accountId,accountNumber:t.dataset.accountNumber,entityId:t.dataset.entityId,viewId:t.dataset.viewId,entityName:t.dataset.entityName||"Records",entityNamePlural:t.dataset.entityNamePlural||"",entitySlug:t.dataset.entitySlug||"records"};console.log("[RecordsGrid Island] Mounting:",o),lt(t).render(e.jsx($e.StrictMode,{children:e.jsx(sr,{...o})}))})}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",qe):qe();
