-- Folders and tags for the dashboard's Media screen.
--
-- One row per stored R2 object that has been organised, keyed by its object
-- key. Folders are labels, not bucket prefixes: moving a file between folders
-- never renames the object, so every saved image URL keeps working.
--
-- * folder: '' = unfiled. Nested folders are written as a path, 'Albums/Vogue'.
-- * tags:   free labels the editor adds ("bộ ảnh Thu 2026", "BTS"…). Album and
--           artist groupings are derived from the content on the fly and are
--           not stored here.
--
-- A row whose folder is '' and tags are empty carries nothing and is deleted
-- by the dashboard rather than kept. Deleting a file from the Media screen
-- removes its row too.
--
-- Service-role only: visitors never read it.

create table public.media_library_labels (
  object_key text primary key check (length(object_key) between 1 and 1024),
  folder text not null default '' check (length(folder) <= 300),
  tags text[] not null default '{}' check (cardinality(tags) <= 20),
  updated_at timestamptz not null default now()
);

create index media_library_labels_folder_idx on public.media_library_labels (folder);
create index media_library_labels_tags_idx on public.media_library_labels using gin (tags);

alter table public.media_library_labels enable row level security;
grant all on public.media_library_labels to service_role;
