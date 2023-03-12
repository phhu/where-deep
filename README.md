A deep version of Ramda's `whereEq` and `where` ([docs](https://ramdajs.com/docs/#where)), allowing JSON-like declarative predicates for filtering functions etc. 

Nested arrays and objects can be included in the spec. This allows the spec object to have the same shape (and to be a subset of) the test object, meaning you can just copy and trim its JSON representation to make a filter.

Values in the spec will be tested using ramda's `equals` (as with `whereEq`). Functions can also be included, as per `where`. RegExp literals can be used to test values (as strings).

An options object allows overriding of default `where...` functions used with objects and arrays; and default `equals` functions used with values (strings, numbers, booleans and nulls). 

# Synopsis

```js
import * as R from 'ramda';
import {
  whereDeep, 
  arrayWhereAllUnordered, arrayWhereAllOrdered, 
  arrayWhereAny, arrayWhereWithReplacement
} from 'where-deep';
// import whereDeep from 'where-deep'; // default import 
const opts = {
  // arrayWhere: arrayWhereAllUnordered   
  // objectWhere: R.where    // R.whereAny also possible
  // stringEquals: R.equals  
  // numberEquals: R.equals
  // booleanEquals: R.equals
  // nullEquals: R.equals
};
const spec = {
  a: 1,
  c: [{d:4}] 
};
const testObj = {
  a: 1,
  b: 2,
  c: [{d:4, e:5},{d:"six"}]
};
whereDeep(opts, spec, testObj);  // true 
R.filter( whereDeep(opts, {c: [{d: "seven"}] }), [testObj] );  // []
R.filter( whereDeep(opts, {
  b: x => x>1,
  c: [ {d: /(six|seven)/i} ]
}), [testObj] );   // [testObj]
```

# Examples

See [test/examples.test.mjs](https://github.com/phhu/where-deep/blob/main/test/examples.test.mjs)

# References

* Ramda where: https://ramdajs.com/docs/#where
* NPM: https://www.npmjs.com/package/where-deep
