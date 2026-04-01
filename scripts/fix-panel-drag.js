const fs = require('fs');
const filePath = 'views/record/record-edit.ejs';
let content = fs.readFileSync(filePath, 'utf8');

// Find the exact pattern and replace it
const oldBlock = `                <%- include('partials/record-sidebar') %>
                    <%- include('partials/record-line-defaults') %>
                </div>`;

const newBlock = `                <%- include('partials/record-sidebar') %>
                </div>
                <div class="panel-sortable-item" data-panel-id="line-defaults">
                    <template x-if="designMode">
                        <div class="panel-drag-handle">
                            <iconify-icon icon="tabler:grip-horizontal" width="16"></iconify-icon>
                            <span>Défauts Ligne</span>
                        </div>
                    </template>
                    <%- include('partials/record-line-defaults') %>
                </div>`;

if (content.includes(oldBlock)) {
    content = content.replace(oldBlock, newBlock);
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('✅ Successfully extracted line-defaults into its own panel-sortable-item');
} else {
    // Try with \r\n
    const oldBlockCRLF = oldBlock.replace(/\n/g, '\r\n');
    const newBlockCRLF = newBlock.replace(/\n/g, '\r\n');
    if (content.includes(oldBlockCRLF)) {
        content = content.replace(oldBlockCRLF, newBlockCRLF);
        fs.writeFileSync(filePath, content, 'utf8');
        console.log('✅ Successfully extracted line-defaults into its own panel-sortable-item (CRLF)');
    } else {
        console.log('❌ Could not find the target block');
        // Debug: show surrounding content
        const idx = content.indexOf("record-line-defaults");
        if (idx > -1) {
            console.log('Found record-line-defaults at index', idx);
            console.log('Context:', JSON.stringify(content.substring(idx - 100, idx + 100)));
        }
    }
}
