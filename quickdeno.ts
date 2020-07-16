#! /usr/bin/env -S deno run --allow-read --allow-run --allow-write
import { parse, Args } from "https://deno.land/std/flags/mod.ts";
import { get, shimNames } from "./shims.ts";

const usage = `
quickdeno bundle [options] <inputfile>
quickdeno run [options] <inputfile> [...args]

examples:

# bundle hello.ts with defaults
quickdeno bundle examples/hello.ts > examples/hello.bundle.js

# bundle hello.ts with env and exit shims only
quickdeno bundle --shims env,exit examples/hello.ts > examples/hello.bundle.js

# bundle hello.ts without shims, save it as "hello" and make it executable
quickdeno bundle --shims false -h -o hello examples/hello.ts

options:

-h                        add hashbang for qjs
-o                        specify output file, and make it executable
--shims=false             skip all shims
--shims [name1,name2...]  only use these shims

Only include these shims. Possible values:
${shimNames().join(", ")}

`.trim();

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
    const output = await Deno.readAll(process.stdout);
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

async function run(args: string[]) {
  const parsedArgs = parse(args, { boolean: ["h"] });

  const [command, inputfile, ...rest] = parsedArgs._.map((a) => a.toString());
  if (command === "bundle") {
    const js = await bundle(inputfile, parsedArgs);
    let str = "";
    if (parsedArgs.h) {
      str += "#! /usr/bin/env -S qjs --std\n";
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
      cmd: ["qjs", "--std", "-e", js, inputfile, ...rest],
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
