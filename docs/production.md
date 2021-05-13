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

<sup>[1]</sup> You could technically download compiled JavaScript files from observablehq.com and version-control it, but there's no supported way to download the original "Observable syntax".

<sup>[2]</sup> _Technically_ you could run a database proxy on your local compter (ex on `http://localhost:5000`) then build your own `DatabaseClient` that accesses the data, but no built-in support.

That being said, you can still use both ObservableHQ and Dataflow in your workflows. It is possible to import Observable notebooks _from_ a Dataflow notebook. It's not as easy to import a Dataflow notebook from an Observable notebook, and it's not possible to "upload" a Dataflow `.ojs` notebook file into Observable, but I hope one day that the folks over at ObservableHQ will support that!

### Future of Dataflow

I still plan to make more updates and new features for Dataflow, if people end up using it!

I have two specific "milestones" planned for Dataflow: a [beta](https://github.com/asg017/dataflow/milestone/1) release, and a [v1](https://github.com/asg017/dataflow/milestone/2) release. The beta milestone will be a series of new releases/features for the next few months, while v1 will be much further down the road. If you have ideas, suggestions, or feedback, feel free to [open an issue](https://github.com/asg017/dataflow/issues) or [start a discussion](https://github.com/asg017/dataflow/discussions/new)!
