# The Wall Group

Implement hai trang từ Claude Design (`The Wall Group - Home.dc.html` và
`The Wall Group - Artists.dc.html`) bằng Next.js 16 (App Router) + React 19 +
Tailwind CSS v4.

| Route | Nội dung |
| --- | --- |
| `/` | Trang chủ — hero slider 7 slide, 5 rail cuộn ngang, 2 khối feature |
| `/artists` | Danh bạ nghệ sĩ — lọc theo lãnh thổ / danh mục / tên, ảnh preview sticky |

## Chạy dự án

```bash
npm install
npm run dev     # http://localhost:3000
npm run build   # build production (cả 2 route đều prerender static)
npm run lint
```

## Cấu trúc

```
src/
├── app/
│   ├── globals.css                    # theme tokens + base layer
│   ├── layout.tsx
│   ├── page.tsx                       # trang chủ
│   └── artists/page.tsx               # trang danh bạ
├── components/
│   ├── site-header.tsx                # masthead cố định, dùng chung 2 trang
│   ├── site-footer.tsx                # 4 cột link, top-margin theo từng trang
│   ├── search-icon.tsx
│   ├── artists-directory.tsx          # client — state lọc của trang Artists
│   ├── artists-filter-sidebar.tsx
│   ├── artists-list.tsx
│   ├── artist-preview-image.tsx
│   └── home/
│       ├── hero-banner.tsx            # slider + dải thumbnail
│       ├── media-rail.tsx             # rail cuộn ngang
│       ├── media-card.tsx             # card ảnh/video + credit
│       ├── feature-blocks.tsx         # 2 khối feature full-bleed / inset
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
│   └── home-features.ts
└── lib/
    ├── filter-artists.ts              # logic lọc thuần, không phụ thuộc React
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
- **Ba tham số hiển thị** (khớp props gốc của design) khai báo ở `src/app/page.tsx`:
  `bannerAutoplay` (false), `sliderHeight` (350px, dải 236–460), `hoverZoom` (true).
  Hai tham số sau đi xuống card qua custom property `--twg-rail-height` /
  `--twg-rail-zoom`, nên đổi một chỗ là đổi toàn bộ rail.

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
