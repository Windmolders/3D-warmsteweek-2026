export type Shape =
  | "torusKnot" | "icosahedron" | "box" | "cone" | "cylinder" | "torus"
  | "dodecahedron" | "octahedron" | "sphere" | "tetrahedron" | "capsule" | "ring";

/** One selectable 3D model inside a set (shown as a tab on the model page). */
export interface Variant {
  id: string;
  label: string;
  file: string;
  /** Price of this variant; overrides the model price. */
  price?: string;
  upAxis?: "y" | "z";
}

export interface Model {
  id: string;
  name: string;
  description: string;
  price?: string;
  /** Path under /public, e.g. "/models/vase.glb", ".stl" or ".3mf". Omit = placeholder shape. */
  file?: string;
  /** Download link for the original STL (optional). */
  download?: string;
  /** Set with several 3D models: shows tabs and overrides "file". */
  variants?: Variant[];
  /** STL and 3MF are usually Z-up (default). Set to "y" if your file is already Y-up. */
  upAxis?: "y" | "z";
  /** Placeholder shape while there is no file. */
  shape?: Shape;
  /** Photos under /public, e.g. "/photos/vase-1.jpg". First = main photo. */
  photos: string[];
}

export type Finish = "satin" | "matte" | "metal";

export interface PrintColor {
  id: string;
  name: string;
  hex: string;
  /** Filament spool photo under /public. Without it the box shows the color fill. */
  photo?: string;
  /** "matte" = extra rough, no sheen. "metal" = metallic with reflections. Default "satin" (slightly glossy). */
  finish?: Finish;
}
