import{r,j as e,a as _e,R as We,c as nt}from"./chunks/client-CkWOIrXP.js";import{u as lt}from"./chunks/index-CjVSFo3p.js";import{u as dt,a as Te,D as ct,c as ut,b as pt,d as xt,s as ft,K as ht,T as mt,M as gt,e as bt,S as vt,v as kt,f as yt,C as wt}from"./chunks/sortable.esm-DQ9-A8Dw.js";const ze=[{id:"table",label:"Tableau",icon:e.jsxs("svg",{viewBox:"0 0 24 24",fill:"none",className:"h-4 w-4",children:[e.jsx("path",{d:"M3 7H21",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"}),e.jsx("path",{d:"M3 12H21",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"}),e.jsx("path",{d:"M3 17H21",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"})]})},{id:"kanban",label:"Kanban",icon:e.jsxs("svg",{viewBox:"0 0 24 24",fill:"none",className:"h-4 w-4",children:[e.jsx("rect",{x:"3",y:"3",width:"5",height:"18",rx:"1",stroke:"currentColor",strokeWidth:"1.5"}),e.jsx("rect",{x:"10",y:"3",width:"5",height:"12",rx:"1",stroke:"currentColor",strokeWidth:"1.5"}),e.jsx("rect",{x:"17",y:"3",width:"4",height:"15",rx:"1",stroke:"currentColor",strokeWidth:"1.5"})]})},{id:"notes",label:"Notes",icon:e.jsxs("svg",{viewBox:"0 0 24 24",fill:"none",className:"h-4 w-4",children:[e.jsx("path",{d:"M2 12C2 7.28595 2 4.92893 3.46447 3.46447C4.92893 2 7.28595 2 12 2C16.714 2 19.0711 2 20.5355 3.46447C22 4.92893 22 7.28595 22 12C22 16.714 22 19.0711 20.5355 20.5355C19.0711 22 16.714 22 12 22C7.28595 22 4.92893 22 3.46447 20.5355C2 19.0711 2 16.714 2 12Z",stroke:"currentColor",strokeWidth:"1.5"}),e.jsx("path",{opacity:"0.5",d:"M2 12H22",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"}),e.jsx("path",{opacity:"0.5",d:"M12 2V22",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"})]})},{id:"calendar",label:"Calendrier",icon:e.jsxs("svg",{viewBox:"0 0 24 24",fill:"none",className:"h-4 w-4",children:[e.jsx("rect",{x:"3",y:"4",width:"18",height:"18",rx:"2",stroke:"currentColor",strokeWidth:"1.5"}),e.jsx("path",{d:"M16 2V6M8 2V6M3 10H21",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"}),e.jsx("circle",{cx:"12",cy:"16",r:"1",fill:"currentColor"}),e.jsx("circle",{cx:"16",cy:"16",r:"1",fill:"currentColor"}),e.jsx("circle",{cx:"8",cy:"16",r:"1",fill:"currentColor"})]})}];function jt({searchQuery:t,onSearch:o,columns:i,preferences:s,onPreferencesChange:S,loading:L,accountNumber:b,entitySlug:M,viewId:f,showSidebar:p,onToggleSidebar:w,activeView:x,onViewChange:k,enabledViews:u=["table","kanban","notes"],onEnabledViewsChange:j,hasActiveFilters:D=!1,onOpenSaveView:Q}){var oe,ce,he;const[K,h]=r.useState(!1),[z,V]=r.useState(!1),[B,U]=r.useState(!1),[l,n]=r.useState(!1),[Y,Z]=r.useState(""),O=r.useRef(null),C=r.useRef(null),v=r.useRef(null),$=r.useRef(null),_=r.useRef(null),ie=r.useRef(null),ne=r.useRef(null),y=r.useRef(null),T=()=>{h(!1),V(!1),U(!1),n(!1)};r.useEffect(()=>{const c=H=>{H.key==="Escape"&&T()};return document.addEventListener("keydown",c),()=>document.removeEventListener("keydown",c)},[]);const P=(c,H,G,E)=>{r.useEffect(()=>{const me=q=>{c&&H.current&&!H.current.contains(q.target)&&G.current&&!G.current.contains(q.target)&&E(!1)};return c&&setTimeout(()=>document.addEventListener("mousedown",me),0),()=>document.removeEventListener("mousedown",me)},[c])};P(K,_,O,h),P(z,ie,C,V),P(B,ne,v,U),P(l,y,$,n);const I=c=>{if(c==="table")return;const H=u.includes(c)?u.filter(G=>G!==c):[...u,c];j(H),x===c&&!H.includes(c)&&k("table")},J=ze.filter(c=>u.includes(c.id)),F=c=>{const H=s.columns.some(E=>E.id===c);let G;H?G=s.columns.map(E=>E.id===c?{...E,visible:!E.visible}:E):G=[...s.columns,{id:c,visible:!1}],S("columns",G)},A=c=>{if(!(c!=null&&c.current))return{top:0,right:0};const H=c.current.getBoundingClientRect();return{top:H.bottom+8,right:window.innerWidth-H.right}},re=Y.trim()?i.filter(c=>c.name.toLowerCase().includes(Y.toLowerCase())):i;return e.jsxs("div",{className:"dataTable-top flex items-center mb-0 justify-between gap-2",children:[e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsxs("a",{href:`/account/${b}/record/${M}/add`,className:"btn-add-expandable block rounded-full p-2 bg-white-light/40 hover:bg-white-light/90 hover:text-primary dark:bg-dark/40 dark:hover:bg-dark/60",title:"Ajouter",children:[e.jsx("svg",{className:"btn-add-icon",viewBox:"0 0 24 24",fill:"none",children:e.jsx("path",{d:"M12 5V19M5 12H19",stroke:"currentColor",strokeWidth:"2.5",strokeLinecap:"round"})}),e.jsx("span",{className:"btn-add-label",children:"Ajouter"})]}),e.jsxs("div",{className:"dataTable-search relative w-64",style:{marginLeft:0},children:[e.jsxs("svg",{className:"absolute left-4 top-1/2 ml-2 -translate-y-1/2 h-4 w-4 text-gray-400",viewBox:"0 0 24 24",fill:"none",children:[e.jsx("circle",{cx:"11",cy:"11",r:"8",stroke:"currentColor",strokeWidth:"1.5"}),e.jsx("path",{d:"M16.5 16.5L21 21",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"})]}),e.jsx("input",{type:"text",value:t,onChange:c=>o(c.target.value),placeholder:"Rechercher...",className:"dataTable-input form-input w-full pl-11 pr-10",style:{"padding-left":"33px"}}),L&&e.jsx("div",{className:"absolute right-3 top-1/2 -translate-y-1/2",children:e.jsx("div",{className:"animate-spin rounded-full h-4 w-4 border-b-2 border-primary"})})]})]}),e.jsxs("div",{className:"flex items-center gap-2",children:[J.map(c=>e.jsx("button",{type:"button",onClick:()=>k(c.id),title:c.label,className:`block rounded-full p-2 transition-all ${x===c.id?"bg-primary/20 text-primary":"bg-white-light/40 hover:bg-white-light/90 hover:text-primary dark:bg-dark/40 dark:hover:bg-dark/60"}`,children:c.icon},c.id)),e.jsx("button",{ref:$,type:"button",onClick:()=>{n(!l),h(!1),V(!1),U(!1)},className:`block rounded-full p-2 transition-all ${l?"bg-primary/20 text-primary":"bg-white-light/40 hover:bg-white-light/90 hover:text-primary dark:bg-dark/40 dark:hover:bg-dark/60"}`,title:"Configurer les vues",children:e.jsxs("svg",{className:"h-4 w-4",viewBox:"0 0 24 24",fill:"none",children:[e.jsx("circle",{cx:"12",cy:"12",r:"3",stroke:"currentColor",strokeWidth:"1.5"}),e.jsx("path",{d:"M12 2V4M12 20V22M2 12H4M20 12H22M4.93 4.93L6.34 6.34M17.66 17.66L19.07 19.07M4.93 19.07L6.34 17.66M17.66 6.34L19.07 4.93",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"})]})}),e.jsx("div",{className:"w-px h-5 bg-gray-200 dark:bg-gray-700 mx-0.5"}),e.jsx("button",{type:"button",onClick:Q,className:`block rounded-full p-2 transition-all ${D?"bg-primary/20 text-primary":"bg-white-light/40 hover:bg-white-light/90 hover:text-primary dark:bg-dark/40 dark:hover:bg-dark/60"}`,title:"Filtrer & enregistrer la vue",children:e.jsx("svg",{className:"h-4 w-4",viewBox:"0 0 24 24",fill:"none",children:e.jsx("path",{d:"M22 3H2L10 12.46V19L14 21V12.46L22 3Z",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round"})})}),x==="table"&&(()=>{var H,G;const c=((H=s.sort)==null?void 0:H.field)!=="createdAt"||((G=s.sort)==null?void 0:G.direction)!=="desc";return e.jsx("button",{ref:C,type:"button",onClick:()=>{V(!z),h(!1),U(!1),n(!1)},className:`block rounded-full p-2 transition-all ${z||c?"bg-primary/20 text-primary":"bg-white-light/40 hover:bg-white-light/90 hover:text-primary dark:bg-dark/40 dark:hover:bg-dark/60"}`,title:"Trier",children:e.jsxs("svg",{className:"h-4 w-4",viewBox:"0 0 24 24",fill:"none",children:[e.jsx("path",{d:"M16 18L16 6M16 6L20 10M16 6L12 10",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round"}),e.jsx("path",{d:"M8 6L8 18M8 18L12 14M8 18L4 14",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round"})]})})})(),e.jsx("button",{ref:O,type:"button",onClick:()=>{h(!K),V(!1),U(!1),n(!1)},className:`block rounded-full p-2 transition-all ${K?"bg-primary/20 text-primary":"bg-white-light/40 hover:bg-white-light/90 hover:text-primary dark:bg-dark/40 dark:hover:bg-dark/60"}`,title:"Mode d'affichage",children:e.jsxs("svg",{className:"h-4 w-4",viewBox:"0 0 24 24",fill:"none",children:[e.jsx("path",{d:"M3 7H21",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"}),e.jsx("path",{d:"M6 12H18",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"}),e.jsx("path",{d:"M10 17H14",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"})]})}),x==="table"&&e.jsx("button",{ref:v,type:"button",onClick:()=>{U(!B),h(!1),V(!1),n(!1)},className:`block rounded-full p-2 transition-all ${B?"bg-primary/20 text-primary":"bg-white-light/40 hover:bg-white-light/90 hover:text-primary dark:bg-dark/40 dark:hover:bg-dark/60"}`,title:"Colonnes visibles",children:e.jsxs("svg",{className:"h-4 w-4",viewBox:"0 0 24 24",fill:"none",children:[e.jsx("path",{d:"M9 3H4C3.44772 3 3 3.44772 3 4V11C3 11.5523 3.44772 12 4 12H9C9.55228 12 10 11.5523 10 11V4C10 3.44772 9.55228 3 9 3Z",stroke:"currentColor",strokeWidth:"1.5"}),e.jsx("path",{d:"M20 3H15C14.4477 3 14 3.44772 14 4V7C14 7.55228 14.4477 8 15 8H20C20.5523 8 21 7.55228 21 7V4C21 3.44772 20.5523 3 20 3Z",stroke:"currentColor",strokeWidth:"1.5"}),e.jsx("path",{d:"M20 12H15C14.4477 12 14 12.4477 14 13V20C14 20.5523 14.4477 21 15 21H20C20.5523 21 21 20.5523 21 20V13C21 12.4477 20.5523 12 20 12Z",stroke:"currentColor",strokeWidth:"1.5"}),e.jsx("path",{d:"M9 16H4C3.44772 16 3 16.4477 3 17V20C3 20.5523 3.44772 21 4 21H9C9.55228 21 10 20.5523 10 20V17C10 16.4477 9.55228 16 9 16Z",stroke:"currentColor",strokeWidth:"1.5"})]})}),e.jsxs("button",{type:"button",onClick:w,className:"btn-sidebar-toggle block rounded-full p-2 bg-white-light/40 hover:bg-white-light/90 hover:text-primary dark:bg-dark/40 dark:hover:bg-dark/60",title:p?"Masquer le panneau":"Afficher le panneau",children:[e.jsxs("svg",{className:"btn-sidebar-icon",viewBox:"0 0 24 24",fill:"none",children:[e.jsx("rect",{x:"3",y:"3",width:"18",height:"18",rx:"2",stroke:"currentColor",strokeWidth:"1.5"}),e.jsx("path",{d:"M9 3V21",stroke:"currentColor",strokeWidth:"1.5"})]}),e.jsx("span",{className:"btn-sidebar-label",children:p?"Masquer":"Panneau"})]})]}),z&&_e.createPortal(e.jsxs(e.Fragment,{children:[e.jsx("div",{className:"fixed inset-0",style:{zIndex:9998},onClick:()=>V(!1)}),e.jsxs("div",{ref:ie,className:"fixed rounded-xl shadow-xl p-4 w-72 bg-white dark:bg-[#0e1726] border border-gray-100 dark:border-white/10",style:{zIndex:9999,top:A(C).top,right:A(C).right,animation:"popoverSlide 0.15s ease-out"},children:[e.jsx("div",{className:"text-xs font-medium text-gray-500 dark:text-white-dark mb-2",children:"Trier par"}),e.jsxs("div",{className:"flex gap-2",children:[e.jsxs("select",{value:((oe=s.sort)==null?void 0:oe.field)||"createdAt",onChange:c=>S("sort",{...s.sort,field:c.target.value}),className:"flex-1 px-2 py-1.5 text-xs border border-gray-200 dark:border-white/10 rounded-lg bg-white dark:bg-[#1b2e4b] text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary/50",children:[e.jsx("option",{value:"createdAt",children:"Date de création"}),e.jsx("option",{value:"title",children:"Titre"}),i.filter(c=>c.id!=="title"&&c.id!=="actions").map(c=>e.jsx("option",{value:c.id,children:c.name},c.id))]}),e.jsx("button",{onClick:()=>{var c;return S("sort",{...s.sort,direction:((c=s.sort)==null?void 0:c.direction)==="asc"?"desc":"asc"})},className:"p-1.5 border border-gray-200 dark:border-white/10 rounded-lg bg-white dark:bg-[#1b2e4b] hover:bg-gray-50 dark:hover:bg-[#253b5c] transition-all",title:((ce=s.sort)==null?void 0:ce.direction)==="asc"?"Croissant":"Décroissant",children:e.jsx("svg",{className:`h-4 w-4 text-gray-600 dark:text-white transition-transform ${((he=s.sort)==null?void 0:he.direction)==="asc"?"rotate-180":""}`,viewBox:"0 0 24 24",fill:"none",children:e.jsx("path",{d:"M12 5V19M12 19L6 13M12 19L18 13",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round"})})}),e.jsx("button",{onClick:()=>S("sort",{field:"createdAt",direction:"desc"}),className:"p-1.5 border border-gray-200 dark:border-white/10 rounded-lg bg-white dark:bg-[#1b2e4b] hover:bg-red-50 hover:border-red-300 hover:text-red-500 dark:hover:bg-red-900/20 transition-all",title:"Réinitialiser le tri",children:e.jsxs("svg",{className:"h-4 w-4 text-gray-600 dark:text-white",viewBox:"0 0 24 24",fill:"none",children:[e.jsx("path",{d:"M4.06189 13C4.02104 12.6724 4 12.3387 4 12C4 7.58172 7.58172 4 12 4C14.5006 4 16.7332 5.14727 18.2002 6.94416M19.9381 11C19.979 11.3276 20 11.6613 20 12C20 16.4183 16.4183 20 12 20C9.49944 20 7.26681 18.8527 5.79984 17.0558",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round"}),e.jsx("path",{d:"M15 7H19V3",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round"}),e.jsx("path",{d:"M9 17H5V21",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round"})]})})]})]})]}),document.body),K&&_e.createPortal(e.jsxs(e.Fragment,{children:[e.jsx("div",{className:"fixed inset-0",style:{zIndex:9998},onClick:()=>h(!1)}),e.jsxs("div",{ref:_,className:"fixed rounded-xl shadow-xl p-4 w-72 bg-white dark:bg-[#0e1726] border border-gray-100 dark:border-white/10",style:{zIndex:9999,top:A(O).top,right:A(O).right,animation:"popoverSlide 0.15s ease-out"},children:[e.jsxs("div",{className:"mb-4",children:[e.jsx("div",{className:"text-xs font-medium text-gray-500 dark:text-white-dark mb-2",children:"Densité"}),e.jsx("div",{className:"flex gap-1",children:["compact","normal","comfortable"].map(c=>e.jsx("button",{onClick:()=>S("density",c),className:`flex-1 px-2 py-1.5 text-xs rounded-lg transition-all ${s.density===c?"bg-primary text-white":"bg-gray-100 dark:bg-dark/40 text-gray-600 dark:text-white-dark/70 hover:bg-gray-200 dark:hover:bg-dark/60"}`,children:c==="compact"?"Compact":c==="normal"?"Normal":"Confort"},c))})]}),e.jsxs("div",{className:"mb-4",children:[e.jsx("div",{className:"text-xs font-medium text-gray-500 dark:text-white-dark mb-2",children:"Lignes par page"}),e.jsx("div",{className:"flex gap-1",children:[10,25,50,100].map(c=>e.jsx("button",{onClick:()=>S("pageSize",c),className:`flex-1 px-2 py-1.5 text-xs rounded-lg transition-all ${s.pageSize===c?"bg-primary text-white":"bg-gray-100 dark:bg-dark/40 text-gray-600 dark:text-white-dark/70 hover:bg-gray-200 dark:hover:bg-dark/60"}`,children:c},c))})]})]})]}),document.body),B&&_e.createPortal(e.jsxs(e.Fragment,{children:[e.jsx("div",{className:"fixed inset-0",style:{zIndex:9998},onClick:()=>U(!1)}),e.jsxs("div",{ref:ne,className:"fixed rounded-xl shadow-xl p-4 w-64 bg-white dark:bg-[#0e1726] border border-gray-100 dark:border-white/10",style:{zIndex:9999,top:A(v).top,right:A(v).right,animation:"popoverSlide 0.15s ease-out"},children:[e.jsx("div",{className:"text-xs font-medium text-gray-500 dark:text-white-dark mb-2",children:"Colonnes visibles"}),e.jsx("div",{className:"relative mb-2",children:e.jsx("input",{type:"text",value:Y,onChange:c=>Z(c.target.value),placeholder:"Filtrer...",className:"w-full px-3 py-1.5 text-xs border border-gray-200 dark:border-white/10 rounded-lg bg-white dark:bg-[#1b2e4b] text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary/50"})}),e.jsx("div",{className:"space-y-0.5 max-h-48 overflow-y-auto",children:re.map(c=>{const H=s.columns.find(E=>E.id===c.id),G=H?H.visible!==!1:!0;return e.jsxs("label",{className:"flex items-center gap-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 px-2 py-1.5 rounded-lg",children:[e.jsx("input",{type:"checkbox",checked:G,onChange:()=>F(c.id),className:"form-checkbox text-primary w-3.5 h-3.5 rounded"}),e.jsx("span",{className:"text-xs text-gray-700 dark:text-gray-300",children:c.name})]},c.id)})}),e.jsx("div",{className:"border-t border-gray-100 dark:border-white/10 mt-3 mb-2"}),e.jsxs("div",{children:[e.jsx("div",{className:"text-xs font-medium text-gray-500 dark:text-white-dark mb-2",children:"Affichage titre"}),e.jsx("div",{className:"flex gap-1",children:[{value:"avatar",label:"Avatar"},{value:"icon",label:"Icône"},{value:"none",label:"Aucun"}].map(c=>e.jsx("button",{onClick:()=>S("titleDisplay",c.value),className:`flex-1 px-2 py-1.5 text-xs rounded-lg transition-all ${(s.titleDisplay||"avatar")===c.value?"bg-primary text-white":"bg-gray-100 dark:bg-dark/40 text-gray-600 dark:text-white-dark/70 hover:bg-gray-200 dark:hover:bg-dark/60"}`,children:c.label},c.value))})]}),e.jsx("div",{className:"border-t border-gray-100 dark:border-white/10 mt-3 mb-2"}),e.jsx("div",{children:e.jsxs("div",{className:"flex items-center justify-between",children:[e.jsx("span",{className:"text-xs font-medium text-gray-500 dark:text-white-dark",children:"Sélection multiple"}),e.jsx("button",{type:"button",onClick:()=>S("showCheckboxes",s.showCheckboxes===!1),style:{position:"relative",width:36,height:20,borderRadius:10,border:"none",cursor:"pointer",transition:"background 0.2s ease",background:s.showCheckboxes!==!1?"#4361ee":"#d1d5db",padding:0},children:e.jsx("span",{style:{position:"absolute",top:2,left:s.showCheckboxes!==!1?18:2,width:16,height:16,borderRadius:"50%",background:"#fff",boxShadow:"0 1px 3px rgba(0,0,0,0.2)",transition:"left 0.2s ease"}})})]})})]})]}),document.body),l&&_e.createPortal(e.jsxs(e.Fragment,{children:[e.jsx("div",{className:"fixed inset-0",style:{zIndex:9998},onClick:()=>n(!1)}),e.jsxs("div",{ref:y,className:"fixed rounded-xl shadow-xl p-4 w-64 bg-white dark:bg-[#0e1726] border border-gray-100 dark:border-white/10",style:{zIndex:9999,top:A($).top,right:A($).right,animation:"popoverSlide 0.15s ease-out"},children:[e.jsx("div",{className:"text-xs font-medium text-gray-500 dark:text-white-dark mb-3",children:"Vues disponibles"}),e.jsx("div",{className:"space-y-1",children:ze.map(c=>{const H=u.includes(c.id),G=c.id==="table";return e.jsxs("label",{className:`flex items-center gap-3 cursor-pointer px-2 py-2 rounded-lg transition-all ${G?"opacity-60 cursor-not-allowed":"hover:bg-gray-50 dark:hover:bg-gray-800"}`,children:[e.jsx("input",{type:"checkbox",checked:H,onChange:()=>I(c.id),disabled:G,className:"form-checkbox text-primary w-4 h-4 rounded"}),e.jsxs("span",{className:`flex items-center gap-2 text-sm ${H?"text-gray-700 dark:text-gray-300":"text-gray-400 dark:text-gray-600"}`,children:[c.icon,c.label]})]},c.id)})}),e.jsx("div",{className:"border-t border-gray-100 dark:border-white/10 mt-3 pt-2",children:e.jsx("p",{className:"text-[10px] text-gray-400 dark:text-gray-600",children:"Le tableau est toujours activé par défaut."})})]})]}),document.body),e.jsx("style",{children:`
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
            `})]})}function Ct({records:t,columns:o,virtualizer:i,sort:s,onSort:S,onColumnReorder:L,density:b,titleDisplay:M,entityIcon:f,accountNumber:p,entitySlug:w,selectedIds:x,onToggleSelect:k,onSelectAll:u,allPageSelected:j,showCheckboxes:D=!0}){var l;const[Q,K]=r.useState(null),[h,z]=r.useState(null),V=i.getVirtualItems(),B={compact:{rowHeight:36,cellClass:"py-1",fontSize:"text-xs",imageSize:"w-6 h-6",fontWeight:"font-medium"},normal:{rowHeight:44,cellClass:"py-2",fontSize:"text-sm",imageSize:"w-9 h-9",fontWeight:"font-semibold"},comfortable:{rowHeight:56,cellClass:"py-3",fontSize:"text-sm",imageSize:"w-9 h-9",fontWeight:"font-semibold"}},U=B[b]||B.comfortable;return x&&x.size>0,e.jsxs("table",{className:"table-hover whitespace-nowrap dataTable-table w-full",children:[e.jsx("thead",{className:"sticky top-0 bg-white dark:bg-[#1b2e4b] z-10",children:e.jsxs("tr",{children:[D&&e.jsx("th",{style:{width:40,padding:"0 8px"},children:e.jsxs("label",{className:"bulk-checkbox-wrapper",style:{display:"flex",alignItems:"center",justifyContent:"center"},children:[e.jsx("input",{type:"checkbox",checked:j&&t.length>0,onChange:()=>u&&u(),className:"bulk-checkbox"}),e.jsx("span",{className:"bulk-checkbox-custom"})]})}),o.map(n=>{const Y=(s==null?void 0:s.field)===n.id||n.id==="title"&&(s==null?void 0:s.field)==="title"||n.id==="createdAt"&&(s==null?void 0:s.field)==="createdAt",Z=(s==null?void 0:s.direction)||"desc",O=Q===n.id,C=h===n.id&&Q!==n.id,v=n.id!=="actions";return e.jsx("th",{"data-sortable":n.sortable!==!1?"":void 0,"data-column-id":n.id,onDragEnter:$=>{$.preventDefault(),n.id!=="actions"&&Q&&Q!==n.id&&z(n.id)},onDragOver:$=>{$.preventDefault()},onDrop:$=>{$.preventDefault(),Q&&Q!==n.id&&n.id!=="actions"&&L&&L(Q,n.id),K(null),z(null)},className:`px-2 ${O?"opacity-50":""} ${C?"border-l-2 border-l-primary bg-primary/5":""}`,style:{transition:"opacity 0.15s, border-color 0.15s, background 0.15s",...n.id==="actions"?{width:"1%",whiteSpace:"nowrap"}:{},...n.id==="title"?{minWidth:220}:{}},children:e.jsxs("div",{className:"flex items-center gap-1",children:[v&&e.jsx("span",{draggable:"true",onDragStart:$=>{K(n.id),$.dataTransfer.effectAllowed="move",$.dataTransfer.setData("text/plain",n.id)},onDragEnd:()=>{K(null),z(null)},className:"cursor-grab text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300",children:e.jsxs("svg",{className:"h-3 w-3",viewBox:"0 0 24 24",fill:"currentColor",children:[e.jsx("circle",{cx:"9",cy:"6",r:"1.5"}),e.jsx("circle",{cx:"15",cy:"6",r:"1.5"}),e.jsx("circle",{cx:"9",cy:"12",r:"1.5"}),e.jsx("circle",{cx:"15",cy:"12",r:"1.5"}),e.jsx("circle",{cx:"9",cy:"18",r:"1.5"}),e.jsx("circle",{cx:"15",cy:"18",r:"1.5"})]})}),n.sortable!==!1?e.jsxs("a",{href:"#",className:"dataTable-sorter flex items-center gap-1",draggable:"false",onClick:$=>{$.preventDefault(),S(n.id)},children:[n.name,Y&&e.jsx("svg",{className:`h-3 w-3 text-primary transition-transform ${Z==="asc"?"rotate-180":""}`,viewBox:"0 0 24 24",fill:"none",children:e.jsx("path",{d:"M12 5V19M12 19L6 13M12 19L18 13",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round"})})]}):n.name]})},n.id)})]})}),e.jsxs("tbody",{children:[V.length>0&&V[0].start>0&&e.jsx("tr",{children:e.jsx("td",{colSpan:o.length+1,style:{height:V[0].start,padding:0}})}),V.map(n=>{const Y=t[n.index];if(!Y)return null;const Z={compact:"4px 8px",normal:"8px 12px",comfortable:"12px 12px"}[b]||"12px 12px",O=x&&x.has(Y._id);return e.jsxs("tr",{"data-index":n.index,ref:i.measureElement,style:{minHeight:U.rowHeight},className:O?"bulk-row-selected":"",children:[D&&e.jsx("td",{style:{padding:"0 8px",width:40},children:e.jsxs("label",{className:"bulk-checkbox-wrapper",style:{display:"flex",alignItems:"center",justifyContent:"center"},onClick:C=>{C.preventDefault(),k&&k(Y._id,n.index,C.shiftKey)},children:[e.jsx("input",{type:"checkbox",checked:O,readOnly:!0,className:"bulk-checkbox"}),e.jsx("span",{className:"bulk-checkbox-custom"})]})}),o.map(C=>e.jsx("td",{className:`${U.fontSize}`,style:{padding:Z,...C.id==="actions"?{width:"1%",whiteSpace:"nowrap"}:{},...C.id==="title"?{minWidth:220}:{}},children:Nt(Y,C,p,w,U,M,f)},C.id))]},Y._id)}),V.length>0&&e.jsx("tr",{children:e.jsx("td",{colSpan:o.length+1,style:{height:Math.max(0,i.getTotalSize()-(((l=V[V.length-1])==null?void 0:l.end)||0)),padding:0}})})]})]})}function Nt(t,o,i,s,S,L,b){var M,f;switch(o.id){case"title":{const p=t.referenceTitle||t.title||"Sans titre";p.charAt(0).toUpperCase();const w=Math.abs(p.charCodeAt(0)||65)%35+1,x=t.image||`/assets/images/profile-${w}.jpeg`;return e.jsxs("div",{className:"flex items-center gap-2",children:[L==="avatar"&&e.jsx("img",{src:x,alt:p,className:`${S.imageSize} rounded-full max-w-none`}),L==="icon"&&b&&e.jsx("div",{className:`${S.imageSize} rounded-lg max-w-none flex items-center justify-center bg-primary/10 text-primary shrink-0`,children:e.jsx("iconify-icon",{icon:b,width:"16"})}),e.jsx("a",{href:`/account/${i}/record/${s}/${t._id}/edit`,className:`${S.fontWeight} hover:text-primary transition-colors truncate`,title:p,children:p})]})}case"createdAt":return new Date(t.createdAt).toLocaleDateString("fr-FR");case"actions":return e.jsxs("div",{className:"flex items-center gap-0",children:[e.jsx("a",{href:`/account/${i}/record/${s}/${t._id}`,className:"p-1 rounded-lg text-gray-500 hover:text-primary hover:bg-primary/10 transition-all",title:"Voir",children:e.jsxs("svg",{className:"h-4 w-4",viewBox:"0 0 24 24",fill:"none",children:[e.jsx("path",{d:"M15 12C15 13.6569 13.6569 15 12 15C10.3431 15 9 13.6569 9 12C9 10.3431 10.3431 9 12 9C13.6569 9 15 10.3431 15 12Z",stroke:"currentColor",strokeWidth:"1.5"}),e.jsx("path",{d:"M12 5C7.5 5 3.73 7.94 2 12C3.73 16.06 7.5 19 12 19C16.5 19 20.27 16.06 22 12C20.27 7.94 16.5 5 12 5Z",stroke:"currentColor",strokeWidth:"1.5"})]})}),e.jsx("a",{href:`/account/${i}/record/${s}/${t._id}/edit`,className:"p-1 rounded-lg text-gray-500 hover:text-info hover:bg-info/10 transition-all",title:"Modifier",children:e.jsx("svg",{className:"h-4 w-4",viewBox:"0 0 24 24",fill:"none",children:e.jsx("path",{d:"M16.862 4.487L18.55 2.8C19.33 2.02 20.59 2.02 21.37 2.8C22.15 3.58 22.15 4.84 21.37 5.62L19.681 7.307M16.862 4.487L4.162 17.187C3.882 17.467 3.682 17.818 3.592 18.198L2.732 21.596C2.642 21.966 2.952 22.296 3.322 22.226L6.892 21.556C7.242 21.486 7.572 21.306 7.832 21.046L20.513 8.366M16.862 4.487L19.681 7.307",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round"})})}),e.jsx("button",{type:"button",className:"p-1 rounded-lg text-gray-500 hover:text-danger hover:bg-danger/10 transition-all",title:"Supprimer",onClick:()=>{confirm("Êtes-vous sûr de vouloir supprimer cet enregistrement ?")&&console.log("Delete record:",t._id)},children:e.jsxs("svg",{className:"h-4 w-4",viewBox:"0 0 24 24",fill:"none",children:[e.jsx("path",{d:"M20.5 6H3.5",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"}),e.jsx("path",{d:"M18.833 8.5L18.373 15.4C18.196 18.054 18.108 19.381 17.243 20.19C16.378 21 15.048 21 12.387 21H11.613C8.952 21 7.622 21 6.757 20.19C5.892 19.381 5.804 18.054 5.627 15.4L5.167 8.5",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"}),e.jsx("path",{d:"M9.5 11L10 16",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"}),e.jsx("path",{d:"M14.5 11L14 16",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"}),e.jsx("path",{d:"M6.5 6C6.556 5.367 6.612 5.1 6.877 4.714C7.178 4.275 7.945 3.917 9.484 3.2L9.924 2.984C10.683 2.589 11.06 2.392 11.476 2.318C11.823 2.254 12.177 2.254 12.524 2.318C12.94 2.392 13.317 2.589 14.076 2.984L14.516 3.2C16.055 3.917 16.822 4.275 17.123 4.714C17.388 5.1 17.444 5.367 17.5 6",stroke:"currentColor",strokeWidth:"1.5"})]})})]});default:{if(o.id.startsWith("rel:")){const p=o.id.substring(4),x=(((M=t._denorm)==null?void 0:M.relations)||[]).find(u=>u.relationKey===p);if(((f=x==null?void 0:x.records)==null?void 0:f.length)>0)return e.jsx("div",{className:"flex flex-wrap gap-1",children:x.records.map((u,j)=>e.jsx("a",{href:`/account/${i}/record/${u.entitySlug||s}/${u._id}`,className:"text-primary hover:underline text-xs",children:u.title||"Sans titre"},j))});const k=(t.relations||[]).find(u=>u.relationKey===p);return k!=null&&k.value?"—":""}if(o.id.startsWith("classif:")){const p=o.id.substring(8),w=(t.classificationValues||[]).find(x=>{var u,j,D;return(((u=x.classificationId)==null?void 0:u.$oid)||((D=(j=x.classificationId)==null?void 0:j.toString)==null?void 0:D.call(j))||x.classificationId)===p});if(w!=null&&w.label){const x=w.color||"#888";return e.jsx("span",{className:"inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap",style:{backgroundColor:`${x}15`,color:x,border:`1px solid ${x}30`},children:w.label})}return w!=null&&w.value?e.jsx("span",{className:"inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20",children:w.value}):""}if(t.customFields){const p=t.customFields.find(x=>{var u;const k=((u=x.field_id)==null?void 0:u._id)||x.field_id;return(k==null?void 0:k.toString())===o.id});if(!p)return"";const w=p.value;if(w&&typeof w=="object"&&w._v){const x=[];return Object.entries(w).forEach(([k,u])=>{k==="_v"||k==="customText"||(Array.isArray(u)?u.forEach(j=>x.push(j)):u&&x.push(u))}),w.customText&&x.push(w.customText),e.jsx("div",{className:"flex flex-wrap gap-1",children:x.map((k,u)=>e.jsx("span",{className:"inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20",children:k},u))})}return w||""}return""}}}function Be(t,o=.1){if(!t)return`rgba(99, 102, 241, ${o})`;const i=parseInt(t.slice(1,3),16),s=parseInt(t.slice(3,5),16),S=parseInt(t.slice(5,7),16);return`rgba(${i}, ${s}, ${S}, ${o})`}function St({field:t,record:o}){const i=(o.customFields||[]).find(S=>{var b;const L=((b=S.field_id)==null?void 0:b._id)||S.field_id;return(L==null?void 0:L.toString())===t.id});if(!i)return e.jsx("span",{className:"text-gray-400 dark:text-gray-600 text-sm italic",children:"—"});const s=i.value;if(s==null||s==="")return e.jsx("span",{className:"text-gray-400 dark:text-gray-600 text-sm italic",children:"—"});if(t.type==="date"||t.type==="datetime")try{return e.jsx("span",{className:"text-sm text-gray-700 dark:text-gray-300",children:new Date(s).toLocaleDateString("fr-FR")})}catch{return e.jsx("span",{className:"text-sm text-gray-700 dark:text-gray-300",children:String(s)})}return t.type==="boolean"||t.type==="checkbox"?e.jsxs("span",{className:`inline-flex items-center gap-1 text-sm ${s?"text-success":"text-gray-400"}`,children:[s?e.jsxs("svg",{width:"16",height:"16",viewBox:"0 0 24 24",fill:"none",children:[e.jsx("path",{d:"M9 12l2 2 4-4",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round"}),e.jsx("circle",{cx:"12",cy:"12",r:"10",stroke:"currentColor",strokeWidth:"1.5"})]}):e.jsx("svg",{width:"16",height:"16",viewBox:"0 0 24 24",fill:"none",children:e.jsx("circle",{cx:"12",cy:"12",r:"10",stroke:"currentColor",strokeWidth:"1.5"})}),s?"Oui":"Non"]}):t.type==="relation"?Array.isArray(s)?e.jsx("div",{className:"flex flex-wrap gap-1",children:s.map((S,L)=>e.jsx("span",{className:"inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-primary/10 text-primary font-medium",children:S.title||S.label||S.name||String(S)},L))}):e.jsx("span",{className:"text-sm text-gray-700 dark:text-gray-300",children:s.title||s.label||String(s)}):t.type==="number"?e.jsx("span",{className:"text-sm font-mono text-gray-700 dark:text-gray-300",children:Number(s).toLocaleString("fr-FR")}):e.jsx("span",{className:"text-sm text-gray-700 dark:text-gray-300",children:String(s)})}function Lt({record:t,columns:o,accountNumber:i,entitySlug:s,onClose:S}){var K;const L=r.useRef(null),[b,M]=r.useState(!1);r.useEffect(()=>{requestAnimationFrame(()=>M(!0))},[]);const f=r.useCallback(()=>{M(!1),setTimeout(()=>S(),250)},[S]);if(r.useEffect(()=>{const h=z=>{z.key==="Escape"&&f()};return document.addEventListener("keydown",h),()=>document.removeEventListener("keydown",h)},[f]),!t)return null;const p=((K=t._id)==null?void 0:K.$oid)||t._id,w=t.referenceTitle||t.title||t.computedTitle||"Sans titre",x=t.description||"",k=t.createdAt?new Date(t.createdAt).toLocaleDateString("fr-FR",{day:"2-digit",month:"long",year:"numeric"}):null,u=t.updatedAt?new Date(t.updatedAt).toLocaleDateString("fr-FR",{day:"2-digit",month:"long",year:"numeric"}):null,j=(t.classificationValues||[]).filter(h=>h.optionLabel||h.label).map(h=>({label:h.optionLabel||h.label,color:h.optionColor||h.color||"#6366f1",classificationName:h.classificationName||"Classification"})),D={};j.forEach(h=>{D[h.classificationName]||(D[h.classificationName]=[]),D[h.classificationName].push(h)});const Q=o.filter(h=>h.id!=="title"&&h.id!=="actions"&&!h.id.startsWith("class:"));return _e.createPortal(e.jsxs(e.Fragment,{children:[e.jsx("div",{className:`fixed inset-0 bg-black/40 backdrop-blur-[2px] transition-opacity duration-250 ${b?"opacity-100":"opacity-0"}`,style:{zIndex:1e4},onMouseDown:f,onTouchEnd:h=>{h.preventDefault(),f()}}),e.jsxs("div",{ref:L,className:`fixed right-0 top-0 h-full bg-white dark:bg-[#0e1726] shadow-2xl border-l border-gray-200 dark:border-gray-700 flex flex-col transition-transform duration-250 ease-out ${b?"translate-x-0":"translate-x-full"}`,style:{zIndex:10001,width:"min(520px, 90vw)"},onClick:h=>h.stopPropagation(),children:[e.jsxs("div",{className:"flex items-center justify-between gap-3 px-6 py-4 border-b border-gray-100 dark:border-gray-700/50 flex-shrink-0",children:[e.jsxs("div",{className:"flex items-center gap-2 min-w-0",children:[e.jsx("div",{className:"w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0",children:e.jsxs("svg",{width:"16",height:"16",viewBox:"0 0 24 24",fill:"none",children:[e.jsx("path",{d:"M2 12C2 7.28595 2 4.92893 3.46447 3.46447C4.92893 2 7.28595 2 12 2C16.714 2 19.0711 2 20.5355 3.46447C22 4.92893 22 7.28595 22 12C22 16.714 22 19.0711 20.5355 20.5355C19.0711 22 16.714 22 12 22C7.28595 22 4.92893 22 3.46447 20.5355C2 19.0711 2 16.714 2 12Z",stroke:"#4361ee",strokeWidth:"1.5"}),e.jsx("path",{d:"M8 12H16M12 8V16",stroke:"#4361ee",strokeWidth:"1.5",strokeLinecap:"round"})]})}),e.jsx("h3",{className:"text-base font-semibold text-gray-900 dark:text-white truncate",children:w})]}),e.jsxs("div",{className:"flex items-center gap-1 flex-shrink-0",children:[e.jsx("a",{href:`/account/${i}/record/${s}/${p}`,className:"p-2 rounded-lg text-gray-400 hover:text-primary hover:bg-primary/10 transition-all",title:"Ouvrir la page complète",children:e.jsxs("svg",{width:"16",height:"16",viewBox:"0 0 24 24",fill:"none",children:[e.jsx("path",{d:"M10 4H6C4.89543 4 4 4.89543 4 6V18C4 19.1046 4.89543 20 6 20H18C19.1046 20 20 19.1046 20 18V14",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"}),e.jsx("path",{d:"M14 4H20V10",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round"}),e.jsx("path",{d:"M20 4L11 13",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"})]})}),e.jsx("a",{href:`/account/${i}/record/${s}/${p}/edit`,className:"p-2 rounded-lg text-gray-400 hover:text-info hover:bg-info/10 transition-all",title:"Modifier",children:e.jsx("svg",{width:"16",height:"16",viewBox:"0 0 24 24",fill:"none",children:e.jsx("path",{d:"M16.862 4.487L18.55 2.8C19.33 2.02 20.59 2.02 21.37 2.8C22.15 3.58 22.15 4.84 21.37 5.62L19.681 7.307M16.862 4.487L4.162 17.187C3.882 17.467 3.682 17.818 3.592 18.198L2.732 21.596C2.642 21.966 2.952 22.296 3.322 22.226L6.892 21.556C7.242 21.486 7.572 21.306 7.832 21.046L20.513 8.366",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"})})}),e.jsx("button",{onClick:f,className:"p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all",title:"Fermer",children:e.jsx("svg",{width:"16",height:"16",viewBox:"0 0 24 24",fill:"none",children:e.jsx("path",{d:"M18 6L6 18M6 6L18 18",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round"})})})]})]}),e.jsxs("div",{className:"flex-1 overflow-y-auto",children:[Object.keys(D).length>0&&e.jsx("div",{className:"px-6 py-4 border-b border-gray-100 dark:border-gray-700/50",children:Object.entries(D).map(([h,z])=>e.jsxs("div",{className:"mb-3 last:mb-0",children:[e.jsx("div",{className:"text-[11px] uppercase tracking-wider font-semibold text-gray-400 dark:text-gray-500 mb-1.5",children:h}),e.jsx("div",{className:"flex flex-wrap gap-1.5",children:z.map((V,B)=>e.jsxs("span",{className:"inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium transition-all hover:scale-105",style:{backgroundColor:Be(V.color,.15),color:V.color,border:`1px solid ${Be(V.color,.3)}`},children:[e.jsx("span",{className:"w-2 h-2 rounded-full flex-shrink-0",style:{backgroundColor:V.color}}),V.label]},B))})]},h))}),x&&e.jsxs("div",{className:"px-6 py-4 border-b border-gray-100 dark:border-gray-700/50",children:[e.jsx("div",{className:"text-[11px] uppercase tracking-wider font-semibold text-gray-400 dark:text-gray-500 mb-2",children:"Description"}),e.jsx("p",{className:"text-sm text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-wrap",children:x})]}),e.jsxs("div",{className:"px-6 py-4",children:[e.jsx("div",{className:"text-[11px] uppercase tracking-wider font-semibold text-gray-400 dark:text-gray-500 mb-3",children:"Détails"}),e.jsxs("div",{className:"space-y-0",children:[Q.map(h=>e.jsxs("div",{className:"flex items-start gap-3 py-2.5 border-b border-gray-50 dark:border-gray-800/50 last:border-0",children:[e.jsx("div",{className:"w-32 flex-shrink-0 text-xs font-medium text-gray-500 dark:text-gray-400 pt-0.5 truncate",children:h.name}),e.jsx("div",{className:"flex-1 min-w-0",children:e.jsx(St,{field:h,record:t})})]},h.id)),(t.relations||[]).map((h,z)=>{var V;return e.jsxs("div",{className:"flex items-start gap-3 py-2.5 border-b border-gray-50 dark:border-gray-800/50 last:border-0",children:[e.jsx("div",{className:"w-32 flex-shrink-0 text-xs font-medium text-gray-500 dark:text-gray-400 pt-0.5 truncate",children:h.label||h.key||"Relation"}),e.jsx("div",{className:"flex-1 min-w-0",children:((V=h.records)==null?void 0:V.length)>0?e.jsx("div",{className:"flex flex-wrap gap-1",children:h.records.map((B,U)=>e.jsx("a",{href:`/account/${i}/record/${h.entitySlug||s}/${B._id}`,className:"inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-primary/10 text-primary font-medium hover:bg-primary/20 transition-colors",children:B.referenceTitle||B.title||"Sans titre"},U))}):e.jsx("span",{className:"text-gray-400 dark:text-gray-600 text-sm italic",children:"—"})})]},`rel-${z}`)})]})]})]}),e.jsx("div",{className:"flex-shrink-0 px-6 py-3 border-t border-gray-100 dark:border-gray-700/50 bg-gray-50/50 dark:bg-[#0a0f1e]/50",children:e.jsxs("div",{className:"flex items-center justify-between text-[11px] text-gray-400 dark:text-gray-500",children:[e.jsxs("div",{className:"flex items-center gap-3",children:[k&&e.jsxs("span",{className:"flex items-center gap-1",children:[e.jsxs("svg",{width:"12",height:"12",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"1.5",children:[e.jsx("circle",{cx:"12",cy:"12",r:"10"}),e.jsx("path",{d:"M12 6V12L16 14",strokeLinecap:"round"})]}),"Créé le ",k]}),u&&e.jsxs("span",{className:"flex items-center gap-1",children:[e.jsx("svg",{width:"12",height:"12",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"1.5",children:e.jsx("path",{d:"M4.06 13C4.02 12.67 4 12.34 4 12C4 7.58 7.58 4 12 4C14.5 4 16.73 5.15 18.2 6.94M19.94 11C19.98 11.33 20 11.66 20 12C20 16.42 16.42 20 12 20C9.5 20 7.27 18.85 5.8 17.06",strokeLinecap:"round",strokeLinejoin:"round"})}),"Modifié le ",u]})]}),e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx("a",{href:`/account/${i}/record/${s}/${p}`,className:"px-3 py-1.5 bg-primary/10 text-primary text-xs font-medium rounded-lg hover:bg-primary/20 transition-colors",children:"Voir"}),e.jsx("a",{href:`/account/${i}/record/${s}/${p}/edit`,className:"px-3 py-1.5 bg-primary text-white text-xs font-medium rounded-lg hover:bg-primary/90 transition-colors",children:"Modifier"})]})]})})]})]}),document.body)}function Ie(t,o=.1){const i=/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(t);return i?`rgba(${parseInt(i[1],16)}, ${parseInt(i[2],16)}, ${parseInt(i[3],16)}, ${o})`:`rgba(128,128,128,${o})`}function qe({record:t,accountNumber:o,entitySlug:i,isDragging:s=!1,onQuickView:S}){var Y,Z,O;const L=r.useRef(null),b=r.useRef(!1),M=String(((Y=t._id)==null?void 0:Y.$oid)||t._id),{attributes:f,listeners:p,setNodeRef:w,transform:x,transition:k,isDragging:u}=yt({id:M}),j={transform:wt.Transform.toString(x),transition:k,opacity:s||u?.7:1,touchAction:"manipulation"},D=((Z=t._id)==null?void 0:Z.$oid)||t._id,Q=t.referenceTitle||t.title||t.computedTitle||"Sans titre",K=t.description||"",h=t.dueDate?new Date(t.dueDate).toLocaleDateString("fr-FR",{day:"2-digit",month:"2-digit",year:"2-digit"}):null,z=t.createdAt?new Date(t.createdAt).toLocaleDateString("fr-FR"):null,V=(t.classificationValues||[]).filter(C=>C.optionLabel||C.label).map(C=>({label:C.optionLabel||C.label,color:C.optionColor||C.color||"#6366f1"})),B=t.tags||[],U=C=>{L.current={x:C.clientX,y:C.clientY,time:Date.now()},b.current=!1},l=C=>{if(L.current){const v=Math.abs(C.clientX-L.current.x),$=Math.abs(C.clientY-L.current.y);(v>5||$>5)&&(b.current=!0)}},n=C=>{if(!L.current)return;const v=Date.now()-L.current.time;!b.current&&v<400&&S&&!C.target.closest("a, button")&&setTimeout(()=>S(t),50),L.current=null};return e.jsxs("div",{ref:w,style:j,className:`kanban-card cursor-pointer rounded-lg transition-all group bg-white hover:shadow-md border border-gray-200/80 dark:border-0 dark:bg-dark/40 dark:hover:bg-dark/60 ${s||u?"shadow-lg ring-2 ring-primary/30 cursor-move":"shadow-sm"}`,"data-dnd":"card",onPointerDown:U,onPointerMove:l,onPointerUp:n,...f,...p,children:[e.jsxs("div",{className:"p-3",children:[e.jsx("div",{className:"text-sm font-semibold text-gray-800 dark:text-white-dark leading-5 line-clamp-2 mb-2",children:Q}),K&&e.jsx("p",{className:"text-xs text-gray-500 dark:text-white-dark/70 line-clamp-2 mb-2",children:K}),e.jsx("div",{className:"flex flex-wrap items-center gap-1 mb-2",children:V.length>0?V.slice(0,3).map((C,v)=>e.jsxs("span",{className:"inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded font-medium",style:{backgroundColor:Ie(C.color,.15),color:C.color},children:[e.jsx("span",{className:"w-1.5 h-1.5 rounded-full flex-shrink-0",style:{backgroundColor:C.color}}),C.label]},v)):B.length>0?B.slice(0,2).map((C,v)=>e.jsx("span",{className:"inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary",children:C},v)):e.jsxs("span",{className:"text-[10px] text-gray-400 dark:text-white-dark/50 italic flex items-center gap-1",children:[e.jsx("svg",{width:"10",height:"10",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"1.5",children:e.jsx("path",{d:"M4.172 3.172C3 4.343 3 6.229 3 10v4c0 3.771 0 5.657 1.172 6.828C5.343 22 7.229 22 11 22h2c3.771 0 5.657 0 6.828-1.172C21 19.657 21 17.771 21 14v-1.22c0-1.835 0-2.752-.379-3.55-.378-.798-1.07-1.39-2.455-2.576l-1.5-1.282c-1.97-1.687-2.955-2.531-4.136-2.605-.17-.01-.343-.01-.56 0-1.18.074-2.166.918-4.136 2.605L6.334 6.654"})}),"Sans tag"]})}),e.jsxs("div",{className:"flex items-center gap-3 text-xs text-gray-400 dark:text-white-dark/50",children:[((O=t.attachments)==null?void 0:O.length)>0&&e.jsxs("span",{className:"flex items-center gap-1",children:[e.jsx("svg",{width:"12",height:"12",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",children:e.jsx("path",{d:"M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"})}),t.attachments.length]}),e.jsxs("span",{className:"flex items-center gap-1",children:[e.jsx("svg",{width:"12",height:"12",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",children:e.jsx("path",{d:"M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"})}),"0"]})]})]}),e.jsxs("div",{className:"px-3 py-2 border-t border-gray-100 dark:border-0 flex items-center justify-between",children:[e.jsxs("div",{className:"flex items-center gap-1 text-[11px] text-gray-400 dark:text-white-dark/50",children:[e.jsxs("svg",{width:"12",height:"12",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"1.5",children:[e.jsx("rect",{x:"3",y:"4",width:"18",height:"18",rx:"2"}),e.jsx("path",{d:"M3 10H21"}),e.jsx("path",{d:"M8 2V6"}),e.jsx("path",{d:"M16 2V6"})]}),e.jsx("span",{children:h||z||"—"})]}),e.jsxs("div",{className:"flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity",style:{pointerEvents:"auto"},children:[e.jsx("a",{href:`/account/${o}/record/${i}/${D}/edit`,className:"p-1 hover:text-info rounded hover:bg-gray-100 dark:hover:bg-gray-700",onClick:C=>C.stopPropagation(),onPointerDown:C=>C.stopPropagation(),children:e.jsx("svg",{width:"14",height:"14",viewBox:"0 0 24 24",fill:"none",children:e.jsx("path",{d:"M16.862 4.487L18.55 2.8C19.33 2.02 20.59 2.02 21.37 2.8C22.15 3.58 22.15 4.84 21.37 5.62L19.681 7.307M16.862 4.487L4.162 17.187C3.882 17.467 3.682 17.818 3.592 18.198L2.732 21.596C2.642 21.966 2.952 22.296 3.322 22.226L6.892 21.556C7.242 21.486 7.572 21.306 7.832 21.046L20.513 8.366M16.862 4.487L19.681 7.307",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"})})}),e.jsx("a",{href:`/account/${o}/record/${i}/${D}`,className:"p-1 hover:text-primary rounded hover:bg-gray-100 dark:hover:bg-gray-700",onClick:C=>C.stopPropagation(),onPointerDown:C=>C.stopPropagation(),children:e.jsxs("svg",{width:"14",height:"14",viewBox:"0 0 24 24",fill:"none",children:[e.jsx("path",{opacity:"0.5",d:"M3.27489 15.2957C2.42496 14.1915 2 13.6394 2 12C2 10.3606 2.42496 9.80853 3.27489 8.70433C4.97196 6.49956 7.81811 4 12 4C16.1819 4 19.028 6.49956 20.7251 8.70433C21.575 9.80853 22 10.3606 22 12C22 13.6394 21.575 14.1915 20.7251 15.2957C19.028 17.5004 16.1819 20 12 20C7.81811 20 4.97196 17.5004 3.27489 15.2957Z",stroke:"currentColor",strokeWidth:"1.5"}),e.jsx("path",{d:"M15 12C15 13.6569 13.6569 15 12 15C10.3431 15 9 13.6569 9 12C9 10.3431 10.3431 9 12 9C13.6569 9 15 10.3431 15 12Z",stroke:"currentColor",strokeWidth:"1.5"})]})})]})]})]})}function Mt({column:t,records:o,recordIds:i,accountNumber:s,entitySlug:S,onQuickView:L}){const{setNodeRef:b,isOver:M}=bt({id:String(t.id)}),f=typeof document<"u"&&document.documentElement.classList.contains("dark"),p=Ie(t.color,f?.12:.06),w=Ie(t.color,f?.3:.15);return e.jsxs("div",{ref:b,className:`flex-none rounded-lg overflow-hidden transition-all ${M?"ring-2 ring-primary/50 ring-offset-2":""}`,style:{width:"300px",maxWidth:"320px",backgroundColor:M?Ie(t.color,.15):p,border:`1px solid ${w}`},"data-dnd":"column",children:[e.jsx("div",{style:{height:"4px",backgroundColor:t.color}}),e.jsx("div",{className:"px-3 py-2 flex justify-between items-center",children:e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx("span",{className:"inline-flex items-center gap-1.5 px-2 py-0 rounded text-xs font-semibold uppercase tracking-wide",style:{backgroundColor:t.color,color:"#fff"},children:t.title}),e.jsx("span",{className:"text-xs text-gray-500 font-medium",children:o.length})]})}),e.jsx("div",{className:"px-2 pb-3",children:e.jsx(vt,{items:i,strategy:kt,children:e.jsx("div",{className:`space-y-2 min-h-[80px] rounded-lg transition-all ${M?"bg-primary/5 p-2":""}`,children:o.length===0?e.jsx("div",{className:"text-xs text-gray-300 dark:text-gray-600 text-center py-8 italic",children:"Aucun enregistrement"}):o.map(x=>{var k;return e.jsx(qe,{record:x,accountNumber:s,entitySlug:S,onQuickView:L},((k=x._id)==null?void 0:k.$oid)||x._id)})})})}),e.jsx("div",{className:"px-3 pb-3",children:e.jsxs("button",{type:"button",className:"flex items-center gap-1 text-xs text-gray-400 hover:text-primary transition-colors",children:[e.jsx("svg",{width:"14",height:"14",viewBox:"0 0 24 24",fill:"none",children:e.jsx("path",{d:"M12 6V18M6 12H18",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round"})}),"Ajouter"]})})]})}function _t({records:t,columns:o,accountNumber:i,entitySlug:s,viewId:S,entityData:L}){const b=r.useRef(null),M=r.useRef(null),[f,p]=r.useState(t),[w,x]=r.useState({}),[k,u]=r.useState(null),[j,D]=r.useState(null),Q=r.useCallback(y=>{D(y)},[]);r.useEffect(()=>{p(t)},[t]);const K=r.useRef(!1),h=r.useRef(0),z=r.useRef(0),V=r.useCallback(y=>{if(k||y.button!==0||y.target.closest('a, button, .dropdown, [data-dnd="card"]'))return;const T=b.current;T&&(K.current=!0,h.current=y.pageX-T.offsetLeft,z.current=T.scrollLeft,T.style.cursor="grabbing")},[k]),B=r.useCallback(y=>{if(k){K.current=!1;return}if(!K.current)return;y.preventDefault();const T=b.current;if(!T)return;const I=(y.pageX-T.offsetLeft-h.current)*1.5;T.scrollLeft=z.current-I},[k]),U=r.useCallback(()=>{K.current=!1,b.current&&(b.current.style.cursor="grab")},[]),l=dt(Te(gt,{activationConstraint:{distance:8}}),Te(mt,{activationConstraint:{delay:500,tolerance:10}}),Te(ht,{coordinateGetter:ft})),n=r.useMemo(()=>{if(L){const I=L.statusClassification;if(I&&I.options&&I.options.length>0){const F=I.options.map(A=>({id:String(A._id),title:A.label,color:A.color||"#6366f1",optionId:String(A._id)}));return F.push({id:"__none__",title:"Sans Statut",color:"#9ca3af",optionId:"none"}),{classId:String(I._id),columns:F}}const J=L.classifications||[];for(const F of J)if(F.options&&F.options.length>0){const A=F.options.map(re=>({id:String(re._id),title:re.label,color:re.color||"#6366f1",optionId:String(re._id)}));return A.push({id:"__none__",title:"Non classé",color:"#9ca3af",optionId:"none"}),{classId:String(F._id),columns:A}}}const y={};f.forEach(I=>{(I.classificationValues||[]).forEach(J=>{var ce,he;const F=((ce=J.classificationId)==null?void 0:ce.$oid)||J.classificationId||J.classification_id;if(!F)return;y[F]||(y[F]={count:0,options:{}}),y[F].count++;const A=J.optionLabel||J.label||"Sans label",re=J.optionColor||J.color||"#9ca3af",oe=((he=J.optionId)==null?void 0:he.$oid)||J.optionId||A;y[F].options[A]||(y[F].options[A]={label:A,color:re,optionId:String(oe),count:0}),y[F].options[A].count++})});let T=null,P=0;if(Object.entries(y).forEach(([I,J])=>{J.count>P&&(P=J.count,T=I)}),T&&y[T]){const J=Object.values(y[T].options).map(F=>({id:F.label,title:F.label,color:F.color,optionId:F.optionId}));return J.push({id:"__none__",title:"Sans classification",color:"#9ca3af",optionId:"none"}),{classId:T,columns:J}}return{classId:null,columns:[{id:"__all__",title:"Tous les enregistrements",color:"#4361ee",optionId:null}]}},[f,L]),Y=r.useMemo(()=>{const y={};if(n.columns.forEach(T=>y[T.id]=[]),!n.classId)y.__all__=f;else{const T={};n.columns.forEach(I=>{I.optionId&&I.optionId!=="none"&&(T[String(I.optionId)]=I.id)});const P={};n.columns.forEach(I=>{P[I.title]=I.id}),f.forEach(I=>{var A;const F=(I.classificationValues||[]).find(re=>{var ce;return(((ce=re.classificationId)==null?void 0:ce.$oid)||re.classificationId||re.classification_id)===n.classId});if(F){const re=String(((A=F.optionId)==null?void 0:A.$oid)||F.optionId||""),oe=T[re];if(oe&&y[oe])y[oe].push(I);else{const ce=F.optionLabel||F.label||"Sans label";y[ce]?y[ce].push(I):y.__none__&&y.__none__.push(I)}}else y.__none__&&y.__none__.push(I)})}for(const T of Object.keys(y)){const P=w[T]||[];P.length&&y[T].sort((I,J)=>{var re,oe;const F=P.indexOf(String(((re=I._id)==null?void 0:re.$oid)||I._id)),A=P.indexOf(String(((oe=J._id)==null?void 0:oe.$oid)||J._id));return F===-1&&A===-1?0:F===-1?1:A===-1?-1:F-A})}return y},[n,f,w]),Z=r.useMemo(()=>{const y={};for(const T of n.columns)y[T.id]=(Y[T.id]||[]).map(P=>{var I;return String(((I=P._id)==null?void 0:I.$oid)||P._id)});return y},[n.columns,Y]),O=r.useCallback(y=>{var P;const T=String(y);for(const I of Object.keys(Z))if((P=Z[I])!=null&&P.includes(T))return I;return null},[Z]),C=r.useMemo(()=>k&&f.find(y=>{var T;return String(((T=y._id)==null?void 0:T.$oid)||y._id)===String(k)})||null,[k,f]),v=r.useCallback(y=>{S&&(M.current&&clearTimeout(M.current),M.current=setTimeout(async()=>{try{await fetch(`/account/${i}/api/user/view-preferences`,{method:"POST",headers:{"Content-Type":"application/json"},credentials:"include",body:JSON.stringify({viewId:S,preferences:{kanban:{orderByColumn:y}}})})}catch{}},250))},[i,S]),$=r.useCallback(async(y,T)=>{if(!n.classId)return;const P=n.columns.find(I=>I.id===T);if(P)try{await fetch(`/account/${i}/api/record/update-classification`,{method:"POST",headers:{"Content-Type":"application/json"},credentials:"include",body:JSON.stringify({recordId:y,classificationId:n.classId,optionId:P.optionId==="none"?null:P.optionId})})}catch(I){console.error("[RecordsKanban] Update error:",I)}},[i,n]),_=y=>{u(String(y.active.id))},ie=()=>{u(null)},ne=y=>{const{active:T,over:P}=y;if(u(null),!P)return;const I=String(T.id),J=String(P.id),F=O(I),A=n.columns.some(H=>String(H.id)===J)?J:O(J);if(!F||!A)return;if(F===A){const H=Z[F]||[],G=H.indexOf(I),E=H.indexOf(J);if(G===-1||E===-1||G===E)return;const me=xt(H,G,E),q={...w,[F]:me};x(q),v(q);return}const re=[...Z[F]||[]].filter(H=>H!==I),oe=[...Z[A]||[]],he=n.columns.some(H=>String(H.id)===J)?oe.length:Math.max(0,oe.indexOf(J));oe.splice(he,0,I);const c={...w,[F]:re,[A]:oe};if(x(c),v(c),n.classId){const H=n.columns.find(G=>G.id===A);p(G=>G.map(E=>{var q;if(String(((q=E._id)==null?void 0:q.$oid)||E._id)!==I)return E;const me=(E.classificationValues||[]).filter(ue=>{var d;return(((d=ue.classificationId)==null?void 0:d.$oid)||ue.classificationId||ue.classification_id)!==n.classId});return A!=="__none__"&&H&&me.push({classificationId:n.classId,optionId:H.optionId,optionLabel:H.title,optionColor:H.color}),{...E,classificationValues:me}})),$(I,A)}};return e.jsxs("div",{ref:b,className:"h-full overflow-x-auto overflow-y-auto",style:{cursor:"grab",userSelect:"none",WebkitUserSelect:"none"},onMouseDown:V,onMouseMove:B,onMouseUp:U,onMouseLeave:U,children:[e.jsxs(ct,{sensors:l,collisionDetection:ut,autoScroll:{threshold:{x:.15,y:.15},interval:10,acceleration:5},onDragStart:_,onDragEnd:ne,onDragCancel:ie,children:[e.jsx("div",{style:{display:"flex",flexWrap:"nowrap",alignItems:"flex-start",gap:"1.25rem",padding:"0.5rem",width:"max-content",minHeight:"100%"},children:n.columns.map(y=>{const T=Y[y.id]||[];return y.id==="__none__"&&T.length===0?null:e.jsx(Mt,{column:y,records:T,recordIds:Z[y.id]||[],accountNumber:i,entitySlug:s,onQuickView:Q},y.id)})}),e.jsx(pt,{children:C?e.jsx(qe,{record:C,accountNumber:i,entitySlug:s,isDragging:!0}):null})]}),j&&e.jsx(Lt,{record:j,columns:o,accountNumber:i,entitySlug:s,onClose:()=>D(null)})]})}const Ae=[{bg:"bg-primary-light shadow-primary",text:"text-primary",dot:"#4361ee"},{bg:"bg-info-light shadow-info",text:"text-info",dot:"#2196f3"},{bg:"bg-warning-light shadow-warning",text:"text-warning",dot:"#e2a03f"},{bg:"bg-danger-light shadow-danger",text:"text-danger",dot:"#e7515a"},{bg:"bg-success-light shadow-success",text:"text-success",dot:"#00ab55"},{bg:"bg-secondary-light shadow-secondary",text:"text-secondary",dot:"#805dca"}];function $t(t){return Ae[t%Ae.length]}function It(){return e.jsxs("svg",{width:"24",height:"24",viewBox:"0 0 24 24",fill:"none",className:"h-5 w-5 rotate-90 opacity-70 hover:opacity-100",children:[e.jsx("circle",{cx:"5",cy:"12",r:"2",stroke:"currentColor",strokeWidth:"1.5"}),e.jsx("circle",{opacity:"0.5",cx:"12",cy:"12",r:"2",stroke:"currentColor",strokeWidth:"1.5"}),e.jsx("circle",{cx:"19",cy:"12",r:"2",stroke:"currentColor",strokeWidth:"1.5"})]})}function Wt(){return e.jsxs("svg",{width:"24",height:"24",viewBox:"0 0 24 24",fill:"none",className:"h-4 w-4 ltr:mr-3 rtl:ml-3",children:[e.jsx("path",{d:"M15.2869 3.15178L14.3601 4.07866L5.83882 12.5999C5.26166 13.1771 4.97308 13.4656 4.7249 13.7838C4.43213 14.1592 4.18114 14.5653 3.97634 14.995C3.80273 15.3593 3.67368 15.7465 3.41556 16.5208L2.32181 19.8021L2.05445 20.6042C1.92743 20.9852 2.0266 21.4053 2.31063 21.6894C2.59466 21.9734 3.01478 22.0726 3.39584 21.9456L4.19792 21.6782L7.47918 20.5844C8.25353 20.3263 8.6407 20.1973 9.00498 20.0237C9.43469 19.8189 9.84082 19.5679 10.2162 19.2751C10.5344 19.0269 10.8229 18.7383 11.4001 18.1612L19.9213 9.63993L20.8482 8.71306C22.3839 7.17735 22.3839 4.68748 20.8482 3.15178C19.3125 1.61607 16.8226 1.61607 15.2869 3.15178Z",stroke:"currentColor",strokeWidth:"1.5"}),e.jsx("path",{opacity:"0.5",d:"M14.36 4.07812C14.36 4.07812 14.4759 6.04774 16.2138 7.78564C17.9517 9.52354 19.9213 9.6394 19.9213 9.6394M4.19789 21.6777L2.32178 19.8015",stroke:"currentColor",strokeWidth:"1.5"})]})}function Rt(){return e.jsxs("svg",{width:"24",height:"24",viewBox:"0 0 24 24",fill:"none",className:"h-4.5 w-4.5 ltr:mr-3 rtl:ml-3",children:[e.jsx("path",{opacity:"0.5",d:"M3.27489 15.2957C2.42496 14.1915 2 13.6394 2 12C2 10.3606 2.42496 9.80853 3.27489 8.70433C4.97196 6.49956 7.81811 4 12 4C16.1819 4 19.028 6.49956 20.7251 8.70433C21.575 9.80853 22 10.3606 22 12C22 13.6394 21.575 14.1915 20.7251 15.2957C19.028 17.5004 16.1819 20 12 20C7.81811 20 4.97196 17.5004 3.27489 15.2957Z",stroke:"currentColor",strokeWidth:"1.5"}),e.jsx("path",{d:"M15 12C15 13.6569 13.6569 15 12 15C10.3431 15 9 13.6569 9 12C9 10.3431 10.3431 9 12 9C13.6569 9 15 10.3431 15 12Z",stroke:"currentColor",strokeWidth:"1.5"})]})}function Dt({filled:t}){return e.jsx("svg",{width:"24",height:"24",viewBox:"0 0 24 24",fill:"none",className:`h-4.5 w-4.5 group-hover:fill-warning ${t?"fill-warning":""}`,children:e.jsx("path",{d:"M9.15316 5.40838C10.4198 3.13613 11.0531 2 12 2C12.9469 2 13.5802 3.13612 14.8468 5.40837L15.1745 5.99623C15.5345 6.64193 15.7144 6.96479 15.9951 7.17781C16.2757 7.39083 16.6251 7.4699 17.3241 7.62805L17.9605 7.77203C20.4201 8.32856 21.65 8.60682 21.9426 9.54773C22.2352 10.4886 21.3968 11.4691 19.7199 13.4299L19.2861 13.9372C18.8096 14.4944 18.5713 14.773 18.4641 15.1177C18.357 15.4624 18.393 15.8341 18.465 16.5776L18.5306 17.2544C18.7841 19.8706 18.9109 21.1787 18.1449 21.7602C17.3788 22.3417 16.2273 21.8115 13.9243 20.7512L13.3285 20.4768C12.6741 20.1755 12.3469 20.0248 12 20.0248C11.6531 20.0248 11.3259 20.1755 10.6715 20.4768L10.0757 20.7512C7.77268 21.8115 6.62118 22.3417 5.85515 21.7602C5.08912 21.1787 5.21588 19.8706 5.4694 17.2544L5.53498 16.5776C5.60703 15.8341 5.64305 15.4624 5.53586 15.1177C5.42868 14.773 5.19043 14.4944 4.71392 13.9372L4.2801 13.4299C2.60325 11.4691 1.76482 10.4886 2.05742 9.54773C2.35002 8.60682 3.57986 8.32856 6.03954 7.77203L6.67589 7.62805C7.37485 7.4699 7.72433 7.39083 8.00494 7.17781C8.28555 6.96479 8.46553 6.64194 8.82547 5.99623L9.15316 5.40838Z",stroke:"currentColor",strokeWidth:"1.5"})})}function Et(){return e.jsx("svg",{width:"24",height:"24",viewBox:"0 0 24 24",fill:"none",className:"h-3 w-3 rotate-45",children:e.jsx("path",{d:"M2 12C2 7.28595 2 4.92893 3.46447 3.46447C4.92893 2 7.28595 2 12 2C16.714 2 19.0711 2 20.5355 3.46447C22 4.92893 22 7.28595 22 12C22 16.714 22 19.0711 20.5355 20.5355C19.0711 22 16.714 22 12 22C7.28595 22 4.92893 22 3.46447 20.5355C2 19.0711 2 16.714 2 12Z",stroke:"currentColor",strokeWidth:"1.5"})})}function Tt({record:t,accountNumber:o,entitySlug:i}){var M;const[s,S]=r.useState(!1),L=r.useRef(null);r.useEffect(()=>{if(!s)return;const f=p=>{L.current&&!L.current.contains(p.target)&&S(!1)};return document.addEventListener("mousedown",f),()=>document.removeEventListener("mousedown",f)},[s]);const b=((M=t._id)==null?void 0:M.$oid)||t._id;return e.jsxs("div",{ref:L,className:"dropdown relative",children:[e.jsx("button",{type:"button",className:"text-primary",onClick:f=>{f.preventDefault(),f.stopPropagation(),S(!s)},children:e.jsx(It,{})}),s&&e.jsxs("ul",{className:"absolute z-50 min-w-[140px] rounded-md bg-white dark:bg-[#1b2e4b] shadow-lg border dark:border-gray-700 py-1 text-sm font-medium ltr:right-0 rtl:left-0 top-full mt-1",style:{animation:"fadeIn 0.15s ease-out"},children:[e.jsx("li",{children:e.jsxs("a",{href:`/account/${o}/record/${i}/${b}/edit`,className:"flex items-center px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 w-full",onClick:f=>f.stopPropagation(),children:[e.jsx(Wt,{})," Edit"]})}),e.jsx("li",{children:e.jsxs("a",{href:`/account/${o}/record/${i}/${b}`,className:"flex items-center px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 w-full",onClick:f=>f.stopPropagation(),children:[e.jsx(Rt,{})," View"]})})]})]})}function Ft({record:t,accountNumber:o,entitySlug:i,style:s,favorites:S,onToggleFav:L}){var k,u;const b=S[t._id]||!1,M=((k=t._id)==null?void 0:k.$oid)||t._id,f=t.referenceTitle||t.title||t.computedTitle||"Sans titre",p=t.createdAt?new Date(t.createdAt).toLocaleDateString("fr-FR",{day:"2-digit",month:"short",year:"numeric"}):"",w=(t.customFields||[]).find(j=>{var D,Q,K,h,z,V;return((Q=(D=j.field_id)==null?void 0:D.label)==null?void 0:Q.toLowerCase().includes("descri"))||((h=(K=j.field_id)==null?void 0:K.label)==null?void 0:h.toLowerCase().includes("note"))||((V=(z=j.field_id)==null?void 0:z.label)==null?void 0:V.toLowerCase().includes("contenu"))}),x=(w==null?void 0:w.value)||t.description||"";return(t.classificationValues||[]).filter(j=>j.optionLabel).map(j=>({label:j.optionLabel,color:j.optionColor||j.color||s.dot})),e.jsxs("div",{className:`panel pb-12 relative ${s.bg}`,children:[e.jsxs("div",{className:"min-h-[142px]",children:[e.jsxs("div",{className:"flex justify-between",children:[e.jsxs("div",{className:"flex w-max items-center",children:[e.jsx("div",{className:"flex-none",children:e.jsx("div",{className:"rounded-full bg-gray-300 p-2 dark:bg-gray-700",children:e.jsxs("svg",{width:"24",height:"24",viewBox:"0 0 24 24",fill:"none",className:"h-4.5 w-4.5",children:[e.jsx("circle",{cx:"12",cy:"6",r:"4",stroke:"currentColor",strokeWidth:"1.5"}),e.jsx("ellipse",{opacity:"0.5",cx:"12",cy:"17",rx:"7",ry:"4",stroke:"currentColor",strokeWidth:"1.5"})]})})}),e.jsxs("div",{className:"ltr:ml-2 rtl:mr-2",children:[e.jsx("div",{className:"font-semibold",children:((u=t.createdBy)==null?void 0:u.name)||"Utilisateur"}),e.jsx("div",{className:"text-sx text-white-dark",children:p})]})]}),e.jsx(Tt,{record:t,accountNumber:o,entitySlug:i})]}),e.jsxs("div",{children:[e.jsx("h4",{className:"mt-4 font-semibold",children:e.jsx("a",{href:`/account/${o}/record/${i}/${M}`,className:"hover:text-primary transition-colors",children:f})}),x&&e.jsx("p",{className:"mt-2 text-white-dark line-clamp-3",children:x})]})]}),e.jsx("div",{className:"absolute bottom-5 left-0 w-full px-5",children:e.jsxs("div",{className:"mt-2 flex items-center justify-between",children:[e.jsx("div",{className:s.text,children:e.jsx(Et,{})}),e.jsx("div",{className:"flex items-center gap-2",children:e.jsx("button",{type:"button",className:"group text-warning ltr:ml-2 rtl:mr-2",onClick:j=>{j.preventDefault(),j.stopPropagation(),L(t._id)},children:e.jsx(Dt,{filled:b})})})]})})]})}function Ot({records:t,accountNumber:o,entitySlug:i}){const[s,S]=r.useState({}),L=r.useCallback(b=>{S(M=>({...M,[b]:!M[b]}))},[]);return e.jsx("div",{className:"h-full overflow-y-auto",children:e.jsx("div",{className:"grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",children:t.length===0?e.jsx("div",{className:"col-span-full text-center py-20 text-gray-400 dark:text-gray-600 italic",children:"Aucun enregistrement"}):t.map((b,M)=>{var f;return e.jsx(Ft,{record:b,accountNumber:o,entitySlug:i,style:$t(M),favorites:s,onToggleFav:L},((f=b._id)==null?void 0:f.$oid)||b._id)})})})}const Pe={Planifié:"primary",Confirmé:"info",Terminé:"success",Annulé:"danger","Non présenté":"warning"},$e=["primary","info","success","danger","warning"];function Vt(t,o){if(o){const i=(t.customFields||[]).find(s=>{var L,b,M;return(((b=(L=s.field_id)==null?void 0:L._id)==null?void 0:b.toString())||((M=s.field_id)==null?void 0:M.toString()))===o});if(i!=null&&i.value){const s=new Date(i.value);if(!isNaN(s))return s}}if(t.date){const i=new Date(t.date);if(!isNaN(i))return i}if(t.createdAt){const i=new Date(t.createdAt);if(!isNaN(i))return i}return null}function zt(t,o){if(!o)return 30;const i=(t.customFields||[]).find(s=>{var L,b,M;return(((b=(L=s.field_id)==null?void 0:L._id)==null?void 0:b.toString())||((M=s.field_id)==null?void 0:M.toString()))===o});return parseInt(i==null?void 0:i.value)||30}function Bt(t){const o=t.classificationValues||[];for(const i of o)if(i.label||i.optionLabel)return i.label||i.optionLabel;return null}function At({records:t=[],columns:o=[],accountNumber:i,entitySlug:s,entityData:S}){const L=r.useRef(null),b=r.useRef(null),[M,f]=r.useState(!1),{dateFieldId:p,durationFieldId:w}=r.useMemo(()=>{var h,z,V,B,U;if(!S)return{dateFieldId:null,durationFieldId:null};const k=S.customFields||[],u=k.filter(l=>l.type==="date"||l.inputType==="date"||l.inputType==="datetime-local"),j=u.find(l=>/^date/i.test(l.name||"")||/date/i.test(l.label||"")),D=((h=j==null?void 0:j._id)==null?void 0:h.toString())||((V=(z=u[0])==null?void 0:z._id)==null?void 0:V.toString())||null,K=((U=(B=k.filter(l=>l.type==="number"&&(/dur/i.test(l.name||"")||/dur/i.test(l.label||"")))[0])==null?void 0:B._id)==null?void 0:U.toString())||null;return{dateFieldId:D,durationFieldId:K}},[S]),x=r.useMemo(()=>t.map((k,u)=>{const j=Vt(k,p);if(!j)return null;const D=zt(k,w),Q=new Date(j.getTime()+D*6e4),K=k.referenceTitle||k.computedTitle||k.title||"Sans titre",h=Bt(k),z=h&&Pe[h]||$e[u%$e.length];return{id:k._id,title:K,start:j.toISOString(),end:Q.toISOString(),className:z,description:h||"",extendedProps:{recordId:k._id,status:h,entitySlug:s,accountNumber:i}}}).filter(Boolean),[t,p,w,s,i]);return r.useEffect(()=>{if(typeof FullCalendar<"u"){f(!0);return}const k=setInterval(()=>{typeof FullCalendar<"u"&&(f(!0),clearInterval(k))},200);if(!document.querySelector('script[src*="fullcalendar"]')){const u=document.createElement("link");u.rel="stylesheet",u.href="/assets/css/fullcalendar.min.css",document.head.appendChild(u);const j=document.createElement("script");j.src="/assets/js/fullcalendar.min.js",j.onload=()=>f(!0),document.head.appendChild(j)}return()=>clearInterval(k)},[]),r.useEffect(()=>{if(!M||!L.current||typeof FullCalendar>"u")return;b.current&&b.current.destroy();const k=new FullCalendar.Calendar(L.current,{initialView:"dayGridMonth",headerToolbar:{left:"prev,next today",center:"title",right:"dayGridMonth,timeGridWeek,timeGridDay"},locale:"fr",buttonText:{today:"Aujourd'hui",month:"Mois",week:"Semaine",day:"Jour"},editable:!1,dayMaxEvents:3,selectable:!1,height:"auto",events:x,eventClick:u=>{var D;const j=((D=u.event.extendedProps)==null?void 0:D.recordId)||u.event.id;j&&(window.location.href=`/account/${i}/record/${s}/edit/${j}`)},eventDidMount:u=>{var j;u.event.title&&(u.el.title=u.event.title,(j=u.event.extendedProps)!=null&&j.status&&(u.el.title+=` — ${u.event.extendedProps.status}`))}});return k.render(),b.current=k,()=>{b.current&&(b.current.destroy(),b.current=null)}},[M,x,i,s]),M?!p&&t.length>0?e.jsxs("div",{style:{display:"flex",alignItems:"center",justifyContent:"center",padding:"48px 0",flexDirection:"column"},children:[e.jsxs("svg",{viewBox:"0 0 24 24",fill:"none",style:{width:48,height:48,marginBottom:12,color:"#ccc"},children:[e.jsx("rect",{x:"3",y:"4",width:"18",height:"18",rx:"2",stroke:"currentColor",strokeWidth:"1.5"}),e.jsx("path",{d:"M16 2V6M8 2V6M3 10H21",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"})]}),e.jsx("p",{style:{fontSize:14,fontWeight:500,color:"#888"},children:"Aucun champ de type date n'a été trouvé"}),e.jsx("p",{style:{fontSize:12,color:"#aaa",marginTop:4},children:"Ajoutez un champ date à cette entité pour utiliser la vue calendrier"})]}):e.jsxs("div",{className:"panel",style:{padding:"16px"},children:[e.jsx("div",{style:{marginBottom:16,display:"flex",flexWrap:"wrap",gap:16,alignItems:"center",justifyContent:"space-between"},children:e.jsx("div",{style:{display:"flex",flexWrap:"wrap",gap:12},children:Object.entries(Pe).map(([k,u])=>e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:6,fontSize:12},children:[e.jsx("div",{className:`bg-${u}`,style:{width:10,height:10,borderRadius:2}}),e.jsx("span",{className:"text-gray-600 dark:text-gray-400",children:k})]},k))})}),e.jsx("div",{className:"calendar-wrapper",ref:L})]}):e.jsxs("div",{style:{display:"flex",alignItems:"center",justifyContent:"center",padding:"48px 0"},children:[e.jsx("div",{className:"animate-spin rounded-full h-8 w-8 border-b-2 border-primary"}),e.jsx("span",{style:{marginLeft:12,color:"#888"},children:"Chargement du calendrier..."})]})}const Xe={contains:{label:"Contient",icon:"⊃",types:["text","email","phone","url","textarea","title","relation"]},not_contains:{label:"Ne contient pas",icon:"⊅",types:["text","email","phone","url","textarea","title","relation"]},equals:{label:"Est égal à",icon:"=",types:["text","email","phone","url","number","date","title","select","relation","classification"]},not_equals:{label:"N'est pas égal à",icon:"≠",types:["text","email","phone","url","number","date","title","select","relation","classification"]},starts_with:{label:"Commence par",icon:"A…",types:["text","email","phone","url","title"]},ends_with:{label:"Se termine par",icon:"…Z",types:["text","email","phone","url","title"]},gt:{label:"Supérieur à",icon:">",types:["number","date"]},gte:{label:"Supérieur ou égal",icon:"≥",types:["number","date"]},lt:{label:"Inférieur à",icon:"<",types:["number","date"]},lte:{label:"Inférieur ou égal",icon:"≤",types:["number","date"]},between:{label:"Entre",icon:"↔",types:["number","date"]},is_empty:{label:"Est vide",icon:"∅",types:["text","email","phone","url","number","date","textarea","title","select","relation","classification"]},is_not_empty:{label:"N'est pas vide",icon:"∃",types:["text","email","phone","url","number","date","textarea","title","select","relation","classification"]}};function Fe(t){const o=t||"text";return Object.entries(Xe).filter(([i,s])=>s.types.includes(o)).map(([i,s])=>({key:i,...s}))}function He(t){return["number","currency","percent"].includes(t)?"number":["date","datetime"].includes(t)?"date":"text"}function Pt({columns:t=[],fieldFilters:o=[],onFieldFiltersChange:i,allRecords:s=[],sidebarFilters:S=[]}){const[L,b]=r.useState(o.length>0),[M,f]=r.useState(null),[p,w]=r.useState(!1),x=r.useRef(null);r.useEffect(()=>{const l=n=>{p&&x.current&&!x.current.contains(n.target)&&w(!1)};return p&&document.addEventListener("mousedown",l),()=>document.removeEventListener("mousedown",l)},[p]);const k=We.useMemo(()=>{const l={};return S.forEach(n=>{l[`classif:${n.id}`]=n.options||[]}),l},[S]),u=t.filter(l=>l.id!=="actions"),j=r.useCallback(l=>{const n=u.find(v=>v.id===l);if(!n)return;const Y=l.startsWith("classif:"),Z=Fe(n.type),O=Y?Z.find(v=>v.key==="equals")||Z[0]:Z.find(v=>v.key==="contains")||Z[0],C={fieldId:l,fieldName:n.name,fieldType:n.type||"text",operator:O.key,value:"",value2:"",logic:"AND"};i([...o,C]),w(!1),f(o.length)},[u,o,i]),D=r.useCallback((l,n)=>{const Y=o.map((Z,O)=>O===l?{...Z,...n}:Z);i(Y)},[o,i]),Q=r.useCallback(l=>{const n=o.filter((Y,Z)=>Z!==l);i(n),M===l&&f(null)},[o,i,M]),K=r.useCallback(()=>{i([]),f(null)},[i]),h=l=>["is_empty","is_not_empty"].includes(l),z=l=>l==="between",V=l=>l&&l.startsWith("classif:"),B=l=>k[l]||[],U=(l,n)=>{const Z=B(l).find(O=>O.id===n||O.label===n);return Z?Z.label:n};return e.jsxs("div",{className:"adv-filters-container",children:[e.jsxs("button",{type:"button",className:"adv-filters-header",onClick:()=>b(!L),children:[e.jsxs("div",{className:"adv-filters-header-left",children:[e.jsx("svg",{viewBox:"0 0 24 24",fill:"none",className:"adv-filters-header-icon",children:e.jsx("path",{d:"M22 3H2L10 12.46V19L14 21V12.46L22 3Z",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round"})}),e.jsx("span",{children:"Filtres avancés"}),o.length>0&&e.jsx("span",{className:"adv-filters-count",children:o.length})]}),e.jsx("svg",{viewBox:"0 0 24 24",fill:"none",className:`adv-filters-chevron ${L?"adv-filters-chevron--open":""}`,children:e.jsx("path",{d:"M9 18L15 12L9 6",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round"})})]}),L&&e.jsxs("div",{className:"adv-filters-body",children:[o.map((l,n)=>{var $;u.find(_=>_.id===l.fieldId);const Y=Fe(l.fieldType),Z=M===n,O=V(l.fieldId),C=O?B(l.fieldId):[],v=l.logic||"AND";return e.jsxs(We.Fragment,{children:[n>0&&e.jsxs("div",{className:"adv-filter-connector",children:[e.jsx("span",{className:"adv-filter-connector-line"}),e.jsx("button",{type:"button",className:`adv-filter-connector-badge ${v==="OR"?"adv-filter-connector-badge--or":""}`,onClick:()=>{D(n,{logic:v==="AND"?"OR":"AND"})},title:"Cliquez pour basculer entre ET/OU",children:v==="OR"?"OU":"ET"}),e.jsx("span",{className:"adv-filter-connector-line"})]}),e.jsx("div",{className:`adv-filter-pill ${Z?"adv-filter-pill--editing":""}`,children:Z?e.jsxs("div",{className:"adv-filter-edit",children:[e.jsxs("div",{className:"adv-filter-row",children:[e.jsx("label",{className:"adv-filter-label",children:"Champ"}),e.jsx("select",{value:l.fieldId,onChange:_=>{const ie=u.find(ne=>ne.id===_.target.value);if(ie){const ne=Fe(ie.type),T=_.target.value.startsWith("classif:")?ne.find(P=>P.key==="equals")||ne[0]:ne.find(P=>P.key===l.operator)||ne[0];D(n,{fieldId:ie.id,fieldName:ie.name,fieldType:ie.type||"text",operator:T.key,value:"",value2:""})}},className:"adv-filter-select",children:u.map(_=>e.jsx("option",{value:_.id,children:_.name},_.id))})]}),e.jsxs("div",{className:"adv-filter-row",children:[e.jsx("label",{className:"adv-filter-label",children:"Condition"}),e.jsx("select",{value:l.operator,onChange:_=>D(n,{operator:_.target.value,value:h(_.target.value)?"":l.value,value2:""}),className:"adv-filter-select",children:Y.map(_=>e.jsx("option",{value:_.key,children:_.label},_.key))})]}),!h(l.operator)&&e.jsxs("div",{className:"adv-filter-row",children:[e.jsx("label",{className:"adv-filter-label",children:z(l.operator)?"Valeur min":"Valeur"}),O&&C.length>0?e.jsxs("select",{value:l.value,onChange:_=>D(n,{value:_.target.value}),className:"adv-filter-select",children:[e.jsx("option",{value:"",children:"Sélectionnez..."}),C.map(_=>e.jsx("option",{value:_.label,children:_.label},_.id))]}):e.jsx("input",{type:He(l.fieldType),value:l.value,onChange:_=>D(n,{value:_.target.value}),placeholder:"Saisir une valeur...",className:"adv-filter-input",autoFocus:!0})]}),z(l.operator)&&e.jsxs("div",{className:"adv-filter-row",children:[e.jsx("label",{className:"adv-filter-label",children:"Valeur max"}),e.jsx("input",{type:He(l.fieldType),value:l.value2||"",onChange:_=>D(n,{value2:_.target.value}),placeholder:"Saisir une valeur max...",className:"adv-filter-input"})]}),e.jsxs("div",{className:"adv-filter-row adv-filter-row--actions",children:[e.jsxs("button",{type:"button",className:"adv-filter-btn-done",onClick:()=>f(null),children:[e.jsx("svg",{viewBox:"0 0 24 24",fill:"none",className:"h-3.5 w-3.5",children:e.jsx("path",{d:"M5 13L9 17L19 7",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round"})}),"OK"]}),e.jsx("button",{type:"button",className:"adv-filter-btn-delete",onClick:()=>Q(n),children:e.jsxs("svg",{viewBox:"0 0 24 24",fill:"none",className:"h-3.5 w-3.5",children:[e.jsx("path",{d:"M20.5001 6H3.5",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"}),e.jsx("path",{d:"M18.8334 8.5L18.3735 15.3991C18.1965 18.054 18.108 19.3815 17.243 20.1907C16.378 21 15.0476 21 12.3868 21H11.6134C8.9526 21 7.6222 21 6.75719 20.1907C5.89218 19.3815 5.80368 18.054 5.62669 15.3991L5.16675 8.5",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"})]})})]})]}):e.jsxs("button",{type:"button",className:"adv-filter-pill-summary",onClick:()=>f(n),children:[e.jsx("span",{className:"adv-filter-pill-field",children:l.fieldName}),e.jsx("span",{className:"adv-filter-pill-op",children:(($=Xe[l.operator])==null?void 0:$.label)||l.operator}),!h(l.operator)&&e.jsx("span",{className:"adv-filter-pill-value",children:z(l.operator)?`${l.value||"?"} – ${l.value2||"?"}`:O?U(l.fieldId,l.value):l.value||"..."}),e.jsx("button",{type:"button",className:"adv-filter-pill-remove",onClick:_=>{_.stopPropagation(),Q(n)},children:e.jsx("svg",{viewBox:"0 0 24 24",fill:"none",className:"h-3 w-3",children:e.jsx("path",{d:"M18 6L6 18M6 6L18 18",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round"})})})]})})]},n)}),e.jsxs("div",{className:"adv-filter-add-row",ref:x,children:[e.jsxs("button",{type:"button",className:"adv-filter-add-btn",onClick:()=>w(!p),children:[e.jsx("svg",{viewBox:"0 0 24 24",fill:"none",className:"h-3.5 w-3.5",children:e.jsx("path",{d:"M12 5V19M5 12H19",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round"})}),"Ajouter un filtre"]}),p&&e.jsxs("div",{className:"adv-filter-field-dropdown",children:[e.jsx("div",{className:"adv-filter-field-dropdown-title",children:"Choisir un champ"}),u.map(l=>e.jsxs("button",{type:"button",className:"adv-filter-field-option",onClick:()=>j(l.id),children:[e.jsx("span",{className:"adv-filter-field-type-badge",children:Ht(l.type)}),l.name]},l.id))]})]}),o.length>0&&e.jsx("button",{type:"button",className:"adv-filter-clear",onClick:K,children:"Effacer tous les filtres"})]}),e.jsx("style",{children:`
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
            `})]})}function Ht(t){return{text:"Aa",title:"T",email:"@",phone:"☎",url:"🔗",number:"#",currency:"$",percent:"%",date:"📅",datetime:"🕐",textarea:"¶",select:"☰",relation:"↗",classification:"●"}[t]||"Aa"}const Ze=229,Je=500,Ue=280;function Zt({entityName:t,entityNamePlural:o,entityIcon:i,accountNumber:s,entitySlug:S,showSidebar:L,onToggleSidebar:b,filters:M=[],activeFilters:f={},onFilterChange:p,columns:w=[],fieldFilters:x=[],onFieldFiltersChange:k,allRecords:u=[],sidebarWidth:j,onSidebarWidthChange:D}){const[Q,K]=r.useState(!1),h=r.useRef(null),[z,V]=r.useState(j||Ue),B=r.useRef(!1),U=r.useRef(0),l=r.useRef(0),n=r.useRef(j||Ue),Y=r.useRef(D);r.useEffect(()=>{Y.current=D},[D]),r.useEffect(()=>{n.current=z},[z]),r.useEffect(()=>{j&&!B.current&&V(j)},[j]);const Z=r.useCallback(v=>{v.preventDefault(),B.current=!0,U.current=v.clientX,l.current=n.current,document.body.style.cursor="col-resize",document.body.style.userSelect="none"},[]);if(r.useEffect(()=>{const v=_=>{if(!B.current)return;const ie=_.clientX-U.current,ne=Math.min(Je,Math.max(Ze,l.current+ie));V(ne)},$=()=>{B.current&&(B.current=!1,document.body.style.cursor="",document.body.style.userSelect="",Y.current&&Y.current(n.current))};return document.addEventListener("mousemove",v),document.addEventListener("mouseup",$),()=>{document.removeEventListener("mousemove",v),document.removeEventListener("mouseup",$)}},[]),r.useEffect(()=>{const v=$=>{Q&&h.current&&!h.current.contains($.target)&&K(!1)};return Q&&document.addEventListener("mousedown",v),()=>document.removeEventListener("mousedown",v)},[Q]),!L)return null;const O=(v,$)=>{const _={...f},ie=_[v]||[];if($==="__all__")delete _[v];else{const ne=ie.indexOf($);ne>-1?(ie.splice(ne,1),ie.length===0?delete _[v]:_[v]=[...ie]):_[v]=[...ie,$]}p(_)},C=Object.keys(f).length>0;return e.jsxs("div",{style:{position:"relative",width:z,minWidth:Ze,maxWidth:Je,flexShrink:0},children:[e.jsxs("div",{className:"panel z-10 space-y-4 overflow-y-auto p-4 h-full",style:{display:"flex",flexDirection:"column",width:"100%"},children:[e.jsxs("div",{className:"flex items-center justify-between",children:[e.jsx("div",{className:"flex items-center",children:e.jsxs("div",{className:"flex items-center text-center",children:[e.jsx("div",{children:i?e.jsx("iconify-icon",{icon:i,width:"22",style:{color:"var(--primary)"}}):e.jsxs("svg",{width:"24",height:"24",viewBox:"0 0 24 24",fill:"none",xmlns:"http://www.w3.org/2000/svg",className:"h-5 w-5",children:[e.jsx("path",{d:"M20.3116 12.6473L20.8293 10.7154C21.4335 8.46034 21.7356 7.3328 21.5081 6.35703C21.3285 5.58657 20.9244 4.88668 20.347 4.34587C19.6157 3.66095 18.4881 3.35883 16.2331 2.75458C13.978 2.15033 12.8504 1.84821 11.8747 2.07573C11.1042 2.25537 10.4043 2.65945 9.86351 3.23687C9.27709 3.86298 8.97128 4.77957 8.51621 6.44561C8.43979 6.7254 8.35915 7.02633 8.27227 7.35057L8.27222 7.35077L7.75458 9.28263C7.15033 11.5377 6.84821 12.6652 7.07573 13.641C7.25537 14.4115 7.65945 15.1114 8.23687 15.6522C8.96815 16.3371 10.0957 16.6392 12.3508 17.2435L12.3508 17.2435C14.3834 17.7881 15.4999 18.0873 16.415 17.9744C16.5152 17.9621 16.6129 17.9448 16.7092 17.9223C17.4796 17.7427 18.1795 17.3386 18.7203 16.7612C19.4052 16.0299 19.7074 14.9024 20.3116 12.6473Z",stroke:"currentColor",strokeWidth:"1.5"}),e.jsx("path",{opacity:"0.5",d:"M16.415 17.9741C16.2065 18.6126 15.8399 19.1902 15.347 19.6519C14.6157 20.3368 13.4881 20.6389 11.2331 21.2432C8.97798 21.8474 7.85044 22.1495 6.87466 21.922C6.10421 21.7424 5.40432 21.3383 4.86351 20.7609C4.17859 20.0296 3.87647 18.9021 3.27222 16.647L2.75458 14.7151C2.15033 12.46 1.84821 11.3325 2.07573 10.3567C2.25537 9.58627 2.65945 8.88638 3.23687 8.34557C3.96815 7.66065 5.09569 7.35853 7.35077 6.75428C7.77741 6.63996 8.16368 6.53646 8.51621 6.44531",stroke:"currentColor",strokeWidth:"1.5"}),e.jsx("path",{d:"M11.7769 10L16.6065 11.2941",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"}),e.jsx("path",{opacity:"0.5",d:"M11 12.8975L13.8978 13.6739",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"})]})}),e.jsx("h3",{className:"text-lg font-semibold ltr:ml-3 rtl:mr-3",children:t})]})}),e.jsxs("div",{className:"dropdown relative",ref:h,children:[e.jsx("button",{type:"button",className:"flex h-8 w-8 items-center justify-center rounded-full bg-[#f4f4f4] hover:bg-primary-light dark:bg-[#1b2e4b]",onClick:()=>K(!Q),children:e.jsxs("svg",{width:"24",height:"24",viewBox:"0 0 24 24",fill:"none",xmlns:"http://www.w3.org/2000/svg",className:"h-5 w-5 opacity-70",children:[e.jsx("circle",{cx:"5",cy:"12",r:"2",stroke:"currentColor",strokeWidth:"1.5"}),e.jsx("circle",{opacity:"0.5",cx:"12",cy:"12",r:"2",stroke:"currentColor",strokeWidth:"1.5"}),e.jsx("circle",{cx:"19",cy:"12",r:"2",stroke:"currentColor",strokeWidth:"1.5"})]})}),Q&&e.jsxs("ul",{className:"whitespace-nowrap absolute right-0 top-full mt-1 z-50 min-w-[160px] rounded-md border border-gray-200 bg-white py-1 shadow-lg dark:border-[#1b2e4b] dark:bg-[#0e1726]",children:[e.jsx("li",{children:e.jsxs("a",{href:"javascript:;",onClick:()=>K(!1),className:"flex items-center px-4 py-2 text-sm hover:bg-gray-100 hover:text-primary dark:hover:bg-[#181F32] dark:hover:text-primary",children:[e.jsx("iconify-icon",{icon:"solar:settings-bold-duotone",className:"h-4.5 w-4.5 shrink-0 ltr:mr-1 rtl:ml-1",width:"18",style:{marginRight:"6px"}}),"Paramètres"]})}),e.jsx("li",{children:e.jsxs("a",{href:"javascript:;",onClick:()=>K(!1),className:"flex items-center px-4 py-2 text-sm hover:bg-gray-100 hover:text-primary dark:hover:bg-[#181F32] dark:hover:text-primary",children:[e.jsx("iconify-icon",{icon:"solar:question-circle-bold-duotone",className:"h-4.5 w-4.5 shrink-0 ltr:mr-1 rtl:ml-1",width:"18",style:{marginRight:"6px"}}),"Aide"]})})]})]})]}),e.jsx("div",{className:"h-px w-full border-b border-[#e0e6ed] dark:border-[#1b2e4b]"}),e.jsx("div",{className:"!mt-0",style:{flex:1,display:"flex",flexDirection:"column"},children:e.jsxs("div",{className:"flex h-full flex-col pb-16",style:{position:"relative"},children:[e.jsx("div",{className:"relative -mr-3.5 h-full grow pr-3.5 overflow-auto",children:e.jsxs("div",{className:"space-y-1",children:[e.jsx("button",{type:"button",className:`flex h-10 w-full items-center justify-between rounded-md p-2 font-medium hover:bg-white-dark/10 hover:text-primary dark:hover:bg-[#181F32] dark:hover:text-primary ${C?"":"bg-gray-100 dark:text-primary text-primary dark:bg-[#181F32]"}`,onClick:()=>p({}),children:e.jsxs("div",{className:"flex items-center",children:[e.jsx("iconify-icon",{icon:"solar:checklist-minimalistic-bold-duotone",width:"20"}),e.jsxs("div",{className:"ltr:ml-3 rtl:mr-3",children:["Toutes les ",o||t+"s"]})]})}),e.jsx("button",{type:"button",className:`flex h-10 w-full items-center justify-between rounded-md p-2 font-medium hover:bg-white-dark/10 hover:text-primary dark:hover:bg-[#181F32] dark:hover:text-primary ${f.__favourites?"bg-gray-100 dark:text-primary text-primary dark:bg-[#181F32]":""}`,onClick:()=>{const v={...f};v.__favourites?delete v.__favourites:v.__favourites=!0,p(v)},children:e.jsxs("div",{className:"flex items-center",children:[e.jsx("svg",{width:"24",height:"24",viewBox:"0 0 24 24",fill:"none",xmlns:"http://www.w3.org/2000/svg",className:"h-5 w-5",children:e.jsx("path",{d:"M9.15316 5.40838C10.4198 3.13613 11.0531 2 12 2C12.9469 2 13.5802 3.13612 14.8468 5.40837L15.1745 5.99623C15.5345 6.64193 15.7144 6.96479 15.9951 7.17781C16.2757 7.39083 16.6251 7.4699 17.3241 7.62805L17.9605 7.77203C20.4201 8.32856 21.65 8.60682 21.9426 9.54773C22.2352 10.4886 21.3968 11.4691 19.7199 13.4299L19.2861 13.9372C18.8096 14.4944 18.5713 14.773 18.4641 15.1177C18.357 15.4624 18.393 15.8341 18.465 16.5776L18.5306 17.2544C18.7841 19.8706 18.9109 21.1787 18.1449 21.7602C17.3788 22.3417 16.2273 21.8115 13.9243 20.7512L13.3285 20.4768C12.6741 20.1755 12.3469 20.0248 12 20.0248C11.6531 20.0248 11.3259 20.1755 10.6715 20.4768L10.0757 20.7512C7.77268 21.8115 6.62118 22.3417 5.85515 21.7602C5.08912 21.1787 5.21588 19.8706 5.4694 17.2544L5.53498 16.5776C5.60703 15.8341 5.64305 15.4624 5.53586 15.1177C5.42868 14.773 5.19043 14.4944 4.71392 13.9372L4.2801 13.4299C2.60325 11.4691 1.76482 10.4886 2.05742 9.54773C2.35002 8.60682 3.57986 8.32856 6.03954 7.77203L6.67589 7.62805C7.37485 7.4699 7.72433 7.39083 8.00494 7.17781C8.28555 6.96479 8.46553 6.64194 8.82547 5.99623L9.15316 5.40838Z",stroke:"currentColor",strokeWidth:"1.5"})}),e.jsx("div",{className:"ltr:ml-3 rtl:mr-3",children:"Favourites"})]})}),M.map(v=>e.jsxs("div",{children:[e.jsx("div",{className:"h-px w-full border-b border-[#e0e6ed] dark:border-[#1b2e4b] my-2"}),e.jsx("div",{className:"px-1 py-2 text-white-dark text-xs uppercase font-semibold tracking-wider",children:v.name}),v.type==="tags"?e.jsx("div",{className:"flex flex-wrap gap-1.5 px-1",children:v.options.map($=>{const _=(f[v.id]||[]).includes($.id);return e.jsxs("button",{type:"button",className:"mb-0 py-0.5 px-2.5 text-xs rounded-full cursor-pointer transition-all font-medium",style:{border:`1.5px solid ${$.color||"#9ca3af"}`,color:_?"#fff":$.color||"#9ca3af",backgroundColor:_?$.color||"#9ca3af":"transparent"},onClick:()=>O(v.id,$.id),children:[$.label,$.count!==void 0&&e.jsx("span",{style:{opacity:.7,marginLeft:"2px"},children:$.count})]},$.id)})}):e.jsx("div",{className:"space-y-0.5",children:v.options.map($=>{const _=(f[v.id]||[]).includes($.id);return e.jsxs("button",{type:"button",className:`flex h-9 w-full items-center rounded-md px-2 py-1.5 text-sm font-medium transition-colors hover:bg-white-dark/10 hover:text-primary dark:hover:bg-[#181F32] dark:hover:text-primary ${_?"bg-gray-100 text-primary dark:bg-[#181F32] dark:text-primary":""}`,onClick:()=>O(v.id,$.id),children:[e.jsx("span",{className:"inline-block w-3 h-3 rounded-full mr-2.5 flex-shrink-0",style:{backgroundColor:$.color||"#9ca3af"}}),e.jsx("span",{className:"truncate",children:$.label}),$.count!==void 0&&e.jsx("span",{className:"ml-auto text-xs opacity-60",children:$.count})]},$.id)})})]},v.id)),e.jsx(Pt,{columns:w,fieldFilters:x,onFieldFiltersChange:k,allRecords:u,sidebarFilters:M})]})}),e.jsx("div",{className:"absolute bottom-0 w-full p-4 left-0",children:e.jsxs("a",{href:`/account/${s}/record/${S}/add`,className:"btn btn-primary w-full",children:[e.jsxs("svg",{xmlns:"http://www.w3.org/2000/svg",width:"24px",height:"24px",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round",className:"h-5 w-5 ltr:mr-2 rtl:ml-2",children:[e.jsx("line",{x1:"12",y1:"5",x2:"12",y2:"19"}),e.jsx("line",{x1:"5",y1:"12",x2:"19",y2:"12"})]}),"Ajouter"]})})]})})]}),e.jsx("div",{onMouseDown:Z,style:{position:"absolute",top:0,right:-3,width:6,height:"100%",cursor:"col-resize",zIndex:20,display:"flex",alignItems:"center",justifyContent:"center"},onMouseEnter:v=>{v.currentTarget.querySelector(".resize-bar").style.opacity="1"},onMouseLeave:v=>{B.current||(v.currentTarget.querySelector(".resize-bar").style.opacity="0")},children:e.jsx("div",{className:"resize-bar",style:{width:3,height:"100%",borderRadius:2,background:"var(--primary, #4361ee)",opacity:0,transition:"opacity 0.2s ease"}})})]})}const Jt=["#4361ee","#805dca","#e2a03f","#00ab55","#e7515a","#2196d4","#3b3f5c","#009688","#ff5722","#607d8b"],Ut={contains:{label:"Contient",icon:"⊃",types:["text","email","phone","url","textarea","title","relation"]},not_contains:{label:"Ne contient pas",icon:"⊅",types:["text","email","phone","url","textarea","title","relation"]},equals:{label:"Est égal à",icon:"=",types:["text","email","phone","url","number","date","title","select","relation","classification"]},not_equals:{label:"N'est pas égal à",icon:"≠",types:["text","email","phone","url","number","date","title","select","relation","classification"]},starts_with:{label:"Commence par",icon:"A…",types:["text","email","phone","url","title"]},ends_with:{label:"Se termine par",icon:"…Z",types:["text","email","phone","url","title"]},gt:{label:"Supérieur à",icon:">",types:["number","date"]},gte:{label:"Supérieur ou égal",icon:"≥",types:["number","date"]},lt:{label:"Inférieur à",icon:"<",types:["number","date"]},lte:{label:"Inférieur ou égal",icon:"≤",types:["number","date"]},between:{label:"Entre",icon:"↔",types:["number","date"]},is_empty:{label:"Est vide",icon:"∅",types:["text","email","phone","url","number","date","textarea","title","select","relation","classification"]},is_not_empty:{label:"N'est pas vide",icon:"∃",types:["text","email","phone","url","number","date","textarea","title","select","relation","classification"]}};function Oe(t){const o=t||"text";return Object.entries(Ut).filter(([i,s])=>s.types.includes(o)).map(([i,s])=>({key:i,...s}))}function Ke(t){return["number","currency","percent"].includes(t)?"number":["date","datetime"].includes(t)?"date":"text"}function Kt({savedViews:t=[],activeViewId:o,onSelectView:i,onCreateView:s,onDeleteView:S,onRenameView:L,onUpdateViewFilters:b,hasActiveFilters:M=!1,activeFilters:f={},fieldFilters:p=[],sidebarFilters:w=[],columns:x=[],externalOpenCreate:k=!1,onCloseExternalCreate:u}){const[j,D]=r.useState(!1),[Q,K]=r.useState(!1),[h,z]=r.useState(""),[V,B]=r.useState("#4361ee"),[U,l]=r.useState(null),[n,Y]=r.useState(null),[Z,O]=r.useState(""),[C,v]=r.useState(null),[$,_]=r.useState([]),[ie,ne]=r.useState({}),[y,T]=r.useState(!1),P=r.useRef(null),I=r.useRef(null),J=r.useRef(null),F=r.useRef(null);r.useEffect(()=>{const d=W=>{U&&I.current&&!I.current.contains(W.target)&&l(null)};return U&&document.addEventListener("mousedown",d),()=>document.removeEventListener("mousedown",d)},[U]),r.useEffect(()=>{j&&J.current&&setTimeout(()=>{var d;return(d=J.current)==null?void 0:d.focus()},100)},[j]),r.useEffect(()=>{k&&(D(!0),_([...p]),u==null||u())},[k]),r.useEffect(()=>{j&&!C&&(_([...p]),ne(JSON.parse(JSON.stringify(f||{}))))},[j]),r.useEffect(()=>{const d=W=>{y&&P.current&&!P.current.contains(W.target)&&T(!1)};return y&&document.addEventListener("mousedown",d),()=>document.removeEventListener("mousedown",d)},[y]),r.useEffect(()=>{n&&F.current&&(F.current.focus(),F.current.select())},[n]);const A=(d,W)=>{d.preventDefault(),l({viewId:W,x:d.clientX,y:d.clientY})},re=()=>{h.trim()&&(s({name:h.trim(),color:V,filters:ie,fieldFilters:$}),z(""),B("#4361ee"),_([]),ne({}),D(!1))},oe=r.useMemo(()=>x.filter(d=>d.id!=="actions"),[x]),ce=r.useMemo(()=>{const d={};return w.forEach(W=>{d[`classif:${W.id}`]=W.options||[]}),d},[w]),he=r.useCallback(d=>{const W=oe.find(pe=>pe.id===d);if(!W)return;const le=d.startsWith("classif:"),de=Oe(W.type),ve=le?de.find(pe=>pe.key==="equals")||de[0]:de.find(pe=>pe.key==="contains")||de[0],ye={fieldId:d,fieldName:W.name,fieldType:W.type||"text",operator:ve.key,value:"",value2:"",logic:"AND"};_(pe=>[...pe,ye]),T(!1)},[oe]),c=r.useCallback((d,W)=>{_(le=>le.map((de,ve)=>ve===d?{...de,...W}:de))},[]),H=r.useCallback(d=>{_(W=>W.filter((le,de)=>de!==d))},[]),G=d=>{const W=t.find(le=>le._id===d);W&&(Y(d),O(W.name)),l(null)},E=()=>{n&&Z.trim()&&L(n,Z.trim()),Y(null),O("")},me=d=>{S(d),l(null)},q=d=>{const W=t.find(le=>le._id===d);W&&(v(d),z(W.name||""),B(W.color||"#4361ee"),_(W.fieldFilters?JSON.parse(JSON.stringify(W.fieldFilters)):[]),ne(W.filters?JSON.parse(JSON.stringify(W.filters)):{}),D(!0),l(null))},ue=()=>{!h.trim()||!C||(b(C,ie,$,h.trim(),V),z(""),B("#4361ee"),_([]),ne({}),v(null),D(!1))},Ce=d=>{var le;let W=0;return d.filters&&(W+=Object.keys(d.filters).filter(de=>de!=="__favourites").length),(le=d.fieldFilters)!=null&&le.length&&(W+=d.fieldFilters.length),W};return e.jsxs(e.Fragment,{children:[e.jsxs("div",{className:"saved-views-tabs",children:[e.jsxs("button",{type:"button",className:`saved-view-tab ${o?"":"saved-view-tab--active"}`,onClick:()=>i(null),children:[e.jsxs("svg",{className:"saved-view-tab-icon",viewBox:"0 0 24 24",fill:"none",children:[e.jsx("path",{d:"M2 12C2 7.28595 2 4.92893 3.46447 3.46447C4.92893 2 7.28595 2 12 2C16.714 2 19.0711 2 20.5355 3.46447C22 4.92893 22 7.28595 22 12C22 16.714 22 19.0711 20.5355 20.5355C19.0711 22 16.714 22 12 22C7.28595 22 4.92893 22 3.46447 20.5355C2 19.0711 2 16.714 2 12Z",stroke:"currentColor",strokeWidth:"1.5"}),e.jsx("path",{d:"M6 12H18",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"}),e.jsx("path",{d:"M6 8H18",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"}),e.jsx("path",{d:"M6 16H18",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"})]}),"Tout"]}),t.map(d=>e.jsx("button",{type:"button",className:`saved-view-tab ${o===d._id?"saved-view-tab--active":""}`,style:{"--tab-color":d.color||"#4361ee"},onClick:()=>i(d._id),onContextMenu:W=>A(W,d._id),children:n===d._id?e.jsx("input",{ref:F,type:"text",value:Z,onChange:W=>O(W.target.value),onBlur:E,onKeyDown:W=>{W.key==="Enter"&&E(),W.key==="Escape"&&(Y(null),O(""))},className:"saved-view-tab-edit-input",onClick:W=>W.stopPropagation()}):e.jsxs(e.Fragment,{children:[e.jsx("span",{className:"saved-view-tab-dot",style:{backgroundColor:d.color||"#4361ee"}}),e.jsx("span",{className:"saved-view-tab-name",children:d.name}),Ce(d)>0&&e.jsx("span",{className:"saved-view-tab-badge",children:Ce(d)})]})},d._id)),e.jsx("button",{type:"button",className:"saved-view-tab saved-view-tab--add",onClick:()=>{v(null),z(""),B("#4361ee"),D(!0)},title:"Enregistrer une vue",children:e.jsx("svg",{viewBox:"0 0 24 24",fill:"none",className:"h-3.5 w-3.5",children:e.jsx("path",{d:"M12 5V19M5 12H19",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round"})})})]}),U&&e.jsxs("div",{ref:I,className:"saved-view-context-menu",style:{position:"fixed",top:U.y,left:U.x,zIndex:10001},children:[e.jsxs("button",{className:"saved-view-context-item",onClick:()=>G(U.viewId),children:[e.jsx("svg",{viewBox:"0 0 24 24",fill:"none",className:"h-4 w-4",children:e.jsx("path",{d:"M13.9027 6.37027L17.6297 10.0973M4 20.0001H8L18.5 9.50006C18.9978 9.00236 19.2786 8.32622 19.2786 7.62142C19.2786 6.91661 18.9978 6.24047 18.5 5.74277C18.0023 5.24508 17.3261 4.96426 16.6213 4.96426C15.9165 4.96426 15.2404 5.24508 14.7427 5.74277L4 16.0001V20.0001Z",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round"})}),"Renommer"]}),e.jsxs("button",{className:"saved-view-context-item",onClick:()=>q(U.viewId),children:[e.jsxs("svg",{viewBox:"0 0 24 24",fill:"none",className:"h-4 w-4",children:[e.jsx("path",{d:"M4.06189 13C4.02104 12.6724 4 12.3387 4 12C4 7.58172 7.58172 4 12 4C14.5006 4 16.7332 5.14727 18.2002 6.94416M19.9381 11C19.979 11.3276 20 11.6613 20 12C20 16.4183 16.4183 20 12 20C9.49944 20 7.26681 18.8527 5.79984 17.0558",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round"}),e.jsx("path",{d:"M15 7H19V3",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round"}),e.jsx("path",{d:"M9 17H5V21",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round"})]}),"Modifier la vue"]}),e.jsx("div",{className:"saved-view-context-separator"}),e.jsxs("button",{className:"saved-view-context-item saved-view-context-item--danger",onClick:()=>me(U.viewId),children:[e.jsxs("svg",{viewBox:"0 0 24 24",fill:"none",className:"h-4 w-4",children:[e.jsx("path",{d:"M20.5001 6H3.5",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"}),e.jsx("path",{d:"M18.8334 8.5L18.3735 15.3991C18.1965 18.054 18.108 19.3815 17.243 20.1907C16.378 21 15.0476 21 12.3868 21H11.6134C8.9526 21 7.6222 21 6.75719 20.1907C5.89218 19.3815 5.80368 18.054 5.62669 15.3991L5.16675 8.5",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"}),e.jsx("path",{d:"M9.5 11L10 16",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"}),e.jsx("path",{d:"M14.5 11L14 16",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"}),e.jsx("path",{d:"M6.5 6C6.55588 6 6.58382 6 6.60915 5.99936C7.43259 5.97849 8.15902 5.45491 8.43922 4.68032C8.44784 4.65649 8.45667 4.62999 8.47434 4.57697L8.57143 4.28571C8.65431 4.03708 8.69575 3.91276 8.75071 3.8072C8.97001 3.38607 9.37574 3.09364 9.84461 3.01877C9.96213 3 10.0932 3 10.3553 3H13.6447C13.9068 3 14.0379 3 14.1554 3.01877C14.6243 3.09364 15.03 3.38607 15.2493 3.8072C15.3043 3.91276 15.3457 4.03708 15.4286 4.28571L15.5257 4.57697C15.5433 4.62992 15.5522 4.65651 15.5608 4.68032C15.841 5.45491 16.5674 5.97849 17.3909 5.99936C17.4162 6 17.4441 6 17.5 6",stroke:"currentColor",strokeWidth:"1.5"})]}),"Supprimer"]})]}),j&&e.jsx("div",{className:"saved-view-modal-overlay",onClick:()=>D(!1),children:e.jsxs("div",{className:"saved-view-modal",onClick:d=>d.stopPropagation(),children:[e.jsxs("div",{className:"saved-view-modal-header",children:[e.jsx("h3",{children:C?"Modifier la vue":"Enregistrer la vue"}),e.jsx("button",{type:"button",className:"saved-view-modal-close",onClick:()=>{D(!1),v(null)},children:e.jsx("svg",{viewBox:"0 0 24 24",fill:"none",className:"h-5 w-5",children:e.jsx("path",{d:"M18 6L6 18M6 6L18 18",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"})})})]}),e.jsxs("div",{className:"saved-view-modal-body",children:[e.jsxs("div",{className:"saved-view-form-group",children:[e.jsx("label",{className:"saved-view-form-label",children:"Nom de la vue"}),e.jsx("input",{ref:J,type:"text",value:h,onChange:d=>z(d.target.value),onKeyDown:d=>{d.key==="Enter"&&re()},placeholder:"Ex: Hôtels, Clients VIP...",className:"saved-view-form-input"})]}),e.jsxs("div",{className:"saved-view-form-group",children:[e.jsx("label",{className:"saved-view-form-label",children:"Couleur"}),e.jsx("div",{className:"saved-view-color-grid",children:Jt.map(d=>e.jsx("button",{type:"button",className:`saved-view-color-swatch ${V===d?"saved-view-color-swatch--active":""}`,style:{backgroundColor:d},onClick:()=>B(d),children:V===d&&e.jsx("svg",{viewBox:"0 0 24 24",fill:"none",className:"h-3 w-3",children:e.jsx("path",{d:"M5 13L9 17L19 7",stroke:"white",strokeWidth:"2.5",strokeLinecap:"round",strokeLinejoin:"round"})})},d))})]}),w.length>0&&e.jsxs("div",{className:"saved-view-form-group",children:[e.jsx("label",{className:"saved-view-form-label",children:"Filtres de classification"}),e.jsx("div",{className:"svm-classif-editor",children:w.map(d=>{const W=ie[d.id]||[];return e.jsxs("div",{className:"svm-classif-group",children:[e.jsx("span",{className:"svm-classif-group-label",children:d.name}),e.jsx("div",{className:"svm-classif-options",children:(d.options||[]).map(le=>{const de=W.includes(le.id);return e.jsxs("button",{type:"button",className:`svm-classif-pill ${de?"svm-classif-pill--active":""}`,style:{"--pill-color":le.color||"#9ca3af"},onClick:()=>{ne(ve=>{const ye=ve[d.id]||[];let pe;de?pe=ye.filter(we=>we!==le.id):pe=[...ye,le.id];const ke={...ve};return pe.length>0?ke[d.id]=pe:delete ke[d.id],ke})},children:[de&&e.jsx("svg",{viewBox:"0 0 24 24",fill:"none",className:"svm-classif-check",children:e.jsx("path",{d:"M5 13L9 17L19 7",stroke:"currentColor",strokeWidth:"2.5",strokeLinecap:"round",strokeLinejoin:"round"})}),le.label]},le.id)})})]},d.id)})})]}),e.jsxs("div",{className:"saved-view-form-group",children:[e.jsx("label",{className:"saved-view-form-label",children:"Filtres avancés"}),e.jsxs("div",{className:"svm-filter-builder",children:[$.map((d,W)=>{var we;const le=(we=d.fieldId)==null?void 0:we.startsWith("classif:"),de=le?ce[d.fieldId]||[]:[],ve=Oe(d.fieldType),ye=["is_empty","is_not_empty"].includes(d.operator),pe=d.operator==="between",ke=d.logic||"AND";return e.jsxs(We.Fragment,{children:[W>0&&e.jsxs("div",{className:"svm-filter-connector",children:[e.jsx("span",{className:"svm-filter-connector-line"}),e.jsx("button",{type:"button",className:`svm-filter-connector-badge ${ke==="OR"?"svm-filter-connector-badge--or":""}`,onClick:()=>c(W,{logic:ke==="AND"?"OR":"AND"}),title:"Cliquez pour basculer ET/OU",children:ke==="OR"?"OU":"ET"}),e.jsx("span",{className:"svm-filter-connector-line"})]}),e.jsxs("div",{className:"svm-filter-row",children:[e.jsx("select",{value:d.fieldId,onChange:ae=>{const je=oe.find(Me=>Me.id===ae.target.value);if(je){const Me=ae.target.value.startsWith("classif:"),Ne=Oe(je.type),Se=Me?Ne.find(ge=>ge.key==="equals")||Ne[0]:Ne.find(ge=>ge.key===d.operator)||Ne[0];c(W,{fieldId:je.id,fieldName:je.name,fieldType:je.type||"text",operator:Se.key,value:"",value2:""})}},className:"svm-filter-select svm-filter-select--field",children:oe.map(ae=>e.jsx("option",{value:ae.id,children:ae.name},ae.id))}),e.jsx("select",{value:d.operator,onChange:ae=>c(W,{operator:ae.target.value,value:["is_empty","is_not_empty"].includes(ae.target.value)?"":d.value,value2:""}),className:"svm-filter-select svm-filter-select--op",children:ve.map(ae=>e.jsx("option",{value:ae.key,children:ae.label},ae.key))}),!ye&&(le&&de.length>0?e.jsxs("select",{value:d.value,onChange:ae=>c(W,{value:ae.target.value}),className:"svm-filter-select svm-filter-select--val",children:[e.jsx("option",{value:"",children:"Sélectionnez..."}),de.map(ae=>e.jsx("option",{value:ae.label,children:ae.label},ae.id))]}):e.jsx("input",{type:Ke(d.fieldType),value:d.value,onChange:ae=>c(W,{value:ae.target.value}),placeholder:"Valeur...",className:"svm-filter-input"})),pe&&e.jsx("input",{type:Ke(d.fieldType),value:d.value2||"",onChange:ae=>c(W,{value2:ae.target.value}),placeholder:"Max...",className:"svm-filter-input"}),e.jsx("button",{type:"button",className:"svm-filter-remove",onClick:()=>H(W),title:"Supprimer ce filtre",children:e.jsx("svg",{viewBox:"0 0 24 24",fill:"none",className:"h-3.5 w-3.5",children:e.jsx("path",{d:"M18 6L6 18M6 6L18 18",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round"})})})]})]},W)}),e.jsxs("div",{className:"svm-filter-add-row",ref:P,children:[e.jsxs("button",{type:"button",className:"svm-filter-add-btn",onClick:()=>T(!y),children:[e.jsx("svg",{viewBox:"0 0 24 24",fill:"none",className:"h-3.5 w-3.5",children:e.jsx("path",{d:"M12 5V19M5 12H19",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round"})}),"Ajouter un filtre"]}),y&&e.jsxs("div",{className:"svm-filter-field-dropdown",children:[e.jsx("div",{className:"svm-filter-field-dropdown-title",children:"Choisir un champ"}),oe.map(d=>e.jsx("button",{type:"button",className:"svm-filter-field-option",onClick:()=>he(d.id),children:d.name},d.id))]})]})]})]})]}),e.jsxs("div",{className:"saved-view-modal-footer",children:[e.jsx("button",{type:"button",className:"saved-view-btn saved-view-btn--cancel",onClick:()=>{D(!1),v(null)},children:"Annuler"}),e.jsxs("button",{type:"button",className:"saved-view-btn saved-view-btn--save",onClick:C?ue:re,disabled:!h.trim(),children:[e.jsx("svg",{viewBox:"0 0 24 24",fill:"none",className:"h-4 w-4",children:e.jsx("path",{d:"M5 13L9 17L19 7",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round"})}),C?"Mettre à jour":"Enregistrer"]})]})]})}),e.jsx("style",{children:`
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
            `})]})}function Yt(t,o){var s,S,L;if(o==="title")return t.referenceTitle||t.computedTitle||t.title||"";if(o==="createdAt")return t.createdAt||"";if(o==="updatedAt")return t.updatedAt||"";if(o.startsWith("rel:")){const b=o.replace("rel:",""),f=(((s=t._denorm)==null?void 0:s.relations)||[]).find(x=>x.relationKey===b);if(((S=f==null?void 0:f.records)==null?void 0:S.length)>0)return f.records.map(x=>x.title||x.computedTitle||"").join(", ");const p=(t.relations||[]).find(x=>x.key===b||x.relationKey===b);if(p)return p.title||p.computedTitle||p.value||"";const w=(L=t._denorm)==null?void 0:L[b];return w&&(w.title||w.computedTitle)||""}if(o.startsWith("classif:")){const b=o.replace("classif:","");return(t.classificationValues||[]).filter(p=>{var w;return((w=p.classificationId)==null?void 0:w.toString())===b}).map(p=>p.label||p.optionLabel||"").join(", ")}const i=(t.customFields||[]).find(b=>{var M,f,p;return((f=(M=b.field_id)==null?void 0:M._id)==null?void 0:f.toString())===o||((p=b.field_id)==null?void 0:p.toString())===o});return(i==null?void 0:i.value)??""}function qt(t,o){const{operator:i,value:s,value2:S,fieldType:L}=o,b=["number","currency","percent"].includes(L),M=["date","datetime"].includes(L),f=String(t??"").trim(),p=f.toLowerCase(),w=String(s??"").trim().toLowerCase();switch(i){case"contains":return p.includes(w);case"not_contains":return!p.includes(w);case"equals":return b?parseFloat(f)===parseFloat(s):p===w;case"not_equals":return b?parseFloat(f)!==parseFloat(s):p!==w;case"starts_with":return p.startsWith(w);case"ends_with":return p.endsWith(w);case"gt":return M?new Date(t)>new Date(s):parseFloat(f)>parseFloat(s);case"gte":return M?new Date(t)>=new Date(s):parseFloat(f)>=parseFloat(s);case"lt":return M?new Date(t)<new Date(s):parseFloat(f)<parseFloat(s);case"lte":return M?new Date(t)<=new Date(s):parseFloat(f)<=parseFloat(s);case"between":{if(M){const k=new Date(t);return k>=new Date(s)&&k<=new Date(S)}const x=parseFloat(f);return x>=parseFloat(s)&&x<=parseFloat(S)}case"is_empty":return f===""||t==null;case"is_not_empty":return f!==""&&t!=null;default:return!0}}function Xt({accountId:t,accountNumber:o,entityId:i,viewId:s,entityName:S,entityNamePlural:L,entitySlug:b}){const[M,f]=r.useState([]),[p,w]=r.useState([]),[x,k]=r.useState([]),[u,j]=r.useState([]),[D,Q]=r.useState(!0),[K,h]=r.useState(null),[z,V]=r.useState(""),[B,U]=r.useState("table"),[l,n]=r.useState(""),[Y,Z]=r.useState(null),[O,C]=r.useState(new Set),[v,$]=r.useState(!1),_=r.useRef(null),[ie,ne]=r.useState([]),[y,T]=r.useState({}),[P,I]=r.useState([]),[J,F]=r.useState([]),[A,re]=r.useState(null),[oe,ce]=r.useState(!1),[he,c]=r.useState(null),H=r.useRef(null),G=r.useCallback((a,m="success")=>{H.current&&clearTimeout(H.current),c({message:a,type:m}),H.current=setTimeout(()=>c(null),2500)},[]),[E,me]=r.useState({columns:[],sort:{field:"createdAt",direction:"desc"},density:"normal",pageSize:10,titleDisplay:"avatar",showSidebar:!0,sidebarWidth:280,viewMode:null,enabledViews:["table","kanban","notes","calendar"]}),[q,ue]=r.useState({page:1,limit:10,total:0,pages:0}),Ce=r.useRef(null),d=r.useCallback(async()=>{var a,m;try{Q(!0),h(null);const N=new URLSearchParams({limit:1e4,sort:`${E.sort.field}:${E.sort.direction}`}),R=await fetch(`/account/${o}/api/entity/${i}/views/${s}/records?${N}`,{credentials:"include"});if(!R.ok)throw new Error(`HTTP ${R.status}`);const g=await R.json();if(f(g.records||[]),w(g.records||[]),g.entity&&(Z(g.entity),g.entity.icon&&n(g.entity.icon)),g.filters&&ne(g.filters),g.preferences)if(me(ee=>{var X,te;return{...ee,...g.preferences,columns:(X=g.preferences.columns)!=null&&X.length?g.preferences.columns:((te=g.columns)==null?void 0:te.map(se=>({id:se.id,visible:!0})))||[]}}),g.preferences.pageSize&&ue(ee=>({...ee,limit:g.preferences.pageSize})),g.preferences.viewMode&&U(g.preferences.viewMode),(a=g.preferences.columns)!=null&&a.length&&((m=g.columns)!=null&&m.length)){const ee=[];g.preferences.columns.forEach(X=>{const te=g.columns.find(se=>se.id===X.id);te&&ee.push(te)}),g.columns.forEach(X=>{ee.find(te=>te.id===X.id)||ee.push(X)}),j(ee)}else j(g.columns||[]);else g.columns&&(j(g.columns||[]),me(ee=>({...ee,columns:g.columns.map(X=>({id:X.id,visible:!0}))})))}catch(N){console.error("[RecordsGrid] Fetch error:",N),h(N.message)}finally{Q(!1)}},[o,i,s,E.sort]),W=r.useCallback(async()=>{try{const a=await fetch(`/account/${o}/api/entity/${i}/saved-views`,{credentials:"include"});if(a.ok){const m=await a.json();F(m.views||[])}}catch(a){console.error("[RecordsGrid] Fetch saved views error:",a)}},[o,i]),le=r.useCallback(async({name:a,color:m,filters:N,fieldFilters:R})=>{try{const g=await fetch(`/account/${o}/api/entity/${i}/saved-views`,{method:"POST",headers:{"Content-Type":"application/json"},credentials:"include",body:JSON.stringify({name:a,color:m,filters:N,fieldFilters:R})});if(g.ok){const ee=await g.json();F(X=>[...X,ee.view]),re(ee.view._id)}}catch(g){console.error("[RecordsGrid] Create saved view error:",g)}},[o,i]),de=r.useCallback(async a=>{try{(await fetch(`/account/${o}/api/entity/${i}/saved-views/${a}`,{method:"DELETE",credentials:"include"})).ok&&(F(N=>N.filter(R=>R._id!==a)),A===a&&(re(null),T({}),ue(N=>({...N,page:1}))))}catch(m){console.error("[RecordsGrid] Delete saved view error:",m)}},[o,i,A]),ve=r.useCallback(async(a,m)=>{try{(await fetch(`/account/${o}/api/entity/${i}/saved-views/${a}`,{method:"PUT",headers:{"Content-Type":"application/json"},credentials:"include",body:JSON.stringify({name:m})})).ok&&F(R=>R.map(g=>g._id===a?{...g,name:m}:g))}catch(N){console.error("[RecordsGrid] Rename saved view error:",N)}},[o,i]),ye=r.useCallback(async(a,m,N,R,g)=>{var ee;try{const X={filters:m,fieldFilters:N||[]};if(R&&(X.name=R),g&&(X.color=g),(await fetch(`/account/${o}/api/entity/${i}/saved-views/${a}`,{method:"PUT",headers:{"Content-Type":"application/json"},credentials:"include",body:JSON.stringify(X)})).ok){const se=JSON.parse(JSON.stringify(m||{})),xe=JSON.parse(JSON.stringify(N||[]));F(be=>be.map(Le=>{if(Le._id!==a)return Le;const Ee={...Le,filters:se,fieldFilters:xe};return R&&(Ee.name=R),g&&(Ee.color=g),Ee}));const fe=R||((ee=J.find(be=>be._id===a))==null?void 0:ee.name)||"Vue";G(`Vue "${fe}" mise à jour`)}else G("Erreur lors de la mise à jour","error")}catch(X){console.error("[RecordsGrid] Update saved view error:",X),G("Erreur lors de la mise à jour","error")}},[o,i,J,G]),pe=r.useCallback(a=>{if(!a){re(null),T({}),I([]),ue(N=>({...N,page:1}));return}const m=J.find(N=>N._id===a);m&&(re(a),T(JSON.parse(JSON.stringify(m.filters||{}))),I(JSON.parse(JSON.stringify(m.fieldFilters||[]))),ue(N=>({...N,page:1})))},[J]);r.useEffect(()=>{d(),W()},[]);const ke=r.useMemo(()=>{if(!M.length)return[];const{field:a,direction:m}=E.sort,N=m==="asc"?1:-1;return[...M].sort((R,g)=>{let ee,X;if(a==="title")ee=(R.referenceTitle||R.title||"").toLowerCase(),X=(g.referenceTitle||g.title||"").toLowerCase();else if(a==="createdAt"||a==="updatedAt")ee=new Date(R[a]||0).getTime(),X=new Date(g[a]||0).getTime();else{const te=(R.customFields||[]).find(xe=>{var be;const fe=((be=xe.field_id)==null?void 0:be._id)||xe.field_id;return(fe==null?void 0:fe.toString())===a}),se=(g.customFields||[]).find(xe=>{var be;const fe=((be=xe.field_id)==null?void 0:be._id)||xe.field_id;return(fe==null?void 0:fe.toString())===a});ee=((te==null?void 0:te.value)||"").toString().toLowerCase(),X=((se==null?void 0:se.value)||"").toString().toLowerCase()}return ee<X?-1*N:ee>X?1*N:0})},[M,E.sort.field,E.sort.direction]),we=r.useMemo(()=>ke.map(a=>({...a,_searchIndex:[a.title||"",a.referenceTitle||"",a.computedTitle||"",...(a.customFields||[]).map(m=>m.value||"")].join(" ").toLowerCase()})),[ke]),ae=r.useCallback((a,m,N,R)=>{let g=a;if(m&&m.trim()){const X=m.toLowerCase();g=g.filter(te=>te._searchIndex.includes(X))}const ee=Object.keys(N).filter(X=>X!=="__favourites");return ee.length>0&&(g=g.filter(X=>{const te=X.classificationValues||[];return ee.every(se=>{const xe=N[se];return!xe||xe.length===0?!0:te.some(fe=>{var be,Le;return((be=fe.classificationId)==null?void 0:be.toString())===se&&xe.includes((Le=fe.optionId)==null?void 0:Le.toString())})})})),R&&R.length>0&&(g=g.filter(X=>{const te=[[R[0]]];for(let se=1;se<R.length;se++)(R[se].logic||"AND")==="OR"?te.push([R[se]]):te[te.length-1].push(R[se]);return te.some(se=>se.every(xe=>{const fe=Yt(X,xe.fieldId);return qt(fe,xe)}))})),g},[]),je=r.useCallback(a=>{var N;const m=typeof a=="string"?a:((N=a==null?void 0:a.target)==null?void 0:N.value)||"";V(m),ue(R=>({...R,page:1}))},[]),Me=r.useCallback(a=>{T(a),ue(m=>({...m,page:1}))},[]),Ne=r.useCallback(a=>{I(a),ue(m=>({...m,page:1}))},[]);r.useEffect(()=>{const a=ae(we,z,y,P);w(a)},[we,z,y,P,ae]),r.useEffect(()=>{const a=(q.page-1)*q.limit,m=a+q.limit,N=p.slice(a,m);k(N),ue(R=>({...R,total:p.length,pages:Math.ceil(p.length/q.limit)}))},[p,q.page,q.limit]);const Se=r.useCallback(async a=>{try{await fetch(`/account/${o}/api/user/view-preferences`,{method:"POST",headers:{"Content-Type":"application/json"},credentials:"include",body:JSON.stringify({viewId:s,preferences:a})})}catch(m){console.error("[RecordsGrid] Save preferences error:",m)}},[o,s]),ge=r.useCallback((a,m)=>{const N={...E,[a]:m};me(N),Se(N),a==="pageSize"&&ue(R=>({...R,limit:m,page:1}))},[E,Se]),Ge=r.useCallback(a=>{U(a),me(m=>{const N={...m,viewMode:a};return Se(N),N})},[Se]),Re=r.useCallback(a=>{ue(m=>({...m,page:a}))},[]),Qe=r.useCallback((a,m,N)=>{if(N&&_.current!==null&&_.current!==m){const R=Math.min(_.current,m),g=Math.max(_.current,m);C(ee=>{const X=new Set(ee);for(let te=R;te<=g;te++)x[te]&&X.add(x[te]._id);return X})}else C(R=>{const g=new Set(R);return g.has(a)?g.delete(a):g.add(a),g});_.current=m},[x]),et=r.useCallback(()=>{C(a=>{const m=x.map(g=>g._id),N=m.every(g=>a.has(g)),R=new Set(a);return N?m.forEach(g=>R.delete(g)):m.forEach(g=>R.add(g)),R})},[x]),tt=r.useCallback(()=>{C(a=>{const m=p.map(N=>N._id);return a.size===m.length?new Set:new Set(m)})},[p]),rt=r.useCallback(()=>{C(new Set)},[]),st=r.useMemo(()=>x.length===0?!1:x.every(a=>O.has(a._id)),[x,O]),at=r.useCallback(async()=>{if(!(O.size===0||!(typeof Swal<"u"?await Swal.fire({title:"Confirmer la suppression",html:`<p>Vous allez supprimer <strong>${O.size}</strong> enregistrement(s).</p><p style="color:#e7515a;font-size:13px;margin-top:8px;">Cette action est irréversible.</p>`,icon:"warning",showCancelButton:!0,confirmButtonColor:"#e7515a",cancelButtonText:"Annuler",confirmButtonText:"Supprimer"}).then(m=>m.isConfirmed):confirm(`Supprimer ${O.size} enregistrement(s) ?`)))){$(!0);try{const N=await(await fetch(`/account/${o}/record/api/bulk-delete`,{method:"POST",headers:{"Content-Type":"application/json"},credentials:"include",body:JSON.stringify({ids:[...O]})})).json();N.success?(f(R=>R.filter(g=>!O.has(g._id))),C(new Set),G(`${N.deletedCount} enregistrement(s) supprimé(s)`)):G(N.error||"Erreur lors de la suppression","error")}catch(m){console.error("[RecordsGrid] Bulk delete error:",m),G("Erreur lors de la suppression","error")}finally{$(!1)}}},[O,o,G]),it=r.useCallback((a,m)=>{j(N=>{const R=N.findIndex(se=>se.id===a),g=N.findIndex(se=>se.id===m);if(R===-1||g===-1)return N;const ee=[...N],[X]=ee.splice(R,1);ee.splice(g,0,X);const te=ee.map(se=>E.columns.find(fe=>fe.id===se.id)||{id:se.id,visible:!0});return ge("columns",te),ee})},[E.columns,ge]),Ve=r.useMemo(()=>{switch(E.density){case"compact":return 36;case"comfortable":return 56;default:return 44}},[E.density]),De=lt({count:x.length,getScrollElement:()=>Ce.current,estimateSize:()=>Ve,overscan:10});r.useEffect(()=>{De.measure()},[Ve,De]);const ot=r.useMemo(()=>{var N;let a;(N=E.columns)!=null&&N.length?a=u.filter(R=>{const g=E.columns.find(ee=>ee.id===R.id);return g?g.visible!==!1:!0}):a=u;const m=a.findIndex(R=>R.id==="actions");if(m>-1&&m<a.length-1){const[R]=a.splice(m,1);a=[...a,R]}return a},[u,E.columns]);return D&&x.length===0?e.jsx("div",{className:"flex items-center justify-center h-64",children:e.jsx("div",{className:"animate-spin rounded-full h-8 w-8 border-b-2 border-primary"})}):K&&x.length===0?e.jsx("div",{className:"flex items-center justify-center h-64 text-danger",children:e.jsxs("span",{children:["Erreur: ",K]})}):e.jsxs("div",{className:"relative flex h-full gap-5 sm:min-h-0",children:[e.jsx(Zt,{entityName:S,entityNamePlural:L,entityIcon:l,accountNumber:o,entitySlug:b,showSidebar:E.showSidebar!==!1,onToggleSidebar:()=>ge("showSidebar",!E.showSidebar),filters:ie,activeFilters:y,onFilterChange:Me,columns:u,fieldFilters:P,onFieldFiltersChange:Ne,allRecords:M,sidebarWidth:E.sidebarWidth,onSidebarWidthChange:a=>ge("sidebarWidth",a)}),e.jsxs("div",{className:`panel p-4 flex-1 flex flex-col h-full ${B==="calendar"?"overflow-auto":"overflow-hidden"}`,children:[e.jsx(jt,{searchQuery:z,onSearch:je,columns:u,preferences:E,onPreferencesChange:ge,loading:D,accountNumber:o,entitySlug:b,viewId:s,showSidebar:E.showSidebar!==!1,onToggleSidebar:()=>ge("showSidebar",!E.showSidebar),activeView:B,onViewChange:Ge,enabledViews:E.enabledViews||["table","kanban","notes"],onEnabledViewsChange:a=>ge("enabledViews",a),hasActiveFilters:Object.keys(y).filter(a=>a!=="__favourites").length>0||P.length>0,onOpenSaveView:()=>ce(!0)}),e.jsx(Kt,{savedViews:J,activeViewId:A,onSelectView:pe,onCreateView:le,onDeleteView:de,onRenameView:ve,onUpdateViewFilters:ye,hasActiveFilters:Object.keys(y).filter(a=>a!=="__favourites").length>0||P.length>0,activeFilters:y,fieldFilters:P,sidebarFilters:ie,columns:u,externalOpenCreate:oe,onCloseExternalCreate:()=>ce(!1)}),e.jsx("div",{className:`flex-1 flex flex-col mt-4 ${B==="calendar"?"overflow-auto":"overflow-hidden"}`,children:B==="kanban"?e.jsx(_t,{records:p,columns:u,accountNumber:o,entitySlug:b,viewId:s,entityData:Y}):B==="calendar"?e.jsx(At,{records:p,columns:u,accountNumber:o,entitySlug:b,entityData:Y}):B==="notes"?e.jsx(Ot,{records:p,accountNumber:o,entitySlug:b}):e.jsxs("div",{className:"dataTable-wrapper flex-1 flex flex-col overflow-hidden",children:[e.jsx("div",{className:"dataTable-container flex-1 overflow-auto",ref:Ce,children:e.jsx(Ct,{records:x,columns:ot,virtualizer:De,sort:E.sort,onSort:a=>{const m=E.sort.field===a&&E.sort.direction==="asc"?"desc":"asc";ge("sort",{field:a,direction:m})},onColumnReorder:it,density:E.density,titleDisplay:E.titleDisplay||"avatar",entityIcon:l,accountNumber:o,entitySlug:b,selectedIds:O,onToggleSelect:Qe,onSelectAll:et,allPageSelected:st,showCheckboxes:E.showCheckboxes!==!1})}),e.jsxs("div",{className:"dataTable-bottom flex items-center justify-between border-t pt-4 dark:border-gray-800",children:[e.jsxs("div",{className:"dataTable-info text-gray-500 dark:text-gray-400",children:["Affichage de ",(q.page-1)*q.limit+1," à ",Math.min(q.page*q.limit,q.total)," sur ",q.total]}),e.jsx("nav",{className:"dataTable-pagination",children:e.jsxs("ul",{className:"inline-flex items-center space-x-1 rtl:space-x-reverse",children:[e.jsx("li",{children:e.jsx("button",{onClick:()=>Re(q.page-1),disabled:q.page<=1,className:"flex justify-center font-semibold p-2 rounded-full transition bg-white-light text-dark hover:text-white hover:bg-primary dark:text-white-light dark:bg-[#191e3a] dark:hover:bg-primary disabled:opacity-50",children:"«"})}),Array.from({length:Math.min(q.pages,5)},(a,m)=>{let N;return q.pages<=5||q.page<=3?N=m+1:q.page>=q.pages-2?N=q.pages-4+m:N=q.page-2+m,e.jsx("li",{children:e.jsx("button",{onClick:()=>Re(N),className:`flex justify-center font-semibold px-3.5 py-2 rounded-full transition ${N===q.page?"bg-primary text-white dark:bg-primary dark:text-white-light":"bg-white-light text-dark hover:text-white hover:bg-primary dark:text-white-light dark:bg-[#191e3a] dark:hover:bg-primary"}`,children:N})},N)}),e.jsx("li",{children:e.jsx("button",{onClick:()=>Re(q.page+1),disabled:q.page>=q.pages,className:"flex justify-center font-semibold p-2 rounded-full transition bg-white-light text-dark hover:text-white hover:bg-primary dark:text-white-light dark:bg-[#191e3a] dark:hover:bg-primary disabled:opacity-50",children:"»"})})]})})]})]})})]}),O.size>0&&e.jsxs("div",{className:"bulk-action-bar",style:{position:"fixed",bottom:"24px",left:"50%",transform:"translateX(-50%)",zIndex:99999,display:"flex",alignItems:"center",gap:"12px",padding:"10px 20px",borderRadius:"14px",background:"linear-gradient(135deg, #1b2e4b 0%, #0e1726 100%)",boxShadow:"0 8px 32px rgba(0,0,0,0.3), 0 0 0 1px rgba(67,97,238,0.2)",animation:"bulkBarSlideUp 0.3s cubic-bezier(0.16,1,0.3,1)",backdropFilter:"blur(12px)"},children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"8px"},children:[e.jsx("div",{style:{width:28,height:28,borderRadius:"8px",background:"rgba(67,97,238,0.2)",color:"#4361ee",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"12px",fontWeight:700},children:O.size}),e.jsxs("span",{style:{color:"#e0e6ed",fontSize:"13px",fontWeight:500,whiteSpace:"nowrap"},children:["sélectionné",O.size>1?"s":""]})]}),e.jsx("div",{style:{width:1,height:24,background:"rgba(255,255,255,0.1)"}}),O.size<p.length&&e.jsxs("button",{onClick:tt,style:{padding:"6px 12px",borderRadius:"8px",border:"1px solid rgba(67,97,238,0.3)",background:"rgba(67,97,238,0.1)",color:"#93b4fd",fontSize:"12px",fontWeight:600,cursor:"pointer",transition:"all 0.15s",whiteSpace:"nowrap"},onMouseEnter:a=>{a.target.style.background="rgba(67,97,238,0.2)",a.target.style.color="#b8cffe"},onMouseLeave:a=>{a.target.style.background="rgba(67,97,238,0.1)",a.target.style.color="#93b4fd"},children:["Tout sélectionner (",p.length,")"]}),e.jsx("div",{style:{width:1,height:24,background:"rgba(255,255,255,0.1)"}}),e.jsxs("button",{onClick:at,disabled:v,style:{display:"flex",alignItems:"center",gap:"6px",padding:"6px 14px",borderRadius:"8px",border:"none",background:"rgba(231,81,90,0.15)",color:"#ff6b6b",fontSize:"12px",fontWeight:600,cursor:v?"wait":"pointer",transition:"all 0.15s",whiteSpace:"nowrap",opacity:v?.6:1},onMouseEnter:a=>{v||(a.target.style.background="rgba(231,81,90,0.25)",a.target.style.color="#ff8a8a")},onMouseLeave:a=>{a.target.style.background="rgba(231,81,90,0.15)",a.target.style.color="#ff6b6b"},children:[e.jsxs("svg",{viewBox:"0 0 24 24",fill:"none",style:{width:14,height:14},children:[e.jsx("path",{d:"M20.5 6H3.5",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"}),e.jsx("path",{d:"M18.833 8.5L18.373 15.4C18.196 18.054 18.108 19.381 17.243 20.19C16.378 21 15.048 21 12.387 21H11.613C8.952 21 7.622 21 6.757 20.19C5.892 19.381 5.804 18.054 5.627 15.4L5.167 8.5",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"})]}),v?"Suppression...":"Supprimer"]}),e.jsx("div",{style:{width:1,height:24,background:"rgba(255,255,255,0.1)"}}),e.jsx("button",{onClick:rt,style:{width:28,height:28,borderRadius:"8px",border:"none",background:"rgba(255,255,255,0.08)",color:"#888ea8",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",transition:"all 0.15s"},onMouseEnter:a=>{a.target.style.background="rgba(255,255,255,0.15)",a.target.style.color="#e0e6ed"},onMouseLeave:a=>{a.target.style.background="rgba(255,255,255,0.08)",a.target.style.color="#888ea8"},title:"Désélectionner tout",children:e.jsx("svg",{viewBox:"0 0 24 24",fill:"none",style:{width:14,height:14},children:e.jsx("path",{d:"M18 6L6 18M6 6L18 18",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round"})})})]}),he&&e.jsxs("div",{style:{position:"fixed",bottom:O.size>0?"80px":"24px",right:"24px",zIndex:99999,padding:"10px 20px",borderRadius:"10px",fontSize:"13px",fontWeight:500,color:"#fff",background:he.type==="error"?"#e7515a":"#00ab55",boxShadow:"0 4px 20px rgba(0,0,0,0.15)",animation:"toastSlideIn 0.25s ease-out",display:"flex",alignItems:"center",gap:"8px",transition:"bottom 0.3s ease"},children:[e.jsx("svg",{viewBox:"0 0 24 24",fill:"none",style:{width:16,height:16,flexShrink:0},children:he.type==="error"?e.jsx("path",{d:"M12 8V12M12 16H12.01M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"}):e.jsx("path",{d:"M5 13L9 17L19 7",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round"})}),he.message]}),e.jsx("style",{children:`
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
            `})]})}function Ye(){document.querySelectorAll('[data-island="records-grid"]').forEach(t=>{if(t.dataset.mounted==="1")return;t.dataset.mounted="1";const o={accountId:t.dataset.accountId,accountNumber:t.dataset.accountNumber,entityId:t.dataset.entityId,viewId:t.dataset.viewId,entityName:t.dataset.entityName||"Records",entityNamePlural:t.dataset.entityNamePlural||"",entitySlug:t.dataset.entitySlug||"records"};console.log("[RecordsGrid Island] Mounting:",o),nt(t).render(e.jsx(We.StrictMode,{children:e.jsx(Xt,{...o})}))})}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",Ye):Ye();
