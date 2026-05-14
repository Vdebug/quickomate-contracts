-- Quickomate proposal fields — restructured per Nick's blueprint
-- Adds: personal letter intro, problem section, timeline, related systems
-- Existing fields are repurposed:
--   lede        → cover-page sub-line
--   scope       → "The solution" body
--   deliverables → "Scope of work" bullets
--   fees        → "Your investment" (with deposit + reassurance)
--   terms       → wrapped legal at the back

alter table public.contracts
  add column if not exists letter           text,
  add column if not exists problem          jsonb not null default '{}'::jsonb,
  add column if not exists timeline         jsonb not null default '[]'::jsonb,
  add column if not exists related_systems  jsonb not null default '[]'::jsonb;
