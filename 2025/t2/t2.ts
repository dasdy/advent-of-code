import * as fs from "fs";

const input1 = fs.readFileSync("input_base", "utf-8").trim();
const input2 = fs.readFileSync("input_full", "utf-8").trim();

// [from; to]
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

// Super ugly data structure: I'm solving both parts at the same time
// because I'm too lazy to make this pretty/cover both cases at the same time with parameters
type SearchAux = {
  // L1 cache: fast to insert and read. Limited in size: 16777216 elements max
  seen: Set<number>;
  // L2 cache: slow to insert, relatively fast to look up. Max size limited by heap given to program
  seenArr: number[];
  // Same as before, but dedicated for Pt2. Note that this more than doubles used memory
  seenPt2: Set<number>;
  seenArrPt2: number[];

  // int and string ranges for the interval
  min: number;
  max: number;
  minLength: number;
  maxLength: number;
};

function initSearch(interval: Interval): SearchAux {
  return {
    seen: new Set<number>(),
    seenArr: [],
    seenPt2: new Set<number>(),
    seenArrPt2: [],
    min: interval[0],
    max: interval[1],
    minLength: String(interval[0]).length,
    maxLength: String(interval[1]).length,
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

function binSearch(arr: number[], item: number): boolean {
  let lo = 0;
  let hi = arr.length;
  while (lo < hi) {
    const mid = Math.floor((lo + hi) / 2);
    if (arr[mid] < item) {
      lo = mid + 1;
    } else if (arr[mid] === item) {
      return true;
    } else {
      hi = mid;
    }
  }
  return item === arr[lo];
}

function remember(number: number, search: SearchAux, isPart2: boolean = false) {
  const targetSet = isPart2 ? search.seenPt2 : search.seen;
  const targetArr = isPart2 ? search.seenArrPt2 : search.seenArr;
  try {
    if (!binSearch(targetArr, number)) {
      targetSet.add(number);
    }
  } catch (e) {
    // range error
    let start = performance.now();
    // try getting rid of garbage values ASAP. Duplicate code though
    if (isPart2) {
      search.seenArrPt2 = targetArr.concat(Array.from(targetSet));
      search.seenArrPt2.sort((n1, n2) => n1 - n2);
    } else {
      search.seenArr = targetArr.concat(Array.from(targetSet));
      search.seenArr.sort((n1, n2) => n1 - n2);
    }
    let end = performance.now();
    if (isPart2) {
      search.seenPt2 = new Set<number>();
      console.log(
        `dump cache(${search.seenArrPt2.length}): done in ${end - start}ms`,
      );
    } else {
      search.seen = new Set<number>();
      console.log(
        `dump cache(${search.seenArr.length}): done in ${end - start}ms`,
      );
    }
  }
}

function fitByRepeating(current: string, search: SearchAux) {
  // console.log("fit by repeating: ", current);
  // should be repeated at least twice
  let tmpRepeated = current + current;
  let parsedOrNull = fitsInterval(tmpRepeated, search);
  if (parsedOrNull !== null) {
    remember(parsedOrNull, search, false);
    remember(parsedOrNull, search, true);
  }

  // Part 2: accumulate 2+ vals
  while (tmpRepeated.length < search.minLength) {
    tmpRepeated += current;
  }

  while (tmpRepeated.length <= search.maxLength) {
    parsedOrNull = fitsInterval(tmpRepeated, search);
    if (parsedOrNull !== null) {
      remember(parsedOrNull, search, true);
    }
    tmpRepeated += current;
  }
}

function numberGen(current: string, search: SearchAux) {
  if (1 + current.length > search.maxLength / 2) {
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

  for (let digit = digitFrom; digit <= digitTo; digit++) {
    let digitStr = String(digit);
    numberGen(digitStr, search);
    fitByRepeating(digitStr, search);
  }
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
}

function searchToSum(search: SearchAux): [number, number] {
  let sum = 0;
  search.seen.forEach((num) => (sum += num));
  search.seenArr.forEach((num) => (sum += num));
  let sum2 = 0;
  search.seenPt2.forEach((num) => (sum2 += num));
  search.seenArrPt2.forEach((num) => (sum2 += num));
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
}

function main() {
  console.log("Solution: ");
  let start = performance.now();
  console.log(solveInput(input1));
  console.log(solveInput(input2));
  let end = performance.now();

  console.log(`took ${end - start} ms`);

  console.log("Bruteforce solution for part 1:");
  start = performance.now();
  let bfResult = parseIntervals(input1).map(bruteForceSearch);
  console.log(sum2dArray(bfResult));

  let bfResult2 = parseIntervals(input2).map(bruteForceSearch);
  console.log(sum2dArray(bfResult2));
  end = performance.now();
  console.log(`took ${end - start} ms`);
}

function runCsvIteration(
  fuseBlown: { fuseBlown: boolean; secondFuseBlown: boolean },
  timeLimit: number,
  i: number,
  target: number,
) {
  let interval: Interval = [1, i];
  let start = performance.now();
  if (!fuseBlown.fuseBlown) {
    bruteForceSearch(interval);
  }
  let end = performance.now();
  let searches = numberGenInit(interval);
  let end2 = performance.now();

  if (end - start > timeLimit) {
    // slow method is too slow - blow it up
    fuseBlown.fuseBlown = true;
  }

  const numCount = searches.seenArr.length + searches.seen.size;
  const numCountPt2 = searches.seenArrPt2.length + searches.seenPt2.size;

  // Super dumb way to transform 0.31415 -> 31.41%
  const roundedProgress = Math.round((10000 * i) / target) / 100;
  console.log(
    `${i},${roundedProgress},${numCount},${numCountPt2},${fuseBlown ? "" : end - start},${end2 - end}`,
  );

  // fast method is too slow - stop evaulating. Kind of like a second fuse.
  if (end2 - end > timeLimit) {
    fuseBlown.secondFuseBlown = true;
  }
}

function performanceCsvChart() {
  // NB: If trying to solve pt2, it can go over heap memory limit, need to set
  // increased heap size like this:
  // NODE_OPTIONS=--max-old-space-size=8192 npx ts-node t2.ts
  const target = Number.MAX_SAFE_INTEGER; // 9007199254740990
  const start = 1; //  Math.round(target * 0.7)
  // const start = target - 1; //  Math.round(target * 0.7)
  const timeLimit = 1000 * 60 * 10;

  // Safety fuse: put a time limit on brute-force method. After it breaks, continue counting
  // with the faster method as long as possible.
  let fuseBlown = { fuseBlown: true, secondFuseBlown: false };

  //csv header
  // i - iteration
  // progress - % of where we are in relevance to target
  // numcount - amount of palindrome numbers in the interval
  // bftime - brute force time, ms
  // mytime - fast(er) algo time, ms
  console.log("i,progress,numcount,numcount_2,bftime,mytime");

  for (let i = start; i < target; i = Math.ceil(i * 1.3)) {
    runCsvIteration(fuseBlown, timeLimit, i, target);
    if (fuseBlown.secondFuseBlown) {
      break;
    }
  }
  if (!fuseBlown.secondFuseBlown) {
    runCsvIteration(fuseBlown, timeLimit, target, target);
  }
}

main();
performanceCsvChart();
