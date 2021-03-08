const { Compiler } = require("@alex.garcia/unofficial-observablehq-compiler");
const { readFileSync, writeFileSync } = require("rw").dash;

async function exportNotebook(inPath, outPath, options) {
  const { format = "js" } = options;
  const compile = new Compiler();
  const esmSource = await compile.moduleToESModule(readFileSync(inPath));
  if (format.toLowerCase() === "html" || outPath.endsWith(".html")) {
    return writeFileSync(
      outPath,
      `<!DOCTYPE html>
    <head>
        <meta charset="utf-8">
        <link rel="stylesheet" type="text/css" href="https://cdn.jsdelivr.net/npm/@observablehq/inspector@3/dist/inspector.css">
        <script src="https://cdn.jsdelivr.net/npm/htl"></script>
    </head>
    <body>
    <script type=module>
    ${esmSource.replace(/export default /, "window.define = ")}
    </script>
    <script type="module">
    import {Runtime, Library, Inspector} from "https://cdn.jsdelivr.net/npm/@observablehq/runtime@4/dist/runtime.js";

    const library = Object.assign(
        new Library(),
        {
          html: () => htl.html,
          svg: () => htl.svg,
        }
    );
    
    const runtime = new Runtime(library);
    const main = runtime.module(window.define, Inspector.into(document.body));
    
    </script>`
    );
  }

  writeFileSync(outPath, esmSource, "utf8");
}
module.exports = {
  exportNotebook,
};
