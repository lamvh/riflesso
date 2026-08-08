import { imageItem, videoItem, type MediaItem } from "@/lib/media-item";

import { bynder, wpUpload } from "./media-url";

export const COUTURE: MediaItem[] = [
  videoItem(
    wpUpload("2026/07/edit-02D0298C-0984-475D-974DD2B1EB66D0CC.mp4"),
    [
      ["Fabio Petri", "Hair, Grooming"],
      ["Charlotte Prevel", "Makeup"],
    ],
    "Chanel",
  ),
  imageItem(
    bynder("b03f8c01-cc7b-44a4-b5cc-695a895a5059/20260707_LHARRIER_ARMANI_HJS_JYZ_01"),
    [
      ["Harold James", "Makeup"],
      ["Jennifer Yepez", "Hair"],
    ],
    "Armani",
  ),
  videoItem(
    wpUpload("2026/07/edit-823B0A40-5F81-4775-934D2D05547DF48B.mp4"),
    [
      ["Emma Jade Morrison", "Styling"],
      ["Brooke Turnbull", "Makeup"],
    ],
    "Chanel",
  ),
  imageItem(
    wpUpload("2026/07/20260706_SWILDE_DIOR_MLE_RMI_01-1-768x1024.jpg"),
    [
      ["Mona Leanne", "Makeup, Digital Creators"],
      ["Romane Martini", "Manicure"],
    ],
    "Dior",
  ),
  imageItem(
    wpUpload("2026/07/20260706_INAVARRETTE_DIOR_RMI_01-683x1024.jpg"),
    [["Romane Martini", "Manicure"]],
    "Dior",
  ),
  imageItem(
    bynder("b64a6cae-fa34-4b50-9058-adad1df8b50e/20260708_HWILLIAMS_BALENCIAGA_AFL_01"),
    [["Aika Flores", "Grooming"]],
    "Balenciaga",
  ),
  videoItem(
    wpUpload("2026/07/edit-C57B3B13-AF30-46F1-97BDD8F216B8CDBF.mp4"),
    [
      ["Harold James", "Makeup"],
      ["Ilham Mestour", "Hair"],
    ],
    "Jean Paul Gaultier",
  ),
  imageItem(
    wpUpload("2026/07/20260708_DDEADWYLER_BALENCIAGA_HHN_01-768x1024.jpg"),
    [["Hos", "Hair"]],
    "Balenciaga",
  ),
  imageItem(
    wpUpload("2026/07/20260707_LPASCAL_CHANEL_MMC_IGZ_01-683x1024.jpg"),
    [
      ["Mimi Cuttrell", "Styling, Digital Creators"],
      ["Iván Gómez", "Hair, Makeup"],
    ],
    "Chanel",
  ),
  imageItem(
    wpUpload("2026/07/20260708_GIVEON_BALENCIAGA_YDO_01-768x1024.jpg"),
    [["Yacine Diallo", "Makeup"]],
    "Balenciaga",
  ),
];
