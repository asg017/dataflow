const crypto = require("crypto");
const { mkdirSync, copyFileSync } = require("fs");
const path = require("path");

const {
  Compiler,
  parser,
  treeShakeModule,
} = require("@alex.garcia/unofficial-observablehq-compiler");
const { readFileSync, writeFileSync } = require("rw").dash;

const { extractHeader } = require("./run");

function sha256(s) {
  const shasum = crypto.createHash("sha256");
  shasum.update(s);
  return shasum.digest("hex");
}

function isObservablehq(name) {
  return name.startsWith("https://observablehq.com");
}

function isObservableImport(path) {
  if (path.startsWith("https")) {
    const url = new URL(path);
    // beta, next, api subdomains
    if (url.hostname.endsWith("observablehq.com")) {
      return `https://api.observablehq.com${url.pathname}.js?v=3`;
    }
  }
  return false;
}

// TODO if multiple notebooks import the same notebook but tree-shake different cells, then that notebook will appear multiple times in the compiled output (1 slightly different compiled output for each unique tree-shaked version). We should instead find all imported .ojs files w/ specified cells, then group by unique .ojs file, then compile the file with treeshaking based on ALL specified cells.

/* when complete, outDir's format:

  files/
    /cae64a86c5e4
    /939eace82398
    /bb8c4ae83948
  index.html
  index.js            -- re-compile whatever is target notebook
  stdlib.js           -- any passed in stdlib file
  core.js             -- client/core, defines runtime, stdlib
  aca987ca987.js      -- imported notebook #1 (as sha, not file name)
  ba7c5a6756d.js      -- imported notebook #2
  ...
  c320e8a7c8e.js      -- imported notebook #n
  */

function ojsSHA(path, treeshake) {
  const src = readFileSync(path);
  const spec = treeshake ? "" : JSON.stringify(treeshake);
  return sha256(src + spec);
}

async function compileBundle(inPath, outDir, options) {
  const {
    stdlibPath,
    target = [],
    treeShake = null,
    includeStyling = false,
  } = options;
  let top;

  mkdirSync(outDir);

  // sha used as filename, "${sha}.js"
  const todo = [
    { path: path.resolve(inPath), treeShake, sha: ojsSHA(inPath, treeShake) },
  ];

  // only create "./files" directory if there are FAs.
  let hasFA = false;

  // TODO detect recursion. probably a done = new Set() that gets checked
  while (todo.length) {
    const current = todo.pop();

    // keep track of what import points to which file (sha) for resolveImportPath
    // the key is awkward, `${name}${JSON.stringify(specifiers)}`
    const currentImports = new Map();

    // keep track of what FAs are written for resolveFileAttachments
    const writtenFAs = new Map();

    const sourceCode = readFileSync(current.path);

    let module = parser.parseModule(sourceCode);
    if (current.treeShake) module = treeShakeModule(module, current.treeShake);

    const header = extractHeader(sourceCode);

    // get all .ojs imports and add to todo
    const importCells = module.cells.filter(
      (cell) => cell.body.type === "ImportDeclaration"
    );
    for (const importCell of importCells) {
      const name = importCell.body.source.value;

      // TODO have options to fetch the .tar.gz compiled observablehq.com notebook
      // and include in bundle to make it work offline.
      if (isObservablehq(name)) continue;

      const ojsPath = path.resolve(path.dirname(current.path), name);

      const specifiers = importCell.body.specifiers.map((d) => {
        const prefix = d.view ? "viewof " : d.mutable ? "mutable " : "";
        return `${prefix}${d.imported.name}`;
      });

      const sha = ojsSHA(ojsPath, specifiers);

      currentImports.set(`${name}${JSON.stringify(specifiers)}`, sha);
      todo.push({
        path: ojsPath,
        treeShake: specifiers,
        sha,
      });
    }

    // go through all cells to find reference file attachments.
    const referencedFileAttachments = new Set(
      module.cells
        .filter((cell) => cell.fileAttachments.size)
        .reduce((a, cell) => {
          return a.concat(Array.from(cell.fileAttachments.keys()));
        }, [])
    );
    const definedFileAttachments = new Map(
      Object.entries(
        (header && header.FileAttachments) || {}
      ).map(([name, relPath]) => [
        name,
        path.resolve(path.dirname(current.path), relPath),
      ])
    );

    // we only will copy over referenced FA's, since others may have been tree shaken out/ never used
    for (const refFA of referencedFileAttachments) {
      if (!definedFileAttachments.has(refFA)) {
        console.warn(
          `WARNING: A FileAttachment "${refFA}" was referenced in ${current.path}, but is not defined in the header of the file.`
        );
        continue;
      }

      if (!hasFA) {
        hasFA = true;
        mkdirSync(path.join(outDir, "files"));
      }

      const pathFA = definedFileAttachments.get(refFA);
      // TODO dont read file in memory
      const sha = sha256(readFileSync(pathFA));

      copyFileSync(pathFA, path.join(outDir, "files", sha));
      writtenFAs.set(refFA, sha);
    }

    function resolveImportPath(name, specifiers) {
      if (isObservablehq(name)) {
        const u = new URL(name);
        return `https://api.observablehq.com${u.pathname}.js?v=3`;
      }
      const ojsSHA = currentImports.get(`${name}${JSON.stringify(specifiers)}`);
      return `./${ojsSHA}.js`;
    }
    function resolveFileAttachments(name) {
      const d = writtenFAs.get(name);
      // ensure FA fetch if no cooresponding FA, NOT `""`
      if (!d) return `null`;
      return `new URL("./files/${d}", import.meta.url)`;
    }

    const compile = new Compiler({
      resolveImportPath,
      resolveFileAttachments,
      defineImportMarkdown: false,
      observeViewofValues: false,
      observeMutableValues: false,
      UNSAFE_allowJavascriptFileAttachments: true,
    });
    const esmSource = compile.module(module);
    const target = path.join(outDir, current.sha + ".js");

    console.log(
      "Writing compiled output for",
      current.path,
      current.treeShake,
      "to",
      target
    );
    if (!top) top = path.basename(target);
    writeFileSync(target, esmSource, "utf8");
  }

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
      ${
        includeStyling
          ? `<link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/github-markdown-css/4.0.0/github-markdown.css"
      />
      <link
        rel="stylesheet"
        href="https://cdn.jsdelivr.net/npm/highlight.js@10.6.0/styles/a11y-light.css"
        integrity="sha256-7Ci437NptsJ20PYDV1yQgfJf5M1mtLRPJe1TPRYj/M4="
        crossorigin="anonymous"
      />`
          : ""
      }
  </head>
  <body${includeStyling ? ` class="markdown-body"` : ""}>
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
/*
TODO
1) allow for single-file compilations, .ojs to js, thats it. If import a local notebook, just warn and move on. 
2) allow for glob/wildcard, ex:
  dataflowc notebooks/* dist/
3) allow to write to tar file (test if stdout works)
*/

function compileSingleNotebook(source, treeShake) {
  const compile = new Compiler({
    resolveImportPath: (path, specifiers) => {
      return isObservableImport(path) || ``;
    },
    resolveFileAttachments: (name) => {
      return ``;
    },
  });
  return compile.module(source, { treeShake });
}

/*
dataflowc top.ojs output/ --bundle --format=dir
dataflowc notebooks/*.ojs dist/
dataflowc notebooks/*.ojs dist/
*/
async function compileNotebook(inPath, output, options) {
  // hard coding bundle=true for now bc compileNotebook isn't that useful yet
  const { treeShake = null, bundle = true } = options;
  if (bundle) return compileBundle(inPath, output, options);
  const source = readFileSync(inPath, "utf8");
  const compiled = compileSingleNotebook(source, treeShake);
  writeFileSync(output, compiled, "utf8");
}
module.exports = {
  compileBundle,
  compileNotebook,
  compileSingleNotebook,
};
