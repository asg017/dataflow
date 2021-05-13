## Quickstart + Installation

Dataflow is a program that you install on your computer and use on the command line. `dataflow run` will start a dev sever that enable a live editing experience for your `.ojs` notebook files, and `dataflow compile` will compile those files into re-usable JavaScript ES modules for use in other projects.

### Install

`dataflow` is available on npm.

```bash
npm install @alex.garcia/dataflow

dataflow --help

# Alternatively, yarn.

yarn add @alex.garcia/dataflow

dataflow --help
```

### .ojs Files

In Dataflow, you work with .ojs files, which has a similar vibe as JavaScript, but with key differences. If you copy+paste the cells found in Observable notebooks at observablehq.com into a new file by itself, then that would be an .ojs file!

Here's an example:

```javascript
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

Cells are written one after the other, where the entire `example.ojs` file is analagous to a single Observable notebook.

To run the file above:

```bash
dataflow run example.ojs
```

A server will start at http://localhost:8080, and if you navigate there, you will have a live rendered output of the `example.ojs` file.

Every change to the example.ojs file will automatically update. Every new cell, deleted cell, even re-arranged cells with automatically update all connected clients.

This also means you can use whatever text editor you want: VS Code, vim, nano, whatever can edit a file!

See [Observable’s not JavaScript](https://observablehq.com/@observablehq/observables-not-javascript) for a clearer look at what makes Observable syntax different from JavaScript.

### Standard Library (built-in cells)

Just like observablehq.com, Dataflow uses the [Observable notebook Standard Library](https://github.com/observablehq/stdlib), so cells like `Promises`, `html`, `md`, `require`, and more all are builtin by default. `viewof` and `mutable` cells are also supported.

One key difference with observablehq.com: The builtin cells for `html` and `svg` use [@observablehq/htl](https://github.com/observablehq/htl) instead. This means that not all notebooks found on observablehq.com will work when importing from Dataflow, but the API is similar enough to make upgrades only take a few minutes.

Also, since `v3.5.0` of the Observable [standard library](https://github.com/observablehq/stdlib), the builtin cells `Plot`, `Inputs`, `vl`, `d3`, `htl` have been included, and are available in Dataflow.
