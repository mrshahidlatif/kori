import React, { Component } from "react";
import css from "./AutoLink.module.css";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import PropTypes from "prop-types";
import {
  addTextLink,
  activateTextLink,
  deactivateTextLink,
  activateSuggestions,
  deactivateSuggestions,
  activatePotentialLinkControls,
  updateSelectedPotentialLinkInfo
} from "../ducks/ui";

class AutoLink extends Component {
  constructor(props) {
    super(props);
    this.handleMouseOver = this.handleMouseOver.bind(this);
    this.handleMouseLeave = this.handleMouseLeave.bind(this);
    this.handleMouseDown = this.handleMouseDown.bind(this);
  }
  state = {};
  handleMouseOver() {
    let text = this.props.children[0].props.text;
    this.props.activateTextLink(text);
  }
  handleMouseLeave() {
    let text = this.props.children[0].props.text;
    this.props.deactivateTextLink(text);
  }
  handleMouseDown() {
    this.props.updateSelectedPotentialLinkInfo({
      blockKey: this.props.blockKey,
      start: this.props.start,
      end: this.props.end
    });
  }
  render() {
    return (
      <span
        className={css.link}
        onMouseOver={this.handleMouseOver}
        onMouseLeave={this.handleMouseLeave}
        onMouseDown={this.handleMouseDown}
        data-offset-key={this.props.offsetKey}
      >
        {this.props.children}
      </span>
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
        deactivateSuggestions,
        activatePotentialLinkControls,
        updateSelectedPotentialLinkInfo
      },
      dispatch
    )
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(AutoLink);
