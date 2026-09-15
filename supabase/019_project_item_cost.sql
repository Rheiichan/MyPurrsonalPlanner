-- My Purrsonal Planner — Project Planner: optional cost on materials
-- Run this AFTER 001-018, in Supabase SQL Editor

alter table project_items add column if not exists cost numeric;
