import { html, svg } from "htl";
import {
  Runtime,
  RuntimeError,
  Inspector,
  Library,
} from "@observablehq/runtime";
import {
  Interpreter,
  parser,
} from "@alex.garcia/unofficial-observablehq-compiler";

// run
async function resolveImportPath(name) {
  return import(`/api/import?name=${encodeURIComponent(name)}`).then(
    (m) => m.default
  );
}

// both
function computeLibrary() {
  if (!window.DATAFLOW_STDLIB)
    window.DATAFLOW_STDLIB = { constants: {}, dependency: {} };
  if (!window.DATAFLOW_STDLIB.constants) window.DATAFLOW_STDLIB.constants = {};
  if (!window.DATAFLOW_STDLIB.dependency)
    window.DATAFLOW_STDLIB.dependency = {};
  const baseLibrary = new Library();
  const library = Object.assign(
    baseLibrary,
    {
      html: () => htl.html,
      svg: () => htl.svg,
      width: () => {
        return baseLibrary.Generators.observe((change) => {
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
    window.DATAFLOW_STDLIB.constants
  );

  const customLibraryResolved = {};
  // key = already added library builtin, e.g. "require", "width"
  // value = { newBuiltin1: def, newBuiltin2: def }
  for (const [depBuiltin, newBuiltins] of Object.entries(
    window.DATAFLOW_STDLIB.dependency
  )) {
    for (const [newBuiltinName, newBuiltinDefinition] of Object.entries(
      newBuiltins
    )) {
      const depDef = library[depBuiltin];
      console.log(depBuiltin, depDef, library);
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

// run
function defineSecret(name) {
  return fetch(`/api/secrets/${name}`).then((r) => {
    if (!r.ok) {
      if (r.status === 403) {
        throw Error("Secret access not allow. Enable with --allow-secrets.");
      }
      if (r.status === 404) {
        throw Error(
          `Secret name "${name}" not found. Pass in with ---secret ${name}:value.`
        );
      }
      throw Error(
        `An unknown error occurred when fetching Secret "${name}": status code ${r.status}`
      );
    }
    return r.text();
  });
}

// run
function defineFileAttachment(runtime, fileAttachments) {
  return () =>
    runtime.fileAttachments((name) => fileAttachments.get(name)?.endpoint);
}

const cellMap = new Map();

const container = document.querySelector("#dataflow-container");
const errContainer = document.querySelector(".dataflow-error-syntax");
const observer = Inspector.into(container);

const library = computeLibrary();
const runtime = new Runtime(library);

const main = runtime.module();
const interpret = new Interpreter({
  resolveImportPath,
  observeViewofValues: false,
  observeMutableValues: false,
});
const fileAttachments = new Map();

main.define("FileAttachment", defineFileAttachment(runtime, fileAttachments));
main.define("Secret", () => defineSecret);

async function onMessage(event) {
  console.log("received msg", event);
  const m = JSON.parse(event.data);
  const source = m.source;
  let parsedModule;

  while (errContainer.firstChild)
    errContainer.removeChild(errContainer.firstChild);

  try {
    parsedModule = parser.parseModule(source);
    errContainer.classList.add("hidden");
  } catch (error) {
    console.error(error);
    errContainer.classList.remove("hidden");

    const sourceLines = source.split("\n");
    errContainer.appendChild(htl.html`<div style="padding: .5rem;">
        <div style="font-weight: 700; font-size: 1.2rem;">${error.name}</div>
        <div style="margin: 1rem 0;">${error.message}</div>
        <div style="background-color: rgba(220, 38, 38, .5);">
          <span style="margin-right: .5rem; background-color: rgba(220, 38, 38, .6);">
            ${error.loc.line}
          </span>
        <code>${sourceLines[error.loc.line - 1]}</code>
        </div>`);
    return;
  }
  // tmp map to add the "index" suffix to cellMap key
  const idMap = new Map();
  const newSourceCellMap = new Set();

  if (m.fileAttachments) {
    // if the new FAs have new keys, or updated values, update FA
    let newFA = false;
    // key=FA name, value=endpoint to get data
    ///debugger;
    for (const [key, value] of m.fileAttachments) {
      if (
        !fileAttachments.has(key) ||
        fileAttachments.get(key).sha !== value.sha ||
        fileAttachments.get(key).endpoint !== value.endpoint
      ) {
        fileAttachments.set(key, value);
        newFA = true;
      }
    }

    // if the old FA has any keys that have been delete, delete them
    const tmpMFAmap = new Map(m.fileAttachments);
    for (const [key, value] of fileAttachments) {
      if (!tmpMFAmap.has(key)) {
        fileAttachments.delete(key);
        newFA = true;
      }
    }

    if (newFA) {
      main.redefine(
        "FileAttachment",
        defineFileAttachment(runtime, fileAttachments)
      );
    }
  }

  for (const cell of parsedModule.cells) {
    const src = cell.input.substring(cell.start, cell.end);
    idMap.set(src, idMap.has(src) ? idMap.get(src) + 1 : 0);

    const id = `${src}${idMap.get(src)}`;
    newSourceCellMap.add(id);
    if (cellMap.has(id)) continue;
    const variables = await interpret
      .cell(cell, main, observer)
      .catch((error) => {
        console.error("Error loading notebook ", error, cell);
        return [
          main.variable(observer()).define(
            null,
            ["html"],
            (html) =>
              html`<div style="border: 1px solid maroon;">
                <b>big oof import didn't work buddy</b>
                <pre>${cell.input.substring(cell.start, cell.end)}</pre>
                <details style="display: inline-block;">
                  <summary style="display: inline-block;">show error</summary>
                  <div>
                    ${error.message}
                    <pre>${error.stack}</pre>
                  </div>
                </details>
              </div>`
          ),
        ];
      });
    cellMap.set(id, variables);
  }

  // delete previous cells that aren't in the new def
  for (const [id, variables] of cellMap.entries()) {
    if (!newSourceCellMap.has(id)) {
      cellMap.delete(id);
      variables.map((v) => {
        if (v._observer._node) v._observer._node.remove();
        v.delete();
      });
    }
  }

  let ptr = container.firstChild;
  for (const id of newSourceCellMap) {
    const variables = cellMap.get(id);
    // failed imports
    if (!variables) continue;

    for (const v of variables) {
      if (!v._observer._node) continue;
      if (ptr !== v._observer._node) {
        v._observer._node.parentElement.insertBefore(v._observer._node, ptr);
      }

      ptr = v._observer._node.nextSibling;
    }
  }
}

const statusFooter = document.querySelector(".dataflow-footer-status");

function connect() {
  const socket = new WebSocket("ws://localhost:8080", "echo-protocol");
  socket.addEventListener("open", function (event) {
    console.log("Socket opened");
    statusFooter.textContent = "✅ Socket connected!";
  });

  socket.addEventListener("close", function (err) {
    console.log("Socket is closed. Reconnecting....");
    statusFooter.textContent =
      "⌛ Connection closed, attempting to reconnect...";
    setTimeout(connect, 250);
  });

  socket.addEventListener("message", onMessage);
}

connect();
