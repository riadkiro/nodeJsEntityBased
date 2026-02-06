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

## Standard Push Sequence

// turbo
1. Stage all changes:
```powershell
git add -A
```

// turbo
2. Commit with descriptive message:
```powershell
git commit -m "type(scope): brief description"
```

// turbo
3. Push to Dev branch:
```powershell
git push origin Dev
```

## Commit Message Format

Use conventional commits:
- `feat(scope):` - New feature
- `fix(scope):` - Bug fix
- `refactor(scope):` - Code refactoring
- `style(scope):` - Styling changes
- `docs(scope):` - Documentation

## Examples

```powershell
# Single command approach (safe)
git add -A; git commit -m "feat(dashboard): add scroll to chat panel"; git push origin Dev

# Or step by step (safest)
git add -A
git commit -m "feat(dashboard): add scroll to chat panel"
git push origin Dev
```
