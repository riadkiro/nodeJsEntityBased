import{j as e,r as l,c as ae,R as ne}from"./chunks/client-CkWOIrXP.js";function oe({viewMode:s,onViewChange:C,onNewEvent:x,eventCount:h}){const k=[{key:"calendar",icon:"M3 4h18M3 10h18M3 16h18",label:"Calendrier"},{key:"timeline",icon:"M12 2v20M2 12h20",label:"Timeline"},{key:"list",icon:"M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01",label:"Liste"}];return e.jsxs("div",{className:"ra-toolbar",children:[e.jsx("style",{children:ie()}),e.jsx("div",{className:"ra-toolbar-left",children:e.jsxs("div",{className:"ra-view-pills",children:[k.map(d=>e.jsxs("button",{className:`ra-vpill ${s===d.key?"active":""}`,onClick:()=>C(d.key),children:[e.jsx("svg",{width:"14",height:"14",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",children:e.jsx("path",{d:d.icon})}),d.label]},d.key)),e.jsx("span",{className:"ra-vpill-count",children:h})]})}),e.jsx("div",{className:"ra-toolbar-right",children:e.jsxs("button",{className:"ra-new-event-btn",onClick:x,children:[e.jsxs("svg",{width:"16",height:"16",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2.5",children:[e.jsx("line",{x1:"12",y1:"5",x2:"12",y2:"19"}),e.jsx("line",{x1:"5",y1:"12",x2:"19",y2:"12"})]}),"Nouvel événement"]})})]})}function ie(){return`
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
`}const le=[{value:"consultation",label:"Consultation",color:"#4361ee"},{value:"reunion",label:"Réunion",color:"#8b5cf6"},{value:"rappel",label:"Rappel",color:"#f59e0b"},{value:"tache",label:"Tâche",color:"#10b981"},{value:"personnel",label:"Personnel",color:"#ec4899"},{value:"autre",label:"Autre",color:"#6b7280"}];function se({isOpen:s,onClose:C,event:x,entityData:h,prefillDate:k,onCreate:d,onUpdate:_,onDelete:L,getCustomFieldValue:D,getStatusInfo:R}){var z;const[r,b]=l.useState({title:"",date:"",endDate:"",duration:30,type:"consultation",lieu:"",notes:"",statusOptionId:""}),[i,m]=l.useState(!1),[g,S]=l.useState(""),a=!!x;l.useEffect(()=>{var t,I,M,T,O;if(s)if(S(""),x){R(x);const j=(x.classificationValues||[]).find(F=>{var E,H,A;return((E=F.classificationId)==null?void 0:E.toString())===((A=(H=h==null?void 0:h.statusClassification)==null?void 0:H._id)==null?void 0:A.toString())});b({title:x.title||"",date:x.date?J(new Date(x.date)):"",endDate:x.end_date?J(new Date(x.end_date)):"",duration:D(x,"duree_evenement")||30,type:D(x,"type_evenement")||"consultation",lieu:D(x,"lieu_evenement")||"",notes:D(x,"notes_evenement")||"",statusOptionId:((t=j==null?void 0:j.optionId)==null?void 0:t.toString())||""})}else{let j="";if(k){const E=new Date(k);isNaN(E.getTime())?j=k+"T09:00":(E.setMinutes(Math.round(E.getMinutes()/5)*5,0,0),j=J(E))}else{const E=new Date;E.setMinutes(Math.ceil(E.getMinutes()/5)*5,0,0),j=J(E)}const F=((O=(T=(M=(I=h==null?void 0:h.statusClassification)==null?void 0:I.options)==null?void 0:M[0])==null?void 0:T._id)==null?void 0:O.toString())||"";b({title:"",date:j,endDate:"",duration:30,type:"consultation",lieu:"",notes:"",statusOptionId:F})}},[s,x,k,h]);const y=l.useCallback((t,I)=>{S(""),b(M=>({...M,[t]:I}))},[]),f=l.useCallback(async()=>{if(r.title.trim()){m(!0),S("");try{const t=Q(r.date,"Date");let I=r.endDate?Q(r.endDate,"Date de fin").toISOString():void 0;!I&&t&&r.duration&&(I=new Date(t.getTime()+(parseInt(r.duration)||30)*6e4).toISOString());const M={title:r.title.trim(),date:t?t.toISOString():void 0,endDate:I,duration:parseInt(r.duration)||30,type:r.type,lieu:r.lieu,notes:r.notes,statusOptionId:r.statusOptionId||void 0};a?await _(x._id.toString(),M):await d(M)}catch(t){console.error("[EventModal] Save error:",t),S(t.message||"Impossible d'enregistrer cet evenement.")}finally{m(!1)}}},[r,a,x,d,_]);if(!s)return null;const w=((z=h==null?void 0:h.statusClassification)==null?void 0:z.options)||[];return e.jsxs("div",{className:"ra-modal-overlay",onClick:C,children:[e.jsxs("div",{className:"ra-modal",onClick:t=>t.stopPropagation(),children:[e.jsxs("div",{className:"ra-modal-header",children:[e.jsxs("div",{className:"ra-modal-header-left",children:[e.jsx("div",{className:"ra-modal-icon",children:e.jsxs("svg",{width:"18",height:"18",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",children:[e.jsx("rect",{x:"3",y:"4",width:"18",height:"18",rx:"2",ry:"2"}),e.jsx("line",{x1:"16",y1:"2",x2:"16",y2:"6"}),e.jsx("line",{x1:"8",y1:"2",x2:"8",y2:"6"}),e.jsx("line",{x1:"3",y1:"10",x2:"21",y2:"10"})]})}),e.jsx("h3",{children:a?"Modifier l'événement":"Nouvel événement"})]}),e.jsx("button",{className:"ra-modal-close",onClick:C,children:e.jsxs("svg",{width:"16",height:"16",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",children:[e.jsx("line",{x1:"18",y1:"6",x2:"6",y2:"18"}),e.jsx("line",{x1:"6",y1:"6",x2:"18",y2:"18"})]})})]}),e.jsxs("div",{className:"ra-modal-body",children:[e.jsxs("div",{className:"ra-field",children:[e.jsx("label",{className:"ra-label",children:"Titre"}),e.jsx("input",{type:"text",className:"ra-input",placeholder:"Ex: Consultation de suivi...",value:r.title,onChange:t=>y("title",t.target.value),autoFocus:!0})]}),e.jsxs("div",{className:"ra-field-row",children:[e.jsxs("div",{className:"ra-field",style:{flex:1},children:[e.jsx("label",{className:"ra-label",children:"Date & heure"}),e.jsx("input",{type:"datetime-local",className:"ra-input",step:"300",value:r.date,onChange:t=>y("date",t.target.value)})]}),e.jsxs("div",{className:"ra-field",style:{width:100},children:[e.jsx("label",{className:"ra-label",children:"Durée (min)"}),e.jsx("input",{type:"number",className:"ra-input",value:r.duration,onChange:t=>y("duration",t.target.value),min:"5",max:"480",step:"5"})]})]}),e.jsx("div",{className:"ra-field-row",children:e.jsxs("div",{className:"ra-field",style:{flex:1},children:[e.jsx("label",{className:"ra-label",children:"Type"}),e.jsx("div",{className:"ra-type-pills",children:le.map(t=>e.jsxs("button",{className:`ra-type-pill ${r.type===t.value?"active":""}`,style:{"--pill-c":t.color,background:r.type===t.value?`${t.color}15`:void 0,borderColor:r.type===t.value?`${t.color}40`:void 0,color:r.type===t.value?t.color:void 0},onClick:()=>y("type",t.value),type:"button",children:[e.jsx("span",{className:"ra-pill-dot",style:{background:t.color}}),t.label]},t.value))})]})}),w.length>0&&e.jsxs("div",{className:"ra-field",children:[e.jsx("label",{className:"ra-label",children:"Statut"}),e.jsx("div",{className:"ra-status-pills",children:w.map(t=>e.jsxs("button",{className:`ra-status-pill ${r.statusOptionId===t._id.toString()?"active":""}`,style:{"--st-c":t.color,background:r.statusOptionId===t._id.toString()?`${t.color}15`:void 0,borderColor:r.statusOptionId===t._id.toString()?t.color:void 0,color:r.statusOptionId===t._id.toString()?t.color:void 0},onClick:()=>y("statusOptionId",t._id.toString()),type:"button",children:[e.jsx("span",{className:"ra-pill-dot",style:{background:t.color}}),t.label]},t._id.toString()))})]}),e.jsxs("div",{className:"ra-field",children:[e.jsx("label",{className:"ra-label",children:"Lieu"}),e.jsx("input",{type:"text",className:"ra-input",placeholder:"Cabinet, Salle A, Domicile...",value:r.lieu,onChange:t=>y("lieu",t.target.value)})]}),e.jsxs("div",{className:"ra-field",children:[e.jsx("label",{className:"ra-label",children:"Notes"}),e.jsx("textarea",{className:"ra-input ra-textarea",placeholder:"Notes additionnelles...",rows:3,value:r.notes,onChange:t=>y("notes",t.target.value)})]}),g&&e.jsx("div",{className:"ra-modal-error",role:"alert",children:g})]}),e.jsxs("div",{className:"ra-modal-footer",children:[a&&e.jsxs("button",{className:"ra-delete-btn",onClick:()=>L(x._id.toString()),type:"button",children:[e.jsxs("svg",{width:"14",height:"14",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",children:[e.jsx("polyline",{points:"3 6 5 6 21 6"}),e.jsx("path",{d:"M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"})]}),"Supprimer"]}),e.jsxs("div",{className:"ra-modal-footer-right",children:[e.jsx("button",{className:"ra-cancel-btn",onClick:C,type:"button",children:"Annuler"}),e.jsx("button",{className:"ra-save-btn",onClick:f,disabled:i||!r.title.trim(),type:"button",children:i?"Enregistrement...":a?"Mettre à jour":"Créer"})]})]})]}),e.jsx("style",{children:de()})]})}function J(s){const C=s.getFullYear(),x=String(s.getMonth()+1).padStart(2,"0"),h=String(s.getDate()).padStart(2,"0"),k=String(s.getHours()).padStart(2,"0"),d=String(s.getMinutes()).padStart(2,"0");return`${C}-${x}-${h}T${k}:${d}`}function Q(s,C){if(!s)return null;const x=new Date(s);if(Number.isNaN(x.getTime()))throw new Error(`${C} invalide.`);return x}function de(){return`
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
`}function ce({events:s,entityData:C,onEventClick:x,getStatusInfo:h,getCustomFieldValue:k}){const d=l.useMemo(()=>{const r=[...s].sort((i,m)=>{const g=i.date?new Date(i.date).getTime():0,S=m.date?new Date(m.date).getTime():0;return g-S}),b={};return r.forEach(i=>{const g=(i.date?new Date(i.date):new Date).toISOString().split("T")[0];b[g]||(b[g]=[]),b[g].push(i)}),Object.entries(b).map(([i,m])=>({dateKey:i,date:new Date(i),items:m}))},[s]),_=r=>{const b=new Date,i=new Date(b);i.setDate(i.getDate()+1);const m=new Date(b);m.setDate(m.getDate()-1);const g=r.toISOString().split("T")[0];return g===b.toISOString().split("T")[0]?"Aujourd'hui":g===i.toISOString().split("T")[0]?"Demain":g===m.toISOString().split("T")[0]?"Hier":r.toLocaleDateString("fr-FR",{weekday:"long",day:"numeric",month:"long",year:"numeric"})},L=r=>r?new Date(r).toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit",hour12:!1}):"",D=r=>r?new Date(r)<new Date:!1,R=r=>r?new Date(r).toISOString().split("T")[0]===new Date().toISOString().split("T")[0]:!1;return s.length===0?null:e.jsxs("div",{className:"ra-timeline",children:[e.jsx("style",{children:pe()}),d.map((r,b)=>e.jsxs("div",{className:"ra-tl-group",style:{animationDelay:`${b*80}ms`},children:[e.jsxs("div",{className:`ra-tl-date-header ${R(r.dateKey)?"today":""} ${D(r.dateKey)&&!R(r.dateKey)?"past":""}`,children:[e.jsx("div",{className:"ra-tl-date-dot"}),e.jsx("span",{className:"ra-tl-date-label",children:_(r.date)}),e.jsxs("span",{className:"ra-tl-date-count",children:[r.items.length," événement",r.items.length>1?"s":""]})]}),e.jsx("div",{className:"ra-tl-items",children:r.items.map((i,m)=>{var w;const g=h(i),S=k(i,"lieu_evenement"),a=k(i,"duree_evenement"),y=k(i,"type_evenement"),f=D(i.date);return e.jsxs("div",{className:`ra-tl-item ${f?"past":""}`,style:{animationDelay:`${b*80+m*50}ms`},onClick:()=>x(i),children:[e.jsx("div",{className:"ra-tl-time",children:L(i.date)}),e.jsxs("div",{className:"ra-tl-connector",children:[e.jsx("div",{className:"ra-tl-line"}),e.jsx("div",{className:"ra-tl-node",style:{borderColor:g.color,background:`${g.color}20`}}),e.jsx("div",{className:"ra-tl-line"})]}),e.jsxs("div",{className:"ra-tl-card",children:[e.jsx("div",{className:"ra-tl-card-accent",style:{background:g.color}}),e.jsxs("div",{className:"ra-tl-card-body",children:[e.jsxs("div",{className:"ra-tl-card-top",children:[e.jsx("h4",{className:"ra-tl-card-title",children:i.title||"Sans titre"}),e.jsx("span",{className:"ra-tl-status",style:{background:`${g.color}15`,color:g.color},children:g.label})]}),e.jsxs("div",{className:"ra-tl-card-meta",children:[a&&e.jsxs("span",{className:"ra-tl-meta-item",children:[e.jsxs("svg",{width:"12",height:"12",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",children:[e.jsx("circle",{cx:"12",cy:"12",r:"10"}),e.jsx("polyline",{points:"12 6 12 12 16 14"})]}),a," min"]}),S&&e.jsxs("span",{className:"ra-tl-meta-item",children:[e.jsxs("svg",{width:"12",height:"12",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",children:[e.jsx("path",{d:"M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"}),e.jsx("circle",{cx:"12",cy:"10",r:"3"})]}),S]}),y&&e.jsxs("span",{className:"ra-tl-meta-item",children:[e.jsxs("svg",{width:"12",height:"12",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",children:[e.jsx("path",{d:"M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"}),e.jsx("line",{x1:"7",y1:"7",x2:"7.01",y2:"7"})]}),y.charAt(0).toUpperCase()+y.slice(1)]})]})]})]})]},(w=i._id)==null?void 0:w.toString())})})]},r.dateKey))]})}function pe(){return`
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
`}function fe({events:s,entityData:C,onEventClick:x,onDeleteEvent:h,getStatusInfo:k,getCustomFieldValue:d}){const[_,L]=l.useState("date"),[D,R]=l.useState("asc"),r=l.useMemo(()=>[...s].sort((a,y)=>{let f,w;switch(_){case"title":return f=(a.title||"").toLowerCase(),w=(y.title||"").toLowerCase(),D==="asc"?f.localeCompare(w):w.localeCompare(f);case"status":return f=k(a).label,w=k(y).label,D==="asc"?f.localeCompare(w):w.localeCompare(f);case"type":return f=d(a,"type_evenement")||"",w=d(y,"type_evenement")||"",D==="asc"?f.localeCompare(w):w.localeCompare(f);case"date":default:return f=a.date?new Date(a.date).getTime():0,w=y.date?new Date(y.date).getTime():0,D==="asc"?f-w:w-f}}),[s,_,D,k,d]),b=a=>{_===a?R(y=>y==="asc"?"desc":"asc"):(L(a),R("asc"))},i=a=>a?new Date(a).toLocaleDateString("fr-FR",{day:"2-digit",month:"short",year:"numeric"}):"—",m=a=>a?new Date(a).toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit",hour12:!1}):"",g=a=>a&&new Date(a)<new Date,S=({field:a})=>e.jsx("svg",{width:"10",height:"10",viewBox:"0 0 10 10",fill:"none",style:{opacity:_===a?1:.3},children:e.jsx("path",{d:_===a&&D==="desc"?"M5 2L8 6H2L5 2Z":"M5 8L2 4H8L5 8Z",fill:"currentColor"})});return s.length===0?null:e.jsxs("div",{className:"ra-list-wrap",children:[e.jsx("style",{children:ue()}),e.jsxs("table",{className:"ra-list-table",children:[e.jsx("thead",{children:e.jsxs("tr",{children:[e.jsxs("th",{className:"ra-th ra-th-sortable",onClick:()=>b("title"),children:["Titre ",e.jsx(S,{field:"title"})]}),e.jsxs("th",{className:"ra-th ra-th-sortable",onClick:()=>b("date"),children:["Date ",e.jsx(S,{field:"date"})]}),e.jsx("th",{className:"ra-th",children:"Heure"}),e.jsx("th",{className:"ra-th",children:"Durée"}),e.jsxs("th",{className:"ra-th ra-th-sortable",onClick:()=>b("type"),children:["Type ",e.jsx(S,{field:"type"})]}),e.jsx("th",{className:"ra-th",children:"Lieu"}),e.jsxs("th",{className:"ra-th ra-th-sortable",onClick:()=>b("status"),children:["Statut ",e.jsx(S,{field:"status"})]}),e.jsx("th",{className:"ra-th",style:{width:40}})]})}),e.jsx("tbody",{children:r.map((a,y)=>{var M;const f=k(a),w=d(a,"type_evenement"),z=d(a,"lieu_evenement"),t=d(a,"duree_evenement"),I=g(a.date);return e.jsxs("tr",{className:`ra-tr ${I?"past":""}`,onClick:()=>x(a),style:{animationDelay:`${y*30}ms`},children:[e.jsxs("td",{className:"ra-td ra-td-title",children:[e.jsx("div",{className:"ra-td-title-dot",style:{background:f.color}}),a.title||"Sans titre"]}),e.jsx("td",{className:"ra-td",children:i(a.date)}),e.jsx("td",{className:"ra-td ra-td-time",children:m(a.date)}),e.jsx("td",{className:"ra-td",children:t?`${t} min`:"—"}),e.jsx("td",{className:"ra-td ra-td-type",children:w?e.jsx("span",{className:"ra-td-type-badge",children:w.charAt(0).toUpperCase()+w.slice(1)}):"—"}),e.jsx("td",{className:"ra-td",children:z||"—"}),e.jsx("td",{className:"ra-td",children:e.jsx("span",{className:"ra-td-status",style:{background:`${f.color}12`,color:f.color},children:f.label})}),e.jsx("td",{className:"ra-td ra-td-actions",children:e.jsx("button",{className:"ra-td-delete",onClick:T=>{var O;T.stopPropagation(),h((O=a._id)==null?void 0:O.toString())},title:"Supprimer",children:e.jsxs("svg",{width:"14",height:"14",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",children:[e.jsx("polyline",{points:"3 6 5 6 21 6"}),e.jsx("path",{d:"M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"})]})})})]},(M=a._id)==null?void 0:M.toString())})})]})]})}function ue(){return`
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
`}function xe({accountNumber:s,recordId:C,entitySlug:x}){const[h,k]=l.useState([]),[d,_]=l.useState(null),[L,D]=l.useState(!0),[R,r]=l.useState(!1),[b,i]=l.useState(""),[m,g]=l.useState("calendar"),[S,a]=l.useState("dayGridMonth"),[y,f]=l.useState(!1),[w,z]=l.useState(null),[t,I]=l.useState(null),M=l.useRef(null),T=l.useRef(null),O=`agenda-${C}`,j=`/account/${s}/api/records/${C}/events`,F=`/account/${s}/api/user/view-preferences`;l.useEffect(()=>{(async()=>{var n;try{const c=await(await fetch(`${F}/${O}`,{credentials:"include"})).json();if(c.success&&((n=c.preferences)!=null&&n.agendaPrefs)){const v=c.preferences.agendaPrefs;v.viewMode&&g(v.viewMode),v.calendarView&&a(v.calendarView)}}catch{}r(!0)})()},[F,O]);const E=l.useCallback(async n=>{try{const o={viewMode:m,calendarView:S,...n};await fetch(F,{method:"POST",headers:{"Content-Type":"application/json"},credentials:"include",body:JSON.stringify({viewId:O,preferences:{agendaPrefs:o}})})}catch(o){console.warn("[RecordAgenda] Prefs save error:",o)}},[F,O,m,S]),H=l.useCallback(n=>{g(n),E({viewMode:n})},[E]),A=l.useCallback((n,o)=>{if(!n||!d)return null;const c=(d.customFields||[]).find(u=>u.name===o);if(!c)return null;const v=(n.customFields||[]).find(u=>{var N,$;const p=((N=u.field_id)==null?void 0:N._id)||u.field_id;return(p==null?void 0:p.toString())===(($=c._id)==null?void 0:$.toString())});return(v==null?void 0:v.value)||null},[d]),B=l.useCallback(n=>{if(!n||!(d!=null&&d.statusClassification))return{label:"Planifié",color:"#3b82f6"};const o=d.statusClassification,c=(n.classificationValues||[]).find(u=>{var p,N;return((p=u.classificationId)==null?void 0:p.toString())===((N=o._id)==null?void 0:N.toString())});if(!c)return{label:"Planifié",color:"#3b82f6"};const v=(o.options||[]).find(u=>{var p,N;return((p=u._id)==null?void 0:p.toString())===((N=c.optionId)==null?void 0:N.toString())});return v?{label:v.label,color:v.color||"#3b82f6"}:{label:"Planifié",color:"#3b82f6"}},[d]),Y=l.useMemo(()=>h.map(n=>{var V;const o=B(n),c=A(n,"duree_evenement"),v=A(n,"lieu_evenement"),u=A(n,"type_evenement"),p=A(n,"notes_evenement");let N=n.date?new Date(n.date):new Date,$=n.end_date?new Date(n.end_date):null;return!$&&c?$=new Date(N.getTime()+(parseInt(c)||30)*6e4):$||($=new Date(N.getTime()+30*6e4)),{id:(V=n._id)==null?void 0:V.toString(),title:n.title||"Sans titre",start:N.toISOString(),end:$.toISOString(),backgroundColor:o.color,borderColor:o.color,textColor:"#fff",extendedProps:{_raw:n,status:o.label,statusColor:o.color,duration:c,lieu:v,type:u,notes:p}}}),[h,B,A]),P=l.useCallback(async()=>{try{const n=await fetch(j,{credentials:"include"}),o=await n.json().catch(()=>({}));n.ok&&o.success?(k(o.events||[]),_(o.entityData||null),i("")):(k([]),_(o.entityData||null),i(o.error||o.message||"Impossible de charger les evenements."))}catch(n){console.error("[RecordAgenda] Fetch error:",n),i("Impossible de charger les evenements.")}D(!1)},[j]);l.useEffect(()=>{P()},[P]);const U=l.useRef(S);U.current=S;const K=l.useRef(Y);K.current=Y,l.useEffect(()=>{var v;if(m!=="calendar"||L||!R||!M.current)return;if(typeof FullCalendar>"u"){console.error("[RecordAgenda] FullCalendar not loaded");return}const n=(v=T.current)==null?void 0:v.getDate();T.current&&T.current.destroy();let o=!1;const c=new FullCalendar.Calendar(M.current,{initialView:U.current,initialDate:n||void 0,locale:"fr",headerToolbar:{left:"prev,next today",center:"title",right:"dayGridMonth,timeGridWeek,timeGridDay"},buttonText:{today:"Aujourd'hui",month:"Mois",week:"Semaine",day:"Jour"},editable:!0,dayMaxEvents:3,selectable:!0,droppable:!1,nowIndicator:!0,slotMinTime:"07:00:00",slotMaxTime:"21:00:00",slotDuration:"00:15:00",snapDuration:"00:05:00",allDaySlot:!1,height:"100%",expandRows:!0,eventTimeFormat:{hour:"2-digit",minute:"2-digit",meridiem:!1,hour12:!1},events:K.current,datesSet:u=>{if(!o)return;const p=u.view.type;p!==U.current&&(U.current=p,a(p),fetch(F,{method:"POST",headers:{"Content-Type":"application/json"},credentials:"include",body:JSON.stringify({viewId:O,preferences:{agendaPrefs:{viewMode:"calendar",calendarView:p}}})}).catch(()=>{}))},eventClick:u=>{const p=u.event.extendedProps._raw;z(p),f(!0)},dateClick:u=>{const p=new Date(u.dateStr);p.setMinutes(Math.round(p.getMinutes()/5)*5,0,0),I(p.toISOString()),z(null),f(!0)},eventDrop:async u=>{var V,W;const p=u.event.id,N=(V=u.event.start)==null?void 0:V.toISOString(),$=(W=u.event.end)==null?void 0:W.toISOString();try{await fetch(`${j}/${p}/drag`,{method:"PATCH",headers:{"Content-Type":"application/json"},credentials:"include",body:JSON.stringify({newStart:N,newEnd:$})}),await P()}catch(G){console.error("[RecordAgenda] Drag error:",G),u.revert()}},eventResize:async u=>{var V,W;const p=u.event.id,N=(V=u.event.start)==null?void 0:V.toISOString(),$=(W=u.event.end)==null?void 0:W.toISOString();try{await fetch(`${j}/${p}/drag`,{method:"PATCH",headers:{"Content-Type":"application/json"},credentials:"include",body:JSON.stringify({newStart:N,newEnd:$})}),await P()}catch(G){console.error("[RecordAgenda] Resize error:",G),u.revert()}},eventDidMount:u=>{const p=u.event.extendedProps;let N=u.event.title;p.lieu&&(N+=`
📍 ${p.lieu}`),p.status&&(N+=`
● ${p.status}`),u.el.title=N}});return c.render(),T.current=c,requestAnimationFrame(()=>{o=!0}),()=>{T.current&&(T.current.destroy(),T.current=null)}},[m,L,R,j,P,F,O]),l.useEffect(()=>{if(!T.current)return;const n=T.current;n.removeAllEvents(),n.addEventSource(Y)},[Y]);const te=l.useCallback(async n=>{try{i("");const o=await fetch(j,{method:"POST",headers:{"Content-Type":"application/json"},credentials:"include",body:JSON.stringify(n)}),c=await o.json().catch(()=>({}));if(!o.ok||!c.success)throw new Error(c.error||c.message||"Impossible de creer l'evenement.");await P(),f(!1),z(null),I(null)}catch(o){throw console.error("[RecordAgenda] Create error:",o),i(o.message||"Impossible de creer l'evenement."),o}},[j,P]),re=l.useCallback(async(n,o)=>{try{i("");const c=await fetch(`${j}/${n}`,{method:"PATCH",headers:{"Content-Type":"application/json"},credentials:"include",body:JSON.stringify(o)}),v=await c.json().catch(()=>({}));if(!c.ok||!v.success)throw new Error(v.error||v.message||"Impossible de mettre a jour l'evenement.");await P(),f(!1),z(null)}catch(c){throw console.error("[RecordAgenda] Update error:",c),i(c.message||"Impossible de mettre a jour l'evenement."),c}},[j,P]),q=l.useCallback(async n=>{if(confirm("Supprimer cet événement ?"))try{i("");const o=await fetch(`${j}/${n}`,{method:"DELETE",credentials:"include"}),c=await o.json().catch(()=>({}));if(!o.ok||!c.success)throw new Error(c.error||c.message||"Impossible de supprimer l'evenement.");await P(),f(!1),z(null)}catch(o){console.error("[RecordAgenda] Delete error:",o),i(o.message||"Impossible de supprimer l'evenement.")}},[j,P]),Z=l.useCallback(()=>{z(null),I(null),f(!0)},[]),X=l.useCallback(n=>{z(n),f(!0)},[]);return L||!R?e.jsxs("div",{className:"ra-loading",children:[e.jsx("div",{className:"ra-spinner"}),e.jsx("span",{children:"Chargement de l'agenda..."})]}):e.jsxs("div",{className:"ra-container",children:[e.jsx("style",{children:he()}),e.jsx(oe,{viewMode:m,onViewChange:H,onNewEvent:Z,eventCount:h.length}),b&&e.jsxs("div",{className:"ra-error-banner",children:[e.jsx("span",{children:b}),e.jsx("button",{type:"button",onClick:()=>i(""),"aria-label":"Fermer",children:e.jsxs("svg",{width:"14",height:"14",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",children:[e.jsx("line",{x1:"18",y1:"6",x2:"6",y2:"18"}),e.jsx("line",{x1:"6",y1:"6",x2:"18",y2:"18"})]})})]}),m==="calendar"&&e.jsx("div",{className:"ra-calendar-wrap",children:e.jsx("div",{ref:M,className:"ra-calendar"})}),m==="timeline"&&e.jsx(ce,{events:h,entityData:d,onEventClick:X,getStatusInfo:B,getCustomFieldValue:A}),m==="list"&&e.jsx(fe,{events:h,entityData:d,onEventClick:X,onDeleteEvent:q,getStatusInfo:B,getCustomFieldValue:A}),h.length===0&&!L&&e.jsxs("div",{className:"ra-empty",children:[e.jsx("div",{className:"ra-empty-icon",children:e.jsxs("svg",{width:"48",height:"48",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"1.5",children:[e.jsx("rect",{x:"3",y:"4",width:"18",height:"18",rx:"2",ry:"2"}),e.jsx("line",{x1:"16",y1:"2",x2:"16",y2:"6"}),e.jsx("line",{x1:"8",y1:"2",x2:"8",y2:"6"}),e.jsx("line",{x1:"3",y1:"10",x2:"21",y2:"10"}),e.jsx("line",{x1:"10",y1:"14",x2:"14",y2:"18"}),e.jsx("line",{x1:"14",y1:"14",x2:"10",y2:"18"})]})}),e.jsx("h3",{children:"Aucun événement"}),e.jsx("p",{children:"Ajoutez votre premier événement pour commencer à organiser votre agenda."}),e.jsxs("button",{className:"ra-empty-btn",onClick:Z,children:[e.jsxs("svg",{width:"16",height:"16",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",children:[e.jsx("line",{x1:"12",y1:"5",x2:"12",y2:"19"}),e.jsx("line",{x1:"5",y1:"12",x2:"19",y2:"12"})]}),"Nouvel événement"]})]}),e.jsx(se,{isOpen:y,onClose:()=>{f(!1),z(null),I(null)},event:w,entityData:d,prefillDate:t,onCreate:te,onUpdate:re,onDelete:q,getCustomFieldValue:A,getStatusInfo:B})]})}function he(){return`
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
`}function ee(){document.querySelectorAll('[data-island="record-agenda"]').forEach(s=>{if(s.dataset.mounted==="1")return;s.dataset.mounted="1";const C={accountNumber:s.dataset.accountNumber,recordId:s.dataset.recordId,entitySlug:s.dataset.entitySlug};console.log("[RecordAgenda Island] Mounting:",C),ae(s).render(e.jsx(ne.StrictMode,{children:e.jsx(xe,{...C})}))})}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",ee):ee();
