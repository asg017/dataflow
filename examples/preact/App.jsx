import { h, render } from "preact";
import { useEffect, useRef } from "preact/hooks";
import define from "./a.ojs";
import { Runtime, Inspector } from "@observablehq/runtime";

function App() {
  const ref = useRef();
  useEffect(() => {
    if (!ref.current) return;
    const runtime = new Runtime();
    const observer = Inspector.into(ref.current);
    runtime.module(define, observer);
    return () => runtime.dispose();
  }, [ref]);
  return <div ref={ref}>Yolo</div>;
}
render(<App />, document.body);
