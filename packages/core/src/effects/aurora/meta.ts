import type { Schema } from "../../runtime/schema.js";

export const slug = "aurora";
export const name = "Aurora";
export const category = "backgrounds";

export const schema = {
  colors: {
    type: "colors",
    count: 3,
    default: ["#5227FF", "#7CFF67", "#00D1FF"],
    description: "Band colours",
  },
  speed: {
    type: "number",
    min: 0,
    max: 3,
    step: 0.05,
    default: 0.6,
    description: "Animation speed",
  },
  amplitude: {
    type: "number",
    min: 0,
    max: 2,
    step: 0.05,
    default: 1,
    description: "Wave height",
  },
  blend: {
    type: "number",
    min: 0,
    max: 0.9,
    step: 0.05,
    default: 0.5,
    description: "Softness of the band edges",
  },
} satisfies Schema;
