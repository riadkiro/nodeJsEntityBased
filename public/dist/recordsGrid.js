import{r,j as e,a as _e,R as Re,c as gt}from"./chunks/client-CkWOIrXP.js";import{u as mt}from"./chunks/index-CjVSFo3p.js";import{u as bt,a as Fe,D as vt,c as yt,b as kt,d as wt,s as jt,K as Ct,T as St,M as Nt,e as Lt,S as Mt,v as _t,f as It,C as $t}from"./chunks/sortable.esm-DQ9-A8Dw.js";const He=[{id:"table",label:"Tableau",icon:e.jsxs("svg",{viewBox:"0 0 24 24",fill:"none",className:"h-4 w-4",children:[e.jsx("path",{d:"M3 7H21",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"}),e.jsx("path",{d:"M3 12H21",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"}),e.jsx("path",{d:"M3 17H21",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"})]})},{id:"kanban",label:"Kanban",icon:e.jsxs("svg",{viewBox:"0 0 24 24",fill:"none",className:"h-4 w-4",children:[e.jsx("rect",{x:"3",y:"3",width:"5",height:"18",rx:"1",stroke:"currentColor",strokeWidth:"1.5"}),e.jsx("rect",{x:"10",y:"3",width:"5",height:"12",rx:"1",stroke:"currentColor",strokeWidth:"1.5"}),e.jsx("rect",{x:"17",y:"3",width:"4",height:"15",rx:"1",stroke:"currentColor",strokeWidth:"1.5"})]})},{id:"notes",label:"Notes",icon:e.jsxs("svg",{viewBox:"0 0 24 24",fill:"none",className:"h-4 w-4",children:[e.jsx("path",{d:"M2 12C2 7.28595 2 4.92893 3.46447 3.46447C4.92893 2 7.28595 2 12 2C16.714 2 19.0711 2 20.5355 3.46447C22 4.92893 22 7.28595 22 12C22 16.714 22 19.0711 20.5355 20.5355C19.0711 22 16.714 22 12 22C7.28595 22 4.92893 22 3.46447 20.5355C2 19.0711 2 16.714 2 12Z",stroke:"currentColor",strokeWidth:"1.5"}),e.jsx("path",{opacity:"0.5",d:"M2 12H22",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"}),e.jsx("path",{opacity:"0.5",d:"M12 2V22",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"})]})},{id:"calendar",label:"Calendrier",icon:e.jsxs("svg",{viewBox:"0 0 24 24",fill:"none",className:"h-4 w-4",children:[e.jsx("rect",{x:"3",y:"4",width:"18",height:"18",rx:"2",stroke:"currentColor",strokeWidth:"1.5"}),e.jsx("path",{d:"M16 2V6M8 2V6M3 10H21",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"}),e.jsx("circle",{cx:"12",cy:"16",r:"1",fill:"currentColor"}),e.jsx("circle",{cx:"16",cy:"16",r:"1",fill:"currentColor"}),e.jsx("circle",{cx:"8",cy:"16",r:"1",fill:"currentColor"})]})}];function Rt({searchQuery:t,onSearch:s,columns:o,preferences:n,onPreferencesChange:l,loading:m,accountNumber:a,entitySlug:v,viewId:x,showSidebar:c,onToggleSidebar:p,activeView:u,onViewChange:g,enabledViews:w=["table","kanban","notes"],onEnabledViewsChange:R,hasActiveFilters:z=!1,onOpenSaveView:G}){var K,ie,b;const[_,y]=r.useState(!1),[Y,J]=r.useState(!1),[H,X]=r.useState(!1),[h,k]=r.useState(!1),[te,V]=r.useState(""),U=r.useRef(null),B=r.useRef(null),M=r.useRef(null),T=r.useRef(null),I=r.useRef(null),oe=r.useRef(null),ne=r.useRef(null),ue=r.useRef(null),fe=()=>{y(!1),J(!1),X(!1),k(!1)};r.useEffect(()=>{const i=S=>{S.key==="Escape"&&fe()};return document.addEventListener("keydown",i),()=>document.removeEventListener("keydown",i)},[]);const j=(i,S,D,C)=>{r.useEffect(()=>{const se=F=>{i&&S.current&&!S.current.contains(F.target)&&D.current&&!D.current.contains(F.target)&&C(!1)};return i&&setTimeout(()=>document.addEventListener("mousedown",se),0),()=>document.removeEventListener("mousedown",se)},[i])};j(_,I,U,y),j(Y,oe,B,J),j(H,ne,M,X),j(h,ue,T,k);const O=i=>{if(i==="table")return;const S=w.includes(i)?w.filter(D=>D!==i):[...w,i];R(S),u===i&&!S.includes(i)&&g("table")},Z=He.filter(i=>w.includes(i.id)),W=i=>{const S=n.columns.some(C=>C.id===i);let D;S?D=n.columns.map(C=>C.id===i?{...C,visible:!C.visible}:C):D=[...n.columns,{id:i,visible:!1}],l("columns",D)},q=i=>{if(!(i!=null&&i.current))return{top:0,right:0};const S=i.current.getBoundingClientRect();return{top:S.bottom+8,right:window.innerWidth-S.right}},P=te.trim()?o.filter(i=>i.name.toLowerCase().includes(te.toLowerCase())):o;return e.jsxs("div",{className:"dataTable-top flex items-center mb-0 justify-between gap-2",children:[e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsxs("a",{href:`/account/${a}/record/${v}/add`,className:"btn-add-expandable block rounded-full p-2 bg-white-light/40 hover:bg-white-light/90 hover:text-primary dark:bg-dark/40 dark:hover:bg-dark/60",title:"Ajouter",children:[e.jsx("svg",{className:"btn-add-icon",viewBox:"0 0 24 24",fill:"none",children:e.jsx("path",{d:"M12 5V19M5 12H19",stroke:"currentColor",strokeWidth:"2.5",strokeLinecap:"round"})}),e.jsx("span",{className:"btn-add-label",children:"Ajouter"})]}),e.jsxs("div",{className:"dataTable-search relative w-64",style:{marginLeft:0},children:[e.jsxs("svg",{className:"absolute left-4 top-1/2 ml-2 -translate-y-1/2 h-4 w-4 text-gray-400",viewBox:"0 0 24 24",fill:"none",children:[e.jsx("circle",{cx:"11",cy:"11",r:"8",stroke:"currentColor",strokeWidth:"1.5"}),e.jsx("path",{d:"M16.5 16.5L21 21",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"})]}),e.jsx("input",{type:"text",value:t,onChange:i=>s(i.target.value),placeholder:"Rechercher...",className:"dataTable-input form-input w-full pl-11 pr-10",style:{"padding-left":"33px"}}),m&&e.jsx("div",{className:"absolute right-3 top-1/2 -translate-y-1/2",children:e.jsx("div",{className:"animate-spin rounded-full h-4 w-4 border-b-2 border-primary"})})]})]}),e.jsxs("div",{className:"flex items-center gap-2",children:[Z.map(i=>e.jsx("button",{type:"button",onClick:()=>g(i.id),title:i.label,className:`block rounded-full p-2 transition-all ${u===i.id?"bg-primary/20 text-primary":"bg-white-light/40 hover:bg-white-light/90 hover:text-primary dark:bg-dark/40 dark:hover:bg-dark/60"}`,children:i.icon},i.id)),e.jsx("button",{ref:T,type:"button",onClick:()=>{k(!h),y(!1),J(!1),X(!1)},className:`block rounded-full p-2 transition-all ${h?"bg-primary/20 text-primary":"bg-white-light/40 hover:bg-white-light/90 hover:text-primary dark:bg-dark/40 dark:hover:bg-dark/60"}`,title:"Configurer les vues",children:e.jsxs("svg",{className:"h-4 w-4",viewBox:"0 0 24 24",fill:"none",children:[e.jsx("circle",{cx:"12",cy:"12",r:"3",stroke:"currentColor",strokeWidth:"1.5"}),e.jsx("path",{d:"M12 2V4M12 20V22M2 12H4M20 12H22M4.93 4.93L6.34 6.34M17.66 17.66L19.07 19.07M4.93 19.07L6.34 17.66M17.66 6.34L19.07 4.93",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"})]})}),e.jsx("div",{className:"w-px h-5 bg-gray-200 dark:bg-gray-700 mx-0.5"}),e.jsx("button",{type:"button",onClick:G,className:`block rounded-full p-2 transition-all ${z?"bg-primary/20 text-primary":"bg-white-light/40 hover:bg-white-light/90 hover:text-primary dark:bg-dark/40 dark:hover:bg-dark/60"}`,title:"Filtrer & enregistrer la vue",children:e.jsx("svg",{className:"h-4 w-4",viewBox:"0 0 24 24",fill:"none",children:e.jsx("path",{d:"M22 3H2L10 12.46V19L14 21V12.46L22 3Z",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round"})})}),u==="table"&&(()=>{var S,D;const i=((S=n.sort)==null?void 0:S.field)!=="createdAt"||((D=n.sort)==null?void 0:D.direction)!=="desc";return e.jsx("button",{ref:B,type:"button",onClick:()=>{J(!Y),y(!1),X(!1),k(!1)},className:`block rounded-full p-2 transition-all ${Y||i?"bg-primary/20 text-primary":"bg-white-light/40 hover:bg-white-light/90 hover:text-primary dark:bg-dark/40 dark:hover:bg-dark/60"}`,title:"Trier",children:e.jsxs("svg",{className:"h-4 w-4",viewBox:"0 0 24 24",fill:"none",children:[e.jsx("path",{d:"M16 18L16 6M16 6L20 10M16 6L12 10",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round"}),e.jsx("path",{d:"M8 6L8 18M8 18L12 14M8 18L4 14",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round"})]})})})(),e.jsx("button",{ref:U,type:"button",onClick:()=>{y(!_),J(!1),X(!1),k(!1)},className:`block rounded-full p-2 transition-all ${_?"bg-primary/20 text-primary":"bg-white-light/40 hover:bg-white-light/90 hover:text-primary dark:bg-dark/40 dark:hover:bg-dark/60"}`,title:"Mode d'affichage",children:e.jsxs("svg",{className:"h-4 w-4",viewBox:"0 0 24 24",fill:"none",children:[e.jsx("path",{d:"M3 7H21",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"}),e.jsx("path",{d:"M6 12H18",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"}),e.jsx("path",{d:"M10 17H14",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"})]})}),u==="table"&&e.jsx("button",{ref:M,type:"button",onClick:()=>{X(!H),y(!1),J(!1),k(!1)},className:`block rounded-full p-2 transition-all ${H?"bg-primary/20 text-primary":"bg-white-light/40 hover:bg-white-light/90 hover:text-primary dark:bg-dark/40 dark:hover:bg-dark/60"}`,title:"Colonnes visibles",children:e.jsxs("svg",{className:"h-4 w-4",viewBox:"0 0 24 24",fill:"none",children:[e.jsx("path",{d:"M9 3H4C3.44772 3 3 3.44772 3 4V11C3 11.5523 3.44772 12 4 12H9C9.55228 12 10 11.5523 10 11V4C10 3.44772 9.55228 3 9 3Z",stroke:"currentColor",strokeWidth:"1.5"}),e.jsx("path",{d:"M20 3H15C14.4477 3 14 3.44772 14 4V7C14 7.55228 14.4477 8 15 8H20C20.5523 8 21 7.55228 21 7V4C21 3.44772 20.5523 3 20 3Z",stroke:"currentColor",strokeWidth:"1.5"}),e.jsx("path",{d:"M20 12H15C14.4477 12 14 12.4477 14 13V20C14 20.5523 14.4477 21 15 21H20C20.5523 21 21 20.5523 21 20V13C21 12.4477 20.5523 12 20 12Z",stroke:"currentColor",strokeWidth:"1.5"}),e.jsx("path",{d:"M9 16H4C3.44772 16 3 16.4477 3 17V20C3 20.5523 3.44772 21 4 21H9C9.55228 21 10 20.5523 10 20V17C10 16.4477 9.55228 16 9 16Z",stroke:"currentColor",strokeWidth:"1.5"})]})}),e.jsxs("button",{type:"button",onClick:p,className:"btn-sidebar-toggle block rounded-full p-2 bg-white-light/40 hover:bg-white-light/90 hover:text-primary dark:bg-dark/40 dark:hover:bg-dark/60",title:c?"Masquer le panneau":"Afficher le panneau",children:[e.jsxs("svg",{className:"btn-sidebar-icon",viewBox:"0 0 24 24",fill:"none",children:[e.jsx("rect",{x:"3",y:"3",width:"18",height:"18",rx:"2",stroke:"currentColor",strokeWidth:"1.5"}),e.jsx("path",{d:"M9 3V21",stroke:"currentColor",strokeWidth:"1.5"})]}),e.jsx("span",{className:"btn-sidebar-label",children:c?"Masquer":"Panneau"})]})]}),Y&&_e.createPortal(e.jsxs(e.Fragment,{children:[e.jsx("div",{className:"fixed inset-0",style:{zIndex:9998},onClick:()=>J(!1)}),e.jsxs("div",{ref:oe,className:"fixed rounded-xl shadow-xl p-4 w-72 bg-white dark:bg-[#0e1726] border border-gray-100 dark:border-white/10",style:{zIndex:9999,top:q(B).top,right:q(B).right,animation:"popoverSlide 0.15s ease-out"},children:[e.jsx("div",{className:"text-xs font-medium text-gray-500 dark:text-white-dark mb-2",children:"Trier par"}),e.jsxs("div",{className:"flex gap-2",children:[e.jsxs("select",{value:((K=n.sort)==null?void 0:K.field)||"createdAt",onChange:i=>l("sort",{...n.sort,field:i.target.value}),className:"flex-1 px-2 py-1.5 text-xs border border-gray-200 dark:border-white/10 rounded-lg bg-white dark:bg-[#1b2e4b] text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary/50",children:[e.jsx("option",{value:"createdAt",children:"Date de création"}),e.jsx("option",{value:"title",children:"Titre"}),o.filter(i=>i.id!=="title"&&i.id!=="actions").map(i=>e.jsx("option",{value:i.id,children:i.name},i.id))]}),e.jsx("button",{onClick:()=>{var i;return l("sort",{...n.sort,direction:((i=n.sort)==null?void 0:i.direction)==="asc"?"desc":"asc"})},className:"p-1.5 border border-gray-200 dark:border-white/10 rounded-lg bg-white dark:bg-[#1b2e4b] hover:bg-gray-50 dark:hover:bg-[#253b5c] transition-all",title:((ie=n.sort)==null?void 0:ie.direction)==="asc"?"Croissant":"Décroissant",children:e.jsx("svg",{className:`h-4 w-4 text-gray-600 dark:text-white transition-transform ${((b=n.sort)==null?void 0:b.direction)==="asc"?"rotate-180":""}`,viewBox:"0 0 24 24",fill:"none",children:e.jsx("path",{d:"M12 5V19M12 19L6 13M12 19L18 13",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round"})})}),e.jsx("button",{onClick:()=>l("sort",{field:"createdAt",direction:"desc"}),className:"p-1.5 border border-gray-200 dark:border-white/10 rounded-lg bg-white dark:bg-[#1b2e4b] hover:bg-red-50 hover:border-red-300 hover:text-red-500 dark:hover:bg-red-900/20 transition-all",title:"Réinitialiser le tri",children:e.jsxs("svg",{className:"h-4 w-4 text-gray-600 dark:text-white",viewBox:"0 0 24 24",fill:"none",children:[e.jsx("path",{d:"M4.06189 13C4.02104 12.6724 4 12.3387 4 12C4 7.58172 7.58172 4 12 4C14.5006 4 16.7332 5.14727 18.2002 6.94416M19.9381 11C19.979 11.3276 20 11.6613 20 12C20 16.4183 16.4183 20 12 20C9.49944 20 7.26681 18.8527 5.79984 17.0558",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round"}),e.jsx("path",{d:"M15 7H19V3",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round"}),e.jsx("path",{d:"M9 17H5V21",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round"})]})})]})]})]}),document.body),_&&_e.createPortal(e.jsxs(e.Fragment,{children:[e.jsx("div",{className:"fixed inset-0",style:{zIndex:9998},onClick:()=>y(!1)}),e.jsxs("div",{ref:I,className:"fixed rounded-xl shadow-xl p-4 w-72 bg-white dark:bg-[#0e1726] border border-gray-100 dark:border-white/10",style:{zIndex:9999,top:q(U).top,right:q(U).right,animation:"popoverSlide 0.15s ease-out"},children:[e.jsxs("div",{className:"mb-4",children:[e.jsx("div",{className:"text-xs font-medium text-gray-500 dark:text-white-dark mb-2",children:"Densité"}),e.jsx("div",{className:"flex gap-1",children:["compact","normal","comfortable"].map(i=>e.jsx("button",{onClick:()=>l("density",i),className:`flex-1 px-2 py-1.5 text-xs rounded-lg transition-all ${n.density===i?"bg-primary text-white":"bg-gray-100 dark:bg-dark/40 text-gray-600 dark:text-white-dark/70 hover:bg-gray-200 dark:hover:bg-dark/60"}`,children:i==="compact"?"Compact":i==="normal"?"Normal":"Confort"},i))})]}),e.jsxs("div",{className:"mb-4",children:[e.jsx("div",{className:"text-xs font-medium text-gray-500 dark:text-white-dark mb-2",children:"Lignes par page"}),e.jsx("div",{className:"flex gap-1",children:[10,25,50,100].map(i=>e.jsx("button",{onClick:()=>l("pageSize",i),className:`flex-1 px-2 py-1.5 text-xs rounded-lg transition-all ${n.pageSize===i?"bg-primary text-white":"bg-gray-100 dark:bg-dark/40 text-gray-600 dark:text-white-dark/70 hover:bg-gray-200 dark:hover:bg-dark/60"}`,children:i},i))})]})]})]}),document.body),H&&_e.createPortal(e.jsxs(e.Fragment,{children:[e.jsx("div",{className:"fixed inset-0",style:{zIndex:9998},onClick:()=>X(!1)}),e.jsxs("div",{ref:ne,className:"fixed rounded-xl shadow-xl p-4 w-64 bg-white dark:bg-[#0e1726] border border-gray-100 dark:border-white/10",style:{zIndex:9999,top:q(M).top,right:q(M).right,animation:"popoverSlide 0.15s ease-out"},children:[e.jsx("div",{className:"text-xs font-medium text-gray-500 dark:text-white-dark mb-2",children:"Colonnes visibles"}),e.jsx("div",{className:"relative mb-2",children:e.jsx("input",{type:"text",value:te,onChange:i=>V(i.target.value),placeholder:"Filtrer...",className:"w-full px-3 py-1.5 text-xs border border-gray-200 dark:border-white/10 rounded-lg bg-white dark:bg-[#1b2e4b] text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary/50"})}),e.jsx("div",{className:"space-y-0.5 max-h-48 overflow-y-auto",children:P.map(i=>{const S=n.columns.find(C=>C.id===i.id),D=S?S.visible!==!1:!0;return e.jsxs("label",{className:"flex items-center gap-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 px-2 py-1.5 rounded-lg",children:[e.jsx("input",{type:"checkbox",checked:D,onChange:()=>W(i.id),className:"form-checkbox text-primary w-3.5 h-3.5 rounded"}),e.jsx("span",{className:"text-xs text-gray-700 dark:text-gray-300",children:i.name})]},i.id)})}),e.jsx("div",{className:"border-t border-gray-100 dark:border-white/10 mt-3 mb-2"}),e.jsxs("div",{children:[e.jsx("div",{className:"text-xs font-medium text-gray-500 dark:text-white-dark mb-2",children:"Affichage titre"}),e.jsx("div",{className:"flex gap-1",children:[{value:"avatar",label:"Avatar"},{value:"icon",label:"Icône"},{value:"none",label:"Aucun"}].map(i=>e.jsx("button",{onClick:()=>l("titleDisplay",i.value),className:`flex-1 px-2 py-1.5 text-xs rounded-lg transition-all ${(n.titleDisplay||"avatar")===i.value?"bg-primary text-white":"bg-gray-100 dark:bg-dark/40 text-gray-600 dark:text-white-dark/70 hover:bg-gray-200 dark:hover:bg-dark/60"}`,children:i.label},i.value))})]}),e.jsx("div",{className:"border-t border-gray-100 dark:border-white/10 mt-3 mb-2"}),e.jsx("div",{children:e.jsxs("div",{className:"flex items-center justify-between",children:[e.jsx("span",{className:"text-xs font-medium text-gray-500 dark:text-white-dark",children:"Sélection multiple"}),e.jsx("button",{type:"button",onClick:()=>l("showCheckboxes",n.showCheckboxes===!1),style:{position:"relative",width:36,height:20,borderRadius:10,border:"none",cursor:"pointer",transition:"background 0.2s ease",background:n.showCheckboxes!==!1?"#4361ee":"#d1d5db",padding:0},children:e.jsx("span",{style:{position:"absolute",top:2,left:n.showCheckboxes!==!1?18:2,width:16,height:16,borderRadius:"50%",background:"#fff",boxShadow:"0 1px 3px rgba(0,0,0,0.2)",transition:"left 0.2s ease"}})})]})})]})]}),document.body),h&&_e.createPortal(e.jsxs(e.Fragment,{children:[e.jsx("div",{className:"fixed inset-0",style:{zIndex:9998},onClick:()=>k(!1)}),e.jsxs("div",{ref:ue,className:"fixed rounded-xl shadow-xl p-4 w-64 bg-white dark:bg-[#0e1726] border border-gray-100 dark:border-white/10",style:{zIndex:9999,top:q(T).top,right:q(T).right,animation:"popoverSlide 0.15s ease-out"},children:[e.jsx("div",{className:"text-xs font-medium text-gray-500 dark:text-white-dark mb-3",children:"Vues disponibles"}),e.jsx("div",{className:"space-y-1",children:He.map(i=>{const S=w.includes(i.id),D=i.id==="table";return e.jsxs("label",{className:`flex items-center gap-3 cursor-pointer px-2 py-2 rounded-lg transition-all ${D?"opacity-60 cursor-not-allowed":"hover:bg-gray-50 dark:hover:bg-gray-800"}`,children:[e.jsx("input",{type:"checkbox",checked:S,onChange:()=>O(i.id),disabled:D,className:"form-checkbox text-primary w-4 h-4 rounded"}),e.jsxs("span",{className:`flex items-center gap-2 text-sm ${S?"text-gray-700 dark:text-gray-300":"text-gray-400 dark:text-gray-600"}`,children:[i.icon,i.label]})]},i.id)})}),e.jsx("div",{className:"border-t border-gray-100 dark:border-white/10 mt-3 pt-2",children:e.jsx("p",{className:"text-[10px] text-gray-400 dark:text-gray-600",children:"Le tableau est toujours activé par défaut."})})]})]}),document.body),e.jsx("style",{children:`
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
            `})]})}function Wt({records:t,columns:s,virtualizer:o,sort:n,onSort:l,onColumnReorder:m,density:a,titleDisplay:v,entityIcon:x,accountNumber:c,entitySlug:p,selectedIds:u,onToggleSelect:g,onSelectAll:w,allPageSelected:R,showCheckboxes:z=!0}){var h;const[G,_]=r.useState(null),[y,Y]=r.useState(null),J=o.getVirtualItems(),H={compact:{rowHeight:36,cellClass:"py-1",fontSize:"text-xs",imageSize:"w-6 h-6",fontWeight:"font-medium"},normal:{rowHeight:44,cellClass:"py-2",fontSize:"text-sm",imageSize:"w-9 h-9",fontWeight:"font-semibold"},comfortable:{rowHeight:56,cellClass:"py-3",fontSize:"text-sm",imageSize:"w-9 h-9",fontWeight:"font-semibold"}},X=H[a]||H.comfortable;return u&&u.size>0,e.jsxs("table",{className:"table-hover whitespace-nowrap dataTable-table w-full",children:[e.jsx("thead",{className:"sticky top-0 bg-white dark:bg-[#1b2e4b] z-10",children:e.jsxs("tr",{children:[z&&e.jsx("th",{style:{width:40,padding:"0 8px"},children:e.jsxs("label",{className:"bulk-checkbox-wrapper",style:{display:"flex",alignItems:"center",justifyContent:"center"},children:[e.jsx("input",{type:"checkbox",checked:R&&t.length>0,onChange:()=>w&&w(),className:"bulk-checkbox"}),e.jsx("span",{className:"bulk-checkbox-custom"})]})}),s.map(k=>{const te=(n==null?void 0:n.field)===k.id||k.id==="title"&&(n==null?void 0:n.field)==="title"||k.id==="createdAt"&&(n==null?void 0:n.field)==="createdAt",V=(n==null?void 0:n.direction)||"desc",U=G===k.id,B=y===k.id&&G!==k.id,M=k.id!=="actions";return e.jsx("th",{"data-sortable":k.sortable!==!1?"":void 0,"data-column-id":k.id,onDragEnter:T=>{T.preventDefault(),k.id!=="actions"&&G&&G!==k.id&&Y(k.id)},onDragOver:T=>{T.preventDefault()},onDrop:T=>{T.preventDefault(),G&&G!==k.id&&k.id!=="actions"&&m&&m(G,k.id),_(null),Y(null)},className:`px-2 ${U?"opacity-50":""} ${B?"border-l-2 border-l-primary bg-primary/5":""}`,style:{transition:"opacity 0.15s, border-color 0.15s, background 0.15s",...k.id==="actions"?{width:"1%",whiteSpace:"nowrap"}:{},...k.id==="title"?{minWidth:220}:{}},children:e.jsxs("div",{className:"flex items-center gap-1",children:[M&&e.jsx("span",{draggable:"true",onDragStart:T=>{_(k.id),T.dataTransfer.effectAllowed="move",T.dataTransfer.setData("text/plain",k.id)},onDragEnd:()=>{_(null),Y(null)},className:"cursor-grab text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300",children:e.jsxs("svg",{className:"h-3 w-3",viewBox:"0 0 24 24",fill:"currentColor",children:[e.jsx("circle",{cx:"9",cy:"6",r:"1.5"}),e.jsx("circle",{cx:"15",cy:"6",r:"1.5"}),e.jsx("circle",{cx:"9",cy:"12",r:"1.5"}),e.jsx("circle",{cx:"15",cy:"12",r:"1.5"}),e.jsx("circle",{cx:"9",cy:"18",r:"1.5"}),e.jsx("circle",{cx:"15",cy:"18",r:"1.5"})]})}),k.sortable!==!1?e.jsxs("a",{href:"#",className:"dataTable-sorter flex items-center gap-1",draggable:"false",onClick:T=>{T.preventDefault(),l(k.id)},children:[k.name,te&&e.jsx("svg",{className:`h-3 w-3 text-primary transition-transform ${V==="asc"?"rotate-180":""}`,viewBox:"0 0 24 24",fill:"none",children:e.jsx("path",{d:"M12 5V19M12 19L6 13M12 19L18 13",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round"})})]}):k.name]})},k.id)})]})}),e.jsxs("tbody",{children:[J.length>0&&J[0].start>0&&e.jsx("tr",{children:e.jsx("td",{colSpan:s.length+1,style:{height:J[0].start,padding:0}})}),J.map(k=>{const te=t[k.index];if(!te)return null;const V={compact:"4px 8px",normal:"8px 12px",comfortable:"12px 12px"}[a]||"12px 12px",U=u&&u.has(te._id);return e.jsxs("tr",{"data-index":k.index,ref:o.measureElement,style:{minHeight:X.rowHeight},className:U?"bulk-row-selected":"",children:[z&&e.jsx("td",{style:{padding:"0 8px",width:40},children:e.jsxs("label",{className:"bulk-checkbox-wrapper",style:{display:"flex",alignItems:"center",justifyContent:"center"},onClick:B=>{B.preventDefault(),g&&g(te._id,k.index,B.shiftKey)},children:[e.jsx("input",{type:"checkbox",checked:U,readOnly:!0,className:"bulk-checkbox"}),e.jsx("span",{className:"bulk-checkbox-custom"})]})}),s.map(B=>e.jsx("td",{className:`${X.fontSize}`,style:{padding:V,...B.id==="actions"?{width:"1%",whiteSpace:"nowrap"}:{},...B.id==="title"?{minWidth:220}:{}},children:Tt(te,B,c,p,X,v,x)},B.id))]},te._id)}),J.length>0&&e.jsx("tr",{children:e.jsx("td",{colSpan:s.length+1,style:{height:Math.max(0,o.getTotalSize()-(((h=J[J.length-1])==null?void 0:h.end)||0)),padding:0}})})]})]})}function Tt(t,s,o,n,l,m,a){var v,x;switch(s.id){case"title":{const c=t.referenceTitle||t.title||"Sans titre";c.charAt(0).toUpperCase();const p=Math.abs(c.charCodeAt(0)||65)%35+1,u=t.image||`/assets/images/profile-${p}.jpeg`;return e.jsxs("div",{className:"flex items-center gap-2",children:[m==="avatar"&&e.jsx("img",{src:u,alt:c,className:`${l.imageSize} rounded-full max-w-none`}),m==="icon"&&a&&e.jsx("div",{className:`${l.imageSize} rounded-lg max-w-none flex items-center justify-center bg-primary/10 text-primary shrink-0`,children:e.jsx("iconify-icon",{icon:a,width:"16"})}),e.jsx("a",{href:`/account/${o}/record/${n}/${t._id}/edit`,className:`${l.fontWeight} hover:text-primary transition-colors truncate`,title:c,children:c})]})}case"createdAt":return new Date(t.createdAt).toLocaleDateString("fr-FR");case"actions":return e.jsxs("div",{className:"flex items-center gap-0",children:[e.jsx("a",{href:`/account/${o}/record/${n}/${t._id}`,className:"p-1 rounded-lg text-gray-500 hover:text-primary hover:bg-primary/10 transition-all",title:"Voir",children:e.jsxs("svg",{className:"h-4 w-4",viewBox:"0 0 24 24",fill:"none",children:[e.jsx("path",{d:"M15 12C15 13.6569 13.6569 15 12 15C10.3431 15 9 13.6569 9 12C9 10.3431 10.3431 9 12 9C13.6569 9 15 10.3431 15 12Z",stroke:"currentColor",strokeWidth:"1.5"}),e.jsx("path",{d:"M12 5C7.5 5 3.73 7.94 2 12C3.73 16.06 7.5 19 12 19C16.5 19 20.27 16.06 22 12C20.27 7.94 16.5 5 12 5Z",stroke:"currentColor",strokeWidth:"1.5"})]})}),e.jsx("a",{href:`/account/${o}/record/${n}/${t._id}/edit`,className:"p-1 rounded-lg text-gray-500 hover:text-info hover:bg-info/10 transition-all",title:"Modifier",children:e.jsx("svg",{className:"h-4 w-4",viewBox:"0 0 24 24",fill:"none",children:e.jsx("path",{d:"M16.862 4.487L18.55 2.8C19.33 2.02 20.59 2.02 21.37 2.8C22.15 3.58 22.15 4.84 21.37 5.62L19.681 7.307M16.862 4.487L4.162 17.187C3.882 17.467 3.682 17.818 3.592 18.198L2.732 21.596C2.642 21.966 2.952 22.296 3.322 22.226L6.892 21.556C7.242 21.486 7.572 21.306 7.832 21.046L20.513 8.366M16.862 4.487L19.681 7.307",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round"})})}),e.jsx("button",{type:"button",className:"p-1 rounded-lg text-gray-500 hover:text-danger hover:bg-danger/10 transition-all",title:"Supprimer",onClick:()=>{confirm("Êtes-vous sûr de vouloir supprimer cet enregistrement ?")&&console.log("Delete record:",t._id)},children:e.jsxs("svg",{className:"h-4 w-4",viewBox:"0 0 24 24",fill:"none",children:[e.jsx("path",{d:"M20.5 6H3.5",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"}),e.jsx("path",{d:"M18.833 8.5L18.373 15.4C18.196 18.054 18.108 19.381 17.243 20.19C16.378 21 15.048 21 12.387 21H11.613C8.952 21 7.622 21 6.757 20.19C5.892 19.381 5.804 18.054 5.627 15.4L5.167 8.5",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"}),e.jsx("path",{d:"M9.5 11L10 16",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"}),e.jsx("path",{d:"M14.5 11L14 16",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"}),e.jsx("path",{d:"M6.5 6C6.556 5.367 6.612 5.1 6.877 4.714C7.178 4.275 7.945 3.917 9.484 3.2L9.924 2.984C10.683 2.589 11.06 2.392 11.476 2.318C11.823 2.254 12.177 2.254 12.524 2.318C12.94 2.392 13.317 2.589 14.076 2.984L14.516 3.2C16.055 3.917 16.822 4.275 17.123 4.714C17.388 5.1 17.444 5.367 17.5 6",stroke:"currentColor",strokeWidth:"1.5"})]})})]});default:{if(s.id.startsWith("rel:")){const c=s.id.substring(4),u=(((v=t._denorm)==null?void 0:v.relations)||[]).find(w=>w.relationKey===c);if(((x=u==null?void 0:u.records)==null?void 0:x.length)>0)return e.jsx("div",{className:"flex flex-wrap gap-1",children:u.records.map((w,R)=>e.jsx("a",{href:`/account/${o}/record/${w.entitySlug||n}/${w._id}`,className:"text-primary hover:underline text-xs",children:w.title||"Sans titre"},R))});const g=(t.relations||[]).find(w=>w.relationKey===c);return g!=null&&g.value?"—":""}if(s.id.startsWith("classif:")){const c=s.id.substring(8),p=(t.classificationValues||[]).find(u=>{var w,R,z;return(((w=u.classificationId)==null?void 0:w.$oid)||((z=(R=u.classificationId)==null?void 0:R.toString)==null?void 0:z.call(R))||u.classificationId)===c});if(p!=null&&p.label){const u=p.color||"#888";return e.jsx("span",{className:"inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap",style:{backgroundColor:`${u}15`,color:u,border:`1px solid ${u}30`},children:p.label})}return p!=null&&p.value?e.jsx("span",{className:"inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20",children:p.value}):""}if(s.computed&&t._computedFields){const c=t._computedFields[s.id];if(!c||c.value===null||c.value===void 0)return"—";const p=s.computedDisplay||"text",u=s.computedColor||"#4361ee";if(p==="badge")return e.jsx("span",{className:"inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap",style:{background:`${u}15`,color:u,border:`1px solid ${u}30`},children:c.formatted||c.value});if(p==="currency")return e.jsx("span",{style:{fontWeight:600,color:"#334155"},children:c.formatted||`${Number(c.value).toFixed(2)} €`});if(p==="stars"){const g=Number(c.value)||0,w=Number(c.max)||5;return e.jsxs("span",{style:{display:"inline-flex",alignItems:"center",gap:1},children:[Array.from({length:Math.floor(g)}).map((R,z)=>e.jsx("iconify-icon",{icon:"solar:star-bold",width:"14",style:{color:"#f59e0b"}},`f${z}`)),g-Math.floor(g)>=.5&&e.jsx("iconify-icon",{icon:"solar:star-bold-duotone",width:"14",style:{color:"#f59e0b"}}),Array.from({length:w-Math.ceil(g)}).map((R,z)=>e.jsx("iconify-icon",{icon:"solar:star-line-duotone",width:"14",style:{color:"#e2e8f0"}},`e${z}`)),e.jsx("span",{style:{fontSize:11,color:"#9ca3af",marginLeft:4},children:c.formatted})]})}if(p==="progress"){const g=Math.min(Math.max(Number(c.percentage||c.value)||0,0),100),w=g>=80?"#10b981":g>=50?"#f59e0b":"#ef4444";return e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:6,minWidth:80},children:[e.jsx("div",{style:{flex:1,height:5,background:"#e2e8f0",borderRadius:3,overflow:"hidden"},children:e.jsx("div",{style:{width:`${g}%`,height:"100%",background:w,borderRadius:3}})}),e.jsxs("span",{style:{fontSize:11,fontWeight:600,color:w},children:[g,"%"]})]})}return c.formatted||c.value||""}if(t.customFields){const c=t.customFields.find(u=>{var w;const g=((w=u.field_id)==null?void 0:w._id)||u.field_id;return(g==null?void 0:g.toString())===s.id});if(!c)return"";const p=c.value;if(p&&typeof p=="object"&&p._v){const u=[];return Object.entries(p).forEach(([g,w])=>{g==="_v"||g==="customText"||(Array.isArray(w)?w.forEach(R=>u.push(R)):w&&u.push(w))}),p.customText&&u.push(p.customText),e.jsx("div",{className:"flex flex-wrap gap-1",children:u.map((g,w)=>e.jsx("span",{className:"inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20",children:g},w))})}return p||""}return""}}}function Ue(t,s=.1){if(!t)return`rgba(99, 102, 241, ${s})`;const o=parseInt(t.slice(1,3),16),n=parseInt(t.slice(3,5),16),l=parseInt(t.slice(5,7),16);return`rgba(${o}, ${n}, ${l}, ${s})`}function Et({field:t,record:s}){const o=(s.customFields||[]).find(l=>{var a;const m=((a=l.field_id)==null?void 0:a._id)||l.field_id;return(m==null?void 0:m.toString())===t.id});if(!o)return e.jsx("span",{className:"text-gray-400 dark:text-gray-600 text-sm italic",children:"—"});const n=o.value;if(n==null||n==="")return e.jsx("span",{className:"text-gray-400 dark:text-gray-600 text-sm italic",children:"—"});if(t.type==="date"||t.type==="datetime")try{return e.jsx("span",{className:"text-sm text-gray-700 dark:text-gray-300",children:new Date(n).toLocaleDateString("fr-FR")})}catch{return e.jsx("span",{className:"text-sm text-gray-700 dark:text-gray-300",children:String(n)})}return t.type==="boolean"||t.type==="checkbox"?e.jsxs("span",{className:`inline-flex items-center gap-1 text-sm ${n?"text-success":"text-gray-400"}`,children:[n?e.jsxs("svg",{width:"16",height:"16",viewBox:"0 0 24 24",fill:"none",children:[e.jsx("path",{d:"M9 12l2 2 4-4",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round"}),e.jsx("circle",{cx:"12",cy:"12",r:"10",stroke:"currentColor",strokeWidth:"1.5"})]}):e.jsx("svg",{width:"16",height:"16",viewBox:"0 0 24 24",fill:"none",children:e.jsx("circle",{cx:"12",cy:"12",r:"10",stroke:"currentColor",strokeWidth:"1.5"})}),n?"Oui":"Non"]}):t.type==="relation"?Array.isArray(n)?e.jsx("div",{className:"flex flex-wrap gap-1",children:n.map((l,m)=>e.jsx("span",{className:"inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-primary/10 text-primary font-medium",children:l.title||l.label||l.name||String(l)},m))}):e.jsx("span",{className:"text-sm text-gray-700 dark:text-gray-300",children:n.title||n.label||String(n)}):t.type==="number"?e.jsx("span",{className:"text-sm font-mono text-gray-700 dark:text-gray-300",children:Number(n).toLocaleString("fr-FR")}):e.jsx("span",{className:"text-sm text-gray-700 dark:text-gray-300",children:String(n)})}function Ft({record:t,columns:s,accountNumber:o,entitySlug:n,onClose:l}){var _;const m=r.useRef(null),[a,v]=r.useState(!1);r.useEffect(()=>{requestAnimationFrame(()=>v(!0))},[]);const x=r.useCallback(()=>{v(!1),setTimeout(()=>l(),250)},[l]);if(r.useEffect(()=>{const y=Y=>{Y.key==="Escape"&&x()};return document.addEventListener("keydown",y),()=>document.removeEventListener("keydown",y)},[x]),!t)return null;const c=((_=t._id)==null?void 0:_.$oid)||t._id,p=t.referenceTitle||t.title||t.computedTitle||"Sans titre",u=t.description||"",g=t.createdAt?new Date(t.createdAt).toLocaleDateString("fr-FR",{day:"2-digit",month:"long",year:"numeric"}):null,w=t.updatedAt?new Date(t.updatedAt).toLocaleDateString("fr-FR",{day:"2-digit",month:"long",year:"numeric"}):null,R=(t.classificationValues||[]).filter(y=>y.optionLabel||y.label).map(y=>({label:y.optionLabel||y.label,color:y.optionColor||y.color||"#6366f1",classificationName:y.classificationName||"Classification"})),z={};R.forEach(y=>{z[y.classificationName]||(z[y.classificationName]=[]),z[y.classificationName].push(y)});const G=s.filter(y=>y.id!=="title"&&y.id!=="actions"&&!y.id.startsWith("class:"));return _e.createPortal(e.jsxs(e.Fragment,{children:[e.jsx("div",{className:`fixed inset-0 bg-black/40 backdrop-blur-[2px] transition-opacity duration-250 ${a?"opacity-100":"opacity-0"}`,style:{zIndex:1e4},onMouseDown:x,onTouchEnd:y=>{y.preventDefault(),x()}}),e.jsxs("div",{ref:m,className:`fixed right-0 top-0 h-full bg-white dark:bg-[#0e1726] shadow-2xl border-l border-gray-200 dark:border-gray-700 flex flex-col transition-transform duration-250 ease-out ${a?"translate-x-0":"translate-x-full"}`,style:{zIndex:10001,width:"min(520px, 90vw)"},onClick:y=>y.stopPropagation(),children:[e.jsxs("div",{className:"flex items-center justify-between gap-3 px-6 py-4 border-b border-gray-100 dark:border-gray-700/50 flex-shrink-0",children:[e.jsxs("div",{className:"flex items-center gap-2 min-w-0",children:[e.jsx("div",{className:"w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0",children:e.jsxs("svg",{width:"16",height:"16",viewBox:"0 0 24 24",fill:"none",children:[e.jsx("path",{d:"M2 12C2 7.28595 2 4.92893 3.46447 3.46447C4.92893 2 7.28595 2 12 2C16.714 2 19.0711 2 20.5355 3.46447C22 4.92893 22 7.28595 22 12C22 16.714 22 19.0711 20.5355 20.5355C19.0711 22 16.714 22 12 22C7.28595 22 4.92893 22 3.46447 20.5355C2 19.0711 2 16.714 2 12Z",stroke:"#4361ee",strokeWidth:"1.5"}),e.jsx("path",{d:"M8 12H16M12 8V16",stroke:"#4361ee",strokeWidth:"1.5",strokeLinecap:"round"})]})}),e.jsx("h3",{className:"text-base font-semibold text-gray-900 dark:text-white truncate",children:p})]}),e.jsxs("div",{className:"flex items-center gap-1 flex-shrink-0",children:[e.jsx("a",{href:`/account/${o}/record/${n}/${c}`,className:"p-2 rounded-lg text-gray-400 hover:text-primary hover:bg-primary/10 transition-all",title:"Ouvrir la page complète",children:e.jsxs("svg",{width:"16",height:"16",viewBox:"0 0 24 24",fill:"none",children:[e.jsx("path",{d:"M10 4H6C4.89543 4 4 4.89543 4 6V18C4 19.1046 4.89543 20 6 20H18C19.1046 20 20 19.1046 20 18V14",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"}),e.jsx("path",{d:"M14 4H20V10",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round"}),e.jsx("path",{d:"M20 4L11 13",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"})]})}),e.jsx("a",{href:`/account/${o}/record/${n}/${c}/edit`,className:"p-2 rounded-lg text-gray-400 hover:text-info hover:bg-info/10 transition-all",title:"Modifier",children:e.jsx("svg",{width:"16",height:"16",viewBox:"0 0 24 24",fill:"none",children:e.jsx("path",{d:"M16.862 4.487L18.55 2.8C19.33 2.02 20.59 2.02 21.37 2.8C22.15 3.58 22.15 4.84 21.37 5.62L19.681 7.307M16.862 4.487L4.162 17.187C3.882 17.467 3.682 17.818 3.592 18.198L2.732 21.596C2.642 21.966 2.952 22.296 3.322 22.226L6.892 21.556C7.242 21.486 7.572 21.306 7.832 21.046L20.513 8.366",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"})})}),e.jsx("button",{onClick:x,className:"p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all",title:"Fermer",children:e.jsx("svg",{width:"16",height:"16",viewBox:"0 0 24 24",fill:"none",children:e.jsx("path",{d:"M18 6L6 18M6 6L18 18",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round"})})})]})]}),e.jsxs("div",{className:"flex-1 overflow-y-auto",children:[Object.keys(z).length>0&&e.jsx("div",{className:"px-6 py-4 border-b border-gray-100 dark:border-gray-700/50",children:Object.entries(z).map(([y,Y])=>e.jsxs("div",{className:"mb-3 last:mb-0",children:[e.jsx("div",{className:"text-[11px] uppercase tracking-wider font-semibold text-gray-400 dark:text-gray-500 mb-1.5",children:y}),e.jsx("div",{className:"flex flex-wrap gap-1.5",children:Y.map((J,H)=>e.jsxs("span",{className:"inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium transition-all hover:scale-105",style:{backgroundColor:Ue(J.color,.15),color:J.color,border:`1px solid ${Ue(J.color,.3)}`},children:[e.jsx("span",{className:"w-2 h-2 rounded-full flex-shrink-0",style:{backgroundColor:J.color}}),J.label]},H))})]},y))}),u&&e.jsxs("div",{className:"px-6 py-4 border-b border-gray-100 dark:border-gray-700/50",children:[e.jsx("div",{className:"text-[11px] uppercase tracking-wider font-semibold text-gray-400 dark:text-gray-500 mb-2",children:"Description"}),e.jsx("p",{className:"text-sm text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-wrap",children:u})]}),e.jsxs("div",{className:"px-6 py-4",children:[e.jsx("div",{className:"text-[11px] uppercase tracking-wider font-semibold text-gray-400 dark:text-gray-500 mb-3",children:"Détails"}),e.jsxs("div",{className:"space-y-0",children:[G.map(y=>e.jsxs("div",{className:"flex items-start gap-3 py-2.5 border-b border-gray-50 dark:border-gray-800/50 last:border-0",children:[e.jsx("div",{className:"w-32 flex-shrink-0 text-xs font-medium text-gray-500 dark:text-gray-400 pt-0.5 truncate",children:y.name}),e.jsx("div",{className:"flex-1 min-w-0",children:e.jsx(Et,{field:y,record:t})})]},y.id)),(t.relations||[]).map((y,Y)=>{var J;return e.jsxs("div",{className:"flex items-start gap-3 py-2.5 border-b border-gray-50 dark:border-gray-800/50 last:border-0",children:[e.jsx("div",{className:"w-32 flex-shrink-0 text-xs font-medium text-gray-500 dark:text-gray-400 pt-0.5 truncate",children:y.label||y.key||"Relation"}),e.jsx("div",{className:"flex-1 min-w-0",children:((J=y.records)==null?void 0:J.length)>0?e.jsx("div",{className:"flex flex-wrap gap-1",children:y.records.map((H,X)=>e.jsx("a",{href:`/account/${o}/record/${y.entitySlug||n}/${H._id}`,className:"inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-primary/10 text-primary font-medium hover:bg-primary/20 transition-colors",children:H.referenceTitle||H.title||"Sans titre"},X))}):e.jsx("span",{className:"text-gray-400 dark:text-gray-600 text-sm italic",children:"—"})})]},`rel-${Y}`)})]})]})]}),e.jsx("div",{className:"flex-shrink-0 px-6 py-3 border-t border-gray-100 dark:border-gray-700/50 bg-gray-50/50 dark:bg-[#0a0f1e]/50",children:e.jsxs("div",{className:"flex items-center justify-between text-[11px] text-gray-400 dark:text-gray-500",children:[e.jsxs("div",{className:"flex items-center gap-3",children:[g&&e.jsxs("span",{className:"flex items-center gap-1",children:[e.jsxs("svg",{width:"12",height:"12",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"1.5",children:[e.jsx("circle",{cx:"12",cy:"12",r:"10"}),e.jsx("path",{d:"M12 6V12L16 14",strokeLinecap:"round"})]}),"Créé le ",g]}),w&&e.jsxs("span",{className:"flex items-center gap-1",children:[e.jsx("svg",{width:"12",height:"12",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"1.5",children:e.jsx("path",{d:"M4.06 13C4.02 12.67 4 12.34 4 12C4 7.58 7.58 4 12 4C14.5 4 16.73 5.15 18.2 6.94M19.94 11C19.98 11.33 20 11.66 20 12C20 16.42 16.42 20 12 20C9.5 20 7.27 18.85 5.8 17.06",strokeLinecap:"round",strokeLinejoin:"round"})}),"Modifié le ",w]})]}),e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx("a",{href:`/account/${o}/record/${n}/${c}`,className:"px-3 py-1.5 bg-primary/10 text-primary text-xs font-medium rounded-lg hover:bg-primary/20 transition-colors",children:"Voir"}),e.jsx("a",{href:`/account/${o}/record/${n}/${c}/edit`,className:"px-3 py-1.5 bg-primary text-white text-xs font-medium rounded-lg hover:bg-primary/90 transition-colors",children:"Modifier"})]})]})})]})]}),document.body)}function Je(t,s=.1){const o=/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(t);return o?`rgba(${parseInt(o[1],16)}, ${parseInt(o[2],16)}, ${parseInt(o[3],16)}, ${s})`:`rgba(128,128,128,${s})`}function qe(t){if(!t)return"";const s=new Date(t);return isNaN(s)?"":s.toLocaleDateString("fr-FR",{day:"2-digit",month:"2-digit",year:"2-digit"})}function zt(t){if(!t)return"";const s=new Date(t);return isNaN(s)?"":s.toLocaleDateString("fr-FR",{weekday:"long",day:"numeric",month:"long",year:"numeric"})}function Ie(t){if(!t)return"";const s=new Date(t);return isNaN(s)?"":s.toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit"})}function Ot(t,s){const o=t._start?new Date(t._start):null,n=t._end?new Date(t._end):null;return o&&n?`${Ie(o)} — ${Ie(n)}`:o?Ie(o):""}function ze(t,s,o){if(t==null)return"";switch(s){case"date":return qe(t);case"date-long":return zt(t);case"datetime":return`${qe(t)} ${Ie(t)}`;case"time":return Ie(t);case"time-range":return Ot(o);case"relative":{const n=new Date(t);if(isNaN(n))return"";const l=Date.now()-n.getTime(),m=Math.floor(l/6e4);if(m<60)return`il y a ${m}min`;const a=Math.floor(m/60);return a<24?`il y a ${a}h`:`il y a ${Math.floor(a/24)}j`}case"currency":return`${Number(t).toLocaleString("fr-FR")} €`;case"number":return Number(t).toLocaleString("fr-FR");default:return String(t)}}function Oe(t,s,o){var n;if(!s)return"";switch(s){case"__description__":return t.description||"";case"__createdAt__":return t.createdAt||"";case"__updatedAt__":return t.updatedAt||"";case"__date__":return t._start||t.dueDate||t.createdAt||"";case"__time__":return t._start||"";case"title":return t.referenceTitle||t.title||t.computedTitle||""}if(t.customFields)for(const l of t.customFields){const m=((n=l.field_id)==null?void 0:n._id)||l.field_id;if(String(m)===String(s))return l.value||""}return t[s]!==void 0?t[s]:""}function At(t){const s=t.classificationValues||[];if(s.length===0)return null;const o=s[0];return{label:o.optionLabel||o.label||"",color:o.optionColor||o.color||"#6366f1"}}function Dt(t){return(t.classificationValues||[]).filter(s=>s.optionLabel||s.label).map(s=>({label:s.optionLabel||s.label,color:s.optionColor||s.color||"#6366f1"}))}const Ye={xs:"11px",sm:"13px",base:"14px",lg:"16px"},Ze={normal:"400",medium:"500",semibold:"600",bold:"700"},Ke={none:"none",sm:"0 1px 3px rgba(0,0,0,0.08)",md:"0 4px 12px rgba(0,0,0,0.1)",lg:"0 8px 24px rgba(0,0,0,0.12)"};function Vt(t,s,o,n,l,m={}){var c;if(!t||t.visible===!1)return null;const a=t._id||t.fieldId||t.type+Math.random(),v=Ye[t.fontSize]||Ye.sm,x=Ze[t.fontWeight]||Ze.normal;switch(t.type){case"title":{const p=s.referenceTitle||s.title||s.computedTitle||"Sans titre";return e.jsx("div",{style:{fontSize:v,fontWeight:x,lineHeight:"1.3",color:t.color||void 0,...t.maxLines>0?{overflow:"hidden",display:"-webkit-box",WebkitLineClamp:t.maxLines,WebkitBoxOrient:"vertical"}:{}},className:"text-gray-800 dark:text-white-dark",children:p},a)}case"field":{const p=Oe(s,t.fieldId);if(!p&&p!==0)return null;const u=ze(p,t.format,s);return e.jsxs("div",{style:{fontSize:v,fontWeight:x,color:t.color||"#6b7280",...t.maxLines>0?{overflow:"hidden",display:"-webkit-box",WebkitLineClamp:t.maxLines,WebkitBoxOrient:"vertical"}:{}},children:[t.prefix&&e.jsx("span",{children:t.prefix}),u,t.suffix&&e.jsx("span",{style:{marginLeft:2,opacity:.7},children:t.suffix})]},a)}case"status":{const p=Dt(s);if(p.length===0)return null;const u=t.format==="pill";return e.jsx("div",{style:{display:"flex",flexWrap:"wrap",gap:"4px"},children:p.slice(0,3).map((g,w)=>e.jsxs("span",{style:{display:"inline-flex",alignItems:"center",gap:"4px",padding:u?"3px 10px":"2px 6px",borderRadius:u?"20px":"4px",fontSize:v,fontWeight:"600",backgroundColor:Je(g.color,.15),color:g.color},children:[e.jsx("span",{style:{width:6,height:6,borderRadius:"50%",backgroundColor:g.color,flexShrink:0}}),g.label]},w))},a)}case"date":case"icon-value":{const p=Oe(s,t.fieldId),u=ze(p||s._start||s.createdAt,t.format,s);return u?e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"6px",fontSize:v,color:t.color||"#6b7280"},children:[t.icon&&e.jsx("iconify-icon",{icon:t.icon,width:"14",height:"14",style:{flexShrink:0,opacity:.7}}),e.jsx("span",{children:u}),t.suffix&&e.jsx("span",{style:{opacity:.7},children:t.suffix})]},a):null}case"actions":{const p=((c=s._id)==null?void 0:c.$oid)||s._id,u=t.items||["edit","view"];return e.jsxs("div",{style:{display:"flex",alignItems:"center"},children:[u.includes("open")&&e.jsxs("a",{href:`/account/${n}/record/${l}/edit/${p}`,style:{flex:1,display:"flex",alignItems:"center",justifyContent:"center",gap:6,padding:"10px",fontSize:12,fontWeight:600,color:"#4361ee",textDecoration:"none",transition:"background 0.2s",borderRight:u.includes("close")?"1px solid #f0f0f0":"none"},onMouseEnter:g=>g.currentTarget.style.backgroundColor="#f8f9ff",onMouseLeave:g=>g.currentTarget.style.backgroundColor="transparent",onClick:g=>g.stopPropagation(),onPointerDown:g=>g.stopPropagation(),children:[e.jsx("iconify-icon",{icon:"solar:pen-new-square-linear",width:"14",height:"14"}),"Ouvrir la fiche"]}),u.includes("close")&&m.onClose&&e.jsx("button",{onClick:g=>{g.stopPropagation(),m.onClose()},style:{flex:1,display:"flex",alignItems:"center",justifyContent:"center",gap:6,padding:"10px",fontSize:12,fontWeight:600,color:"#888",border:"none",backgroundColor:"transparent",cursor:"pointer",transition:"background 0.2s"},onMouseEnter:g=>g.currentTarget.style.backgroundColor="#fafafa",onMouseLeave:g=>g.currentTarget.style.backgroundColor="transparent",children:"Fermer"}),u.includes("edit")&&e.jsx("a",{href:`/account/${n}/record/${l}/${p}/edit`,className:"p-1 hover:text-info rounded hover:bg-gray-100 dark:hover:bg-gray-700",onClick:g=>g.stopPropagation(),onPointerDown:g=>g.stopPropagation(),style:{pointerEvents:"auto"},children:e.jsx("iconify-icon",{icon:"solar:pen-new-square-linear",width:"14",height:"14"})}),u.includes("view")&&e.jsx("a",{href:`/account/${n}/record/${l}/${p}`,className:"p-1 hover:text-primary rounded hover:bg-gray-100 dark:hover:bg-gray-700",onClick:g=>g.stopPropagation(),onPointerDown:g=>g.stopPropagation(),style:{pointerEvents:"auto"},children:e.jsx("iconify-icon",{icon:"solar:eye-linear",width:"14",height:"14"})})]},a)}case"separator":return e.jsx("div",{style:{height:1,backgroundColor:"#f0f0f0",margin:"4px 0"},className:"dark:bg-gray-700"},a);case"spacer":return e.jsx("div",{style:{flex:1}},a);case"text":return e.jsx("span",{style:{fontSize:v,fontWeight:x,color:t.color||"#6b7280"},children:t.label||""},a);case"badge":{const p=Oe(s,t.fieldId);return p?e.jsx("span",{style:{display:"inline-flex",alignItems:"center",gap:4,padding:"2px 8px",borderRadius:4,fontSize:v,fontWeight:"600",backgroundColor:t.color?Je(t.color,.15):"#f0f0f0",color:t.color||"#555"},children:ze(p,t.format,s)},a):null}default:return null}}function Bt(t,s,o,n,l,m){var v;if(!t||!((v=t.elements)!=null&&v.length))return null;const a=t.elements.filter(x=>x.visible!==!1);return a.length===0?null:e.jsx("div",{style:{display:"flex",flexDirection:t.direction==="row"?"row":"column",gap:`${t.gap||4}px`,padding:t.padding||"12px",alignItems:t.direction==="row"?t.align==="between"||t.align==="center"?"center":t.align==="end"?"flex-end":"flex-start":void 0,justifyContent:t.direction==="row"?t.align==="between"?"space-between":t.align==="end"?"flex-end":t.align==="stretch"?"stretch":"flex-start":void 0,borderTop:t.borderTop?"1px solid #f0f0f0":void 0,borderBottom:t.borderBottom?"1px solid #f0f0f0":void 0},className:t.borderTop?"dark:border-gray-700/50":"",children:a.map(x=>Vt(x,s,o,n,l,m))},t.id||t._id)}function Pt(t,s){if(!s||s.accentSource==="none"||s.accentPosition==="none")return null;if(s.accentSource==="fixed")return s.accentColor||"#4361ee";if(s.accentSource==="status"){const o=At(t);return(o==null?void 0:o.color)||"#4361ee"}return null}const Ht={accentPosition:"none",accentSource:"none",borderRadius:8,shadow:"sm",zones:[{id:"body",direction:"column",gap:6,padding:"12px",elements:[{type:"title",fontSize:"sm",fontWeight:"semibold",maxLines:2,visible:!0},{type:"field",fieldId:"__description__",fontSize:"xs",maxLines:2,color:"#6b7280",visible:!0},{type:"status",format:"badge",fontSize:"xs",visible:!0}]},{id:"footer",direction:"row",gap:4,padding:"8px 12px",align:"between",borderTop:!0,elements:[{type:"date",fieldId:"__createdAt__",icon:"solar:calendar-linear",format:"date",fontSize:"xs",visible:!0},{type:"actions",items:["edit","view"],visible:!0}]}]},Ut={accentPosition:"top",accentSource:"status",borderRadius:14,shadow:"lg",zones:[{id:"header",direction:"column",gap:4,padding:"16px 20px 8px",elements:[{type:"title",fontSize:"base",fontWeight:"bold",maxLines:1,visible:!0}]},{id:"body",direction:"column",gap:6,padding:"0 20px 12px",elements:[{type:"icon-value",fieldId:"__time__",icon:"solar:clock-circle-linear",format:"time-range",fontSize:"xs",visible:!0},{type:"icon-value",fieldId:"__date__",icon:"solar:calendar-linear",format:"date-long",fontSize:"xs",visible:!0},{type:"status",format:"pill",fontSize:"xs",visible:!0}]},{id:"footer",direction:"row",gap:0,padding:"0",align:"stretch",borderTop:!0,elements:[{type:"actions",items:["open","close"],visible:!0}]}]};function nt({record:t,cardTemplate:s,context:o="kanban",entityData:n,accountNumber:l,entitySlug:m,className:a="",style:v={},callbacks:x={}}){const c=r.useMemo(()=>s!=null&&s.layout?s.layout:o==="calendar"?Ut:Ht,[s,o]),p=Pt(t,c),u=c.borderRadius||8,g=Ke[c.shadow]||Ke.sm;return e.jsxs("div",{className:a,style:{borderRadius:u,boxShadow:g,overflow:"hidden",position:"relative",...v},children:[p&&c.accentPosition==="top"&&e.jsx("div",{style:{height:4,backgroundColor:p}}),p&&c.accentPosition==="left"&&e.jsx("div",{style:{position:"absolute",left:0,top:0,bottom:0,width:4,backgroundColor:p}}),e.jsx("div",{style:{paddingLeft:c.accentPosition==="left"?4:0},children:(c.zones||[]).map(w=>Bt(w,t,n,l,m,x))})]})}function Ae(t,s=.1){const o=/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(t);return o?`rgba(${parseInt(o[1],16)}, ${parseInt(o[2],16)}, ${parseInt(o[3],16)}, ${s})`:`rgba(128,128,128,${s})`}function ot({record:t,accountNumber:s,entitySlug:o,isDragging:n=!1,onQuickView:l,cardTemplate:m,entityData:a}){var J;const v=r.useRef(null),x=r.useRef(!1),c=String(((J=t._id)==null?void 0:J.$oid)||t._id),{attributes:p,listeners:u,setNodeRef:g,transform:w,transition:R,isDragging:z}=It({id:c}),G={transform:$t.Transform.toString(w),transition:R,opacity:n||z?.7:1,touchAction:"manipulation"},_=H=>{v.current={x:H.clientX,y:H.clientY,time:Date.now()},x.current=!1},y=H=>{if(v.current){const X=Math.abs(H.clientX-v.current.x),h=Math.abs(H.clientY-v.current.y);(X>5||h>5)&&(x.current=!0)}},Y=H=>{if(!v.current)return;const X=Date.now()-v.current.time;!x.current&&X<400&&l&&!H.target.closest("a, button")&&setTimeout(()=>l(t),50),v.current=null};return e.jsx("div",{ref:g,style:G,className:`kanban-card cursor-pointer transition-all group ${n||z?"shadow-lg ring-2 ring-primary/30 cursor-move":""}`,"data-dnd":"card",onPointerDown:_,onPointerMove:y,onPointerUp:Y,...p,...u,children:e.jsx(nt,{record:t,cardTemplate:m,context:"kanban",entityData:a,accountNumber:s,entitySlug:o,className:"bg-white hover:shadow-md border border-gray-200/80 dark:border-0 dark:bg-dark/40 dark:hover:bg-dark/60",style:{borderRadius:8}})})}function Jt({column:t,records:s,recordIds:o,accountNumber:n,entitySlug:l,onQuickView:m,cardTemplate:a,entityData:v}){const{setNodeRef:x,isOver:c}=Lt({id:String(t.id)}),p=typeof document<"u"&&document.documentElement.classList.contains("dark"),u=Ae(t.color,p?.12:.06),g=Ae(t.color,p?.3:.15);return e.jsxs("div",{ref:x,className:`flex-none rounded-lg overflow-hidden transition-all ${c?"ring-2 ring-primary/50 ring-offset-2":""}`,style:{width:"300px",maxWidth:"320px",backgroundColor:c?Ae(t.color,.15):u,border:`1px solid ${g}`},"data-dnd":"column",children:[e.jsx("div",{style:{height:"4px",backgroundColor:t.color}}),e.jsx("div",{className:"px-3 py-2 flex justify-between items-center",children:e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx("span",{className:"inline-flex items-center gap-1.5 px-2 py-0 rounded text-xs font-semibold uppercase tracking-wide",style:{backgroundColor:t.color,color:"#fff"},children:t.title}),e.jsx("span",{className:"text-xs text-gray-500 font-medium",children:s.length})]})}),e.jsx("div",{className:"px-2 pb-3",children:e.jsx(Mt,{items:o,strategy:_t,children:e.jsx("div",{className:`space-y-2 min-h-[80px] rounded-lg transition-all ${c?"bg-primary/5 p-2":""}`,children:s.length===0?e.jsx("div",{className:"text-xs text-gray-300 dark:text-gray-600 text-center py-8 italic",children:"Aucun enregistrement"}):s.map(w=>{var R;return e.jsx(ot,{record:w,accountNumber:n,entitySlug:l,onQuickView:m,cardTemplate:a,entityData:v},((R=w._id)==null?void 0:R.$oid)||w._id)})})})}),e.jsx("div",{className:"px-3 pb-3",children:e.jsxs("button",{type:"button",className:"flex items-center gap-1 text-xs text-gray-400 hover:text-primary transition-colors",children:[e.jsx("svg",{width:"14",height:"14",viewBox:"0 0 24 24",fill:"none",children:e.jsx("path",{d:"M12 6V18M6 12H18",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round"})}),"Ajouter"]})})]})}function qt({records:t,columns:s,accountNumber:o,entitySlug:n,viewId:l,entityData:m}){const a=r.useRef(null),v=r.useRef(null),[x,c]=r.useState(t),[p,u]=r.useState({}),[g,w]=r.useState(null),[R,z]=r.useState(null),G=r.useCallback(j=>{z(j)},[]),[_,y]=r.useState(null);r.useEffect(()=>{var O;if(!(m!=null&&m._id))return;const j=((O=m._id)==null?void 0:O.$oid)||m._id;fetch(`/account/${o}/api/entity/${j}/cards/default/kanban`,{credentials:"include"}).then(Z=>Z.json()).then(Z=>{Z.success&&Z.card&&y(Z.card)}).catch(()=>{})},[m==null?void 0:m._id,o]),r.useEffect(()=>{c(t)},[t]);const Y=r.useRef(!1),J=r.useRef(0),H=r.useRef(0),X=r.useCallback(j=>{if(g||j.button!==0||j.target.closest('a, button, .dropdown, [data-dnd="card"]'))return;const O=a.current;O&&(Y.current=!0,J.current=j.pageX-O.offsetLeft,H.current=O.scrollLeft,O.style.cursor="grabbing")},[g]),h=r.useCallback(j=>{if(g){Y.current=!1;return}if(!Y.current)return;j.preventDefault();const O=a.current;if(!O)return;const W=(j.pageX-O.offsetLeft-J.current)*1.5;O.scrollLeft=H.current-W},[g]),k=r.useCallback(()=>{Y.current=!1,a.current&&(a.current.style.cursor="grab")},[]),te=bt(Fe(Nt,{activationConstraint:{distance:8}}),Fe(St,{activationConstraint:{delay:500,tolerance:10}}),Fe(Ct,{coordinateGetter:jt})),V=r.useMemo(()=>{if(m){const W=m.statusClassification;if(W&&W.options&&W.options.length>0){const P=W.options.map(K=>({id:String(K._id),title:K.label,color:K.color||"#6366f1",optionId:String(K._id)}));return P.push({id:"__none__",title:"Sans Statut",color:"#9ca3af",optionId:"none"}),{classId:String(W._id),columns:P}}const q=m.classifications||[];for(const P of q)if(P.options&&P.options.length>0){const K=P.options.map(ie=>({id:String(ie._id),title:ie.label,color:ie.color||"#6366f1",optionId:String(ie._id)}));return K.push({id:"__none__",title:"Non classé",color:"#9ca3af",optionId:"none"}),{classId:String(P._id),columns:K}}}const j={};x.forEach(W=>{(W.classificationValues||[]).forEach(q=>{var i,S;const P=((i=q.classificationId)==null?void 0:i.$oid)||q.classificationId||q.classification_id;if(!P)return;j[P]||(j[P]={count:0,options:{}}),j[P].count++;const K=q.optionLabel||q.label||"Sans label",ie=q.optionColor||q.color||"#9ca3af",b=((S=q.optionId)==null?void 0:S.$oid)||q.optionId||K;j[P].options[K]||(j[P].options[K]={label:K,color:ie,optionId:String(b),count:0}),j[P].options[K].count++})});let O=null,Z=0;if(Object.entries(j).forEach(([W,q])=>{q.count>Z&&(Z=q.count,O=W)}),O&&j[O]){const q=Object.values(j[O].options).map(P=>({id:P.label,title:P.label,color:P.color,optionId:P.optionId}));return q.push({id:"__none__",title:"Sans classification",color:"#9ca3af",optionId:"none"}),{classId:O,columns:q}}return{classId:null,columns:[{id:"__all__",title:"Tous les enregistrements",color:"#4361ee",optionId:null}]}},[x,m]),U=r.useMemo(()=>{const j={};if(V.columns.forEach(O=>j[O.id]=[]),!V.classId)j.__all__=x;else{const O={};V.columns.forEach(W=>{W.optionId&&W.optionId!=="none"&&(O[String(W.optionId)]=W.id)});const Z={};V.columns.forEach(W=>{Z[W.title]=W.id}),x.forEach(W=>{var K;const P=(W.classificationValues||[]).find(ie=>{var i;return(((i=ie.classificationId)==null?void 0:i.$oid)||ie.classificationId||ie.classification_id)===V.classId});if(P){const ie=String(((K=P.optionId)==null?void 0:K.$oid)||P.optionId||""),b=O[ie];if(b&&j[b])j[b].push(W);else{const i=P.optionLabel||P.label||"Sans label";j[i]?j[i].push(W):j.__none__&&j.__none__.push(W)}}else j.__none__&&j.__none__.push(W)})}for(const O of Object.keys(j)){const Z=p[O]||[];Z.length&&j[O].sort((W,q)=>{var ie,b;const P=Z.indexOf(String(((ie=W._id)==null?void 0:ie.$oid)||W._id)),K=Z.indexOf(String(((b=q._id)==null?void 0:b.$oid)||q._id));return P===-1&&K===-1?0:P===-1?1:K===-1?-1:P-K})}return j},[V,x,p]),B=r.useMemo(()=>{const j={};for(const O of V.columns)j[O.id]=(U[O.id]||[]).map(Z=>{var W;return String(((W=Z._id)==null?void 0:W.$oid)||Z._id)});return j},[V.columns,U]),M=r.useCallback(j=>{var Z;const O=String(j);for(const W of Object.keys(B))if((Z=B[W])!=null&&Z.includes(O))return W;return null},[B]),T=r.useMemo(()=>g&&x.find(j=>{var O;return String(((O=j._id)==null?void 0:O.$oid)||j._id)===String(g)})||null,[g,x]),I=r.useCallback(j=>{l&&(v.current&&clearTimeout(v.current),v.current=setTimeout(async()=>{try{await fetch(`/account/${o}/api/user/view-preferences`,{method:"POST",headers:{"Content-Type":"application/json"},credentials:"include",body:JSON.stringify({viewId:l,preferences:{kanban:{orderByColumn:j}}})})}catch{}},250))},[o,l]),oe=r.useCallback(async(j,O)=>{if(!V.classId)return;const Z=V.columns.find(W=>W.id===O);if(Z)try{await fetch(`/account/${o}/api/record/update-classification`,{method:"POST",headers:{"Content-Type":"application/json"},credentials:"include",body:JSON.stringify({recordId:j,classificationId:V.classId,optionId:Z.optionId==="none"?null:Z.optionId})})}catch(W){console.error("[RecordsKanban] Update error:",W)}},[o,V]),ne=j=>{w(String(j.active.id))},ue=()=>{w(null)},fe=j=>{const{active:O,over:Z}=j;if(w(null),!Z)return;const W=String(O.id),q=String(Z.id),P=M(W),K=V.columns.some(C=>String(C.id)===q)?q:M(q);if(!P||!K)return;if(P===K){const C=B[P]||[],se=C.indexOf(W),F=C.indexOf(q);if(se===-1||F===-1||se===F)return;const le=wt(C,se,F),xe={...p,[P]:le};u(xe),I(xe);return}const ie=[...B[P]||[]].filter(C=>C!==W),b=[...B[K]||[]],S=V.columns.some(C=>String(C.id)===q)?b.length:Math.max(0,b.indexOf(q));b.splice(S,0,W);const D={...p,[P]:ie,[K]:b};if(u(D),I(D),V.classId){const C=V.columns.find(se=>se.id===K);c(se=>se.map(F=>{var xe;if(String(((xe=F._id)==null?void 0:xe.$oid)||F._id)!==W)return F;const le=(F.classificationValues||[]).filter(f=>{var Q;return(((Q=f.classificationId)==null?void 0:Q.$oid)||f.classificationId||f.classification_id)!==V.classId});return K!=="__none__"&&C&&le.push({classificationId:V.classId,optionId:C.optionId,optionLabel:C.title,optionColor:C.color}),{...F,classificationValues:le}})),oe(W,K)}};return e.jsxs("div",{ref:a,className:"h-full overflow-x-auto overflow-y-auto",style:{cursor:"grab",userSelect:"none",WebkitUserSelect:"none"},onMouseDown:X,onMouseMove:h,onMouseUp:k,onMouseLeave:k,children:[e.jsxs(vt,{sensors:te,collisionDetection:yt,autoScroll:{threshold:{x:.15,y:.15},interval:10,acceleration:5},onDragStart:ne,onDragEnd:fe,onDragCancel:ue,children:[e.jsx("div",{style:{display:"flex",flexWrap:"nowrap",alignItems:"flex-start",gap:"1.25rem",padding:"0.5rem",width:"max-content",minHeight:"100%"},children:V.columns.map(j=>{const O=U[j.id]||[];return j.id==="__none__"&&O.length===0?null:e.jsx(Jt,{column:j,records:O,recordIds:B[j.id]||[],accountNumber:o,entitySlug:n,onQuickView:G,cardTemplate:_,entityData:m},j.id)})}),e.jsx(kt,{children:T?e.jsx(ot,{record:T,accountNumber:o,entitySlug:n,isDragging:!0,cardTemplate:_,entityData:m}):null})]}),R&&e.jsx(Ft,{record:R,columns:s,accountNumber:o,entitySlug:n,onClose:()=>z(null)})]})}const Xe=[{bg:"bg-primary-light shadow-primary",text:"text-primary",dot:"#4361ee"},{bg:"bg-info-light shadow-info",text:"text-info",dot:"#2196f3"},{bg:"bg-warning-light shadow-warning",text:"text-warning",dot:"#e2a03f"},{bg:"bg-danger-light shadow-danger",text:"text-danger",dot:"#e7515a"},{bg:"bg-success-light shadow-success",text:"text-success",dot:"#00ab55"},{bg:"bg-secondary-light shadow-secondary",text:"text-secondary",dot:"#805dca"}];function Yt(t){return Xe[t%Xe.length]}function Zt(){return e.jsxs("svg",{width:"24",height:"24",viewBox:"0 0 24 24",fill:"none",className:"h-5 w-5 rotate-90 opacity-70 hover:opacity-100",children:[e.jsx("circle",{cx:"5",cy:"12",r:"2",stroke:"currentColor",strokeWidth:"1.5"}),e.jsx("circle",{opacity:"0.5",cx:"12",cy:"12",r:"2",stroke:"currentColor",strokeWidth:"1.5"}),e.jsx("circle",{cx:"19",cy:"12",r:"2",stroke:"currentColor",strokeWidth:"1.5"})]})}function Kt(){return e.jsxs("svg",{width:"24",height:"24",viewBox:"0 0 24 24",fill:"none",className:"h-4 w-4 ltr:mr-3 rtl:ml-3",children:[e.jsx("path",{d:"M15.2869 3.15178L14.3601 4.07866L5.83882 12.5999C5.26166 13.1771 4.97308 13.4656 4.7249 13.7838C4.43213 14.1592 4.18114 14.5653 3.97634 14.995C3.80273 15.3593 3.67368 15.7465 3.41556 16.5208L2.32181 19.8021L2.05445 20.6042C1.92743 20.9852 2.0266 21.4053 2.31063 21.6894C2.59466 21.9734 3.01478 22.0726 3.39584 21.9456L4.19792 21.6782L7.47918 20.5844C8.25353 20.3263 8.6407 20.1973 9.00498 20.0237C9.43469 19.8189 9.84082 19.5679 10.2162 19.2751C10.5344 19.0269 10.8229 18.7383 11.4001 18.1612L19.9213 9.63993L20.8482 8.71306C22.3839 7.17735 22.3839 4.68748 20.8482 3.15178C19.3125 1.61607 16.8226 1.61607 15.2869 3.15178Z",stroke:"currentColor",strokeWidth:"1.5"}),e.jsx("path",{opacity:"0.5",d:"M14.36 4.07812C14.36 4.07812 14.4759 6.04774 16.2138 7.78564C17.9517 9.52354 19.9213 9.6394 19.9213 9.6394M4.19789 21.6777L2.32178 19.8015",stroke:"currentColor",strokeWidth:"1.5"})]})}function Xt(){return e.jsxs("svg",{width:"24",height:"24",viewBox:"0 0 24 24",fill:"none",className:"h-4.5 w-4.5 ltr:mr-3 rtl:ml-3",children:[e.jsx("path",{opacity:"0.5",d:"M3.27489 15.2957C2.42496 14.1915 2 13.6394 2 12C2 10.3606 2.42496 9.80853 3.27489 8.70433C4.97196 6.49956 7.81811 4 12 4C16.1819 4 19.028 6.49956 20.7251 8.70433C21.575 9.80853 22 10.3606 22 12C22 13.6394 21.575 14.1915 20.7251 15.2957C19.028 17.5004 16.1819 20 12 20C7.81811 20 4.97196 17.5004 3.27489 15.2957Z",stroke:"currentColor",strokeWidth:"1.5"}),e.jsx("path",{d:"M15 12C15 13.6569 13.6569 15 12 15C10.3431 15 9 13.6569 9 12C9 10.3431 10.3431 9 12 9C13.6569 9 15 10.3431 15 12Z",stroke:"currentColor",strokeWidth:"1.5"})]})}function Gt({filled:t}){return e.jsx("svg",{width:"24",height:"24",viewBox:"0 0 24 24",fill:"none",className:`h-4.5 w-4.5 group-hover:fill-warning ${t?"fill-warning":""}`,children:e.jsx("path",{d:"M9.15316 5.40838C10.4198 3.13613 11.0531 2 12 2C12.9469 2 13.5802 3.13612 14.8468 5.40837L15.1745 5.99623C15.5345 6.64193 15.7144 6.96479 15.9951 7.17781C16.2757 7.39083 16.6251 7.4699 17.3241 7.62805L17.9605 7.77203C20.4201 8.32856 21.65 8.60682 21.9426 9.54773C22.2352 10.4886 21.3968 11.4691 19.7199 13.4299L19.2861 13.9372C18.8096 14.4944 18.5713 14.773 18.4641 15.1177C18.357 15.4624 18.393 15.8341 18.465 16.5776L18.5306 17.2544C18.7841 19.8706 18.9109 21.1787 18.1449 21.7602C17.3788 22.3417 16.2273 21.8115 13.9243 20.7512L13.3285 20.4768C12.6741 20.1755 12.3469 20.0248 12 20.0248C11.6531 20.0248 11.3259 20.1755 10.6715 20.4768L10.0757 20.7512C7.77268 21.8115 6.62118 22.3417 5.85515 21.7602C5.08912 21.1787 5.21588 19.8706 5.4694 17.2544L5.53498 16.5776C5.60703 15.8341 5.64305 15.4624 5.53586 15.1177C5.42868 14.773 5.19043 14.4944 4.71392 13.9372L4.2801 13.4299C2.60325 11.4691 1.76482 10.4886 2.05742 9.54773C2.35002 8.60682 3.57986 8.32856 6.03954 7.77203L6.67589 7.62805C7.37485 7.4699 7.72433 7.39083 8.00494 7.17781C8.28555 6.96479 8.46553 6.64194 8.82547 5.99623L9.15316 5.40838Z",stroke:"currentColor",strokeWidth:"1.5"})})}function Qt(){return e.jsx("svg",{width:"24",height:"24",viewBox:"0 0 24 24",fill:"none",className:"h-3 w-3 rotate-45",children:e.jsx("path",{d:"M2 12C2 7.28595 2 4.92893 3.46447 3.46447C4.92893 2 7.28595 2 12 2C16.714 2 19.0711 2 20.5355 3.46447C22 4.92893 22 7.28595 22 12C22 16.714 22 19.0711 20.5355 20.5355C19.0711 22 16.714 22 12 22C7.28595 22 4.92893 22 3.46447 20.5355C2 19.0711 2 16.714 2 12Z",stroke:"currentColor",strokeWidth:"1.5"})})}function er({record:t,accountNumber:s,entitySlug:o}){var v;const[n,l]=r.useState(!1),m=r.useRef(null);r.useEffect(()=>{if(!n)return;const x=c=>{m.current&&!m.current.contains(c.target)&&l(!1)};return document.addEventListener("mousedown",x),()=>document.removeEventListener("mousedown",x)},[n]);const a=((v=t._id)==null?void 0:v.$oid)||t._id;return e.jsxs("div",{ref:m,className:"dropdown relative",children:[e.jsx("button",{type:"button",className:"text-primary",onClick:x=>{x.preventDefault(),x.stopPropagation(),l(!n)},children:e.jsx(Zt,{})}),n&&e.jsxs("ul",{className:"absolute z-50 min-w-[140px] rounded-md bg-white dark:bg-[#1b2e4b] shadow-lg border dark:border-gray-700 py-1 text-sm font-medium ltr:right-0 rtl:left-0 top-full mt-1",style:{animation:"fadeIn 0.15s ease-out"},children:[e.jsx("li",{children:e.jsxs("a",{href:`/account/${s}/record/${o}/${a}/edit`,className:"flex items-center px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 w-full",onClick:x=>x.stopPropagation(),children:[e.jsx(Kt,{})," Edit"]})}),e.jsx("li",{children:e.jsxs("a",{href:`/account/${s}/record/${o}/${a}`,className:"flex items-center px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 w-full",onClick:x=>x.stopPropagation(),children:[e.jsx(Xt,{})," View"]})})]})]})}function tr({record:t,accountNumber:s,entitySlug:o,style:n,favorites:l,onToggleFav:m}){var g,w;const a=l[t._id]||!1,v=((g=t._id)==null?void 0:g.$oid)||t._id,x=t.referenceTitle||t.title||t.computedTitle||"Sans titre",c=t.createdAt?new Date(t.createdAt).toLocaleDateString("fr-FR",{day:"2-digit",month:"short",year:"numeric"}):"",p=(t.customFields||[]).find(R=>{var z,G,_,y,Y,J;return((G=(z=R.field_id)==null?void 0:z.label)==null?void 0:G.toLowerCase().includes("descri"))||((y=(_=R.field_id)==null?void 0:_.label)==null?void 0:y.toLowerCase().includes("note"))||((J=(Y=R.field_id)==null?void 0:Y.label)==null?void 0:J.toLowerCase().includes("contenu"))}),u=(p==null?void 0:p.value)||t.description||"";return(t.classificationValues||[]).filter(R=>R.optionLabel).map(R=>({label:R.optionLabel,color:R.optionColor||R.color||n.dot})),e.jsxs("div",{className:`panel pb-12 relative ${n.bg}`,children:[e.jsxs("div",{className:"min-h-[142px]",children:[e.jsxs("div",{className:"flex justify-between",children:[e.jsxs("div",{className:"flex w-max items-center",children:[e.jsx("div",{className:"flex-none",children:e.jsx("div",{className:"rounded-full bg-gray-300 p-2 dark:bg-gray-700",children:e.jsxs("svg",{width:"24",height:"24",viewBox:"0 0 24 24",fill:"none",className:"h-4.5 w-4.5",children:[e.jsx("circle",{cx:"12",cy:"6",r:"4",stroke:"currentColor",strokeWidth:"1.5"}),e.jsx("ellipse",{opacity:"0.5",cx:"12",cy:"17",rx:"7",ry:"4",stroke:"currentColor",strokeWidth:"1.5"})]})})}),e.jsxs("div",{className:"ltr:ml-2 rtl:mr-2",children:[e.jsx("div",{className:"font-semibold",children:((w=t.createdBy)==null?void 0:w.name)||"Utilisateur"}),e.jsx("div",{className:"text-sx text-white-dark",children:c})]})]}),e.jsx(er,{record:t,accountNumber:s,entitySlug:o})]}),e.jsxs("div",{children:[e.jsx("h4",{className:"mt-4 font-semibold",children:e.jsx("a",{href:`/account/${s}/record/${o}/${v}`,className:"hover:text-primary transition-colors",children:x})}),u&&e.jsx("p",{className:"mt-2 text-white-dark line-clamp-3",children:u})]})]}),e.jsx("div",{className:"absolute bottom-5 left-0 w-full px-5",children:e.jsxs("div",{className:"mt-2 flex items-center justify-between",children:[e.jsx("div",{className:n.text,children:e.jsx(Qt,{})}),e.jsx("div",{className:"flex items-center gap-2",children:e.jsx("button",{type:"button",className:"group text-warning ltr:ml-2 rtl:mr-2",onClick:R=>{R.preventDefault(),R.stopPropagation(),m(t._id)},children:e.jsx(Gt,{filled:a})})})]})})]})}function rr({records:t,accountNumber:s,entitySlug:o}){const[n,l]=r.useState({}),m=r.useCallback(a=>{l(v=>({...v,[a]:!v[a]}))},[]);return e.jsx("div",{className:"h-full overflow-y-auto",children:e.jsx("div",{className:"grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",children:t.length===0?e.jsx("div",{className:"col-span-full text-center py-20 text-gray-400 dark:text-gray-600 italic",children:"Aucun enregistrement"}):t.map((a,v)=>{var x;return e.jsx(tr,{record:a,accountNumber:s,entitySlug:o,style:Yt(v),favorites:n,onToggleFav:m},((x=a._id)==null?void 0:x.$oid)||a._id)})})})}const Be={Planifié:{className:"primary",bg:"#4361ee",text:"#fff"},Confirmé:{className:"info",bg:"#2196f3",text:"#fff"},Terminé:{className:"success",bg:"#00ab55",text:"#fff"},Annulé:{className:"danger",bg:"#e7515a",text:"#fff"},"Non présenté":{className:"warning",bg:"#e2a03f",text:"#fff"}},$e=[{className:"primary",bg:"#4361ee",text:"#fff"},{className:"info",bg:"#2196f3",text:"#fff"},{className:"success",bg:"#00ab55",text:"#fff"},{className:"danger",bg:"#e7515a",text:"#fff"},{className:"warning",bg:"#e2a03f",text:"#fff"}];function sr(t,s){if(s){const o=(t.customFields||[]).find(n=>{var m,a,v;return(((a=(m=n.field_id)==null?void 0:m._id)==null?void 0:a.toString())||((v=n.field_id)==null?void 0:v.toString()))===s});if(o!=null&&o.value){const n=new Date(o.value);if(!isNaN(n))return n}}if(t.date){const o=new Date(t.date);if(!isNaN(o))return o}if(t.createdAt){const o=new Date(t.createdAt);if(!isNaN(o))return o}return null}function nr(t,s){if(!s)return 30;const o=(t.customFields||[]).find(n=>{var m,a,v;return(((a=(m=n.field_id)==null?void 0:m._id)==null?void 0:a.toString())||((v=n.field_id)==null?void 0:v.toString()))===s});return parseInt(o==null?void 0:o.value)||30}function or(t){const s=t.classificationValues||[];for(const o of s)if(o.label||o.optionLabel)return o.label||o.optionLabel;return null}function ir(t){const s=["Dimanche","Lundi","Mardi","Mercredi","Jeudi","Vendredi","Samedi"],o=["janvier","février","mars","avril","mai","juin","juillet","août","septembre","octobre","novembre","décembre"];return`${s[t.getDay()]} ${t.getDate()} ${o[t.getMonth()]} ${t.getFullYear()}`}function ar(t){const s=t.getFullYear(),o=String(t.getMonth()+1).padStart(2,"0"),n=String(t.getDate()).padStart(2,"0"),l=String(t.getHours()).padStart(2,"0"),m=String(t.getMinutes()).padStart(2,"0");return`${s}-${o}-${n}T${l}:${m}`}function lr({message:t,type:s="success",onClose:o}){r.useEffect(()=>{const m=setTimeout(o,3e3);return()=>clearTimeout(m)},[o]);const n={success:{bg:"#00ab55",icon:"✓"},error:{bg:"#e7515a",icon:"✕"},info:{bg:"#4361ee",icon:"ℹ"}},l=n[s]||n.info;return e.jsxs("div",{style:{position:"fixed",bottom:24,right:24,zIndex:1e4,display:"flex",alignItems:"center",gap:10,padding:"12px 20px",borderRadius:12,backgroundColor:l.bg,color:"#fff",boxShadow:"0 8px 32px rgba(0,0,0,0.18)",animation:"slideInRight 0.3s ease",fontSize:13,fontWeight:600},children:[e.jsx("span",{style:{fontSize:16},children:l.icon}),t]})}function dr({isOpen:t,onClose:s,onSave:o,initialDate:n,entityData:l,accountNumber:m}){const[a,v]=r.useState(""),[x,c]=r.useState(""),[p,u]=r.useState("30"),[g,w]=r.useState(!1),R=r.useRef(null);if(r.useEffect(()=>{t&&n&&(c(ar(n)),v(""),u("30"),setTimeout(()=>{var _;return(_=R.current)==null?void 0:_.focus()},100))},[t,n]),!t)return null;const z=async _=>{if(_.preventDefault(),!!a.trim()){w(!0);try{await o({title:a.trim(),date:x,duration:parseInt(p)}),s()}catch(y){console.error(y)}w(!1)}},G=[15,30,45,60,90,120];return e.jsx("div",{style:{position:"fixed",inset:0,zIndex:9999,backgroundColor:"rgba(0,0,0,0.4)",backdropFilter:"blur(4px)",display:"flex",alignItems:"center",justifyContent:"center",animation:"fadeIn 0.2s ease"},onClick:_=>{_.target===_.currentTarget&&s()},children:e.jsxs("div",{style:{backgroundColor:"#fff",borderRadius:16,width:"100%",maxWidth:440,boxShadow:"0 24px 80px rgba(0,0,0,0.2)",animation:"slideUp 0.3s ease",overflow:"hidden"},children:[e.jsxs("div",{style:{padding:"20px 24px 16px",display:"flex",alignItems:"center",justifyContent:"space-between",borderBottom:"1px solid #f0f0f0"},children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:10},children:[e.jsx("div",{style:{width:36,height:36,borderRadius:10,background:"linear-gradient(135deg, #4361ee, #805cf6)",display:"flex",alignItems:"center",justifyContent:"center"},children:e.jsx("svg",{viewBox:"0 0 24 24",fill:"none",style:{width:18,height:18,color:"#fff"},children:e.jsx("path",{d:"M12 5V19M5 12H19",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round"})})}),e.jsxs("div",{children:[e.jsx("h3",{style:{margin:0,fontSize:16,fontWeight:700,color:"#1a1a2e"},children:"Nouveau rendez-vous"}),e.jsx("p",{style:{margin:0,fontSize:11,color:"#888",marginTop:2},children:n?ir(n):""})]})]}),e.jsx("button",{onClick:s,style:{border:"none",background:"#f5f5f5",borderRadius:8,width:32,height:32,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer"},children:e.jsx("svg",{viewBox:"0 0 24 24",fill:"none",style:{width:16,height:16,color:"#666"},children:e.jsx("path",{d:"M18 6L6 18M6 6L18 18",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round"})})})]}),e.jsxs("form",{onSubmit:z,style:{padding:"20px 24px 24px"},children:[e.jsxs("div",{style:{marginBottom:16},children:[e.jsx("label",{style:{display:"block",fontSize:12,fontWeight:600,color:"#555",marginBottom:6},children:"Titre *"}),e.jsx("input",{ref:R,type:"text",value:a,onChange:_=>v(_.target.value),placeholder:"Ex: Consultation Dr. Martin",required:!0,style:{width:"100%",padding:"10px 14px",border:"1.5px solid #e0e0e0",borderRadius:10,fontSize:14,outline:"none",transition:"border 0.2s",boxSizing:"border-box"},onFocus:_=>_.target.style.borderColor="#4361ee",onBlur:_=>_.target.style.borderColor="#e0e0e0"})]}),e.jsxs("div",{style:{marginBottom:16},children:[e.jsx("label",{style:{display:"block",fontSize:12,fontWeight:600,color:"#555",marginBottom:6},children:"Date et heure"}),e.jsx("input",{type:"datetime-local",value:x,onChange:_=>c(_.target.value),style:{width:"100%",padding:"10px 14px",border:"1.5px solid #e0e0e0",borderRadius:10,fontSize:14,outline:"none",transition:"border 0.2s",boxSizing:"border-box"},onFocus:_=>_.target.style.borderColor="#4361ee",onBlur:_=>_.target.style.borderColor="#e0e0e0"})]}),e.jsxs("div",{style:{marginBottom:20},children:[e.jsx("label",{style:{display:"block",fontSize:12,fontWeight:600,color:"#555",marginBottom:8},children:"Durée"}),e.jsx("div",{style:{display:"flex",flexWrap:"wrap",gap:6},children:G.map(_=>e.jsx("button",{type:"button",onClick:()=>u(String(_)),style:{padding:"6px 14px",borderRadius:20,fontSize:12,fontWeight:600,border:p===String(_)?"1.5px solid #4361ee":"1.5px solid #e0e0e0",backgroundColor:p===String(_)?"#4361ee":"#fff",color:p===String(_)?"#fff":"#555",cursor:"pointer",transition:"all 0.2s"},children:_<60?`${_} min`:`${_/60}h`},_))})]}),e.jsxs("div",{style:{display:"flex",gap:10,justifyContent:"flex-end"},children:[e.jsx("button",{type:"button",onClick:s,style:{padding:"10px 20px",borderRadius:10,fontSize:13,fontWeight:600,border:"1.5px solid #e0e0e0",backgroundColor:"#fff",color:"#555",cursor:"pointer",transition:"all 0.2s"},children:"Annuler"}),e.jsx("button",{type:"submit",disabled:g||!a.trim(),style:{padding:"10px 24px",borderRadius:10,fontSize:13,fontWeight:600,border:"none",background:a.trim()?"linear-gradient(135deg, #4361ee, #805cf6)":"#ccc",color:"#fff",cursor:a.trim()?"pointer":"not-allowed",transition:"all 0.2s",opacity:g?.7:1},children:g?"Création...":"Créer le RDV"})]})]})]})})}function cr({event:t,position:s,onClose:o,onEdit:n,onDelete:l,accountNumber:m,entitySlug:a,cardTemplate:v}){var z,G;const x=r.useRef(null);if(r.useEffect(()=>{const _=y=>{x.current&&!x.current.contains(y.target)&&o()};return document.addEventListener("mousedown",_),()=>document.removeEventListener("mousedown",_)},[o]),!t)return null;const c=t.start?new Date(t.start):null,p=t.end?new Date(t.end):null,u=(z=t.extendedProps)==null?void 0:z.status,g=u?Be[u]:null,R={_id:((G=t.extendedProps)==null?void 0:G.recordId)||t.id,referenceTitle:t.title,_start:c,_end:p,classificationValues:u?[{optionLabel:u,optionColor:g?g.bg:"#4361ee"}]:[],createdAt:c,...t.extendedProps};return e.jsx("div",{ref:x,style:{position:"fixed",top:Math.min(s.y,window.innerHeight-280),left:Math.min(s.x,window.innerWidth-340),zIndex:9998,width:320,backgroundColor:"#fff",borderRadius:14,boxShadow:"0 16px 64px rgba(0,0,0,0.18)",animation:"slideUp 0.2s ease",overflow:"hidden"},children:e.jsx(nt,{record:R,cardTemplate:v,context:"calendar",accountNumber:m,entitySlug:a,callbacks:{onClose:o},style:{borderRadius:0}})})}function ur({records:t=[],columns:s=[],accountNumber:o,entitySlug:n,entityData:l}){var q,P,K,ie;const m=r.useRef(null),a=r.useRef(null),[v,x]=r.useState(!1),[c,p]=r.useState(!1),[u,g]=r.useState(null),[w,R]=r.useState(null),[z,G]=r.useState({x:0,y:0}),[_,y]=r.useState(null),[Y,J]=r.useState(t),[H,X]=r.useState(!1),[h,k]=r.useState({weekStartsOn:1,startHour:"07:00",endHour:"20:00",hideWeekend:!1,slotDuration:"00:15:00",slotLabelInterval:"01:00",compactMode:!1});r.useEffect(()=>{var i;if(!(l!=null&&l._id))return;const b=((i=l._id)==null?void 0:i.$oid)||l._id;fetch(`/account/${o}/api/user/view-preferences?viewId=calendar_${b}`,{credentials:"include"}).then(S=>S.json()).then(S=>{var D;S.success&&((D=S.preferences)!=null&&D.calendarSettings)&&k(C=>({...C,...S.preferences.calendarSettings}))}).catch(()=>{})},[l==null?void 0:l._id,o]);const te=r.useCallback(async b=>{var S;k(b),X(!1);const i=((S=l==null?void 0:l._id)==null?void 0:S.$oid)||(l==null?void 0:l._id);if(i)try{await fetch(`/account/${o}/api/user/view-preferences`,{method:"POST",headers:{"Content-Type":"application/json"},credentials:"include",body:JSON.stringify({viewId:`calendar_${i}`,preferences:{calendarSettings:b}})}),y({message:"Paramètres sauvegardés",type:"success"})}catch{y({message:"Erreur sauvegarde paramètres",type:"error"})}},[o,l]);r.useEffect(()=>{J(t)},[t]);const[V,U]=r.useState(null);r.useEffect(()=>{var i;if(!(l!=null&&l._id))return;const b=((i=l._id)==null?void 0:i.$oid)||l._id;fetch(`/account/${o}/api/entity/${b}/cards/default/calendar`,{credentials:"include"}).then(S=>S.json()).then(S=>{S.success&&S.card&&U(S.card)}).catch(()=>{})},[l==null?void 0:l._id,o]);const{dateFieldId:B,durationFieldId:M}=r.useMemo(()=>{var F,le,xe,f,E;if(!l)return{dateFieldId:null,durationFieldId:null};const b=l.customFields||[],i=b.filter(Q=>Q.type==="date"||Q.inputType==="date"||Q.inputType==="datetime-local"),S=i.find(Q=>/^date/i.test(Q.name||"")||/date/i.test(Q.label||"")),D=((F=S==null?void 0:S._id)==null?void 0:F.toString())||((xe=(le=i[0])==null?void 0:le._id)==null?void 0:xe.toString())||null,se=((E=(f=b.filter(Q=>Q.type==="number"&&(/dur/i.test(Q.name||"")||/dur/i.test(Q.label||"")))[0])==null?void 0:f._id)==null?void 0:E.toString())||null;return{dateFieldId:D,durationFieldId:se}},[l]),T=(q=l==null?void 0:l._id)==null?void 0:q.toString(),I=(K=(P=l==null?void 0:l.statusClassification)==null?void 0:P._id)==null?void 0:K.toString(),oe=((ie=l==null?void 0:l.statusClassification)==null?void 0:ie.options)||[],ne=oe.find(b=>/planif/i.test(b.label))||oe[0],ue=r.useMemo(()=>Y.map((b,i)=>{const S=sr(b,B);if(!S)return null;const D=nr(b,M),C=new Date(S.getTime()+D*6e4),se=b.referenceTitle||b.computedTitle||b.title||"Sans titre",F=or(b),le=F&&Be[F]||$e[i%$e.length];return{id:b._id,title:se,start:S.toISOString(),end:C.toISOString(),className:le.className,extendedProps:{recordId:b._id,status:F,entitySlug:n,accountNumber:o,dateFieldId:B,durationFieldId:M}}}).filter(Boolean),[Y,B,M,n,o]),fe=r.useCallback(b=>{b.jsEvent.preventDefault(),b.jsEvent.stopPropagation();const i=b.el.getBoundingClientRect();G({x:i.right+8,y:i.top}),R(b.event)},[]),j=r.useCallback(b=>{R(null);const i=b.start;g(i),p(!0),a.current&&a.current.unselect()},[]),O=r.useCallback(async b=>{var F,le,xe;const i=((F=b.event.extendedProps)==null?void 0:F.recordId)||b.event.id,S=b.event.start.toISOString(),D=(le=b.event.end)==null?void 0:le.toISOString(),C=(xe=b.event.extendedProps)==null?void 0:xe.dateFieldId;let se;b.event.start&&b.event.end&&(se=Math.round((b.event.end-b.event.start)/6e4));try{if(!(await fetch(`/account/${o}/api/records/${i}/date`,{method:"PATCH",headers:{"Content-Type":"application/json"},credentials:"include",body:JSON.stringify({dateFieldId:C,newStart:S,newEnd:D,duration:se})})).ok)throw new Error("Failed");y({message:"RDV déplacé avec succès",type:"success"})}catch{b.revert(),y({message:"Erreur lors du déplacement",type:"error"})}},[o]),Z=r.useCallback(async b=>{var se,F;const i=((se=b.event.extendedProps)==null?void 0:se.recordId)||b.event.id,S=b.event.start.toISOString(),D=(F=b.event.extendedProps)==null?void 0:F.dateFieldId;let C;b.event.start&&b.event.end&&(C=Math.round((b.event.end-b.event.start)/6e4));try{if(!(await fetch(`/account/${o}/api/records/${i}/date`,{method:"PATCH",headers:{"Content-Type":"application/json"},credentials:"include",body:JSON.stringify({dateFieldId:D,newStart:S,duration:C})})).ok)throw new Error("Failed");y({message:`Durée modifiée (${C} min)`,type:"success"})}catch{b.revert(),y({message:"Erreur lors du redimensionnement",type:"error"})}},[o]),W=r.useCallback(async({title:b,date:i,duration:S})=>{var se;if(!T||!B)return;const D=await fetch(`/account/${o}/api/entity/${T}/records/quick-add`,{method:"POST",headers:{"Content-Type":"application/json"},credentials:"include",body:JSON.stringify({title:b,dateFieldId:B,dateValue:new Date(i).toISOString(),duration:S,durationFieldId:M,statusOptionId:(se=ne==null?void 0:ne._id)==null?void 0:se.toString(),statusClassificationId:I})});if(!D.ok)throw new Error("Failed to create");const C=await D.json();C.record&&J(F=>[...F,C.record]),y({message:`"${b}" créé avec succès !`,type:"success"})},[o,T,B,M,ne,I]);return r.useEffect(()=>{if(typeof FullCalendar<"u"){x(!0);return}const b=setInterval(()=>{typeof FullCalendar<"u"&&(x(!0),clearInterval(b))},200);if(!document.querySelector('script[src*="fullcalendar"]')){const i=document.createElement("link");i.rel="stylesheet",i.href="/assets/css/fullcalendar.min.css",document.head.appendChild(i);const S=document.createElement("script");S.src="/assets/js/fullcalendar.min.js",S.onload=()=>x(!0),document.head.appendChild(S)}return()=>clearInterval(b)},[]),r.useEffect(()=>{if(!v||!m.current||typeof FullCalendar>"u")return;a.current&&a.current.destroy();const b=h.hideWeekend?[0,6]:[],i=new FullCalendar.Calendar(m.current,{initialView:"timeGridWeek",headerToolbar:{left:"prev,next today",center:"title",right:"dayGridMonth,timeGridWeek,timeGridDay"},locale:"fr",buttonText:{today:"Aujourd'hui",month:"Mois",week:"Semaine",day:"Jour"},editable:!0,selectable:!0,selectMirror:!0,dayMaxEvents:3,height:"auto",firstDay:h.weekStartsOn,hiddenDays:b,slotDuration:h.slotDuration,snapDuration:h.slotDuration,slotLabelInterval:h.slotLabelInterval,slotLabelFormat:{hour:"2-digit",minute:"2-digit",hour12:!1},slotMinTime:h.startHour+":00",slotMaxTime:h.endHour+":00",businessHours:{daysOfWeek:h.hideWeekend?[1,2,3,4,5]:[0,1,2,3,4,5,6],startTime:h.startHour,endTime:h.endHour},scrollTime:h.startHour+":00",nowIndicator:!0,events:ue,eventClick:fe,select:j,eventDrop:O,eventResize:Z,eventContent:S=>{const D=S.event.start,C=S.event.end,se=D?`${String(D.getHours()).padStart(2,"0")}:${String(D.getMinutes()).padStart(2,"0")}`:"",F=C?`${String(C.getHours()).padStart(2,"0")}:${String(C.getMinutes()).padStart(2,"0")}`:"";return{html:`<div style="line-height:1.2;padding:2px 4px;overflow:hidden;"><div style="font-weight:700;font-size:11px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin:0;">${S.event.title}</div><div style="font-size:10px;opacity:0.85;margin:0;font-weight:500;">De ${se} à ${F}</div></div>`}},eventDidMount:S=>{var C;S.el.style.cursor="pointer",S.el.style.borderRadius="6px",S.el.style.border="none",S.el.style.overflow="hidden";const D=(C=S.event.extendedProps)==null?void 0:C.status;S.el.title=S.event.title+(D?` — ${D}`:"")},dayHeaderFormat:{weekday:"short",day:"numeric",month:"short"},allDaySlot:!1});return i.render(),a.current=i,()=>{a.current&&(a.current.destroy(),a.current=null)}},[v,ue,fe,j,O,Z,h]),v?!B&&t.length>0?e.jsxs("div",{style:{display:"flex",alignItems:"center",justifyContent:"center",padding:"48px 0",flexDirection:"column"},children:[e.jsxs("svg",{viewBox:"0 0 24 24",fill:"none",style:{width:48,height:48,marginBottom:12,color:"#ccc"},children:[e.jsx("rect",{x:"3",y:"4",width:"18",height:"18",rx:"2",stroke:"currentColor",strokeWidth:"1.5"}),e.jsx("path",{d:"M16 2V6M8 2V6M3 10H21",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"})]}),e.jsx("p",{style:{fontSize:14,fontWeight:500,color:"#888"},children:"Aucun champ date trouvé"}),e.jsx("p",{style:{fontSize:12,color:"#aaa",marginTop:4},children:"Ajoutez un champ date à cette entité"})]}):e.jsxs("div",{style:{position:"relative"},children:[e.jsx("style",{children:`
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes slideUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
                @keyframes slideInRight { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: translateX(0); } }
                .fc .fc-timegrid-slot { height: ${h.compactMode?"20px":"40px"} !important; }
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
            `}),e.jsxs("div",{style:{marginBottom:12,display:"flex",flexWrap:"wrap",gap:12,alignItems:"center",justifyContent:"space-between",padding:"8px 0"},children:[e.jsx("div",{style:{display:"flex",flexWrap:"wrap",gap:10},children:Object.entries(Be).map(([b,i])=>e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:5,fontSize:11,color:"#666"},children:[e.jsx("div",{style:{width:8,height:8,borderRadius:2,backgroundColor:i.bg}}),b]},b))}),e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:12},children:[e.jsx("span",{style:{fontSize:11,color:"#aaa",fontStyle:"italic"},children:"Cliquer pour ajouter • Glisser pour déplacer"}),e.jsxs("button",{onClick:()=>X(!0),style:{display:"flex",alignItems:"center",gap:6,padding:"6px 14px",border:"1px solid #e2e8f0",borderRadius:8,background:"#fff",cursor:"pointer",fontSize:12,fontWeight:600,color:"#475569",transition:"all 0.2s"},onMouseEnter:b=>{b.currentTarget.style.borderColor="#4361ee",b.currentTarget.style.color="#4361ee"},onMouseLeave:b=>{b.currentTarget.style.borderColor="#e2e8f0",b.currentTarget.style.color="#475569"},children:[e.jsx("iconify-icon",{icon:"solar:settings-linear",width:"15"}),"Config"]})]})]}),e.jsx("div",{className:"calendar-wrapper",ref:m}),H&&e.jsx(pr,{settings:h,onSave:te,onClose:()=>X(!1)}),e.jsx(dr,{isOpen:c,onClose:()=>p(!1),onSave:W,initialDate:u,entityData:l,accountNumber:o}),w&&e.jsx(cr,{event:w,position:z,onClose:()=>R(null),accountNumber:o,entitySlug:n,cardTemplate:V}),_&&e.jsx(lr,{message:_.message,type:_.type,onClose:()=>y(null)})]}):e.jsxs("div",{style:{display:"flex",alignItems:"center",justifyContent:"center",padding:"48px 0"},children:[e.jsx("div",{className:"animate-spin rounded-full h-8 w-8 border-b-2 border-primary"}),e.jsx("span",{style:{marginLeft:12,color:"#888"},children:"Chargement du calendrier..."})]})}function pr({settings:t,onSave:s,onClose:o}){const[n,l]=r.useState({...t}),m=[];for(let a=0;a<24;a++){const v=`${String(a).padStart(2,"0")}:00`;m.push(v)}return e.jsxs(e.Fragment,{children:[e.jsx("div",{className:"cal-settings-overlay",onClick:o}),e.jsxs("div",{className:"cal-settings-panel",children:[e.jsxs("div",{className:"header",children:[e.jsxs("h3",{children:[e.jsx("iconify-icon",{icon:"solar:settings-bold-duotone",width:"20",style:{verticalAlign:"middle",marginRight:8,color:"#4361ee"}}),"Paramètres du calendrier"]}),e.jsx("button",{onClick:o,style:{background:"none",border:"none",cursor:"pointer",padding:4,borderRadius:6,color:"#94a3b8"},children:e.jsx("iconify-icon",{icon:"solar:close-circle-linear",width:"22"})})]}),e.jsxs("div",{className:"body",children:[e.jsxs("div",{className:"cal-field",children:[e.jsx("label",{children:"Premier jour de la semaine"}),e.jsxs("select",{value:n.weekStartsOn,onChange:a=>l({...n,weekStartsOn:parseInt(a.target.value)}),children:[e.jsx("option",{value:1,children:"Lundi"}),e.jsx("option",{value:0,children:"Dimanche"}),e.jsx("option",{value:6,children:"Samedi"})]})]}),e.jsxs("div",{style:{display:"flex",gap:12},children:[e.jsxs("div",{className:"cal-field",style:{flex:1},children:[e.jsx("label",{children:"Heure de début"}),e.jsx("select",{value:n.startHour,onChange:a=>l({...n,startHour:a.target.value}),children:m.map(a=>e.jsx("option",{value:a,children:a},a))})]}),e.jsxs("div",{className:"cal-field",style:{flex:1},children:[e.jsx("label",{children:"Heure de fin"}),e.jsx("select",{value:n.endHour,onChange:a=>l({...n,endHour:a.target.value}),children:m.map(a=>e.jsx("option",{value:a,children:a},a))})]})]}),e.jsxs("div",{className:"cal-field",children:[e.jsx("label",{children:"Intervalle des créneaux"}),e.jsxs("select",{value:n.slotDuration,onChange:a=>l({...n,slotDuration:a.target.value}),children:[e.jsx("option",{value:"00:05:00",children:"5 minutes"}),e.jsx("option",{value:"00:10:00",children:"10 minutes"}),e.jsx("option",{value:"00:15:00",children:"15 minutes"}),e.jsx("option",{value:"00:30:00",children:"30 minutes"}),e.jsx("option",{value:"01:00:00",children:"1 heure"})]})]}),e.jsxs("div",{className:"cal-field",children:[e.jsx("label",{children:"Affichage des heures"}),e.jsxs("select",{value:n.slotLabelInterval,onChange:a=>l({...n,slotLabelInterval:a.target.value}),children:[e.jsx("option",{value:"00:30:00",children:"Toutes les 30 min"}),e.jsx("option",{value:"01:00:00",children:"Toutes les heures"}),e.jsx("option",{value:"02:00:00",children:"Toutes les 2 heures"})]})]}),e.jsx("div",{style:{height:1,background:"#f1f5f9",margin:"8px 0 20px"}}),e.jsxs("div",{className:"cal-toggle",children:[e.jsxs("div",{children:[e.jsx("div",{className:"cal-toggle-label",children:"Mode compact"}),e.jsx("div",{className:"cal-toggle-desc",children:"Réduit l'espacement des créneaux pour une vue d'ensemble"})]}),e.jsxs("label",{className:"cal-switch",children:[e.jsx("input",{type:"checkbox",checked:n.compactMode,onChange:a=>l({...n,compactMode:a.target.checked})}),e.jsx("span",{className:"slider"})]})]}),e.jsxs("div",{className:"cal-toggle",children:[e.jsxs("div",{children:[e.jsx("div",{className:"cal-toggle-label",children:"Masquer le weekend"}),e.jsx("div",{className:"cal-toggle-desc",children:"Afficher uniquement du lundi au vendredi"})]}),e.jsxs("label",{className:"cal-switch",children:[e.jsx("input",{type:"checkbox",checked:n.hideWeekend,onChange:a=>l({...n,hideWeekend:a.target.checked})}),e.jsx("span",{className:"slider"})]})]})]}),e.jsxs("div",{className:"footer",children:[e.jsx("button",{className:"cal-btn cal-btn-ghost",onClick:o,children:"Annuler"}),e.jsxs("button",{className:"cal-btn cal-btn-primary",onClick:()=>s(n),children:[e.jsx("iconify-icon",{icon:"solar:check-circle-bold",width:"16",style:{verticalAlign:"middle",marginRight:4}}),"Appliquer"]})]})]})]})}const it={contains:{label:"Contient",icon:"⊃",types:["text","email","phone","url","textarea","title","relation"]},not_contains:{label:"Ne contient pas",icon:"⊅",types:["text","email","phone","url","textarea","title","relation"]},equals:{label:"Est égal à",icon:"=",types:["text","email","phone","url","number","date","title","select","relation","classification"]},not_equals:{label:"N'est pas égal à",icon:"≠",types:["text","email","phone","url","number","date","title","select","relation","classification"]},starts_with:{label:"Commence par",icon:"A…",types:["text","email","phone","url","title"]},ends_with:{label:"Se termine par",icon:"…Z",types:["text","email","phone","url","title"]},gt:{label:"Supérieur à",icon:">",types:["number","date"]},gte:{label:"Supérieur ou égal",icon:"≥",types:["number","date"]},lt:{label:"Inférieur à",icon:"<",types:["number","date"]},lte:{label:"Inférieur ou égal",icon:"≤",types:["number","date"]},between:{label:"Entre",icon:"↔",types:["number","date"]},is_empty:{label:"Est vide",icon:"∅",types:["text","email","phone","url","number","date","textarea","title","select","relation","classification"]},is_not_empty:{label:"N'est pas vide",icon:"∃",types:["text","email","phone","url","number","date","textarea","title","select","relation","classification"]}};function De(t){const s=t||"text";return Object.entries(it).filter(([o,n])=>n.types.includes(s)).map(([o,n])=>({key:o,...n}))}function Ge(t){return["number","currency","percent"].includes(t)?"number":["date","datetime"].includes(t)?"date":"text"}function fr({columns:t=[],fieldFilters:s=[],onFieldFiltersChange:o,allRecords:n=[],sidebarFilters:l=[]}){const[m,a]=r.useState(s.length>0),[v,x]=r.useState(null),[c,p]=r.useState(!1),u=r.useRef(null);r.useEffect(()=>{const h=k=>{c&&u.current&&!u.current.contains(k.target)&&p(!1)};return c&&document.addEventListener("mousedown",h),()=>document.removeEventListener("mousedown",h)},[c]);const g=Re.useMemo(()=>{const h={};return l.forEach(k=>{h[`classif:${k.id}`]=k.options||[]}),h},[l]),w=t.filter(h=>h.id!=="actions"),R=r.useCallback(h=>{const k=w.find(M=>M.id===h);if(!k)return;const te=h.startsWith("classif:"),V=De(k.type),U=te?V.find(M=>M.key==="equals")||V[0]:V.find(M=>M.key==="contains")||V[0],B={fieldId:h,fieldName:k.name,fieldType:k.type||"text",operator:U.key,value:"",value2:"",logic:"AND"};o([...s,B]),p(!1),x(s.length)},[w,s,o]),z=r.useCallback((h,k)=>{const te=s.map((V,U)=>U===h?{...V,...k}:V);o(te)},[s,o]),G=r.useCallback(h=>{const k=s.filter((te,V)=>V!==h);o(k),v===h&&x(null)},[s,o,v]),_=r.useCallback(()=>{o([]),x(null)},[o]),y=h=>["is_empty","is_not_empty"].includes(h),Y=h=>h==="between",J=h=>h&&h.startsWith("classif:"),H=h=>g[h]||[],X=(h,k)=>{const V=H(h).find(U=>U.id===k||U.label===k);return V?V.label:k};return e.jsxs("div",{className:"adv-filters-container",children:[e.jsxs("button",{type:"button",className:"adv-filters-header",onClick:()=>a(!m),children:[e.jsxs("div",{className:"adv-filters-header-left",children:[e.jsx("svg",{viewBox:"0 0 24 24",fill:"none",className:"adv-filters-header-icon",children:e.jsx("path",{d:"M22 3H2L10 12.46V19L14 21V12.46L22 3Z",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round"})}),e.jsx("span",{children:"Filtres avancés"}),s.length>0&&e.jsx("span",{className:"adv-filters-count",children:s.length})]}),e.jsx("svg",{viewBox:"0 0 24 24",fill:"none",className:`adv-filters-chevron ${m?"adv-filters-chevron--open":""}`,children:e.jsx("path",{d:"M9 18L15 12L9 6",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round"})})]}),m&&e.jsxs("div",{className:"adv-filters-body",children:[s.map((h,k)=>{var T;w.find(I=>I.id===h.fieldId);const te=De(h.fieldType),V=v===k,U=J(h.fieldId),B=U?H(h.fieldId):[],M=h.logic||"AND";return e.jsxs(Re.Fragment,{children:[k>0&&e.jsxs("div",{className:"adv-filter-connector",children:[e.jsx("span",{className:"adv-filter-connector-line"}),e.jsx("button",{type:"button",className:`adv-filter-connector-badge ${M==="OR"?"adv-filter-connector-badge--or":""}`,onClick:()=>{z(k,{logic:M==="AND"?"OR":"AND"})},title:"Cliquez pour basculer entre ET/OU",children:M==="OR"?"OU":"ET"}),e.jsx("span",{className:"adv-filter-connector-line"})]}),e.jsx("div",{className:`adv-filter-pill ${V?"adv-filter-pill--editing":""}`,children:V?e.jsxs("div",{className:"adv-filter-edit",children:[e.jsxs("div",{className:"adv-filter-row",children:[e.jsx("label",{className:"adv-filter-label",children:"Champ"}),e.jsx("select",{value:h.fieldId,onChange:I=>{const oe=w.find(ne=>ne.id===I.target.value);if(oe){const ne=De(oe.type),fe=I.target.value.startsWith("classif:")?ne.find(j=>j.key==="equals")||ne[0]:ne.find(j=>j.key===h.operator)||ne[0];z(k,{fieldId:oe.id,fieldName:oe.name,fieldType:oe.type||"text",operator:fe.key,value:"",value2:""})}},className:"adv-filter-select",children:w.map(I=>e.jsx("option",{value:I.id,children:I.name},I.id))})]}),e.jsxs("div",{className:"adv-filter-row",children:[e.jsx("label",{className:"adv-filter-label",children:"Condition"}),e.jsx("select",{value:h.operator,onChange:I=>z(k,{operator:I.target.value,value:y(I.target.value)?"":h.value,value2:""}),className:"adv-filter-select",children:te.map(I=>e.jsx("option",{value:I.key,children:I.label},I.key))})]}),!y(h.operator)&&e.jsxs("div",{className:"adv-filter-row",children:[e.jsx("label",{className:"adv-filter-label",children:Y(h.operator)?"Valeur min":"Valeur"}),U&&B.length>0?e.jsxs("select",{value:h.value,onChange:I=>z(k,{value:I.target.value}),className:"adv-filter-select",children:[e.jsx("option",{value:"",children:"Sélectionnez..."}),B.map(I=>e.jsx("option",{value:I.label,children:I.label},I.id))]}):e.jsx("input",{type:Ge(h.fieldType),value:h.value,onChange:I=>z(k,{value:I.target.value}),placeholder:"Saisir une valeur...",className:"adv-filter-input",autoFocus:!0})]}),Y(h.operator)&&e.jsxs("div",{className:"adv-filter-row",children:[e.jsx("label",{className:"adv-filter-label",children:"Valeur max"}),e.jsx("input",{type:Ge(h.fieldType),value:h.value2||"",onChange:I=>z(k,{value2:I.target.value}),placeholder:"Saisir une valeur max...",className:"adv-filter-input"})]}),e.jsxs("div",{className:"adv-filter-row adv-filter-row--actions",children:[e.jsxs("button",{type:"button",className:"adv-filter-btn-done",onClick:()=>x(null),children:[e.jsx("svg",{viewBox:"0 0 24 24",fill:"none",className:"h-3.5 w-3.5",children:e.jsx("path",{d:"M5 13L9 17L19 7",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round"})}),"OK"]}),e.jsx("button",{type:"button",className:"adv-filter-btn-delete",onClick:()=>G(k),children:e.jsxs("svg",{viewBox:"0 0 24 24",fill:"none",className:"h-3.5 w-3.5",children:[e.jsx("path",{d:"M20.5001 6H3.5",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"}),e.jsx("path",{d:"M18.8334 8.5L18.3735 15.3991C18.1965 18.054 18.108 19.3815 17.243 20.1907C16.378 21 15.0476 21 12.3868 21H11.6134C8.9526 21 7.6222 21 6.75719 20.1907C5.89218 19.3815 5.80368 18.054 5.62669 15.3991L5.16675 8.5",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"})]})})]})]}):e.jsxs("button",{type:"button",className:"adv-filter-pill-summary",onClick:()=>x(k),children:[e.jsx("span",{className:"adv-filter-pill-field",children:h.fieldName}),e.jsx("span",{className:"adv-filter-pill-op",children:((T=it[h.operator])==null?void 0:T.label)||h.operator}),!y(h.operator)&&e.jsx("span",{className:"adv-filter-pill-value",children:Y(h.operator)?`${h.value||"?"} – ${h.value2||"?"}`:U?X(h.fieldId,h.value):h.value||"..."}),e.jsx("button",{type:"button",className:"adv-filter-pill-remove",onClick:I=>{I.stopPropagation(),G(k)},children:e.jsx("svg",{viewBox:"0 0 24 24",fill:"none",className:"h-3 w-3",children:e.jsx("path",{d:"M18 6L6 18M6 6L18 18",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round"})})})]})})]},k)}),e.jsxs("div",{className:"adv-filter-add-row",ref:u,children:[e.jsxs("button",{type:"button",className:"adv-filter-add-btn",onClick:()=>p(!c),children:[e.jsx("svg",{viewBox:"0 0 24 24",fill:"none",className:"h-3.5 w-3.5",children:e.jsx("path",{d:"M12 5V19M5 12H19",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round"})}),"Ajouter un filtre"]}),c&&e.jsxs("div",{className:"adv-filter-field-dropdown",children:[e.jsx("div",{className:"adv-filter-field-dropdown-title",children:"Choisir un champ"}),w.map(h=>e.jsxs("button",{type:"button",className:"adv-filter-field-option",onClick:()=>R(h.id),children:[e.jsx("span",{className:"adv-filter-field-type-badge",children:xr(h.type)}),h.name]},h.id))]})]}),s.length>0&&e.jsx("button",{type:"button",className:"adv-filter-clear",onClick:_,children:"Effacer tous les filtres"})]}),e.jsx("style",{children:`
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
            `})]})}function xr(t){return{text:"Aa",title:"T",email:"@",phone:"☎",url:"🔗",number:"#",currency:"$",percent:"%",date:"📅",datetime:"🕐",textarea:"¶",select:"☰",relation:"↗",classification:"●"}[t]||"Aa"}const Qe=229,et=500,tt=280;function hr({entityName:t,entityNamePlural:s,entityIcon:o,accountNumber:n,entitySlug:l,showSidebar:m,onToggleSidebar:a,filters:v=[],activeFilters:x={},onFilterChange:c,columns:p=[],fieldFilters:u=[],onFieldFiltersChange:g,allRecords:w=[],sidebarWidth:R,onSidebarWidthChange:z}){const[G,_]=r.useState(!1),y=r.useRef(null),[Y,J]=r.useState(R||tt),H=r.useRef(!1),X=r.useRef(0),h=r.useRef(0),k=r.useRef(R||tt),te=r.useRef(z);r.useEffect(()=>{te.current=z},[z]),r.useEffect(()=>{k.current=Y},[Y]),r.useEffect(()=>{R&&!H.current&&J(R)},[R]);const V=r.useCallback(M=>{M.preventDefault(),H.current=!0,X.current=M.clientX,h.current=k.current,document.body.style.cursor="col-resize",document.body.style.userSelect="none"},[]);if(r.useEffect(()=>{const M=I=>{if(!H.current)return;const oe=I.clientX-X.current,ne=Math.min(et,Math.max(Qe,h.current+oe));J(ne)},T=()=>{H.current&&(H.current=!1,document.body.style.cursor="",document.body.style.userSelect="",te.current&&te.current(k.current))};return document.addEventListener("mousemove",M),document.addEventListener("mouseup",T),()=>{document.removeEventListener("mousemove",M),document.removeEventListener("mouseup",T)}},[]),r.useEffect(()=>{const M=T=>{G&&y.current&&!y.current.contains(T.target)&&_(!1)};return G&&document.addEventListener("mousedown",M),()=>document.removeEventListener("mousedown",M)},[G]),!m)return null;const U=(M,T)=>{const I={...x},oe=I[M]||[];if(T==="__all__")delete I[M];else{const ne=oe.indexOf(T);ne>-1?(oe.splice(ne,1),oe.length===0?delete I[M]:I[M]=[...oe]):I[M]=[...oe,T]}c(I)},B=Object.keys(x).length>0;return e.jsxs("div",{style:{position:"relative",width:Y,minWidth:Qe,maxWidth:et,flexShrink:0},children:[e.jsxs("div",{className:"panel z-10 space-y-4 overflow-y-auto p-4 h-full",style:{display:"flex",flexDirection:"column",width:"100%"},children:[e.jsxs("div",{className:"flex items-center justify-between",children:[e.jsx("div",{className:"flex items-center",children:e.jsxs("div",{className:"flex items-center text-center",children:[e.jsx("div",{children:o?e.jsx("iconify-icon",{icon:o,width:"22",style:{color:"var(--primary)"}}):e.jsxs("svg",{width:"24",height:"24",viewBox:"0 0 24 24",fill:"none",xmlns:"http://www.w3.org/2000/svg",className:"h-5 w-5",children:[e.jsx("path",{d:"M20.3116 12.6473L20.8293 10.7154C21.4335 8.46034 21.7356 7.3328 21.5081 6.35703C21.3285 5.58657 20.9244 4.88668 20.347 4.34587C19.6157 3.66095 18.4881 3.35883 16.2331 2.75458C13.978 2.15033 12.8504 1.84821 11.8747 2.07573C11.1042 2.25537 10.4043 2.65945 9.86351 3.23687C9.27709 3.86298 8.97128 4.77957 8.51621 6.44561C8.43979 6.7254 8.35915 7.02633 8.27227 7.35057L8.27222 7.35077L7.75458 9.28263C7.15033 11.5377 6.84821 12.6652 7.07573 13.641C7.25537 14.4115 7.65945 15.1114 8.23687 15.6522C8.96815 16.3371 10.0957 16.6392 12.3508 17.2435L12.3508 17.2435C14.3834 17.7881 15.4999 18.0873 16.415 17.9744C16.5152 17.9621 16.6129 17.9448 16.7092 17.9223C17.4796 17.7427 18.1795 17.3386 18.7203 16.7612C19.4052 16.0299 19.7074 14.9024 20.3116 12.6473Z",stroke:"currentColor",strokeWidth:"1.5"}),e.jsx("path",{opacity:"0.5",d:"M16.415 17.9741C16.2065 18.6126 15.8399 19.1902 15.347 19.6519C14.6157 20.3368 13.4881 20.6389 11.2331 21.2432C8.97798 21.8474 7.85044 22.1495 6.87466 21.922C6.10421 21.7424 5.40432 21.3383 4.86351 20.7609C4.17859 20.0296 3.87647 18.9021 3.27222 16.647L2.75458 14.7151C2.15033 12.46 1.84821 11.3325 2.07573 10.3567C2.25537 9.58627 2.65945 8.88638 3.23687 8.34557C3.96815 7.66065 5.09569 7.35853 7.35077 6.75428C7.77741 6.63996 8.16368 6.53646 8.51621 6.44531",stroke:"currentColor",strokeWidth:"1.5"}),e.jsx("path",{d:"M11.7769 10L16.6065 11.2941",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"}),e.jsx("path",{opacity:"0.5",d:"M11 12.8975L13.8978 13.6739",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"})]})}),e.jsx("h3",{className:"text-lg font-semibold ltr:ml-3 rtl:mr-3",children:t})]})}),e.jsxs("div",{className:"dropdown relative",ref:y,children:[e.jsx("button",{type:"button",className:"flex h-8 w-8 items-center justify-center rounded-full bg-[#f4f4f4] hover:bg-primary-light dark:bg-[#1b2e4b]",onClick:()=>_(!G),children:e.jsxs("svg",{width:"24",height:"24",viewBox:"0 0 24 24",fill:"none",xmlns:"http://www.w3.org/2000/svg",className:"h-5 w-5 opacity-70",children:[e.jsx("circle",{cx:"5",cy:"12",r:"2",stroke:"currentColor",strokeWidth:"1.5"}),e.jsx("circle",{opacity:"0.5",cx:"12",cy:"12",r:"2",stroke:"currentColor",strokeWidth:"1.5"}),e.jsx("circle",{cx:"19",cy:"12",r:"2",stroke:"currentColor",strokeWidth:"1.5"})]})}),G&&e.jsxs("ul",{className:"whitespace-nowrap absolute right-0 top-full mt-1 z-50 min-w-[160px] rounded-md border border-gray-200 bg-white py-1 shadow-lg dark:border-[#1b2e4b] dark:bg-[#0e1726]",children:[e.jsx("li",{children:e.jsxs("a",{href:"javascript:;",onClick:()=>_(!1),className:"flex items-center px-4 py-2 text-sm hover:bg-gray-100 hover:text-primary dark:hover:bg-[#181F32] dark:hover:text-primary",children:[e.jsx("iconify-icon",{icon:"solar:settings-bold-duotone",className:"h-4.5 w-4.5 shrink-0 ltr:mr-1 rtl:ml-1",width:"18",style:{marginRight:"6px"}}),"Paramètres"]})}),e.jsx("li",{children:e.jsxs("a",{href:"javascript:;",onClick:()=>_(!1),className:"flex items-center px-4 py-2 text-sm hover:bg-gray-100 hover:text-primary dark:hover:bg-[#181F32] dark:hover:text-primary",children:[e.jsx("iconify-icon",{icon:"solar:question-circle-bold-duotone",className:"h-4.5 w-4.5 shrink-0 ltr:mr-1 rtl:ml-1",width:"18",style:{marginRight:"6px"}}),"Aide"]})})]})]})]}),e.jsx("div",{className:"h-px w-full border-b border-[#e0e6ed] dark:border-[#1b2e4b]"}),e.jsx("div",{className:"!mt-0",style:{flex:1,display:"flex",flexDirection:"column"},children:e.jsxs("div",{className:"flex h-full flex-col pb-16",style:{position:"relative"},children:[e.jsx("div",{className:"relative -mr-3.5 h-full grow pr-3.5 overflow-auto",children:e.jsxs("div",{className:"space-y-1",children:[e.jsx("button",{type:"button",className:`flex h-10 w-full items-center justify-between rounded-md p-2 font-medium hover:bg-white-dark/10 hover:text-primary dark:hover:bg-[#181F32] dark:hover:text-primary ${B?"":"bg-gray-100 dark:text-primary text-primary dark:bg-[#181F32]"}`,onClick:()=>c({}),children:e.jsxs("div",{className:"flex items-center",children:[e.jsx("iconify-icon",{icon:"solar:checklist-minimalistic-bold-duotone",width:"20"}),e.jsxs("div",{className:"ltr:ml-3 rtl:mr-3",children:["Toutes les ",s||t+"s"]})]})}),e.jsx("button",{type:"button",className:`flex h-10 w-full items-center justify-between rounded-md p-2 font-medium hover:bg-white-dark/10 hover:text-primary dark:hover:bg-[#181F32] dark:hover:text-primary ${x.__favourites?"bg-gray-100 dark:text-primary text-primary dark:bg-[#181F32]":""}`,onClick:()=>{const M={...x};M.__favourites?delete M.__favourites:M.__favourites=!0,c(M)},children:e.jsxs("div",{className:"flex items-center",children:[e.jsx("svg",{width:"24",height:"24",viewBox:"0 0 24 24",fill:"none",xmlns:"http://www.w3.org/2000/svg",className:"h-5 w-5",children:e.jsx("path",{d:"M9.15316 5.40838C10.4198 3.13613 11.0531 2 12 2C12.9469 2 13.5802 3.13612 14.8468 5.40837L15.1745 5.99623C15.5345 6.64193 15.7144 6.96479 15.9951 7.17781C16.2757 7.39083 16.6251 7.4699 17.3241 7.62805L17.9605 7.77203C20.4201 8.32856 21.65 8.60682 21.9426 9.54773C22.2352 10.4886 21.3968 11.4691 19.7199 13.4299L19.2861 13.9372C18.8096 14.4944 18.5713 14.773 18.4641 15.1177C18.357 15.4624 18.393 15.8341 18.465 16.5776L18.5306 17.2544C18.7841 19.8706 18.9109 21.1787 18.1449 21.7602C17.3788 22.3417 16.2273 21.8115 13.9243 20.7512L13.3285 20.4768C12.6741 20.1755 12.3469 20.0248 12 20.0248C11.6531 20.0248 11.3259 20.1755 10.6715 20.4768L10.0757 20.7512C7.77268 21.8115 6.62118 22.3417 5.85515 21.7602C5.08912 21.1787 5.21588 19.8706 5.4694 17.2544L5.53498 16.5776C5.60703 15.8341 5.64305 15.4624 5.53586 15.1177C5.42868 14.773 5.19043 14.4944 4.71392 13.9372L4.2801 13.4299C2.60325 11.4691 1.76482 10.4886 2.05742 9.54773C2.35002 8.60682 3.57986 8.32856 6.03954 7.77203L6.67589 7.62805C7.37485 7.4699 7.72433 7.39083 8.00494 7.17781C8.28555 6.96479 8.46553 6.64194 8.82547 5.99623L9.15316 5.40838Z",stroke:"currentColor",strokeWidth:"1.5"})}),e.jsx("div",{className:"ltr:ml-3 rtl:mr-3",children:"Favourites"})]})}),v.map(M=>e.jsxs("div",{children:[e.jsx("div",{className:"h-px w-full border-b border-[#e0e6ed] dark:border-[#1b2e4b] my-2"}),e.jsx("div",{className:"px-1 py-2 text-white-dark text-xs uppercase font-semibold tracking-wider",children:M.name}),M.type==="tags"?e.jsx("div",{className:"flex flex-wrap gap-1.5 px-1",children:M.options.map(T=>{const I=(x[M.id]||[]).includes(T.id);return e.jsxs("button",{type:"button",className:"mb-0 py-0.5 px-2.5 text-xs rounded-full cursor-pointer transition-all font-medium",style:{border:`1.5px solid ${T.color||"#9ca3af"}`,color:I?"#fff":T.color||"#9ca3af",backgroundColor:I?T.color||"#9ca3af":"transparent"},onClick:()=>U(M.id,T.id),children:[T.label,T.count!==void 0&&e.jsx("span",{style:{opacity:.7,marginLeft:"2px"},children:T.count})]},T.id)})}):e.jsx("div",{className:"space-y-0.5",children:M.options.map(T=>{const I=(x[M.id]||[]).includes(T.id);return e.jsxs("button",{type:"button",className:`flex h-9 w-full items-center rounded-md px-2 py-1.5 text-sm font-medium transition-colors hover:bg-white-dark/10 hover:text-primary dark:hover:bg-[#181F32] dark:hover:text-primary ${I?"bg-gray-100 text-primary dark:bg-[#181F32] dark:text-primary":""}`,onClick:()=>U(M.id,T.id),children:[e.jsx("span",{className:"inline-block w-3 h-3 rounded-full mr-2.5 flex-shrink-0",style:{backgroundColor:T.color||"#9ca3af"}}),e.jsx("span",{className:"truncate",children:T.label}),T.count!==void 0&&e.jsx("span",{className:"ml-auto text-xs opacity-60",children:T.count})]},T.id)})})]},M.id)),e.jsx(fr,{columns:p,fieldFilters:u,onFieldFiltersChange:g,allRecords:w,sidebarFilters:v})]})}),e.jsx("div",{className:"absolute bottom-0 w-full p-4 left-0",children:e.jsxs("a",{href:`/account/${n}/record/${l}/add`,className:"btn btn-primary w-full",children:[e.jsxs("svg",{xmlns:"http://www.w3.org/2000/svg",width:"24px",height:"24px",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round",className:"h-5 w-5 ltr:mr-2 rtl:ml-2",children:[e.jsx("line",{x1:"12",y1:"5",x2:"12",y2:"19"}),e.jsx("line",{x1:"5",y1:"12",x2:"19",y2:"12"})]}),"Ajouter"]})})]})})]}),e.jsx("div",{onMouseDown:V,style:{position:"absolute",top:0,right:-3,width:6,height:"100%",cursor:"col-resize",zIndex:20,display:"flex",alignItems:"center",justifyContent:"center"},onMouseEnter:M=>{M.currentTarget.querySelector(".resize-bar").style.opacity="1"},onMouseLeave:M=>{H.current||(M.currentTarget.querySelector(".resize-bar").style.opacity="0")},children:e.jsx("div",{className:"resize-bar",style:{width:3,height:"100%",borderRadius:2,background:"var(--primary, #4361ee)",opacity:0,transition:"opacity 0.2s ease"}})})]})}const gr=["#4361ee","#805dca","#e2a03f","#00ab55","#e7515a","#2196d4","#3b3f5c","#009688","#ff5722","#607d8b"],mr={contains:{label:"Contient",icon:"⊃",types:["text","email","phone","url","textarea","title","relation"]},not_contains:{label:"Ne contient pas",icon:"⊅",types:["text","email","phone","url","textarea","title","relation"]},equals:{label:"Est égal à",icon:"=",types:["text","email","phone","url","number","date","title","select","relation","classification"]},not_equals:{label:"N'est pas égal à",icon:"≠",types:["text","email","phone","url","number","date","title","select","relation","classification"]},starts_with:{label:"Commence par",icon:"A…",types:["text","email","phone","url","title"]},ends_with:{label:"Se termine par",icon:"…Z",types:["text","email","phone","url","title"]},gt:{label:"Supérieur à",icon:">",types:["number","date"]},gte:{label:"Supérieur ou égal",icon:"≥",types:["number","date"]},lt:{label:"Inférieur à",icon:"<",types:["number","date"]},lte:{label:"Inférieur ou égal",icon:"≤",types:["number","date"]},between:{label:"Entre",icon:"↔",types:["number","date"]},is_empty:{label:"Est vide",icon:"∅",types:["text","email","phone","url","number","date","textarea","title","select","relation","classification"]},is_not_empty:{label:"N'est pas vide",icon:"∃",types:["text","email","phone","url","number","date","textarea","title","select","relation","classification"]}};function Ve(t){const s=t||"text";return Object.entries(mr).filter(([o,n])=>n.types.includes(s)).map(([o,n])=>({key:o,...n}))}function rt(t){return["number","currency","percent"].includes(t)?"number":["date","datetime"].includes(t)?"date":"text"}function br({savedViews:t=[],activeViewId:s,onSelectView:o,onCreateView:n,onDeleteView:l,onRenameView:m,onUpdateViewFilters:a,hasActiveFilters:v=!1,activeFilters:x={},fieldFilters:c=[],sidebarFilters:p=[],columns:u=[],externalOpenCreate:g=!1,onCloseExternalCreate:w}){const[R,z]=r.useState(!1),[G,_]=r.useState(!1),[y,Y]=r.useState(""),[J,H]=r.useState("#4361ee"),[X,h]=r.useState(null),[k,te]=r.useState(null),[V,U]=r.useState(""),[B,M]=r.useState(null),[T,I]=r.useState([]),[oe,ne]=r.useState({}),[ue,fe]=r.useState(!1),j=r.useRef(null),O=r.useRef(null),Z=r.useRef(null),W=r.useRef(null);r.useEffect(()=>{const f=E=>{X&&O.current&&!O.current.contains(E.target)&&h(null)};return X&&document.addEventListener("mousedown",f),()=>document.removeEventListener("mousedown",f)},[X]),r.useEffect(()=>{R&&Z.current&&setTimeout(()=>{var f;return(f=Z.current)==null?void 0:f.focus()},100)},[R]),r.useEffect(()=>{g&&(z(!0),I([...c]),w==null||w())},[g]),r.useEffect(()=>{R&&!B&&(I([...c]),ne(JSON.parse(JSON.stringify(x||{}))))},[R]),r.useEffect(()=>{const f=E=>{ue&&j.current&&!j.current.contains(E.target)&&fe(!1)};return ue&&document.addEventListener("mousedown",f),()=>document.removeEventListener("mousedown",f)},[ue]),r.useEffect(()=>{k&&W.current&&(W.current.focus(),W.current.select())},[k]);const q=(f,E)=>{f.preventDefault(),h({viewId:E,x:f.clientX,y:f.clientY})},P=()=>{y.trim()&&(n({name:y.trim(),color:J,filters:oe,fieldFilters:T}),Y(""),H("#4361ee"),I([]),ne({}),z(!1))},K=r.useMemo(()=>u.filter(f=>f.id!=="actions"),[u]),ie=r.useMemo(()=>{const f={};return p.forEach(E=>{f[`classif:${E.id}`]=E.options||[]}),f},[p]),b=r.useCallback(f=>{const E=K.find(he=>he.id===f);if(!E)return;const Q=f.startsWith("classif:"),pe=Ve(E.type),ye=Q?pe.find(he=>he.key==="equals")||pe[0]:pe.find(he=>he.key==="contains")||pe[0],we={fieldId:f,fieldName:E.name,fieldType:E.type||"text",operator:ye.key,value:"",value2:"",logic:"AND"};I(he=>[...he,we]),fe(!1)},[K]),i=r.useCallback((f,E)=>{I(Q=>Q.map((pe,ye)=>ye===f?{...pe,...E}:pe))},[]),S=r.useCallback(f=>{I(E=>E.filter((Q,pe)=>pe!==f))},[]),D=f=>{const E=t.find(Q=>Q._id===f);E&&(te(f),U(E.name)),h(null)},C=()=>{k&&V.trim()&&m(k,V.trim()),te(null),U("")},se=f=>{l(f),h(null)},F=f=>{const E=t.find(Q=>Q._id===f);E&&(M(f),Y(E.name||""),H(E.color||"#4361ee"),I(E.fieldFilters?JSON.parse(JSON.stringify(E.fieldFilters)):[]),ne(E.filters?JSON.parse(JSON.stringify(E.filters)):{}),z(!0),h(null))},le=()=>{!y.trim()||!B||(a(B,oe,T,y.trim(),J),Y(""),H("#4361ee"),I([]),ne({}),M(null),z(!1))},xe=f=>{var Q;let E=0;return f.filters&&(E+=Object.keys(f.filters).filter(pe=>pe!=="__favourites").length),(Q=f.fieldFilters)!=null&&Q.length&&(E+=f.fieldFilters.length),E};return e.jsxs(e.Fragment,{children:[e.jsxs("div",{className:"saved-views-tabs",children:[e.jsxs("button",{type:"button",className:`saved-view-tab ${s?"":"saved-view-tab--active"}`,onClick:()=>o(null),children:[e.jsxs("svg",{className:"saved-view-tab-icon",viewBox:"0 0 24 24",fill:"none",children:[e.jsx("path",{d:"M2 12C2 7.28595 2 4.92893 3.46447 3.46447C4.92893 2 7.28595 2 12 2C16.714 2 19.0711 2 20.5355 3.46447C22 4.92893 22 7.28595 22 12C22 16.714 22 19.0711 20.5355 20.5355C19.0711 22 16.714 22 12 22C7.28595 22 4.92893 22 3.46447 20.5355C2 19.0711 2 16.714 2 12Z",stroke:"currentColor",strokeWidth:"1.5"}),e.jsx("path",{d:"M6 12H18",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"}),e.jsx("path",{d:"M6 8H18",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"}),e.jsx("path",{d:"M6 16H18",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"})]}),"Tout"]}),t.map(f=>e.jsx("button",{type:"button",className:`saved-view-tab ${s===f._id?"saved-view-tab--active":""}`,style:{"--tab-color":f.color||"#4361ee"},onClick:()=>o(f._id),onContextMenu:E=>q(E,f._id),children:k===f._id?e.jsx("input",{ref:W,type:"text",value:V,onChange:E=>U(E.target.value),onBlur:C,onKeyDown:E=>{E.key==="Enter"&&C(),E.key==="Escape"&&(te(null),U(""))},className:"saved-view-tab-edit-input",onClick:E=>E.stopPropagation()}):e.jsxs(e.Fragment,{children:[e.jsx("span",{className:"saved-view-tab-dot",style:{backgroundColor:f.color||"#4361ee"}}),e.jsx("span",{className:"saved-view-tab-name",children:f.name}),xe(f)>0&&e.jsx("span",{className:"saved-view-tab-badge",children:xe(f)})]})},f._id)),e.jsx("button",{type:"button",className:"saved-view-tab saved-view-tab--add",onClick:()=>{M(null),Y(""),H("#4361ee"),z(!0)},title:"Enregistrer une vue",children:e.jsx("svg",{viewBox:"0 0 24 24",fill:"none",className:"h-3.5 w-3.5",children:e.jsx("path",{d:"M12 5V19M5 12H19",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round"})})})]}),X&&e.jsxs("div",{ref:O,className:"saved-view-context-menu",style:{position:"fixed",top:X.y,left:X.x,zIndex:10001},children:[e.jsxs("button",{className:"saved-view-context-item",onClick:()=>D(X.viewId),children:[e.jsx("svg",{viewBox:"0 0 24 24",fill:"none",className:"h-4 w-4",children:e.jsx("path",{d:"M13.9027 6.37027L17.6297 10.0973M4 20.0001H8L18.5 9.50006C18.9978 9.00236 19.2786 8.32622 19.2786 7.62142C19.2786 6.91661 18.9978 6.24047 18.5 5.74277C18.0023 5.24508 17.3261 4.96426 16.6213 4.96426C15.9165 4.96426 15.2404 5.24508 14.7427 5.74277L4 16.0001V20.0001Z",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round"})}),"Renommer"]}),e.jsxs("button",{className:"saved-view-context-item",onClick:()=>F(X.viewId),children:[e.jsxs("svg",{viewBox:"0 0 24 24",fill:"none",className:"h-4 w-4",children:[e.jsx("path",{d:"M4.06189 13C4.02104 12.6724 4 12.3387 4 12C4 7.58172 7.58172 4 12 4C14.5006 4 16.7332 5.14727 18.2002 6.94416M19.9381 11C19.979 11.3276 20 11.6613 20 12C20 16.4183 16.4183 20 12 20C9.49944 20 7.26681 18.8527 5.79984 17.0558",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round"}),e.jsx("path",{d:"M15 7H19V3",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round"}),e.jsx("path",{d:"M9 17H5V21",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round"})]}),"Modifier la vue"]}),e.jsx("div",{className:"saved-view-context-separator"}),e.jsxs("button",{className:"saved-view-context-item saved-view-context-item--danger",onClick:()=>se(X.viewId),children:[e.jsxs("svg",{viewBox:"0 0 24 24",fill:"none",className:"h-4 w-4",children:[e.jsx("path",{d:"M20.5001 6H3.5",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"}),e.jsx("path",{d:"M18.8334 8.5L18.3735 15.3991C18.1965 18.054 18.108 19.3815 17.243 20.1907C16.378 21 15.0476 21 12.3868 21H11.6134C8.9526 21 7.6222 21 6.75719 20.1907C5.89218 19.3815 5.80368 18.054 5.62669 15.3991L5.16675 8.5",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"}),e.jsx("path",{d:"M9.5 11L10 16",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"}),e.jsx("path",{d:"M14.5 11L14 16",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"}),e.jsx("path",{d:"M6.5 6C6.55588 6 6.58382 6 6.60915 5.99936C7.43259 5.97849 8.15902 5.45491 8.43922 4.68032C8.44784 4.65649 8.45667 4.62999 8.47434 4.57697L8.57143 4.28571C8.65431 4.03708 8.69575 3.91276 8.75071 3.8072C8.97001 3.38607 9.37574 3.09364 9.84461 3.01877C9.96213 3 10.0932 3 10.3553 3H13.6447C13.9068 3 14.0379 3 14.1554 3.01877C14.6243 3.09364 15.03 3.38607 15.2493 3.8072C15.3043 3.91276 15.3457 4.03708 15.4286 4.28571L15.5257 4.57697C15.5433 4.62992 15.5522 4.65651 15.5608 4.68032C15.841 5.45491 16.5674 5.97849 17.3909 5.99936C17.4162 6 17.4441 6 17.5 6",stroke:"currentColor",strokeWidth:"1.5"})]}),"Supprimer"]})]}),R&&e.jsx("div",{className:"saved-view-modal-overlay",onClick:()=>z(!1),children:e.jsxs("div",{className:"saved-view-modal",onClick:f=>f.stopPropagation(),children:[e.jsxs("div",{className:"saved-view-modal-header",children:[e.jsx("h3",{children:B?"Modifier la vue":"Enregistrer la vue"}),e.jsx("button",{type:"button",className:"saved-view-modal-close",onClick:()=>{z(!1),M(null)},children:e.jsx("svg",{viewBox:"0 0 24 24",fill:"none",className:"h-5 w-5",children:e.jsx("path",{d:"M18 6L6 18M6 6L18 18",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"})})})]}),e.jsxs("div",{className:"saved-view-modal-body",children:[e.jsxs("div",{className:"saved-view-form-group",children:[e.jsx("label",{className:"saved-view-form-label",children:"Nom de la vue"}),e.jsx("input",{ref:Z,type:"text",value:y,onChange:f=>Y(f.target.value),onKeyDown:f=>{f.key==="Enter"&&P()},placeholder:"Ex: Hôtels, Clients VIP...",className:"saved-view-form-input"})]}),e.jsxs("div",{className:"saved-view-form-group",children:[e.jsx("label",{className:"saved-view-form-label",children:"Couleur"}),e.jsx("div",{className:"saved-view-color-grid",children:gr.map(f=>e.jsx("button",{type:"button",className:`saved-view-color-swatch ${J===f?"saved-view-color-swatch--active":""}`,style:{backgroundColor:f},onClick:()=>H(f),children:J===f&&e.jsx("svg",{viewBox:"0 0 24 24",fill:"none",className:"h-3 w-3",children:e.jsx("path",{d:"M5 13L9 17L19 7",stroke:"white",strokeWidth:"2.5",strokeLinecap:"round",strokeLinejoin:"round"})})},f))})]}),p.length>0&&e.jsxs("div",{className:"saved-view-form-group",children:[e.jsx("label",{className:"saved-view-form-label",children:"Filtres de classification"}),e.jsx("div",{className:"svm-classif-editor",children:p.map(f=>{const E=oe[f.id]||[];return e.jsxs("div",{className:"svm-classif-group",children:[e.jsx("span",{className:"svm-classif-group-label",children:f.name}),e.jsx("div",{className:"svm-classif-options",children:(f.options||[]).map(Q=>{const pe=E.includes(Q.id);return e.jsxs("button",{type:"button",className:`svm-classif-pill ${pe?"svm-classif-pill--active":""}`,style:{"--pill-color":Q.color||"#9ca3af"},onClick:()=>{ne(ye=>{const we=ye[f.id]||[];let he;pe?he=we.filter(je=>je!==Q.id):he=[...we,Q.id];const ke={...ye};return he.length>0?ke[f.id]=he:delete ke[f.id],ke})},children:[pe&&e.jsx("svg",{viewBox:"0 0 24 24",fill:"none",className:"svm-classif-check",children:e.jsx("path",{d:"M5 13L9 17L19 7",stroke:"currentColor",strokeWidth:"2.5",strokeLinecap:"round",strokeLinejoin:"round"})}),Q.label]},Q.id)})})]},f.id)})})]}),e.jsxs("div",{className:"saved-view-form-group",children:[e.jsx("label",{className:"saved-view-form-label",children:"Filtres avancés"}),e.jsxs("div",{className:"svm-filter-builder",children:[T.map((f,E)=>{var je;const Q=(je=f.fieldId)==null?void 0:je.startsWith("classif:"),pe=Q?ie[f.fieldId]||[]:[],ye=Ve(f.fieldType),we=["is_empty","is_not_empty"].includes(f.operator),he=f.operator==="between",ke=f.logic||"AND";return e.jsxs(Re.Fragment,{children:[E>0&&e.jsxs("div",{className:"svm-filter-connector",children:[e.jsx("span",{className:"svm-filter-connector-line"}),e.jsx("button",{type:"button",className:`svm-filter-connector-badge ${ke==="OR"?"svm-filter-connector-badge--or":""}`,onClick:()=>i(E,{logic:ke==="AND"?"OR":"AND"}),title:"Cliquez pour basculer ET/OU",children:ke==="OR"?"OU":"ET"}),e.jsx("span",{className:"svm-filter-connector-line"})]}),e.jsxs("div",{className:"svm-filter-row",children:[e.jsx("select",{value:f.fieldId,onChange:ce=>{const Ce=K.find(Me=>Me.id===ce.target.value);if(Ce){const Me=ce.target.value.startsWith("classif:"),Se=Ve(Ce.type),Ne=Me?Se.find(be=>be.key==="equals")||Se[0]:Se.find(be=>be.key===f.operator)||Se[0];i(E,{fieldId:Ce.id,fieldName:Ce.name,fieldType:Ce.type||"text",operator:Ne.key,value:"",value2:""})}},className:"svm-filter-select svm-filter-select--field",children:K.map(ce=>e.jsx("option",{value:ce.id,children:ce.name},ce.id))}),e.jsx("select",{value:f.operator,onChange:ce=>i(E,{operator:ce.target.value,value:["is_empty","is_not_empty"].includes(ce.target.value)?"":f.value,value2:""}),className:"svm-filter-select svm-filter-select--op",children:ye.map(ce=>e.jsx("option",{value:ce.key,children:ce.label},ce.key))}),!we&&(Q&&pe.length>0?e.jsxs("select",{value:f.value,onChange:ce=>i(E,{value:ce.target.value}),className:"svm-filter-select svm-filter-select--val",children:[e.jsx("option",{value:"",children:"Sélectionnez..."}),pe.map(ce=>e.jsx("option",{value:ce.label,children:ce.label},ce.id))]}):e.jsx("input",{type:rt(f.fieldType),value:f.value,onChange:ce=>i(E,{value:ce.target.value}),placeholder:"Valeur...",className:"svm-filter-input"})),he&&e.jsx("input",{type:rt(f.fieldType),value:f.value2||"",onChange:ce=>i(E,{value2:ce.target.value}),placeholder:"Max...",className:"svm-filter-input"}),e.jsx("button",{type:"button",className:"svm-filter-remove",onClick:()=>S(E),title:"Supprimer ce filtre",children:e.jsx("svg",{viewBox:"0 0 24 24",fill:"none",className:"h-3.5 w-3.5",children:e.jsx("path",{d:"M18 6L6 18M6 6L18 18",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round"})})})]})]},E)}),e.jsxs("div",{className:"svm-filter-add-row",ref:j,children:[e.jsxs("button",{type:"button",className:"svm-filter-add-btn",onClick:()=>fe(!ue),children:[e.jsx("svg",{viewBox:"0 0 24 24",fill:"none",className:"h-3.5 w-3.5",children:e.jsx("path",{d:"M12 5V19M5 12H19",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round"})}),"Ajouter un filtre"]}),ue&&e.jsxs("div",{className:"svm-filter-field-dropdown",children:[e.jsx("div",{className:"svm-filter-field-dropdown-title",children:"Choisir un champ"}),K.map(f=>e.jsx("button",{type:"button",className:"svm-filter-field-option",onClick:()=>b(f.id),children:f.name},f.id))]})]})]})]})]}),e.jsxs("div",{className:"saved-view-modal-footer",children:[e.jsx("button",{type:"button",className:"saved-view-btn saved-view-btn--cancel",onClick:()=>{z(!1),M(null)},children:"Annuler"}),e.jsxs("button",{type:"button",className:"saved-view-btn saved-view-btn--save",onClick:B?le:P,disabled:!y.trim(),children:[e.jsx("svg",{viewBox:"0 0 24 24",fill:"none",className:"h-4 w-4",children:e.jsx("path",{d:"M5 13L9 17L19 7",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round"})}),B?"Mettre à jour":"Enregistrer"]})]})]})}),e.jsx("style",{children:`
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
            `})]})}function vr(t,s){var n,l,m;if(s==="title")return t.referenceTitle||t.computedTitle||t.title||"";if(s==="createdAt")return t.createdAt||"";if(s==="updatedAt")return t.updatedAt||"";if(s.startsWith("rel:")){const a=s.replace("rel:",""),x=(((n=t._denorm)==null?void 0:n.relations)||[]).find(u=>u.relationKey===a);if(((l=x==null?void 0:x.records)==null?void 0:l.length)>0)return x.records.map(u=>u.title||u.computedTitle||"").join(", ");const c=(t.relations||[]).find(u=>u.key===a||u.relationKey===a);if(c)return c.title||c.computedTitle||c.value||"";const p=(m=t._denorm)==null?void 0:m[a];return p&&(p.title||p.computedTitle)||""}if(s.startsWith("classif:")){const a=s.replace("classif:","");return(t.classificationValues||[]).filter(c=>{var p;return((p=c.classificationId)==null?void 0:p.toString())===a}).map(c=>c.label||c.optionLabel||"").join(", ")}const o=(t.customFields||[]).find(a=>{var v,x,c;return((x=(v=a.field_id)==null?void 0:v._id)==null?void 0:x.toString())===s||((c=a.field_id)==null?void 0:c.toString())===s});return(o==null?void 0:o.value)??""}function yr(t,s){const{operator:o,value:n,value2:l,fieldType:m}=s,a=["number","currency","percent"].includes(m),v=["date","datetime"].includes(m),x=String(t??"").trim(),c=x.toLowerCase(),p=String(n??"").trim().toLowerCase();switch(o){case"contains":return c.includes(p);case"not_contains":return!c.includes(p);case"equals":return a?parseFloat(x)===parseFloat(n):c===p;case"not_equals":return a?parseFloat(x)!==parseFloat(n):c!==p;case"starts_with":return c.startsWith(p);case"ends_with":return c.endsWith(p);case"gt":return v?new Date(t)>new Date(n):parseFloat(x)>parseFloat(n);case"gte":return v?new Date(t)>=new Date(n):parseFloat(x)>=parseFloat(n);case"lt":return v?new Date(t)<new Date(n):parseFloat(x)<parseFloat(n);case"lte":return v?new Date(t)<=new Date(n):parseFloat(x)<=parseFloat(n);case"between":{if(v){const g=new Date(t);return g>=new Date(n)&&g<=new Date(l)}const u=parseFloat(x);return u>=parseFloat(n)&&u<=parseFloat(l)}case"is_empty":return x===""||t==null;case"is_not_empty":return x!==""&&t!=null;default:return!0}}function kr({accountId:t,accountNumber:s,entityId:o,viewId:n,entityName:l,entityNamePlural:m,entitySlug:a}){const[v,x]=r.useState([]),[c,p]=r.useState([]),[u,g]=r.useState([]),[w,R]=r.useState([]),[z,G]=r.useState(!0),[_,y]=r.useState(null),[Y,J]=r.useState(""),[H,X]=r.useState("table"),[h,k]=r.useState(""),[te,V]=r.useState(null),[U,B]=r.useState(new Set),[M,T]=r.useState(!1),I=r.useRef(null),[oe,ne]=r.useState([]),[ue,fe]=r.useState({}),[j,O]=r.useState([]),[Z,W]=r.useState([]),[q,P]=r.useState(null),[K,ie]=r.useState(!1),[b,i]=r.useState(null),S=r.useRef(null),D=r.useCallback((d,N="success")=>{S.current&&clearTimeout(S.current),i({message:d,type:N}),S.current=setTimeout(()=>i(null),2500)},[]),[C,se]=r.useState({columns:[],sort:{field:"createdAt",direction:"desc"},density:"normal",pageSize:10,titleDisplay:"avatar",showSidebar:!0,sidebarWidth:280,viewMode:null,enabledViews:["table","kanban","notes","calendar"]}),[F,le]=r.useState({page:1,limit:10,total:0,pages:0}),xe=r.useRef(null),f=r.useCallback(async()=>{var d,N;try{G(!0),y(null);const $=new URLSearchParams({limit:1e4,sort:`${C.sort.field}:${C.sort.direction}`}),A=await fetch(`/account/${s}/api/entity/${o}/views/${n}/records?${$}`,{credentials:"include"});if(!A.ok)throw new Error(`HTTP ${A.status}`);const L=await A.json();if(x(L.records||[]),p(L.records||[]),L.entity&&(V(L.entity),L.entity.icon&&k(L.entity.icon)),L.filters&&ne(L.filters),L.preferences)if(se(re=>{var ee,ae;return{...re,...L.preferences,columns:(ee=L.preferences.columns)!=null&&ee.length?L.preferences.columns:((ae=L.columns)==null?void 0:ae.map(de=>({id:de.id,visible:!0})))||[]}}),L.preferences.pageSize&&le(re=>({...re,limit:L.preferences.pageSize})),L.preferences.viewMode&&X(L.preferences.viewMode),(d=L.preferences.columns)!=null&&d.length&&((N=L.columns)!=null&&N.length)){const re=[];L.preferences.columns.forEach(ee=>{const ae=L.columns.find(de=>de.id===ee.id);ae&&re.push(ae)}),L.columns.forEach(ee=>{re.find(ae=>ae.id===ee.id)||re.push(ee)}),R(re)}else R(L.columns||[]);else L.columns&&(R(L.columns||[]),se(re=>({...re,columns:L.columns.map(ee=>({id:ee.id,visible:!0}))})))}catch($){console.error("[RecordsGrid] Fetch error:",$),y($.message)}finally{G(!1)}},[s,o,n,C.sort]),E=r.useCallback(async()=>{try{const d=await fetch(`/account/${s}/api/entity/${o}/saved-views`,{credentials:"include"});if(d.ok){const N=await d.json();W(N.views||[])}}catch(d){console.error("[RecordsGrid] Fetch saved views error:",d)}},[s,o]),Q=r.useCallback(async({name:d,color:N,filters:$,fieldFilters:A})=>{try{const L=await fetch(`/account/${s}/api/entity/${o}/saved-views`,{method:"POST",headers:{"Content-Type":"application/json"},credentials:"include",body:JSON.stringify({name:d,color:N,filters:$,fieldFilters:A})});if(L.ok){const re=await L.json();W(ee=>[...ee,re.view]),P(re.view._id)}}catch(L){console.error("[RecordsGrid] Create saved view error:",L)}},[s,o]),pe=r.useCallback(async d=>{try{(await fetch(`/account/${s}/api/entity/${o}/saved-views/${d}`,{method:"DELETE",credentials:"include"})).ok&&(W($=>$.filter(A=>A._id!==d)),q===d&&(P(null),fe({}),le($=>({...$,page:1}))))}catch(N){console.error("[RecordsGrid] Delete saved view error:",N)}},[s,o,q]),ye=r.useCallback(async(d,N)=>{try{(await fetch(`/account/${s}/api/entity/${o}/saved-views/${d}`,{method:"PUT",headers:{"Content-Type":"application/json"},credentials:"include",body:JSON.stringify({name:N})})).ok&&W(A=>A.map(L=>L._id===d?{...L,name:N}:L))}catch($){console.error("[RecordsGrid] Rename saved view error:",$)}},[s,o]),we=r.useCallback(async(d,N,$,A,L)=>{var re;try{const ee={filters:N,fieldFilters:$||[]};if(A&&(ee.name=A),L&&(ee.color=L),(await fetch(`/account/${s}/api/entity/${o}/saved-views/${d}`,{method:"PUT",headers:{"Content-Type":"application/json"},credentials:"include",body:JSON.stringify(ee)})).ok){const de=JSON.parse(JSON.stringify(N||{})),ge=JSON.parse(JSON.stringify($||[]));W(ve=>ve.map(Le=>{if(Le._id!==d)return Le;const Ee={...Le,filters:de,fieldFilters:ge};return A&&(Ee.name=A),L&&(Ee.color=L),Ee}));const me=A||((re=Z.find(ve=>ve._id===d))==null?void 0:re.name)||"Vue";D(`Vue "${me}" mise à jour`)}else D("Erreur lors de la mise à jour","error")}catch(ee){console.error("[RecordsGrid] Update saved view error:",ee),D("Erreur lors de la mise à jour","error")}},[s,o,Z,D]),he=r.useCallback(d=>{if(!d){P(null),fe({}),O([]),le($=>({...$,page:1}));return}const N=Z.find($=>$._id===d);N&&(P(d),fe(JSON.parse(JSON.stringify(N.filters||{}))),O(JSON.parse(JSON.stringify(N.fieldFilters||[]))),le($=>({...$,page:1})))},[Z]);r.useEffect(()=>{f(),E()},[]);const ke=r.useMemo(()=>{if(!v.length)return[];const{field:d,direction:N}=C.sort,$=N==="asc"?1:-1;return[...v].sort((A,L)=>{let re,ee;if(d==="title")re=(A.referenceTitle||A.title||"").toLowerCase(),ee=(L.referenceTitle||L.title||"").toLowerCase();else if(d==="createdAt"||d==="updatedAt")re=new Date(A[d]||0).getTime(),ee=new Date(L[d]||0).getTime();else{const ae=(A.customFields||[]).find(ge=>{var ve;const me=((ve=ge.field_id)==null?void 0:ve._id)||ge.field_id;return(me==null?void 0:me.toString())===d}),de=(L.customFields||[]).find(ge=>{var ve;const me=((ve=ge.field_id)==null?void 0:ve._id)||ge.field_id;return(me==null?void 0:me.toString())===d});re=((ae==null?void 0:ae.value)||"").toString().toLowerCase(),ee=((de==null?void 0:de.value)||"").toString().toLowerCase()}return re<ee?-1*$:re>ee?1*$:0})},[v,C.sort.field,C.sort.direction]),je=r.useMemo(()=>ke.map(d=>({...d,_searchIndex:[d.title||"",d.referenceTitle||"",d.computedTitle||"",...(d.customFields||[]).map(N=>N.value||"")].join(" ").toLowerCase()})),[ke]),ce=r.useCallback((d,N,$,A)=>{let L=d;if(N&&N.trim()){const ee=N.toLowerCase();L=L.filter(ae=>ae._searchIndex.includes(ee))}const re=Object.keys($).filter(ee=>ee!=="__favourites");return re.length>0&&(L=L.filter(ee=>{const ae=ee.classificationValues||[];return re.every(de=>{const ge=$[de];return!ge||ge.length===0?!0:ae.some(me=>{var ve,Le;return((ve=me.classificationId)==null?void 0:ve.toString())===de&&ge.includes((Le=me.optionId)==null?void 0:Le.toString())})})})),A&&A.length>0&&(L=L.filter(ee=>{const ae=[[A[0]]];for(let de=1;de<A.length;de++)(A[de].logic||"AND")==="OR"?ae.push([A[de]]):ae[ae.length-1].push(A[de]);return ae.some(de=>de.every(ge=>{const me=vr(ee,ge.fieldId);return yr(me,ge)}))})),L},[]),Ce=r.useCallback(d=>{var $;const N=typeof d=="string"?d:(($=d==null?void 0:d.target)==null?void 0:$.value)||"";J(N),le(A=>({...A,page:1}))},[]),Me=r.useCallback(d=>{fe(d),le(N=>({...N,page:1}))},[]),Se=r.useCallback(d=>{O(d),le(N=>({...N,page:1}))},[]);r.useEffect(()=>{const d=ce(je,Y,ue,j);p(d)},[je,Y,ue,j,ce]),r.useEffect(()=>{const d=(F.page-1)*F.limit,N=d+F.limit,$=c.slice(d,N);g($),le(A=>({...A,total:c.length,pages:Math.ceil(c.length/F.limit)}))},[c,F.page,F.limit]);const Ne=r.useCallback(async d=>{try{await fetch(`/account/${s}/api/user/view-preferences`,{method:"POST",headers:{"Content-Type":"application/json"},credentials:"include",body:JSON.stringify({viewId:n,preferences:d})})}catch(N){console.error("[RecordsGrid] Save preferences error:",N)}},[s,n]),be=r.useCallback((d,N)=>{const $={...C,[d]:N};se($),Ne($),d==="pageSize"&&le(A=>({...A,limit:N,page:1}))},[C,Ne]),at=r.useCallback(d=>{X(d),se(N=>{const $={...N,viewMode:d};return Ne($),$})},[Ne]),We=r.useCallback(d=>{le(N=>({...N,page:d}))},[]),lt=r.useCallback((d,N,$)=>{if($&&I.current!==null&&I.current!==N){const A=Math.min(I.current,N),L=Math.max(I.current,N);B(re=>{const ee=new Set(re);for(let ae=A;ae<=L;ae++)u[ae]&&ee.add(u[ae]._id);return ee})}else B(A=>{const L=new Set(A);return L.has(d)?L.delete(d):L.add(d),L});I.current=N},[u]),dt=r.useCallback(()=>{B(d=>{const N=u.map(L=>L._id),$=N.every(L=>d.has(L)),A=new Set(d);return $?N.forEach(L=>A.delete(L)):N.forEach(L=>A.add(L)),A})},[u]),ct=r.useCallback(()=>{B(d=>{const N=c.map($=>$._id);return d.size===N.length?new Set:new Set(N)})},[c]),ut=r.useCallback(()=>{B(new Set)},[]),pt=r.useMemo(()=>u.length===0?!1:u.every(d=>U.has(d._id)),[u,U]),ft=r.useCallback(async()=>{if(!(U.size===0||!(typeof Swal<"u"?await Swal.fire({title:"Confirmer la suppression",html:`<p>Vous allez supprimer <strong>${U.size}</strong> enregistrement(s).</p><p style="color:#e7515a;font-size:13px;margin-top:8px;">Cette action est irréversible.</p>`,icon:"warning",showCancelButton:!0,confirmButtonColor:"#e7515a",cancelButtonText:"Annuler",confirmButtonText:"Supprimer"}).then(N=>N.isConfirmed):confirm(`Supprimer ${U.size} enregistrement(s) ?`)))){T(!0);try{const $=await(await fetch(`/account/${s}/record/api/bulk-delete`,{method:"POST",headers:{"Content-Type":"application/json"},credentials:"include",body:JSON.stringify({ids:[...U]})})).json();$.success?(x(A=>A.filter(L=>!U.has(L._id))),B(new Set),D(`${$.deletedCount} enregistrement(s) supprimé(s)`)):D($.error||"Erreur lors de la suppression","error")}catch(N){console.error("[RecordsGrid] Bulk delete error:",N),D("Erreur lors de la suppression","error")}finally{T(!1)}}},[U,s,D]),xt=r.useCallback((d,N)=>{R($=>{const A=$.findIndex(de=>de.id===d),L=$.findIndex(de=>de.id===N);if(A===-1||L===-1)return $;const re=[...$],[ee]=re.splice(A,1);re.splice(L,0,ee);const ae=re.map(de=>C.columns.find(me=>me.id===de.id)||{id:de.id,visible:!0});return be("columns",ae),re})},[C.columns,be]),Pe=r.useMemo(()=>{switch(C.density){case"compact":return 36;case"comfortable":return 56;default:return 44}},[C.density]),Te=mt({count:u.length,getScrollElement:()=>xe.current,estimateSize:()=>Pe,overscan:10});r.useEffect(()=>{Te.measure()},[Pe,Te]);const ht=r.useMemo(()=>{var $;let d;($=C.columns)!=null&&$.length?d=w.filter(A=>{const L=C.columns.find(re=>re.id===A.id);return L?L.visible!==!1:!0}):d=w;const N=d.findIndex(A=>A.id==="actions");if(N>-1&&N<d.length-1){const[A]=d.splice(N,1);d=[...d,A]}return d},[w,C.columns]);return z&&u.length===0?e.jsx("div",{className:"flex items-center justify-center h-64",children:e.jsx("div",{className:"animate-spin rounded-full h-8 w-8 border-b-2 border-primary"})}):_&&u.length===0?e.jsx("div",{className:"flex items-center justify-center h-64 text-danger",children:e.jsxs("span",{children:["Erreur: ",_]})}):e.jsxs("div",{className:"relative flex h-full gap-5 sm:min-h-0",children:[e.jsx(hr,{entityName:l,entityNamePlural:m,entityIcon:h,accountNumber:s,entitySlug:a,showSidebar:C.showSidebar!==!1,onToggleSidebar:()=>be("showSidebar",!C.showSidebar),filters:oe,activeFilters:ue,onFilterChange:Me,columns:w,fieldFilters:j,onFieldFiltersChange:Se,allRecords:v,sidebarWidth:C.sidebarWidth,onSidebarWidthChange:d=>be("sidebarWidth",d)}),e.jsxs("div",{className:`panel p-4 flex-1 flex flex-col h-full ${H==="calendar"?"overflow-auto":"overflow-hidden"}`,children:[e.jsx(Rt,{searchQuery:Y,onSearch:Ce,columns:w,preferences:C,onPreferencesChange:be,loading:z,accountNumber:s,entitySlug:a,viewId:n,showSidebar:C.showSidebar!==!1,onToggleSidebar:()=>be("showSidebar",!C.showSidebar),activeView:H,onViewChange:at,enabledViews:C.enabledViews||["table","kanban","notes"],onEnabledViewsChange:d=>be("enabledViews",d),hasActiveFilters:Object.keys(ue).filter(d=>d!=="__favourites").length>0||j.length>0,onOpenSaveView:()=>ie(!0)}),e.jsx(br,{savedViews:Z,activeViewId:q,onSelectView:he,onCreateView:Q,onDeleteView:pe,onRenameView:ye,onUpdateViewFilters:we,hasActiveFilters:Object.keys(ue).filter(d=>d!=="__favourites").length>0||j.length>0,activeFilters:ue,fieldFilters:j,sidebarFilters:oe,columns:w,externalOpenCreate:K,onCloseExternalCreate:()=>ie(!1)}),e.jsx("div",{className:`flex-1 flex flex-col mt-4 ${H==="calendar"?"overflow-auto":"overflow-hidden"}`,children:H==="kanban"?e.jsx(qt,{records:c,columns:w,accountNumber:s,entitySlug:a,viewId:n,entityData:te}):H==="calendar"?e.jsx(ur,{records:c,columns:w,accountNumber:s,entitySlug:a,entityData:te}):H==="notes"?e.jsx(rr,{records:c,accountNumber:s,entitySlug:a}):e.jsxs("div",{className:"dataTable-wrapper flex-1 flex flex-col overflow-hidden",children:[e.jsx("div",{className:"dataTable-container flex-1 overflow-auto",ref:xe,children:e.jsx(Wt,{records:u,columns:ht,virtualizer:Te,sort:C.sort,onSort:d=>{const N=C.sort.field===d&&C.sort.direction==="asc"?"desc":"asc";be("sort",{field:d,direction:N})},onColumnReorder:xt,density:C.density,titleDisplay:C.titleDisplay||"avatar",entityIcon:h,accountNumber:s,entitySlug:a,selectedIds:U,onToggleSelect:lt,onSelectAll:dt,allPageSelected:pt,showCheckboxes:C.showCheckboxes!==!1})}),e.jsxs("div",{className:"dataTable-bottom flex items-center justify-between border-t pt-4 dark:border-gray-800",children:[e.jsxs("div",{className:"dataTable-info text-gray-500 dark:text-gray-400",children:["Affichage de ",(F.page-1)*F.limit+1," à ",Math.min(F.page*F.limit,F.total)," sur ",F.total]}),e.jsx("nav",{className:"dataTable-pagination",children:e.jsxs("ul",{className:"inline-flex items-center space-x-1 rtl:space-x-reverse",children:[e.jsx("li",{children:e.jsx("button",{onClick:()=>We(F.page-1),disabled:F.page<=1,className:"flex justify-center font-semibold p-2 rounded-full transition bg-white-light text-dark hover:text-white hover:bg-primary dark:text-white-light dark:bg-[#191e3a] dark:hover:bg-primary disabled:opacity-50",children:"«"})}),Array.from({length:Math.min(F.pages,5)},(d,N)=>{let $;return F.pages<=5||F.page<=3?$=N+1:F.page>=F.pages-2?$=F.pages-4+N:$=F.page-2+N,e.jsx("li",{children:e.jsx("button",{onClick:()=>We($),className:`flex justify-center font-semibold px-3.5 py-2 rounded-full transition ${$===F.page?"bg-primary text-white dark:bg-primary dark:text-white-light":"bg-white-light text-dark hover:text-white hover:bg-primary dark:text-white-light dark:bg-[#191e3a] dark:hover:bg-primary"}`,children:$})},$)}),e.jsx("li",{children:e.jsx("button",{onClick:()=>We(F.page+1),disabled:F.page>=F.pages,className:"flex justify-center font-semibold p-2 rounded-full transition bg-white-light text-dark hover:text-white hover:bg-primary dark:text-white-light dark:bg-[#191e3a] dark:hover:bg-primary disabled:opacity-50",children:"»"})})]})})]})]})})]}),U.size>0&&e.jsxs("div",{className:"bulk-action-bar",style:{position:"fixed",bottom:"24px",left:"50%",transform:"translateX(-50%)",zIndex:99999,display:"flex",alignItems:"center",gap:"12px",padding:"10px 20px",borderRadius:"14px",background:"linear-gradient(135deg, #1b2e4b 0%, #0e1726 100%)",boxShadow:"0 8px 32px rgba(0,0,0,0.3), 0 0 0 1px rgba(67,97,238,0.2)",animation:"bulkBarSlideUp 0.3s cubic-bezier(0.16,1,0.3,1)",backdropFilter:"blur(12px)"},children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"8px"},children:[e.jsx("div",{style:{width:28,height:28,borderRadius:"8px",background:"rgba(67,97,238,0.2)",color:"#4361ee",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"12px",fontWeight:700},children:U.size}),e.jsxs("span",{style:{color:"#e0e6ed",fontSize:"13px",fontWeight:500,whiteSpace:"nowrap"},children:["sélectionné",U.size>1?"s":""]})]}),e.jsx("div",{style:{width:1,height:24,background:"rgba(255,255,255,0.1)"}}),U.size<c.length&&e.jsxs("button",{onClick:ct,style:{padding:"6px 12px",borderRadius:"8px",border:"1px solid rgba(67,97,238,0.3)",background:"rgba(67,97,238,0.1)",color:"#93b4fd",fontSize:"12px",fontWeight:600,cursor:"pointer",transition:"all 0.15s",whiteSpace:"nowrap"},onMouseEnter:d=>{d.target.style.background="rgba(67,97,238,0.2)",d.target.style.color="#b8cffe"},onMouseLeave:d=>{d.target.style.background="rgba(67,97,238,0.1)",d.target.style.color="#93b4fd"},children:["Tout sélectionner (",c.length,")"]}),e.jsx("div",{style:{width:1,height:24,background:"rgba(255,255,255,0.1)"}}),e.jsxs("button",{onClick:ft,disabled:M,style:{display:"flex",alignItems:"center",gap:"6px",padding:"6px 14px",borderRadius:"8px",border:"none",background:"rgba(231,81,90,0.15)",color:"#ff6b6b",fontSize:"12px",fontWeight:600,cursor:M?"wait":"pointer",transition:"all 0.15s",whiteSpace:"nowrap",opacity:M?.6:1},onMouseEnter:d=>{M||(d.target.style.background="rgba(231,81,90,0.25)",d.target.style.color="#ff8a8a")},onMouseLeave:d=>{d.target.style.background="rgba(231,81,90,0.15)",d.target.style.color="#ff6b6b"},children:[e.jsxs("svg",{viewBox:"0 0 24 24",fill:"none",style:{width:14,height:14},children:[e.jsx("path",{d:"M20.5 6H3.5",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"}),e.jsx("path",{d:"M18.833 8.5L18.373 15.4C18.196 18.054 18.108 19.381 17.243 20.19C16.378 21 15.048 21 12.387 21H11.613C8.952 21 7.622 21 6.757 20.19C5.892 19.381 5.804 18.054 5.627 15.4L5.167 8.5",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"})]}),M?"Suppression...":"Supprimer"]}),e.jsx("div",{style:{width:1,height:24,background:"rgba(255,255,255,0.1)"}}),e.jsx("button",{onClick:ut,style:{width:28,height:28,borderRadius:"8px",border:"none",background:"rgba(255,255,255,0.08)",color:"#888ea8",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",transition:"all 0.15s"},onMouseEnter:d=>{d.target.style.background="rgba(255,255,255,0.15)",d.target.style.color="#e0e6ed"},onMouseLeave:d=>{d.target.style.background="rgba(255,255,255,0.08)",d.target.style.color="#888ea8"},title:"Désélectionner tout",children:e.jsx("svg",{viewBox:"0 0 24 24",fill:"none",style:{width:14,height:14},children:e.jsx("path",{d:"M18 6L6 18M6 6L18 18",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round"})})})]}),b&&e.jsxs("div",{style:{position:"fixed",bottom:U.size>0?"80px":"24px",right:"24px",zIndex:99999,padding:"10px 20px",borderRadius:"10px",fontSize:"13px",fontWeight:500,color:"#fff",background:b.type==="error"?"#e7515a":"#00ab55",boxShadow:"0 4px 20px rgba(0,0,0,0.15)",animation:"toastSlideIn 0.25s ease-out",display:"flex",alignItems:"center",gap:"8px",transition:"bottom 0.3s ease"},children:[e.jsx("svg",{viewBox:"0 0 24 24",fill:"none",style:{width:16,height:16,flexShrink:0},children:b.type==="error"?e.jsx("path",{d:"M12 8V12M12 16H12.01M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"}):e.jsx("path",{d:"M5 13L9 17L19 7",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round"})}),b.message]}),e.jsx("style",{children:`
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
            `})]})}function st(){document.querySelectorAll('[data-island="records-grid"]').forEach(t=>{if(t.dataset.mounted==="1")return;t.dataset.mounted="1";const s={accountId:t.dataset.accountId,accountNumber:t.dataset.accountNumber,entityId:t.dataset.entityId,viewId:t.dataset.viewId,entityName:t.dataset.entityName||"Records",entityNamePlural:t.dataset.entityNamePlural||"",entitySlug:t.dataset.entitySlug||"records"};console.log("[RecordsGrid Island] Mounting:",s),gt(t).render(e.jsx(Re.StrictMode,{children:e.jsx(kr,{...s})}))})}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",st):st();
