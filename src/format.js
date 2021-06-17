const prettier = require("@observablehq/prettier");
const {ModuleParser} = require("@observablehq/parser");
const {readFileSync, writeFileSync} = require("rw").dash;

// this was not fun to figure out :(
function prettify(source) {
  return prettier.format(source, 
  {
    parser: "dataflow",
    semi: true,
    singleQuote: true,
    embeddedLanguageFormatting: "off", 
    plugins: [
      {
        parsers: {
          dataflow: {
            astFormat: "estree",
            locStart: (e) => e.start,
            locEnd: (e) => e.end,
            parse: (src) => {
              const comments = [];
              const tokens = [];
              const program = ModuleParser.parse(src, {
                onComment: comments,
                onToken: tokens,
                ranges: true,
                allowAwaitOutsideFunction: true,
                allowReturnOutsideFunction: true,
                allowImportExportEverywhere: true
              });
              return {
                ...program,
                type: "Program",
                body: program.cells
              };
            }
          }
        }
      }
    ]
  })
}

// let body = [shouldAddParens ? "(" : "", path.call(print, "body"), shouldAddParens ? ")" : "", n.body.type === "Identifier" ? ";" : ""];
function prettifyX(source) {
  return prettier.format(source, {
    semi: true,
    singleQuote: true,
    embeddedLanguageFormatting: "off", 
    parser(text) {
      const ast = ModuleParser.parse(text);
      return {
        ...ast,
        body: ast.cells
      };
    },
  });
}
function format(inFile, options) {
  const {write=false} = options;
  const src = readFileSync(inFile, "utf8");
  const formatted = prettifyX(src);
  if(write) {
    writeFileSync(inFile, formatted, "utf8");
  }
  else {
    console.log(formatted);
  }
}

module.exports = {
  format
}