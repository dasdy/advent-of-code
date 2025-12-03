import * as fs from "fs";

const lines = fs.readFileSync("input_base", "utf-8").trim().split("\n");
const lines2 = fs.readFileSync("input", "utf-8").trim().split("\n");

function leftmostMaxDigit(line: string): [string, number] {
  let curIx = 0;
  let curCh = line[0];

  for (let i = 1; i < line.length - 1; i++) {
    if (line[i] > curCh) {
      curCh = line[i];
      curIx = i;
    }
  }
  return [curCh, curIx];
}

function rightmostMaxDigit(line: string, limit: number): string {
  let curIx = line.length - 1;
  let curCh = line[curIx];

  for (let i = line.length - 2; i > limit; i--) {
    if (line[i] > curCh) {
      curCh = line[i];
      curIx = i;
    }
  }
  return curCh;
}

type Ch = { ch: string; ix: number };

function maxInRange(arr: string, start: number, end: number): Ch {
  let max = arr[start];
  let maxI = start;
  for (let i = start + 1; i <= end; i++) {
    if (arr[i] > max) {
      max = arr[i];
      maxI = i;
      if (max === "9") break;
    }
  }

  return { ch: max, ix: maxI };
}

function maxNChars(arr: string, n: number): string {
  let maxString = "";
  let leftLimit = 0;
  for (let i = 0; i < n; i++) {
    const max = maxInRange(arr, leftLimit, arr.length - (n - i));
    maxString += max.ch;
    leftLimit = max.ix + 1;
  }
  return maxString;
}

function part1(lines: string[]): number {
  let sum = 0;
  for (let l of lines) {
    let a = leftmostMaxDigit(l);
    let lch = a[0];
    let ix = a[1];
    let rch = rightmostMaxDigit(l, ix);

    sum += parseInt(`${lch}${rch}`);
  }
  return sum;
}

function part1_2(lines: string[]): number {
  let sum = 0;
  for (let l of lines) {
    const maxString = maxNChars(l, 2);
    sum += parseInt(maxString, 10);
  }
  return sum;
}

function part2(lines: string[]): number {
  let sum = 0;
  for (let l of lines) {
    const maxString = maxNChars(l, 12);
    sum += parseInt(maxString, 10);
  }
  return sum;
}
console.log(part1(lines));
console.log(part1(lines2));
console.log(part1_2(lines));
console.log(part1_2(lines2));
console.log(part2(lines));
console.log(part2(lines2));
