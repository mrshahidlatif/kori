
import ChartBlock from 'components/ChartBlock';

export default (config = {}) => {
    const component = config.decorator
        ? config.decorator(ChartBlock)
        : ChartBlock;
    return {
        blockRendererFn: (block, { getEditorState }) => {
            if (block.getType() === "atomic") {
                const contentState = getEditorState().getCurrentContent();
                const entity = contentState.getEntity(block.getEntityAt(0));

                const type = entity.getType();
                if (type === "CHART") {
                    return {
                        component,
                        editable: false
                    };
                }
            }
            return null;
        },
        ChartBlock
    };
};