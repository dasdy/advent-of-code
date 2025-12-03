import assert from "assert";

function binSearchIx(arr: number[], x: number): number {
  let lo = 0;
  let hi = arr.length;
  while (lo < hi) {
    const mid = Math.floor((lo + hi) / 2);
    if (arr[mid] < x) {
      lo = mid + 1;
    } else {
      hi = mid;
    }
  }
  return lo;
}

function linearLowerBound(arr: number[], x: number): number {
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] >= x) return i;
  }
  return arr.length;
}

// basic assertions
assert.strictEqual(binSearchIx([], 5), 0);
assert.strictEqual(binSearchIx([10], 5), 0);
assert.strictEqual(binSearchIx([10], 10), 0);
assert.strictEqual(binSearchIx([10], 20), 1);
assert.strictEqual(binSearchIx([1, 2, 4, 5], 3), 2);
assert.strictEqual(binSearchIx([1, 2, 3, 4, 5], 4), 3);
assert.strictEqual(binSearchIx([2, 3, 5], 1), 0);
assert.strictEqual(binSearchIx([2, 3, 5], 6), 3);
assert.strictEqual(binSearchIx([1, 2, 2, 2, 3, 4], 2), 1);
assert.strictEqual(binSearchIx([-5, -2, 0, 0.5, 1], -3), 1);

// randomized checks
for (let t = 0; t < 500; t++) {
  const len = Math.floor(Math.random() * 30);
  const arr: number[] = [];
  let cur = Math.floor(Math.random() * 10) - 10;
  for (let i = 0; i < len; i++) {
    cur += Math.floor(Math.random() * 5); // non-decreasing
    arr.push(cur);
  }
  const x = Math.floor(Math.random() * 100) - 20;
  const exp = linearLowerBound(arr, x);
  const got = binSearchIx(arr, x);
  assert.strictEqual(
    got,
    exp,
    `Mismatch on arr=${JSON.stringify(arr)} x=${x} got=${got} expected=${exp}`,
  );
}

console.log("All tests passed.");
