//All helper functions to extract information from Vega specs goes here
function getVariableNameFromScale(specs, scaleName) {
  let varName = "infinity";
  const varScale = specs.scales.filter(s => {
    return s.name == scaleName;
  });
  if (varScale.length > 0) varName = varScale[0].domain.field;
  return varName;
}
export default getVariableNameFromScale;
