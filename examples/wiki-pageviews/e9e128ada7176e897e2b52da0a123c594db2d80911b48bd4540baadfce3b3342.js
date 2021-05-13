export default function define(runtime, observer) {
  const main = runtime.module();
  const fileAttachments = new Map([["source_ojs", new URL("./files/157de8e31dca7ade4cdb014615698b244f9e4b5da7d9346ab255abde595d580e", import.meta.url)]]);
  main.builtin("FileAttachment", runtime.fileAttachments(name => fileAttachments.get(name)));
  main.variable(observer()).define(["md"], function(md){return(
md`# Wikipedia Pageviews

Explore pageviews data for specific Wikipedia pages!`
)});
  main.variable(observer("start")).define("start", function(){return(
new Date("2020-10-01")
)});
  main.variable(observer("end")).define("end", function(){return(
new Date("2021-01-01")
)});
  main.variable(observer("viewof pagesSource")).define("viewof pagesSource", ["Inputs","md"], function(Inputs,md){return(
Inputs.textarea({
  rows: 6,
  width: 220,
  label: md`<b>Pages"`,
  value: `Donald_Trump
Mike_Pence
Joe_Biden
Kamala_Harris`,
})
)});
  main.variable(null).define("pagesSource", ["Generators", "viewof pagesSource"], (G, _) => G.input(_));
  main.variable(observer("viewof labelsSource")).define("viewof labelsSource", ["Inputs","md"], function(Inputs,md){return(
Inputs.textarea({value:`2020-10-02,⬅ Trump tests positive for COVID19,115,20
2020-11-03,Election Day ➡,-50,120
2020-11-07,⬅AP Reports Biden wins,80,10`, label: md`<b>Labels`})
)});
  main.variable(null).define("labelsSource", ["Generators", "viewof labelsSource"], (G, _) => G.input(_));
  main.variable(observer("legend")).define("legend", ["html","colors"], function(html,colors){return(
html`<div>
${Object.keys(colors).map(k=>html`<b>
<div style="width: 1rem; height: 1rem; background-color: ${colors[k]}; display: inline-block; border-radius: 50%;"></div>
 ${k}</b>`)}`
)});
  main.variable(observer()).define(["Plot","width","colors","d3","yDomain","data","labels"], function(Plot,width,colors,d3,yDomain,data,labels){return(
Plot.plot({
  grid: true,
  width,
  marginLeft: 60,
  color: {
    domain: Object.keys(colors),
    range: Object.values(colors),
  },
  y: {
    tickFormat: d3.format(".2s"),
    domain: yDomain,
    label: " ⬆ pageviews",
    nice: true,
  },
  marks: [
    Plot.line(data, { x: "date", y: "value", stroke: (d) => d.page, strokeWidth: 3 }),
    ...labels.map(d=>Plot.line([
      [d.date, yDomain[0]],
      [d.date, yDomain[1]]
    ], {stroke: "#999"})),
    ...labels.map(label=>Plot.text([label], {
      x: label.date,
      y: yDomain[1], 
      text: d => d.label,
      dx: label.dx,
      dy: label.dy,
      fontSize: 14
    }))
  ],
})
)});
  main.variable(observer()).define(["md"], function(md){return(
md`## Source Code

This is the original source code for this notebook, the \`wikipedia-pageviews.ojs\` file.`
)});
  main.variable(observer()).define(["md","FileAttachment"], async function(md,FileAttachment){return(
md`~~~javascript
${(await FileAttachment("source_ojs").text()).replace(/~~~/g, "```")}
~~~`
)});
  main.variable(observer()).define(["md"], function(md){return(
md`## Appendix`
)});
  main.variable(observer("yDomain")).define("yDomain", ["d3","data"], function(d3,data){return(
d3.scaleLinear()
  .domain(d3.extent(data, d=>d.value))
  .nice()
  .domain()
)});
  main.variable(observer("labels")).define("labels", ["d3","labelsSource","start","end"], function(d3,labelsSource,start,end){return(
d3.csvParseRows(labelsSource, d=> ({
  date: new Date(d[0]), 
  label: d[1], 
  dx: d[2],
  dy: d[3]
})).filter(d=>d.date >= start && d.date <= end)
)});
  main.variable(observer("pages")).define("pages", ["pagesSource"], function(pagesSource){return(
pagesSource.split("\n")
)});
  main.variable(observer("data")).define("data", ["d3","pages","pageviews","start","end"], async function(d3,pages,pageviews,start,end){return(
d3.merge(
  await Promise.all(
    pages.map(async (page) =>
      Object.assign(await pageviews(page, start, end), { page })
    )
  )
)
)});
  main.variable(observer("colors")).define("colors", function(){return(
{
  Joe_Biden: "steelblue",
  Kamala_Harris: "lightsteelblue",
  Donald_Trump: "red",
  Mike_Pence: "pink",
}
)});
  main.variable(observer("pageviews")).define("pageviews", ["d3"], function(d3){return(
(page, start, end) => {
  const site = "en.wikipedia";
  if (typeof start === "string")
    start = d3.utcFormat("%Y%m%d00")(new Date(start));
  if (start instanceof Date) start = d3.utcFormat("%Y%m%d00")(start);
  if (typeof end === "string") end = d3.utcFormat("%Y%m%d")(new Date(end));
  if (end instanceof Date) end = d3.utcFormat("%Y%m%d")(end);

  return fetch(
    `https://wikimedia.org/api/rest_v1/metrics/pageviews/per-article/${site}/all-access/user/${page}/daily/${start}/${end}`
  )
    .then((r) => r.json())
    .then((d) =>
      d.items.map((item) => ({
        date: d3.utcParse("%Y%m%d00")(item.timestamp),
        value: item.views,
        page,
      }))
    );
}
)});
  main.variable(observer()).define(function(){return(
document.title = "Wikipedia Pageviews API Example / Dataflow"
)});
  return main;
}