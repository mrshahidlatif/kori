function getCaretPosition(selection) {
  if (selection.anchorNode === null) return;
  let range = selection.getRangeAt(0).cloneRange();
  range.setStart(range.startContainer, range.start);
  let cursorPosition = range.getBoundingClientRect();
  cursorPosition = JSON.parse(JSON.stringify(cursorPosition));
  //https://github.com/facebook/draft-js/blob/master/src/component/selection/getVisibleSelectionRect.js
  // When a re-render leads to a node being removed, the DOM selection will
  // temporarily be placed on an ancestor node, which leads to an invalid
  // bounding rect. Discard this state.
  if (
    cursorPosition.top === 0 &&
    cursorPosition.right === 0 &&
    cursorPosition.bottom === 0 &&
    cursorPosition.left === 0
  ) {
    return null;
  }
  const editor = document.getElementById("mainEditor");
  const editorRect = JSON.parse(JSON.stringify(editor.getBoundingClientRect()));
  //TODO: getBoundingClientRect() doesn't work well with the scrolling of the page: so when the editor window is longer
  //than viewport, it will cause problems!
  //Keeping dropdown position in sync while scrolling!
  //https://stackoverflow.com/questions/25630035/javascript-getboundingclientrect-changes-while-scrolling
  let caretPosition = {
    x: cursorPosition.x - editorRect.x,
    y: cursorPosition.y - editorRect.y
  };
  return caretPosition;
}
export default getCaretPosition;
