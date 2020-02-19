import React, { Component } from "react";
import css from "./VisPanel.module.css";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import PropTypes from "prop-types";
import Chart from "./Chart";
import { updateCharts } from "../ducks/charts";

class VisPanel extends Component {
  constructor(props) {
    super(props);
  }
  state = {};

  componentDidMount() {
    // this.props.updateCharts(this.props);
  }
  render() {
    var allCharts = this.props.charts.byId;
    return (
      <div>
        <h3>Available Charts</h3>
        {this.props.charts.allIds.map(id => (
          <Chart
            key={id}
            specs={allCharts[id].specs}
            data={allCharts[id].data}
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
  return state.charts;
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
