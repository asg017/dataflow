export default function define(runtime, observer) {
  const main = runtime.module();
  const fileAttachments = new Map([["source_ojs", new URL("./files/22dbb963d472ebe6a9bc3201082b7e3e5a74ff3e40ab302ba9aecff68d25436f", import.meta.url)]]);
  main.builtin("FileAttachment", runtime.fileAttachments(name => fileAttachments.get(name)));
  main.variable(observer()).define(["md"], function(md){return(
md`
# GitHub API Notebook

A notebook that demonstrates using the [GitHub API](https://docs.github.com/en/rest) in Dataflow.
`
)});
  main.variable(observer("viewof repo")).define("viewof repo", ["Inputs"], function(Inputs){return(
Inputs.select( `denoland/deno
JuliaLang/julia
facebook/react
streamlit/streamlit
observablehq/runtime
d3/d3
asg017/dataflow`.split("\n"), {label: "Repository"})
)});
  main.variable(null).define("repo", ["Generators", "viewof repo"], (G, _) => G.input(_));
  main.variable(observer()).define(["Plot","data"], function(Plot,data){return(
Plot.plot({
  marginLeft: 100,
  padding: 0,
  x: {
    round: true,
    grid: true
  },
  color: {
    scheme: "YlGnBu"
  },
  facet: {
    data: data,
    marginLeft: 100,
    y: "author"
  },
  marks: [
    Plot.barX(data, Plot.binX({fill: "count"}, {x: "date", inset: 0.5}))
  ]
})
)});
  main.variable(observer()).define(["Plot","data"], function(Plot,data){return(
Plot.plot({
  y: {
    domain: Array.from({length:7}, (_,i)=>i),
    tickFormat: Plot.formatWeekday("en", "narrow"),
  },
  color: {
    scheme: "YlGnBu"
  },
  marks: [
    Plot.cell(data, {
      x: d => d.date.getUTCHours(),
      y: d => d.date.getUTCDay(),
      fill: (d, i) => i > 0 ? (d.date - data[i - 1].date) / data[i - 1].date : NaN,
      title: (d, i) => i > 0 ? ((d.date - data[i - 1].date) / data[i - 1].date * 100).toFixed(1) : NaN,
      inset: 0.5
    })
  ]
})
)});
  main.variable(observer("r")).define("r", ["repo"], function(repo){return(
fetch(`https://api.github.com/repos/${repo}`)
  .then(r=>r.json())
)});
  main.variable(observer("commits")).define("commits", ["r"], function(r){return(
fetch(r.commits_url.replace(/{\/sha}$/, "?per_page=100&since=1990-01-01T00:00:00Z"))
  .then(r=>r.json())
)});
  main.variable(observer("data")).define("data", ["commits"], function(commits){return(
commits.filter(d=>d.author).map(d=>({
  date: new Date(d.commit.author.date),
  author: d.author.login,
  message: d.commit.message
}))
)});
  main.variable(observer()).define(["md"], function(md){return(
md`## Source Code

This is the original source code for this notebook, the \`github-api.ojs\` file.`
)});
  main.variable(observer()).define(["md","FileAttachment"], async function(md,FileAttachment){return(
md`~~~javascript
${(await FileAttachment("source_ojs").text()).replace(/~~~/g, "```")}
~~~`
)});
  main.variable(observer()).define(function(){return(
document.title = "GitHub API Example / Dataflow"
)});
  return main;
}