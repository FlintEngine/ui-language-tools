
interface SchemaType {
  elements: readonly string[]
  attributes: Record<string, string[]>
  values: Record<string, string[]>
}

export const schema: SchemaType = {
  elements: ["context", "panel", "button", "label", "slider", "sprite"] as const,
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