export const UPDATE_CHARTS = "UPDATE_CHARTS";

//actions
export const updateCharts = charts => {
  return { type: UPDATE_CHARTS, charts };
};
//reducers

export default (state = initialState, action) => {
  switch (action.type) {
    case UPDATE_CHARTS:
      return action.charts;
    default:
      return state;
  }
};
const initialState = {
  byId: {
    1: {
      type: "bar",
      specs: {
        $schema: "https://vega.github.io/schema/vega/v5.json",
        description:
          "A basic bar chart example, with value labels shown upon mouse hover.",
        width: 200,
        height: 100,
        padding: 5,

        data: [
          {
            name: "table",
            values: [
              { category: "Apple", amount: 28 },
              { category: "Amazon", amount: 55 },
              { category: "Facebook", amount: 43 },
              { category: "Netflix", amount: 91 },
              { category: "Microsoft", amount: 81 },
              { category: "Samsung", amount: 53 },
              { category: "Twitter", amount: 19 },
              { category: "Linkedin", amount: 87 }
            ]
          }
        ],

        signals: [
          {
            name: "tooltip",
            value: {},
            on: [
              { events: "rect:mouseover", update: "datum" },
              { events: "rect:mouseout", update: "{}" }
            ]
          }
        ],

        scales: [
          {
            name: "xscale",
            type: "band",
            domain: { data: "table", field: "category" },
            range: "width",
            padding: 0.05,
            round: true
          },
          {
            name: "yscale",
            domain: { data: "table", field: "amount" },
            nice: true,
            range: "height"
          }
        ],

        axes: [
          { orient: "bottom", scale: "xscale" },
          { orient: "left", scale: "yscale" }
        ],

        marks: [
          {
            type: "rect",
            from: { data: "table" },
            encode: {
              enter: {
                x: { scale: "xscale", field: "category" },
                width: { scale: "xscale", band: 1 },
                y: { scale: "yscale", field: "amount" },
                y2: { scale: "yscale", value: 0 }
              },
              update: {
                fill: { value: "steelblue" }
              },
              hover: {
                fill: { value: "red" }
              }
            }
          },
          {
            type: "text",
            encode: {
              enter: {
                align: { value: "center" },
                baseline: { value: "bottom" },
                fill: { value: "#333" }
              },
              update: {
                x: { scale: "xscale", signal: "tooltip.category", band: 0.5 },
                y: { scale: "yscale", signal: "tooltip.amount", offset: -2 },
                text: { signal: "tooltip.amount" },
                fillOpacity: [
                  { test: "datum === tooltip", value: 0 },
                  { value: 1 }
                ]
              }
            }
          }
        ]
      }
    },
    2: {
      type: "multi-line",
      specs: {
        description: "A basic line chart example.",
        width: 200,
        height: 100,
        padding: 5,

        signals: [
          {
            name: "interpolate",
            value: "linear",
            bind: {
              input: "select",
              options: [
                "basis",
                "cardinal",
                "catmull-rom",
                "linear",
                "monotone",
                "natural",
                "step",
                "step-after",
                "step-before"
              ]
            }
          }
        ],

        data: [
          {
            name: "table",
            values: [
              { x: 0, y: 28, c: 0 },
              { x: 0, y: 20, c: 1 },
              { x: 1, y: 43, c: 0 },
              { x: 1, y: 35, c: 1 },
              { x: 2, y: 81, c: 0 },
              { x: 2, y: 10, c: 1 },
              { x: 3, y: 19, c: 0 },
              { x: 3, y: 15, c: 1 },
              { x: 4, y: 52, c: 0 },
              { x: 4, y: 48, c: 1 },
              { x: 5, y: 24, c: 0 },
              { x: 5, y: 28, c: 1 },
              { x: 6, y: 87, c: 0 },
              { x: 6, y: 66, c: 1 },
              { x: 7, y: 17, c: 0 },
              { x: 7, y: 27, c: 1 },
              { x: 8, y: 68, c: 0 },
              { x: 8, y: 16, c: 1 },
              { x: 9, y: 49, c: 0 },
              { x: 9, y: 25, c: 1 }
            ]
          }
        ],
        scales: [
          {
            name: "x",
            type: "point",
            range: "width",
            domain: { data: "table", field: "x" }
          },
          {
            name: "y",
            type: "linear",
            range: "height",
            nice: true,
            zero: true,
            domain: { data: "table", field: "y" }
          },
          {
            name: "color",
            type: "ordinal",
            range: "category",
            domain: { data: "table", field: "c" }
          }
        ],

        axes: [
          { orient: "bottom", scale: "x" },
          { orient: "left", scale: "y" }
        ],

        marks: [
          {
            type: "group",
            from: {
              facet: {
                name: "series",
                data: "table",
                groupby: "c"
              }
            },
            marks: [
              {
                type: "line",
                from: { data: "series" },
                encode: {
                  enter: {
                    x: { scale: "x", field: "x" },
                    y: { scale: "y", field: "y" },
                    stroke: { scale: "color", field: "c" },
                    strokeWidth: { value: 2 }
                  },
                  update: {
                    interpolate: { signal: "interpolate" },
                    fillOpacity: { value: 1 }
                  },
                  hover: {
                    fillOpacity: { value: 0.5 }
                  }
                }
              }
            ]
          }
        ]
      }
    },
    3: {
      type: "scatter-plot",
      specs: {
        description:
          "A scatter plot example with interactive legend and x-axis.",
        width: 200,
        height: 200,
        padding: 5,
        autosize: "pad",

        signals: [
          {
            name: "clear",
            value: true,
            on: [
              {
                events: "mouseup[!event.item]",
                update: "true",
                force: true
              }
            ]
          },
          {
            name: "shift",
            value: false,
            on: [
              {
                events: "@legendSymbol:click, @legendLabel:click",
                update: "event.shiftKey",
                force: true
              }
            ]
          },
          {
            name: "clicked",
            value: null,
            on: [
              {
                events: "@legendSymbol:click, @legendLabel:click",
                update: "{value: datum.value}",
                force: true
              }
            ]
          },
          {
            name: "brush",
            value: 0,
            on: [
              {
                events: { signal: "clear" },
                update: "clear ? [0, 0] : brush"
              },
              {
                events: "@xaxis:mousedown",
                update: "[x(), x()]"
              },
              {
                events:
                  "[@xaxis:mousedown, window:mouseup] > window:mousemove!",
                update: "[brush[0], clamp(x(), 0, width)]"
              },
              {
                events: { signal: "delta" },
                update:
                  "clampRange([anchor[0] + delta, anchor[1] + delta], 0, width)"
              }
            ]
          },
          {
            name: "anchor",
            value: null,
            on: [{ events: "@brush:mousedown", update: "slice(brush)" }]
          },
          {
            name: "xdown",
            value: 0,
            on: [{ events: "@brush:mousedown", update: "x()" }]
          },
          {
            name: "delta",
            value: 0,
            on: [
              {
                events:
                  "[@brush:mousedown, window:mouseup] > window:mousemove!",
                update: "x() - xdown"
              }
            ]
          },
          {
            name: "domain",
            on: [
              {
                events: { signal: "brush" },
                update: "span(brush) ? invert('x', brush) : null"
              }
            ]
          }
        ],

        data: [
          {
            name: "source",
            url: process.env.PUBLIC_URL + "/datasets/cars.json",
            transform: [
              {
                type: "filter",
                expr:
                  "datum['Horsepower'] != null && datum['Miles_per_Gallon'] != null && datum['Origin'] != null"
              }
            ]
          },
          {
            name: "selected",
            on: [
              { trigger: "clear", remove: true },
              { trigger: "!shift", remove: true },
              { trigger: "!shift && clicked", insert: "clicked" },
              { trigger: "shift && clicked", toggle: "clicked" }
            ]
          }
        ],

        scales: [
          {
            name: "x",
            type: "linear",
            round: true,
            nice: true,
            zero: true,
            domain: { data: "source", field: "Horsepower" },
            range: [0, 200]
          },
          {
            name: "y",
            type: "linear",
            round: true,
            nice: true,
            zero: true,
            domain: { data: "source", field: "Miles_per_Gallon" },
            range: [200, 0]
          },
          {
            name: "color",
            type: "ordinal",
            range: { scheme: "category10" },
            domain: { data: "source", field: "Origin" }
          }
        ],

        axes: [
          {
            scale: "x",
            grid: true,
            domain: false,
            orient: "bottom",
            tickCount: 5,
            title: "Horsepower"
          },
          {
            scale: "y",
            grid: true,
            domain: false,
            orient: "left",
            titlePadding: 5,
            title: "Miles_per_Gallon"
          }
        ],

        legends: [
          {
            stroke: "color",
            title: "Origin",
            encode: {
              symbols: {
                name: "legendSymbol",
                interactive: true,
                update: {
                  fill: { value: "transparent" },
                  strokeWidth: { value: 2 },
                  opacity: [
                    {
                      test:
                        "!length(data('selected')) || indata('selected', 'value', datum.value)",
                      value: 0.7
                    },
                    { value: 0.15 }
                  ],
                  size: { value: 64 }
                }
              },
              labels: {
                name: "legendLabel",
                interactive: true,
                update: {
                  opacity: [
                    {
                      test:
                        "!length(data('selected')) || indata('selected', 'value', datum.value)",
                      value: 1
                    },
                    { value: 0.25 }
                  ]
                }
              }
            }
          }
        ],

        marks: [
          {
            type: "rect",
            name: "xaxis",
            interactive: true,
            encode: {
              enter: {
                x: { value: 0 },
                height: { value: 35 },
                fill: { value: "transparent" },
                cursor: { value: "ew-resize" }
              },
              update: {
                y: { signal: "height" },
                width: { signal: "span(range('x'))" }
              }
            }
          },
          {
            type: "rect",
            interactive: false,
            encode: {
              enter: {
                y: { value: 0 },
                height: { signal: "height" },
                fill: { value: "#ddd" }
              },
              update: {
                x: { signal: "brush[0]" },
                x2: { signal: "brush[1]" },
                fillOpacity: { signal: "domain ? 0.2 : 0" }
              }
            }
          },
          {
            name: "marks",
            type: "symbol",
            from: { data: "source" },
            interactive: false,
            encode: {
              update: {
                x: { scale: "x", field: "Horsepower" },
                y: { scale: "y", field: "Miles_per_Gallon" },
                shape: { value: "circle" },
                strokeWidth: { value: 2 },
                opacity: [
                  {
                    test:
                      "(!domain || inrange(datum.Horsepower, domain)) && (!length(data('selected')) || indata('selected', 'value', datum.Origin))",
                    value: 0.7
                  },
                  { value: 0.15 }
                ],
                stroke: [
                  {
                    test:
                      "(!domain || inrange(datum.Horsepower, domain)) && (!length(data('selected')) || indata('selected', 'value', datum.Origin))",
                    scale: "color",
                    field: "Origin"
                  },
                  { value: "#ccc" }
                ],
                fill: { value: "transparent" }
              }
            }
          },
          {
            type: "rect",
            name: "brush",
            encode: {
              enter: {
                y: { value: 0 },
                height: { signal: "height" },
                fill: { value: "transparent" }
              },
              update: {
                x: { signal: "brush[0]" },
                x2: { signal: "brush[1]" }
              }
            }
          },
          {
            type: "rect",
            interactive: false,
            encode: {
              enter: {
                y: { value: 0 },
                height: { signal: "height" },
                width: { value: 1 },
                fill: { value: "firebrick" }
              },
              update: {
                fillOpacity: { signal: "domain ? 1 : 0" },
                x: { signal: "brush[0]" }
              }
            }
          },
          {
            type: "rect",
            interactive: false,
            encode: {
              enter: {
                y: { value: 0 },
                height: { signal: "height" },
                width: { value: 1 },
                fill: { value: "firebrick" }
              },
              update: {
                fillOpacity: { signal: "domain ? 1 : 0" },
                x: { signal: "brush[1]" }
              }
            }
          }
        ]
      }
    },
    4: {
      type: "map",
      specs: {
        description:
          "A choropleth map depicting U.S. unemployment rates by county in 2009.",
        width: 200,
        height: 200,
        autosize: "none",

        data: [
          {
            name: "unemp",
            url: process.env.PUBLIC_URL + "datasets/unemployment.tsv",
            format: { type: "tsv", parse: "auto" }
          },
          {
            name: "counties",
            url: process.env.PUBLIC_URL + "datasets/us-10m.json",
            format: { type: "topojson", feature: "counties" },
            transform: [
              {
                type: "lookup",
                from: "unemp",
                key: "id",
                fields: ["id"],
                values: ["rate"]
              },
              { type: "filter", expr: "datum.rate != null" }
            ]
          }
        ],

        projections: [
          {
            name: "projection",
            type: "albersUsa"
          }
        ],

        scales: [
          {
            name: "color",
            type: "quantize",
            domain: [0, 0.15],
            range: { scheme: "blues", count: 7 }
          }
        ],

        legends: [
          {
            fill: "color",
            orient: "bottom-right",
            title: "Unemployment",
            format: "0.1%"
          }
        ],

        marks: [
          {
            type: "shape",
            from: { data: "counties" },
            encode: {
              enter: { tooltip: { signal: "format(datum.rate, '0.1%')" } },
              update: { fill: { scale: "color", field: "rate" } },
              hover: { fill: { value: "red" } }
            },
            transform: [{ type: "geoshape", projection: "projection" }]
          }
        ]
      }
    },
    5: {
      type: "stack-bar",
      specs: {
        $schema: "https://vega.github.io/schema/vega/v5.json",
        description: "A basic stacked bar chart example.",
        width: 200,
        height: 100,
        padding: 5,

        data: [
          {
            name: "table",
            values: [
              { x: 0, y: 28, c: 0 },
              { x: 0, y: 55, c: 1 },
              { x: 1, y: 43, c: 0 },
              { x: 1, y: 91, c: 1 },
              { x: 2, y: 81, c: 0 },
              { x: 2, y: 53, c: 1 },
              { x: 3, y: 19, c: 0 },
              { x: 3, y: 87, c: 1 },
              { x: 4, y: 52, c: 0 },
              { x: 4, y: 48, c: 1 },
              { x: 5, y: 24, c: 0 },
              { x: 5, y: 49, c: 1 },
              { x: 6, y: 87, c: 0 },
              { x: 6, y: 66, c: 1 },
              { x: 7, y: 17, c: 0 },
              { x: 7, y: 27, c: 1 },
              { x: 8, y: 68, c: 0 },
              { x: 8, y: 16, c: 1 },
              { x: 9, y: 49, c: 0 },
              { x: 9, y: 15, c: 1 }
            ],
            transform: [
              {
                type: "stack",
                groupby: ["x"],
                sort: { field: "c" },
                field: "y"
              }
            ]
          }
        ],

        scales: [
          {
            name: "x",
            type: "band",
            range: "width",
            domain: { data: "table", field: "x" }
          },
          {
            name: "y",
            type: "linear",
            range: "height",
            nice: true,
            zero: true,
            domain: { data: "table", field: "y1" }
          },
          {
            name: "color",
            type: "ordinal",
            range: "category",
            domain: { data: "table", field: "c" }
          }
        ],

        axes: [
          { orient: "bottom", scale: "x", zindex: 1 },
          { orient: "left", scale: "y", zindex: 1 }
        ],

        marks: [
          {
            type: "rect",
            from: { data: "table" },
            encode: {
              enter: {
                x: { scale: "x", field: "x" },
                width: { scale: "x", band: 1, offset: -1 },
                y: { scale: "y", field: "y0" },
                y2: { scale: "y", field: "y1" },
                fill: { scale: "color", field: "c" }
              },
              update: {
                fillOpacity: { value: 1 }
              },
              hover: {
                fillOpacity: { value: 0.5 }
              }
            }
          }
        ]
      }
    },
    6: {
      type: "multi-line",
      specs: {
        $schema: "https://vega.github.io/schema/vega/v5.json",
        width: 200,
        height: 150,
        padding: 5,
        autosize: { type: "fit", contains: "padding" },

        signals: [
          {
            name: "indexDate",
            update: "time('Jan 1 2005')",
            on: [
              {
                events: "mousemove",
                update: "invert('x', clamp(x(), 0, width))"
              }
            ]
          },
          {
            name: "maxDate",
            update: "time('Mar 1 2010')"
          }
        ],

        data: [
          {
            name: "stocks",
            url: process.env.PUBLIC_URL + "datasets/stocks.csv",
            format: {
              type: "csv",
              parse: { price: "number", date: "date" }
            }
          },
          {
            name: "index",
            source: "stocks",
            transform: [
              {
                type: "filter",
                expr:
                  "month(datum.date) == month(indexDate) && year(datum.date) == year(indexDate)"
              }
            ]
          },
          {
            name: "indexed_stocks",
            source: "stocks",
            transform: [
              {
                type: "lookup",
                from: "index",
                key: "symbol",
                fields: ["symbol"],
                as: ["index"],
                default: { price: 0 }
              },
              {
                type: "formula",
                as: "indexed_price",
                expr:
                  "datum.index.price > 0 ? (datum.price - datum.index.price)/datum.index.price : 0"
              }
            ]
          }
        ],

        scales: [
          {
            name: "x",
            type: "time",
            domain: { data: "stocks", field: "date" },
            range: "width"
          },
          {
            name: "y",
            type: "linear",
            domain: { data: "indexed_stocks", field: "indexed_price" },
            nice: true,
            zero: true,
            range: "height"
          },
          {
            name: "color",
            type: "ordinal",
            range: "category",
            domain: { data: "stocks", field: "symbol" }
          }
        ],

        axes: [{ orient: "left", scale: "y", grid: true, format: "%" }],

        marks: [
          {
            type: "group",
            from: {
              facet: {
                name: "series",
                data: "indexed_stocks",
                groupby: "symbol"
              }
            },
            data: [
              {
                name: "label",
                source: "series",
                transform: [{ type: "filter", expr: "datum.date == maxDate" }]
              }
            ],
            marks: [
              {
                type: "line",
                from: { data: "series" },
                encode: {
                  update: {
                    x: { scale: "x", field: "date" },
                    y: { scale: "y", field: "indexed_price" },
                    stroke: { scale: "color", field: "symbol" },
                    strokeWidth: { value: 2 }
                  }
                }
              },
              {
                type: "text",
                from: { data: "label" },
                encode: {
                  update: {
                    x: { scale: "x", field: "date", offset: 2 },
                    y: { scale: "y", field: "indexed_price" },
                    fill: { scale: "color", field: "symbol" },
                    text: { field: "symbol" },
                    baseline: { value: "middle" }
                  }
                }
              }
            ]
          },
          {
            type: "rule",
            encode: {
              update: {
                x: { field: { group: "x" } },
                x2: { field: { group: "width" } },
                y: {
                  value: 0.5,
                  offset: { scale: "y", value: 0, round: true }
                },
                stroke: { value: "black" },
                strokeWidth: { value: 1 }
              }
            }
          },
          {
            type: "rule",
            encode: {
              update: {
                x: { scale: "x", signal: "indexDate", offset: 0.5 },
                y: { value: 0 },
                y2: { field: { group: "height" } },
                stroke: { value: "firebrick" }
              }
            }
          },
          {
            type: "text",
            encode: {
              update: {
                x: { scale: "x", signal: "indexDate" },
                y2: { field: { group: "height" }, offset: 15 },
                align: { value: "center" },
                text: { signal: "timeFormat(indexDate, '%b %Y')" },
                fill: { value: "firebrick" }
              }
            }
          }
        ]
      }
    }
  },
  allIds: [1, 2, 3, 4, 5, 6]
};
