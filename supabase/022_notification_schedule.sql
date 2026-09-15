-- My Purrsonal Planner — Notification scheduler
-- Run this AFTER deploying the send-notifications Edge Function (see README).
--
-- IMPORTANT: before running, replace <YOUR_CRON_SECRET> below with the
-- same random secret you set as the CRON_SECRET Edge Function secret.
-- This is a password WE made up ourselves for this one job — not any
-- Supabase API key — so it works the same regardless of whether your
-- project uses the old (service_role) or new (sb_secret_...) key system.
--
-- You must ALSO turn off "Verify JWT" for the send-notifications function
-- in Supabase Dashboard -> Edge Functions -> send-notifications -> Settings.
-- Without that, Supabase's own platform check rejects the request before
-- our own CRON_SECRET check even runs.

create extension if not exists pg_cron;
create extension if not exists pg_net;

select cron.schedule(
  'send-notifications-every-5-min',
  '*/5 * * * *',
  $$
  select net.http_post(
    url := 'https://aockokxdioxijszocakg.supabase.co/functions/v1/send-notifications',
    headers := jsonb_build_object(
      'Authorization', 'Bearer <YOUR_CRON_SECRET>',
      'Content-Type', 'application/json'
    ),
    body := '{}'::jsonb
  );
  $$
);

-- To check it's running:
--   select * from cron.job;
--   select * from cron.job_run_details order by start_time desc limit 10;
--
-- To stop it later:
--   select cron.unschedule('send-notifications-every-5-min');
