# My Purrsonal Planner

A cozy, installable all-in-one life planner (PWA) — pastel pink/teal theme.

## Stack
- React + Vite
- Supabase (auth + database)
- Deploy target: Vercel
- Installable as an app on iOS / Android / desktop (PWA manifest + service worker already wired up)

## Offline support

The app is a PWA, so the app shell (all the code, styling, and icons) already works with no connection. On top of that, read (GET) requests to Supabase are cached on-device — so whatever data was last loaded (today's calendar, recent mood/sleep logs, notebook pages, etc.) stays viewable offline, with a small banner letting the person know they're viewing saved data. Adding or editing anything still requires a connection — writes are never cached, so they fail honestly (no silent data loss) rather than appearing to save. This is read-only offline support, not full offline editing with sync.

## Trial & access

New signups now get **full access immediately for 30 days** — no admin approval needed to start using the app. This is computed entirely client-side (comparing `trial_ends_at` to the current time), so no cron job is needed to "expire" anyone. Once the 30 days are up, everything locks except the Hub (with Quick To-Do) and Calendar, and a screen explains that upgrading to the full lifetime version requires contacting the admin for now (a PayMongo payment link is planned for later — until then, activation is a manual step in the Admin panel). Suspended accounts and the legacy pending-payment flow (from before trials existed) still show the full block screen exactly as before.

## Push Notifications — setup (one-time, manual steps required)

Real push notifications (they arrive even if the app isn't open) need a few pieces beyond what's in this zip, because they require server-side scheduling — something I can't do for you from inside this chat. Here's everything, step by step.

**What's already done for you:**
- `supabase/021_push_notifications.sql` — creates `push_subscriptions` (each device that's turned on notifications) and `notification_log` (prevents double-sending the same reminder).
- `src/push.js` + a "Notifications" card in My Profile — lets a user turn notifications on/off from the app.
- `src/sw.js` — the service worker now handles incoming push messages and taps on them (in addition to the offline caching it already did).
- `supabase/functions/send-notifications/index.ts` — the actual logic: checks every 5 minutes for anything due (Quick To-Do reminders at 6am/12pm/6pm if something's unchecked, a mood nudge at 6pm if today's mood isn't logged, calendar events at their exact set time, and goals at 9am on their target date) and sends a push for each. All times are Asia/Manila.
- `supabase/022_notification_schedule.sql` — the cron job that calls that function every 5 minutes.
- VAPID keys (needed to prove the server sending the push is really yours) are already generated: the public one is in `.env` as `VITE_VAPID_PUBLIC_KEY`. The private one (**keep this secret, don't commit it anywhere public**) is:
  ```
  V8YoPjoP_4a76HX0UD2ko8bTUFrCzwiwAG2I6MhY2M4
  ```

**Steps you need to run yourself:**

1. Run `supabase/021_push_notifications.sql` in the SQL Editor (tables).
2. In Supabase Dashboard → Edge Functions → "Deploy a new function" → "Via Editor", name it exactly `send-notifications`, and paste in the contents of `supabase/functions/send-notifications/index.ts`.
4. Set the function's secrets — four of them now (the private VAPID key stays server-side only, never in the app itself):
   ```
   VAPID_PUBLIC_KEY=BOxm7HVttkJutZwqDLTOk25BhxGQv72TlqWg_eJPrA8S8wHW6O3ZRDvMEzP80nQTP5BDc9ldvXf1nA761KvWRsM
   VAPID_PRIVATE_KEY=V8YoPjoP_4a76HX0UD2ko8bTUFrCzwiwAG2I6MhY2M4
   VAPID_SUBJECT=mailto:youremail@example.com
   CRON_SECRET=<a random string you make up — see below>
   ```
   For `CRON_SECRET`, generate any long random string (it's just a password only your cron job and this function will know — not a Supabase key at all, so it works the same regardless of whether your project uses the old `service_role` key or the new `sb_secret_...` key system). One easy way: open any password generator and grab a 40+ character random string.
5. Deploy the function (via the Dashboard's "Deploy a new function → Via Editor", or `supabase functions deploy send-notifications` if using the CLI).
6. **Turn off "Verify JWT"** for this function — Supabase Dashboard → Edge Functions → send-notifications → Settings. This matters: without it, Supabase's own platform check rejects the cron job's request before the function's own `CRON_SECRET` check even runs.
7. Open `supabase/022_notification_schedule.sql`, replace `<YOUR_CRON_SECRET>` with the same random string you used for the `CRON_SECRET` secret in step 4, then run it in the SQL Editor.
8. Redeploy the app itself (push to GitHub → Vercel redeploys) so the new service worker goes live.
9. In the app, go to My Profile → Notifications → "Turn on notifications" (once per device — each device/browser a person uses needs to do this separately).

**A few honest limitations:**
- On iPhone, this only works if the app has been **added to the Home Screen** first (iOS 16.4+) — push notifications don't work in Safari's browser tab itself.
- Calendar and goal reminders are rounded to the nearest 5-minute mark, since the check only runs every 5 minutes.
- If you'd rather not run a background job every 5 minutes indefinitely, you can widen the schedule (e.g. every 15 minutes) by editing the cron expression in step 6 — just know reminders will be less precisely timed.

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
- Project Planner — "+ New Project" (name + optional target date), then each project has three independent checklists capped at 15 items each: Strategy/Ideas, Checklist, and Required Materials/Equipment — every item is checkable, addable, and removable; materials/equipment items also take an optional cost, with a running total cost shown for that section
- Travel Planner — "+ New Trip" (destination, trip type: International/Local/Daytime, and a date range — or a single date for daytime); day count is computed automatically. Each trip has a per-day itinerary (folder tabs, one per day, unlimited checklist items) and a "Things to Bring" checklist that auto-populates based on trip type — International adds Passport/Travel Insurance/Valid IDs/Vouchers/Business Documents; International or Local adds quantity-aware items (Underwear and Day outfit sized to the day count, Sleepwear sized to the night count) plus toiletries/electronics/comfort items; every trip type gets Medicines, Powerbank, Cash, and Cards. Every auto-populated item can be removed, and the user can add as many of their own as they want
- Budgeting — modeled on PreFundr's income-first approach, as 6 folder tabs: **Add Incomes** (source, type, amount, date), **Add Expenses** (name, category, amount, due date, bank, with a "make this recurring" checkbox that auto-generates next month's instance each time the page loads), **Allocate** (pick an income, then decide exactly how much of it goes toward each expense — a progress bar shows allocated vs. total, and each expense shows how much of it is covered so far across all incomes), **Savings** (shows "available to save this month" — income minus expenses minus already-saved — then lets you log Personal Savings / Sinking Fund / Emergency Fund entries with a bank/wallet field), **Summary** (every income, expense, and savings entry combined into one chronological ledger with a running balance after each transaction, filterable by month), and **Info** (expandable explainers: how income-first budgeting works, sinking vs. emergency funds, debt snowball, debt avalanche, and giving yourself a reward)
- Notifications (My Profile → Notifications) — real push notifications: Quick To-Do reminders at 6am/12pm/6pm if anything's unchecked, a mood check-in nudge at 6pm, calendar events at their exact set time, and goal due-date reminders — see the "Push Notifications" section above for the (one-time, manual) setup this needs
- My Profile (linked from every page's top bar, and from the Hub) — view your linked email, change your password, edit your name/birthday/height/weight, turn notifications on/off, and a "reset my data" danger zone that clears your logged content (calendar, mood, sleep, goals, gratitude, achievements, diary, self-care, recipes, grocery, notebooks, projects, trips, budgeting) while keeping your account and profile
- Hub — below the date, a one-line life summary combining your recent average mood, recent average sleep, and current diet mode (e.g. "You're mostly happy, you're having good sleep, and you're in TTC diet mode") — only shows the parts you actually have data for. Below Today's schedule, a **Quick To-Do** list — add something fast, check it off, and it's deleted immediately (separate from the Calendar's dated to-dos, which stick around with a strikethrough instead)

All 16 originally-planned modules are now built.

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
   - `supabase/014_budgeting.sql` — adds `budget_incomes`, `budget_expenses` (with `is_recurring` — the app auto-generates each missing month's instance client-side, see `src/budgeting.js`), and `budget_savings` (Personal/Sinking/Emergency, each with a bank field).
   - `supabase/018_budget_allocations.sql` — adds `budget_allocations` (one row per income+expense pair) for the Budgeting module's Allocate tab.
   - `supabase/019_project_item_cost.sql` — adds an optional `cost` column to `project_items`, used by the Required Materials/Equipment checklist for a running total.
   - `supabase/020_trial_system.sql` — adds `trial_started_at`/`trial_ends_at` to `profiles`, allows `'trial'` as an `account_status`, defaults new signups to it, and updates `admin_get_usage_stats` to surface trial end dates in the Admin panel.
   - `supabase/015_quick_todos.sql` — adds `quick_todos` for the Hub's Quick To-Do widget (checking an item off deletes it, unlike the Calendar's dated to-dos).

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
