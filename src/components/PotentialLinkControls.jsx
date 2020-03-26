import React, { Component } from "react";
import css from "./PotentialLinkControls.module.css";

class PotentialLinkControls extends Component {
  constructor(props) {
    super(props);
    this.handleClick = this.handleClick.bind(this);
  }
  state = {
    showControls: this.props.showControls,
    position: this.props.position
  };
  sendUpdatedInfoToAutoLink = flag => {
    this.props.PotentialLinkControlsCallback(flag);
  };
  handleClick() {
    this.sendUpdatedInfoToAutoLink(false);
  }
  render() {
    let position = this.state.position;
    return (
      <div
        style={{
          left: position === undefined ? 0 : position.x
          //They y-position is controlled by Draft.js as this is appended as a child of link entity
          // top: position === undefined ? 0 : position.y
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
  }
}

export default PotentialLinkControls;
