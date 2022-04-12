/**
 * Tests for the Pandemonium compiler, base
 * taken with permission form Dr. Toal's notes.
 */

import assert from "assert/strict";
import util from "util";
import compile from "../src/compiler.js";

const sampleProgram = `print("Hello, world!");`;

describe("The compiler", () => {
    it("throws when the output type is unknown", (done) => {
        assert.throws(
            () => compile("print(0);", "blah"),
            /Unknown output type/
        );
        done();
    });
    it("accepts the ast option", (done) => {
        const compiled = compile(sampleProgram, "ast");
        assert(util.format(compiled).startsWith("   1 | Program"));
        done();
    });
    it("accepts the analyzed option", (done) => {
        const compiled = compile(sampleProgram, "analyzed");
        assert(util.format(compiled).startsWith("   1 | Program"));
        done();
    });
    it("throws if given an unimplemented option", (done) => {
        assert.throws(() => compile(sampleProgram, "js"));
        done();
    });
});
