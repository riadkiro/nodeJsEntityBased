import{r,j as e,a as he,R as we,c as Fe}from"./chunks/client-CkWOIrXP.js";import{u as Oe}from"./chunks/index-CjVSFo3p.js";import{u as ze,a as ve,D as Pe,c as He,b as Ze,d as Ue,s as Ke,K as Ye,T as qe,M as Je,e as Qe,S as Xe,v as Ge,f as et,C as tt}from"./chunks/sortable.esm-DQ9-A8Dw.js";const Se=[{id:"table",label:"Tableau",icon:e.jsxs("svg",{viewBox:"0 0 24 24",fill:"none",className:"h-4 w-4",children:[e.jsx("path",{d:"M3 7H21",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"}),e.jsx("path",{d:"M3 12H21",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"}),e.jsx("path",{d:"M3 17H21",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"})]})},{id:"kanban",label:"Kanban",icon:e.jsxs("svg",{viewBox:"0 0 24 24",fill:"none",className:"h-4 w-4",children:[e.jsx("rect",{x:"3",y:"3",width:"5",height:"18",rx:"1",stroke:"currentColor",strokeWidth:"1.5"}),e.jsx("rect",{x:"10",y:"3",width:"5",height:"12",rx:"1",stroke:"currentColor",strokeWidth:"1.5"}),e.jsx("rect",{x:"17",y:"3",width:"4",height:"15",rx:"1",stroke:"currentColor",strokeWidth:"1.5"})]})},{id:"notes",label:"Notes",icon:e.jsxs("svg",{viewBox:"0 0 24 24",fill:"none",className:"h-4 w-4",children:[e.jsx("path",{d:"M2 12C2 7.28595 2 4.92893 3.46447 3.46447C4.92893 2 7.28595 2 12 2C16.714 2 19.0711 2 20.5355 3.46447C22 4.92893 22 7.28595 22 12C22 16.714 22 19.0711 20.5355 20.5355C19.0711 22 16.714 22 12 22C7.28595 22 4.92893 22 3.46447 20.5355C2 19.0711 2 16.714 2 12Z",stroke:"currentColor",strokeWidth:"1.5"}),e.jsx("path",{opacity:"0.5",d:"M2 12H22",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"}),e.jsx("path",{opacity:"0.5",d:"M12 2V22",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"})]})}];function rt({searchQuery:t,onSearch:i,columns:o,preferences:a,onPreferencesChange:f,loading:v,accountNumber:g,entitySlug:C,viewId:c,showSidebar:m,onToggleSidebar:y,activeView:p,onViewChange:W,enabledViews:N=["table","kanban","notes"],onEnabledViewsChange:D,hasActiveFilters:A=!1,onOpenSaveView:J}){var X,F,ae;const[E,u]=r.useState(!1),[j,B]=r.useState(!1),[b,S]=r.useState(!1),[U,T]=r.useState(!1),[d,k]=r.useState(""),Q=r.useRef(null),w=r.useRef(null),z=r.useRef(null),te=r.useRef(null),G=r.useRef(null),P=r.useRef(null),se=r.useRef(null),x=r.useRef(null),V=()=>{u(!1),B(!1),S(!1),T(!1)};r.useEffect(()=>{const l=Z=>{Z.key==="Escape"&&V()};return document.addEventListener("keydown",l),()=>document.removeEventListener("keydown",l)},[]);const H=(l,Z,q,ee)=>{r.useEffect(()=>{const de=le=>{l&&Z.current&&!Z.current.contains(le.target)&&q.current&&!q.current.contains(le.target)&&ee(!1)};return l&&setTimeout(()=>document.addEventListener("mousedown",de),0),()=>document.removeEventListener("mousedown",de)},[l])};H(E,G,Q,u),H(j,P,w,B),H(b,se,z,S),H(U,x,te,T);const s=l=>{if(l==="table")return;const Z=N.includes(l)?N.filter(q=>q!==l):[...N,l];D(Z),p===l&&!Z.includes(l)&&W("table")},h=Se.filter(l=>N.includes(l.id)),I=l=>{const Z=a.columns.some(ee=>ee.id===l);let q;Z?q=a.columns.map(ee=>ee.id===l?{...ee,visible:!ee.visible}:ee):q=[...a.columns,{id:l,visible:!1}],f("columns",q)},R=l=>{if(!(l!=null&&l.current))return{top:0,right:0};const Z=l.current.getBoundingClientRect();return{top:Z.bottom+8,right:window.innerWidth-Z.right}},M=d.trim()?o.filter(l=>l.name.toLowerCase().includes(d.toLowerCase())):o;return e.jsxs("div",{className:"dataTable-top flex items-center mb-0 justify-between gap-2",children:[e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsxs("a",{href:`/account/${g}/record/${C}/add`,className:"btn-add-expandable block rounded-full p-2 bg-white-light/40 hover:bg-white-light/90 hover:text-primary dark:bg-dark/40 dark:hover:bg-dark/60",title:"Ajouter",children:[e.jsx("svg",{className:"btn-add-icon",viewBox:"0 0 24 24",fill:"none",children:e.jsx("path",{d:"M12 5V19M5 12H19",stroke:"currentColor",strokeWidth:"2.5",strokeLinecap:"round"})}),e.jsx("span",{className:"btn-add-label",children:"Ajouter"})]}),e.jsxs("div",{className:"dataTable-search relative w-64",style:{marginLeft:0},children:[e.jsxs("svg",{className:"absolute left-4 top-1/2 ml-2 -translate-y-1/2 h-4 w-4 text-gray-400",viewBox:"0 0 24 24",fill:"none",children:[e.jsx("circle",{cx:"11",cy:"11",r:"8",stroke:"currentColor",strokeWidth:"1.5"}),e.jsx("path",{d:"M16.5 16.5L21 21",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"})]}),e.jsx("input",{type:"text",value:t,onChange:l=>i(l.target.value),placeholder:"Rechercher...",className:"dataTable-input form-input w-full pl-11 pr-10",style:{"padding-left":"33px"}}),v&&e.jsx("div",{className:"absolute right-3 top-1/2 -translate-y-1/2",children:e.jsx("div",{className:"animate-spin rounded-full h-4 w-4 border-b-2 border-primary"})})]})]}),e.jsxs("div",{className:"flex items-center gap-2",children:[h.map(l=>e.jsx("button",{type:"button",onClick:()=>W(l.id),title:l.label,className:`block rounded-full p-2 transition-all ${p===l.id?"bg-primary/20 text-primary":"bg-white-light/40 hover:bg-white-light/90 hover:text-primary dark:bg-dark/40 dark:hover:bg-dark/60"}`,children:l.icon},l.id)),e.jsx("button",{ref:te,type:"button",onClick:()=>{T(!U),u(!1),B(!1),S(!1)},className:`block rounded-full p-2 transition-all ${U?"bg-primary/20 text-primary":"bg-white-light/40 hover:bg-white-light/90 hover:text-primary dark:bg-dark/40 dark:hover:bg-dark/60"}`,title:"Configurer les vues",children:e.jsxs("svg",{className:"h-4 w-4",viewBox:"0 0 24 24",fill:"none",children:[e.jsx("circle",{cx:"12",cy:"12",r:"3",stroke:"currentColor",strokeWidth:"1.5"}),e.jsx("path",{d:"M12 2V4M12 20V22M2 12H4M20 12H22M4.93 4.93L6.34 6.34M17.66 17.66L19.07 19.07M4.93 19.07L6.34 17.66M17.66 6.34L19.07 4.93",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"})]})}),e.jsx("div",{className:"w-px h-5 bg-gray-200 dark:bg-gray-700 mx-0.5"}),e.jsx("button",{type:"button",onClick:J,className:`block rounded-full p-2 transition-all ${A?"bg-primary/20 text-primary":"bg-white-light/40 hover:bg-white-light/90 hover:text-primary dark:bg-dark/40 dark:hover:bg-dark/60"}`,title:"Filtrer & enregistrer la vue",children:e.jsx("svg",{className:"h-4 w-4",viewBox:"0 0 24 24",fill:"none",children:e.jsx("path",{d:"M22 3H2L10 12.46V19L14 21V12.46L22 3Z",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round"})})}),p==="table"&&(()=>{var Z,q;const l=((Z=a.sort)==null?void 0:Z.field)!=="createdAt"||((q=a.sort)==null?void 0:q.direction)!=="desc";return e.jsx("button",{ref:w,type:"button",onClick:()=>{B(!j),u(!1),S(!1),T(!1)},className:`block rounded-full p-2 transition-all ${j||l?"bg-primary/20 text-primary":"bg-white-light/40 hover:bg-white-light/90 hover:text-primary dark:bg-dark/40 dark:hover:bg-dark/60"}`,title:"Trier",children:e.jsxs("svg",{className:"h-4 w-4",viewBox:"0 0 24 24",fill:"none",children:[e.jsx("path",{d:"M16 18L16 6M16 6L20 10M16 6L12 10",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round"}),e.jsx("path",{d:"M8 6L8 18M8 18L12 14M8 18L4 14",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round"})]})})})(),e.jsx("button",{ref:Q,type:"button",onClick:()=>{u(!E),B(!1),S(!1),T(!1)},className:`block rounded-full p-2 transition-all ${E?"bg-primary/20 text-primary":"bg-white-light/40 hover:bg-white-light/90 hover:text-primary dark:bg-dark/40 dark:hover:bg-dark/60"}`,title:"Mode d'affichage",children:e.jsxs("svg",{className:"h-4 w-4",viewBox:"0 0 24 24",fill:"none",children:[e.jsx("path",{d:"M3 7H21",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"}),e.jsx("path",{d:"M6 12H18",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"}),e.jsx("path",{d:"M10 17H14",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"})]})}),p==="table"&&e.jsx("button",{ref:z,type:"button",onClick:()=>{S(!b),u(!1),B(!1),T(!1)},className:`block rounded-full p-2 transition-all ${b?"bg-primary/20 text-primary":"bg-white-light/40 hover:bg-white-light/90 hover:text-primary dark:bg-dark/40 dark:hover:bg-dark/60"}`,title:"Colonnes visibles",children:e.jsxs("svg",{className:"h-4 w-4",viewBox:"0 0 24 24",fill:"none",children:[e.jsx("path",{d:"M9 3H4C3.44772 3 3 3.44772 3 4V11C3 11.5523 3.44772 12 4 12H9C9.55228 12 10 11.5523 10 11V4C10 3.44772 9.55228 3 9 3Z",stroke:"currentColor",strokeWidth:"1.5"}),e.jsx("path",{d:"M20 3H15C14.4477 3 14 3.44772 14 4V7C14 7.55228 14.4477 8 15 8H20C20.5523 8 21 7.55228 21 7V4C21 3.44772 20.5523 3 20 3Z",stroke:"currentColor",strokeWidth:"1.5"}),e.jsx("path",{d:"M20 12H15C14.4477 12 14 12.4477 14 13V20C14 20.5523 14.4477 21 15 21H20C20.5523 21 21 20.5523 21 20V13C21 12.4477 20.5523 12 20 12Z",stroke:"currentColor",strokeWidth:"1.5"}),e.jsx("path",{d:"M9 16H4C3.44772 16 3 16.4477 3 17V20C3 20.5523 3.44772 21 4 21H9C9.55228 21 10 20.5523 10 20V17C10 16.4477 9.55228 16 9 16Z",stroke:"currentColor",strokeWidth:"1.5"})]})}),e.jsxs("button",{type:"button",onClick:y,className:"btn-sidebar-toggle block rounded-full p-2 bg-white-light/40 hover:bg-white-light/90 hover:text-primary dark:bg-dark/40 dark:hover:bg-dark/60",title:m?"Masquer le panneau":"Afficher le panneau",children:[e.jsxs("svg",{className:"btn-sidebar-icon",viewBox:"0 0 24 24",fill:"none",children:[e.jsx("rect",{x:"3",y:"3",width:"18",height:"18",rx:"2",stroke:"currentColor",strokeWidth:"1.5"}),e.jsx("path",{d:"M9 3V21",stroke:"currentColor",strokeWidth:"1.5"})]}),e.jsx("span",{className:"btn-sidebar-label",children:m?"Masquer":"Panneau"})]})]}),j&&he.createPortal(e.jsxs(e.Fragment,{children:[e.jsx("div",{className:"fixed inset-0",style:{zIndex:9998},onClick:()=>B(!1)}),e.jsxs("div",{ref:P,className:"fixed rounded-xl shadow-xl p-4 w-72 bg-white dark:bg-[#0e1726] border border-gray-100 dark:border-white/10",style:{zIndex:9999,top:R(w).top,right:R(w).right,animation:"popoverSlide 0.15s ease-out"},children:[e.jsx("div",{className:"text-xs font-medium text-gray-500 dark:text-white-dark mb-2",children:"Trier par"}),e.jsxs("div",{className:"flex gap-2",children:[e.jsxs("select",{value:((X=a.sort)==null?void 0:X.field)||"createdAt",onChange:l=>f("sort",{...a.sort,field:l.target.value}),className:"flex-1 px-2 py-1.5 text-xs border border-gray-200 dark:border-white/10 rounded-lg bg-white dark:bg-[#1b2e4b] text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary/50",children:[e.jsx("option",{value:"createdAt",children:"Date de création"}),e.jsx("option",{value:"title",children:"Titre"}),o.filter(l=>l.id!=="title"&&l.id!=="actions").map(l=>e.jsx("option",{value:l.id,children:l.name},l.id))]}),e.jsx("button",{onClick:()=>{var l;return f("sort",{...a.sort,direction:((l=a.sort)==null?void 0:l.direction)==="asc"?"desc":"asc"})},className:"p-1.5 border border-gray-200 dark:border-white/10 rounded-lg bg-white dark:bg-[#1b2e4b] hover:bg-gray-50 dark:hover:bg-[#253b5c] transition-all",title:((F=a.sort)==null?void 0:F.direction)==="asc"?"Croissant":"Décroissant",children:e.jsx("svg",{className:`h-4 w-4 text-gray-600 dark:text-white transition-transform ${((ae=a.sort)==null?void 0:ae.direction)==="asc"?"rotate-180":""}`,viewBox:"0 0 24 24",fill:"none",children:e.jsx("path",{d:"M12 5V19M12 19L6 13M12 19L18 13",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round"})})}),e.jsx("button",{onClick:()=>f("sort",{field:"createdAt",direction:"desc"}),className:"p-1.5 border border-gray-200 dark:border-white/10 rounded-lg bg-white dark:bg-[#1b2e4b] hover:bg-red-50 hover:border-red-300 hover:text-red-500 dark:hover:bg-red-900/20 transition-all",title:"Réinitialiser le tri",children:e.jsxs("svg",{className:"h-4 w-4 text-gray-600 dark:text-white",viewBox:"0 0 24 24",fill:"none",children:[e.jsx("path",{d:"M4.06189 13C4.02104 12.6724 4 12.3387 4 12C4 7.58172 7.58172 4 12 4C14.5006 4 16.7332 5.14727 18.2002 6.94416M19.9381 11C19.979 11.3276 20 11.6613 20 12C20 16.4183 16.4183 20 12 20C9.49944 20 7.26681 18.8527 5.79984 17.0558",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round"}),e.jsx("path",{d:"M15 7H19V3",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round"}),e.jsx("path",{d:"M9 17H5V21",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round"})]})})]})]})]}),document.body),E&&he.createPortal(e.jsxs(e.Fragment,{children:[e.jsx("div",{className:"fixed inset-0",style:{zIndex:9998},onClick:()=>u(!1)}),e.jsxs("div",{ref:G,className:"fixed rounded-xl shadow-xl p-4 w-72 bg-white dark:bg-[#0e1726] border border-gray-100 dark:border-white/10",style:{zIndex:9999,top:R(Q).top,right:R(Q).right,animation:"popoverSlide 0.15s ease-out"},children:[e.jsxs("div",{className:"mb-4",children:[e.jsx("div",{className:"text-xs font-medium text-gray-500 dark:text-white-dark mb-2",children:"Densité"}),e.jsx("div",{className:"flex gap-1",children:["compact","normal","comfortable"].map(l=>e.jsx("button",{onClick:()=>f("density",l),className:`flex-1 px-2 py-1.5 text-xs rounded-lg transition-all ${a.density===l?"bg-primary text-white":"bg-gray-100 dark:bg-dark/40 text-gray-600 dark:text-white-dark/70 hover:bg-gray-200 dark:hover:bg-dark/60"}`,children:l==="compact"?"Compact":l==="normal"?"Normal":"Confort"},l))})]}),e.jsxs("div",{className:"mb-4",children:[e.jsx("div",{className:"text-xs font-medium text-gray-500 dark:text-white-dark mb-2",children:"Lignes par page"}),e.jsx("div",{className:"flex gap-1",children:[10,25,50,100].map(l=>e.jsx("button",{onClick:()=>f("pageSize",l),className:`flex-1 px-2 py-1.5 text-xs rounded-lg transition-all ${a.pageSize===l?"bg-primary text-white":"bg-gray-100 dark:bg-dark/40 text-gray-600 dark:text-white-dark/70 hover:bg-gray-200 dark:hover:bg-dark/60"}`,children:l},l))})]})]})]}),document.body),b&&he.createPortal(e.jsxs(e.Fragment,{children:[e.jsx("div",{className:"fixed inset-0",style:{zIndex:9998},onClick:()=>S(!1)}),e.jsxs("div",{ref:se,className:"fixed rounded-xl shadow-xl p-4 w-64 bg-white dark:bg-[#0e1726] border border-gray-100 dark:border-white/10",style:{zIndex:9999,top:R(z).top,right:R(z).right,animation:"popoverSlide 0.15s ease-out"},children:[e.jsx("div",{className:"text-xs font-medium text-gray-500 dark:text-white-dark mb-2",children:"Colonnes visibles"}),e.jsx("div",{className:"relative mb-2",children:e.jsx("input",{type:"text",value:d,onChange:l=>k(l.target.value),placeholder:"Filtrer...",className:"w-full px-3 py-1.5 text-xs border border-gray-200 dark:border-white/10 rounded-lg bg-white dark:bg-[#1b2e4b] text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary/50"})}),e.jsx("div",{className:"space-y-0.5 max-h-48 overflow-y-auto",children:M.map(l=>{const Z=a.columns.find(ee=>ee.id===l.id),q=Z?Z.visible!==!1:!0;return e.jsxs("label",{className:"flex items-center gap-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 px-2 py-1.5 rounded-lg",children:[e.jsx("input",{type:"checkbox",checked:q,onChange:()=>I(l.id),className:"form-checkbox text-primary w-3.5 h-3.5 rounded"}),e.jsx("span",{className:"text-xs text-gray-700 dark:text-gray-300",children:l.name})]},l.id)})}),e.jsx("div",{className:"border-t border-gray-100 dark:border-white/10 mt-3 mb-2"}),e.jsxs("div",{children:[e.jsx("div",{className:"text-xs font-medium text-gray-500 dark:text-white-dark mb-2",children:"Affichage titre"}),e.jsx("div",{className:"flex gap-1",children:[{value:"avatar",label:"Avatar"},{value:"icon",label:"Icône"},{value:"none",label:"Aucun"}].map(l=>e.jsx("button",{onClick:()=>f("titleDisplay",l.value),className:`flex-1 px-2 py-1.5 text-xs rounded-lg transition-all ${(a.titleDisplay||"avatar")===l.value?"bg-primary text-white":"bg-gray-100 dark:bg-dark/40 text-gray-600 dark:text-white-dark/70 hover:bg-gray-200 dark:hover:bg-dark/60"}`,children:l.label},l.value))})]})]})]}),document.body),U&&he.createPortal(e.jsxs(e.Fragment,{children:[e.jsx("div",{className:"fixed inset-0",style:{zIndex:9998},onClick:()=>T(!1)}),e.jsxs("div",{ref:x,className:"fixed rounded-xl shadow-xl p-4 w-64 bg-white dark:bg-[#0e1726] border border-gray-100 dark:border-white/10",style:{zIndex:9999,top:R(te).top,right:R(te).right,animation:"popoverSlide 0.15s ease-out"},children:[e.jsx("div",{className:"text-xs font-medium text-gray-500 dark:text-white-dark mb-3",children:"Vues disponibles"}),e.jsx("div",{className:"space-y-1",children:Se.map(l=>{const Z=N.includes(l.id),q=l.id==="table";return e.jsxs("label",{className:`flex items-center gap-3 cursor-pointer px-2 py-2 rounded-lg transition-all ${q?"opacity-60 cursor-not-allowed":"hover:bg-gray-50 dark:hover:bg-gray-800"}`,children:[e.jsx("input",{type:"checkbox",checked:Z,onChange:()=>s(l.id),disabled:q,className:"form-checkbox text-primary w-4 h-4 rounded"}),e.jsxs("span",{className:`flex items-center gap-2 text-sm ${Z?"text-gray-700 dark:text-gray-300":"text-gray-400 dark:text-gray-600"}`,children:[l.icon,l.label]})]},l.id)})}),e.jsx("div",{className:"border-t border-gray-100 dark:border-white/10 mt-3 pt-2",children:e.jsx("p",{className:"text-[10px] text-gray-400 dark:text-gray-600",children:"Le tableau est toujours activé par défaut."})})]})]}),document.body),e.jsx("style",{children:`
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
            `})]})}function st({records:t,columns:i,virtualizer:o,sort:a,onSort:f,onColumnReorder:v,density:g,titleDisplay:C,entityIcon:c,accountNumber:m,entitySlug:y}){var u;const[p,W]=r.useState(null),[N,D]=r.useState(null),A=o.getVirtualItems(),J={compact:{rowHeight:36,cellClass:"py-1",fontSize:"text-xs",imageSize:"w-6 h-6",fontWeight:"font-medium"},normal:{rowHeight:44,cellClass:"py-2",fontSize:"text-sm",imageSize:"w-9 h-9",fontWeight:"font-semibold"},comfortable:{rowHeight:56,cellClass:"py-3",fontSize:"text-sm",imageSize:"w-9 h-9",fontWeight:"font-semibold"}},E=J[g]||J.comfortable;return e.jsxs("table",{className:"table-hover whitespace-nowrap dataTable-table w-full",children:[e.jsx("thead",{className:"sticky top-0 bg-white dark:bg-[#1b2e4b] z-10",children:e.jsx("tr",{children:i.map((j,B)=>{const b=(a==null?void 0:a.field)===j.id||j.id==="title"&&(a==null?void 0:a.field)==="title"||j.id==="createdAt"&&(a==null?void 0:a.field)==="createdAt",S=(a==null?void 0:a.direction)||"desc",U=p===j.id,T=N===j.id&&p!==j.id,d=j.id!=="actions";return e.jsx("th",{"data-sortable":j.sortable!==!1?"":void 0,"data-column-id":j.id,onDragEnter:k=>{k.preventDefault(),j.id!=="actions"&&p&&p!==j.id&&D(j.id)},onDragOver:k=>{k.preventDefault()},onDrop:k=>{k.preventDefault(),p&&p!==j.id&&j.id!=="actions"&&v&&v(p,j.id),W(null),D(null)},className:`px-2 ${j.id==="actions"?"sticky right-0 z-20":""} ${U?"opacity-50":""} ${T?"border-l-2 border-l-primary bg-primary/5":""}`,style:{transition:"opacity 0.15s, border-color 0.15s, background 0.15s",...j.id==="actions"?{width:"1%",whiteSpace:"nowrap"}:{}},children:e.jsxs("div",{className:"flex items-center gap-1",children:[d&&e.jsx("span",{draggable:"true",onDragStart:k=>{W(j.id),k.dataTransfer.effectAllowed="move",k.dataTransfer.setData("text/plain",j.id)},onDragEnd:()=>{W(null),D(null)},className:"cursor-grab text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300",children:e.jsxs("svg",{className:"h-3 w-3",viewBox:"0 0 24 24",fill:"currentColor",children:[e.jsx("circle",{cx:"9",cy:"6",r:"1.5"}),e.jsx("circle",{cx:"15",cy:"6",r:"1.5"}),e.jsx("circle",{cx:"9",cy:"12",r:"1.5"}),e.jsx("circle",{cx:"15",cy:"12",r:"1.5"}),e.jsx("circle",{cx:"9",cy:"18",r:"1.5"}),e.jsx("circle",{cx:"15",cy:"18",r:"1.5"})]})}),j.sortable!==!1?e.jsxs("a",{href:"#",className:"dataTable-sorter flex items-center gap-1",draggable:"false",onClick:k=>{k.preventDefault(),f(j.id)},children:[j.name,b&&e.jsx("svg",{className:`h-3 w-3 text-primary transition-transform ${S==="asc"?"rotate-180":""}`,viewBox:"0 0 24 24",fill:"none",children:e.jsx("path",{d:"M12 5V19M12 19L6 13M12 19L18 13",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round"})})]}):j.name]})},j.id)})})}),e.jsxs("tbody",{children:[A.length>0&&A[0].start>0&&e.jsx("tr",{children:e.jsx("td",{colSpan:i.length,style:{height:A[0].start,padding:0}})}),A.map(j=>{const B=t[j.index];if(!B)return null;const b={compact:"4px 8px",normal:"8px 12px",comfortable:"12px 12px"}[g]||"12px 12px";return e.jsx("tr",{"data-index":j.index,ref:o.measureElement,style:{minHeight:E.rowHeight},children:i.map(S=>e.jsx("td",{className:`${E.fontSize} ${S.id==="actions"?"sticky right-0 bg-white dark:bg-gray-900":""}`,style:{padding:b,...S.id==="actions"?{width:"1%",whiteSpace:"nowrap"}:{}},children:at(B,S,m,y,E,C,c)},S.id))},B._id)}),A.length>0&&e.jsx("tr",{children:e.jsx("td",{colSpan:i.length,style:{height:Math.max(0,o.getTotalSize()-(((u=A[A.length-1])==null?void 0:u.end)||0)),padding:0}})})]})]})}function at(t,i,o,a,f,v,g){var C,c;switch(i.id){case"title":{const m=t.referenceTitle||t.title||"Sans titre";m.charAt(0).toUpperCase();const y=Math.abs(m.charCodeAt(0)||65)%35+1,p=t.image||`/assets/images/profile-${y}.jpeg`;return e.jsxs("div",{className:"flex items-center gap-2",children:[v==="avatar"&&e.jsx("img",{src:p,alt:m,className:`${f.imageSize} rounded-full max-w-none`}),v==="icon"&&g&&e.jsx("div",{className:`${f.imageSize} rounded-lg max-w-none flex items-center justify-center bg-primary/10 text-primary shrink-0`,children:e.jsx("iconify-icon",{icon:g,width:"16"})}),e.jsx("a",{href:`/account/${o}/record/${a}/${t._id}/edit`,className:`${f.fontWeight} hover:text-primary transition-colors`,children:m})]})}case"createdAt":return new Date(t.createdAt).toLocaleDateString("fr-FR");case"actions":return e.jsxs("div",{className:"flex items-center gap-0",children:[e.jsx("a",{href:`/account/${o}/record/${a}/${t._id}`,className:"p-1 rounded-lg text-gray-500 hover:text-primary hover:bg-primary/10 transition-all",title:"Voir",children:e.jsxs("svg",{className:"h-4 w-4",viewBox:"0 0 24 24",fill:"none",children:[e.jsx("path",{d:"M15 12C15 13.6569 13.6569 15 12 15C10.3431 15 9 13.6569 9 12C9 10.3431 10.3431 9 12 9C13.6569 9 15 10.3431 15 12Z",stroke:"currentColor",strokeWidth:"1.5"}),e.jsx("path",{d:"M12 5C7.5 5 3.73 7.94 2 12C3.73 16.06 7.5 19 12 19C16.5 19 20.27 16.06 22 12C20.27 7.94 16.5 5 12 5Z",stroke:"currentColor",strokeWidth:"1.5"})]})}),e.jsx("a",{href:`/account/${o}/record/${a}/${t._id}/edit`,className:"p-1 rounded-lg text-gray-500 hover:text-info hover:bg-info/10 transition-all",title:"Modifier",children:e.jsx("svg",{className:"h-4 w-4",viewBox:"0 0 24 24",fill:"none",children:e.jsx("path",{d:"M16.862 4.487L18.55 2.8C19.33 2.02 20.59 2.02 21.37 2.8C22.15 3.58 22.15 4.84 21.37 5.62L19.681 7.307M16.862 4.487L4.162 17.187C3.882 17.467 3.682 17.818 3.592 18.198L2.732 21.596C2.642 21.966 2.952 22.296 3.322 22.226L6.892 21.556C7.242 21.486 7.572 21.306 7.832 21.046L20.513 8.366M16.862 4.487L19.681 7.307",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round"})})}),e.jsx("button",{type:"button",className:"p-1 rounded-lg text-gray-500 hover:text-danger hover:bg-danger/10 transition-all",title:"Supprimer",onClick:()=>{confirm("Êtes-vous sûr de vouloir supprimer cet enregistrement ?")&&console.log("Delete record:",t._id)},children:e.jsxs("svg",{className:"h-4 w-4",viewBox:"0 0 24 24",fill:"none",children:[e.jsx("path",{d:"M20.5 6H3.5",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"}),e.jsx("path",{d:"M18.833 8.5L18.373 15.4C18.196 18.054 18.108 19.381 17.243 20.19C16.378 21 15.048 21 12.387 21H11.613C8.952 21 7.622 21 6.757 20.19C5.892 19.381 5.804 18.054 5.627 15.4L5.167 8.5",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"}),e.jsx("path",{d:"M9.5 11L10 16",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"}),e.jsx("path",{d:"M14.5 11L14 16",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"}),e.jsx("path",{d:"M6.5 6C6.556 5.367 6.612 5.1 6.877 4.714C7.178 4.275 7.945 3.917 9.484 3.2L9.924 2.984C10.683 2.589 11.06 2.392 11.476 2.318C11.823 2.254 12.177 2.254 12.524 2.318C12.94 2.392 13.317 2.589 14.076 2.984L14.516 3.2C16.055 3.917 16.822 4.275 17.123 4.714C17.388 5.1 17.444 5.367 17.5 6",stroke:"currentColor",strokeWidth:"1.5"})]})})]});default:{if(i.id.startsWith("rel:")){const m=i.id.substring(4),p=(((C=t._denorm)==null?void 0:C.relations)||[]).find(N=>N.relationKey===m);if(((c=p==null?void 0:p.records)==null?void 0:c.length)>0)return e.jsx("div",{className:"flex flex-wrap gap-1",children:p.records.map((N,D)=>e.jsx("a",{href:`/account/${o}/record/${N.entitySlug||a}/${N._id}`,className:"text-primary hover:underline text-xs",children:N.title||"Sans titre"},D))});const W=(t.relations||[]).find(N=>N.relationKey===m);return W!=null&&W.value?"—":""}if(i.id.startsWith("classif:")){const m=i.id.substring(8),y=(t.classificationValues||[]).find(p=>{var N,D,A;return(((N=p.classificationId)==null?void 0:N.$oid)||((A=(D=p.classificationId)==null?void 0:D.toString)==null?void 0:A.call(D))||p.classificationId)===m});if(y!=null&&y.label){const p=y.color||"#888";return e.jsx("span",{className:"inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap",style:{backgroundColor:`${p}15`,color:p,border:`1px solid ${p}30`},children:y.label})}return y!=null&&y.value?e.jsx("span",{className:"inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20",children:y.value}):""}if(t.customFields){const m=t.customFields.find(p=>{var N;const W=((N=p.field_id)==null?void 0:N._id)||p.field_id;return(W==null?void 0:W.toString())===i.id});if(!m)return"";const y=m.value;if(y&&typeof y=="object"&&y._v){const p=[];return Object.entries(y).forEach(([W,N])=>{W==="_v"||W==="customText"||(Array.isArray(N)?N.forEach(D=>p.push(D)):N&&p.push(N))}),y.customText&&p.push(y.customText),e.jsx("div",{className:"flex flex-wrap gap-1",children:p.map((W,N)=>e.jsx("span",{className:"inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20",children:W},N))})}return y||""}return""}}}function Me(t,i=.1){if(!t)return`rgba(99, 102, 241, ${i})`;const o=parseInt(t.slice(1,3),16),a=parseInt(t.slice(3,5),16),f=parseInt(t.slice(5,7),16);return`rgba(${o}, ${a}, ${f}, ${i})`}function it({field:t,record:i}){const o=(i.customFields||[]).find(f=>{var g;const v=((g=f.field_id)==null?void 0:g._id)||f.field_id;return(v==null?void 0:v.toString())===t.id});if(!o)return e.jsx("span",{className:"text-gray-400 dark:text-gray-600 text-sm italic",children:"—"});const a=o.value;if(a==null||a==="")return e.jsx("span",{className:"text-gray-400 dark:text-gray-600 text-sm italic",children:"—"});if(t.type==="date"||t.type==="datetime")try{return e.jsx("span",{className:"text-sm text-gray-700 dark:text-gray-300",children:new Date(a).toLocaleDateString("fr-FR")})}catch{return e.jsx("span",{className:"text-sm text-gray-700 dark:text-gray-300",children:String(a)})}return t.type==="boolean"||t.type==="checkbox"?e.jsxs("span",{className:`inline-flex items-center gap-1 text-sm ${a?"text-success":"text-gray-400"}`,children:[a?e.jsxs("svg",{width:"16",height:"16",viewBox:"0 0 24 24",fill:"none",children:[e.jsx("path",{d:"M9 12l2 2 4-4",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round"}),e.jsx("circle",{cx:"12",cy:"12",r:"10",stroke:"currentColor",strokeWidth:"1.5"})]}):e.jsx("svg",{width:"16",height:"16",viewBox:"0 0 24 24",fill:"none",children:e.jsx("circle",{cx:"12",cy:"12",r:"10",stroke:"currentColor",strokeWidth:"1.5"})}),a?"Oui":"Non"]}):t.type==="relation"?Array.isArray(a)?e.jsx("div",{className:"flex flex-wrap gap-1",children:a.map((f,v)=>e.jsx("span",{className:"inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-primary/10 text-primary font-medium",children:f.title||f.label||f.name||String(f)},v))}):e.jsx("span",{className:"text-sm text-gray-700 dark:text-gray-300",children:a.title||a.label||String(a)}):t.type==="number"?e.jsx("span",{className:"text-sm font-mono text-gray-700 dark:text-gray-300",children:Number(a).toLocaleString("fr-FR")}):e.jsx("span",{className:"text-sm text-gray-700 dark:text-gray-300",children:String(a)})}function ot({record:t,columns:i,accountNumber:o,entitySlug:a,onClose:f}){var E;const v=r.useRef(null),[g,C]=r.useState(!1);r.useEffect(()=>{requestAnimationFrame(()=>C(!0))},[]);const c=r.useCallback(()=>{C(!1),setTimeout(()=>f(),250)},[f]);if(r.useEffect(()=>{const u=j=>{j.key==="Escape"&&c()};return document.addEventListener("keydown",u),()=>document.removeEventListener("keydown",u)},[c]),!t)return null;const m=((E=t._id)==null?void 0:E.$oid)||t._id,y=t.referenceTitle||t.title||t.computedTitle||"Sans titre",p=t.description||"",W=t.createdAt?new Date(t.createdAt).toLocaleDateString("fr-FR",{day:"2-digit",month:"long",year:"numeric"}):null,N=t.updatedAt?new Date(t.updatedAt).toLocaleDateString("fr-FR",{day:"2-digit",month:"long",year:"numeric"}):null,D=(t.classificationValues||[]).filter(u=>u.optionLabel||u.label).map(u=>({label:u.optionLabel||u.label,color:u.optionColor||u.color||"#6366f1",classificationName:u.classificationName||"Classification"})),A={};D.forEach(u=>{A[u.classificationName]||(A[u.classificationName]=[]),A[u.classificationName].push(u)});const J=i.filter(u=>u.id!=="title"&&u.id!=="actions"&&!u.id.startsWith("class:"));return he.createPortal(e.jsxs(e.Fragment,{children:[e.jsx("div",{className:`fixed inset-0 bg-black/40 backdrop-blur-[2px] transition-opacity duration-250 ${g?"opacity-100":"opacity-0"}`,style:{zIndex:1e4},onMouseDown:c,onTouchEnd:u=>{u.preventDefault(),c()}}),e.jsxs("div",{ref:v,className:`fixed right-0 top-0 h-full bg-white dark:bg-[#0e1726] shadow-2xl border-l border-gray-200 dark:border-gray-700 flex flex-col transition-transform duration-250 ease-out ${g?"translate-x-0":"translate-x-full"}`,style:{zIndex:10001,width:"min(520px, 90vw)"},onClick:u=>u.stopPropagation(),children:[e.jsxs("div",{className:"flex items-center justify-between gap-3 px-6 py-4 border-b border-gray-100 dark:border-gray-700/50 flex-shrink-0",children:[e.jsxs("div",{className:"flex items-center gap-2 min-w-0",children:[e.jsx("div",{className:"w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0",children:e.jsxs("svg",{width:"16",height:"16",viewBox:"0 0 24 24",fill:"none",children:[e.jsx("path",{d:"M2 12C2 7.28595 2 4.92893 3.46447 3.46447C4.92893 2 7.28595 2 12 2C16.714 2 19.0711 2 20.5355 3.46447C22 4.92893 22 7.28595 22 12C22 16.714 22 19.0711 20.5355 20.5355C19.0711 22 16.714 22 12 22C7.28595 22 4.92893 22 3.46447 20.5355C2 19.0711 2 16.714 2 12Z",stroke:"#4361ee",strokeWidth:"1.5"}),e.jsx("path",{d:"M8 12H16M12 8V16",stroke:"#4361ee",strokeWidth:"1.5",strokeLinecap:"round"})]})}),e.jsx("h3",{className:"text-base font-semibold text-gray-900 dark:text-white truncate",children:y})]}),e.jsxs("div",{className:"flex items-center gap-1 flex-shrink-0",children:[e.jsx("a",{href:`/account/${o}/record/${a}/${m}`,className:"p-2 rounded-lg text-gray-400 hover:text-primary hover:bg-primary/10 transition-all",title:"Ouvrir la page complète",children:e.jsxs("svg",{width:"16",height:"16",viewBox:"0 0 24 24",fill:"none",children:[e.jsx("path",{d:"M10 4H6C4.89543 4 4 4.89543 4 6V18C4 19.1046 4.89543 20 6 20H18C19.1046 20 20 19.1046 20 18V14",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"}),e.jsx("path",{d:"M14 4H20V10",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round"}),e.jsx("path",{d:"M20 4L11 13",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"})]})}),e.jsx("a",{href:`/account/${o}/record/${a}/${m}/edit`,className:"p-2 rounded-lg text-gray-400 hover:text-info hover:bg-info/10 transition-all",title:"Modifier",children:e.jsx("svg",{width:"16",height:"16",viewBox:"0 0 24 24",fill:"none",children:e.jsx("path",{d:"M16.862 4.487L18.55 2.8C19.33 2.02 20.59 2.02 21.37 2.8C22.15 3.58 22.15 4.84 21.37 5.62L19.681 7.307M16.862 4.487L4.162 17.187C3.882 17.467 3.682 17.818 3.592 18.198L2.732 21.596C2.642 21.966 2.952 22.296 3.322 22.226L6.892 21.556C7.242 21.486 7.572 21.306 7.832 21.046L20.513 8.366",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"})})}),e.jsx("button",{onClick:c,className:"p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all",title:"Fermer",children:e.jsx("svg",{width:"16",height:"16",viewBox:"0 0 24 24",fill:"none",children:e.jsx("path",{d:"M18 6L6 18M6 6L18 18",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round"})})})]})]}),e.jsxs("div",{className:"flex-1 overflow-y-auto",children:[Object.keys(A).length>0&&e.jsx("div",{className:"px-6 py-4 border-b border-gray-100 dark:border-gray-700/50",children:Object.entries(A).map(([u,j])=>e.jsxs("div",{className:"mb-3 last:mb-0",children:[e.jsx("div",{className:"text-[11px] uppercase tracking-wider font-semibold text-gray-400 dark:text-gray-500 mb-1.5",children:u}),e.jsx("div",{className:"flex flex-wrap gap-1.5",children:j.map((B,b)=>e.jsxs("span",{className:"inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium transition-all hover:scale-105",style:{backgroundColor:Me(B.color,.15),color:B.color,border:`1px solid ${Me(B.color,.3)}`},children:[e.jsx("span",{className:"w-2 h-2 rounded-full flex-shrink-0",style:{backgroundColor:B.color}}),B.label]},b))})]},u))}),p&&e.jsxs("div",{className:"px-6 py-4 border-b border-gray-100 dark:border-gray-700/50",children:[e.jsx("div",{className:"text-[11px] uppercase tracking-wider font-semibold text-gray-400 dark:text-gray-500 mb-2",children:"Description"}),e.jsx("p",{className:"text-sm text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-wrap",children:p})]}),e.jsxs("div",{className:"px-6 py-4",children:[e.jsx("div",{className:"text-[11px] uppercase tracking-wider font-semibold text-gray-400 dark:text-gray-500 mb-3",children:"Détails"}),e.jsxs("div",{className:"space-y-0",children:[J.map(u=>e.jsxs("div",{className:"flex items-start gap-3 py-2.5 border-b border-gray-50 dark:border-gray-800/50 last:border-0",children:[e.jsx("div",{className:"w-32 flex-shrink-0 text-xs font-medium text-gray-500 dark:text-gray-400 pt-0.5 truncate",children:u.name}),e.jsx("div",{className:"flex-1 min-w-0",children:e.jsx(it,{field:u,record:t})})]},u.id)),(t.relations||[]).map((u,j)=>{var B;return e.jsxs("div",{className:"flex items-start gap-3 py-2.5 border-b border-gray-50 dark:border-gray-800/50 last:border-0",children:[e.jsx("div",{className:"w-32 flex-shrink-0 text-xs font-medium text-gray-500 dark:text-gray-400 pt-0.5 truncate",children:u.label||u.key||"Relation"}),e.jsx("div",{className:"flex-1 min-w-0",children:((B=u.records)==null?void 0:B.length)>0?e.jsx("div",{className:"flex flex-wrap gap-1",children:u.records.map((b,S)=>e.jsx("a",{href:`/account/${o}/record/${u.entitySlug||a}/${b._id}`,className:"inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-primary/10 text-primary font-medium hover:bg-primary/20 transition-colors",children:b.referenceTitle||b.title||"Sans titre"},S))}):e.jsx("span",{className:"text-gray-400 dark:text-gray-600 text-sm italic",children:"—"})})]},`rel-${j}`)})]})]})]}),e.jsx("div",{className:"flex-shrink-0 px-6 py-3 border-t border-gray-100 dark:border-gray-700/50 bg-gray-50/50 dark:bg-[#0a0f1e]/50",children:e.jsxs("div",{className:"flex items-center justify-between text-[11px] text-gray-400 dark:text-gray-500",children:[e.jsxs("div",{className:"flex items-center gap-3",children:[W&&e.jsxs("span",{className:"flex items-center gap-1",children:[e.jsxs("svg",{width:"12",height:"12",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"1.5",children:[e.jsx("circle",{cx:"12",cy:"12",r:"10"}),e.jsx("path",{d:"M12 6V12L16 14",strokeLinecap:"round"})]}),"Créé le ",W]}),N&&e.jsxs("span",{className:"flex items-center gap-1",children:[e.jsx("svg",{width:"12",height:"12",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"1.5",children:e.jsx("path",{d:"M4.06 13C4.02 12.67 4 12.34 4 12C4 7.58 7.58 4 12 4C14.5 4 16.73 5.15 18.2 6.94M19.94 11C19.98 11.33 20 11.66 20 12C20 16.42 16.42 20 12 20C9.5 20 7.27 18.85 5.8 17.06",strokeLinecap:"round",strokeLinejoin:"round"})}),"Modifié le ",N]})]}),e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx("a",{href:`/account/${o}/record/${a}/${m}`,className:"px-3 py-1.5 bg-primary/10 text-primary text-xs font-medium rounded-lg hover:bg-primary/20 transition-colors",children:"Voir"}),e.jsx("a",{href:`/account/${o}/record/${a}/${m}/edit`,className:"px-3 py-1.5 bg-primary text-white text-xs font-medium rounded-lg hover:bg-primary/90 transition-colors",children:"Modifier"})]})]})})]})]}),document.body)}function ge(t,i=.1){const o=/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(t);return o?`rgba(${parseInt(o[1],16)}, ${parseInt(o[2],16)}, ${parseInt(o[3],16)}, ${i})`:`rgba(128,128,128,${i})`}function De({record:t,accountNumber:i,entitySlug:o,isDragging:a=!1,onQuickView:f}){var d,k,Q;const v=r.useRef(null),g=r.useRef(!1),C=String(((d=t._id)==null?void 0:d.$oid)||t._id),{attributes:c,listeners:m,setNodeRef:y,transform:p,transition:W,isDragging:N}=et({id:C}),D={transform:tt.Transform.toString(p),transition:W,opacity:a||N?.7:1,touchAction:"manipulation"},A=((k=t._id)==null?void 0:k.$oid)||t._id,J=t.referenceTitle||t.title||t.computedTitle||"Sans titre",E=t.description||"",u=t.dueDate?new Date(t.dueDate).toLocaleDateString("fr-FR",{day:"2-digit",month:"2-digit",year:"2-digit"}):null,j=t.createdAt?new Date(t.createdAt).toLocaleDateString("fr-FR"):null,B=(t.classificationValues||[]).filter(w=>w.optionLabel||w.label).map(w=>({label:w.optionLabel||w.label,color:w.optionColor||w.color||"#6366f1"})),b=t.tags||[],S=w=>{v.current={x:w.clientX,y:w.clientY,time:Date.now()},g.current=!1},U=w=>{if(v.current){const z=Math.abs(w.clientX-v.current.x),te=Math.abs(w.clientY-v.current.y);(z>5||te>5)&&(g.current=!0)}},T=w=>{if(!v.current)return;const z=Date.now()-v.current.time;!g.current&&z<400&&f&&!w.target.closest("a, button")&&setTimeout(()=>f(t),50),v.current=null};return e.jsxs("div",{ref:y,style:D,className:`kanban-card cursor-pointer rounded-lg transition-all group bg-white hover:shadow-md border border-gray-200/80 dark:border-0 dark:bg-dark/40 dark:hover:bg-dark/60 ${a||N?"shadow-lg ring-2 ring-primary/30 cursor-move":"shadow-sm"}`,"data-dnd":"card",onPointerDown:S,onPointerMove:U,onPointerUp:T,...c,...m,children:[e.jsxs("div",{className:"p-3",children:[e.jsx("div",{className:"text-sm font-semibold text-gray-800 dark:text-white-dark leading-5 line-clamp-2 mb-2",children:J}),E&&e.jsx("p",{className:"text-xs text-gray-500 dark:text-white-dark/70 line-clamp-2 mb-2",children:E}),e.jsx("div",{className:"flex flex-wrap items-center gap-1 mb-2",children:B.length>0?B.slice(0,3).map((w,z)=>e.jsxs("span",{className:"inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded font-medium",style:{backgroundColor:ge(w.color,.15),color:w.color},children:[e.jsx("span",{className:"w-1.5 h-1.5 rounded-full flex-shrink-0",style:{backgroundColor:w.color}}),w.label]},z)):b.length>0?b.slice(0,2).map((w,z)=>e.jsx("span",{className:"inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary",children:w},z)):e.jsxs("span",{className:"text-[10px] text-gray-400 dark:text-white-dark/50 italic flex items-center gap-1",children:[e.jsx("svg",{width:"10",height:"10",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"1.5",children:e.jsx("path",{d:"M4.172 3.172C3 4.343 3 6.229 3 10v4c0 3.771 0 5.657 1.172 6.828C5.343 22 7.229 22 11 22h2c3.771 0 5.657 0 6.828-1.172C21 19.657 21 17.771 21 14v-1.22c0-1.835 0-2.752-.379-3.55-.378-.798-1.07-1.39-2.455-2.576l-1.5-1.282c-1.97-1.687-2.955-2.531-4.136-2.605-.17-.01-.343-.01-.56 0-1.18.074-2.166.918-4.136 2.605L6.334 6.654"})}),"Sans tag"]})}),e.jsxs("div",{className:"flex items-center gap-3 text-xs text-gray-400 dark:text-white-dark/50",children:[((Q=t.attachments)==null?void 0:Q.length)>0&&e.jsxs("span",{className:"flex items-center gap-1",children:[e.jsx("svg",{width:"12",height:"12",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",children:e.jsx("path",{d:"M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"})}),t.attachments.length]}),e.jsxs("span",{className:"flex items-center gap-1",children:[e.jsx("svg",{width:"12",height:"12",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",children:e.jsx("path",{d:"M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"})}),"0"]})]})]}),e.jsxs("div",{className:"px-3 py-2 border-t border-gray-100 dark:border-0 flex items-center justify-between",children:[e.jsxs("div",{className:"flex items-center gap-1 text-[11px] text-gray-400 dark:text-white-dark/50",children:[e.jsxs("svg",{width:"12",height:"12",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"1.5",children:[e.jsx("rect",{x:"3",y:"4",width:"18",height:"18",rx:"2"}),e.jsx("path",{d:"M3 10H21"}),e.jsx("path",{d:"M8 2V6"}),e.jsx("path",{d:"M16 2V6"})]}),e.jsx("span",{children:u||j||"—"})]}),e.jsxs("div",{className:"flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity",style:{pointerEvents:"auto"},children:[e.jsx("a",{href:`/account/${i}/record/${o}/${A}/edit`,className:"p-1 hover:text-info rounded hover:bg-gray-100 dark:hover:bg-gray-700",onClick:w=>w.stopPropagation(),onPointerDown:w=>w.stopPropagation(),children:e.jsx("svg",{width:"14",height:"14",viewBox:"0 0 24 24",fill:"none",children:e.jsx("path",{d:"M16.862 4.487L18.55 2.8C19.33 2.02 20.59 2.02 21.37 2.8C22.15 3.58 22.15 4.84 21.37 5.62L19.681 7.307M16.862 4.487L4.162 17.187C3.882 17.467 3.682 17.818 3.592 18.198L2.732 21.596C2.642 21.966 2.952 22.296 3.322 22.226L6.892 21.556C7.242 21.486 7.572 21.306 7.832 21.046L20.513 8.366M16.862 4.487L19.681 7.307",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"})})}),e.jsx("a",{href:`/account/${i}/record/${o}/${A}`,className:"p-1 hover:text-primary rounded hover:bg-gray-100 dark:hover:bg-gray-700",onClick:w=>w.stopPropagation(),onPointerDown:w=>w.stopPropagation(),children:e.jsxs("svg",{width:"14",height:"14",viewBox:"0 0 24 24",fill:"none",children:[e.jsx("path",{opacity:"0.5",d:"M3.27489 15.2957C2.42496 14.1915 2 13.6394 2 12C2 10.3606 2.42496 9.80853 3.27489 8.70433C4.97196 6.49956 7.81811 4 12 4C16.1819 4 19.028 6.49956 20.7251 8.70433C21.575 9.80853 22 10.3606 22 12C22 13.6394 21.575 14.1915 20.7251 15.2957C19.028 17.5004 16.1819 20 12 20C7.81811 20 4.97196 17.5004 3.27489 15.2957Z",stroke:"currentColor",strokeWidth:"1.5"}),e.jsx("path",{d:"M15 12C15 13.6569 13.6569 15 12 15C10.3431 15 9 13.6569 9 12C9 10.3431 10.3431 9 12 9C13.6569 9 15 10.3431 15 12Z",stroke:"currentColor",strokeWidth:"1.5"})]})})]})]})]})}function nt({column:t,records:i,recordIds:o,accountNumber:a,entitySlug:f,onQuickView:v}){const{setNodeRef:g,isOver:C}=Qe({id:String(t.id)}),c=typeof document<"u"&&document.documentElement.classList.contains("dark"),m=ge(t.color,c?.12:.06),y=ge(t.color,c?.3:.15);return e.jsxs("div",{ref:g,className:`flex-none rounded-lg overflow-hidden transition-all ${C?"ring-2 ring-primary/50 ring-offset-2":""}`,style:{width:"300px",maxWidth:"320px",backgroundColor:C?ge(t.color,.15):m,border:`1px solid ${y}`},"data-dnd":"column",children:[e.jsx("div",{style:{height:"4px",backgroundColor:t.color}}),e.jsx("div",{className:"px-3 py-2 flex justify-between items-center",children:e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx("span",{className:"inline-flex items-center gap-1.5 px-2 py-0 rounded text-xs font-semibold uppercase tracking-wide",style:{backgroundColor:t.color,color:"#fff"},children:t.title}),e.jsx("span",{className:"text-xs text-gray-500 font-medium",children:i.length})]})}),e.jsx("div",{className:"px-2 pb-3",children:e.jsx(Xe,{items:o,strategy:Ge,children:e.jsx("div",{className:`space-y-2 min-h-[80px] rounded-lg transition-all ${C?"bg-primary/5 p-2":""}`,children:i.length===0?e.jsx("div",{className:"text-xs text-gray-300 dark:text-gray-600 text-center py-8 italic",children:"Aucun enregistrement"}):i.map(p=>{var W;return e.jsx(De,{record:p,accountNumber:a,entitySlug:f,onQuickView:v},((W=p._id)==null?void 0:W.$oid)||p._id)})})})}),e.jsx("div",{className:"px-3 pb-3",children:e.jsxs("button",{type:"button",className:"flex items-center gap-1 text-xs text-gray-400 hover:text-primary transition-colors",children:[e.jsx("svg",{width:"14",height:"14",viewBox:"0 0 24 24",fill:"none",children:e.jsx("path",{d:"M12 6V18M6 12H18",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round"})}),"Ajouter"]})})]})}function lt({records:t,columns:i,accountNumber:o,entitySlug:a,viewId:f,entityData:v}){const g=r.useRef(null),C=r.useRef(null),[c,m]=r.useState(t),[y,p]=r.useState({}),[W,N]=r.useState(null),[D,A]=r.useState(null),J=r.useCallback(x=>{A(x)},[]);r.useEffect(()=>{m(t)},[t]);const E=r.useRef(!1),u=r.useRef(0),j=r.useRef(0),B=r.useCallback(x=>{if(W||x.button!==0||x.target.closest('a, button, .dropdown, [data-dnd="card"]'))return;const V=g.current;V&&(E.current=!0,u.current=x.pageX-V.offsetLeft,j.current=V.scrollLeft,V.style.cursor="grabbing")},[W]),b=r.useCallback(x=>{if(W){E.current=!1;return}if(!E.current)return;x.preventDefault();const V=g.current;if(!V)return;const s=(x.pageX-V.offsetLeft-u.current)*1.5;V.scrollLeft=j.current-s},[W]),S=r.useCallback(()=>{E.current=!1,g.current&&(g.current.style.cursor="grab")},[]),U=ze(ve(Je,{activationConstraint:{distance:8}}),ve(qe,{activationConstraint:{delay:500,tolerance:10}}),ve(Ye,{coordinateGetter:Ke})),T=r.useMemo(()=>{if(v){const s=v.statusClassification;if(s&&s.options&&s.options.length>0){const I=s.options.map(R=>({id:String(R._id),title:R.label,color:R.color||"#6366f1",optionId:String(R._id)}));return I.push({id:"__none__",title:"Sans Statut",color:"#9ca3af",optionId:"none"}),{classId:String(s._id),columns:I}}const h=v.classifications||[];for(const I of h)if(I.options&&I.options.length>0){const R=I.options.map(M=>({id:String(M._id),title:M.label,color:M.color||"#6366f1",optionId:String(M._id)}));return R.push({id:"__none__",title:"Non classé",color:"#9ca3af",optionId:"none"}),{classId:String(I._id),columns:R}}}const x={};c.forEach(s=>{(s.classificationValues||[]).forEach(h=>{var F,ae;const I=((F=h.classificationId)==null?void 0:F.$oid)||h.classificationId||h.classification_id;if(!I)return;x[I]||(x[I]={count:0,options:{}}),x[I].count++;const R=h.optionLabel||h.label||"Sans label",M=h.optionColor||h.color||"#9ca3af",X=((ae=h.optionId)==null?void 0:ae.$oid)||h.optionId||R;x[I].options[R]||(x[I].options[R]={label:R,color:M,optionId:String(X),count:0}),x[I].options[R].count++})});let V=null,H=0;if(Object.entries(x).forEach(([s,h])=>{h.count>H&&(H=h.count,V=s)}),V&&x[V]){const h=Object.values(x[V].options).map(I=>({id:I.label,title:I.label,color:I.color,optionId:I.optionId}));return h.push({id:"__none__",title:"Sans classification",color:"#9ca3af",optionId:"none"}),{classId:V,columns:h}}return{classId:null,columns:[{id:"__all__",title:"Tous les enregistrements",color:"#4361ee",optionId:null}]}},[c,v]),d=r.useMemo(()=>{const x={};if(T.columns.forEach(V=>x[V.id]=[]),!T.classId)x.__all__=c;else{const V={};T.columns.forEach(s=>{s.optionId&&s.optionId!=="none"&&(V[String(s.optionId)]=s.id)});const H={};T.columns.forEach(s=>{H[s.title]=s.id}),c.forEach(s=>{var R;const I=(s.classificationValues||[]).find(M=>{var F;return(((F=M.classificationId)==null?void 0:F.$oid)||M.classificationId||M.classification_id)===T.classId});if(I){const M=String(((R=I.optionId)==null?void 0:R.$oid)||I.optionId||""),X=V[M];if(X&&x[X])x[X].push(s);else{const F=I.optionLabel||I.label||"Sans label";x[F]?x[F].push(s):x.__none__&&x.__none__.push(s)}}else x.__none__&&x.__none__.push(s)})}for(const V of Object.keys(x)){const H=y[V]||[];H.length&&x[V].sort((s,h)=>{var M,X;const I=H.indexOf(String(((M=s._id)==null?void 0:M.$oid)||s._id)),R=H.indexOf(String(((X=h._id)==null?void 0:X.$oid)||h._id));return I===-1&&R===-1?0:I===-1?1:R===-1?-1:I-R})}return x},[T,c,y]),k=r.useMemo(()=>{const x={};for(const V of T.columns)x[V.id]=(d[V.id]||[]).map(H=>{var s;return String(((s=H._id)==null?void 0:s.$oid)||H._id)});return x},[T.columns,d]),Q=r.useCallback(x=>{var H;const V=String(x);for(const s of Object.keys(k))if((H=k[s])!=null&&H.includes(V))return s;return null},[k]),w=r.useMemo(()=>W&&c.find(x=>{var V;return String(((V=x._id)==null?void 0:V.$oid)||x._id)===String(W)})||null,[W,c]),z=r.useCallback(x=>{f&&(C.current&&clearTimeout(C.current),C.current=setTimeout(async()=>{try{await fetch(`/account/${o}/api/user/view-preferences`,{method:"POST",headers:{"Content-Type":"application/json"},credentials:"include",body:JSON.stringify({viewId:f,preferences:{kanban:{orderByColumn:x}}})})}catch{}},250))},[o,f]),te=r.useCallback(async(x,V)=>{if(!T.classId)return;const H=T.columns.find(s=>s.id===V);if(H)try{await fetch(`/account/${o}/api/record/update-classification`,{method:"POST",headers:{"Content-Type":"application/json"},credentials:"include",body:JSON.stringify({recordId:x,classificationId:T.classId,optionId:H.optionId==="none"?null:H.optionId})})}catch(s){console.error("[RecordsKanban] Update error:",s)}},[o,T]),G=x=>{N(String(x.active.id))},P=()=>{N(null)},se=x=>{const{active:V,over:H}=x;if(N(null),!H)return;const s=String(V.id),h=String(H.id),I=Q(s),R=T.columns.some(Z=>String(Z.id)===h)?h:Q(h);if(!I||!R)return;if(I===R){const Z=k[I]||[],q=Z.indexOf(s),ee=Z.indexOf(h);if(q===-1||ee===-1||q===ee)return;const de=Ue(Z,q,ee),le={...y,[I]:de};p(le),z(le);return}const M=[...k[I]||[]].filter(Z=>Z!==s),X=[...k[R]||[]],ae=T.columns.some(Z=>String(Z.id)===h)?X.length:Math.max(0,X.indexOf(h));X.splice(ae,0,s);const l={...y,[I]:M,[R]:X};if(p(l),z(l),T.classId){const Z=T.columns.find(q=>q.id===R);m(q=>q.map(ee=>{var le;if(String(((le=ee._id)==null?void 0:le.$oid)||ee._id)!==s)return ee;const de=(ee.classificationValues||[]).filter(ue=>{var xe;return(((xe=ue.classificationId)==null?void 0:xe.$oid)||ue.classificationId||ue.classification_id)!==T.classId});return R!=="__none__"&&Z&&de.push({classificationId:T.classId,optionId:Z.optionId,optionLabel:Z.title,optionColor:Z.color}),{...ee,classificationValues:de}})),te(s,R)}};return e.jsxs("div",{ref:g,className:"h-full overflow-x-auto overflow-y-auto",style:{cursor:"grab",userSelect:"none",WebkitUserSelect:"none"},onMouseDown:B,onMouseMove:b,onMouseUp:S,onMouseLeave:S,children:[e.jsxs(Pe,{sensors:U,collisionDetection:He,autoScroll:{threshold:{x:.15,y:.15},interval:10,acceleration:5},onDragStart:G,onDragEnd:se,onDragCancel:P,children:[e.jsx("div",{style:{display:"flex",flexWrap:"nowrap",alignItems:"flex-start",gap:"1.25rem",padding:"0.5rem",width:"max-content",minHeight:"100%"},children:T.columns.map(x=>{const V=d[x.id]||[];return x.id==="__none__"&&V.length===0?null:e.jsx(nt,{column:x,records:V,recordIds:k[x.id]||[],accountNumber:o,entitySlug:a,onQuickView:J},x.id)})}),e.jsx(Ze,{children:w?e.jsx(De,{record:w,accountNumber:o,entitySlug:a,isDragging:!0}):null})]}),D&&e.jsx(ot,{record:D,columns:i,accountNumber:o,entitySlug:a,onClose:()=>A(null)})]})}const _e=[{bg:"bg-primary-light shadow-primary",text:"text-primary",dot:"#4361ee"},{bg:"bg-info-light shadow-info",text:"text-info",dot:"#2196f3"},{bg:"bg-warning-light shadow-warning",text:"text-warning",dot:"#e2a03f"},{bg:"bg-danger-light shadow-danger",text:"text-danger",dot:"#e7515a"},{bg:"bg-success-light shadow-success",text:"text-success",dot:"#00ab55"},{bg:"bg-secondary-light shadow-secondary",text:"text-secondary",dot:"#805dca"}];function dt(t){return _e[t%_e.length]}function ct(){return e.jsxs("svg",{width:"24",height:"24",viewBox:"0 0 24 24",fill:"none",className:"h-5 w-5 rotate-90 opacity-70 hover:opacity-100",children:[e.jsx("circle",{cx:"5",cy:"12",r:"2",stroke:"currentColor",strokeWidth:"1.5"}),e.jsx("circle",{opacity:"0.5",cx:"12",cy:"12",r:"2",stroke:"currentColor",strokeWidth:"1.5"}),e.jsx("circle",{cx:"19",cy:"12",r:"2",stroke:"currentColor",strokeWidth:"1.5"})]})}function pt(){return e.jsxs("svg",{width:"24",height:"24",viewBox:"0 0 24 24",fill:"none",className:"h-4 w-4 ltr:mr-3 rtl:ml-3",children:[e.jsx("path",{d:"M15.2869 3.15178L14.3601 4.07866L5.83882 12.5999C5.26166 13.1771 4.97308 13.4656 4.7249 13.7838C4.43213 14.1592 4.18114 14.5653 3.97634 14.995C3.80273 15.3593 3.67368 15.7465 3.41556 16.5208L2.32181 19.8021L2.05445 20.6042C1.92743 20.9852 2.0266 21.4053 2.31063 21.6894C2.59466 21.9734 3.01478 22.0726 3.39584 21.9456L4.19792 21.6782L7.47918 20.5844C8.25353 20.3263 8.6407 20.1973 9.00498 20.0237C9.43469 19.8189 9.84082 19.5679 10.2162 19.2751C10.5344 19.0269 10.8229 18.7383 11.4001 18.1612L19.9213 9.63993L20.8482 8.71306C22.3839 7.17735 22.3839 4.68748 20.8482 3.15178C19.3125 1.61607 16.8226 1.61607 15.2869 3.15178Z",stroke:"currentColor",strokeWidth:"1.5"}),e.jsx("path",{opacity:"0.5",d:"M14.36 4.07812C14.36 4.07812 14.4759 6.04774 16.2138 7.78564C17.9517 9.52354 19.9213 9.6394 19.9213 9.6394M4.19789 21.6777L2.32178 19.8015",stroke:"currentColor",strokeWidth:"1.5"})]})}function ut(){return e.jsxs("svg",{width:"24",height:"24",viewBox:"0 0 24 24",fill:"none",className:"h-4.5 w-4.5 ltr:mr-3 rtl:ml-3",children:[e.jsx("path",{opacity:"0.5",d:"M3.27489 15.2957C2.42496 14.1915 2 13.6394 2 12C2 10.3606 2.42496 9.80853 3.27489 8.70433C4.97196 6.49956 7.81811 4 12 4C16.1819 4 19.028 6.49956 20.7251 8.70433C21.575 9.80853 22 10.3606 22 12C22 13.6394 21.575 14.1915 20.7251 15.2957C19.028 17.5004 16.1819 20 12 20C7.81811 20 4.97196 17.5004 3.27489 15.2957Z",stroke:"currentColor",strokeWidth:"1.5"}),e.jsx("path",{d:"M15 12C15 13.6569 13.6569 15 12 15C10.3431 15 9 13.6569 9 12C9 10.3431 10.3431 9 12 9C13.6569 9 15 10.3431 15 12Z",stroke:"currentColor",strokeWidth:"1.5"})]})}function xt({filled:t}){return e.jsx("svg",{width:"24",height:"24",viewBox:"0 0 24 24",fill:"none",className:`h-4.5 w-4.5 group-hover:fill-warning ${t?"fill-warning":""}`,children:e.jsx("path",{d:"M9.15316 5.40838C10.4198 3.13613 11.0531 2 12 2C12.9469 2 13.5802 3.13612 14.8468 5.40837L15.1745 5.99623C15.5345 6.64193 15.7144 6.96479 15.9951 7.17781C16.2757 7.39083 16.6251 7.4699 17.3241 7.62805L17.9605 7.77203C20.4201 8.32856 21.65 8.60682 21.9426 9.54773C22.2352 10.4886 21.3968 11.4691 19.7199 13.4299L19.2861 13.9372C18.8096 14.4944 18.5713 14.773 18.4641 15.1177C18.357 15.4624 18.393 15.8341 18.465 16.5776L18.5306 17.2544C18.7841 19.8706 18.9109 21.1787 18.1449 21.7602C17.3788 22.3417 16.2273 21.8115 13.9243 20.7512L13.3285 20.4768C12.6741 20.1755 12.3469 20.0248 12 20.0248C11.6531 20.0248 11.3259 20.1755 10.6715 20.4768L10.0757 20.7512C7.77268 21.8115 6.62118 22.3417 5.85515 21.7602C5.08912 21.1787 5.21588 19.8706 5.4694 17.2544L5.53498 16.5776C5.60703 15.8341 5.64305 15.4624 5.53586 15.1177C5.42868 14.773 5.19043 14.4944 4.71392 13.9372L4.2801 13.4299C2.60325 11.4691 1.76482 10.4886 2.05742 9.54773C2.35002 8.60682 3.57986 8.32856 6.03954 7.77203L6.67589 7.62805C7.37485 7.4699 7.72433 7.39083 8.00494 7.17781C8.28555 6.96479 8.46553 6.64194 8.82547 5.99623L9.15316 5.40838Z",stroke:"currentColor",strokeWidth:"1.5"})})}function ht(){return e.jsx("svg",{width:"24",height:"24",viewBox:"0 0 24 24",fill:"none",className:"h-3 w-3 rotate-45",children:e.jsx("path",{d:"M2 12C2 7.28595 2 4.92893 3.46447 3.46447C4.92893 2 7.28595 2 12 2C16.714 2 19.0711 2 20.5355 3.46447C22 4.92893 22 7.28595 22 12C22 16.714 22 19.0711 20.5355 20.5355C19.0711 22 16.714 22 12 22C7.28595 22 4.92893 22 3.46447 20.5355C2 19.0711 2 16.714 2 12Z",stroke:"currentColor",strokeWidth:"1.5"})})}function ft({record:t,accountNumber:i,entitySlug:o}){var C;const[a,f]=r.useState(!1),v=r.useRef(null);r.useEffect(()=>{if(!a)return;const c=m=>{v.current&&!v.current.contains(m.target)&&f(!1)};return document.addEventListener("mousedown",c),()=>document.removeEventListener("mousedown",c)},[a]);const g=((C=t._id)==null?void 0:C.$oid)||t._id;return e.jsxs("div",{ref:v,className:"dropdown relative",children:[e.jsx("button",{type:"button",className:"text-primary",onClick:c=>{c.preventDefault(),c.stopPropagation(),f(!a)},children:e.jsx(ct,{})}),a&&e.jsxs("ul",{className:"absolute z-50 min-w-[140px] rounded-md bg-white dark:bg-[#1b2e4b] shadow-lg border dark:border-gray-700 py-1 text-sm font-medium ltr:right-0 rtl:left-0 top-full mt-1",style:{animation:"fadeIn 0.15s ease-out"},children:[e.jsx("li",{children:e.jsxs("a",{href:`/account/${i}/record/${o}/${g}/edit`,className:"flex items-center px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 w-full",onClick:c=>c.stopPropagation(),children:[e.jsx(pt,{})," Edit"]})}),e.jsx("li",{children:e.jsxs("a",{href:`/account/${i}/record/${o}/${g}`,className:"flex items-center px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 w-full",onClick:c=>c.stopPropagation(),children:[e.jsx(ut,{})," View"]})})]})]})}function gt({record:t,accountNumber:i,entitySlug:o,style:a,favorites:f,onToggleFav:v}){var W,N;const g=f[t._id]||!1,C=((W=t._id)==null?void 0:W.$oid)||t._id,c=t.referenceTitle||t.title||t.computedTitle||"Sans titre",m=t.createdAt?new Date(t.createdAt).toLocaleDateString("fr-FR",{day:"2-digit",month:"short",year:"numeric"}):"",y=(t.customFields||[]).find(D=>{var A,J,E,u,j,B;return((J=(A=D.field_id)==null?void 0:A.label)==null?void 0:J.toLowerCase().includes("descri"))||((u=(E=D.field_id)==null?void 0:E.label)==null?void 0:u.toLowerCase().includes("note"))||((B=(j=D.field_id)==null?void 0:j.label)==null?void 0:B.toLowerCase().includes("contenu"))}),p=(y==null?void 0:y.value)||t.description||"";return(t.classificationValues||[]).filter(D=>D.optionLabel).map(D=>({label:D.optionLabel,color:D.optionColor||D.color||a.dot})),e.jsxs("div",{className:`panel pb-12 relative ${a.bg}`,children:[e.jsxs("div",{className:"min-h-[142px]",children:[e.jsxs("div",{className:"flex justify-between",children:[e.jsxs("div",{className:"flex w-max items-center",children:[e.jsx("div",{className:"flex-none",children:e.jsx("div",{className:"rounded-full bg-gray-300 p-2 dark:bg-gray-700",children:e.jsxs("svg",{width:"24",height:"24",viewBox:"0 0 24 24",fill:"none",className:"h-4.5 w-4.5",children:[e.jsx("circle",{cx:"12",cy:"6",r:"4",stroke:"currentColor",strokeWidth:"1.5"}),e.jsx("ellipse",{opacity:"0.5",cx:"12",cy:"17",rx:"7",ry:"4",stroke:"currentColor",strokeWidth:"1.5"})]})})}),e.jsxs("div",{className:"ltr:ml-2 rtl:mr-2",children:[e.jsx("div",{className:"font-semibold",children:((N=t.createdBy)==null?void 0:N.name)||"Utilisateur"}),e.jsx("div",{className:"text-sx text-white-dark",children:m})]})]}),e.jsx(ft,{record:t,accountNumber:i,entitySlug:o})]}),e.jsxs("div",{children:[e.jsx("h4",{className:"mt-4 font-semibold",children:e.jsx("a",{href:`/account/${i}/record/${o}/${C}`,className:"hover:text-primary transition-colors",children:c})}),p&&e.jsx("p",{className:"mt-2 text-white-dark line-clamp-3",children:p})]})]}),e.jsx("div",{className:"absolute bottom-5 left-0 w-full px-5",children:e.jsxs("div",{className:"mt-2 flex items-center justify-between",children:[e.jsx("div",{className:a.text,children:e.jsx(ht,{})}),e.jsx("div",{className:"flex items-center gap-2",children:e.jsx("button",{type:"button",className:"group text-warning ltr:ml-2 rtl:mr-2",onClick:D=>{D.preventDefault(),D.stopPropagation(),v(t._id)},children:e.jsx(xt,{filled:g})})})]})})]})}function mt({records:t,accountNumber:i,entitySlug:o}){const[a,f]=r.useState({}),v=r.useCallback(g=>{f(C=>({...C,[g]:!C[g]}))},[]);return e.jsx("div",{className:"h-full overflow-y-auto",children:e.jsx("div",{className:"grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",children:t.length===0?e.jsx("div",{className:"col-span-full text-center py-20 text-gray-400 dark:text-gray-600 italic",children:"Aucun enregistrement"}):t.map((g,C)=>{var c;return e.jsx(gt,{record:g,accountNumber:i,entitySlug:o,style:dt(C),favorites:a,onToggleFav:v},((c=g._id)==null?void 0:c.$oid)||g._id)})})})}const Ie={contains:{label:"Contient",icon:"⊃",types:["text","email","phone","url","textarea","title","relation"]},not_contains:{label:"Ne contient pas",icon:"⊅",types:["text","email","phone","url","textarea","title","relation"]},equals:{label:"Est égal à",icon:"=",types:["text","email","phone","url","number","date","title","select","relation","classification"]},not_equals:{label:"N'est pas égal à",icon:"≠",types:["text","email","phone","url","number","date","title","select","relation","classification"]},starts_with:{label:"Commence par",icon:"A…",types:["text","email","phone","url","title"]},ends_with:{label:"Se termine par",icon:"…Z",types:["text","email","phone","url","title"]},gt:{label:"Supérieur à",icon:">",types:["number","date"]},gte:{label:"Supérieur ou égal",icon:"≥",types:["number","date"]},lt:{label:"Inférieur à",icon:"<",types:["number","date"]},lte:{label:"Inférieur ou égal",icon:"≤",types:["number","date"]},between:{label:"Entre",icon:"↔",types:["number","date"]},is_empty:{label:"Est vide",icon:"∅",types:["text","email","phone","url","number","date","textarea","title","select","relation","classification"]},is_not_empty:{label:"N'est pas vide",icon:"∃",types:["text","email","phone","url","number","date","textarea","title","select","relation","classification"]}};function ke(t){const i=t||"text";return Object.entries(Ie).filter(([o,a])=>a.types.includes(i)).map(([o,a])=>({key:o,...a}))}function $e(t){return["number","currency","percent"].includes(t)?"number":["date","datetime"].includes(t)?"date":"text"}function bt({columns:t=[],fieldFilters:i=[],onFieldFiltersChange:o,allRecords:a=[],sidebarFilters:f=[],filterLogic:v="AND",onFilterLogicChange:g}){const[C,c]=r.useState(i.length>0),[m,y]=r.useState(null),[p,W]=r.useState(!1),N=r.useRef(null);r.useEffect(()=>{const d=k=>{p&&N.current&&!N.current.contains(k.target)&&W(!1)};return p&&document.addEventListener("mousedown",d),()=>document.removeEventListener("mousedown",d)},[p]);const D=we.useMemo(()=>{const d={};return f.forEach(k=>{d[`classif:${k.id}`]=k.options||[]}),d},[f]),A=t.filter(d=>d.id!=="actions"),J=r.useCallback(d=>{const k=A.find(G=>G.id===d);if(!k)return;const Q=d.startsWith("classif:"),w=ke(k.type),z=Q?w.find(G=>G.key==="equals")||w[0]:w.find(G=>G.key==="contains")||w[0],te={fieldId:d,fieldName:k.name,fieldType:k.type||"text",operator:z.key,value:"",value2:""};o([...i,te]),W(!1),y(i.length)},[A,i,o]),E=r.useCallback((d,k)=>{const Q=i.map((w,z)=>z===d?{...w,...k}:w);o(Q)},[i,o]),u=r.useCallback(d=>{const k=i.filter((Q,w)=>w!==d);o(k),m===d&&y(null)},[i,o,m]),j=r.useCallback(()=>{o([]),y(null)},[o]),B=d=>["is_empty","is_not_empty"].includes(d),b=d=>d==="between",S=d=>d&&d.startsWith("classif:"),U=d=>D[d]||[],T=(d,k)=>{const w=U(d).find(z=>z.id===k||z.label===k);return w?w.label:k};return e.jsxs("div",{className:"adv-filters-container",children:[e.jsxs("button",{type:"button",className:"adv-filters-header",onClick:()=>c(!C),children:[e.jsxs("div",{className:"adv-filters-header-left",children:[e.jsx("svg",{viewBox:"0 0 24 24",fill:"none",className:"adv-filters-header-icon",children:e.jsx("path",{d:"M22 3H2L10 12.46V19L14 21V12.46L22 3Z",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round"})}),e.jsx("span",{children:"Filtres avancés"}),i.length>0&&e.jsx("span",{className:"adv-filters-count",children:i.length})]}),e.jsx("svg",{viewBox:"0 0 24 24",fill:"none",className:`adv-filters-chevron ${C?"adv-filters-chevron--open":""}`,children:e.jsx("path",{d:"M9 18L15 12L9 6",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round"})})]}),C&&e.jsxs("div",{className:"adv-filters-body",children:[i.length>=2&&e.jsxs("div",{className:"adv-filter-logic-toggle",children:[e.jsx("span",{className:"adv-filter-logic-label",children:"Logique :"}),e.jsxs("div",{className:"adv-filter-logic-buttons",children:[e.jsx("button",{type:"button",className:`adv-filter-logic-btn ${v==="AND"?"adv-filter-logic-btn--active":""}`,onClick:()=>g&&g("AND"),children:"ET"}),e.jsx("button",{type:"button",className:`adv-filter-logic-btn ${v==="OR"?"adv-filter-logic-btn--active":""}`,onClick:()=>g&&g("OR"),children:"OU"})]})]}),i.map((d,k)=>{var G;A.find(P=>P.id===d.fieldId);const Q=ke(d.fieldType),w=m===k,z=S(d.fieldId),te=z?U(d.fieldId):[];return e.jsxs(we.Fragment,{children:[k>0&&i.length>=2&&e.jsxs("div",{className:"adv-filter-connector",children:[e.jsx("span",{className:"adv-filter-connector-line"}),e.jsx("span",{className:`adv-filter-connector-badge ${v==="OR"?"adv-filter-connector-badge--or":""}`,children:v==="OR"?"OU":"ET"}),e.jsx("span",{className:"adv-filter-connector-line"})]}),e.jsx("div",{className:`adv-filter-pill ${w?"adv-filter-pill--editing":""}`,children:w?e.jsxs("div",{className:"adv-filter-edit",children:[e.jsxs("div",{className:"adv-filter-row",children:[e.jsx("label",{className:"adv-filter-label",children:"Champ"}),e.jsx("select",{value:d.fieldId,onChange:P=>{const se=A.find(x=>x.id===P.target.value);if(se){const x=ke(se.type),H=P.target.value.startsWith("classif:")?x.find(s=>s.key==="equals")||x[0]:x.find(s=>s.key===d.operator)||x[0];E(k,{fieldId:se.id,fieldName:se.name,fieldType:se.type||"text",operator:H.key,value:"",value2:""})}},className:"adv-filter-select",children:A.map(P=>e.jsx("option",{value:P.id,children:P.name},P.id))})]}),e.jsxs("div",{className:"adv-filter-row",children:[e.jsx("label",{className:"adv-filter-label",children:"Condition"}),e.jsx("select",{value:d.operator,onChange:P=>E(k,{operator:P.target.value,value:B(P.target.value)?"":d.value,value2:""}),className:"adv-filter-select",children:Q.map(P=>e.jsx("option",{value:P.key,children:P.label},P.key))})]}),!B(d.operator)&&e.jsxs("div",{className:"adv-filter-row",children:[e.jsx("label",{className:"adv-filter-label",children:b(d.operator)?"Valeur min":"Valeur"}),z&&te.length>0?e.jsxs("select",{value:d.value,onChange:P=>E(k,{value:P.target.value}),className:"adv-filter-select",children:[e.jsx("option",{value:"",children:"Sélectionnez..."}),te.map(P=>e.jsx("option",{value:P.label,children:P.label},P.id))]}):e.jsx("input",{type:$e(d.fieldType),value:d.value,onChange:P=>E(k,{value:P.target.value}),placeholder:"Saisir une valeur...",className:"adv-filter-input",autoFocus:!0})]}),b(d.operator)&&e.jsxs("div",{className:"adv-filter-row",children:[e.jsx("label",{className:"adv-filter-label",children:"Valeur max"}),e.jsx("input",{type:$e(d.fieldType),value:d.value2||"",onChange:P=>E(k,{value2:P.target.value}),placeholder:"Saisir une valeur max...",className:"adv-filter-input"})]}),e.jsxs("div",{className:"adv-filter-row adv-filter-row--actions",children:[e.jsxs("button",{type:"button",className:"adv-filter-btn-done",onClick:()=>y(null),children:[e.jsx("svg",{viewBox:"0 0 24 24",fill:"none",className:"h-3.5 w-3.5",children:e.jsx("path",{d:"M5 13L9 17L19 7",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round"})}),"OK"]}),e.jsx("button",{type:"button",className:"adv-filter-btn-delete",onClick:()=>u(k),children:e.jsxs("svg",{viewBox:"0 0 24 24",fill:"none",className:"h-3.5 w-3.5",children:[e.jsx("path",{d:"M20.5001 6H3.5",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"}),e.jsx("path",{d:"M18.8334 8.5L18.3735 15.3991C18.1965 18.054 18.108 19.3815 17.243 20.1907C16.378 21 15.0476 21 12.3868 21H11.6134C8.9526 21 7.6222 21 6.75719 20.1907C5.89218 19.3815 5.80368 18.054 5.62669 15.3991L5.16675 8.5",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"})]})})]})]}):e.jsxs("button",{type:"button",className:"adv-filter-pill-summary",onClick:()=>y(k),children:[e.jsx("span",{className:"adv-filter-pill-field",children:d.fieldName}),e.jsx("span",{className:"adv-filter-pill-op",children:((G=Ie[d.operator])==null?void 0:G.label)||d.operator}),!B(d.operator)&&e.jsx("span",{className:"adv-filter-pill-value",children:b(d.operator)?`${d.value||"?"} – ${d.value2||"?"}`:z?T(d.fieldId,d.value):d.value||"..."}),e.jsx("button",{type:"button",className:"adv-filter-pill-remove",onClick:P=>{P.stopPropagation(),u(k)},children:e.jsx("svg",{viewBox:"0 0 24 24",fill:"none",className:"h-3 w-3",children:e.jsx("path",{d:"M18 6L6 18M6 6L18 18",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round"})})})]})})]},k)}),e.jsxs("div",{className:"adv-filter-add-row",ref:N,children:[e.jsxs("button",{type:"button",className:"adv-filter-add-btn",onClick:()=>W(!p),children:[e.jsx("svg",{viewBox:"0 0 24 24",fill:"none",className:"h-3.5 w-3.5",children:e.jsx("path",{d:"M12 5V19M5 12H19",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round"})}),"Ajouter un filtre"]}),p&&e.jsxs("div",{className:"adv-filter-field-dropdown",children:[e.jsx("div",{className:"adv-filter-field-dropdown-title",children:"Choisir un champ"}),A.map(d=>e.jsxs("button",{type:"button",className:"adv-filter-field-option",onClick:()=>J(d.id),children:[e.jsx("span",{className:"adv-filter-field-type-badge",children:vt(d.type)}),d.name]},d.id))]})]}),i.length>0&&e.jsx("button",{type:"button",className:"adv-filter-clear",onClick:j,children:"Effacer tous les filtres"})]}),e.jsx("style",{children:`
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

                /* ── AND/OR Logic Toggle ──────────────────── */
                .adv-filter-logic-toggle {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 6px 8px;
                    background: #f8fafc;
                    border-radius: 8px;
                    border: 1px solid #e2e8f0;
                }
                .dark .adv-filter-logic-toggle {
                    background: rgba(255,255,255,0.03);
                    border-color: rgba(255,255,255,0.08);
                }
                .adv-filter-logic-label {
                    font-size: 11px;
                    font-weight: 600;
                    color: #64748b;
                    white-space: nowrap;
                }
                .dark .adv-filter-logic-label {
                    color: #94a3b8;
                }
                .adv-filter-logic-buttons {
                    display: flex;
                    gap: 0;
                    border-radius: 6px;
                    overflow: hidden;
                    border: 1.5px solid #e2e8f0;
                }
                .dark .adv-filter-logic-buttons {
                    border-color: rgba(255,255,255,0.1);
                }
                .adv-filter-logic-btn {
                    padding: 3px 14px;
                    border: none;
                    background: #fff;
                    color: #64748b;
                    font-size: 11px;
                    font-weight: 700;
                    cursor: pointer;
                    transition: all 0.15s;
                    letter-spacing: 0.03em;
                }
                .dark .adv-filter-logic-btn {
                    background: #1b2e4b;
                    color: #94a3b8;
                }
                .adv-filter-logic-btn:first-child {
                    border-right: 1.5px solid #e2e8f0;
                }
                .dark .adv-filter-logic-btn:first-child {
                    border-right-color: rgba(255,255,255,0.1);
                }
                .adv-filter-logic-btn--active {
                    background: var(--primary, #4361ee) !important;
                    color: #fff !important;
                }
                .adv-filter-logic-btn:hover:not(.adv-filter-logic-btn--active) {
                    background: #f1f5f9;
                }
                .dark .adv-filter-logic-btn:hover:not(.adv-filter-logic-btn--active) {
                    background: rgba(255,255,255,0.06);
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
                    padding: 1px 8px;
                    border-radius: 4px;
                    text-transform: uppercase;
                }
                .adv-filter-connector-badge--or {
                    color: #f59e0b;
                    background: rgba(245, 158, 11, 0.1);
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
            `})]})}function vt(t){return{text:"Aa",title:"T",email:"@",phone:"☎",url:"🔗",number:"#",currency:"$",percent:"%",date:"📅",datetime:"🕐",textarea:"¶",select:"☰",relation:"↗",classification:"●"}[t]||"Aa"}function kt({entityName:t,entityNamePlural:i,entityIcon:o,accountNumber:a,entitySlug:f,showSidebar:v,onToggleSidebar:g,filters:C=[],activeFilters:c={},onFilterChange:m,columns:y=[],fieldFilters:p=[],onFieldFiltersChange:W,allRecords:N=[],filterLogic:D="AND",onFilterLogicChange:A}){const[J,E]=r.useState(!1),u=r.useRef(null);if(r.useEffect(()=>{const b=S=>{J&&u.current&&!u.current.contains(S.target)&&E(!1)};return J&&document.addEventListener("mousedown",b),()=>document.removeEventListener("mousedown",b)},[J]),!v)return null;const j=(b,S)=>{const U={...c},T=U[b]||[];if(S==="__all__")delete U[b];else{const d=T.indexOf(S);d>-1?(T.splice(d,1),T.length===0?delete U[b]:U[b]=[...T]):U[b]=[...T,S]}m(U)},B=Object.keys(c).length>0;return e.jsxs("div",{className:"panel z-10 w-full max-w-xs flex-none space-y-4 overflow-hidden p-4 h-full",style:{display:"flex",flexDirection:"column"},children:[e.jsxs("div",{className:"flex items-center justify-between",children:[e.jsx("div",{className:"flex items-center",children:e.jsxs("div",{className:"flex items-center text-center",children:[e.jsx("div",{children:o?e.jsx("iconify-icon",{icon:o,width:"22",style:{color:"var(--primary)"}}):e.jsxs("svg",{width:"24",height:"24",viewBox:"0 0 24 24",fill:"none",xmlns:"http://www.w3.org/2000/svg",className:"h-5 w-5",children:[e.jsx("path",{d:"M20.3116 12.6473L20.8293 10.7154C21.4335 8.46034 21.7356 7.3328 21.5081 6.35703C21.3285 5.58657 20.9244 4.88668 20.347 4.34587C19.6157 3.66095 18.4881 3.35883 16.2331 2.75458C13.978 2.15033 12.8504 1.84821 11.8747 2.07573C11.1042 2.25537 10.4043 2.65945 9.86351 3.23687C9.27709 3.86298 8.97128 4.77957 8.51621 6.44561C8.43979 6.7254 8.35915 7.02633 8.27227 7.35057L8.27222 7.35077L7.75458 9.28263C7.15033 11.5377 6.84821 12.6652 7.07573 13.641C7.25537 14.4115 7.65945 15.1114 8.23687 15.6522C8.96815 16.3371 10.0957 16.6392 12.3508 17.2435L12.3508 17.2435C14.3834 17.7881 15.4999 18.0873 16.415 17.9744C16.5152 17.9621 16.6129 17.9448 16.7092 17.9223C17.4796 17.7427 18.1795 17.3386 18.7203 16.7612C19.4052 16.0299 19.7074 14.9024 20.3116 12.6473Z",stroke:"currentColor",strokeWidth:"1.5"}),e.jsx("path",{opacity:"0.5",d:"M16.415 17.9741C16.2065 18.6126 15.8399 19.1902 15.347 19.6519C14.6157 20.3368 13.4881 20.6389 11.2331 21.2432C8.97798 21.8474 7.85044 22.1495 6.87466 21.922C6.10421 21.7424 5.40432 21.3383 4.86351 20.7609C4.17859 20.0296 3.87647 18.9021 3.27222 16.647L2.75458 14.7151C2.15033 12.46 1.84821 11.3325 2.07573 10.3567C2.25537 9.58627 2.65945 8.88638 3.23687 8.34557C3.96815 7.66065 5.09569 7.35853 7.35077 6.75428C7.77741 6.63996 8.16368 6.53646 8.51621 6.44531",stroke:"currentColor",strokeWidth:"1.5"}),e.jsx("path",{d:"M11.7769 10L16.6065 11.2941",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"}),e.jsx("path",{opacity:"0.5",d:"M11 12.8975L13.8978 13.6739",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"})]})}),e.jsx("h3",{className:"text-lg font-semibold ltr:ml-3 rtl:mr-3",children:t})]})}),e.jsxs("div",{className:"dropdown relative",ref:u,children:[e.jsx("button",{type:"button",className:"flex h-8 w-8 items-center justify-center rounded-full bg-[#f4f4f4] hover:bg-primary-light dark:bg-[#1b2e4b]",onClick:()=>E(!J),children:e.jsxs("svg",{width:"24",height:"24",viewBox:"0 0 24 24",fill:"none",xmlns:"http://www.w3.org/2000/svg",className:"h-5 w-5 opacity-70",children:[e.jsx("circle",{cx:"5",cy:"12",r:"2",stroke:"currentColor",strokeWidth:"1.5"}),e.jsx("circle",{opacity:"0.5",cx:"12",cy:"12",r:"2",stroke:"currentColor",strokeWidth:"1.5"}),e.jsx("circle",{cx:"19",cy:"12",r:"2",stroke:"currentColor",strokeWidth:"1.5"})]})}),J&&e.jsxs("ul",{className:"whitespace-nowrap absolute right-0 top-full mt-1 z-50 min-w-[160px] rounded-md border border-gray-200 bg-white py-1 shadow-lg dark:border-[#1b2e4b] dark:bg-[#0e1726]",children:[e.jsx("li",{children:e.jsxs("a",{href:"javascript:;",onClick:()=>E(!1),className:"flex items-center px-4 py-2 text-sm hover:bg-gray-100 hover:text-primary dark:hover:bg-[#181F32] dark:hover:text-primary",children:[e.jsx("iconify-icon",{icon:"solar:settings-bold-duotone",className:"h-4.5 w-4.5 shrink-0 ltr:mr-1 rtl:ml-1",width:"18",style:{marginRight:"6px"}}),"Paramètres"]})}),e.jsx("li",{children:e.jsxs("a",{href:"javascript:;",onClick:()=>E(!1),className:"flex items-center px-4 py-2 text-sm hover:bg-gray-100 hover:text-primary dark:hover:bg-[#181F32] dark:hover:text-primary",children:[e.jsx("iconify-icon",{icon:"solar:question-circle-bold-duotone",className:"h-4.5 w-4.5 shrink-0 ltr:mr-1 rtl:ml-1",width:"18",style:{marginRight:"6px"}}),"Aide"]})})]})]})]}),e.jsx("div",{className:"h-px w-full border-b border-[#e0e6ed] dark:border-[#1b2e4b]"}),e.jsx("div",{className:"!mt-0",style:{flex:1,display:"flex",flexDirection:"column"},children:e.jsxs("div",{className:"flex h-full flex-col pb-16",style:{position:"relative"},children:[e.jsx("div",{className:"relative -mr-3.5 h-full grow pr-3.5 overflow-auto",children:e.jsxs("div",{className:"space-y-1",children:[e.jsx("button",{type:"button",className:`flex h-10 w-full items-center justify-between rounded-md p-2 font-medium hover:bg-white-dark/10 hover:text-primary dark:hover:bg-[#181F32] dark:hover:text-primary ${B?"":"bg-gray-100 dark:text-primary text-primary dark:bg-[#181F32]"}`,onClick:()=>m({}),children:e.jsxs("div",{className:"flex items-center",children:[e.jsx("iconify-icon",{icon:"solar:checklist-minimalistic-bold-duotone",width:"20"}),e.jsxs("div",{className:"ltr:ml-3 rtl:mr-3",children:["Toutes les ",i||t]})]})}),e.jsx("button",{type:"button",className:`flex h-10 w-full items-center justify-between rounded-md p-2 font-medium hover:bg-white-dark/10 hover:text-primary dark:hover:bg-[#181F32] dark:hover:text-primary ${c.__favourites?"bg-gray-100 dark:text-primary text-primary dark:bg-[#181F32]":""}`,onClick:()=>{const b={...c};b.__favourites?delete b.__favourites:b.__favourites=!0,m(b)},children:e.jsxs("div",{className:"flex items-center",children:[e.jsx("svg",{width:"24",height:"24",viewBox:"0 0 24 24",fill:"none",xmlns:"http://www.w3.org/2000/svg",className:"h-5 w-5",children:e.jsx("path",{d:"M9.15316 5.40838C10.4198 3.13613 11.0531 2 12 2C12.9469 2 13.5802 3.13612 14.8468 5.40837L15.1745 5.99623C15.5345 6.64193 15.7144 6.96479 15.9951 7.17781C16.2757 7.39083 16.6251 7.4699 17.3241 7.62805L17.9605 7.77203C20.4201 8.32856 21.65 8.60682 21.9426 9.54773C22.2352 10.4886 21.3968 11.4691 19.7199 13.4299L19.2861 13.9372C18.8096 14.4944 18.5713 14.773 18.4641 15.1177C18.357 15.4624 18.393 15.8341 18.465 16.5776L18.5306 17.2544C18.7841 19.8706 18.9109 21.1787 18.1449 21.7602C17.3788 22.3417 16.2273 21.8115 13.9243 20.7512L13.3285 20.4768C12.6741 20.1755 12.3469 20.0248 12 20.0248C11.6531 20.0248 11.3259 20.1755 10.6715 20.4768L10.0757 20.7512C7.77268 21.8115 6.62118 22.3417 5.85515 21.7602C5.08912 21.1787 5.21588 19.8706 5.4694 17.2544L5.53498 16.5776C5.60703 15.8341 5.64305 15.4624 5.53586 15.1177C5.42868 14.773 5.19043 14.4944 4.71392 13.9372L4.2801 13.4299C2.60325 11.4691 1.76482 10.4886 2.05742 9.54773C2.35002 8.60682 3.57986 8.32856 6.03954 7.77203L6.67589 7.62805C7.37485 7.4699 7.72433 7.39083 8.00494 7.17781C8.28555 6.96479 8.46553 6.64194 8.82547 5.99623L9.15316 5.40838Z",stroke:"currentColor",strokeWidth:"1.5"})}),e.jsx("div",{className:"ltr:ml-3 rtl:mr-3",children:"Favourites"})]})}),C.map(b=>e.jsxs("div",{children:[e.jsx("div",{className:"h-px w-full border-b border-[#e0e6ed] dark:border-[#1b2e4b] my-2"}),e.jsx("div",{className:"px-1 py-2 text-white-dark text-xs uppercase font-semibold tracking-wider",children:b.name}),b.type==="tags"?e.jsx("div",{className:"flex flex-wrap gap-1.5 px-1",children:b.options.map(S=>{const U=(c[b.id]||[]).includes(S.id);return e.jsxs("button",{type:"button",className:"mb-0 py-0.5 px-2.5 text-xs rounded-full cursor-pointer transition-all font-medium",style:{border:`1.5px solid ${S.color||"#9ca3af"}`,color:U?"#fff":S.color||"#9ca3af",backgroundColor:U?S.color||"#9ca3af":"transparent"},onClick:()=>j(b.id,S.id),children:[S.label,S.count!==void 0&&e.jsx("span",{style:{opacity:.7,marginLeft:"2px"},children:S.count})]},S.id)})}):e.jsx("div",{className:"space-y-0.5",children:b.options.map(S=>{const U=(c[b.id]||[]).includes(S.id);return e.jsxs("button",{type:"button",className:`flex h-9 w-full items-center rounded-md px-2 py-1.5 text-sm font-medium transition-colors hover:bg-white-dark/10 hover:text-primary dark:hover:bg-[#181F32] dark:hover:text-primary ${U?"bg-gray-100 text-primary dark:bg-[#181F32] dark:text-primary":""}`,onClick:()=>j(b.id,S.id),children:[e.jsx("span",{className:"inline-block w-3 h-3 rounded-full mr-2.5 flex-shrink-0",style:{backgroundColor:S.color||"#9ca3af"}}),e.jsx("span",{className:"truncate",children:S.label}),S.count!==void 0&&e.jsx("span",{className:"ml-auto text-xs opacity-60",children:S.count})]},S.id)})})]},b.id)),e.jsx(bt,{columns:y,fieldFilters:p,onFieldFiltersChange:W,allRecords:N,sidebarFilters:C,filterLogic:D,onFilterLogicChange:A})]})}),e.jsx("div",{className:"absolute bottom-0 w-full p-4 left-0",children:e.jsxs("a",{href:`/account/${a}/record/${f}/add`,className:"btn btn-primary w-full",children:[e.jsxs("svg",{xmlns:"http://www.w3.org/2000/svg",width:"24px",height:"24px",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round",className:"h-5 w-5 ltr:mr-2 rtl:ml-2",children:[e.jsx("line",{x1:"12",y1:"5",x2:"12",y2:"19"}),e.jsx("line",{x1:"5",y1:"12",x2:"19",y2:"12"})]}),"Ajouter"]})})]})})]})}const wt=["#4361ee","#e7515a","#00ab55","#e2a03f","#8b5cf6","#06b6d4","#ec4899","#f59e0b","#10b981","#6366f1"];function yt(t){return{contains:"⊃",not_contains:"⊅",equals:"=",not_equals:"≠",starts_with:"A…",ends_with:"…Z",gt:">",gte:"≥",lt:"<",lte:"≤",between:"↔",is_empty:"∅",is_not_empty:"∃"}[t]||t}function jt({savedViews:t=[],activeViewId:i,onSelectView:o,onCreateView:a,onDeleteView:f,onRenameView:v,onUpdateViewFilters:g,hasActiveFilters:C=!1,activeFilters:c={},fieldFilters:m=[],sidebarFilters:y=[],externalOpenCreate:p=!1,onCloseExternalCreate:W}){const[N,D]=r.useState(!1),[A,J]=r.useState(!1),[E,u]=r.useState(""),[j,B]=r.useState("#4361ee"),[b,S]=r.useState(null),[U,T]=r.useState(null),[d,k]=r.useState(""),Q=r.useRef(null),w=r.useRef(null),z=r.useRef(null);r.useEffect(()=>{const s=h=>{b&&Q.current&&!Q.current.contains(h.target)&&S(null)};return b&&document.addEventListener("mousedown",s),()=>document.removeEventListener("mousedown",s)},[b]),r.useEffect(()=>{N&&w.current&&setTimeout(()=>{var s;return(s=w.current)==null?void 0:s.focus()},100)},[N]),r.useEffect(()=>{p&&(D(!0),W==null||W())},[p]),r.useEffect(()=>{U&&z.current&&(z.current.focus(),z.current.select())},[U]);const te=(s,h)=>{s.preventDefault(),S({viewId:h,x:s.clientX,y:s.clientY})},G=()=>{E.trim()&&(a({name:E.trim(),color:j,filters:c,fieldFilters:m}),u(""),B("#4361ee"),D(!1))},P=s=>{const h=t.find(I=>I._id===s);h&&(T(s),k(h.name)),S(null)},se=()=>{U&&d.trim()&&v(U,d.trim()),T(null),k("")},x=s=>{f(s),S(null)},V=s=>{g(s,c,m),S(null)},H=s=>{var I;let h=0;return s.filters&&(h+=Object.keys(s.filters).filter(R=>R!=="__favourites").length),(I=s.fieldFilters)!=null&&I.length&&(h+=s.fieldFilters.length),h};return e.jsxs(e.Fragment,{children:[e.jsxs("div",{className:"saved-views-tabs",children:[e.jsxs("button",{type:"button",className:`saved-view-tab ${i?"":"saved-view-tab--active"}`,onClick:()=>o(null),children:[e.jsxs("svg",{className:"saved-view-tab-icon",viewBox:"0 0 24 24",fill:"none",children:[e.jsx("path",{d:"M2 12C2 7.28595 2 4.92893 3.46447 3.46447C4.92893 2 7.28595 2 12 2C16.714 2 19.0711 2 20.5355 3.46447C22 4.92893 22 7.28595 22 12C22 16.714 22 19.0711 20.5355 20.5355C19.0711 22 16.714 22 12 22C7.28595 22 4.92893 22 3.46447 20.5355C2 19.0711 2 16.714 2 12Z",stroke:"currentColor",strokeWidth:"1.5"}),e.jsx("path",{d:"M6 12H18",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"}),e.jsx("path",{d:"M6 8H18",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"}),e.jsx("path",{d:"M6 16H18",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"})]}),"Tout"]}),t.map(s=>e.jsx("button",{type:"button",className:`saved-view-tab ${i===s._id?"saved-view-tab--active":""}`,style:{"--tab-color":s.color||"#4361ee"},onClick:()=>o(s._id),onContextMenu:h=>te(h,s._id),children:U===s._id?e.jsx("input",{ref:z,type:"text",value:d,onChange:h=>k(h.target.value),onBlur:se,onKeyDown:h=>{h.key==="Enter"&&se(),h.key==="Escape"&&(T(null),k(""))},className:"saved-view-tab-edit-input",onClick:h=>h.stopPropagation()}):e.jsxs(e.Fragment,{children:[e.jsx("span",{className:"saved-view-tab-dot",style:{backgroundColor:s.color||"#4361ee"}}),e.jsx("span",{className:"saved-view-tab-name",children:s.name}),H(s)>0&&e.jsx("span",{className:"saved-view-tab-badge",children:H(s)})]})},s._id)),e.jsx("button",{type:"button",className:"saved-view-tab saved-view-tab--add",onClick:()=>D(!0),title:"Enregistrer une vue",children:e.jsx("svg",{viewBox:"0 0 24 24",fill:"none",className:"h-3.5 w-3.5",children:e.jsx("path",{d:"M12 5V19M5 12H19",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round"})})})]}),b&&e.jsxs("div",{ref:Q,className:"saved-view-context-menu",style:{position:"fixed",top:b.y,left:b.x,zIndex:10001},children:[e.jsxs("button",{className:"saved-view-context-item",onClick:()=>P(b.viewId),children:[e.jsx("svg",{viewBox:"0 0 24 24",fill:"none",className:"h-4 w-4",children:e.jsx("path",{d:"M13.9027 6.37027L17.6297 10.0973M4 20.0001H8L18.5 9.50006C18.9978 9.00236 19.2786 8.32622 19.2786 7.62142C19.2786 6.91661 18.9978 6.24047 18.5 5.74277C18.0023 5.24508 17.3261 4.96426 16.6213 4.96426C15.9165 4.96426 15.2404 5.24508 14.7427 5.74277L4 16.0001V20.0001Z",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round"})}),"Renommer"]}),e.jsxs("button",{className:"saved-view-context-item",onClick:()=>V(b.viewId),children:[e.jsxs("svg",{viewBox:"0 0 24 24",fill:"none",className:"h-4 w-4",children:[e.jsx("path",{d:"M4.06189 13C4.02104 12.6724 4 12.3387 4 12C4 7.58172 7.58172 4 12 4C14.5006 4 16.7332 5.14727 18.2002 6.94416M19.9381 11C19.979 11.3276 20 11.6613 20 12C20 16.4183 16.4183 20 12 20C9.49944 20 7.26681 18.8527 5.79984 17.0558",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round"}),e.jsx("path",{d:"M15 7H19V3",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round"}),e.jsx("path",{d:"M9 17H5V21",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round"})]}),"Mettre à jour les filtres"]}),e.jsx("div",{className:"saved-view-context-separator"}),e.jsxs("button",{className:"saved-view-context-item saved-view-context-item--danger",onClick:()=>x(b.viewId),children:[e.jsxs("svg",{viewBox:"0 0 24 24",fill:"none",className:"h-4 w-4",children:[e.jsx("path",{d:"M20.5001 6H3.5",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"}),e.jsx("path",{d:"M18.8334 8.5L18.3735 15.3991C18.1965 18.054 18.108 19.3815 17.243 20.1907C16.378 21 15.0476 21 12.3868 21H11.6134C8.9526 21 7.6222 21 6.75719 20.1907C5.89218 19.3815 5.80368 18.054 5.62669 15.3991L5.16675 8.5",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"}),e.jsx("path",{d:"M9.5 11L10 16",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"}),e.jsx("path",{d:"M14.5 11L14 16",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"}),e.jsx("path",{d:"M6.5 6C6.55588 6 6.58382 6 6.60915 5.99936C7.43259 5.97849 8.15902 5.45491 8.43922 4.68032C8.44784 4.65649 8.45667 4.62999 8.47434 4.57697L8.57143 4.28571C8.65431 4.03708 8.69575 3.91276 8.75071 3.8072C8.97001 3.38607 9.37574 3.09364 9.84461 3.01877C9.96213 3 10.0932 3 10.3553 3H13.6447C13.9068 3 14.0379 3 14.1554 3.01877C14.6243 3.09364 15.03 3.38607 15.2493 3.8072C15.3043 3.91276 15.3457 4.03708 15.4286 4.28571L15.5257 4.57697C15.5433 4.62992 15.5522 4.65651 15.5608 4.68032C15.841 5.45491 16.5674 5.97849 17.3909 5.99936C17.4162 6 17.4441 6 17.5 6",stroke:"currentColor",strokeWidth:"1.5"})]}),"Supprimer"]})]}),N&&e.jsx("div",{className:"saved-view-modal-overlay",onClick:()=>D(!1),children:e.jsxs("div",{className:"saved-view-modal",onClick:s=>s.stopPropagation(),children:[e.jsxs("div",{className:"saved-view-modal-header",children:[e.jsx("h3",{children:"Enregistrer la vue"}),e.jsx("button",{type:"button",className:"saved-view-modal-close",onClick:()=>D(!1),children:e.jsx("svg",{viewBox:"0 0 24 24",fill:"none",className:"h-5 w-5",children:e.jsx("path",{d:"M18 6L6 18M6 6L18 18",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"})})})]}),e.jsxs("div",{className:"saved-view-modal-body",children:[e.jsxs("div",{className:"saved-view-form-group",children:[e.jsx("label",{className:"saved-view-form-label",children:"Nom de la vue"}),e.jsx("input",{ref:w,type:"text",value:E,onChange:s=>u(s.target.value),onKeyDown:s=>{s.key==="Enter"&&G()},placeholder:"Ex: Hôtels, Clients VIP...",className:"saved-view-form-input"})]}),e.jsxs("div",{className:"saved-view-form-group",children:[e.jsx("label",{className:"saved-view-form-label",children:"Couleur"}),e.jsx("div",{className:"saved-view-color-grid",children:wt.map(s=>e.jsx("button",{type:"button",className:`saved-view-color-swatch ${j===s?"saved-view-color-swatch--active":""}`,style:{backgroundColor:s},onClick:()=>B(s),children:j===s&&e.jsx("svg",{viewBox:"0 0 24 24",fill:"none",className:"h-3 w-3",children:e.jsx("path",{d:"M5 13L9 17L19 7",stroke:"white",strokeWidth:"2.5",strokeLinecap:"round",strokeLinejoin:"round"})})},s))})]}),e.jsxs("div",{className:"saved-view-form-group",children:[e.jsx("label",{className:"saved-view-form-label",children:"Filtres actifs"}),Object.keys(c).filter(s=>s!=="__favourites").length>0||m.length>0?e.jsxs("div",{className:"saved-view-filter-summary",children:[Object.keys(c).filter(s=>s!=="__favourites").map(s=>{const h=y.find(R=>R.id===s),I=c[s]||[];return e.jsxs("div",{className:"saved-view-filter-group",children:[e.jsxs("span",{className:"saved-view-filter-group-label",children:[(h==null?void 0:h.name)||"Filtre",":"]}),e.jsx("div",{className:"saved-view-filter-tags",children:I.map(R=>{var X;const M=(X=h==null?void 0:h.options)==null?void 0:X.find(F=>F.id===R);return e.jsx("span",{className:"saved-view-filter-tag",style:{borderColor:(M==null?void 0:M.color)||"#9ca3af",color:(M==null?void 0:M.color)||"#9ca3af"},children:(M==null?void 0:M.label)||R},R)})})]},s)}),m.length>0&&e.jsxs("div",{className:"saved-view-filter-group",children:[e.jsx("span",{className:"saved-view-filter-group-label",children:"Filtres avancés:"}),e.jsx("div",{className:"saved-view-filter-tags",children:m.map((s,h)=>e.jsxs("span",{className:"saved-view-filter-tag",style:{borderColor:"#4361ee",color:"#4361ee"},children:[s.fieldName," ",yt(s.operator)," ",s.value||""]},h))})]})]}):e.jsx("p",{className:"saved-view-no-filters",children:"Aucun filtre actif. Utilisez la sidebar pour filtrer d'abord."})]})]}),e.jsxs("div",{className:"saved-view-modal-footer",children:[e.jsx("button",{type:"button",className:"saved-view-btn saved-view-btn--cancel",onClick:()=>D(!1),children:"Annuler"}),e.jsxs("button",{type:"button",className:"saved-view-btn saved-view-btn--save",onClick:G,disabled:!E.trim(),children:[e.jsx("svg",{viewBox:"0 0 24 24",fill:"none",className:"h-4 w-4",children:e.jsx("path",{d:"M5 13L9 17L19 7",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round"})}),"Enregistrer"]})]})]})}),e.jsx("style",{children:`
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
            `})]})}function Ct(t,i){var a;if(i==="title")return t.referenceTitle||t.computedTitle||t.title||"";if(i==="createdAt")return t.createdAt||"";if(i==="updatedAt")return t.updatedAt||"";if(i.startsWith("rel:")){const f=i.replace("rel:",""),v=(t.relations||[]).find(C=>C.key===f);if(v)return v.title||v.computedTitle||"";const g=(a=t._denorm)==null?void 0:a[f];return g&&(g.title||g.computedTitle)||""}if(i.startsWith("classif:")){const f=i.replace("classif:","");return(t.classificationValues||[]).filter(C=>{var c;return((c=C.classificationId)==null?void 0:c.toString())===f}).map(C=>C.label||C.optionLabel||"").join(", ")}const o=(t.customFields||[]).find(f=>{var v,g,C;return((g=(v=f.field_id)==null?void 0:v._id)==null?void 0:g.toString())===i||((C=f.field_id)==null?void 0:C.toString())===i});return(o==null?void 0:o.value)??""}function Nt(t,i){const{operator:o,value:a,value2:f,fieldType:v}=i,g=["number","currency","percent"].includes(v),C=["date","datetime"].includes(v),c=String(t??"").trim(),m=c.toLowerCase(),y=String(a??"").trim().toLowerCase();switch(o){case"contains":return m.includes(y);case"not_contains":return!m.includes(y);case"equals":return g?parseFloat(c)===parseFloat(a):m===y;case"not_equals":return g?parseFloat(c)!==parseFloat(a):m!==y;case"starts_with":return m.startsWith(y);case"ends_with":return m.endsWith(y);case"gt":return C?new Date(t)>new Date(a):parseFloat(c)>parseFloat(a);case"gte":return C?new Date(t)>=new Date(a):parseFloat(c)>=parseFloat(a);case"lt":return C?new Date(t)<new Date(a):parseFloat(c)<parseFloat(a);case"lte":return C?new Date(t)<=new Date(a):parseFloat(c)<=parseFloat(a);case"between":{if(C){const W=new Date(t);return W>=new Date(a)&&W<=new Date(f)}const p=parseFloat(c);return p>=parseFloat(a)&&p<=parseFloat(f)}case"is_empty":return c===""||t==null;case"is_not_empty":return c!==""&&t!=null;default:return!0}}function Lt({accountId:t,accountNumber:i,entityId:o,viewId:a,entityName:f,entityNamePlural:v,entitySlug:g}){const[C,c]=r.useState([]),[m,y]=r.useState([]),[p,W]=r.useState([]),[N,D]=r.useState([]),[A,J]=r.useState(!0),[E,u]=r.useState(null),[j,B]=r.useState(""),[b,S]=r.useState("table"),[U,T]=r.useState(""),[d,k]=r.useState(null),[Q,w]=r.useState([]),[z,te]=r.useState({}),[G,P]=r.useState([]),[se,x]=r.useState("AND"),[V,H]=r.useState([]),[s,h]=r.useState(null),[I,R]=r.useState(!1),[M,X]=r.useState({columns:[],sort:{field:"createdAt",direction:"desc"},density:"normal",pageSize:10,titleDisplay:"avatar",showSidebar:!0,viewMode:null,enabledViews:["table","kanban","notes"]}),[F,ae]=r.useState({page:1,limit:10,total:0,pages:0}),l=r.useRef(null),Z=r.useCallback(async()=>{var n,L;try{J(!0),u(null);const _=new URLSearchParams({limit:1e4,sort:`${M.sort.field}:${M.sort.direction}`}),O=await fetch(`/account/${i}/api/entity/${o}/views/${a}/records?${_}`,{credentials:"include"});if(!O.ok)throw new Error(`HTTP ${O.status}`);const $=await O.json();if(c($.records||[]),y($.records||[]),$.entity&&(k($.entity),$.entity.icon&&T($.entity.icon)),$.filters&&w($.filters),$.preferences)if(X(K=>{var Y,ie;return{...K,...$.preferences,columns:(Y=$.preferences.columns)!=null&&Y.length?$.preferences.columns:((ie=$.columns)==null?void 0:ie.map(re=>({id:re.id,visible:!0})))||[]}}),$.preferences.pageSize&&ae(K=>({...K,limit:$.preferences.pageSize})),$.preferences.viewMode&&S($.preferences.viewMode),(n=$.preferences.columns)!=null&&n.length&&((L=$.columns)!=null&&L.length)){const K=[];$.preferences.columns.forEach(Y=>{const ie=$.columns.find(re=>re.id===Y.id);ie&&K.push(ie)}),$.columns.forEach(Y=>{K.find(ie=>ie.id===Y.id)||K.push(Y)}),D(K)}else D($.columns||[]);else $.columns&&(D($.columns||[]),X(K=>({...K,columns:$.columns.map(Y=>({id:Y.id,visible:!0}))})))}catch(_){console.error("[RecordsGrid] Fetch error:",_),u(_.message)}finally{J(!1)}},[i,o,a,M.sort]),q=r.useCallback(async()=>{try{const n=await fetch(`/account/${i}/api/entity/${o}/saved-views`,{credentials:"include"});if(n.ok){const L=await n.json();H(L.views||[])}}catch(n){console.error("[RecordsGrid] Fetch saved views error:",n)}},[i,o]),ee=r.useCallback(async({name:n,color:L,filters:_,fieldFilters:O})=>{try{const $=await fetch(`/account/${i}/api/entity/${o}/saved-views`,{method:"POST",headers:{"Content-Type":"application/json"},credentials:"include",body:JSON.stringify({name:n,color:L,filters:_,fieldFilters:O})});if($.ok){const K=await $.json();H(Y=>[...Y,K.view]),h(K.view._id)}}catch($){console.error("[RecordsGrid] Create saved view error:",$)}},[i,o]),de=r.useCallback(async n=>{try{(await fetch(`/account/${i}/api/entity/${o}/saved-views/${n}`,{method:"DELETE",credentials:"include"})).ok&&(H(_=>_.filter(O=>O._id!==n)),s===n&&(h(null),te({}),ae(_=>({..._,page:1}))))}catch(L){console.error("[RecordsGrid] Delete saved view error:",L)}},[i,o,s]),le=r.useCallback(async(n,L)=>{try{(await fetch(`/account/${i}/api/entity/${o}/saved-views/${n}`,{method:"PUT",headers:{"Content-Type":"application/json"},credentials:"include",body:JSON.stringify({name:L})})).ok&&H(O=>O.map($=>$._id===n?{...$,name:L}:$))}catch(_){console.error("[RecordsGrid] Rename saved view error:",_)}},[i,o]),ue=r.useCallback(async(n,L,_)=>{try{(await fetch(`/account/${i}/api/entity/${o}/saved-views/${n}`,{method:"PUT",headers:{"Content-Type":"application/json"},credentials:"include",body:JSON.stringify({filters:L,fieldFilters:_||[]})})).ok&&H($=>$.map(K=>K._id===n?{...K,filters:L,fieldFilters:_||[]}:K))}catch(O){console.error("[RecordsGrid] Update saved view filters error:",O)}},[i,o]),ye=r.useCallback(n=>{if(!n){h(null),te({}),P([]),ae(_=>({..._,page:1}));return}const L=V.find(_=>_._id===n);L&&(h(n),te(L.filters||{}),P(L.fieldFilters||[]),ae(_=>({..._,page:1})))},[V]);r.useEffect(()=>{Z(),q()},[]);const xe=r.useMemo(()=>{if(!C.length)return[];const{field:n,direction:L}=M.sort,_=L==="asc"?1:-1;return[...C].sort((O,$)=>{let K,Y;if(n==="title")K=(O.referenceTitle||O.title||"").toLowerCase(),Y=($.referenceTitle||$.title||"").toLowerCase();else if(n==="createdAt"||n==="updatedAt")K=new Date(O[n]||0).getTime(),Y=new Date($[n]||0).getTime();else{const ie=(O.customFields||[]).find(oe=>{var ce;const ne=((ce=oe.field_id)==null?void 0:ce._id)||oe.field_id;return(ne==null?void 0:ne.toString())===n}),re=($.customFields||[]).find(oe=>{var ce;const ne=((ce=oe.field_id)==null?void 0:ce._id)||oe.field_id;return(ne==null?void 0:ne.toString())===n});K=((ie==null?void 0:ie.value)||"").toString().toLowerCase(),Y=((re==null?void 0:re.value)||"").toString().toLowerCase()}return K<Y?-1*_:K>Y?1*_:0})},[C,M.sort.field,M.sort.direction]),je=r.useMemo(()=>xe.map(n=>({...n,_searchIndex:[n.title||"",n.referenceTitle||"",n.computedTitle||"",...(n.customFields||[]).map(L=>L.value||"")].join(" ").toLowerCase()})),[xe]),Ce=r.useCallback((n,L,_,O)=>{let $=n;if(L&&L.trim()){const Y=L.toLowerCase();$=$.filter(ie=>ie._searchIndex.includes(Y))}const K=Object.keys(_).filter(Y=>Y!=="__favourites");return K.length>0&&($=$.filter(Y=>{const ie=Y.classificationValues||[];return K.every(re=>{const oe=_[re];return!oe||oe.length===0?!0:ie.some(ne=>{var ce,Le;return((ce=ne.classificationId)==null?void 0:ce.toString())===re&&oe.includes((Le=ne.optionId)==null?void 0:Le.toString())})})})),O&&O.length>0&&($=$.filter(Y=>(se==="OR"?O.some.bind(O):O.every.bind(O))(re=>{const oe=Ct(Y,re.fieldId);return Nt(oe,re)}))),$},[se]),Re=r.useCallback(n=>{var _;const L=typeof n=="string"?n:((_=n==null?void 0:n.target)==null?void 0:_.value)||"";B(L),ae(O=>({...O,page:1}))},[]),Ve=r.useCallback(n=>{te(n),ae(L=>({...L,page:1}))},[]),Te=r.useCallback(n=>{P(n),ae(L=>({...L,page:1}))},[]);r.useEffect(()=>{const n=Ce(je,j,z,G);y(n)},[je,j,z,G,se,Ce]),r.useEffect(()=>{const n=(F.page-1)*F.limit,L=n+F.limit,_=m.slice(n,L);W(_),ae(O=>({...O,total:m.length,pages:Math.ceil(m.length/F.limit)}))},[m,F.page,F.limit]);const fe=r.useCallback(async n=>{try{await fetch(`/account/${i}/api/user/view-preferences`,{method:"POST",headers:{"Content-Type":"application/json"},credentials:"include",body:JSON.stringify({viewId:a,preferences:n})})}catch(L){console.error("[RecordsGrid] Save preferences error:",L)}},[i,a]),pe=r.useCallback((n,L)=>{const _={...M,[n]:L};X(_),fe(_),n==="pageSize"&&ae(O=>({...O,limit:L,page:1}))},[M,fe]),Ee=r.useCallback(n=>{S(n),X(L=>{const _={...L,viewMode:n};return fe(_),_})},[fe]),me=r.useCallback(n=>{ae(L=>({...L,page:n}))},[]),Ae=r.useCallback((n,L)=>{D(_=>{const O=_.findIndex(re=>re.id===n),$=_.findIndex(re=>re.id===L);if(O===-1||$===-1)return _;const K=[..._],[Y]=K.splice(O,1);K.splice($,0,Y);const ie=K.map(re=>M.columns.find(ne=>ne.id===re.id)||{id:re.id,visible:!0});return pe("columns",ie),K})},[M.columns,pe]),Ne=r.useMemo(()=>{switch(M.density){case"compact":return 36;case"comfortable":return 56;default:return 44}},[M.density]),be=Oe({count:p.length,getScrollElement:()=>l.current,estimateSize:()=>Ne,overscan:10});r.useEffect(()=>{be.measure()},[Ne,be]);const Be=r.useMemo(()=>{var _;let n;(_=M.columns)!=null&&_.length?n=N.filter(O=>{const $=M.columns.find(K=>K.id===O.id);return $?$.visible!==!1:!0}):n=N;const L=n.findIndex(O=>O.id==="actions");if(L>-1&&L<n.length-1){const[O]=n.splice(L,1);n=[...n,O]}return n},[N,M.columns]);return A&&p.length===0?e.jsx("div",{className:"flex items-center justify-center h-64",children:e.jsx("div",{className:"animate-spin rounded-full h-8 w-8 border-b-2 border-primary"})}):E&&p.length===0?e.jsx("div",{className:"flex items-center justify-center h-64 text-danger",children:e.jsxs("span",{children:["Erreur: ",E]})}):e.jsxs("div",{className:"relative flex h-full gap-5 sm:min-h-0",children:[e.jsx(kt,{entityName:f,entityNamePlural:v,entityIcon:U,accountNumber:i,entitySlug:g,showSidebar:M.showSidebar!==!1,onToggleSidebar:()=>pe("showSidebar",!M.showSidebar),filters:Q,activeFilters:z,onFilterChange:Ve,columns:N,fieldFilters:G,onFieldFiltersChange:Te,allRecords:C,filterLogic:se,onFilterLogicChange:x}),e.jsxs("div",{className:"panel p-4 flex-1 flex flex-col overflow-hidden h-full",children:[e.jsx(rt,{searchQuery:j,onSearch:Re,columns:N,preferences:M,onPreferencesChange:pe,loading:A,accountNumber:i,entitySlug:g,viewId:a,showSidebar:M.showSidebar!==!1,onToggleSidebar:()=>pe("showSidebar",!M.showSidebar),activeView:b,onViewChange:Ee,enabledViews:M.enabledViews||["table","kanban","notes"],onEnabledViewsChange:n=>pe("enabledViews",n),hasActiveFilters:Object.keys(z).filter(n=>n!=="__favourites").length>0||G.length>0,onOpenSaveView:()=>R(!0)}),e.jsx(jt,{savedViews:V,activeViewId:s,onSelectView:ye,onCreateView:ee,onDeleteView:de,onRenameView:le,onUpdateViewFilters:ue,hasActiveFilters:Object.keys(z).filter(n=>n!=="__favourites").length>0||G.length>0,activeFilters:z,fieldFilters:G,sidebarFilters:Q,externalOpenCreate:I,onCloseExternalCreate:()=>R(!1)}),e.jsx("div",{className:"flex-1 flex flex-col overflow-hidden mt-4",children:b==="kanban"?e.jsx(lt,{records:m,columns:N,accountNumber:i,entitySlug:g,viewId:a,entityData:d}):b==="notes"?e.jsx(mt,{records:m,accountNumber:i,entitySlug:g}):e.jsxs("div",{className:"dataTable-wrapper flex-1 flex flex-col overflow-hidden",children:[e.jsx("div",{className:"dataTable-container flex-1 overflow-auto",ref:l,children:e.jsx(st,{records:p,columns:Be,virtualizer:be,sort:M.sort,onSort:n=>{const L=M.sort.field===n&&M.sort.direction==="asc"?"desc":"asc";pe("sort",{field:n,direction:L})},onColumnReorder:Ae,density:M.density,titleDisplay:M.titleDisplay||"avatar",entityIcon:U,accountNumber:i,entitySlug:g})}),e.jsxs("div",{className:"dataTable-bottom flex items-center justify-between border-t pt-4 dark:border-gray-800",children:[e.jsxs("div",{className:"dataTable-info text-gray-500 dark:text-gray-400",children:["Affichage de ",(F.page-1)*F.limit+1," à ",Math.min(F.page*F.limit,F.total)," sur ",F.total]}),e.jsx("nav",{className:"dataTable-pagination",children:e.jsxs("ul",{className:"inline-flex items-center space-x-1 rtl:space-x-reverse",children:[e.jsx("li",{children:e.jsx("button",{onClick:()=>me(F.page-1),disabled:F.page<=1,className:"flex justify-center font-semibold p-2 rounded-full transition bg-white-light text-dark hover:text-white hover:bg-primary dark:text-white-light dark:bg-[#191e3a] dark:hover:bg-primary disabled:opacity-50",children:"«"})}),Array.from({length:Math.min(F.pages,5)},(n,L)=>{let _;return F.pages<=5||F.page<=3?_=L+1:F.page>=F.pages-2?_=F.pages-4+L:_=F.page-2+L,e.jsx("li",{children:e.jsx("button",{onClick:()=>me(_),className:`flex justify-center font-semibold px-3.5 py-2 rounded-full transition ${_===F.page?"bg-primary text-white dark:bg-primary dark:text-white-light":"bg-white-light text-dark hover:text-white hover:bg-primary dark:text-white-light dark:bg-[#191e3a] dark:hover:bg-primary"}`,children:_})},_)}),e.jsx("li",{children:e.jsx("button",{onClick:()=>me(F.page+1),disabled:F.page>=F.pages,className:"flex justify-center font-semibold p-2 rounded-full transition bg-white-light text-dark hover:text-white hover:bg-primary dark:text-white-light dark:bg-[#191e3a] dark:hover:bg-primary disabled:opacity-50",children:"»"})})]})})]})]})})]})]})}function We(){document.querySelectorAll('[data-island="records-grid"]').forEach(t=>{if(t.dataset.mounted==="1")return;t.dataset.mounted="1";const i={accountId:t.dataset.accountId,accountNumber:t.dataset.accountNumber,entityId:t.dataset.entityId,viewId:t.dataset.viewId,entityName:t.dataset.entityName||"Records",entityNamePlural:t.dataset.entityNamePlural||"",entitySlug:t.dataset.entitySlug||"records"};console.log("[RecordsGrid Island] Mounting:",i),Fe(t).render(e.jsx(we.StrictMode,{children:e.jsx(Lt,{...i})}))})}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",We):We();
