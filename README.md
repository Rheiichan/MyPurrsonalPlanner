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

## Setup

1. **Database**: In your Supabase project (aockokxdioxijszocakg), open the SQL Editor and run `supabase/001_init.sql`. This creates the `profiles`, `calendar_events`, and `daily_todos` tables with row-level security (each user only sees their own data), plus a trigger that auto-creates a profile row on signup.

2. **Local dev**:
   ```
   npm install
   npm run dev
   ```
   Your Supabase URL/anon key are already in `.env` (safe to keep — the anon key is meant to be public/client-side; access is locked down by row-level security in the database, not by hiding this key).

3. **Deploy to Vercel**:
   - Push this repo to GitHub (e.g. `rheiichan/purrsonal-planner`)
   - Import into Vercel
   - Add the same two environment variables from `.env` in Vercel's Project Settings → Environment Variables
   - Deploy — you'll get a `*.vercel.app` URL to start with, and can attach a custom domain later

4. **Installing as an app**: once deployed, visiting the site on a phone shows an "Add to Home Screen" / install prompt (Android/Chrome shows it automatically; iOS Safari needs Share → Add to Home Screen). On desktop Chrome/Edge, an install icon appears in the address bar.

## Notes for next session
- Auth requires email confirmation by default (Supabase setting) — you can turn this off in Supabase Auth settings if you'd rather skip email verification during testing.
- Diet mode / BMI data feeds the future Fitness Tracker module.
- Sidebar module list lives in `src/components/SidebarLayout.jsx` (`MODULES` array) — add a module there once its page is built and flip `available: true`.
