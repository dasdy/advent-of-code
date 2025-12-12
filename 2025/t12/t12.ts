import * as fs from "fs";

const lines = fs.readFileSync("input_base", "utf-8").trim().split("\n");
const lines2 = fs.readFileSync("input_full", "utf-8").trim().split("\n");

type Shape = {
  rows: number;
  columns: number;
  stringRep: string[];
};

type Region = {
  rows: number;
  columns: number;
};

type ToFill = {
  region: Region;
  shapes: number[];
};

type TaskDefinition = {
  shapes: Shape[];
  toFill: ToFill[];
};

function parseInput(lines: string[]): TaskDefinition {
  let shapes: Shape[] = [];

  let i = 0;
  let currentShape: string[] = [];
  while (lines[i].indexOf("x") < 0) {
    if (lines[i].indexOf(":") > 0) {
      i++;
      continue;
    }
    if (lines[i].trim().length === 0) {
      shapes.push({
        stringRep: currentShape,
        rows: currentShape.length,
        columns: currentShape[0].length,
      });
      currentShape = [];
    } else {
      currentShape.push(lines[i]);
    }
    i++;
  }

  if (currentShape.length > 0) {
    shapes.push({
      stringRep: currentShape,
      rows: currentShape.length,
      columns: currentShape[0].length,
    });
  }

  let regions: ToFill[] = [];

  for (; i < lines.length; i++) {
    let line = lines[i];

    let m = line.match(/(\d+)x(\d+):(.*)/);

    let rows = parseInt(m[1]);
    let cols = parseInt(m[2]);

    let shapeCounts: number[] = m[3]
      .split(" ")
      .filter((x) => x.trim().length > 0)
      .map((x: string): number => parseInt(x));

    regions.push({
      region: { rows: rows, columns: cols },
      shapes: shapeCounts,
    });
  }

  return { toFill: regions, shapes };
}

function shapeBoundBox(s: Shape) {
  return s.rows * s.columns;
}

function shapeArea(s: Shape) {
  return s.stringRep.reduce((x, v) => x + v.split("#").length - 1, 0);
}

function part1Naive(lines: string[]) {
  let td = parseInput(lines);

  let fits = 0;
  let maybe = 0;
  let noFit = 0;

  for (let i = 0; i < td.toFill.length; i++) {
    let region = td.toFill[i];
    let area = region.region.rows * region.region.columns;

    let accumArea = 0;
    let accumBoundBox = 0;
    for (let j = 0; j < region.shapes.length; j++) {
      // console.log(
      //   `j: ${j}, bbox: ${shapeBoundBox(td.shapes[j])}, area: ${shapeArea(td.shapes[j])}`,
      // );
      accumBoundBox += region.shapes[j] * shapeBoundBox(td.shapes[j]);
      accumArea += region.shapes[j] * shapeArea(td.shapes[j]);
    }

    if (area > accumBoundBox) {
      // console.log(`region ${JSON.stringify(region)} is def possible`);
      fits++;
    } else if (area > accumArea) {
      console.log(`region ${i} ${JSON.stringify(region)} requires checking`);
      maybe++;
    } else {
      noFit++;
    }
  }

  console.log(`definitely: ${fits}, maybe: ${maybe}, not: ${noFit}`);
}

part1Naive(lines);
part1Naive(lines2);
