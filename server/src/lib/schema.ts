export type ElementKind = "self-closing" | "inline" | "block";

interface SchemaType {
  elements: readonly string[]
  elementKinds: Record<string, ElementKind>
  attributes: Record<string, string[]>
  values: Record<string, string[]>
}

export const schema: SchemaType = {
  elements: ["context", "panel", "button", "label", "slider", "sprite"] as const,

  elementKinds: {
    context: "block",
    panel: "block",
    button: "inline",
    label: "inline",
    slider: "self-closing",
    sprite: "self-closing",
  },
  attributes: {
    context: ["name"],
    panel: ["id", "layout", "spacing", "padding", "horizontal-align", "vertical-align", "layout-grow"],
    button: ["id", "font-size", "font-weight", "color", "hover-color", "icon-gap", "icon-placement"],
    label: ["id", "font-size", "font-weight", "color"],
    slider: ["id", "min", "max", "step", "value", "fill-color", "trackbar-color", "thumb-color", "layout-grow"],
    sprite: ["id", "src", "size"],
  },
  values: {
    "layout": ["vertical", "horizontal"],
    "horizontal-align": ["start", "center", "end", "stretch"],
    "vertical-align": ["start", "center", "end", "stretch"],
    "icon-placement": ["left", "right"],
  }
}

export type ElementName = typeof schema.elements[number];