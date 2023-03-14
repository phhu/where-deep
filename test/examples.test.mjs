import { expect } from 'chai'
import { filter, equals, toLower } from 'ramda'

import { arrayWhereAny } from '../arrayWhere.mjs'
import whereDeep from '../index.mjs'

/* global it,describe */

describe('example', () => {
  const source = [
    {
      name: { first: 'Test', last: 'Person' },
      tags: [
        { name: 'kite surfing', count: 2 },
        { name: 'potatoes', count: 1 },
        { name: 'javascript', count: 1 }
      ]
    },
    {
      name: { first: 'Another', last: 'Person' },
      tags: [
        { name: 'kite surfing', count: 1 },
        { name: 'beetroot', count: 1 },
        { name: 'soap operas', count: 3 }
      ]
    },
    {
      name: { first: 'Paddington', last: 'Bear' },
      tags: [
        { name: 'Marmalade', count: 2, comment: 'in sandwiches' },
        { name: 'Friends', count: 2 }
      ],
      company: 'not used'
    }
  ]

  it('example 1', () => {
    const search = [{
      tags: [{ name: 'kite surfing' }]
    }]
    expect(whereDeep({}, search, source)).true
  })

  it('example 2', () => {
    const search = {
      name: { last: 'Person' },
      tags: [{ name: 'kite surfing' }]
    }
    const result = filter(whereDeep({}, search), source)
    expect(result).deep.equals([source[0], source[1]])
  })

  it('example 3', () => {
    const search = {
      tags: [{ count: 2 }]
    }
    const result = filter(whereDeep({}, search), source)
    expect(result).deep.equals([source[0], source[2]])
  })

  it('example 4 - using a regular expression and a function', () => {
    const search = {
      name: { first: /^(test|paddi.*)$/i },
      tags: [{ count: x => x >= 2 }]
    }
    const result = filter(whereDeep({}, search), source)
    expect(result).deep.equals([source[0], source[2]])
  })

  it('example 5 - using function overrides', () => {
    const opts = {
      arrayWhere: arrayWhereAny,
      stringEquals: (a, b) => equals(toLower(a), toLower(b)), // caseInsensitive
      numberEquals: n => x => x >= n // at least by default on numbers
    }
    const search = {
      tags: [
        { name: 'kite SURFING', count: 2 },
        { name: 'painting' },
        { name: 'Marmalade', count: x => x === 2 }
      ]
    }
    const result = filter(whereDeep(opts, search), source)
    expect(result).deep.equals([source[0], source[2]])
  })
})
