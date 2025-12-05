import * as fs from "fs";

const input1 = fs.readFileSync("input_base", "utf-8").trim();
const input2 = fs.readFileSync("input_full", "utf-8").trim();

// [from; to]
type Interval = [number, number];

function parseInput(body: string): [Interval[], number[]] {
  const lines = body.split("\n");
  let i = 0;

  let intervals = [];
  while (lines[i].trim() !== "") {
    const pair = lines[i].split("-");
    intervals.push([parseInt(pair[0]), parseInt(pair[1])]);
    i++;
  }

  let numbers = lines.splice(i + 1).map((s) => parseInt(s.trim()));

  return [intervals, numbers];
}

function isInIntervals(n: number, intervals: Interval[]) {
  for (let i of intervals) {
    if (n >= i[0] && n <= i[1]) return true;
  }
  return false;
}

function part1(intervals: Interval[], numbers: number[]) {
  let count = 0;
  for (let n of numbers) {
    if (isInIntervals(n, intervals)) {
      count++;
    }
  }
  return count;
}

function part2(intervals: Interval[]) {
  intervals.sort(intervalOrderKey);
  let newArr = [intervals[0]];
  let i = 1;
  while (i < intervals.length) {
    let lastJoinedInterval = newArr[newArr.length - 1];
    let currentInterval = intervals[i];

    let mergedInterval = mergeIntervals(lastJoinedInterval, currentInterval);

    if (mergedInterval !== null) {
      newArr[newArr.length - 1] = mergedInterval;
    } else {
      newArr.push(currentInterval);
    }

    i++;
  }

  let totalSize = 0;
  for (let i = 0; i < newArr.length; i++) {
    totalSize += newArr[i][1] - newArr[i][0] + 1;
  }
  return totalSize;
}

function pointInInterval(x: number, i: Interval): boolean {
  return x >= i[0] && x <= i[1];
}

function intervalsIntersect(a: Interval, b: Interval): boolean {
  if (pointInInterval(a[0], b) || pointInInterval(a[1], b)) return true;
  if (pointInInterval(b[0], a) || pointInInterval(b[1], a)) return true;
  return false;
}

function intervalOrderKey(a: Interval, b: Interval) {
  return a[0] - b[0];
}

function mergeIntervals(a: Interval, b: Interval): Interval | null {
  if (!intervalsIntersect(a, b)) {
    return null;
  }
  let [newStart, newEnd] = [Math.min(a[0], b[0]), Math.max(a[1], b[1])];
  return [newStart, newEnd];
}

let [i1, n1] = parseInput(input1);
console.log(part1(i1, n1));
console.log(part2(i1));

let [i2, n2] = parseInput(input2);
console.log(part1(i2, n2));
console.log(part2(i2));
