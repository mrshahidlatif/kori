import React from "react";
import {useSelector} from 'react-redux';
import css from "./index.module.css";
import Chart from "components/Chart";
import {getCharts} from 'ducks/charts';

export default function ChartGallery(props){
  const charts = useSelector(getCharts);
  return (
    <div className={css.container}>
      {charts.map(chart => <Chart
          key={chart.id}
          id={chart.id}
          spec={chart.spec}
        />)}
    </div>
  );
}

