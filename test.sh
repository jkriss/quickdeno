#!/bin/env bash 
deno run --allow-read --allow-run quickdeno.ts bundle tests.ts > tests.bundle.js &&
(echo "running tests in deno..." && deno run --allow-env --allow-read tests.bundle.js arg1 arg2) && 
(echo "running tests in quickjs..." && qjs --std tests.bundle.js arg1 arg2) && 
(echo "running tests in quickdeno..." && deno run --allow-read --allow-run quickdeno.ts run tests.ts arg1 arg2) &&
echo "tests passed!" || echo "tests failed"

rm tests.bundle.js