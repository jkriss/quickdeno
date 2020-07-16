if (typeof Deno === "undefined") {
  const Deno = {};

  Deno.env = {
    get(k) {
      return std.getenv(k);
    },
  };

  globalThis.Deno = Deno;
}
