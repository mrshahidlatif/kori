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
  mark.encode.update = {
    ...mark.encode.update,
    opacity:[
      {
        test:` 
            highlight.enabled === false 
            || indexof(highlight.data, datum[highlight.field])!=-1
          `,
        value: 1.0
      },
      {
        value: 0.2
      }
    ]
  }
}