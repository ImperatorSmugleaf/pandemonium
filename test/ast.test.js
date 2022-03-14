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
    count = !(124.623E-12) || ((2 < 4) == false && 6++ + 12 * 10 ^ ++0 );
    print(oneThroughFive.pop());
    success();
}

num cube(num x) {
    set triple: num = x * x * x;
    yeet triple;
}`;

const expected = `   1 | Program statements=[#2,#4,#5,#36]
   2 | VariableDeclaration variable=(Id,"oneThroughFive") type=#3 initializer=[(Num,"1"),(Num,"2"),(Num,"3"),(Num,"4"),(Num,"5")] readOnly=true
   3 | ListType type=(Sym,"num")
   4 | VariableDeclaration variable=(Id,"counting") type=(Sym,"bool") initializer=(Bool,"true") readOnly=true
   5 | ProcedureDeclaration proc=(Id,"main") params=[#6] body=#8
   6 | Parameter type=#7 id=(Id,"args")
   7 | ListType type=(Sym,"string")
   8 | Block statements=[#9,#10,#17,#18,#19,#21,#32,#35]
   9 | VariableDeclaration variable=(Id,"count") type=(Sym,"num") initializer=(Num,"0") readOnly=false
  10 | WhileStatement test=(Id,"counting") body=#11
  11 | Block statements=[#12,#14,#15,#16]
  12 | PrintStatement argument=[#13]
  13 | MemberAccess object=(Id,"oneThroughTen") property=(Id,"count")
  14 | Increment variable=(Id,"count")
  15 | Increment variable=(Id,"count")
  16 | NopeStatement 
  17 | Assignment target=(Id,"count") operator=(Sym,"+=") source=(Num,"10")
  18 | Assignment target=(Id,"count") operator=(Sym,"-=") source=(Num,"5")
  19 | Assignment target=(Id,"count") operator=(Sym,"=") source=#20
  20 | FunctionCall callee=(Id,"cube") args=[(Id,"count")]
  21 | Assignment target=(Id,"count") operator=(Sym,"=") source=#22
  22 | BinaryExpression op=(Sym,"||") left=#23 right=#24
  23 | UnaryExpression op=(Sym,"!") operand=(Num,"124.623E-12")
  24 | BinaryExpression op=(Sym,"&&") left=#25 right=#27
  25 | BinaryExpression op=(Sym,"==") left=#26 right=(Bool,"false")
  26 | BinaryExpression op=(Sym,"<") left=(Num,"2") right=(Num,"4")
  27 | BinaryExpression op=(Sym,"+") left=#28 right=#29
  28 | UnaryExpression op=(Num,"6") operand=(Sym,"++")
  29 | BinaryExpression op=(Sym,"*") left=(Num,"12") right=#30
  30 | BinaryExpression op=(Sym,"^") left=(Num,"10") right=#31
  31 | UnaryExpression op=(Sym,"++") operand=(Num,"0")
  32 | PrintStatement argument=[#33]
  33 | MemberAccess object=(Id,"oneThroughFive") property=#34
  34 | FunctionCall callee=(Id,"pop") args=[]
  35 | ProcedureCall callee=(Id,"success") args=[]
  36 | FunctionDeclaration type=(Sym,"num") func=(Id,"cube") params=[#37] body=#38
  37 | Parameter type=(Sym,"num") id=(Id,"x")
  38 | Block statements=[#39,#42]
  39 | VariableDeclaration variable=(Id,"triple") type=(Sym,"num") initializer=#40 readOnly=true
  40 | BinaryExpression op=(Sym,"*") left=#41 right=(Id,"x")
  41 | BinaryExpression op=(Sym,"*") left=(Id,"x") right=(Id,"x")
  42 | YeetStatement argument=(Id,"triple")`;

describe("The AST generator", () => {
    it("produces the expected AST for all node types", () => {
        assert.deepEqual(util.format(ast(source)), expected);
    });
});
