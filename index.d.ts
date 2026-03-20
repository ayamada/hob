// Tag can be a string (HTML tag) or a functional component
export type HiccupTag = string | ((...args: any[]) => (HiccupTree | HTMLElement));

export type HiccupTree = [HiccupTag, ...any[]];

/**
 * Recursively sets attributes/properties on an HTMLElement.
 */
export function setAttr(htmlObj: any, attrObj: Record<string, any>): void;

/**
 * Builds an HTMLElement tree from a nested array (Hiccup format).
 */
export function build(treeArray: HiccupTree): HTMLElement;
