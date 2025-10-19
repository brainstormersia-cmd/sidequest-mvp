-- profili (no auth.ref): pseudo-profilo basato su device_id
create table if not exists profiles (
  id uuid primary key,
  username text unique,
  created_at timestamptz default now()
);

-- missioni
create table if not exists missions (
  id uuid primary key default gen_random_uuid(),
  owner_device_id uuid references profiles(id) on delete set null,
  title text not null,
  description text,
  reward text,
  location text,
  date date,
  tags text[] default '{}',
  contact_visible text,
  status text default 'open' check (status in ('open','closed','draft')),
  created_at timestamptz default now()
);

-- candidature in-app
create table if not exists applications (
  id uuid primary key default gen_random_uuid(),
  mission_id uuid not null references missions(id) on delete cascade,
  applicant_device_id uuid references profiles(id) on delete set null,
  applicant_name text,
  applicant_contact text,
  note text,
  status text default 'pending' check (status in ('pending','accepted','rejected')),
  created_at timestamptz default now()
);

-- indici
create index if not exists missions_created_at_idx on missions (created_at desc);
create index if not exists missions_status_idx on missions (status);
create index if not exists missions_tags_gin on missions using gin (tags);
create index if not exists applications_mission_id_idx on applications (mission_id);
create index if not exists applications_applicant_idx on applications (applicant_device_id);

-- DEV RAPIDO: RLS disabilitato sulle tabelle di scrittura per MVP
alter table missions disable row level security;
alter table applications disable row level security;
alter table profiles disable row level security;
