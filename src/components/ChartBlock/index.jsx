import React, { useEffect, useMemo, memo, useState, useRef } from "react";
// import { Vega } from "react-vega"; // having a problem with this, keep rerendering for no reason
import { useSelector, shallowEqual } from "react-redux";
import addSignalToChartSpec from "utils/addSignalToChartSpec";
import vegaEmbed, { EmbedOptions, VisualizationSpec } from "vega-embed";
export default memo(function ChartBlock(props) {
  // const data = props.contentState.getEntity(props.block.getEntityAt(0)).getData();
  // let view = null;
  const [view, setView] = useState(null);
  const containerEl = useRef(null);
  // TODO: use a memoized selector for performance
  const links = useSelector(
    (state) =>
      Object.values(state.links).filter(
        (link) => link.chartId === props.blockProps.id
      ),
    shallowEqual
  );
  const spec = useMemo(() => {
    // will run only once
    console.log("new spech computed");
    const newSpec = addSignalToChartSpec(
      JSON.parse(JSON.stringify(props.blockProps.spec))
    );
    return newSpec;
  }, [props.blockProps.spec]);

  useEffect(() => {
    vegaEmbed(containerEl.current, spec).then((result) => {
      setView(result.view);
    });
  }, []); // will run only once

  useEffect(() => {
    if (!view) {
      return;
    }
    if (links.some((link) => link.active)) {
      // Should we send all signals at once? would it improve performance?
      links
        .filter((link) => link.active)
        .forEach((link) => {
          view
            .signal("highlight", {
              data: link.data,
              field: link.feature.field,
              enabled: true,
            })
            .run();
        });
    } else {
      view.signal("highlight", { enabled: false }).run();
    }
  }, [view, links]);

  return (
    //TODO: BUG: Text Wrap controls doesn't work as expected! perhaps the problem is with the css files and styles!
    //TODO: Make the width of this div fit to the contents. At the moment it is hard-coded!
    <div ref={containerEl} style={{ width: "fit-content", ...props.style }}>
      {/* <Vega spec={spec} onNewView={handleView} onParseError={handleError} /> */}
    </div>
  );
});
