import{j as e,r as i,c as ye,R as ke}from"./chunks/client-CkWOIrXP.js";function ve({viewMode:t,onViewChange:x,onNewEvent:r,eventCount:d}){const f=[{key:"calendar",icon:"M3 4h18M3 10h18M3 16h18",label:"Calendrier"},{key:"timeline",icon:"M12 2v20M2 12h20",label:"Timeline"},{key:"list",icon:"M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01",label:"Liste"}];return e.jsxs("div",{className:"ra-toolbar",children:[e.jsx("style",{children:je()}),e.jsx("div",{className:"ra-toolbar-left",children:e.jsxs("div",{className:"ra-view-pills",children:[f.map(h=>e.jsxs("button",{className:`ra-vpill ${t===h.key?"active":""}`,onClick:()=>x(h.key),children:[e.jsx("svg",{width:"14",height:"14",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",children:e.jsx("path",{d:h.icon})}),h.label]},h.key)),e.jsx("span",{className:"ra-vpill-count",children:d})]})}),e.jsx("div",{className:"ra-toolbar-right",children:e.jsxs("button",{className:"ra-new-event-btn",onClick:r,children:[e.jsxs("svg",{width:"16",height:"16",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2.5",children:[e.jsx("line",{x1:"12",y1:"5",x2:"12",y2:"19"}),e.jsx("line",{x1:"5",y1:"12",x2:"19",y2:"12"})]}),"Nouvel événement"]})})]})}function je(){return`
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
`}const Se=[{value:"consultation",label:"Consultation",color:"#4361ee"},{value:"reunion",label:"Réunion",color:"#8b5cf6"},{value:"rappel",label:"Rappel",color:"#f59e0b"},{value:"tache",label:"Tâche",color:"#10b981"},{value:"personnel",label:"Personnel",color:"#ec4899"},{value:"autre",label:"Autre",color:"#6b7280"}],Ne=[{label:"Important",value:"Important",color:"#ef4444"},{label:"Date limite",value:"Date limite",color:"#f59e0b"},{label:"Risque amende",value:"Risque amende",color:"#dc2626"}],H="#64748b",ue=["#4361ee","#8b5cf6","#f59e0b","#10b981","#ec4899","#64748b"],Ce="widget_prochains_evenements",Te="widget_date_importante";function Ie({isOpen:t,onClose:x,event:r,entityData:d,prefillDate:f,onCreate:h,onUpdate:E,onDelete:P,getCustomFieldValue:N,getStatusInfo:A,accountNumber:m,taskLists:j=[],recordId:C}){var X,re,oe,se;const[s,k]=i.useState({title:"",date:"",endDate:"",duration:30,type:"consultation",tags:[],lieu:"",notes:"",statusOptionId:"",showInUpcomingWidget:!0,isImportantDate:!1,createTask:!1,selectedTaskListId:""}),[T,p]=i.useState(!1),[_,S]=i.useState(""),[y,L]=i.useState({type:[],status:[],tags:[]}),[J,M]=i.useState({type:[],status:[],tags:[]}),B=!!r;i.useEffect(()=>{var a,b,I,n,l;if(t)if(S(""),r){A(r);const u=(r.classificationValues||[]).find(g=>{var c,O,W;return((c=g.classificationId)==null?void 0:c.toString())===((W=(O=d==null?void 0:d.statusClassification)==null?void 0:O._id)==null?void 0:W.toString())}),w=ie(N(r,"tags_evenement"));k({title:r.title||"",date:r.date?le(new Date(r.date)):"",endDate:r.end_date?le(new Date(r.end_date)):"",duration:N(r,"duree_evenement")||30,type:N(r,"type_evenement")||"consultation",tags:w,lieu:N(r,"lieu_evenement")||"",notes:N(r,"notes_evenement")||"",statusOptionId:((a=u==null?void 0:u.optionId)==null?void 0:a.toString())||"",showInUpcomingWidget:he(N(r,Ce),!0),isImportantDate:he(N(r,Te),w.some(g=>g.toLowerCase()==="date importante")),createTask:!1,selectedTaskListId:""})}else{let u="";if(f){const c=new Date(f);isNaN(c.getTime())?u=f+"T09:00":(c.setMinutes(Math.round(c.getMinutes()/5)*5,0,0),u=le(c))}else{const c=new Date;c.setMinutes(Math.ceil(c.getMinutes()/5)*5,0,0),u=le(c)}const w=((l=(n=(I=(b=d==null?void 0:d.statusClassification)==null?void 0:b.options)==null?void 0:I[0])==null?void 0:n._id)==null?void 0:l.toString())||"",g=j.length>0?j[0]._id:"";k({title:"",date:u,endDate:"",duration:30,type:"consultation",tags:[],lieu:"",notes:"",statusOptionId:w,showInUpcomingWidget:!0,isImportantDate:!1,createTask:!1,selectedTaskListId:g})}},[t,r,f,d,N,A]);const D=i.useCallback((a,b)=>{S(""),k(I=>({...I,[a]:b}))},[]),F=i.useCallback(async()=>{if(s.title.trim()){p(!0),S("");try{const a=me(s.date,"Date");let b=s.endDate?me(s.endDate,"Date de fin").toISOString():void 0;!b&&a&&s.duration&&(b=new Date(a.getTime()+(parseInt(s.duration)||30)*6e4).toISOString());const I={title:s.title.trim(),date:a?a.toISOString():void 0,endDate:b,duration:parseInt(s.duration)||30,type:s.type,tags:ie(s.tags),lieu:s.lieu,notes:s.notes,statusOptionId:s.statusOptionId||void 0,showInUpcomingWidget:!!s.showInUpcomingWidget,isImportantDate:!!s.isImportantDate};!B&&s.createTask&&s.selectedTaskListId&&(I.createTask=!0,I.taskListId=s.selectedTaskListId),B?await E(r._id.toString(),I):await h(I)}catch(a){console.error("[EventModal] Save error:",a),S(a.message||"Impossible d'enregistrer cet evenement.")}finally{p(!1)}}},[s,B,r,h,E]),z=fe(d,"type_evenement"),q=fe(d,"tags_evenement"),$=(d==null?void 0:d.statusClassification)||null,R=((re=(X=$==null?void 0:$._id)==null?void 0:X.toString)==null?void 0:re.call(X))||($==null?void 0:$._id)||"",K=ae([Se,((oe=z==null?void 0:z.type_config)==null?void 0:oe.options)||[],y.type,s.type?[{label:s.type,value:s.type,color:H}]:[]],J.type),o=ae([(($==null?void 0:$.options)||[]).map(xe),y.status,s.statusOptionId?[{label:"Statut",value:s.statusOptionId,color:H}]:[]],J.status),v=ae([Ne,((se=q==null?void 0:q.type_config)==null?void 0:se.options)||[],y.tags,ie(s.tags).map(a=>({label:a,value:a}))],J.tags),U=(a,b)=>{L(I=>({...I,[a]:ae([I[a]||[],[b]])}))},V=(a,b)=>{M(I=>({...I,[a]:De(I[a]||[],b)}))},Z=async(a,b,I)=>{var c,O;const n={label:I,value:I,color:ge(I)},l=((O=(c=b==null?void 0:b._id)==null?void 0:c.toString)==null?void 0:O.call(c))||(b==null?void 0:b._id);if(!m||!l)return U(a,n),n;const u=await fetch(`/account/${m}/field-template/api/${l}/add-option`,{method:"POST",headers:{"Content-Type":"application/json"},credentials:"include",body:JSON.stringify(n)}),w=await u.json().catch(()=>({}));if(!u.ok||!w.success)throw new Error(w.error||"Création impossible");const g=ee(w.option||n);return U(a,g),g},te=async(a,b,I)=>{var u,w;const n=ee(I);if(!n.value||!confirm(`Supprimer l'option "${n.label}" ?`))return!1;const l=((w=(u=b==null?void 0:b._id)==null?void 0:u.toString)==null?void 0:w.call(u))||(b==null?void 0:b._id);if(m&&l){const g=await fetch(`/account/${m}/field-template/api/${l}/delete-option`,{method:"POST",headers:{"Content-Type":"application/json"},credentials:"include",body:JSON.stringify({value:n.value,label:n.label})}),c=await g.json().catch(()=>({}));if(!g.ok||!c.success)throw new Error(c.error||"Suppression impossible")}return V(a,n),a==="type"&&ce(n,s.type)&&D("type",""),a==="tags"&&D("tags",ie(s.tags).filter(g=>!ce(n,g))),!0},Y=async a=>{const b={label:a,value:a,color:ge(a)};if(!m||!R)return U("status",b),b;const I=await fetch(`/account/${m}/classification/api/fast-add`,{method:"POST",headers:{"Content-Type":"application/json"},credentials:"include",body:JSON.stringify({classificationId:R,label:a,color:b.color})}),n=await I.json().catch(()=>({}));if(!I.ok||!n.success)throw new Error(n.error||"Création impossible");const l=xe(n.option||b);return U("status",l),l},ne=async a=>{const b=ee(a);if(!b.value||!confirm(`Supprimer le statut "${b.label}" ?`))return!1;if(m&&R){const I=await fetch(`/account/${m}/classification/api/delete-option`,{method:"POST",headers:{"Content-Type":"application/json"},credentials:"include",body:JSON.stringify({classificationId:R,optionId:b.value})}),n=await I.json().catch(()=>({}));if(!I.ok||!n.success)throw new Error(n.error||"Suppression impossible")}return V("status",b),String(s.statusOptionId||"")===String(b.value||"")&&D("statusOptionId",""),!0};return t?e.jsxs("div",{className:"ra-modal-overlay",onClick:x,children:[e.jsxs("div",{className:"ra-modal",onClick:a=>a.stopPropagation(),children:[e.jsxs("div",{className:"ra-modal-header",children:[e.jsxs("div",{className:"ra-modal-header-left",children:[e.jsx("div",{className:"ra-modal-icon",children:e.jsxs("svg",{width:"18",height:"18",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",children:[e.jsx("rect",{x:"3",y:"4",width:"18",height:"18",rx:"2",ry:"2"}),e.jsx("line",{x1:"16",y1:"2",x2:"16",y2:"6"}),e.jsx("line",{x1:"8",y1:"2",x2:"8",y2:"6"}),e.jsx("line",{x1:"3",y1:"10",x2:"21",y2:"10"})]})}),e.jsx("h3",{children:B?"Modifier l'événement":"Nouvel événement"})]}),e.jsx("button",{className:"ra-modal-close",onClick:x,children:e.jsxs("svg",{width:"16",height:"16",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",children:[e.jsx("line",{x1:"18",y1:"6",x2:"6",y2:"18"}),e.jsx("line",{x1:"6",y1:"6",x2:"18",y2:"18"})]})})]}),e.jsxs("div",{className:"ra-modal-body",children:[e.jsxs("div",{className:"ra-field",children:[e.jsx("label",{className:"ra-label",children:"Titre"}),e.jsx("input",{type:"text",className:"ra-input",placeholder:"Ex: Consultation de suivi...",value:s.title,onChange:a=>D("title",a.target.value),autoFocus:!0})]}),e.jsxs("div",{className:"ra-field-row",children:[e.jsxs("div",{className:"ra-field",style:{flex:1},children:[e.jsx("label",{className:"ra-label",children:"Date & heure"}),e.jsx("input",{type:"datetime-local",className:"ra-input",step:"300",value:s.date,onChange:a=>D("date",a.target.value)})]}),e.jsxs("div",{className:"ra-field",style:{width:100},children:[e.jsx("label",{className:"ra-label",children:"Durée (min)"}),e.jsx("input",{type:"number",className:"ra-input",value:s.duration,onChange:a=>D("duration",a.target.value),min:"5",max:"480",step:"5"})]})]}),e.jsxs("div",{className:"ra-field",children:[e.jsx("label",{className:"ra-label",children:"Type"}),e.jsx(pe,{value:s.type,options:K,onChange:a=>D("type",a),onCreateOption:a=>Z("type",z,a),onDeleteOption:a=>te("type",z,a),placeholder:"Rechercher ou créer un type..."})]}),R&&e.jsxs("div",{className:"ra-field",children:[e.jsx("label",{className:"ra-label",children:"Statut"}),e.jsx(pe,{value:s.statusOptionId,options:o,onChange:a=>D("statusOptionId",a),onCreateOption:Y,onDeleteOption:ne,placeholder:"Rechercher ou créer un statut..."})]}),e.jsxs("div",{className:"ra-field",children:[e.jsx("label",{className:"ra-label",children:"Étiquettes"}),e.jsx(pe,{multiple:!0,value:s.tags,options:v,onChange:a=>D("tags",a),onCreateOption:a=>Z("tags",q,a),onDeleteOption:a=>te("tags",q,a),placeholder:"Ajouter..."})]}),e.jsxs("div",{className:"ra-field",children:[e.jsx("label",{className:"ra-label",children:"Widget"}),e.jsxs("div",{className:"ra-widget-switches",children:[e.jsxs("label",{className:`ra-widget-switch ${s.showInUpcomingWidget?"active":""}`,children:[e.jsxs("span",{className:"ra-widget-switch-copy",children:[e.jsx("strong",{children:"Prochains événements"}),e.jsx("small",{children:"Afficher dans le widget agenda"})]}),e.jsxs("span",{className:"ra-switch",children:[e.jsx("input",{type:"checkbox",checked:!!s.showInUpcomingWidget,onChange:a=>D("showInUpcomingWidget",a.target.checked)}),e.jsx("span",{})]})]}),e.jsxs("label",{className:`ra-widget-switch ${s.isImportantDate?"active":""}`,children:[e.jsxs("span",{className:"ra-widget-switch-copy",children:[e.jsx("strong",{children:"Date importante"}),e.jsx("small",{children:"Afficher dans le widget dates importantes"})]}),e.jsxs("span",{className:"ra-switch",children:[e.jsx("input",{type:"checkbox",checked:!!s.isImportantDate,onChange:a=>D("isImportantDate",a.target.checked)}),e.jsx("span",{})]})]})]})]}),!B&&j.length>0&&e.jsxs("div",{className:"ra-field",children:[e.jsx("label",{className:"ra-label",children:"Tâche"}),e.jsx("div",{className:"ra-widget-switches",children:e.jsxs("label",{className:`ra-widget-switch ${s.createTask?"active":""}`,children:[e.jsxs("span",{className:"ra-widget-switch-copy",children:[e.jsx("strong",{children:"Créer tâche"}),e.jsx("small",{children:"Ajouter aussi une tâche dans la liste"})]}),e.jsxs("span",{className:"ra-switch",children:[e.jsx("input",{type:"checkbox",checked:!!s.createTask,onChange:a=>D("createTask",a.target.checked)}),e.jsx("span",{})]})]})}),s.createTask&&j.length>1&&e.jsx("select",{className:"ra-input",value:s.selectedTaskListId,onChange:a=>D("selectedTaskListId",a.target.value),style:{marginTop:8},children:j.map(a=>e.jsx("option",{value:a._id,children:a.label||"Liste des tâches"},a._id))})]}),e.jsxs("div",{className:"ra-field",children:[e.jsx("label",{className:"ra-label",children:"Lieu"}),e.jsx("input",{type:"text",className:"ra-input",placeholder:"Cabinet, Salle A, Domicile...",value:s.lieu,onChange:a=>D("lieu",a.target.value)})]}),e.jsxs("div",{className:"ra-field",children:[e.jsx("label",{className:"ra-label",children:"Notes"}),e.jsx("textarea",{className:"ra-input ra-textarea",placeholder:"Notes additionnelles...",rows:3,value:s.notes,onChange:a=>D("notes",a.target.value)})]}),_&&e.jsx("div",{className:"ra-modal-error",role:"alert",children:_})]}),e.jsxs("div",{className:"ra-modal-footer",children:[B&&e.jsxs("button",{className:"ra-delete-btn",onClick:()=>P(r._id.toString()),type:"button",children:[e.jsxs("svg",{width:"14",height:"14",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",children:[e.jsx("polyline",{points:"3 6 5 6 21 6"}),e.jsx("path",{d:"M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"})]}),"Supprimer"]}),e.jsxs("div",{className:"ra-modal-footer-right",children:[e.jsx("button",{className:"ra-cancel-btn",onClick:x,type:"button",children:"Annuler"}),e.jsx("button",{className:"ra-save-btn",onClick:F,disabled:T||!s.title.trim(),type:"button",children:T?"Enregistrement...":B?"Mettre à jour":"Créer"})]})]})]}),e.jsx("style",{children:Oe()})]}):null}function pe({value:t,options:x,onChange:r,onCreateOption:d,onDeleteOption:f,multiple:h=!1,placeholder:E="Ajouter..."}){const[P,N]=i.useState(""),[A,m]=i.useState(!1),[j,C]=i.useState(!1),[s,k]=i.useState(!1),[T,p]=i.useState(null),_=i.useRef(null),S=i.useRef(null),y=i.useMemo(()=>{if(h)return we(t);const o=t==null?"":String(t).trim();return o?[o]:[]},[h,t]),L=i.useMemo(()=>ae([x,y.map(o=>({label:o,value:o}))]),[x,y]),J=i.useMemo(()=>y.map(o=>L.find(v=>ce(v,o))||{label:o,value:o,color:H}),[L,y]),M=P.trim().toLowerCase(),B=i.useMemo(()=>L.filter(o=>!y.some(v=>ce(o,v))).filter(o=>M?String(o.label||"").toLowerCase().includes(M)||String(o.value||"").toLowerCase().includes(M):!0).slice(0,8),[L,y,M]),D=i.useMemo(()=>M?L.some(o=>String(o.label||"").trim().toLowerCase()===M||String(o.value||"").trim().toLowerCase()===M):!1,[L,M]);i.useEffect(()=>{const o=U=>{!_.current||_.current.contains(U.target)||(m(!1),p(null),N(""))},v=U=>{U.key==="Escape"&&(m(!1),p(null),N(""))};return document.addEventListener("mousedown",o),document.addEventListener("keydown",v),()=>{document.removeEventListener("mousedown",o),document.removeEventListener("keydown",v)}},[]);const F=i.useCallback(o=>{const v=ee(o);v.value&&(h?y.some(V=>V.toLowerCase()===String(v.value).toLowerCase())||r([...y,v.value]):(r(v.value),m(!1)),N(""),p(null),h&&m(!0),requestAnimationFrame(()=>{var U;return(U=S.current)==null?void 0:U.focus()}))},[h,r,y]),z=i.useCallback(o=>{r(h?y.filter(v=>v.toLowerCase()!==String(o).toLowerCase()):""),p(null),requestAnimationFrame(()=>{var v;return(v=S.current)==null?void 0:v.focus()})},[h,r,y]),q=i.useCallback(async()=>{const o=P.trim();if(!(!o||D||j)){C(!0);try{const v=await d(o);F(v||{label:o,value:o})}catch(v){console.error("[EventOptionSelect] Create option error:",v),window.showMessage?window.showMessage(v.message||"Création impossible","danger"):alert(v.message||"Création impossible")}finally{C(!1)}}},[j,D,d,P,F]),$=i.useCallback((o,v)=>{f&&(o.preventDefault(),o.stopPropagation(),p({x:o.clientX,y:o.clientY,option:ee(v)}))},[f]),R=i.useCallback(async()=>{if(!(!(T!=null&&T.option)||!f||s)){k(!0);try{if(await f(T.option)===!1){p(null);return}z(T.option.value),p(null),m(!1)}catch(o){console.error("[EventOptionSelect] Delete option error:",o),window.showMessage?window.showMessage(o.message||"Suppression impossible","danger"):alert(o.message||"Suppression impossible")}finally{k(!1)}}},[T,s,f,z]),K=o=>{o.key==="Enter"?(o.preventDefault(),B.length>0?F(B[0]):q()):o.key==="Backspace"&&!P&&y.length>0?z(y[y.length-1]):o.key==="Escape"&&(m(!1),p(null),N(""))};return e.jsxs("div",{className:"ra-option-picker",ref:_,children:[e.jsxs("div",{className:`ra-option-control ${A?"open":""}`,onClick:()=>{var o;m(!0),(o=S.current)==null||o.focus()},children:[J.map(o=>e.jsxs("span",{className:"ra-option-pill",onContextMenu:v=>$(v,o),title:f?"Clic droit pour supprimer cette option":void 0,style:{"--option-c":o.color||H,background:`${o.color||H}12`,borderColor:`${o.color||H}35`,color:o.color||H},children:[e.jsx("span",{className:"ra-option-dot",style:{background:o.color||H}}),o.label,e.jsx("button",{type:"button",onClick:v=>{v.stopPropagation(),z(o.value)},"aria-label":`Retirer ${o.label}`,children:"×"})]},o.value)),e.jsx("input",{ref:S,className:"ra-option-input",value:P,onChange:o=>{N(o.target.value),m(!0)},onFocus:()=>m(!0),onKeyDown:K,placeholder:J.length?"Ajouter...":E})]}),A&&(B.length>0||P.trim()&&!D)&&e.jsxs("div",{className:"ra-option-menu",children:[B.map(o=>e.jsxs("button",{type:"button",className:"ra-option-item",onClick:()=>F(o),onContextMenu:v=>$(v,o),title:f?"Clic droit pour supprimer cette option":void 0,children:[e.jsx("span",{className:"ra-option-dot",style:{background:o.color||H}}),e.jsx("span",{children:o.label})]},o.value)),P.trim()&&!D&&e.jsxs("button",{type:"button",className:"ra-option-create",onClick:q,disabled:j,children:[e.jsx("span",{children:"+"}),j?"Création...":`Créer "${P.trim()}"`]})]}),T&&e.jsx("div",{className:"ra-option-context-menu",style:{left:T.x,top:T.y},children:e.jsx("button",{type:"button",onClick:R,disabled:s,children:s?"Suppression...":`Supprimer "${T.option.label}"`})})]})}function fe(t,x){return((t==null?void 0:t.customFields)||[]).find(r=>(r==null?void 0:r.name)===x)||null}function he(t,x=!1){if(t==null||t==="")return x;if(typeof t=="boolean")return t;if(typeof t=="number")return t!==0;const r=String(t).trim().toLowerCase();return["true","1","yes","oui","on"].includes(r)?!0:["false","0","no","non","off"].includes(r)?!1:x}function ie(t){return we(t)}function we(t){return(Array.isArray(t)?t:typeof t=="string"?t.split(","):[]).map(r=>r&&typeof r=="object"?String(r.value||r.label||r.name||"").trim():String(r||"").trim()).filter(Boolean).filter((r,d,f)=>f.findIndex(h=>h.toLowerCase()===r.toLowerCase())===d)}function ee(t){var r,d;if(typeof t=="object"&&t){const f=t.id||((d=(r=t._id)==null?void 0:r.toString)==null?void 0:d.call(r))||t._id||"",h=String(t.label||t.value||t.name||f||"").trim(),E=String(t.value||f||t.label||"").trim();return{label:h,value:E,color:t.color||H,id:String(f||E)}}const x=String(t||"").trim();return{label:x,value:x,color:H,id:x}}function xe(t){var d,f;const x=ee(t),r=(t==null?void 0:t.id)||((f=(d=t==null?void 0:t._id)==null?void 0:d.toString)==null?void 0:f.call(d))||(t==null?void 0:t._id)||x.value;return{...x,value:String(r||x.value||"").trim(),id:String(r||x.value||"").trim()}}function ce(t,x){const r=String(x||"").trim().toLowerCase();return[t.value,t.label,t.id].filter(d=>d!=null).some(d=>String(d).trim().toLowerCase()===r)}function ae(t,x=[]){const r=[],d=new Set,f=new Set((x||[]).map(h=>String(h||"").trim().toLowerCase()).filter(Boolean));return t.flat().forEach(h=>{const E=ee(h);if(!E.value||[E.value,E.label,E.id].map(A=>String(A||"").trim().toLowerCase()).filter(Boolean).some(A=>f.has(A)))return;const N=String(E.value||E.label).toLowerCase();d.has(N)||(d.add(N),r.push(E))}),r}function De(t,x){const r=ee(x),d=new Set((t||[]).map(f=>String(f||"").trim().toLowerCase()).filter(Boolean));return[r.value,r.label,r.id].map(f=>String(f||"").trim().toLowerCase()).filter(Boolean).forEach(f=>d.add(f)),[...d]}function ge(t){const r=[...String(t||"")].reduce((d,f)=>d+f.charCodeAt(0),0);return ue[r%ue.length]||H}function le(t){const x=t.getFullYear(),r=String(t.getMonth()+1).padStart(2,"0"),d=String(t.getDate()).padStart(2,"0"),f=String(t.getHours()).padStart(2,"0"),h=String(t.getMinutes()).padStart(2,"0");return`${x}-${r}-${d}T${f}:${h}`}function me(t,x){if(!t)return null;const r=new Date(t);if(Number.isNaN(r.getTime()))throw new Error(`${x} invalide.`);return r}function Oe(){return`
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
`}function Ee({events:t,entityData:x,onEventClick:r,getStatusInfo:d,getCustomFieldValue:f}){const h=i.useMemo(()=>{const m=[...t].sort((C,s)=>{const k=C.date?new Date(C.date).getTime():0,T=s.date?new Date(s.date).getTime():0;return k-T}),j={};return m.forEach(C=>{const k=(C.date?new Date(C.date):new Date).toISOString().split("T")[0];j[k]||(j[k]=[]),j[k].push(C)}),Object.entries(j).map(([C,s])=>({dateKey:C,date:new Date(C),items:s}))},[t]),E=m=>{const j=new Date,C=new Date(j);C.setDate(C.getDate()+1);const s=new Date(j);s.setDate(s.getDate()-1);const k=m.toISOString().split("T")[0];return k===j.toISOString().split("T")[0]?"Aujourd'hui":k===C.toISOString().split("T")[0]?"Demain":k===s.toISOString().split("T")[0]?"Hier":m.toLocaleDateString("fr-FR",{weekday:"long",day:"numeric",month:"long",year:"numeric"})},P=m=>m?new Date(m).toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit",hour12:!1}):"",N=m=>m?new Date(m)<new Date:!1,A=m=>m?new Date(m).toISOString().split("T")[0]===new Date().toISOString().split("T")[0]:!1;return t.length===0?null:e.jsxs("div",{className:"ra-timeline",children:[e.jsx("style",{children:Le()}),h.map((m,j)=>e.jsxs("div",{className:"ra-tl-group",style:{animationDelay:`${j*80}ms`},children:[e.jsxs("div",{className:`ra-tl-date-header ${A(m.dateKey)?"today":""} ${N(m.dateKey)&&!A(m.dateKey)?"past":""}`,children:[e.jsx("div",{className:"ra-tl-date-dot"}),e.jsx("span",{className:"ra-tl-date-label",children:E(m.date)}),e.jsxs("span",{className:"ra-tl-date-count",children:[m.items.length," événement",m.items.length>1?"s":""]})]}),e.jsx("div",{className:"ra-tl-items",children:m.items.map((C,s)=>{var L;const k=d(C),T=f(C,"lieu_evenement"),p=f(C,"duree_evenement"),_=f(C,"type_evenement"),S=_e(f(C,"tags_evenement")),y=N(C.date);return e.jsxs("div",{className:`ra-tl-item ${y?"past":""}`,style:{animationDelay:`${j*80+s*50}ms`},onClick:()=>r(C),children:[e.jsx("div",{className:"ra-tl-time",children:P(C.date)}),e.jsxs("div",{className:"ra-tl-connector",children:[e.jsx("div",{className:"ra-tl-line"}),e.jsx("div",{className:"ra-tl-node",style:{borderColor:k.color,background:`${k.color}20`}}),e.jsx("div",{className:"ra-tl-line"})]}),e.jsxs("div",{className:"ra-tl-card",children:[e.jsx("div",{className:"ra-tl-card-accent",style:{background:k.color}}),e.jsxs("div",{className:"ra-tl-card-body",children:[e.jsxs("div",{className:"ra-tl-card-top",children:[e.jsx("h4",{className:"ra-tl-card-title",children:C.title||"Sans titre"}),e.jsx("span",{className:"ra-tl-status",style:{background:`${k.color}15`,color:k.color},children:k.label})]}),e.jsxs("div",{className:"ra-tl-card-meta",children:[p&&e.jsxs("span",{className:"ra-tl-meta-item",children:[e.jsxs("svg",{width:"12",height:"12",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",children:[e.jsx("circle",{cx:"12",cy:"12",r:"10"}),e.jsx("polyline",{points:"12 6 12 12 16 14"})]}),p," min"]}),T&&e.jsxs("span",{className:"ra-tl-meta-item",children:[e.jsxs("svg",{width:"12",height:"12",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",children:[e.jsx("path",{d:"M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"}),e.jsx("circle",{cx:"12",cy:"10",r:"3"})]}),T]}),_&&e.jsxs("span",{className:"ra-tl-meta-item",children:[e.jsxs("svg",{width:"12",height:"12",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",children:[e.jsx("path",{d:"M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"}),e.jsx("line",{x1:"7",y1:"7",x2:"7.01",y2:"7"})]}),_.charAt(0).toUpperCase()+_.slice(1)]})]}),S.length>0&&e.jsx("div",{className:"ra-tl-tags",children:S.map(J=>e.jsx("span",{className:"ra-tl-tag",children:J},J))})]})]})]},(L=C._id)==null?void 0:L.toString())})})]},m.dateKey))]})}function _e(t){return(Array.isArray(t)?t:typeof t=="string"?t.split(","):[]).map(r=>String(r||"").trim()).filter(Boolean)}function Le(){return`
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
`}function Me({events:t,entityData:x,onEventClick:r,onDeleteEvent:d,getStatusInfo:f,getCustomFieldValue:h}){const[E,P]=i.useState("date"),[N,A]=i.useState("asc"),m=i.useMemo(()=>[...t].sort((p,_)=>{let S,y;switch(E){case"title":return S=(p.title||"").toLowerCase(),y=(_.title||"").toLowerCase(),N==="asc"?S.localeCompare(y):y.localeCompare(S);case"status":return S=f(p).label,y=f(_).label,N==="asc"?S.localeCompare(y):y.localeCompare(S);case"type":return S=h(p,"type_evenement")||"",y=h(_,"type_evenement")||"",N==="asc"?S.localeCompare(y):y.localeCompare(S);case"date":default:return S=p.date?new Date(p.date).getTime():0,y=_.date?new Date(_.date).getTime():0,N==="asc"?S-y:y-S}}),[t,E,N,f,h]),j=p=>{E===p?A(_=>_==="asc"?"desc":"asc"):(P(p),A("asc"))},C=p=>p?new Date(p).toLocaleDateString("fr-FR",{day:"2-digit",month:"short",year:"numeric"}):"—",s=p=>p?new Date(p).toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit",hour12:!1}):"",k=p=>p&&new Date(p)<new Date,T=({field:p})=>e.jsx("svg",{width:"10",height:"10",viewBox:"0 0 10 10",fill:"none",style:{opacity:E===p?1:.3},children:e.jsx("path",{d:E===p&&N==="desc"?"M5 2L8 6H2L5 2Z":"M5 8L2 4H8L5 8Z",fill:"currentColor"})});return t.length===0?null:e.jsxs("div",{className:"ra-list-wrap",children:[e.jsx("style",{children:Ae()}),e.jsxs("table",{className:"ra-list-table",children:[e.jsx("thead",{children:e.jsxs("tr",{children:[e.jsxs("th",{className:"ra-th ra-th-sortable",onClick:()=>j("title"),children:["Titre ",e.jsx(T,{field:"title"})]}),e.jsxs("th",{className:"ra-th ra-th-sortable",onClick:()=>j("date"),children:["Date ",e.jsx(T,{field:"date"})]}),e.jsx("th",{className:"ra-th",children:"Heure"}),e.jsx("th",{className:"ra-th",children:"Durée"}),e.jsxs("th",{className:"ra-th ra-th-sortable",onClick:()=>j("type"),children:["Type ",e.jsx(T,{field:"type"})]}),e.jsx("th",{className:"ra-th",children:"Étiquettes"}),e.jsx("th",{className:"ra-th",children:"Lieu"}),e.jsxs("th",{className:"ra-th ra-th-sortable",onClick:()=>j("status"),children:["Statut ",e.jsx(T,{field:"status"})]}),e.jsx("th",{className:"ra-th",style:{width:40}})]})}),e.jsx("tbody",{children:m.map((p,_)=>{var D;const S=f(p),y=h(p,"type_evenement"),L=ze(h(p,"tags_evenement")),J=h(p,"lieu_evenement"),M=h(p,"duree_evenement"),B=k(p.date);return e.jsxs("tr",{className:`ra-tr ${B?"past":""}`,onClick:()=>r(p),style:{animationDelay:`${_*30}ms`},children:[e.jsxs("td",{className:"ra-td ra-td-title",children:[e.jsx("div",{className:"ra-td-title-dot",style:{background:S.color}}),p.title||"Sans titre"]}),e.jsx("td",{className:"ra-td",children:C(p.date)}),e.jsx("td",{className:"ra-td ra-td-time",children:s(p.date)}),e.jsx("td",{className:"ra-td",children:M?`${M} min`:"—"}),e.jsx("td",{className:"ra-td ra-td-type",children:y?e.jsx("span",{className:"ra-td-type-badge",children:y.charAt(0).toUpperCase()+y.slice(1)}):"—"}),e.jsx("td",{className:"ra-td ra-td-tags",children:L.length>0?L.map(F=>e.jsx("span",{className:"ra-list-tag",children:F},F)):"—"}),e.jsx("td",{className:"ra-td",children:J||"—"}),e.jsx("td",{className:"ra-td",children:e.jsx("span",{className:"ra-td-status",style:{background:`${S.color}12`,color:S.color},children:S.label})}),e.jsx("td",{className:"ra-td ra-td-actions",children:e.jsx("button",{className:"ra-td-delete",onClick:F=>{var z;F.stopPropagation(),d((z=p._id)==null?void 0:z.toString())},title:"Supprimer",children:e.jsxs("svg",{width:"14",height:"14",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",children:[e.jsx("polyline",{points:"3 6 5 6 21 6"}),e.jsx("path",{d:"M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"})]})})})]},(D=p._id)==null?void 0:D.toString())})})]})]})}function ze(t){return(Array.isArray(t)?t:typeof t=="string"?t.split(","):[]).map(r=>String(r||"").trim()).filter(Boolean)}function Ae(){return`
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
`}function $e({accountNumber:t,recordId:x,entitySlug:r}){const[d,f]=i.useState([]),[h,E]=i.useState(null),[P,N]=i.useState([]),[A,m]=i.useState(!0),[j,C]=i.useState(!1),[s,k]=i.useState(""),[T,p]=i.useState("calendar"),[_,S]=i.useState("dayGridMonth"),[y,L]=i.useState(!1),[J,M]=i.useState(null),[B,D]=i.useState(null),F=i.useRef(null),z=i.useRef(null),q=i.useRef(""),$=`agenda-${x}`,R=`/account/${t}/api/records/${x}/events`,K=`/account/${t}/api/user/view-preferences`,o=`/account/${t}/api/record/${x}/task-lists`;i.useEffect(()=>{(async()=>{var n;try{const u=await(await fetch(`${K}/${$}`,{credentials:"include"})).json();if(u.success&&((n=u.preferences)!=null&&n.agendaPrefs)){const w=u.preferences.agendaPrefs;w.viewMode&&p(w.viewMode),w.calendarView&&S(w.calendarView)}}catch{}C(!0)})()},[K,$]);const v=i.useCallback(async n=>{try{const l={viewMode:T,calendarView:_,...n};await fetch(K,{method:"POST",headers:{"Content-Type":"application/json"},credentials:"include",body:JSON.stringify({viewId:$,preferences:{agendaPrefs:l}})})}catch(l){console.warn("[RecordAgenda] Prefs save error:",l)}},[K,$,T,_]),U=i.useCallback(n=>{p(n),v({viewMode:n})},[v]),V=i.useCallback((n,l)=>{if(!n||!h)return null;const u=(h.customFields||[]).find(g=>g.name===l);if(!u)return null;const w=(n.customFields||[]).find(g=>{var O,W;const c=((O=g.field_id)==null?void 0:O._id)||g.field_id;return(c==null?void 0:c.toString())===((W=u._id)==null?void 0:W.toString())});return w?w.value:null},[h]),Z=i.useCallback(n=>{if(!n||!(h!=null&&h.statusClassification))return{label:"Planifié",color:"#3b82f6"};const l=h.statusClassification,u=(n.classificationValues||[]).find(g=>{var c,O;return((c=g.classificationId)==null?void 0:c.toString())===((O=l._id)==null?void 0:O.toString())});if(!u)return{label:"Planifié",color:"#3b82f6"};const w=(l.options||[]).find(g=>{var c,O;return((c=g._id)==null?void 0:c.toString())===((O=u.optionId)==null?void 0:O.toString())});return w?{label:w.label,color:w.color||"#3b82f6"}:{label:"Planifié",color:"#3b82f6"}},[h]),te=i.useMemo(()=>d.map(n=>{var Q;const l=Z(n),u=V(n,"duree_evenement"),w=V(n,"lieu_evenement"),g=V(n,"type_evenement"),c=V(n,"notes_evenement"),O=Re(V(n,"tags_evenement"));let W=n.date?new Date(n.date):new Date,G=n.end_date?new Date(n.end_date):null;return!G&&u?G=new Date(W.getTime()+(parseInt(u)||30)*6e4):G||(G=new Date(W.getTime()+30*6e4)),{id:(Q=n._id)==null?void 0:Q.toString(),title:n.title||"Sans titre",start:W.toISOString(),end:G.toISOString(),backgroundColor:l.color,borderColor:l.color,textColor:"#fff",extendedProps:{_raw:n,status:l.label,statusColor:l.color,duration:u,lieu:w,type:g,notes:c,tags:O}}}),[d,Z,V]),Y=i.useCallback(async()=>{try{const n=await fetch(R,{credentials:"include"}),l=await n.json().catch(()=>({}));n.ok&&l.success?(f(l.events||[]),E(l.entityData||null),k("")):(f([]),E(l.entityData||null),k(l.error||l.message||"Impossible de charger les evenements."))}catch(n){console.error("[RecordAgenda] Fetch error:",n),k("Impossible de charger les evenements.")}m(!1)},[R]);i.useEffect(()=>{Y()},[Y]);const ne=i.useCallback(async()=>{try{const l=await(await fetch(o,{credentials:"include"})).json().catch(()=>({}));Array.isArray(l)?N(l):Array.isArray(l.lists)?N(l.lists):N([])}catch(n){console.warn("[RecordAgenda] Task lists fetch error:",n),N([])}},[o]);i.useEffect(()=>{ne()},[ne]);const X=i.useRef(_);X.current=_;const re=i.useRef(te);re.current=te,i.useEffect(()=>{var w;if(T!=="calendar"||A||!j||!F.current)return;if(typeof FullCalendar>"u"){console.error("[RecordAgenda] FullCalendar not loaded");return}const n=(w=z.current)==null?void 0:w.getDate();z.current&&z.current.destroy();let l=!1;const u=new FullCalendar.Calendar(F.current,{initialView:X.current,initialDate:n||void 0,locale:"fr",headerToolbar:{left:"prev,next today",center:"title",right:"dayGridMonth,timeGridWeek,timeGridDay"},buttonText:{today:"Aujourd'hui",month:"Mois",week:"Semaine",day:"Jour"},editable:!0,dayMaxEvents:3,selectable:!0,droppable:!1,nowIndicator:!0,slotMinTime:"07:00:00",slotMaxTime:"21:00:00",slotDuration:"00:15:00",snapDuration:"00:05:00",allDaySlot:!1,height:"100%",expandRows:!0,eventTimeFormat:{hour:"2-digit",minute:"2-digit",meridiem:!1,hour12:!1},events:re.current,datesSet:g=>{if(!l)return;const c=g.view.type;c!==X.current&&(X.current=c,S(c),fetch(K,{method:"POST",headers:{"Content-Type":"application/json"},credentials:"include",body:JSON.stringify({viewId:$,preferences:{agendaPrefs:{viewMode:"calendar",calendarView:c}}})}).catch(()=>{}))},eventClick:g=>{const c=g.event.extendedProps._raw;M(c),L(!0)},dateClick:g=>{const c=new Date(g.dateStr);c.setMinutes(Math.round(c.getMinutes()/5)*5,0,0),D(c.toISOString()),M(null),L(!0)},eventDrop:async g=>{var G,Q;const c=g.event.id,O=(G=g.event.start)==null?void 0:G.toISOString(),W=(Q=g.event.end)==null?void 0:Q.toISOString();try{await fetch(`${R}/${c}/drag`,{method:"PATCH",headers:{"Content-Type":"application/json"},credentials:"include",body:JSON.stringify({newStart:O,newEnd:W})}),await Y()}catch(de){console.error("[RecordAgenda] Drag error:",de),g.revert()}},eventResize:async g=>{var G,Q;const c=g.event.id,O=(G=g.event.start)==null?void 0:G.toISOString(),W=(Q=g.event.end)==null?void 0:Q.toISOString();try{await fetch(`${R}/${c}/drag`,{method:"PATCH",headers:{"Content-Type":"application/json"},credentials:"include",body:JSON.stringify({newStart:O,newEnd:W})}),await Y()}catch(de){console.error("[RecordAgenda] Resize error:",de),g.revert()}},eventDidMount:g=>{var W;const c=g.event.extendedProps;let O=g.event.title;c.lieu&&(O+=`
📍 ${c.lieu}`),c.status&&(O+=`
● ${c.status}`),(W=c.tags)!=null&&W.length&&(O+=`
🏷 ${c.tags.join(", ")}`),g.el.title=O}});return u.render(),z.current=u,requestAnimationFrame(()=>{l=!0}),()=>{z.current&&(z.current.destroy(),z.current=null)}},[T,A,j,R,Y,K,$]),i.useEffect(()=>{if(!z.current)return;const n=z.current;n.removeAllEvents(),n.addEventSource(te)},[te]);const oe=i.useCallback(async n=>{try{k("");const{createTask:l,taskListId:u,...w}=n,g=await fetch(R,{method:"POST",headers:{"Content-Type":"application/json"},credentials:"include",body:JSON.stringify(w)}),c=await g.json().catch(()=>({}));if(!g.ok||!c.success)throw new Error(c.error||c.message||"Impossible de creer l'evenement.");if(l&&u)try{await fetch(`/account/${t}/api/task-lists/${u}/tasks`,{method:"POST",headers:{"Content-Type":"application/json"},credentials:"include",body:JSON.stringify({title:w.title||"Nouvelle tâche",status:"À faire",startDate:w.date||null,dueDate:w.endDate||w.date||null})})}catch(O){console.warn("[RecordAgenda] Task creation error (non-blocking):",O)}await Y(),L(!1),M(null),D(null)}catch(l){throw console.error("[RecordAgenda] Create error:",l),k(l.message||"Impossible de creer l'evenement."),l}},[R,Y,t]),se=i.useCallback(async(n,l)=>{try{k("");const u=await fetch(`${R}/${n}`,{method:"PATCH",headers:{"Content-Type":"application/json"},credentials:"include",body:JSON.stringify(l)}),w=await u.json().catch(()=>({}));if(!u.ok||!w.success)throw new Error(w.error||w.message||"Impossible de mettre a jour l'evenement.");await Y(),L(!1),M(null)}catch(u){throw console.error("[RecordAgenda] Update error:",u),k(u.message||"Impossible de mettre a jour l'evenement."),u}},[R,Y]),a=i.useCallback(async n=>{if(confirm("Supprimer cet événement ?"))try{k("");const l=await fetch(`${R}/${n}`,{method:"DELETE",credentials:"include"}),u=await l.json().catch(()=>({}));if(!l.ok||!u.success)throw new Error(u.error||u.message||"Impossible de supprimer l'evenement.");await Y(),L(!1),M(null)}catch(l){console.error("[RecordAgenda] Delete error:",l),k(l.message||"Impossible de supprimer l'evenement.")}},[R,Y]),b=i.useCallback(()=>{M(null),D(null),L(!0)},[]),I=i.useCallback(n=>{M(n),L(!0)},[]);return i.useEffect(()=>{if(A||!j||d.length===0)return;const n=new URLSearchParams(window.location.search),l=n.get("event")||n.get("eventId")||n.get("openEvent");if(!l||q.current===l)return;const u=d.find(w=>String(w._id||"")===l);u&&(q.current=l,M(u),L(!0))},[d,A,j]),A||!j?e.jsxs("div",{className:"ra-loading",children:[e.jsx("div",{className:"ra-spinner"}),e.jsx("span",{children:"Chargement de l'agenda..."})]}):e.jsxs("div",{className:"ra-container",children:[e.jsx("style",{children:Pe()}),e.jsx(ve,{viewMode:T,onViewChange:U,onNewEvent:b,eventCount:d.length}),s&&e.jsxs("div",{className:"ra-error-banner",children:[e.jsx("span",{children:s}),e.jsx("button",{type:"button",onClick:()=>k(""),"aria-label":"Fermer",children:e.jsxs("svg",{width:"14",height:"14",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",children:[e.jsx("line",{x1:"18",y1:"6",x2:"6",y2:"18"}),e.jsx("line",{x1:"6",y1:"6",x2:"18",y2:"18"})]})})]}),T==="calendar"&&e.jsx("div",{className:"ra-calendar-wrap",children:e.jsx("div",{ref:F,className:"ra-calendar"})}),T==="timeline"&&e.jsx(Ee,{events:d,entityData:h,onEventClick:I,getStatusInfo:Z,getCustomFieldValue:V}),T==="list"&&e.jsx(Me,{events:d,entityData:h,onEventClick:I,onDeleteEvent:a,getStatusInfo:Z,getCustomFieldValue:V}),d.length===0&&!A&&e.jsxs("div",{className:"ra-empty",children:[e.jsx("div",{className:"ra-empty-icon",children:e.jsxs("svg",{width:"48",height:"48",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"1.5",children:[e.jsx("rect",{x:"3",y:"4",width:"18",height:"18",rx:"2",ry:"2"}),e.jsx("line",{x1:"16",y1:"2",x2:"16",y2:"6"}),e.jsx("line",{x1:"8",y1:"2",x2:"8",y2:"6"}),e.jsx("line",{x1:"3",y1:"10",x2:"21",y2:"10"}),e.jsx("line",{x1:"10",y1:"14",x2:"14",y2:"18"}),e.jsx("line",{x1:"14",y1:"14",x2:"10",y2:"18"})]})}),e.jsx("h3",{children:"Aucun événement"}),e.jsx("p",{children:"Ajoutez votre premier événement pour commencer à organiser votre agenda."}),e.jsxs("button",{className:"ra-empty-btn",onClick:b,children:[e.jsxs("svg",{width:"16",height:"16",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",children:[e.jsx("line",{x1:"12",y1:"5",x2:"12",y2:"19"}),e.jsx("line",{x1:"5",y1:"12",x2:"19",y2:"12"})]}),"Nouvel événement"]})]}),e.jsx(Ie,{isOpen:y,onClose:()=>{L(!1),M(null),D(null)},event:J,entityData:h,prefillDate:B,onCreate:oe,onUpdate:se,onDelete:a,getCustomFieldValue:V,getStatusInfo:Z,accountNumber:t,taskLists:P,recordId:x})]})}function Re(t){return(Array.isArray(t)?t:typeof t=="string"?t.split(","):[]).map(r=>r&&typeof r=="object"?String(r.label||r.value||r.name||"").trim():String(r||"").trim()).filter(Boolean)}function Pe(){return`
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
`}function be(){document.querySelectorAll('[data-island="record-agenda"]').forEach(t=>{if(t.dataset.mounted==="1")return;t.dataset.mounted="1";const x={accountNumber:t.dataset.accountNumber,recordId:t.dataset.recordId,entitySlug:t.dataset.entitySlug};console.log("[RecordAgenda Island] Mounting:",x),ye(t).render(e.jsx(ke.StrictMode,{children:e.jsx($e,{...x})}))})}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",be):be();
