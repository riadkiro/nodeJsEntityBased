const fs = require('fs');

let widgetContent = fs.readFileSync('views/record/partials/ov-widget-fields.ejs', 'utf8');

// We need to add the _isFiche support
let newWidgetContent = widgetContent.replace(
`<% var _showHeader = (typeof _showHeader !== 'undefined') ? _showHeader : true; %>
<% if (_showHeader) { %>`,
`<% 
var _showHeader = (typeof _showHeader !== 'undefined') ? _showHeader : true;
var _isFiche = (typeof _isFiche !== 'undefined') ? _isFiche : false;
var _fieldsToRender = (typeof _ovFields !== 'undefined') ? _ovFields : (typeof _ficheFields !== 'undefined' ? _ficheFields : []);
var _hiddenList = (typeof _hiddenFields !== 'undefined') ? _hiddenFields : [];
%>
<% if (_showHeader) { %>`
);

// Replace the loop start
newWidgetContent = newWidgetContent.replace(
`<div class="ov-fields-list">
    <% _ovFields.forEach(function(f,i){ %>
    <div class="ov-ef" data-key="<%= f.key %>"
         @click="startEdit('<%= f.key %>',$event)"
         <% if (f.type !== 'relation' && f.type !== 'file' && f.type !== 'image' && f.type !== 'gallery') { %>@click.outside="autoSave('<%= f.key %>')"<% } %>>`,
`<div class="ov-fields-list" <%- _isFiche ? 'x-ref="ficheFieldsList"' : '' %>>
    <% _fieldsToRender.forEach(function(f,i){ %>
    <div class="ov-ef" data-key="<%= f.key %>"
         <% if (_isFiche) { %>
         data-field-key="<%= f.key %>"
         data-required="<%= f.required ? 'true' : 'false' %>"
         :class="{ 'ov-ef--hidden': isFieldHidden('<%= f.key %>') }"
         x-show="configMode || !isFieldHidden('<%= f.key %>')"
         <% if (!_hiddenList.includes(f.key)) { %>
         @click="!configMode && startEdit('<%= f.key %>',$event)"
         <% if (f.type !== 'relation' && f.type !== 'file' && f.type !== 'image' && f.type !== 'gallery') { %>@click.outside="autoSave('<%= f.key %>')"<% } %>
         <% } %>
         <% } else { %>
         @click="startEdit('<%= f.key %>',$event)"
         <% if (f.type !== 'relation' && f.type !== 'file' && f.type !== 'image' && f.type !== 'gallery') { %>@click.outside="autoSave('<%= f.key %>')"<% } %>
         <% } %>
    >
        <% if (_isFiche) { %>
        <!-- Drag handle (config mode only) -->
        <div class="fiche-drag-handle" title="Déplacer">⠿</div>
        <% } %>`
);

fs.writeFileSync('views/record/partials/ov-widget-fields.ejs', newWidgetContent);
console.log('ov-widget-fields.ejs updated');

let moduleContent = fs.readFileSync('views/record/record-module.ejs', 'utf8');

// Find the start of the fiche fields loop in record-module.ejs
const ficheLoopStart = `<div class="ov-fields-list" x-ref="ficheFieldsList">`;
// Find the end of the loop, which is followed by </div> </div> for the card.
// We can use regex to replace the whole block.
// Wait, it might be safer to manually specify the string to replace.

// I will extract the exact block from record-module.ejs using string manipulation.
const startIdx = moduleContent.indexOf('<div class="ov-fields-list" x-ref="ficheFieldsList">');
if (startIdx !== -1) {
    let endIdx = moduleContent.indexOf('</div>\n        <% } %>\n        </div>\n    </template>\n\n    <!-- ═══ MODULE: FILES', startIdx);
    if (endIdx === -1) {
        // Find alternative end anchor
        endIdx = moduleContent.indexOf('<% }); %>\n            </div>\n        </div>\n        <% } %>');
        if (endIdx !== -1) {
            endIdx += '<% }); %>\n            </div>'.length;
        }
    }
    
    if (endIdx !== -1) {
        const replacement = `<%- include('partials/ov-widget-fields', { _ovFields: _ficheFields, _showHeader: false, _isFiche: true, _hiddenFields: _hiddenFields }) %>`;
        moduleContent = moduleContent.substring(0, startIdx) + replacement + moduleContent.substring(endIdx);
        fs.writeFileSync('views/record/record-module.ejs', moduleContent);
        console.log('record-module.ejs updated with unified code');
    } else {
        console.log('Could not find end of fiche loop');
    }
} else {
    console.log('Could not find start of fiche loop');
}
