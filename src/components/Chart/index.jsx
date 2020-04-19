import React, { useMemo, memo, useRef, useState, useEffect } from "react";
import vegaEmbed from 'vega-embed';
import PropTypes from "prop-types";
import css from './index.module.css';
import Paper from '@material-ui/core/Paper';
// See ChartBlock for a chart in the editor
export function Chart(props) {
  const chartEl = useRef(null);
  // why we need to stringify and parse it back? needs further investigation
  const spec = useMemo(() => JSON.parse(JSON.stringify(props.spec)), [props.spec]);
  // const [view, setView] = useState(null);
  
  useEffect( ()=>{
    vegaEmbed(chartEl.current, spec).then(result=>{
      // setView(result.view);
    });
  },[]);// will run only once


  function handleDragStart(e) {
    e.dataTransfer.setData('chartId', props.id);
  }

  const [hover, setHover] = useState(false);
  function handleEnter(){
    setHover(true);
  }
  function handleLeave(){
    setHover(false);
  }
  return (
    <Paper className={css.container}
      elevation={hover?2:0}>
      <div
        draggable={true}
        onDragStart={handleDragStart}
        onMouseEnter={handleEnter}
        onMouseLeave={handleLeave}
      >
        <div ref={chartEl} />
      </div>
    </Paper>
  )
}


Chart.propTypes = {
  id: PropTypes.any,
  spec: PropTypes.object,
  width: PropTypes.number,
  height: PropTypes.number
}

export default memo(Chart);
