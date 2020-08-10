import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import * as serviceWorker from "./serviceWorker";
import {createLogger} from "redux-logger";
import reduxFreeze from "redux-freeze";
import { Provider } from "react-redux";
import { applyMiddleware, createStore } from "redux";
import rootReducer from "./ducks";
import localforage from "localforage";
import throttle from "./utils/throttle";

import { createMuiTheme, ThemeProvider } from '@material-ui/core/styles';
const theme = createMuiTheme({ //https://material-ui.com/customization/palette/
  palette: {
    primary: {
      main: '#2196f3'
    },
    secondary: {
      main: '#e91e63'
    },
    info:{
      main:"#1976d2"
    },
    error:{
      main:"#f44336"
    },
    warning:{
      main:"#ff9800"
    },
    success:{
      main:"#4caf50"
    },
    textSecondary:{
      main:'#bdbdbd'
    }
  }
});
// console.log(logger);

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
    let middleware = [reduxFreeze, createLogger()];
    let store = createStore(
      rootReducer,
      {},
      // data ? data : {},
      applyMiddleware(...middleware)
    );
    // initialize if ne
    if (!data){

    }
    store.subscribe(
      throttle(() => {
        let state = { ...store.getState() };
        delete state["ui"]; // don't persist ui sate
        localforage.setItem("state", state);
      }, 1000)
    );
    // localforage.clear(function(err) {
    //   // Run this code once the database has been entirely deleted.
    //   console.log("Database is now empty.");
    // });
    ReactDOM.render(
      <Provider store={store}>
        <ThemeProvider theme={theme}>
          <App />
        </ThemeProvider>
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
