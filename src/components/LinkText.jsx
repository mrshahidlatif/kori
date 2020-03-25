//ThisComponent handles the look and feel of text that appears after the user presses @.
//It's functionality has been mostly replaced by 'Link' Component.
import React, { Component } from "react";
import css from "./LinkText.module.css";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import PropTypes from "prop-types";
import {
  activateSuggestions,
  deactivateSuggestions,
  updateFilteredSuggestions
} from "../ducks/ui";

class LinkText extends Component {
  constructor(props) {
    super(props);
  }
  state = {};
  componentWillReceiveProps(nextProps) {
    if (this.props.children !== nextProps.children) {
      let text = nextProps.children[0].props.text;
      text = text.slice(1, text.length);
      let filteredSuggestions = filterArray(
        this.props.ui.suggestions.listOfSuggestions,
        text
      );
      this.props.updateFilteredSuggestions(filteredSuggestions);
    }
  }
  componentDidMount() {
    let text = this.props.children[0].props.text;
    text = text.slice(1, text.length);
    let filteredSuggestions = filterArray(
      this.props.ui.suggestions.listOfSuggestions,
      text
    );
    this.props.updateFilteredSuggestions(filteredSuggestions);
    //activate the suggestion dropdown as soon as user's text matches a suggestion after pressing @
    this.props.activateSuggestions();
  }
  componentWillUnmount() {
    this.props.deactivateSuggestions();
    //resetting the filtered suggestions for next time!
    this.props.updateFilteredSuggestions([]);
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

const filterArray = (array, text) => {
  var filteredArray = null;
  filteredArray = array.filter(object => {
    const query = text.toLowerCase();
    return object.toLowerCase().startsWith(query);
  });
  return filteredArray;
};

//Define the public proptypes of this componenet
const mapStateToProps = (state, ownProps) => {
  return state;
};

const mapDispatchToProps = dispatch => {
  return {
    ...bindActionCreators(
      {
        activateSuggestions,
        updateFilteredSuggestions,
        deactivateSuggestions
      },
      dispatch
    )
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(LinkText);
