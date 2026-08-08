import { bynder, wpUpload } from "./media-url";

/** Full-bleed editorial feature that sits between the campaign and couture rails. */
export const FEATURE_EDITORIAL = {
  heading: "Latest Editorial",
  src: bynder(
    "4ff529fa-7d1d-4e7d-b704-c21321da439c/202606_INTERVIEW_NLEECOHEN_LTW_07",
  ),
  credit: { name: "Liz Taw", roles: "Hair, Grooming" },
  title: "Interview",
};

/** Anniversary banner, inset by the standard 20px page gutter. */
export const FEATURE_ANNIVERSARY = {
  heading: "TWG25",
  src: wpUpload("2026/02/Header-Image_25-Years-of_01-scaled.jpg"),
};
