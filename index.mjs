// html-object-builder (HOB)
// A minimal, property-centric DOM builder inspired by Clojure's Hiccup.

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

/**
 * Recursively sets attributes/properties on an HTMLElement.
 */
export const setAttr = (htmlObj, attrObj) => {
  Object.entries(attrObj).forEach(([k, v]) => {
    if (k === 'style' && typeof v === 'string') {
      htmlObj.style.cssText = v; // for {style: "..."}
    } else if (isPlainObject(v) && isObjectLike(htmlObj[k])) {
      setAttr(htmlObj[k], v); // for {style: {...}}
    } else if (k.includes('-') && typeof htmlObj.setAttribute === 'function') {
      htmlObj.setAttribute(k, v); // for data- and aria-
    } else {
      htmlObj[ATTR_ALIASES[k] ?? k] = v; // for properties like {onclick: fn}
    }
  });
};

/**
 * Appends each child of `children` to `htmlObj`.
 * A nested array that is not [tag|Function, ...args] is expanded in place.
 */
const appendChildren = (htmlObj, children) => {
  children.forEach((one) => {
    if (one == null || typeof one === 'boolean') {
      return; // renders nothing, for {cond && [...]}
    } else if (Array.isArray(one)) {
      if (isValidTag(one[0])) {
        const child = build(one);
        if (child) { htmlObj.appendChild(child) }
      } else {
        appendChildren(htmlObj, one); // expand children if one is not [tag, ...]
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
 * Builds an HTMLElement tree from a nested array (Hiccup format).
 * Supports functional components: [Function, ...args] -> Function(...args)
 * Returns null when the tree renders nothing.
 *
 * @param {Array} treeArray [tag|Function, ...args]
 * @returns {HTMLElement|null}
 */
export const build = (treeArray) => {
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
    return ((res == null) || (typeof res === 'boolean')) ? null : build(res);
  }

  const htmlObj = document.createElement(tag);
  appendChildren(htmlObj, queue);
  return htmlObj;
};
