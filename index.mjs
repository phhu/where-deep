import {
  where, equals, curry, mapObjIndexed, append, type, test, toString
} from 'ramda'
import {
  arrayWhereStrongUnordered // arrayWhereStrongOrdered, arrayWhereWeak
} from './arrayWhere.mjs'

const mapByType = (fn, obj) => {
  switch (type(obj)) {
    case 'Array':
      return obj.map(fn) // native arr.map provides (val, key, srcObj)
    case 'Object':
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
    arrayWhere = arrayWhereStrongUnordered,
    objectWhere = where,
    stringEquals = equals,
    numberEquals = equals,
    booleanEquals = equals,
  } = {}) =>
    (val, key, srcObj) => {
      const path = append(key, inPath)
      const mappedWithFns = () => mapByType(fnByType({ 
        path, arrayWhere, objectWhere,
        stringEquals, numberEquals, booleanEquals,
      }), val)
      switch (type(val)) {
        case 'Array':
          return arrayWhere(
            { originalValues: val },
            mappedWithFns()
          )
        case 'Object':
          return objectWhere(
            mappedWithFns()
          )
        case 'String':
          return stringEquals(val)
        case 'Number':
          return numberEquals(val)
        case 'Boolean':
          return booleanEquals(val)
        case 'Null':
          return equals(val)
        case 'RegExp':
          return x => test(val, toString(x))
        case 'Function':
          return val // allow functions to override default behaviour
        case 'Undefined':
          return x => false // allow undefined to fail a test ?
        default:
          return x => false // don't allow junk
      }
    }

export const whereDeep = curry(
  (
    {
      arrayWhere = arrayWhereStrongUnordered,
      objectWhere = where,
      stringEquals = equals,
      numberEquals = equals,
      booleanEquals = equals,
    },
    spec,
    source
  ) => where(
    mapByType(
      fnByType({ 
        path: [], 
        arrayWhere, 
        objectWhere, 
        stringEquals: curry(stringEquals), 
        numberEquals: curry(numberEquals), 
        booleanEquals: curry(booleanEquals),
      }),
      [spec] // *
    ),
    [source] // * wrapping in array protects against dubious R.where behaviour with degenerates
  )
)
