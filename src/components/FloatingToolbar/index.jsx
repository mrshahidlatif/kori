import React, { useState, useEffect } from "react";
import css from "./index.module.css";

import { useDispatch } from "react-redux";
import Box from "@material-ui/core/Box";
import Button from "@material-ui/core/Button";
import ButtonGroup from "@material-ui/core/ButtonGroup";

export default function FloatingToolbar(props) {
    const dispatch = useDispatch();
    const selection = window.getSelection();
    const pos = selection.rangeCount > 0 ? selection.getRangeAt(0).getBoundingClientRect() : null;

    const padding = 10;
    const offSet = {
        //TODO: compute offsets so that tooltip is always above and at center of selection!
        x: props.textSelection ? props.textSelection.endIndex - props.textSelection.startIndex : 0,
        y: -35,
    };

    function handleLinkClick(event) {
        event.preventDefault();
        event.stopPropagation();
    }

    return pos && props.textSelection ? (
        <Box
            zIndex="modal"
            left={pos.x + offSet.x}
            top={pos.y + padding + offSet.y}
            className={css.floatingToolbar}
        >
            <ButtonGroup size="small" variant="contained" aria-label="small button group">
                <Button onMouseDown={handleLinkClick}>Vis Link</Button>
                {/* <Button onMouseDown={handleDiscardClick}>Discard</Button> */}
            </ButtonGroup>
        </Box>
    ) : (
        ""
    );
}
