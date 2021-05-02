export default function define(runtime, observer) {
  const main = runtime.module();
  const fileAttachments = new Map([["package.json", new URL("./files/20d01ea6168a0baae21e61bbb35b552781c84e5bd18be81c77cbb7f2c3312f3f", import.meta.url)]]);
  main.builtin("FileAttachment", runtime.fileAttachments(name => fileAttachments.get(name)));
  main.variable(observer("nav")).define("nav", ["html","FileAttachment"], async function(html,FileAttachment){return(
html`<nav>
<h1 id=title>Dataflow Documentation</h1>

<span class=version>v${(await FileAttachment("package.json").json()).version}</span>

<a href="https://github.com/asg017/dataflow" style="color: black; ">
  <i class="bx bxl-github" style=" font-weight: 900; font-size: 1.5rem;"></i>
  <span style="font-size: 1.5rem; line-height: 1.5rem; font-weight: 500;">Github</span>
</a>`
)});
  main.variable(observer("content")).define("content", ["html","toc","pages","currentI"], function(html,toc,pages,currentI){return(
html`<div class=container>
  ${toc()}
  <article class=content>
    ${pages[currentI]()}
  </article>
</div>`
)});
  main.variable(observer("navParent")).define("navParent", ["nav","invalidation","html"], function(nav,invalidation,html)
{
  nav.parentElement.classList.add("nav-parent");
  invalidation.then(() => nav.parentElement.classList.remove("nav-parent"));
  return html`<span>`;
}
);
  main.variable(observer()).define(["md"], function(md){return(
md`---`
)});
  main.variable(observer()).define(["md"], function(md){return(
md`👇🏼 Everything below this line won't appear after we compile the docs`
)});
  main.variable(observer("pageMeta")).define("pageMeta", ["pages"], function(pages){return(
pages.map(p=>{
  const dom = p();
  const h2 = dom.querySelector("h2");
  return {
      header: h2 && h2.textContent,
      id: h2 && h2.getAttribute("id")
  }
})
)});
  main.variable(observer()).define(["pageMeta"], function(pageMeta){return(
pageMeta
)});
  main.define("initial currentI", ["pageMeta"], function(pageMeta)
{
  const i = pageMeta.findIndex(p=>p.id === window.location.hash.substring(1));

  if(i >=0) return i;
  return 0;
}
);
  main.variable(observer("mutable currentI")).define("mutable currentI", ["Mutable", "initial currentI"], (M, _) => new M(_));
  main.variable(null).define("currentI", ["mutable currentI"], _ => _.generator);
  main.variable(observer("hashchange")).define("hashchange", ["pageMeta","mutable currentI","invalidation","html"], function(pageMeta,$0,invalidation,html)
{
  function onhashchange() {
    const i = pageMeta.findIndex(p=>p.id === window.location.hash.substring(1));
    if(i >=0) $0.value = i;
  }

  window.addEventListener("hashchange", onhashchange, false);
  invalidation.then( () => window.removeEventListener("hashchange", onhashchange))
  return html`<span>`;
}
);
  main.variable(observer("hash")).define("hash", ["pageMeta","currentI","html"], function(pageMeta,currentI,html)
{
  if(window.location.hash) window.scrollTo(0, 0);

  window.location.hash = pageMeta[currentI].id;
  document.title = `${pageMeta[currentI].header} / Dataflow Documentation`;
  return html`<span>`;
}
);
  main.variable(observer("intro")).define("intro", ["md"], function(md){return(
() => md`## Introduction

too begin

shake
fellas in my hair
`
)});
  main.variable(observer("quickstart")).define("quickstart", ["md"], function(md){return(
() => md`
## Quickstart + Installation

Dataflow is a program that you install on your computer and use on the command line. \`dataflow run\` will start a dev sever that enable a live editing experience for your \`.ojs\` notebook files, and \`dataflow compile\` will compile thise files into re-usable JavaScript ES modules for use in other projects.

### Install

\`dataflow\` is available on npm.

~~~bash
npm install @alex.garcia/dataflow

dataflow --help

# Alternatively, yarn.

yarn add @alex.garcia/dataflow

dataflow --help
~~~

### \`dataflow run\`



### \`dataflow compile\`


### .ojs Files

In Dataflow, you work with .ojs files, which has a similar vibe as JavaScript, but with key differences. If you copy+paste the cells found in Observable notebooks at observablehq.com into a new file by itself, then that would be an .ojs file!

Here's an example:

~~~javascript
// example.ojs

viewof a = html\`<input type=number value=20>\`

b = 2

c = a + b

everySecond = {
  let i = 0;
  while(true) {
    yield Promises.delay(1000, ++i)
  }
}

md\`It's been \${everySecond} seconds since everySecond has started.\`
~~~


Cells are written one after the other, where the entire \`example.ojs\` file is analagous to a single Observable notebook.


To run the file above:

~~~bash
dataflow run example.ojs
~~~

A server will start at http://localhost:8080, and if you navigate there, you will have a live rendered output of the \`example.ojs\` file.

Every change to the example.ojs file will automatically update. Every new cell, deleted cell, even re-arranged cells with automatically update all connected clients.

This also means you can use whatever text editor you want: VS Code, vim, nano, whatever can edit a file!


See [Observable’s not JavaScript](https://observablehq.com/@observablehq/observables-not-javascript) for a clearer look at what makes Observable syntax different from JavaScript.


### Standard Library (built-in cells)

Just like observablehq.com, Dataflow uses the [Observable notebook Standard Library](https://github.com/observablehq/stdlib), so cells like \`Promises\`, \`html\`, \`md\`, \`require\`, and more all are builtin by default. \`viewof\` and \`mutable\` cells are also supported.

One key difference with observablehq.com: The builtin cells for \`html\` and \`svg\` use [@observablehq/htl](https://github.com/observablehq/htl) instead. This means that not all notebooks found on observablehq.com will work when importing from Dataflow, but the API is similar enough to make upgrades only take a few minutes.

`
)});
  main.variable(observer("stdlib")).define("stdlib", ["md"], function(md){return(
() => md`## Custom Standard Libraries
The base [Observable standard library](https://github.com/observablehq/stdlib) is great, but you may want your own custom builtin cells for your own workflow. The \`--stdlib\` flag can specify a configuration file where you can add more builtin cells.

~~~
dataflow run example.ojs --stdlib custom_stdlib.js
~~~

### stdlib.js Format

Inside your stdlib file, you must define a object on \`window.DATAFLOW_STDLIB\` like so:

~~~javascript
window.DATAFLOW_STDLIB = {
  constants: {
    name: "alex",
  },
  dependency: {
    require: {
      moment: require => require("moment")
    }
  }
}
~~~

The \`window.DATAFLOW_STDLIB\` object can define two different types of builtin cells: "constant" and "dependency" cells. 

### Constant cells

Constant cells are cells that do not use other stdlib cells in its defintion, like strings, functions, or numbers. \`window.DATAFLOW_STDLIB.constants\` is an object where the keys are the names of the builtin cells you want to include, and the values are the raw values that the cell will resolve to. 

~~~js
window.DATAFLOW_STDLIB = {
  constants: {
    red1: "#ff0000",
    red2: "#dd2222",
    upper: () => s => s.toUpperCase()
  }
}
~~~

TODO test

Here, a new builtin cell \`red1\` would have a value of \`"#ff0000"\`, \`red2\` would have \`"#dd2222"\`, and \`upper\` would be a function that upper-cases a given string.

Note: if you are defining a function, it [must be wrapped in a function](https://github.com/observablehq/runtime/issues/195), which is why \`window.DATAFLOW_STDLIB.constants.upper\` is a function that returns a function. 

These cells can be referenced in any \`.ojs\` file without needing to import or require, like so:

~~~js
html\`<div style="color: \${red1};"> I'm red! </div>\`

md\`\${upper("i am so loud")}\`
~~~


### Dependency cells

Depedency cells depend on another builtin cell. \`window.DATAFLOW_STDLIB.dependency\` is an object where the keys are previously defined builtin cells, and the values are objects where *those* keys are the name of *new* builtin cells to define, and the values are a function that is called with the resolved dependent builtin. 


~~~javascript
window.DATAFLOW_STDLIB = {
  dependency: {
    require: {
      d3: (require) => require("d3@5"),
      _: (require) => require("lodash"),
    },
    svg: {
      logo: (svg) =>
        svg\`<svg width=100 height=100>
          <rect width=100 height=100 fill=lightpink></rect>
          <circle cx=50 cy=50 r=40 fill=blue></circle>\`,
    },
    d3: {
      fakeData: (d3) => d3.range(200),
    },
  },
};
~~~

Here, in order to define \`d3\` and \`_\` as builtin cells, then \`require\`


2. \`d3\` and \`_\`, builtin cells that have a dependency to the \`require\` builtin cell. \`window.DATAFLOW_STDLIB.dependency\` is an object where the keys are other previously defined builtin cells, and the values are an object where _those_ keys are the name of _new_ builtin cells to define, and the values are a function is called with the resolved dependent builtin. Here, \`d3: (require) => require("d3@5")\` means "defined a new builtin \`d3\` that is dependent on the \`require\` builtin, and the definition is \`require("d3@5")\`.
3. \`logo\`, a cell that returns a simple SVG image.
4. \`fakeData\`, a builtin that relies on the neww builtin \`d3\` added above.

To use these builtins in an \`.ojs\` file, just reference it like any other stdlib cell! No need for importing or requiring.

~~~javascript
// example.ojs
html\`<div style="background-color: \${red1}">red1</div>\`;

html\`<div style="background-color: \${red2}">red2</div>\`;

html\`<div style="background-color: \${red3}">red3</div>\`;

d3.json("https://api.github.com/emojis");

_.partition([1, 2, 3, 4], (n) => n % 2);

logo;

d3.sum(fakeData);
~~~

### This will change

\`window.DATAFLOW_STDLIB\` is pretty awkward and limiting, so I plan to change this API in the future. Follow [#16](https://github.com/asg017/dataflow/issues/16) for more.
`
)});
  main.variable(observer("fileattachments")).define("fileattachments", ["md"], function(md){return(
()=>md`## File Attachments

Filesystem access from a Dataflow instance is possible! You'll have to explicitly allow access from the \`dataflow run\` command with the \`--allow-file-attachments\` option like so:

~~~bash
dataflow run example.ojs --allow-file-attachments
~~~

### Regular File Attachments

FileAttachments paths are defined in a configuration comment at the very top of a \`.ojs\` file. For example:

~~~javascript
/*
FileAttachments:
  a.txt: ./path/to/a.txt
  image.png: ./path/to/image.png
*/

a = FileAttachment("a.txt").text();

md\`Contents of a.txt: \${a}\`;

img = FileAttachment("image.png").image();
~~~

The top comment must be a \`/* ... */\` style comment, where the body is a YAML object, with a single key \`FileAttachments\`, which defines an object where the keys are the "API-friendly" name of a file attachment, and the values are the path relative to the \`.ojs\` file of the FileAttachment.

### Live File Attachments

Live File Attachments are a Dataflow-specific feature that is only available in the \`dataflow run\` command (ie, not in compiled notebooks). Live File Attachments "watch" for live updates to a file attachment. 

\`LiveFileAttachment\` is a builtin cell that takes in the name of a FileAttachment and returns an async generator that yields the current value of the FileAttachment. For example:

\`\`\`js
/*
FileAttachments:
    data.csv: ./path/to/file.csv
*/

csvFile = LiveFileAttachment("data.csv")

data = csvFile.csv({typed: true}) // [{name: "alex", value: 23 ...}]
\`\`\`

Whenever \`./path/to/file.csv\` updates (new contents, changed file metadata, etc.), then \`csvFile\` will yield a new value, causing downstream cells like \`data\` to refresh with new data. 

Remember, \`LiveFileAttachment\` returns an async generator, NOT the actual file attachment object, so it's not 100% compatible with the \`FileAttachment\` API. If you assign the return value of \`LiveFileAttachment("data.csv")\` to its own cell (\`csvFile\` in the example above), then you can reference that cell as a file attachment object like normal, thanks to the Observable runtime. 


`
)});
  main.variable(observer("secrets")).define("secrets", ["md"], function(md){return(
()=>md`## Secrets

Secrets can be passed in from the \`dataflow run\` CLI. Keep in mind, there's no encryption or anything fancy going on with Secrets, think of them as a simple way to avoid writing secrets directly in source code.

~~~bash
dataflow run example.ojs --allow-secrets \\
    --secret API_TOKEN:$API_TOKEN \\
    --secret PASSWORD:hunter2
~~~

~~~javascript
// contents of the API_TOKEN environment  variable
apiToken = Secret("API_TOKEN");

// "hunter2"
password = Secret("PASSWORD");
~~~

One key difference here from [observablehq.com Secrets](https://observablehq.com/@observablehq/secrets): a \`Secret("key")\` call returns a Promise, not the secret directly.

Secrets are not supported when compiling notebooks with \`dataflow compile\`.
`
)});
  main.variable(observer("importing")).define("importing", ["md"], function(md){return(
()=>md`## Importing notebooks

### Local \`.ojs\` files


Local \`.ojs\` files can be imported! They will be compiled to ES modules ✨on the fly✨. Say you have \`submodule.ojs\`:

~~~javascript
// submodule.ojs

d3 = require("d3-array", "d3-random");

n = 10;

chart = svg\`<svg width=100 height=100>
\${d3
  .range(n)
  .map(
    (d) =>
      svg\`<circle r=2 fill=pink cx=\${d3.randomUniform(
        100
      )()} cy=\${d3.randomUniform(100)()}>\`
  )}\`;
~~~

And \`main.ojs\` in the same directory:

~~~javascript
// main.ojs

n = html\`<input type=range value=15 min=1 max=50>\`

import {chart} with {n} from "submodule.ojs"

chart
~~~


Running with \`dataflow run main.ojs\` will show how \`main.ojs\` imports the \`chart\` cell from \`submodule.ojs\`.

### observablehq.com Notebooks

Import with the notebook's full URL. Note that \`"@d3/bar-chart"\` alone wouldn't work, the full link \`"https://observablehq.com/@d3/bar-chart"\` works.

~~~javascript
viewof color = html\`<input type=color value="#c8ce57">\`

import {chart} with {color} from "https://observablehq.com/@d3/bar-chart"

import {Checkbox} from "https://observablehq.com/@observablehq/input-checkbox"

viewof selection = Checkbox(["Alameda", "Alpine" ,"Los Angeles", "San Diego"])

~~~

Note that because of differences between Dataflow's and observablehq's standard library, notebooks that rely on the old \`html\` builtin variables may behave differently in Dataflow. For example, the [\`@jashkenas/inputs\`](https://observablehq.com/@jashkenas/inputs) notebook uses the old \`html\` cell in a backward incompatible way, so it can't be imported cleanly. An alternative is [\`@observablehq/inputs\`](https://observablehq.com/@observablehq/inputs), or see [issue #2](https://github.com/asg017/dataflow/issues/2) for more workarounds.`
)});
  main.variable(observer("compiling")).define("compiling", ["md"], function(md){return(
() => md`## Compiling Notebooks

Your \`.ojs\` files can be compiled to ES modules for easier integrations with other tools, similar to the [Advanced Embedding and Downloading
](https://observablehq.com/@observablehq/downloading-and-embedding-notebooks) on observablehq.com. These compiled files could be included in other projects like React apps, SPAs, or any other place the web can reach.

Compiling does **not** bundle everything needed to run an Observable notebook. You will still need to include the Observable runtime when embeding your notebooks elsewhere, and any dynamically fetched dependencies (like \`require()\` or \`import()\`) inside your code will not be included in the compiled bundle. There is an example \`index.html\` file inside the bundle that demonstrates how to run your notebook (which imports the Observable runtime to do so).

### Tree Shaking

Tree-shaking is a technique used to remove un-used code from a compiled bundle. Say your top-level \`.ojs\` file looks like this:

~~~js

md\`# My notebook!\`

import {helper} from "./sub.ojs";

example = helper("California")

~~~

And inside \`sub.ojs\`:

~~~js
/*
FileAttachments:
  big-file: ./path/to/big.file
*/

md\`sub.ojs helper!\`

function helper(state) {
  return state;
}

d3 = require("d3")

data = d3.json("https://example.com/big-file")

file = FileAttachment("big-file".text()

~~~

Notice how \`top.ojs\` only imports the \`helper\` cell from \`sub.ojs\`, meaning it completely ignore the \`d3\`, \`data\`, and \`file\` cells from that submodule (and the \`big-file\`) FileAttachment.

This means that when we are compiling, we can tree-shaking code from local \`.ojs\` files to remove un-used cells, file attachments, and sub imports. In this case, only code that is required to define \`helper\` will be included, meaning the \`d3\`, \`data\`, \`file\`, and the unnamed markdown cell will not appear in the compiled output.

This is enabled by default for all local \`.ojs\` imports. It's not possible when importing observablehq.com notebooks, since they don't support tree-shaking (yet!). The top-level \`.ojs\` file won't be tree-shaked, but you do so with the \`--tree-shake cell1,cell2\` flag.

### FileAttachments

FileAttachments are included inside the compiled bundle. Say you have:

~~~js
/*
FileAttachments:
  a: ./a.txt
  b: ./b.txt
*/

a = FileAttachment("a").text()

b = FileAttachment("b").text()
~~~

When compiled, \`a.txt\` and \`b.txt\` will be copied over into your compiled bundle, inside the \`files/\` directory. The name will be the SHA-256 checksum of the file (to avoid naming conflicts). the structure and the naming scheme will probably change in the future.


### Custom Standard Libraries

Pass in the \`--stdlib\` flag with a path to the \`stdlib.js\` configuration file (see [Custom Standard Libraries](#custom-standard-libraries) for details). That file will be copied over and included in your bundle, and will be ran with the example \`index.html\` file.

### Compiling will get better

\`dataflow compile\` has a weird API and a ton more improvements can be made, so follow [#17](https://github.com/asg017/dataflow/issues/17) to stay in the loop.`
)});
  main.variable(observer("production")).define("production", ["md"], function(md){return(
() => md`## Using Dataflow

### ObservableHQ vs. Dataflow

Here are some feature comparisions between Observable notebooks on observablehq.com and Dataflow:

|Feature|ObservableHQ?|Dataflow?
|-|-|-
|A large, vibrant community|✅|❌
|Customer Support|✅|❌
|Hosts several notebooks|✅|❌
|Strongly sandboxed notebooks|✅|❌
|Secrets|✅|✅
|FileAttachments|✅|✅
|"Live" FileAttachments|❌|✅
|Custom builtin cells (stdlib)|❌|✅
|Tree-shaking|❌|✅
|git-friendly|❌ <sup>[1]</sup>|✅
|Database connections|✅|❌<sup>[2]</sup>
|In-browser editor|✅|❌
|Bring your own editor (VS Code, vim, emac, etc.)|❌|✅

\`[1]\`  You can download compiled JavaScript files from observablehq.com and version-control it, but there's no supported way to download the original "Observable syntax".

\`[2]\` *Technically* you could run a database proxy on your local compter (ex on \`http://localhost:5000\`) then build your own \`DatabaseClient\` that accesses the data, but no built-in support.

### Future of Dataflow

I still plan to make more updates and new features for Dataflow, if people end up using it. 
`
)});
  main.variable(observer("reference")).define("reference", ["md"], function(md){return(
() => md`## Reference

### Command Line Interface

#### \`dataflow run\`

\`--allow-file-attachments\`

Allow for notebooks to access defined FileAttachments. FileAttachments could point to any file on your filesystem, so use with caution on notebooks with unknown authors.

\`--stdlib <path>\`

Define aditional builtin cells, see [Custom Standard Libraries](#custom-standard-libraries) for more details. \`path\` is the path to the configuration file.

\`--allow-secrets\`

Allow for notebooks to fetch for "secrets" passed in with \`--secret\`. This may be depracated in the future.

\`--secret [secret...]\`

Define a secret that a notebook with access with \`Secret("name")\`. The format of \`secret\` is \`NAME:VALUE\` where \`NAME\` is the API-friendly name that the notebook will use, \`:\` as a seperator, and \`VALUE\` is the "secret" value of the secret itself.

\`-p, --port <number>\`

What port to start the server on. default 8080.

\`--no-open\`

By default, dataflow will open a new browser tab/window to the notebook. Use this to disable that behavior.


#### \`dataflow compile input output\`

\`--stdlib <path>\`

Define aditional builtin cells, see [Custom Standard Libraries](#custom-standard-libraries) for more details. \`path\` is the path to the configuration file.


\`--target <cells>\`

By default, the \`index.html\` file inside the bundle will render the entire notebook, all cells including unnamed cells. \`--target\` can be used to only render a select few cells. \`cells\` is the list of cells you want to be rendered, seperated by commas (ex \`--target "a,b,viewof c, mutable debug"\`).

\`--tree-shake <cells>\`

By default, all cells in the input file will included in the compiled output, including unnamed cells. \`--tree-shake\` can be used to specficy only a select few cells to be including, and dataflow will remove any unnecessary cells, file attachments, and imports that are not needed. \`cells\` is the list of cells you want to keep (their dependencies will be kept implicitly), seperated by commas (ex \`--tree-shake "TimeChart,viewof example,LICENSE"\`).


\`--include-styling\`

Whether or not to include Dataflow-specific styling (some stylesheets) in the generated \`index.html\` file. This will be removed/changed in the future, see [#8](https://github.com/asg017/dataflow/issues/8).

### Node API

This is a work in progress! I hope to expose some functions to make it easier to integrate Dataflow operations into other projects. Checkout [#6](https://github.com/asg017/dataflow/issues/6) if you have any ideas/feature request with a Node API!`
)});
  main.variable(observer("pages")).define("pages", ["intro","quickstart","importing","fileattachments","stdlib","secrets","compiling","production","reference"], function(intro,quickstart,importing,fileattachments,stdlib,secrets,compiling,production,reference){return(
[intro, quickstart, importing,  fileattachments, stdlib, secrets, compiling, production, reference]
)});
  main.variable(observer("toc")).define("toc", ["html","pages","mutable currentI"], function(html,pages,$0){return(
function toc() {
  return html`<aside class="toc-container">
    <ul class="toc">
      ${pages.map( (p,i) => {
        const page = p();
        function onClick(){
          $0.value = i;
        }
        const header = (page.querySelector("h2") || page).textContent;
        const subs = Array.from(page.querySelectorAll("h3")).map(d=>d.textContent);

        return html`<li class="toc-item toc-item-${i}" onClick=${onClick}>
          <span class=head>${header}</span>
          <ul class="toc-sub">
            ${subs.map(s=>html`<li>${s}`)}
          </ul>
        </li>` 
      })}
  </ul>`
}
)});
  main.variable(observer("styleTOC")).define("styleTOC", ["html","currentI"], function(html,currentI){return(
html`<style>
.toc-item-${currentI} {
  color: purple;
}`
)});
  main.variable(observer()).define(["html"], function(html){return(
html`<style> 
#dataflow-container {
  width: 100%;
  max-width: 100%;
  margin: 0;
  padding: 0;
  overflow: unset;
}
`
)});
  main.variable(observer("style")).define("style", ["html"], function(html){return(
html`
<link rel="stylesheet"
  href="https://cdn.jsdelivr.net/npm/boxicons@latest/css/boxicons.min.css">

<style>
body {
  padding: 0;
  margin: 0;
}
.observablehq {
  overflow: unset; /* fucks with position sticky */
}

#title {
  border: none;
  padding: 0;
  margin: 0; 
  height: 3rem;
}

.nav-parent {
  position: sticky; 
  postion: -webkit-sticky;
  top: 0; 
  z-index: 20;
}

nav {
  background-color: #67a9cf; 
  position: sticky; 
  top: 0; 
  z-index: 20;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-left: 2rem;
  padding-right: 4rem;
}
.container {
  display: grid; 
  grid-template-columns: 18rem minmax(auto, 800px);
  grid-gap: 1rem;
  height: 100%;
  margin-top: 3rem;
}
.toc-container {
  height: 100vh;
  position: sticky;
  display: block;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
}
.toc {
  border-right: 1px solid #ccc;
  height: 100%;
  overflow: auto;
}
.toc-sub {
  font-size: .95rem;
  padding: 0;
  padding-left: .5rem!important;
}
.toc-item {
  font-size: 1.1rem;
  cursor: pointer;
}
.toc-item .head {
  font-weight: 600;
}
.toc li:hover {
  background-color: lavender;
}
.content {
  width: 100%;
  max-width: 48rem;
  margin: 0 auto;
  padding: 0 .5rem;
}

.version {
  font-size: 1rem;
  font-weight: 600;
  font-family: Monospace;
  background: #ccc;
  letter-spacing: -2px;
  padding: .125rem .25rem;
  border-radius: .25rem;
  margin-bottom: .25rem;
}`
)});
  return main;
}