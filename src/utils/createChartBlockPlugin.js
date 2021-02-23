
import ChartBlock from 'components/ChartBlock';

export default (config = {}) => {
    const component = config.decorator
        ? config.decorator(ChartBlock)
        : ChartBlock;

    return {
        blockRendererFn: (block, { getEditorState }) => {
            if (block.getType() === "atomic") {
                const contentState = getEditorState().getCurrentContent();
                if (!block.getEntityAt(0)) return;
                const entity = contentState.getEntity(block.getEntityAt(0));
                const data = entity.getData();
                const type = entity.getType();
                if (type === "CHART") {
                    return {
                        component,
                        editable: false,
                        props:{
                            ...data
                        }
                    };
                }
            }
            return null;
        },
        ChartBlock
    };
};