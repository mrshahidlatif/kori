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
    if (this.props.ui.links != undefined) {
      let links = this.props.ui.links;
      Object.keys(links).map(function(key) {
        if (links[key].active) {
          var d = {
            hColor: "yellow",
            hData: links[key].data
          };
          this.props.ui.chartsInEditor.map(c => {
            if (c == this.state.id)
              this.sendSignalToChart(
                "signal_highlight",
                links[key].type,
                d,
                view
              );
          });
        }
      }, this);
    }
    //enlarging the charts that have been added to Editor
    //TODO: Find a way to make a new copy of the chart that is in the editor. It should have a different ID than the one in VisPanel
    // this.props.ui.chartsInEditor.map(c => {
    //   if (c == this.state.id) this.enlargeChart(c, view);
    // });
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
  enlargeChart(chart, view) {
    //TODO: Fix it. Not running properly. It has something to do with copy of chart in editor
    view.width(300).run();
    view.height(150).run();
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
