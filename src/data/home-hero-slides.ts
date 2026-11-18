export type HeroSlide = {
  src: string;
  /** CSS object-position on desktop; each frame is hand-cropped around its subject. */
  position: string;
  /** Crops for smaller screens, already resolved (never empty) when set. */
  positionTablet?: string;
  positionMobile?: string;
  /** Caption colour — flipped to white over dark imagery. */
  captionColor: string;
  credits: { name: string; role: string }[];
  publication: string;
};

/**
 * One slide per shoot, so the banner reads as a table of contents for the
 * rails below it. Pictures are uploaded from the dashboard; a slide without
 * one is left off the banner.
 *
 * Two constraints pick the frames. Tearsheets that carry their own printed
 * copy are skipped — the banner sets a caption in the same corner and the two
 * collide. And the frame that fronts the full-bleed feature is left out, so the
 * same picture is not the first and the largest thing on the page.
 */
export const HERO_SLIDES: HeroSlide[] = [
  {
    src: "",
    position: "50% 28%",
    captionColor: "#fff",
    credits: [
      { name: "Bincio", role: " Photography, " },
      { name: "Nguyen Tan Thanh", role: " Styling, " },
    ],
    publication: "The Gilded Frame",
  },
  {
    src: "",
    position: "50% 45%",
    captionColor: "#fff",
    credits: [
      { name: "Dinh Tran", role: " Makeup, " },
      { name: "Nguyen Tan Thanh", role: " Styling, " },
    ],
    publication: "Cadmium",
  },
  {
    src: "",
    position: "50% 50%",
    captionColor: "#fff",
    credits: [
      { name: "Nguyen Tan Thanh", role: " Styling, " },
      { name: "May Truong", role: " Hair, " },
    ],
    publication: "Golden Spiral",
  },
  {
    src: "",
    position: "50% 30%",
    captionColor: "#fff",
    credits: [
      { name: "Bincio", role: " Photography, " },
      { name: "Shishi", role: " Hair, " },
    ],
    publication: "Porcelain Garden",
  },
  {
    src: "",
    position: "50% 38%",
    captionColor: "#fff",
    credits: [
      { name: "Diego Nguyen", role: " Makeup, " },
      { name: "Shishi", role: " Hair, " },
    ],
    publication: "Traces of Memories",
  },
  {
    src: "",
    position: "50% 30%",
    captionColor: "#000",
    credits: [
      { name: "May Truong", role: " Hair, " },
      { name: "Dinh Tran", role: " Makeup, " },
    ],
    publication: "Setting Curls",
  },
  {
    src: "",
    position: "50% 30%",
    captionColor: "#000",
    credits: [
      { name: "Dinh Tran", role: " Makeup, " },
      { name: "May Truong", role: " Hair, " },
    ],
    publication: "The Soulful Splendor",
  },
  {
    src: "",
    position: "50% 25%",
    captionColor: "#fff",
    credits: [{ name: "May Truong", role: " Hair, " }],
    publication: "The Gilded Frame",
  },
];
