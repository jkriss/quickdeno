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

const readFile = `
Deno.readTextFileSync = function (path) {
  // TODO resolve file urls to paths
  const text = std.loadFile(path);
  if (text === null) throw new Error(\`Error reading file \${path}\`);
  return text;
}

Deno.readTextFile = async function (path) {
  return Deno.readTextFileSync(path)
}
`;

const stat = `
Deno.statSync = function (path) {
  // TODO resolve file urls to paths
  const [obj, err] = os.stat(path)
  if (err) throw new Error(\`error: \${strerror(err)}\`)
  const isSymlink = obj.mode === os.S_IFLNK
  const isDirectory = obj.mode === os.S_IFDIR
  return Object.assign(obj, {
    isDirectory,
    isSymlink,
    isFile: !isDirectory && !isSymlink,
    mtime: obj.mtime ? new Date(obj.mtime) : null
  })
}

Deno.stat = async function(path) {
  return Deno.statSync(path)
}
`;

const all = {
  args,
  env,
  exit,
  readFile,
  stat,
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
