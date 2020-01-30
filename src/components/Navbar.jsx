import React, { Component } from "react";
import { BrowserRouter as Router, Switch, Route, Link } from "react-router-dom";
import css from "./Navbar.module.css";

class Navbar extends Component {
  state = {};
  render() {
    return (
      <div>
        <nav>
          <ul className={css.navbar}>
            <li>
              <Link to="/">Editor</Link>
            </li>
            <li>
              <Link to="/viscreator">VisCreator</Link>
            </li>
            <li>
              <Link to="/reader">Reader</Link>
            </li>
          </ul>
        </nav>
      </div>
    );
  }
}

export default Navbar;
