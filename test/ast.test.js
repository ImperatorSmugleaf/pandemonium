/**
 * Tests for the Pandemonium AST, base
 * taken with permission form Dr. Toal's notes.
 */

import assert from "assert/strict";
import util from "util";
import ast from "../src/ast.js";

const source = `now oneThroughFive: [num] = [1, 2, 3, 4, 5];
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

    now containers: NumberContainer = [];
    for (set newNum: num = i; i in [<-oneThroughFive]) {
        set container: NumberContainer = new NumberContainer(newNum);
        print((num x) -> container.number * x);
        containers.push(container);
    }

    for (set i: num = 0; i < 5; () [i] -> i++) {
        oneThroughFive[i] = i;
    }
}

num cube(num x) {
    set triple: num = x * x * x;
    yeet triple;
}

if(end) {
    set done: bool = true;
} elif (penultimate) {
    set done: num = 0.5;
}

if(done) {
    print(\`That's all, folks! The final answer is: #{(oneThroughFive)}\`);
} elif (!done) {
    set this.panic: bool = true;
} else {
    contingencyPlans[0].activate();
}`;

const expected = `   1 | Program statements=[#2,#5,#6,#61,#68,#74]
   2 | VariableDeclaration id=(id,"oneThroughFive") type=#3 initializer=#4 readOnly=false
   3 | ListDeclaration type=(sym,"num")
   4 | List elements=[(num,"1"),(num,"2"),(num,"3"),(num,"4"),(num,"5")]
   5 | VariableDeclaration id=(id,"counting") type=(sym,"bool") initializer=(bool,"true") readOnly=true
   6 | ProcedureDeclaration name=(id,"main") parameters=[#7] body=#9
   7 | Parameter type=#8 id=(id,"args")
   8 | ListDeclaration type=(sym,"string")
   9 | Block statements=[#10,#11,#18,#19,#20,#22,#33,#36,#37,#39,#53]
  10 | VariableDeclaration id=(id,"count") type=(sym,"num") initializer=(num,"0") readOnly=false
  11 | WhileStatement test=(id,"counting") body=#12
  12 | Block statements=[#13,#15,#16,#17]
  13 | PrintStatement argument=#14
  14 | ListAccess list=(id,"oneThroughTen") exp=(id,"count")
  15 | Increment variable=(id,"count") prefix=false
  16 | Decrement variable=(id,"count") prefix=true
  17 | NopeStatement 
  18 | Assignment target=(id,"count") operator=(sym,"+=") source=(num,"10")
  19 | Assignment target=(id,"count") operator=(sym,"-=") source=(num,"5")
  20 | Assignment target=(id,"count") operator=(sym,"=") source=#21
  21 | FunctionCall callee=(id,"cube") args=[(id,"count")]
  22 | Assignment target=(id,"count") operator=(sym,"=") source=#23
  23 | BinaryExpression op=(sym,"or") left=#24 right=#25
  24 | UnaryExpression op=(sym,"!") operand=(num,"124.623E-12") postfix=false
  25 | BinaryExpression op=(sym,"and") left=#26 right=#28
  26 | BinaryExpression op=(sym,"==") left=#27 right=(bool,"false")
  27 | BinaryExpression op=(sym,"<") left=(num,"2") right=(num,"4")
  28 | BinaryExpression op=(sym,"+") left=#29 right=#30
  29 | UnaryExpression op=(sym,"++") operand=(num,"6") postfix=true
  30 | BinaryExpression op=(sym,"*") left=(num,"12") right=#31
  31 | BinaryExpression op=(sym,"^") left=(num,"10") right=#32
  32 | UnaryExpression op=(sym,"++") operand=(num,"0") postfix=false
  33 | PrintStatement argument=#34
  34 | FunctionCall callee=#35 args=[]
  35 | MemberAccess object=(id,"oneThroughFive") property=(id,"pop")
  36 | ProcedureCall callee=(id,"success") args=[]
  37 | VariableDeclaration id=(id,"containers") type=(id,"NumberContainer") initializer=#38 readOnly=false
  38 | List elements=[]
  39 | ElementwiseForStatement productionDec=#40 iterator=(id,"i") source=#41 body=#43
  40 | VariableDeclaration id=(id,"newNum") type=(sym,"num") initializer=(id,"i") readOnly=true
  41 | List elements=[#42]
  42 | UnpackedVariable variable=(id,"oneThroughFive")
  43 | Block statements=[#44,#46,#51]
  44 | VariableDeclaration id=(id,"container") type=(id,"NumberContainer") initializer=#45 readOnly=true
  45 | ObjectInstantiation objType=(id,"NumberContainer") args=[(id,"newNum")]
  46 | PrintStatement argument=#47
  47 | LambdaExpression params=[#48] body=#49 captures=null
  48 | Parameter type=(sym,"num") id=(id,"x")
  49 | MemberAccess object=(id,"container") property=#50
  50 | BinaryExpression op=(sym,"*") left=(id,"number") right=(id,"x")
  51 | ProcedureCall callee=#52 args=[(id,"container")]
  52 | MemberAccess object=(id,"containers") property=(id,"push")
  53 | IncrementalForStatement declaration=#54 test=#55 increment=#56 body=#58
  54 | VariableDeclaration id=(id,"i") type=(sym,"num") initializer=(num,"0") readOnly=true
  55 | BinaryExpression op=(sym,"<") left=(id,"i") right=(num,"5")
  56 | LambdaExpression params=[] body=#57 captures=[(id,"i")]
  57 | UnaryExpression op=(sym,"++") operand=(id,"i") postfix=true
  58 | Block statements=[#59]
  59 | Assignment target=#60 operator=(sym,"=") source=(id,"i")
  60 | ListAccess list=(id,"oneThroughFive") exp=(id,"i")
  61 | FunctionDeclaration type=(sym,"num") name=(id,"cube") parameters=[#62] body=#63
  62 | Parameter type=(sym,"num") id=(id,"x")
  63 | Block statements=[#64,#67]
  64 | VariableDeclaration id=(id,"triple") type=(sym,"num") initializer=#65 readOnly=true
  65 | BinaryExpression op=(sym,"*") left=#66 right=(id,"x")
  66 | BinaryExpression op=(sym,"*") left=(id,"x") right=(id,"x")
  67 | YeetStatement argument=(id,"triple")
  68 | ConditionalStatement test=(id,"end") consequent=#69 alternate=#71
  69 | Block statements=[#70]
  70 | VariableDeclaration id=(id,"done") type=(sym,"bool") initializer=(bool,"true") readOnly=true
  71 | ConditionalStatement test=(id,"penultimate") consequent=#72 alternate=null
  72 | Block statements=[#73]
  73 | VariableDeclaration id=(id,"done") type=(sym,"num") initializer=(num,"0.5") readOnly=true
  74 | ConditionalStatement test=(id,"done") consequent=#75 alternate=#78
  75 | Block statements=[#76]
  76 | PrintStatement argument=#77
  77 | TemplateLiteral body=[(string,"That's all, folks! The final answer is: "),(id,"oneThroughFive")]
  78 | ConditionalStatement test=#79 consequent=#80 alternate=#83
  79 | UnaryExpression op=(sym,"!") operand=(id,"done") postfix=false
  80 | Block statements=[#81]
  81 | VariableDeclaration id=#82 type=(sym,"bool") initializer=(bool,"true") readOnly=true
  82 | MemberAccess object=(sym,"this") property=(id,"panic")
  83 | ElseStatement body=#84
  84 | Block statements=[#85]
  85 | ProcedureCall callee=#86 args=[]
  86 | MemberAccess object=#87 property=(id,"activate")
  87 | ListAccess list=(id,"contingencyPlans") exp=(num,"0")`;

describe("The AST generator", () => {
    it("produces the expected AST for all node types", () => {
        assert.deepEqual(util.format(ast(source)), expected);
    });
});
