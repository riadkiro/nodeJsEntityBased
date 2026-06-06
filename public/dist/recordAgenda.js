import{j as e,r as s,c as le,R as de}from"./chunks/client-CkWOIrXP.js";function ce({viewMode:t,onViewChange:m,onNewEvent:i,eventCount:p}){const g=[{key:"calendar",icon:"M3 4h18M3 10h18M3 16h18",label:"Calendrier"},{key:"timeline",icon:"M12 2v20M2 12h20",label:"Timeline"},{key:"list",icon:"M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01",label:"Liste"}];return e.jsxs("div",{className:"ra-toolbar",children:[e.jsx("style",{children:pe()}),e.jsx("div",{className:"ra-toolbar-left",children:e.jsxs("div",{className:"ra-view-pills",children:[g.map(c=>e.jsxs("button",{className:`ra-vpill ${t===c.key?"active":""}`,onClick:()=>m(c.key),children:[e.jsx("svg",{width:"14",height:"14",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",children:e.jsx("path",{d:c.icon})}),c.label]},c.key)),e.jsx("span",{className:"ra-vpill-count",children:p})]})}),e.jsx("div",{className:"ra-toolbar-right",children:e.jsxs("button",{className:"ra-new-event-btn",onClick:i,children:[e.jsxs("svg",{width:"16",height:"16",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2.5",children:[e.jsx("line",{x1:"12",y1:"5",x2:"12",y2:"19"}),e.jsx("line",{x1:"5",y1:"12",x2:"19",y2:"12"})]}),"Nouvel événement"]})})]})}function pe(){return`
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
`}const ue=[{value:"consultation",label:"Consultation",color:"#4361ee"},{value:"reunion",label:"Réunion",color:"#8b5cf6"},{value:"rappel",label:"Rappel",color:"#f59e0b"},{value:"tache",label:"Tâche",color:"#10b981"},{value:"personnel",label:"Personnel",color:"#ec4899"},{value:"autre",label:"Autre",color:"#6b7280"}],fe=[{label:"Important",value:"Important",color:"#ef4444"},{label:"Date limite",value:"Date limite",color:"#f59e0b"},{label:"Risque amende",value:"Risque amende",color:"#dc2626"}],U="#64748b";function xe({isOpen:t,onClose:m,event:i,entityData:p,prefillDate:g,onCreate:c,onUpdate:$,onDelete:z,getCustomFieldValue:C,getStatusInfo:A,accountNumber:h}){var O,q;const[n,o]=s.useState({title:"",date:"",endDate:"",duration:30,type:"consultation",tags:[],lieu:"",notes:"",statusOptionId:""}),[y,j]=s.useState(!1),[S,l]=s.useState(""),[T,f]=s.useState([]),k=!!i;s.useEffect(()=>{var a,P,E,V,W;if(t)if(l(""),f([]),i){A(i);const D=(i.classificationValues||[]).find(B=>{var L,J,K;return((L=B.classificationId)==null?void 0:L.toString())===((K=(J=p==null?void 0:p.statusClassification)==null?void 0:J._id)==null?void 0:K.toString())});o({title:i.title||"",date:i.date?Z(new Date(i.date)):"",endDate:i.end_date?Z(new Date(i.end_date)):"",duration:C(i,"duree_evenement")||30,type:C(i,"type_evenement")||"consultation",tags:X(C(i,"tags_evenement")),lieu:C(i,"lieu_evenement")||"",notes:C(i,"notes_evenement")||"",statusOptionId:((a=D==null?void 0:D.optionId)==null?void 0:a.toString())||""})}else{let D="";if(g){const L=new Date(g);isNaN(L.getTime())?D=g+"T09:00":(L.setMinutes(Math.round(L.getMinutes()/5)*5,0,0),D=Z(L))}else{const L=new Date;L.setMinutes(Math.ceil(L.getMinutes()/5)*5,0,0),D=Z(L)}const B=((W=(V=(E=(P=p==null?void 0:p.statusClassification)==null?void 0:P.options)==null?void 0:E[0])==null?void 0:V._id)==null?void 0:W.toString())||"";o({title:"",date:D,endDate:"",duration:30,type:"consultation",tags:[],lieu:"",notes:"",statusOptionId:B})}},[t,i,g,p,C,A]);const N=s.useCallback((a,P)=>{l(""),o(E=>({...E,[a]:P}))},[]),Y=s.useCallback(async()=>{if(n.title.trim()){j(!0),l("");try{const a=se(n.date,"Date");let P=n.endDate?se(n.endDate,"Date de fin").toISOString():void 0;!P&&a&&n.duration&&(P=new Date(a.getTime()+(parseInt(n.duration)||30)*6e4).toISOString());const E={title:n.title.trim(),date:a?a.toISOString():void 0,endDate:P,duration:parseInt(n.duration)||30,type:n.type,tags:X(n.tags),lieu:n.lieu,notes:n.notes,statusOptionId:n.statusOptionId||void 0};k?await $(i._id.toString(),E):await c(E)}catch(a){console.error("[EventModal] Save error:",a),l(a.message||"Impossible d'enregistrer cet evenement.")}finally{j(!1)}}},[n,k,i,c,$]);if(!t)return null;const r=((O=p==null?void 0:p.statusClassification)==null?void 0:O.options)||[],x=ge(p),R=Q([fe,((q=x==null?void 0:x.type_config)==null?void 0:q.options)||[],T,X(n.tags).map(a=>({label:a,value:a}))]),_=async a=>{var B,L;const P={label:a,value:a,color:U},E=((L=(B=x==null?void 0:x._id)==null?void 0:B.toString)==null?void 0:L.call(B))||(x==null?void 0:x._id);if(!h||!E)return f(J=>Q([J,[P]])),P;const V=await fetch(`/account/${h}/field-template/api/${E}/add-option`,{method:"POST",headers:{"Content-Type":"application/json"},credentials:"include",body:JSON.stringify(P)}),W=await V.json().catch(()=>({}));if(!V.ok||!W.success)throw new Error(W.error||"Création impossible");const D=te(W.option||P);return f(J=>Q([J,[D]])),D};return e.jsxs("div",{className:"ra-modal-overlay",onClick:m,children:[e.jsxs("div",{className:"ra-modal",onClick:a=>a.stopPropagation(),children:[e.jsxs("div",{className:"ra-modal-header",children:[e.jsxs("div",{className:"ra-modal-header-left",children:[e.jsx("div",{className:"ra-modal-icon",children:e.jsxs("svg",{width:"18",height:"18",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",children:[e.jsx("rect",{x:"3",y:"4",width:"18",height:"18",rx:"2",ry:"2"}),e.jsx("line",{x1:"16",y1:"2",x2:"16",y2:"6"}),e.jsx("line",{x1:"8",y1:"2",x2:"8",y2:"6"}),e.jsx("line",{x1:"3",y1:"10",x2:"21",y2:"10"})]})}),e.jsx("h3",{children:k?"Modifier l'événement":"Nouvel événement"})]}),e.jsx("button",{className:"ra-modal-close",onClick:m,children:e.jsxs("svg",{width:"16",height:"16",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",children:[e.jsx("line",{x1:"18",y1:"6",x2:"6",y2:"18"}),e.jsx("line",{x1:"6",y1:"6",x2:"18",y2:"18"})]})})]}),e.jsxs("div",{className:"ra-modal-body",children:[e.jsxs("div",{className:"ra-field",children:[e.jsx("label",{className:"ra-label",children:"Titre"}),e.jsx("input",{type:"text",className:"ra-input",placeholder:"Ex: Consultation de suivi...",value:n.title,onChange:a=>N("title",a.target.value),autoFocus:!0})]}),e.jsxs("div",{className:"ra-field-row",children:[e.jsxs("div",{className:"ra-field",style:{flex:1},children:[e.jsx("label",{className:"ra-label",children:"Date & heure"}),e.jsx("input",{type:"datetime-local",className:"ra-input",step:"300",value:n.date,onChange:a=>N("date",a.target.value)})]}),e.jsxs("div",{className:"ra-field",style:{width:100},children:[e.jsx("label",{className:"ra-label",children:"Durée (min)"}),e.jsx("input",{type:"number",className:"ra-input",value:n.duration,onChange:a=>N("duration",a.target.value),min:"5",max:"480",step:"5"})]})]}),e.jsx("div",{className:"ra-field-row",children:e.jsxs("div",{className:"ra-field",style:{flex:1},children:[e.jsx("label",{className:"ra-label",children:"Type"}),e.jsx("div",{className:"ra-type-pills",children:ue.map(a=>e.jsxs("button",{className:`ra-type-pill ${n.type===a.value?"active":""}`,style:{"--pill-c":a.color,background:n.type===a.value?`${a.color}15`:void 0,borderColor:n.type===a.value?`${a.color}40`:void 0,color:n.type===a.value?a.color:void 0},onClick:()=>N("type",a.value),type:"button",children:[e.jsx("span",{className:"ra-pill-dot",style:{background:a.color}}),a.label]},a.value))})]})}),r.length>0&&e.jsxs("div",{className:"ra-field",children:[e.jsx("label",{className:"ra-label",children:"Statut"}),e.jsx("div",{className:"ra-status-pills",children:r.map(a=>e.jsxs("button",{className:`ra-status-pill ${n.statusOptionId===a._id.toString()?"active":""}`,style:{"--st-c":a.color,background:n.statusOptionId===a._id.toString()?`${a.color}15`:void 0,borderColor:n.statusOptionId===a._id.toString()?a.color:void 0,color:n.statusOptionId===a._id.toString()?a.color:void 0},onClick:()=>N("statusOptionId",a._id.toString()),type:"button",children:[e.jsx("span",{className:"ra-pill-dot",style:{background:a.color}}),a.label]},a._id.toString()))})]}),e.jsxs("div",{className:"ra-field",children:[e.jsx("label",{className:"ra-label",children:"Étiquettes"}),e.jsx(me,{value:n.tags,options:R,onChange:a=>N("tags",a),onCreateOption:_})]}),e.jsxs("div",{className:"ra-field",children:[e.jsx("label",{className:"ra-label",children:"Lieu"}),e.jsx("input",{type:"text",className:"ra-input",placeholder:"Cabinet, Salle A, Domicile...",value:n.lieu,onChange:a=>N("lieu",a.target.value)})]}),e.jsxs("div",{className:"ra-field",children:[e.jsx("label",{className:"ra-label",children:"Notes"}),e.jsx("textarea",{className:"ra-input ra-textarea",placeholder:"Notes additionnelles...",rows:3,value:n.notes,onChange:a=>N("notes",a.target.value)})]}),S&&e.jsx("div",{className:"ra-modal-error",role:"alert",children:S})]}),e.jsxs("div",{className:"ra-modal-footer",children:[k&&e.jsxs("button",{className:"ra-delete-btn",onClick:()=>z(i._id.toString()),type:"button",children:[e.jsxs("svg",{width:"14",height:"14",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",children:[e.jsx("polyline",{points:"3 6 5 6 21 6"}),e.jsx("path",{d:"M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"})]}),"Supprimer"]}),e.jsxs("div",{className:"ra-modal-footer-right",children:[e.jsx("button",{className:"ra-cancel-btn",onClick:m,type:"button",children:"Annuler"}),e.jsx("button",{className:"ra-save-btn",onClick:Y,disabled:y||!n.title.trim(),type:"button",children:y?"Enregistrement...":k?"Mettre à jour":"Créer"})]})]})]}),e.jsx("style",{children:he()})]})}function me({value:t,options:m,onChange:i,onCreateOption:p}){const[g,c]=s.useState(""),[$,z]=s.useState(!1),[C,A]=s.useState(!1),h=s.useRef(null),n=s.useRef(null),o=s.useMemo(()=>X(t),[t]),y=s.useMemo(()=>Q([m,o.map(r=>({label:r,value:r}))]),[m,o]),j=s.useMemo(()=>o.map(r=>y.find(x=>oe(x,r))||{label:r,value:r,color:U}),[y,o]),S=g.trim().toLowerCase(),l=s.useMemo(()=>y.filter(r=>!o.some(x=>oe(r,x))).filter(r=>S?String(r.label||"").toLowerCase().includes(S)||String(r.value||"").toLowerCase().includes(S):!0).slice(0,8),[y,o,S]),T=s.useMemo(()=>S?y.some(r=>String(r.label||"").trim().toLowerCase()===S||String(r.value||"").trim().toLowerCase()===S):!1,[y,S]);s.useEffect(()=>{const r=x=>{!h.current||h.current.contains(x.target)||(z(!1),c(""))};return document.addEventListener("mousedown",r),()=>document.removeEventListener("mousedown",r)},[]);const f=s.useCallback(r=>{const x=te(r);if(!x.value)return;o.some(_=>_.toLowerCase()===String(x.value).toLowerCase())||i([...o,x.value]),c(""),z(!0),requestAnimationFrame(()=>{var _;return(_=n.current)==null?void 0:_.focus()})},[i,o]),k=s.useCallback(r=>{i(o.filter(x=>x.toLowerCase()!==String(r).toLowerCase())),requestAnimationFrame(()=>{var x;return(x=n.current)==null?void 0:x.focus()})},[i,o]),N=s.useCallback(async()=>{const r=g.trim();if(!(!r||T||C)){A(!0);try{const x=await p(r);f(x||{label:r,value:r})}catch(x){console.error("[EventTags] Create option error:",x),window.showMessage?window.showMessage(x.message||"Création impossible","danger"):alert(x.message||"Création impossible")}finally{A(!1)}}},[f,C,T,p,g]),Y=r=>{r.key==="Enter"?(r.preventDefault(),l.length>0?f(l[0]):N()):r.key==="Backspace"&&!g&&o.length>0?k(o[o.length-1]):r.key==="Escape"&&(z(!1),c(""))};return e.jsxs("div",{className:"ra-tag-ms",ref:h,children:[e.jsxs("div",{className:`ra-tag-ms-control ${$?"open":""}`,onClick:()=>{var r;z(!0),(r=n.current)==null||r.focus()},children:[j.map(r=>e.jsxs("span",{className:"ra-tag-ms-pill",style:{"--tag-c":r.color||U,background:`${r.color||U}12`,borderColor:`${r.color||U}35`,color:r.color||U},children:[r.label,e.jsx("button",{type:"button",onClick:x=>{x.stopPropagation(),k(r.value)},"aria-label":`Retirer ${r.label}`,children:"×"})]},r.value)),e.jsx("input",{ref:n,className:"ra-tag-ms-input",value:g,onChange:r=>{c(r.target.value),z(!0)},onFocus:()=>z(!0),onKeyDown:Y,placeholder:j.length?"Ajouter...":"Important, Date limite..."})]}),$&&(l.length>0||g.trim()&&!T)&&e.jsxs("div",{className:"ra-tag-ms-menu",children:[l.map(r=>e.jsxs("button",{type:"button",className:"ra-tag-ms-option",onClick:()=>f(r),children:[e.jsx("span",{className:"ra-tag-ms-dot",style:{background:r.color||U}}),e.jsx("span",{children:r.label})]},r.value)),g.trim()&&!T&&e.jsxs("button",{type:"button",className:"ra-tag-ms-create",onClick:N,disabled:C,children:[e.jsx("span",{children:"+"}),C?"Création...":`Créer "${g.trim()}"`]})]})]})}function ge(t){return((t==null?void 0:t.customFields)||[]).find(m=>(m==null?void 0:m.name)==="tags_evenement")||null}function X(t){return(Array.isArray(t)?t:typeof t=="string"?t.split(","):[]).map(i=>String(i||"").trim()).filter(Boolean).filter((i,p,g)=>g.findIndex(c=>c.toLowerCase()===i.toLowerCase())===p)}function te(t){if(typeof t=="object"&&t){const i=String(t.label||t.value||"").trim(),p=String(t.value||t.label||"").trim();return{label:i,value:p,color:t.color||U}}const m=String(t||"").trim();return{label:m,value:m,color:U}}function oe(t,m){const i=String(m||"").trim().toLowerCase();return[t.value,t.label].filter(p=>p!=null).some(p=>String(p).trim().toLowerCase()===i)}function Q(t){const m=[],i=new Set;return t.flat().forEach(p=>{const g=te(p);if(!g.value)return;const c=g.value.toLowerCase();i.has(c)||(i.add(c),m.push(g))}),m}function Z(t){const m=t.getFullYear(),i=String(t.getMonth()+1).padStart(2,"0"),p=String(t.getDate()).padStart(2,"0"),g=String(t.getHours()).padStart(2,"0"),c=String(t.getMinutes()).padStart(2,"0");return`${m}-${i}-${p}T${g}:${c}`}function se(t,m){if(!t)return null;const i=new Date(t);if(Number.isNaN(i.getTime()))throw new Error(`${m} invalide.`);return i}function he(){return`
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
`}function be({events:t,entityData:m,onEventClick:i,getStatusInfo:p,getCustomFieldValue:g}){const c=s.useMemo(()=>{const h=[...t].sort((o,y)=>{const j=o.date?new Date(o.date).getTime():0,S=y.date?new Date(y.date).getTime():0;return j-S}),n={};return h.forEach(o=>{const j=(o.date?new Date(o.date):new Date).toISOString().split("T")[0];n[j]||(n[j]=[]),n[j].push(o)}),Object.entries(n).map(([o,y])=>({dateKey:o,date:new Date(o),items:y}))},[t]),$=h=>{const n=new Date,o=new Date(n);o.setDate(o.getDate()+1);const y=new Date(n);y.setDate(y.getDate()-1);const j=h.toISOString().split("T")[0];return j===n.toISOString().split("T")[0]?"Aujourd'hui":j===o.toISOString().split("T")[0]?"Demain":j===y.toISOString().split("T")[0]?"Hier":h.toLocaleDateString("fr-FR",{weekday:"long",day:"numeric",month:"long",year:"numeric"})},z=h=>h?new Date(h).toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit",hour12:!1}):"",C=h=>h?new Date(h)<new Date:!1,A=h=>h?new Date(h).toISOString().split("T")[0]===new Date().toISOString().split("T")[0]:!1;return t.length===0?null:e.jsxs("div",{className:"ra-timeline",children:[e.jsx("style",{children:we()}),c.map((h,n)=>e.jsxs("div",{className:"ra-tl-group",style:{animationDelay:`${n*80}ms`},children:[e.jsxs("div",{className:`ra-tl-date-header ${A(h.dateKey)?"today":""} ${C(h.dateKey)&&!A(h.dateKey)?"past":""}`,children:[e.jsx("div",{className:"ra-tl-date-dot"}),e.jsx("span",{className:"ra-tl-date-label",children:$(h.date)}),e.jsxs("span",{className:"ra-tl-date-count",children:[h.items.length," événement",h.items.length>1?"s":""]})]}),e.jsx("div",{className:"ra-tl-items",children:h.items.map((o,y)=>{var N;const j=p(o),S=g(o,"lieu_evenement"),l=g(o,"duree_evenement"),T=g(o,"type_evenement"),f=ye(g(o,"tags_evenement")),k=C(o.date);return e.jsxs("div",{className:`ra-tl-item ${k?"past":""}`,style:{animationDelay:`${n*80+y*50}ms`},onClick:()=>i(o),children:[e.jsx("div",{className:"ra-tl-time",children:z(o.date)}),e.jsxs("div",{className:"ra-tl-connector",children:[e.jsx("div",{className:"ra-tl-line"}),e.jsx("div",{className:"ra-tl-node",style:{borderColor:j.color,background:`${j.color}20`}}),e.jsx("div",{className:"ra-tl-line"})]}),e.jsxs("div",{className:"ra-tl-card",children:[e.jsx("div",{className:"ra-tl-card-accent",style:{background:j.color}}),e.jsxs("div",{className:"ra-tl-card-body",children:[e.jsxs("div",{className:"ra-tl-card-top",children:[e.jsx("h4",{className:"ra-tl-card-title",children:o.title||"Sans titre"}),e.jsx("span",{className:"ra-tl-status",style:{background:`${j.color}15`,color:j.color},children:j.label})]}),e.jsxs("div",{className:"ra-tl-card-meta",children:[l&&e.jsxs("span",{className:"ra-tl-meta-item",children:[e.jsxs("svg",{width:"12",height:"12",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",children:[e.jsx("circle",{cx:"12",cy:"12",r:"10"}),e.jsx("polyline",{points:"12 6 12 12 16 14"})]}),l," min"]}),S&&e.jsxs("span",{className:"ra-tl-meta-item",children:[e.jsxs("svg",{width:"12",height:"12",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",children:[e.jsx("path",{d:"M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"}),e.jsx("circle",{cx:"12",cy:"10",r:"3"})]}),S]}),T&&e.jsxs("span",{className:"ra-tl-meta-item",children:[e.jsxs("svg",{width:"12",height:"12",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",children:[e.jsx("path",{d:"M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"}),e.jsx("line",{x1:"7",y1:"7",x2:"7.01",y2:"7"})]}),T.charAt(0).toUpperCase()+T.slice(1)]})]}),f.length>0&&e.jsx("div",{className:"ra-tl-tags",children:f.map(Y=>e.jsx("span",{className:"ra-tl-tag",children:Y},Y))})]})]})]},(N=o._id)==null?void 0:N.toString())})})]},h.dateKey))]})}function ye(t){return(Array.isArray(t)?t:typeof t=="string"?t.split(","):[]).map(i=>String(i||"").trim()).filter(Boolean)}function we(){return`
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
`}function ve({events:t,entityData:m,onEventClick:i,onDeleteEvent:p,getStatusInfo:g,getCustomFieldValue:c}){const[$,z]=s.useState("date"),[C,A]=s.useState("asc"),h=s.useMemo(()=>[...t].sort((l,T)=>{let f,k;switch($){case"title":return f=(l.title||"").toLowerCase(),k=(T.title||"").toLowerCase(),C==="asc"?f.localeCompare(k):k.localeCompare(f);case"status":return f=g(l).label,k=g(T).label,C==="asc"?f.localeCompare(k):k.localeCompare(f);case"type":return f=c(l,"type_evenement")||"",k=c(T,"type_evenement")||"",C==="asc"?f.localeCompare(k):k.localeCompare(f);case"date":default:return f=l.date?new Date(l.date).getTime():0,k=T.date?new Date(T.date).getTime():0,C==="asc"?f-k:k-f}}),[t,$,C,g,c]),n=l=>{$===l?A(T=>T==="asc"?"desc":"asc"):(z(l),A("asc"))},o=l=>l?new Date(l).toLocaleDateString("fr-FR",{day:"2-digit",month:"short",year:"numeric"}):"—",y=l=>l?new Date(l).toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit",hour12:!1}):"",j=l=>l&&new Date(l)<new Date,S=({field:l})=>e.jsx("svg",{width:"10",height:"10",viewBox:"0 0 10 10",fill:"none",style:{opacity:$===l?1:.3},children:e.jsx("path",{d:$===l&&C==="desc"?"M5 2L8 6H2L5 2Z":"M5 8L2 4H8L5 8Z",fill:"currentColor"})});return t.length===0?null:e.jsxs("div",{className:"ra-list-wrap",children:[e.jsx("style",{children:je()}),e.jsxs("table",{className:"ra-list-table",children:[e.jsx("thead",{children:e.jsxs("tr",{children:[e.jsxs("th",{className:"ra-th ra-th-sortable",onClick:()=>n("title"),children:["Titre ",e.jsx(S,{field:"title"})]}),e.jsxs("th",{className:"ra-th ra-th-sortable",onClick:()=>n("date"),children:["Date ",e.jsx(S,{field:"date"})]}),e.jsx("th",{className:"ra-th",children:"Heure"}),e.jsx("th",{className:"ra-th",children:"Durée"}),e.jsxs("th",{className:"ra-th ra-th-sortable",onClick:()=>n("type"),children:["Type ",e.jsx(S,{field:"type"})]}),e.jsx("th",{className:"ra-th",children:"Étiquettes"}),e.jsx("th",{className:"ra-th",children:"Lieu"}),e.jsxs("th",{className:"ra-th ra-th-sortable",onClick:()=>n("status"),children:["Statut ",e.jsx(S,{field:"status"})]}),e.jsx("th",{className:"ra-th",style:{width:40}})]})}),e.jsx("tbody",{children:h.map((l,T)=>{var R;const f=g(l),k=c(l,"type_evenement"),N=ke(c(l,"tags_evenement")),Y=c(l,"lieu_evenement"),r=c(l,"duree_evenement"),x=j(l.date);return e.jsxs("tr",{className:`ra-tr ${x?"past":""}`,onClick:()=>i(l),style:{animationDelay:`${T*30}ms`},children:[e.jsxs("td",{className:"ra-td ra-td-title",children:[e.jsx("div",{className:"ra-td-title-dot",style:{background:f.color}}),l.title||"Sans titre"]}),e.jsx("td",{className:"ra-td",children:o(l.date)}),e.jsx("td",{className:"ra-td ra-td-time",children:y(l.date)}),e.jsx("td",{className:"ra-td",children:r?`${r} min`:"—"}),e.jsx("td",{className:"ra-td ra-td-type",children:k?e.jsx("span",{className:"ra-td-type-badge",children:k.charAt(0).toUpperCase()+k.slice(1)}):"—"}),e.jsx("td",{className:"ra-td ra-td-tags",children:N.length>0?N.map(_=>e.jsx("span",{className:"ra-list-tag",children:_},_)):"—"}),e.jsx("td",{className:"ra-td",children:Y||"—"}),e.jsx("td",{className:"ra-td",children:e.jsx("span",{className:"ra-td-status",style:{background:`${f.color}12`,color:f.color},children:f.label})}),e.jsx("td",{className:"ra-td ra-td-actions",children:e.jsx("button",{className:"ra-td-delete",onClick:_=>{var O;_.stopPropagation(),p((O=l._id)==null?void 0:O.toString())},title:"Supprimer",children:e.jsxs("svg",{width:"14",height:"14",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",children:[e.jsx("polyline",{points:"3 6 5 6 21 6"}),e.jsx("path",{d:"M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"})]})})})]},(R=l._id)==null?void 0:R.toString())})})]})]})}function ke(t){return(Array.isArray(t)?t:typeof t=="string"?t.split(","):[]).map(i=>String(i||"").trim()).filter(Boolean)}function je(){return`
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
`}function Se({accountNumber:t,recordId:m,entitySlug:i}){const[p,g]=s.useState([]),[c,$]=s.useState(null),[z,C]=s.useState(!0),[A,h]=s.useState(!1),[n,o]=s.useState(""),[y,j]=s.useState("calendar"),[S,l]=s.useState("dayGridMonth"),[T,f]=s.useState(!1),[k,N]=s.useState(null),[Y,r]=s.useState(null),x=s.useRef(null),R=s.useRef(null),_=`agenda-${m}`,O=`/account/${t}/api/records/${m}/events`,q=`/account/${t}/api/user/view-preferences`;s.useEffect(()=>{(async()=>{var d;try{const w=await(await fetch(`${q}/${_}`,{credentials:"include"})).json();if(w.success&&((d=w.preferences)!=null&&d.agendaPrefs)){const I=w.preferences.agendaPrefs;I.viewMode&&j(I.viewMode),I.calendarView&&l(I.calendarView)}}catch{}h(!0)})()},[q,_]);const a=s.useCallback(async d=>{try{const u={viewMode:y,calendarView:S,...d};await fetch(q,{method:"POST",headers:{"Content-Type":"application/json"},credentials:"include",body:JSON.stringify({viewId:_,preferences:{agendaPrefs:u}})})}catch(u){console.warn("[RecordAgenda] Prefs save error:",u)}},[q,_,y,S]),P=s.useCallback(d=>{j(d),a({viewMode:d})},[a]),E=s.useCallback((d,u)=>{if(!d||!c)return null;const w=(c.customFields||[]).find(v=>v.name===u);if(!w)return null;const I=(d.customFields||[]).find(v=>{var M,F;const b=((M=v.field_id)==null?void 0:M._id)||v.field_id;return(b==null?void 0:b.toString())===((F=w._id)==null?void 0:F.toString())});return(I==null?void 0:I.value)||null},[c]),V=s.useCallback(d=>{if(!d||!(c!=null&&c.statusClassification))return{label:"Planifié",color:"#3b82f6"};const u=c.statusClassification,w=(d.classificationValues||[]).find(v=>{var b,M;return((b=v.classificationId)==null?void 0:b.toString())===((M=u._id)==null?void 0:M.toString())});if(!w)return{label:"Planifié",color:"#3b82f6"};const I=(u.options||[]).find(v=>{var b,M;return((b=v._id)==null?void 0:b.toString())===((M=w.optionId)==null?void 0:M.toString())});return I?{label:I.label,color:I.color||"#3b82f6"}:{label:"Planifié",color:"#3b82f6"}},[c]),W=s.useMemo(()=>p.map(d=>{var G;const u=V(d),w=E(d,"duree_evenement"),I=E(d,"lieu_evenement"),v=E(d,"type_evenement"),b=E(d,"notes_evenement"),M=Ne(E(d,"tags_evenement"));let F=d.date?new Date(d.date):new Date,H=d.end_date?new Date(d.end_date):null;return!H&&w?H=new Date(F.getTime()+(parseInt(w)||30)*6e4):H||(H=new Date(F.getTime()+30*6e4)),{id:(G=d._id)==null?void 0:G.toString(),title:d.title||"Sans titre",start:F.toISOString(),end:H.toISOString(),backgroundColor:u.color,borderColor:u.color,textColor:"#fff",extendedProps:{_raw:d,status:u.label,statusColor:u.color,duration:w,lieu:I,type:v,notes:b,tags:M}}}),[p,V,E]),D=s.useCallback(async()=>{try{const d=await fetch(O,{credentials:"include"}),u=await d.json().catch(()=>({}));d.ok&&u.success?(g(u.events||[]),$(u.entityData||null),o("")):(g([]),$(u.entityData||null),o(u.error||u.message||"Impossible de charger les evenements."))}catch(d){console.error("[RecordAgenda] Fetch error:",d),o("Impossible de charger les evenements.")}C(!1)},[O]);s.useEffect(()=>{D()},[D]);const B=s.useRef(S);B.current=S;const L=s.useRef(W);L.current=W,s.useEffect(()=>{var I;if(y!=="calendar"||z||!A||!x.current)return;if(typeof FullCalendar>"u"){console.error("[RecordAgenda] FullCalendar not loaded");return}const d=(I=R.current)==null?void 0:I.getDate();R.current&&R.current.destroy();let u=!1;const w=new FullCalendar.Calendar(x.current,{initialView:B.current,initialDate:d||void 0,locale:"fr",headerToolbar:{left:"prev,next today",center:"title",right:"dayGridMonth,timeGridWeek,timeGridDay"},buttonText:{today:"Aujourd'hui",month:"Mois",week:"Semaine",day:"Jour"},editable:!0,dayMaxEvents:3,selectable:!0,droppable:!1,nowIndicator:!0,slotMinTime:"07:00:00",slotMaxTime:"21:00:00",slotDuration:"00:15:00",snapDuration:"00:05:00",allDaySlot:!1,height:"100%",expandRows:!0,eventTimeFormat:{hour:"2-digit",minute:"2-digit",meridiem:!1,hour12:!1},events:L.current,datesSet:v=>{if(!u)return;const b=v.view.type;b!==B.current&&(B.current=b,l(b),fetch(q,{method:"POST",headers:{"Content-Type":"application/json"},credentials:"include",body:JSON.stringify({viewId:_,preferences:{agendaPrefs:{viewMode:"calendar",calendarView:b}}})}).catch(()=>{}))},eventClick:v=>{const b=v.event.extendedProps._raw;N(b),f(!0)},dateClick:v=>{const b=new Date(v.dateStr);b.setMinutes(Math.round(b.getMinutes()/5)*5,0,0),r(b.toISOString()),N(null),f(!0)},eventDrop:async v=>{var H,G;const b=v.event.id,M=(H=v.event.start)==null?void 0:H.toISOString(),F=(G=v.event.end)==null?void 0:G.toISOString();try{await fetch(`${O}/${b}/drag`,{method:"PATCH",headers:{"Content-Type":"application/json"},credentials:"include",body:JSON.stringify({newStart:M,newEnd:F})}),await D()}catch(ee){console.error("[RecordAgenda] Drag error:",ee),v.revert()}},eventResize:async v=>{var H,G;const b=v.event.id,M=(H=v.event.start)==null?void 0:H.toISOString(),F=(G=v.event.end)==null?void 0:G.toISOString();try{await fetch(`${O}/${b}/drag`,{method:"PATCH",headers:{"Content-Type":"application/json"},credentials:"include",body:JSON.stringify({newStart:M,newEnd:F})}),await D()}catch(ee){console.error("[RecordAgenda] Resize error:",ee),v.revert()}},eventDidMount:v=>{var F;const b=v.event.extendedProps;let M=v.event.title;b.lieu&&(M+=`
📍 ${b.lieu}`),b.status&&(M+=`
● ${b.status}`),(F=b.tags)!=null&&F.length&&(M+=`
🏷 ${b.tags.join(", ")}`),v.el.title=M}});return w.render(),R.current=w,requestAnimationFrame(()=>{u=!0}),()=>{R.current&&(R.current.destroy(),R.current=null)}},[y,z,A,O,D,q,_]),s.useEffect(()=>{if(!R.current)return;const d=R.current;d.removeAllEvents(),d.addEventSource(W)},[W]);const J=s.useCallback(async d=>{try{o("");const u=await fetch(O,{method:"POST",headers:{"Content-Type":"application/json"},credentials:"include",body:JSON.stringify(d)}),w=await u.json().catch(()=>({}));if(!u.ok||!w.success)throw new Error(w.error||w.message||"Impossible de creer l'evenement.");await D(),f(!1),N(null),r(null)}catch(u){throw console.error("[RecordAgenda] Create error:",u),o(u.message||"Impossible de creer l'evenement."),u}},[O,D]),K=s.useCallback(async(d,u)=>{try{o("");const w=await fetch(`${O}/${d}`,{method:"PATCH",headers:{"Content-Type":"application/json"},credentials:"include",body:JSON.stringify(u)}),I=await w.json().catch(()=>({}));if(!w.ok||!I.success)throw new Error(I.error||I.message||"Impossible de mettre a jour l'evenement.");await D(),f(!1),N(null)}catch(w){throw console.error("[RecordAgenda] Update error:",w),o(w.message||"Impossible de mettre a jour l'evenement."),w}},[O,D]),re=s.useCallback(async d=>{if(confirm("Supprimer cet événement ?"))try{o("");const u=await fetch(`${O}/${d}`,{method:"DELETE",credentials:"include"}),w=await u.json().catch(()=>({}));if(!u.ok||!w.success)throw new Error(w.error||w.message||"Impossible de supprimer l'evenement.");await D(),f(!1),N(null)}catch(u){console.error("[RecordAgenda] Delete error:",u),o(u.message||"Impossible de supprimer l'evenement.")}},[O,D]),ae=s.useCallback(()=>{N(null),r(null),f(!0)},[]),ne=s.useCallback(d=>{N(d),f(!0)},[]);return z||!A?e.jsxs("div",{className:"ra-loading",children:[e.jsx("div",{className:"ra-spinner"}),e.jsx("span",{children:"Chargement de l'agenda..."})]}):e.jsxs("div",{className:"ra-container",children:[e.jsx("style",{children:Ce()}),e.jsx(ce,{viewMode:y,onViewChange:P,onNewEvent:ae,eventCount:p.length}),n&&e.jsxs("div",{className:"ra-error-banner",children:[e.jsx("span",{children:n}),e.jsx("button",{type:"button",onClick:()=>o(""),"aria-label":"Fermer",children:e.jsxs("svg",{width:"14",height:"14",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",children:[e.jsx("line",{x1:"18",y1:"6",x2:"6",y2:"18"}),e.jsx("line",{x1:"6",y1:"6",x2:"18",y2:"18"})]})})]}),y==="calendar"&&e.jsx("div",{className:"ra-calendar-wrap",children:e.jsx("div",{ref:x,className:"ra-calendar"})}),y==="timeline"&&e.jsx(be,{events:p,entityData:c,onEventClick:ne,getStatusInfo:V,getCustomFieldValue:E}),y==="list"&&e.jsx(ve,{events:p,entityData:c,onEventClick:ne,onDeleteEvent:re,getStatusInfo:V,getCustomFieldValue:E}),p.length===0&&!z&&e.jsxs("div",{className:"ra-empty",children:[e.jsx("div",{className:"ra-empty-icon",children:e.jsxs("svg",{width:"48",height:"48",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"1.5",children:[e.jsx("rect",{x:"3",y:"4",width:"18",height:"18",rx:"2",ry:"2"}),e.jsx("line",{x1:"16",y1:"2",x2:"16",y2:"6"}),e.jsx("line",{x1:"8",y1:"2",x2:"8",y2:"6"}),e.jsx("line",{x1:"3",y1:"10",x2:"21",y2:"10"}),e.jsx("line",{x1:"10",y1:"14",x2:"14",y2:"18"}),e.jsx("line",{x1:"14",y1:"14",x2:"10",y2:"18"})]})}),e.jsx("h3",{children:"Aucun événement"}),e.jsx("p",{children:"Ajoutez votre premier événement pour commencer à organiser votre agenda."}),e.jsxs("button",{className:"ra-empty-btn",onClick:ae,children:[e.jsxs("svg",{width:"16",height:"16",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",children:[e.jsx("line",{x1:"12",y1:"5",x2:"12",y2:"19"}),e.jsx("line",{x1:"5",y1:"12",x2:"19",y2:"12"})]}),"Nouvel événement"]})]}),e.jsx(xe,{isOpen:T,onClose:()=>{f(!1),N(null),r(null)},event:k,entityData:c,prefillDate:Y,onCreate:J,onUpdate:K,onDelete:re,getCustomFieldValue:E,getStatusInfo:V,accountNumber:t})]})}function Ne(t){return(Array.isArray(t)?t:typeof t=="string"?t.split(","):[]).map(i=>String(i||"").trim()).filter(Boolean)}function Ce(){return`
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
`}function ie(){document.querySelectorAll('[data-island="record-agenda"]').forEach(t=>{if(t.dataset.mounted==="1")return;t.dataset.mounted="1";const m={accountNumber:t.dataset.accountNumber,recordId:t.dataset.recordId,entitySlug:t.dataset.entitySlug};console.log("[RecordAgenda Island] Mounting:",m),le(t).render(e.jsx(de.StrictMode,{children:e.jsx(Se,{...m})}))})}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",ie):ie();
