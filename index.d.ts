// The SVG namespace URI, for build(treeArray, SVG_NS).
export declare const SVG_NS: string;

// What a tag or a functional component may return.
export type HiccupResult = HiccupTree | Node | boolean | null | undefined;

// Tag can be a string (HTML tag) or a functional component
export type HiccupTag = string | ((...args: any[]) => HiccupResult);

export type HiccupChild =
  | Record<string, any>
  | string
  | number
  | boolean
  | null
  | undefined
  | Node
  | HiccupTree
  | HiccupChild[];

export type HiccupTree = [HiccupTag, ...HiccupChild[]];

/**
 * Recursively sets attributes/properties on an HTML or SVG element.
 */
export declare function setAttr(htmlObj: any, attrObj: Record<string, any>): void;

/**
 * Builds an HTML/SVG element tree from a nested array (Hiccup format).
 * Returns null when the tree renders nothing (e.g. a component returning null).
 *
 * Children inherit the namespace of their parent: the `svg` tag switches to SVG,
 * and `foreignObject` (itself an SVG tag) switches its children back to XHTML.
 */
export declare function build(treeArray: HiccupTree, ns?: string): HTMLElement | SVGElement | null;
