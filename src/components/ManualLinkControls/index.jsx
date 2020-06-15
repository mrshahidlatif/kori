import React from "react";
import css from "./index.module.css";

import { useDispatch, useSelector } from "react-redux";
import Box from "@material-ui/core/Box";
import Button from "@material-ui/core/Button";
import ButtonGroup from "@material-ui/core/ButtonGroup";
import PropTypes from "prop-types";
import { setSelectedLink, setTextSelection } from "ducks/ui";
import { confirmLink, deleteLink } from "ducks/links";

export default function PotentialLinkControls(props) {
    const dispatch = useDispatch();
    const selection = window.getSelection();
    const pos = selection.rangeCount > 0 ? selection.getRangeAt(0).getBoundingClientRect() : null;

    const padding = 10;

    function handleResetClick(event) {
        event.preventDefault();
        event.stopPropagation();
        props.onReset();
    }
    function handleAcceptClick(event) {
        event.preventDefault();
        event.stopPropagation();

        props.onAccept();
        dispatch(setTextSelection(null));
    }
    return pos && props.textSelection ? (
        <Box
            // zIndex="modal"
            // left={pos.x + padding}
            // top={pos.y + padding}
            right={0}
            top={0}
            className={css.panel}
        >
            <ButtonGroup size="small" variant="contained" aria-label="small button group">
                <Button onMouseDown={handleAcceptClick}>Accept</Button>
                <Button onMouseDown={handleResetClick}>Reset</Button>
            </ButtonGroup>
        </Box>
    ) : (
        ""
    );
}

PotentialLinkControls.propTypes = {
    suggestions: PropTypes.array,
    onSelected: PropTypes.func,
};
