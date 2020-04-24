import React from "react";
import { useDispatch } from "react-redux";
import css from "./index.module.css";
import { activateLink, deactivateLink } from "ducks/links";

export default function Link(props) {
  const dispatch = useDispatch();

  function handleMouseOver() {
    const link = props.contentState.getEntity(props.entityKey).getData();
    dispatch(activateLink(link.id));
  }
  function handleMouseLeave() {
    // let text = props.children[0].props.text;
    const link = props.contentState.getEntity(props.entityKey).getData();
    deactivateLink(link.id);
    dispatch(deactivateLink(link.id));
  }

  return (
    <span
      className={css.link}
      onMouseOver={handleMouseOver}
      onMouseLeave={handleMouseLeave}
      data-offset-key={props.offsetKey}
    >
      {props.children}
    </span>
  );
}
