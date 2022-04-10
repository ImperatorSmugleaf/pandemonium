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

const expected = `   1 | Program statements=[#2,#4,#5,#36]
   2 | VariableDeclaration id=(id,"oneThroughFive") type=#3 initializer=[(num,"1"),(num,"2"),(num,"3"),(num,"4"),(num,"5")] readOnly=true
   3 | ListDeclaration type=(sym,"num")
   4 | VariableDeclaration id=(id,"counting") type=(sym,"bool") initializer=(bool,"true") readOnly=true
   5 | ProcedureDeclaration proc=(id,"main") parameters=[#6] body=#8
   6 | Parameter type=#7 id=(id,"args")
   7 | ListDeclaration type=(sym,"string")
   8 | Block statements=[#9,#10,#17,#18,#19,#21,#32,#35]
   9 | VariableDeclaration id=(id,"count") type=(sym,"num") initializer=(num,"0") readOnly=false
  10 | WhileStatement test=(id,"counting") body=#11
  11 | Block statements=[#12,#14,#15,#16]
  12 | PrintStatement argument=[#13]
  13 | MemberAccess object=(id,"oneThroughTen") property=(id,"count")
  14 | Increment variable=(id,"count")
  15 | Increment variable=(id,"count")
  16 | NopeStatement 
  17 | Assignment target=(id,"count") operator=(sym,"+=") source=(num,"10")
  18 | Assignment target=(id,"count") operator=(sym,"-=") source=(num,"5")
  19 | Assignment target=(id,"count") operator=(sym,"=") source=#20
  20 | FunctionCall callee=(id,"cube") args=[(id,"count")]
  21 | Assignment target=(id,"count") operator=(sym,"=") source=#22
  22 | BinaryExpression op=(sym,"or") left=#23 right=#24
  23 | UnaryExpression op=(sym,"!") operand=(num,"124.623E-12")
  24 | BinaryExpression op=(sym,"and") left=#25 right=#27
  25 | BinaryExpression op=(sym,"==") left=#26 right=(bool,"false")
  26 | BinaryExpression op=(sym,"<") left=(num,"2") right=(num,"4")
  27 | BinaryExpression op=(sym,"+") left=#28 right=#29
  28 | UnaryExpression op=(num,"6") operand=(sym,"++")
  29 | BinaryExpression op=(sym,"*") left=(num,"12") right=#30
  30 | BinaryExpression op=(sym,"^") left=(num,"10") right=#31
  31 | UnaryExpression op=(sym,"++") operand=(num,"0")
  32 | PrintStatement argument=[#33]
  33 | FunctionCall callee=#34 args=[]
  34 | MemberAccess object=(id,"oneThroughFive") property=(id,"pop")
  35 | ProcedureCall callee=(id,"success") args=[]
  36 | FunctionDeclaration type=(sym,"num") func=(id,"cube") parameters=[#37] body=#38
  37 | Parameter type=(sym,"num") id=(id,"x")
  38 | Block statements=[#39,#42]
  39 | VariableDeclaration id=(id,"triple") type=(sym,"num") initializer=#40 readOnly=true
  40 | BinaryExpression op=(sym,"*") left=#41 right=(id,"x")
  41 | BinaryExpression op=(sym,"*") left=(id,"x") right=(id,"x")
  42 | YeetStatement argument=(id,"triple")`;

describe("The AST generator", () => {
    it("produces the expected AST for all node types", () => {
        assert.deepEqual(util.format(ast(source)), expected);
    });
});
