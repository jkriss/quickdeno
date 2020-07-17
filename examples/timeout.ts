const d = 1000;
const start = Date.now();
let count = 0;
let max = 5;
console.log(`starting interval for ${d}...`);

const t = setInterval(() => {
  console.log(`done after ${Date.now() - start}ms!`);
  if (count++ === max) clearInterval(t);
}, d);
