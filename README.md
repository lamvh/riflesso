# Riflesso

Implement các màn hình cho Riflesso Studio bằng Next.js 16
(App Router) + React 19 + Tailwind CSS v4.

| Route | Nội dung |
| --- | --- |
| `/` | Trang chủ — hero slider 8 slide, 5 rail cuộn ngang, 2 khối feature |
| `/artists` | Danh bạ nghệ sĩ — lọc theo lãnh thổ / danh mục / tên, ảnh preview sticky |
| `/about` | Giới thiệu — 2 đoạn copy + lưới liên hệ |
| `/contact` | Liên hệ — lưới đầy đủ 9 card |
| `not-found` | Trang 404 — số "404" khoét ảnh hero, cross-fade 8 slide |
| `/dashboard/*` | Content admin — 9 màn quản trị nội dung, tự lưu lên Supabase, xem mục riêng bên dưới |

**Search** (nút ở masthead, hoặc ⌘K / `/`) tìm trên artist đang hiện, album đang có
trên trang chủ, và các trang. Index lấy từ `/api/search-index` (cùng nguồn đọc
public, nên artist ẩn / album draft không bao giờ lộ ra). Chọn artist →
`/artists?artist=<tên>` (danh bạ tự chuyển territory + discipline và lọc theo tên);
chọn album → `/?work=<album id>` (mở gallery như khi bấm card).

Work detail không có route riêng: trong design nó là overlay `position:fixed`
phủ lên trang chủ, mở khi click card của rail, và đóng bằng nút X hoặc `Esc`.

## Chạy dự án

```bash
npm install
npm run dev     # http://localhost:3000
npm run build   # build production (route public prerender, dashboard render theo request)
npm run lint
node scripts/generate-favicons.mjs   # tạo lại favicon/icon từ design/favicon-source.jpg
```

Ảnh gốc favicon (`design/*-source.*`) chỉ nằm ở máy, không commit, không deploy;
chỉ các file icon nhỏ trong `src/app/` được commit.

### Supabase

Nội dung site — logo, SEO, copy About, contact card, footer, artist, category,
album, hero, section trang chủ — nằm trong Supabase Postgres. Chưa cấu hình
(hoặc chưa chạy migration, hoặc chưa publish lần nào) thì site vẫn chạy bằng
nội dung gốc trong `src/data/*`.

1. **Backup DB**, rồi chạy lần lượt (SQL Editor của Supabase, hoặc `supabase db push`):
   - `supabase/migrations/20260913142200_create_site_content.sql` — schema
   - `supabase/migrations/20260913150700_seed_site_content.sql` — nạp nội dung hiện
     có của repo (revision 1). Chỉ chạy khi DB trống, chạy lại không làm gì.
2. `cp .env.example .env.local` rồi điền:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY` — publishable key, dùng cho đọc public
   - `SUPABASE_SERVICE_ROLE_KEY` — secret key, chỉ server dùng để đọc draft + publish.
     Không bao giờ để prefix `NEXT_PUBLIC_`.
3. `npm run dev` → `/dashboard` → sửa bất kỳ mục nào. Lần lưu đầu ghi toàn bộ nội
   dung gốc vào DB (revision 1). Từ đó site đọc từ DB.
4. **Backup DB**, rồi chạy `supabase/migrations/20261113003000_add_visibility_flags.sql`
   — cột ẩn/hiện cho trang, hero slide, contact card, social link. Chưa chạy thì
   site vẫn đọc bình thường (mọi thứ coi là đang hiện), nhưng lần lưu nào có mục
   bị ẩn sẽ bị từ chối kèm lời nhắn chạy migration.
5. **Backup DB**, rồi chạy `supabase/migrations/20261113013000_add_revisions_and_previews.sql`
   — bảng `content_revisions` (History + Recent activity qua mọi phiên) và
   `content_previews` (Preview). Chưa chạy thì việc lưu vẫn bình thường; History
   và Preview chỉ hiện lời nhắn chạy migration.
6. **Backup DB**, rồi chạy `supabase/migrations/20261113020000_add_content_views.sql`
   — bảng `content_views` đếm lượt xem cho panel Visitors ở Overview. Chỉ lưu
   số đếm theo ngày cho (trang | album mở gallery | artist dừng chuột ~0.8s),
   không lưu IP, cookie hay user agent. Bỏ qua bot, trình duyệt bật GPC/DNT, và
   editor đang Preview. Chưa chạy thì site vẫn bình thường, panel báo cần migration.
7. **Backup DB**, rồi chạy `supabase/migrations/20261113040000_add_media_library_labels.sql`
   — bảng `media_library_labels` giữ folder + tag của file trong màn Media. Chưa
   chạy thì màn Media vẫn list, lọc theo album/artist bình thường; chỉ phần
   folder/tag tắt kèm lời nhắn chạy migration.
8. **Backup DB**, rồi chạy `supabase/migrations/20261113050000_add_contact_whatsapp.sql`
   — thêm cột `whatsapp` cho contact card (hiện trên About + Contact, link wa.me).
   Chưa chạy thì site vẫn bình thường; số WhatsApp nhập trong dashboard chỉ chưa được lưu khi Publish.

> **Chưa có auth.** Server action publish (và đọc History, tạo Preview) mở cho bất kỳ ai gọi được tới nó. Phải
> thêm đăng nhập vào `src/lib/dashboard/publish-site-content.ts` + `/dashboard`
> trước khi deploy public.

**Schema** (`supabase/migrations/`) là quan hệ, không phải JSON blob:

| Nhóm | Bảng |
| --- | --- |
| Lookup | `territories`, `album_kinds` — thêm territory/kind là thêm dòng |
| Media | `media_assets` — mọi URL ảnh/video (logo, portrait, frame, hero, banner) trỏ về đây; có sẵn `storage_bucket` / `storage_path` cho Supabase Storage |
| Site | `site_settings` (1 dòng, giữ `revision`), `social_links`, `page_paragraphs` (theo `page_slug`), `contact_cards` |
| Artist | `artists`, `categories`, `artist_categories` (N-N) |
| Album | `albums`, `album_media` (frame có thứ tự + crop), `album_credits` (link `artist_id` khi tên khớp roster) |
| Trang chủ | `hero_slides`, `home_sections` (FK tới `albums` / `media_assets`) |

- **UUID ổn định.** `publish_site_content(p_content, p_expected_revision)` upsert
  theo id và chỉ xoá dòng editor đã bỏ, trong một transaction, có advisory lock.
  Id, `created_at` và mọi bảng sau này FK tới artist/album đều sống qua publish;
  dòng không đổi không bị update (`updated_at` giữ nguyên).
- **Chống ghi đè.** Dashboard gửi revision nó đã load; lệch là bị từ chối
  (`stale_revision`) thay vì đè lên publish của người khác.
- **RLS.** Anon chỉ `select`; artist/album draft và frame/credit của chúng bị ẩn.
  Hàm publish và helper trong schema `private` chỉ `service_role` gọi được.
- **Đọc có phân trang** (Supabase cắt 1000 dòng/response) và **tách theo trang**:
  `/artists` không tải album, `/contact` không tải artist
  (`src/lib/content/public-site-content.ts`). Cache bằng `unstable_cache` tag
  `site-content`; publish gọi `updateTag` + `revalidatePath("/", "layout")`.

### Ảnh: Cloudflare R2

Ảnh và video upload từ dashboard nằm trong bucket R2. Chưa cấu hình thì nút
upload báo lỗi rõ ràng, phần còn lại của dashboard vẫn chạy bình thường.

1. R2 → **Manage API tokens** → tạo token quyền *Object Read & Write*, lấy
   Access Key ID + Secret.
2. Chọn nơi phục vụ ảnh, một trong hai:
   - **Custom domain** (nên dùng cho production): bucket → Settings → Connect
     Domain → `cdn.riflesso.studio`. Domain phải nằm trong Cloudflare.
   - **r2.dev**: bucket → Settings → Public Development URL → Enable. Tiện để
     thử, Cloudflare khuyến cáo không dùng cho production.
3. Điền vào `.env.local`: `R2_ENDPOINT`, `R2_BUCKET`, `R2_ACCESS_KEY_ID`,
   `R2_SECRET_ACCESS_KEY`, `NEXT_PUBLIC_MEDIA_BASE_URL`. Đổi chỗ phục vụ ảnh sau
   này chỉ cần sửa `NEXT_PUBLIC_MEDIA_BASE_URL` (ảnh cũ vẫn giữ URL đã lưu trong DB).

**Đường đi của một file** (`src/lib/media/`, `src/app/api/media/upload/`):

- Trình duyệt POST file tới `/api/media/upload` (không cần cấu hình CORS cho bucket).
- Ảnh: `sharp` xoay theo EXIF, resize cạnh dài tối đa **2400px**, rồi encode cả
  **WebP** lẫn **JPEG** (mozjpeg) ở chất lượng 80 và **giữ bản nhẹ hơn** — WebP
  không phải lúc nào cũng nhỏ hơn, ảnh nhiều hạt đã nén sẵn có khi còn phình ra.
  Ảnh gốc đã nhẹ hơn cả hai và không cần resize thì giữ nguyên (trường hợp duy
  nhất metadata không bị xoá). Ảnh máy ảnh 8MB thường còn 300–600KB.
  Trên Cloudflare Workers `sharp` không chạy được, nên cùng các bước đó đi qua
  binding **Cloudflare Images** (`IMAGES`); GIF trên Workers giữ nguyên để
  không mất animation. Chọn encoder ở `src/lib/media/optimize-image.ts`.
- Video (mp4/webm/mov) giữ nguyên, không nén. Giới hạn 50MB mỗi file.
- Key dạng `uploads/2026/09/<tên-file>-<8 ký tự>.webp` — mỗi lần upload là một
  object mới, nên cache `immutable` một năm.
- Route trả về URL công khai, dashboard điền vào ô địa chỉ, và ảnh lên site ở lần
  autosave tiếp theo.

**Màn Media** (`src/lib/dashboard/list-media-library.ts`, `media-usage.ts`) list
toàn bộ bucket (tối đa 20.000 object) rồi so key với URL trong cả nội dung đã
lưu lẫn bản đang sửa: **In use**, **Saving** (chỉ có trong thay đổi chưa lưu),
**Being removed** (vẫn trên site tới khi lần lưu tới xong), **Unused**. So theo hậu tố
path nên URL lưu với `NEXT_PUBLIC_MEDIA_BASE_URL` cũ vẫn được nhận ra.

**Upload nhiều file / kéo thả** — màn Media có nút **Upload** (chọn nhiều file) và
nhận kéo thả cả vùng danh sách; đang mở folder nào thì file mới vào luôn folder đó
và được chọn sẵn để gắn tag. Album có **Upload images** (nhiều file, mỗi file vào
album ngay khi up xong) và **Add from library** (tick nhiều ảnh, thêm theo thứ tự
tick). Hộp "Choose from library" ở mọi chỗ cũng nhận kéo thả / Upload; ở album
file vừa up được tick sẵn, ở ô một ảnh thì up 1 file là chọn luôn. File mới up
tính là Unused cho tới khi được gắn vào đâu đó.

**Folder + tag** (`src/lib/media/media-label-store.ts`, `media-label-types.ts`,
`src/lib/dashboard/media-groups.ts`, `media-library-filters.ts`) — hai kiểu phân loại:

- **Folder và tag tự đặt**, lưu ở bảng `media_library_labels` theo object key.
  Folder chỉ là nhãn, **không đổi key trên R2**, nên chuyển folder không làm hỏng
  URL ảnh đã lưu. Folder lồng nhau viết dạng path (`Albums/Vogue Italia`, tối đa 4
  cấp); một folder tồn tại khi còn file trong đó. Chọn file (checkbox trên card,
  hoặc "Select shown") → thanh dưới: **Move to folder…** (gõ tên mới hoặc chọn
  có sẵn, để trống = unfiled), **Add tag…** (nhiều tag cách nhau dấu phẩy),
  **Remove tag**, **Delete** (chỉ file Unused). Sidebar folder có **Rename**
  (folder con đi theo) và **Remove folder** (file thành unfiled, không xoá file).
- **Nhóm tự động theo album (bộ ảnh) và artist**, tính từ nội dung đang sửa,
  không cần lưu: file thuộc album nào, portrait của artist nào, và frame của album
  cũng được gắn cho artist trong roster có tên ở credit của album đó.

Lọc theo folder, album, artist, tag có ở cả màn Media lẫn hộp "Choose from
library"; ô search tìm cả tên file, folder, tag, album/artist và record đang dùng
file. Bấm chip tag/album/artist trên card để lọc nhanh. Xoá file thì xoá luôn
dòng nhãn của nó.

**Xoá file** (`src/lib/dashboard/delete-media-objects.ts`) chỉ hiện với file
**Unused**, có hỏi xác nhận. Vì chưa có auth, server không tin client: chỉ nhận
key trong `uploads/`, đọc lại DB (cả record draft) và giữ lại mọi file còn record
trỏ tới; DB không trả lời thì không xoá gì. Thay đổi chưa kịp lưu trong trình
duyệt người khác thì server không thấy — hai người cùng sửa thì Refresh trước khi xoá.

> **Chưa có auth.** `/api/media/upload` mở cho bất kỳ ai gọi tới. Thêm đăng nhập
> trước khi deploy public, nếu không bucket có thể bị lạm dụng.

### Deploy: Cloudflare Workers (OpenNext)

Cấu hình nằm trong repo: `wrangler.jsonc`, `open-next.config.ts`. Workers Builds
dùng đúng file này, không tự sinh config nữa.

1. Không dùng incremental cache / tag cache (không cần R2 cache bucket hay D1):
   mỗi lượt xem trang public render lại và đọc thẳng Supabase, nên mỗi lần lưu
   hiện ngay. Traffic tăng thì thêm `r2IncrementalCache` + `d1NextTagCache` vào
   `open-next.config.ts` (xem https://opennext.js.org/cloudflare/caching).
2. Biến không bí mật nằm ở `vars` trong `wrangler.jsonc`. Key bí mật đặt dạng
   **Secret** (không bị deploy xoá): `npx wrangler secret put` cho
   `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_ANON_KEY`, `R2_ACCESS_KEY_ID`,
   `R2_SECRET_ACCESS_KEY`.
3. Workers Builds → **Build variables**: `NEXT_PUBLIC_MEDIA_BASE_URL` (được nhúng
   vào bundle lúc build). Domain public mặc định `https://riflesso.vn` được
   hard-code ở `src/lib/seo/site-url.ts` (canonical, ảnh share, sitemap,
   robots); chỉ đặt `NEXT_PUBLIC_SITE_URL` khi build cho domain khác (staging).
4. `npm run deploy`, hoặc push để Workers Builds tự build. Mở
   `/dashboard/status` để xem từng kết nối.

`npm run preview` chạy bản build Workers ở máy (env lấy từ `.dev.vars`).

**Kết nối hỏng không làm sập app.** Env sai định dạng (`SUPABASE_URL`,
`R2_ENDPOINT`) được coi là chưa cấu hình; đọc public lỗi thì trang render nội
dung gốc (fallback nằm ngoài cache, request sau thử lại DB); dashboard đọc lỗi
thì mở ở chế độ offline và tắt tự lưu; upload / list R2 lỗi trả thông báo,
không throw.

## Cấu trúc

```
src/
├── app/
│   ├── globals.css                    # theme tokens + base layer
│   ├── layout.tsx
│   ├── page.tsx                       # trang chủ
│   ├── not-found.tsx                  # trang 404
│   ├── about/page.tsx                 # trang giới thiệu
│   ├── contact/page.tsx               # trang liên hệ
│   ├── artists/page.tsx               # trang danh bạ
│   └── dashboard/                     # layout + 6 route của trang quản trị
├── components/
│   ├── site-header.tsx                # masthead cố định, dùng chung mọi trang
│   ├── site-footer.tsx                # 4 cột link, margin-top 110px
│   ├── contact-grid.tsx               # lưới liên hệ, dùng chung About + Contact
│   ├── search-icon.tsx, close-icon.tsx
│   ├── not-found-panel.tsx            # client — số 404 cross-fade
│   ├── artists-directory.tsx          # client — state lọc của trang Artists
│   ├── artists-filter-sidebar.tsx
│   ├── artists-list.tsx
│   ├── artist-preview-image.tsx
│   ├── home/
│       ├── hero-banner.tsx            # slider + dải thumbnail
│       ├── media-rail.tsx             # rail cuộn ngang
│       ├── media-card.tsx             # card ảnh/video + credit
│       ├── feature-blocks.tsx         # 2 khối feature full-bleed / inset
│       ├── work-detail-context.tsx    # client — sở hữu state overlay đang mở
│       ├── work-detail-overlay.tsx    # client — gallery toàn màn hình
│       ├── section-heading.tsx
│       └── artist-credit-line.tsx
│   └── dashboard/                     # trang quản trị, xem mục Dashboard bên dưới
│       ├── admin-store.tsx            # client — provider + sessionStorage draft
│       ├── admin-chrome.tsx           # drawer + toast, mount trên router outlet
│       ├── dashboard-sidebar.tsx      # sidebar 236px, đếm số theo từng màn
│       ├── dashboard-header.tsx       # header dính — tiêu đề + nút primary theo màn
│       ├── artist-drawer.tsx          # form sửa artist
│       ├── album-drawer.tsx           # form sửa album (lưới frame + credit)
│       ├── hero-editor.tsx            # khối hero banner của màn Homepage
│       ├── section-list.tsx           # danh sách section của trang chủ
│       ├── cover-image.tsx            # <img> thuần, preview URL bất kỳ
│       ├── screens/                   # 5 màn: overview/artists/albums/categories/homepage
│       └── ui/                        # chip, switch, input viền, drawer, image pick
├── hooks/
│   ├── use-drag-scroll.ts             # kéo chuột để cuộn rail
│   └── use-video-autoplay.ts          # play/pause video theo viewport
├── data/
│   ├── media-url.ts                   # helper URL cho public/assets + credit mặc định của studio
│   ├── stories.ts                     # 7 bộ ảnh (shoot), mỗi bộ mở nguyên set ở work detail
│   ├── artists.ts                     # danh bạ artist, suy ra từ rail
│   ├── home-hero-slides.ts            # 8 slide hero
│   ├── home-rail-*.ts                 # 5 rail: editorials/campaigns/couture/…
│   ├── contact-offices.ts             # 9 card của lưới liên hệ
│   └── home-features.ts
└── lib/
    ├── filter-artists.ts              # logic lọc thuần, không phụ thuộc React
    ├── work-detail.ts                 # dựng gallery: nguyên bộ shoot, hoặc hàng xóm trong rail
    ├── media-item.ts                  # type + constructor cho item rail
    ├── media-src.ts                   # URL publish được? next/image tối ưu được? video?
    ├── media/
    │   ├── r2-storage.ts              # client R2 (S3 API) + đặt key cho object
    │   └── optimize-image.ts          # resize 2400px + encode WebP bằng sharp
    ├── supabase/supabase-clients.ts   # client anon (đọc public) + service role (dashboard)
    ├── content/
    │   ├── site-content-types.ts      # SiteContent: settings, contacts, artists, albums…
    │   ├── site-content-queries.ts    # query schema quan hệ → record, có phân trang
    │   ├── public-site-content.ts     # getter có cache cho từng trang public
    │   ├── load-dashboard-content.ts  # đọc cả draft, không cache
    │   ├── site-content-seed.ts       # nội dung gốc của repo, id uuid ổn định
    │   ├── site-content-validation.ts # kiểm payload publish
    │   ├── site-content-publish-payload.ts # record → payload snake_case cho RPC
    │   ├── home-page-view.ts          # album/section/slide → props trang chủ
    │   └── directory-view.ts          # artist/category → danh bạ public
    └── dashboard/
        ├── publish-site-content.ts    # server action lưu (autosave gọi sau mỗi thay đổi)
        ├── admin-settings-reducer.ts  # settings / contact card / social link
        ├── admin-types.ts             # Album / AdminArtist / Slide / Block
        ├── admin-seed.ts              # dựng seed từ data thật của site
        ├── admin-state.ts             # shape state + draft của drawer
        ├── admin-actions.ts           # union action, tách theo nhóm
        ├── admin-record-reducer.ts    # artist / album / drawer
        ├── admin-reducer.ts           # category / hero / section + session
        ├── admin-helpers.ts           # swap, patch, note, fromDraft
        ├── admin-views.ts             # 5 màn: route, nhãn, số liệu dùng chung
        └── rails.ts                   # 5 rail của trang chủ, dùng để seed
```

## Hành vi

**Trang chủ**

- **Hero** — slide chồng nhau, cross-fade `opacity` 0.5s. Click thumbnail để đổi
  slide; màu caption đảo trắng/đen theo từng ảnh. Autoplay 5s tắt mặc định.
- **Rail** — cuộn ngang bằng wheel, touch, hoặc kéo chuột. Click phát sinh ở cuối
  thao tác kéo bị chặn ở capture phase để không vô tình điều hướng.
- **Video** — muted + loop + playsinline; `IntersectionObserver` (margin 200px)
  chỉ phát clip đang trong tầm nhìn, phần còn lại pause.
- **Bốn tham số hiển thị** (khớp props gốc của design) khai báo ở `src/app/page.tsx`:
  `bannerAutoplay` (false), `sliderHeight` (350px, dải 236–460), `hoverZoom` (true),
  `galleryHeight` (72vh, dải 45–85). Ba tham số sau đi xuống card / overlay qua
  custom property `--rfl-rail-height` / `--rfl-rail-zoom` / `--rfl-gallery-height`,
  nên đổi một chỗ là đổi toàn bộ.

**Work detail**

- **Mở** khi click card của 4 rail có `category` (Editorials / Campaigns / Couture /
  Fashion Weeks) hoặc khối Latest Editorial. Rail **New Signs** không có `category`
  nên card của nó điều hướng sang `/artists`, đúng như design.
- **Gallery** được dựng tại chỗ từ chính rail vừa click: frame được click đứng đầu,
  rồi tới các item kế tiếp (vòng qua cuối danh sách), tối đa 6 frame. Design không
  có bộ ảnh riêng cho từng work — xem `src/lib/work-detail.ts`.
- **Điều khiển:** click thumbnail, `←` / `→` để đổi frame, `Esc` hoặc nút X để đóng.
  Thumbnail đang chọn bị làm mờ (opacity 0.4), cùng quy ước với dải hero.
- **Chiều cao khung ảnh bị chặn trên:** `min(--rfl-gallery-height, 100vh - 340px)`.
  340px là phần chừa cho dải thumbnail, các khoảng cách và khối credit, nên caption
  không bị đẩy khỏi màn hình trên viewport thấp.
- **Khác design một điểm:** design gọi `window.scrollTo(0, 0)` khi mở overlay. Vì
  overlay là `fixed` nên thao tác đó không nhìn thấy được lúc mở, chỉ lộ ra khi đóng
  — mất vị trí cuộn ở rail. Bản này giữ nguyên vị trí trang.

**Trang About & Contact**

- **Lưới liên hệ dùng chung.** Cả 2 trang render `ContactGrid`; About bỏ card
  **Brand Partnerships** (design bọc riêng card này trong `sc-if isContact`).
- **Cùng một mốc 200px trên đầu.** About lấy từ `padding-top:200px` của cột copy;
  Contact không có copy nên dùng spacer 110px + `padding-top:90px` của lưới.
- Lưới là `auto-fit` với cột tối thiểu 260px, nên số cột tự co theo bề rộng.

**Trang 404**

- Số "404" là một `<span>` ẩn giữ khung, cộng 8 bản absolute chồng lên nhau, mỗi bản
  lấy một ảnh hero làm `background-image` rồi `background-clip: text`. Đổi frame mỗi
  2.8s, cross-fade 1.2s.
- Panel là sheet `fixed` z-20 nằm dưới masthead (z-30) nên header vẫn bấm được; footer
  bị che hoàn toàn nên `not-found.tsx` không render footer.

**Trang Artists**

- **Territory** (`US` / `EUROPE`) — lọc cứng, chỉ hiện một vùng tại một thời điểm.
- **Category** — 11 mục, mặc định `Hair`, so khớp với danh sách kỹ năng đã
  tách theo `", "`. Không có mục `All` — đúng như design.
- **Query** — khớp chuỗi con tên nghệ sĩ, không phân biệt hoa thường.
- **Active index** — đổi khi hover/click, bị kẹp lại khi danh sách lọc ngắn đi, và
  reset về 0 mỗi khi đổi bộ lọc. Ảnh preview bên phải bám theo index này.

## Dashboard (`/dashboard`)

Trang quản trị nội dung, dựng theo design `Dashboard.dc.html`. Bảy màn, mỗi màn
một route, dùng chung sidebar 236px + header dính (sticky):

| Route | Màn |
| --- | --- |
| `/dashboard` | Overview — 4 ô số liệu, "Needs attention", "Recent activity" |
| `/dashboard/artists` | Bảng nghệ sĩ — lọc, đổi Live/Draft, mở drawer sửa |
| `/dashboard/albums` | Lưới album 4 cột — lọc theo loại, gắn/bỏ khỏi trang chủ |
| `/dashboard/categories` | Danh mục — đổi tên tại chỗ, ẩn/hiện, đổi thứ tự |
| `/dashboard/media` | Mọi file trong bucket R2 — dung lượng, ngày upload, record nào đang dùng; lọc file **Unused** và xoá (từng file hoặc cả loạt) |
| `/dashboard/homepage` | Hero banner + Page sections + khung preview dính |
| `/dashboard/settings` | Site settings — ẩn/hiện, logo, SEO, copy About, footer, contact card (địa chỉ, phone, email) |
| `/dashboard/history` | History — mỗi lần lưu (các lần lưu cách nhau < 2 phút gộp một mục), nội dung đã đổi, Preview / Restore bất kỳ mục nào. Cần migration bước 5 |
| `/dashboard/status` | Status — trạng thái kết nối (Supabase service role + anon, R2 bucket, media URL; check lúc mở màn + nút "Check again") |

**Dữ liệu là dữ liệu thật của site, không phải demo.** Dashboard đọc từ Supabase;
trước lần publish đầu nó dùng nội dung gốc dựng trong
`src/lib/dashboard/admin-seed.ts` (id là uuid băm từ khóa tự nhiên, nên ổn định
giữa các request):

- **Album = một card của rail.** Loại album lấy từ rail chứa nó (Editorials →
  Editorial, New Signs → New Signing…). Card nào front một shoot thì mang theo
  nguyên bộ frame của shoot đó, nên drawer hiện đủ ảnh chứ không chỉ cover. Card
  New Signs không có title nên album lấy tên theo artist: `Tên — Debut`.
- **Artist** suy ra từ credit của rail qua `deriveArtists()` — cùng một hàm trang
  `/artists` dùng — rồi thành list sửa được. Cột **Works** đếm số album đang
  credit tên đó nên nó tự đổi khi sửa credit.
- **Page sections** là 7 section thật của trang chủ, đúng thứ tự trong
  `src/app/page.tsx`.

**Tự lưu, không có bước Publish** (`src/components/dashboard/use-autosave.ts`).
Mỗi thay đổi lên site thật sau ~0,8 giây yên lặng — gõ chữ là một lần lưu, không
phải mỗi phím. Lưu vẫn đi qua `publish_site_content` (một transaction, chống ghi
đè theo revision). Header báo **Saving… / All changes saved / Not saved — lý do**
kèm **Retry**. Bản không hợp lệ (vd. Brand name trống) bị chặn ở client và không
gửi lại cho tới khi sửa; một lần lưu chạy tại một thời điểm, sửa trong lúc đang
lưu được gom vào lần sau. Hệ quả: không còn "nháp" để xem trước hay **Discard** —
muốn giấu thứ đang sửa dở thì tắt nó (xem "Tạm ẩn" bên dưới). Thay đổi chưa lưu
vẫn nằm ở `sessionStorage` kèm revision, nên reload không mất; đóng tab khi còn
thay đổi chưa lưu sẽ bị hỏi lại.

**Tạm ẩn thay vì xoá.** Mọi trang và phần nội dung đều tắt được mà không mất
dữ liệu (`src/lib/content/site-visibility.ts`):

| Ẩn gì | Ở đâu trên dashboard |
| --- | --- |
| Trang Artists / About / Contact (trả 404, rời menu và footer) | Site settings → Visibility; riêng Artists còn có nút con mắt ngay cạnh mục Artists ở sidebar |
| Hero banner, copy About, contact grid trên About, cột social link | Site settings → Visibility (hero cũng có công tắc ở Homepage) |
| Từng hero slide | Homepage → Hero banner → "Show this slide" |
| Từng contact card / social link | Site settings → Contact cards / Footer |
| Artist, album, category, homepage section | Công tắc sẵn có ở từng màn |

Mục ẩn bị lọc một lần trong `public-site-content.ts`, nên mọi trang public đều
không thấy, còn dashboard vẫn thấy đủ. Cờ luôn mang nghĩa "hidden": dữ liệu cũ
không có cờ thì coi là đang hiện. Ảnh của mục đang ẩn vẫn tính là **In use** ở
màn Media, nên không bị xoá nhầm.

**Ảnh upload thẳng lên R2.** Mọi ô ảnh có input URL (`/assets/…` hoặc
`https://…`) kèm nút **Upload a file**: file đi qua `/api/media/upload`, được
nén rồi lưu vào R2, và địa chỉ trả về được điền sẵn vào ô. Lưu từ chối
`blob:`. Ảnh ngoài các host khai báo trong `next.config.ts` render `unoptimized`.

**Khác design ở ba điểm, đều có lý do:**

- **Wordmark.** Design đặt brand là chữ "THE WALL GROUP"; ở đây là ảnh logo lấy
  từ Site settings, mặc định `public/riflesso.png`, kích thước khóa theo `CLAUDE.md`.
- **Recent activity.** Design có sẵn 5 dòng lịch sử bịa. Site không có nguồn
  lịch sử nào để đọc, nên panel ghi đúng những gì phiên làm việc này vừa sửa —
  dòng mới nhất là "Just now", còn lại "Earlier". Chưa sửa gì thì panel nói vậy.
- **Ô "Images".** Design ghi chú "Compressed to 1400px" — một khẳng định về
  pipeline mà dự án không có. Đổi thành "Across every album".

**Ghi chú kỹ thuật:**

- **`hydrated` trong state.** Lần paint đầu phải render nội dung server trả về để
  server và client khớp nhau, nên effect ghi `sessionStorage` sẽ đè nó lên draft sắp đọc.
  Cờ `hydrated` chặn mọi lần ghi cho tới khi đọc xong — không có cờ này thì
  StrictMode remount ở dev xóa sạch draft.
- **Reducer tách ba.** `admin-record-reducer.ts` lo artist/album/drawer,
  `admin-reducer.ts` lo cách site được sắp xếp, `admin-helpers.ts` giữ các hàm
  thuần. Action union nằm riêng ở `admin-actions.ts`.
- **`<img>` thuần trong dashboard.** src là URL người dùng gõ vào, mà
  `next/image` chỉ nhận host khai báo trong `next.config.ts`. Dashboard từ chối
  preview vì chưa allow-list còn tệ hơn là ảnh không tối ưu.

## Ghi chú kỹ thuật

- **Ảnh trong `public/assets/`.** Design tham chiếu 7 frame là `./assets/*.jpg`
  thay vì DAM — hai frame hero (`cover-traces.jpg`, `hero-frame.jpg`), banner
  TWG25 (`twg25-banner.jpg`) và 4 frame nghệ sĩ (`artist-1..4.jpg`). Helper
  `siteAsset()` trong `data/media-url.ts` map sang `/assets/<name>`.
- **Card của một shoot mở nguyên bộ ảnh.** Một `Story` trong `data/stories.ts`
  gom các frame chụp cùng buổi, cùng ê-kíp, vào một card duy nhất trên rail.
  `storyCard()` gắn toàn bộ frame vào `MediaItem.gallery`, nên khi click,
  `buildWorkDetail` trả thẳng set đó thay vì cắt 6 frame hàng xóm trong rail —
  chỗ khác biệt duy nhất so với các card lẻ. `coverIndex` chọn frame đứng đại
  diện trên rail, và gallery được xoay để mở đúng frame vừa click. `category`
  của story ghi đè nhãn của rail, nên bộ Beauty nằm trên rail Editorials vẫn
  hiện "Beauty" ở work detail.
- **Ảnh của shoot nằm ở `public/assets/stories/<slug>-NN.jpg`,** đánh số từ 01
  theo thứ tự đọc. `frameCount` trong `stories.ts` phải khớp số file — không có
  bước quét thư mục lúc build.
- **Rail hoist frame nội bộ lên đầu.** Design sắp lại từng rail: item nào có
  `src` bắt đầu bằng `./assets/` hoặc `./uploads/` được đẩy lên trước, giữ nguyên
  thứ tự tương đối. Ba rail Editorials / Couture / New Signs đã áp thứ tự này.
- **Seed danh bạ artist suy ra từ rail.** Giống design: một
  artist tồn tại vì được credit trên một frame, `category` lấy từ credit đầu
  tiên gọi tên họ, ảnh preview là frame **ảnh** đầu tiên họ xuất hiện khi quét
  EDITORIALS → CAMPAIGNS → COUTURE → FASHION_WEEKS → NEW_SIGNS. Ảnh được gom ở
  một lượt riêng nên artist bị credit lần đầu trên video vẫn nhận được ảnh ở
  rail sau. Discipline ngoài 11 category gốc (Photography, Lighting…) thành
  category ẩn. Sau lần publish đầu, danh bạ là bảng `artists` — sửa ở dashboard.
- **Base styles bắt buộc nằm trong `@layer base`.** CSS không thuộc layer nào sẽ
  thắng mọi rule có layer bất kể specificity — nên `a { text-decoration: none }`
  để trần sẽ vô hiệu hóa utility `underline` và `text-muted` của Tailwind.
- **Tailwind v4 dùng thuộc tính `scale`, không phải `transform`,** cho utility
  `scale-*`. Khi kiểm tra hover zoom phải đọc `getComputedStyle(el).scale`.
- **Cỡ chữ tên nghệ sĩ dùng `cqw`** (`min(60px, 8cqw)`) đo theo cột chứa nó, không
  theo viewport, nên tỉ lệ giữ nguyên dù sidebar hay cột ảnh đổi bề rộng.
- **`next/image` vs `<img>`** — dùng `next/image` ở hero và ảnh preview (đều là
  `fill` trong khung có kích thước xác định). Card trong rail và 2 khối feature
  dùng `<img>` thuần vì kích thước do tỉ lệ gốc của từng ảnh quyết định
  (`height: var(--rfl-rail-height); width: auto` và `width: 100%; height: auto`);
  truyền số đo phỏng đoán cho `next/image` sẽ khẳng định sai tỉ lệ.
- **Ảnh remote** đi qua hai host khai báo trong `next.config.ts` →
  `images.remotePatterns`. Video `<video>` không qua next/image nên không cần khai báo.
- **Responsive:** design gốc chỉ đặc tả desktop (preview 1440px). Trang chủ vốn đã
  co giãn tốt. Trang Artists: từ `lg` trở lên bám sát design; dưới `lg` các cột xếp
  dọc và cột ảnh preview được ẩn.
