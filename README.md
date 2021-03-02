## cli

```
# Start live-reloading dev server
node cli.js run test.ojs

# Compile .ojs file to ESM module
node cli.js compile test.ojs -o test.esm.js

# Compile .ojs file to HTML file
node cli.js compile test.ojs -o test.html

# Get .ojs source from a notebook at observablehq.com

```

## Update Algo

### Changing definitions

```
file 1          file 2      file 3
------------+------------+------------
a = 1       | a = 2      | a = 2
b = 2       | b = 2      | b = 2
c = a + b   | c = a + b  | c = 123
```

1:

cells["a"] = module.define('a', [], () => 1)
cells["b"] = module.define('b', [], () => 2)
cells["c"] = module.define('c', ["a", "b"], (a, b) => a + b)

2:
cells["a"].define("a", [], () => 10);

3:
cells["c"].define("c", [], () => 123);

### Changing positions

```
file 1          file 2      file 3
------------+------------+------------
a = 1       | b = 2      | c = a + b
b = 2       | a = 1      | b = 2
c = a + b   | c = a + b  | a = 1
```

```
{
    id: 1,
    cells: [
        {uid: "ca6d45", name: "a", deps: [], definition: "() => 1"},
        {uid: "7a8c57", name: "b", deps: [], definition: "() => 2"},
        {uid: "3a9c6e", name: "c", deps: ["a", "b"], definition: "(a, b) => a + b"}
    ]
}
{
    id: 2,
    cells: [
        {uid: "7a8c57", name: "b", deps: [], definition: "() => 2"},
        {uid: "ca6d45", name: "a", deps: [], definition: "() => 1"},
        {uid: "3a9c6e", name: "c", deps: ["a", "b"], definition: "(a, b) => a + b"}
    ]
}
{
    id: 3,
    cells: [
        {uid: "3a9c6e", name: "c", deps: ["a", "b"], definition: "(a, b) => a + b"},
        {uid: "7a8c57", name: "b", deps: [], definition: "() => 2"},
        {uid: "ca6d45", name: "a", deps: [], definition: "() => 1"}
    ]
}
```

## Extra spice

- [ ] builtin for reading filesystem
  - `node cli.js run test.ojs --data-dir /mnt/data`
  - `data = FileAttachments("file.csv")`
- [ ] dynamic builtins
  - S3, more file system stuff, sql, etc.
  - `node cli.js run test.ojs --stdlib ./extra.js`
  - `extra.js` `export default { s3: function(bucket, file) {...} }`
- [ ] import local notebooks
  - `import {chart} from "@d3/bar-chart"` will get from observablehq.com
  - `import {chart} from "./file.ojs"` will get from filesystem
  - will need to allow-list dirs/files to read from
  - also make it possible to import pre-compiled local ESM modules

## cpmiler

$ esbuild src/index.js --bundle --outfile=esbuild-test.js --format=esm --minify
