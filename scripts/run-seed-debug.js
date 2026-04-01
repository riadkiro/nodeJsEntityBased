const { execSync } = require('child_process');
const fs = require('fs');

try {
  const output = execSync('node scripts/seed-app-presets.js --install cabinet-dentiste', { encoding: 'utf8' });
  fs.writeFileSync('tmp2.log', output);
  console.log('Success, wrote tmp2.log');
} catch (e) {
  fs.writeFileSync('tmp2.log', e.stdout + '\n' + e.stderr + '\n' + e.message);
  console.log('Error captured in tmp2.log');
}
