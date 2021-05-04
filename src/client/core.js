import { html, svg } from "htl";
import { Library as BaseLibrary } from "@observablehq/runtime";

export { Runtime, Inspector } from "@observablehq/runtime";

export function Library() {
  if (!window.DATAFLOW_STDLIB)
    window.DATAFLOW_STDLIB = { constants: {}, dependency: {} };
  if (!window.DATAFLOW_STDLIB.constants) window.DATAFLOW_STDLIB.constants = {};
  if (!window.DATAFLOW_STDLIB.dependency)
    window.DATAFLOW_STDLIB.dependency = {};
  const base = new BaseLibrary();
  const library = Object.assign(
    base,
    {
      html: () => html,
      svg: () => svg,
    },
    window.DATAFLOW_STDLIB.constants
  );

  // key = already added library builtin, e.g. "require", "width"
  // value = { newBuiltin1: def, newBuiltin2: def }
  for (const [depBuiltin, newBuiltins] of Object.entries(
    window.DATAFLOW_STDLIB.dependency
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
