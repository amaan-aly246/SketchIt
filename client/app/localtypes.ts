import { SkPath } from "@shopify/react-native-skia";
export type DrawPath = {
  path: SkPath;
  tool: "pen" | "eraser" | "none";
  color: string;
};
export default {};
