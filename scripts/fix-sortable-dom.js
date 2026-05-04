const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'views', 'record', 'record-module.ejs');
let content = fs.readFileSync(filePath, 'utf8');

// ══════════════════════════════════════════════════════════════════
// FIX 1: Move "+ Widget" button OUTSIDE the .ov-col-widgets container
// The .ov-col-widgets is the Sortable container — its direct children
// must ONLY be .ov-widget-wrap items. The + Widget button and <template>
// elements from x-for corrupt Sortable's internal index calculations.
// ══════════════════════════════════════════════════════════════════

// Old structure:
//   <div class="ov-col-widgets" :data-col-id="col.id">
//       <template x-for="wid in col.widgetIds" :key="wid">
//           <div class="ov-widget-wrap" ...>...</div>
//       </template>
//       <!-- Add widget button -->
//       <div class="ov-add-widget-btn" ...>...</div>
//   </div>
//
// New structure:
//   <div class="ov-col-widgets" :data-col-id="col.id">
//       <template x-for="wid in col.widgetIds" :key="wid">
//           <div class="ov-widget-wrap" ...>...</div>
//       </template>
//   </div>
//   <!-- Add widget button OUTSIDE sortable -->
//   <div class="ov-add-widget-btn" ...>...</div>

const oldWidgetClose = `                                </template>
                                <!-- Add widget button -->`;
const newWidgetClose = `                                </template>
                            </div>
                            <!-- Add widget button OUTSIDE sortable container -->`;

if (content.includes(oldWidgetClose)) {
    content = content.replace(oldWidgetClose, newWidgetClose);
    console.log('FIX 1a: Moved + Widget button outside sortable container');
} else {
    console.error('Could not find widget close marker');
    process.exit(1);
}

// Remove the extra </div> that was closing .ov-col-widgets (now it's already closed above)
// Old: </div> (closes ov-add-widget-btn) </div> (closes ov-col-widgets)
// New: </div> (closes ov-add-widget-btn) — ov-col-widgets is already closed
const oldClosingDivs = `                                </div>
                            </div>
                        </div>
                    </template>
                </div>
            </template>`;
const newClosingDivs = `                                </div>
                        </div>
                    </template>
                </div>
            </template>`;

if (content.includes(oldClosingDivs)) {
    content = content.replace(oldClosingDivs, newClosingDivs);
    console.log('FIX 1b: Removed extra closing div');
} else {
    console.error('Could not find closing divs marker');
    // Debug
    const idx = content.indexOf('ov-add-widget-btn');
    if (idx !== -1) {
        const ctx = content.substring(idx, idx + 500);
        // Find the closing structure
        const closeIdx = ctx.indexOf('</template>');
        console.log('Context around add-widget-btn:', JSON.stringify(ctx.substring(0, Math.min(300, ctx.length))));
    }
    process.exit(1);
}

// ══════════════════════════════════════════════════════════════════
// FIX 2: Rewrite _initSortables with proper Revert-then-Splice
// that handles the <template> tag issue by using filter option
// and properly reverting the DOM.
// ══════════════════════════════════════════════════════════════════

const oldInitSortables = content.substring(
    content.indexOf('            _initSortables() {'),
    content.indexOf('            _destroySortables() {')
);

const newInitSortables = `            _initSortables() {
                this._sortableIniting = true;
                this._destroySortables();
                if (typeof Sortable === 'undefined') { this._sortableIniting = false; return; }
                const self = this;

                // ── Row reorder ──
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

                            // Revert DOM — put item back where it was
                            evt.from.removeChild(evt.item);
                            const rows = evt.from.querySelectorAll(':scope > .ov-layout-row');
                            if (oldIdx >= rows.length) {
                                evt.from.appendChild(evt.item);
                            } else {
                                evt.from.insertBefore(evt.item, rows[oldIdx]);
                            }

                            // Update Alpine data
                            const idx = self.rows.findIndex(r => r.id === rowId);
                            if (idx === -1) return;
                            const [moved] = self.rows.splice(idx, 1);
                            self.rows.splice(newIdx, 0, moved);
                            self._saveLayout();
                        }
                    }));
                }

                // ── Widget drag across columns ──
                this.$el.querySelectorAll('.ov-col-widgets').forEach(colEl => {
                    this._sortables.push(new Sortable(colEl, {
                        animation: 150,
                        handle: '.ov-widget-drag',
                        ghostClass: 'ov-sort-ghost',
                        draggable: '.ov-widget-wrap',
                        group: 'ov-widgets',
                        swapThreshold: 0.65,
                        // filter out non-draggable children
                        filter: '.ov-add-widget-btn',
                        onEnd(evt) {
                            const widgetId = evt.item.dataset.widgetId;
                            const fromColId = evt.from.dataset.colId;
                            const toColId = evt.to.dataset.colId;
                            if (!widgetId || !fromColId) return;

                            // Compute real newIndex by counting only .ov-widget-wrap before evt.item in evt.to
                            const toWidgets = Array.from(evt.to.querySelectorAll(':scope > .ov-widget-wrap'));
                            let newIdx = toWidgets.indexOf(evt.item);
                            if (newIdx === -1) newIdx = toWidgets.length;

                            // ── REVERT Sortable's DOM move ──
                            // Always remove the item from wherever Sortable put it
                            if (evt.item.parentNode) evt.item.parentNode.removeChild(evt.item);
                            // Put it back in the source container at its original position
                            const fromWidgets = Array.from(evt.from.querySelectorAll(':scope > .ov-widget-wrap'));
                            if (evt.oldIndex >= fromWidgets.length) {
                                evt.from.appendChild(evt.item);
                            } else {
                                evt.from.insertBefore(evt.item, fromWidgets[evt.oldIndex] || null);
                            }

                            // ── Update Alpine data by ID ──
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
                        }
                    }));
                });
                this._sortableIniting = false;
            },

`;

if (oldInitSortables) {
    content = content.replace(oldInitSortables, newInitSortables);
    console.log('FIX 2: Rewrote _initSortables');
} else {
    console.error('Could not find _initSortables');
    process.exit(1);
}

fs.writeFileSync(filePath, content, 'utf8');
console.log('All fixes applied successfully!');
