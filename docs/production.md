## Using Dataflow

### ObservableHQ vs. Dataflow

Here are some feature comparisions between Observable notebooks on observablehq.com and Dataflow:

| Feature                                          | ObservableHQ?     | Dataflow?        |
| ------------------------------------------------ | ----------------- | ---------------- |
| A large, vibrant community                       | ✅                | ❌               |
| Customer Support                                 | ✅                | ❌               |
| Hosts several notebooks                          | ✅                | ❌               |
| Strongly sandboxed notebooks                     | ✅                | ❌               |
| Secrets                                          | ✅                | ✅               |
| FileAttachments                                  | ✅                | ✅               |
| "Live" FileAttachments                           | ❌                | ✅               |
| Custom builtin cells (stdlib)                    | ❌                | ✅               |
| Tree-shaking                                     | ❌                | ✅               |
| git-friendly                                     | ❌ <sup>[1]</sup> | ✅               |
| Database connections                             | ✅                | ❌<sup>[2]</sup> |
| In-browser editor                                | ✅                | ❌               |
| Bring your own editor (VS Code, vim, emac, etc.) | ❌                | ✅               |

`[1]` You can download compiled JavaScript files from observablehq.com and version-control it, but there's no supported way to download the original "Observable syntax".

`[2]` _Technically_ you could run a database proxy on your local compter (ex on `http://localhost:5000`) then build your own `DatabaseClient` that accesses the data, but no built-in support.

### Future of Dataflow

I still plan to make more updates and new features for Dataflow, if people end up using it.
