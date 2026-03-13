// Tag can be a string (HTML tag) or a functional component
export type HiccupTag = string | ((attrs: Record<string, any>, ...children: any[]) => HiccupTree);

export type HiccupTree = 
  | [HiccupTag, Record<string, any>?, ...(HiccupTree | HTMLElement | string | number | null | undefined)[]]
  | string | number | HTMLElement | null | undefined;

/**
 * Recursively sets attributes/properties on an HTMLElement.
 */
export function setAttr(htmlObj: any, attrObj: Record<string, any>): void;

/**
 * Builds an HTMLElement tree from a nested array (Hiccup format).
 */
export function build(treeArray: HiccupTree): HTMLElement;
