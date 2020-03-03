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
    id: this.props.id,
    specs: this.props.specs,
    data: this.props.data
  };
  handleView(...args) {
    let view = args[0];
    console.log("View Instance!", view.signal("signal_highlight"));
    var d = { hColor: "yellow", hData: ["D", "E"] };
    view.signal("signal_highlight", d).run();
  }

  render() {
    const Cspecs = JSON.parse(JSON.stringify(this.state.specs));
    const Cdata = JSON.parse(JSON.stringify(this.state.data));

    return <Vega spec={Cspecs} data={Cdata} onNewView={this.handleView} />;
  }
}

//Define the public proptypes of this componenet
const mapStateToProps = (state, ownProps) => {
  return state;
};

const mapDispatchToProps = dispatch => {
  return {
    ...bindActionCreators({}, dispatch)
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Chart);
// export default Chart;
