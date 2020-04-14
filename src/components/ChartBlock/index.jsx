import React, {useEffect, useMemo} from 'react';
import { Vega } from "react-vega";
import {useSelector, shallowEqual} from 'react-redux';
import addSignalToChartSpec from 'utils/addSignalToChartSpec';

export default function ChartBlock(props){
    // const data = props.contentState.getEntity(props.block.getEntityAt(0)).getData();
    let view = null;
    // console.log('ChartBlock props', props);
    const spec = useMemo(()=>{
        return addSignalToChartSpec(
            JSON.parse(JSON.stringify(props.blockProps.spec)),
            "bar"// this has to be inferred automatically, if we cannot support everything, then we show an error message "not supported"
        );
      },[props.blockProps]);

      // TODO: use a memoized selector for performance
      const links = useSelector(state => Object.values(state.links).filter(link=>link.chartId===props.blockProps.id), shallowEqual);
      
      useEffect(()=>{
        console.log('signal_highlight', links);
        links.filter(link=>link.active).forEach(link=>{
          view.signal('signal_highlight', {data: link.text}).run();
        })
        
      });
      function handleView(viewRef) {
        view = viewRef;
      }
      function handleError(){
        console.error(arguments);
      }
    
    return (
        //TODO: BUG: Text Wrap controls doesn't work as expected! perhaps the problem is with the css files and styles!
        //TODO: Make the width of this div fit to the contents. At the moment it is hard-coded!
        <div style={{width:'fit-content', ...props.style}}>
            <Vega spec={spec}  onNewView={handleView} onParseError={handleError} />
        </div>
    );
};

