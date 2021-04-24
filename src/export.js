const {
  Compiler,
  parser,
} = require("@alex.garcia/unofficial-observablehq-compiler");
const { readFileSync, writeFileSync } = require("rw").dash;
const { mkdirSync, copyFileSync } = require("fs");
const { extractHeader } = require("./run");

const path = require("path");

/*
1. export to a directory
2. for local imports, also compile those and include
3. For observablehq.com imports, leave as is?
4. Fileattachments, bundle in 
5. Secrets, throw error
*/
async function exportNotebookOld(inPath, outPath, options) {
  const { format = "js" } = options;
  const compile = new Compiler();
  const esmSource = await compile.module(readFileSync(inPath));
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

function isObservablehq(name) {
  return name.startsWith("https://observablehq.com");
}

function resolveImportPath(name) {
  if (isObservablehq(name)) {
    const u = new URL(name);
    return `https://api.observablehq.com${u.pathname}.js?v=3`;
  }
  return name.replace(".ojs", ".js");
}

async function exportNotebook(inPath, outDir, options) {
  mkdirSync(outDir);

  // will add on any absolute .ojs files to this array
  const todo = [path.resolve(inPath)];

  // all of the local .ojs files that are imported from the inPath notebook
  // (or its dependencies) that need to be bundled in.
  // value: string, absolute path to ojs file.
  const ojsFiles = [];

  // all of the fileAttachments that are references in the inPath notebook
  // (or in any dependency .ojs notebooks) that need to be bundled in.
  // value: object, {refName: string FA name, path: string absolute path  }
  const fileAttachments = [];

  // TODO detect recursion. probably a done = new Set() that gets checked
  while (todo.length) {
    const current = todo.pop();
    // .ojs contents
    const sourceCode = readFileSync(current);
    const module = parser.parseModule(sourceCode);

    const header = extractHeader(sourceCode);

    // go through all cells to find reference file attachments.
    for (const cell of module.cells) {
      if (!cell.fileAttachments.size) continue;

      if (!header)
        throw Error(
          "Cells reference FileAttachments, but a header that defines FileAttachment locations could not be found."
        );

      for (const [ref, relPath] of Object.entries(header.FileAttachments)) {
        fileAttachments.push({
          refName: ref,
          path: path.resolve(path.dirname(current), relPath),
        });
      }
    }

    const importCells = module.cells.filter(
      (cell) => cell.body.type === "ImportDeclaration"
    );
    for (const importCell of importCells) {
      const name = importCell.body.source.value;

      // TODO have options to fetch the .tar.gz compiled observablehq.com notebook
      // and include in bundle to make it work offline.
      if (isObservablehq(name)) continue;

      // TODO for tree shaking, push the specified imported cells as well.
      todo.push(path.resolve(path.dirname(current), name));
    }
    // TODO push on import specifiers here for tree shaking.
    // for the first one, use CLI params
    ojsFiles.push(current);
  }

  function resolveFileAttachments(name) {
    const d = fileAttachments.find((d) => d.refName === name);
    if (!d) return `""`;
    // TODO use SHA hash here instead of fa file name
    return `new URL("./files/${path.basename(d.path)}", import.meta.url)`;
  }

  const compile = new Compiler({
    resolveImportPath,
    resolveFileAttachments,
    defineImportMarkdown: false,
    observeViewofValues: false,
    observeMutableValues: false,
    UNSAFE_allowJavascriptFileAttachments: true,
  });

  // for any local .ojs file, write them to directory
  for (const ojsFile of ojsFiles) {
    const sourceCode = readFileSync(ojsFile);
    const esmSource = await compile.module(sourceCode);

    // TODO use SHA hash instead of ojs file name
    const target = path
      .join(outDir, path.basename(ojsFile))
      .replace(".ojs", ".js");
    writeFileSync(target, esmSource, "utf8");
  }
  // for any file attachments, write them to files subdirectory
  if (fileAttachments.length) {
    mkdirSync(path.join(outDir, "files"));
    for (const fa of fileAttachments) {
      // TODO use SHA for filename instead of fa file name
      copyFileSync(fa.path, path.join(outDir, "files", path.basename(fa.path)));
    }
  }
  const top = path.basename(ojsFiles[0]).replace(".ojs", ".js");
  writeFileSync(
    path.join(outDir, "index.html"),
    `<!DOCTYPE html>
  <head>
      <meta charset="utf-8">
      <link rel="stylesheet" type="text/css" href="https://cdn.jsdelivr.net/npm/@observablehq/inspector@3/dist/inspector.css">
  </head>
  <body>
  <script type="module">
  import {Runtime, Library, Inspector} from "https://cdn.jsdelivr.net/npm/@observablehq/runtime@4/dist/runtime.js";
  import {html, svg} from "https://cdn.skypack.dev/htl";
  import define from "./${top}";

  const library = Object.assign(
      new Library(),
      {
        html: () => html,
        svg: () => svg,
      }
  );
  
  const runtime = new Runtime(library);
  const main = runtime.module(define, Inspector.into(document.body));
  
  </script>`,
    "utf8"
  );
}
module.exports = {
  exportNotebook,
};
