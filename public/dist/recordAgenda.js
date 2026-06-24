import{j as e,r as i,c as Ne,R as De}from"./chunks/client-CMp6iiqo.js";function we({viewMode:a,onViewChange:f,onNewEvent:r,eventCount:d}){const u=[{key:"calendar",icon:"M3 4h18M3 10h18M3 16h18",label:"Calendrier"},{key:"timeline",icon:"M12 2v20M2 12h20",label:"Timeline"},{key:"list",icon:"M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01",label:"Liste"}];return e.jsxDEV("div",{className:"ra-toolbar",children:[e.jsxDEV("style",{children:je()},void 0,!1,{fileName:"C:/Users/pc/Documents/dexapp/Dexapp live/src/islands/record-agenda/components/AgendaToolbar.jsx",lineNumber:16,columnNumber:13},this),e.jsxDEV("div",{className:"ra-toolbar-left",children:e.jsxDEV("div",{className:"ra-view-pills",children:[u.map(x=>e.jsxDEV("button",{className:`ra-vpill ${a===x.key?"active":""}`,onClick:()=>f(x.key),children:[e.jsxDEV("svg",{width:"14",height:"14",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",children:e.jsxDEV("path",{d:x.icon},void 0,!1,{fileName:"C:/Users/pc/Documents/dexapp/Dexapp live/src/islands/record-agenda/components/AgendaToolbar.jsx",lineNumber:27,columnNumber:33},this)},void 0,!1,{fileName:"C:/Users/pc/Documents/dexapp/Dexapp live/src/islands/record-agenda/components/AgendaToolbar.jsx",lineNumber:26,columnNumber:29},this),x.label]},x.key,!0,{fileName:"C:/Users/pc/Documents/dexapp/Dexapp live/src/islands/record-agenda/components/AgendaToolbar.jsx",lineNumber:21,columnNumber:25},this)),e.jsxDEV("span",{className:"ra-vpill-count",children:d},void 0,!1,{fileName:"C:/Users/pc/Documents/dexapp/Dexapp live/src/islands/record-agenda/components/AgendaToolbar.jsx",lineNumber:32,columnNumber:21},this)]},void 0,!0,{fileName:"C:/Users/pc/Documents/dexapp/Dexapp live/src/islands/record-agenda/components/AgendaToolbar.jsx",lineNumber:19,columnNumber:17},this)},void 0,!1,{fileName:"C:/Users/pc/Documents/dexapp/Dexapp live/src/islands/record-agenda/components/AgendaToolbar.jsx",lineNumber:18,columnNumber:13},this),e.jsxDEV("div",{className:"ra-toolbar-right",children:e.jsxDEV("button",{className:"ra-new-event-btn",onClick:r,children:[e.jsxDEV("svg",{width:"16",height:"16",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2.5",children:[e.jsxDEV("line",{x1:"12",y1:"5",x2:"12",y2:"19"},void 0,!1,{fileName:"C:/Users/pc/Documents/dexapp/Dexapp live/src/islands/record-agenda/components/AgendaToolbar.jsx",lineNumber:38,columnNumber:121},this),e.jsxDEV("line",{x1:"5",y1:"12",x2:"19",y2:"12"},void 0,!1,{fileName:"C:/Users/pc/Documents/dexapp/Dexapp live/src/islands/record-agenda/components/AgendaToolbar.jsx",lineNumber:38,columnNumber:160},this)]},void 0,!0,{fileName:"C:/Users/pc/Documents/dexapp/Dexapp live/src/islands/record-agenda/components/AgendaToolbar.jsx",lineNumber:38,columnNumber:21},this),"Nouvel événement"]},void 0,!0,{fileName:"C:/Users/pc/Documents/dexapp/Dexapp live/src/islands/record-agenda/components/AgendaToolbar.jsx",lineNumber:37,columnNumber:17},this)},void 0,!1,{fileName:"C:/Users/pc/Documents/dexapp/Dexapp live/src/islands/record-agenda/components/AgendaToolbar.jsx",lineNumber:36,columnNumber:13},this)]},void 0,!0,{fileName:"C:/Users/pc/Documents/dexapp/Dexapp live/src/islands/record-agenda/components/AgendaToolbar.jsx",lineNumber:15,columnNumber:9},this)}function je(){return`
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
`}const Ee=[{value:"consultation",label:"Consultation",color:"#4361ee"},{value:"reunion",label:"Réunion",color:"#8b5cf6"},{value:"rappel",label:"Rappel",color:"#f59e0b"},{value:"tache",label:"Tâche",color:"#10b981"},{value:"personnel",label:"Personnel",color:"#ec4899"},{value:"autre",label:"Autre",color:"#6b7280"}],ye=[{label:"Important",value:"Important",color:"#ef4444"},{label:"Date limite",value:"Date limite",color:"#f59e0b"},{label:"Risque amende",value:"Risque amende",color:"#dc2626"}],H="#64748b",me=["#4361ee","#8b5cf6","#f59e0b","#10b981","#ec4899","#64748b"],Ce="widget_prochains_evenements",ke="widget_date_importante";function Ve({isOpen:a,onClose:f,event:r,entityData:d,prefillDate:u,onCreate:x,onUpdate:T,onDelete:z,getCustomFieldValue:y,getStatusInfo:O,accountNumber:h,taskLists:j=[],recordId:C}){var X,re,te,oe;const[o,D]=i.useState({title:"",date:"",endDate:"",duration:30,type:"consultation",tags:[],lieu:"",notes:"",statusOptionId:"",showInUpcomingWidget:!0,isImportantDate:!1,createTask:!1,selectedTaskListId:""}),[k,p]=i.useState(!1),[M,E]=i.useState(""),[N,L]=i.useState({type:[],status:[],tags:[]}),[J,I]=i.useState({type:[],status:[],tags:[]}),$=!!r;i.useEffect(()=>{var s,g,V,n,l;if(a)if(E(""),r){O(r);const m=(r.classificationValues||[]).find(b=>{var c,S,P;return((c=b.classificationId)==null?void 0:c.toString())===((P=(S=d==null?void 0:d.statusClassification)==null?void 0:S._id)==null?void 0:P.toString())}),v=ie(y(r,"tags_evenement"));D({title:r.title||"",date:r.date?le(new Date(r.date)):"",endDate:r.end_date?le(new Date(r.end_date)):"",duration:y(r,"duree_evenement")||30,type:y(r,"type_evenement")||"consultation",tags:v,lieu:y(r,"lieu_evenement")||"",notes:y(r,"notes_evenement")||"",statusOptionId:((s=m==null?void 0:m.optionId)==null?void 0:s.toString())||"",showInUpcomingWidget:xe(y(r,Ce),!0),isImportantDate:xe(y(r,ke),v.some(b=>b.toLowerCase()==="date importante")),createTask:!1,selectedTaskListId:""})}else{let m="";if(u){const c=new Date(u);isNaN(c.getTime())?m=u+"T09:00":(c.setMinutes(Math.round(c.getMinutes()/5)*5,0,0),m=le(c))}else{const c=new Date;c.setMinutes(Math.ceil(c.getMinutes()/5)*5,0,0),m=le(c)}const v=((l=(n=(V=(g=d==null?void 0:d.statusClassification)==null?void 0:g.options)==null?void 0:V[0])==null?void 0:n._id)==null?void 0:l.toString())||"",b=j.length>0?j[0]._id:"";D({title:"",date:m,endDate:"",duration:30,type:"consultation",tags:[],lieu:"",notes:"",statusOptionId:v,showInUpcomingWidget:!0,isImportantDate:!1,createTask:!1,selectedTaskListId:b})}},[a,r,u,d,y,O]);const U=i.useCallback((s,g)=>{E(""),D(V=>({...V,[s]:g}))},[]),B=i.useCallback(async()=>{if(o.title.trim()){p(!0),E("");try{const s=he(o.date,"Date");let g=o.endDate?he(o.endDate,"Date de fin").toISOString():void 0;!g&&s&&o.duration&&(g=new Date(s.getTime()+(parseInt(o.duration)||30)*6e4).toISOString());const V={title:o.title.trim(),date:s?s.toISOString():void 0,endDate:g,duration:parseInt(o.duration)||30,type:o.type,tags:ie(o.tags),lieu:o.lieu,notes:o.notes,statusOptionId:o.statusOptionId||void 0,showInUpcomingWidget:!!o.showInUpcomingWidget,isImportantDate:!!o.isImportantDate};!$&&o.createTask&&o.selectedTaskListId&&(V.createTask=!0,V.taskListId=o.selectedTaskListId),$?await T(r._id.toString(),V):await x(V)}catch(s){console.error("[EventModal] Save error:",s),E(s.message||"Impossible d'enregistrer cet evenement.")}finally{p(!1)}}},[o,$,r,x,T]),A=ue(d,"type_evenement"),q=ue(d,"tags_evenement"),R=(d==null?void 0:d.statusClassification)||null,_=((re=(X=R==null?void 0:R._id)==null?void 0:X.toString)==null?void 0:re.call(X))||(R==null?void 0:R._id)||"",K=se([Ee,((te=A==null?void 0:A.type_config)==null?void 0:te.options)||[],N.type,o.type?[{label:o.type,value:o.type,color:H}]:[]],J.type),t=se([((R==null?void 0:R.options)||[]).map(fe),N.status,o.statusOptionId?[{label:"Statut",value:o.statusOptionId,color:H}]:[]],J.status),w=se([ye,((oe=q==null?void 0:q.type_config)==null?void 0:oe.options)||[],N.tags,ie(o.tags).map(s=>({label:s,value:s}))],J.tags),W=(s,g)=>{L(V=>({...V,[s]:se([V[s]||[],[g]])}))},F=(s,g)=>{I(V=>({...V,[s]:Ue(V[s]||[],g)}))},Z=async(s,g,V)=>{var c,S;const n={label:V,value:V,color:be(V)},l=((S=(c=g==null?void 0:g._id)==null?void 0:c.toString)==null?void 0:S.call(c))||(g==null?void 0:g._id);if(!h||!l)return W(s,n),n;const m=await fetch(`/account/${h}/field-template/api/${l}/add-option`,{method:"POST",headers:{"Content-Type":"application/json"},credentials:"include",body:JSON.stringify(n)}),v=await m.json().catch(()=>({}));if(!m.ok||!v.success)throw new Error(v.error||"Création impossible");const b=ee(v.option||n);return W(s,b),b},ae=async(s,g,V)=>{var m,v;const n=ee(V);if(!n.value||!confirm(`Supprimer l'option "${n.label}" ?`))return!1;const l=((v=(m=g==null?void 0:g._id)==null?void 0:m.toString)==null?void 0:v.call(m))||(g==null?void 0:g._id);if(h&&l){const b=await fetch(`/account/${h}/field-template/api/${l}/delete-option`,{method:"POST",headers:{"Content-Type":"application/json"},credentials:"include",body:JSON.stringify({value:n.value,label:n.label})}),c=await b.json().catch(()=>({}));if(!b.ok||!c.success)throw new Error(c.error||"Suppression impossible")}return F(s,n),s==="type"&&ce(n,o.type)&&U("type",""),s==="tags"&&U("tags",ie(o.tags).filter(b=>!ce(n,b))),!0},Y=async s=>{const g={label:s,value:s,color:be(s)};if(!h||!_)return W("status",g),g;const V=await fetch(`/account/${h}/classification/api/fast-add`,{method:"POST",headers:{"Content-Type":"application/json"},credentials:"include",body:JSON.stringify({classificationId:_,label:s,color:g.color})}),n=await V.json().catch(()=>({}));if(!V.ok||!n.success)throw new Error(n.error||"Création impossible");const l=fe(n.option||g);return W("status",l),l},ne=async s=>{const g=ee(s);if(!g.value||!confirm(`Supprimer le statut "${g.label}" ?`))return!1;if(h&&_){const V=await fetch(`/account/${h}/classification/api/delete-option`,{method:"POST",headers:{"Content-Type":"application/json"},credentials:"include",body:JSON.stringify({classificationId:_,optionId:g.value})}),n=await V.json().catch(()=>({}));if(!V.ok||!n.success)throw new Error(n.error||"Suppression impossible")}return F("status",g),String(o.statusOptionId||"")===String(g.value||"")&&U("statusOptionId",""),!0};return a?e.jsxDEV("div",{className:"ra-modal-overlay",onClick:f,children:[e.jsxDEV("div",{className:"ra-modal",onClick:s=>s.stopPropagation(),children:[e.jsxDEV("div",{className:"ra-modal-header",children:[e.jsxDEV("div",{className:"ra-modal-header-left",children:[e.jsxDEV("div",{className:"ra-modal-icon",children:e.jsxDEV("svg",{width:"18",height:"18",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",children:[e.jsxDEV("rect",{x:"3",y:"4",width:"18",height:"18",rx:"2",ry:"2"},void 0,!1,{fileName:"C:/Users/pc/Documents/dexapp/Dexapp live/src/islands/record-agenda/components/EventModal.jsx",lineNumber:317,columnNumber:33},this),e.jsxDEV("line",{x1:"16",y1:"2",x2:"16",y2:"6"},void 0,!1,{fileName:"C:/Users/pc/Documents/dexapp/Dexapp live/src/islands/record-agenda/components/EventModal.jsx",lineNumber:318,columnNumber:33},this),e.jsxDEV("line",{x1:"8",y1:"2",x2:"8",y2:"6"},void 0,!1,{fileName:"C:/Users/pc/Documents/dexapp/Dexapp live/src/islands/record-agenda/components/EventModal.jsx",lineNumber:319,columnNumber:33},this),e.jsxDEV("line",{x1:"3",y1:"10",x2:"21",y2:"10"},void 0,!1,{fileName:"C:/Users/pc/Documents/dexapp/Dexapp live/src/islands/record-agenda/components/EventModal.jsx",lineNumber:320,columnNumber:33},this)]},void 0,!0,{fileName:"C:/Users/pc/Documents/dexapp/Dexapp live/src/islands/record-agenda/components/EventModal.jsx",lineNumber:316,columnNumber:29},this)},void 0,!1,{fileName:"C:/Users/pc/Documents/dexapp/Dexapp live/src/islands/record-agenda/components/EventModal.jsx",lineNumber:315,columnNumber:25},this),e.jsxDEV("h3",{children:$?"Modifier l'événement":"Nouvel événement"},void 0,!1,{fileName:"C:/Users/pc/Documents/dexapp/Dexapp live/src/islands/record-agenda/components/EventModal.jsx",lineNumber:323,columnNumber:25},this)]},void 0,!0,{fileName:"C:/Users/pc/Documents/dexapp/Dexapp live/src/islands/record-agenda/components/EventModal.jsx",lineNumber:314,columnNumber:21},this),e.jsxDEV("button",{className:"ra-modal-close",onClick:f,children:e.jsxDEV("svg",{width:"16",height:"16",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",children:[e.jsxDEV("line",{x1:"18",y1:"6",x2:"6",y2:"18"},void 0,!1,{fileName:"C:/Users/pc/Documents/dexapp/Dexapp live/src/islands/record-agenda/components/EventModal.jsx",lineNumber:327,columnNumber:29},this),e.jsxDEV("line",{x1:"6",y1:"6",x2:"18",y2:"18"},void 0,!1,{fileName:"C:/Users/pc/Documents/dexapp/Dexapp live/src/islands/record-agenda/components/EventModal.jsx",lineNumber:327,columnNumber:67},this)]},void 0,!0,{fileName:"C:/Users/pc/Documents/dexapp/Dexapp live/src/islands/record-agenda/components/EventModal.jsx",lineNumber:326,columnNumber:25},this)},void 0,!1,{fileName:"C:/Users/pc/Documents/dexapp/Dexapp live/src/islands/record-agenda/components/EventModal.jsx",lineNumber:325,columnNumber:21},this)]},void 0,!0,{fileName:"C:/Users/pc/Documents/dexapp/Dexapp live/src/islands/record-agenda/components/EventModal.jsx",lineNumber:313,columnNumber:17},this),e.jsxDEV("div",{className:"ra-modal-body",children:[e.jsxDEV("div",{className:"ra-field",children:[e.jsxDEV("label",{className:"ra-label",children:"Titre"},void 0,!1,{fileName:"C:/Users/pc/Documents/dexapp/Dexapp live/src/islands/record-agenda/components/EventModal.jsx",lineNumber:335,columnNumber:25},this),e.jsxDEV("input",{type:"text",className:"ra-input",placeholder:"Ex: Consultation de suivi...",value:o.title,onChange:s=>U("title",s.target.value),autoFocus:!0},void 0,!1,{fileName:"C:/Users/pc/Documents/dexapp/Dexapp live/src/islands/record-agenda/components/EventModal.jsx",lineNumber:336,columnNumber:25},this)]},void 0,!0,{fileName:"C:/Users/pc/Documents/dexapp/Dexapp live/src/islands/record-agenda/components/EventModal.jsx",lineNumber:334,columnNumber:21},this),e.jsxDEV("div",{className:"ra-field-row",children:[e.jsxDEV("div",{className:"ra-field",style:{flex:1},children:[e.jsxDEV("label",{className:"ra-label",children:"Date & heure"},void 0,!1,{fileName:"C:/Users/pc/Documents/dexapp/Dexapp live/src/islands/record-agenda/components/EventModal.jsx",lineNumber:349,columnNumber:29},this),e.jsxDEV("input",{type:"datetime-local",className:"ra-input",step:"300",value:o.date,onChange:s=>U("date",s.target.value)},void 0,!1,{fileName:"C:/Users/pc/Documents/dexapp/Dexapp live/src/islands/record-agenda/components/EventModal.jsx",lineNumber:350,columnNumber:29},this)]},void 0,!0,{fileName:"C:/Users/pc/Documents/dexapp/Dexapp live/src/islands/record-agenda/components/EventModal.jsx",lineNumber:348,columnNumber:25},this),e.jsxDEV("div",{className:"ra-field",style:{width:100},children:[e.jsxDEV("label",{className:"ra-label",children:"Durée (min)"},void 0,!1,{fileName:"C:/Users/pc/Documents/dexapp/Dexapp live/src/islands/record-agenda/components/EventModal.jsx",lineNumber:359,columnNumber:29},this),e.jsxDEV("input",{type:"number",className:"ra-input",value:o.duration,onChange:s=>U("duration",s.target.value),min:"5",max:"480",step:"5"},void 0,!1,{fileName:"C:/Users/pc/Documents/dexapp/Dexapp live/src/islands/record-agenda/components/EventModal.jsx",lineNumber:360,columnNumber:29},this)]},void 0,!0,{fileName:"C:/Users/pc/Documents/dexapp/Dexapp live/src/islands/record-agenda/components/EventModal.jsx",lineNumber:358,columnNumber:25},this)]},void 0,!0,{fileName:"C:/Users/pc/Documents/dexapp/Dexapp live/src/islands/record-agenda/components/EventModal.jsx",lineNumber:347,columnNumber:21},this),e.jsxDEV("div",{className:"ra-field",children:[e.jsxDEV("label",{className:"ra-label",children:"Type"},void 0,!1,{fileName:"C:/Users/pc/Documents/dexapp/Dexapp live/src/islands/record-agenda/components/EventModal.jsx",lineNumber:372,columnNumber:25},this),e.jsxDEV(pe,{value:o.type,options:K,onChange:s=>U("type",s),onCreateOption:s=>Z("type",A,s),onDeleteOption:s=>ae("type",A,s),placeholder:"Rechercher ou créer un type..."},void 0,!1,{fileName:"C:/Users/pc/Documents/dexapp/Dexapp live/src/islands/record-agenda/components/EventModal.jsx",lineNumber:373,columnNumber:25},this)]},void 0,!0,{fileName:"C:/Users/pc/Documents/dexapp/Dexapp live/src/islands/record-agenda/components/EventModal.jsx",lineNumber:371,columnNumber:21},this),_&&e.jsxDEV("div",{className:"ra-field",children:[e.jsxDEV("label",{className:"ra-label",children:"Statut"},void 0,!1,{fileName:"C:/Users/pc/Documents/dexapp/Dexapp live/src/islands/record-agenda/components/EventModal.jsx",lineNumber:386,columnNumber:29},this),e.jsxDEV(pe,{value:o.statusOptionId,options:t,onChange:s=>U("statusOptionId",s),onCreateOption:Y,onDeleteOption:ne,placeholder:"Rechercher ou créer un statut..."},void 0,!1,{fileName:"C:/Users/pc/Documents/dexapp/Dexapp live/src/islands/record-agenda/components/EventModal.jsx",lineNumber:387,columnNumber:29},this)]},void 0,!0,{fileName:"C:/Users/pc/Documents/dexapp/Dexapp live/src/islands/record-agenda/components/EventModal.jsx",lineNumber:385,columnNumber:25},this),e.jsxDEV("div",{className:"ra-field",children:[e.jsxDEV("label",{className:"ra-label",children:"Étiquettes"},void 0,!1,{fileName:"C:/Users/pc/Documents/dexapp/Dexapp live/src/islands/record-agenda/components/EventModal.jsx",lineNumber:400,columnNumber:25},this),e.jsxDEV(pe,{multiple:!0,value:o.tags,options:w,onChange:s=>U("tags",s),onCreateOption:s=>Z("tags",q,s),onDeleteOption:s=>ae("tags",q,s),placeholder:"Ajouter..."},void 0,!1,{fileName:"C:/Users/pc/Documents/dexapp/Dexapp live/src/islands/record-agenda/components/EventModal.jsx",lineNumber:401,columnNumber:25},this)]},void 0,!0,{fileName:"C:/Users/pc/Documents/dexapp/Dexapp live/src/islands/record-agenda/components/EventModal.jsx",lineNumber:399,columnNumber:21},this),e.jsxDEV("div",{className:"ra-field",children:[e.jsxDEV("label",{className:"ra-label",children:"Widget"},void 0,!1,{fileName:"C:/Users/pc/Documents/dexapp/Dexapp live/src/islands/record-agenda/components/EventModal.jsx",lineNumber:414,columnNumber:25},this),e.jsxDEV("div",{className:"ra-widget-switches",children:[e.jsxDEV("label",{className:`ra-widget-switch ${o.showInUpcomingWidget?"active":""}`,children:[e.jsxDEV("span",{className:"ra-widget-switch-copy",children:[e.jsxDEV("strong",{children:"Prochains événements"},void 0,!1,{fileName:"C:/Users/pc/Documents/dexapp/Dexapp live/src/islands/record-agenda/components/EventModal.jsx",lineNumber:418,columnNumber:37},this),e.jsxDEV("small",{children:"Afficher dans le widget agenda"},void 0,!1,{fileName:"C:/Users/pc/Documents/dexapp/Dexapp live/src/islands/record-agenda/components/EventModal.jsx",lineNumber:419,columnNumber:37},this)]},void 0,!0,{fileName:"C:/Users/pc/Documents/dexapp/Dexapp live/src/islands/record-agenda/components/EventModal.jsx",lineNumber:417,columnNumber:33},this),e.jsxDEV("span",{className:"ra-switch",children:[e.jsxDEV("input",{type:"checkbox",checked:!!o.showInUpcomingWidget,onChange:s=>U("showInUpcomingWidget",s.target.checked)},void 0,!1,{fileName:"C:/Users/pc/Documents/dexapp/Dexapp live/src/islands/record-agenda/components/EventModal.jsx",lineNumber:422,columnNumber:37},this),e.jsxDEV("span",{},void 0,!1,{fileName:"C:/Users/pc/Documents/dexapp/Dexapp live/src/islands/record-agenda/components/EventModal.jsx",lineNumber:427,columnNumber:37},this)]},void 0,!0,{fileName:"C:/Users/pc/Documents/dexapp/Dexapp live/src/islands/record-agenda/components/EventModal.jsx",lineNumber:421,columnNumber:33},this)]},void 0,!0,{fileName:"C:/Users/pc/Documents/dexapp/Dexapp live/src/islands/record-agenda/components/EventModal.jsx",lineNumber:416,columnNumber:29},this),e.jsxDEV("label",{className:`ra-widget-switch ${o.isImportantDate?"active":""}`,children:[e.jsxDEV("span",{className:"ra-widget-switch-copy",children:[e.jsxDEV("strong",{children:"Date importante"},void 0,!1,{fileName:"C:/Users/pc/Documents/dexapp/Dexapp live/src/islands/record-agenda/components/EventModal.jsx",lineNumber:432,columnNumber:37},this),e.jsxDEV("small",{children:"Afficher dans le widget dates importantes"},void 0,!1,{fileName:"C:/Users/pc/Documents/dexapp/Dexapp live/src/islands/record-agenda/components/EventModal.jsx",lineNumber:433,columnNumber:37},this)]},void 0,!0,{fileName:"C:/Users/pc/Documents/dexapp/Dexapp live/src/islands/record-agenda/components/EventModal.jsx",lineNumber:431,columnNumber:33},this),e.jsxDEV("span",{className:"ra-switch",children:[e.jsxDEV("input",{type:"checkbox",checked:!!o.isImportantDate,onChange:s=>U("isImportantDate",s.target.checked)},void 0,!1,{fileName:"C:/Users/pc/Documents/dexapp/Dexapp live/src/islands/record-agenda/components/EventModal.jsx",lineNumber:436,columnNumber:37},this),e.jsxDEV("span",{},void 0,!1,{fileName:"C:/Users/pc/Documents/dexapp/Dexapp live/src/islands/record-agenda/components/EventModal.jsx",lineNumber:441,columnNumber:37},this)]},void 0,!0,{fileName:"C:/Users/pc/Documents/dexapp/Dexapp live/src/islands/record-agenda/components/EventModal.jsx",lineNumber:435,columnNumber:33},this)]},void 0,!0,{fileName:"C:/Users/pc/Documents/dexapp/Dexapp live/src/islands/record-agenda/components/EventModal.jsx",lineNumber:430,columnNumber:29},this)]},void 0,!0,{fileName:"C:/Users/pc/Documents/dexapp/Dexapp live/src/islands/record-agenda/components/EventModal.jsx",lineNumber:415,columnNumber:25},this)]},void 0,!0,{fileName:"C:/Users/pc/Documents/dexapp/Dexapp live/src/islands/record-agenda/components/EventModal.jsx",lineNumber:413,columnNumber:21},this),!$&&j.length>0&&e.jsxDEV("div",{className:"ra-field",children:[e.jsxDEV("label",{className:"ra-label",children:"Tâche"},void 0,!1,{fileName:"C:/Users/pc/Documents/dexapp/Dexapp live/src/islands/record-agenda/components/EventModal.jsx",lineNumber:450,columnNumber:29},this),e.jsxDEV("div",{className:"ra-widget-switches",children:e.jsxDEV("label",{className:`ra-widget-switch ${o.createTask?"active":""}`,children:[e.jsxDEV("span",{className:"ra-widget-switch-copy",children:[e.jsxDEV("strong",{children:"Créer tâche"},void 0,!1,{fileName:"C:/Users/pc/Documents/dexapp/Dexapp live/src/islands/record-agenda/components/EventModal.jsx",lineNumber:454,columnNumber:41},this),e.jsxDEV("small",{children:"Ajouter aussi une tâche dans la liste"},void 0,!1,{fileName:"C:/Users/pc/Documents/dexapp/Dexapp live/src/islands/record-agenda/components/EventModal.jsx",lineNumber:455,columnNumber:41},this)]},void 0,!0,{fileName:"C:/Users/pc/Documents/dexapp/Dexapp live/src/islands/record-agenda/components/EventModal.jsx",lineNumber:453,columnNumber:37},this),e.jsxDEV("span",{className:"ra-switch",children:[e.jsxDEV("input",{type:"checkbox",checked:!!o.createTask,onChange:s=>U("createTask",s.target.checked)},void 0,!1,{fileName:"C:/Users/pc/Documents/dexapp/Dexapp live/src/islands/record-agenda/components/EventModal.jsx",lineNumber:458,columnNumber:41},this),e.jsxDEV("span",{},void 0,!1,{fileName:"C:/Users/pc/Documents/dexapp/Dexapp live/src/islands/record-agenda/components/EventModal.jsx",lineNumber:463,columnNumber:41},this)]},void 0,!0,{fileName:"C:/Users/pc/Documents/dexapp/Dexapp live/src/islands/record-agenda/components/EventModal.jsx",lineNumber:457,columnNumber:37},this)]},void 0,!0,{fileName:"C:/Users/pc/Documents/dexapp/Dexapp live/src/islands/record-agenda/components/EventModal.jsx",lineNumber:452,columnNumber:33},this)},void 0,!1,{fileName:"C:/Users/pc/Documents/dexapp/Dexapp live/src/islands/record-agenda/components/EventModal.jsx",lineNumber:451,columnNumber:29},this),o.createTask&&j.length>1&&e.jsxDEV("select",{className:"ra-input",value:o.selectedTaskListId,onChange:s=>U("selectedTaskListId",s.target.value),style:{marginTop:8},children:j.map(s=>e.jsxDEV("option",{value:s._id,children:s.label||"Liste des tâches"},s._id,!1,{fileName:"C:/Users/pc/Documents/dexapp/Dexapp live/src/islands/record-agenda/components/EventModal.jsx",lineNumber:475,columnNumber:41},this))},void 0,!1,{fileName:"C:/Users/pc/Documents/dexapp/Dexapp live/src/islands/record-agenda/components/EventModal.jsx",lineNumber:468,columnNumber:33},this)]},void 0,!0,{fileName:"C:/Users/pc/Documents/dexapp/Dexapp live/src/islands/record-agenda/components/EventModal.jsx",lineNumber:449,columnNumber:25},this),e.jsxDEV("div",{className:"ra-field",children:[e.jsxDEV("label",{className:"ra-label",children:"Lieu"},void 0,!1,{fileName:"C:/Users/pc/Documents/dexapp/Dexapp live/src/islands/record-agenda/components/EventModal.jsx",lineNumber:486,columnNumber:25},this),e.jsxDEV("input",{type:"text",className:"ra-input",placeholder:"Cabinet, Salle A, Domicile...",value:o.lieu,onChange:s=>U("lieu",s.target.value)},void 0,!1,{fileName:"C:/Users/pc/Documents/dexapp/Dexapp live/src/islands/record-agenda/components/EventModal.jsx",lineNumber:487,columnNumber:25},this)]},void 0,!0,{fileName:"C:/Users/pc/Documents/dexapp/Dexapp live/src/islands/record-agenda/components/EventModal.jsx",lineNumber:485,columnNumber:21},this),e.jsxDEV("div",{className:"ra-field",children:[e.jsxDEV("label",{className:"ra-label",children:"Notes"},void 0,!1,{fileName:"C:/Users/pc/Documents/dexapp/Dexapp live/src/islands/record-agenda/components/EventModal.jsx",lineNumber:498,columnNumber:25},this),e.jsxDEV("textarea",{className:"ra-input ra-textarea",placeholder:"Notes additionnelles...",rows:3,value:o.notes,onChange:s=>U("notes",s.target.value)},void 0,!1,{fileName:"C:/Users/pc/Documents/dexapp/Dexapp live/src/islands/record-agenda/components/EventModal.jsx",lineNumber:499,columnNumber:25},this)]},void 0,!0,{fileName:"C:/Users/pc/Documents/dexapp/Dexapp live/src/islands/record-agenda/components/EventModal.jsx",lineNumber:497,columnNumber:21},this),M&&e.jsxDEV("div",{className:"ra-modal-error",role:"alert",children:M},void 0,!1,{fileName:"C:/Users/pc/Documents/dexapp/Dexapp live/src/islands/record-agenda/components/EventModal.jsx",lineNumber:509,columnNumber:25},this)]},void 0,!0,{fileName:"C:/Users/pc/Documents/dexapp/Dexapp live/src/islands/record-agenda/components/EventModal.jsx",lineNumber:332,columnNumber:17},this),e.jsxDEV("div",{className:"ra-modal-footer",children:[$&&e.jsxDEV("button",{className:"ra-delete-btn",onClick:()=>z(r._id.toString()),type:"button",children:[e.jsxDEV("svg",{width:"14",height:"14",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",children:[e.jsxDEV("polyline",{points:"3 6 5 6 21 6"},void 0,!1,{fileName:"C:/Users/pc/Documents/dexapp/Dexapp live/src/islands/record-agenda/components/EventModal.jsx",lineNumber:523,columnNumber:33},this),e.jsxDEV("path",{d:"M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"},void 0,!1,{fileName:"C:/Users/pc/Documents/dexapp/Dexapp live/src/islands/record-agenda/components/EventModal.jsx",lineNumber:524,columnNumber:33},this)]},void 0,!0,{fileName:"C:/Users/pc/Documents/dexapp/Dexapp live/src/islands/record-agenda/components/EventModal.jsx",lineNumber:522,columnNumber:29},this),"Supprimer"]},void 0,!0,{fileName:"C:/Users/pc/Documents/dexapp/Dexapp live/src/islands/record-agenda/components/EventModal.jsx",lineNumber:517,columnNumber:25},this),e.jsxDEV("div",{className:"ra-modal-footer-right",children:[e.jsxDEV("button",{className:"ra-cancel-btn",onClick:f,type:"button",children:"Annuler"},void 0,!1,{fileName:"C:/Users/pc/Documents/dexapp/Dexapp live/src/islands/record-agenda/components/EventModal.jsx",lineNumber:530,columnNumber:25},this),e.jsxDEV("button",{className:"ra-save-btn",onClick:B,disabled:k||!o.title.trim(),type:"button",children:k?"Enregistrement...":$?"Mettre à jour":"Créer"},void 0,!1,{fileName:"C:/Users/pc/Documents/dexapp/Dexapp live/src/islands/record-agenda/components/EventModal.jsx",lineNumber:531,columnNumber:25},this)]},void 0,!0,{fileName:"C:/Users/pc/Documents/dexapp/Dexapp live/src/islands/record-agenda/components/EventModal.jsx",lineNumber:529,columnNumber:21},this)]},void 0,!0,{fileName:"C:/Users/pc/Documents/dexapp/Dexapp live/src/islands/record-agenda/components/EventModal.jsx",lineNumber:515,columnNumber:17},this)]},void 0,!0,{fileName:"C:/Users/pc/Documents/dexapp/Dexapp live/src/islands/record-agenda/components/EventModal.jsx",lineNumber:312,columnNumber:13},this),e.jsxDEV("style",{children:Se()},void 0,!1,{fileName:"C:/Users/pc/Documents/dexapp/Dexapp live/src/islands/record-agenda/components/EventModal.jsx",lineNumber:543,columnNumber:13},this)]},void 0,!0,{fileName:"C:/Users/pc/Documents/dexapp/Dexapp live/src/islands/record-agenda/components/EventModal.jsx",lineNumber:311,columnNumber:9},this):null}function pe({value:a,options:f,onChange:r,onCreateOption:d,onDeleteOption:u,multiple:x=!1,placeholder:T="Ajouter..."}){const[z,y]=i.useState(""),[O,h]=i.useState(!1),[j,C]=i.useState(!1),[o,D]=i.useState(!1),[k,p]=i.useState(null),M=i.useRef(null),E=i.useRef(null),N=i.useMemo(()=>{if(x)return ve(a);const t=a==null?"":String(a).trim();return t?[t]:[]},[x,a]),L=i.useMemo(()=>se([f,N.map(t=>({label:t,value:t}))]),[f,N]),J=i.useMemo(()=>N.map(t=>L.find(w=>ce(w,t))||{label:t,value:t,color:H}),[L,N]),I=z.trim().toLowerCase(),$=i.useMemo(()=>L.filter(t=>!N.some(w=>ce(t,w))).filter(t=>I?String(t.label||"").toLowerCase().includes(I)||String(t.value||"").toLowerCase().includes(I):!0).slice(0,8),[L,N,I]),U=i.useMemo(()=>I?L.some(t=>String(t.label||"").trim().toLowerCase()===I||String(t.value||"").trim().toLowerCase()===I):!1,[L,I]);i.useEffect(()=>{const t=W=>{!M.current||M.current.contains(W.target)||(h(!1),p(null),y(""))},w=W=>{W.key==="Escape"&&(h(!1),p(null),y(""))};return document.addEventListener("mousedown",t),document.addEventListener("keydown",w),()=>{document.removeEventListener("mousedown",t),document.removeEventListener("keydown",w)}},[]);const B=i.useCallback(t=>{const w=ee(t);w.value&&(x?N.some(F=>F.toLowerCase()===String(w.value).toLowerCase())||r([...N,w.value]):(r(w.value),h(!1)),y(""),p(null),x&&h(!0),requestAnimationFrame(()=>{var W;return(W=E.current)==null?void 0:W.focus()}))},[x,r,N]),A=i.useCallback(t=>{r(x?N.filter(w=>w.toLowerCase()!==String(t).toLowerCase()):""),p(null),requestAnimationFrame(()=>{var w;return(w=E.current)==null?void 0:w.focus()})},[x,r,N]),q=i.useCallback(async()=>{const t=z.trim();if(!(!t||U||j)){C(!0);try{const w=await d(t);B(w||{label:t,value:t})}catch(w){console.error("[EventOptionSelect] Create option error:",w),window.showMessage?window.showMessage(w.message||"Création impossible","danger"):alert(w.message||"Création impossible")}finally{C(!1)}}},[j,U,d,z,B]),R=i.useCallback((t,w)=>{u&&(t.preventDefault(),t.stopPropagation(),p({x:t.clientX,y:t.clientY,option:ee(w)}))},[u]),_=i.useCallback(async()=>{if(!(!(k!=null&&k.option)||!u||o)){D(!0);try{if(await u(k.option)===!1){p(null);return}A(k.option.value),p(null),h(!1)}catch(t){console.error("[EventOptionSelect] Delete option error:",t),window.showMessage?window.showMessage(t.message||"Suppression impossible","danger"):alert(t.message||"Suppression impossible")}finally{D(!1)}}},[k,o,u,A]),K=t=>{t.key==="Enter"?(t.preventDefault(),$.length>0?B($[0]):q()):t.key==="Backspace"&&!z&&N.length>0?A(N[N.length-1]):t.key==="Escape"&&(h(!1),p(null),y(""))};return e.jsxDEV("div",{className:"ra-option-picker",ref:M,children:[e.jsxDEV("div",{className:`ra-option-control ${O?"open":""}`,onClick:()=>{var t;h(!0),(t=E.current)==null||t.focus()},children:[J.map(t=>e.jsxDEV("span",{className:"ra-option-pill",onContextMenu:w=>R(w,t),title:u?"Clic droit pour supprimer cette option":void 0,style:{"--option-c":t.color||H,background:`${t.color||H}12`,borderColor:`${t.color||H}35`,color:t.color||H},children:[e.jsxDEV("span",{className:"ra-option-dot",style:{background:t.color||H}},void 0,!1,{fileName:"C:/Users/pc/Documents/dexapp/Dexapp live/src/islands/record-agenda/components/EventModal.jsx",lineNumber:724,columnNumber:25},this),t.label,e.jsxDEV("button",{type:"button",onClick:w=>{w.stopPropagation(),A(t.value)},"aria-label":`Retirer ${t.label}`,children:"×"},void 0,!1,{fileName:"C:/Users/pc/Documents/dexapp/Dexapp live/src/islands/record-agenda/components/EventModal.jsx",lineNumber:726,columnNumber:25},this)]},t.value,!0,{fileName:"C:/Users/pc/Documents/dexapp/Dexapp live/src/islands/record-agenda/components/EventModal.jsx",lineNumber:712,columnNumber:21},this)),e.jsxDEV("input",{ref:E,className:"ra-option-input",value:z,onChange:t=>{y(t.target.value),h(!0)},onFocus:()=>h(!0),onKeyDown:K,placeholder:J.length?"Ajouter...":T},void 0,!1,{fileName:"C:/Users/pc/Documents/dexapp/Dexapp live/src/islands/record-agenda/components/EventModal.jsx",lineNumber:731,columnNumber:17},this)]},void 0,!0,{fileName:"C:/Users/pc/Documents/dexapp/Dexapp live/src/islands/record-agenda/components/EventModal.jsx",lineNumber:710,columnNumber:13},this),O&&($.length>0||z.trim()&&!U)&&e.jsxDEV("div",{className:"ra-option-menu",children:[$.map(t=>e.jsxDEV("button",{type:"button",className:"ra-option-item",onClick:()=>B(t),onContextMenu:w=>R(w,t),title:u?"Clic droit pour supprimer cette option":void 0,children:[e.jsxDEV("span",{className:"ra-option-dot",style:{background:t.color||H}},void 0,!1,{fileName:"C:/Users/pc/Documents/dexapp/Dexapp live/src/islands/record-agenda/components/EventModal.jsx",lineNumber:753,columnNumber:29},this),e.jsxDEV("span",{children:t.label},void 0,!1,{fileName:"C:/Users/pc/Documents/dexapp/Dexapp live/src/islands/record-agenda/components/EventModal.jsx",lineNumber:754,columnNumber:29},this)]},t.value,!0,{fileName:"C:/Users/pc/Documents/dexapp/Dexapp live/src/islands/record-agenda/components/EventModal.jsx",lineNumber:745,columnNumber:25},this)),z.trim()&&!U&&e.jsxDEV("button",{type:"button",className:"ra-option-create",onClick:q,disabled:j,children:[e.jsxDEV("span",{children:"+"},void 0,!1,{fileName:"C:/Users/pc/Documents/dexapp/Dexapp live/src/islands/record-agenda/components/EventModal.jsx",lineNumber:759,columnNumber:29},this),j?"Création...":`Créer "${z.trim()}"`]},void 0,!0,{fileName:"C:/Users/pc/Documents/dexapp/Dexapp live/src/islands/record-agenda/components/EventModal.jsx",lineNumber:758,columnNumber:25},this)]},void 0,!0,{fileName:"C:/Users/pc/Documents/dexapp/Dexapp live/src/islands/record-agenda/components/EventModal.jsx",lineNumber:743,columnNumber:17},this),k&&e.jsxDEV("div",{className:"ra-option-context-menu",style:{left:k.x,top:k.y},children:e.jsxDEV("button",{type:"button",onClick:_,disabled:o,children:o?"Suppression...":`Supprimer "${k.option.label}"`},void 0,!1,{fileName:"C:/Users/pc/Documents/dexapp/Dexapp live/src/islands/record-agenda/components/EventModal.jsx",lineNumber:768,columnNumber:21},this)},void 0,!1,{fileName:"C:/Users/pc/Documents/dexapp/Dexapp live/src/islands/record-agenda/components/EventModal.jsx",lineNumber:767,columnNumber:17},this)]},void 0,!0,{fileName:"C:/Users/pc/Documents/dexapp/Dexapp live/src/islands/record-agenda/components/EventModal.jsx",lineNumber:709,columnNumber:9},this)}function ue(a,f){return((a==null?void 0:a.customFields)||[]).find(r=>(r==null?void 0:r.name)===f)||null}function xe(a,f=!1){if(a==null||a==="")return f;if(typeof a=="boolean")return a;if(typeof a=="number")return a!==0;const r=String(a).trim().toLowerCase();return["true","1","yes","oui","on"].includes(r)?!0:["false","0","no","non","off"].includes(r)?!1:f}function ie(a){return ve(a)}function ve(a){return(Array.isArray(a)?a:typeof a=="string"?a.split(","):[]).map(r=>r&&typeof r=="object"?String(r.value||r.label||r.name||"").trim():String(r||"").trim()).filter(Boolean).filter((r,d,u)=>u.findIndex(x=>x.toLowerCase()===r.toLowerCase())===d)}function ee(a){var r,d;if(typeof a=="object"&&a){const u=a.id||((d=(r=a._id)==null?void 0:r.toString)==null?void 0:d.call(r))||a._id||"",x=String(a.label||a.value||a.name||u||"").trim(),T=String(a.value||u||a.label||"").trim();return{label:x,value:T,color:a.color||H,id:String(u||T)}}const f=String(a||"").trim();return{label:f,value:f,color:H,id:f}}function fe(a){var d,u;const f=ee(a),r=(a==null?void 0:a.id)||((u=(d=a==null?void 0:a._id)==null?void 0:d.toString)==null?void 0:u.call(d))||(a==null?void 0:a._id)||f.value;return{...f,value:String(r||f.value||"").trim(),id:String(r||f.value||"").trim()}}function ce(a,f){const r=String(f||"").trim().toLowerCase();return[a.value,a.label,a.id].filter(d=>d!=null).some(d=>String(d).trim().toLowerCase()===r)}function se(a,f=[]){const r=[],d=new Set,u=new Set((f||[]).map(x=>String(x||"").trim().toLowerCase()).filter(Boolean));return a.flat().forEach(x=>{const T=ee(x);if(!T.value||[T.value,T.label,T.id].map(O=>String(O||"").trim().toLowerCase()).filter(Boolean).some(O=>u.has(O)))return;const y=String(T.value||T.label).toLowerCase();d.has(y)||(d.add(y),r.push(T))}),r}function Ue(a,f){const r=ee(f),d=new Set((a||[]).map(u=>String(u||"").trim().toLowerCase()).filter(Boolean));return[r.value,r.label,r.id].map(u=>String(u||"").trim().toLowerCase()).filter(Boolean).forEach(u=>d.add(u)),[...d]}function be(a){const r=[...String(a||"")].reduce((d,u)=>d+u.charCodeAt(0),0);return me[r%me.length]||H}function le(a){const f=a.getFullYear(),r=String(a.getMonth()+1).padStart(2,"0"),d=String(a.getDate()).padStart(2,"0"),u=String(a.getHours()).padStart(2,"0"),x=String(a.getMinutes()).padStart(2,"0");return`${f}-${r}-${d}T${u}:${x}`}function he(a,f){if(!a)return null;const r=new Date(a);if(Number.isNaN(r.getTime()))throw new Error(`${f} invalide.`);return r}function Se(){return`
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
`}function Te({events:a,entityData:f,onEventClick:r,getStatusInfo:d,getCustomFieldValue:u}){const x=i.useMemo(()=>{const h=[...a].sort((C,o)=>{const D=C.date?new Date(C.date).getTime():0,k=o.date?new Date(o.date).getTime():0;return D-k}),j={};return h.forEach(C=>{const D=(C.date?new Date(C.date):new Date).toISOString().split("T")[0];j[D]||(j[D]=[]),j[D].push(C)}),Object.entries(j).map(([C,o])=>({dateKey:C,date:new Date(C),items:o}))},[a]),T=h=>{const j=new Date,C=new Date(j);C.setDate(C.getDate()+1);const o=new Date(j);o.setDate(o.getDate()-1);const D=h.toISOString().split("T")[0];return D===j.toISOString().split("T")[0]?"Aujourd'hui":D===C.toISOString().split("T")[0]?"Demain":D===o.toISOString().split("T")[0]?"Hier":h.toLocaleDateString("fr-FR",{weekday:"long",day:"numeric",month:"long",year:"numeric"})},z=h=>h?new Date(h).toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit",hour12:!1}):"",y=h=>h?new Date(h)<new Date:!1,O=h=>h?new Date(h).toISOString().split("T")[0]===new Date().toISOString().split("T")[0]:!1;return a.length===0?null:e.jsxDEV("div",{className:"ra-timeline",children:[e.jsxDEV("style",{children:Le()},void 0,!1,{fileName:"C:/Users/pc/Documents/dexapp/Dexapp live/src/islands/record-agenda/components/TimelineView.jsx",lineNumber:65,columnNumber:13},this),x.map((h,j)=>e.jsxDEV("div",{className:"ra-tl-group",style:{animationDelay:`${j*80}ms`},children:[e.jsxDEV("div",{className:`ra-tl-date-header ${O(h.dateKey)?"today":""} ${y(h.dateKey)&&!O(h.dateKey)?"past":""}`,children:[e.jsxDEV("div",{className:"ra-tl-date-dot"},void 0,!1,{fileName:"C:/Users/pc/Documents/dexapp/Dexapp live/src/islands/record-agenda/components/TimelineView.jsx",lineNumber:69,columnNumber:25},this),e.jsxDEV("span",{className:"ra-tl-date-label",children:T(h.date)},void 0,!1,{fileName:"C:/Users/pc/Documents/dexapp/Dexapp live/src/islands/record-agenda/components/TimelineView.jsx",lineNumber:70,columnNumber:25},this),e.jsxDEV("span",{className:"ra-tl-date-count",children:[h.items.length," événement",h.items.length>1?"s":""]},void 0,!0,{fileName:"C:/Users/pc/Documents/dexapp/Dexapp live/src/islands/record-agenda/components/TimelineView.jsx",lineNumber:71,columnNumber:25},this)]},void 0,!0,{fileName:"C:/Users/pc/Documents/dexapp/Dexapp live/src/islands/record-agenda/components/TimelineView.jsx",lineNumber:68,columnNumber:21},this),e.jsxDEV("div",{className:"ra-tl-items",children:h.items.map((C,o)=>{var L;const D=d(C),k=u(C,"lieu_evenement"),p=u(C,"duree_evenement"),M=u(C,"type_evenement"),E=Me(u(C,"tags_evenement")),N=y(C.date);return e.jsxDEV("div",{className:`ra-tl-item ${N?"past":""}`,style:{animationDelay:`${j*80+o*50}ms`},onClick:()=>r(C),children:[e.jsxDEV("div",{className:"ra-tl-time",children:z(C.date)},void 0,!1,{fileName:"C:/Users/pc/Documents/dexapp/Dexapp live/src/islands/record-agenda/components/TimelineView.jsx",lineNumber:90,columnNumber:37},this),e.jsxDEV("div",{className:"ra-tl-connector",children:[e.jsxDEV("div",{className:"ra-tl-line"},void 0,!1,{fileName:"C:/Users/pc/Documents/dexapp/Dexapp live/src/islands/record-agenda/components/TimelineView.jsx",lineNumber:94,columnNumber:41},this),e.jsxDEV("div",{className:"ra-tl-node",style:{borderColor:D.color,background:`${D.color}20`}},void 0,!1,{fileName:"C:/Users/pc/Documents/dexapp/Dexapp live/src/islands/record-agenda/components/TimelineView.jsx",lineNumber:95,columnNumber:41},this),e.jsxDEV("div",{className:"ra-tl-line"},void 0,!1,{fileName:"C:/Users/pc/Documents/dexapp/Dexapp live/src/islands/record-agenda/components/TimelineView.jsx",lineNumber:96,columnNumber:41},this)]},void 0,!0,{fileName:"C:/Users/pc/Documents/dexapp/Dexapp live/src/islands/record-agenda/components/TimelineView.jsx",lineNumber:93,columnNumber:37},this),e.jsxDEV("div",{className:"ra-tl-card",children:[e.jsxDEV("div",{className:"ra-tl-card-accent",style:{background:D.color}},void 0,!1,{fileName:"C:/Users/pc/Documents/dexapp/Dexapp live/src/islands/record-agenda/components/TimelineView.jsx",lineNumber:99,columnNumber:41},this),e.jsxDEV("div",{className:"ra-tl-card-body",children:[e.jsxDEV("div",{className:"ra-tl-card-top",children:[e.jsxDEV("h4",{className:"ra-tl-card-title",children:C.title||"Sans titre"},void 0,!1,{fileName:"C:/Users/pc/Documents/dexapp/Dexapp live/src/islands/record-agenda/components/TimelineView.jsx",lineNumber:102,columnNumber:49},this),e.jsxDEV("span",{className:"ra-tl-status",style:{background:`${D.color}15`,color:D.color},children:D.label},void 0,!1,{fileName:"C:/Users/pc/Documents/dexapp/Dexapp live/src/islands/record-agenda/components/TimelineView.jsx",lineNumber:103,columnNumber:49},this)]},void 0,!0,{fileName:"C:/Users/pc/Documents/dexapp/Dexapp live/src/islands/record-agenda/components/TimelineView.jsx",lineNumber:101,columnNumber:45},this),e.jsxDEV("div",{className:"ra-tl-card-meta",children:[p&&e.jsxDEV("span",{className:"ra-tl-meta-item",children:[e.jsxDEV("svg",{width:"12",height:"12",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",children:[e.jsxDEV("circle",{cx:"12",cy:"12",r:"10"},void 0,!1,{fileName:"C:/Users/pc/Documents/dexapp/Dexapp live/src/islands/record-agenda/components/TimelineView.jsx",lineNumber:110,columnNumber:155},this),e.jsxDEV("polyline",{points:"12 6 12 12 16 14"},void 0,!1,{fileName:"C:/Users/pc/Documents/dexapp/Dexapp live/src/islands/record-agenda/components/TimelineView.jsx",lineNumber:110,columnNumber:187},this)]},void 0,!0,{fileName:"C:/Users/pc/Documents/dexapp/Dexapp live/src/islands/record-agenda/components/TimelineView.jsx",lineNumber:110,columnNumber:57},this),p," min"]},void 0,!0,{fileName:"C:/Users/pc/Documents/dexapp/Dexapp live/src/islands/record-agenda/components/TimelineView.jsx",lineNumber:109,columnNumber:53},this),k&&e.jsxDEV("span",{className:"ra-tl-meta-item",children:[e.jsxDEV("svg",{width:"12",height:"12",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",children:[e.jsxDEV("path",{d:"M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"},void 0,!1,{fileName:"C:/Users/pc/Documents/dexapp/Dexapp live/src/islands/record-agenda/components/TimelineView.jsx",lineNumber:116,columnNumber:155},this),e.jsxDEV("circle",{cx:"12",cy:"10",r:"3"},void 0,!1,{fileName:"C:/Users/pc/Documents/dexapp/Dexapp live/src/islands/record-agenda/components/TimelineView.jsx",lineNumber:116,columnNumber:213},this)]},void 0,!0,{fileName:"C:/Users/pc/Documents/dexapp/Dexapp live/src/islands/record-agenda/components/TimelineView.jsx",lineNumber:116,columnNumber:57},this),k]},void 0,!0,{fileName:"C:/Users/pc/Documents/dexapp/Dexapp live/src/islands/record-agenda/components/TimelineView.jsx",lineNumber:115,columnNumber:53},this),M&&e.jsxDEV("span",{className:"ra-tl-meta-item",children:[e.jsxDEV("svg",{width:"12",height:"12",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",children:[e.jsxDEV("path",{d:"M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"},void 0,!1,{fileName:"C:/Users/pc/Documents/dexapp/Dexapp live/src/islands/record-agenda/components/TimelineView.jsx",lineNumber:122,columnNumber:155},this),e.jsxDEV("line",{x1:"7",y1:"7",x2:"7.01",y2:"7"},void 0,!1,{fileName:"C:/Users/pc/Documents/dexapp/Dexapp live/src/islands/record-agenda/components/TimelineView.jsx",lineNumber:122,columnNumber:245},this)]},void 0,!0,{fileName:"C:/Users/pc/Documents/dexapp/Dexapp live/src/islands/record-agenda/components/TimelineView.jsx",lineNumber:122,columnNumber:57},this),M.charAt(0).toUpperCase()+M.slice(1)]},void 0,!0,{fileName:"C:/Users/pc/Documents/dexapp/Dexapp live/src/islands/record-agenda/components/TimelineView.jsx",lineNumber:121,columnNumber:53},this)]},void 0,!0,{fileName:"C:/Users/pc/Documents/dexapp/Dexapp live/src/islands/record-agenda/components/TimelineView.jsx",lineNumber:107,columnNumber:45},this),E.length>0&&e.jsxDEV("div",{className:"ra-tl-tags",children:E.map(J=>e.jsxDEV("span",{className:"ra-tl-tag",children:J},J,!1,{fileName:"C:/Users/pc/Documents/dexapp/Dexapp live/src/islands/record-agenda/components/TimelineView.jsx",lineNumber:130,columnNumber:57},this))},void 0,!1,{fileName:"C:/Users/pc/Documents/dexapp/Dexapp live/src/islands/record-agenda/components/TimelineView.jsx",lineNumber:128,columnNumber:49},this)]},void 0,!0,{fileName:"C:/Users/pc/Documents/dexapp/Dexapp live/src/islands/record-agenda/components/TimelineView.jsx",lineNumber:100,columnNumber:41},this)]},void 0,!0,{fileName:"C:/Users/pc/Documents/dexapp/Dexapp live/src/islands/record-agenda/components/TimelineView.jsx",lineNumber:98,columnNumber:37},this)]},(L=C._id)==null?void 0:L.toString(),!0,{fileName:"C:/Users/pc/Documents/dexapp/Dexapp live/src/islands/record-agenda/components/TimelineView.jsx",lineNumber:84,columnNumber:33},this)})},void 0,!1,{fileName:"C:/Users/pc/Documents/dexapp/Dexapp live/src/islands/record-agenda/components/TimelineView.jsx",lineNumber:74,columnNumber:21},this)]},h.dateKey,!0,{fileName:"C:/Users/pc/Documents/dexapp/Dexapp live/src/islands/record-agenda/components/TimelineView.jsx",lineNumber:67,columnNumber:17},this))]},void 0,!0,{fileName:"C:/Users/pc/Documents/dexapp/Dexapp live/src/islands/record-agenda/components/TimelineView.jsx",lineNumber:64,columnNumber:9},this)}function Me(a){return(Array.isArray(a)?a:typeof a=="string"?a.split(","):[]).map(r=>String(r||"").trim()).filter(Boolean)}function Le(){return`
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
`}function Ie({events:a,entityData:f,onEventClick:r,onDeleteEvent:d,getStatusInfo:u,getCustomFieldValue:x}){const[T,z]=i.useState("date"),[y,O]=i.useState("asc"),h=i.useMemo(()=>[...a].sort((p,M)=>{let E,N;switch(T){case"title":return E=(p.title||"").toLowerCase(),N=(M.title||"").toLowerCase(),y==="asc"?E.localeCompare(N):N.localeCompare(E);case"status":return E=u(p).label,N=u(M).label,y==="asc"?E.localeCompare(N):N.localeCompare(E);case"type":return E=x(p,"type_evenement")||"",N=x(M,"type_evenement")||"",y==="asc"?E.localeCompare(N):N.localeCompare(E);case"date":default:return E=p.date?new Date(p.date).getTime():0,N=M.date?new Date(M.date).getTime():0,y==="asc"?E-N:N-E}}),[a,T,y,u,x]),j=p=>{T===p?O(M=>M==="asc"?"desc":"asc"):(z(p),O("asc"))},C=p=>p?new Date(p).toLocaleDateString("fr-FR",{day:"2-digit",month:"short",year:"numeric"}):"—",o=p=>p?new Date(p).toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit",hour12:!1}):"",D=p=>p&&new Date(p)<new Date,k=({field:p})=>e.jsxDEV("svg",{width:"10",height:"10",viewBox:"0 0 10 10",fill:"none",style:{opacity:T===p?1:.3},children:e.jsxDEV("path",{d:T===p&&y==="desc"?"M5 2L8 6H2L5 2Z":"M5 8L2 4H8L5 8Z",fill:"currentColor"},void 0,!1,{fileName:"C:/Users/pc/Documents/dexapp/Dexapp live/src/islands/record-agenda/components/ListView.jsx",lineNumber:59,columnNumber:13},this)},void 0,!1,{fileName:"C:/Users/pc/Documents/dexapp/Dexapp live/src/islands/record-agenda/components/ListView.jsx",lineNumber:58,columnNumber:9},this);return a.length===0?null:e.jsxDEV("div",{className:"ra-list-wrap",children:[e.jsxDEV("style",{children:Oe()},void 0,!1,{fileName:"C:/Users/pc/Documents/dexapp/Dexapp live/src/islands/record-agenda/components/ListView.jsx",lineNumber:67,columnNumber:13},this),e.jsxDEV("table",{className:"ra-list-table",children:[e.jsxDEV("thead",{children:e.jsxDEV("tr",{children:[e.jsxDEV("th",{className:"ra-th ra-th-sortable",onClick:()=>j("title"),children:["Titre ",e.jsxDEV(k,{field:"title"},void 0,!1,{fileName:"C:/Users/pc/Documents/dexapp/Dexapp live/src/islands/record-agenda/components/ListView.jsx",lineNumber:72,columnNumber:35},this)]},void 0,!0,{fileName:"C:/Users/pc/Documents/dexapp/Dexapp live/src/islands/record-agenda/components/ListView.jsx",lineNumber:71,columnNumber:25},this),e.jsxDEV("th",{className:"ra-th ra-th-sortable",onClick:()=>j("date"),children:["Date ",e.jsxDEV(k,{field:"date"},void 0,!1,{fileName:"C:/Users/pc/Documents/dexapp/Dexapp live/src/islands/record-agenda/components/ListView.jsx",lineNumber:75,columnNumber:34},this)]},void 0,!0,{fileName:"C:/Users/pc/Documents/dexapp/Dexapp live/src/islands/record-agenda/components/ListView.jsx",lineNumber:74,columnNumber:25},this),e.jsxDEV("th",{className:"ra-th",children:"Heure"},void 0,!1,{fileName:"C:/Users/pc/Documents/dexapp/Dexapp live/src/islands/record-agenda/components/ListView.jsx",lineNumber:77,columnNumber:25},this),e.jsxDEV("th",{className:"ra-th",children:"Durée"},void 0,!1,{fileName:"C:/Users/pc/Documents/dexapp/Dexapp live/src/islands/record-agenda/components/ListView.jsx",lineNumber:78,columnNumber:25},this),e.jsxDEV("th",{className:"ra-th ra-th-sortable",onClick:()=>j("type"),children:["Type ",e.jsxDEV(k,{field:"type"},void 0,!1,{fileName:"C:/Users/pc/Documents/dexapp/Dexapp live/src/islands/record-agenda/components/ListView.jsx",lineNumber:80,columnNumber:34},this)]},void 0,!0,{fileName:"C:/Users/pc/Documents/dexapp/Dexapp live/src/islands/record-agenda/components/ListView.jsx",lineNumber:79,columnNumber:25},this),e.jsxDEV("th",{className:"ra-th",children:"Étiquettes"},void 0,!1,{fileName:"C:/Users/pc/Documents/dexapp/Dexapp live/src/islands/record-agenda/components/ListView.jsx",lineNumber:82,columnNumber:25},this),e.jsxDEV("th",{className:"ra-th",children:"Lieu"},void 0,!1,{fileName:"C:/Users/pc/Documents/dexapp/Dexapp live/src/islands/record-agenda/components/ListView.jsx",lineNumber:83,columnNumber:25},this),e.jsxDEV("th",{className:"ra-th ra-th-sortable",onClick:()=>j("status"),children:["Statut ",e.jsxDEV(k,{field:"status"},void 0,!1,{fileName:"C:/Users/pc/Documents/dexapp/Dexapp live/src/islands/record-agenda/components/ListView.jsx",lineNumber:85,columnNumber:36},this)]},void 0,!0,{fileName:"C:/Users/pc/Documents/dexapp/Dexapp live/src/islands/record-agenda/components/ListView.jsx",lineNumber:84,columnNumber:25},this),e.jsxDEV("th",{className:"ra-th",style:{width:40}},void 0,!1,{fileName:"C:/Users/pc/Documents/dexapp/Dexapp live/src/islands/record-agenda/components/ListView.jsx",lineNumber:87,columnNumber:25},this)]},void 0,!0,{fileName:"C:/Users/pc/Documents/dexapp/Dexapp live/src/islands/record-agenda/components/ListView.jsx",lineNumber:70,columnNumber:21},this)},void 0,!1,{fileName:"C:/Users/pc/Documents/dexapp/Dexapp live/src/islands/record-agenda/components/ListView.jsx",lineNumber:69,columnNumber:17},this),e.jsxDEV("tbody",{children:h.map((p,M)=>{var U;const E=u(p),N=x(p,"type_evenement"),L=Ae(x(p,"tags_evenement")),J=x(p,"lieu_evenement"),I=x(p,"duree_evenement"),$=D(p.date);return e.jsxDEV("tr",{className:`ra-tr ${$?"past":""}`,onClick:()=>r(p),style:{animationDelay:`${M*30}ms`},children:[e.jsxDEV("td",{className:"ra-td ra-td-title",children:[e.jsxDEV("div",{className:"ra-td-title-dot",style:{background:E.color}},void 0,!1,{fileName:"C:/Users/pc/Documents/dexapp/Dexapp live/src/islands/record-agenda/components/ListView.jsx",lineNumber:107,columnNumber:37},this),p.title||"Sans titre"]},void 0,!0,{fileName:"C:/Users/pc/Documents/dexapp/Dexapp live/src/islands/record-agenda/components/ListView.jsx",lineNumber:106,columnNumber:33},this),e.jsxDEV("td",{className:"ra-td",children:C(p.date)},void 0,!1,{fileName:"C:/Users/pc/Documents/dexapp/Dexapp live/src/islands/record-agenda/components/ListView.jsx",lineNumber:110,columnNumber:33},this),e.jsxDEV("td",{className:"ra-td ra-td-time",children:o(p.date)},void 0,!1,{fileName:"C:/Users/pc/Documents/dexapp/Dexapp live/src/islands/record-agenda/components/ListView.jsx",lineNumber:111,columnNumber:33},this),e.jsxDEV("td",{className:"ra-td",children:I?`${I} min`:"—"},void 0,!1,{fileName:"C:/Users/pc/Documents/dexapp/Dexapp live/src/islands/record-agenda/components/ListView.jsx",lineNumber:112,columnNumber:33},this),e.jsxDEV("td",{className:"ra-td ra-td-type",children:N?e.jsxDEV("span",{className:"ra-td-type-badge",children:N.charAt(0).toUpperCase()+N.slice(1)},void 0,!1,{fileName:"C:/Users/pc/Documents/dexapp/Dexapp live/src/islands/record-agenda/components/ListView.jsx",lineNumber:115,columnNumber:41},this):"—"},void 0,!1,{fileName:"C:/Users/pc/Documents/dexapp/Dexapp live/src/islands/record-agenda/components/ListView.jsx",lineNumber:113,columnNumber:33},this),e.jsxDEV("td",{className:"ra-td ra-td-tags",children:L.length>0?L.map(B=>e.jsxDEV("span",{className:"ra-list-tag",children:B},B,!1,{fileName:"C:/Users/pc/Documents/dexapp/Dexapp live/src/islands/record-agenda/components/ListView.jsx",lineNumber:122,columnNumber:41},this)):"—"},void 0,!1,{fileName:"C:/Users/pc/Documents/dexapp/Dexapp live/src/islands/record-agenda/components/ListView.jsx",lineNumber:120,columnNumber:33},this),e.jsxDEV("td",{className:"ra-td",children:J||"—"},void 0,!1,{fileName:"C:/Users/pc/Documents/dexapp/Dexapp live/src/islands/record-agenda/components/ListView.jsx",lineNumber:125,columnNumber:33},this),e.jsxDEV("td",{className:"ra-td",children:e.jsxDEV("span",{className:"ra-td-status",style:{background:`${E.color}12`,color:E.color},children:E.label},void 0,!1,{fileName:"C:/Users/pc/Documents/dexapp/Dexapp live/src/islands/record-agenda/components/ListView.jsx",lineNumber:127,columnNumber:37},this)},void 0,!1,{fileName:"C:/Users/pc/Documents/dexapp/Dexapp live/src/islands/record-agenda/components/ListView.jsx",lineNumber:126,columnNumber:33},this),e.jsxDEV("td",{className:"ra-td ra-td-actions",children:e.jsxDEV("button",{className:"ra-td-delete",onClick:B=>{var A;B.stopPropagation(),d((A=p._id)==null?void 0:A.toString())},title:"Supprimer",children:e.jsxDEV("svg",{width:"14",height:"14",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",children:[e.jsxDEV("polyline",{points:"3 6 5 6 21 6"},void 0,!1,{fileName:"C:/Users/pc/Documents/dexapp/Dexapp live/src/islands/record-agenda/components/ListView.jsx",lineNumber:138,columnNumber:45},this),e.jsxDEV("path",{d:"M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"},void 0,!1,{fileName:"C:/Users/pc/Documents/dexapp/Dexapp live/src/islands/record-agenda/components/ListView.jsx",lineNumber:139,columnNumber:45},this)]},void 0,!0,{fileName:"C:/Users/pc/Documents/dexapp/Dexapp live/src/islands/record-agenda/components/ListView.jsx",lineNumber:137,columnNumber:41},this)},void 0,!1,{fileName:"C:/Users/pc/Documents/dexapp/Dexapp live/src/islands/record-agenda/components/ListView.jsx",lineNumber:132,columnNumber:37},this)},void 0,!1,{fileName:"C:/Users/pc/Documents/dexapp/Dexapp live/src/islands/record-agenda/components/ListView.jsx",lineNumber:131,columnNumber:33},this)]},(U=p._id)==null?void 0:U.toString(),!0,{fileName:"C:/Users/pc/Documents/dexapp/Dexapp live/src/islands/record-agenda/components/ListView.jsx",lineNumber:100,columnNumber:29},this)})},void 0,!1,{fileName:"C:/Users/pc/Documents/dexapp/Dexapp live/src/islands/record-agenda/components/ListView.jsx",lineNumber:90,columnNumber:17},this)]},void 0,!0,{fileName:"C:/Users/pc/Documents/dexapp/Dexapp live/src/islands/record-agenda/components/ListView.jsx",lineNumber:68,columnNumber:13},this)]},void 0,!0,{fileName:"C:/Users/pc/Documents/dexapp/Dexapp live/src/islands/record-agenda/components/ListView.jsx",lineNumber:66,columnNumber:9},this)}function Ae(a){return(Array.isArray(a)?a:typeof a=="string"?a.split(","):[]).map(r=>String(r||"").trim()).filter(Boolean)}function Oe(){return`
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
`}function Re({accountNumber:a,recordId:f,entitySlug:r}){const[d,u]=i.useState([]),[x,T]=i.useState(null),[z,y]=i.useState([]),[O,h]=i.useState(!0),[j,C]=i.useState(!1),[o,D]=i.useState(""),[k,p]=i.useState("calendar"),[M,E]=i.useState("dayGridMonth"),[N,L]=i.useState(!1),[J,I]=i.useState(null),[$,U]=i.useState(null),B=i.useRef(null),A=i.useRef(null),q=i.useRef(""),R=`agenda-${f}`,_=`/account/${a}/api/records/${f}/events`,K=`/account/${a}/api/user/view-preferences`,t=`/account/${a}/api/record/${f}/task-lists`;i.useEffect(()=>{(async()=>{var n;try{const m=await(await fetch(`${K}/${R}`,{credentials:"include"})).json();if(m.success&&((n=m.preferences)!=null&&n.agendaPrefs)){const v=m.preferences.agendaPrefs;v.viewMode&&p(v.viewMode),v.calendarView&&E(v.calendarView)}}catch{}C(!0)})()},[K,R]);const w=i.useCallback(async n=>{try{const l={viewMode:k,calendarView:M,...n};await fetch(K,{method:"POST",headers:{"Content-Type":"application/json"},credentials:"include",body:JSON.stringify({viewId:R,preferences:{agendaPrefs:l}})})}catch(l){console.warn("[RecordAgenda] Prefs save error:",l)}},[K,R,k,M]),W=i.useCallback(n=>{p(n),w({viewMode:n})},[w]),F=i.useCallback((n,l)=>{if(!n||!x)return null;const m=(x.customFields||[]).find(b=>b.name===l);if(!m)return null;const v=(n.customFields||[]).find(b=>{var S,P;const c=((S=b.field_id)==null?void 0:S._id)||b.field_id;return(c==null?void 0:c.toString())===((P=m._id)==null?void 0:P.toString())});return v?v.value:null},[x]),Z=i.useCallback(n=>{if(!n||!(x!=null&&x.statusClassification))return{label:"Planifié",color:"#3b82f6"};const l=x.statusClassification,m=(n.classificationValues||[]).find(b=>{var c,S;return((c=b.classificationId)==null?void 0:c.toString())===((S=l._id)==null?void 0:S.toString())});if(!m)return{label:"Planifié",color:"#3b82f6"};const v=(l.options||[]).find(b=>{var c,S;return((c=b._id)==null?void 0:c.toString())===((S=m.optionId)==null?void 0:S.toString())});return v?{label:v.label,color:v.color||"#3b82f6"}:{label:"Planifié",color:"#3b82f6"}},[x]),ae=i.useMemo(()=>d.map(n=>{var Q;const l=Z(n),m=F(n,"duree_evenement"),v=F(n,"lieu_evenement"),b=F(n,"type_evenement"),c=F(n,"notes_evenement"),S=_e(F(n,"tags_evenement"));let P=n.date?new Date(n.date):new Date,G=n.end_date?new Date(n.end_date):null;return!G&&m?G=new Date(P.getTime()+(parseInt(m)||30)*6e4):G||(G=new Date(P.getTime()+30*6e4)),{id:(Q=n._id)==null?void 0:Q.toString(),title:n.title||"Sans titre",start:P.toISOString(),end:G.toISOString(),backgroundColor:l.color,borderColor:l.color,textColor:"#fff",extendedProps:{_raw:n,status:l.label,statusColor:l.color,duration:m,lieu:v,type:b,notes:c,tags:S}}}),[d,Z,F]),Y=i.useCallback(async()=>{try{const n=await fetch(_,{credentials:"include"}),l=await n.json().catch(()=>({}));n.ok&&l.success?(u(l.events||[]),T(l.entityData||null),D("")):(u([]),T(l.entityData||null),D(l.error||l.message||"Impossible de charger les evenements."))}catch(n){console.error("[RecordAgenda] Fetch error:",n),D("Impossible de charger les evenements.")}h(!1)},[_]);i.useEffect(()=>{Y()},[Y]);const ne=i.useCallback(async()=>{try{const l=await(await fetch(t,{credentials:"include"})).json().catch(()=>({}));Array.isArray(l)?y(l):Array.isArray(l.lists)?y(l.lists):y([])}catch(n){console.warn("[RecordAgenda] Task lists fetch error:",n),y([])}},[t]);i.useEffect(()=>{ne()},[ne]);const X=i.useRef(M);X.current=M;const re=i.useRef(ae);re.current=ae,i.useEffect(()=>{var v;if(k!=="calendar"||O||!j||!B.current)return;if(typeof FullCalendar>"u"){console.error("[RecordAgenda] FullCalendar not loaded");return}const n=(v=A.current)==null?void 0:v.getDate();A.current&&A.current.destroy();let l=!1;const m=new FullCalendar.Calendar(B.current,{initialView:X.current,initialDate:n||void 0,locale:"fr",headerToolbar:{left:"prev,next today",center:"title",right:"dayGridMonth,timeGridWeek,timeGridDay"},buttonText:{today:"Aujourd'hui",month:"Mois",week:"Semaine",day:"Jour"},editable:!0,dayMaxEvents:3,selectable:!0,droppable:!1,nowIndicator:!0,slotMinTime:"07:00:00",slotMaxTime:"21:00:00",slotDuration:"00:15:00",snapDuration:"00:05:00",allDaySlot:!1,height:"100%",expandRows:!0,eventTimeFormat:{hour:"2-digit",minute:"2-digit",meridiem:!1,hour12:!1},events:re.current,datesSet:b=>{if(!l)return;const c=b.view.type;c!==X.current&&(X.current=c,E(c),fetch(K,{method:"POST",headers:{"Content-Type":"application/json"},credentials:"include",body:JSON.stringify({viewId:R,preferences:{agendaPrefs:{viewMode:"calendar",calendarView:c}}})}).catch(()=>{}))},eventClick:b=>{const c=b.event.extendedProps._raw;I(c),L(!0)},dateClick:b=>{const c=new Date(b.dateStr);c.setMinutes(Math.round(c.getMinutes()/5)*5,0,0),U(c.toISOString()),I(null),L(!0)},eventDrop:async b=>{var G,Q;const c=b.event.id,S=(G=b.event.start)==null?void 0:G.toISOString(),P=(Q=b.event.end)==null?void 0:Q.toISOString();try{await fetch(`${_}/${c}/drag`,{method:"PATCH",headers:{"Content-Type":"application/json"},credentials:"include",body:JSON.stringify({newStart:S,newEnd:P})}),await Y()}catch(de){console.error("[RecordAgenda] Drag error:",de),b.revert()}},eventResize:async b=>{var G,Q;const c=b.event.id,S=(G=b.event.start)==null?void 0:G.toISOString(),P=(Q=b.event.end)==null?void 0:Q.toISOString();try{await fetch(`${_}/${c}/drag`,{method:"PATCH",headers:{"Content-Type":"application/json"},credentials:"include",body:JSON.stringify({newStart:S,newEnd:P})}),await Y()}catch(de){console.error("[RecordAgenda] Resize error:",de),b.revert()}},eventDidMount:b=>{var P;const c=b.event.extendedProps;let S=b.event.title;c.lieu&&(S+=`
📍 ${c.lieu}`),c.status&&(S+=`
● ${c.status}`),(P=c.tags)!=null&&P.length&&(S+=`
🏷 ${c.tags.join(", ")}`),b.el.title=S}});return m.render(),A.current=m,requestAnimationFrame(()=>{l=!0}),()=>{A.current&&(A.current.destroy(),A.current=null)}},[k,O,j,_,Y,K,R]),i.useEffect(()=>{if(!A.current)return;const n=A.current;n.removeAllEvents(),n.addEventSource(ae)},[ae]);const te=i.useCallback(async n=>{try{D("");const{createTask:l,taskListId:m,...v}=n,b=await fetch(_,{method:"POST",headers:{"Content-Type":"application/json"},credentials:"include",body:JSON.stringify(v)}),c=await b.json().catch(()=>({}));if(!b.ok||!c.success)throw new Error(c.error||c.message||"Impossible de creer l'evenement.");if(l&&m)try{await fetch(`/account/${a}/api/task-lists/${m}/tasks`,{method:"POST",headers:{"Content-Type":"application/json"},credentials:"include",body:JSON.stringify({title:v.title||"Nouvelle tâche",status:"À faire",startDate:v.date||null,dueDate:v.endDate||v.date||null})})}catch(S){console.warn("[RecordAgenda] Task creation error (non-blocking):",S)}await Y(),L(!1),I(null),U(null)}catch(l){throw console.error("[RecordAgenda] Create error:",l),D(l.message||"Impossible de creer l'evenement."),l}},[_,Y,a]),oe=i.useCallback(async(n,l)=>{try{D("");const m=await fetch(`${_}/${n}`,{method:"PATCH",headers:{"Content-Type":"application/json"},credentials:"include",body:JSON.stringify(l)}),v=await m.json().catch(()=>({}));if(!m.ok||!v.success)throw new Error(v.error||v.message||"Impossible de mettre a jour l'evenement.");await Y(),L(!1),I(null)}catch(m){throw console.error("[RecordAgenda] Update error:",m),D(m.message||"Impossible de mettre a jour l'evenement."),m}},[_,Y]),s=i.useCallback(async n=>{if(confirm("Supprimer cet événement ?"))try{D("");const l=await fetch(`${_}/${n}`,{method:"DELETE",credentials:"include"}),m=await l.json().catch(()=>({}));if(!l.ok||!m.success)throw new Error(m.error||m.message||"Impossible de supprimer l'evenement.");await Y(),L(!1),I(null)}catch(l){console.error("[RecordAgenda] Delete error:",l),D(l.message||"Impossible de supprimer l'evenement.")}},[_,Y]),g=i.useCallback(()=>{I(null),U(null),L(!0)},[]),V=i.useCallback(n=>{I(n),L(!0)},[]);return i.useEffect(()=>{if(O||!j||d.length===0)return;const n=new URLSearchParams(window.location.search),l=n.get("event")||n.get("eventId")||n.get("openEvent");if(!l||q.current===l)return;const m=d.find(v=>String(v._id||"")===l);m&&(q.current=l,I(m),L(!0))},[d,O,j]),O||!j?e.jsxDEV("div",{className:"ra-loading",children:[e.jsxDEV("div",{className:"ra-spinner"},void 0,!1,{fileName:"C:/Users/pc/Documents/dexapp/Dexapp live/src/islands/record-agenda/RecordAgenda.jsx",lineNumber:462,columnNumber:17},this),e.jsxDEV("span",{children:"Chargement de l'agenda..."},void 0,!1,{fileName:"C:/Users/pc/Documents/dexapp/Dexapp live/src/islands/record-agenda/RecordAgenda.jsx",lineNumber:463,columnNumber:17},this)]},void 0,!0,{fileName:"C:/Users/pc/Documents/dexapp/Dexapp live/src/islands/record-agenda/RecordAgenda.jsx",lineNumber:461,columnNumber:13},this):e.jsxDEV("div",{className:"ra-container",children:[e.jsxDEV("style",{children:ze()},void 0,!1,{fileName:"C:/Users/pc/Documents/dexapp/Dexapp live/src/islands/record-agenda/RecordAgenda.jsx",lineNumber:470,columnNumber:13},this),e.jsxDEV(we,{viewMode:k,onViewChange:W,onNewEvent:g,eventCount:d.length},void 0,!1,{fileName:"C:/Users/pc/Documents/dexapp/Dexapp live/src/islands/record-agenda/RecordAgenda.jsx",lineNumber:472,columnNumber:13},this),o&&e.jsxDEV("div",{className:"ra-error-banner",children:[e.jsxDEV("span",{children:o},void 0,!1,{fileName:"C:/Users/pc/Documents/dexapp/Dexapp live/src/islands/record-agenda/RecordAgenda.jsx",lineNumber:481,columnNumber:21},this),e.jsxDEV("button",{type:"button",onClick:()=>D(""),"aria-label":"Fermer",children:e.jsxDEV("svg",{width:"14",height:"14",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",children:[e.jsxDEV("line",{x1:"18",y1:"6",x2:"6",y2:"18"},void 0,!1,{fileName:"C:/Users/pc/Documents/dexapp/Dexapp live/src/islands/record-agenda/RecordAgenda.jsx",lineNumber:484,columnNumber:29},this),e.jsxDEV("line",{x1:"6",y1:"6",x2:"18",y2:"18"},void 0,!1,{fileName:"C:/Users/pc/Documents/dexapp/Dexapp live/src/islands/record-agenda/RecordAgenda.jsx",lineNumber:484,columnNumber:67},this)]},void 0,!0,{fileName:"C:/Users/pc/Documents/dexapp/Dexapp live/src/islands/record-agenda/RecordAgenda.jsx",lineNumber:483,columnNumber:25},this)},void 0,!1,{fileName:"C:/Users/pc/Documents/dexapp/Dexapp live/src/islands/record-agenda/RecordAgenda.jsx",lineNumber:482,columnNumber:21},this)]},void 0,!0,{fileName:"C:/Users/pc/Documents/dexapp/Dexapp live/src/islands/record-agenda/RecordAgenda.jsx",lineNumber:480,columnNumber:17},this),k==="calendar"&&e.jsxDEV("div",{className:"ra-calendar-wrap",children:e.jsxDEV("div",{ref:B,className:"ra-calendar"},void 0,!1,{fileName:"C:/Users/pc/Documents/dexapp/Dexapp live/src/islands/record-agenda/RecordAgenda.jsx",lineNumber:492,columnNumber:21},this)},void 0,!1,{fileName:"C:/Users/pc/Documents/dexapp/Dexapp live/src/islands/record-agenda/RecordAgenda.jsx",lineNumber:491,columnNumber:17},this),k==="timeline"&&e.jsxDEV(Te,{events:d,entityData:x,onEventClick:V,getStatusInfo:Z,getCustomFieldValue:F},void 0,!1,{fileName:"C:/Users/pc/Documents/dexapp/Dexapp live/src/islands/record-agenda/RecordAgenda.jsx",lineNumber:497,columnNumber:17},this),k==="list"&&e.jsxDEV(Ie,{events:d,entityData:x,onEventClick:V,onDeleteEvent:s,getStatusInfo:Z,getCustomFieldValue:F},void 0,!1,{fileName:"C:/Users/pc/Documents/dexapp/Dexapp live/src/islands/record-agenda/RecordAgenda.jsx",lineNumber:507,columnNumber:17},this),d.length===0&&!O&&e.jsxDEV("div",{className:"ra-empty",children:[e.jsxDEV("div",{className:"ra-empty-icon",children:e.jsxDEV("svg",{width:"48",height:"48",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"1.5",children:[e.jsxDEV("rect",{x:"3",y:"4",width:"18",height:"18",rx:"2",ry:"2"},void 0,!1,{fileName:"C:/Users/pc/Documents/dexapp/Dexapp live/src/islands/record-agenda/RecordAgenda.jsx",lineNumber:521,columnNumber:29},this),e.jsxDEV("line",{x1:"16",y1:"2",x2:"16",y2:"6"},void 0,!1,{fileName:"C:/Users/pc/Documents/dexapp/Dexapp live/src/islands/record-agenda/RecordAgenda.jsx",lineNumber:522,columnNumber:29},this),e.jsxDEV("line",{x1:"8",y1:"2",x2:"8",y2:"6"},void 0,!1,{fileName:"C:/Users/pc/Documents/dexapp/Dexapp live/src/islands/record-agenda/RecordAgenda.jsx",lineNumber:523,columnNumber:29},this),e.jsxDEV("line",{x1:"3",y1:"10",x2:"21",y2:"10"},void 0,!1,{fileName:"C:/Users/pc/Documents/dexapp/Dexapp live/src/islands/record-agenda/RecordAgenda.jsx",lineNumber:524,columnNumber:29},this),e.jsxDEV("line",{x1:"10",y1:"14",x2:"14",y2:"18"},void 0,!1,{fileName:"C:/Users/pc/Documents/dexapp/Dexapp live/src/islands/record-agenda/RecordAgenda.jsx",lineNumber:525,columnNumber:29},this),e.jsxDEV("line",{x1:"14",y1:"14",x2:"10",y2:"18"},void 0,!1,{fileName:"C:/Users/pc/Documents/dexapp/Dexapp live/src/islands/record-agenda/RecordAgenda.jsx",lineNumber:526,columnNumber:29},this)]},void 0,!0,{fileName:"C:/Users/pc/Documents/dexapp/Dexapp live/src/islands/record-agenda/RecordAgenda.jsx",lineNumber:520,columnNumber:25},this)},void 0,!1,{fileName:"C:/Users/pc/Documents/dexapp/Dexapp live/src/islands/record-agenda/RecordAgenda.jsx",lineNumber:519,columnNumber:21},this),e.jsxDEV("h3",{children:"Aucun événement"},void 0,!1,{fileName:"C:/Users/pc/Documents/dexapp/Dexapp live/src/islands/record-agenda/RecordAgenda.jsx",lineNumber:529,columnNumber:21},this),e.jsxDEV("p",{children:"Ajoutez votre premier événement pour commencer à organiser votre agenda."},void 0,!1,{fileName:"C:/Users/pc/Documents/dexapp/Dexapp live/src/islands/record-agenda/RecordAgenda.jsx",lineNumber:530,columnNumber:21},this),e.jsxDEV("button",{className:"ra-empty-btn",onClick:g,children:[e.jsxDEV("svg",{width:"16",height:"16",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",children:[e.jsxDEV("line",{x1:"12",y1:"5",x2:"12",y2:"19"},void 0,!1,{fileName:"C:/Users/pc/Documents/dexapp/Dexapp live/src/islands/record-agenda/RecordAgenda.jsx",lineNumber:533,columnNumber:29},this),e.jsxDEV("line",{x1:"5",y1:"12",x2:"19",y2:"12"},void 0,!1,{fileName:"C:/Users/pc/Documents/dexapp/Dexapp live/src/islands/record-agenda/RecordAgenda.jsx",lineNumber:534,columnNumber:29},this)]},void 0,!0,{fileName:"C:/Users/pc/Documents/dexapp/Dexapp live/src/islands/record-agenda/RecordAgenda.jsx",lineNumber:532,columnNumber:25},this),"Nouvel événement"]},void 0,!0,{fileName:"C:/Users/pc/Documents/dexapp/Dexapp live/src/islands/record-agenda/RecordAgenda.jsx",lineNumber:531,columnNumber:21},this)]},void 0,!0,{fileName:"C:/Users/pc/Documents/dexapp/Dexapp live/src/islands/record-agenda/RecordAgenda.jsx",lineNumber:518,columnNumber:17},this),e.jsxDEV(Ve,{isOpen:N,onClose:()=>{L(!1),I(null),U(null)},event:J,entityData:x,prefillDate:$,onCreate:te,onUpdate:oe,onDelete:s,getCustomFieldValue:F,getStatusInfo:Z,accountNumber:a,taskLists:z,recordId:f},void 0,!1,{fileName:"C:/Users/pc/Documents/dexapp/Dexapp live/src/islands/record-agenda/RecordAgenda.jsx",lineNumber:541,columnNumber:13},this)]},void 0,!0,{fileName:"C:/Users/pc/Documents/dexapp/Dexapp live/src/islands/record-agenda/RecordAgenda.jsx",lineNumber:469,columnNumber:9},this)}function _e(a){return(Array.isArray(a)?a:typeof a=="string"?a.split(","):[]).map(r=>r&&typeof r=="object"?String(r.label||r.value||r.name||"").trim():String(r||"").trim()).filter(Boolean)}function ze(){return`
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
`}function ge(){document.querySelectorAll('[data-island="record-agenda"]').forEach(a=>{if(a.dataset.mounted==="1")return;a.dataset.mounted="1";const f={accountNumber:a.dataset.accountNumber,recordId:a.dataset.recordId,entitySlug:a.dataset.entitySlug};console.log("[RecordAgenda Island] Mounting:",f),Ne(a).render(e.jsxDEV(De.StrictMode,{children:e.jsxDEV(Re,{...f},void 0,!1,{fileName:"C:/Users/pc/Documents/dexapp/Dexapp live/src/islands/record-agenda/entry.jsx",lineNumber:25,columnNumber:17},this)},void 0,!1,{fileName:"C:/Users/pc/Documents/dexapp/Dexapp live/src/islands/record-agenda/entry.jsx",lineNumber:24,columnNumber:13},this))})}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",ge):ge();
