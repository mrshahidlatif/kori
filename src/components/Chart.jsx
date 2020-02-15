import React, { Component } from "react";
import { Vega, VegaLite, createClassFromSpec } from "react-vega";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import PropTypes from "prop-types";
import { updateSelectedChart } from "../ducks/chart";

class Chart extends Component {
  constructor(props) {
    super(props);
  }
  state = {
    id: this.props.id,
    specs: this.props.specs,
    data: this.props.data
  };

  handleClick = () => {
    this.props.updateSelectedChart(this.state.id);
  };

  render() {
    //This is a hack. Find a better solution!
    const Cspecs = JSON.parse(JSON.stringify(this.props.specs));
    const Cdata = JSON.parse(JSON.stringify(this.props.data));
    console.log("Cspecs", Cspecs);

    return (
      <div onClick={this.handleClick}>
        <VegaLite spec={Cspecs} data={Cdata} />
      </div>
    );
  }
}

//Define the public proptypes of this componenet
const mapStateToProps = (state, ownProps) => {
  return state;
};

const mapDispatchToProps = dispatch => {
  return {
    ...bindActionCreators({ updateSelectedChart }, dispatch)
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Chart);
// export default Chart;
