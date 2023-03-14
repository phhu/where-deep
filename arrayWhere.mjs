import {
  any, all, curry, filter, type,
  clone, findIndex, is, partition, zip, includes
} from 'ramda'
import { permute } from './permutate.mjs'

export const arrayWhereWithReplacement = curry(
  ({ originalValues }, spec, src) => all(specEl => any(specEl, src), spec)
)

export const arrayWhereAny = curry(
  ({ originalValues }, spec, src) => any(specEl => any(specEl, src), spec)
)

export const arrayWhereAllOrdered = curry(
  ({ originalValues }, spec, src) => {
    const rmSrc = clone(src)
    for (const test of spec) {
      const idx = findIndex(test, rmSrc)
      if (idx === -1) {
        return false
      } else {
        rmSrc.splice(idx, 1)
      }
    }
    return true
  }
)

export const arrayWhereAllUnordered = curry(
  ({ originalValues }, spec, src) => {
    const rmSrc = clone(src)

    const originalValueMap = new Map(zip(spec, originalValues))
    const [specObjs, specVals] = partition(
      x => includes(type(originalValueMap.get(x)), ['Array', 'Object']), // is(Object, originalValueMap.get(x)),
      spec
    )
    // console.log({specObjs, specVals, originalValues, originalValueMap})

    // values are fungible, so don't need to be permutated
    for (const test of specVals) {
      const idx = findIndex(x => test(x), rmSrc)
      if (idx === -1) {
        return false // fail fast without checking objects
      } else {
        rmSrc.splice(idx, 1)
        // src = remove(idx,1,src)
      }
    }
    if (specObjs.length === 0) { return true } // if no objects, must have found all items

    // get all permutations of objects in spec,
    // and check that at least one satisfies the
    const srcObjs = filter(is(Object), src) // we can only match objects
    for (const tests of permute(specObjs)) {
      const pRmSrc = clone(srcObjs) //
      let permutationResult = true
      for (const test of tests) {
        const idx = findIndex(x => test(x), pRmSrc)
        if (idx === -1) {
          permutationResult = false
          break // item not found, so move on to next permutation
        } else {
          pRmSrc.splice(idx, 1) // remove the matching items
        }
      }
      if (permutationResult === true) { return true } // the permutation passes, so don't check any more
    }
    return false // no perumation passed
  }
)
