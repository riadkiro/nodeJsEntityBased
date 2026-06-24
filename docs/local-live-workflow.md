# Local/live workflow

## Principle

- Code is synchronized with Git. The branch used here is `beta`.
- Secrets and environment-specific values stay in `.env` on each machine.
- `.env` and `.deploy.env` are ignored by Git.
- MongoDB data is synchronized with explicit dump/restore commands, not by Git.

## Local development

```powershell
cd "C:\Users\pc\Documents\dexapp\Dexapp live"
npm run dev
```

Local `.env` should point to local MongoDB:

```env
MONGODB_BASE_URI=mongodb://127.0.0.1:27017/
DEFAULT_TENANT=5001
```

## Deploy local code to live

1. Copy `.deploy.env.example` to `.deploy.env`.
2. Fill `SSH_TARGET` and `SERVER_APP_DIR`.
3. Run:

```powershell
npm run live:push -- "Short commit message"
```

The script builds locally, commits local changes, pushes `beta` to GitHub, then connects to the server, pulls the same branch, installs production dependencies, builds assets, and reloads PM2.

## Bring live SSH edits back to local

If you edited code directly on the server:

```powershell
npm run live:pull-code -- "Describe live edits"
```

The script commits dirty server files, pushes them to GitHub, then pulls them locally. Keep the local working tree clean before running it.

## Bring live MongoDB data back to local

Install MongoDB Database Tools locally first so `mongorestore` is available. The server also needs `mongodump`.

```powershell
npm run db:pull-live
```

Default databases are configured in `.deploy.env`:

```env
DB_NAMES=saasDemo,saas_app_rb_6804
```

Use live -> local often. Use local -> live only as a planned migration or maintenance operation with a fresh server backup.
