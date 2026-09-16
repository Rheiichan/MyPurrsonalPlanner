-- My Purrsonal Planner — Theme selection
-- Run this AFTER 001-023, in Supabase SQL Editor

alter table profiles add column if not exists theme text default 'pink-teal';
