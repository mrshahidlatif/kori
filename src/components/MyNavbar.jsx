import React, { Component } from "react";
import { BrowserRouter as Router, Switch, Route, Link } from "react-router-dom";
import css from "./Navbar.module.css";
import { Navbar, Nav, Form, FormControl, Button } from "react-bootstrap";

class MyNavbar extends Component {
  state = {};
  render() {
    return (
      <Navbar bg="dark" variant="dark">
        <Navbar.Brand>Logo</Navbar.Brand>
        <Nav className="mr-auto">
          <Nav.Link href="#editor">
            <Link to="/" className="nav-link">
              Editor
            </Link>
          </Nav.Link>
          <Nav.Link href="#reader">
            <Link to="/reader" className="nav-link">
              Reader
            </Link>
          </Nav.Link>
          <Nav.Link href="#viscreator">
            <Link to="/viscreator" className="nav-link">
              VisCreator
            </Link>
          </Nav.Link>
        </Nav>
      </Navbar>
    );
  }
}

export default MyNavbar;
