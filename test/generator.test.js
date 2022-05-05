/**
 * Generator tests for pandemonium. Original
 * taken with permission from Dr. Toal's
 * Carlos compiler.
 */
import assert from "assert/strict";
import ast from "../src/ast.js";
import analyze from "../src/analyzer.js";
import optimize from "../src/optimizer.js";
import generate from "../src/generator.js";

function dedent(s) {
    return `${s}`.replace(/(?<=\n)\s+/g, "").trim();
}

const fixtures = [
    {
        name: "small",
        source: `
      now x: num = 3 * 7;
      x++;
      x--;
      now y: bool = true;
      y = 5 ^ -x / -100 > - x or false;
      print((y and y) or false or (x*2) != 5);
    `,
        expected: dedent`
      let x_1 = 21;
      x_1++;
      x_1--;
      let y_2 = true;
      y_2 = (((5 ** -(x_1)) / -(100)) > -(x_1));
      console.log(((y_2 && y_2) || ((x_1 * 2) !== 5)));
    `,
    },
    {
        name: "if",
        source: `
      now x: num = 0;
      if (x == 0) { print("1"); }
      if (x == 0) { print(1); } else { print(2); }
      if (x == 0) { print(1); } elif (x == 2) { print(3); }
      if (x == 0) { print(1); } elif (x == 2) { print(3); } else { print(4); }
    `,
        expected: dedent`
      let x_1 = 0;
      if ((x_1 === 0)) {
        console.log("1");
      }
      if ((x_1 === 0)) {
        console.log(1);
      } else {
        console.log(2);
      }
      if ((x_1 === 0)) {
        console.log(1);
      } else
        if ((x_1 === 2)) {
          console.log(3);
        }
      if ((x_1 === 0)) {
        console.log(1);
      } else
        if ((x_1 === 2)) {
          console.log(3);
        } else {
          console.log(4);
        }
    `,
    },
    {
        name: "while",
        source: `
      now x: num = 0;
      while (x < 5) {
        now y: num = 0;
        while (y < 5) {
          print(x * y);
          y = y + 1;
          nope;
        }
        x = x + 1;
      }
    `,
        expected: dedent`
      let x_1 = 0;
      while ((x_1 < 5)) {
        let y_2 = 0;
        while ((y_2 < 5)) {
          console.log((x_1 * y_2));
          y_2 = (y_2 + 1);
          break;
        }
        x_1 = (x_1 + 1);
      }
    `,
    },
    {
        name: "subroutines",
        source: `
        now product: num = 0;

        num timesTwo(num x) {
          yeet x * 2;
        }
      
        product = timesTwo(2);
      
        proc sayHello(string name) {
            print(\`Hello, #{name}!\`);
        }

        sayHello("Kieran");
    `,
        expected: dedent`
        let product_1 = 0;
        function timesTwo_2(x_3) {
          return (x_3 * 2);
        }
        product_1 = timesTwo_2(2);
        function sayHello_4(name_5) {
          console.log(\`Hello, \${name_5}!\`);
        }
        sayHello_4("Kieran");
    `,
    },
    {
        name: "lists",
        source: `
      now a: [bool] = [true, false, true];
      now b: [num] = [10, 40 - 20, 30e100];
      set c: [num] = [];
      print(a[1] or (b[0] < 88));
    `,
        expected: dedent`
      let a_1 = [true,false,true];
      let b_2 = [10,20,3e+101];
      let c_3 = [];
      console.log((a_1[1] || (b_2[0] < 88)));
    `,
    },
    {
        name: "for loops",
        source: `
      for (now i: num = 0; i < 10; i++) {
        print(i);
      }
      for (now k: num = j ^ 2; j in [10, 20, 30]) {
        print(k);
      }
    `,
        expected: dedent`
      for (let i_1 = 0; (i_1 < 10); (i_1)++) {
        console.log(i_1);
      }
      for (let j_2 of [10,20,30]) {
        let k_3 = (j_2 ** 2);
        console.log(k_3);
      }
    `,
    },
];

describe("The code generator", () => {
    for (const fixture of fixtures) {
        it(`produces expected js output for the ${fixture.name} program`, () => {
            const actual = generate(optimize(analyze(ast(fixture.source))));
            assert.deepEqual(actual, fixture.expected);
        });
    }
});
