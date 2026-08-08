import { imageItem, videoItem, type MediaItem } from "@/lib/media-item";

import { bynder, wpUpload } from "./media-url";

/**
 * One frame is served with an explicit crop/focus-point transform rather than the
 * default `quality=85` preset, so its URL is written out in full.
 */
const SAINT_LAURENT_BUTLER =
  "https://thewallgroup.bynder.com/transform/c5a88578-c2d0-4f02-a5bd-389a9ddfa94a/20260623_ABUTLER_SAINTLAURENT_JHA_01?io=transform:crop,height:1200,width:800,path:square&focuspoint=0.49,0.36";

export const FASHION_WEEKS: MediaItem[] = [
  imageItem(
    bynder("75fbef1e-dedb-4a5a-95f3-c5fb15acb968/202703_MAISONMIHARAYASUHIRO_RUNWAY_MCN_75"),
    [["Martin Cullen", "Hair"]],
    "Maison Mihara Yasuhiro",
  ),
  imageItem(
    bynder("eba3210c-800a-48b1-965c-4be32094645f/20260623_CMELTON_LOUISVUITTON_SM_03"),
    [["Samantha McMillen", "Styling"]],
    "Louis Vuitton",
  ),
  imageItem(
    bynder("f400964e-8d76-45c1-8016-523110b79d6d/20260623_CHARLIXCX_SAINTLAURENT_BTL_CHH_04"),
    [
      ["Chris Horan", "Styling"],
      ["Brooke Turnbull", "Makeup"],
    ],
    "Yves Saint Laurent",
  ),
  imageItem(
    bynder("d1edf677-a7b9-48b2-b8b9-52dbcbb6e2d0/202703_Y3_RUNWAY_ACA_27"),
    [["Anne Sophie Costa", "Makeup"]],
    "Y-3 SS27",
  ),
  imageItem(
    wpUpload("2026/06/20260623_TWITHERS_LOUISVUITTON_LTW_01-768x1024.jpg"),
    [["Liz Taw", "Hair, Grooming"]],
    "Louis Vuitton",
  ),
  videoItem(
    wpUpload("2026/06/20260623_CTORRIE_SAINTLAURENT_JYY_05.mp4"),
    [["James Yardley", "Styling"]],
    "Yves Saint Laurent",
  ),
  imageItem(
    bynder("03647a18-5d98-4cc0-848f-59f32ab38624/20260623_LMOSS_SAINTLAURENT_JCY_02"),
    [["Joey Choy", "Makeup"]],
    "Yves Saint Laurent",
  ),
  imageItem(
    SAINT_LAURENT_BUTLER,
    [["Jillian Halouska", "Hair"]],
    "Yves Saint Laurent",
  ),
  imageItem(
    bynder("bef4ab12-7c17-4225-aa28-81c5b5d7647d/20260624_CEJIOFOR_DIOR_RFE_02"),
    [["Rose Forde", "Styling"]],
    "Dior",
  ),
  imageItem(
    bynder("31a1dbd8-a144-44ce-a1b1-224cd3d6bf10/20260624_IAPATOW_DIOR_ACA_MPO_02"),
    [
      ["María Pélo", "Hair"],
      ["Anne Sophie Costa", "Makeup"],
      ["Alexa Hernandez", "Grooming"],
    ],
    "Dior",
  ),
  imageItem(
    bynder("34459e74-3faa-4be2-8831-72d931800b82/20260623_JALWYN_SAINTLAURENT_RFE_05"),
    [["Rose Forde", "Styling"]],
    "Yves Saint Laurent",
  ),
  imageItem(
    bynder("26bd9cbd-0860-4986-b7fc-d0f53a86d993/20260623_ESAKRAYA_LOUISVUITTON_PVN_01"),
    [["Philipp Verheyen", "Hair, Makeup"]],
    "Louis Vuitton",
  ),
  imageItem(
    bynder("2accc369-7d58-4c30-ac78-3d3d1d297924/20260623_LYOUNG_LOUISVUITTON_SCJ_01"),
    [["Sky Cripps-Jackson", "Hair, Grooming"]],
    "Louis Vuitton",
  ),
  imageItem(
    bynder("9289a66e-a13d-4010-950b-cbc27c4217ef/20260626_LBOYNTON_GIORGIOARMANI_LCK_03"),
    [["Leith Clark", "Styling"]],
    "Armani",
  ),
];
