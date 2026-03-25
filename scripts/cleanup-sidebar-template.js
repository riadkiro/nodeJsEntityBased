const fs = require('fs');
const path = require('path');

const filePath = 'C:/Users/pc/Documents/nodeJsProject/views/record/partials/record-sidebar.ejs';
let content = fs.readFileSync(filePath, 'utf8');

// Find the beginning of the problematic block
const startMarker = 'template x-for="opt in filterMsOptions(columns[<%= ci %>])" :key="opt.value">';
const endMarker = '</template>';

// We want to replace the WHOLE template content inside the tp-options div
// First, find the tp-options div
const tpOptionsStart = content.indexOf('<div class="tp-options">');
if (tpOptionsStart === -1) {
    console.log('tp-options not found');
    process.exit(1);
}

// Find the next tp-create-option (which signals the end of options list)
const tpCreateOptionStart = content.indexOf('<div class="tp-create-option"', tpOptionsStart);
if (tpCreateOptionStart === -1) {
    console.log('tp-create-option not found');
    process.exit(1);
}

// Extract the middle part (the template loop)
const pre = content.substring(0, tpOptionsStart + '<div class="tp-options">'.length);
const post = content.substring(tpCreateOptionStart);

const newTemplate = `
                                                                <template x-for="opt in filterMsOptions(columns[<%= ci %>])" :key="opt.value">
                                                                    <div class="tp-option" style="display:flex; align-items:center; justify-content:space-between; group/opt"
                                                                         @click.stop="<%= col.type === 'multiselect' ? "toggleMultiselectValue(line, '" + col.key + "', opt.value)" : "line.values['" + col.key + "'] = opt.value; closeMultiselectDropdown(); debouncedSave()" %>">
                                                                        <div style="display:flex; align-items:center; gap:8px; flex:1; min-width:0;">
                                                                            <div class="tp-option-icon"
                                                                                 :style="isOptSelected(line, '<%= col.key %>', opt.value)
                                                                                     ? 'background:' + getMultiselectOptStyle(columns[<%= ci %>], opt.value).bg + '; border: 2px solid ' + getMultiselectOptStyle(columns[<%= ci %>], opt.value).bg
                                                                                     : 'background: #fff; border: 2px solid #d1d5db'">
                                                                                <iconify-icon x-show="isOptSelected(line, '<%= col.key %>', opt.value)"
                                                                                              icon="tabler:check" width="12"
                                                                                              :style="'color:' + getMultiselectOptStyle(columns[<%= ci %>], opt.value).text"></iconify-icon>
                                                                            </div>
                                                                            <span class="tp-option-label" x-text="opt.label"></span>
                                                                        </div>
                                                                        <!-- Delete Option Icon -->
                                                                        <button type="button" @click.stop="deleteInlineOptionFromSchema(columns[<%= ci %>], opt.value)"
                                                                                class="opacity-0 group-hover/opt:opacity-100 p-1 text-gray-400 hover:text-danger hover:bg-danger/10 rounded transition-all">
                                                                            <iconify-icon icon="tabler:trash" width="12"></iconify-icon>
                                                                        </button>
                                                                    </div>
                                                                </template>
                                                            `;

fs.writeFileSync(filePath, pre + newTemplate + post);
console.log('Successfully cleaned up template');
