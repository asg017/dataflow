export default function define(runtime, observer) {
  const main = runtime.module();
  const fileAttachments = new Map([["package.json", new URL("./files/a1a3f1bcecada24e88b5f285e0aa69967406bc880d81d4ba9fdab39be923fb57", import.meta.url)],["intro", null],["quickstart", new URL("./files/8ac975167401d4a3f1a20fdb606e475370e4add5871446615974ab7a728e13e5", import.meta.url)],["stdlib", new URL("./files/810bce42e9e40e466c2341a756f30bebf482f10c0cf230dce89893407391cf89", import.meta.url)],["file-attachments", new URL("./files/e17d2fef09ef58173696facb5b9857b2669d954aeb0f1198011717529ee70b4c", import.meta.url)],["importing", new URL("./files/eb75aeb7fd114a50db65b3763b2b35fd676c64d5eeba5fc7cc5f9eb4a2e1c60d", import.meta.url)],["secrets", new URL("./files/9964525a8aaf4f1e1a5a32685a8639c297ecdf0b7ac5f3093bc3c5709a560a2c", import.meta.url)],["production", new URL("./files/2e23a9f910d8e8fff0ee5f32a30b464dd0a27dcc08e73282cd7f8f68d9a79349", import.meta.url)],["compiling", new URL("./files/5fe1038695da56b5248ee289dc2cf66fc4918ca97dfd7649e886a1bd931df3df", import.meta.url)],["reference", new URL("./files/b70d3e71a1a87aaa614de9d5c309db8acfe1ffc9613f7384dd5dfe9e7b9bb691", import.meta.url)]]);
  main.builtin("FileAttachment", runtime.fileAttachments(name => fileAttachments.get(name)));
  main.variable(observer("nav")).define("nav", ["html","FileAttachment"], async function(html,FileAttachment){return(
html`<nav>
<h1 id=title>Dataflow Documentation</h1>

<span class=version>v${(await FileAttachment("package.json").json()).version}</span>

<a href="https://github.com/asg017/dataflow" style="color: black; ">
  <i class="bx bxl-github" style=" font-weight: 900; font-size: 1.5rem;"></i>
  <span class="gh-label">Github</span>
</a>`
)});
  main.variable(observer("content")).define("content", ["html","toc"], function(html,toc){return(
html`<div class=container>
  ${toc()}
  <article class=content></article>
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
  main.define("initial currentI", ["pageMeta"], function(pageMeta)
{
  const i = pageMeta.findIndex(p=>p.id === window.location.hash.substring(1));

  if(i >=0) return i;
  return 0;
}
);
  main.variable(observer("mutable currentI")).define("mutable currentI", ["Mutable", "initial currentI"], (M, _) => new M(_));
  main.variable(null).define("currentI", ["mutable currentI"], _ => _.generator);
  main.variable(observer("updateContent")).define("updateContent", ["content","pages","currentI","html"], function(content,pages,currentI,html)
{
  const container = content.querySelector("article.content");
  while(container.firstChild) container.removeChild(container.firstChild);
  container.append(pages[currentI]());
  window.scrollTo(0, 0);
  return html`<span>`;
}
);
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
  window.location.hash = pageMeta[currentI].id;
  document.title = `${pageMeta[currentI].header} / Dataflow Documentation`;
  return html`<span>`;
}
);
  main.variable(observer("files")).define("files", ["FileAttachment"], function(FileAttachment)
{
  FileAttachment("intro");
  FileAttachment("quickstart");
  FileAttachment("stdlib");
  FileAttachment("file-attachments");
  FileAttachment("importing");
  FileAttachment("secrets");
  FileAttachment("production");
  FileAttachment("compiling");
  FileAttachment("reference");
}
);
  main.variable(observer("quickstartFile")).define("quickstartFile", ["LiveFileAttachment"], function(LiveFileAttachment){return(
LiveFileAttachment("quickstart")
)});
  main.variable(observer("quickstartText")).define("quickstartText", ["quickstartFile"], function(quickstartFile){return(
quickstartFile.text()
)});
  main.variable(observer("quickstart")).define("quickstart", ["md","quickstartText"], function(md,quickstartText){return(
() => md([quickstartText])
)});
  main.variable(observer("stdlibFile")).define("stdlibFile", ["LiveFileAttachment"], function(LiveFileAttachment){return(
LiveFileAttachment("stdlib")
)});
  main.variable(observer("stdlibText")).define("stdlibText", ["stdlibFile"], function(stdlibFile){return(
stdlibFile.text()
)});
  main.variable(observer("stdlib")).define("stdlib", ["md","stdlibText"], function(md,stdlibText){return(
() => md([stdlibText])
)});
  main.variable(observer("fileattachmentsFile")).define("fileattachmentsFile", ["LiveFileAttachment"], function(LiveFileAttachment){return(
LiveFileAttachment("file-attachments")
)});
  main.variable(observer("fileattachmentsText")).define("fileattachmentsText", ["fileattachmentsFile"], function(fileattachmentsFile){return(
fileattachmentsFile.text()
)});
  main.variable(observer("fileattachments")).define("fileattachments", ["md","fileattachmentsText"], function(md,fileattachmentsText){return(
() => md([fileattachmentsText])
)});
  main.variable(observer("secretsFile")).define("secretsFile", ["LiveFileAttachment"], function(LiveFileAttachment){return(
LiveFileAttachment("secrets")
)});
  main.variable(observer("secretsText")).define("secretsText", ["secretsFile"], function(secretsFile){return(
secretsFile.text()
)});
  main.variable(observer("secrets")).define("secrets", ["md","secretsText"], function(md,secretsText){return(
()=> md([secretsText])
)});
  main.variable(observer("importingFile")).define("importingFile", ["LiveFileAttachment"], function(LiveFileAttachment){return(
LiveFileAttachment("importing")
)});
  main.variable(observer("importingText")).define("importingText", ["importingFile"], function(importingFile){return(
importingFile.text()
)});
  main.variable(observer("importing")).define("importing", ["md","importingText"], function(md,importingText){return(
()=> md([importingText])
)});
  main.variable(observer("compilingFile")).define("compilingFile", ["LiveFileAttachment"], function(LiveFileAttachment){return(
LiveFileAttachment("compiling")
)});
  main.variable(observer("compilingText")).define("compilingText", ["compilingFile"], function(compilingFile){return(
compilingFile.text()
)});
  main.variable(observer("compiling")).define("compiling", ["md","compilingText"], function(md,compilingText){return(
()=> md([compilingText])
)});
  main.variable(observer("productionFile")).define("productionFile", ["LiveFileAttachment"], function(LiveFileAttachment){return(
LiveFileAttachment("production")
)});
  main.variable(observer("productionText")).define("productionText", ["productionFile"], function(productionFile){return(
productionFile.text()
)});
  main.variable(observer("production")).define("production", ["md","productionText"], function(md,productionText){return(
()=> md([productionText])
)});
  main.variable(observer("referenceFile")).define("referenceFile", ["LiveFileAttachment"], function(LiveFileAttachment){return(
LiveFileAttachment("reference")
)});
  main.variable(observer("referenceText")).define("referenceText", ["referenceFile"], function(referenceFile){return(
referenceFile.text()
)});
  main.variable(observer("reference")).define("reference", ["md","referenceText"], function(md,referenceText){return(
() => md([referenceText])
)});
  main.variable(observer("pages")).define("pages", ["quickstart","importing","fileattachments","stdlib","secrets","compiling","production","reference"], function(quickstart,importing,fileattachments,stdlib,secrets,compiling,production,reference){return(
[quickstart, importing,  fileattachments, stdlib, secrets, compiling, production, reference]
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
.gh-label {
  font-size: 1.5rem; 
  line-height: 1.5rem; 
  font-weight: 500;
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

@media (max-width: 700px) {
  .container {
    grid-template-columns: auto;
  }
  .toc-container {
    position: unset;
    height: 400px;
    margin: 0 auto;
    width: 100%;
  }
  .toc {
    border-right: none;
  }
  nav {
    white-space: nowrap;
  }
  .gh-label {
    display: none;
  }
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