-- My Purrsonal Planner — Travel Planner
-- Run this AFTER 001-012, in Supabase SQL Editor

create table if not exists trips (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  destination text not null,
  trip_type text not null check (trip_type in ('international', 'local', 'daytime')),
  start_date date not null,
  end_date date not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table trips enable row level security;

create policy "Users manage own trips"
  on trips for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index if not exists idx_trips_user
  on trips (user_id, start_date desc);

drop trigger if exists trips_set_updated_at on trips;
create trigger trips_set_updated_at
  before update on trips
  for each row execute procedure public.set_updated_at();

-- Itinerary checklist items, one day_number per day of the trip (1-based)
create table if not exists trip_itinerary_items (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references trips(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  day_number smallint not null,
  content text not null,
  is_done boolean not null default false,
  position smallint not null,
  created_at timestamptz default now()
);

alter table trip_itinerary_items enable row level security;

create policy "Users manage own itinerary items"
  on trip_itinerary_items for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index if not exists idx_trip_itinerary_trip
  on trip_itinerary_items (trip_id, day_number, position);

-- "Things to bring" packing checklist — auto-populated at trip creation
-- based on trip type, then freely editable (remove/add) by the user.
create table if not exists trip_packing_items (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references trips(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  content text not null,
  is_done boolean not null default false,
  position smallint not null,
  created_at timestamptz default now()
);

alter table trip_packing_items enable row level security;

create policy "Users manage own packing items"
  on trip_packing_items for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index if not exists idx_trip_packing_trip
  on trip_packing_items (trip_id, position);
