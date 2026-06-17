import{j as e,r as l,c as ge,R as me}from"./chunks/client-CkWOIrXP.js";function be({viewMode:t,onViewChange:h,onNewEvent:a,eventCount:d}){const u=[{key:"calendar",icon:"M3 4h18M3 10h18M3 16h18",label:"Calendrier"},{key:"timeline",icon:"M12 2v20M2 12h20",label:"Timeline"},{key:"list",icon:"M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01",label:"Liste"}];return e.jsxs("div",{className:"ra-toolbar",children:[e.jsx("style",{children:we()}),e.jsx("div",{className:"ra-toolbar-left",children:e.jsxs("div",{className:"ra-view-pills",children:[u.map(f=>e.jsxs("button",{className:`ra-vpill ${t===f.key?"active":""}`,onClick:()=>h(f.key),children:[e.jsx("svg",{width:"14",height:"14",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",children:e.jsx("path",{d:f.icon})}),f.label]},f.key)),e.jsx("span",{className:"ra-vpill-count",children:d})]})}),e.jsx("div",{className:"ra-toolbar-right",children:e.jsxs("button",{className:"ra-new-event-btn",onClick:a,children:[e.jsxs("svg",{width:"16",height:"16",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2.5",children:[e.jsx("line",{x1:"12",y1:"5",x2:"12",y2:"19"}),e.jsx("line",{x1:"5",y1:"12",x2:"19",y2:"12"})]}),"Nouvel événement"]})})]})}function we(){return`
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
`}const ye=[{value:"consultation",label:"Consultation",color:"#4361ee"},{value:"reunion",label:"Réunion",color:"#8b5cf6"},{value:"rappel",label:"Rappel",color:"#f59e0b"},{value:"tache",label:"Tâche",color:"#10b981"},{value:"personnel",label:"Personnel",color:"#ec4899"},{value:"autre",label:"Autre",color:"#6b7280"}],ve=[{label:"Important",value:"Important",color:"#ef4444"},{label:"Date limite",value:"Date limite",color:"#f59e0b"},{label:"Risque amende",value:"Risque amende",color:"#dc2626"}],V="#64748b",le=["#4361ee","#8b5cf6","#f59e0b","#10b981","#ec4899","#64748b"],ke="widget_prochains_evenements",je="widget_date_importante";function Se({isOpen:t,onClose:h,event:a,entityData:d,prefillDate:u,onCreate:f,onUpdate:D,onDelete:L,getCustomFieldValue:C,getStatusInfo:A,accountNumber:g}){var K,re,Z,Q;const[s,b]=l.useState({title:"",date:"",endDate:"",duration:30,type:"consultation",tags:[],lieu:"",notes:"",statusOptionId:"",showInUpcomingWidget:!0,isImportantDate:!1}),[S,T]=l.useState(!1),[I,p]=l.useState(""),[O,k]=l.useState({type:[],status:[],tags:[]}),[y,E]=l.useState({type:[],status:[],tags:[]}),W=!!a;l.useEffect(()=>{var i,r,o,c,j;if(t)if(p(""),a){A(a);const x=(a.classificationValues||[]).find(w=>{var M,P,Y;return((M=w.classificationId)==null?void 0:M.toString())===((Y=(P=d==null?void 0:d.statusClassification)==null?void 0:P._id)==null?void 0:Y.toString())}),m=ae(C(a,"tags_evenement"));b({title:a.title||"",date:a.date?ne(new Date(a.date)):"",endDate:a.end_date?ne(new Date(a.end_date)):"",duration:C(a,"duree_evenement")||30,type:C(a,"type_evenement")||"consultation",tags:m,lieu:C(a,"lieu_evenement")||"",notes:C(a,"notes_evenement")||"",statusOptionId:((i=x==null?void 0:x.optionId)==null?void 0:i.toString())||"",showInUpcomingWidget:de(C(a,ke),!0),isImportantDate:de(C(a,je),m.some(w=>w.toLowerCase()==="date importante"))})}else{let x="";if(u){const w=new Date(u);isNaN(w.getTime())?x=u+"T09:00":(w.setMinutes(Math.round(w.getMinutes()/5)*5,0,0),x=ne(w))}else{const w=new Date;w.setMinutes(Math.ceil(w.getMinutes()/5)*5,0,0),x=ne(w)}const m=((j=(c=(o=(r=d==null?void 0:d.statusClassification)==null?void 0:r.options)==null?void 0:o[0])==null?void 0:c._id)==null?void 0:j.toString())||"";b({title:"",date:x,endDate:"",duration:30,type:"consultation",tags:[],lieu:"",notes:"",statusOptionId:m,showInUpcomingWidget:!0,isImportantDate:!1})}},[t,a,u,d,C,A]);const N=l.useCallback((i,r)=>{p(""),b(o=>({...o,[i]:r}))},[]),U=l.useCallback(async()=>{if(s.title.trim()){T(!0),p("");try{const i=fe(s.date,"Date");let r=s.endDate?fe(s.endDate,"Date de fin").toISOString():void 0;!r&&i&&s.duration&&(r=new Date(i.getTime()+(parseInt(s.duration)||30)*6e4).toISOString());const o={title:s.title.trim(),date:i?i.toISOString():void 0,endDate:r,duration:parseInt(s.duration)||30,type:s.type,tags:ae(s.tags),lieu:s.lieu,notes:s.notes,statusOptionId:s.statusOptionId||void 0,showInUpcomingWidget:!!s.showInUpcomingWidget,isImportantDate:!!s.isImportantDate};W?await D(a._id.toString(),o):await f(o)}catch(i){console.error("[EventModal] Save error:",i),p(i.message||"Impossible d'enregistrer cet evenement.")}finally{T(!1)}}},[s,W,a,f,D]),z=ce(d,"type_evenement"),R=ce(d,"tags_evenement"),_=(d==null?void 0:d.statusClassification)||null,$=((re=(K=_==null?void 0:_._id)==null?void 0:K.toString)==null?void 0:re.call(K))||(_==null?void 0:_._id)||"",J=ee([ye,((Z=z==null?void 0:z.type_config)==null?void 0:Z.options)||[],O.type,s.type?[{label:s.type,value:s.type,color:V}]:[]],y.type),q=ee([((_==null?void 0:_.options)||[]).map(pe),O.status,s.statusOptionId?[{label:"Statut",value:s.statusOptionId,color:V}]:[]],y.status),X=ee([ve,((Q=R==null?void 0:R.type_config)==null?void 0:Q.options)||[],O.tags,ae(s.tags).map(i=>({label:i,value:i}))],y.tags),n=(i,r)=>{k(o=>({...o,[i]:ee([o[i]||[],[r]])}))},v=(i,r)=>{E(o=>({...o,[i]:Ne(o[i]||[],r)}))},F=async(i,r,o)=>{var M,P;const c={label:o,value:o,color:ue(o)},j=((P=(M=r==null?void 0:r._id)==null?void 0:M.toString)==null?void 0:P.call(M))||(r==null?void 0:r._id);if(!g||!j)return n(i,c),c;const x=await fetch(`/account/${g}/field-template/api/${j}/add-option`,{method:"POST",headers:{"Content-Type":"application/json"},credentials:"include",body:JSON.stringify(c)}),m=await x.json().catch(()=>({}));if(!x.ok||!m.success)throw new Error(m.error||"Création impossible");const w=H(m.option||c);return n(i,w),w},B=async(i,r,o)=>{var x,m;const c=H(o);if(!c.value||!confirm(`Supprimer l'option "${c.label}" ?`))return!1;const j=((m=(x=r==null?void 0:r._id)==null?void 0:x.toString)==null?void 0:m.call(x))||(r==null?void 0:r._id);if(g&&j){const w=await fetch(`/account/${g}/field-template/api/${j}/delete-option`,{method:"POST",headers:{"Content-Type":"application/json"},credentials:"include",body:JSON.stringify({value:c.value,label:c.label})}),M=await w.json().catch(()=>({}));if(!w.ok||!M.success)throw new Error(M.error||"Suppression impossible")}return v(i,c),i==="type"&&oe(c,s.type)&&N("type",""),i==="tags"&&N("tags",ae(s.tags).filter(w=>!oe(c,w))),!0},G=async i=>{const r={label:i,value:i,color:ue(i)};if(!g||!$)return n("status",r),r;const o=await fetch(`/account/${g}/classification/api/fast-add`,{method:"POST",headers:{"Content-Type":"application/json"},credentials:"include",body:JSON.stringify({classificationId:$,label:i,color:r.color})}),c=await o.json().catch(()=>({}));if(!o.ok||!c.success)throw new Error(c.error||"Création impossible");const j=pe(c.option||r);return n("status",j),j},te=async i=>{const r=H(i);if(!r.value||!confirm(`Supprimer le statut "${r.label}" ?`))return!1;if(g&&$){const o=await fetch(`/account/${g}/classification/api/delete-option`,{method:"POST",headers:{"Content-Type":"application/json"},credentials:"include",body:JSON.stringify({classificationId:$,optionId:r.value})}),c=await o.json().catch(()=>({}));if(!o.ok||!c.success)throw new Error(c.error||"Suppression impossible")}return v("status",r),String(s.statusOptionId||"")===String(r.value||"")&&N("statusOptionId",""),!0};return t?e.jsxs("div",{className:"ra-modal-overlay",onClick:h,children:[e.jsxs("div",{className:"ra-modal",onClick:i=>i.stopPropagation(),children:[e.jsxs("div",{className:"ra-modal-header",children:[e.jsxs("div",{className:"ra-modal-header-left",children:[e.jsx("div",{className:"ra-modal-icon",children:e.jsxs("svg",{width:"18",height:"18",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",children:[e.jsx("rect",{x:"3",y:"4",width:"18",height:"18",rx:"2",ry:"2"}),e.jsx("line",{x1:"16",y1:"2",x2:"16",y2:"6"}),e.jsx("line",{x1:"8",y1:"2",x2:"8",y2:"6"}),e.jsx("line",{x1:"3",y1:"10",x2:"21",y2:"10"})]})}),e.jsx("h3",{children:W?"Modifier l'événement":"Nouvel événement"})]}),e.jsx("button",{className:"ra-modal-close",onClick:h,children:e.jsxs("svg",{width:"16",height:"16",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",children:[e.jsx("line",{x1:"18",y1:"6",x2:"6",y2:"18"}),e.jsx("line",{x1:"6",y1:"6",x2:"18",y2:"18"})]})})]}),e.jsxs("div",{className:"ra-modal-body",children:[e.jsxs("div",{className:"ra-field",children:[e.jsx("label",{className:"ra-label",children:"Titre"}),e.jsx("input",{type:"text",className:"ra-input",placeholder:"Ex: Consultation de suivi...",value:s.title,onChange:i=>N("title",i.target.value),autoFocus:!0})]}),e.jsxs("div",{className:"ra-field-row",children:[e.jsxs("div",{className:"ra-field",style:{flex:1},children:[e.jsx("label",{className:"ra-label",children:"Date & heure"}),e.jsx("input",{type:"datetime-local",className:"ra-input",step:"300",value:s.date,onChange:i=>N("date",i.target.value)})]}),e.jsxs("div",{className:"ra-field",style:{width:100},children:[e.jsx("label",{className:"ra-label",children:"Durée (min)"}),e.jsx("input",{type:"number",className:"ra-input",value:s.duration,onChange:i=>N("duration",i.target.value),min:"5",max:"480",step:"5"})]})]}),e.jsxs("div",{className:"ra-field",children:[e.jsx("label",{className:"ra-label",children:"Type"}),e.jsx(se,{value:s.type,options:J,onChange:i=>N("type",i),onCreateOption:i=>F("type",z,i),onDeleteOption:i=>B("type",z,i),placeholder:"Rechercher ou créer un type..."})]}),$&&e.jsxs("div",{className:"ra-field",children:[e.jsx("label",{className:"ra-label",children:"Statut"}),e.jsx(se,{value:s.statusOptionId,options:q,onChange:i=>N("statusOptionId",i),onCreateOption:G,onDeleteOption:te,placeholder:"Rechercher ou créer un statut..."})]}),e.jsxs("div",{className:"ra-field",children:[e.jsx("label",{className:"ra-label",children:"Étiquettes"}),e.jsx(se,{multiple:!0,value:s.tags,options:X,onChange:i=>N("tags",i),onCreateOption:i=>F("tags",R,i),onDeleteOption:i=>B("tags",R,i),placeholder:"Ajouter..."})]}),e.jsxs("div",{className:"ra-field",children:[e.jsx("label",{className:"ra-label",children:"Widget"}),e.jsxs("div",{className:"ra-widget-switches",children:[e.jsxs("label",{className:`ra-widget-switch ${s.showInUpcomingWidget?"active":""}`,children:[e.jsxs("span",{className:"ra-widget-switch-copy",children:[e.jsx("strong",{children:"Prochains événements"}),e.jsx("small",{children:"Afficher dans le widget agenda"})]}),e.jsxs("span",{className:"ra-switch",children:[e.jsx("input",{type:"checkbox",checked:!!s.showInUpcomingWidget,onChange:i=>N("showInUpcomingWidget",i.target.checked)}),e.jsx("span",{})]})]}),e.jsxs("label",{className:`ra-widget-switch ${s.isImportantDate?"active":""}`,children:[e.jsxs("span",{className:"ra-widget-switch-copy",children:[e.jsx("strong",{children:"Date importante"}),e.jsx("small",{children:"Afficher dans le widget dates importantes"})]}),e.jsxs("span",{className:"ra-switch",children:[e.jsx("input",{type:"checkbox",checked:!!s.isImportantDate,onChange:i=>N("isImportantDate",i.target.checked)}),e.jsx("span",{})]})]})]})]}),e.jsxs("div",{className:"ra-field",children:[e.jsx("label",{className:"ra-label",children:"Lieu"}),e.jsx("input",{type:"text",className:"ra-input",placeholder:"Cabinet, Salle A, Domicile...",value:s.lieu,onChange:i=>N("lieu",i.target.value)})]}),e.jsxs("div",{className:"ra-field",children:[e.jsx("label",{className:"ra-label",children:"Notes"}),e.jsx("textarea",{className:"ra-input ra-textarea",placeholder:"Notes additionnelles...",rows:3,value:s.notes,onChange:i=>N("notes",i.target.value)})]}),I&&e.jsx("div",{className:"ra-modal-error",role:"alert",children:I})]}),e.jsxs("div",{className:"ra-modal-footer",children:[W&&e.jsxs("button",{className:"ra-delete-btn",onClick:()=>L(a._id.toString()),type:"button",children:[e.jsxs("svg",{width:"14",height:"14",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",children:[e.jsx("polyline",{points:"3 6 5 6 21 6"}),e.jsx("path",{d:"M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"})]}),"Supprimer"]}),e.jsxs("div",{className:"ra-modal-footer-right",children:[e.jsx("button",{className:"ra-cancel-btn",onClick:h,type:"button",children:"Annuler"}),e.jsx("button",{className:"ra-save-btn",onClick:U,disabled:S||!s.title.trim(),type:"button",children:S?"Enregistrement...":W?"Mettre à jour":"Créer"})]})]})]}),e.jsx("style",{children:Ce()})]}):null}function se({value:t,options:h,onChange:a,onCreateOption:d,onDeleteOption:u,multiple:f=!1,placeholder:D="Ajouter..."}){const[L,C]=l.useState(""),[A,g]=l.useState(!1),[s,b]=l.useState(!1),[S,T]=l.useState(!1),[I,p]=l.useState(null),O=l.useRef(null),k=l.useRef(null),y=l.useMemo(()=>{if(f)return he(t);const n=t==null?"":String(t).trim();return n?[n]:[]},[f,t]),E=l.useMemo(()=>ee([h,y.map(n=>({label:n,value:n}))]),[h,y]),W=l.useMemo(()=>y.map(n=>E.find(v=>oe(v,n))||{label:n,value:n,color:V}),[E,y]),N=L.trim().toLowerCase(),U=l.useMemo(()=>E.filter(n=>!y.some(v=>oe(n,v))).filter(n=>N?String(n.label||"").toLowerCase().includes(N)||String(n.value||"").toLowerCase().includes(N):!0).slice(0,8),[E,y,N]),z=l.useMemo(()=>N?E.some(n=>String(n.label||"").trim().toLowerCase()===N||String(n.value||"").trim().toLowerCase()===N):!1,[E,N]);l.useEffect(()=>{const n=F=>{!O.current||O.current.contains(F.target)||(g(!1),p(null),C(""))},v=F=>{F.key==="Escape"&&(g(!1),p(null),C(""))};return document.addEventListener("mousedown",n),document.addEventListener("keydown",v),()=>{document.removeEventListener("mousedown",n),document.removeEventListener("keydown",v)}},[]);const R=l.useCallback(n=>{const v=H(n);v.value&&(f?y.some(B=>B.toLowerCase()===String(v.value).toLowerCase())||a([...y,v.value]):(a(v.value),g(!1)),C(""),p(null),f&&g(!0),requestAnimationFrame(()=>{var F;return(F=k.current)==null?void 0:F.focus()}))},[f,a,y]),_=l.useCallback(n=>{a(f?y.filter(v=>v.toLowerCase()!==String(n).toLowerCase()):""),p(null),requestAnimationFrame(()=>{var v;return(v=k.current)==null?void 0:v.focus()})},[f,a,y]),$=l.useCallback(async()=>{const n=L.trim();if(!(!n||z||s)){b(!0);try{const v=await d(n);R(v||{label:n,value:n})}catch(v){console.error("[EventOptionSelect] Create option error:",v),window.showMessage?window.showMessage(v.message||"Création impossible","danger"):alert(v.message||"Création impossible")}finally{b(!1)}}},[s,z,d,L,R]),J=l.useCallback((n,v)=>{u&&(n.preventDefault(),n.stopPropagation(),p({x:n.clientX,y:n.clientY,option:H(v)}))},[u]),q=l.useCallback(async()=>{if(!(!(I!=null&&I.option)||!u||S)){T(!0);try{if(await u(I.option)===!1){p(null);return}_(I.option.value),p(null),g(!1)}catch(n){console.error("[EventOptionSelect] Delete option error:",n),window.showMessage?window.showMessage(n.message||"Suppression impossible","danger"):alert(n.message||"Suppression impossible")}finally{T(!1)}}},[I,S,u,_]),X=n=>{n.key==="Enter"?(n.preventDefault(),U.length>0?R(U[0]):$()):n.key==="Backspace"&&!L&&y.length>0?_(y[y.length-1]):n.key==="Escape"&&(g(!1),p(null),C(""))};return e.jsxs("div",{className:"ra-option-picker",ref:O,children:[e.jsxs("div",{className:`ra-option-control ${A?"open":""}`,onClick:()=>{var n;g(!0),(n=k.current)==null||n.focus()},children:[W.map(n=>e.jsxs("span",{className:"ra-option-pill",onContextMenu:v=>J(v,n),title:u?"Clic droit pour supprimer cette option":void 0,style:{"--option-c":n.color||V,background:`${n.color||V}12`,borderColor:`${n.color||V}35`,color:n.color||V},children:[e.jsx("span",{className:"ra-option-dot",style:{background:n.color||V}}),n.label,e.jsx("button",{type:"button",onClick:v=>{v.stopPropagation(),_(n.value)},"aria-label":`Retirer ${n.label}`,children:"×"})]},n.value)),e.jsx("input",{ref:k,className:"ra-option-input",value:L,onChange:n=>{C(n.target.value),g(!0)},onFocus:()=>g(!0),onKeyDown:X,placeholder:W.length?"Ajouter...":D})]}),A&&(U.length>0||L.trim()&&!z)&&e.jsxs("div",{className:"ra-option-menu",children:[U.map(n=>e.jsxs("button",{type:"button",className:"ra-option-item",onClick:()=>R(n),onContextMenu:v=>J(v,n),title:u?"Clic droit pour supprimer cette option":void 0,children:[e.jsx("span",{className:"ra-option-dot",style:{background:n.color||V}}),e.jsx("span",{children:n.label})]},n.value)),L.trim()&&!z&&e.jsxs("button",{type:"button",className:"ra-option-create",onClick:$,disabled:s,children:[e.jsx("span",{children:"+"}),s?"Création...":`Créer "${L.trim()}"`]})]}),I&&e.jsx("div",{className:"ra-option-context-menu",style:{left:I.x,top:I.y},children:e.jsx("button",{type:"button",onClick:q,disabled:S,children:S?"Suppression...":`Supprimer "${I.option.label}"`})})]})}function ce(t,h){return((t==null?void 0:t.customFields)||[]).find(a=>(a==null?void 0:a.name)===h)||null}function de(t,h=!1){if(t==null||t==="")return h;if(typeof t=="boolean")return t;if(typeof t=="number")return t!==0;const a=String(t).trim().toLowerCase();return["true","1","yes","oui","on"].includes(a)?!0:["false","0","no","non","off"].includes(a)?!1:h}function ae(t){return he(t)}function he(t){return(Array.isArray(t)?t:typeof t=="string"?t.split(","):[]).map(a=>a&&typeof a=="object"?String(a.value||a.label||a.name||"").trim():String(a||"").trim()).filter(Boolean).filter((a,d,u)=>u.findIndex(f=>f.toLowerCase()===a.toLowerCase())===d)}function H(t){var a,d;if(typeof t=="object"&&t){const u=t.id||((d=(a=t._id)==null?void 0:a.toString)==null?void 0:d.call(a))||t._id||"",f=String(t.label||t.value||t.name||u||"").trim(),D=String(t.value||u||t.label||"").trim();return{label:f,value:D,color:t.color||V,id:String(u||D)}}const h=String(t||"").trim();return{label:h,value:h,color:V,id:h}}function pe(t){var d,u;const h=H(t),a=(t==null?void 0:t.id)||((u=(d=t==null?void 0:t._id)==null?void 0:d.toString)==null?void 0:u.call(d))||(t==null?void 0:t._id)||h.value;return{...h,value:String(a||h.value||"").trim(),id:String(a||h.value||"").trim()}}function oe(t,h){const a=String(h||"").trim().toLowerCase();return[t.value,t.label,t.id].filter(d=>d!=null).some(d=>String(d).trim().toLowerCase()===a)}function ee(t,h=[]){const a=[],d=new Set,u=new Set((h||[]).map(f=>String(f||"").trim().toLowerCase()).filter(Boolean));return t.flat().forEach(f=>{const D=H(f);if(!D.value||[D.value,D.label,D.id].map(A=>String(A||"").trim().toLowerCase()).filter(Boolean).some(A=>u.has(A)))return;const C=String(D.value||D.label).toLowerCase();d.has(C)||(d.add(C),a.push(D))}),a}function Ne(t,h){const a=H(h),d=new Set((t||[]).map(u=>String(u||"").trim().toLowerCase()).filter(Boolean));return[a.value,a.label,a.id].map(u=>String(u||"").trim().toLowerCase()).filter(Boolean).forEach(u=>d.add(u)),[...d]}function ue(t){const a=[...String(t||"")].reduce((d,u)=>d+u.charCodeAt(0),0);return le[a%le.length]||V}function ne(t){const h=t.getFullYear(),a=String(t.getMonth()+1).padStart(2,"0"),d=String(t.getDate()).padStart(2,"0"),u=String(t.getHours()).padStart(2,"0"),f=String(t.getMinutes()).padStart(2,"0");return`${h}-${a}-${d}T${u}:${f}`}function fe(t,h){if(!t)return null;const a=new Date(t);if(Number.isNaN(a.getTime()))throw new Error(`${h} invalide.`);return a}function Ce(){return`
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
`}function Ie({events:t,entityData:h,onEventClick:a,getStatusInfo:d,getCustomFieldValue:u}){const f=l.useMemo(()=>{const g=[...t].sort((b,S)=>{const T=b.date?new Date(b.date).getTime():0,I=S.date?new Date(S.date).getTime():0;return T-I}),s={};return g.forEach(b=>{const T=(b.date?new Date(b.date):new Date).toISOString().split("T")[0];s[T]||(s[T]=[]),s[T].push(b)}),Object.entries(s).map(([b,S])=>({dateKey:b,date:new Date(b),items:S}))},[t]),D=g=>{const s=new Date,b=new Date(s);b.setDate(b.getDate()+1);const S=new Date(s);S.setDate(S.getDate()-1);const T=g.toISOString().split("T")[0];return T===s.toISOString().split("T")[0]?"Aujourd'hui":T===b.toISOString().split("T")[0]?"Demain":T===S.toISOString().split("T")[0]?"Hier":g.toLocaleDateString("fr-FR",{weekday:"long",day:"numeric",month:"long",year:"numeric"})},L=g=>g?new Date(g).toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit",hour12:!1}):"",C=g=>g?new Date(g)<new Date:!1,A=g=>g?new Date(g).toISOString().split("T")[0]===new Date().toISOString().split("T")[0]:!1;return t.length===0?null:e.jsxs("div",{className:"ra-timeline",children:[e.jsx("style",{children:De()}),f.map((g,s)=>e.jsxs("div",{className:"ra-tl-group",style:{animationDelay:`${s*80}ms`},children:[e.jsxs("div",{className:`ra-tl-date-header ${A(g.dateKey)?"today":""} ${C(g.dateKey)&&!A(g.dateKey)?"past":""}`,children:[e.jsx("div",{className:"ra-tl-date-dot"}),e.jsx("span",{className:"ra-tl-date-label",children:D(g.date)}),e.jsxs("span",{className:"ra-tl-date-count",children:[g.items.length," événement",g.items.length>1?"s":""]})]}),e.jsx("div",{className:"ra-tl-items",children:g.items.map((b,S)=>{var E;const T=d(b),I=u(b,"lieu_evenement"),p=u(b,"duree_evenement"),O=u(b,"type_evenement"),k=Te(u(b,"tags_evenement")),y=C(b.date);return e.jsxs("div",{className:`ra-tl-item ${y?"past":""}`,style:{animationDelay:`${s*80+S*50}ms`},onClick:()=>a(b),children:[e.jsx("div",{className:"ra-tl-time",children:L(b.date)}),e.jsxs("div",{className:"ra-tl-connector",children:[e.jsx("div",{className:"ra-tl-line"}),e.jsx("div",{className:"ra-tl-node",style:{borderColor:T.color,background:`${T.color}20`}}),e.jsx("div",{className:"ra-tl-line"})]}),e.jsxs("div",{className:"ra-tl-card",children:[e.jsx("div",{className:"ra-tl-card-accent",style:{background:T.color}}),e.jsxs("div",{className:"ra-tl-card-body",children:[e.jsxs("div",{className:"ra-tl-card-top",children:[e.jsx("h4",{className:"ra-tl-card-title",children:b.title||"Sans titre"}),e.jsx("span",{className:"ra-tl-status",style:{background:`${T.color}15`,color:T.color},children:T.label})]}),e.jsxs("div",{className:"ra-tl-card-meta",children:[p&&e.jsxs("span",{className:"ra-tl-meta-item",children:[e.jsxs("svg",{width:"12",height:"12",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",children:[e.jsx("circle",{cx:"12",cy:"12",r:"10"}),e.jsx("polyline",{points:"12 6 12 12 16 14"})]}),p," min"]}),I&&e.jsxs("span",{className:"ra-tl-meta-item",children:[e.jsxs("svg",{width:"12",height:"12",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",children:[e.jsx("path",{d:"M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"}),e.jsx("circle",{cx:"12",cy:"10",r:"3"})]}),I]}),O&&e.jsxs("span",{className:"ra-tl-meta-item",children:[e.jsxs("svg",{width:"12",height:"12",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",children:[e.jsx("path",{d:"M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"}),e.jsx("line",{x1:"7",y1:"7",x2:"7.01",y2:"7"})]}),O.charAt(0).toUpperCase()+O.slice(1)]})]}),k.length>0&&e.jsx("div",{className:"ra-tl-tags",children:k.map(W=>e.jsx("span",{className:"ra-tl-tag",children:W},W))})]})]})]},(E=b._id)==null?void 0:E.toString())})})]},g.dateKey))]})}function Te(t){return(Array.isArray(t)?t:typeof t=="string"?t.split(","):[]).map(a=>String(a||"").trim()).filter(Boolean)}function De(){return`
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
`}function Oe({events:t,entityData:h,onEventClick:a,onDeleteEvent:d,getStatusInfo:u,getCustomFieldValue:f}){const[D,L]=l.useState("date"),[C,A]=l.useState("asc"),g=l.useMemo(()=>[...t].sort((p,O)=>{let k,y;switch(D){case"title":return k=(p.title||"").toLowerCase(),y=(O.title||"").toLowerCase(),C==="asc"?k.localeCompare(y):y.localeCompare(k);case"status":return k=u(p).label,y=u(O).label,C==="asc"?k.localeCompare(y):y.localeCompare(k);case"type":return k=f(p,"type_evenement")||"",y=f(O,"type_evenement")||"",C==="asc"?k.localeCompare(y):y.localeCompare(k);case"date":default:return k=p.date?new Date(p.date).getTime():0,y=O.date?new Date(O.date).getTime():0,C==="asc"?k-y:y-k}}),[t,D,C,u,f]),s=p=>{D===p?A(O=>O==="asc"?"desc":"asc"):(L(p),A("asc"))},b=p=>p?new Date(p).toLocaleDateString("fr-FR",{day:"2-digit",month:"short",year:"numeric"}):"—",S=p=>p?new Date(p).toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit",hour12:!1}):"",T=p=>p&&new Date(p)<new Date,I=({field:p})=>e.jsx("svg",{width:"10",height:"10",viewBox:"0 0 10 10",fill:"none",style:{opacity:D===p?1:.3},children:e.jsx("path",{d:D===p&&C==="desc"?"M5 2L8 6H2L5 2Z":"M5 8L2 4H8L5 8Z",fill:"currentColor"})});return t.length===0?null:e.jsxs("div",{className:"ra-list-wrap",children:[e.jsx("style",{children:_e()}),e.jsxs("table",{className:"ra-list-table",children:[e.jsx("thead",{children:e.jsxs("tr",{children:[e.jsxs("th",{className:"ra-th ra-th-sortable",onClick:()=>s("title"),children:["Titre ",e.jsx(I,{field:"title"})]}),e.jsxs("th",{className:"ra-th ra-th-sortable",onClick:()=>s("date"),children:["Date ",e.jsx(I,{field:"date"})]}),e.jsx("th",{className:"ra-th",children:"Heure"}),e.jsx("th",{className:"ra-th",children:"Durée"}),e.jsxs("th",{className:"ra-th ra-th-sortable",onClick:()=>s("type"),children:["Type ",e.jsx(I,{field:"type"})]}),e.jsx("th",{className:"ra-th",children:"Étiquettes"}),e.jsx("th",{className:"ra-th",children:"Lieu"}),e.jsxs("th",{className:"ra-th ra-th-sortable",onClick:()=>s("status"),children:["Statut ",e.jsx(I,{field:"status"})]}),e.jsx("th",{className:"ra-th",style:{width:40}})]})}),e.jsx("tbody",{children:g.map((p,O)=>{var z;const k=u(p),y=f(p,"type_evenement"),E=Ee(f(p,"tags_evenement")),W=f(p,"lieu_evenement"),N=f(p,"duree_evenement"),U=T(p.date);return e.jsxs("tr",{className:`ra-tr ${U?"past":""}`,onClick:()=>a(p),style:{animationDelay:`${O*30}ms`},children:[e.jsxs("td",{className:"ra-td ra-td-title",children:[e.jsx("div",{className:"ra-td-title-dot",style:{background:k.color}}),p.title||"Sans titre"]}),e.jsx("td",{className:"ra-td",children:b(p.date)}),e.jsx("td",{className:"ra-td ra-td-time",children:S(p.date)}),e.jsx("td",{className:"ra-td",children:N?`${N} min`:"—"}),e.jsx("td",{className:"ra-td ra-td-type",children:y?e.jsx("span",{className:"ra-td-type-badge",children:y.charAt(0).toUpperCase()+y.slice(1)}):"—"}),e.jsx("td",{className:"ra-td ra-td-tags",children:E.length>0?E.map(R=>e.jsx("span",{className:"ra-list-tag",children:R},R)):"—"}),e.jsx("td",{className:"ra-td",children:W||"—"}),e.jsx("td",{className:"ra-td",children:e.jsx("span",{className:"ra-td-status",style:{background:`${k.color}12`,color:k.color},children:k.label})}),e.jsx("td",{className:"ra-td ra-td-actions",children:e.jsx("button",{className:"ra-td-delete",onClick:R=>{var _;R.stopPropagation(),d((_=p._id)==null?void 0:_.toString())},title:"Supprimer",children:e.jsxs("svg",{width:"14",height:"14",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",children:[e.jsx("polyline",{points:"3 6 5 6 21 6"}),e.jsx("path",{d:"M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"})]})})})]},(z=p._id)==null?void 0:z.toString())})})]})]})}function Ee(t){return(Array.isArray(t)?t:typeof t=="string"?t.split(","):[]).map(a=>String(a||"").trim()).filter(Boolean)}function _e(){return`
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
`}function Me({accountNumber:t,recordId:h,entitySlug:a}){const[d,u]=l.useState([]),[f,D]=l.useState(null),[L,C]=l.useState(!0),[A,g]=l.useState(!1),[s,b]=l.useState(""),[S,T]=l.useState("calendar"),[I,p]=l.useState("dayGridMonth"),[O,k]=l.useState(!1),[y,E]=l.useState(null),[W,N]=l.useState(null),U=l.useRef(null),z=l.useRef(null),R=l.useRef(""),_=`agenda-${h}`,$=`/account/${t}/api/records/${h}/events`,J=`/account/${t}/api/user/view-preferences`;l.useEffect(()=>{(async()=>{var r;try{const c=await(await fetch(`${J}/${_}`,{credentials:"include"})).json();if(c.success&&((r=c.preferences)!=null&&r.agendaPrefs)){const j=c.preferences.agendaPrefs;j.viewMode&&T(j.viewMode),j.calendarView&&p(j.calendarView)}}catch{}g(!0)})()},[J,_]);const q=l.useCallback(async r=>{try{const o={viewMode:S,calendarView:I,...r};await fetch(J,{method:"POST",headers:{"Content-Type":"application/json"},credentials:"include",body:JSON.stringify({viewId:_,preferences:{agendaPrefs:o}})})}catch(o){console.warn("[RecordAgenda] Prefs save error:",o)}},[J,_,S,I]),X=l.useCallback(r=>{T(r),q({viewMode:r})},[q]),n=l.useCallback((r,o)=>{if(!r||!f)return null;const c=(f.customFields||[]).find(x=>x.name===o);if(!c)return null;const j=(r.customFields||[]).find(x=>{var w,M;const m=((w=x.field_id)==null?void 0:w._id)||x.field_id;return(m==null?void 0:m.toString())===((M=c._id)==null?void 0:M.toString())});return j?j.value:null},[f]),v=l.useCallback(r=>{if(!r||!(f!=null&&f.statusClassification))return{label:"Planifié",color:"#3b82f6"};const o=f.statusClassification,c=(r.classificationValues||[]).find(x=>{var m,w;return((m=x.classificationId)==null?void 0:m.toString())===((w=o._id)==null?void 0:w.toString())});if(!c)return{label:"Planifié",color:"#3b82f6"};const j=(o.options||[]).find(x=>{var m,w;return((m=x._id)==null?void 0:m.toString())===((w=c.optionId)==null?void 0:w.toString())});return j?{label:j.label,color:j.color||"#3b82f6"}:{label:"Planifié",color:"#3b82f6"}},[f]),F=l.useMemo(()=>d.map(r=>{var Y;const o=v(r),c=n(r,"duree_evenement"),j=n(r,"lieu_evenement"),x=n(r,"type_evenement"),m=n(r,"notes_evenement"),w=ze(n(r,"tags_evenement"));let M=r.date?new Date(r.date):new Date,P=r.end_date?new Date(r.end_date):null;return!P&&c?P=new Date(M.getTime()+(parseInt(c)||30)*6e4):P||(P=new Date(M.getTime()+30*6e4)),{id:(Y=r._id)==null?void 0:Y.toString(),title:r.title||"Sans titre",start:M.toISOString(),end:P.toISOString(),backgroundColor:o.color,borderColor:o.color,textColor:"#fff",extendedProps:{_raw:r,status:o.label,statusColor:o.color,duration:c,lieu:j,type:x,notes:m,tags:w}}}),[d,v,n]),B=l.useCallback(async()=>{try{const r=await fetch($,{credentials:"include"}),o=await r.json().catch(()=>({}));r.ok&&o.success?(u(o.events||[]),D(o.entityData||null),b("")):(u([]),D(o.entityData||null),b(o.error||o.message||"Impossible de charger les evenements."))}catch(r){console.error("[RecordAgenda] Fetch error:",r),b("Impossible de charger les evenements.")}C(!1)},[$]);l.useEffect(()=>{B()},[B]);const G=l.useRef(I);G.current=I;const te=l.useRef(F);te.current=F,l.useEffect(()=>{var j;if(S!=="calendar"||L||!A||!U.current)return;if(typeof FullCalendar>"u"){console.error("[RecordAgenda] FullCalendar not loaded");return}const r=(j=z.current)==null?void 0:j.getDate();z.current&&z.current.destroy();let o=!1;const c=new FullCalendar.Calendar(U.current,{initialView:G.current,initialDate:r||void 0,locale:"fr",headerToolbar:{left:"prev,next today",center:"title",right:"dayGridMonth,timeGridWeek,timeGridDay"},buttonText:{today:"Aujourd'hui",month:"Mois",week:"Semaine",day:"Jour"},editable:!0,dayMaxEvents:3,selectable:!0,droppable:!1,nowIndicator:!0,slotMinTime:"07:00:00",slotMaxTime:"21:00:00",slotDuration:"00:15:00",snapDuration:"00:05:00",allDaySlot:!1,height:"100%",expandRows:!0,eventTimeFormat:{hour:"2-digit",minute:"2-digit",meridiem:!1,hour12:!1},events:te.current,datesSet:x=>{if(!o)return;const m=x.view.type;m!==G.current&&(G.current=m,p(m),fetch(J,{method:"POST",headers:{"Content-Type":"application/json"},credentials:"include",body:JSON.stringify({viewId:_,preferences:{agendaPrefs:{viewMode:"calendar",calendarView:m}}})}).catch(()=>{}))},eventClick:x=>{const m=x.event.extendedProps._raw;E(m),k(!0)},dateClick:x=>{const m=new Date(x.dateStr);m.setMinutes(Math.round(m.getMinutes()/5)*5,0,0),N(m.toISOString()),E(null),k(!0)},eventDrop:async x=>{var P,Y;const m=x.event.id,w=(P=x.event.start)==null?void 0:P.toISOString(),M=(Y=x.event.end)==null?void 0:Y.toISOString();try{await fetch(`${$}/${m}/drag`,{method:"PATCH",headers:{"Content-Type":"application/json"},credentials:"include",body:JSON.stringify({newStart:w,newEnd:M})}),await B()}catch(ie){console.error("[RecordAgenda] Drag error:",ie),x.revert()}},eventResize:async x=>{var P,Y;const m=x.event.id,w=(P=x.event.start)==null?void 0:P.toISOString(),M=(Y=x.event.end)==null?void 0:Y.toISOString();try{await fetch(`${$}/${m}/drag`,{method:"PATCH",headers:{"Content-Type":"application/json"},credentials:"include",body:JSON.stringify({newStart:w,newEnd:M})}),await B()}catch(ie){console.error("[RecordAgenda] Resize error:",ie),x.revert()}},eventDidMount:x=>{var M;const m=x.event.extendedProps;let w=x.event.title;m.lieu&&(w+=`
📍 ${m.lieu}`),m.status&&(w+=`
● ${m.status}`),(M=m.tags)!=null&&M.length&&(w+=`
🏷 ${m.tags.join(", ")}`),x.el.title=w}});return c.render(),z.current=c,requestAnimationFrame(()=>{o=!0}),()=>{z.current&&(z.current.destroy(),z.current=null)}},[S,L,A,$,B,J,_]),l.useEffect(()=>{if(!z.current)return;const r=z.current;r.removeAllEvents(),r.addEventSource(F)},[F]);const K=l.useCallback(async r=>{try{b("");const o=await fetch($,{method:"POST",headers:{"Content-Type":"application/json"},credentials:"include",body:JSON.stringify(r)}),c=await o.json().catch(()=>({}));if(!o.ok||!c.success)throw new Error(c.error||c.message||"Impossible de creer l'evenement.");await B(),k(!1),E(null),N(null)}catch(o){throw console.error("[RecordAgenda] Create error:",o),b(o.message||"Impossible de creer l'evenement."),o}},[$,B]),re=l.useCallback(async(r,o)=>{try{b("");const c=await fetch(`${$}/${r}`,{method:"PATCH",headers:{"Content-Type":"application/json"},credentials:"include",body:JSON.stringify(o)}),j=await c.json().catch(()=>({}));if(!c.ok||!j.success)throw new Error(j.error||j.message||"Impossible de mettre a jour l'evenement.");await B(),k(!1),E(null)}catch(c){throw console.error("[RecordAgenda] Update error:",c),b(c.message||"Impossible de mettre a jour l'evenement."),c}},[$,B]),Z=l.useCallback(async r=>{if(confirm("Supprimer cet événement ?"))try{b("");const o=await fetch(`${$}/${r}`,{method:"DELETE",credentials:"include"}),c=await o.json().catch(()=>({}));if(!o.ok||!c.success)throw new Error(c.error||c.message||"Impossible de supprimer l'evenement.");await B(),k(!1),E(null)}catch(o){console.error("[RecordAgenda] Delete error:",o),b(o.message||"Impossible de supprimer l'evenement.")}},[$,B]),Q=l.useCallback(()=>{E(null),N(null),k(!0)},[]),i=l.useCallback(r=>{E(r),k(!0)},[]);return l.useEffect(()=>{if(L||!A||d.length===0)return;const r=new URLSearchParams(window.location.search),o=r.get("event")||r.get("eventId")||r.get("openEvent");if(!o||R.current===o)return;const c=d.find(j=>String(j._id||"")===o);c&&(R.current=o,E(c),k(!0))},[d,L,A]),L||!A?e.jsxs("div",{className:"ra-loading",children:[e.jsx("div",{className:"ra-spinner"}),e.jsx("span",{children:"Chargement de l'agenda..."})]}):e.jsxs("div",{className:"ra-container",children:[e.jsx("style",{children:Le()}),e.jsx(be,{viewMode:S,onViewChange:X,onNewEvent:Q,eventCount:d.length}),s&&e.jsxs("div",{className:"ra-error-banner",children:[e.jsx("span",{children:s}),e.jsx("button",{type:"button",onClick:()=>b(""),"aria-label":"Fermer",children:e.jsxs("svg",{width:"14",height:"14",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",children:[e.jsx("line",{x1:"18",y1:"6",x2:"6",y2:"18"}),e.jsx("line",{x1:"6",y1:"6",x2:"18",y2:"18"})]})})]}),S==="calendar"&&e.jsx("div",{className:"ra-calendar-wrap",children:e.jsx("div",{ref:U,className:"ra-calendar"})}),S==="timeline"&&e.jsx(Ie,{events:d,entityData:f,onEventClick:i,getStatusInfo:v,getCustomFieldValue:n}),S==="list"&&e.jsx(Oe,{events:d,entityData:f,onEventClick:i,onDeleteEvent:Z,getStatusInfo:v,getCustomFieldValue:n}),d.length===0&&!L&&e.jsxs("div",{className:"ra-empty",children:[e.jsx("div",{className:"ra-empty-icon",children:e.jsxs("svg",{width:"48",height:"48",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"1.5",children:[e.jsx("rect",{x:"3",y:"4",width:"18",height:"18",rx:"2",ry:"2"}),e.jsx("line",{x1:"16",y1:"2",x2:"16",y2:"6"}),e.jsx("line",{x1:"8",y1:"2",x2:"8",y2:"6"}),e.jsx("line",{x1:"3",y1:"10",x2:"21",y2:"10"}),e.jsx("line",{x1:"10",y1:"14",x2:"14",y2:"18"}),e.jsx("line",{x1:"14",y1:"14",x2:"10",y2:"18"})]})}),e.jsx("h3",{children:"Aucun événement"}),e.jsx("p",{children:"Ajoutez votre premier événement pour commencer à organiser votre agenda."}),e.jsxs("button",{className:"ra-empty-btn",onClick:Q,children:[e.jsxs("svg",{width:"16",height:"16",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",children:[e.jsx("line",{x1:"12",y1:"5",x2:"12",y2:"19"}),e.jsx("line",{x1:"5",y1:"12",x2:"19",y2:"12"})]}),"Nouvel événement"]})]}),e.jsx(Se,{isOpen:O,onClose:()=>{k(!1),E(null),N(null)},event:y,entityData:f,prefillDate:W,onCreate:K,onUpdate:re,onDelete:Z,getCustomFieldValue:n,getStatusInfo:v,accountNumber:t})]})}function ze(t){return(Array.isArray(t)?t:typeof t=="string"?t.split(","):[]).map(a=>a&&typeof a=="object"?String(a.label||a.value||a.name||"").trim():String(a||"").trim()).filter(Boolean)}function Le(){return`
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
`}function xe(){document.querySelectorAll('[data-island="record-agenda"]').forEach(t=>{if(t.dataset.mounted==="1")return;t.dataset.mounted="1";const h={accountNumber:t.dataset.accountNumber,recordId:t.dataset.recordId,entitySlug:t.dataset.entitySlug};console.log("[RecordAgenda Island] Mounting:",h),ge(t).render(e.jsx(me.StrictMode,{children:e.jsx(Me,{...h})}))})}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",xe):xe();
