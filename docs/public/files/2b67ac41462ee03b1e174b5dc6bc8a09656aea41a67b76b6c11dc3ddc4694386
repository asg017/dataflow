## Custom Standard Libraries

The base [Observable standard library](https://github.com/observablehq/stdlib) is great, but you may want your own custom builtin cells for your own workflow. The `--stdlib` flag can specify a configuration file where you can add more builtin cells.

```
dataflow run example.ojs --stdlib custom_stdlib.js
```

### stdlib.js Format

Inside your stdlib file, you must define a object on `window.DATAFLOW_STDLIB` like so:

```javascript
window.DATAFLOW_STDLIB = {
  constants: {
    name: "alex",
  },
  dependency: {
    require: {
      moment: (require) => require("moment"),
    },
  },
};
```

The `window.DATAFLOW_STDLIB` object can define two different types of builtin cells: "constant" and "dependency" cells.

### Constant cells

Constant cells are cells that do not use other stdlib cells in its defintion, like strings, functions, or numbers. `window.DATAFLOW_STDLIB.constants` is an object where the keys are the names of the builtin cells you want to include, and the values are the raw values that the cell will resolve to.

```js
window.DATAFLOW_STDLIB = {
  constants: {
    red1: "#ff0000",
    red2: "#dd2222",
    upper: () => (s) => s.toUpperCase(),
  },
};
```

TODO test

Here, a new builtin cell `red1` would have a value of `"#ff0000"`, `red2` would have `"#dd2222"`, and `upper` would be a function that upper-cases a given string.

Note: if you are defining a function, it [must be wrapped in a function](https://github.com/observablehq/runtime/issues/195), which is why `window.DATAFLOW_STDLIB.constants.upper` is a function that returns a function.

These cells can be referenced in any `.ojs` file without needing to import or require, like so:

```js
html`<div style="color: \${red1};">I'm red!</div>`;

md`
\${upper("i am so loud")}
`;
```

### Dependency cells

Depedency cells depend on another builtin cell. `window.DATAFLOW_STDLIB.dependency` is an object where the keys are previously defined builtin cells, and the values are objects where _those_ keys are the name of _new_ builtin cells to define, and the values are a function that is called with the resolved dependent builtin.

```javascript
window.DATAFLOW_STDLIB = {
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

Here, in order to define `d3` and `_` as builtin cells, then `require`

2. `d3` and `_`, builtin cells that have a dependency to the `require` builtin cell. `window.DATAFLOW_STDLIB.dependency` is an object where the keys are other previously defined builtin cells, and the values are an object where _those_ keys are the name of _new_ builtin cells to define, and the values are a function is called with the resolved dependent builtin. Here, `d3: (require) => require("d3@5")` means "defined a new builtin `d3` that is dependent on the `require` builtin, and the definition is `require("d3@5")`.
3. `logo`, a cell that returns a simple SVG image.
4. `fakeData`, a builtin that relies on the neww builtin `d3` added above.

To use these builtins in an `.ojs` file, just reference it like any other stdlib cell! No need for importing or requiring.

```javascript
// example.ojs
html`<div style="background-color: \${red1}">red1</div>`;

html`<div style="background-color: \${red2}">red2</div>`;

html`<div style="background-color: \${red3}">red3</div>`;

d3.json("https://api.github.com/emojis");

_.partition([1, 2, 3, 4], (n) => n % 2);

logo;

d3.sum(fakeData);
```

### This will change

`window.DATAFLOW_STDLIB` is pretty awkward and limiting, so I plan to change this API in the future. Follow [#16](https://github.com/asg017/dataflow/issues/16) for more.
