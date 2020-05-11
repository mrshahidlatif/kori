export default (charts, partialText, startIndex) => {
    return partialText.length === 0
        ? []
        : [].concat(
              ...charts.map((chart) =>
                  chart.properties.features
                      .filter((d) => {
                          if (d.type === "string") {
                              return d.value.toLowerCase().startsWith(partialText.toLowerCase());
                          } else if (d.type === "date") {
                              //temporary
                              return d.value
                                  .toString()
                                  .toLowerCase()
                                  .includes(partialText.toLowerCase());
                          }
                      })
                      .map((d) => ({
                          chartId: chart.id,
                          feature: d,
                          text: d.value.toString(),
                          startIndex,
                      }))
              )
          );
};
