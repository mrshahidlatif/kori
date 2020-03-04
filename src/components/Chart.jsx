import React, { Component } from "react";
import { Vega, VegaLite, createClassFromSpec } from "react-vega";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import PropTypes from "prop-types";

class Chart extends Component {
  constructor(props) {
    super(props);
    this.handleView = this.handleView.bind(this);
  }

  state = {
    id: this.props.id,
    specs: this.props.specs,
    data: this.props.data
  };

  handleView(...args) {
    let view = args[0];
    let links = this.props.ui.links;
    if (links != undefined) {
      Object.keys(links).map(function(key) {
        if (links[key].active) {
          var d = {
            hColor: "yellow",
            hData: links[key].text
          };
          view.signal("signal_highlight", d).run();
        }
      });
    }
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
