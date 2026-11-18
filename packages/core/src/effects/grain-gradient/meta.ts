import type { Schema } from "../../runtime/schema.js";

export const slug = "grain-gradient";
export const name = "Grain Gradient";
export const category = "backgrounds";

export const schema = {
  colors: {
    type: "colors",
    count: 3,
    default: ["#2E1065", "#7C3AED", "#F472B6"],
    description: "Gradient colours",
  },
  speed: {
    type: "number",
    min: 0,
    max: 2,
    step: 0.05,
    default: 0.3,
    description: "Animation speed",
  },
  grainAmount: {
    type: "number",
    min: 0,
    max: 0.3,
    step: 0.01,
    default: 0.08,
    description: "Film grain amount",
  },
  angle: {
    type: "number",
    min: 0,
    max: 360,
    step: 1,
    default: 45,
    description: "Gradient angle in degrees",
  },
} satisfies Schema;
