const fs = require('fs');
const filePath = 'views/record/record-edit.ejs';
const content = fs.readFileSync(filePath, 'utf8');
const lines = content.split('\n');

// Find line that contains "</form>" after the panels-container
// From analysis: line 6041 is "</form>"
let formCloseLine = -1;
for (let i = 6030; i < 6050; i++) {
    if (lines[i].replace(/\r/g, '').trim() === '</form>') {
        formCloseLine = i;
        break;
    }
}
console.log(`Found </form> at line ${formCloseLine + 1}`);

const widgetWorkspace = `
    <!-- ═══════════════ SELF TAB WIDGET WORKSPACE ═══════════════ -->
    <% if (entity.slug === 'consultations') { %>
    <div x-show="$store.recordTabs.activeTab === '__self__'"
         style="margin: 0 auto; padding: 0 16px; max-width: 100%;">
        <div x-data="{
                get app() { return window.relationTabsApp || {}; },
                get selfRows() { 
                    const layouts = this.app.customTabLayouts;
                    if (!layouts || !layouts['__self__']) return [];
                    return layouts['__self__'].rows || [];
                },
                get selfBlocks() { 
                    const layouts = this.app.customTabLayouts;
                    if (!layouts || !layouts['__self__']) return {};
                    return layouts['__self__'].blocks || {};
                },
                getSelfBlock(bid) { 
                    return this.selfBlocks[bid] || null; 
                },
                addSelfWidget() {
                    const app = window.relationTabsApp;
                    if (!app) return;
                    const layout = app._ensureTabLayout('__self__');
                    let targetRow, targetCol;
                    if (!layout.rows || layout.rows.length === 0) {
                        const rowId = app._genId('row');
                        const colId = app._genId('col');
                        layout.rows = [{ id: rowId, columns: [{ id: colId, width: 12, blockIds: [] }] }];
                        targetRow = layout.rows[0];
                        targetCol = layout.rows[0].columns[0];
                    } else {
                        targetRow = layout.rows[0];
                        targetCol = layout.rows[0].columns[0];
                    }
                    Alpine.store('widgetPicker').initOpen({ 
                        type: 'tab', 
                        tabKey: '__self__', 
                        rowId: targetRow.id, 
                        colId: targetCol.id, 
                        accountNumber: '<%= account_number %>' 
                    });
                },
                removeSelfWidget(rowId, colId, bid) {
                    const app = window.relationTabsApp;
                    if (app) app.ctRemoveBlock('__self__', rowId, colId, bid);
                },
                configSelfWidget(bid) {
                    const app = window.relationTabsApp;
                    if (app) app.ctConfigModal = { open: true, tabKey: '__self__', blockId: bid };
                },
                saveSelfLayout() {
                    const app = window.relationTabsApp;
                    if (app) app.ctSaveLayout('__self__');
                },
                onSelfBlockInput(bid) {
                    const app = window.relationTabsApp;
                    if (app) app.ctOnBlockInput('__self__', bid);
                },
                addSelfTask(bid, text) {
                    const app = window.relationTabsApp;
                    if (app) app.ctAddTask('__self__', bid, text);
                }
            }"
            style="margin-top: 12px;">

            <!-- Rendered Self-Tab Widgets -->
            <template x-for="row in selfRows" :key="row.id">
                <div>
                    <template x-for="col in row.columns" :key="col.id">
                        <div style="display: flex; flex-direction: column; gap: 12px;">
                            <template x-for="(bid, bidIdx) in (col.blockIds || [])" :key="bid">
                                <template x-if="getSelfBlock(bid)">
                                <div style="position: relative; border-radius: 12px; background: white; border: 1px solid rgba(229,231,235,0.8); box-shadow: 0 1px 3px rgba(0,0,0,0.03), 0 1px 2px rgba(0,0,0,0.02); overflow: visible; transition: all 0.2s ease;"
                                     onmouseover="this.style.boxShadow='0 4px 12px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.04)'; this.style.borderColor='rgba(209,213,219,0.6)'"
                                     onmouseout="this.style.boxShadow='0 1px 3px rgba(0,0,0,0.03), 0 1px 2px rgba(0,0,0,0.02)'; this.style.borderColor='rgba(229,231,235,0.8)'">
                                    <div x-data="{ blockHover: false }" style="height: 100%;"
                                         @mouseenter="blockHover = true" @mouseleave="blockHover = false">
                                        <div x-show="blockHover"
                                             style="position: absolute; top: 3px; right: 3px; display: flex; gap: 1px; z-index: 10;"
                                             x-cloak>
                                            <button type="button" @click.stop="configSelfWidget(bid)"
                                                    title="Configurer"
                                                    style="width: 18px; height: 18px; display: flex; align-items: center; justify-content: center; border-radius: 4px; border: none; cursor: pointer; background: rgba(67,97,238,0.08); color: #4361ee;">
                                                <iconify-icon icon="solar:settings-bold" width="10"></iconify-icon>
                                            </button>
                                            <button type="button" @click.stop="removeSelfWidget(row.id, col.id, bid)"
                                                    title="Supprimer"
                                                    style="width: 18px; height: 18px; display: flex; align-items: center; justify-content: center; border-radius: 4px; border: none; cursor: pointer; background: rgba(231,81,90,0.08); color: #e7515a;">
                                                <iconify-icon icon="solar:trash-bin-trash-bold" width="10"></iconify-icon>
                                            </button>
                                        </div>
                                        <div x-data="{ get block() { return getSelfBlock(bid) } }" style="height: 100%;">
                                            <!-- Notes Widget -->
                                            <template x-if="block && block.type === 'notes'">
                                                <div style="height: 100%; border: none; border-radius: 12px;">
                                                    <div style="display: flex; align-items: center; gap: 6px; padding: 8px 12px; border-bottom: 1px solid #f3f4f6;">
                                                        <iconify-icon icon="solar:document-text-bold-duotone" width="14" style="color: #9ca3af;"></iconify-icon>
                                                        <span style="font-size: 12px; font-weight: 600; color: #374151;" x-text="block.title || 'Notes'"></span>
                                                    </div>
                                                    <div contenteditable="true"
                                                         class="custom-tab-editor-area"
                                                         data-placeholder="Écrire des notes..."
                                                         style="padding: 10px 14px; min-height: 60px; outline: none; font-size: 13px; line-height: 1.6; color: #374151;"
                                                         x-html="block.content || ''"
                                                         @input="block.content = $el.innerHTML; onSelfBlockInput(bid)">
                                                    </div>
                                                </div>
                                            </template>
                                            <!-- Tasks Widget -->
                                            <template x-if="block && block.type === 'tasks'">
                                                <div style="height: 100%; border-radius: 12px;">
                                                    <div style="display: flex; align-items: center; gap: 6px; padding: 8px 12px; border-bottom: 1px solid #f3f4f6;">
                                                        <iconify-icon icon="solar:checklist-bold-duotone" width="14" style="color: #00ab55;"></iconify-icon>
                                                        <span style="font-size: 12px; font-weight: 600; color: #374151;" x-text="block.title || 'Tâches'"></span>
                                                    </div>
                                                    <div style="padding: 8px 12px;">
                                                        <template x-for="(task, ti) in (block.tasks || [])" :key="ti">
                                                            <div style="display: flex; align-items: center; gap: 8px; padding: 4px 0;">
                                                                <input type="checkbox" :checked="task.done" @change="task.done = $el.checked; saveSelfLayout()"
                                                                       style="accent-color: #00ab55; width: 14px; height: 14px;">
                                                                <span style="font-size: 12px; color: #374151; flex: 1;" 
                                                                      :style="task.done ? 'text-decoration: line-through; color: #9ca3af;' : ''" x-text="task.text"></span>
                                                            </div>
                                                        </template>
                                                        <div style="display: flex; gap: 6px; margin-top: 6px;">
                                                            <input type="text" placeholder="Nouvelle tâche..."
                                                                   @keydown.enter.prevent="addSelfTask(bid, $el.value); $el.value = ''"
                                                                   style="flex: 1; padding: 5px 8px; border: 1px solid #e5e7eb; border-radius: 6px; font-size: 11px; outline: none;">
                                                        </div>
                                                    </div>
                                                </div>
                                            </template>
                                            <!-- Dynamic Table Widget (React Island) -->
                                            <template x-if="block && block.type === 'dynamic-table'">
                                                <div style="height: 100%; border-radius: 12px; overflow: visible; position: relative;"
                                                     data-island="dynamic-table"
                                                     data-account-number="<%= account_number %>"
                                                     data-record-id="<%= record._id %>"
                                                     data-entity-id="<%= entity._id %>"
                                                     :data-schema-filter="(block.config?.schemaIds && block.config.schemaIds.length ? block.config.schemaIds.join(',') : (block.config?.schemaId || ''))">
                                                </div>
                                            </template>
                                            <!-- Timeline / KPI / Chart / Iframe placeholders -->
                                            <template x-if="block && (block.type === 'timeline' || block.type === 'kpi' || block.type === 'chart')">
                                                <div style="padding: 16px; text-align: center; color: #9ca3af; font-size: 12px;">
                                                    <iconify-icon :icon="block.type === 'timeline' ? 'solar:clock-circle-bold-duotone' : block.type === 'kpi' ? 'solar:graph-up-bold-duotone' : 'solar:chart-bold-duotone'" width="24" style="opacity: 0.3; margin-bottom: 4px;"></iconify-icon>
                                                    <div x-text="block.title || block.type"></div>
                                                </div>
                                            </template>
                                            <template x-if="block && block.type === 'iframe'">
                                                <div style="border-radius: 12px; overflow: hidden;">
                                                    <template x-if="block.config && block.config.url">
                                                        <iframe :src="block.config.url" :style="'width: 100%; height:' + (block.config.height || 300) + 'px; border: none;'" allowfullscreen></iframe>
                                                    </template>
                                                    <template x-if="!block.config || !block.config.url">
                                                        <div style="padding: 16px; text-align: center; color: #9ca3af; font-size: 12px;">
                                                            <iconify-icon icon="solar:code-square-bold-duotone" width="24" style="opacity: 0.3; margin-bottom: 4px;"></iconify-icon>
                                                            <div>Embed / iframe</div>
                                                        </div>
                                                    </template>
                                                </div>
                                            </template>
                                        </div>
                                    </div>
                                </div>
                                </template>
                            </template>
                        </div>
                    </template>
                </div>
            </template>

            <!-- Add Widget Button -->
            <div style="display: flex; justify-content: center; margin-top: 12px; padding-bottom: 20px;">
                <button type="button" @click="addSelfWidget()"
                        style="display: inline-flex; align-items: center; gap: 8px; padding: 10px 24px; border: 2px dashed #d1d5db; border-radius: 12px; background: transparent; cursor: pointer; color: #9ca3af; font-size: 13px; font-weight: 500; transition: all 0.2s;"
                        onmouseover="this.style.borderColor='#4361ee';this.style.color='#4361ee';this.style.background='rgba(67,97,238,0.03)'" 
                        onmouseout="this.style.borderColor='#d1d5db';this.style.color='#9ca3af';this.style.background='transparent'">
                    <iconify-icon icon="solar:add-circle-bold" width="18" style="color: inherit;"></iconify-icon>
                    Ajouter un widget
                </button>
            </div>
        </div>
    </div>
    <% } %>
`;

// Insert AFTER </form> (line 6041 = 0-indexed 6040)
const insertAfterLine = formCloseLine + 1; // insert after </form>
lines.splice(insertAfterLine, 0, ...widgetWorkspace.split('\n').map(l => l + '\r'));

fs.writeFileSync(filePath, lines.join('\n'), 'utf8');
console.log('Widget workspace injected after </form> at line', formCloseLine + 1);
console.log('New total lines:', lines.length);
