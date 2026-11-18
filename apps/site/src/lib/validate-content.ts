// Plan §8.2: component docs are linked to code by slug. A doc with no matching
// effect is a hard build failure (the page would render a broken preview); an
// effect with no doc is only a warning (it just isn't documented yet).
//
// Kept pure and parameterised so it can be unit-tested without importing the
// real content or the effect registry.

export interface SlugLinkReport {
  missingEffects: string[];
  undocumentedEffects: string[];
}

export function checkSlugLinks(
  docSlugs: readonly string[],
  effectSlugs: readonly string[],
): SlugLinkReport {
  const effects = new Set(effectSlugs);
  const docs = new Set(docSlugs);

  return {
    missingEffects: docSlugs.filter((slug) => !effects.has(slug)),
    undocumentedEffects: effectSlugs.filter((slug) => !docs.has(slug)),
  };
}

/** Throws on a doc with no effect; warns on an effect with no doc. */
export function assertSlugLinks(
  docSlugs: readonly string[],
  effectSlugs: readonly string[],
): void {
  const { missingEffects, undocumentedEffects } = checkSlugLinks(docSlugs, effectSlugs);

  if (missingEffects.length > 0) {
    throw new Error(
      `[shadermix] Component docs reference effects that don't exist in @shadermix/core: ` +
        `${missingEffects.join(", ")}. Known effects: ${effectSlugs.join(", ")}.`,
    );
  }

  if (undocumentedEffects.length > 0) {
    console.warn(
      `[shadermix] Effects with no component doc (they won't appear on the site): ` +
        `${undocumentedEffects.join(", ")}.`,
    );
  }
}
