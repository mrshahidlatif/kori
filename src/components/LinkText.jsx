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
    let text = this.props.children[0].props.text;
    text = text.substring(1, text.length);
    let link = { text: text, chartId: 4, active: false };
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
