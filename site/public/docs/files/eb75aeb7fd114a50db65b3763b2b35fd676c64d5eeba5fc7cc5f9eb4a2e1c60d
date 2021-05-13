## Importing notebooks

### Local `.ojs` files

Local `.ojs` files can be imported! They will be compiled to ES modules ✨on the fly✨. Say you have `submodule.ojs`:

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

And `main.ojs` in the same directory:

```javascript
// main.ojs

n = html`<input type=range value=15 min=1 max=50>`

import {chart} with {n} from "submodule.ojs"

chart
```

Running with `dataflow run main.ojs` will show how `main.ojs` imports the `chart` cell from `submodule.ojs`.

### observablehq.com Notebooks

Import with the notebook's full URL. Note that `"@d3/bar-chart"` alone wouldn't work, the full link `"https://observablehq.com/@d3/bar-chart"` works.

```javascript
viewof color = html`<input type=color value="#c8ce57">`

import {chart} with {color} from "https://observablehq.com/@d3/bar-chart"

import {Checkbox} from "https://observablehq.com/@observablehq/input-checkbox"

viewof selection = Checkbox(["Alameda", "Alpine" ,"Los Angeles", "San Diego"])

```

Note that because of differences between Dataflow's and observablehq's standard library, notebooks that rely on the old `html` builtin variables may behave differently in Dataflow. For example, the [`@jashkenas/inputs`](https://observablehq.com/@jashkenas/inputs) notebook uses the old `html` cell in a backward incompatible way, so it can't be imported cleanly. An alternative is [`@observablehq/inputs`](https://observablehq.com/@observablehq/inputs), or see [issue #2](https://github.com/asg017/dataflow/issues/2) for more workarounds.
