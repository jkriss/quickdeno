// to run with quickjs:
// ./quickdeno.ts run tests.ts arg1 arg2

// @ts-ignore
function assertEquals(actual: any, expected: any, message?: string) {
  assert(
    // TODO use deep equals instead
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

// @ts-ignore
async function runTests() {
  assert(Deno.env.get("SHELL"), "should be able to get shell env var");

  assertEquals(Deno.args, ["arg1", "arg2"]);

  assertEquals(Deno.readTextFileSync("./test/hi.txt"), "hi");

  assert(Deno.readTextFile, "readTextFile should be defined");
  const fileContents = await Deno.readTextFile("./test/hi.txt");
  assertEquals(fileContents, "hi");

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

  assertEquals(new TextEncoder().encode("hi"), new Uint8Array([104, 105]));
  assertEquals(new TextDecoder().decode(new Uint8Array([104, 105])), "hi");

  const headers = new Headers({ method: "GET" });
  assertEquals(headers.get("method"), "GET");
  assertEquals(headers.get("METHOD"), "GET");

  const url = new URL("https://deno.land/?some=value");
  assertEquals(url.href, "https://deno.land/?some=value");
  assertEquals(url.search, "?some=value");
  const query = new URLSearchParams(url.search);
  assertEquals(query.get("some"), "value");

  // this one has to be last :-)
  Deno.exit(0);
}

runTests().catch((err: Error) => {
  console.log(err, err.stack);
  Deno.exit(1);
});
