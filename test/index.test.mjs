import { expect } from 'chai'
import { equals, whereAny, toLower, where , whereEq, toUpper} from 'ramda'
import { whereDeep } from '../index.mjs'
import * as AW from '../arrayWhere.mjs'

/* global it,describe */

const source = {
  a0: [],
  a1: [1],
  a2: [1, 2],
  ao: [1, 'str', { p: 1, q: 'two', x: 3 }, { p: 2, q: 'two', z: 5 }],
  aa: [[1, 2], [2, 3], [4, 5]],
  aa2: [[1, 2], [2, 3], [4, 5], {}],
  b: true,
  n: 1,
  o: { p: 1, q: 'two', x: 3 },
  s: 'str',
  z: null
}

console.log('source', source)

const opts = {}
const T = true
const F = false
const test = (
  opts, value, spec, src = source
) => it(
  `${value === true ? 'T' : value === false ? 'F': value}: ${JSON.stringify(spec)} = ${src === source ? '[source]' : JSON.stringify(src)}`,
  () => expect(
    whereDeep(opts, spec, src)
  ).equal(value)
)

describe('whereDeep basic behaviour', () => {
  test(opts, T, { s: 'str', b: true })
  test(opts, T, { s: 'str', b: true })
  test(opts, F, { s: 'strx', b: true })
  test(opts, F, { s: 'str', b: true, o: { p: 1, q: 'two', x: 1 } })
  test(opts, T, { s: 'str', b: true, o: { p: 1, q: 'two' } })
  test(opts, F, { s: 'str', b: true, o: { p: 2, q: 'two' } })
  test(opts, T, { s: 'str', b: true, a2: [1] })
  test(opts, T, { s: 'str', b: true, a2: [1, 2] })
  test(opts, F, { s: 'str', b: true, a2: [1, 3] })
  test(opts, T, { s: 'str', b: true, ao: [1, 'str'] })
  test(opts, T, { s: 'str', b: true, ao: [1, { x: 3 }] })
  test(opts, T, { s: 'str', b: true, ao: [1, { x: 3 }, {}] })
  test(opts, F, { s: 'str', b: true, ao: [1, { x: 3 }, {}, {}] }) // empty object accounts for one
  test(opts, F, { s: 'str', b: true, ao: [1, { x: 4 }] })
  test(opts, F, { s: 'str', b: true, ao: [1, { z: 4 }] })
  test(opts, T, { s: 'str', b: true, ao: [1, { z: 5 }] })
  test(opts, T, { s: 'str', b: true, ao: [1, { z: 5 }, { x: 3 }] })
  test(opts, F, { s: 'str', b: true, ao: [1, { z: 5 }, { x: 3 }, { x: 4 }] })
  test(opts, T, { s: 'str', b: true, ao: [1] })
  test(opts, T, { ao: ['str', 1] })
  test(opts, T, { ao: [1, 'str'] })
  test(opts, T, { ao: [{ p: 1, q: 'two' }, { p: 2, q: 'two' }] })
  test(opts, T, { ao: [1, 'str'] })
  test(opts, F, { s: 'str', b: true, ao: [1, 1] }) // T in weak version
  test(opts, T, { ao: [{ q: 'two' }, { p: 1, q: 'two' }] }) // F if ordered
  test(opts, T, { ao: [{ q: 'two' }, { p: 2, q: 'two' }] })
  test(opts, T, { a0: [] })
  test(opts, F, { a0: [1] })
  test(opts, T, { a1: [] })
  test(opts, T, { a1: [1] })
  test(opts, F, { a1: [2] })
  test(opts, T, { s: /str/ })
  test(opts, T, { s: equals('str') })
})

describe('arrayOfArrays', () => {
  test(opts, T, { aa: [[1, 2]] })
  test(opts, F, { aa: [[1, 2], [1, 2]] })
  test(opts, T, { aa: [[1, 2], [2, 3]] })
  test(opts, T, { aa: [[2, 3], [2, 1]] })
  test(opts, T, { aa: [[4], [2], [2]] })
  test(opts, T, { aa: [[2, 3], [], []] })
  test(opts, F, { aa: [[2, 3], [], [], {}] })
  test(opts, T, { aa2: [[2, 3], [], [], {}] })
})

describe('degenerates', () => {
  test(opts, T, { a: 1 }, { a: 1 })
  test(opts, F, [1], [])
  test(opts, T, [], [])
  test(opts, T, 'test', 'test')
  test(opts, F, 'testa', 'test')
  test(opts, T, 1, 1)
  test(opts, T, 0, 0)
  test(opts, T, '', '')
  test(opts, T, true, true)
  test(opts, T, false, false)
  test(opts, T, {}, {})
  test(opts, T, null, null)
  test(opts, F, undefined, undefined)
  test(opts, F, undefined, 1)
  test(opts, F, 1, undefined)
  test(opts, F, 0, {}) // ?
})

describe('arrayWhere = arrayWhereWithReplacement', () => {
  const opts = {
    arrayWhere: AW.arrayWhereWithReplacement
  }
  test(opts, T, { ao: [1, 1] }, source)
})

describe('arrayWhere = arrayWhereAllOrdered', () => {
  const opts = {
    arrayWhere: AW.arrayWhereAllOrdered
  }
  test(opts, F, { ao: [{ q: 'two' }, { p: 1, q: 'two' }] }, source)
})

describe('arrayWhere = arrayWhereAny', () => {
  const opts = {
    arrayWhere: AW.arrayWhereAny
  }
  test(opts, T, [2, 4], [1, 2, 3])
  test(opts, F, [0, 4], [1, 2, 3])
  test(opts, T, { a: [1, 2, 3] }, { a: [1, 2, 3] })
})

describe('objectWhere - whereAny', () => {
  const opts = {
    objectWhere: whereAny
  }
  test(opts, T, { o: { a: 1, b: 3 } }, { o: { a: 1, b: 2, c: 3 } })
  test(opts, T, { o: { a: 1, b: 2, d: 4 } }, { o: { a: 1, b: 2, c: 3 } })
  test(opts, F, { o: {} }, { o: { a: 1, b: 2, c: 3 } })
})

describe('stringEquals - case insensitive', () => {
  const opts = {
    stringEquals: (a, b) => equals(toLower(a), toLower(b))
  }
  test(opts, T, { s: 'test' }, { s: 'test' })
  test(opts, T, { s: 'teST' }, { s: 'Test' })
  test(opts, F, { s: 'teSTe' }, { s: 'Test' })
  test(opts, F, { s: 'test' }, { s: 'testX' })
})

describe('numberEquals: +/-1', () => {
  const opts = {
    numberEquals: (a, b) => a >= b - 1 && a <= b + 1
  }
  test(opts, T, { x: 1 }, { x: 1 })
  test(opts, T, { x: 1 }, { x: 2 })
  test(opts, T, { x: { a: 3 } }, { x: { a: 2 } })
  test(opts, F, { x: 4 }, { x: 2 })
  test(opts, T, { x: -1 }, { x: 0 })
})

describe('booleanEquals - force source to boolean', () => {
  const opts = {
    booleanEquals: (a, b) => a === !!b
  }
  test(opts, T, { x: true }, { x: 1 })
  test(opts, F, { x: true }, { x: 0 })
  test(opts, T, { x: false }, { x: 0 })
  test(opts, T, { x: true }, { x: 'test' })
  test(opts, T, { x: false }, { x: false })
  test(opts, T, false, false)
  test(opts, T, false, 0)
  test(opts, F, false, 1)
})

describe('error handling', () => {
  const opts = {
    errorHandler: (e) => {
      //console.error("whereDeep error", e)
      return "fail"
    }
  }
  test({}, false, {a:{b:2}}, { })
  test(opts, "fail", {a:{b:2}}, { x: 1 })
})

// https://github.com/ramda/ramda/issues/1032
describe('edge case: array prototype modification', () => {
  Array.prototype.fooObj = {}
  Array.prototype.barFunc = function() {}
  const arrayHasObject = {fooObj: Array.prototype.fooObj}
  const arrayHasFunc = {barFunc: Array.prototype.barFunc}

  test({}, true, arrayHasObject , [])
  test({}, false, arrayHasFunc, [])      // inconsistent!
  test({allowFunctions: false}, true, arrayHasFunc, [])     // switch to override the inconsistency

  it("where case obj", ()=>{ expect(where(equals(arrayHasObject), [])).true })
  it("where case Func",()=>{ expect(where(arrayHasFunc,   [])).false })  
  it("whereEq case obj", ()=>{ expect(whereEq(arrayHasObject, [])).true })
  it("whereEq case Func",()=>{ expect(whereEq(arrayHasFunc,   [])).true })

})

describe('allowRegExp flag', () => {
  const t = [{a:/a/} , {a:"aa"}]
  test({}, true, ...t)
  test({allowRegExp: true}, true, ...t)
  test({allowRegExp: false}, false, ...t)
})

describe('allowFunctions flag', () => {
  const t = [{a:x=>toUpper(x)==="AA"} , {a:"aa"}]
  test({}, true, ...t)
  test({allowFunctions: true}, true, ...t)
  test({allowFunctions: false}, false, ...t)
})