## Compiling Notebooks

Your `.ojs` files can be compiled to ES modules for easier integrations with other tools, similar to the [Advanced Embedding and Downloading
](https://observablehq.com/@observablehq/downloading-and-embedding-notebooks) on observablehq.com. These compiled files could be included in other projects like React apps, SPAs, or any other place the web can reach.

Compiling does **not** bundle everything needed to run an Observable notebook. You will still need to include the Observable runtime when embeding your notebooks elsewhere, and any dynamically fetched dependencies (like `require()` or `import()`) inside your code will not be included in the compiled bundle. There is an example `index.html` file inside the bundle that demonstrates how to run your notebook (which imports the Observable runtime to do so).

### Tree Shaking

Tree-shaking is a technique used to remove un-used code from a compiled bundle. Say your top-level `.ojs` file looks like this:

```javascript
md`
# My notebook!
`;

import { helper } from "./sub.ojs";

example = helper("California");
```

And inside `sub.ojs`:

```js
/*
FileAttachments:
  big-file: ./path/to/big.file
*/

md`sub.ojs helper!`

function helper(state) {
  return state;
}

d3 = require("d3")

data = d3.json("https://example.com/big-file")

file = FileAttachment("big-file".text()

```

Notice how `top.ojs` only imports the `helper` cell from `sub.ojs`, meaning it completely ignore the `d3`, `data`, and `file` cells and the `big-file` FileAttachment from that submodule.

This means that when we are compiling, we can tree-shaking code from local `.ojs` files to remove un-used cells, file attachments, and sub imports. In this case, only code that is required to define `helper` will be included, meaning the `d3`, `data`, `file`, and the unnamed markdown cell will not appear in the compiled output.

This is enabled by default for all local `.ojs` imports. It's not possible when importing observablehq.com notebooks, since they don't support tree-shaking (yet!). The top-level `.ojs` file won't be tree-shaked, but you do so with the `--tree-shake cell1,cell2` flag.

### FileAttachments

FileAttachments are included inside the compiled bundle. Say you have:

```js
/*
FileAttachments:
  a: ./a.txt
  b: ./b.txt
*/

a = FileAttachment("a").text();

b = FileAttachment("b").text();
```

When compiled, `a.txt` and `b.txt` will be copied over into your compiled bundle, inside the `files/` directory. The name will be the SHA-256 checksum of the file (to avoid naming conflicts). the structure and the naming scheme will probably change in the future.

### Custom Standard Libraries

Pass in the `--stdlib` flag with a path to the `stdlib.js` configuration file (see [Custom Standard Libraries](#custom-standard-libraries) for details). That file will be copied over and included in your bundle, and will be ran with the example `index.html` file.

### Compiling will get better

`dataflow compile` has a weird API and a ton more improvements can be made, so follow [#17](https://github.com/asg017/dataflow/issues/17) to stay in the loop.
