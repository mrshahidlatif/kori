import React, { Component } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import "react-quill/dist/quill.bubble.css";
import { updateText } from "../ducks/text";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import PropTypes from "prop-types";

class Editor extends Component {
  constructor(props) {
    super(props);

    this.modules = {
      toolbar: [
        [{ font: [] }],
        [{ size: ["small", false, "large", "huge"] }],
        ["bold", "italic", "underline"],
        [{ list: "ordered" }, { list: "bullet" }],
        [{ align: [] }],
        [{ color: [] }, { background: [] }],
        ["clean"]
      ]
    };

    this.formats = [
      "font",
      "size",
      "bold",
      "italic",
      "underline",
      "list",
      "bullet",
      "align",
      "color",
      "background"
    ];

    this.state = {
      comments: ""
    };

    this.rteChange = this.rteChange.bind(this);
  }
  shouldComponentUpdate(nextProps, nextState) {
    console.log(
      nextProps.text,
      this.props.text,
      nextProps.text == this.props.text
    );

    return nextProps.text == this.props.text;
  }

  rteChange = (content, delta, source, editor) => {
    //console.log(editor.getHTML()); // rich text
    //console.log(editor.getText()); // plain text
    //console.log(editor.getLength()); // number of characters
    this.props.updateText(editor.getText());
  };

  render() {
    console.log(this.props.text);
    return (
      <div>
        <ReactQuill
          theme="snow"
          modules={this.modules}
          formats={this.formats}
          onChange={this.rteChange}
          defaultValue={this.props.text}
        />
      </div>
    );
  }
}

//Define the public proptypes of this componenet
Editor.propTypes = {
  text: PropTypes.string,
  updateText: PropTypes.func
};
const mapStateToProps = (state, ownProps) => {
  return {
    text: state.text
  };
};

const mapDispatchToProps = dispatch => {
  return {
    ...bindActionCreators(
      {
        updateText
      },
      dispatch
    )
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Editor);
