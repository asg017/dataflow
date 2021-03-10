const chokidar = require("chokidar");
const { readFile } = require("fs").promises;
const { readFileSync, writeFileSync } = require("fs");
const WebSocketServer = require("websocket").server;
const http = require("http");
const EventEmitter = require("events");
const fetch = require("node-fetch");
const { Compiler } = require("@alex.garcia/unofficial-observablehq-compiler");
const { ModuleParser } = require("@observablehq/parser");
const { resolve, dirname, join } = require("path");
const yaml = require("js-yaml");
const crypto = require("crypto");
const open = require("open");

function sha256(s) {
  const shasum = crypto.createHash("sha256");
  shasum.update(s);
  return shasum.digest("hex");
}

async function handleLocalImport(request, response, notebookPath) {
  const compile = new Compiler();
  const importFile = request.url.slice("/api/local-import/".length);
  const importFilePath = resolve(dirname(notebookPath), importFile);
  console.log(importFilePath);
  response.writeHead(200, {
    "Content-Type": "text/javascript",
    "Access-Control-Allow-Origin": "*",
  });
  return response.end(
    await compile.moduleToESModule(readFileSync(importFilePath))
  );
}

async function handleApiFileAttachment(
  request,
  response,
  fileAttachments,
  allowFileAttachments
) {
  if (!allowFileAttachments) {
    response.writeHead(403);
    return response.end(
      "Pass in --allow-file-attachments to enable file system access."
    );
  }
  const requestedFileAttachment = request.url.slice("/api/local-fa/".length);
  if (fileAttachments.has(requestedFileAttachment)) {
    const faContents = await readFile(
      fileAttachments.get(requestedFileAttachment)
    ).catch((e) => null);

    if (!faContents) {
      response.writeHead(404);
      return response.end();
    }
    response.writeHead(200);
    return response.end(faContents);
  }
  response.writeHead(404);
  return response.end(
    `"${requestedFileAttachment}" not a valid file attachment.`
  );
}

async function handleApiSecrets(request, response, secrets, allowSecrets) {
  if (!allowSecrets) {
    response.writeHead(403);
    return response.end("Pass in --allow-secrets to enable secrets access.");
  }
  const requestedSecret = request.url.slice("/api/secrets/".length);
  if (secrets.has(requestedSecret)) {
    response.writeHead(200);
    return response.end(secrets.get(requestedSecret));
  }
  response.writeHead(404);
  return response.end(
    `"${requestedSecret}" not available. Pass in with ---secret "${requestedSecret}:value".`
  );
}

function extractHeader(source) {
  let firstComment;
  const comments = [];
  try {
    ModuleParser.parse(source, { onComment: comments });
  } catch (e) {}
  firstComment = comments[0];

  if (!firstComment || firstComment.start !== 0) return;
  return (header = yaml.load(firstComment.value));
}

function runServer(params = {}) {
  const {
    port = 8080,
    allowFileAttachments = false,
    stdibPath = null,
    notebookPath,
    secrets,
    allowSecrets,
  } = params;
  // if FA is enabled, key=name of FA, value= absolute path to resolved file
  const fileAttachments = new Map();
  const sourceEmitter = new EventEmitter();
  let lastMessage;
  sourceEmitter.on("update", (e) => (lastMessage = e));

  chokidar.watch(notebookPath).on("all", (event, path) => {
    readFile(path, "utf8")
      .then((source) => {
        const header = extractHeader(source);
        if (header && header.FileAttachments) {
          fileAttachments.clear();
          for (const [key, value] of Object.entries(header.FileAttachments)) {
            fileAttachments.set(key, resolve(dirname(notebookPath), value));
          }
        }
        sourceEmitter.emit("update", {
          event,
          path,
          source,
          // send the client the file attachment "name" as the key,
          // and the endpoint + sha of file path. no need to give
          // actual path (tho maybe im over-reacting)
          fileAttachments: Array.from(fileAttachments.entries()).map(
            ([k, v]) => [
              k,
              {
                endpoint: `/api/local-fa/${k}`,
                sha: sha256(v),
              },
            ]
          ),
        });
      })
      .catch((err) => console.error("err reading path", err));
  });
  const server = http.createServer(function (request, response) {
    console.log(`${Date.now()} Received request ${request.url}`);
    if (request.method === "GET" && request.url === "/") {
      response.writeHead(200);
      indexHTML = readFileSync(
        join(__dirname, "content", "index.html"),
        "utf8"
      ).replace(
        "||STDLIB_INJECT||",
        stdibPath ? readFileSync(stdibPath, "utf8") : ""
      );
      return response.end(indexHTML);
    }
    if (request.method === "GET" && request.url === "/compiler.js") {
      response.writeHead(200, {
        "Content-Type": "text/javascript",
        "Access-Control-Allow-Origin": "*",
      });
      return response.end(
        readFileSync(resolve(join(__dirname, "content", "esbuild-test.js")))
      );
    }
    if (request.method === "GET" && request.url.startsWith("/api/local-import"))
      return handleLocalImport(request, response, notebookPath);
    if (request.method === "GET" && request.url.startsWith("/api/local-fa"))
      return handleApiFileAttachment(
        request,
        response,
        fileAttachments,
        allowFileAttachments
      );

    if (request.method === "GET" && request.url.startsWith("/api/secrets/"))
      return handleApiSecrets(request, response, secrets, allowSecrets);

    response.writeHead(404);
    response.end();
  });

  const wsServer = new WebSocketServer({
    httpServer: server,
    autoAcceptConnections: false,
  });

  //TODO
  function originIsAllowed(origin) {
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

    // initial msg to populate
    connection.sendUTF(JSON.stringify(lastMessage));

    function onUpdate(e) {
      connection.sendUTF(JSON.stringify(e));
    }
    sourceEmitter.on("update", onUpdate);

    connection.on("close", function (reasonCode, description) {
      console.log(
        `${Date.now()} Peer ${connection.remoteAddress} disconnected.`
      );
      sourceEmitter.off("update", onUpdate);
    });
  });

  server.listen(port, function () {
    const url = `http://localhost:${port}`;
    console.log(`${Date.now()} Server started at ${url}`);
    open(url);
  });
}

module.exports = {
  runServer,
};
