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
  seenArr: number[];
  seenPt2: Set<string>;
  min: number;
  max: number;
  minLength: number;
  maxLength: number;
};

function initSearch(interval: Interval): SearchAux {
  let minLength = String(interval[0]).length;
  let maxLength = String(interval[1]).length;

  return {
    seen: new Set<string>(),
    seenArr: [],
    seenPt2: new Set<string>(),
    min: interval[0],
    max: interval[1],
    minLength: minLength,
    maxLength: maxLength,
  };
}

function fitsInterval(current: string, search: SearchAux): number | null {
  if (
    current.length >= search.minLength &&
    current.length <= search.maxLength
  ) {
    let asNum = parseInt(current);
    // console.log("within length size", current);
    if (asNum >= search.min && asNum <= search.max) {
      // console.log("within num constraints", current);
      return asNum;
    }
  }
  return null;
}

function heapPush(arr: number[], item: number) {
  let insertIx = binSearchIx(arr, item);
  if (item !== arr[insertIx]) {
    arr.splice(insertIx, 0, item);
  }
}

function binSearch(arr: number[], item: number) {
  let insertIx = binSearchIx(arr, item);
  return item === arr[insertIx];
}

function fitByRepeating(current: string, search: SearchAux) {
  // console.log("fit by repeating: ", current);
  // should be repeated at least twice
  let tmpRepeated = current + current;
  let parsedOrNull = fitsInterval(tmpRepeated, search);
  if (parsedOrNull !== null) {
    // heapPush(search.seenArr, parsedOrNull);
    try {
      if (!binSearch(search.seenArr, parsedOrNull)) {
        search.seen.add(tmpRepeated);
      }
    } catch (e) {
      // range error
      let start = performance.now();
      search.seenArr = search.seenArr.concat(
        Array.from(search.seen).map(parseInt),
      );
      search.seenArr.sort((n1, n2) => n1 - n2);
      let end = performance.now();
      search.seen = new Set<string>();
      console.log(
        `dump cache(${search.seenArr.length}): done in ${end - start}ms`,
      );
    }
    // search.seenPt2.add(tmpRepeated);
    // console.log("fit by repeating found: ", current);
  } else {
    return;
  }

  // while (tmpRepeated.length < search.minLength) {
  //   tmpRepeated += current;
  // }
  // console.log("debug val:", tmpRepeated);

  // while (tmpRepeated.length <= search.maxLength) {
  //   if (fitsInterval(tmpRepeated, search)) {
  //     search.seenPt2.add(tmpRepeated);
  //     // console.log("fit by repeating found: ", current);
  //   } else {
  //     // console.log("not in interval: ", tmpRepeated);
  //   }
  //   tmpRepeated += current;
  // }
}

function numberGen(current: string, search: SearchAux) {
  // console.log("numberGen. current: ", current);
  if (1 + current.length > search.maxLength / 2) {
    // if (current.length > search.maxLength / 2) {
    return;
  }

  for (let digit = 0; digit < 10; digit++) {
    let digitCh = String(digit);
    let newCurrent = current + digitCh;
    fitByRepeating(newCurrent, search);
    numberGen(newCurrent, search);
  }
}

function numberGenInit(interval: Interval): SearchAux {
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
  // search.seen.forEach((num) => (sum += parseInt(num)));
  search.seenArr.forEach((num) => (sum += num));
  let sum2 = 0;
  search.seenPt2.forEach((num) => (sum2 += parseInt(num)));
  // search.seenArr.forEach((num) => (sum += num));
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

function main2() {
  const target = Number.MAX_SAFE_INTEGER; // 9007199254740990
  const timeLimit = 1000 * 60 * 10;
  let fuseBlown = true; // false;
  console.log("i,progress,numcount,bftime,mytime");
  for (let i = 1; i < target; i = Math.ceil(i * 1.3)) {
    let interval: Interval = [1, i];
    let start = performance.now();
    if (!fuseBlown) {
      bruteForceSearch(interval);
    }
    let end = performance.now();
    let searches = numberGenInit(interval);
    let end2 = performance.now();

    if (end - start > timeLimit) {
      // slow method is too slow - blow it up
      fuseBlown = true;
    }

    // const numCount = Math.max(searches.seenArr.length, searches.seen.size)
    const numCount = searches.seenArr.length + searches.seen.size;
    console.log(
      `${i},${Math.round((10000 * i) / target) / 100},${numCount},${fuseBlown ? "" : end - start},${end2 - end}`,
    );
    if (end2 - end > timeLimit) {
      break;
    }

    // console.log(
    //   `${i} (${Math.round((10000 * i) / target) / 100}%) took ${end - start}ms`,
    // );
  }
}

// main();
main2();
