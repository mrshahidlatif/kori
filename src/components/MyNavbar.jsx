import React, { Component } from "react";
import { BrowserRouter as Router, Switch, Route, Link } from "react-router-dom";
import css from "./Navbar.module.css";
import { Navbar, Nav } from "react-bootstrap";

class MyNavbar extends Component {
  state = {};
  render() {
    return (
      <Navbar bg="dark" variant="dark">
        <Navbar.Brand>Logo</Navbar.Brand>
        <Nav className="mr-auto">
          <Nav.Link as={Link} to="/">
            Editor
          </Nav.Link>
          <Nav.Link as={Link} to="/reader">
            Reader
          </Nav.Link>
          <Nav.Link as={Link} to="/viscreator">
            VisCreator
          </Nav.Link>
        </Nav>
      </Navbar>
    );
  }
}

export default MyNavbar;
