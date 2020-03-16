import { combineReducers } from "redux";
import editor from "./editor";
import charts from "./charts";
import ui from "./ui";

export default combineReducers({
  editor,
  charts,
  ui
});
