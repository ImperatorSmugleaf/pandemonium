/**
 * Pandemonium AST generator. Base taken with
 * permission from Dr. Toal's notes.
 */

import fs from "fs";
import ohm from "ohm-js";
import * as core from "./core.js";

const pandemoniumGrammar = ohm.grammar(fs.readFileSync("src/pandemonium.ohm"));

const astBuilder = pandemoniumGrammar.createSemantics().addOperation("ast", {
    Program(body) {
        return new core.Program(body.ast());
    },

    Block(_open, body, _close) {
        return new core.Block(body.ast());
    },

    Statement_yeet(_yeet, expression, _semicolon) {
        return new core.YeetStatement(expression.ast());
    },

    Statement_print(_print, _open, argument, _close, _semicolon) {
        return new core.PrintStatement(argument.asIteration().ast());
    },

    Statement_while(_while, _open, test, _close, body) {
        return new core.WhileStatement(test.ast(), body.ast());
    },

    Statement_nope(_nope, _semicolon) {
        return new core.NopeStatement();
    },

    Statement_assignment(assignment, _semicolon) {
        return assignment.ast();
    },

    Vardec_mutable(_now, id, _intro, type, _eq, expression, _semicolon) {
        return new core.VariableDeclaration(id.ast(), type.ast(), expression.ast(), false);
    },

    Vardec_immutable(_set, id, _intro, type, _eq, expression, _semicolon) {
        return new core.VariableDeclaration(id.ast(), type.ast(), expression.ast(), true);
    },

    InstanceField(id, _semi) {
        return new core.ObjectFieldDeclaration(id.ast());
    },

    Subrtdec_function(type, id, _open, params, _close, block) {
        return new core.FunctionDeclaration(
            type.ast(),
            id.ast(),
            params.asIteration().ast(),
            block.ast()
        );
    },

    Subrtdec_procedure(_proc, id, _open, params, _close, block) {
        return new core.ProcedureDeclaration(
            id.ast(),
            params.asIteration().ast(),
            block.ast()
        );
    },

    Increment_prefix(_inc, variable) {
        return new core.Increment(variable.ast());
    },

    Increment_postfix(variable, _inc) {
        return new core.Increment(variable.ast());
    },

    Assignment_base(target, operator, source) {
        return new core.Assignment(target.ast(), operator.ast(), source.ast());
    },

    Assignment_add(target, operator, source) {
        return new core.Assignment(target.ast(), operator.ast(), source.ast());
    },

    Assignment_sub(target, operator, source) {
        return new core.Assignment(target.ast(), operator.ast(), source.ast());
    },

    Variable_subscript(variable, _open, exp, _close) {
        return new core.MemberAccess(variable.ast(), exp.ast());
    },

    Variable_memberaccess(variable, _dot, property) {
        return new core.MemberAccess(variable.ast(), property.ast());
    },

    Variable_instantiation(_new, objType, _open, args, _close) {
        return new core.ObjectInstantiation(objType.ast(), args.ast())
    },

    Variable_unpacking(_unpack, variable) {
        return new core.UnpackedVariable(variable.ast());
    },

    Variable_list(_open, args, _close) {
        return args.asIteration().ast();
    },

    ForLoop_elementwise(_for, _open, declaration, elementId, _in, collection, _close, body) {
        return new core.ElementwiseForStatement(declaration.ast(), elementId.ast(), collection.ast(), body.ast());
    },

    ForLoop_incremental(_for, _open, declaration, test, _semi, increment, _close, body) {
        return new core.IncrementalForStatement(declaration.ast(), test.ast(), increment.ast(), body.ast())
    },

    IfThen_simple(_if, _open, test, _close, body) {
        return new core.ConditionalStatement(test.ast(), body.ast())
    },

    IfThen_complex(_if, _open, test, _close, body, nextStatement) {
        return new core.ConditionalStatement(test.ast(), body.ast(), nextStatement.ast())
    },

    ElseIf_simple(_elif, _open, test, _close, body) {
        return new core.ConditionalStatement(test.ast(), body.ast())
    },

    ElseIf_complex(_elif, _open, test, _close, body, nextStatement) {
        return new core.ConditionalStatement(test.ast(), body.ast(), nextStatement.ast())
    },

    ThenElse(_else, body) {
        return new core.ElseStatement(body.ast())
    },

    VarName_memberaccess(source, _dot, member) {
        return new core.MemberAccess(source.ast(), member.ast());
    },

    VarName1_listaccess(source, _open, member, _close){
        return new core.MemberAccess(source.ast(), member.ast());
    },

    VarDecId_instance(source, _dot, member) {
        return new core.MemberAccess(source.ast(), member.ast())
    },

    Exp_binary(left, op, right) {
        return new core.BinaryExpression(op.ast(), left.ast(), right.ast());
    },

    Exp2_binary(left, op, right) {
        return new core.BinaryExpression(op.ast(), left.ast(), right.ast());
    },

    Exp3_binary(left, op, right) {
        return new core.BinaryExpression(op.ast(), left.ast(), right.ast());
    },

    Exp4_binary(left, op, right) {
        return new core.BinaryExpression(op.ast(), left.ast(), right.ast());
    },

    Exp5_binary(left, op, right) {
        return new core.BinaryExpression(op.ast(), left.ast(), right.ast());
    },

    Exp6_binary(left, op, right) {
        return new core.BinaryExpression(op.ast(), left.ast(), right.ast());
    },

    Exp7_binary(left, op, right) {
        return new core.BinaryExpression(op.ast(), left.ast(), right.ast());
    },

    Exp8_unary(op, operand) {
        return new core.UnaryExpression(op.ast(), operand.ast());
    },

    Exp9_unary(op, operand) {
        return new core.UnaryExpression(op.ast(), operand.ast());
    },

    Exp10_grouping(_open, expression, _close) {
        return expression.ast();
    },

    FuncCall(callee, _open, args, _close) {
        return new core.FunctionCall(callee.ast(), args.ast());
    },

    ProcCall(callee, _open, args, _close, _semicolon) {
        return new core.ProcedureCall(callee.ast(), args.ast());
    },

    Lambda_base(_open, params, _close, _arrow, body) {
        return new core.LambdaExpression(params.ast(), body.ast())
    },

    Lambda_capturing(_open, params, _close, _capstart, captures, _capend, _arrow, body) {
        return new core.LambdaExpression(params.ast(), body.ast(), captures.ast())
    },

    Param(type, id) {
        return new core.Parameter(type.ast(), id.ast());
    },

    Type_list(_start, type, _end) {
        return new core.ListDeclaration(type.ast());
    },

    TemplateLiteral(_begin, body, _end) {
        return body.asIteration().ast()
    },

    TemplateLiteralStmt_expression(_open, exp, _close) {
        return exp.ast()
    },

    TemplateLiteralStmt_str(_first, _rest) {
        return new core.Token("string", this.source)
    },

    id(_first, _rest) {
        return new core.Token("id", this.source);
    },

    true(_) {
        return new core.Token("bool", this.source);
    },

    false(_) {
        return new core.Token("bool", this.source);
    },

    num(_whole, _point, _fraction, _e, _sign, _exponent) {
        return new core.Token("num", this.source);
    },

    str(_start, _str, _end) {
        return new core.Token("string", this.source);
    },

    _terminal() {
        return new core.Token("sym", this.source);
    },

    _iter(...children) {
        return children.map((child) => child.ast());
    },

    NonemptyListOf(element, _sep, rest) {
        return [element.ast()].concat(rest.ast());
    },

    EmptyListOf() {
        return [];
    },
});

export default function ast(sourceCode) {
    const match = pandemoniumGrammar.match(sourceCode);
    /* c8 ignore next */
    if (!match.succeeded()) core.error(match.message);
    return astBuilder(match).ast();
}
