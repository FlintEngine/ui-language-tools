export type ElementKind = "self-closing" | "inline" | "block";

export enum AttributeType {
  COLOR = "color",
  ENUM = "enum",
  ID = "id",
  STRING = "string",
  NUMBER = "number",
  BOX = "box",
  PATH = "path",
}

export interface AttributeConfig {
  type: AttributeType;
  description?: string;
  values?: readonly string[];
}

const align = ["start", "center", "end", "stretch"] as const;

export const attributes = {
  // Identity
  id: { type: AttributeType.ID, description: "Unique id used to look the widget up from code." },
  name: { type: AttributeType.ID, description: "Context name." },

  // Layout
  layout: { type: AttributeType.ENUM, description: "How children are arranged.", values: ["vertical", "horizontal", "none"] },
  "horizontal-align": { type: AttributeType.ENUM, values: align },
  "vertical-align": { type: AttributeType.ENUM, values: align },
  "layout-grow": { type: AttributeType.NUMBER },
  gap: { type: AttributeType.NUMBER },
  padding: { type: AttributeType.BOX, description: "1–4 numbers: all | v h | top h bottom | top right bottom left." },
  width: { type: AttributeType.NUMBER },
  height: { type: AttributeType.NUMBER },
  x: { type: AttributeType.NUMBER },
  y: { type: AttributeType.NUMBER },

  // Text
  "font-family": { type: AttributeType.STRING },
  "font-size": { type: AttributeType.NUMBER },
  "font-weight": { type: AttributeType.NUMBER },
  "optical-bias": { type: AttributeType.NUMBER },

  // Colors
  color: { type: AttributeType.COLOR },
  "hover-color": { type: AttributeType.COLOR },
  "fill-color": { type: AttributeType.COLOR },
  "trackbar-color": { type: AttributeType.COLOR },
  "thumb-color": { type: AttributeType.COLOR },

  // Button
  "icon-placement": { type: AttributeType.ENUM, values: ["left", "right"] },

  // Slider
  min: { type: AttributeType.NUMBER, description: "Minimum value that slider can have." },
  max: { type: AttributeType.NUMBER, description: "Maximum value that slider can have." },
  step: { type: AttributeType.NUMBER, description: "Increment amount for slider thumb." },
  value: { type: AttributeType.NUMBER, description: "Starting value for slider." },
  "thumb-width": { type: AttributeType.NUMBER, description: "" },
  "thumb-height": { type: AttributeType.NUMBER, description: "" },

  // Sprite
  src: { type: AttributeType.PATH, description: "Image path, relative to the assets root." },
} as const satisfies Record<string, AttributeConfig>;

export type AttributeName = keyof typeof attributes;

export function isAttributeName(name: string): name is AttributeName {
  return Object.hasOwn(attributes, name);
}

export function getAttributeConfig(name: string): AttributeConfig | undefined {
  return isAttributeName(name) ? attributes[name] : undefined;
}

interface ElementConfig {
  kind: ElementKind;
  description?: string;
  attributes: readonly AttributeName[];
}

export const elements = {
  context: {
    kind: "block",
    description: "Root UI context that groups a complete interface tree.",
    attributes: ["name"],
  },

  panel: {
    kind: "block",
    description: "Container used to group and lay out child UI elements.",
    attributes: [
      "id",
      "layout",
      "gap",
      "padding",
      "horizontal-align",
      "vertical-align",
      "layout-grow",
      "height",
      "width",
      "x",
      "y",
    ],
  },

  button: {
    kind: "inline",
    description: "Interactive button that can contain text and inline child content.",
    attributes: [
      "id",
      "font-family",
      "font-size",
      "font-weight",
      "optical-bias",
      "color",
      "hover-color",
      "gap",
      "icon-placement",
      "height",
      "width",
      "x",
      "y",
    ],
  },

  label: {
    kind: "inline",
    description: "Non-interactive text element.",
    attributes: [
      "id",
      "font-family",
      "font-size",
      "font-weight",
      "optical-bias",
      "color",
      "x",
      "y",
      "horizontal-align",
      "vertical-align",
    ],
  },

  slider: {
    kind: "self-closing",
    description: "Interactive numeric value selector with configurable range and styling.",
    attributes: [
      "id",
      "min",
      "max",
      "step",
      "value",
      "fill-color",
      "trackbar-color",
      "thumb-color",
      "thumb-height",
      "thumb-width",
      "layout-grow",
      "horizontal-align",
      "vertical-align",
    ],
  },

  sprite: {
    kind: "self-closing",
    description: "Displays an image asset inside the UI.",
    attributes: ["id", "src", "height", "width"],
  },
} as const satisfies Record<string, ElementConfig>;

export type ElementName = keyof typeof elements;

export function isElementName(name: string): name is ElementName {
  return Object.hasOwn(elements, name);
}

export function getElementConfig(name: string): ElementConfig | undefined {
  return isElementName(name) ? elements[name] : undefined;
}

export const schema = {}