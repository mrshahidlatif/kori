import React, { useState } from "react";
import { useSelector, useDispatch } from 'react-redux';
import css from "./index.module.css";
import Chart from "components/Chart";
import { createChart, getCharts } from 'ducks/charts';
import Snackbar from '@material-ui/core/Snackbar';
import * as vegalite from 'vega-lite/build/vega-lite';


export default function ChartGallery(props) {
  const dispatch = useDispatch();
  const [dragging, setDragging] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const charts = useSelector(getCharts);
  const currentDocId = useSelector(state=>state.ui.currentDocId);

  function handleDragEnter() {
    setDragging(true)
  }
  function handleDragLeave() {
    setDragging(false)
  }
  function handleDragOver(e) {
    e.preventDefault();
    e.stopPropagation();
  }

  function handleDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    // console.log('VegaLite', VegaLite);
    let file = e.dataTransfer.files[0];
    console.log(file);
    if (file.size > 1000000) {// larger than 1 MB
      setErrorMsg("Size too big (>1MB)!");
      return;
    }
    console.log('file.type', file.type);
    if (file.type.match('application/json')) {
      const reader = new FileReader();

      // Closure to capture the file information.
      reader.onload = (e) => {
        const liteSpec = JSON.parse(e.target.result);
        const spec = vegalite.compile(liteSpec).spec;
        // support vega-lite sample datasets
        spec.data.forEach(d=>{
          if (d.url && d.url.startsWith('data')){
            d.url = process.env.PUBLIC_URL +'/'+ d.url;
          }
        })
        dispatch(createChart(currentDocId, spec))
      };

      reader.readAsText(file);
    }else{
      setErrorMsg("Wrong format!");
    }
    setDragging(false);

  }
  return (
    <div className={css.container}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}>
      <Snackbar open={errorMsg!==null}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        autoHideDuration={5000}
        onClose={() => {
          setErrorMsg(null);
        }}
        message={errorMsg}
        />
        
      <div className={css.draggingArea} style={{ opacity: dragging ? 0.5 : 0.0 }}>
        Drop Vega-lite spec
      </div>
      {charts.map(chart => <Chart
        key={chart.id}
        id={chart.id}
        spec={chart.spec}
      />)}


    </div>
  );
}

