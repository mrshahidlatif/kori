import { combineReducers } from "redux";
import text from "./text";
import editor from "./editor";
import visPanel from "./charts";

export default combineReducers({
  text,
  editor,
  visPanel
});
