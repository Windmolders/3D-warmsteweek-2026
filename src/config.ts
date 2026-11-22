// Edit your external order form here.
export const SITE_TITLE = "3D Print Warmest Week 2026";

export const ORDER_FORM = {
  // URL of your form (Google Forms, Tally, Typeform, ...)
  url: "https://example.com/order-form",
  // Query parameter names used for prefill.
  // Google Forms: e.g. "entry.123456789". Set to null to send nothing.
  modelParam: "model" as string | null,
  colorParam: "color" as string | null,
};

export function buildOrderUrl(modelName: string, colorName: string): string {
  const u = new URL(ORDER_FORM.url);
  if (ORDER_FORM.modelParam) u.searchParams.set(ORDER_FORM.modelParam, modelName);
  if (ORDER_FORM.colorParam) u.searchParams.set(ORDER_FORM.colorParam, colorName);
  return u.toString();
}

// Optional background photo for the wall behind the vase in the render, e.g. "/backgrounds/wall.jpg".
// null = built-in minimalist wall.
export const RENDER_WALL_IMAGE: string | null = null;

// Color shown when the page is opened without a ?color= parameter (id from colors.json).
export const DEFAULT_COLOR_ID = "dessert-tan";

/** Prefix a path under /public ("/models/x.stl") with the site base path (needed on GitHub Pages). */
export function asset(path: string): string {
  return path.startsWith("/") ? import.meta.env.BASE_URL + path.slice(1) : path;
}
