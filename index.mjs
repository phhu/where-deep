import {
  where, equals, curry, mapObjIndexed, append,
  type, test, is, toString, tryCatch
} from 'ramda'
import {
  arrayWhereAllUnordered
} from './arrayWhere.mjs'

export * from './arrayWhere.mjs'

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
    arrayWhere = arrayWhereAllUnordered,
    objectWhere = where,
    stringEquals = equals,
    numberEquals = equals,
    booleanEquals = equals,
    nullEquals = equals,
    allowFunctions = true,
    allowRegExp = true,
  } = {}) =>
    (val, key, srcObj) => {
      const path = append(key, inPath)
      const mappedWithFns = () => mapByType(fnByType({
        path,
        arrayWhere,
        objectWhere,
        stringEquals,
        numberEquals,
        booleanEquals,
        nullEquals,
        allowFunctions,
        allowRegExp,
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
          return nullEquals(val)
        case 'RegExp':
          return allowRegExp ? x => test(val, is(String, x) ? x : toString(x)) : equals(val)
        case 'Function':
          return allowFunctions ? val : equals(val) // allow functions to override default behaviour
        case 'Undefined':
          return x => false // allow undefined to fail a test ?
        default:
          return x => false // don't allow junk
      }
    }


/**
 * Takes an options object, a  spec object and a test object; returns true if the test satisfies
 * the spec. Allows nesting of arrays and objects in the spec.
 * @func
 * @sig {String: *} -> {String: (* -> Boolean)} -> {String: *} -> Boolean
 * @param {Object} options
 * @param {Object} spec
 * @param {Object} testObj
 * @see R.where, R.whereEq
 * @return {Boolean}
 * @example
 * const opts = {
 *    // arrayWhere: arrayWhereAllUnordered   
 *    // objectWhere: R.where  
 *    // stringEquals: R.equals  
 *    // numberEquals: R.equals
 *    // booleanEquals: R.equals
 *    // nullEquals: R.equals
 *    // errorHandler: e => false
 *    // allowFunctions: true
 *    // allowRegExp: true
 *  };
 *  const testObj = {
 *    a: 1,
 *    b: 2,
 *    c: [{d:4, e:5},{d:"six"}]
 *  };
 *  whereDeep(opts, {a: 1, c: [{d:4}] }, testObj);  // true 
 */
export const whereDeep = curry(
  (
    {
      arrayWhere = arrayWhereAllUnordered,
      objectWhere = where,
      stringEquals = equals,
      numberEquals = equals,
      booleanEquals = equals,
      nullEquals = equals,
      allowFunctions = true,
      allowRegExp = true,
      errorHandler = (e) => {
        // console.error("whereDeep error", e)
        return false
      }
    },
    spec,
    source
  ) => {
    try {
      return where(
        mapByType(
          fnByType({
            path: [],
            arrayWhere,
            objectWhere,
            stringEquals: curry(stringEquals),
            numberEquals: curry(numberEquals),
            booleanEquals: curry(booleanEquals),
            nullEquals: curry(nullEquals),
            allowFunctions,
            allowRegExp,
          }),
          [spec] // *
        ),
        [source] // * wrapping in array protects against dubious R.where behaviour with degenerates
      )
    } catch (e) {
      return errorHandler(e)
    }
  }
)

export default whereDeep