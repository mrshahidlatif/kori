import React, { Component } from "react";
import css from "./LinkText.module.css";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import PropTypes from "prop-types";
import { addTextLink, activateTextLink, deactivateTextLink } from "../ducks/ui";

class LinkText extends Component {
  constructor(props) {
    super(props);
    this.handleMouseOver = this.handleMouseOver.bind(this);
    this.handleMouseLeave = this.handleMouseLeave.bind(this);
  }
  state = {};
  handleMouseOver() {
    let text = this.props.children[0].props.text;
    text = text.substring(1, text.length);
    this.props.activateTextLink(text);
  }
  handleMouseLeave() {
    let text = this.props.children[0].props.text;
    text = text.substring(1, text.length);
    this.props.deactivateTextLink(text);
  }
  componentDidMount() {
    //TODO: Find a better place to update *link* to store. It only updates first letter of handle
    let text = this.props.children[0].props.text;
    text = text.substring(1, text.length);
    //Types of possible links: point, multipoint, group, range, series
    //TODO: Replace this logic with the suggestion functionality
    //The following logic is just to text various link types for generalizing vega signals
    var data = text;
    var type = "point";
    var chartId = 4;

    if (text == "M") {
      data = ["A", "B"];
      type = "multipoint";
    } else if (text == "R") {
      data = [50, 100];
      type = "range";
    } else if (text == "S") {
      data = 1;
      chartId = 3;
      type = "point";
    }

    let link = {
      linkId: text,
      data: data,
      chartId: chartId,
      active: false,
      type: type
    };
    this.props.addTextLink(link);
  }
  render() {
    return (
      <span
        className={css.linkText}
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
      { addTextLink, activateTextLink, deactivateTextLink },
      dispatch
    )
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(LinkText);
