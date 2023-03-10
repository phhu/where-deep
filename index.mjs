import { whereEq, map, where, equals } from 'ramda'

const byType = val => {

  switch (typeof val){
    case "string":
    case "number":
    case "boolean":
      return equals(val)
      break;
    case "object":
      if (Array.isArray(val)){
        // handle array
      } else if (val===null){
        return equals(val)
      } else {
        return where(map(byType,val))
      }
      break;
    case "function":
    default: 
      break;
  }
}


// export const whereDeep = (spec, source) => {
//   return whereEq(spec, source)
// }

export const whereDeep2 = (spec, source) => {
  console.log(map(byType,spec))
  return where(map(byType,spec), source)
}


