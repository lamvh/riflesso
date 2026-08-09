import { imageItem, videoItem, type MediaItem } from "@/lib/media-item";

import { bynder, siteAsset, wpUpload } from "./media-url";

/**
 * New Signs cards carry no publication title — just the artist credit.
 * Repo-hosted frames lead the rail, as on the other rails.
 */
export const NEW_SIGNS: MediaItem[] = [
  imageItem(siteAsset("artist-2.jpg"), [["Rudy Martins", "Hair"]]),
  imageItem(siteAsset("artist-3.jpg"), [["Avo Yermagyan", "Styling"]]),
  imageItem(siteAsset("artist-4.jpg"), [["Shameelah Hicks", "Styling"]]),
  imageItem(
    bynder("93b6ecf1-1836-4403-b1a8-4ad17bdbbada/202504_COSMOPOLITAN_EJOHNSON_BTN_07"),
    [["Brandon Tan", "Styling"]],
  ),
  imageItem(
    wpUpload("2026/07/202406_HOLLYWOODREPORTER_GAROCH_ALM_MFR_12.jpg"),
    [["Alice Moore", "Grooming"]],
  ),
  imageItem(
    bynder("e20814c8-48eb-4f86-95ed-cde877ed6d8a/202506_LOVEWANT_ASERGE_BPY_03"),
    [["Benjamin Puckey", "Makeup"]],
  ),
  imageItem(wpUpload("2026/06/202411_WHATEVR_BMARION_ATS_07-scaled.jpg"), [
    ["Ana Tess", "Styling"],
  ]),
  imageItem(wpUpload("2026/06/202511_DOUBLEVISION_LUIGIIANGO_SNK_06.jpeg"), [
    ["Sasha Nesterchuk", "Hair"],
  ]),
  imageItem(
    bynder("8a4fcfb5-82bf-4cce-b491-3c9754eb1456/202102_VANITYFAIRFR_CBUCHANAN_JDY_09"),
    [["Jillian Dempsey", "Makeup, Digital Creators"]],
  ),
  imageItem(wpUpload("2026/05/202602_MIUMIU_UNKNOWN_KAA_01.jpg"), [
    ["Kendra Alia", "Hair, Color, Digital Creators"],
  ]),
  imageItem(
    wpUpload("2026/04/202507_FLAUNT_MSELIGER_ATN_MAS_08-scaled.jpg"),
    [["Austen Turner", "Styling"]],
  ),
  imageItem(bynder("98bd30f8-6e32-4212-a1b7-65a5a7192aaf/202306_SHARP_CGRAY_JHS_04"), [
    ["Jay Hines", "Styling"],
  ]),
  videoItem(wpUpload("2026/04/202503_FERRAGAMO_EGUZZI_KRS_12.mp4"), [
    ["Kirsty Stewart", "Styling"],
  ]),
];
