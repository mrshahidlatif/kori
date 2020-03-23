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
    shouldUpdate: this.props.shouldUpdate
  };

  shouldComponentUpdate(nextProps, nextState) {
    return this.state.shouldUpdate;
  }
  handleView(...args) {
    let view = args[0];
    let { links, chartsInEditor } = this.props;
    if (links !== undefined) {
      Object.keys(links).map(function(key) {
        if (links[key].active) {
          var d = {
            data: links[key].data
          };
          chartsInEditor.map(c => {
            if (c === this.state.id) {
              this.sendSignalToChart(
                "signal_highlight",
                links[key].type,
                d,
                view
              );
            }
          });
        }
      }, this);
    }
    return view;
  }
  sendSignalToChart(signalName, signalType, signalData, view) {
    switch (signalType) {
      case "point":
        view.signal(signalName, signalData).run();
      case "multipoint":
        view.signal(signalName, signalData).run();
      case "range":
        view.signal(signalName, signalData).run();
    }
  }
  render() {
    const Cspecs = JSON.parse(JSON.stringify(this.props.specs));
    const Cdata = JSON.parse(JSON.stringify(this.props.specs.data));
    return <Vega spec={Cspecs} data={Cdata} onNewView={this.handleView} />;
  }
}

//Define the public proptypes of this componenet
const mapStateToProps = (state, ownProps) => {
  return { links: state.ui.links, chartsInEditor: state.ui.chartsInEditor };
};

const mapDispatchToProps = dispatch => {
  return {
    ...bindActionCreators({}, dispatch)
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Chart);
// export default Chart;
