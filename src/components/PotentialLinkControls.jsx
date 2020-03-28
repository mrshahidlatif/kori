import React, { Component } from "react";
import css from "./PotentialLinkControls.module.css";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import PropTypes from "prop-types";
import deactivatePotentialLinkControls from "../ducks/ui";

class PotentialLinkControls extends Component {
  constructor(props) {
    super(props);
    this.handleClick = this.handleClick.bind(this);
  }
  state = {};
  // callbackPotentialLinkControlsFunction = flag => {};
  handleClick() {
    // this.props.deactivatePotentialLinkControls();
  }
  render() {
    let position = this.props.position;
    let { showControls } = this.props;
    if (showControls) {
      return (
        <div
          style={{
            left: position === undefined ? 0 : position.x,
            top: position === undefined ? 0 : position.y
          }}
          onClick={this.handleClick}
          className={css.potentialLinkControls}
        >
          <div className="btn-group mr-2" role="group" aria-label="First group">
            <button type="button" className="btn btn-secondary">
              1
            </button>
            <button type="button" className="btn btn-secondary">
              2
            </button>
            <button type="button" className="btn btn-secondary">
              3
            </button>
            <button type="button" className="btn btn-secondary">
              4
            </button>
          </div>
        </div>
      );
    } else return null;
  }
}

//Define the public proptypes of this componenet
const mapStateToProps = (state, ownProps) => {
  return state;
};

const mapDispatchToProps = dispatch => {
  return {
    ...bindActionCreators(
      {
        deactivatePotentialLinkControls
      },
      dispatch
    )
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(PotentialLinkControls);
