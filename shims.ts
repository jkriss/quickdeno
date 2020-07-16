const env = `
 Deno.env = {
    get(k) {
      return std.getenv(k);
    },
  };
`;

const args = `
  Deno.args = scriptArgs.slice(1);
`;

const exit = `Deno.exit = std.exit;`;

const all = {
  env,
  args,
  exit,
};

const allModules = new Map<string, string>(Object.entries(all));

export function get(moduleNames?: string[]) {
  const modules = moduleNames
    ? moduleNames.map((n) => allModules.get(n))
    : Array.from(allModules.values());

  return `
  if (typeof Deno === "undefined") {
    const Deno = {};
  
    ${modules.join("\n")}
  
    globalThis.Deno = Deno;
  }`;
}
