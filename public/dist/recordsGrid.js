import{r as a,j as e,a as Fe,R as Pe,c as Yt}from"./chunks/client-CkWOIrXP.js";import{u as Zt}from"./chunks/index-CjVSFo3p.js";import{r as je,c as Ee}from"./chunks/recordLinks-DUrwwpKP.js";import{C as Nt}from"./chunks/CardRenderer-Bls-eMou.js";import{u as Xt,a as tt,D as Gt,c as Qt,b as er,d as tr,s as rr,K as sr,T as ar,M as ir,e as nr,S as or,v as lr,f as dr,C as cr}from"./chunks/sortable.esm-DQ9-A8Dw.js";const ut=[{id:"table",label:"Tableau",icon:e.jsxs("svg",{viewBox:"0 0 24 24",fill:"none",className:"h-4 w-4",children:[e.jsx("path",{d:"M3 7H21",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"}),e.jsx("path",{d:"M3 12H21",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"}),e.jsx("path",{d:"M3 17H21",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"})]})},{id:"kanban",label:"Kanban",icon:e.jsxs("svg",{viewBox:"0 0 24 24",fill:"none",className:"h-4 w-4",children:[e.jsx("rect",{x:"3",y:"3",width:"5",height:"18",rx:"1",stroke:"currentColor",strokeWidth:"1.5"}),e.jsx("rect",{x:"10",y:"3",width:"5",height:"12",rx:"1",stroke:"currentColor",strokeWidth:"1.5"}),e.jsx("rect",{x:"17",y:"3",width:"4",height:"15",rx:"1",stroke:"currentColor",strokeWidth:"1.5"})]})},{id:"notes",label:"Notes",icon:e.jsxs("svg",{viewBox:"0 0 24 24",fill:"none",className:"h-4 w-4",children:[e.jsx("path",{d:"M2 12C2 7.28595 2 4.92893 3.46447 3.46447C4.92893 2 7.28595 2 12 2C16.714 2 19.0711 2 20.5355 3.46447C22 4.92893 22 7.28595 22 12C22 16.714 22 19.0711 20.5355 20.5355C19.0711 22 16.714 22 12 22C7.28595 22 4.92893 22 3.46447 20.5355C2 19.0711 2 16.714 2 12Z",stroke:"currentColor",strokeWidth:"1.5"}),e.jsx("path",{opacity:"0.5",d:"M2 12H22",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"}),e.jsx("path",{opacity:"0.5",d:"M12 2V22",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"})]})},{id:"calendar",label:"Calendrier",icon:e.jsxs("svg",{viewBox:"0 0 24 24",fill:"none",className:"h-4 w-4",children:[e.jsx("rect",{x:"3",y:"4",width:"18",height:"18",rx:"2",stroke:"currentColor",strokeWidth:"1.5"}),e.jsx("path",{d:"M16 2V6M8 2V6M3 10H21",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"}),e.jsx("circle",{cx:"12",cy:"16",r:"1",fill:"currentColor"}),e.jsx("circle",{cx:"16",cy:"16",r:"1",fill:"currentColor"}),e.jsx("circle",{cx:"8",cy:"16",r:"1",fill:"currentColor"})]})}];function ur({searchQuery:t,onSearch:r,columns:i,preferences:s,onPreferencesChange:n,loading:y,accountNumber:o,entitySlug:g,viewId:v,showSidebar:p,onToggleSidebar:b,activeView:h,onViewChange:_,enabledViews:w=["table","kanban","notes"],onEnabledViewsChange:N,hasActiveFilters:R=!1,onOpenViewFilters:ee,onOpenPipelineConfig:m}){var ie,x,T;const[U,J]=a.useState(!1),[re,Z]=a.useState(!1),[te,z]=a.useState(!1),[u,V]=a.useState(!1),[S,L]=a.useState(""),c=a.useRef(null),O=a.useRef(null),K=a.useRef(null),se=a.useRef(null),D=a.useRef(null),le=a.useRef(null),ge=a.useRef(null),M=a.useRef(null),C=()=>{J(!1),Z(!1),z(!1),V(!1)};a.useEffect(()=>{const l=B=>{B.key==="Escape"&&C()};return document.addEventListener("keydown",l),()=>document.removeEventListener("keydown",l)},[]);const P=(l,B,H,Q)=>{a.useEffect(()=>{const q=X=>{l&&B.current&&!B.current.contains(X.target)&&H.current&&!H.current.contains(X.target)&&Q(!1)};return l&&setTimeout(()=>document.addEventListener("mousedown",q),0),()=>document.removeEventListener("mousedown",q)},[l])};P(U,D,c,J),P(re,le,O,Z),P(te,ge,K,z),P(u,M,se,V);const k=l=>{if(l==="table")return;const B=w.includes(l)?w.filter(H=>H!==l):[...w,l];N(B),h===l&&!B.includes(l)&&_("table")},j=ut.filter(l=>w.includes(l.id)),F=l=>{const B=s.columns.some(Q=>Q.id===l);let H;B?H=s.columns.map(Q=>Q.id===l?{...Q,visible:!Q.visible}:Q):H=[...s.columns,{id:l,visible:!1}],n("columns",H)},I=l=>{if(!(l!=null&&l.current))return{top:0,right:0};const B=l.current.getBoundingClientRect();return{top:B.bottom+8,right:window.innerWidth-B.right}},ce=S.trim()?i.filter(l=>l.name.toLowerCase().includes(S.toLowerCase())):i;return e.jsxs("div",{className:"dataTable-top flex flex-col items-stretch mb-0 justify-between gap-2 sm:flex-row sm:items-center",children:[e.jsxs("div",{className:"flex w-full min-w-0 flex-wrap items-center gap-2 sm:w-auto sm:flex-nowrap",children:[e.jsxs("button",{type:"button",onClick:async()=>{try{const B=await(await fetch(`/account/${o}/record/api/create-draft`,{method:"POST",headers:{"Content-Type":"application/json"},credentials:"include",body:JSON.stringify({entitySlug:g,viewId:v})})).json();B.success&&B._id&&(window.location.href=je(o,g,B._id,"fiche"))}catch(l){console.error("[CreateDraft]",l)}},className:"btn-add-expandable block rounded-full p-2 bg-white-light/40 hover:bg-white-light/90 hover:text-primary dark:bg-dark/40 dark:hover:bg-dark/60",title:"Ajouter",children:[e.jsx("svg",{className:"btn-add-icon",viewBox:"0 0 24 24",fill:"none",children:e.jsx("path",{d:"M12 5V19M5 12H19",stroke:"currentColor",strokeWidth:"2.5",strokeLinecap:"round"})}),e.jsx("span",{className:"btn-add-label",children:"Ajouter"})]}),e.jsxs("button",{type:"button",onClick:()=>{window.location.href=`/account/${o}/record/${g}/import`},className:"btn-add-expandable block rounded-full p-2 bg-white-light/40 hover:bg-white-light/90 hover:text-primary dark:bg-dark/40 dark:hover:bg-dark/60",title:"Importer des donnees",children:[e.jsxs("svg",{className:"btn-add-icon",viewBox:"0 0 24 24",fill:"none",children:[e.jsx("path",{d:"M12 3V15",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round"}),e.jsx("path",{d:"M7 10L12 15L17 10",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round"}),e.jsx("path",{d:"M5 21H19",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round"})]}),e.jsx("span",{className:"btn-add-label",children:"Importer"})]}),e.jsxs("div",{className:"records-toolbar-search dataTable-search relative min-w-[180px] flex-1 sm:w-64 sm:flex-none",style:{marginLeft:0},children:[e.jsxs("svg",{className:"records-toolbar-search-icon pointer-events-none absolute top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400",viewBox:"0 0 24 24",fill:"none",children:[e.jsx("circle",{cx:"11",cy:"11",r:"8",stroke:"currentColor",strokeWidth:"1.5"}),e.jsx("path",{d:"M16.5 16.5L21 21",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"})]}),e.jsx("input",{type:"text",value:t,onChange:l=>r(l.target.value),placeholder:"Rechercher...",className:"records-toolbar-search-input dataTable-input form-input w-full pr-10"}),y&&e.jsx("div",{className:"absolute right-3 top-1/2 -translate-y-1/2",children:e.jsx("div",{className:"animate-spin rounded-full h-4 w-4 border-b-2 border-primary"})})]})]}),e.jsxs("div",{className:"flex w-full min-w-0 flex-wrap items-center gap-2 sm:w-auto sm:justify-end",children:[j.map(l=>e.jsx("button",{type:"button",onClick:()=>_(l.id),title:l.label,className:`block rounded-full p-2 transition-all ${h===l.id?"bg-primary/20 text-primary":"bg-white-light/40 hover:bg-white-light/90 hover:text-primary dark:bg-dark/40 dark:hover:bg-dark/60"}`,children:l.icon},l.id)),h==="kanban"&&e.jsx("button",{type:"button",onClick:()=>{C(),m==null||m()},className:"block rounded-full p-2 transition-all bg-white-light/40 hover:bg-white-light/90 hover:text-primary dark:bg-dark/40 dark:hover:bg-dark/60",title:"Configurer la pipeline",children:e.jsxs("svg",{className:"h-4 w-4",viewBox:"0 0 24 24",fill:"none",children:[e.jsx("path",{d:"M4 6H20M4 12H20M4 18H20",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"}),e.jsx("path",{d:"M8 4V8M15 10V14M11 16V20",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"})]})}),e.jsx("button",{ref:se,type:"button",onClick:()=>{V(!u),J(!1),Z(!1),z(!1)},className:`block rounded-full p-2 transition-all ${u?"bg-primary/20 text-primary":"bg-white-light/40 hover:bg-white-light/90 hover:text-primary dark:bg-dark/40 dark:hover:bg-dark/60"}`,title:"Configurer les vues",children:e.jsxs("svg",{className:"h-4 w-4",viewBox:"0 0 24 24",fill:"none",children:[e.jsx("circle",{cx:"12",cy:"12",r:"3",stroke:"currentColor",strokeWidth:"1.5"}),e.jsx("path",{d:"M12 2V4M12 20V22M2 12H4M20 12H22M4.93 4.93L6.34 6.34M17.66 17.66L19.07 19.07M4.93 19.07L6.34 17.66M17.66 6.34L19.07 4.93",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"})]})}),e.jsx("div",{className:"hidden w-px h-5 bg-gray-200 dark:bg-gray-700 mx-0.5 sm:block"}),e.jsx("button",{type:"button",onClick:ee,className:`block rounded-full p-2 transition-all ${R?"bg-primary/20 text-primary":"bg-white-light/40 hover:bg-white-light/90 hover:text-primary dark:bg-dark/40 dark:hover:bg-dark/60"}`,title:"Configurer les filtres de la vue",children:e.jsx("svg",{className:"h-4 w-4",viewBox:"0 0 24 24",fill:"none",children:e.jsx("path",{d:"M22 3H2L10 12.46V19L14 21V12.46L22 3Z",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round"})})}),h==="table"&&(()=>{var B,H;const l=((B=s.sort)==null?void 0:B.field)!=="createdAt"||((H=s.sort)==null?void 0:H.direction)!=="desc";return e.jsx("button",{ref:O,type:"button",onClick:()=>{Z(!re),J(!1),z(!1),V(!1)},className:`block rounded-full p-2 transition-all ${re||l?"bg-primary/20 text-primary":"bg-white-light/40 hover:bg-white-light/90 hover:text-primary dark:bg-dark/40 dark:hover:bg-dark/60"}`,title:"Trier",children:e.jsxs("svg",{className:"h-4 w-4",viewBox:"0 0 24 24",fill:"none",children:[e.jsx("path",{d:"M16 18L16 6M16 6L20 10M16 6L12 10",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round"}),e.jsx("path",{d:"M8 6L8 18M8 18L12 14M8 18L4 14",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round"})]})})})(),e.jsx("button",{ref:c,type:"button",onClick:()=>{J(!U),Z(!1),z(!1),V(!1)},className:`block rounded-full p-2 transition-all ${U?"bg-primary/20 text-primary":"bg-white-light/40 hover:bg-white-light/90 hover:text-primary dark:bg-dark/40 dark:hover:bg-dark/60"}`,title:"Mode d'affichage",children:e.jsxs("svg",{className:"h-4 w-4",viewBox:"0 0 24 24",fill:"none",children:[e.jsx("path",{d:"M3 7H21",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"}),e.jsx("path",{d:"M6 12H18",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"}),e.jsx("path",{d:"M10 17H14",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"})]})}),h==="table"&&e.jsx("button",{ref:K,type:"button",onClick:()=>{z(!te),J(!1),Z(!1),V(!1)},className:`block rounded-full p-2 transition-all ${te?"bg-primary/20 text-primary":"bg-white-light/40 hover:bg-white-light/90 hover:text-primary dark:bg-dark/40 dark:hover:bg-dark/60"}`,title:"Colonnes visibles",children:e.jsxs("svg",{className:"h-4 w-4",viewBox:"0 0 24 24",fill:"none",children:[e.jsx("path",{d:"M9 3H4C3.44772 3 3 3.44772 3 4V11C3 11.5523 3.44772 12 4 12H9C9.55228 12 10 11.5523 10 11V4C10 3.44772 9.55228 3 9 3Z",stroke:"currentColor",strokeWidth:"1.5"}),e.jsx("path",{d:"M20 3H15C14.4477 3 14 3.44772 14 4V7C14 7.55228 14.4477 8 15 8H20C20.5523 8 21 7.55228 21 7V4C21 3.44772 20.5523 3 20 3Z",stroke:"currentColor",strokeWidth:"1.5"}),e.jsx("path",{d:"M20 12H15C14.4477 12 14 12.4477 14 13V20C14 20.5523 14.4477 21 15 21H20C20.5523 21 21 20.5523 21 20V13C21 12.4477 20.5523 12 20 12Z",stroke:"currentColor",strokeWidth:"1.5"}),e.jsx("path",{d:"M9 16H4C3.44772 16 3 16.4477 3 17V20C3 20.5523 3.44772 21 4 21H9C9.55228 21 10 20.5523 10 20V17C10 16.4477 9.55228 16 9 16Z",stroke:"currentColor",strokeWidth:"1.5"})]})}),e.jsxs("button",{type:"button",onClick:b,className:"btn-sidebar-toggle block rounded-full p-2 bg-white-light/40 hover:bg-white-light/90 hover:text-primary dark:bg-dark/40 dark:hover:bg-dark/60",title:p?"Masquer le panneau":"Afficher le panneau",children:[e.jsxs("svg",{className:"btn-sidebar-icon",viewBox:"0 0 24 24",fill:"none",children:[e.jsx("rect",{x:"3",y:"3",width:"18",height:"18",rx:"2",stroke:"currentColor",strokeWidth:"1.5"}),e.jsx("path",{d:"M9 3V21",stroke:"currentColor",strokeWidth:"1.5"})]}),e.jsx("span",{className:"btn-sidebar-label",children:p?"Masquer":"Panneau"})]})]}),re&&Fe.createPortal(e.jsxs(e.Fragment,{children:[e.jsx("div",{className:"fixed inset-0",style:{zIndex:9998},onClick:()=>Z(!1)}),e.jsxs("div",{ref:le,className:"fixed rounded-xl shadow-xl p-4 w-72 bg-white dark:bg-[#0e1726] border border-gray-100 dark:border-white/10",style:{zIndex:9999,top:I(O).top,right:I(O).right,animation:"popoverSlide 0.15s ease-out"},children:[e.jsx("div",{className:"text-xs font-medium text-gray-500 dark:text-white-dark mb-2",children:"Trier par"}),e.jsxs("div",{className:"flex gap-2",children:[e.jsxs("select",{value:((ie=s.sort)==null?void 0:ie.field)||"createdAt",onChange:l=>n("sort",{...s.sort,field:l.target.value}),className:"flex-1 px-2 py-1.5 text-xs border border-gray-200 dark:border-white/10 rounded-lg bg-white dark:bg-[#1b2e4b] text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary/50",children:[e.jsx("option",{value:"createdAt",children:"Date de création"}),e.jsx("option",{value:"title",children:"Titre"}),i.filter(l=>l.id!=="title"&&l.id!=="actions").map(l=>e.jsx("option",{value:l.id,children:l.name},l.id))]}),e.jsx("button",{onClick:()=>{var l;return n("sort",{...s.sort,direction:((l=s.sort)==null?void 0:l.direction)==="asc"?"desc":"asc"})},className:"p-1.5 border border-gray-200 dark:border-white/10 rounded-lg bg-white dark:bg-[#1b2e4b] hover:bg-gray-50 dark:hover:bg-[#253b5c] transition-all",title:((x=s.sort)==null?void 0:x.direction)==="asc"?"Croissant":"Décroissant",children:e.jsx("svg",{className:`h-4 w-4 text-gray-600 dark:text-white transition-transform ${((T=s.sort)==null?void 0:T.direction)==="asc"?"rotate-180":""}`,viewBox:"0 0 24 24",fill:"none",children:e.jsx("path",{d:"M12 5V19M12 19L6 13M12 19L18 13",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round"})})}),e.jsx("button",{onClick:()=>n("sort",{field:"createdAt",direction:"desc"}),className:"p-1.5 border border-gray-200 dark:border-white/10 rounded-lg bg-white dark:bg-[#1b2e4b] hover:bg-red-50 hover:border-red-300 hover:text-red-500 dark:hover:bg-red-900/20 transition-all",title:"Réinitialiser le tri",children:e.jsxs("svg",{className:"h-4 w-4 text-gray-600 dark:text-white",viewBox:"0 0 24 24",fill:"none",children:[e.jsx("path",{d:"M4.06189 13C4.02104 12.6724 4 12.3387 4 12C4 7.58172 7.58172 4 12 4C14.5006 4 16.7332 5.14727 18.2002 6.94416M19.9381 11C19.979 11.3276 20 11.6613 20 12C20 16.4183 16.4183 20 12 20C9.49944 20 7.26681 18.8527 5.79984 17.0558",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round"}),e.jsx("path",{d:"M15 7H19V3",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round"}),e.jsx("path",{d:"M9 17H5V21",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round"})]})})]})]})]}),document.body),U&&Fe.createPortal(e.jsxs(e.Fragment,{children:[e.jsx("div",{className:"fixed inset-0",style:{zIndex:9998},onClick:()=>J(!1)}),e.jsxs("div",{ref:D,className:"fixed rounded-xl shadow-xl p-4 w-72 bg-white dark:bg-[#0e1726] border border-gray-100 dark:border-white/10",style:{zIndex:9999,top:I(c).top,right:I(c).right,animation:"popoverSlide 0.15s ease-out"},children:[e.jsxs("div",{className:"mb-4",children:[e.jsx("div",{className:"text-xs font-medium text-gray-500 dark:text-white-dark mb-2",children:"Densité"}),e.jsx("div",{className:"flex gap-1",children:["compact","normal","comfortable"].map(l=>e.jsx("button",{onClick:()=>n("density",l),className:`flex-1 px-2 py-1.5 text-xs rounded-lg transition-all ${s.density===l?"bg-primary text-white":"bg-gray-100 dark:bg-dark/40 text-gray-600 dark:text-white-dark/70 hover:bg-gray-200 dark:hover:bg-dark/60"}`,children:l==="compact"?"Compact":l==="normal"?"Normal":"Confort"},l))})]}),e.jsxs("div",{className:"mb-4",children:[e.jsx("div",{className:"text-xs font-medium text-gray-500 dark:text-white-dark mb-2",children:"Lignes par page"}),e.jsx("div",{className:"flex gap-1",children:[10,25,50,100].map(l=>e.jsx("button",{onClick:()=>n("pageSize",l),className:`flex-1 px-2 py-1.5 text-xs rounded-lg transition-all ${s.pageSize===l?"bg-primary text-white":"bg-gray-100 dark:bg-dark/40 text-gray-600 dark:text-white-dark/70 hover:bg-gray-200 dark:hover:bg-dark/60"}`,children:l},l))})]})]})]}),document.body),te&&Fe.createPortal(e.jsxs(e.Fragment,{children:[e.jsx("div",{className:"fixed inset-0",style:{zIndex:9998},onClick:()=>z(!1)}),e.jsxs("div",{ref:ge,className:"fixed rounded-xl shadow-xl p-4 w-64 bg-white dark:bg-[#0e1726] border border-gray-100 dark:border-white/10",style:{zIndex:9999,top:I(K).top,right:I(K).right,animation:"popoverSlide 0.15s ease-out"},children:[e.jsx("div",{className:"text-xs font-medium text-gray-500 dark:text-white-dark mb-2",children:"Colonnes visibles"}),e.jsx("div",{className:"relative mb-2",children:e.jsx("input",{type:"text",value:S,onChange:l=>L(l.target.value),placeholder:"Filtrer...",className:"w-full px-3 py-1.5 text-xs border border-gray-200 dark:border-white/10 rounded-lg bg-white dark:bg-[#1b2e4b] text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary/50"})}),e.jsx("div",{className:"space-y-0.5 max-h-48 overflow-y-auto",children:ce.map(l=>{const B=s.columns.find(Q=>Q.id===l.id),H=B?B.visible!==!1:!0;return e.jsxs("label",{className:"flex items-center gap-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 px-2 py-1.5 rounded-lg",children:[e.jsx("input",{type:"checkbox",checked:H,onChange:()=>F(l.id),className:"form-checkbox text-primary w-3.5 h-3.5 rounded"}),e.jsx("span",{className:"text-xs text-gray-700 dark:text-gray-300",children:l.name})]},l.id)})}),e.jsx("div",{className:"border-t border-gray-100 dark:border-white/10 mt-3 mb-2"}),e.jsxs("div",{children:[e.jsx("div",{className:"text-xs font-medium text-gray-500 dark:text-white-dark mb-2",children:"Affichage titre"}),e.jsx("div",{className:"flex gap-1",children:[{value:"avatar",label:"Avatar"},{value:"icon",label:"Icône"},{value:"none",label:"Aucun"}].map(l=>e.jsx("button",{onClick:()=>n("titleDisplay",l.value),className:`flex-1 px-2 py-1.5 text-xs rounded-lg transition-all ${(s.titleDisplay||"avatar")===l.value?"bg-primary text-white":"bg-gray-100 dark:bg-dark/40 text-gray-600 dark:text-white-dark/70 hover:bg-gray-200 dark:hover:bg-dark/60"}`,children:l.label},l.value))})]}),e.jsx("div",{className:"border-t border-gray-100 dark:border-white/10 mt-3 mb-2"}),e.jsx("div",{children:e.jsxs("div",{className:"flex items-center justify-between",children:[e.jsx("span",{className:"text-xs font-medium text-gray-500 dark:text-white-dark",children:"Sélection multiple"}),e.jsx("button",{type:"button",onClick:()=>n("showCheckboxes",s.showCheckboxes===!1),style:{position:"relative",width:36,height:20,borderRadius:10,border:"none",cursor:"pointer",transition:"background 0.2s ease",background:s.showCheckboxes!==!1?"#4361ee":"#d1d5db",padding:0},children:e.jsx("span",{style:{position:"absolute",top:2,left:s.showCheckboxes!==!1?18:2,width:16,height:16,borderRadius:"50%",background:"#fff",boxShadow:"0 1px 3px rgba(0,0,0,0.2)",transition:"left 0.2s ease"}})})]})})]})]}),document.body),u&&Fe.createPortal(e.jsxs(e.Fragment,{children:[e.jsx("div",{className:"fixed inset-0",style:{zIndex:9998},onClick:()=>V(!1)}),e.jsxs("div",{ref:M,className:"fixed rounded-xl shadow-xl p-4 w-64 bg-white dark:bg-[#0e1726] border border-gray-100 dark:border-white/10",style:{zIndex:9999,top:I(se).top,right:I(se).right,animation:"popoverSlide 0.15s ease-out"},children:[e.jsx("div",{className:"text-xs font-medium text-gray-500 dark:text-white-dark mb-3",children:"Vues disponibles"}),e.jsx("div",{className:"space-y-1",children:ut.map(l=>{const B=w.includes(l.id),H=l.id==="table";return e.jsxs("label",{className:`flex items-center gap-3 cursor-pointer px-2 py-2 rounded-lg transition-all ${H?"opacity-60 cursor-not-allowed":"hover:bg-gray-50 dark:hover:bg-gray-800"}`,children:[e.jsx("input",{type:"checkbox",checked:B,onChange:()=>k(l.id),disabled:H,className:"form-checkbox text-primary w-4 h-4 rounded"}),e.jsxs("span",{className:`flex items-center gap-2 text-sm ${B?"text-gray-700 dark:text-gray-300":"text-gray-400 dark:text-gray-600"}`,children:[l.icon,l.label]})]},l.id)})}),e.jsx("div",{className:"border-t border-gray-100 dark:border-white/10 mt-3 pt-2",children:e.jsx("p",{className:"text-[10px] text-gray-400 dark:text-gray-600",children:"Le tableau est toujours activé par défaut."})})]})]}),document.body),e.jsx("style",{children:`
                @keyframes popoverSlide {
                    from { opacity: 0; transform: translateY(-4px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .records-toolbar-search .records-toolbar-search-icon {
                    left: 14px !important;
                }
                .records-toolbar-search .records-toolbar-search-input,
                .records-toolbar-search input.records-toolbar-search-input {
                    padding-left: 42px !important;
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
            `})]})}function pr({records:t,columns:r,virtualizer:i,sort:s,onSort:n,onColumnReorder:y,density:o,titleDisplay:g,entityIcon:v,accountNumber:p,entitySlug:b,selectedIds:h,onToggleSelect:_,onSelectAll:w,allPageSelected:N,showCheckboxes:R=!0}){var z;const[ee,m]=a.useState(null),[U,J]=a.useState(null),re=i.getVirtualItems(),Z={compact:{rowHeight:36,cellClass:"py-1",fontSize:"text-xs",imageSize:"w-6 h-6",fontWeight:"font-medium"},normal:{rowHeight:44,cellClass:"py-2",fontSize:"text-sm",imageSize:"w-9 h-9",fontWeight:"font-semibold"},comfortable:{rowHeight:56,cellClass:"py-3",fontSize:"text-sm",imageSize:"w-9 h-9",fontWeight:"font-semibold"}},te=Z[o]||Z.comfortable;return h&&h.size>0,e.jsx(e.Fragment,{children:e.jsxs("table",{className:"table-hover whitespace-nowrap dataTable-table w-full",children:[e.jsx("thead",{className:"sticky top-0 bg-white dark:bg-[#1b2e4b] z-10",children:e.jsxs("tr",{children:[R&&e.jsx("th",{style:{width:40,padding:"0 8px"},children:e.jsxs("label",{className:"bulk-checkbox-wrapper",style:{display:"flex",alignItems:"center",justifyContent:"center"},children:[e.jsx("input",{type:"checkbox",checked:N&&t.length>0,onChange:()=>w&&w(),className:"bulk-checkbox"}),e.jsx("span",{className:"bulk-checkbox-custom"})]})}),r.map(u=>{const V=(s==null?void 0:s.field)===u.id||u.id==="title"&&(s==null?void 0:s.field)==="title"||u.id==="createdAt"&&(s==null?void 0:s.field)==="createdAt",S=(s==null?void 0:s.direction)||"desc",L=ee===u.id,c=U===u.id&&ee!==u.id,O=u.id!=="actions";return e.jsx("th",{"data-sortable":u.sortable!==!1?"":void 0,"data-column-id":u.id,onDragEnter:K=>{K.preventDefault(),u.id!=="actions"&&ee&&ee!==u.id&&J(u.id)},onDragOver:K=>{K.preventDefault()},onDrop:K=>{K.preventDefault(),ee&&ee!==u.id&&u.id!=="actions"&&y&&y(ee,u.id),m(null),J(null)},className:`px-2 ${L?"opacity-50":""} ${c?"border-l-2 border-l-primary bg-primary/5":""}`,style:{transition:"opacity 0.15s, border-color 0.15s, background 0.15s",...u.id==="actions"?{width:"1%",whiteSpace:"nowrap"}:{},...u.id==="title"?{minWidth:220}:{}},children:e.jsxs("div",{className:"flex items-center gap-1",children:[O&&e.jsx("span",{draggable:"true",onDragStart:K=>{m(u.id),K.dataTransfer.effectAllowed="move",K.dataTransfer.setData("text/plain",u.id)},onDragEnd:()=>{m(null),J(null)},className:"cursor-grab text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300",children:e.jsxs("svg",{className:"h-3 w-3",viewBox:"0 0 24 24",fill:"currentColor",children:[e.jsx("circle",{cx:"9",cy:"6",r:"1.5"}),e.jsx("circle",{cx:"15",cy:"6",r:"1.5"}),e.jsx("circle",{cx:"9",cy:"12",r:"1.5"}),e.jsx("circle",{cx:"15",cy:"12",r:"1.5"}),e.jsx("circle",{cx:"9",cy:"18",r:"1.5"}),e.jsx("circle",{cx:"15",cy:"18",r:"1.5"})]})}),u.sortable!==!1?e.jsxs("a",{href:"#",className:"dataTable-sorter flex items-center gap-1",draggable:"false",onClick:K=>{K.preventDefault(),n(u.id)},children:[u.name,V&&e.jsx("svg",{className:`h-3 w-3 text-primary transition-transform ${S==="asc"?"rotate-180":""}`,viewBox:"0 0 24 24",fill:"none",children:e.jsx("path",{d:"M12 5V19M12 19L6 13M12 19L18 13",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round"})})]}):u.name]})},u.id)})]})}),e.jsxs("tbody",{children:[re.length>0&&re[0].start>0&&e.jsx("tr",{children:e.jsx("td",{colSpan:r.length+(R?1:0),style:{height:re[0].start,padding:0}})}),re.map(u=>{const V=t[u.index];if(!V)return null;const S={compact:"4px 8px",normal:"8px 12px",comfortable:"12px 12px"}[o]||"12px 12px",L=h&&h.has(V._id);return e.jsxs("tr",{"data-index":u.index,ref:i.measureElement,style:{minHeight:te.rowHeight},className:L?"bulk-row-selected":"",children:[R&&e.jsx("td",{style:{padding:"0 8px",width:40},children:e.jsxs("label",{className:"bulk-checkbox-wrapper",style:{display:"flex",alignItems:"center",justifyContent:"center"},onClick:c=>{c.preventDefault(),_&&_(V._id,u.index,c.shiftKey)},children:[e.jsx("input",{type:"checkbox",checked:L,readOnly:!0,className:"bulk-checkbox"}),e.jsx("span",{className:"bulk-checkbox-custom"})]})}),r.map(c=>e.jsx("td",{className:`${te.fontSize}`,style:{padding:S,...c.id==="actions"?{width:"1%",whiteSpace:"nowrap"}:{},...c.id==="title"?{minWidth:220}:{}},children:fr(V,c,p,b,te,g,v)},c.id))]},V._id)}),t.length===0&&e.jsx("tr",{children:e.jsx("td",{colSpan:r.length+(R?1:0),className:"text-center py-12 text-gray-500 dark:text-gray-400 font-medium",children:"Aucun enregistrement"})}),re.length>0&&e.jsx("tr",{children:e.jsx("td",{colSpan:r.length+(R?1:0),style:{height:Math.max(0,i.getTotalSize()-(((z=re[re.length-1])==null?void 0:z.end)||0)),padding:0}})})]})]})})}function fr(t,r,i,s,n,y,o){var g,v;switch(r.id){case"title":{const p=t.referenceTitle||t.title||"Sans titre";p.charAt(0).toUpperCase();const b=Math.abs(p.charCodeAt(0)||65)%35+1,h=t.image||`/assets/images/profile-${b}.jpeg`;return e.jsxs("div",{className:"flex items-center gap-2",children:[y==="avatar"&&e.jsx("img",{src:h,alt:p,className:`${n.imageSize} rounded-full max-w-none`}),y==="icon"&&o&&e.jsx("div",{className:`${n.imageSize} rounded-lg max-w-none flex items-center justify-center bg-primary/10 text-primary shrink-0`,children:e.jsx("iconify-icon",{icon:o,width:"16"})}),e.jsx("a",{href:je(i,s,t),className:`${n.fontWeight} hover:text-primary transition-colors truncate`,title:p,children:p})]})}case"createdAt":return new Date(t.createdAt).toLocaleDateString("fr-FR");case"actions":return e.jsxs("div",{className:"flex items-center gap-0",children:[e.jsx("a",{href:je(i,s,t),className:"p-1 rounded-lg text-gray-500 hover:text-primary hover:bg-primary/10 transition-all",title:"Voir",children:e.jsxs("svg",{className:"h-4 w-4",viewBox:"0 0 24 24",fill:"none",children:[e.jsx("path",{d:"M15 12C15 13.6569 13.6569 15 12 15C10.3431 15 9 13.6569 9 12C9 10.3431 10.3431 9 12 9C13.6569 9 15 10.3431 15 12Z",stroke:"currentColor",strokeWidth:"1.5"}),e.jsx("path",{d:"M12 5C7.5 5 3.73 7.94 2 12C3.73 16.06 7.5 19 12 19C16.5 19 20.27 16.06 22 12C20.27 7.94 16.5 5 12 5Z",stroke:"currentColor",strokeWidth:"1.5"})]})}),e.jsx("a",{href:je(i,s,t),className:"p-1 rounded-lg text-gray-500 hover:text-info hover:bg-info/10 transition-all",title:"Modifier",children:e.jsx("svg",{className:"h-4 w-4",viewBox:"0 0 24 24",fill:"none",children:e.jsx("path",{d:"M16.862 4.487L18.55 2.8C19.33 2.02 20.59 2.02 21.37 2.8C22.15 3.58 22.15 4.84 21.37 5.62L19.681 7.307M16.862 4.487L4.162 17.187C3.882 17.467 3.682 17.818 3.592 18.198L2.732 21.596C2.642 21.966 2.952 22.296 3.322 22.226L6.892 21.556C7.242 21.486 7.572 21.306 7.832 21.046L20.513 8.366M16.862 4.487L19.681 7.307",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round"})})}),e.jsx("button",{type:"button",className:"p-1 rounded-lg text-gray-500 hover:text-danger hover:bg-danger/10 transition-all",title:"Supprimer",onClick:()=>{confirm("Êtes-vous sûr de vouloir supprimer cet enregistrement ?")&&console.log("Delete record:",t._id)},children:e.jsxs("svg",{className:"h-4 w-4",viewBox:"0 0 24 24",fill:"none",children:[e.jsx("path",{d:"M20.5 6H3.5",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"}),e.jsx("path",{d:"M18.833 8.5L18.373 15.4C18.196 18.054 18.108 19.381 17.243 20.19C16.378 21 15.048 21 12.387 21H11.613C8.952 21 7.622 21 6.757 20.19C5.892 19.381 5.804 18.054 5.627 15.4L5.167 8.5",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"}),e.jsx("path",{d:"M9.5 11L10 16",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"}),e.jsx("path",{d:"M14.5 11L14 16",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"}),e.jsx("path",{d:"M6.5 6C6.556 5.367 6.612 5.1 6.877 4.714C7.178 4.275 7.945 3.917 9.484 3.2L9.924 2.984C10.683 2.589 11.06 2.392 11.476 2.318C11.823 2.254 12.177 2.254 12.524 2.318C12.94 2.392 13.317 2.589 14.076 2.984L14.516 3.2C16.055 3.917 16.822 4.275 17.123 4.714C17.388 5.1 17.444 5.367 17.5 6",stroke:"currentColor",strokeWidth:"1.5"})]})})]});default:{if(r.id.startsWith("rel:")){const p=r.id.substring(4),h=(((g=t._denorm)==null?void 0:g.relations)||[]).find(w=>w.relationKey===p);if(((v=h==null?void 0:h.records)==null?void 0:v.length)>0)return e.jsx("div",{className:"flex flex-wrap gap-1",children:h.records.map((w,N)=>e.jsx("a",{href:je(i,w.entitySlug||r.targetEntitySlug||s,w),className:"text-primary hover:underline text-xs",children:w.title||"Sans titre"},N))});const _=(t.relations||[]).find(w=>w.relationKey===p);return _!=null&&_.value?"—":""}if(r.id.startsWith("classif:")){const p=r.id.substring(8),b=(t.classificationValues||[]).find(h=>{var w,N,R;return(((w=h.classificationId)==null?void 0:w.$oid)||((R=(N=h.classificationId)==null?void 0:N.toString)==null?void 0:R.call(N))||h.classificationId)===p});if(b!=null&&b.label){const h=b.color||"#888";return e.jsx("span",{className:"inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap",style:{backgroundColor:`${h}15`,color:h,border:`1px solid ${h}30`},children:b.label})}return b!=null&&b.value?e.jsx("span",{className:"inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20",children:b.value}):""}if(r.computed&&t._computedFields){const p=t._computedFields[r.id];if(!p||p.value===null||p.value===void 0)return"—";const b=r.computedDisplay||"text",h=r.computedColor||"#4361ee";if(b==="badge")return e.jsx("span",{className:"inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap",style:{background:`${h}15`,color:h,border:`1px solid ${h}30`},children:p.formatted||p.value});if(b==="currency")return e.jsx("span",{style:{fontWeight:600,color:"#334155"},children:p.formatted||`${Number(p.value).toFixed(2)} €`});if(b==="stars"){const _=Number(p.value)||0,w=Number(p.max)||5;return e.jsxs("span",{style:{display:"inline-flex",alignItems:"center",gap:1},children:[Array.from({length:Math.floor(_)}).map((N,R)=>e.jsx("iconify-icon",{icon:"solar:star-bold",width:"14",style:{color:"#f59e0b"}},`f${R}`)),_-Math.floor(_)>=.5&&e.jsx("iconify-icon",{icon:"solar:star-bold-duotone",width:"14",style:{color:"#f59e0b"}}),Array.from({length:w-Math.ceil(_)}).map((N,R)=>e.jsx("iconify-icon",{icon:"solar:star-line-duotone",width:"14",style:{color:"#e2e8f0"}},`e${R}`)),e.jsx("span",{style:{fontSize:11,color:"#9ca3af",marginLeft:4},children:p.formatted})]})}if(b==="progress"){const _=Math.min(Math.max(Number(p.percentage||p.value)||0,0),100),w=_>=80?"#10b981":_>=50?"#f59e0b":"#ef4444";return e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:6,minWidth:80},children:[e.jsx("div",{style:{flex:1,height:5,background:"#e2e8f0",borderRadius:3,overflow:"hidden"},children:e.jsx("div",{style:{width:`${_}%`,height:"100%",background:w,borderRadius:3}})}),e.jsxs("span",{style:{fontSize:11,fontWeight:600,color:w},children:[_,"%"]})]})}return p.formatted||p.value||""}if(t.customFields){const p=t.customFields.find(h=>{var w;const _=((w=h.field_id)==null?void 0:w._id)||h.field_id;return(_==null?void 0:_.toString())===r.id});if(!p)return"";const b=p.value;if(b&&typeof b=="object"&&b._v){const h=[];return Object.entries(b).forEach(([_,w])=>{_==="_v"||_==="customText"||(Array.isArray(w)?w.forEach(N=>h.push(N)):w&&h.push(w))}),b.customText&&h.push(b.customText),e.jsx("div",{className:"flex flex-wrap gap-1",children:h.map((_,w)=>e.jsx("span",{className:"inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20",children:_},w))})}return b||""}return""}}}function pt(t,r=.1){if(!t)return`rgba(99, 102, 241, ${r})`;const i=parseInt(t.slice(1,3),16),s=parseInt(t.slice(3,5),16),n=parseInt(t.slice(5,7),16);return`rgba(${i}, ${s}, ${n}, ${r})`}function hr({field:t,record:r}){const i=(r.customFields||[]).find(n=>{var o;const y=((o=n.field_id)==null?void 0:o._id)||n.field_id;return(y==null?void 0:y.toString())===t.id});if(!i)return e.jsx("span",{className:"text-gray-400 dark:text-gray-600 text-sm italic",children:"—"});const s=i.value;if(s==null||s==="")return e.jsx("span",{className:"text-gray-400 dark:text-gray-600 text-sm italic",children:"—"});if(t.type==="date"||t.type==="datetime")try{return e.jsx("span",{className:"text-sm text-gray-700 dark:text-gray-300",children:new Date(s).toLocaleDateString("fr-FR")})}catch{return e.jsx("span",{className:"text-sm text-gray-700 dark:text-gray-300",children:String(s)})}return t.type==="boolean"||t.type==="checkbox"?e.jsxs("span",{className:`inline-flex items-center gap-1 text-sm ${s?"text-success":"text-gray-400"}`,children:[s?e.jsxs("svg",{width:"16",height:"16",viewBox:"0 0 24 24",fill:"none",children:[e.jsx("path",{d:"M9 12l2 2 4-4",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round"}),e.jsx("circle",{cx:"12",cy:"12",r:"10",stroke:"currentColor",strokeWidth:"1.5"})]}):e.jsx("svg",{width:"16",height:"16",viewBox:"0 0 24 24",fill:"none",children:e.jsx("circle",{cx:"12",cy:"12",r:"10",stroke:"currentColor",strokeWidth:"1.5"})}),s?"Oui":"Non"]}):t.type==="relation"?Array.isArray(s)?e.jsx("div",{className:"flex flex-wrap gap-1",children:s.map((n,y)=>e.jsx("span",{className:"inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-primary/10 text-primary font-medium",children:n.title||n.label||n.name||String(n)},y))}):e.jsx("span",{className:"text-sm text-gray-700 dark:text-gray-300",children:s.title||s.label||String(s)}):t.type==="number"?e.jsx("span",{className:"text-sm font-mono text-gray-700 dark:text-gray-300",children:Number(s).toLocaleString("fr-FR")}):e.jsx("span",{className:"text-sm text-gray-700 dark:text-gray-300",children:String(s)})}function xr({record:t,columns:r,accountNumber:i,entitySlug:s,onClose:n}){var ee;const y=a.useRef(null),[o,g]=a.useState(!1);a.useEffect(()=>{requestAnimationFrame(()=>g(!0))},[]);const v=a.useCallback(()=>{g(!1),setTimeout(()=>n(),250)},[n]);if(a.useEffect(()=>{const m=U=>{U.key==="Escape"&&v()};return document.addEventListener("keydown",m),()=>document.removeEventListener("keydown",m)},[v]),!t)return null;(ee=t._id)!=null&&ee.$oid||t._id;const p=t.referenceTitle||t.title||t.computedTitle||"Sans titre",b=t.description||"",h=t.createdAt?new Date(t.createdAt).toLocaleDateString("fr-FR",{day:"2-digit",month:"long",year:"numeric"}):null,_=t.updatedAt?new Date(t.updatedAt).toLocaleDateString("fr-FR",{day:"2-digit",month:"long",year:"numeric"}):null,w=(t.classificationValues||[]).filter(m=>m.optionLabel||m.label).map(m=>({label:m.optionLabel||m.label,color:m.optionColor||m.color||"#6366f1",classificationName:m.classificationName||"Classification"})),N={};w.forEach(m=>{N[m.classificationName]||(N[m.classificationName]=[]),N[m.classificationName].push(m)});const R=r.filter(m=>m.id!=="title"&&m.id!=="actions"&&!m.id.startsWith("class:"));return Fe.createPortal(e.jsxs(e.Fragment,{children:[e.jsx("div",{className:`fixed inset-0 bg-black/40 backdrop-blur-[2px] transition-opacity duration-250 ${o?"opacity-100":"opacity-0"}`,style:{zIndex:1e4},onMouseDown:v,onTouchEnd:m=>{m.preventDefault(),v()}}),e.jsxs("div",{ref:y,className:`fixed right-0 top-0 h-full bg-white dark:bg-[#0e1726] shadow-2xl border-l border-gray-200 dark:border-gray-700 flex flex-col transition-transform duration-250 ease-out ${o?"translate-x-0":"translate-x-full"}`,style:{zIndex:10001,width:"min(520px, 90vw)"},onClick:m=>m.stopPropagation(),children:[e.jsxs("div",{className:"flex items-center justify-between gap-3 px-6 py-4 border-b border-gray-100 dark:border-gray-700/50 flex-shrink-0",children:[e.jsxs("div",{className:"flex items-center gap-2 min-w-0",children:[e.jsx("div",{className:"w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0",children:e.jsxs("svg",{width:"16",height:"16",viewBox:"0 0 24 24",fill:"none",children:[e.jsx("path",{d:"M2 12C2 7.28595 2 4.92893 3.46447 3.46447C4.92893 2 7.28595 2 12 2C16.714 2 19.0711 2 20.5355 3.46447C22 4.92893 22 7.28595 22 12C22 16.714 22 19.0711 20.5355 20.5355C19.0711 22 16.714 22 12 22C7.28595 22 4.92893 22 3.46447 20.5355C2 19.0711 2 16.714 2 12Z",stroke:"#4361ee",strokeWidth:"1.5"}),e.jsx("path",{d:"M8 12H16M12 8V16",stroke:"#4361ee",strokeWidth:"1.5",strokeLinecap:"round"})]})}),e.jsx("h3",{className:"text-base font-semibold text-gray-900 dark:text-white truncate",children:p})]}),e.jsxs("div",{className:"flex items-center gap-1 flex-shrink-0",children:[e.jsx("a",{href:je(i,s,t),className:"p-2 rounded-lg text-gray-400 hover:text-primary hover:bg-primary/10 transition-all",title:"Ouvrir la page complète",children:e.jsxs("svg",{width:"16",height:"16",viewBox:"0 0 24 24",fill:"none",children:[e.jsx("path",{d:"M10 4H6C4.89543 4 4 4.89543 4 6V18C4 19.1046 4.89543 20 6 20H18C19.1046 20 20 19.1046 20 18V14",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"}),e.jsx("path",{d:"M14 4H20V10",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round"}),e.jsx("path",{d:"M20 4L11 13",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"})]})}),e.jsx("a",{href:je(i,s,t),className:"p-2 rounded-lg text-gray-400 hover:text-info hover:bg-info/10 transition-all",title:"Modifier",children:e.jsx("svg",{width:"16",height:"16",viewBox:"0 0 24 24",fill:"none",children:e.jsx("path",{d:"M16.862 4.487L18.55 2.8C19.33 2.02 20.59 2.02 21.37 2.8C22.15 3.58 22.15 4.84 21.37 5.62L19.681 7.307M16.862 4.487L4.162 17.187C3.882 17.467 3.682 17.818 3.592 18.198L2.732 21.596C2.642 21.966 2.952 22.296 3.322 22.226L6.892 21.556C7.242 21.486 7.572 21.306 7.832 21.046L20.513 8.366",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"})})}),e.jsx("button",{onClick:v,className:"p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all",title:"Fermer",children:e.jsx("svg",{width:"16",height:"16",viewBox:"0 0 24 24",fill:"none",children:e.jsx("path",{d:"M18 6L6 18M6 6L18 18",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round"})})})]})]}),e.jsxs("div",{className:"flex-1 overflow-y-auto",children:[Object.keys(N).length>0&&e.jsx("div",{className:"px-6 py-4 border-b border-gray-100 dark:border-gray-700/50",children:Object.entries(N).map(([m,U])=>e.jsxs("div",{className:"mb-3 last:mb-0",children:[e.jsx("div",{className:"text-[11px] uppercase tracking-wider font-semibold text-gray-400 dark:text-gray-500 mb-1.5",children:m}),e.jsx("div",{className:"flex flex-wrap gap-1.5",children:U.map((J,re)=>e.jsxs("span",{className:"inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium transition-all hover:scale-105",style:{backgroundColor:pt(J.color,.15),color:J.color,border:`1px solid ${pt(J.color,.3)}`},children:[e.jsx("span",{className:"w-2 h-2 rounded-full flex-shrink-0",style:{backgroundColor:J.color}}),J.label]},re))})]},m))}),b&&e.jsxs("div",{className:"px-6 py-4 border-b border-gray-100 dark:border-gray-700/50",children:[e.jsx("div",{className:"text-[11px] uppercase tracking-wider font-semibold text-gray-400 dark:text-gray-500 mb-2",children:"Description"}),e.jsx("p",{className:"text-sm text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-wrap",children:b})]}),e.jsxs("div",{className:"px-6 py-4",children:[e.jsx("div",{className:"text-[11px] uppercase tracking-wider font-semibold text-gray-400 dark:text-gray-500 mb-3",children:"Détails"}),e.jsxs("div",{className:"space-y-0",children:[R.map(m=>e.jsxs("div",{className:"flex items-start gap-3 py-2.5 border-b border-gray-50 dark:border-gray-800/50 last:border-0",children:[e.jsx("div",{className:"w-32 flex-shrink-0 text-xs font-medium text-gray-500 dark:text-gray-400 pt-0.5 truncate",children:m.name}),e.jsx("div",{className:"flex-1 min-w-0",children:e.jsx(hr,{field:m,record:t})})]},m.id)),(t.relations||[]).map((m,U)=>{var J;return e.jsxs("div",{className:"flex items-start gap-3 py-2.5 border-b border-gray-50 dark:border-gray-800/50 last:border-0",children:[e.jsx("div",{className:"w-32 flex-shrink-0 text-xs font-medium text-gray-500 dark:text-gray-400 pt-0.5 truncate",children:m.label||m.key||"Relation"}),e.jsx("div",{className:"flex-1 min-w-0",children:((J=m.records)==null?void 0:J.length)>0?e.jsx("div",{className:"flex flex-wrap gap-1",children:m.records.map((re,Z)=>e.jsx("a",{href:je(i,m.entitySlug||s,re),className:"inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-primary/10 text-primary font-medium hover:bg-primary/20 transition-colors",children:re.referenceTitle||re.title||"Sans titre"},Z))}):e.jsx("span",{className:"text-gray-400 dark:text-gray-600 text-sm italic",children:"—"})})]},`rel-${U}`)})]})]})]}),e.jsx("div",{className:"flex-shrink-0 px-6 py-3 border-t border-gray-100 dark:border-gray-700/50 bg-gray-50/50 dark:bg-[#0a0f1e]/50",children:e.jsxs("div",{className:"flex items-center justify-between text-[11px] text-gray-400 dark:text-gray-500",children:[e.jsxs("div",{className:"flex items-center gap-3",children:[h&&e.jsxs("span",{className:"flex items-center gap-1",children:[e.jsxs("svg",{width:"12",height:"12",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"1.5",children:[e.jsx("circle",{cx:"12",cy:"12",r:"10"}),e.jsx("path",{d:"M12 6V12L16 14",strokeLinecap:"round"})]}),"Créé le ",h]}),_&&e.jsxs("span",{className:"flex items-center gap-1",children:[e.jsx("svg",{width:"12",height:"12",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"1.5",children:e.jsx("path",{d:"M4.06 13C4.02 12.67 4 12.34 4 12C4 7.58 7.58 4 12 4C14.5 4 16.73 5.15 18.2 6.94M19.94 11C19.98 11.33 20 11.66 20 12C20 16.42 16.42 20 12 20C9.5 20 7.27 18.85 5.8 17.06",strokeLinecap:"round",strokeLinejoin:"round"})}),"Modifié le ",_]})]}),e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx("a",{href:je(i,s,t),className:"px-3 py-1.5 bg-primary/10 text-primary text-xs font-medium rounded-lg hover:bg-primary/20 transition-colors",children:"Voir"}),e.jsx("a",{href:je(i,s,t),className:"px-3 py-1.5 bg-primary text-white text-xs font-medium rounded-lg hover:bg-primary/90 transition-colors",children:"Modifier"})]})]})})]})]}),document.body)}function Je(t,r=.1){const i=/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(t);return i?`rgba(${parseInt(i[1],16)}, ${parseInt(i[2],16)}, ${parseInt(i[3],16)}, ${r})`:`rgba(128,128,128,${r})`}function Me(t){var r;return String(((r=t==null?void 0:t._id)==null?void 0:r.$oid)||(t==null?void 0:t._id)||t||"")}function St(t,r=0){if(typeof t=="string")return{value:t,label:t,color:"#64748b",order:r};const i=String((t==null?void 0:t.value)??(t==null?void 0:t.id)??(t==null?void 0:t._id)??(t==null?void 0:t.label)??(t==null?void 0:t.name)??"");return{value:i,label:(t==null?void 0:t.label)||(t==null?void 0:t.name)||i,color:(t==null?void 0:t.color)||(t==null?void 0:t.couleur)||(t==null?void 0:t.bg)||"#64748b",order:Number.isFinite(Number(t==null?void 0:t.order))?Number(t.order):r}}function gr(t,r){var g,v;if(!t||typeof t!="object")return!1;const i=Me(t),s=t.type_config||t.typeConfig||{},n=String(t.fieldType||t.type||((g=t.render)==null?void 0:g.input)||"").toLowerCase(),y=String(((v=t.render)==null?void 0:v.input)||"").toLowerCase(),o=n==="select"||y==="select";return i===String(r)&&o&&!s.multiple}function at(t){if(t==null||t==="")return[];if(Array.isArray(t))return t.flatMap(r=>at(r));if(typeof t=="object"){if(t._v){const r=[];return Object.entries(t).forEach(([i,s])=>{i==="_v"||i==="customText"||r.push(...at(s))}),t.customText&&r.push(t.customText),r}return[String(t.label||t.name||t.value||"").trim()].filter(Boolean)}return String(t).split(",").map(r=>r.trim()).filter(Boolean)}function Lt(t,r){const i=(t.customFields||[]).find(s=>Me(s.field_id)===String(r));return i==null?void 0:i.value}function br(t,r,i=[]){if(!i.length)return[];const s=new Map(((r==null?void 0:r.customFields)||[]).map(n=>[Me(n),n]));return i.flatMap(n=>{var v,p;const y=s.get(String(n));if(!y)return[];const o=(((v=y.type_config)==null?void 0:v.options)||((p=y.typeConfig)==null?void 0:p.options)||y.options||[]).map(St),g=new Map;return o.forEach(b=>{g.set(String(b.value),b),g.set(String(b.label),b)}),at(Lt(t,n)).map(b=>{var _;const h=g.get(String(b));return{fieldId:n,label:(h==null?void 0:h.label)||b,color:(h==null?void 0:h.color)||y.color||((_=y.ui)==null?void 0:_.couleur)||"#64748b"}})}).filter(n=>n.label)}function mr({tags:t}){if(!t.length)return null;const r=t.slice(0,4),i=t.length-r.length;return e.jsxs("div",{className:"flex flex-wrap gap-1 border-t border-gray-100 bg-gray-50/80 px-3 py-2 dark:border-white/10 dark:bg-[#0b1220]/70",children:[r.map((s,n)=>e.jsx("span",{className:"inline-flex max-w-full items-center rounded-full px-2 py-0.5 text-[10px] font-bold",style:{backgroundColor:Je(s.color,.12),color:s.color},children:e.jsx("span",{className:"truncate",children:s.label})},`${s.fieldId}-${s.label}-${n}`)),i>0&&e.jsxs("span",{className:"inline-flex items-center rounded-full bg-gray-200 px-2 py-0.5 text-[10px] font-bold text-gray-500 dark:bg-white/10 dark:text-white-dark",children:["+",i]})]})}function Mt({record:t,accountNumber:r,entitySlug:i,isDragging:s=!1,onQuickView:n,cardTemplate:y,entityData:o,kanbanTagFieldIds:g}){const v=a.useRef(null),p=a.useRef(!1),b=Ee(t),h=a.useMemo(()=>br(t,o,g),[t,o,g]),{attributes:_,listeners:w,setNodeRef:N,transform:R,transition:ee,isDragging:m}=dr({id:b}),U={transform:cr.Transform.toString(R),transition:ee,opacity:s||m?.7:1,touchAction:"manipulation"},J=te=>{v.current={x:te.clientX,y:te.clientY,time:Date.now()},p.current=!1},re=te=>{if(v.current){const z=Math.abs(te.clientX-v.current.x),u=Math.abs(te.clientY-v.current.y);(z>5||u>5)&&(p.current=!0)}},Z=te=>{if(!v.current)return;const z=Date.now()-v.current.time;!p.current&&z<400&&n&&!te.target.closest("a, button")&&setTimeout(()=>n(t),50),v.current=null};return e.jsxs("div",{ref:N,style:U,className:`kanban-card cursor-pointer overflow-hidden rounded-lg border border-gray-200/80 bg-white transition-all group dark:border-white/10 dark:bg-dark/40 ${s||m?"shadow-lg ring-2 ring-primary/30 cursor-move":"hover:shadow-md dark:hover:bg-dark/60"}`,"data-dnd":"card",onPointerDown:J,onPointerMove:re,onPointerUp:Z,..._,...w,children:[e.jsx(Nt,{record:t,cardTemplate:y,context:"kanban",entityData:o,accountNumber:r,entitySlug:i,className:"bg-transparent",style:{borderRadius:0,boxShadow:"none"}}),e.jsx(mr,{tags:h})]})}function vr({column:t,records:r,recordIds:i,accountNumber:s,entitySlug:n,onQuickView:y,cardTemplate:o,entityData:g,kanbanTagFieldIds:v}){const{setNodeRef:p,isOver:b}=nr({id:String(t.id)}),h=typeof document<"u"&&document.documentElement.classList.contains("dark"),_=Je(t.color,h?.12:.06),w=Je(t.color,h?.3:.15);return e.jsxs("div",{ref:p,className:`flex-none rounded-lg overflow-hidden transition-all ${b?"ring-2 ring-primary/50 ring-offset-2":""}`,style:{width:"300px",maxWidth:"320px",backgroundColor:b?Je(t.color,.15):_,border:`1px solid ${w}`},"data-dnd":"column",children:[e.jsx("div",{style:{height:"4px",backgroundColor:t.color}}),e.jsx("div",{className:"px-3 py-2 flex justify-between items-center",children:e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx("span",{className:"inline-flex items-center gap-1.5 px-2 py-0 rounded text-xs font-semibold uppercase tracking-wide",style:{backgroundColor:t.color,color:"#fff"},children:t.title}),e.jsx("span",{className:"text-xs text-gray-500 font-medium",children:r.length})]})}),e.jsx("div",{className:"px-2 pb-3",children:e.jsx(or,{items:i,strategy:lr,children:e.jsx("div",{className:`space-y-2 min-h-[80px] rounded-lg transition-all ${b?"bg-primary/5 p-2":""}`,children:r.length===0?e.jsx("div",{className:"text-xs text-gray-300 dark:text-gray-600 text-center py-8 italic",children:"Aucun enregistrement"}):r.map(N=>e.jsx(Mt,{record:N,accountNumber:s,entitySlug:n,onQuickView:y,cardTemplate:o,entityData:g,kanbanTagFieldIds:v},Ee(N)))})})}),e.jsx("div",{className:"px-3 pb-3",children:e.jsxs("button",{type:"button",className:"flex items-center gap-1 text-xs text-gray-400 hover:text-primary transition-colors",children:[e.jsx("svg",{width:"14",height:"14",viewBox:"0 0 24 24",fill:"none",children:e.jsx("path",{d:"M12 6V18M6 12H18",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round"})}),"Ajouter"]})})]})}function yr({records:t,columns:r,accountNumber:i,entitySlug:s,viewId:n,entityData:y,kanbanFieldId:o="status",kanbanTagFieldIds:g=[]}){const v=a.useRef(null),p=a.useRef(null),[b,h]=a.useState(t),[_,w]=a.useState({}),[N,R]=a.useState(null),[ee,m]=a.useState(null),U=a.useCallback(k=>{m(k)},[]),[J,re]=a.useState(null);a.useEffect(()=>{var j;if(!(y!=null&&y._id))return;const k=((j=y._id)==null?void 0:j.$oid)||y._id;fetch(`/account/${i}/api/entity/${k}/cards/default/kanban`,{credentials:"include"}).then(F=>F.json()).then(F=>{F.success&&F.card&&re(F.card)}).catch(()=>{})},[y==null?void 0:y._id,i]),a.useEffect(()=>{h(t)},[t]);const Z=a.useRef(!1),te=a.useRef(0),z=a.useRef(0),u=a.useCallback(k=>{if(N||k.button!==0||k.target.closest('a, button, .dropdown, [data-dnd="card"]'))return;const j=v.current;j&&(Z.current=!0,te.current=k.pageX-j.offsetLeft,z.current=j.scrollLeft,j.style.cursor="grabbing")},[N]),V=a.useCallback(k=>{if(N){Z.current=!1;return}if(!Z.current)return;k.preventDefault();const j=v.current;if(!j)return;const I=(k.pageX-j.offsetLeft-te.current)*1.5;j.scrollLeft=z.current-I},[N]),S=a.useCallback(()=>{Z.current=!1,v.current&&(v.current.style.cursor="grab")},[]),L=Xt(tt(ir,{activationConstraint:{distance:8}}),tt(ar,{activationConstraint:{delay:500,tolerance:10}}),tt(sr,{coordinateGetter:rr})),c=a.useMemo(()=>{var I,ce;if(y){const ie=String(o||"").startsWith("field:")?String(o).slice(6):"",x=ie?(y.customFields||[]).find(Q=>gr(Q,ie)):null;if(x){const q=((x.type_config||x.typeConfig||{}).options||x.options||[]).map(St).filter(X=>X.value||X.label).map((X,xe)=>{const f=String(X.value||X.label);return{id:f,title:X.label||f,color:X.color||"#6366f1",optionId:f,optionValue:f,order:Number.isFinite(Number(X.order))?Number(X.order):xe}}).sort((X,xe)=>X.order-xe.order);if(q.length>0)return q.push({id:"__none__",title:"Non renseigné",color:"#9ca3af",optionId:"none",optionValue:""}),{type:"customField",fieldId:Me(x),columns:q}}const T=y.statusClassification,l=[],B=new Set;[T,...y.classifications||[]].forEach(Q=>{const q=Me(Q);!q||B.has(q)||(B.add(q),l.push(Q))});let H=null;if(o==="status"&&T?H=T:H=l.find(Q=>{const q=Me(Q);return q===String(o)||`classif:${q}`===String(o)}),H||(H=T&&((I=T.options)==null?void 0:I.length)>0?T:l.find(Q=>{var q;return((q=Q.options)==null?void 0:q.length)>0})),((ce=H==null?void 0:H.options)==null?void 0:ce.length)>0){const Q=H.options.map((q,X)=>({id:Me(q),title:q.label,color:q.color||"#6366f1",optionId:Me(q),order:Number.isFinite(Number(q.order))?Number(q.order):X})).sort((q,X)=>q.order-X.order);return Q.push({id:"__none__",title:H===T?"Sans Statut":"Non classé",color:"#9ca3af",optionId:"none"}),{type:"classification",classId:Me(H),columns:Q}}}const k={};b.forEach(ie=>{(ie.classificationValues||[]).forEach(x=>{var Q,q;const T=((Q=x.classificationId)==null?void 0:Q.$oid)||x.classificationId||x.classification_id;if(!T)return;k[T]||(k[T]={count:0,options:{}}),k[T].count++;const l=x.optionLabel||x.label||"Sans label",B=x.optionColor||x.color||"#9ca3af",H=((q=x.optionId)==null?void 0:q.$oid)||x.optionId||l;k[T].options[l]||(k[T].options[l]={label:l,color:B,optionId:String(H),count:0}),k[T].options[l].count++})});let j=null,F=0;if(Object.entries(k).forEach(([ie,x])=>{x.count>F&&(F=x.count,j=ie)}),j&&k[j]){const x=Object.values(k[j].options).map(T=>({id:T.label,title:T.label,color:T.color,optionId:T.optionId}));return x.push({id:"__none__",title:"Sans classification",color:"#9ca3af",optionId:"none"}),{type:"classification",classId:j,columns:x}}return{type:"all",classId:null,columns:[{id:"__all__",title:"Tous les enregistrements",color:"#4361ee",optionId:null}]}},[b,y,o]),O=a.useMemo(()=>{const k={};if(c.columns.forEach(j=>k[j.id]=[]),c.type==="customField"&&c.fieldId){const j={},F={};c.columns.forEach(I=>{I.optionId&&I.optionId!=="none"&&(j[String(I.optionValue||I.optionId)]=I.id,F[String(I.title)]=I.id)}),b.forEach(I=>{const ce=Lt(I,c.fieldId),ie=Array.isArray(ce)?ce[0]:ce,x=ie==null?"":String(ie),T=j[x]||F[x];T&&k[T]?k[T].push(I):k.__none__&&k.__none__.push(I)})}else if(!c.classId)k.__all__=b;else{const j={};c.columns.forEach(I=>{I.optionId&&I.optionId!=="none"&&(j[String(I.optionId)]=I.id)});const F={};c.columns.forEach(I=>{F[I.title]=I.id}),b.forEach(I=>{var x;const ie=(I.classificationValues||[]).find(T=>{var B;const l=((B=T.classificationId)==null?void 0:B.$oid)||T.classificationId||T.classification_id;return String(l)===String(c.classId)});if(ie){const T=String(((x=ie.optionId)==null?void 0:x.$oid)||ie.optionId||""),l=j[T];if(l&&k[l])k[l].push(I);else{const B=ie.optionLabel||ie.label||"Sans label";k[B]?k[B].push(I):k.__none__&&k.__none__.push(I)}}else k.__none__&&k.__none__.push(I)})}for(const j of Object.keys(k)){const F=_[j]||[];F.length&&k[j].sort((I,ce)=>{const ie=F.indexOf(Ee(I)),x=F.indexOf(Ee(ce));return ie===-1&&x===-1?0:ie===-1?1:x===-1?-1:ie-x})}return k},[c,b,_]),K=a.useMemo(()=>{const k={};for(const j of c.columns)k[j.id]=(O[j.id]||[]).map(F=>Ee(F)).filter(Boolean);return k},[c.columns,O]),se=a.useCallback(k=>{var F;const j=String(k);for(const I of Object.keys(K))if((F=K[I])!=null&&F.includes(j))return I;return null},[K]),D=a.useMemo(()=>N&&b.find(k=>Ee(k)===String(N))||null,[N,b]),le=a.useCallback(k=>{n&&(p.current&&clearTimeout(p.current),p.current=setTimeout(async()=>{try{await fetch(`/account/${i}/api/user/view-preferences`,{method:"POST",headers:{"Content-Type":"application/json"},credentials:"include",body:JSON.stringify({viewId:n,preferences:{kanban:{orderByColumn:k}}})})}catch{}},250))},[i,n]),ge=a.useCallback(async(k,j)=>{const F=c.columns.find(I=>I.id===j);if(F)try{c.type==="customField"&&c.fieldId?await fetch(`/account/${i}/record/${s}/${k}/update-field`,{method:"POST",headers:{"Content-Type":"application/json"},credentials:"include",body:JSON.stringify({fieldKey:c.fieldId,value:F.optionId==="none"?"":F.optionValue||F.optionId||""})}):c.classId&&await fetch(`/account/${i}/api/record/update-classification`,{method:"POST",headers:{"Content-Type":"application/json"},credentials:"include",body:JSON.stringify({recordId:k,classificationId:c.classId,optionId:F.optionId==="none"?null:F.optionId})})}catch(I){console.error("[RecordsKanban] Update error:",I)}},[i,s,c]),M=k=>{R(String(k.active.id))},C=()=>{R(null)},P=k=>{const{active:j,over:F}=k;if(R(null),!F)return;const I=String(j.id),ce=String(F.id),ie=se(I),x=c.columns.some(X=>String(X.id)===ce)?ce:se(ce);if(!ie||!x)return;if(ie===x){const X=K[ie]||[],xe=X.indexOf(I),f=X.indexOf(ce);if(xe===-1||f===-1||xe===f)return;const A=tr(X,xe,f),ae={..._,[ie]:A};w(ae),le(ae);return}const T=[...K[ie]||[]].filter(X=>X!==I),l=[...K[x]||[]],H=c.columns.some(X=>String(X.id)===ce)?l.length:Math.max(0,l.indexOf(ce));l.splice(H,0,I);const Q={..._,[ie]:T,[x]:l};w(Q),le(Q);const q=c.columns.find(X=>X.id===x);c.type==="customField"&&c.fieldId?(h(X=>X.map(xe=>{if(Ee(xe)!==I)return xe;const f=[...xe.customFields||[]],A=f.findIndex(be=>Me(be.field_id)===String(c.fieldId)),ae=x==="__none__"?"":(q==null?void 0:q.optionValue)||(q==null?void 0:q.optionId)||"";return A>=0?f[A]={...f[A],value:ae}:ae&&f.push({field_id:c.fieldId,value:ae}),{...xe,customFields:f}})),ge(I,x)):c.classId&&(h(X=>X.map(xe=>{if(Ee(xe)!==I)return xe;const f=(xe.classificationValues||[]).filter(A=>{var be;const ae=((be=A.classificationId)==null?void 0:be.$oid)||A.classificationId||A.classification_id;return String(ae)!==String(c.classId)});return x!=="__none__"&&q&&f.push({classificationId:c.classId,optionId:q.optionId,optionLabel:q.title,optionColor:q.color}),{...xe,classificationValues:f}})),ge(I,x))};return e.jsxs("div",{ref:v,className:"h-full overflow-x-auto overflow-y-auto",style:{cursor:"grab",userSelect:"none",WebkitUserSelect:"none"},onMouseDown:u,onMouseMove:V,onMouseUp:S,onMouseLeave:S,children:[e.jsxs(Gt,{sensors:L,collisionDetection:Qt,autoScroll:{threshold:{x:.15,y:.15},interval:10,acceleration:5},onDragStart:M,onDragEnd:P,onDragCancel:C,children:[e.jsx("div",{style:{display:"flex",flexWrap:"nowrap",alignItems:"flex-start",gap:"1.25rem",padding:"0.5rem",width:"max-content",minHeight:"100%"},children:c.columns.map(k=>{const j=O[k.id]||[];return k.id==="__none__"&&j.length===0?null:e.jsx(vr,{column:k,records:j,recordIds:K[k.id]||[],accountNumber:i,entitySlug:s,onQuickView:U,cardTemplate:J,entityData:y,kanbanTagFieldIds:g},k.id)})}),e.jsx(er,{children:D?e.jsx(Mt,{record:D,accountNumber:i,entitySlug:s,isDragging:!0,cardTemplate:J,entityData:y,kanbanTagFieldIds:g}):null})]}),ee&&e.jsx(xr,{record:ee,columns:r,accountNumber:i,entitySlug:s,onClose:()=>m(null)})]})}const ft=[{bg:"bg-primary-light shadow-primary",text:"text-primary",dot:"#4361ee"},{bg:"bg-info-light shadow-info",text:"text-info",dot:"#2196f3"},{bg:"bg-warning-light shadow-warning",text:"text-warning",dot:"#e2a03f"},{bg:"bg-danger-light shadow-danger",text:"text-danger",dot:"#e7515a"},{bg:"bg-success-light shadow-success",text:"text-success",dot:"#00ab55"},{bg:"bg-secondary-light shadow-secondary",text:"text-secondary",dot:"#805dca"}];function kr(t){return ft[t%ft.length]}function wr(){return e.jsxs("svg",{width:"24",height:"24",viewBox:"0 0 24 24",fill:"none",className:"h-5 w-5 rotate-90 opacity-70 hover:opacity-100",children:[e.jsx("circle",{cx:"5",cy:"12",r:"2",stroke:"currentColor",strokeWidth:"1.5"}),e.jsx("circle",{opacity:"0.5",cx:"12",cy:"12",r:"2",stroke:"currentColor",strokeWidth:"1.5"}),e.jsx("circle",{cx:"19",cy:"12",r:"2",stroke:"currentColor",strokeWidth:"1.5"})]})}function jr(){return e.jsxs("svg",{width:"24",height:"24",viewBox:"0 0 24 24",fill:"none",className:"h-4 w-4 ltr:mr-3 rtl:ml-3",children:[e.jsx("path",{d:"M15.2869 3.15178L14.3601 4.07866L5.83882 12.5999C5.26166 13.1771 4.97308 13.4656 4.7249 13.7838C4.43213 14.1592 4.18114 14.5653 3.97634 14.995C3.80273 15.3593 3.67368 15.7465 3.41556 16.5208L2.32181 19.8021L2.05445 20.6042C1.92743 20.9852 2.0266 21.4053 2.31063 21.6894C2.59466 21.9734 3.01478 22.0726 3.39584 21.9456L4.19792 21.6782L7.47918 20.5844C8.25353 20.3263 8.6407 20.1973 9.00498 20.0237C9.43469 19.8189 9.84082 19.5679 10.2162 19.2751C10.5344 19.0269 10.8229 18.7383 11.4001 18.1612L19.9213 9.63993L20.8482 8.71306C22.3839 7.17735 22.3839 4.68748 20.8482 3.15178C19.3125 1.61607 16.8226 1.61607 15.2869 3.15178Z",stroke:"currentColor",strokeWidth:"1.5"}),e.jsx("path",{opacity:"0.5",d:"M14.36 4.07812C14.36 4.07812 14.4759 6.04774 16.2138 7.78564C17.9517 9.52354 19.9213 9.6394 19.9213 9.6394M4.19789 21.6777L2.32178 19.8015",stroke:"currentColor",strokeWidth:"1.5"})]})}function Cr(){return e.jsxs("svg",{width:"24",height:"24",viewBox:"0 0 24 24",fill:"none",className:"h-4.5 w-4.5 ltr:mr-3 rtl:ml-3",children:[e.jsx("path",{opacity:"0.5",d:"M3.27489 15.2957C2.42496 14.1915 2 13.6394 2 12C2 10.3606 2.42496 9.80853 3.27489 8.70433C4.97196 6.49956 7.81811 4 12 4C16.1819 4 19.028 6.49956 20.7251 8.70433C21.575 9.80853 22 10.3606 22 12C22 13.6394 21.575 14.1915 20.7251 15.2957C19.028 17.5004 16.1819 20 12 20C7.81811 20 4.97196 17.5004 3.27489 15.2957Z",stroke:"currentColor",strokeWidth:"1.5"}),e.jsx("path",{d:"M15 12C15 13.6569 13.6569 15 12 15C10.3431 15 9 13.6569 9 12C9 10.3431 10.3431 9 12 9C13.6569 9 15 10.3431 15 12Z",stroke:"currentColor",strokeWidth:"1.5"})]})}function Nr({filled:t}){return e.jsx("svg",{width:"24",height:"24",viewBox:"0 0 24 24",fill:"none",className:`h-4.5 w-4.5 group-hover:fill-warning ${t?"fill-warning":""}`,children:e.jsx("path",{d:"M9.15316 5.40838C10.4198 3.13613 11.0531 2 12 2C12.9469 2 13.5802 3.13612 14.8468 5.40837L15.1745 5.99623C15.5345 6.64193 15.7144 6.96479 15.9951 7.17781C16.2757 7.39083 16.6251 7.4699 17.3241 7.62805L17.9605 7.77203C20.4201 8.32856 21.65 8.60682 21.9426 9.54773C22.2352 10.4886 21.3968 11.4691 19.7199 13.4299L19.2861 13.9372C18.8096 14.4944 18.5713 14.773 18.4641 15.1177C18.357 15.4624 18.393 15.8341 18.465 16.5776L18.5306 17.2544C18.7841 19.8706 18.9109 21.1787 18.1449 21.7602C17.3788 22.3417 16.2273 21.8115 13.9243 20.7512L13.3285 20.4768C12.6741 20.1755 12.3469 20.0248 12 20.0248C11.6531 20.0248 11.3259 20.1755 10.6715 20.4768L10.0757 20.7512C7.77268 21.8115 6.62118 22.3417 5.85515 21.7602C5.08912 21.1787 5.21588 19.8706 5.4694 17.2544L5.53498 16.5776C5.60703 15.8341 5.64305 15.4624 5.53586 15.1177C5.42868 14.773 5.19043 14.4944 4.71392 13.9372L4.2801 13.4299C2.60325 11.4691 1.76482 10.4886 2.05742 9.54773C2.35002 8.60682 3.57986 8.32856 6.03954 7.77203L6.67589 7.62805C7.37485 7.4699 7.72433 7.39083 8.00494 7.17781C8.28555 6.96479 8.46553 6.64194 8.82547 5.99623L9.15316 5.40838Z",stroke:"currentColor",strokeWidth:"1.5"})})}function Sr(){return e.jsx("svg",{width:"24",height:"24",viewBox:"0 0 24 24",fill:"none",className:"h-3 w-3 rotate-45",children:e.jsx("path",{d:"M2 12C2 7.28595 2 4.92893 3.46447 3.46447C4.92893 2 7.28595 2 12 2C16.714 2 19.0711 2 20.5355 3.46447C22 4.92893 22 7.28595 22 12C22 16.714 22 19.0711 20.5355 20.5355C19.0711 22 16.714 22 12 22C7.28595 22 4.92893 22 3.46447 20.5355C2 19.0711 2 16.714 2 12Z",stroke:"currentColor",strokeWidth:"1.5"})})}function Lr({record:t,accountNumber:r,entitySlug:i}){var o;const[s,n]=a.useState(!1),y=a.useRef(null);return a.useEffect(()=>{if(!s)return;const g=v=>{y.current&&!y.current.contains(v.target)&&n(!1)};return document.addEventListener("mousedown",g),()=>document.removeEventListener("mousedown",g)},[s]),(o=t._id)!=null&&o.$oid||t._id,e.jsxs("div",{ref:y,className:"dropdown relative",children:[e.jsx("button",{type:"button",className:"text-primary",onClick:g=>{g.preventDefault(),g.stopPropagation(),n(!s)},children:e.jsx(wr,{})}),s&&e.jsxs("ul",{className:"absolute z-50 min-w-[140px] rounded-md bg-white dark:bg-[#1b2e4b] shadow-lg border dark:border-gray-700 py-1 text-sm font-medium ltr:right-0 rtl:left-0 top-full mt-1",style:{animation:"fadeIn 0.15s ease-out"},children:[e.jsx("li",{children:e.jsxs("a",{href:je(r,i,t),className:"flex items-center px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 w-full",onClick:g=>g.stopPropagation(),children:[e.jsx(jr,{})," Edit"]})}),e.jsx("li",{children:e.jsxs("a",{href:je(r,i,t),className:"flex items-center px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 w-full",onClick:g=>g.stopPropagation(),children:[e.jsx(Cr,{})," View"]})})]})]})}function Mr({record:t,accountNumber:r,entitySlug:i,style:s,favorites:n,onToggleFav:y}){var h,_;const o=n[t._id]||!1;(h=t._id)!=null&&h.$oid||t._id;const g=t.referenceTitle||t.title||t.computedTitle||"Sans titre",v=t.createdAt?new Date(t.createdAt).toLocaleDateString("fr-FR",{day:"2-digit",month:"short",year:"numeric"}):"",p=(t.customFields||[]).find(w=>{var N,R,ee,m,U,J;return((R=(N=w.field_id)==null?void 0:N.label)==null?void 0:R.toLowerCase().includes("descri"))||((m=(ee=w.field_id)==null?void 0:ee.label)==null?void 0:m.toLowerCase().includes("note"))||((J=(U=w.field_id)==null?void 0:U.label)==null?void 0:J.toLowerCase().includes("contenu"))}),b=(p==null?void 0:p.value)||t.description||"";return(t.classificationValues||[]).filter(w=>w.optionLabel).map(w=>({label:w.optionLabel,color:w.optionColor||w.color||s.dot})),e.jsxs("div",{className:`panel pb-12 relative ${s.bg}`,children:[e.jsxs("div",{className:"min-h-[142px]",children:[e.jsxs("div",{className:"flex justify-between",children:[e.jsxs("div",{className:"flex w-max items-center",children:[e.jsx("div",{className:"flex-none",children:e.jsx("div",{className:"rounded-full bg-gray-300 p-2 dark:bg-gray-700",children:e.jsxs("svg",{width:"24",height:"24",viewBox:"0 0 24 24",fill:"none",className:"h-4.5 w-4.5",children:[e.jsx("circle",{cx:"12",cy:"6",r:"4",stroke:"currentColor",strokeWidth:"1.5"}),e.jsx("ellipse",{opacity:"0.5",cx:"12",cy:"17",rx:"7",ry:"4",stroke:"currentColor",strokeWidth:"1.5"})]})})}),e.jsxs("div",{className:"ltr:ml-2 rtl:mr-2",children:[e.jsx("div",{className:"font-semibold",children:((_=t.createdBy)==null?void 0:_.name)||"Utilisateur"}),e.jsx("div",{className:"text-sx text-white-dark",children:v})]})]}),e.jsx(Lr,{record:t,accountNumber:r,entitySlug:i})]}),e.jsxs("div",{children:[e.jsx("h4",{className:"mt-4 font-semibold",children:e.jsx("a",{href:je(r,i,t),className:"hover:text-primary transition-colors",children:g})}),b&&e.jsx("p",{className:"mt-2 text-white-dark line-clamp-3",children:b})]})]}),e.jsx("div",{className:"absolute bottom-5 left-0 w-full px-5",children:e.jsxs("div",{className:"mt-2 flex items-center justify-between",children:[e.jsx("div",{className:s.text,children:e.jsx(Sr,{})}),e.jsx("div",{className:"flex items-center gap-2",children:e.jsx("button",{type:"button",className:"group text-warning ltr:ml-2 rtl:mr-2",onClick:w=>{w.preventDefault(),w.stopPropagation(),y(t._id)},children:e.jsx(Nr,{filled:o})})})]})})]})}function _r({records:t,accountNumber:r,entitySlug:i}){const[s,n]=a.useState({}),y=a.useCallback(o=>{n(g=>({...g,[o]:!g[o]}))},[]);return e.jsx("div",{className:"h-full overflow-y-auto",children:e.jsx("div",{className:"grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",children:t.length===0?e.jsx("div",{className:"col-span-full text-center py-20 text-gray-400 dark:text-gray-600 italic",children:"Aucun enregistrement"}):t.map((o,g)=>{var v;return e.jsx(Mr,{record:o,accountNumber:r,entitySlug:i,style:kr(g),favorites:s,onToggleFav:y},((v=o._id)==null?void 0:v.$oid)||o._id)})})})}const it={Planifié:{className:"primary",bg:"#4361ee",text:"#fff"},Confirmé:{className:"info",bg:"#2196f3",text:"#fff"},Terminé:{className:"success",bg:"#00ab55",text:"#fff"},Annulé:{className:"danger",bg:"#e7515a",text:"#fff"},"Non présenté":{className:"warning",bg:"#e2a03f",text:"#fff"}},He=[{className:"primary",bg:"#4361ee",text:"#fff"},{className:"info",bg:"#2196f3",text:"#fff"},{className:"success",bg:"#00ab55",text:"#fff"},{className:"danger",bg:"#e7515a",text:"#fff"},{className:"warning",bg:"#e2a03f",text:"#fff"}];function Ir(t,r){if(r){const i=(t.customFields||[]).find(s=>{var y,o,g;return(((o=(y=s.field_id)==null?void 0:y._id)==null?void 0:o.toString())||((g=s.field_id)==null?void 0:g.toString()))===r});if(i!=null&&i.value){const s=new Date(i.value);if(!isNaN(s))return s}}if(t.date){const i=new Date(t.date);if(!isNaN(i))return i}if(t.createdAt){const i=new Date(t.createdAt);if(!isNaN(i))return i}return null}function Tr(t,r){if(!r)return 30;const i=(t.customFields||[]).find(s=>{var y,o,g;return(((o=(y=s.field_id)==null?void 0:y._id)==null?void 0:o.toString())||((g=s.field_id)==null?void 0:g.toString()))===r});return parseInt(i==null?void 0:i.value)||30}function Er(t){const r=t.classificationValues||[];for(const i of r)if(i.label||i.optionLabel)return i.label||i.optionLabel;return null}function Fr(t){const r=["Dimanche","Lundi","Mardi","Mercredi","Jeudi","Vendredi","Samedi"],i=["janvier","février","mars","avril","mai","juin","juillet","août","septembre","octobre","novembre","décembre"];return`${r[t.getDay()]} ${t.getDate()} ${i[t.getMonth()]} ${t.getFullYear()}`}function $r(t){const r=t.getFullYear(),i=String(t.getMonth()+1).padStart(2,"0"),s=String(t.getDate()).padStart(2,"0"),n=String(t.getHours()).padStart(2,"0"),y=String(t.getMinutes()).padStart(2,"0");return`${r}-${i}-${s}T${n}:${y}`}function Rr({message:t,type:r="success",onClose:i}){a.useEffect(()=>{const y=setTimeout(i,3e3);return()=>clearTimeout(y)},[i]);const s={success:{bg:"#00ab55",icon:"✓"},error:{bg:"#e7515a",icon:"✕"},info:{bg:"#4361ee",icon:"ℹ"}},n=s[r]||s.info;return e.jsxs("div",{style:{position:"fixed",bottom:24,right:24,zIndex:1e4,display:"flex",alignItems:"center",gap:10,padding:"12px 20px",borderRadius:12,backgroundColor:n.bg,color:"#fff",boxShadow:"0 8px 32px rgba(0,0,0,0.18)",animation:"slideInRight 0.3s ease",fontSize:13,fontWeight:600},children:[e.jsx("span",{style:{fontSize:16},children:n.icon}),t]})}function Or({isOpen:t,onClose:r,onSave:i,initialDate:s,entityData:n,accountNumber:y}){const[o,g]=a.useState(""),[v,p]=a.useState(""),[b,h]=a.useState("30"),[_,w]=a.useState(!1),N=a.useRef(null);if(a.useEffect(()=>{t&&s&&(p($r(s)),g(""),h("30"),setTimeout(()=>{var m;return(m=N.current)==null?void 0:m.focus()},100))},[t,s]),!t)return null;const R=async m=>{if(m.preventDefault(),!!o.trim()){w(!0);try{await i({title:o.trim(),date:v,duration:parseInt(b)}),r()}catch(U){console.error(U)}w(!1)}},ee=[15,30,45,60,90,120];return e.jsx("div",{style:{position:"fixed",inset:0,zIndex:9999,backgroundColor:"rgba(0,0,0,0.4)",backdropFilter:"blur(4px)",display:"flex",alignItems:"center",justifyContent:"center",animation:"fadeIn 0.2s ease"},onClick:m=>{m.target===m.currentTarget&&r()},children:e.jsxs("div",{style:{backgroundColor:"#fff",borderRadius:16,width:"100%",maxWidth:440,boxShadow:"0 24px 80px rgba(0,0,0,0.2)",animation:"slideUp 0.3s ease",overflow:"hidden"},children:[e.jsxs("div",{style:{padding:"20px 24px 16px",display:"flex",alignItems:"center",justifyContent:"space-between",borderBottom:"1px solid #f0f0f0"},children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:10},children:[e.jsx("div",{style:{width:36,height:36,borderRadius:10,background:"linear-gradient(135deg, #4361ee, #805cf6)",display:"flex",alignItems:"center",justifyContent:"center"},children:e.jsx("svg",{viewBox:"0 0 24 24",fill:"none",style:{width:18,height:18,color:"#fff"},children:e.jsx("path",{d:"M12 5V19M5 12H19",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round"})})}),e.jsxs("div",{children:[e.jsx("h3",{style:{margin:0,fontSize:16,fontWeight:700,color:"#1a1a2e"},children:"Nouveau rendez-vous"}),e.jsx("p",{style:{margin:0,fontSize:11,color:"#888",marginTop:2},children:s?Fr(s):""})]})]}),e.jsx("button",{onClick:r,style:{border:"none",background:"#f5f5f5",borderRadius:8,width:32,height:32,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer"},children:e.jsx("svg",{viewBox:"0 0 24 24",fill:"none",style:{width:16,height:16,color:"#666"},children:e.jsx("path",{d:"M18 6L6 18M6 6L18 18",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round"})})})]}),e.jsxs("form",{onSubmit:R,style:{padding:"20px 24px 24px"},children:[e.jsxs("div",{style:{marginBottom:16},children:[e.jsx("label",{style:{display:"block",fontSize:12,fontWeight:600,color:"#555",marginBottom:6},children:"Titre *"}),e.jsx("input",{ref:N,type:"text",value:o,onChange:m=>g(m.target.value),placeholder:"Ex: Consultation Dr. Martin",required:!0,style:{width:"100%",padding:"10px 14px",border:"1.5px solid #e0e0e0",borderRadius:10,fontSize:14,outline:"none",transition:"border 0.2s",boxSizing:"border-box"},onFocus:m=>m.target.style.borderColor="#4361ee",onBlur:m=>m.target.style.borderColor="#e0e0e0"})]}),e.jsxs("div",{style:{marginBottom:16},children:[e.jsx("label",{style:{display:"block",fontSize:12,fontWeight:600,color:"#555",marginBottom:6},children:"Date et heure"}),e.jsx("input",{type:"datetime-local",value:v,onChange:m=>p(m.target.value),style:{width:"100%",padding:"10px 14px",border:"1.5px solid #e0e0e0",borderRadius:10,fontSize:14,outline:"none",transition:"border 0.2s",boxSizing:"border-box"},onFocus:m=>m.target.style.borderColor="#4361ee",onBlur:m=>m.target.style.borderColor="#e0e0e0"})]}),e.jsxs("div",{style:{marginBottom:20},children:[e.jsx("label",{style:{display:"block",fontSize:12,fontWeight:600,color:"#555",marginBottom:8},children:"Durée"}),e.jsx("div",{style:{display:"flex",flexWrap:"wrap",gap:6},children:ee.map(m=>e.jsx("button",{type:"button",onClick:()=>h(String(m)),style:{padding:"6px 14px",borderRadius:20,fontSize:12,fontWeight:600,border:b===String(m)?"1.5px solid #4361ee":"1.5px solid #e0e0e0",backgroundColor:b===String(m)?"#4361ee":"#fff",color:b===String(m)?"#fff":"#555",cursor:"pointer",transition:"all 0.2s"},children:m<60?`${m} min`:`${m/60}h`},m))})]}),e.jsxs("div",{style:{display:"flex",gap:10,justifyContent:"flex-end"},children:[e.jsx("button",{type:"button",onClick:r,style:{padding:"10px 20px",borderRadius:10,fontSize:13,fontWeight:600,border:"1.5px solid #e0e0e0",backgroundColor:"#fff",color:"#555",cursor:"pointer",transition:"all 0.2s"},children:"Annuler"}),e.jsx("button",{type:"submit",disabled:_||!o.trim(),style:{padding:"10px 24px",borderRadius:10,fontSize:13,fontWeight:600,border:"none",background:o.trim()?"linear-gradient(135deg, #4361ee, #805cf6)":"#ccc",color:"#fff",cursor:o.trim()?"pointer":"not-allowed",transition:"all 0.2s",opacity:_?.7:1},children:_?"Création...":"Créer le RDV"})]})]})]})})}function Wr({event:t,position:r,onClose:i,onEdit:s,onDelete:n,accountNumber:y,entitySlug:o,cardTemplate:g}){var R,ee;const v=a.useRef(null);if(a.useEffect(()=>{const m=U=>{v.current&&!v.current.contains(U.target)&&i()};return document.addEventListener("mousedown",m),()=>document.removeEventListener("mousedown",m)},[i]),!t)return null;const p=t.start?new Date(t.start):null,b=t.end?new Date(t.end):null,h=(R=t.extendedProps)==null?void 0:R.status,_=h?it[h]:null,N={_id:((ee=t.extendedProps)==null?void 0:ee.recordId)||t.id,referenceTitle:t.title,_start:p,_end:b,classificationValues:h?[{optionLabel:h,optionColor:_?_.bg:"#4361ee"}]:[],createdAt:p,...t.extendedProps};return e.jsx("div",{ref:v,style:{position:"fixed",top:Math.min(r.y,window.innerHeight-280),left:Math.min(r.x,window.innerWidth-340),zIndex:9998,width:320,backgroundColor:"#fff",borderRadius:14,boxShadow:"0 16px 64px rgba(0,0,0,0.18)",animation:"slideUp 0.2s ease",overflow:"hidden"},children:e.jsx(Nt,{record:N,cardTemplate:g,context:"calendar",accountNumber:y,entitySlug:o,callbacks:{onClose:i},style:{borderRadius:0}})})}function zr({records:t=[],columns:r=[],accountNumber:i,entitySlug:s,entityData:n}){var F,I,ce,ie;const y=a.useRef(null),o=a.useRef(null),[g,v]=a.useState(!1),[p,b]=a.useState(!1),[h,_]=a.useState(null),[w,N]=a.useState(null),[R,ee]=a.useState({x:0,y:0}),[m,U]=a.useState(null),[J,re]=a.useState(t),[Z,te]=a.useState(!1),[z,u]=a.useState({weekStartsOn:1,startHour:"07:00",endHour:"20:00",hideWeekend:!1,slotDuration:"00:15:00",slotLabelInterval:"01:00",compactMode:!1});a.useEffect(()=>{var T;if(!(n!=null&&n._id))return;const x=((T=n._id)==null?void 0:T.$oid)||n._id;fetch(`/account/${i}/api/user/view-preferences?viewId=calendar_${x}`,{credentials:"include"}).then(l=>l.json()).then(l=>{var B;l.success&&((B=l.preferences)!=null&&B.calendarSettings)&&u(H=>({...H,...l.preferences.calendarSettings}))}).catch(()=>{})},[n==null?void 0:n._id,i]);const V=a.useCallback(async x=>{var l;u(x),te(!1);const T=((l=n==null?void 0:n._id)==null?void 0:l.$oid)||(n==null?void 0:n._id);if(T)try{await fetch(`/account/${i}/api/user/view-preferences`,{method:"POST",headers:{"Content-Type":"application/json"},credentials:"include",body:JSON.stringify({viewId:`calendar_${T}`,preferences:{calendarSettings:x}})}),U({message:"Paramètres sauvegardés",type:"success"})}catch{U({message:"Erreur sauvegarde paramètres",type:"error"})}},[i,n]);a.useEffect(()=>{re(t)},[t]);const[S,L]=a.useState(null);a.useEffect(()=>{var T;if(!(n!=null&&n._id))return;const x=((T=n._id)==null?void 0:T.$oid)||n._id;fetch(`/account/${i}/api/entity/${x}/cards/default/calendar`,{credentials:"include"}).then(l=>l.json()).then(l=>{l.success&&l.card&&L(l.card)}).catch(()=>{})},[n==null?void 0:n._id,i]);const{dateFieldId:c,durationFieldId:O}=a.useMemo(()=>{var q,X,xe,f,A;if(!n)return{dateFieldId:null,durationFieldId:null};const x=n.customFields||[],T=x.filter(ae=>ae.type==="date"||ae.inputType==="date"||ae.inputType==="datetime-local"),l=T.find(ae=>/^date/i.test(ae.name||"")||/date/i.test(ae.label||"")),B=((q=l==null?void 0:l._id)==null?void 0:q.toString())||((xe=(X=T[0])==null?void 0:X._id)==null?void 0:xe.toString())||null,Q=((A=(f=x.filter(ae=>ae.type==="number"&&(/dur/i.test(ae.name||"")||/dur/i.test(ae.label||"")))[0])==null?void 0:f._id)==null?void 0:A.toString())||null;return{dateFieldId:B,durationFieldId:Q}},[n]),K=(F=n==null?void 0:n._id)==null?void 0:F.toString(),se=(ce=(I=n==null?void 0:n.statusClassification)==null?void 0:I._id)==null?void 0:ce.toString(),D=((ie=n==null?void 0:n.statusClassification)==null?void 0:ie.options)||[],le=D.find(x=>/planif/i.test(x.label))||D[0],ge=a.useMemo(()=>J.map((x,T)=>{const l=Ir(x,c);if(!l)return null;const B=Tr(x,O),H=new Date(l.getTime()+B*6e4),Q=x.referenceTitle||x.computedTitle||x.title||"Sans titre",q=Er(x),X=q&&it[q]||He[T%He.length];return{id:x._id,title:Q,start:l.toISOString(),end:H.toISOString(),className:X.className,extendedProps:{recordId:x._id,status:q,entitySlug:s,accountNumber:i,dateFieldId:c,durationFieldId:O}}}).filter(Boolean),[J,c,O,s,i]),M=a.useCallback(x=>{x.jsEvent.preventDefault(),x.jsEvent.stopPropagation();const T=x.el.getBoundingClientRect();ee({x:T.right+8,y:T.top}),N(x.event)},[]),C=a.useCallback(x=>{N(null);const T=x.start;_(T),b(!0),o.current&&o.current.unselect()},[]),P=a.useCallback(async x=>{var q,X,xe;const T=((q=x.event.extendedProps)==null?void 0:q.recordId)||x.event.id,l=x.event.start.toISOString(),B=(X=x.event.end)==null?void 0:X.toISOString(),H=(xe=x.event.extendedProps)==null?void 0:xe.dateFieldId;let Q;x.event.start&&x.event.end&&(Q=Math.round((x.event.end-x.event.start)/6e4));try{if(!(await fetch(`/account/${i}/api/records/${T}/date`,{method:"PATCH",headers:{"Content-Type":"application/json"},credentials:"include",body:JSON.stringify({dateFieldId:H,newStart:l,newEnd:B,duration:Q})})).ok)throw new Error("Failed");U({message:"RDV déplacé avec succès",type:"success"})}catch{x.revert(),U({message:"Erreur lors du déplacement",type:"error"})}},[i]),k=a.useCallback(async x=>{var Q,q;const T=((Q=x.event.extendedProps)==null?void 0:Q.recordId)||x.event.id,l=x.event.start.toISOString(),B=(q=x.event.extendedProps)==null?void 0:q.dateFieldId;let H;x.event.start&&x.event.end&&(H=Math.round((x.event.end-x.event.start)/6e4));try{if(!(await fetch(`/account/${i}/api/records/${T}/date`,{method:"PATCH",headers:{"Content-Type":"application/json"},credentials:"include",body:JSON.stringify({dateFieldId:B,newStart:l,duration:H})})).ok)throw new Error("Failed");U({message:`Durée modifiée (${H} min)`,type:"success"})}catch{x.revert(),U({message:"Erreur lors du redimensionnement",type:"error"})}},[i]),j=a.useCallback(async({title:x,date:T,duration:l})=>{var Q;if(!K||!c)return;const B=await fetch(`/account/${i}/api/entity/${K}/records/quick-add`,{method:"POST",headers:{"Content-Type":"application/json"},credentials:"include",body:JSON.stringify({title:x,dateFieldId:c,dateValue:new Date(T).toISOString(),duration:l,durationFieldId:O,statusOptionId:(Q=le==null?void 0:le._id)==null?void 0:Q.toString(),statusClassificationId:se})});if(!B.ok)throw new Error("Failed to create");const H=await B.json();H.record&&re(q=>[...q,H.record]),U({message:`"${x}" créé avec succès !`,type:"success"})},[i,K,c,O,le,se]);return a.useEffect(()=>{if(typeof FullCalendar<"u"){v(!0);return}const x=setInterval(()=>{typeof FullCalendar<"u"&&(v(!0),clearInterval(x))},200);if(!document.querySelector('script[src*="fullcalendar"]')){const T=document.createElement("link");T.rel="stylesheet",T.href="/assets/css/fullcalendar.min.css",document.head.appendChild(T);const l=document.createElement("script");l.src="/assets/js/fullcalendar.min.js",l.onload=()=>v(!0),document.head.appendChild(l)}return()=>clearInterval(x)},[]),a.useEffect(()=>{if(!g||!y.current||typeof FullCalendar>"u")return;o.current&&o.current.destroy();const x=z.hideWeekend?[0,6]:[],T=new FullCalendar.Calendar(y.current,{initialView:"timeGridWeek",headerToolbar:{left:"prev,next today",center:"title",right:"dayGridMonth,timeGridWeek,timeGridDay"},locale:"fr",buttonText:{today:"Aujourd'hui",month:"Mois",week:"Semaine",day:"Jour"},editable:!0,selectable:!0,selectMirror:!0,dayMaxEvents:3,height:"auto",firstDay:z.weekStartsOn,hiddenDays:x,slotDuration:z.slotDuration,snapDuration:z.slotDuration,slotLabelInterval:z.slotLabelInterval,slotLabelFormat:{hour:"2-digit",minute:"2-digit",hour12:!1},slotMinTime:z.startHour+":00",slotMaxTime:z.endHour+":00",businessHours:{daysOfWeek:z.hideWeekend?[1,2,3,4,5]:[0,1,2,3,4,5,6],startTime:z.startHour,endTime:z.endHour},scrollTime:z.startHour+":00",nowIndicator:!0,events:ge,eventClick:M,select:C,eventDrop:P,eventResize:k,eventContent:l=>{const B=l.event.start,H=l.event.end,Q=B?`${String(B.getHours()).padStart(2,"0")}:${String(B.getMinutes()).padStart(2,"0")}`:"",q=H?`${String(H.getHours()).padStart(2,"0")}:${String(H.getMinutes()).padStart(2,"0")}`:"";return{html:`<div style="line-height:1.2;padding:2px 4px;overflow:hidden;"><div style="font-weight:700;font-size:11px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin:0;">${l.event.title}</div><div style="font-size:10px;opacity:0.85;margin:0;font-weight:500;">De ${Q} à ${q}</div></div>`}},eventDidMount:l=>{var H;l.el.style.cursor="pointer",l.el.style.borderRadius="6px",l.el.style.border="none",l.el.style.overflow="hidden";const B=(H=l.event.extendedProps)==null?void 0:H.status;l.el.title=l.event.title+(B?` — ${B}`:"")},dayHeaderFormat:{weekday:"short",day:"numeric",month:"short"},allDaySlot:!1});return T.render(),o.current=T,()=>{o.current&&(o.current.destroy(),o.current=null)}},[g,ge,M,C,P,k,z]),g?!c&&t.length>0?e.jsxs("div",{style:{display:"flex",alignItems:"center",justifyContent:"center",padding:"48px 0",flexDirection:"column"},children:[e.jsxs("svg",{viewBox:"0 0 24 24",fill:"none",style:{width:48,height:48,marginBottom:12,color:"#ccc"},children:[e.jsx("rect",{x:"3",y:"4",width:"18",height:"18",rx:"2",stroke:"currentColor",strokeWidth:"1.5"}),e.jsx("path",{d:"M16 2V6M8 2V6M3 10H21",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"})]}),e.jsx("p",{style:{fontSize:14,fontWeight:500,color:"#888"},children:"Aucun champ date trouvé"}),e.jsx("p",{style:{fontSize:12,color:"#aaa",marginTop:4},children:"Ajoutez un champ date à cette entité"})]}):e.jsxs("div",{style:{position:"relative"},children:[e.jsx("style",{children:`
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes slideUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
                @keyframes slideInRight { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: translateX(0); } }
                .fc .fc-timegrid-slot { height: ${z.compactMode?"20px":"40px"} !important; }
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
            `}),e.jsxs("div",{style:{marginBottom:12,display:"flex",flexWrap:"wrap",gap:12,alignItems:"center",justifyContent:"space-between",padding:"8px 0"},children:[e.jsx("div",{style:{display:"flex",flexWrap:"wrap",gap:10},children:Object.entries(it).map(([x,T])=>e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:5,fontSize:11,color:"#666"},children:[e.jsx("div",{style:{width:8,height:8,borderRadius:2,backgroundColor:T.bg}}),x]},x))}),e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:12},children:[e.jsx("span",{style:{fontSize:11,color:"#aaa",fontStyle:"italic"},children:"Cliquer pour ajouter • Glisser pour déplacer"}),e.jsxs("button",{onClick:()=>te(!0),style:{display:"flex",alignItems:"center",gap:6,padding:"6px 14px",border:"1px solid #e2e8f0",borderRadius:8,background:"#fff",cursor:"pointer",fontSize:12,fontWeight:600,color:"#475569",transition:"all 0.2s"},onMouseEnter:x=>{x.currentTarget.style.borderColor="#4361ee",x.currentTarget.style.color="#4361ee"},onMouseLeave:x=>{x.currentTarget.style.borderColor="#e2e8f0",x.currentTarget.style.color="#475569"},children:[e.jsx("iconify-icon",{icon:"solar:settings-linear",width:"15"}),"Config"]})]})]}),e.jsx("div",{className:"calendar-wrapper",ref:y}),Z&&e.jsx(Ar,{settings:z,onSave:V,onClose:()=>te(!1)}),e.jsx(Or,{isOpen:p,onClose:()=>b(!1),onSave:j,initialDate:h,entityData:n,accountNumber:i}),w&&e.jsx(Wr,{event:w,position:R,onClose:()=>N(null),accountNumber:i,entitySlug:s,cardTemplate:S}),m&&e.jsx(Rr,{message:m.message,type:m.type,onClose:()=>U(null)})]}):e.jsxs("div",{style:{display:"flex",alignItems:"center",justifyContent:"center",padding:"48px 0"},children:[e.jsx("div",{className:"animate-spin rounded-full h-8 w-8 border-b-2 border-primary"}),e.jsx("span",{style:{marginLeft:12,color:"#888"},children:"Chargement du calendrier..."})]})}function Ar({settings:t,onSave:r,onClose:i}){const[s,n]=a.useState({...t}),y=[];for(let o=0;o<24;o++){const g=`${String(o).padStart(2,"0")}:00`;y.push(g)}return e.jsxs(e.Fragment,{children:[e.jsx("div",{className:"cal-settings-overlay",onClick:i}),e.jsxs("div",{className:"cal-settings-panel",children:[e.jsxs("div",{className:"header",children:[e.jsxs("h3",{children:[e.jsx("iconify-icon",{icon:"solar:settings-bold-duotone",width:"20",style:{verticalAlign:"middle",marginRight:8,color:"#4361ee"}}),"Paramètres du calendrier"]}),e.jsx("button",{onClick:i,style:{background:"none",border:"none",cursor:"pointer",padding:4,borderRadius:6,color:"#94a3b8"},children:e.jsx("iconify-icon",{icon:"solar:close-circle-linear",width:"22"})})]}),e.jsxs("div",{className:"body",children:[e.jsxs("div",{className:"cal-field",children:[e.jsx("label",{children:"Premier jour de la semaine"}),e.jsxs("select",{value:s.weekStartsOn,onChange:o=>n({...s,weekStartsOn:parseInt(o.target.value)}),children:[e.jsx("option",{value:1,children:"Lundi"}),e.jsx("option",{value:0,children:"Dimanche"}),e.jsx("option",{value:6,children:"Samedi"})]})]}),e.jsxs("div",{style:{display:"flex",gap:12},children:[e.jsxs("div",{className:"cal-field",style:{flex:1},children:[e.jsx("label",{children:"Heure de début"}),e.jsx("select",{value:s.startHour,onChange:o=>n({...s,startHour:o.target.value}),children:y.map(o=>e.jsx("option",{value:o,children:o},o))})]}),e.jsxs("div",{className:"cal-field",style:{flex:1},children:[e.jsx("label",{children:"Heure de fin"}),e.jsx("select",{value:s.endHour,onChange:o=>n({...s,endHour:o.target.value}),children:y.map(o=>e.jsx("option",{value:o,children:o},o))})]})]}),e.jsxs("div",{className:"cal-field",children:[e.jsx("label",{children:"Intervalle des créneaux"}),e.jsxs("select",{value:s.slotDuration,onChange:o=>n({...s,slotDuration:o.target.value}),children:[e.jsx("option",{value:"00:05:00",children:"5 minutes"}),e.jsx("option",{value:"00:10:00",children:"10 minutes"}),e.jsx("option",{value:"00:15:00",children:"15 minutes"}),e.jsx("option",{value:"00:30:00",children:"30 minutes"}),e.jsx("option",{value:"01:00:00",children:"1 heure"})]})]}),e.jsxs("div",{className:"cal-field",children:[e.jsx("label",{children:"Affichage des heures"}),e.jsxs("select",{value:s.slotLabelInterval,onChange:o=>n({...s,slotLabelInterval:o.target.value}),children:[e.jsx("option",{value:"00:30:00",children:"Toutes les 30 min"}),e.jsx("option",{value:"01:00:00",children:"Toutes les heures"}),e.jsx("option",{value:"02:00:00",children:"Toutes les 2 heures"})]})]}),e.jsx("div",{style:{height:1,background:"#f1f5f9",margin:"8px 0 20px"}}),e.jsxs("div",{className:"cal-toggle",children:[e.jsxs("div",{children:[e.jsx("div",{className:"cal-toggle-label",children:"Mode compact"}),e.jsx("div",{className:"cal-toggle-desc",children:"Réduit l'espacement des créneaux pour une vue d'ensemble"})]}),e.jsxs("label",{className:"cal-switch",children:[e.jsx("input",{type:"checkbox",checked:s.compactMode,onChange:o=>n({...s,compactMode:o.target.checked})}),e.jsx("span",{className:"slider"})]})]}),e.jsxs("div",{className:"cal-toggle",children:[e.jsxs("div",{children:[e.jsx("div",{className:"cal-toggle-label",children:"Masquer le weekend"}),e.jsx("div",{className:"cal-toggle-desc",children:"Afficher uniquement du lundi au vendredi"})]}),e.jsxs("label",{className:"cal-switch",children:[e.jsx("input",{type:"checkbox",checked:s.hideWeekend,onChange:o=>n({...s,hideWeekend:o.target.checked})}),e.jsx("span",{className:"slider"})]})]})]}),e.jsxs("div",{className:"footer",children:[e.jsx("button",{className:"cal-btn cal-btn-ghost",onClick:i,children:"Annuler"}),e.jsxs("button",{className:"cal-btn cal-btn-primary",onClick:()=>r(s),children:[e.jsx("iconify-icon",{icon:"solar:check-circle-bold",width:"16",style:{verticalAlign:"middle",marginRight:4}}),"Appliquer"]})]})]})]})}const nt={contains:{label:"Contient",icon:"⊃",types:["text","email","phone","url","textarea","title","relation"]},not_contains:{label:"Ne contient pas",icon:"⊅",types:["text","email","phone","url","textarea","title","relation"]},equals:{label:"Est égal à",icon:"=",types:["text","email","phone","url","number","date","title","select","boolean","checkbox","switch","relation","classification"]},not_equals:{label:"N'est pas égal à",icon:"≠",types:["text","email","phone","url","number","date","title","select","boolean","checkbox","switch","relation","classification"]},starts_with:{label:"Commence par",icon:"A…",types:["text","email","phone","url","title"]},ends_with:{label:"Se termine par",icon:"…Z",types:["text","email","phone","url","title"]},gt:{label:"Supérieur à",icon:">",types:["number","date"]},gte:{label:"Supérieur ou égal",icon:"≥",types:["number","date"]},lt:{label:"Inférieur à",icon:"<",types:["number","date"]},lte:{label:"Inférieur ou égal",icon:"≤",types:["number","date"]},between:{label:"Entre",icon:"↔",types:["number","date"]},is_empty:{label:"Est vide",icon:"∅",types:["text","email","phone","url","number","date","textarea","title","select","boolean","checkbox","switch","relation","classification"]},is_not_empty:{label:"N'est pas vide",icon:"∃",types:["text","email","phone","url","number","date","textarea","title","select","boolean","checkbox","switch","relation","classification"]},is_unique:{label:"Est unique",icon:"1x",types:["text","email","phone","url","textarea","title","select","number","relation","classification"]}};function Ke(t){const r=String(t||"text").toLowerCase();return["string","varchar","char","input","text","textarea","longtext"].includes(r)?"text":["tel","telephone"].includes(r)?"phone":["integer","int","float","double","decimal","currency","percent"].includes(r)?"number":["datetime-local","timestamp","datetime"].includes(r)?"date":["dropdown","list","choice","choices","multiselect","multi-select","multi_select","tags"].includes(r)?"select":["bool","checkbox","switch","toggle"].includes(r)?"boolean":r||"text"}function Be(t){const r=Ke(t),i=Object.entries(nt).filter(([s,n])=>n.types.includes(r)).map(([s,n])=>({key:s,...n}));return i.length||r==="text"?i:Object.entries(nt).filter(([s,n])=>n.types.includes("text")).map(([s,n])=>({key:s,...n}))}function ht(t){const r=Ke(t);return r==="number"?"number":r==="date"?"date":"text"}function Br({columns:t=[],fieldFilters:r=[],onFieldFiltersChange:i,allRecords:s=[],sidebarFilters:n=[]}){const[y,o]=a.useState(r.length>0),[g,v]=a.useState(null),[p,b]=a.useState(!1),h=a.useRef(null);a.useEffect(()=>{const u=V=>{p&&h.current&&!h.current.contains(V.target)&&b(!1)};return p&&document.addEventListener("mousedown",u),()=>document.removeEventListener("mousedown",u)},[p]);const _=Pe.useMemo(()=>{const u={};return n.forEach(V=>{u[`classif:${V.id}`]=V.options||[]}),u},[n]),w=t.filter(u=>u.id!=="actions"),N=a.useCallback(u=>{const V=w.find(se=>se.id===u);if(!V)return;const S=u.startsWith("classif:"),L=Be(V.type),c=L.length?L:Be("text"),O=S?c.find(se=>se.key==="equals")||c[0]:c.find(se=>se.key==="contains")||c[0],K={fieldId:u,fieldName:V.name,fieldType:Ke(V.type),operator:O.key,value:"",value2:"",logic:"AND"};i([...r,K]),b(!1),v(r.length)},[w,r,i]),R=a.useCallback((u,V)=>{const S=r.map((L,c)=>c===u?{...L,...V}:L);i(S)},[r,i]),ee=a.useCallback(u=>{const V=r.filter((S,L)=>L!==u);i(V),g===u&&v(null)},[r,i,g]),m=a.useCallback(()=>{i([]),v(null)},[i]),U=u=>["is_empty","is_not_empty","is_unique"].includes(u),J=u=>u==="between",re=u=>u&&u.startsWith("classif:"),Z=u=>["boolean","checkbox","switch","toggle"].includes(String(u||"").toLowerCase()),te=u=>_[u]||[],z=(u,V)=>{const L=te(u).find(c=>c.id===V||c.label===V);return L?L.label:V};return e.jsxs("div",{className:"adv-filters-container",children:[e.jsxs("button",{type:"button",className:"adv-filters-header",onClick:()=>o(!y),children:[e.jsxs("div",{className:"adv-filters-header-left",children:[e.jsx("svg",{viewBox:"0 0 24 24",fill:"none",className:"adv-filters-header-icon",children:e.jsx("path",{d:"M22 3H2L10 12.46V19L14 21V12.46L22 3Z",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round"})}),e.jsx("span",{children:"Filtres avancés"}),r.length>0&&e.jsx("span",{className:"adv-filters-count",children:r.length})]}),e.jsx("svg",{viewBox:"0 0 24 24",fill:"none",className:`adv-filters-chevron ${y?"adv-filters-chevron--open":""}`,children:e.jsx("path",{d:"M9 18L15 12L9 6",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round"})})]}),y&&e.jsxs("div",{className:"adv-filters-body",children:[r.map((u,V)=>{var se;w.find(D=>D.id===u.fieldId);const S=Be(u.fieldType),L=g===V,c=re(u.fieldId),O=c?te(u.fieldId):[],K=u.logic||"AND";return e.jsxs(Pe.Fragment,{children:[V>0&&e.jsxs("div",{className:"adv-filter-connector",children:[e.jsx("span",{className:"adv-filter-connector-line"}),e.jsx("button",{type:"button",className:`adv-filter-connector-badge ${K==="OR"?"adv-filter-connector-badge--or":""}`,onClick:()=>{R(V,{logic:K==="AND"?"OR":"AND"})},title:"Cliquez pour basculer entre ET/OU",children:K==="OR"?"OU":"ET"}),e.jsx("span",{className:"adv-filter-connector-line"})]}),e.jsx("div",{className:`adv-filter-pill ${L?"adv-filter-pill--editing":""}`,children:L?e.jsxs("div",{className:"adv-filter-edit",children:[e.jsxs("div",{className:"adv-filter-row",children:[e.jsx("label",{className:"adv-filter-label",children:"Champ"}),e.jsx("select",{value:u.fieldId,onChange:D=>{const le=w.find(ge=>ge.id===D.target.value);if(le){const ge=Be(le.type),M=ge.length?ge:Be("text"),P=D.target.value.startsWith("classif:")?M.find(k=>k.key==="equals")||M[0]:M.find(k=>k.key===u.operator)||M[0];R(V,{fieldId:le.id,fieldName:le.name,fieldType:Ke(le.type),operator:P.key,value:"",value2:""})}},className:"adv-filter-select",children:w.map(D=>e.jsx("option",{value:D.id,children:D.name},D.id))})]}),e.jsxs("div",{className:"adv-filter-row",children:[e.jsx("label",{className:"adv-filter-label",children:"Condition"}),e.jsx("select",{value:u.operator,onChange:D=>R(V,{operator:D.target.value,value:U(D.target.value)?"":u.value,value2:""}),className:"adv-filter-select",children:S.map(D=>e.jsx("option",{value:D.key,children:D.label},D.key))})]}),!U(u.operator)&&e.jsxs("div",{className:"adv-filter-row",children:[e.jsx("label",{className:"adv-filter-label",children:J(u.operator)?"Valeur min":"Valeur"}),c&&O.length>0?e.jsxs("select",{value:u.value,onChange:D=>R(V,{value:D.target.value}),className:"adv-filter-select",children:[e.jsx("option",{value:"",children:"Sélectionnez..."}),O.map(D=>e.jsx("option",{value:D.label,children:D.label},D.id))]}):Z(u.fieldType)?e.jsxs("select",{value:String(u.value??""),onChange:D=>R(V,{value:D.target.value}),className:"adv-filter-select",children:[e.jsx("option",{value:"",children:"Sélectionnez..."}),e.jsx("option",{value:"true",children:"Oui"}),e.jsx("option",{value:"false",children:"Non"})]}):e.jsx("input",{type:ht(u.fieldType),value:u.value,onChange:D=>R(V,{value:D.target.value}),placeholder:"Saisir une valeur...",className:"adv-filter-input",autoFocus:!0})]}),J(u.operator)&&e.jsxs("div",{className:"adv-filter-row",children:[e.jsx("label",{className:"adv-filter-label",children:"Valeur max"}),e.jsx("input",{type:ht(u.fieldType),value:u.value2||"",onChange:D=>R(V,{value2:D.target.value}),placeholder:"Saisir une valeur max...",className:"adv-filter-input"})]}),e.jsxs("div",{className:"adv-filter-row adv-filter-row--actions",children:[e.jsxs("button",{type:"button",className:"adv-filter-btn-done",onClick:()=>v(null),children:[e.jsx("svg",{viewBox:"0 0 24 24",fill:"none",className:"h-3.5 w-3.5",children:e.jsx("path",{d:"M5 13L9 17L19 7",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round"})}),"OK"]}),e.jsx("button",{type:"button",className:"adv-filter-btn-delete",onClick:()=>ee(V),children:e.jsxs("svg",{viewBox:"0 0 24 24",fill:"none",className:"h-3.5 w-3.5",children:[e.jsx("path",{d:"M20.5001 6H3.5",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"}),e.jsx("path",{d:"M18.8334 8.5L18.3735 15.3991C18.1965 18.054 18.108 19.3815 17.243 20.1907C16.378 21 15.0476 21 12.3868 21H11.6134C8.9526 21 7.6222 21 6.75719 20.1907C5.89218 19.3815 5.80368 18.054 5.62669 15.3991L5.16675 8.5",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"})]})})]})]}):e.jsxs("button",{type:"button",className:"adv-filter-pill-summary",onClick:()=>v(V),children:[e.jsx("span",{className:"adv-filter-pill-field",children:u.fieldName}),e.jsx("span",{className:"adv-filter-pill-op",children:((se=nt[u.operator])==null?void 0:se.label)||u.operator}),!U(u.operator)&&e.jsx("span",{className:"adv-filter-pill-value",children:J(u.operator)?`${u.value||"?"} – ${u.value2||"?"}`:c?z(u.fieldId,u.value):u.value||"..."}),e.jsx("button",{type:"button",className:"adv-filter-pill-remove",onClick:D=>{D.stopPropagation(),ee(V)},children:e.jsx("svg",{viewBox:"0 0 24 24",fill:"none",className:"h-3 w-3",children:e.jsx("path",{d:"M18 6L6 18M6 6L18 18",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round"})})})]})})]},V)}),e.jsxs("div",{className:"adv-filter-add-row",ref:h,children:[e.jsxs("button",{type:"button",className:"adv-filter-add-btn",onClick:()=>b(!p),children:[e.jsx("svg",{viewBox:"0 0 24 24",fill:"none",className:"h-3.5 w-3.5",children:e.jsx("path",{d:"M12 5V19M5 12H19",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round"})}),"Ajouter un filtre"]}),p&&e.jsxs("div",{className:"adv-filter-field-dropdown",children:[e.jsx("div",{className:"adv-filter-field-dropdown-title",children:"Choisir un champ"}),w.map(u=>e.jsxs("button",{type:"button",className:"adv-filter-field-option",onClick:()=>N(u.id),children:[e.jsx("span",{className:"adv-filter-field-type-badge",children:Vr(u.type)}),u.name]},u.id))]})]}),r.length>0&&e.jsx("button",{type:"button",className:"adv-filter-clear",onClick:m,children:"Effacer tous les filtres"})]}),e.jsx("style",{children:`
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
            `})]})}function Vr(t){return{text:"Aa",title:"T",email:"@",phone:"☎",url:"🔗",number:"#",currency:"$",percent:"%",date:"📅",datetime:"🕐",textarea:"¶",select:"☰",relation:"↗",classification:"●"}[t]||"Aa"}const xt=229,gt=500,bt=280;function Pr({entityName:t,entityNamePlural:r,entityIcon:i,accountNumber:s,entitySlug:n,showSidebar:y,onToggleSidebar:o,filters:g=[],activeFilters:v={},onFilterChange:p,columns:b=[],fieldFilters:h=[],onFieldFiltersChange:_,allRecords:w=[],sidebarWidth:N,onSidebarWidthChange:R,viewId:ee}){const[m,U]=a.useState(N||bt),J=a.useRef(!1),re=a.useRef(0),Z=a.useRef(0),te=a.useRef(N||bt),z=a.useRef(R);a.useEffect(()=>{z.current=R},[R]),a.useEffect(()=>{te.current=m},[m]),a.useEffect(()=>{N&&!J.current&&U(N)},[N]);const u=a.useCallback(L=>{L.preventDefault(),J.current=!0,re.current=L.clientX,Z.current=te.current,document.body.style.cursor="col-resize",document.body.style.userSelect="none"},[]);if(a.useEffect(()=>{const L=O=>{if(!J.current)return;const K=O.clientX-re.current,se=Math.min(gt,Math.max(xt,Z.current+K));U(se)},c=()=>{J.current&&(J.current=!1,document.body.style.cursor="",document.body.style.userSelect="",z.current&&z.current(te.current))};return document.addEventListener("mousemove",L),document.addEventListener("mouseup",c),()=>{document.removeEventListener("mousemove",L),document.removeEventListener("mouseup",c)}},[]),!y)return null;const V=(L,c)=>{const O={...v},K=O[L]||[];if(c==="__all__")delete O[L];else{const se=K.indexOf(c);se>-1?(K.splice(se,1),K.length===0?delete O[L]:O[L]=[...K]):O[L]=[...K,c]}p(O)},S=Object.keys(v).length>0;return e.jsxs("div",{style:{position:"relative",width:m,minWidth:xt,maxWidth:gt,flexShrink:0},children:[e.jsxs("div",{className:"panel z-10 space-y-4 overflow-y-auto p-4 h-full",style:{display:"flex",flexDirection:"column",width:"100%"},children:[e.jsx("div",{className:"flex items-center justify-between",children:e.jsx("div",{className:"flex items-center",children:e.jsxs("div",{className:"flex items-center text-center",children:[e.jsx("div",{children:i?e.jsx("iconify-icon",{icon:i,width:"22",style:{color:"var(--primary)"}}):e.jsxs("svg",{width:"24",height:"24",viewBox:"0 0 24 24",fill:"none",xmlns:"http://www.w3.org/2000/svg",className:"h-5 w-5",children:[e.jsx("path",{d:"M20.3116 12.6473L20.8293 10.7154C21.4335 8.46034 21.7356 7.3328 21.5081 6.35703C21.3285 5.58657 20.9244 4.88668 20.347 4.34587C19.6157 3.66095 18.4881 3.35883 16.2331 2.75458C13.978 2.15033 12.8504 1.84821 11.8747 2.07573C11.1042 2.25537 10.4043 2.65945 9.86351 3.23687C9.27709 3.86298 8.97128 4.77957 8.51621 6.44561C8.43979 6.7254 8.35915 7.02633 8.27227 7.35057L8.27222 7.35077L7.75458 9.28263C7.15033 11.5377 6.84821 12.6652 7.07573 13.641C7.25537 14.4115 7.65945 15.1114 8.23687 15.6522C8.96815 16.3371 10.0957 16.6392 12.3508 17.2435L12.3508 17.2435C14.3834 17.7881 15.4999 18.0873 16.415 17.9744C16.5152 17.9621 16.6129 17.9448 16.7092 17.9223C17.4796 17.7427 18.1795 17.3386 18.7203 16.7612C19.4052 16.0299 19.7074 14.9024 20.3116 12.6473Z",stroke:"currentColor",strokeWidth:"1.5"}),e.jsx("path",{opacity:"0.5",d:"M16.415 17.9741C16.2065 18.6126 15.8399 19.1902 15.347 19.6519C14.6157 20.3368 13.4881 20.6389 11.2331 21.2432C8.97798 21.8474 7.85044 22.1495 6.87466 21.922C6.10421 21.7424 5.40432 21.3383 4.86351 20.7609C4.17859 20.0296 3.87647 18.9021 3.27222 16.647L2.75458 14.7151C2.15033 12.46 1.84821 11.3325 2.07573 10.3567C2.25537 9.58627 2.65945 8.88638 3.23687 8.34557C3.96815 7.66065 5.09569 7.35853 7.35077 6.75428C7.77741 6.63996 8.16368 6.53646 8.51621 6.44531",stroke:"currentColor",strokeWidth:"1.5"}),e.jsx("path",{d:"M11.7769 10L16.6065 11.2941",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"}),e.jsx("path",{opacity:"0.5",d:"M11 12.8975L13.8978 13.6739",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"})]})}),e.jsx("h3",{className:"text-lg font-semibold ltr:ml-3 rtl:mr-3",children:t})]})})}),e.jsx("div",{className:"h-px w-full border-b border-[#e0e6ed] dark:border-[#1b2e4b]"}),e.jsx("div",{className:"!mt-0",style:{flex:1,display:"flex",flexDirection:"column"},children:e.jsxs("div",{className:"flex h-full flex-col pb-16",style:{position:"relative"},children:[e.jsx("div",{className:"relative -mr-3.5 h-full grow pr-3.5 overflow-auto",children:e.jsxs("div",{className:"space-y-1",children:[e.jsx("button",{type:"button",className:`flex h-10 w-full items-center justify-between rounded-md p-2 font-medium hover:bg-white-dark/10 hover:text-primary dark:hover:bg-[#181F32] dark:hover:text-primary ${S?"":"bg-gray-100 dark:text-primary text-primary dark:bg-[#181F32]"}`,onClick:()=>p({}),children:e.jsxs("div",{className:"flex items-center",children:[e.jsx("iconify-icon",{icon:"solar:checklist-minimalistic-bold-duotone",width:"20"}),e.jsxs("div",{className:"ltr:ml-3 rtl:mr-3",children:["Toutes les ",r||t+"s"]})]})}),g.map(L=>e.jsxs("div",{children:[e.jsx("div",{className:"h-px w-full border-b border-[#e0e6ed] dark:border-[#1b2e4b] my-2"}),e.jsx("div",{className:"px-1 py-2 text-white-dark text-xs uppercase font-semibold tracking-wider",children:L.name}),L.type==="tags"?e.jsx("div",{className:"flex flex-wrap gap-1.5 px-1",children:L.options.map(c=>{const O=(v[L.id]||[]).includes(c.id);return e.jsxs("button",{type:"button",className:"mb-0 py-0.5 px-2.5 text-xs rounded-full cursor-pointer transition-all font-medium",style:{border:`1.5px solid ${c.color||"#9ca3af"}`,color:O?"#fff":c.color||"#9ca3af",backgroundColor:O?c.color||"#9ca3af":"transparent"},onClick:()=>V(L.id,c.id),children:[c.label,c.count!==void 0&&e.jsx("span",{style:{opacity:.7,marginLeft:"2px"},children:c.count})]},c.id)})}):e.jsx("div",{className:"space-y-0.5",children:L.options.map(c=>{const O=(v[L.id]||[]).includes(c.id);return e.jsxs("button",{type:"button",className:`flex h-9 w-full items-center rounded-md px-2 py-1.5 text-sm font-medium transition-colors hover:bg-white-dark/10 hover:text-primary dark:hover:bg-[#181F32] dark:hover:text-primary ${O?"bg-gray-100 text-primary dark:bg-[#181F32] dark:text-primary":""}`,onClick:()=>V(L.id,c.id),children:[e.jsx("span",{className:"inline-block w-3 h-3 rounded-full mr-2.5 flex-shrink-0",style:{backgroundColor:c.color||"#9ca3af"}}),e.jsx("span",{className:"truncate",children:c.label}),c.count!==void 0&&e.jsx("span",{className:"ml-auto text-xs opacity-60",children:c.count})]},c.id)})})]},L.id)),e.jsx(Br,{columns:b,fieldFilters:h,onFieldFiltersChange:_,allRecords:w,sidebarFilters:g})]})}),e.jsx("div",{className:"absolute bottom-0 w-full p-4 left-0",children:e.jsxs("button",{type:"button",className:"btn btn-primary w-full",onClick:async()=>{try{const c=await(await fetch(`/account/${s}/record/api/create-draft`,{method:"POST",headers:{"Content-Type":"application/json"},credentials:"include",body:JSON.stringify({entitySlug:n,viewId:ee})})).json();c.success&&c._id&&(window.location.href=je(s,n,c._id,"fiche"))}catch(L){console.error("[CreateDraft]",L)}},children:[e.jsxs("svg",{xmlns:"http://www.w3.org/2000/svg",width:"24px",height:"24px",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round",className:"h-5 w-5 ltr:mr-2 rtl:ml-2",children:[e.jsx("line",{x1:"12",y1:"5",x2:"12",y2:"19"}),e.jsx("line",{x1:"5",y1:"12",x2:"19",y2:"12"})]}),"Ajouter"]})})]})})]}),e.jsx("div",{onMouseDown:u,style:{position:"absolute",top:0,right:-3,width:6,height:"100%",cursor:"col-resize",zIndex:20,display:"flex",alignItems:"center",justifyContent:"center"},onMouseEnter:L=>{L.currentTarget.querySelector(".resize-bar").style.opacity="1"},onMouseLeave:L=>{J.current||(L.currentTarget.querySelector(".resize-bar").style.opacity="0")},children:e.jsx("div",{className:"resize-bar",style:{width:3,height:"100%",borderRadius:2,background:"var(--primary, #4361ee)",opacity:0,transition:"opacity 0.2s ease"}})})]})}const Dr=["#4361ee","#805dca","#e2a03f","#00ab55","#e7515a","#2196d4","#3b3f5c","#009688","#ff5722","#607d8b"],mt={contains:{label:"Contient",icon:"⊃",types:["text","email","phone","url","textarea","title","relation"]},not_contains:{label:"Ne contient pas",icon:"⊅",types:["text","email","phone","url","textarea","title","relation"]},equals:{label:"Est égal à",icon:"=",types:["text","email","phone","url","number","date","title","select","boolean","checkbox","switch","relation","classification"]},not_equals:{label:"N'est pas égal à",icon:"≠",types:["text","email","phone","url","number","date","title","select","boolean","checkbox","switch","relation","classification"]},starts_with:{label:"Commence par",icon:"A…",types:["text","email","phone","url","title"]},ends_with:{label:"Se termine par",icon:"…Z",types:["text","email","phone","url","title"]},gt:{label:"Supérieur à",icon:">",types:["number","date"]},gte:{label:"Supérieur ou égal",icon:"≥",types:["number","date"]},lt:{label:"Inférieur à",icon:"<",types:["number","date"]},lte:{label:"Inférieur ou égal",icon:"≤",types:["number","date"]},between:{label:"Entre",icon:"↔",types:["number","date"]},is_empty:{label:"Est vide",icon:"∅",types:["text","email","phone","url","number","date","textarea","title","select","boolean","checkbox","switch","relation","classification"]},is_not_empty:{label:"N'est pas vide",icon:"∃",types:["text","email","phone","url","number","date","textarea","title","select","boolean","checkbox","switch","relation","classification"]},is_unique:{label:"Est unique",icon:"1x",types:["text","email","phone","url","textarea","title","select","number","relation","classification"]}};function Ye(t){const r=String(t||"text").toLowerCase();return["string","varchar","char","input","text","textarea","longtext"].includes(r)?"text":["tel","telephone"].includes(r)?"phone":["integer","int","float","double","decimal","currency","percent"].includes(r)?"number":["datetime-local","timestamp","datetime"].includes(r)?"date":["dropdown","list","choice","choices","multiselect","multi-select","multi_select","tags"].includes(r)?"select":["bool","checkbox","switch","toggle"].includes(r)?"boolean":r||"text"}function Ve(t){const r=Ye(t),i=Object.entries(mt).filter(([s,n])=>n.types.includes(r)).map(([s,n])=>({key:s,...n}));return i.length||r==="text"?i:Object.entries(mt).filter(([s,n])=>n.types.includes("text")).map(([s,n])=>({key:s,...n}))}function vt(t){const r=Ye(t);return r==="number"?"number":r==="date"?"date":"text"}function Hr({savedViews:t=[],activeViewId:r,onSelectView:i,onCreateView:s,onDeleteView:n,onRenameView:y,onUpdateViewFilters:o,hasActiveFilters:g=!1,activeFilters:v={},fieldFilters:p=[],sidebarFilters:b=[],columns:h=[],externalOpenCreate:_=!1,onCloseExternalCreate:w}){const[N,R]=a.useState(!1),[ee,m]=a.useState(!1),[U,J]=a.useState(""),[re,Z]=a.useState("#4361ee"),[te,z]=a.useState(null),[u,V]=a.useState(null),[S,L]=a.useState(""),[c,O]=a.useState(null),[K,se]=a.useState([]),[D,le]=a.useState({}),[ge,M]=a.useState(!1),C=a.useRef(null),P=a.useRef(null),k=a.useRef(null),j=a.useRef(null);a.useEffect(()=>{const f=A=>{te&&P.current&&!P.current.contains(A.target)&&z(null)};return te&&document.addEventListener("mousedown",f),()=>document.removeEventListener("mousedown",f)},[te]),a.useEffect(()=>{N&&k.current&&setTimeout(()=>{var f;return(f=k.current)==null?void 0:f.focus()},100)},[N]),a.useEffect(()=>{_&&(R(!0),se([...p]),w==null||w())},[_]),a.useEffect(()=>{N&&!c&&(se([...p]),le(JSON.parse(JSON.stringify(v||{}))))},[N]),a.useEffect(()=>{const f=A=>{ge&&C.current&&!C.current.contains(A.target)&&M(!1)};return ge&&document.addEventListener("mousedown",f),()=>document.removeEventListener("mousedown",f)},[ge]),a.useEffect(()=>{u&&j.current&&(j.current.focus(),j.current.select())},[u]);const F=(f,A)=>{f.preventDefault(),z({viewId:A,x:f.clientX,y:f.clientY})},I=()=>{U.trim()&&(s({name:U.trim(),color:re,filters:D,fieldFilters:K}),J(""),Z("#4361ee"),se([]),le({}),R(!1))},ce=a.useMemo(()=>h.filter(f=>f.id!=="actions"),[h]),ie=a.useMemo(()=>{const f={};return b.forEach(A=>{f[`classif:${A.id}`]=A.options||[]}),f},[b]),x=a.useCallback(f=>{const A=ce.find(ne=>ne.id===f);if(!A)return;const ae=f.startsWith("classif:"),be=Ve(A.type),we=be.length?be:Ve("text"),Ne=ae?we.find(ne=>ne.key==="equals")||we[0]:we.find(ne=>ne.key==="contains")||we[0],ye={fieldId:f,fieldName:A.name,fieldType:Ye(A.type),operator:Ne.key,value:"",value2:"",logic:"AND"};se(ne=>[...ne,ye]),M(!1)},[ce]),T=a.useCallback((f,A)=>{se(ae=>ae.map((be,we)=>we===f?{...be,...A}:be))},[]),l=a.useCallback(f=>{se(A=>A.filter((ae,be)=>be!==f))},[]),B=f=>{const A=t.find(ae=>ae._id===f);A&&(V(f),L(A.name)),z(null)},H=()=>{u&&S.trim()&&y(u,S.trim()),V(null),L("")},Q=f=>{n(f),z(null)},q=f=>{const A=t.find(ae=>ae._id===f);A&&(O(f),J(A.name||""),Z(A.color||"#4361ee"),se(A.fieldFilters?JSON.parse(JSON.stringify(A.fieldFilters)):[]),le(A.filters?JSON.parse(JSON.stringify(A.filters)):{}),R(!0),z(null))},X=()=>{!U.trim()||!c||(o(c,D,K,U.trim(),re),J(""),Z("#4361ee"),se([]),le({}),O(null),R(!1))},xe=f=>{var ae;let A=0;return f.filters&&(A+=Object.keys(f.filters).filter(be=>be!=="__favourites").length),(ae=f.fieldFilters)!=null&&ae.length&&(A+=f.fieldFilters.length),A};return e.jsxs(e.Fragment,{children:[e.jsxs("div",{className:"saved-views-tabs",children:[e.jsxs("button",{type:"button",className:`saved-view-tab ${r?"":"saved-view-tab--active"}`,onClick:()=>i(null),children:[e.jsxs("svg",{className:"saved-view-tab-icon",viewBox:"0 0 24 24",fill:"none",children:[e.jsx("path",{d:"M2 12C2 7.28595 2 4.92893 3.46447 3.46447C4.92893 2 7.28595 2 12 2C16.714 2 19.0711 2 20.5355 3.46447C22 4.92893 22 7.28595 22 12C22 16.714 22 19.0711 20.5355 20.5355C19.0711 22 16.714 22 12 22C7.28595 22 4.92893 22 3.46447 20.5355C2 19.0711 2 16.714 2 12Z",stroke:"currentColor",strokeWidth:"1.5"}),e.jsx("path",{d:"M6 12H18",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"}),e.jsx("path",{d:"M6 8H18",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"}),e.jsx("path",{d:"M6 16H18",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"})]}),"Tout"]}),t.map(f=>e.jsx("button",{type:"button",className:`saved-view-tab ${r===f._id?"saved-view-tab--active":""}`,style:{"--tab-color":f.color||"#4361ee"},onClick:()=>i(f._id),onContextMenu:A=>F(A,f._id),children:u===f._id?e.jsx("input",{ref:j,type:"text",value:S,onChange:A=>L(A.target.value),onBlur:H,onKeyDown:A=>{A.key==="Enter"&&H(),A.key==="Escape"&&(V(null),L(""))},className:"saved-view-tab-edit-input",onClick:A=>A.stopPropagation()}):e.jsxs(e.Fragment,{children:[e.jsx("span",{className:"saved-view-tab-dot",style:{backgroundColor:f.color||"#4361ee"}}),e.jsx("span",{className:"saved-view-tab-name",children:f.name}),xe(f)>0&&e.jsx("span",{className:"saved-view-tab-badge",children:xe(f)})]})},f._id)),e.jsx("button",{type:"button",className:"saved-view-tab saved-view-tab--add",onClick:()=>{O(null),J(""),Z("#4361ee"),R(!0)},title:"Enregistrer une vue",children:e.jsx("svg",{viewBox:"0 0 24 24",fill:"none",className:"h-3.5 w-3.5",children:e.jsx("path",{d:"M12 5V19M5 12H19",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round"})})})]}),te&&e.jsxs("div",{ref:P,className:"saved-view-context-menu",style:{position:"fixed",top:te.y,left:te.x,zIndex:10001},children:[e.jsxs("button",{className:"saved-view-context-item",onClick:()=>B(te.viewId),children:[e.jsx("svg",{viewBox:"0 0 24 24",fill:"none",className:"h-4 w-4",children:e.jsx("path",{d:"M13.9027 6.37027L17.6297 10.0973M4 20.0001H8L18.5 9.50006C18.9978 9.00236 19.2786 8.32622 19.2786 7.62142C19.2786 6.91661 18.9978 6.24047 18.5 5.74277C18.0023 5.24508 17.3261 4.96426 16.6213 4.96426C15.9165 4.96426 15.2404 5.24508 14.7427 5.74277L4 16.0001V20.0001Z",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round"})}),"Renommer"]}),e.jsxs("button",{className:"saved-view-context-item",onClick:()=>q(te.viewId),children:[e.jsxs("svg",{viewBox:"0 0 24 24",fill:"none",className:"h-4 w-4",children:[e.jsx("path",{d:"M4.06189 13C4.02104 12.6724 4 12.3387 4 12C4 7.58172 7.58172 4 12 4C14.5006 4 16.7332 5.14727 18.2002 6.94416M19.9381 11C19.979 11.3276 20 11.6613 20 12C20 16.4183 16.4183 20 12 20C9.49944 20 7.26681 18.8527 5.79984 17.0558",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round"}),e.jsx("path",{d:"M15 7H19V3",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round"}),e.jsx("path",{d:"M9 17H5V21",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round"})]}),"Modifier la vue"]}),e.jsx("div",{className:"saved-view-context-separator"}),e.jsxs("button",{className:"saved-view-context-item saved-view-context-item--danger",onClick:()=>Q(te.viewId),children:[e.jsxs("svg",{viewBox:"0 0 24 24",fill:"none",className:"h-4 w-4",children:[e.jsx("path",{d:"M20.5001 6H3.5",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"}),e.jsx("path",{d:"M18.8334 8.5L18.3735 15.3991C18.1965 18.054 18.108 19.3815 17.243 20.1907C16.378 21 15.0476 21 12.3868 21H11.6134C8.9526 21 7.6222 21 6.75719 20.1907C5.89218 19.3815 5.80368 18.054 5.62669 15.3991L5.16675 8.5",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"}),e.jsx("path",{d:"M9.5 11L10 16",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"}),e.jsx("path",{d:"M14.5 11L14 16",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"}),e.jsx("path",{d:"M6.5 6C6.55588 6 6.58382 6 6.60915 5.99936C7.43259 5.97849 8.15902 5.45491 8.43922 4.68032C8.44784 4.65649 8.45667 4.62999 8.47434 4.57697L8.57143 4.28571C8.65431 4.03708 8.69575 3.91276 8.75071 3.8072C8.97001 3.38607 9.37574 3.09364 9.84461 3.01877C9.96213 3 10.0932 3 10.3553 3H13.6447C13.9068 3 14.0379 3 14.1554 3.01877C14.6243 3.09364 15.03 3.38607 15.2493 3.8072C15.3043 3.91276 15.3457 4.03708 15.4286 4.28571L15.5257 4.57697C15.5433 4.62992 15.5522 4.65651 15.5608 4.68032C15.841 5.45491 16.5674 5.97849 17.3909 5.99936C17.4162 6 17.4441 6 17.5 6",stroke:"currentColor",strokeWidth:"1.5"})]}),"Supprimer"]})]}),N&&e.jsx("div",{className:"saved-view-modal-overlay",onClick:()=>R(!1),children:e.jsxs("div",{className:"saved-view-modal",onClick:f=>f.stopPropagation(),children:[e.jsxs("div",{className:"saved-view-modal-header",children:[e.jsx("h3",{children:c?"Modifier la vue":"Enregistrer la vue"}),e.jsx("button",{type:"button",className:"saved-view-modal-close",onClick:()=>{R(!1),O(null)},children:e.jsx("svg",{viewBox:"0 0 24 24",fill:"none",className:"h-5 w-5",children:e.jsx("path",{d:"M18 6L6 18M6 6L18 18",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"})})})]}),e.jsxs("div",{className:"saved-view-modal-body",children:[e.jsxs("div",{className:"saved-view-form-group",children:[e.jsx("label",{className:"saved-view-form-label",children:"Nom de la vue"}),e.jsx("input",{ref:k,type:"text",value:U,onChange:f=>J(f.target.value),onKeyDown:f=>{f.key==="Enter"&&I()},placeholder:"Ex: Hôtels, Clients VIP...",className:"saved-view-form-input"})]}),e.jsxs("div",{className:"saved-view-form-group",children:[e.jsx("label",{className:"saved-view-form-label",children:"Couleur"}),e.jsx("div",{className:"saved-view-color-grid",children:Dr.map(f=>e.jsx("button",{type:"button",className:`saved-view-color-swatch ${re===f?"saved-view-color-swatch--active":""}`,style:{backgroundColor:f},onClick:()=>Z(f),children:re===f&&e.jsx("svg",{viewBox:"0 0 24 24",fill:"none",className:"h-3 w-3",children:e.jsx("path",{d:"M5 13L9 17L19 7",stroke:"white",strokeWidth:"2.5",strokeLinecap:"round",strokeLinejoin:"round"})})},f))})]}),b.length>0&&e.jsxs("div",{className:"saved-view-form-group",children:[e.jsx("label",{className:"saved-view-form-label",children:"Filtres de classification"}),e.jsx("div",{className:"svm-classif-editor",children:b.map(f=>{const A=D[f.id]||[];return e.jsxs("div",{className:"svm-classif-group",children:[e.jsx("span",{className:"svm-classif-group-label",children:f.name}),e.jsx("div",{className:"svm-classif-options",children:(f.options||[]).map(ae=>{const be=A.includes(ae.id);return e.jsxs("button",{type:"button",className:`svm-classif-pill ${be?"svm-classif-pill--active":""}`,style:{"--pill-color":ae.color||"#9ca3af"},onClick:()=>{le(we=>{const Ne=we[f.id]||[];let ye;be?ye=Ne.filter(Se=>Se!==ae.id):ye=[...Ne,ae.id];const ne={...we};return ye.length>0?ne[f.id]=ye:delete ne[f.id],ne})},children:[be&&e.jsx("svg",{viewBox:"0 0 24 24",fill:"none",className:"svm-classif-check",children:e.jsx("path",{d:"M5 13L9 17L19 7",stroke:"currentColor",strokeWidth:"2.5",strokeLinecap:"round",strokeLinejoin:"round"})}),ae.label]},ae.id)})})]},f.id)})})]}),e.jsxs("div",{className:"saved-view-form-group",children:[e.jsx("label",{className:"saved-view-form-label",children:"Filtres avancés"}),e.jsxs("div",{className:"svm-filter-builder",children:[K.map((f,A)=>{var pe;const ae=(pe=f.fieldId)==null?void 0:pe.startsWith("classif:"),be=ae?ie[f.fieldId]||[]:[],we=Ve(f.fieldType),Ne=["is_empty","is_not_empty","is_unique"].includes(f.operator),ye=f.operator==="between",ne=["boolean","checkbox","switch","toggle"].includes(String(f.fieldType||"").toLowerCase()),Se=f.logic||"AND";return e.jsxs(Pe.Fragment,{children:[A>0&&e.jsxs("div",{className:"svm-filter-connector",children:[e.jsx("span",{className:"svm-filter-connector-line"}),e.jsx("button",{type:"button",className:`svm-filter-connector-badge ${Se==="OR"?"svm-filter-connector-badge--or":""}`,onClick:()=>T(A,{logic:Se==="AND"?"OR":"AND"}),title:"Cliquez pour basculer ET/OU",children:Se==="OR"?"OU":"ET"}),e.jsx("span",{className:"svm-filter-connector-line"})]}),e.jsxs("div",{className:"svm-filter-row",children:[e.jsx("select",{value:f.fieldId,onChange:oe=>{const _e=ce.find(Le=>Le.id===oe.target.value);if(_e){const Le=oe.target.value.startsWith("classif:"),Ie=Ve(_e.type),$e=Ie.length?Ie:Ve("text"),Ze=Le?$e.find(ze=>ze.key==="equals")||$e[0]:$e.find(ze=>ze.key===f.operator)||$e[0];T(A,{fieldId:_e.id,fieldName:_e.name,fieldType:Ye(_e.type),operator:Ze.key,value:"",value2:""})}},className:"svm-filter-select svm-filter-select--field",children:ce.map(oe=>e.jsx("option",{value:oe.id,children:oe.name},oe.id))}),e.jsx("select",{value:f.operator,onChange:oe=>T(A,{operator:oe.target.value,value:["is_empty","is_not_empty","is_unique"].includes(oe.target.value)?"":f.value,value2:""}),className:"svm-filter-select svm-filter-select--op",children:we.map(oe=>e.jsx("option",{value:oe.key,children:oe.label},oe.key))}),!Ne&&(ae&&be.length>0?e.jsxs("select",{value:f.value,onChange:oe=>T(A,{value:oe.target.value}),className:"svm-filter-select svm-filter-select--val",children:[e.jsx("option",{value:"",children:"Sélectionnez..."}),be.map(oe=>e.jsx("option",{value:oe.label,children:oe.label},oe.id))]}):ne?e.jsxs("select",{value:String(f.value??""),onChange:oe=>T(A,{value:oe.target.value}),className:"svm-filter-select svm-filter-select--val",children:[e.jsx("option",{value:"",children:"Sélectionnez..."}),e.jsx("option",{value:"true",children:"Oui"}),e.jsx("option",{value:"false",children:"Non"})]}):e.jsx("input",{type:vt(f.fieldType),value:f.value,onChange:oe=>T(A,{value:oe.target.value}),placeholder:"Valeur...",className:"svm-filter-input"})),ye&&e.jsx("input",{type:vt(f.fieldType),value:f.value2||"",onChange:oe=>T(A,{value2:oe.target.value}),placeholder:"Max...",className:"svm-filter-input"}),e.jsx("button",{type:"button",className:"svm-filter-remove",onClick:()=>l(A),title:"Supprimer ce filtre",children:e.jsx("svg",{viewBox:"0 0 24 24",fill:"none",className:"h-3.5 w-3.5",children:e.jsx("path",{d:"M18 6L6 18M6 6L18 18",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round"})})})]})]},A)}),e.jsxs("div",{className:"svm-filter-add-row",ref:C,children:[e.jsxs("button",{type:"button",className:"svm-filter-add-btn",onClick:()=>M(!ge),children:[e.jsx("svg",{viewBox:"0 0 24 24",fill:"none",className:"h-3.5 w-3.5",children:e.jsx("path",{d:"M12 5V19M5 12H19",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round"})}),"Ajouter un filtre"]}),ge&&e.jsxs("div",{className:"svm-filter-field-dropdown",children:[e.jsx("div",{className:"svm-filter-field-dropdown-title",children:"Choisir un champ"}),ce.map(f=>e.jsx("button",{type:"button",className:"svm-filter-field-option",onClick:()=>x(f.id),children:f.name},f.id))]})]})]})]})]}),e.jsxs("div",{className:"saved-view-modal-footer",children:[e.jsx("button",{type:"button",className:"saved-view-btn saved-view-btn--cancel",onClick:()=>{R(!1),O(null)},children:"Annuler"}),e.jsxs("button",{type:"button",className:"saved-view-btn saved-view-btn--save",onClick:c?X:I,disabled:!U.trim(),children:[e.jsx("svg",{viewBox:"0 0 24 24",fill:"none",className:"h-4 w-4",children:e.jsx("path",{d:"M5 13L9 17L19 7",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round"})}),c?"Mettre à jour":"Enregistrer"]})]})]})}),e.jsx("style",{children:`
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
            `})]})}const rt=[{label:"Nouveau",color:"#64748b"},{label:"Qualification",color:"#3b82f6"},{label:"Proposition",color:"#f59e0b"},{label:"Gagné",color:"#22c55e"},{label:"Perdu",color:"#ef4444"}],qr=new Set(["select","multiselect","multi-select","multi_select","tags","tag"]);function We(t){var r;return String(((r=t==null?void 0:t._id)==null?void 0:r.$oid)||(t==null?void 0:t._id)||t||"")}function Jr(t){return String(t||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,"")||`pipeline-${Date.now()}`}function yt(t,r){const i=We((t==null?void 0:t._id)||(t==null?void 0:t.id)||(t==null?void 0:t.value)||(t==null?void 0:t.label)||(t==null?void 0:t.name)||t);return{id:i,value:String((t==null?void 0:t.value)??i),label:(t==null?void 0:t.label)||(t==null?void 0:t.name)||String((t==null?void 0:t.value)||i||`Étape ${r+1}`),color:(t==null?void 0:t.color)||(t==null?void 0:t.couleur)||"#6366f1",order:Number.isFinite(Number(t==null?void 0:t.order))?Number(t.order):r}}function Ur(t,r){if(!t)return{value:"",label:`Option ${r+1}`,color:"#64748b",order:r};if(typeof t=="string")return{value:t,label:t,color:"#64748b",order:r};const i=String(t.value??t.id??t._id??t.label??t.name??"");return{value:i,label:t.label||t.name||i||`Option ${r+1}`,color:t.color||t.couleur||t.bg||"#64748b",order:Number.isFinite(Number(t.order))?Number(t.order):r}}function Kr(t,r=[]){const i=[],s=new Set,n=(o,g)=>{const v=We(o);if(!v||s.has(v))return;s.add(v);const p=(o.options||[]).map(yt).sort((b,h)=>b.order-h.order);i.push({id:v,value:g==="status"?"status":v,label:o.name||(g==="status"?"Statut":"Pipeline"),source:g,options:p})},y=o=>{var w,N;const g=We(o);if(!g||s.has(`field:${g}`))return;const v=o.type_config||o.typeConfig||{},p=String(o.fieldType||o.type||((w=o.render)==null?void 0:w.input)||"").toLowerCase(),b=String(((N=o.render)==null?void 0:N.input)||"").toLowerCase();if(!(p==="select"||b==="select")||v.multiple||!v.useAsPipeline)return;const _=(v.options||o.options||[]).map(yt).filter(R=>R.id||R.label).sort((R,ee)=>R.order-ee.order);s.add(`field:${g}`),i.push({id:g,value:`field:${g}`,label:o.label||o.name||"Pipeline",source:"field",typeConfig:v,options:_})};return t!=null&&t.statusClassification&&n(t.statusClassification,"status"),((t==null?void 0:t.classifications)||[]).forEach(o=>{n(o,"classification")}),r.forEach(o=>{n(o,"classification")}),((t==null?void 0:t.customFields)||[]).forEach(y),i}function Yr(t){return((t==null?void 0:t.customFields)||[]).filter(r=>r&&typeof r=="object").map(r=>{var y,o,g,v,p,b,h;const i=String(r.fieldType||r.type||((y=r.render)==null?void 0:y.input)||"").toLowerCase(),s=String(((g=(o=r.render)==null?void 0:o.display)==null?void 0:g.card)||((p=(v=r.render)==null?void 0:v.display)==null?void 0:p.table)||"").toLowerCase(),n=(((b=r.type_config)==null?void 0:b.options)||((h=r.typeConfig)==null?void 0:h.options)||r.options||[]).map(Ur).filter(_=>_.value||_.label);return{id:We(r),label:r.label||r.name||"Champ",type:i,options:n,eligible:qr.has(i)||["badge","chip","chips","tags"].includes(s)||n.length>0}}).filter(r=>r.id&&r.eligible)}function Zr(t,r){if(!t.length)return"";const i=(r==null?void 0:r.kanbanField)||"status";if(i==="status"&&t.some(n=>n.value==="status"))return"status";const s=t.find(n=>n.value===i||n.id===i);return(s==null?void 0:s.value)||t[0].value}function st({icon:t,title:r,onClick:i,disabled:s,tone:n="neutral"}){const y=n==="danger"?"hover:border-red-200 hover:bg-red-50 hover:text-red-600 dark:hover:border-red-500/30 dark:hover:bg-red-950/30":"hover:border-primary/30 hover:bg-primary/5 hover:text-primary";return e.jsx("button",{type:"button",title:r,onClick:i,disabled:s,className:`grid h-8 w-8 place-items-center rounded-lg border border-gray-200 bg-white text-gray-400 transition disabled:opacity-40 dark:border-white/10 dark:bg-[#111827] dark:text-white-dark ${y}`,children:e.jsx("iconify-icon",{icon:t,width:"15"})})}function Xr({open:t,accountNumber:r,entityId:i,entityData:s,viewId:n,viewSettings:y,onClose:o,onSaved:g}){const[v,p]=a.useState([]),b=a.useMemo(()=>Kr(s,v),[s,v]),h=a.useMemo(()=>Yr(s),[s]),[_,w]=a.useState(""),N=b.find(M=>M.value===_)||b[0]||null,[R,ee]=a.useState([]),[m,U]=a.useState([]),[J,re]=a.useState(""),[Z,te]=a.useState([]),[z,u]=a.useState(!1),[V,S]=a.useState("");if(a.useEffect(()=>{t&&(S(""),w(M=>M&&b.some(C=>C.value===M)?M:Zr(b,y)),te(Array.isArray(y==null?void 0:y.kanbanTagFields)?y.kanbanTagFields:[]),U([]))},[t,b,y]),a.useEffect(()=>{if(!t||!N){ee([]);return}ee(N.options.map(M=>({...M}))),U([])},[t,N==null?void 0:N.id]),!t)return null;const L=(M,C)=>{ee(P=>P.map(k=>k.id===M?{...k,...C}:k))},c=(M,C)=>{ee(P=>{const k=P.findIndex(ce=>ce.id===M),j=k+C;if(k<0||j<0||j>=P.length)return P;const F=[...P],[I]=F.splice(k,1);return F.splice(j,0,I),F})},O=()=>{const M=R.length,C=rt[M%rt.length];ee(P=>[...P,{id:`tmp_${Date.now()}_${M}`,label:C.label,color:C.color,order:M,isNew:!0}])},K=M=>{ee(C=>C.filter(P=>P.id!==M.id)),!M.isNew&&M.id&&U(C=>[...C,M.id])},se=M=>{te(C=>C.includes(M)?C.filter(P=>P!==M):[...C,M])},D=async(M,C)=>{const P=await fetch(M,{method:"POST",headers:{"Content-Type":"application/json"},credentials:"include",body:JSON.stringify(C)}),k=await P.json().catch(()=>({}));if(!P.ok||k.error||k.success===!1)throw new Error(k.error||`Erreur HTTP ${P.status}`);return k},le=async()=>{const M=J.trim();if(!M){S("Nom requis");return}u(!0),S("");try{const P=(await D(`/account/${r}/classification/api/create`,{name:M,slug:Jr(M),type:"status",entities:i?[i]:[],options:rt})).classification;p(k=>[...k,P]),w(We(P)),re("")}catch(C){S(C.message||"Création impossible")}finally{u(!1)}},ge=async()=>{if(!N){S("Pipeline requise");return}const M=R.map((C,P)=>({...C,label:String(C.label||"").trim(),color:C.color||"#6366f1",order:P})).filter(C=>C.label);if(!M.length){S("Ajoute au moins une étape");return}u(!0),S("");try{const C=new Map(N.options.map(j=>[j.id,j])),P=[];if(N.source==="field"){const j=M.map((F,I)=>{const ce=String(F.value||(String(F.id).startsWith("tmp_")?F.label:F.id));return{label:F.label,value:ce,color:F.color,order:I}});await D(`/account/${r}/field-template/api/${N.id}/update`,{typeConfig:{...N.typeConfig||{},useAsPipeline:!0,options:j}}),P.push(...M.map((F,I)=>({...F,id:String(F.value||(String(F.id).startsWith("tmp_")?F.label:F.id)),order:I,isNew:!1})))}else{for(const j of M){if(j.isNew||j.id.startsWith("tmp_")){const I=await D(`/account/${r}/classification/api/fast-add`,{classificationId:N.id,label:j.label,color:j.color});P.push({...j,id:We(I.option),isNew:!1});continue}const F=C.get(j.id);F&&(F.label!==j.label||F.color!==j.color)&&await D(`/account/${r}/classification/api/update-option`,{classificationId:N.id,optionId:j.id,label:j.label,color:j.color}),P.push(j)}for(const j of m)await D(`/account/${r}/classification/api/delete-option`,{classificationId:N.id,optionId:j});await D(`/account/${r}/classification/api/reorder`,{classificationId:N.id,options:P.map((j,F)=>({id:j.id,order:F}))})}const k={...y||{},viewMode:"kanban",kanbanField:N.value,kanbanTagFields:Z.filter(j=>h.some(F=>F.id===j))};await D(`/account/${r}/api/view/config`,{viewId:n,settings:k}),g==null||g(k)}catch(C){S(C.message||"Sauvegarde impossible")}finally{u(!1)}};return Fe.createPortal(e.jsx("div",{role:"dialog","aria-modal":"true",className:"fixed inset-0 flex items-center justify-center bg-slate-950/45 p-4",style:{zIndex:1e4},onMouseDown:M=>{M.target===M.currentTarget&&!z&&(o==null||o())},children:e.jsxs("div",{className:"flex max-h-[88vh] w-full max-w-4xl flex-col overflow-hidden rounded-lg border border-gray-100 bg-white shadow-2xl dark:border-white/10 dark:bg-[#0e1726]",onMouseDown:M=>M.stopPropagation(),children:[e.jsxs("div",{className:"flex items-center justify-between gap-3 border-b border-gray-100 px-5 py-4 dark:border-white/10",children:[e.jsxs("div",{className:"flex min-w-0 items-center gap-3",children:[e.jsx("div",{className:"grid h-9 w-9 place-items-center rounded-lg bg-primary/10 text-primary",children:e.jsx("iconify-icon",{icon:"solar:slider-horizontal-bold-duotone",width:"19"})}),e.jsxs("div",{className:"min-w-0",children:[e.jsx("div",{className:"truncate text-sm font-bold text-gray-900 dark:text-white",children:"Configurer la pipeline"}),e.jsx("div",{className:"truncate text-xs text-gray-400",children:(s==null?void 0:s.name)||"Entité"})]})]}),e.jsx("button",{type:"button",onClick:()=>!z&&(o==null?void 0:o()),className:"grid h-8 w-8 place-items-center rounded-lg bg-gray-100 text-gray-500 transition hover:bg-gray-200 dark:bg-dark/50 dark:text-white-dark dark:hover:bg-dark",title:"Fermer",children:e.jsx("iconify-icon",{icon:"solar:close-circle-bold",width:"17"})})]}),e.jsx("div",{className:"min-h-0 flex-1 overflow-y-auto p-5",children:e.jsxs("div",{className:"grid gap-5 lg:grid-cols-[minmax(0,1fr)_270px]",children:[e.jsxs("div",{className:"space-y-5",children:[e.jsxs("div",{className:"grid gap-3 rounded-lg border border-gray-100 bg-gray-50/70 p-3 dark:border-white/10 dark:bg-dark/20 md:grid-cols-[minmax(0,1fr)_minmax(220px,0.75fr)]",children:[e.jsxs("label",{className:"grid gap-1.5",children:[e.jsx("span",{className:"text-[11px] font-bold uppercase text-gray-400",children:"Champ pipeline"}),e.jsx("select",{value:_,onChange:M=>w(M.target.value),className:"form-select h-10 rounded-lg border-gray-200 bg-white text-sm font-semibold text-gray-800 dark:border-white/10 dark:bg-[#1b2e4b] dark:text-white",children:b.map(M=>e.jsx("option",{value:M.value,children:M.label},M.value))})]}),e.jsxs("div",{className:"grid gap-1.5",children:[e.jsx("span",{className:"text-[11px] font-bold uppercase text-gray-400",children:"Créer une pipeline"}),e.jsxs("div",{className:"flex gap-2",children:[e.jsx("input",{type:"text",value:J,onChange:M=>re(M.target.value),onKeyDown:M=>{M.key==="Enter"&&(M.preventDefault(),le())},className:"form-input h-10 min-w-0 flex-1 rounded-lg border-gray-200 bg-white text-sm dark:border-white/10 dark:bg-[#1b2e4b] dark:text-white",placeholder:"Nom de pipeline",disabled:z}),e.jsx("button",{type:"button",onClick:le,disabled:z,className:"grid h-10 w-10 place-items-center rounded-lg bg-primary text-white transition hover:bg-primary/90 disabled:opacity-60",title:"Créer",children:e.jsx("iconify-icon",{icon:z?"svg-spinners:ring-resize":"solar:add-circle-bold",width:"18"})})]})]})]}),e.jsxs("div",{children:[e.jsxs("div",{className:"mb-2 flex items-center justify-between gap-3",children:[e.jsxs("div",{children:[e.jsx("div",{className:"text-[11px] font-bold uppercase text-gray-400",children:"Étapes"}),e.jsxs("div",{className:"text-xs text-gray-400",children:[R.length," colonne",R.length>1?"s":""," dans le kanban"]})]}),e.jsxs("button",{type:"button",onClick:O,disabled:!N||z,className:"inline-flex h-9 items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 text-xs font-bold text-gray-600 transition hover:border-primary/40 hover:text-primary disabled:opacity-50 dark:border-white/10 dark:bg-[#111827] dark:text-white-dark",children:[e.jsx("iconify-icon",{icon:"solar:add-circle-bold",width:"14"}),"Ajouter"]})]}),e.jsxs("div",{className:"grid gap-2",children:[R.map((M,C)=>e.jsxs("div",{className:"grid grid-cols-[28px_34px_minmax(0,1fr)_auto] items-center gap-2 rounded-lg border border-gray-100 bg-white p-2 shadow-sm shadow-gray-100/60 dark:border-white/10 dark:bg-[#111827] dark:shadow-none",children:[e.jsx("div",{className:"text-center text-[11px] font-bold text-gray-400",children:C+1}),e.jsxs("label",{className:"grid h-8 w-8 cursor-pointer place-items-center rounded-lg border border-gray-200 bg-gray-50 dark:border-white/10 dark:bg-dark",title:"Couleur",children:[e.jsx("span",{className:"h-4 w-4 rounded",style:{backgroundColor:M.color||"#6366f1"}}),e.jsx("input",{type:"color",value:M.color||"#6366f1",onChange:P=>L(M.id,{color:P.target.value}),disabled:z,className:"sr-only"})]}),e.jsx("input",{type:"text",value:M.label,onChange:P=>L(M.id,{label:P.target.value}),disabled:z,className:"form-input h-9 min-w-0 rounded-lg border-gray-200 text-sm font-semibold dark:border-white/10 dark:bg-[#1b2e4b] dark:text-white"}),e.jsxs("div",{className:"flex items-center gap-1",children:[e.jsx(st,{icon:"solar:alt-arrow-up-bold",title:"Monter",onClick:()=>c(M.id,-1),disabled:C===0||z}),e.jsx(st,{icon:"solar:alt-arrow-down-bold",title:"Descendre",onClick:()=>c(M.id,1),disabled:C===R.length-1||z}),e.jsx(st,{icon:"solar:trash-bin-trash-bold",title:"Supprimer",onClick:()=>K(M),disabled:z,tone:"danger"})]})]},M.id)),!R.length&&e.jsx("div",{className:"rounded-lg border border-dashed border-gray-200 py-8 text-center text-xs text-gray-400 dark:border-white/10",children:"Aucune étape"})]})]}),e.jsxs("div",{children:[e.jsxs("div",{className:"mb-2",children:[e.jsx("div",{className:"text-[11px] font-bold uppercase text-gray-400",children:"Tags sur les cartes"}),e.jsx("div",{className:"text-xs text-gray-400",children:"Champs select ou multi-select affichés comme badges sur les opportunités."})]}),h.length>0?e.jsx("div",{className:"grid gap-2 sm:grid-cols-2",children:h.map(M=>{const C=Z.includes(M.id);return e.jsxs("button",{type:"button",onClick:()=>se(M.id),className:`flex items-center justify-between gap-3 rounded-lg border px-3 py-2 text-left transition ${C?"border-primary/40 bg-primary/5 text-primary":"border-gray-200 bg-white text-gray-700 hover:border-primary/30 dark:border-white/10 dark:bg-[#111827] dark:text-white-dark"}`,children:[e.jsxs("span",{className:"min-w-0",children:[e.jsx("span",{className:"block truncate text-sm font-bold",children:M.label}),e.jsxs("span",{className:"block text-[11px] text-gray-400",children:[M.options.length||"Sans"," option",M.options.length>1?"s":""]})]}),e.jsx("span",{className:`grid h-5 w-5 place-items-center rounded-full border text-[10px] ${C?"border-primary bg-primary text-white":"border-gray-200 text-transparent dark:border-white/10"}`,children:e.jsx("iconify-icon",{icon:"solar:check-read-bold",width:"12"})})]},M.id)})}):e.jsx("div",{className:"rounded-lg border border-dashed border-gray-200 px-3 py-4 text-xs text-gray-400 dark:border-white/10",children:"Aucun champ select ou multi-select disponible sur cette fiche."})]}),V&&e.jsx("div",{className:"rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-xs font-semibold text-red-600 dark:border-red-500/20 dark:bg-red-950/30 dark:text-red-300",children:V})]}),e.jsxs("aside",{className:"rounded-lg border border-gray-100 bg-white p-3 shadow-sm shadow-gray-100/70 dark:border-white/10 dark:bg-[#111827] dark:shadow-none",children:[e.jsxs("div",{className:"mb-3 flex items-center justify-between",children:[e.jsx("span",{className:"text-[11px] font-bold uppercase text-gray-400",children:"Aperçu"}),e.jsx("span",{className:"rounded bg-gray-100 px-2 py-1 text-[10px] font-bold text-gray-500 dark:bg-dark dark:text-white-dark",children:"Kanban"})]}),e.jsx("div",{className:"space-y-2",children:R.slice(0,5).map(M=>e.jsxs("div",{className:"rounded-lg border border-gray-100 bg-gray-50 p-2 dark:border-white/10 dark:bg-dark/40",children:[e.jsxs("div",{className:"mb-2 flex items-center justify-between gap-2",children:[e.jsx("span",{className:"truncate rounded px-2 py-0.5 text-[10px] font-bold uppercase text-white",style:{backgroundColor:M.color||"#6366f1"},children:M.label||"Étape"}),e.jsx("span",{className:"text-[11px] font-bold text-gray-400",children:"0"})]}),e.jsxs("div",{className:"rounded-lg border border-gray-100 bg-white p-2 dark:border-white/10 dark:bg-[#0e1726]",children:[e.jsx("div",{className:"mb-2 h-2 w-3/4 rounded bg-gray-200 dark:bg-white/10"}),e.jsxs("div",{className:"flex flex-wrap gap-1",children:[Z.slice(0,2).map(C=>{var j;const P=h.find(F=>F.id===C),k=(j=P==null?void 0:P.options)==null?void 0:j[0];return e.jsx("span",{className:"rounded-full px-2 py-0.5 text-[10px] font-bold",style:{backgroundColor:`${(k==null?void 0:k.color)||"#64748b"}1a`,color:(k==null?void 0:k.color)||"#64748b"},children:(k==null?void 0:k.label)||(P==null?void 0:P.label)||"Tag"},C)}),!Z.length&&e.jsx("span",{className:"h-5 w-16 rounded-full bg-gray-100 dark:bg-white/10"})]})]})]},`preview-${M.id}`))})]})]})}),e.jsxs("div",{className:"flex justify-end gap-2 border-t border-gray-100 bg-gray-50 px-5 py-4 dark:border-white/10 dark:bg-dark/30",children:[e.jsx("button",{type:"button",onClick:()=>!z&&(o==null?void 0:o()),className:"rounded-lg border border-gray-200 bg-white px-4 py-2 text-xs font-bold text-gray-500 transition hover:bg-gray-50 dark:border-white/10 dark:bg-[#111827] dark:text-white-dark",disabled:z,children:"Annuler"}),e.jsxs("button",{type:"button",onClick:ge,disabled:z||!N,className:"inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-xs font-bold text-white transition hover:bg-primary/90 disabled:opacity-60",children:[e.jsx("iconify-icon",{icon:z?"svg-spinners:ring-resize":"solar:diskette-bold",width:"15"}),"Enregistrer"]})]})]})}),document.body)}const kt={contains:{label:"Contient",types:["text","email","phone","url","textarea","title","relation"]},not_contains:{label:"Ne contient pas",types:["text","email","phone","url","textarea","title","relation"]},equals:{label:"Est egal a",types:["text","email","phone","url","number","date","title","select","boolean","checkbox","switch","relation","classification"]},not_equals:{label:"N'est pas egal a",types:["text","email","phone","url","number","date","title","select","boolean","checkbox","switch","relation","classification"]},starts_with:{label:"Commence par",types:["text","email","phone","url","title"]},ends_with:{label:"Se termine par",types:["text","email","phone","url","title"]},gt:{label:"Superieur a",types:["number","date"]},gte:{label:"Superieur ou egal",types:["number","date"]},lt:{label:"Inferieur a",types:["number","date"]},lte:{label:"Inferieur ou egal",types:["number","date"]},between:{label:"Entre",types:["number","date"]},is_empty:{label:"Est vide",types:["text","email","phone","url","number","date","textarea","title","select","boolean","checkbox","switch","relation","classification"]},is_not_empty:{label:"N'est pas vide",types:["text","email","phone","url","number","date","textarea","title","select","boolean","checkbox","switch","relation","classification"]},is_unique:{label:"Est unique",types:["text","email","phone","url","textarea","title","select","number","relation","classification"]}};function Oe(t){const r=String(t||"text").toLowerCase();return["string","varchar","char","input","text","textarea","longtext"].includes(r)?"text":["tel","telephone"].includes(r)?"phone":["bool","boolean","checkbox","switch","toggle"].includes(r)?"boolean":["number","currency","percent","decimal","integer","int","float","double"].includes(r)?"number":["date","datetime","datetime-local","timestamp"].includes(r)?"date":["classification"].includes(r)?"classification":["relation"].includes(r)?"relation":["select","dropdown","list","choice","choices","multiselect","multi-select","multi_select","tags"].includes(r)?"select":r||"text"}function qe(t){const r=Oe(t),i=Object.entries(kt).filter(([,s])=>s.types.includes(r)).map(([s,n])=>({key:s,...n}));return i.length||r==="text"?i:Object.entries(kt).filter(([,s])=>s.types.includes("text")).map(([s,n])=>({key:s,...n}))}function wt(t){const r=Oe(t);return r==="number"?"number":r==="date"?"date":"text"}function jt(t){return["is_empty","is_not_empty","is_unique"].includes(t)}function Gr(t){return t==="between"}function Qr({open:t,accountNumber:r,viewId:i,viewName:s,columns:n=[],sidebarFilters:y=[],initialFilters:o=[],onClose:g,onSaved:v}){const[p,b]=a.useState(""),[h,_]=a.useState([]),[w,N]=a.useState(!1),[R,ee]=a.useState(""),[m,U]=a.useState(!1);a.useEffect(()=>{t&&(b(s||""),_(Array.isArray(o)?JSON.parse(JSON.stringify(o)):[]),ee(""),U(!1))},[t,o,s]),a.useEffect(()=>{m&&window.setTimeout(()=>{var S;(S=document.querySelector('[data-view-filter-picker="1"]'))==null||S.scrollIntoView({block:"nearest"})},0)},[m]);const J=a.useMemo(()=>n.filter(S=>S.id!=="actions"),[n]),re=a.useMemo(()=>{const S={};return y.forEach(L=>{S[`classif:${L.id}`]=L.options||[]}),S},[y]);if(!t)return null;const Z=(S,L)=>{_(c=>c.map((O,K)=>K===S?{...O,...L}:O))},te=S=>{const L=J.find(D=>D.id===S);if(!L)return;const c=Oe(L.type),O=qe(c),K=O.length?O:qe("text"),se=K.find(D=>D.key==="equals")||K[0];_(D=>[...D,{field:L.id,fieldName:L.name,fieldType:c,operator:se.key,value:"",value2:"",logic:(D.length===0,"AND")}]),U(!1)},z=S=>{_(L=>L.filter((c,O)=>O!==S))},u=()=>{_([])},V=async()=>{if(i){N(!0),ee("");try{const S=h.map((O,K)=>({field:O.field||O.fieldId,fieldName:O.fieldName||"",fieldType:Oe(O.fieldType),operator:O.operator||"equals",value:O.value,value2:O.value2,logic:K===0?"AND":O.logic==="OR"?"OR":"AND"})).filter(O=>O.field),L=await fetch(`/account/${r}/api/view/config`,{method:"POST",headers:{"Content-Type":"application/json"},credentials:"include",body:JSON.stringify({viewId:i,name:p.trim(),filters:S})}),c=await L.json().catch(()=>({}));if(!L.ok||c.error||c.success===!1)throw new Error(c.error||`Erreur HTTP ${L.status}`);v==null||v(c.view||{filters:S,name:p.trim()})}catch(S){ee(S.message||"Sauvegarde impossible")}finally{N(!1)}}};return Fe.createPortal(e.jsx("div",{role:"dialog","aria-modal":"true",className:"fixed inset-0 flex items-center justify-center bg-slate-950/45 p-4",style:{zIndex:1e4},onMouseDown:S=>{S.target===S.currentTarget&&!w&&(g==null||g())},children:e.jsxs("div",{className:"flex max-h-[88vh] w-full max-w-3xl flex-col overflow-hidden rounded-lg border border-gray-100 bg-white shadow-2xl dark:border-white/10 dark:bg-[#0e1726]",onMouseDown:S=>S.stopPropagation(),children:[e.jsxs("div",{className:"flex items-center justify-between gap-3 border-b border-gray-100 px-5 py-4 dark:border-white/10",children:[e.jsxs("div",{className:"flex min-w-0 items-center gap-3",children:[e.jsx("div",{className:"grid h-9 w-9 place-items-center rounded-lg bg-primary/10 text-primary",children:e.jsx("iconify-icon",{icon:"solar:filter-bold-duotone",width:"19"})}),e.jsxs("div",{className:"min-w-0",children:[e.jsx("div",{className:"truncate text-sm font-bold text-gray-900 dark:text-white",children:"Configurer la vue"}),e.jsx("div",{className:"truncate text-xs text-gray-400",children:s||"Vue"})]})]}),e.jsx("button",{type:"button",onClick:()=>!w&&(g==null?void 0:g()),className:"grid h-8 w-8 place-items-center rounded-lg bg-gray-100 text-gray-500 transition hover:bg-gray-200 dark:bg-dark/50 dark:text-white-dark dark:hover:bg-dark",title:"Fermer",children:e.jsx("iconify-icon",{icon:"solar:close-circle-bold",width:"17"})})]}),e.jsxs("div",{className:"min-h-0 flex-1 overflow-y-auto p-5",children:[e.jsxs("div",{className:"mb-4 grid gap-1.5 rounded-lg border border-gray-100 bg-gray-50/70 p-3 dark:border-white/10 dark:bg-dark/20",children:[e.jsx("label",{className:"text-[11px] font-bold uppercase text-gray-400",children:"Nom de la vue"}),e.jsx("input",{type:"text",value:p,onChange:S=>b(S.target.value),className:"form-input h-10 rounded-lg border-gray-200 bg-white text-sm font-semibold text-gray-800 dark:border-white/10 dark:bg-[#1b2e4b] dark:text-white",placeholder:"Clients"})]}),e.jsxs("div",{className:"grid gap-3",children:[h.map((S,L)=>{const c=J.find(C=>C.id===(S.field||S.fieldId))||J[0],O=Oe(S.fieldType||(c==null?void 0:c.type)),K=qe(O),se=String(S.field||S.fieldId||"").startsWith("classif:")?re[S.field||S.fieldId]||[]:[],D=Array.isArray(c==null?void 0:c.options)?c.options:[],le=jt(S.operator),ge=Gr(S.operator),M=O==="boolean";return e.jsxs(Pe.Fragment,{children:[L>0&&e.jsxs("div",{className:"flex items-center gap-2 pl-3",children:[e.jsx("span",{className:"h-px flex-1 bg-gray-100 dark:bg-white/10"}),e.jsx("button",{type:"button",className:`rounded-full px-3 py-1 text-[11px] font-bold ${S.logic==="OR"?"bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300":"bg-primary/10 text-primary"}`,onClick:()=>Z(L,{logic:S.logic==="OR"?"AND":"OR"}),children:S.logic==="OR"?"OU":"ET"}),e.jsx("span",{className:"h-px flex-1 bg-gray-100 dark:bg-white/10"})]}),e.jsxs("div",{className:"grid gap-2 rounded-lg border border-gray-100 bg-gray-50/70 p-3 dark:border-white/10 dark:bg-dark/20 md:grid-cols-[minmax(0,1.1fr)_minmax(150px,0.7fr)_minmax(0,0.9fr)_auto]",children:[e.jsx("select",{value:S.field||S.fieldId||"",onChange:C=>{var F;const P=J.find(I=>I.id===C.target.value),k=Oe(P==null?void 0:P.type),j=qe(k);Z(L,{field:(P==null?void 0:P.id)||C.target.value,fieldName:(P==null?void 0:P.name)||"",fieldType:k,operator:((F=j.find(I=>I.key==="equals")||j[0])==null?void 0:F.key)||"equals",value:"",value2:""})},className:"form-select h-10 min-w-0 rounded-lg border-gray-200 bg-white text-sm font-semibold text-gray-800 dark:border-white/10 dark:bg-[#1b2e4b] dark:text-white",children:J.map(C=>e.jsx("option",{value:C.id,children:C.name},C.id))}),e.jsx("select",{value:S.operator,onChange:C=>Z(L,{operator:C.target.value,value:jt(C.target.value)?"":S.value,value2:""}),className:"form-select h-10 rounded-lg border-gray-200 bg-white text-sm dark:border-white/10 dark:bg-[#1b2e4b] dark:text-white",children:K.map(C=>e.jsx("option",{value:C.key,children:C.label},C.key))}),e.jsxs("div",{className:"flex min-w-0 gap-2",children:[!le&&se.length>0?e.jsxs("select",{value:S.value||"",onChange:C=>Z(L,{value:C.target.value}),className:"form-select h-10 min-w-0 flex-1 rounded-lg border-gray-200 bg-white text-sm dark:border-white/10 dark:bg-[#1b2e4b] dark:text-white",children:[e.jsx("option",{value:"",children:"Selectionner..."}),se.map(C=>e.jsx("option",{value:C.id,children:C.label},C.id))]}):!le&&D.length>0?e.jsxs("select",{value:S.value||"",onChange:C=>Z(L,{value:C.target.value}),className:"form-select h-10 min-w-0 flex-1 rounded-lg border-gray-200 bg-white text-sm dark:border-white/10 dark:bg-[#1b2e4b] dark:text-white",children:[e.jsx("option",{value:"",children:"Selectionner..."}),D.map(C=>e.jsx("option",{value:C.value||C.label,children:C.label||C.value},C.id||C.value||C.label))]}):!le&&M?e.jsxs("select",{value:String(S.value??""),onChange:C=>Z(L,{value:C.target.value}),className:"form-select h-10 min-w-0 flex-1 rounded-lg border-gray-200 bg-white text-sm dark:border-white/10 dark:bg-[#1b2e4b] dark:text-white",children:[e.jsx("option",{value:"",children:"Selectionner..."}),e.jsx("option",{value:"true",children:"Oui"}),e.jsx("option",{value:"false",children:"Non"})]}):le?e.jsx("div",{className:"h-10 min-w-0 flex-1 rounded-lg border border-dashed border-gray-200 bg-white/70 dark:border-white/10 dark:bg-[#1b2e4b]/60"}):e.jsx("input",{type:wt(O),value:S.value||"",onChange:C=>Z(L,{value:C.target.value}),className:"form-input h-10 min-w-0 flex-1 rounded-lg border-gray-200 text-sm dark:border-white/10 dark:bg-[#1b2e4b] dark:text-white",placeholder:"Valeur"}),ge&&e.jsx("input",{type:wt(O),value:S.value2||"",onChange:C=>Z(L,{value2:C.target.value}),className:"form-input h-10 min-w-0 flex-1 rounded-lg border-gray-200 text-sm dark:border-white/10 dark:bg-[#1b2e4b] dark:text-white",placeholder:"Max"})]}),e.jsx("button",{type:"button",onClick:()=>z(L),className:"grid h-10 w-10 place-items-center rounded-lg border border-gray-200 bg-white text-gray-400 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 dark:border-white/10 dark:bg-[#111827] dark:text-white-dark dark:hover:border-red-500/30 dark:hover:bg-red-950/30",title:"Supprimer",children:e.jsx("iconify-icon",{icon:"solar:trash-bin-trash-bold",width:"15"})})]})]},`${S.field||S.fieldId}-${L}`)}),!h.length&&e.jsx("div",{className:"rounded-lg border border-dashed border-gray-200 px-4 py-8 text-center text-xs text-gray-400 dark:border-white/10",children:"Aucun filtre"}),e.jsxs("div",{className:"flex flex-wrap items-center gap-2",children:[e.jsxs("button",{type:"button",onClick:()=>U(S=>!S),className:"inline-flex h-9 items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 text-xs font-bold text-gray-600 transition hover:border-primary/40 hover:text-primary dark:border-white/10 dark:bg-[#111827] dark:text-white-dark",children:[e.jsx("iconify-icon",{icon:"solar:add-circle-bold",width:"14"}),"Ajouter un filtre"]}),h.length>0&&e.jsx("button",{type:"button",onClick:u,className:"inline-flex h-9 items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 text-xs font-bold text-gray-500 transition hover:border-red-200 hover:text-red-600 dark:border-white/10 dark:bg-[#111827] dark:text-white-dark",children:"Effacer"})]}),m&&e.jsxs("div",{"data-view-filter-picker":"1",className:"max-h-64 overflow-y-auto rounded-lg border border-gray-100 bg-white p-2 shadow-sm dark:border-white/10 dark:bg-[#111827]",children:[e.jsx("div",{className:"mb-2 px-2 text-[11px] font-bold uppercase text-gray-400",children:"Choisir un champ"}),e.jsx("div",{className:"grid gap-1 sm:grid-cols-2",children:J.map(S=>e.jsx("button",{type:"button",onClick:()=>te(S.id),className:"min-w-0 rounded-md border border-transparent px-3 py-2 text-left text-sm font-semibold text-gray-700 transition hover:border-primary/20 hover:bg-primary/5 hover:text-primary dark:text-white-dark dark:hover:bg-white/5",children:e.jsx("span",{className:"block truncate",children:S.name})},S.id))})]}),R&&e.jsx("div",{className:"rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-xs font-semibold text-red-600 dark:border-red-500/20 dark:bg-red-950/30 dark:text-red-300",children:R})]})]}),e.jsxs("div",{className:"flex justify-end gap-2 border-t border-gray-100 bg-gray-50 px-5 py-4 dark:border-white/10 dark:bg-dark/30",children:[e.jsx("button",{type:"button",onClick:()=>!w&&(g==null?void 0:g()),className:"rounded-lg border border-gray-200 bg-white px-4 py-2 text-xs font-bold text-gray-500 transition hover:bg-gray-50 dark:border-white/10 dark:bg-[#111827] dark:text-white-dark",disabled:w,children:"Annuler"}),e.jsxs("button",{type:"button",onClick:V,disabled:w||!p.trim(),className:"inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-xs font-bold text-white transition hover:bg-primary/90 disabled:opacity-60",children:[e.jsx("iconify-icon",{icon:w?"svg-spinners:ring-resize":"solar:diskette-bold",width:"15"}),"Enregistrer"]})]})]})}),document.body)}const es=300,ts=300;function _t(t,r){var s,n,y;if(r==="title")return t.referenceTitle||t.computedTitle||t.title||"";if(r==="createdAt")return t.createdAt||"";if(r==="updatedAt")return t.updatedAt||"";if(r.startsWith("rel:")){const o=r.replace("rel:",""),v=(((s=t._denorm)==null?void 0:s.relations)||[]).find(h=>h.relationKey===o);if(((n=v==null?void 0:v.records)==null?void 0:n.length)>0)return v.records.map(h=>h.title||h.computedTitle||"").join(", ");const p=(t.relations||[]).find(h=>h.key===o||h.relationKey===o);if(p)return p.title||p.computedTitle||p.value||"";const b=(y=t._denorm)==null?void 0:y[o];return b&&(b.title||b.computedTitle)||""}if(r.startsWith("classif:")){const o=r.replace("classif:","");return(t.classificationValues||[]).filter(p=>{var b;return((b=p.classificationId)==null?void 0:b.toString())===o}).map(p=>p.label||p.optionLabel||"").join(", ")}const i=(t.customFields||[]).find(o=>{var g,v,p;return((v=(g=o.field_id)==null?void 0:g._id)==null?void 0:v.toString())===r||((p=o.field_id)==null?void 0:p.toString())===r});return(i==null?void 0:i.value)??""}function rs(t,r){const{operator:i,value:s,value2:n,fieldType:y}=r,o=["number","currency","percent"].includes(y),g=["date","datetime"].includes(y),v=String(t??"").trim(),p=v.toLowerCase(),b=String(s??"").trim().toLowerCase(),h={true:!0,1:!0,oui:!0,yes:!0,false:!1,0:!1,non:!1,no:!1},_=String(y||"").toLowerCase();if(["boolean","checkbox","switch","toggle"].includes(_)){const w=typeof t=="boolean"?t:h[p],N=typeof s=="boolean"?s:h[b];if(i==="equals")return w===N;if(i==="not_equals")return w!==N}switch(i){case"contains":return p.includes(b);case"not_contains":return!p.includes(b);case"equals":return o?parseFloat(v)===parseFloat(s):p===b;case"not_equals":return o?parseFloat(v)!==parseFloat(s):p!==b;case"starts_with":return p.startsWith(b);case"ends_with":return p.endsWith(b);case"gt":return g?new Date(t)>new Date(s):parseFloat(v)>parseFloat(s);case"gte":return g?new Date(t)>=new Date(s):parseFloat(v)>=parseFloat(s);case"lt":return g?new Date(t)<new Date(s):parseFloat(v)<parseFloat(s);case"lte":return g?new Date(t)<=new Date(s):parseFloat(v)<=parseFloat(s);case"between":{if(g){const N=new Date(t);return N>=new Date(s)&&N<=new Date(n)}const w=parseFloat(v);return w>=parseFloat(s)&&w<=parseFloat(n)}case"is_empty":return v===""||t==null;case"is_not_empty":return v!==""&&t!=null;case"is_unique":return v!==""&&t!=null;default:return!0}}function Ue(t){return t==null?"":Array.isArray(t)?t.map(Ue).filter(Boolean).join("|"):t instanceof Date?t.toISOString():typeof t=="object"?t._id?String(t._id).trim().toLowerCase():t.id?String(t.id).trim().toLowerCase():t.value!==void 0?Ue(t.value):t.label!==void 0?Ue(t.label):JSON.stringify(t):String(t).trim().toLowerCase()}function ss(t,r=[]){const i=r.filter(s=>s.operator==="is_unique");return i.length?i.reduce((s,n)=>{const y=new Set;return s.filter(o=>{const g=Ue(_t(o,n.fieldId||n.field));return!g||y.has(g)?!1:(y.add(g),!0)})},t):t}function as({accountId:t,accountNumber:r,entityId:i,viewId:s,entityName:n,entityNamePlural:y,entitySlug:o}){const[g,v]=a.useState([]),[p,b]=a.useState([]),[h,_]=a.useState([]),[w,N]=a.useState([]),[R,ee]=a.useState(!0),[m,U]=a.useState({loaded:0,total:null,loading:!1}),[J,re]=a.useState(null),[Z,te]=a.useState(""),[z,u]=a.useState("table"),[V,S]=a.useState(""),[L,c]=a.useState(null),[O,K]=a.useState({}),[se,D]=a.useState([]),[le,ge]=a.useState(null),[M,C]=a.useState(!1),[P,k]=a.useState(!1),[j,F]=a.useState(new Set),[I,ce]=a.useState(!1),ie=a.useRef(null),[x,T]=a.useState([]),[l,B]=a.useState({}),[H,Q]=a.useState([]),[q,X]=a.useState([]),[xe,f]=a.useState(null),[A,ae]=a.useState(!1),[be,we]=a.useState(null),Ne=a.useRef(null),ye=a.useCallback((d,E="success")=>{Ne.current&&clearTimeout(Ne.current),we({message:d,type:E}),Ne.current=setTimeout(()=>we(null),2500)},[]),[ne,Se]=a.useState({columns:[],sort:{field:"createdAt",direction:"desc"},density:"normal",pageSize:10,titleDisplay:"icon",showSidebar:!1,sidebarWidth:280,viewMode:null,enabledViews:["table","kanban","notes","calendar"]}),[pe,oe]=a.useState({page:1,limit:10,total:0,pages:0}),_e=a.useRef(null),Le=a.useRef(0),Ie=a.useCallback(async()=>{var G,Y,me;const d=Le.current+1;Le.current=d;const E=($,fe)=>{const he=new Map($.map(ue=>[ue._id,ue]));return fe.forEach(ue=>he.set(ue._id,ue)),[...he.values()]},W=async({page:$,limit:fe,includeMeta:he,includeTotal:ue})=>{const ve=new URLSearchParams({page:String($),limit:String(fe),sort:`${ne.sort.field}:${ne.sort.direction}`,meta:he?"1":"0",total:ue?"1":"0"}),de=await fetch(`/account/${r}/api/entity/${i}/views/${s}/records?${ve}`,{credentials:"include"});if(!de.ok)throw new Error(`HTTP ${de.status}`);return de.json()};try{ee(!0),re(null),v([]),b([]),_([]),F(new Set),oe(de=>({...de,page:1})),U({loaded:0,total:null,loading:!0});const $=await W({page:1,limit:es,includeMeta:!0,includeTotal:!0});if(Le.current!==d)return;const fe=$.records||[],he=((G=$.pagination)==null?void 0:G.total)??fe.length;if(v(fe),b(fe),U({loaded:fe.length,total:he,loading:fe.length<he}),$.entity&&(c($.entity),$.entity.icon&&S($.entity.icon)),$.viewSettings&&K($.viewSettings),D(Array.isArray($.viewFilters)?$.viewFilters:[]),ge($.view||null),$.filters&&T($.filters),$.preferences)if(Se(de=>{var ke,Ce;return{...de,...$.viewTitleDisplay&&!$.preferences.titleDisplay?{titleDisplay:$.viewTitleDisplay}:{},...$.preferences,columns:(ke=$.preferences.columns)!=null&&ke.length?$.preferences.columns:((Ce=$.columns)==null?void 0:Ce.map(et=>({id:et.id,visible:!0})))||[]}}),$.preferences.pageSize&&oe(de=>({...de,limit:$.preferences.pageSize})),$.preferences.viewMode&&u($.preferences.viewMode),(Y=$.preferences.columns)!=null&&Y.length&&((me=$.columns)!=null&&me.length)){const de=[];$.preferences.columns.forEach(ke=>{const Ce=$.columns.find(et=>et.id===ke.id);Ce&&de.push(Ce)}),$.columns.forEach(ke=>{de.find(Ce=>Ce.id===ke.id)||de.push(ke)}),N(de)}else N($.columns||[]);else $.columns&&(N($.columns||[]),Se(de=>({...de,...$.viewTitleDisplay?{titleDisplay:$.viewTitleDisplay}:{},columns:$.columns.map(ke=>({id:ke.id,visible:!0}))})));ee(!1);let ue=fe.length,ve=2;for(;Le.current===d&&ue<he;){const de=await W({page:ve,limit:ts,includeMeta:!1,includeTotal:!1});if(Le.current!==d)return;const ke=de.records||[];if(ke.length===0)break;ue+=ke.length,v(Ce=>E(Ce,ke)),U({loaded:Math.min(ue,he),total:he,loading:ue<he}),ve+=1}Le.current===d&&U(de=>({...de,loaded:Math.max(de.loaded,ue),loading:!1}))}catch($){console.error("[RecordsGrid] Fetch error:",$),re($.message),U(fe=>({...fe,loading:!1}))}finally{ee(!1)}},[r,i,s,ne.sort]),$e=a.useCallback(async()=>{try{const d=await fetch(`/account/${r}/api/entity/${i}/saved-views`,{credentials:"include"});if(d.ok){const E=await d.json();X(E.views||[])}}catch(d){console.error("[RecordsGrid] Fetch saved views error:",d)}},[r,i]),Ze=a.useCallback(async({name:d,color:E,filters:W,fieldFilters:G})=>{try{const Y=await fetch(`/account/${r}/api/entity/${i}/saved-views`,{method:"POST",headers:{"Content-Type":"application/json"},credentials:"include",body:JSON.stringify({name:d,color:E,filters:W,fieldFilters:G})});if(Y.ok){const me=await Y.json();X($=>[...$,me.view]),f(me.view._id)}}catch(Y){console.error("[RecordsGrid] Create saved view error:",Y)}},[r,i]),ze=a.useCallback(async d=>{try{(await fetch(`/account/${r}/api/entity/${i}/saved-views/${d}`,{method:"DELETE",credentials:"include"})).ok&&(X(W=>W.filter(G=>G._id!==d)),xe===d&&(f(null),B({}),oe(W=>({...W,page:1}))))}catch(E){console.error("[RecordsGrid] Delete saved view error:",E)}},[r,i,xe]),It=a.useCallback(async(d,E)=>{try{(await fetch(`/account/${r}/api/entity/${i}/saved-views/${d}`,{method:"PUT",headers:{"Content-Type":"application/json"},credentials:"include",body:JSON.stringify({name:E})})).ok&&X(G=>G.map(Y=>Y._id===d?{...Y,name:E}:Y))}catch(W){console.error("[RecordsGrid] Rename saved view error:",W)}},[r,i]),Tt=a.useCallback(async(d,E,W,G,Y)=>{var me;try{const $={filters:E,fieldFilters:W||[]};if(G&&($.name=G),Y&&($.color=Y),(await fetch(`/account/${r}/api/entity/${i}/saved-views/${d}`,{method:"PUT",headers:{"Content-Type":"application/json"},credentials:"include",body:JSON.stringify($)})).ok){const he=JSON.parse(JSON.stringify(E||{})),ue=JSON.parse(JSON.stringify(W||[]));X(de=>de.map(ke=>{if(ke._id!==d)return ke;const Ce={...ke,filters:he,fieldFilters:ue};return G&&(Ce.name=G),Y&&(Ce.color=Y),Ce}));const ve=G||((me=q.find(de=>de._id===d))==null?void 0:me.name)||"Vue";ye(`Vue "${ve}" mise à jour`)}else ye("Erreur lors de la mise à jour","error")}catch($){console.error("[RecordsGrid] Update saved view error:",$),ye("Erreur lors de la mise à jour","error")}},[r,i,q,ye]),Et=a.useCallback(d=>{if(!d){f(null),B({}),Q([]),oe(W=>({...W,page:1}));return}const E=q.find(W=>W._id===d);E&&(f(d),B(JSON.parse(JSON.stringify(E.filters||{}))),Q(JSON.parse(JSON.stringify(E.fieldFilters||[]))),oe(W=>({...W,page:1})))},[q]);a.useEffect(()=>{Ie(),$e()},[]);const ot=a.useMemo(()=>{if(!g.length)return[];const{field:d,direction:E}=ne.sort,W=E==="asc"?1:-1;return[...g].sort((G,Y)=>{let me,$;if(d==="title")me=(G.referenceTitle||G.title||"").toLowerCase(),$=(Y.referenceTitle||Y.title||"").toLowerCase();else if(d==="createdAt"||d==="updatedAt")me=new Date(G[d]||0).getTime(),$=new Date(Y[d]||0).getTime();else{const fe=(G.customFields||[]).find(ue=>{var de;const ve=((de=ue.field_id)==null?void 0:de._id)||ue.field_id;return(ve==null?void 0:ve.toString())===d}),he=(Y.customFields||[]).find(ue=>{var de;const ve=((de=ue.field_id)==null?void 0:de._id)||ue.field_id;return(ve==null?void 0:ve.toString())===d});me=((fe==null?void 0:fe.value)||"").toString().toLowerCase(),$=((he==null?void 0:he.value)||"").toString().toLowerCase()}return me<$?-1*W:me>$?1*W:0})},[g,ne.sort.field,ne.sort.direction]),lt=a.useMemo(()=>ot.map(d=>({...d,_searchIndex:[d.title||"",d.referenceTitle||"",d.computedTitle||"",...(d.customFields||[]).map(E=>E.value||"")].join(" ").toLowerCase()})),[ot]),dt=a.useCallback((d,E,W,G)=>{let Y=d;if(E&&E.trim()){const $=E.toLowerCase();Y=Y.filter(fe=>fe._searchIndex.includes($))}const me=Object.keys(W).filter($=>$!=="__favourites");if(me.length>0&&(Y=Y.filter($=>{const fe=$.classificationValues||[];return me.every(he=>{const ue=W[he];return!ue||ue.length===0?!0:fe.some(ve=>{var de,ke;return((de=ve.classificationId)==null?void 0:de.toString())===he&&ue.includes((ke=ve.optionId)==null?void 0:ke.toString())})})})),G&&G.length>0){const $=G.filter(fe=>fe.operator!=="is_unique");$.length>0&&(Y=Y.filter(fe=>{const he=[[$[0]]];for(let ue=1;ue<$.length;ue++)($[ue].logic||"AND")==="OR"?he.push([$[ue]]):he[he.length-1].push($[ue]);return he.some(ue=>ue.every(ve=>{const de=_t(fe,ve.fieldId);return rs(de,ve)}))})),Y=ss(Y,G)}return Y},[]),Ft=a.useCallback(d=>{var W;const E=typeof d=="string"?d:((W=d==null?void 0:d.target)==null?void 0:W.value)||"";te(E),oe(G=>({...G,page:1}))},[]),$t=a.useCallback(d=>{B(d),oe(E=>({...E,page:1}))},[]),Rt=a.useCallback(d=>{Q(d),oe(E=>({...E,page:1}))},[]);a.useEffect(()=>{const d=dt(lt,Z,l,H);b(d)},[lt,Z,l,H,dt]);const Re=a.useMemo(()=>!!(Z.trim()||Object.keys(l||{}).filter(d=>d!=="__favourites").length>0||(H||[]).length>0),[Z,l,H]);a.useEffect(()=>{const d=(pe.page-1)*pe.limit,E=d+pe.limit,W=p.slice(d,E);_(W);const G=Re?p.length:Math.max(m.total||0,p.length);oe(Y=>({...Y,total:G,pages:Math.ceil(G/pe.limit)}))},[p,pe.page,pe.limit,Re,m.total]);const De=a.useCallback(async d=>{try{await fetch(`/account/${r}/api/user/view-preferences`,{method:"POST",headers:{"Content-Type":"application/json"},credentials:"include",body:JSON.stringify({viewId:s,preferences:d})})}catch(E){console.error("[RecordsGrid] Save preferences error:",E)}},[r,s]),Te=a.useCallback((d,E)=>{const W={...ne,[d]:E};Se(W),De(W),d==="pageSize"&&oe(G=>({...G,limit:E,page:1}))},[ne,De]),Ot=a.useCallback(d=>{u(d),Se(E=>{const W={...E,viewMode:d};return De(W),W})},[De]),Wt=a.useCallback(d=>{K(d||{}),C(!1),ye("Pipeline mise à jour"),Ie()},[Ie,ye]),zt=a.useCallback(d=>{const E=Array.isArray(d==null?void 0:d.filters)?d.filters:[];D(E),d!=null&&d._id&&ge(W=>({...W||{},...d})),d!=null&&d.slug&&typeof window<"u"&&window.history.replaceState({},"",`/account/${r}/record/${o}/${d.slug}`),k(!1),f(null),B({}),Q([]),oe(W=>({...W,page:1})),ye("Vue mise à jour"),Ie()},[r,o,Ie,ye]),Ae=a.useMemo(()=>Math.max(1,Math.ceil(p.length/Math.max(1,pe.limit))),[p.length,pe.limit]),Xe=a.useCallback(d=>{oe(E=>{const W=Math.max(1,Math.min(d,E.pages||1)),G=m.loading&&!Re?Ae:E.pages||Ae;return{...E,page:Math.min(W,G)}})},[Re,Ae,m.loading]),At=a.useCallback((d,E,W)=>{if(W&&ie.current!==null&&ie.current!==E){const G=Math.min(ie.current,E),Y=Math.max(ie.current,E);F(me=>{const $=new Set(me);for(let fe=G;fe<=Y;fe++)h[fe]&&$.add(h[fe]._id);return $})}else F(G=>{const Y=new Set(G);return Y.has(d)?Y.delete(d):Y.add(d),Y});ie.current=E},[h]),Bt=a.useCallback(()=>{F(d=>{const E=h.map(Y=>Y._id),W=E.every(Y=>d.has(Y)),G=new Set(d);return W?E.forEach(Y=>G.delete(Y)):E.forEach(Y=>G.add(Y)),G})},[h]),Vt=a.useCallback(()=>{F(d=>{const E=p.map(W=>W._id);return d.size===E.length?new Set:new Set(E)})},[p]),Pt=a.useCallback(()=>{F(new Set)},[]),Dt=a.useMemo(()=>h.length===0?!1:h.every(d=>j.has(d._id)),[h,j]),Ht=a.useCallback(async()=>{if(!(j.size===0||!(typeof Swal<"u"?await Swal.fire({title:"Confirmer la suppression",html:`<p>Vous allez supprimer <strong>${j.size}</strong> enregistrement(s).</p><p style="color:#e7515a;font-size:13px;margin-top:8px;">Cette action est irréversible.</p>`,icon:"warning",showCancelButton:!0,confirmButtonColor:"#e7515a",cancelButtonText:"Annuler",confirmButtonText:"Supprimer"}).then(E=>E.isConfirmed):confirm(`Supprimer ${j.size} enregistrement(s) ?`)))){ce(!0);try{const W=await(await fetch(`/account/${r}/record/api/bulk-delete`,{method:"POST",headers:{"Content-Type":"application/json"},credentials:"include",body:JSON.stringify({ids:[...j]})})).json();W.success?(v(G=>G.filter(Y=>!j.has(Y._id))),F(new Set),ye(`${W.deletedCount} enregistrement(s) supprimé(s)`)):ye(W.error||"Erreur lors de la suppression","error")}catch(E){console.error("[RecordsGrid] Bulk delete error:",E),ye("Erreur lors de la suppression","error")}finally{ce(!1)}}},[j,r,ye]),qt=a.useCallback((d,E)=>{N(W=>{const G=W.findIndex(he=>he.id===d),Y=W.findIndex(he=>he.id===E);if(G===-1||Y===-1)return W;const me=[...W],[$]=me.splice(G,1);me.splice(Y,0,$);const fe=me.map(he=>ne.columns.find(ve=>ve.id===he.id)||{id:he.id,visible:!0});return Te("columns",fe),me})},[ne.columns,Te]),ct=a.useMemo(()=>{switch(ne.density){case"compact":return 36;case"comfortable":return 56;default:return 44}},[ne.density]),Ge=Zt({count:h.length,getScrollElement:()=>_e.current,estimateSize:()=>ct,overscan:10});a.useEffect(()=>{Ge.measure()},[ct,Ge]);const Jt=a.useMemo(()=>{var W;let d;(W=ne.columns)!=null&&W.length?d=w.filter(G=>{const Y=ne.columns.find(me=>me.id===G.id);return Y?Y.visible!==!1:!0}):d=w;const E=d.findIndex(G=>G.id==="actions");if(E>-1&&E<d.length-1){const[G]=d.splice(E,1);d=[...d,G]}return d},[w,ne.columns]),Ut=pe.total===0?0:(pe.page-1)*pe.limit+1,Kt=Math.min(pe.page*pe.limit,Re?p.length:pe.total),Qe=m.loading&&!Re&&m.total>m.loaded;return R&&h.length===0?e.jsx("div",{className:"flex items-center justify-center h-64",children:e.jsx("div",{className:"animate-spin rounded-full h-8 w-8 border-b-2 border-primary"})}):J&&h.length===0?e.jsx("div",{className:"flex items-center justify-center h-64 text-danger",children:e.jsxs("span",{children:["Erreur: ",J]})}):e.jsxs("div",{className:"relative flex h-full gap-5 sm:min-h-0",children:[e.jsx(Pr,{entityName:n,entityNamePlural:y,entityIcon:V,accountNumber:r,entitySlug:o,showSidebar:ne.showSidebar!==!1,onToggleSidebar:()=>Te("showSidebar",!ne.showSidebar),filters:x,activeFilters:l,onFilterChange:$t,columns:w,fieldFilters:H,onFieldFiltersChange:Rt,allRecords:g,sidebarWidth:ne.sidebarWidth,onSidebarWidthChange:d=>Te("sidebarWidth",d),viewId:s}),e.jsxs("div",{className:`panel p-4 flex-1 flex flex-col h-full ${z==="calendar"?"overflow-auto":"overflow-hidden"}`,children:[e.jsx(ur,{searchQuery:Z,onSearch:Ft,columns:w,preferences:ne,onPreferencesChange:Te,loading:R,accountNumber:r,entitySlug:o,viewId:s,showSidebar:ne.showSidebar!==!1,onToggleSidebar:()=>Te("showSidebar",!ne.showSidebar),activeView:z,onViewChange:Ot,enabledViews:ne.enabledViews||["table","kanban","notes"],onEnabledViewsChange:d=>Te("enabledViews",d),hasActiveFilters:se.length>0||Object.keys(l).filter(d=>d!=="__favourites").length>0||H.length>0,onOpenViewFilters:()=>k(!0),onOpenPipelineConfig:()=>C(!0)}),e.jsx(Hr,{savedViews:q,activeViewId:xe,onSelectView:Et,onCreateView:Ze,onDeleteView:ze,onRenameView:It,onUpdateViewFilters:Tt,hasActiveFilters:Object.keys(l).filter(d=>d!=="__favourites").length>0||H.length>0,activeFilters:l,fieldFilters:H,sidebarFilters:x,columns:w,externalOpenCreate:A,onCloseExternalCreate:()=>ae(!1)}),e.jsx("div",{className:`flex-1 flex flex-col mt-4 ${z==="calendar"?"overflow-auto":"overflow-hidden"}`,children:z==="kanban"?e.jsx(yr,{records:p,columns:w,accountNumber:r,entitySlug:o,viewId:s,entityData:L,kanbanFieldId:O.kanbanField||"status",kanbanTagFieldIds:O.kanbanTagFields||[]}):z==="calendar"?e.jsx(zr,{records:p,columns:w,accountNumber:r,entitySlug:o,entityData:L}):z==="notes"?e.jsx(_r,{records:p,accountNumber:r,entitySlug:o}):e.jsxs("div",{className:"dataTable-wrapper flex-1 flex flex-col overflow-hidden",children:[e.jsx("div",{className:"dataTable-container flex-1 overflow-auto relative",ref:_e,children:e.jsx(pr,{records:h,columns:Jt,virtualizer:Ge,sort:ne.sort,onSort:d=>{const E=ne.sort.field===d&&ne.sort.direction==="asc"?"desc":"asc";Te("sort",{field:d,direction:E})},onColumnReorder:qt,density:ne.density,titleDisplay:ne.titleDisplay||"avatar",entityIcon:V,accountNumber:r,entitySlug:o,selectedIds:j,onToggleSelect:At,onSelectAll:Bt,allPageSelected:Dt,showCheckboxes:ne.showCheckboxes!==!1})}),e.jsxs("div",{className:"dataTable-bottom flex items-center justify-between border-t pt-4 dark:border-gray-800",children:[e.jsxs("div",{className:"dataTable-info text-gray-500 dark:text-gray-400",children:[e.jsxs("div",{children:["Affichage de ",Ut," à ",Kt," sur ",pe.total]}),Qe&&e.jsxs("div",{className:"mt-1 flex items-center gap-2 text-xs text-primary",children:[e.jsx("span",{className:"inline-block h-2 w-2 rounded-full bg-primary animate-pulse"}),e.jsxs("span",{children:["Chargement en cours : ",m.loaded," / ",m.total]})]})]}),e.jsx("nav",{className:"dataTable-pagination",children:e.jsxs("ul",{className:"inline-flex items-center space-x-1 rtl:space-x-reverse",children:[e.jsx("li",{children:e.jsx("button",{onClick:()=>Xe(pe.page-1),disabled:pe.page<=1,className:"flex justify-center font-semibold p-2 rounded-full transition bg-white-light text-dark hover:text-white hover:bg-primary dark:text-white-light dark:bg-[#191e3a] dark:hover:bg-primary disabled:opacity-50",children:"«"})}),Array.from({length:Math.min(pe.pages,5)},(d,E)=>{let W;return pe.pages<=5||pe.page<=3?W=E+1:pe.page>=pe.pages-2?W=pe.pages-4+E:W=pe.page-2+E,e.jsx("li",{children:e.jsx("button",{onClick:()=>Xe(W),disabled:Qe&&W>Ae,className:`flex justify-center font-semibold px-3.5 py-2 rounded-full transition ${W===pe.page?"bg-primary text-white dark:bg-primary dark:text-white-light":"bg-white-light text-dark hover:text-white hover:bg-primary dark:text-white-light dark:bg-[#191e3a] dark:hover:bg-primary"} disabled:opacity-50 disabled:cursor-not-allowed`,children:W})},W)}),e.jsx("li",{children:e.jsx("button",{onClick:()=>Xe(pe.page+1),disabled:pe.page>=pe.pages||Qe&&pe.page>=Ae,className:"flex justify-center font-semibold p-2 rounded-full transition bg-white-light text-dark hover:text-white hover:bg-primary dark:text-white-light dark:bg-[#191e3a] dark:hover:bg-primary disabled:opacity-50",children:"»"})})]})})]})]})})]}),e.jsx(Xr,{open:M,accountNumber:r,entityId:i,entityData:L,viewId:s,viewSettings:O,onClose:()=>C(!1),onSaved:Wt}),e.jsx(Qr,{open:P,accountNumber:r,viewId:(le==null?void 0:le._id)||s,viewName:(le==null?void 0:le.name)||n,columns:w,sidebarFilters:x,initialFilters:se,onClose:()=>k(!1),onSaved:zt}),j.size>0&&e.jsxs("div",{className:"bulk-action-bar",style:{position:"fixed",bottom:"24px",left:"50%",transform:"translateX(-50%)",zIndex:99999,display:"flex",alignItems:"center",gap:"12px",padding:"10px 20px",borderRadius:"14px",background:"linear-gradient(135deg, #1b2e4b 0%, #0e1726 100%)",boxShadow:"0 8px 32px rgba(0,0,0,0.3), 0 0 0 1px rgba(67,97,238,0.2)",animation:"bulkBarSlideUp 0.3s cubic-bezier(0.16,1,0.3,1)",backdropFilter:"blur(12px)"},children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"8px"},children:[e.jsx("div",{style:{width:28,height:28,borderRadius:"8px",background:"rgba(67,97,238,0.2)",color:"#4361ee",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"12px",fontWeight:700},children:j.size}),e.jsxs("span",{style:{color:"#e0e6ed",fontSize:"13px",fontWeight:500,whiteSpace:"nowrap"},children:["sélectionné",j.size>1?"s":""]})]}),e.jsx("div",{style:{width:1,height:24,background:"rgba(255,255,255,0.1)"}}),j.size<p.length&&e.jsxs("button",{onClick:Vt,style:{padding:"6px 12px",borderRadius:"8px",border:"1px solid rgba(67,97,238,0.3)",background:"rgba(67,97,238,0.1)",color:"#93b4fd",fontSize:"12px",fontWeight:600,cursor:"pointer",transition:"all 0.15s",whiteSpace:"nowrap"},onMouseEnter:d=>{d.target.style.background="rgba(67,97,238,0.2)",d.target.style.color="#b8cffe"},onMouseLeave:d=>{d.target.style.background="rgba(67,97,238,0.1)",d.target.style.color="#93b4fd"},children:["Tout sélectionner (",p.length,")"]}),e.jsx("div",{style:{width:1,height:24,background:"rgba(255,255,255,0.1)"}}),e.jsxs("button",{onClick:Ht,disabled:I,style:{display:"flex",alignItems:"center",gap:"6px",padding:"6px 14px",borderRadius:"8px",border:"none",background:"rgba(231,81,90,0.15)",color:"#ff6b6b",fontSize:"12px",fontWeight:600,cursor:I?"wait":"pointer",transition:"all 0.15s",whiteSpace:"nowrap",opacity:I?.6:1},onMouseEnter:d=>{I||(d.target.style.background="rgba(231,81,90,0.25)",d.target.style.color="#ff8a8a")},onMouseLeave:d=>{d.target.style.background="rgba(231,81,90,0.15)",d.target.style.color="#ff6b6b"},children:[e.jsxs("svg",{viewBox:"0 0 24 24",fill:"none",style:{width:14,height:14},children:[e.jsx("path",{d:"M20.5 6H3.5",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"}),e.jsx("path",{d:"M18.833 8.5L18.373 15.4C18.196 18.054 18.108 19.381 17.243 20.19C16.378 21 15.048 21 12.387 21H11.613C8.952 21 7.622 21 6.757 20.19C5.892 19.381 5.804 18.054 5.627 15.4L5.167 8.5",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"})]}),I?"Suppression...":"Supprimer"]}),e.jsx("div",{style:{width:1,height:24,background:"rgba(255,255,255,0.1)"}}),e.jsx("button",{onClick:Pt,style:{width:28,height:28,borderRadius:"8px",border:"none",background:"rgba(255,255,255,0.08)",color:"#888ea8",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",transition:"all 0.15s"},onMouseEnter:d=>{d.target.style.background="rgba(255,255,255,0.15)",d.target.style.color="#e0e6ed"},onMouseLeave:d=>{d.target.style.background="rgba(255,255,255,0.08)",d.target.style.color="#888ea8"},title:"Désélectionner tout",children:e.jsx("svg",{viewBox:"0 0 24 24",fill:"none",style:{width:14,height:14},children:e.jsx("path",{d:"M18 6L6 18M6 6L18 18",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round"})})})]}),be&&e.jsxs("div",{style:{position:"fixed",bottom:j.size>0?"80px":"24px",right:"24px",zIndex:99999,padding:"10px 20px",borderRadius:"10px",fontSize:"13px",fontWeight:500,color:"#fff",background:be.type==="error"?"#e7515a":"#00ab55",boxShadow:"0 4px 20px rgba(0,0,0,0.15)",animation:"toastSlideIn 0.25s ease-out",display:"flex",alignItems:"center",gap:"8px",transition:"bottom 0.3s ease"},children:[e.jsx("svg",{viewBox:"0 0 24 24",fill:"none",style:{width:16,height:16,flexShrink:0},children:be.type==="error"?e.jsx("path",{d:"M12 8V12M12 16H12.01M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"}):e.jsx("path",{d:"M5 13L9 17L19 7",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round"})}),be.message]}),e.jsx("style",{children:`
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
            `})]})}function Ct(){document.querySelectorAll('[data-island="records-grid"]').forEach(t=>{if(t.dataset.mounted==="1")return;t.dataset.mounted="1";const r={accountId:t.dataset.accountId,accountNumber:t.dataset.accountNumber,entityId:t.dataset.entityId,viewId:t.dataset.viewId,entityName:t.dataset.entityName||"Records",entityNamePlural:t.dataset.entityNamePlural||"",entitySlug:t.dataset.entitySlug||"records"};console.log("[RecordsGrid Island] Mounting:",r),Yt(t).render(e.jsx(Pe.StrictMode,{children:e.jsx(as,{...r})}))})}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",Ct):Ct();
