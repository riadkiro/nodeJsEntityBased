import{r,j as e,a as ye,R as Ce,c as Ae}from"./chunks/client-CkWOIrXP.js";import{u as Be}from"./chunks/index-CjVSFo3p.js";import{u as ze,a as Se,D as Pe,c as He,b as Ze,d as Ue,s as Ke,K as Ye,T as qe,M as Je,e as Qe,S as Xe,v as Ge,f as et,C as tt}from"./chunks/sortable.esm-DQ9-A8Dw.js";const We=[{id:"table",label:"Tableau",icon:e.jsxs("svg",{viewBox:"0 0 24 24",fill:"none",className:"h-4 w-4",children:[e.jsx("path",{d:"M3 7H21",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"}),e.jsx("path",{d:"M3 12H21",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"}),e.jsx("path",{d:"M3 17H21",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"})]})},{id:"kanban",label:"Kanban",icon:e.jsxs("svg",{viewBox:"0 0 24 24",fill:"none",className:"h-4 w-4",children:[e.jsx("rect",{x:"3",y:"3",width:"5",height:"18",rx:"1",stroke:"currentColor",strokeWidth:"1.5"}),e.jsx("rect",{x:"10",y:"3",width:"5",height:"12",rx:"1",stroke:"currentColor",strokeWidth:"1.5"}),e.jsx("rect",{x:"17",y:"3",width:"4",height:"15",rx:"1",stroke:"currentColor",strokeWidth:"1.5"})]})},{id:"notes",label:"Notes",icon:e.jsxs("svg",{viewBox:"0 0 24 24",fill:"none",className:"h-4 w-4",children:[e.jsx("path",{d:"M2 12C2 7.28595 2 4.92893 3.46447 3.46447C4.92893 2 7.28595 2 12 2C16.714 2 19.0711 2 20.5355 3.46447C22 4.92893 22 7.28595 22 12C22 16.714 22 19.0711 20.5355 20.5355C19.0711 22 16.714 22 12 22C7.28595 22 4.92893 22 3.46447 20.5355C2 19.0711 2 16.714 2 12Z",stroke:"currentColor",strokeWidth:"1.5"}),e.jsx("path",{opacity:"0.5",d:"M2 12H22",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"}),e.jsx("path",{opacity:"0.5",d:"M12 2V22",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"})]})}];function rt({searchQuery:t,onSearch:i,columns:o,preferences:s,onPreferencesChange:j,loading:S,accountNumber:k,entitySlug:M,viewId:p,showSidebar:x,onToggleSidebar:b,activeView:u,onViewChange:D,enabledViews:v=["table","kanban","notes"],onEnabledViewsChange:_,hasActiveFilters:R=!1,onOpenSaveView:se}){var Y,de,fe;const[K,f]=r.useState(!1),[c,y]=r.useState(!1),[A,O]=r.useState(!1),[d,h]=r.useState(!1),[ee,T]=r.useState(""),q=r.useRef(null),E=r.useRef(null),P=r.useRef(null),ae=r.useRef(null),V=r.useRef(null),le=r.useRef(null),oe=r.useRef(null),m=r.useRef(null),I=()=>{f(!1),y(!1),O(!1),h(!1)};r.useEffect(()=>{const n=B=>{B.key==="Escape"&&I()};return document.addEventListener("keydown",n),()=>document.removeEventListener("keydown",n)},[]);const Z=(n,B,J,a)=>{r.useEffect(()=>{const w=te=>{n&&B.current&&!B.current.contains(te.target)&&J.current&&!J.current.contains(te.target)&&a(!1)};return n&&setTimeout(()=>document.addEventListener("mousedown",w),0),()=>document.removeEventListener("mousedown",w)},[n])};Z(K,V,q,f),Z(c,le,E,y),Z(A,oe,P,O),Z(d,m,ae,h);const $=n=>{if(n==="table")return;const B=v.includes(n)?v.filter(J=>J!==n):[...v,n];_(B),u===n&&!B.includes(n)&&D("table")},H=We.filter(n=>v.includes(n.id)),g=n=>{const B=s.columns.some(a=>a.id===n);let J;B?J=s.columns.map(a=>a.id===n?{...a,visible:!a.visible}:a):J=[...s.columns,{id:n,visible:!1}],j("columns",J)},F=n=>{if(!(n!=null&&n.current))return{top:0,right:0};const B=n.current.getBoundingClientRect();return{top:B.bottom+8,right:window.innerWidth-B.right}},W=ee.trim()?o.filter(n=>n.name.toLowerCase().includes(ee.toLowerCase())):o;return e.jsxs("div",{className:"dataTable-top flex items-center mb-0 justify-between gap-2",children:[e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsxs("a",{href:`/account/${k}/record/${M}/add`,className:"btn-add-expandable block rounded-full p-2 bg-white-light/40 hover:bg-white-light/90 hover:text-primary dark:bg-dark/40 dark:hover:bg-dark/60",title:"Ajouter",children:[e.jsx("svg",{className:"btn-add-icon",viewBox:"0 0 24 24",fill:"none",children:e.jsx("path",{d:"M12 5V19M5 12H19",stroke:"currentColor",strokeWidth:"2.5",strokeLinecap:"round"})}),e.jsx("span",{className:"btn-add-label",children:"Ajouter"})]}),e.jsxs("div",{className:"dataTable-search relative w-64",style:{marginLeft:0},children:[e.jsxs("svg",{className:"absolute left-4 top-1/2 ml-2 -translate-y-1/2 h-4 w-4 text-gray-400",viewBox:"0 0 24 24",fill:"none",children:[e.jsx("circle",{cx:"11",cy:"11",r:"8",stroke:"currentColor",strokeWidth:"1.5"}),e.jsx("path",{d:"M16.5 16.5L21 21",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"})]}),e.jsx("input",{type:"text",value:t,onChange:n=>i(n.target.value),placeholder:"Rechercher...",className:"dataTable-input form-input w-full pl-11 pr-10",style:{"padding-left":"33px"}}),S&&e.jsx("div",{className:"absolute right-3 top-1/2 -translate-y-1/2",children:e.jsx("div",{className:"animate-spin rounded-full h-4 w-4 border-b-2 border-primary"})})]})]}),e.jsxs("div",{className:"flex items-center gap-2",children:[H.map(n=>e.jsx("button",{type:"button",onClick:()=>D(n.id),title:n.label,className:`block rounded-full p-2 transition-all ${u===n.id?"bg-primary/20 text-primary":"bg-white-light/40 hover:bg-white-light/90 hover:text-primary dark:bg-dark/40 dark:hover:bg-dark/60"}`,children:n.icon},n.id)),e.jsx("button",{ref:ae,type:"button",onClick:()=>{h(!d),f(!1),y(!1),O(!1)},className:`block rounded-full p-2 transition-all ${d?"bg-primary/20 text-primary":"bg-white-light/40 hover:bg-white-light/90 hover:text-primary dark:bg-dark/40 dark:hover:bg-dark/60"}`,title:"Configurer les vues",children:e.jsxs("svg",{className:"h-4 w-4",viewBox:"0 0 24 24",fill:"none",children:[e.jsx("circle",{cx:"12",cy:"12",r:"3",stroke:"currentColor",strokeWidth:"1.5"}),e.jsx("path",{d:"M12 2V4M12 20V22M2 12H4M20 12H22M4.93 4.93L6.34 6.34M17.66 17.66L19.07 19.07M4.93 19.07L6.34 17.66M17.66 6.34L19.07 4.93",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"})]})}),e.jsx("div",{className:"w-px h-5 bg-gray-200 dark:bg-gray-700 mx-0.5"}),e.jsx("button",{type:"button",onClick:se,className:`block rounded-full p-2 transition-all ${R?"bg-primary/20 text-primary":"bg-white-light/40 hover:bg-white-light/90 hover:text-primary dark:bg-dark/40 dark:hover:bg-dark/60"}`,title:"Filtrer & enregistrer la vue",children:e.jsx("svg",{className:"h-4 w-4",viewBox:"0 0 24 24",fill:"none",children:e.jsx("path",{d:"M22 3H2L10 12.46V19L14 21V12.46L22 3Z",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round"})})}),u==="table"&&(()=>{var B,J;const n=((B=s.sort)==null?void 0:B.field)!=="createdAt"||((J=s.sort)==null?void 0:J.direction)!=="desc";return e.jsx("button",{ref:E,type:"button",onClick:()=>{y(!c),f(!1),O(!1),h(!1)},className:`block rounded-full p-2 transition-all ${c||n?"bg-primary/20 text-primary":"bg-white-light/40 hover:bg-white-light/90 hover:text-primary dark:bg-dark/40 dark:hover:bg-dark/60"}`,title:"Trier",children:e.jsxs("svg",{className:"h-4 w-4",viewBox:"0 0 24 24",fill:"none",children:[e.jsx("path",{d:"M16 18L16 6M16 6L20 10M16 6L12 10",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round"}),e.jsx("path",{d:"M8 6L8 18M8 18L12 14M8 18L4 14",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round"})]})})})(),e.jsx("button",{ref:q,type:"button",onClick:()=>{f(!K),y(!1),O(!1),h(!1)},className:`block rounded-full p-2 transition-all ${K?"bg-primary/20 text-primary":"bg-white-light/40 hover:bg-white-light/90 hover:text-primary dark:bg-dark/40 dark:hover:bg-dark/60"}`,title:"Mode d'affichage",children:e.jsxs("svg",{className:"h-4 w-4",viewBox:"0 0 24 24",fill:"none",children:[e.jsx("path",{d:"M3 7H21",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"}),e.jsx("path",{d:"M6 12H18",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"}),e.jsx("path",{d:"M10 17H14",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"})]})}),u==="table"&&e.jsx("button",{ref:P,type:"button",onClick:()=>{O(!A),f(!1),y(!1),h(!1)},className:`block rounded-full p-2 transition-all ${A?"bg-primary/20 text-primary":"bg-white-light/40 hover:bg-white-light/90 hover:text-primary dark:bg-dark/40 dark:hover:bg-dark/60"}`,title:"Colonnes visibles",children:e.jsxs("svg",{className:"h-4 w-4",viewBox:"0 0 24 24",fill:"none",children:[e.jsx("path",{d:"M9 3H4C3.44772 3 3 3.44772 3 4V11C3 11.5523 3.44772 12 4 12H9C9.55228 12 10 11.5523 10 11V4C10 3.44772 9.55228 3 9 3Z",stroke:"currentColor",strokeWidth:"1.5"}),e.jsx("path",{d:"M20 3H15C14.4477 3 14 3.44772 14 4V7C14 7.55228 14.4477 8 15 8H20C20.5523 8 21 7.55228 21 7V4C21 3.44772 20.5523 3 20 3Z",stroke:"currentColor",strokeWidth:"1.5"}),e.jsx("path",{d:"M20 12H15C14.4477 12 14 12.4477 14 13V20C14 20.5523 14.4477 21 15 21H20C20.5523 21 21 20.5523 21 20V13C21 12.4477 20.5523 12 20 12Z",stroke:"currentColor",strokeWidth:"1.5"}),e.jsx("path",{d:"M9 16H4C3.44772 16 3 16.4477 3 17V20C3 20.5523 3.44772 21 4 21H9C9.55228 21 10 20.5523 10 20V17C10 16.4477 9.55228 16 9 16Z",stroke:"currentColor",strokeWidth:"1.5"})]})}),e.jsxs("button",{type:"button",onClick:b,className:"btn-sidebar-toggle block rounded-full p-2 bg-white-light/40 hover:bg-white-light/90 hover:text-primary dark:bg-dark/40 dark:hover:bg-dark/60",title:x?"Masquer le panneau":"Afficher le panneau",children:[e.jsxs("svg",{className:"btn-sidebar-icon",viewBox:"0 0 24 24",fill:"none",children:[e.jsx("rect",{x:"3",y:"3",width:"18",height:"18",rx:"2",stroke:"currentColor",strokeWidth:"1.5"}),e.jsx("path",{d:"M9 3V21",stroke:"currentColor",strokeWidth:"1.5"})]}),e.jsx("span",{className:"btn-sidebar-label",children:x?"Masquer":"Panneau"})]})]}),c&&ye.createPortal(e.jsxs(e.Fragment,{children:[e.jsx("div",{className:"fixed inset-0",style:{zIndex:9998},onClick:()=>y(!1)}),e.jsxs("div",{ref:le,className:"fixed rounded-xl shadow-xl p-4 w-72 bg-white dark:bg-[#0e1726] border border-gray-100 dark:border-white/10",style:{zIndex:9999,top:F(E).top,right:F(E).right,animation:"popoverSlide 0.15s ease-out"},children:[e.jsx("div",{className:"text-xs font-medium text-gray-500 dark:text-white-dark mb-2",children:"Trier par"}),e.jsxs("div",{className:"flex gap-2",children:[e.jsxs("select",{value:((Y=s.sort)==null?void 0:Y.field)||"createdAt",onChange:n=>j("sort",{...s.sort,field:n.target.value}),className:"flex-1 px-2 py-1.5 text-xs border border-gray-200 dark:border-white/10 rounded-lg bg-white dark:bg-[#1b2e4b] text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary/50",children:[e.jsx("option",{value:"createdAt",children:"Date de création"}),e.jsx("option",{value:"title",children:"Titre"}),o.filter(n=>n.id!=="title"&&n.id!=="actions").map(n=>e.jsx("option",{value:n.id,children:n.name},n.id))]}),e.jsx("button",{onClick:()=>{var n;return j("sort",{...s.sort,direction:((n=s.sort)==null?void 0:n.direction)==="asc"?"desc":"asc"})},className:"p-1.5 border border-gray-200 dark:border-white/10 rounded-lg bg-white dark:bg-[#1b2e4b] hover:bg-gray-50 dark:hover:bg-[#253b5c] transition-all",title:((de=s.sort)==null?void 0:de.direction)==="asc"?"Croissant":"Décroissant",children:e.jsx("svg",{className:`h-4 w-4 text-gray-600 dark:text-white transition-transform ${((fe=s.sort)==null?void 0:fe.direction)==="asc"?"rotate-180":""}`,viewBox:"0 0 24 24",fill:"none",children:e.jsx("path",{d:"M12 5V19M12 19L6 13M12 19L18 13",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round"})})}),e.jsx("button",{onClick:()=>j("sort",{field:"createdAt",direction:"desc"}),className:"p-1.5 border border-gray-200 dark:border-white/10 rounded-lg bg-white dark:bg-[#1b2e4b] hover:bg-red-50 hover:border-red-300 hover:text-red-500 dark:hover:bg-red-900/20 transition-all",title:"Réinitialiser le tri",children:e.jsxs("svg",{className:"h-4 w-4 text-gray-600 dark:text-white",viewBox:"0 0 24 24",fill:"none",children:[e.jsx("path",{d:"M4.06189 13C4.02104 12.6724 4 12.3387 4 12C4 7.58172 7.58172 4 12 4C14.5006 4 16.7332 5.14727 18.2002 6.94416M19.9381 11C19.979 11.3276 20 11.6613 20 12C20 16.4183 16.4183 20 12 20C9.49944 20 7.26681 18.8527 5.79984 17.0558",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round"}),e.jsx("path",{d:"M15 7H19V3",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round"}),e.jsx("path",{d:"M9 17H5V21",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round"})]})})]})]})]}),document.body),K&&ye.createPortal(e.jsxs(e.Fragment,{children:[e.jsx("div",{className:"fixed inset-0",style:{zIndex:9998},onClick:()=>f(!1)}),e.jsxs("div",{ref:V,className:"fixed rounded-xl shadow-xl p-4 w-72 bg-white dark:bg-[#0e1726] border border-gray-100 dark:border-white/10",style:{zIndex:9999,top:F(q).top,right:F(q).right,animation:"popoverSlide 0.15s ease-out"},children:[e.jsxs("div",{className:"mb-4",children:[e.jsx("div",{className:"text-xs font-medium text-gray-500 dark:text-white-dark mb-2",children:"Densité"}),e.jsx("div",{className:"flex gap-1",children:["compact","normal","comfortable"].map(n=>e.jsx("button",{onClick:()=>j("density",n),className:`flex-1 px-2 py-1.5 text-xs rounded-lg transition-all ${s.density===n?"bg-primary text-white":"bg-gray-100 dark:bg-dark/40 text-gray-600 dark:text-white-dark/70 hover:bg-gray-200 dark:hover:bg-dark/60"}`,children:n==="compact"?"Compact":n==="normal"?"Normal":"Confort"},n))})]}),e.jsxs("div",{className:"mb-4",children:[e.jsx("div",{className:"text-xs font-medium text-gray-500 dark:text-white-dark mb-2",children:"Lignes par page"}),e.jsx("div",{className:"flex gap-1",children:[10,25,50,100].map(n=>e.jsx("button",{onClick:()=>j("pageSize",n),className:`flex-1 px-2 py-1.5 text-xs rounded-lg transition-all ${s.pageSize===n?"bg-primary text-white":"bg-gray-100 dark:bg-dark/40 text-gray-600 dark:text-white-dark/70 hover:bg-gray-200 dark:hover:bg-dark/60"}`,children:n},n))})]})]})]}),document.body),A&&ye.createPortal(e.jsxs(e.Fragment,{children:[e.jsx("div",{className:"fixed inset-0",style:{zIndex:9998},onClick:()=>O(!1)}),e.jsxs("div",{ref:oe,className:"fixed rounded-xl shadow-xl p-4 w-64 bg-white dark:bg-[#0e1726] border border-gray-100 dark:border-white/10",style:{zIndex:9999,top:F(P).top,right:F(P).right,animation:"popoverSlide 0.15s ease-out"},children:[e.jsx("div",{className:"text-xs font-medium text-gray-500 dark:text-white-dark mb-2",children:"Colonnes visibles"}),e.jsx("div",{className:"relative mb-2",children:e.jsx("input",{type:"text",value:ee,onChange:n=>T(n.target.value),placeholder:"Filtrer...",className:"w-full px-3 py-1.5 text-xs border border-gray-200 dark:border-white/10 rounded-lg bg-white dark:bg-[#1b2e4b] text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary/50"})}),e.jsx("div",{className:"space-y-0.5 max-h-48 overflow-y-auto",children:W.map(n=>{const B=s.columns.find(a=>a.id===n.id),J=B?B.visible!==!1:!0;return e.jsxs("label",{className:"flex items-center gap-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 px-2 py-1.5 rounded-lg",children:[e.jsx("input",{type:"checkbox",checked:J,onChange:()=>g(n.id),className:"form-checkbox text-primary w-3.5 h-3.5 rounded"}),e.jsx("span",{className:"text-xs text-gray-700 dark:text-gray-300",children:n.name})]},n.id)})}),e.jsx("div",{className:"border-t border-gray-100 dark:border-white/10 mt-3 mb-2"}),e.jsxs("div",{children:[e.jsx("div",{className:"text-xs font-medium text-gray-500 dark:text-white-dark mb-2",children:"Affichage titre"}),e.jsx("div",{className:"flex gap-1",children:[{value:"avatar",label:"Avatar"},{value:"icon",label:"Icône"},{value:"none",label:"Aucun"}].map(n=>e.jsx("button",{onClick:()=>j("titleDisplay",n.value),className:`flex-1 px-2 py-1.5 text-xs rounded-lg transition-all ${(s.titleDisplay||"avatar")===n.value?"bg-primary text-white":"bg-gray-100 dark:bg-dark/40 text-gray-600 dark:text-white-dark/70 hover:bg-gray-200 dark:hover:bg-dark/60"}`,children:n.label},n.value))})]})]})]}),document.body),d&&ye.createPortal(e.jsxs(e.Fragment,{children:[e.jsx("div",{className:"fixed inset-0",style:{zIndex:9998},onClick:()=>h(!1)}),e.jsxs("div",{ref:m,className:"fixed rounded-xl shadow-xl p-4 w-64 bg-white dark:bg-[#0e1726] border border-gray-100 dark:border-white/10",style:{zIndex:9999,top:F(ae).top,right:F(ae).right,animation:"popoverSlide 0.15s ease-out"},children:[e.jsx("div",{className:"text-xs font-medium text-gray-500 dark:text-white-dark mb-3",children:"Vues disponibles"}),e.jsx("div",{className:"space-y-1",children:We.map(n=>{const B=v.includes(n.id),J=n.id==="table";return e.jsxs("label",{className:`flex items-center gap-3 cursor-pointer px-2 py-2 rounded-lg transition-all ${J?"opacity-60 cursor-not-allowed":"hover:bg-gray-50 dark:hover:bg-gray-800"}`,children:[e.jsx("input",{type:"checkbox",checked:B,onChange:()=>$(n.id),disabled:J,className:"form-checkbox text-primary w-4 h-4 rounded"}),e.jsxs("span",{className:`flex items-center gap-2 text-sm ${B?"text-gray-700 dark:text-gray-300":"text-gray-400 dark:text-gray-600"}`,children:[n.icon,n.label]})]},n.id)})}),e.jsx("div",{className:"border-t border-gray-100 dark:border-white/10 mt-3 pt-2",children:e.jsx("p",{className:"text-[10px] text-gray-400 dark:text-gray-600",children:"Le tableau est toujours activé par défaut."})})]})]}),document.body),e.jsx("style",{children:`
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
            `})]})}function st({records:t,columns:i,virtualizer:o,sort:s,onSort:j,onColumnReorder:S,density:k,titleDisplay:M,entityIcon:p,accountNumber:x,entitySlug:b}){var f;const[u,D]=r.useState(null),[v,_]=r.useState(null),R=o.getVirtualItems(),se={compact:{rowHeight:36,cellClass:"py-1",fontSize:"text-xs",imageSize:"w-6 h-6",fontWeight:"font-medium"},normal:{rowHeight:44,cellClass:"py-2",fontSize:"text-sm",imageSize:"w-9 h-9",fontWeight:"font-semibold"},comfortable:{rowHeight:56,cellClass:"py-3",fontSize:"text-sm",imageSize:"w-9 h-9",fontWeight:"font-semibold"}},K=se[k]||se.comfortable;return e.jsxs("table",{className:"table-hover whitespace-nowrap dataTable-table w-full",children:[e.jsx("thead",{className:"sticky top-0 bg-white dark:bg-[#1b2e4b] z-10",children:e.jsx("tr",{children:i.map((c,y)=>{const A=(s==null?void 0:s.field)===c.id||c.id==="title"&&(s==null?void 0:s.field)==="title"||c.id==="createdAt"&&(s==null?void 0:s.field)==="createdAt",O=(s==null?void 0:s.direction)||"desc",d=u===c.id,h=v===c.id&&u!==c.id,ee=c.id!=="actions";return e.jsx("th",{"data-sortable":c.sortable!==!1?"":void 0,"data-column-id":c.id,onDragEnter:T=>{T.preventDefault(),c.id!=="actions"&&u&&u!==c.id&&_(c.id)},onDragOver:T=>{T.preventDefault()},onDrop:T=>{T.preventDefault(),u&&u!==c.id&&c.id!=="actions"&&S&&S(u,c.id),D(null),_(null)},className:`px-2 ${c.id==="actions"?"sticky right-0 z-20":""} ${d?"opacity-50":""} ${h?"border-l-2 border-l-primary bg-primary/5":""}`,style:{transition:"opacity 0.15s, border-color 0.15s, background 0.15s",...c.id==="actions"?{width:"1%",whiteSpace:"nowrap"}:{}},children:e.jsxs("div",{className:"flex items-center gap-1",children:[ee&&e.jsx("span",{draggable:"true",onDragStart:T=>{D(c.id),T.dataTransfer.effectAllowed="move",T.dataTransfer.setData("text/plain",c.id)},onDragEnd:()=>{D(null),_(null)},className:"cursor-grab text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300",children:e.jsxs("svg",{className:"h-3 w-3",viewBox:"0 0 24 24",fill:"currentColor",children:[e.jsx("circle",{cx:"9",cy:"6",r:"1.5"}),e.jsx("circle",{cx:"15",cy:"6",r:"1.5"}),e.jsx("circle",{cx:"9",cy:"12",r:"1.5"}),e.jsx("circle",{cx:"15",cy:"12",r:"1.5"}),e.jsx("circle",{cx:"9",cy:"18",r:"1.5"}),e.jsx("circle",{cx:"15",cy:"18",r:"1.5"})]})}),c.sortable!==!1?e.jsxs("a",{href:"#",className:"dataTable-sorter flex items-center gap-1",draggable:"false",onClick:T=>{T.preventDefault(),j(c.id)},children:[c.name,A&&e.jsx("svg",{className:`h-3 w-3 text-primary transition-transform ${O==="asc"?"rotate-180":""}`,viewBox:"0 0 24 24",fill:"none",children:e.jsx("path",{d:"M12 5V19M12 19L6 13M12 19L18 13",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round"})})]}):c.name]})},c.id)})})}),e.jsxs("tbody",{children:[R.length>0&&R[0].start>0&&e.jsx("tr",{children:e.jsx("td",{colSpan:i.length,style:{height:R[0].start,padding:0}})}),R.map(c=>{const y=t[c.index];if(!y)return null;const A={compact:"4px 8px",normal:"8px 12px",comfortable:"12px 12px"}[k]||"12px 12px";return e.jsx("tr",{"data-index":c.index,ref:o.measureElement,style:{minHeight:K.rowHeight},children:i.map(O=>e.jsx("td",{className:`${K.fontSize} ${O.id==="actions"?"sticky right-0 bg-white dark:bg-gray-900":""}`,style:{padding:A,...O.id==="actions"?{width:"1%",whiteSpace:"nowrap"}:{}},children:at(y,O,x,b,K,M,p)},O.id))},y._id)}),R.length>0&&e.jsx("tr",{children:e.jsx("td",{colSpan:i.length,style:{height:Math.max(0,o.getTotalSize()-(((f=R[R.length-1])==null?void 0:f.end)||0)),padding:0}})})]})]})}function at(t,i,o,s,j,S,k){var M,p;switch(i.id){case"title":{const x=t.referenceTitle||t.title||"Sans titre";x.charAt(0).toUpperCase();const b=Math.abs(x.charCodeAt(0)||65)%35+1,u=t.image||`/assets/images/profile-${b}.jpeg`;return e.jsxs("div",{className:"flex items-center gap-2",children:[S==="avatar"&&e.jsx("img",{src:u,alt:x,className:`${j.imageSize} rounded-full max-w-none`}),S==="icon"&&k&&e.jsx("div",{className:`${j.imageSize} rounded-lg max-w-none flex items-center justify-center bg-primary/10 text-primary shrink-0`,children:e.jsx("iconify-icon",{icon:k,width:"16"})}),e.jsx("a",{href:`/account/${o}/record/${s}/${t._id}/edit`,className:`${j.fontWeight} hover:text-primary transition-colors`,children:x})]})}case"createdAt":return new Date(t.createdAt).toLocaleDateString("fr-FR");case"actions":return e.jsxs("div",{className:"flex items-center gap-0",children:[e.jsx("a",{href:`/account/${o}/record/${s}/${t._id}`,className:"p-1 rounded-lg text-gray-500 hover:text-primary hover:bg-primary/10 transition-all",title:"Voir",children:e.jsxs("svg",{className:"h-4 w-4",viewBox:"0 0 24 24",fill:"none",children:[e.jsx("path",{d:"M15 12C15 13.6569 13.6569 15 12 15C10.3431 15 9 13.6569 9 12C9 10.3431 10.3431 9 12 9C13.6569 9 15 10.3431 15 12Z",stroke:"currentColor",strokeWidth:"1.5"}),e.jsx("path",{d:"M12 5C7.5 5 3.73 7.94 2 12C3.73 16.06 7.5 19 12 19C16.5 19 20.27 16.06 22 12C20.27 7.94 16.5 5 12 5Z",stroke:"currentColor",strokeWidth:"1.5"})]})}),e.jsx("a",{href:`/account/${o}/record/${s}/${t._id}/edit`,className:"p-1 rounded-lg text-gray-500 hover:text-info hover:bg-info/10 transition-all",title:"Modifier",children:e.jsx("svg",{className:"h-4 w-4",viewBox:"0 0 24 24",fill:"none",children:e.jsx("path",{d:"M16.862 4.487L18.55 2.8C19.33 2.02 20.59 2.02 21.37 2.8C22.15 3.58 22.15 4.84 21.37 5.62L19.681 7.307M16.862 4.487L4.162 17.187C3.882 17.467 3.682 17.818 3.592 18.198L2.732 21.596C2.642 21.966 2.952 22.296 3.322 22.226L6.892 21.556C7.242 21.486 7.572 21.306 7.832 21.046L20.513 8.366M16.862 4.487L19.681 7.307",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round"})})}),e.jsx("button",{type:"button",className:"p-1 rounded-lg text-gray-500 hover:text-danger hover:bg-danger/10 transition-all",title:"Supprimer",onClick:()=>{confirm("Êtes-vous sûr de vouloir supprimer cet enregistrement ?")&&console.log("Delete record:",t._id)},children:e.jsxs("svg",{className:"h-4 w-4",viewBox:"0 0 24 24",fill:"none",children:[e.jsx("path",{d:"M20.5 6H3.5",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"}),e.jsx("path",{d:"M18.833 8.5L18.373 15.4C18.196 18.054 18.108 19.381 17.243 20.19C16.378 21 15.048 21 12.387 21H11.613C8.952 21 7.622 21 6.757 20.19C5.892 19.381 5.804 18.054 5.627 15.4L5.167 8.5",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"}),e.jsx("path",{d:"M9.5 11L10 16",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"}),e.jsx("path",{d:"M14.5 11L14 16",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"}),e.jsx("path",{d:"M6.5 6C6.556 5.367 6.612 5.1 6.877 4.714C7.178 4.275 7.945 3.917 9.484 3.2L9.924 2.984C10.683 2.589 11.06 2.392 11.476 2.318C11.823 2.254 12.177 2.254 12.524 2.318C12.94 2.392 13.317 2.589 14.076 2.984L14.516 3.2C16.055 3.917 16.822 4.275 17.123 4.714C17.388 5.1 17.444 5.367 17.5 6",stroke:"currentColor",strokeWidth:"1.5"})]})})]});default:{if(i.id.startsWith("rel:")){const x=i.id.substring(4),u=(((M=t._denorm)==null?void 0:M.relations)||[]).find(v=>v.relationKey===x);if(((p=u==null?void 0:u.records)==null?void 0:p.length)>0)return e.jsx("div",{className:"flex flex-wrap gap-1",children:u.records.map((v,_)=>e.jsx("a",{href:`/account/${o}/record/${v.entitySlug||s}/${v._id}`,className:"text-primary hover:underline text-xs",children:v.title||"Sans titre"},_))});const D=(t.relations||[]).find(v=>v.relationKey===x);return D!=null&&D.value?"—":""}if(i.id.startsWith("classif:")){const x=i.id.substring(8),b=(t.classificationValues||[]).find(u=>{var v,_,R;return(((v=u.classificationId)==null?void 0:v.$oid)||((R=(_=u.classificationId)==null?void 0:_.toString)==null?void 0:R.call(_))||u.classificationId)===x});if(b!=null&&b.label){const u=b.color||"#888";return e.jsx("span",{className:"inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap",style:{backgroundColor:`${u}15`,color:u,border:`1px solid ${u}30`},children:b.label})}return b!=null&&b.value?e.jsx("span",{className:"inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20",children:b.value}):""}if(t.customFields){const x=t.customFields.find(u=>{var v;const D=((v=u.field_id)==null?void 0:v._id)||u.field_id;return(D==null?void 0:D.toString())===i.id});if(!x)return"";const b=x.value;if(b&&typeof b=="object"&&b._v){const u=[];return Object.entries(b).forEach(([D,v])=>{D==="_v"||D==="customText"||(Array.isArray(v)?v.forEach(_=>u.push(_)):v&&u.push(v))}),b.customText&&u.push(b.customText),e.jsx("div",{className:"flex flex-wrap gap-1",children:u.map((D,v)=>e.jsx("span",{className:"inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20",children:D},v))})}return b||""}return""}}}function De(t,i=.1){if(!t)return`rgba(99, 102, 241, ${i})`;const o=parseInt(t.slice(1,3),16),s=parseInt(t.slice(3,5),16),j=parseInt(t.slice(5,7),16);return`rgba(${o}, ${s}, ${j}, ${i})`}function it({field:t,record:i}){const o=(i.customFields||[]).find(j=>{var k;const S=((k=j.field_id)==null?void 0:k._id)||j.field_id;return(S==null?void 0:S.toString())===t.id});if(!o)return e.jsx("span",{className:"text-gray-400 dark:text-gray-600 text-sm italic",children:"—"});const s=o.value;if(s==null||s==="")return e.jsx("span",{className:"text-gray-400 dark:text-gray-600 text-sm italic",children:"—"});if(t.type==="date"||t.type==="datetime")try{return e.jsx("span",{className:"text-sm text-gray-700 dark:text-gray-300",children:new Date(s).toLocaleDateString("fr-FR")})}catch{return e.jsx("span",{className:"text-sm text-gray-700 dark:text-gray-300",children:String(s)})}return t.type==="boolean"||t.type==="checkbox"?e.jsxs("span",{className:`inline-flex items-center gap-1 text-sm ${s?"text-success":"text-gray-400"}`,children:[s?e.jsxs("svg",{width:"16",height:"16",viewBox:"0 0 24 24",fill:"none",children:[e.jsx("path",{d:"M9 12l2 2 4-4",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round"}),e.jsx("circle",{cx:"12",cy:"12",r:"10",stroke:"currentColor",strokeWidth:"1.5"})]}):e.jsx("svg",{width:"16",height:"16",viewBox:"0 0 24 24",fill:"none",children:e.jsx("circle",{cx:"12",cy:"12",r:"10",stroke:"currentColor",strokeWidth:"1.5"})}),s?"Oui":"Non"]}):t.type==="relation"?Array.isArray(s)?e.jsx("div",{className:"flex flex-wrap gap-1",children:s.map((j,S)=>e.jsx("span",{className:"inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-primary/10 text-primary font-medium",children:j.title||j.label||j.name||String(j)},S))}):e.jsx("span",{className:"text-sm text-gray-700 dark:text-gray-300",children:s.title||s.label||String(s)}):t.type==="number"?e.jsx("span",{className:"text-sm font-mono text-gray-700 dark:text-gray-300",children:Number(s).toLocaleString("fr-FR")}):e.jsx("span",{className:"text-sm text-gray-700 dark:text-gray-300",children:String(s)})}function ot({record:t,columns:i,accountNumber:o,entitySlug:s,onClose:j}){var K;const S=r.useRef(null),[k,M]=r.useState(!1);r.useEffect(()=>{requestAnimationFrame(()=>M(!0))},[]);const p=r.useCallback(()=>{M(!1),setTimeout(()=>j(),250)},[j]);if(r.useEffect(()=>{const f=c=>{c.key==="Escape"&&p()};return document.addEventListener("keydown",f),()=>document.removeEventListener("keydown",f)},[p]),!t)return null;const x=((K=t._id)==null?void 0:K.$oid)||t._id,b=t.referenceTitle||t.title||t.computedTitle||"Sans titre",u=t.description||"",D=t.createdAt?new Date(t.createdAt).toLocaleDateString("fr-FR",{day:"2-digit",month:"long",year:"numeric"}):null,v=t.updatedAt?new Date(t.updatedAt).toLocaleDateString("fr-FR",{day:"2-digit",month:"long",year:"numeric"}):null,_=(t.classificationValues||[]).filter(f=>f.optionLabel||f.label).map(f=>({label:f.optionLabel||f.label,color:f.optionColor||f.color||"#6366f1",classificationName:f.classificationName||"Classification"})),R={};_.forEach(f=>{R[f.classificationName]||(R[f.classificationName]=[]),R[f.classificationName].push(f)});const se=i.filter(f=>f.id!=="title"&&f.id!=="actions"&&!f.id.startsWith("class:"));return ye.createPortal(e.jsxs(e.Fragment,{children:[e.jsx("div",{className:`fixed inset-0 bg-black/40 backdrop-blur-[2px] transition-opacity duration-250 ${k?"opacity-100":"opacity-0"}`,style:{zIndex:1e4},onMouseDown:p,onTouchEnd:f=>{f.preventDefault(),p()}}),e.jsxs("div",{ref:S,className:`fixed right-0 top-0 h-full bg-white dark:bg-[#0e1726] shadow-2xl border-l border-gray-200 dark:border-gray-700 flex flex-col transition-transform duration-250 ease-out ${k?"translate-x-0":"translate-x-full"}`,style:{zIndex:10001,width:"min(520px, 90vw)"},onClick:f=>f.stopPropagation(),children:[e.jsxs("div",{className:"flex items-center justify-between gap-3 px-6 py-4 border-b border-gray-100 dark:border-gray-700/50 flex-shrink-0",children:[e.jsxs("div",{className:"flex items-center gap-2 min-w-0",children:[e.jsx("div",{className:"w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0",children:e.jsxs("svg",{width:"16",height:"16",viewBox:"0 0 24 24",fill:"none",children:[e.jsx("path",{d:"M2 12C2 7.28595 2 4.92893 3.46447 3.46447C4.92893 2 7.28595 2 12 2C16.714 2 19.0711 2 20.5355 3.46447C22 4.92893 22 7.28595 22 12C22 16.714 22 19.0711 20.5355 20.5355C19.0711 22 16.714 22 12 22C7.28595 22 4.92893 22 3.46447 20.5355C2 19.0711 2 16.714 2 12Z",stroke:"#4361ee",strokeWidth:"1.5"}),e.jsx("path",{d:"M8 12H16M12 8V16",stroke:"#4361ee",strokeWidth:"1.5",strokeLinecap:"round"})]})}),e.jsx("h3",{className:"text-base font-semibold text-gray-900 dark:text-white truncate",children:b})]}),e.jsxs("div",{className:"flex items-center gap-1 flex-shrink-0",children:[e.jsx("a",{href:`/account/${o}/record/${s}/${x}`,className:"p-2 rounded-lg text-gray-400 hover:text-primary hover:bg-primary/10 transition-all",title:"Ouvrir la page complète",children:e.jsxs("svg",{width:"16",height:"16",viewBox:"0 0 24 24",fill:"none",children:[e.jsx("path",{d:"M10 4H6C4.89543 4 4 4.89543 4 6V18C4 19.1046 4.89543 20 6 20H18C19.1046 20 20 19.1046 20 18V14",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"}),e.jsx("path",{d:"M14 4H20V10",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round"}),e.jsx("path",{d:"M20 4L11 13",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"})]})}),e.jsx("a",{href:`/account/${o}/record/${s}/${x}/edit`,className:"p-2 rounded-lg text-gray-400 hover:text-info hover:bg-info/10 transition-all",title:"Modifier",children:e.jsx("svg",{width:"16",height:"16",viewBox:"0 0 24 24",fill:"none",children:e.jsx("path",{d:"M16.862 4.487L18.55 2.8C19.33 2.02 20.59 2.02 21.37 2.8C22.15 3.58 22.15 4.84 21.37 5.62L19.681 7.307M16.862 4.487L4.162 17.187C3.882 17.467 3.682 17.818 3.592 18.198L2.732 21.596C2.642 21.966 2.952 22.296 3.322 22.226L6.892 21.556C7.242 21.486 7.572 21.306 7.832 21.046L20.513 8.366",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"})})}),e.jsx("button",{onClick:p,className:"p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all",title:"Fermer",children:e.jsx("svg",{width:"16",height:"16",viewBox:"0 0 24 24",fill:"none",children:e.jsx("path",{d:"M18 6L6 18M6 6L18 18",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round"})})})]})]}),e.jsxs("div",{className:"flex-1 overflow-y-auto",children:[Object.keys(R).length>0&&e.jsx("div",{className:"px-6 py-4 border-b border-gray-100 dark:border-gray-700/50",children:Object.entries(R).map(([f,c])=>e.jsxs("div",{className:"mb-3 last:mb-0",children:[e.jsx("div",{className:"text-[11px] uppercase tracking-wider font-semibold text-gray-400 dark:text-gray-500 mb-1.5",children:f}),e.jsx("div",{className:"flex flex-wrap gap-1.5",children:c.map((y,A)=>e.jsxs("span",{className:"inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium transition-all hover:scale-105",style:{backgroundColor:De(y.color,.15),color:y.color,border:`1px solid ${De(y.color,.3)}`},children:[e.jsx("span",{className:"w-2 h-2 rounded-full flex-shrink-0",style:{backgroundColor:y.color}}),y.label]},A))})]},f))}),u&&e.jsxs("div",{className:"px-6 py-4 border-b border-gray-100 dark:border-gray-700/50",children:[e.jsx("div",{className:"text-[11px] uppercase tracking-wider font-semibold text-gray-400 dark:text-gray-500 mb-2",children:"Description"}),e.jsx("p",{className:"text-sm text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-wrap",children:u})]}),e.jsxs("div",{className:"px-6 py-4",children:[e.jsx("div",{className:"text-[11px] uppercase tracking-wider font-semibold text-gray-400 dark:text-gray-500 mb-3",children:"Détails"}),e.jsxs("div",{className:"space-y-0",children:[se.map(f=>e.jsxs("div",{className:"flex items-start gap-3 py-2.5 border-b border-gray-50 dark:border-gray-800/50 last:border-0",children:[e.jsx("div",{className:"w-32 flex-shrink-0 text-xs font-medium text-gray-500 dark:text-gray-400 pt-0.5 truncate",children:f.name}),e.jsx("div",{className:"flex-1 min-w-0",children:e.jsx(it,{field:f,record:t})})]},f.id)),(t.relations||[]).map((f,c)=>{var y;return e.jsxs("div",{className:"flex items-start gap-3 py-2.5 border-b border-gray-50 dark:border-gray-800/50 last:border-0",children:[e.jsx("div",{className:"w-32 flex-shrink-0 text-xs font-medium text-gray-500 dark:text-gray-400 pt-0.5 truncate",children:f.label||f.key||"Relation"}),e.jsx("div",{className:"flex-1 min-w-0",children:((y=f.records)==null?void 0:y.length)>0?e.jsx("div",{className:"flex flex-wrap gap-1",children:f.records.map((A,O)=>e.jsx("a",{href:`/account/${o}/record/${f.entitySlug||s}/${A._id}`,className:"inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-primary/10 text-primary font-medium hover:bg-primary/20 transition-colors",children:A.referenceTitle||A.title||"Sans titre"},O))}):e.jsx("span",{className:"text-gray-400 dark:text-gray-600 text-sm italic",children:"—"})})]},`rel-${c}`)})]})]})]}),e.jsx("div",{className:"flex-shrink-0 px-6 py-3 border-t border-gray-100 dark:border-gray-700/50 bg-gray-50/50 dark:bg-[#0a0f1e]/50",children:e.jsxs("div",{className:"flex items-center justify-between text-[11px] text-gray-400 dark:text-gray-500",children:[e.jsxs("div",{className:"flex items-center gap-3",children:[D&&e.jsxs("span",{className:"flex items-center gap-1",children:[e.jsxs("svg",{width:"12",height:"12",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"1.5",children:[e.jsx("circle",{cx:"12",cy:"12",r:"10"}),e.jsx("path",{d:"M12 6V12L16 14",strokeLinecap:"round"})]}),"Créé le ",D]}),v&&e.jsxs("span",{className:"flex items-center gap-1",children:[e.jsx("svg",{width:"12",height:"12",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"1.5",children:e.jsx("path",{d:"M4.06 13C4.02 12.67 4 12.34 4 12C4 7.58 7.58 4 12 4C14.5 4 16.73 5.15 18.2 6.94M19.94 11C19.98 11.33 20 11.66 20 12C20 16.42 16.42 20 12 20C9.5 20 7.27 18.85 5.8 17.06",strokeLinecap:"round",strokeLinejoin:"round"})}),"Modifié le ",v]})]}),e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx("a",{href:`/account/${o}/record/${s}/${x}`,className:"px-3 py-1.5 bg-primary/10 text-primary text-xs font-medium rounded-lg hover:bg-primary/20 transition-colors",children:"Voir"}),e.jsx("a",{href:`/account/${o}/record/${s}/${x}/edit`,className:"px-3 py-1.5 bg-primary text-white text-xs font-medium rounded-lg hover:bg-primary/90 transition-colors",children:"Modifier"})]})]})})]})]}),document.body)}function je(t,i=.1){const o=/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(t);return o?`rgba(${parseInt(o[1],16)}, ${parseInt(o[2],16)}, ${parseInt(o[3],16)}, ${i})`:`rgba(128,128,128,${i})`}function Ve({record:t,accountNumber:i,entitySlug:o,isDragging:s=!1,onQuickView:j}){var ee,T,q;const S=r.useRef(null),k=r.useRef(!1),M=String(((ee=t._id)==null?void 0:ee.$oid)||t._id),{attributes:p,listeners:x,setNodeRef:b,transform:u,transition:D,isDragging:v}=et({id:M}),_={transform:tt.Transform.toString(u),transition:D,opacity:s||v?.7:1,touchAction:"manipulation"},R=((T=t._id)==null?void 0:T.$oid)||t._id,se=t.referenceTitle||t.title||t.computedTitle||"Sans titre",K=t.description||"",f=t.dueDate?new Date(t.dueDate).toLocaleDateString("fr-FR",{day:"2-digit",month:"2-digit",year:"2-digit"}):null,c=t.createdAt?new Date(t.createdAt).toLocaleDateString("fr-FR"):null,y=(t.classificationValues||[]).filter(E=>E.optionLabel||E.label).map(E=>({label:E.optionLabel||E.label,color:E.optionColor||E.color||"#6366f1"})),A=t.tags||[],O=E=>{S.current={x:E.clientX,y:E.clientY,time:Date.now()},k.current=!1},d=E=>{if(S.current){const P=Math.abs(E.clientX-S.current.x),ae=Math.abs(E.clientY-S.current.y);(P>5||ae>5)&&(k.current=!0)}},h=E=>{if(!S.current)return;const P=Date.now()-S.current.time;!k.current&&P<400&&j&&!E.target.closest("a, button")&&setTimeout(()=>j(t),50),S.current=null};return e.jsxs("div",{ref:b,style:_,className:`kanban-card cursor-pointer rounded-lg transition-all group bg-white hover:shadow-md border border-gray-200/80 dark:border-0 dark:bg-dark/40 dark:hover:bg-dark/60 ${s||v?"shadow-lg ring-2 ring-primary/30 cursor-move":"shadow-sm"}`,"data-dnd":"card",onPointerDown:O,onPointerMove:d,onPointerUp:h,...p,...x,children:[e.jsxs("div",{className:"p-3",children:[e.jsx("div",{className:"text-sm font-semibold text-gray-800 dark:text-white-dark leading-5 line-clamp-2 mb-2",children:se}),K&&e.jsx("p",{className:"text-xs text-gray-500 dark:text-white-dark/70 line-clamp-2 mb-2",children:K}),e.jsx("div",{className:"flex flex-wrap items-center gap-1 mb-2",children:y.length>0?y.slice(0,3).map((E,P)=>e.jsxs("span",{className:"inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded font-medium",style:{backgroundColor:je(E.color,.15),color:E.color},children:[e.jsx("span",{className:"w-1.5 h-1.5 rounded-full flex-shrink-0",style:{backgroundColor:E.color}}),E.label]},P)):A.length>0?A.slice(0,2).map((E,P)=>e.jsx("span",{className:"inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary",children:E},P)):e.jsxs("span",{className:"text-[10px] text-gray-400 dark:text-white-dark/50 italic flex items-center gap-1",children:[e.jsx("svg",{width:"10",height:"10",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"1.5",children:e.jsx("path",{d:"M4.172 3.172C3 4.343 3 6.229 3 10v4c0 3.771 0 5.657 1.172 6.828C5.343 22 7.229 22 11 22h2c3.771 0 5.657 0 6.828-1.172C21 19.657 21 17.771 21 14v-1.22c0-1.835 0-2.752-.379-3.55-.378-.798-1.07-1.39-2.455-2.576l-1.5-1.282c-1.97-1.687-2.955-2.531-4.136-2.605-.17-.01-.343-.01-.56 0-1.18.074-2.166.918-4.136 2.605L6.334 6.654"})}),"Sans tag"]})}),e.jsxs("div",{className:"flex items-center gap-3 text-xs text-gray-400 dark:text-white-dark/50",children:[((q=t.attachments)==null?void 0:q.length)>0&&e.jsxs("span",{className:"flex items-center gap-1",children:[e.jsx("svg",{width:"12",height:"12",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",children:e.jsx("path",{d:"M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"})}),t.attachments.length]}),e.jsxs("span",{className:"flex items-center gap-1",children:[e.jsx("svg",{width:"12",height:"12",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",children:e.jsx("path",{d:"M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"})}),"0"]})]})]}),e.jsxs("div",{className:"px-3 py-2 border-t border-gray-100 dark:border-0 flex items-center justify-between",children:[e.jsxs("div",{className:"flex items-center gap-1 text-[11px] text-gray-400 dark:text-white-dark/50",children:[e.jsxs("svg",{width:"12",height:"12",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"1.5",children:[e.jsx("rect",{x:"3",y:"4",width:"18",height:"18",rx:"2"}),e.jsx("path",{d:"M3 10H21"}),e.jsx("path",{d:"M8 2V6"}),e.jsx("path",{d:"M16 2V6"})]}),e.jsx("span",{children:f||c||"—"})]}),e.jsxs("div",{className:"flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity",style:{pointerEvents:"auto"},children:[e.jsx("a",{href:`/account/${i}/record/${o}/${R}/edit`,className:"p-1 hover:text-info rounded hover:bg-gray-100 dark:hover:bg-gray-700",onClick:E=>E.stopPropagation(),onPointerDown:E=>E.stopPropagation(),children:e.jsx("svg",{width:"14",height:"14",viewBox:"0 0 24 24",fill:"none",children:e.jsx("path",{d:"M16.862 4.487L18.55 2.8C19.33 2.02 20.59 2.02 21.37 2.8C22.15 3.58 22.15 4.84 21.37 5.62L19.681 7.307M16.862 4.487L4.162 17.187C3.882 17.467 3.682 17.818 3.592 18.198L2.732 21.596C2.642 21.966 2.952 22.296 3.322 22.226L6.892 21.556C7.242 21.486 7.572 21.306 7.832 21.046L20.513 8.366M16.862 4.487L19.681 7.307",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"})})}),e.jsx("a",{href:`/account/${i}/record/${o}/${R}`,className:"p-1 hover:text-primary rounded hover:bg-gray-100 dark:hover:bg-gray-700",onClick:E=>E.stopPropagation(),onPointerDown:E=>E.stopPropagation(),children:e.jsxs("svg",{width:"14",height:"14",viewBox:"0 0 24 24",fill:"none",children:[e.jsx("path",{opacity:"0.5",d:"M3.27489 15.2957C2.42496 14.1915 2 13.6394 2 12C2 10.3606 2.42496 9.80853 3.27489 8.70433C4.97196 6.49956 7.81811 4 12 4C16.1819 4 19.028 6.49956 20.7251 8.70433C21.575 9.80853 22 10.3606 22 12C22 13.6394 21.575 14.1915 20.7251 15.2957C19.028 17.5004 16.1819 20 12 20C7.81811 20 4.97196 17.5004 3.27489 15.2957Z",stroke:"currentColor",strokeWidth:"1.5"}),e.jsx("path",{d:"M15 12C15 13.6569 13.6569 15 12 15C10.3431 15 9 13.6569 9 12C9 10.3431 10.3431 9 12 9C13.6569 9 15 10.3431 15 12Z",stroke:"currentColor",strokeWidth:"1.5"})]})})]})]})]})}function nt({column:t,records:i,recordIds:o,accountNumber:s,entitySlug:j,onQuickView:S}){const{setNodeRef:k,isOver:M}=Qe({id:String(t.id)}),p=typeof document<"u"&&document.documentElement.classList.contains("dark"),x=je(t.color,p?.12:.06),b=je(t.color,p?.3:.15);return e.jsxs("div",{ref:k,className:`flex-none rounded-lg overflow-hidden transition-all ${M?"ring-2 ring-primary/50 ring-offset-2":""}`,style:{width:"300px",maxWidth:"320px",backgroundColor:M?je(t.color,.15):x,border:`1px solid ${b}`},"data-dnd":"column",children:[e.jsx("div",{style:{height:"4px",backgroundColor:t.color}}),e.jsx("div",{className:"px-3 py-2 flex justify-between items-center",children:e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx("span",{className:"inline-flex items-center gap-1.5 px-2 py-0 rounded text-xs font-semibold uppercase tracking-wide",style:{backgroundColor:t.color,color:"#fff"},children:t.title}),e.jsx("span",{className:"text-xs text-gray-500 font-medium",children:i.length})]})}),e.jsx("div",{className:"px-2 pb-3",children:e.jsx(Xe,{items:o,strategy:Ge,children:e.jsx("div",{className:`space-y-2 min-h-[80px] rounded-lg transition-all ${M?"bg-primary/5 p-2":""}`,children:i.length===0?e.jsx("div",{className:"text-xs text-gray-300 dark:text-gray-600 text-center py-8 italic",children:"Aucun enregistrement"}):i.map(u=>{var D;return e.jsx(Ve,{record:u,accountNumber:s,entitySlug:j,onQuickView:S},((D=u._id)==null?void 0:D.$oid)||u._id)})})})}),e.jsx("div",{className:"px-3 pb-3",children:e.jsxs("button",{type:"button",className:"flex items-center gap-1 text-xs text-gray-400 hover:text-primary transition-colors",children:[e.jsx("svg",{width:"14",height:"14",viewBox:"0 0 24 24",fill:"none",children:e.jsx("path",{d:"M12 6V18M6 12H18",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round"})}),"Ajouter"]})})]})}function lt({records:t,columns:i,accountNumber:o,entitySlug:s,viewId:j,entityData:S}){const k=r.useRef(null),M=r.useRef(null),[p,x]=r.useState(t),[b,u]=r.useState({}),[D,v]=r.useState(null),[_,R]=r.useState(null),se=r.useCallback(m=>{R(m)},[]);r.useEffect(()=>{x(t)},[t]);const K=r.useRef(!1),f=r.useRef(0),c=r.useRef(0),y=r.useCallback(m=>{if(D||m.button!==0||m.target.closest('a, button, .dropdown, [data-dnd="card"]'))return;const I=k.current;I&&(K.current=!0,f.current=m.pageX-I.offsetLeft,c.current=I.scrollLeft,I.style.cursor="grabbing")},[D]),A=r.useCallback(m=>{if(D){K.current=!1;return}if(!K.current)return;m.preventDefault();const I=k.current;if(!I)return;const $=(m.pageX-I.offsetLeft-f.current)*1.5;I.scrollLeft=c.current-$},[D]),O=r.useCallback(()=>{K.current=!1,k.current&&(k.current.style.cursor="grab")},[]),d=ze(Se(Je,{activationConstraint:{distance:8}}),Se(qe,{activationConstraint:{delay:500,tolerance:10}}),Se(Ye,{coordinateGetter:Ke})),h=r.useMemo(()=>{if(S){const $=S.statusClassification;if($&&$.options&&$.options.length>0){const g=$.options.map(F=>({id:String(F._id),title:F.label,color:F.color||"#6366f1",optionId:String(F._id)}));return g.push({id:"__none__",title:"Sans Statut",color:"#9ca3af",optionId:"none"}),{classId:String($._id),columns:g}}const H=S.classifications||[];for(const g of H)if(g.options&&g.options.length>0){const F=g.options.map(W=>({id:String(W._id),title:W.label,color:W.color||"#6366f1",optionId:String(W._id)}));return F.push({id:"__none__",title:"Non classé",color:"#9ca3af",optionId:"none"}),{classId:String(g._id),columns:F}}}const m={};p.forEach($=>{($.classificationValues||[]).forEach(H=>{var de,fe;const g=((de=H.classificationId)==null?void 0:de.$oid)||H.classificationId||H.classification_id;if(!g)return;m[g]||(m[g]={count:0,options:{}}),m[g].count++;const F=H.optionLabel||H.label||"Sans label",W=H.optionColor||H.color||"#9ca3af",Y=((fe=H.optionId)==null?void 0:fe.$oid)||H.optionId||F;m[g].options[F]||(m[g].options[F]={label:F,color:W,optionId:String(Y),count:0}),m[g].options[F].count++})});let I=null,Z=0;if(Object.entries(m).forEach(([$,H])=>{H.count>Z&&(Z=H.count,I=$)}),I&&m[I]){const H=Object.values(m[I].options).map(g=>({id:g.label,title:g.label,color:g.color,optionId:g.optionId}));return H.push({id:"__none__",title:"Sans classification",color:"#9ca3af",optionId:"none"}),{classId:I,columns:H}}return{classId:null,columns:[{id:"__all__",title:"Tous les enregistrements",color:"#4361ee",optionId:null}]}},[p,S]),ee=r.useMemo(()=>{const m={};if(h.columns.forEach(I=>m[I.id]=[]),!h.classId)m.__all__=p;else{const I={};h.columns.forEach($=>{$.optionId&&$.optionId!=="none"&&(I[String($.optionId)]=$.id)});const Z={};h.columns.forEach($=>{Z[$.title]=$.id}),p.forEach($=>{var F;const g=($.classificationValues||[]).find(W=>{var de;return(((de=W.classificationId)==null?void 0:de.$oid)||W.classificationId||W.classification_id)===h.classId});if(g){const W=String(((F=g.optionId)==null?void 0:F.$oid)||g.optionId||""),Y=I[W];if(Y&&m[Y])m[Y].push($);else{const de=g.optionLabel||g.label||"Sans label";m[de]?m[de].push($):m.__none__&&m.__none__.push($)}}else m.__none__&&m.__none__.push($)})}for(const I of Object.keys(m)){const Z=b[I]||[];Z.length&&m[I].sort(($,H)=>{var W,Y;const g=Z.indexOf(String(((W=$._id)==null?void 0:W.$oid)||$._id)),F=Z.indexOf(String(((Y=H._id)==null?void 0:Y.$oid)||H._id));return g===-1&&F===-1?0:g===-1?1:F===-1?-1:g-F})}return m},[h,p,b]),T=r.useMemo(()=>{const m={};for(const I of h.columns)m[I.id]=(ee[I.id]||[]).map(Z=>{var $;return String((($=Z._id)==null?void 0:$.$oid)||Z._id)});return m},[h.columns,ee]),q=r.useCallback(m=>{var Z;const I=String(m);for(const $ of Object.keys(T))if((Z=T[$])!=null&&Z.includes(I))return $;return null},[T]),E=r.useMemo(()=>D&&p.find(m=>{var I;return String(((I=m._id)==null?void 0:I.$oid)||m._id)===String(D)})||null,[D,p]),P=r.useCallback(m=>{j&&(M.current&&clearTimeout(M.current),M.current=setTimeout(async()=>{try{await fetch(`/account/${o}/api/user/view-preferences`,{method:"POST",headers:{"Content-Type":"application/json"},credentials:"include",body:JSON.stringify({viewId:j,preferences:{kanban:{orderByColumn:m}}})})}catch{}},250))},[o,j]),ae=r.useCallback(async(m,I)=>{if(!h.classId)return;const Z=h.columns.find($=>$.id===I);if(Z)try{await fetch(`/account/${o}/api/record/update-classification`,{method:"POST",headers:{"Content-Type":"application/json"},credentials:"include",body:JSON.stringify({recordId:m,classificationId:h.classId,optionId:Z.optionId==="none"?null:Z.optionId})})}catch($){console.error("[RecordsKanban] Update error:",$)}},[o,h]),V=m=>{v(String(m.active.id))},le=()=>{v(null)},oe=m=>{const{active:I,over:Z}=m;if(v(null),!Z)return;const $=String(I.id),H=String(Z.id),g=q($),F=h.columns.some(B=>String(B.id)===H)?H:q(H);if(!g||!F)return;if(g===F){const B=T[g]||[],J=B.indexOf($),a=B.indexOf(H);if(J===-1||a===-1||J===a)return;const w=Ue(B,J,a),te={...b,[g]:w};u(te),P(te);return}const W=[...T[g]||[]].filter(B=>B!==$),Y=[...T[F]||[]],fe=h.columns.some(B=>String(B.id)===H)?Y.length:Math.max(0,Y.indexOf(H));Y.splice(fe,0,$);const n={...b,[g]:W,[F]:Y};if(u(n),P(n),h.classId){const B=h.columns.find(J=>J.id===F);x(J=>J.map(a=>{var te;if(String(((te=a._id)==null?void 0:te.$oid)||a._id)!==$)return a;const w=(a.classificationValues||[]).filter(X=>{var he;return(((he=X.classificationId)==null?void 0:he.$oid)||X.classificationId||X.classification_id)!==h.classId});return F!=="__none__"&&B&&w.push({classificationId:h.classId,optionId:B.optionId,optionLabel:B.title,optionColor:B.color}),{...a,classificationValues:w}})),ae($,F)}};return e.jsxs("div",{ref:k,className:"h-full overflow-x-auto overflow-y-auto",style:{cursor:"grab",userSelect:"none",WebkitUserSelect:"none"},onMouseDown:y,onMouseMove:A,onMouseUp:O,onMouseLeave:O,children:[e.jsxs(Pe,{sensors:d,collisionDetection:He,autoScroll:{threshold:{x:.15,y:.15},interval:10,acceleration:5},onDragStart:V,onDragEnd:oe,onDragCancel:le,children:[e.jsx("div",{style:{display:"flex",flexWrap:"nowrap",alignItems:"flex-start",gap:"1.25rem",padding:"0.5rem",width:"max-content",minHeight:"100%"},children:h.columns.map(m=>{const I=ee[m.id]||[];return m.id==="__none__"&&I.length===0?null:e.jsx(nt,{column:m,records:I,recordIds:T[m.id]||[],accountNumber:o,entitySlug:s,onQuickView:se},m.id)})}),e.jsx(Ze,{children:E?e.jsx(Ve,{record:E,accountNumber:o,entitySlug:s,isDragging:!0}):null})]}),_&&e.jsx(ot,{record:_,columns:i,accountNumber:o,entitySlug:s,onClose:()=>R(null)})]})}const Ie=[{bg:"bg-primary-light shadow-primary",text:"text-primary",dot:"#4361ee"},{bg:"bg-info-light shadow-info",text:"text-info",dot:"#2196f3"},{bg:"bg-warning-light shadow-warning",text:"text-warning",dot:"#e2a03f"},{bg:"bg-danger-light shadow-danger",text:"text-danger",dot:"#e7515a"},{bg:"bg-success-light shadow-success",text:"text-success",dot:"#00ab55"},{bg:"bg-secondary-light shadow-secondary",text:"text-secondary",dot:"#805dca"}];function dt(t){return Ie[t%Ie.length]}function ct(){return e.jsxs("svg",{width:"24",height:"24",viewBox:"0 0 24 24",fill:"none",className:"h-5 w-5 rotate-90 opacity-70 hover:opacity-100",children:[e.jsx("circle",{cx:"5",cy:"12",r:"2",stroke:"currentColor",strokeWidth:"1.5"}),e.jsx("circle",{opacity:"0.5",cx:"12",cy:"12",r:"2",stroke:"currentColor",strokeWidth:"1.5"}),e.jsx("circle",{cx:"19",cy:"12",r:"2",stroke:"currentColor",strokeWidth:"1.5"})]})}function pt(){return e.jsxs("svg",{width:"24",height:"24",viewBox:"0 0 24 24",fill:"none",className:"h-4 w-4 ltr:mr-3 rtl:ml-3",children:[e.jsx("path",{d:"M15.2869 3.15178L14.3601 4.07866L5.83882 12.5999C5.26166 13.1771 4.97308 13.4656 4.7249 13.7838C4.43213 14.1592 4.18114 14.5653 3.97634 14.995C3.80273 15.3593 3.67368 15.7465 3.41556 16.5208L2.32181 19.8021L2.05445 20.6042C1.92743 20.9852 2.0266 21.4053 2.31063 21.6894C2.59466 21.9734 3.01478 22.0726 3.39584 21.9456L4.19792 21.6782L7.47918 20.5844C8.25353 20.3263 8.6407 20.1973 9.00498 20.0237C9.43469 19.8189 9.84082 19.5679 10.2162 19.2751C10.5344 19.0269 10.8229 18.7383 11.4001 18.1612L19.9213 9.63993L20.8482 8.71306C22.3839 7.17735 22.3839 4.68748 20.8482 3.15178C19.3125 1.61607 16.8226 1.61607 15.2869 3.15178Z",stroke:"currentColor",strokeWidth:"1.5"}),e.jsx("path",{opacity:"0.5",d:"M14.36 4.07812C14.36 4.07812 14.4759 6.04774 16.2138 7.78564C17.9517 9.52354 19.9213 9.6394 19.9213 9.6394M4.19789 21.6777L2.32178 19.8015",stroke:"currentColor",strokeWidth:"1.5"})]})}function ut(){return e.jsxs("svg",{width:"24",height:"24",viewBox:"0 0 24 24",fill:"none",className:"h-4.5 w-4.5 ltr:mr-3 rtl:ml-3",children:[e.jsx("path",{opacity:"0.5",d:"M3.27489 15.2957C2.42496 14.1915 2 13.6394 2 12C2 10.3606 2.42496 9.80853 3.27489 8.70433C4.97196 6.49956 7.81811 4 12 4C16.1819 4 19.028 6.49956 20.7251 8.70433C21.575 9.80853 22 10.3606 22 12C22 13.6394 21.575 14.1915 20.7251 15.2957C19.028 17.5004 16.1819 20 12 20C7.81811 20 4.97196 17.5004 3.27489 15.2957Z",stroke:"currentColor",strokeWidth:"1.5"}),e.jsx("path",{d:"M15 12C15 13.6569 13.6569 15 12 15C10.3431 15 9 13.6569 9 12C9 10.3431 10.3431 9 12 9C13.6569 9 15 10.3431 15 12Z",stroke:"currentColor",strokeWidth:"1.5"})]})}function xt({filled:t}){return e.jsx("svg",{width:"24",height:"24",viewBox:"0 0 24 24",fill:"none",className:`h-4.5 w-4.5 group-hover:fill-warning ${t?"fill-warning":""}`,children:e.jsx("path",{d:"M9.15316 5.40838C10.4198 3.13613 11.0531 2 12 2C12.9469 2 13.5802 3.13612 14.8468 5.40837L15.1745 5.99623C15.5345 6.64193 15.7144 6.96479 15.9951 7.17781C16.2757 7.39083 16.6251 7.4699 17.3241 7.62805L17.9605 7.77203C20.4201 8.32856 21.65 8.60682 21.9426 9.54773C22.2352 10.4886 21.3968 11.4691 19.7199 13.4299L19.2861 13.9372C18.8096 14.4944 18.5713 14.773 18.4641 15.1177C18.357 15.4624 18.393 15.8341 18.465 16.5776L18.5306 17.2544C18.7841 19.8706 18.9109 21.1787 18.1449 21.7602C17.3788 22.3417 16.2273 21.8115 13.9243 20.7512L13.3285 20.4768C12.6741 20.1755 12.3469 20.0248 12 20.0248C11.6531 20.0248 11.3259 20.1755 10.6715 20.4768L10.0757 20.7512C7.77268 21.8115 6.62118 22.3417 5.85515 21.7602C5.08912 21.1787 5.21588 19.8706 5.4694 17.2544L5.53498 16.5776C5.60703 15.8341 5.64305 15.4624 5.53586 15.1177C5.42868 14.773 5.19043 14.4944 4.71392 13.9372L4.2801 13.4299C2.60325 11.4691 1.76482 10.4886 2.05742 9.54773C2.35002 8.60682 3.57986 8.32856 6.03954 7.77203L6.67589 7.62805C7.37485 7.4699 7.72433 7.39083 8.00494 7.17781C8.28555 6.96479 8.46553 6.64194 8.82547 5.99623L9.15316 5.40838Z",stroke:"currentColor",strokeWidth:"1.5"})})}function ft(){return e.jsx("svg",{width:"24",height:"24",viewBox:"0 0 24 24",fill:"none",className:"h-3 w-3 rotate-45",children:e.jsx("path",{d:"M2 12C2 7.28595 2 4.92893 3.46447 3.46447C4.92893 2 7.28595 2 12 2C16.714 2 19.0711 2 20.5355 3.46447C22 4.92893 22 7.28595 22 12C22 16.714 22 19.0711 20.5355 20.5355C19.0711 22 16.714 22 12 22C7.28595 22 4.92893 22 3.46447 20.5355C2 19.0711 2 16.714 2 12Z",stroke:"currentColor",strokeWidth:"1.5"})})}function ht({record:t,accountNumber:i,entitySlug:o}){var M;const[s,j]=r.useState(!1),S=r.useRef(null);r.useEffect(()=>{if(!s)return;const p=x=>{S.current&&!S.current.contains(x.target)&&j(!1)};return document.addEventListener("mousedown",p),()=>document.removeEventListener("mousedown",p)},[s]);const k=((M=t._id)==null?void 0:M.$oid)||t._id;return e.jsxs("div",{ref:S,className:"dropdown relative",children:[e.jsx("button",{type:"button",className:"text-primary",onClick:p=>{p.preventDefault(),p.stopPropagation(),j(!s)},children:e.jsx(ct,{})}),s&&e.jsxs("ul",{className:"absolute z-50 min-w-[140px] rounded-md bg-white dark:bg-[#1b2e4b] shadow-lg border dark:border-gray-700 py-1 text-sm font-medium ltr:right-0 rtl:left-0 top-full mt-1",style:{animation:"fadeIn 0.15s ease-out"},children:[e.jsx("li",{children:e.jsxs("a",{href:`/account/${i}/record/${o}/${k}/edit`,className:"flex items-center px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 w-full",onClick:p=>p.stopPropagation(),children:[e.jsx(pt,{})," Edit"]})}),e.jsx("li",{children:e.jsxs("a",{href:`/account/${i}/record/${o}/${k}`,className:"flex items-center px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 w-full",onClick:p=>p.stopPropagation(),children:[e.jsx(ut,{})," View"]})})]})]})}function mt({record:t,accountNumber:i,entitySlug:o,style:s,favorites:j,onToggleFav:S}){var D,v;const k=j[t._id]||!1,M=((D=t._id)==null?void 0:D.$oid)||t._id,p=t.referenceTitle||t.title||t.computedTitle||"Sans titre",x=t.createdAt?new Date(t.createdAt).toLocaleDateString("fr-FR",{day:"2-digit",month:"short",year:"numeric"}):"",b=(t.customFields||[]).find(_=>{var R,se,K,f,c,y;return((se=(R=_.field_id)==null?void 0:R.label)==null?void 0:se.toLowerCase().includes("descri"))||((f=(K=_.field_id)==null?void 0:K.label)==null?void 0:f.toLowerCase().includes("note"))||((y=(c=_.field_id)==null?void 0:c.label)==null?void 0:y.toLowerCase().includes("contenu"))}),u=(b==null?void 0:b.value)||t.description||"";return(t.classificationValues||[]).filter(_=>_.optionLabel).map(_=>({label:_.optionLabel,color:_.optionColor||_.color||s.dot})),e.jsxs("div",{className:`panel pb-12 relative ${s.bg}`,children:[e.jsxs("div",{className:"min-h-[142px]",children:[e.jsxs("div",{className:"flex justify-between",children:[e.jsxs("div",{className:"flex w-max items-center",children:[e.jsx("div",{className:"flex-none",children:e.jsx("div",{className:"rounded-full bg-gray-300 p-2 dark:bg-gray-700",children:e.jsxs("svg",{width:"24",height:"24",viewBox:"0 0 24 24",fill:"none",className:"h-4.5 w-4.5",children:[e.jsx("circle",{cx:"12",cy:"6",r:"4",stroke:"currentColor",strokeWidth:"1.5"}),e.jsx("ellipse",{opacity:"0.5",cx:"12",cy:"17",rx:"7",ry:"4",stroke:"currentColor",strokeWidth:"1.5"})]})})}),e.jsxs("div",{className:"ltr:ml-2 rtl:mr-2",children:[e.jsx("div",{className:"font-semibold",children:((v=t.createdBy)==null?void 0:v.name)||"Utilisateur"}),e.jsx("div",{className:"text-sx text-white-dark",children:x})]})]}),e.jsx(ht,{record:t,accountNumber:i,entitySlug:o})]}),e.jsxs("div",{children:[e.jsx("h4",{className:"mt-4 font-semibold",children:e.jsx("a",{href:`/account/${i}/record/${o}/${M}`,className:"hover:text-primary transition-colors",children:p})}),u&&e.jsx("p",{className:"mt-2 text-white-dark line-clamp-3",children:u})]})]}),e.jsx("div",{className:"absolute bottom-5 left-0 w-full px-5",children:e.jsxs("div",{className:"mt-2 flex items-center justify-between",children:[e.jsx("div",{className:s.text,children:e.jsx(ft,{})}),e.jsx("div",{className:"flex items-center gap-2",children:e.jsx("button",{type:"button",className:"group text-warning ltr:ml-2 rtl:mr-2",onClick:_=>{_.preventDefault(),_.stopPropagation(),S(t._id)},children:e.jsx(xt,{filled:k})})})]})})]})}function gt({records:t,accountNumber:i,entitySlug:o}){const[s,j]=r.useState({}),S=r.useCallback(k=>{j(M=>({...M,[k]:!M[k]}))},[]);return e.jsx("div",{className:"h-full overflow-y-auto",children:e.jsx("div",{className:"grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",children:t.length===0?e.jsx("div",{className:"col-span-full text-center py-20 text-gray-400 dark:text-gray-600 italic",children:"Aucun enregistrement"}):t.map((k,M)=>{var p;return e.jsx(mt,{record:k,accountNumber:i,entitySlug:o,style:dt(M),favorites:s,onToggleFav:S},((p=k._id)==null?void 0:p.$oid)||k._id)})})})}const Fe={contains:{label:"Contient",icon:"⊃",types:["text","email","phone","url","textarea","title","relation"]},not_contains:{label:"Ne contient pas",icon:"⊅",types:["text","email","phone","url","textarea","title","relation"]},equals:{label:"Est égal à",icon:"=",types:["text","email","phone","url","number","date","title","select","relation","classification"]},not_equals:{label:"N'est pas égal à",icon:"≠",types:["text","email","phone","url","number","date","title","select","relation","classification"]},starts_with:{label:"Commence par",icon:"A…",types:["text","email","phone","url","title"]},ends_with:{label:"Se termine par",icon:"…Z",types:["text","email","phone","url","title"]},gt:{label:"Supérieur à",icon:">",types:["number","date"]},gte:{label:"Supérieur ou égal",icon:"≥",types:["number","date"]},lt:{label:"Inférieur à",icon:"<",types:["number","date"]},lte:{label:"Inférieur ou égal",icon:"≤",types:["number","date"]},between:{label:"Entre",icon:"↔",types:["number","date"]},is_empty:{label:"Est vide",icon:"∅",types:["text","email","phone","url","number","date","textarea","title","select","relation","classification"]},is_not_empty:{label:"N'est pas vide",icon:"∃",types:["text","email","phone","url","number","date","textarea","title","select","relation","classification"]}};function Me(t){const i=t||"text";return Object.entries(Fe).filter(([o,s])=>s.types.includes(i)).map(([o,s])=>({key:o,...s}))}function Re(t){return["number","currency","percent"].includes(t)?"number":["date","datetime"].includes(t)?"date":"text"}function bt({columns:t=[],fieldFilters:i=[],onFieldFiltersChange:o,allRecords:s=[],sidebarFilters:j=[]}){const[S,k]=r.useState(i.length>0),[M,p]=r.useState(null),[x,b]=r.useState(!1),u=r.useRef(null);r.useEffect(()=>{const d=h=>{x&&u.current&&!u.current.contains(h.target)&&b(!1)};return x&&document.addEventListener("mousedown",d),()=>document.removeEventListener("mousedown",d)},[x]);const D=Ce.useMemo(()=>{const d={};return j.forEach(h=>{d[`classif:${h.id}`]=h.options||[]}),d},[j]),v=t.filter(d=>d.id!=="actions"),_=r.useCallback(d=>{const h=v.find(P=>P.id===d);if(!h)return;const ee=d.startsWith("classif:"),T=Me(h.type),q=ee?T.find(P=>P.key==="equals")||T[0]:T.find(P=>P.key==="contains")||T[0],E={fieldId:d,fieldName:h.name,fieldType:h.type||"text",operator:q.key,value:"",value2:"",logic:"AND"};o([...i,E]),b(!1),p(i.length)},[v,i,o]),R=r.useCallback((d,h)=>{const ee=i.map((T,q)=>q===d?{...T,...h}:T);o(ee)},[i,o]),se=r.useCallback(d=>{const h=i.filter((ee,T)=>T!==d);o(h),M===d&&p(null)},[i,o,M]),K=r.useCallback(()=>{o([]),p(null)},[o]),f=d=>["is_empty","is_not_empty"].includes(d),c=d=>d==="between",y=d=>d&&d.startsWith("classif:"),A=d=>D[d]||[],O=(d,h)=>{const T=A(d).find(q=>q.id===h||q.label===h);return T?T.label:h};return e.jsxs("div",{className:"adv-filters-container",children:[e.jsxs("button",{type:"button",className:"adv-filters-header",onClick:()=>k(!S),children:[e.jsxs("div",{className:"adv-filters-header-left",children:[e.jsx("svg",{viewBox:"0 0 24 24",fill:"none",className:"adv-filters-header-icon",children:e.jsx("path",{d:"M22 3H2L10 12.46V19L14 21V12.46L22 3Z",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round"})}),e.jsx("span",{children:"Filtres avancés"}),i.length>0&&e.jsx("span",{className:"adv-filters-count",children:i.length})]}),e.jsx("svg",{viewBox:"0 0 24 24",fill:"none",className:`adv-filters-chevron ${S?"adv-filters-chevron--open":""}`,children:e.jsx("path",{d:"M9 18L15 12L9 6",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round"})})]}),S&&e.jsxs("div",{className:"adv-filters-body",children:[i.map((d,h)=>{var ae;v.find(V=>V.id===d.fieldId);const ee=Me(d.fieldType),T=M===h,q=y(d.fieldId),E=q?A(d.fieldId):[],P=d.logic||"AND";return e.jsxs(Ce.Fragment,{children:[h>0&&e.jsxs("div",{className:"adv-filter-connector",children:[e.jsx("span",{className:"adv-filter-connector-line"}),e.jsx("button",{type:"button",className:`adv-filter-connector-badge ${P==="OR"?"adv-filter-connector-badge--or":""}`,onClick:()=>{R(h,{logic:P==="AND"?"OR":"AND"})},title:"Cliquez pour basculer entre ET/OU",children:P==="OR"?"OU":"ET"}),e.jsx("span",{className:"adv-filter-connector-line"})]}),e.jsx("div",{className:`adv-filter-pill ${T?"adv-filter-pill--editing":""}`,children:T?e.jsxs("div",{className:"adv-filter-edit",children:[e.jsxs("div",{className:"adv-filter-row",children:[e.jsx("label",{className:"adv-filter-label",children:"Champ"}),e.jsx("select",{value:d.fieldId,onChange:V=>{const le=v.find(oe=>oe.id===V.target.value);if(le){const oe=Me(le.type),I=V.target.value.startsWith("classif:")?oe.find(Z=>Z.key==="equals")||oe[0]:oe.find(Z=>Z.key===d.operator)||oe[0];R(h,{fieldId:le.id,fieldName:le.name,fieldType:le.type||"text",operator:I.key,value:"",value2:""})}},className:"adv-filter-select",children:v.map(V=>e.jsx("option",{value:V.id,children:V.name},V.id))})]}),e.jsxs("div",{className:"adv-filter-row",children:[e.jsx("label",{className:"adv-filter-label",children:"Condition"}),e.jsx("select",{value:d.operator,onChange:V=>R(h,{operator:V.target.value,value:f(V.target.value)?"":d.value,value2:""}),className:"adv-filter-select",children:ee.map(V=>e.jsx("option",{value:V.key,children:V.label},V.key))})]}),!f(d.operator)&&e.jsxs("div",{className:"adv-filter-row",children:[e.jsx("label",{className:"adv-filter-label",children:c(d.operator)?"Valeur min":"Valeur"}),q&&E.length>0?e.jsxs("select",{value:d.value,onChange:V=>R(h,{value:V.target.value}),className:"adv-filter-select",children:[e.jsx("option",{value:"",children:"Sélectionnez..."}),E.map(V=>e.jsx("option",{value:V.label,children:V.label},V.id))]}):e.jsx("input",{type:Re(d.fieldType),value:d.value,onChange:V=>R(h,{value:V.target.value}),placeholder:"Saisir une valeur...",className:"adv-filter-input",autoFocus:!0})]}),c(d.operator)&&e.jsxs("div",{className:"adv-filter-row",children:[e.jsx("label",{className:"adv-filter-label",children:"Valeur max"}),e.jsx("input",{type:Re(d.fieldType),value:d.value2||"",onChange:V=>R(h,{value2:V.target.value}),placeholder:"Saisir une valeur max...",className:"adv-filter-input"})]}),e.jsxs("div",{className:"adv-filter-row adv-filter-row--actions",children:[e.jsxs("button",{type:"button",className:"adv-filter-btn-done",onClick:()=>p(null),children:[e.jsx("svg",{viewBox:"0 0 24 24",fill:"none",className:"h-3.5 w-3.5",children:e.jsx("path",{d:"M5 13L9 17L19 7",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round"})}),"OK"]}),e.jsx("button",{type:"button",className:"adv-filter-btn-delete",onClick:()=>se(h),children:e.jsxs("svg",{viewBox:"0 0 24 24",fill:"none",className:"h-3.5 w-3.5",children:[e.jsx("path",{d:"M20.5001 6H3.5",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"}),e.jsx("path",{d:"M18.8334 8.5L18.3735 15.3991C18.1965 18.054 18.108 19.3815 17.243 20.1907C16.378 21 15.0476 21 12.3868 21H11.6134C8.9526 21 7.6222 21 6.75719 20.1907C5.89218 19.3815 5.80368 18.054 5.62669 15.3991L5.16675 8.5",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"})]})})]})]}):e.jsxs("button",{type:"button",className:"adv-filter-pill-summary",onClick:()=>p(h),children:[e.jsx("span",{className:"adv-filter-pill-field",children:d.fieldName}),e.jsx("span",{className:"adv-filter-pill-op",children:((ae=Fe[d.operator])==null?void 0:ae.label)||d.operator}),!f(d.operator)&&e.jsx("span",{className:"adv-filter-pill-value",children:c(d.operator)?`${d.value||"?"} – ${d.value2||"?"}`:q?O(d.fieldId,d.value):d.value||"..."}),e.jsx("button",{type:"button",className:"adv-filter-pill-remove",onClick:V=>{V.stopPropagation(),se(h)},children:e.jsx("svg",{viewBox:"0 0 24 24",fill:"none",className:"h-3 w-3",children:e.jsx("path",{d:"M18 6L6 18M6 6L18 18",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round"})})})]})})]},h)}),e.jsxs("div",{className:"adv-filter-add-row",ref:u,children:[e.jsxs("button",{type:"button",className:"adv-filter-add-btn",onClick:()=>b(!x),children:[e.jsx("svg",{viewBox:"0 0 24 24",fill:"none",className:"h-3.5 w-3.5",children:e.jsx("path",{d:"M12 5V19M5 12H19",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round"})}),"Ajouter un filtre"]}),x&&e.jsxs("div",{className:"adv-filter-field-dropdown",children:[e.jsx("div",{className:"adv-filter-field-dropdown-title",children:"Choisir un champ"}),v.map(d=>e.jsxs("button",{type:"button",className:"adv-filter-field-option",onClick:()=>_(d.id),children:[e.jsx("span",{className:"adv-filter-field-type-badge",children:vt(d.type)}),d.name]},d.id))]})]}),i.length>0&&e.jsx("button",{type:"button",className:"adv-filter-clear",onClick:K,children:"Effacer tous les filtres"})]}),e.jsx("style",{children:`
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
            `})]})}function vt(t){return{text:"Aa",title:"T",email:"@",phone:"☎",url:"🔗",number:"#",currency:"$",percent:"%",date:"📅",datetime:"🕐",textarea:"¶",select:"☰",relation:"↗",classification:"●"}[t]||"Aa"}function kt({entityName:t,entityNamePlural:i,entityIcon:o,accountNumber:s,entitySlug:j,showSidebar:S,onToggleSidebar:k,filters:M=[],activeFilters:p={},onFilterChange:x,columns:b=[],fieldFilters:u=[],onFieldFiltersChange:D,allRecords:v=[]}){const[_,R]=r.useState(!1),se=r.useRef(null);if(r.useEffect(()=>{const c=y=>{_&&se.current&&!se.current.contains(y.target)&&R(!1)};return _&&document.addEventListener("mousedown",c),()=>document.removeEventListener("mousedown",c)},[_]),!S)return null;const K=(c,y)=>{const A={...p},O=A[c]||[];if(y==="__all__")delete A[c];else{const d=O.indexOf(y);d>-1?(O.splice(d,1),O.length===0?delete A[c]:A[c]=[...O]):A[c]=[...O,y]}x(A)},f=Object.keys(p).length>0;return e.jsxs("div",{className:"panel z-10 w-full max-w-xs flex-none space-y-4 overflow-y-auto p-4 h-full",style:{display:"flex",flexDirection:"column"},children:[e.jsxs("div",{className:"flex items-center justify-between",children:[e.jsx("div",{className:"flex items-center",children:e.jsxs("div",{className:"flex items-center text-center",children:[e.jsx("div",{children:o?e.jsx("iconify-icon",{icon:o,width:"22",style:{color:"var(--primary)"}}):e.jsxs("svg",{width:"24",height:"24",viewBox:"0 0 24 24",fill:"none",xmlns:"http://www.w3.org/2000/svg",className:"h-5 w-5",children:[e.jsx("path",{d:"M20.3116 12.6473L20.8293 10.7154C21.4335 8.46034 21.7356 7.3328 21.5081 6.35703C21.3285 5.58657 20.9244 4.88668 20.347 4.34587C19.6157 3.66095 18.4881 3.35883 16.2331 2.75458C13.978 2.15033 12.8504 1.84821 11.8747 2.07573C11.1042 2.25537 10.4043 2.65945 9.86351 3.23687C9.27709 3.86298 8.97128 4.77957 8.51621 6.44561C8.43979 6.7254 8.35915 7.02633 8.27227 7.35057L8.27222 7.35077L7.75458 9.28263C7.15033 11.5377 6.84821 12.6652 7.07573 13.641C7.25537 14.4115 7.65945 15.1114 8.23687 15.6522C8.96815 16.3371 10.0957 16.6392 12.3508 17.2435L12.3508 17.2435C14.3834 17.7881 15.4999 18.0873 16.415 17.9744C16.5152 17.9621 16.6129 17.9448 16.7092 17.9223C17.4796 17.7427 18.1795 17.3386 18.7203 16.7612C19.4052 16.0299 19.7074 14.9024 20.3116 12.6473Z",stroke:"currentColor",strokeWidth:"1.5"}),e.jsx("path",{opacity:"0.5",d:"M16.415 17.9741C16.2065 18.6126 15.8399 19.1902 15.347 19.6519C14.6157 20.3368 13.4881 20.6389 11.2331 21.2432C8.97798 21.8474 7.85044 22.1495 6.87466 21.922C6.10421 21.7424 5.40432 21.3383 4.86351 20.7609C4.17859 20.0296 3.87647 18.9021 3.27222 16.647L2.75458 14.7151C2.15033 12.46 1.84821 11.3325 2.07573 10.3567C2.25537 9.58627 2.65945 8.88638 3.23687 8.34557C3.96815 7.66065 5.09569 7.35853 7.35077 6.75428C7.77741 6.63996 8.16368 6.53646 8.51621 6.44531",stroke:"currentColor",strokeWidth:"1.5"}),e.jsx("path",{d:"M11.7769 10L16.6065 11.2941",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"}),e.jsx("path",{opacity:"0.5",d:"M11 12.8975L13.8978 13.6739",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"})]})}),e.jsx("h3",{className:"text-lg font-semibold ltr:ml-3 rtl:mr-3",children:t})]})}),e.jsxs("div",{className:"dropdown relative",ref:se,children:[e.jsx("button",{type:"button",className:"flex h-8 w-8 items-center justify-center rounded-full bg-[#f4f4f4] hover:bg-primary-light dark:bg-[#1b2e4b]",onClick:()=>R(!_),children:e.jsxs("svg",{width:"24",height:"24",viewBox:"0 0 24 24",fill:"none",xmlns:"http://www.w3.org/2000/svg",className:"h-5 w-5 opacity-70",children:[e.jsx("circle",{cx:"5",cy:"12",r:"2",stroke:"currentColor",strokeWidth:"1.5"}),e.jsx("circle",{opacity:"0.5",cx:"12",cy:"12",r:"2",stroke:"currentColor",strokeWidth:"1.5"}),e.jsx("circle",{cx:"19",cy:"12",r:"2",stroke:"currentColor",strokeWidth:"1.5"})]})}),_&&e.jsxs("ul",{className:"whitespace-nowrap absolute right-0 top-full mt-1 z-50 min-w-[160px] rounded-md border border-gray-200 bg-white py-1 shadow-lg dark:border-[#1b2e4b] dark:bg-[#0e1726]",children:[e.jsx("li",{children:e.jsxs("a",{href:"javascript:;",onClick:()=>R(!1),className:"flex items-center px-4 py-2 text-sm hover:bg-gray-100 hover:text-primary dark:hover:bg-[#181F32] dark:hover:text-primary",children:[e.jsx("iconify-icon",{icon:"solar:settings-bold-duotone",className:"h-4.5 w-4.5 shrink-0 ltr:mr-1 rtl:ml-1",width:"18",style:{marginRight:"6px"}}),"Paramètres"]})}),e.jsx("li",{children:e.jsxs("a",{href:"javascript:;",onClick:()=>R(!1),className:"flex items-center px-4 py-2 text-sm hover:bg-gray-100 hover:text-primary dark:hover:bg-[#181F32] dark:hover:text-primary",children:[e.jsx("iconify-icon",{icon:"solar:question-circle-bold-duotone",className:"h-4.5 w-4.5 shrink-0 ltr:mr-1 rtl:ml-1",width:"18",style:{marginRight:"6px"}}),"Aide"]})})]})]})]}),e.jsx("div",{className:"h-px w-full border-b border-[#e0e6ed] dark:border-[#1b2e4b]"}),e.jsx("div",{className:"!mt-0",style:{flex:1,display:"flex",flexDirection:"column"},children:e.jsxs("div",{className:"flex h-full flex-col pb-16",style:{position:"relative"},children:[e.jsx("div",{className:"relative -mr-3.5 h-full grow pr-3.5 overflow-auto",children:e.jsxs("div",{className:"space-y-1",children:[e.jsx("button",{type:"button",className:`flex h-10 w-full items-center justify-between rounded-md p-2 font-medium hover:bg-white-dark/10 hover:text-primary dark:hover:bg-[#181F32] dark:hover:text-primary ${f?"":"bg-gray-100 dark:text-primary text-primary dark:bg-[#181F32]"}`,onClick:()=>x({}),children:e.jsxs("div",{className:"flex items-center",children:[e.jsx("iconify-icon",{icon:"solar:checklist-minimalistic-bold-duotone",width:"20"}),e.jsxs("div",{className:"ltr:ml-3 rtl:mr-3",children:["Toutes les ",i||t]})]})}),e.jsx("button",{type:"button",className:`flex h-10 w-full items-center justify-between rounded-md p-2 font-medium hover:bg-white-dark/10 hover:text-primary dark:hover:bg-[#181F32] dark:hover:text-primary ${p.__favourites?"bg-gray-100 dark:text-primary text-primary dark:bg-[#181F32]":""}`,onClick:()=>{const c={...p};c.__favourites?delete c.__favourites:c.__favourites=!0,x(c)},children:e.jsxs("div",{className:"flex items-center",children:[e.jsx("svg",{width:"24",height:"24",viewBox:"0 0 24 24",fill:"none",xmlns:"http://www.w3.org/2000/svg",className:"h-5 w-5",children:e.jsx("path",{d:"M9.15316 5.40838C10.4198 3.13613 11.0531 2 12 2C12.9469 2 13.5802 3.13612 14.8468 5.40837L15.1745 5.99623C15.5345 6.64193 15.7144 6.96479 15.9951 7.17781C16.2757 7.39083 16.6251 7.4699 17.3241 7.62805L17.9605 7.77203C20.4201 8.32856 21.65 8.60682 21.9426 9.54773C22.2352 10.4886 21.3968 11.4691 19.7199 13.4299L19.2861 13.9372C18.8096 14.4944 18.5713 14.773 18.4641 15.1177C18.357 15.4624 18.393 15.8341 18.465 16.5776L18.5306 17.2544C18.7841 19.8706 18.9109 21.1787 18.1449 21.7602C17.3788 22.3417 16.2273 21.8115 13.9243 20.7512L13.3285 20.4768C12.6741 20.1755 12.3469 20.0248 12 20.0248C11.6531 20.0248 11.3259 20.1755 10.6715 20.4768L10.0757 20.7512C7.77268 21.8115 6.62118 22.3417 5.85515 21.7602C5.08912 21.1787 5.21588 19.8706 5.4694 17.2544L5.53498 16.5776C5.60703 15.8341 5.64305 15.4624 5.53586 15.1177C5.42868 14.773 5.19043 14.4944 4.71392 13.9372L4.2801 13.4299C2.60325 11.4691 1.76482 10.4886 2.05742 9.54773C2.35002 8.60682 3.57986 8.32856 6.03954 7.77203L6.67589 7.62805C7.37485 7.4699 7.72433 7.39083 8.00494 7.17781C8.28555 6.96479 8.46553 6.64194 8.82547 5.99623L9.15316 5.40838Z",stroke:"currentColor",strokeWidth:"1.5"})}),e.jsx("div",{className:"ltr:ml-3 rtl:mr-3",children:"Favourites"})]})}),M.map(c=>e.jsxs("div",{children:[e.jsx("div",{className:"h-px w-full border-b border-[#e0e6ed] dark:border-[#1b2e4b] my-2"}),e.jsx("div",{className:"px-1 py-2 text-white-dark text-xs uppercase font-semibold tracking-wider",children:c.name}),c.type==="tags"?e.jsx("div",{className:"flex flex-wrap gap-1.5 px-1",children:c.options.map(y=>{const A=(p[c.id]||[]).includes(y.id);return e.jsxs("button",{type:"button",className:"mb-0 py-0.5 px-2.5 text-xs rounded-full cursor-pointer transition-all font-medium",style:{border:`1.5px solid ${y.color||"#9ca3af"}`,color:A?"#fff":y.color||"#9ca3af",backgroundColor:A?y.color||"#9ca3af":"transparent"},onClick:()=>K(c.id,y.id),children:[y.label,y.count!==void 0&&e.jsx("span",{style:{opacity:.7,marginLeft:"2px"},children:y.count})]},y.id)})}):e.jsx("div",{className:"space-y-0.5",children:c.options.map(y=>{const A=(p[c.id]||[]).includes(y.id);return e.jsxs("button",{type:"button",className:`flex h-9 w-full items-center rounded-md px-2 py-1.5 text-sm font-medium transition-colors hover:bg-white-dark/10 hover:text-primary dark:hover:bg-[#181F32] dark:hover:text-primary ${A?"bg-gray-100 text-primary dark:bg-[#181F32] dark:text-primary":""}`,onClick:()=>K(c.id,y.id),children:[e.jsx("span",{className:"inline-block w-3 h-3 rounded-full mr-2.5 flex-shrink-0",style:{backgroundColor:y.color||"#9ca3af"}}),e.jsx("span",{className:"truncate",children:y.label}),y.count!==void 0&&e.jsx("span",{className:"ml-auto text-xs opacity-60",children:y.count})]},y.id)})})]},c.id)),e.jsx(bt,{columns:b,fieldFilters:u,onFieldFiltersChange:D,allRecords:v,sidebarFilters:M})]})}),e.jsx("div",{className:"absolute bottom-0 w-full p-4 left-0",children:e.jsxs("a",{href:`/account/${s}/record/${j}/add`,className:"btn btn-primary w-full",children:[e.jsxs("svg",{xmlns:"http://www.w3.org/2000/svg",width:"24px",height:"24px",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round",className:"h-5 w-5 ltr:mr-2 rtl:ml-2",children:[e.jsx("line",{x1:"12",y1:"5",x2:"12",y2:"19"}),e.jsx("line",{x1:"5",y1:"12",x2:"19",y2:"12"})]}),"Ajouter"]})})]})})]})}const yt=["#4361ee","#805dca","#e2a03f","#00ab55","#e7515a","#2196d4","#3b3f5c","#009688","#ff5722","#607d8b"],wt={contains:{label:"Contient",icon:"⊃",types:["text","email","phone","url","textarea","title","relation"]},not_contains:{label:"Ne contient pas",icon:"⊅",types:["text","email","phone","url","textarea","title","relation"]},equals:{label:"Est égal à",icon:"=",types:["text","email","phone","url","number","date","title","select","relation","classification"]},not_equals:{label:"N'est pas égal à",icon:"≠",types:["text","email","phone","url","number","date","title","select","relation","classification"]},starts_with:{label:"Commence par",icon:"A…",types:["text","email","phone","url","title"]},ends_with:{label:"Se termine par",icon:"…Z",types:["text","email","phone","url","title"]},gt:{label:"Supérieur à",icon:">",types:["number","date"]},gte:{label:"Supérieur ou égal",icon:"≥",types:["number","date"]},lt:{label:"Inférieur à",icon:"<",types:["number","date"]},lte:{label:"Inférieur ou égal",icon:"≤",types:["number","date"]},between:{label:"Entre",icon:"↔",types:["number","date"]},is_empty:{label:"Est vide",icon:"∅",types:["text","email","phone","url","number","date","textarea","title","select","relation","classification"]},is_not_empty:{label:"N'est pas vide",icon:"∃",types:["text","email","phone","url","number","date","textarea","title","select","relation","classification"]}};function _e(t){const i=t||"text";return Object.entries(wt).filter(([o,s])=>s.types.includes(i)).map(([o,s])=>({key:o,...s}))}function Ee(t){return["number","currency","percent"].includes(t)?"number":["date","datetime"].includes(t)?"date":"text"}function jt({savedViews:t=[],activeViewId:i,onSelectView:o,onCreateView:s,onDeleteView:j,onRenameView:S,onUpdateViewFilters:k,hasActiveFilters:M=!1,activeFilters:p={},fieldFilters:x=[],sidebarFilters:b=[],columns:u=[],externalOpenCreate:D=!1,onCloseExternalCreate:v}){const[_,R]=r.useState(!1),[se,K]=r.useState(!1),[f,c]=r.useState(""),[y,A]=r.useState("#4361ee"),[O,d]=r.useState(null),[h,ee]=r.useState(null),[T,q]=r.useState(""),[E,P]=r.useState([]),[ae,V]=r.useState(!1),le=r.useRef(null),oe=r.useRef(null),m=r.useRef(null),I=r.useRef(null);r.useEffect(()=>{const a=w=>{O&&oe.current&&!oe.current.contains(w.target)&&d(null)};return O&&document.addEventListener("mousedown",a),()=>document.removeEventListener("mousedown",a)},[O]),r.useEffect(()=>{_&&m.current&&setTimeout(()=>{var a;return(a=m.current)==null?void 0:a.focus()},100)},[_]),r.useEffect(()=>{D&&(R(!0),P([...x]),v==null||v())},[D]),r.useEffect(()=>{_&&P([...x])},[_]),r.useEffect(()=>{const a=w=>{ae&&le.current&&!le.current.contains(w.target)&&V(!1)};return ae&&document.addEventListener("mousedown",a),()=>document.removeEventListener("mousedown",a)},[ae]),r.useEffect(()=>{h&&I.current&&(I.current.focus(),I.current.select())},[h]);const Z=(a,w)=>{a.preventDefault(),d({viewId:w,x:a.clientX,y:a.clientY})},$=()=>{f.trim()&&(s({name:f.trim(),color:y,filters:p,fieldFilters:E}),c(""),A("#4361ee"),P([]),R(!1))},H=r.useMemo(()=>u.filter(a=>a.id!=="actions"),[u]),g=r.useMemo(()=>{const a={};return b.forEach(w=>{a[`classif:${w.id}`]=w.options||[]}),a},[b]),F=r.useCallback(a=>{const w=H.find(ue=>ue.id===a);if(!w)return;const te=a.startsWith("classif:"),X=_e(w.type),ne=te?X.find(ue=>ue.key==="equals")||X[0]:X.find(ue=>ue.key==="contains")||X[0],he={fieldId:a,fieldName:w.name,fieldType:w.type||"text",operator:ne.key,value:"",value2:"",logic:"AND"};P(ue=>[...ue,he]),V(!1)},[H]),W=r.useCallback((a,w)=>{P(te=>te.map((X,ne)=>ne===a?{...X,...w}:X))},[]),Y=r.useCallback(a=>{P(w=>w.filter((te,X)=>X!==a))},[]),de=a=>{const w=t.find(te=>te._id===a);w&&(ee(a),q(w.name)),d(null)},fe=()=>{h&&T.trim()&&S(h,T.trim()),ee(null),q("")},n=a=>{j(a),d(null)},B=a=>{k(a,p,x),d(null)},J=a=>{var te;let w=0;return a.filters&&(w+=Object.keys(a.filters).filter(X=>X!=="__favourites").length),(te=a.fieldFilters)!=null&&te.length&&(w+=a.fieldFilters.length),w};return e.jsxs(e.Fragment,{children:[e.jsxs("div",{className:"saved-views-tabs",children:[e.jsxs("button",{type:"button",className:`saved-view-tab ${i?"":"saved-view-tab--active"}`,onClick:()=>o(null),children:[e.jsxs("svg",{className:"saved-view-tab-icon",viewBox:"0 0 24 24",fill:"none",children:[e.jsx("path",{d:"M2 12C2 7.28595 2 4.92893 3.46447 3.46447C4.92893 2 7.28595 2 12 2C16.714 2 19.0711 2 20.5355 3.46447C22 4.92893 22 7.28595 22 12C22 16.714 22 19.0711 20.5355 20.5355C19.0711 22 16.714 22 12 22C7.28595 22 4.92893 22 3.46447 20.5355C2 19.0711 2 16.714 2 12Z",stroke:"currentColor",strokeWidth:"1.5"}),e.jsx("path",{d:"M6 12H18",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"}),e.jsx("path",{d:"M6 8H18",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"}),e.jsx("path",{d:"M6 16H18",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"})]}),"Tout"]}),t.map(a=>e.jsx("button",{type:"button",className:`saved-view-tab ${i===a._id?"saved-view-tab--active":""}`,style:{"--tab-color":a.color||"#4361ee"},onClick:()=>o(a._id),onContextMenu:w=>Z(w,a._id),children:h===a._id?e.jsx("input",{ref:I,type:"text",value:T,onChange:w=>q(w.target.value),onBlur:fe,onKeyDown:w=>{w.key==="Enter"&&fe(),w.key==="Escape"&&(ee(null),q(""))},className:"saved-view-tab-edit-input",onClick:w=>w.stopPropagation()}):e.jsxs(e.Fragment,{children:[e.jsx("span",{className:"saved-view-tab-dot",style:{backgroundColor:a.color||"#4361ee"}}),e.jsx("span",{className:"saved-view-tab-name",children:a.name}),J(a)>0&&e.jsx("span",{className:"saved-view-tab-badge",children:J(a)})]})},a._id)),e.jsx("button",{type:"button",className:"saved-view-tab saved-view-tab--add",onClick:()=>R(!0),title:"Enregistrer une vue",children:e.jsx("svg",{viewBox:"0 0 24 24",fill:"none",className:"h-3.5 w-3.5",children:e.jsx("path",{d:"M12 5V19M5 12H19",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round"})})})]}),O&&e.jsxs("div",{ref:oe,className:"saved-view-context-menu",style:{position:"fixed",top:O.y,left:O.x,zIndex:10001},children:[e.jsxs("button",{className:"saved-view-context-item",onClick:()=>de(O.viewId),children:[e.jsx("svg",{viewBox:"0 0 24 24",fill:"none",className:"h-4 w-4",children:e.jsx("path",{d:"M13.9027 6.37027L17.6297 10.0973M4 20.0001H8L18.5 9.50006C18.9978 9.00236 19.2786 8.32622 19.2786 7.62142C19.2786 6.91661 18.9978 6.24047 18.5 5.74277C18.0023 5.24508 17.3261 4.96426 16.6213 4.96426C15.9165 4.96426 15.2404 5.24508 14.7427 5.74277L4 16.0001V20.0001Z",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round"})}),"Renommer"]}),e.jsxs("button",{className:"saved-view-context-item",onClick:()=>B(O.viewId),children:[e.jsxs("svg",{viewBox:"0 0 24 24",fill:"none",className:"h-4 w-4",children:[e.jsx("path",{d:"M4.06189 13C4.02104 12.6724 4 12.3387 4 12C4 7.58172 7.58172 4 12 4C14.5006 4 16.7332 5.14727 18.2002 6.94416M19.9381 11C19.979 11.3276 20 11.6613 20 12C20 16.4183 16.4183 20 12 20C9.49944 20 7.26681 18.8527 5.79984 17.0558",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round"}),e.jsx("path",{d:"M15 7H19V3",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round"}),e.jsx("path",{d:"M9 17H5V21",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round"})]}),"Mettre à jour les filtres"]}),e.jsx("div",{className:"saved-view-context-separator"}),e.jsxs("button",{className:"saved-view-context-item saved-view-context-item--danger",onClick:()=>n(O.viewId),children:[e.jsxs("svg",{viewBox:"0 0 24 24",fill:"none",className:"h-4 w-4",children:[e.jsx("path",{d:"M20.5001 6H3.5",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"}),e.jsx("path",{d:"M18.8334 8.5L18.3735 15.3991C18.1965 18.054 18.108 19.3815 17.243 20.1907C16.378 21 15.0476 21 12.3868 21H11.6134C8.9526 21 7.6222 21 6.75719 20.1907C5.89218 19.3815 5.80368 18.054 5.62669 15.3991L5.16675 8.5",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"}),e.jsx("path",{d:"M9.5 11L10 16",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"}),e.jsx("path",{d:"M14.5 11L14 16",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"}),e.jsx("path",{d:"M6.5 6C6.55588 6 6.58382 6 6.60915 5.99936C7.43259 5.97849 8.15902 5.45491 8.43922 4.68032C8.44784 4.65649 8.45667 4.62999 8.47434 4.57697L8.57143 4.28571C8.65431 4.03708 8.69575 3.91276 8.75071 3.8072C8.97001 3.38607 9.37574 3.09364 9.84461 3.01877C9.96213 3 10.0932 3 10.3553 3H13.6447C13.9068 3 14.0379 3 14.1554 3.01877C14.6243 3.09364 15.03 3.38607 15.2493 3.8072C15.3043 3.91276 15.3457 4.03708 15.4286 4.28571L15.5257 4.57697C15.5433 4.62992 15.5522 4.65651 15.5608 4.68032C15.841 5.45491 16.5674 5.97849 17.3909 5.99936C17.4162 6 17.4441 6 17.5 6",stroke:"currentColor",strokeWidth:"1.5"})]}),"Supprimer"]})]}),_&&e.jsx("div",{className:"saved-view-modal-overlay",onClick:()=>R(!1),children:e.jsxs("div",{className:"saved-view-modal",onClick:a=>a.stopPropagation(),children:[e.jsxs("div",{className:"saved-view-modal-header",children:[e.jsx("h3",{children:"Enregistrer la vue"}),e.jsx("button",{type:"button",className:"saved-view-modal-close",onClick:()=>R(!1),children:e.jsx("svg",{viewBox:"0 0 24 24",fill:"none",className:"h-5 w-5",children:e.jsx("path",{d:"M18 6L6 18M6 6L18 18",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"})})})]}),e.jsxs("div",{className:"saved-view-modal-body",children:[e.jsxs("div",{className:"saved-view-form-group",children:[e.jsx("label",{className:"saved-view-form-label",children:"Nom de la vue"}),e.jsx("input",{ref:m,type:"text",value:f,onChange:a=>c(a.target.value),onKeyDown:a=>{a.key==="Enter"&&$()},placeholder:"Ex: Hôtels, Clients VIP...",className:"saved-view-form-input"})]}),e.jsxs("div",{className:"saved-view-form-group",children:[e.jsx("label",{className:"saved-view-form-label",children:"Couleur"}),e.jsx("div",{className:"saved-view-color-grid",children:yt.map(a=>e.jsx("button",{type:"button",className:`saved-view-color-swatch ${y===a?"saved-view-color-swatch--active":""}`,style:{backgroundColor:a},onClick:()=>A(a),children:y===a&&e.jsx("svg",{viewBox:"0 0 24 24",fill:"none",className:"h-3 w-3",children:e.jsx("path",{d:"M5 13L9 17L19 7",stroke:"white",strokeWidth:"2.5",strokeLinecap:"round",strokeLinejoin:"round"})})},a))})]}),Object.keys(p).filter(a=>a!=="__favourites").length>0&&e.jsxs("div",{className:"saved-view-form-group",children:[e.jsx("label",{className:"saved-view-form-label",children:"Filtres de classification"}),e.jsx("div",{className:"saved-view-filter-summary",children:Object.keys(p).filter(a=>a!=="__favourites").map(a=>{const w=b.find(X=>X.id===a),te=p[a]||[];return e.jsxs("div",{className:"saved-view-filter-group",children:[e.jsxs("span",{className:"saved-view-filter-group-label",children:[(w==null?void 0:w.name)||"Filtre",":"]}),e.jsx("div",{className:"saved-view-filter-tags",children:te.map(X=>{var he;const ne=(he=w==null?void 0:w.options)==null?void 0:he.find(ue=>ue.id===X);return e.jsx("span",{className:"saved-view-filter-tag",style:{borderColor:(ne==null?void 0:ne.color)||"#9ca3af",color:(ne==null?void 0:ne.color)||"#9ca3af"},children:(ne==null?void 0:ne.label)||X},X)})})]},a)})})]}),e.jsxs("div",{className:"saved-view-form-group",children:[e.jsx("label",{className:"saved-view-form-label",children:"Filtres avancés"}),e.jsxs("div",{className:"svm-filter-builder",children:[E.map((a,w)=>{var we;const te=(we=a.fieldId)==null?void 0:we.startsWith("classif:"),X=te?g[a.fieldId]||[]:[],ne=_e(a.fieldType),he=["is_empty","is_not_empty"].includes(a.operator),ue=a.operator==="between",ve=a.logic||"AND";return e.jsxs(Ce.Fragment,{children:[w>0&&e.jsxs("div",{className:"svm-filter-connector",children:[e.jsx("span",{className:"svm-filter-connector-line"}),e.jsx("button",{type:"button",className:`svm-filter-connector-badge ${ve==="OR"?"svm-filter-connector-badge--or":""}`,onClick:()=>W(w,{logic:ve==="AND"?"OR":"AND"}),title:"Cliquez pour basculer ET/OU",children:ve==="OR"?"OU":"ET"}),e.jsx("span",{className:"svm-filter-connector-line"})]}),e.jsxs("div",{className:"svm-filter-row",children:[e.jsx("select",{value:a.fieldId,onChange:Q=>{const xe=H.find(ke=>ke.id===Q.target.value);if(xe){const ke=Q.target.value.startsWith("classif:"),me=_e(xe.type),Ne=ke?me.find(be=>be.key==="equals")||me[0]:me.find(be=>be.key===a.operator)||me[0];W(w,{fieldId:xe.id,fieldName:xe.name,fieldType:xe.type||"text",operator:Ne.key,value:"",value2:""})}},className:"svm-filter-select svm-filter-select--field",children:H.map(Q=>e.jsx("option",{value:Q.id,children:Q.name},Q.id))}),e.jsx("select",{value:a.operator,onChange:Q=>W(w,{operator:Q.target.value,value:["is_empty","is_not_empty"].includes(Q.target.value)?"":a.value,value2:""}),className:"svm-filter-select svm-filter-select--op",children:ne.map(Q=>e.jsx("option",{value:Q.key,children:Q.label},Q.key))}),!he&&(te&&X.length>0?e.jsxs("select",{value:a.value,onChange:Q=>W(w,{value:Q.target.value}),className:"svm-filter-select svm-filter-select--val",children:[e.jsx("option",{value:"",children:"Sélectionnez..."}),X.map(Q=>e.jsx("option",{value:Q.label,children:Q.label},Q.id))]}):e.jsx("input",{type:Ee(a.fieldType),value:a.value,onChange:Q=>W(w,{value:Q.target.value}),placeholder:"Valeur...",className:"svm-filter-input"})),ue&&e.jsx("input",{type:Ee(a.fieldType),value:a.value2||"",onChange:Q=>W(w,{value2:Q.target.value}),placeholder:"Max...",className:"svm-filter-input"}),e.jsx("button",{type:"button",className:"svm-filter-remove",onClick:()=>Y(w),title:"Supprimer ce filtre",children:e.jsx("svg",{viewBox:"0 0 24 24",fill:"none",className:"h-3.5 w-3.5",children:e.jsx("path",{d:"M18 6L6 18M6 6L18 18",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round"})})})]})]},w)}),e.jsxs("div",{className:"svm-filter-add-row",ref:le,children:[e.jsxs("button",{type:"button",className:"svm-filter-add-btn",onClick:()=>V(!ae),children:[e.jsx("svg",{viewBox:"0 0 24 24",fill:"none",className:"h-3.5 w-3.5",children:e.jsx("path",{d:"M12 5V19M5 12H19",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round"})}),"Ajouter un filtre"]}),ae&&e.jsxs("div",{className:"svm-filter-field-dropdown",children:[e.jsx("div",{className:"svm-filter-field-dropdown-title",children:"Choisir un champ"}),H.map(a=>e.jsx("button",{type:"button",className:"svm-filter-field-option",onClick:()=>F(a.id),children:a.name},a.id))]})]})]})]})]}),e.jsxs("div",{className:"saved-view-modal-footer",children:[e.jsx("button",{type:"button",className:"saved-view-btn saved-view-btn--cancel",onClick:()=>R(!1),children:"Annuler"}),e.jsxs("button",{type:"button",className:"saved-view-btn saved-view-btn--save",onClick:$,disabled:!f.trim(),children:[e.jsx("svg",{viewBox:"0 0 24 24",fill:"none",className:"h-4 w-4",children:e.jsx("path",{d:"M5 13L9 17L19 7",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round"})}),"Enregistrer"]})]})]})}),e.jsx("style",{children:`
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
            `})]})}function Ct(t,i){var s,j,S;if(i==="title")return t.referenceTitle||t.computedTitle||t.title||"";if(i==="createdAt")return t.createdAt||"";if(i==="updatedAt")return t.updatedAt||"";if(i.startsWith("rel:")){const k=i.replace("rel:",""),p=(((s=t._denorm)==null?void 0:s.relations)||[]).find(u=>u.relationKey===k);if(((j=p==null?void 0:p.records)==null?void 0:j.length)>0)return p.records.map(u=>u.title||u.computedTitle||"").join(", ");const x=(t.relations||[]).find(u=>u.key===k||u.relationKey===k);if(x)return x.title||x.computedTitle||x.value||"";const b=(S=t._denorm)==null?void 0:S[k];return b&&(b.title||b.computedTitle)||""}if(i.startsWith("classif:")){const k=i.replace("classif:","");return(t.classificationValues||[]).filter(x=>{var b;return((b=x.classificationId)==null?void 0:b.toString())===k}).map(x=>x.label||x.optionLabel||"").join(", ")}const o=(t.customFields||[]).find(k=>{var M,p,x;return((p=(M=k.field_id)==null?void 0:M._id)==null?void 0:p.toString())===i||((x=k.field_id)==null?void 0:x.toString())===i});return(o==null?void 0:o.value)??""}function Nt(t,i){const{operator:o,value:s,value2:j,fieldType:S}=i,k=["number","currency","percent"].includes(S),M=["date","datetime"].includes(S),p=String(t??"").trim(),x=p.toLowerCase(),b=String(s??"").trim().toLowerCase();switch(o){case"contains":return x.includes(b);case"not_contains":return!x.includes(b);case"equals":return k?parseFloat(p)===parseFloat(s):x===b;case"not_equals":return k?parseFloat(p)!==parseFloat(s):x!==b;case"starts_with":return x.startsWith(b);case"ends_with":return x.endsWith(b);case"gt":return M?new Date(t)>new Date(s):parseFloat(p)>parseFloat(s);case"gte":return M?new Date(t)>=new Date(s):parseFloat(p)>=parseFloat(s);case"lt":return M?new Date(t)<new Date(s):parseFloat(p)<parseFloat(s);case"lte":return M?new Date(t)<=new Date(s):parseFloat(p)<=parseFloat(s);case"between":{if(M){const D=new Date(t);return D>=new Date(s)&&D<=new Date(j)}const u=parseFloat(p);return u>=parseFloat(s)&&u<=parseFloat(j)}case"is_empty":return p===""||t==null;case"is_not_empty":return p!==""&&t!=null;default:return!0}}function Lt({accountId:t,accountNumber:i,entityId:o,viewId:s,entityName:j,entityNamePlural:S,entitySlug:k}){const[M,p]=r.useState([]),[x,b]=r.useState([]),[u,D]=r.useState([]),[v,_]=r.useState([]),[R,se]=r.useState(!0),[K,f]=r.useState(null),[c,y]=r.useState(""),[A,O]=r.useState("table"),[d,h]=r.useState(""),[ee,T]=r.useState(null),[q,E]=r.useState([]),[P,ae]=r.useState({}),[V,le]=r.useState([]),[oe,m]=r.useState([]),[I,Z]=r.useState(null),[$,H]=r.useState(!1),[g,F]=r.useState({columns:[],sort:{field:"createdAt",direction:"desc"},density:"normal",pageSize:10,titleDisplay:"avatar",showSidebar:!0,viewMode:null,enabledViews:["table","kanban","notes"]}),[W,Y]=r.useState({page:1,limit:10,total:0,pages:0}),de=r.useRef(null),fe=r.useCallback(async()=>{var l,C;try{se(!0),f(null);const N=new URLSearchParams({limit:1e4,sort:`${g.sort.field}:${g.sort.direction}`}),z=await fetch(`/account/${i}/api/entity/${o}/views/${s}/records?${N}`,{credentials:"include"});if(!z.ok)throw new Error(`HTTP ${z.status}`);const L=await z.json();if(p(L.records||[]),b(L.records||[]),L.entity&&(T(L.entity),L.entity.icon&&h(L.entity.icon)),L.filters&&E(L.filters),L.preferences)if(F(U=>{var G,ie;return{...U,...L.preferences,columns:(G=L.preferences.columns)!=null&&G.length?L.preferences.columns:((ie=L.columns)==null?void 0:ie.map(re=>({id:re.id,visible:!0})))||[]}}),L.preferences.pageSize&&Y(U=>({...U,limit:L.preferences.pageSize})),L.preferences.viewMode&&O(L.preferences.viewMode),(l=L.preferences.columns)!=null&&l.length&&((C=L.columns)!=null&&C.length)){const U=[];L.preferences.columns.forEach(G=>{const ie=L.columns.find(re=>re.id===G.id);ie&&U.push(ie)}),L.columns.forEach(G=>{U.find(ie=>ie.id===G.id)||U.push(G)}),_(U)}else _(L.columns||[]);else L.columns&&(_(L.columns||[]),F(U=>({...U,columns:L.columns.map(G=>({id:G.id,visible:!0}))})))}catch(N){console.error("[RecordsGrid] Fetch error:",N),f(N.message)}finally{se(!1)}},[i,o,s,g.sort]),n=r.useCallback(async()=>{try{const l=await fetch(`/account/${i}/api/entity/${o}/saved-views`,{credentials:"include"});if(l.ok){const C=await l.json();m(C.views||[])}}catch(l){console.error("[RecordsGrid] Fetch saved views error:",l)}},[i,o]),B=r.useCallback(async({name:l,color:C,filters:N,fieldFilters:z})=>{try{const L=await fetch(`/account/${i}/api/entity/${o}/saved-views`,{method:"POST",headers:{"Content-Type":"application/json"},credentials:"include",body:JSON.stringify({name:l,color:C,filters:N,fieldFilters:z})});if(L.ok){const U=await L.json();m(G=>[...G,U.view]),Z(U.view._id)}}catch(L){console.error("[RecordsGrid] Create saved view error:",L)}},[i,o]),J=r.useCallback(async l=>{try{(await fetch(`/account/${i}/api/entity/${o}/saved-views/${l}`,{method:"DELETE",credentials:"include"})).ok&&(m(N=>N.filter(z=>z._id!==l)),I===l&&(Z(null),ae({}),Y(N=>({...N,page:1}))))}catch(C){console.error("[RecordsGrid] Delete saved view error:",C)}},[i,o,I]),a=r.useCallback(async(l,C)=>{try{(await fetch(`/account/${i}/api/entity/${o}/saved-views/${l}`,{method:"PUT",headers:{"Content-Type":"application/json"},credentials:"include",body:JSON.stringify({name:C})})).ok&&m(z=>z.map(L=>L._id===l?{...L,name:C}:L))}catch(N){console.error("[RecordsGrid] Rename saved view error:",N)}},[i,o]),w=r.useCallback(async(l,C,N)=>{try{(await fetch(`/account/${i}/api/entity/${o}/saved-views/${l}`,{method:"PUT",headers:{"Content-Type":"application/json"},credentials:"include",body:JSON.stringify({filters:C,fieldFilters:N||[]})})).ok&&m(L=>L.map(U=>U._id===l?{...U,filters:C,fieldFilters:N||[]}:U))}catch(z){console.error("[RecordsGrid] Update saved view filters error:",z)}},[i,o]),te=r.useCallback(l=>{if(!l){Z(null),ae({}),le([]),Y(N=>({...N,page:1}));return}const C=oe.find(N=>N._id===l);C&&(Z(l),ae(C.filters||{}),le(C.fieldFilters||[]),Y(N=>({...N,page:1})))},[oe]);r.useEffect(()=>{fe(),n()},[]);const X=r.useMemo(()=>{if(!M.length)return[];const{field:l,direction:C}=g.sort,N=C==="asc"?1:-1;return[...M].sort((z,L)=>{let U,G;if(l==="title")U=(z.referenceTitle||z.title||"").toLowerCase(),G=(L.referenceTitle||L.title||"").toLowerCase();else if(l==="createdAt"||l==="updatedAt")U=new Date(z[l]||0).getTime(),G=new Date(L[l]||0).getTime();else{const ie=(z.customFields||[]).find(ce=>{var ge;const pe=((ge=ce.field_id)==null?void 0:ge._id)||ce.field_id;return(pe==null?void 0:pe.toString())===l}),re=(L.customFields||[]).find(ce=>{var ge;const pe=((ge=ce.field_id)==null?void 0:ge._id)||ce.field_id;return(pe==null?void 0:pe.toString())===l});U=((ie==null?void 0:ie.value)||"").toString().toLowerCase(),G=((re==null?void 0:re.value)||"").toString().toLowerCase()}return U<G?-1*N:U>G?1*N:0})},[M,g.sort.field,g.sort.direction]),ne=r.useMemo(()=>X.map(l=>({...l,_searchIndex:[l.title||"",l.referenceTitle||"",l.computedTitle||"",...(l.customFields||[]).map(C=>C.value||"")].join(" ").toLowerCase()})),[X]),he=r.useCallback((l,C,N,z)=>{let L=l;if(C&&C.trim()){const G=C.toLowerCase();L=L.filter(ie=>ie._searchIndex.includes(G))}const U=Object.keys(N).filter(G=>G!=="__favourites");return U.length>0&&(L=L.filter(G=>{const ie=G.classificationValues||[];return U.every(re=>{const ce=N[re];return!ce||ce.length===0?!0:ie.some(pe=>{var ge,$e;return((ge=pe.classificationId)==null?void 0:ge.toString())===re&&ce.includes(($e=pe.optionId)==null?void 0:$e.toString())})})})),z&&z.length>0&&(L=L.filter(G=>{const ie=[[z[0]]];for(let re=1;re<z.length;re++)(z[re].logic||"AND")==="OR"?ie.push([z[re]]):ie[ie.length-1].push(z[re]);return ie.some(re=>re.every(ce=>{const pe=Ct(G,ce.fieldId);return Nt(pe,ce)}))})),L},[]),ue=r.useCallback(l=>{var N;const C=typeof l=="string"?l:((N=l==null?void 0:l.target)==null?void 0:N.value)||"";y(C),Y(z=>({...z,page:1}))},[]),ve=r.useCallback(l=>{ae(l),Y(C=>({...C,page:1}))},[]),we=r.useCallback(l=>{le(l),Y(C=>({...C,page:1}))},[]);r.useEffect(()=>{const l=he(ne,c,P,V);b(l)},[ne,c,P,V,he]),r.useEffect(()=>{const l=(W.page-1)*W.limit,C=l+W.limit,N=x.slice(l,C);D(N),Y(z=>({...z,total:x.length,pages:Math.ceil(x.length/W.limit)}))},[x,W.page,W.limit]);const Q=r.useCallback(async l=>{try{await fetch(`/account/${i}/api/user/view-preferences`,{method:"POST",headers:{"Content-Type":"application/json"},credentials:"include",body:JSON.stringify({viewId:s,preferences:l})})}catch(C){console.error("[RecordsGrid] Save preferences error:",C)}},[i,s]),xe=r.useCallback((l,C)=>{const N={...g,[l]:C};F(N),Q(N),l==="pageSize"&&Y(z=>({...z,limit:C,page:1}))},[g,Q]),ke=r.useCallback(l=>{O(l),F(C=>{const N={...C,viewMode:l};return Q(N),N})},[Q]),me=r.useCallback(l=>{Y(C=>({...C,page:l}))},[]),Ne=r.useCallback((l,C)=>{_(N=>{const z=N.findIndex(re=>re.id===l),L=N.findIndex(re=>re.id===C);if(z===-1||L===-1)return N;const U=[...N],[G]=U.splice(z,1);U.splice(L,0,G);const ie=U.map(re=>g.columns.find(pe=>pe.id===re.id)||{id:re.id,visible:!0});return xe("columns",ie),U})},[g.columns,xe]),be=r.useMemo(()=>{switch(g.density){case"compact":return 36;case"comfortable":return 56;default:return 44}},[g.density]),Le=Be({count:u.length,getScrollElement:()=>de.current,estimateSize:()=>be,overscan:10});r.useEffect(()=>{Le.measure()},[be,Le]);const Oe=r.useMemo(()=>{var N;let l;(N=g.columns)!=null&&N.length?l=v.filter(z=>{const L=g.columns.find(U=>U.id===z.id);return L?L.visible!==!1:!0}):l=v;const C=l.findIndex(z=>z.id==="actions");if(C>-1&&C<l.length-1){const[z]=l.splice(C,1);l=[...l,z]}return l},[v,g.columns]);return R&&u.length===0?e.jsx("div",{className:"flex items-center justify-center h-64",children:e.jsx("div",{className:"animate-spin rounded-full h-8 w-8 border-b-2 border-primary"})}):K&&u.length===0?e.jsx("div",{className:"flex items-center justify-center h-64 text-danger",children:e.jsxs("span",{children:["Erreur: ",K]})}):e.jsxs("div",{className:"relative flex h-full gap-5 sm:min-h-0",children:[e.jsx(kt,{entityName:j,entityNamePlural:S,entityIcon:d,accountNumber:i,entitySlug:k,showSidebar:g.showSidebar!==!1,onToggleSidebar:()=>xe("showSidebar",!g.showSidebar),filters:q,activeFilters:P,onFilterChange:ve,columns:v,fieldFilters:V,onFieldFiltersChange:we,allRecords:M}),e.jsxs("div",{className:"panel p-4 flex-1 flex flex-col overflow-hidden h-full",children:[e.jsx(rt,{searchQuery:c,onSearch:ue,columns:v,preferences:g,onPreferencesChange:xe,loading:R,accountNumber:i,entitySlug:k,viewId:s,showSidebar:g.showSidebar!==!1,onToggleSidebar:()=>xe("showSidebar",!g.showSidebar),activeView:A,onViewChange:ke,enabledViews:g.enabledViews||["table","kanban","notes"],onEnabledViewsChange:l=>xe("enabledViews",l),hasActiveFilters:Object.keys(P).filter(l=>l!=="__favourites").length>0||V.length>0,onOpenSaveView:()=>H(!0)}),e.jsx(jt,{savedViews:oe,activeViewId:I,onSelectView:te,onCreateView:B,onDeleteView:J,onRenameView:a,onUpdateViewFilters:w,hasActiveFilters:Object.keys(P).filter(l=>l!=="__favourites").length>0||V.length>0,activeFilters:P,fieldFilters:V,sidebarFilters:q,columns:v,externalOpenCreate:$,onCloseExternalCreate:()=>H(!1)}),e.jsx("div",{className:"flex-1 flex flex-col overflow-hidden mt-4",children:A==="kanban"?e.jsx(lt,{records:x,columns:v,accountNumber:i,entitySlug:k,viewId:s,entityData:ee}):A==="notes"?e.jsx(gt,{records:x,accountNumber:i,entitySlug:k}):e.jsxs("div",{className:"dataTable-wrapper flex-1 flex flex-col overflow-hidden",children:[e.jsx("div",{className:"dataTable-container flex-1 overflow-auto",ref:de,children:e.jsx(st,{records:u,columns:Oe,virtualizer:Le,sort:g.sort,onSort:l=>{const C=g.sort.field===l&&g.sort.direction==="asc"?"desc":"asc";xe("sort",{field:l,direction:C})},onColumnReorder:Ne,density:g.density,titleDisplay:g.titleDisplay||"avatar",entityIcon:d,accountNumber:i,entitySlug:k})}),e.jsxs("div",{className:"dataTable-bottom flex items-center justify-between border-t pt-4 dark:border-gray-800",children:[e.jsxs("div",{className:"dataTable-info text-gray-500 dark:text-gray-400",children:["Affichage de ",(W.page-1)*W.limit+1," à ",Math.min(W.page*W.limit,W.total)," sur ",W.total]}),e.jsx("nav",{className:"dataTable-pagination",children:e.jsxs("ul",{className:"inline-flex items-center space-x-1 rtl:space-x-reverse",children:[e.jsx("li",{children:e.jsx("button",{onClick:()=>me(W.page-1),disabled:W.page<=1,className:"flex justify-center font-semibold p-2 rounded-full transition bg-white-light text-dark hover:text-white hover:bg-primary dark:text-white-light dark:bg-[#191e3a] dark:hover:bg-primary disabled:opacity-50",children:"«"})}),Array.from({length:Math.min(W.pages,5)},(l,C)=>{let N;return W.pages<=5||W.page<=3?N=C+1:W.page>=W.pages-2?N=W.pages-4+C:N=W.page-2+C,e.jsx("li",{children:e.jsx("button",{onClick:()=>me(N),className:`flex justify-center font-semibold px-3.5 py-2 rounded-full transition ${N===W.page?"bg-primary text-white dark:bg-primary dark:text-white-light":"bg-white-light text-dark hover:text-white hover:bg-primary dark:text-white-light dark:bg-[#191e3a] dark:hover:bg-primary"}`,children:N})},N)}),e.jsx("li",{children:e.jsx("button",{onClick:()=>me(W.page+1),disabled:W.page>=W.pages,className:"flex justify-center font-semibold p-2 rounded-full transition bg-white-light text-dark hover:text-white hover:bg-primary dark:text-white-light dark:bg-[#191e3a] dark:hover:bg-primary disabled:opacity-50",children:"»"})})]})})]})]})})]})]})}function Te(){document.querySelectorAll('[data-island="records-grid"]').forEach(t=>{if(t.dataset.mounted==="1")return;t.dataset.mounted="1";const i={accountId:t.dataset.accountId,accountNumber:t.dataset.accountNumber,entityId:t.dataset.entityId,viewId:t.dataset.viewId,entityName:t.dataset.entityName||"Records",entityNamePlural:t.dataset.entityNamePlural||"",entitySlug:t.dataset.entitySlug||"records"};console.log("[RecordsGrid Island] Mounting:",i),Ae(t).render(e.jsx(Ce.StrictMode,{children:e.jsx(Lt,{...i})}))})}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",Te):Te();
