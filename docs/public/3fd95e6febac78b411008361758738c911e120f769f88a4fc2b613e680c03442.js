export default function define(runtime, observer) {
  const main = runtime.module();
  const fileAttachments = new Map([["package.json", new URL("./files/07c7efa5960047485a11d3228623db0f6125fba22cda82c755cdcbdb9a4523ef", import.meta.url)],["intro", new URL("./files/ebf7fe751e259fab0a9d8c409a2fdb3b84a1e0bc8c62d8843fccc6dc8a2c5804", import.meta.url)],["quickstart", new URL("./files/194191aba20477a10d788f3f66d2064273eabcef6aa5db67cd87ea6018be435b", import.meta.url)],["stdlib", new URL("./files/2b67ac41462ee03b1e174b5dc6bc8a09656aea41a67b76b6c11dc3ddc4694386", import.meta.url)],["file", null],["importing", new URL("./files/13cd00ea80e57d2548fc68f9422f58eadf4f7d220de567fc27c722986640b9f8", import.meta.url)],["secrets", new URL("./files/1b8db0a823ef91ea1cd9f388932e6a44380c650520dbd757a586d13b4bc36076", import.meta.url)],["production", new URL("./files/66f02ffdef97f9468cb8032042015126ab0d8ad9cad741cba2b77e275f416e40", import.meta.url)],["compiling", new URL("./files/6a6be1bca323bc2c0bdd9c092859363c2d7957e574f88d42deeb72562ce81fd4", import.meta.url)],["reference", new URL("./files/6bfe6dcaacc6f4bee0d845f9dff93ebc2fd5f9504c9a89cdfe37928627ae9882", import.meta.url)]]);
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
  main.variable(observer("files")).define("files", ["FileAttachment"], function(FileAttachment)
{
  FileAttachment("intro");
  FileAttachment("quickstart");
  FileAttachment("stdlib");
  FileAttachment("file");
  FileAttachment("importing");
  FileAttachment("secrets");
  FileAttachment("production");
  FileAttachment("compiling");
  FileAttachment("reference");
}
);
  main.variable(observer("introFile")).define("introFile", ["LiveFileAttachment"], function(LiveFileAttachment){return(
LiveFileAttachment("intro")
)});
  main.variable(observer("introText")).define("introText", ["introFile"], function(introFile){return(
introFile.text()
)});
  main.variable(observer("intro")).define("intro", ["md","introText"], function(md,introText){return(
() => md([introText])
)});
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