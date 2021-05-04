## File Attachments

Filesystem access from a Dataflow instance is possible! You'll have to explicitly allow access from the `dataflow run` command with the `--allow-file-attachments` option like so:

```bash
dataflow run example.ojs --allow-file-attachments
```

### Regular File Attachments

FileAttachments paths are defined in a configuration comment at the very top of a `.ojs` file. For example:

```javascript
/*
FileAttachments:
  a.txt: ./path/to/a.txt
  image.png: ./path/to/image.png
*/

a = FileAttachment("a.txt").text();

md`
Contents of a.txt: \${a}
`;

img = FileAttachment("image.png").image();
```

The top comment must be a `/_ ... _/` style comment, where the body is a YAML object, with a single key `FileAttachments`, which defines an object where the keys are the "API-friendly" name of a file attachment, and the values are the path relative to the `.ojs` file of the FileAttachment.

### Live File Attachments

Live File Attachments are a Dataflow-specific feature that is only available in the `dataflow run` command (ie, not in compiled notebooks). Live File Attachments "watch" for live updates to a file attachment.

`LiveFileAttachment` is a builtin cell that takes in the name of a FileAttachment and returns an async generator that yields the current value of the FileAttachment. For example:

```js
/_
FileAttachments:
data.csv: ./path/to/file.csv
_/

csvFile = LiveFileAttachment("data.csv")

data = csvFile.csv({typed: true}) // [{name: "alex", value: 23 ...}]
```

Whenever `./path/to/file.csv` updates (new contents, changed file metadata, etc.), then `csvFile` will yield a new value, causing downstream cells like `data` to refresh with new data.

Remember, `LiveFileAttachment` returns an async generator, NOT the actual file attachment object, so it's not 100% compatible with the `FileAttachment` API. If you assign the return value of `LiveFileAttachment("data.csv")` to its own cell (`csvFile` in the example above), then you can reference that cell as a file attachment object like normal, thanks to the Observable runtime.
