import React, { Component } from "react";
import ReactDOM from "react-dom";
import { Vega, VegaLite, createClassFromSpec } from "react-vega";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import PropTypes from "prop-types";

class Chart extends Component {
  spec = {
    width: 400,
    height: 200,
    padding: { left: 5, right: 5, top: 5, bottom: 5 },

    data: [
      {
        name: "table",
        values: [
          { category: "A", amount: 28 },
          { category: "B", amount: 55 },
          { category: "C", amount: 43 },
          { category: "D", amount: 91 },
          { category: "E", amount: 81 },
          { category: "F", amount: 53 },
          { category: "G", amount: 19 },
          { category: "H", amount: 87 }
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
        range: "width"
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
            x: { scale: "xscale", field: "category", offset: 1 },
            width: { scale: "xscale", band: 1, offset: -1 },
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
            fillOpacity: [{ test: "datum === tooltip", value: 0 }, { value: 1 }]
          }
        }
      }
    ]
  };

  render() {
    console.log("Store State", this.props.state.text.spec);
    return <VegaLite spec={this.spec} data={this.props.state.text.spec.data} />;
  }
}

//Define the public proptypes of this componenet
const mapStateToProps = (state, ownProps) => {
  return { state };
};

const mapDispatchToProps = dispatch => {
  return {
    ...bindActionCreators({}, dispatch)
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Chart);
