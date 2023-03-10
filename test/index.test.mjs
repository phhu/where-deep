import { expect } from 'chai'
import * as WD from '../index.mjs'

const source = {
  //ae: [],
  //a1: [1],
  //a2: [1, 2],
  b: true,
  n: 1,
  o: {p:1,q:"two",x:3},
  s: 'str',
  z: null,
}

const test = fnName => {
  
  const fn = res => filter => it(
    `${fnName}: ${JSON.stringify(filter)}`, 
    () => { 
      expect(WD[fnName](filter, source))[res] 
    }
  )
  const T = fn("true")
  const F = fn("false")

  // T({ s: 'str', b: true })
  // T({ s: 'str', b: true })
  // F({ s: 'strx', b: false })
  F({ s: 'str', b: true, o:{p:1,q:"two",x:1} }) 
  T({ s: 'str', b: true, o:{p:1,q:"two"} })  
  
}

describe('test', () => {
  for (const key in WD) {
    test(key)
  }
})



