import React from "react";
import { useSelector } from "react-redux";
import css from "./index.module.css";
import Chart from "components/Chart";
import { getCharts } from "ducks/charts";
import Button from "@material-ui/core/Button";
import extractChartFeatures from "../../utils/extractChartFeatures";

export default function ChartGallery(props) {
  const charts = useSelector(getCharts);
  const handleClick = () => {
    console.log("ADD CHART clikced!");
    extractChartFeatures();
  };
  return (
    <div className={css.container}>
      <Button variant="contained" onClick={handleClick}>
        ADD NEW CHART
      </Button>
      {charts.map((chart) => (
        <Chart key={chart.id} id={chart.id} spec={chart.spec} />
      ))}
    </div>
  );
}
