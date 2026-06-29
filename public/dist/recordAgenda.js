import{j as e,r as i,c as ve,R as ke}from"./chunks/client-CMp6iiqo.js";function De({viewMode:a,onViewChange:f,onNewEvent:r,eventCount:l}){const u=[{key:"calendar",icon:"M3 4h18M3 10h18M3 16h18",label:"Calendrier"},{key:"timeline",icon:"M12 2v20M2 12h20",label:"Timeline"},{key:"list",icon:"M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01",label:"Liste"}];return e.jsxDEV("div",{className:"ra-toolbar",children:[e.jsxDEV("style",{children:we()},void 0,!1,{fileName:"C:/Users/pc/Documents/dexapp/dexapp/Backend/src/islands/record-agenda/components/AgendaToolbar.jsx",lineNumber:16,columnNumber:13},this),e.jsxDEV("div",{className:"ra-toolbar-left",children:e.jsxDEV("div",{className:"ra-view-pills",children:[u.map(x=>e.jsxDEV("button",{className:`ra-vpill ${a===x.key?"active":""}`,onClick:()=>f(x.key),children:[e.jsxDEV("svg",{width:"14",height:"14",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",children:e.jsxDEV("path",{d:x.icon},void 0,!1,{fileName:"C:/Users/pc/Documents/dexapp/dexapp/Backend/src/islands/record-agenda/components/AgendaToolbar.jsx",lineNumber:27,columnNumber:33},this)},void 0,!1,{fileName:"C:/Users/pc/Documents/dexapp/dexapp/Backend/src/islands/record-agenda/components/AgendaToolbar.jsx",lineNumber:26,columnNumber:29},this),x.label]},x.key,!0,{fileName:"C:/Users/pc/Documents/dexapp/dexapp/Backend/src/islands/record-agenda/components/AgendaToolbar.jsx",lineNumber:21,columnNumber:25},this)),e.jsxDEV("span",{className:"ra-vpill-count",children:l},void 0,!1,{fileName:"C:/Users/pc/Documents/dexapp/dexapp/Backend/src/islands/record-agenda/components/AgendaToolbar.jsx",lineNumber:32,columnNumber:21},this)]},void 0,!0,{fileName:"C:/Users/pc/Documents/dexapp/dexapp/Backend/src/islands/record-agenda/components/AgendaToolbar.jsx",lineNumber:19,columnNumber:17},this)},void 0,!1,{fileName:"C:/Users/pc/Documents/dexapp/dexapp/Backend/src/islands/record-agenda/components/AgendaToolbar.jsx",lineNumber:18,columnNumber:13},this),e.jsxDEV("div",{className:"ra-toolbar-right",children:e.jsxDEV("button",{className:"ra-new-event-btn",onClick:r,children:[e.jsxDEV("svg",{width:"16",height:"16",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2.5",children:[e.jsxDEV("line",{x1:"12",y1:"5",x2:"12",y2:"19"},void 0,!1,{fileName:"C:/Users/pc/Documents/dexapp/dexapp/Backend/src/islands/record-agenda/components/AgendaToolbar.jsx",lineNumber:38,columnNumber:121},this),e.jsxDEV("line",{x1:"5",y1:"12",x2:"19",y2:"12"},void 0,!1,{fileName:"C:/Users/pc/Documents/dexapp/dexapp/Backend/src/islands/record-agenda/components/AgendaToolbar.jsx",lineNumber:38,columnNumber:160},this)]},void 0,!0,{fileName:"C:/Users/pc/Documents/dexapp/dexapp/Backend/src/islands/record-agenda/components/AgendaToolbar.jsx",lineNumber:38,columnNumber:21},this),"Nouvel événement"]},void 0,!0,{fileName:"C:/Users/pc/Documents/dexapp/dexapp/Backend/src/islands/record-agenda/components/AgendaToolbar.jsx",lineNumber:37,columnNumber:17},this)},void 0,!1,{fileName:"C:/Users/pc/Documents/dexapp/dexapp/Backend/src/islands/record-agenda/components/AgendaToolbar.jsx",lineNumber:36,columnNumber:13},this)]},void 0,!0,{fileName:"C:/Users/pc/Documents/dexapp/dexapp/Backend/src/islands/record-agenda/components/AgendaToolbar.jsx",lineNumber:15,columnNumber:9},this)}function we(){return`
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
`}const je=[{value:"consultation",label:"Consultation",color:"#4361ee"},{value:"reunion",label:"Réunion",color:"#8b5cf6"},{value:"rappel",label:"Rappel",color:"#f59e0b"},{value:"tache",label:"Tâche",color:"#10b981"},{value:"personnel",label:"Personnel",color:"#ec4899"},{value:"autre",label:"Autre",color:"#6b7280"}],Ee=[{label:"Important",value:"Important",color:"#ef4444"},{label:"Date limite",value:"Date limite",color:"#f59e0b"},{label:"Risque amende",value:"Risque amende",color:"#dc2626"}],H="#64748b",me=["#4361ee","#8b5cf6","#f59e0b","#10b981","#ec4899","#64748b"],ye="widget_prochains_evenements",Ce="widget_date_importante";function Ve({isOpen:a,onClose:f,event:r,entityData:l,prefillDate:u,onCreate:x,onUpdate:S,onDelete:_,getCustomFieldValue:E,getStatusInfo:A,accountNumber:h,taskLists:w=[],recordId:y}){var X,re,te,oe;const[o,k]=i.useState({title:"",date:"",endDate:"",duration:30,type:"consultation",tags:[],lieu:"",notes:"",statusOptionId:"",showInUpcomingWidget:!0,isImportantDate:!1,createTask:!1,selectedTaskListId:""}),[C,p]=i.useState(!1),[T,j]=i.useState(""),[v,M]=i.useState({type:[],status:[],tags:[]}),[J,L]=i.useState({type:[],status:[],tags:[]}),z=!!r;i.useEffect(()=>{var n,g,V,s,d;if(a)if(j(""),r){A(r);const m=(r.classificationValues||[]).find(b=>{var c,U,$;return((c=b.classificationId)==null?void 0:c.toString())===(($=(U=l==null?void 0:l.statusClassification)==null?void 0:U._id)==null?void 0:$.toString())}),N=ie(E(r,"tags_evenement"));k({title:r.title||"",date:r.date?de(new Date(r.date)):"",endDate:r.end_date?de(new Date(r.end_date)):"",duration:E(r,"duree_evenement")||30,type:E(r,"type_evenement")||"consultation",tags:N,lieu:E(r,"lieu_evenement")||"",notes:E(r,"notes_evenement")||"",statusOptionId:((n=m==null?void 0:m.optionId)==null?void 0:n.toString())||"",showInUpcomingWidget:xe(E(r,ye),!0),isImportantDate:xe(E(r,Ce),N.some(b=>b.toLowerCase()==="date importante")),createTask:!1,selectedTaskListId:""})}else{let m="";if(u){const c=new Date(u);isNaN(c.getTime())?m=u+"T09:00":(c.setMinutes(Math.round(c.getMinutes()/5)*5,0,0),m=de(c))}else{const c=new Date;c.setMinutes(Math.ceil(c.getMinutes()/5)*5,0,0),m=de(c)}const N=((d=(s=(V=(g=l==null?void 0:l.statusClassification)==null?void 0:g.options)==null?void 0:V[0])==null?void 0:s._id)==null?void 0:d.toString())||"",b=w.length>0?w[0]._id:"";k({title:"",date:m,endDate:"",duration:30,type:"consultation",tags:[],lieu:"",notes:"",statusOptionId:N,showInUpcomingWidget:!0,isImportantDate:!1,createTask:!1,selectedTaskListId:b})}},[a,r,u,l,E,A]);const B=i.useCallback((n,g)=>{j(""),k(V=>({...V,[n]:g}))},[]),P=i.useCallback(async()=>{if(o.title.trim()){p(!0),j("");try{const n=he(o.date,"Date");let g=o.endDate?he(o.endDate,"Date de fin").toISOString():void 0;!g&&n&&o.duration&&(g=new Date(n.getTime()+(parseInt(o.duration)||30)*6e4).toISOString());const V={title:o.title.trim(),date:n?n.toISOString():void 0,endDate:g,duration:parseInt(o.duration)||30,type:o.type,tags:ie(o.tags),lieu:o.lieu,notes:o.notes,statusOptionId:o.statusOptionId||void 0,showInUpcomingWidget:!!o.showInUpcomingWidget,isImportantDate:!!o.isImportantDate};!z&&o.createTask&&o.selectedTaskListId&&(V.createTask=!0,V.taskListId=o.selectedTaskListId),z?await S(r._id.toString(),V):await x(V)}catch(n){console.error("[EventModal] Save error:",n),j(n.message||"Impossible d'enregistrer cet evenement.")}finally{p(!1)}}},[o,z,r,x,S]),I=ue(l,"type_evenement"),q=ue(l,"tags_evenement"),O=(l==null?void 0:l.statusClassification)||null,R=((re=(X=O==null?void 0:O._id)==null?void 0:X.toString)==null?void 0:re.call(X))||(O==null?void 0:O._id)||"",K=ne([je,((te=I==null?void 0:I.type_config)==null?void 0:te.options)||[],v.type,o.type?[{label:o.type,value:o.type,color:H}]:[]],J.type),t=ne([((O==null?void 0:O.options)||[]).map(fe),v.status,o.statusOptionId?[{label:"Statut",value:o.statusOptionId,color:H}]:[]],J.status),D=ne([Ee,((oe=q==null?void 0:q.type_config)==null?void 0:oe.options)||[],v.tags,ie(o.tags).map(n=>({label:n,value:n}))],J.tags),W=(n,g)=>{M(V=>({...V,[n]:ne([V[n]||[],[g]])}))},F=(n,g)=>{L(V=>({...V,[n]:Be(V[n]||[],g)}))},Z=async(n,g,V)=>{var c,U;const s={label:V,value:V,color:be(V)},d=((U=(c=g==null?void 0:g._id)==null?void 0:c.toString)==null?void 0:U.call(c))||(g==null?void 0:g._id);if(!h||!d)return W(n,s),s;const m=await fetch(`/account/${h}/field-template/api/${d}/add-option`,{method:"POST",headers:{"Content-Type":"application/json"},credentials:"include",body:JSON.stringify(s)}),N=await m.json().catch(()=>({}));if(!m.ok||!N.success)throw new Error(N.error||"Création impossible");const b=ee(N.option||s);return W(n,b),b},ae=async(n,g,V)=>{var m,N;const s=ee(V);if(!s.value||!confirm(`Supprimer l'option "${s.label}" ?`))return!1;const d=((N=(m=g==null?void 0:g._id)==null?void 0:m.toString)==null?void 0:N.call(m))||(g==null?void 0:g._id);if(h&&d){const b=await fetch(`/account/${h}/field-template/api/${d}/delete-option`,{method:"POST",headers:{"Content-Type":"application/json"},credentials:"include",body:JSON.stringify({value:s.value,label:s.label})}),c=await b.json().catch(()=>({}));if(!b.ok||!c.success)throw new Error(c.error||"Suppression impossible")}return F(n,s),n==="type"&&ce(s,o.type)&&B("type",""),n==="tags"&&B("tags",ie(o.tags).filter(b=>!ce(s,b))),!0},Y=async n=>{const g={label:n,value:n,color:be(n)};if(!h||!R)return W("status",g),g;const V=await fetch(`/account/${h}/classification/api/fast-add`,{method:"POST",headers:{"Content-Type":"application/json"},credentials:"include",body:JSON.stringify({classificationId:R,label:n,color:g.color})}),s=await V.json().catch(()=>({}));if(!V.ok||!s.success)throw new Error(s.error||"Création impossible");const d=fe(s.option||g);return W("status",d),d},se=async n=>{const g=ee(n);if(!g.value||!confirm(`Supprimer le statut "${g.label}" ?`))return!1;if(h&&R){const V=await fetch(`/account/${h}/classification/api/delete-option`,{method:"POST",headers:{"Content-Type":"application/json"},credentials:"include",body:JSON.stringify({classificationId:R,optionId:g.value})}),s=await V.json().catch(()=>({}));if(!V.ok||!s.success)throw new Error(s.error||"Suppression impossible")}return F("status",g),String(o.statusOptionId||"")===String(g.value||"")&&B("statusOptionId",""),!0};return a?e.jsxDEV("div",{className:"ra-modal-overlay",onClick:f,children:[e.jsxDEV("div",{className:"ra-modal",onClick:n=>n.stopPropagation(),children:[e.jsxDEV("div",{className:"ra-modal-header",children:[e.jsxDEV("div",{className:"ra-modal-header-left",children:[e.jsxDEV("div",{className:"ra-modal-icon",children:e.jsxDEV("svg",{width:"18",height:"18",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",children:[e.jsxDEV("rect",{x:"3",y:"4",width:"18",height:"18",rx:"2",ry:"2"},void 0,!1,{fileName:"C:/Users/pc/Documents/dexapp/dexapp/Backend/src/islands/record-agenda/components/EventModal.jsx",lineNumber:317,columnNumber:33},this),e.jsxDEV("line",{x1:"16",y1:"2",x2:"16",y2:"6"},void 0,!1,{fileName:"C:/Users/pc/Documents/dexapp/dexapp/Backend/src/islands/record-agenda/components/EventModal.jsx",lineNumber:318,columnNumber:33},this),e.jsxDEV("line",{x1:"8",y1:"2",x2:"8",y2:"6"},void 0,!1,{fileName:"C:/Users/pc/Documents/dexapp/dexapp/Backend/src/islands/record-agenda/components/EventModal.jsx",lineNumber:319,columnNumber:33},this),e.jsxDEV("line",{x1:"3",y1:"10",x2:"21",y2:"10"},void 0,!1,{fileName:"C:/Users/pc/Documents/dexapp/dexapp/Backend/src/islands/record-agenda/components/EventModal.jsx",lineNumber:320,columnNumber:33},this)]},void 0,!0,{fileName:"C:/Users/pc/Documents/dexapp/dexapp/Backend/src/islands/record-agenda/components/EventModal.jsx",lineNumber:316,columnNumber:29},this)},void 0,!1,{fileName:"C:/Users/pc/Documents/dexapp/dexapp/Backend/src/islands/record-agenda/components/EventModal.jsx",lineNumber:315,columnNumber:25},this),e.jsxDEV("h3",{children:z?"Modifier l'événement":"Nouvel événement"},void 0,!1,{fileName:"C:/Users/pc/Documents/dexapp/dexapp/Backend/src/islands/record-agenda/components/EventModal.jsx",lineNumber:323,columnNumber:25},this)]},void 0,!0,{fileName:"C:/Users/pc/Documents/dexapp/dexapp/Backend/src/islands/record-agenda/components/EventModal.jsx",lineNumber:314,columnNumber:21},this),e.jsxDEV("button",{className:"ra-modal-close",onClick:f,children:e.jsxDEV("svg",{width:"16",height:"16",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",children:[e.jsxDEV("line",{x1:"18",y1:"6",x2:"6",y2:"18"},void 0,!1,{fileName:"C:/Users/pc/Documents/dexapp/dexapp/Backend/src/islands/record-agenda/components/EventModal.jsx",lineNumber:327,columnNumber:29},this),e.jsxDEV("line",{x1:"6",y1:"6",x2:"18",y2:"18"},void 0,!1,{fileName:"C:/Users/pc/Documents/dexapp/dexapp/Backend/src/islands/record-agenda/components/EventModal.jsx",lineNumber:327,columnNumber:67},this)]},void 0,!0,{fileName:"C:/Users/pc/Documents/dexapp/dexapp/Backend/src/islands/record-agenda/components/EventModal.jsx",lineNumber:326,columnNumber:25},this)},void 0,!1,{fileName:"C:/Users/pc/Documents/dexapp/dexapp/Backend/src/islands/record-agenda/components/EventModal.jsx",lineNumber:325,columnNumber:21},this)]},void 0,!0,{fileName:"C:/Users/pc/Documents/dexapp/dexapp/Backend/src/islands/record-agenda/components/EventModal.jsx",lineNumber:313,columnNumber:17},this),e.jsxDEV("div",{className:"ra-modal-body",children:[e.jsxDEV("div",{className:"ra-field",children:[e.jsxDEV("label",{className:"ra-label",children:"Titre"},void 0,!1,{fileName:"C:/Users/pc/Documents/dexapp/dexapp/Backend/src/islands/record-agenda/components/EventModal.jsx",lineNumber:335,columnNumber:25},this),e.jsxDEV("input",{type:"text",className:"ra-input",placeholder:"Ex: Consultation de suivi...",value:o.title,onChange:n=>B("title",n.target.value),autoFocus:!0},void 0,!1,{fileName:"C:/Users/pc/Documents/dexapp/dexapp/Backend/src/islands/record-agenda/components/EventModal.jsx",lineNumber:336,columnNumber:25},this)]},void 0,!0,{fileName:"C:/Users/pc/Documents/dexapp/dexapp/Backend/src/islands/record-agenda/components/EventModal.jsx",lineNumber:334,columnNumber:21},this),e.jsxDEV("div",{className:"ra-field-row",children:[e.jsxDEV("div",{className:"ra-field",style:{flex:1},children:[e.jsxDEV("label",{className:"ra-label",children:"Date & heure"},void 0,!1,{fileName:"C:/Users/pc/Documents/dexapp/dexapp/Backend/src/islands/record-agenda/components/EventModal.jsx",lineNumber:349,columnNumber:29},this),e.jsxDEV("input",{type:"datetime-local",className:"ra-input",step:"300",value:o.date,onChange:n=>B("date",n.target.value)},void 0,!1,{fileName:"C:/Users/pc/Documents/dexapp/dexapp/Backend/src/islands/record-agenda/components/EventModal.jsx",lineNumber:350,columnNumber:29},this)]},void 0,!0,{fileName:"C:/Users/pc/Documents/dexapp/dexapp/Backend/src/islands/record-agenda/components/EventModal.jsx",lineNumber:348,columnNumber:25},this),e.jsxDEV("div",{className:"ra-field",style:{width:100},children:[e.jsxDEV("label",{className:"ra-label",children:"Durée (min)"},void 0,!1,{fileName:"C:/Users/pc/Documents/dexapp/dexapp/Backend/src/islands/record-agenda/components/EventModal.jsx",lineNumber:359,columnNumber:29},this),e.jsxDEV("input",{type:"number",className:"ra-input",value:o.duration,onChange:n=>B("duration",n.target.value),min:"5",max:"480",step:"5"},void 0,!1,{fileName:"C:/Users/pc/Documents/dexapp/dexapp/Backend/src/islands/record-agenda/components/EventModal.jsx",lineNumber:360,columnNumber:29},this)]},void 0,!0,{fileName:"C:/Users/pc/Documents/dexapp/dexapp/Backend/src/islands/record-agenda/components/EventModal.jsx",lineNumber:358,columnNumber:25},this)]},void 0,!0,{fileName:"C:/Users/pc/Documents/dexapp/dexapp/Backend/src/islands/record-agenda/components/EventModal.jsx",lineNumber:347,columnNumber:21},this),e.jsxDEV("div",{className:"ra-field",children:[e.jsxDEV("label",{className:"ra-label",children:"Type"},void 0,!1,{fileName:"C:/Users/pc/Documents/dexapp/dexapp/Backend/src/islands/record-agenda/components/EventModal.jsx",lineNumber:372,columnNumber:25},this),e.jsxDEV(pe,{value:o.type,options:K,onChange:n=>B("type",n),onCreateOption:n=>Z("type",I,n),onDeleteOption:n=>ae("type",I,n),placeholder:"Rechercher ou créer un type..."},void 0,!1,{fileName:"C:/Users/pc/Documents/dexapp/dexapp/Backend/src/islands/record-agenda/components/EventModal.jsx",lineNumber:373,columnNumber:25},this)]},void 0,!0,{fileName:"C:/Users/pc/Documents/dexapp/dexapp/Backend/src/islands/record-agenda/components/EventModal.jsx",lineNumber:371,columnNumber:21},this),R&&e.jsxDEV("div",{className:"ra-field",children:[e.jsxDEV("label",{className:"ra-label",children:"Statut"},void 0,!1,{fileName:"C:/Users/pc/Documents/dexapp/dexapp/Backend/src/islands/record-agenda/components/EventModal.jsx",lineNumber:386,columnNumber:29},this),e.jsxDEV(pe,{value:o.statusOptionId,options:t,onChange:n=>B("statusOptionId",n),onCreateOption:Y,onDeleteOption:se,placeholder:"Rechercher ou créer un statut..."},void 0,!1,{fileName:"C:/Users/pc/Documents/dexapp/dexapp/Backend/src/islands/record-agenda/components/EventModal.jsx",lineNumber:387,columnNumber:29},this)]},void 0,!0,{fileName:"C:/Users/pc/Documents/dexapp/dexapp/Backend/src/islands/record-agenda/components/EventModal.jsx",lineNumber:385,columnNumber:25},this),e.jsxDEV("div",{className:"ra-field",children:[e.jsxDEV("label",{className:"ra-label",children:"Étiquettes"},void 0,!1,{fileName:"C:/Users/pc/Documents/dexapp/dexapp/Backend/src/islands/record-agenda/components/EventModal.jsx",lineNumber:400,columnNumber:25},this),e.jsxDEV(pe,{multiple:!0,value:o.tags,options:D,onChange:n=>B("tags",n),onCreateOption:n=>Z("tags",q,n),onDeleteOption:n=>ae("tags",q,n),placeholder:"Ajouter..."},void 0,!1,{fileName:"C:/Users/pc/Documents/dexapp/dexapp/Backend/src/islands/record-agenda/components/EventModal.jsx",lineNumber:401,columnNumber:25},this)]},void 0,!0,{fileName:"C:/Users/pc/Documents/dexapp/dexapp/Backend/src/islands/record-agenda/components/EventModal.jsx",lineNumber:399,columnNumber:21},this),e.jsxDEV("div",{className:"ra-field",children:[e.jsxDEV("label",{className:"ra-label",children:"Widget"},void 0,!1,{fileName:"C:/Users/pc/Documents/dexapp/dexapp/Backend/src/islands/record-agenda/components/EventModal.jsx",lineNumber:414,columnNumber:25},this),e.jsxDEV("div",{className:"ra-widget-switches",children:[e.jsxDEV("label",{className:`ra-widget-switch ${o.showInUpcomingWidget?"active":""}`,children:[e.jsxDEV("span",{className:"ra-widget-switch-copy",children:[e.jsxDEV("strong",{children:"Prochains événements"},void 0,!1,{fileName:"C:/Users/pc/Documents/dexapp/dexapp/Backend/src/islands/record-agenda/components/EventModal.jsx",lineNumber:418,columnNumber:37},this),e.jsxDEV("small",{children:"Afficher dans le widget agenda"},void 0,!1,{fileName:"C:/Users/pc/Documents/dexapp/dexapp/Backend/src/islands/record-agenda/components/EventModal.jsx",lineNumber:419,columnNumber:37},this)]},void 0,!0,{fileName:"C:/Users/pc/Documents/dexapp/dexapp/Backend/src/islands/record-agenda/components/EventModal.jsx",lineNumber:417,columnNumber:33},this),e.jsxDEV("span",{className:"ra-switch",children:[e.jsxDEV("input",{type:"checkbox",checked:!!o.showInUpcomingWidget,onChange:n=>B("showInUpcomingWidget",n.target.checked)},void 0,!1,{fileName:"C:/Users/pc/Documents/dexapp/dexapp/Backend/src/islands/record-agenda/components/EventModal.jsx",lineNumber:422,columnNumber:37},this),e.jsxDEV("span",{},void 0,!1,{fileName:"C:/Users/pc/Documents/dexapp/dexapp/Backend/src/islands/record-agenda/components/EventModal.jsx",lineNumber:427,columnNumber:37},this)]},void 0,!0,{fileName:"C:/Users/pc/Documents/dexapp/dexapp/Backend/src/islands/record-agenda/components/EventModal.jsx",lineNumber:421,columnNumber:33},this)]},void 0,!0,{fileName:"C:/Users/pc/Documents/dexapp/dexapp/Backend/src/islands/record-agenda/components/EventModal.jsx",lineNumber:416,columnNumber:29},this),e.jsxDEV("label",{className:`ra-widget-switch ${o.isImportantDate?"active":""}`,children:[e.jsxDEV("span",{className:"ra-widget-switch-copy",children:[e.jsxDEV("strong",{children:"Date importante"},void 0,!1,{fileName:"C:/Users/pc/Documents/dexapp/dexapp/Backend/src/islands/record-agenda/components/EventModal.jsx",lineNumber:432,columnNumber:37},this),e.jsxDEV("small",{children:"Afficher dans le widget dates importantes"},void 0,!1,{fileName:"C:/Users/pc/Documents/dexapp/dexapp/Backend/src/islands/record-agenda/components/EventModal.jsx",lineNumber:433,columnNumber:37},this)]},void 0,!0,{fileName:"C:/Users/pc/Documents/dexapp/dexapp/Backend/src/islands/record-agenda/components/EventModal.jsx",lineNumber:431,columnNumber:33},this),e.jsxDEV("span",{className:"ra-switch",children:[e.jsxDEV("input",{type:"checkbox",checked:!!o.isImportantDate,onChange:n=>B("isImportantDate",n.target.checked)},void 0,!1,{fileName:"C:/Users/pc/Documents/dexapp/dexapp/Backend/src/islands/record-agenda/components/EventModal.jsx",lineNumber:436,columnNumber:37},this),e.jsxDEV("span",{},void 0,!1,{fileName:"C:/Users/pc/Documents/dexapp/dexapp/Backend/src/islands/record-agenda/components/EventModal.jsx",lineNumber:441,columnNumber:37},this)]},void 0,!0,{fileName:"C:/Users/pc/Documents/dexapp/dexapp/Backend/src/islands/record-agenda/components/EventModal.jsx",lineNumber:435,columnNumber:33},this)]},void 0,!0,{fileName:"C:/Users/pc/Documents/dexapp/dexapp/Backend/src/islands/record-agenda/components/EventModal.jsx",lineNumber:430,columnNumber:29},this)]},void 0,!0,{fileName:"C:/Users/pc/Documents/dexapp/dexapp/Backend/src/islands/record-agenda/components/EventModal.jsx",lineNumber:415,columnNumber:25},this)]},void 0,!0,{fileName:"C:/Users/pc/Documents/dexapp/dexapp/Backend/src/islands/record-agenda/components/EventModal.jsx",lineNumber:413,columnNumber:21},this),!z&&w.length>0&&e.jsxDEV("div",{className:"ra-field",children:[e.jsxDEV("label",{className:"ra-label",children:"Tâche"},void 0,!1,{fileName:"C:/Users/pc/Documents/dexapp/dexapp/Backend/src/islands/record-agenda/components/EventModal.jsx",lineNumber:450,columnNumber:29},this),e.jsxDEV("div",{className:"ra-widget-switches",children:e.jsxDEV("label",{className:`ra-widget-switch ${o.createTask?"active":""}`,children:[e.jsxDEV("span",{className:"ra-widget-switch-copy",children:[e.jsxDEV("strong",{children:"Créer tâche"},void 0,!1,{fileName:"C:/Users/pc/Documents/dexapp/dexapp/Backend/src/islands/record-agenda/components/EventModal.jsx",lineNumber:454,columnNumber:41},this),e.jsxDEV("small",{children:"Ajouter aussi une tâche dans la liste"},void 0,!1,{fileName:"C:/Users/pc/Documents/dexapp/dexapp/Backend/src/islands/record-agenda/components/EventModal.jsx",lineNumber:455,columnNumber:41},this)]},void 0,!0,{fileName:"C:/Users/pc/Documents/dexapp/dexapp/Backend/src/islands/record-agenda/components/EventModal.jsx",lineNumber:453,columnNumber:37},this),e.jsxDEV("span",{className:"ra-switch",children:[e.jsxDEV("input",{type:"checkbox",checked:!!o.createTask,onChange:n=>B("createTask",n.target.checked)},void 0,!1,{fileName:"C:/Users/pc/Documents/dexapp/dexapp/Backend/src/islands/record-agenda/components/EventModal.jsx",lineNumber:458,columnNumber:41},this),e.jsxDEV("span",{},void 0,!1,{fileName:"C:/Users/pc/Documents/dexapp/dexapp/Backend/src/islands/record-agenda/components/EventModal.jsx",lineNumber:463,columnNumber:41},this)]},void 0,!0,{fileName:"C:/Users/pc/Documents/dexapp/dexapp/Backend/src/islands/record-agenda/components/EventModal.jsx",lineNumber:457,columnNumber:37},this)]},void 0,!0,{fileName:"C:/Users/pc/Documents/dexapp/dexapp/Backend/src/islands/record-agenda/components/EventModal.jsx",lineNumber:452,columnNumber:33},this)},void 0,!1,{fileName:"C:/Users/pc/Documents/dexapp/dexapp/Backend/src/islands/record-agenda/components/EventModal.jsx",lineNumber:451,columnNumber:29},this),o.createTask&&w.length>1&&e.jsxDEV("select",{className:"ra-input",value:o.selectedTaskListId,onChange:n=>B("selectedTaskListId",n.target.value),style:{marginTop:8},children:w.map(n=>e.jsxDEV("option",{value:n._id,children:n.label||"Liste des tâches"},n._id,!1,{fileName:"C:/Users/pc/Documents/dexapp/dexapp/Backend/src/islands/record-agenda/components/EventModal.jsx",lineNumber:475,columnNumber:41},this))},void 0,!1,{fileName:"C:/Users/pc/Documents/dexapp/dexapp/Backend/src/islands/record-agenda/components/EventModal.jsx",lineNumber:468,columnNumber:33},this)]},void 0,!0,{fileName:"C:/Users/pc/Documents/dexapp/dexapp/Backend/src/islands/record-agenda/components/EventModal.jsx",lineNumber:449,columnNumber:25},this),e.jsxDEV("div",{className:"ra-field",children:[e.jsxDEV("label",{className:"ra-label",children:"Lieu"},void 0,!1,{fileName:"C:/Users/pc/Documents/dexapp/dexapp/Backend/src/islands/record-agenda/components/EventModal.jsx",lineNumber:486,columnNumber:25},this),e.jsxDEV("input",{type:"text",className:"ra-input",placeholder:"Cabinet, Salle A, Domicile...",value:o.lieu,onChange:n=>B("lieu",n.target.value)},void 0,!1,{fileName:"C:/Users/pc/Documents/dexapp/dexapp/Backend/src/islands/record-agenda/components/EventModal.jsx",lineNumber:487,columnNumber:25},this)]},void 0,!0,{fileName:"C:/Users/pc/Documents/dexapp/dexapp/Backend/src/islands/record-agenda/components/EventModal.jsx",lineNumber:485,columnNumber:21},this),e.jsxDEV("div",{className:"ra-field",children:[e.jsxDEV("label",{className:"ra-label",children:"Notes"},void 0,!1,{fileName:"C:/Users/pc/Documents/dexapp/dexapp/Backend/src/islands/record-agenda/components/EventModal.jsx",lineNumber:498,columnNumber:25},this),e.jsxDEV("textarea",{className:"ra-input ra-textarea",placeholder:"Notes additionnelles...",rows:3,value:o.notes,onChange:n=>B("notes",n.target.value)},void 0,!1,{fileName:"C:/Users/pc/Documents/dexapp/dexapp/Backend/src/islands/record-agenda/components/EventModal.jsx",lineNumber:499,columnNumber:25},this)]},void 0,!0,{fileName:"C:/Users/pc/Documents/dexapp/dexapp/Backend/src/islands/record-agenda/components/EventModal.jsx",lineNumber:497,columnNumber:21},this),T&&e.jsxDEV("div",{className:"ra-modal-error",role:"alert",children:T},void 0,!1,{fileName:"C:/Users/pc/Documents/dexapp/dexapp/Backend/src/islands/record-agenda/components/EventModal.jsx",lineNumber:509,columnNumber:25},this)]},void 0,!0,{fileName:"C:/Users/pc/Documents/dexapp/dexapp/Backend/src/islands/record-agenda/components/EventModal.jsx",lineNumber:332,columnNumber:17},this),e.jsxDEV("div",{className:"ra-modal-footer",children:[z&&e.jsxDEV("button",{className:"ra-delete-btn",onClick:()=>_(r._id.toString()),type:"button",children:[e.jsxDEV("svg",{width:"14",height:"14",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",children:[e.jsxDEV("polyline",{points:"3 6 5 6 21 6"},void 0,!1,{fileName:"C:/Users/pc/Documents/dexapp/dexapp/Backend/src/islands/record-agenda/components/EventModal.jsx",lineNumber:523,columnNumber:33},this),e.jsxDEV("path",{d:"M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"},void 0,!1,{fileName:"C:/Users/pc/Documents/dexapp/dexapp/Backend/src/islands/record-agenda/components/EventModal.jsx",lineNumber:524,columnNumber:33},this)]},void 0,!0,{fileName:"C:/Users/pc/Documents/dexapp/dexapp/Backend/src/islands/record-agenda/components/EventModal.jsx",lineNumber:522,columnNumber:29},this),"Supprimer"]},void 0,!0,{fileName:"C:/Users/pc/Documents/dexapp/dexapp/Backend/src/islands/record-agenda/components/EventModal.jsx",lineNumber:517,columnNumber:25},this),e.jsxDEV("div",{className:"ra-modal-footer-right",children:[e.jsxDEV("button",{className:"ra-cancel-btn",onClick:f,type:"button",children:"Annuler"},void 0,!1,{fileName:"C:/Users/pc/Documents/dexapp/dexapp/Backend/src/islands/record-agenda/components/EventModal.jsx",lineNumber:530,columnNumber:25},this),e.jsxDEV("button",{className:"ra-save-btn",onClick:P,disabled:C||!o.title.trim(),type:"button",children:C?"Enregistrement...":z?"Mettre à jour":"Créer"},void 0,!1,{fileName:"C:/Users/pc/Documents/dexapp/dexapp/Backend/src/islands/record-agenda/components/EventModal.jsx",lineNumber:531,columnNumber:25},this)]},void 0,!0,{fileName:"C:/Users/pc/Documents/dexapp/dexapp/Backend/src/islands/record-agenda/components/EventModal.jsx",lineNumber:529,columnNumber:21},this)]},void 0,!0,{fileName:"C:/Users/pc/Documents/dexapp/dexapp/Backend/src/islands/record-agenda/components/EventModal.jsx",lineNumber:515,columnNumber:17},this)]},void 0,!0,{fileName:"C:/Users/pc/Documents/dexapp/dexapp/Backend/src/islands/record-agenda/components/EventModal.jsx",lineNumber:312,columnNumber:13},this),e.jsxDEV("style",{children:Ue()},void 0,!1,{fileName:"C:/Users/pc/Documents/dexapp/dexapp/Backend/src/islands/record-agenda/components/EventModal.jsx",lineNumber:543,columnNumber:13},this)]},void 0,!0,{fileName:"C:/Users/pc/Documents/dexapp/dexapp/Backend/src/islands/record-agenda/components/EventModal.jsx",lineNumber:311,columnNumber:9},this):null}function pe({value:a,options:f,onChange:r,onCreateOption:l,onDeleteOption:u,multiple:x=!1,placeholder:S="Ajouter..."}){const[_,E]=i.useState(""),[A,h]=i.useState(!1),[w,y]=i.useState(!1),[o,k]=i.useState(!1),[C,p]=i.useState(null),T=i.useRef(null),j=i.useRef(null),v=i.useMemo(()=>{if(x)return Ne(a);const t=a==null?"":String(a).trim();return t?[t]:[]},[x,a]),M=i.useMemo(()=>ne([f,v.map(t=>({label:t,value:t}))]),[f,v]),J=i.useMemo(()=>v.map(t=>M.find(D=>ce(D,t))||{label:t,value:t,color:H}),[M,v]),L=_.trim().toLowerCase(),z=i.useMemo(()=>M.filter(t=>!v.some(D=>ce(t,D))).filter(t=>L?String(t.label||"").toLowerCase().includes(L)||String(t.value||"").toLowerCase().includes(L):!0).slice(0,8),[M,v,L]),B=i.useMemo(()=>L?M.some(t=>String(t.label||"").trim().toLowerCase()===L||String(t.value||"").trim().toLowerCase()===L):!1,[M,L]);i.useEffect(()=>{const t=W=>{!T.current||T.current.contains(W.target)||(h(!1),p(null),E(""))},D=W=>{W.key==="Escape"&&(h(!1),p(null),E(""))};return document.addEventListener("mousedown",t),document.addEventListener("keydown",D),()=>{document.removeEventListener("mousedown",t),document.removeEventListener("keydown",D)}},[]);const P=i.useCallback(t=>{const D=ee(t);D.value&&(x?v.some(F=>F.toLowerCase()===String(D.value).toLowerCase())||r([...v,D.value]):(r(D.value),h(!1)),E(""),p(null),x&&h(!0),requestAnimationFrame(()=>{var W;return(W=j.current)==null?void 0:W.focus()}))},[x,r,v]),I=i.useCallback(t=>{r(x?v.filter(D=>D.toLowerCase()!==String(t).toLowerCase()):""),p(null),requestAnimationFrame(()=>{var D;return(D=j.current)==null?void 0:D.focus()})},[x,r,v]),q=i.useCallback(async()=>{const t=_.trim();if(!(!t||B||w)){y(!0);try{const D=await l(t);P(D||{label:t,value:t})}catch(D){console.error("[EventOptionSelect] Create option error:",D),window.showMessage?window.showMessage(D.message||"Création impossible","danger"):alert(D.message||"Création impossible")}finally{y(!1)}}},[w,B,l,_,P]),O=i.useCallback((t,D)=>{u&&(t.preventDefault(),t.stopPropagation(),p({x:t.clientX,y:t.clientY,option:ee(D)}))},[u]),R=i.useCallback(async()=>{if(!(!(C!=null&&C.option)||!u||o)){k(!0);try{if(await u(C.option)===!1){p(null);return}I(C.option.value),p(null),h(!1)}catch(t){console.error("[EventOptionSelect] Delete option error:",t),window.showMessage?window.showMessage(t.message||"Suppression impossible","danger"):alert(t.message||"Suppression impossible")}finally{k(!1)}}},[C,o,u,I]),K=t=>{t.key==="Enter"?(t.preventDefault(),z.length>0?P(z[0]):q()):t.key==="Backspace"&&!_&&v.length>0?I(v[v.length-1]):t.key==="Escape"&&(h(!1),p(null),E(""))};return e.jsxDEV("div",{className:"ra-option-picker",ref:T,children:[e.jsxDEV("div",{className:`ra-option-control ${A?"open":""}`,onClick:()=>{var t;h(!0),(t=j.current)==null||t.focus()},children:[J.map(t=>e.jsxDEV("span",{className:"ra-option-pill",onContextMenu:D=>O(D,t),title:u?"Clic droit pour supprimer cette option":void 0,style:{"--option-c":t.color||H,background:`${t.color||H}12`,borderColor:`${t.color||H}35`,color:t.color||H},children:[e.jsxDEV("span",{className:"ra-option-dot",style:{background:t.color||H}},void 0,!1,{fileName:"C:/Users/pc/Documents/dexapp/dexapp/Backend/src/islands/record-agenda/components/EventModal.jsx",lineNumber:724,columnNumber:25},this),t.label,e.jsxDEV("button",{type:"button",onClick:D=>{D.stopPropagation(),I(t.value)},"aria-label":`Retirer ${t.label}`,children:"×"},void 0,!1,{fileName:"C:/Users/pc/Documents/dexapp/dexapp/Backend/src/islands/record-agenda/components/EventModal.jsx",lineNumber:726,columnNumber:25},this)]},t.value,!0,{fileName:"C:/Users/pc/Documents/dexapp/dexapp/Backend/src/islands/record-agenda/components/EventModal.jsx",lineNumber:712,columnNumber:21},this)),e.jsxDEV("input",{ref:j,className:"ra-option-input",value:_,onChange:t=>{E(t.target.value),h(!0)},onFocus:()=>h(!0),onKeyDown:K,placeholder:J.length?"Ajouter...":S},void 0,!1,{fileName:"C:/Users/pc/Documents/dexapp/dexapp/Backend/src/islands/record-agenda/components/EventModal.jsx",lineNumber:731,columnNumber:17},this)]},void 0,!0,{fileName:"C:/Users/pc/Documents/dexapp/dexapp/Backend/src/islands/record-agenda/components/EventModal.jsx",lineNumber:710,columnNumber:13},this),A&&(z.length>0||_.trim()&&!B)&&e.jsxDEV("div",{className:"ra-option-menu",children:[z.map(t=>e.jsxDEV("button",{type:"button",className:"ra-option-item",onClick:()=>P(t),onContextMenu:D=>O(D,t),title:u?"Clic droit pour supprimer cette option":void 0,children:[e.jsxDEV("span",{className:"ra-option-dot",style:{background:t.color||H}},void 0,!1,{fileName:"C:/Users/pc/Documents/dexapp/dexapp/Backend/src/islands/record-agenda/components/EventModal.jsx",lineNumber:753,columnNumber:29},this),e.jsxDEV("span",{children:t.label},void 0,!1,{fileName:"C:/Users/pc/Documents/dexapp/dexapp/Backend/src/islands/record-agenda/components/EventModal.jsx",lineNumber:754,columnNumber:29},this)]},t.value,!0,{fileName:"C:/Users/pc/Documents/dexapp/dexapp/Backend/src/islands/record-agenda/components/EventModal.jsx",lineNumber:745,columnNumber:25},this)),_.trim()&&!B&&e.jsxDEV("button",{type:"button",className:"ra-option-create",onClick:q,disabled:w,children:[e.jsxDEV("span",{children:"+"},void 0,!1,{fileName:"C:/Users/pc/Documents/dexapp/dexapp/Backend/src/islands/record-agenda/components/EventModal.jsx",lineNumber:759,columnNumber:29},this),w?"Création...":`Créer "${_.trim()}"`]},void 0,!0,{fileName:"C:/Users/pc/Documents/dexapp/dexapp/Backend/src/islands/record-agenda/components/EventModal.jsx",lineNumber:758,columnNumber:25},this)]},void 0,!0,{fileName:"C:/Users/pc/Documents/dexapp/dexapp/Backend/src/islands/record-agenda/components/EventModal.jsx",lineNumber:743,columnNumber:17},this),C&&e.jsxDEV("div",{className:"ra-option-context-menu",style:{left:C.x,top:C.y},children:e.jsxDEV("button",{type:"button",onClick:R,disabled:o,children:o?"Suppression...":`Supprimer "${C.option.label}"`},void 0,!1,{fileName:"C:/Users/pc/Documents/dexapp/dexapp/Backend/src/islands/record-agenda/components/EventModal.jsx",lineNumber:768,columnNumber:21},this)},void 0,!1,{fileName:"C:/Users/pc/Documents/dexapp/dexapp/Backend/src/islands/record-agenda/components/EventModal.jsx",lineNumber:767,columnNumber:17},this)]},void 0,!0,{fileName:"C:/Users/pc/Documents/dexapp/dexapp/Backend/src/islands/record-agenda/components/EventModal.jsx",lineNumber:709,columnNumber:9},this)}function ue(a,f){return((a==null?void 0:a.customFields)||[]).find(r=>(r==null?void 0:r.name)===f)||null}function xe(a,f=!1){if(a==null||a==="")return f;if(typeof a=="boolean")return a;if(typeof a=="number")return a!==0;const r=String(a).trim().toLowerCase();return["true","1","yes","oui","on"].includes(r)?!0:["false","0","no","non","off"].includes(r)?!1:f}function ie(a){return Ne(a)}function Ne(a){return(Array.isArray(a)?a:typeof a=="string"?a.split(","):[]).map(r=>r&&typeof r=="object"?String(r.value||r.label||r.name||"").trim():String(r||"").trim()).filter(Boolean).filter((r,l,u)=>u.findIndex(x=>x.toLowerCase()===r.toLowerCase())===l)}function ee(a){var r,l;if(typeof a=="object"&&a){const u=a.id||((l=(r=a._id)==null?void 0:r.toString)==null?void 0:l.call(r))||a._id||"",x=String(a.label||a.value||a.name||u||"").trim(),S=String(a.value||u||a.label||"").trim();return{label:x,value:S,color:a.color||H,id:String(u||S)}}const f=String(a||"").trim();return{label:f,value:f,color:H,id:f}}function fe(a){var l,u;const f=ee(a),r=(a==null?void 0:a.id)||((u=(l=a==null?void 0:a._id)==null?void 0:l.toString)==null?void 0:u.call(l))||(a==null?void 0:a._id)||f.value;return{...f,value:String(r||f.value||"").trim(),id:String(r||f.value||"").trim()}}function ce(a,f){const r=String(f||"").trim().toLowerCase();return[a.value,a.label,a.id].filter(l=>l!=null).some(l=>String(l).trim().toLowerCase()===r)}function ne(a,f=[]){const r=[],l=new Set,u=new Set((f||[]).map(x=>String(x||"").trim().toLowerCase()).filter(Boolean));return a.flat().forEach(x=>{const S=ee(x);if(!S.value||[S.value,S.label,S.id].map(A=>String(A||"").trim().toLowerCase()).filter(Boolean).some(A=>u.has(A)))return;const E=String(S.value||S.label).toLowerCase();l.has(E)||(l.add(E),r.push(S))}),r}function Be(a,f){const r=ee(f),l=new Set((a||[]).map(u=>String(u||"").trim().toLowerCase()).filter(Boolean));return[r.value,r.label,r.id].map(u=>String(u||"").trim().toLowerCase()).filter(Boolean).forEach(u=>l.add(u)),[...l]}function be(a){const r=[...String(a||"")].reduce((l,u)=>l+u.charCodeAt(0),0);return me[r%me.length]||H}function de(a){const f=a.getFullYear(),r=String(a.getMonth()+1).padStart(2,"0"),l=String(a.getDate()).padStart(2,"0"),u=String(a.getHours()).padStart(2,"0"),x=String(a.getMinutes()).padStart(2,"0");return`${f}-${r}-${l}T${u}:${x}`}function he(a,f){if(!a)return null;const r=new Date(a);if(Number.isNaN(r.getTime()))throw new Error(`${f} invalide.`);return r}function Ue(){return`
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

.ra-option-picker { position:relative; }
.ra-option-control {
    min-height:42px; width:100%; padding:6px 8px;
    border:1.5px solid #e2e8f0; border-radius:8px;
    background:#fff; display:flex; align-items:center; flex-wrap:wrap; gap:6px;
    cursor:text; transition:border-color .2s, box-shadow .2s; box-sizing:border-box;
}
.ra-option-control.open {
    border-color:#14b8a6;
    box-shadow:0 0 0 3px rgba(20,184,166,.08);
}
.dark .ra-option-control { background:#1b2e4b; border-color:#253b5c; }
.dark .ra-option-control.open { border-color:#14b8a6; }
.ra-option-pill {
    display:inline-flex; align-items:center; gap:5px;
    min-height:25px; padding:3px 8px; border:1px solid;
    border-radius:7px; font-size:12px; font-weight:700; line-height:1.2;
}
.ra-option-pill button {
    width:16px; height:16px; border:0; border-radius:50%;
    background:transparent; color:inherit; cursor:pointer;
    display:flex; align-items:center; justify-content:center;
    font-size:14px; line-height:1; opacity:.65; padding:0;
}
.ra-option-pill button:hover { opacity:1; background:rgba(15,23,42,.08); }
.ra-option-input {
    flex:1; min-width:130px; border:0; outline:0; background:transparent;
    color:#0e1726; font-size:13px; font-family:inherit; padding:4px 3px;
}
.ra-option-input::placeholder { color:#9ca3af; }
.dark .ra-option-input { color:#e0e6ed; }
.ra-option-menu {
    position:absolute; left:0; right:0; top:calc(100% + 5px); z-index:20;
    background:#fff; border:1px solid #e2e8f0; border-radius:10px;
    box-shadow:0 16px 42px rgba(15,23,42,.14);
    padding:5px; max-height:210px; overflow-y:auto;
}
.dark .ra-option-menu { background:#0e1726; border-color:#253b5c; box-shadow:0 16px 42px rgba(0,0,0,.32); }
.ra-option-item,
.ra-option-create {
    width:100%; border:0; background:transparent; border-radius:8px;
    display:flex; align-items:center; gap:8px; padding:8px 9px;
    color:#334155; font-size:12.5px; font-weight:700;
    cursor:pointer; text-align:left; font-family:inherit;
}
.ra-option-item:hover,
.ra-option-create:hover { background:#f8fafc; }
.dark .ra-option-item,
.dark .ra-option-create { color:#e0e6ed; }
.dark .ra-option-item:hover,
.dark .ra-option-create:hover { background:#1b2e4b; }
.ra-option-dot { width:8px; height:8px; border-radius:50%; flex:none; }
.ra-option-create { color:#14b8a6; border-top:1px solid #f1f5f9; margin-top:3px; }
.dark .ra-option-create { border-top-color:#253b5c; }
.ra-option-create span {
    width:18px; height:18px; border-radius:6px; background:rgba(20,184,166,.12);
    display:flex; align-items:center; justify-content:center; font-size:14px; font-weight:800;
}
.ra-option-create:disabled { opacity:.6; cursor:wait; }
.ra-option-context-menu {
    position:fixed; z-index:10020; min-width:180px;
    padding:5px; border-radius:9px; border:1px solid #e2e8f0;
    background:#fff; box-shadow:0 16px 42px rgba(15,23,42,.18);
}
.dark .ra-option-context-menu { background:#0e1726; border-color:#253b5c; box-shadow:0 16px 42px rgba(0,0,0,.34); }
.ra-option-context-menu button {
    width:100%; border:0; border-radius:7px; background:transparent;
    color:#ef4444; cursor:pointer; padding:8px 9px; text-align:left;
    font-size:12px; font-weight:800; font-family:inherit;
}
.ra-option-context-menu button:hover { background:#fef2f2; }
.ra-option-context-menu button:disabled { opacity:.6; cursor:wait; }
.dark .ra-option-context-menu button:hover { background:rgba(127,29,29,.2); }

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
`}function Se({events:a,entityData:f,onEventClick:r,getStatusInfo:l,getCustomFieldValue:u}){const x=i.useMemo(()=>{const h=[...a].sort((y,o)=>{const k=y.date?new Date(y.date).getTime():0,C=o.date?new Date(o.date).getTime():0;return k-C}),w={};return h.forEach(y=>{const k=(y.date?new Date(y.date):new Date).toISOString().split("T")[0];w[k]||(w[k]=[]),w[k].push(y)}),Object.entries(w).map(([y,o])=>({dateKey:y,date:new Date(y),items:o}))},[a]),S=h=>{const w=new Date,y=new Date(w);y.setDate(y.getDate()+1);const o=new Date(w);o.setDate(o.getDate()-1);const k=h.toISOString().split("T")[0];return k===w.toISOString().split("T")[0]?"Aujourd'hui":k===y.toISOString().split("T")[0]?"Demain":k===o.toISOString().split("T")[0]?"Hier":h.toLocaleDateString("fr-FR",{weekday:"long",day:"numeric",month:"long",year:"numeric"})},_=h=>h?new Date(h).toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit",hour12:!1}):"",E=h=>h?new Date(h)<new Date:!1,A=h=>h?new Date(h).toISOString().split("T")[0]===new Date().toISOString().split("T")[0]:!1;return a.length===0?null:e.jsxDEV("div",{className:"ra-timeline",children:[e.jsxDEV("style",{children:Me()},void 0,!1,{fileName:"C:/Users/pc/Documents/dexapp/dexapp/Backend/src/islands/record-agenda/components/TimelineView.jsx",lineNumber:65,columnNumber:13},this),x.map((h,w)=>e.jsxDEV("div",{className:"ra-tl-group",style:{animationDelay:`${w*80}ms`},children:[e.jsxDEV("div",{className:`ra-tl-date-header ${A(h.dateKey)?"today":""} ${E(h.dateKey)&&!A(h.dateKey)?"past":""}`,children:[e.jsxDEV("div",{className:"ra-tl-date-dot"},void 0,!1,{fileName:"C:/Users/pc/Documents/dexapp/dexapp/Backend/src/islands/record-agenda/components/TimelineView.jsx",lineNumber:69,columnNumber:25},this),e.jsxDEV("span",{className:"ra-tl-date-label",children:S(h.date)},void 0,!1,{fileName:"C:/Users/pc/Documents/dexapp/dexapp/Backend/src/islands/record-agenda/components/TimelineView.jsx",lineNumber:70,columnNumber:25},this),e.jsxDEV("span",{className:"ra-tl-date-count",children:[h.items.length," événement",h.items.length>1?"s":""]},void 0,!0,{fileName:"C:/Users/pc/Documents/dexapp/dexapp/Backend/src/islands/record-agenda/components/TimelineView.jsx",lineNumber:71,columnNumber:25},this)]},void 0,!0,{fileName:"C:/Users/pc/Documents/dexapp/dexapp/Backend/src/islands/record-agenda/components/TimelineView.jsx",lineNumber:68,columnNumber:21},this),e.jsxDEV("div",{className:"ra-tl-items",children:h.items.map((y,o)=>{var M;const k=l(y),C=u(y,"lieu_evenement"),p=u(y,"duree_evenement"),T=u(y,"type_evenement"),j=Te(u(y,"tags_evenement")),v=E(y.date);return e.jsxDEV("div",{className:`ra-tl-item ${v?"past":""}`,style:{animationDelay:`${w*80+o*50}ms`},onClick:()=>r(y),children:[e.jsxDEV("div",{className:"ra-tl-time",children:_(y.date)},void 0,!1,{fileName:"C:/Users/pc/Documents/dexapp/dexapp/Backend/src/islands/record-agenda/components/TimelineView.jsx",lineNumber:90,columnNumber:37},this),e.jsxDEV("div",{className:"ra-tl-connector",children:[e.jsxDEV("div",{className:"ra-tl-line"},void 0,!1,{fileName:"C:/Users/pc/Documents/dexapp/dexapp/Backend/src/islands/record-agenda/components/TimelineView.jsx",lineNumber:94,columnNumber:41},this),e.jsxDEV("div",{className:"ra-tl-node",style:{borderColor:k.color,background:`${k.color}20`}},void 0,!1,{fileName:"C:/Users/pc/Documents/dexapp/dexapp/Backend/src/islands/record-agenda/components/TimelineView.jsx",lineNumber:95,columnNumber:41},this),e.jsxDEV("div",{className:"ra-tl-line"},void 0,!1,{fileName:"C:/Users/pc/Documents/dexapp/dexapp/Backend/src/islands/record-agenda/components/TimelineView.jsx",lineNumber:96,columnNumber:41},this)]},void 0,!0,{fileName:"C:/Users/pc/Documents/dexapp/dexapp/Backend/src/islands/record-agenda/components/TimelineView.jsx",lineNumber:93,columnNumber:37},this),e.jsxDEV("div",{className:"ra-tl-card",children:[e.jsxDEV("div",{className:"ra-tl-card-accent",style:{background:k.color}},void 0,!1,{fileName:"C:/Users/pc/Documents/dexapp/dexapp/Backend/src/islands/record-agenda/components/TimelineView.jsx",lineNumber:99,columnNumber:41},this),e.jsxDEV("div",{className:"ra-tl-card-body",children:[e.jsxDEV("div",{className:"ra-tl-card-top",children:[e.jsxDEV("h4",{className:"ra-tl-card-title",children:y.title||"Sans titre"},void 0,!1,{fileName:"C:/Users/pc/Documents/dexapp/dexapp/Backend/src/islands/record-agenda/components/TimelineView.jsx",lineNumber:102,columnNumber:49},this),e.jsxDEV("span",{className:"ra-tl-status",style:{background:`${k.color}15`,color:k.color},children:k.label},void 0,!1,{fileName:"C:/Users/pc/Documents/dexapp/dexapp/Backend/src/islands/record-agenda/components/TimelineView.jsx",lineNumber:103,columnNumber:49},this)]},void 0,!0,{fileName:"C:/Users/pc/Documents/dexapp/dexapp/Backend/src/islands/record-agenda/components/TimelineView.jsx",lineNumber:101,columnNumber:45},this),e.jsxDEV("div",{className:"ra-tl-card-meta",children:[p&&e.jsxDEV("span",{className:"ra-tl-meta-item",children:[e.jsxDEV("svg",{width:"12",height:"12",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",children:[e.jsxDEV("circle",{cx:"12",cy:"12",r:"10"},void 0,!1,{fileName:"C:/Users/pc/Documents/dexapp/dexapp/Backend/src/islands/record-agenda/components/TimelineView.jsx",lineNumber:110,columnNumber:155},this),e.jsxDEV("polyline",{points:"12 6 12 12 16 14"},void 0,!1,{fileName:"C:/Users/pc/Documents/dexapp/dexapp/Backend/src/islands/record-agenda/components/TimelineView.jsx",lineNumber:110,columnNumber:187},this)]},void 0,!0,{fileName:"C:/Users/pc/Documents/dexapp/dexapp/Backend/src/islands/record-agenda/components/TimelineView.jsx",lineNumber:110,columnNumber:57},this),p," min"]},void 0,!0,{fileName:"C:/Users/pc/Documents/dexapp/dexapp/Backend/src/islands/record-agenda/components/TimelineView.jsx",lineNumber:109,columnNumber:53},this),C&&e.jsxDEV("span",{className:"ra-tl-meta-item",children:[e.jsxDEV("svg",{width:"12",height:"12",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",children:[e.jsxDEV("path",{d:"M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"},void 0,!1,{fileName:"C:/Users/pc/Documents/dexapp/dexapp/Backend/src/islands/record-agenda/components/TimelineView.jsx",lineNumber:116,columnNumber:155},this),e.jsxDEV("circle",{cx:"12",cy:"10",r:"3"},void 0,!1,{fileName:"C:/Users/pc/Documents/dexapp/dexapp/Backend/src/islands/record-agenda/components/TimelineView.jsx",lineNumber:116,columnNumber:213},this)]},void 0,!0,{fileName:"C:/Users/pc/Documents/dexapp/dexapp/Backend/src/islands/record-agenda/components/TimelineView.jsx",lineNumber:116,columnNumber:57},this),C]},void 0,!0,{fileName:"C:/Users/pc/Documents/dexapp/dexapp/Backend/src/islands/record-agenda/components/TimelineView.jsx",lineNumber:115,columnNumber:53},this),T&&e.jsxDEV("span",{className:"ra-tl-meta-item",children:[e.jsxDEV("svg",{width:"12",height:"12",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",children:[e.jsxDEV("path",{d:"M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"},void 0,!1,{fileName:"C:/Users/pc/Documents/dexapp/dexapp/Backend/src/islands/record-agenda/components/TimelineView.jsx",lineNumber:122,columnNumber:155},this),e.jsxDEV("line",{x1:"7",y1:"7",x2:"7.01",y2:"7"},void 0,!1,{fileName:"C:/Users/pc/Documents/dexapp/dexapp/Backend/src/islands/record-agenda/components/TimelineView.jsx",lineNumber:122,columnNumber:245},this)]},void 0,!0,{fileName:"C:/Users/pc/Documents/dexapp/dexapp/Backend/src/islands/record-agenda/components/TimelineView.jsx",lineNumber:122,columnNumber:57},this),T.charAt(0).toUpperCase()+T.slice(1)]},void 0,!0,{fileName:"C:/Users/pc/Documents/dexapp/dexapp/Backend/src/islands/record-agenda/components/TimelineView.jsx",lineNumber:121,columnNumber:53},this)]},void 0,!0,{fileName:"C:/Users/pc/Documents/dexapp/dexapp/Backend/src/islands/record-agenda/components/TimelineView.jsx",lineNumber:107,columnNumber:45},this),j.length>0&&e.jsxDEV("div",{className:"ra-tl-tags",children:j.map(J=>e.jsxDEV("span",{className:"ra-tl-tag",children:J},J,!1,{fileName:"C:/Users/pc/Documents/dexapp/dexapp/Backend/src/islands/record-agenda/components/TimelineView.jsx",lineNumber:130,columnNumber:57},this))},void 0,!1,{fileName:"C:/Users/pc/Documents/dexapp/dexapp/Backend/src/islands/record-agenda/components/TimelineView.jsx",lineNumber:128,columnNumber:49},this)]},void 0,!0,{fileName:"C:/Users/pc/Documents/dexapp/dexapp/Backend/src/islands/record-agenda/components/TimelineView.jsx",lineNumber:100,columnNumber:41},this)]},void 0,!0,{fileName:"C:/Users/pc/Documents/dexapp/dexapp/Backend/src/islands/record-agenda/components/TimelineView.jsx",lineNumber:98,columnNumber:37},this)]},(M=y._id)==null?void 0:M.toString(),!0,{fileName:"C:/Users/pc/Documents/dexapp/dexapp/Backend/src/islands/record-agenda/components/TimelineView.jsx",lineNumber:84,columnNumber:33},this)})},void 0,!1,{fileName:"C:/Users/pc/Documents/dexapp/dexapp/Backend/src/islands/record-agenda/components/TimelineView.jsx",lineNumber:74,columnNumber:21},this)]},h.dateKey,!0,{fileName:"C:/Users/pc/Documents/dexapp/dexapp/Backend/src/islands/record-agenda/components/TimelineView.jsx",lineNumber:67,columnNumber:17},this))]},void 0,!0,{fileName:"C:/Users/pc/Documents/dexapp/dexapp/Backend/src/islands/record-agenda/components/TimelineView.jsx",lineNumber:64,columnNumber:9},this)}function Te(a){return(Array.isArray(a)?a:typeof a=="string"?a.split(","):[]).map(r=>String(r||"").trim()).filter(Boolean)}function Me(){return`
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
`}function Le({events:a,entityData:f,onEventClick:r,onDeleteEvent:l,getStatusInfo:u,getCustomFieldValue:x}){const[S,_]=i.useState("date"),[E,A]=i.useState("asc"),h=i.useMemo(()=>[...a].sort((p,T)=>{let j,v;switch(S){case"title":return j=(p.title||"").toLowerCase(),v=(T.title||"").toLowerCase(),E==="asc"?j.localeCompare(v):v.localeCompare(j);case"status":return j=u(p).label,v=u(T).label,E==="asc"?j.localeCompare(v):v.localeCompare(j);case"type":return j=x(p,"type_evenement")||"",v=x(T,"type_evenement")||"",E==="asc"?j.localeCompare(v):v.localeCompare(j);case"date":default:return j=p.date?new Date(p.date).getTime():0,v=T.date?new Date(T.date).getTime():0,E==="asc"?j-v:v-j}}),[a,S,E,u,x]),w=p=>{S===p?A(T=>T==="asc"?"desc":"asc"):(_(p),A("asc"))},y=p=>p?new Date(p).toLocaleDateString("fr-FR",{day:"2-digit",month:"short",year:"numeric"}):"—",o=p=>p?new Date(p).toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit",hour12:!1}):"",k=p=>p&&new Date(p)<new Date,C=({field:p})=>e.jsxDEV("svg",{width:"10",height:"10",viewBox:"0 0 10 10",fill:"none",style:{opacity:S===p?1:.3},children:e.jsxDEV("path",{d:S===p&&E==="desc"?"M5 2L8 6H2L5 2Z":"M5 8L2 4H8L5 8Z",fill:"currentColor"},void 0,!1,{fileName:"C:/Users/pc/Documents/dexapp/dexapp/Backend/src/islands/record-agenda/components/ListView.jsx",lineNumber:59,columnNumber:13},this)},void 0,!1,{fileName:"C:/Users/pc/Documents/dexapp/dexapp/Backend/src/islands/record-agenda/components/ListView.jsx",lineNumber:58,columnNumber:9},this);return a.length===0?null:e.jsxDEV("div",{className:"ra-list-wrap",children:[e.jsxDEV("style",{children:Ae()},void 0,!1,{fileName:"C:/Users/pc/Documents/dexapp/dexapp/Backend/src/islands/record-agenda/components/ListView.jsx",lineNumber:67,columnNumber:13},this),e.jsxDEV("table",{className:"ra-list-table",children:[e.jsxDEV("thead",{children:e.jsxDEV("tr",{children:[e.jsxDEV("th",{className:"ra-th ra-th-sortable",onClick:()=>w("title"),children:["Titre ",e.jsxDEV(C,{field:"title"},void 0,!1,{fileName:"C:/Users/pc/Documents/dexapp/dexapp/Backend/src/islands/record-agenda/components/ListView.jsx",lineNumber:72,columnNumber:35},this)]},void 0,!0,{fileName:"C:/Users/pc/Documents/dexapp/dexapp/Backend/src/islands/record-agenda/components/ListView.jsx",lineNumber:71,columnNumber:25},this),e.jsxDEV("th",{className:"ra-th ra-th-sortable",onClick:()=>w("date"),children:["Date ",e.jsxDEV(C,{field:"date"},void 0,!1,{fileName:"C:/Users/pc/Documents/dexapp/dexapp/Backend/src/islands/record-agenda/components/ListView.jsx",lineNumber:75,columnNumber:34},this)]},void 0,!0,{fileName:"C:/Users/pc/Documents/dexapp/dexapp/Backend/src/islands/record-agenda/components/ListView.jsx",lineNumber:74,columnNumber:25},this),e.jsxDEV("th",{className:"ra-th",children:"Heure"},void 0,!1,{fileName:"C:/Users/pc/Documents/dexapp/dexapp/Backend/src/islands/record-agenda/components/ListView.jsx",lineNumber:77,columnNumber:25},this),e.jsxDEV("th",{className:"ra-th",children:"Durée"},void 0,!1,{fileName:"C:/Users/pc/Documents/dexapp/dexapp/Backend/src/islands/record-agenda/components/ListView.jsx",lineNumber:78,columnNumber:25},this),e.jsxDEV("th",{className:"ra-th ra-th-sortable",onClick:()=>w("type"),children:["Type ",e.jsxDEV(C,{field:"type"},void 0,!1,{fileName:"C:/Users/pc/Documents/dexapp/dexapp/Backend/src/islands/record-agenda/components/ListView.jsx",lineNumber:80,columnNumber:34},this)]},void 0,!0,{fileName:"C:/Users/pc/Documents/dexapp/dexapp/Backend/src/islands/record-agenda/components/ListView.jsx",lineNumber:79,columnNumber:25},this),e.jsxDEV("th",{className:"ra-th",children:"Étiquettes"},void 0,!1,{fileName:"C:/Users/pc/Documents/dexapp/dexapp/Backend/src/islands/record-agenda/components/ListView.jsx",lineNumber:82,columnNumber:25},this),e.jsxDEV("th",{className:"ra-th",children:"Lieu"},void 0,!1,{fileName:"C:/Users/pc/Documents/dexapp/dexapp/Backend/src/islands/record-agenda/components/ListView.jsx",lineNumber:83,columnNumber:25},this),e.jsxDEV("th",{className:"ra-th ra-th-sortable",onClick:()=>w("status"),children:["Statut ",e.jsxDEV(C,{field:"status"},void 0,!1,{fileName:"C:/Users/pc/Documents/dexapp/dexapp/Backend/src/islands/record-agenda/components/ListView.jsx",lineNumber:85,columnNumber:36},this)]},void 0,!0,{fileName:"C:/Users/pc/Documents/dexapp/dexapp/Backend/src/islands/record-agenda/components/ListView.jsx",lineNumber:84,columnNumber:25},this),e.jsxDEV("th",{className:"ra-th",style:{width:40}},void 0,!1,{fileName:"C:/Users/pc/Documents/dexapp/dexapp/Backend/src/islands/record-agenda/components/ListView.jsx",lineNumber:87,columnNumber:25},this)]},void 0,!0,{fileName:"C:/Users/pc/Documents/dexapp/dexapp/Backend/src/islands/record-agenda/components/ListView.jsx",lineNumber:70,columnNumber:21},this)},void 0,!1,{fileName:"C:/Users/pc/Documents/dexapp/dexapp/Backend/src/islands/record-agenda/components/ListView.jsx",lineNumber:69,columnNumber:17},this),e.jsxDEV("tbody",{children:h.map((p,T)=>{var B;const j=u(p),v=x(p,"type_evenement"),M=Ie(x(p,"tags_evenement")),J=x(p,"lieu_evenement"),L=x(p,"duree_evenement"),z=k(p.date);return e.jsxDEV("tr",{className:`ra-tr ${z?"past":""}`,onClick:()=>r(p),style:{animationDelay:`${T*30}ms`},children:[e.jsxDEV("td",{className:"ra-td ra-td-title",children:[e.jsxDEV("div",{className:"ra-td-title-dot",style:{background:j.color}},void 0,!1,{fileName:"C:/Users/pc/Documents/dexapp/dexapp/Backend/src/islands/record-agenda/components/ListView.jsx",lineNumber:107,columnNumber:37},this),p.title||"Sans titre"]},void 0,!0,{fileName:"C:/Users/pc/Documents/dexapp/dexapp/Backend/src/islands/record-agenda/components/ListView.jsx",lineNumber:106,columnNumber:33},this),e.jsxDEV("td",{className:"ra-td",children:y(p.date)},void 0,!1,{fileName:"C:/Users/pc/Documents/dexapp/dexapp/Backend/src/islands/record-agenda/components/ListView.jsx",lineNumber:110,columnNumber:33},this),e.jsxDEV("td",{className:"ra-td ra-td-time",children:o(p.date)},void 0,!1,{fileName:"C:/Users/pc/Documents/dexapp/dexapp/Backend/src/islands/record-agenda/components/ListView.jsx",lineNumber:111,columnNumber:33},this),e.jsxDEV("td",{className:"ra-td",children:L?`${L} min`:"—"},void 0,!1,{fileName:"C:/Users/pc/Documents/dexapp/dexapp/Backend/src/islands/record-agenda/components/ListView.jsx",lineNumber:112,columnNumber:33},this),e.jsxDEV("td",{className:"ra-td ra-td-type",children:v?e.jsxDEV("span",{className:"ra-td-type-badge",children:v.charAt(0).toUpperCase()+v.slice(1)},void 0,!1,{fileName:"C:/Users/pc/Documents/dexapp/dexapp/Backend/src/islands/record-agenda/components/ListView.jsx",lineNumber:115,columnNumber:41},this):"—"},void 0,!1,{fileName:"C:/Users/pc/Documents/dexapp/dexapp/Backend/src/islands/record-agenda/components/ListView.jsx",lineNumber:113,columnNumber:33},this),e.jsxDEV("td",{className:"ra-td ra-td-tags",children:M.length>0?M.map(P=>e.jsxDEV("span",{className:"ra-list-tag",children:P},P,!1,{fileName:"C:/Users/pc/Documents/dexapp/dexapp/Backend/src/islands/record-agenda/components/ListView.jsx",lineNumber:122,columnNumber:41},this)):"—"},void 0,!1,{fileName:"C:/Users/pc/Documents/dexapp/dexapp/Backend/src/islands/record-agenda/components/ListView.jsx",lineNumber:120,columnNumber:33},this),e.jsxDEV("td",{className:"ra-td",children:J||"—"},void 0,!1,{fileName:"C:/Users/pc/Documents/dexapp/dexapp/Backend/src/islands/record-agenda/components/ListView.jsx",lineNumber:125,columnNumber:33},this),e.jsxDEV("td",{className:"ra-td",children:e.jsxDEV("span",{className:"ra-td-status",style:{background:`${j.color}12`,color:j.color},children:j.label},void 0,!1,{fileName:"C:/Users/pc/Documents/dexapp/dexapp/Backend/src/islands/record-agenda/components/ListView.jsx",lineNumber:127,columnNumber:37},this)},void 0,!1,{fileName:"C:/Users/pc/Documents/dexapp/dexapp/Backend/src/islands/record-agenda/components/ListView.jsx",lineNumber:126,columnNumber:33},this),e.jsxDEV("td",{className:"ra-td ra-td-actions",children:e.jsxDEV("button",{className:"ra-td-delete",onClick:P=>{var I;P.stopPropagation(),l((I=p._id)==null?void 0:I.toString())},title:"Supprimer",children:e.jsxDEV("svg",{width:"14",height:"14",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",children:[e.jsxDEV("polyline",{points:"3 6 5 6 21 6"},void 0,!1,{fileName:"C:/Users/pc/Documents/dexapp/dexapp/Backend/src/islands/record-agenda/components/ListView.jsx",lineNumber:138,columnNumber:45},this),e.jsxDEV("path",{d:"M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"},void 0,!1,{fileName:"C:/Users/pc/Documents/dexapp/dexapp/Backend/src/islands/record-agenda/components/ListView.jsx",lineNumber:139,columnNumber:45},this)]},void 0,!0,{fileName:"C:/Users/pc/Documents/dexapp/dexapp/Backend/src/islands/record-agenda/components/ListView.jsx",lineNumber:137,columnNumber:41},this)},void 0,!1,{fileName:"C:/Users/pc/Documents/dexapp/dexapp/Backend/src/islands/record-agenda/components/ListView.jsx",lineNumber:132,columnNumber:37},this)},void 0,!1,{fileName:"C:/Users/pc/Documents/dexapp/dexapp/Backend/src/islands/record-agenda/components/ListView.jsx",lineNumber:131,columnNumber:33},this)]},(B=p._id)==null?void 0:B.toString(),!0,{fileName:"C:/Users/pc/Documents/dexapp/dexapp/Backend/src/islands/record-agenda/components/ListView.jsx",lineNumber:100,columnNumber:29},this)})},void 0,!1,{fileName:"C:/Users/pc/Documents/dexapp/dexapp/Backend/src/islands/record-agenda/components/ListView.jsx",lineNumber:90,columnNumber:17},this)]},void 0,!0,{fileName:"C:/Users/pc/Documents/dexapp/dexapp/Backend/src/islands/record-agenda/components/ListView.jsx",lineNumber:68,columnNumber:13},this)]},void 0,!0,{fileName:"C:/Users/pc/Documents/dexapp/dexapp/Backend/src/islands/record-agenda/components/ListView.jsx",lineNumber:66,columnNumber:9},this)}function Ie(a){return(Array.isArray(a)?a:typeof a=="string"?a.split(","):[]).map(r=>String(r||"").trim()).filter(Boolean)}function Ae(){return`
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
`}function Oe({accountNumber:a,recordId:f,entitySlug:r}){const[l,u]=i.useState([]),[x,S]=i.useState(null),[_,E]=i.useState([]),[A,h]=i.useState(!0),[w,y]=i.useState(!1),[o,k]=i.useState(""),[C,p]=i.useState("calendar"),[T,j]=i.useState("dayGridMonth"),[v,M]=i.useState(!1),[J,L]=i.useState(null),[z,B]=i.useState(null),P=i.useRef(null),I=i.useRef(null),q=i.useRef(""),O=`agenda-${f}`,R=`/account/${a}/api/records/${f}/events`,K=`/account/${a}/api/user/view-preferences`,t=`/account/${a}/api/record/${f}/task-lists`;i.useEffect(()=>{(async()=>{var s;try{const m=await(await fetch(`${K}/${O}`,{credentials:"include"})).json();if(m.success&&((s=m.preferences)!=null&&s.agendaPrefs)){const N=m.preferences.agendaPrefs;N.viewMode&&p(N.viewMode),N.calendarView&&j(N.calendarView)}}catch{}y(!0)})()},[K,O]);const D=i.useCallback(async s=>{try{const d={viewMode:C,calendarView:T,...s};await fetch(K,{method:"POST",headers:{"Content-Type":"application/json"},credentials:"include",body:JSON.stringify({viewId:O,preferences:{agendaPrefs:d}})})}catch(d){console.warn("[RecordAgenda] Prefs save error:",d)}},[K,O,C,T]),W=i.useCallback(s=>{p(s),D({viewMode:s})},[D]),F=i.useCallback((s,d)=>{if(!s||!x)return null;const m=(x.customFields||[]).find(b=>b.name===d);if(!m)return null;const N=(s.customFields||[]).find(b=>{var U,$;const c=((U=b.field_id)==null?void 0:U._id)||b.field_id;return(c==null?void 0:c.toString())===(($=m._id)==null?void 0:$.toString())});return N?N.value:null},[x]),Z=i.useCallback(s=>{if(!s||!(x!=null&&x.statusClassification))return{label:"Planifié",color:"#3b82f6"};const d=x.statusClassification,m=(s.classificationValues||[]).find(b=>{var c,U;return((c=b.classificationId)==null?void 0:c.toString())===((U=d._id)==null?void 0:U.toString())});if(!m)return{label:"Planifié",color:"#3b82f6"};const N=(d.options||[]).find(b=>{var c,U;return((c=b._id)==null?void 0:c.toString())===((U=m.optionId)==null?void 0:U.toString())});return N?{label:N.label,color:N.color||"#3b82f6"}:{label:"Planifié",color:"#3b82f6"}},[x]),ae=i.useMemo(()=>l.map(s=>{var Q;const d=Z(s),m=F(s,"duree_evenement"),N=F(s,"lieu_evenement"),b=F(s,"type_evenement"),c=F(s,"notes_evenement"),U=Re(F(s,"tags_evenement"));let $=s.date?new Date(s.date):new Date,G=s.end_date?new Date(s.end_date):null;return!G&&m?G=new Date($.getTime()+(parseInt(m)||30)*6e4):G||(G=new Date($.getTime()+30*6e4)),{id:(Q=s._id)==null?void 0:Q.toString(),title:s.title||"Sans titre",start:$.toISOString(),end:G.toISOString(),backgroundColor:d.color,borderColor:d.color,textColor:"#fff",extendedProps:{_raw:s,status:d.label,statusColor:d.color,duration:m,lieu:N,type:b,notes:c,tags:U}}}),[l,Z,F]),Y=i.useCallback(async()=>{try{const s=await fetch(R,{credentials:"include"}),d=await s.json().catch(()=>({}));s.ok&&d.success?(u(d.events||[]),S(d.entityData||null),k("")):(u([]),S(d.entityData||null),k(d.error||d.message||"Impossible de charger les evenements."))}catch(s){console.error("[RecordAgenda] Fetch error:",s),k("Impossible de charger les evenements.")}h(!1)},[R]);i.useEffect(()=>{Y()},[Y]);const se=i.useCallback(async()=>{try{const d=await(await fetch(t,{credentials:"include"})).json().catch(()=>({}));Array.isArray(d)?E(d):Array.isArray(d.lists)?E(d.lists):E([])}catch(s){console.warn("[RecordAgenda] Task lists fetch error:",s),E([])}},[t]);i.useEffect(()=>{se()},[se]);const X=i.useRef(T);X.current=T;const re=i.useRef(ae);re.current=ae,i.useEffect(()=>{var N;if(C!=="calendar"||A||!w||!P.current)return;if(typeof FullCalendar>"u"){console.error("[RecordAgenda] FullCalendar not loaded");return}const s=(N=I.current)==null?void 0:N.getDate();I.current&&I.current.destroy();let d=!1;const m=new FullCalendar.Calendar(P.current,{initialView:X.current,initialDate:s||void 0,locale:"fr",headerToolbar:{left:"prev,next today",center:"title",right:"dayGridMonth,timeGridWeek,timeGridDay"},buttonText:{today:"Aujourd'hui",month:"Mois",week:"Semaine",day:"Jour"},editable:!0,dayMaxEvents:3,selectable:!0,droppable:!1,nowIndicator:!0,slotMinTime:"07:00:00",slotMaxTime:"21:00:00",slotDuration:"00:15:00",snapDuration:"00:05:00",allDaySlot:!1,height:"100%",expandRows:!0,eventTimeFormat:{hour:"2-digit",minute:"2-digit",meridiem:!1,hour12:!1},events:re.current,datesSet:b=>{if(!d)return;const c=b.view.type;c!==X.current&&(X.current=c,j(c),fetch(K,{method:"POST",headers:{"Content-Type":"application/json"},credentials:"include",body:JSON.stringify({viewId:O,preferences:{agendaPrefs:{viewMode:"calendar",calendarView:c}}})}).catch(()=>{}))},eventClick:b=>{const c=b.event.extendedProps._raw;L(c),M(!0)},dateClick:b=>{const c=new Date(b.dateStr);c.setMinutes(Math.round(c.getMinutes()/5)*5,0,0),B(c.toISOString()),L(null),M(!0)},eventDrop:async b=>{var G,Q;const c=b.event.id,U=(G=b.event.start)==null?void 0:G.toISOString(),$=(Q=b.event.end)==null?void 0:Q.toISOString();try{await fetch(`${R}/${c}/drag`,{method:"PATCH",headers:{"Content-Type":"application/json"},credentials:"include",body:JSON.stringify({newStart:U,newEnd:$})}),await Y()}catch(le){console.error("[RecordAgenda] Drag error:",le),b.revert()}},eventResize:async b=>{var G,Q;const c=b.event.id,U=(G=b.event.start)==null?void 0:G.toISOString(),$=(Q=b.event.end)==null?void 0:Q.toISOString();try{await fetch(`${R}/${c}/drag`,{method:"PATCH",headers:{"Content-Type":"application/json"},credentials:"include",body:JSON.stringify({newStart:U,newEnd:$})}),await Y()}catch(le){console.error("[RecordAgenda] Resize error:",le),b.revert()}},eventDidMount:b=>{var $;const c=b.event.extendedProps;let U=b.event.title;c.lieu&&(U+=`
📍 ${c.lieu}`),c.status&&(U+=`
● ${c.status}`),($=c.tags)!=null&&$.length&&(U+=`
🏷 ${c.tags.join(", ")}`),b.el.title=U}});return m.render(),I.current=m,requestAnimationFrame(()=>{d=!0}),()=>{I.current&&(I.current.destroy(),I.current=null)}},[C,A,w,R,Y,K,O]),i.useEffect(()=>{if(!I.current)return;const s=I.current;s.removeAllEvents(),s.addEventSource(ae)},[ae]);const te=i.useCallback(async s=>{try{k("");const{createTask:d,taskListId:m,...N}=s,b=await fetch(R,{method:"POST",headers:{"Content-Type":"application/json"},credentials:"include",body:JSON.stringify(N)}),c=await b.json().catch(()=>({}));if(!b.ok||!c.success)throw new Error(c.error||c.message||"Impossible de creer l'evenement.");if(d&&m)try{await fetch(`/account/${a}/api/task-lists/${m}/tasks`,{method:"POST",headers:{"Content-Type":"application/json"},credentials:"include",body:JSON.stringify({title:N.title||"Nouvelle tâche",status:"À faire",startDate:N.date||null,dueDate:N.endDate||N.date||null})})}catch(U){console.warn("[RecordAgenda] Task creation error (non-blocking):",U)}await Y(),M(!1),L(null),B(null)}catch(d){throw console.error("[RecordAgenda] Create error:",d),k(d.message||"Impossible de creer l'evenement."),d}},[R,Y,a]),oe=i.useCallback(async(s,d)=>{try{k("");const m=await fetch(`${R}/${s}`,{method:"PATCH",headers:{"Content-Type":"application/json"},credentials:"include",body:JSON.stringify(d)}),N=await m.json().catch(()=>({}));if(!m.ok||!N.success)throw new Error(N.error||N.message||"Impossible de mettre a jour l'evenement.");await Y(),M(!1),L(null)}catch(m){throw console.error("[RecordAgenda] Update error:",m),k(m.message||"Impossible de mettre a jour l'evenement."),m}},[R,Y]),n=i.useCallback(async s=>{if(confirm("Supprimer cet événement ?"))try{k("");const d=await fetch(`${R}/${s}`,{method:"DELETE",credentials:"include"}),m=await d.json().catch(()=>({}));if(!d.ok||!m.success)throw new Error(m.error||m.message||"Impossible de supprimer l'evenement.");await Y(),M(!1),L(null)}catch(d){console.error("[RecordAgenda] Delete error:",d),k(d.message||"Impossible de supprimer l'evenement.")}},[R,Y]),g=i.useCallback(()=>{L(null),B(null),M(!0)},[]),V=i.useCallback(s=>{L(s),M(!0)},[]);return i.useEffect(()=>{if(A||!w||l.length===0)return;const s=new URLSearchParams(window.location.search),d=s.get("event")||s.get("eventId")||s.get("openEvent");if(!d||q.current===d)return;const m=l.find(N=>String(N._id||"")===d);m&&(q.current=d,L(m),M(!0))},[l,A,w]),A||!w?e.jsxDEV("div",{className:"ra-loading",children:[e.jsxDEV("div",{className:"ra-spinner"},void 0,!1,{fileName:"C:/Users/pc/Documents/dexapp/dexapp/Backend/src/islands/record-agenda/RecordAgenda.jsx",lineNumber:462,columnNumber:17},this),e.jsxDEV("span",{children:"Chargement de l'agenda..."},void 0,!1,{fileName:"C:/Users/pc/Documents/dexapp/dexapp/Backend/src/islands/record-agenda/RecordAgenda.jsx",lineNumber:463,columnNumber:17},this)]},void 0,!0,{fileName:"C:/Users/pc/Documents/dexapp/dexapp/Backend/src/islands/record-agenda/RecordAgenda.jsx",lineNumber:461,columnNumber:13},this):e.jsxDEV("div",{className:"ra-container",children:[e.jsxDEV("style",{children:_e()},void 0,!1,{fileName:"C:/Users/pc/Documents/dexapp/dexapp/Backend/src/islands/record-agenda/RecordAgenda.jsx",lineNumber:470,columnNumber:13},this),e.jsxDEV(De,{viewMode:C,onViewChange:W,onNewEvent:g,eventCount:l.length},void 0,!1,{fileName:"C:/Users/pc/Documents/dexapp/dexapp/Backend/src/islands/record-agenda/RecordAgenda.jsx",lineNumber:472,columnNumber:13},this),o&&e.jsxDEV("div",{className:"ra-error-banner",children:[e.jsxDEV("span",{children:o},void 0,!1,{fileName:"C:/Users/pc/Documents/dexapp/dexapp/Backend/src/islands/record-agenda/RecordAgenda.jsx",lineNumber:481,columnNumber:21},this),e.jsxDEV("button",{type:"button",onClick:()=>k(""),"aria-label":"Fermer",children:e.jsxDEV("svg",{width:"14",height:"14",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",children:[e.jsxDEV("line",{x1:"18",y1:"6",x2:"6",y2:"18"},void 0,!1,{fileName:"C:/Users/pc/Documents/dexapp/dexapp/Backend/src/islands/record-agenda/RecordAgenda.jsx",lineNumber:484,columnNumber:29},this),e.jsxDEV("line",{x1:"6",y1:"6",x2:"18",y2:"18"},void 0,!1,{fileName:"C:/Users/pc/Documents/dexapp/dexapp/Backend/src/islands/record-agenda/RecordAgenda.jsx",lineNumber:484,columnNumber:67},this)]},void 0,!0,{fileName:"C:/Users/pc/Documents/dexapp/dexapp/Backend/src/islands/record-agenda/RecordAgenda.jsx",lineNumber:483,columnNumber:25},this)},void 0,!1,{fileName:"C:/Users/pc/Documents/dexapp/dexapp/Backend/src/islands/record-agenda/RecordAgenda.jsx",lineNumber:482,columnNumber:21},this)]},void 0,!0,{fileName:"C:/Users/pc/Documents/dexapp/dexapp/Backend/src/islands/record-agenda/RecordAgenda.jsx",lineNumber:480,columnNumber:17},this),C==="calendar"&&e.jsxDEV("div",{className:"ra-calendar-wrap",children:e.jsxDEV("div",{ref:P,className:"ra-calendar"},void 0,!1,{fileName:"C:/Users/pc/Documents/dexapp/dexapp/Backend/src/islands/record-agenda/RecordAgenda.jsx",lineNumber:492,columnNumber:21},this)},void 0,!1,{fileName:"C:/Users/pc/Documents/dexapp/dexapp/Backend/src/islands/record-agenda/RecordAgenda.jsx",lineNumber:491,columnNumber:17},this),C==="timeline"&&e.jsxDEV(Se,{events:l,entityData:x,onEventClick:V,getStatusInfo:Z,getCustomFieldValue:F},void 0,!1,{fileName:"C:/Users/pc/Documents/dexapp/dexapp/Backend/src/islands/record-agenda/RecordAgenda.jsx",lineNumber:497,columnNumber:17},this),C==="list"&&e.jsxDEV(Le,{events:l,entityData:x,onEventClick:V,onDeleteEvent:n,getStatusInfo:Z,getCustomFieldValue:F},void 0,!1,{fileName:"C:/Users/pc/Documents/dexapp/dexapp/Backend/src/islands/record-agenda/RecordAgenda.jsx",lineNumber:507,columnNumber:17},this),l.length===0&&!A&&e.jsxDEV("div",{className:"ra-empty",children:[e.jsxDEV("div",{className:"ra-empty-icon",children:e.jsxDEV("svg",{width:"48",height:"48",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"1.5",children:[e.jsxDEV("rect",{x:"3",y:"4",width:"18",height:"18",rx:"2",ry:"2"},void 0,!1,{fileName:"C:/Users/pc/Documents/dexapp/dexapp/Backend/src/islands/record-agenda/RecordAgenda.jsx",lineNumber:521,columnNumber:29},this),e.jsxDEV("line",{x1:"16",y1:"2",x2:"16",y2:"6"},void 0,!1,{fileName:"C:/Users/pc/Documents/dexapp/dexapp/Backend/src/islands/record-agenda/RecordAgenda.jsx",lineNumber:522,columnNumber:29},this),e.jsxDEV("line",{x1:"8",y1:"2",x2:"8",y2:"6"},void 0,!1,{fileName:"C:/Users/pc/Documents/dexapp/dexapp/Backend/src/islands/record-agenda/RecordAgenda.jsx",lineNumber:523,columnNumber:29},this),e.jsxDEV("line",{x1:"3",y1:"10",x2:"21",y2:"10"},void 0,!1,{fileName:"C:/Users/pc/Documents/dexapp/dexapp/Backend/src/islands/record-agenda/RecordAgenda.jsx",lineNumber:524,columnNumber:29},this),e.jsxDEV("line",{x1:"10",y1:"14",x2:"14",y2:"18"},void 0,!1,{fileName:"C:/Users/pc/Documents/dexapp/dexapp/Backend/src/islands/record-agenda/RecordAgenda.jsx",lineNumber:525,columnNumber:29},this),e.jsxDEV("line",{x1:"14",y1:"14",x2:"10",y2:"18"},void 0,!1,{fileName:"C:/Users/pc/Documents/dexapp/dexapp/Backend/src/islands/record-agenda/RecordAgenda.jsx",lineNumber:526,columnNumber:29},this)]},void 0,!0,{fileName:"C:/Users/pc/Documents/dexapp/dexapp/Backend/src/islands/record-agenda/RecordAgenda.jsx",lineNumber:520,columnNumber:25},this)},void 0,!1,{fileName:"C:/Users/pc/Documents/dexapp/dexapp/Backend/src/islands/record-agenda/RecordAgenda.jsx",lineNumber:519,columnNumber:21},this),e.jsxDEV("h3",{children:"Aucun événement"},void 0,!1,{fileName:"C:/Users/pc/Documents/dexapp/dexapp/Backend/src/islands/record-agenda/RecordAgenda.jsx",lineNumber:529,columnNumber:21},this),e.jsxDEV("p",{children:"Ajoutez votre premier événement pour commencer à organiser votre agenda."},void 0,!1,{fileName:"C:/Users/pc/Documents/dexapp/dexapp/Backend/src/islands/record-agenda/RecordAgenda.jsx",lineNumber:530,columnNumber:21},this),e.jsxDEV("button",{className:"ra-empty-btn",onClick:g,children:[e.jsxDEV("svg",{width:"16",height:"16",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",children:[e.jsxDEV("line",{x1:"12",y1:"5",x2:"12",y2:"19"},void 0,!1,{fileName:"C:/Users/pc/Documents/dexapp/dexapp/Backend/src/islands/record-agenda/RecordAgenda.jsx",lineNumber:533,columnNumber:29},this),e.jsxDEV("line",{x1:"5",y1:"12",x2:"19",y2:"12"},void 0,!1,{fileName:"C:/Users/pc/Documents/dexapp/dexapp/Backend/src/islands/record-agenda/RecordAgenda.jsx",lineNumber:534,columnNumber:29},this)]},void 0,!0,{fileName:"C:/Users/pc/Documents/dexapp/dexapp/Backend/src/islands/record-agenda/RecordAgenda.jsx",lineNumber:532,columnNumber:25},this),"Nouvel événement"]},void 0,!0,{fileName:"C:/Users/pc/Documents/dexapp/dexapp/Backend/src/islands/record-agenda/RecordAgenda.jsx",lineNumber:531,columnNumber:21},this)]},void 0,!0,{fileName:"C:/Users/pc/Documents/dexapp/dexapp/Backend/src/islands/record-agenda/RecordAgenda.jsx",lineNumber:518,columnNumber:17},this),e.jsxDEV(Ve,{isOpen:v,onClose:()=>{M(!1),L(null),B(null)},event:J,entityData:x,prefillDate:z,onCreate:te,onUpdate:oe,onDelete:n,getCustomFieldValue:F,getStatusInfo:Z,accountNumber:a,taskLists:_,recordId:f},void 0,!1,{fileName:"C:/Users/pc/Documents/dexapp/dexapp/Backend/src/islands/record-agenda/RecordAgenda.jsx",lineNumber:541,columnNumber:13},this)]},void 0,!0,{fileName:"C:/Users/pc/Documents/dexapp/dexapp/Backend/src/islands/record-agenda/RecordAgenda.jsx",lineNumber:469,columnNumber:9},this)}function Re(a){return(Array.isArray(a)?a:typeof a=="string"?a.split(","):[]).map(r=>r&&typeof r=="object"?String(r.label||r.value||r.name||"").trim():String(r||"").trim()).filter(Boolean)}function _e(){return`
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
`}function ge(){document.querySelectorAll('[data-island="record-agenda"]').forEach(a=>{if(a.dataset.mounted==="1")return;a.dataset.mounted="1";const f={accountNumber:a.dataset.accountNumber,recordId:a.dataset.recordId,entitySlug:a.dataset.entitySlug};console.log("[RecordAgenda Island] Mounting:",f),ve(a).render(e.jsxDEV(ke.StrictMode,{children:e.jsxDEV(Oe,{...f},void 0,!1,{fileName:"C:/Users/pc/Documents/dexapp/dexapp/Backend/src/islands/record-agenda/entry.jsx",lineNumber:25,columnNumber:17},this)},void 0,!1,{fileName:"C:/Users/pc/Documents/dexapp/dexapp/Backend/src/islands/record-agenda/entry.jsx",lineNumber:24,columnNumber:13},this))})}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",ge):ge();
