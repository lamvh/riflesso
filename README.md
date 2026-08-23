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
| `/dashboard/*` | Content admin — 5 màn quản trị nội dung, xem mục riêng bên dưới |

Work detail không có route riêng: trong design nó là overlay `position:fixed`
phủ lên trang chủ, mở khi click card của rail, và đóng bằng nút X hoặc `Esc`.

## Chạy dự án

```bash
npm install
npm run dev     # http://localhost:3000
npm run build   # build production (mọi route đều prerender static)
npm run lint
```

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
│   └── dashboard/                     # layout + 5 route của trang quản trị
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
│   ├── media-url.ts                   # helper URL cho Bynder DAM, WordPress, public/assets
│   ├── stories.ts                     # 7 bộ ảnh (shoot), mỗi bộ mở nguyên set ở work detail
│   ├── artists.ts                     # danh bạ artist, suy ra từ rail
│   ├── home-hero-slides.ts            # 8 slide hero
│   ├── home-rail-*.ts                 # 5 rail: editorials/campaigns/couture/…
│   ├── home-sections.ts               # 4 rail có work detail + category của chúng
│   ├── contact-offices.ts             # 9 card của lưới liên hệ
│   └── home-features.ts
└── lib/
    ├── filter-artists.ts              # logic lọc thuần, không phụ thuộc React
    ├── work-detail.ts                 # dựng gallery: nguyên bộ shoot, hoặc hàng xóm trong rail
    ├── media-item.ts                  # type + constructor cho item rail
    └── dashboard/
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

Trang quản trị nội dung, dựng theo design `Dashboard.dc.html`. Năm màn, mỗi màn
một route, dùng chung sidebar 236px + header dính (sticky):

| Route | Màn |
| --- | --- |
| `/dashboard` | Overview — 4 ô số liệu, "Needs attention", "Recent activity" |
| `/dashboard/artists` | Bảng nghệ sĩ — lọc, đổi Live/Draft, mở drawer sửa |
| `/dashboard/albums` | Lưới album 4 cột — lọc theo loại, gắn/bỏ khỏi trang chủ |
| `/dashboard/categories` | Danh mục — đổi tên tại chỗ, ẩn/hiện, đổi thứ tự |
| `/dashboard/homepage` | Hero banner + Page sections + khung preview dính |

**Dữ liệu là dữ liệu thật của site, không phải demo.** Seed dựng trong
`src/lib/dashboard/admin-seed.ts`:

- **Album = một card của rail.** Loại album lấy từ rail chứa nó (Editorials →
  Editorial, New Signs → New Signing…). Card nào front một shoot thì mang theo
  nguyên bộ frame của shoot đó, nên drawer hiện đủ ảnh chứ không chỉ cover. Card
  New Signs không có title nên album lấy tên theo artist: `Tên — Debut`.
- **Artist** suy ra từ credit của rail qua `deriveArtists()` — cùng một hàm trang
  `/artists` dùng — rồi thành list sửa được. Cột **Works** đếm số album đang
  credit tên đó nên nó tự đổi khi sửa credit.
- **Page sections** là 7 section thật của trang chủ, đúng thứ tự trong
  `src/app/page.tsx`.

**Trạng thái chỉ nằm trong trình duyệt.** Không có API, không ghi ngược vào
`src/data/*`. Draft lưu ở `sessionStorage` để refresh giữa chừng không mất; đóng
tab là hết. Ảnh upload thành `blob:` URL, xem được trong phiên, không lưu ở đâu cả.

**Khác design ở ba điểm, đều có lý do:**

- **Wordmark.** Design đặt brand là chữ "THE WALL GROUP"; ở đây giữ nguyên ảnh
  `public/riflesso.png` theo quy tắc khóa logo trong `CLAUDE.md`.
- **Recent activity.** Design có sẵn 5 dòng lịch sử bịa. Site không có nguồn
  lịch sử nào để đọc, nên panel ghi đúng những gì phiên làm việc này vừa sửa —
  dòng mới nhất là "Just now", còn lại "Earlier". Chưa sửa gì thì panel nói vậy.
- **Ô "Images".** Design ghi chú "Compressed to 1400px" — một khẳng định về
  pipeline mà dự án không có. Đổi thành "Across every album".

**Ghi chú kỹ thuật:**

- **`hydrated` trong state.** Lần paint đầu phải render seed để server và client
  khớp nhau, nên effect ghi `sessionStorage` sẽ đè seed lên draft nó sắp đọc.
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
- **Danh bạ artist suy ra từ rail, không khai báo tay.** Giống design: một
  artist tồn tại vì được credit trên một frame, `category` lấy từ credit đầu
  tiên gọi tên họ, ảnh preview là frame **ảnh** đầu tiên họ xuất hiện khi quét
  EDITORIALS → CAMPAIGNS → COUTURE → FASHION_WEEKS → NEW_SIGNS. Ảnh được gom ở
  một lượt riêng nên artist bị credit lần đầu trên video vẫn nhận được ảnh ở
  rail sau. Sửa rail là danh bạ tự đúng theo, không cần sửa hai chỗ.
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
