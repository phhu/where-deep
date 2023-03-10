import { expect } from 'chai'
import * as WD from '../index.mjs'

const source = {
  //ae: [],
  //a1: [1],
  a2: [1, 2],
  ao: [1,"str",{p:1,q:"two",x:3}],
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

  T({ s: 'str', b: true })
  T({ s: 'str', b: true })
  F({ s: 'strx', b: false })
  F({ s: 'str', b: true, o:{p:1,q:"two",x:1} }) 
  T({ s: 'str', b: true, o:{p:1,q:"two"} })  
  F({ s: 'str', b: true, o:{p:2,q:"two"} })  

  T({ s: 'str', b: true, a2: [1] }) 
  T({ s: 'str', b: true, a2: [1,2] }) 
  F({ s: 'str', b: true, a2: [1,3] }) 

  T({ s: 'str', b: true, ao: [1,"str"] }) 
  T({ s: 'str', b: true, ao: [1,{x:3}] }) 
  F({ s: 'str', b: true, ao: [1,{x:4}] })
  F({ s: 'str', b: true, ao: [1,{z:4}] })

  T({ s: 'str', b: true, ao: [1,1] })     // weak version - array elements replaced
}

describe('test', () => {
  for (const key in WD) {
    test(key)
  }
})



