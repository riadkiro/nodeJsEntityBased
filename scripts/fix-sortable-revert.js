const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'views', 'record', 'record-module.ejs');
let content = fs.readFileSync(filePath, 'utf8');

// Find the _initSortables method and replace it along with _destroySortables and _reinitSortables
const startMarker = "            _initSortables() {";
const endMarker = "            _reinitSortables() {\r\n                // Wait for Alpine x-for to fully render new DOM elements\r\n                this.$nextTick(() => {\r\n                    setTimeout(() => { this._initSortables(); }, 50);\r\n                });\r\n            },";

// Try alternate ending
const endMarker2 = "            _reinitSortables() {\n                // Wait for Alpine x-for to fully render new DOM elements\n                this.$nextTick(() => {\n                    setTimeout(() => { this._initSortables(); }, 50);\n                });\n            },";

const startIdx = content.indexOf(startMarker);
if (startIdx === -1) {
    console.error('Could not find start marker');
    process.exit(1);
}

let endIdx = content.indexOf(endMarker, startIdx);
let endLen = endMarker.length;
if (endIdx === -1) {
    endIdx = content.indexOf(endMarker2, startIdx);
    endLen = endMarker2.length;
}
if (endIdx === -1) {
    console.error('Could not find end marker');
    // Debug: show what's around the reinit
    const reinitIdx = content.indexOf('_reinitSortables', startIdx);
    if (reinitIdx !== -1) {
        console.log('Found _reinitSortables at', reinitIdx);
        console.log('Context:', JSON.stringify(content.substring(reinitIdx, reinitIdx + 200)));
    }
    process.exit(1);
}

const replacement = `            _initSortables() {
                this._destroySortables();
                if (typeof Sortable === 'undefined') return;
                const self = this;

                // ── Row reorder (Revert-then-Splice pattern) ──
                const rowContainer = this.$refs.ovRowContainer;
                if (rowContainer) {
                    this._sortables.push(new Sortable(rowContainer, {
                        animation: 150,
                        handle: '.ov-row-drag',
                        ghostClass: 'ov-sort-ghost',
                        draggable: '.ov-layout-row',
                        onEnd(evt) {
                            const rowId = evt.item.dataset.rowId;
                            const oldIdx = evt.oldIndex;
                            const newIdx = evt.newIndex;
                            if (oldIdx === newIdx) return;

                            // 1. REVERT Sortable's DOM move — Alpine owns the DOM
                            const parent = evt.from;
                            const children = Array.from(parent.querySelectorAll(':scope > .ov-layout-row'));
                            if (oldIdx < newIdx) {
                                const ref = children[oldIdx] || null;
                                parent.insertBefore(evt.item, ref);
                            } else {
                                const ref = children[oldIdx + 1] || null;
                                parent.insertBefore(evt.item, ref);
                            }

                            // 2. Update Alpine data — triggers x-for re-render
                            const idx = self.rows.findIndex(r => r.id === rowId);
                            if (idx === -1) return;
                            const [moved] = self.rows.splice(idx, 1);
                            self.rows.splice(newIdx, 0, moved);
                            self._saveLayout();
                        }
                    }));
                }

                // ── Widget reorder/move across columns (Revert-then-Splice) ──
                this.$el.querySelectorAll('.ov-col-widgets').forEach(colEl => {
                    this._sortables.push(new Sortable(colEl, {
                        animation: 150,
                        handle: '.ov-widget-drag',
                        ghostClass: 'ov-sort-ghost',
                        draggable: '.ov-widget-wrap',
                        group: 'ov-widgets',
                        swapThreshold: 0.65,
                        onEnd(evt) {
                            const widgetId = evt.item.dataset.widgetId;
                            const fromColId = evt.from.dataset.colId;
                            const toColId = evt.to.dataset.colId;
                            const newIdx = evt.newIndex;

                            // 1. REVERT Sortable's DOM move
                            if (evt.from !== evt.to) {
                                // Cross-column: remove from target, put back in source
                                evt.item.remove();
                                evt.from.appendChild(evt.item);
                            } else {
                                // Same column: restore original position
                                const items = Array.from(evt.from.querySelectorAll(':scope > .ov-widget-wrap'));
                                const ref = items[evt.oldIndex] || null;
                                if (ref) evt.from.insertBefore(evt.item, ref);
                            }

                            // 2. Update Alpine data by ID (never by index)
                            let fromCol = null, toCol = null;
                            self.rows.forEach(r => r.columns.forEach(c => {
                                if (c.id === fromColId) fromCol = c;
                                if (c.id === toColId) toCol = c;
                            }));
                            if (!fromCol) return;

                            const fi = fromCol.widgetIds.findIndex(w => w === widgetId);
                            if (fi === -1) return;
                            fromCol.widgetIds.splice(fi, 1);

                            if (toCol) {
                                toCol.widgetIds.splice(newIdx, 0, widgetId);
                            }

                            self._saveLayout();
                            // Re-init after Alpine re-render to bind new DOM
                            self._reinitSortables();
                        }
                    }));
                });
            },

            _destroySortables() {
                this._sortables.forEach(s => { try { s.destroy(); } catch(e) {} });
                this._sortables = [];
            },

            _reinitSortables() {
                // Wait for Alpine x-for to fully render new DOM elements
                this.$nextTick(() => {
                    setTimeout(() => { this._initSortables(); }, 60);
                });
            },`;

content = content.substring(0, startIdx) + replacement + content.substring(endIdx + endLen);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully replaced SortableJS code with Revert-then-Splice pattern');
