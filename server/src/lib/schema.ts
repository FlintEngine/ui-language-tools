export type ElementKind = "self-closing" | "inline" | "block";
export enum AttributeType {
  COLOR = "color",
  ENUM = "enum",
  ID = "id",
  STRING = "string",
  NUMBER = "number"
}


interface SchemaType {
  elements: readonly string[];
  elementKinds: Record<string, ElementKind>;
  attributes: Record<string, string[]>;
  attributeTypes: Record<string, AttributeType>;
  values: Record<string, string[]>;
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
    panel: ["id", "layout", "gap", "padding", "horizontal-align", "vertical-align", "layout-grow", "height", "width", 'x', 'y'],
    button: ["id", "font-family", "font-size", "font-weight", "optical-bias", "color", "hover-color", "gap", "icon-placement", "height", "width", 'x', 'y'],
    label: ["id", "font-family", "font-size", "font-weight", "optical-bias", "color", 'x', 'y', "horizontal-align", "vertical-align"],
    slider: ["id", "min", "max", "step", "value", "fill-color", "trackbar-color", "thumb-color", "thumb-height", "thumb-width", "layout-grow", "horizontal-align", "vertical-align"],
    sprite: ["id", "src", "height", "width"],
  },

  attributeTypes: {
    name: AttributeType.ID,
    id: AttributeType.ID,
    src: AttributeType.STRING,
    gap: AttributeType.NUMBER,
    padding: AttributeType.NUMBER,
    "layout-grow": AttributeType.NUMBER,
    "font-family": AttributeType.STRING,
    "font-size": AttributeType.NUMBER,
    "font-weight": AttributeType.NUMBER,
    "optical-bias": AttributeType.NUMBER,
    min: AttributeType.NUMBER,
    max: AttributeType.NUMBER,
    step: AttributeType.NUMBER,
    value: AttributeType.NUMBER,
    size: AttributeType.NUMBER,
    width: AttributeType.NUMBER,
    height: AttributeType.NUMBER,
    x: AttributeType.NUMBER,
    y: AttributeType.NUMBER,
    color: AttributeType.COLOR,
    "hover-color": AttributeType.COLOR,
    "fill-color": AttributeType.COLOR,
    "trackbar-color": AttributeType.COLOR,
    "thumb-color": AttributeType.COLOR,
    "thumb-height": AttributeType.NUMBER,
    "thumb-width": AttributeType.NUMBER,
    layout: AttributeType.ENUM,
    "horizontal-align": AttributeType.ENUM,
    "vertical-align": AttributeType.ENUM,
    "icon-placement": AttributeType.ENUM,
  },

  values: {
    "layout": ["vertical", "horizontal", "none"],
    "horizontal-align": ["start", "center", "end", "stretch"],
    "vertical-align": ["start", "center", "end", "stretch"],
    "icon-placement": ["left", "right"],
  },
};

export type ElementName = typeof schema.elements[number];