import { map, where, equals, any ,all, curry} from 'ramda'

const arrayWhere = curry( 
  (spec,source) => all(specEl => any(specEl, source), spec) 
)

const byType = val => {

  switch (typeof val){
    case "string":
    case "number":
    case "boolean":
      return equals(val)
      break;
    case "object":
      if (Array.isArray(val)){
        // week version where array elements are replaced, so don't need
        // to do permutations
        return arrayWhere(map(byType,val))
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


