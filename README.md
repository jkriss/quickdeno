# quickdeno

Tools for bundling and running Deno code that will run with [quickjs](https://bellard.org/quickjs/).

quickdeno builds a bundle with your entrypoint and polyfills for some (but not all) Deno runtime functions, variables, and classes.

Currently supported:
- Deno.env.get

## Setup

1. [Install quickjs](https://bellard.org/quickjs/)

## Run

You can either bundle to a js file that will run under Deno or quickjs, or you can bundle and run with quickjs in a single call.

## Examples

    

## TypeScript setup

For Deno runtime types to show up properly, run:

    mkdir lib
    deno types --unstable > lib/deno_runtime.d.ts