import React, { Component } from "react";
import ReactDOM from "react-dom";
import { Vega, VegaLite, createClassFromSpec } from "react-vega";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import PropTypes from "prop-types";

const spec = {
  width: 400,
  height: 200,
  mark: "bar",
  encoding: {
    x: { field: "a", type: "ordinal" },
    y: { field: "b", type: "quantitative" }
  },
  data: { name: "table" } // note: vega-lite data attribute is a plain object instead of an array
};

const barData = {
  table: [
    { a: "A", b: 28 },
    { a: "B", b: 55 },
    { a: "C", b: 43 },
    { a: "D", b: 91 },
    { a: "E", b: 81 },
    { a: "F", b: 53 },
    { a: "G", b: 19 },
    { a: "H", b: 87 },
    { a: "I", b: 52 }
  ]
};

class Chart extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    console.log("Store Chart Data", this.props.state.text.Charts.barData);
    // return <VegaLite spec={this.spec} data={this.props.state.text.spec.data} />;
    return <VegaLite spec={spec} data={barData} />;
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
