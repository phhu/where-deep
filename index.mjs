import {
  map, where, equals
} from 'ramda'
import {
  arrayWhereStrongUnordered
} from './arrayWhere.mjs'

const byType = val => {
  let ret
  switch (typeof val) {
    case 'string':
    case 'number':
    case 'boolean':
      ret = equals(val)
      break
    case 'object':
      if (Array.isArray(val)) {
        ret = arrayWhereStrongUnordered({ originalValues: val }, map(byType, val))
      } else if (val === null) {
        ret = equals(val)
      } else { // assume a regular object
        ret = where(map(byType, val))
      }
      break
    case 'function':
    default:
      ret = x => false // don't
      break
  }
  // ret.originalValue = val    // keep track of the original value on the function returned
  return ret
}

export const whereDeep = (spec, source) =>
  where(map(byType, spec), source)
