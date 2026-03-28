const fs = require('fs');
const file = 'c:/Users/pc/Documents/nodeJsProject/views/record/partials/record-lines.ejs';
let content = fs.readFileSync(file, 'utf8');

const oldMs = `        filterMsOptions(col) {
            const opts = col.config?.options || [];
            const q = (this.msDropdown.query || '').trim().toLowerCase();
            if (!q) return opts;
            return opts.filter(o => o.label.toLowerCase().includes(q));
        },`;

const newMs = `        filterMsOptions(col) {
            let opts = col.config?.options || [];
            const idx = this.msDropdown.lineIdx;
            let currentLine = null;
            if (typeof idx === 'string' && idx.startsWith('add_')) {
                const itemId = idx.split('_')[1];
                currentLine = this.addModal.selected.find(s => s._id === itemId);
            } else if (typeof idx === 'string' && idx.startsWith('edit_')) {
                currentLine = this.editModal.item;
            } else if (typeof idx === 'number' && idx >= 0) {
                currentLine = (this.linesMap[this.activeSchemaId] || [])[idx];
            }
            if (currentLine && currentLine._availableOptions && currentLine._availableOptions[col.key] && currentLine._availableOptions[col.key].length > 0) {
                opts = opts.filter(o => currentLine._availableOptions[col.key].includes(o.value));
            }
            const q = (this.msDropdown.query || '').trim().toLowerCase();
            if (!q) return opts;
            return opts.filter(o => o.label.toLowerCase().includes(q));
        },`;

const oldSel = `        filterSelOptions(col) {
            const opts = col.config?.options || [];
            const q = (this.selDropdown.query || '').trim().toLowerCase();
            if (!q) return opts;
            return opts.filter(o => o.label.toLowerCase().includes(q));
        },`;

const newSel = `        filterSelOptions(col) {
            let opts = col.config?.options || [];
            const idx = this.selDropdown.lineIdx;
            let currentLine = null;
            if (typeof idx === 'string' && idx.startsWith('add_')) {
                const itemId = idx.split('_')[1];
                currentLine = this.addModal.selected.find(s => s._id === itemId);
            } else if (typeof idx === 'string' && idx.startsWith('edit_')) {
                currentLine = this.editModal.item;
            } else if (typeof idx === 'number' && idx >= 0) {
                currentLine = (this.linesMap[this.activeSchemaId] || [])[idx];
            }
            if (currentLine && currentLine._availableOptions && currentLine._availableOptions[col.key] && currentLine._availableOptions[col.key].length > 0) {
                opts = opts.filter(o => currentLine._availableOptions[col.key].includes(o.value));
            }
            const q = (this.selDropdown.query || '').trim().toLowerCase();
            if (!q) return opts;
            return opts.filter(o => o.label.toLowerCase().includes(q));
        },`;

let changed = false;

// Try replacing with straight \n
if (content.includes(oldMs)) {
    content = content.replace(oldMs, newMs);
    changed = true;
} else if (content.includes(oldMs.replace(/\n/g, '\r\n'))) {
    content = content.replace(oldMs.replace(/\n/g, '\r\n'), newMs.replace(/\n/g, '\r\n'));
    changed = true;
} else {
    console.log("filterMsOptions not found!");
}

if (content.includes(oldSel)) {
    content = content.replace(oldSel, newSel);
    changed = true;
} else if (content.includes(oldSel.replace(/\n/g, '\r\n'))) {
    content = content.replace(oldSel.replace(/\n/g, '\r\n'), newSel.replace(/\n/g, '\r\n'));
    changed = true;
} else {
    console.log("filterSelOptions not found!");
}

if (changed) {
    fs.writeFileSync(file, content, 'utf8');
    console.log("Patches applied successfully.");
}
