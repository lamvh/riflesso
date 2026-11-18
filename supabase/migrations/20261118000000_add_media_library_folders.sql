-- Folders the editor creates on the dashboard's Media screen before any file
-- is in them.
--
-- A folder in media_library_labels exists only while some file is filed in
-- it. This table keeps the folders made with "New folder", so an empty one
-- stays in the sidebar until it is removed. Folders that only come from files
-- are not copied here; the dashboard shows the union of both.
--
-- * path: nested folders are a path, 'Albums/Vogue'. Same rules as
--         media_library_labels.folder (at most 4 levels, 60 characters each),
--         checked by the dashboard; the database only caps the length.
--
-- Renaming a folder moves its row (and nested rows) along; removing a folder
-- deletes them. Files and their URLs are never touched.
--
-- Service-role only: visitors never read it.

create table public.media_library_folders (
  path text primary key check (length(path) between 1 and 300),
  created_at timestamptz not null default now()
);

alter table public.media_library_folders enable row level security;
grant all on public.media_library_folders to service_role;
