import{r,j as e,a as _e,R as Fe,c as bt}from"./chunks/client-CkWOIrXP.js";import{u as vt}from"./chunks/index-CjVSFo3p.js";import{C as st}from"./chunks/CardRenderer-CYkZpnKW.js";import{u as yt,a as Ve,D as kt,c as wt,b as jt,d as Ct,s as Nt,K as St,T as Lt,M as Mt,e as _t,S as $t,v as It,f as Tt,C as Et}from"./chunks/sortable.esm-DQ9-A8Dw.js";const Ke=[{id:"table",label:"Tableau",icon:e.jsxs("svg",{viewBox:"0 0 24 24",fill:"none",className:"h-4 w-4",children:[e.jsx("path",{d:"M3 7H21",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"}),e.jsx("path",{d:"M3 12H21",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"}),e.jsx("path",{d:"M3 17H21",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"})]})},{id:"kanban",label:"Kanban",icon:e.jsxs("svg",{viewBox:"0 0 24 24",fill:"none",className:"h-4 w-4",children:[e.jsx("rect",{x:"3",y:"3",width:"5",height:"18",rx:"1",stroke:"currentColor",strokeWidth:"1.5"}),e.jsx("rect",{x:"10",y:"3",width:"5",height:"12",rx:"1",stroke:"currentColor",strokeWidth:"1.5"}),e.jsx("rect",{x:"17",y:"3",width:"4",height:"15",rx:"1",stroke:"currentColor",strokeWidth:"1.5"})]})},{id:"notes",label:"Notes",icon:e.jsxs("svg",{viewBox:"0 0 24 24",fill:"none",className:"h-4 w-4",children:[e.jsx("path",{d:"M2 12C2 7.28595 2 4.92893 3.46447 3.46447C4.92893 2 7.28595 2 12 2C16.714 2 19.0711 2 20.5355 3.46447C22 4.92893 22 7.28595 22 12C22 16.714 22 19.0711 20.5355 20.5355C19.0711 22 16.714 22 12 22C7.28595 22 4.92893 22 3.46447 20.5355C2 19.0711 2 16.714 2 12Z",stroke:"currentColor",strokeWidth:"1.5"}),e.jsx("path",{opacity:"0.5",d:"M2 12H22",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"}),e.jsx("path",{opacity:"0.5",d:"M12 2V22",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"})]})},{id:"calendar",label:"Calendrier",icon:e.jsxs("svg",{viewBox:"0 0 24 24",fill:"none",className:"h-4 w-4",children:[e.jsx("rect",{x:"3",y:"4",width:"18",height:"18",rx:"2",stroke:"currentColor",strokeWidth:"1.5"}),e.jsx("path",{d:"M16 2V6M8 2V6M3 10H21",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"}),e.jsx("circle",{cx:"12",cy:"16",r:"1",fill:"currentColor"}),e.jsx("circle",{cx:"16",cy:"16",r:"1",fill:"currentColor"}),e.jsx("circle",{cx:"8",cy:"16",r:"1",fill:"currentColor"})]})}];function Rt({searchQuery:t,onSearch:s,columns:i,preferences:a,onPreferencesChange:o,loading:x,accountNumber:l,entitySlug:j,viewId:m,showSidebar:u,onToggleSidebar:h,activeView:p,onViewChange:$,enabledViews:L=["table","kanban","notes"],onEnabledViewsChange:C,hasActiveFilters:E=!1,onOpenSaveView:X,onOpenPipelineConfig:F}){var Q,f,M;const[y,U]=r.useState(!1),[Y,J]=r.useState(!1),[te,d]=r.useState(!1),[k,re]=r.useState(!1),[T,A]=r.useState(""),I=r.useRef(null),G=r.useRef(null),Z=r.useRef(null),O=r.useRef(null),oe=r.useRef(null),le=r.useRef(null),xe=r.useRef(null),v=r.useRef(null),B=()=>{U(!1),J(!1),d(!1),re(!1)};r.useEffect(()=>{const n=R=>{R.key==="Escape"&&B()};return document.addEventListener("keydown",n),()=>document.removeEventListener("keydown",n)},[]);const H=(n,R,W,se)=>{r.useEffect(()=>{const ee=ne=>{n&&R.current&&!R.current.contains(ne.target)&&W.current&&!W.current.contains(ne.target)&&se(!1)};return n&&setTimeout(()=>document.addEventListener("mousedown",ee),0),()=>document.removeEventListener("mousedown",ee)},[n])};H(y,oe,I,U),H(Y,le,G,J),H(te,xe,Z,d),H(k,v,O,re);const b=n=>{if(n==="table")return;const R=L.includes(n)?L.filter(W=>W!==n):[...L,n];C(R),p===n&&!R.includes(n)&&$("table")},N=Ke.filter(n=>L.includes(n.id)),P=n=>{const R=a.columns.some(se=>se.id===n);let W;R?W=a.columns.map(se=>se.id===n?{...se,visible:!se.visible}:se):W=[...a.columns,{id:n,visible:!1}],o("columns",W)},V=n=>{if(!(n!=null&&n.current))return{top:0,right:0};const R=n.current.getBoundingClientRect();return{top:R.bottom+8,right:window.innerWidth-R.right}},de=T.trim()?i.filter(n=>n.name.toLowerCase().includes(T.toLowerCase())):i;return e.jsxs("div",{className:"dataTable-top flex items-center mb-0 justify-between gap-2",children:[e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsxs("button",{type:"button",onClick:async()=>{try{const R=await(await fetch(`/account/${l}/record/api/create-draft`,{method:"POST",headers:{"Content-Type":"application/json"},credentials:"include",body:JSON.stringify({entitySlug:j})})).json();R.success&&R._id&&(window.location.href=`/account/${l}/record/${j}/${R._id}/fiche`)}catch(n){console.error("[CreateDraft]",n)}},className:"btn-add-expandable block rounded-full p-2 bg-white-light/40 hover:bg-white-light/90 hover:text-primary dark:bg-dark/40 dark:hover:bg-dark/60",title:"Ajouter",children:[e.jsx("svg",{className:"btn-add-icon",viewBox:"0 0 24 24",fill:"none",children:e.jsx("path",{d:"M12 5V19M5 12H19",stroke:"currentColor",strokeWidth:"2.5",strokeLinecap:"round"})}),e.jsx("span",{className:"btn-add-label",children:"Ajouter"})]}),e.jsxs("div",{className:"dataTable-search relative w-64",style:{marginLeft:0},children:[e.jsxs("svg",{className:"absolute left-4 top-1/2 ml-2 -translate-y-1/2 h-4 w-4 text-gray-400",viewBox:"0 0 24 24",fill:"none",children:[e.jsx("circle",{cx:"11",cy:"11",r:"8",stroke:"currentColor",strokeWidth:"1.5"}),e.jsx("path",{d:"M16.5 16.5L21 21",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"})]}),e.jsx("input",{type:"text",value:t,onChange:n=>s(n.target.value),placeholder:"Rechercher...",className:"dataTable-input form-input w-full pl-11 pr-10",style:{"padding-left":"33px"}}),x&&e.jsx("div",{className:"absolute right-3 top-1/2 -translate-y-1/2",children:e.jsx("div",{className:"animate-spin rounded-full h-4 w-4 border-b-2 border-primary"})})]})]}),e.jsxs("div",{className:"flex items-center gap-2",children:[N.map(n=>e.jsx("button",{type:"button",onClick:()=>$(n.id),title:n.label,className:`block rounded-full p-2 transition-all ${p===n.id?"bg-primary/20 text-primary":"bg-white-light/40 hover:bg-white-light/90 hover:text-primary dark:bg-dark/40 dark:hover:bg-dark/60"}`,children:n.icon},n.id)),p==="kanban"&&e.jsx("button",{type:"button",onClick:()=>{B(),F==null||F()},className:"block rounded-full p-2 transition-all bg-white-light/40 hover:bg-white-light/90 hover:text-primary dark:bg-dark/40 dark:hover:bg-dark/60",title:"Configurer la pipeline",children:e.jsxs("svg",{className:"h-4 w-4",viewBox:"0 0 24 24",fill:"none",children:[e.jsx("path",{d:"M4 6H20M4 12H20M4 18H20",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"}),e.jsx("path",{d:"M8 4V8M15 10V14M11 16V20",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"})]})}),e.jsx("button",{ref:O,type:"button",onClick:()=>{re(!k),U(!1),J(!1),d(!1)},className:`block rounded-full p-2 transition-all ${k?"bg-primary/20 text-primary":"bg-white-light/40 hover:bg-white-light/90 hover:text-primary dark:bg-dark/40 dark:hover:bg-dark/60"}`,title:"Configurer les vues",children:e.jsxs("svg",{className:"h-4 w-4",viewBox:"0 0 24 24",fill:"none",children:[e.jsx("circle",{cx:"12",cy:"12",r:"3",stroke:"currentColor",strokeWidth:"1.5"}),e.jsx("path",{d:"M12 2V4M12 20V22M2 12H4M20 12H22M4.93 4.93L6.34 6.34M17.66 17.66L19.07 19.07M4.93 19.07L6.34 17.66M17.66 6.34L19.07 4.93",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"})]})}),e.jsx("div",{className:"w-px h-5 bg-gray-200 dark:bg-gray-700 mx-0.5"}),e.jsx("button",{type:"button",onClick:X,className:`block rounded-full p-2 transition-all ${E?"bg-primary/20 text-primary":"bg-white-light/40 hover:bg-white-light/90 hover:text-primary dark:bg-dark/40 dark:hover:bg-dark/60"}`,title:"Filtrer & enregistrer la vue",children:e.jsx("svg",{className:"h-4 w-4",viewBox:"0 0 24 24",fill:"none",children:e.jsx("path",{d:"M22 3H2L10 12.46V19L14 21V12.46L22 3Z",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round"})})}),p==="table"&&(()=>{var R,W;const n=((R=a.sort)==null?void 0:R.field)!=="createdAt"||((W=a.sort)==null?void 0:W.direction)!=="desc";return e.jsx("button",{ref:G,type:"button",onClick:()=>{J(!Y),U(!1),d(!1),re(!1)},className:`block rounded-full p-2 transition-all ${Y||n?"bg-primary/20 text-primary":"bg-white-light/40 hover:bg-white-light/90 hover:text-primary dark:bg-dark/40 dark:hover:bg-dark/60"}`,title:"Trier",children:e.jsxs("svg",{className:"h-4 w-4",viewBox:"0 0 24 24",fill:"none",children:[e.jsx("path",{d:"M16 18L16 6M16 6L20 10M16 6L12 10",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round"}),e.jsx("path",{d:"M8 6L8 18M8 18L12 14M8 18L4 14",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round"})]})})})(),e.jsx("button",{ref:I,type:"button",onClick:()=>{U(!y),J(!1),d(!1),re(!1)},className:`block rounded-full p-2 transition-all ${y?"bg-primary/20 text-primary":"bg-white-light/40 hover:bg-white-light/90 hover:text-primary dark:bg-dark/40 dark:hover:bg-dark/60"}`,title:"Mode d'affichage",children:e.jsxs("svg",{className:"h-4 w-4",viewBox:"0 0 24 24",fill:"none",children:[e.jsx("path",{d:"M3 7H21",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"}),e.jsx("path",{d:"M6 12H18",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"}),e.jsx("path",{d:"M10 17H14",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"})]})}),p==="table"&&e.jsx("button",{ref:Z,type:"button",onClick:()=>{d(!te),U(!1),J(!1),re(!1)},className:`block rounded-full p-2 transition-all ${te?"bg-primary/20 text-primary":"bg-white-light/40 hover:bg-white-light/90 hover:text-primary dark:bg-dark/40 dark:hover:bg-dark/60"}`,title:"Colonnes visibles",children:e.jsxs("svg",{className:"h-4 w-4",viewBox:"0 0 24 24",fill:"none",children:[e.jsx("path",{d:"M9 3H4C3.44772 3 3 3.44772 3 4V11C3 11.5523 3.44772 12 4 12H9C9.55228 12 10 11.5523 10 11V4C10 3.44772 9.55228 3 9 3Z",stroke:"currentColor",strokeWidth:"1.5"}),e.jsx("path",{d:"M20 3H15C14.4477 3 14 3.44772 14 4V7C14 7.55228 14.4477 8 15 8H20C20.5523 8 21 7.55228 21 7V4C21 3.44772 20.5523 3 20 3Z",stroke:"currentColor",strokeWidth:"1.5"}),e.jsx("path",{d:"M20 12H15C14.4477 12 14 12.4477 14 13V20C14 20.5523 14.4477 21 15 21H20C20.5523 21 21 20.5523 21 20V13C21 12.4477 20.5523 12 20 12Z",stroke:"currentColor",strokeWidth:"1.5"}),e.jsx("path",{d:"M9 16H4C3.44772 16 3 16.4477 3 17V20C3 20.5523 3.44772 21 4 21H9C9.55228 21 10 20.5523 10 20V17C10 16.4477 9.55228 16 9 16Z",stroke:"currentColor",strokeWidth:"1.5"})]})}),e.jsxs("button",{type:"button",onClick:h,className:"btn-sidebar-toggle block rounded-full p-2 bg-white-light/40 hover:bg-white-light/90 hover:text-primary dark:bg-dark/40 dark:hover:bg-dark/60",title:u?"Masquer le panneau":"Afficher le panneau",children:[e.jsxs("svg",{className:"btn-sidebar-icon",viewBox:"0 0 24 24",fill:"none",children:[e.jsx("rect",{x:"3",y:"3",width:"18",height:"18",rx:"2",stroke:"currentColor",strokeWidth:"1.5"}),e.jsx("path",{d:"M9 3V21",stroke:"currentColor",strokeWidth:"1.5"})]}),e.jsx("span",{className:"btn-sidebar-label",children:u?"Masquer":"Panneau"})]})]}),Y&&_e.createPortal(e.jsxs(e.Fragment,{children:[e.jsx("div",{className:"fixed inset-0",style:{zIndex:9998},onClick:()=>J(!1)}),e.jsxs("div",{ref:le,className:"fixed rounded-xl shadow-xl p-4 w-72 bg-white dark:bg-[#0e1726] border border-gray-100 dark:border-white/10",style:{zIndex:9999,top:V(G).top,right:V(G).right,animation:"popoverSlide 0.15s ease-out"},children:[e.jsx("div",{className:"text-xs font-medium text-gray-500 dark:text-white-dark mb-2",children:"Trier par"}),e.jsxs("div",{className:"flex gap-2",children:[e.jsxs("select",{value:((Q=a.sort)==null?void 0:Q.field)||"createdAt",onChange:n=>o("sort",{...a.sort,field:n.target.value}),className:"flex-1 px-2 py-1.5 text-xs border border-gray-200 dark:border-white/10 rounded-lg bg-white dark:bg-[#1b2e4b] text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary/50",children:[e.jsx("option",{value:"createdAt",children:"Date de création"}),e.jsx("option",{value:"title",children:"Titre"}),i.filter(n=>n.id!=="title"&&n.id!=="actions").map(n=>e.jsx("option",{value:n.id,children:n.name},n.id))]}),e.jsx("button",{onClick:()=>{var n;return o("sort",{...a.sort,direction:((n=a.sort)==null?void 0:n.direction)==="asc"?"desc":"asc"})},className:"p-1.5 border border-gray-200 dark:border-white/10 rounded-lg bg-white dark:bg-[#1b2e4b] hover:bg-gray-50 dark:hover:bg-[#253b5c] transition-all",title:((f=a.sort)==null?void 0:f.direction)==="asc"?"Croissant":"Décroissant",children:e.jsx("svg",{className:`h-4 w-4 text-gray-600 dark:text-white transition-transform ${((M=a.sort)==null?void 0:M.direction)==="asc"?"rotate-180":""}`,viewBox:"0 0 24 24",fill:"none",children:e.jsx("path",{d:"M12 5V19M12 19L6 13M12 19L18 13",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round"})})}),e.jsx("button",{onClick:()=>o("sort",{field:"createdAt",direction:"desc"}),className:"p-1.5 border border-gray-200 dark:border-white/10 rounded-lg bg-white dark:bg-[#1b2e4b] hover:bg-red-50 hover:border-red-300 hover:text-red-500 dark:hover:bg-red-900/20 transition-all",title:"Réinitialiser le tri",children:e.jsxs("svg",{className:"h-4 w-4 text-gray-600 dark:text-white",viewBox:"0 0 24 24",fill:"none",children:[e.jsx("path",{d:"M4.06189 13C4.02104 12.6724 4 12.3387 4 12C4 7.58172 7.58172 4 12 4C14.5006 4 16.7332 5.14727 18.2002 6.94416M19.9381 11C19.979 11.3276 20 11.6613 20 12C20 16.4183 16.4183 20 12 20C9.49944 20 7.26681 18.8527 5.79984 17.0558",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round"}),e.jsx("path",{d:"M15 7H19V3",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round"}),e.jsx("path",{d:"M9 17H5V21",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round"})]})})]})]})]}),document.body),y&&_e.createPortal(e.jsxs(e.Fragment,{children:[e.jsx("div",{className:"fixed inset-0",style:{zIndex:9998},onClick:()=>U(!1)}),e.jsxs("div",{ref:oe,className:"fixed rounded-xl shadow-xl p-4 w-72 bg-white dark:bg-[#0e1726] border border-gray-100 dark:border-white/10",style:{zIndex:9999,top:V(I).top,right:V(I).right,animation:"popoverSlide 0.15s ease-out"},children:[e.jsxs("div",{className:"mb-4",children:[e.jsx("div",{className:"text-xs font-medium text-gray-500 dark:text-white-dark mb-2",children:"Densité"}),e.jsx("div",{className:"flex gap-1",children:["compact","normal","comfortable"].map(n=>e.jsx("button",{onClick:()=>o("density",n),className:`flex-1 px-2 py-1.5 text-xs rounded-lg transition-all ${a.density===n?"bg-primary text-white":"bg-gray-100 dark:bg-dark/40 text-gray-600 dark:text-white-dark/70 hover:bg-gray-200 dark:hover:bg-dark/60"}`,children:n==="compact"?"Compact":n==="normal"?"Normal":"Confort"},n))})]}),e.jsxs("div",{className:"mb-4",children:[e.jsx("div",{className:"text-xs font-medium text-gray-500 dark:text-white-dark mb-2",children:"Lignes par page"}),e.jsx("div",{className:"flex gap-1",children:[10,25,50,100].map(n=>e.jsx("button",{onClick:()=>o("pageSize",n),className:`flex-1 px-2 py-1.5 text-xs rounded-lg transition-all ${a.pageSize===n?"bg-primary text-white":"bg-gray-100 dark:bg-dark/40 text-gray-600 dark:text-white-dark/70 hover:bg-gray-200 dark:hover:bg-dark/60"}`,children:n},n))})]})]})]}),document.body),te&&_e.createPortal(e.jsxs(e.Fragment,{children:[e.jsx("div",{className:"fixed inset-0",style:{zIndex:9998},onClick:()=>d(!1)}),e.jsxs("div",{ref:xe,className:"fixed rounded-xl shadow-xl p-4 w-64 bg-white dark:bg-[#0e1726] border border-gray-100 dark:border-white/10",style:{zIndex:9999,top:V(Z).top,right:V(Z).right,animation:"popoverSlide 0.15s ease-out"},children:[e.jsx("div",{className:"text-xs font-medium text-gray-500 dark:text-white-dark mb-2",children:"Colonnes visibles"}),e.jsx("div",{className:"relative mb-2",children:e.jsx("input",{type:"text",value:T,onChange:n=>A(n.target.value),placeholder:"Filtrer...",className:"w-full px-3 py-1.5 text-xs border border-gray-200 dark:border-white/10 rounded-lg bg-white dark:bg-[#1b2e4b] text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary/50"})}),e.jsx("div",{className:"space-y-0.5 max-h-48 overflow-y-auto",children:de.map(n=>{const R=a.columns.find(se=>se.id===n.id),W=R?R.visible!==!1:!0;return e.jsxs("label",{className:"flex items-center gap-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 px-2 py-1.5 rounded-lg",children:[e.jsx("input",{type:"checkbox",checked:W,onChange:()=>P(n.id),className:"form-checkbox text-primary w-3.5 h-3.5 rounded"}),e.jsx("span",{className:"text-xs text-gray-700 dark:text-gray-300",children:n.name})]},n.id)})}),e.jsx("div",{className:"border-t border-gray-100 dark:border-white/10 mt-3 mb-2"}),e.jsxs("div",{children:[e.jsx("div",{className:"text-xs font-medium text-gray-500 dark:text-white-dark mb-2",children:"Affichage titre"}),e.jsx("div",{className:"flex gap-1",children:[{value:"avatar",label:"Avatar"},{value:"icon",label:"Icône"},{value:"none",label:"Aucun"}].map(n=>e.jsx("button",{onClick:()=>o("titleDisplay",n.value),className:`flex-1 px-2 py-1.5 text-xs rounded-lg transition-all ${(a.titleDisplay||"avatar")===n.value?"bg-primary text-white":"bg-gray-100 dark:bg-dark/40 text-gray-600 dark:text-white-dark/70 hover:bg-gray-200 dark:hover:bg-dark/60"}`,children:n.label},n.value))})]}),e.jsx("div",{className:"border-t border-gray-100 dark:border-white/10 mt-3 mb-2"}),e.jsx("div",{children:e.jsxs("div",{className:"flex items-center justify-between",children:[e.jsx("span",{className:"text-xs font-medium text-gray-500 dark:text-white-dark",children:"Sélection multiple"}),e.jsx("button",{type:"button",onClick:()=>o("showCheckboxes",a.showCheckboxes===!1),style:{position:"relative",width:36,height:20,borderRadius:10,border:"none",cursor:"pointer",transition:"background 0.2s ease",background:a.showCheckboxes!==!1?"#4361ee":"#d1d5db",padding:0},children:e.jsx("span",{style:{position:"absolute",top:2,left:a.showCheckboxes!==!1?18:2,width:16,height:16,borderRadius:"50%",background:"#fff",boxShadow:"0 1px 3px rgba(0,0,0,0.2)",transition:"left 0.2s ease"}})})]})})]})]}),document.body),k&&_e.createPortal(e.jsxs(e.Fragment,{children:[e.jsx("div",{className:"fixed inset-0",style:{zIndex:9998},onClick:()=>re(!1)}),e.jsxs("div",{ref:v,className:"fixed rounded-xl shadow-xl p-4 w-64 bg-white dark:bg-[#0e1726] border border-gray-100 dark:border-white/10",style:{zIndex:9999,top:V(O).top,right:V(O).right,animation:"popoverSlide 0.15s ease-out"},children:[e.jsx("div",{className:"text-xs font-medium text-gray-500 dark:text-white-dark mb-3",children:"Vues disponibles"}),e.jsx("div",{className:"space-y-1",children:Ke.map(n=>{const R=L.includes(n.id),W=n.id==="table";return e.jsxs("label",{className:`flex items-center gap-3 cursor-pointer px-2 py-2 rounded-lg transition-all ${W?"opacity-60 cursor-not-allowed":"hover:bg-gray-50 dark:hover:bg-gray-800"}`,children:[e.jsx("input",{type:"checkbox",checked:R,onChange:()=>b(n.id),disabled:W,className:"form-checkbox text-primary w-4 h-4 rounded"}),e.jsxs("span",{className:`flex items-center gap-2 text-sm ${R?"text-gray-700 dark:text-gray-300":"text-gray-400 dark:text-gray-600"}`,children:[n.icon,n.label]})]},n.id)})}),e.jsx("div",{className:"border-t border-gray-100 dark:border-white/10 mt-3 pt-2",children:e.jsx("p",{className:"text-[10px] text-gray-400 dark:text-gray-600",children:"Le tableau est toujours activé par défaut."})})]})]}),document.body),e.jsx("style",{children:`
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
            `})]})}function Wt({records:t,columns:s,virtualizer:i,sort:a,onSort:o,onColumnReorder:x,density:l,titleDisplay:j,entityIcon:m,accountNumber:u,entitySlug:h,selectedIds:p,onToggleSelect:$,onSelectAll:L,allPageSelected:C,showCheckboxes:E=!0}){var d;const[X,F]=r.useState(null),[y,U]=r.useState(null),Y=i.getVirtualItems(),J={compact:{rowHeight:36,cellClass:"py-1",fontSize:"text-xs",imageSize:"w-6 h-6",fontWeight:"font-medium"},normal:{rowHeight:44,cellClass:"py-2",fontSize:"text-sm",imageSize:"w-9 h-9",fontWeight:"font-semibold"},comfortable:{rowHeight:56,cellClass:"py-3",fontSize:"text-sm",imageSize:"w-9 h-9",fontWeight:"font-semibold"}},te=J[l]||J.comfortable;return p&&p.size>0,e.jsx(e.Fragment,{children:e.jsxs("table",{className:"table-hover whitespace-nowrap dataTable-table w-full",children:[e.jsx("thead",{className:"sticky top-0 bg-white dark:bg-[#1b2e4b] z-10",children:e.jsxs("tr",{children:[E&&e.jsx("th",{style:{width:40,padding:"0 8px"},children:e.jsxs("label",{className:"bulk-checkbox-wrapper",style:{display:"flex",alignItems:"center",justifyContent:"center"},children:[e.jsx("input",{type:"checkbox",checked:C&&t.length>0,onChange:()=>L&&L(),className:"bulk-checkbox"}),e.jsx("span",{className:"bulk-checkbox-custom"})]})}),s.map(k=>{const re=(a==null?void 0:a.field)===k.id||k.id==="title"&&(a==null?void 0:a.field)==="title"||k.id==="createdAt"&&(a==null?void 0:a.field)==="createdAt",T=(a==null?void 0:a.direction)||"desc",A=X===k.id,I=y===k.id&&X!==k.id,G=k.id!=="actions";return e.jsx("th",{"data-sortable":k.sortable!==!1?"":void 0,"data-column-id":k.id,onDragEnter:Z=>{Z.preventDefault(),k.id!=="actions"&&X&&X!==k.id&&U(k.id)},onDragOver:Z=>{Z.preventDefault()},onDrop:Z=>{Z.preventDefault(),X&&X!==k.id&&k.id!=="actions"&&x&&x(X,k.id),F(null),U(null)},className:`px-2 ${A?"opacity-50":""} ${I?"border-l-2 border-l-primary bg-primary/5":""}`,style:{transition:"opacity 0.15s, border-color 0.15s, background 0.15s",...k.id==="actions"?{width:"1%",whiteSpace:"nowrap"}:{},...k.id==="title"?{minWidth:220}:{}},children:e.jsxs("div",{className:"flex items-center gap-1",children:[G&&e.jsx("span",{draggable:"true",onDragStart:Z=>{F(k.id),Z.dataTransfer.effectAllowed="move",Z.dataTransfer.setData("text/plain",k.id)},onDragEnd:()=>{F(null),U(null)},className:"cursor-grab text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300",children:e.jsxs("svg",{className:"h-3 w-3",viewBox:"0 0 24 24",fill:"currentColor",children:[e.jsx("circle",{cx:"9",cy:"6",r:"1.5"}),e.jsx("circle",{cx:"15",cy:"6",r:"1.5"}),e.jsx("circle",{cx:"9",cy:"12",r:"1.5"}),e.jsx("circle",{cx:"15",cy:"12",r:"1.5"}),e.jsx("circle",{cx:"9",cy:"18",r:"1.5"}),e.jsx("circle",{cx:"15",cy:"18",r:"1.5"})]})}),k.sortable!==!1?e.jsxs("a",{href:"#",className:"dataTable-sorter flex items-center gap-1",draggable:"false",onClick:Z=>{Z.preventDefault(),o(k.id)},children:[k.name,re&&e.jsx("svg",{className:`h-3 w-3 text-primary transition-transform ${T==="asc"?"rotate-180":""}`,viewBox:"0 0 24 24",fill:"none",children:e.jsx("path",{d:"M12 5V19M12 19L6 13M12 19L18 13",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round"})})]}):k.name]})},k.id)})]})}),e.jsxs("tbody",{children:[Y.length>0&&Y[0].start>0&&e.jsx("tr",{children:e.jsx("td",{colSpan:s.length+(E?1:0),style:{height:Y[0].start,padding:0}})}),Y.map(k=>{const re=t[k.index];if(!re)return null;const T={compact:"4px 8px",normal:"8px 12px",comfortable:"12px 12px"}[l]||"12px 12px",A=p&&p.has(re._id);return e.jsxs("tr",{"data-index":k.index,ref:i.measureElement,style:{minHeight:te.rowHeight},className:A?"bulk-row-selected":"",children:[E&&e.jsx("td",{style:{padding:"0 8px",width:40},children:e.jsxs("label",{className:"bulk-checkbox-wrapper",style:{display:"flex",alignItems:"center",justifyContent:"center"},onClick:I=>{I.preventDefault(),$&&$(re._id,k.index,I.shiftKey)},children:[e.jsx("input",{type:"checkbox",checked:A,readOnly:!0,className:"bulk-checkbox"}),e.jsx("span",{className:"bulk-checkbox-custom"})]})}),s.map(I=>e.jsx("td",{className:`${te.fontSize}`,style:{padding:T,...I.id==="actions"?{width:"1%",whiteSpace:"nowrap"}:{},...I.id==="title"?{minWidth:220}:{}},children:Ft(re,I,u,h,te,j,m)},I.id))]},re._id)}),t.length===0&&e.jsx("tr",{children:e.jsx("td",{colSpan:s.length+(E?1:0),className:"text-center py-12 text-gray-500 dark:text-gray-400 font-medium",children:"Aucun enregistrement"})}),Y.length>0&&e.jsx("tr",{children:e.jsx("td",{colSpan:s.length+(E?1:0),style:{height:Math.max(0,i.getTotalSize()-(((d=Y[Y.length-1])==null?void 0:d.end)||0)),padding:0}})})]})]})})}function Ft(t,s,i,a,o,x,l){var j,m;switch(s.id){case"title":{const u=t.referenceTitle||t.title||"Sans titre";u.charAt(0).toUpperCase();const h=Math.abs(u.charCodeAt(0)||65)%35+1,p=t.image||`/assets/images/profile-${h}.jpeg`;return e.jsxs("div",{className:"flex items-center gap-2",children:[x==="avatar"&&e.jsx("img",{src:p,alt:u,className:`${o.imageSize} rounded-full max-w-none`}),x==="icon"&&l&&e.jsx("div",{className:`${o.imageSize} rounded-lg max-w-none flex items-center justify-center bg-primary/10 text-primary shrink-0`,children:e.jsx("iconify-icon",{icon:l,width:"16"})}),e.jsx("a",{href:`/account/${i}/record/${a}/${t._id}/overview`,className:`${o.fontWeight} hover:text-primary transition-colors truncate`,title:u,children:u})]})}case"createdAt":return new Date(t.createdAt).toLocaleDateString("fr-FR");case"actions":return e.jsxs("div",{className:"flex items-center gap-0",children:[e.jsx("a",{href:`/account/${i}/record/${a}/${t._id}/overview`,className:"p-1 rounded-lg text-gray-500 hover:text-primary hover:bg-primary/10 transition-all",title:"Voir",children:e.jsxs("svg",{className:"h-4 w-4",viewBox:"0 0 24 24",fill:"none",children:[e.jsx("path",{d:"M15 12C15 13.6569 13.6569 15 12 15C10.3431 15 9 13.6569 9 12C9 10.3431 10.3431 9 12 9C13.6569 9 15 10.3431 15 12Z",stroke:"currentColor",strokeWidth:"1.5"}),e.jsx("path",{d:"M12 5C7.5 5 3.73 7.94 2 12C3.73 16.06 7.5 19 12 19C16.5 19 20.27 16.06 22 12C20.27 7.94 16.5 5 12 5Z",stroke:"currentColor",strokeWidth:"1.5"})]})}),e.jsx("a",{href:`/account/${i}/record/${a}/${t._id}/overview`,className:"p-1 rounded-lg text-gray-500 hover:text-info hover:bg-info/10 transition-all",title:"Modifier",children:e.jsx("svg",{className:"h-4 w-4",viewBox:"0 0 24 24",fill:"none",children:e.jsx("path",{d:"M16.862 4.487L18.55 2.8C19.33 2.02 20.59 2.02 21.37 2.8C22.15 3.58 22.15 4.84 21.37 5.62L19.681 7.307M16.862 4.487L4.162 17.187C3.882 17.467 3.682 17.818 3.592 18.198L2.732 21.596C2.642 21.966 2.952 22.296 3.322 22.226L6.892 21.556C7.242 21.486 7.572 21.306 7.832 21.046L20.513 8.366M16.862 4.487L19.681 7.307",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round"})})}),e.jsx("button",{type:"button",className:"p-1 rounded-lg text-gray-500 hover:text-danger hover:bg-danger/10 transition-all",title:"Supprimer",onClick:()=>{confirm("Êtes-vous sûr de vouloir supprimer cet enregistrement ?")&&console.log("Delete record:",t._id)},children:e.jsxs("svg",{className:"h-4 w-4",viewBox:"0 0 24 24",fill:"none",children:[e.jsx("path",{d:"M20.5 6H3.5",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"}),e.jsx("path",{d:"M18.833 8.5L18.373 15.4C18.196 18.054 18.108 19.381 17.243 20.19C16.378 21 15.048 21 12.387 21H11.613C8.952 21 7.622 21 6.757 20.19C5.892 19.381 5.804 18.054 5.627 15.4L5.167 8.5",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"}),e.jsx("path",{d:"M9.5 11L10 16",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"}),e.jsx("path",{d:"M14.5 11L14 16",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"}),e.jsx("path",{d:"M6.5 6C6.556 5.367 6.612 5.1 6.877 4.714C7.178 4.275 7.945 3.917 9.484 3.2L9.924 2.984C10.683 2.589 11.06 2.392 11.476 2.318C11.823 2.254 12.177 2.254 12.524 2.318C12.94 2.392 13.317 2.589 14.076 2.984L14.516 3.2C16.055 3.917 16.822 4.275 17.123 4.714C17.388 5.1 17.444 5.367 17.5 6",stroke:"currentColor",strokeWidth:"1.5"})]})})]});default:{if(s.id.startsWith("rel:")){const u=s.id.substring(4),p=(((j=t._denorm)==null?void 0:j.relations)||[]).find(L=>L.relationKey===u);if(((m=p==null?void 0:p.records)==null?void 0:m.length)>0)return e.jsx("div",{className:"flex flex-wrap gap-1",children:p.records.map((L,C)=>e.jsx("a",{href:`/account/${i}/record/${L.entitySlug||s.targetEntitySlug||a}/${L._id}`,className:"text-primary hover:underline text-xs",children:L.title||"Sans titre"},C))});const $=(t.relations||[]).find(L=>L.relationKey===u);return $!=null&&$.value?"—":""}if(s.id.startsWith("classif:")){const u=s.id.substring(8),h=(t.classificationValues||[]).find(p=>{var L,C,E;return(((L=p.classificationId)==null?void 0:L.$oid)||((E=(C=p.classificationId)==null?void 0:C.toString)==null?void 0:E.call(C))||p.classificationId)===u});if(h!=null&&h.label){const p=h.color||"#888";return e.jsx("span",{className:"inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap",style:{backgroundColor:`${p}15`,color:p,border:`1px solid ${p}30`},children:h.label})}return h!=null&&h.value?e.jsx("span",{className:"inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20",children:h.value}):""}if(s.computed&&t._computedFields){const u=t._computedFields[s.id];if(!u||u.value===null||u.value===void 0)return"—";const h=s.computedDisplay||"text",p=s.computedColor||"#4361ee";if(h==="badge")return e.jsx("span",{className:"inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap",style:{background:`${p}15`,color:p,border:`1px solid ${p}30`},children:u.formatted||u.value});if(h==="currency")return e.jsx("span",{style:{fontWeight:600,color:"#334155"},children:u.formatted||`${Number(u.value).toFixed(2)} €`});if(h==="stars"){const $=Number(u.value)||0,L=Number(u.max)||5;return e.jsxs("span",{style:{display:"inline-flex",alignItems:"center",gap:1},children:[Array.from({length:Math.floor($)}).map((C,E)=>e.jsx("iconify-icon",{icon:"solar:star-bold",width:"14",style:{color:"#f59e0b"}},`f${E}`)),$-Math.floor($)>=.5&&e.jsx("iconify-icon",{icon:"solar:star-bold-duotone",width:"14",style:{color:"#f59e0b"}}),Array.from({length:L-Math.ceil($)}).map((C,E)=>e.jsx("iconify-icon",{icon:"solar:star-line-duotone",width:"14",style:{color:"#e2e8f0"}},`e${E}`)),e.jsx("span",{style:{fontSize:11,color:"#9ca3af",marginLeft:4},children:u.formatted})]})}if(h==="progress"){const $=Math.min(Math.max(Number(u.percentage||u.value)||0,0),100),L=$>=80?"#10b981":$>=50?"#f59e0b":"#ef4444";return e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:6,minWidth:80},children:[e.jsx("div",{style:{flex:1,height:5,background:"#e2e8f0",borderRadius:3,overflow:"hidden"},children:e.jsx("div",{style:{width:`${$}%`,height:"100%",background:L,borderRadius:3}})}),e.jsxs("span",{style:{fontSize:11,fontWeight:600,color:L},children:[$,"%"]})]})}return u.formatted||u.value||""}if(t.customFields){const u=t.customFields.find(p=>{var L;const $=((L=p.field_id)==null?void 0:L._id)||p.field_id;return($==null?void 0:$.toString())===s.id});if(!u)return"";const h=u.value;if(h&&typeof h=="object"&&h._v){const p=[];return Object.entries(h).forEach(([$,L])=>{$==="_v"||$==="customText"||(Array.isArray(L)?L.forEach(C=>p.push(C)):L&&p.push(L))}),h.customText&&p.push(h.customText),e.jsx("div",{className:"flex flex-wrap gap-1",children:p.map(($,L)=>e.jsx("span",{className:"inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20",children:$},L))})}return h||""}return""}}}function Ye(t,s=.1){if(!t)return`rgba(99, 102, 241, ${s})`;const i=parseInt(t.slice(1,3),16),a=parseInt(t.slice(3,5),16),o=parseInt(t.slice(5,7),16);return`rgba(${i}, ${a}, ${o}, ${s})`}function zt({field:t,record:s}){const i=(s.customFields||[]).find(o=>{var l;const x=((l=o.field_id)==null?void 0:l._id)||o.field_id;return(x==null?void 0:x.toString())===t.id});if(!i)return e.jsx("span",{className:"text-gray-400 dark:text-gray-600 text-sm italic",children:"—"});const a=i.value;if(a==null||a==="")return e.jsx("span",{className:"text-gray-400 dark:text-gray-600 text-sm italic",children:"—"});if(t.type==="date"||t.type==="datetime")try{return e.jsx("span",{className:"text-sm text-gray-700 dark:text-gray-300",children:new Date(a).toLocaleDateString("fr-FR")})}catch{return e.jsx("span",{className:"text-sm text-gray-700 dark:text-gray-300",children:String(a)})}return t.type==="boolean"||t.type==="checkbox"?e.jsxs("span",{className:`inline-flex items-center gap-1 text-sm ${a?"text-success":"text-gray-400"}`,children:[a?e.jsxs("svg",{width:"16",height:"16",viewBox:"0 0 24 24",fill:"none",children:[e.jsx("path",{d:"M9 12l2 2 4-4",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round"}),e.jsx("circle",{cx:"12",cy:"12",r:"10",stroke:"currentColor",strokeWidth:"1.5"})]}):e.jsx("svg",{width:"16",height:"16",viewBox:"0 0 24 24",fill:"none",children:e.jsx("circle",{cx:"12",cy:"12",r:"10",stroke:"currentColor",strokeWidth:"1.5"})}),a?"Oui":"Non"]}):t.type==="relation"?Array.isArray(a)?e.jsx("div",{className:"flex flex-wrap gap-1",children:a.map((o,x)=>e.jsx("span",{className:"inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-primary/10 text-primary font-medium",children:o.title||o.label||o.name||String(o)},x))}):e.jsx("span",{className:"text-sm text-gray-700 dark:text-gray-300",children:a.title||a.label||String(a)}):t.type==="number"?e.jsx("span",{className:"text-sm font-mono text-gray-700 dark:text-gray-300",children:Number(a).toLocaleString("fr-FR")}):e.jsx("span",{className:"text-sm text-gray-700 dark:text-gray-300",children:String(a)})}function Ot({record:t,columns:s,accountNumber:i,entitySlug:a,onClose:o}){var F;const x=r.useRef(null),[l,j]=r.useState(!1);r.useEffect(()=>{requestAnimationFrame(()=>j(!0))},[]);const m=r.useCallback(()=>{j(!1),setTimeout(()=>o(),250)},[o]);if(r.useEffect(()=>{const y=U=>{U.key==="Escape"&&m()};return document.addEventListener("keydown",y),()=>document.removeEventListener("keydown",y)},[m]),!t)return null;const u=((F=t._id)==null?void 0:F.$oid)||t._id,h=t.referenceTitle||t.title||t.computedTitle||"Sans titre",p=t.description||"",$=t.createdAt?new Date(t.createdAt).toLocaleDateString("fr-FR",{day:"2-digit",month:"long",year:"numeric"}):null,L=t.updatedAt?new Date(t.updatedAt).toLocaleDateString("fr-FR",{day:"2-digit",month:"long",year:"numeric"}):null,C=(t.classificationValues||[]).filter(y=>y.optionLabel||y.label).map(y=>({label:y.optionLabel||y.label,color:y.optionColor||y.color||"#6366f1",classificationName:y.classificationName||"Classification"})),E={};C.forEach(y=>{E[y.classificationName]||(E[y.classificationName]=[]),E[y.classificationName].push(y)});const X=s.filter(y=>y.id!=="title"&&y.id!=="actions"&&!y.id.startsWith("class:"));return _e.createPortal(e.jsxs(e.Fragment,{children:[e.jsx("div",{className:`fixed inset-0 bg-black/40 backdrop-blur-[2px] transition-opacity duration-250 ${l?"opacity-100":"opacity-0"}`,style:{zIndex:1e4},onMouseDown:m,onTouchEnd:y=>{y.preventDefault(),m()}}),e.jsxs("div",{ref:x,className:`fixed right-0 top-0 h-full bg-white dark:bg-[#0e1726] shadow-2xl border-l border-gray-200 dark:border-gray-700 flex flex-col transition-transform duration-250 ease-out ${l?"translate-x-0":"translate-x-full"}`,style:{zIndex:10001,width:"min(520px, 90vw)"},onClick:y=>y.stopPropagation(),children:[e.jsxs("div",{className:"flex items-center justify-between gap-3 px-6 py-4 border-b border-gray-100 dark:border-gray-700/50 flex-shrink-0",children:[e.jsxs("div",{className:"flex items-center gap-2 min-w-0",children:[e.jsx("div",{className:"w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0",children:e.jsxs("svg",{width:"16",height:"16",viewBox:"0 0 24 24",fill:"none",children:[e.jsx("path",{d:"M2 12C2 7.28595 2 4.92893 3.46447 3.46447C4.92893 2 7.28595 2 12 2C16.714 2 19.0711 2 20.5355 3.46447C22 4.92893 22 7.28595 22 12C22 16.714 22 19.0711 20.5355 20.5355C19.0711 22 16.714 22 12 22C7.28595 22 4.92893 22 3.46447 20.5355C2 19.0711 2 16.714 2 12Z",stroke:"#4361ee",strokeWidth:"1.5"}),e.jsx("path",{d:"M8 12H16M12 8V16",stroke:"#4361ee",strokeWidth:"1.5",strokeLinecap:"round"})]})}),e.jsx("h3",{className:"text-base font-semibold text-gray-900 dark:text-white truncate",children:h})]}),e.jsxs("div",{className:"flex items-center gap-1 flex-shrink-0",children:[e.jsx("a",{href:`/account/${i}/record/${a}/${u}/overview`,className:"p-2 rounded-lg text-gray-400 hover:text-primary hover:bg-primary/10 transition-all",title:"Ouvrir la page complète",children:e.jsxs("svg",{width:"16",height:"16",viewBox:"0 0 24 24",fill:"none",children:[e.jsx("path",{d:"M10 4H6C4.89543 4 4 4.89543 4 6V18C4 19.1046 4.89543 20 6 20H18C19.1046 20 20 19.1046 20 18V14",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"}),e.jsx("path",{d:"M14 4H20V10",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round"}),e.jsx("path",{d:"M20 4L11 13",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"})]})}),e.jsx("a",{href:`/account/${i}/record/${a}/${u}/overview`,className:"p-2 rounded-lg text-gray-400 hover:text-info hover:bg-info/10 transition-all",title:"Modifier",children:e.jsx("svg",{width:"16",height:"16",viewBox:"0 0 24 24",fill:"none",children:e.jsx("path",{d:"M16.862 4.487L18.55 2.8C19.33 2.02 20.59 2.02 21.37 2.8C22.15 3.58 22.15 4.84 21.37 5.62L19.681 7.307M16.862 4.487L4.162 17.187C3.882 17.467 3.682 17.818 3.592 18.198L2.732 21.596C2.642 21.966 2.952 22.296 3.322 22.226L6.892 21.556C7.242 21.486 7.572 21.306 7.832 21.046L20.513 8.366",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"})})}),e.jsx("button",{onClick:m,className:"p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all",title:"Fermer",children:e.jsx("svg",{width:"16",height:"16",viewBox:"0 0 24 24",fill:"none",children:e.jsx("path",{d:"M18 6L6 18M6 6L18 18",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round"})})})]})]}),e.jsxs("div",{className:"flex-1 overflow-y-auto",children:[Object.keys(E).length>0&&e.jsx("div",{className:"px-6 py-4 border-b border-gray-100 dark:border-gray-700/50",children:Object.entries(E).map(([y,U])=>e.jsxs("div",{className:"mb-3 last:mb-0",children:[e.jsx("div",{className:"text-[11px] uppercase tracking-wider font-semibold text-gray-400 dark:text-gray-500 mb-1.5",children:y}),e.jsx("div",{className:"flex flex-wrap gap-1.5",children:U.map((Y,J)=>e.jsxs("span",{className:"inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium transition-all hover:scale-105",style:{backgroundColor:Ye(Y.color,.15),color:Y.color,border:`1px solid ${Ye(Y.color,.3)}`},children:[e.jsx("span",{className:"w-2 h-2 rounded-full flex-shrink-0",style:{backgroundColor:Y.color}}),Y.label]},J))})]},y))}),p&&e.jsxs("div",{className:"px-6 py-4 border-b border-gray-100 dark:border-gray-700/50",children:[e.jsx("div",{className:"text-[11px] uppercase tracking-wider font-semibold text-gray-400 dark:text-gray-500 mb-2",children:"Description"}),e.jsx("p",{className:"text-sm text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-wrap",children:p})]}),e.jsxs("div",{className:"px-6 py-4",children:[e.jsx("div",{className:"text-[11px] uppercase tracking-wider font-semibold text-gray-400 dark:text-gray-500 mb-3",children:"Détails"}),e.jsxs("div",{className:"space-y-0",children:[X.map(y=>e.jsxs("div",{className:"flex items-start gap-3 py-2.5 border-b border-gray-50 dark:border-gray-800/50 last:border-0",children:[e.jsx("div",{className:"w-32 flex-shrink-0 text-xs font-medium text-gray-500 dark:text-gray-400 pt-0.5 truncate",children:y.name}),e.jsx("div",{className:"flex-1 min-w-0",children:e.jsx(zt,{field:y,record:t})})]},y.id)),(t.relations||[]).map((y,U)=>{var Y;return e.jsxs("div",{className:"flex items-start gap-3 py-2.5 border-b border-gray-50 dark:border-gray-800/50 last:border-0",children:[e.jsx("div",{className:"w-32 flex-shrink-0 text-xs font-medium text-gray-500 dark:text-gray-400 pt-0.5 truncate",children:y.label||y.key||"Relation"}),e.jsx("div",{className:"flex-1 min-w-0",children:((Y=y.records)==null?void 0:Y.length)>0?e.jsx("div",{className:"flex flex-wrap gap-1",children:y.records.map((J,te)=>e.jsx("a",{href:`/account/${i}/record/${y.entitySlug||a}/${J._id}`,className:"inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-primary/10 text-primary font-medium hover:bg-primary/20 transition-colors",children:J.referenceTitle||J.title||"Sans titre"},te))}):e.jsx("span",{className:"text-gray-400 dark:text-gray-600 text-sm italic",children:"—"})})]},`rel-${U}`)})]})]})]}),e.jsx("div",{className:"flex-shrink-0 px-6 py-3 border-t border-gray-100 dark:border-gray-700/50 bg-gray-50/50 dark:bg-[#0a0f1e]/50",children:e.jsxs("div",{className:"flex items-center justify-between text-[11px] text-gray-400 dark:text-gray-500",children:[e.jsxs("div",{className:"flex items-center gap-3",children:[$&&e.jsxs("span",{className:"flex items-center gap-1",children:[e.jsxs("svg",{width:"12",height:"12",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"1.5",children:[e.jsx("circle",{cx:"12",cy:"12",r:"10"}),e.jsx("path",{d:"M12 6V12L16 14",strokeLinecap:"round"})]}),"Créé le ",$]}),L&&e.jsxs("span",{className:"flex items-center gap-1",children:[e.jsx("svg",{width:"12",height:"12",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"1.5",children:e.jsx("path",{d:"M4.06 13C4.02 12.67 4 12.34 4 12C4 7.58 7.58 4 12 4C14.5 4 16.73 5.15 18.2 6.94M19.94 11C19.98 11.33 20 11.66 20 12C20 16.42 16.42 20 12 20C9.5 20 7.27 18.85 5.8 17.06",strokeLinecap:"round",strokeLinejoin:"round"})}),"Modifié le ",L]})]}),e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx("a",{href:`/account/${i}/record/${a}/${u}/overview`,className:"px-3 py-1.5 bg-primary/10 text-primary text-xs font-medium rounded-lg hover:bg-primary/20 transition-colors",children:"Voir"}),e.jsx("a",{href:`/account/${i}/record/${a}/${u}/overview`,className:"px-3 py-1.5 bg-primary text-white text-xs font-medium rounded-lg hover:bg-primary/90 transition-colors",children:"Modifier"})]})]})})]})]}),document.body)}function We(t,s=.1){const i=/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(t);return i?`rgba(${parseInt(i[1],16)}, ${parseInt(i[2],16)}, ${parseInt(i[3],16)}, ${s})`:`rgba(128,128,128,${s})`}function Ne(t){var s;return String(((s=t==null?void 0:t._id)==null?void 0:s.$oid)||(t==null?void 0:t._id)||t||"")}function At(t,s=0){if(typeof t=="string")return{value:t,label:t,color:"#64748b",order:s};const i=String((t==null?void 0:t.value)??(t==null?void 0:t.id)??(t==null?void 0:t._id)??(t==null?void 0:t.label)??(t==null?void 0:t.name)??"");return{value:i,label:(t==null?void 0:t.label)||(t==null?void 0:t.name)||i,color:(t==null?void 0:t.color)||(t==null?void 0:t.couleur)||(t==null?void 0:t.bg)||"#64748b",order:Number.isFinite(Number(t==null?void 0:t.order))?Number(t.order):s}}function Je(t){if(t==null||t==="")return[];if(Array.isArray(t))return t.flatMap(s=>Je(s));if(typeof t=="object"){if(t._v){const s=[];return Object.entries(t).forEach(([i,a])=>{i==="_v"||i==="customText"||s.push(...Je(a))}),t.customText&&s.push(t.customText),s}return[String(t.label||t.name||t.value||"").trim()].filter(Boolean)}return String(t).split(",").map(s=>s.trim()).filter(Boolean)}function Vt(t,s){const i=(t.customFields||[]).find(a=>Ne(a.field_id)===String(s));return i==null?void 0:i.value}function Bt(t,s,i=[]){if(!i.length)return[];const a=new Map(((s==null?void 0:s.customFields)||[]).map(o=>[Ne(o),o]));return i.flatMap(o=>{var m,u;const x=a.get(String(o));if(!x)return[];const l=(((m=x.type_config)==null?void 0:m.options)||((u=x.typeConfig)==null?void 0:u.options)||x.options||[]).map(At),j=new Map;return l.forEach(h=>{j.set(String(h.value),h),j.set(String(h.label),h)}),Je(Vt(t,o)).map(h=>{var $;const p=j.get(String(h));return{fieldId:o,label:(p==null?void 0:p.label)||h,color:(p==null?void 0:p.color)||x.color||(($=x.ui)==null?void 0:$.couleur)||"#64748b"}})}).filter(o=>o.label)}function Pt({tags:t}){if(!t.length)return null;const s=t.slice(0,4),i=t.length-s.length;return e.jsxs("div",{className:"flex flex-wrap gap-1 border-t border-gray-100 bg-gray-50/80 px-3 py-2 dark:border-white/10 dark:bg-[#0b1220]/70",children:[s.map((a,o)=>e.jsx("span",{className:"inline-flex max-w-full items-center rounded-full px-2 py-0.5 text-[10px] font-bold",style:{backgroundColor:We(a.color,.12),color:a.color},children:e.jsx("span",{className:"truncate",children:a.label})},`${a.fieldId}-${a.label}-${o}`)),i>0&&e.jsxs("span",{className:"inline-flex items-center rounded-full bg-gray-200 px-2 py-0.5 text-[10px] font-bold text-gray-500 dark:bg-white/10 dark:text-white-dark",children:["+",i]})]})}function at({record:t,accountNumber:s,entitySlug:i,isDragging:a=!1,onQuickView:o,cardTemplate:x,entityData:l,kanbanTagFieldIds:j}){var te;const m=r.useRef(null),u=r.useRef(!1),h=String(((te=t._id)==null?void 0:te.$oid)||t._id),p=r.useMemo(()=>Bt(t,l,j),[t,l,j]),{attributes:$,listeners:L,setNodeRef:C,transform:E,transition:X,isDragging:F}=Tt({id:h}),y={transform:Et.Transform.toString(E),transition:X,opacity:a||F?.7:1,touchAction:"manipulation"},U=d=>{m.current={x:d.clientX,y:d.clientY,time:Date.now()},u.current=!1},Y=d=>{if(m.current){const k=Math.abs(d.clientX-m.current.x),re=Math.abs(d.clientY-m.current.y);(k>5||re>5)&&(u.current=!0)}},J=d=>{if(!m.current)return;const k=Date.now()-m.current.time;!u.current&&k<400&&o&&!d.target.closest("a, button")&&setTimeout(()=>o(t),50),m.current=null};return e.jsxs("div",{ref:C,style:y,className:`kanban-card cursor-pointer overflow-hidden rounded-lg border border-gray-200/80 bg-white transition-all group dark:border-white/10 dark:bg-dark/40 ${a||F?"shadow-lg ring-2 ring-primary/30 cursor-move":"hover:shadow-md dark:hover:bg-dark/60"}`,"data-dnd":"card",onPointerDown:U,onPointerMove:Y,onPointerUp:J,...$,...L,children:[e.jsx(st,{record:t,cardTemplate:x,context:"kanban",entityData:l,accountNumber:s,entitySlug:i,className:"bg-transparent",style:{borderRadius:0,boxShadow:"none"}}),e.jsx(Pt,{tags:p})]})}function Dt({column:t,records:s,recordIds:i,accountNumber:a,entitySlug:o,onQuickView:x,cardTemplate:l,entityData:j,kanbanTagFieldIds:m}){const{setNodeRef:u,isOver:h}=_t({id:String(t.id)}),p=typeof document<"u"&&document.documentElement.classList.contains("dark"),$=We(t.color,p?.12:.06),L=We(t.color,p?.3:.15);return e.jsxs("div",{ref:u,className:`flex-none rounded-lg overflow-hidden transition-all ${h?"ring-2 ring-primary/50 ring-offset-2":""}`,style:{width:"300px",maxWidth:"320px",backgroundColor:h?We(t.color,.15):$,border:`1px solid ${L}`},"data-dnd":"column",children:[e.jsx("div",{style:{height:"4px",backgroundColor:t.color}}),e.jsx("div",{className:"px-3 py-2 flex justify-between items-center",children:e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx("span",{className:"inline-flex items-center gap-1.5 px-2 py-0 rounded text-xs font-semibold uppercase tracking-wide",style:{backgroundColor:t.color,color:"#fff"},children:t.title}),e.jsx("span",{className:"text-xs text-gray-500 font-medium",children:s.length})]})}),e.jsx("div",{className:"px-2 pb-3",children:e.jsx($t,{items:i,strategy:It,children:e.jsx("div",{className:`space-y-2 min-h-[80px] rounded-lg transition-all ${h?"bg-primary/5 p-2":""}`,children:s.length===0?e.jsx("div",{className:"text-xs text-gray-300 dark:text-gray-600 text-center py-8 italic",children:"Aucun enregistrement"}):s.map(C=>{var E;return e.jsx(at,{record:C,accountNumber:a,entitySlug:o,onQuickView:x,cardTemplate:l,entityData:j,kanbanTagFieldIds:m},((E=C._id)==null?void 0:E.$oid)||C._id)})})})}),e.jsx("div",{className:"px-3 pb-3",children:e.jsxs("button",{type:"button",className:"flex items-center gap-1 text-xs text-gray-400 hover:text-primary transition-colors",children:[e.jsx("svg",{width:"14",height:"14",viewBox:"0 0 24 24",fill:"none",children:e.jsx("path",{d:"M12 6V18M6 12H18",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round"})}),"Ajouter"]})})]})}function Ht({records:t,columns:s,accountNumber:i,entitySlug:a,viewId:o,entityData:x,kanbanFieldId:l="status",kanbanTagFieldIds:j=[]}){const m=r.useRef(null),u=r.useRef(null),[h,p]=r.useState(t),[$,L]=r.useState({}),[C,E]=r.useState(null),[X,F]=r.useState(null),y=r.useCallback(b=>{F(b)},[]),[U,Y]=r.useState(null);r.useEffect(()=>{var N;if(!(x!=null&&x._id))return;const b=((N=x._id)==null?void 0:N.$oid)||x._id;fetch(`/account/${i}/api/entity/${b}/cards/default/kanban`,{credentials:"include"}).then(P=>P.json()).then(P=>{P.success&&P.card&&Y(P.card)}).catch(()=>{})},[x==null?void 0:x._id,i]),r.useEffect(()=>{p(t)},[t]);const J=r.useRef(!1),te=r.useRef(0),d=r.useRef(0),k=r.useCallback(b=>{if(C||b.button!==0||b.target.closest('a, button, .dropdown, [data-dnd="card"]'))return;const N=m.current;N&&(J.current=!0,te.current=b.pageX-N.offsetLeft,d.current=N.scrollLeft,N.style.cursor="grabbing")},[C]),re=r.useCallback(b=>{if(C){J.current=!1;return}if(!J.current)return;b.preventDefault();const N=m.current;if(!N)return;const V=(b.pageX-N.offsetLeft-te.current)*1.5;N.scrollLeft=d.current-V},[C]),T=r.useCallback(()=>{J.current=!1,m.current&&(m.current.style.cursor="grab")},[]),A=yt(Ve(Mt,{activationConstraint:{distance:8}}),Ve(Lt,{activationConstraint:{delay:500,tolerance:10}}),Ve(St,{coordinateGetter:Nt})),I=r.useMemo(()=>{var V,de;if(x){const Q=x.statusClassification,f=[],M=new Set;[Q,...x.classifications||[]].forEach(R=>{const W=Ne(R);!W||M.has(W)||(M.add(W),f.push(R))});let n=null;if(l==="status"&&Q?n=Q:n=f.find(R=>{const W=Ne(R);return W===String(l)||`classif:${W}`===String(l)}),n||(n=Q&&((V=Q.options)==null?void 0:V.length)>0?Q:f.find(R=>{var W;return((W=R.options)==null?void 0:W.length)>0})),((de=n==null?void 0:n.options)==null?void 0:de.length)>0){const R=n.options.map((W,se)=>({id:Ne(W),title:W.label,color:W.color||"#6366f1",optionId:Ne(W),order:Number.isFinite(Number(W.order))?Number(W.order):se})).sort((W,se)=>W.order-se.order);return R.push({id:"__none__",title:n===Q?"Sans Statut":"Non classé",color:"#9ca3af",optionId:"none"}),{classId:Ne(n),columns:R}}}const b={};h.forEach(Q=>{(Q.classificationValues||[]).forEach(f=>{var se,ee;const M=((se=f.classificationId)==null?void 0:se.$oid)||f.classificationId||f.classification_id;if(!M)return;b[M]||(b[M]={count:0,options:{}}),b[M].count++;const n=f.optionLabel||f.label||"Sans label",R=f.optionColor||f.color||"#9ca3af",W=((ee=f.optionId)==null?void 0:ee.$oid)||f.optionId||n;b[M].options[n]||(b[M].options[n]={label:n,color:R,optionId:String(W),count:0}),b[M].options[n].count++})});let N=null,P=0;if(Object.entries(b).forEach(([Q,f])=>{f.count>P&&(P=f.count,N=Q)}),N&&b[N]){const f=Object.values(b[N].options).map(M=>({id:M.label,title:M.label,color:M.color,optionId:M.optionId}));return f.push({id:"__none__",title:"Sans classification",color:"#9ca3af",optionId:"none"}),{classId:N,columns:f}}return{classId:null,columns:[{id:"__all__",title:"Tous les enregistrements",color:"#4361ee",optionId:null}]}},[h,x,l]),G=r.useMemo(()=>{const b={};if(I.columns.forEach(N=>b[N.id]=[]),!I.classId)b.__all__=h;else{const N={};I.columns.forEach(V=>{V.optionId&&V.optionId!=="none"&&(N[String(V.optionId)]=V.id)});const P={};I.columns.forEach(V=>{P[V.title]=V.id}),h.forEach(V=>{var f;const Q=(V.classificationValues||[]).find(M=>{var R;const n=((R=M.classificationId)==null?void 0:R.$oid)||M.classificationId||M.classification_id;return String(n)===String(I.classId)});if(Q){const M=String(((f=Q.optionId)==null?void 0:f.$oid)||Q.optionId||""),n=N[M];if(n&&b[n])b[n].push(V);else{const R=Q.optionLabel||Q.label||"Sans label";b[R]?b[R].push(V):b.__none__&&b.__none__.push(V)}}else b.__none__&&b.__none__.push(V)})}for(const N of Object.keys(b)){const P=$[N]||[];P.length&&b[N].sort((V,de)=>{var M,n;const Q=P.indexOf(String(((M=V._id)==null?void 0:M.$oid)||V._id)),f=P.indexOf(String(((n=de._id)==null?void 0:n.$oid)||de._id));return Q===-1&&f===-1?0:Q===-1?1:f===-1?-1:Q-f})}return b},[I,h,$]),Z=r.useMemo(()=>{const b={};for(const N of I.columns)b[N.id]=(G[N.id]||[]).map(P=>{var V;return String(((V=P._id)==null?void 0:V.$oid)||P._id)});return b},[I.columns,G]),O=r.useCallback(b=>{var P;const N=String(b);for(const V of Object.keys(Z))if((P=Z[V])!=null&&P.includes(N))return V;return null},[Z]),oe=r.useMemo(()=>C&&h.find(b=>{var N;return String(((N=b._id)==null?void 0:N.$oid)||b._id)===String(C)})||null,[C,h]),le=r.useCallback(b=>{o&&(u.current&&clearTimeout(u.current),u.current=setTimeout(async()=>{try{await fetch(`/account/${i}/api/user/view-preferences`,{method:"POST",headers:{"Content-Type":"application/json"},credentials:"include",body:JSON.stringify({viewId:o,preferences:{kanban:{orderByColumn:b}}})})}catch{}},250))},[i,o]),xe=r.useCallback(async(b,N)=>{if(!I.classId)return;const P=I.columns.find(V=>V.id===N);if(P)try{await fetch(`/account/${i}/api/record/update-classification`,{method:"POST",headers:{"Content-Type":"application/json"},credentials:"include",body:JSON.stringify({recordId:b,classificationId:I.classId,optionId:P.optionId==="none"?null:P.optionId})})}catch(V){console.error("[RecordsKanban] Update error:",V)}},[i,I]),v=b=>{E(String(b.active.id))},B=()=>{E(null)},H=b=>{const{active:N,over:P}=b;if(E(null),!P)return;const V=String(N.id),de=String(P.id),Q=O(V),f=I.columns.some(ee=>String(ee.id)===de)?de:O(de);if(!Q||!f)return;if(Q===f){const ee=Z[Q]||[],ne=ee.indexOf(V),q=ee.indexOf(de);if(ne===-1||q===-1||ne===q)return;const g=Ct(ee,ne,q),w={...$,[Q]:g};L(w),le(w);return}const M=[...Z[Q]||[]].filter(ee=>ee!==V),n=[...Z[f]||[]],W=I.columns.some(ee=>String(ee.id)===de)?n.length:Math.max(0,n.indexOf(de));n.splice(W,0,V);const se={...$,[Q]:M,[f]:n};if(L(se),le(se),I.classId){const ee=I.columns.find(ne=>ne.id===f);p(ne=>ne.map(q=>{var w;if(String(((w=q._id)==null?void 0:w.$oid)||q._id)!==V)return q;const g=(q.classificationValues||[]).filter(K=>{var be;const fe=((be=K.classificationId)==null?void 0:be.$oid)||K.classificationId||K.classification_id;return String(fe)!==String(I.classId)});return f!=="__none__"&&ee&&g.push({classificationId:I.classId,optionId:ee.optionId,optionLabel:ee.title,optionColor:ee.color}),{...q,classificationValues:g}})),xe(V,f)}};return e.jsxs("div",{ref:m,className:"h-full overflow-x-auto overflow-y-auto",style:{cursor:"grab",userSelect:"none",WebkitUserSelect:"none"},onMouseDown:k,onMouseMove:re,onMouseUp:T,onMouseLeave:T,children:[e.jsxs(kt,{sensors:A,collisionDetection:wt,autoScroll:{threshold:{x:.15,y:.15},interval:10,acceleration:5},onDragStart:v,onDragEnd:H,onDragCancel:B,children:[e.jsx("div",{style:{display:"flex",flexWrap:"nowrap",alignItems:"flex-start",gap:"1.25rem",padding:"0.5rem",width:"max-content",minHeight:"100%"},children:I.columns.map(b=>{const N=G[b.id]||[];return b.id==="__none__"&&N.length===0?null:e.jsx(Dt,{column:b,records:N,recordIds:Z[b.id]||[],accountNumber:i,entitySlug:a,onQuickView:y,cardTemplate:U,entityData:x,kanbanTagFieldIds:j},b.id)})}),e.jsx(jt,{children:oe?e.jsx(at,{record:oe,accountNumber:i,entitySlug:a,isDragging:!0,cardTemplate:U,entityData:x,kanbanTagFieldIds:j}):null})]}),X&&e.jsx(Ot,{record:X,columns:s,accountNumber:i,entitySlug:a,onClose:()=>F(null)})]})}const Ze=[{bg:"bg-primary-light shadow-primary",text:"text-primary",dot:"#4361ee"},{bg:"bg-info-light shadow-info",text:"text-info",dot:"#2196f3"},{bg:"bg-warning-light shadow-warning",text:"text-warning",dot:"#e2a03f"},{bg:"bg-danger-light shadow-danger",text:"text-danger",dot:"#e7515a"},{bg:"bg-success-light shadow-success",text:"text-success",dot:"#00ab55"},{bg:"bg-secondary-light shadow-secondary",text:"text-secondary",dot:"#805dca"}];function Jt(t){return Ze[t%Ze.length]}function Ut(){return e.jsxs("svg",{width:"24",height:"24",viewBox:"0 0 24 24",fill:"none",className:"h-5 w-5 rotate-90 opacity-70 hover:opacity-100",children:[e.jsx("circle",{cx:"5",cy:"12",r:"2",stroke:"currentColor",strokeWidth:"1.5"}),e.jsx("circle",{opacity:"0.5",cx:"12",cy:"12",r:"2",stroke:"currentColor",strokeWidth:"1.5"}),e.jsx("circle",{cx:"19",cy:"12",r:"2",stroke:"currentColor",strokeWidth:"1.5"})]})}function qt(){return e.jsxs("svg",{width:"24",height:"24",viewBox:"0 0 24 24",fill:"none",className:"h-4 w-4 ltr:mr-3 rtl:ml-3",children:[e.jsx("path",{d:"M15.2869 3.15178L14.3601 4.07866L5.83882 12.5999C5.26166 13.1771 4.97308 13.4656 4.7249 13.7838C4.43213 14.1592 4.18114 14.5653 3.97634 14.995C3.80273 15.3593 3.67368 15.7465 3.41556 16.5208L2.32181 19.8021L2.05445 20.6042C1.92743 20.9852 2.0266 21.4053 2.31063 21.6894C2.59466 21.9734 3.01478 22.0726 3.39584 21.9456L4.19792 21.6782L7.47918 20.5844C8.25353 20.3263 8.6407 20.1973 9.00498 20.0237C9.43469 19.8189 9.84082 19.5679 10.2162 19.2751C10.5344 19.0269 10.8229 18.7383 11.4001 18.1612L19.9213 9.63993L20.8482 8.71306C22.3839 7.17735 22.3839 4.68748 20.8482 3.15178C19.3125 1.61607 16.8226 1.61607 15.2869 3.15178Z",stroke:"currentColor",strokeWidth:"1.5"}),e.jsx("path",{opacity:"0.5",d:"M14.36 4.07812C14.36 4.07812 14.4759 6.04774 16.2138 7.78564C17.9517 9.52354 19.9213 9.6394 19.9213 9.6394M4.19789 21.6777L2.32178 19.8015",stroke:"currentColor",strokeWidth:"1.5"})]})}function Kt(){return e.jsxs("svg",{width:"24",height:"24",viewBox:"0 0 24 24",fill:"none",className:"h-4.5 w-4.5 ltr:mr-3 rtl:ml-3",children:[e.jsx("path",{opacity:"0.5",d:"M3.27489 15.2957C2.42496 14.1915 2 13.6394 2 12C2 10.3606 2.42496 9.80853 3.27489 8.70433C4.97196 6.49956 7.81811 4 12 4C16.1819 4 19.028 6.49956 20.7251 8.70433C21.575 9.80853 22 10.3606 22 12C22 13.6394 21.575 14.1915 20.7251 15.2957C19.028 17.5004 16.1819 20 12 20C7.81811 20 4.97196 17.5004 3.27489 15.2957Z",stroke:"currentColor",strokeWidth:"1.5"}),e.jsx("path",{d:"M15 12C15 13.6569 13.6569 15 12 15C10.3431 15 9 13.6569 9 12C9 10.3431 10.3431 9 12 9C13.6569 9 15 10.3431 15 12Z",stroke:"currentColor",strokeWidth:"1.5"})]})}function Yt({filled:t}){return e.jsx("svg",{width:"24",height:"24",viewBox:"0 0 24 24",fill:"none",className:`h-4.5 w-4.5 group-hover:fill-warning ${t?"fill-warning":""}`,children:e.jsx("path",{d:"M9.15316 5.40838C10.4198 3.13613 11.0531 2 12 2C12.9469 2 13.5802 3.13612 14.8468 5.40837L15.1745 5.99623C15.5345 6.64193 15.7144 6.96479 15.9951 7.17781C16.2757 7.39083 16.6251 7.4699 17.3241 7.62805L17.9605 7.77203C20.4201 8.32856 21.65 8.60682 21.9426 9.54773C22.2352 10.4886 21.3968 11.4691 19.7199 13.4299L19.2861 13.9372C18.8096 14.4944 18.5713 14.773 18.4641 15.1177C18.357 15.4624 18.393 15.8341 18.465 16.5776L18.5306 17.2544C18.7841 19.8706 18.9109 21.1787 18.1449 21.7602C17.3788 22.3417 16.2273 21.8115 13.9243 20.7512L13.3285 20.4768C12.6741 20.1755 12.3469 20.0248 12 20.0248C11.6531 20.0248 11.3259 20.1755 10.6715 20.4768L10.0757 20.7512C7.77268 21.8115 6.62118 22.3417 5.85515 21.7602C5.08912 21.1787 5.21588 19.8706 5.4694 17.2544L5.53498 16.5776C5.60703 15.8341 5.64305 15.4624 5.53586 15.1177C5.42868 14.773 5.19043 14.4944 4.71392 13.9372L4.2801 13.4299C2.60325 11.4691 1.76482 10.4886 2.05742 9.54773C2.35002 8.60682 3.57986 8.32856 6.03954 7.77203L6.67589 7.62805C7.37485 7.4699 7.72433 7.39083 8.00494 7.17781C8.28555 6.96479 8.46553 6.64194 8.82547 5.99623L9.15316 5.40838Z",stroke:"currentColor",strokeWidth:"1.5"})})}function Zt(){return e.jsx("svg",{width:"24",height:"24",viewBox:"0 0 24 24",fill:"none",className:"h-3 w-3 rotate-45",children:e.jsx("path",{d:"M2 12C2 7.28595 2 4.92893 3.46447 3.46447C4.92893 2 7.28595 2 12 2C16.714 2 19.0711 2 20.5355 3.46447C22 4.92893 22 7.28595 22 12C22 16.714 22 19.0711 20.5355 20.5355C19.0711 22 16.714 22 12 22C7.28595 22 4.92893 22 3.46447 20.5355C2 19.0711 2 16.714 2 12Z",stroke:"currentColor",strokeWidth:"1.5"})})}function Xt({record:t,accountNumber:s,entitySlug:i}){var j;const[a,o]=r.useState(!1),x=r.useRef(null);r.useEffect(()=>{if(!a)return;const m=u=>{x.current&&!x.current.contains(u.target)&&o(!1)};return document.addEventListener("mousedown",m),()=>document.removeEventListener("mousedown",m)},[a]);const l=((j=t._id)==null?void 0:j.$oid)||t._id;return e.jsxs("div",{ref:x,className:"dropdown relative",children:[e.jsx("button",{type:"button",className:"text-primary",onClick:m=>{m.preventDefault(),m.stopPropagation(),o(!a)},children:e.jsx(Ut,{})}),a&&e.jsxs("ul",{className:"absolute z-50 min-w-[140px] rounded-md bg-white dark:bg-[#1b2e4b] shadow-lg border dark:border-gray-700 py-1 text-sm font-medium ltr:right-0 rtl:left-0 top-full mt-1",style:{animation:"fadeIn 0.15s ease-out"},children:[e.jsx("li",{children:e.jsxs("a",{href:`/account/${s}/record/${i}/${l}/overview`,className:"flex items-center px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 w-full",onClick:m=>m.stopPropagation(),children:[e.jsx(qt,{})," Edit"]})}),e.jsx("li",{children:e.jsxs("a",{href:`/account/${s}/record/${i}/${l}/overview`,className:"flex items-center px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 w-full",onClick:m=>m.stopPropagation(),children:[e.jsx(Kt,{})," View"]})})]})]})}function Gt({record:t,accountNumber:s,entitySlug:i,style:a,favorites:o,onToggleFav:x}){var $,L;const l=o[t._id]||!1,j=(($=t._id)==null?void 0:$.$oid)||t._id,m=t.referenceTitle||t.title||t.computedTitle||"Sans titre",u=t.createdAt?new Date(t.createdAt).toLocaleDateString("fr-FR",{day:"2-digit",month:"short",year:"numeric"}):"",h=(t.customFields||[]).find(C=>{var E,X,F,y,U,Y;return((X=(E=C.field_id)==null?void 0:E.label)==null?void 0:X.toLowerCase().includes("descri"))||((y=(F=C.field_id)==null?void 0:F.label)==null?void 0:y.toLowerCase().includes("note"))||((Y=(U=C.field_id)==null?void 0:U.label)==null?void 0:Y.toLowerCase().includes("contenu"))}),p=(h==null?void 0:h.value)||t.description||"";return(t.classificationValues||[]).filter(C=>C.optionLabel).map(C=>({label:C.optionLabel,color:C.optionColor||C.color||a.dot})),e.jsxs("div",{className:`panel pb-12 relative ${a.bg}`,children:[e.jsxs("div",{className:"min-h-[142px]",children:[e.jsxs("div",{className:"flex justify-between",children:[e.jsxs("div",{className:"flex w-max items-center",children:[e.jsx("div",{className:"flex-none",children:e.jsx("div",{className:"rounded-full bg-gray-300 p-2 dark:bg-gray-700",children:e.jsxs("svg",{width:"24",height:"24",viewBox:"0 0 24 24",fill:"none",className:"h-4.5 w-4.5",children:[e.jsx("circle",{cx:"12",cy:"6",r:"4",stroke:"currentColor",strokeWidth:"1.5"}),e.jsx("ellipse",{opacity:"0.5",cx:"12",cy:"17",rx:"7",ry:"4",stroke:"currentColor",strokeWidth:"1.5"})]})})}),e.jsxs("div",{className:"ltr:ml-2 rtl:mr-2",children:[e.jsx("div",{className:"font-semibold",children:((L=t.createdBy)==null?void 0:L.name)||"Utilisateur"}),e.jsx("div",{className:"text-sx text-white-dark",children:u})]})]}),e.jsx(Xt,{record:t,accountNumber:s,entitySlug:i})]}),e.jsxs("div",{children:[e.jsx("h4",{className:"mt-4 font-semibold",children:e.jsx("a",{href:`/account/${s}/record/${i}/${j}/overview`,className:"hover:text-primary transition-colors",children:m})}),p&&e.jsx("p",{className:"mt-2 text-white-dark line-clamp-3",children:p})]})]}),e.jsx("div",{className:"absolute bottom-5 left-0 w-full px-5",children:e.jsxs("div",{className:"mt-2 flex items-center justify-between",children:[e.jsx("div",{className:a.text,children:e.jsx(Zt,{})}),e.jsx("div",{className:"flex items-center gap-2",children:e.jsx("button",{type:"button",className:"group text-warning ltr:ml-2 rtl:mr-2",onClick:C=>{C.preventDefault(),C.stopPropagation(),x(t._id)},children:e.jsx(Yt,{filled:l})})})]})})]})}function Qt({records:t,accountNumber:s,entitySlug:i}){const[a,o]=r.useState({}),x=r.useCallback(l=>{o(j=>({...j,[l]:!j[l]}))},[]);return e.jsx("div",{className:"h-full overflow-y-auto",children:e.jsx("div",{className:"grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",children:t.length===0?e.jsx("div",{className:"col-span-full text-center py-20 text-gray-400 dark:text-gray-600 italic",children:"Aucun enregistrement"}):t.map((l,j)=>{var m;return e.jsx(Gt,{record:l,accountNumber:s,entitySlug:i,style:Jt(j),favorites:a,onToggleFav:x},((m=l._id)==null?void 0:m.$oid)||l._id)})})})}const Ue={Planifié:{className:"primary",bg:"#4361ee",text:"#fff"},Confirmé:{className:"info",bg:"#2196f3",text:"#fff"},Terminé:{className:"success",bg:"#00ab55",text:"#fff"},Annulé:{className:"danger",bg:"#e7515a",text:"#fff"},"Non présenté":{className:"warning",bg:"#e2a03f",text:"#fff"}},Re=[{className:"primary",bg:"#4361ee",text:"#fff"},{className:"info",bg:"#2196f3",text:"#fff"},{className:"success",bg:"#00ab55",text:"#fff"},{className:"danger",bg:"#e7515a",text:"#fff"},{className:"warning",bg:"#e2a03f",text:"#fff"}];function er(t,s){if(s){const i=(t.customFields||[]).find(a=>{var x,l,j;return(((l=(x=a.field_id)==null?void 0:x._id)==null?void 0:l.toString())||((j=a.field_id)==null?void 0:j.toString()))===s});if(i!=null&&i.value){const a=new Date(i.value);if(!isNaN(a))return a}}if(t.date){const i=new Date(t.date);if(!isNaN(i))return i}if(t.createdAt){const i=new Date(t.createdAt);if(!isNaN(i))return i}return null}function tr(t,s){if(!s)return 30;const i=(t.customFields||[]).find(a=>{var x,l,j;return(((l=(x=a.field_id)==null?void 0:x._id)==null?void 0:l.toString())||((j=a.field_id)==null?void 0:j.toString()))===s});return parseInt(i==null?void 0:i.value)||30}function rr(t){const s=t.classificationValues||[];for(const i of s)if(i.label||i.optionLabel)return i.label||i.optionLabel;return null}function sr(t){const s=["Dimanche","Lundi","Mardi","Mercredi","Jeudi","Vendredi","Samedi"],i=["janvier","février","mars","avril","mai","juin","juillet","août","septembre","octobre","novembre","décembre"];return`${s[t.getDay()]} ${t.getDate()} ${i[t.getMonth()]} ${t.getFullYear()}`}function ar(t){const s=t.getFullYear(),i=String(t.getMonth()+1).padStart(2,"0"),a=String(t.getDate()).padStart(2,"0"),o=String(t.getHours()).padStart(2,"0"),x=String(t.getMinutes()).padStart(2,"0");return`${s}-${i}-${a}T${o}:${x}`}function ir({message:t,type:s="success",onClose:i}){r.useEffect(()=>{const x=setTimeout(i,3e3);return()=>clearTimeout(x)},[i]);const a={success:{bg:"#00ab55",icon:"✓"},error:{bg:"#e7515a",icon:"✕"},info:{bg:"#4361ee",icon:"ℹ"}},o=a[s]||a.info;return e.jsxs("div",{style:{position:"fixed",bottom:24,right:24,zIndex:1e4,display:"flex",alignItems:"center",gap:10,padding:"12px 20px",borderRadius:12,backgroundColor:o.bg,color:"#fff",boxShadow:"0 8px 32px rgba(0,0,0,0.18)",animation:"slideInRight 0.3s ease",fontSize:13,fontWeight:600},children:[e.jsx("span",{style:{fontSize:16},children:o.icon}),t]})}function nr({isOpen:t,onClose:s,onSave:i,initialDate:a,entityData:o,accountNumber:x}){const[l,j]=r.useState(""),[m,u]=r.useState(""),[h,p]=r.useState("30"),[$,L]=r.useState(!1),C=r.useRef(null);if(r.useEffect(()=>{t&&a&&(u(ar(a)),j(""),p("30"),setTimeout(()=>{var F;return(F=C.current)==null?void 0:F.focus()},100))},[t,a]),!t)return null;const E=async F=>{if(F.preventDefault(),!!l.trim()){L(!0);try{await i({title:l.trim(),date:m,duration:parseInt(h)}),s()}catch(y){console.error(y)}L(!1)}},X=[15,30,45,60,90,120];return e.jsx("div",{style:{position:"fixed",inset:0,zIndex:9999,backgroundColor:"rgba(0,0,0,0.4)",backdropFilter:"blur(4px)",display:"flex",alignItems:"center",justifyContent:"center",animation:"fadeIn 0.2s ease"},onClick:F=>{F.target===F.currentTarget&&s()},children:e.jsxs("div",{style:{backgroundColor:"#fff",borderRadius:16,width:"100%",maxWidth:440,boxShadow:"0 24px 80px rgba(0,0,0,0.2)",animation:"slideUp 0.3s ease",overflow:"hidden"},children:[e.jsxs("div",{style:{padding:"20px 24px 16px",display:"flex",alignItems:"center",justifyContent:"space-between",borderBottom:"1px solid #f0f0f0"},children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:10},children:[e.jsx("div",{style:{width:36,height:36,borderRadius:10,background:"linear-gradient(135deg, #4361ee, #805cf6)",display:"flex",alignItems:"center",justifyContent:"center"},children:e.jsx("svg",{viewBox:"0 0 24 24",fill:"none",style:{width:18,height:18,color:"#fff"},children:e.jsx("path",{d:"M12 5V19M5 12H19",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round"})})}),e.jsxs("div",{children:[e.jsx("h3",{style:{margin:0,fontSize:16,fontWeight:700,color:"#1a1a2e"},children:"Nouveau rendez-vous"}),e.jsx("p",{style:{margin:0,fontSize:11,color:"#888",marginTop:2},children:a?sr(a):""})]})]}),e.jsx("button",{onClick:s,style:{border:"none",background:"#f5f5f5",borderRadius:8,width:32,height:32,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer"},children:e.jsx("svg",{viewBox:"0 0 24 24",fill:"none",style:{width:16,height:16,color:"#666"},children:e.jsx("path",{d:"M18 6L6 18M6 6L18 18",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round"})})})]}),e.jsxs("form",{onSubmit:E,style:{padding:"20px 24px 24px"},children:[e.jsxs("div",{style:{marginBottom:16},children:[e.jsx("label",{style:{display:"block",fontSize:12,fontWeight:600,color:"#555",marginBottom:6},children:"Titre *"}),e.jsx("input",{ref:C,type:"text",value:l,onChange:F=>j(F.target.value),placeholder:"Ex: Consultation Dr. Martin",required:!0,style:{width:"100%",padding:"10px 14px",border:"1.5px solid #e0e0e0",borderRadius:10,fontSize:14,outline:"none",transition:"border 0.2s",boxSizing:"border-box"},onFocus:F=>F.target.style.borderColor="#4361ee",onBlur:F=>F.target.style.borderColor="#e0e0e0"})]}),e.jsxs("div",{style:{marginBottom:16},children:[e.jsx("label",{style:{display:"block",fontSize:12,fontWeight:600,color:"#555",marginBottom:6},children:"Date et heure"}),e.jsx("input",{type:"datetime-local",value:m,onChange:F=>u(F.target.value),style:{width:"100%",padding:"10px 14px",border:"1.5px solid #e0e0e0",borderRadius:10,fontSize:14,outline:"none",transition:"border 0.2s",boxSizing:"border-box"},onFocus:F=>F.target.style.borderColor="#4361ee",onBlur:F=>F.target.style.borderColor="#e0e0e0"})]}),e.jsxs("div",{style:{marginBottom:20},children:[e.jsx("label",{style:{display:"block",fontSize:12,fontWeight:600,color:"#555",marginBottom:8},children:"Durée"}),e.jsx("div",{style:{display:"flex",flexWrap:"wrap",gap:6},children:X.map(F=>e.jsx("button",{type:"button",onClick:()=>p(String(F)),style:{padding:"6px 14px",borderRadius:20,fontSize:12,fontWeight:600,border:h===String(F)?"1.5px solid #4361ee":"1.5px solid #e0e0e0",backgroundColor:h===String(F)?"#4361ee":"#fff",color:h===String(F)?"#fff":"#555",cursor:"pointer",transition:"all 0.2s"},children:F<60?`${F} min`:`${F/60}h`},F))})]}),e.jsxs("div",{style:{display:"flex",gap:10,justifyContent:"flex-end"},children:[e.jsx("button",{type:"button",onClick:s,style:{padding:"10px 20px",borderRadius:10,fontSize:13,fontWeight:600,border:"1.5px solid #e0e0e0",backgroundColor:"#fff",color:"#555",cursor:"pointer",transition:"all 0.2s"},children:"Annuler"}),e.jsx("button",{type:"submit",disabled:$||!l.trim(),style:{padding:"10px 24px",borderRadius:10,fontSize:13,fontWeight:600,border:"none",background:l.trim()?"linear-gradient(135deg, #4361ee, #805cf6)":"#ccc",color:"#fff",cursor:l.trim()?"pointer":"not-allowed",transition:"all 0.2s",opacity:$?.7:1},children:$?"Création...":"Créer le RDV"})]})]})]})})}function or({event:t,position:s,onClose:i,onEdit:a,onDelete:o,accountNumber:x,entitySlug:l,cardTemplate:j}){var E,X;const m=r.useRef(null);if(r.useEffect(()=>{const F=y=>{m.current&&!m.current.contains(y.target)&&i()};return document.addEventListener("mousedown",F),()=>document.removeEventListener("mousedown",F)},[i]),!t)return null;const u=t.start?new Date(t.start):null,h=t.end?new Date(t.end):null,p=(E=t.extendedProps)==null?void 0:E.status,$=p?Ue[p]:null,C={_id:((X=t.extendedProps)==null?void 0:X.recordId)||t.id,referenceTitle:t.title,_start:u,_end:h,classificationValues:p?[{optionLabel:p,optionColor:$?$.bg:"#4361ee"}]:[],createdAt:u,...t.extendedProps};return e.jsx("div",{ref:m,style:{position:"fixed",top:Math.min(s.y,window.innerHeight-280),left:Math.min(s.x,window.innerWidth-340),zIndex:9998,width:320,backgroundColor:"#fff",borderRadius:14,boxShadow:"0 16px 64px rgba(0,0,0,0.18)",animation:"slideUp 0.2s ease",overflow:"hidden"},children:e.jsx(st,{record:C,cardTemplate:j,context:"calendar",accountNumber:x,entitySlug:l,callbacks:{onClose:i},style:{borderRadius:0}})})}function lr({records:t=[],columns:s=[],accountNumber:i,entitySlug:a,entityData:o}){var P,V,de,Q;const x=r.useRef(null),l=r.useRef(null),[j,m]=r.useState(!1),[u,h]=r.useState(!1),[p,$]=r.useState(null),[L,C]=r.useState(null),[E,X]=r.useState({x:0,y:0}),[F,y]=r.useState(null),[U,Y]=r.useState(t),[J,te]=r.useState(!1),[d,k]=r.useState({weekStartsOn:1,startHour:"07:00",endHour:"20:00",hideWeekend:!1,slotDuration:"00:15:00",slotLabelInterval:"01:00",compactMode:!1});r.useEffect(()=>{var M;if(!(o!=null&&o._id))return;const f=((M=o._id)==null?void 0:M.$oid)||o._id;fetch(`/account/${i}/api/user/view-preferences?viewId=calendar_${f}`,{credentials:"include"}).then(n=>n.json()).then(n=>{var R;n.success&&((R=n.preferences)!=null&&R.calendarSettings)&&k(W=>({...W,...n.preferences.calendarSettings}))}).catch(()=>{})},[o==null?void 0:o._id,i]);const re=r.useCallback(async f=>{var n;k(f),te(!1);const M=((n=o==null?void 0:o._id)==null?void 0:n.$oid)||(o==null?void 0:o._id);if(M)try{await fetch(`/account/${i}/api/user/view-preferences`,{method:"POST",headers:{"Content-Type":"application/json"},credentials:"include",body:JSON.stringify({viewId:`calendar_${M}`,preferences:{calendarSettings:f}})}),y({message:"Paramètres sauvegardés",type:"success"})}catch{y({message:"Erreur sauvegarde paramètres",type:"error"})}},[i,o]);r.useEffect(()=>{Y(t)},[t]);const[T,A]=r.useState(null);r.useEffect(()=>{var M;if(!(o!=null&&o._id))return;const f=((M=o._id)==null?void 0:M.$oid)||o._id;fetch(`/account/${i}/api/entity/${f}/cards/default/calendar`,{credentials:"include"}).then(n=>n.json()).then(n=>{n.success&&n.card&&A(n.card)}).catch(()=>{})},[o==null?void 0:o._id,i]);const{dateFieldId:I,durationFieldId:G}=r.useMemo(()=>{var ee,ne,q,g,w;if(!o)return{dateFieldId:null,durationFieldId:null};const f=o.customFields||[],M=f.filter(K=>K.type==="date"||K.inputType==="date"||K.inputType==="datetime-local"),n=M.find(K=>/^date/i.test(K.name||"")||/date/i.test(K.label||"")),R=((ee=n==null?void 0:n._id)==null?void 0:ee.toString())||((q=(ne=M[0])==null?void 0:ne._id)==null?void 0:q.toString())||null,se=((w=(g=f.filter(K=>K.type==="number"&&(/dur/i.test(K.name||"")||/dur/i.test(K.label||"")))[0])==null?void 0:g._id)==null?void 0:w.toString())||null;return{dateFieldId:R,durationFieldId:se}},[o]),Z=(P=o==null?void 0:o._id)==null?void 0:P.toString(),O=(de=(V=o==null?void 0:o.statusClassification)==null?void 0:V._id)==null?void 0:de.toString(),oe=((Q=o==null?void 0:o.statusClassification)==null?void 0:Q.options)||[],le=oe.find(f=>/planif/i.test(f.label))||oe[0],xe=r.useMemo(()=>U.map((f,M)=>{const n=er(f,I);if(!n)return null;const R=tr(f,G),W=new Date(n.getTime()+R*6e4),se=f.referenceTitle||f.computedTitle||f.title||"Sans titre",ee=rr(f),ne=ee&&Ue[ee]||Re[M%Re.length];return{id:f._id,title:se,start:n.toISOString(),end:W.toISOString(),className:ne.className,extendedProps:{recordId:f._id,status:ee,entitySlug:a,accountNumber:i,dateFieldId:I,durationFieldId:G}}}).filter(Boolean),[U,I,G,a,i]),v=r.useCallback(f=>{f.jsEvent.preventDefault(),f.jsEvent.stopPropagation();const M=f.el.getBoundingClientRect();X({x:M.right+8,y:M.top}),C(f.event)},[]),B=r.useCallback(f=>{C(null);const M=f.start;$(M),h(!0),l.current&&l.current.unselect()},[]),H=r.useCallback(async f=>{var ee,ne,q;const M=((ee=f.event.extendedProps)==null?void 0:ee.recordId)||f.event.id,n=f.event.start.toISOString(),R=(ne=f.event.end)==null?void 0:ne.toISOString(),W=(q=f.event.extendedProps)==null?void 0:q.dateFieldId;let se;f.event.start&&f.event.end&&(se=Math.round((f.event.end-f.event.start)/6e4));try{if(!(await fetch(`/account/${i}/api/records/${M}/date`,{method:"PATCH",headers:{"Content-Type":"application/json"},credentials:"include",body:JSON.stringify({dateFieldId:W,newStart:n,newEnd:R,duration:se})})).ok)throw new Error("Failed");y({message:"RDV déplacé avec succès",type:"success"})}catch{f.revert(),y({message:"Erreur lors du déplacement",type:"error"})}},[i]),b=r.useCallback(async f=>{var se,ee;const M=((se=f.event.extendedProps)==null?void 0:se.recordId)||f.event.id,n=f.event.start.toISOString(),R=(ee=f.event.extendedProps)==null?void 0:ee.dateFieldId;let W;f.event.start&&f.event.end&&(W=Math.round((f.event.end-f.event.start)/6e4));try{if(!(await fetch(`/account/${i}/api/records/${M}/date`,{method:"PATCH",headers:{"Content-Type":"application/json"},credentials:"include",body:JSON.stringify({dateFieldId:R,newStart:n,duration:W})})).ok)throw new Error("Failed");y({message:`Durée modifiée (${W} min)`,type:"success"})}catch{f.revert(),y({message:"Erreur lors du redimensionnement",type:"error"})}},[i]),N=r.useCallback(async({title:f,date:M,duration:n})=>{var se;if(!Z||!I)return;const R=await fetch(`/account/${i}/api/entity/${Z}/records/quick-add`,{method:"POST",headers:{"Content-Type":"application/json"},credentials:"include",body:JSON.stringify({title:f,dateFieldId:I,dateValue:new Date(M).toISOString(),duration:n,durationFieldId:G,statusOptionId:(se=le==null?void 0:le._id)==null?void 0:se.toString(),statusClassificationId:O})});if(!R.ok)throw new Error("Failed to create");const W=await R.json();W.record&&Y(ee=>[...ee,W.record]),y({message:`"${f}" créé avec succès !`,type:"success"})},[i,Z,I,G,le,O]);return r.useEffect(()=>{if(typeof FullCalendar<"u"){m(!0);return}const f=setInterval(()=>{typeof FullCalendar<"u"&&(m(!0),clearInterval(f))},200);if(!document.querySelector('script[src*="fullcalendar"]')){const M=document.createElement("link");M.rel="stylesheet",M.href="/assets/css/fullcalendar.min.css",document.head.appendChild(M);const n=document.createElement("script");n.src="/assets/js/fullcalendar.min.js",n.onload=()=>m(!0),document.head.appendChild(n)}return()=>clearInterval(f)},[]),r.useEffect(()=>{if(!j||!x.current||typeof FullCalendar>"u")return;l.current&&l.current.destroy();const f=d.hideWeekend?[0,6]:[],M=new FullCalendar.Calendar(x.current,{initialView:"timeGridWeek",headerToolbar:{left:"prev,next today",center:"title",right:"dayGridMonth,timeGridWeek,timeGridDay"},locale:"fr",buttonText:{today:"Aujourd'hui",month:"Mois",week:"Semaine",day:"Jour"},editable:!0,selectable:!0,selectMirror:!0,dayMaxEvents:3,height:"auto",firstDay:d.weekStartsOn,hiddenDays:f,slotDuration:d.slotDuration,snapDuration:d.slotDuration,slotLabelInterval:d.slotLabelInterval,slotLabelFormat:{hour:"2-digit",minute:"2-digit",hour12:!1},slotMinTime:d.startHour+":00",slotMaxTime:d.endHour+":00",businessHours:{daysOfWeek:d.hideWeekend?[1,2,3,4,5]:[0,1,2,3,4,5,6],startTime:d.startHour,endTime:d.endHour},scrollTime:d.startHour+":00",nowIndicator:!0,events:xe,eventClick:v,select:B,eventDrop:H,eventResize:b,eventContent:n=>{const R=n.event.start,W=n.event.end,se=R?`${String(R.getHours()).padStart(2,"0")}:${String(R.getMinutes()).padStart(2,"0")}`:"",ee=W?`${String(W.getHours()).padStart(2,"0")}:${String(W.getMinutes()).padStart(2,"0")}`:"";return{html:`<div style="line-height:1.2;padding:2px 4px;overflow:hidden;"><div style="font-weight:700;font-size:11px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin:0;">${n.event.title}</div><div style="font-size:10px;opacity:0.85;margin:0;font-weight:500;">De ${se} à ${ee}</div></div>`}},eventDidMount:n=>{var W;n.el.style.cursor="pointer",n.el.style.borderRadius="6px",n.el.style.border="none",n.el.style.overflow="hidden";const R=(W=n.event.extendedProps)==null?void 0:W.status;n.el.title=n.event.title+(R?` — ${R}`:"")},dayHeaderFormat:{weekday:"short",day:"numeric",month:"short"},allDaySlot:!1});return M.render(),l.current=M,()=>{l.current&&(l.current.destroy(),l.current=null)}},[j,xe,v,B,H,b,d]),j?!I&&t.length>0?e.jsxs("div",{style:{display:"flex",alignItems:"center",justifyContent:"center",padding:"48px 0",flexDirection:"column"},children:[e.jsxs("svg",{viewBox:"0 0 24 24",fill:"none",style:{width:48,height:48,marginBottom:12,color:"#ccc"},children:[e.jsx("rect",{x:"3",y:"4",width:"18",height:"18",rx:"2",stroke:"currentColor",strokeWidth:"1.5"}),e.jsx("path",{d:"M16 2V6M8 2V6M3 10H21",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"})]}),e.jsx("p",{style:{fontSize:14,fontWeight:500,color:"#888"},children:"Aucun champ date trouvé"}),e.jsx("p",{style:{fontSize:12,color:"#aaa",marginTop:4},children:"Ajoutez un champ date à cette entité"})]}):e.jsxs("div",{style:{position:"relative"},children:[e.jsx("style",{children:`
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes slideUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
                @keyframes slideInRight { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: translateX(0); } }
                .fc .fc-timegrid-slot { height: ${d.compactMode?"20px":"40px"} !important; }
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
            `}),e.jsxs("div",{style:{marginBottom:12,display:"flex",flexWrap:"wrap",gap:12,alignItems:"center",justifyContent:"space-between",padding:"8px 0"},children:[e.jsx("div",{style:{display:"flex",flexWrap:"wrap",gap:10},children:Object.entries(Ue).map(([f,M])=>e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:5,fontSize:11,color:"#666"},children:[e.jsx("div",{style:{width:8,height:8,borderRadius:2,backgroundColor:M.bg}}),f]},f))}),e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:12},children:[e.jsx("span",{style:{fontSize:11,color:"#aaa",fontStyle:"italic"},children:"Cliquer pour ajouter • Glisser pour déplacer"}),e.jsxs("button",{onClick:()=>te(!0),style:{display:"flex",alignItems:"center",gap:6,padding:"6px 14px",border:"1px solid #e2e8f0",borderRadius:8,background:"#fff",cursor:"pointer",fontSize:12,fontWeight:600,color:"#475569",transition:"all 0.2s"},onMouseEnter:f=>{f.currentTarget.style.borderColor="#4361ee",f.currentTarget.style.color="#4361ee"},onMouseLeave:f=>{f.currentTarget.style.borderColor="#e2e8f0",f.currentTarget.style.color="#475569"},children:[e.jsx("iconify-icon",{icon:"solar:settings-linear",width:"15"}),"Config"]})]})]}),e.jsx("div",{className:"calendar-wrapper",ref:x}),J&&e.jsx(dr,{settings:d,onSave:re,onClose:()=>te(!1)}),e.jsx(nr,{isOpen:u,onClose:()=>h(!1),onSave:N,initialDate:p,entityData:o,accountNumber:i}),L&&e.jsx(or,{event:L,position:E,onClose:()=>C(null),accountNumber:i,entitySlug:a,cardTemplate:T}),F&&e.jsx(ir,{message:F.message,type:F.type,onClose:()=>y(null)})]}):e.jsxs("div",{style:{display:"flex",alignItems:"center",justifyContent:"center",padding:"48px 0"},children:[e.jsx("div",{className:"animate-spin rounded-full h-8 w-8 border-b-2 border-primary"}),e.jsx("span",{style:{marginLeft:12,color:"#888"},children:"Chargement du calendrier..."})]})}function dr({settings:t,onSave:s,onClose:i}){const[a,o]=r.useState({...t}),x=[];for(let l=0;l<24;l++){const j=`${String(l).padStart(2,"0")}:00`;x.push(j)}return e.jsxs(e.Fragment,{children:[e.jsx("div",{className:"cal-settings-overlay",onClick:i}),e.jsxs("div",{className:"cal-settings-panel",children:[e.jsxs("div",{className:"header",children:[e.jsxs("h3",{children:[e.jsx("iconify-icon",{icon:"solar:settings-bold-duotone",width:"20",style:{verticalAlign:"middle",marginRight:8,color:"#4361ee"}}),"Paramètres du calendrier"]}),e.jsx("button",{onClick:i,style:{background:"none",border:"none",cursor:"pointer",padding:4,borderRadius:6,color:"#94a3b8"},children:e.jsx("iconify-icon",{icon:"solar:close-circle-linear",width:"22"})})]}),e.jsxs("div",{className:"body",children:[e.jsxs("div",{className:"cal-field",children:[e.jsx("label",{children:"Premier jour de la semaine"}),e.jsxs("select",{value:a.weekStartsOn,onChange:l=>o({...a,weekStartsOn:parseInt(l.target.value)}),children:[e.jsx("option",{value:1,children:"Lundi"}),e.jsx("option",{value:0,children:"Dimanche"}),e.jsx("option",{value:6,children:"Samedi"})]})]}),e.jsxs("div",{style:{display:"flex",gap:12},children:[e.jsxs("div",{className:"cal-field",style:{flex:1},children:[e.jsx("label",{children:"Heure de début"}),e.jsx("select",{value:a.startHour,onChange:l=>o({...a,startHour:l.target.value}),children:x.map(l=>e.jsx("option",{value:l,children:l},l))})]}),e.jsxs("div",{className:"cal-field",style:{flex:1},children:[e.jsx("label",{children:"Heure de fin"}),e.jsx("select",{value:a.endHour,onChange:l=>o({...a,endHour:l.target.value}),children:x.map(l=>e.jsx("option",{value:l,children:l},l))})]})]}),e.jsxs("div",{className:"cal-field",children:[e.jsx("label",{children:"Intervalle des créneaux"}),e.jsxs("select",{value:a.slotDuration,onChange:l=>o({...a,slotDuration:l.target.value}),children:[e.jsx("option",{value:"00:05:00",children:"5 minutes"}),e.jsx("option",{value:"00:10:00",children:"10 minutes"}),e.jsx("option",{value:"00:15:00",children:"15 minutes"}),e.jsx("option",{value:"00:30:00",children:"30 minutes"}),e.jsx("option",{value:"01:00:00",children:"1 heure"})]})]}),e.jsxs("div",{className:"cal-field",children:[e.jsx("label",{children:"Affichage des heures"}),e.jsxs("select",{value:a.slotLabelInterval,onChange:l=>o({...a,slotLabelInterval:l.target.value}),children:[e.jsx("option",{value:"00:30:00",children:"Toutes les 30 min"}),e.jsx("option",{value:"01:00:00",children:"Toutes les heures"}),e.jsx("option",{value:"02:00:00",children:"Toutes les 2 heures"})]})]}),e.jsx("div",{style:{height:1,background:"#f1f5f9",margin:"8px 0 20px"}}),e.jsxs("div",{className:"cal-toggle",children:[e.jsxs("div",{children:[e.jsx("div",{className:"cal-toggle-label",children:"Mode compact"}),e.jsx("div",{className:"cal-toggle-desc",children:"Réduit l'espacement des créneaux pour une vue d'ensemble"})]}),e.jsxs("label",{className:"cal-switch",children:[e.jsx("input",{type:"checkbox",checked:a.compactMode,onChange:l=>o({...a,compactMode:l.target.checked})}),e.jsx("span",{className:"slider"})]})]}),e.jsxs("div",{className:"cal-toggle",children:[e.jsxs("div",{children:[e.jsx("div",{className:"cal-toggle-label",children:"Masquer le weekend"}),e.jsx("div",{className:"cal-toggle-desc",children:"Afficher uniquement du lundi au vendredi"})]}),e.jsxs("label",{className:"cal-switch",children:[e.jsx("input",{type:"checkbox",checked:a.hideWeekend,onChange:l=>o({...a,hideWeekend:l.target.checked})}),e.jsx("span",{className:"slider"})]})]})]}),e.jsxs("div",{className:"footer",children:[e.jsx("button",{className:"cal-btn cal-btn-ghost",onClick:i,children:"Annuler"}),e.jsxs("button",{className:"cal-btn cal-btn-primary",onClick:()=>s(a),children:[e.jsx("iconify-icon",{icon:"solar:check-circle-bold",width:"16",style:{verticalAlign:"middle",marginRight:4}}),"Appliquer"]})]})]})]})}const it={contains:{label:"Contient",icon:"⊃",types:["text","email","phone","url","textarea","title","relation"]},not_contains:{label:"Ne contient pas",icon:"⊅",types:["text","email","phone","url","textarea","title","relation"]},equals:{label:"Est égal à",icon:"=",types:["text","email","phone","url","number","date","title","select","relation","classification"]},not_equals:{label:"N'est pas égal à",icon:"≠",types:["text","email","phone","url","number","date","title","select","relation","classification"]},starts_with:{label:"Commence par",icon:"A…",types:["text","email","phone","url","title"]},ends_with:{label:"Se termine par",icon:"…Z",types:["text","email","phone","url","title"]},gt:{label:"Supérieur à",icon:">",types:["number","date"]},gte:{label:"Supérieur ou égal",icon:"≥",types:["number","date"]},lt:{label:"Inférieur à",icon:"<",types:["number","date"]},lte:{label:"Inférieur ou égal",icon:"≤",types:["number","date"]},between:{label:"Entre",icon:"↔",types:["number","date"]},is_empty:{label:"Est vide",icon:"∅",types:["text","email","phone","url","number","date","textarea","title","select","relation","classification"]},is_not_empty:{label:"N'est pas vide",icon:"∃",types:["text","email","phone","url","number","date","textarea","title","select","relation","classification"]}};function Be(t){const s=t||"text";return Object.entries(it).filter(([i,a])=>a.types.includes(s)).map(([i,a])=>({key:i,...a}))}function Xe(t){return["number","currency","percent"].includes(t)?"number":["date","datetime"].includes(t)?"date":"text"}function cr({columns:t=[],fieldFilters:s=[],onFieldFiltersChange:i,allRecords:a=[],sidebarFilters:o=[]}){const[x,l]=r.useState(s.length>0),[j,m]=r.useState(null),[u,h]=r.useState(!1),p=r.useRef(null);r.useEffect(()=>{const d=k=>{u&&p.current&&!p.current.contains(k.target)&&h(!1)};return u&&document.addEventListener("mousedown",d),()=>document.removeEventListener("mousedown",d)},[u]);const $=Fe.useMemo(()=>{const d={};return o.forEach(k=>{d[`classif:${k.id}`]=k.options||[]}),d},[o]),L=t.filter(d=>d.id!=="actions"),C=r.useCallback(d=>{const k=L.find(G=>G.id===d);if(!k)return;const re=d.startsWith("classif:"),T=Be(k.type),A=re?T.find(G=>G.key==="equals")||T[0]:T.find(G=>G.key==="contains")||T[0],I={fieldId:d,fieldName:k.name,fieldType:k.type||"text",operator:A.key,value:"",value2:"",logic:"AND"};i([...s,I]),h(!1),m(s.length)},[L,s,i]),E=r.useCallback((d,k)=>{const re=s.map((T,A)=>A===d?{...T,...k}:T);i(re)},[s,i]),X=r.useCallback(d=>{const k=s.filter((re,T)=>T!==d);i(k),j===d&&m(null)},[s,i,j]),F=r.useCallback(()=>{i([]),m(null)},[i]),y=d=>["is_empty","is_not_empty"].includes(d),U=d=>d==="between",Y=d=>d&&d.startsWith("classif:"),J=d=>$[d]||[],te=(d,k)=>{const T=J(d).find(A=>A.id===k||A.label===k);return T?T.label:k};return e.jsxs("div",{className:"adv-filters-container",children:[e.jsxs("button",{type:"button",className:"adv-filters-header",onClick:()=>l(!x),children:[e.jsxs("div",{className:"adv-filters-header-left",children:[e.jsx("svg",{viewBox:"0 0 24 24",fill:"none",className:"adv-filters-header-icon",children:e.jsx("path",{d:"M22 3H2L10 12.46V19L14 21V12.46L22 3Z",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round"})}),e.jsx("span",{children:"Filtres avancés"}),s.length>0&&e.jsx("span",{className:"adv-filters-count",children:s.length})]}),e.jsx("svg",{viewBox:"0 0 24 24",fill:"none",className:`adv-filters-chevron ${x?"adv-filters-chevron--open":""}`,children:e.jsx("path",{d:"M9 18L15 12L9 6",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round"})})]}),x&&e.jsxs("div",{className:"adv-filters-body",children:[s.map((d,k)=>{var Z;L.find(O=>O.id===d.fieldId);const re=Be(d.fieldType),T=j===k,A=Y(d.fieldId),I=A?J(d.fieldId):[],G=d.logic||"AND";return e.jsxs(Fe.Fragment,{children:[k>0&&e.jsxs("div",{className:"adv-filter-connector",children:[e.jsx("span",{className:"adv-filter-connector-line"}),e.jsx("button",{type:"button",className:`adv-filter-connector-badge ${G==="OR"?"adv-filter-connector-badge--or":""}`,onClick:()=>{E(k,{logic:G==="AND"?"OR":"AND"})},title:"Cliquez pour basculer entre ET/OU",children:G==="OR"?"OU":"ET"}),e.jsx("span",{className:"adv-filter-connector-line"})]}),e.jsx("div",{className:`adv-filter-pill ${T?"adv-filter-pill--editing":""}`,children:T?e.jsxs("div",{className:"adv-filter-edit",children:[e.jsxs("div",{className:"adv-filter-row",children:[e.jsx("label",{className:"adv-filter-label",children:"Champ"}),e.jsx("select",{value:d.fieldId,onChange:O=>{const oe=L.find(le=>le.id===O.target.value);if(oe){const le=Be(oe.type),v=O.target.value.startsWith("classif:")?le.find(B=>B.key==="equals")||le[0]:le.find(B=>B.key===d.operator)||le[0];E(k,{fieldId:oe.id,fieldName:oe.name,fieldType:oe.type||"text",operator:v.key,value:"",value2:""})}},className:"adv-filter-select",children:L.map(O=>e.jsx("option",{value:O.id,children:O.name},O.id))})]}),e.jsxs("div",{className:"adv-filter-row",children:[e.jsx("label",{className:"adv-filter-label",children:"Condition"}),e.jsx("select",{value:d.operator,onChange:O=>E(k,{operator:O.target.value,value:y(O.target.value)?"":d.value,value2:""}),className:"adv-filter-select",children:re.map(O=>e.jsx("option",{value:O.key,children:O.label},O.key))})]}),!y(d.operator)&&e.jsxs("div",{className:"adv-filter-row",children:[e.jsx("label",{className:"adv-filter-label",children:U(d.operator)?"Valeur min":"Valeur"}),A&&I.length>0?e.jsxs("select",{value:d.value,onChange:O=>E(k,{value:O.target.value}),className:"adv-filter-select",children:[e.jsx("option",{value:"",children:"Sélectionnez..."}),I.map(O=>e.jsx("option",{value:O.label,children:O.label},O.id))]}):e.jsx("input",{type:Xe(d.fieldType),value:d.value,onChange:O=>E(k,{value:O.target.value}),placeholder:"Saisir une valeur...",className:"adv-filter-input",autoFocus:!0})]}),U(d.operator)&&e.jsxs("div",{className:"adv-filter-row",children:[e.jsx("label",{className:"adv-filter-label",children:"Valeur max"}),e.jsx("input",{type:Xe(d.fieldType),value:d.value2||"",onChange:O=>E(k,{value2:O.target.value}),placeholder:"Saisir une valeur max...",className:"adv-filter-input"})]}),e.jsxs("div",{className:"adv-filter-row adv-filter-row--actions",children:[e.jsxs("button",{type:"button",className:"adv-filter-btn-done",onClick:()=>m(null),children:[e.jsx("svg",{viewBox:"0 0 24 24",fill:"none",className:"h-3.5 w-3.5",children:e.jsx("path",{d:"M5 13L9 17L19 7",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round"})}),"OK"]}),e.jsx("button",{type:"button",className:"adv-filter-btn-delete",onClick:()=>X(k),children:e.jsxs("svg",{viewBox:"0 0 24 24",fill:"none",className:"h-3.5 w-3.5",children:[e.jsx("path",{d:"M20.5001 6H3.5",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"}),e.jsx("path",{d:"M18.8334 8.5L18.3735 15.3991C18.1965 18.054 18.108 19.3815 17.243 20.1907C16.378 21 15.0476 21 12.3868 21H11.6134C8.9526 21 7.6222 21 6.75719 20.1907C5.89218 19.3815 5.80368 18.054 5.62669 15.3991L5.16675 8.5",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"})]})})]})]}):e.jsxs("button",{type:"button",className:"adv-filter-pill-summary",onClick:()=>m(k),children:[e.jsx("span",{className:"adv-filter-pill-field",children:d.fieldName}),e.jsx("span",{className:"adv-filter-pill-op",children:((Z=it[d.operator])==null?void 0:Z.label)||d.operator}),!y(d.operator)&&e.jsx("span",{className:"adv-filter-pill-value",children:U(d.operator)?`${d.value||"?"} – ${d.value2||"?"}`:A?te(d.fieldId,d.value):d.value||"..."}),e.jsx("button",{type:"button",className:"adv-filter-pill-remove",onClick:O=>{O.stopPropagation(),X(k)},children:e.jsx("svg",{viewBox:"0 0 24 24",fill:"none",className:"h-3 w-3",children:e.jsx("path",{d:"M18 6L6 18M6 6L18 18",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round"})})})]})})]},k)}),e.jsxs("div",{className:"adv-filter-add-row",ref:p,children:[e.jsxs("button",{type:"button",className:"adv-filter-add-btn",onClick:()=>h(!u),children:[e.jsx("svg",{viewBox:"0 0 24 24",fill:"none",className:"h-3.5 w-3.5",children:e.jsx("path",{d:"M12 5V19M5 12H19",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round"})}),"Ajouter un filtre"]}),u&&e.jsxs("div",{className:"adv-filter-field-dropdown",children:[e.jsx("div",{className:"adv-filter-field-dropdown-title",children:"Choisir un champ"}),L.map(d=>e.jsxs("button",{type:"button",className:"adv-filter-field-option",onClick:()=>C(d.id),children:[e.jsx("span",{className:"adv-filter-field-type-badge",children:ur(d.type)}),d.name]},d.id))]})]}),s.length>0&&e.jsx("button",{type:"button",className:"adv-filter-clear",onClick:F,children:"Effacer tous les filtres"})]}),e.jsx("style",{children:`
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
            `})]})}function ur(t){return{text:"Aa",title:"T",email:"@",phone:"☎",url:"🔗",number:"#",currency:"$",percent:"%",date:"📅",datetime:"🕐",textarea:"¶",select:"☰",relation:"↗",classification:"●"}[t]||"Aa"}const Ge=229,Qe=500,et=280;function pr({entityName:t,entityNamePlural:s,entityIcon:i,accountNumber:a,entitySlug:o,showSidebar:x,onToggleSidebar:l,filters:j=[],activeFilters:m={},onFilterChange:u,columns:h=[],fieldFilters:p=[],onFieldFiltersChange:$,allRecords:L=[],sidebarWidth:C,onSidebarWidthChange:E}){const[X,F]=r.useState(C||et),y=r.useRef(!1),U=r.useRef(0),Y=r.useRef(0),J=r.useRef(C||et),te=r.useRef(E);r.useEffect(()=>{te.current=E},[E]),r.useEffect(()=>{J.current=X},[X]),r.useEffect(()=>{C&&!y.current&&F(C)},[C]);const d=r.useCallback(T=>{T.preventDefault(),y.current=!0,U.current=T.clientX,Y.current=J.current,document.body.style.cursor="col-resize",document.body.style.userSelect="none"},[]);if(r.useEffect(()=>{const T=I=>{if(!y.current)return;const G=I.clientX-U.current,Z=Math.min(Qe,Math.max(Ge,Y.current+G));F(Z)},A=()=>{y.current&&(y.current=!1,document.body.style.cursor="",document.body.style.userSelect="",te.current&&te.current(J.current))};return document.addEventListener("mousemove",T),document.addEventListener("mouseup",A),()=>{document.removeEventListener("mousemove",T),document.removeEventListener("mouseup",A)}},[]),!x)return null;const k=(T,A)=>{const I={...m},G=I[T]||[];if(A==="__all__")delete I[T];else{const Z=G.indexOf(A);Z>-1?(G.splice(Z,1),G.length===0?delete I[T]:I[T]=[...G]):I[T]=[...G,A]}u(I)},re=Object.keys(m).length>0;return e.jsxs("div",{style:{position:"relative",width:X,minWidth:Ge,maxWidth:Qe,flexShrink:0},children:[e.jsxs("div",{className:"panel z-10 space-y-4 overflow-y-auto p-4 h-full",style:{display:"flex",flexDirection:"column",width:"100%"},children:[e.jsx("div",{className:"flex items-center justify-between",children:e.jsx("div",{className:"flex items-center",children:e.jsxs("div",{className:"flex items-center text-center",children:[e.jsx("div",{children:i?e.jsx("iconify-icon",{icon:i,width:"22",style:{color:"var(--primary)"}}):e.jsxs("svg",{width:"24",height:"24",viewBox:"0 0 24 24",fill:"none",xmlns:"http://www.w3.org/2000/svg",className:"h-5 w-5",children:[e.jsx("path",{d:"M20.3116 12.6473L20.8293 10.7154C21.4335 8.46034 21.7356 7.3328 21.5081 6.35703C21.3285 5.58657 20.9244 4.88668 20.347 4.34587C19.6157 3.66095 18.4881 3.35883 16.2331 2.75458C13.978 2.15033 12.8504 1.84821 11.8747 2.07573C11.1042 2.25537 10.4043 2.65945 9.86351 3.23687C9.27709 3.86298 8.97128 4.77957 8.51621 6.44561C8.43979 6.7254 8.35915 7.02633 8.27227 7.35057L8.27222 7.35077L7.75458 9.28263C7.15033 11.5377 6.84821 12.6652 7.07573 13.641C7.25537 14.4115 7.65945 15.1114 8.23687 15.6522C8.96815 16.3371 10.0957 16.6392 12.3508 17.2435L12.3508 17.2435C14.3834 17.7881 15.4999 18.0873 16.415 17.9744C16.5152 17.9621 16.6129 17.9448 16.7092 17.9223C17.4796 17.7427 18.1795 17.3386 18.7203 16.7612C19.4052 16.0299 19.7074 14.9024 20.3116 12.6473Z",stroke:"currentColor",strokeWidth:"1.5"}),e.jsx("path",{opacity:"0.5",d:"M16.415 17.9741C16.2065 18.6126 15.8399 19.1902 15.347 19.6519C14.6157 20.3368 13.4881 20.6389 11.2331 21.2432C8.97798 21.8474 7.85044 22.1495 6.87466 21.922C6.10421 21.7424 5.40432 21.3383 4.86351 20.7609C4.17859 20.0296 3.87647 18.9021 3.27222 16.647L2.75458 14.7151C2.15033 12.46 1.84821 11.3325 2.07573 10.3567C2.25537 9.58627 2.65945 8.88638 3.23687 8.34557C3.96815 7.66065 5.09569 7.35853 7.35077 6.75428C7.77741 6.63996 8.16368 6.53646 8.51621 6.44531",stroke:"currentColor",strokeWidth:"1.5"}),e.jsx("path",{d:"M11.7769 10L16.6065 11.2941",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"}),e.jsx("path",{opacity:"0.5",d:"M11 12.8975L13.8978 13.6739",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"})]})}),e.jsx("h3",{className:"text-lg font-semibold ltr:ml-3 rtl:mr-3",children:t})]})})}),e.jsx("div",{className:"h-px w-full border-b border-[#e0e6ed] dark:border-[#1b2e4b]"}),e.jsx("div",{className:"!mt-0",style:{flex:1,display:"flex",flexDirection:"column"},children:e.jsxs("div",{className:"flex h-full flex-col pb-16",style:{position:"relative"},children:[e.jsx("div",{className:"relative -mr-3.5 h-full grow pr-3.5 overflow-auto",children:e.jsxs("div",{className:"space-y-1",children:[e.jsx("button",{type:"button",className:`flex h-10 w-full items-center justify-between rounded-md p-2 font-medium hover:bg-white-dark/10 hover:text-primary dark:hover:bg-[#181F32] dark:hover:text-primary ${re?"":"bg-gray-100 dark:text-primary text-primary dark:bg-[#181F32]"}`,onClick:()=>u({}),children:e.jsxs("div",{className:"flex items-center",children:[e.jsx("iconify-icon",{icon:"solar:checklist-minimalistic-bold-duotone",width:"20"}),e.jsxs("div",{className:"ltr:ml-3 rtl:mr-3",children:["Toutes les ",s||t+"s"]})]})}),j.map(T=>e.jsxs("div",{children:[e.jsx("div",{className:"h-px w-full border-b border-[#e0e6ed] dark:border-[#1b2e4b] my-2"}),e.jsx("div",{className:"px-1 py-2 text-white-dark text-xs uppercase font-semibold tracking-wider",children:T.name}),T.type==="tags"?e.jsx("div",{className:"flex flex-wrap gap-1.5 px-1",children:T.options.map(A=>{const I=(m[T.id]||[]).includes(A.id);return e.jsxs("button",{type:"button",className:"mb-0 py-0.5 px-2.5 text-xs rounded-full cursor-pointer transition-all font-medium",style:{border:`1.5px solid ${A.color||"#9ca3af"}`,color:I?"#fff":A.color||"#9ca3af",backgroundColor:I?A.color||"#9ca3af":"transparent"},onClick:()=>k(T.id,A.id),children:[A.label,A.count!==void 0&&e.jsx("span",{style:{opacity:.7,marginLeft:"2px"},children:A.count})]},A.id)})}):e.jsx("div",{className:"space-y-0.5",children:T.options.map(A=>{const I=(m[T.id]||[]).includes(A.id);return e.jsxs("button",{type:"button",className:`flex h-9 w-full items-center rounded-md px-2 py-1.5 text-sm font-medium transition-colors hover:bg-white-dark/10 hover:text-primary dark:hover:bg-[#181F32] dark:hover:text-primary ${I?"bg-gray-100 text-primary dark:bg-[#181F32] dark:text-primary":""}`,onClick:()=>k(T.id,A.id),children:[e.jsx("span",{className:"inline-block w-3 h-3 rounded-full mr-2.5 flex-shrink-0",style:{backgroundColor:A.color||"#9ca3af"}}),e.jsx("span",{className:"truncate",children:A.label}),A.count!==void 0&&e.jsx("span",{className:"ml-auto text-xs opacity-60",children:A.count})]},A.id)})})]},T.id)),e.jsx(cr,{columns:h,fieldFilters:p,onFieldFiltersChange:$,allRecords:L,sidebarFilters:j})]})}),e.jsx("div",{className:"absolute bottom-0 w-full p-4 left-0",children:e.jsxs("button",{type:"button",className:"btn btn-primary w-full",onClick:async()=>{try{const A=await(await fetch(`/account/${a}/record/api/create-draft`,{method:"POST",headers:{"Content-Type":"application/json"},credentials:"include",body:JSON.stringify({entitySlug:o})})).json();A.success&&A._id&&(window.location.href=`/account/${a}/record/${o}/${A._id}/fiche`)}catch(T){console.error("[CreateDraft]",T)}},children:[e.jsxs("svg",{xmlns:"http://www.w3.org/2000/svg",width:"24px",height:"24px",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round",className:"h-5 w-5 ltr:mr-2 rtl:ml-2",children:[e.jsx("line",{x1:"12",y1:"5",x2:"12",y2:"19"}),e.jsx("line",{x1:"5",y1:"12",x2:"19",y2:"12"})]}),"Ajouter"]})})]})})]}),e.jsx("div",{onMouseDown:d,style:{position:"absolute",top:0,right:-3,width:6,height:"100%",cursor:"col-resize",zIndex:20,display:"flex",alignItems:"center",justifyContent:"center"},onMouseEnter:T=>{T.currentTarget.querySelector(".resize-bar").style.opacity="1"},onMouseLeave:T=>{y.current||(T.currentTarget.querySelector(".resize-bar").style.opacity="0")},children:e.jsx("div",{className:"resize-bar",style:{width:3,height:"100%",borderRadius:2,background:"var(--primary, #4361ee)",opacity:0,transition:"opacity 0.2s ease"}})})]})}const fr=["#4361ee","#805dca","#e2a03f","#00ab55","#e7515a","#2196d4","#3b3f5c","#009688","#ff5722","#607d8b"],xr={contains:{label:"Contient",icon:"⊃",types:["text","email","phone","url","textarea","title","relation"]},not_contains:{label:"Ne contient pas",icon:"⊅",types:["text","email","phone","url","textarea","title","relation"]},equals:{label:"Est égal à",icon:"=",types:["text","email","phone","url","number","date","title","select","relation","classification"]},not_equals:{label:"N'est pas égal à",icon:"≠",types:["text","email","phone","url","number","date","title","select","relation","classification"]},starts_with:{label:"Commence par",icon:"A…",types:["text","email","phone","url","title"]},ends_with:{label:"Se termine par",icon:"…Z",types:["text","email","phone","url","title"]},gt:{label:"Supérieur à",icon:">",types:["number","date"]},gte:{label:"Supérieur ou égal",icon:"≥",types:["number","date"]},lt:{label:"Inférieur à",icon:"<",types:["number","date"]},lte:{label:"Inférieur ou égal",icon:"≤",types:["number","date"]},between:{label:"Entre",icon:"↔",types:["number","date"]},is_empty:{label:"Est vide",icon:"∅",types:["text","email","phone","url","number","date","textarea","title","select","relation","classification"]},is_not_empty:{label:"N'est pas vide",icon:"∃",types:["text","email","phone","url","number","date","textarea","title","select","relation","classification"]}};function Pe(t){const s=t||"text";return Object.entries(xr).filter(([i,a])=>a.types.includes(s)).map(([i,a])=>({key:i,...a}))}function tt(t){return["number","currency","percent"].includes(t)?"number":["date","datetime"].includes(t)?"date":"text"}function hr({savedViews:t=[],activeViewId:s,onSelectView:i,onCreateView:a,onDeleteView:o,onRenameView:x,onUpdateViewFilters:l,hasActiveFilters:j=!1,activeFilters:m={},fieldFilters:u=[],sidebarFilters:h=[],columns:p=[],externalOpenCreate:$=!1,onCloseExternalCreate:L}){const[C,E]=r.useState(!1),[X,F]=r.useState(!1),[y,U]=r.useState(""),[Y,J]=r.useState("#4361ee"),[te,d]=r.useState(null),[k,re]=r.useState(null),[T,A]=r.useState(""),[I,G]=r.useState(null),[Z,O]=r.useState([]),[oe,le]=r.useState({}),[xe,v]=r.useState(!1),B=r.useRef(null),H=r.useRef(null),b=r.useRef(null),N=r.useRef(null);r.useEffect(()=>{const g=w=>{te&&H.current&&!H.current.contains(w.target)&&d(null)};return te&&document.addEventListener("mousedown",g),()=>document.removeEventListener("mousedown",g)},[te]),r.useEffect(()=>{C&&b.current&&setTimeout(()=>{var g;return(g=b.current)==null?void 0:g.focus()},100)},[C]),r.useEffect(()=>{$&&(E(!0),O([...u]),L==null||L())},[$]),r.useEffect(()=>{C&&!I&&(O([...u]),le(JSON.parse(JSON.stringify(m||{}))))},[C]),r.useEffect(()=>{const g=w=>{xe&&B.current&&!B.current.contains(w.target)&&v(!1)};return xe&&document.addEventListener("mousedown",g),()=>document.removeEventListener("mousedown",g)},[xe]),r.useEffect(()=>{k&&N.current&&(N.current.focus(),N.current.select())},[k]);const P=(g,w)=>{g.preventDefault(),d({viewId:w,x:g.clientX,y:g.clientY})},V=()=>{y.trim()&&(a({name:y.trim(),color:Y,filters:oe,fieldFilters:Z}),U(""),J("#4361ee"),O([]),le({}),E(!1))},de=r.useMemo(()=>p.filter(g=>g.id!=="actions"),[p]),Q=r.useMemo(()=>{const g={};return h.forEach(w=>{g[`classif:${w.id}`]=w.options||[]}),g},[h]),f=r.useCallback(g=>{const w=de.find(he=>he.id===g);if(!w)return;const K=g.startsWith("classif:"),fe=Pe(w.type),be=K?fe.find(he=>he.key==="equals")||fe[0]:fe.find(he=>he.key==="contains")||fe[0],ke={fieldId:g,fieldName:w.name,fieldType:w.type||"text",operator:be.key,value:"",value2:"",logic:"AND"};O(he=>[...he,ke]),v(!1)},[de]),M=r.useCallback((g,w)=>{O(K=>K.map((fe,be)=>be===g?{...fe,...w}:fe))},[]),n=r.useCallback(g=>{O(w=>w.filter((K,fe)=>fe!==g))},[]),R=g=>{const w=t.find(K=>K._id===g);w&&(re(g),A(w.name)),d(null)},W=()=>{k&&T.trim()&&x(k,T.trim()),re(null),A("")},se=g=>{o(g),d(null)},ee=g=>{const w=t.find(K=>K._id===g);w&&(G(g),U(w.name||""),J(w.color||"#4361ee"),O(w.fieldFilters?JSON.parse(JSON.stringify(w.fieldFilters)):[]),le(w.filters?JSON.parse(JSON.stringify(w.filters)):{}),E(!0),d(null))},ne=()=>{!y.trim()||!I||(l(I,oe,Z,y.trim(),Y),U(""),J("#4361ee"),O([]),le({}),G(null),E(!1))},q=g=>{var K;let w=0;return g.filters&&(w+=Object.keys(g.filters).filter(fe=>fe!=="__favourites").length),(K=g.fieldFilters)!=null&&K.length&&(w+=g.fieldFilters.length),w};return e.jsxs(e.Fragment,{children:[e.jsxs("div",{className:"saved-views-tabs",children:[e.jsxs("button",{type:"button",className:`saved-view-tab ${s?"":"saved-view-tab--active"}`,onClick:()=>i(null),children:[e.jsxs("svg",{className:"saved-view-tab-icon",viewBox:"0 0 24 24",fill:"none",children:[e.jsx("path",{d:"M2 12C2 7.28595 2 4.92893 3.46447 3.46447C4.92893 2 7.28595 2 12 2C16.714 2 19.0711 2 20.5355 3.46447C22 4.92893 22 7.28595 22 12C22 16.714 22 19.0711 20.5355 20.5355C19.0711 22 16.714 22 12 22C7.28595 22 4.92893 22 3.46447 20.5355C2 19.0711 2 16.714 2 12Z",stroke:"currentColor",strokeWidth:"1.5"}),e.jsx("path",{d:"M6 12H18",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"}),e.jsx("path",{d:"M6 8H18",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"}),e.jsx("path",{d:"M6 16H18",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"})]}),"Tout"]}),t.map(g=>e.jsx("button",{type:"button",className:`saved-view-tab ${s===g._id?"saved-view-tab--active":""}`,style:{"--tab-color":g.color||"#4361ee"},onClick:()=>i(g._id),onContextMenu:w=>P(w,g._id),children:k===g._id?e.jsx("input",{ref:N,type:"text",value:T,onChange:w=>A(w.target.value),onBlur:W,onKeyDown:w=>{w.key==="Enter"&&W(),w.key==="Escape"&&(re(null),A(""))},className:"saved-view-tab-edit-input",onClick:w=>w.stopPropagation()}):e.jsxs(e.Fragment,{children:[e.jsx("span",{className:"saved-view-tab-dot",style:{backgroundColor:g.color||"#4361ee"}}),e.jsx("span",{className:"saved-view-tab-name",children:g.name}),q(g)>0&&e.jsx("span",{className:"saved-view-tab-badge",children:q(g)})]})},g._id)),e.jsx("button",{type:"button",className:"saved-view-tab saved-view-tab--add",onClick:()=>{G(null),U(""),J("#4361ee"),E(!0)},title:"Enregistrer une vue",children:e.jsx("svg",{viewBox:"0 0 24 24",fill:"none",className:"h-3.5 w-3.5",children:e.jsx("path",{d:"M12 5V19M5 12H19",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round"})})})]}),te&&e.jsxs("div",{ref:H,className:"saved-view-context-menu",style:{position:"fixed",top:te.y,left:te.x,zIndex:10001},children:[e.jsxs("button",{className:"saved-view-context-item",onClick:()=>R(te.viewId),children:[e.jsx("svg",{viewBox:"0 0 24 24",fill:"none",className:"h-4 w-4",children:e.jsx("path",{d:"M13.9027 6.37027L17.6297 10.0973M4 20.0001H8L18.5 9.50006C18.9978 9.00236 19.2786 8.32622 19.2786 7.62142C19.2786 6.91661 18.9978 6.24047 18.5 5.74277C18.0023 5.24508 17.3261 4.96426 16.6213 4.96426C15.9165 4.96426 15.2404 5.24508 14.7427 5.74277L4 16.0001V20.0001Z",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round"})}),"Renommer"]}),e.jsxs("button",{className:"saved-view-context-item",onClick:()=>ee(te.viewId),children:[e.jsxs("svg",{viewBox:"0 0 24 24",fill:"none",className:"h-4 w-4",children:[e.jsx("path",{d:"M4.06189 13C4.02104 12.6724 4 12.3387 4 12C4 7.58172 7.58172 4 12 4C14.5006 4 16.7332 5.14727 18.2002 6.94416M19.9381 11C19.979 11.3276 20 11.6613 20 12C20 16.4183 16.4183 20 12 20C9.49944 20 7.26681 18.8527 5.79984 17.0558",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round"}),e.jsx("path",{d:"M15 7H19V3",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round"}),e.jsx("path",{d:"M9 17H5V21",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round"})]}),"Modifier la vue"]}),e.jsx("div",{className:"saved-view-context-separator"}),e.jsxs("button",{className:"saved-view-context-item saved-view-context-item--danger",onClick:()=>se(te.viewId),children:[e.jsxs("svg",{viewBox:"0 0 24 24",fill:"none",className:"h-4 w-4",children:[e.jsx("path",{d:"M20.5001 6H3.5",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"}),e.jsx("path",{d:"M18.8334 8.5L18.3735 15.3991C18.1965 18.054 18.108 19.3815 17.243 20.1907C16.378 21 15.0476 21 12.3868 21H11.6134C8.9526 21 7.6222 21 6.75719 20.1907C5.89218 19.3815 5.80368 18.054 5.62669 15.3991L5.16675 8.5",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"}),e.jsx("path",{d:"M9.5 11L10 16",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"}),e.jsx("path",{d:"M14.5 11L14 16",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"}),e.jsx("path",{d:"M6.5 6C6.55588 6 6.58382 6 6.60915 5.99936C7.43259 5.97849 8.15902 5.45491 8.43922 4.68032C8.44784 4.65649 8.45667 4.62999 8.47434 4.57697L8.57143 4.28571C8.65431 4.03708 8.69575 3.91276 8.75071 3.8072C8.97001 3.38607 9.37574 3.09364 9.84461 3.01877C9.96213 3 10.0932 3 10.3553 3H13.6447C13.9068 3 14.0379 3 14.1554 3.01877C14.6243 3.09364 15.03 3.38607 15.2493 3.8072C15.3043 3.91276 15.3457 4.03708 15.4286 4.28571L15.5257 4.57697C15.5433 4.62992 15.5522 4.65651 15.5608 4.68032C15.841 5.45491 16.5674 5.97849 17.3909 5.99936C17.4162 6 17.4441 6 17.5 6",stroke:"currentColor",strokeWidth:"1.5"})]}),"Supprimer"]})]}),C&&e.jsx("div",{className:"saved-view-modal-overlay",onClick:()=>E(!1),children:e.jsxs("div",{className:"saved-view-modal",onClick:g=>g.stopPropagation(),children:[e.jsxs("div",{className:"saved-view-modal-header",children:[e.jsx("h3",{children:I?"Modifier la vue":"Enregistrer la vue"}),e.jsx("button",{type:"button",className:"saved-view-modal-close",onClick:()=>{E(!1),G(null)},children:e.jsx("svg",{viewBox:"0 0 24 24",fill:"none",className:"h-5 w-5",children:e.jsx("path",{d:"M18 6L6 18M6 6L18 18",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"})})})]}),e.jsxs("div",{className:"saved-view-modal-body",children:[e.jsxs("div",{className:"saved-view-form-group",children:[e.jsx("label",{className:"saved-view-form-label",children:"Nom de la vue"}),e.jsx("input",{ref:b,type:"text",value:y,onChange:g=>U(g.target.value),onKeyDown:g=>{g.key==="Enter"&&V()},placeholder:"Ex: Hôtels, Clients VIP...",className:"saved-view-form-input"})]}),e.jsxs("div",{className:"saved-view-form-group",children:[e.jsx("label",{className:"saved-view-form-label",children:"Couleur"}),e.jsx("div",{className:"saved-view-color-grid",children:fr.map(g=>e.jsx("button",{type:"button",className:`saved-view-color-swatch ${Y===g?"saved-view-color-swatch--active":""}`,style:{backgroundColor:g},onClick:()=>J(g),children:Y===g&&e.jsx("svg",{viewBox:"0 0 24 24",fill:"none",className:"h-3 w-3",children:e.jsx("path",{d:"M5 13L9 17L19 7",stroke:"white",strokeWidth:"2.5",strokeLinecap:"round",strokeLinejoin:"round"})})},g))})]}),h.length>0&&e.jsxs("div",{className:"saved-view-form-group",children:[e.jsx("label",{className:"saved-view-form-label",children:"Filtres de classification"}),e.jsx("div",{className:"svm-classif-editor",children:h.map(g=>{const w=oe[g.id]||[];return e.jsxs("div",{className:"svm-classif-group",children:[e.jsx("span",{className:"svm-classif-group-label",children:g.name}),e.jsx("div",{className:"svm-classif-options",children:(g.options||[]).map(K=>{const fe=w.includes(K.id);return e.jsxs("button",{type:"button",className:`svm-classif-pill ${fe?"svm-classif-pill--active":""}`,style:{"--pill-color":K.color||"#9ca3af"},onClick:()=>{le(be=>{const ke=be[g.id]||[];let he;fe?he=ke.filter(Se=>Se!==K.id):he=[...ke,K.id];const ye={...be};return he.length>0?ye[g.id]=he:delete ye[g.id],ye})},children:[fe&&e.jsx("svg",{viewBox:"0 0 24 24",fill:"none",className:"svm-classif-check",children:e.jsx("path",{d:"M5 13L9 17L19 7",stroke:"currentColor",strokeWidth:"2.5",strokeLinecap:"round",strokeLinejoin:"round"})}),K.label]},K.id)})})]},g.id)})})]}),e.jsxs("div",{className:"saved-view-form-group",children:[e.jsx("label",{className:"saved-view-form-label",children:"Filtres avancés"}),e.jsxs("div",{className:"svm-filter-builder",children:[Z.map((g,w)=>{var Se;const K=(Se=g.fieldId)==null?void 0:Se.startsWith("classif:"),fe=K?Q[g.fieldId]||[]:[],be=Pe(g.fieldType),ke=["is_empty","is_not_empty"].includes(g.operator),he=g.operator==="between",ye=g.logic||"AND";return e.jsxs(Fe.Fragment,{children:[w>0&&e.jsxs("div",{className:"svm-filter-connector",children:[e.jsx("span",{className:"svm-filter-connector-line"}),e.jsx("button",{type:"button",className:`svm-filter-connector-badge ${ye==="OR"?"svm-filter-connector-badge--or":""}`,onClick:()=>M(w,{logic:ye==="AND"?"OR":"AND"}),title:"Cliquez pour basculer ET/OU",children:ye==="OR"?"OU":"ET"}),e.jsx("span",{className:"svm-filter-connector-line"})]}),e.jsxs("div",{className:"svm-filter-row",children:[e.jsx("select",{value:g.fieldId,onChange:pe=>{const je=de.find(Le=>Le.id===pe.target.value);if(je){const Le=pe.target.value.startsWith("classif:"),Ce=Pe(je.type),Te=Le?Ce.find($e=>$e.key==="equals")||Ce[0]:Ce.find($e=>$e.key===g.operator)||Ce[0];M(w,{fieldId:je.id,fieldName:je.name,fieldType:je.type||"text",operator:Te.key,value:"",value2:""})}},className:"svm-filter-select svm-filter-select--field",children:de.map(pe=>e.jsx("option",{value:pe.id,children:pe.name},pe.id))}),e.jsx("select",{value:g.operator,onChange:pe=>M(w,{operator:pe.target.value,value:["is_empty","is_not_empty"].includes(pe.target.value)?"":g.value,value2:""}),className:"svm-filter-select svm-filter-select--op",children:be.map(pe=>e.jsx("option",{value:pe.key,children:pe.label},pe.key))}),!ke&&(K&&fe.length>0?e.jsxs("select",{value:g.value,onChange:pe=>M(w,{value:pe.target.value}),className:"svm-filter-select svm-filter-select--val",children:[e.jsx("option",{value:"",children:"Sélectionnez..."}),fe.map(pe=>e.jsx("option",{value:pe.label,children:pe.label},pe.id))]}):e.jsx("input",{type:tt(g.fieldType),value:g.value,onChange:pe=>M(w,{value:pe.target.value}),placeholder:"Valeur...",className:"svm-filter-input"})),he&&e.jsx("input",{type:tt(g.fieldType),value:g.value2||"",onChange:pe=>M(w,{value2:pe.target.value}),placeholder:"Max...",className:"svm-filter-input"}),e.jsx("button",{type:"button",className:"svm-filter-remove",onClick:()=>n(w),title:"Supprimer ce filtre",children:e.jsx("svg",{viewBox:"0 0 24 24",fill:"none",className:"h-3.5 w-3.5",children:e.jsx("path",{d:"M18 6L6 18M6 6L18 18",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round"})})})]})]},w)}),e.jsxs("div",{className:"svm-filter-add-row",ref:B,children:[e.jsxs("button",{type:"button",className:"svm-filter-add-btn",onClick:()=>v(!xe),children:[e.jsx("svg",{viewBox:"0 0 24 24",fill:"none",className:"h-3.5 w-3.5",children:e.jsx("path",{d:"M12 5V19M5 12H19",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round"})}),"Ajouter un filtre"]}),xe&&e.jsxs("div",{className:"svm-filter-field-dropdown",children:[e.jsx("div",{className:"svm-filter-field-dropdown-title",children:"Choisir un champ"}),de.map(g=>e.jsx("button",{type:"button",className:"svm-filter-field-option",onClick:()=>f(g.id),children:g.name},g.id))]})]})]})]})]}),e.jsxs("div",{className:"saved-view-modal-footer",children:[e.jsx("button",{type:"button",className:"saved-view-btn saved-view-btn--cancel",onClick:()=>{E(!1),G(null)},children:"Annuler"}),e.jsxs("button",{type:"button",className:"saved-view-btn saved-view-btn--save",onClick:I?ne:V,disabled:!y.trim(),children:[e.jsx("svg",{viewBox:"0 0 24 24",fill:"none",className:"h-4 w-4",children:e.jsx("path",{d:"M5 13L9 17L19 7",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round"})}),I?"Mettre à jour":"Enregistrer"]})]})]})}),e.jsx("style",{children:`
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
            `})]})}const De=[{label:"Nouveau",color:"#64748b"},{label:"Qualification",color:"#3b82f6"},{label:"Proposition",color:"#f59e0b"},{label:"Gagné",color:"#22c55e"},{label:"Perdu",color:"#ef4444"}],gr=new Set(["select","multiselect","multi-select","multi_select","tags","tag"]);function Ie(t){var s;return String(((s=t==null?void 0:t._id)==null?void 0:s.$oid)||(t==null?void 0:t._id)||t||"")}function mr(t){return String(t||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,"")||`pipeline-${Date.now()}`}function br(t,s){return{id:Ie(t),label:t.label||t.name||String(t.value||`Étape ${s+1}`),color:t.color||t.couleur||"#6366f1",order:Number.isFinite(Number(t.order))?Number(t.order):s}}function vr(t,s){if(typeof t=="string")return{value:t,label:t,color:"#64748b",order:s};const i=String(t.value??t.id??t._id??t.label??t.name??"");return{value:i,label:t.label||t.name||i||`Option ${s+1}`,color:t.color||t.couleur||t.bg||"#64748b",order:Number.isFinite(Number(t.order))?Number(t.order):s}}function yr(t,s=[]){const i=[],a=new Set,o=(x,l)=>{const j=Ie(x);if(!j||a.has(j))return;a.add(j);const m=(x.options||[]).map(br).sort((u,h)=>u.order-h.order);i.push({id:j,value:l==="status"?"status":j,label:x.name||(l==="status"?"Statut":"Pipeline"),source:l,options:m})};return t!=null&&t.statusClassification&&o(t.statusClassification,"status"),((t==null?void 0:t.classifications)||[]).forEach(x=>{o(x,"classification")}),s.forEach(x=>{o(x,"classification")}),i}function kr(t){return((t==null?void 0:t.customFields)||[]).filter(s=>s&&typeof s=="object").map(s=>{var x,l,j,m,u,h,p;const i=String(s.fieldType||s.type||((x=s.render)==null?void 0:x.input)||"").toLowerCase(),a=String(((j=(l=s.render)==null?void 0:l.display)==null?void 0:j.card)||((u=(m=s.render)==null?void 0:m.display)==null?void 0:u.table)||"").toLowerCase(),o=(((h=s.type_config)==null?void 0:h.options)||((p=s.typeConfig)==null?void 0:p.options)||s.options||[]).map(vr).filter($=>$.value||$.label);return{id:Ie(s),label:s.label||s.name||"Champ",type:i,options:o,eligible:gr.has(i)||["badge","chip","chips","tags"].includes(a)||o.length>0}}).filter(s=>s.id&&s.eligible)}function wr(t,s){if(!t.length)return"";const i=(s==null?void 0:s.kanbanField)||"status";if(i==="status"&&t.some(o=>o.value==="status"))return"status";const a=t.find(o=>o.value===i||o.id===i);return(a==null?void 0:a.value)||t[0].value}function He({icon:t,title:s,onClick:i,disabled:a,tone:o="neutral"}){const x=o==="danger"?"hover:border-red-200 hover:bg-red-50 hover:text-red-600 dark:hover:border-red-500/30 dark:hover:bg-red-950/30":"hover:border-primary/30 hover:bg-primary/5 hover:text-primary";return e.jsx("button",{type:"button",title:s,onClick:i,disabled:a,className:`grid h-8 w-8 place-items-center rounded-lg border border-gray-200 bg-white text-gray-400 transition disabled:opacity-40 dark:border-white/10 dark:bg-[#111827] dark:text-white-dark ${x}`,children:e.jsx("iconify-icon",{icon:t,width:"15"})})}function jr({open:t,accountNumber:s,entityId:i,entityData:a,viewId:o,viewSettings:x,onClose:l,onSaved:j}){const[m,u]=r.useState([]),h=r.useMemo(()=>yr(a,m),[a,m]),p=r.useMemo(()=>kr(a),[a]),[$,L]=r.useState(""),C=h.find(v=>v.value===$)||h[0]||null,[E,X]=r.useState([]),[F,y]=r.useState([]),[U,Y]=r.useState(""),[J,te]=r.useState([]),[d,k]=r.useState(!1),[re,T]=r.useState("");if(r.useEffect(()=>{t&&(T(""),L(v=>v&&h.some(B=>B.value===v)?v:wr(h,x)),te(Array.isArray(x==null?void 0:x.kanbanTagFields)?x.kanbanTagFields:[]),y([]))},[t,h,x]),r.useEffect(()=>{if(!t||!C){X([]);return}X(C.options.map(v=>({...v}))),y([])},[t,C==null?void 0:C.id]),!t)return null;const A=(v,B)=>{X(H=>H.map(b=>b.id===v?{...b,...B}:b))},I=(v,B)=>{X(H=>{const b=H.findIndex(de=>de.id===v),N=b+B;if(b<0||N<0||N>=H.length)return H;const P=[...H],[V]=P.splice(b,1);return P.splice(N,0,V),P})},G=()=>{const v=E.length,B=De[v%De.length];X(H=>[...H,{id:`tmp_${Date.now()}_${v}`,label:B.label,color:B.color,order:v,isNew:!0}])},Z=v=>{X(B=>B.filter(H=>H.id!==v.id)),!v.isNew&&v.id&&y(B=>[...B,v.id])},O=v=>{te(B=>B.includes(v)?B.filter(H=>H!==v):[...B,v])},oe=async(v,B)=>{const H=await fetch(v,{method:"POST",headers:{"Content-Type":"application/json"},credentials:"include",body:JSON.stringify(B)}),b=await H.json().catch(()=>({}));if(!H.ok||b.error||b.success===!1)throw new Error(b.error||`Erreur HTTP ${H.status}`);return b},le=async()=>{const v=U.trim();if(!v){T("Nom requis");return}k(!0),T("");try{const H=(await oe(`/account/${s}/classification/api/create`,{name:v,slug:mr(v),type:"status",entities:i?[i]:[],options:De})).classification;u(b=>[...b,H]),L(Ie(H)),Y("")}catch(B){T(B.message||"Création impossible")}finally{k(!1)}},xe=async()=>{if(!C){T("Pipeline requise");return}const v=E.map((B,H)=>({...B,label:String(B.label||"").trim(),color:B.color||"#6366f1",order:H})).filter(B=>B.label);if(!v.length){T("Ajoute au moins une étape");return}k(!0),T("");try{const B=new Map(C.options.map(N=>[N.id,N])),H=[];for(const N of v){if(N.isNew||N.id.startsWith("tmp_")){const V=await oe(`/account/${s}/classification/api/fast-add`,{classificationId:C.id,label:N.label,color:N.color});H.push({...N,id:Ie(V.option),isNew:!1});continue}const P=B.get(N.id);P&&(P.label!==N.label||P.color!==N.color)&&await oe(`/account/${s}/classification/api/update-option`,{classificationId:C.id,optionId:N.id,label:N.label,color:N.color}),H.push(N)}for(const N of F)await oe(`/account/${s}/classification/api/delete-option`,{classificationId:C.id,optionId:N});await oe(`/account/${s}/classification/api/reorder`,{classificationId:C.id,options:H.map((N,P)=>({id:N.id,order:P}))});const b={...x||{},viewMode:"kanban",kanbanField:C.value,kanbanTagFields:J.filter(N=>p.some(P=>P.id===N))};await oe(`/account/${s}/api/view/config`,{viewId:o,settings:b}),j==null||j(b)}catch(B){T(B.message||"Sauvegarde impossible")}finally{k(!1)}};return _e.createPortal(e.jsx("div",{role:"dialog","aria-modal":"true",className:"fixed inset-0 flex items-center justify-center bg-slate-950/45 p-4",style:{zIndex:1e4},onMouseDown:v=>{v.target===v.currentTarget&&!d&&(l==null||l())},children:e.jsxs("div",{className:"flex max-h-[88vh] w-full max-w-4xl flex-col overflow-hidden rounded-lg border border-gray-100 bg-white shadow-2xl dark:border-white/10 dark:bg-[#0e1726]",onMouseDown:v=>v.stopPropagation(),children:[e.jsxs("div",{className:"flex items-center justify-between gap-3 border-b border-gray-100 px-5 py-4 dark:border-white/10",children:[e.jsxs("div",{className:"flex min-w-0 items-center gap-3",children:[e.jsx("div",{className:"grid h-9 w-9 place-items-center rounded-lg bg-primary/10 text-primary",children:e.jsx("iconify-icon",{icon:"solar:slider-horizontal-bold-duotone",width:"19"})}),e.jsxs("div",{className:"min-w-0",children:[e.jsx("div",{className:"truncate text-sm font-bold text-gray-900 dark:text-white",children:"Configurer la pipeline"}),e.jsx("div",{className:"truncate text-xs text-gray-400",children:(a==null?void 0:a.name)||"Entité"})]})]}),e.jsx("button",{type:"button",onClick:()=>!d&&(l==null?void 0:l()),className:"grid h-8 w-8 place-items-center rounded-lg bg-gray-100 text-gray-500 transition hover:bg-gray-200 dark:bg-dark/50 dark:text-white-dark dark:hover:bg-dark",title:"Fermer",children:e.jsx("iconify-icon",{icon:"solar:close-circle-bold",width:"17"})})]}),e.jsx("div",{className:"min-h-0 flex-1 overflow-y-auto p-5",children:e.jsxs("div",{className:"grid gap-5 lg:grid-cols-[minmax(0,1fr)_270px]",children:[e.jsxs("div",{className:"space-y-5",children:[e.jsxs("div",{className:"grid gap-3 rounded-lg border border-gray-100 bg-gray-50/70 p-3 dark:border-white/10 dark:bg-dark/20 md:grid-cols-[minmax(0,1fr)_minmax(220px,0.75fr)]",children:[e.jsxs("label",{className:"grid gap-1.5",children:[e.jsx("span",{className:"text-[11px] font-bold uppercase text-gray-400",children:"Champ pipeline"}),e.jsx("select",{value:$,onChange:v=>L(v.target.value),className:"form-select h-10 rounded-lg border-gray-200 bg-white text-sm font-semibold text-gray-800 dark:border-white/10 dark:bg-[#1b2e4b] dark:text-white",children:h.map(v=>e.jsx("option",{value:v.value,children:v.label},v.value))})]}),e.jsxs("div",{className:"grid gap-1.5",children:[e.jsx("span",{className:"text-[11px] font-bold uppercase text-gray-400",children:"Créer une pipeline"}),e.jsxs("div",{className:"flex gap-2",children:[e.jsx("input",{type:"text",value:U,onChange:v=>Y(v.target.value),onKeyDown:v=>{v.key==="Enter"&&(v.preventDefault(),le())},className:"form-input h-10 min-w-0 flex-1 rounded-lg border-gray-200 bg-white text-sm dark:border-white/10 dark:bg-[#1b2e4b] dark:text-white",placeholder:"Nom de pipeline",disabled:d}),e.jsx("button",{type:"button",onClick:le,disabled:d,className:"grid h-10 w-10 place-items-center rounded-lg bg-primary text-white transition hover:bg-primary/90 disabled:opacity-60",title:"Créer",children:e.jsx("iconify-icon",{icon:d?"svg-spinners:ring-resize":"solar:add-circle-bold",width:"18"})})]})]})]}),e.jsxs("div",{children:[e.jsxs("div",{className:"mb-2 flex items-center justify-between gap-3",children:[e.jsxs("div",{children:[e.jsx("div",{className:"text-[11px] font-bold uppercase text-gray-400",children:"Étapes"}),e.jsxs("div",{className:"text-xs text-gray-400",children:[E.length," colonne",E.length>1?"s":""," dans le kanban"]})]}),e.jsxs("button",{type:"button",onClick:G,disabled:!C||d,className:"inline-flex h-9 items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 text-xs font-bold text-gray-600 transition hover:border-primary/40 hover:text-primary disabled:opacity-50 dark:border-white/10 dark:bg-[#111827] dark:text-white-dark",children:[e.jsx("iconify-icon",{icon:"solar:add-circle-bold",width:"14"}),"Ajouter"]})]}),e.jsxs("div",{className:"grid gap-2",children:[E.map((v,B)=>e.jsxs("div",{className:"grid grid-cols-[28px_34px_minmax(0,1fr)_auto] items-center gap-2 rounded-lg border border-gray-100 bg-white p-2 shadow-sm shadow-gray-100/60 dark:border-white/10 dark:bg-[#111827] dark:shadow-none",children:[e.jsx("div",{className:"text-center text-[11px] font-bold text-gray-400",children:B+1}),e.jsxs("label",{className:"grid h-8 w-8 cursor-pointer place-items-center rounded-lg border border-gray-200 bg-gray-50 dark:border-white/10 dark:bg-dark",title:"Couleur",children:[e.jsx("span",{className:"h-4 w-4 rounded",style:{backgroundColor:v.color||"#6366f1"}}),e.jsx("input",{type:"color",value:v.color||"#6366f1",onChange:H=>A(v.id,{color:H.target.value}),disabled:d,className:"sr-only"})]}),e.jsx("input",{type:"text",value:v.label,onChange:H=>A(v.id,{label:H.target.value}),disabled:d,className:"form-input h-9 min-w-0 rounded-lg border-gray-200 text-sm font-semibold dark:border-white/10 dark:bg-[#1b2e4b] dark:text-white"}),e.jsxs("div",{className:"flex items-center gap-1",children:[e.jsx(He,{icon:"solar:alt-arrow-up-bold",title:"Monter",onClick:()=>I(v.id,-1),disabled:B===0||d}),e.jsx(He,{icon:"solar:alt-arrow-down-bold",title:"Descendre",onClick:()=>I(v.id,1),disabled:B===E.length-1||d}),e.jsx(He,{icon:"solar:trash-bin-trash-bold",title:"Supprimer",onClick:()=>Z(v),disabled:d,tone:"danger"})]})]},v.id)),!E.length&&e.jsx("div",{className:"rounded-lg border border-dashed border-gray-200 py-8 text-center text-xs text-gray-400 dark:border-white/10",children:"Aucune étape"})]})]}),e.jsxs("div",{children:[e.jsxs("div",{className:"mb-2",children:[e.jsx("div",{className:"text-[11px] font-bold uppercase text-gray-400",children:"Tags sur les cartes"}),e.jsx("div",{className:"text-xs text-gray-400",children:"Champs select ou multi-select affichés comme badges sur les opportunités."})]}),p.length>0?e.jsx("div",{className:"grid gap-2 sm:grid-cols-2",children:p.map(v=>{const B=J.includes(v.id);return e.jsxs("button",{type:"button",onClick:()=>O(v.id),className:`flex items-center justify-between gap-3 rounded-lg border px-3 py-2 text-left transition ${B?"border-primary/40 bg-primary/5 text-primary":"border-gray-200 bg-white text-gray-700 hover:border-primary/30 dark:border-white/10 dark:bg-[#111827] dark:text-white-dark"}`,children:[e.jsxs("span",{className:"min-w-0",children:[e.jsx("span",{className:"block truncate text-sm font-bold",children:v.label}),e.jsxs("span",{className:"block text-[11px] text-gray-400",children:[v.options.length||"Sans"," option",v.options.length>1?"s":""]})]}),e.jsx("span",{className:`grid h-5 w-5 place-items-center rounded-full border text-[10px] ${B?"border-primary bg-primary text-white":"border-gray-200 text-transparent dark:border-white/10"}`,children:e.jsx("iconify-icon",{icon:"solar:check-read-bold",width:"12"})})]},v.id)})}):e.jsx("div",{className:"rounded-lg border border-dashed border-gray-200 px-3 py-4 text-xs text-gray-400 dark:border-white/10",children:"Aucun champ select ou multi-select disponible sur cette fiche."})]}),re&&e.jsx("div",{className:"rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-xs font-semibold text-red-600 dark:border-red-500/20 dark:bg-red-950/30 dark:text-red-300",children:re})]}),e.jsxs("aside",{className:"rounded-lg border border-gray-100 bg-white p-3 shadow-sm shadow-gray-100/70 dark:border-white/10 dark:bg-[#111827] dark:shadow-none",children:[e.jsxs("div",{className:"mb-3 flex items-center justify-between",children:[e.jsx("span",{className:"text-[11px] font-bold uppercase text-gray-400",children:"Aperçu"}),e.jsx("span",{className:"rounded bg-gray-100 px-2 py-1 text-[10px] font-bold text-gray-500 dark:bg-dark dark:text-white-dark",children:"Kanban"})]}),e.jsx("div",{className:"space-y-2",children:E.slice(0,5).map(v=>e.jsxs("div",{className:"rounded-lg border border-gray-100 bg-gray-50 p-2 dark:border-white/10 dark:bg-dark/40",children:[e.jsxs("div",{className:"mb-2 flex items-center justify-between gap-2",children:[e.jsx("span",{className:"truncate rounded px-2 py-0.5 text-[10px] font-bold uppercase text-white",style:{backgroundColor:v.color||"#6366f1"},children:v.label||"Étape"}),e.jsx("span",{className:"text-[11px] font-bold text-gray-400",children:"0"})]}),e.jsxs("div",{className:"rounded-lg border border-gray-100 bg-white p-2 dark:border-white/10 dark:bg-[#0e1726]",children:[e.jsx("div",{className:"mb-2 h-2 w-3/4 rounded bg-gray-200 dark:bg-white/10"}),e.jsxs("div",{className:"flex flex-wrap gap-1",children:[J.slice(0,2).map(B=>{var N;const H=p.find(P=>P.id===B),b=(N=H==null?void 0:H.options)==null?void 0:N[0];return e.jsx("span",{className:"rounded-full px-2 py-0.5 text-[10px] font-bold",style:{backgroundColor:`${(b==null?void 0:b.color)||"#64748b"}1a`,color:(b==null?void 0:b.color)||"#64748b"},children:(b==null?void 0:b.label)||(H==null?void 0:H.label)||"Tag"},B)}),!J.length&&e.jsx("span",{className:"h-5 w-16 rounded-full bg-gray-100 dark:bg-white/10"})]})]})]},`preview-${v.id}`))})]})]})}),e.jsxs("div",{className:"flex justify-end gap-2 border-t border-gray-100 bg-gray-50 px-5 py-4 dark:border-white/10 dark:bg-dark/30",children:[e.jsx("button",{type:"button",onClick:()=>!d&&(l==null?void 0:l()),className:"rounded-lg border border-gray-200 bg-white px-4 py-2 text-xs font-bold text-gray-500 transition hover:bg-gray-50 dark:border-white/10 dark:bg-[#111827] dark:text-white-dark",disabled:d,children:"Annuler"}),e.jsxs("button",{type:"button",onClick:xe,disabled:d||!C,className:"inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-xs font-bold text-white transition hover:bg-primary/90 disabled:opacity-60",children:[e.jsx("iconify-icon",{icon:d?"svg-spinners:ring-resize":"solar:diskette-bold",width:"15"}),"Enregistrer"]})]})]})}),document.body)}function Cr(t,s){var a,o,x;if(s==="title")return t.referenceTitle||t.computedTitle||t.title||"";if(s==="createdAt")return t.createdAt||"";if(s==="updatedAt")return t.updatedAt||"";if(s.startsWith("rel:")){const l=s.replace("rel:",""),m=(((a=t._denorm)==null?void 0:a.relations)||[]).find(p=>p.relationKey===l);if(((o=m==null?void 0:m.records)==null?void 0:o.length)>0)return m.records.map(p=>p.title||p.computedTitle||"").join(", ");const u=(t.relations||[]).find(p=>p.key===l||p.relationKey===l);if(u)return u.title||u.computedTitle||u.value||"";const h=(x=t._denorm)==null?void 0:x[l];return h&&(h.title||h.computedTitle)||""}if(s.startsWith("classif:")){const l=s.replace("classif:","");return(t.classificationValues||[]).filter(u=>{var h;return((h=u.classificationId)==null?void 0:h.toString())===l}).map(u=>u.label||u.optionLabel||"").join(", ")}const i=(t.customFields||[]).find(l=>{var j,m,u;return((m=(j=l.field_id)==null?void 0:j._id)==null?void 0:m.toString())===s||((u=l.field_id)==null?void 0:u.toString())===s});return(i==null?void 0:i.value)??""}function Nr(t,s){const{operator:i,value:a,value2:o,fieldType:x}=s,l=["number","currency","percent"].includes(x),j=["date","datetime"].includes(x),m=String(t??"").trim(),u=m.toLowerCase(),h=String(a??"").trim().toLowerCase();switch(i){case"contains":return u.includes(h);case"not_contains":return!u.includes(h);case"equals":return l?parseFloat(m)===parseFloat(a):u===h;case"not_equals":return l?parseFloat(m)!==parseFloat(a):u!==h;case"starts_with":return u.startsWith(h);case"ends_with":return u.endsWith(h);case"gt":return j?new Date(t)>new Date(a):parseFloat(m)>parseFloat(a);case"gte":return j?new Date(t)>=new Date(a):parseFloat(m)>=parseFloat(a);case"lt":return j?new Date(t)<new Date(a):parseFloat(m)<parseFloat(a);case"lte":return j?new Date(t)<=new Date(a):parseFloat(m)<=parseFloat(a);case"between":{if(j){const $=new Date(t);return $>=new Date(a)&&$<=new Date(o)}const p=parseFloat(m);return p>=parseFloat(a)&&p<=parseFloat(o)}case"is_empty":return m===""||t==null;case"is_not_empty":return m!==""&&t!=null;default:return!0}}function Sr({accountId:t,accountNumber:s,entityId:i,viewId:a,entityName:o,entityNamePlural:x,entitySlug:l}){const[j,m]=r.useState([]),[u,h]=r.useState([]),[p,$]=r.useState([]),[L,C]=r.useState([]),[E,X]=r.useState(!0),[F,y]=r.useState(null),[U,Y]=r.useState(""),[J,te]=r.useState("table"),[d,k]=r.useState(""),[re,T]=r.useState(null),[A,I]=r.useState({}),[G,Z]=r.useState(!1),[O,oe]=r.useState(new Set),[le,xe]=r.useState(!1),v=r.useRef(null),[B,H]=r.useState([]),[b,N]=r.useState({}),[P,V]=r.useState([]),[de,Q]=r.useState([]),[f,M]=r.useState(null),[n,R]=r.useState(!1),[W,se]=r.useState(null),ee=r.useRef(null),ne=r.useCallback((c,_="success")=>{ee.current&&clearTimeout(ee.current),se({message:c,type:_}),ee.current=setTimeout(()=>se(null),2500)},[]),[q,g]=r.useState({columns:[],sort:{field:"createdAt",direction:"desc"},density:"normal",pageSize:10,titleDisplay:"icon",showSidebar:!1,sidebarWidth:280,viewMode:null,enabledViews:["table","kanban","notes","calendar"]}),[w,K]=r.useState({page:1,limit:10,total:0,pages:0}),fe=r.useRef(null),be=r.useCallback(async()=>{var c,_;try{X(!0),y(null);const z=new URLSearchParams({limit:1e4,sort:`${q.sort.field}:${q.sort.direction}`}),D=await fetch(`/account/${s}/api/entity/${i}/views/${a}/records?${z}`,{credentials:"include"});if(!D.ok)throw new Error(`HTTP ${D.status}`);const S=await D.json();if(m(S.records||[]),h(S.records||[]),S.entity&&(T(S.entity),S.entity.icon&&k(S.entity.icon)),S.viewSettings&&I(S.viewSettings),S.filters&&H(S.filters),S.preferences)if(g(ie=>{var ae,ce;return{...ie,...S.viewTitleDisplay&&!S.preferences.titleDisplay?{titleDisplay:S.viewTitleDisplay}:{},...S.preferences,columns:(ae=S.preferences.columns)!=null&&ae.length?S.preferences.columns:((ce=S.columns)==null?void 0:ce.map(ue=>({id:ue.id,visible:!0})))||[]}}),S.preferences.pageSize&&K(ie=>({...ie,limit:S.preferences.pageSize})),S.preferences.viewMode&&te(S.preferences.viewMode),(c=S.preferences.columns)!=null&&c.length&&((_=S.columns)!=null&&_.length)){const ie=[];S.preferences.columns.forEach(ae=>{const ce=S.columns.find(ue=>ue.id===ae.id);ce&&ie.push(ce)}),S.columns.forEach(ae=>{ie.find(ce=>ce.id===ae.id)||ie.push(ae)}),C(ie)}else C(S.columns||[]);else S.columns&&(C(S.columns||[]),g(ie=>({...ie,...S.viewTitleDisplay?{titleDisplay:S.viewTitleDisplay}:{},columns:S.columns.map(ae=>({id:ae.id,visible:!0}))})))}catch(z){console.error("[RecordsGrid] Fetch error:",z),y(z.message)}finally{X(!1)}},[s,i,a,q.sort]),ke=r.useCallback(async()=>{try{const c=await fetch(`/account/${s}/api/entity/${i}/saved-views`,{credentials:"include"});if(c.ok){const _=await c.json();Q(_.views||[])}}catch(c){console.error("[RecordsGrid] Fetch saved views error:",c)}},[s,i]),he=r.useCallback(async({name:c,color:_,filters:z,fieldFilters:D})=>{try{const S=await fetch(`/account/${s}/api/entity/${i}/saved-views`,{method:"POST",headers:{"Content-Type":"application/json"},credentials:"include",body:JSON.stringify({name:c,color:_,filters:z,fieldFilters:D})});if(S.ok){const ie=await S.json();Q(ae=>[...ae,ie.view]),M(ie.view._id)}}catch(S){console.error("[RecordsGrid] Create saved view error:",S)}},[s,i]),ye=r.useCallback(async c=>{try{(await fetch(`/account/${s}/api/entity/${i}/saved-views/${c}`,{method:"DELETE",credentials:"include"})).ok&&(Q(z=>z.filter(D=>D._id!==c)),f===c&&(M(null),N({}),K(z=>({...z,page:1}))))}catch(_){console.error("[RecordsGrid] Delete saved view error:",_)}},[s,i,f]),Se=r.useCallback(async(c,_)=>{try{(await fetch(`/account/${s}/api/entity/${i}/saved-views/${c}`,{method:"PUT",headers:{"Content-Type":"application/json"},credentials:"include",body:JSON.stringify({name:_})})).ok&&Q(D=>D.map(S=>S._id===c?{...S,name:_}:S))}catch(z){console.error("[RecordsGrid] Rename saved view error:",z)}},[s,i]),pe=r.useCallback(async(c,_,z,D,S)=>{var ie;try{const ae={filters:_,fieldFilters:z||[]};if(D&&(ae.name=D),S&&(ae.color=S),(await fetch(`/account/${s}/api/entity/${i}/saved-views/${c}`,{method:"PUT",headers:{"Content-Type":"application/json"},credentials:"include",body:JSON.stringify(ae)})).ok){const ue=JSON.parse(JSON.stringify(_||{})),ge=JSON.parse(JSON.stringify(z||[]));Q(ve=>ve.map(Me=>{if(Me._id!==c)return Me;const Ae={...Me,filters:ue,fieldFilters:ge};return D&&(Ae.name=D),S&&(Ae.color=S),Ae}));const me=D||((ie=de.find(ve=>ve._id===c))==null?void 0:ie.name)||"Vue";ne(`Vue "${me}" mise à jour`)}else ne("Erreur lors de la mise à jour","error")}catch(ae){console.error("[RecordsGrid] Update saved view error:",ae),ne("Erreur lors de la mise à jour","error")}},[s,i,de,ne]),je=r.useCallback(c=>{if(!c){M(null),N({}),V([]),K(z=>({...z,page:1}));return}const _=de.find(z=>z._id===c);_&&(M(c),N(JSON.parse(JSON.stringify(_.filters||{}))),V(JSON.parse(JSON.stringify(_.fieldFilters||[]))),K(z=>({...z,page:1})))},[de]);r.useEffect(()=>{be(),ke()},[]);const Le=r.useMemo(()=>{if(!j.length)return[];const{field:c,direction:_}=q.sort,z=_==="asc"?1:-1;return[...j].sort((D,S)=>{let ie,ae;if(c==="title")ie=(D.referenceTitle||D.title||"").toLowerCase(),ae=(S.referenceTitle||S.title||"").toLowerCase();else if(c==="createdAt"||c==="updatedAt")ie=new Date(D[c]||0).getTime(),ae=new Date(S[c]||0).getTime();else{const ce=(D.customFields||[]).find(ge=>{var ve;const me=((ve=ge.field_id)==null?void 0:ve._id)||ge.field_id;return(me==null?void 0:me.toString())===c}),ue=(S.customFields||[]).find(ge=>{var ve;const me=((ve=ge.field_id)==null?void 0:ve._id)||ge.field_id;return(me==null?void 0:me.toString())===c});ie=((ce==null?void 0:ce.value)||"").toString().toLowerCase(),ae=((ue==null?void 0:ue.value)||"").toString().toLowerCase()}return ie<ae?-1*z:ie>ae?1*z:0})},[j,q.sort.field,q.sort.direction]),Ce=r.useMemo(()=>Le.map(c=>({...c,_searchIndex:[c.title||"",c.referenceTitle||"",c.computedTitle||"",...(c.customFields||[]).map(_=>_.value||"")].join(" ").toLowerCase()})),[Le]),Te=r.useCallback((c,_,z,D)=>{let S=c;if(_&&_.trim()){const ae=_.toLowerCase();S=S.filter(ce=>ce._searchIndex.includes(ae))}const ie=Object.keys(z).filter(ae=>ae!=="__favourites");return ie.length>0&&(S=S.filter(ae=>{const ce=ae.classificationValues||[];return ie.every(ue=>{const ge=z[ue];return!ge||ge.length===0?!0:ce.some(me=>{var ve,Me;return((ve=me.classificationId)==null?void 0:ve.toString())===ue&&ge.includes((Me=me.optionId)==null?void 0:Me.toString())})})})),D&&D.length>0&&(S=S.filter(ae=>{const ce=[[D[0]]];for(let ue=1;ue<D.length;ue++)(D[ue].logic||"AND")==="OR"?ce.push([D[ue]]):ce[ce.length-1].push(D[ue]);return ce.some(ue=>ue.every(ge=>{const me=Cr(ae,ge.fieldId);return Nr(me,ge)}))})),S},[]),$e=r.useCallback(c=>{var z;const _=typeof c=="string"?c:((z=c==null?void 0:c.target)==null?void 0:z.value)||"";Y(_),K(D=>({...D,page:1}))},[]),nt=r.useCallback(c=>{N(c),K(_=>({..._,page:1}))},[]),ot=r.useCallback(c=>{V(c),K(_=>({..._,page:1}))},[]);r.useEffect(()=>{const c=Te(Ce,U,b,P);h(c)},[Ce,U,b,P,Te]),r.useEffect(()=>{const c=(w.page-1)*w.limit,_=c+w.limit,z=u.slice(c,_);$(z),K(D=>({...D,total:u.length,pages:Math.ceil(u.length/w.limit)}))},[u,w.page,w.limit]);const Ee=r.useCallback(async c=>{try{await fetch(`/account/${s}/api/user/view-preferences`,{method:"POST",headers:{"Content-Type":"application/json"},credentials:"include",body:JSON.stringify({viewId:a,preferences:c})})}catch(_){console.error("[RecordsGrid] Save preferences error:",_)}},[s,a]),we=r.useCallback((c,_)=>{const z={...q,[c]:_};g(z),Ee(z),c==="pageSize"&&K(D=>({...D,limit:_,page:1}))},[q,Ee]),lt=r.useCallback(c=>{te(c),g(_=>{const z={..._,viewMode:c};return Ee(z),z})},[Ee]),dt=r.useCallback(c=>{I(c||{}),Z(!1),ne("Pipeline mise à jour"),be()},[be,ne]),ze=r.useCallback(c=>{K(_=>({..._,page:c}))},[]),ct=r.useCallback((c,_,z)=>{if(z&&v.current!==null&&v.current!==_){const D=Math.min(v.current,_),S=Math.max(v.current,_);oe(ie=>{const ae=new Set(ie);for(let ce=D;ce<=S;ce++)p[ce]&&ae.add(p[ce]._id);return ae})}else oe(D=>{const S=new Set(D);return S.has(c)?S.delete(c):S.add(c),S});v.current=_},[p]),ut=r.useCallback(()=>{oe(c=>{const _=p.map(S=>S._id),z=_.every(S=>c.has(S)),D=new Set(c);return z?_.forEach(S=>D.delete(S)):_.forEach(S=>D.add(S)),D})},[p]),pt=r.useCallback(()=>{oe(c=>{const _=u.map(z=>z._id);return c.size===_.length?new Set:new Set(_)})},[u]),ft=r.useCallback(()=>{oe(new Set)},[]),xt=r.useMemo(()=>p.length===0?!1:p.every(c=>O.has(c._id)),[p,O]),ht=r.useCallback(async()=>{if(!(O.size===0||!(typeof Swal<"u"?await Swal.fire({title:"Confirmer la suppression",html:`<p>Vous allez supprimer <strong>${O.size}</strong> enregistrement(s).</p><p style="color:#e7515a;font-size:13px;margin-top:8px;">Cette action est irréversible.</p>`,icon:"warning",showCancelButton:!0,confirmButtonColor:"#e7515a",cancelButtonText:"Annuler",confirmButtonText:"Supprimer"}).then(_=>_.isConfirmed):confirm(`Supprimer ${O.size} enregistrement(s) ?`)))){xe(!0);try{const z=await(await fetch(`/account/${s}/record/api/bulk-delete`,{method:"POST",headers:{"Content-Type":"application/json"},credentials:"include",body:JSON.stringify({ids:[...O]})})).json();z.success?(m(D=>D.filter(S=>!O.has(S._id))),oe(new Set),ne(`${z.deletedCount} enregistrement(s) supprimé(s)`)):ne(z.error||"Erreur lors de la suppression","error")}catch(_){console.error("[RecordsGrid] Bulk delete error:",_),ne("Erreur lors de la suppression","error")}finally{xe(!1)}}},[O,s,ne]),gt=r.useCallback((c,_)=>{C(z=>{const D=z.findIndex(ue=>ue.id===c),S=z.findIndex(ue=>ue.id===_);if(D===-1||S===-1)return z;const ie=[...z],[ae]=ie.splice(D,1);ie.splice(S,0,ae);const ce=ie.map(ue=>q.columns.find(me=>me.id===ue.id)||{id:ue.id,visible:!0});return we("columns",ce),ie})},[q.columns,we]),qe=r.useMemo(()=>{switch(q.density){case"compact":return 36;case"comfortable":return 56;default:return 44}},[q.density]),Oe=vt({count:p.length,getScrollElement:()=>fe.current,estimateSize:()=>qe,overscan:10});r.useEffect(()=>{Oe.measure()},[qe,Oe]);const mt=r.useMemo(()=>{var z;let c;(z=q.columns)!=null&&z.length?c=L.filter(D=>{const S=q.columns.find(ie=>ie.id===D.id);return S?S.visible!==!1:!0}):c=L;const _=c.findIndex(D=>D.id==="actions");if(_>-1&&_<c.length-1){const[D]=c.splice(_,1);c=[...c,D]}return c},[L,q.columns]);return E&&p.length===0?e.jsx("div",{className:"flex items-center justify-center h-64",children:e.jsx("div",{className:"animate-spin rounded-full h-8 w-8 border-b-2 border-primary"})}):F&&p.length===0?e.jsx("div",{className:"flex items-center justify-center h-64 text-danger",children:e.jsxs("span",{children:["Erreur: ",F]})}):e.jsxs("div",{className:"relative flex h-full gap-5 sm:min-h-0",children:[e.jsx(pr,{entityName:o,entityNamePlural:x,entityIcon:d,accountNumber:s,entitySlug:l,showSidebar:q.showSidebar!==!1,onToggleSidebar:()=>we("showSidebar",!q.showSidebar),filters:B,activeFilters:b,onFilterChange:nt,columns:L,fieldFilters:P,onFieldFiltersChange:ot,allRecords:j,sidebarWidth:q.sidebarWidth,onSidebarWidthChange:c=>we("sidebarWidth",c)}),e.jsxs("div",{className:`panel p-4 flex-1 flex flex-col h-full ${J==="calendar"?"overflow-auto":"overflow-hidden"}`,children:[e.jsx(Rt,{searchQuery:U,onSearch:$e,columns:L,preferences:q,onPreferencesChange:we,loading:E,accountNumber:s,entitySlug:l,viewId:a,showSidebar:q.showSidebar!==!1,onToggleSidebar:()=>we("showSidebar",!q.showSidebar),activeView:J,onViewChange:lt,enabledViews:q.enabledViews||["table","kanban","notes"],onEnabledViewsChange:c=>we("enabledViews",c),hasActiveFilters:Object.keys(b).filter(c=>c!=="__favourites").length>0||P.length>0,onOpenSaveView:()=>R(!0),onOpenPipelineConfig:()=>Z(!0)}),e.jsx(hr,{savedViews:de,activeViewId:f,onSelectView:je,onCreateView:he,onDeleteView:ye,onRenameView:Se,onUpdateViewFilters:pe,hasActiveFilters:Object.keys(b).filter(c=>c!=="__favourites").length>0||P.length>0,activeFilters:b,fieldFilters:P,sidebarFilters:B,columns:L,externalOpenCreate:n,onCloseExternalCreate:()=>R(!1)}),e.jsx("div",{className:`flex-1 flex flex-col mt-4 ${J==="calendar"?"overflow-auto":"overflow-hidden"}`,children:J==="kanban"?e.jsx(Ht,{records:u,columns:L,accountNumber:s,entitySlug:l,viewId:a,entityData:re,kanbanFieldId:A.kanbanField||"status",kanbanTagFieldIds:A.kanbanTagFields||[]}):J==="calendar"?e.jsx(lr,{records:u,columns:L,accountNumber:s,entitySlug:l,entityData:re}):J==="notes"?e.jsx(Qt,{records:u,accountNumber:s,entitySlug:l}):e.jsxs("div",{className:"dataTable-wrapper flex-1 flex flex-col overflow-hidden",children:[e.jsx("div",{className:"dataTable-container flex-1 overflow-auto relative",ref:fe,children:e.jsx(Wt,{records:p,columns:mt,virtualizer:Oe,sort:q.sort,onSort:c=>{const _=q.sort.field===c&&q.sort.direction==="asc"?"desc":"asc";we("sort",{field:c,direction:_})},onColumnReorder:gt,density:q.density,titleDisplay:q.titleDisplay||"avatar",entityIcon:d,accountNumber:s,entitySlug:l,selectedIds:O,onToggleSelect:ct,onSelectAll:ut,allPageSelected:xt,showCheckboxes:q.showCheckboxes!==!1})}),e.jsxs("div",{className:"dataTable-bottom flex items-center justify-between border-t pt-4 dark:border-gray-800",children:[e.jsxs("div",{className:"dataTable-info text-gray-500 dark:text-gray-400",children:["Affichage de ",(w.page-1)*w.limit+1," à ",Math.min(w.page*w.limit,w.total)," sur ",w.total]}),e.jsx("nav",{className:"dataTable-pagination",children:e.jsxs("ul",{className:"inline-flex items-center space-x-1 rtl:space-x-reverse",children:[e.jsx("li",{children:e.jsx("button",{onClick:()=>ze(w.page-1),disabled:w.page<=1,className:"flex justify-center font-semibold p-2 rounded-full transition bg-white-light text-dark hover:text-white hover:bg-primary dark:text-white-light dark:bg-[#191e3a] dark:hover:bg-primary disabled:opacity-50",children:"«"})}),Array.from({length:Math.min(w.pages,5)},(c,_)=>{let z;return w.pages<=5||w.page<=3?z=_+1:w.page>=w.pages-2?z=w.pages-4+_:z=w.page-2+_,e.jsx("li",{children:e.jsx("button",{onClick:()=>ze(z),className:`flex justify-center font-semibold px-3.5 py-2 rounded-full transition ${z===w.page?"bg-primary text-white dark:bg-primary dark:text-white-light":"bg-white-light text-dark hover:text-white hover:bg-primary dark:text-white-light dark:bg-[#191e3a] dark:hover:bg-primary"}`,children:z})},z)}),e.jsx("li",{children:e.jsx("button",{onClick:()=>ze(w.page+1),disabled:w.page>=w.pages,className:"flex justify-center font-semibold p-2 rounded-full transition bg-white-light text-dark hover:text-white hover:bg-primary dark:text-white-light dark:bg-[#191e3a] dark:hover:bg-primary disabled:opacity-50",children:"»"})})]})})]})]})})]}),e.jsx(jr,{open:G,accountNumber:s,entityId:i,entityData:re,viewId:a,viewSettings:A,onClose:()=>Z(!1),onSaved:dt}),O.size>0&&e.jsxs("div",{className:"bulk-action-bar",style:{position:"fixed",bottom:"24px",left:"50%",transform:"translateX(-50%)",zIndex:99999,display:"flex",alignItems:"center",gap:"12px",padding:"10px 20px",borderRadius:"14px",background:"linear-gradient(135deg, #1b2e4b 0%, #0e1726 100%)",boxShadow:"0 8px 32px rgba(0,0,0,0.3), 0 0 0 1px rgba(67,97,238,0.2)",animation:"bulkBarSlideUp 0.3s cubic-bezier(0.16,1,0.3,1)",backdropFilter:"blur(12px)"},children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"8px"},children:[e.jsx("div",{style:{width:28,height:28,borderRadius:"8px",background:"rgba(67,97,238,0.2)",color:"#4361ee",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"12px",fontWeight:700},children:O.size}),e.jsxs("span",{style:{color:"#e0e6ed",fontSize:"13px",fontWeight:500,whiteSpace:"nowrap"},children:["sélectionné",O.size>1?"s":""]})]}),e.jsx("div",{style:{width:1,height:24,background:"rgba(255,255,255,0.1)"}}),O.size<u.length&&e.jsxs("button",{onClick:pt,style:{padding:"6px 12px",borderRadius:"8px",border:"1px solid rgba(67,97,238,0.3)",background:"rgba(67,97,238,0.1)",color:"#93b4fd",fontSize:"12px",fontWeight:600,cursor:"pointer",transition:"all 0.15s",whiteSpace:"nowrap"},onMouseEnter:c=>{c.target.style.background="rgba(67,97,238,0.2)",c.target.style.color="#b8cffe"},onMouseLeave:c=>{c.target.style.background="rgba(67,97,238,0.1)",c.target.style.color="#93b4fd"},children:["Tout sélectionner (",u.length,")"]}),e.jsx("div",{style:{width:1,height:24,background:"rgba(255,255,255,0.1)"}}),e.jsxs("button",{onClick:ht,disabled:le,style:{display:"flex",alignItems:"center",gap:"6px",padding:"6px 14px",borderRadius:"8px",border:"none",background:"rgba(231,81,90,0.15)",color:"#ff6b6b",fontSize:"12px",fontWeight:600,cursor:le?"wait":"pointer",transition:"all 0.15s",whiteSpace:"nowrap",opacity:le?.6:1},onMouseEnter:c=>{le||(c.target.style.background="rgba(231,81,90,0.25)",c.target.style.color="#ff8a8a")},onMouseLeave:c=>{c.target.style.background="rgba(231,81,90,0.15)",c.target.style.color="#ff6b6b"},children:[e.jsxs("svg",{viewBox:"0 0 24 24",fill:"none",style:{width:14,height:14},children:[e.jsx("path",{d:"M20.5 6H3.5",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"}),e.jsx("path",{d:"M18.833 8.5L18.373 15.4C18.196 18.054 18.108 19.381 17.243 20.19C16.378 21 15.048 21 12.387 21H11.613C8.952 21 7.622 21 6.757 20.19C5.892 19.381 5.804 18.054 5.627 15.4L5.167 8.5",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"})]}),le?"Suppression...":"Supprimer"]}),e.jsx("div",{style:{width:1,height:24,background:"rgba(255,255,255,0.1)"}}),e.jsx("button",{onClick:ft,style:{width:28,height:28,borderRadius:"8px",border:"none",background:"rgba(255,255,255,0.08)",color:"#888ea8",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",transition:"all 0.15s"},onMouseEnter:c=>{c.target.style.background="rgba(255,255,255,0.15)",c.target.style.color="#e0e6ed"},onMouseLeave:c=>{c.target.style.background="rgba(255,255,255,0.08)",c.target.style.color="#888ea8"},title:"Désélectionner tout",children:e.jsx("svg",{viewBox:"0 0 24 24",fill:"none",style:{width:14,height:14},children:e.jsx("path",{d:"M18 6L6 18M6 6L18 18",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round"})})})]}),W&&e.jsxs("div",{style:{position:"fixed",bottom:O.size>0?"80px":"24px",right:"24px",zIndex:99999,padding:"10px 20px",borderRadius:"10px",fontSize:"13px",fontWeight:500,color:"#fff",background:W.type==="error"?"#e7515a":"#00ab55",boxShadow:"0 4px 20px rgba(0,0,0,0.15)",animation:"toastSlideIn 0.25s ease-out",display:"flex",alignItems:"center",gap:"8px",transition:"bottom 0.3s ease"},children:[e.jsx("svg",{viewBox:"0 0 24 24",fill:"none",style:{width:16,height:16,flexShrink:0},children:W.type==="error"?e.jsx("path",{d:"M12 8V12M12 16H12.01M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"}):e.jsx("path",{d:"M5 13L9 17L19 7",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round"})}),W.message]}),e.jsx("style",{children:`
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
            `})]})}function rt(){document.querySelectorAll('[data-island="records-grid"]').forEach(t=>{if(t.dataset.mounted==="1")return;t.dataset.mounted="1";const s={accountId:t.dataset.accountId,accountNumber:t.dataset.accountNumber,entityId:t.dataset.entityId,viewId:t.dataset.viewId,entityName:t.dataset.entityName||"Records",entityNamePlural:t.dataset.entityNamePlural||"",entitySlug:t.dataset.entitySlug||"records"};console.log("[RecordsGrid Island] Mounting:",s),bt(t).render(e.jsx(Fe.StrictMode,{children:e.jsx(Sr,{...s})}))})}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",rt):rt();
