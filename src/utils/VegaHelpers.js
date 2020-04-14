//All helper functions to extract information from Vega spec goes here
export function getVariableNameFromScale(spec, scaleName) {
  let varName = "infinity";
  const varScale = spec.scales.filter(s => {
    return s.name === scaleName;
  });
  if (varScale.length > 0) varName = varScale[0].domain.field;
  return varName;
}
export default {
  getVariableNameFromScale
};
