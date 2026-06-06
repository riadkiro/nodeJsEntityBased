import{r as s,j as e,a as Me,R as We,c as Ft}from"./chunks/client-CkWOIrXP.js";import{u as Rt}from"./chunks/index-CjVSFo3p.js";import{r as we,c as Se}from"./chunks/recordLinks-DUrwwpKP.js";import{C as xt}from"./chunks/CardRenderer-Bls-eMou.js";import{u as Wt,a as He,D as Ot,c as zt,b as At,d as Vt,s as Bt,K as Pt,T as Dt,M as Ht,e as Jt,S as qt,v as Ut,f as Kt,C as Yt}from"./chunks/sortable.esm-DQ9-A8Dw.js";const rt=[{id:"table",label:"Tableau",icon:e.jsxs("svg",{viewBox:"0 0 24 24",fill:"none",className:"h-4 w-4",children:[e.jsx("path",{d:"M3 7H21",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"}),e.jsx("path",{d:"M3 12H21",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"}),e.jsx("path",{d:"M3 17H21",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"})]})},{id:"kanban",label:"Kanban",icon:e.jsxs("svg",{viewBox:"0 0 24 24",fill:"none",className:"h-4 w-4",children:[e.jsx("rect",{x:"3",y:"3",width:"5",height:"18",rx:"1",stroke:"currentColor",strokeWidth:"1.5"}),e.jsx("rect",{x:"10",y:"3",width:"5",height:"12",rx:"1",stroke:"currentColor",strokeWidth:"1.5"}),e.jsx("rect",{x:"17",y:"3",width:"4",height:"15",rx:"1",stroke:"currentColor",strokeWidth:"1.5"})]})},{id:"notes",label:"Notes",icon:e.jsxs("svg",{viewBox:"0 0 24 24",fill:"none",className:"h-4 w-4",children:[e.jsx("path",{d:"M2 12C2 7.28595 2 4.92893 3.46447 3.46447C4.92893 2 7.28595 2 12 2C16.714 2 19.0711 2 20.5355 3.46447C22 4.92893 22 7.28595 22 12C22 16.714 22 19.0711 20.5355 20.5355C19.0711 22 16.714 22 12 22C7.28595 22 4.92893 22 3.46447 20.5355C2 19.0711 2 16.714 2 12Z",stroke:"currentColor",strokeWidth:"1.5"}),e.jsx("path",{opacity:"0.5",d:"M2 12H22",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"}),e.jsx("path",{opacity:"0.5",d:"M12 2V22",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"})]})},{id:"calendar",label:"Calendrier",icon:e.jsxs("svg",{viewBox:"0 0 24 24",fill:"none",className:"h-4 w-4",children:[e.jsx("rect",{x:"3",y:"4",width:"18",height:"18",rx:"2",stroke:"currentColor",strokeWidth:"1.5"}),e.jsx("path",{d:"M16 2V6M8 2V6M3 10H21",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"}),e.jsx("circle",{cx:"12",cy:"16",r:"1",fill:"currentColor"}),e.jsx("circle",{cx:"16",cy:"16",r:"1",fill:"currentColor"}),e.jsx("circle",{cx:"8",cy:"16",r:"1",fill:"currentColor"})]})}];function Zt({searchQuery:t,onSearch:r,columns:i,preferences:a,onPreferencesChange:l,loading:v,accountNumber:n,entitySlug:b,viewId:m,showSidebar:p,onToggleSidebar:g,activeView:x,onViewChange:T,enabledViews:k=["table","kanban","notes"],onEnabledViewsChange:N,hasActiveFilters:R=!1,onOpenViewFilters:Q,onOpenPipelineConfig:w}){var ae,f,I;const[U,D]=s.useState(!1),[se,Y]=s.useState(!1),[ee,P]=s.useState(!1),[u,V]=s.useState(!1),[S,C]=s.useState(""),c=s.useRef(null),z=s.useRef(null),H=s.useRef(null),te=s.useRef(null),K=s.useRef(null),de=s.useRef(null),pe=s.useRef(null),L=s.useRef(null),j=()=>{D(!1),Y(!1),P(!1),V(!1)};s.useEffect(()=>{const o=B=>{B.key==="Escape"&&j()};return document.addEventListener("keydown",o),()=>document.removeEventListener("keydown",o)},[]);const E=(o,B,q,X)=>{s.useEffect(()=>{const J=G=>{o&&B.current&&!B.current.contains(G.target)&&q.current&&!q.current.contains(G.target)&&X(!1)};return o&&setTimeout(()=>document.addEventListener("mousedown",J),0),()=>document.removeEventListener("mousedown",J)},[o])};E(U,K,c,D),E(se,de,z,Y),E(ee,pe,H,P),E(u,L,te,V);const y=o=>{if(o==="table")return;const B=k.includes(o)?k.filter(q=>q!==o):[...k,o];N(B),x===o&&!B.includes(o)&&T("table")},M=rt.filter(o=>k.includes(o.id)),W=o=>{const B=a.columns.some(X=>X.id===o);let q;B?q=a.columns.map(X=>X.id===o?{...X,visible:!X.visible}:X):q=[...a.columns,{id:o,visible:!1}],l("columns",q)},$=o=>{if(!(o!=null&&o.current))return{top:0,right:0};const B=o.current.getBoundingClientRect();return{top:B.bottom+8,right:window.innerWidth-B.right}},ne=S.trim()?i.filter(o=>o.name.toLowerCase().includes(S.toLowerCase())):i;return e.jsxs("div",{className:"dataTable-top flex flex-col items-stretch mb-0 justify-between gap-2 sm:flex-row sm:items-center",children:[e.jsxs("div",{className:"flex w-full min-w-0 flex-wrap items-center gap-2 sm:w-auto sm:flex-nowrap",children:[e.jsxs("button",{type:"button",onClick:async()=>{try{const B=await(await fetch(`/account/${n}/record/api/create-draft`,{method:"POST",headers:{"Content-Type":"application/json"},credentials:"include",body:JSON.stringify({entitySlug:b,viewId:m})})).json();B.success&&B._id&&(window.location.href=we(n,b,B._id,"fiche"))}catch(o){console.error("[CreateDraft]",o)}},className:"btn-add-expandable block rounded-full p-2 bg-white-light/40 hover:bg-white-light/90 hover:text-primary dark:bg-dark/40 dark:hover:bg-dark/60",title:"Ajouter",children:[e.jsx("svg",{className:"btn-add-icon",viewBox:"0 0 24 24",fill:"none",children:e.jsx("path",{d:"M12 5V19M5 12H19",stroke:"currentColor",strokeWidth:"2.5",strokeLinecap:"round"})}),e.jsx("span",{className:"btn-add-label",children:"Ajouter"})]}),e.jsxs("div",{className:"dataTable-search relative min-w-[180px] flex-1 sm:w-64 sm:flex-none",style:{marginLeft:0},children:[e.jsxs("svg",{className:"absolute left-4 top-1/2 ml-2 -translate-y-1/2 h-4 w-4 text-gray-400",viewBox:"0 0 24 24",fill:"none",children:[e.jsx("circle",{cx:"11",cy:"11",r:"8",stroke:"currentColor",strokeWidth:"1.5"}),e.jsx("path",{d:"M16.5 16.5L21 21",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"})]}),e.jsx("input",{type:"text",value:t,onChange:o=>r(o.target.value),placeholder:"Rechercher...",className:"dataTable-input form-input w-full pl-11 pr-10",style:{"padding-left":"33px"}}),v&&e.jsx("div",{className:"absolute right-3 top-1/2 -translate-y-1/2",children:e.jsx("div",{className:"animate-spin rounded-full h-4 w-4 border-b-2 border-primary"})})]})]}),e.jsxs("div",{className:"flex w-full min-w-0 flex-wrap items-center gap-2 sm:w-auto sm:justify-end",children:[M.map(o=>e.jsx("button",{type:"button",onClick:()=>T(o.id),title:o.label,className:`block rounded-full p-2 transition-all ${x===o.id?"bg-primary/20 text-primary":"bg-white-light/40 hover:bg-white-light/90 hover:text-primary dark:bg-dark/40 dark:hover:bg-dark/60"}`,children:o.icon},o.id)),x==="kanban"&&e.jsx("button",{type:"button",onClick:()=>{j(),w==null||w()},className:"block rounded-full p-2 transition-all bg-white-light/40 hover:bg-white-light/90 hover:text-primary dark:bg-dark/40 dark:hover:bg-dark/60",title:"Configurer la pipeline",children:e.jsxs("svg",{className:"h-4 w-4",viewBox:"0 0 24 24",fill:"none",children:[e.jsx("path",{d:"M4 6H20M4 12H20M4 18H20",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"}),e.jsx("path",{d:"M8 4V8M15 10V14M11 16V20",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"})]})}),e.jsx("button",{ref:te,type:"button",onClick:()=>{V(!u),D(!1),Y(!1),P(!1)},className:`block rounded-full p-2 transition-all ${u?"bg-primary/20 text-primary":"bg-white-light/40 hover:bg-white-light/90 hover:text-primary dark:bg-dark/40 dark:hover:bg-dark/60"}`,title:"Configurer les vues",children:e.jsxs("svg",{className:"h-4 w-4",viewBox:"0 0 24 24",fill:"none",children:[e.jsx("circle",{cx:"12",cy:"12",r:"3",stroke:"currentColor",strokeWidth:"1.5"}),e.jsx("path",{d:"M12 2V4M12 20V22M2 12H4M20 12H22M4.93 4.93L6.34 6.34M17.66 17.66L19.07 19.07M4.93 19.07L6.34 17.66M17.66 6.34L19.07 4.93",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"})]})}),e.jsx("div",{className:"hidden w-px h-5 bg-gray-200 dark:bg-gray-700 mx-0.5 sm:block"}),e.jsx("button",{type:"button",onClick:Q,className:`block rounded-full p-2 transition-all ${R?"bg-primary/20 text-primary":"bg-white-light/40 hover:bg-white-light/90 hover:text-primary dark:bg-dark/40 dark:hover:bg-dark/60"}`,title:"Configurer les filtres de la vue",children:e.jsx("svg",{className:"h-4 w-4",viewBox:"0 0 24 24",fill:"none",children:e.jsx("path",{d:"M22 3H2L10 12.46V19L14 21V12.46L22 3Z",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round"})})}),x==="table"&&(()=>{var B,q;const o=((B=a.sort)==null?void 0:B.field)!=="createdAt"||((q=a.sort)==null?void 0:q.direction)!=="desc";return e.jsx("button",{ref:z,type:"button",onClick:()=>{Y(!se),D(!1),P(!1),V(!1)},className:`block rounded-full p-2 transition-all ${se||o?"bg-primary/20 text-primary":"bg-white-light/40 hover:bg-white-light/90 hover:text-primary dark:bg-dark/40 dark:hover:bg-dark/60"}`,title:"Trier",children:e.jsxs("svg",{className:"h-4 w-4",viewBox:"0 0 24 24",fill:"none",children:[e.jsx("path",{d:"M16 18L16 6M16 6L20 10M16 6L12 10",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round"}),e.jsx("path",{d:"M8 6L8 18M8 18L12 14M8 18L4 14",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round"})]})})})(),e.jsx("button",{ref:c,type:"button",onClick:()=>{D(!U),Y(!1),P(!1),V(!1)},className:`block rounded-full p-2 transition-all ${U?"bg-primary/20 text-primary":"bg-white-light/40 hover:bg-white-light/90 hover:text-primary dark:bg-dark/40 dark:hover:bg-dark/60"}`,title:"Mode d'affichage",children:e.jsxs("svg",{className:"h-4 w-4",viewBox:"0 0 24 24",fill:"none",children:[e.jsx("path",{d:"M3 7H21",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"}),e.jsx("path",{d:"M6 12H18",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"}),e.jsx("path",{d:"M10 17H14",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"})]})}),x==="table"&&e.jsx("button",{ref:H,type:"button",onClick:()=>{P(!ee),D(!1),Y(!1),V(!1)},className:`block rounded-full p-2 transition-all ${ee?"bg-primary/20 text-primary":"bg-white-light/40 hover:bg-white-light/90 hover:text-primary dark:bg-dark/40 dark:hover:bg-dark/60"}`,title:"Colonnes visibles",children:e.jsxs("svg",{className:"h-4 w-4",viewBox:"0 0 24 24",fill:"none",children:[e.jsx("path",{d:"M9 3H4C3.44772 3 3 3.44772 3 4V11C3 11.5523 3.44772 12 4 12H9C9.55228 12 10 11.5523 10 11V4C10 3.44772 9.55228 3 9 3Z",stroke:"currentColor",strokeWidth:"1.5"}),e.jsx("path",{d:"M20 3H15C14.4477 3 14 3.44772 14 4V7C14 7.55228 14.4477 8 15 8H20C20.5523 8 21 7.55228 21 7V4C21 3.44772 20.5523 3 20 3Z",stroke:"currentColor",strokeWidth:"1.5"}),e.jsx("path",{d:"M20 12H15C14.4477 12 14 12.4477 14 13V20C14 20.5523 14.4477 21 15 21H20C20.5523 21 21 20.5523 21 20V13C21 12.4477 20.5523 12 20 12Z",stroke:"currentColor",strokeWidth:"1.5"}),e.jsx("path",{d:"M9 16H4C3.44772 16 3 16.4477 3 17V20C3 20.5523 3.44772 21 4 21H9C9.55228 21 10 20.5523 10 20V17C10 16.4477 9.55228 16 9 16Z",stroke:"currentColor",strokeWidth:"1.5"})]})}),e.jsxs("button",{type:"button",onClick:g,className:"btn-sidebar-toggle block rounded-full p-2 bg-white-light/40 hover:bg-white-light/90 hover:text-primary dark:bg-dark/40 dark:hover:bg-dark/60",title:p?"Masquer le panneau":"Afficher le panneau",children:[e.jsxs("svg",{className:"btn-sidebar-icon",viewBox:"0 0 24 24",fill:"none",children:[e.jsx("rect",{x:"3",y:"3",width:"18",height:"18",rx:"2",stroke:"currentColor",strokeWidth:"1.5"}),e.jsx("path",{d:"M9 3V21",stroke:"currentColor",strokeWidth:"1.5"})]}),e.jsx("span",{className:"btn-sidebar-label",children:p?"Masquer":"Panneau"})]})]}),se&&Me.createPortal(e.jsxs(e.Fragment,{children:[e.jsx("div",{className:"fixed inset-0",style:{zIndex:9998},onClick:()=>Y(!1)}),e.jsxs("div",{ref:de,className:"fixed rounded-xl shadow-xl p-4 w-72 bg-white dark:bg-[#0e1726] border border-gray-100 dark:border-white/10",style:{zIndex:9999,top:$(z).top,right:$(z).right,animation:"popoverSlide 0.15s ease-out"},children:[e.jsx("div",{className:"text-xs font-medium text-gray-500 dark:text-white-dark mb-2",children:"Trier par"}),e.jsxs("div",{className:"flex gap-2",children:[e.jsxs("select",{value:((ae=a.sort)==null?void 0:ae.field)||"createdAt",onChange:o=>l("sort",{...a.sort,field:o.target.value}),className:"flex-1 px-2 py-1.5 text-xs border border-gray-200 dark:border-white/10 rounded-lg bg-white dark:bg-[#1b2e4b] text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary/50",children:[e.jsx("option",{value:"createdAt",children:"Date de création"}),e.jsx("option",{value:"title",children:"Titre"}),i.filter(o=>o.id!=="title"&&o.id!=="actions").map(o=>e.jsx("option",{value:o.id,children:o.name},o.id))]}),e.jsx("button",{onClick:()=>{var o;return l("sort",{...a.sort,direction:((o=a.sort)==null?void 0:o.direction)==="asc"?"desc":"asc"})},className:"p-1.5 border border-gray-200 dark:border-white/10 rounded-lg bg-white dark:bg-[#1b2e4b] hover:bg-gray-50 dark:hover:bg-[#253b5c] transition-all",title:((f=a.sort)==null?void 0:f.direction)==="asc"?"Croissant":"Décroissant",children:e.jsx("svg",{className:`h-4 w-4 text-gray-600 dark:text-white transition-transform ${((I=a.sort)==null?void 0:I.direction)==="asc"?"rotate-180":""}`,viewBox:"0 0 24 24",fill:"none",children:e.jsx("path",{d:"M12 5V19M12 19L6 13M12 19L18 13",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round"})})}),e.jsx("button",{onClick:()=>l("sort",{field:"createdAt",direction:"desc"}),className:"p-1.5 border border-gray-200 dark:border-white/10 rounded-lg bg-white dark:bg-[#1b2e4b] hover:bg-red-50 hover:border-red-300 hover:text-red-500 dark:hover:bg-red-900/20 transition-all",title:"Réinitialiser le tri",children:e.jsxs("svg",{className:"h-4 w-4 text-gray-600 dark:text-white",viewBox:"0 0 24 24",fill:"none",children:[e.jsx("path",{d:"M4.06189 13C4.02104 12.6724 4 12.3387 4 12C4 7.58172 7.58172 4 12 4C14.5006 4 16.7332 5.14727 18.2002 6.94416M19.9381 11C19.979 11.3276 20 11.6613 20 12C20 16.4183 16.4183 20 12 20C9.49944 20 7.26681 18.8527 5.79984 17.0558",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round"}),e.jsx("path",{d:"M15 7H19V3",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round"}),e.jsx("path",{d:"M9 17H5V21",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round"})]})})]})]})]}),document.body),U&&Me.createPortal(e.jsxs(e.Fragment,{children:[e.jsx("div",{className:"fixed inset-0",style:{zIndex:9998},onClick:()=>D(!1)}),e.jsxs("div",{ref:K,className:"fixed rounded-xl shadow-xl p-4 w-72 bg-white dark:bg-[#0e1726] border border-gray-100 dark:border-white/10",style:{zIndex:9999,top:$(c).top,right:$(c).right,animation:"popoverSlide 0.15s ease-out"},children:[e.jsxs("div",{className:"mb-4",children:[e.jsx("div",{className:"text-xs font-medium text-gray-500 dark:text-white-dark mb-2",children:"Densité"}),e.jsx("div",{className:"flex gap-1",children:["compact","normal","comfortable"].map(o=>e.jsx("button",{onClick:()=>l("density",o),className:`flex-1 px-2 py-1.5 text-xs rounded-lg transition-all ${a.density===o?"bg-primary text-white":"bg-gray-100 dark:bg-dark/40 text-gray-600 dark:text-white-dark/70 hover:bg-gray-200 dark:hover:bg-dark/60"}`,children:o==="compact"?"Compact":o==="normal"?"Normal":"Confort"},o))})]}),e.jsxs("div",{className:"mb-4",children:[e.jsx("div",{className:"text-xs font-medium text-gray-500 dark:text-white-dark mb-2",children:"Lignes par page"}),e.jsx("div",{className:"flex gap-1",children:[10,25,50,100].map(o=>e.jsx("button",{onClick:()=>l("pageSize",o),className:`flex-1 px-2 py-1.5 text-xs rounded-lg transition-all ${a.pageSize===o?"bg-primary text-white":"bg-gray-100 dark:bg-dark/40 text-gray-600 dark:text-white-dark/70 hover:bg-gray-200 dark:hover:bg-dark/60"}`,children:o},o))})]})]})]}),document.body),ee&&Me.createPortal(e.jsxs(e.Fragment,{children:[e.jsx("div",{className:"fixed inset-0",style:{zIndex:9998},onClick:()=>P(!1)}),e.jsxs("div",{ref:pe,className:"fixed rounded-xl shadow-xl p-4 w-64 bg-white dark:bg-[#0e1726] border border-gray-100 dark:border-white/10",style:{zIndex:9999,top:$(H).top,right:$(H).right,animation:"popoverSlide 0.15s ease-out"},children:[e.jsx("div",{className:"text-xs font-medium text-gray-500 dark:text-white-dark mb-2",children:"Colonnes visibles"}),e.jsx("div",{className:"relative mb-2",children:e.jsx("input",{type:"text",value:S,onChange:o=>C(o.target.value),placeholder:"Filtrer...",className:"w-full px-3 py-1.5 text-xs border border-gray-200 dark:border-white/10 rounded-lg bg-white dark:bg-[#1b2e4b] text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary/50"})}),e.jsx("div",{className:"space-y-0.5 max-h-48 overflow-y-auto",children:ne.map(o=>{const B=a.columns.find(X=>X.id===o.id),q=B?B.visible!==!1:!0;return e.jsxs("label",{className:"flex items-center gap-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 px-2 py-1.5 rounded-lg",children:[e.jsx("input",{type:"checkbox",checked:q,onChange:()=>W(o.id),className:"form-checkbox text-primary w-3.5 h-3.5 rounded"}),e.jsx("span",{className:"text-xs text-gray-700 dark:text-gray-300",children:o.name})]},o.id)})}),e.jsx("div",{className:"border-t border-gray-100 dark:border-white/10 mt-3 mb-2"}),e.jsxs("div",{children:[e.jsx("div",{className:"text-xs font-medium text-gray-500 dark:text-white-dark mb-2",children:"Affichage titre"}),e.jsx("div",{className:"flex gap-1",children:[{value:"avatar",label:"Avatar"},{value:"icon",label:"Icône"},{value:"none",label:"Aucun"}].map(o=>e.jsx("button",{onClick:()=>l("titleDisplay",o.value),className:`flex-1 px-2 py-1.5 text-xs rounded-lg transition-all ${(a.titleDisplay||"avatar")===o.value?"bg-primary text-white":"bg-gray-100 dark:bg-dark/40 text-gray-600 dark:text-white-dark/70 hover:bg-gray-200 dark:hover:bg-dark/60"}`,children:o.label},o.value))})]}),e.jsx("div",{className:"border-t border-gray-100 dark:border-white/10 mt-3 mb-2"}),e.jsx("div",{children:e.jsxs("div",{className:"flex items-center justify-between",children:[e.jsx("span",{className:"text-xs font-medium text-gray-500 dark:text-white-dark",children:"Sélection multiple"}),e.jsx("button",{type:"button",onClick:()=>l("showCheckboxes",a.showCheckboxes===!1),style:{position:"relative",width:36,height:20,borderRadius:10,border:"none",cursor:"pointer",transition:"background 0.2s ease",background:a.showCheckboxes!==!1?"#4361ee":"#d1d5db",padding:0},children:e.jsx("span",{style:{position:"absolute",top:2,left:a.showCheckboxes!==!1?18:2,width:16,height:16,borderRadius:"50%",background:"#fff",boxShadow:"0 1px 3px rgba(0,0,0,0.2)",transition:"left 0.2s ease"}})})]})})]})]}),document.body),u&&Me.createPortal(e.jsxs(e.Fragment,{children:[e.jsx("div",{className:"fixed inset-0",style:{zIndex:9998},onClick:()=>V(!1)}),e.jsxs("div",{ref:L,className:"fixed rounded-xl shadow-xl p-4 w-64 bg-white dark:bg-[#0e1726] border border-gray-100 dark:border-white/10",style:{zIndex:9999,top:$(te).top,right:$(te).right,animation:"popoverSlide 0.15s ease-out"},children:[e.jsx("div",{className:"text-xs font-medium text-gray-500 dark:text-white-dark mb-3",children:"Vues disponibles"}),e.jsx("div",{className:"space-y-1",children:rt.map(o=>{const B=k.includes(o.id),q=o.id==="table";return e.jsxs("label",{className:`flex items-center gap-3 cursor-pointer px-2 py-2 rounded-lg transition-all ${q?"opacity-60 cursor-not-allowed":"hover:bg-gray-50 dark:hover:bg-gray-800"}`,children:[e.jsx("input",{type:"checkbox",checked:B,onChange:()=>y(o.id),disabled:q,className:"form-checkbox text-primary w-4 h-4 rounded"}),e.jsxs("span",{className:`flex items-center gap-2 text-sm ${B?"text-gray-700 dark:text-gray-300":"text-gray-400 dark:text-gray-600"}`,children:[o.icon,o.label]})]},o.id)})}),e.jsx("div",{className:"border-t border-gray-100 dark:border-white/10 mt-3 pt-2",children:e.jsx("p",{className:"text-[10px] text-gray-400 dark:text-gray-600",children:"Le tableau est toujours activé par défaut."})})]})]}),document.body),e.jsx("style",{children:`
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
            `})]})}function Xt({records:t,columns:r,virtualizer:i,sort:a,onSort:l,onColumnReorder:v,density:n,titleDisplay:b,entityIcon:m,accountNumber:p,entitySlug:g,selectedIds:x,onToggleSelect:T,onSelectAll:k,allPageSelected:N,showCheckboxes:R=!0}){var P;const[Q,w]=s.useState(null),[U,D]=s.useState(null),se=i.getVirtualItems(),Y={compact:{rowHeight:36,cellClass:"py-1",fontSize:"text-xs",imageSize:"w-6 h-6",fontWeight:"font-medium"},normal:{rowHeight:44,cellClass:"py-2",fontSize:"text-sm",imageSize:"w-9 h-9",fontWeight:"font-semibold"},comfortable:{rowHeight:56,cellClass:"py-3",fontSize:"text-sm",imageSize:"w-9 h-9",fontWeight:"font-semibold"}},ee=Y[n]||Y.comfortable;return x&&x.size>0,e.jsx(e.Fragment,{children:e.jsxs("table",{className:"table-hover whitespace-nowrap dataTable-table w-full",children:[e.jsx("thead",{className:"sticky top-0 bg-white dark:bg-[#1b2e4b] z-10",children:e.jsxs("tr",{children:[R&&e.jsx("th",{style:{width:40,padding:"0 8px"},children:e.jsxs("label",{className:"bulk-checkbox-wrapper",style:{display:"flex",alignItems:"center",justifyContent:"center"},children:[e.jsx("input",{type:"checkbox",checked:N&&t.length>0,onChange:()=>k&&k(),className:"bulk-checkbox"}),e.jsx("span",{className:"bulk-checkbox-custom"})]})}),r.map(u=>{const V=(a==null?void 0:a.field)===u.id||u.id==="title"&&(a==null?void 0:a.field)==="title"||u.id==="createdAt"&&(a==null?void 0:a.field)==="createdAt",S=(a==null?void 0:a.direction)||"desc",C=Q===u.id,c=U===u.id&&Q!==u.id,z=u.id!=="actions";return e.jsx("th",{"data-sortable":u.sortable!==!1?"":void 0,"data-column-id":u.id,onDragEnter:H=>{H.preventDefault(),u.id!=="actions"&&Q&&Q!==u.id&&D(u.id)},onDragOver:H=>{H.preventDefault()},onDrop:H=>{H.preventDefault(),Q&&Q!==u.id&&u.id!=="actions"&&v&&v(Q,u.id),w(null),D(null)},className:`px-2 ${C?"opacity-50":""} ${c?"border-l-2 border-l-primary bg-primary/5":""}`,style:{transition:"opacity 0.15s, border-color 0.15s, background 0.15s",...u.id==="actions"?{width:"1%",whiteSpace:"nowrap"}:{},...u.id==="title"?{minWidth:220}:{}},children:e.jsxs("div",{className:"flex items-center gap-1",children:[z&&e.jsx("span",{draggable:"true",onDragStart:H=>{w(u.id),H.dataTransfer.effectAllowed="move",H.dataTransfer.setData("text/plain",u.id)},onDragEnd:()=>{w(null),D(null)},className:"cursor-grab text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300",children:e.jsxs("svg",{className:"h-3 w-3",viewBox:"0 0 24 24",fill:"currentColor",children:[e.jsx("circle",{cx:"9",cy:"6",r:"1.5"}),e.jsx("circle",{cx:"15",cy:"6",r:"1.5"}),e.jsx("circle",{cx:"9",cy:"12",r:"1.5"}),e.jsx("circle",{cx:"15",cy:"12",r:"1.5"}),e.jsx("circle",{cx:"9",cy:"18",r:"1.5"}),e.jsx("circle",{cx:"15",cy:"18",r:"1.5"})]})}),u.sortable!==!1?e.jsxs("a",{href:"#",className:"dataTable-sorter flex items-center gap-1",draggable:"false",onClick:H=>{H.preventDefault(),l(u.id)},children:[u.name,V&&e.jsx("svg",{className:`h-3 w-3 text-primary transition-transform ${S==="asc"?"rotate-180":""}`,viewBox:"0 0 24 24",fill:"none",children:e.jsx("path",{d:"M12 5V19M12 19L6 13M12 19L18 13",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round"})})]}):u.name]})},u.id)})]})}),e.jsxs("tbody",{children:[se.length>0&&se[0].start>0&&e.jsx("tr",{children:e.jsx("td",{colSpan:r.length+(R?1:0),style:{height:se[0].start,padding:0}})}),se.map(u=>{const V=t[u.index];if(!V)return null;const S={compact:"4px 8px",normal:"8px 12px",comfortable:"12px 12px"}[n]||"12px 12px",C=x&&x.has(V._id);return e.jsxs("tr",{"data-index":u.index,ref:i.measureElement,style:{minHeight:ee.rowHeight},className:C?"bulk-row-selected":"",children:[R&&e.jsx("td",{style:{padding:"0 8px",width:40},children:e.jsxs("label",{className:"bulk-checkbox-wrapper",style:{display:"flex",alignItems:"center",justifyContent:"center"},onClick:c=>{c.preventDefault(),T&&T(V._id,u.index,c.shiftKey)},children:[e.jsx("input",{type:"checkbox",checked:C,readOnly:!0,className:"bulk-checkbox"}),e.jsx("span",{className:"bulk-checkbox-custom"})]})}),r.map(c=>e.jsx("td",{className:`${ee.fontSize}`,style:{padding:S,...c.id==="actions"?{width:"1%",whiteSpace:"nowrap"}:{},...c.id==="title"?{minWidth:220}:{}},children:Gt(V,c,p,g,ee,b,m)},c.id))]},V._id)}),t.length===0&&e.jsx("tr",{children:e.jsx("td",{colSpan:r.length+(R?1:0),className:"text-center py-12 text-gray-500 dark:text-gray-400 font-medium",children:"Aucun enregistrement"})}),se.length>0&&e.jsx("tr",{children:e.jsx("td",{colSpan:r.length+(R?1:0),style:{height:Math.max(0,i.getTotalSize()-(((P=se[se.length-1])==null?void 0:P.end)||0)),padding:0}})})]})]})})}function Gt(t,r,i,a,l,v,n){var b,m;switch(r.id){case"title":{const p=t.referenceTitle||t.title||"Sans titre";p.charAt(0).toUpperCase();const g=Math.abs(p.charCodeAt(0)||65)%35+1,x=t.image||`/assets/images/profile-${g}.jpeg`;return e.jsxs("div",{className:"flex items-center gap-2",children:[v==="avatar"&&e.jsx("img",{src:x,alt:p,className:`${l.imageSize} rounded-full max-w-none`}),v==="icon"&&n&&e.jsx("div",{className:`${l.imageSize} rounded-lg max-w-none flex items-center justify-center bg-primary/10 text-primary shrink-0`,children:e.jsx("iconify-icon",{icon:n,width:"16"})}),e.jsx("a",{href:we(i,a,t),className:`${l.fontWeight} hover:text-primary transition-colors truncate`,title:p,children:p})]})}case"createdAt":return new Date(t.createdAt).toLocaleDateString("fr-FR");case"actions":return e.jsxs("div",{className:"flex items-center gap-0",children:[e.jsx("a",{href:we(i,a,t),className:"p-1 rounded-lg text-gray-500 hover:text-primary hover:bg-primary/10 transition-all",title:"Voir",children:e.jsxs("svg",{className:"h-4 w-4",viewBox:"0 0 24 24",fill:"none",children:[e.jsx("path",{d:"M15 12C15 13.6569 13.6569 15 12 15C10.3431 15 9 13.6569 9 12C9 10.3431 10.3431 9 12 9C13.6569 9 15 10.3431 15 12Z",stroke:"currentColor",strokeWidth:"1.5"}),e.jsx("path",{d:"M12 5C7.5 5 3.73 7.94 2 12C3.73 16.06 7.5 19 12 19C16.5 19 20.27 16.06 22 12C20.27 7.94 16.5 5 12 5Z",stroke:"currentColor",strokeWidth:"1.5"})]})}),e.jsx("a",{href:we(i,a,t),className:"p-1 rounded-lg text-gray-500 hover:text-info hover:bg-info/10 transition-all",title:"Modifier",children:e.jsx("svg",{className:"h-4 w-4",viewBox:"0 0 24 24",fill:"none",children:e.jsx("path",{d:"M16.862 4.487L18.55 2.8C19.33 2.02 20.59 2.02 21.37 2.8C22.15 3.58 22.15 4.84 21.37 5.62L19.681 7.307M16.862 4.487L4.162 17.187C3.882 17.467 3.682 17.818 3.592 18.198L2.732 21.596C2.642 21.966 2.952 22.296 3.322 22.226L6.892 21.556C7.242 21.486 7.572 21.306 7.832 21.046L20.513 8.366M16.862 4.487L19.681 7.307",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round"})})}),e.jsx("button",{type:"button",className:"p-1 rounded-lg text-gray-500 hover:text-danger hover:bg-danger/10 transition-all",title:"Supprimer",onClick:()=>{confirm("Êtes-vous sûr de vouloir supprimer cet enregistrement ?")&&console.log("Delete record:",t._id)},children:e.jsxs("svg",{className:"h-4 w-4",viewBox:"0 0 24 24",fill:"none",children:[e.jsx("path",{d:"M20.5 6H3.5",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"}),e.jsx("path",{d:"M18.833 8.5L18.373 15.4C18.196 18.054 18.108 19.381 17.243 20.19C16.378 21 15.048 21 12.387 21H11.613C8.952 21 7.622 21 6.757 20.19C5.892 19.381 5.804 18.054 5.627 15.4L5.167 8.5",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"}),e.jsx("path",{d:"M9.5 11L10 16",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"}),e.jsx("path",{d:"M14.5 11L14 16",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"}),e.jsx("path",{d:"M6.5 6C6.556 5.367 6.612 5.1 6.877 4.714C7.178 4.275 7.945 3.917 9.484 3.2L9.924 2.984C10.683 2.589 11.06 2.392 11.476 2.318C11.823 2.254 12.177 2.254 12.524 2.318C12.94 2.392 13.317 2.589 14.076 2.984L14.516 3.2C16.055 3.917 16.822 4.275 17.123 4.714C17.388 5.1 17.444 5.367 17.5 6",stroke:"currentColor",strokeWidth:"1.5"})]})})]});default:{if(r.id.startsWith("rel:")){const p=r.id.substring(4),x=(((b=t._denorm)==null?void 0:b.relations)||[]).find(k=>k.relationKey===p);if(((m=x==null?void 0:x.records)==null?void 0:m.length)>0)return e.jsx("div",{className:"flex flex-wrap gap-1",children:x.records.map((k,N)=>e.jsx("a",{href:we(i,k.entitySlug||r.targetEntitySlug||a,k),className:"text-primary hover:underline text-xs",children:k.title||"Sans titre"},N))});const T=(t.relations||[]).find(k=>k.relationKey===p);return T!=null&&T.value?"—":""}if(r.id.startsWith("classif:")){const p=r.id.substring(8),g=(t.classificationValues||[]).find(x=>{var k,N,R;return(((k=x.classificationId)==null?void 0:k.$oid)||((R=(N=x.classificationId)==null?void 0:N.toString)==null?void 0:R.call(N))||x.classificationId)===p});if(g!=null&&g.label){const x=g.color||"#888";return e.jsx("span",{className:"inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap",style:{backgroundColor:`${x}15`,color:x,border:`1px solid ${x}30`},children:g.label})}return g!=null&&g.value?e.jsx("span",{className:"inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20",children:g.value}):""}if(r.computed&&t._computedFields){const p=t._computedFields[r.id];if(!p||p.value===null||p.value===void 0)return"—";const g=r.computedDisplay||"text",x=r.computedColor||"#4361ee";if(g==="badge")return e.jsx("span",{className:"inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap",style:{background:`${x}15`,color:x,border:`1px solid ${x}30`},children:p.formatted||p.value});if(g==="currency")return e.jsx("span",{style:{fontWeight:600,color:"#334155"},children:p.formatted||`${Number(p.value).toFixed(2)} €`});if(g==="stars"){const T=Number(p.value)||0,k=Number(p.max)||5;return e.jsxs("span",{style:{display:"inline-flex",alignItems:"center",gap:1},children:[Array.from({length:Math.floor(T)}).map((N,R)=>e.jsx("iconify-icon",{icon:"solar:star-bold",width:"14",style:{color:"#f59e0b"}},`f${R}`)),T-Math.floor(T)>=.5&&e.jsx("iconify-icon",{icon:"solar:star-bold-duotone",width:"14",style:{color:"#f59e0b"}}),Array.from({length:k-Math.ceil(T)}).map((N,R)=>e.jsx("iconify-icon",{icon:"solar:star-line-duotone",width:"14",style:{color:"#e2e8f0"}},`e${R}`)),e.jsx("span",{style:{fontSize:11,color:"#9ca3af",marginLeft:4},children:p.formatted})]})}if(g==="progress"){const T=Math.min(Math.max(Number(p.percentage||p.value)||0,0),100),k=T>=80?"#10b981":T>=50?"#f59e0b":"#ef4444";return e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:6,minWidth:80},children:[e.jsx("div",{style:{flex:1,height:5,background:"#e2e8f0",borderRadius:3,overflow:"hidden"},children:e.jsx("div",{style:{width:`${T}%`,height:"100%",background:k,borderRadius:3}})}),e.jsxs("span",{style:{fontSize:11,fontWeight:600,color:k},children:[T,"%"]})]})}return p.formatted||p.value||""}if(t.customFields){const p=t.customFields.find(x=>{var k;const T=((k=x.field_id)==null?void 0:k._id)||x.field_id;return(T==null?void 0:T.toString())===r.id});if(!p)return"";const g=p.value;if(g&&typeof g=="object"&&g._v){const x=[];return Object.entries(g).forEach(([T,k])=>{T==="_v"||T==="customText"||(Array.isArray(k)?k.forEach(N=>x.push(N)):k&&x.push(k))}),g.customText&&x.push(g.customText),e.jsx("div",{className:"flex flex-wrap gap-1",children:x.map((T,k)=>e.jsx("span",{className:"inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20",children:T},k))})}return g||""}return""}}}function st(t,r=.1){if(!t)return`rgba(99, 102, 241, ${r})`;const i=parseInt(t.slice(1,3),16),a=parseInt(t.slice(3,5),16),l=parseInt(t.slice(5,7),16);return`rgba(${i}, ${a}, ${l}, ${r})`}function Qt({field:t,record:r}){const i=(r.customFields||[]).find(l=>{var n;const v=((n=l.field_id)==null?void 0:n._id)||l.field_id;return(v==null?void 0:v.toString())===t.id});if(!i)return e.jsx("span",{className:"text-gray-400 dark:text-gray-600 text-sm italic",children:"—"});const a=i.value;if(a==null||a==="")return e.jsx("span",{className:"text-gray-400 dark:text-gray-600 text-sm italic",children:"—"});if(t.type==="date"||t.type==="datetime")try{return e.jsx("span",{className:"text-sm text-gray-700 dark:text-gray-300",children:new Date(a).toLocaleDateString("fr-FR")})}catch{return e.jsx("span",{className:"text-sm text-gray-700 dark:text-gray-300",children:String(a)})}return t.type==="boolean"||t.type==="checkbox"?e.jsxs("span",{className:`inline-flex items-center gap-1 text-sm ${a?"text-success":"text-gray-400"}`,children:[a?e.jsxs("svg",{width:"16",height:"16",viewBox:"0 0 24 24",fill:"none",children:[e.jsx("path",{d:"M9 12l2 2 4-4",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round"}),e.jsx("circle",{cx:"12",cy:"12",r:"10",stroke:"currentColor",strokeWidth:"1.5"})]}):e.jsx("svg",{width:"16",height:"16",viewBox:"0 0 24 24",fill:"none",children:e.jsx("circle",{cx:"12",cy:"12",r:"10",stroke:"currentColor",strokeWidth:"1.5"})}),a?"Oui":"Non"]}):t.type==="relation"?Array.isArray(a)?e.jsx("div",{className:"flex flex-wrap gap-1",children:a.map((l,v)=>e.jsx("span",{className:"inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-primary/10 text-primary font-medium",children:l.title||l.label||l.name||String(l)},v))}):e.jsx("span",{className:"text-sm text-gray-700 dark:text-gray-300",children:a.title||a.label||String(a)}):t.type==="number"?e.jsx("span",{className:"text-sm font-mono text-gray-700 dark:text-gray-300",children:Number(a).toLocaleString("fr-FR")}):e.jsx("span",{className:"text-sm text-gray-700 dark:text-gray-300",children:String(a)})}function er({record:t,columns:r,accountNumber:i,entitySlug:a,onClose:l}){var Q;const v=s.useRef(null),[n,b]=s.useState(!1);s.useEffect(()=>{requestAnimationFrame(()=>b(!0))},[]);const m=s.useCallback(()=>{b(!1),setTimeout(()=>l(),250)},[l]);if(s.useEffect(()=>{const w=U=>{U.key==="Escape"&&m()};return document.addEventListener("keydown",w),()=>document.removeEventListener("keydown",w)},[m]),!t)return null;(Q=t._id)!=null&&Q.$oid||t._id;const p=t.referenceTitle||t.title||t.computedTitle||"Sans titre",g=t.description||"",x=t.createdAt?new Date(t.createdAt).toLocaleDateString("fr-FR",{day:"2-digit",month:"long",year:"numeric"}):null,T=t.updatedAt?new Date(t.updatedAt).toLocaleDateString("fr-FR",{day:"2-digit",month:"long",year:"numeric"}):null,k=(t.classificationValues||[]).filter(w=>w.optionLabel||w.label).map(w=>({label:w.optionLabel||w.label,color:w.optionColor||w.color||"#6366f1",classificationName:w.classificationName||"Classification"})),N={};k.forEach(w=>{N[w.classificationName]||(N[w.classificationName]=[]),N[w.classificationName].push(w)});const R=r.filter(w=>w.id!=="title"&&w.id!=="actions"&&!w.id.startsWith("class:"));return Me.createPortal(e.jsxs(e.Fragment,{children:[e.jsx("div",{className:`fixed inset-0 bg-black/40 backdrop-blur-[2px] transition-opacity duration-250 ${n?"opacity-100":"opacity-0"}`,style:{zIndex:1e4},onMouseDown:m,onTouchEnd:w=>{w.preventDefault(),m()}}),e.jsxs("div",{ref:v,className:`fixed right-0 top-0 h-full bg-white dark:bg-[#0e1726] shadow-2xl border-l border-gray-200 dark:border-gray-700 flex flex-col transition-transform duration-250 ease-out ${n?"translate-x-0":"translate-x-full"}`,style:{zIndex:10001,width:"min(520px, 90vw)"},onClick:w=>w.stopPropagation(),children:[e.jsxs("div",{className:"flex items-center justify-between gap-3 px-6 py-4 border-b border-gray-100 dark:border-gray-700/50 flex-shrink-0",children:[e.jsxs("div",{className:"flex items-center gap-2 min-w-0",children:[e.jsx("div",{className:"w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0",children:e.jsxs("svg",{width:"16",height:"16",viewBox:"0 0 24 24",fill:"none",children:[e.jsx("path",{d:"M2 12C2 7.28595 2 4.92893 3.46447 3.46447C4.92893 2 7.28595 2 12 2C16.714 2 19.0711 2 20.5355 3.46447C22 4.92893 22 7.28595 22 12C22 16.714 22 19.0711 20.5355 20.5355C19.0711 22 16.714 22 12 22C7.28595 22 4.92893 22 3.46447 20.5355C2 19.0711 2 16.714 2 12Z",stroke:"#4361ee",strokeWidth:"1.5"}),e.jsx("path",{d:"M8 12H16M12 8V16",stroke:"#4361ee",strokeWidth:"1.5",strokeLinecap:"round"})]})}),e.jsx("h3",{className:"text-base font-semibold text-gray-900 dark:text-white truncate",children:p})]}),e.jsxs("div",{className:"flex items-center gap-1 flex-shrink-0",children:[e.jsx("a",{href:we(i,a,t),className:"p-2 rounded-lg text-gray-400 hover:text-primary hover:bg-primary/10 transition-all",title:"Ouvrir la page complète",children:e.jsxs("svg",{width:"16",height:"16",viewBox:"0 0 24 24",fill:"none",children:[e.jsx("path",{d:"M10 4H6C4.89543 4 4 4.89543 4 6V18C4 19.1046 4.89543 20 6 20H18C19.1046 20 20 19.1046 20 18V14",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"}),e.jsx("path",{d:"M14 4H20V10",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round"}),e.jsx("path",{d:"M20 4L11 13",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"})]})}),e.jsx("a",{href:we(i,a,t),className:"p-2 rounded-lg text-gray-400 hover:text-info hover:bg-info/10 transition-all",title:"Modifier",children:e.jsx("svg",{width:"16",height:"16",viewBox:"0 0 24 24",fill:"none",children:e.jsx("path",{d:"M16.862 4.487L18.55 2.8C19.33 2.02 20.59 2.02 21.37 2.8C22.15 3.58 22.15 4.84 21.37 5.62L19.681 7.307M16.862 4.487L4.162 17.187C3.882 17.467 3.682 17.818 3.592 18.198L2.732 21.596C2.642 21.966 2.952 22.296 3.322 22.226L6.892 21.556C7.242 21.486 7.572 21.306 7.832 21.046L20.513 8.366",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"})})}),e.jsx("button",{onClick:m,className:"p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all",title:"Fermer",children:e.jsx("svg",{width:"16",height:"16",viewBox:"0 0 24 24",fill:"none",children:e.jsx("path",{d:"M18 6L6 18M6 6L18 18",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round"})})})]})]}),e.jsxs("div",{className:"flex-1 overflow-y-auto",children:[Object.keys(N).length>0&&e.jsx("div",{className:"px-6 py-4 border-b border-gray-100 dark:border-gray-700/50",children:Object.entries(N).map(([w,U])=>e.jsxs("div",{className:"mb-3 last:mb-0",children:[e.jsx("div",{className:"text-[11px] uppercase tracking-wider font-semibold text-gray-400 dark:text-gray-500 mb-1.5",children:w}),e.jsx("div",{className:"flex flex-wrap gap-1.5",children:U.map((D,se)=>e.jsxs("span",{className:"inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium transition-all hover:scale-105",style:{backgroundColor:st(D.color,.15),color:D.color,border:`1px solid ${st(D.color,.3)}`},children:[e.jsx("span",{className:"w-2 h-2 rounded-full flex-shrink-0",style:{backgroundColor:D.color}}),D.label]},se))})]},w))}),g&&e.jsxs("div",{className:"px-6 py-4 border-b border-gray-100 dark:border-gray-700/50",children:[e.jsx("div",{className:"text-[11px] uppercase tracking-wider font-semibold text-gray-400 dark:text-gray-500 mb-2",children:"Description"}),e.jsx("p",{className:"text-sm text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-wrap",children:g})]}),e.jsxs("div",{className:"px-6 py-4",children:[e.jsx("div",{className:"text-[11px] uppercase tracking-wider font-semibold text-gray-400 dark:text-gray-500 mb-3",children:"Détails"}),e.jsxs("div",{className:"space-y-0",children:[R.map(w=>e.jsxs("div",{className:"flex items-start gap-3 py-2.5 border-b border-gray-50 dark:border-gray-800/50 last:border-0",children:[e.jsx("div",{className:"w-32 flex-shrink-0 text-xs font-medium text-gray-500 dark:text-gray-400 pt-0.5 truncate",children:w.name}),e.jsx("div",{className:"flex-1 min-w-0",children:e.jsx(Qt,{field:w,record:t})})]},w.id)),(t.relations||[]).map((w,U)=>{var D;return e.jsxs("div",{className:"flex items-start gap-3 py-2.5 border-b border-gray-50 dark:border-gray-800/50 last:border-0",children:[e.jsx("div",{className:"w-32 flex-shrink-0 text-xs font-medium text-gray-500 dark:text-gray-400 pt-0.5 truncate",children:w.label||w.key||"Relation"}),e.jsx("div",{className:"flex-1 min-w-0",children:((D=w.records)==null?void 0:D.length)>0?e.jsx("div",{className:"flex flex-wrap gap-1",children:w.records.map((se,Y)=>e.jsx("a",{href:we(i,w.entitySlug||a,se),className:"inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-primary/10 text-primary font-medium hover:bg-primary/20 transition-colors",children:se.referenceTitle||se.title||"Sans titre"},Y))}):e.jsx("span",{className:"text-gray-400 dark:text-gray-600 text-sm italic",children:"—"})})]},`rel-${U}`)})]})]})]}),e.jsx("div",{className:"flex-shrink-0 px-6 py-3 border-t border-gray-100 dark:border-gray-700/50 bg-gray-50/50 dark:bg-[#0a0f1e]/50",children:e.jsxs("div",{className:"flex items-center justify-between text-[11px] text-gray-400 dark:text-gray-500",children:[e.jsxs("div",{className:"flex items-center gap-3",children:[x&&e.jsxs("span",{className:"flex items-center gap-1",children:[e.jsxs("svg",{width:"12",height:"12",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"1.5",children:[e.jsx("circle",{cx:"12",cy:"12",r:"10"}),e.jsx("path",{d:"M12 6V12L16 14",strokeLinecap:"round"})]}),"Créé le ",x]}),T&&e.jsxs("span",{className:"flex items-center gap-1",children:[e.jsx("svg",{width:"12",height:"12",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"1.5",children:e.jsx("path",{d:"M4.06 13C4.02 12.67 4 12.34 4 12C4 7.58 7.58 4 12 4C14.5 4 16.73 5.15 18.2 6.94M19.94 11C19.98 11.33 20 11.66 20 12C20 16.42 16.42 20 12 20C9.5 20 7.27 18.85 5.8 17.06",strokeLinecap:"round",strokeLinejoin:"round"})}),"Modifié le ",T]})]}),e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx("a",{href:we(i,a,t),className:"px-3 py-1.5 bg-primary/10 text-primary text-xs font-medium rounded-lg hover:bg-primary/20 transition-colors",children:"Voir"}),e.jsx("a",{href:we(i,a,t),className:"px-3 py-1.5 bg-primary text-white text-xs font-medium rounded-lg hover:bg-primary/90 transition-colors",children:"Modifier"})]})]})})]})]}),document.body)}function Ae(t,r=.1){const i=/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(t);return i?`rgba(${parseInt(i[1],16)}, ${parseInt(i[2],16)}, ${parseInt(i[3],16)}, ${r})`:`rgba(128,128,128,${r})`}function Ce(t){var r;return String(((r=t==null?void 0:t._id)==null?void 0:r.$oid)||(t==null?void 0:t._id)||t||"")}function ht(t,r=0){if(typeof t=="string")return{value:t,label:t,color:"#64748b",order:r};const i=String((t==null?void 0:t.value)??(t==null?void 0:t.id)??(t==null?void 0:t._id)??(t==null?void 0:t.label)??(t==null?void 0:t.name)??"");return{value:i,label:(t==null?void 0:t.label)||(t==null?void 0:t.name)||i,color:(t==null?void 0:t.color)||(t==null?void 0:t.couleur)||(t==null?void 0:t.bg)||"#64748b",order:Number.isFinite(Number(t==null?void 0:t.order))?Number(t.order):r}}function tr(t,r){var b,m;if(!t||typeof t!="object")return!1;const i=Ce(t),a=t.type_config||t.typeConfig||{},l=String(t.fieldType||t.type||((b=t.render)==null?void 0:b.input)||"").toLowerCase(),v=String(((m=t.render)==null?void 0:m.input)||"").toLowerCase(),n=l==="select"||v==="select";return i===String(r)&&n&&!a.multiple}function Ze(t){if(t==null||t==="")return[];if(Array.isArray(t))return t.flatMap(r=>Ze(r));if(typeof t=="object"){if(t._v){const r=[];return Object.entries(t).forEach(([i,a])=>{i==="_v"||i==="customText"||r.push(...Ze(a))}),t.customText&&r.push(t.customText),r}return[String(t.label||t.name||t.value||"").trim()].filter(Boolean)}return String(t).split(",").map(r=>r.trim()).filter(Boolean)}function gt(t,r){const i=(t.customFields||[]).find(a=>Ce(a.field_id)===String(r));return i==null?void 0:i.value}function rr(t,r,i=[]){if(!i.length)return[];const a=new Map(((r==null?void 0:r.customFields)||[]).map(l=>[Ce(l),l]));return i.flatMap(l=>{var m,p;const v=a.get(String(l));if(!v)return[];const n=(((m=v.type_config)==null?void 0:m.options)||((p=v.typeConfig)==null?void 0:p.options)||v.options||[]).map(ht),b=new Map;return n.forEach(g=>{b.set(String(g.value),g),b.set(String(g.label),g)}),Ze(gt(t,l)).map(g=>{var T;const x=b.get(String(g));return{fieldId:l,label:(x==null?void 0:x.label)||g,color:(x==null?void 0:x.color)||v.color||((T=v.ui)==null?void 0:T.couleur)||"#64748b"}})}).filter(l=>l.label)}function sr({tags:t}){if(!t.length)return null;const r=t.slice(0,4),i=t.length-r.length;return e.jsxs("div",{className:"flex flex-wrap gap-1 border-t border-gray-100 bg-gray-50/80 px-3 py-2 dark:border-white/10 dark:bg-[#0b1220]/70",children:[r.map((a,l)=>e.jsx("span",{className:"inline-flex max-w-full items-center rounded-full px-2 py-0.5 text-[10px] font-bold",style:{backgroundColor:Ae(a.color,.12),color:a.color},children:e.jsx("span",{className:"truncate",children:a.label})},`${a.fieldId}-${a.label}-${l}`)),i>0&&e.jsxs("span",{className:"inline-flex items-center rounded-full bg-gray-200 px-2 py-0.5 text-[10px] font-bold text-gray-500 dark:bg-white/10 dark:text-white-dark",children:["+",i]})]})}function bt({record:t,accountNumber:r,entitySlug:i,isDragging:a=!1,onQuickView:l,cardTemplate:v,entityData:n,kanbanTagFieldIds:b}){const m=s.useRef(null),p=s.useRef(!1),g=Se(t),x=s.useMemo(()=>rr(t,n,b),[t,n,b]),{attributes:T,listeners:k,setNodeRef:N,transform:R,transition:Q,isDragging:w}=Kt({id:g}),U={transform:Yt.Transform.toString(R),transition:Q,opacity:a||w?.7:1,touchAction:"manipulation"},D=ee=>{m.current={x:ee.clientX,y:ee.clientY,time:Date.now()},p.current=!1},se=ee=>{if(m.current){const P=Math.abs(ee.clientX-m.current.x),u=Math.abs(ee.clientY-m.current.y);(P>5||u>5)&&(p.current=!0)}},Y=ee=>{if(!m.current)return;const P=Date.now()-m.current.time;!p.current&&P<400&&l&&!ee.target.closest("a, button")&&setTimeout(()=>l(t),50),m.current=null};return e.jsxs("div",{ref:N,style:U,className:`kanban-card cursor-pointer overflow-hidden rounded-lg border border-gray-200/80 bg-white transition-all group dark:border-white/10 dark:bg-dark/40 ${a||w?"shadow-lg ring-2 ring-primary/30 cursor-move":"hover:shadow-md dark:hover:bg-dark/60"}`,"data-dnd":"card",onPointerDown:D,onPointerMove:se,onPointerUp:Y,...T,...k,children:[e.jsx(xt,{record:t,cardTemplate:v,context:"kanban",entityData:n,accountNumber:r,entitySlug:i,className:"bg-transparent",style:{borderRadius:0,boxShadow:"none"}}),e.jsx(sr,{tags:x})]})}function ar({column:t,records:r,recordIds:i,accountNumber:a,entitySlug:l,onQuickView:v,cardTemplate:n,entityData:b,kanbanTagFieldIds:m}){const{setNodeRef:p,isOver:g}=Jt({id:String(t.id)}),x=typeof document<"u"&&document.documentElement.classList.contains("dark"),T=Ae(t.color,x?.12:.06),k=Ae(t.color,x?.3:.15);return e.jsxs("div",{ref:p,className:`flex-none rounded-lg overflow-hidden transition-all ${g?"ring-2 ring-primary/50 ring-offset-2":""}`,style:{width:"300px",maxWidth:"320px",backgroundColor:g?Ae(t.color,.15):T,border:`1px solid ${k}`},"data-dnd":"column",children:[e.jsx("div",{style:{height:"4px",backgroundColor:t.color}}),e.jsx("div",{className:"px-3 py-2 flex justify-between items-center",children:e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx("span",{className:"inline-flex items-center gap-1.5 px-2 py-0 rounded text-xs font-semibold uppercase tracking-wide",style:{backgroundColor:t.color,color:"#fff"},children:t.title}),e.jsx("span",{className:"text-xs text-gray-500 font-medium",children:r.length})]})}),e.jsx("div",{className:"px-2 pb-3",children:e.jsx(qt,{items:i,strategy:Ut,children:e.jsx("div",{className:`space-y-2 min-h-[80px] rounded-lg transition-all ${g?"bg-primary/5 p-2":""}`,children:r.length===0?e.jsx("div",{className:"text-xs text-gray-300 dark:text-gray-600 text-center py-8 italic",children:"Aucun enregistrement"}):r.map(N=>e.jsx(bt,{record:N,accountNumber:a,entitySlug:l,onQuickView:v,cardTemplate:n,entityData:b,kanbanTagFieldIds:m},Se(N)))})})}),e.jsx("div",{className:"px-3 pb-3",children:e.jsxs("button",{type:"button",className:"flex items-center gap-1 text-xs text-gray-400 hover:text-primary transition-colors",children:[e.jsx("svg",{width:"14",height:"14",viewBox:"0 0 24 24",fill:"none",children:e.jsx("path",{d:"M12 6V18M6 12H18",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round"})}),"Ajouter"]})})]})}function ir({records:t,columns:r,accountNumber:i,entitySlug:a,viewId:l,entityData:v,kanbanFieldId:n="status",kanbanTagFieldIds:b=[]}){const m=s.useRef(null),p=s.useRef(null),[g,x]=s.useState(t),[T,k]=s.useState({}),[N,R]=s.useState(null),[Q,w]=s.useState(null),U=s.useCallback(y=>{w(y)},[]),[D,se]=s.useState(null);s.useEffect(()=>{var M;if(!(v!=null&&v._id))return;const y=((M=v._id)==null?void 0:M.$oid)||v._id;fetch(`/account/${i}/api/entity/${y}/cards/default/kanban`,{credentials:"include"}).then(W=>W.json()).then(W=>{W.success&&W.card&&se(W.card)}).catch(()=>{})},[v==null?void 0:v._id,i]),s.useEffect(()=>{x(t)},[t]);const Y=s.useRef(!1),ee=s.useRef(0),P=s.useRef(0),u=s.useCallback(y=>{if(N||y.button!==0||y.target.closest('a, button, .dropdown, [data-dnd="card"]'))return;const M=m.current;M&&(Y.current=!0,ee.current=y.pageX-M.offsetLeft,P.current=M.scrollLeft,M.style.cursor="grabbing")},[N]),V=s.useCallback(y=>{if(N){Y.current=!1;return}if(!Y.current)return;y.preventDefault();const M=m.current;if(!M)return;const $=(y.pageX-M.offsetLeft-ee.current)*1.5;M.scrollLeft=P.current-$},[N]),S=s.useCallback(()=>{Y.current=!1,m.current&&(m.current.style.cursor="grab")},[]),C=Wt(He(Ht,{activationConstraint:{distance:8}}),He(Dt,{activationConstraint:{delay:500,tolerance:10}}),He(Pt,{coordinateGetter:Bt})),c=s.useMemo(()=>{var $,ne;if(v){const ae=String(n||"").startsWith("field:")?String(n).slice(6):"",f=ae?(v.customFields||[]).find(X=>tr(X,ae)):null;if(f){const J=((f.type_config||f.typeConfig||{}).options||f.options||[]).map(ht).filter(G=>G.value||G.label).map((G,fe)=>{const h=String(G.value||G.label);return{id:h,title:G.label||h,color:G.color||"#6366f1",optionId:h,optionValue:h,order:Number.isFinite(Number(G.order))?Number(G.order):fe}}).sort((G,fe)=>G.order-fe.order);if(J.length>0)return J.push({id:"__none__",title:"Non renseigné",color:"#9ca3af",optionId:"none",optionValue:""}),{type:"customField",fieldId:Ce(f),columns:J}}const I=v.statusClassification,o=[],B=new Set;[I,...v.classifications||[]].forEach(X=>{const J=Ce(X);!J||B.has(J)||(B.add(J),o.push(X))});let q=null;if(n==="status"&&I?q=I:q=o.find(X=>{const J=Ce(X);return J===String(n)||`classif:${J}`===String(n)}),q||(q=I&&(($=I.options)==null?void 0:$.length)>0?I:o.find(X=>{var J;return((J=X.options)==null?void 0:J.length)>0})),((ne=q==null?void 0:q.options)==null?void 0:ne.length)>0){const X=q.options.map((J,G)=>({id:Ce(J),title:J.label,color:J.color||"#6366f1",optionId:Ce(J),order:Number.isFinite(Number(J.order))?Number(J.order):G})).sort((J,G)=>J.order-G.order);return X.push({id:"__none__",title:q===I?"Sans Statut":"Non classé",color:"#9ca3af",optionId:"none"}),{type:"classification",classId:Ce(q),columns:X}}}const y={};g.forEach(ae=>{(ae.classificationValues||[]).forEach(f=>{var X,J;const I=((X=f.classificationId)==null?void 0:X.$oid)||f.classificationId||f.classification_id;if(!I)return;y[I]||(y[I]={count:0,options:{}}),y[I].count++;const o=f.optionLabel||f.label||"Sans label",B=f.optionColor||f.color||"#9ca3af",q=((J=f.optionId)==null?void 0:J.$oid)||f.optionId||o;y[I].options[o]||(y[I].options[o]={label:o,color:B,optionId:String(q),count:0}),y[I].options[o].count++})});let M=null,W=0;if(Object.entries(y).forEach(([ae,f])=>{f.count>W&&(W=f.count,M=ae)}),M&&y[M]){const f=Object.values(y[M].options).map(I=>({id:I.label,title:I.label,color:I.color,optionId:I.optionId}));return f.push({id:"__none__",title:"Sans classification",color:"#9ca3af",optionId:"none"}),{type:"classification",classId:M,columns:f}}return{type:"all",classId:null,columns:[{id:"__all__",title:"Tous les enregistrements",color:"#4361ee",optionId:null}]}},[g,v,n]),z=s.useMemo(()=>{const y={};if(c.columns.forEach(M=>y[M.id]=[]),c.type==="customField"&&c.fieldId){const M={},W={};c.columns.forEach($=>{$.optionId&&$.optionId!=="none"&&(M[String($.optionValue||$.optionId)]=$.id,W[String($.title)]=$.id)}),g.forEach($=>{const ne=gt($,c.fieldId),ae=Array.isArray(ne)?ne[0]:ne,f=ae==null?"":String(ae),I=M[f]||W[f];I&&y[I]?y[I].push($):y.__none__&&y.__none__.push($)})}else if(!c.classId)y.__all__=g;else{const M={};c.columns.forEach($=>{$.optionId&&$.optionId!=="none"&&(M[String($.optionId)]=$.id)});const W={};c.columns.forEach($=>{W[$.title]=$.id}),g.forEach($=>{var f;const ae=($.classificationValues||[]).find(I=>{var B;const o=((B=I.classificationId)==null?void 0:B.$oid)||I.classificationId||I.classification_id;return String(o)===String(c.classId)});if(ae){const I=String(((f=ae.optionId)==null?void 0:f.$oid)||ae.optionId||""),o=M[I];if(o&&y[o])y[o].push($);else{const B=ae.optionLabel||ae.label||"Sans label";y[B]?y[B].push($):y.__none__&&y.__none__.push($)}}else y.__none__&&y.__none__.push($)})}for(const M of Object.keys(y)){const W=T[M]||[];W.length&&y[M].sort(($,ne)=>{const ae=W.indexOf(Se($)),f=W.indexOf(Se(ne));return ae===-1&&f===-1?0:ae===-1?1:f===-1?-1:ae-f})}return y},[c,g,T]),H=s.useMemo(()=>{const y={};for(const M of c.columns)y[M.id]=(z[M.id]||[]).map(W=>Se(W)).filter(Boolean);return y},[c.columns,z]),te=s.useCallback(y=>{var W;const M=String(y);for(const $ of Object.keys(H))if((W=H[$])!=null&&W.includes(M))return $;return null},[H]),K=s.useMemo(()=>N&&g.find(y=>Se(y)===String(N))||null,[N,g]),de=s.useCallback(y=>{l&&(p.current&&clearTimeout(p.current),p.current=setTimeout(async()=>{try{await fetch(`/account/${i}/api/user/view-preferences`,{method:"POST",headers:{"Content-Type":"application/json"},credentials:"include",body:JSON.stringify({viewId:l,preferences:{kanban:{orderByColumn:y}}})})}catch{}},250))},[i,l]),pe=s.useCallback(async(y,M)=>{const W=c.columns.find($=>$.id===M);if(W)try{c.type==="customField"&&c.fieldId?await fetch(`/account/${i}/record/${a}/${y}/update-field`,{method:"POST",headers:{"Content-Type":"application/json"},credentials:"include",body:JSON.stringify({fieldKey:c.fieldId,value:W.optionId==="none"?"":W.optionValue||W.optionId||""})}):c.classId&&await fetch(`/account/${i}/api/record/update-classification`,{method:"POST",headers:{"Content-Type":"application/json"},credentials:"include",body:JSON.stringify({recordId:y,classificationId:c.classId,optionId:W.optionId==="none"?null:W.optionId})})}catch($){console.error("[RecordsKanban] Update error:",$)}},[i,a,c]),L=y=>{R(String(y.active.id))},j=()=>{R(null)},E=y=>{const{active:M,over:W}=y;if(R(null),!W)return;const $=String(M.id),ne=String(W.id),ae=te($),f=c.columns.some(G=>String(G.id)===ne)?ne:te(ne);if(!ae||!f)return;if(ae===f){const G=H[ae]||[],fe=G.indexOf($),h=G.indexOf(ne);if(fe===-1||h===-1||fe===h)return;const O=Vt(G,fe,h),re={...T,[ae]:O};k(re),de(re);return}const I=[...H[ae]||[]].filter(G=>G!==$),o=[...H[f]||[]],q=c.columns.some(G=>String(G.id)===ne)?o.length:Math.max(0,o.indexOf(ne));o.splice(q,0,$);const X={...T,[ae]:I,[f]:o};k(X),de(X);const J=c.columns.find(G=>G.id===f);c.type==="customField"&&c.fieldId?(x(G=>G.map(fe=>{if(Se(fe)!==$)return fe;const h=[...fe.customFields||[]],O=h.findIndex(he=>Ce(he.field_id)===String(c.fieldId)),re=f==="__none__"?"":(J==null?void 0:J.optionValue)||(J==null?void 0:J.optionId)||"";return O>=0?h[O]={...h[O],value:re}:re&&h.push({field_id:c.fieldId,value:re}),{...fe,customFields:h}})),pe($,f)):c.classId&&(x(G=>G.map(fe=>{if(Se(fe)!==$)return fe;const h=(fe.classificationValues||[]).filter(O=>{var he;const re=((he=O.classificationId)==null?void 0:he.$oid)||O.classificationId||O.classification_id;return String(re)!==String(c.classId)});return f!=="__none__"&&J&&h.push({classificationId:c.classId,optionId:J.optionId,optionLabel:J.title,optionColor:J.color}),{...fe,classificationValues:h}})),pe($,f))};return e.jsxs("div",{ref:m,className:"h-full overflow-x-auto overflow-y-auto",style:{cursor:"grab",userSelect:"none",WebkitUserSelect:"none"},onMouseDown:u,onMouseMove:V,onMouseUp:S,onMouseLeave:S,children:[e.jsxs(Ot,{sensors:C,collisionDetection:zt,autoScroll:{threshold:{x:.15,y:.15},interval:10,acceleration:5},onDragStart:L,onDragEnd:E,onDragCancel:j,children:[e.jsx("div",{style:{display:"flex",flexWrap:"nowrap",alignItems:"flex-start",gap:"1.25rem",padding:"0.5rem",width:"max-content",minHeight:"100%"},children:c.columns.map(y=>{const M=z[y.id]||[];return y.id==="__none__"&&M.length===0?null:e.jsx(ar,{column:y,records:M,recordIds:H[y.id]||[],accountNumber:i,entitySlug:a,onQuickView:U,cardTemplate:D,entityData:v,kanbanTagFieldIds:b},y.id)})}),e.jsx(At,{children:K?e.jsx(bt,{record:K,accountNumber:i,entitySlug:a,isDragging:!0,cardTemplate:D,entityData:v,kanbanTagFieldIds:b}):null})]}),Q&&e.jsx(er,{record:Q,columns:r,accountNumber:i,entitySlug:a,onClose:()=>w(null)})]})}const at=[{bg:"bg-primary-light shadow-primary",text:"text-primary",dot:"#4361ee"},{bg:"bg-info-light shadow-info",text:"text-info",dot:"#2196f3"},{bg:"bg-warning-light shadow-warning",text:"text-warning",dot:"#e2a03f"},{bg:"bg-danger-light shadow-danger",text:"text-danger",dot:"#e7515a"},{bg:"bg-success-light shadow-success",text:"text-success",dot:"#00ab55"},{bg:"bg-secondary-light shadow-secondary",text:"text-secondary",dot:"#805dca"}];function nr(t){return at[t%at.length]}function or(){return e.jsxs("svg",{width:"24",height:"24",viewBox:"0 0 24 24",fill:"none",className:"h-5 w-5 rotate-90 opacity-70 hover:opacity-100",children:[e.jsx("circle",{cx:"5",cy:"12",r:"2",stroke:"currentColor",strokeWidth:"1.5"}),e.jsx("circle",{opacity:"0.5",cx:"12",cy:"12",r:"2",stroke:"currentColor",strokeWidth:"1.5"}),e.jsx("circle",{cx:"19",cy:"12",r:"2",stroke:"currentColor",strokeWidth:"1.5"})]})}function lr(){return e.jsxs("svg",{width:"24",height:"24",viewBox:"0 0 24 24",fill:"none",className:"h-4 w-4 ltr:mr-3 rtl:ml-3",children:[e.jsx("path",{d:"M15.2869 3.15178L14.3601 4.07866L5.83882 12.5999C5.26166 13.1771 4.97308 13.4656 4.7249 13.7838C4.43213 14.1592 4.18114 14.5653 3.97634 14.995C3.80273 15.3593 3.67368 15.7465 3.41556 16.5208L2.32181 19.8021L2.05445 20.6042C1.92743 20.9852 2.0266 21.4053 2.31063 21.6894C2.59466 21.9734 3.01478 22.0726 3.39584 21.9456L4.19792 21.6782L7.47918 20.5844C8.25353 20.3263 8.6407 20.1973 9.00498 20.0237C9.43469 19.8189 9.84082 19.5679 10.2162 19.2751C10.5344 19.0269 10.8229 18.7383 11.4001 18.1612L19.9213 9.63993L20.8482 8.71306C22.3839 7.17735 22.3839 4.68748 20.8482 3.15178C19.3125 1.61607 16.8226 1.61607 15.2869 3.15178Z",stroke:"currentColor",strokeWidth:"1.5"}),e.jsx("path",{opacity:"0.5",d:"M14.36 4.07812C14.36 4.07812 14.4759 6.04774 16.2138 7.78564C17.9517 9.52354 19.9213 9.6394 19.9213 9.6394M4.19789 21.6777L2.32178 19.8015",stroke:"currentColor",strokeWidth:"1.5"})]})}function dr(){return e.jsxs("svg",{width:"24",height:"24",viewBox:"0 0 24 24",fill:"none",className:"h-4.5 w-4.5 ltr:mr-3 rtl:ml-3",children:[e.jsx("path",{opacity:"0.5",d:"M3.27489 15.2957C2.42496 14.1915 2 13.6394 2 12C2 10.3606 2.42496 9.80853 3.27489 8.70433C4.97196 6.49956 7.81811 4 12 4C16.1819 4 19.028 6.49956 20.7251 8.70433C21.575 9.80853 22 10.3606 22 12C22 13.6394 21.575 14.1915 20.7251 15.2957C19.028 17.5004 16.1819 20 12 20C7.81811 20 4.97196 17.5004 3.27489 15.2957Z",stroke:"currentColor",strokeWidth:"1.5"}),e.jsx("path",{d:"M15 12C15 13.6569 13.6569 15 12 15C10.3431 15 9 13.6569 9 12C9 10.3431 10.3431 9 12 9C13.6569 9 15 10.3431 15 12Z",stroke:"currentColor",strokeWidth:"1.5"})]})}function cr({filled:t}){return e.jsx("svg",{width:"24",height:"24",viewBox:"0 0 24 24",fill:"none",className:`h-4.5 w-4.5 group-hover:fill-warning ${t?"fill-warning":""}`,children:e.jsx("path",{d:"M9.15316 5.40838C10.4198 3.13613 11.0531 2 12 2C12.9469 2 13.5802 3.13612 14.8468 5.40837L15.1745 5.99623C15.5345 6.64193 15.7144 6.96479 15.9951 7.17781C16.2757 7.39083 16.6251 7.4699 17.3241 7.62805L17.9605 7.77203C20.4201 8.32856 21.65 8.60682 21.9426 9.54773C22.2352 10.4886 21.3968 11.4691 19.7199 13.4299L19.2861 13.9372C18.8096 14.4944 18.5713 14.773 18.4641 15.1177C18.357 15.4624 18.393 15.8341 18.465 16.5776L18.5306 17.2544C18.7841 19.8706 18.9109 21.1787 18.1449 21.7602C17.3788 22.3417 16.2273 21.8115 13.9243 20.7512L13.3285 20.4768C12.6741 20.1755 12.3469 20.0248 12 20.0248C11.6531 20.0248 11.3259 20.1755 10.6715 20.4768L10.0757 20.7512C7.77268 21.8115 6.62118 22.3417 5.85515 21.7602C5.08912 21.1787 5.21588 19.8706 5.4694 17.2544L5.53498 16.5776C5.60703 15.8341 5.64305 15.4624 5.53586 15.1177C5.42868 14.773 5.19043 14.4944 4.71392 13.9372L4.2801 13.4299C2.60325 11.4691 1.76482 10.4886 2.05742 9.54773C2.35002 8.60682 3.57986 8.32856 6.03954 7.77203L6.67589 7.62805C7.37485 7.4699 7.72433 7.39083 8.00494 7.17781C8.28555 6.96479 8.46553 6.64194 8.82547 5.99623L9.15316 5.40838Z",stroke:"currentColor",strokeWidth:"1.5"})})}function ur(){return e.jsx("svg",{width:"24",height:"24",viewBox:"0 0 24 24",fill:"none",className:"h-3 w-3 rotate-45",children:e.jsx("path",{d:"M2 12C2 7.28595 2 4.92893 3.46447 3.46447C4.92893 2 7.28595 2 12 2C16.714 2 19.0711 2 20.5355 3.46447C22 4.92893 22 7.28595 22 12C22 16.714 22 19.0711 20.5355 20.5355C19.0711 22 16.714 22 12 22C7.28595 22 4.92893 22 3.46447 20.5355C2 19.0711 2 16.714 2 12Z",stroke:"currentColor",strokeWidth:"1.5"})})}function pr({record:t,accountNumber:r,entitySlug:i}){var n;const[a,l]=s.useState(!1),v=s.useRef(null);return s.useEffect(()=>{if(!a)return;const b=m=>{v.current&&!v.current.contains(m.target)&&l(!1)};return document.addEventListener("mousedown",b),()=>document.removeEventListener("mousedown",b)},[a]),(n=t._id)!=null&&n.$oid||t._id,e.jsxs("div",{ref:v,className:"dropdown relative",children:[e.jsx("button",{type:"button",className:"text-primary",onClick:b=>{b.preventDefault(),b.stopPropagation(),l(!a)},children:e.jsx(or,{})}),a&&e.jsxs("ul",{className:"absolute z-50 min-w-[140px] rounded-md bg-white dark:bg-[#1b2e4b] shadow-lg border dark:border-gray-700 py-1 text-sm font-medium ltr:right-0 rtl:left-0 top-full mt-1",style:{animation:"fadeIn 0.15s ease-out"},children:[e.jsx("li",{children:e.jsxs("a",{href:we(r,i,t),className:"flex items-center px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 w-full",onClick:b=>b.stopPropagation(),children:[e.jsx(lr,{})," Edit"]})}),e.jsx("li",{children:e.jsxs("a",{href:we(r,i,t),className:"flex items-center px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 w-full",onClick:b=>b.stopPropagation(),children:[e.jsx(dr,{})," View"]})})]})]})}function fr({record:t,accountNumber:r,entitySlug:i,style:a,favorites:l,onToggleFav:v}){var x,T;const n=l[t._id]||!1;(x=t._id)!=null&&x.$oid||t._id;const b=t.referenceTitle||t.title||t.computedTitle||"Sans titre",m=t.createdAt?new Date(t.createdAt).toLocaleDateString("fr-FR",{day:"2-digit",month:"short",year:"numeric"}):"",p=(t.customFields||[]).find(k=>{var N,R,Q,w,U,D;return((R=(N=k.field_id)==null?void 0:N.label)==null?void 0:R.toLowerCase().includes("descri"))||((w=(Q=k.field_id)==null?void 0:Q.label)==null?void 0:w.toLowerCase().includes("note"))||((D=(U=k.field_id)==null?void 0:U.label)==null?void 0:D.toLowerCase().includes("contenu"))}),g=(p==null?void 0:p.value)||t.description||"";return(t.classificationValues||[]).filter(k=>k.optionLabel).map(k=>({label:k.optionLabel,color:k.optionColor||k.color||a.dot})),e.jsxs("div",{className:`panel pb-12 relative ${a.bg}`,children:[e.jsxs("div",{className:"min-h-[142px]",children:[e.jsxs("div",{className:"flex justify-between",children:[e.jsxs("div",{className:"flex w-max items-center",children:[e.jsx("div",{className:"flex-none",children:e.jsx("div",{className:"rounded-full bg-gray-300 p-2 dark:bg-gray-700",children:e.jsxs("svg",{width:"24",height:"24",viewBox:"0 0 24 24",fill:"none",className:"h-4.5 w-4.5",children:[e.jsx("circle",{cx:"12",cy:"6",r:"4",stroke:"currentColor",strokeWidth:"1.5"}),e.jsx("ellipse",{opacity:"0.5",cx:"12",cy:"17",rx:"7",ry:"4",stroke:"currentColor",strokeWidth:"1.5"})]})})}),e.jsxs("div",{className:"ltr:ml-2 rtl:mr-2",children:[e.jsx("div",{className:"font-semibold",children:((T=t.createdBy)==null?void 0:T.name)||"Utilisateur"}),e.jsx("div",{className:"text-sx text-white-dark",children:m})]})]}),e.jsx(pr,{record:t,accountNumber:r,entitySlug:i})]}),e.jsxs("div",{children:[e.jsx("h4",{className:"mt-4 font-semibold",children:e.jsx("a",{href:we(r,i,t),className:"hover:text-primary transition-colors",children:b})}),g&&e.jsx("p",{className:"mt-2 text-white-dark line-clamp-3",children:g})]})]}),e.jsx("div",{className:"absolute bottom-5 left-0 w-full px-5",children:e.jsxs("div",{className:"mt-2 flex items-center justify-between",children:[e.jsx("div",{className:a.text,children:e.jsx(ur,{})}),e.jsx("div",{className:"flex items-center gap-2",children:e.jsx("button",{type:"button",className:"group text-warning ltr:ml-2 rtl:mr-2",onClick:k=>{k.preventDefault(),k.stopPropagation(),v(t._id)},children:e.jsx(cr,{filled:n})})})]})})]})}function xr({records:t,accountNumber:r,entitySlug:i}){const[a,l]=s.useState({}),v=s.useCallback(n=>{l(b=>({...b,[n]:!b[n]}))},[]);return e.jsx("div",{className:"h-full overflow-y-auto",children:e.jsx("div",{className:"grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",children:t.length===0?e.jsx("div",{className:"col-span-full text-center py-20 text-gray-400 dark:text-gray-600 italic",children:"Aucun enregistrement"}):t.map((n,b)=>{var m;return e.jsx(fr,{record:n,accountNumber:r,entitySlug:i,style:nr(b),favorites:a,onToggleFav:v},((m=n._id)==null?void 0:m.$oid)||n._id)})})})}const Xe={Planifié:{className:"primary",bg:"#4361ee",text:"#fff"},Confirmé:{className:"info",bg:"#2196f3",text:"#fff"},Terminé:{className:"success",bg:"#00ab55",text:"#fff"},Annulé:{className:"danger",bg:"#e7515a",text:"#fff"},"Non présenté":{className:"warning",bg:"#e2a03f",text:"#fff"}},ze=[{className:"primary",bg:"#4361ee",text:"#fff"},{className:"info",bg:"#2196f3",text:"#fff"},{className:"success",bg:"#00ab55",text:"#fff"},{className:"danger",bg:"#e7515a",text:"#fff"},{className:"warning",bg:"#e2a03f",text:"#fff"}];function hr(t,r){if(r){const i=(t.customFields||[]).find(a=>{var v,n,b;return(((n=(v=a.field_id)==null?void 0:v._id)==null?void 0:n.toString())||((b=a.field_id)==null?void 0:b.toString()))===r});if(i!=null&&i.value){const a=new Date(i.value);if(!isNaN(a))return a}}if(t.date){const i=new Date(t.date);if(!isNaN(i))return i}if(t.createdAt){const i=new Date(t.createdAt);if(!isNaN(i))return i}return null}function gr(t,r){if(!r)return 30;const i=(t.customFields||[]).find(a=>{var v,n,b;return(((n=(v=a.field_id)==null?void 0:v._id)==null?void 0:n.toString())||((b=a.field_id)==null?void 0:b.toString()))===r});return parseInt(i==null?void 0:i.value)||30}function br(t){const r=t.classificationValues||[];for(const i of r)if(i.label||i.optionLabel)return i.label||i.optionLabel;return null}function mr(t){const r=["Dimanche","Lundi","Mardi","Mercredi","Jeudi","Vendredi","Samedi"],i=["janvier","février","mars","avril","mai","juin","juillet","août","septembre","octobre","novembre","décembre"];return`${r[t.getDay()]} ${t.getDate()} ${i[t.getMonth()]} ${t.getFullYear()}`}function vr(t){const r=t.getFullYear(),i=String(t.getMonth()+1).padStart(2,"0"),a=String(t.getDate()).padStart(2,"0"),l=String(t.getHours()).padStart(2,"0"),v=String(t.getMinutes()).padStart(2,"0");return`${r}-${i}-${a}T${l}:${v}`}function yr({message:t,type:r="success",onClose:i}){s.useEffect(()=>{const v=setTimeout(i,3e3);return()=>clearTimeout(v)},[i]);const a={success:{bg:"#00ab55",icon:"✓"},error:{bg:"#e7515a",icon:"✕"},info:{bg:"#4361ee",icon:"ℹ"}},l=a[r]||a.info;return e.jsxs("div",{style:{position:"fixed",bottom:24,right:24,zIndex:1e4,display:"flex",alignItems:"center",gap:10,padding:"12px 20px",borderRadius:12,backgroundColor:l.bg,color:"#fff",boxShadow:"0 8px 32px rgba(0,0,0,0.18)",animation:"slideInRight 0.3s ease",fontSize:13,fontWeight:600},children:[e.jsx("span",{style:{fontSize:16},children:l.icon}),t]})}function kr({isOpen:t,onClose:r,onSave:i,initialDate:a,entityData:l,accountNumber:v}){const[n,b]=s.useState(""),[m,p]=s.useState(""),[g,x]=s.useState("30"),[T,k]=s.useState(!1),N=s.useRef(null);if(s.useEffect(()=>{t&&a&&(p(vr(a)),b(""),x("30"),setTimeout(()=>{var w;return(w=N.current)==null?void 0:w.focus()},100))},[t,a]),!t)return null;const R=async w=>{if(w.preventDefault(),!!n.trim()){k(!0);try{await i({title:n.trim(),date:m,duration:parseInt(g)}),r()}catch(U){console.error(U)}k(!1)}},Q=[15,30,45,60,90,120];return e.jsx("div",{style:{position:"fixed",inset:0,zIndex:9999,backgroundColor:"rgba(0,0,0,0.4)",backdropFilter:"blur(4px)",display:"flex",alignItems:"center",justifyContent:"center",animation:"fadeIn 0.2s ease"},onClick:w=>{w.target===w.currentTarget&&r()},children:e.jsxs("div",{style:{backgroundColor:"#fff",borderRadius:16,width:"100%",maxWidth:440,boxShadow:"0 24px 80px rgba(0,0,0,0.2)",animation:"slideUp 0.3s ease",overflow:"hidden"},children:[e.jsxs("div",{style:{padding:"20px 24px 16px",display:"flex",alignItems:"center",justifyContent:"space-between",borderBottom:"1px solid #f0f0f0"},children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:10},children:[e.jsx("div",{style:{width:36,height:36,borderRadius:10,background:"linear-gradient(135deg, #4361ee, #805cf6)",display:"flex",alignItems:"center",justifyContent:"center"},children:e.jsx("svg",{viewBox:"0 0 24 24",fill:"none",style:{width:18,height:18,color:"#fff"},children:e.jsx("path",{d:"M12 5V19M5 12H19",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round"})})}),e.jsxs("div",{children:[e.jsx("h3",{style:{margin:0,fontSize:16,fontWeight:700,color:"#1a1a2e"},children:"Nouveau rendez-vous"}),e.jsx("p",{style:{margin:0,fontSize:11,color:"#888",marginTop:2},children:a?mr(a):""})]})]}),e.jsx("button",{onClick:r,style:{border:"none",background:"#f5f5f5",borderRadius:8,width:32,height:32,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer"},children:e.jsx("svg",{viewBox:"0 0 24 24",fill:"none",style:{width:16,height:16,color:"#666"},children:e.jsx("path",{d:"M18 6L6 18M6 6L18 18",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round"})})})]}),e.jsxs("form",{onSubmit:R,style:{padding:"20px 24px 24px"},children:[e.jsxs("div",{style:{marginBottom:16},children:[e.jsx("label",{style:{display:"block",fontSize:12,fontWeight:600,color:"#555",marginBottom:6},children:"Titre *"}),e.jsx("input",{ref:N,type:"text",value:n,onChange:w=>b(w.target.value),placeholder:"Ex: Consultation Dr. Martin",required:!0,style:{width:"100%",padding:"10px 14px",border:"1.5px solid #e0e0e0",borderRadius:10,fontSize:14,outline:"none",transition:"border 0.2s",boxSizing:"border-box"},onFocus:w=>w.target.style.borderColor="#4361ee",onBlur:w=>w.target.style.borderColor="#e0e0e0"})]}),e.jsxs("div",{style:{marginBottom:16},children:[e.jsx("label",{style:{display:"block",fontSize:12,fontWeight:600,color:"#555",marginBottom:6},children:"Date et heure"}),e.jsx("input",{type:"datetime-local",value:m,onChange:w=>p(w.target.value),style:{width:"100%",padding:"10px 14px",border:"1.5px solid #e0e0e0",borderRadius:10,fontSize:14,outline:"none",transition:"border 0.2s",boxSizing:"border-box"},onFocus:w=>w.target.style.borderColor="#4361ee",onBlur:w=>w.target.style.borderColor="#e0e0e0"})]}),e.jsxs("div",{style:{marginBottom:20},children:[e.jsx("label",{style:{display:"block",fontSize:12,fontWeight:600,color:"#555",marginBottom:8},children:"Durée"}),e.jsx("div",{style:{display:"flex",flexWrap:"wrap",gap:6},children:Q.map(w=>e.jsx("button",{type:"button",onClick:()=>x(String(w)),style:{padding:"6px 14px",borderRadius:20,fontSize:12,fontWeight:600,border:g===String(w)?"1.5px solid #4361ee":"1.5px solid #e0e0e0",backgroundColor:g===String(w)?"#4361ee":"#fff",color:g===String(w)?"#fff":"#555",cursor:"pointer",transition:"all 0.2s"},children:w<60?`${w} min`:`${w/60}h`},w))})]}),e.jsxs("div",{style:{display:"flex",gap:10,justifyContent:"flex-end"},children:[e.jsx("button",{type:"button",onClick:r,style:{padding:"10px 20px",borderRadius:10,fontSize:13,fontWeight:600,border:"1.5px solid #e0e0e0",backgroundColor:"#fff",color:"#555",cursor:"pointer",transition:"all 0.2s"},children:"Annuler"}),e.jsx("button",{type:"submit",disabled:T||!n.trim(),style:{padding:"10px 24px",borderRadius:10,fontSize:13,fontWeight:600,border:"none",background:n.trim()?"linear-gradient(135deg, #4361ee, #805cf6)":"#ccc",color:"#fff",cursor:n.trim()?"pointer":"not-allowed",transition:"all 0.2s",opacity:T?.7:1},children:T?"Création...":"Créer le RDV"})]})]})]})})}function wr({event:t,position:r,onClose:i,onEdit:a,onDelete:l,accountNumber:v,entitySlug:n,cardTemplate:b}){var R,Q;const m=s.useRef(null);if(s.useEffect(()=>{const w=U=>{m.current&&!m.current.contains(U.target)&&i()};return document.addEventListener("mousedown",w),()=>document.removeEventListener("mousedown",w)},[i]),!t)return null;const p=t.start?new Date(t.start):null,g=t.end?new Date(t.end):null,x=(R=t.extendedProps)==null?void 0:R.status,T=x?Xe[x]:null,N={_id:((Q=t.extendedProps)==null?void 0:Q.recordId)||t.id,referenceTitle:t.title,_start:p,_end:g,classificationValues:x?[{optionLabel:x,optionColor:T?T.bg:"#4361ee"}]:[],createdAt:p,...t.extendedProps};return e.jsx("div",{ref:m,style:{position:"fixed",top:Math.min(r.y,window.innerHeight-280),left:Math.min(r.x,window.innerWidth-340),zIndex:9998,width:320,backgroundColor:"#fff",borderRadius:14,boxShadow:"0 16px 64px rgba(0,0,0,0.18)",animation:"slideUp 0.2s ease",overflow:"hidden"},children:e.jsx(xt,{record:N,cardTemplate:b,context:"calendar",accountNumber:v,entitySlug:n,callbacks:{onClose:i},style:{borderRadius:0}})})}function jr({records:t=[],columns:r=[],accountNumber:i,entitySlug:a,entityData:l}){var W,$,ne,ae;const v=s.useRef(null),n=s.useRef(null),[b,m]=s.useState(!1),[p,g]=s.useState(!1),[x,T]=s.useState(null),[k,N]=s.useState(null),[R,Q]=s.useState({x:0,y:0}),[w,U]=s.useState(null),[D,se]=s.useState(t),[Y,ee]=s.useState(!1),[P,u]=s.useState({weekStartsOn:1,startHour:"07:00",endHour:"20:00",hideWeekend:!1,slotDuration:"00:15:00",slotLabelInterval:"01:00",compactMode:!1});s.useEffect(()=>{var I;if(!(l!=null&&l._id))return;const f=((I=l._id)==null?void 0:I.$oid)||l._id;fetch(`/account/${i}/api/user/view-preferences?viewId=calendar_${f}`,{credentials:"include"}).then(o=>o.json()).then(o=>{var B;o.success&&((B=o.preferences)!=null&&B.calendarSettings)&&u(q=>({...q,...o.preferences.calendarSettings}))}).catch(()=>{})},[l==null?void 0:l._id,i]);const V=s.useCallback(async f=>{var o;u(f),ee(!1);const I=((o=l==null?void 0:l._id)==null?void 0:o.$oid)||(l==null?void 0:l._id);if(I)try{await fetch(`/account/${i}/api/user/view-preferences`,{method:"POST",headers:{"Content-Type":"application/json"},credentials:"include",body:JSON.stringify({viewId:`calendar_${I}`,preferences:{calendarSettings:f}})}),U({message:"Paramètres sauvegardés",type:"success"})}catch{U({message:"Erreur sauvegarde paramètres",type:"error"})}},[i,l]);s.useEffect(()=>{se(t)},[t]);const[S,C]=s.useState(null);s.useEffect(()=>{var I;if(!(l!=null&&l._id))return;const f=((I=l._id)==null?void 0:I.$oid)||l._id;fetch(`/account/${i}/api/entity/${f}/cards/default/calendar`,{credentials:"include"}).then(o=>o.json()).then(o=>{o.success&&o.card&&C(o.card)}).catch(()=>{})},[l==null?void 0:l._id,i]);const{dateFieldId:c,durationFieldId:z}=s.useMemo(()=>{var J,G,fe,h,O;if(!l)return{dateFieldId:null,durationFieldId:null};const f=l.customFields||[],I=f.filter(re=>re.type==="date"||re.inputType==="date"||re.inputType==="datetime-local"),o=I.find(re=>/^date/i.test(re.name||"")||/date/i.test(re.label||"")),B=((J=o==null?void 0:o._id)==null?void 0:J.toString())||((fe=(G=I[0])==null?void 0:G._id)==null?void 0:fe.toString())||null,X=((O=(h=f.filter(re=>re.type==="number"&&(/dur/i.test(re.name||"")||/dur/i.test(re.label||"")))[0])==null?void 0:h._id)==null?void 0:O.toString())||null;return{dateFieldId:B,durationFieldId:X}},[l]),H=(W=l==null?void 0:l._id)==null?void 0:W.toString(),te=(ne=($=l==null?void 0:l.statusClassification)==null?void 0:$._id)==null?void 0:ne.toString(),K=((ae=l==null?void 0:l.statusClassification)==null?void 0:ae.options)||[],de=K.find(f=>/planif/i.test(f.label))||K[0],pe=s.useMemo(()=>D.map((f,I)=>{const o=hr(f,c);if(!o)return null;const B=gr(f,z),q=new Date(o.getTime()+B*6e4),X=f.referenceTitle||f.computedTitle||f.title||"Sans titre",J=br(f),G=J&&Xe[J]||ze[I%ze.length];return{id:f._id,title:X,start:o.toISOString(),end:q.toISOString(),className:G.className,extendedProps:{recordId:f._id,status:J,entitySlug:a,accountNumber:i,dateFieldId:c,durationFieldId:z}}}).filter(Boolean),[D,c,z,a,i]),L=s.useCallback(f=>{f.jsEvent.preventDefault(),f.jsEvent.stopPropagation();const I=f.el.getBoundingClientRect();Q({x:I.right+8,y:I.top}),N(f.event)},[]),j=s.useCallback(f=>{N(null);const I=f.start;T(I),g(!0),n.current&&n.current.unselect()},[]),E=s.useCallback(async f=>{var J,G,fe;const I=((J=f.event.extendedProps)==null?void 0:J.recordId)||f.event.id,o=f.event.start.toISOString(),B=(G=f.event.end)==null?void 0:G.toISOString(),q=(fe=f.event.extendedProps)==null?void 0:fe.dateFieldId;let X;f.event.start&&f.event.end&&(X=Math.round((f.event.end-f.event.start)/6e4));try{if(!(await fetch(`/account/${i}/api/records/${I}/date`,{method:"PATCH",headers:{"Content-Type":"application/json"},credentials:"include",body:JSON.stringify({dateFieldId:q,newStart:o,newEnd:B,duration:X})})).ok)throw new Error("Failed");U({message:"RDV déplacé avec succès",type:"success"})}catch{f.revert(),U({message:"Erreur lors du déplacement",type:"error"})}},[i]),y=s.useCallback(async f=>{var X,J;const I=((X=f.event.extendedProps)==null?void 0:X.recordId)||f.event.id,o=f.event.start.toISOString(),B=(J=f.event.extendedProps)==null?void 0:J.dateFieldId;let q;f.event.start&&f.event.end&&(q=Math.round((f.event.end-f.event.start)/6e4));try{if(!(await fetch(`/account/${i}/api/records/${I}/date`,{method:"PATCH",headers:{"Content-Type":"application/json"},credentials:"include",body:JSON.stringify({dateFieldId:B,newStart:o,duration:q})})).ok)throw new Error("Failed");U({message:`Durée modifiée (${q} min)`,type:"success"})}catch{f.revert(),U({message:"Erreur lors du redimensionnement",type:"error"})}},[i]),M=s.useCallback(async({title:f,date:I,duration:o})=>{var X;if(!H||!c)return;const B=await fetch(`/account/${i}/api/entity/${H}/records/quick-add`,{method:"POST",headers:{"Content-Type":"application/json"},credentials:"include",body:JSON.stringify({title:f,dateFieldId:c,dateValue:new Date(I).toISOString(),duration:o,durationFieldId:z,statusOptionId:(X=de==null?void 0:de._id)==null?void 0:X.toString(),statusClassificationId:te})});if(!B.ok)throw new Error("Failed to create");const q=await B.json();q.record&&se(J=>[...J,q.record]),U({message:`"${f}" créé avec succès !`,type:"success"})},[i,H,c,z,de,te]);return s.useEffect(()=>{if(typeof FullCalendar<"u"){m(!0);return}const f=setInterval(()=>{typeof FullCalendar<"u"&&(m(!0),clearInterval(f))},200);if(!document.querySelector('script[src*="fullcalendar"]')){const I=document.createElement("link");I.rel="stylesheet",I.href="/assets/css/fullcalendar.min.css",document.head.appendChild(I);const o=document.createElement("script");o.src="/assets/js/fullcalendar.min.js",o.onload=()=>m(!0),document.head.appendChild(o)}return()=>clearInterval(f)},[]),s.useEffect(()=>{if(!b||!v.current||typeof FullCalendar>"u")return;n.current&&n.current.destroy();const f=P.hideWeekend?[0,6]:[],I=new FullCalendar.Calendar(v.current,{initialView:"timeGridWeek",headerToolbar:{left:"prev,next today",center:"title",right:"dayGridMonth,timeGridWeek,timeGridDay"},locale:"fr",buttonText:{today:"Aujourd'hui",month:"Mois",week:"Semaine",day:"Jour"},editable:!0,selectable:!0,selectMirror:!0,dayMaxEvents:3,height:"auto",firstDay:P.weekStartsOn,hiddenDays:f,slotDuration:P.slotDuration,snapDuration:P.slotDuration,slotLabelInterval:P.slotLabelInterval,slotLabelFormat:{hour:"2-digit",minute:"2-digit",hour12:!1},slotMinTime:P.startHour+":00",slotMaxTime:P.endHour+":00",businessHours:{daysOfWeek:P.hideWeekend?[1,2,3,4,5]:[0,1,2,3,4,5,6],startTime:P.startHour,endTime:P.endHour},scrollTime:P.startHour+":00",nowIndicator:!0,events:pe,eventClick:L,select:j,eventDrop:E,eventResize:y,eventContent:o=>{const B=o.event.start,q=o.event.end,X=B?`${String(B.getHours()).padStart(2,"0")}:${String(B.getMinutes()).padStart(2,"0")}`:"",J=q?`${String(q.getHours()).padStart(2,"0")}:${String(q.getMinutes()).padStart(2,"0")}`:"";return{html:`<div style="line-height:1.2;padding:2px 4px;overflow:hidden;"><div style="font-weight:700;font-size:11px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin:0;">${o.event.title}</div><div style="font-size:10px;opacity:0.85;margin:0;font-weight:500;">De ${X} à ${J}</div></div>`}},eventDidMount:o=>{var q;o.el.style.cursor="pointer",o.el.style.borderRadius="6px",o.el.style.border="none",o.el.style.overflow="hidden";const B=(q=o.event.extendedProps)==null?void 0:q.status;o.el.title=o.event.title+(B?` — ${B}`:"")},dayHeaderFormat:{weekday:"short",day:"numeric",month:"short"},allDaySlot:!1});return I.render(),n.current=I,()=>{n.current&&(n.current.destroy(),n.current=null)}},[b,pe,L,j,E,y,P]),b?!c&&t.length>0?e.jsxs("div",{style:{display:"flex",alignItems:"center",justifyContent:"center",padding:"48px 0",flexDirection:"column"},children:[e.jsxs("svg",{viewBox:"0 0 24 24",fill:"none",style:{width:48,height:48,marginBottom:12,color:"#ccc"},children:[e.jsx("rect",{x:"3",y:"4",width:"18",height:"18",rx:"2",stroke:"currentColor",strokeWidth:"1.5"}),e.jsx("path",{d:"M16 2V6M8 2V6M3 10H21",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"})]}),e.jsx("p",{style:{fontSize:14,fontWeight:500,color:"#888"},children:"Aucun champ date trouvé"}),e.jsx("p",{style:{fontSize:12,color:"#aaa",marginTop:4},children:"Ajoutez un champ date à cette entité"})]}):e.jsxs("div",{style:{position:"relative"},children:[e.jsx("style",{children:`
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes slideUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
                @keyframes slideInRight { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: translateX(0); } }
                .fc .fc-timegrid-slot { height: ${P.compactMode?"20px":"40px"} !important; }
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
            `}),e.jsxs("div",{style:{marginBottom:12,display:"flex",flexWrap:"wrap",gap:12,alignItems:"center",justifyContent:"space-between",padding:"8px 0"},children:[e.jsx("div",{style:{display:"flex",flexWrap:"wrap",gap:10},children:Object.entries(Xe).map(([f,I])=>e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:5,fontSize:11,color:"#666"},children:[e.jsx("div",{style:{width:8,height:8,borderRadius:2,backgroundColor:I.bg}}),f]},f))}),e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:12},children:[e.jsx("span",{style:{fontSize:11,color:"#aaa",fontStyle:"italic"},children:"Cliquer pour ajouter • Glisser pour déplacer"}),e.jsxs("button",{onClick:()=>ee(!0),style:{display:"flex",alignItems:"center",gap:6,padding:"6px 14px",border:"1px solid #e2e8f0",borderRadius:8,background:"#fff",cursor:"pointer",fontSize:12,fontWeight:600,color:"#475569",transition:"all 0.2s"},onMouseEnter:f=>{f.currentTarget.style.borderColor="#4361ee",f.currentTarget.style.color="#4361ee"},onMouseLeave:f=>{f.currentTarget.style.borderColor="#e2e8f0",f.currentTarget.style.color="#475569"},children:[e.jsx("iconify-icon",{icon:"solar:settings-linear",width:"15"}),"Config"]})]})]}),e.jsx("div",{className:"calendar-wrapper",ref:v}),Y&&e.jsx(Cr,{settings:P,onSave:V,onClose:()=>ee(!1)}),e.jsx(kr,{isOpen:p,onClose:()=>g(!1),onSave:M,initialDate:x,entityData:l,accountNumber:i}),k&&e.jsx(wr,{event:k,position:R,onClose:()=>N(null),accountNumber:i,entitySlug:a,cardTemplate:S}),w&&e.jsx(yr,{message:w.message,type:w.type,onClose:()=>U(null)})]}):e.jsxs("div",{style:{display:"flex",alignItems:"center",justifyContent:"center",padding:"48px 0"},children:[e.jsx("div",{className:"animate-spin rounded-full h-8 w-8 border-b-2 border-primary"}),e.jsx("span",{style:{marginLeft:12,color:"#888"},children:"Chargement du calendrier..."})]})}function Cr({settings:t,onSave:r,onClose:i}){const[a,l]=s.useState({...t}),v=[];for(let n=0;n<24;n++){const b=`${String(n).padStart(2,"0")}:00`;v.push(b)}return e.jsxs(e.Fragment,{children:[e.jsx("div",{className:"cal-settings-overlay",onClick:i}),e.jsxs("div",{className:"cal-settings-panel",children:[e.jsxs("div",{className:"header",children:[e.jsxs("h3",{children:[e.jsx("iconify-icon",{icon:"solar:settings-bold-duotone",width:"20",style:{verticalAlign:"middle",marginRight:8,color:"#4361ee"}}),"Paramètres du calendrier"]}),e.jsx("button",{onClick:i,style:{background:"none",border:"none",cursor:"pointer",padding:4,borderRadius:6,color:"#94a3b8"},children:e.jsx("iconify-icon",{icon:"solar:close-circle-linear",width:"22"})})]}),e.jsxs("div",{className:"body",children:[e.jsxs("div",{className:"cal-field",children:[e.jsx("label",{children:"Premier jour de la semaine"}),e.jsxs("select",{value:a.weekStartsOn,onChange:n=>l({...a,weekStartsOn:parseInt(n.target.value)}),children:[e.jsx("option",{value:1,children:"Lundi"}),e.jsx("option",{value:0,children:"Dimanche"}),e.jsx("option",{value:6,children:"Samedi"})]})]}),e.jsxs("div",{style:{display:"flex",gap:12},children:[e.jsxs("div",{className:"cal-field",style:{flex:1},children:[e.jsx("label",{children:"Heure de début"}),e.jsx("select",{value:a.startHour,onChange:n=>l({...a,startHour:n.target.value}),children:v.map(n=>e.jsx("option",{value:n,children:n},n))})]}),e.jsxs("div",{className:"cal-field",style:{flex:1},children:[e.jsx("label",{children:"Heure de fin"}),e.jsx("select",{value:a.endHour,onChange:n=>l({...a,endHour:n.target.value}),children:v.map(n=>e.jsx("option",{value:n,children:n},n))})]})]}),e.jsxs("div",{className:"cal-field",children:[e.jsx("label",{children:"Intervalle des créneaux"}),e.jsxs("select",{value:a.slotDuration,onChange:n=>l({...a,slotDuration:n.target.value}),children:[e.jsx("option",{value:"00:05:00",children:"5 minutes"}),e.jsx("option",{value:"00:10:00",children:"10 minutes"}),e.jsx("option",{value:"00:15:00",children:"15 minutes"}),e.jsx("option",{value:"00:30:00",children:"30 minutes"}),e.jsx("option",{value:"01:00:00",children:"1 heure"})]})]}),e.jsxs("div",{className:"cal-field",children:[e.jsx("label",{children:"Affichage des heures"}),e.jsxs("select",{value:a.slotLabelInterval,onChange:n=>l({...a,slotLabelInterval:n.target.value}),children:[e.jsx("option",{value:"00:30:00",children:"Toutes les 30 min"}),e.jsx("option",{value:"01:00:00",children:"Toutes les heures"}),e.jsx("option",{value:"02:00:00",children:"Toutes les 2 heures"})]})]}),e.jsx("div",{style:{height:1,background:"#f1f5f9",margin:"8px 0 20px"}}),e.jsxs("div",{className:"cal-toggle",children:[e.jsxs("div",{children:[e.jsx("div",{className:"cal-toggle-label",children:"Mode compact"}),e.jsx("div",{className:"cal-toggle-desc",children:"Réduit l'espacement des créneaux pour une vue d'ensemble"})]}),e.jsxs("label",{className:"cal-switch",children:[e.jsx("input",{type:"checkbox",checked:a.compactMode,onChange:n=>l({...a,compactMode:n.target.checked})}),e.jsx("span",{className:"slider"})]})]}),e.jsxs("div",{className:"cal-toggle",children:[e.jsxs("div",{children:[e.jsx("div",{className:"cal-toggle-label",children:"Masquer le weekend"}),e.jsx("div",{className:"cal-toggle-desc",children:"Afficher uniquement du lundi au vendredi"})]}),e.jsxs("label",{className:"cal-switch",children:[e.jsx("input",{type:"checkbox",checked:a.hideWeekend,onChange:n=>l({...a,hideWeekend:n.target.checked})}),e.jsx("span",{className:"slider"})]})]})]}),e.jsxs("div",{className:"footer",children:[e.jsx("button",{className:"cal-btn cal-btn-ghost",onClick:i,children:"Annuler"}),e.jsxs("button",{className:"cal-btn cal-btn-primary",onClick:()=>r(a),children:[e.jsx("iconify-icon",{icon:"solar:check-circle-bold",width:"16",style:{verticalAlign:"middle",marginRight:4}}),"Appliquer"]})]})]})]})}const mt={contains:{label:"Contient",icon:"⊃",types:["text","email","phone","url","textarea","title","relation"]},not_contains:{label:"Ne contient pas",icon:"⊅",types:["text","email","phone","url","textarea","title","relation"]},equals:{label:"Est égal à",icon:"=",types:["text","email","phone","url","number","date","title","select","boolean","checkbox","switch","relation","classification"]},not_equals:{label:"N'est pas égal à",icon:"≠",types:["text","email","phone","url","number","date","title","select","boolean","checkbox","switch","relation","classification"]},starts_with:{label:"Commence par",icon:"A…",types:["text","email","phone","url","title"]},ends_with:{label:"Se termine par",icon:"…Z",types:["text","email","phone","url","title"]},gt:{label:"Supérieur à",icon:">",types:["number","date"]},gte:{label:"Supérieur ou égal",icon:"≥",types:["number","date"]},lt:{label:"Inférieur à",icon:"<",types:["number","date"]},lte:{label:"Inférieur ou égal",icon:"≤",types:["number","date"]},between:{label:"Entre",icon:"↔",types:["number","date"]},is_empty:{label:"Est vide",icon:"∅",types:["text","email","phone","url","number","date","textarea","title","select","boolean","checkbox","switch","relation","classification"]},is_not_empty:{label:"N'est pas vide",icon:"∃",types:["text","email","phone","url","number","date","textarea","title","select","boolean","checkbox","switch","relation","classification"]}};function Je(t){const r=String(t||"text").toLowerCase();return Object.entries(mt).filter(([i,a])=>a.types.includes(r)).map(([i,a])=>({key:i,...a}))}function it(t){return["number","currency","percent"].includes(t)?"number":["date","datetime"].includes(t)?"date":"text"}function Nr({columns:t=[],fieldFilters:r=[],onFieldFiltersChange:i,allRecords:a=[],sidebarFilters:l=[]}){const[v,n]=s.useState(r.length>0),[b,m]=s.useState(null),[p,g]=s.useState(!1),x=s.useRef(null);s.useEffect(()=>{const u=V=>{p&&x.current&&!x.current.contains(V.target)&&g(!1)};return p&&document.addEventListener("mousedown",u),()=>document.removeEventListener("mousedown",u)},[p]);const T=We.useMemo(()=>{const u={};return l.forEach(V=>{u[`classif:${V.id}`]=V.options||[]}),u},[l]),k=t.filter(u=>u.id!=="actions"),N=s.useCallback(u=>{const V=k.find(H=>H.id===u);if(!V)return;const S=u.startsWith("classif:"),C=Je(V.type),c=S?C.find(H=>H.key==="equals")||C[0]:C.find(H=>H.key==="contains")||C[0],z={fieldId:u,fieldName:V.name,fieldType:V.type||"text",operator:c.key,value:"",value2:"",logic:"AND"};i([...r,z]),g(!1),m(r.length)},[k,r,i]),R=s.useCallback((u,V)=>{const S=r.map((C,c)=>c===u?{...C,...V}:C);i(S)},[r,i]),Q=s.useCallback(u=>{const V=r.filter((S,C)=>C!==u);i(V),b===u&&m(null)},[r,i,b]),w=s.useCallback(()=>{i([]),m(null)},[i]),U=u=>["is_empty","is_not_empty"].includes(u),D=u=>u==="between",se=u=>u&&u.startsWith("classif:"),Y=u=>["boolean","checkbox","switch","toggle"].includes(String(u||"").toLowerCase()),ee=u=>T[u]||[],P=(u,V)=>{const C=ee(u).find(c=>c.id===V||c.label===V);return C?C.label:V};return e.jsxs("div",{className:"adv-filters-container",children:[e.jsxs("button",{type:"button",className:"adv-filters-header",onClick:()=>n(!v),children:[e.jsxs("div",{className:"adv-filters-header-left",children:[e.jsx("svg",{viewBox:"0 0 24 24",fill:"none",className:"adv-filters-header-icon",children:e.jsx("path",{d:"M22 3H2L10 12.46V19L14 21V12.46L22 3Z",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round"})}),e.jsx("span",{children:"Filtres avancés"}),r.length>0&&e.jsx("span",{className:"adv-filters-count",children:r.length})]}),e.jsx("svg",{viewBox:"0 0 24 24",fill:"none",className:`adv-filters-chevron ${v?"adv-filters-chevron--open":""}`,children:e.jsx("path",{d:"M9 18L15 12L9 6",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round"})})]}),v&&e.jsxs("div",{className:"adv-filters-body",children:[r.map((u,V)=>{var te;k.find(K=>K.id===u.fieldId);const S=Je(u.fieldType),C=b===V,c=se(u.fieldId),z=c?ee(u.fieldId):[],H=u.logic||"AND";return e.jsxs(We.Fragment,{children:[V>0&&e.jsxs("div",{className:"adv-filter-connector",children:[e.jsx("span",{className:"adv-filter-connector-line"}),e.jsx("button",{type:"button",className:`adv-filter-connector-badge ${H==="OR"?"adv-filter-connector-badge--or":""}`,onClick:()=>{R(V,{logic:H==="AND"?"OR":"AND"})},title:"Cliquez pour basculer entre ET/OU",children:H==="OR"?"OU":"ET"}),e.jsx("span",{className:"adv-filter-connector-line"})]}),e.jsx("div",{className:`adv-filter-pill ${C?"adv-filter-pill--editing":""}`,children:C?e.jsxs("div",{className:"adv-filter-edit",children:[e.jsxs("div",{className:"adv-filter-row",children:[e.jsx("label",{className:"adv-filter-label",children:"Champ"}),e.jsx("select",{value:u.fieldId,onChange:K=>{const de=k.find(pe=>pe.id===K.target.value);if(de){const pe=Je(de.type),j=K.target.value.startsWith("classif:")?pe.find(E=>E.key==="equals")||pe[0]:pe.find(E=>E.key===u.operator)||pe[0];R(V,{fieldId:de.id,fieldName:de.name,fieldType:de.type||"text",operator:j.key,value:"",value2:""})}},className:"adv-filter-select",children:k.map(K=>e.jsx("option",{value:K.id,children:K.name},K.id))})]}),e.jsxs("div",{className:"adv-filter-row",children:[e.jsx("label",{className:"adv-filter-label",children:"Condition"}),e.jsx("select",{value:u.operator,onChange:K=>R(V,{operator:K.target.value,value:U(K.target.value)?"":u.value,value2:""}),className:"adv-filter-select",children:S.map(K=>e.jsx("option",{value:K.key,children:K.label},K.key))})]}),!U(u.operator)&&e.jsxs("div",{className:"adv-filter-row",children:[e.jsx("label",{className:"adv-filter-label",children:D(u.operator)?"Valeur min":"Valeur"}),c&&z.length>0?e.jsxs("select",{value:u.value,onChange:K=>R(V,{value:K.target.value}),className:"adv-filter-select",children:[e.jsx("option",{value:"",children:"Sélectionnez..."}),z.map(K=>e.jsx("option",{value:K.label,children:K.label},K.id))]}):Y(u.fieldType)?e.jsxs("select",{value:String(u.value??""),onChange:K=>R(V,{value:K.target.value}),className:"adv-filter-select",children:[e.jsx("option",{value:"",children:"Sélectionnez..."}),e.jsx("option",{value:"true",children:"Oui"}),e.jsx("option",{value:"false",children:"Non"})]}):e.jsx("input",{type:it(u.fieldType),value:u.value,onChange:K=>R(V,{value:K.target.value}),placeholder:"Saisir une valeur...",className:"adv-filter-input",autoFocus:!0})]}),D(u.operator)&&e.jsxs("div",{className:"adv-filter-row",children:[e.jsx("label",{className:"adv-filter-label",children:"Valeur max"}),e.jsx("input",{type:it(u.fieldType),value:u.value2||"",onChange:K=>R(V,{value2:K.target.value}),placeholder:"Saisir une valeur max...",className:"adv-filter-input"})]}),e.jsxs("div",{className:"adv-filter-row adv-filter-row--actions",children:[e.jsxs("button",{type:"button",className:"adv-filter-btn-done",onClick:()=>m(null),children:[e.jsx("svg",{viewBox:"0 0 24 24",fill:"none",className:"h-3.5 w-3.5",children:e.jsx("path",{d:"M5 13L9 17L19 7",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round"})}),"OK"]}),e.jsx("button",{type:"button",className:"adv-filter-btn-delete",onClick:()=>Q(V),children:e.jsxs("svg",{viewBox:"0 0 24 24",fill:"none",className:"h-3.5 w-3.5",children:[e.jsx("path",{d:"M20.5001 6H3.5",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"}),e.jsx("path",{d:"M18.8334 8.5L18.3735 15.3991C18.1965 18.054 18.108 19.3815 17.243 20.1907C16.378 21 15.0476 21 12.3868 21H11.6134C8.9526 21 7.6222 21 6.75719 20.1907C5.89218 19.3815 5.80368 18.054 5.62669 15.3991L5.16675 8.5",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"})]})})]})]}):e.jsxs("button",{type:"button",className:"adv-filter-pill-summary",onClick:()=>m(V),children:[e.jsx("span",{className:"adv-filter-pill-field",children:u.fieldName}),e.jsx("span",{className:"adv-filter-pill-op",children:((te=mt[u.operator])==null?void 0:te.label)||u.operator}),!U(u.operator)&&e.jsx("span",{className:"adv-filter-pill-value",children:D(u.operator)?`${u.value||"?"} – ${u.value2||"?"}`:c?P(u.fieldId,u.value):u.value||"..."}),e.jsx("button",{type:"button",className:"adv-filter-pill-remove",onClick:K=>{K.stopPropagation(),Q(V)},children:e.jsx("svg",{viewBox:"0 0 24 24",fill:"none",className:"h-3 w-3",children:e.jsx("path",{d:"M18 6L6 18M6 6L18 18",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round"})})})]})})]},V)}),e.jsxs("div",{className:"adv-filter-add-row",ref:x,children:[e.jsxs("button",{type:"button",className:"adv-filter-add-btn",onClick:()=>g(!p),children:[e.jsx("svg",{viewBox:"0 0 24 24",fill:"none",className:"h-3.5 w-3.5",children:e.jsx("path",{d:"M12 5V19M5 12H19",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round"})}),"Ajouter un filtre"]}),p&&e.jsxs("div",{className:"adv-filter-field-dropdown",children:[e.jsx("div",{className:"adv-filter-field-dropdown-title",children:"Choisir un champ"}),k.map(u=>e.jsxs("button",{type:"button",className:"adv-filter-field-option",onClick:()=>N(u.id),children:[e.jsx("span",{className:"adv-filter-field-type-badge",children:Sr(u.type)}),u.name]},u.id))]})]}),r.length>0&&e.jsx("button",{type:"button",className:"adv-filter-clear",onClick:w,children:"Effacer tous les filtres"})]}),e.jsx("style",{children:`
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
            `})]})}function Sr(t){return{text:"Aa",title:"T",email:"@",phone:"☎",url:"🔗",number:"#",currency:"$",percent:"%",date:"📅",datetime:"🕐",textarea:"¶",select:"☰",relation:"↗",classification:"●"}[t]||"Aa"}const nt=229,ot=500,lt=280;function Lr({entityName:t,entityNamePlural:r,entityIcon:i,accountNumber:a,entitySlug:l,showSidebar:v,onToggleSidebar:n,filters:b=[],activeFilters:m={},onFilterChange:p,columns:g=[],fieldFilters:x=[],onFieldFiltersChange:T,allRecords:k=[],sidebarWidth:N,onSidebarWidthChange:R,viewId:Q}){const[w,U]=s.useState(N||lt),D=s.useRef(!1),se=s.useRef(0),Y=s.useRef(0),ee=s.useRef(N||lt),P=s.useRef(R);s.useEffect(()=>{P.current=R},[R]),s.useEffect(()=>{ee.current=w},[w]),s.useEffect(()=>{N&&!D.current&&U(N)},[N]);const u=s.useCallback(C=>{C.preventDefault(),D.current=!0,se.current=C.clientX,Y.current=ee.current,document.body.style.cursor="col-resize",document.body.style.userSelect="none"},[]);if(s.useEffect(()=>{const C=z=>{if(!D.current)return;const H=z.clientX-se.current,te=Math.min(ot,Math.max(nt,Y.current+H));U(te)},c=()=>{D.current&&(D.current=!1,document.body.style.cursor="",document.body.style.userSelect="",P.current&&P.current(ee.current))};return document.addEventListener("mousemove",C),document.addEventListener("mouseup",c),()=>{document.removeEventListener("mousemove",C),document.removeEventListener("mouseup",c)}},[]),!v)return null;const V=(C,c)=>{const z={...m},H=z[C]||[];if(c==="__all__")delete z[C];else{const te=H.indexOf(c);te>-1?(H.splice(te,1),H.length===0?delete z[C]:z[C]=[...H]):z[C]=[...H,c]}p(z)},S=Object.keys(m).length>0;return e.jsxs("div",{style:{position:"relative",width:w,minWidth:nt,maxWidth:ot,flexShrink:0},children:[e.jsxs("div",{className:"panel z-10 space-y-4 overflow-y-auto p-4 h-full",style:{display:"flex",flexDirection:"column",width:"100%"},children:[e.jsx("div",{className:"flex items-center justify-between",children:e.jsx("div",{className:"flex items-center",children:e.jsxs("div",{className:"flex items-center text-center",children:[e.jsx("div",{children:i?e.jsx("iconify-icon",{icon:i,width:"22",style:{color:"var(--primary)"}}):e.jsxs("svg",{width:"24",height:"24",viewBox:"0 0 24 24",fill:"none",xmlns:"http://www.w3.org/2000/svg",className:"h-5 w-5",children:[e.jsx("path",{d:"M20.3116 12.6473L20.8293 10.7154C21.4335 8.46034 21.7356 7.3328 21.5081 6.35703C21.3285 5.58657 20.9244 4.88668 20.347 4.34587C19.6157 3.66095 18.4881 3.35883 16.2331 2.75458C13.978 2.15033 12.8504 1.84821 11.8747 2.07573C11.1042 2.25537 10.4043 2.65945 9.86351 3.23687C9.27709 3.86298 8.97128 4.77957 8.51621 6.44561C8.43979 6.7254 8.35915 7.02633 8.27227 7.35057L8.27222 7.35077L7.75458 9.28263C7.15033 11.5377 6.84821 12.6652 7.07573 13.641C7.25537 14.4115 7.65945 15.1114 8.23687 15.6522C8.96815 16.3371 10.0957 16.6392 12.3508 17.2435L12.3508 17.2435C14.3834 17.7881 15.4999 18.0873 16.415 17.9744C16.5152 17.9621 16.6129 17.9448 16.7092 17.9223C17.4796 17.7427 18.1795 17.3386 18.7203 16.7612C19.4052 16.0299 19.7074 14.9024 20.3116 12.6473Z",stroke:"currentColor",strokeWidth:"1.5"}),e.jsx("path",{opacity:"0.5",d:"M16.415 17.9741C16.2065 18.6126 15.8399 19.1902 15.347 19.6519C14.6157 20.3368 13.4881 20.6389 11.2331 21.2432C8.97798 21.8474 7.85044 22.1495 6.87466 21.922C6.10421 21.7424 5.40432 21.3383 4.86351 20.7609C4.17859 20.0296 3.87647 18.9021 3.27222 16.647L2.75458 14.7151C2.15033 12.46 1.84821 11.3325 2.07573 10.3567C2.25537 9.58627 2.65945 8.88638 3.23687 8.34557C3.96815 7.66065 5.09569 7.35853 7.35077 6.75428C7.77741 6.63996 8.16368 6.53646 8.51621 6.44531",stroke:"currentColor",strokeWidth:"1.5"}),e.jsx("path",{d:"M11.7769 10L16.6065 11.2941",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"}),e.jsx("path",{opacity:"0.5",d:"M11 12.8975L13.8978 13.6739",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"})]})}),e.jsx("h3",{className:"text-lg font-semibold ltr:ml-3 rtl:mr-3",children:t})]})})}),e.jsx("div",{className:"h-px w-full border-b border-[#e0e6ed] dark:border-[#1b2e4b]"}),e.jsx("div",{className:"!mt-0",style:{flex:1,display:"flex",flexDirection:"column"},children:e.jsxs("div",{className:"flex h-full flex-col pb-16",style:{position:"relative"},children:[e.jsx("div",{className:"relative -mr-3.5 h-full grow pr-3.5 overflow-auto",children:e.jsxs("div",{className:"space-y-1",children:[e.jsx("button",{type:"button",className:`flex h-10 w-full items-center justify-between rounded-md p-2 font-medium hover:bg-white-dark/10 hover:text-primary dark:hover:bg-[#181F32] dark:hover:text-primary ${S?"":"bg-gray-100 dark:text-primary text-primary dark:bg-[#181F32]"}`,onClick:()=>p({}),children:e.jsxs("div",{className:"flex items-center",children:[e.jsx("iconify-icon",{icon:"solar:checklist-minimalistic-bold-duotone",width:"20"}),e.jsxs("div",{className:"ltr:ml-3 rtl:mr-3",children:["Toutes les ",r||t+"s"]})]})}),b.map(C=>e.jsxs("div",{children:[e.jsx("div",{className:"h-px w-full border-b border-[#e0e6ed] dark:border-[#1b2e4b] my-2"}),e.jsx("div",{className:"px-1 py-2 text-white-dark text-xs uppercase font-semibold tracking-wider",children:C.name}),C.type==="tags"?e.jsx("div",{className:"flex flex-wrap gap-1.5 px-1",children:C.options.map(c=>{const z=(m[C.id]||[]).includes(c.id);return e.jsxs("button",{type:"button",className:"mb-0 py-0.5 px-2.5 text-xs rounded-full cursor-pointer transition-all font-medium",style:{border:`1.5px solid ${c.color||"#9ca3af"}`,color:z?"#fff":c.color||"#9ca3af",backgroundColor:z?c.color||"#9ca3af":"transparent"},onClick:()=>V(C.id,c.id),children:[c.label,c.count!==void 0&&e.jsx("span",{style:{opacity:.7,marginLeft:"2px"},children:c.count})]},c.id)})}):e.jsx("div",{className:"space-y-0.5",children:C.options.map(c=>{const z=(m[C.id]||[]).includes(c.id);return e.jsxs("button",{type:"button",className:`flex h-9 w-full items-center rounded-md px-2 py-1.5 text-sm font-medium transition-colors hover:bg-white-dark/10 hover:text-primary dark:hover:bg-[#181F32] dark:hover:text-primary ${z?"bg-gray-100 text-primary dark:bg-[#181F32] dark:text-primary":""}`,onClick:()=>V(C.id,c.id),children:[e.jsx("span",{className:"inline-block w-3 h-3 rounded-full mr-2.5 flex-shrink-0",style:{backgroundColor:c.color||"#9ca3af"}}),e.jsx("span",{className:"truncate",children:c.label}),c.count!==void 0&&e.jsx("span",{className:"ml-auto text-xs opacity-60",children:c.count})]},c.id)})})]},C.id)),e.jsx(Nr,{columns:g,fieldFilters:x,onFieldFiltersChange:T,allRecords:k,sidebarFilters:b})]})}),e.jsx("div",{className:"absolute bottom-0 w-full p-4 left-0",children:e.jsxs("button",{type:"button",className:"btn btn-primary w-full",onClick:async()=>{try{const c=await(await fetch(`/account/${a}/record/api/create-draft`,{method:"POST",headers:{"Content-Type":"application/json"},credentials:"include",body:JSON.stringify({entitySlug:l,viewId:Q})})).json();c.success&&c._id&&(window.location.href=we(a,l,c._id,"fiche"))}catch(C){console.error("[CreateDraft]",C)}},children:[e.jsxs("svg",{xmlns:"http://www.w3.org/2000/svg",width:"24px",height:"24px",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round",className:"h-5 w-5 ltr:mr-2 rtl:ml-2",children:[e.jsx("line",{x1:"12",y1:"5",x2:"12",y2:"19"}),e.jsx("line",{x1:"5",y1:"12",x2:"19",y2:"12"})]}),"Ajouter"]})})]})})]}),e.jsx("div",{onMouseDown:u,style:{position:"absolute",top:0,right:-3,width:6,height:"100%",cursor:"col-resize",zIndex:20,display:"flex",alignItems:"center",justifyContent:"center"},onMouseEnter:C=>{C.currentTarget.querySelector(".resize-bar").style.opacity="1"},onMouseLeave:C=>{D.current||(C.currentTarget.querySelector(".resize-bar").style.opacity="0")},children:e.jsx("div",{className:"resize-bar",style:{width:3,height:"100%",borderRadius:2,background:"var(--primary, #4361ee)",opacity:0,transition:"opacity 0.2s ease"}})})]})}const Mr=["#4361ee","#805dca","#e2a03f","#00ab55","#e7515a","#2196d4","#3b3f5c","#009688","#ff5722","#607d8b"],_r={contains:{label:"Contient",icon:"⊃",types:["text","email","phone","url","textarea","title","relation"]},not_contains:{label:"Ne contient pas",icon:"⊅",types:["text","email","phone","url","textarea","title","relation"]},equals:{label:"Est égal à",icon:"=",types:["text","email","phone","url","number","date","title","select","boolean","checkbox","switch","relation","classification"]},not_equals:{label:"N'est pas égal à",icon:"≠",types:["text","email","phone","url","number","date","title","select","boolean","checkbox","switch","relation","classification"]},starts_with:{label:"Commence par",icon:"A…",types:["text","email","phone","url","title"]},ends_with:{label:"Se termine par",icon:"…Z",types:["text","email","phone","url","title"]},gt:{label:"Supérieur à",icon:">",types:["number","date"]},gte:{label:"Supérieur ou égal",icon:"≥",types:["number","date"]},lt:{label:"Inférieur à",icon:"<",types:["number","date"]},lte:{label:"Inférieur ou égal",icon:"≤",types:["number","date"]},between:{label:"Entre",icon:"↔",types:["number","date"]},is_empty:{label:"Est vide",icon:"∅",types:["text","email","phone","url","number","date","textarea","title","select","boolean","checkbox","switch","relation","classification"]},is_not_empty:{label:"N'est pas vide",icon:"∃",types:["text","email","phone","url","number","date","textarea","title","select","boolean","checkbox","switch","relation","classification"]}};function qe(t){const r=String(t||"text").toLowerCase();return Object.entries(_r).filter(([i,a])=>a.types.includes(r)).map(([i,a])=>({key:i,...a}))}function dt(t){return["number","currency","percent"].includes(t)?"number":["date","datetime"].includes(t)?"date":"text"}function Ir({savedViews:t=[],activeViewId:r,onSelectView:i,onCreateView:a,onDeleteView:l,onRenameView:v,onUpdateViewFilters:n,hasActiveFilters:b=!1,activeFilters:m={},fieldFilters:p=[],sidebarFilters:g=[],columns:x=[],externalOpenCreate:T=!1,onCloseExternalCreate:k}){const[N,R]=s.useState(!1),[Q,w]=s.useState(!1),[U,D]=s.useState(""),[se,Y]=s.useState("#4361ee"),[ee,P]=s.useState(null),[u,V]=s.useState(null),[S,C]=s.useState(""),[c,z]=s.useState(null),[H,te]=s.useState([]),[K,de]=s.useState({}),[pe,L]=s.useState(!1),j=s.useRef(null),E=s.useRef(null),y=s.useRef(null),M=s.useRef(null);s.useEffect(()=>{const h=O=>{ee&&E.current&&!E.current.contains(O.target)&&P(null)};return ee&&document.addEventListener("mousedown",h),()=>document.removeEventListener("mousedown",h)},[ee]),s.useEffect(()=>{N&&y.current&&setTimeout(()=>{var h;return(h=y.current)==null?void 0:h.focus()},100)},[N]),s.useEffect(()=>{T&&(R(!0),te([...p]),k==null||k())},[T]),s.useEffect(()=>{N&&!c&&(te([...p]),de(JSON.parse(JSON.stringify(m||{}))))},[N]),s.useEffect(()=>{const h=O=>{pe&&j.current&&!j.current.contains(O.target)&&L(!1)};return pe&&document.addEventListener("mousedown",h),()=>document.removeEventListener("mousedown",h)},[pe]),s.useEffect(()=>{u&&M.current&&(M.current.focus(),M.current.select())},[u]);const W=(h,O)=>{h.preventDefault(),P({viewId:O,x:h.clientX,y:h.clientY})},$=()=>{U.trim()&&(a({name:U.trim(),color:se,filters:K,fieldFilters:H}),D(""),Y("#4361ee"),te([]),de({}),R(!1))},ne=s.useMemo(()=>x.filter(h=>h.id!=="actions"),[x]),ae=s.useMemo(()=>{const h={};return g.forEach(O=>{h[`classif:${O.id}`]=O.options||[]}),h},[g]),f=s.useCallback(h=>{const O=ne.find(me=>me.id===h);if(!O)return;const re=h.startsWith("classif:"),he=qe(O.type),be=re?he.find(me=>me.key==="equals")||he[0]:he.find(me=>me.key==="contains")||he[0],oe={fieldId:h,fieldName:O.name,fieldType:O.type||"text",operator:be.key,value:"",value2:"",logic:"AND"};te(me=>[...me,oe]),L(!1)},[ne]),I=s.useCallback((h,O)=>{te(re=>re.map((he,be)=>be===h?{...he,...O}:he))},[]),o=s.useCallback(h=>{te(O=>O.filter((re,he)=>he!==h))},[]),B=h=>{const O=t.find(re=>re._id===h);O&&(V(h),C(O.name)),P(null)},q=()=>{u&&S.trim()&&v(u,S.trim()),V(null),C("")},X=h=>{l(h),P(null)},J=h=>{const O=t.find(re=>re._id===h);O&&(z(h),D(O.name||""),Y(O.color||"#4361ee"),te(O.fieldFilters?JSON.parse(JSON.stringify(O.fieldFilters)):[]),de(O.filters?JSON.parse(JSON.stringify(O.filters)):{}),R(!0),P(null))},G=()=>{!U.trim()||!c||(n(c,K,H,U.trim(),se),D(""),Y("#4361ee"),te([]),de({}),z(null),R(!1))},fe=h=>{var re;let O=0;return h.filters&&(O+=Object.keys(h.filters).filter(he=>he!=="__favourites").length),(re=h.fieldFilters)!=null&&re.length&&(O+=h.fieldFilters.length),O};return e.jsxs(e.Fragment,{children:[e.jsxs("div",{className:"saved-views-tabs",children:[e.jsxs("button",{type:"button",className:`saved-view-tab ${r?"":"saved-view-tab--active"}`,onClick:()=>i(null),children:[e.jsxs("svg",{className:"saved-view-tab-icon",viewBox:"0 0 24 24",fill:"none",children:[e.jsx("path",{d:"M2 12C2 7.28595 2 4.92893 3.46447 3.46447C4.92893 2 7.28595 2 12 2C16.714 2 19.0711 2 20.5355 3.46447C22 4.92893 22 7.28595 22 12C22 16.714 22 19.0711 20.5355 20.5355C19.0711 22 16.714 22 12 22C7.28595 22 4.92893 22 3.46447 20.5355C2 19.0711 2 16.714 2 12Z",stroke:"currentColor",strokeWidth:"1.5"}),e.jsx("path",{d:"M6 12H18",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"}),e.jsx("path",{d:"M6 8H18",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"}),e.jsx("path",{d:"M6 16H18",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"})]}),"Tout"]}),t.map(h=>e.jsx("button",{type:"button",className:`saved-view-tab ${r===h._id?"saved-view-tab--active":""}`,style:{"--tab-color":h.color||"#4361ee"},onClick:()=>i(h._id),onContextMenu:O=>W(O,h._id),children:u===h._id?e.jsx("input",{ref:M,type:"text",value:S,onChange:O=>C(O.target.value),onBlur:q,onKeyDown:O=>{O.key==="Enter"&&q(),O.key==="Escape"&&(V(null),C(""))},className:"saved-view-tab-edit-input",onClick:O=>O.stopPropagation()}):e.jsxs(e.Fragment,{children:[e.jsx("span",{className:"saved-view-tab-dot",style:{backgroundColor:h.color||"#4361ee"}}),e.jsx("span",{className:"saved-view-tab-name",children:h.name}),fe(h)>0&&e.jsx("span",{className:"saved-view-tab-badge",children:fe(h)})]})},h._id)),e.jsx("button",{type:"button",className:"saved-view-tab saved-view-tab--add",onClick:()=>{z(null),D(""),Y("#4361ee"),R(!0)},title:"Enregistrer une vue",children:e.jsx("svg",{viewBox:"0 0 24 24",fill:"none",className:"h-3.5 w-3.5",children:e.jsx("path",{d:"M12 5V19M5 12H19",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round"})})})]}),ee&&e.jsxs("div",{ref:E,className:"saved-view-context-menu",style:{position:"fixed",top:ee.y,left:ee.x,zIndex:10001},children:[e.jsxs("button",{className:"saved-view-context-item",onClick:()=>B(ee.viewId),children:[e.jsx("svg",{viewBox:"0 0 24 24",fill:"none",className:"h-4 w-4",children:e.jsx("path",{d:"M13.9027 6.37027L17.6297 10.0973M4 20.0001H8L18.5 9.50006C18.9978 9.00236 19.2786 8.32622 19.2786 7.62142C19.2786 6.91661 18.9978 6.24047 18.5 5.74277C18.0023 5.24508 17.3261 4.96426 16.6213 4.96426C15.9165 4.96426 15.2404 5.24508 14.7427 5.74277L4 16.0001V20.0001Z",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round"})}),"Renommer"]}),e.jsxs("button",{className:"saved-view-context-item",onClick:()=>J(ee.viewId),children:[e.jsxs("svg",{viewBox:"0 0 24 24",fill:"none",className:"h-4 w-4",children:[e.jsx("path",{d:"M4.06189 13C4.02104 12.6724 4 12.3387 4 12C4 7.58172 7.58172 4 12 4C14.5006 4 16.7332 5.14727 18.2002 6.94416M19.9381 11C19.979 11.3276 20 11.6613 20 12C20 16.4183 16.4183 20 12 20C9.49944 20 7.26681 18.8527 5.79984 17.0558",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round"}),e.jsx("path",{d:"M15 7H19V3",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round"}),e.jsx("path",{d:"M9 17H5V21",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round"})]}),"Modifier la vue"]}),e.jsx("div",{className:"saved-view-context-separator"}),e.jsxs("button",{className:"saved-view-context-item saved-view-context-item--danger",onClick:()=>X(ee.viewId),children:[e.jsxs("svg",{viewBox:"0 0 24 24",fill:"none",className:"h-4 w-4",children:[e.jsx("path",{d:"M20.5001 6H3.5",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"}),e.jsx("path",{d:"M18.8334 8.5L18.3735 15.3991C18.1965 18.054 18.108 19.3815 17.243 20.1907C16.378 21 15.0476 21 12.3868 21H11.6134C8.9526 21 7.6222 21 6.75719 20.1907C5.89218 19.3815 5.80368 18.054 5.62669 15.3991L5.16675 8.5",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"}),e.jsx("path",{d:"M9.5 11L10 16",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"}),e.jsx("path",{d:"M14.5 11L14 16",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"}),e.jsx("path",{d:"M6.5 6C6.55588 6 6.58382 6 6.60915 5.99936C7.43259 5.97849 8.15902 5.45491 8.43922 4.68032C8.44784 4.65649 8.45667 4.62999 8.47434 4.57697L8.57143 4.28571C8.65431 4.03708 8.69575 3.91276 8.75071 3.8072C8.97001 3.38607 9.37574 3.09364 9.84461 3.01877C9.96213 3 10.0932 3 10.3553 3H13.6447C13.9068 3 14.0379 3 14.1554 3.01877C14.6243 3.09364 15.03 3.38607 15.2493 3.8072C15.3043 3.91276 15.3457 4.03708 15.4286 4.28571L15.5257 4.57697C15.5433 4.62992 15.5522 4.65651 15.5608 4.68032C15.841 5.45491 16.5674 5.97849 17.3909 5.99936C17.4162 6 17.4441 6 17.5 6",stroke:"currentColor",strokeWidth:"1.5"})]}),"Supprimer"]})]}),N&&e.jsx("div",{className:"saved-view-modal-overlay",onClick:()=>R(!1),children:e.jsxs("div",{className:"saved-view-modal",onClick:h=>h.stopPropagation(),children:[e.jsxs("div",{className:"saved-view-modal-header",children:[e.jsx("h3",{children:c?"Modifier la vue":"Enregistrer la vue"}),e.jsx("button",{type:"button",className:"saved-view-modal-close",onClick:()=>{R(!1),z(null)},children:e.jsx("svg",{viewBox:"0 0 24 24",fill:"none",className:"h-5 w-5",children:e.jsx("path",{d:"M18 6L6 18M6 6L18 18",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"})})})]}),e.jsxs("div",{className:"saved-view-modal-body",children:[e.jsxs("div",{className:"saved-view-form-group",children:[e.jsx("label",{className:"saved-view-form-label",children:"Nom de la vue"}),e.jsx("input",{ref:y,type:"text",value:U,onChange:h=>D(h.target.value),onKeyDown:h=>{h.key==="Enter"&&$()},placeholder:"Ex: Hôtels, Clients VIP...",className:"saved-view-form-input"})]}),e.jsxs("div",{className:"saved-view-form-group",children:[e.jsx("label",{className:"saved-view-form-label",children:"Couleur"}),e.jsx("div",{className:"saved-view-color-grid",children:Mr.map(h=>e.jsx("button",{type:"button",className:`saved-view-color-swatch ${se===h?"saved-view-color-swatch--active":""}`,style:{backgroundColor:h},onClick:()=>Y(h),children:se===h&&e.jsx("svg",{viewBox:"0 0 24 24",fill:"none",className:"h-3 w-3",children:e.jsx("path",{d:"M5 13L9 17L19 7",stroke:"white",strokeWidth:"2.5",strokeLinecap:"round",strokeLinejoin:"round"})})},h))})]}),g.length>0&&e.jsxs("div",{className:"saved-view-form-group",children:[e.jsx("label",{className:"saved-view-form-label",children:"Filtres de classification"}),e.jsx("div",{className:"svm-classif-editor",children:g.map(h=>{const O=K[h.id]||[];return e.jsxs("div",{className:"svm-classif-group",children:[e.jsx("span",{className:"svm-classif-group-label",children:h.name}),e.jsx("div",{className:"svm-classif-options",children:(h.options||[]).map(re=>{const he=O.includes(re.id);return e.jsxs("button",{type:"button",className:`svm-classif-pill ${he?"svm-classif-pill--active":""}`,style:{"--pill-color":re.color||"#9ca3af"},onClick:()=>{de(be=>{const oe=be[h.id]||[];let me;he?me=oe.filter(ve=>ve!==re.id):me=[...oe,re.id];const ce={...be};return me.length>0?ce[h.id]=me:delete ce[h.id],ce})},children:[he&&e.jsx("svg",{viewBox:"0 0 24 24",fill:"none",className:"svm-classif-check",children:e.jsx("path",{d:"M5 13L9 17L19 7",stroke:"currentColor",strokeWidth:"2.5",strokeLinecap:"round",strokeLinejoin:"round"})}),re.label]},re.id)})})]},h.id)})})]}),e.jsxs("div",{className:"saved-view-form-group",children:[e.jsx("label",{className:"saved-view-form-label",children:"Filtres avancés"}),e.jsxs("div",{className:"svm-filter-builder",children:[H.map((h,O)=>{var Ee;const re=(Ee=h.fieldId)==null?void 0:Ee.startsWith("classif:"),he=re?ae[h.fieldId]||[]:[],be=qe(h.fieldType),oe=["is_empty","is_not_empty"].includes(h.operator),me=h.operator==="between",ce=["boolean","checkbox","switch","toggle"].includes(String(h.fieldType||"").toLowerCase()),ve=h.logic||"AND";return e.jsxs(We.Fragment,{children:[O>0&&e.jsxs("div",{className:"svm-filter-connector",children:[e.jsx("span",{className:"svm-filter-connector-line"}),e.jsx("button",{type:"button",className:`svm-filter-connector-badge ${ve==="OR"?"svm-filter-connector-badge--or":""}`,onClick:()=>I(O,{logic:ve==="AND"?"OR":"AND"}),title:"Cliquez pour basculer ET/OU",children:ve==="OR"?"OU":"ET"}),e.jsx("span",{className:"svm-filter-connector-line"})]}),e.jsxs("div",{className:"svm-filter-row",children:[e.jsx("select",{value:h.fieldId,onChange:ue=>{const Le=ne.find(Fe=>Fe.id===ue.target.value);if(Le){const Fe=ue.target.value.startsWith("classif:"),_e=qe(Le.type),Ve=Fe?_e.find(Re=>Re.key==="equals")||_e[0]:_e.find(Re=>Re.key===h.operator)||_e[0];I(O,{fieldId:Le.id,fieldName:Le.name,fieldType:Le.type||"text",operator:Ve.key,value:"",value2:""})}},className:"svm-filter-select svm-filter-select--field",children:ne.map(ue=>e.jsx("option",{value:ue.id,children:ue.name},ue.id))}),e.jsx("select",{value:h.operator,onChange:ue=>I(O,{operator:ue.target.value,value:["is_empty","is_not_empty"].includes(ue.target.value)?"":h.value,value2:""}),className:"svm-filter-select svm-filter-select--op",children:be.map(ue=>e.jsx("option",{value:ue.key,children:ue.label},ue.key))}),!oe&&(re&&he.length>0?e.jsxs("select",{value:h.value,onChange:ue=>I(O,{value:ue.target.value}),className:"svm-filter-select svm-filter-select--val",children:[e.jsx("option",{value:"",children:"Sélectionnez..."}),he.map(ue=>e.jsx("option",{value:ue.label,children:ue.label},ue.id))]}):ce?e.jsxs("select",{value:String(h.value??""),onChange:ue=>I(O,{value:ue.target.value}),className:"svm-filter-select svm-filter-select--val",children:[e.jsx("option",{value:"",children:"Sélectionnez..."}),e.jsx("option",{value:"true",children:"Oui"}),e.jsx("option",{value:"false",children:"Non"})]}):e.jsx("input",{type:dt(h.fieldType),value:h.value,onChange:ue=>I(O,{value:ue.target.value}),placeholder:"Valeur...",className:"svm-filter-input"})),me&&e.jsx("input",{type:dt(h.fieldType),value:h.value2||"",onChange:ue=>I(O,{value2:ue.target.value}),placeholder:"Max...",className:"svm-filter-input"}),e.jsx("button",{type:"button",className:"svm-filter-remove",onClick:()=>o(O),title:"Supprimer ce filtre",children:e.jsx("svg",{viewBox:"0 0 24 24",fill:"none",className:"h-3.5 w-3.5",children:e.jsx("path",{d:"M18 6L6 18M6 6L18 18",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round"})})})]})]},O)}),e.jsxs("div",{className:"svm-filter-add-row",ref:j,children:[e.jsxs("button",{type:"button",className:"svm-filter-add-btn",onClick:()=>L(!pe),children:[e.jsx("svg",{viewBox:"0 0 24 24",fill:"none",className:"h-3.5 w-3.5",children:e.jsx("path",{d:"M12 5V19M5 12H19",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round"})}),"Ajouter un filtre"]}),pe&&e.jsxs("div",{className:"svm-filter-field-dropdown",children:[e.jsx("div",{className:"svm-filter-field-dropdown-title",children:"Choisir un champ"}),ne.map(h=>e.jsx("button",{type:"button",className:"svm-filter-field-option",onClick:()=>f(h.id),children:h.name},h.id))]})]})]})]})]}),e.jsxs("div",{className:"saved-view-modal-footer",children:[e.jsx("button",{type:"button",className:"saved-view-btn saved-view-btn--cancel",onClick:()=>{R(!1),z(null)},children:"Annuler"}),e.jsxs("button",{type:"button",className:"saved-view-btn saved-view-btn--save",onClick:c?G:$,disabled:!U.trim(),children:[e.jsx("svg",{viewBox:"0 0 24 24",fill:"none",className:"h-4 w-4",children:e.jsx("path",{d:"M5 13L9 17L19 7",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round"})}),c?"Mettre à jour":"Enregistrer"]})]})]})}),e.jsx("style",{children:`
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
            `})]})}const Ue=[{label:"Nouveau",color:"#64748b"},{label:"Qualification",color:"#3b82f6"},{label:"Proposition",color:"#f59e0b"},{label:"Gagné",color:"#22c55e"},{label:"Perdu",color:"#ef4444"}],Tr=new Set(["select","multiselect","multi-select","multi_select","tags","tag"]);function $e(t){var r;return String(((r=t==null?void 0:t._id)==null?void 0:r.$oid)||(t==null?void 0:t._id)||t||"")}function $r(t){return String(t||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,"")||`pipeline-${Date.now()}`}function ct(t,r){const i=$e((t==null?void 0:t._id)||(t==null?void 0:t.id)||(t==null?void 0:t.value)||(t==null?void 0:t.label)||(t==null?void 0:t.name)||t);return{id:i,value:String((t==null?void 0:t.value)??i),label:(t==null?void 0:t.label)||(t==null?void 0:t.name)||String((t==null?void 0:t.value)||i||`Étape ${r+1}`),color:(t==null?void 0:t.color)||(t==null?void 0:t.couleur)||"#6366f1",order:Number.isFinite(Number(t==null?void 0:t.order))?Number(t.order):r}}function Er(t,r){if(!t)return{value:"",label:`Option ${r+1}`,color:"#64748b",order:r};if(typeof t=="string")return{value:t,label:t,color:"#64748b",order:r};const i=String(t.value??t.id??t._id??t.label??t.name??"");return{value:i,label:t.label||t.name||i||`Option ${r+1}`,color:t.color||t.couleur||t.bg||"#64748b",order:Number.isFinite(Number(t.order))?Number(t.order):r}}function Fr(t,r=[]){const i=[],a=new Set,l=(n,b)=>{const m=$e(n);if(!m||a.has(m))return;a.add(m);const p=(n.options||[]).map(ct).sort((g,x)=>g.order-x.order);i.push({id:m,value:b==="status"?"status":m,label:n.name||(b==="status"?"Statut":"Pipeline"),source:b,options:p})},v=n=>{var k,N;const b=$e(n);if(!b||a.has(`field:${b}`))return;const m=n.type_config||n.typeConfig||{},p=String(n.fieldType||n.type||((k=n.render)==null?void 0:k.input)||"").toLowerCase(),g=String(((N=n.render)==null?void 0:N.input)||"").toLowerCase();if(!(p==="select"||g==="select")||m.multiple||!m.useAsPipeline)return;const T=(m.options||n.options||[]).map(ct).filter(R=>R.id||R.label).sort((R,Q)=>R.order-Q.order);a.add(`field:${b}`),i.push({id:b,value:`field:${b}`,label:n.label||n.name||"Pipeline",source:"field",typeConfig:m,options:T})};return t!=null&&t.statusClassification&&l(t.statusClassification,"status"),((t==null?void 0:t.classifications)||[]).forEach(n=>{l(n,"classification")}),r.forEach(n=>{l(n,"classification")}),((t==null?void 0:t.customFields)||[]).forEach(v),i}function Rr(t){return((t==null?void 0:t.customFields)||[]).filter(r=>r&&typeof r=="object").map(r=>{var v,n,b,m,p,g,x;const i=String(r.fieldType||r.type||((v=r.render)==null?void 0:v.input)||"").toLowerCase(),a=String(((b=(n=r.render)==null?void 0:n.display)==null?void 0:b.card)||((p=(m=r.render)==null?void 0:m.display)==null?void 0:p.table)||"").toLowerCase(),l=(((g=r.type_config)==null?void 0:g.options)||((x=r.typeConfig)==null?void 0:x.options)||r.options||[]).map(Er).filter(T=>T.value||T.label);return{id:$e(r),label:r.label||r.name||"Champ",type:i,options:l,eligible:Tr.has(i)||["badge","chip","chips","tags"].includes(a)||l.length>0}}).filter(r=>r.id&&r.eligible)}function Wr(t,r){if(!t.length)return"";const i=(r==null?void 0:r.kanbanField)||"status";if(i==="status"&&t.some(l=>l.value==="status"))return"status";const a=t.find(l=>l.value===i||l.id===i);return(a==null?void 0:a.value)||t[0].value}function Ke({icon:t,title:r,onClick:i,disabled:a,tone:l="neutral"}){const v=l==="danger"?"hover:border-red-200 hover:bg-red-50 hover:text-red-600 dark:hover:border-red-500/30 dark:hover:bg-red-950/30":"hover:border-primary/30 hover:bg-primary/5 hover:text-primary";return e.jsx("button",{type:"button",title:r,onClick:i,disabled:a,className:`grid h-8 w-8 place-items-center rounded-lg border border-gray-200 bg-white text-gray-400 transition disabled:opacity-40 dark:border-white/10 dark:bg-[#111827] dark:text-white-dark ${v}`,children:e.jsx("iconify-icon",{icon:t,width:"15"})})}function Or({open:t,accountNumber:r,entityId:i,entityData:a,viewId:l,viewSettings:v,onClose:n,onSaved:b}){const[m,p]=s.useState([]),g=s.useMemo(()=>Fr(a,m),[a,m]),x=s.useMemo(()=>Rr(a),[a]),[T,k]=s.useState(""),N=g.find(L=>L.value===T)||g[0]||null,[R,Q]=s.useState([]),[w,U]=s.useState([]),[D,se]=s.useState(""),[Y,ee]=s.useState([]),[P,u]=s.useState(!1),[V,S]=s.useState("");if(s.useEffect(()=>{t&&(S(""),k(L=>L&&g.some(j=>j.value===L)?L:Wr(g,v)),ee(Array.isArray(v==null?void 0:v.kanbanTagFields)?v.kanbanTagFields:[]),U([]))},[t,g,v]),s.useEffect(()=>{if(!t||!N){Q([]);return}Q(N.options.map(L=>({...L}))),U([])},[t,N==null?void 0:N.id]),!t)return null;const C=(L,j)=>{Q(E=>E.map(y=>y.id===L?{...y,...j}:y))},c=(L,j)=>{Q(E=>{const y=E.findIndex(ne=>ne.id===L),M=y+j;if(y<0||M<0||M>=E.length)return E;const W=[...E],[$]=W.splice(y,1);return W.splice(M,0,$),W})},z=()=>{const L=R.length,j=Ue[L%Ue.length];Q(E=>[...E,{id:`tmp_${Date.now()}_${L}`,label:j.label,color:j.color,order:L,isNew:!0}])},H=L=>{Q(j=>j.filter(E=>E.id!==L.id)),!L.isNew&&L.id&&U(j=>[...j,L.id])},te=L=>{ee(j=>j.includes(L)?j.filter(E=>E!==L):[...j,L])},K=async(L,j)=>{const E=await fetch(L,{method:"POST",headers:{"Content-Type":"application/json"},credentials:"include",body:JSON.stringify(j)}),y=await E.json().catch(()=>({}));if(!E.ok||y.error||y.success===!1)throw new Error(y.error||`Erreur HTTP ${E.status}`);return y},de=async()=>{const L=D.trim();if(!L){S("Nom requis");return}u(!0),S("");try{const E=(await K(`/account/${r}/classification/api/create`,{name:L,slug:$r(L),type:"status",entities:i?[i]:[],options:Ue})).classification;p(y=>[...y,E]),k($e(E)),se("")}catch(j){S(j.message||"Création impossible")}finally{u(!1)}},pe=async()=>{if(!N){S("Pipeline requise");return}const L=R.map((j,E)=>({...j,label:String(j.label||"").trim(),color:j.color||"#6366f1",order:E})).filter(j=>j.label);if(!L.length){S("Ajoute au moins une étape");return}u(!0),S("");try{const j=new Map(N.options.map(M=>[M.id,M])),E=[];if(N.source==="field"){const M=L.map((W,$)=>{const ne=String(W.value||(String(W.id).startsWith("tmp_")?W.label:W.id));return{label:W.label,value:ne,color:W.color,order:$}});await K(`/account/${r}/field-template/api/${N.id}/update`,{typeConfig:{...N.typeConfig||{},useAsPipeline:!0,options:M}}),E.push(...L.map((W,$)=>({...W,id:String(W.value||(String(W.id).startsWith("tmp_")?W.label:W.id)),order:$,isNew:!1})))}else{for(const M of L){if(M.isNew||M.id.startsWith("tmp_")){const $=await K(`/account/${r}/classification/api/fast-add`,{classificationId:N.id,label:M.label,color:M.color});E.push({...M,id:$e($.option),isNew:!1});continue}const W=j.get(M.id);W&&(W.label!==M.label||W.color!==M.color)&&await K(`/account/${r}/classification/api/update-option`,{classificationId:N.id,optionId:M.id,label:M.label,color:M.color}),E.push(M)}for(const M of w)await K(`/account/${r}/classification/api/delete-option`,{classificationId:N.id,optionId:M});await K(`/account/${r}/classification/api/reorder`,{classificationId:N.id,options:E.map((M,W)=>({id:M.id,order:W}))})}const y={...v||{},viewMode:"kanban",kanbanField:N.value,kanbanTagFields:Y.filter(M=>x.some(W=>W.id===M))};await K(`/account/${r}/api/view/config`,{viewId:l,settings:y}),b==null||b(y)}catch(j){S(j.message||"Sauvegarde impossible")}finally{u(!1)}};return Me.createPortal(e.jsx("div",{role:"dialog","aria-modal":"true",className:"fixed inset-0 flex items-center justify-center bg-slate-950/45 p-4",style:{zIndex:1e4},onMouseDown:L=>{L.target===L.currentTarget&&!P&&(n==null||n())},children:e.jsxs("div",{className:"flex max-h-[88vh] w-full max-w-4xl flex-col overflow-hidden rounded-lg border border-gray-100 bg-white shadow-2xl dark:border-white/10 dark:bg-[#0e1726]",onMouseDown:L=>L.stopPropagation(),children:[e.jsxs("div",{className:"flex items-center justify-between gap-3 border-b border-gray-100 px-5 py-4 dark:border-white/10",children:[e.jsxs("div",{className:"flex min-w-0 items-center gap-3",children:[e.jsx("div",{className:"grid h-9 w-9 place-items-center rounded-lg bg-primary/10 text-primary",children:e.jsx("iconify-icon",{icon:"solar:slider-horizontal-bold-duotone",width:"19"})}),e.jsxs("div",{className:"min-w-0",children:[e.jsx("div",{className:"truncate text-sm font-bold text-gray-900 dark:text-white",children:"Configurer la pipeline"}),e.jsx("div",{className:"truncate text-xs text-gray-400",children:(a==null?void 0:a.name)||"Entité"})]})]}),e.jsx("button",{type:"button",onClick:()=>!P&&(n==null?void 0:n()),className:"grid h-8 w-8 place-items-center rounded-lg bg-gray-100 text-gray-500 transition hover:bg-gray-200 dark:bg-dark/50 dark:text-white-dark dark:hover:bg-dark",title:"Fermer",children:e.jsx("iconify-icon",{icon:"solar:close-circle-bold",width:"17"})})]}),e.jsx("div",{className:"min-h-0 flex-1 overflow-y-auto p-5",children:e.jsxs("div",{className:"grid gap-5 lg:grid-cols-[minmax(0,1fr)_270px]",children:[e.jsxs("div",{className:"space-y-5",children:[e.jsxs("div",{className:"grid gap-3 rounded-lg border border-gray-100 bg-gray-50/70 p-3 dark:border-white/10 dark:bg-dark/20 md:grid-cols-[minmax(0,1fr)_minmax(220px,0.75fr)]",children:[e.jsxs("label",{className:"grid gap-1.5",children:[e.jsx("span",{className:"text-[11px] font-bold uppercase text-gray-400",children:"Champ pipeline"}),e.jsx("select",{value:T,onChange:L=>k(L.target.value),className:"form-select h-10 rounded-lg border-gray-200 bg-white text-sm font-semibold text-gray-800 dark:border-white/10 dark:bg-[#1b2e4b] dark:text-white",children:g.map(L=>e.jsx("option",{value:L.value,children:L.label},L.value))})]}),e.jsxs("div",{className:"grid gap-1.5",children:[e.jsx("span",{className:"text-[11px] font-bold uppercase text-gray-400",children:"Créer une pipeline"}),e.jsxs("div",{className:"flex gap-2",children:[e.jsx("input",{type:"text",value:D,onChange:L=>se(L.target.value),onKeyDown:L=>{L.key==="Enter"&&(L.preventDefault(),de())},className:"form-input h-10 min-w-0 flex-1 rounded-lg border-gray-200 bg-white text-sm dark:border-white/10 dark:bg-[#1b2e4b] dark:text-white",placeholder:"Nom de pipeline",disabled:P}),e.jsx("button",{type:"button",onClick:de,disabled:P,className:"grid h-10 w-10 place-items-center rounded-lg bg-primary text-white transition hover:bg-primary/90 disabled:opacity-60",title:"Créer",children:e.jsx("iconify-icon",{icon:P?"svg-spinners:ring-resize":"solar:add-circle-bold",width:"18"})})]})]})]}),e.jsxs("div",{children:[e.jsxs("div",{className:"mb-2 flex items-center justify-between gap-3",children:[e.jsxs("div",{children:[e.jsx("div",{className:"text-[11px] font-bold uppercase text-gray-400",children:"Étapes"}),e.jsxs("div",{className:"text-xs text-gray-400",children:[R.length," colonne",R.length>1?"s":""," dans le kanban"]})]}),e.jsxs("button",{type:"button",onClick:z,disabled:!N||P,className:"inline-flex h-9 items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 text-xs font-bold text-gray-600 transition hover:border-primary/40 hover:text-primary disabled:opacity-50 dark:border-white/10 dark:bg-[#111827] dark:text-white-dark",children:[e.jsx("iconify-icon",{icon:"solar:add-circle-bold",width:"14"}),"Ajouter"]})]}),e.jsxs("div",{className:"grid gap-2",children:[R.map((L,j)=>e.jsxs("div",{className:"grid grid-cols-[28px_34px_minmax(0,1fr)_auto] items-center gap-2 rounded-lg border border-gray-100 bg-white p-2 shadow-sm shadow-gray-100/60 dark:border-white/10 dark:bg-[#111827] dark:shadow-none",children:[e.jsx("div",{className:"text-center text-[11px] font-bold text-gray-400",children:j+1}),e.jsxs("label",{className:"grid h-8 w-8 cursor-pointer place-items-center rounded-lg border border-gray-200 bg-gray-50 dark:border-white/10 dark:bg-dark",title:"Couleur",children:[e.jsx("span",{className:"h-4 w-4 rounded",style:{backgroundColor:L.color||"#6366f1"}}),e.jsx("input",{type:"color",value:L.color||"#6366f1",onChange:E=>C(L.id,{color:E.target.value}),disabled:P,className:"sr-only"})]}),e.jsx("input",{type:"text",value:L.label,onChange:E=>C(L.id,{label:E.target.value}),disabled:P,className:"form-input h-9 min-w-0 rounded-lg border-gray-200 text-sm font-semibold dark:border-white/10 dark:bg-[#1b2e4b] dark:text-white"}),e.jsxs("div",{className:"flex items-center gap-1",children:[e.jsx(Ke,{icon:"solar:alt-arrow-up-bold",title:"Monter",onClick:()=>c(L.id,-1),disabled:j===0||P}),e.jsx(Ke,{icon:"solar:alt-arrow-down-bold",title:"Descendre",onClick:()=>c(L.id,1),disabled:j===R.length-1||P}),e.jsx(Ke,{icon:"solar:trash-bin-trash-bold",title:"Supprimer",onClick:()=>H(L),disabled:P,tone:"danger"})]})]},L.id)),!R.length&&e.jsx("div",{className:"rounded-lg border border-dashed border-gray-200 py-8 text-center text-xs text-gray-400 dark:border-white/10",children:"Aucune étape"})]})]}),e.jsxs("div",{children:[e.jsxs("div",{className:"mb-2",children:[e.jsx("div",{className:"text-[11px] font-bold uppercase text-gray-400",children:"Tags sur les cartes"}),e.jsx("div",{className:"text-xs text-gray-400",children:"Champs select ou multi-select affichés comme badges sur les opportunités."})]}),x.length>0?e.jsx("div",{className:"grid gap-2 sm:grid-cols-2",children:x.map(L=>{const j=Y.includes(L.id);return e.jsxs("button",{type:"button",onClick:()=>te(L.id),className:`flex items-center justify-between gap-3 rounded-lg border px-3 py-2 text-left transition ${j?"border-primary/40 bg-primary/5 text-primary":"border-gray-200 bg-white text-gray-700 hover:border-primary/30 dark:border-white/10 dark:bg-[#111827] dark:text-white-dark"}`,children:[e.jsxs("span",{className:"min-w-0",children:[e.jsx("span",{className:"block truncate text-sm font-bold",children:L.label}),e.jsxs("span",{className:"block text-[11px] text-gray-400",children:[L.options.length||"Sans"," option",L.options.length>1?"s":""]})]}),e.jsx("span",{className:`grid h-5 w-5 place-items-center rounded-full border text-[10px] ${j?"border-primary bg-primary text-white":"border-gray-200 text-transparent dark:border-white/10"}`,children:e.jsx("iconify-icon",{icon:"solar:check-read-bold",width:"12"})})]},L.id)})}):e.jsx("div",{className:"rounded-lg border border-dashed border-gray-200 px-3 py-4 text-xs text-gray-400 dark:border-white/10",children:"Aucun champ select ou multi-select disponible sur cette fiche."})]}),V&&e.jsx("div",{className:"rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-xs font-semibold text-red-600 dark:border-red-500/20 dark:bg-red-950/30 dark:text-red-300",children:V})]}),e.jsxs("aside",{className:"rounded-lg border border-gray-100 bg-white p-3 shadow-sm shadow-gray-100/70 dark:border-white/10 dark:bg-[#111827] dark:shadow-none",children:[e.jsxs("div",{className:"mb-3 flex items-center justify-between",children:[e.jsx("span",{className:"text-[11px] font-bold uppercase text-gray-400",children:"Aperçu"}),e.jsx("span",{className:"rounded bg-gray-100 px-2 py-1 text-[10px] font-bold text-gray-500 dark:bg-dark dark:text-white-dark",children:"Kanban"})]}),e.jsx("div",{className:"space-y-2",children:R.slice(0,5).map(L=>e.jsxs("div",{className:"rounded-lg border border-gray-100 bg-gray-50 p-2 dark:border-white/10 dark:bg-dark/40",children:[e.jsxs("div",{className:"mb-2 flex items-center justify-between gap-2",children:[e.jsx("span",{className:"truncate rounded px-2 py-0.5 text-[10px] font-bold uppercase text-white",style:{backgroundColor:L.color||"#6366f1"},children:L.label||"Étape"}),e.jsx("span",{className:"text-[11px] font-bold text-gray-400",children:"0"})]}),e.jsxs("div",{className:"rounded-lg border border-gray-100 bg-white p-2 dark:border-white/10 dark:bg-[#0e1726]",children:[e.jsx("div",{className:"mb-2 h-2 w-3/4 rounded bg-gray-200 dark:bg-white/10"}),e.jsxs("div",{className:"flex flex-wrap gap-1",children:[Y.slice(0,2).map(j=>{var M;const E=x.find(W=>W.id===j),y=(M=E==null?void 0:E.options)==null?void 0:M[0];return e.jsx("span",{className:"rounded-full px-2 py-0.5 text-[10px] font-bold",style:{backgroundColor:`${(y==null?void 0:y.color)||"#64748b"}1a`,color:(y==null?void 0:y.color)||"#64748b"},children:(y==null?void 0:y.label)||(E==null?void 0:E.label)||"Tag"},j)}),!Y.length&&e.jsx("span",{className:"h-5 w-16 rounded-full bg-gray-100 dark:bg-white/10"})]})]})]},`preview-${L.id}`))})]})]})}),e.jsxs("div",{className:"flex justify-end gap-2 border-t border-gray-100 bg-gray-50 px-5 py-4 dark:border-white/10 dark:bg-dark/30",children:[e.jsx("button",{type:"button",onClick:()=>!P&&(n==null?void 0:n()),className:"rounded-lg border border-gray-200 bg-white px-4 py-2 text-xs font-bold text-gray-500 transition hover:bg-gray-50 dark:border-white/10 dark:bg-[#111827] dark:text-white-dark",disabled:P,children:"Annuler"}),e.jsxs("button",{type:"button",onClick:pe,disabled:P||!N,className:"inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-xs font-bold text-white transition hover:bg-primary/90 disabled:opacity-60",children:[e.jsx("iconify-icon",{icon:P?"svg-spinners:ring-resize":"solar:diskette-bold",width:"15"}),"Enregistrer"]})]})]})}),document.body)}const zr={contains:{label:"Contient",types:["text","email","phone","url","textarea","title","relation"]},not_contains:{label:"Ne contient pas",types:["text","email","phone","url","textarea","title","relation"]},equals:{label:"Est egal a",types:["text","email","phone","url","number","date","title","select","boolean","checkbox","switch","relation","classification"]},not_equals:{label:"N'est pas egal a",types:["text","email","phone","url","number","date","title","select","boolean","checkbox","switch","relation","classification"]},starts_with:{label:"Commence par",types:["text","email","phone","url","title"]},ends_with:{label:"Se termine par",types:["text","email","phone","url","title"]},gt:{label:"Superieur a",types:["number","date"]},gte:{label:"Superieur ou egal",types:["number","date"]},lt:{label:"Inferieur a",types:["number","date"]},lte:{label:"Inferieur ou egal",types:["number","date"]},between:{label:"Entre",types:["number","date"]},is_empty:{label:"Est vide",types:["text","email","phone","url","number","date","textarea","title","select","boolean","checkbox","switch","relation","classification"]},is_not_empty:{label:"N'est pas vide",types:["text","email","phone","url","number","date","textarea","title","select","boolean","checkbox","switch","relation","classification"]}};function Te(t){const r=String(t||"text").toLowerCase();return["bool","boolean","checkbox","switch","toggle"].includes(r)?"boolean":["number","currency","percent","decimal"].includes(r)?"number":["date","datetime","datetime-local"].includes(r)?"date":["classification"].includes(r)?"classification":["relation"].includes(r)?"relation":["select","multiselect","multi-select","multi_select"].includes(r)?"select":r||"text"}function Ye(t){const r=Te(t);return Object.entries(zr).filter(([,i])=>i.types.includes(r)).map(([i,a])=>({key:i,...a}))}function ut(t){const r=Te(t);return r==="number"?"number":r==="date"?"date":"text"}function pt(t){return["is_empty","is_not_empty"].includes(t)}function Ar(t){return t==="between"}function Vr({open:t,accountNumber:r,viewId:i,viewName:a,columns:l=[],sidebarFilters:v=[],initialFilters:n=[],onClose:b,onSaved:m}){const[p,g]=s.useState(""),[x,T]=s.useState([]),[k,N]=s.useState(!1),[R,Q]=s.useState(""),[w,U]=s.useState(!1);s.useEffect(()=>{t&&(g(a||""),T(Array.isArray(n)?JSON.parse(JSON.stringify(n)):[]),Q(""),U(!1))},[t,n,a]),s.useEffect(()=>{w&&window.setTimeout(()=>{var S;(S=document.querySelector('[data-view-filter-picker="1"]'))==null||S.scrollIntoView({block:"nearest"})},0)},[w]);const D=s.useMemo(()=>l.filter(S=>S.id!=="actions"),[l]),se=s.useMemo(()=>{const S={};return v.forEach(C=>{S[`classif:${C.id}`]=C.options||[]}),S},[v]);if(!t)return null;const Y=(S,C)=>{T(c=>c.map((z,H)=>H===S?{...z,...C}:z))},ee=S=>{const C=D.find(te=>te.id===S);if(!C)return;const c=Te(C.type),z=Ye(c),H=z.find(te=>te.key==="equals")||z[0];T(te=>[...te,{field:C.id,fieldName:C.name,fieldType:c,operator:H.key,value:"",value2:"",logic:(te.length===0,"AND")}]),U(!1)},P=S=>{T(C=>C.filter((c,z)=>z!==S))},u=()=>{T([])},V=async()=>{if(i){N(!0),Q("");try{const S=x.map((z,H)=>({field:z.field||z.fieldId,fieldName:z.fieldName||"",fieldType:Te(z.fieldType),operator:z.operator||"equals",value:z.value,value2:z.value2,logic:H===0?"AND":z.logic==="OR"?"OR":"AND"})).filter(z=>z.field),C=await fetch(`/account/${r}/api/view/config`,{method:"POST",headers:{"Content-Type":"application/json"},credentials:"include",body:JSON.stringify({viewId:i,name:p.trim(),filters:S})}),c=await C.json().catch(()=>({}));if(!C.ok||c.error||c.success===!1)throw new Error(c.error||`Erreur HTTP ${C.status}`);m==null||m(c.view||{filters:S,name:p.trim()})}catch(S){Q(S.message||"Sauvegarde impossible")}finally{N(!1)}}};return Me.createPortal(e.jsx("div",{role:"dialog","aria-modal":"true",className:"fixed inset-0 flex items-center justify-center bg-slate-950/45 p-4",style:{zIndex:1e4},onMouseDown:S=>{S.target===S.currentTarget&&!k&&(b==null||b())},children:e.jsxs("div",{className:"flex max-h-[88vh] w-full max-w-3xl flex-col overflow-hidden rounded-lg border border-gray-100 bg-white shadow-2xl dark:border-white/10 dark:bg-[#0e1726]",onMouseDown:S=>S.stopPropagation(),children:[e.jsxs("div",{className:"flex items-center justify-between gap-3 border-b border-gray-100 px-5 py-4 dark:border-white/10",children:[e.jsxs("div",{className:"flex min-w-0 items-center gap-3",children:[e.jsx("div",{className:"grid h-9 w-9 place-items-center rounded-lg bg-primary/10 text-primary",children:e.jsx("iconify-icon",{icon:"solar:filter-bold-duotone",width:"19"})}),e.jsxs("div",{className:"min-w-0",children:[e.jsx("div",{className:"truncate text-sm font-bold text-gray-900 dark:text-white",children:"Configurer la vue"}),e.jsx("div",{className:"truncate text-xs text-gray-400",children:a||"Vue"})]})]}),e.jsx("button",{type:"button",onClick:()=>!k&&(b==null?void 0:b()),className:"grid h-8 w-8 place-items-center rounded-lg bg-gray-100 text-gray-500 transition hover:bg-gray-200 dark:bg-dark/50 dark:text-white-dark dark:hover:bg-dark",title:"Fermer",children:e.jsx("iconify-icon",{icon:"solar:close-circle-bold",width:"17"})})]}),e.jsxs("div",{className:"min-h-0 flex-1 overflow-y-auto p-5",children:[e.jsxs("div",{className:"mb-4 grid gap-1.5 rounded-lg border border-gray-100 bg-gray-50/70 p-3 dark:border-white/10 dark:bg-dark/20",children:[e.jsx("label",{className:"text-[11px] font-bold uppercase text-gray-400",children:"Nom de la vue"}),e.jsx("input",{type:"text",value:p,onChange:S=>g(S.target.value),className:"form-input h-10 rounded-lg border-gray-200 bg-white text-sm font-semibold text-gray-800 dark:border-white/10 dark:bg-[#1b2e4b] dark:text-white",placeholder:"Clients"})]}),e.jsxs("div",{className:"grid gap-3",children:[x.map((S,C)=>{const c=D.find(j=>j.id===(S.field||S.fieldId))||D[0],z=Te(S.fieldType||(c==null?void 0:c.type)),H=Ye(z),te=String(S.field||S.fieldId||"").startsWith("classif:")?se[S.field||S.fieldId]||[]:[],K=Array.isArray(c==null?void 0:c.options)?c.options:[],de=pt(S.operator),pe=Ar(S.operator),L=z==="boolean";return e.jsxs(We.Fragment,{children:[C>0&&e.jsxs("div",{className:"flex items-center gap-2 pl-3",children:[e.jsx("span",{className:"h-px flex-1 bg-gray-100 dark:bg-white/10"}),e.jsx("button",{type:"button",className:`rounded-full px-3 py-1 text-[11px] font-bold ${S.logic==="OR"?"bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300":"bg-primary/10 text-primary"}`,onClick:()=>Y(C,{logic:S.logic==="OR"?"AND":"OR"}),children:S.logic==="OR"?"OU":"ET"}),e.jsx("span",{className:"h-px flex-1 bg-gray-100 dark:bg-white/10"})]}),e.jsxs("div",{className:"grid gap-2 rounded-lg border border-gray-100 bg-gray-50/70 p-3 dark:border-white/10 dark:bg-dark/20 md:grid-cols-[minmax(0,1.1fr)_minmax(150px,0.7fr)_minmax(0,0.9fr)_auto]",children:[e.jsx("select",{value:S.field||S.fieldId||"",onChange:j=>{var W;const E=D.find($=>$.id===j.target.value),y=Te(E==null?void 0:E.type),M=Ye(y);Y(C,{field:(E==null?void 0:E.id)||j.target.value,fieldName:(E==null?void 0:E.name)||"",fieldType:y,operator:((W=M.find($=>$.key==="equals")||M[0])==null?void 0:W.key)||"equals",value:"",value2:""})},className:"form-select h-10 min-w-0 rounded-lg border-gray-200 bg-white text-sm font-semibold text-gray-800 dark:border-white/10 dark:bg-[#1b2e4b] dark:text-white",children:D.map(j=>e.jsx("option",{value:j.id,children:j.name},j.id))}),e.jsx("select",{value:S.operator,onChange:j=>Y(C,{operator:j.target.value,value:pt(j.target.value)?"":S.value,value2:""}),className:"form-select h-10 rounded-lg border-gray-200 bg-white text-sm dark:border-white/10 dark:bg-[#1b2e4b] dark:text-white",children:H.map(j=>e.jsx("option",{value:j.key,children:j.label},j.key))}),e.jsxs("div",{className:"flex min-w-0 gap-2",children:[!de&&te.length>0?e.jsxs("select",{value:S.value||"",onChange:j=>Y(C,{value:j.target.value}),className:"form-select h-10 min-w-0 flex-1 rounded-lg border-gray-200 bg-white text-sm dark:border-white/10 dark:bg-[#1b2e4b] dark:text-white",children:[e.jsx("option",{value:"",children:"Selectionner..."}),te.map(j=>e.jsx("option",{value:j.id,children:j.label},j.id))]}):!de&&K.length>0?e.jsxs("select",{value:S.value||"",onChange:j=>Y(C,{value:j.target.value}),className:"form-select h-10 min-w-0 flex-1 rounded-lg border-gray-200 bg-white text-sm dark:border-white/10 dark:bg-[#1b2e4b] dark:text-white",children:[e.jsx("option",{value:"",children:"Selectionner..."}),K.map(j=>e.jsx("option",{value:j.value||j.label,children:j.label||j.value},j.id||j.value||j.label))]}):!de&&L?e.jsxs("select",{value:String(S.value??""),onChange:j=>Y(C,{value:j.target.value}),className:"form-select h-10 min-w-0 flex-1 rounded-lg border-gray-200 bg-white text-sm dark:border-white/10 dark:bg-[#1b2e4b] dark:text-white",children:[e.jsx("option",{value:"",children:"Selectionner..."}),e.jsx("option",{value:"true",children:"Oui"}),e.jsx("option",{value:"false",children:"Non"})]}):de?e.jsx("div",{className:"h-10 min-w-0 flex-1 rounded-lg border border-dashed border-gray-200 bg-white/70 dark:border-white/10 dark:bg-[#1b2e4b]/60"}):e.jsx("input",{type:ut(z),value:S.value||"",onChange:j=>Y(C,{value:j.target.value}),className:"form-input h-10 min-w-0 flex-1 rounded-lg border-gray-200 text-sm dark:border-white/10 dark:bg-[#1b2e4b] dark:text-white",placeholder:"Valeur"}),pe&&e.jsx("input",{type:ut(z),value:S.value2||"",onChange:j=>Y(C,{value2:j.target.value}),className:"form-input h-10 min-w-0 flex-1 rounded-lg border-gray-200 text-sm dark:border-white/10 dark:bg-[#1b2e4b] dark:text-white",placeholder:"Max"})]}),e.jsx("button",{type:"button",onClick:()=>P(C),className:"grid h-10 w-10 place-items-center rounded-lg border border-gray-200 bg-white text-gray-400 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 dark:border-white/10 dark:bg-[#111827] dark:text-white-dark dark:hover:border-red-500/30 dark:hover:bg-red-950/30",title:"Supprimer",children:e.jsx("iconify-icon",{icon:"solar:trash-bin-trash-bold",width:"15"})})]})]},`${S.field||S.fieldId}-${C}`)}),!x.length&&e.jsx("div",{className:"rounded-lg border border-dashed border-gray-200 px-4 py-8 text-center text-xs text-gray-400 dark:border-white/10",children:"Aucun filtre"}),e.jsxs("div",{className:"flex flex-wrap items-center gap-2",children:[e.jsxs("button",{type:"button",onClick:()=>U(S=>!S),className:"inline-flex h-9 items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 text-xs font-bold text-gray-600 transition hover:border-primary/40 hover:text-primary dark:border-white/10 dark:bg-[#111827] dark:text-white-dark",children:[e.jsx("iconify-icon",{icon:"solar:add-circle-bold",width:"14"}),"Ajouter un filtre"]}),x.length>0&&e.jsx("button",{type:"button",onClick:u,className:"inline-flex h-9 items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 text-xs font-bold text-gray-500 transition hover:border-red-200 hover:text-red-600 dark:border-white/10 dark:bg-[#111827] dark:text-white-dark",children:"Effacer"})]}),w&&e.jsxs("div",{"data-view-filter-picker":"1",className:"max-h-64 overflow-y-auto rounded-lg border border-gray-100 bg-white p-2 shadow-sm dark:border-white/10 dark:bg-[#111827]",children:[e.jsx("div",{className:"mb-2 px-2 text-[11px] font-bold uppercase text-gray-400",children:"Choisir un champ"}),e.jsx("div",{className:"grid gap-1 sm:grid-cols-2",children:D.map(S=>e.jsx("button",{type:"button",onClick:()=>ee(S.id),className:"min-w-0 rounded-md border border-transparent px-3 py-2 text-left text-sm font-semibold text-gray-700 transition hover:border-primary/20 hover:bg-primary/5 hover:text-primary dark:text-white-dark dark:hover:bg-white/5",children:e.jsx("span",{className:"block truncate",children:S.name})},S.id))})]}),R&&e.jsx("div",{className:"rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-xs font-semibold text-red-600 dark:border-red-500/20 dark:bg-red-950/30 dark:text-red-300",children:R})]})]}),e.jsxs("div",{className:"flex justify-end gap-2 border-t border-gray-100 bg-gray-50 px-5 py-4 dark:border-white/10 dark:bg-dark/30",children:[e.jsx("button",{type:"button",onClick:()=>!k&&(b==null?void 0:b()),className:"rounded-lg border border-gray-200 bg-white px-4 py-2 text-xs font-bold text-gray-500 transition hover:bg-gray-50 dark:border-white/10 dark:bg-[#111827] dark:text-white-dark",disabled:k,children:"Annuler"}),e.jsxs("button",{type:"button",onClick:V,disabled:k||!p.trim(),className:"inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-xs font-bold text-white transition hover:bg-primary/90 disabled:opacity-60",children:[e.jsx("iconify-icon",{icon:k?"svg-spinners:ring-resize":"solar:diskette-bold",width:"15"}),"Enregistrer"]})]})]})}),document.body)}function Br(t,r){var a,l,v;if(r==="title")return t.referenceTitle||t.computedTitle||t.title||"";if(r==="createdAt")return t.createdAt||"";if(r==="updatedAt")return t.updatedAt||"";if(r.startsWith("rel:")){const n=r.replace("rel:",""),m=(((a=t._denorm)==null?void 0:a.relations)||[]).find(x=>x.relationKey===n);if(((l=m==null?void 0:m.records)==null?void 0:l.length)>0)return m.records.map(x=>x.title||x.computedTitle||"").join(", ");const p=(t.relations||[]).find(x=>x.key===n||x.relationKey===n);if(p)return p.title||p.computedTitle||p.value||"";const g=(v=t._denorm)==null?void 0:v[n];return g&&(g.title||g.computedTitle)||""}if(r.startsWith("classif:")){const n=r.replace("classif:","");return(t.classificationValues||[]).filter(p=>{var g;return((g=p.classificationId)==null?void 0:g.toString())===n}).map(p=>p.label||p.optionLabel||"").join(", ")}const i=(t.customFields||[]).find(n=>{var b,m,p;return((m=(b=n.field_id)==null?void 0:b._id)==null?void 0:m.toString())===r||((p=n.field_id)==null?void 0:p.toString())===r});return(i==null?void 0:i.value)??""}function Pr(t,r){const{operator:i,value:a,value2:l,fieldType:v}=r,n=["number","currency","percent"].includes(v),b=["date","datetime"].includes(v),m=String(t??"").trim(),p=m.toLowerCase(),g=String(a??"").trim().toLowerCase(),x={true:!0,1:!0,oui:!0,yes:!0,false:!1,0:!1,non:!1,no:!1},T=String(v||"").toLowerCase();if(["boolean","checkbox","switch","toggle"].includes(T)){const k=typeof t=="boolean"?t:x[p],N=typeof a=="boolean"?a:x[g];if(i==="equals")return k===N;if(i==="not_equals")return k!==N}switch(i){case"contains":return p.includes(g);case"not_contains":return!p.includes(g);case"equals":return n?parseFloat(m)===parseFloat(a):p===g;case"not_equals":return n?parseFloat(m)!==parseFloat(a):p!==g;case"starts_with":return p.startsWith(g);case"ends_with":return p.endsWith(g);case"gt":return b?new Date(t)>new Date(a):parseFloat(m)>parseFloat(a);case"gte":return b?new Date(t)>=new Date(a):parseFloat(m)>=parseFloat(a);case"lt":return b?new Date(t)<new Date(a):parseFloat(m)<parseFloat(a);case"lte":return b?new Date(t)<=new Date(a):parseFloat(m)<=parseFloat(a);case"between":{if(b){const N=new Date(t);return N>=new Date(a)&&N<=new Date(l)}const k=parseFloat(m);return k>=parseFloat(a)&&k<=parseFloat(l)}case"is_empty":return m===""||t==null;case"is_not_empty":return m!==""&&t!=null;default:return!0}}function Dr({accountId:t,accountNumber:r,entityId:i,viewId:a,entityName:l,entityNamePlural:v,entitySlug:n}){const[b,m]=s.useState([]),[p,g]=s.useState([]),[x,T]=s.useState([]),[k,N]=s.useState([]),[R,Q]=s.useState(!0),[w,U]=s.useState(null),[D,se]=s.useState(""),[Y,ee]=s.useState("table"),[P,u]=s.useState(""),[V,S]=s.useState(null),[C,c]=s.useState({}),[z,H]=s.useState([]),[te,K]=s.useState(null),[de,pe]=s.useState(!1),[L,j]=s.useState(!1),[E,y]=s.useState(new Set),[M,W]=s.useState(!1),$=s.useRef(null),[ne,ae]=s.useState([]),[f,I]=s.useState({}),[o,B]=s.useState([]),[q,X]=s.useState([]),[J,G]=s.useState(null),[fe,h]=s.useState(!1),[O,re]=s.useState(null),he=s.useRef(null),be=s.useCallback((d,F="success")=>{he.current&&clearTimeout(he.current),re({message:d,type:F}),he.current=setTimeout(()=>re(null),2500)},[]),[oe,me]=s.useState({columns:[],sort:{field:"createdAt",direction:"desc"},density:"normal",pageSize:10,titleDisplay:"icon",showSidebar:!1,sidebarWidth:280,viewMode:null,enabledViews:["table","kanban","notes","calendar"]}),[ce,ve]=s.useState({page:1,limit:10,total:0,pages:0}),Ee=s.useRef(null),ue=s.useCallback(async()=>{var d,F;try{Q(!0),U(null);const A=new URLSearchParams({limit:1e4,sort:`${oe.sort.field}:${oe.sort.direction}`}),Z=await fetch(`/account/${r}/api/entity/${i}/views/${a}/records?${A}`,{credentials:"include"});if(!Z.ok)throw new Error(`HTTP ${Z.status}`);const _=await Z.json();if(m(_.records||[]),g(_.records||[]),_.entity&&(S(_.entity),_.entity.icon&&u(_.entity.icon)),_.viewSettings&&c(_.viewSettings),H(Array.isArray(_.viewFilters)?_.viewFilters:[]),K(_.view||null),_.filters&&ae(_.filters),_.preferences)if(me(le=>{var ie,xe;return{...le,..._.viewTitleDisplay&&!_.preferences.titleDisplay?{titleDisplay:_.viewTitleDisplay}:{},..._.preferences,columns:(ie=_.preferences.columns)!=null&&ie.length?_.preferences.columns:((xe=_.columns)==null?void 0:xe.map(ge=>({id:ge.id,visible:!0})))||[]}}),_.preferences.pageSize&&ve(le=>({...le,limit:_.preferences.pageSize})),_.preferences.viewMode&&ee(_.preferences.viewMode),(d=_.preferences.columns)!=null&&d.length&&((F=_.columns)!=null&&F.length)){const le=[];_.preferences.columns.forEach(ie=>{const xe=_.columns.find(ge=>ge.id===ie.id);xe&&le.push(xe)}),_.columns.forEach(ie=>{le.find(xe=>xe.id===ie.id)||le.push(ie)}),N(le)}else N(_.columns||[]);else _.columns&&(N(_.columns||[]),me(le=>({...le,..._.viewTitleDisplay?{titleDisplay:_.viewTitleDisplay}:{},columns:_.columns.map(ie=>({id:ie.id,visible:!0}))})))}catch(A){console.error("[RecordsGrid] Fetch error:",A),U(A.message)}finally{Q(!1)}},[r,i,a,oe.sort]),Le=s.useCallback(async()=>{try{const d=await fetch(`/account/${r}/api/entity/${i}/saved-views`,{credentials:"include"});if(d.ok){const F=await d.json();X(F.views||[])}}catch(d){console.error("[RecordsGrid] Fetch saved views error:",d)}},[r,i]),Fe=s.useCallback(async({name:d,color:F,filters:A,fieldFilters:Z})=>{try{const _=await fetch(`/account/${r}/api/entity/${i}/saved-views`,{method:"POST",headers:{"Content-Type":"application/json"},credentials:"include",body:JSON.stringify({name:d,color:F,filters:A,fieldFilters:Z})});if(_.ok){const le=await _.json();X(ie=>[...ie,le.view]),G(le.view._id)}}catch(_){console.error("[RecordsGrid] Create saved view error:",_)}},[r,i]),_e=s.useCallback(async d=>{try{(await fetch(`/account/${r}/api/entity/${i}/saved-views/${d}`,{method:"DELETE",credentials:"include"})).ok&&(X(A=>A.filter(Z=>Z._id!==d)),J===d&&(G(null),I({}),ve(A=>({...A,page:1}))))}catch(F){console.error("[RecordsGrid] Delete saved view error:",F)}},[r,i,J]),Ve=s.useCallback(async(d,F)=>{try{(await fetch(`/account/${r}/api/entity/${i}/saved-views/${d}`,{method:"PUT",headers:{"Content-Type":"application/json"},credentials:"include",body:JSON.stringify({name:F})})).ok&&X(Z=>Z.map(_=>_._id===d?{..._,name:F}:_))}catch(A){console.error("[RecordsGrid] Rename saved view error:",A)}},[r,i]),Re=s.useCallback(async(d,F,A,Z,_)=>{var le;try{const ie={filters:F,fieldFilters:A||[]};if(Z&&(ie.name=Z),_&&(ie.color=_),(await fetch(`/account/${r}/api/entity/${i}/saved-views/${d}`,{method:"PUT",headers:{"Content-Type":"application/json"},credentials:"include",body:JSON.stringify(ie)})).ok){const ge=JSON.parse(JSON.stringify(F||{})),ye=JSON.parse(JSON.stringify(A||[]));X(je=>je.map(Ie=>{if(Ie._id!==d)return Ie;const De={...Ie,filters:ge,fieldFilters:ye};return Z&&(De.name=Z),_&&(De.color=_),De}));const ke=Z||((le=q.find(je=>je._id===d))==null?void 0:le.name)||"Vue";be(`Vue "${ke}" mise à jour`)}else be("Erreur lors de la mise à jour","error")}catch(ie){console.error("[RecordsGrid] Update saved view error:",ie),be("Erreur lors de la mise à jour","error")}},[r,i,q,be]),vt=s.useCallback(d=>{if(!d){G(null),I({}),B([]),ve(A=>({...A,page:1}));return}const F=q.find(A=>A._id===d);F&&(G(d),I(JSON.parse(JSON.stringify(F.filters||{}))),B(JSON.parse(JSON.stringify(F.fieldFilters||[]))),ve(A=>({...A,page:1})))},[q]);s.useEffect(()=>{ue(),Le()},[]);const Ge=s.useMemo(()=>{if(!b.length)return[];const{field:d,direction:F}=oe.sort,A=F==="asc"?1:-1;return[...b].sort((Z,_)=>{let le,ie;if(d==="title")le=(Z.referenceTitle||Z.title||"").toLowerCase(),ie=(_.referenceTitle||_.title||"").toLowerCase();else if(d==="createdAt"||d==="updatedAt")le=new Date(Z[d]||0).getTime(),ie=new Date(_[d]||0).getTime();else{const xe=(Z.customFields||[]).find(ye=>{var je;const ke=((je=ye.field_id)==null?void 0:je._id)||ye.field_id;return(ke==null?void 0:ke.toString())===d}),ge=(_.customFields||[]).find(ye=>{var je;const ke=((je=ye.field_id)==null?void 0:je._id)||ye.field_id;return(ke==null?void 0:ke.toString())===d});le=((xe==null?void 0:xe.value)||"").toString().toLowerCase(),ie=((ge==null?void 0:ge.value)||"").toString().toLowerCase()}return le<ie?-1*A:le>ie?1*A:0})},[b,oe.sort.field,oe.sort.direction]),Qe=s.useMemo(()=>Ge.map(d=>({...d,_searchIndex:[d.title||"",d.referenceTitle||"",d.computedTitle||"",...(d.customFields||[]).map(F=>F.value||"")].join(" ").toLowerCase()})),[Ge]),et=s.useCallback((d,F,A,Z)=>{let _=d;if(F&&F.trim()){const ie=F.toLowerCase();_=_.filter(xe=>xe._searchIndex.includes(ie))}const le=Object.keys(A).filter(ie=>ie!=="__favourites");return le.length>0&&(_=_.filter(ie=>{const xe=ie.classificationValues||[];return le.every(ge=>{const ye=A[ge];return!ye||ye.length===0?!0:xe.some(ke=>{var je,Ie;return((je=ke.classificationId)==null?void 0:je.toString())===ge&&ye.includes((Ie=ke.optionId)==null?void 0:Ie.toString())})})})),Z&&Z.length>0&&(_=_.filter(ie=>{const xe=[[Z[0]]];for(let ge=1;ge<Z.length;ge++)(Z[ge].logic||"AND")==="OR"?xe.push([Z[ge]]):xe[xe.length-1].push(Z[ge]);return xe.some(ge=>ge.every(ye=>{const ke=Br(ie,ye.fieldId);return Pr(ke,ye)}))})),_},[]),yt=s.useCallback(d=>{var A;const F=typeof d=="string"?d:((A=d==null?void 0:d.target)==null?void 0:A.value)||"";se(F),ve(Z=>({...Z,page:1}))},[]),kt=s.useCallback(d=>{I(d),ve(F=>({...F,page:1}))},[]),wt=s.useCallback(d=>{B(d),ve(F=>({...F,page:1}))},[]);s.useEffect(()=>{const d=et(Qe,D,f,o);g(d)},[Qe,D,f,o,et]),s.useEffect(()=>{const d=(ce.page-1)*ce.limit,F=d+ce.limit,A=p.slice(d,F);T(A),ve(Z=>({...Z,total:p.length,pages:Math.ceil(p.length/ce.limit)}))},[p,ce.page,ce.limit]);const Oe=s.useCallback(async d=>{try{await fetch(`/account/${r}/api/user/view-preferences`,{method:"POST",headers:{"Content-Type":"application/json"},credentials:"include",body:JSON.stringify({viewId:a,preferences:d})})}catch(F){console.error("[RecordsGrid] Save preferences error:",F)}},[r,a]),Ne=s.useCallback((d,F)=>{const A={...oe,[d]:F};me(A),Oe(A),d==="pageSize"&&ve(Z=>({...Z,limit:F,page:1}))},[oe,Oe]),jt=s.useCallback(d=>{ee(d),me(F=>{const A={...F,viewMode:d};return Oe(A),A})},[Oe]),Ct=s.useCallback(d=>{c(d||{}),pe(!1),be("Pipeline mise à jour"),ue()},[ue,be]),Nt=s.useCallback(d=>{const F=Array.isArray(d==null?void 0:d.filters)?d.filters:[];H(F),d!=null&&d._id&&K(A=>({...A||{},...d})),d!=null&&d.slug&&typeof window<"u"&&window.history.replaceState({},"",`/account/${r}/record/${n}/${d.slug}`),j(!1),G(null),I({}),B([]),ve(A=>({...A,page:1})),be("Vue mise à jour"),ue()},[r,n,ue,be]),Be=s.useCallback(d=>{ve(F=>({...F,page:d}))},[]),St=s.useCallback((d,F,A)=>{if(A&&$.current!==null&&$.current!==F){const Z=Math.min($.current,F),_=Math.max($.current,F);y(le=>{const ie=new Set(le);for(let xe=Z;xe<=_;xe++)x[xe]&&ie.add(x[xe]._id);return ie})}else y(Z=>{const _=new Set(Z);return _.has(d)?_.delete(d):_.add(d),_});$.current=F},[x]),Lt=s.useCallback(()=>{y(d=>{const F=x.map(_=>_._id),A=F.every(_=>d.has(_)),Z=new Set(d);return A?F.forEach(_=>Z.delete(_)):F.forEach(_=>Z.add(_)),Z})},[x]),Mt=s.useCallback(()=>{y(d=>{const F=p.map(A=>A._id);return d.size===F.length?new Set:new Set(F)})},[p]),_t=s.useCallback(()=>{y(new Set)},[]),It=s.useMemo(()=>x.length===0?!1:x.every(d=>E.has(d._id)),[x,E]),Tt=s.useCallback(async()=>{if(!(E.size===0||!(typeof Swal<"u"?await Swal.fire({title:"Confirmer la suppression",html:`<p>Vous allez supprimer <strong>${E.size}</strong> enregistrement(s).</p><p style="color:#e7515a;font-size:13px;margin-top:8px;">Cette action est irréversible.</p>`,icon:"warning",showCancelButton:!0,confirmButtonColor:"#e7515a",cancelButtonText:"Annuler",confirmButtonText:"Supprimer"}).then(F=>F.isConfirmed):confirm(`Supprimer ${E.size} enregistrement(s) ?`)))){W(!0);try{const A=await(await fetch(`/account/${r}/record/api/bulk-delete`,{method:"POST",headers:{"Content-Type":"application/json"},credentials:"include",body:JSON.stringify({ids:[...E]})})).json();A.success?(m(Z=>Z.filter(_=>!E.has(_._id))),y(new Set),be(`${A.deletedCount} enregistrement(s) supprimé(s)`)):be(A.error||"Erreur lors de la suppression","error")}catch(F){console.error("[RecordsGrid] Bulk delete error:",F),be("Erreur lors de la suppression","error")}finally{W(!1)}}},[E,r,be]),$t=s.useCallback((d,F)=>{N(A=>{const Z=A.findIndex(ge=>ge.id===d),_=A.findIndex(ge=>ge.id===F);if(Z===-1||_===-1)return A;const le=[...A],[ie]=le.splice(Z,1);le.splice(_,0,ie);const xe=le.map(ge=>oe.columns.find(ke=>ke.id===ge.id)||{id:ge.id,visible:!0});return Ne("columns",xe),le})},[oe.columns,Ne]),tt=s.useMemo(()=>{switch(oe.density){case"compact":return 36;case"comfortable":return 56;default:return 44}},[oe.density]),Pe=Rt({count:x.length,getScrollElement:()=>Ee.current,estimateSize:()=>tt,overscan:10});s.useEffect(()=>{Pe.measure()},[tt,Pe]);const Et=s.useMemo(()=>{var A;let d;(A=oe.columns)!=null&&A.length?d=k.filter(Z=>{const _=oe.columns.find(le=>le.id===Z.id);return _?_.visible!==!1:!0}):d=k;const F=d.findIndex(Z=>Z.id==="actions");if(F>-1&&F<d.length-1){const[Z]=d.splice(F,1);d=[...d,Z]}return d},[k,oe.columns]);return R&&x.length===0?e.jsx("div",{className:"flex items-center justify-center h-64",children:e.jsx("div",{className:"animate-spin rounded-full h-8 w-8 border-b-2 border-primary"})}):w&&x.length===0?e.jsx("div",{className:"flex items-center justify-center h-64 text-danger",children:e.jsxs("span",{children:["Erreur: ",w]})}):e.jsxs("div",{className:"relative flex h-full gap-5 sm:min-h-0",children:[e.jsx(Lr,{entityName:l,entityNamePlural:v,entityIcon:P,accountNumber:r,entitySlug:n,showSidebar:oe.showSidebar!==!1,onToggleSidebar:()=>Ne("showSidebar",!oe.showSidebar),filters:ne,activeFilters:f,onFilterChange:kt,columns:k,fieldFilters:o,onFieldFiltersChange:wt,allRecords:b,sidebarWidth:oe.sidebarWidth,onSidebarWidthChange:d=>Ne("sidebarWidth",d),viewId:a}),e.jsxs("div",{className:`panel p-4 flex-1 flex flex-col h-full ${Y==="calendar"?"overflow-auto":"overflow-hidden"}`,children:[e.jsx(Zt,{searchQuery:D,onSearch:yt,columns:k,preferences:oe,onPreferencesChange:Ne,loading:R,accountNumber:r,entitySlug:n,viewId:a,showSidebar:oe.showSidebar!==!1,onToggleSidebar:()=>Ne("showSidebar",!oe.showSidebar),activeView:Y,onViewChange:jt,enabledViews:oe.enabledViews||["table","kanban","notes"],onEnabledViewsChange:d=>Ne("enabledViews",d),hasActiveFilters:z.length>0||Object.keys(f).filter(d=>d!=="__favourites").length>0||o.length>0,onOpenViewFilters:()=>j(!0),onOpenPipelineConfig:()=>pe(!0)}),e.jsx(Ir,{savedViews:q,activeViewId:J,onSelectView:vt,onCreateView:Fe,onDeleteView:_e,onRenameView:Ve,onUpdateViewFilters:Re,hasActiveFilters:Object.keys(f).filter(d=>d!=="__favourites").length>0||o.length>0,activeFilters:f,fieldFilters:o,sidebarFilters:ne,columns:k,externalOpenCreate:fe,onCloseExternalCreate:()=>h(!1)}),e.jsx("div",{className:`flex-1 flex flex-col mt-4 ${Y==="calendar"?"overflow-auto":"overflow-hidden"}`,children:Y==="kanban"?e.jsx(ir,{records:p,columns:k,accountNumber:r,entitySlug:n,viewId:a,entityData:V,kanbanFieldId:C.kanbanField||"status",kanbanTagFieldIds:C.kanbanTagFields||[]}):Y==="calendar"?e.jsx(jr,{records:p,columns:k,accountNumber:r,entitySlug:n,entityData:V}):Y==="notes"?e.jsx(xr,{records:p,accountNumber:r,entitySlug:n}):e.jsxs("div",{className:"dataTable-wrapper flex-1 flex flex-col overflow-hidden",children:[e.jsx("div",{className:"dataTable-container flex-1 overflow-auto relative",ref:Ee,children:e.jsx(Xt,{records:x,columns:Et,virtualizer:Pe,sort:oe.sort,onSort:d=>{const F=oe.sort.field===d&&oe.sort.direction==="asc"?"desc":"asc";Ne("sort",{field:d,direction:F})},onColumnReorder:$t,density:oe.density,titleDisplay:oe.titleDisplay||"avatar",entityIcon:P,accountNumber:r,entitySlug:n,selectedIds:E,onToggleSelect:St,onSelectAll:Lt,allPageSelected:It,showCheckboxes:oe.showCheckboxes!==!1})}),e.jsxs("div",{className:"dataTable-bottom flex items-center justify-between border-t pt-4 dark:border-gray-800",children:[e.jsxs("div",{className:"dataTable-info text-gray-500 dark:text-gray-400",children:["Affichage de ",(ce.page-1)*ce.limit+1," à ",Math.min(ce.page*ce.limit,ce.total)," sur ",ce.total]}),e.jsx("nav",{className:"dataTable-pagination",children:e.jsxs("ul",{className:"inline-flex items-center space-x-1 rtl:space-x-reverse",children:[e.jsx("li",{children:e.jsx("button",{onClick:()=>Be(ce.page-1),disabled:ce.page<=1,className:"flex justify-center font-semibold p-2 rounded-full transition bg-white-light text-dark hover:text-white hover:bg-primary dark:text-white-light dark:bg-[#191e3a] dark:hover:bg-primary disabled:opacity-50",children:"«"})}),Array.from({length:Math.min(ce.pages,5)},(d,F)=>{let A;return ce.pages<=5||ce.page<=3?A=F+1:ce.page>=ce.pages-2?A=ce.pages-4+F:A=ce.page-2+F,e.jsx("li",{children:e.jsx("button",{onClick:()=>Be(A),className:`flex justify-center font-semibold px-3.5 py-2 rounded-full transition ${A===ce.page?"bg-primary text-white dark:bg-primary dark:text-white-light":"bg-white-light text-dark hover:text-white hover:bg-primary dark:text-white-light dark:bg-[#191e3a] dark:hover:bg-primary"}`,children:A})},A)}),e.jsx("li",{children:e.jsx("button",{onClick:()=>Be(ce.page+1),disabled:ce.page>=ce.pages,className:"flex justify-center font-semibold p-2 rounded-full transition bg-white-light text-dark hover:text-white hover:bg-primary dark:text-white-light dark:bg-[#191e3a] dark:hover:bg-primary disabled:opacity-50",children:"»"})})]})})]})]})})]}),e.jsx(Or,{open:de,accountNumber:r,entityId:i,entityData:V,viewId:a,viewSettings:C,onClose:()=>pe(!1),onSaved:Ct}),e.jsx(Vr,{open:L,accountNumber:r,viewId:(te==null?void 0:te._id)||a,viewName:(te==null?void 0:te.name)||l,columns:k,sidebarFilters:ne,initialFilters:z,onClose:()=>j(!1),onSaved:Nt}),E.size>0&&e.jsxs("div",{className:"bulk-action-bar",style:{position:"fixed",bottom:"24px",left:"50%",transform:"translateX(-50%)",zIndex:99999,display:"flex",alignItems:"center",gap:"12px",padding:"10px 20px",borderRadius:"14px",background:"linear-gradient(135deg, #1b2e4b 0%, #0e1726 100%)",boxShadow:"0 8px 32px rgba(0,0,0,0.3), 0 0 0 1px rgba(67,97,238,0.2)",animation:"bulkBarSlideUp 0.3s cubic-bezier(0.16,1,0.3,1)",backdropFilter:"blur(12px)"},children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"8px"},children:[e.jsx("div",{style:{width:28,height:28,borderRadius:"8px",background:"rgba(67,97,238,0.2)",color:"#4361ee",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"12px",fontWeight:700},children:E.size}),e.jsxs("span",{style:{color:"#e0e6ed",fontSize:"13px",fontWeight:500,whiteSpace:"nowrap"},children:["sélectionné",E.size>1?"s":""]})]}),e.jsx("div",{style:{width:1,height:24,background:"rgba(255,255,255,0.1)"}}),E.size<p.length&&e.jsxs("button",{onClick:Mt,style:{padding:"6px 12px",borderRadius:"8px",border:"1px solid rgba(67,97,238,0.3)",background:"rgba(67,97,238,0.1)",color:"#93b4fd",fontSize:"12px",fontWeight:600,cursor:"pointer",transition:"all 0.15s",whiteSpace:"nowrap"},onMouseEnter:d=>{d.target.style.background="rgba(67,97,238,0.2)",d.target.style.color="#b8cffe"},onMouseLeave:d=>{d.target.style.background="rgba(67,97,238,0.1)",d.target.style.color="#93b4fd"},children:["Tout sélectionner (",p.length,")"]}),e.jsx("div",{style:{width:1,height:24,background:"rgba(255,255,255,0.1)"}}),e.jsxs("button",{onClick:Tt,disabled:M,style:{display:"flex",alignItems:"center",gap:"6px",padding:"6px 14px",borderRadius:"8px",border:"none",background:"rgba(231,81,90,0.15)",color:"#ff6b6b",fontSize:"12px",fontWeight:600,cursor:M?"wait":"pointer",transition:"all 0.15s",whiteSpace:"nowrap",opacity:M?.6:1},onMouseEnter:d=>{M||(d.target.style.background="rgba(231,81,90,0.25)",d.target.style.color="#ff8a8a")},onMouseLeave:d=>{d.target.style.background="rgba(231,81,90,0.15)",d.target.style.color="#ff6b6b"},children:[e.jsxs("svg",{viewBox:"0 0 24 24",fill:"none",style:{width:14,height:14},children:[e.jsx("path",{d:"M20.5 6H3.5",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"}),e.jsx("path",{d:"M18.833 8.5L18.373 15.4C18.196 18.054 18.108 19.381 17.243 20.19C16.378 21 15.048 21 12.387 21H11.613C8.952 21 7.622 21 6.757 20.19C5.892 19.381 5.804 18.054 5.627 15.4L5.167 8.5",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"})]}),M?"Suppression...":"Supprimer"]}),e.jsx("div",{style:{width:1,height:24,background:"rgba(255,255,255,0.1)"}}),e.jsx("button",{onClick:_t,style:{width:28,height:28,borderRadius:"8px",border:"none",background:"rgba(255,255,255,0.08)",color:"#888ea8",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",transition:"all 0.15s"},onMouseEnter:d=>{d.target.style.background="rgba(255,255,255,0.15)",d.target.style.color="#e0e6ed"},onMouseLeave:d=>{d.target.style.background="rgba(255,255,255,0.08)",d.target.style.color="#888ea8"},title:"Désélectionner tout",children:e.jsx("svg",{viewBox:"0 0 24 24",fill:"none",style:{width:14,height:14},children:e.jsx("path",{d:"M18 6L6 18M6 6L18 18",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round"})})})]}),O&&e.jsxs("div",{style:{position:"fixed",bottom:E.size>0?"80px":"24px",right:"24px",zIndex:99999,padding:"10px 20px",borderRadius:"10px",fontSize:"13px",fontWeight:500,color:"#fff",background:O.type==="error"?"#e7515a":"#00ab55",boxShadow:"0 4px 20px rgba(0,0,0,0.15)",animation:"toastSlideIn 0.25s ease-out",display:"flex",alignItems:"center",gap:"8px",transition:"bottom 0.3s ease"},children:[e.jsx("svg",{viewBox:"0 0 24 24",fill:"none",style:{width:16,height:16,flexShrink:0},children:O.type==="error"?e.jsx("path",{d:"M12 8V12M12 16H12.01M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"}):e.jsx("path",{d:"M5 13L9 17L19 7",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round"})}),O.message]}),e.jsx("style",{children:`
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
            `})]})}function ft(){document.querySelectorAll('[data-island="records-grid"]').forEach(t=>{if(t.dataset.mounted==="1")return;t.dataset.mounted="1";const r={accountId:t.dataset.accountId,accountNumber:t.dataset.accountNumber,entityId:t.dataset.entityId,viewId:t.dataset.viewId,entityName:t.dataset.entityName||"Records",entityNamePlural:t.dataset.entityNamePlural||"",entitySlug:t.dataset.entitySlug||"records"};console.log("[RecordsGrid Island] Mounting:",r),Ft(t).render(e.jsx(We.StrictMode,{children:e.jsx(Dr,{...r})}))})}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",ft):ft();
