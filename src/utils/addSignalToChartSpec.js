// TODO: support different encodings?

export default (spec)=>{

  // highlight
  spec.signals = [
    ...(spec.signals||[]),
    {
      name: "highlight", // should we add a prefix to avoid conflict with existing signals
      value: { data: [], start: 0, end: 100, enabled:false, }
    }
  ];

  spec.marks.forEach(mark=>{
    addSignalToMark(mark);
  })
  return spec;
}

export function addSignalToMark(mark){
  if (mark.type==="group"){// recursive 
    if (mark.marks){
      mark.marks.forEach(mark=>addSignalToMark(mark))// will this generalize to all charts? 
    }
    return;
  }
  const isMap = mark.type==='shape' && mark.style.includes("geoshape")
  const predicate = 
  ` highlight.enabled === false || 
    indexof(highlight.data, ${isMap?'datum.properties':'datum'}[highlight.field])!=-1`;

  mark.encode.update = {
    ...mark.encode.update,
    opacity:[
      {
        test: predicate,
        value: 1.0
      },
      {
        value: 0.05
      }
    ]
  }
}