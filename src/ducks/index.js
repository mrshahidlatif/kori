import { combineReducers } from "redux";
import text from "./text";
import editor from "./editor";

export default combineReducers({
  text: text,
  editor: editor
});
