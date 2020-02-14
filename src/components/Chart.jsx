import React, { Component } from "react";
import { Vega, VegaLite, createClassFromSpec } from "react-vega";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import PropTypes from "prop-types";

class Chart extends Component {
  constructor(props) {
    super(props);
  }
  state = {
    specs: this.props.specs,
    data: this.props.data
  };

  handleClick = () => {
    console.log("You clicked me!", this.props);
  };

  render() {
    //This is a hack. Find a better solution!
    const Cspecs = JSON.parse(JSON.stringify(this.props.specs));
    const Cdata = JSON.parse(JSON.stringify(this.props.data));

    return (
      <div onClick={this.handleClick}>
        <VegaLite spec={Cspecs} data={Cdata} />
      </div>
    );
  }
}

//Define the public proptypes of this componenet
// const mapStateToProps = (state, ownProps) => {
//   return state.charts;
// };

// const mapDispatchToProps = dispatch => {
//   return {
//     ...bindActionCreators({}, dispatch)
//   };
// };

// export default connect(mapStateToProps, mapDispatchToProps)(Chart);
export default Chart;
