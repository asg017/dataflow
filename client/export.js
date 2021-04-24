import { Runtime, Inspector } from "@observablehq/runtime";
import { Library } from "./core";

const runtime = new Runtime(Library());
const main = runtime.module(window.define, Inspector.into(document.body));
