// html-object-builder (HOB)
// A minimal, property-centric DOM builder inspired by Clojure's Hiccup.

/**
 * Recursively sets attributes/properties on an HTMLElement.
 */
export const setAttr = (htmlObj, attrObj) => {
  Object.entries(attrObj).forEach(([k, v]) => {
    if (v?.constructor === Object) {
      setAttr(htmlObj[k], v); // for {style: {...}}
    } else if (k === 'style' && typeof v === 'string') {
        htmlObj.style.cssText = v; // for {style: "..."}
    } else if (k.includes('-')) {
        htmlObj.setAttribute(k, v); // for data- and aria-
    } else {
      if (k === 'class') { k = 'className' }
      htmlObj[k] = v;
    }
  });
};

const isValidTag = (tag) => ((tag?.constructor === String) || (typeof tag === 'function'));

/**
 * Builds an HTMLElement tree from a nested array (Hiccup format).
 * Supports functional components: [Function, ...args] -> Function(...args)
 * 
 * @param {Array} treeArray [tag|Function, ...args]
 * @returns {HTMLElement}
 */
export const build = (treeArray) => {
  if (!Array.isArray(treeArray)) {
    throw new Error('HOB: build(treeArray) requires an array.');
  }

  const [tag, ... queue] = treeArray;

  // Functional Component Support (Lisp-style: [Fn, ...args] -> Fn(...args))
  if (typeof tag === 'function') {
    const res = tag(... queue);
    // If the component returns a DOM element directly, return it.
    // Otherwise, recursively build the returned Hiccup tree.
    return (res instanceof HTMLElement) ? res : build(res);
  }

  const htmlObj = document.createElement(tag);

  while (queue.length) {
    const one = queue.shift();
    if (one == null) {
      continue;
    } else if (one?.constructor === Object) {
      setAttr(htmlObj, one);
    } else if (Array.isArray(one)) {
      if (isValidTag(one[0])) {
        htmlObj.appendChild(build(one));
      } else {
        queue.unshift(... one);
      }
    } else if (one instanceof HTMLElement) {
      htmlObj.appendChild(one);
    } else {
      htmlObj.appendChild(document.createTextNode((one ?? '').toString()));
    }
  }
  return htmlObj;
};
