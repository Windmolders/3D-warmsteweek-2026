// Edit your external order form here.
export const SITE_TITLE = "3D Print Warmest Week 2026";

export const ORDER_FORM = {
  // Short link, printed on the price list.
  url: "https://forms.cloud.microsoft/e/Ucjdhna8Uv",
  // Full form link, used by the cart: the short link cannot carry a prefilled answer.
  prefillUrl:
    "https://forms.cloud.microsoft/Pages/ResponsePage.aspx?id=UxAVQpMBqkeege_9gfdyzOp3ppPpDIpMhOA1DngngFlUQzNOOFVNSFVCWUlOMUpRNEJOTEJOQlFSTS4u",
  // Id of the form question that receives the order.
  orderParam: "r7702887b21134cdfad98b4c5ba6ad76f",
};

export function buildOrderUrl(order: string): string {
  // encodeURIComponent, not URLSearchParams: spaces must be %20, not "+".
  return `${ORDER_FORM.prefillUrl}&${ORDER_FORM.orderParam}=${encodeURIComponent(order)}`;
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
