import React from "react";
import { useSelector, useDispatch } from "react-redux";
import css from "./index.module.css";
import { activateLink, deactivateLink } from "ducks/links";
import { setSelectedLink } from "ducks/ui";

export default function Link(props) {
    const dispatch = useDispatch();
    const links = useSelector((state) => state.links);

    let style = css.potentialLink;
    const link = props.contentState.getEntity(props.entityKey).getData();
    if (links[link.id]) {
        if (links[link.id].isConfirmed) style = css.link;
    }

    function handleMouseOver() {
        const link = props.contentState.getEntity(props.entityKey).getData();
        if (links[link.id].isConfirmed) dispatch(activateLink(link.id));
    }
    function handleMouseLeave() {
        // let text = props.children[0].props.text;
        const link = props.contentState.getEntity(props.entityKey).getData();
        deactivateLink(link.id);
        dispatch(deactivateLink(link.id));
    }
    function handleClick() {
        const link = props.contentState.getEntity(props.entityKey).getData();
        dispatch(setSelectedLink(link));
    }

    return (
        <span
            className={style}
            onMouseOver={handleMouseOver}
            onMouseLeave={handleMouseLeave}
            onClick={handleClick}
            data-offset-key={props.offsetKey}
        >
            {props.children}
        </span>
    );
}
