-- Riflesso site content: the relational model behind /dashboard and the public site.
--
-- Design notes
-- * Every entity has a stable uuid. Publishing upserts by id and deletes only
--   the rows an editor removed, so ids, created_at and any future table that
--   references an artist or album (bookings, artist pages, analytics) survive
--   a publish.
-- * Media lives in one table. Albums, portraits, hero slides, section banners
--   and the logo all point at `media_assets`; Supabase Storage columns are
--   already there for when uploads land.
-- * Many-to-many and ordered children are real tables: artist_categories,
--   album_media, album_credits. Credits link to an artist when the name
--   matches one on the roster and keep the free-text name otherwise.
-- * Lookups (territories, album_kinds) are tables, not check constraints, so a
--   new territory or album kind is a row, not a migration.
-- * Reads: anon selects published rows through RLS. Writes: service role only,
--   through `publish_site_content`, one transaction per publish.

create schema if not exists private;

create or replace function private.touch_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- Lookups
-- ---------------------------------------------------------------------------

create table public.territories (
  code text primary key,
  label text not null,
  sort_order integer not null default 0
);

insert into public.territories (code, label, sort_order) values
  ('US', 'US', 1),
  ('EUROPE', 'Europe', 2);

create table public.album_kinds (
  name text primary key,
  sort_order integer not null default 0
);

insert into public.album_kinds (name, sort_order) values
  ('Editorial', 1),
  ('Campaign', 2),
  ('Couture', 3),
  ('Fashion Week', 4),
  ('New Signing', 5);

-- ---------------------------------------------------------------------------
-- Media
-- ---------------------------------------------------------------------------

create table public.media_assets (
  id uuid primary key default gen_random_uuid(),
  url text not null unique,
  media_type text not null default 'image' check (media_type in ('image', 'video')),
  -- Filled once uploads go through Supabase Storage.
  storage_bucket text,
  storage_path text,
  alt_text text not null default '',
  width integer check (width > 0),
  height integer check (height > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (storage_bucket, storage_path)
);

-- ---------------------------------------------------------------------------
-- Site-wide settings, footer links, page copy, contact cards
-- ---------------------------------------------------------------------------

create table public.site_settings (
  id smallint primary key default 1 check (id = 1),
  -- Bumped on every publish. The dashboard sends the revision it loaded, so a
  -- publish from a stale tab is rejected instead of overwriting newer work.
  revision bigint not null default 0,
  brand_name text not null,
  logo_asset_id uuid references public.media_assets (id) on delete set null,
  logo_alt text not null default '',
  meta_title text not null,
  meta_description text not null default '',
  copyright text not null default '',
  published_at timestamptz,
  updated_at timestamptz not null default now()
);

create table public.social_links (
  id uuid primary key default gen_random_uuid(),
  sort_order integer not null,
  label text not null,
  url text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.page_paragraphs (
  id uuid primary key default gen_random_uuid(),
  -- Which page the copy belongs to: 'about' today, more pages later.
  page_slug text not null,
  sort_order integer not null,
  body text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (page_slug, sort_order) deferrable initially deferred
);

create table public.contact_cards (
  id uuid primary key default gen_random_uuid(),
  sort_order integer not null,
  heading text not null,
  address_lines text[] not null default '{}',
  phone text not null default '',
  lead text not null default '',
  email text not null default '',
  link_label text not null default '',
  link_url text not null default '',
  -- About omits these cards; only Contact lists them.
  contact_only boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Artists and categories
-- ---------------------------------------------------------------------------

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  sort_order integer not null,
  name text not null,
  -- Hidden categories stay on artists but drop out of the directory filter.
  is_visible boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- Deferred so swapping two names in one publish does not trip mid-statement.
  constraint categories_name_key unique (name) deferrable initially deferred
);

create table public.artists (
  id uuid primary key default gen_random_uuid(),
  sort_order integer not null,
  name text not null,
  territory_code text not null references public.territories (code) on update cascade,
  portrait_asset_id uuid references public.media_assets (id) on delete set null,
  portrait_position text not null default '50% 18%',
  bio text not null default '',
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index artists_published_order_idx on public.artists (is_published, sort_order);
create index artists_lower_name_idx on public.artists (lower(name));
create index artists_territory_idx on public.artists (territory_code);
create index artists_portrait_idx on public.artists (portrait_asset_id);

create table public.artist_categories (
  artist_id uuid not null references public.artists (id) on delete cascade,
  category_id uuid not null references public.categories (id) on delete cascade,
  sort_order integer not null default 0,
  primary key (artist_id, category_id)
);

create index artist_categories_category_idx on public.artist_categories (category_id);

-- ---------------------------------------------------------------------------
-- Albums
-- ---------------------------------------------------------------------------

create table public.albums (
  id uuid primary key default gen_random_uuid(),
  sort_order integer not null,
  title text not null,
  kind text not null references public.album_kinds (name) on update cascade,
  is_published boolean not null default false,
  -- Eligible for the homepage rows sourced from its kind.
  show_on_home boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index albums_home_idx on public.albums (is_published, show_on_home, kind, sort_order);

create table public.album_media (
  album_id uuid not null references public.albums (id) on delete cascade,
  -- 1 is the cover.
  sort_order integer not null,
  asset_id uuid not null references public.media_assets (id) on delete restrict,
  object_position text not null default '50% 18%',
  primary key (album_id, sort_order)
);

create index album_media_asset_idx on public.album_media (asset_id);

create table public.album_credits (
  album_id uuid not null references public.albums (id) on delete cascade,
  sort_order integer not null,
  -- Set when the credited name matches an artist on the roster.
  artist_id uuid references public.artists (id) on delete set null,
  name text not null,
  role text not null default '',
  primary key (album_id, sort_order)
);

create index album_credits_artist_idx on public.album_credits (artist_id);

-- ---------------------------------------------------------------------------
-- Homepage
-- ---------------------------------------------------------------------------

create table public.hero_slides (
  id uuid primary key default gen_random_uuid(),
  sort_order integer not null,
  publication text not null,
  -- "Name — Role, Name — Role", printed as one running line.
  credit_line text not null default '',
  asset_id uuid references public.media_assets (id) on delete set null,
  object_position text not null default '50% 18%',
  caption_color text not null default '#fff',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index hero_slides_asset_idx on public.hero_slides (asset_id);

create table public.home_sections (
  id uuid primary key default gen_random_uuid(),
  sort_order integer not null,
  label text not null,
  -- Each layout is a renderer in code, so the set is a check, not a lookup.
  layout text not null check (layout in ('Scroll row', 'Full-bleed', 'Banner')),
  source_kind text not null references public.album_kinds (name) on update cascade,
  is_visible boolean not null default true,
  -- Full-bleed sections front this album; Banner sections show this asset.
  album_id uuid references public.albums (id) on delete set null,
  asset_id uuid references public.media_assets (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index home_sections_album_idx on public.home_sections (album_id);
create index home_sections_asset_idx on public.home_sections (asset_id);

-- ---------------------------------------------------------------------------
-- updated_at triggers
-- ---------------------------------------------------------------------------

do $$
declare
  t text;
begin
  foreach t in array array[
    'media_assets', 'site_settings', 'social_links', 'page_paragraphs',
    'contact_cards', 'categories', 'artists', 'albums', 'hero_slides', 'home_sections'
  ]
  loop
    execute format(
      'create trigger touch_updated_at before update on public.%I
         for each row execute function private.touch_updated_at()',
      t
    );
  end loop;
end;
$$;

-- ---------------------------------------------------------------------------
-- Row level security: the public site reads with the anon key
-- ---------------------------------------------------------------------------

do $$
declare
  t text;
begin
  foreach t in array array[
    'territories', 'album_kinds', 'media_assets', 'site_settings', 'social_links',
    'page_paragraphs', 'contact_cards', 'categories', 'artists', 'artist_categories',
    'albums', 'album_media', 'album_credits', 'hero_slides', 'home_sections'
  ]
  loop
    execute format('alter table public.%I enable row level security', t);
    execute format('grant select on public.%I to anon, authenticated', t);
    execute format('grant all on public.%I to service_role', t);
  end loop;

  -- Tables with nothing to hide.
  foreach t in array array[
    'territories', 'album_kinds', 'media_assets', 'site_settings', 'social_links',
    'page_paragraphs', 'contact_cards', 'categories', 'hero_slides', 'home_sections'
  ]
  loop
    execute format(
      'create policy "Public read" on public.%I for select to anon, authenticated using (true)',
      t
    );
  end loop;
end;
$$;

create policy "Published artists are public" on public.artists
  for select to anon, authenticated using (is_published);

create policy "Categories of published artists are public" on public.artist_categories
  for select to anon, authenticated using (
    exists (
      select 1 from public.artists a
      where a.id = artist_id and a.is_published
    )
  );

create policy "Published albums are public" on public.albums
  for select to anon, authenticated using (is_published);

create policy "Media of published albums is public" on public.album_media
  for select to anon, authenticated using (
    exists (
      select 1 from public.albums a
      where a.id = album_id and a.is_published
    )
  );

create policy "Credits of published albums are public" on public.album_credits
  for select to anon, authenticated using (
    exists (
      select 1 from public.albums a
      where a.id = album_id and a.is_published
    )
  );

-- ---------------------------------------------------------------------------
-- Publishing
--
-- `p_content` shape (snake_case, list order becomes sort_order):
--   settings: { brand_name, logo_url, logo_alt, meta_title, meta_description,
--               copyright, about_paragraphs: [text], social_links: [{label, url}] }
--   contacts: [{ id, heading, address_lines, phone, lead, email, link_label,
--                link_url, contact_only }]
--   cats:     [{ id, name, is_visible }]
--   artists:  [{ id, name, territory_code, portrait_url, portrait_position, bio,
--                is_published, category_ids: [uuid] }]
--   albums:   [{ id, title, kind, is_published, show_on_home,
--                media: [{ url, media_type, object_position }],
--                credits: [{ name, role }] }]
--   slides:   [{ id, publication, credit_line, image_url, object_position, caption_color }]
--   blocks:   [{ id, label, layout, source_kind, is_visible, album_id, image_url }]
-- ---------------------------------------------------------------------------

-- The asset row for a URL, created on first sight. Null for an empty URL.
create or replace function private.media_asset_id(p_url text, p_media_type text default 'image')
returns uuid
language plpgsql
set search_path = ''
as $$
declare
  v_url text := nullif(btrim(p_url), '');
  v_id uuid;
begin
  if v_url is null then
    return null;
  end if;

  insert into public.media_assets (url, media_type)
  values (v_url, coalesce(p_media_type, 'image'))
  on conflict (url) do update set media_type = excluded.media_type
    where public.media_assets.media_type is distinct from excluded.media_type
  returning id into v_id;

  if v_id is null then
    select m.id into v_id from public.media_assets m where m.url = v_url;
  end if;

  return v_id;
end;
$$;

create or replace function private.publish_settings(p jsonb, p_revision bigint)
returns void
language plpgsql
set search_path = ''
as $$
begin
  insert into public.site_settings (
    id, revision, brand_name, logo_asset_id, logo_alt, meta_title,
    meta_description, copyright, published_at
  )
  values (
    1, p_revision, p ->> 'brand_name', private.media_asset_id(p ->> 'logo_url'),
    coalesce(p ->> 'logo_alt', ''), p ->> 'meta_title',
    coalesce(p ->> 'meta_description', ''), coalesce(p ->> 'copyright', ''), now()
  )
  on conflict (id) do update set
    revision = excluded.revision,
    brand_name = excluded.brand_name,
    logo_asset_id = excluded.logo_asset_id,
    logo_alt = excluded.logo_alt,
    meta_title = excluded.meta_title,
    meta_description = excluded.meta_description,
    copyright = excluded.copyright,
    published_at = excluded.published_at;

  -- Footer links and page copy are short value lists with nothing pointing at
  -- them, so they are replaced rather than diffed.
  delete from public.social_links where true;
  insert into public.social_links (sort_order, label, url)
  select e.ord, e.item ->> 'label', e.item ->> 'url'
  from jsonb_array_elements(coalesce(p -> 'social_links', '[]')) with ordinality as e(item, ord);

  delete from public.page_paragraphs where page_slug = 'about';
  insert into public.page_paragraphs (page_slug, sort_order, body)
  select 'about', e.ord, e.body
  from jsonb_array_elements_text(coalesce(p -> 'about_paragraphs', '[]')) with ordinality as e(body, ord);
end;
$$;

create or replace function private.publish_contact_cards(p jsonb)
returns void
language plpgsql
set search_path = ''
as $$
begin
  insert into public.contact_cards as t (
    id, sort_order, heading, address_lines, phone, lead, email, link_label,
    link_url, contact_only
  )
  select r.id, e.ord, r.heading, coalesce(r.address_lines, '{}'), coalesce(r.phone, ''),
    coalesce(r.lead, ''), coalesce(r.email, ''), coalesce(r.link_label, ''),
    coalesce(r.link_url, ''), coalesce(r.contact_only, false)
  from jsonb_array_elements(p) with ordinality as e(item, ord)
  cross join lateral jsonb_to_record(e.item) as r(
    id uuid, heading text, address_lines text[], phone text, lead text,
    email text, link_label text, link_url text, contact_only boolean
  )
  on conflict (id) do update set
    sort_order = excluded.sort_order,
    heading = excluded.heading,
    address_lines = excluded.address_lines,
    phone = excluded.phone,
    lead = excluded.lead,
    email = excluded.email,
    link_label = excluded.link_label,
    link_url = excluded.link_url,
    contact_only = excluded.contact_only
  where (t.sort_order, t.heading, t.address_lines, t.phone, t.lead, t.email,
         t.link_label, t.link_url, t.contact_only)
    is distinct from
        (excluded.sort_order, excluded.heading, excluded.address_lines, excluded.phone,
         excluded.lead, excluded.email, excluded.link_label, excluded.link_url,
         excluded.contact_only);

  delete from public.contact_cards t
  where not exists (
    select 1 from jsonb_array_elements(p) x where (x ->> 'id')::uuid = t.id
  );
end;
$$;

create or replace function private.publish_categories(p jsonb)
returns void
language plpgsql
set search_path = ''
as $$
begin
  insert into public.categories as t (id, sort_order, name, is_visible)
  select r.id, e.ord, btrim(r.name), coalesce(r.is_visible, true)
  from jsonb_array_elements(p) with ordinality as e(item, ord)
  cross join lateral jsonb_to_record(e.item) as r(id uuid, name text, is_visible boolean)
  on conflict (id) do update set
    sort_order = excluded.sort_order,
    name = excluded.name,
    is_visible = excluded.is_visible
  where (t.sort_order, t.name, t.is_visible)
    is distinct from (excluded.sort_order, excluded.name, excluded.is_visible);

  -- Cascades to artist_categories.
  delete from public.categories t
  where not exists (
    select 1 from jsonb_array_elements(p) x where (x ->> 'id')::uuid = t.id
  );
end;
$$;

create or replace function private.publish_artists(p jsonb)
returns void
language plpgsql
set search_path = ''
as $$
begin
  insert into public.artists as t (
    id, sort_order, name, territory_code, portrait_asset_id, portrait_position,
    bio, is_published
  )
  select r.id, e.ord, btrim(r.name), r.territory_code,
    private.media_asset_id(r.portrait_url), coalesce(r.portrait_position, '50% 18%'),
    coalesce(r.bio, ''), coalesce(r.is_published, false)
  from jsonb_array_elements(p) with ordinality as e(item, ord)
  cross join lateral jsonb_to_record(e.item) as r(
    id uuid, name text, territory_code text, portrait_url text,
    portrait_position text, bio text, is_published boolean
  )
  on conflict (id) do update set
    sort_order = excluded.sort_order,
    name = excluded.name,
    territory_code = excluded.territory_code,
    portrait_asset_id = excluded.portrait_asset_id,
    portrait_position = excluded.portrait_position,
    bio = excluded.bio,
    is_published = excluded.is_published
  where (t.sort_order, t.name, t.territory_code, t.portrait_asset_id,
         t.portrait_position, t.bio, t.is_published)
    is distinct from
        (excluded.sort_order, excluded.name, excluded.territory_code,
         excluded.portrait_asset_id, excluded.portrait_position, excluded.bio,
         excluded.is_published);

  delete from public.artists t
  where not exists (
    select 1 from jsonb_array_elements(p) x where (x ->> 'id')::uuid = t.id
  );

  -- Category links: drop the ones no longer wanted, upsert the rest.
  delete from public.artist_categories ac
  where not exists (
    select 1
    from jsonb_array_elements(p) a(item)
    cross join lateral jsonb_array_elements_text(coalesce(a.item -> 'category_ids', '[]')) c(category_id)
    where (a.item ->> 'id')::uuid = ac.artist_id
      and c.category_id::uuid = ac.category_id
  );

  insert into public.artist_categories as t (artist_id, category_id, sort_order)
  select (a.item ->> 'id')::uuid, c.category_id::uuid, c.ord
  from jsonb_array_elements(p) a(item)
  cross join lateral jsonb_array_elements_text(coalesce(a.item -> 'category_ids', '[]'))
    with ordinality as c(category_id, ord)
  where exists (select 1 from public.categories k where k.id = c.category_id::uuid)
  on conflict (artist_id, category_id) do update set sort_order = excluded.sort_order
  where t.sort_order is distinct from excluded.sort_order;
end;
$$;

create or replace function private.publish_albums(p jsonb)
returns void
language plpgsql
set search_path = ''
as $$
begin
  insert into public.albums as t (id, sort_order, title, kind, is_published, show_on_home)
  select r.id, e.ord, btrim(r.title), r.kind, coalesce(r.is_published, false),
    coalesce(r.show_on_home, false)
  from jsonb_array_elements(p) with ordinality as e(item, ord)
  cross join lateral jsonb_to_record(e.item) as r(
    id uuid, title text, kind text, is_published boolean, show_on_home boolean
  )
  on conflict (id) do update set
    sort_order = excluded.sort_order,
    title = excluded.title,
    kind = excluded.kind,
    is_published = excluded.is_published,
    show_on_home = excluded.show_on_home
  where (t.sort_order, t.title, t.kind, t.is_published, t.show_on_home)
    is distinct from
        (excluded.sort_order, excluded.title, excluded.kind, excluded.is_published,
         excluded.show_on_home);

  -- Cascades to album_media and album_credits.
  delete from public.albums t
  where not exists (
    select 1 from jsonb_array_elements(p) x where (x ->> 'id')::uuid = t.id
  );

  -- Frames, keyed by position within the album.
  insert into public.album_media as t (album_id, sort_order, asset_id, object_position)
  select (a.item ->> 'id')::uuid, m.ord,
    private.media_asset_id(m.item ->> 'url', m.item ->> 'media_type'),
    coalesce(m.item ->> 'object_position', '50% 18%')
  from jsonb_array_elements(p) a(item)
  cross join lateral jsonb_array_elements(coalesce(a.item -> 'media', '[]'))
    with ordinality as m(item, ord)
  on conflict (album_id, sort_order) do update set
    asset_id = excluded.asset_id,
    object_position = excluded.object_position
  where (t.asset_id, t.object_position)
    is distinct from (excluded.asset_id, excluded.object_position);

  delete from public.album_media t
  using jsonb_array_elements(p) a(item)
  where (a.item ->> 'id')::uuid = t.album_id
    and t.sort_order > jsonb_array_length(coalesce(a.item -> 'media', '[]'));

  -- Credits, linked to the roster by case-insensitive name.
  insert into public.album_credits as t (album_id, sort_order, artist_id, name, role)
  select (a.item ->> 'id')::uuid, c.ord,
    (
      select ar.id from public.artists ar
      where lower(ar.name) = lower(btrim(c.item ->> 'name'))
      order by ar.sort_order
      limit 1
    ),
    btrim(c.item ->> 'name'), coalesce(c.item ->> 'role', '')
  from jsonb_array_elements(p) a(item)
  cross join lateral jsonb_array_elements(coalesce(a.item -> 'credits', '[]'))
    with ordinality as c(item, ord)
  on conflict (album_id, sort_order) do update set
    artist_id = excluded.artist_id,
    name = excluded.name,
    role = excluded.role
  where (t.artist_id, t.name, t.role)
    is distinct from (excluded.artist_id, excluded.name, excluded.role);

  delete from public.album_credits t
  using jsonb_array_elements(p) a(item)
  where (a.item ->> 'id')::uuid = t.album_id
    and t.sort_order > jsonb_array_length(coalesce(a.item -> 'credits', '[]'));
end;
$$;

create or replace function private.publish_hero_slides(p jsonb)
returns void
language plpgsql
set search_path = ''
as $$
begin
  insert into public.hero_slides as t (
    id, sort_order, publication, credit_line, asset_id, object_position, caption_color
  )
  select r.id, e.ord, r.publication, coalesce(r.credit_line, ''),
    private.media_asset_id(r.image_url), coalesce(r.object_position, '50% 18%'),
    coalesce(r.caption_color, '#fff')
  from jsonb_array_elements(p) with ordinality as e(item, ord)
  cross join lateral jsonb_to_record(e.item) as r(
    id uuid, publication text, credit_line text, image_url text,
    object_position text, caption_color text
  )
  on conflict (id) do update set
    sort_order = excluded.sort_order,
    publication = excluded.publication,
    credit_line = excluded.credit_line,
    asset_id = excluded.asset_id,
    object_position = excluded.object_position,
    caption_color = excluded.caption_color
  where (t.sort_order, t.publication, t.credit_line, t.asset_id, t.object_position,
         t.caption_color)
    is distinct from
        (excluded.sort_order, excluded.publication, excluded.credit_line,
         excluded.asset_id, excluded.object_position, excluded.caption_color);

  delete from public.hero_slides t
  where not exists (
    select 1 from jsonb_array_elements(p) x where (x ->> 'id')::uuid = t.id
  );
end;
$$;

create or replace function private.publish_home_sections(p jsonb)
returns void
language plpgsql
set search_path = ''
as $$
begin
  insert into public.home_sections as t (
    id, sort_order, label, layout, source_kind, is_visible, album_id, asset_id
  )
  select r.id, e.ord, r.label, r.layout, r.source_kind, coalesce(r.is_visible, true),
    -- A section pointing at an album that no longer exists falls back to none.
    (select al.id from public.albums al where al.id = r.album_id),
    private.media_asset_id(r.image_url)
  from jsonb_array_elements(p) with ordinality as e(item, ord)
  cross join lateral jsonb_to_record(e.item) as r(
    id uuid, label text, layout text, source_kind text, is_visible boolean,
    album_id uuid, image_url text
  )
  on conflict (id) do update set
    sort_order = excluded.sort_order,
    label = excluded.label,
    layout = excluded.layout,
    source_kind = excluded.source_kind,
    is_visible = excluded.is_visible,
    album_id = excluded.album_id,
    asset_id = excluded.asset_id
  where (t.sort_order, t.label, t.layout, t.source_kind, t.is_visible, t.album_id,
         t.asset_id)
    is distinct from
        (excluded.sort_order, excluded.label, excluded.layout, excluded.source_kind,
         excluded.is_visible, excluded.album_id, excluded.asset_id);

  delete from public.home_sections t
  where not exists (
    select 1 from jsonb_array_elements(p) x where (x ->> 'id')::uuid = t.id
  );
end;
$$;

-- Entry point the dashboard calls. Returns the new revision.
create or replace function public.publish_site_content(
  p_content jsonb,
  p_expected_revision bigint
)
returns bigint
language plpgsql
set search_path = ''
as $$
declare
  v_current bigint;
  v_next bigint;
begin
  -- Serialise publishes so two editors cannot interleave their passes.
  perform pg_advisory_xact_lock(hashtext('public.publish_site_content'));

  select s.revision into v_current from public.site_settings s where s.id = 1;
  v_current := coalesce(v_current, 0);
  if v_current <> p_expected_revision then
    raise exception 'stale_revision: expected %, found %', p_expected_revision, v_current;
  end if;
  v_next := v_current + 1;

  -- Order matters: artists link to categories, albums' credits to artists,
  -- sections to albums.
  perform private.publish_settings(p_content -> 'settings', v_next);
  perform private.publish_contact_cards(coalesce(p_content -> 'contacts', '[]'));
  perform private.publish_categories(coalesce(p_content -> 'cats', '[]'));
  perform private.publish_artists(coalesce(p_content -> 'artists', '[]'));
  perform private.publish_albums(coalesce(p_content -> 'albums', '[]'));
  perform private.publish_hero_slides(coalesce(p_content -> 'slides', '[]'));
  perform private.publish_home_sections(coalesce(p_content -> 'blocks', '[]'));

  return v_next;
end;
$$;

-- Functions are executable by PUBLIC by default; lock them to the service role.
revoke all on function public.publish_site_content(jsonb, bigint) from public, anon, authenticated;
grant execute on function public.publish_site_content(jsonb, bigint) to service_role;

revoke all on all functions in schema private from public, anon, authenticated;
grant usage on schema private to service_role;
grant execute on all functions in schema private to service_role;
