#! /usr/bin/env -S deno run --unstable --allow-read --allow-run

const usage = `
quickdeno bundle <inputfile>
quickdeno run <inputfile>
`.trim();

async function bundle(inputfile: string) {
  if (!inputfile) throw new Error(`Must provide input file`);
  const shimsUrl = new URL("shims.js", import.meta.url);
  // use exec to bundle the entry for now, not sure why the other way isn't working
  let inputBundle: string | undefined;
  const process = Deno.run({
    cmd: ["deno", "bundle", inputfile],
    stdout: "piped",
  });
  if (process.stdout) {
    const output = await Deno.readAll(process.stdout);
    inputBundle = new TextDecoder().decode(output);
  }
  if (!inputBundle) throw new Error(`Couldn't bundle input file ${inputfile}`);

  const shims = Deno.readTextFileSync(shimsUrl.pathname);
  return `${shims}\n${inputBundle}`;
}

async function run(args: string[]) {
  const [command, inputfile] = args;
  if (command === "bundle") {
    const js = await bundle(inputfile);
    console.log(js);
  } else if (command === "run") {
    const js = await bundle(inputfile);
    const qjs = Deno.run({
      cmd: ["qjs", "--std", "-e", js],
    });
    const status = await qjs.status();
    Deno.exit(status.code);
  } else {
    console.error(`No command ${command}\n`);
    console.error(usage);
    Deno.exit(1);
  }
}

try {
  await run(Deno.args);
} catch (err) {
  console.error(err);
}

// const [diagnostics, emit] = await Deno.bundle("/foo.ts", {
//   "/foo.ts": `import * as bar from "./bar.ts";\nconsole.log(bar);\n`,
//   "/bar.ts": `export const bar = "bar";\n`,
// });

// console.log(emit);
