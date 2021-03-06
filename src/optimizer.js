// OPTIMIZER
//
// This module exports a single function to perform machine-independent
// optimizations on the analyzed semantic graph.
//
// The only optimizations supported here are:
//
//   - assignments to self (x = x) turn into no-ops
//   - constant folding
//   - some strength reductions (+0, -0, *0, *1, etc.)
//   - turn references to built-ins true and false to be literals
//   - remove all disjuncts in || list after literal true
//   - remove all conjuncts in && list after literal false
//   - while-false becomes a no-op
//   - repeat-0 is a no-op
//   - for-loop over empty array is a no-op
//   - for-loop with low > high is a no-op
//   - if-true and if-false reduce to only the taken arm
//
// The optimizer also replaces token references with their actual values,
// since the original token line and column numbers are no longer needed.
// This simplifies code generation.

import * as core from "./core.js";

export default function optimize(node) {
    return optimizers[node.constructor.name](node);
}

const optimizers = {
    Program(p) {
        p.statements = optimize(p.statements);
        return p;
    },
    Block(b) {
        const nopeIndex = b.statements.findIndex(
            (statement) => statement instanceof core.NopeStatement
        );
        if (nopeIndex != -1) {
            b.statements = b.statements.slice(0, nopeIndex + 1);
        }
        b.statements = optimize(b.statements);
        return b;
    },
    VariableDeclaration(d) {
        d.variable = optimize(d.variable);
        d.initializer = optimize(d.initializer);
        return d;
    },
    /* TypeDeclaration(d) {
        d.type = optimize(d.type);
        return d;
    }, */
    /* Field(f) {
        f.name = f.name.lexeme;
        return f;
    }, */
    /* StructType(d) {
        d.fields = optimize(d.fields);
        return d;
    }, */
    FunctionDeclaration(d) {
        d.func = optimize(d.func);
        d.parameters = optimize(d.parameters);
        if (d.body) d.body = optimize(d.body);
        return d;
    },
    ProcedureDeclaration(d) {
        d.proc = optimize(d.proc);
        d.parameters = optimize(d.parameters);
        if (d.body) d.body = optimize(d.body);
        return d;
    },
    Variable(v) {
        return v;
    },
    Function(f) {
        return f;
    },
    Procedure(p) {
        return p;
    },
    Parameter(p) {
        p.name = optimize(p.id);
        return p;
    },
    Increment(s) {
        s.variable = optimize(s.variable);
        return s;
    },
    Decrement(s) {
        s.variable = optimize(s.variable);
        return s;
    },
    Assignment(s) {
        s.source = optimize(s.source);
        s.target = optimize(s.target);
        if (s.source === s.target) {
            return [];
        } else if (s.operator === "+=" && s.source === 1) {
            return new core.Increment(s.target);
        } else if (s.operator === "-=" && s.source === 1) {
            return new core.Decrement(s.target);
        }
        return s;
    },
    PrintStatement(s) {
        s.argument = optimize(s.argument);
        return s;
    },
    YeetStatement(s) {
        s.argument = optimize(s.argument);
        return s;
    },
    ConditionalStatement(s) {
        s.test = optimize(s.test);
        s.consequent = optimize(s.consequent);
        s.alternate = s.alternate !== null ? optimize(s.alternate) : null;
        if (s.test.constructor === Boolean) {
            return s.test ? s.consequent : s.alternate;
        }
        return s;
    },
    ElseStatement(s) {
        s.body = optimize(s.body);
        return s;
    },
    WhileStatement(s) {
        s.test = optimize(s.test);
        if (s.test === false) {
            // while false is a no-op
            return [];
        }
        s.body = optimize(s.body);
        return s;
    },
    IncrementalForStatement(s) {
        s.declaration = optimize(s.declaration);
        s.test = optimize(s.test);
        s.increment = optimize(s.increment);
        s.body = optimize(s.body);
        return s;
    },
    ElementwiseForStatement(s) {
        s.productionDec = optimize(s.productionDec);
        s.iterator = optimize(s.iterator);
        s.source = optimize(s.source);
        s.body = optimize(s.body);
        if (s.source.elements.length === 0) {
            return [];
        }
        return s;
    },
    NopeStatement(s) {
        return s;
    },
    BinaryExpression(e) {
        e.op = optimize(e.op);
        e.left = optimize(e.left);
        e.right = optimize(e.right);
        if (e.op === "and") {
            // Optimize boolean constants in && and ||
            if (e.left === true) return e.right;
            else if (e.right === true) return e.left;
            else if (e.left === false || e.right === false) return false;
        } else if (e.op === "or") {
            if (e.left === false) return e.right;
            else if (e.right === false) return e.left;
            else if (e.left === true || e.right === true) return true;
        } else if ([Number, BigInt].includes(e.left.constructor)) {
            // Numeric constant folding when left operand is constant
            if ([Number, BigInt].includes(e.right.constructor)) {
                if (e.op === "+") return e.left + e.right;
                else if (e.op === "-") return e.left - e.right;
                else if (e.op === "*") return e.left * e.right;
                else if (e.op === "/") return e.left / e.right;
                else if (e.op === "//") return Math.floor(e.left / e.right);
                else if (e.op === "^") return e.left ** e.right;
                else if (e.op === "<") return e.left < e.right;
                else if (e.op === "<=") return e.left <= e.right;
                else if (e.op === "==") return e.left === e.right;
                else if (e.op === "is") return e.left === e.right;
                else if (e.op === "!=") return e.left !== e.right;
                else if (e.op === ">=") return e.left >= e.right;
                else if (e.op === ">") return e.left > e.right;
                else if (e.op === "%") return e.left % e.right;
            } else if (e.left === 0 && e.op === "+") return e.right;
            else if (e.left === 1 && e.op === "*") return e.right;
            else if (e.left === 0 && e.op === "-")
                return new core.UnaryExpression("-", e.right);
            else if (e.left === 1 && e.op === "^") return 1;
            else if (e.left === 0 && ["*", "/"].includes(e.op)) return 0;
        } else if (e.right.constructor === Number) {
            // Numeric constant folding when right operand is constant
            if (["+", "-"].includes(e.op) && e.right === 0) return e.left;
            else if (["*", "/"].includes(e.op) && e.right === 1) return e.left;
            else if (e.op === "*" && e.right === 0) return 0;
            else if (e.op === "^" && e.right === 0) return 1;
        }
        return e;
    },
    UnaryExpression(e) {
        e.op = optimize(e.op);
        e.operand = optimize(e.operand);
        if (e.operand.constructor === Boolean) {
            if (e.op === "!") return !e.operand;
        }
        return e;
    },
    ListAccess(e) {
        e.list = optimize(e.list);
        e.exp = optimize(e.exp);
        return e;
    },
    List(e) {
        e.elements = optimize(e.elements);
        return e;
    },
    /* MemberAccess(e) {
        e.object = optimize(e.object);
        return e;
    }, */
    FunctionCall(c) {
        c.callee = optimize(c.callee);
        c.args = optimize(c.args);
        return c;
    },
    ProcedureCall(c) {
        c.callee = optimize(c.callee);
        c.args = optimize(c.args);
        return c;
    },
    BigInt(e) {
        return e;
    },
    Number(e) {
        return e;
    },
    Boolean(e) {
        return e;
    },
    String(e) {
        return e;
    },
    TemplateLiteral(t) {
        t.body = optimize(t.body);
        return t;
    },
    Token(t) {
        // All tokens get optimized away and basically replace with either their
        // value (obtained by the analyzer for literals and ids) or simply with
        // lexeme (if a plain symbol like an operator)
        /* c8 ignore next */
        return t.value ?? t.lexeme;
    },
    Array(a) {
        // Flatmap since each element can be an array
        return a.flatMap(optimize);
    },
};
