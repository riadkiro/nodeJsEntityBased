// Adds overview module to existing record-module.ejs
const fs=require('fs'),p=require('path');
const f=p.join(__dirname,'..','views','record','record-module.ejs');
let t=fs.readFileSync(f,'utf8');

// 1. Add overview to _modulesDef
t=t.replace(
  "fiche:  { icon: 'solar:card-bold-duotone', color: '#4361ee'",
  "overview: { icon: 'solar:widget-5-bold-duotone', color: '#6366f1', label: 'Overview', desc: \"Vue d'ensemble\" },\n  fiche:  { icon: 'solar:card-bold-duotone', color: '#4361ee'"
);

// 2. Add overview to nav pills array
t=t.replace(
  "{ key:'fiche', icon:'solar:card-bold-duotone', color:'#4361ee', label:'Fiche' },",
  "{ key:'overview', icon:'solar:widget-5-bold-duotone', color:'#6366f1', label:'Overview' },\n            { key:'fiche', icon:'solar:card-bold-duotone', color:'#4361ee', label:'Fiche' },"
);

// 3. Add overview count in hero
t=t.replace(
  "<% if (moduleName === 'fiche') { %>",
  "<% if (moduleName === 'overview') { %>\n                    <div class=\"rm-hero-count\"><%= _ficheFields.length %></div>\n                    <div class=\"rm-hero-count-label\">champs</div>\n                <% } else if (moduleName === 'fiche') { %>"
);

// 4. Insert overview section BEFORE the fiche section
const overviewHTML = `
    <!-- ═══ OVERVIEW MODULE ═══ -->
    <% if (moduleName === 'overview') { %>
    <div class="ov-grid">
        <!-- Left: Key Fields Card -->
        <div class="ov-card ov-card-fields">
            <div class="ov-card-header">
                <iconify-icon icon="solar:card-bold-duotone" width="18" style="color:#4361ee"></iconify-icon>
                <span>Informations clés</span>
                <a href="<%= _recBase %>/fiche" class="ov-card-link">Voir tout →</a>
            </div>
            <div class="ov-fields-list">
                <% _ficheFields.slice(0,6).forEach(function(f,i){ %>
                <div class="ov-field" style="animation-delay:<%= i*50 %>ms">
                    <div class="ov-field-icon" style="background:linear-gradient(135deg,<%= f.color||'#4361ee' %>12,<%= f.color||'#4361ee' %>06)">
                        <iconify-icon icon="<%= f.icon %>" width="16" style="color:<%= f.color||'#4361ee' %>"></iconify-icon>
                    </div>
                    <div class="ov-field-label"><%= f.label %></div>
                    <div class="ov-field-value"><%= f.value %></div>
                </div>
                <% }); %>
            </div>
        </div>

        <!-- Right column -->
        <div class="ov-right-col">
            <!-- Tasks summary -->
            <div class="ov-card ov-card-tasks">
                <div class="ov-card-header">
                    <iconify-icon icon="solar:checklist-minimalistic-bold-duotone" width="18" style="color:#10b981"></iconify-icon>
                    <span>Tâches</span>
                    <a href="<%= _recBase %>/tasks" class="ov-card-link">Voir tout →</a>
                </div>
                <div class="ov-tasks-chart">
                    <div class="ov-chart-bars">
                        <div class="ov-bar" style="--bar-h:60%;background:#10b981" title="Terminées: 3"><span>3</span></div>
                        <div class="ov-bar" style="--bar-h:40%;background:#f59e0b" title="En cours: 2"><span>2</span></div>
                        <div class="ov-bar" style="--bar-h:20%;background:#ef4444" title="Urgent: 1"><span>1</span></div>
                        <div class="ov-bar" style="--bar-h:30%;background:#0ea5e9" title="Planifié: 1"><span>1</span></div>
                    </div>
                    <div class="ov-chart-labels">
                        <span style="color:#10b981">Terminées</span>
                        <span style="color:#f59e0b">En cours</span>
                        <span style="color:#ef4444">Urgent</span>
                        <span style="color:#0ea5e9">Planifié</span>
                    </div>
                </div>
            </div>

            <!-- Documents templates -->
            <div class="ov-card ov-card-docs">
                <div class="ov-card-header">
                    <iconify-icon icon="solar:document-text-bold-duotone" width="18" style="color:#f59e0b"></iconify-icon>
                    <span>Documents modèles</span>
                    <a href="<%= _recBase %>/docs" class="ov-card-link">Voir tout →</a>
                </div>
                <div class="ov-doc-list">
                    <div class="ov-doc-item"><iconify-icon icon="solar:file-text-bold-duotone" width="16" style="color:#f59e0b"></iconify-icon><span>Demande d'examen labo</span><button class="ov-doc-gen"><iconify-icon icon="solar:play-bold" width="12"></iconify-icon> Générer</button></div>
                    <div class="ov-doc-item"><iconify-icon icon="solar:file-check-bold-duotone" width="16" style="color:#f59e0b"></iconify-icon><span>Arrêt de travail</span><button class="ov-doc-gen"><iconify-icon icon="solar:play-bold" width="12"></iconify-icon> Générer</button></div>
                    <div class="ov-doc-item"><iconify-icon icon="solar:file-bold-duotone" width="16" style="color:#f59e0b"></iconify-icon><span>Attestation de présence</span><button class="ov-doc-gen"><iconify-icon icon="solar:play-bold" width="12"></iconify-icon> Générer</button></div>
                    <div class="ov-doc-item"><iconify-icon icon="solar:file-security-bold-duotone" width="16" style="color:#f59e0b"></iconify-icon><span>Consentement éclairé</span><button class="ov-doc-gen"><iconify-icon icon="solar:play-bold" width="12"></iconify-icon> Générer</button></div>
                </div>
            </div>
        </div>

        <!-- Drive recent files -->
        <div class="ov-card ov-card-drive ov-full">
            <div class="ov-card-header">
                <iconify-icon icon="solar:cloud-storage-bold-duotone" width="18" style="color:#ec4899"></iconify-icon>
                <span>Fichiers récents</span>
                <a href="<%= _recBase %>/drive" class="ov-card-link">Voir tout →</a>
            </div>
            <div class="ov-drive-grid">
                <div class="ov-drive-file">
                    <div class="ov-drive-thumb" style="background:linear-gradient(135deg,#ec489910,#ec489905)">
                        <iconify-icon icon="solar:gallery-bold-duotone" width="28" style="color:#ec4899"></iconify-icon>
                    </div>
                    <div class="ov-drive-name">Radio thorax.jpg</div>
                    <div class="ov-drive-meta">2.4 MB · 15/04</div>
                </div>
                <div class="ov-drive-file">
                    <div class="ov-drive-thumb" style="background:linear-gradient(135deg,#0ea5e910,#0ea5e905)">
                        <iconify-icon icon="solar:document-bold-duotone" width="28" style="color:#0ea5e9"></iconify-icon>
                    </div>
                    <div class="ov-drive-name">Bilan sanguin.pdf</div>
                    <div class="ov-drive-meta">540 KB · 12/04</div>
                </div>
                <div class="ov-drive-file">
                    <div class="ov-drive-thumb" style="background:linear-gradient(135deg,#8b5cf610,#8b5cf605)">
                        <iconify-icon icon="solar:document-bold-duotone" width="28" style="color:#8b5cf6"></iconify-icon>
                    </div>
                    <div class="ov-drive-name">Compte-rendu IRM.pdf</div>
                    <div class="ov-drive-meta">1.2 MB · 05/04</div>
                </div>
                <div class="ov-drive-file">
                    <div class="ov-drive-thumb" style="background:linear-gradient(135deg,#10b98110,#10b98105)">
                        <iconify-icon icon="solar:document-bold-duotone" width="28" style="color:#10b981"></iconify-icon>
                    </div>
                    <div class="ov-drive-name">Ordonnance.pdf</div>
                    <div class="ov-drive-meta">120 KB · 01/04</div>
                </div>
            </div>
        </div>

        <!-- Upcoming events -->
        <div class="ov-card ov-card-agenda ov-full">
            <div class="ov-card-header">
                <iconify-icon icon="solar:calendar-bold-duotone" width="18" style="color:#14b8a6"></iconify-icon>
                <span>Prochains rendez-vous</span>
                <a href="<%= _recBase %>/agenda" class="ov-card-link">Voir tout →</a>
            </div>
            <div class="ov-agenda-row">
                <div class="ov-agenda-item">
                    <div class="ov-agenda-date-box" style="background:linear-gradient(135deg,#14b8a612,#14b8a606)">
                        <div class="ov-agenda-day" style="color:#14b8a6">28</div>
                        <div class="ov-agenda-month">AVR</div>
                    </div>
                    <div><div class="ov-agenda-title">Consultation de suivi</div><div class="ov-agenda-time">10:30 · Confirmé</div></div>
                </div>
                <div class="ov-agenda-item">
                    <div class="ov-agenda-date-box" style="background:linear-gradient(135deg,#0ea5e912,#0ea5e906)">
                        <div class="ov-agenda-day" style="color:#0ea5e9">15</div>
                        <div class="ov-agenda-month">MAI</div>
                    </div>
                    <div><div class="ov-agenda-title">Contrôle tension</div><div class="ov-agenda-time">09:00 · Planifié</div></div>
                </div>
                <div class="ov-agenda-item">
                    <div class="ov-agenda-date-box" style="background:linear-gradient(135deg,#0ea5e912,#0ea5e906)">
                        <div class="ov-agenda-day" style="color:#0ea5e9">01</div>
                        <div class="ov-agenda-month">JUN</div>
                    </div>
                    <div><div class="ov-agenda-title">Bilan annuel complet</div><div class="ov-agenda-time">14:00 · Planifié</div></div>
                </div>
            </div>
        </div>
    </div>

    <style>
    .ov-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px;}
    .ov-full{grid-column:1/-1;}
    .ov-card{background:#fff;border-radius:14px;border:1px solid #e8ecf1;padding:20px;transition:box-shadow .3s;animation:rmFadeIn .4s ease both;}
    .ov-card:hover{box-shadow:0 4px 16px rgba(0,0,0,.04);}
    .ov-card-header{display:flex;align-items:center;gap:8px;margin-bottom:16px;font-size:14px;font-weight:700;color:#0e1726;}
    .ov-card-link{margin-left:auto;font-size:12px;font-weight:500;color:#888da8;text-decoration:none;transition:color .2s;}
    .ov-card-link:hover{color:#4361ee;}
    .ov-right-col{display:flex;flex-direction:column;gap:16px;}
    /* Fields */
    .ov-fields-list{display:flex;flex-direction:column;gap:2px;}
    .ov-field{display:flex;align-items:center;gap:10px;padding:10px 12px;border-radius:8px;transition:background .2s;animation:rmFadeIn .35s ease both;}
    .ov-field:hover{background:#f8fafc;}
    .ov-field-icon{width:30px;height:30px;border-radius:8px;display:flex;align-items:center;justify-content:center;flex-shrink:0;}
    .ov-field-label{font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:.5px;color:#888da8;min-width:100px;}
    .ov-field-value{flex:1;font-size:13.5px;font-weight:500;color:#0e1726;}
    /* Tasks chart */
    .ov-tasks-chart{padding:8px 0;}
    .ov-chart-bars{display:flex;align-items:flex-end;gap:12px;height:80px;padding:0 8px;}
    .ov-bar{flex:1;height:var(--bar-h);border-radius:6px 6px 0 0;display:flex;align-items:flex-start;justify-content:center;transition:height .6s ease;min-width:0;}
    .ov-bar span{font-size:13px;font-weight:700;color:#fff;padding-top:6px;}
    .ov-chart-labels{display:flex;gap:12px;padding:8px 8px 0;font-size:11px;font-weight:600;}
    .ov-chart-labels span{flex:1;text-align:center;}
    /* Docs */
    .ov-doc-list{display:flex;flex-direction:column;gap:4px;}
    .ov-doc-item{display:flex;align-items:center;gap:8px;padding:8px 10px;border-radius:8px;font-size:13px;color:#0e1726;transition:background .2s;}
    .ov-doc-item:hover{background:#f8fafc;}
    .ov-doc-item span{flex:1;font-weight:500;}
    .ov-doc-gen{display:inline-flex;align-items:center;gap:4px;padding:4px 10px;border:none;border-radius:6px;background:linear-gradient(135deg,#f59e0b15,#f59e0b08);color:#f59e0b;font-size:11px;font-weight:600;cursor:pointer;transition:all .2s;font-family:inherit;}
    .ov-doc-gen:hover{background:#f59e0b;color:#fff;}
    /* Drive */
    .ov-drive-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;}
    .ov-drive-file{text-align:center;cursor:pointer;transition:transform .2s;}
    .ov-drive-file:hover{transform:translateY(-2px);}
    .ov-drive-thumb{height:80px;border-radius:10px;display:flex;align-items:center;justify-content:center;margin-bottom:8px;}
    .ov-drive-name{font-size:12px;font-weight:600;color:#0e1726;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
    .ov-drive-meta{font-size:11px;color:#888da8;margin-top:2px;}
    /* Agenda */
    .ov-agenda-row{display:flex;gap:12px;}
    .ov-agenda-item{flex:1;display:flex;align-items:center;gap:12px;padding:12px;border-radius:10px;border:1px solid #e8ecf1;transition:all .2s;}
    .ov-agenda-item:hover{border-color:#14b8a640;box-shadow:0 2px 8px rgba(0,0,0,.03);}
    .ov-agenda-date-box{width:48px;height:48px;border-radius:10px;display:flex;flex-direction:column;align-items:center;justify-content:center;flex-shrink:0;}
    .ov-agenda-day{font-size:18px;font-weight:800;line-height:1;}
    .ov-agenda-month{font-size:10px;font-weight:700;text-transform:uppercase;color:#888da8;letter-spacing:.5px;}
    .ov-agenda-title{font-size:13px;font-weight:600;color:#0e1726;}
    .ov-agenda-time{font-size:11.5px;color:#888da8;margin-top:2px;}
    [data-theme="dark"] .ov-card{background:#0e1726;border-color:#253b5c;}
    [data-theme="dark"] .ov-card-header,[data-theme="dark"] .ov-field-value,[data-theme="dark"] .ov-doc-item,[data-theme="dark"] .ov-drive-name,[data-theme="dark"] .ov-agenda-title{color:#e0e6ed;}
    [data-theme="dark"] .ov-field:hover,[data-theme="dark"] .ov-doc-item:hover{background:#1b2e4b;}
    [data-theme="dark"] .ov-agenda-item{border-color:#253b5c;}
    @media(max-width:768px){.ov-grid{grid-template-columns:1fr;}.ov-drive-grid{grid-template-columns:repeat(2,1fr);}.ov-agenda-row{flex-direction:column;}}
    </style>
    <% } %>
`;

t = t.replace('    <!-- ═══ FICHE MODULE ═══ -->', overviewHTML + '\n    <!-- ═══ FICHE MODULE ═══ -->');

fs.writeFileSync(f, t, 'utf8');
console.log('Updated:', f, '('+t.length+' bytes)');
