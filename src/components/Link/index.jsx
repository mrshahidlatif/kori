import React from "react";
import { useSelector, useDispatch } from "react-redux";
import css from "./index.module.css";
import { activateLink, deactivateLink, updateLink } from "ducks/links";
import { setSelectedLink, setLinkActiveNoAutoTrigger } from "ducks/ui";

export default function Link(props) {
    const dispatch = useDispatch();
    const links = useSelector((state) => state.links);

    let style = css.potentialLink;
    const link = props.contentState.getEntity(props.entityKey).getData();
    if (links[link.id]) {
        if (links[link.id].isConfirmed) style = css.link;
    }

    function handleMouseOver() {
        // if (links[link.id].isConfirmed)
        dispatch(activateLink(link.id));
        dispatch(setLinkActiveNoAutoTrigger(true));
    }
    function handleMouseLeave() {
        deactivateLink(link.id);
        dispatch(deactivateLink(link.id));
        dispatch(setLinkActiveNoAutoTrigger(false));
    }
    function handleClick() {
        //Quick and dirty fix! //TODO: Check later
        //TODO: only store ID of link in editor.
        const updatedLink = JSON.parse(JSON.stringify(link));
        updatedLink.startIndex = props.start;
        updatedLink.endIndex = props.end;
        dispatch(setSelectedLink(updatedLink));
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
