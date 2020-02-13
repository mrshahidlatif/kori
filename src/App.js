import React from "react";
import Navbar from "./components/Navbar";
import MyEditor from "./components/Editor-Draft";
import VisCreator from "./components/VisCreator";
import Reader from "./components/Reader";
import "bootstrap/dist/css/bootstrap.min.css";
import { BrowserRouter as Router, Switch, Route, Link } from "react-router-dom";

import "./App.css";

function App() {
  return (
    <div>
      <Router>
        <Navbar />
        <main className="container-fluid">
          <Switch>
            <Route path="/viscreator">
              <VisCreator />
            </Route>
            <Route path="/reader">
              <Reader />
            </Route>
            <Route path="/">
              <MyEditor />
            </Route>
          </Switch>
        </main>
      </Router>
    </div>
  );
}

export default App;
