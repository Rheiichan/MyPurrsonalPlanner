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
- Hub — a centered greeting, "Today's schedule" card with a "View my Calendar" button, a mood check-in widget, and a button-grid menu (no side nav) with monochrome icons on pink cards
- Calendar module — Day / Week / Month toggle (week is a scrollable list of day-rows, easier on mobile), event CRUD (title, time, type/color, notes), per-day to-do list — agenda + to-dos sit above the calendar grid on Month/Week views
- Mood Tracker — a 5-level green→orange→red mood meter (same face icon, color-coded), one log per day, an encouraging message after logging, plus a full history list on its own page
- Sleep Tracker — "Log your Sleep" pop-up with a 12-hour time picker (sleep time + wake time), auto-computes hours (handles crossing midnight), shows a 7-day average with a "needs improvement / getting there / doing great" readout, plus a full history list on its own page
- How Are You Feeling? — tap a feeling, get a suggested action; where the action maps to a real part of the app (Eat → Recipes, Write Them Down → Notebooks, Go Outside → Travel Planner, Plan For the Future → Goals, Focus on the Present / List Your Achievements / Remember a Time You Succeeded → Gratitude Journal, Organize Something → Calendar, Do a Simple Task You Enjoy → Project Planner) there's a "Take me there" button; the rest are just gentle in-the-moment suggestions
- Goals — a simple list for things you're planning toward, with an optional target date and a done checkbox
- Gratitude Journal — two tabs: Gratitude (daily "I'm grateful for…" entries) and Achievements (a running list of wins to look back on)
- Secret Diary — a PIN-protected free-form journal with a notebook-paper look (ruled lines, margin line, spiral holes, handwriting-style font), a Change PIN flow, and expandable entry cards showing exact date/time; admins can reset a forgotten PIN back to 0000 from the Admin panel, without ever seeing the actual PIN (only a hash is stored)
- Self-Care Challenge — the 30-day checklist as pastel cards, tracked per calendar month (resets automatically each month), with a running "X/30 completed" count and a history list of past months (e.g. "August 2026 — 14/30 completed")
- Recipes — folder-style tabs (Create your Recipe / Your Saved Recipes / Default Recipes): create and save your own recipes (yield, ingredients, procedure, notes), edit/delete/open-as-PDF any saved recipe (PDF opens in a new tab, never auto-downloads or prints), and browse the full CaloRhythm recipe library (60 recipes across 10 diet categories: Keto, Low Carb, Carnivore, Clean Eating, IF Only, Pescatarian, Diabetic-Friendly, Low Sodium, Calorie Deficit, TTC) with a "save a copy for myself" button
- Fitness Tracker — modeled on CaloRhythm but with no fasting features. One-time setup (sex, activity level, diet mode, maintain-or-target-weight goal) then a dashboard showing BMI, TDEE/maintenance calories, ideal weight estimate, a recommended daily calorie target (deficit/surplus/maintenance based on BMI and goal), an estimated time-to-goal in weeks/months, an expandable "About this diet mode" explainer (purpose, what to expect, risks, macros — sourced from CaloRhythm), a link to Recipes, and a list of suggested exercises for the chosen diet mode (also sourced from CaloRhythm)
- Grocery List — folder tabs: Preloaded List (auto-populated from your Fitness Tracker diet mode, sourced from CaloRhythm's per-diet grocery lists, with checkboxes) and Custom (add your own items, also checkable)
- Notebooks — 5 notebooks that look like actual notebook covers (colored, with a spine and binding rings), each renamable and recolorable from a 6-color palette. Open one to see its pages as folder tabs (starts with 5 pages, add more up to 25, rename or delete any page, each page is a free-write textarea with an explicit Save)
- Project Planner — "+ New Project" (name + optional target date), then each project has three independent checklists capped at 15 items each: Strategy/Ideas, Checklist, and Required Materials — every item is checkable, addable, and removable
- Travel Planner — "+ New Trip" (destination, trip type: International/Local/Daytime, and a date range — or a single date for daytime); day count is computed automatically. Each trip has a per-day itinerary (folder tabs, one per day, unlimited checklist items) and a "Things to Bring" checklist that auto-populates based on trip type — International adds Passport/Travel Insurance/Valid IDs/Vouchers/Business Documents; International or Local adds quantity-aware items (Underwear and Day outfit sized to the day count, Sleepwear sized to the night count) plus toiletries/electronics/comfort items; every trip type gets Medicines, Powerbank, Cash, and Cards. Every auto-populated item can be removed, and the user can add as many of their own as they want
- My Profile (linked from every page's top bar, and from the Hub) — view your linked email, change your password, edit your name/birthday/height/weight, and a "reset my data" danger zone that clears your logged content (calendar, mood, sleep, goals, gratitude, achievements, diary, self-care, recipes, grocery, notebooks, projects, trips) while keeping your account and profile
- Hub — below the date, a one-line life summary combining your recent average mood, recent average sleep, and current diet mode (e.g. "You're mostly happy, you're having good sleep, and you're in TTC diet mode") — only shows the parts you actually have data for

## Modules still to build
Budgeting.

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
   - `supabase/003_mood_tracker.sql` — adds the `mood_logs` table (one row per user per day) for the Mood Tracker.
   - `supabase/004_sleep_tracker.sql` — adds the `sleep_logs` table (one row per user per day: sleep time, wake time, computed duration) for the Sleep Tracker.
   - `supabase/005_goals_gratitude.sql` — adds `goals`, `gratitude_entries`, and `achievements` tables, used by Goals, Gratitude Journal, and the "How Are You Feeling?" flow.
   - `supabase/006_secret_diary.sql` — enables the `pgcrypto` extension, adds `diary_pins` (PIN hashes only, never plain text) and `diary_entries` tables, and the `admin_reset_diary_pin` RPC.
   - `supabase/007_selfcare_challenge.sql` — adds `selfcare_logs` (one row per completed day per month) for the 30-Day Self-Care Challenge.
   - `supabase/008_recipes.sql` — adds `user_recipes` for the "Create your Recipe" / "Your Saved Recipes" tabs. The "Default Recipes" tab is static app data (`src/defaultRecipes.js`), not a database table — now populated with the full CaloRhythm recipe library (60 recipes across Keto, Low Carb, Carnivore, Clean Eating, IF Only, Pescatarian, Diabetic-Friendly, Low Sodium, Calorie Deficit, and TTC), including per-serving calories/macros and prep time in the notes.
   - `supabase/009_fitness_tracker.sql` — adds `sex`, `activity_level`, `diet_category`, `target_weight_kg`, and `fitness_setup_complete` columns to `profiles` for the Fitness Tracker. Diet mode metadata/descriptions/exercises live in `src/dietData.js` (static, sourced from CaloRhythm, fasting mode excluded); the BMI/TDEE/goal-timeline formulas are in `src/fitnessMath.js` (same math CaloRhythm uses: Mifflin-St Jeor for TDEE, Devine formula for ideal weight).
   - `supabase/010_grocery_list.sql` — adds `grocery_checks` (which preloaded items a user has checked, per diet mode) and `grocery_custom_items` (the user's own added items). The preloaded lists themselves are static data in `src/groceryData.js`, sourced from CaloRhythm.
   - `supabase/011_notebooks.sql` — adds `notebooks` (5 fixed slots per user, name + color) and `notebook_pages` (up to 25 per notebook). Both auto-populate with sensible defaults the first time a user opens Notebooks / a specific notebook.
   - `supabase/012_project_planner.sql` — adds `projects` (name + target date) and `project_items` (checklist items, capped at 15 per section per project — Strategy/Ideas, Checklist, Required Materials).
   - `supabase/013_travel_planner.sql` — adds `trips`, `trip_itinerary_items` (per-day checklist, unlimited), and `trip_packing_items` (the "Things to Bring" checklist, unlimited, auto-seeded at trip creation based on trip type — see `src/travel.js` for the exact rules).

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
