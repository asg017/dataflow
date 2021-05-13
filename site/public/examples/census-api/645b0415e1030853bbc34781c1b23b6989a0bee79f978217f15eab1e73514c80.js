import define1 from "https://api.observablehq.com/@d3/color-legend.js?v=3";

export default function define(runtime, observer) {
  const main = runtime.module();
  const fileAttachments = new Map([["counties-albers-10m.json", new URL("./files/b82e08fb63aac373d976e0203e5b0d446c321c5e3fca0d7c772ae5900149a2fe", import.meta.url)],["source_ojs", new URL("./files/e54361c3e7be0df0f0b536e79d37e5d0ce58eccdb461006df04312ed1a8feadd", import.meta.url)]]);
  main.builtin("FileAttachment", runtime.fileAttachments(name => fileAttachments.get(name)));
  main.variable(observer()).define(["md"], function(md){return(
md`# Census API

Choropleth adapted from [Choropleth](https://observablehq.com/@d3/choropleth) on Observable (ISC License).

Download the counties map with:

~~~bash 
wget -O data/counties-albers-10m.json \\
  https://cdn.jsdelivr.net/npm/us-atlas@3/counties-albers-10m.json
~~~

This notebook is a bit messier than the other examples, but look at is as a light exporer of "Census variables" inside the [B01001](https://api.census.gov/data/2016/acs/acs1/groups/B01001.html) group. `
)});
  main.variable(observer()).define(["md","variable"], function(md,variable){return(
md`## ${variable.name} - ${variable.label}`
)});
  main.variable(observer("viewof selVar")).define("viewof selVar", ["Inputs","vars"], function(Inputs,vars){return(
Inputs.select(vars, {format: ([variable, subVars]) => `${subVars.get("estimate").label} (${variable})`})
)});
  main.variable(null).define("selVar", ["Generators", "viewof selVar"], (G, _) => G.input(_));
  main.variable(observer("chart")).define("chart", ["d3","legend","color","data","topojson","us","path","states","format"], function(d3,legend,color,data,topojson,us,path,states,format)
{
  const svg = d3.create("svg")
      .attr("viewBox", [0, 0, 975, 610]);

  svg.append("g")
      .attr("transform", "translate(580,20)")
      .append(() => legend({color, title: data.title, width: 320, tickFormat:d3.format(".2%")}));

  svg.append("g")
    .selectAll("path")
    .data(topojson.feature(us, us.objects.counties).features)
    .join("path")
      .attr("fill", d => color(data.get(d.id)))
      .attr("d", path)
    .append("title")
      .text(d => `${d.properties.name}, ${states.get(d.id.slice(0, 2)).name}
${format(data.get(d.id))}`);

  svg.append("path")
      .datum(topojson.mesh(us, us.objects.states, (a, b) => a !== b))
      .attr("fill", "none")
      .attr("stroke", "white")
      .attr("stroke-linejoin", "round")
      .attr("d", path);

  return svg.node();
}
);
  main.variable(observer("rawData")).define("rawData", ["variable"], async function(variable)
{
  const raw = await fetch(
    `https://api.census.gov/data/2018/acs/acs5?get=B01001_001E,${variable.name}&for=county:*`
  ).then((r) => r.json());

  const header = raw[0];

  return raw.slice(1).map(d => {
    const ret = {};
    for(const i in header) {
      ret[header[i]] = d[i];
    }
    return ret;
  })
}
);
  main.variable(observer("valueOf")).define("valueOf", ["variable"], function(variable){return(
function valueOf(d) {
  return d[variable.name] / d.B01001_001E;
}
)});
  main.variable(observer("data")).define("data", ["rawData","valueOf"], function(rawData,valueOf){return(
new Map(rawData.map(d=>[`${d.state}${d.county}`, valueOf(d)]))
)});
  main.variable(observer("B01001")).define("B01001", function(){return(
fetch("https://api.census.gov/data/2018/acs/acs5/groups/B01001/").then(r=>r.json())
)});
  main.variable(observer("vars")).define("vars", ["d3","B01001"], function(d3,B01001){return(
d3.rollup
  (Object.entries(B01001.variables).map(d=> ({
    name: d[0],
    ...d[1]
  })),//.sort((a,b)=>d3.ascending(a[0], b[0]))), 
  v => {
    return new Map([
      ["estimate_annotation", v.find(d=>d.name.endsWith("EA"))],
      ["moe_annotation", v.find(d=>d.name.endsWith("MA"))],
      ["moe", v.find(d=>d.name.endsWith("M"))],
      ["estimate", v.find(d=>d.name.endsWith("E"))],
    ])
  },
  d => d.name.substring(0, "B01001_XXX".length))
)});
  main.variable(observer("variable")).define("variable", ["selVar"], function(selVar){return(
fetch(
  `https://api.census.gov/data/2018/acs/acs5/variables/${selVar.get("estimate").name}.json`
).then((r) => r.json())
)});
  main.variable(observer("color")).define("color", ["d3","data"], function(d3,data){return(
d3.scaleQuantize(d3.extent(data.values()), d3.schemeBlues[9])
)});
  main.variable(observer("path")).define("path", ["d3"], function(d3){return(
d3.geoPath()
)});
  main.variable(observer("format")).define("format", function(){return(
d => `${d}%`
)});
  main.variable(observer("states")).define("states", ["us"], function(us){return(
new Map(us.objects.states.geometries.map(d => [d.id, d.properties]))
)});
  main.variable(observer("us")).define("us", ["FileAttachment"], function(FileAttachment){return(
FileAttachment("counties-albers-10m.json").json()
)});
  main.variable(observer("topojson")).define("topojson", ["require"], function(require){return(
require("topojson-client@3")
)});
  const child1 = runtime.module(define1);
  main.import("legend", "legend", child1);
  main.variable(observer()).define(["md"], function(md){return(
md`## Source Code

This is the original source code for this notebook, the \`census-api.ojs\` file.`
)});
  main.variable(observer()).define(["md","FileAttachment"], async function(md,FileAttachment){return(
md`~~~javascript
${(await FileAttachment("source_ojs").text()).replace(/~~~/g, "```")}
~~~`
)});
  main.variable(observer()).define(function(){return(
document.title = "Census API Example / Dataflow"
)});
  return main;
}