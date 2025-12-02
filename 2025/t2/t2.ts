import * as fs from "fs";

const input1 = fs.readFileSync("input_base", "utf-8").trim();
const input2 = fs.readFileSync("input_full", "utf-8").trim();

type Interval = [number, number];

function parseIntervals(input: string): Interval[] {
  let unparsedIntervals = input.split(",");
  let pairs = unparsedIntervals.map((x) => x.split("-"));
  let pairNums = pairs.map((pair) => {
    if (pair.length !== 2) {
      console.log("????", pair);
    } else {
      let pairs = [parseInt(pair[0]), parseInt(pair[1])];
      pairs.sort((n1, n2) => n1 - n2);
      return pairs as Interval;
    }
  });
  return pairNums;
}

function intervalSize(interval: Interval) {
  return (
    Math.max(interval[0], interval[1]) - Math.min(interval[0], interval[1])
  );
}

function intervalsTotalSize(intervals: Interval[]) {
  return intervals.reduce((sum, current) => sum + intervalSize(current), 0);
}

type SearchAux = {
  seen: Set<string>;
  seenPt2: Set<string>;
  min: number;
  max: number;
  minLength: number;
  maxLength: number;
};

function initSearch(interval: Interval): SearchAux {
  let seen = new Set<string>();
  let seen2 = new Set<string>();
  let minLength = String(interval[0]).length;
  let maxLength = String(interval[1]).length;

  return {
    seen: seen,
    seenPt2: seen2,
    min: interval[0],
    max: interval[1],
    minLength: minLength,
    maxLength: maxLength,
  };
}

function fitsInterval(current: string, search: SearchAux): boolean {
  if (
    current.length >= search.minLength &&
    current.length <= search.maxLength
  ) {
    let asNum = parseInt(current);
    // console.log("within length size", current);
    if (asNum >= search.min && asNum <= search.max) {
      // console.log("within num constraints", current);
      return true;
    }
  }
  return false;
}

function fitByRepeating(current: string, search: SearchAux) {
  // console.log("fit by repeating: ", current);
  // should be repeated at least twice
  let tmpRepeated = current + current;

  if (fitsInterval(tmpRepeated, search)) {
    search.seen.add(tmpRepeated);
    search.seenPt2.add(tmpRepeated);
    // console.log("fit by repeating found: ", current);
  } else {
    return;
  }

  while (tmpRepeated.length < search.minLength) {
    tmpRepeated += current;
  }
  // console.log("debug val:", tmpRepeated);

  while (tmpRepeated.length <= search.maxLength) {
    if (fitsInterval(tmpRepeated, search)) {
      search.seenPt2.add(tmpRepeated);
      // console.log("fit by repeating found: ", current);
    } else {
      // console.log("not in interval: ", tmpRepeated);
    }
    tmpRepeated += current;
  }
}

function numberGen(current: string, search: SearchAux) {
  // console.log("numberGen. current: ", current);
  // if (1 + current.length > search.maxLength / 2) {
  if (current.length > search.maxLength / 2) {
    return;
  }

  for (let digit = 0; digit < 10; digit++) {
    let digitCh = String(digit);
    let newCurrent = current + digitCh;
    fitByRepeating(newCurrent, search);
    numberGen(newCurrent, search);
  }
}

function numberGenInit(interval: Interval) {
  let search = initSearch(interval);
  let digitFrom = 1;
  let digitTo = 9;

  let minDigit = parseInt(String(search.min)[0]);
  let maxDigit = parseInt(String(search.max)[0]);

  if (search.minLength === search.maxLength) {
    digitFrom = minDigit;
    digitTo = maxDigit;
  }

  // console.log("interval: ", interval);
  // console.log("digitRange: ", [digitFrom, digitTo]);
  for (let digit = digitFrom; digit <= digitTo; digit++) {
    // console.log("at root. digit: ", digit);
    let digitStr = String(digit);
    numberGen(digitStr, search);
    fitByRepeating(digitStr, search);
  }
  // console.log("search: ", search);
  return search;
}

function bruteForceSearch(interval: Interval) {
  let counter: number[] = [];
  for (let i = interval[0]; i <= interval[1]; i++) {
    let asStr = String(i);
    if (asStr.length % 2 != 0) continue;
    let midpoint = asStr.length / 2;
    if (asStr.slice(0, midpoint) === asStr.slice(midpoint)) {
      counter.push(i);
    }
  }
  return counter;
}

function sum2dArray(m: number[][]): number {
  let sum = 0;
  for (let i = 0; i < m.length; i++) {
    let cur = m[i];
    for (let j = 0; j < cur.length; j++) {
      sum += cur[j];
    }
  }
  return sum;

  // return m.reduce((sum, cur) => sum + cur.reduce((x, y) => x + y, 0), 0);
}

function searchToSum(search: SearchAux): [number, number] {
  let sum = 0;
  search.seen.forEach((num) => (sum += parseInt(num)));
  let sum2 = 0;
  search.seenPt2.forEach((num) => (sum2 += parseInt(num)));
  return [sum, sum2];
}

function solveInput(input: string): [number, number] {
  let int = parseIntervals(input);
  let searches = int.map(numberGenInit);

  let pt1Sum = 0;
  let pt2Sum = 0;

  for (let i = 0; i < searches.length; i++) {
    let curSum = searchToSum(searches[i]);
    pt1Sum += curSum[0];
    pt2Sum += curSum[1];
  }
  return [pt1Sum, pt2Sum];

  // let result = searches.reduce(
  //   (sum, cur) => {
  //     let a = searchToSum(cur);
  //     return [sum[0] + a[0], sum[1] + a[1]];
  //   },
  //   [0, 0],
  // );

  // return result as [number, number];
}

function main() {
  let start = performance.now();
  console.log(solveInput(input1));
  console.log(solveInput(input2));
  let end = performance.now();

  console.log(`took ${end - start} ms`);

  start = performance.now();
  let bfResult = parseIntervals(input1).map(bruteForceSearch);
  console.log(sum2dArray(bfResult));

  let bfResult2 = parseIntervals(input2).map(bruteForceSearch);
  console.log(sum2dArray(bfResult2));
  end = performance.now();
  console.log(`took ${end - start} ms`);
}

main();
