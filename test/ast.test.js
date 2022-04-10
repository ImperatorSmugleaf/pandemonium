/**
 * Tests for the Pandemonium AST, base
 * taken with permission form Dr. Toal's notes.
 */

import assert from "assert/strict";
import util from "util";
import ast from "../src/ast.js";

const source = `set oneThroughFive: [num] = [1, 2, 3, 4, 5];
set counting: bool = true;

proc main([string] args) {
    now count: num = 0;
    while(counting) {
        print(oneThroughTen[count]);
        count++;
        --count;
        nope;
    }

    count += 10;
    count -= 5;
    count = cube(count);
    count = !(124.623E-12) or ((2 < 4) == false and 6++ + 12 * 10 ^ ++0 );
    print(oneThroughFive.pop());
    success();
}

num cube(num x) {
    set triple: num = x * x * x;
    yeet triple;
}`;

const expected = `   1 | Program statements=[#2,#5,#6,#37]
   2 | VariableDeclaration id=(id,"oneThroughFive") type=#3 initializer=#4 readOnly=true
   3 | ListDeclaration type=(sym,"num")
   4 | List elements=[(num,"1"),(num,"2"),(num,"3"),(num,"4"),(num,"5")]
   5 | VariableDeclaration id=(id,"counting") type=(sym,"bool") initializer=(bool,"true") readOnly=true
   6 | ProcedureDeclaration proc=(id,"main") parameters=[#7] body=#9
   7 | Parameter type=#8 id=(id,"args")
   8 | ListDeclaration type=(sym,"string")
   9 | Block statements=[#10,#11,#18,#19,#20,#22,#33,#36]
  10 | VariableDeclaration id=(id,"count") type=(sym,"num") initializer=(num,"0") readOnly=false
  11 | WhileStatement test=(id,"counting") body=#12
  12 | Block statements=[#13,#15,#16,#17]
  13 | PrintStatement argument=[#14]
  14 | MemberAccess object=(id,"oneThroughTen") property=(id,"count")
  15 | Increment variable=(id,"count") prefix=false
  16 | Decrement variable=(id,"count") prefix=true
  17 | NopeStatement 
  18 | Assignment target=(id,"count") operator=(sym,"+=") source=(num,"10")
  19 | Assignment target=(id,"count") operator=(sym,"-=") source=(num,"5")
  20 | Assignment target=(id,"count") operator=(sym,"=") source=#21
  21 | FunctionCall callee=(id,"cube") args=[(id,"count")]
  22 | Assignment target=(id,"count") operator=(sym,"=") source=#23
  23 | BinaryExpression op=(sym,"or") left=#24 right=#25
  24 | UnaryExpression op=(sym,"!") operand=(num,"124.623E-12")
  25 | BinaryExpression op=(sym,"and") left=#26 right=#28
  26 | BinaryExpression op=(sym,"==") left=#27 right=(bool,"false")
  27 | BinaryExpression op=(sym,"<") left=(num,"2") right=(num,"4")
  28 | BinaryExpression op=(sym,"+") left=#29 right=#30
  29 | UnaryExpression op=(num,"6") operand=(sym,"++")
  30 | BinaryExpression op=(sym,"*") left=(num,"12") right=#31
  31 | BinaryExpression op=(sym,"^") left=(num,"10") right=#32
  32 | UnaryExpression op=(sym,"++") operand=(num,"0")
  33 | PrintStatement argument=[#34]
  34 | FunctionCall callee=#35 args=[]
  35 | MemberAccess object=(id,"oneThroughFive") property=(id,"pop")
  36 | ProcedureCall callee=(id,"success") args=[]
  37 | FunctionDeclaration type=(sym,"num") func=(id,"cube") parameters=[#38] body=#39
  38 | Parameter type=(sym,"num") id=(id,"x")
  39 | Block statements=[#40,#43]
  40 | VariableDeclaration id=(id,"triple") type=(sym,"num") initializer=#41 readOnly=true
  41 | BinaryExpression op=(sym,"*") left=#42 right=(id,"x")
  42 | BinaryExpression op=(sym,"*") left=(id,"x") right=(id,"x")
  43 | YeetStatement argument=(id,"triple")`;

describe("The AST generator", () => {
    it("produces the expected AST for all node types", () => {
        assert.deepEqual(util.format(ast(source)), expected);
    });
});
