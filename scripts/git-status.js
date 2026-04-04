const { execSync } = require('child_process');
const result = execSync('git status --porcelain', { cwd: 'c:/Users/pc/Documents/nodeJsProject', encoding: 'utf8' });
console.log(result);
