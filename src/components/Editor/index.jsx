import React, { Fragment, useState, useRef, useEffect } from "react";
import { useDispatch, useSelector } from 'react-redux';
import PropTypes from "prop-types";

import {
    EditorState,
    AtomicBlockUtils,
    RichUtils,
    convertToRaw,
} from "draft-js";

import DraftEditor from "draft-js-plugins-editor";

import css from './index.module.css';

import EditorToolbar, { EditorPlugins } from 'components/EditorToolbar';
import ChartBlock from 'components/ChartBlock';

import SuggestionPanel from "components/SuggestionPanel";

import {updateDoc, updateChartsInEditor} from 'ducks/docs';
import {createLinks, createLink} from 'ducks/links';
import {getChartsInEditor, getCharts} from 'ducks/charts';

import editorDecorators from 'utils/editorDecorators';
import getLastTypedWord from 'utils/getLastTypedWord';
import findSuggestions from 'utils/findSuggestions';
import findLinks from 'utils/findLinks';
import insertLinks from 'utils/insertLinks';



export default function Editor(props) {
    const dispatch = useDispatch();
    const doc = useSelector(state=>state.docs[state.ui.currentDocId]);
    const charts = useSelector(getCharts);
    const chartsInEditor = useSelector(getChartsInEditor);
    
    const editorEl = useRef(null); //https://reactjs.org/docs/hooks-reference.html#useref
  
    const [suggestions, setSuggestions] = useState([]);
    const [editorState, setEditorState] = useState(EditorState.createEmpty());

    
    useEffect(() => {
        // console.log('editor', props.editor)
        // const contentState = convertFromRaw(editor);
        // setEditorState(EditorState.createWithContent(contentState));
        // setLastTypedWord('');

        // let editorNode = document.getElementById("mainEditor");
        // let editorPosition = editorNode.getBoundingClientRect();
        // editorPosition = JSON.parse(JSON.stringify(editorPosition));
    }, []);

    function handleEditorChange(editorState) {

        //AUTOMATIC LINKING WHEN THE USER IS TYPING
        //Get the last word user typed before pressing the space
        const lastTypedWord =  getLastTypedWord(editorState);
        console.log('lastTypedWord', lastTypedWord);
        if (lastTypedWord.length>0){
            const links = findLinks(chartsInEditor, lastTypedWord);
            
            if (links.length>0){
                
                const action = createLinks(doc.id, links);// need ids
                console.log('action.links', action.links);
                editorState = insertLinks(action.links, editorState, "Auto");
                dispatch(action);
            }
        }
  
        //Enable SuggestionMenu on @
        if (lastTypedWord.startsWith('@')){
            const suggestions = findSuggestions(chartsInEditor, lastTypedWord.slice(1));
            console.log('suggestions', suggestions);
            setSuggestions(suggestions);
        }else{
            setSuggestions([]);
        }

        // Update Editor State 
        setEditorState(editorState);
        //TODO: PERFORMANCE: Do not push data to store on each key store: It is slowing down the whole thing!
        const editorRawState = convertToRaw(editorState.getCurrentContent());
        dispatch(updateDoc(doc.id, {editorRawState}));

         // TODO: see if we can catch an event for adding or removing a chart.
        // Updating charts in store when a chart is added to or removed from document
        const entityMap = editorRawState.entityMap;
        const numCharts = Object.keys(entityMap).length;
        if (numCharts !== chartsInEditor.length) {
          const ids = Object.values(entityMap).reduce((acc, entity)=>{
            if (entity.type === "CHART") {
                acc.push(entity.data.id);
            }
            return acc;
          }, []);
          dispatch(updateChartsInEditor(doc.id, ids));
        }
        console.log('editorRawState', editorRawState);
    };

   
    function handleKeyCommand(command) {// handle common key bindings (e.g., bold, italic, etc.)
        const newEditorState = RichUtils.handleKeyCommand(editorState, command);
        if (newEditorState) {
            setEditorState(newEditorState);
            return 'handled';
        }
        return 'not-handled';
    }

    function handleDragOver(e) {
        // may need to throttle for performance
        e.preventDefault();
        e.stopPropagation();
        editorEl.current.focus();
        // e.persist(); //conflict with asynchronous setTimeout in throuttle:
        //https://stackoverflow.com/questions/38142880/react-js-throttle-mousemove-event-keep-throwing-event-persist-error
    }

    function handleDrop(e) {
        e.preventDefault();
        e.stopPropagation();
        const chartId = e.dataTransfer.getData("chartId");
        const chart = charts.find(d=>d.id===chartId);
        const exists = chartsInEditor.find(d=>d.id===chartId)
        // console.log(chartsInEditor, chartId, editorState.getCurrentContent().getEntityMap().mapEntries());
        if (chart && !exists) {
            insertChart(chart);
            e.dataTransfer.clearData();
        }
    }

    function blockRendererFn(block) {//TODO: is this necessary given the plugin is there
        const content = editorState.getCurrentContent();

        if (block.getType() === "atomic") {
            const entity = content.getEntity(block.getEntityAt(0));
            
            if (entity.getType() === "CHART") {
                const data = entity.getData();
                return {
                    component: ChartBlock,
                    editable: false,
                    props:{
                        ...data
                    }
                };
            }
        }
    };
    function insertChart(chart) {
        // console.log(chartId, charts[chart.id])
        let contentState = editorState.getCurrentContent();

        contentState = contentState.createEntity("CHART", "IMMUTABLE", {
            id: chart.id,
            spec: chart.spec
        });
        const entityKey = contentState.getLastCreatedEntityKey();
        console.log('entityKey',entityKey)
        const newEditorState = AtomicBlockUtils.insertAtomicBlock(
            editorState,
            entityKey,
            " "
        );
        setEditorState(newEditorState);
    }
    function handleBlur(){
        setSuggestions([]);
    }
    function handleSuggestionSelected(suggestion){
        //TODO: there should be a single place generating a link (see find links)
        const action = createLink(doc.id, {
            text: suggestion.text,
            feature: suggestion.feature,
            chartId: suggestion.chartId,
            active: false,
            type: "point"//TODO: range selection
        });// need ids
        const newEditorState = insertLinks([action.attrs], editorState, "Manual");
        dispatch(action);

        setSuggestions([]);
        setEditorState(newEditorState);
        
      
    }
    return (
        <Fragment>
            <EditorToolbar />
            <div className={css.editor}
                onDragOver={handleDragOver}
                onDrop={handleDrop}>
                <DraftEditor
                    editorState={editorState}
                    plugins={EditorPlugins}
                    onChange={handleEditorChange}
                    onBlur={handleBlur}
                    handleKeyCommand={handleKeyCommand}
                    blockRendererFn={blockRendererFn}
                    decorators={editorDecorators}
                    ref={editorEl}
                />
            </div>
            {suggestions.length>0 &&
                <SuggestionPanel
                    suggestions={suggestions}
                    onSelected={handleSuggestionSelected}
                />
            }
        </Fragment>
    
    );
};

//Define the public proptypes of this componenet
Editor.propTypes = {
    editor: PropTypes.object,
    updateEditorState: PropTypes.func,
    addSelectedChart: PropTypes.func
};