/**
 * This file contains classes for the AST nodes. Base
 * taken with permission from Dr. Toal's notes.
 */

import util from "util";

// ------ AST NODES ------
export class Program {
    constructor(statements) {
        Object.assign(this, { statements });
    }
}

export class Block {
    constructor(statements) {
        Object.assign(this, { statements });
    }
}

export class VariableDeclaration {
    constructor(id, type, initializer, readOnly) {
        Object.assign(this, { id, type, initializer, readOnly });
    }
}

export class FunctionDeclaration {
    constructor(type, func, parameters, body) {
        Object.assign(this, { type, func, parameters, body });
    }
}

export class ProcedureDeclaration {
    constructor(proc, parameters, body) {
        Object.assign(this, { proc, parameters, body });
    }
}

export class Assignment {
    constructor(target, operator, source) {
        Object.assign(this, { target, operator, source });
    }
}

export class Increment {
    constructor(variable, prefix) {
        Object.assign(this, { variable, prefix });
    }
}

export class Decrement {
    constructor(variable, prefix) {
        Object.assign(this, { variable, prefix });
    }
}

export class ConditionalStatement {
    constructor(test, consequent, alternate = null) {
        Object.assign(this, { test, consequent, alternate });
    }
}

export class ElseStatement {
    constructor(body) {
        Object.assign(this, { body });
    }
}

export class WhileStatement {
    constructor(test, body) {
        Object.assign(this, { test, body });
    }
}

export class IncrementalForStatement {
    constructor(declaration, test, increment, body) {
        Object.assign(this, { declaration, test, increment, body });
    }
}

export class ElementwiseForStatement {
    constructor(productionDec, iterator, source, body) {
        Object.assign(this, { productionDec, iterator, source, body });
    }
}

export class PrintStatement {
    constructor(argument) {
        Object.assign(this, { argument });
    }
}

export class YeetStatement {
    constructor(argument) {
        Object.assign(this, { argument });
    }
}

export class MemberAccess {
    constructor(object, property) {
        Object.assign(this, { object, property });
    }
}

export class NopeStatement {}

export class FunctionCall {
    constructor(callee, args) {
        Object.assign(this, { callee, args });
    }
}

export class ProcedureCall {
    constructor(callee, args) {
        Object.assign(this, { callee, args });
    }
}

export class LambdaExpression {
    constructor(params, body, captures = null) {
        Object.assign(this, { params, body, captures });
    }
}

export class BinaryExpression {
    constructor(op, left, right) {
        Object.assign(this, { op, left, right });
    }
}

export class UnaryExpression {
    constructor(op, operand) {
        Object.assign(this, { op, operand });
    }
}

export class ListDeclaration {
    constructor(type) {
        Object.assign(this, { type });
    }
}

export class List {
    constructor(elements) {
        Object.assign(this, { elements });
    }
}

export class UnpackedVariable {
    constructor(variable) {
        Object.assign(this, { variable });
    }
}

export class ObjectInstantiation {
    constructor(objType, args) {
        Object.assign(this, { objType, args });
    }
}

export class TemplateLiteral {
    constructor(body) {
        Object.assign(this, { body });
    }
}

export class Struct {
    constructor(id, body) {
        Object.assign(this, { id, body });
    }
}

export class Class {
    constructor(id, body) {
        Object.assign(this, { id, body });
    }
}

export class FieldDeclaration {
    constructor(id) {
        Object.assign(this, { id });
    }
}

export class Token {
    constructor(category, source) {
        Object.assign(this, { category, source });
    }
    get lexeme() {
        return this.source.contents;
    }
}

export class Parameter {
    constructor(type, id) {
        Object.assign(this, { type, id });
    }
}

// ------ ANALYZER CLASSES ------
export class Variable {
    constructor(name, type, readOnly) {
        Object.assign(this, { name, type, readOnly });
    }
}

export class Type {
    // Type of all basic types
    static BOOL = new Type("bool");
    static NUM = new Type("num");
    static STRING = new Type("string");
    constructor(description) {
        Object.assign(this, { description });
    }
}

export class Function {
    // Generated when processing a function declaration
    constructor(name, returnType) {
        Object.assign(this, { name, returnType });
    }
}

export class Procedure {
    // Generated when processing a procedure declaration
    constructor(name) {
        Object.assign(this, { name });
    }
}

export class ListType extends Type {
    // Type of a list containing any type
    constructor(baseType) {
        super(`[${baseType.description}]`);
        this.baseType = baseType;
    }
}

export class StructType {
    // Generated when processing a struct declaration
    constructor(name, fields) {
        Object.assign(this, { name, fields });
    }
}

export class ClassType extends Type {
    // Generated when processing a class declaration
    constructor(name, fields) {
        super(name.lexeme);
        Object.assign(this, { fields });
    }
}

export class FunctionType extends Type {
    // Generated when processing a function declaration
    // Maps the parameters' types to the function's return type
    // Ex. (num, string)->[bool]
    constructor(paramTypes, returnType) {
        super(
            `(${paramTypes.map((t) => t.description).join(", ")})->${
                returnType.description
            }`
        );
        Object.assign(this, { paramTypes, returnType });
    }
}

export class ProcedureType extends Type {
    // Generated when processing a procedure declaration
    // Ex. (num, [string], bool)
    constructor(paramTypes) {
        super(`(${paramTypes.map((t) => t.description).join(", ")})`);
    }
}

//Dr. Toal's error message-er utilizing Ohm's API.
/* c8 ignore next 47 */
export function error(message, token) {
    if (token) {
        throw new Error(`${token.source.getLineAndColumnMessage()}${message}`);
    }
    throw new Error(message);
}

//Dr. Toal's custom inspection function
Program.prototype[util.inspect.custom] = function () {
    const tags = new Map();

    // Attach a unique integer tag to every node
    function tag(node) {
        if (tags.has(node) || typeof node !== "object" || node === null) return;
        if (node.constructor === Token) {
            // Tokens are not tagged themselves, but their values might be
            tag(node?.value);
        } else {
            // Non-tokens are tagged
            tags.set(node, tags.size + 1);
            for (const child of Object.values(node)) {
                Array.isArray(child) ? child.forEach(tag) : tag(child);
            }
        }
    }

    function* lines() {
        function view(e) {
            if (tags.has(e)) return `#${tags.get(e)}`;
            if (e?.constructor === Token) {
                return `(${e.category},"${e.lexeme}"${
                    e.value ? "," + view(e.value) : ""
                })`;
            }
            if (Array.isArray(e)) return `[${e.map(view)}]`;
            return util.inspect(e);
        }
        for (let [node, id] of [...tags.entries()].sort(
            (a, b) => a[1] - b[1]
        )) {
            let type = node.constructor.name;
            let props = Object.entries(node).map(([k, v]) => `${k}=${view(v)}`);
            yield `${String(id).padStart(4, " ")} | ${type} ${props.join(" ")}`;
        }
    }

    tag(this);
    return [...lines()].join("\n");
};
