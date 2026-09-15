import test from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import * as Hob from './index.mjs';

// Setup global browser environment for Node.js
const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
global.window = dom.window;
global.document = dom.window.document;
global.HTMLElement = dom.window.HTMLElement;
global.SVGElement = dom.window.SVGElement;
global.Node = dom.window.Node;

const SVG_NS = 'http://www.w3.org/2000/svg';
const XHTML_NS = 'http://www.w3.org/1999/xhtml';

test('Basic: build element with attributes and text', () => {
  const el = Hob.build(["DIV", { id: "test", title: "hello" }, "Content"]);
  
  assert.strictEqual(el.tagName, "DIV");
  assert.strictEqual(el.id, "test");
  assert.strictEqual(el.title, "hello");
  assert.strictEqual(el.textContent, "Content");
});

test('Basic: nested elements', () => {
  const el = Hob.build([
    "DIV",
    ["P", "paragraph"],
    ["SPAN", "span"],
    [ // expand children if first element is neither String nor Function
      ["P", "p1"],
      ["P", "p2"],
      ["P", "p3"],
    ]
  ]);
  
  assert.strictEqual(el.children.length, 5);
  assert.strictEqual(el.children[0].tagName, "P");
  assert.strictEqual(el.children[0].textContent, "paragraph");
  assert.strictEqual(el.children[1].tagName, "SPAN");
  assert.strictEqual(el.children[1].textContent, "span");
  assert.strictEqual(el.children[2].textContent, "p1");
  assert.strictEqual(el.children[3].textContent, "p2");
  assert.strictEqual(el.children[4].textContent, "p3");
});

test('QoL: class mapping', () => {
  const el = Hob.build(["DIV", { class: "my-class" }]);
  assert.strictEqual(el.className, "my-class");
});

test('QoL: style as string', () => {
  const el = Hob.build(["DIV", { style: "color: red; display: block;" }]);
  assert.strictEqual(el.style.color, "red");
  assert.strictEqual(el.style.display, "block");
});

test('QoL: nested style object', () => {
  const el = Hob.build(["DIV", { style: { color: "blue", fontSize: "20px" } }]);
  assert.strictEqual(el.style.color, "blue");
  assert.strictEqual(el.style.fontSize, "20px");
});

test('QoL: data-* and aria-* attributes', () => {
  const el = Hob.build(["DIV", { "data-id": "123", "aria-hidden": "true" }]);
  assert.strictEqual(el.getAttribute("data-id"), "123");
  assert.strictEqual(el.getAttribute("aria-hidden"), "true");
});

test('Function Components: basic composition (Lisp-style arguments)', () => {
  // Component expects attributes and variable children
  const MyComp = (attrs, ...children) => ["DIV", { class: "comp", ...attrs }, ...children];
  
  const el = Hob.build([MyComp, { id: "c1" }, "child content"]);
  
  assert.strictEqual(el.tagName, "DIV");
  assert.strictEqual(el.className, "comp");
  assert.strictEqual(el.id, "c1");
  assert.strictEqual(el.textContent, "child content");
});

test('Function Components: nested components', () => {
  const Title = (text) => ["H1", text];
  const Layout = ({ theme }, ...children) => ["MAIN", { class: theme }, ...children];
  
  const el = Hob.build([
    Layout, { theme: "dark" },
    [Title, "My App"],
    ["P", "welcome"]
  ]);
  
  assert.strictEqual(el.className, "dark");
  assert.strictEqual(el.children[0].tagName, "H1");
  assert.strictEqual(el.children[0].textContent, "My App");
  assert.strictEqual(el.children[1].tagName, "P");
});

test('Edge cases: null/undefined children', () => {
  const el = Hob.build(["DIV", null, "content", undefined, ["SPAN", "nested"]]);
  assert.strictEqual(el.childNodes.length, 2); // Text node and SPAN
  assert.strictEqual(el.textContent, "contentnested");
});

test('Edge cases: HTMLElement as child', () => {
  const existing = document.createElement("SECTION");
  existing.textContent = "existing";
  
  const el = Hob.build(["DIV", existing]);
  assert.strictEqual(el.children[0].tagName, "SECTION");
  assert.strictEqual(el.children[0].textContent, "existing");
});

test('Attr: style object with kebab-case key', () => {
  const el = Hob.build(["DIV", { style: { "background-color": "red" } }]);
  assert.strictEqual(el.style.backgroundColor, "red");
});

test('Attr: nested object on a non-existent property is just assigned', () => {
  const el = Hob.build(["DIV", { foo: { bar: 1 } }]);
  assert.deepStrictEqual(el.foo, { bar: 1 });
});

test('Attr: nested object on dataset', () => {
  const el = Hob.build(["DIV", { dataset: { foo: "bar" } }]);
  assert.strictEqual(el.getAttribute("data-foo"), "bar");
});

test('Attr: for is mapped to htmlFor', () => {
  const el = Hob.build(["LABEL", { for: "name" }, "Name"]);
  assert.strictEqual(el.getAttribute("for"), "name");
});

test('Attr: style object with null prototype', () => {
  const el = Hob.build(["DIV", { style: Object.assign(Object.create(null), { color: "red" }) }]);
  assert.strictEqual(el.style.color, "red");
});

test('Attr: setAttr() directly', () => {
  const el = document.createElement("DIV");
  Hob.setAttr(el, { id: "x", "data-v": 1, style: { color: "red" } });
  assert.strictEqual(el.id, "x");
  assert.strictEqual(el.getAttribute("data-v"), "1");
  assert.strictEqual(el.style.color, "red");
});

test('Attr: event handler property', () => {
  let clicked = 0;
  const el = Hob.build(["BUTTON", { onclick: () => { clicked++ } }, "go"]);
  el.dispatchEvent(new dom.window.MouseEvent("click"));
  assert.strictEqual(clicked, 1);
});

test('Children: booleans render nothing', () => {
  const el = Hob.build(["DIV", false, true, "text"]);
  assert.strictEqual(el.textContent, "text");
  assert.strictEqual(el.childNodes.length, 1);
});

test('Children: falsy conditional renders nothing', () => {
  const el = Hob.build(["DIV", false && ["P", "x"], ["P", "y"]]);
  assert.strictEqual(el.children.length, 1);
  assert.strictEqual(el.children[0].textContent, "y");
});

test('Children: existing Node is reused as-is', () => {
  const text = document.createTextNode("hi");
  const el = Hob.build(["DIV", text]);
  assert.strictEqual(el.childNodes[0], text);
  assert.strictEqual(el.textContent, "hi");
});

test('Children: DocumentFragment is appended', () => {
  const frag = document.createDocumentFragment();
  frag.appendChild(document.createElement("P"));
  const el = Hob.build(["DIV", frag]);
  assert.strictEqual(el.children.length, 1);
  assert.strictEqual(el.children[0].tagName, "P");
});

test('Children: SVGElement is appended, not stringified', () => {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  const el = Hob.build(["DIV", svg]);
  assert.strictEqual(el.children[0], svg);
  assert.strictEqual(el.textContent, "");
});

test('Children: number is rendered as text', () => {
  assert.strictEqual(Hob.build(["DIV", 42]).textContent, "42");
});

test('Function Components: returning nothing renders nothing', () => {
  const el = Hob.build(["DIV", [() => null], [() => undefined], ["P", "x"]]);
  assert.strictEqual(el.children.length, 1);
  assert.strictEqual(el.children[0].textContent, "x");
  assert.strictEqual(Hob.build([() => null]), null);
});

test('Function Components: returning a Node directly', () => {
  const existing = document.createElement("SECTION");
  assert.strictEqual(Hob.build([() => existing]), existing);
});

test('Edge cases: invalid root tag throws', () => {
  assert.throws(() => Hob.build([]), /requires a non-empty tag name/);
  assert.throws(() => Hob.build([123, "x"]), /requires a non-empty tag name/);
  assert.throws(() => Hob.build(["", "x"]), /requires a non-empty tag name/);
  assert.throws(() => Hob.build("not an array"), /requires an array/);
});

test('SVG: the svg tag switches to the SVG namespace', () => {
  const el = Hob.build(["svg", { viewBox: "0 0 100 100" }, ["circle", { cx: 50, cy: 50, r: 40, fill: "red" }]]);

  assert.strictEqual(el.namespaceURI, SVG_NS);
  assert.strictEqual(el.tagName, "svg");
  assert.strictEqual(el.getAttribute("viewBox"), "0 0 100 100");

  const circle = el.children[0];
  assert.strictEqual(circle.namespaceURI, SVG_NS);
  assert.strictEqual(circle.tagName, "circle");
  assert.strictEqual(circle.getAttribute("cx"), "50");
  assert.strictEqual(circle.getAttribute("r"), "40");
  assert.strictEqual(circle.getAttribute("fill"), "red");
});

test('SVG: children inherit the namespace deeply, inside HTML too', () => {
  const el = Hob.build(["DIV", ["svg", ["g", ["g", ["path", { d: "M0 0" }]]]]]);
  const svg = el.children[0];

  assert.strictEqual(svg.namespaceURI, SVG_NS);
  assert.strictEqual(svg.firstChild.namespaceURI, SVG_NS);
  assert.strictEqual(svg.firstChild.firstChild.namespaceURI, SVG_NS);
  assert.strictEqual(svg.firstChild.firstChild.firstChild.getAttribute("d"), "M0 0");
});

test('SVG: class becomes an attribute, not className', () => {
  const el = Hob.build(["svg", { class: "icon" }]);
  assert.strictEqual(el.getAttribute("class"), "icon");
  assert.strictEqual(el.getAttribute("className"), null);
});

test('SVG: kebab-case attributes and numbers', () => {
  const el = Hob.build(["svg", ["path", { "stroke-width": 2, "stroke-opacity": 0.5 }]]);
  assert.strictEqual(el.firstChild.getAttribute("stroke-width"), "2");
  assert.strictEqual(el.firstChild.getAttribute("stroke-opacity"), "0.5");
});

test('SVG: style as string, object and dataset', () => {
  const str = Hob.build(["svg", { style: "fill: red;" }]);
  assert.strictEqual(str.style.fill, "red");

  const obj = Hob.build(["svg", { style: { strokeWidth: "3px" } }]);
  assert.strictEqual(obj.style.strokeWidth, "3px");

  const data = Hob.build(["svg", { dataset: { foo: "bar" } }]);
  assert.strictEqual(data.getAttribute("data-foo"), "bar");
});

test('SVG: event handler and textContent stay properties', () => {
  let clicked = 0;
  const el = Hob.build(["svg", { onclick: () => { clicked++ } }, ["text", "hi", 42]]);
  el.dispatchEvent(new dom.window.MouseEvent("click"));

  assert.strictEqual(clicked, 1);
  assert.strictEqual(el.firstChild.textContent, "hi42");
});

test('SVG: nested arrays are expanded in place', () => {
  const el = Hob.build(["svg", [[1, 2].map((r) => ["circle", { r }])]]);
  assert.strictEqual(el.children.length, 2);
  assert.strictEqual(el.children[0].namespaceURI, SVG_NS);
  assert.strictEqual(el.children[1].getAttribute("r"), "2");
});

test('SVG: functional components inherit the namespace', () => {
  const Circle = (attrs) => ["circle", attrs];
  const el = Hob.build(["svg", [Circle, { r: 5 }]]);

  assert.strictEqual(el.children[0].namespaceURI, SVG_NS);
  assert.strictEqual(el.children[0].getAttribute("r"), "5");
});

test('SVG: foreignObject switches back to XHTML', () => {
  const el = Hob.build(["svg", ["foreignObject", ["DIV", { class: "in-svg" }, "html!"]]]);
  const div = el.firstChild.firstChild;

  assert.strictEqual(el.firstChild.namespaceURI, SVG_NS);
  assert.strictEqual(div.namespaceURI, XHTML_NS);
  assert.strictEqual(div.className, "in-svg");
  assert.strictEqual(div.textContent, "html!");
});

test('SVG: uppercase svg tag is normalized', () => {
  const el = Hob.build(["DIV", ["SVG", ["circle"]]]);
  assert.strictEqual(el.children[0].namespaceURI, SVG_NS);
  assert.strictEqual(el.children[0].tagName, "svg");
  assert.strictEqual(el.children[0].firstChild.namespaceURI, SVG_NS);
});

test('SVG: build(treeArray, SVG_NS) builds a bare fragment', () => {
  const el = Hob.build(["path", { d: "M0 0" }], Hob.SVG_NS);
  assert.strictEqual(el.namespaceURI, SVG_NS);
  assert.strictEqual(el.getAttribute("d"), "M0 0");
  assert.strictEqual(Hob.SVG_NS, SVG_NS);
});

test('SVG: setAttr() on an existing SVG element', () => {
  const svg = document.createElementNS(SVG_NS, "svg");
  Hob.setAttr(svg, { class: "a", viewBox: "0 0 1 1", "data-v": 1, style: { fill: "red" } });

  assert.strictEqual(svg.getAttribute("class"), "a");
  assert.strictEqual(svg.getAttribute("viewBox"), "0 0 1 1");
  assert.strictEqual(svg.getAttribute("data-v"), "1");
  assert.strictEqual(svg.style.fill, "red");
});

test('SVG: an existing SVGElement child is passed through as-is', () => {
  const svg = document.createElementNS(SVG_NS, "svg");
  const el = Hob.build(["DIV", svg]);
  assert.strictEqual(el.children[0], svg);
  assert.strictEqual(el.children[0].namespaceURI, SVG_NS);
});
