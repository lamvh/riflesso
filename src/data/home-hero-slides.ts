import { bynder } from "./media-url";

export type HeroSlide = {
  src: string;
  /** CSS object-position; each frame is hand-cropped around its subject. */
  position: string;
  /** Caption colour — flipped to white over dark imagery. */
  captionColor: string;
  credits: { name: string; role: string }[];
  publication: string;
};

export const HERO_SLIDES: HeroSlide[] = [
  {
    src: bynder(
      "c8df526e-4f44-4703-8779-196446c8e66d/202605_INTERVIEW_ELYNCH_JCT_RFE_01",
    ),
    position: "45.69% 67.08%",
    captionColor: "#000",
    credits: [
      { name: "James Catalano ", role: "Hair, " },
      { name: "Rose Forde", role: " Styling, " },
    ],
    publication: "Interview",
  },
  {
    src: bynder(
      "8cd1290f-af5b-4641-8175-866905af23aa/202607_BEHINDTHEBLINDS_WALDERSLEY_FBO_05",
    ),
    position: "43.41% 32.08%",
    captionColor: "#fff",
    credits: [{ name: "Francesca Brazzo", role: " Makeup, " }],
    publication: "Behind the Blinds",
  },
  {
    src: bynder(
      "c1a9daf4-b38c-4deb-b76e-88fe373cd394/202606_ISSEYMIYAKE_CADDY_IPN_03",
    ),
    position: "44.67% 17.31%",
    captionColor: "#fff",
    credits: [{ name: "Issac Poleon ", role: "Hair, " }],
    publication: "Issey Miyake",
  },
  {
    src: bynder(
      "a0afdf47-7f57-4a01-ba5e-f9b8cc57f535/202607_SMODA_TWHITESIDE_FAB_JRS_05",
    ),
    position: "45.87% 50.42%",
    captionColor: "#fff",
    credits: [
      { name: "Fabio Immediato", role: " Styling, " },
      { name: "Jerrod Roberts ", role: "Hair, " },
    ],
    publication: "S Moda",
  },
  {
    src: bynder(
      "573cc874-596a-41d5-b4ed-25a643a90bd7/202607_VERONICABEARD_HNEUMANN_STJ_13",
    ),
    position: "44.96% 87.53%",
    captionColor: "#fff",
    credits: [{ name: "Stoj", role: " Makeup, " }],
    publication: "Veronica Beard",
  },
  {
    src: bynder(
      "a3d2b9cc-084c-498b-a6d2-87634c1f400f/202607_STYLE_ZDAEMEN_FAB_05",
    ),
    position: "42.90% 27.57%",
    captionColor: "#fff",
    credits: [{ name: "Fabio Immediato", role: " Styling, " }],
    publication: "Style",
  },
  {
    src: bynder(
      "162bbeb1-aff4-48a4-b871-3f37c2c8ca8f/202606_HARPERSBAZAAR_MFARAGO_RMD_14",
    ),
    position: "59.87% 50.69%",
    captionColor: "#fff",
    credits: [{ name: "Rafael Medeiros ", role: "Set Design, " }],
    publication: "Harper’s Bazaar",
  },
];
