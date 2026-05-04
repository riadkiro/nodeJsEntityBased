const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'views', 'record', 'record-module.ejs');
let content = fs.readFileSync(filePath, 'utf8');

// Find the start and end of the ov-grid section
const startMarker = '    <div class="ov-grid" x-data="ovInlineEdit()">';
const endMarker = '    </div>\r\n\r\n    <style>';

const startIdx = content.indexOf(startMarker);
if (startIdx === -1) {
    console.error('Could not find start marker');
    process.exit(1);
}

// Find the closing </div> of ov-grid, which is followed by the <style> tag
// The ov-grid div ends at line 516 with "    </div>" followed by empty line and <style>
const endPattern = '    </div>\r\n\r\n    <style>\r\n    .ov-grid';
const endIdx = content.indexOf(endPattern, startIdx);
if (endIdx === -1) {
    console.error('Could not find end marker');
    process.exit(1);
}

const replacement = `    <div x-data="ovLayoutBuilder()" :class="layoutMode ? 'ov-dm' : ''">
        <!-- Design mode banner -->
        <div class="ov-dm-banner">
            <iconify-icon icon="tabler:layout-dashboard" width="16"></iconify-icon>
            <span>Mode mise en page activé — Glissez les widgets pour réorganiser</span>
            <button type="button" @click="$store.app.layoutMode = false" style="margin-left:auto;padding:4px 12px;border-radius:6px;border:1px solid rgba(67,97,238,.2);background:#fff;color:#4361ee;font-size:11px;font-weight:600;cursor:pointer;">Terminé</button>
        </div>

        <!-- Dynamic layout rows -->
        <div x-ref="ovRowContainer">
            <template x-for="row in rows" :key="row.id">
                <div class="ov-layout-row" :data-row-id="row.id">
                    <div class="ov-row-drag" title="Déplacer la ligne">⠿</div>
                    <template x-for="(col, ci) in row.columns" :key="col.id">
                        <div class="ov-layout-col" :style="'width:' + (col.width/12*100) + '%;position:relative;'">
                            <!-- Column toolbar -->
                            <div class="ov-col-toolbar">
                                <button type="button" @click="splitColumn(row.id, col.id)" title="Diviser" x-show="col.width >= 4">⫽</button>
                                <button type="button" @click="removeColumn(row.id, col.id)" title="Supprimer colonne" x-show="row.columns.length > 1" style="color:#ef4444;">✕</button>
                            </div>
                            <!-- Resize handle between columns -->
                            <template x-if="ci < row.columns.length - 1">
                                <div class="ov-resize-handle" @mousedown="$event.preventDefault(); _onResizeStart($event, row.id, ci)"></div>
                            </template>
                            <!-- Widgets in this column -->
                            <div class="ov-col-widgets" :data-col-id="col.id">
                                <template x-for="wid in col.widgetIds" :key="wid">
                                    <div class="ov-widget-wrap" :data-widget-id="wid">
                                        <div class="ov-widget-drag" title="Déplacer">⠿</div>
                                        <button type="button" class="ov-widget-remove" @click="removeWidget(wid)" title="Retirer">✕</button>
                                        <!-- Widget: fields -->
                                        <div class="ov-card ov-card-fields" x-show="wid === 'fields'" x-data="wid === 'fields' ? ovInlineEdit() : {}">
                                            <% if (typeof _ovFields !== 'undefined') { %><%- include('partials/ov-widget-fields', { _ovFields: _ovFields, _recBase: _recBase }) %><% } %>
                                        </div>
                                        <!-- Widget: tasks -->
                                        <div class="ov-card ov-card-tasks" x-show="wid === 'tasks'">
                                            <%- include('partials/ov-widget-tasks', { _recBase: _recBase }) %>
                                        </div>
                                        <!-- Widget: docs -->
                                        <div class="ov-card ov-card-docs" x-show="wid === 'docs'" x-data="wid === 'docs' ? ovSmartDocs() : {}">
                                            <%- include('partials/ov-widget-docs', { _recBase: _recBase }) %>
                                        </div>
                                        <!-- Widget: drive -->
                                        <div class="ov-card ov-card-drive" x-show="wid === 'drive'">
                                            <%- include('partials/ov-widget-drive', { _recBase: _recBase }) %>
                                        </div>
                                        <!-- Widget: lines -->
                                        <div class="ov-card ov-card-lines" x-show="wid === 'lines'">
                                            <script type="module" src="/dist/dynamicTable.js"><\/script>
                                            <div
                                                data-island="dynamic-table"
                                                data-account-number="<%= account_number %>"
                                                data-record-id="<%= record._id %>"
                                                data-entity-id="<%= entity._id %>"
                                                data-schema-filter=""
                                                data-compact="false"
                                            ></div>
                                        </div>
                                        <!-- Widget: agenda -->
                                        <div class="ov-card ov-card-agenda" x-show="wid === 'agenda'">
                                            <%- include('partials/ov-widget-agenda', { _recBase: _recBase }) %>
                                        </div>
                                    </div>
                                </template>
                                <!-- Add widget button -->
                                <div class="ov-add-widget-btn" style="position:relative;" x-data="{ pickerOpen: false }" @click.outside="pickerOpen = false">
                                    <div @click="pickerOpen = !pickerOpen" style="display:flex;align-items:center;gap:6px;width:100%;justify-content:center;">
                                        <iconify-icon icon="tabler:plus" width="14"></iconify-icon>
                                        <span>Widget</span>
                                    </div>
                                    <div class="ov-widget-picker" x-show="pickerOpen" x-cloak>
                                        <template x-for="w in _availableWidgets()" :key="w.id">
                                            <div class="ov-widget-picker-item" @click="addWidget(col.id, w.id); pickerOpen = false">
                                                <iconify-icon :icon="w.icon" width="15" :style="'color:' + w.color"></iconify-icon>
                                                <span x-text="w.label"></span>
                                            </div>
                                        </template>
                                        <div x-show="_availableWidgets().length === 0" style="padding:10px;text-align:center;color:#888da8;font-size:11px;">Tous les widgets sont placés</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </template>
                </div>
            </template>
        </div>
        <!-- Add row button -->
        <div class="ov-add-row-btn" @click="addRow()">
            <iconify-icon icon="tabler:plus" width="14"></iconify-icon>
            <span>Ajouter une ligne</span>
        </div>
    </div>`;

// Replace from startIdx to endIdx (not including the <style> part)
content = content.substring(0, startIdx) + replacement + '\r\n\r\n    <style>\r\n    .ov-grid' + content.substring(endIdx + endPattern.length);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully replaced ov-grid with layout builder');
console.log('Start index:', startIdx);
console.log('End index:', endIdx);
