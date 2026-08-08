# The Wall Group

Implement các màn hình từ Claude Design (`The Wall Group.dc.html`) bằng Next.js 16
(App Router) + React 19 + Tailwind CSS v4.

| Route | Nội dung |
| --- | --- |
| `/` | Trang chủ — hero slider 7 slide, 5 rail cuộn ngang, 2 khối feature |
| `/artists` | Danh bạ nghệ sĩ — lọc theo lãnh thổ / danh mục / tên, ảnh preview sticky |
| `/about` | Giới thiệu — 2 đoạn copy + lưới liên hệ |
| `/contact` | Liên hệ — lưới đầy đủ 9 card |
| `not-found` | Trang 404 — số "404" khoét ảnh hero, cross-fade 7 slide |

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
│   └── artists/page.tsx               # trang danh bạ
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
│   └── home/
│       ├── hero-banner.tsx            # slider + dải thumbnail
│       ├── media-rail.tsx             # rail cuộn ngang
│       ├── media-card.tsx             # card ảnh/video + credit
│       ├── feature-blocks.tsx         # 2 khối feature full-bleed / inset
│       ├── work-detail-context.tsx    # client — sở hữu state overlay đang mở
│       ├── work-detail-overlay.tsx    # client — gallery toàn màn hình
│       ├── section-heading.tsx
│       └── artist-credit-line.tsx
├── hooks/
│   ├── use-drag-scroll.ts             # kéo chuột để cuộn rail
│   └── use-video-autoplay.ts          # play/pause video theo viewport
├── data/
│   ├── media-url.ts                   # helper URL cho Bynder DAM + WordPress
│   ├── artists.ts, artist-images.ts   # 64 artist cho trang danh bạ
│   ├── home-hero-slides.ts            # 7 slide hero
│   ├── home-rail-*.ts                 # 5 rail: editorials/campaigns/couture/…
│   ├── home-sections.ts               # 4 rail có work detail + category của chúng
│   ├── contact-offices.ts             # 9 card của lưới liên hệ
│   └── home-features.ts
└── lib/
    ├── filter-artists.ts              # logic lọc thuần, không phụ thuộc React
    ├── work-detail.ts                 # dựng gallery từ card được click
    └── media-item.ts                  # type + constructor cho item rail
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
  custom property `--twg-rail-height` / `--twg-rail-zoom` / `--twg-gallery-height`,
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
- **Chiều cao khung ảnh bị chặn trên:** `min(--twg-gallery-height, 100vh - 340px)`.
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

- Số "404" là một `<span>` ẩn giữ khung, cộng 7 bản absolute chồng lên nhau, mỗi bản
  lấy một ảnh hero làm `background-image` rồi `background-clip: text`. Đổi frame mỗi
  2.8s, cross-fade 1.2s.
- Panel là sheet `fixed` z-20 nằm dưới masthead (z-30) nên header vẫn bấm được; footer
  bị che hoàn toàn nên `not-found.tsx` không render footer.

**Trang Artists**

- **Territory** (`US` / `UK`) — lọc cứng, chỉ hiện một vùng tại một thời điểm.
- **Category** — so khớp với danh sách kỹ năng đã tách theo `", "`.
- **Query** — khớp chuỗi con tên nghệ sĩ, không phân biệt hoa thường.
- **Active index** — đổi khi hover/click, bị kẹp lại khi danh sách lọc ngắn đi, và
  reset về 0 mỗi khi đổi bộ lọc. Ảnh preview bên phải bám theo index này.

## Ghi chú kỹ thuật

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
  (`height: var(--twg-rail-height); width: auto` và `width: 100%; height: auto`);
  truyền số đo phỏng đoán cho `next/image` sẽ khẳng định sai tỉ lệ.
- **Ảnh remote** đi qua hai host khai báo trong `next.config.ts` →
  `images.remotePatterns`. Video `<video>` không qua next/image nên không cần khai báo.
- **Responsive:** design gốc chỉ đặc tả desktop (preview 1440px). Trang chủ vốn đã
  co giãn tốt. Trang Artists: từ `lg` trở lên bám sát design; dưới `lg` các cột xếp
  dọc và cột ảnh preview được ẩn.
