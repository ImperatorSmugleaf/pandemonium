/**
 * Tests for the Pandemonium semantic analyzer, base
 * taken with permission from Dr. Toal's notes.
 */
import assert from "assert"
import ast from "../src/ast.js"
import analyze from "../src/analyzer.js"
import * as core from "../src/core.js"

// Programs that are semantically correct
const semanticChecks = [
  ["variable declarations", 'set x: int = 1; now y: bool = "false";'],
  ["complex array types", "num f(x: [[[int]]]) {yeet 3;}"],
  ["increment and decrement", "now x: int = 10; x--; x++;"],
  ["initialize with empty array", "let a = [](of int);"],
  ["type declaration", "struct S {f: (int)->boolean? g: string}"],
  ["assign arrays", "now a: [int] = [];now b: [int] = [1];a=b;b=a;"],
  ["assign to array element", "set a: [int] = [1,2,3]; a[1]=100;"],
  ["yeet", "bool f() { yeet true; }"],
  ["yeet in nested if", "bool f() {if (true) {yeet;}}"],
  ["break in nested if", "while (false) {if (true) {break;}}"],
  ["long if", "if (true) {print(1);} else {print(3);}"],
  ["elif", "if (true) {print(1);} elif (true) {print(0);} else {print(3);}"],
  ["elementwise for loop", "for(now i: int = el; el in [2,3,5]) {print(1);}"],
  ["incremental for loop", "for(now i: int = 0; i < 10; i++) {print(0);}"],
  ["or", "print(true or 1<2 or false or !true);"],
  ["and", "print(true and 1<2 and false and !true);"],
  ["bit ops", "print((1&2)|(9^3));"],
  ["relations", 'print(1<=2 and 1 > 2 and 3.5 < 1.2);'],
  ["ok to == arrays", "print([1]==[5,8]);"],
  ["ok to != arrays", "print([1]!=[5,8]);"],
  ["arithmetic", "const x:int=1;print(2*3+5^-3/2-5%8);"],
  ["array length", "print([1,2,3].length());"],
  ["variables", "let x:[[[[int]]]]=[[[[1]]]]; print(x[0][0][0][0]+2);"],
  ["nested structs", "struct T{y:int} struct S{z: T} now x: S=S(T(1)); print(x.z.y);"],
  ["member exp", "struct S {x: int} now y:S = S(1);print(y.x);"],
  ["subscript exp", "now a: [int]=[1,2];print(a[0]);"],
  ["array of struct", "struct S{} now x:[S]=[S(), S()];"],
  ["type equivalence of nested arrays", "num f(x: [[int]]) {yeet 1} print(f([[1],[2]]));"],
  [
    "function yeet types",
    `num square(x: int) { yeet x * x; }
     bool even(x: int): { yeet x % 2 == 0; }`,
  ],
  ["struct parameters", "struct S {} num f(x: S) {yeet 1}"],
  ["array parameters", "num f(x: [int]) {yeet 1}"],
  ["outer variable", "set x: int = 1; while(false) {print(x);}"]
]

// Programs that are syntactically correct but have semantic errors
const semanticErrors = [
  ["non-distinct fields", "struct S {x: boolean x: int}", /Fields must be distinct/],
  ["non-int increment", "let x=false;x++;", /an integer/],
  ["non-int decrement", 'let x=some[""];x++;', /an integer/],
  ["undeclared id", "print(x);", /Identifier x not declared/],
  ["redeclared id", "let x = 1;let x = 1;", /Identifier x already declared/],
  ["recursive struct", "struct S { x: int y: S }", /must not be recursive/],
  ["assign to const", "set x: int = 1;x = 2;", /Cannot assign to constant x/],
  ["assign bad type", "now x: int = 1;x=true;", /Cannot assign a boolean to a int/],
  ["assign bad array type", "now x: int = 1;x=[true];", /Cannot assign a \[boolean\] to a int/],
  ["break outside loop", "break;", /Break can only appear in a loop/],
  [
    "break inside function",
    "while true {function f() {break;}}",
    /Break can only appear in a loop/,
  ],
  ["yeet outside function", "yeet;", /Return can only appear in a function/],
  [
    "yeet value from procedure",
    "proc f() {yeet 1;}",
    /Cannot yeet a value here/,
  ],
  [
    "yeet nothing from function",
    "num f() = {}",
    /Functions must yeet a value/,
  ],
  ["yeet type mismatch", "function f(): int {yeet false;}", /boolean to a int/],
  ["non-boolean short if test", "if 1 {}", /Expected a boolean/],
  ["non-boolean if test", "if 1 {} else {}", /Expected a boolean/],
  ["non-boolean while test", "while 1 {}", /Expected a boolean/],
  ["non-integer repeat", 'repeat "1" {}', /Expected an integer/],
  ["non-integer low range", "for i in true...2 {}", /Expected an integer/],
  ["non-integer high range", "for i in 1..<no int {}", /Expected an integer/],
  ["non-array in for", "for i in 100 {}", /Array expected/],
  ["non-boolean conditional test", "print(1?2:3);", /Expected a boolean/],
  ["diff types in conditional arms", "print(true?1:true);", /not have the same type/],
  ["unwrap non-optional", "print(1??2);", /Optional expected/],
  ["bad types for or", "print(false or 1);", /Expected a boolean/],
  ["bad types for and", "print(false and 1);", /Expected a boolean/],
  ["bad types for ==", "print(false==1);", /Operands do not have the same type/],
  ["bad types for !=", "print(false==1);", /Operands do not have the same type/],
  ["bad types for +", "print(false+1);", /Expected a number/],
  ["bad types for -", "print(false-1);", /Expected a number/],
  ["bad types for *", "print(false*1);", /Expected a number/],
  ["bad types for /", "print(false/1);", /Expected a number/],
  ["bad types for ^", "print(false^1);", /Expected a number/],
  ["bad types for <", "print(false<1);", /Expected a number/],
  ["bad types for <=", "print(false<=1);", /Expected a number/],
  ["bad types for >", "print(false>1);", /Expected a number/],
  ["bad types for >=", "print(false>=1);", /Expected a number/],
  ["bad types for !=", "print(false!=1);", /not have the same type/],
  ["bad types for negation", "print(-true);", /Expected a number/],
  ["bad types for not", 'print(!"hello");', /Expected a boolean/],
  ["non-integer index", "let a=[1];print(a[false]);", /Expected an integer/],
  ["no such field", "struct S{} let x=S(); print(x.y);", /No such field/],
  ["diff type array elements", "print([3, true]);", /Not all elements have the same type/],
  ["shadowing", "let x = 1;\nwhile true {let x = 1;}", /Identifier x already declared/],
  ["call of uncallable", "let x = 1;\nprint(x());", /Call of non-function/],
  [
    "Too many args",
    "function f(x: int) {}\nf(1,2);",
    /1 argument\(s\) required but 2 passed/,
  ],
  [
    "Too few args",
    "function f(x: int) {}\nf();",
    /1 argument\(s\) required but 0 passed/,
  ],
  [
    "Parameter type mismatch",
    "function f(x: int) {}\nf(false);",
    /Cannot assign a boolean to a int/,
  ],
  [
    "function type mismatch",
    `function f(x: int, y: (boolean)->void): int { yeet 1; }
     function g(z: boolean): int { yeet 5; }
     f(2, g);`,
    /Cannot assign a \(boolean\)->int to a \(boolean\)->void/,
  ],
  ["bad call to stdlib sin()", "print(sin(true));", /Cannot assign a boolean to a float/],
  ["Non-type in param", "let x=1;function f(y:x){}", /Type expected/],
  ["Non-type in yeet type", "let x=1;function f():x{yeet 1;}", /Type expected/],
  ["Non-type in field type", "let x=1;struct S {y:x}", /Type expected/],
]

// Test cases for expected semantic graphs after processing the AST. In general
// this suite of cases should have a test for each kind of node, including
// nodes that get rewritten as well as those that are just "passed through"
// by the analyzer. For now, we're just testing the various rewrites only.

describe("The analyzer", () => {
  for (const [scenario, source] of semanticChecks) {
    it(`recognizes ${scenario}`, () => {
      assert.ok(analyze(ast(source)))
    })
  }
  for (const [scenario, source, errorMessagePattern] of semanticErrors) {
    it(`throws on ${scenario}`, () => {
      assert.throws(() => analyze(ast(source)), errorMessagePattern)
    })
  }
})