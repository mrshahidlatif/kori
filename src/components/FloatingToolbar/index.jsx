import React, { useState, useEffect } from "react";
import css from "./index.module.css";

import { useDispatch, useSelector } from "react-redux";
import Box from "@material-ui/core/Box";
import Button from "@material-ui/core/Button";
import ButtonGroup from "@material-ui/core/ButtonGroup";
import PropTypes from "prop-types";
import { setSelectedLink } from "ducks/ui";
import { confirmLink, deleteLink } from "ducks/links";

export default function FloatingToolbar(props) {
    const dispatch = useDispatch();
    const selection = window.getSelection();
    const pos = selection.rangeCount > 0 ? selection.getRangeAt(0).getBoundingClientRect() : null;

    const padding = 10;

    function handleAcceptClick(event) {
        event.preventDefault();
        event.stopPropagation();
    }

    return pos && props.textSelection ? (
        <Box
            zIndex="modal"
            left={pos.x + padding}
            top={pos.y + padding}
            className={css.floatingToolbar}
        >
            <ButtonGroup size="small" variant="contained" aria-label="small button group">
                <Button onMouseDown={handleAcceptClick}>Link</Button>
                {/* <Button onMouseDown={handleDiscardClick}>Discard</Button> */}
            </ButtonGroup>
        </Box>
    ) : (
        ""
    );
}

FloatingToolbar.propTypes = {
    suggestions: PropTypes.array,
    onSelected: PropTypes.func,
};
