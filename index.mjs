// html-object-builder (HOB)
// A minimal, property-centric DOM builder inspired by Clojure's Hiccup.

/**
 * Recursively sets attributes/properties on an HTMLElement.
 * Unlike standard setAttribute, this assigns directly to the object properties,
 * with some quality-of-life mappings for common DOM quirks.
 * 
 * @param {HTMLElement} htmlObj The target DOM element.
 * @param {Object} attrObj The object containing attributes/properties to set.
 */
export const setAttr = (htmlObj, attrObj) => {
  Object.entries(attrObj).forEach(([k, v]) => {
    // QoL: Map 'class' to 'className' for direct property access
    if (k === 'class') k = 'className';

    if (k === 'style' && typeof v === 'string') {
      // QoL: Support string assignment to style (e.g., style: "color: red;")
      htmlObj.style.cssText = v;
    } else if (k.includes('-')) {
      // QoL: Support data-* and aria-* attributes which must use setAttribute
      htmlObj.setAttribute(k, v);
    } else if (v?.constructor === Object) {
      setAttr(htmlObj[k], v);
    } else {
      htmlObj[k] = v;
    }
  });
};

/**
 * Builds an HTMLElement tree from a nested array (Hiccup format).
 * Supports functional components for UI composition.
 * 
 * @param {Array} treeArray [tag|Function, attrs?, ...children]
 * @returns {HTMLElement}
 */
export const build = (treeArray) => {
  if (!Array.isArray(treeArray)) {
    throw new Error('HOB: build(treeArray) requires an array.');
  }

  const tag = treeArray[0];

  // Functional Component Support
  if (typeof tag === 'function') {
    const hasAttrs = treeArray[1]?.constructor === Object;
    const attrs = hasAttrs ? treeArray[1] : {};
    const children = treeArray.slice(hasAttrs ? 2 : 1);
    // Recursively build the result of the functional component
    return build(tag(attrs, ...children));
  }

  const htmlObj = document.createElement(tag);

  for (let i = 1; i < treeArray.length; i++) {
    const one = treeArray[i];
    if (one == null) {
      continue; // Skip null/undefined
    } else if (one?.constructor === Object) {
      setAttr(htmlObj, one);
    } else if (Array.isArray(one)) {
      htmlObj.appendChild(build(one));
    } else if (one instanceof HTMLElement) {
      htmlObj.appendChild(one);
    } else {
      htmlObj.appendChild(document.createTextNode((one ?? '').toString()));
    }
  }
  return htmlObj;
};
