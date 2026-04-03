# @tir.jp/hob (HTML Object Builder)

A minimal, property-centric DOM builder inspired by Clojure's Hiccup.

[![npm version](https://img.shields.io/npm/v/@tir.jp/hob.svg)](https://www.npmjs.com/package/@tir.jp/hob)
[![License](https://img.shields.io/npm/l/@tir.jp/hob.svg)](https://github.com/ayamada/hob/blob/main/LICENSE)

## Features

- **Lightweight:** Tiny footprint (less than 1KB).
- **Property-centric:** Directly sets DOM properties (like `onclick`, `style.width`) instead of attributes.
- **Hiccup-like syntax:** Uses standard JavaScript arrays to define DOM structures.
- **Smart Attributes:** Automatically maps `class` to `className`, supports `style` strings, and correctly handles `data-*` and `aria-*` attributes.
- **Functional Components:** Supports React-like functional components for easy UI reuse.

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
Takes a Hiccup-style array and returns an `HTMLElement`.

- `treeArray[0]`: Tag name (e.g., `"DIV"`) or a Function.
- `treeArray[1]` (optional): Attribute/Property object.
- `...treeArray[2:]`: Children (strings, numbers, arrays, or existing `HTMLElement`s).

### `setAttr(htmlObj, attrObj)`
Recursively assigns properties from `attrObj` to `htmlObj`.

## Repository

- GitHub: [ayamada/hob](https://github.com/ayamada/hob)

## ChangeLog

- See [ChangeLog.md](ChangeLog.md)

## License

Zlib
