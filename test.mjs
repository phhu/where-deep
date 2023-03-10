import { whereEq, map, where, equals } from 'ramda'


const o = { s: 'str', b: true, o:{p:1} }



console.log(
  where({
    s: equals("str"),
    b: equals(true),
    o: where({p:equals(1)}),
  },o)

);