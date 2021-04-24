const crypto = require("crypto");
const { mkdirSync, copyFileSync } = require("fs");
const path = require("path");

const {
  Compiler,
  parser,
} = require("@alex.garcia/unofficial-observablehq-compiler");
const { readFileSync, writeFileSync } = require("rw").dash;

const { extractHeader } = require("./run");

function sha256(s) {
  const shasum = crypto.createHash("sha256");
  shasum.update(s);
  return shasum.digest("hex");
}

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

/*
  files/
    /cae64a86c5e4
    /939eace82398
    /bb8c4ae83948
  index.html
  index.js            -- re-export whatever is target notebook
  stdlib.js           -- any passed in stdlib file
  core.js             -- client/core, defines runtime, stdlib
  aca987ca987.js      -- imported notebook #1 (as sha, not file name)
  ba7c5a6756d.js      -- imported notebook #2
  ...
  c320e8a7c8e.js      -- imported notebook #n
  */
async function exportNotebook(inPath, outDir, options) {
  const { stdlibPath, target = [] } = options;

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

  const ojsFilesResolved = new Map();
  for (const ojsFile of ojsFiles) {
    const sha = sha256(readFileSync(ojsFile, "utf8"));
    ojsFilesResolved.set(ojsFile, `${sha}.js`);
  }

  const fileAttachmentSHAs = new Map();
  for (const fa of fileAttachments) {
    if (
      fileAttachmentSHAs.has(fa.refName) &&
      fileAttachmentSHAs.get(fa.refName).path !== fa.path
    )
      console.warn(
        "Warning: Multiple FileAttachments contain the same name, which might clash with each other. This will be fixed in a future Dataflow release."
      );
    const sha = sha256(readFileSync(fa.path));
    fileAttachmentSHAs.set(fa.refName, { sha, path: fa.path });
  }

  function resolveImportPath(name) {
    if (isObservablehq(name)) {
      const u = new URL(name);
      return `https://api.observablehq.com${u.pathname}.js?v=3`;
    }

    // TODO one problem:
    // here, this is where the notebook imported from a local .ojs file.
    // we want to resolve to the sha name of the file,
    // which ojsFilesResolved has, but ojsFilesResolved has
    // the absolute path of the ojs file, NOT the relative
    // path that we get here in resolveImportPath.
    // as a workaround, we can filter and find the first one
    // in that map that ends in this relative name, but
    // im sure theres a few breaking cases that will need to be fixed.
    const key = Array.from(ojsFilesResolved.keys()).find((absPath) =>
      absPath.endsWith(`/${name.replace(/^\.\//, "")}`)
    );
    return `./${ojsFilesResolved.get(key)}`;
  }

  function resolveFileAttachments(name) {
    const d = fileAttachmentSHAs.get(name);
    if (!d) return `""`;
    return `new URL("./files/${d.sha}", import.meta.url)`;
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

    // TODO to truly avoid conflicts, i think we'll need a new compiler
    // for every individual .ojs file thats spefic to that ojs file.
    // to ensure file attachments an importe js files with the same
    // name don't clash.
    const esmSource = await compile.module(sourceCode);

    const target = path.join(outDir, ojsFilesResolved.get(ojsFile));
    writeFileSync(target, esmSource, "utf8");
  }
  // for any file attachments, write them to files subdirectory
  if (fileAttachments.length) {
    mkdirSync(path.join(outDir, "files"));
    for (const fa of fileAttachments) {
      copyFileSync(
        fa.path,
        path.join(outDir, "files", fileAttachmentSHAs.get(fa.refName).sha)
      );
    }
  }
  const top = ojsFilesResolved.get(ojsFiles[0]);

  copyFileSync(
    path.join(__dirname, "content", "core.js"),
    path.join(outDir, "core.js")
  );

  writeFileSync(
    path.join(outDir, "index.js"),
    `export {default} from "./${top}";`
  );

  if (stdlibPath) copyFileSync(stdlibPath, path.join(outDir, "stdlib.js"));
  else writeFileSync(path.join(outDir, "stdlib.js"), "", "utf8");

  writeFileSync(
    path.join(outDir, "index.html"),
    `<!DOCTYPE html>
  <head>
      <meta charset="utf-8">
      <link rel="stylesheet" type="text/css" href="https://cdn.jsdelivr.net/npm/@observablehq/inspector@3/dist/inspector.css">
  </head>
  <body>
  <script type="module">
  import {Runtime, Library, Inspector} from "./core.js";
  import define from "./index.js";
  const runtime = new Runtime(new Library());
  const target = new Set(${JSON.stringify(target)});
  const observer = target.size > 0 
  ? name => {
    if(target.has(name)) return new Inspector(document.body.appendChild(document.createElement("div")));
  }
  : Inspector.into(document.body);
  const main = runtime.module(define, observer);
  
  </script>`,
    "utf8"
  );
}
module.exports = {
  exportNotebook,
};
