/**
 * Pandemonium grammar unit tests. Base taken with
 * permission from Dr. Toal's notes.
 */
import assert from "assert/strict";
import fs from "fs";
import ohm from "ohm-js";

const syntaxChecks = [
    ["all numeric literal forms", "print(8 * 89.123);"],
    ["complex expressions", "print(83 * ((((-((((13 / 21)))))))) + 1 - 0);"],
    ["all unary operators", "print (-3); print (!false);"],
    ["all binary operators", "print (x && y || z * 1 / 2 ^ 3 + 4 < 5);"],
    ["all arithmetic operators", "now x: num = (!3) * 2 + 4 - (-7.3) * 8 ^ 13 / 1;"],
    [
        "all relational operators",
        "now x: bool = 1<(2<=(3==(4!=(5 >= (6>(7C<(8C=(9in(10)))))))));",
    ],
    ["all logical operators", "now x: bool = true && false || (!false);"],
    ["end of program inside comment", "print(0); $ yay"],
    ["comments with no text are ok", "print(1);$\nprint(0);$"],
    ["non-Latin letters in identifiers", "now コンパイラ: num = 100;"],
];

const syntaxErrors = [
    ["non-letter in an identifier", "now ab😭c: num = 2", /Line 1, col 7/],
    ["malformed number", "now x: num = 2.", /Line 1, col 16/],
    ["missing semicolon", "now x: num = 3 now y: num = 1", /Line 1, col 16/],
    ["a missing right operand", "print(5 -", /Line 1, col 10/],
    ["a non-operator", "print(7 * ((2 _ 3)", /Line 1, col 15/],
    ["an expression starting with a )", "now x: string = );", /Line 1, col 17/],
    ["a statement starting with expression", "x * 5;", /Line 1, col 3/],
    ["an illegal statement on line 2", "print(5);\nx * 5;", /Line 2, col 3/],
    ["a statement starting with a )", "print(5);\n) * 5", /Line 2, col 1/],
    ["an expression starting with a *", "x = * 71;", /Line 1, col 5/],
];

describe("The grammar", () => {
    const grammar = ohm.grammar(fs.readFileSync("src/pandemonium.ohm"));
    for (const [scenario, source] of syntaxChecks) {
        it(`properly specifies ${scenario}`, () => {
            assert(grammar.match(source).succeeded());
        });
    }
    for (const [scenario, source, errorMessagePattern] of syntaxErrors) {
        it(`does not permit ${scenario}`, () => {
            const match = grammar.match(source);
            assert(!match.succeeded());
            assert(new RegExp(errorMessagePattern).test(match.message));
        });
    }
});
