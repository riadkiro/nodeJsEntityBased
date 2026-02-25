---
description: How to login to the app via browser subagent
---

# Login Procedure

**CRITICAL RULES — Follow EXACTLY in order. No shortcuts.**

## Credentials
- Email: `boukirou6@hotmail.com`
- Password: `test`
- Default workspace: account `5001` (DEMO TEST)

## Strategy: Reuse Existing Sessions First

Before logging in, ALWAYS check if there's already a logged-in page:
1. List browser pages
2. If ANY page is on `localhost:3000/account/*/...` (not `/auth/login`, not `/user/accounts`), that session is already logged in
3. Just navigate that page to the target URL — NO login needed
4. Only proceed with login if ALL pages are on `/auth/login` or blank

## Full Login Steps (only if no existing session)

### Step 1: Navigate to login
```
Navigate to: http://localhost:3000/auth/login
Wait 2 seconds
```

### Step 2: Clear and type email
```
1. Click on the email input field (center of the email box)
2. Press Control+A to select all existing text
3. Press Delete to clear it
4. Wait 500ms
5. Type: boukirou6@hotmail.com
```

### Step 3: Clear and type password  
```
1. Click on the password input field (center of the password box)
2. Press Control+A to select all existing text
3. Press Delete to clear it
4. Wait 500ms
5. Type: test
```

### Step 4: Submit
```
1. Click the "Se connecter" / login button
2. Wait 3 seconds for redirect
```

### Step 5: Handle redirect
After login, you will land on `/user/accounts` (workspace selection page).
```
1. Wait 2 seconds
2. Look for "DEMO TEST" workspace card 
3. Click on it
4. Wait 2 seconds
5. You should now be on /account/5001/home
```

### Step 6: Navigate to target
```
Now navigate to your target URL (e.g. /account/5001/documents/new)
```

## Common Mistakes to AVOID
- ❌ Typing directly into fields WITHOUT clearing first (appends to autofilled values)
- ❌ Not waiting for page load before interacting
- ❌ Using JavaScript to set input values (bypasses React/form state)
- ❌ Skipping the workspace selection step after login
- ❌ Trying to log in on a page that's already logged in
- ❌ Not using Control+A then Delete before typing credentials

## Fallback: If Login Fails
If login fails after one attempt:
1. Navigate directly to http://localhost:3000/auth/login (fresh page)
2. Use JavaScript to clear and set values:
   ```javascript
   (() => {
     const email = document.querySelector('input[type="email"], #email');
     const pass = document.querySelector('input[type="password"], #password');
     if (email) { email.value = ''; email.value = 'boukirou6@hotmail.com'; email.dispatchEvent(new Event('input', {bubbles:true})); }
     if (pass) { pass.value = ''; pass.value = 'test'; pass.dispatchEvent(new Event('input', {bubbles:true})); }
     return 'Fields set';
   })()
   ```
3. Then click the login button
