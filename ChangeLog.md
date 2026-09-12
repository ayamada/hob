# ChangeLog

- **2.2.0-SNAPSHOT:** 20260913
    - feat: bump up version of jsdom
    - fix: `{style: {"background-color": ...}}` (kebab-case key) no longer throws
    - fix: a nested attribute object for a non-existent property (e.g. `{foo: {bar: 1}}`) no longer throws
    - fix: booleans no longer render as "true"/"false" text; null/undefined/booleans render nothing
    - fix: a functional component returning null/undefined/boolean renders nothing instead of throwing
    - fix: SVGElement, Text and DocumentFragment children are appended instead of being stringified
    - fix: an empty or invalid root tag now throws a clear error instead of creating a bogus element
    - feat: `{for: ...}` is mapped to htmlFor, like `{class: ...}` to className
    - refactor: introduce isObjectLike/isPlainObject, drop dead code, fix indentation
    - build: add `types` to `exports`, add `files` and `sideEffects`

- **2.1.0:** 20260409
    - feat: expand children if first element is neither String nor Function

- **2.0.1:** 20260321
    - fix: correct to treat attribute objects

- **2.0.0:** 20260318
    - BREAKING CHANGE: interpretation of fn-component arguments, like LISP

- **1.0.0:** 20260314
    - Migrate from private project

