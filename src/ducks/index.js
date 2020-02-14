import { combineReducers } from "redux";
import text from "./text";
import editor from "./editor";
import charts from "./charts";

export default combineReducers({
  text: text,
  editor: editor,
  charts: charts
});
