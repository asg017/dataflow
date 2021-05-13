export default function define(runtime, observer) {
  const main = runtime.module();

  main.variable(observer()).define(["html"], function(html){return(
html`
<div class="container">
<h1>Dataflow</h1>

<div role="doc-subtitle">A self-hosted Observable notebook editor.</div> 

<h2><a href="https://github.com/asg017/dataflow">Github</a></h2>
<h2><a href="./docs">Documentation</a></h2>

<h2> Examples</h2>
<ul>
  <li><a href="./examples/wiki-pageviews">Wikipedia Pageviews API</a></li>
  <li><a href="./examples/github-api">Github API</a></li>
  <li><a href="./examples/census-api">Census API</a></li>
  </ul>`
)});
  main.variable(observer()).define(["html"], function(html){return(
html`<style>
.container {
  text-align: center;
  max-width: 640px;
  margin: 0 auto;
  width: 450px;
}

.container li {
  list-style-type: none;
}

.container ul {
  padding: 0;
}

.`
)});
  return main;
}