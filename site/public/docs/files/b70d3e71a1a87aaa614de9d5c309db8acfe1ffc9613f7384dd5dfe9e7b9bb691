## Reference

### Command Line Interface

#### `dataflow run <notebook>`

Start a development server that renders the given notebook, and live-updates on changes to the notebook file.

`--allow-file-attachments`

Allow for notebooks to access defined FileAttachments. FileAttachments could point to any file on your filesystem, so use with caution on notebooks with unknown authors.

`--stdlib <path>`

Define aditional builtin cells, see [Custom Standard Libraries](#custom-standard-libraries) for more details. `path` is the path to the configuration file.

`--allow-secrets`

Allow for notebooks to fetch for "secrets" passed in with `--secret`. This may be depracated in the future.

`--secret [secret...]`

Define a secret that a notebook with access with `Secret("name")`. The format of `secret` is `NAME:VALUE` where `NAME` is the API-friendly name that the notebook will use, `:` as a seperator, and `VALUE` is the "secret" value of the secret itself.

`-p, --port <number>`

What port to start the server on. default `8080`.

`--no-open`

By default, dataflow will open a new browser tab/window to the notebook. Use this to disable that behavior.

#### `dataflow compile <input> <output>`

`--stdlib <path>`

Define aditional builtin cells, see [Custom Standard Libraries](#custom-standard-libraries) for more details. `path` is the path to the configuration file.

`--target <cells>`

By default, the `index.html` file inside the bundle will render all cells in the entire notebook, including unnamed cells. `--target` can be used to only render a select few cells. `cells` is the list of cells you want to be rendered, seperated by commas (ex `--target "a,b,viewof c, mutable debug"`).

`--tree-shake <cells>`

By default, all cells in the input file will included in the compiled output, including unnamed cells. `--tree-shake` can be used to specify only a select few cells to be including, and dataflow will remove any unnecessary cells, file attachments, and imports that are not needed. `cells` is the list of cells you want to keep (their dependencies will be kept implicitly), seperated by commas (ex `--tree-shake "TimeChart,viewof example,LICENSE"`).

`--include-styling`

Whether or not to include Dataflow-specific styling (some stylesheets) in the generated `index.html` file. This will be removed/changed in the future, see [#8](https://github.com/asg017/dataflow/issues/8).

### Node API

This is a work in progress! I hope to expose some functions to make it easier to integrate Dataflow operations into other projects. Checkout [#6](https://github.com/asg017/dataflow/issues/6) if you have any ideas/feature request with a Node API!
