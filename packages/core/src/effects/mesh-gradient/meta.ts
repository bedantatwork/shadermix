import type { Schema } from "../../runtime/schema.js";

export const slug = "mesh-gradient";
export const name = "Mesh Gradient";
export const category = "backgrounds";

export const schema = {
  colors: {
    type: "colors",
    count: 4,
    default: ["#5227FF", "#00D1FF", "#7CFF67", "#FF2D95"],
    description: "Mesh point colours",
  },
  speed: {
    type: "number",
    min: 0,
    max: 2,
    step: 0.05,
    default: 0.4,
    description: "Animation speed",
  },
  distortion: {
    type: "number",
    min: 0,
    max: 1,
    step: 0.05,
    default: 0.4,
    description: "Domain-warp strength",
  },
  grain: {
    type: "number",
    min: 0,
    max: 0.3,
    step: 0.01,
    default: 0.08,
    description: "Film grain amount",
  },
} satisfies Schema;
