import React, { Component } from "react";
import ReactDOM from "react-dom";
import { Vega, VegaLite, createClassFromSpec } from "react-vega";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import PropTypes from "prop-types";

class Chart extends Component {
  constructor(props) {
    super(props);
  }
  render() {
    console.log("Store State", this.props.state.text.Charts.barData);
    // return <VegaLite spec={this.spec} data={this.props.state.text.spec.data} />;
    return (
      <VegaLite
        spec={this.props.state.text.Charts.spec}
        data={this.props.state.text.Charts.barData}
      />
    );
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
