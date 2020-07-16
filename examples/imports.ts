import { parse } from "https://deno.land/std/encoding/yaml.ts";

console.log(JSON.stringify(
  parse(`
thing:
  - list
  - of
  - stuff
  - 12
`),
  null,
  2,
));
