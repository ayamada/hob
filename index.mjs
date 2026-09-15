// html-object-builder (HOB)
// A minimal, property-centric DOM builder inspired by Clojure's Hiccup.

// XML namespaces. `build()` defaults to XHTML, SVG is entered via the `svg` tag
// or by passing SVG_NS as the second argument.
export const SVG_NS = 'http://www.w3.org/2000/svg';
const XHTML_NS = 'http://www.w3.org/1999/xhtml';

// Special tags, matched case-insensitively:
// [own namespace (null = inherit from the parent), canonical tag, namespace of the children].
// SVG tags are case-sensitive, hence the canonical spelling.
const NS_TAGS = {
  svg: [SVG_NS, 'svg', SVG_NS],
  foreignobject: [null, 'foreignObject', XHTML_NS], // an SVG tag holding XHTML children
};

// Any non-null object except Array: a writable target like `el.style` or `el.dataset`.
const isObjectLike = (v) => ((typeof v === 'object') && (v !== null) && !Array.isArray(v));

// `{ key: value }`-like object. Excludes Array, Date, Node and class instances.
const isPlainObject = (v) => {
  if (!isObjectLike(v)) { return false }
  const proto = Object.getPrototypeOf(v);
  return (proto === Object.prototype) || (proto === null);
};

const isValidTag = (tag) => ((typeof tag === 'function') || ((typeof tag === 'string') && (tag !== '')));

// Attributes whose DOM property name differs from the attribute name.
const ATTR_ALIASES = { class: 'className', for: 'htmlFor' };

const isSvgElement = (v) => (v?.namespaceURI === SVG_NS);

// True when `key` can be assigned as a property of `obj`.
// False for read-only SVG IDL attributes (viewBox, className, cx, ...) and for unknown keys,
// which must be set via setAttribute() instead.
const isWritableProp = (obj, key) => {
  for (let o = obj; o; o = Object.getPrototypeOf(o)) {
    const d = Object.getOwnPropertyDescriptor(o, key);
    if (d) { return !!(d.set || d.writable) }
  }
  return false;
};

// True when the value has to go through setAttribute():
// HTML data-*/aria-* (keys with '-'), or any SVG attribute without a writable property.
// Object values are left as properties, so that `{foo: {...}}` stays an expando.
const mustSetAttribute = (target, key, value, svg) => {
  if (typeof target.setAttribute !== 'function') { return false }
  return svg ? (!isObjectLike(value) && !isWritableProp(target, key)) : key.includes('-');
};

/**
 * Recursively sets attributes/properties on an HTML or SVG element.
 */
export const setAttr = (htmlObj, attrObj) => {
  const svg = isSvgElement(htmlObj);
  Object.entries(attrObj).forEach(([k, v]) => {
    const key = svg ? k : (ATTR_ALIASES[k] ?? k); // SVG has no className/htmlFor
    if (k === 'style' && typeof v === 'string') {
      htmlObj.style.cssText = v; // for {style: "..."}
    } else if (isPlainObject(v) && isObjectLike(htmlObj[key])) {
      setAttr(htmlObj[key], v); // for {style: {...}}
    } else if (mustSetAttribute(htmlObj, k, v, svg)) {
      htmlObj.setAttribute(key, v); // for data-/aria-, and for SVG attrs like viewBox
    } else {
      htmlObj[key] = v; // for properties like {onclick: fn}
    }
  });
};

/**
 * Appends each child of `children` to `htmlObj`.
 * A nested array that is not [tag|Function, ...args] is expanded in place.
 */
const appendChildren = (htmlObj, children, ns) => {
  children.forEach((one) => {
    if (one == null || typeof one === 'boolean') {
      return; // renders nothing, for {cond && [...]}
    } else if (Array.isArray(one)) {
      if (isValidTag(one[0])) {
        const child = build(one, ns);
        if (child) { htmlObj.appendChild(child) }
      } else {
        appendChildren(htmlObj, one, ns); // expand children if one is not [tag, ...]
      }
    } else if (one instanceof Node) {
      htmlObj.appendChild(one); // pass through an existing node
    } else if (isPlainObject(one)) {
      setAttr(htmlObj, one);
    } else {
      htmlObj.appendChild(document.createTextNode(one.toString()));
    }
  });
};

/**
 * Builds an HTML/SVG element tree from a nested array (Hiccup format).
 * Supports functional components: [Function, ...args] -> Function(...args)
 * Returns null when the tree renders nothing.
 *
 * Children inherit the namespace of their parent. The `svg` tag switches to SVG,
 * and `foreignObject` (itself an SVG tag) switches its children back to XHTML.
 *
 * @param {Array} treeArray [tag|Function, ...args]
 * @param {string} [ns] namespace URI of `treeArray` itself (defaults to XHTML, `SVG_NS` for SVG)
 * @returns {HTMLElement|SVGElement|null}
 */
export const build = (treeArray, ns = XHTML_NS) => {
  if (!Array.isArray(treeArray)) {
    throw new Error('HOB: build(treeArray) requires an array.');
  }

  const [tag, ... queue] = treeArray;

  if (!isValidTag(tag)) {
    throw new Error('HOB: build(treeArray) requires a non-empty tag name or a component function.');
  }

  // Functional Component Support (Lisp-style: [Fn, ...args] -> Fn(...args))
  if (typeof tag === 'function') {
    const res = tag(... queue);
    if (res instanceof Node) {
      return res; // the component returned a DOM node directly
    }
    // Nothing to render, or the returned Hiccup tree.
    return ((res == null) || (typeof res === 'boolean')) ? null : build(res, ns);
  }

  const lower = tag.toLowerCase();
  const [tagNs, name, childNs] = Object.hasOwn(NS_TAGS, lower) ? NS_TAGS[lower] : [ns, tag, ns];
  const elemNs = tagNs ?? ns; // null = inherit the namespace of the parent
  const htmlObj = (elemNs === XHTML_NS)
    ? document.createElement(name)
    : document.createElementNS(elemNs, name);
  appendChildren(htmlObj, queue, childNs);
  return htmlObj;
};
