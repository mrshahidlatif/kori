import { combineReducers } from "redux";
import text from "./text";
import editor from "./editor";
import visPanel from "./visPanel";
import chart from "./chart";

export default combineReducers({
  text,
  editor,
  visPanel,
  chart
});
