import{r as a,j as t,c as Q,R as X}from"./chunks/client-CkWOIrXP.js";const Z=["#f3f4f6","#fecaca","#fed7aa","#fef08a","#bbf7d0","#a7f3d0","#99f6e4","#a5f3fc","#bae6fd","#c7d2fe","#ddd6fe","#e9d5ff","#fbcfe8","#fda4af","#f97316","#eab308","#22c55e","#06b6d4","#3b82f6","#6366f1","#8b5cf6","#a855f7","#ec4899","#ef4444",null];function V(o){if(!o||o==="transparent")return"#374151";const u=parseInt(o.slice(1,3),16),f=parseInt(o.slice(3,5),16),p=parseInt(o.slice(5,7),16);return(u*299+f*587+p*114)/1e3>155?"#374151":"#ffffff"}function D(o){return o.color?{background:o.color,color:V(o.color)}:{background:"#f3f4f6",color:"#374151"}}function ee({name:o,options:u,selected:f,placeholder:p,createUrl:c,deleteUrl:m,updateUrl:y,accountNumber:oe,classificationId:x,multiple:b,creatable:L,editable:$,colors:q,onChange:z,containerEl:M}){const[g,N]=a.useState(u),[v,w]=a.useState(f),[h,R]=a.useState(!1),[n,T]=a.useState(""),[d,S]=a.useState(null),[O,B]=a.useState(""),[j,A]=a.useState(null),I=a.useRef(null),P=a.useRef(null),E=a.useRef(null),k=a.useMemo(()=>v.map(e=>g.find(s=>s._id===e)).filter(Boolean),[v,g]),_=a.useMemo(()=>{const e=g.filter(r=>!v.includes(r._id));if(!n.trim())return e;const s=n.toLowerCase();return e.filter(r=>r.label.toLowerCase().includes(s))},[g,v,n]),C=a.useMemo(()=>n.trim()?g.some(e=>e.label.toLowerCase()===n.toLowerCase()):!0,[g,n]);a.useEffect(()=>{function e(s){I.current&&!I.current.contains(s.target)&&(R(!1),S(null))}return document.addEventListener("mousedown",e),()=>document.removeEventListener("mousedown",e)},[]),a.useEffect(()=>{h&&P.current&&P.current.focus()},[h]),a.useEffect(()=>{d&&E.current&&(E.current.focus(),E.current.select())},[d]);const l=a.useCallback(e=>{z&&z(e),M&&M.dispatchEvent(new CustomEvent("multiselect:change",{bubbles:!0,detail:{name:o,selectedIds:e}}))},[z,M,o]),W=a.useCallback(e=>{w(s=>{let r;return s.includes(e)?r=s.filter(i=>i!==e):(r=b?[...s,e]:[e],b||R(!1)),l(r),r}),T("")},[b,l]),U=a.useCallback(e=>{w(s=>{const r=s.filter(i=>i!==e);return l(r),r})},[l]),Y=a.useCallback(async()=>{const e=n.trim();if(!(!e||C)){if(c)try{const r=await(await fetch(c,{method:"POST",headers:{"Content-Type":"application/json"},credentials:"include",body:JSON.stringify({classificationId:x,label:e})})).json();r.success&&r.option&&(N(i=>[...i,r.option]),w(i=>{const K=b?[...i,r.option._id]:[r.option._id];return l(K),K}))}catch(s){console.error("[MultiSelect] Create error:",s)}else{const s={_id:"tmp_"+Date.now(),label:e,color:null};N(r=>[...r,s]),w(r=>{const i=b?[...r,s._id]:[s._id];return l(i),i})}T("")}},[n,C,c,x,b,l]),F=a.useCallback((e,s)=>{s.stopPropagation(),S(e),B(e.label),A(e.color||null)},[]),H=a.useCallback(async()=>{if(!d)return;const e={...d,label:O,color:j};if(y)try{await fetch(y,{method:"POST",headers:{"Content-Type":"application/json"},credentials:"include",body:JSON.stringify({classificationId:x,optionId:d._id,label:O,color:j})})}catch(s){console.error("[MultiSelect] Update error:",s)}N(s=>s.map(r=>r._id===d._id?e:r)),S(null)},[d,O,j,y,x]),G=a.useCallback(async e=>{if(m)try{await fetch(m,{method:"POST",headers:{"Content-Type":"application/json"},credentials:"include",body:JSON.stringify({classificationId:x,optionId:e})})}catch(s){console.error("[MultiSelect] Delete error:",s)}N(s=>s.filter(r=>r._id!==e)),w(s=>{const r=s.filter(i=>i!==e);return l(r),r}),S(null)},[m,x,l]);return t.jsxs("div",{className:"ms-island",ref:I,children:[v.map(e=>t.jsx("input",{type:"hidden",name:o,value:e},e)),t.jsxs("div",{className:`ms-trigger ${h?"ms-trigger--open":""}`,onClick:()=>R(!h),children:[t.jsxs("div",{className:"ms-tags",children:[k.length===0&&t.jsx("span",{className:"ms-placeholder",children:p}),k.map(e=>t.jsxs("span",{className:"ms-tag",style:D(e),children:[t.jsx("span",{className:"ms-tag-label",children:e.label}),t.jsx("button",{className:"ms-tag-remove",onClick:s=>{s.stopPropagation(),U(e._id)},style:{color:V(e.color||"#f3f4f6")},children:"×"})]},e._id))]}),k.length>3&&t.jsxs("span",{className:"ms-more",children:["+",k.length-3]}),t.jsx("span",{className:"ms-arrow",children:t.jsx("svg",{width:"10",height:"6",viewBox:"0 0 10 6",style:{transform:h?"rotate(180deg)":"none",transition:"transform 0.15s"},children:t.jsx("path",{d:"M1 1L5 5L9 1",stroke:"currentColor",strokeWidth:"1.5",fill:"none",strokeLinecap:"round"})})})]}),h&&t.jsxs("div",{className:"ms-dropdown",children:[k.length>0&&t.jsx("div",{className:"ms-dropdown-selected",children:k.map(e=>t.jsx("span",{className:"ms-tag ms-tag--sm",style:D(e),children:t.jsx("span",{className:"ms-tag-label",children:e.label})},e._id))}),t.jsx("div",{className:"ms-search",children:t.jsx("input",{ref:P,type:"text",value:n,onChange:e=>T(e.target.value),onKeyDown:e=>{e.key==="Enter"&&(e.preventDefault(),_.length>0?W(_[0]._id):L&&!C&&Y())},placeholder:p,className:"ms-search-input"})}),t.jsxs("div",{className:"ms-options",children:[_.map(e=>t.jsxs("div",{className:"ms-option",onClick:()=>W(e._id),children:[t.jsx("span",{className:"ms-option-pill",style:D(e),children:e.label}),$&&t.jsx("button",{className:"ms-option-edit",onClick:s=>F(e,s),title:"Paramètres",children:"···"})]},e._id)),L&&n.trim()&&!C&&t.jsxs("div",{className:"ms-create",onClick:Y,children:[t.jsx("span",{className:"ms-create-label",children:"Créer"}),t.jsx("span",{className:"ms-create-pill",children:n.trim()}),t.jsx("svg",{width:"12",height:"12",viewBox:"0 0 12 12",style:{marginLeft:"auto",opacity:.4},children:t.jsx("path",{d:"M6 1v10M1 6h10",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"})})]}),_.length===0&&(n.trim()?C:!0)&&!L&&t.jsx("div",{className:"ms-empty",children:"Aucune option"})]})]}),d&&t.jsxs("div",{className:"ms-edit-popover",onClick:e=>e.stopPropagation(),children:[t.jsx("input",{ref:E,type:"text",value:O,onChange:e=>B(e.target.value),onKeyDown:e=>{e.key==="Enter"&&H()},className:"ms-edit-input"}),q&&t.jsx("div",{className:"ms-color-grid",children:Z.map((e,s)=>t.jsx("button",{className:`ms-color-dot ${j===e?"ms-color-dot--active":""}`,style:{background:e||"#fff",border:e?j===e?"2px solid #4361ee":"2px solid transparent":"2px dashed #d1d5db"},onClick:()=>A(e),title:e||"Sans couleur",children:!e&&t.jsx("span",{style:{fontSize:10,color:"#9ca3af"},children:"⊘"})},s))}),t.jsxs("div",{className:"ms-edit-actions",children:[t.jsx("button",{className:"ms-edit-save",onClick:H,children:"Enregistrer"}),t.jsxs("button",{className:"ms-edit-delete",onClick:()=>G(d._id),children:[t.jsx("svg",{width:"14",height:"14",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",children:t.jsx("path",{d:"M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"})}),"Supprimer"]})]})]}),t.jsx("style",{dangerouslySetInnerHTML:{__html:te}})]})}const te=`
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
`;function J(){document.querySelectorAll('[data-island="multi-select"]').forEach(o=>{if(o.dataset.mounted==="1")return;o.dataset.mounted="1";let u=[];try{u=JSON.parse(o.dataset.options||"[]")}catch{}let f=[];try{f=JSON.parse(o.dataset.selected||"[]")}catch{}const p={name:o.dataset.name||"tags",options:u,selected:f,placeholder:o.dataset.placeholder||"Rechercher ou ajouter...",createUrl:o.dataset.createUrl||"",deleteUrl:o.dataset.deleteUrl||"",updateUrl:o.dataset.updateUrl||"",accountNumber:o.dataset.accountNumber||"",classificationId:o.dataset.classificationId||"",multiple:o.dataset.multiple!=="false",creatable:o.dataset.creatable!=="false",editable:o.dataset.editable!=="false",colors:o.dataset.colors!=="false",onChange:null},c=o.dataset.callback;c&&typeof window[c]=="function"&&(p.onChange=window[c]);const m=Q(o);m.render(t.jsx(X.StrictMode,{children:t.jsx(ee,{...p,containerEl:o})})),o._multiSelectRoot=m})}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",J):J();const se=new MutationObserver(J);se.observe(document.body,{childList:!0,subtree:!0});
