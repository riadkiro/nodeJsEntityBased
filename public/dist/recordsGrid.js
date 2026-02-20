import{r,j as e,a as _e,R as We,c as rt}from"./chunks/client-CkWOIrXP.js";import{u as st}from"./chunks/index-CjVSFo3p.js";import{u as at,a as Ee,D as ot,c as it,b as nt,d as lt,s as dt,K as ct,T as pt,M as ut,e as xt,S as ft,v as ht,f as mt,C as gt}from"./chunks/sortable.esm-DQ9-A8Dw.js";const Ve=[{id:"table",label:"Tableau",icon:e.jsxs("svg",{viewBox:"0 0 24 24",fill:"none",className:"h-4 w-4",children:[e.jsx("path",{d:"M3 7H21",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"}),e.jsx("path",{d:"M3 12H21",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"}),e.jsx("path",{d:"M3 17H21",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"})]})},{id:"kanban",label:"Kanban",icon:e.jsxs("svg",{viewBox:"0 0 24 24",fill:"none",className:"h-4 w-4",children:[e.jsx("rect",{x:"3",y:"3",width:"5",height:"18",rx:"1",stroke:"currentColor",strokeWidth:"1.5"}),e.jsx("rect",{x:"10",y:"3",width:"5",height:"12",rx:"1",stroke:"currentColor",strokeWidth:"1.5"}),e.jsx("rect",{x:"17",y:"3",width:"4",height:"15",rx:"1",stroke:"currentColor",strokeWidth:"1.5"})]})},{id:"notes",label:"Notes",icon:e.jsxs("svg",{viewBox:"0 0 24 24",fill:"none",className:"h-4 w-4",children:[e.jsx("path",{d:"M2 12C2 7.28595 2 4.92893 3.46447 3.46447C4.92893 2 7.28595 2 12 2C16.714 2 19.0711 2 20.5355 3.46447C22 4.92893 22 7.28595 22 12C22 16.714 22 19.0711 20.5355 20.5355C19.0711 22 16.714 22 12 22C7.28595 22 4.92893 22 3.46447 20.5355C2 19.0711 2 16.714 2 12Z",stroke:"currentColor",strokeWidth:"1.5"}),e.jsx("path",{opacity:"0.5",d:"M2 12H22",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"}),e.jsx("path",{opacity:"0.5",d:"M12 2V22",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"})]})}];function bt({searchQuery:t,onSearch:o,columns:d,preferences:a,onPreferencesChange:N,loading:M,accountNumber:j,entitySlug:_,viewId:u,showSidebar:x,onToggleSidebar:b,activeView:p,onViewChange:I,enabledViews:w=["table","kanban","notes"],onEnabledViewsChange:W,hasActiveFilters:F=!1,onOpenSaveView:G}){var oe,ce,he;const[Q,m]=r.useState(!1),[C,y]=r.useState(!1),[V,H]=r.useState(!1),[c,i]=r.useState(!1),[X,J]=r.useState(""),O=r.useRef(null),v=r.useRef(null),Z=r.useRef(null),ee=r.useRef(null),T=r.useRef(null),de=r.useRef(null),le=r.useRef(null),g=r.useRef(null),R=()=>{m(!1),y(!1),H(!1),i(!1)};r.useEffect(()=>{const l=A=>{A.key==="Escape"&&R()};return document.addEventListener("keydown",l),()=>document.removeEventListener("keydown",l)},[]);const z=(l,A,Y,D)=>{r.useEffect(()=>{const me=K=>{l&&A.current&&!A.current.contains(K.target)&&Y.current&&!Y.current.contains(K.target)&&D(!1)};return l&&setTimeout(()=>document.addEventListener("mousedown",me),0),()=>document.removeEventListener("mousedown",me)},[l])};z(Q,T,O,m),z(C,de,v,y),z(V,le,Z,H),z(c,g,ee,i);const L=l=>{if(l==="table")return;const A=w.includes(l)?w.filter(Y=>Y!==l):[...w,l];W(A),p===l&&!A.includes(l)&&I("table")},P=Ve.filter(l=>w.includes(l.id)),E=l=>{const A=a.columns.some(D=>D.id===l);let Y;A?Y=a.columns.map(D=>D.id===l?{...D,visible:!D.visible}:D):Y=[...a.columns,{id:l,visible:!1}],N("columns",Y)},B=l=>{if(!(l!=null&&l.current))return{top:0,right:0};const A=l.current.getBoundingClientRect();return{top:A.bottom+8,right:window.innerWidth-A.right}},re=X.trim()?d.filter(l=>l.name.toLowerCase().includes(X.toLowerCase())):d;return e.jsxs("div",{className:"dataTable-top flex items-center mb-0 justify-between gap-2",children:[e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsxs("a",{href:`/account/${j}/record/${_}/add`,className:"btn-add-expandable block rounded-full p-2 bg-white-light/40 hover:bg-white-light/90 hover:text-primary dark:bg-dark/40 dark:hover:bg-dark/60",title:"Ajouter",children:[e.jsx("svg",{className:"btn-add-icon",viewBox:"0 0 24 24",fill:"none",children:e.jsx("path",{d:"M12 5V19M5 12H19",stroke:"currentColor",strokeWidth:"2.5",strokeLinecap:"round"})}),e.jsx("span",{className:"btn-add-label",children:"Ajouter"})]}),e.jsxs("div",{className:"dataTable-search relative w-64",style:{marginLeft:0},children:[e.jsxs("svg",{className:"absolute left-4 top-1/2 ml-2 -translate-y-1/2 h-4 w-4 text-gray-400",viewBox:"0 0 24 24",fill:"none",children:[e.jsx("circle",{cx:"11",cy:"11",r:"8",stroke:"currentColor",strokeWidth:"1.5"}),e.jsx("path",{d:"M16.5 16.5L21 21",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"})]}),e.jsx("input",{type:"text",value:t,onChange:l=>o(l.target.value),placeholder:"Rechercher...",className:"dataTable-input form-input w-full pl-11 pr-10",style:{"padding-left":"33px"}}),M&&e.jsx("div",{className:"absolute right-3 top-1/2 -translate-y-1/2",children:e.jsx("div",{className:"animate-spin rounded-full h-4 w-4 border-b-2 border-primary"})})]})]}),e.jsxs("div",{className:"flex items-center gap-2",children:[P.map(l=>e.jsx("button",{type:"button",onClick:()=>I(l.id),title:l.label,className:`block rounded-full p-2 transition-all ${p===l.id?"bg-primary/20 text-primary":"bg-white-light/40 hover:bg-white-light/90 hover:text-primary dark:bg-dark/40 dark:hover:bg-dark/60"}`,children:l.icon},l.id)),e.jsx("button",{ref:ee,type:"button",onClick:()=>{i(!c),m(!1),y(!1),H(!1)},className:`block rounded-full p-2 transition-all ${c?"bg-primary/20 text-primary":"bg-white-light/40 hover:bg-white-light/90 hover:text-primary dark:bg-dark/40 dark:hover:bg-dark/60"}`,title:"Configurer les vues",children:e.jsxs("svg",{className:"h-4 w-4",viewBox:"0 0 24 24",fill:"none",children:[e.jsx("circle",{cx:"12",cy:"12",r:"3",stroke:"currentColor",strokeWidth:"1.5"}),e.jsx("path",{d:"M12 2V4M12 20V22M2 12H4M20 12H22M4.93 4.93L6.34 6.34M17.66 17.66L19.07 19.07M4.93 19.07L6.34 17.66M17.66 6.34L19.07 4.93",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"})]})}),e.jsx("div",{className:"w-px h-5 bg-gray-200 dark:bg-gray-700 mx-0.5"}),e.jsx("button",{type:"button",onClick:G,className:`block rounded-full p-2 transition-all ${F?"bg-primary/20 text-primary":"bg-white-light/40 hover:bg-white-light/90 hover:text-primary dark:bg-dark/40 dark:hover:bg-dark/60"}`,title:"Filtrer & enregistrer la vue",children:e.jsx("svg",{className:"h-4 w-4",viewBox:"0 0 24 24",fill:"none",children:e.jsx("path",{d:"M22 3H2L10 12.46V19L14 21V12.46L22 3Z",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round"})})}),p==="table"&&(()=>{var A,Y;const l=((A=a.sort)==null?void 0:A.field)!=="createdAt"||((Y=a.sort)==null?void 0:Y.direction)!=="desc";return e.jsx("button",{ref:v,type:"button",onClick:()=>{y(!C),m(!1),H(!1),i(!1)},className:`block rounded-full p-2 transition-all ${C||l?"bg-primary/20 text-primary":"bg-white-light/40 hover:bg-white-light/90 hover:text-primary dark:bg-dark/40 dark:hover:bg-dark/60"}`,title:"Trier",children:e.jsxs("svg",{className:"h-4 w-4",viewBox:"0 0 24 24",fill:"none",children:[e.jsx("path",{d:"M16 18L16 6M16 6L20 10M16 6L12 10",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round"}),e.jsx("path",{d:"M8 6L8 18M8 18L12 14M8 18L4 14",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round"})]})})})(),e.jsx("button",{ref:O,type:"button",onClick:()=>{m(!Q),y(!1),H(!1),i(!1)},className:`block rounded-full p-2 transition-all ${Q?"bg-primary/20 text-primary":"bg-white-light/40 hover:bg-white-light/90 hover:text-primary dark:bg-dark/40 dark:hover:bg-dark/60"}`,title:"Mode d'affichage",children:e.jsxs("svg",{className:"h-4 w-4",viewBox:"0 0 24 24",fill:"none",children:[e.jsx("path",{d:"M3 7H21",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"}),e.jsx("path",{d:"M6 12H18",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"}),e.jsx("path",{d:"M10 17H14",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"})]})}),p==="table"&&e.jsx("button",{ref:Z,type:"button",onClick:()=>{H(!V),m(!1),y(!1),i(!1)},className:`block rounded-full p-2 transition-all ${V?"bg-primary/20 text-primary":"bg-white-light/40 hover:bg-white-light/90 hover:text-primary dark:bg-dark/40 dark:hover:bg-dark/60"}`,title:"Colonnes visibles",children:e.jsxs("svg",{className:"h-4 w-4",viewBox:"0 0 24 24",fill:"none",children:[e.jsx("path",{d:"M9 3H4C3.44772 3 3 3.44772 3 4V11C3 11.5523 3.44772 12 4 12H9C9.55228 12 10 11.5523 10 11V4C10 3.44772 9.55228 3 9 3Z",stroke:"currentColor",strokeWidth:"1.5"}),e.jsx("path",{d:"M20 3H15C14.4477 3 14 3.44772 14 4V7C14 7.55228 14.4477 8 15 8H20C20.5523 8 21 7.55228 21 7V4C21 3.44772 20.5523 3 20 3Z",stroke:"currentColor",strokeWidth:"1.5"}),e.jsx("path",{d:"M20 12H15C14.4477 12 14 12.4477 14 13V20C14 20.5523 14.4477 21 15 21H20C20.5523 21 21 20.5523 21 20V13C21 12.4477 20.5523 12 20 12Z",stroke:"currentColor",strokeWidth:"1.5"}),e.jsx("path",{d:"M9 16H4C3.44772 16 3 16.4477 3 17V20C3 20.5523 3.44772 21 4 21H9C9.55228 21 10 20.5523 10 20V17C10 16.4477 9.55228 16 9 16Z",stroke:"currentColor",strokeWidth:"1.5"})]})}),e.jsxs("button",{type:"button",onClick:b,className:"btn-sidebar-toggle block rounded-full p-2 bg-white-light/40 hover:bg-white-light/90 hover:text-primary dark:bg-dark/40 dark:hover:bg-dark/60",title:x?"Masquer le panneau":"Afficher le panneau",children:[e.jsxs("svg",{className:"btn-sidebar-icon",viewBox:"0 0 24 24",fill:"none",children:[e.jsx("rect",{x:"3",y:"3",width:"18",height:"18",rx:"2",stroke:"currentColor",strokeWidth:"1.5"}),e.jsx("path",{d:"M9 3V21",stroke:"currentColor",strokeWidth:"1.5"})]}),e.jsx("span",{className:"btn-sidebar-label",children:x?"Masquer":"Panneau"})]})]}),C&&_e.createPortal(e.jsxs(e.Fragment,{children:[e.jsx("div",{className:"fixed inset-0",style:{zIndex:9998},onClick:()=>y(!1)}),e.jsxs("div",{ref:de,className:"fixed rounded-xl shadow-xl p-4 w-72 bg-white dark:bg-[#0e1726] border border-gray-100 dark:border-white/10",style:{zIndex:9999,top:B(v).top,right:B(v).right,animation:"popoverSlide 0.15s ease-out"},children:[e.jsx("div",{className:"text-xs font-medium text-gray-500 dark:text-white-dark mb-2",children:"Trier par"}),e.jsxs("div",{className:"flex gap-2",children:[e.jsxs("select",{value:((oe=a.sort)==null?void 0:oe.field)||"createdAt",onChange:l=>N("sort",{...a.sort,field:l.target.value}),className:"flex-1 px-2 py-1.5 text-xs border border-gray-200 dark:border-white/10 rounded-lg bg-white dark:bg-[#1b2e4b] text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary/50",children:[e.jsx("option",{value:"createdAt",children:"Date de création"}),e.jsx("option",{value:"title",children:"Titre"}),d.filter(l=>l.id!=="title"&&l.id!=="actions").map(l=>e.jsx("option",{value:l.id,children:l.name},l.id))]}),e.jsx("button",{onClick:()=>{var l;return N("sort",{...a.sort,direction:((l=a.sort)==null?void 0:l.direction)==="asc"?"desc":"asc"})},className:"p-1.5 border border-gray-200 dark:border-white/10 rounded-lg bg-white dark:bg-[#1b2e4b] hover:bg-gray-50 dark:hover:bg-[#253b5c] transition-all",title:((ce=a.sort)==null?void 0:ce.direction)==="asc"?"Croissant":"Décroissant",children:e.jsx("svg",{className:`h-4 w-4 text-gray-600 dark:text-white transition-transform ${((he=a.sort)==null?void 0:he.direction)==="asc"?"rotate-180":""}`,viewBox:"0 0 24 24",fill:"none",children:e.jsx("path",{d:"M12 5V19M12 19L6 13M12 19L18 13",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round"})})}),e.jsx("button",{onClick:()=>N("sort",{field:"createdAt",direction:"desc"}),className:"p-1.5 border border-gray-200 dark:border-white/10 rounded-lg bg-white dark:bg-[#1b2e4b] hover:bg-red-50 hover:border-red-300 hover:text-red-500 dark:hover:bg-red-900/20 transition-all",title:"Réinitialiser le tri",children:e.jsxs("svg",{className:"h-4 w-4 text-gray-600 dark:text-white",viewBox:"0 0 24 24",fill:"none",children:[e.jsx("path",{d:"M4.06189 13C4.02104 12.6724 4 12.3387 4 12C4 7.58172 7.58172 4 12 4C14.5006 4 16.7332 5.14727 18.2002 6.94416M19.9381 11C19.979 11.3276 20 11.6613 20 12C20 16.4183 16.4183 20 12 20C9.49944 20 7.26681 18.8527 5.79984 17.0558",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round"}),e.jsx("path",{d:"M15 7H19V3",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round"}),e.jsx("path",{d:"M9 17H5V21",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round"})]})})]})]})]}),document.body),Q&&_e.createPortal(e.jsxs(e.Fragment,{children:[e.jsx("div",{className:"fixed inset-0",style:{zIndex:9998},onClick:()=>m(!1)}),e.jsxs("div",{ref:T,className:"fixed rounded-xl shadow-xl p-4 w-72 bg-white dark:bg-[#0e1726] border border-gray-100 dark:border-white/10",style:{zIndex:9999,top:B(O).top,right:B(O).right,animation:"popoverSlide 0.15s ease-out"},children:[e.jsxs("div",{className:"mb-4",children:[e.jsx("div",{className:"text-xs font-medium text-gray-500 dark:text-white-dark mb-2",children:"Densité"}),e.jsx("div",{className:"flex gap-1",children:["compact","normal","comfortable"].map(l=>e.jsx("button",{onClick:()=>N("density",l),className:`flex-1 px-2 py-1.5 text-xs rounded-lg transition-all ${a.density===l?"bg-primary text-white":"bg-gray-100 dark:bg-dark/40 text-gray-600 dark:text-white-dark/70 hover:bg-gray-200 dark:hover:bg-dark/60"}`,children:l==="compact"?"Compact":l==="normal"?"Normal":"Confort"},l))})]}),e.jsxs("div",{className:"mb-4",children:[e.jsx("div",{className:"text-xs font-medium text-gray-500 dark:text-white-dark mb-2",children:"Lignes par page"}),e.jsx("div",{className:"flex gap-1",children:[10,25,50,100].map(l=>e.jsx("button",{onClick:()=>N("pageSize",l),className:`flex-1 px-2 py-1.5 text-xs rounded-lg transition-all ${a.pageSize===l?"bg-primary text-white":"bg-gray-100 dark:bg-dark/40 text-gray-600 dark:text-white-dark/70 hover:bg-gray-200 dark:hover:bg-dark/60"}`,children:l},l))})]})]})]}),document.body),V&&_e.createPortal(e.jsxs(e.Fragment,{children:[e.jsx("div",{className:"fixed inset-0",style:{zIndex:9998},onClick:()=>H(!1)}),e.jsxs("div",{ref:le,className:"fixed rounded-xl shadow-xl p-4 w-64 bg-white dark:bg-[#0e1726] border border-gray-100 dark:border-white/10",style:{zIndex:9999,top:B(Z).top,right:B(Z).right,animation:"popoverSlide 0.15s ease-out"},children:[e.jsx("div",{className:"text-xs font-medium text-gray-500 dark:text-white-dark mb-2",children:"Colonnes visibles"}),e.jsx("div",{className:"relative mb-2",children:e.jsx("input",{type:"text",value:X,onChange:l=>J(l.target.value),placeholder:"Filtrer...",className:"w-full px-3 py-1.5 text-xs border border-gray-200 dark:border-white/10 rounded-lg bg-white dark:bg-[#1b2e4b] text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary/50"})}),e.jsx("div",{className:"space-y-0.5 max-h-48 overflow-y-auto",children:re.map(l=>{const A=a.columns.find(D=>D.id===l.id),Y=A?A.visible!==!1:!0;return e.jsxs("label",{className:"flex items-center gap-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 px-2 py-1.5 rounded-lg",children:[e.jsx("input",{type:"checkbox",checked:Y,onChange:()=>E(l.id),className:"form-checkbox text-primary w-3.5 h-3.5 rounded"}),e.jsx("span",{className:"text-xs text-gray-700 dark:text-gray-300",children:l.name})]},l.id)})}),e.jsx("div",{className:"border-t border-gray-100 dark:border-white/10 mt-3 mb-2"}),e.jsxs("div",{children:[e.jsx("div",{className:"text-xs font-medium text-gray-500 dark:text-white-dark mb-2",children:"Affichage titre"}),e.jsx("div",{className:"flex gap-1",children:[{value:"avatar",label:"Avatar"},{value:"icon",label:"Icône"},{value:"none",label:"Aucun"}].map(l=>e.jsx("button",{onClick:()=>N("titleDisplay",l.value),className:`flex-1 px-2 py-1.5 text-xs rounded-lg transition-all ${(a.titleDisplay||"avatar")===l.value?"bg-primary text-white":"bg-gray-100 dark:bg-dark/40 text-gray-600 dark:text-white-dark/70 hover:bg-gray-200 dark:hover:bg-dark/60"}`,children:l.label},l.value))})]}),e.jsx("div",{className:"border-t border-gray-100 dark:border-white/10 mt-3 mb-2"}),e.jsx("div",{children:e.jsxs("div",{className:"flex items-center justify-between",children:[e.jsx("span",{className:"text-xs font-medium text-gray-500 dark:text-white-dark",children:"Sélection multiple"}),e.jsx("button",{type:"button",onClick:()=>N("showCheckboxes",a.showCheckboxes===!1),style:{position:"relative",width:36,height:20,borderRadius:10,border:"none",cursor:"pointer",transition:"background 0.2s ease",background:a.showCheckboxes!==!1?"#4361ee":"#d1d5db",padding:0},children:e.jsx("span",{style:{position:"absolute",top:2,left:a.showCheckboxes!==!1?18:2,width:16,height:16,borderRadius:"50%",background:"#fff",boxShadow:"0 1px 3px rgba(0,0,0,0.2)",transition:"left 0.2s ease"}})})]})})]})]}),document.body),c&&_e.createPortal(e.jsxs(e.Fragment,{children:[e.jsx("div",{className:"fixed inset-0",style:{zIndex:9998},onClick:()=>i(!1)}),e.jsxs("div",{ref:g,className:"fixed rounded-xl shadow-xl p-4 w-64 bg-white dark:bg-[#0e1726] border border-gray-100 dark:border-white/10",style:{zIndex:9999,top:B(ee).top,right:B(ee).right,animation:"popoverSlide 0.15s ease-out"},children:[e.jsx("div",{className:"text-xs font-medium text-gray-500 dark:text-white-dark mb-3",children:"Vues disponibles"}),e.jsx("div",{className:"space-y-1",children:Ve.map(l=>{const A=w.includes(l.id),Y=l.id==="table";return e.jsxs("label",{className:`flex items-center gap-3 cursor-pointer px-2 py-2 rounded-lg transition-all ${Y?"opacity-60 cursor-not-allowed":"hover:bg-gray-50 dark:hover:bg-gray-800"}`,children:[e.jsx("input",{type:"checkbox",checked:A,onChange:()=>L(l.id),disabled:Y,className:"form-checkbox text-primary w-4 h-4 rounded"}),e.jsxs("span",{className:`flex items-center gap-2 text-sm ${A?"text-gray-700 dark:text-gray-300":"text-gray-400 dark:text-gray-600"}`,children:[l.icon,l.label]})]},l.id)})}),e.jsx("div",{className:"border-t border-gray-100 dark:border-white/10 mt-3 pt-2",children:e.jsx("p",{className:"text-[10px] text-gray-400 dark:text-gray-600",children:"Le tableau est toujours activé par défaut."})})]})]}),document.body),e.jsx("style",{children:`
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
            `})]})}function vt({records:t,columns:o,virtualizer:d,sort:a,onSort:N,onColumnReorder:M,density:j,titleDisplay:_,entityIcon:u,accountNumber:x,entitySlug:b,selectedIds:p,onToggleSelect:I,onSelectAll:w,allPageSelected:W,showCheckboxes:F=!0}){var c;const[G,Q]=r.useState(null),[m,C]=r.useState(null),y=d.getVirtualItems(),V={compact:{rowHeight:36,cellClass:"py-1",fontSize:"text-xs",imageSize:"w-6 h-6",fontWeight:"font-medium"},normal:{rowHeight:44,cellClass:"py-2",fontSize:"text-sm",imageSize:"w-9 h-9",fontWeight:"font-semibold"},comfortable:{rowHeight:56,cellClass:"py-3",fontSize:"text-sm",imageSize:"w-9 h-9",fontWeight:"font-semibold"}},H=V[j]||V.comfortable;return p&&p.size>0,e.jsxs("table",{className:"table-hover whitespace-nowrap dataTable-table w-full",children:[e.jsx("thead",{className:"sticky top-0 bg-white dark:bg-[#1b2e4b] z-10",children:e.jsxs("tr",{children:[F&&e.jsx("th",{style:{width:40,padding:"0 8px"},children:e.jsxs("label",{className:"bulk-checkbox-wrapper",style:{display:"flex",alignItems:"center",justifyContent:"center"},children:[e.jsx("input",{type:"checkbox",checked:W&&t.length>0,onChange:()=>w&&w(),className:"bulk-checkbox"}),e.jsx("span",{className:"bulk-checkbox-custom"})]})}),o.map(i=>{const X=(a==null?void 0:a.field)===i.id||i.id==="title"&&(a==null?void 0:a.field)==="title"||i.id==="createdAt"&&(a==null?void 0:a.field)==="createdAt",J=(a==null?void 0:a.direction)||"desc",O=G===i.id,v=m===i.id&&G!==i.id,Z=i.id!=="actions";return e.jsx("th",{"data-sortable":i.sortable!==!1?"":void 0,"data-column-id":i.id,onDragEnter:ee=>{ee.preventDefault(),i.id!=="actions"&&G&&G!==i.id&&C(i.id)},onDragOver:ee=>{ee.preventDefault()},onDrop:ee=>{ee.preventDefault(),G&&G!==i.id&&i.id!=="actions"&&M&&M(G,i.id),Q(null),C(null)},className:`px-2 ${i.id==="actions"?"sticky right-0 z-20":""} ${O?"opacity-50":""} ${v?"border-l-2 border-l-primary bg-primary/5":""}`,style:{transition:"opacity 0.15s, border-color 0.15s, background 0.15s",...i.id==="actions"?{width:"1%",whiteSpace:"nowrap"}:{}},children:e.jsxs("div",{className:"flex items-center gap-1",children:[Z&&e.jsx("span",{draggable:"true",onDragStart:ee=>{Q(i.id),ee.dataTransfer.effectAllowed="move",ee.dataTransfer.setData("text/plain",i.id)},onDragEnd:()=>{Q(null),C(null)},className:"cursor-grab text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300",children:e.jsxs("svg",{className:"h-3 w-3",viewBox:"0 0 24 24",fill:"currentColor",children:[e.jsx("circle",{cx:"9",cy:"6",r:"1.5"}),e.jsx("circle",{cx:"15",cy:"6",r:"1.5"}),e.jsx("circle",{cx:"9",cy:"12",r:"1.5"}),e.jsx("circle",{cx:"15",cy:"12",r:"1.5"}),e.jsx("circle",{cx:"9",cy:"18",r:"1.5"}),e.jsx("circle",{cx:"15",cy:"18",r:"1.5"})]})}),i.sortable!==!1?e.jsxs("a",{href:"#",className:"dataTable-sorter flex items-center gap-1",draggable:"false",onClick:ee=>{ee.preventDefault(),N(i.id)},children:[i.name,X&&e.jsx("svg",{className:`h-3 w-3 text-primary transition-transform ${J==="asc"?"rotate-180":""}`,viewBox:"0 0 24 24",fill:"none",children:e.jsx("path",{d:"M12 5V19M12 19L6 13M12 19L18 13",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round"})})]}):i.name]})},i.id)})]})}),e.jsxs("tbody",{children:[y.length>0&&y[0].start>0&&e.jsx("tr",{children:e.jsx("td",{colSpan:o.length+1,style:{height:y[0].start,padding:0}})}),y.map(i=>{const X=t[i.index];if(!X)return null;const J={compact:"4px 8px",normal:"8px 12px",comfortable:"12px 12px"}[j]||"12px 12px",O=p&&p.has(X._id);return e.jsxs("tr",{"data-index":i.index,ref:d.measureElement,style:{minHeight:H.rowHeight},className:O?"bulk-row-selected":"",children:[F&&e.jsx("td",{style:{padding:"0 8px",width:40},children:e.jsxs("label",{className:"bulk-checkbox-wrapper",style:{display:"flex",alignItems:"center",justifyContent:"center"},onClick:v=>{v.preventDefault(),I&&I(X._id,i.index,v.shiftKey)},children:[e.jsx("input",{type:"checkbox",checked:O,readOnly:!0,className:"bulk-checkbox"}),e.jsx("span",{className:"bulk-checkbox-custom"})]})}),o.map(v=>e.jsx("td",{className:`${H.fontSize} ${v.id==="actions"?"sticky right-0 bg-white dark:bg-gray-900":""}`,style:{padding:J,...v.id==="actions"?{width:"1%",whiteSpace:"nowrap"}:{}},children:kt(X,v,x,b,H,_,u)},v.id))]},X._id)}),y.length>0&&e.jsx("tr",{children:e.jsx("td",{colSpan:o.length+1,style:{height:Math.max(0,d.getTotalSize()-(((c=y[y.length-1])==null?void 0:c.end)||0)),padding:0}})})]})]})}function kt(t,o,d,a,N,M,j){var _,u;switch(o.id){case"title":{const x=t.referenceTitle||t.title||"Sans titre";x.charAt(0).toUpperCase();const b=Math.abs(x.charCodeAt(0)||65)%35+1,p=t.image||`/assets/images/profile-${b}.jpeg`;return e.jsxs("div",{className:"flex items-center gap-2",children:[M==="avatar"&&e.jsx("img",{src:p,alt:x,className:`${N.imageSize} rounded-full max-w-none`}),M==="icon"&&j&&e.jsx("div",{className:`${N.imageSize} rounded-lg max-w-none flex items-center justify-center bg-primary/10 text-primary shrink-0`,children:e.jsx("iconify-icon",{icon:j,width:"16"})}),e.jsx("a",{href:`/account/${d}/record/${a}/${t._id}/edit`,className:`${N.fontWeight} hover:text-primary transition-colors`,children:x})]})}case"createdAt":return new Date(t.createdAt).toLocaleDateString("fr-FR");case"actions":return e.jsxs("div",{className:"flex items-center gap-0",children:[e.jsx("a",{href:`/account/${d}/record/${a}/${t._id}`,className:"p-1 rounded-lg text-gray-500 hover:text-primary hover:bg-primary/10 transition-all",title:"Voir",children:e.jsxs("svg",{className:"h-4 w-4",viewBox:"0 0 24 24",fill:"none",children:[e.jsx("path",{d:"M15 12C15 13.6569 13.6569 15 12 15C10.3431 15 9 13.6569 9 12C9 10.3431 10.3431 9 12 9C13.6569 9 15 10.3431 15 12Z",stroke:"currentColor",strokeWidth:"1.5"}),e.jsx("path",{d:"M12 5C7.5 5 3.73 7.94 2 12C3.73 16.06 7.5 19 12 19C16.5 19 20.27 16.06 22 12C20.27 7.94 16.5 5 12 5Z",stroke:"currentColor",strokeWidth:"1.5"})]})}),e.jsx("a",{href:`/account/${d}/record/${a}/${t._id}/edit`,className:"p-1 rounded-lg text-gray-500 hover:text-info hover:bg-info/10 transition-all",title:"Modifier",children:e.jsx("svg",{className:"h-4 w-4",viewBox:"0 0 24 24",fill:"none",children:e.jsx("path",{d:"M16.862 4.487L18.55 2.8C19.33 2.02 20.59 2.02 21.37 2.8C22.15 3.58 22.15 4.84 21.37 5.62L19.681 7.307M16.862 4.487L4.162 17.187C3.882 17.467 3.682 17.818 3.592 18.198L2.732 21.596C2.642 21.966 2.952 22.296 3.322 22.226L6.892 21.556C7.242 21.486 7.572 21.306 7.832 21.046L20.513 8.366M16.862 4.487L19.681 7.307",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round"})})}),e.jsx("button",{type:"button",className:"p-1 rounded-lg text-gray-500 hover:text-danger hover:bg-danger/10 transition-all",title:"Supprimer",onClick:()=>{confirm("Êtes-vous sûr de vouloir supprimer cet enregistrement ?")&&console.log("Delete record:",t._id)},children:e.jsxs("svg",{className:"h-4 w-4",viewBox:"0 0 24 24",fill:"none",children:[e.jsx("path",{d:"M20.5 6H3.5",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"}),e.jsx("path",{d:"M18.833 8.5L18.373 15.4C18.196 18.054 18.108 19.381 17.243 20.19C16.378 21 15.048 21 12.387 21H11.613C8.952 21 7.622 21 6.757 20.19C5.892 19.381 5.804 18.054 5.627 15.4L5.167 8.5",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"}),e.jsx("path",{d:"M9.5 11L10 16",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"}),e.jsx("path",{d:"M14.5 11L14 16",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"}),e.jsx("path",{d:"M6.5 6C6.556 5.367 6.612 5.1 6.877 4.714C7.178 4.275 7.945 3.917 9.484 3.2L9.924 2.984C10.683 2.589 11.06 2.392 11.476 2.318C11.823 2.254 12.177 2.254 12.524 2.318C12.94 2.392 13.317 2.589 14.076 2.984L14.516 3.2C16.055 3.917 16.822 4.275 17.123 4.714C17.388 5.1 17.444 5.367 17.5 6",stroke:"currentColor",strokeWidth:"1.5"})]})})]});default:{if(o.id.startsWith("rel:")){const x=o.id.substring(4),p=(((_=t._denorm)==null?void 0:_.relations)||[]).find(w=>w.relationKey===x);if(((u=p==null?void 0:p.records)==null?void 0:u.length)>0)return e.jsx("div",{className:"flex flex-wrap gap-1",children:p.records.map((w,W)=>e.jsx("a",{href:`/account/${d}/record/${w.entitySlug||a}/${w._id}`,className:"text-primary hover:underline text-xs",children:w.title||"Sans titre"},W))});const I=(t.relations||[]).find(w=>w.relationKey===x);return I!=null&&I.value?"—":""}if(o.id.startsWith("classif:")){const x=o.id.substring(8),b=(t.classificationValues||[]).find(p=>{var w,W,F;return(((w=p.classificationId)==null?void 0:w.$oid)||((F=(W=p.classificationId)==null?void 0:W.toString)==null?void 0:F.call(W))||p.classificationId)===x});if(b!=null&&b.label){const p=b.color||"#888";return e.jsx("span",{className:"inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap",style:{backgroundColor:`${p}15`,color:p,border:`1px solid ${p}30`},children:b.label})}return b!=null&&b.value?e.jsx("span",{className:"inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20",children:b.value}):""}if(t.customFields){const x=t.customFields.find(p=>{var w;const I=((w=p.field_id)==null?void 0:w._id)||p.field_id;return(I==null?void 0:I.toString())===o.id});if(!x)return"";const b=x.value;if(b&&typeof b=="object"&&b._v){const p=[];return Object.entries(b).forEach(([I,w])=>{I==="_v"||I==="customText"||(Array.isArray(w)?w.forEach(W=>p.push(W)):w&&p.push(w))}),b.customText&&p.push(b.customText),e.jsx("div",{className:"flex flex-wrap gap-1",children:p.map((I,w)=>e.jsx("span",{className:"inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20",children:I},w))})}return b||""}return""}}}function Be(t,o=.1){if(!t)return`rgba(99, 102, 241, ${o})`;const d=parseInt(t.slice(1,3),16),a=parseInt(t.slice(3,5),16),N=parseInt(t.slice(5,7),16);return`rgba(${d}, ${a}, ${N}, ${o})`}function yt({field:t,record:o}){const d=(o.customFields||[]).find(N=>{var j;const M=((j=N.field_id)==null?void 0:j._id)||N.field_id;return(M==null?void 0:M.toString())===t.id});if(!d)return e.jsx("span",{className:"text-gray-400 dark:text-gray-600 text-sm italic",children:"—"});const a=d.value;if(a==null||a==="")return e.jsx("span",{className:"text-gray-400 dark:text-gray-600 text-sm italic",children:"—"});if(t.type==="date"||t.type==="datetime")try{return e.jsx("span",{className:"text-sm text-gray-700 dark:text-gray-300",children:new Date(a).toLocaleDateString("fr-FR")})}catch{return e.jsx("span",{className:"text-sm text-gray-700 dark:text-gray-300",children:String(a)})}return t.type==="boolean"||t.type==="checkbox"?e.jsxs("span",{className:`inline-flex items-center gap-1 text-sm ${a?"text-success":"text-gray-400"}`,children:[a?e.jsxs("svg",{width:"16",height:"16",viewBox:"0 0 24 24",fill:"none",children:[e.jsx("path",{d:"M9 12l2 2 4-4",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round"}),e.jsx("circle",{cx:"12",cy:"12",r:"10",stroke:"currentColor",strokeWidth:"1.5"})]}):e.jsx("svg",{width:"16",height:"16",viewBox:"0 0 24 24",fill:"none",children:e.jsx("circle",{cx:"12",cy:"12",r:"10",stroke:"currentColor",strokeWidth:"1.5"})}),a?"Oui":"Non"]}):t.type==="relation"?Array.isArray(a)?e.jsx("div",{className:"flex flex-wrap gap-1",children:a.map((N,M)=>e.jsx("span",{className:"inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-primary/10 text-primary font-medium",children:N.title||N.label||N.name||String(N)},M))}):e.jsx("span",{className:"text-sm text-gray-700 dark:text-gray-300",children:a.title||a.label||String(a)}):t.type==="number"?e.jsx("span",{className:"text-sm font-mono text-gray-700 dark:text-gray-300",children:Number(a).toLocaleString("fr-FR")}):e.jsx("span",{className:"text-sm text-gray-700 dark:text-gray-300",children:String(a)})}function wt({record:t,columns:o,accountNumber:d,entitySlug:a,onClose:N}){var Q;const M=r.useRef(null),[j,_]=r.useState(!1);r.useEffect(()=>{requestAnimationFrame(()=>_(!0))},[]);const u=r.useCallback(()=>{_(!1),setTimeout(()=>N(),250)},[N]);if(r.useEffect(()=>{const m=C=>{C.key==="Escape"&&u()};return document.addEventListener("keydown",m),()=>document.removeEventListener("keydown",m)},[u]),!t)return null;const x=((Q=t._id)==null?void 0:Q.$oid)||t._id,b=t.referenceTitle||t.title||t.computedTitle||"Sans titre",p=t.description||"",I=t.createdAt?new Date(t.createdAt).toLocaleDateString("fr-FR",{day:"2-digit",month:"long",year:"numeric"}):null,w=t.updatedAt?new Date(t.updatedAt).toLocaleDateString("fr-FR",{day:"2-digit",month:"long",year:"numeric"}):null,W=(t.classificationValues||[]).filter(m=>m.optionLabel||m.label).map(m=>({label:m.optionLabel||m.label,color:m.optionColor||m.color||"#6366f1",classificationName:m.classificationName||"Classification"})),F={};W.forEach(m=>{F[m.classificationName]||(F[m.classificationName]=[]),F[m.classificationName].push(m)});const G=o.filter(m=>m.id!=="title"&&m.id!=="actions"&&!m.id.startsWith("class:"));return _e.createPortal(e.jsxs(e.Fragment,{children:[e.jsx("div",{className:`fixed inset-0 bg-black/40 backdrop-blur-[2px] transition-opacity duration-250 ${j?"opacity-100":"opacity-0"}`,style:{zIndex:1e4},onMouseDown:u,onTouchEnd:m=>{m.preventDefault(),u()}}),e.jsxs("div",{ref:M,className:`fixed right-0 top-0 h-full bg-white dark:bg-[#0e1726] shadow-2xl border-l border-gray-200 dark:border-gray-700 flex flex-col transition-transform duration-250 ease-out ${j?"translate-x-0":"translate-x-full"}`,style:{zIndex:10001,width:"min(520px, 90vw)"},onClick:m=>m.stopPropagation(),children:[e.jsxs("div",{className:"flex items-center justify-between gap-3 px-6 py-4 border-b border-gray-100 dark:border-gray-700/50 flex-shrink-0",children:[e.jsxs("div",{className:"flex items-center gap-2 min-w-0",children:[e.jsx("div",{className:"w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0",children:e.jsxs("svg",{width:"16",height:"16",viewBox:"0 0 24 24",fill:"none",children:[e.jsx("path",{d:"M2 12C2 7.28595 2 4.92893 3.46447 3.46447C4.92893 2 7.28595 2 12 2C16.714 2 19.0711 2 20.5355 3.46447C22 4.92893 22 7.28595 22 12C22 16.714 22 19.0711 20.5355 20.5355C19.0711 22 16.714 22 12 22C7.28595 22 4.92893 22 3.46447 20.5355C2 19.0711 2 16.714 2 12Z",stroke:"#4361ee",strokeWidth:"1.5"}),e.jsx("path",{d:"M8 12H16M12 8V16",stroke:"#4361ee",strokeWidth:"1.5",strokeLinecap:"round"})]})}),e.jsx("h3",{className:"text-base font-semibold text-gray-900 dark:text-white truncate",children:b})]}),e.jsxs("div",{className:"flex items-center gap-1 flex-shrink-0",children:[e.jsx("a",{href:`/account/${d}/record/${a}/${x}`,className:"p-2 rounded-lg text-gray-400 hover:text-primary hover:bg-primary/10 transition-all",title:"Ouvrir la page complète",children:e.jsxs("svg",{width:"16",height:"16",viewBox:"0 0 24 24",fill:"none",children:[e.jsx("path",{d:"M10 4H6C4.89543 4 4 4.89543 4 6V18C4 19.1046 4.89543 20 6 20H18C19.1046 20 20 19.1046 20 18V14",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"}),e.jsx("path",{d:"M14 4H20V10",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round"}),e.jsx("path",{d:"M20 4L11 13",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"})]})}),e.jsx("a",{href:`/account/${d}/record/${a}/${x}/edit`,className:"p-2 rounded-lg text-gray-400 hover:text-info hover:bg-info/10 transition-all",title:"Modifier",children:e.jsx("svg",{width:"16",height:"16",viewBox:"0 0 24 24",fill:"none",children:e.jsx("path",{d:"M16.862 4.487L18.55 2.8C19.33 2.02 20.59 2.02 21.37 2.8C22.15 3.58 22.15 4.84 21.37 5.62L19.681 7.307M16.862 4.487L4.162 17.187C3.882 17.467 3.682 17.818 3.592 18.198L2.732 21.596C2.642 21.966 2.952 22.296 3.322 22.226L6.892 21.556C7.242 21.486 7.572 21.306 7.832 21.046L20.513 8.366",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"})})}),e.jsx("button",{onClick:u,className:"p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all",title:"Fermer",children:e.jsx("svg",{width:"16",height:"16",viewBox:"0 0 24 24",fill:"none",children:e.jsx("path",{d:"M18 6L6 18M6 6L18 18",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round"})})})]})]}),e.jsxs("div",{className:"flex-1 overflow-y-auto",children:[Object.keys(F).length>0&&e.jsx("div",{className:"px-6 py-4 border-b border-gray-100 dark:border-gray-700/50",children:Object.entries(F).map(([m,C])=>e.jsxs("div",{className:"mb-3 last:mb-0",children:[e.jsx("div",{className:"text-[11px] uppercase tracking-wider font-semibold text-gray-400 dark:text-gray-500 mb-1.5",children:m}),e.jsx("div",{className:"flex flex-wrap gap-1.5",children:C.map((y,V)=>e.jsxs("span",{className:"inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium transition-all hover:scale-105",style:{backgroundColor:Be(y.color,.15),color:y.color,border:`1px solid ${Be(y.color,.3)}`},children:[e.jsx("span",{className:"w-2 h-2 rounded-full flex-shrink-0",style:{backgroundColor:y.color}}),y.label]},V))})]},m))}),p&&e.jsxs("div",{className:"px-6 py-4 border-b border-gray-100 dark:border-gray-700/50",children:[e.jsx("div",{className:"text-[11px] uppercase tracking-wider font-semibold text-gray-400 dark:text-gray-500 mb-2",children:"Description"}),e.jsx("p",{className:"text-sm text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-wrap",children:p})]}),e.jsxs("div",{className:"px-6 py-4",children:[e.jsx("div",{className:"text-[11px] uppercase tracking-wider font-semibold text-gray-400 dark:text-gray-500 mb-3",children:"Détails"}),e.jsxs("div",{className:"space-y-0",children:[G.map(m=>e.jsxs("div",{className:"flex items-start gap-3 py-2.5 border-b border-gray-50 dark:border-gray-800/50 last:border-0",children:[e.jsx("div",{className:"w-32 flex-shrink-0 text-xs font-medium text-gray-500 dark:text-gray-400 pt-0.5 truncate",children:m.name}),e.jsx("div",{className:"flex-1 min-w-0",children:e.jsx(yt,{field:m,record:t})})]},m.id)),(t.relations||[]).map((m,C)=>{var y;return e.jsxs("div",{className:"flex items-start gap-3 py-2.5 border-b border-gray-50 dark:border-gray-800/50 last:border-0",children:[e.jsx("div",{className:"w-32 flex-shrink-0 text-xs font-medium text-gray-500 dark:text-gray-400 pt-0.5 truncate",children:m.label||m.key||"Relation"}),e.jsx("div",{className:"flex-1 min-w-0",children:((y=m.records)==null?void 0:y.length)>0?e.jsx("div",{className:"flex flex-wrap gap-1",children:m.records.map((V,H)=>e.jsx("a",{href:`/account/${d}/record/${m.entitySlug||a}/${V._id}`,className:"inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-primary/10 text-primary font-medium hover:bg-primary/20 transition-colors",children:V.referenceTitle||V.title||"Sans titre"},H))}):e.jsx("span",{className:"text-gray-400 dark:text-gray-600 text-sm italic",children:"—"})})]},`rel-${C}`)})]})]})]}),e.jsx("div",{className:"flex-shrink-0 px-6 py-3 border-t border-gray-100 dark:border-gray-700/50 bg-gray-50/50 dark:bg-[#0a0f1e]/50",children:e.jsxs("div",{className:"flex items-center justify-between text-[11px] text-gray-400 dark:text-gray-500",children:[e.jsxs("div",{className:"flex items-center gap-3",children:[I&&e.jsxs("span",{className:"flex items-center gap-1",children:[e.jsxs("svg",{width:"12",height:"12",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"1.5",children:[e.jsx("circle",{cx:"12",cy:"12",r:"10"}),e.jsx("path",{d:"M12 6V12L16 14",strokeLinecap:"round"})]}),"Créé le ",I]}),w&&e.jsxs("span",{className:"flex items-center gap-1",children:[e.jsx("svg",{width:"12",height:"12",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"1.5",children:e.jsx("path",{d:"M4.06 13C4.02 12.67 4 12.34 4 12C4 7.58 7.58 4 12 4C14.5 4 16.73 5.15 18.2 6.94M19.94 11C19.98 11.33 20 11.66 20 12C20 16.42 16.42 20 12 20C9.5 20 7.27 18.85 5.8 17.06",strokeLinecap:"round",strokeLinejoin:"round"})}),"Modifié le ",w]})]}),e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx("a",{href:`/account/${d}/record/${a}/${x}`,className:"px-3 py-1.5 bg-primary/10 text-primary text-xs font-medium rounded-lg hover:bg-primary/20 transition-colors",children:"Voir"}),e.jsx("a",{href:`/account/${d}/record/${a}/${x}/edit`,className:"px-3 py-1.5 bg-primary text-white text-xs font-medium rounded-lg hover:bg-primary/90 transition-colors",children:"Modifier"})]})]})})]})]}),document.body)}function $e(t,o=.1){const d=/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(t);return d?`rgba(${parseInt(d[1],16)}, ${parseInt(d[2],16)}, ${parseInt(d[3],16)}, ${o})`:`rgba(128,128,128,${o})`}function Ze({record:t,accountNumber:o,entitySlug:d,isDragging:a=!1,onQuickView:N}){var X,J,O;const M=r.useRef(null),j=r.useRef(!1),_=String(((X=t._id)==null?void 0:X.$oid)||t._id),{attributes:u,listeners:x,setNodeRef:b,transform:p,transition:I,isDragging:w}=mt({id:_}),W={transform:gt.Transform.toString(p),transition:I,opacity:a||w?.7:1,touchAction:"manipulation"},F=((J=t._id)==null?void 0:J.$oid)||t._id,G=t.referenceTitle||t.title||t.computedTitle||"Sans titre",Q=t.description||"",m=t.dueDate?new Date(t.dueDate).toLocaleDateString("fr-FR",{day:"2-digit",month:"2-digit",year:"2-digit"}):null,C=t.createdAt?new Date(t.createdAt).toLocaleDateString("fr-FR"):null,y=(t.classificationValues||[]).filter(v=>v.optionLabel||v.label).map(v=>({label:v.optionLabel||v.label,color:v.optionColor||v.color||"#6366f1"})),V=t.tags||[],H=v=>{M.current={x:v.clientX,y:v.clientY,time:Date.now()},j.current=!1},c=v=>{if(M.current){const Z=Math.abs(v.clientX-M.current.x),ee=Math.abs(v.clientY-M.current.y);(Z>5||ee>5)&&(j.current=!0)}},i=v=>{if(!M.current)return;const Z=Date.now()-M.current.time;!j.current&&Z<400&&N&&!v.target.closest("a, button")&&setTimeout(()=>N(t),50),M.current=null};return e.jsxs("div",{ref:b,style:W,className:`kanban-card cursor-pointer rounded-lg transition-all group bg-white hover:shadow-md border border-gray-200/80 dark:border-0 dark:bg-dark/40 dark:hover:bg-dark/60 ${a||w?"shadow-lg ring-2 ring-primary/30 cursor-move":"shadow-sm"}`,"data-dnd":"card",onPointerDown:H,onPointerMove:c,onPointerUp:i,...u,...x,children:[e.jsxs("div",{className:"p-3",children:[e.jsx("div",{className:"text-sm font-semibold text-gray-800 dark:text-white-dark leading-5 line-clamp-2 mb-2",children:G}),Q&&e.jsx("p",{className:"text-xs text-gray-500 dark:text-white-dark/70 line-clamp-2 mb-2",children:Q}),e.jsx("div",{className:"flex flex-wrap items-center gap-1 mb-2",children:y.length>0?y.slice(0,3).map((v,Z)=>e.jsxs("span",{className:"inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded font-medium",style:{backgroundColor:$e(v.color,.15),color:v.color},children:[e.jsx("span",{className:"w-1.5 h-1.5 rounded-full flex-shrink-0",style:{backgroundColor:v.color}}),v.label]},Z)):V.length>0?V.slice(0,2).map((v,Z)=>e.jsx("span",{className:"inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary",children:v},Z)):e.jsxs("span",{className:"text-[10px] text-gray-400 dark:text-white-dark/50 italic flex items-center gap-1",children:[e.jsx("svg",{width:"10",height:"10",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"1.5",children:e.jsx("path",{d:"M4.172 3.172C3 4.343 3 6.229 3 10v4c0 3.771 0 5.657 1.172 6.828C5.343 22 7.229 22 11 22h2c3.771 0 5.657 0 6.828-1.172C21 19.657 21 17.771 21 14v-1.22c0-1.835 0-2.752-.379-3.55-.378-.798-1.07-1.39-2.455-2.576l-1.5-1.282c-1.97-1.687-2.955-2.531-4.136-2.605-.17-.01-.343-.01-.56 0-1.18.074-2.166.918-4.136 2.605L6.334 6.654"})}),"Sans tag"]})}),e.jsxs("div",{className:"flex items-center gap-3 text-xs text-gray-400 dark:text-white-dark/50",children:[((O=t.attachments)==null?void 0:O.length)>0&&e.jsxs("span",{className:"flex items-center gap-1",children:[e.jsx("svg",{width:"12",height:"12",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",children:e.jsx("path",{d:"M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"})}),t.attachments.length]}),e.jsxs("span",{className:"flex items-center gap-1",children:[e.jsx("svg",{width:"12",height:"12",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",children:e.jsx("path",{d:"M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"})}),"0"]})]})]}),e.jsxs("div",{className:"px-3 py-2 border-t border-gray-100 dark:border-0 flex items-center justify-between",children:[e.jsxs("div",{className:"flex items-center gap-1 text-[11px] text-gray-400 dark:text-white-dark/50",children:[e.jsxs("svg",{width:"12",height:"12",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"1.5",children:[e.jsx("rect",{x:"3",y:"4",width:"18",height:"18",rx:"2"}),e.jsx("path",{d:"M3 10H21"}),e.jsx("path",{d:"M8 2V6"}),e.jsx("path",{d:"M16 2V6"})]}),e.jsx("span",{children:m||C||"—"})]}),e.jsxs("div",{className:"flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity",style:{pointerEvents:"auto"},children:[e.jsx("a",{href:`/account/${o}/record/${d}/${F}/edit`,className:"p-1 hover:text-info rounded hover:bg-gray-100 dark:hover:bg-gray-700",onClick:v=>v.stopPropagation(),onPointerDown:v=>v.stopPropagation(),children:e.jsx("svg",{width:"14",height:"14",viewBox:"0 0 24 24",fill:"none",children:e.jsx("path",{d:"M16.862 4.487L18.55 2.8C19.33 2.02 20.59 2.02 21.37 2.8C22.15 3.58 22.15 4.84 21.37 5.62L19.681 7.307M16.862 4.487L4.162 17.187C3.882 17.467 3.682 17.818 3.592 18.198L2.732 21.596C2.642 21.966 2.952 22.296 3.322 22.226L6.892 21.556C7.242 21.486 7.572 21.306 7.832 21.046L20.513 8.366M16.862 4.487L19.681 7.307",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"})})}),e.jsx("a",{href:`/account/${o}/record/${d}/${F}`,className:"p-1 hover:text-primary rounded hover:bg-gray-100 dark:hover:bg-gray-700",onClick:v=>v.stopPropagation(),onPointerDown:v=>v.stopPropagation(),children:e.jsxs("svg",{width:"14",height:"14",viewBox:"0 0 24 24",fill:"none",children:[e.jsx("path",{opacity:"0.5",d:"M3.27489 15.2957C2.42496 14.1915 2 13.6394 2 12C2 10.3606 2.42496 9.80853 3.27489 8.70433C4.97196 6.49956 7.81811 4 12 4C16.1819 4 19.028 6.49956 20.7251 8.70433C21.575 9.80853 22 10.3606 22 12C22 13.6394 21.575 14.1915 20.7251 15.2957C19.028 17.5004 16.1819 20 12 20C7.81811 20 4.97196 17.5004 3.27489 15.2957Z",stroke:"currentColor",strokeWidth:"1.5"}),e.jsx("path",{d:"M15 12C15 13.6569 13.6569 15 12 15C10.3431 15 9 13.6569 9 12C9 10.3431 10.3431 9 12 9C13.6569 9 15 10.3431 15 12Z",stroke:"currentColor",strokeWidth:"1.5"})]})})]})]})]})}function jt({column:t,records:o,recordIds:d,accountNumber:a,entitySlug:N,onQuickView:M}){const{setNodeRef:j,isOver:_}=xt({id:String(t.id)}),u=typeof document<"u"&&document.documentElement.classList.contains("dark"),x=$e(t.color,u?.12:.06),b=$e(t.color,u?.3:.15);return e.jsxs("div",{ref:j,className:`flex-none rounded-lg overflow-hidden transition-all ${_?"ring-2 ring-primary/50 ring-offset-2":""}`,style:{width:"300px",maxWidth:"320px",backgroundColor:_?$e(t.color,.15):x,border:`1px solid ${b}`},"data-dnd":"column",children:[e.jsx("div",{style:{height:"4px",backgroundColor:t.color}}),e.jsx("div",{className:"px-3 py-2 flex justify-between items-center",children:e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx("span",{className:"inline-flex items-center gap-1.5 px-2 py-0 rounded text-xs font-semibold uppercase tracking-wide",style:{backgroundColor:t.color,color:"#fff"},children:t.title}),e.jsx("span",{className:"text-xs text-gray-500 font-medium",children:o.length})]})}),e.jsx("div",{className:"px-2 pb-3",children:e.jsx(ft,{items:d,strategy:ht,children:e.jsx("div",{className:`space-y-2 min-h-[80px] rounded-lg transition-all ${_?"bg-primary/5 p-2":""}`,children:o.length===0?e.jsx("div",{className:"text-xs text-gray-300 dark:text-gray-600 text-center py-8 italic",children:"Aucun enregistrement"}):o.map(p=>{var I;return e.jsx(Ze,{record:p,accountNumber:a,entitySlug:N,onQuickView:M},((I=p._id)==null?void 0:I.$oid)||p._id)})})})}),e.jsx("div",{className:"px-3 pb-3",children:e.jsxs("button",{type:"button",className:"flex items-center gap-1 text-xs text-gray-400 hover:text-primary transition-colors",children:[e.jsx("svg",{width:"14",height:"14",viewBox:"0 0 24 24",fill:"none",children:e.jsx("path",{d:"M12 6V18M6 12H18",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round"})}),"Ajouter"]})})]})}function Ct({records:t,columns:o,accountNumber:d,entitySlug:a,viewId:N,entityData:M}){const j=r.useRef(null),_=r.useRef(null),[u,x]=r.useState(t),[b,p]=r.useState({}),[I,w]=r.useState(null),[W,F]=r.useState(null),G=r.useCallback(g=>{F(g)},[]);r.useEffect(()=>{x(t)},[t]);const Q=r.useRef(!1),m=r.useRef(0),C=r.useRef(0),y=r.useCallback(g=>{if(I||g.button!==0||g.target.closest('a, button, .dropdown, [data-dnd="card"]'))return;const R=j.current;R&&(Q.current=!0,m.current=g.pageX-R.offsetLeft,C.current=R.scrollLeft,R.style.cursor="grabbing")},[I]),V=r.useCallback(g=>{if(I){Q.current=!1;return}if(!Q.current)return;g.preventDefault();const R=j.current;if(!R)return;const L=(g.pageX-R.offsetLeft-m.current)*1.5;R.scrollLeft=C.current-L},[I]),H=r.useCallback(()=>{Q.current=!1,j.current&&(j.current.style.cursor="grab")},[]),c=at(Ee(ut,{activationConstraint:{distance:8}}),Ee(pt,{activationConstraint:{delay:500,tolerance:10}}),Ee(ct,{coordinateGetter:dt})),i=r.useMemo(()=>{if(M){const L=M.statusClassification;if(L&&L.options&&L.options.length>0){const E=L.options.map(B=>({id:String(B._id),title:B.label,color:B.color||"#6366f1",optionId:String(B._id)}));return E.push({id:"__none__",title:"Sans Statut",color:"#9ca3af",optionId:"none"}),{classId:String(L._id),columns:E}}const P=M.classifications||[];for(const E of P)if(E.options&&E.options.length>0){const B=E.options.map(re=>({id:String(re._id),title:re.label,color:re.color||"#6366f1",optionId:String(re._id)}));return B.push({id:"__none__",title:"Non classé",color:"#9ca3af",optionId:"none"}),{classId:String(E._id),columns:B}}}const g={};u.forEach(L=>{(L.classificationValues||[]).forEach(P=>{var ce,he;const E=((ce=P.classificationId)==null?void 0:ce.$oid)||P.classificationId||P.classification_id;if(!E)return;g[E]||(g[E]={count:0,options:{}}),g[E].count++;const B=P.optionLabel||P.label||"Sans label",re=P.optionColor||P.color||"#9ca3af",oe=((he=P.optionId)==null?void 0:he.$oid)||P.optionId||B;g[E].options[B]||(g[E].options[B]={label:B,color:re,optionId:String(oe),count:0}),g[E].options[B].count++})});let R=null,z=0;if(Object.entries(g).forEach(([L,P])=>{P.count>z&&(z=P.count,R=L)}),R&&g[R]){const P=Object.values(g[R].options).map(E=>({id:E.label,title:E.label,color:E.color,optionId:E.optionId}));return P.push({id:"__none__",title:"Sans classification",color:"#9ca3af",optionId:"none"}),{classId:R,columns:P}}return{classId:null,columns:[{id:"__all__",title:"Tous les enregistrements",color:"#4361ee",optionId:null}]}},[u,M]),X=r.useMemo(()=>{const g={};if(i.columns.forEach(R=>g[R.id]=[]),!i.classId)g.__all__=u;else{const R={};i.columns.forEach(L=>{L.optionId&&L.optionId!=="none"&&(R[String(L.optionId)]=L.id)});const z={};i.columns.forEach(L=>{z[L.title]=L.id}),u.forEach(L=>{var B;const E=(L.classificationValues||[]).find(re=>{var ce;return(((ce=re.classificationId)==null?void 0:ce.$oid)||re.classificationId||re.classification_id)===i.classId});if(E){const re=String(((B=E.optionId)==null?void 0:B.$oid)||E.optionId||""),oe=R[re];if(oe&&g[oe])g[oe].push(L);else{const ce=E.optionLabel||E.label||"Sans label";g[ce]?g[ce].push(L):g.__none__&&g.__none__.push(L)}}else g.__none__&&g.__none__.push(L)})}for(const R of Object.keys(g)){const z=b[R]||[];z.length&&g[R].sort((L,P)=>{var re,oe;const E=z.indexOf(String(((re=L._id)==null?void 0:re.$oid)||L._id)),B=z.indexOf(String(((oe=P._id)==null?void 0:oe.$oid)||P._id));return E===-1&&B===-1?0:E===-1?1:B===-1?-1:E-B})}return g},[i,u,b]),J=r.useMemo(()=>{const g={};for(const R of i.columns)g[R.id]=(X[R.id]||[]).map(z=>{var L;return String(((L=z._id)==null?void 0:L.$oid)||z._id)});return g},[i.columns,X]),O=r.useCallback(g=>{var z;const R=String(g);for(const L of Object.keys(J))if((z=J[L])!=null&&z.includes(R))return L;return null},[J]),v=r.useMemo(()=>I&&u.find(g=>{var R;return String(((R=g._id)==null?void 0:R.$oid)||g._id)===String(I)})||null,[I,u]),Z=r.useCallback(g=>{N&&(_.current&&clearTimeout(_.current),_.current=setTimeout(async()=>{try{await fetch(`/account/${d}/api/user/view-preferences`,{method:"POST",headers:{"Content-Type":"application/json"},credentials:"include",body:JSON.stringify({viewId:N,preferences:{kanban:{orderByColumn:g}}})})}catch{}},250))},[d,N]),ee=r.useCallback(async(g,R)=>{if(!i.classId)return;const z=i.columns.find(L=>L.id===R);if(z)try{await fetch(`/account/${d}/api/record/update-classification`,{method:"POST",headers:{"Content-Type":"application/json"},credentials:"include",body:JSON.stringify({recordId:g,classificationId:i.classId,optionId:z.optionId==="none"?null:z.optionId})})}catch(L){console.error("[RecordsKanban] Update error:",L)}},[d,i]),T=g=>{w(String(g.active.id))},de=()=>{w(null)},le=g=>{const{active:R,over:z}=g;if(w(null),!z)return;const L=String(R.id),P=String(z.id),E=O(L),B=i.columns.some(A=>String(A.id)===P)?P:O(P);if(!E||!B)return;if(E===B){const A=J[E]||[],Y=A.indexOf(L),D=A.indexOf(P);if(Y===-1||D===-1||Y===D)return;const me=lt(A,Y,D),K={...b,[E]:me};p(K),Z(K);return}const re=[...J[E]||[]].filter(A=>A!==L),oe=[...J[B]||[]],he=i.columns.some(A=>String(A.id)===P)?oe.length:Math.max(0,oe.indexOf(P));oe.splice(he,0,L);const l={...b,[E]:re,[B]:oe};if(p(l),Z(l),i.classId){const A=i.columns.find(Y=>Y.id===B);x(Y=>Y.map(D=>{var K;if(String(((K=D._id)==null?void 0:K.$oid)||D._id)!==L)return D;const me=(D.classificationValues||[]).filter(pe=>{var n;return(((n=pe.classificationId)==null?void 0:n.$oid)||pe.classificationId||pe.classification_id)!==i.classId});return B!=="__none__"&&A&&me.push({classificationId:i.classId,optionId:A.optionId,optionLabel:A.title,optionColor:A.color}),{...D,classificationValues:me}})),ee(L,B)}};return e.jsxs("div",{ref:j,className:"h-full overflow-x-auto overflow-y-auto",style:{cursor:"grab",userSelect:"none",WebkitUserSelect:"none"},onMouseDown:y,onMouseMove:V,onMouseUp:H,onMouseLeave:H,children:[e.jsxs(ot,{sensors:c,collisionDetection:it,autoScroll:{threshold:{x:.15,y:.15},interval:10,acceleration:5},onDragStart:T,onDragEnd:le,onDragCancel:de,children:[e.jsx("div",{style:{display:"flex",flexWrap:"nowrap",alignItems:"flex-start",gap:"1.25rem",padding:"0.5rem",width:"max-content",minHeight:"100%"},children:i.columns.map(g=>{const R=X[g.id]||[];return g.id==="__none__"&&R.length===0?null:e.jsx(jt,{column:g,records:R,recordIds:J[g.id]||[],accountNumber:d,entitySlug:a,onQuickView:G},g.id)})}),e.jsx(nt,{children:v?e.jsx(Ze,{record:v,accountNumber:d,entitySlug:a,isDragging:!0}):null})]}),W&&e.jsx(wt,{record:W,columns:o,accountNumber:d,entitySlug:a,onClose:()=>F(null)})]})}const ze=[{bg:"bg-primary-light shadow-primary",text:"text-primary",dot:"#4361ee"},{bg:"bg-info-light shadow-info",text:"text-info",dot:"#2196f3"},{bg:"bg-warning-light shadow-warning",text:"text-warning",dot:"#e2a03f"},{bg:"bg-danger-light shadow-danger",text:"text-danger",dot:"#e7515a"},{bg:"bg-success-light shadow-success",text:"text-success",dot:"#00ab55"},{bg:"bg-secondary-light shadow-secondary",text:"text-secondary",dot:"#805dca"}];function Nt(t){return ze[t%ze.length]}function Lt(){return e.jsxs("svg",{width:"24",height:"24",viewBox:"0 0 24 24",fill:"none",className:"h-5 w-5 rotate-90 opacity-70 hover:opacity-100",children:[e.jsx("circle",{cx:"5",cy:"12",r:"2",stroke:"currentColor",strokeWidth:"1.5"}),e.jsx("circle",{opacity:"0.5",cx:"12",cy:"12",r:"2",stroke:"currentColor",strokeWidth:"1.5"}),e.jsx("circle",{cx:"19",cy:"12",r:"2",stroke:"currentColor",strokeWidth:"1.5"})]})}function St(){return e.jsxs("svg",{width:"24",height:"24",viewBox:"0 0 24 24",fill:"none",className:"h-4 w-4 ltr:mr-3 rtl:ml-3",children:[e.jsx("path",{d:"M15.2869 3.15178L14.3601 4.07866L5.83882 12.5999C5.26166 13.1771 4.97308 13.4656 4.7249 13.7838C4.43213 14.1592 4.18114 14.5653 3.97634 14.995C3.80273 15.3593 3.67368 15.7465 3.41556 16.5208L2.32181 19.8021L2.05445 20.6042C1.92743 20.9852 2.0266 21.4053 2.31063 21.6894C2.59466 21.9734 3.01478 22.0726 3.39584 21.9456L4.19792 21.6782L7.47918 20.5844C8.25353 20.3263 8.6407 20.1973 9.00498 20.0237C9.43469 19.8189 9.84082 19.5679 10.2162 19.2751C10.5344 19.0269 10.8229 18.7383 11.4001 18.1612L19.9213 9.63993L20.8482 8.71306C22.3839 7.17735 22.3839 4.68748 20.8482 3.15178C19.3125 1.61607 16.8226 1.61607 15.2869 3.15178Z",stroke:"currentColor",strokeWidth:"1.5"}),e.jsx("path",{opacity:"0.5",d:"M14.36 4.07812C14.36 4.07812 14.4759 6.04774 16.2138 7.78564C17.9517 9.52354 19.9213 9.6394 19.9213 9.6394M4.19789 21.6777L2.32178 19.8015",stroke:"currentColor",strokeWidth:"1.5"})]})}function Mt(){return e.jsxs("svg",{width:"24",height:"24",viewBox:"0 0 24 24",fill:"none",className:"h-4.5 w-4.5 ltr:mr-3 rtl:ml-3",children:[e.jsx("path",{opacity:"0.5",d:"M3.27489 15.2957C2.42496 14.1915 2 13.6394 2 12C2 10.3606 2.42496 9.80853 3.27489 8.70433C4.97196 6.49956 7.81811 4 12 4C16.1819 4 19.028 6.49956 20.7251 8.70433C21.575 9.80853 22 10.3606 22 12C22 13.6394 21.575 14.1915 20.7251 15.2957C19.028 17.5004 16.1819 20 12 20C7.81811 20 4.97196 17.5004 3.27489 15.2957Z",stroke:"currentColor",strokeWidth:"1.5"}),e.jsx("path",{d:"M15 12C15 13.6569 13.6569 15 12 15C10.3431 15 9 13.6569 9 12C9 10.3431 10.3431 9 12 9C13.6569 9 15 10.3431 15 12Z",stroke:"currentColor",strokeWidth:"1.5"})]})}function _t({filled:t}){return e.jsx("svg",{width:"24",height:"24",viewBox:"0 0 24 24",fill:"none",className:`h-4.5 w-4.5 group-hover:fill-warning ${t?"fill-warning":""}`,children:e.jsx("path",{d:"M9.15316 5.40838C10.4198 3.13613 11.0531 2 12 2C12.9469 2 13.5802 3.13612 14.8468 5.40837L15.1745 5.99623C15.5345 6.64193 15.7144 6.96479 15.9951 7.17781C16.2757 7.39083 16.6251 7.4699 17.3241 7.62805L17.9605 7.77203C20.4201 8.32856 21.65 8.60682 21.9426 9.54773C22.2352 10.4886 21.3968 11.4691 19.7199 13.4299L19.2861 13.9372C18.8096 14.4944 18.5713 14.773 18.4641 15.1177C18.357 15.4624 18.393 15.8341 18.465 16.5776L18.5306 17.2544C18.7841 19.8706 18.9109 21.1787 18.1449 21.7602C17.3788 22.3417 16.2273 21.8115 13.9243 20.7512L13.3285 20.4768C12.6741 20.1755 12.3469 20.0248 12 20.0248C11.6531 20.0248 11.3259 20.1755 10.6715 20.4768L10.0757 20.7512C7.77268 21.8115 6.62118 22.3417 5.85515 21.7602C5.08912 21.1787 5.21588 19.8706 5.4694 17.2544L5.53498 16.5776C5.60703 15.8341 5.64305 15.4624 5.53586 15.1177C5.42868 14.773 5.19043 14.4944 4.71392 13.9372L4.2801 13.4299C2.60325 11.4691 1.76482 10.4886 2.05742 9.54773C2.35002 8.60682 3.57986 8.32856 6.03954 7.77203L6.67589 7.62805C7.37485 7.4699 7.72433 7.39083 8.00494 7.17781C8.28555 6.96479 8.46553 6.64194 8.82547 5.99623L9.15316 5.40838Z",stroke:"currentColor",strokeWidth:"1.5"})})}function $t(){return e.jsx("svg",{width:"24",height:"24",viewBox:"0 0 24 24",fill:"none",className:"h-3 w-3 rotate-45",children:e.jsx("path",{d:"M2 12C2 7.28595 2 4.92893 3.46447 3.46447C4.92893 2 7.28595 2 12 2C16.714 2 19.0711 2 20.5355 3.46447C22 4.92893 22 7.28595 22 12C22 16.714 22 19.0711 20.5355 20.5355C19.0711 22 16.714 22 12 22C7.28595 22 4.92893 22 3.46447 20.5355C2 19.0711 2 16.714 2 12Z",stroke:"currentColor",strokeWidth:"1.5"})})}function Wt({record:t,accountNumber:o,entitySlug:d}){var _;const[a,N]=r.useState(!1),M=r.useRef(null);r.useEffect(()=>{if(!a)return;const u=x=>{M.current&&!M.current.contains(x.target)&&N(!1)};return document.addEventListener("mousedown",u),()=>document.removeEventListener("mousedown",u)},[a]);const j=((_=t._id)==null?void 0:_.$oid)||t._id;return e.jsxs("div",{ref:M,className:"dropdown relative",children:[e.jsx("button",{type:"button",className:"text-primary",onClick:u=>{u.preventDefault(),u.stopPropagation(),N(!a)},children:e.jsx(Lt,{})}),a&&e.jsxs("ul",{className:"absolute z-50 min-w-[140px] rounded-md bg-white dark:bg-[#1b2e4b] shadow-lg border dark:border-gray-700 py-1 text-sm font-medium ltr:right-0 rtl:left-0 top-full mt-1",style:{animation:"fadeIn 0.15s ease-out"},children:[e.jsx("li",{children:e.jsxs("a",{href:`/account/${o}/record/${d}/${j}/edit`,className:"flex items-center px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 w-full",onClick:u=>u.stopPropagation(),children:[e.jsx(St,{})," Edit"]})}),e.jsx("li",{children:e.jsxs("a",{href:`/account/${o}/record/${d}/${j}`,className:"flex items-center px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 w-full",onClick:u=>u.stopPropagation(),children:[e.jsx(Mt,{})," View"]})})]})]})}function Dt({record:t,accountNumber:o,entitySlug:d,style:a,favorites:N,onToggleFav:M}){var I,w;const j=N[t._id]||!1,_=((I=t._id)==null?void 0:I.$oid)||t._id,u=t.referenceTitle||t.title||t.computedTitle||"Sans titre",x=t.createdAt?new Date(t.createdAt).toLocaleDateString("fr-FR",{day:"2-digit",month:"short",year:"numeric"}):"",b=(t.customFields||[]).find(W=>{var F,G,Q,m,C,y;return((G=(F=W.field_id)==null?void 0:F.label)==null?void 0:G.toLowerCase().includes("descri"))||((m=(Q=W.field_id)==null?void 0:Q.label)==null?void 0:m.toLowerCase().includes("note"))||((y=(C=W.field_id)==null?void 0:C.label)==null?void 0:y.toLowerCase().includes("contenu"))}),p=(b==null?void 0:b.value)||t.description||"";return(t.classificationValues||[]).filter(W=>W.optionLabel).map(W=>({label:W.optionLabel,color:W.optionColor||W.color||a.dot})),e.jsxs("div",{className:`panel pb-12 relative ${a.bg}`,children:[e.jsxs("div",{className:"min-h-[142px]",children:[e.jsxs("div",{className:"flex justify-between",children:[e.jsxs("div",{className:"flex w-max items-center",children:[e.jsx("div",{className:"flex-none",children:e.jsx("div",{className:"rounded-full bg-gray-300 p-2 dark:bg-gray-700",children:e.jsxs("svg",{width:"24",height:"24",viewBox:"0 0 24 24",fill:"none",className:"h-4.5 w-4.5",children:[e.jsx("circle",{cx:"12",cy:"6",r:"4",stroke:"currentColor",strokeWidth:"1.5"}),e.jsx("ellipse",{opacity:"0.5",cx:"12",cy:"17",rx:"7",ry:"4",stroke:"currentColor",strokeWidth:"1.5"})]})})}),e.jsxs("div",{className:"ltr:ml-2 rtl:mr-2",children:[e.jsx("div",{className:"font-semibold",children:((w=t.createdBy)==null?void 0:w.name)||"Utilisateur"}),e.jsx("div",{className:"text-sx text-white-dark",children:x})]})]}),e.jsx(Wt,{record:t,accountNumber:o,entitySlug:d})]}),e.jsxs("div",{children:[e.jsx("h4",{className:"mt-4 font-semibold",children:e.jsx("a",{href:`/account/${o}/record/${d}/${_}`,className:"hover:text-primary transition-colors",children:u})}),p&&e.jsx("p",{className:"mt-2 text-white-dark line-clamp-3",children:p})]})]}),e.jsx("div",{className:"absolute bottom-5 left-0 w-full px-5",children:e.jsxs("div",{className:"mt-2 flex items-center justify-between",children:[e.jsx("div",{className:a.text,children:e.jsx($t,{})}),e.jsx("div",{className:"flex items-center gap-2",children:e.jsx("button",{type:"button",className:"group text-warning ltr:ml-2 rtl:mr-2",onClick:W=>{W.preventDefault(),W.stopPropagation(),M(t._id)},children:e.jsx(_t,{filled:j})})})]})})]})}function It({records:t,accountNumber:o,entitySlug:d}){const[a,N]=r.useState({}),M=r.useCallback(j=>{N(_=>({..._,[j]:!_[j]}))},[]);return e.jsx("div",{className:"h-full overflow-y-auto",children:e.jsx("div",{className:"grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",children:t.length===0?e.jsx("div",{className:"col-span-full text-center py-20 text-gray-400 dark:text-gray-600 italic",children:"Aucun enregistrement"}):t.map((j,_)=>{var u;return e.jsx(Dt,{record:j,accountNumber:o,entitySlug:d,style:Nt(_),favorites:a,onToggleFav:M},((u=j._id)==null?void 0:u.$oid)||j._id)})})})}const Je={contains:{label:"Contient",icon:"⊃",types:["text","email","phone","url","textarea","title","relation"]},not_contains:{label:"Ne contient pas",icon:"⊅",types:["text","email","phone","url","textarea","title","relation"]},equals:{label:"Est égal à",icon:"=",types:["text","email","phone","url","number","date","title","select","relation","classification"]},not_equals:{label:"N'est pas égal à",icon:"≠",types:["text","email","phone","url","number","date","title","select","relation","classification"]},starts_with:{label:"Commence par",icon:"A…",types:["text","email","phone","url","title"]},ends_with:{label:"Se termine par",icon:"…Z",types:["text","email","phone","url","title"]},gt:{label:"Supérieur à",icon:">",types:["number","date"]},gte:{label:"Supérieur ou égal",icon:"≥",types:["number","date"]},lt:{label:"Inférieur à",icon:"<",types:["number","date"]},lte:{label:"Inférieur ou égal",icon:"≤",types:["number","date"]},between:{label:"Entre",icon:"↔",types:["number","date"]},is_empty:{label:"Est vide",icon:"∅",types:["text","email","phone","url","number","date","textarea","title","select","relation","classification"]},is_not_empty:{label:"N'est pas vide",icon:"∃",types:["text","email","phone","url","number","date","textarea","title","select","relation","classification"]}};function Te(t){const o=t||"text";return Object.entries(Je).filter(([d,a])=>a.types.includes(o)).map(([d,a])=>({key:d,...a}))}function Ae(t){return["number","currency","percent"].includes(t)?"number":["date","datetime"].includes(t)?"date":"text"}function Rt({columns:t=[],fieldFilters:o=[],onFieldFiltersChange:d,allRecords:a=[],sidebarFilters:N=[]}){const[M,j]=r.useState(o.length>0),[_,u]=r.useState(null),[x,b]=r.useState(!1),p=r.useRef(null);r.useEffect(()=>{const c=i=>{x&&p.current&&!p.current.contains(i.target)&&b(!1)};return x&&document.addEventListener("mousedown",c),()=>document.removeEventListener("mousedown",c)},[x]);const I=We.useMemo(()=>{const c={};return N.forEach(i=>{c[`classif:${i.id}`]=i.options||[]}),c},[N]),w=t.filter(c=>c.id!=="actions"),W=r.useCallback(c=>{const i=w.find(Z=>Z.id===c);if(!i)return;const X=c.startsWith("classif:"),J=Te(i.type),O=X?J.find(Z=>Z.key==="equals")||J[0]:J.find(Z=>Z.key==="contains")||J[0],v={fieldId:c,fieldName:i.name,fieldType:i.type||"text",operator:O.key,value:"",value2:"",logic:"AND"};d([...o,v]),b(!1),u(o.length)},[w,o,d]),F=r.useCallback((c,i)=>{const X=o.map((J,O)=>O===c?{...J,...i}:J);d(X)},[o,d]),G=r.useCallback(c=>{const i=o.filter((X,J)=>J!==c);d(i),_===c&&u(null)},[o,d,_]),Q=r.useCallback(()=>{d([]),u(null)},[d]),m=c=>["is_empty","is_not_empty"].includes(c),C=c=>c==="between",y=c=>c&&c.startsWith("classif:"),V=c=>I[c]||[],H=(c,i)=>{const J=V(c).find(O=>O.id===i||O.label===i);return J?J.label:i};return e.jsxs("div",{className:"adv-filters-container",children:[e.jsxs("button",{type:"button",className:"adv-filters-header",onClick:()=>j(!M),children:[e.jsxs("div",{className:"adv-filters-header-left",children:[e.jsx("svg",{viewBox:"0 0 24 24",fill:"none",className:"adv-filters-header-icon",children:e.jsx("path",{d:"M22 3H2L10 12.46V19L14 21V12.46L22 3Z",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round"})}),e.jsx("span",{children:"Filtres avancés"}),o.length>0&&e.jsx("span",{className:"adv-filters-count",children:o.length})]}),e.jsx("svg",{viewBox:"0 0 24 24",fill:"none",className:`adv-filters-chevron ${M?"adv-filters-chevron--open":""}`,children:e.jsx("path",{d:"M9 18L15 12L9 6",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round"})})]}),M&&e.jsxs("div",{className:"adv-filters-body",children:[o.map((c,i)=>{var ee;w.find(T=>T.id===c.fieldId);const X=Te(c.fieldType),J=_===i,O=y(c.fieldId),v=O?V(c.fieldId):[],Z=c.logic||"AND";return e.jsxs(We.Fragment,{children:[i>0&&e.jsxs("div",{className:"adv-filter-connector",children:[e.jsx("span",{className:"adv-filter-connector-line"}),e.jsx("button",{type:"button",className:`adv-filter-connector-badge ${Z==="OR"?"adv-filter-connector-badge--or":""}`,onClick:()=>{F(i,{logic:Z==="AND"?"OR":"AND"})},title:"Cliquez pour basculer entre ET/OU",children:Z==="OR"?"OU":"ET"}),e.jsx("span",{className:"adv-filter-connector-line"})]}),e.jsx("div",{className:`adv-filter-pill ${J?"adv-filter-pill--editing":""}`,children:J?e.jsxs("div",{className:"adv-filter-edit",children:[e.jsxs("div",{className:"adv-filter-row",children:[e.jsx("label",{className:"adv-filter-label",children:"Champ"}),e.jsx("select",{value:c.fieldId,onChange:T=>{const de=w.find(le=>le.id===T.target.value);if(de){const le=Te(de.type),R=T.target.value.startsWith("classif:")?le.find(z=>z.key==="equals")||le[0]:le.find(z=>z.key===c.operator)||le[0];F(i,{fieldId:de.id,fieldName:de.name,fieldType:de.type||"text",operator:R.key,value:"",value2:""})}},className:"adv-filter-select",children:w.map(T=>e.jsx("option",{value:T.id,children:T.name},T.id))})]}),e.jsxs("div",{className:"adv-filter-row",children:[e.jsx("label",{className:"adv-filter-label",children:"Condition"}),e.jsx("select",{value:c.operator,onChange:T=>F(i,{operator:T.target.value,value:m(T.target.value)?"":c.value,value2:""}),className:"adv-filter-select",children:X.map(T=>e.jsx("option",{value:T.key,children:T.label},T.key))})]}),!m(c.operator)&&e.jsxs("div",{className:"adv-filter-row",children:[e.jsx("label",{className:"adv-filter-label",children:C(c.operator)?"Valeur min":"Valeur"}),O&&v.length>0?e.jsxs("select",{value:c.value,onChange:T=>F(i,{value:T.target.value}),className:"adv-filter-select",children:[e.jsx("option",{value:"",children:"Sélectionnez..."}),v.map(T=>e.jsx("option",{value:T.label,children:T.label},T.id))]}):e.jsx("input",{type:Ae(c.fieldType),value:c.value,onChange:T=>F(i,{value:T.target.value}),placeholder:"Saisir une valeur...",className:"adv-filter-input",autoFocus:!0})]}),C(c.operator)&&e.jsxs("div",{className:"adv-filter-row",children:[e.jsx("label",{className:"adv-filter-label",children:"Valeur max"}),e.jsx("input",{type:Ae(c.fieldType),value:c.value2||"",onChange:T=>F(i,{value2:T.target.value}),placeholder:"Saisir une valeur max...",className:"adv-filter-input"})]}),e.jsxs("div",{className:"adv-filter-row adv-filter-row--actions",children:[e.jsxs("button",{type:"button",className:"adv-filter-btn-done",onClick:()=>u(null),children:[e.jsx("svg",{viewBox:"0 0 24 24",fill:"none",className:"h-3.5 w-3.5",children:e.jsx("path",{d:"M5 13L9 17L19 7",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round"})}),"OK"]}),e.jsx("button",{type:"button",className:"adv-filter-btn-delete",onClick:()=>G(i),children:e.jsxs("svg",{viewBox:"0 0 24 24",fill:"none",className:"h-3.5 w-3.5",children:[e.jsx("path",{d:"M20.5001 6H3.5",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"}),e.jsx("path",{d:"M18.8334 8.5L18.3735 15.3991C18.1965 18.054 18.108 19.3815 17.243 20.1907C16.378 21 15.0476 21 12.3868 21H11.6134C8.9526 21 7.6222 21 6.75719 20.1907C5.89218 19.3815 5.80368 18.054 5.62669 15.3991L5.16675 8.5",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"})]})})]})]}):e.jsxs("button",{type:"button",className:"adv-filter-pill-summary",onClick:()=>u(i),children:[e.jsx("span",{className:"adv-filter-pill-field",children:c.fieldName}),e.jsx("span",{className:"adv-filter-pill-op",children:((ee=Je[c.operator])==null?void 0:ee.label)||c.operator}),!m(c.operator)&&e.jsx("span",{className:"adv-filter-pill-value",children:C(c.operator)?`${c.value||"?"} – ${c.value2||"?"}`:O?H(c.fieldId,c.value):c.value||"..."}),e.jsx("button",{type:"button",className:"adv-filter-pill-remove",onClick:T=>{T.stopPropagation(),G(i)},children:e.jsx("svg",{viewBox:"0 0 24 24",fill:"none",className:"h-3 w-3",children:e.jsx("path",{d:"M18 6L6 18M6 6L18 18",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round"})})})]})})]},i)}),e.jsxs("div",{className:"adv-filter-add-row",ref:p,children:[e.jsxs("button",{type:"button",className:"adv-filter-add-btn",onClick:()=>b(!x),children:[e.jsx("svg",{viewBox:"0 0 24 24",fill:"none",className:"h-3.5 w-3.5",children:e.jsx("path",{d:"M12 5V19M5 12H19",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round"})}),"Ajouter un filtre"]}),x&&e.jsxs("div",{className:"adv-filter-field-dropdown",children:[e.jsx("div",{className:"adv-filter-field-dropdown-title",children:"Choisir un champ"}),w.map(c=>e.jsxs("button",{type:"button",className:"adv-filter-field-option",onClick:()=>W(c.id),children:[e.jsx("span",{className:"adv-filter-field-type-badge",children:Et(c.type)}),c.name]},c.id))]})]}),o.length>0&&e.jsx("button",{type:"button",className:"adv-filter-clear",onClick:Q,children:"Effacer tous les filtres"})]}),e.jsx("style",{children:`
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
            `})]})}function Et(t){return{text:"Aa",title:"T",email:"@",phone:"☎",url:"🔗",number:"#",currency:"$",percent:"%",date:"📅",datetime:"🕐",textarea:"¶",select:"☰",relation:"↗",classification:"●"}[t]||"Aa"}function Tt({entityName:t,entityNamePlural:o,entityIcon:d,accountNumber:a,entitySlug:N,showSidebar:M,onToggleSidebar:j,filters:_=[],activeFilters:u={},onFilterChange:x,columns:b=[],fieldFilters:p=[],onFieldFiltersChange:I,allRecords:w=[]}){const[W,F]=r.useState(!1),G=r.useRef(null);if(r.useEffect(()=>{const C=y=>{W&&G.current&&!G.current.contains(y.target)&&F(!1)};return W&&document.addEventListener("mousedown",C),()=>document.removeEventListener("mousedown",C)},[W]),!M)return null;const Q=(C,y)=>{const V={...u},H=V[C]||[];if(y==="__all__")delete V[C];else{const c=H.indexOf(y);c>-1?(H.splice(c,1),H.length===0?delete V[C]:V[C]=[...H]):V[C]=[...H,y]}x(V)},m=Object.keys(u).length>0;return e.jsxs("div",{className:"panel z-10 w-full max-w-xs flex-none space-y-4 overflow-y-auto p-4 h-full",style:{display:"flex",flexDirection:"column"},children:[e.jsxs("div",{className:"flex items-center justify-between",children:[e.jsx("div",{className:"flex items-center",children:e.jsxs("div",{className:"flex items-center text-center",children:[e.jsx("div",{children:d?e.jsx("iconify-icon",{icon:d,width:"22",style:{color:"var(--primary)"}}):e.jsxs("svg",{width:"24",height:"24",viewBox:"0 0 24 24",fill:"none",xmlns:"http://www.w3.org/2000/svg",className:"h-5 w-5",children:[e.jsx("path",{d:"M20.3116 12.6473L20.8293 10.7154C21.4335 8.46034 21.7356 7.3328 21.5081 6.35703C21.3285 5.58657 20.9244 4.88668 20.347 4.34587C19.6157 3.66095 18.4881 3.35883 16.2331 2.75458C13.978 2.15033 12.8504 1.84821 11.8747 2.07573C11.1042 2.25537 10.4043 2.65945 9.86351 3.23687C9.27709 3.86298 8.97128 4.77957 8.51621 6.44561C8.43979 6.7254 8.35915 7.02633 8.27227 7.35057L8.27222 7.35077L7.75458 9.28263C7.15033 11.5377 6.84821 12.6652 7.07573 13.641C7.25537 14.4115 7.65945 15.1114 8.23687 15.6522C8.96815 16.3371 10.0957 16.6392 12.3508 17.2435L12.3508 17.2435C14.3834 17.7881 15.4999 18.0873 16.415 17.9744C16.5152 17.9621 16.6129 17.9448 16.7092 17.9223C17.4796 17.7427 18.1795 17.3386 18.7203 16.7612C19.4052 16.0299 19.7074 14.9024 20.3116 12.6473Z",stroke:"currentColor",strokeWidth:"1.5"}),e.jsx("path",{opacity:"0.5",d:"M16.415 17.9741C16.2065 18.6126 15.8399 19.1902 15.347 19.6519C14.6157 20.3368 13.4881 20.6389 11.2331 21.2432C8.97798 21.8474 7.85044 22.1495 6.87466 21.922C6.10421 21.7424 5.40432 21.3383 4.86351 20.7609C4.17859 20.0296 3.87647 18.9021 3.27222 16.647L2.75458 14.7151C2.15033 12.46 1.84821 11.3325 2.07573 10.3567C2.25537 9.58627 2.65945 8.88638 3.23687 8.34557C3.96815 7.66065 5.09569 7.35853 7.35077 6.75428C7.77741 6.63996 8.16368 6.53646 8.51621 6.44531",stroke:"currentColor",strokeWidth:"1.5"}),e.jsx("path",{d:"M11.7769 10L16.6065 11.2941",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"}),e.jsx("path",{opacity:"0.5",d:"M11 12.8975L13.8978 13.6739",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"})]})}),e.jsx("h3",{className:"text-lg font-semibold ltr:ml-3 rtl:mr-3",children:t})]})}),e.jsxs("div",{className:"dropdown relative",ref:G,children:[e.jsx("button",{type:"button",className:"flex h-8 w-8 items-center justify-center rounded-full bg-[#f4f4f4] hover:bg-primary-light dark:bg-[#1b2e4b]",onClick:()=>F(!W),children:e.jsxs("svg",{width:"24",height:"24",viewBox:"0 0 24 24",fill:"none",xmlns:"http://www.w3.org/2000/svg",className:"h-5 w-5 opacity-70",children:[e.jsx("circle",{cx:"5",cy:"12",r:"2",stroke:"currentColor",strokeWidth:"1.5"}),e.jsx("circle",{opacity:"0.5",cx:"12",cy:"12",r:"2",stroke:"currentColor",strokeWidth:"1.5"}),e.jsx("circle",{cx:"19",cy:"12",r:"2",stroke:"currentColor",strokeWidth:"1.5"})]})}),W&&e.jsxs("ul",{className:"whitespace-nowrap absolute right-0 top-full mt-1 z-50 min-w-[160px] rounded-md border border-gray-200 bg-white py-1 shadow-lg dark:border-[#1b2e4b] dark:bg-[#0e1726]",children:[e.jsx("li",{children:e.jsxs("a",{href:"javascript:;",onClick:()=>F(!1),className:"flex items-center px-4 py-2 text-sm hover:bg-gray-100 hover:text-primary dark:hover:bg-[#181F32] dark:hover:text-primary",children:[e.jsx("iconify-icon",{icon:"solar:settings-bold-duotone",className:"h-4.5 w-4.5 shrink-0 ltr:mr-1 rtl:ml-1",width:"18",style:{marginRight:"6px"}}),"Paramètres"]})}),e.jsx("li",{children:e.jsxs("a",{href:"javascript:;",onClick:()=>F(!1),className:"flex items-center px-4 py-2 text-sm hover:bg-gray-100 hover:text-primary dark:hover:bg-[#181F32] dark:hover:text-primary",children:[e.jsx("iconify-icon",{icon:"solar:question-circle-bold-duotone",className:"h-4.5 w-4.5 shrink-0 ltr:mr-1 rtl:ml-1",width:"18",style:{marginRight:"6px"}}),"Aide"]})})]})]})]}),e.jsx("div",{className:"h-px w-full border-b border-[#e0e6ed] dark:border-[#1b2e4b]"}),e.jsx("div",{className:"!mt-0",style:{flex:1,display:"flex",flexDirection:"column"},children:e.jsxs("div",{className:"flex h-full flex-col pb-16",style:{position:"relative"},children:[e.jsx("div",{className:"relative -mr-3.5 h-full grow pr-3.5 overflow-auto",children:e.jsxs("div",{className:"space-y-1",children:[e.jsx("button",{type:"button",className:`flex h-10 w-full items-center justify-between rounded-md p-2 font-medium hover:bg-white-dark/10 hover:text-primary dark:hover:bg-[#181F32] dark:hover:text-primary ${m?"":"bg-gray-100 dark:text-primary text-primary dark:bg-[#181F32]"}`,onClick:()=>x({}),children:e.jsxs("div",{className:"flex items-center",children:[e.jsx("iconify-icon",{icon:"solar:checklist-minimalistic-bold-duotone",width:"20"}),e.jsxs("div",{className:"ltr:ml-3 rtl:mr-3",children:["Toutes les ",o||t]})]})}),e.jsx("button",{type:"button",className:`flex h-10 w-full items-center justify-between rounded-md p-2 font-medium hover:bg-white-dark/10 hover:text-primary dark:hover:bg-[#181F32] dark:hover:text-primary ${u.__favourites?"bg-gray-100 dark:text-primary text-primary dark:bg-[#181F32]":""}`,onClick:()=>{const C={...u};C.__favourites?delete C.__favourites:C.__favourites=!0,x(C)},children:e.jsxs("div",{className:"flex items-center",children:[e.jsx("svg",{width:"24",height:"24",viewBox:"0 0 24 24",fill:"none",xmlns:"http://www.w3.org/2000/svg",className:"h-5 w-5",children:e.jsx("path",{d:"M9.15316 5.40838C10.4198 3.13613 11.0531 2 12 2C12.9469 2 13.5802 3.13612 14.8468 5.40837L15.1745 5.99623C15.5345 6.64193 15.7144 6.96479 15.9951 7.17781C16.2757 7.39083 16.6251 7.4699 17.3241 7.62805L17.9605 7.77203C20.4201 8.32856 21.65 8.60682 21.9426 9.54773C22.2352 10.4886 21.3968 11.4691 19.7199 13.4299L19.2861 13.9372C18.8096 14.4944 18.5713 14.773 18.4641 15.1177C18.357 15.4624 18.393 15.8341 18.465 16.5776L18.5306 17.2544C18.7841 19.8706 18.9109 21.1787 18.1449 21.7602C17.3788 22.3417 16.2273 21.8115 13.9243 20.7512L13.3285 20.4768C12.6741 20.1755 12.3469 20.0248 12 20.0248C11.6531 20.0248 11.3259 20.1755 10.6715 20.4768L10.0757 20.7512C7.77268 21.8115 6.62118 22.3417 5.85515 21.7602C5.08912 21.1787 5.21588 19.8706 5.4694 17.2544L5.53498 16.5776C5.60703 15.8341 5.64305 15.4624 5.53586 15.1177C5.42868 14.773 5.19043 14.4944 4.71392 13.9372L4.2801 13.4299C2.60325 11.4691 1.76482 10.4886 2.05742 9.54773C2.35002 8.60682 3.57986 8.32856 6.03954 7.77203L6.67589 7.62805C7.37485 7.4699 7.72433 7.39083 8.00494 7.17781C8.28555 6.96479 8.46553 6.64194 8.82547 5.99623L9.15316 5.40838Z",stroke:"currentColor",strokeWidth:"1.5"})}),e.jsx("div",{className:"ltr:ml-3 rtl:mr-3",children:"Favourites"})]})}),_.map(C=>e.jsxs("div",{children:[e.jsx("div",{className:"h-px w-full border-b border-[#e0e6ed] dark:border-[#1b2e4b] my-2"}),e.jsx("div",{className:"px-1 py-2 text-white-dark text-xs uppercase font-semibold tracking-wider",children:C.name}),C.type==="tags"?e.jsx("div",{className:"flex flex-wrap gap-1.5 px-1",children:C.options.map(y=>{const V=(u[C.id]||[]).includes(y.id);return e.jsxs("button",{type:"button",className:"mb-0 py-0.5 px-2.5 text-xs rounded-full cursor-pointer transition-all font-medium",style:{border:`1.5px solid ${y.color||"#9ca3af"}`,color:V?"#fff":y.color||"#9ca3af",backgroundColor:V?y.color||"#9ca3af":"transparent"},onClick:()=>Q(C.id,y.id),children:[y.label,y.count!==void 0&&e.jsx("span",{style:{opacity:.7,marginLeft:"2px"},children:y.count})]},y.id)})}):e.jsx("div",{className:"space-y-0.5",children:C.options.map(y=>{const V=(u[C.id]||[]).includes(y.id);return e.jsxs("button",{type:"button",className:`flex h-9 w-full items-center rounded-md px-2 py-1.5 text-sm font-medium transition-colors hover:bg-white-dark/10 hover:text-primary dark:hover:bg-[#181F32] dark:hover:text-primary ${V?"bg-gray-100 text-primary dark:bg-[#181F32] dark:text-primary":""}`,onClick:()=>Q(C.id,y.id),children:[e.jsx("span",{className:"inline-block w-3 h-3 rounded-full mr-2.5 flex-shrink-0",style:{backgroundColor:y.color||"#9ca3af"}}),e.jsx("span",{className:"truncate",children:y.label}),y.count!==void 0&&e.jsx("span",{className:"ml-auto text-xs opacity-60",children:y.count})]},y.id)})})]},C.id)),e.jsx(Rt,{columns:b,fieldFilters:p,onFieldFiltersChange:I,allRecords:w,sidebarFilters:_})]})}),e.jsx("div",{className:"absolute bottom-0 w-full p-4 left-0",children:e.jsxs("a",{href:`/account/${a}/record/${N}/add`,className:"btn btn-primary w-full",children:[e.jsxs("svg",{xmlns:"http://www.w3.org/2000/svg",width:"24px",height:"24px",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round",className:"h-5 w-5 ltr:mr-2 rtl:ml-2",children:[e.jsx("line",{x1:"12",y1:"5",x2:"12",y2:"19"}),e.jsx("line",{x1:"5",y1:"12",x2:"19",y2:"12"})]}),"Ajouter"]})})]})})]})}const Ft=["#4361ee","#805dca","#e2a03f","#00ab55","#e7515a","#2196d4","#3b3f5c","#009688","#ff5722","#607d8b"],Ot={contains:{label:"Contient",icon:"⊃",types:["text","email","phone","url","textarea","title","relation"]},not_contains:{label:"Ne contient pas",icon:"⊅",types:["text","email","phone","url","textarea","title","relation"]},equals:{label:"Est égal à",icon:"=",types:["text","email","phone","url","number","date","title","select","relation","classification"]},not_equals:{label:"N'est pas égal à",icon:"≠",types:["text","email","phone","url","number","date","title","select","relation","classification"]},starts_with:{label:"Commence par",icon:"A…",types:["text","email","phone","url","title"]},ends_with:{label:"Se termine par",icon:"…Z",types:["text","email","phone","url","title"]},gt:{label:"Supérieur à",icon:">",types:["number","date"]},gte:{label:"Supérieur ou égal",icon:"≥",types:["number","date"]},lt:{label:"Inférieur à",icon:"<",types:["number","date"]},lte:{label:"Inférieur ou égal",icon:"≤",types:["number","date"]},between:{label:"Entre",icon:"↔",types:["number","date"]},is_empty:{label:"Est vide",icon:"∅",types:["text","email","phone","url","number","date","textarea","title","select","relation","classification"]},is_not_empty:{label:"N'est pas vide",icon:"∃",types:["text","email","phone","url","number","date","textarea","title","select","relation","classification"]}};function Fe(t){const o=t||"text";return Object.entries(Ot).filter(([d,a])=>a.types.includes(o)).map(([d,a])=>({key:d,...a}))}function Pe(t){return["number","currency","percent"].includes(t)?"number":["date","datetime"].includes(t)?"date":"text"}function Vt({savedViews:t=[],activeViewId:o,onSelectView:d,onCreateView:a,onDeleteView:N,onRenameView:M,onUpdateViewFilters:j,hasActiveFilters:_=!1,activeFilters:u={},fieldFilters:x=[],sidebarFilters:b=[],columns:p=[],externalOpenCreate:I=!1,onCloseExternalCreate:w}){const[W,F]=r.useState(!1),[G,Q]=r.useState(!1),[m,C]=r.useState(""),[y,V]=r.useState("#4361ee"),[H,c]=r.useState(null),[i,X]=r.useState(null),[J,O]=r.useState(""),[v,Z]=r.useState(null),[ee,T]=r.useState([]),[de,le]=r.useState({}),[g,R]=r.useState(!1),z=r.useRef(null),L=r.useRef(null),P=r.useRef(null),E=r.useRef(null);r.useEffect(()=>{const n=S=>{H&&L.current&&!L.current.contains(S.target)&&c(null)};return H&&document.addEventListener("mousedown",n),()=>document.removeEventListener("mousedown",n)},[H]),r.useEffect(()=>{W&&P.current&&setTimeout(()=>{var n;return(n=P.current)==null?void 0:n.focus()},100)},[W]),r.useEffect(()=>{I&&(F(!0),T([...x]),w==null||w())},[I]),r.useEffect(()=>{W&&!v&&(T([...x]),le(JSON.parse(JSON.stringify(u||{}))))},[W]),r.useEffect(()=>{const n=S=>{g&&z.current&&!z.current.contains(S.target)&&R(!1)};return g&&document.addEventListener("mousedown",n),()=>document.removeEventListener("mousedown",n)},[g]),r.useEffect(()=>{i&&E.current&&(E.current.focus(),E.current.select())},[i]);const B=(n,S)=>{n.preventDefault(),c({viewId:S,x:n.clientX,y:n.clientY})},re=()=>{m.trim()&&(a({name:m.trim(),color:y,filters:de,fieldFilters:ee}),C(""),V("#4361ee"),T([]),le({}),F(!1))},oe=r.useMemo(()=>p.filter(n=>n.id!=="actions"),[p]),ce=r.useMemo(()=>{const n={};return b.forEach(S=>{n[`classif:${S.id}`]=S.options||[]}),n},[b]),he=r.useCallback(n=>{const S=oe.find(ue=>ue.id===n);if(!S)return;const ie=n.startsWith("classif:"),ne=Fe(S.type),ve=ie?ne.find(ue=>ue.key==="equals")||ne[0]:ne.find(ue=>ue.key==="contains")||ne[0],ye={fieldId:n,fieldName:S.name,fieldType:S.type||"text",operator:ve.key,value:"",value2:"",logic:"AND"};T(ue=>[...ue,ye]),R(!1)},[oe]),l=r.useCallback((n,S)=>{T(ie=>ie.map((ne,ve)=>ve===n?{...ne,...S}:ne))},[]),A=r.useCallback(n=>{T(S=>S.filter((ie,ne)=>ne!==n))},[]),Y=n=>{const S=t.find(ie=>ie._id===n);S&&(X(n),O(S.name)),c(null)},D=()=>{i&&J.trim()&&M(i,J.trim()),X(null),O("")},me=n=>{N(n),c(null)},K=n=>{const S=t.find(ie=>ie._id===n);S&&(Z(n),C(S.name||""),V(S.color||"#4361ee"),T(S.fieldFilters?JSON.parse(JSON.stringify(S.fieldFilters)):[]),le(S.filters?JSON.parse(JSON.stringify(S.filters)):{}),F(!0),c(null))},pe=()=>{!m.trim()||!v||(j(v,de,ee,m.trim(),y),C(""),V("#4361ee"),T([]),le({}),Z(null),F(!1))},Ce=n=>{var ie;let S=0;return n.filters&&(S+=Object.keys(n.filters).filter(ne=>ne!=="__favourites").length),(ie=n.fieldFilters)!=null&&ie.length&&(S+=n.fieldFilters.length),S};return e.jsxs(e.Fragment,{children:[e.jsxs("div",{className:"saved-views-tabs",children:[e.jsxs("button",{type:"button",className:`saved-view-tab ${o?"":"saved-view-tab--active"}`,onClick:()=>d(null),children:[e.jsxs("svg",{className:"saved-view-tab-icon",viewBox:"0 0 24 24",fill:"none",children:[e.jsx("path",{d:"M2 12C2 7.28595 2 4.92893 3.46447 3.46447C4.92893 2 7.28595 2 12 2C16.714 2 19.0711 2 20.5355 3.46447C22 4.92893 22 7.28595 22 12C22 16.714 22 19.0711 20.5355 20.5355C19.0711 22 16.714 22 12 22C7.28595 22 4.92893 22 3.46447 20.5355C2 19.0711 2 16.714 2 12Z",stroke:"currentColor",strokeWidth:"1.5"}),e.jsx("path",{d:"M6 12H18",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"}),e.jsx("path",{d:"M6 8H18",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"}),e.jsx("path",{d:"M6 16H18",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"})]}),"Tout"]}),t.map(n=>e.jsx("button",{type:"button",className:`saved-view-tab ${o===n._id?"saved-view-tab--active":""}`,style:{"--tab-color":n.color||"#4361ee"},onClick:()=>d(n._id),onContextMenu:S=>B(S,n._id),children:i===n._id?e.jsx("input",{ref:E,type:"text",value:J,onChange:S=>O(S.target.value),onBlur:D,onKeyDown:S=>{S.key==="Enter"&&D(),S.key==="Escape"&&(X(null),O(""))},className:"saved-view-tab-edit-input",onClick:S=>S.stopPropagation()}):e.jsxs(e.Fragment,{children:[e.jsx("span",{className:"saved-view-tab-dot",style:{backgroundColor:n.color||"#4361ee"}}),e.jsx("span",{className:"saved-view-tab-name",children:n.name}),Ce(n)>0&&e.jsx("span",{className:"saved-view-tab-badge",children:Ce(n)})]})},n._id)),e.jsx("button",{type:"button",className:"saved-view-tab saved-view-tab--add",onClick:()=>{Z(null),C(""),V("#4361ee"),F(!0)},title:"Enregistrer une vue",children:e.jsx("svg",{viewBox:"0 0 24 24",fill:"none",className:"h-3.5 w-3.5",children:e.jsx("path",{d:"M12 5V19M5 12H19",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round"})})})]}),H&&e.jsxs("div",{ref:L,className:"saved-view-context-menu",style:{position:"fixed",top:H.y,left:H.x,zIndex:10001},children:[e.jsxs("button",{className:"saved-view-context-item",onClick:()=>Y(H.viewId),children:[e.jsx("svg",{viewBox:"0 0 24 24",fill:"none",className:"h-4 w-4",children:e.jsx("path",{d:"M13.9027 6.37027L17.6297 10.0973M4 20.0001H8L18.5 9.50006C18.9978 9.00236 19.2786 8.32622 19.2786 7.62142C19.2786 6.91661 18.9978 6.24047 18.5 5.74277C18.0023 5.24508 17.3261 4.96426 16.6213 4.96426C15.9165 4.96426 15.2404 5.24508 14.7427 5.74277L4 16.0001V20.0001Z",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round"})}),"Renommer"]}),e.jsxs("button",{className:"saved-view-context-item",onClick:()=>K(H.viewId),children:[e.jsxs("svg",{viewBox:"0 0 24 24",fill:"none",className:"h-4 w-4",children:[e.jsx("path",{d:"M4.06189 13C4.02104 12.6724 4 12.3387 4 12C4 7.58172 7.58172 4 12 4C14.5006 4 16.7332 5.14727 18.2002 6.94416M19.9381 11C19.979 11.3276 20 11.6613 20 12C20 16.4183 16.4183 20 12 20C9.49944 20 7.26681 18.8527 5.79984 17.0558",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round"}),e.jsx("path",{d:"M15 7H19V3",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round"}),e.jsx("path",{d:"M9 17H5V21",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round"})]}),"Modifier la vue"]}),e.jsx("div",{className:"saved-view-context-separator"}),e.jsxs("button",{className:"saved-view-context-item saved-view-context-item--danger",onClick:()=>me(H.viewId),children:[e.jsxs("svg",{viewBox:"0 0 24 24",fill:"none",className:"h-4 w-4",children:[e.jsx("path",{d:"M20.5001 6H3.5",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"}),e.jsx("path",{d:"M18.8334 8.5L18.3735 15.3991C18.1965 18.054 18.108 19.3815 17.243 20.1907C16.378 21 15.0476 21 12.3868 21H11.6134C8.9526 21 7.6222 21 6.75719 20.1907C5.89218 19.3815 5.80368 18.054 5.62669 15.3991L5.16675 8.5",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"}),e.jsx("path",{d:"M9.5 11L10 16",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"}),e.jsx("path",{d:"M14.5 11L14 16",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"}),e.jsx("path",{d:"M6.5 6C6.55588 6 6.58382 6 6.60915 5.99936C7.43259 5.97849 8.15902 5.45491 8.43922 4.68032C8.44784 4.65649 8.45667 4.62999 8.47434 4.57697L8.57143 4.28571C8.65431 4.03708 8.69575 3.91276 8.75071 3.8072C8.97001 3.38607 9.37574 3.09364 9.84461 3.01877C9.96213 3 10.0932 3 10.3553 3H13.6447C13.9068 3 14.0379 3 14.1554 3.01877C14.6243 3.09364 15.03 3.38607 15.2493 3.8072C15.3043 3.91276 15.3457 4.03708 15.4286 4.28571L15.5257 4.57697C15.5433 4.62992 15.5522 4.65651 15.5608 4.68032C15.841 5.45491 16.5674 5.97849 17.3909 5.99936C17.4162 6 17.4441 6 17.5 6",stroke:"currentColor",strokeWidth:"1.5"})]}),"Supprimer"]})]}),W&&e.jsx("div",{className:"saved-view-modal-overlay",onClick:()=>F(!1),children:e.jsxs("div",{className:"saved-view-modal",onClick:n=>n.stopPropagation(),children:[e.jsxs("div",{className:"saved-view-modal-header",children:[e.jsx("h3",{children:v?"Modifier la vue":"Enregistrer la vue"}),e.jsx("button",{type:"button",className:"saved-view-modal-close",onClick:()=>{F(!1),Z(null)},children:e.jsx("svg",{viewBox:"0 0 24 24",fill:"none",className:"h-5 w-5",children:e.jsx("path",{d:"M18 6L6 18M6 6L18 18",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"})})})]}),e.jsxs("div",{className:"saved-view-modal-body",children:[e.jsxs("div",{className:"saved-view-form-group",children:[e.jsx("label",{className:"saved-view-form-label",children:"Nom de la vue"}),e.jsx("input",{ref:P,type:"text",value:m,onChange:n=>C(n.target.value),onKeyDown:n=>{n.key==="Enter"&&re()},placeholder:"Ex: Hôtels, Clients VIP...",className:"saved-view-form-input"})]}),e.jsxs("div",{className:"saved-view-form-group",children:[e.jsx("label",{className:"saved-view-form-label",children:"Couleur"}),e.jsx("div",{className:"saved-view-color-grid",children:Ft.map(n=>e.jsx("button",{type:"button",className:`saved-view-color-swatch ${y===n?"saved-view-color-swatch--active":""}`,style:{backgroundColor:n},onClick:()=>V(n),children:y===n&&e.jsx("svg",{viewBox:"0 0 24 24",fill:"none",className:"h-3 w-3",children:e.jsx("path",{d:"M5 13L9 17L19 7",stroke:"white",strokeWidth:"2.5",strokeLinecap:"round",strokeLinejoin:"round"})})},n))})]}),b.length>0&&e.jsxs("div",{className:"saved-view-form-group",children:[e.jsx("label",{className:"saved-view-form-label",children:"Filtres de classification"}),e.jsx("div",{className:"svm-classif-editor",children:b.map(n=>{const S=de[n.id]||[];return e.jsxs("div",{className:"svm-classif-group",children:[e.jsx("span",{className:"svm-classif-group-label",children:n.name}),e.jsx("div",{className:"svm-classif-options",children:(n.options||[]).map(ie=>{const ne=S.includes(ie.id);return e.jsxs("button",{type:"button",className:`svm-classif-pill ${ne?"svm-classif-pill--active":""}`,style:{"--pill-color":ie.color||"#9ca3af"},onClick:()=>{le(ve=>{const ye=ve[n.id]||[];let ue;ne?ue=ye.filter(we=>we!==ie.id):ue=[...ye,ie.id];const ke={...ve};return ue.length>0?ke[n.id]=ue:delete ke[n.id],ke})},children:[ne&&e.jsx("svg",{viewBox:"0 0 24 24",fill:"none",className:"svm-classif-check",children:e.jsx("path",{d:"M5 13L9 17L19 7",stroke:"currentColor",strokeWidth:"2.5",strokeLinecap:"round",strokeLinejoin:"round"})}),ie.label]},ie.id)})})]},n.id)})})]}),e.jsxs("div",{className:"saved-view-form-group",children:[e.jsx("label",{className:"saved-view-form-label",children:"Filtres avancés"}),e.jsxs("div",{className:"svm-filter-builder",children:[ee.map((n,S)=>{var we;const ie=(we=n.fieldId)==null?void 0:we.startsWith("classif:"),ne=ie?ce[n.fieldId]||[]:[],ve=Fe(n.fieldType),ye=["is_empty","is_not_empty"].includes(n.operator),ue=n.operator==="between",ke=n.logic||"AND";return e.jsxs(We.Fragment,{children:[S>0&&e.jsxs("div",{className:"svm-filter-connector",children:[e.jsx("span",{className:"svm-filter-connector-line"}),e.jsx("button",{type:"button",className:`svm-filter-connector-badge ${ke==="OR"?"svm-filter-connector-badge--or":""}`,onClick:()=>l(S,{logic:ke==="AND"?"OR":"AND"}),title:"Cliquez pour basculer ET/OU",children:ke==="OR"?"OU":"ET"}),e.jsx("span",{className:"svm-filter-connector-line"})]}),e.jsxs("div",{className:"svm-filter-row",children:[e.jsx("select",{value:n.fieldId,onChange:ae=>{const je=oe.find(Me=>Me.id===ae.target.value);if(je){const Me=ae.target.value.startsWith("classif:"),Ne=Fe(je.type),Le=Me?Ne.find(be=>be.key==="equals")||Ne[0]:Ne.find(be=>be.key===n.operator)||Ne[0];l(S,{fieldId:je.id,fieldName:je.name,fieldType:je.type||"text",operator:Le.key,value:"",value2:""})}},className:"svm-filter-select svm-filter-select--field",children:oe.map(ae=>e.jsx("option",{value:ae.id,children:ae.name},ae.id))}),e.jsx("select",{value:n.operator,onChange:ae=>l(S,{operator:ae.target.value,value:["is_empty","is_not_empty"].includes(ae.target.value)?"":n.value,value2:""}),className:"svm-filter-select svm-filter-select--op",children:ve.map(ae=>e.jsx("option",{value:ae.key,children:ae.label},ae.key))}),!ye&&(ie&&ne.length>0?e.jsxs("select",{value:n.value,onChange:ae=>l(S,{value:ae.target.value}),className:"svm-filter-select svm-filter-select--val",children:[e.jsx("option",{value:"",children:"Sélectionnez..."}),ne.map(ae=>e.jsx("option",{value:ae.label,children:ae.label},ae.id))]}):e.jsx("input",{type:Pe(n.fieldType),value:n.value,onChange:ae=>l(S,{value:ae.target.value}),placeholder:"Valeur...",className:"svm-filter-input"})),ue&&e.jsx("input",{type:Pe(n.fieldType),value:n.value2||"",onChange:ae=>l(S,{value2:ae.target.value}),placeholder:"Max...",className:"svm-filter-input"}),e.jsx("button",{type:"button",className:"svm-filter-remove",onClick:()=>A(S),title:"Supprimer ce filtre",children:e.jsx("svg",{viewBox:"0 0 24 24",fill:"none",className:"h-3.5 w-3.5",children:e.jsx("path",{d:"M18 6L6 18M6 6L18 18",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round"})})})]})]},S)}),e.jsxs("div",{className:"svm-filter-add-row",ref:z,children:[e.jsxs("button",{type:"button",className:"svm-filter-add-btn",onClick:()=>R(!g),children:[e.jsx("svg",{viewBox:"0 0 24 24",fill:"none",className:"h-3.5 w-3.5",children:e.jsx("path",{d:"M12 5V19M5 12H19",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round"})}),"Ajouter un filtre"]}),g&&e.jsxs("div",{className:"svm-filter-field-dropdown",children:[e.jsx("div",{className:"svm-filter-field-dropdown-title",children:"Choisir un champ"}),oe.map(n=>e.jsx("button",{type:"button",className:"svm-filter-field-option",onClick:()=>he(n.id),children:n.name},n.id))]})]})]})]})]}),e.jsxs("div",{className:"saved-view-modal-footer",children:[e.jsx("button",{type:"button",className:"saved-view-btn saved-view-btn--cancel",onClick:()=>{F(!1),Z(null)},children:"Annuler"}),e.jsxs("button",{type:"button",className:"saved-view-btn saved-view-btn--save",onClick:v?pe:re,disabled:!m.trim(),children:[e.jsx("svg",{viewBox:"0 0 24 24",fill:"none",className:"h-4 w-4",children:e.jsx("path",{d:"M5 13L9 17L19 7",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round"})}),v?"Mettre à jour":"Enregistrer"]})]})]})}),e.jsx("style",{children:`
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
            `})]})}function Bt(t,o){var a,N,M;if(o==="title")return t.referenceTitle||t.computedTitle||t.title||"";if(o==="createdAt")return t.createdAt||"";if(o==="updatedAt")return t.updatedAt||"";if(o.startsWith("rel:")){const j=o.replace("rel:",""),u=(((a=t._denorm)==null?void 0:a.relations)||[]).find(p=>p.relationKey===j);if(((N=u==null?void 0:u.records)==null?void 0:N.length)>0)return u.records.map(p=>p.title||p.computedTitle||"").join(", ");const x=(t.relations||[]).find(p=>p.key===j||p.relationKey===j);if(x)return x.title||x.computedTitle||x.value||"";const b=(M=t._denorm)==null?void 0:M[j];return b&&(b.title||b.computedTitle)||""}if(o.startsWith("classif:")){const j=o.replace("classif:","");return(t.classificationValues||[]).filter(x=>{var b;return((b=x.classificationId)==null?void 0:b.toString())===j}).map(x=>x.label||x.optionLabel||"").join(", ")}const d=(t.customFields||[]).find(j=>{var _,u,x;return((u=(_=j.field_id)==null?void 0:_._id)==null?void 0:u.toString())===o||((x=j.field_id)==null?void 0:x.toString())===o});return(d==null?void 0:d.value)??""}function zt(t,o){const{operator:d,value:a,value2:N,fieldType:M}=o,j=["number","currency","percent"].includes(M),_=["date","datetime"].includes(M),u=String(t??"").trim(),x=u.toLowerCase(),b=String(a??"").trim().toLowerCase();switch(d){case"contains":return x.includes(b);case"not_contains":return!x.includes(b);case"equals":return j?parseFloat(u)===parseFloat(a):x===b;case"not_equals":return j?parseFloat(u)!==parseFloat(a):x!==b;case"starts_with":return x.startsWith(b);case"ends_with":return x.endsWith(b);case"gt":return _?new Date(t)>new Date(a):parseFloat(u)>parseFloat(a);case"gte":return _?new Date(t)>=new Date(a):parseFloat(u)>=parseFloat(a);case"lt":return _?new Date(t)<new Date(a):parseFloat(u)<parseFloat(a);case"lte":return _?new Date(t)<=new Date(a):parseFloat(u)<=parseFloat(a);case"between":{if(_){const I=new Date(t);return I>=new Date(a)&&I<=new Date(N)}const p=parseFloat(u);return p>=parseFloat(a)&&p<=parseFloat(N)}case"is_empty":return u===""||t==null;case"is_not_empty":return u!==""&&t!=null;default:return!0}}function At({accountId:t,accountNumber:o,entityId:d,viewId:a,entityName:N,entityNamePlural:M,entitySlug:j}){const[_,u]=r.useState([]),[x,b]=r.useState([]),[p,I]=r.useState([]),[w,W]=r.useState([]),[F,G]=r.useState(!0),[Q,m]=r.useState(null),[C,y]=r.useState(""),[V,H]=r.useState("table"),[c,i]=r.useState(""),[X,J]=r.useState(null),[O,v]=r.useState(new Set),[Z,ee]=r.useState(!1),T=r.useRef(null),[de,le]=r.useState([]),[g,R]=r.useState({}),[z,L]=r.useState([]),[P,E]=r.useState([]),[B,re]=r.useState(null),[oe,ce]=r.useState(!1),[he,l]=r.useState(null),A=r.useRef(null),Y=r.useCallback((s,f="success")=>{A.current&&clearTimeout(A.current),l({message:s,type:f}),A.current=setTimeout(()=>l(null),2500)},[]),[D,me]=r.useState({columns:[],sort:{field:"createdAt",direction:"desc"},density:"normal",pageSize:10,titleDisplay:"avatar",showSidebar:!0,viewMode:null,enabledViews:["table","kanban","notes"]}),[K,pe]=r.useState({page:1,limit:10,total:0,pages:0}),Ce=r.useRef(null),n=r.useCallback(async()=>{var s,f;try{G(!0),m(null);const k=new URLSearchParams({limit:1e4,sort:`${D.sort.field}:${D.sort.direction}`}),$=await fetch(`/account/${o}/api/entity/${d}/views/${a}/records?${k}`,{credentials:"include"});if(!$.ok)throw new Error(`HTTP ${$.status}`);const h=await $.json();if(u(h.records||[]),b(h.records||[]),h.entity&&(J(h.entity),h.entity.icon&&i(h.entity.icon)),h.filters&&le(h.filters),h.preferences)if(me(q=>{var U,te;return{...q,...h.preferences,columns:(U=h.preferences.columns)!=null&&U.length?h.preferences.columns:((te=h.columns)==null?void 0:te.map(se=>({id:se.id,visible:!0})))||[]}}),h.preferences.pageSize&&pe(q=>({...q,limit:h.preferences.pageSize})),h.preferences.viewMode&&H(h.preferences.viewMode),(s=h.preferences.columns)!=null&&s.length&&((f=h.columns)!=null&&f.length)){const q=[];h.preferences.columns.forEach(U=>{const te=h.columns.find(se=>se.id===U.id);te&&q.push(te)}),h.columns.forEach(U=>{q.find(te=>te.id===U.id)||q.push(U)}),W(q)}else W(h.columns||[]);else h.columns&&(W(h.columns||[]),me(q=>({...q,columns:h.columns.map(U=>({id:U.id,visible:!0}))})))}catch(k){console.error("[RecordsGrid] Fetch error:",k),m(k.message)}finally{G(!1)}},[o,d,a,D.sort]),S=r.useCallback(async()=>{try{const s=await fetch(`/account/${o}/api/entity/${d}/saved-views`,{credentials:"include"});if(s.ok){const f=await s.json();E(f.views||[])}}catch(s){console.error("[RecordsGrid] Fetch saved views error:",s)}},[o,d]),ie=r.useCallback(async({name:s,color:f,filters:k,fieldFilters:$})=>{try{const h=await fetch(`/account/${o}/api/entity/${d}/saved-views`,{method:"POST",headers:{"Content-Type":"application/json"},credentials:"include",body:JSON.stringify({name:s,color:f,filters:k,fieldFilters:$})});if(h.ok){const q=await h.json();E(U=>[...U,q.view]),re(q.view._id)}}catch(h){console.error("[RecordsGrid] Create saved view error:",h)}},[o,d]),ne=r.useCallback(async s=>{try{(await fetch(`/account/${o}/api/entity/${d}/saved-views/${s}`,{method:"DELETE",credentials:"include"})).ok&&(E(k=>k.filter($=>$._id!==s)),B===s&&(re(null),R({}),pe(k=>({...k,page:1}))))}catch(f){console.error("[RecordsGrid] Delete saved view error:",f)}},[o,d,B]),ve=r.useCallback(async(s,f)=>{try{(await fetch(`/account/${o}/api/entity/${d}/saved-views/${s}`,{method:"PUT",headers:{"Content-Type":"application/json"},credentials:"include",body:JSON.stringify({name:f})})).ok&&E($=>$.map(h=>h._id===s?{...h,name:f}:h))}catch(k){console.error("[RecordsGrid] Rename saved view error:",k)}},[o,d]),ye=r.useCallback(async(s,f,k,$,h)=>{var q;try{const U={filters:f,fieldFilters:k||[]};if($&&(U.name=$),h&&(U.color=h),(await fetch(`/account/${o}/api/entity/${d}/saved-views/${s}`,{method:"PUT",headers:{"Content-Type":"application/json"},credentials:"include",body:JSON.stringify(U)})).ok){const se=JSON.parse(JSON.stringify(f||{})),xe=JSON.parse(JSON.stringify(k||[]));E(ge=>ge.map(Se=>{if(Se._id!==s)return Se;const Re={...Se,filters:se,fieldFilters:xe};return $&&(Re.name=$),h&&(Re.color=h),Re}));const fe=$||((q=P.find(ge=>ge._id===s))==null?void 0:q.name)||"Vue";Y(`Vue "${fe}" mise à jour`)}else Y("Erreur lors de la mise à jour","error")}catch(U){console.error("[RecordsGrid] Update saved view error:",U),Y("Erreur lors de la mise à jour","error")}},[o,d,P,Y]),ue=r.useCallback(s=>{if(!s){re(null),R({}),L([]),pe(k=>({...k,page:1}));return}const f=P.find(k=>k._id===s);f&&(re(s),R(JSON.parse(JSON.stringify(f.filters||{}))),L(JSON.parse(JSON.stringify(f.fieldFilters||[]))),pe(k=>({...k,page:1})))},[P]);r.useEffect(()=>{n(),S()},[]);const ke=r.useMemo(()=>{if(!_.length)return[];const{field:s,direction:f}=D.sort,k=f==="asc"?1:-1;return[..._].sort(($,h)=>{let q,U;if(s==="title")q=($.referenceTitle||$.title||"").toLowerCase(),U=(h.referenceTitle||h.title||"").toLowerCase();else if(s==="createdAt"||s==="updatedAt")q=new Date($[s]||0).getTime(),U=new Date(h[s]||0).getTime();else{const te=($.customFields||[]).find(xe=>{var ge;const fe=((ge=xe.field_id)==null?void 0:ge._id)||xe.field_id;return(fe==null?void 0:fe.toString())===s}),se=(h.customFields||[]).find(xe=>{var ge;const fe=((ge=xe.field_id)==null?void 0:ge._id)||xe.field_id;return(fe==null?void 0:fe.toString())===s});q=((te==null?void 0:te.value)||"").toString().toLowerCase(),U=((se==null?void 0:se.value)||"").toString().toLowerCase()}return q<U?-1*k:q>U?1*k:0})},[_,D.sort.field,D.sort.direction]),we=r.useMemo(()=>ke.map(s=>({...s,_searchIndex:[s.title||"",s.referenceTitle||"",s.computedTitle||"",...(s.customFields||[]).map(f=>f.value||"")].join(" ").toLowerCase()})),[ke]),ae=r.useCallback((s,f,k,$)=>{let h=s;if(f&&f.trim()){const U=f.toLowerCase();h=h.filter(te=>te._searchIndex.includes(U))}const q=Object.keys(k).filter(U=>U!=="__favourites");return q.length>0&&(h=h.filter(U=>{const te=U.classificationValues||[];return q.every(se=>{const xe=k[se];return!xe||xe.length===0?!0:te.some(fe=>{var ge,Se;return((ge=fe.classificationId)==null?void 0:ge.toString())===se&&xe.includes((Se=fe.optionId)==null?void 0:Se.toString())})})})),$&&$.length>0&&(h=h.filter(U=>{const te=[[$[0]]];for(let se=1;se<$.length;se++)($[se].logic||"AND")==="OR"?te.push([$[se]]):te[te.length-1].push($[se]);return te.some(se=>se.every(xe=>{const fe=Bt(U,xe.fieldId);return zt(fe,xe)}))})),h},[]),je=r.useCallback(s=>{var k;const f=typeof s=="string"?s:((k=s==null?void 0:s.target)==null?void 0:k.value)||"";y(f),pe($=>({...$,page:1}))},[]),Me=r.useCallback(s=>{R(s),pe(f=>({...f,page:1}))},[]),Ne=r.useCallback(s=>{L(s),pe(f=>({...f,page:1}))},[]);r.useEffect(()=>{const s=ae(we,C,g,z);b(s)},[we,C,g,z,ae]),r.useEffect(()=>{const s=(K.page-1)*K.limit,f=s+K.limit,k=x.slice(s,f);I(k),pe($=>({...$,total:x.length,pages:Math.ceil(x.length/K.limit)}))},[x,K.page,K.limit]);const Le=r.useCallback(async s=>{try{await fetch(`/account/${o}/api/user/view-preferences`,{method:"POST",headers:{"Content-Type":"application/json"},credentials:"include",body:JSON.stringify({viewId:a,preferences:s})})}catch(f){console.error("[RecordsGrid] Save preferences error:",f)}},[o,a]),be=r.useCallback((s,f)=>{const k={...D,[s]:f};me(k),Le(k),s==="pageSize"&&pe($=>({...$,limit:f,page:1}))},[D,Le]),Ke=r.useCallback(s=>{H(s),me(f=>{const k={...f,viewMode:s};return Le(k),k})},[Le]),De=r.useCallback(s=>{pe(f=>({...f,page:s}))},[]),Ue=r.useCallback((s,f,k)=>{if(k&&T.current!==null&&T.current!==f){const $=Math.min(T.current,f),h=Math.max(T.current,f);v(q=>{const U=new Set(q);for(let te=$;te<=h;te++)p[te]&&U.add(p[te]._id);return U})}else v($=>{const h=new Set($);return h.has(s)?h.delete(s):h.add(s),h});T.current=f},[p]),Ye=r.useCallback(()=>{v(s=>{const f=p.map(h=>h._id),k=f.every(h=>s.has(h)),$=new Set(s);return k?f.forEach(h=>$.delete(h)):f.forEach(h=>$.add(h)),$})},[p]),qe=r.useCallback(()=>{v(s=>{const f=x.map(k=>k._id);return s.size===f.length?new Set:new Set(f)})},[x]),Xe=r.useCallback(()=>{v(new Set)},[]),Qe=r.useMemo(()=>p.length===0?!1:p.every(s=>O.has(s._id)),[p,O]),Ge=r.useCallback(async()=>{if(!(O.size===0||!(typeof Swal<"u"?await Swal.fire({title:"Confirmer la suppression",html:`<p>Vous allez supprimer <strong>${O.size}</strong> enregistrement(s).</p><p style="color:#e7515a;font-size:13px;margin-top:8px;">Cette action est irréversible.</p>`,icon:"warning",showCancelButton:!0,confirmButtonColor:"#e7515a",cancelButtonText:"Annuler",confirmButtonText:"Supprimer"}).then(f=>f.isConfirmed):confirm(`Supprimer ${O.size} enregistrement(s) ?`)))){ee(!0);try{const k=await(await fetch(`/account/${o}/record/api/bulk-delete`,{method:"POST",headers:{"Content-Type":"application/json"},credentials:"include",body:JSON.stringify({ids:[...O]})})).json();k.success?(u($=>$.filter(h=>!O.has(h._id))),v(new Set),Y(`${k.deletedCount} enregistrement(s) supprimé(s)`)):Y(k.error||"Erreur lors de la suppression","error")}catch(f){console.error("[RecordsGrid] Bulk delete error:",f),Y("Erreur lors de la suppression","error")}finally{ee(!1)}}},[O,o,Y]),et=r.useCallback((s,f)=>{W(k=>{const $=k.findIndex(se=>se.id===s),h=k.findIndex(se=>se.id===f);if($===-1||h===-1)return k;const q=[...k],[U]=q.splice($,1);q.splice(h,0,U);const te=q.map(se=>D.columns.find(fe=>fe.id===se.id)||{id:se.id,visible:!0});return be("columns",te),q})},[D.columns,be]),Oe=r.useMemo(()=>{switch(D.density){case"compact":return 36;case"comfortable":return 56;default:return 44}},[D.density]),Ie=st({count:p.length,getScrollElement:()=>Ce.current,estimateSize:()=>Oe,overscan:10});r.useEffect(()=>{Ie.measure()},[Oe,Ie]);const tt=r.useMemo(()=>{var k;let s;(k=D.columns)!=null&&k.length?s=w.filter($=>{const h=D.columns.find(q=>q.id===$.id);return h?h.visible!==!1:!0}):s=w;const f=s.findIndex($=>$.id==="actions");if(f>-1&&f<s.length-1){const[$]=s.splice(f,1);s=[...s,$]}return s},[w,D.columns]);return F&&p.length===0?e.jsx("div",{className:"flex items-center justify-center h-64",children:e.jsx("div",{className:"animate-spin rounded-full h-8 w-8 border-b-2 border-primary"})}):Q&&p.length===0?e.jsx("div",{className:"flex items-center justify-center h-64 text-danger",children:e.jsxs("span",{children:["Erreur: ",Q]})}):e.jsxs("div",{className:"relative flex h-full gap-5 sm:min-h-0",children:[e.jsx(Tt,{entityName:N,entityNamePlural:M,entityIcon:c,accountNumber:o,entitySlug:j,showSidebar:D.showSidebar!==!1,onToggleSidebar:()=>be("showSidebar",!D.showSidebar),filters:de,activeFilters:g,onFilterChange:Me,columns:w,fieldFilters:z,onFieldFiltersChange:Ne,allRecords:_}),e.jsxs("div",{className:"panel p-4 flex-1 flex flex-col overflow-hidden h-full",children:[e.jsx(bt,{searchQuery:C,onSearch:je,columns:w,preferences:D,onPreferencesChange:be,loading:F,accountNumber:o,entitySlug:j,viewId:a,showSidebar:D.showSidebar!==!1,onToggleSidebar:()=>be("showSidebar",!D.showSidebar),activeView:V,onViewChange:Ke,enabledViews:D.enabledViews||["table","kanban","notes"],onEnabledViewsChange:s=>be("enabledViews",s),hasActiveFilters:Object.keys(g).filter(s=>s!=="__favourites").length>0||z.length>0,onOpenSaveView:()=>ce(!0)}),e.jsx(Vt,{savedViews:P,activeViewId:B,onSelectView:ue,onCreateView:ie,onDeleteView:ne,onRenameView:ve,onUpdateViewFilters:ye,hasActiveFilters:Object.keys(g).filter(s=>s!=="__favourites").length>0||z.length>0,activeFilters:g,fieldFilters:z,sidebarFilters:de,columns:w,externalOpenCreate:oe,onCloseExternalCreate:()=>ce(!1)}),e.jsx("div",{className:"flex-1 flex flex-col overflow-hidden mt-4",children:V==="kanban"?e.jsx(Ct,{records:x,columns:w,accountNumber:o,entitySlug:j,viewId:a,entityData:X}):V==="notes"?e.jsx(It,{records:x,accountNumber:o,entitySlug:j}):e.jsxs("div",{className:"dataTable-wrapper flex-1 flex flex-col overflow-hidden",children:[e.jsx("div",{className:"dataTable-container flex-1 overflow-auto",ref:Ce,children:e.jsx(vt,{records:p,columns:tt,virtualizer:Ie,sort:D.sort,onSort:s=>{const f=D.sort.field===s&&D.sort.direction==="asc"?"desc":"asc";be("sort",{field:s,direction:f})},onColumnReorder:et,density:D.density,titleDisplay:D.titleDisplay||"avatar",entityIcon:c,accountNumber:o,entitySlug:j,selectedIds:O,onToggleSelect:Ue,onSelectAll:Ye,allPageSelected:Qe,showCheckboxes:D.showCheckboxes!==!1})}),e.jsxs("div",{className:"dataTable-bottom flex items-center justify-between border-t pt-4 dark:border-gray-800",children:[e.jsxs("div",{className:"dataTable-info text-gray-500 dark:text-gray-400",children:["Affichage de ",(K.page-1)*K.limit+1," à ",Math.min(K.page*K.limit,K.total)," sur ",K.total]}),e.jsx("nav",{className:"dataTable-pagination",children:e.jsxs("ul",{className:"inline-flex items-center space-x-1 rtl:space-x-reverse",children:[e.jsx("li",{children:e.jsx("button",{onClick:()=>De(K.page-1),disabled:K.page<=1,className:"flex justify-center font-semibold p-2 rounded-full transition bg-white-light text-dark hover:text-white hover:bg-primary dark:text-white-light dark:bg-[#191e3a] dark:hover:bg-primary disabled:opacity-50",children:"«"})}),Array.from({length:Math.min(K.pages,5)},(s,f)=>{let k;return K.pages<=5||K.page<=3?k=f+1:K.page>=K.pages-2?k=K.pages-4+f:k=K.page-2+f,e.jsx("li",{children:e.jsx("button",{onClick:()=>De(k),className:`flex justify-center font-semibold px-3.5 py-2 rounded-full transition ${k===K.page?"bg-primary text-white dark:bg-primary dark:text-white-light":"bg-white-light text-dark hover:text-white hover:bg-primary dark:text-white-light dark:bg-[#191e3a] dark:hover:bg-primary"}`,children:k})},k)}),e.jsx("li",{children:e.jsx("button",{onClick:()=>De(K.page+1),disabled:K.page>=K.pages,className:"flex justify-center font-semibold p-2 rounded-full transition bg-white-light text-dark hover:text-white hover:bg-primary dark:text-white-light dark:bg-[#191e3a] dark:hover:bg-primary disabled:opacity-50",children:"»"})})]})})]})]})})]}),O.size>0&&e.jsxs("div",{className:"bulk-action-bar",style:{position:"fixed",bottom:"24px",left:"50%",transform:"translateX(-50%)",zIndex:99999,display:"flex",alignItems:"center",gap:"12px",padding:"10px 20px",borderRadius:"14px",background:"linear-gradient(135deg, #1b2e4b 0%, #0e1726 100%)",boxShadow:"0 8px 32px rgba(0,0,0,0.3), 0 0 0 1px rgba(67,97,238,0.2)",animation:"bulkBarSlideUp 0.3s cubic-bezier(0.16,1,0.3,1)",backdropFilter:"blur(12px)"},children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"8px"},children:[e.jsx("div",{style:{width:28,height:28,borderRadius:"8px",background:"rgba(67,97,238,0.2)",color:"#4361ee",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"12px",fontWeight:700},children:O.size}),e.jsxs("span",{style:{color:"#e0e6ed",fontSize:"13px",fontWeight:500,whiteSpace:"nowrap"},children:["sélectionné",O.size>1?"s":""]})]}),e.jsx("div",{style:{width:1,height:24,background:"rgba(255,255,255,0.1)"}}),O.size<x.length&&e.jsxs("button",{onClick:qe,style:{padding:"6px 12px",borderRadius:"8px",border:"1px solid rgba(67,97,238,0.3)",background:"rgba(67,97,238,0.1)",color:"#93b4fd",fontSize:"12px",fontWeight:600,cursor:"pointer",transition:"all 0.15s",whiteSpace:"nowrap"},onMouseEnter:s=>{s.target.style.background="rgba(67,97,238,0.2)",s.target.style.color="#b8cffe"},onMouseLeave:s=>{s.target.style.background="rgba(67,97,238,0.1)",s.target.style.color="#93b4fd"},children:["Tout sélectionner (",x.length,")"]}),e.jsx("div",{style:{width:1,height:24,background:"rgba(255,255,255,0.1)"}}),e.jsxs("button",{onClick:Ge,disabled:Z,style:{display:"flex",alignItems:"center",gap:"6px",padding:"6px 14px",borderRadius:"8px",border:"none",background:"rgba(231,81,90,0.15)",color:"#ff6b6b",fontSize:"12px",fontWeight:600,cursor:Z?"wait":"pointer",transition:"all 0.15s",whiteSpace:"nowrap",opacity:Z?.6:1},onMouseEnter:s=>{Z||(s.target.style.background="rgba(231,81,90,0.25)",s.target.style.color="#ff8a8a")},onMouseLeave:s=>{s.target.style.background="rgba(231,81,90,0.15)",s.target.style.color="#ff6b6b"},children:[e.jsxs("svg",{viewBox:"0 0 24 24",fill:"none",style:{width:14,height:14},children:[e.jsx("path",{d:"M20.5 6H3.5",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"}),e.jsx("path",{d:"M18.833 8.5L18.373 15.4C18.196 18.054 18.108 19.381 17.243 20.19C16.378 21 15.048 21 12.387 21H11.613C8.952 21 7.622 21 6.757 20.19C5.892 19.381 5.804 18.054 5.627 15.4L5.167 8.5",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"})]}),Z?"Suppression...":"Supprimer"]}),e.jsx("div",{style:{width:1,height:24,background:"rgba(255,255,255,0.1)"}}),e.jsx("button",{onClick:Xe,style:{width:28,height:28,borderRadius:"8px",border:"none",background:"rgba(255,255,255,0.08)",color:"#888ea8",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",transition:"all 0.15s"},onMouseEnter:s=>{s.target.style.background="rgba(255,255,255,0.15)",s.target.style.color="#e0e6ed"},onMouseLeave:s=>{s.target.style.background="rgba(255,255,255,0.08)",s.target.style.color="#888ea8"},title:"Désélectionner tout",children:e.jsx("svg",{viewBox:"0 0 24 24",fill:"none",style:{width:14,height:14},children:e.jsx("path",{d:"M18 6L6 18M6 6L18 18",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round"})})})]}),he&&e.jsxs("div",{style:{position:"fixed",bottom:O.size>0?"80px":"24px",right:"24px",zIndex:99999,padding:"10px 20px",borderRadius:"10px",fontSize:"13px",fontWeight:500,color:"#fff",background:he.type==="error"?"#e7515a":"#00ab55",boxShadow:"0 4px 20px rgba(0,0,0,0.15)",animation:"toastSlideIn 0.25s ease-out",display:"flex",alignItems:"center",gap:"8px",transition:"bottom 0.3s ease"},children:[e.jsx("svg",{viewBox:"0 0 24 24",fill:"none",style:{width:16,height:16,flexShrink:0},children:he.type==="error"?e.jsx("path",{d:"M12 8V12M12 16H12.01M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"}):e.jsx("path",{d:"M5 13L9 17L19 7",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round"})}),he.message]}),e.jsx("style",{children:`
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
            `})]})}function He(){document.querySelectorAll('[data-island="records-grid"]').forEach(t=>{if(t.dataset.mounted==="1")return;t.dataset.mounted="1";const o={accountId:t.dataset.accountId,accountNumber:t.dataset.accountNumber,entityId:t.dataset.entityId,viewId:t.dataset.viewId,entityName:t.dataset.entityName||"Records",entityNamePlural:t.dataset.entityNamePlural||"",entitySlug:t.dataset.entitySlug||"records"};console.log("[RecordsGrid Island] Mounting:",o),rt(t).render(e.jsx(We.StrictMode,{children:e.jsx(At,{...o})}))})}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",He):He();
