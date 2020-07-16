const allModules = new Map<string, string>();

allModules.set(
  "env",
  `
 Deno.env = {
    get(k) {
      return std.getenv(k);
    },
  };
`,
);

export function get(moduleNames?: string[]) {
  const modules = moduleNames
    ? moduleNames.map((n) => allModules.get(n))
    : Array.from(allModules.values());

  return `if (typeof Deno === "undefined") {
    const Deno = {};
  
    ${modules.join("\n")}
  
    globalThis.Deno = Deno;
  }`;
}
