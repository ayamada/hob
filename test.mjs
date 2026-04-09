import test from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import * as Hob from './index.mjs';

// Setup global browser environment for Node.js
const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
global.window = dom.window;
global.document = dom.window.document;
global.HTMLElement = dom.window.HTMLElement;
global.Node = dom.window.Node;

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
