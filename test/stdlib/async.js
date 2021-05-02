window.DATAFLOW_STDLIB = {
  dependency: {
    require: {
      d3v5: (require) => require("d3@5"),
      d3v6: (require) => require("d3@6"),
      _: (require) => require("lodash"),
    },
    svg: {
      logo: (svg) =>
        svg`<svg width=100 height=100>
          <rect width=100 height=100 fill=lightpink></rect>
          <circle cx=50 cy=50 r=40 fill=blue></circle>
          <circle cx=50 cy=50 r=30 fill=green></circle>
          <circle cx=50 cy=50 r=20 fill=red></circle>`,
    },
    d3v6: {
      fakeData: (d3) => d3.range(200),
    },
  },
};
