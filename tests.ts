function assert(expr: any, message?: string) {
  if (!expr) throw new Error(message || "assertion failed");
}

// test env retreival
assert(Deno.env.get("SHELL"), "should be able to get shell env var");
