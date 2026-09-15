-- My Purrsonal Planner — Notification scheduler
-- Run this AFTER deploying the send-notifications Edge Function (see README).
--
-- IMPORTANT: before running, replace eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFvY2tva3hkaW94aWpzem9jYWtnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4OTEzMTcyNCwiZXhwIjoyMTA0NzA3NzI0fQ._2tSNBWS9bKDTCR1cL_pakSWJqIiMiLZ19hSYbEMVzU below with your
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
