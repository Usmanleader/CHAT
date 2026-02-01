# Supabase Credentials Setup Guide

## Where Are My Credentials?

Your Supabase credentials are stored in: **[.env](.env)**

```
VITE_SUPABASE_URL=https://teeajweekcayugyswyyp.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## What Do These Mean?

- **VITE_SUPABASE_URL** - Your Supabase project URL (where your database is hosted)
- **VITE_SUPABASE_ANON_KEY** - Public anonymous key for client-side access

## How to Find Your Own Credentials

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Click **Settings** → **API**
4. Copy:
   - **Project URL** → paste into `VITE_SUPABASE_URL`
   - **anon public** → paste into `VITE_SUPABASE_ANON_KEY`

## How to Update Credentials

### Option 1: Edit .env File (Easiest for Development)
1. Open [.env](.env)
2. Replace the values:
   ```
   VITE_SUPABASE_URL=your-new-url
   VITE_SUPABASE_ANON_KEY=your-new-key
   ```
3. Save the file
4. Restart the app: `npm run electron-dev`

### Option 2: Environment Variables (Production)
Set these before running:
```powershell
$env:VITE_SUPABASE_URL="your-url"
$env:VITE_SUPABASE_ANON_KEY="your-key"
npm run electron-build
```

## Security Warning ⚠️

- **Never commit .env to GitHub** (it's already in .gitignore)
- Anon keys are public - they're meant to be in client apps
- Restrict Supabase RLS (Row Level Security) to protect your data

## Database Setup

After updating credentials, you need to:
1. Create the `profiles` table in Supabase
2. Set up auth users
3. Run the Database Setup Wizard in the app (if needed)

See [DatabaseSetupModal.tsx](components/DatabaseSetupModal.tsx) for setup requirements.
