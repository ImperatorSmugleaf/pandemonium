/**
 * This file contains classes for the AST nodes. Base
 * taken with permission from Dr. Toal's notes.
 */

import util from "util";

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
    constructor(variable, type, initializer, readOnly) {
        Object.assign(this, { variable, type, initializer, readOnly });
    }
}

export class FunctionDeclaration {
    constructor(type, func, params, body) {
        Object.assign(this, { type, func, params, body });
    }
}

export class ProcedureDeclaration {
    constructor(proc, params, body) {
        Object.assign(this, { proc, params, body });
    }
}

export class Assignment {
    constructor(target, operator, source) {
        Object.assign(this, { target, operator, source });
    }
}

export class Increment {
    constructor(variable) {
        Object.assign(this, { variable });
    }
}

export class IfStatement {
    constructor(test, consequent, alternate=null) {
        Object.assign(this, { test, consequent, alternate })
    }
}

export class ElseStatement {
    constructor(body) {
        Object.assign(this, { body })
    }
}

export class WhileStatement {
    constructor(test, body) {
        Object.assign(this, { test, body });
    }
}

export class IncrementalForStatement {
    constructor(declaration, test, increment, body){
        Object.assign(this, { declaration, test, increment, body })
    }
}

export class ElementwiseForStatement {
    constructor(declaration, elementId, collection, body) {
        Object.assign(this, { declaration, elementId, collection, body })
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
        Object.assign(this, { params, body, captures })
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

export class ListType {
    constructor(type) {
        Object.assign(this, { type });
    }
}

//Token objects
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
        for (let [node, id] of [...tags.entries()].sort((a, b) => a[1] - b[1])) {
            let type = node.constructor.name;
            let props = Object.entries(node).map(([k, v]) => `${k}=${view(v)}`);
            yield `${String(id).padStart(4, " ")} | ${type} ${props.join(" ")}`;
        }
    }

    tag(this);
    return [...lines()].join("\n");
};
