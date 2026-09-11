# My Purrsonal Planner

A cozy, installable all-in-one life planner (PWA) — pastel pink/teal theme.

## Stack
- React + Vite
- Supabase (auth + database)
- Deploy target: Vercel
- Installable as an app on iOS / Android / desktop (PWA manifest + service worker already wired up)

## What's built so far
- Signup / login (Supabase email auth)
- Onboarding wizard: name, birthday, height, weight (optional) → BMI category + suggested healthy weight range + diet focus (lose/maintain/gain)
- Hub shell — sidebar with all 13 planned modules, "soon" badges on the ones not built yet
- Calendar module — Day / Week / Month toggle, event CRUD (title, time, type/color, notes), per-day to-do list, "Today's schedule" preview on the Hub

## Modules still to build
Mood Tracker, How Are You Feeling?, Budgeting, Recipes, Fitness Tracker, Sleep Tracker, Self-Care Challenge, Grocery List, Project Planner, Travel Planner, 5 customizable Notebooks.

## Paid access / admin

New signups land in a **"pending payment"** state and can't get past a
"we're confirming your purchase" screen until an admin activates them
in the admin panel (`/admin`, only visible in the sidebar to admins).
Once activated, the user logs in with their email/password on any
device as normal — no re-approval needed.

The admin panel also shows a rough per-user usage count (calendar
events + to-dos) as an internal proxy for Supabase usage — not exact
storage bytes, but enough to flag a heavy user.

**Making yourself the first admin:** there's no UI for this on
purpose (so a user can never grant themselves admin). After you've
signed up once yourself, run this in the Supabase SQL Editor, using
your own user id (find it in Authentication → Users):
```sql
insert into admins (user_id) values ('paste-your-user-uuid-here');
```

## Setup

1. **Database**: In your Supabase project (aockokxdioxijszocakg), open the SQL Editor and run, in order:
   - `supabase/001_init.sql` — creates `profiles`, `calendar_events`, `daily_todos` with row-level security (each user only sees their own data), plus a trigger that auto-creates a profile row on signup.
   - `supabase/002_admin_access.sql` — adds the `admins` table, the paid-activation fields on `profiles`, and the admin RPCs (`admin_activate_user`, `admin_suspend_user`, `admin_get_usage_stats`).

2. **Turn off email confirmation** (optional, since access is already gated by admin activation): Supabase dashboard → Authentication → Providers → Email → toggle off "Confirm email". The app already handles both cases either way.

3. **Local dev**:
   ```
   npm install
   npm run dev
   ```
   Your Supabase URL/anon key are already in `.env` (safe to keep — the anon key is meant to be public/client-side; access is locked down by row-level security in the database, not by hiding this key).

4. **Deploy to Vercel**:
   - Push this repo to GitHub (e.g. `rheiichan/purrsonal-planner`)
   - Import into Vercel — make sure **Framework Preset is set to "Vite"** (Vercel occasionally mis-detects new repos as "Container" or "Other," which fails the build)
   - Add the same two environment variables from `.env` in Vercel's Project Settings → Environment Variables
   - Deploy — you'll get a `*.vercel.app` URL to start with, and can attach a custom domain later

5. **Installing as an app**: once deployed, visiting the site on a phone shows an "Add to Home Screen" / install prompt (Android/Chrome shows it automatically; iOS Safari needs Share → Add to Home Screen). On desktop Chrome/Edge, an install icon appears in the address bar.

## Notes for next session
- Diet mode / BMI data feeds the future Fitness Tracker module.
- Sidebar module list lives in `src/components/SidebarLayout.jsx` (`MODULES` array) — add a module there once its page is built and flip `available: true`.
