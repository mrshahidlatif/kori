import React, { Component } from "react";
import { BrowserRouter as Router, Switch, Route, Link } from "react-router-dom";
import css from "./Navbar.module.css";

class Navbar extends Component {
  state = {};
  render() {
    return (
      <nav className="navbar navbar-expand-md navbar-dark bg-dark">
        <ul className="navbar-nav mr-auto">
          <li className="nav-item active">
            <Link to="/" className="nav-link">
              Editor
            </Link>
          </li>
          <li className="nav-item active">
            <Link to="/viscreator" className="nav-link">
              VisCreator
            </Link>
          </li>
          <li className="nav-item active">
            <Link to="/reader" className="nav-link">
              Reader
            </Link>
          </li>
        </ul>
      </nav>
    );
  }
}

export default Navbar;
