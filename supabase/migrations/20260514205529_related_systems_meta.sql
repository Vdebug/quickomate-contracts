-- Quickomate proposals: optional override for the "Related Systems" section
-- Lets a proposal repurpose that section as e.g. "Coming next month",
-- "Phase 2 scope", or any other framing without forking the renderer.

alter table public.contracts
  add column if not exists related_systems_title text,
  add column if not exists related_systems_intro text;
