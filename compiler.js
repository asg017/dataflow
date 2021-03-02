const { parseModule, walk } = require("@observablehq/parser");
const { simple } = require("acorn-walk");

const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;
const GeneratorFunction = Object.getPrototypeOf(function* () {}).constructor;
const AsyncGeneratorFunction = Object.getPrototypeOf(async function* () {})
  .constructor;

const setupRegularCell = (cell) => {
  let name = null;
  if (cell.id && cell.id.name) name = cell.id.name;
  else if (cell.id && cell.id.id && cell.id.id.name) name = cell.id.id.name;
  let bodyText = cell.input.substring(cell.body.start, cell.body.end);
  const cellReferences = (cell.references || []).map((ref) => {
    if (ref.type === "ViewExpression") {
      return "viewof " + ref.id.name;
    } else if (ref.type === "MutableExpression") {
      return "mutable " + ref.id.name;
    } else return ref.name;
  });
  let $count = 0;
  let indexShift = 0;
  const references = (cell.references || []).map((ref) => {
    if (ref.type === "ViewExpression") {
      const $string = "$" + $count;
      $count++;
      // replace "viewof X" in bodyText with "$($count)"
      simple(
        cell.body,
        {
          ViewExpression(node) {
            const start = node.start - cell.body.start;
            const end = node.end - cell.body.start;
            bodyText =
              bodyText.slice(0, start + indexShift) +
              $string +
              bodyText.slice(end + indexShift);
            indexShift += $string.length - (end - start);
          },
        },
        walk
      );
      return $string;
    } else if (ref.type === "MutableExpression") {
      const $string = "$" + $count;
      const $stringValue = $string + ".value";
      $count++;
      // replace "mutable Y" in bodyText with "$($count).value"
      simple(
        cell.body,
        {
          MutableExpression(node) {
            const start = node.start - cell.body.start;
            const end = node.end - cell.body.start;
            bodyText =
              bodyText.slice(0, start + indexShift) +
              $stringValue +
              bodyText.slice(end + indexShift);
            indexShift += $stringValue.length - (end - start);
          },
        },
        walk
      );
      return $string;
    } else return ref.name;
  });
  return { cellName: name, references, bodyText, cellReferences };
};

const createRegularCellDefintion = (cell) => {
  const { cellName, references, bodyText, cellReferences } = setupRegularCell(
    cell
  );

  let code;
  if (cell.body.type !== "BlockStatement") {
    if (cell.async)
      code = `return (async function(){ return (${bodyText});})()`;
    else code = `return (function(){ return (${bodyText});})()`;
  } else code = bodyText;

  let f;
  if (cell.generator && cell.async)
    f = new AsyncGeneratorFunction(...references, code);
  else if (cell.async) f = new AsyncFunction(...references, code);
  else if (cell.generator) f = new GeneratorFunction(...references, code);
  else f = new Function(...references, code);
  return {
    cellName,
    cellFunction: f.toString(),
    cellReferences,
  };
};

module.exports = {
  parseModule: (contents) => {
    const main = parseModule(contents);
    return main.cells.map(createRegularCellDefintion);
  },
};
