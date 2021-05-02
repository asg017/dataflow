const { compileNotebook } = require("../../src/export.js");
const fs = require("fs");
let dataflowPlugin = {
  name: "dataflow",
  setup(build) {
    build.onResolve({ filter: /.ojs$/ }, (args) => ({
      path: args.path,
      namespace: "dataflow",
      pluginData: "can add here more if needed",
    }));

    build.onLoad({ filter: /.*/, namespace: "dataflow" }, async (args) => {
      let contents = await new Promise((resolve, reject) => {
        const source = fs.readFileSync(args.path, "utf8");
        const compiled = compileNotebook(source, null);
        resolve(compiled);
      });
      return { contents, watchFiles: [args.path] };
    });
  },
};

require("esbuild")
  .build({
    entryPoints: ["App.jsx"],
    bundle: true,
    outfile: "index.js",
    plugins: [dataflowPlugin],
    jsxFactory: "h",
    watch: true,
  })
  .catch(() => process.exit(1));
