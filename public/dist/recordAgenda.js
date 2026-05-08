import{j as e,r as o,c as Q,R as ee}from"./chunks/client-CkWOIrXP.js";function te({viewMode:f,onViewChange:C,onNewEvent:h,eventCount:m}){const v=[{key:"calendar",icon:"M3 4h18M3 10h18M3 16h18",label:"Calendrier"},{key:"timeline",icon:"M12 2v20M2 12h20",label:"Timeline"},{key:"list",icon:"M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01",label:"Liste"}];return e.jsxs("div",{className:"ra-toolbar",children:[e.jsx("style",{children:ae()}),e.jsx("div",{className:"ra-toolbar-left",children:e.jsxs("div",{className:"ra-view-pills",children:[v.map(l=>e.jsxs("button",{className:`ra-vpill ${f===l.key?"active":""}`,onClick:()=>C(l.key),children:[e.jsx("svg",{width:"14",height:"14",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",children:e.jsx("path",{d:l.icon})}),l.label]},l.key)),e.jsx("span",{className:"ra-vpill-count",children:m})]})}),e.jsx("div",{className:"ra-toolbar-right",children:e.jsxs("button",{className:"ra-new-event-btn",onClick:h,children:[e.jsxs("svg",{width:"16",height:"16",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2.5",children:[e.jsx("line",{x1:"12",y1:"5",x2:"12",y2:"19"}),e.jsx("line",{x1:"5",y1:"12",x2:"19",y2:"12"})]}),"Nouvel événement"]})})]})}function ae(){return`
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
`}const re=[{value:"consultation",label:"Consultation",color:"#4361ee"},{value:"reunion",label:"Réunion",color:"#8b5cf6"},{value:"rappel",label:"Rappel",color:"#f59e0b"},{value:"tache",label:"Tâche",color:"#10b981"},{value:"personnel",label:"Personnel",color:"#ec4899"},{value:"autre",label:"Autre",color:"#6b7280"}];function ne({isOpen:f,onClose:C,event:h,entityData:m,prefillDate:v,onCreate:l,onUpdate:_,onDelete:A,getCustomFieldValue:S,getStatusInfo:$}){var s;const[a,d]=o.useState({title:"",date:"",endDate:"",duration:30,type:"consultation",lieu:"",notes:"",statusOptionId:""}),[i,g]=o.useState(!1),u=!!h;o.useEffect(()=>{var t,T,D,I,E;if(f)if(h){$(h);const b=(h.classificationValues||[]).find(M=>{var z,B,R;return((z=M.classificationId)==null?void 0:z.toString())===((R=(B=m==null?void 0:m.statusClassification)==null?void 0:B._id)==null?void 0:R.toString())});d({title:h.title||"",date:h.date?H(new Date(h.date)):"",endDate:h.end_date?H(new Date(h.end_date)):"",duration:S(h,"duree_evenement")||30,type:S(h,"type_evenement")||"consultation",lieu:S(h,"lieu_evenement")||"",notes:S(h,"notes_evenement")||"",statusOptionId:((t=b==null?void 0:b.optionId)==null?void 0:t.toString())||""})}else{let b="";if(v){const z=new Date(v);isNaN(z.getTime())?b=v+"T09:00":b=H(z)}else{const z=new Date;z.setMinutes(Math.ceil(z.getMinutes()/15)*15,0,0),b=H(z)}const M=((E=(I=(D=(T=m==null?void 0:m.statusClassification)==null?void 0:T.options)==null?void 0:D[0])==null?void 0:I._id)==null?void 0:E.toString())||"";d({title:"",date:b,endDate:"",duration:30,type:"consultation",lieu:"",notes:"",statusOptionId:M})}},[f,h,v,m]);const k=o.useCallback((t,T)=>{d(D=>({...D,[t]:T}))},[]),r=o.useCallback(async()=>{if(!a.title.trim())return;g(!0);let t=a.endDate;if(!t&&a.date&&a.duration){const D=new Date(a.date);t=new Date(D.getTime()+parseInt(a.duration)*6e4).toISOString()}const T={title:a.title.trim(),date:a.date?new Date(a.date).toISOString():void 0,endDate:t||void 0,duration:parseInt(a.duration)||30,type:a.type,lieu:a.lieu,notes:a.notes,statusOptionId:a.statusOptionId||void 0};try{u?await _(h._id.toString(),T):await l(T)}catch(D){console.error("[EventModal] Save error:",D)}g(!1)},[a,u,h,l,_]);if(!f)return null;const j=((s=m==null?void 0:m.statusClassification)==null?void 0:s.options)||[];return e.jsxs("div",{className:"ra-modal-overlay",onClick:C,children:[e.jsxs("div",{className:"ra-modal",onClick:t=>t.stopPropagation(),children:[e.jsxs("div",{className:"ra-modal-header",children:[e.jsxs("div",{className:"ra-modal-header-left",children:[e.jsx("div",{className:"ra-modal-icon",children:e.jsxs("svg",{width:"18",height:"18",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",children:[e.jsx("rect",{x:"3",y:"4",width:"18",height:"18",rx:"2",ry:"2"}),e.jsx("line",{x1:"16",y1:"2",x2:"16",y2:"6"}),e.jsx("line",{x1:"8",y1:"2",x2:"8",y2:"6"}),e.jsx("line",{x1:"3",y1:"10",x2:"21",y2:"10"})]})}),e.jsx("h3",{children:u?"Modifier l'événement":"Nouvel événement"})]}),e.jsx("button",{className:"ra-modal-close",onClick:C,children:e.jsxs("svg",{width:"16",height:"16",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",children:[e.jsx("line",{x1:"18",y1:"6",x2:"6",y2:"18"}),e.jsx("line",{x1:"6",y1:"6",x2:"18",y2:"18"})]})})]}),e.jsxs("div",{className:"ra-modal-body",children:[e.jsxs("div",{className:"ra-field",children:[e.jsx("label",{className:"ra-label",children:"Titre"}),e.jsx("input",{type:"text",className:"ra-input",placeholder:"Ex: Consultation de suivi...",value:a.title,onChange:t=>k("title",t.target.value),autoFocus:!0})]}),e.jsxs("div",{className:"ra-field-row",children:[e.jsxs("div",{className:"ra-field",style:{flex:1},children:[e.jsx("label",{className:"ra-label",children:"Date & heure"}),e.jsx("input",{type:"datetime-local",className:"ra-input",value:a.date,onChange:t=>k("date",t.target.value)})]}),e.jsxs("div",{className:"ra-field",style:{width:100},children:[e.jsx("label",{className:"ra-label",children:"Durée (min)"}),e.jsx("input",{type:"number",className:"ra-input",value:a.duration,onChange:t=>k("duration",t.target.value),min:"5",max:"480",step:"5"})]})]}),e.jsx("div",{className:"ra-field-row",children:e.jsxs("div",{className:"ra-field",style:{flex:1},children:[e.jsx("label",{className:"ra-label",children:"Type"}),e.jsx("div",{className:"ra-type-pills",children:re.map(t=>e.jsxs("button",{className:`ra-type-pill ${a.type===t.value?"active":""}`,style:{"--pill-c":t.color,background:a.type===t.value?`${t.color}15`:void 0,borderColor:a.type===t.value?`${t.color}40`:void 0,color:a.type===t.value?t.color:void 0},onClick:()=>k("type",t.value),type:"button",children:[e.jsx("span",{className:"ra-pill-dot",style:{background:t.color}}),t.label]},t.value))})]})}),j.length>0&&e.jsxs("div",{className:"ra-field",children:[e.jsx("label",{className:"ra-label",children:"Statut"}),e.jsx("div",{className:"ra-status-pills",children:j.map(t=>e.jsxs("button",{className:`ra-status-pill ${a.statusOptionId===t._id.toString()?"active":""}`,style:{"--st-c":t.color,background:a.statusOptionId===t._id.toString()?`${t.color}15`:void 0,borderColor:a.statusOptionId===t._id.toString()?t.color:void 0,color:a.statusOptionId===t._id.toString()?t.color:void 0},onClick:()=>k("statusOptionId",t._id.toString()),type:"button",children:[e.jsx("span",{className:"ra-pill-dot",style:{background:t.color}}),t.label]},t._id.toString()))})]}),e.jsxs("div",{className:"ra-field",children:[e.jsx("label",{className:"ra-label",children:"Lieu"}),e.jsx("input",{type:"text",className:"ra-input",placeholder:"Cabinet, Salle A, Domicile...",value:a.lieu,onChange:t=>k("lieu",t.target.value)})]}),e.jsxs("div",{className:"ra-field",children:[e.jsx("label",{className:"ra-label",children:"Notes"}),e.jsx("textarea",{className:"ra-input ra-textarea",placeholder:"Notes additionnelles...",rows:3,value:a.notes,onChange:t=>k("notes",t.target.value)})]})]}),e.jsxs("div",{className:"ra-modal-footer",children:[u&&e.jsxs("button",{className:"ra-delete-btn",onClick:()=>A(h._id.toString()),type:"button",children:[e.jsxs("svg",{width:"14",height:"14",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",children:[e.jsx("polyline",{points:"3 6 5 6 21 6"}),e.jsx("path",{d:"M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"})]}),"Supprimer"]}),e.jsxs("div",{className:"ra-modal-footer-right",children:[e.jsx("button",{className:"ra-cancel-btn",onClick:C,type:"button",children:"Annuler"}),e.jsx("button",{className:"ra-save-btn",onClick:r,disabled:i||!a.title.trim(),type:"button",children:i?"Enregistrement...":u?"Mettre à jour":"Créer"})]})]})]}),e.jsx("style",{children:oe()})]})}function H(f){const C=f.getFullYear(),h=String(f.getMonth()+1).padStart(2,"0"),m=String(f.getDate()).padStart(2,"0"),v=String(f.getHours()).padStart(2,"0"),l=String(f.getMinutes()).padStart(2,"0");return`${C}-${h}-${m}T${v}:${l}`}function oe(){return`
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
`}function le({events:f,entityData:C,onEventClick:h,getStatusInfo:m,getCustomFieldValue:v}){const l=o.useMemo(()=>{const a=[...f].sort((i,g)=>{const u=i.date?new Date(i.date).getTime():0,k=g.date?new Date(g.date).getTime():0;return u-k}),d={};return a.forEach(i=>{const u=(i.date?new Date(i.date):new Date).toISOString().split("T")[0];d[u]||(d[u]=[]),d[u].push(i)}),Object.entries(d).map(([i,g])=>({dateKey:i,date:new Date(i),items:g}))},[f]),_=a=>{const d=new Date,i=new Date(d);i.setDate(i.getDate()+1);const g=new Date(d);g.setDate(g.getDate()-1);const u=a.toISOString().split("T")[0];return u===d.toISOString().split("T")[0]?"Aujourd'hui":u===i.toISOString().split("T")[0]?"Demain":u===g.toISOString().split("T")[0]?"Hier":a.toLocaleDateString("fr-FR",{weekday:"long",day:"numeric",month:"long",year:"numeric"})},A=a=>a?new Date(a).toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit",hour12:!1}):"",S=a=>a?new Date(a)<new Date:!1,$=a=>a?new Date(a).toISOString().split("T")[0]===new Date().toISOString().split("T")[0]:!1;return f.length===0?null:e.jsxs("div",{className:"ra-timeline",children:[e.jsx("style",{children:ie()}),l.map((a,d)=>e.jsxs("div",{className:"ra-tl-group",style:{animationDelay:`${d*80}ms`},children:[e.jsxs("div",{className:`ra-tl-date-header ${$(a.dateKey)?"today":""} ${S(a.dateKey)&&!$(a.dateKey)?"past":""}`,children:[e.jsx("div",{className:"ra-tl-date-dot"}),e.jsx("span",{className:"ra-tl-date-label",children:_(a.date)}),e.jsxs("span",{className:"ra-tl-date-count",children:[a.items.length," événement",a.items.length>1?"s":""]})]}),e.jsx("div",{className:"ra-tl-items",children:a.items.map((i,g)=>{var t;const u=m(i),k=v(i,"lieu_evenement"),r=v(i,"duree_evenement"),j=v(i,"type_evenement"),s=S(i.date);return e.jsxs("div",{className:`ra-tl-item ${s?"past":""}`,style:{animationDelay:`${d*80+g*50}ms`},onClick:()=>h(i),children:[e.jsx("div",{className:"ra-tl-time",children:A(i.date)}),e.jsxs("div",{className:"ra-tl-connector",children:[e.jsx("div",{className:"ra-tl-line"}),e.jsx("div",{className:"ra-tl-node",style:{borderColor:u.color,background:`${u.color}20`}}),e.jsx("div",{className:"ra-tl-line"})]}),e.jsxs("div",{className:"ra-tl-card",children:[e.jsx("div",{className:"ra-tl-card-accent",style:{background:u.color}}),e.jsxs("div",{className:"ra-tl-card-body",children:[e.jsxs("div",{className:"ra-tl-card-top",children:[e.jsx("h4",{className:"ra-tl-card-title",children:i.title||"Sans titre"}),e.jsx("span",{className:"ra-tl-status",style:{background:`${u.color}15`,color:u.color},children:u.label})]}),e.jsxs("div",{className:"ra-tl-card-meta",children:[r&&e.jsxs("span",{className:"ra-tl-meta-item",children:[e.jsxs("svg",{width:"12",height:"12",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",children:[e.jsx("circle",{cx:"12",cy:"12",r:"10"}),e.jsx("polyline",{points:"12 6 12 12 16 14"})]}),r," min"]}),k&&e.jsxs("span",{className:"ra-tl-meta-item",children:[e.jsxs("svg",{width:"12",height:"12",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",children:[e.jsx("path",{d:"M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"}),e.jsx("circle",{cx:"12",cy:"10",r:"3"})]}),k]}),j&&e.jsxs("span",{className:"ra-tl-meta-item",children:[e.jsxs("svg",{width:"12",height:"12",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",children:[e.jsx("path",{d:"M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"}),e.jsx("line",{x1:"7",y1:"7",x2:"7.01",y2:"7"})]}),j.charAt(0).toUpperCase()+j.slice(1)]})]})]})]})]},(t=i._id)==null?void 0:t.toString())})})]},a.dateKey))]})}function ie(){return`
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
`}function se({events:f,entityData:C,onEventClick:h,onDeleteEvent:m,getStatusInfo:v,getCustomFieldValue:l}){const[_,A]=o.useState("date"),[S,$]=o.useState("asc"),a=o.useMemo(()=>[...f].sort((r,j)=>{let s,t;switch(_){case"title":return s=(r.title||"").toLowerCase(),t=(j.title||"").toLowerCase(),S==="asc"?s.localeCompare(t):t.localeCompare(s);case"status":return s=v(r).label,t=v(j).label,S==="asc"?s.localeCompare(t):t.localeCompare(s);case"type":return s=l(r,"type_evenement")||"",t=l(j,"type_evenement")||"",S==="asc"?s.localeCompare(t):t.localeCompare(s);case"date":default:return s=r.date?new Date(r.date).getTime():0,t=j.date?new Date(j.date).getTime():0,S==="asc"?s-t:t-s}}),[f,_,S,v,l]),d=r=>{_===r?$(j=>j==="asc"?"desc":"asc"):(A(r),$("asc"))},i=r=>r?new Date(r).toLocaleDateString("fr-FR",{day:"2-digit",month:"short",year:"numeric"}):"—",g=r=>r?new Date(r).toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit",hour12:!1}):"",u=r=>r&&new Date(r)<new Date,k=({field:r})=>e.jsx("svg",{width:"10",height:"10",viewBox:"0 0 10 10",fill:"none",style:{opacity:_===r?1:.3},children:e.jsx("path",{d:_===r&&S==="desc"?"M5 2L8 6H2L5 2Z":"M5 8L2 4H8L5 8Z",fill:"currentColor"})});return f.length===0?null:e.jsxs("div",{className:"ra-list-wrap",children:[e.jsx("style",{children:de()}),e.jsxs("table",{className:"ra-list-table",children:[e.jsx("thead",{children:e.jsxs("tr",{children:[e.jsxs("th",{className:"ra-th ra-th-sortable",onClick:()=>d("title"),children:["Titre ",e.jsx(k,{field:"title"})]}),e.jsxs("th",{className:"ra-th ra-th-sortable",onClick:()=>d("date"),children:["Date ",e.jsx(k,{field:"date"})]}),e.jsx("th",{className:"ra-th",children:"Heure"}),e.jsx("th",{className:"ra-th",children:"Durée"}),e.jsxs("th",{className:"ra-th ra-th-sortable",onClick:()=>d("type"),children:["Type ",e.jsx(k,{field:"type"})]}),e.jsx("th",{className:"ra-th",children:"Lieu"}),e.jsxs("th",{className:"ra-th ra-th-sortable",onClick:()=>d("status"),children:["Statut ",e.jsx(k,{field:"status"})]}),e.jsx("th",{className:"ra-th",style:{width:40}})]})}),e.jsx("tbody",{children:a.map((r,j)=>{var E;const s=v(r),t=l(r,"type_evenement"),T=l(r,"lieu_evenement"),D=l(r,"duree_evenement"),I=u(r.date);return e.jsxs("tr",{className:`ra-tr ${I?"past":""}`,onClick:()=>h(r),style:{animationDelay:`${j*30}ms`},children:[e.jsxs("td",{className:"ra-td ra-td-title",children:[e.jsx("div",{className:"ra-td-title-dot",style:{background:s.color}}),r.title||"Sans titre"]}),e.jsx("td",{className:"ra-td",children:i(r.date)}),e.jsx("td",{className:"ra-td ra-td-time",children:g(r.date)}),e.jsx("td",{className:"ra-td",children:D?`${D} min`:"—"}),e.jsx("td",{className:"ra-td ra-td-type",children:t?e.jsx("span",{className:"ra-td-type-badge",children:t.charAt(0).toUpperCase()+t.slice(1)}):"—"}),e.jsx("td",{className:"ra-td",children:T||"—"}),e.jsx("td",{className:"ra-td",children:e.jsx("span",{className:"ra-td-status",style:{background:`${s.color}12`,color:s.color},children:s.label})}),e.jsx("td",{className:"ra-td ra-td-actions",children:e.jsx("button",{className:"ra-td-delete",onClick:b=>{var M;b.stopPropagation(),m((M=r._id)==null?void 0:M.toString())},title:"Supprimer",children:e.jsxs("svg",{width:"14",height:"14",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",children:[e.jsx("polyline",{points:"3 6 5 6 21 6"}),e.jsx("path",{d:"M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"})]})})})]},(E=r._id)==null?void 0:E.toString())})})]})]})}function de(){return`
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
`}function ce({accountNumber:f,recordId:C,entitySlug:h}){const[m,v]=o.useState([]),[l,_]=o.useState(null),[A,S]=o.useState(!0),[$,a]=o.useState(!1),[d,i]=o.useState("calendar"),[g,u]=o.useState("dayGridMonth"),[k,r]=o.useState(!1),[j,s]=o.useState(null),[t,T]=o.useState(null),D=o.useRef(null),I=o.useRef(null),E=`agenda-${C}`,b=`/account/${f}/api/records/${C}/events`,M=`/account/${f}/api/user/view-preferences`;o.useEffect(()=>{(async()=>{var n;try{const y=await(await fetch(`${M}/${E}`,{credentials:"include"})).json();if(y.success&&((n=y.preferences)!=null&&n.agendaPrefs)){const N=y.preferences.agendaPrefs;N.viewMode&&i(N.viewMode),N.calendarView&&u(N.calendarView)}}catch{}a(!0)})()},[M,E]);const z=o.useCallback(async n=>{try{const c={viewMode:d,calendarView:g,...n};await fetch(M,{method:"POST",headers:{"Content-Type":"application/json"},credentials:"include",body:JSON.stringify({viewId:E,preferences:{agendaPrefs:c}})})}catch(c){console.warn("[RecordAgenda] Prefs save error:",c)}},[M,E,d,g]),B=o.useCallback(n=>{i(n),z({viewMode:n})},[z]),R=o.useCallback((n,c)=>{if(!n||!l)return null;const y=(l.customFields||[]).find(p=>p.name===c);if(!y)return null;const N=(n.customFields||[]).find(p=>{var w,O;const x=((w=p.field_id)==null?void 0:w._id)||p.field_id;return(x==null?void 0:x.toString())===((O=y._id)==null?void 0:O.toString())});return(N==null?void 0:N.value)||null},[l]),F=o.useCallback(n=>{if(!n||!(l!=null&&l.statusClassification))return{label:"Planifié",color:"#3b82f6"};const c=l.statusClassification,y=(n.classificationValues||[]).find(p=>{var x,w;return((x=p.classificationId)==null?void 0:x.toString())===((w=c._id)==null?void 0:w.toString())});if(!y)return{label:"Planifié",color:"#3b82f6"};const N=(c.options||[]).find(p=>{var x,w;return((x=p._id)==null?void 0:x.toString())===((w=y.optionId)==null?void 0:w.toString())});return N?{label:N.label,color:N.color||"#3b82f6"}:{label:"Planifié",color:"#3b82f6"}},[l]),U=o.useMemo(()=>m.map(n=>{var L;const c=F(n),y=R(n,"duree_evenement"),N=R(n,"lieu_evenement"),p=R(n,"type_evenement"),x=R(n,"notes_evenement");let w=n.date?new Date(n.date):new Date,O=n.end_date?new Date(n.end_date):null;return!O&&y?O=new Date(w.getTime()+(parseInt(y)||30)*6e4):O||(O=new Date(w.getTime()+30*6e4)),{id:(L=n._id)==null?void 0:L.toString(),title:n.title||"Sans titre",start:w.toISOString(),end:O.toISOString(),backgroundColor:c.color,borderColor:c.color,textColor:"#fff",extendedProps:{_raw:n,status:c.label,statusColor:c.color,duration:y,lieu:N,type:p,notes:x}}}),[m,F,R]),P=o.useCallback(async()=>{try{const c=await(await fetch(b,{credentials:"include"})).json();c.success&&(v(c.events||[]),_(c.entityData||null))}catch(n){console.error("[RecordAgenda] Fetch error:",n)}S(!1)},[b]);o.useEffect(()=>{P()},[P]);const W=o.useRef(g);W.current=g,o.useEffect(()=>{var N;if(d!=="calendar"||A||!$||!D.current)return;if(typeof FullCalendar>"u"){console.error("[RecordAgenda] FullCalendar not loaded");return}const n=(N=I.current)==null?void 0:N.getDate();I.current&&I.current.destroy();let c=!1;const y=new FullCalendar.Calendar(D.current,{initialView:W.current,initialDate:n||void 0,locale:"fr",headerToolbar:{left:"prev,next today",center:"title",right:"dayGridMonth,timeGridWeek,timeGridDay"},buttonText:{today:"Aujourd'hui",month:"Mois",week:"Semaine",day:"Jour"},editable:!0,dayMaxEvents:3,selectable:!0,droppable:!1,nowIndicator:!0,slotMinTime:"07:00:00",slotMaxTime:"21:00:00",slotDuration:"00:15:00",snapDuration:"00:05:00",allDaySlot:!1,height:"100%",expandRows:!0,eventTimeFormat:{hour:"2-digit",minute:"2-digit",meridiem:!1,hour12:!1},events:U,datesSet:p=>{if(!c)return;const x=p.view.type;x!==W.current&&(W.current=x,u(x),fetch(M,{method:"POST",headers:{"Content-Type":"application/json"},credentials:"include",body:JSON.stringify({viewId:E,preferences:{agendaPrefs:{viewMode:"calendar",calendarView:x}}})}).catch(()=>{}))},eventClick:p=>{const x=p.event.extendedProps._raw;s(x),r(!0)},dateClick:p=>{T(p.dateStr),s(null),r(!0)},eventDrop:async p=>{var L,V;const x=p.event.id,w=(L=p.event.start)==null?void 0:L.toISOString(),O=(V=p.event.end)==null?void 0:V.toISOString();try{await fetch(`${b}/${x}/drag`,{method:"PATCH",headers:{"Content-Type":"application/json"},credentials:"include",body:JSON.stringify({newStart:w,newEnd:O})}),await P()}catch(Y){console.error("[RecordAgenda] Drag error:",Y),p.revert()}},eventResize:async p=>{var L,V;const x=p.event.id,w=(L=p.event.start)==null?void 0:L.toISOString(),O=(V=p.event.end)==null?void 0:V.toISOString();try{await fetch(`${b}/${x}/drag`,{method:"PATCH",headers:{"Content-Type":"application/json"},credentials:"include",body:JSON.stringify({newStart:w,newEnd:O})}),await P()}catch(Y){console.error("[RecordAgenda] Resize error:",Y),p.revert()}},eventDidMount:p=>{const x=p.event.extendedProps;let w=p.event.title;x.lieu&&(w+=`
📍 ${x.lieu}`),x.status&&(w+=`
● ${x.status}`),p.el.title=w}});return y.render(),I.current=y,requestAnimationFrame(()=>{c=!0}),()=>{I.current&&(I.current.destroy(),I.current=null)}},[d,A,$,U,b,P,M,E]);const Z=o.useCallback(async n=>{try{(await(await fetch(b,{method:"POST",headers:{"Content-Type":"application/json"},credentials:"include",body:JSON.stringify(n)})).json()).success&&(await P(),r(!1),s(null),T(null))}catch(c){console.error("[RecordAgenda] Create error:",c)}},[b,P]),X=o.useCallback(async(n,c)=>{try{(await(await fetch(`${b}/${n}`,{method:"PATCH",headers:{"Content-Type":"application/json"},credentials:"include",body:JSON.stringify(c)})).json()).success&&(await P(),r(!1),s(null))}catch(y){console.error("[RecordAgenda] Update error:",y)}},[b,P]),J=o.useCallback(async n=>{if(confirm("Supprimer cet événement ?"))try{(await(await fetch(`${b}/${n}`,{method:"DELETE",credentials:"include"})).json()).success&&(await P(),r(!1),s(null))}catch(c){console.error("[RecordAgenda] Delete error:",c)}},[b,P]),G=o.useCallback(()=>{s(null),T(null),r(!0)},[]),K=o.useCallback(n=>{s(n),r(!0)},[]);return A||!$?e.jsxs("div",{className:"ra-loading",children:[e.jsx("div",{className:"ra-spinner"}),e.jsx("span",{children:"Chargement de l'agenda..."})]}):e.jsxs("div",{className:"ra-container",children:[e.jsx("style",{children:pe()}),e.jsx(te,{viewMode:d,onViewChange:B,onNewEvent:G,eventCount:m.length}),d==="calendar"&&e.jsx("div",{className:"ra-calendar-wrap",children:e.jsx("div",{ref:D,className:"ra-calendar"})}),d==="timeline"&&e.jsx(le,{events:m,entityData:l,onEventClick:K,getStatusInfo:F,getCustomFieldValue:R}),d==="list"&&e.jsx(se,{events:m,entityData:l,onEventClick:K,onDeleteEvent:J,getStatusInfo:F,getCustomFieldValue:R}),m.length===0&&!A&&e.jsxs("div",{className:"ra-empty",children:[e.jsx("div",{className:"ra-empty-icon",children:e.jsxs("svg",{width:"48",height:"48",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"1.5",children:[e.jsx("rect",{x:"3",y:"4",width:"18",height:"18",rx:"2",ry:"2"}),e.jsx("line",{x1:"16",y1:"2",x2:"16",y2:"6"}),e.jsx("line",{x1:"8",y1:"2",x2:"8",y2:"6"}),e.jsx("line",{x1:"3",y1:"10",x2:"21",y2:"10"}),e.jsx("line",{x1:"10",y1:"14",x2:"14",y2:"18"}),e.jsx("line",{x1:"14",y1:"14",x2:"10",y2:"18"})]})}),e.jsx("h3",{children:"Aucun événement"}),e.jsx("p",{children:"Ajoutez votre premier événement pour commencer à organiser votre agenda."}),e.jsxs("button",{className:"ra-empty-btn",onClick:G,children:[e.jsxs("svg",{width:"16",height:"16",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",children:[e.jsx("line",{x1:"12",y1:"5",x2:"12",y2:"19"}),e.jsx("line",{x1:"5",y1:"12",x2:"19",y2:"12"})]}),"Nouvel événement"]})]}),e.jsx(ne,{isOpen:k,onClose:()=>{r(!1),s(null),T(null)},event:j,entityData:l,prefillDate:t,onCreate:Z,onUpdate:X,onDelete:J,getCustomFieldValue:R,getStatusInfo:F})]})}function pe(){return`
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
`}function q(){document.querySelectorAll('[data-island="record-agenda"]').forEach(f=>{if(f.dataset.mounted==="1")return;f.dataset.mounted="1";const C={accountNumber:f.dataset.accountNumber,recordId:f.dataset.recordId,entitySlug:f.dataset.entitySlug};console.log("[RecordAgenda Island] Mounting:",C),Q(f).render(e.jsx(ee.StrictMode,{children:e.jsx(ce,{...C})}))})}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",q):q();
