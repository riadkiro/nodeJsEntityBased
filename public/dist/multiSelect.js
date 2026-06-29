import{r,j as s,c as Q,R as X}from"./chunks/client-CMp6iiqo.js";const Z=["#f3f4f6","#fecaca","#fed7aa","#fef08a","#bbf7d0","#a7f3d0","#99f6e4","#a5f3fc","#bae6fd","#c7d2fe","#ddd6fe","#e9d5ff","#fbcfe8","#fda4af","#f97316","#eab308","#22c55e","#06b6d4","#3b82f6","#6366f1","#8b5cf6","#a855f7","#ec4899","#ef4444",null];function H(a){if(!a||a==="transparent")return"#374151";const u=parseInt(a.slice(1,3),16),m=parseInt(a.slice(3,5),16),p=parseInt(a.slice(5,7),16);return(u*299+m*587+p*114)/1e3>155?"#374151":"#ffffff"}function z(a){return a.color?{background:a.color,color:H(a.color)}:{background:"#f3f4f6",color:"#374151"}}function ee({name:a,options:u,selected:m,placeholder:p,createUrl:d,deleteUrl:x,updateUrl:k,accountNumber:ae,classificationId:f,multiple:b,creatable:I,editable:K,colors:$,onChange:B,containerEl:V}){const[h,y]=r.useState(u),[v,j]=r.useState(m),[g,U]=r.useState(!1),[n,O]=r.useState(""),[o,S]=r.useState(null),[E,T]=r.useState(""),[D,P]=r.useState(null),_=r.useRef(null),L=r.useRef(null),w=r.useRef(null),N=r.useMemo(()=>v.map(e=>h.find(t=>t._id===e)).filter(Boolean),[v,h]),M=r.useMemo(()=>{const e=h.filter(l=>!v.includes(l._id));if(!n.trim())return e;const t=n.toLowerCase();return e.filter(l=>l.label.toLowerCase().includes(t))},[h,v,n]),C=r.useMemo(()=>n.trim()?h.some(e=>e.label.toLowerCase()===n.toLowerCase()):!0,[h,n]);r.useEffect(()=>{function e(t){_.current&&!_.current.contains(t.target)&&(U(!1),S(null))}return document.addEventListener("mousedown",e),()=>document.removeEventListener("mousedown",e)},[]),r.useEffect(()=>{g&&L.current&&L.current.focus()},[g]),r.useEffect(()=>{o&&w.current&&(w.current.focus(),w.current.select())},[o]);const c=r.useCallback(e=>{B&&B(e),V&&V.dispatchEvent(new CustomEvent("multiselect:change",{bubbles:!0,detail:{name:a,selectedIds:e}}))},[B,V,a]),J=r.useCallback(e=>{j(t=>{let l;return t.includes(e)?l=t.filter(i=>i!==e):(l=b?[...t,e]:[e],b||U(!1)),c(l),l}),O("")},[b,c]),q=r.useCallback(e=>{j(t=>{const l=t.filter(i=>i!==e);return c(l),l})},[c]),A=r.useCallback(async()=>{const e=n.trim();if(!(!e||C)){if(d)try{const l=await(await fetch(d,{method:"POST",headers:{"Content-Type":"application/json"},credentials:"include",body:JSON.stringify({classificationId:f,label:e})})).json();l.success&&l.option&&(y(i=>[...i,l.option]),j(i=>{const Y=b?[...i,l.option._id]:[l.option._id];return c(Y),Y}))}catch(t){console.error("[MultiSelect] Create error:",t)}else{const t={_id:"tmp_"+Date.now(),label:e,color:null};y(l=>[...l,t]),j(l=>{const i=b?[...l,t._id]:[t._id];return c(i),i})}O("")}},[n,C,d,f,b,c]),F=r.useCallback((e,t)=>{t.stopPropagation(),S(e),T(e.label),P(e.color||null)},[]),W=r.useCallback(async()=>{if(!o)return;const e={...o,label:E,color:D};if(k)try{await fetch(k,{method:"POST",headers:{"Content-Type":"application/json"},credentials:"include",body:JSON.stringify({classificationId:f,optionId:o._id,label:E,color:D})})}catch(t){console.error("[MultiSelect] Update error:",t)}y(t=>t.map(l=>l._id===o._id?e:l)),S(null)},[o,E,D,k,f]),G=r.useCallback(async e=>{if(x)try{await fetch(x,{method:"POST",headers:{"Content-Type":"application/json"},credentials:"include",body:JSON.stringify({classificationId:f,optionId:e})})}catch(t){console.error("[MultiSelect] Delete error:",t)}y(t=>t.filter(l=>l._id!==e)),j(t=>{const l=t.filter(i=>i!==e);return c(l),l}),S(null)},[x,f,c]);return s.jsxDEV("div",{className:"ms-island",ref:_,children:[v.map(e=>s.jsxDEV("input",{type:"hidden",name:a,value:e},e,!1,{fileName:"C:/Users/pc/Documents/dexapp/dexapp/Backend/src/islands/multi-select/MultiSelectIsland.jsx",lineNumber:250,columnNumber:17},this)),s.jsxDEV("div",{className:`ms-trigger ${g?"ms-trigger--open":""}`,onClick:()=>U(!g),children:[s.jsxDEV("div",{className:"ms-tags",children:[N.length===0&&s.jsxDEV("span",{className:"ms-placeholder",children:p},void 0,!1,{fileName:"C:/Users/pc/Documents/dexapp/dexapp/Backend/src/islands/multi-select/MultiSelectIsland.jsx",lineNumber:260,columnNumber:25},this),N.map(e=>s.jsxDEV("span",{className:"ms-tag",style:z(e),children:[s.jsxDEV("span",{className:"ms-tag-label",children:e.label},void 0,!1,{fileName:"C:/Users/pc/Documents/dexapp/dexapp/Backend/src/islands/multi-select/MultiSelectIsland.jsx",lineNumber:268,columnNumber:29},this),s.jsxDEV("button",{className:"ms-tag-remove",onClick:t=>{t.stopPropagation(),q(e._id)},style:{color:H(e.color||"#f3f4f6")},children:"×"},void 0,!1,{fileName:"C:/Users/pc/Documents/dexapp/dexapp/Backend/src/islands/multi-select/MultiSelectIsland.jsx",lineNumber:269,columnNumber:29},this)]},e._id,!0,{fileName:"C:/Users/pc/Documents/dexapp/dexapp/Backend/src/islands/multi-select/MultiSelectIsland.jsx",lineNumber:263,columnNumber:25},this))]},void 0,!0,{fileName:"C:/Users/pc/Documents/dexapp/dexapp/Backend/src/islands/multi-select/MultiSelectIsland.jsx",lineNumber:258,columnNumber:17},this),N.length>3&&s.jsxDEV("span",{className:"ms-more",children:["+",N.length-3]},void 0,!0,{fileName:"C:/Users/pc/Documents/dexapp/dexapp/Backend/src/islands/multi-select/MultiSelectIsland.jsx",lineNumber:280,columnNumber:21},this),s.jsxDEV("span",{className:"ms-arrow",children:s.jsxDEV("svg",{width:"10",height:"6",viewBox:"0 0 10 6",style:{transform:g?"rotate(180deg)":"none",transition:"transform 0.15s"},children:s.jsxDEV("path",{d:"M1 1L5 5L9 1",stroke:"currentColor",strokeWidth:"1.5",fill:"none",strokeLinecap:"round"},void 0,!1,{fileName:"C:/Users/pc/Documents/dexapp/dexapp/Backend/src/islands/multi-select/MultiSelectIsland.jsx",lineNumber:284,columnNumber:25},this)},void 0,!1,{fileName:"C:/Users/pc/Documents/dexapp/dexapp/Backend/src/islands/multi-select/MultiSelectIsland.jsx",lineNumber:283,columnNumber:21},this)},void 0,!1,{fileName:"C:/Users/pc/Documents/dexapp/dexapp/Backend/src/islands/multi-select/MultiSelectIsland.jsx",lineNumber:282,columnNumber:17},this)]},void 0,!0,{fileName:"C:/Users/pc/Documents/dexapp/dexapp/Backend/src/islands/multi-select/MultiSelectIsland.jsx",lineNumber:254,columnNumber:13},this),g&&s.jsxDEV("div",{className:"ms-dropdown",children:[N.length>0&&s.jsxDEV("div",{className:"ms-dropdown-selected",children:N.map(e=>s.jsxDEV("span",{className:"ms-tag ms-tag--sm",style:z(e),children:s.jsxDEV("span",{className:"ms-tag-label",children:e.label},void 0,!1,{fileName:"C:/Users/pc/Documents/dexapp/dexapp/Backend/src/islands/multi-select/MultiSelectIsland.jsx",lineNumber:301,columnNumber:37},this)},e._id,!1,{fileName:"C:/Users/pc/Documents/dexapp/dexapp/Backend/src/islands/multi-select/MultiSelectIsland.jsx",lineNumber:296,columnNumber:33},this))},void 0,!1,{fileName:"C:/Users/pc/Documents/dexapp/dexapp/Backend/src/islands/multi-select/MultiSelectIsland.jsx",lineNumber:294,columnNumber:25},this),s.jsxDEV("div",{className:"ms-search",children:s.jsxDEV("input",{ref:L,type:"text",value:n,onChange:e=>O(e.target.value),onKeyDown:e=>{e.key==="Enter"&&(e.preventDefault(),M.length>0?J(M[0]._id):I&&!C&&A())},placeholder:p,className:"ms-search-input"},void 0,!1,{fileName:"C:/Users/pc/Documents/dexapp/dexapp/Backend/src/islands/multi-select/MultiSelectIsland.jsx",lineNumber:309,columnNumber:25},this)},void 0,!1,{fileName:"C:/Users/pc/Documents/dexapp/dexapp/Backend/src/islands/multi-select/MultiSelectIsland.jsx",lineNumber:308,columnNumber:21},this),s.jsxDEV("div",{className:"ms-options",children:[M.map(e=>s.jsxDEV("div",{className:"ms-option",onClick:()=>J(e._id),children:[s.jsxDEV("span",{className:"ms-option-pill",style:z(e),children:e.label},void 0,!1,{fileName:"C:/Users/pc/Documents/dexapp/dexapp/Backend/src/islands/multi-select/MultiSelectIsland.jsx",lineNumber:337,columnNumber:33},this),K&&s.jsxDEV("button",{className:"ms-option-edit",onClick:t=>F(e,t),title:"Paramètres",children:"···"},void 0,!1,{fileName:"C:/Users/pc/Documents/dexapp/dexapp/Backend/src/islands/multi-select/MultiSelectIsland.jsx",lineNumber:341,columnNumber:37},this)]},e._id,!0,{fileName:"C:/Users/pc/Documents/dexapp/dexapp/Backend/src/islands/multi-select/MultiSelectIsland.jsx",lineNumber:332,columnNumber:29},this)),I&&n.trim()&&!C&&s.jsxDEV("div",{className:"ms-create",onClick:A,children:[s.jsxDEV("span",{className:"ms-create-label",children:"Créer"},void 0,!1,{fileName:"C:/Users/pc/Documents/dexapp/dexapp/Backend/src/islands/multi-select/MultiSelectIsland.jsx",lineNumber:355,columnNumber:33},this),s.jsxDEV("span",{className:"ms-create-pill",children:n.trim()},void 0,!1,{fileName:"C:/Users/pc/Documents/dexapp/dexapp/Backend/src/islands/multi-select/MultiSelectIsland.jsx",lineNumber:356,columnNumber:33},this),s.jsxDEV("svg",{width:"12",height:"12",viewBox:"0 0 12 12",style:{marginLeft:"auto",opacity:.4},children:s.jsxDEV("path",{d:"M6 1v10M1 6h10",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"},void 0,!1,{fileName:"C:/Users/pc/Documents/dexapp/dexapp/Backend/src/islands/multi-select/MultiSelectIsland.jsx",lineNumber:358,columnNumber:37},this)},void 0,!1,{fileName:"C:/Users/pc/Documents/dexapp/dexapp/Backend/src/islands/multi-select/MultiSelectIsland.jsx",lineNumber:357,columnNumber:33},this)]},void 0,!0,{fileName:"C:/Users/pc/Documents/dexapp/dexapp/Backend/src/islands/multi-select/MultiSelectIsland.jsx",lineNumber:354,columnNumber:29},this),M.length===0&&(n.trim()?C:!0)&&!I&&s.jsxDEV("div",{className:"ms-empty",children:"Aucune option"},void 0,!1,{fileName:"C:/Users/pc/Documents/dexapp/dexapp/Backend/src/islands/multi-select/MultiSelectIsland.jsx",lineNumber:365,columnNumber:29},this)]},void 0,!0,{fileName:"C:/Users/pc/Documents/dexapp/dexapp/Backend/src/islands/multi-select/MultiSelectIsland.jsx",lineNumber:330,columnNumber:21},this)]},void 0,!0,{fileName:"C:/Users/pc/Documents/dexapp/dexapp/Backend/src/islands/multi-select/MultiSelectIsland.jsx",lineNumber:291,columnNumber:17},this),o&&s.jsxDEV("div",{className:"ms-edit-popover",onClick:e=>e.stopPropagation(),children:[s.jsxDEV("input",{ref:w,type:"text",value:E,onChange:e=>T(e.target.value),onKeyDown:e=>{e.key==="Enter"&&W()},className:"ms-edit-input"},void 0,!1,{fileName:"C:/Users/pc/Documents/dexapp/dexapp/Backend/src/islands/multi-select/MultiSelectIsland.jsx",lineNumber:374,columnNumber:21},this),$&&s.jsxDEV("div",{className:"ms-color-grid",children:Z.map((e,t)=>s.jsxDEV("button",{className:`ms-color-dot ${D===e?"ms-color-dot--active":""}`,style:{background:e||"#fff",border:e?D===e?"2px solid #4361ee":"2px solid transparent":"2px dashed #d1d5db"},onClick:()=>P(e),title:e||"Sans couleur",children:!e&&s.jsxDEV("span",{style:{fontSize:10,color:"#9ca3af"},children:"⊘"},void 0,!1,{fileName:"C:/Users/pc/Documents/dexapp/dexapp/Backend/src/islands/multi-select/MultiSelectIsland.jsx",lineNumber:395,columnNumber:44},this)},t,!1,{fileName:"C:/Users/pc/Documents/dexapp/dexapp/Backend/src/islands/multi-select/MultiSelectIsland.jsx",lineNumber:385,columnNumber:33},this))},void 0,!1,{fileName:"C:/Users/pc/Documents/dexapp/dexapp/Backend/src/islands/multi-select/MultiSelectIsland.jsx",lineNumber:383,columnNumber:25},this),s.jsxDEV("div",{className:"ms-edit-actions",children:[s.jsxDEV("button",{className:"ms-edit-save",onClick:W,children:"Enregistrer"},void 0,!1,{fileName:"C:/Users/pc/Documents/dexapp/dexapp/Backend/src/islands/multi-select/MultiSelectIsland.jsx",lineNumber:401,columnNumber:25},this),s.jsxDEV("button",{className:"ms-edit-delete",onClick:()=>G(o._id),children:[s.jsxDEV("svg",{width:"14",height:"14",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",children:s.jsxDEV("path",{d:"M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"},void 0,!1,{fileName:"C:/Users/pc/Documents/dexapp/dexapp/Backend/src/islands/multi-select/MultiSelectIsland.jsx",lineNumber:406,columnNumber:33},this)},void 0,!1,{fileName:"C:/Users/pc/Documents/dexapp/dexapp/Backend/src/islands/multi-select/MultiSelectIsland.jsx",lineNumber:405,columnNumber:29},this),"Supprimer"]},void 0,!0,{fileName:"C:/Users/pc/Documents/dexapp/dexapp/Backend/src/islands/multi-select/MultiSelectIsland.jsx",lineNumber:404,columnNumber:25},this)]},void 0,!0,{fileName:"C:/Users/pc/Documents/dexapp/dexapp/Backend/src/islands/multi-select/MultiSelectIsland.jsx",lineNumber:400,columnNumber:21},this)]},void 0,!0,{fileName:"C:/Users/pc/Documents/dexapp/dexapp/Backend/src/islands/multi-select/MultiSelectIsland.jsx",lineNumber:373,columnNumber:17},this),s.jsxDEV("style",{dangerouslySetInnerHTML:{__html:se}},void 0,!1,{fileName:"C:/Users/pc/Documents/dexapp/dexapp/Backend/src/islands/multi-select/MultiSelectIsland.jsx",lineNumber:415,columnNumber:13},this)]},void 0,!0,{fileName:"C:/Users/pc/Documents/dexapp/dexapp/Backend/src/islands/multi-select/MultiSelectIsland.jsx",lineNumber:247,columnNumber:9},this)}const se=`
.ms-island {
    position: relative;
    font-family: 'Inter', -apple-system, sans-serif;
    font-size: 13px;
}

/* Trigger (main clickable area) */
.ms-trigger {
    display: flex;
    align-items: center;
    gap: 6px;
    min-height: 36px;
    padding: 4px 8px 4px 6px;
    border: 1.5px solid #e5e7eb;
    border-radius: 8px;
    cursor: pointer;
    background: #fff;
    transition: all 0.15s;
}
.dark .ms-trigger { background: #1b2e4b; border-color: #253b5c; }
.ms-trigger:hover { border-color: #c7d2fe; }
.ms-trigger--open { border-color: #4361ee; box-shadow: 0 0 0 3px rgba(67,97,238,0.1); }
.dark .ms-trigger--open { border-color: #4361ee; }

.ms-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    flex: 1;
    min-height: 24px;
    align-items: center;
}
.ms-placeholder {
    color: #9ca3af;
    font-size: 12px;
    user-select: none;
}
.ms-arrow {
    color: #9ca3af;
    flex-shrink: 0;
    display: flex;
    align-items: center;
}
.ms-more {
    font-size: 11px;
    color: #6b7280;
    background: #f3f4f6;
    padding: 1px 6px;
    border-radius: 4px;
    flex-shrink: 0;
}
.dark .ms-more { background: #253b5c; color: #94a3b8; }

/* Tag pill */
.ms-tag {
    display: inline-flex;
    align-items: center;
    gap: 3px;
    padding: 2px 8px;
    border-radius: 6px;
    font-size: 12px;
    font-weight: 500;
    line-height: 1.4;
    white-space: nowrap;
    user-select: none;
    transition: opacity 0.1s;
}
.ms-tag:hover { opacity: 0.85; }
.ms-tag--sm {
    padding: 1px 6px;
    font-size: 11px;
    border-radius: 4px;
}
.ms-tag-label { pointer-events: none; }
.ms-tag-remove {
    border: none;
    background: none;
    cursor: pointer;
    font-size: 14px;
    line-height: 1;
    padding: 0 1px;
    opacity: 0.6;
    transition: opacity 0.1s;
}
.ms-tag-remove:hover { opacity: 1; }

/* Dropdown */
.ms-dropdown {
    position: absolute;
    top: calc(100% + 4px);
    left: 0;
    right: 0;
    z-index: 50;
    background: #fff;
    border: 1px solid #e5e7eb;
    border-radius: 10px;
    box-shadow: 0 8px 30px rgba(0,0,0,0.12);
    overflow: hidden;
    animation: ms-slide-in 0.12s ease-out;
    min-width: 220px;
}
.dark .ms-dropdown { background: #0e1726; border-color: #253b5c; box-shadow: 0 8px 30px rgba(0,0,0,0.4); }
@keyframes ms-slide-in {
    from { opacity: 0; transform: translateY(-4px); }
    to { opacity: 1; transform: translateY(0); }
}

.ms-dropdown-selected {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    padding: 10px 12px 6px;
}

/* Search */
.ms-search {
    padding: 6px 12px 8px;
}
.ms-search-input {
    width: 100%;
    padding: 6px 10px;
    border: 1.5px solid #e5e7eb;
    border-radius: 6px;
    font-size: 12px;
    background: #f9fafb;
    outline: none;
    transition: all 0.15s;
    color: inherit;
}
.dark .ms-search-input { background: #1b2e4b; border-color: #253b5c; color: #e0e6ed; }
.ms-search-input:focus { border-color: #4361ee; background: #fff; }
.dark .ms-search-input:focus { background: #0e1726; }
.ms-search-input::placeholder { color: #9ca3af; }

/* Options */
.ms-options {
    max-height: 200px;
    overflow-y: auto;
    padding: 4px 0;
}
.ms-option {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 5px 12px;
    cursor: pointer;
    transition: background 0.1s;
}
.ms-option:hover { background: rgba(67,97,238,0.04); }
.dark .ms-option:hover { background: rgba(67,97,238,0.1); }
.ms-option-pill {
    display: inline-block;
    padding: 2px 10px;
    border-radius: 6px;
    font-size: 12px;
    font-weight: 500;
}
.ms-option-edit {
    border: none;
    background: none;
    cursor: pointer;
    color: #9ca3af;
    font-size: 16px;
    letter-spacing: -1px;
    padding: 2px 4px;
    border-radius: 4px;
    opacity: 0;
    transition: all 0.1s;
}
.ms-option:hover .ms-option-edit { opacity: 1; }
.ms-option-edit:hover { background: #f3f4f6; color: #4361ee; }
.dark .ms-option-edit:hover { background: #1b2e4b; }

/* Create row */
.ms-create {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    cursor: pointer;
    transition: background 0.1s;
    border-top: 1px solid #f3f4f6;
}
.dark .ms-create { border-color: #1b2e4b; }
.ms-create:hover { background: rgba(67,97,238,0.04); }
.ms-create-label {
    font-size: 12px;
    color: #6b7280;
}
.ms-create-pill {
    display: inline-block;
    padding: 2px 8px;
    border-radius: 4px;
    background: #e5e7eb;
    font-size: 12px;
    font-weight: 500;
    color: #374151;
}
.dark .ms-create-pill { background: #253b5c; color: #e0e6ed; }

.ms-empty {
    padding: 16px 12px;
    text-align: center;
    font-size: 12px;
    color: #9ca3af;
}

/* Edit Popover */
.ms-edit-popover {
    position: absolute;
    top: calc(100% + 4px);
    right: -10px;
    z-index: 60;
    background: #fff;
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    box-shadow: 0 12px 40px rgba(0,0,0,0.15);
    padding: 12px;
    width: 240px;
    animation: ms-slide-in 0.12s ease-out;
}
.dark .ms-edit-popover { background: #0e1726; border-color: #253b5c; }

.ms-edit-input {
    width: 100%;
    padding: 6px 10px;
    border: 1.5px solid #e5e7eb;
    border-radius: 6px;
    font-size: 12px;
    font-weight: 500;
    margin-bottom: 10px;
    outline: none;
    color: inherit;
    background: #fff;
}
.dark .ms-edit-input { background: #1b2e4b; border-color: #253b5c; color: #e0e6ed; }
.ms-edit-input:focus { border-color: #4361ee; }

/* Color grid */
.ms-color-grid {
    display: grid;
    grid-template-columns: repeat(8, 1fr);
    gap: 4px;
    margin-bottom: 10px;
}
.ms-color-dot {
    width: 22px;
    height: 22px;
    border-radius: 50%;
    cursor: pointer;
    transition: transform 0.1s, box-shadow 0.1s;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0;
}
.ms-color-dot:hover { transform: scale(1.15); }
.ms-color-dot--active { box-shadow: 0 0 0 2px #fff, 0 0 0 4px #4361ee !important; }

/* Edit actions */
.ms-edit-actions {
    display: flex;
    align-items: center;
    gap: 8px;
    border-top: 1px solid #f3f4f6;
    padding-top: 8px;
}
.dark .ms-edit-actions { border-color: #1b2e4b; }
.ms-edit-save {
    flex: 1;
    padding: 5px 10px;
    border: none;
    border-radius: 6px;
    background: #4361ee;
    color: #fff;
    font-size: 11px;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.15s;
}
.ms-edit-save:hover { background: #3651d4; }
.ms-edit-delete {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 5px 10px;
    border: none;
    border-radius: 6px;
    background: #fef2f2;
    color: #dc2626;
    font-size: 11px;
    font-weight: 500;
    cursor: pointer;
    transition: background 0.15s;
}
.dark .ms-edit-delete { background: #450a0a; color: #fca5a5; }
.ms-edit-delete:hover { background: #fee2e2; }
.dark .ms-edit-delete:hover { background: #7f1d1d; }
`;function R(){document.querySelectorAll('[data-island="multi-select"]').forEach(a=>{if(a.dataset.mounted==="1")return;a.dataset.mounted="1";let u=[];try{u=JSON.parse(a.dataset.options||"[]")}catch{}let m=[];try{m=JSON.parse(a.dataset.selected||"[]")}catch{}const p={name:a.dataset.name||"tags",options:u,selected:m,placeholder:a.dataset.placeholder||"Rechercher ou ajouter...",createUrl:a.dataset.createUrl||"",deleteUrl:a.dataset.deleteUrl||"",updateUrl:a.dataset.updateUrl||"",accountNumber:a.dataset.accountNumber||"",classificationId:a.dataset.classificationId||"",multiple:a.dataset.multiple!=="false",creatable:a.dataset.creatable!=="false",editable:a.dataset.editable!=="false",colors:a.dataset.colors!=="false",onChange:null},d=a.dataset.callback;d&&typeof window[d]=="function"&&(p.onChange=window[d]);const x=Q(a);x.render(s.jsxDEV(X.StrictMode,{children:s.jsxDEV(ee,{...p,containerEl:a},void 0,!1,{fileName:"C:/Users/pc/Documents/dexapp/dexapp/Backend/src/islands/multi-select/entry.jsx",lineNumber:47,columnNumber:17},this)},void 0,!1,{fileName:"C:/Users/pc/Documents/dexapp/dexapp/Backend/src/islands/multi-select/entry.jsx",lineNumber:46,columnNumber:13},this)),a._multiSelectRoot=x})}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",R):R();const te=new MutationObserver(R);te.observe(document.body,{childList:!0,subtree:!0});
