import { combineReducers } from "redux";
// import editor from "./editor";
import charts from "./charts";
import docs from "./docs";
import links from "./links";
import ui from "./ui";

export default combineReducers({
  docs,
  charts,
  links,
  ui
});

