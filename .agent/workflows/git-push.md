---
description: How to safely push changes to Git on Windows PowerShell
---

# Git Push Workflow (Windows PowerShell)

## ⚠️ CRITICAL: PowerShell Syntax

**PowerShell does NOT support `&&` for command chaining like Bash.**

Use `;` (semicolon) instead:

```powershell
# ❌ WRONG - Will fail with ParserError
git add -A && git commit -m "message" && git push

# ✅ CORRECT - Use semicolons
git add -A; git commit -m "message"; git push origin Dev
```

## Two Modes

### Mode Normal (default)
When user says "push" or explicitly asks to push:
// turbo
1. Push to **Dev** branch with user approval:
```powershell
git add -A; git commit -m "type(scope): description"; git push origin Dev
```

### Mode Autopilote
When user has activated autopilot mode (`SafeToAutoRun: true` for everything):
1. Push to **Dev_antigravity** branch, no approval needed:
```powershell
git add -A; git commit -m "[auto] type(scope): description"; git push origin Dev_antigravity
```

## Commit Message Format

Use conventional commits:
- `feat(scope):` - New feature
- `fix(scope):` - Bug fix
- `refactor(scope):` - Code refactoring
- `style(scope):` - Styling changes
- `docs(scope):` - Documentation

In autopilot mode, prefix with `[auto]`:
- `[auto] feat(scope):` - Auto-pushed feature

## Examples

```powershell
# Normal mode (user requested push → Dev)
git add -A; git commit -m "feat(dashboard): add scroll to chat panel"; git push origin Dev

# Autopilot mode (auto-push → Dev_antigravity)
git add -A; git commit -m "[auto] feat(dashboard): add scroll to chat panel"; git push origin Dev_antigravity
```
