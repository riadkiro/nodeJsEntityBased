---
description: How to login to the app via browser subagent
---

# Login Procedure

**CRITICAL: The login form at http://localhost:3000/auth/login may already have pre-filled email and password from the browser's autofill. You MUST clear the fields before typing.**

## Steps

1. Navigate to `http://localhost:3000/auth/login`
2. Wait 1-2 seconds for the page to fully load (autofill may take a moment)
3. **Clear the email field FIRST**: Click on the email input, then press `Control+a` to select all, then press `Backspace` to clear it
4. Type the email: `boukirou6@hotmail.com`
5. **Clear the password field FIRST**: Click on the password input, then press `Control+a` to select all, then press `Backspace` to clear it
6. Type the password: `test`
7. Click the login/submit button
8. Wait for redirect to dashboard (URL should change away from `/auth/login`)

## Common Mistakes to AVOID
- ❌ Typing directly into fields without clearing them first (this appends to autofilled values)
- ❌ Not waiting for page load before interacting
- ❌ Trying to login twice if the first attempt fails due to doubled credentials

## Credentials
- Email: `boukirou6@hotmail.com`
- Password: `test`
