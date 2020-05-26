// https://github.com/facebook/draft-js/issues/1236
// Can be used to retrieve all entities of a certain type (e.g., chart)
// Not currently used...
export default (content, entityType = null) => {
    const entities = [];
    content.getBlocksAsArray().forEach((block) => {
      let selectedEntity = null;
      block.findEntityRanges(
        (character) => {
          if (character.getEntity() !== null) {
            const entity = content.getEntity(character.getEntity());
            if (!entityType || (entityType && entity.getType() === entityType)) {
              selectedEntity = {
                entityKey: character.getEntity(),
                blockKey: block.getKey(),
                entity: content.getEntity(character.getEntity()),
              };
              return true;
            }
          }
          return false;
        },
        (start, end) => {
          entities.push({ ...selectedEntity, start, end });
        });
    });
    return entities;
  }