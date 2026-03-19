/* ═══ Dynamic Table Widget — Alpine component ═══ */
function dtWidget(block, accountNumber, recordId) {
    return {
        dtLoading: true, dtError: '', dtLines: [], dtSchema: null, dtSnapshots: [],
        dtTargetRecordId: '', dtRecordTitle: '', dtCatalogEntityId: null,
        dtSaving: false, dtSnapshotSaving: false,
        dtCatalogOpen: false, dtCatalogSearch: '', dtCatalogResults: [], dtCatalogLoading: false,
        dtSelectedSnapshot: null, dtDeletePending: null,
        // Relation autocomplete state
        dtRelOpen: null, dtRelSearch: '', dtRelResults: [], dtRelLoading: false,
        // Available schemas for sidebar
        dtSchemas: [], dtActiveSchemaId: null,
        dtShowSplitDoc: false,

        get dtConfig() { return block.config || {}; },
        get dtVisibleColumns() {
            if (!this.dtSchema) return [];
            return (this.dtSchema.columns || []).filter(c => c.visible !== false);
        },
        get dtFilledLines() {
            return this.dtLines.filter(l => !this._isEmptyLine(l));
        },

        async dtInit() {
            // Load available schemas
            try {
                const r = await fetch('/account/' + accountNumber + '/api/widget/available-schemas?entityId=', { credentials: 'include' });
                const d = await r.json();
                this.dtSchemas = d.schemas || [];
            } catch(e) { console.warn('Schema list error:', e); }

            const cfgSchema = this.dtConfig.schemaId;
            if (cfgSchema) {
                this.dtActiveSchemaId = cfgSchema;
            } else if (this.dtSchemas.length > 0) {
                this.dtActiveSchemaId = this.dtSchemas[0].schemaId;
            }
            if (this.dtActiveSchemaId) await this.dtLoadSchema(this.dtActiveSchemaId);
            else { this.dtLoading = false; this.dtError = 'Aucun schéma disponible'; }
        },

        async dtLoadSchema(schemaId) {
            this.dtLoading = true; this.dtError = ''; this.dtActiveSchemaId = schemaId;
            try {
                let url = '/account/' + accountNumber + '/api/widget/dynamic-table-data?recordId=' + recordId + '&schemaId=' + schemaId;
                url += '&source=' + (this.dtConfig.source || 'direct');
                if (this.dtConfig.enableSnapshots !== false) url += '&includeSnapshots=true';
                const resp = await fetch(url, { credentials: 'include' });
                const data = await resp.json();
                this.dtSchema = data.schema;
                this.dtLines = (data.lines || []).map(l => ({ ...l, _editing: false }));
                this.dtSnapshots = data.snapshots || [];
                this.dtTargetRecordId = data.targetRecordId;
                this.dtRecordTitle = data.recordTitle || '';
                this.dtCatalogEntityId = data.catalogEntityId || null;
                this._ensureEmptyLine();
            } catch(e) { this.dtError = e.message; }
            this.dtLoading = false;
        },

        _isEmptyLine(line) {
            if (!line || !line.values) return true;
            return Object.values(line.values).every(v => !v && v !== 0);
        },
        _ensureEmptyLine() {
            if (this.dtLines.length === 0 || !this._isEmptyLine(this.dtLines[this.dtLines.length - 1])) {
                this.dtLines.push({ values: {}, computed: {}, lineType: (this.dtSchema?.lineTypes?.[0]) || 'product', _isNew: true });
            }
        },

        dtAddLine() {
            const lt = (this.dtSchema?.lineTypes?.[0]) || 'product';
            this.dtLines.push({ values: {}, computed: {}, lineType: lt, _isNew: true });
        },
        dtRemoveLine(idx) {
            if (this.dtDeletePending === idx) {
                this.dtLines.splice(idx, 1); this.dtDeletePending = null; this._ensureEmptyLine();
            } else {
                this.dtDeletePending = idx;
                setTimeout(() => { if (this.dtDeletePending === idx) this.dtDeletePending = null; }, 3000);
            }
        },

        async dtSave() {
            if (this.dtSaving || !this.dtTargetRecordId || !this.dtActiveSchemaId) return;
            this.dtSaving = true;
            try {
                const linesToSave = this.dtLines.filter(l => !this._isEmptyLine(l)).map((l, i) => ({
                    _id: l._id || undefined, values: l.values || {}, lineType: l.lineType || 'product', order: i
                }));
                const resp = await fetch('/account/' + accountNumber + '/api/document-lines/' + this.dtTargetRecordId + '/bulk', {
                    method: 'POST', credentials: 'include',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ lines: linesToSave, schemaId: this.dtActiveSchemaId })
                });
                const data = await resp.json();
                this.dtLines = (data.data || []).map(l => ({ ...l, _editing: false }));
                this._ensureEmptyLine();
            } catch(e) { console.error('Save error:', e); }
            this.dtSaving = false;
        },

        async dtCreateSnapshot() {
            if (this.dtSnapshotSaving) return;
            this.dtSnapshotSaving = true;
            try {
                const linesToSnap = this.dtFilledLines;
                const resp = await fetch('/account/' + accountNumber + '/api/grid-snapshots', {
                    method: 'POST', credentials: 'include',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        schemaId: this.dtActiveSchemaId,
                        targetRecordId: this.dtTargetRecordId,
                        lines: linesToSnap.map(l => ({ values: l.values, computed: l.computed, lineType: l.lineType })),
                        columns: (this.dtSchema?.columns || []).map(c => ({ key: c.key, label: c.label, type: c.type }))
                    })
                });
                const snap = await resp.json();
                if (snap._id) { this.dtSnapshots.unshift(snap); this.dtSelectedSnapshot = snap; }
            } catch(e) { console.error('Snapshot error:', e); }
            this.dtSnapshotSaving = false;
        },

        // ─── Catalog Search ──────────────────────────────────────
        async dtSearchCatalog() {
            if (!this.dtCatalogEntityId) return;
            this.dtCatalogLoading = true;
            try {
                const resp = await fetch('/account/' + accountNumber + '/api/catalog-search?entityId=' + this.dtCatalogEntityId + '&q=' + encodeURIComponent(this.dtCatalogSearch), { credentials: 'include' });
                const d = await resp.json();
                this.dtCatalogResults = d.data || [];
            } catch(e) { console.error(e); }
            this.dtCatalogLoading = false;
        },
        dtAddFromCatalog(item) {
            const values = {};
            // Map to first relation column
            const relCol = (this.dtSchema?.columns || []).find(c => c.type === 'relation');
            if (relCol) {
                values[relCol.key] = item.label || item.title;
            } else if (this.dtSchema?.columns?.[0]) {
                values[this.dtSchema.columns[0].key] = item.label || item.title;
            }
            const lastIdx = this.dtLines.length - 1;
            if (lastIdx >= 0 && this._isEmptyLine(this.dtLines[lastIdx])) {
                this.dtLines.splice(lastIdx, 0, { values, computed: {}, lineType: (this.dtSchema?.lineTypes?.[0]) || 'product', _isNew: true });
            } else {
                this.dtLines.push({ values, computed: {}, lineType: (this.dtSchema?.lineTypes?.[0]) || 'product', _isNew: true });
                this._ensureEmptyLine();
            }
        },

        // ─── Relation autocomplete ──────────────────────────────
        async dtRelAutocomplete(col, query) {
            if (!col.config?.targetEntity || !query || query.length < 1) { this.dtRelResults = []; return; }
            this.dtRelLoading = true;
            try {
                const resp = await fetch('/account/' + accountNumber + '/api/catalog-search?entityId=' + col.config.targetEntity + '&q=' + encodeURIComponent(query), { credentials: 'include' });
                const d = await resp.json();
                this.dtRelResults = d.data || [];
            } catch(e) { console.error(e); }
            this.dtRelLoading = false;
        },
        dtSelectRelation(line, col, item) {
            if (!line.values) line.values = {};
            line.values[col.key] = item.label || item.title;
            this.dtRelOpen = null; this.dtRelSearch = ''; this.dtRelResults = [];
            // Auto-map other fields from catalog item
            if (col.config?.applyDefaults) {
                for (const [targetKey, sourceKey] of Object.entries(col.config.applyDefaults)) {
                    if (sourceKey === 'title') line.values[targetKey] = item.title || item.label;
                    else if (item.customFields?.[sourceKey]) line.values[targetKey] = item.customFields[sourceKey];
                }
            }
            this._ensureEmptyLine();
        },

        // ─── Cell helpers ──────────────────────────────────────
        dtGetCellValue(line, col) {
            if (col.type === 'formula') return (line.computed && line.computed[col.key]) || '';
            return (line.values && line.values[col.key]) || '';
        },
        dtSetCellValue(line, col, value) {
            if (!line.values) line.values = {};
            line.values[col.key] = value;
        },
        dtGetSelectLabel(col, value) {
            if (!value || !col.config?.options) return '';
            const opt = col.config.options.find(o => o.value === value);
            return opt ? opt.label : value;
        },
        dtGetMultiLabels(col, value) {
            if (!value) return [];
            const vals = Array.isArray(value) ? value : (typeof value === 'string' ? value.split(',') : []);
            return vals.map(v => {
                const opt = (col.config?.options || []).find(o => o.value === v.trim());
                return opt || { value: v.trim(), label: v.trim() };
            });
        },
        dtToggleMulti(line, col, optValue) {
            if (!line.values) line.values = {};
            let current = line.values[col.key];
            let arr = Array.isArray(current) ? [...current] : (current ? current.split(',').map(s=>s.trim()).filter(Boolean) : []);
            const idx = arr.indexOf(optValue);
            if (idx >= 0) arr.splice(idx, 1); else arr.push(optValue);
            line.values[col.key] = arr;
        },
        dtFormatDate(d) {
            if (!d) return '';
            const dt = new Date(d);
            return dt.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
        },
        dtSchemaIcon(name) {
            const n = (name || '').toLowerCase();
            if (n.includes('ordonn')) return 'solar:clipboard-text-bold-duotone';
            if (n.includes('fact')) return 'solar:bill-list-bold-duotone';
            if (n.includes('trait')) return 'solar:pills-3-bold-duotone';
            if (n.includes('analy')) return 'solar:test-tube-bold-duotone';
            return 'solar:document-text-bold-duotone';
        }
    };
}
