const fs = require('fs');
const filePath = 'views/record/record-edit.ejs';
let content = fs.readFileSync(filePath, 'utf8');

// Replace the old getters with new store-based getters
const oldGetters = "get app() { return window.relationTabsApp || {}; },\r\n                get selfRows() { \r\n                    const layouts = this.app.customTabLayouts;\r\n                    if (!layouts || !layouts['__self__']) return [];\r\n                    return layouts['__self__'].rows || [];\r\n                },\r\n                get selfBlocks() { \r\n                    const layouts = this.app.customTabLayouts;\r\n                    if (!layouts || !layouts['__self__']) return {};\r\n                    return layouts['__self__'].blocks || {};\r\n                },";

const newGetters = "get selfRows() { \r\n                    return $store.selfLayout.rows || [];\r\n                },\r\n                get selfBlocks() { \r\n                    return $store.selfLayout.blocks || {};\r\n                },";

if (content.includes(oldGetters)) {
    content = content.replace(oldGetters, newGetters);
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Successfully replaced getters');
} else {
    console.log('Old getters not found, trying with LF line endings...');
    const oldGettersLF = oldGetters.replace(/\r\n/g, '\n');
    if (content.includes(oldGettersLF)) {
        content = content.replace(oldGettersLF, newGetters.replace(/\r\n/g, '\n'));
        fs.writeFileSync(filePath, content, 'utf8');
        console.log('Successfully replaced getters (LF)');
    } else {
        console.log('Cannot find old getters. Trying mixed...');
        // Let's find the exact content
        const idx = content.indexOf('get app() { return window.relationTabsApp');
        if (idx > -1) {
            console.log('Found "get app()" at position', idx);
            // Find the closing of get selfBlocks block
            const endMarker = "return layouts['__self__'].blocks || {};";
            const endIdx = content.indexOf(endMarker, idx);
            if (endIdx > -1) {
                const closingIdx = content.indexOf('},', endIdx);
                const oldBlock = content.substring(idx, closingIdx + 2);
                console.log('Found block length:', oldBlock.length);
                const newBlock = "get selfRows() { \n                    return $store.selfLayout.rows || [];\n                },\n                get selfBlocks() { \n                    return $store.selfLayout.blocks || {};\n                },";
                content = content.replace(oldBlock, newBlock);
                fs.writeFileSync(filePath, content, 'utf8');
                console.log('Successfully replaced with mixed approach');
            }
        }
    }
}
