import React, { useMemo,memo } from "react";
import { Vega } from "react-vega";
import PropTypes from "prop-types";
import css from './index.module.css';

// See ChartBlock for a chart in the editor
export function Chart(props){

  function handleDragStart(e){
    e.dataTransfer.setData('chartId', props.id);
  }

  function handleError(){
    console.error(arguments);
  }

  // why we need to stringify and parse it back? needs further investigation
  const spec = useMemo(()=> JSON.parse(JSON.stringify(props.spec)),[props.spec]);

  return (
    <div className={[css.container,
      !props.inEditor?css.draggable:''].join(' ')} 
      draggable={!props.inEditor} 
      onDragStart = {handleDragStart}
      >
        <Vega spec={ spec} onParseError={handleError} />
      </div>
  )
}


Chart.propTypes = {
  id:PropTypes.any,
  spec:PropTypes.object,
  width:PropTypes.number,
  height:PropTypes.number
}

export default memo(Chart);
