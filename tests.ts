// to run with quickjs:
// ./quickdeno.ts run tests.ts arg1 arg2

function assertEqual(actual: any, expected: any, message?: string) {
  assert(
    JSON.stringify(actual) === JSON.stringify(expected),
    message ||
      `Expected \n${JSON.stringify(actual)}\nto equal \n${
        JSON.stringify(
          expected,
        )
      }`,
  );
}

function assert(expr: any, message?: string) {
  if (!expr) throw new Error(message || "assertion failed");
}

// test env retreival
assert(Deno.env.get("SHELL"), "should be able to get shell env var");

assertEqual(Deno.args, ["arg1", "arg2"]);
