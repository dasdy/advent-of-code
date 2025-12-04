import * as fs from "fs";

const lines = fs
  .readFileSync("input_sample", "utf-8")
  .trim()
  .split("\n")
  .map((line) => line.split(""));
const lines2 = fs
  .readFileSync("input_full", "utf-8")
  .trim()
  .split("\n")
  .map((line) => line.split(""));

const empty = ".";
const nonempty = "@";

const neighborIndices = [
  [-1, -1],
  [-1, 0],
  [-1, 1],
  [0, -1],
  [0, 1],
  [1, -1],
  [1, 0],
  [1, 1],
];

function countNeighbors(items: string[][], row: number, col: number) {
  // assume rectangular grid
  let maxCol = items[0].length;
  let neighborCount = 0;
  for (let i = 0; i < neighborIndices.length; i++) {
    let [rowOff, colOff] = neighborIndices[i];

    const newRow = row + rowOff;
    const newCol = col + colOff;
    // console.log(
    //   `${[row, col, items[row][col]]} -> ${[newRow, newCol, (items[newRow] || [])[newCol]]}`,
    // );

    if (newRow < 0 || newRow >= items.length) {
      continue;
    }
    if (newCol < 0 || newCol >= maxCol) {
      continue;
    }
    if (items[newRow][newCol] === nonempty) {
      // console.log(
      //   `nonempty: ${[row, col, items[row][col]]} -> ${[newRow, newCol, (items[newRow] || [])[newCol]]}`,
      // );
      neighborCount++;
    }
  }
  return neighborCount;
}

function part1(items: string[][]): number {
  let itemCount = 0;
  for (let i = 0; i < items.length; i++) {
    const line = items[i];
    for (let j = 0; j < line.length; j++) {
      if (line[j] === nonempty) {
        let neighbors = countNeighbors(items, i, j);
        if (neighbors < 4) {
          // console.log(`Found ${itemCount} neighbors at ${[i, j]}`);
          itemCount++;
        }
      }
    }
  }
  return itemCount;
}

function part2(items: string[][]): number {
  let itemCount = 0;
  let itemsClone = clone(items);
  let clearedThisIter = true;
  let iter = 0;

  while (clearedThisIter) {
    clearedThisIter = false;
    console.log(`at iteration ${iter++} (${itemCount} total)`);

    for (let i = 0; i < items.length; i++) {
      const line = items[i];
      for (let j = 0; j < line.length; j++) {
        if (line[j] === nonempty) {
          let neighbors = countNeighbors(items, i, j);
          if (neighbors < 4) {
            // console.log(`Found ${neighbors} neighbors at ${[i, j]}`);
            itemCount++;
            clearedThisIter = true;
            itemsClone[i][j] = empty;
          } else {
            itemsClone[i][j] = nonempty;
          }
        } else {
          itemsClone[i][j] = empty;
        }
      }
    }

    [itemsClone, items] = [items, itemsClone];
  }
  return itemCount;
}

function clone(items: string[][]): string[][] {
  return JSON.parse(JSON.stringify(items));
}

console.log(lines);

console.log(part1(lines));
console.log(part1(lines2));
console.log(part2(lines));
console.log(part2(lines2));
