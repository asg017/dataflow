# Dataflow

An experimental self-hosted Observable notebook alternative, with support for FileAttachments, Secrets, and custom standard libraries.

## Features

### `.ojs` Files: "Observable JavaScript"

In Dataflow, you work with `.ojs` files, which has a similar vibe as JavaScript, but with key differences. If you copy+paste the cells found in Observable notebooks at observablehq.com into a new file by itself, then that would be an `.ojs` file!

Here's an example `.ojs` file:

```js
// example.ojs

viewof a = html`<input type=number value=20>`

b = 2

c = a + b

everySecond = {
    let i = 0;
    while(true) {
        yield Promises.delay(1000, ++i)
    }
}

md`It's been ${everySecond} seconds since everySecond has started.`
```

A few things to note:

- Just like observablehq.com, Dataflow uses the [Observable notebook Standard Library](https://github.com/observablehq/stdlib), some cells like `Promises`, `html`, `md`, `require`, and more all are builtin by default.
- `viewof` and `mutable` cells are supported
- Cells are written one after the other, where the entire `example.ojs` file is analagous to a single Observable notebook.

See [Observable’s not JavaScript
](https://observablehq.com/@observablehq/observables-not-javascript) for a clearer look at what makes Observable syntax different from JavaScript.

### Live Updating Notebooks

To run the file above, you run:

```bash
dataflow run example.ojs
```

A server will start at http://localhost:8080, and if you navigate there, you will have a live rendered output of the `example.ojs` file.

Every change to the example.ojs file will automatically update. Every new cell, deleted cell, even re-arranged cells with automatically update all connected clients.

This also means you can use whatever text editor you want: VS Code, vim, emacs, nano, whatever can edit a file!

### FileAttachments

Filesystem acess from a Dataflow instance is possible! You'll have to specifically allow access from the `dataflow run` command:

```
dataflow run example.ojs --allow-file-attachments
```

Inside `example.ojs`, you will define allowed FileAttachments in a configuration comment at the very top. For example:

```javascript
/*
FileAttachments:
  a.txt: ./path/to/a.txt
  image.png: ./path/to/image.png
*/

a = FileAttachment("a.txt").text();

md`Contents of a.txt: ${a}`;

img = FileAttachment("image.png").image();
```

The top comment must be a `/* ... */` style comment, where the body is a YAML object, with a single key `FileAttachments`, which defines an object where the keys are the "API-friendly" name of a file attachment, and the value is the path relative to the `.ojs` file of the FileAttachment.

### Secrets

Secrets can be passed in from the `dataflow run` CLI as well. Keep in mind, there's no encryption or anything fancy going on with Secrets, think of them as a simple way to avoid writing secrets directly in source code.

```bash
dataflow run example.ojs --allow-secrets --secret API_TOKEN:$API_TOKEN --secret PASSWORD:hunter2
```

```javascript
// contents of the API_TOKEN environment  variable
apiToken = Secret("API_TOKEN");

// "hunter2"
password = Secret("PASSWORD");
```

One key difference here: a `Secret("key")` call returns a Promise, not the secret directly.

### Custom Standard Libraries

The base Observable stdlib is great, but you may want your own custom builtin cells for your own workflow. The `--stdlib` flag can specify a configuration file where you can add more builtin cells.

```
dataflow run example.ojs --stdlib custom_stdlib.js
```

Inside `custom_stdlib.js`:

```javascript
window.OJS_STDLIB = {
  constants: {
    red1: "#ff0000",
    red2: "#dd2222",
    red3: "#cc6666",
  },
  dependency: {
    require: {
      d3: (require) => require("d3@5"),
      _: (require) => require("lodash"),
    },
    svg: {
      logo: (svg) =>
        svg`<svg width=100 height=100>
          <rect width=100 height=100 fill=lightpink></rect>
          <circle cx=50 cy=50 r=40 fill=blue></circle>`,
    },
    d3: {
      fakeData: (d3) => d3.range(200),
    },
  },
};
```

This would provide 7 new builtin cells:

1. `red1`, `red2`, and `red3`, each of them strings representing different shades of red. `window.OJS_STDLIB.constants` is an object where the keys are the names of the new builtin cells, and the values are the direct values of what the cells should resolve to. These builtins have no dependecies to other builtin cells.
2. `d3` and `_`, builtin cells that have a dependency to the `require` builtin cell. `window.OJS_STDLIB.dependency` is an object where the keys are other previously defined builtin cells, and the values are an object where _those_ keys are the name of _new_ builtin cells to define, and the values are a function is called with the resolved dependent builtin. Here, `d3: (require) => require("d3@5")` means "defined a new builtin `d3` that is dependent on the `require` builtin, and the definition is `require("d3@5")`.
3. `logo`, a cell that returns a simple SVG image.
4. `fakeData`, a builtin that relies on the neww builtin `d3` added above.

To use these builtins in an `.ojs` file, just reference it like any other stdlib cell! No need for importing or requiring.

```javascript
// example.ojs
html`<div style="background-color: ${red1}">red1</div>`;

html`<div style="background-color: ${red2}">red2</div>`;

html`<div style="background-color: ${red3}">red3</div>`;

d3.json("https://api.github.com/emojis");

_.partition([1, 2, 3, 4], (n) => n % 2);

logo;

d3.sum(fakeData);
```

### Importing observablehq.com notebooks

Import with the notebook's full URL. Note that `"@d3/bar-chart"` alone wouldn't work, the full link `"https://observablehq.com/@d3/bar-chart"` works.

```javascript
viewof color = html`<input type=color value="#c8ce57">`

import {chart} with {color} "https://observablehq.com/@d3/bar-chart"

import {Checkbox} from "https://observablehq.com/@observablehq/input-checkbox"

viewof selection = Checkbox(["Alameda", "Alpine" ,"Los Angeles", "San Diego"])

```

### Importing local `.ojs` files

Local `.ojs` files can be imported! They will be compiled to ES modules on the fly.

```javascript
// submodule.ojs

d3 = require("d3-array", "d3-random");

n = 10;

chart = svg`<svg width=100 height=100>
${d3
  .range(n)
  .map(
    (d) =>
      svg`<circle r=2 fill=pink cx=${d3.randomUniform(
        100
      )()} cy=${d3.randomUniform(100)()}>`
  )}`;
```

In another file:

```javascript
// main.ojs
n = html`<input type=range value=15 min=1 max=50>`

import {chart} with {n} from "submodule.ojs"

chart
```

```bash
dataflow run main.ojs
```

### Compile an `.ojs` file to ES Module or HTML file

Note: this won't work quite yet with `.ojs` files that use FileAttachments, Secrets, or the custom stdlib feature! I plan to support FileAttachment and custom stdlib in the future, though.

```bash
dataflow export test.ojs test.js

dataflow export test.ojs test.html
```

## TODO

- [ ] import local notebooks
  - gists?
  - github files
  - any js link as pre-compiled esm module
  - import pre-compiled local ESM modules: `import {chart} from "file.js"`
- [ ] different origin iframe
  - localhost:8080 is base notebook, localhost:8081 has iframe stuff
  - would solve width issues
  - what would parent -> iframe need to communicate about? height?
  - for security too lol
- [ ] better websocket handling
  - reconnecting with socket closes
  - bottom status bar on connect/message/error/closed
  - error notifs when parsing errors

### cool stuff that someone else could do

- [ ] webpack/esbuild .ojs files?
  - `import chart from "./notebooks/chart.ojs"
  - react `<div> <Notebook define={chart}/> </div>`
- [ ] editor integrations
  - vs code syntax fix for .ojs, viewof, mutable, etc.
  - code folding on a cell basis
  - vim stuff?
- [ ] Typescript?
  - https://www.typescriptlang.org/docs/handbook/jsdoc-supported-types.html
  - editor hints + integration with typed cells in references, imports, etc

## Testing

automated testing is for suckers

- stdlib
  - `./src/dataflow run ./test/colors-stdlib.ojs --stdlib ./test/stdlib/colors1.js`
  - `./src/dataflow run ./test/colors-stdlib.ojs --stdlib ./test/stdlib/colors2.js`
  - `./src/dataflow run ./test/async-stdlib.ojs --stdlib ./test/stdlib/async.js `
- FileAttachments
  - `./src/dataflow run ./test/file-attachments.ojs --allow-file-attachments`
- Secrests
  - `$ export TOKEN=abc123; ./src/dataflow run ./test/secrets.ojs --secret PASSWORD:hunter2 --secret TOKEN:$TOKEN --allow-secrets`

## compiler

had to fork the compiler bc the public API isn't enough :/

```
$ esbuild src/index.js --bundle --outfile=esbuild-test.js --format=esm --minify
```
