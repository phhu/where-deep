export function * permute (permutation) {
  const length = permutation.length
  const c = Array(length).fill(0)
  let i = 1; let k; let p

  yield permutation.slice()
  while (i < length) {
    if (c[i] < i) {
      k = i % 2 && c[i]
      p = permutation[i]
      permutation[i] = permutation[k]
      permutation[k] = p
      ++c[i]
      i = 1
      yield permutation.slice()
    } else {
      c[i] = 0
      ++i
    }
  }
}
