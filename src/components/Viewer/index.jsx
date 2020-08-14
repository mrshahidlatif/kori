import React, { Fragment, useState, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { EditorState, RichUtils, convertFromRaw } from "draft-js";

import DraftEditor from "draft-js-plugins-editor";

import css from "./index.module.css";

import { EditorPlugins } from "components/EditorToolbar";
import editorDecorators from "utils/editorDecorators";

export default function Viewer(props) {
    const dispatch = useDispatch();
    let { docId } = useParams();
    const doc = useSelector((state) => state.docs[docId]);

    const storedEditorState = useSelector((state) => state.docs[docId].editorRawState);
    const editorEl = useRef(null); //https://reactjs.org/docs/hooks-reference.html#useref

    const contentState =
        storedEditorState === null
            ? EditorState.createEmpty().getCurrentContent()
            : convertFromRaw(storedEditorState);
    const [editorState, setEditorState] = useState(EditorState.createWithContent(contentState));

    //Disabling edit functions in view mode!
    const viewMode = props.viewMode;

    function handleEditorChange(editorState) {
        setEditorState(editorState);
    }

    function handleKeyCommand(command) {
        // handle common key bindings (e.g., bold, italic, etc.)
        const newEditorState = RichUtils.handleKeyCommand(editorState, command);
        if (newEditorState) {
            setEditorState(newEditorState);
            return "handled";
        }
        return "not-handled";
    }

    return (
        <Fragment>
            <div className={css.viewer}>
                <DraftEditor
                    editorState={editorState}
                    plugins={EditorPlugins}
                    onChange={handleEditorChange}
                    handleKeyCommand={handleKeyCommand}
                    decorators={editorDecorators}
                    ref={editorEl}
                    readOnly={viewMode}
                />
            </div>
        </Fragment>
    );
}
