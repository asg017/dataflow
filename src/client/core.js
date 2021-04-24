import { html, svg } from "htl";
import { Library as BaseLibrary } from "@observablehq/runtime";

export { Runtime, Inspector } from "@observablehq/runtime";

export function Library() {
  if (!window.OJS_STDLIB) window.OJS_STDLIB = { constants: {}, dependency: {} };
  if (!window.OJS_STDLIB.constants) window.OJS_STDLIB.constants = {};
  if (!window.OJS_STDLIB.dependency) window.OJS_STDLIB.dependency = {};
  const base = new BaseLibrary();
  const library = Object.assign(
    base,
    {
      html: () => html,
      svg: () => svg,
      width: () => {
        return base.Generators.observe((change) => {
          change(null);
          const ro = new ResizeObserver((entries) => {
            for (let entry of entries) {
              change(entry.contentRect.width);
            }
          });
          ro.observe(container);
          return () => ro.disconnect();
        });
      },
    },
    window.OJS_STDLIB.constants
  );

  const customLibraryResolved = {};
  // key = already added library builtin, e.g. "require", "width"
  // value = { newBuiltin1: def, newBuiltin2: def }
  for (const [depBuiltin, newBuiltins] of Object.entries(
    window.OJS_STDLIB.dependency
  )) {
    for (const [newBuiltinName, newBuiltinDefinition] of Object.entries(
      newBuiltins
    )) {
      const depDef = library[depBuiltin];
      Object.defineProperty(library, newBuiltinName, {
        writable: true,
        enumerable: true,
        value:
          typeof depDef === "function"
            ? newBuiltinDefinition(depDef())
            : depDef.then((r) => newBuiltinDefinition(r)),
      });
    }
  }
  return library;
}
