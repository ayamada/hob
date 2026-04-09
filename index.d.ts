// Tag can be a string (HTML tag) or a functional component
export type HiccupTag = string | ((...args: any[]) => (HiccupTree | HTMLElement));

export type HiccupChild =
  | Record<string, any>
  | string
  | number
  | boolean
  | null
  | undefined
  | HTMLElement
  | HiccupTree
  | HiccupChild[];

export type HiccupTree = [HiccupTag, ...HiccupChild[]];

/**
 * Recursively sets attributes/properties on an HTMLElement.
 */
export declare function setAttr(htmlObj: any, attrObj: Record<string, any>): void;

/**
 * Builds an HTMLElement tree from a nested array (Hiccup format).
 */
export declare function build(treeArray: HiccupTree): HTMLElement;
