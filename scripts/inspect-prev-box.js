const fs = require('fs');
const logPath = 'C:/Users/pc/.gemini/antigravity-ide/brain/2391466c-2780-42be-9621-8b6092331720/.system_generated/logs/transcript.jsonl';

const lines = fs.readFileSync(logPath, 'utf8').split('\n');
for (const line of lines) {
    if (!line.trim()) continue;
    try {
        const obj = JSON.parse(line);
        if (obj.step_index >= 1000 && obj.step_index < 1213) {
            if (obj.content && obj.content.includes('RecordsTable.jsx') && obj.content.includes('absolute inset-0')) {
                console.log(`\n================ STEP ${obj.step_index} (${obj.type}) ================`);
                console.log(obj.content);
            }
        }
    } catch (e) {}
}
