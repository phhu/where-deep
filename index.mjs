import {
  where, equals, curry, mapObjIndexed, append, type, test, toString
} from 'ramda'
import {
  arrayWhereStrongUnordered, arrayWhereStrongOrdered, arrayWhereWeak
} from './arrayWhere.mjs'

const mapByType = (fn, obj) => {
  switch (type(obj)) {
    case "Array":
      return obj.map(fn) // native arr.map provides (val, key, srcObj)
    case "Object":
      return mapObjIndexed(fn, obj)
    // case 'Function':
    // case 'String':
    // case 'Number':
    // case 'Boolean':
    // case 'RegExp':
    // case "Null":
    // case "Undefined":
    // case "RegExp":
    default:
      return fn(obj)
  }
}

const fnByType =
  ({
    path: inPath = [],
    arrayWhere = arrayWhereStrongUnordered
  } = {}) =>
    (val, key, srcObj) => {
      const path = append(key, inPath)
      switch (type(val)) {
        case 'Array':
          return arrayWhere(
            { originalValues: val },
            mapByType(fnByType({ path }), val)
          )
        case 'Object':
          return where(
            mapByType(fnByType({ path }), val)
          )
        case 'String':
        case 'Number':
        case 'Boolean':
        case 'Null':
          return equals(val)
        case "RegExp":
          return x => test(val, toString(x))
        case 'Function':
          return val          // allow functions to override default behaviour
        case "Undefined":
          return x => true    // allow undefined to cancel a test ?
        default:
          return x => false   // don't allow junk
      }
    }

export const whereDeep = curry(
  ({
    arrayWhere = arrayWhereStrongUnordered
  } = {},
    spec, source
  ) => {
    // const test = fnByType({
    //   path: [],
    //   arrayWhere
    // })
    // console.log({test,testv:test(1)})
    return where(
    mapByType(fnByType({
      path: [],
      arrayWhere
    }), spec),
    source
    )
  }
)