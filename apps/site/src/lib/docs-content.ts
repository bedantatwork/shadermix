// Mock content layer for `docPage` (plan §8.3). Same swap contract as
// components-content.ts: replace these functions with @sanity/client GROQ
// calls, keep the return shapes, pages stay unchanged.
import { block, bullet, code, type PortableTextNode } from "./portable-text";

export interface DocPage {
  slug: string;
  title: string;
  order: number;
  description: string;
  body: PortableTextNode[];
}

const docs: DocPage[] = [
  {
    slug: "introduction",
    title: "Introduction",
    order: 0,
    description: "What Shadermix is and why it exists.",
    body: [
      block(
        "Shadermix is an open-source library of animated shader backgrounds, visual effects and text animations for Astro and Webflow. Every effect is written once in plain TypeScript and WebGL with zero runtime dependencies, then shipped three ways.",
      ),
      block("How it ships", "h2"),
      bullet("Astro — native .astro components, no React or Vue runtime."),
      bullet("Webflow — one script tag from a CDN plus custom attributes on any div."),
      bullet("Vanilla JS — createAurora(canvas, options) for any other site."),
      block("Principles", "h2"),
      block(
        "Every component follows the same rules: zero runtime dependencies, pause when offscreen or when the tab is hidden, respect prefers-reduced-motion, and fall back to a CSS gradient when WebGL is unavailable.",
      ),
      block("A live example", "h2"),
      block("This is the aurora effect, running from the same package you would install:"),
      {
        _type: "shadermixEmbed",
        effect: "aurora",
        options: { speed: 0.5 },
        height: 260,
        caption: "aurora, rendered live by @shadermix/core.",
      },
    ],
  },
  {
    slug: "installation/astro",
    title: "Install in Astro",
    order: 1,
    description: "Add Shadermix effects to an Astro project.",
    body: [
      block("Install", "h2"),
      code("bash", "npm i @shadermix/astro"),
      block("Usage", "h2"),
      block("Import the component you need and drop it into any .astro file:"),
      code(
        "astro",
        `---
import { Aurora } from '@shadermix/astro';
---
<section class="hero">
  <Aurora colors={['#5227FF', '#7CFF67', '#00D1FF']} speed={0.6} />
  <div class="sm-content">
    <h1>Ship beautiful sites</h1>
  </div>
</section>`,
        "src/pages/index.astro",
      ),
      block("Layering content", "h2"),
      block(
        "The effect renders a canvas positioned absolutely inside its host element. Put your content in a sibling element with position: relative and z-index: 1 so it sits above the canvas.",
      ),
      code(
        "css",
        `.hero { position: relative; min-height: 60vh; }
.sm-content { position: relative; z-index: 1; }`,
      ),
      block("View Transitions", "h2"),
      block(
        "Shadermix components initialise on astro:page-load and destroy on astro:before-swap, so they work with and without Astro's ClientRouter. No extra configuration is needed.",
      ),
      block("Copy-paste instead of npm", "h2"),
      block(
        "Every component page has a Source tab with the full shader and factory source. Drop those files into src/components/shadermix/ if you would rather own the code than depend on the package.",
      ),
    ],
  },
  {
    slug: "installation/webflow",
    title: "Install in Webflow",
    order: 2,
    description: "Add Shadermix effects to a Webflow site with one script tag.",
    body: [
      block("Add the script", "h2"),
      block("In Site Settings → Custom Code → Footer code, paste:"),
      code(
        "html",
        '<script src="https://cdn.jsdelivr.net/npm/@shadermix/webflow@0/dist/shadermix.min.js" defer></script>',
      ),
      block(
        "Pinning the major version (@0) means you get fixes automatically without breaking changes.",
      ),
      block("Use an effect", "h2"),
      bullet("Select a Section or Div Block and give it a min height."),
      bullet("In Element Settings → Custom Attributes, add sm-effect with a value like aurora."),
      bullet("Add optional attributes such as sm-colors and sm-speed."),
      bullet("Put your content in a child div with class sm-content."),
      bullet("Publish or open Preview — custom code does not run on the Designer canvas."),
      block("Attributes", "h2"),
      block(
        "Attribute names are the kebab-case form of each option, prefixed with sm-. A colors option becomes sm-colors and takes a comma-separated list.",
      ),
      code(
        "html",
        `<div sm-effect="aurora"
     sm-colors="#5227FF, #7CFF67, #00D1FF"
     sm-speed="0.6"
     sm-amplitude="1"></div>`,
      ),
      block("CMS and dynamic content", "h2"),
      block(
        "If you add elements after page load — CMS load-more, tabs, sliders — call window.Shadermix.init() to initialise any new elements. Already-initialised elements are marked with sm-ready and are never double-initialised.",
      ),
    ],
  },
  {
    slug: "installation/vanilla",
    title: "Install anywhere else",
    order: 3,
    description: "Use Shadermix from a bundler or straight from a CDN.",
    body: [
      block("With a bundler", "h2"),
      code("bash", "npm i @shadermix/core"),
      block("Import the per-effect entry point so bundlers only pull in what you use:"),
      code(
        "js",
        `import { createAurora } from '@shadermix/core/aurora';

const effect = createAurora(document.querySelector('#hero'), {
  colors: ['#5227FF', '#7CFF67', '#00D1FF'],
  speed: 0.6,
});`,
      ),
      block("Controlling an effect", "h2"),
      code(
        "js",
        `effect.update({ speed: 1.2 });  // live option updates
effect.pause();
effect.play();
effect.destroy();               // frees GL resources and removes listeners`,
      ),
      block(
        "You can pass either a canvas element or a container. If you pass a container, Shadermix creates a canvas that fills it and sets position: relative on the host if needed.",
      ),
      block("From a CDN", "h2"),
      block(
        "The Webflow bundle works on any site — it registers every effect and initialises elements carrying sm-effect attributes.",
      ),
      code(
        "html",
        '<script src="https://cdn.jsdelivr.net/npm/@shadermix/webflow@0/dist/shadermix.min.js" defer></script>',
      ),
    ],
  },
  {
    slug: "performance",
    title: "Performance",
    order: 4,
    description: "How Shadermix keeps effects cheap, and how many to use per page.",
    body: [
      block(
        "Shader backgrounds are easy to get wrong. Shadermix applies the same performance rules to every effect so you do not have to think about them.",
      ),
      block("What every effect does", "h2"),
      bullet("Pauses when scrolled out of view, via IntersectionObserver."),
      bullet("Pauses when the browser tab is hidden."),
      bullet("Caps device pixel ratio at 2, so 3x displays do not render 9x the pixels."),
      bullet("Draws a single fullscreen quad per frame — no scene graph, no per-object overhead."),
      bullet("Shares one requestAnimationFrame loop across every effect on the page."),
      block("Reduced motion", "h2"),
      block(
        "When prefers-reduced-motion: reduce is set, effects render one static frame and never start the animation loop. Pass respectReducedMotion: false to override this, but prefer not to.",
      ),
      block("How many per page?", "h2"),
      block(
        "Browsers cap the number of simultaneous WebGL contexts, typically around 16. Shadermix warns in the console if a page creates more than 8 live contexts. For a gallery of previews, start effects only when a card is visible and hovered, and destroy them when it leaves the viewport — that is exactly what the components gallery on this site does.",
      ),
      block("When WebGL is unavailable", "h2"),
      block(
        "If the browser cannot create a WebGL context, or the context is lost and not restored, the host element falls back to a CSS gradient built from the same colors you configured. Content stays readable either way.",
      ),
    ],
  },
];

export function getDocPages(): DocPage[] {
  return [...docs].sort((a, b) => a.order - b.order);
}

export function getDocPageBySlug(slug: string): DocPage | undefined {
  return docs.find((doc) => doc.slug === slug);
}
