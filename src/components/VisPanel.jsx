import React, { Component } from "react";
import css from "./VisPanel.module.css";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import PropTypes from "prop-types";
import Chart from "./Chart";
import { updateCharts } from "../ducks/visPanel";

class VisPanel extends Component {
  constructor(props) {
    super(props);
    this.handleAddChartToEditor = this.handleAddChartToEditor.bind(this);
  }
  state = {
    charts: [
      {
        id: 1,
        specs: {
          width: 100,
          height: 50,
          mark: "bar",
          encoding: {
            x: { field: "a", type: "ordinal" },
            y: { field: "b", type: "quantitative" }
          },
          data: { name: "table" } // note: vega-lite data attribute is a plain object instead of an array
        },
        data: {
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
        }
      },
      {
        id: 2,
        specs: {
          width: 100,
          height: 50,
          mark: "line",
          encoding: {
            x: { field: "a", type: "ordinal" },
            y: { field: "b", type: "quantitative" }
          },
          data: { name: "table" } // note: vega-lite data attribute is a plain object instead of an array
        },
        data: {
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
        }
      }
    ]
  };
  handleAddChartToEditor() {
    console.log("addChartToEditor");
  }
  componentDidMount() {
    this.props.updateCharts(this.state);
  }
  render() {
    return (
      <div>
        <h3>Available Charts</h3>
        {this.state.charts.map(chart => (
          <Chart
            key={chart.id}
            id={chart.id}
            specs={chart.specs}
            data={chart.data}
          />
        ))}
      </div>
    );
  }
}
//Define the public proptypes of this componenet
VisPanel.propTypes = {
  charts: PropTypes.object,
  updateCharts: PropTypes.func
};
const mapStateToProps = (state, ownProps) => {
  return state;
};

const mapDispatchToProps = dispatch => {
  return {
    ...bindActionCreators(
      {
        updateCharts
      },
      dispatch
    )
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(VisPanel);
