# Deploying CoffeeShop with Firebase (Firestore) + Netlify

This document describes how to set up Firebase (Firestore) as the production datastore and deploy the project to Netlify.

Prerequisites
- Node.js and npm installed locally
- Netlify CLI (optional but helpful) installed: `npm install -g netlify-cli`
- A Firebase project with a Service Account JSON key

Steps

1) Install dependencies

```powershell
npm install
```

2) Prepare Firebase credentials

- In Firebase Console → Project Settings → Service accounts → Generate new private key.
- Save the JSON file to a local secure path (example: `C:\secrets\coffeeshop-sa.json`).

3) Migrate existing MySQL data (optional)

- If you have existing `Menu` and `Message` data in MySQL and want to copy it to Firestore, run the migration script locally.

PowerShell example:

```powershell
# $env:FIREBASE_SERVICE_ACCOUNT = Get-Content 'C:\secrets\coffeeshop-sa.json' -Raw
# $env:USE_FIREBASE = 'true'
# $env:DB_HOST='127.0.0.1'; $env:DB_USERNAME='root'; $env:DB_PASSWORD=''; $env:DB_NAME='chatbot_db'
# npm run migrate:firebase
```

The script `src/scripts/migrate-to-firestore.js` will read your local Sequelize models and write menu/messages to Firestore.

4) Configure Netlify environment variables

Open your Netlify Site → Site settings → Build & deploy → Environment → Environment variables.

Add these variables:

- `USE_FIREBASE` = `true`
- `FIREBASE_SERVICE_ACCOUNT` = (paste the entire JSON content of the service account key as a single value)

Note: Storing the service account JSON in an env var is common for serverless environments. Keep it secret.

5) (Optional) Use Netlify CLI to set env vars from PowerShell

- If you prefer CLI automation, you can use the helper script `scripts/set-netlify-env.ps1` (requires `netlify` CLI and `NETLIFY_AUTH_TOKEN` env var set).

Example:

```powershell
# $env:NETLIFY_AUTH_TOKEN = 'your_netlify_token'
# .\scripts\set-netlify-env.ps1 -SiteId '<your-netlify-site-id>' -ServiceAccountPath 'C:\secrets\coffeeshop-sa.json'
```

6) Redeploy Netlify

After setting `FIREBASE_SERVICE_ACCOUNT` and `USE_FIREBASE`, trigger a deploy (push to `main` or trigger from Netlify UI). The functions will use Firestore for menu/messages.

7) Verify

Call these endpoints to confirm data is served from Firestore:

```
GET https://<your-site>.netlify.app/api/menu
GET https://<your-site>.netlify.app/api/bestsellers?limit=6
POST https://<your-site>.netlify.app/api/bot-response { "userMessage": "hello" }
```

Security recommendations
- Do not commit service account JSON to source control.
- Use a minimal-privilege service account (only Firestore read/write) for this app.
- Rotate the service account after migration if necessary.

If you want, I can generate the Netlify CLI script to set environment variables and a small checklist to paste into the Netlify UI.
