# quickdeno

Tools for bundling and running Deno code that will run with [quickjs](https://bellard.org/quickjs/).

quickdeno builds a bundle with your entrypoint and polyfills for some (but not all) Deno runtime functions, variables, and classes.

Currently supported:
- Deno.env.get

## Setup

1. [Install quickjs](https://bellard.org/quickjs/)
1. [Install Deno](https://deno.land/)
1. Install quickdeno with `deno install -f --allow-run --allow-read https://raw.githubusercontent.com/jkriss/quickdeno/master/quickdeno.ts`

## Run

You can either bundle to a js file that will run under Deno or quickjs, or you can bundle and run with quickjs in a single call.

## Examples

    MESSAGE=hi! quickdeno run examples/env.ts

Or

    quickdeno bundle examples/env.ts > examples/env.bundle.js
    MESSAGE="hi from quickjs!" qjs --std examples/env.bundle.js
    MESSAGE="hi from deno!" deno run --allow-env examples/env.bundle.js 

On my development machine, the qjs version runs about 10x faster.

## TypeScript setup

For Deno runtime types to show up properly, run:

    mkdir lib
    deno types --unstable > lib/deno_runtime.d.ts