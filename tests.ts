// to run with quickjs:
// ./quickdeno.ts run tests.ts arg1 arg2
export {};

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

function assert(expr: any, message?: string) {
  if (!expr) throw new Error(message + "\n" || "assertion failed");
}

async function sleep(time: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(), time);
  });
}

async function runTests() {
  assert(Deno.env.get("SHELL"), "should be able to get shell env var");

  assertEquals(Deno.args, ["arg1", "arg2"]);

  assertEquals(Deno.readTextFileSync("./test/hi.txt"), "hi");

  assert(Deno.readTextFile, "readTextFile should be defined");
  const fileContents = await Deno.readTextFile("./test/hi.txt");
  assertEquals(fileContents, "hi");

  const f = await Deno.open("./test/hi.txt");
  assert(typeof f !== "undefined", "file handle should exist");
  assert(typeof f.rid !== "undefined", "should get file handle id");
  const buffer = new Uint8Array(2);
  let len = await f.read(buffer);
  assertEquals(len, 2);
  assertEquals(buffer, new Uint8Array([104, 105]));
  len = await f.read(buffer);
  assertEquals(len, null);
  f.close();

  const f2 = Deno.openSync("./test/hi.txt");
  len = f2.readSync(buffer);
  assertEquals(len, 2);
  assertEquals(buffer, new Uint8Array([104, 105]));
  len = f2.readSync(buffer);
  assertEquals(len, null);
  f2.close();

  const buffer2 = new Uint8Array(2048);
  const f3 = Deno.openSync("./test/another.txt");
  len = f3.readSync(buffer2);
  len = f3.readSync(buffer2);
  assertEquals(len, null);
  f3.close();

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

  const dirs: Deno.DirEntry[] = [];
  for await (const dirEntry of Deno.readDir("./test")) {
    dirs.push(dirEntry);
  }
  assertEquals(dirs.length, 2);
  const another = dirs.find((d) => d.name === "another.txt");
  assert(another?.isFile);

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
  const query2 = new URLSearchParams("some=value");
  assertEquals(query2.get("some"), "value");
  new URLSearchParams();

  assert(typeof setTimeout !== "undefined", "setTimeout should exist");
  await sleep(2);

  assert(typeof clearTimeout !== "undefined", "clearTimeout should exist");
  const t = setTimeout(() => {
    throw new Error(`shouldn't happen`);
  }, 1000);
  clearTimeout(t);

  assert(typeof setInterval !== "undefined", "setInterval should exist");
  assert(typeof clearInterval !== "undefined", "clearInterval should exist");
  const t2 = setInterval(() => {
    throw new Error(`shouldn't happen`);
  }, 1000);
  clearInterval(t2);

  assert(Deno.stdout, "stdout should be defined");
  assert(Deno.stdout.rid, "stdout should have a file descriptor");
  assertEquals(
    typeof Deno.stdout.rid,
    "number",
    "stdout file descriptor should be a number",
  );
  assert(Deno.stdout.write, "stdout should have a write method");
  assert(Deno.stdout.writeSync, "stdout should have a writeSync method");
  await Deno.stdout.write(new TextEncoder().encode("test\n"));
  Deno.stdout.writeSync(new TextEncoder().encode("test sync\n"));

  assert(Deno.stderr, "stderr should be defined");
  assert(Deno.stderr.rid, "stderr should have a file descriptor");
  assertEquals(
    typeof Deno.stderr.rid,
    "number",
    "stderr file descriptor should be a number",
  );
  assert(Deno.stderr.write, "stderr should have a write method");
  assert(Deno.stderr.writeSync, "stderr should have a writeSync method");
  await Deno.stderr.write(new TextEncoder().encode("stderr test\n"));
  Deno.stderr.writeSync(new TextEncoder().encode("stderrtest sync\n"));

  console.error("This should go to stderr");

  assert(Deno.build.os, "should report the current os");

  assert(typeof Deno.noColor !== "undefined", "Deno.noColor should be defined");

  // this one has to be last :-)
  Deno.exit(0);
}

runTests().catch((err: Error) => {
  console.log(err, err.stack);
  Deno.exit(1);
});
