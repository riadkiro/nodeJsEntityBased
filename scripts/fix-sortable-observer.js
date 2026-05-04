const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'views', 'record', 'record-module.ejs');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Replace the init() method to use MutationObserver instead of manual _reinitSortables calls
const oldInit = `            init() {\r
                this.rows = JSON.parse(JSON.stringify(this._defaultRows));\r
                this._loadLayout();\r
                this.$watch('$store.app.layoutMode', (v) => {\r
                    this.layoutMode = v;\r
                    this.$nextTick(() => { if (v) this._initSortables(); else this._destroySortables(); });\r
                });\r
                this.layoutMode = this.$store.app.layoutMode;\r
                this.$nextTick(() => { if (this.layoutMode) this._initSortables(); });\r
                window.addEventListener('mousemove', (e) => this._onResizeMove(e));\r
                window.addEventListener('mouseup', () => this._onResizeEnd());\r
            },`;

const newInit = `            _sortableTimer: null,
            _observer: null,

            init() {
                this.rows = JSON.parse(JSON.stringify(this._defaultRows));
                this._loadLayout();
                this.$watch('$store.app.layoutMode', (v) => {
                    this.layoutMode = v;
                    if (v) {
                        this.$nextTick(() => this._startObserver());
                    } else {
                        this._stopObserver();
                        this._destroySortables();
                    }
                });
                this.layoutMode = this.$store.app.layoutMode;
                if (this.layoutMode) {
                    this.$nextTick(() => this._startObserver());
                }
                window.addEventListener('mousemove', (e) => this._onResizeMove(e));
                window.addEventListener('mouseup', () => this._onResizeEnd());
            },

            // MutationObserver watches for Alpine x-for DOM changes and re-inits Sortables
            _startObserver() {
                this._stopObserver();
                this._scheduleSortableInit();
                const container = this.$refs.ovRowContainer;
                if (!container) return;
                this._observer = new MutationObserver(() => {
                    this._scheduleSortableInit();
                });
                this._observer.observe(container, { childList: true, subtree: true });
            },

            _stopObserver() {
                if (this._observer) { this._observer.disconnect(); this._observer = null; }
                if (this._sortableTimer) { clearTimeout(this._sortableTimer); this._sortableTimer = null; }
            },

            _scheduleSortableInit() {
                if (this._sortableTimer) clearTimeout(this._sortableTimer);
                this._sortableTimer = setTimeout(() => { this._initSortables(); }, 80);
            },`;

if (content.includes(oldInit)) {
    content = content.replace(oldInit, newInit);
    console.log('Replaced init() method');
} else {
    console.error('Could not find init() method');
    // Try to debug
    const initIdx = content.indexOf('            init() {');
    if (initIdx !== -1) {
        console.log('Found init at', initIdx);
        console.log('Context:', JSON.stringify(content.substring(initIdx, initIdx + 200)));
    }
    process.exit(1);
}

// 2. Remove all manual _reinitSortables() calls from addRow, splitColumn, removeColumn, addWidget
// and from the onEnd handler
const replacements = [
    // addRow
    { from: "                this._saveLayout();\r\n                this._reinitSortables();\r\n            },\r\n\r\n            removeRow", to: "                this._saveLayout();\r\n            },\r\n\r\n            removeRow" },
    // splitColumn  
    { from: "                this._saveLayout();\r\n                this._reinitSortables();\r\n            },\r\n\r\n            removeColumn", to: "                this._saveLayout();\r\n            },\r\n\r\n            removeColumn" },
    // removeColumn
    { from: "                this._saveLayout();\r\n                this._reinitSortables();\r\n            },\r\n\r\n            _onResizeStart", to: "                this._saveLayout();\r\n            },\r\n\r\n            _onResizeStart" },
    // addWidget
    { from: "                this._saveLayout();\r\n                this._reinitSortables();\r\n            },\r\n\r\n            removeWidget", to: "                this._saveLayout();\r\n            },\r\n\r\n            removeWidget" },
];

let count = 0;
for (const r of replacements) {
    if (content.includes(r.from)) {
        content = content.replace(r.from, r.to);
        count++;
    }
}
console.log(`Removed ${count} manual _reinitSortables calls`);

// 3. Remove the _reinitSortables call from the widget onEnd handler
const oldOnEnd = "                            self._saveLayout();\n                            // Re-init after Alpine re-render to bind new DOM\n                            self._reinitSortables();";
const newOnEnd = "                            self._saveLayout();";
if (content.includes(oldOnEnd)) {
    content = content.replace(oldOnEnd, newOnEnd);
    console.log('Removed _reinitSortables from onEnd handler');
}

// 4. Remove the standalone _reinitSortables method since the observer handles it
// Actually keep it but simplify it — it's still useful as a public method
const oldReinit = `            _reinitSortables() {\n                // Wait for Alpine x-for to fully render new DOM elements\n                this.$nextTick(() => {\n                    setTimeout(() => { this._initSortables(); }, 60);\n                });\n            },`;
const newReinit = `            _reinitSortables() {
                this._scheduleSortableInit();
            },`;
if (content.includes(oldReinit)) {
    content = content.replace(oldReinit, newReinit);
    console.log('Simplified _reinitSortables');
}

fs.writeFileSync(filePath, content, 'utf8');
console.log('Done! MutationObserver approach applied.');
