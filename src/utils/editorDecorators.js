/**
 * Super simple decorators for handles and hashtags, for demonstration
 * purposes only. Don't reuse these regexes.
 */
//TODO: REGEX needs to be improved and crafted to our use case!
// import LinkText from 'components/LinkText';
// import AutoLink from 'components/AutoLink';
import Link from "components/Link";
import HighlightTextSelection from "components/HighlightTextSelection";
// const HANDLE_REGEX = /\@[\w]+/g;

// export function handleStrategy(contentBlock, callback, contentState) {
//   findWithRegex(HANDLE_REGEX, contentBlock, callback);
// }

// export function findWithRegex(regex, contentBlock, callback) {
//   const text = contentBlock.getText();
//   let matchArr, start;
//   while ((matchArr = regex.exec(text)) !== null) {
//     start = matchArr.index;
//     callback(start, start + matchArr[0].length);
//   }
// }

export function findLinkEntities(contentBlock, callback, contentState) {
    contentBlock.findEntityRanges((character) => {
        const entityKey = character.getEntity();
        return entityKey !== null && contentState.getEntity(entityKey).getType() === "LINK";
    }, callback);
}
export function findTextSelectionEntity(contentBlock, callback, contentState) {
    contentBlock.findEntityRanges((character) => {
        const entityKey = character.getEntity();
        return (
            entityKey !== null && contentState.getEntity(entityKey).getType() === "TEXT_SELECTION"
        );
    }, callback);
}

export default [
    {
        strategy: findTextSelectionEntity,
        component: HighlightTextSelection, // decorateComponentWithProps(LinkText, EditorState)
    },
    {
        strategy: findLinkEntities,
        component: Link,
    },
    // {
    //     strategy: findAutoLinkEntities,
    //     component: AutoLink
    // }
];
