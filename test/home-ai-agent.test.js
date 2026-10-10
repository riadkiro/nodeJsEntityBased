const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const ejs = require('ejs');

const projectRoot = path.resolve(__dirname, '..');
const viewPath = path.join(projectRoot, 'views', 'home', 'home.ejs');
const illustrationPath = path.join(projectRoot, 'public', 'assets', 'images', 'dex-ai-agent-connections.png');

test('home is a focused AI agent workspace with chat and active integrations', async () => {
    const view = fs.readFileSync(viewPath, 'utf8');
    assert.match(view, /x-data="homeAgentApp\(\)"/);
    assert.match(view, /Agent IA DexApp/);
    assert.match(view, /api\/ai-assistant\/chat/);
    assert.match(view, /api\/ai-assistant\/execute/);
    assert.match(view, /email-create/);
    assert.match(view, /email-reply/);
    assert.match(view, /Ouvrir le brouillon/);
    assert.match(view, /class="ai-connections"/);
    assert.match(view, /Intégrations actives/);
    assert.match(view, /Ajouter une intégration/);
    assert.match(view, /dex-ai-agent-connections\.png/);
    assert.match(view, /focus-workspace-mode', 'ai-home-focus-mode/);
    assert.match(view, /height:calc\(100dvh - 86px\)/);
    assert.doesNotMatch(view, /\.ai-home\{height:auto/);
    assert.match(view, /Recherche web en direct/);
    assert.match(view, /isLiveSearchQuery\(value\)/);
    assert.match(view, /rel="noopener noreferrer"/);
    assert.match(view, /class="ai-conversation-sidebar"/);
    assert.match(view, />Conversations</);
    assert.match(view, /localStorage\.setItem/);
    assert.match(view, /conversations\.slice\(0, 50\)/);
    assert.match(view, /migrateLegacyConversation\(\)/);
    assert.match(view, /restoreConversation\(\)/);
    assert.match(view, /this\.messages\.slice\(-24\)/);
    assert.match(view, /modelOptions:\s*\[/);
    assert.match(view, /id:'gpt-5\.5'/);
    assert.match(view, /id:'gpt-4o-mini'/);
    assert.match(view, /model:this\.selectedModel/);
    assert.match(view, /\.ai-composer textarea\{[^}]*margin:0;padding:0;[^}]*line-height:22px/);
    assert.match(view, /'agenda-create':'solar:calendar-add-bold-duotone'/);
    assert.doesNotMatch(view, /home-overview-shell|homeOverviewHub|api\/home-overview/);

    assert.ok(fs.existsSync(illustrationPath), 'AI connections illustration should exist');
    assert.ok(fs.statSync(illustrationPath).size > 100_000, 'AI illustration should be a real production asset');

    const rendered = await ejs.renderFile(viewPath, { account_number: '6804' });
    assert.match(rendered, /\/account\/6804\/integrations/);
    for (const match of rendered.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)) {
        assert.doesNotThrow(() => new Function(match[1]));
    }
});
