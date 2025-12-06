import * as fs from "fs";

const lines = fs.readFileSync("inp_base", "utf-8").split("\n");
const lines2 = fs.readFileSync("inp_full", "utf-8").split("\n");

function parseInput(lines: string[]): [number[][], string[]] {
  if (lines[lines.length - 1].trim().length == 0) {
    lines.pop();
  }
  let numberResults = [];
  for (let i = 0; i < lines.length - 1; i++) {
    let strings = lines[i]
      .split(" ")
      .map((x) => x.trim())
      .filter((x) => x.length > 0);
    numberResults.push(strings.map((x) => parseInt(x)));
  }

  let stringResults = lines[lines.length - 1]
    .split(" ")
    .map((x) => x.trim())
    .filter((x) => x.length > 0);

  return [numberResults, stringResults];
}

function parseInput2(lines: string[]): [number[][], string[]] {
  if (lines[lines.length - 1].trim().length == 0) {
    lines.pop();
  }
  let numbers: string[][] = [];
  // console.log(lines);
  const numCount = lines.length - 1;
  let stringLine = lines[numCount];

  // console.log(`stringLine: '${stringLine}'`);
  for (let i = 0; i < stringLine.length; i++) {
    // console.log(`i=${i}, numbers=${JSON.stringify(numbers)}`);
    if (stringLine[i] == " ") {
      continue;
    }

    let currentNumbers = [""];
    numbers.push(currentNumbers);

    for (let k = 0; k < numCount; k++) {
      let digit = lines[k][i].trim();
      currentNumbers[0] += digit;
    }

    let j = i + 1;

    while (j < stringLine.length && stringLine[j] == " ") {
      // console.log(`j=${j}`);

      currentNumbers.push("");
      for (let k = 0; k < numCount; k++) {
        // console.log(`j=${j},k=${k},char='${lines[k][j]}'`);
        currentNumbers[currentNumbers.length - 1] += lines[k][j].trim();
      }
      j++;
    }
    if (currentNumbers[currentNumbers.length - 1].trim().length === 0) {
      currentNumbers.pop();
    }
  }
  let stringResults = lines[lines.length - 1]
    .split(" ")
    .map((x) => x.trim())
    .filter((x) => x.length > 0);

  return [
    numbers.map((a: string[]) => a.map((x: string) => parseInt(x))),
    stringResults,
  ];
}

const opApply = {
  "*": (x: number, y: number) => x * y,
  "+": (x: number, y: number) => x + y,
};

const initial = {
  "*": 1,
  "+": 0,
};

function applyOp(column: number, input: number[][], ops: string[]) {
  const stringOp = ops[column];
  const op = opApply[stringOp];
  let result = initial[stringOp];
  for (let i = 0; i < input.length; i++) {
    // console.log(`Applying to ${result} and ${input[i][column]}`);
    result = op(result, input[i][column]);
  }
  return result;
}

function applyOp2(column: number, input: number[][], ops: string[]) {
  const stringOp = ops[column];
  const op = opApply[stringOp];
  let result = initial[stringOp];
  for (let i = 0; i < input[column].length; i++) {
    // console.log(`Applying to ${result} and ${input[i][column]}`);
    result = op(result, input[column][i]);
  }
  return result;
}

function part1(inputFull: [number[][], string[]]) {
  let [input, ops] = inputFull;
  let sum = 0;
  for (let i = 0; i < ops.length; i++) {
    const curRes = applyOp(i, input, ops);
    // console.log(`Column ${i}: ${curRes}`);
    sum += curRes;
  }
  console.log(sum);
}

function part2(inputFull: [number[][], string[]]) {
  let [input, ops] = inputFull;
  let sum = 0;
  for (let i = 0; i < ops.length; i++) {
    const curRes = applyOp2(i, input, ops);
    // console.log(`Column ${i}: ${curRes}`);
    sum += curRes;
  }
  console.log(sum);
}

let input11 = parseInput(lines);
let input12 = parseInput2(lines);
console.log(input11);
console.log(input12);

let input21 = parseInput(lines2);
let input22 = parseInput2(lines2);
console.log(input21);
console.log(input22);
part1(input11);
part1(input21);

part2(input12);
part2(input22);
