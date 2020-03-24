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
    specs: this.props.specs
  };
  componentWillReceiveProps(nextProps) {
    //TODO: add a deactivating link mechanism! Look if this code belongs here in the react documentation
    let { links, chartsInEditor } = nextProps;
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
                this.view
              );
            }
          });
        }
      }, this);
    }
    //Defining signal for clearing the highlight
    // this.view.signal("signal_highlight", []).run();
  }
  shouldComponentUpdate(nextProps, nextState) {
    //Never update the chart once it's rendered
    return false;
  }
  handleView(...args) {
    this.view = args[0];
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
