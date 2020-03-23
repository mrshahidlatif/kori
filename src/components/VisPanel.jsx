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
    //TODO: Should not send a function to the redux store!
    // console.log("Vis Panel Props:", this.props);
    // this.props.updateCharts(this.props);
  }
  render() {
    var allCharts = this.props.byId;
    return (
      <div>
        <h3>Available Charts</h3>
        {this.props.allIds.map(id => (
          <Chart
            key={id}
            id={id}
            specs={allCharts[id].specs}
            shouldUpdate={false}
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
