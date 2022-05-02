import assert from "assert/strict";
import optimize from "../src/optimizer.js";
import * as core from "../src/core.js";

// Make some test cases easier to read
const x = new core.Variable("x", false);
const xparam = new core.Parameter(core.Type.NUM, x);
const xpp = new core.Increment(x);
const xmm = new core.Decrement(x);
const yeet1p1 = new core.YeetStatement(new core.BinaryExpression("+", 1, 1));
const yeet2 = new core.YeetStatement(2);
const yeetX = new core.YeetStatement(x);
const printX = new core.PrintStatement(x);
const print4 = new core.PrintStatement(4);
const print2p2 = new core.PrintStatement(new core.BinaryExpression("+", 2, 2));
const onePlusTwo = new core.BinaryExpression("+", 1, 2);
const nope = new core.NopeStatement();
const printArgsProc = Object.assign(new core.Procedure("p_id"), {
    body: printX,
});
const identityFunc = Object.assign(new core.Function("f_id", core.Type.BOOL), {
    body: yeetX,
});
const numFun = (body) => {
    let d = new core.FunctionDeclaration(
        core.Type.NUM,
        "f_num",
        [xparam],
        new core.Block(body)
    );
    const f = new core.Function("f_num", core.Type.NUM);

    Object.assign(d, { func: f });
    return d;
};
const argsProc = (body) => {
    let d = new core.ProcedureDeclaration("p_args", [], new core.Block(body));
    const p = new core.Procedure("p_args");

    Object.assign(d, { proc: p });
    return d;
};
const callIdentityFunc = (args) => new core.FunctionCall(identityFunc, args);
const callPrintArgsProc = (args) => new core.ProcedureCall(printArgsProc, args);
const or = (...d) => d.reduce((x, y) => new core.BinaryExpression("or", x, y));
//prettier-ignore
const and = (...c) => c.reduce((x, y) => new core.BinaryExpression("and", x, y));
const less = (x, y) => new core.BinaryExpression("<", x, y);
const eq = (x, y) => new core.BinaryExpression("==", x, y);
const times = (x, y) => new core.BinaryExpression("*", x, y);
const neg = (x) => new core.UnaryExpression("-", x);
const list = (...elements) => new core.List(elements);
const sub = (a, e) => new core.ListAccess(a, e);

const iterator = new core.Variable("i", core.Type.NUM, false);
const production = new core.Variable("p", core.Type.NUM, false);
const ip1 = new core.BinaryExpression("+", iterator, 1);
const goodIteratorDec = () => {
    let d = new core.VariableDeclaration("i", core.Type.NUM, 0, false);
    Object.assign(d, { variable: iterator });
    return d;
};
const badIteratorDec = () => {
    let d = new core.VariableDeclaration(
        "i",
        core.Type.NUM,
        new core.BinaryExpression("-", 1, 1),
        false
    );
    Object.assign(d, { variable: iterator });
    return d;
};
const badProductionDec = () => {
    let d = new core.VariableDeclaration(
        "p",
        core.Type.NUM,
        new core.BinaryExpression("+", iterator, 0),
        false
    );
    Object.assign(d, { variable: production });
    return d;
};
const goodProductionDec = () => {
    let d = new core.VariableDeclaration("p", core.Type.NUM, iterator, false);
    Object.assign(d, { variable: production });
    return d;
};
const incrementalFor = (dec, test, inc, body) =>
    new core.IncrementalForStatement(dec, test, inc, new core.Block(body));
const elementwiseFor = (pDec, iter, src, body) =>
    new core.ElementwiseForStatement(pDec, iter, src, new core.Block(body));

const tests = [
    ["folds +", new core.BinaryExpression("+", 5, 8), 13],
    ["folds -", new core.BinaryExpression("-", 5n, 8n), -3n],
    ["folds *", new core.BinaryExpression("*", 5, 8), 40],
    ["folds /", new core.BinaryExpression("/", 5, 8), 0.625],
    ["folds ^", new core.BinaryExpression("^", 5, 8), 390625],
    ["folds %", new core.BinaryExpression("%", 7, 3), 1],
    ["folds //", new core.BinaryExpression("//", 5, 2), 2],
    ["folds <", new core.BinaryExpression("<", 5, 8), true],
    ["folds <=", new core.BinaryExpression("<=", 5, 8), true],
    ["folds ==", new core.BinaryExpression("==", 5, 8), false],
    ["folds is", new core.BinaryExpression("is", 5, 8), false],
    ["folds !=", new core.BinaryExpression("!=", 5, 8), true],
    ["folds >=", new core.BinaryExpression(">=", 5, 8), false],
    ["folds >", new core.BinaryExpression(">", 5, 8), false],
    ["optimizes +0", new core.BinaryExpression("+", x, 0), x],
    ["optimizes -0", new core.BinaryExpression("-", x, 0), x],
    ["optimizes *1", new core.BinaryExpression("*", x, 1), x],
    ["optimizes /1", new core.BinaryExpression("/", x, 1), x],
    ["optimizes *0", new core.BinaryExpression("*", x, 0), 0],
    ["optimizes 0*", new core.BinaryExpression("*", 0, x), 0],
    ["optimizes 0/", new core.BinaryExpression("/", 0, x), 0],
    ["optimizes 0+", new core.BinaryExpression("+", 0, x), x],
    ["optimizes 0-", new core.BinaryExpression("-", 0, x), neg(x)],
    ["optimizes 1*", new core.BinaryExpression("*", 1, x), x],
    ["folds negation", new core.UnaryExpression("-", 8), -8],
    ["folds not", new core.UnaryExpression("!", true), false],
    ["optimizes 1^", new core.BinaryExpression("^", 1, x), 1],
    ["optimizes ^0", new core.BinaryExpression("^", x, 0), 1],
    ["removes left false from or", or(false, less(x, 1)), less(x, 1)],
    ["removes right false from or", or(less(x, 1), false), less(x, 1)],
    ["removes left true from and", and(true, less(x, 1)), less(x, 1)],
    ["removes right true from and", and(less(x, 1), true), less(x, 1)],
    [
        "folds expressions that are always true",
        [or(true, less(x, 1)), or(less(x, 1), true)],
        [true, true],
    ],
    [
        "folds expressions that are always false",
        [and(false, less(x, 1)), and(less(x, 1), false)],
        [false, false],
    ],
    ["removes x=x at beginning", [new core.Assignment(x, "=", x), xpp], [xpp]],
    ["removes x=x at end", [xmm, new core.Assignment(x, "=", x)], [xmm]],
    [
        "removes x=x in middle",
        [xpp, new core.Assignment(x, "=", x), xmm],
        [xpp, xmm],
    ],
    ["folds add-assign by 1", new core.Assignment(x, "+=", 1), xpp],
    ["folds sub-assign by 1", new core.Assignment(x, "-=", 1), xmm],
    ["optimizes if-true", new core.ConditionalStatement(true, xpp, null), xpp],
    ["optimizes if-false", new core.ConditionalStatement(false, [], xpp), xpp],
    ["optimizes while-false", [new core.WhileStatement(false, xpp, null)], []],
    [
        "applies if-false after folding",
        new core.ConditionalStatement(eq(1, 2), [], xpp),
        xpp,
    ],
    ["optimizes in functions", numFun([yeet1p1]), numFun([yeet2])],
    ["optimizes in procedures", argsProc([print2p2]), argsProc([print4])],
    ["optimizes in subscripts", sub(x, onePlusTwo), sub(x, 3)],
    ["optimizes in lists", list(0, onePlusTwo, 9), list(0, 3, 9)],
    [
        "optimizes in function arguments",
        callIdentityFunc([times(3, 5)]),
        callIdentityFunc([15]),
    ],
    [
        "optimizes in procedure arguments",
        callPrintArgsProc([times(3, 4)]),
        callPrintArgsProc([12]),
    ],
    [
        "optimizes in incremental for loops",
        incrementalFor(
            badIteratorDec(),
            less(iterator, new core.BinaryExpression("+", 2, 3)),
            ip1,
            [print2p2]
        ),
        incrementalFor(goodIteratorDec(), less(iterator, 5), ip1, [print4]),
    ],
    [
        "removes elementwise for loop with empty source",
        elementwiseFor(goodProductionDec(), iterator, list(), [print4]),
        [],
    ],
    [
        "optimizes in elementwise for loops",
        elementwiseFor(
            badProductionDec(),
            iterator,
            list(1, 2, 3, new core.BinaryExpression("+", 2, 2), 5),
            [print2p2]
        ),
        elementwiseFor(goodProductionDec(), iterator, list(1, 2, 3, 4, 5), [
            print4,
        ]),
    ],
    [
        "removes elements in for loop after nope statement",
        incrementalFor(goodIteratorDec, less(iterator, 5), ip1, [
            printX,
            nope,
            print4,
        ]),
        incrementalFor(goodIteratorDec, less(iterator, 5), ip1, [printX, nope]),
    ],
    [
        "passes through nonoptimizable constructs",
        ...Array(3).fill([
            // new core.VariableDeclaration("x", true, "z"),
            new core.Assignment(x, "=", new core.BinaryExpression("*", x, "z")),
            new core.Assignment(x, "=", new core.UnaryExpression("not", x)),
            // new core.Call(identity, new core.MemberExpression(x, "f")),
            new core.WhileStatement(
                true,
                new core.Block([new core.NopeStatement()])
            ),
            new core.ConditionalStatement(x, [], []),
        ]),
    ],
];

describe("The optimizer", () => {
    for (const [scenario, before, after] of tests) {
        it(`${scenario}`, () => {
            assert.deepEqual(optimize(before), after);
        });
    }
});
