
const { readFileSync } = require("rw").dash;
const { readFile } = require("fs").promises;

function maybeStripShebang(source) {
  if(source.startsWith("#!"))
    return source.substring(source.indexOf("\n")+1)
  
    return source
}

function readSourceCodeSync(path) {
  let source = readFileSync(path, "utf8");
  return maybeStripShebang(source);
}

 async function readSourceCode(path) {
  let source = await readFile(path, "utf8");
  return maybeStripShebang(source)
}

module.exports = {
  readSourceCodeSync,readSourceCode
}
