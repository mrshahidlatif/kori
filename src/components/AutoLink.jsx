import React, { Component } from "react";
import css from "./AutoLink.module.css";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import PropTypes from "prop-types";
import getCaretPosition from "../utils/getCaretPosition";
import PotentialLinkControls from "./PotentialLinkControls";
import {
  addTextLink,
  activateTextLink,
  deactivateTextLink,
  activateSuggestions,
  deactivateSuggestions
} from "../ducks/ui";

class AutoLink extends Component {
  constructor(props) {
    super(props);
    this.handleMouseOver = this.handleMouseOver.bind(this);
    this.handleMouseLeave = this.handleMouseLeave.bind(this);
    this.handleMouseDown = this.handleMouseDown.bind(this);
  }
  state = { showPotentialLinkControls: false, caretPosition: undefined };
  callbackFunction = flag => {
    this.setState({ showPotentialLinkControls: flag });
  };
  handleMouseOver() {
    let text = this.props.children[0].props.text;
    this.props.activateTextLink(text);
  }
  handleMouseLeave() {
    let text = this.props.children[0].props.text;
    this.props.deactivateTextLink(text);
  }
  handleMouseDown() {
    const selection = window.getSelection();
    //TODO: Fix the controls positions consistently across all links
    //TODO: also highlight the selected link for which the controls are open!
    this.caretPosition = getCaretPosition(selection);
    this.setState({
      showPotentialLinkControls: true,
      caretPosition: this.caretPosition
    });
  }
  render() {
    let { showPotentialLinkControls } = this.state;
    const renderPotentialLinkControls = () => {
      if (showPotentialLinkControls) {
        return (
          <PotentialLinkControls
            position={this.state.caretPosition}
            showControls={this.showControls}
            PotentialLinkControlsCallback={this.callbackFunction}
          />
        );
      }
    };
    return (
      <React.Fragment>
        <span
          className={css.link}
          onMouseOver={this.handleMouseOver}
          onMouseLeave={this.handleMouseLeave}
          onMouseDown={this.handleMouseDown}
          data-offset-key={this.props.offsetKey}
        >
          {this.props.children}
        </span>
        {renderPotentialLinkControls()}
      </React.Fragment>
    );
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
        addTextLink,
        activateTextLink,
        deactivateTextLink,
        activateSuggestions,
        deactivateSuggestions
      },
      dispatch
    )
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(AutoLink);
