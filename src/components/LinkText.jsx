import React, { Component } from "react";
import css from "./LinkText.module.css";
class LinkText extends Component {
  constructor(props) {
    super(props);
  }
  state = {};
  handleHover() {
    alert("You hover over me!");
  }
  render() {
    return (
      <span
        className={css.linkText}
        onMouseOver={this.handleHover}
        data-offset-key={this.props.offsetKey}
      >
        {this.props.children}
      </span>
    );
  }
}

export default LinkText;
