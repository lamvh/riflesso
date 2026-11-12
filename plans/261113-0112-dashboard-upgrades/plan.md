# Dashboard upgrades — history, bulk, ⌘K, activity, drag-drop, health, preview

Status: implemented — awaiting user DB migration (backup first)

## Scope (user picked items 3,4,5,6,7,9,10)
1. History + restore — `content_revisions` table; snapshot written by `publishSiteContent` after each save (edits within 2 min coalesce into one row; a "before" snapshot is taken when the DB revision has no row yet). `/dashboard/history` lists rows, restore loads snapshot into draft → autosave publishes it as a new revision.
2. Bulk actions — select rows in Artists (show/hide, add/remove category, delete) and Albums (live/draft, homepage on/off, delete).
3. ⌘K palette — screens, artists, albums, categories, actions.
4. Persistent activity — each revision row stores the session's activity lines (`summary`); Overview "Recent activity" reads it with timestamps.
5. Drag-drop upload (portrait, album images incl. multi-file, hero). Focal-point picker dropped: public site ignores artist/album `pos` (object-center), hero keeps its 3 preset crops — needs user decision.
6. Health indicator — shared connection-health store (5 min TTL); dot on sidebar Status item + strip on Overview.
7. Preview — pause autosave; "Preview" stores draft in `content_previews`, enables Next draft mode + token cookie; public getters render the preview content; banner with Exit on public pages.

## Constraints
- Migration `20261113013000_add_revisions_and_previews.sql` must be run by user after DB backup. Without it: history/preview show "run migration" message; saving keeps working (snapshot errors are swallowed).
- No auth yet — author column nullable.
- Logo untouched.

## Acceptance
- tsc + eslint clean, build passes; screens render; features degrade when tables missing.
