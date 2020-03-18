import React, { Component } from "react";
import css from "./ManualLink.module.css";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import PropTypes from "prop-types";
import {
  addTextLink,
  activateTextLink,
  deactivateTextLink,
  activateSuggestions,
  deactivateSuggestions
} from "../ducks/ui";

class Link extends Component {
  constructor(props) {
    super(props);
    this.handleMouseOver = this.handleMouseOver.bind(this);
    this.handleMouseLeave = this.handleMouseLeave.bind(this);
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
  render() {
    return (
      <span
        className={css.link}
        onMouseOver={this.handleMouseOver}
        onMouseLeave={this.handleMouseLeave}
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
        deactivateSuggestions
      },
      dispatch
    )
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Link);
