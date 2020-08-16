import React from "react";
import css from "./index.module.css";

export default function Link(props) {
    return (
        <span className={css.textSelection} data-offset-key={props.offsetKey}>
            {props.children}
        </span>
    );
}
