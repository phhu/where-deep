import {
  where, equals, curry, mapObjIndexed, append, type, test, toString
} from 'ramda'
import {
  arrayWhereStrongUnordered, arrayWhereStrongOrdered, arrayWhereWeak
} from './arrayWhere.mjs'

export const whereDeep = curry(
  (
    {
      arrayWhere = arrayWhereStrongUnordered
    } = {},
    spec,
    source
  ) => true
)

console.log('***', { whereDeep, w1: whereDeep(), wc1: curry(whereDeep)(1) })
