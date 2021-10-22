const chokidar = require("chokidar");
const { readFileSync, writeFileSync } = require("fs");
const WebSocketServer = require("websocket").server;
const http = require("http");
const EventEmitter = require("events");
const { Compiler } = require("@alex.garcia/unofficial-observablehq-compiler");
const { ModuleParser } = require("@observablehq/parser");
const path = require("path");
const yaml = require("js-yaml");
const open = require("open");
const url = require("url");
const chalk = require('chalk');

const {readSourceCodeSync, readSourceCode, readBinary} = require("./utils");

function log(...messages) {
  console.log(chalk.blue(`[${new Date().toISOString()}]`), ...messages);
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

async function handleLocalImport(request, response, notebookPath, port) {
  const q = url.parse(request.url, true).query;
  const importPath = q.name;
  let treeShake;

  if (Array.isArray(q.cell)) treeShake = q.cell;
  else if (q.cell) treeShake = [q.cell];

  if (isObservableImport(importPath)) {
    const destination = isObservableImport(importPath);
    response.writeHead(302, {
      Location: destination,
    });
    return response.end();
  }

  // compiler only for local .ojs compiling
  const compile = new Compiler({
    resolveImportPath: (path, specifiers) => {
      if (isObservableImport(path)) return isObservableImport(path);
      return `http://localhost:${port}/api/import?name=${path}&${specifiers
        .map((s) => `cell=${encodeURIComponent(s)}`)
        .join("&")}`;
    },
    resolveFileAttachments: (name) => {
      return `http://localhost:${port}/api/file-attachments?source=${encodeURIComponent(
        path.resolve(path.dirname(notebookPath), importPath)
      )}&name=${encodeURIComponent(name)}`;
    },
  });

  const importFilePath = path.resolve(path.dirname(notebookPath), importPath);
  const source = readSourceCodeSync(importFilePath, "utf8");
  const compiled = compile.module(source, { treeShake });

  response.writeHead(200, {
    "Content-Type": "text/javascript",
    "Access-Control-Allow-Origin": "*",
  });
  return response.end(compiled);
}

async function handleApiFileAttachment(
  request,
  response,
  notebookPath,
  allowFileAttachments
) {
  if (!allowFileAttachments) {
    response.writeHead(403);
    return response.end(
      "Pass in --allow-file-attachments to enable file system access."
    );
  }
  const q = url.parse(request.url, true).query;
  const name = q.name;
  const source = q.source || notebookPath;

  const sourceCode = readSourceCodeSync(source);
  const header = extractHeader(sourceCode);
  const faPath =
    header && header.FileAttachments && header.FileAttachments[name];
  if (!faPath) {
    response.writeHead(404);
    return response.end();
  }
  const faContents = await readBinary(
    path.resolve(path.dirname(source), faPath)
  ).catch((e) => null);

  if (!faContents) {
    response.writeHead(404);
    return response.end();
  }

  response.writeHead(200);
  return response.end(faContents);
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
  const sourceEmitter = new EventEmitter();
  let lastMessage;
  sourceEmitter.on("update", (e) => (lastMessage = e));

  const fileAttachmentWatcher = allowFileAttachments
    ? chokidar.watch([], {})
    : null;
  let headerPathToNames;

  chokidar.watch(notebookPath).on("all", (event, notebookPath) => {
    readSourceCode(notebookPath)
      .then((source) => {
        // on new source, if any FA changes, then update fileAttachmentWatcher
        const header = extractHeader(source);

        // LiveFileAttachment stuff
        if (allowFileAttachments && header && header.FileAttachments) {
          const currentWatchList = new Set(
            // getWatched returns { absDirectory => [file1, file2, etc.] }
            Object.entries(fileAttachmentWatcher.getWatched()).reduce(
              (a, v) => [...a, ...v[1].map((d) => path.join(v[0], d))],
              []
            )
          );
          const headerFAs = header.FileAttachments;
          // key: absolute path to FA, e.g. /home/alex/notebooks/data/people.csv
          // value: array of FA names that the path defines, ex. ["data", "people"]
          headerPathToNames = Object.entries(headerFAs).reduce((a, current) => {
            const [name, p] = current;
            const absPath = path.resolve(path.dirname(notebookPath), p);
            if (a.has(absPath))
              return a.set(absPath, [...a.get(absPath), name]);
            else return a.set(absPath, [name]);
          }, new Map());

          // if new header.FileAttachments has a new path, then add to watchlist.
          for (const [path, names] of headerPathToNames) {
            if (!currentWatchList.has(path)) {
              fileAttachmentWatcher.add(path);
            }
          }

          // if a previously watched file isnt in header anymore, rm it.
          for (const watchedFile of currentWatchList) {
            if (!headerPathToNames.has(watchedFile)) {
              fileAttachmentWatcher.unwatch(watchedFile);
            }
          }
        }

        sourceEmitter.emit("update", {
          event,
          path: notebookPath,
          source,
          header,
        });
      })
      .catch((err) => console.error("err reading path", err));
  });
  const server = http.createServer(function (request, response) {
    log(chalk.greenBright(request.method), request.url);
    if (request.method === "GET" && request.url === "/") {
      response.writeHead(200);
      const indexHTML = readFileSync(
        path.join(__dirname, "content", "index.html"),
        "utf8"
      );
      return response.end(indexHTML);
    }
    if (request.method === "GET" && request.url === "/run.js") {
      response.writeHead(200, {
        "Content-Type": "text/javascript",
      });
      const runJS = readFileSync(
        path.join(__dirname, "content", "run.js"),
        "utf8"
      );
      return response.end(runJS);
    }
    if (request.method === "GET" && request.url === "/stdlib.js") {
      response.writeHead(200, {
        "Content-Type": "text/javascript",
      });
      const stdlibJS = stdibPath ? readFileSync(stdibPath, "utf8") : "";
      return response.end(stdlibJS);
    }
    if (request.method === "GET" && request.url.startsWith("/api/import"))
      return handleLocalImport(request, response, notebookPath, port);
    if (
      request.method === "GET" &&
      request.url.startsWith("/api/file-attachments")
    )
      return handleApiFileAttachment(
        request,
        response,
        notebookPath,
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
      log(
        `Connection from origin ${request.origin} rejected.`
      );
      return;
    }

    const connection = request.accept("echo-protocol", request.origin);

    log(`Connection accepted.`);

    // initial msg to populate
    connection.sendUTF(
      JSON.stringify({
        type: "update",
        data: lastMessage,
      })
    );

    function onUpdate(e) {
      connection.sendUTF(
        JSON.stringify({
          type: "update",
          data: e,
        })
      );
    }
    sourceEmitter.on("update", onUpdate);
    if (fileAttachmentWatcher)
      fileAttachmentWatcher.on("change", (path, stats) => {
        const names = headerPathToNames.get(path);
        connection.sendUTF(
          JSON.stringify({
            type: "live-fa",
            data: {
              names,
            },
          })
        );
      });

    connection.on("close", function (reasonCode, description) {
      log(
        `Peer ${connection.remoteAddress} disconnected.`
      );
      sourceEmitter.off("update", onUpdate);
    });
  });

  server.listen(port, function () {
    const url = `http://localhost:${port}`;
    log(`Server started at ${url}`);
    params.open && open(url);
  });
}

module.exports = {
  runServer,
  extractHeader,
};
