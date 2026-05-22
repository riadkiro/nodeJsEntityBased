const fs = require('fs');
const logPath = 'C:/Users/pc/.gemini/antigravity-ide/brain/2391466c-2780-42be-9621-8b6092331720/.system_generated/logs/transcript.jsonl';

const lines = fs.readFileSync(logPath, 'utf8').split('\n');
for (const line of lines) {
    if (!line.trim()) continue;
    try {
        const obj = JSON.parse(line);
        if (obj.step_index >= 900) {
            // Check if the type is CODE_ACTION or PLANNER_RESPONSE and mentions replace_file_content or multi_replace_file_content
            if (obj.content && obj.content.includes('RecordsTable.jsx') && (obj.content.includes('ReplacementContent') || obj.content.includes('replace_file_content') || obj.content.includes('TargetContent'))) {
                console.log(`\n================ STEP ${obj.step_index} (${obj.type}) ================`);
                console.log(obj.content);
            }
        }
    } catch (e) {}
}
