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
 * Recursively sets attributes/properties on an HTMLElement.
 */
export declare function setAttr(htmlObj: any, attrObj: Record<string, any>): void;

/**
 * Builds an HTMLElement tree from a nested array (Hiccup format).
 * Returns null when the tree renders nothing (e.g. a component returning null).
 */
export declare function build(treeArray: HiccupTree): HTMLElement | null;
