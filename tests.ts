// to run with quickjs:
// ./quickdeno.ts run tests.ts arg1 arg2

// @ts-ignore
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

// @ts-ignore
function assert(expr: any, message?: string) {
  if (!expr) throw new Error(message || "assertion failed");
}

async function runTests() {
  assert(Deno.env.get("SHELL"), "should be able to get shell env var");

  assertEqual(Deno.args, ["arg1", "arg2"]);

  assertEqual(Deno.readTextFileSync("./test/hi.txt"), "hi");

  assert(Deno.readTextFile, "readTextFile should be defined");
  const fileContents = await Deno.readTextFile("./test/hi.txt");
  assertEqual(fileContents, "hi");

  function testFileInfo(fileInfo: Deno.FileInfo) {
    assert(fileInfo, "file info object should exist");
    assert(typeof fileInfo.isFile !== "undefined", "should have isFile");
    assert(fileInfo.isFile, "should be a file");
    assert(
      typeof fileInfo.isDirectory !== "undefined",
      "should have isDirectory",
    );
    assert(typeof fileInfo.isSymlink !== "undefined", "should have isSymlink");
    assert(fileInfo.size, "should have size");
    assert(typeof fileInfo.mtime !== "undefined", "should have mtime");
    assert(fileInfo.mtime instanceof Date, "mtime should be a date");
    assert(typeof fileInfo.atime !== "undefined", "should have mtime");
  }

  testFileInfo(Deno.statSync("./test/hi.txt"));
  testFileInfo(await Deno.stat("./test/hi.txt"));

  // this one has to be last :-)
  Deno.exit(0);
}

runTests().catch((err: Error) => {
  console.log(err, err.stack);
  Deno.exit(1);
});
