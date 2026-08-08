import { imageItem, videoItem, type MediaItem } from "@/lib/media-item";

import { bynder, bynderAsset, wpUpload } from "./media-url";

export const CAMPAIGNS: MediaItem[] = [
  videoItem(
    wpUpload("2026/06/edit-2C1986D7-34CE-4B09-A00FA9ECDE71899A.mp4"),
    [["Peter Lux", "Hair"]],
    "Vix",
  ),
  imageItem(
    bynder("81f2a622-87fd-486e-8453-c1204ec08088/202605_RHODE_JMARQUES_JHA_MMI_11"),
    [
      ["Jillian Halouska", "Hair"],
      ["Morgane Martini", "Makeup"],
    ],
    "RHODE",
  ),
  videoItem(
    bynderAsset(
      "8e711c36-6de0-4f7b-b65f-6dc99928e39e/202606_QUINCE_SONEILL_KY_43.mp4",
    ),
    [["Kate Young", "Styling, Digital Creators"]],
    "Quince",
  ),
  imageItem(
    wpUpload("2026/07/202606_GAP_RCLEMENTS_DBY_KKS_12.jpeg"),
    [
      ["Diana Berry", "Makeup"],
      ["Kimmie Kyees", "Manicure"],
    ],
    "Gap",
  ),
  videoItem(
    bynderAsset(
      "9bf08733-c29a-4795-9fa7-be2afe231c15/mp4/202603_BULGARI_GWILLIAMS_ALM_MFR_09.mp4",
    ),
    [
      ["Michael Fisher", "Styling"],
      ["Alice Moore", "Grooming"],
    ],
    "Bulgari",
  ),
  imageItem(
    bynder("aeb1dd56-a3a4-4b8a-86b7-673492a3e0ac/202605_BULGARI_DBAKER_EDY_HBR_05"),
    [
      ["Emma Day", "Makeup, Grooming"],
      ["Halley Brisker", "Hair"],
    ],
    "Bulgari",
  ),
  videoItem(
    wpUpload("2026/06/202605_DIOR_POSTERNAKS_JHA_27.mp4"),
    [["Jillian Halouska", "Hair"]],
    "Dior",
  ),
  imageItem(
    bynder("7c16ce70-11a8-4422-8e4b-e090bcdbc375/202606_JOMALONE_TCOULSON_LTW_05"),
    [["Liz Taw", "Hair, Grooming"]],
    "Jo Malone",
  ),
  imageItem(
    bynder("3e904db3-681f-494c-8287-ddf5a074ee7c/202606_MAC_INEZVINOODH_CCN_05"),
    [["Caroline Cotten", "Manicure"]],
    "MAC Cosmetics",
  ),
  videoItem(
    wpUpload("cropped-thumbs/202606_MILKMAKEUP_UNKNOWN_FB_01-cropped.mp4"),
    [["Frank B", "Makeup"]],
    "Milk Makeup",
  ),
  imageItem(
    bynder("ff772dc2-f768-4581-a38b-662465df69f6/202606_DESIGUAL_CRUTHERFORD_SST_08"),
    [["Sophia Sinot", "Makeup"]],
    "Desigual",
  ),
  videoItem(
    wpUpload("cropped-thumbs/202604_SAVAGEXFENTY_LCHEMOTTI_AHZ_01-cropped.mp4"),
    [["Alexa Hernandez", "Makeup, Grooming"]],
    "Savage x Fenty",
  ),
  videoItem(
    bynderAsset(
      "082c256e-9313-41d4-9d93-36d4d0291161/202604_TIFFANYCO_UNKNOWN_AKI_JYY_01.mp4",
    ),
    [
      ["James Yardley", "Styling"],
      ["Amy Komorowski", "Grooming"],
    ],
    "Tiffany & Co",
  ),
  imageItem(
    bynder("aabe38ac-4af9-4879-b1c3-09194371b585/202604_CHANEL_CMCDEAN_GWN_02"),
    [["Gucci Westman", "Makeup"]],
    "Chanel",
  ),
];
