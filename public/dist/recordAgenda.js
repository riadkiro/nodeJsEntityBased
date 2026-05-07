import{j as e,r as l,c as X,R as Q}from"./chunks/client-CkWOIrXP.js";function ee({viewMode:f,onViewChange:C,onNewEvent:x,eventCount:m}){const w=[{key:"calendar",icon:"M3 4h18M3 10h18M3 16h18",label:"Calendrier"},{key:"timeline",icon:"M12 2v20M2 12h20",label:"Timeline"},{key:"list",icon:"M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01",label:"Liste"}];return e.jsxs("div",{className:"ra-toolbar",children:[e.jsx("style",{children:te()}),e.jsx("div",{className:"ra-toolbar-left",children:e.jsxs("div",{className:"ra-view-pills",children:[w.map(i=>e.jsxs("button",{className:`ra-vpill ${f===i.key?"active":""}`,onClick:()=>C(i.key),children:[e.jsx("svg",{width:"14",height:"14",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",children:e.jsx("path",{d:i.icon})}),i.label]},i.key)),e.jsx("span",{className:"ra-vpill-count",children:m})]})}),e.jsx("div",{className:"ra-toolbar-right",children:e.jsxs("button",{className:"ra-new-event-btn",onClick:x,children:[e.jsxs("svg",{width:"16",height:"16",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2.5",children:[e.jsx("line",{x1:"12",y1:"5",x2:"12",y2:"19"}),e.jsx("line",{x1:"5",y1:"12",x2:"19",y2:"12"})]}),"Nouvel événement"]})})]})}function te(){return`
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
`}const ae=[{value:"consultation",label:"Consultation",color:"#4361ee"},{value:"reunion",label:"Réunion",color:"#8b5cf6"},{value:"rappel",label:"Rappel",color:"#f59e0b"},{value:"tache",label:"Tâche",color:"#10b981"},{value:"personnel",label:"Personnel",color:"#ec4899"},{value:"autre",label:"Autre",color:"#6b7280"}];function re({isOpen:f,onClose:C,event:x,entityData:m,prefillDate:w,onCreate:i,onUpdate:E,onDelete:A,getCustomFieldValue:N,getStatusInfo:$}){var d;const[a,c]=l.useState({title:"",date:"",endDate:"",duration:30,type:"consultation",lieu:"",notes:"",statusOptionId:""}),[s,g]=l.useState(!1),u=!!x;l.useEffect(()=>{var t,T,D,M,z;if(f)if(x){$(x);const b=(x.classificationValues||[]).find(_=>{var O,V,R;return((O=_.classificationId)==null?void 0:O.toString())===((R=(V=m==null?void 0:m.statusClassification)==null?void 0:V._id)==null?void 0:R.toString())});c({title:x.title||"",date:x.date?W(new Date(x.date)):"",endDate:x.end_date?W(new Date(x.end_date)):"",duration:N(x,"duree_evenement")||30,type:N(x,"type_evenement")||"consultation",lieu:N(x,"lieu_evenement")||"",notes:N(x,"notes_evenement")||"",statusOptionId:((t=b==null?void 0:b.optionId)==null?void 0:t.toString())||""})}else{let b="";if(w){const O=new Date(w);isNaN(O.getTime())?b=w+"T09:00":b=W(O)}else{const O=new Date;O.setMinutes(Math.ceil(O.getMinutes()/15)*15,0,0),b=W(O)}const _=((z=(M=(D=(T=m==null?void 0:m.statusClassification)==null?void 0:T.options)==null?void 0:D[0])==null?void 0:M._id)==null?void 0:z.toString())||"";c({title:"",date:b,endDate:"",duration:30,type:"consultation",lieu:"",notes:"",statusOptionId:_})}},[f,x,w,m]);const v=l.useCallback((t,T)=>{c(D=>({...D,[t]:T}))},[]),r=l.useCallback(async()=>{if(!a.title.trim())return;g(!0);let t=a.endDate;if(!t&&a.date&&a.duration){const D=new Date(a.date);t=new Date(D.getTime()+parseInt(a.duration)*6e4).toISOString()}const T={title:a.title.trim(),date:a.date?new Date(a.date).toISOString():void 0,endDate:t||void 0,duration:parseInt(a.duration)||30,type:a.type,lieu:a.lieu,notes:a.notes,statusOptionId:a.statusOptionId||void 0};try{u?await E(x._id.toString(),T):await i(T)}catch(D){console.error("[EventModal] Save error:",D)}g(!1)},[a,u,x,i,E]);if(!f)return null;const k=((d=m==null?void 0:m.statusClassification)==null?void 0:d.options)||[];return e.jsxs("div",{className:"ra-modal-overlay",onClick:C,children:[e.jsxs("div",{className:"ra-modal",onClick:t=>t.stopPropagation(),children:[e.jsxs("div",{className:"ra-modal-header",children:[e.jsxs("div",{className:"ra-modal-header-left",children:[e.jsx("div",{className:"ra-modal-icon",children:e.jsxs("svg",{width:"18",height:"18",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",children:[e.jsx("rect",{x:"3",y:"4",width:"18",height:"18",rx:"2",ry:"2"}),e.jsx("line",{x1:"16",y1:"2",x2:"16",y2:"6"}),e.jsx("line",{x1:"8",y1:"2",x2:"8",y2:"6"}),e.jsx("line",{x1:"3",y1:"10",x2:"21",y2:"10"})]})}),e.jsx("h3",{children:u?"Modifier l'événement":"Nouvel événement"})]}),e.jsx("button",{className:"ra-modal-close",onClick:C,children:e.jsxs("svg",{width:"16",height:"16",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",children:[e.jsx("line",{x1:"18",y1:"6",x2:"6",y2:"18"}),e.jsx("line",{x1:"6",y1:"6",x2:"18",y2:"18"})]})})]}),e.jsxs("div",{className:"ra-modal-body",children:[e.jsxs("div",{className:"ra-field",children:[e.jsx("label",{className:"ra-label",children:"Titre"}),e.jsx("input",{type:"text",className:"ra-input",placeholder:"Ex: Consultation de suivi...",value:a.title,onChange:t=>v("title",t.target.value),autoFocus:!0})]}),e.jsxs("div",{className:"ra-field-row",children:[e.jsxs("div",{className:"ra-field",style:{flex:1},children:[e.jsx("label",{className:"ra-label",children:"Date & heure"}),e.jsx("input",{type:"datetime-local",className:"ra-input",value:a.date,onChange:t=>v("date",t.target.value)})]}),e.jsxs("div",{className:"ra-field",style:{width:100},children:[e.jsx("label",{className:"ra-label",children:"Durée (min)"}),e.jsx("input",{type:"number",className:"ra-input",value:a.duration,onChange:t=>v("duration",t.target.value),min:"5",max:"480",step:"5"})]})]}),e.jsx("div",{className:"ra-field-row",children:e.jsxs("div",{className:"ra-field",style:{flex:1},children:[e.jsx("label",{className:"ra-label",children:"Type"}),e.jsx("div",{className:"ra-type-pills",children:ae.map(t=>e.jsxs("button",{className:`ra-type-pill ${a.type===t.value?"active":""}`,style:{"--pill-c":t.color,background:a.type===t.value?`${t.color}15`:void 0,borderColor:a.type===t.value?`${t.color}40`:void 0,color:a.type===t.value?t.color:void 0},onClick:()=>v("type",t.value),type:"button",children:[e.jsx("span",{className:"ra-pill-dot",style:{background:t.color}}),t.label]},t.value))})]})}),k.length>0&&e.jsxs("div",{className:"ra-field",children:[e.jsx("label",{className:"ra-label",children:"Statut"}),e.jsx("div",{className:"ra-status-pills",children:k.map(t=>e.jsxs("button",{className:`ra-status-pill ${a.statusOptionId===t._id.toString()?"active":""}`,style:{"--st-c":t.color,background:a.statusOptionId===t._id.toString()?`${t.color}15`:void 0,borderColor:a.statusOptionId===t._id.toString()?t.color:void 0,color:a.statusOptionId===t._id.toString()?t.color:void 0},onClick:()=>v("statusOptionId",t._id.toString()),type:"button",children:[e.jsx("span",{className:"ra-pill-dot",style:{background:t.color}}),t.label]},t._id.toString()))})]}),e.jsxs("div",{className:"ra-field",children:[e.jsx("label",{className:"ra-label",children:"Lieu"}),e.jsx("input",{type:"text",className:"ra-input",placeholder:"Cabinet, Salle A, Domicile...",value:a.lieu,onChange:t=>v("lieu",t.target.value)})]}),e.jsxs("div",{className:"ra-field",children:[e.jsx("label",{className:"ra-label",children:"Notes"}),e.jsx("textarea",{className:"ra-input ra-textarea",placeholder:"Notes additionnelles...",rows:3,value:a.notes,onChange:t=>v("notes",t.target.value)})]})]}),e.jsxs("div",{className:"ra-modal-footer",children:[u&&e.jsxs("button",{className:"ra-delete-btn",onClick:()=>A(x._id.toString()),type:"button",children:[e.jsxs("svg",{width:"14",height:"14",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",children:[e.jsx("polyline",{points:"3 6 5 6 21 6"}),e.jsx("path",{d:"M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"})]}),"Supprimer"]}),e.jsxs("div",{className:"ra-modal-footer-right",children:[e.jsx("button",{className:"ra-cancel-btn",onClick:C,type:"button",children:"Annuler"}),e.jsx("button",{className:"ra-save-btn",onClick:r,disabled:s||!a.title.trim(),type:"button",children:s?"Enregistrement...":u?"Mettre à jour":"Créer"})]})]})]}),e.jsx("style",{children:ne()})]})}function W(f){const C=f.getFullYear(),x=String(f.getMonth()+1).padStart(2,"0"),m=String(f.getDate()).padStart(2,"0"),w=String(f.getHours()).padStart(2,"0"),i=String(f.getMinutes()).padStart(2,"0");return`${C}-${x}-${m}T${w}:${i}`}function ne(){return`
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
`}function oe({events:f,entityData:C,onEventClick:x,getStatusInfo:m,getCustomFieldValue:w}){const i=l.useMemo(()=>{const a=[...f].sort((s,g)=>{const u=s.date?new Date(s.date).getTime():0,v=g.date?new Date(g.date).getTime():0;return u-v}),c={};return a.forEach(s=>{const u=(s.date?new Date(s.date):new Date).toISOString().split("T")[0];c[u]||(c[u]=[]),c[u].push(s)}),Object.entries(c).map(([s,g])=>({dateKey:s,date:new Date(s),items:g}))},[f]),E=a=>{const c=new Date,s=new Date(c);s.setDate(s.getDate()+1);const g=new Date(c);g.setDate(g.getDate()-1);const u=a.toISOString().split("T")[0];return u===c.toISOString().split("T")[0]?"Aujourd'hui":u===s.toISOString().split("T")[0]?"Demain":u===g.toISOString().split("T")[0]?"Hier":a.toLocaleDateString("fr-FR",{weekday:"long",day:"numeric",month:"long",year:"numeric"})},A=a=>a?new Date(a).toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit",hour12:!1}):"",N=a=>a?new Date(a)<new Date:!1,$=a=>a?new Date(a).toISOString().split("T")[0]===new Date().toISOString().split("T")[0]:!1;return f.length===0?null:e.jsxs("div",{className:"ra-timeline",children:[e.jsx("style",{children:le()}),i.map((a,c)=>e.jsxs("div",{className:"ra-tl-group",style:{animationDelay:`${c*80}ms`},children:[e.jsxs("div",{className:`ra-tl-date-header ${$(a.dateKey)?"today":""} ${N(a.dateKey)&&!$(a.dateKey)?"past":""}`,children:[e.jsx("div",{className:"ra-tl-date-dot"}),e.jsx("span",{className:"ra-tl-date-label",children:E(a.date)}),e.jsxs("span",{className:"ra-tl-date-count",children:[a.items.length," événement",a.items.length>1?"s":""]})]}),e.jsx("div",{className:"ra-tl-items",children:a.items.map((s,g)=>{var t;const u=m(s),v=w(s,"lieu_evenement"),r=w(s,"duree_evenement"),k=w(s,"type_evenement"),d=N(s.date);return e.jsxs("div",{className:`ra-tl-item ${d?"past":""}`,style:{animationDelay:`${c*80+g*50}ms`},onClick:()=>x(s),children:[e.jsx("div",{className:"ra-tl-time",children:A(s.date)}),e.jsxs("div",{className:"ra-tl-connector",children:[e.jsx("div",{className:"ra-tl-line"}),e.jsx("div",{className:"ra-tl-node",style:{borderColor:u.color,background:`${u.color}20`}}),e.jsx("div",{className:"ra-tl-line"})]}),e.jsxs("div",{className:"ra-tl-card",children:[e.jsx("div",{className:"ra-tl-card-accent",style:{background:u.color}}),e.jsxs("div",{className:"ra-tl-card-body",children:[e.jsxs("div",{className:"ra-tl-card-top",children:[e.jsx("h4",{className:"ra-tl-card-title",children:s.title||"Sans titre"}),e.jsx("span",{className:"ra-tl-status",style:{background:`${u.color}15`,color:u.color},children:u.label})]}),e.jsxs("div",{className:"ra-tl-card-meta",children:[r&&e.jsxs("span",{className:"ra-tl-meta-item",children:[e.jsxs("svg",{width:"12",height:"12",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",children:[e.jsx("circle",{cx:"12",cy:"12",r:"10"}),e.jsx("polyline",{points:"12 6 12 12 16 14"})]}),r," min"]}),v&&e.jsxs("span",{className:"ra-tl-meta-item",children:[e.jsxs("svg",{width:"12",height:"12",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",children:[e.jsx("path",{d:"M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"}),e.jsx("circle",{cx:"12",cy:"10",r:"3"})]}),v]}),k&&e.jsxs("span",{className:"ra-tl-meta-item",children:[e.jsxs("svg",{width:"12",height:"12",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",children:[e.jsx("path",{d:"M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"}),e.jsx("line",{x1:"7",y1:"7",x2:"7.01",y2:"7"})]}),k.charAt(0).toUpperCase()+k.slice(1)]})]})]})]})]},(t=s._id)==null?void 0:t.toString())})})]},a.dateKey))]})}function le(){return`
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
`}function ie({events:f,entityData:C,onEventClick:x,onDeleteEvent:m,getStatusInfo:w,getCustomFieldValue:i}){const[E,A]=l.useState("date"),[N,$]=l.useState("asc"),a=l.useMemo(()=>[...f].sort((r,k)=>{let d,t;switch(E){case"title":return d=(r.title||"").toLowerCase(),t=(k.title||"").toLowerCase(),N==="asc"?d.localeCompare(t):t.localeCompare(d);case"status":return d=w(r).label,t=w(k).label,N==="asc"?d.localeCompare(t):t.localeCompare(d);case"type":return d=i(r,"type_evenement")||"",t=i(k,"type_evenement")||"",N==="asc"?d.localeCompare(t):t.localeCompare(d);case"date":default:return d=r.date?new Date(r.date).getTime():0,t=k.date?new Date(k.date).getTime():0,N==="asc"?d-t:t-d}}),[f,E,N,w,i]),c=r=>{E===r?$(k=>k==="asc"?"desc":"asc"):(A(r),$("asc"))},s=r=>r?new Date(r).toLocaleDateString("fr-FR",{day:"2-digit",month:"short",year:"numeric"}):"—",g=r=>r?new Date(r).toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit",hour12:!1}):"",u=r=>r&&new Date(r)<new Date,v=({field:r})=>e.jsx("svg",{width:"10",height:"10",viewBox:"0 0 10 10",fill:"none",style:{opacity:E===r?1:.3},children:e.jsx("path",{d:E===r&&N==="desc"?"M5 2L8 6H2L5 2Z":"M5 8L2 4H8L5 8Z",fill:"currentColor"})});return f.length===0?null:e.jsxs("div",{className:"ra-list-wrap",children:[e.jsx("style",{children:se()}),e.jsxs("table",{className:"ra-list-table",children:[e.jsx("thead",{children:e.jsxs("tr",{children:[e.jsxs("th",{className:"ra-th ra-th-sortable",onClick:()=>c("title"),children:["Titre ",e.jsx(v,{field:"title"})]}),e.jsxs("th",{className:"ra-th ra-th-sortable",onClick:()=>c("date"),children:["Date ",e.jsx(v,{field:"date"})]}),e.jsx("th",{className:"ra-th",children:"Heure"}),e.jsx("th",{className:"ra-th",children:"Durée"}),e.jsxs("th",{className:"ra-th ra-th-sortable",onClick:()=>c("type"),children:["Type ",e.jsx(v,{field:"type"})]}),e.jsx("th",{className:"ra-th",children:"Lieu"}),e.jsxs("th",{className:"ra-th ra-th-sortable",onClick:()=>c("status"),children:["Statut ",e.jsx(v,{field:"status"})]}),e.jsx("th",{className:"ra-th",style:{width:40}})]})}),e.jsx("tbody",{children:a.map((r,k)=>{var z;const d=w(r),t=i(r,"type_evenement"),T=i(r,"lieu_evenement"),D=i(r,"duree_evenement"),M=u(r.date);return e.jsxs("tr",{className:`ra-tr ${M?"past":""}`,onClick:()=>x(r),style:{animationDelay:`${k*30}ms`},children:[e.jsxs("td",{className:"ra-td ra-td-title",children:[e.jsx("div",{className:"ra-td-title-dot",style:{background:d.color}}),r.title||"Sans titre"]}),e.jsx("td",{className:"ra-td",children:s(r.date)}),e.jsx("td",{className:"ra-td ra-td-time",children:g(r.date)}),e.jsx("td",{className:"ra-td",children:D?`${D} min`:"—"}),e.jsx("td",{className:"ra-td ra-td-type",children:t?e.jsx("span",{className:"ra-td-type-badge",children:t.charAt(0).toUpperCase()+t.slice(1)}):"—"}),e.jsx("td",{className:"ra-td",children:T||"—"}),e.jsx("td",{className:"ra-td",children:e.jsx("span",{className:"ra-td-status",style:{background:`${d.color}12`,color:d.color},children:d.label})}),e.jsx("td",{className:"ra-td ra-td-actions",children:e.jsx("button",{className:"ra-td-delete",onClick:b=>{var _;b.stopPropagation(),m((_=r._id)==null?void 0:_.toString())},title:"Supprimer",children:e.jsxs("svg",{width:"14",height:"14",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",children:[e.jsx("polyline",{points:"3 6 5 6 21 6"}),e.jsx("path",{d:"M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"})]})})})]},(z=r._id)==null?void 0:z.toString())})})]})]})}function se(){return`
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
`}function de({accountNumber:f,recordId:C,entitySlug:x}){const[m,w]=l.useState([]),[i,E]=l.useState(null),[A,N]=l.useState(!0),[$,a]=l.useState(!1),[c,s]=l.useState("calendar"),[g,u]=l.useState("dayGridMonth"),[v,r]=l.useState(!1),[k,d]=l.useState(null),[t,T]=l.useState(null),D=l.useRef(null),M=l.useRef(null),z=`agenda-${C}`,b=`/account/${f}/api/records/${C}/events`,_=`/account/${f}/api/user/view-preferences`;l.useEffect(()=>{(async()=>{var n;try{const y=await(await fetch(`${_}/${z}`,{credentials:"include"})).json();if(y.success&&((n=y.preferences)!=null&&n.agendaPrefs)){const o=y.preferences.agendaPrefs;o.viewMode&&s(o.viewMode),o.calendarView&&u(o.calendarView)}}catch{}a(!0)})()},[_,z]);const O=l.useCallback(async n=>{try{const p={viewMode:c,calendarView:g,...n};await fetch(_,{method:"POST",headers:{"Content-Type":"application/json"},credentials:"include",body:JSON.stringify({viewId:z,preferences:{agendaPrefs:p}})})}catch(p){console.warn("[RecordAgenda] Prefs save error:",p)}},[_,z,c,g]),V=l.useCallback(n=>{s(n),O({viewMode:n})},[O]),R=l.useCallback((n,p)=>{if(!n||!i)return null;const y=(i.customFields||[]).find(h=>h.name===p);if(!y)return null;const o=(n.customFields||[]).find(h=>{var S,I;const j=((S=h.field_id)==null?void 0:S._id)||h.field_id;return(j==null?void 0:j.toString())===((I=y._id)==null?void 0:I.toString())});return(o==null?void 0:o.value)||null},[i]),F=l.useCallback(n=>{if(!n||!(i!=null&&i.statusClassification))return{label:"Planifié",color:"#3b82f6"};const p=i.statusClassification,y=(n.classificationValues||[]).find(h=>{var j,S;return((j=h.classificationId)==null?void 0:j.toString())===((S=p._id)==null?void 0:S.toString())});if(!y)return{label:"Planifié",color:"#3b82f6"};const o=(p.options||[]).find(h=>{var j,S;return((j=h._id)==null?void 0:j.toString())===((S=y.optionId)==null?void 0:S.toString())});return o?{label:o.label,color:o.color||"#3b82f6"}:{label:"Planifié",color:"#3b82f6"}},[i]),Y=l.useMemo(()=>m.map(n=>{var L;const p=F(n),y=R(n,"duree_evenement"),o=R(n,"lieu_evenement"),h=R(n,"type_evenement"),j=R(n,"notes_evenement");let S=n.date?new Date(n.date):new Date,I=n.end_date?new Date(n.end_date):null;return!I&&y?I=new Date(S.getTime()+(parseInt(y)||30)*6e4):I||(I=new Date(S.getTime()+30*6e4)),{id:(L=n._id)==null?void 0:L.toString(),title:n.title||"Sans titre",start:S.toISOString(),end:I.toISOString(),backgroundColor:p.color,borderColor:p.color,textColor:"#fff",extendedProps:{_raw:n,status:p.label,statusColor:p.color,duration:y,lieu:o,type:h,notes:j}}}),[m,F,R]),P=l.useCallback(async()=>{try{const p=await(await fetch(b,{credentials:"include"})).json();p.success&&(w(p.events||[]),E(p.entityData||null))}catch(n){console.error("[RecordAgenda] Fetch error:",n)}N(!1)},[b]);l.useEffect(()=>{P()},[P]);const B=l.useRef(g);B.current=g,l.useEffect(()=>{var y;if(c!=="calendar"||A||!$||!D.current)return;if(typeof FullCalendar>"u"){console.error("[RecordAgenda] FullCalendar not loaded");return}const n=(y=M.current)==null?void 0:y.getDate();M.current&&M.current.destroy();const p=new FullCalendar.Calendar(D.current,{initialView:B.current,initialDate:n||void 0,locale:"fr",headerToolbar:{left:"prev,next today",center:"title",right:"dayGridMonth,timeGridWeek,timeGridDay"},buttonText:{today:"Aujourd'hui",month:"Mois",week:"Semaine",day:"Jour"},editable:!0,dayMaxEvents:3,selectable:!0,droppable:!1,nowIndicator:!0,slotMinTime:"07:00:00",slotMaxTime:"21:00:00",allDaySlot:!1,height:"100%",expandRows:!0,eventTimeFormat:{hour:"2-digit",minute:"2-digit",meridiem:!1,hour12:!1},events:Y,datesSet:o=>{const h=o.view.type;h!==B.current&&(B.current=h,u(h),fetch(_,{method:"POST",headers:{"Content-Type":"application/json"},credentials:"include",body:JSON.stringify({viewId:z,preferences:{agendaPrefs:{viewMode:"calendar",calendarView:h}}})}).catch(()=>{}))},eventClick:o=>{const h=o.event.extendedProps._raw;d(h),r(!0)},dateClick:o=>{T(o.dateStr),d(null),r(!0)},eventDrop:async o=>{var I,L;const h=o.event.id,j=(I=o.event.start)==null?void 0:I.toISOString(),S=(L=o.event.end)==null?void 0:L.toISOString();try{await fetch(`${b}/${h}/drag`,{method:"PATCH",headers:{"Content-Type":"application/json"},credentials:"include",body:JSON.stringify({newStart:j,newEnd:S})}),await P()}catch(H){console.error("[RecordAgenda] Drag error:",H),o.revert()}},eventResize:async o=>{var I,L;const h=o.event.id,j=(I=o.event.start)==null?void 0:I.toISOString(),S=(L=o.event.end)==null?void 0:L.toISOString();try{await fetch(`${b}/${h}/drag`,{method:"PATCH",headers:{"Content-Type":"application/json"},credentials:"include",body:JSON.stringify({newStart:j,newEnd:S})}),await P()}catch(H){console.error("[RecordAgenda] Resize error:",H),o.revert()}},eventDidMount:o=>{const h=o.event.extendedProps;let j=o.event.title;h.lieu&&(j+=`
📍 ${h.lieu}`),h.status&&(j+=`
● ${h.status}`),o.el.title=j}});return p.render(),M.current=p,()=>{M.current&&(M.current.destroy(),M.current=null)}},[c,A,$,Y,b,P,_,z]);const Z=l.useCallback(async n=>{try{(await(await fetch(b,{method:"POST",headers:{"Content-Type":"application/json"},credentials:"include",body:JSON.stringify(n)})).json()).success&&(await P(),r(!1),d(null),T(null))}catch(p){console.error("[RecordAgenda] Create error:",p)}},[b,P]),q=l.useCallback(async(n,p)=>{try{(await(await fetch(`${b}/${n}`,{method:"PATCH",headers:{"Content-Type":"application/json"},credentials:"include",body:JSON.stringify(p)})).json()).success&&(await P(),r(!1),d(null))}catch(y){console.error("[RecordAgenda] Update error:",y)}},[b,P]),U=l.useCallback(async n=>{if(confirm("Supprimer cet événement ?"))try{(await(await fetch(`${b}/${n}`,{method:"DELETE",credentials:"include"})).json()).success&&(await P(),r(!1),d(null))}catch(p){console.error("[RecordAgenda] Delete error:",p)}},[b,P]),J=l.useCallback(()=>{d(null),T(null),r(!0)},[]),G=l.useCallback(n=>{d(n),r(!0)},[]);return A||!$?e.jsxs("div",{className:"ra-loading",children:[e.jsx("div",{className:"ra-spinner"}),e.jsx("span",{children:"Chargement de l'agenda..."})]}):e.jsxs("div",{className:"ra-container",children:[e.jsx("style",{children:ce()}),e.jsx(ee,{viewMode:c,onViewChange:V,onNewEvent:J,eventCount:m.length}),c==="calendar"&&e.jsx("div",{className:"ra-calendar-wrap",children:e.jsx("div",{ref:D,className:"ra-calendar"})}),c==="timeline"&&e.jsx(oe,{events:m,entityData:i,onEventClick:G,getStatusInfo:F,getCustomFieldValue:R}),c==="list"&&e.jsx(ie,{events:m,entityData:i,onEventClick:G,onDeleteEvent:U,getStatusInfo:F,getCustomFieldValue:R}),m.length===0&&!A&&e.jsxs("div",{className:"ra-empty",children:[e.jsx("div",{className:"ra-empty-icon",children:e.jsxs("svg",{width:"48",height:"48",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"1.5",children:[e.jsx("rect",{x:"3",y:"4",width:"18",height:"18",rx:"2",ry:"2"}),e.jsx("line",{x1:"16",y1:"2",x2:"16",y2:"6"}),e.jsx("line",{x1:"8",y1:"2",x2:"8",y2:"6"}),e.jsx("line",{x1:"3",y1:"10",x2:"21",y2:"10"}),e.jsx("line",{x1:"10",y1:"14",x2:"14",y2:"18"}),e.jsx("line",{x1:"14",y1:"14",x2:"10",y2:"18"})]})}),e.jsx("h3",{children:"Aucun événement"}),e.jsx("p",{children:"Ajoutez votre premier événement pour commencer à organiser votre agenda."}),e.jsxs("button",{className:"ra-empty-btn",onClick:J,children:[e.jsxs("svg",{width:"16",height:"16",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",children:[e.jsx("line",{x1:"12",y1:"5",x2:"12",y2:"19"}),e.jsx("line",{x1:"5",y1:"12",x2:"19",y2:"12"})]}),"Nouvel événement"]})]}),e.jsx(re,{isOpen:v,onClose:()=>{r(!1),d(null),T(null)},event:k,entityData:i,prefillDate:t,onCreate:Z,onUpdate:q,onDelete:U,getCustomFieldValue:R,getStatusInfo:F})]})}function ce(){return`
/* ═══ Record Agenda Island — App Layout ═══ */
.ra-container {
    font-family: 'Nunito', sans-serif;
    display: flex; flex-direction: column;
    height: 100%; min-height: 0;
}
.ra-loading { display:flex; align-items:center; justify-content:center; gap:12px; padding:60px 0; color:#888da8; font-size:14px; }
.ra-spinner { width:24px; height:24px; border:3px solid #e2e8f0; border-top-color:#14b8a6; border-radius:50%; animation:raSpin .8s linear infinite; }
@keyframes raSpin { to { transform:rotate(360deg); } }

/* Calendar wrapper — fills available space */
.ra-calendar-wrap {
    background:#fff; border-radius:14px; border:1px solid #e8ecf1;
    padding:16px; overflow:hidden;
    flex: 1; min-height: 0;
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
`}function K(){document.querySelectorAll('[data-island="record-agenda"]').forEach(f=>{if(f.dataset.mounted==="1")return;f.dataset.mounted="1";const C={accountNumber:f.dataset.accountNumber,recordId:f.dataset.recordId,entitySlug:f.dataset.entitySlug};console.log("[RecordAgenda Island] Mounting:",C),X(f).render(e.jsx(Q.StrictMode,{children:e.jsx(de,{...C})}))})}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",K):K();
