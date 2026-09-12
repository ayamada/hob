# @tir.jp/hob (HTML Object Builder)

A minimal, property-centric DOM builder inspired by Clojure's Hiccup.

[![npm version](https://img.shields.io/npm/v/@tir.jp/hob.svg)](https://www.npmjs.com/package/@tir.jp/hob)
[![License](https://img.shields.io/npm/l/@tir.jp/hob.svg)](https://github.com/ayamada/hob/blob/main/LICENSE)

## Features

- **Lightweight:** Tiny footprint (about 2 KB of source) and zero dependencies.
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

### More examples
And see [test.mjs](test.mjs)

## API

### `build(treeArray)`
Takes a Hiccup-style array and returns an `HTMLElement`, or `null` if it renders nothing.

- `treeArray[0]`: Non-empty tag name (e.g., `"DIV"`) or a Function. Anything else throws.
- Attribute/Property object: accepted at any position, not just `treeArray[1]`. Multiple objects are merged.
- Children: strings, numbers, arrays, or existing `Node`s (`HTMLElement`, `SVGElement`, `Text`, `DocumentFragment`, ...).
- `null`, `undefined` and booleans render nothing, so `cond && ["P", "x"]` is safe.

A nested array whose first element is neither a String nor a Function is expanded in place
(handy for mapping over a list):

```javascript
Hob.build(["UL", items.map((x) => ["LI", x])]);
```

### `setAttr(htmlObj, attrObj)`
Recursively assigns properties from `attrObj` to `htmlObj`.

- `class` and `for` are mapped to `className` and `htmlFor`.
- Keys containing `-` (e.g. `data-*`, `aria-*`) are set via `setAttribute`.
- A nested object is applied to the corresponding property, which is how `{style: {...}}` works.
  If that property does not exist, the object is simply assigned as-is.

## Repository

- GitHub: [ayamada/hob](https://github.com/ayamada/hob)

## ChangeLog

- See [ChangeLog.md](ChangeLog.md)

## License

Zlib
