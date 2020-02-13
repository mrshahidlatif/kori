import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import * as serviceWorker from "./serviceWorker";
import "bootstrap/dist/css/bootstrap.css";
import "react-quill/dist/quill.snow.css";
import "react-quill/dist/quill.bubble.css";
import "semantic-ui-css/semantic.min.css";

import logger from "redux-logger";
import reduxFreeze from "redux-freeze";

import { Provider } from "react-redux";
import { applyMiddleware, createStore } from "redux";
import rootReducer from "./ducks";
import localforage from "localforage";
import throttle from "./utils/throttle";

let loadData = new Promise((resolve, reject) => {
  localforage
    .getItem("state")
    .then(data => {
      resolve(data);
    })
    .catch(err => {
      reject(err);
    });
});

loadData
  .then(data => {
    let middleware = [reduxFreeze, logger];
    let store = createStore(
      rootReducer,
      data ? data : {},
      applyMiddleware(...middleware)
    );

    store.subscribe(
      throttle(() => {
        let state = { ...store.getState() };
        localforage.setItem("state", state);
      }, 1000)
    );
    localforage.clear(function(err) {
      // Run this code once the database has been entirely deleted.
      console.log("Database is now empty.");
    });
    ReactDOM.render(
      <Provider store={store}>
        <App />
      </Provider>,
      document.getElementById("root")
    );
  })
  .catch(err => {
    console.log(err);
    ReactDOM.render(
      <div>Failed to initialize data!</div>,
      document.getElementById("root")
    );
  });

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
