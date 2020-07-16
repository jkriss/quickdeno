import { parse } from "https://deno.land/std/flags/mod.ts";

console.log("raw args are", JSON.stringify(Deno.args));
console.log("parsed args are", JSON.stringify(parse(Deno.args)));
