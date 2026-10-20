# Flint UI / Flint Markup Language LSP

[![NPM Version](https://img.shields.io/npm/v/%40flintengine%2Flanguage-server?style=for-the-badge)](https://www.npmjs.com/package/@flintengine/language-server)
[![VS Code Marketplace](https://img.shields.io/badge/VS_Code-Marketplace-007ACC?style=for-the-badge)](https://marketplace.visualstudio.com/items?itemName=FlintEngine.flint-ui-language-server)
[![JetBrains Plugin](https://img.shields.io/badge/JetBrains-Plugin-000000?style=for-the-badge)](https://plugins.jetbrains.com/plugin/35227-flint-ui-language-server)



Language support for **Flint Markup Language (FLML)**, the declarative UI markup language used by [FlintEngine](https://flintengine.dev/).

## Features

- **Syntax highlighting:** FLML elements, attributes, strings, comments, and character entities.
- **Context-aware completions:** Suggestions for supported elements and their attributes.
- **Hover documentation:** Information about FLML elements and attributes.
- **Diagnostics:** Feedback for invalid markup and unsupported attributes.
- **Color Preview and Picker:** Preview and edit named, hexadecimal, RGB, and RGBA color values.
- **Editor integrations:** Language support for VS Code, JetBrains IDEs, and other LSP-compatible editors.

 ## Installation

### Visual Studio Code

Install [Flint UI Language Server](https://marketplace.visualstudio.com/items?itemName=FlintEngine.flint-ui-language-server) from the Visual Studio Marketplace.

The extension automatically recognizes `.flml` files.

It also provides FLML syntax highlighting inside Markdown fenced code blocks labeled `flml`.

### JetBrains IDEs

[Flint UI Language Server](https://plugins.jetbrains.com/plugin/35227-flint-ui-language-server) is available as a JetBrains plugin.  

#### Compatibility:

| Editor | Version |
| --- | --- |
| GoLand | 2026.1+ |
| DataGrip | 2026.1+ |
| PhpStorm | 2026.1+ |
| WebStorm | 2026.1+ |
| RubyMine | 2026.1+ |
| RustRover | 2026.1+ |
| CLion | 2026.1+ |
| Rider | 2026.1+ |
| PyCharm Pro | 2026.1+ |
| IntelliJ IDEA Ultimate | 2026.1+ |

### Standalone Language Server

The language server is published independently on npm:

```bash
npm install -g @flintengine/language-server
```

Run it using:

```bash
flint-language-server
```

The server communicates over standard input and output using the Language Server Protocol. Configure your editor's LSP client to launch this command for `.flml` files.

## Example Syntax

`example.flml`

```flml
<context name="main-menu">
  <panel
      id="root-main-menu"
      layout="vertical"
      layout-grow="1"
      padding="100 0 100 100"
      gap="24">
    <label
        font-size="32"
        color="rgba(255, 255, 255, 1)">
      Main Menu
    </label>
    </button>
    <panel
        layout="horizontal"
        horizontal-align="stretch"
        vertical-align="center"
        gap="12">
      <label>Test Slider</label>
      <slider
          id="test-slider"
          min="0"
          max="1"
          step="0.01"
          thumb-color="rgba(255, 255, 255, 1.0)"
          fill-color="cyan"
          trackbar-color="magenta" />
    </panel>
  </panel>
</context>
```

FLML layouts describe UI elements and their properties declaratively. FlintEngine parses these layouts to construct its retained-mode UI hierarchy.

## Editor Support

| Editor | Integration |
|---|---|
| Visual Studio Code | Dedicated extension |
| JetBrains IDEs | Dedicated plugin |
| Other LSP-compatible editors | Manual language-server configuration |

## Related Projects

- [FlintEngine](https://flintengine.dev/) — The C++20 / SDL3 game engine that uses FLML.
- [Language Server on npm](https://www.npmjs.com/package/@flintengine/language-server)

## License

Licensed under the [MIT License](LICENSE).