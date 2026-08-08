import { imageItem, videoItem, type MediaItem } from "@/lib/media-item";

import { bynder, bynderAsset, wpUpload } from "./media-url";

export const EDITORIALS: MediaItem[] = [
  imageItem(
    bynder(
      "406c4041-48fa-4d45-bb54-a9a5b92f019a/202607_DLAREPUBBLICA_UKNOBLAUCH_BKR_CPL_01",
    ),
    [
      ["Charlotte Prevel", "Makeup"],
      ["Bjorn Krischker", "Hair, Grooming"],
    ],
    "D La Repubblica Magazine",
  ),
  imageItem(
    bynder(
      "46f7dd81-7a9c-495c-89c0-0d9e7a24e16a/202609_ELLEUK_YGORBACHENKO_GE_GR_04",
    ),
    [
      ["Georgie Eisdell", "Makeup"],
      ["Gregory Russell", "Hair"],
    ],
    "Elle UK",
  ),
  imageItem(
    bynder("fd1952b0-2f0c-4b20-af13-4190e99c1325/202608_ESQUIRESG_JKOCKA_CRE_01"),
    [["Charlie Riddle", "Makeup"]],
    "Esquire Singapore",
  ),
  imageItem(
    bynder("08b420f2-f3d5-4051-81ee-8238b1638b13/202603_METAL_CMOORE_SGG_01"),
    [["Shayna Goldberg", "Makeup"]],
    "Metal",
  ),
  imageItem(
    bynder("4b3f6809-2ccb-4566-b3a0-0b4044098058/202608_VOGUEUK_NIJEWERE_IPN_04"),
    [["Issac Poleon", "Hair"]],
    "Vogue UK",
  ),
  imageItem(
    bynder("0e934275-8e65-4388-b84a-9efb06d32953/202607_FLAUNT_JCHOH_LAH_10"),
    [["Lisa Aharon", "Makeup"]],
    "Flaunt",
  ),
  imageItem(
    bynder("abb5f99c-3cd5-4412-8a95-eb8b9354c104/202607_IMAGINE_TNEVITT_AVO_05"),
    [["Avo Yermagyan", "Styling"]],
    "Imagine Magazine",
  ),
  imageItem(
    bynder("0e1073a7-2869-4f27-8386-d468afcfe73b/202606_VOGUEUK_SARRIAGADA_MHR_08"),
    [["Marty Harper", "Hair, Digital Creators"]],
    "Vogue UK",
  ),
  imageItem(
    bynder("a25490b1-4dcd-4a99-bb45-d42158791076/202608_VOGUECZ_AJABIEV_ALT_01"),
    [["Andy Lecompte", "Hair"]],
    "Vogue Czechoslovakia",
  ),
  imageItem(
    wpUpload("2026/07/202605_GLAMOURUK_LBENOIT_ATQ_TYI_12.jpg"),
    [
      ["Takuya Yamaguchi", "Hair"],
      ["Aya Tariq", "Makeup"],
    ],
    "Glamour UK",
  ),
  imageItem(
    wpUpload("2026/06/202604_HOMMEGIRLS_CVALDEZ_CZY_08-scaled.jpg"),
    [["Chelsea Zalopany", "Styling"]],
    "HommeGirls",
  ),
  videoItem(
    bynderAsset(
      "19162fb7-264b-4d34-b25a-2a2bff83ad89/mp4/202606_VOGUEFR_APENNETTA_MMI_11.mp4",
    ),
    [["Morgane Martini", "Makeup"]],
    "Vogue France",
  ),
  imageItem(
    bynder("29bee630-bf4d-4415-9acb-01ea288c3d9a/202606_V_INEZVINOODH_RFR_02"),
    [["Ricky Fraser", "Hair"]],
    "V Magazine",
  ),
  imageItem(
    wpUpload("2026/06/202604_PERFECT_BANDERSON_ZLA_09.jpg"),
    [["Zola Ganzorigt", "Manicure, Digital Creators"]],
    "Perfect",
  ),
  imageItem(
    wpUpload("2026/06/202605_NYLON_DKOBAYASHIRITCH_KQN_06-scaled.jpg"),
    [["Katie Qian", "Styling"]],
    "Nylon",
  ),
  imageItem(
    bynder("3e7f2b3d-8baa-40fb-afce-c2d02ef0c407/202604_INTERVIEW_TLIU_ZLA_01"),
    [["Zola Ganzorigt", "Manicure, Digital Creators"]],
    "Interview",
  ),
];
