insert into profiles (id, username)
values
  ('00000000-0000-4000-8000-000000000001', 'Esploratore-0001')
  on conflict (id) do nothing;

insert into missions (id, owner_device_id, title, description, reward, location, date, tags, contact_visible)
values
  (
    '11111111-1111-4111-8111-111111111111',
    '00000000-0000-4000-8000-000000000001',
    'Missione demo Supabase',
    'Questa missione viene creata dallo seed per test rapidi.',
    'Ricompensa 25€',
    'Milano',
    now()::date + 7,
    array['community','digital'],
    'Telegram @sidequest'
  )
  on conflict (id) do nothing;
