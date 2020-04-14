import React from "react";
import Navbar from "components/Navbar";
import Home from 'components/Home';
import Docs from 'components/Docs';
import View from 'components/View';
import Edit from 'components/Edit';
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import Container from '@material-ui/core/Container';

function App() {
  return (
    <Router>
      <Navbar />
      <Container maxWidth="lg" mt={2}>
        <Switch>
          <Route path="/docs/:docId/view">
            <View />
          </Route>
          <Route path="/docs/:docId">
            <Edit />
          </Route>
          <Route path="/docs">
            <Docs />
          </Route>
          <Route path="/">
            <Home />
          </Route>
          
        </Switch>
      </Container>
    </Router>
  );
}

export default App;
