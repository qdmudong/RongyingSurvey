import { existsSync } from "fs";

type FontCandidate = {
  path?: string;
  face?: string;
};

const FONT_CANDIDATES: FontCandidate[] = [
  { path: process.env.REPORT_FONT_PATH, face: process.env.REPORT_FONT_FACE },
  { path: "/usr/share/opentype/noto/NotoSansCJK-Regular.ttc", face: "NotoSansCJKsc-Regular" },
  { path: "/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc", face: "NotoSansCJKsc-Regular" },
  { path: "/System/Library/Fonts/Supplemental/Arial Unicode.ttf" },
  { path: "/System/Library/Fonts/Supplemental/Songti.ttc", face: "STSongti-SC-Regular" },
  { path: "/System/Library/Fonts/STHeiti Light.ttc" },
];

export function resolveReportFont(): FontCandidate | undefined {
  return FONT_CANDIDATES.find((font) => font.path && existsSync(font.path));
}
