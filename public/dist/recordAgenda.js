import{j as e,r as i,c as de,R as ce}from"./chunks/client-CkWOIrXP.js";function pe({viewMode:t,onViewChange:u,onNewEvent:o,eventCount:p}){const m=[{key:"calendar",icon:"M3 4h18M3 10h18M3 16h18",label:"Calendrier"},{key:"timeline",icon:"M12 2v20M2 12h20",label:"Timeline"},{key:"list",icon:"M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01",label:"Liste"}];return e.jsxs("div",{className:"ra-toolbar",children:[e.jsx("style",{children:fe()}),e.jsx("div",{className:"ra-toolbar-left",children:e.jsxs("div",{className:"ra-view-pills",children:[m.map(c=>e.jsxs("button",{className:`ra-vpill ${t===c.key?"active":""}`,onClick:()=>u(c.key),children:[e.jsx("svg",{width:"14",height:"14",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",children:e.jsx("path",{d:c.icon})}),c.label]},c.key)),e.jsx("span",{className:"ra-vpill-count",children:p})]})}),e.jsx("div",{className:"ra-toolbar-right",children:e.jsxs("button",{className:"ra-new-event-btn",onClick:o,children:[e.jsxs("svg",{width:"16",height:"16",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2.5",children:[e.jsx("line",{x1:"12",y1:"5",x2:"12",y2:"19"}),e.jsx("line",{x1:"5",y1:"12",x2:"19",y2:"12"})]}),"Nouvel événement"]})})]})}function fe(){return`
.ra-toolbar {
    display:flex; align-items:center; justify-content:space-between;
    gap:12px; margin-bottom:12px; flex-shrink:0;
}

.ra-toolbar-left { display:flex; align-items:center; gap:12px; }
.ra-toolbar-right { display:flex; align-items:center; gap:8px; }

.ra-view-pills {
    display:flex; gap:2px; align-items:center;
    padding:3px; background:#f1f5f9; border-radius:10px; border:1px solid #e2e8f0;
}
.dark .ra-view-pills { background:#1b2e4b; border-color:#253b5c; }

.ra-vpill {
    display:flex; align-items:center; gap:5px; padding:6px 12px;
    border:none; border-radius:8px; font-size:12px; font-weight:600;
    color:#6b7280; background:transparent; cursor:pointer;
    transition:all .2s; font-family:'Nunito',sans-serif; white-space:nowrap;
}
.ra-vpill:hover { color:#374151; background:rgba(0,0,0,.04); }
.dark .ra-vpill { color:#888da8; }
.dark .ra-vpill:hover { color:#e0e6ed; background:rgba(255,255,255,.04); }
.ra-vpill.active {
    background:#fff; color:#14b8a6; box-shadow:0 1px 3px rgba(0,0,0,.08);
}
.dark .ra-vpill.active { background:#0e1726; color:#14b8a6; }

.ra-vpill-count {
    display:inline-flex; align-items:center; justify-content:center;
    min-width:22px; height:22px; padding:0 6px;
    border-radius:11px; font-size:11px; font-weight:700;
    background:rgba(20,184,166,.1); color:#14b8a6;
}

.ra-new-event-btn {
    display:inline-flex; align-items:center; gap:8px; padding:8px 18px;
    background:linear-gradient(135deg, #14b8a6, #14b8a6dd);
    color:#fff; border:none; border-radius:10px; font-size:13px; font-weight:600;
    cursor:pointer; transition:all .2s; font-family:'Nunito',sans-serif;
}
.ra-new-event-btn:hover { transform:translateY(-1px); box-shadow:0 4px 12px rgba(20,184,166,.3); }
@media(max-width:640px){
    .ra-toolbar { align-items:stretch; flex-direction:column; }
    .ra-toolbar-left,
    .ra-toolbar-right { width:100%; min-width:0; }
    .ra-view-pills { width:100%; overflow-x:auto; }
    .ra-vpill { padding:6px 10px; }
    .ra-new-event-btn { width:100%; justify-content:center; padding-left:12px; padding-right:12px; }
}
`}const ue=[{value:"consultation",label:"Consultation",color:"#4361ee"},{value:"reunion",label:"Réunion",color:"#8b5cf6"},{value:"rappel",label:"Rappel",color:"#f59e0b"},{value:"tache",label:"Tâche",color:"#10b981"},{value:"personnel",label:"Personnel",color:"#ec4899"},{value:"autre",label:"Autre",color:"#6b7280"}],xe=[{label:"Important",value:"Important",color:"#ef4444"},{label:"Date limite",value:"Date limite",color:"#f59e0b"},{label:"Risque amende",value:"Risque amende",color:"#dc2626"}],q="#64748b",he="widget_prochains_evenements",me="widget_date_importante";function ge({isOpen:t,onClose:u,event:o,entityData:p,prefillDate:m,onCreate:c,onUpdate:A,onDelete:O,getCustomFieldValue:C,getStatusInfo:$,accountNumber:g}){var L,Y;const[a,s]=i.useState({title:"",date:"",endDate:"",duration:30,type:"consultation",tags:[],lieu:"",notes:"",statusOptionId:"",showInUpcomingWidget:!0,isImportantDate:!1}),[w,N]=i.useState(!1),[S,l]=i.useState(""),[I,x]=i.useState([]),k=!!o;i.useEffect(()=>{var r,P,D,U,F;if(t)if(l(""),x([]),o){$(o);const T=(o.classificationValues||[]).find(z=>{var G,X,K;return((G=z.classificationId)==null?void 0:G.toString())===((K=(X=p==null?void 0:p.statusClassification)==null?void 0:X._id)==null?void 0:K.toString())}),W=Q(C(o,"tags_evenement"));s({title:o.title||"",date:o.date?Z(new Date(o.date)):"",endDate:o.end_date?Z(new Date(o.end_date)):"",duration:C(o,"duree_evenement")||30,type:C(o,"type_evenement")||"consultation",tags:W,lieu:C(o,"lieu_evenement")||"",notes:C(o,"notes_evenement")||"",statusOptionId:((r=T==null?void 0:T.optionId)==null?void 0:r.toString())||"",showInUpcomingWidget:oe(C(o,he),!0),isImportantDate:oe(C(o,me),W.some(z=>z.toLowerCase()==="date importante"))})}else{let T="";if(m){const z=new Date(m);isNaN(z.getTime())?T=m+"T09:00":(z.setMinutes(Math.round(z.getMinutes()/5)*5,0,0),T=Z(z))}else{const z=new Date;z.setMinutes(Math.ceil(z.getMinutes()/5)*5,0,0),T=Z(z)}const W=((F=(U=(D=(P=p==null?void 0:p.statusClassification)==null?void 0:P.options)==null?void 0:D[0])==null?void 0:U._id)==null?void 0:F.toString())||"";s({title:"",date:T,endDate:"",duration:30,type:"consultation",tags:[],lieu:"",notes:"",statusOptionId:W,showInUpcomingWidget:!0,isImportantDate:!1})}},[t,o,m,p,C,$]);const j=i.useCallback((r,P)=>{l(""),s(D=>({...D,[r]:P}))},[]),H=i.useCallback(async()=>{if(a.title.trim()){N(!0),l("");try{const r=ie(a.date,"Date");let P=a.endDate?ie(a.endDate,"Date de fin").toISOString():void 0;!P&&r&&a.duration&&(P=new Date(r.getTime()+(parseInt(a.duration)||30)*6e4).toISOString());const D={title:a.title.trim(),date:r?r.toISOString():void 0,endDate:P,duration:parseInt(a.duration)||30,type:a.type,tags:Q(a.tags),lieu:a.lieu,notes:a.notes,statusOptionId:a.statusOptionId||void 0,showInUpcomingWidget:!!a.showInUpcomingWidget,isImportantDate:!!a.isImportantDate};k?await A(o._id.toString(),D):await c(D)}catch(r){console.error("[EventModal] Save error:",r),l(r.message||"Impossible d'enregistrer cet evenement.")}finally{N(!1)}}},[a,k,o,c,A]);if(!t)return null;const n=((L=p==null?void 0:p.statusClassification)==null?void 0:L.options)||[],h=we(p),R=ee([xe,((Y=h==null?void 0:h.type_config)==null?void 0:Y.options)||[],I,Q(a.tags).map(r=>({label:r,value:r}))]),_=async r=>{var W,z;const P={label:r,value:r,color:q},D=((z=(W=h==null?void 0:h._id)==null?void 0:W.toString)==null?void 0:z.call(W))||(h==null?void 0:h._id);if(!g||!D)return x(G=>ee([G,[P]])),P;const U=await fetch(`/account/${g}/field-template/api/${D}/add-option`,{method:"POST",headers:{"Content-Type":"application/json"},credentials:"include",body:JSON.stringify(P)}),F=await U.json().catch(()=>({}));if(!U.ok||!F.success)throw new Error(F.error||"Création impossible");const T=re(F.option||P);return x(G=>ee([G,[T]])),T};return e.jsxs("div",{className:"ra-modal-overlay",onClick:u,children:[e.jsxs("div",{className:"ra-modal",onClick:r=>r.stopPropagation(),children:[e.jsxs("div",{className:"ra-modal-header",children:[e.jsxs("div",{className:"ra-modal-header-left",children:[e.jsx("div",{className:"ra-modal-icon",children:e.jsxs("svg",{width:"18",height:"18",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",children:[e.jsx("rect",{x:"3",y:"4",width:"18",height:"18",rx:"2",ry:"2"}),e.jsx("line",{x1:"16",y1:"2",x2:"16",y2:"6"}),e.jsx("line",{x1:"8",y1:"2",x2:"8",y2:"6"}),e.jsx("line",{x1:"3",y1:"10",x2:"21",y2:"10"})]})}),e.jsx("h3",{children:k?"Modifier l'événement":"Nouvel événement"})]}),e.jsx("button",{className:"ra-modal-close",onClick:u,children:e.jsxs("svg",{width:"16",height:"16",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",children:[e.jsx("line",{x1:"18",y1:"6",x2:"6",y2:"18"}),e.jsx("line",{x1:"6",y1:"6",x2:"18",y2:"18"})]})})]}),e.jsxs("div",{className:"ra-modal-body",children:[e.jsxs("div",{className:"ra-field",children:[e.jsx("label",{className:"ra-label",children:"Titre"}),e.jsx("input",{type:"text",className:"ra-input",placeholder:"Ex: Consultation de suivi...",value:a.title,onChange:r=>j("title",r.target.value),autoFocus:!0})]}),e.jsxs("div",{className:"ra-field-row",children:[e.jsxs("div",{className:"ra-field",style:{flex:1},children:[e.jsx("label",{className:"ra-label",children:"Date & heure"}),e.jsx("input",{type:"datetime-local",className:"ra-input",step:"300",value:a.date,onChange:r=>j("date",r.target.value)})]}),e.jsxs("div",{className:"ra-field",style:{width:100},children:[e.jsx("label",{className:"ra-label",children:"Durée (min)"}),e.jsx("input",{type:"number",className:"ra-input",value:a.duration,onChange:r=>j("duration",r.target.value),min:"5",max:"480",step:"5"})]})]}),e.jsx("div",{className:"ra-field-row",children:e.jsxs("div",{className:"ra-field",style:{flex:1},children:[e.jsx("label",{className:"ra-label",children:"Type"}),e.jsx("div",{className:"ra-type-pills",children:ue.map(r=>e.jsxs("button",{className:`ra-type-pill ${a.type===r.value?"active":""}`,style:{"--pill-c":r.color,background:a.type===r.value?`${r.color}15`:void 0,borderColor:a.type===r.value?`${r.color}40`:void 0,color:a.type===r.value?r.color:void 0},onClick:()=>j("type",r.value),type:"button",children:[e.jsx("span",{className:"ra-pill-dot",style:{background:r.color}}),r.label]},r.value))})]})}),n.length>0&&e.jsxs("div",{className:"ra-field",children:[e.jsx("label",{className:"ra-label",children:"Statut"}),e.jsx("div",{className:"ra-status-pills",children:n.map(r=>e.jsxs("button",{className:`ra-status-pill ${a.statusOptionId===r._id.toString()?"active":""}`,style:{"--st-c":r.color,background:a.statusOptionId===r._id.toString()?`${r.color}15`:void 0,borderColor:a.statusOptionId===r._id.toString()?r.color:void 0,color:a.statusOptionId===r._id.toString()?r.color:void 0},onClick:()=>j("statusOptionId",r._id.toString()),type:"button",children:[e.jsx("span",{className:"ra-pill-dot",style:{background:r.color}}),r.label]},r._id.toString()))})]}),e.jsxs("div",{className:"ra-field",children:[e.jsx("label",{className:"ra-label",children:"Étiquettes"}),e.jsx(be,{value:a.tags,options:R,onChange:r=>j("tags",r),onCreateOption:_})]}),e.jsxs("div",{className:"ra-field",children:[e.jsx("label",{className:"ra-label",children:"Widget"}),e.jsxs("div",{className:"ra-widget-switches",children:[e.jsxs("label",{className:`ra-widget-switch ${a.showInUpcomingWidget?"active":""}`,children:[e.jsxs("span",{className:"ra-widget-switch-copy",children:[e.jsx("strong",{children:"Prochains événements"}),e.jsx("small",{children:"Afficher dans le widget agenda"})]}),e.jsxs("span",{className:"ra-switch",children:[e.jsx("input",{type:"checkbox",checked:!!a.showInUpcomingWidget,onChange:r=>j("showInUpcomingWidget",r.target.checked)}),e.jsx("span",{})]})]}),e.jsxs("label",{className:`ra-widget-switch ${a.isImportantDate?"active":""}`,children:[e.jsxs("span",{className:"ra-widget-switch-copy",children:[e.jsx("strong",{children:"Date importante"}),e.jsx("small",{children:"Afficher dans le widget dates importantes"})]}),e.jsxs("span",{className:"ra-switch",children:[e.jsx("input",{type:"checkbox",checked:!!a.isImportantDate,onChange:r=>j("isImportantDate",r.target.checked)}),e.jsx("span",{})]})]})]})]}),e.jsxs("div",{className:"ra-field",children:[e.jsx("label",{className:"ra-label",children:"Lieu"}),e.jsx("input",{type:"text",className:"ra-input",placeholder:"Cabinet, Salle A, Domicile...",value:a.lieu,onChange:r=>j("lieu",r.target.value)})]}),e.jsxs("div",{className:"ra-field",children:[e.jsx("label",{className:"ra-label",children:"Notes"}),e.jsx("textarea",{className:"ra-input ra-textarea",placeholder:"Notes additionnelles...",rows:3,value:a.notes,onChange:r=>j("notes",r.target.value)})]}),S&&e.jsx("div",{className:"ra-modal-error",role:"alert",children:S})]}),e.jsxs("div",{className:"ra-modal-footer",children:[k&&e.jsxs("button",{className:"ra-delete-btn",onClick:()=>O(o._id.toString()),type:"button",children:[e.jsxs("svg",{width:"14",height:"14",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",children:[e.jsx("polyline",{points:"3 6 5 6 21 6"}),e.jsx("path",{d:"M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"})]}),"Supprimer"]}),e.jsxs("div",{className:"ra-modal-footer-right",children:[e.jsx("button",{className:"ra-cancel-btn",onClick:u,type:"button",children:"Annuler"}),e.jsx("button",{className:"ra-save-btn",onClick:H,disabled:w||!a.title.trim(),type:"button",children:w?"Enregistrement...":k?"Mettre à jour":"Créer"})]})]})]}),e.jsx("style",{children:ye()})]})}function be({value:t,options:u,onChange:o,onCreateOption:p}){const[m,c]=i.useState(""),[A,O]=i.useState(!1),[C,$]=i.useState(!1),g=i.useRef(null),a=i.useRef(null),s=i.useMemo(()=>Q(t),[t]),w=i.useMemo(()=>ee([u,s.map(n=>({label:n,value:n}))]),[u,s]),N=i.useMemo(()=>s.map(n=>w.find(h=>se(h,n))||{label:n,value:n,color:q}),[w,s]),S=m.trim().toLowerCase(),l=i.useMemo(()=>w.filter(n=>!s.some(h=>se(n,h))).filter(n=>S?String(n.label||"").toLowerCase().includes(S)||String(n.value||"").toLowerCase().includes(S):!0).slice(0,8),[w,s,S]),I=i.useMemo(()=>S?w.some(n=>String(n.label||"").trim().toLowerCase()===S||String(n.value||"").trim().toLowerCase()===S):!1,[w,S]);i.useEffect(()=>{const n=h=>{!g.current||g.current.contains(h.target)||(O(!1),c(""))};return document.addEventListener("mousedown",n),()=>document.removeEventListener("mousedown",n)},[]);const x=i.useCallback(n=>{const h=re(n);if(!h.value)return;s.some(_=>_.toLowerCase()===String(h.value).toLowerCase())||o([...s,h.value]),c(""),O(!0),requestAnimationFrame(()=>{var _;return(_=a.current)==null?void 0:_.focus()})},[o,s]),k=i.useCallback(n=>{o(s.filter(h=>h.toLowerCase()!==String(n).toLowerCase())),requestAnimationFrame(()=>{var h;return(h=a.current)==null?void 0:h.focus()})},[o,s]),j=i.useCallback(async()=>{const n=m.trim();if(!(!n||I||C)){$(!0);try{const h=await p(n);x(h||{label:n,value:n})}catch(h){console.error("[EventTags] Create option error:",h),window.showMessage?window.showMessage(h.message||"Création impossible","danger"):alert(h.message||"Création impossible")}finally{$(!1)}}},[x,C,I,p,m]),H=n=>{n.key==="Enter"?(n.preventDefault(),l.length>0?x(l[0]):j()):n.key==="Backspace"&&!m&&s.length>0?k(s[s.length-1]):n.key==="Escape"&&(O(!1),c(""))};return e.jsxs("div",{className:"ra-tag-ms",ref:g,children:[e.jsxs("div",{className:`ra-tag-ms-control ${A?"open":""}`,onClick:()=>{var n;O(!0),(n=a.current)==null||n.focus()},children:[N.map(n=>e.jsxs("span",{className:"ra-tag-ms-pill",style:{"--tag-c":n.color||q,background:`${n.color||q}12`,borderColor:`${n.color||q}35`,color:n.color||q},children:[n.label,e.jsx("button",{type:"button",onClick:h=>{h.stopPropagation(),k(n.value)},"aria-label":`Retirer ${n.label}`,children:"×"})]},n.value)),e.jsx("input",{ref:a,className:"ra-tag-ms-input",value:m,onChange:n=>{c(n.target.value),O(!0)},onFocus:()=>O(!0),onKeyDown:H,placeholder:N.length?"Ajouter...":"Important, Date limite..."})]}),A&&(l.length>0||m.trim()&&!I)&&e.jsxs("div",{className:"ra-tag-ms-menu",children:[l.map(n=>e.jsxs("button",{type:"button",className:"ra-tag-ms-option",onClick:()=>x(n),children:[e.jsx("span",{className:"ra-tag-ms-dot",style:{background:n.color||q}}),e.jsx("span",{children:n.label})]},n.value)),m.trim()&&!I&&e.jsxs("button",{type:"button",className:"ra-tag-ms-create",onClick:j,disabled:C,children:[e.jsx("span",{children:"+"}),C?"Création...":`Créer "${m.trim()}"`]})]})]})}function we(t){return((t==null?void 0:t.customFields)||[]).find(u=>(u==null?void 0:u.name)==="tags_evenement")||null}function oe(t,u=!1){if(t==null||t==="")return u;if(typeof t=="boolean")return t;if(typeof t=="number")return t!==0;const o=String(t).trim().toLowerCase();return["true","1","yes","oui","on"].includes(o)?!0:["false","0","no","non","off"].includes(o)?!1:u}function Q(t){return(Array.isArray(t)?t:typeof t=="string"?t.split(","):[]).map(o=>String(o||"").trim()).filter(Boolean).filter((o,p,m)=>m.findIndex(c=>c.toLowerCase()===o.toLowerCase())===p)}function re(t){if(typeof t=="object"&&t){const o=String(t.label||t.value||"").trim(),p=String(t.value||t.label||"").trim();return{label:o,value:p,color:t.color||q}}const u=String(t||"").trim();return{label:u,value:u,color:q}}function se(t,u){const o=String(u||"").trim().toLowerCase();return[t.value,t.label].filter(p=>p!=null).some(p=>String(p).trim().toLowerCase()===o)}function ee(t){const u=[],o=new Set;return t.flat().forEach(p=>{const m=re(p);if(!m.value)return;const c=m.value.toLowerCase();o.has(c)||(o.add(c),u.push(m))}),u}function Z(t){const u=t.getFullYear(),o=String(t.getMonth()+1).padStart(2,"0"),p=String(t.getDate()).padStart(2,"0"),m=String(t.getHours()).padStart(2,"0"),c=String(t.getMinutes()).padStart(2,"0");return`${u}-${o}-${p}T${m}:${c}`}function ie(t,u){if(!t)return null;const o=new Date(t);if(Number.isNaN(o.getTime()))throw new Error(`${u} invalide.`);return o}function ye(){return`
.ra-modal-overlay {
    position:fixed; inset:0; z-index:9999;
    background:rgba(0,0,0,.25);
    backdrop-filter:blur(4px); -webkit-backdrop-filter:blur(4px);
    display:flex; align-items:center; justify-content:center;
    animation:raFadeIn .2s ease;
}
.ra-modal {
    background:#fff; border-radius:16px;
    box-shadow:0 20px 60px rgba(0,0,0,.15);
    width:520px; max-width:calc(100vw - 40px);
    max-height:calc(100vh - 40px); overflow-y:auto;
    animation:raSlideUp .3s ease;
}
.dark .ra-modal { background:#0e1726; border:1px solid #253b5c; }

@keyframes raSlideUp {
    from { opacity:0; transform:translateY(20px); }
    to { opacity:1; transform:translateY(0); }
}

.ra-modal-header {
    display:flex; align-items:center; justify-content:space-between;
    padding:20px 24px 0;
}
.ra-modal-header-left { display:flex; align-items:center; gap:10px; }
.ra-modal-icon {
    width:36px; height:36px; border-radius:10px;
    display:flex; align-items:center; justify-content:center;
    background:linear-gradient(135deg, #14b8a618, #14b8a608);
    color:#14b8a6;
}
.ra-modal-header h3 { font-size:16px; font-weight:700; color:#0e1726; margin:0; }
.dark .ra-modal-header h3 { color:#e0e6ed; }

.ra-modal-close {
    width:32px; height:32px; border:none; border-radius:8px;
    background:transparent; color:#9ca3af; cursor:pointer;
    display:flex; align-items:center; justify-content:center;
    transition:all .15s;
}
.ra-modal-close:hover { background:#f1f5f9; color:#374151; }
.dark .ra-modal-close:hover { background:#1b2e4b; color:#e0e6ed; }

.ra-modal-body { padding:20px 24px; display:flex; flex-direction:column; gap:16px; }

.ra-field { display:flex; flex-direction:column; gap:6px; }
.ra-field-row { display:flex; gap:12px; }

.ra-label { font-size:12px; font-weight:700; color:#6b7280; text-transform:uppercase; letter-spacing:.04em; }
.dark .ra-label { color:#506690; }

.ra-input {
    width:100%; padding:9px 12px; border:1.5px solid #e2e8f0;
    border-radius:8px; font-size:13px; color:#0e1726;
    background:#fff; font-family:inherit; outline:none;
    transition:border-color .2s, box-shadow .2s;
    box-sizing:border-box;
}
.ra-input:focus { border-color:#14b8a6; box-shadow:0 0 0 3px rgba(20,184,166,.08); }
.dark .ra-input { background:#1b2e4b; border-color:#253b5c; color:#e0e6ed; }
.dark .ra-input:focus { border-color:#14b8a6; }
.ra-textarea { resize:vertical; min-height:60px; line-height:1.45; }

.ra-tag-ms { position:relative; }
.ra-tag-ms-control {
    min-height:42px; width:100%; padding:6px 8px;
    border:1.5px solid #e2e8f0; border-radius:8px;
    background:#fff; display:flex; align-items:center; flex-wrap:wrap; gap:6px;
    cursor:text; transition:border-color .2s, box-shadow .2s; box-sizing:border-box;
}
.ra-tag-ms-control.open {
    border-color:#14b8a6;
    box-shadow:0 0 0 3px rgba(20,184,166,.08);
}
.dark .ra-tag-ms-control { background:#1b2e4b; border-color:#253b5c; }
.dark .ra-tag-ms-control.open { border-color:#14b8a6; }
.ra-tag-ms-pill {
    display:inline-flex; align-items:center; gap:5px;
    min-height:25px; padding:3px 8px; border:1px solid;
    border-radius:7px; font-size:12px; font-weight:700; line-height:1.2;
}
.ra-tag-ms-pill button {
    width:16px; height:16px; border:0; border-radius:50%;
    background:transparent; color:inherit; cursor:pointer;
    display:flex; align-items:center; justify-content:center;
    font-size:14px; line-height:1; opacity:.65; padding:0;
}
.ra-tag-ms-pill button:hover { opacity:1; background:rgba(15,23,42,.08); }
.ra-tag-ms-input {
    flex:1; min-width:130px; border:0; outline:0; background:transparent;
    color:#0e1726; font-size:13px; font-family:inherit; padding:4px 3px;
}
.ra-tag-ms-input::placeholder { color:#9ca3af; }
.dark .ra-tag-ms-input { color:#e0e6ed; }
.ra-tag-ms-menu {
    position:absolute; left:0; right:0; top:calc(100% + 5px); z-index:20;
    background:#fff; border:1px solid #e2e8f0; border-radius:10px;
    box-shadow:0 16px 42px rgba(15,23,42,.14);
    padding:5px; max-height:210px; overflow-y:auto;
}
.dark .ra-tag-ms-menu { background:#0e1726; border-color:#253b5c; box-shadow:0 16px 42px rgba(0,0,0,.32); }
.ra-tag-ms-option,
.ra-tag-ms-create {
    width:100%; border:0; background:transparent; border-radius:8px;
    display:flex; align-items:center; gap:8px; padding:8px 9px;
    color:#334155; font-size:12.5px; font-weight:700;
    cursor:pointer; text-align:left; font-family:inherit;
}
.ra-tag-ms-option:hover,
.ra-tag-ms-create:hover { background:#f8fafc; }
.dark .ra-tag-ms-option,
.dark .ra-tag-ms-create { color:#e0e6ed; }
.dark .ra-tag-ms-option:hover,
.dark .ra-tag-ms-create:hover { background:#1b2e4b; }
.ra-tag-ms-dot { width:8px; height:8px; border-radius:50%; flex:none; }
.ra-tag-ms-create { color:#14b8a6; border-top:1px solid #f1f5f9; margin-top:3px; }
.dark .ra-tag-ms-create { border-top-color:#253b5c; }
.ra-tag-ms-create span {
    width:18px; height:18px; border-radius:6px; background:rgba(20,184,166,.12);
    display:flex; align-items:center; justify-content:center; font-size:14px; font-weight:800;
}
.ra-tag-ms-create:disabled { opacity:.6; cursor:wait; }

.ra-widget-switches { display:grid; grid-template-columns:1fr 1fr; gap:10px; }
.ra-widget-switch {
    display:flex; align-items:center; justify-content:space-between; gap:12px;
    min-width:0; padding:11px 12px; border:1.5px solid #e2e8f0;
    border-radius:10px; background:#fff; cursor:pointer; transition:all .18s;
}
.ra-widget-switch:hover { border-color:#cbd5e1; background:#fbfdff; }
.ra-widget-switch.active { border-color:#14b8a655; background:rgba(20,184,166,.05); }
.dark .ra-widget-switch { background:#1b2e4b; border-color:#253b5c; }
.dark .ra-widget-switch:hover { border-color:#3b4f6f; }
.dark .ra-widget-switch.active { border-color:#14b8a6; background:rgba(20,184,166,.12); }
.ra-widget-switch-copy { display:flex; flex-direction:column; gap:2px; min-width:0; }
.ra-widget-switch-copy strong {
    font-size:12.5px; line-height:1.2; color:#0f172a; font-weight:800;
    white-space:nowrap; overflow:hidden; text-overflow:ellipsis;
}
.ra-widget-switch-copy small {
    font-size:10.5px; line-height:1.25; color:#94a3b8; font-weight:600;
    white-space:nowrap; overflow:hidden; text-overflow:ellipsis;
}
.dark .ra-widget-switch-copy strong { color:#e0e6ed; }
.dark .ra-widget-switch-copy small { color:#64748b; }
.ra-switch { position:relative; width:38px; height:22px; flex:none; }
.ra-switch input { position:absolute; inset:0; opacity:0; cursor:pointer; z-index:2; }
.ra-switch span {
    position:absolute; inset:0; border-radius:999px; background:#cbd5e1;
    transition:background .18s;
}
.ra-switch span::before {
    content:''; position:absolute; width:16px; height:16px; left:3px; top:3px;
    border-radius:999px; background:#fff; box-shadow:0 1px 4px rgba(15,23,42,.2);
    transition:transform .18s;
}
.ra-switch input:checked + span { background:#14b8a6; }
.ra-switch input:checked + span::before { transform:translateX(16px); }
.dark .ra-switch span { background:#506690; }

.ra-modal-error {
    padding:10px 12px; border-radius:9px;
    border:1px solid #fecaca; background:#fff7f7; color:#b91c1c;
    font-size:12px; font-weight:700; line-height:1.4;
}
.dark .ra-modal-error { background:rgba(127,29,29,.18); border-color:#7f1d1d; color:#fecaca; }

.ra-type-pills, .ra-status-pills { display:flex; flex-wrap:wrap; gap:6px; }

.ra-type-pill, .ra-status-pill {
    display:inline-flex; align-items:center; gap:5px;
    padding:5px 12px; border-radius:7px;
    border:1.5px solid #e2e8f0; background:#fff;
    font-size:12px; font-weight:600; color:#6b7280;
    cursor:pointer; transition:all .2s; font-family:inherit;
}
.ra-type-pill:hover, .ra-status-pill:hover { border-color:#d1d5db; }
.dark .ra-type-pill, .dark .ra-status-pill {
    background:#1b2e4b; border-color:#253b5c; color:#888da8;
}

.ra-pill-dot { width:8px; height:8px; border-radius:50%; flex-shrink:0; }

.ra-modal-footer {
    display:flex; align-items:center; justify-content:space-between;
    padding:16px 24px 20px; gap:12px;
}
.ra-modal-footer-right { display:flex; gap:8px; margin-left:auto; }

.ra-cancel-btn {
    padding:9px 18px; border:1.5px solid #e2e8f0; border-radius:8px;
    background:#fff; color:#6b7280; font-size:13px; font-weight:600;
    cursor:pointer; transition:all .15s; font-family:inherit;
}
.ra-cancel-btn:hover { background:#f9fafb; border-color:#d1d5db; }
.dark .ra-cancel-btn { background:#1b2e4b; border-color:#253b5c; color:#888da8; }

.ra-save-btn {
    padding:9px 20px; border:none; border-radius:8px;
    background:linear-gradient(135deg, #14b8a6, #14b8a6dd);
    color:#fff; font-size:13px; font-weight:600;
    cursor:pointer; transition:all .15s; font-family:inherit;
}
.ra-save-btn:hover { transform:translateY(-1px); box-shadow:0 4px 12px rgba(20,184,166,.3); }
.ra-save-btn:disabled { opacity:.5; cursor:not-allowed; transform:none; box-shadow:none; }

.ra-delete-btn {
    display:inline-flex; align-items:center; gap:6px;
    padding:9px 16px; border:1.5px solid #fecaca; border-radius:8px;
    background:#fff; color:#ef4444; font-size:12px; font-weight:600;
    cursor:pointer; transition:all .15s; font-family:inherit;
}
.ra-delete-btn:hover { background:#fef2f2; border-color:#ef4444; }
.dark .ra-delete-btn { background:#1b2e4b; border-color:#7f1d1d; }

@media(max-width:560px) {
    .ra-widget-switches { grid-template-columns:1fr; }
}
`}function ve({events:t,entityData:u,onEventClick:o,getStatusInfo:p,getCustomFieldValue:m}){const c=i.useMemo(()=>{const g=[...t].sort((s,w)=>{const N=s.date?new Date(s.date).getTime():0,S=w.date?new Date(w.date).getTime():0;return N-S}),a={};return g.forEach(s=>{const N=(s.date?new Date(s.date):new Date).toISOString().split("T")[0];a[N]||(a[N]=[]),a[N].push(s)}),Object.entries(a).map(([s,w])=>({dateKey:s,date:new Date(s),items:w}))},[t]),A=g=>{const a=new Date,s=new Date(a);s.setDate(s.getDate()+1);const w=new Date(a);w.setDate(w.getDate()-1);const N=g.toISOString().split("T")[0];return N===a.toISOString().split("T")[0]?"Aujourd'hui":N===s.toISOString().split("T")[0]?"Demain":N===w.toISOString().split("T")[0]?"Hier":g.toLocaleDateString("fr-FR",{weekday:"long",day:"numeric",month:"long",year:"numeric"})},O=g=>g?new Date(g).toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit",hour12:!1}):"",C=g=>g?new Date(g)<new Date:!1,$=g=>g?new Date(g).toISOString().split("T")[0]===new Date().toISOString().split("T")[0]:!1;return t.length===0?null:e.jsxs("div",{className:"ra-timeline",children:[e.jsx("style",{children:je()}),c.map((g,a)=>e.jsxs("div",{className:"ra-tl-group",style:{animationDelay:`${a*80}ms`},children:[e.jsxs("div",{className:`ra-tl-date-header ${$(g.dateKey)?"today":""} ${C(g.dateKey)&&!$(g.dateKey)?"past":""}`,children:[e.jsx("div",{className:"ra-tl-date-dot"}),e.jsx("span",{className:"ra-tl-date-label",children:A(g.date)}),e.jsxs("span",{className:"ra-tl-date-count",children:[g.items.length," événement",g.items.length>1?"s":""]})]}),e.jsx("div",{className:"ra-tl-items",children:g.items.map((s,w)=>{var j;const N=p(s),S=m(s,"lieu_evenement"),l=m(s,"duree_evenement"),I=m(s,"type_evenement"),x=ke(m(s,"tags_evenement")),k=C(s.date);return e.jsxs("div",{className:`ra-tl-item ${k?"past":""}`,style:{animationDelay:`${a*80+w*50}ms`},onClick:()=>o(s),children:[e.jsx("div",{className:"ra-tl-time",children:O(s.date)}),e.jsxs("div",{className:"ra-tl-connector",children:[e.jsx("div",{className:"ra-tl-line"}),e.jsx("div",{className:"ra-tl-node",style:{borderColor:N.color,background:`${N.color}20`}}),e.jsx("div",{className:"ra-tl-line"})]}),e.jsxs("div",{className:"ra-tl-card",children:[e.jsx("div",{className:"ra-tl-card-accent",style:{background:N.color}}),e.jsxs("div",{className:"ra-tl-card-body",children:[e.jsxs("div",{className:"ra-tl-card-top",children:[e.jsx("h4",{className:"ra-tl-card-title",children:s.title||"Sans titre"}),e.jsx("span",{className:"ra-tl-status",style:{background:`${N.color}15`,color:N.color},children:N.label})]}),e.jsxs("div",{className:"ra-tl-card-meta",children:[l&&e.jsxs("span",{className:"ra-tl-meta-item",children:[e.jsxs("svg",{width:"12",height:"12",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",children:[e.jsx("circle",{cx:"12",cy:"12",r:"10"}),e.jsx("polyline",{points:"12 6 12 12 16 14"})]}),l," min"]}),S&&e.jsxs("span",{className:"ra-tl-meta-item",children:[e.jsxs("svg",{width:"12",height:"12",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",children:[e.jsx("path",{d:"M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"}),e.jsx("circle",{cx:"12",cy:"10",r:"3"})]}),S]}),I&&e.jsxs("span",{className:"ra-tl-meta-item",children:[e.jsxs("svg",{width:"12",height:"12",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",children:[e.jsx("path",{d:"M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"}),e.jsx("line",{x1:"7",y1:"7",x2:"7.01",y2:"7"})]}),I.charAt(0).toUpperCase()+I.slice(1)]})]}),x.length>0&&e.jsx("div",{className:"ra-tl-tags",children:x.map(H=>e.jsx("span",{className:"ra-tl-tag",children:H},H))})]})]})]},(j=s._id)==null?void 0:j.toString())})})]},g.dateKey))]})}function ke(t){return(Array.isArray(t)?t:typeof t=="string"?t.split(","):[]).map(o=>String(o||"").trim()).filter(Boolean)}function je(){return`
.ra-timeline { padding:4px 0; }

.ra-tl-group { animation:raFadeIn .5s ease both; margin-bottom:8px; }

.ra-tl-date-header {
    display:flex; align-items:center; gap:10px; padding:8px 0;
}
.ra-tl-date-dot {
    width:10px; height:10px; border-radius:50%;
    background:#d1d5db; flex-shrink:0;
}
.ra-tl-date-header.today .ra-tl-date-dot { background:#14b8a6; box-shadow:0 0 0 3px rgba(20,184,166,.2); }
.ra-tl-date-header.past .ra-tl-date-dot { background:#9ca3af; }

.ra-tl-date-label { font-size:14px; font-weight:700; color:#0e1726; text-transform:capitalize; }
.dark .ra-tl-date-label { color:#e0e6ed; }
.ra-tl-date-header.past .ra-tl-date-label { color:#9ca3af; }
.dark .ra-tl-date-header.past .ra-tl-date-label { color:#506690; }

.ra-tl-date-count { font-size:11px; color:#9ca3af; font-weight:600; }

.ra-tl-items { padding-left:5px; margin-left:0; }

.ra-tl-item {
    display:flex; align-items:stretch; gap:0; margin-bottom:4px;
    cursor:pointer; animation:raFadeIn .4s ease both;
    transition:transform .15s;
}
.ra-tl-item:hover { transform:translateX(4px); }

.ra-tl-time {
    width:50px; flex-shrink:0; font-size:12px; font-weight:700;
    color:#6b7280; padding-top:14px; text-align:right; padding-right:12px;
}
.dark .ra-tl-time { color:#506690; }
.ra-tl-item.past .ra-tl-time { color:#d1d5db; }
.dark .ra-tl-item.past .ra-tl-time { color:#3b4f6b; }

.ra-tl-connector {
    display:flex; flex-direction:column; align-items:center; width:20px; flex-shrink:0;
}
.ra-tl-line { width:2px; flex:1; background:#e2e8f0; }
.dark .ra-tl-line { background:#253b5c; }
.ra-tl-node {
    width:10px; height:10px; border-radius:50%; border:2px solid;
    flex-shrink:0;
}

.ra-tl-card {
    flex:1; display:flex; background:#fff; border:1px solid #e8ecf1;
    border-radius:10px; overflow:hidden; transition:box-shadow .2s;
    margin:4px 0;
}
.dark .ra-tl-card { background:#1b2e4b; border-color:#253b5c; }
.ra-tl-item:hover .ra-tl-card { box-shadow:0 4px 12px rgba(0,0,0,.06); }
.dark .ra-tl-item:hover .ra-tl-card { box-shadow:0 4px 12px rgba(0,0,0,.2); }

.ra-tl-card-accent { width:4px; flex-shrink:0; }

.ra-tl-card-body { padding:10px 14px; flex:1; min-width:0; }

.ra-tl-card-top { display:flex; align-items:center; justify-content:space-between; gap:8px; margin-bottom:4px; }

.ra-tl-card-title {
    font-size:13px; font-weight:700; color:#0e1726; margin:0;
    white-space:nowrap; overflow:hidden; text-overflow:ellipsis;
}
.dark .ra-tl-card-title { color:#e0e6ed; }
.ra-tl-item.past .ra-tl-card-title { color:#9ca3af; }
.dark .ra-tl-item.past .ra-tl-card-title { color:#506690; }

.ra-tl-status {
    font-size:10px; font-weight:700; padding:2px 8px; border-radius:6px;
    white-space:nowrap; flex-shrink:0; text-transform:uppercase; letter-spacing:.03em;
}

.ra-tl-card-meta { display:flex; flex-wrap:wrap; gap:10px; }

.ra-tl-meta-item {
    display:inline-flex; align-items:center; gap:4px;
    font-size:11px; color:#9ca3af; font-weight:500;
}
.dark .ra-tl-meta-item { color:#506690; }

.ra-tl-tags {
    display:flex; flex-wrap:wrap; gap:5px; margin-top:8px;
}
.ra-tl-tag {
    display:inline-flex; align-items:center; min-height:20px;
    padding:2px 7px; border-radius:6px;
    background:#f8fafc; border:1px solid #e2e8f0;
    color:#64748b; font-size:10.5px; font-weight:800;
}
.dark .ra-tl-tag { background:#0e1726; border-color:#253b5c; color:#94a3b8; }
`}function Ne({events:t,entityData:u,onEventClick:o,onDeleteEvent:p,getStatusInfo:m,getCustomFieldValue:c}){const[A,O]=i.useState("date"),[C,$]=i.useState("asc"),g=i.useMemo(()=>[...t].sort((l,I)=>{let x,k;switch(A){case"title":return x=(l.title||"").toLowerCase(),k=(I.title||"").toLowerCase(),C==="asc"?x.localeCompare(k):k.localeCompare(x);case"status":return x=m(l).label,k=m(I).label,C==="asc"?x.localeCompare(k):k.localeCompare(x);case"type":return x=c(l,"type_evenement")||"",k=c(I,"type_evenement")||"",C==="asc"?x.localeCompare(k):k.localeCompare(x);case"date":default:return x=l.date?new Date(l.date).getTime():0,k=I.date?new Date(I.date).getTime():0,C==="asc"?x-k:k-x}}),[t,A,C,m,c]),a=l=>{A===l?$(I=>I==="asc"?"desc":"asc"):(O(l),$("asc"))},s=l=>l?new Date(l).toLocaleDateString("fr-FR",{day:"2-digit",month:"short",year:"numeric"}):"—",w=l=>l?new Date(l).toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit",hour12:!1}):"",N=l=>l&&new Date(l)<new Date,S=({field:l})=>e.jsx("svg",{width:"10",height:"10",viewBox:"0 0 10 10",fill:"none",style:{opacity:A===l?1:.3},children:e.jsx("path",{d:A===l&&C==="desc"?"M5 2L8 6H2L5 2Z":"M5 8L2 4H8L5 8Z",fill:"currentColor"})});return t.length===0?null:e.jsxs("div",{className:"ra-list-wrap",children:[e.jsx("style",{children:Ce()}),e.jsxs("table",{className:"ra-list-table",children:[e.jsx("thead",{children:e.jsxs("tr",{children:[e.jsxs("th",{className:"ra-th ra-th-sortable",onClick:()=>a("title"),children:["Titre ",e.jsx(S,{field:"title"})]}),e.jsxs("th",{className:"ra-th ra-th-sortable",onClick:()=>a("date"),children:["Date ",e.jsx(S,{field:"date"})]}),e.jsx("th",{className:"ra-th",children:"Heure"}),e.jsx("th",{className:"ra-th",children:"Durée"}),e.jsxs("th",{className:"ra-th ra-th-sortable",onClick:()=>a("type"),children:["Type ",e.jsx(S,{field:"type"})]}),e.jsx("th",{className:"ra-th",children:"Étiquettes"}),e.jsx("th",{className:"ra-th",children:"Lieu"}),e.jsxs("th",{className:"ra-th ra-th-sortable",onClick:()=>a("status"),children:["Statut ",e.jsx(S,{field:"status"})]}),e.jsx("th",{className:"ra-th",style:{width:40}})]})}),e.jsx("tbody",{children:g.map((l,I)=>{var R;const x=m(l),k=c(l,"type_evenement"),j=Se(c(l,"tags_evenement")),H=c(l,"lieu_evenement"),n=c(l,"duree_evenement"),h=N(l.date);return e.jsxs("tr",{className:`ra-tr ${h?"past":""}`,onClick:()=>o(l),style:{animationDelay:`${I*30}ms`},children:[e.jsxs("td",{className:"ra-td ra-td-title",children:[e.jsx("div",{className:"ra-td-title-dot",style:{background:x.color}}),l.title||"Sans titre"]}),e.jsx("td",{className:"ra-td",children:s(l.date)}),e.jsx("td",{className:"ra-td ra-td-time",children:w(l.date)}),e.jsx("td",{className:"ra-td",children:n?`${n} min`:"—"}),e.jsx("td",{className:"ra-td ra-td-type",children:k?e.jsx("span",{className:"ra-td-type-badge",children:k.charAt(0).toUpperCase()+k.slice(1)}):"—"}),e.jsx("td",{className:"ra-td ra-td-tags",children:j.length>0?j.map(_=>e.jsx("span",{className:"ra-list-tag",children:_},_)):"—"}),e.jsx("td",{className:"ra-td",children:H||"—"}),e.jsx("td",{className:"ra-td",children:e.jsx("span",{className:"ra-td-status",style:{background:`${x.color}12`,color:x.color},children:x.label})}),e.jsx("td",{className:"ra-td ra-td-actions",children:e.jsx("button",{className:"ra-td-delete",onClick:_=>{var L;_.stopPropagation(),p((L=l._id)==null?void 0:L.toString())},title:"Supprimer",children:e.jsxs("svg",{width:"14",height:"14",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",children:[e.jsx("polyline",{points:"3 6 5 6 21 6"}),e.jsx("path",{d:"M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"})]})})})]},(R=l._id)==null?void 0:R.toString())})})]})]})}function Se(t){return(Array.isArray(t)?t:typeof t=="string"?t.split(","):[]).map(o=>String(o||"").trim()).filter(Boolean)}function Ce(){return`
.ra-list-wrap {
    background:#fff; border-radius:14px; border:1px solid #e8ecf1;
    overflow:hidden; animation:raFadeIn .4s ease;
}
.dark .ra-list-wrap { background:#0e1726; border-color:#253b5c; }

.ra-list-table { width:100%; border-collapse:collapse; font-size:13px; }

.ra-th {
    text-align:left; padding:12px 14px; font-size:11px; font-weight:700;
    color:#9ca3af; text-transform:uppercase; letter-spacing:.05em;
    border-bottom:1px solid #e8ecf1; white-space:nowrap;
    user-select:none;
}
.dark .ra-th { color:#506690; border-bottom-color:#253b5c; }
.ra-th-sortable { cursor:pointer; }
.ra-th-sortable:hover { color:#6b7280; }
.dark .ra-th-sortable:hover { color:#888da8; }

.ra-tr {
    cursor:pointer; transition:background .15s;
    animation:raFadeIn .3s ease both;
}
.ra-tr:hover { background:#f9fafb; }
.dark .ra-tr:hover { background:#1b2e4b; }
.ra-tr.past { opacity:.6; }

.ra-td {
    padding:10px 14px; border-bottom:1px solid #f1f5f9;
    color:#374151; white-space:nowrap;
}
.dark .ra-td { color:#e0e6ed; border-bottom-color:#1b2e4b; }

.ra-td-title {
    font-weight:600; display:flex; align-items:center; gap:8px;
    max-width:220px; overflow:hidden; text-overflow:ellipsis;
}
.ra-td-title-dot { width:6px; height:6px; border-radius:50%; flex-shrink:0; }

.ra-td-time { font-weight:700; color:#14b8a6; font-variant-numeric:tabular-nums; }

.ra-td-type-badge {
    font-size:11px; font-weight:600; padding:2px 8px; border-radius:5px;
    background:#f1f5f9; color:#6b7280;
}
.dark .ra-td-type-badge { background:#253b5c; color:#888da8; }

.ra-td-tags {
    display:flex; align-items:center; gap:4px; flex-wrap:wrap;
    max-width:180px; white-space:normal;
}
.ra-list-tag {
    display:inline-flex; align-items:center; min-height:20px;
    padding:2px 7px; border-radius:6px;
    background:#f8fafc; border:1px solid #e2e8f0;
    color:#64748b; font-size:10.5px; font-weight:800;
}
.dark .ra-list-tag { background:#1b2e4b; border-color:#253b5c; color:#94a3b8; }

.ra-td-status {
    font-size:10px; font-weight:700; padding:3px 8px; border-radius:6px;
    text-transform:uppercase; letter-spacing:.03em;
}

.ra-td-actions { padding:0; }
.ra-td-delete {
    width:30px; height:30px; border:none; border-radius:6px;
    background:transparent; color:#d1d5db; cursor:pointer;
    display:flex; align-items:center; justify-content:center;
    transition:all .15s; opacity:0;
}
.ra-tr:hover .ra-td-delete { opacity:1; }
.ra-td-delete:hover { background:#fef2f2; color:#ef4444; }
.dark .ra-td-delete:hover { background:#1a0505; }
`}function Ie({accountNumber:t,recordId:u,entitySlug:o}){const[p,m]=i.useState([]),[c,A]=i.useState(null),[O,C]=i.useState(!0),[$,g]=i.useState(!1),[a,s]=i.useState(""),[w,N]=i.useState("calendar"),[S,l]=i.useState("dayGridMonth"),[I,x]=i.useState(!1),[k,j]=i.useState(null),[H,n]=i.useState(null),h=i.useRef(null),R=i.useRef(null),_=`agenda-${u}`,L=`/account/${t}/api/records/${u}/events`,Y=`/account/${t}/api/user/view-preferences`;i.useEffect(()=>{(async()=>{var d;try{const y=await(await fetch(`${Y}/${_}`,{credentials:"include"})).json();if(y.success&&((d=y.preferences)!=null&&d.agendaPrefs)){const E=y.preferences.agendaPrefs;E.viewMode&&N(E.viewMode),E.calendarView&&l(E.calendarView)}}catch{}g(!0)})()},[Y,_]);const r=i.useCallback(async d=>{try{const f={viewMode:w,calendarView:S,...d};await fetch(Y,{method:"POST",headers:{"Content-Type":"application/json"},credentials:"include",body:JSON.stringify({viewId:_,preferences:{agendaPrefs:f}})})}catch(f){console.warn("[RecordAgenda] Prefs save error:",f)}},[Y,_,w,S]),P=i.useCallback(d=>{N(d),r({viewMode:d})},[r]),D=i.useCallback((d,f)=>{if(!d||!c)return null;const y=(c.customFields||[]).find(v=>v.name===f);if(!y)return null;const E=(d.customFields||[]).find(v=>{var M,B;const b=((M=v.field_id)==null?void 0:M._id)||v.field_id;return(b==null?void 0:b.toString())===((B=y._id)==null?void 0:B.toString())});return E?E.value:null},[c]),U=i.useCallback(d=>{if(!d||!(c!=null&&c.statusClassification))return{label:"Planifié",color:"#3b82f6"};const f=c.statusClassification,y=(d.classificationValues||[]).find(v=>{var b,M;return((b=v.classificationId)==null?void 0:b.toString())===((M=f._id)==null?void 0:M.toString())});if(!y)return{label:"Planifié",color:"#3b82f6"};const E=(f.options||[]).find(v=>{var b,M;return((b=v._id)==null?void 0:b.toString())===((M=y.optionId)==null?void 0:M.toString())});return E?{label:E.label,color:E.color||"#3b82f6"}:{label:"Planifié",color:"#3b82f6"}},[c]),F=i.useMemo(()=>p.map(d=>{var J;const f=U(d),y=D(d,"duree_evenement"),E=D(d,"lieu_evenement"),v=D(d,"type_evenement"),b=D(d,"notes_evenement"),M=Te(D(d,"tags_evenement"));let B=d.date?new Date(d.date):new Date,V=d.end_date?new Date(d.end_date):null;return!V&&y?V=new Date(B.getTime()+(parseInt(y)||30)*6e4):V||(V=new Date(B.getTime()+30*6e4)),{id:(J=d._id)==null?void 0:J.toString(),title:d.title||"Sans titre",start:B.toISOString(),end:V.toISOString(),backgroundColor:f.color,borderColor:f.color,textColor:"#fff",extendedProps:{_raw:d,status:f.label,statusColor:f.color,duration:y,lieu:E,type:v,notes:b,tags:M}}}),[p,U,D]),T=i.useCallback(async()=>{try{const d=await fetch(L,{credentials:"include"}),f=await d.json().catch(()=>({}));d.ok&&f.success?(m(f.events||[]),A(f.entityData||null),s("")):(m([]),A(f.entityData||null),s(f.error||f.message||"Impossible de charger les evenements."))}catch(d){console.error("[RecordAgenda] Fetch error:",d),s("Impossible de charger les evenements.")}C(!1)},[L]);i.useEffect(()=>{T()},[T]);const W=i.useRef(S);W.current=S;const z=i.useRef(F);z.current=F,i.useEffect(()=>{var E;if(w!=="calendar"||O||!$||!h.current)return;if(typeof FullCalendar>"u"){console.error("[RecordAgenda] FullCalendar not loaded");return}const d=(E=R.current)==null?void 0:E.getDate();R.current&&R.current.destroy();let f=!1;const y=new FullCalendar.Calendar(h.current,{initialView:W.current,initialDate:d||void 0,locale:"fr",headerToolbar:{left:"prev,next today",center:"title",right:"dayGridMonth,timeGridWeek,timeGridDay"},buttonText:{today:"Aujourd'hui",month:"Mois",week:"Semaine",day:"Jour"},editable:!0,dayMaxEvents:3,selectable:!0,droppable:!1,nowIndicator:!0,slotMinTime:"07:00:00",slotMaxTime:"21:00:00",slotDuration:"00:15:00",snapDuration:"00:05:00",allDaySlot:!1,height:"100%",expandRows:!0,eventTimeFormat:{hour:"2-digit",minute:"2-digit",meridiem:!1,hour12:!1},events:z.current,datesSet:v=>{if(!f)return;const b=v.view.type;b!==W.current&&(W.current=b,l(b),fetch(Y,{method:"POST",headers:{"Content-Type":"application/json"},credentials:"include",body:JSON.stringify({viewId:_,preferences:{agendaPrefs:{viewMode:"calendar",calendarView:b}}})}).catch(()=>{}))},eventClick:v=>{const b=v.event.extendedProps._raw;j(b),x(!0)},dateClick:v=>{const b=new Date(v.dateStr);b.setMinutes(Math.round(b.getMinutes()/5)*5,0,0),n(b.toISOString()),j(null),x(!0)},eventDrop:async v=>{var V,J;const b=v.event.id,M=(V=v.event.start)==null?void 0:V.toISOString(),B=(J=v.event.end)==null?void 0:J.toISOString();try{await fetch(`${L}/${b}/drag`,{method:"PATCH",headers:{"Content-Type":"application/json"},credentials:"include",body:JSON.stringify({newStart:M,newEnd:B})}),await T()}catch(te){console.error("[RecordAgenda] Drag error:",te),v.revert()}},eventResize:async v=>{var V,J;const b=v.event.id,M=(V=v.event.start)==null?void 0:V.toISOString(),B=(J=v.event.end)==null?void 0:J.toISOString();try{await fetch(`${L}/${b}/drag`,{method:"PATCH",headers:{"Content-Type":"application/json"},credentials:"include",body:JSON.stringify({newStart:M,newEnd:B})}),await T()}catch(te){console.error("[RecordAgenda] Resize error:",te),v.revert()}},eventDidMount:v=>{var B;const b=v.event.extendedProps;let M=v.event.title;b.lieu&&(M+=`
📍 ${b.lieu}`),b.status&&(M+=`
● ${b.status}`),(B=b.tags)!=null&&B.length&&(M+=`
🏷 ${b.tags.join(", ")}`),v.el.title=M}});return y.render(),R.current=y,requestAnimationFrame(()=>{f=!0}),()=>{R.current&&(R.current.destroy(),R.current=null)}},[w,O,$,L,T,Y,_]),i.useEffect(()=>{if(!R.current)return;const d=R.current;d.removeAllEvents(),d.addEventSource(F)},[F]);const G=i.useCallback(async d=>{try{s("");const f=await fetch(L,{method:"POST",headers:{"Content-Type":"application/json"},credentials:"include",body:JSON.stringify(d)}),y=await f.json().catch(()=>({}));if(!f.ok||!y.success)throw new Error(y.error||y.message||"Impossible de creer l'evenement.");await T(),x(!1),j(null),n(null)}catch(f){throw console.error("[RecordAgenda] Create error:",f),s(f.message||"Impossible de creer l'evenement."),f}},[L,T]),X=i.useCallback(async(d,f)=>{try{s("");const y=await fetch(`${L}/${d}`,{method:"PATCH",headers:{"Content-Type":"application/json"},credentials:"include",body:JSON.stringify(f)}),E=await y.json().catch(()=>({}));if(!y.ok||!E.success)throw new Error(E.error||E.message||"Impossible de mettre a jour l'evenement.");await T(),x(!1),j(null)}catch(y){throw console.error("[RecordAgenda] Update error:",y),s(y.message||"Impossible de mettre a jour l'evenement."),y}},[L,T]),K=i.useCallback(async d=>{if(confirm("Supprimer cet événement ?"))try{s("");const f=await fetch(`${L}/${d}`,{method:"DELETE",credentials:"include"}),y=await f.json().catch(()=>({}));if(!f.ok||!y.success)throw new Error(y.error||y.message||"Impossible de supprimer l'evenement.");await T(),x(!1),j(null)}catch(f){console.error("[RecordAgenda] Delete error:",f),s(f.message||"Impossible de supprimer l'evenement.")}},[L,T]),ae=i.useCallback(()=>{j(null),n(null),x(!0)},[]),ne=i.useCallback(d=>{j(d),x(!0)},[]);return O||!$?e.jsxs("div",{className:"ra-loading",children:[e.jsx("div",{className:"ra-spinner"}),e.jsx("span",{children:"Chargement de l'agenda..."})]}):e.jsxs("div",{className:"ra-container",children:[e.jsx("style",{children:De()}),e.jsx(pe,{viewMode:w,onViewChange:P,onNewEvent:ae,eventCount:p.length}),a&&e.jsxs("div",{className:"ra-error-banner",children:[e.jsx("span",{children:a}),e.jsx("button",{type:"button",onClick:()=>s(""),"aria-label":"Fermer",children:e.jsxs("svg",{width:"14",height:"14",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",children:[e.jsx("line",{x1:"18",y1:"6",x2:"6",y2:"18"}),e.jsx("line",{x1:"6",y1:"6",x2:"18",y2:"18"})]})})]}),w==="calendar"&&e.jsx("div",{className:"ra-calendar-wrap",children:e.jsx("div",{ref:h,className:"ra-calendar"})}),w==="timeline"&&e.jsx(ve,{events:p,entityData:c,onEventClick:ne,getStatusInfo:U,getCustomFieldValue:D}),w==="list"&&e.jsx(Ne,{events:p,entityData:c,onEventClick:ne,onDeleteEvent:K,getStatusInfo:U,getCustomFieldValue:D}),p.length===0&&!O&&e.jsxs("div",{className:"ra-empty",children:[e.jsx("div",{className:"ra-empty-icon",children:e.jsxs("svg",{width:"48",height:"48",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"1.5",children:[e.jsx("rect",{x:"3",y:"4",width:"18",height:"18",rx:"2",ry:"2"}),e.jsx("line",{x1:"16",y1:"2",x2:"16",y2:"6"}),e.jsx("line",{x1:"8",y1:"2",x2:"8",y2:"6"}),e.jsx("line",{x1:"3",y1:"10",x2:"21",y2:"10"}),e.jsx("line",{x1:"10",y1:"14",x2:"14",y2:"18"}),e.jsx("line",{x1:"14",y1:"14",x2:"10",y2:"18"})]})}),e.jsx("h3",{children:"Aucun événement"}),e.jsx("p",{children:"Ajoutez votre premier événement pour commencer à organiser votre agenda."}),e.jsxs("button",{className:"ra-empty-btn",onClick:ae,children:[e.jsxs("svg",{width:"16",height:"16",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",children:[e.jsx("line",{x1:"12",y1:"5",x2:"12",y2:"19"}),e.jsx("line",{x1:"5",y1:"12",x2:"19",y2:"12"})]}),"Nouvel événement"]})]}),e.jsx(ge,{isOpen:I,onClose:()=>{x(!1),j(null),n(null)},event:k,entityData:c,prefillDate:H,onCreate:G,onUpdate:X,onDelete:K,getCustomFieldValue:D,getStatusInfo:U,accountNumber:t})]})}function Te(t){return(Array.isArray(t)?t:typeof t=="string"?t.split(","):[]).map(o=>String(o||"").trim()).filter(Boolean)}function De(){return`
/* ═══ Record Agenda Island — App Layout ═══ */
.ra-container {
    font-family: 'Nunito', sans-serif;
    display: flex; flex-direction: column;
    height: 100%; min-height: 0;
}
.ra-loading { display:flex; align-items:center; justify-content:center; gap:12px; padding:60px 0; color:#888da8; font-size:14px; }
.ra-spinner { width:24px; height:24px; border:3px solid #e2e8f0; border-top-color:#14b8a6; border-radius:50%; animation:raSpin .8s linear infinite; }
@keyframes raSpin { to { transform:rotate(360deg); } }

.ra-error-banner {
    display:flex; align-items:center; justify-content:space-between; gap:12px;
    margin:0 0 12px; padding:10px 12px;
    border:1px solid #fecaca; border-radius:10px;
    background:#fff7f7; color:#b91c1c;
    font-size:12px; font-weight:700;
}
.ra-error-banner button {
    width:24px; height:24px; border:0; border-radius:7px;
    background:transparent; color:inherit; cursor:pointer;
    display:flex; align-items:center; justify-content:center;
}
.ra-error-banner button:hover { background:rgba(185,28,28,.08); }
.dark .ra-error-banner { background:rgba(127,29,29,.18); border-color:#7f1d1d; color:#fecaca; }

/* Calendar wrapper — fills available space */
.ra-calendar-wrap {
    background:#fff; border-radius:14px; border:1px solid #e8ecf1;
    padding:16px; overflow:hidden;
    flex: 1; min-height: 500px;
    display: flex; flex-direction: column;
    animation: raFadeIn .4s ease;
}
.dark .ra-calendar-wrap {
    background:#0e1726; border-color:#253b5c;
}
.ra-calendar { flex: 1; min-height: 0; }

/* FullCalendar overrides for premium feel */
.ra-calendar .fc { font-family:'Nunito',sans-serif; height:100% !important; }
.ra-calendar .fc .fc-toolbar-title { font-size:18px; font-weight:700; color:#0e1726; }
.dark .ra-calendar .fc .fc-toolbar-title { color:#e0e6ed; }

.ra-calendar .fc .fc-button {
    background:#f8fafc !important; border:1px solid #e2e8f0 !important;
    color:#4b5563 !important; font-size:12px !important; font-weight:600 !important;
    padding:6px 14px !important; border-radius:8px !important;
    transition:all .2s !important; box-shadow:none !important;
    text-transform:none !important;
}
.ra-calendar .fc .fc-button:hover {
    background:#e2e8f0 !important; color:#0e1726 !important;
}
.ra-calendar .fc .fc-button-active,
.ra-calendar .fc .fc-button.fc-button-active {
    background:linear-gradient(135deg, #14b8a6, #14b8a6dd) !important;
    border-color:#14b8a6 !important; color:#fff !important;
}
.dark .ra-calendar .fc .fc-button {
    background:#1b2e4b !important; border-color:#253b5c !important;
    color:#888da8 !important;
}
.dark .ra-calendar .fc .fc-button:hover {
    background:#253b5c !important; color:#e0e6ed !important;
}
.dark .ra-calendar .fc .fc-button-active,
.dark .ra-calendar .fc .fc-button.fc-button-active {
    background:linear-gradient(135deg, #14b8a6, #14b8a6dd) !important;
    border-color:#14b8a6 !important; color:#fff !important;
}

.ra-calendar .fc .fc-col-header-cell-cushion { font-size:12px; font-weight:700; color:#6b7280; text-transform:uppercase; letter-spacing:.04em; }
.dark .ra-calendar .fc .fc-col-header-cell-cushion { color:#506690; }

.ra-calendar .fc .fc-daygrid-day-number { font-size:13px; font-weight:600; color:#374151; padding:6px 8px; }
.dark .ra-calendar .fc .fc-daygrid-day-number { color:#888da8; }

.ra-calendar .fc .fc-day-today { background:rgba(20,184,166,.04) !important; }
.dark .ra-calendar .fc .fc-day-today { background:rgba(20,184,166,.08) !important; }

.ra-calendar .fc .fc-event {
    border:none !important; border-radius:6px !important; padding:2px 6px !important;
    font-size:12px !important; font-weight:600 !important;
    cursor:pointer !important; transition:transform .15s, box-shadow .15s !important;
}
.ra-calendar .fc .fc-event:hover {
    transform:translateY(-1px) !important;
    box-shadow:0 4px 12px rgba(0,0,0,.15) !important;
}

.ra-calendar .fc td, .ra-calendar .fc th { border-color:#f1f3f5 !important; }
.dark .ra-calendar .fc td, .dark .ra-calendar .fc th { border-color:#1b2e4b !important; }

.ra-calendar .fc .fc-scrollgrid { border-color:#e8ecf1 !important; }
.dark .ra-calendar .fc .fc-scrollgrid { border-color:#253b5c !important; }

.ra-calendar .fc .fc-timegrid-slot { height:40px; }
.ra-calendar .fc .fc-timegrid-slot-label-cushion { font-size:11px; font-weight:600; color:#9ca3af; }
.dark .ra-calendar .fc .fc-timegrid-slot-label-cushion { color:#506690; }

.ra-calendar .fc .fc-now-indicator-line { border-color:#ef4444 !important; }
.ra-calendar .fc .fc-now-indicator-arrow { border-color:#ef4444 !important; }

/* Timeline + List views fill space */
.ra-timeline, .ra-list-wrap { flex:1; min-height:0; overflow-y:auto; }

/* Empty state */
.ra-empty {
    text-align:center; padding:60px 20px;
    animation: raFadeIn .5s ease;
}
.ra-empty-icon { color:#d1d5db; margin-bottom:16px; }
.dark .ra-empty-icon { color:#506690; }
.ra-empty h3 { font-size:16px; font-weight:700; color:#374151; margin:0 0 6px; }
.dark .ra-empty h3 { color:#e0e6ed; }
.ra-empty p { font-size:13px; color:#9ca3af; margin:0 0 20px; }
.dark .ra-empty p { color:#506690; }
.ra-empty-btn {
    display:inline-flex; align-items:center; gap:8px; padding:10px 20px;
    background:linear-gradient(135deg, #14b8a6, #14b8a6dd);
    color:#fff; border:none; border-radius:10px; font-size:13px; font-weight:600;
    cursor:pointer; transition:all .2s; font-family:inherit;
}
.ra-empty-btn:hover { transform:translateY(-1px); box-shadow:0 4px 12px rgba(20,184,166,.3); }

@keyframes raFadeIn { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
`}function le(){document.querySelectorAll('[data-island="record-agenda"]').forEach(t=>{if(t.dataset.mounted==="1")return;t.dataset.mounted="1";const u={accountNumber:t.dataset.accountNumber,recordId:t.dataset.recordId,entitySlug:t.dataset.entitySlug};console.log("[RecordAgenda Island] Mounting:",u),de(t).render(e.jsx(ce.StrictMode,{children:e.jsx(Ie,{...u})}))})}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",le):le();
