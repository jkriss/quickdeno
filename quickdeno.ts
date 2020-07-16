#! /usr/bin/env -S deno run --allow-read --allow-run

import { get } from "./shims.ts";

const usage = `
quickdeno bundle <inputfile>
quickdeno run <inputfile>
`.trim();

async function bundle(inputfile: string) {
  if (!inputfile) throw new Error(`Must provide input file`);
  const shimsUrl = new URL("shims.js", import.meta.url);
  // use exec to bundle the entry for now, the Deno.bundle call wasn't working with url imports
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

  // default to getting all shims
  // later, make this configurable
  const shims = get();

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
