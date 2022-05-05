// CODE GENERATOR: Pandemonium -> JavaScript
//
// Invoke generate(program) with the program node to get back the JavaScript
// translation as a string.

import { Type, StructType, ConditionalStatement } from "./core.js";
import * as stdlib from "./stdlib.js";

export default function generate(program) {
    const output = [];

    const standardFunctions = new Map([
        // [stdlib.contents.print, (x) => `console.log(${x})`],
        // [stdlib.contents.sin, (x) => `Math.sin(${x})`],
        // [stdlib.contents.cos, (x) => `Math.cos(${x})`],
        // [stdlib.contents.exp, (x) => `Math.exp(${x})`],
        // [stdlib.contents.ln, (x) => `Math.log(${x})`],
        // [stdlib.contents.hypot, ([x, y]) => `Math.hypot(${x},${y})`],
        // [stdlib.contents.bytes, (s) => `[...Buffer.from(${s}, "utf8")]`],
        // [
        //     stdlib.contents.codepoints,
        //     (s) => `[...(${s})].map(s=>s.codePointAt(0))`,
        // ],
    ]);

    // Variable and function names in JS will be suffixed with _1, _2, _3,
    // etc. This is because "switch", for example, is a legal name in Pandemonium,
    // but not in JS. So, the Pandemonium variable "switch" must become something
    // like "switch_1". We handle this by mapping each name to its suffix.
    const targetName = ((mapping) => {
        return (entity) => {
            if (!mapping.has(entity)) {
                mapping.set(entity, mapping.size + 1);
            }
            return `${entity.name}_${mapping.get(entity)}`;
        };
    })(new Map());

    function gen(node) {
        return generators[node.constructor.name](node);
    }

    const generators = {
        // Key idea: when generating an expression, just return the JS string; when
        // generating a statement, write lines of translated JS to the output array.
        Program(p) {
            gen(p.statements);
        },
        Block(b) {
            gen(b.statements);
        },
        VariableDeclaration(d) {
            // We don't care about const vs. let in the generated code! The analyzer has
            // already checked that we never updated a const, so let is always fine.
            output.push(`let ${gen(d.variable)} = ${gen(d.initializer)};`);
        },
        /* TypeDeclaration(d) {
            // The only type declaration in Pandemonium is the struct! Becomes a JS class.
            output.push(`class ${gen(d.type)} {`);
            output.push(`constructor(${gen(d.type.fields).join(",")}) {`);
            for (let field of d.type.fields) {
                output.push(
                    `this[${JSON.stringify(gen(field))}] = ${gen(field)};`
                );
            }
            output.push("}");
            output.push("}");
        },
        StructType(t) {
            return targetName(t);
        },
        Field(f) {
            return targetName(f);
        }, */
        FunctionDeclaration(d) {
            output.push(
                `function ${gen(d.func)}(${gen(d.func.parameters).join(
                    ", "
                )}) {`
            );
            gen(d.body);
            output.push("}");
        },
        ProcedureDeclaration(d) {
            output.push(
                `function ${gen(d.proc)}(${gen(d.proc.parameters).join(
                    ", "
                )}) {`
            );
            gen(d.body);
            output.push("}");
        },
        Parameter(p) {
            return targetName(p);
        },
        Variable(v) {
            // Standard library constants just get special treatment
            // if (v === stdlib.contents.π) {
            //     return "Math.PI";
            // }
            return targetName(v);
        },
        Function(f) {
            return targetName(f);
        },
        Procedure(p) {
            return targetName(p);
        },
        Increment(s) {
            output.push(`${gen(s.variable)}++;`);
        },
        Decrement(s) {
            output.push(`${gen(s.variable)}--;`);
        },
        Assignment(s) {
            output.push(`${gen(s.target)} = ${gen(s.source)};`);
        },
        PrintStatement(s) {
            output.push(`console.log(${gen(s.argument)});`);
        },
        NopeStatement(s) {
            output.push("break;");
        },
        YeetStatement(s) {
            output.push(`return ${gen(s.argument)};`);
        },
        ConditionalStatement(s) {
            output.push(`if (${gen(s.test)}) {`);
            gen(s.consequent);
            if (s.alternate !== null) {
                if (s.alternate.constructor === ConditionalStatement) {
                    output.push("} else");
                    gen(s.alternate);
                } else {
                    output.push("} else {");
                    gen(s.alternate);
                    output.push("}");
                }
            } else {
                output.push("}");
            }
        },
        ElseStatement(s) {
            gen(s.body);
        },
        WhileStatement(s) {
            output.push(`while (${gen(s.test)}) {`);
            gen(s.body);
            output.push("}");
        },
        IncrementalForStatement(s) {
            const i = targetName(s.declaration.variable);
            output.push(
                `for (let ${i} = ${gen(s.declaration.initializer)}; ${gen(
                    s.test
                )}; ${gen(s.increment)}) {`
            );
            gen(s.body);
            output.push("}");
        },
        ElementwiseForStatement(s) {
            output.push(`for (let ${gen(s.iterator)} of ${gen(s.source)}) {`);
            output.push(
                `let ${gen(s.productionDec.variable)} = ${gen(
                    s.productionDec.initializer
                )};`
            );
            gen(s.body);
            output.push("}");
        },
        BinaryExpression(e) {
            const op =
                { "==": "===", "!=": "!==", and: "&&", or: "||", "^": "**" }[
                    e.op
                ] ?? e.op;
            return `(${gen(e.left)} ${op} ${gen(e.right)})`;
        },
        UnaryExpression(e) {
            return e.postfix
                ? `(${gen(e.operand)})${e.op}`
                : `${e.op}(${gen(e.operand)})`;
        },
        ListAccess(e) {
            return `${gen(e.list)}[${gen(e.exp)}]`;
        },
        List(e) {
            return `[${gen(e.elements).join(",")}]`;
        },
        /* MemberAccess(e) {
            const object = gen(e.object);
            const field = JSON.stringify(gen(e.field));
            const chain = e.isOptional ? "?." : "";
            return `(${object}${chain}[${field}])`;
        }, */
        FunctionCall(c) {
            return `${gen(c.callee)}(${gen(c.args).join(", ")})`;
        },
        ProcedureCall(c) {
            output.push(`${gen(c.callee)}(${gen(c.args).join(", ")});`);
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
            let final = "`";
            for (let piece of t.body) {
                if (piece.constructor === String) {
                    final = final.concat(piece);
                } else {
                    final = final.concat(`\$\{${gen(piece)}\}`);
                }
            }
            final = final.concat("`");
            return final;
        },
        Array(a) {
            return a.map(gen);
        },
    };

    gen(program);
    return output.join("\n");
}
