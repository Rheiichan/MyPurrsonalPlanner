-- My Purrsonal Planner — Notification scheduler
-- Run this AFTER deploying the send-notifications Edge Function (see README).
--
-- IMPORTANT: before running, replace <YOUR_SERVICE_ROLE_KEY> below with your
-- project's actual service_role key, found in Supabase Dashboard ->
-- Project Settings -> API -> service_role (the long secret one, NOT the
-- anon key). This lets pg_cron authenticate to the Edge Function.

create extension if not exists pg_cron;
create extension if not exists pg_net;

select cron.schedule(
  'send-notifications-every-5-min',
  '*/5 * * * *',
  $$
  select net.http_post(
    url := 'https://aockokxdioxijszocakg.supabase.co/functions/v1/send-notifications',
    headers := jsonb_build_object(
      'Authorization', 'Bearer <YOUR_SERVICE_ROLE_KEY>',
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
