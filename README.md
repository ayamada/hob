# @tir.jp/hob (HTML Object Builder)

A minimal, property-centric DOM builder inspired by Clojure's Hiccup.

[![npm version](https://img.shields.io/npm/v/@tir.jp/hob.svg)](https://www.npmjs.com/package/@tir.jp/hob)
[![License](https://img.shields.io/npm/l/@tir.jp/hob.svg)](https://github.com/ayamada/hob/blob/main/LICENSE)

## Features

- **Lightweight:** Tiny footprint (about 2 KB gzipped) and zero dependencies.
- **SVG support:** Write `["svg", ...]` and the tree is built in the SVG namespace.
- **Property-centric:** Directly sets DOM properties (like `onclick`, `style.width`) instead of attributes.
- **Hiccup-like syntax:** Uses standard JavaScript arrays to define DOM structures.
- **Smart Attributes:** Automatically maps `class` to `className` and `for` to `htmlFor`, supports `style` strings and nested `style` objects, and correctly handles `data-*` and `aria-*` attributes.
- **Functional Components:** Supports React-like functional components for easy UI reuse.
- **Conditional Rendering:** `null`, `undefined` and booleans render nothing, so `cond && [...]` just works.

## Installation

```bash
npm install @tir.jp/hob
```

NPM Package: [@tir.jp/hob](https://www.npmjs.com/package/@tir.jp/hob)

## Usage

### Basic Usage
```javascript
import * as Hob from '@tir.jp/hob';

const myUI = Hob.build([
  "DIV", { class: "container", style: "padding: 10px;" },
  ["H1", "Hello World"],
  ["BUTTON", { onclick: () => alert('Clicked!') }, "Click me"]
]);

document.body.appendChild(myUI);
```

### Functional Components
You can pass a function instead of a tag name to create reusable components.

```javascript
import * as Hob from '@tir.jp/hob';

// Define a component
const Card = (attrs, title, content) => [
  "DIV", { class: "card", ...attrs },
  ["H2", title],
  ["P", content]
];

// Use the component
const app = Hob.build([
  "DIV",
  [Card, { id: "card-1" }, "Title 1", "This is the first card."],
  [Card, { style: { color: "blue" } }, "Title 2", "This is the second card."]
]);

document.body.appendChild(app);
```

### SVG
An `svg` tag switches to the SVG namespace, and its children inherit it.

```javascript
const chart = Hob.build([
  "svg", { class: "chart", viewBox: "0 0 100 100", width: 200 },
  ["circle", { cx: 50, cy: 50, r: 40, fill: "red", "stroke-width": 2 }],
  ["text", { x: 0, y: 90 }, "label"]
]);
```

- Tag names are case-sensitive in SVG, so write them in lower case (`circle`, not `CIRCLE`).
  `svg` itself is matched case-insensitively. `foreignObject` keeps the SVG namespace
  but holds XHTML children, which is how HTML is embedded in SVG.
- Write attributes in their canonical SVG spelling: `viewBox`, `stroke-width`.
  A camelCase key like `strokeWidth` is set as-is and therefore ignored by the renderer
  (there is no automatic conversion, because `viewBox` and friends must not be kebab-cased).
- On SVG elements a value is set as a property only when that property is writable
  (`onclick`, `textContent`, `style`, `dataset`, ...). Everything else becomes an attribute,
  which is why `class` and `viewBox` work although `className`/`viewBox` are read-only in the DOM.
- To build an SVG fragment without an enclosing `svg` tag, pass the namespace explicitly:

```javascript
Hob.build(["path", { d: "M0 0" }], Hob.SVG_NS);
```

### More examples
And see [test.mjs](test.mjs)

## API

### `build(treeArray, ns?)`
Takes a Hiccup-style array and returns an `HTMLElement` (or an `SVGElement`), or `null` if it renders nothing.

- `treeArray[0]`: Non-empty tag name (e.g., `"DIV"`) or a Function. Anything else throws.
- `ns`: Namespace URI of `treeArray` itself. Defaults to XHTML. Pass `Hob.SVG_NS` to build a bare SVG fragment.
- Attribute/Property object: accepted at any position, not just `treeArray[1]`. Multiple objects are merged.
- Children: strings, numbers, arrays, or existing `Node`s (`HTMLElement`, `SVGElement`, `Text`, `DocumentFragment`, ...).
- `null`, `undefined` and booleans render nothing, so `cond && ["P", "x"]` is safe.

A nested array whose first element is neither a String nor a Function is expanded in place
(handy for mapping over a list):

```javascript
Hob.build(["UL", items.map((x) => ["LI", x])]);
```

### `setAttr(htmlObj, attrObj)`
Recursively assigns properties from `attrObj` to `htmlObj` (an HTML or SVG element).

- `class` and `for` are mapped to `className` and `htmlFor` (HTML only; SVG has neither, so they stay attributes).
- Keys containing `-` (e.g. `data-*`, `aria-*`) are set via `setAttribute`.
- On an SVG element, any key that is not a writable DOM property is set via `setAttribute`.
- A nested object is applied to the corresponding property, which is how `{style: {...}}` works.
  If that property does not exist, the object is simply assigned as-is.

### `SVG_NS`
The SVG namespace URI (`"http://www.w3.org/2000/svg"`), for `build(treeArray, Hob.SVG_NS)`.

## Repository

- GitHub: [ayamada/hob](https://github.com/ayamada/hob)

## ChangeLog

- See [ChangeLog.md](ChangeLog.md)

## License

Zlib
