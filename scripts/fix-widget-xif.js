const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'views', 'record', 'record-module.ejs');
let content = fs.readFileSync(filePath, 'utf8');

// Replace x-show with template x-if for each widget
const replacements = [
    // fields
    {
        from: `                                        <!-- Widget: fields -->
                                        <div class="ov-card ov-card-fields" x-show="wid === 'fields'" x-data="wid === 'fields' ? ovInlineEdit() : {}">`,
        to: `                                        <!-- Widget: fields -->
                                        <template x-if="wid === 'fields'">
                                        <div class="ov-card ov-card-fields" x-data="ovInlineEdit()">`
    },
    {
        from: `                                        </div>
                                        <!-- Widget: tasks -->
                                        <div class="ov-card ov-card-tasks" x-show="wid === 'tasks'">`,
        to: `                                        </div>
                                        </template>
                                        <!-- Widget: tasks -->
                                        <template x-if="wid === 'tasks'">
                                        <div class="ov-card ov-card-tasks">`
    },
    {
        from: `                                        </div>
                                        <!-- Widget: docs -->
                                        <div class="ov-card ov-card-docs" x-show="wid === 'docs'" x-data="wid === 'docs' ? ovSmartDocs() : {}">`,
        to: `                                        </div>
                                        </template>
                                        <!-- Widget: docs -->
                                        <template x-if="wid === 'docs'">
                                        <div class="ov-card ov-card-docs" x-data="ovSmartDocs()">`
    },
    {
        from: `                                        </div>
                                        <!-- Widget: drive -->
                                        <div class="ov-card ov-card-drive" x-show="wid === 'drive'">`,
        to: `                                        </div>
                                        </template>
                                        <!-- Widget: drive -->
                                        <template x-if="wid === 'drive'">
                                        <div class="ov-card ov-card-drive">`
    },
    {
        from: `                                        </div>
                                        <!-- Widget: lines -->
                                        <div class="ov-card ov-card-lines" x-show="wid === 'lines'">`,
        to: `                                        </div>
                                        </template>
                                        <!-- Widget: lines -->
                                        <template x-if="wid === 'lines'">
                                        <div class="ov-card ov-card-lines">`
    },
    {
        from: `                                        </div>
                                        <!-- Widget: agenda -->
                                        <div class="ov-card ov-card-agenda" x-show="wid === 'agenda'">`,
        to: `                                        </div>
                                        </template>
                                        <!-- Widget: agenda -->
                                        <template x-if="wid === 'agenda'">
                                        <div class="ov-card ov-card-agenda">`
    },
    // Close the last template before the widget-wrap closing div
    {
        from: `                                        </div>
                                    </div>
                                </template>`,
        to: `                                        </div>
                                        </template>
                                    </div>
                                </template>`
    }
];

let count = 0;
for (const r of replacements) {
    if (content.includes(r.from)) {
        content = content.replace(r.from, r.to);
        count++;
    } else {
        console.error('Could not find:', r.from.substring(0, 80));
    }
}

fs.writeFileSync(filePath, content, 'utf8');
console.log(`Applied ${count}/${replacements.length} replacements`);
