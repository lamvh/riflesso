-- Edit history and draft previews for the dashboard.
--
-- * content_revisions: a full snapshot of the dashboard content after a save,
--   plus the lines of activity that led to it. Saves made within a couple of
--   minutes of each other share one row, so typing does not flood the table.
--   Restoring a row loads it into the dashboard, which saves it as a new
--   revision — history is never rewritten.
-- * content_previews: unsaved dashboard content parked for a Draft Mode
--   preview. Keyed by an unguessable token held in an http-only cookie;
--   rows older than a day are pruned on every insert.
--
-- Both are service-role only: visitors never read them.

create table public.content_revisions (
  id bigint generated always as identity primary key,
  -- site_settings.revision this snapshot matches.
  revision bigint not null,
  -- 'snapshot' = content as found before an edit session, 'edit' = after a
  -- save, 'restore' = after restoring an earlier row. Only 'edit' rows absorb
  -- later saves.
  kind text not null default 'edit' check (kind in ('snapshot', 'edit', 'restore')),
  content jsonb not null,
  summary text[] not null default '{}',
  -- Filled once the dashboard has sign-in.
  author text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index content_revisions_updated_at_idx on public.content_revisions (updated_at desc);

create table public.content_previews (
  token uuid primary key default gen_random_uuid(),
  content jsonb not null,
  created_at timestamptz not null default now()
);

alter table public.content_revisions enable row level security;
alter table public.content_previews enable row level security;
grant all on public.content_revisions to service_role;
grant all on public.content_previews to service_role;
