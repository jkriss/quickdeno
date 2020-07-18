#! /usr/bin/env -S deno run --allow-read --allow-run --allow-write
import { parse, Args } from "https://deno.land/std/flags/mod.ts";
import { get, shimNames } from "./shims.ts";

const usage = `
quickdeno bundle [options] <inputfile>
quickdeno run [options] <inputfile> [-- <command arguments>]
quickdeno compile [options] <inputfile> [-- <compiler options>]

examples:

# bundle hello.ts with defaults
quickdeno bundle examples/hello.ts > examples/hello.bundle.js

# bundle hello.ts with env and exit shims only
quickdeno bundle --shims env,exit examples/hello.ts > examples/hello.bundle.js

# bundle hello.ts without shims, save it as "hello" and make it executable
quickdeno bundle --shims false -h -o hello examples/hello.ts

# compile hello.ts with -flto flag
quickdeno compile examples/hello.ts -- -flto

options:

-h                        add hashbang for qjs
-o                        specify output file, and make it executable
--shims=false             skip all shims
--shims [name1,name2...]  only use these shims

Only include these shims. Possible values:
${shimNames().join(", ")}

`.trim();

const quickjsImports = `import * as std from "std";
import * as os from "os";
`;

async function bundle(inputfile: string, args: Args) {
  if (!inputfile) throw new Error(`Must provide input file`);
  const shimsUrl = new URL("shims.js", import.meta.url);
  // use exec to bundle the entry for now, the Deno.bundle call wasn't working with url imports
  let inputBundle: string | undefined;
  const process = Deno.run({
    cmd: ["deno", "bundle", inputfile],
    stdout: "piped",
  });
  if (process.stdout) {
    const output = await process.output();
    inputBundle = new TextDecoder().decode(output);
  }
  if (!inputBundle) throw new Error(`Couldn't bundle input file ${inputfile}`);

  // default to getting all shims
  const shimNames = args.shims
    ? args.shims.split(",").map((s: string) => s.trim())
    : undefined;
  const shims = args.shims === "false" ? "" : get(shimNames) + "\n";

  return `${shims}${inputBundle}`;
}

async function qjsPath() {
  const process = Deno.run({ cmd: ["which", "qjs"], stdout: "piped" });
  const status = await process.status();
  if (!status.success) throw new Error(`Couldn't find qjs on this system`);
  const output = await process
    .output()
    .then((out) => new TextDecoder().decode(out));
  return output.trim();
}

async function compile(
  sourceFile: string,
  outputFile: string,
  args?: string[],
) {
  if (!args) args = [];
  const process = Deno.run(
    { cmd: ["qjsc", ...args, "-o", outputFile, sourceFile] },
  );
  const status = await process.status();
  if (!status.success) throw new Error(`Error compiling`);
}

async function run(args: string[]) {
  const parsedArgs = parse(args, { boolean: ["h"], "--": true });

  const [command, inputfile, ...rest] = parsedArgs._.map((a) => a.toString());
  if (command === "bundle") {
    const js = await bundle(inputfile, parsedArgs);
    let str = "";
    if (parsedArgs.h) {
      str += `#! ${await qjsPath()} --std\n`;
    }
    str += js + "\n";
    if (parsedArgs.o) {
      Deno.writeTextFileSync(parsedArgs.o, str);
      if (parsedArgs.h) Deno.chmod(parsedArgs.o, 0o700);
    } else {
      console.log(str);
    }
  } else if (command === "run") {
    const js = await bundle(inputfile, parsedArgs);
    const qjs = Deno.run({
      cmd: ["qjs", "--std", "-e", js, inputfile, ...parsedArgs["--"]],
    });
    const status = await qjs.status();
    Deno.exit(status.code);
  } else if (command === "compile") {
    const js = await bundle(inputfile, parsedArgs);
    // prepend the quickjs-specific imports
    const source = `${quickjsImports}${js}`;
    const tmpFile = Deno.makeTempFileSync();
    Deno.writeFileSync(tmpFile, new TextEncoder().encode(source));
    const outputFile = parsedArgs.o || inputfile.replace(/\.(.*)/, "");
    await compile(tmpFile, outputFile, parsedArgs["--"]);
    Deno.removeSync(tmpFile);
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
