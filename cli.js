const chokidar = require("chokidar");
const { readFile } = require("fs").promises;
const { readFileSync, writeFileSync } = require("fs");
const WebSocketServer = require("websocket").server;
const http = require("http");
const EventEmitter = require("events");
const fetch = require("node-fetch");
const { Compiler } = require("@alex.garcia/unofficial-observablehq-compiler");
const { basename } = require("path");

function run(notebookFile) {
  const sourceEmitter = new EventEmitter();
  let mostRecentSource;

  sourceEmitter.on("update", (e) => (mostRecentSource = e.source));

  chokidar.watch(notebookFile).on("all", (event, path) => {
    console.log(event, path);
    readFile(path, "utf8")
      .then((source) =>
        sourceEmitter.emit("update", {
          event,
          path,
          source,
        })
      )
      .catch((err) => console.error("err reading path", err));

    //console.log(compile.moduleToESModule(readFileSync(path)));
    //console.log(parser.parseModule(readFileSync(path)));
  });

  const server = http.createServer(function (request, response) {
    console.log(`${Date.now()} Received request ${request.url}`);
    if (request.method === "GET" && request.url === "/") {
      response.writeHead(200);
      return response.end(readFileSync("index.html"));
    }
    if (request.method === "GET" && request.url === "/compiler.js") {
      response.writeHead(200, {
        "Content-Type": "text/javascript",
        "Access-Control-Allow-Origin": "*",
      });
      return response.end(
        readFileSync(
          "/Users/alex/projects/unofficial-observablehq-compiler/esbuild-test.js"
        )
      );
    }
    response.writeHead(404);
    response.end();
  });

  const wsServer = new WebSocketServer({
    httpServer: server,
    autoAcceptConnections: false,
  });

  //TODO
  function originIsAllowed(origin) {
    console.log(`origin ${origin}`);
    return true;
  }

  wsServer.on("request", function (request) {
    if (!originIsAllowed(request.origin)) {
      request.reject();
      console.log(
        `${Date.now()} Connection from origin ${request.origin} rejected.`
      );
      return;
    }

    const connection = request.accept("echo-protocol", request.origin);

    console.log(`${Date.now()} Connection accepted.`);

    connection.sendUTF(JSON.stringify({ source: mostRecentSource }));

    function onUpdate(e) {
      console.log(`\t sending update`);
      connection.sendUTF(JSON.stringify(e));
    }
    sourceEmitter.on("update", onUpdate);

    connection.on("message", function (message) {
      if (message.type === "utf8") {
        console.log(`Received Message: ${message.utf8Data}`);
        connection.sendUTF(message.utf8Data);
      } else if (message.type === "binary") {
        console.log(
          `Received Binary Message of ${message.binaryData.length} bytes`
        );
        connection.sendBytes(message.binaryData);
      }
    });
    connection.on("close", function (reasonCode, description) {
      console.log(
        `${Date.now()} Peer ${connection.remoteAddress} disconnected.`
      );
      sourceEmitter.off("update", onUpdate);
    });
  });

  server.listen(8080, function () {
    console.log(`${Date.now()} Server is listening on port 8080`);
  });
}

async function importNotebook(notebook, outPath) {
  const metaLink = `https://api.observablehq.com/document/${notebook}`;
  const nbMeta = await fetch(metaLink).then((r) => r.json());
  const licenseBody =
    nbMeta.license &&
    (await fetch(
      `https://static.observablehq.com/licenses/${nbMeta.license}.txt`
    )
      .then((r) => r.text())
      .catch((e) => null));
  writeFileSync(
    outPath,
    `  
/*
This original source code was imported on ${new Date()} from ${metaLink}. 

${
  licenseBody
    ? `The Observable notebook was marked with a "${nbMeta.license}" License and is accompanied by the following:

${licenseBody}

`
    : `It does not appear that the notebook on Observable has a license, so please consult with the author before further usage. `
}
*/

${nbMeta.nodes.map((d) => d.value).join("\n\n")}
`
  );
}

async function exportNotebook(inPath, outPath) {
  const compile = new Compiler();
  const esmSource = await compile.moduleToESModule(readFileSync(inPath));
  if (outPath.endsWith(".html")) {
    return writeFileSync(
      outPath,
      `<!DOCTYPE html>
    <meta charset="utf-8">
    <link rel="stylesheet" type="text/css" href="https://cdn.jsdelivr.net/npm/@observablehq/inspector@3/dist/inspector.css">
    <body>
    <script>
    ${esmSource.replace(/^export default /, "")}
    </script>
    <script type="module">
    import {Runtime, Inspector} from "https://cdn.jsdelivr.net/npm/@observablehq/runtime@4/dist/runtime.js";
    
    const runtime = new Runtime();
    const main = runtime.module(define, Inspector.into(document.body));
    
    </script>`
    );
  }

  writeFileSync(outPath, esmSource, "utf8");
}

function main() {
  switch (process.argv[2]) {
    case "run":
      run(process.argv[3]);
      break;
    case "import":
      importNotebook(process.argv[3], process.argv[4]);
      break;
    case "export":
      exportNotebook(process.argv[3], process.argv[4]);
      break;
  }
}
main();
