-- My Purrsonal Planner — Fitness Tracker profile fields
-- Run this AFTER 001-008, in Supabase SQL Editor

alter table profiles add column if not exists sex text check (sex in ('male', 'female'));
alter table profiles add column if not exists activity_level text default 'moderate';
alter table profiles add column if not exists diet_category text;
alter table profiles add column if not exists target_weight_kg numeric;
alter table profiles add column if not exists fitness_setup_complete boolean default false;
