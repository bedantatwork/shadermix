export interface NumberField {
  type: "number";
  min: number;
  max: number;
  step: number;
  default: number;
  description: string;
}

export interface BooleanField {
  type: "boolean";
  default: boolean;
  description: string;
}

export interface ColorField {
  type: "color";
  default: string;
  description: string;
}

export interface ColorsField {
  type: "colors";
  count: number;
  default: string[];
  description: string;
}

export interface EnumField {
  type: "enum";
  options: readonly string[];
  default: string;
  description: string;
}

export type SchemaField = NumberField | BooleanField | ColorField | ColorsField | EnumField;

export type Schema = Record<string, SchemaField>;

type ValueForField<F extends SchemaField> = F extends NumberField
  ? number
  : F extends BooleanField
    ? boolean
    : F extends ColorField
      ? string
      : F extends ColorsField
        ? string[]
        : F extends EnumField
          ? string
          : never;

export type OptionsFromSchema<S extends Schema> = { [K in keyof S]: ValueForField<S[K]> };

export function defaultsFromSchema<S extends Schema>(schema: S): OptionsFromSchema<S> {
  const result = {} as OptionsFromSchema<S>;
  for (const key of Object.keys(schema) as (keyof S)[]) {
    // Non-null: `key` was just read from `Object.keys(schema)`, so it's guaranteed present.
    const field = schema[key]!;
    result[key] = (Array.isArray(field.default) ? [...field.default] : field.default) as never;
  }
  return result;
}

function camelToKebab(key: string): string {
  return key.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
}

function parseFieldValue(field: SchemaField, raw: string): unknown {
  switch (field.type) {
    case "number": {
      const n = Number(raw);
      return Number.isFinite(n) ? n : field.default;
    }
    case "boolean":
      return raw === "" || raw === "true";
    case "color":
      return raw;
    case "colors":
      return raw
        .split(",")
        .map((c) => c.trim())
        .filter(Boolean);
    case "enum":
      return field.options.includes(raw) ? raw : field.default;
    default:
      return raw;
  }
}

/** Reads `${prefix}${kebab-case key}` attributes off an element against a schema, falling back to defaults. */
export function parseAttributes<S extends Schema>(
  el: Element,
  schema: S,
  prefix = "sm-",
): OptionsFromSchema<S> {
  const result = defaultsFromSchema(schema);
  for (const key of Object.keys(schema) as (keyof S)[]) {
    const attrName = `${prefix}${camelToKebab(String(key))}`;
    if (!el.hasAttribute(attrName)) continue;
    const raw = el.getAttribute(attrName) ?? "";
    result[key] = parseFieldValue(schema[key]!, raw) as never;
  }
  return result;
}

/** Merges a partial options object (e.g. from the public API) over schema defaults. */
export function normalizeOptions<S extends Schema>(
  schema: S,
  options: Record<string, unknown> | undefined,
): OptionsFromSchema<S> {
  const result = defaultsFromSchema(schema);
  if (!options) return result;
  for (const key of Object.keys(schema) as (keyof S)[]) {
    const value = options[key as string];
    if (value !== undefined) {
      result[key] = value as never;
    }
  }
  return result;
}
