const fs = require('fs');
const logPath = 'C:/Users/pc/.gemini/antigravity-ide/brain/2391466c-2780-42be-9621-8b6092331720/.system_generated/logs/transcript.jsonl';

const lines = fs.readFileSync(logPath, 'utf8').split('\n');
let index = 0;
for (const line of lines) {
    if (!line.trim()) continue;
    try {
        const obj = JSON.parse(line);
        if (obj.content && obj.content.includes('RecordsTable.jsx') && obj.content.includes('bg-white')) {
            console.log(`Step ${obj.step_index} (${obj.type}):`);
            // Search for occurrences of targetContent or replacementContent in the text
            const text = obj.content;
            let pos = 0;
            while ((pos = text.indexOf('RecordsTable.jsx', pos)) !== -1) {
                const start = Math.max(0, pos - 100);
                const end = Math.min(text.length, pos + 500);
                console.log(`--- Match ${index++} ---`);
                console.log(text.substring(start, end));
                console.log('--------------------');
                pos += 'RecordsTable.jsx'.length;
            }
        }
    } catch (e) {}
}
