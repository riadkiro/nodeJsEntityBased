---
description: Commands that are safe to auto-run without user approval
---

# Auto-Run Whitelist

// turbo-all

## Two Modes

### Mode Normal (default)
- Push requires user approval
- Branch: `origin Dev`
- Commit message: standard conventional commits

### Mode Autopilote (activated by user saying "active le mode autopilote")
- **ALL whitelisted commands below run with `SafeToAutoRun: true`**
- Branch: `origin Dev_antigravity`
- Commit message must include `[auto]` prefix, e.g. `git commit -m "[auto] feat(scope): description"`
- Push command: `git add -A; git commit -m "[auto] type(scope): desc"; git push origin Dev_antigravity`

## Whitelisted Commands (auto-run in autopilot mode)

### Git
- `git add`, `git commit`, `git push`
- `git status`, `git log`, `git diff`
- `git branch`, `git checkout`, `git stash`

### NPX
- All `npx` commands (especially with `-y` flag)

- all node -e

- Remove-Item *

- cd *

- taskkill *

### Dev / Read-Only
- `npm run dev`, `npm run build`, `npm start`
- `node scripts/*`
- `cat`, `type`, `Get-Content`
- `dir`, `ls`, `Get-ChildItem`

## Rules
1. In **autopilot mode**: `SafeToAutoRun: true` for all above + push to `Dev_antigravity`
2. In **normal mode**: push needs user approval + push to `Dev`
3. PowerShell: use `;` not `&&`