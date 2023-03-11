import { expect } from 'chai'
import { equals, whereAny, toLower } from 'ramda'
import { whereDeep } from '../index.mjs'
import * as AW from '../arrayWhere.mjs'

const source = {
  a0: [],
  a1: [1],
  a2: [1, 2],
  ao: [1, 'str', { p: 1, q: 'two', x: 3 }, { p: 2, q: 'two', z: 5 }],
  b: true,
  n: 1,
  o: { p: 1, q: 'two', x: 3 },
  s: 'str',
  z: null
}
console.log('source', source)

const test = (
  opts = {}, spec, src, value
) = it(
  `${value?"T":"F"}: ${JSON.stringify(spec)} = ${src===source ? "[source]":JSON.stringify(src)}`, 
  () => expect( 
    whereDeep(opts, spec, src) 
  ).equal(value)
)

const opts = {}
const T = true
const F = false

describe('whereDeep basic behaviour', ()=>{
  const testsrc = (value,spec) => test({}, spec, source, value)
  testsrc (T,{ s: 'str', b: true })
  testsrc (T,{ s: 'str', b: true })
  testsrc (F,{ s: 'strx', b: true })
  testsrc (F,{ s: 'str', b: true, o: { p: 1, q: 'two', x: 1 } })
  testsrc (T,{ s: 'str', b: true, o: { p: 1, q: 'two' } },T)
  testsrc (F,{ s: 'str', b: true, o: { p: 2, q: 'two' } })
  testsrc (T,{ s: 'str', b: true, a2: [1] })
  testsrc (T,{ s: 'str', b: true, a2: [1, 2] })
  testsrc (F,{ s: 'str', b: true, a2: [1, 3] })
  testsrc (T,{ s: 'str', b: true, ao: [1, 'str'] })
  testsrc (T,{ s: 'str', b: true, ao: [1, { x: 3 }] })
  testsrc (F,{ s: 'str', b: true, ao: [1, { x: 4 }] })
  testsrc (F,{ s: 'str', b: true, ao: [1, { z: 4 }] })
  testsrc (T,{ s: 'str', b: true, ao: [1] })
  testsrc (T,{ ao: ['str', 1] })
  testsrc (T,{ ao: [1, 'str'] })
  testsrc (T,{ ao: [{ p: 1, q: 'two' }, { p: 2, q: 'two' }] })
  testsrc (T,{ ao: [1, 'str'] })
  testsrc (F,{ s: 'str', b: true, ao: [1, 1] }) // T in weak version
  testsrc (T,{ ao: [{ q: 'two' }, { p: 1, q: 'two' }] }) // F if ordered
  testsrc (T,{ ao: [{ q: 'two' }, { p: 2, q: 'two' }] })
  testsrc (T,{ a0: [] })
  testsrc (F,{ a0: [1] })
  testsrc (T,{ a1: [] })
  testsrc (T,{ a1: [1] })
  testsrc (F,{ a1: [2] })
  testsrc (T,{ s: /str/ })
  testsrc (T,{ s: equals('str') })
})


describe('degenerates', () => {
  const opts = {}
  test(opts,{ a: 1 }, { a: 1 }, true)
  test(opts,[1], [], false)
  test(opts,[], [], true)
  test(opts,'test', 'test', true)
  test(opts,'testa', 'test', false)
  test(opts,1, 1, true)
  test(opts,0, 0, true)
  test(opts,'', '', true)
  test(opts,true, true, true)
  test(opts,false, false, true)
  test(opts,{}, {}, true)
  test(opts,null, null, true)
  test(opts,undefined, undefined, false)
  test(opts,undefined, 1, false)
  test(opts,1, undefined, false)
  test(opts,0, {}, false) // ?
})

describe('arrayWhere = arrayWhereWeak', () => {
  const opts = { 
    arrayWhere: AW.arrayWhereWeak 
  }
  test(opts,{ ao: [1, 1] }, source, true)
})

describe('arrayWhere = arrayWhereStrongOrdered', () => {
  const opts = { 
    arrayWhere:  AW.arrayWhereStrongOrdered
  }
  test(opts,{ ao: [{ q: 'two' }, { p: 1, q: 'two' }] }, source, false)
})


describe('objectWhere - whereAny', () => {
  const opts = { 
    objectWhere: whereAny 
  }
  test(opts, { o: { a: 1, b: 3 } }, { o: { a: 1, b: 2, c: 3 } }, true)
  test(opts, { o: { a: 1, b: 2, d: 4 } }, { o: { a: 1, b: 2, c: 3 } }, true)
  test(opts, { o: {} }, { o: { a: 1, b: 2, c: 3 } }, false)
})


describe('stringEquals', () => {
  const opts = {
    stringEquals: (a, b) => equals(toLower(a), toLower(b))
  }
  test(opts, { s: "test" }, { s: "test" }, true)
  test(opts, { s: "teST" }, { s: "Test" }, true)
  test(opts, { s: "teSTe" }, { s: "Test" }, false)
  test(opts, { s: "test" }, { s: "testX" }, false)
})


describe('numberEquals: +/-1', () => {
  const opts = {
    numberEquals: (a, b) => a >= b - 1 && a <= b + 1
  }
  test(opts, { x: 1 }, { x: 1 }, true)
  test(opts, { x: 1 }, { x: 2 }, true)
  test(opts, { x: { a: 3 } }, { x: { a: 2 } }, true)
  test(opts, { x: 4 }, { x: 2 }, false)
  test(opts, { x: -1 }, { x: 0 }, true)
})

describe('booleanEquals - force source to boolean', () => {
  const opts = {
    booleanEquals: (a, b) => a === !!b
  }
  test(opts, { x: true }, { x: 1 }, T)
  test(opts, { x: true }, { x: 0 }, F)
  test(opts, { x: false }, { x: 0 }, T)
  test(opts, { x: true }, { x: "test" }, T)
  test(opts, { x: false }, { x: false }, T)
  test(opts, false, false, T)
  test(opts, false, 0, T)
  test(opts, false, 1, F)
})
