export type ElementKind = "self-closing" | "inline" | "block";

export enum AttributeType {
  COLOR = "color",
  ENUM = "enum",
  ID = "id",
  STRING = "string",
  NUMBER = "number",
  BOOLEAN = "boolean",
  BOX = "box",
  PATH = "path",
}

export interface AttributeConfig {
  type: AttributeType;
  description?: string;
  values?: readonly string[];
}

const align = ["start", "center", "end", "stretch", "left", "right"] as const;

export const attributes = {
  // Identity
  id: {
    type: AttributeType.ID,
    description: "Unique id used to look the widget up from code via UIContext::findById. Must be unique within a context; a duplicate is rejected (or cleared on mount) with a warning."
  },
  name: {
    type: AttributeType.ID,
    description: "Context name. Used by UISystem to register, look up, activate, and destroy the context."
  },

  // State
  visible: {
    type: AttributeType.BOOLEAN,
    description:
      "Whether the widget is shown. `false` hides it and its children, removes it from layout, and stops it receiving input. Accepts true/false or an integer (non-zero = true). Default: true.",
    values: ["true", "false"]
  },
  disabled: {
    type: AttributeType.BOOLEAN,
    description:
      "Whether the widget ignores input. A disabled widget (and its children) stays visible and keeps its layout but receives no events. Accepts true/false or an integer (non-zero = true). Default: false.",
    values: ["true", "false"]
  },

  // Layout
  layout: {
    type: AttributeType.ENUM,
    description:
      "How a panel arranges its children: stacked on the y-axis (vertical), on the x-axis (horizontal), or not flowed at all (none), where children are placed by their own x/y and alignment. Default: vertical.",
    values: ["vertical", "horizontal", "none"],
  },
  "horizontal-align": {
    type: AttributeType.ENUM,
    description:
      "How this element sits horizontally within the slot its parent gives it. In a vertical layout this is the cross-axis alignment; `stretch` fills the slot width. `left`/`right` are aliases for `start`/`end`. Default: stretch.",
    values: align,
  },
  "vertical-align": {
    type: AttributeType.ENUM,
    description:
      "How this element sits vertically within the slot its parent gives it. In a horizontal layout this is the cross-axis alignment; `stretch` fills the slot height. `left`/`right` are aliases for `start`/`end`. Default: start.",
    values: align,
  },
  "layout-grow": {
    type: AttributeType.NUMBER,
    description:
      "Flex-grow weight. Leftover space along the parent's layout axis is split between growing siblings in proportion to this value; 0 keeps the element at its measured size. Negative values clamp to 0.",
  },
  gap: {
    type: AttributeType.NUMBER,
    description:
      "Spacing in pixels. On a panel: space between consecutive children (default 8). On a button: space between the icon sprite and the text (default 4).",
  },
  padding: {
    type: AttributeType.BOX,
    description:
      "Inner spacing of a panel in pixels. 1–4 space-separated numbers: all | vertical horizontal | top horizontal bottom | top right bottom left.",
  },
  width: {
    type: AttributeType.NUMBER,
    description:
      "Fixed width in pixels. Overrides the width the layout would otherwise assign; omit to size from content / the parent slot. Sprites and sliders scale this by the display scale.",
  },
  height: {
    type: AttributeType.NUMBER,
    description:
      "Fixed height in pixels. Overrides the height the layout would otherwise assign; omit to size from content / the parent slot. Sprites and sliders scale this by the display scale.",
  },
  x: {
    type: AttributeType.NUMBER,
    description:
      'Horizontal offset in pixels, added to the position the parent assigns. Mainly useful inside a panel with layout="none".',
  },
  y: {
    type: AttributeType.NUMBER,
    description:
      'Vertical offset in pixels, added to the position the parent assigns. Mainly useful inside a panel with layout="none".',
  },


  // Text
  "font-family": {
    type: AttributeType.STRING,
    description:
      "Name of a font registered with the UI canvas. Falls back to the canvas default font if the name isn't loaded.",
  },
  "font-size": {
    type: AttributeType.NUMBER,
    description:
      "Font size in points before display scaling. Integer; 0 is ignored. Default: 16.",
  },
  "font-weight": {
    type: AttributeType.NUMBER,
    description:
      "Numeric font weight, e.g. 400 for regular or 700 for bold. Must match a weight loaded for the font. Default: 400.",
  },
  "optical-bias": {
    type: AttributeType.NUMBER,
    description:
      "Vertical nudge for text as a fraction of the font size (e.g. 0.05 shifts text up 5% of the font size). Use to correct fonts whose glyphs sit visually off-center. Default: 0.",
  },

  // Colors
  color: {
    type: AttributeType.COLOR,
    description:
      "Base color for text (label, button) or tint for sprites. Accepts #rgb, #rrggbb, #rrggbbaa, rgb(r,g,b), rgba(r,g,b,a) with alpha 0–1, or a named color (white, black, red, green, blue, yellow, cyan, magenta, transparent). Default: white.",
  },
  "hover-color": {
    type: AttributeType.COLOR,
    description:
      "Color used while the widget is hovered, focused, or (for sliders) being dragged. Applies to button text/icon and the slider thumb. Default: green.",
  },
  "fill-color": {
    type: AttributeType.COLOR,
    description:
      "Color of the filled portion of the slider track, from the minimum up to the current value. Default: rgb(180,180,180).",
  },
  "trackbar-color": {
    type: AttributeType.COLOR,
    description:
      "Background color of the full slider track. Default: rgb(70,70,70).",
  },
  "thumb-color": {
    type: AttributeType.COLOR,
    description:
      "Color of the slider thumb in its resting state. Replaced by hover-color while hovered, focused, or dragged. Default: rgb(230,230,230).",
  },

  // Button
  "icon-placement": {
    type: AttributeType.ENUM,
    description:
      "Which side of the button text the child <sprite> icon is drawn on. If omitted, it's inferred from source order: text before the sprite puts the icon on the right, otherwise on the left.",
    values: ["left", "right"],
  },

  // Slider
  min: {
    type: AttributeType.NUMBER,
    description:
      "Minimum value of the slider. Swapped with max if larger. Default: 0.",
  },
  max: {
    type: AttributeType.NUMBER,
    description:
      "Maximum value of the slider. Swapped with min if smaller. Default: 1.",
  },
  step: {
    type: AttributeType.NUMBER,
    description:
      "Increment the value snaps to, measured from min. Also the amount a keyboard/gamepad left/right press moves the value. 0 disables snapping (navigation then moves 1% of the range). Default: 0.01.",
  },
  value: {
    type: AttributeType.NUMBER,
    description:
      "Initial slider value. Snapped to step and clamped to [min, max]. Default: 0.",
  },
  "track-height": {
    type: AttributeType.NUMBER,
    description:
      "Thickness of the slider track in pixels before display scaling. Negative values clamp to 0. Default: 6.",
  },
  "thumb-width": {
    type: AttributeType.NUMBER,
    description:
      "Width of the slider thumb in pixels before display scaling. Negative values clamp to 0. Default: 8.",
  },
  "thumb-height": {
    type: AttributeType.NUMBER,
    description:
      "Height of the slider thumb in pixels before display scaling. The larger of thumb-height and track-height becomes the slider's default height when no height is given. Default: 6.",
  },

  // Sprite
  src: {
    type: AttributeType.PATH,
    description:
      "Image path, relative to the assets root. Required; the sprite is skipped with a warning if missing or if the texture fails to load. The texture's pixel size becomes the sprite's default width/height.",
  },
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

/** Attributes UIBuilder::applyAttributes handles on every registered node. */
const common = [
  "id",
  "visible",
  "disabled",
  "horizontal-align",
  "vertical-align",
  "layout-grow",
  "width",
  "height",
  "x",
  "y",
] as const satisfies readonly AttributeName[];

const text = [
  "font-family",
  "font-size",
  "font-weight",
  "optical-bias",
] as const satisfies readonly AttributeName[];

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
      ...common,
      "id",
      "layout",
      "gap",
      "padding",
    ],
  },

  button: {
    kind: "inline",
    description: "Interactive button that can contain text and inline child content.",
    attributes: [...common, ...text, "color", "hover-color", "gap", "icon-placement"],
  },

  label: {
    kind: "inline",
    description: "Non-interactive text element.",
    attributes: [...common, ...text, "color"],
  },

  slider: {
    kind: "self-closing",
    description: "Interactive numeric value selector with configurable range and styling.",
    attributes: [
      ...common,
      "min",
      "max",
      "step",
      "value",
      "hover-color",
      "fill-color",
      "trackbar-color",
      "thumb-color",
      "track-height",
      "thumb-height",
      "thumb-width",
    ],
  },

  sprite: {
    kind: "self-closing",
    description: "Displays an image asset inside the UI.",
    attributes: [...common, "src", "color"],
  },
} as const satisfies Record<string, ElementConfig>;

export type ElementName = keyof typeof elements;

export function isElementName(name: string): name is ElementName {
  return Object.hasOwn(elements, name);
}

export function getElementConfig(name: string): ElementConfig | undefined {
  return isElementName(name) ? elements[name] : undefined;
}