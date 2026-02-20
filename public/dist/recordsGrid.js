import{r,j as e,a as _e,R as We,c as ot}from"./chunks/client-CkWOIrXP.js";import{u as it}from"./chunks/index-CjVSFo3p.js";import{u as nt,a as Ee,D as lt,c as dt,b as ct,d as pt,s as ut,K as xt,T as ft,M as ht,e as mt,S as gt,v as bt,f as vt,C as kt}from"./chunks/sortable.esm-DQ9-A8Dw.js";const Ve=[{id:"table",label:"Tableau",icon:e.jsxs("svg",{viewBox:"0 0 24 24",fill:"none",className:"h-4 w-4",children:[e.jsx("path",{d:"M3 7H21",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"}),e.jsx("path",{d:"M3 12H21",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"}),e.jsx("path",{d:"M3 17H21",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"})]})},{id:"kanban",label:"Kanban",icon:e.jsxs("svg",{viewBox:"0 0 24 24",fill:"none",className:"h-4 w-4",children:[e.jsx("rect",{x:"3",y:"3",width:"5",height:"18",rx:"1",stroke:"currentColor",strokeWidth:"1.5"}),e.jsx("rect",{x:"10",y:"3",width:"5",height:"12",rx:"1",stroke:"currentColor",strokeWidth:"1.5"}),e.jsx("rect",{x:"17",y:"3",width:"4",height:"15",rx:"1",stroke:"currentColor",strokeWidth:"1.5"})]})},{id:"notes",label:"Notes",icon:e.jsxs("svg",{viewBox:"0 0 24 24",fill:"none",className:"h-4 w-4",children:[e.jsx("path",{d:"M2 12C2 7.28595 2 4.92893 3.46447 3.46447C4.92893 2 7.28595 2 12 2C16.714 2 19.0711 2 20.5355 3.46447C22 4.92893 22 7.28595 22 12C22 16.714 22 19.0711 20.5355 20.5355C19.0711 22 16.714 22 12 22C7.28595 22 4.92893 22 3.46447 20.5355C2 19.0711 2 16.714 2 12Z",stroke:"currentColor",strokeWidth:"1.5"}),e.jsx("path",{opacity:"0.5",d:"M2 12H22",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"}),e.jsx("path",{opacity:"0.5",d:"M12 2V22",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"})]})}];function yt({searchQuery:t,onSearch:i,columns:d,preferences:a,onPreferencesChange:N,loading:_,accountNumber:C,entitySlug:$,viewId:u,showSidebar:x,onToggleSidebar:k,activeView:p,onViewChange:I,enabledViews:w=["table","kanban","notes"],onEnabledViewsChange:D,hasActiveFilters:O=!1,onOpenSaveView:ee}){var ie,ce,he;const[G,m]=r.useState(!1),[P,V]=r.useState(!1),[J,U]=r.useState(!1),[c,o]=r.useState(!1),[K,H]=r.useState(""),F=r.useRef(null),v=r.useRef(null),g=r.useRef(null),S=r.useRef(null),j=r.useRef(null),oe=r.useRef(null),ne=r.useRef(null),b=r.useRef(null),E=()=>{m(!1),V(!1),U(!1),o(!1)};r.useEffect(()=>{const l=A=>{A.key==="Escape"&&E()};return document.addEventListener("keydown",l),()=>document.removeEventListener("keydown",l)},[]);const B=(l,A,X,R)=>{r.useEffect(()=>{const me=Y=>{l&&A.current&&!A.current.contains(Y.target)&&X.current&&!X.current.contains(Y.target)&&R(!1)};return l&&setTimeout(()=>document.addEventListener("mousedown",me),0),()=>document.removeEventListener("mousedown",me)},[l])};B(G,j,F,m),B(P,oe,v,V),B(J,ne,g,U),B(c,b,S,o);const L=l=>{if(l==="table")return;const A=w.includes(l)?w.filter(X=>X!==l):[...w,l];D(A),p===l&&!A.includes(l)&&I("table")},Z=Ve.filter(l=>w.includes(l.id)),T=l=>{const A=a.columns.some(R=>R.id===l);let X;A?X=a.columns.map(R=>R.id===l?{...R,visible:!R.visible}:R):X=[...a.columns,{id:l,visible:!1}],N("columns",X)},z=l=>{if(!(l!=null&&l.current))return{top:0,right:0};const A=l.current.getBoundingClientRect();return{top:A.bottom+8,right:window.innerWidth-A.right}},re=K.trim()?d.filter(l=>l.name.toLowerCase().includes(K.toLowerCase())):d;return e.jsxs("div",{className:"dataTable-top flex items-center mb-0 justify-between gap-2",children:[e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsxs("a",{href:`/account/${C}/record/${$}/add`,className:"btn-add-expandable block rounded-full p-2 bg-white-light/40 hover:bg-white-light/90 hover:text-primary dark:bg-dark/40 dark:hover:bg-dark/60",title:"Ajouter",children:[e.jsx("svg",{className:"btn-add-icon",viewBox:"0 0 24 24",fill:"none",children:e.jsx("path",{d:"M12 5V19M5 12H19",stroke:"currentColor",strokeWidth:"2.5",strokeLinecap:"round"})}),e.jsx("span",{className:"btn-add-label",children:"Ajouter"})]}),e.jsxs("div",{className:"dataTable-search relative w-64",style:{marginLeft:0},children:[e.jsxs("svg",{className:"absolute left-4 top-1/2 ml-2 -translate-y-1/2 h-4 w-4 text-gray-400",viewBox:"0 0 24 24",fill:"none",children:[e.jsx("circle",{cx:"11",cy:"11",r:"8",stroke:"currentColor",strokeWidth:"1.5"}),e.jsx("path",{d:"M16.5 16.5L21 21",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"})]}),e.jsx("input",{type:"text",value:t,onChange:l=>i(l.target.value),placeholder:"Rechercher...",className:"dataTable-input form-input w-full pl-11 pr-10",style:{"padding-left":"33px"}}),_&&e.jsx("div",{className:"absolute right-3 top-1/2 -translate-y-1/2",children:e.jsx("div",{className:"animate-spin rounded-full h-4 w-4 border-b-2 border-primary"})})]})]}),e.jsxs("div",{className:"flex items-center gap-2",children:[Z.map(l=>e.jsx("button",{type:"button",onClick:()=>I(l.id),title:l.label,className:`block rounded-full p-2 transition-all ${p===l.id?"bg-primary/20 text-primary":"bg-white-light/40 hover:bg-white-light/90 hover:text-primary dark:bg-dark/40 dark:hover:bg-dark/60"}`,children:l.icon},l.id)),e.jsx("button",{ref:S,type:"button",onClick:()=>{o(!c),m(!1),V(!1),U(!1)},className:`block rounded-full p-2 transition-all ${c?"bg-primary/20 text-primary":"bg-white-light/40 hover:bg-white-light/90 hover:text-primary dark:bg-dark/40 dark:hover:bg-dark/60"}`,title:"Configurer les vues",children:e.jsxs("svg",{className:"h-4 w-4",viewBox:"0 0 24 24",fill:"none",children:[e.jsx("circle",{cx:"12",cy:"12",r:"3",stroke:"currentColor",strokeWidth:"1.5"}),e.jsx("path",{d:"M12 2V4M12 20V22M2 12H4M20 12H22M4.93 4.93L6.34 6.34M17.66 17.66L19.07 19.07M4.93 19.07L6.34 17.66M17.66 6.34L19.07 4.93",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"})]})}),e.jsx("div",{className:"w-px h-5 bg-gray-200 dark:bg-gray-700 mx-0.5"}),e.jsx("button",{type:"button",onClick:ee,className:`block rounded-full p-2 transition-all ${O?"bg-primary/20 text-primary":"bg-white-light/40 hover:bg-white-light/90 hover:text-primary dark:bg-dark/40 dark:hover:bg-dark/60"}`,title:"Filtrer & enregistrer la vue",children:e.jsx("svg",{className:"h-4 w-4",viewBox:"0 0 24 24",fill:"none",children:e.jsx("path",{d:"M22 3H2L10 12.46V19L14 21V12.46L22 3Z",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round"})})}),p==="table"&&(()=>{var A,X;const l=((A=a.sort)==null?void 0:A.field)!=="createdAt"||((X=a.sort)==null?void 0:X.direction)!=="desc";return e.jsx("button",{ref:v,type:"button",onClick:()=>{V(!P),m(!1),U(!1),o(!1)},className:`block rounded-full p-2 transition-all ${P||l?"bg-primary/20 text-primary":"bg-white-light/40 hover:bg-white-light/90 hover:text-primary dark:bg-dark/40 dark:hover:bg-dark/60"}`,title:"Trier",children:e.jsxs("svg",{className:"h-4 w-4",viewBox:"0 0 24 24",fill:"none",children:[e.jsx("path",{d:"M16 18L16 6M16 6L20 10M16 6L12 10",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round"}),e.jsx("path",{d:"M8 6L8 18M8 18L12 14M8 18L4 14",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round"})]})})})(),e.jsx("button",{ref:F,type:"button",onClick:()=>{m(!G),V(!1),U(!1),o(!1)},className:`block rounded-full p-2 transition-all ${G?"bg-primary/20 text-primary":"bg-white-light/40 hover:bg-white-light/90 hover:text-primary dark:bg-dark/40 dark:hover:bg-dark/60"}`,title:"Mode d'affichage",children:e.jsxs("svg",{className:"h-4 w-4",viewBox:"0 0 24 24",fill:"none",children:[e.jsx("path",{d:"M3 7H21",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"}),e.jsx("path",{d:"M6 12H18",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"}),e.jsx("path",{d:"M10 17H14",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"})]})}),p==="table"&&e.jsx("button",{ref:g,type:"button",onClick:()=>{U(!J),m(!1),V(!1),o(!1)},className:`block rounded-full p-2 transition-all ${J?"bg-primary/20 text-primary":"bg-white-light/40 hover:bg-white-light/90 hover:text-primary dark:bg-dark/40 dark:hover:bg-dark/60"}`,title:"Colonnes visibles",children:e.jsxs("svg",{className:"h-4 w-4",viewBox:"0 0 24 24",fill:"none",children:[e.jsx("path",{d:"M9 3H4C3.44772 3 3 3.44772 3 4V11C3 11.5523 3.44772 12 4 12H9C9.55228 12 10 11.5523 10 11V4C10 3.44772 9.55228 3 9 3Z",stroke:"currentColor",strokeWidth:"1.5"}),e.jsx("path",{d:"M20 3H15C14.4477 3 14 3.44772 14 4V7C14 7.55228 14.4477 8 15 8H20C20.5523 8 21 7.55228 21 7V4C21 3.44772 20.5523 3 20 3Z",stroke:"currentColor",strokeWidth:"1.5"}),e.jsx("path",{d:"M20 12H15C14.4477 12 14 12.4477 14 13V20C14 20.5523 14.4477 21 15 21H20C20.5523 21 21 20.5523 21 20V13C21 12.4477 20.5523 12 20 12Z",stroke:"currentColor",strokeWidth:"1.5"}),e.jsx("path",{d:"M9 16H4C3.44772 16 3 16.4477 3 17V20C3 20.5523 3.44772 21 4 21H9C9.55228 21 10 20.5523 10 20V17C10 16.4477 9.55228 16 9 16Z",stroke:"currentColor",strokeWidth:"1.5"})]})}),e.jsxs("button",{type:"button",onClick:k,className:"btn-sidebar-toggle block rounded-full p-2 bg-white-light/40 hover:bg-white-light/90 hover:text-primary dark:bg-dark/40 dark:hover:bg-dark/60",title:x?"Masquer le panneau":"Afficher le panneau",children:[e.jsxs("svg",{className:"btn-sidebar-icon",viewBox:"0 0 24 24",fill:"none",children:[e.jsx("rect",{x:"3",y:"3",width:"18",height:"18",rx:"2",stroke:"currentColor",strokeWidth:"1.5"}),e.jsx("path",{d:"M9 3V21",stroke:"currentColor",strokeWidth:"1.5"})]}),e.jsx("span",{className:"btn-sidebar-label",children:x?"Masquer":"Panneau"})]})]}),P&&_e.createPortal(e.jsxs(e.Fragment,{children:[e.jsx("div",{className:"fixed inset-0",style:{zIndex:9998},onClick:()=>V(!1)}),e.jsxs("div",{ref:oe,className:"fixed rounded-xl shadow-xl p-4 w-72 bg-white dark:bg-[#0e1726] border border-gray-100 dark:border-white/10",style:{zIndex:9999,top:z(v).top,right:z(v).right,animation:"popoverSlide 0.15s ease-out"},children:[e.jsx("div",{className:"text-xs font-medium text-gray-500 dark:text-white-dark mb-2",children:"Trier par"}),e.jsxs("div",{className:"flex gap-2",children:[e.jsxs("select",{value:((ie=a.sort)==null?void 0:ie.field)||"createdAt",onChange:l=>N("sort",{...a.sort,field:l.target.value}),className:"flex-1 px-2 py-1.5 text-xs border border-gray-200 dark:border-white/10 rounded-lg bg-white dark:bg-[#1b2e4b] text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary/50",children:[e.jsx("option",{value:"createdAt",children:"Date de création"}),e.jsx("option",{value:"title",children:"Titre"}),d.filter(l=>l.id!=="title"&&l.id!=="actions").map(l=>e.jsx("option",{value:l.id,children:l.name},l.id))]}),e.jsx("button",{onClick:()=>{var l;return N("sort",{...a.sort,direction:((l=a.sort)==null?void 0:l.direction)==="asc"?"desc":"asc"})},className:"p-1.5 border border-gray-200 dark:border-white/10 rounded-lg bg-white dark:bg-[#1b2e4b] hover:bg-gray-50 dark:hover:bg-[#253b5c] transition-all",title:((ce=a.sort)==null?void 0:ce.direction)==="asc"?"Croissant":"Décroissant",children:e.jsx("svg",{className:`h-4 w-4 text-gray-600 dark:text-white transition-transform ${((he=a.sort)==null?void 0:he.direction)==="asc"?"rotate-180":""}`,viewBox:"0 0 24 24",fill:"none",children:e.jsx("path",{d:"M12 5V19M12 19L6 13M12 19L18 13",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round"})})}),e.jsx("button",{onClick:()=>N("sort",{field:"createdAt",direction:"desc"}),className:"p-1.5 border border-gray-200 dark:border-white/10 rounded-lg bg-white dark:bg-[#1b2e4b] hover:bg-red-50 hover:border-red-300 hover:text-red-500 dark:hover:bg-red-900/20 transition-all",title:"Réinitialiser le tri",children:e.jsxs("svg",{className:"h-4 w-4 text-gray-600 dark:text-white",viewBox:"0 0 24 24",fill:"none",children:[e.jsx("path",{d:"M4.06189 13C4.02104 12.6724 4 12.3387 4 12C4 7.58172 7.58172 4 12 4C14.5006 4 16.7332 5.14727 18.2002 6.94416M19.9381 11C19.979 11.3276 20 11.6613 20 12C20 16.4183 16.4183 20 12 20C9.49944 20 7.26681 18.8527 5.79984 17.0558",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round"}),e.jsx("path",{d:"M15 7H19V3",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round"}),e.jsx("path",{d:"M9 17H5V21",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round"})]})})]})]})]}),document.body),G&&_e.createPortal(e.jsxs(e.Fragment,{children:[e.jsx("div",{className:"fixed inset-0",style:{zIndex:9998},onClick:()=>m(!1)}),e.jsxs("div",{ref:j,className:"fixed rounded-xl shadow-xl p-4 w-72 bg-white dark:bg-[#0e1726] border border-gray-100 dark:border-white/10",style:{zIndex:9999,top:z(F).top,right:z(F).right,animation:"popoverSlide 0.15s ease-out"},children:[e.jsxs("div",{className:"mb-4",children:[e.jsx("div",{className:"text-xs font-medium text-gray-500 dark:text-white-dark mb-2",children:"Densité"}),e.jsx("div",{className:"flex gap-1",children:["compact","normal","comfortable"].map(l=>e.jsx("button",{onClick:()=>N("density",l),className:`flex-1 px-2 py-1.5 text-xs rounded-lg transition-all ${a.density===l?"bg-primary text-white":"bg-gray-100 dark:bg-dark/40 text-gray-600 dark:text-white-dark/70 hover:bg-gray-200 dark:hover:bg-dark/60"}`,children:l==="compact"?"Compact":l==="normal"?"Normal":"Confort"},l))})]}),e.jsxs("div",{className:"mb-4",children:[e.jsx("div",{className:"text-xs font-medium text-gray-500 dark:text-white-dark mb-2",children:"Lignes par page"}),e.jsx("div",{className:"flex gap-1",children:[10,25,50,100].map(l=>e.jsx("button",{onClick:()=>N("pageSize",l),className:`flex-1 px-2 py-1.5 text-xs rounded-lg transition-all ${a.pageSize===l?"bg-primary text-white":"bg-gray-100 dark:bg-dark/40 text-gray-600 dark:text-white-dark/70 hover:bg-gray-200 dark:hover:bg-dark/60"}`,children:l},l))})]})]})]}),document.body),J&&_e.createPortal(e.jsxs(e.Fragment,{children:[e.jsx("div",{className:"fixed inset-0",style:{zIndex:9998},onClick:()=>U(!1)}),e.jsxs("div",{ref:ne,className:"fixed rounded-xl shadow-xl p-4 w-64 bg-white dark:bg-[#0e1726] border border-gray-100 dark:border-white/10",style:{zIndex:9999,top:z(g).top,right:z(g).right,animation:"popoverSlide 0.15s ease-out"},children:[e.jsx("div",{className:"text-xs font-medium text-gray-500 dark:text-white-dark mb-2",children:"Colonnes visibles"}),e.jsx("div",{className:"relative mb-2",children:e.jsx("input",{type:"text",value:K,onChange:l=>H(l.target.value),placeholder:"Filtrer...",className:"w-full px-3 py-1.5 text-xs border border-gray-200 dark:border-white/10 rounded-lg bg-white dark:bg-[#1b2e4b] text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary/50"})}),e.jsx("div",{className:"space-y-0.5 max-h-48 overflow-y-auto",children:re.map(l=>{const A=a.columns.find(R=>R.id===l.id),X=A?A.visible!==!1:!0;return e.jsxs("label",{className:"flex items-center gap-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 px-2 py-1.5 rounded-lg",children:[e.jsx("input",{type:"checkbox",checked:X,onChange:()=>T(l.id),className:"form-checkbox text-primary w-3.5 h-3.5 rounded"}),e.jsx("span",{className:"text-xs text-gray-700 dark:text-gray-300",children:l.name})]},l.id)})}),e.jsx("div",{className:"border-t border-gray-100 dark:border-white/10 mt-3 mb-2"}),e.jsxs("div",{children:[e.jsx("div",{className:"text-xs font-medium text-gray-500 dark:text-white-dark mb-2",children:"Affichage titre"}),e.jsx("div",{className:"flex gap-1",children:[{value:"avatar",label:"Avatar"},{value:"icon",label:"Icône"},{value:"none",label:"Aucun"}].map(l=>e.jsx("button",{onClick:()=>N("titleDisplay",l.value),className:`flex-1 px-2 py-1.5 text-xs rounded-lg transition-all ${(a.titleDisplay||"avatar")===l.value?"bg-primary text-white":"bg-gray-100 dark:bg-dark/40 text-gray-600 dark:text-white-dark/70 hover:bg-gray-200 dark:hover:bg-dark/60"}`,children:l.label},l.value))})]}),e.jsx("div",{className:"border-t border-gray-100 dark:border-white/10 mt-3 mb-2"}),e.jsx("div",{children:e.jsxs("div",{className:"flex items-center justify-between",children:[e.jsx("span",{className:"text-xs font-medium text-gray-500 dark:text-white-dark",children:"Sélection multiple"}),e.jsx("button",{type:"button",onClick:()=>N("showCheckboxes",a.showCheckboxes===!1),style:{position:"relative",width:36,height:20,borderRadius:10,border:"none",cursor:"pointer",transition:"background 0.2s ease",background:a.showCheckboxes!==!1?"#4361ee":"#d1d5db",padding:0},children:e.jsx("span",{style:{position:"absolute",top:2,left:a.showCheckboxes!==!1?18:2,width:16,height:16,borderRadius:"50%",background:"#fff",boxShadow:"0 1px 3px rgba(0,0,0,0.2)",transition:"left 0.2s ease"}})})]})})]})]}),document.body),c&&_e.createPortal(e.jsxs(e.Fragment,{children:[e.jsx("div",{className:"fixed inset-0",style:{zIndex:9998},onClick:()=>o(!1)}),e.jsxs("div",{ref:b,className:"fixed rounded-xl shadow-xl p-4 w-64 bg-white dark:bg-[#0e1726] border border-gray-100 dark:border-white/10",style:{zIndex:9999,top:z(S).top,right:z(S).right,animation:"popoverSlide 0.15s ease-out"},children:[e.jsx("div",{className:"text-xs font-medium text-gray-500 dark:text-white-dark mb-3",children:"Vues disponibles"}),e.jsx("div",{className:"space-y-1",children:Ve.map(l=>{const A=w.includes(l.id),X=l.id==="table";return e.jsxs("label",{className:`flex items-center gap-3 cursor-pointer px-2 py-2 rounded-lg transition-all ${X?"opacity-60 cursor-not-allowed":"hover:bg-gray-50 dark:hover:bg-gray-800"}`,children:[e.jsx("input",{type:"checkbox",checked:A,onChange:()=>L(l.id),disabled:X,className:"form-checkbox text-primary w-4 h-4 rounded"}),e.jsxs("span",{className:`flex items-center gap-2 text-sm ${A?"text-gray-700 dark:text-gray-300":"text-gray-400 dark:text-gray-600"}`,children:[l.icon,l.label]})]},l.id)})}),e.jsx("div",{className:"border-t border-gray-100 dark:border-white/10 mt-3 pt-2",children:e.jsx("p",{className:"text-[10px] text-gray-400 dark:text-gray-600",children:"Le tableau est toujours activé par défaut."})})]})]}),document.body),e.jsx("style",{children:`
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
            `})]})}function wt({records:t,columns:i,virtualizer:d,sort:a,onSort:N,onColumnReorder:_,density:C,titleDisplay:$,entityIcon:u,accountNumber:x,entitySlug:k,selectedIds:p,onToggleSelect:I,onSelectAll:w,allPageSelected:D,showCheckboxes:O=!0}){var c;const[ee,G]=r.useState(null),[m,P]=r.useState(null),V=d.getVirtualItems(),J={compact:{rowHeight:36,cellClass:"py-1",fontSize:"text-xs",imageSize:"w-6 h-6",fontWeight:"font-medium"},normal:{rowHeight:44,cellClass:"py-2",fontSize:"text-sm",imageSize:"w-9 h-9",fontWeight:"font-semibold"},comfortable:{rowHeight:56,cellClass:"py-3",fontSize:"text-sm",imageSize:"w-9 h-9",fontWeight:"font-semibold"}},U=J[C]||J.comfortable;return p&&p.size>0,e.jsxs("table",{className:"table-hover whitespace-nowrap dataTable-table w-full",children:[e.jsx("thead",{className:"sticky top-0 bg-white dark:bg-[#1b2e4b] z-10",children:e.jsxs("tr",{children:[O&&e.jsx("th",{style:{width:40,padding:"0 8px"},children:e.jsxs("label",{className:"bulk-checkbox-wrapper",style:{display:"flex",alignItems:"center",justifyContent:"center"},children:[e.jsx("input",{type:"checkbox",checked:D&&t.length>0,onChange:()=>w&&w(),className:"bulk-checkbox"}),e.jsx("span",{className:"bulk-checkbox-custom"})]})}),i.map(o=>{const K=(a==null?void 0:a.field)===o.id||o.id==="title"&&(a==null?void 0:a.field)==="title"||o.id==="createdAt"&&(a==null?void 0:a.field)==="createdAt",H=(a==null?void 0:a.direction)||"desc",F=ee===o.id,v=m===o.id&&ee!==o.id,g=o.id!=="actions";return e.jsx("th",{"data-sortable":o.sortable!==!1?"":void 0,"data-column-id":o.id,onDragEnter:S=>{S.preventDefault(),o.id!=="actions"&&ee&&ee!==o.id&&P(o.id)},onDragOver:S=>{S.preventDefault()},onDrop:S=>{S.preventDefault(),ee&&ee!==o.id&&o.id!=="actions"&&_&&_(ee,o.id),G(null),P(null)},className:`px-2 ${o.id==="actions"?"sticky right-0 z-20":""} ${F?"opacity-50":""} ${v?"border-l-2 border-l-primary bg-primary/5":""}`,style:{transition:"opacity 0.15s, border-color 0.15s, background 0.15s",...o.id==="actions"?{width:"1%",whiteSpace:"nowrap"}:{}},children:e.jsxs("div",{className:"flex items-center gap-1",children:[g&&e.jsx("span",{draggable:"true",onDragStart:S=>{G(o.id),S.dataTransfer.effectAllowed="move",S.dataTransfer.setData("text/plain",o.id)},onDragEnd:()=>{G(null),P(null)},className:"cursor-grab text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300",children:e.jsxs("svg",{className:"h-3 w-3",viewBox:"0 0 24 24",fill:"currentColor",children:[e.jsx("circle",{cx:"9",cy:"6",r:"1.5"}),e.jsx("circle",{cx:"15",cy:"6",r:"1.5"}),e.jsx("circle",{cx:"9",cy:"12",r:"1.5"}),e.jsx("circle",{cx:"15",cy:"12",r:"1.5"}),e.jsx("circle",{cx:"9",cy:"18",r:"1.5"}),e.jsx("circle",{cx:"15",cy:"18",r:"1.5"})]})}),o.sortable!==!1?e.jsxs("a",{href:"#",className:"dataTable-sorter flex items-center gap-1",draggable:"false",onClick:S=>{S.preventDefault(),N(o.id)},children:[o.name,K&&e.jsx("svg",{className:`h-3 w-3 text-primary transition-transform ${H==="asc"?"rotate-180":""}`,viewBox:"0 0 24 24",fill:"none",children:e.jsx("path",{d:"M12 5V19M12 19L6 13M12 19L18 13",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round"})})]}):o.name]})},o.id)})]})}),e.jsxs("tbody",{children:[V.length>0&&V[0].start>0&&e.jsx("tr",{children:e.jsx("td",{colSpan:i.length+1,style:{height:V[0].start,padding:0}})}),V.map(o=>{const K=t[o.index];if(!K)return null;const H={compact:"4px 8px",normal:"8px 12px",comfortable:"12px 12px"}[C]||"12px 12px",F=p&&p.has(K._id);return e.jsxs("tr",{"data-index":o.index,ref:d.measureElement,style:{minHeight:U.rowHeight},className:F?"bulk-row-selected":"",children:[O&&e.jsx("td",{style:{padding:"0 8px",width:40},children:e.jsxs("label",{className:"bulk-checkbox-wrapper",style:{display:"flex",alignItems:"center",justifyContent:"center"},onClick:v=>{v.preventDefault(),I&&I(K._id,o.index,v.shiftKey)},children:[e.jsx("input",{type:"checkbox",checked:F,readOnly:!0,className:"bulk-checkbox"}),e.jsx("span",{className:"bulk-checkbox-custom"})]})}),i.map(v=>e.jsx("td",{className:`${U.fontSize} ${v.id==="actions"?"sticky right-0 bg-white dark:bg-gray-900":""}`,style:{padding:H,...v.id==="actions"?{width:"1%",whiteSpace:"nowrap"}:{}},children:jt(K,v,x,k,U,$,u)},v.id))]},K._id)}),V.length>0&&e.jsx("tr",{children:e.jsx("td",{colSpan:i.length+1,style:{height:Math.max(0,d.getTotalSize()-(((c=V[V.length-1])==null?void 0:c.end)||0)),padding:0}})})]})]})}function jt(t,i,d,a,N,_,C){var $,u;switch(i.id){case"title":{const x=t.referenceTitle||t.title||"Sans titre";x.charAt(0).toUpperCase();const k=Math.abs(x.charCodeAt(0)||65)%35+1,p=t.image||`/assets/images/profile-${k}.jpeg`;return e.jsxs("div",{className:"flex items-center gap-2",children:[_==="avatar"&&e.jsx("img",{src:p,alt:x,className:`${N.imageSize} rounded-full max-w-none`}),_==="icon"&&C&&e.jsx("div",{className:`${N.imageSize} rounded-lg max-w-none flex items-center justify-center bg-primary/10 text-primary shrink-0`,children:e.jsx("iconify-icon",{icon:C,width:"16"})}),e.jsx("a",{href:`/account/${d}/record/${a}/${t._id}/edit`,className:`${N.fontWeight} hover:text-primary transition-colors`,children:x})]})}case"createdAt":return new Date(t.createdAt).toLocaleDateString("fr-FR");case"actions":return e.jsxs("div",{className:"flex items-center gap-0",children:[e.jsx("a",{href:`/account/${d}/record/${a}/${t._id}`,className:"p-1 rounded-lg text-gray-500 hover:text-primary hover:bg-primary/10 transition-all",title:"Voir",children:e.jsxs("svg",{className:"h-4 w-4",viewBox:"0 0 24 24",fill:"none",children:[e.jsx("path",{d:"M15 12C15 13.6569 13.6569 15 12 15C10.3431 15 9 13.6569 9 12C9 10.3431 10.3431 9 12 9C13.6569 9 15 10.3431 15 12Z",stroke:"currentColor",strokeWidth:"1.5"}),e.jsx("path",{d:"M12 5C7.5 5 3.73 7.94 2 12C3.73 16.06 7.5 19 12 19C16.5 19 20.27 16.06 22 12C20.27 7.94 16.5 5 12 5Z",stroke:"currentColor",strokeWidth:"1.5"})]})}),e.jsx("a",{href:`/account/${d}/record/${a}/${t._id}/edit`,className:"p-1 rounded-lg text-gray-500 hover:text-info hover:bg-info/10 transition-all",title:"Modifier",children:e.jsx("svg",{className:"h-4 w-4",viewBox:"0 0 24 24",fill:"none",children:e.jsx("path",{d:"M16.862 4.487L18.55 2.8C19.33 2.02 20.59 2.02 21.37 2.8C22.15 3.58 22.15 4.84 21.37 5.62L19.681 7.307M16.862 4.487L4.162 17.187C3.882 17.467 3.682 17.818 3.592 18.198L2.732 21.596C2.642 21.966 2.952 22.296 3.322 22.226L6.892 21.556C7.242 21.486 7.572 21.306 7.832 21.046L20.513 8.366M16.862 4.487L19.681 7.307",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round"})})}),e.jsx("button",{type:"button",className:"p-1 rounded-lg text-gray-500 hover:text-danger hover:bg-danger/10 transition-all",title:"Supprimer",onClick:()=>{confirm("Êtes-vous sûr de vouloir supprimer cet enregistrement ?")&&console.log("Delete record:",t._id)},children:e.jsxs("svg",{className:"h-4 w-4",viewBox:"0 0 24 24",fill:"none",children:[e.jsx("path",{d:"M20.5 6H3.5",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"}),e.jsx("path",{d:"M18.833 8.5L18.373 15.4C18.196 18.054 18.108 19.381 17.243 20.19C16.378 21 15.048 21 12.387 21H11.613C8.952 21 7.622 21 6.757 20.19C5.892 19.381 5.804 18.054 5.627 15.4L5.167 8.5",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"}),e.jsx("path",{d:"M9.5 11L10 16",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"}),e.jsx("path",{d:"M14.5 11L14 16",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"}),e.jsx("path",{d:"M6.5 6C6.556 5.367 6.612 5.1 6.877 4.714C7.178 4.275 7.945 3.917 9.484 3.2L9.924 2.984C10.683 2.589 11.06 2.392 11.476 2.318C11.823 2.254 12.177 2.254 12.524 2.318C12.94 2.392 13.317 2.589 14.076 2.984L14.516 3.2C16.055 3.917 16.822 4.275 17.123 4.714C17.388 5.1 17.444 5.367 17.5 6",stroke:"currentColor",strokeWidth:"1.5"})]})})]});default:{if(i.id.startsWith("rel:")){const x=i.id.substring(4),p=((($=t._denorm)==null?void 0:$.relations)||[]).find(w=>w.relationKey===x);if(((u=p==null?void 0:p.records)==null?void 0:u.length)>0)return e.jsx("div",{className:"flex flex-wrap gap-1",children:p.records.map((w,D)=>e.jsx("a",{href:`/account/${d}/record/${w.entitySlug||a}/${w._id}`,className:"text-primary hover:underline text-xs",children:w.title||"Sans titre"},D))});const I=(t.relations||[]).find(w=>w.relationKey===x);return I!=null&&I.value?"—":""}if(i.id.startsWith("classif:")){const x=i.id.substring(8),k=(t.classificationValues||[]).find(p=>{var w,D,O;return(((w=p.classificationId)==null?void 0:w.$oid)||((O=(D=p.classificationId)==null?void 0:D.toString)==null?void 0:O.call(D))||p.classificationId)===x});if(k!=null&&k.label){const p=k.color||"#888";return e.jsx("span",{className:"inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap",style:{backgroundColor:`${p}15`,color:p,border:`1px solid ${p}30`},children:k.label})}return k!=null&&k.value?e.jsx("span",{className:"inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20",children:k.value}):""}if(t.customFields){const x=t.customFields.find(p=>{var w;const I=((w=p.field_id)==null?void 0:w._id)||p.field_id;return(I==null?void 0:I.toString())===i.id});if(!x)return"";const k=x.value;if(k&&typeof k=="object"&&k._v){const p=[];return Object.entries(k).forEach(([I,w])=>{I==="_v"||I==="customText"||(Array.isArray(w)?w.forEach(D=>p.push(D)):w&&p.push(w))}),k.customText&&p.push(k.customText),e.jsx("div",{className:"flex flex-wrap gap-1",children:p.map((I,w)=>e.jsx("span",{className:"inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20",children:I},w))})}return k||""}return""}}}function ze(t,i=.1){if(!t)return`rgba(99, 102, 241, ${i})`;const d=parseInt(t.slice(1,3),16),a=parseInt(t.slice(3,5),16),N=parseInt(t.slice(5,7),16);return`rgba(${d}, ${a}, ${N}, ${i})`}function Ct({field:t,record:i}){const d=(i.customFields||[]).find(N=>{var C;const _=((C=N.field_id)==null?void 0:C._id)||N.field_id;return(_==null?void 0:_.toString())===t.id});if(!d)return e.jsx("span",{className:"text-gray-400 dark:text-gray-600 text-sm italic",children:"—"});const a=d.value;if(a==null||a==="")return e.jsx("span",{className:"text-gray-400 dark:text-gray-600 text-sm italic",children:"—"});if(t.type==="date"||t.type==="datetime")try{return e.jsx("span",{className:"text-sm text-gray-700 dark:text-gray-300",children:new Date(a).toLocaleDateString("fr-FR")})}catch{return e.jsx("span",{className:"text-sm text-gray-700 dark:text-gray-300",children:String(a)})}return t.type==="boolean"||t.type==="checkbox"?e.jsxs("span",{className:`inline-flex items-center gap-1 text-sm ${a?"text-success":"text-gray-400"}`,children:[a?e.jsxs("svg",{width:"16",height:"16",viewBox:"0 0 24 24",fill:"none",children:[e.jsx("path",{d:"M9 12l2 2 4-4",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round"}),e.jsx("circle",{cx:"12",cy:"12",r:"10",stroke:"currentColor",strokeWidth:"1.5"})]}):e.jsx("svg",{width:"16",height:"16",viewBox:"0 0 24 24",fill:"none",children:e.jsx("circle",{cx:"12",cy:"12",r:"10",stroke:"currentColor",strokeWidth:"1.5"})}),a?"Oui":"Non"]}):t.type==="relation"?Array.isArray(a)?e.jsx("div",{className:"flex flex-wrap gap-1",children:a.map((N,_)=>e.jsx("span",{className:"inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-primary/10 text-primary font-medium",children:N.title||N.label||N.name||String(N)},_))}):e.jsx("span",{className:"text-sm text-gray-700 dark:text-gray-300",children:a.title||a.label||String(a)}):t.type==="number"?e.jsx("span",{className:"text-sm font-mono text-gray-700 dark:text-gray-300",children:Number(a).toLocaleString("fr-FR")}):e.jsx("span",{className:"text-sm text-gray-700 dark:text-gray-300",children:String(a)})}function Nt({record:t,columns:i,accountNumber:d,entitySlug:a,onClose:N}){var G;const _=r.useRef(null),[C,$]=r.useState(!1);r.useEffect(()=>{requestAnimationFrame(()=>$(!0))},[]);const u=r.useCallback(()=>{$(!1),setTimeout(()=>N(),250)},[N]);if(r.useEffect(()=>{const m=P=>{P.key==="Escape"&&u()};return document.addEventListener("keydown",m),()=>document.removeEventListener("keydown",m)},[u]),!t)return null;const x=((G=t._id)==null?void 0:G.$oid)||t._id,k=t.referenceTitle||t.title||t.computedTitle||"Sans titre",p=t.description||"",I=t.createdAt?new Date(t.createdAt).toLocaleDateString("fr-FR",{day:"2-digit",month:"long",year:"numeric"}):null,w=t.updatedAt?new Date(t.updatedAt).toLocaleDateString("fr-FR",{day:"2-digit",month:"long",year:"numeric"}):null,D=(t.classificationValues||[]).filter(m=>m.optionLabel||m.label).map(m=>({label:m.optionLabel||m.label,color:m.optionColor||m.color||"#6366f1",classificationName:m.classificationName||"Classification"})),O={};D.forEach(m=>{O[m.classificationName]||(O[m.classificationName]=[]),O[m.classificationName].push(m)});const ee=i.filter(m=>m.id!=="title"&&m.id!=="actions"&&!m.id.startsWith("class:"));return _e.createPortal(e.jsxs(e.Fragment,{children:[e.jsx("div",{className:`fixed inset-0 bg-black/40 backdrop-blur-[2px] transition-opacity duration-250 ${C?"opacity-100":"opacity-0"}`,style:{zIndex:1e4},onMouseDown:u,onTouchEnd:m=>{m.preventDefault(),u()}}),e.jsxs("div",{ref:_,className:`fixed right-0 top-0 h-full bg-white dark:bg-[#0e1726] shadow-2xl border-l border-gray-200 dark:border-gray-700 flex flex-col transition-transform duration-250 ease-out ${C?"translate-x-0":"translate-x-full"}`,style:{zIndex:10001,width:"min(520px, 90vw)"},onClick:m=>m.stopPropagation(),children:[e.jsxs("div",{className:"flex items-center justify-between gap-3 px-6 py-4 border-b border-gray-100 dark:border-gray-700/50 flex-shrink-0",children:[e.jsxs("div",{className:"flex items-center gap-2 min-w-0",children:[e.jsx("div",{className:"w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0",children:e.jsxs("svg",{width:"16",height:"16",viewBox:"0 0 24 24",fill:"none",children:[e.jsx("path",{d:"M2 12C2 7.28595 2 4.92893 3.46447 3.46447C4.92893 2 7.28595 2 12 2C16.714 2 19.0711 2 20.5355 3.46447C22 4.92893 22 7.28595 22 12C22 16.714 22 19.0711 20.5355 20.5355C19.0711 22 16.714 22 12 22C7.28595 22 4.92893 22 3.46447 20.5355C2 19.0711 2 16.714 2 12Z",stroke:"#4361ee",strokeWidth:"1.5"}),e.jsx("path",{d:"M8 12H16M12 8V16",stroke:"#4361ee",strokeWidth:"1.5",strokeLinecap:"round"})]})}),e.jsx("h3",{className:"text-base font-semibold text-gray-900 dark:text-white truncate",children:k})]}),e.jsxs("div",{className:"flex items-center gap-1 flex-shrink-0",children:[e.jsx("a",{href:`/account/${d}/record/${a}/${x}`,className:"p-2 rounded-lg text-gray-400 hover:text-primary hover:bg-primary/10 transition-all",title:"Ouvrir la page complète",children:e.jsxs("svg",{width:"16",height:"16",viewBox:"0 0 24 24",fill:"none",children:[e.jsx("path",{d:"M10 4H6C4.89543 4 4 4.89543 4 6V18C4 19.1046 4.89543 20 6 20H18C19.1046 20 20 19.1046 20 18V14",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"}),e.jsx("path",{d:"M14 4H20V10",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round"}),e.jsx("path",{d:"M20 4L11 13",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"})]})}),e.jsx("a",{href:`/account/${d}/record/${a}/${x}/edit`,className:"p-2 rounded-lg text-gray-400 hover:text-info hover:bg-info/10 transition-all",title:"Modifier",children:e.jsx("svg",{width:"16",height:"16",viewBox:"0 0 24 24",fill:"none",children:e.jsx("path",{d:"M16.862 4.487L18.55 2.8C19.33 2.02 20.59 2.02 21.37 2.8C22.15 3.58 22.15 4.84 21.37 5.62L19.681 7.307M16.862 4.487L4.162 17.187C3.882 17.467 3.682 17.818 3.592 18.198L2.732 21.596C2.642 21.966 2.952 22.296 3.322 22.226L6.892 21.556C7.242 21.486 7.572 21.306 7.832 21.046L20.513 8.366",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"})})}),e.jsx("button",{onClick:u,className:"p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all",title:"Fermer",children:e.jsx("svg",{width:"16",height:"16",viewBox:"0 0 24 24",fill:"none",children:e.jsx("path",{d:"M18 6L6 18M6 6L18 18",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round"})})})]})]}),e.jsxs("div",{className:"flex-1 overflow-y-auto",children:[Object.keys(O).length>0&&e.jsx("div",{className:"px-6 py-4 border-b border-gray-100 dark:border-gray-700/50",children:Object.entries(O).map(([m,P])=>e.jsxs("div",{className:"mb-3 last:mb-0",children:[e.jsx("div",{className:"text-[11px] uppercase tracking-wider font-semibold text-gray-400 dark:text-gray-500 mb-1.5",children:m}),e.jsx("div",{className:"flex flex-wrap gap-1.5",children:P.map((V,J)=>e.jsxs("span",{className:"inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium transition-all hover:scale-105",style:{backgroundColor:ze(V.color,.15),color:V.color,border:`1px solid ${ze(V.color,.3)}`},children:[e.jsx("span",{className:"w-2 h-2 rounded-full flex-shrink-0",style:{backgroundColor:V.color}}),V.label]},J))})]},m))}),p&&e.jsxs("div",{className:"px-6 py-4 border-b border-gray-100 dark:border-gray-700/50",children:[e.jsx("div",{className:"text-[11px] uppercase tracking-wider font-semibold text-gray-400 dark:text-gray-500 mb-2",children:"Description"}),e.jsx("p",{className:"text-sm text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-wrap",children:p})]}),e.jsxs("div",{className:"px-6 py-4",children:[e.jsx("div",{className:"text-[11px] uppercase tracking-wider font-semibold text-gray-400 dark:text-gray-500 mb-3",children:"Détails"}),e.jsxs("div",{className:"space-y-0",children:[ee.map(m=>e.jsxs("div",{className:"flex items-start gap-3 py-2.5 border-b border-gray-50 dark:border-gray-800/50 last:border-0",children:[e.jsx("div",{className:"w-32 flex-shrink-0 text-xs font-medium text-gray-500 dark:text-gray-400 pt-0.5 truncate",children:m.name}),e.jsx("div",{className:"flex-1 min-w-0",children:e.jsx(Ct,{field:m,record:t})})]},m.id)),(t.relations||[]).map((m,P)=>{var V;return e.jsxs("div",{className:"flex items-start gap-3 py-2.5 border-b border-gray-50 dark:border-gray-800/50 last:border-0",children:[e.jsx("div",{className:"w-32 flex-shrink-0 text-xs font-medium text-gray-500 dark:text-gray-400 pt-0.5 truncate",children:m.label||m.key||"Relation"}),e.jsx("div",{className:"flex-1 min-w-0",children:((V=m.records)==null?void 0:V.length)>0?e.jsx("div",{className:"flex flex-wrap gap-1",children:m.records.map((J,U)=>e.jsx("a",{href:`/account/${d}/record/${m.entitySlug||a}/${J._id}`,className:"inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-primary/10 text-primary font-medium hover:bg-primary/20 transition-colors",children:J.referenceTitle||J.title||"Sans titre"},U))}):e.jsx("span",{className:"text-gray-400 dark:text-gray-600 text-sm italic",children:"—"})})]},`rel-${P}`)})]})]})]}),e.jsx("div",{className:"flex-shrink-0 px-6 py-3 border-t border-gray-100 dark:border-gray-700/50 bg-gray-50/50 dark:bg-[#0a0f1e]/50",children:e.jsxs("div",{className:"flex items-center justify-between text-[11px] text-gray-400 dark:text-gray-500",children:[e.jsxs("div",{className:"flex items-center gap-3",children:[I&&e.jsxs("span",{className:"flex items-center gap-1",children:[e.jsxs("svg",{width:"12",height:"12",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"1.5",children:[e.jsx("circle",{cx:"12",cy:"12",r:"10"}),e.jsx("path",{d:"M12 6V12L16 14",strokeLinecap:"round"})]}),"Créé le ",I]}),w&&e.jsxs("span",{className:"flex items-center gap-1",children:[e.jsx("svg",{width:"12",height:"12",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"1.5",children:e.jsx("path",{d:"M4.06 13C4.02 12.67 4 12.34 4 12C4 7.58 7.58 4 12 4C14.5 4 16.73 5.15 18.2 6.94M19.94 11C19.98 11.33 20 11.66 20 12C20 16.42 16.42 20 12 20C9.5 20 7.27 18.85 5.8 17.06",strokeLinecap:"round",strokeLinejoin:"round"})}),"Modifié le ",w]})]}),e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx("a",{href:`/account/${d}/record/${a}/${x}`,className:"px-3 py-1.5 bg-primary/10 text-primary text-xs font-medium rounded-lg hover:bg-primary/20 transition-colors",children:"Voir"}),e.jsx("a",{href:`/account/${d}/record/${a}/${x}/edit`,className:"px-3 py-1.5 bg-primary text-white text-xs font-medium rounded-lg hover:bg-primary/90 transition-colors",children:"Modifier"})]})]})})]})]}),document.body)}function $e(t,i=.1){const d=/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(t);return d?`rgba(${parseInt(d[1],16)}, ${parseInt(d[2],16)}, ${parseInt(d[3],16)}, ${i})`:`rgba(128,128,128,${i})`}function Ke({record:t,accountNumber:i,entitySlug:d,isDragging:a=!1,onQuickView:N}){var K,H,F;const _=r.useRef(null),C=r.useRef(!1),$=String(((K=t._id)==null?void 0:K.$oid)||t._id),{attributes:u,listeners:x,setNodeRef:k,transform:p,transition:I,isDragging:w}=vt({id:$}),D={transform:kt.Transform.toString(p),transition:I,opacity:a||w?.7:1,touchAction:"manipulation"},O=((H=t._id)==null?void 0:H.$oid)||t._id,ee=t.referenceTitle||t.title||t.computedTitle||"Sans titre",G=t.description||"",m=t.dueDate?new Date(t.dueDate).toLocaleDateString("fr-FR",{day:"2-digit",month:"2-digit",year:"2-digit"}):null,P=t.createdAt?new Date(t.createdAt).toLocaleDateString("fr-FR"):null,V=(t.classificationValues||[]).filter(v=>v.optionLabel||v.label).map(v=>({label:v.optionLabel||v.label,color:v.optionColor||v.color||"#6366f1"})),J=t.tags||[],U=v=>{_.current={x:v.clientX,y:v.clientY,time:Date.now()},C.current=!1},c=v=>{if(_.current){const g=Math.abs(v.clientX-_.current.x),S=Math.abs(v.clientY-_.current.y);(g>5||S>5)&&(C.current=!0)}},o=v=>{if(!_.current)return;const g=Date.now()-_.current.time;!C.current&&g<400&&N&&!v.target.closest("a, button")&&setTimeout(()=>N(t),50),_.current=null};return e.jsxs("div",{ref:k,style:D,className:`kanban-card cursor-pointer rounded-lg transition-all group bg-white hover:shadow-md border border-gray-200/80 dark:border-0 dark:bg-dark/40 dark:hover:bg-dark/60 ${a||w?"shadow-lg ring-2 ring-primary/30 cursor-move":"shadow-sm"}`,"data-dnd":"card",onPointerDown:U,onPointerMove:c,onPointerUp:o,...u,...x,children:[e.jsxs("div",{className:"p-3",children:[e.jsx("div",{className:"text-sm font-semibold text-gray-800 dark:text-white-dark leading-5 line-clamp-2 mb-2",children:ee}),G&&e.jsx("p",{className:"text-xs text-gray-500 dark:text-white-dark/70 line-clamp-2 mb-2",children:G}),e.jsx("div",{className:"flex flex-wrap items-center gap-1 mb-2",children:V.length>0?V.slice(0,3).map((v,g)=>e.jsxs("span",{className:"inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded font-medium",style:{backgroundColor:$e(v.color,.15),color:v.color},children:[e.jsx("span",{className:"w-1.5 h-1.5 rounded-full flex-shrink-0",style:{backgroundColor:v.color}}),v.label]},g)):J.length>0?J.slice(0,2).map((v,g)=>e.jsx("span",{className:"inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary",children:v},g)):e.jsxs("span",{className:"text-[10px] text-gray-400 dark:text-white-dark/50 italic flex items-center gap-1",children:[e.jsx("svg",{width:"10",height:"10",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"1.5",children:e.jsx("path",{d:"M4.172 3.172C3 4.343 3 6.229 3 10v4c0 3.771 0 5.657 1.172 6.828C5.343 22 7.229 22 11 22h2c3.771 0 5.657 0 6.828-1.172C21 19.657 21 17.771 21 14v-1.22c0-1.835 0-2.752-.379-3.55-.378-.798-1.07-1.39-2.455-2.576l-1.5-1.282c-1.97-1.687-2.955-2.531-4.136-2.605-.17-.01-.343-.01-.56 0-1.18.074-2.166.918-4.136 2.605L6.334 6.654"})}),"Sans tag"]})}),e.jsxs("div",{className:"flex items-center gap-3 text-xs text-gray-400 dark:text-white-dark/50",children:[((F=t.attachments)==null?void 0:F.length)>0&&e.jsxs("span",{className:"flex items-center gap-1",children:[e.jsx("svg",{width:"12",height:"12",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",children:e.jsx("path",{d:"M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"})}),t.attachments.length]}),e.jsxs("span",{className:"flex items-center gap-1",children:[e.jsx("svg",{width:"12",height:"12",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",children:e.jsx("path",{d:"M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"})}),"0"]})]})]}),e.jsxs("div",{className:"px-3 py-2 border-t border-gray-100 dark:border-0 flex items-center justify-between",children:[e.jsxs("div",{className:"flex items-center gap-1 text-[11px] text-gray-400 dark:text-white-dark/50",children:[e.jsxs("svg",{width:"12",height:"12",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"1.5",children:[e.jsx("rect",{x:"3",y:"4",width:"18",height:"18",rx:"2"}),e.jsx("path",{d:"M3 10H21"}),e.jsx("path",{d:"M8 2V6"}),e.jsx("path",{d:"M16 2V6"})]}),e.jsx("span",{children:m||P||"—"})]}),e.jsxs("div",{className:"flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity",style:{pointerEvents:"auto"},children:[e.jsx("a",{href:`/account/${i}/record/${d}/${O}/edit`,className:"p-1 hover:text-info rounded hover:bg-gray-100 dark:hover:bg-gray-700",onClick:v=>v.stopPropagation(),onPointerDown:v=>v.stopPropagation(),children:e.jsx("svg",{width:"14",height:"14",viewBox:"0 0 24 24",fill:"none",children:e.jsx("path",{d:"M16.862 4.487L18.55 2.8C19.33 2.02 20.59 2.02 21.37 2.8C22.15 3.58 22.15 4.84 21.37 5.62L19.681 7.307M16.862 4.487L4.162 17.187C3.882 17.467 3.682 17.818 3.592 18.198L2.732 21.596C2.642 21.966 2.952 22.296 3.322 22.226L6.892 21.556C7.242 21.486 7.572 21.306 7.832 21.046L20.513 8.366M16.862 4.487L19.681 7.307",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"})})}),e.jsx("a",{href:`/account/${i}/record/${d}/${O}`,className:"p-1 hover:text-primary rounded hover:bg-gray-100 dark:hover:bg-gray-700",onClick:v=>v.stopPropagation(),onPointerDown:v=>v.stopPropagation(),children:e.jsxs("svg",{width:"14",height:"14",viewBox:"0 0 24 24",fill:"none",children:[e.jsx("path",{opacity:"0.5",d:"M3.27489 15.2957C2.42496 14.1915 2 13.6394 2 12C2 10.3606 2.42496 9.80853 3.27489 8.70433C4.97196 6.49956 7.81811 4 12 4C16.1819 4 19.028 6.49956 20.7251 8.70433C21.575 9.80853 22 10.3606 22 12C22 13.6394 21.575 14.1915 20.7251 15.2957C19.028 17.5004 16.1819 20 12 20C7.81811 20 4.97196 17.5004 3.27489 15.2957Z",stroke:"currentColor",strokeWidth:"1.5"}),e.jsx("path",{d:"M15 12C15 13.6569 13.6569 15 12 15C10.3431 15 9 13.6569 9 12C9 10.3431 10.3431 9 12 9C13.6569 9 15 10.3431 15 12Z",stroke:"currentColor",strokeWidth:"1.5"})]})})]})]})]})}function St({column:t,records:i,recordIds:d,accountNumber:a,entitySlug:N,onQuickView:_}){const{setNodeRef:C,isOver:$}=mt({id:String(t.id)}),u=typeof document<"u"&&document.documentElement.classList.contains("dark"),x=$e(t.color,u?.12:.06),k=$e(t.color,u?.3:.15);return e.jsxs("div",{ref:C,className:`flex-none rounded-lg overflow-hidden transition-all ${$?"ring-2 ring-primary/50 ring-offset-2":""}`,style:{width:"300px",maxWidth:"320px",backgroundColor:$?$e(t.color,.15):x,border:`1px solid ${k}`},"data-dnd":"column",children:[e.jsx("div",{style:{height:"4px",backgroundColor:t.color}}),e.jsx("div",{className:"px-3 py-2 flex justify-between items-center",children:e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx("span",{className:"inline-flex items-center gap-1.5 px-2 py-0 rounded text-xs font-semibold uppercase tracking-wide",style:{backgroundColor:t.color,color:"#fff"},children:t.title}),e.jsx("span",{className:"text-xs text-gray-500 font-medium",children:i.length})]})}),e.jsx("div",{className:"px-2 pb-3",children:e.jsx(gt,{items:d,strategy:bt,children:e.jsx("div",{className:`space-y-2 min-h-[80px] rounded-lg transition-all ${$?"bg-primary/5 p-2":""}`,children:i.length===0?e.jsx("div",{className:"text-xs text-gray-300 dark:text-gray-600 text-center py-8 italic",children:"Aucun enregistrement"}):i.map(p=>{var I;return e.jsx(Ke,{record:p,accountNumber:a,entitySlug:N,onQuickView:_},((I=p._id)==null?void 0:I.$oid)||p._id)})})})}),e.jsx("div",{className:"px-3 pb-3",children:e.jsxs("button",{type:"button",className:"flex items-center gap-1 text-xs text-gray-400 hover:text-primary transition-colors",children:[e.jsx("svg",{width:"14",height:"14",viewBox:"0 0 24 24",fill:"none",children:e.jsx("path",{d:"M12 6V18M6 12H18",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round"})}),"Ajouter"]})})]})}function Lt({records:t,columns:i,accountNumber:d,entitySlug:a,viewId:N,entityData:_}){const C=r.useRef(null),$=r.useRef(null),[u,x]=r.useState(t),[k,p]=r.useState({}),[I,w]=r.useState(null),[D,O]=r.useState(null),ee=r.useCallback(b=>{O(b)},[]);r.useEffect(()=>{x(t)},[t]);const G=r.useRef(!1),m=r.useRef(0),P=r.useRef(0),V=r.useCallback(b=>{if(I||b.button!==0||b.target.closest('a, button, .dropdown, [data-dnd="card"]'))return;const E=C.current;E&&(G.current=!0,m.current=b.pageX-E.offsetLeft,P.current=E.scrollLeft,E.style.cursor="grabbing")},[I]),J=r.useCallback(b=>{if(I){G.current=!1;return}if(!G.current)return;b.preventDefault();const E=C.current;if(!E)return;const L=(b.pageX-E.offsetLeft-m.current)*1.5;E.scrollLeft=P.current-L},[I]),U=r.useCallback(()=>{G.current=!1,C.current&&(C.current.style.cursor="grab")},[]),c=nt(Ee(ht,{activationConstraint:{distance:8}}),Ee(ft,{activationConstraint:{delay:500,tolerance:10}}),Ee(xt,{coordinateGetter:ut})),o=r.useMemo(()=>{if(_){const L=_.statusClassification;if(L&&L.options&&L.options.length>0){const T=L.options.map(z=>({id:String(z._id),title:z.label,color:z.color||"#6366f1",optionId:String(z._id)}));return T.push({id:"__none__",title:"Sans Statut",color:"#9ca3af",optionId:"none"}),{classId:String(L._id),columns:T}}const Z=_.classifications||[];for(const T of Z)if(T.options&&T.options.length>0){const z=T.options.map(re=>({id:String(re._id),title:re.label,color:re.color||"#6366f1",optionId:String(re._id)}));return z.push({id:"__none__",title:"Non classé",color:"#9ca3af",optionId:"none"}),{classId:String(T._id),columns:z}}}const b={};u.forEach(L=>{(L.classificationValues||[]).forEach(Z=>{var ce,he;const T=((ce=Z.classificationId)==null?void 0:ce.$oid)||Z.classificationId||Z.classification_id;if(!T)return;b[T]||(b[T]={count:0,options:{}}),b[T].count++;const z=Z.optionLabel||Z.label||"Sans label",re=Z.optionColor||Z.color||"#9ca3af",ie=((he=Z.optionId)==null?void 0:he.$oid)||Z.optionId||z;b[T].options[z]||(b[T].options[z]={label:z,color:re,optionId:String(ie),count:0}),b[T].options[z].count++})});let E=null,B=0;if(Object.entries(b).forEach(([L,Z])=>{Z.count>B&&(B=Z.count,E=L)}),E&&b[E]){const Z=Object.values(b[E].options).map(T=>({id:T.label,title:T.label,color:T.color,optionId:T.optionId}));return Z.push({id:"__none__",title:"Sans classification",color:"#9ca3af",optionId:"none"}),{classId:E,columns:Z}}return{classId:null,columns:[{id:"__all__",title:"Tous les enregistrements",color:"#4361ee",optionId:null}]}},[u,_]),K=r.useMemo(()=>{const b={};if(o.columns.forEach(E=>b[E.id]=[]),!o.classId)b.__all__=u;else{const E={};o.columns.forEach(L=>{L.optionId&&L.optionId!=="none"&&(E[String(L.optionId)]=L.id)});const B={};o.columns.forEach(L=>{B[L.title]=L.id}),u.forEach(L=>{var z;const T=(L.classificationValues||[]).find(re=>{var ce;return(((ce=re.classificationId)==null?void 0:ce.$oid)||re.classificationId||re.classification_id)===o.classId});if(T){const re=String(((z=T.optionId)==null?void 0:z.$oid)||T.optionId||""),ie=E[re];if(ie&&b[ie])b[ie].push(L);else{const ce=T.optionLabel||T.label||"Sans label";b[ce]?b[ce].push(L):b.__none__&&b.__none__.push(L)}}else b.__none__&&b.__none__.push(L)})}for(const E of Object.keys(b)){const B=k[E]||[];B.length&&b[E].sort((L,Z)=>{var re,ie;const T=B.indexOf(String(((re=L._id)==null?void 0:re.$oid)||L._id)),z=B.indexOf(String(((ie=Z._id)==null?void 0:ie.$oid)||Z._id));return T===-1&&z===-1?0:T===-1?1:z===-1?-1:T-z})}return b},[o,u,k]),H=r.useMemo(()=>{const b={};for(const E of o.columns)b[E.id]=(K[E.id]||[]).map(B=>{var L;return String(((L=B._id)==null?void 0:L.$oid)||B._id)});return b},[o.columns,K]),F=r.useCallback(b=>{var B;const E=String(b);for(const L of Object.keys(H))if((B=H[L])!=null&&B.includes(E))return L;return null},[H]),v=r.useMemo(()=>I&&u.find(b=>{var E;return String(((E=b._id)==null?void 0:E.$oid)||b._id)===String(I)})||null,[I,u]),g=r.useCallback(b=>{N&&($.current&&clearTimeout($.current),$.current=setTimeout(async()=>{try{await fetch(`/account/${d}/api/user/view-preferences`,{method:"POST",headers:{"Content-Type":"application/json"},credentials:"include",body:JSON.stringify({viewId:N,preferences:{kanban:{orderByColumn:b}}})})}catch{}},250))},[d,N]),S=r.useCallback(async(b,E)=>{if(!o.classId)return;const B=o.columns.find(L=>L.id===E);if(B)try{await fetch(`/account/${d}/api/record/update-classification`,{method:"POST",headers:{"Content-Type":"application/json"},credentials:"include",body:JSON.stringify({recordId:b,classificationId:o.classId,optionId:B.optionId==="none"?null:B.optionId})})}catch(L){console.error("[RecordsKanban] Update error:",L)}},[d,o]),j=b=>{w(String(b.active.id))},oe=()=>{w(null)},ne=b=>{const{active:E,over:B}=b;if(w(null),!B)return;const L=String(E.id),Z=String(B.id),T=F(L),z=o.columns.some(A=>String(A.id)===Z)?Z:F(Z);if(!T||!z)return;if(T===z){const A=H[T]||[],X=A.indexOf(L),R=A.indexOf(Z);if(X===-1||R===-1||X===R)return;const me=pt(A,X,R),Y={...k,[T]:me};p(Y),g(Y);return}const re=[...H[T]||[]].filter(A=>A!==L),ie=[...H[z]||[]],he=o.columns.some(A=>String(A.id)===Z)?ie.length:Math.max(0,ie.indexOf(Z));ie.splice(he,0,L);const l={...k,[T]:re,[z]:ie};if(p(l),g(l),o.classId){const A=o.columns.find(X=>X.id===z);x(X=>X.map(R=>{var Y;if(String(((Y=R._id)==null?void 0:Y.$oid)||R._id)!==L)return R;const me=(R.classificationValues||[]).filter(pe=>{var n;return(((n=pe.classificationId)==null?void 0:n.$oid)||pe.classificationId||pe.classification_id)!==o.classId});return z!=="__none__"&&A&&me.push({classificationId:o.classId,optionId:A.optionId,optionLabel:A.title,optionColor:A.color}),{...R,classificationValues:me}})),S(L,z)}};return e.jsxs("div",{ref:C,className:"h-full overflow-x-auto overflow-y-auto",style:{cursor:"grab",userSelect:"none",WebkitUserSelect:"none"},onMouseDown:V,onMouseMove:J,onMouseUp:U,onMouseLeave:U,children:[e.jsxs(lt,{sensors:c,collisionDetection:dt,autoScroll:{threshold:{x:.15,y:.15},interval:10,acceleration:5},onDragStart:j,onDragEnd:ne,onDragCancel:oe,children:[e.jsx("div",{style:{display:"flex",flexWrap:"nowrap",alignItems:"flex-start",gap:"1.25rem",padding:"0.5rem",width:"max-content",minHeight:"100%"},children:o.columns.map(b=>{const E=K[b.id]||[];return b.id==="__none__"&&E.length===0?null:e.jsx(St,{column:b,records:E,recordIds:H[b.id]||[],accountNumber:d,entitySlug:a,onQuickView:ee},b.id)})}),e.jsx(ct,{children:v?e.jsx(Ke,{record:v,accountNumber:d,entitySlug:a,isDragging:!0}):null})]}),D&&e.jsx(Nt,{record:D,columns:i,accountNumber:d,entitySlug:a,onClose:()=>O(null)})]})}const Be=[{bg:"bg-primary-light shadow-primary",text:"text-primary",dot:"#4361ee"},{bg:"bg-info-light shadow-info",text:"text-info",dot:"#2196f3"},{bg:"bg-warning-light shadow-warning",text:"text-warning",dot:"#e2a03f"},{bg:"bg-danger-light shadow-danger",text:"text-danger",dot:"#e7515a"},{bg:"bg-success-light shadow-success",text:"text-success",dot:"#00ab55"},{bg:"bg-secondary-light shadow-secondary",text:"text-secondary",dot:"#805dca"}];function Mt(t){return Be[t%Be.length]}function _t(){return e.jsxs("svg",{width:"24",height:"24",viewBox:"0 0 24 24",fill:"none",className:"h-5 w-5 rotate-90 opacity-70 hover:opacity-100",children:[e.jsx("circle",{cx:"5",cy:"12",r:"2",stroke:"currentColor",strokeWidth:"1.5"}),e.jsx("circle",{opacity:"0.5",cx:"12",cy:"12",r:"2",stroke:"currentColor",strokeWidth:"1.5"}),e.jsx("circle",{cx:"19",cy:"12",r:"2",stroke:"currentColor",strokeWidth:"1.5"})]})}function $t(){return e.jsxs("svg",{width:"24",height:"24",viewBox:"0 0 24 24",fill:"none",className:"h-4 w-4 ltr:mr-3 rtl:ml-3",children:[e.jsx("path",{d:"M15.2869 3.15178L14.3601 4.07866L5.83882 12.5999C5.26166 13.1771 4.97308 13.4656 4.7249 13.7838C4.43213 14.1592 4.18114 14.5653 3.97634 14.995C3.80273 15.3593 3.67368 15.7465 3.41556 16.5208L2.32181 19.8021L2.05445 20.6042C1.92743 20.9852 2.0266 21.4053 2.31063 21.6894C2.59466 21.9734 3.01478 22.0726 3.39584 21.9456L4.19792 21.6782L7.47918 20.5844C8.25353 20.3263 8.6407 20.1973 9.00498 20.0237C9.43469 19.8189 9.84082 19.5679 10.2162 19.2751C10.5344 19.0269 10.8229 18.7383 11.4001 18.1612L19.9213 9.63993L20.8482 8.71306C22.3839 7.17735 22.3839 4.68748 20.8482 3.15178C19.3125 1.61607 16.8226 1.61607 15.2869 3.15178Z",stroke:"currentColor",strokeWidth:"1.5"}),e.jsx("path",{opacity:"0.5",d:"M14.36 4.07812C14.36 4.07812 14.4759 6.04774 16.2138 7.78564C17.9517 9.52354 19.9213 9.6394 19.9213 9.6394M4.19789 21.6777L2.32178 19.8015",stroke:"currentColor",strokeWidth:"1.5"})]})}function Wt(){return e.jsxs("svg",{width:"24",height:"24",viewBox:"0 0 24 24",fill:"none",className:"h-4.5 w-4.5 ltr:mr-3 rtl:ml-3",children:[e.jsx("path",{opacity:"0.5",d:"M3.27489 15.2957C2.42496 14.1915 2 13.6394 2 12C2 10.3606 2.42496 9.80853 3.27489 8.70433C4.97196 6.49956 7.81811 4 12 4C16.1819 4 19.028 6.49956 20.7251 8.70433C21.575 9.80853 22 10.3606 22 12C22 13.6394 21.575 14.1915 20.7251 15.2957C19.028 17.5004 16.1819 20 12 20C7.81811 20 4.97196 17.5004 3.27489 15.2957Z",stroke:"currentColor",strokeWidth:"1.5"}),e.jsx("path",{d:"M15 12C15 13.6569 13.6569 15 12 15C10.3431 15 9 13.6569 9 12C9 10.3431 10.3431 9 12 9C13.6569 9 15 10.3431 15 12Z",stroke:"currentColor",strokeWidth:"1.5"})]})}function Rt({filled:t}){return e.jsx("svg",{width:"24",height:"24",viewBox:"0 0 24 24",fill:"none",className:`h-4.5 w-4.5 group-hover:fill-warning ${t?"fill-warning":""}`,children:e.jsx("path",{d:"M9.15316 5.40838C10.4198 3.13613 11.0531 2 12 2C12.9469 2 13.5802 3.13612 14.8468 5.40837L15.1745 5.99623C15.5345 6.64193 15.7144 6.96479 15.9951 7.17781C16.2757 7.39083 16.6251 7.4699 17.3241 7.62805L17.9605 7.77203C20.4201 8.32856 21.65 8.60682 21.9426 9.54773C22.2352 10.4886 21.3968 11.4691 19.7199 13.4299L19.2861 13.9372C18.8096 14.4944 18.5713 14.773 18.4641 15.1177C18.357 15.4624 18.393 15.8341 18.465 16.5776L18.5306 17.2544C18.7841 19.8706 18.9109 21.1787 18.1449 21.7602C17.3788 22.3417 16.2273 21.8115 13.9243 20.7512L13.3285 20.4768C12.6741 20.1755 12.3469 20.0248 12 20.0248C11.6531 20.0248 11.3259 20.1755 10.6715 20.4768L10.0757 20.7512C7.77268 21.8115 6.62118 22.3417 5.85515 21.7602C5.08912 21.1787 5.21588 19.8706 5.4694 17.2544L5.53498 16.5776C5.60703 15.8341 5.64305 15.4624 5.53586 15.1177C5.42868 14.773 5.19043 14.4944 4.71392 13.9372L4.2801 13.4299C2.60325 11.4691 1.76482 10.4886 2.05742 9.54773C2.35002 8.60682 3.57986 8.32856 6.03954 7.77203L6.67589 7.62805C7.37485 7.4699 7.72433 7.39083 8.00494 7.17781C8.28555 6.96479 8.46553 6.64194 8.82547 5.99623L9.15316 5.40838Z",stroke:"currentColor",strokeWidth:"1.5"})})}function Dt(){return e.jsx("svg",{width:"24",height:"24",viewBox:"0 0 24 24",fill:"none",className:"h-3 w-3 rotate-45",children:e.jsx("path",{d:"M2 12C2 7.28595 2 4.92893 3.46447 3.46447C4.92893 2 7.28595 2 12 2C16.714 2 19.0711 2 20.5355 3.46447C22 4.92893 22 7.28595 22 12C22 16.714 22 19.0711 20.5355 20.5355C19.0711 22 16.714 22 12 22C7.28595 22 4.92893 22 3.46447 20.5355C2 19.0711 2 16.714 2 12Z",stroke:"currentColor",strokeWidth:"1.5"})})}function It({record:t,accountNumber:i,entitySlug:d}){var $;const[a,N]=r.useState(!1),_=r.useRef(null);r.useEffect(()=>{if(!a)return;const u=x=>{_.current&&!_.current.contains(x.target)&&N(!1)};return document.addEventListener("mousedown",u),()=>document.removeEventListener("mousedown",u)},[a]);const C=(($=t._id)==null?void 0:$.$oid)||t._id;return e.jsxs("div",{ref:_,className:"dropdown relative",children:[e.jsx("button",{type:"button",className:"text-primary",onClick:u=>{u.preventDefault(),u.stopPropagation(),N(!a)},children:e.jsx(_t,{})}),a&&e.jsxs("ul",{className:"absolute z-50 min-w-[140px] rounded-md bg-white dark:bg-[#1b2e4b] shadow-lg border dark:border-gray-700 py-1 text-sm font-medium ltr:right-0 rtl:left-0 top-full mt-1",style:{animation:"fadeIn 0.15s ease-out"},children:[e.jsx("li",{children:e.jsxs("a",{href:`/account/${i}/record/${d}/${C}/edit`,className:"flex items-center px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 w-full",onClick:u=>u.stopPropagation(),children:[e.jsx($t,{})," Edit"]})}),e.jsx("li",{children:e.jsxs("a",{href:`/account/${i}/record/${d}/${C}`,className:"flex items-center px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 w-full",onClick:u=>u.stopPropagation(),children:[e.jsx(Wt,{})," View"]})})]})]})}function Et({record:t,accountNumber:i,entitySlug:d,style:a,favorites:N,onToggleFav:_}){var I,w;const C=N[t._id]||!1,$=((I=t._id)==null?void 0:I.$oid)||t._id,u=t.referenceTitle||t.title||t.computedTitle||"Sans titre",x=t.createdAt?new Date(t.createdAt).toLocaleDateString("fr-FR",{day:"2-digit",month:"short",year:"numeric"}):"",k=(t.customFields||[]).find(D=>{var O,ee,G,m,P,V;return((ee=(O=D.field_id)==null?void 0:O.label)==null?void 0:ee.toLowerCase().includes("descri"))||((m=(G=D.field_id)==null?void 0:G.label)==null?void 0:m.toLowerCase().includes("note"))||((V=(P=D.field_id)==null?void 0:P.label)==null?void 0:V.toLowerCase().includes("contenu"))}),p=(k==null?void 0:k.value)||t.description||"";return(t.classificationValues||[]).filter(D=>D.optionLabel).map(D=>({label:D.optionLabel,color:D.optionColor||D.color||a.dot})),e.jsxs("div",{className:`panel pb-12 relative ${a.bg}`,children:[e.jsxs("div",{className:"min-h-[142px]",children:[e.jsxs("div",{className:"flex justify-between",children:[e.jsxs("div",{className:"flex w-max items-center",children:[e.jsx("div",{className:"flex-none",children:e.jsx("div",{className:"rounded-full bg-gray-300 p-2 dark:bg-gray-700",children:e.jsxs("svg",{width:"24",height:"24",viewBox:"0 0 24 24",fill:"none",className:"h-4.5 w-4.5",children:[e.jsx("circle",{cx:"12",cy:"6",r:"4",stroke:"currentColor",strokeWidth:"1.5"}),e.jsx("ellipse",{opacity:"0.5",cx:"12",cy:"17",rx:"7",ry:"4",stroke:"currentColor",strokeWidth:"1.5"})]})})}),e.jsxs("div",{className:"ltr:ml-2 rtl:mr-2",children:[e.jsx("div",{className:"font-semibold",children:((w=t.createdBy)==null?void 0:w.name)||"Utilisateur"}),e.jsx("div",{className:"text-sx text-white-dark",children:x})]})]}),e.jsx(It,{record:t,accountNumber:i,entitySlug:d})]}),e.jsxs("div",{children:[e.jsx("h4",{className:"mt-4 font-semibold",children:e.jsx("a",{href:`/account/${i}/record/${d}/${$}`,className:"hover:text-primary transition-colors",children:u})}),p&&e.jsx("p",{className:"mt-2 text-white-dark line-clamp-3",children:p})]})]}),e.jsx("div",{className:"absolute bottom-5 left-0 w-full px-5",children:e.jsxs("div",{className:"mt-2 flex items-center justify-between",children:[e.jsx("div",{className:a.text,children:e.jsx(Dt,{})}),e.jsx("div",{className:"flex items-center gap-2",children:e.jsx("button",{type:"button",className:"group text-warning ltr:ml-2 rtl:mr-2",onClick:D=>{D.preventDefault(),D.stopPropagation(),_(t._id)},children:e.jsx(Rt,{filled:C})})})]})})]})}function Tt({records:t,accountNumber:i,entitySlug:d}){const[a,N]=r.useState({}),_=r.useCallback(C=>{N($=>({...$,[C]:!$[C]}))},[]);return e.jsx("div",{className:"h-full overflow-y-auto",children:e.jsx("div",{className:"grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",children:t.length===0?e.jsx("div",{className:"col-span-full text-center py-20 text-gray-400 dark:text-gray-600 italic",children:"Aucun enregistrement"}):t.map((C,$)=>{var u;return e.jsx(Et,{record:C,accountNumber:i,entitySlug:d,style:Mt($),favorites:a,onToggleFav:_},((u=C._id)==null?void 0:u.$oid)||C._id)})})})}const Ye={contains:{label:"Contient",icon:"⊃",types:["text","email","phone","url","textarea","title","relation"]},not_contains:{label:"Ne contient pas",icon:"⊅",types:["text","email","phone","url","textarea","title","relation"]},equals:{label:"Est égal à",icon:"=",types:["text","email","phone","url","number","date","title","select","relation","classification"]},not_equals:{label:"N'est pas égal à",icon:"≠",types:["text","email","phone","url","number","date","title","select","relation","classification"]},starts_with:{label:"Commence par",icon:"A…",types:["text","email","phone","url","title"]},ends_with:{label:"Se termine par",icon:"…Z",types:["text","email","phone","url","title"]},gt:{label:"Supérieur à",icon:">",types:["number","date"]},gte:{label:"Supérieur ou égal",icon:"≥",types:["number","date"]},lt:{label:"Inférieur à",icon:"<",types:["number","date"]},lte:{label:"Inférieur ou égal",icon:"≤",types:["number","date"]},between:{label:"Entre",icon:"↔",types:["number","date"]},is_empty:{label:"Est vide",icon:"∅",types:["text","email","phone","url","number","date","textarea","title","select","relation","classification"]},is_not_empty:{label:"N'est pas vide",icon:"∃",types:["text","email","phone","url","number","date","textarea","title","select","relation","classification"]}};function Te(t){const i=t||"text";return Object.entries(Ye).filter(([d,a])=>a.types.includes(i)).map(([d,a])=>({key:d,...a}))}function Ae(t){return["number","currency","percent"].includes(t)?"number":["date","datetime"].includes(t)?"date":"text"}function Ft({columns:t=[],fieldFilters:i=[],onFieldFiltersChange:d,allRecords:a=[],sidebarFilters:N=[]}){const[_,C]=r.useState(i.length>0),[$,u]=r.useState(null),[x,k]=r.useState(!1),p=r.useRef(null);r.useEffect(()=>{const c=o=>{x&&p.current&&!p.current.contains(o.target)&&k(!1)};return x&&document.addEventListener("mousedown",c),()=>document.removeEventListener("mousedown",c)},[x]);const I=We.useMemo(()=>{const c={};return N.forEach(o=>{c[`classif:${o.id}`]=o.options||[]}),c},[N]),w=t.filter(c=>c.id!=="actions"),D=r.useCallback(c=>{const o=w.find(g=>g.id===c);if(!o)return;const K=c.startsWith("classif:"),H=Te(o.type),F=K?H.find(g=>g.key==="equals")||H[0]:H.find(g=>g.key==="contains")||H[0],v={fieldId:c,fieldName:o.name,fieldType:o.type||"text",operator:F.key,value:"",value2:"",logic:"AND"};d([...i,v]),k(!1),u(i.length)},[w,i,d]),O=r.useCallback((c,o)=>{const K=i.map((H,F)=>F===c?{...H,...o}:H);d(K)},[i,d]),ee=r.useCallback(c=>{const o=i.filter((K,H)=>H!==c);d(o),$===c&&u(null)},[i,d,$]),G=r.useCallback(()=>{d([]),u(null)},[d]),m=c=>["is_empty","is_not_empty"].includes(c),P=c=>c==="between",V=c=>c&&c.startsWith("classif:"),J=c=>I[c]||[],U=(c,o)=>{const H=J(c).find(F=>F.id===o||F.label===o);return H?H.label:o};return e.jsxs("div",{className:"adv-filters-container",children:[e.jsxs("button",{type:"button",className:"adv-filters-header",onClick:()=>C(!_),children:[e.jsxs("div",{className:"adv-filters-header-left",children:[e.jsx("svg",{viewBox:"0 0 24 24",fill:"none",className:"adv-filters-header-icon",children:e.jsx("path",{d:"M22 3H2L10 12.46V19L14 21V12.46L22 3Z",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round"})}),e.jsx("span",{children:"Filtres avancés"}),i.length>0&&e.jsx("span",{className:"adv-filters-count",children:i.length})]}),e.jsx("svg",{viewBox:"0 0 24 24",fill:"none",className:`adv-filters-chevron ${_?"adv-filters-chevron--open":""}`,children:e.jsx("path",{d:"M9 18L15 12L9 6",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round"})})]}),_&&e.jsxs("div",{className:"adv-filters-body",children:[i.map((c,o)=>{var S;w.find(j=>j.id===c.fieldId);const K=Te(c.fieldType),H=$===o,F=V(c.fieldId),v=F?J(c.fieldId):[],g=c.logic||"AND";return e.jsxs(We.Fragment,{children:[o>0&&e.jsxs("div",{className:"adv-filter-connector",children:[e.jsx("span",{className:"adv-filter-connector-line"}),e.jsx("button",{type:"button",className:`adv-filter-connector-badge ${g==="OR"?"adv-filter-connector-badge--or":""}`,onClick:()=>{O(o,{logic:g==="AND"?"OR":"AND"})},title:"Cliquez pour basculer entre ET/OU",children:g==="OR"?"OU":"ET"}),e.jsx("span",{className:"adv-filter-connector-line"})]}),e.jsx("div",{className:`adv-filter-pill ${H?"adv-filter-pill--editing":""}`,children:H?e.jsxs("div",{className:"adv-filter-edit",children:[e.jsxs("div",{className:"adv-filter-row",children:[e.jsx("label",{className:"adv-filter-label",children:"Champ"}),e.jsx("select",{value:c.fieldId,onChange:j=>{const oe=w.find(ne=>ne.id===j.target.value);if(oe){const ne=Te(oe.type),E=j.target.value.startsWith("classif:")?ne.find(B=>B.key==="equals")||ne[0]:ne.find(B=>B.key===c.operator)||ne[0];O(o,{fieldId:oe.id,fieldName:oe.name,fieldType:oe.type||"text",operator:E.key,value:"",value2:""})}},className:"adv-filter-select",children:w.map(j=>e.jsx("option",{value:j.id,children:j.name},j.id))})]}),e.jsxs("div",{className:"adv-filter-row",children:[e.jsx("label",{className:"adv-filter-label",children:"Condition"}),e.jsx("select",{value:c.operator,onChange:j=>O(o,{operator:j.target.value,value:m(j.target.value)?"":c.value,value2:""}),className:"adv-filter-select",children:K.map(j=>e.jsx("option",{value:j.key,children:j.label},j.key))})]}),!m(c.operator)&&e.jsxs("div",{className:"adv-filter-row",children:[e.jsx("label",{className:"adv-filter-label",children:P(c.operator)?"Valeur min":"Valeur"}),F&&v.length>0?e.jsxs("select",{value:c.value,onChange:j=>O(o,{value:j.target.value}),className:"adv-filter-select",children:[e.jsx("option",{value:"",children:"Sélectionnez..."}),v.map(j=>e.jsx("option",{value:j.label,children:j.label},j.id))]}):e.jsx("input",{type:Ae(c.fieldType),value:c.value,onChange:j=>O(o,{value:j.target.value}),placeholder:"Saisir une valeur...",className:"adv-filter-input",autoFocus:!0})]}),P(c.operator)&&e.jsxs("div",{className:"adv-filter-row",children:[e.jsx("label",{className:"adv-filter-label",children:"Valeur max"}),e.jsx("input",{type:Ae(c.fieldType),value:c.value2||"",onChange:j=>O(o,{value2:j.target.value}),placeholder:"Saisir une valeur max...",className:"adv-filter-input"})]}),e.jsxs("div",{className:"adv-filter-row adv-filter-row--actions",children:[e.jsxs("button",{type:"button",className:"adv-filter-btn-done",onClick:()=>u(null),children:[e.jsx("svg",{viewBox:"0 0 24 24",fill:"none",className:"h-3.5 w-3.5",children:e.jsx("path",{d:"M5 13L9 17L19 7",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round"})}),"OK"]}),e.jsx("button",{type:"button",className:"adv-filter-btn-delete",onClick:()=>ee(o),children:e.jsxs("svg",{viewBox:"0 0 24 24",fill:"none",className:"h-3.5 w-3.5",children:[e.jsx("path",{d:"M20.5001 6H3.5",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"}),e.jsx("path",{d:"M18.8334 8.5L18.3735 15.3991C18.1965 18.054 18.108 19.3815 17.243 20.1907C16.378 21 15.0476 21 12.3868 21H11.6134C8.9526 21 7.6222 21 6.75719 20.1907C5.89218 19.3815 5.80368 18.054 5.62669 15.3991L5.16675 8.5",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"})]})})]})]}):e.jsxs("button",{type:"button",className:"adv-filter-pill-summary",onClick:()=>u(o),children:[e.jsx("span",{className:"adv-filter-pill-field",children:c.fieldName}),e.jsx("span",{className:"adv-filter-pill-op",children:((S=Ye[c.operator])==null?void 0:S.label)||c.operator}),!m(c.operator)&&e.jsx("span",{className:"adv-filter-pill-value",children:P(c.operator)?`${c.value||"?"} – ${c.value2||"?"}`:F?U(c.fieldId,c.value):c.value||"..."}),e.jsx("button",{type:"button",className:"adv-filter-pill-remove",onClick:j=>{j.stopPropagation(),ee(o)},children:e.jsx("svg",{viewBox:"0 0 24 24",fill:"none",className:"h-3 w-3",children:e.jsx("path",{d:"M18 6L6 18M6 6L18 18",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round"})})})]})})]},o)}),e.jsxs("div",{className:"adv-filter-add-row",ref:p,children:[e.jsxs("button",{type:"button",className:"adv-filter-add-btn",onClick:()=>k(!x),children:[e.jsx("svg",{viewBox:"0 0 24 24",fill:"none",className:"h-3.5 w-3.5",children:e.jsx("path",{d:"M12 5V19M5 12H19",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round"})}),"Ajouter un filtre"]}),x&&e.jsxs("div",{className:"adv-filter-field-dropdown",children:[e.jsx("div",{className:"adv-filter-field-dropdown-title",children:"Choisir un champ"}),w.map(c=>e.jsxs("button",{type:"button",className:"adv-filter-field-option",onClick:()=>D(c.id),children:[e.jsx("span",{className:"adv-filter-field-type-badge",children:Ot(c.type)}),c.name]},c.id))]})]}),i.length>0&&e.jsx("button",{type:"button",className:"adv-filter-clear",onClick:G,children:"Effacer tous les filtres"})]}),e.jsx("style",{children:`
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
            `})]})}function Ot(t){return{text:"Aa",title:"T",email:"@",phone:"☎",url:"🔗",number:"#",currency:"$",percent:"%",date:"📅",datetime:"🕐",textarea:"¶",select:"☰",relation:"↗",classification:"●"}[t]||"Aa"}const Pe=229,He=500,Ze=280;function Vt({entityName:t,entityNamePlural:i,entityIcon:d,accountNumber:a,entitySlug:N,showSidebar:_,onToggleSidebar:C,filters:$=[],activeFilters:u={},onFilterChange:x,columns:k=[],fieldFilters:p=[],onFieldFiltersChange:I,allRecords:w=[],sidebarWidth:D,onSidebarWidthChange:O}){const[ee,G]=r.useState(!1),m=r.useRef(null),[P,V]=r.useState(D||Ze),J=r.useRef(!1),U=r.useRef(0),c=r.useRef(0),o=r.useRef(D||Ze),K=r.useRef(O);r.useEffect(()=>{K.current=O},[O]),r.useEffect(()=>{o.current=P},[P]),r.useEffect(()=>{D&&!J.current&&V(D)},[D]);const H=r.useCallback(g=>{g.preventDefault(),J.current=!0,U.current=g.clientX,c.current=o.current,document.body.style.cursor="col-resize",document.body.style.userSelect="none"},[]);if(r.useEffect(()=>{const g=j=>{if(!J.current)return;const oe=j.clientX-U.current,ne=Math.min(He,Math.max(Pe,c.current+oe));V(ne)},S=()=>{J.current&&(J.current=!1,document.body.style.cursor="",document.body.style.userSelect="",K.current&&K.current(o.current))};return document.addEventListener("mousemove",g),document.addEventListener("mouseup",S),()=>{document.removeEventListener("mousemove",g),document.removeEventListener("mouseup",S)}},[]),r.useEffect(()=>{const g=S=>{ee&&m.current&&!m.current.contains(S.target)&&G(!1)};return ee&&document.addEventListener("mousedown",g),()=>document.removeEventListener("mousedown",g)},[ee]),!_)return null;const F=(g,S)=>{const j={...u},oe=j[g]||[];if(S==="__all__")delete j[g];else{const ne=oe.indexOf(S);ne>-1?(oe.splice(ne,1),oe.length===0?delete j[g]:j[g]=[...oe]):j[g]=[...oe,S]}x(j)},v=Object.keys(u).length>0;return e.jsxs("div",{style:{position:"relative",width:P,minWidth:Pe,maxWidth:He,flexShrink:0},children:[e.jsxs("div",{className:"panel z-10 space-y-4 overflow-y-auto p-4 h-full",style:{display:"flex",flexDirection:"column",width:"100%"},children:[e.jsxs("div",{className:"flex items-center justify-between",children:[e.jsx("div",{className:"flex items-center",children:e.jsxs("div",{className:"flex items-center text-center",children:[e.jsx("div",{children:d?e.jsx("iconify-icon",{icon:d,width:"22",style:{color:"var(--primary)"}}):e.jsxs("svg",{width:"24",height:"24",viewBox:"0 0 24 24",fill:"none",xmlns:"http://www.w3.org/2000/svg",className:"h-5 w-5",children:[e.jsx("path",{d:"M20.3116 12.6473L20.8293 10.7154C21.4335 8.46034 21.7356 7.3328 21.5081 6.35703C21.3285 5.58657 20.9244 4.88668 20.347 4.34587C19.6157 3.66095 18.4881 3.35883 16.2331 2.75458C13.978 2.15033 12.8504 1.84821 11.8747 2.07573C11.1042 2.25537 10.4043 2.65945 9.86351 3.23687C9.27709 3.86298 8.97128 4.77957 8.51621 6.44561C8.43979 6.7254 8.35915 7.02633 8.27227 7.35057L8.27222 7.35077L7.75458 9.28263C7.15033 11.5377 6.84821 12.6652 7.07573 13.641C7.25537 14.4115 7.65945 15.1114 8.23687 15.6522C8.96815 16.3371 10.0957 16.6392 12.3508 17.2435L12.3508 17.2435C14.3834 17.7881 15.4999 18.0873 16.415 17.9744C16.5152 17.9621 16.6129 17.9448 16.7092 17.9223C17.4796 17.7427 18.1795 17.3386 18.7203 16.7612C19.4052 16.0299 19.7074 14.9024 20.3116 12.6473Z",stroke:"currentColor",strokeWidth:"1.5"}),e.jsx("path",{opacity:"0.5",d:"M16.415 17.9741C16.2065 18.6126 15.8399 19.1902 15.347 19.6519C14.6157 20.3368 13.4881 20.6389 11.2331 21.2432C8.97798 21.8474 7.85044 22.1495 6.87466 21.922C6.10421 21.7424 5.40432 21.3383 4.86351 20.7609C4.17859 20.0296 3.87647 18.9021 3.27222 16.647L2.75458 14.7151C2.15033 12.46 1.84821 11.3325 2.07573 10.3567C2.25537 9.58627 2.65945 8.88638 3.23687 8.34557C3.96815 7.66065 5.09569 7.35853 7.35077 6.75428C7.77741 6.63996 8.16368 6.53646 8.51621 6.44531",stroke:"currentColor",strokeWidth:"1.5"}),e.jsx("path",{d:"M11.7769 10L16.6065 11.2941",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"}),e.jsx("path",{opacity:"0.5",d:"M11 12.8975L13.8978 13.6739",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"})]})}),e.jsx("h3",{className:"text-lg font-semibold ltr:ml-3 rtl:mr-3",children:t})]})}),e.jsxs("div",{className:"dropdown relative",ref:m,children:[e.jsx("button",{type:"button",className:"flex h-8 w-8 items-center justify-center rounded-full bg-[#f4f4f4] hover:bg-primary-light dark:bg-[#1b2e4b]",onClick:()=>G(!ee),children:e.jsxs("svg",{width:"24",height:"24",viewBox:"0 0 24 24",fill:"none",xmlns:"http://www.w3.org/2000/svg",className:"h-5 w-5 opacity-70",children:[e.jsx("circle",{cx:"5",cy:"12",r:"2",stroke:"currentColor",strokeWidth:"1.5"}),e.jsx("circle",{opacity:"0.5",cx:"12",cy:"12",r:"2",stroke:"currentColor",strokeWidth:"1.5"}),e.jsx("circle",{cx:"19",cy:"12",r:"2",stroke:"currentColor",strokeWidth:"1.5"})]})}),ee&&e.jsxs("ul",{className:"whitespace-nowrap absolute right-0 top-full mt-1 z-50 min-w-[160px] rounded-md border border-gray-200 bg-white py-1 shadow-lg dark:border-[#1b2e4b] dark:bg-[#0e1726]",children:[e.jsx("li",{children:e.jsxs("a",{href:"javascript:;",onClick:()=>G(!1),className:"flex items-center px-4 py-2 text-sm hover:bg-gray-100 hover:text-primary dark:hover:bg-[#181F32] dark:hover:text-primary",children:[e.jsx("iconify-icon",{icon:"solar:settings-bold-duotone",className:"h-4.5 w-4.5 shrink-0 ltr:mr-1 rtl:ml-1",width:"18",style:{marginRight:"6px"}}),"Paramètres"]})}),e.jsx("li",{children:e.jsxs("a",{href:"javascript:;",onClick:()=>G(!1),className:"flex items-center px-4 py-2 text-sm hover:bg-gray-100 hover:text-primary dark:hover:bg-[#181F32] dark:hover:text-primary",children:[e.jsx("iconify-icon",{icon:"solar:question-circle-bold-duotone",className:"h-4.5 w-4.5 shrink-0 ltr:mr-1 rtl:ml-1",width:"18",style:{marginRight:"6px"}}),"Aide"]})})]})]})]}),e.jsx("div",{className:"h-px w-full border-b border-[#e0e6ed] dark:border-[#1b2e4b]"}),e.jsx("div",{className:"!mt-0",style:{flex:1,display:"flex",flexDirection:"column"},children:e.jsxs("div",{className:"flex h-full flex-col pb-16",style:{position:"relative"},children:[e.jsx("div",{className:"relative -mr-3.5 h-full grow pr-3.5 overflow-auto",children:e.jsxs("div",{className:"space-y-1",children:[e.jsx("button",{type:"button",className:`flex h-10 w-full items-center justify-between rounded-md p-2 font-medium hover:bg-white-dark/10 hover:text-primary dark:hover:bg-[#181F32] dark:hover:text-primary ${v?"":"bg-gray-100 dark:text-primary text-primary dark:bg-[#181F32]"}`,onClick:()=>x({}),children:e.jsxs("div",{className:"flex items-center",children:[e.jsx("iconify-icon",{icon:"solar:checklist-minimalistic-bold-duotone",width:"20"}),e.jsxs("div",{className:"ltr:ml-3 rtl:mr-3",children:["Toutes les ",i||t]})]})}),e.jsx("button",{type:"button",className:`flex h-10 w-full items-center justify-between rounded-md p-2 font-medium hover:bg-white-dark/10 hover:text-primary dark:hover:bg-[#181F32] dark:hover:text-primary ${u.__favourites?"bg-gray-100 dark:text-primary text-primary dark:bg-[#181F32]":""}`,onClick:()=>{const g={...u};g.__favourites?delete g.__favourites:g.__favourites=!0,x(g)},children:e.jsxs("div",{className:"flex items-center",children:[e.jsx("svg",{width:"24",height:"24",viewBox:"0 0 24 24",fill:"none",xmlns:"http://www.w3.org/2000/svg",className:"h-5 w-5",children:e.jsx("path",{d:"M9.15316 5.40838C10.4198 3.13613 11.0531 2 12 2C12.9469 2 13.5802 3.13612 14.8468 5.40837L15.1745 5.99623C15.5345 6.64193 15.7144 6.96479 15.9951 7.17781C16.2757 7.39083 16.6251 7.4699 17.3241 7.62805L17.9605 7.77203C20.4201 8.32856 21.65 8.60682 21.9426 9.54773C22.2352 10.4886 21.3968 11.4691 19.7199 13.4299L19.2861 13.9372C18.8096 14.4944 18.5713 14.773 18.4641 15.1177C18.357 15.4624 18.393 15.8341 18.465 16.5776L18.5306 17.2544C18.7841 19.8706 18.9109 21.1787 18.1449 21.7602C17.3788 22.3417 16.2273 21.8115 13.9243 20.7512L13.3285 20.4768C12.6741 20.1755 12.3469 20.0248 12 20.0248C11.6531 20.0248 11.3259 20.1755 10.6715 20.4768L10.0757 20.7512C7.77268 21.8115 6.62118 22.3417 5.85515 21.7602C5.08912 21.1787 5.21588 19.8706 5.4694 17.2544L5.53498 16.5776C5.60703 15.8341 5.64305 15.4624 5.53586 15.1177C5.42868 14.773 5.19043 14.4944 4.71392 13.9372L4.2801 13.4299C2.60325 11.4691 1.76482 10.4886 2.05742 9.54773C2.35002 8.60682 3.57986 8.32856 6.03954 7.77203L6.67589 7.62805C7.37485 7.4699 7.72433 7.39083 8.00494 7.17781C8.28555 6.96479 8.46553 6.64194 8.82547 5.99623L9.15316 5.40838Z",stroke:"currentColor",strokeWidth:"1.5"})}),e.jsx("div",{className:"ltr:ml-3 rtl:mr-3",children:"Favourites"})]})}),$.map(g=>e.jsxs("div",{children:[e.jsx("div",{className:"h-px w-full border-b border-[#e0e6ed] dark:border-[#1b2e4b] my-2"}),e.jsx("div",{className:"px-1 py-2 text-white-dark text-xs uppercase font-semibold tracking-wider",children:g.name}),g.type==="tags"?e.jsx("div",{className:"flex flex-wrap gap-1.5 px-1",children:g.options.map(S=>{const j=(u[g.id]||[]).includes(S.id);return e.jsxs("button",{type:"button",className:"mb-0 py-0.5 px-2.5 text-xs rounded-full cursor-pointer transition-all font-medium",style:{border:`1.5px solid ${S.color||"#9ca3af"}`,color:j?"#fff":S.color||"#9ca3af",backgroundColor:j?S.color||"#9ca3af":"transparent"},onClick:()=>F(g.id,S.id),children:[S.label,S.count!==void 0&&e.jsx("span",{style:{opacity:.7,marginLeft:"2px"},children:S.count})]},S.id)})}):e.jsx("div",{className:"space-y-0.5",children:g.options.map(S=>{const j=(u[g.id]||[]).includes(S.id);return e.jsxs("button",{type:"button",className:`flex h-9 w-full items-center rounded-md px-2 py-1.5 text-sm font-medium transition-colors hover:bg-white-dark/10 hover:text-primary dark:hover:bg-[#181F32] dark:hover:text-primary ${j?"bg-gray-100 text-primary dark:bg-[#181F32] dark:text-primary":""}`,onClick:()=>F(g.id,S.id),children:[e.jsx("span",{className:"inline-block w-3 h-3 rounded-full mr-2.5 flex-shrink-0",style:{backgroundColor:S.color||"#9ca3af"}}),e.jsx("span",{className:"truncate",children:S.label}),S.count!==void 0&&e.jsx("span",{className:"ml-auto text-xs opacity-60",children:S.count})]},S.id)})})]},g.id)),e.jsx(Ft,{columns:k,fieldFilters:p,onFieldFiltersChange:I,allRecords:w,sidebarFilters:$})]})}),e.jsx("div",{className:"absolute bottom-0 w-full p-4 left-0",children:e.jsxs("a",{href:`/account/${a}/record/${N}/add`,className:"btn btn-primary w-full",children:[e.jsxs("svg",{xmlns:"http://www.w3.org/2000/svg",width:"24px",height:"24px",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round",className:"h-5 w-5 ltr:mr-2 rtl:ml-2",children:[e.jsx("line",{x1:"12",y1:"5",x2:"12",y2:"19"}),e.jsx("line",{x1:"5",y1:"12",x2:"19",y2:"12"})]}),"Ajouter"]})})]})})]}),e.jsx("div",{onMouseDown:H,style:{position:"absolute",top:0,right:-3,width:6,height:"100%",cursor:"col-resize",zIndex:20,display:"flex",alignItems:"center",justifyContent:"center"},onMouseEnter:g=>{g.currentTarget.querySelector(".resize-bar").style.opacity="1"},onMouseLeave:g=>{J.current||(g.currentTarget.querySelector(".resize-bar").style.opacity="0")},children:e.jsx("div",{className:"resize-bar",style:{width:3,height:"100%",borderRadius:2,background:"var(--primary, #4361ee)",opacity:0,transition:"opacity 0.2s ease"}})})]})}const zt=["#4361ee","#805dca","#e2a03f","#00ab55","#e7515a","#2196d4","#3b3f5c","#009688","#ff5722","#607d8b"],Bt={contains:{label:"Contient",icon:"⊃",types:["text","email","phone","url","textarea","title","relation"]},not_contains:{label:"Ne contient pas",icon:"⊅",types:["text","email","phone","url","textarea","title","relation"]},equals:{label:"Est égal à",icon:"=",types:["text","email","phone","url","number","date","title","select","relation","classification"]},not_equals:{label:"N'est pas égal à",icon:"≠",types:["text","email","phone","url","number","date","title","select","relation","classification"]},starts_with:{label:"Commence par",icon:"A…",types:["text","email","phone","url","title"]},ends_with:{label:"Se termine par",icon:"…Z",types:["text","email","phone","url","title"]},gt:{label:"Supérieur à",icon:">",types:["number","date"]},gte:{label:"Supérieur ou égal",icon:"≥",types:["number","date"]},lt:{label:"Inférieur à",icon:"<",types:["number","date"]},lte:{label:"Inférieur ou égal",icon:"≤",types:["number","date"]},between:{label:"Entre",icon:"↔",types:["number","date"]},is_empty:{label:"Est vide",icon:"∅",types:["text","email","phone","url","number","date","textarea","title","select","relation","classification"]},is_not_empty:{label:"N'est pas vide",icon:"∃",types:["text","email","phone","url","number","date","textarea","title","select","relation","classification"]}};function Fe(t){const i=t||"text";return Object.entries(Bt).filter(([d,a])=>a.types.includes(i)).map(([d,a])=>({key:d,...a}))}function Je(t){return["number","currency","percent"].includes(t)?"number":["date","datetime"].includes(t)?"date":"text"}function At({savedViews:t=[],activeViewId:i,onSelectView:d,onCreateView:a,onDeleteView:N,onRenameView:_,onUpdateViewFilters:C,hasActiveFilters:$=!1,activeFilters:u={},fieldFilters:x=[],sidebarFilters:k=[],columns:p=[],externalOpenCreate:I=!1,onCloseExternalCreate:w}){const[D,O]=r.useState(!1),[ee,G]=r.useState(!1),[m,P]=r.useState(""),[V,J]=r.useState("#4361ee"),[U,c]=r.useState(null),[o,K]=r.useState(null),[H,F]=r.useState(""),[v,g]=r.useState(null),[S,j]=r.useState([]),[oe,ne]=r.useState({}),[b,E]=r.useState(!1),B=r.useRef(null),L=r.useRef(null),Z=r.useRef(null),T=r.useRef(null);r.useEffect(()=>{const n=M=>{U&&L.current&&!L.current.contains(M.target)&&c(null)};return U&&document.addEventListener("mousedown",n),()=>document.removeEventListener("mousedown",n)},[U]),r.useEffect(()=>{D&&Z.current&&setTimeout(()=>{var n;return(n=Z.current)==null?void 0:n.focus()},100)},[D]),r.useEffect(()=>{I&&(O(!0),j([...x]),w==null||w())},[I]),r.useEffect(()=>{D&&!v&&(j([...x]),ne(JSON.parse(JSON.stringify(u||{}))))},[D]),r.useEffect(()=>{const n=M=>{b&&B.current&&!B.current.contains(M.target)&&E(!1)};return b&&document.addEventListener("mousedown",n),()=>document.removeEventListener("mousedown",n)},[b]),r.useEffect(()=>{o&&T.current&&(T.current.focus(),T.current.select())},[o]);const z=(n,M)=>{n.preventDefault(),c({viewId:M,x:n.clientX,y:n.clientY})},re=()=>{m.trim()&&(a({name:m.trim(),color:V,filters:oe,fieldFilters:S}),P(""),J("#4361ee"),j([]),ne({}),O(!1))},ie=r.useMemo(()=>p.filter(n=>n.id!=="actions"),[p]),ce=r.useMemo(()=>{const n={};return k.forEach(M=>{n[`classif:${M.id}`]=M.options||[]}),n},[k]),he=r.useCallback(n=>{const M=ie.find(ue=>ue.id===n);if(!M)return;const le=n.startsWith("classif:"),de=Fe(M.type),ve=le?de.find(ue=>ue.key==="equals")||de[0]:de.find(ue=>ue.key==="contains")||de[0],ye={fieldId:n,fieldName:M.name,fieldType:M.type||"text",operator:ve.key,value:"",value2:"",logic:"AND"};j(ue=>[...ue,ye]),E(!1)},[ie]),l=r.useCallback((n,M)=>{j(le=>le.map((de,ve)=>ve===n?{...de,...M}:de))},[]),A=r.useCallback(n=>{j(M=>M.filter((le,de)=>de!==n))},[]),X=n=>{const M=t.find(le=>le._id===n);M&&(K(n),F(M.name)),c(null)},R=()=>{o&&H.trim()&&_(o,H.trim()),K(null),F("")},me=n=>{N(n),c(null)},Y=n=>{const M=t.find(le=>le._id===n);M&&(g(n),P(M.name||""),J(M.color||"#4361ee"),j(M.fieldFilters?JSON.parse(JSON.stringify(M.fieldFilters)):[]),ne(M.filters?JSON.parse(JSON.stringify(M.filters)):{}),O(!0),c(null))},pe=()=>{!m.trim()||!v||(C(v,oe,S,m.trim(),V),P(""),J("#4361ee"),j([]),ne({}),g(null),O(!1))},Ce=n=>{var le;let M=0;return n.filters&&(M+=Object.keys(n.filters).filter(de=>de!=="__favourites").length),(le=n.fieldFilters)!=null&&le.length&&(M+=n.fieldFilters.length),M};return e.jsxs(e.Fragment,{children:[e.jsxs("div",{className:"saved-views-tabs",children:[e.jsxs("button",{type:"button",className:`saved-view-tab ${i?"":"saved-view-tab--active"}`,onClick:()=>d(null),children:[e.jsxs("svg",{className:"saved-view-tab-icon",viewBox:"0 0 24 24",fill:"none",children:[e.jsx("path",{d:"M2 12C2 7.28595 2 4.92893 3.46447 3.46447C4.92893 2 7.28595 2 12 2C16.714 2 19.0711 2 20.5355 3.46447C22 4.92893 22 7.28595 22 12C22 16.714 22 19.0711 20.5355 20.5355C19.0711 22 16.714 22 12 22C7.28595 22 4.92893 22 3.46447 20.5355C2 19.0711 2 16.714 2 12Z",stroke:"currentColor",strokeWidth:"1.5"}),e.jsx("path",{d:"M6 12H18",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"}),e.jsx("path",{d:"M6 8H18",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"}),e.jsx("path",{d:"M6 16H18",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"})]}),"Tout"]}),t.map(n=>e.jsx("button",{type:"button",className:`saved-view-tab ${i===n._id?"saved-view-tab--active":""}`,style:{"--tab-color":n.color||"#4361ee"},onClick:()=>d(n._id),onContextMenu:M=>z(M,n._id),children:o===n._id?e.jsx("input",{ref:T,type:"text",value:H,onChange:M=>F(M.target.value),onBlur:R,onKeyDown:M=>{M.key==="Enter"&&R(),M.key==="Escape"&&(K(null),F(""))},className:"saved-view-tab-edit-input",onClick:M=>M.stopPropagation()}):e.jsxs(e.Fragment,{children:[e.jsx("span",{className:"saved-view-tab-dot",style:{backgroundColor:n.color||"#4361ee"}}),e.jsx("span",{className:"saved-view-tab-name",children:n.name}),Ce(n)>0&&e.jsx("span",{className:"saved-view-tab-badge",children:Ce(n)})]})},n._id)),e.jsx("button",{type:"button",className:"saved-view-tab saved-view-tab--add",onClick:()=>{g(null),P(""),J("#4361ee"),O(!0)},title:"Enregistrer une vue",children:e.jsx("svg",{viewBox:"0 0 24 24",fill:"none",className:"h-3.5 w-3.5",children:e.jsx("path",{d:"M12 5V19M5 12H19",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round"})})})]}),U&&e.jsxs("div",{ref:L,className:"saved-view-context-menu",style:{position:"fixed",top:U.y,left:U.x,zIndex:10001},children:[e.jsxs("button",{className:"saved-view-context-item",onClick:()=>X(U.viewId),children:[e.jsx("svg",{viewBox:"0 0 24 24",fill:"none",className:"h-4 w-4",children:e.jsx("path",{d:"M13.9027 6.37027L17.6297 10.0973M4 20.0001H8L18.5 9.50006C18.9978 9.00236 19.2786 8.32622 19.2786 7.62142C19.2786 6.91661 18.9978 6.24047 18.5 5.74277C18.0023 5.24508 17.3261 4.96426 16.6213 4.96426C15.9165 4.96426 15.2404 5.24508 14.7427 5.74277L4 16.0001V20.0001Z",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round"})}),"Renommer"]}),e.jsxs("button",{className:"saved-view-context-item",onClick:()=>Y(U.viewId),children:[e.jsxs("svg",{viewBox:"0 0 24 24",fill:"none",className:"h-4 w-4",children:[e.jsx("path",{d:"M4.06189 13C4.02104 12.6724 4 12.3387 4 12C4 7.58172 7.58172 4 12 4C14.5006 4 16.7332 5.14727 18.2002 6.94416M19.9381 11C19.979 11.3276 20 11.6613 20 12C20 16.4183 16.4183 20 12 20C9.49944 20 7.26681 18.8527 5.79984 17.0558",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round"}),e.jsx("path",{d:"M15 7H19V3",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round"}),e.jsx("path",{d:"M9 17H5V21",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round"})]}),"Modifier la vue"]}),e.jsx("div",{className:"saved-view-context-separator"}),e.jsxs("button",{className:"saved-view-context-item saved-view-context-item--danger",onClick:()=>me(U.viewId),children:[e.jsxs("svg",{viewBox:"0 0 24 24",fill:"none",className:"h-4 w-4",children:[e.jsx("path",{d:"M20.5001 6H3.5",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"}),e.jsx("path",{d:"M18.8334 8.5L18.3735 15.3991C18.1965 18.054 18.108 19.3815 17.243 20.1907C16.378 21 15.0476 21 12.3868 21H11.6134C8.9526 21 7.6222 21 6.75719 20.1907C5.89218 19.3815 5.80368 18.054 5.62669 15.3991L5.16675 8.5",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"}),e.jsx("path",{d:"M9.5 11L10 16",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"}),e.jsx("path",{d:"M14.5 11L14 16",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"}),e.jsx("path",{d:"M6.5 6C6.55588 6 6.58382 6 6.60915 5.99936C7.43259 5.97849 8.15902 5.45491 8.43922 4.68032C8.44784 4.65649 8.45667 4.62999 8.47434 4.57697L8.57143 4.28571C8.65431 4.03708 8.69575 3.91276 8.75071 3.8072C8.97001 3.38607 9.37574 3.09364 9.84461 3.01877C9.96213 3 10.0932 3 10.3553 3H13.6447C13.9068 3 14.0379 3 14.1554 3.01877C14.6243 3.09364 15.03 3.38607 15.2493 3.8072C15.3043 3.91276 15.3457 4.03708 15.4286 4.28571L15.5257 4.57697C15.5433 4.62992 15.5522 4.65651 15.5608 4.68032C15.841 5.45491 16.5674 5.97849 17.3909 5.99936C17.4162 6 17.4441 6 17.5 6",stroke:"currentColor",strokeWidth:"1.5"})]}),"Supprimer"]})]}),D&&e.jsx("div",{className:"saved-view-modal-overlay",onClick:()=>O(!1),children:e.jsxs("div",{className:"saved-view-modal",onClick:n=>n.stopPropagation(),children:[e.jsxs("div",{className:"saved-view-modal-header",children:[e.jsx("h3",{children:v?"Modifier la vue":"Enregistrer la vue"}),e.jsx("button",{type:"button",className:"saved-view-modal-close",onClick:()=>{O(!1),g(null)},children:e.jsx("svg",{viewBox:"0 0 24 24",fill:"none",className:"h-5 w-5",children:e.jsx("path",{d:"M18 6L6 18M6 6L18 18",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"})})})]}),e.jsxs("div",{className:"saved-view-modal-body",children:[e.jsxs("div",{className:"saved-view-form-group",children:[e.jsx("label",{className:"saved-view-form-label",children:"Nom de la vue"}),e.jsx("input",{ref:Z,type:"text",value:m,onChange:n=>P(n.target.value),onKeyDown:n=>{n.key==="Enter"&&re()},placeholder:"Ex: Hôtels, Clients VIP...",className:"saved-view-form-input"})]}),e.jsxs("div",{className:"saved-view-form-group",children:[e.jsx("label",{className:"saved-view-form-label",children:"Couleur"}),e.jsx("div",{className:"saved-view-color-grid",children:zt.map(n=>e.jsx("button",{type:"button",className:`saved-view-color-swatch ${V===n?"saved-view-color-swatch--active":""}`,style:{backgroundColor:n},onClick:()=>J(n),children:V===n&&e.jsx("svg",{viewBox:"0 0 24 24",fill:"none",className:"h-3 w-3",children:e.jsx("path",{d:"M5 13L9 17L19 7",stroke:"white",strokeWidth:"2.5",strokeLinecap:"round",strokeLinejoin:"round"})})},n))})]}),k.length>0&&e.jsxs("div",{className:"saved-view-form-group",children:[e.jsx("label",{className:"saved-view-form-label",children:"Filtres de classification"}),e.jsx("div",{className:"svm-classif-editor",children:k.map(n=>{const M=oe[n.id]||[];return e.jsxs("div",{className:"svm-classif-group",children:[e.jsx("span",{className:"svm-classif-group-label",children:n.name}),e.jsx("div",{className:"svm-classif-options",children:(n.options||[]).map(le=>{const de=M.includes(le.id);return e.jsxs("button",{type:"button",className:`svm-classif-pill ${de?"svm-classif-pill--active":""}`,style:{"--pill-color":le.color||"#9ca3af"},onClick:()=>{ne(ve=>{const ye=ve[n.id]||[];let ue;de?ue=ye.filter(we=>we!==le.id):ue=[...ye,le.id];const ke={...ve};return ue.length>0?ke[n.id]=ue:delete ke[n.id],ke})},children:[de&&e.jsx("svg",{viewBox:"0 0 24 24",fill:"none",className:"svm-classif-check",children:e.jsx("path",{d:"M5 13L9 17L19 7",stroke:"currentColor",strokeWidth:"2.5",strokeLinecap:"round",strokeLinejoin:"round"})}),le.label]},le.id)})})]},n.id)})})]}),e.jsxs("div",{className:"saved-view-form-group",children:[e.jsx("label",{className:"saved-view-form-label",children:"Filtres avancés"}),e.jsxs("div",{className:"svm-filter-builder",children:[S.map((n,M)=>{var we;const le=(we=n.fieldId)==null?void 0:we.startsWith("classif:"),de=le?ce[n.fieldId]||[]:[],ve=Fe(n.fieldType),ye=["is_empty","is_not_empty"].includes(n.operator),ue=n.operator==="between",ke=n.logic||"AND";return e.jsxs(We.Fragment,{children:[M>0&&e.jsxs("div",{className:"svm-filter-connector",children:[e.jsx("span",{className:"svm-filter-connector-line"}),e.jsx("button",{type:"button",className:`svm-filter-connector-badge ${ke==="OR"?"svm-filter-connector-badge--or":""}`,onClick:()=>l(M,{logic:ke==="AND"?"OR":"AND"}),title:"Cliquez pour basculer ET/OU",children:ke==="OR"?"OU":"ET"}),e.jsx("span",{className:"svm-filter-connector-line"})]}),e.jsxs("div",{className:"svm-filter-row",children:[e.jsx("select",{value:n.fieldId,onChange:ae=>{const je=ie.find(Me=>Me.id===ae.target.value);if(je){const Me=ae.target.value.startsWith("classif:"),Ne=Fe(je.type),Se=Me?Ne.find(ge=>ge.key==="equals")||Ne[0]:Ne.find(ge=>ge.key===n.operator)||Ne[0];l(M,{fieldId:je.id,fieldName:je.name,fieldType:je.type||"text",operator:Se.key,value:"",value2:""})}},className:"svm-filter-select svm-filter-select--field",children:ie.map(ae=>e.jsx("option",{value:ae.id,children:ae.name},ae.id))}),e.jsx("select",{value:n.operator,onChange:ae=>l(M,{operator:ae.target.value,value:["is_empty","is_not_empty"].includes(ae.target.value)?"":n.value,value2:""}),className:"svm-filter-select svm-filter-select--op",children:ve.map(ae=>e.jsx("option",{value:ae.key,children:ae.label},ae.key))}),!ye&&(le&&de.length>0?e.jsxs("select",{value:n.value,onChange:ae=>l(M,{value:ae.target.value}),className:"svm-filter-select svm-filter-select--val",children:[e.jsx("option",{value:"",children:"Sélectionnez..."}),de.map(ae=>e.jsx("option",{value:ae.label,children:ae.label},ae.id))]}):e.jsx("input",{type:Je(n.fieldType),value:n.value,onChange:ae=>l(M,{value:ae.target.value}),placeholder:"Valeur...",className:"svm-filter-input"})),ue&&e.jsx("input",{type:Je(n.fieldType),value:n.value2||"",onChange:ae=>l(M,{value2:ae.target.value}),placeholder:"Max...",className:"svm-filter-input"}),e.jsx("button",{type:"button",className:"svm-filter-remove",onClick:()=>A(M),title:"Supprimer ce filtre",children:e.jsx("svg",{viewBox:"0 0 24 24",fill:"none",className:"h-3.5 w-3.5",children:e.jsx("path",{d:"M18 6L6 18M6 6L18 18",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round"})})})]})]},M)}),e.jsxs("div",{className:"svm-filter-add-row",ref:B,children:[e.jsxs("button",{type:"button",className:"svm-filter-add-btn",onClick:()=>E(!b),children:[e.jsx("svg",{viewBox:"0 0 24 24",fill:"none",className:"h-3.5 w-3.5",children:e.jsx("path",{d:"M12 5V19M5 12H19",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round"})}),"Ajouter un filtre"]}),b&&e.jsxs("div",{className:"svm-filter-field-dropdown",children:[e.jsx("div",{className:"svm-filter-field-dropdown-title",children:"Choisir un champ"}),ie.map(n=>e.jsx("button",{type:"button",className:"svm-filter-field-option",onClick:()=>he(n.id),children:n.name},n.id))]})]})]})]})]}),e.jsxs("div",{className:"saved-view-modal-footer",children:[e.jsx("button",{type:"button",className:"saved-view-btn saved-view-btn--cancel",onClick:()=>{O(!1),g(null)},children:"Annuler"}),e.jsxs("button",{type:"button",className:"saved-view-btn saved-view-btn--save",onClick:v?pe:re,disabled:!m.trim(),children:[e.jsx("svg",{viewBox:"0 0 24 24",fill:"none",className:"h-4 w-4",children:e.jsx("path",{d:"M5 13L9 17L19 7",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round"})}),v?"Mettre à jour":"Enregistrer"]})]})]})}),e.jsx("style",{children:`
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
            `})]})}function Pt(t,i){var a,N,_;if(i==="title")return t.referenceTitle||t.computedTitle||t.title||"";if(i==="createdAt")return t.createdAt||"";if(i==="updatedAt")return t.updatedAt||"";if(i.startsWith("rel:")){const C=i.replace("rel:",""),u=(((a=t._denorm)==null?void 0:a.relations)||[]).find(p=>p.relationKey===C);if(((N=u==null?void 0:u.records)==null?void 0:N.length)>0)return u.records.map(p=>p.title||p.computedTitle||"").join(", ");const x=(t.relations||[]).find(p=>p.key===C||p.relationKey===C);if(x)return x.title||x.computedTitle||x.value||"";const k=(_=t._denorm)==null?void 0:_[C];return k&&(k.title||k.computedTitle)||""}if(i.startsWith("classif:")){const C=i.replace("classif:","");return(t.classificationValues||[]).filter(x=>{var k;return((k=x.classificationId)==null?void 0:k.toString())===C}).map(x=>x.label||x.optionLabel||"").join(", ")}const d=(t.customFields||[]).find(C=>{var $,u,x;return((u=($=C.field_id)==null?void 0:$._id)==null?void 0:u.toString())===i||((x=C.field_id)==null?void 0:x.toString())===i});return(d==null?void 0:d.value)??""}function Ht(t,i){const{operator:d,value:a,value2:N,fieldType:_}=i,C=["number","currency","percent"].includes(_),$=["date","datetime"].includes(_),u=String(t??"").trim(),x=u.toLowerCase(),k=String(a??"").trim().toLowerCase();switch(d){case"contains":return x.includes(k);case"not_contains":return!x.includes(k);case"equals":return C?parseFloat(u)===parseFloat(a):x===k;case"not_equals":return C?parseFloat(u)!==parseFloat(a):x!==k;case"starts_with":return x.startsWith(k);case"ends_with":return x.endsWith(k);case"gt":return $?new Date(t)>new Date(a):parseFloat(u)>parseFloat(a);case"gte":return $?new Date(t)>=new Date(a):parseFloat(u)>=parseFloat(a);case"lt":return $?new Date(t)<new Date(a):parseFloat(u)<parseFloat(a);case"lte":return $?new Date(t)<=new Date(a):parseFloat(u)<=parseFloat(a);case"between":{if($){const I=new Date(t);return I>=new Date(a)&&I<=new Date(N)}const p=parseFloat(u);return p>=parseFloat(a)&&p<=parseFloat(N)}case"is_empty":return u===""||t==null;case"is_not_empty":return u!==""&&t!=null;default:return!0}}function Zt({accountId:t,accountNumber:i,entityId:d,viewId:a,entityName:N,entityNamePlural:_,entitySlug:C}){const[$,u]=r.useState([]),[x,k]=r.useState([]),[p,I]=r.useState([]),[w,D]=r.useState([]),[O,ee]=r.useState(!0),[G,m]=r.useState(null),[P,V]=r.useState(""),[J,U]=r.useState("table"),[c,o]=r.useState(""),[K,H]=r.useState(null),[F,v]=r.useState(new Set),[g,S]=r.useState(!1),j=r.useRef(null),[oe,ne]=r.useState([]),[b,E]=r.useState({}),[B,L]=r.useState([]),[Z,T]=r.useState([]),[z,re]=r.useState(null),[ie,ce]=r.useState(!1),[he,l]=r.useState(null),A=r.useRef(null),X=r.useCallback((s,f="success")=>{A.current&&clearTimeout(A.current),l({message:s,type:f}),A.current=setTimeout(()=>l(null),2500)},[]),[R,me]=r.useState({columns:[],sort:{field:"createdAt",direction:"desc"},density:"normal",pageSize:10,titleDisplay:"avatar",showSidebar:!0,sidebarWidth:280,viewMode:null,enabledViews:["table","kanban","notes"]}),[Y,pe]=r.useState({page:1,limit:10,total:0,pages:0}),Ce=r.useRef(null),n=r.useCallback(async()=>{var s,f;try{ee(!0),m(null);const y=new URLSearchParams({limit:1e4,sort:`${R.sort.field}:${R.sort.direction}`}),W=await fetch(`/account/${i}/api/entity/${d}/views/${a}/records?${y}`,{credentials:"include"});if(!W.ok)throw new Error(`HTTP ${W.status}`);const h=await W.json();if(u(h.records||[]),k(h.records||[]),h.entity&&(H(h.entity),h.entity.icon&&o(h.entity.icon)),h.filters&&ne(h.filters),h.preferences)if(me(Q=>{var q,te;return{...Q,...h.preferences,columns:(q=h.preferences.columns)!=null&&q.length?h.preferences.columns:((te=h.columns)==null?void 0:te.map(se=>({id:se.id,visible:!0})))||[]}}),h.preferences.pageSize&&pe(Q=>({...Q,limit:h.preferences.pageSize})),h.preferences.viewMode&&U(h.preferences.viewMode),(s=h.preferences.columns)!=null&&s.length&&((f=h.columns)!=null&&f.length)){const Q=[];h.preferences.columns.forEach(q=>{const te=h.columns.find(se=>se.id===q.id);te&&Q.push(te)}),h.columns.forEach(q=>{Q.find(te=>te.id===q.id)||Q.push(q)}),D(Q)}else D(h.columns||[]);else h.columns&&(D(h.columns||[]),me(Q=>({...Q,columns:h.columns.map(q=>({id:q.id,visible:!0}))})))}catch(y){console.error("[RecordsGrid] Fetch error:",y),m(y.message)}finally{ee(!1)}},[i,d,a,R.sort]),M=r.useCallback(async()=>{try{const s=await fetch(`/account/${i}/api/entity/${d}/saved-views`,{credentials:"include"});if(s.ok){const f=await s.json();T(f.views||[])}}catch(s){console.error("[RecordsGrid] Fetch saved views error:",s)}},[i,d]),le=r.useCallback(async({name:s,color:f,filters:y,fieldFilters:W})=>{try{const h=await fetch(`/account/${i}/api/entity/${d}/saved-views`,{method:"POST",headers:{"Content-Type":"application/json"},credentials:"include",body:JSON.stringify({name:s,color:f,filters:y,fieldFilters:W})});if(h.ok){const Q=await h.json();T(q=>[...q,Q.view]),re(Q.view._id)}}catch(h){console.error("[RecordsGrid] Create saved view error:",h)}},[i,d]),de=r.useCallback(async s=>{try{(await fetch(`/account/${i}/api/entity/${d}/saved-views/${s}`,{method:"DELETE",credentials:"include"})).ok&&(T(y=>y.filter(W=>W._id!==s)),z===s&&(re(null),E({}),pe(y=>({...y,page:1}))))}catch(f){console.error("[RecordsGrid] Delete saved view error:",f)}},[i,d,z]),ve=r.useCallback(async(s,f)=>{try{(await fetch(`/account/${i}/api/entity/${d}/saved-views/${s}`,{method:"PUT",headers:{"Content-Type":"application/json"},credentials:"include",body:JSON.stringify({name:f})})).ok&&T(W=>W.map(h=>h._id===s?{...h,name:f}:h))}catch(y){console.error("[RecordsGrid] Rename saved view error:",y)}},[i,d]),ye=r.useCallback(async(s,f,y,W,h)=>{var Q;try{const q={filters:f,fieldFilters:y||[]};if(W&&(q.name=W),h&&(q.color=h),(await fetch(`/account/${i}/api/entity/${d}/saved-views/${s}`,{method:"PUT",headers:{"Content-Type":"application/json"},credentials:"include",body:JSON.stringify(q)})).ok){const se=JSON.parse(JSON.stringify(f||{})),xe=JSON.parse(JSON.stringify(y||[]));T(be=>be.map(Le=>{if(Le._id!==s)return Le;const Ie={...Le,filters:se,fieldFilters:xe};return W&&(Ie.name=W),h&&(Ie.color=h),Ie}));const fe=W||((Q=Z.find(be=>be._id===s))==null?void 0:Q.name)||"Vue";X(`Vue "${fe}" mise à jour`)}else X("Erreur lors de la mise à jour","error")}catch(q){console.error("[RecordsGrid] Update saved view error:",q),X("Erreur lors de la mise à jour","error")}},[i,d,Z,X]),ue=r.useCallback(s=>{if(!s){re(null),E({}),L([]),pe(y=>({...y,page:1}));return}const f=Z.find(y=>y._id===s);f&&(re(s),E(JSON.parse(JSON.stringify(f.filters||{}))),L(JSON.parse(JSON.stringify(f.fieldFilters||[]))),pe(y=>({...y,page:1})))},[Z]);r.useEffect(()=>{n(),M()},[]);const ke=r.useMemo(()=>{if(!$.length)return[];const{field:s,direction:f}=R.sort,y=f==="asc"?1:-1;return[...$].sort((W,h)=>{let Q,q;if(s==="title")Q=(W.referenceTitle||W.title||"").toLowerCase(),q=(h.referenceTitle||h.title||"").toLowerCase();else if(s==="createdAt"||s==="updatedAt")Q=new Date(W[s]||0).getTime(),q=new Date(h[s]||0).getTime();else{const te=(W.customFields||[]).find(xe=>{var be;const fe=((be=xe.field_id)==null?void 0:be._id)||xe.field_id;return(fe==null?void 0:fe.toString())===s}),se=(h.customFields||[]).find(xe=>{var be;const fe=((be=xe.field_id)==null?void 0:be._id)||xe.field_id;return(fe==null?void 0:fe.toString())===s});Q=((te==null?void 0:te.value)||"").toString().toLowerCase(),q=((se==null?void 0:se.value)||"").toString().toLowerCase()}return Q<q?-1*y:Q>q?1*y:0})},[$,R.sort.field,R.sort.direction]),we=r.useMemo(()=>ke.map(s=>({...s,_searchIndex:[s.title||"",s.referenceTitle||"",s.computedTitle||"",...(s.customFields||[]).map(f=>f.value||"")].join(" ").toLowerCase()})),[ke]),ae=r.useCallback((s,f,y,W)=>{let h=s;if(f&&f.trim()){const q=f.toLowerCase();h=h.filter(te=>te._searchIndex.includes(q))}const Q=Object.keys(y).filter(q=>q!=="__favourites");return Q.length>0&&(h=h.filter(q=>{const te=q.classificationValues||[];return Q.every(se=>{const xe=y[se];return!xe||xe.length===0?!0:te.some(fe=>{var be,Le;return((be=fe.classificationId)==null?void 0:be.toString())===se&&xe.includes((Le=fe.optionId)==null?void 0:Le.toString())})})})),W&&W.length>0&&(h=h.filter(q=>{const te=[[W[0]]];for(let se=1;se<W.length;se++)(W[se].logic||"AND")==="OR"?te.push([W[se]]):te[te.length-1].push(W[se]);return te.some(se=>se.every(xe=>{const fe=Pt(q,xe.fieldId);return Ht(fe,xe)}))})),h},[]),je=r.useCallback(s=>{var y;const f=typeof s=="string"?s:((y=s==null?void 0:s.target)==null?void 0:y.value)||"";V(f),pe(W=>({...W,page:1}))},[]),Me=r.useCallback(s=>{E(s),pe(f=>({...f,page:1}))},[]),Ne=r.useCallback(s=>{L(s),pe(f=>({...f,page:1}))},[]);r.useEffect(()=>{const s=ae(we,P,b,B);k(s)},[we,P,b,B,ae]),r.useEffect(()=>{const s=(Y.page-1)*Y.limit,f=s+Y.limit,y=x.slice(s,f);I(y),pe(W=>({...W,total:x.length,pages:Math.ceil(x.length/Y.limit)}))},[x,Y.page,Y.limit]);const Se=r.useCallback(async s=>{try{await fetch(`/account/${i}/api/user/view-preferences`,{method:"POST",headers:{"Content-Type":"application/json"},credentials:"include",body:JSON.stringify({viewId:a,preferences:s})})}catch(f){console.error("[RecordsGrid] Save preferences error:",f)}},[i,a]),ge=r.useCallback((s,f)=>{const y={...R,[s]:f};me(y),Se(y),s==="pageSize"&&pe(W=>({...W,limit:f,page:1}))},[R,Se]),qe=r.useCallback(s=>{U(s),me(f=>{const y={...f,viewMode:s};return Se(y),y})},[Se]),Re=r.useCallback(s=>{pe(f=>({...f,page:s}))},[]),Xe=r.useCallback((s,f,y)=>{if(y&&j.current!==null&&j.current!==f){const W=Math.min(j.current,f),h=Math.max(j.current,f);v(Q=>{const q=new Set(Q);for(let te=W;te<=h;te++)p[te]&&q.add(p[te]._id);return q})}else v(W=>{const h=new Set(W);return h.has(s)?h.delete(s):h.add(s),h});j.current=f},[p]),Qe=r.useCallback(()=>{v(s=>{const f=p.map(h=>h._id),y=f.every(h=>s.has(h)),W=new Set(s);return y?f.forEach(h=>W.delete(h)):f.forEach(h=>W.add(h)),W})},[p]),Ge=r.useCallback(()=>{v(s=>{const f=x.map(y=>y._id);return s.size===f.length?new Set:new Set(f)})},[x]),et=r.useCallback(()=>{v(new Set)},[]),tt=r.useMemo(()=>p.length===0?!1:p.every(s=>F.has(s._id)),[p,F]),rt=r.useCallback(async()=>{if(!(F.size===0||!(typeof Swal<"u"?await Swal.fire({title:"Confirmer la suppression",html:`<p>Vous allez supprimer <strong>${F.size}</strong> enregistrement(s).</p><p style="color:#e7515a;font-size:13px;margin-top:8px;">Cette action est irréversible.</p>`,icon:"warning",showCancelButton:!0,confirmButtonColor:"#e7515a",cancelButtonText:"Annuler",confirmButtonText:"Supprimer"}).then(f=>f.isConfirmed):confirm(`Supprimer ${F.size} enregistrement(s) ?`)))){S(!0);try{const y=await(await fetch(`/account/${i}/record/api/bulk-delete`,{method:"POST",headers:{"Content-Type":"application/json"},credentials:"include",body:JSON.stringify({ids:[...F]})})).json();y.success?(u(W=>W.filter(h=>!F.has(h._id))),v(new Set),X(`${y.deletedCount} enregistrement(s) supprimé(s)`)):X(y.error||"Erreur lors de la suppression","error")}catch(f){console.error("[RecordsGrid] Bulk delete error:",f),X("Erreur lors de la suppression","error")}finally{S(!1)}}},[F,i,X]),st=r.useCallback((s,f)=>{D(y=>{const W=y.findIndex(se=>se.id===s),h=y.findIndex(se=>se.id===f);if(W===-1||h===-1)return y;const Q=[...y],[q]=Q.splice(W,1);Q.splice(h,0,q);const te=Q.map(se=>R.columns.find(fe=>fe.id===se.id)||{id:se.id,visible:!0});return ge("columns",te),Q})},[R.columns,ge]),Oe=r.useMemo(()=>{switch(R.density){case"compact":return 36;case"comfortable":return 56;default:return 44}},[R.density]),De=it({count:p.length,getScrollElement:()=>Ce.current,estimateSize:()=>Oe,overscan:10});r.useEffect(()=>{De.measure()},[Oe,De]);const at=r.useMemo(()=>{var y;let s;(y=R.columns)!=null&&y.length?s=w.filter(W=>{const h=R.columns.find(Q=>Q.id===W.id);return h?h.visible!==!1:!0}):s=w;const f=s.findIndex(W=>W.id==="actions");if(f>-1&&f<s.length-1){const[W]=s.splice(f,1);s=[...s,W]}return s},[w,R.columns]);return O&&p.length===0?e.jsx("div",{className:"flex items-center justify-center h-64",children:e.jsx("div",{className:"animate-spin rounded-full h-8 w-8 border-b-2 border-primary"})}):G&&p.length===0?e.jsx("div",{className:"flex items-center justify-center h-64 text-danger",children:e.jsxs("span",{children:["Erreur: ",G]})}):e.jsxs("div",{className:"relative flex h-full gap-5 sm:min-h-0",children:[e.jsx(Vt,{entityName:N,entityNamePlural:_,entityIcon:c,accountNumber:i,entitySlug:C,showSidebar:R.showSidebar!==!1,onToggleSidebar:()=>ge("showSidebar",!R.showSidebar),filters:oe,activeFilters:b,onFilterChange:Me,columns:w,fieldFilters:B,onFieldFiltersChange:Ne,allRecords:$,sidebarWidth:R.sidebarWidth,onSidebarWidthChange:s=>ge("sidebarWidth",s)}),e.jsxs("div",{className:"panel p-4 flex-1 flex flex-col overflow-hidden h-full",children:[e.jsx(yt,{searchQuery:P,onSearch:je,columns:w,preferences:R,onPreferencesChange:ge,loading:O,accountNumber:i,entitySlug:C,viewId:a,showSidebar:R.showSidebar!==!1,onToggleSidebar:()=>ge("showSidebar",!R.showSidebar),activeView:J,onViewChange:qe,enabledViews:R.enabledViews||["table","kanban","notes"],onEnabledViewsChange:s=>ge("enabledViews",s),hasActiveFilters:Object.keys(b).filter(s=>s!=="__favourites").length>0||B.length>0,onOpenSaveView:()=>ce(!0)}),e.jsx(At,{savedViews:Z,activeViewId:z,onSelectView:ue,onCreateView:le,onDeleteView:de,onRenameView:ve,onUpdateViewFilters:ye,hasActiveFilters:Object.keys(b).filter(s=>s!=="__favourites").length>0||B.length>0,activeFilters:b,fieldFilters:B,sidebarFilters:oe,columns:w,externalOpenCreate:ie,onCloseExternalCreate:()=>ce(!1)}),e.jsx("div",{className:"flex-1 flex flex-col overflow-hidden mt-4",children:J==="kanban"?e.jsx(Lt,{records:x,columns:w,accountNumber:i,entitySlug:C,viewId:a,entityData:K}):J==="notes"?e.jsx(Tt,{records:x,accountNumber:i,entitySlug:C}):e.jsxs("div",{className:"dataTable-wrapper flex-1 flex flex-col overflow-hidden",children:[e.jsx("div",{className:"dataTable-container flex-1 overflow-auto",ref:Ce,children:e.jsx(wt,{records:p,columns:at,virtualizer:De,sort:R.sort,onSort:s=>{const f=R.sort.field===s&&R.sort.direction==="asc"?"desc":"asc";ge("sort",{field:s,direction:f})},onColumnReorder:st,density:R.density,titleDisplay:R.titleDisplay||"avatar",entityIcon:c,accountNumber:i,entitySlug:C,selectedIds:F,onToggleSelect:Xe,onSelectAll:Qe,allPageSelected:tt,showCheckboxes:R.showCheckboxes!==!1})}),e.jsxs("div",{className:"dataTable-bottom flex items-center justify-between border-t pt-4 dark:border-gray-800",children:[e.jsxs("div",{className:"dataTable-info text-gray-500 dark:text-gray-400",children:["Affichage de ",(Y.page-1)*Y.limit+1," à ",Math.min(Y.page*Y.limit,Y.total)," sur ",Y.total]}),e.jsx("nav",{className:"dataTable-pagination",children:e.jsxs("ul",{className:"inline-flex items-center space-x-1 rtl:space-x-reverse",children:[e.jsx("li",{children:e.jsx("button",{onClick:()=>Re(Y.page-1),disabled:Y.page<=1,className:"flex justify-center font-semibold p-2 rounded-full transition bg-white-light text-dark hover:text-white hover:bg-primary dark:text-white-light dark:bg-[#191e3a] dark:hover:bg-primary disabled:opacity-50",children:"«"})}),Array.from({length:Math.min(Y.pages,5)},(s,f)=>{let y;return Y.pages<=5||Y.page<=3?y=f+1:Y.page>=Y.pages-2?y=Y.pages-4+f:y=Y.page-2+f,e.jsx("li",{children:e.jsx("button",{onClick:()=>Re(y),className:`flex justify-center font-semibold px-3.5 py-2 rounded-full transition ${y===Y.page?"bg-primary text-white dark:bg-primary dark:text-white-light":"bg-white-light text-dark hover:text-white hover:bg-primary dark:text-white-light dark:bg-[#191e3a] dark:hover:bg-primary"}`,children:y})},y)}),e.jsx("li",{children:e.jsx("button",{onClick:()=>Re(Y.page+1),disabled:Y.page>=Y.pages,className:"flex justify-center font-semibold p-2 rounded-full transition bg-white-light text-dark hover:text-white hover:bg-primary dark:text-white-light dark:bg-[#191e3a] dark:hover:bg-primary disabled:opacity-50",children:"»"})})]})})]})]})})]}),F.size>0&&e.jsxs("div",{className:"bulk-action-bar",style:{position:"fixed",bottom:"24px",left:"50%",transform:"translateX(-50%)",zIndex:99999,display:"flex",alignItems:"center",gap:"12px",padding:"10px 20px",borderRadius:"14px",background:"linear-gradient(135deg, #1b2e4b 0%, #0e1726 100%)",boxShadow:"0 8px 32px rgba(0,0,0,0.3), 0 0 0 1px rgba(67,97,238,0.2)",animation:"bulkBarSlideUp 0.3s cubic-bezier(0.16,1,0.3,1)",backdropFilter:"blur(12px)"},children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"8px"},children:[e.jsx("div",{style:{width:28,height:28,borderRadius:"8px",background:"rgba(67,97,238,0.2)",color:"#4361ee",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"12px",fontWeight:700},children:F.size}),e.jsxs("span",{style:{color:"#e0e6ed",fontSize:"13px",fontWeight:500,whiteSpace:"nowrap"},children:["sélectionné",F.size>1?"s":""]})]}),e.jsx("div",{style:{width:1,height:24,background:"rgba(255,255,255,0.1)"}}),F.size<x.length&&e.jsxs("button",{onClick:Ge,style:{padding:"6px 12px",borderRadius:"8px",border:"1px solid rgba(67,97,238,0.3)",background:"rgba(67,97,238,0.1)",color:"#93b4fd",fontSize:"12px",fontWeight:600,cursor:"pointer",transition:"all 0.15s",whiteSpace:"nowrap"},onMouseEnter:s=>{s.target.style.background="rgba(67,97,238,0.2)",s.target.style.color="#b8cffe"},onMouseLeave:s=>{s.target.style.background="rgba(67,97,238,0.1)",s.target.style.color="#93b4fd"},children:["Tout sélectionner (",x.length,")"]}),e.jsx("div",{style:{width:1,height:24,background:"rgba(255,255,255,0.1)"}}),e.jsxs("button",{onClick:rt,disabled:g,style:{display:"flex",alignItems:"center",gap:"6px",padding:"6px 14px",borderRadius:"8px",border:"none",background:"rgba(231,81,90,0.15)",color:"#ff6b6b",fontSize:"12px",fontWeight:600,cursor:g?"wait":"pointer",transition:"all 0.15s",whiteSpace:"nowrap",opacity:g?.6:1},onMouseEnter:s=>{g||(s.target.style.background="rgba(231,81,90,0.25)",s.target.style.color="#ff8a8a")},onMouseLeave:s=>{s.target.style.background="rgba(231,81,90,0.15)",s.target.style.color="#ff6b6b"},children:[e.jsxs("svg",{viewBox:"0 0 24 24",fill:"none",style:{width:14,height:14},children:[e.jsx("path",{d:"M20.5 6H3.5",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"}),e.jsx("path",{d:"M18.833 8.5L18.373 15.4C18.196 18.054 18.108 19.381 17.243 20.19C16.378 21 15.048 21 12.387 21H11.613C8.952 21 7.622 21 6.757 20.19C5.892 19.381 5.804 18.054 5.627 15.4L5.167 8.5",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"})]}),g?"Suppression...":"Supprimer"]}),e.jsx("div",{style:{width:1,height:24,background:"rgba(255,255,255,0.1)"}}),e.jsx("button",{onClick:et,style:{width:28,height:28,borderRadius:"8px",border:"none",background:"rgba(255,255,255,0.08)",color:"#888ea8",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",transition:"all 0.15s"},onMouseEnter:s=>{s.target.style.background="rgba(255,255,255,0.15)",s.target.style.color="#e0e6ed"},onMouseLeave:s=>{s.target.style.background="rgba(255,255,255,0.08)",s.target.style.color="#888ea8"},title:"Désélectionner tout",children:e.jsx("svg",{viewBox:"0 0 24 24",fill:"none",style:{width:14,height:14},children:e.jsx("path",{d:"M18 6L6 18M6 6L18 18",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round"})})})]}),he&&e.jsxs("div",{style:{position:"fixed",bottom:F.size>0?"80px":"24px",right:"24px",zIndex:99999,padding:"10px 20px",borderRadius:"10px",fontSize:"13px",fontWeight:500,color:"#fff",background:he.type==="error"?"#e7515a":"#00ab55",boxShadow:"0 4px 20px rgba(0,0,0,0.15)",animation:"toastSlideIn 0.25s ease-out",display:"flex",alignItems:"center",gap:"8px",transition:"bottom 0.3s ease"},children:[e.jsx("svg",{viewBox:"0 0 24 24",fill:"none",style:{width:16,height:16,flexShrink:0},children:he.type==="error"?e.jsx("path",{d:"M12 8V12M12 16H12.01M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"}):e.jsx("path",{d:"M5 13L9 17L19 7",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round"})}),he.message]}),e.jsx("style",{children:`
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
            `})]})}function Ue(){document.querySelectorAll('[data-island="records-grid"]').forEach(t=>{if(t.dataset.mounted==="1")return;t.dataset.mounted="1";const i={accountId:t.dataset.accountId,accountNumber:t.dataset.accountNumber,entityId:t.dataset.entityId,viewId:t.dataset.viewId,entityName:t.dataset.entityName||"Records",entityNamePlural:t.dataset.entityNamePlural||"",entitySlug:t.dataset.entitySlug||"records"};console.log("[RecordsGrid Island] Mounting:",i),ot(t).render(e.jsx(We.StrictMode,{children:e.jsx(Zt,{...i})}))})}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",Ue):Ue();
