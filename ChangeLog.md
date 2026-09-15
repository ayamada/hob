# ChangeLog

- **2.3.0:** 20260915
    - feat: build SVG trees (`["svg", ...]` switches to the SVG namespace, `foreignObject` holds XHTML children)
    - feat: `build(treeArray, ns?)` and `SVG_NS`, to build an SVG fragment without an enclosing `svg` tag
    - feat: on SVG elements, keys without a writable DOM property are set via `setAttribute` (`class`, `viewBox`, `d`, ...)
    - docs: add the SVG section to README.md

- **2.2.0:** 20260913
    - fix: many problems
    - feat(package.json): add `types` to `exports`, add `files` and `sideEffects`
    - chore: bump up version of jsdom

- **2.1.0:** 20260409
    - feat: expand children if first element is neither String nor Function

- **2.0.1:** 20260321
    - fix: correct to treat attribute objects

- **2.0.0:** 20260318
    - BREAKING CHANGE: interpretation of fn-component arguments, like LISP

- **1.0.0:** 20260314
    - Migrate from private project

