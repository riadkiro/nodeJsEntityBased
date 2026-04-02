const { execSync } = require('child_process');
try {
    const branch = execSync('git branch --show-current', { encoding: 'utf8' }).trim();
    console.log('Branch:', branch);
    
    const log = execSync('git log --oneline -3', { encoding: 'utf8' });
    console.log('Recent commits:', log);
    
    const remote = execSync('git log origin/Dev --oneline -3', { encoding: 'utf8' });
    console.log('Remote Dev:', remote);
    
    const status = execSync('git status --short', { encoding: 'utf8' });
    console.log('Status:', status || '(clean)');
} catch (e) {
    console.log('Error:', e.stderr || e.message);
}
