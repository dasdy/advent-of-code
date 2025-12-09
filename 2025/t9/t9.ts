import * as fs from "fs";
import { Canvas, createCanvas } from "canvas";
const lines = fs.readFileSync("input_base", "utf-8").trim().split("\n");
const lines2 = fs.readFileSync("input_full", "utf-8").trim().split("\n");

type Point = {
  x: number;
  y: number;
};

function parsePoint(line: string): Point {
  let numbers = line
    .trim()
    .split(",")
    .map((x) => parseInt(x));
  return {
    x: numbers[0],
    y: numbers[1],
  };
}

function parseInput(lines: string[]): Point[] {
  return lines.map(parsePoint);
}

type SparceRow = [number, number[]];

type SparceGrid = SparceRow[];

function makeGrid(points: Point[]): [SparceGrid, Canvas] {
  let resultDict: Record<number, number[]> = {};

  let canvas = makeImage(points);

  for (let i = 0; i < points.length; i++) {
    let currentPoint = points[i];
    let currentRow = resultDict[currentPoint.x];
    if (!currentRow) {
      currentRow = [];
      resultDict[currentPoint.x] = currentRow;
    }
    currentRow.push(currentPoint.y);
  }

  for (let key of Object.keys(resultDict).map(Number)) {
    let currentRow: number[] = resultDict[key];
    currentRow.sort((x, y) => x - y);
  }

  let result = Object.entries(resultDict).map(
    ([rowStr, columns]) => [Number(rowStr), columns] as SparceRow,
  );

  result.sort((x, y) => x[0] - y[0]);

  return [result, canvas];
}

type Edge = [Point, Point];

function makeEdges(points: Point[]) {
  let edges: Edge[] = [];

  for (let i = 0; i < points.length - 1; i++) {
    const p1 = points[i];
    const p2 = points[i + 1];
    edges.push([p1, p2]);
  }

  edges.push([points[0], points[points.length - 1]]);
  return edges;
}

function calcArea(x1: number, y1: number, x2: number, y2: number) {
  return (Math.abs(x2 - x1) + 1) * (Math.abs(y2 - y1) + 1);
}

function part1(input: string[], image: string) {
  let points = parseInput(input);
  let [grid, canvas] = makeGrid(points);

  let largestArea = 0;
  let bestCoords: [Point, Point] | null = null;

  for (let r1 = 0; r1 < grid.length; r1++) {
    let [upRowCoord, upRow] = grid[r1];

    for (let r2 = r1; r2 < grid.length; r2++) {
      let [downRowCoord, downRow] = grid[r2];
      for (let c1 = 0; c1 < upRow.length; c1++) {
        let leftCoord = upRow[c1];
        for (let c2 = 0; c2 < downRow.length; c2++) {
          let rightCoord = downRow[c2];
          const curArea = calcArea(
            upRowCoord,
            leftCoord,
            downRowCoord,
            rightCoord,
          );
          if (curArea > largestArea) {
            console.log(
              `Coords: ${[upRowCoord, leftCoord, downRowCoord, rightCoord]}; area: ${curArea}`,
            );
            largestArea = curArea;
            let min = {
              x: Math.min(upRowCoord, downRowCoord),
              y: Math.min(leftCoord, rightCoord),
            };
            let max = {
              x: Math.max(upRowCoord, downRowCoord),
              y: Math.max(leftCoord, rightCoord),
            };
            bestCoords = [min, max];
          }
        }
      }
    }
  }

  if (bestCoords) {
    drawRect(points, canvas, bestCoords);
  }

  const buffer = canvas.toBuffer("image/png");
  fs.writeFileSync(image, buffer);

  return largestArea;
}

function fitsInside(min: Point, max: Point, edges: Edge[]): boolean {
  for (let [p1, p2] of edges) {
    let edgeMaxX = Math.max(p1.x, p2.x);
    let edgeMaxY = Math.max(p1.y, p2.y);
    let edgeMinX = Math.min(p1.x, p2.x);
    let edgeMinY = Math.min(p1.y, p2.y);

    // edgeMaxX > minX && edgeMinX < maxX => edge is within rectange on the X axis : there is a common
    // part at [min(minX, edgeMinX), max(maxX, edgeMaxX)] .
    // But this does not mean yet that there is an intersection on Y axis (could be horizontal like below rect)
    //
    // edgeMaxY > minY && edgeMinY < maxY => edge is within rectange on the Y axis.
    // If there is an intersection on X axis together with this condition, there is an intersection for the edge.
    //
    // This only works if we know that edges are either vertical or horizontal, since it essentially checks
    // that bounding box of the edge intersects the rectangle.
    if (
      edgeMaxX > min.x &&
      edgeMinX < max.x &&
      edgeMaxY > min.y &&
      edgeMinY < max.y
    ) {
      return false;
    }
  }

  return true;
}

function part2(input: string[], image: string) {
  let points = parseInput(input);
  let edges = makeEdges(points);
  let [grid, canvas] = makeGrid(points);

  let largestArea = 0;
  let bestCoords: [Point, Point] | null = null;

  for (let r1 = 0; r1 < grid.length; r1++) {
    let [upRowCoord, upRow] = grid[r1];

    console.log(
      `Calculating ${upRowCoord}: ${r1}/${grid.length} (${(100 * r1) / grid.length}%)`,
    );
    for (let r2 = r1; r2 < grid.length; r2++) {
      let [downRowCoord, downRow] = grid[r2];
      for (let c1 = 0; c1 < upRow.length; c1++) {
        let leftCoord = upRow[c1];
        for (let c2 = 0; c2 < downRow.length; c2++) {
          let rightCoord = downRow[c2];

          let min = {
            x: Math.min(upRowCoord, downRowCoord),
            y: Math.min(leftCoord, rightCoord),
          };
          let max = {
            x: Math.max(upRowCoord, downRowCoord),
            y: Math.max(leftCoord, rightCoord),
          };

          const curArea = calcArea(
            upRowCoord,
            leftCoord,
            downRowCoord,
            rightCoord,
          );

          if (!fitsInside(min, max, edges)) {
            continue;
          }

          if (curArea > largestArea) {
            console.log(
              `====\nNew MAX: Coords: ${[upRowCoord, leftCoord, downRowCoord, rightCoord]}; area: ${curArea}`,
            );
            largestArea = curArea;
            bestCoords = [min, max];
          }
        }
      }
    }
  }

  if (bestCoords) {
    drawRect(points, canvas, bestCoords);
  }

  const buffer = canvas.toBuffer("image/png");
  fs.writeFileSync(image, buffer);

  return largestArea;
}

function drawRect(points: Point[], canvas: Canvas, coords: [Point, Point]) {
  const ctx = canvas.getContext("2d");

  let minX = points[0].x;
  let maxX = points[0].x;
  let minY = points[0].y;
  let maxY = points[0].y;
  for (let i = 1; i < points.length; i++) {
    const p = points[i];
    minX = Math.min(minX, p.x);
    maxX = Math.max(maxX, p.x);
    minY = Math.min(minY, p.y);
    maxY = Math.max(maxY, p.y);
  }
  const origWidth = maxX - minX + 1;
  const origHeight = maxY - minY + 1;
  const maxCanvasSize = 2000;
  const scaleDownX = Math.max(1, Math.ceil(origWidth / maxCanvasSize));
  const scaleDownY = Math.max(1, Math.ceil(origHeight / maxCanvasSize));
  const minCanvasSize = 200;
  let width = Math.ceil(origWidth / scaleDownX);
  let height = Math.ceil(origHeight / scaleDownY);
  const scaleUpFactorX =
    width < minCanvasSize ? Math.ceil(minCanvasSize / width) : 1;
  const scaleUpFactorY =
    height < minCanvasSize ? Math.ceil(minCanvasSize / height) : 1;
  const scaleX = scaleDownX / scaleUpFactorX;
  const scaleY = scaleDownY / scaleUpFactorY;

  // Convert grid coords to canvas coords
  const [p1, p2] = coords;
  const rectX = Math.floor((p1.x - minX) / scaleX);
  const rectY = Math.floor((p1.y - minY) / scaleY);
  const rectW = Math.floor((p2.x - minX) / scaleX) - rectX;
  const rectH = Math.floor((p2.y - minY) / scaleY) - rectY;

  // Semi-transparent fill
  ctx.fillStyle = "rgba(0, 255, 0, 0.3)"; // green at 30% opacity
  ctx.fillRect(rectX, rectY, rectW, rectH);

  // Outline
  ctx.strokeStyle = "green";
  ctx.lineWidth = 2;
  ctx.strokeRect(rectX, rectY, rectW, rectH);
}

function makeImage(points: Point[]): Canvas {
  // compute bounds from points
  let minX = points[0].x;
  let maxX = points[0].x;
  let minY = points[0].y;
  let maxY = points[0].y;

  for (let i = 1; i < points.length; i++) {
    const p = points[i];
    minX = Math.min(minX, p.x);
    maxX = Math.max(maxX, p.x);
    minY = Math.min(minY, p.y);
    maxY = Math.max(maxY, p.y);
  }

  const origWidth = maxX - minX + 1;
  const origHeight = maxY - minY + 1;

  console.log(`Original size: ${[origWidth, origHeight]}`);

  // Limit maximum canvas size for large images
  const maxCanvasSize = 2000;
  const scaleDownX = Math.max(1, Math.ceil(origWidth / maxCanvasSize));
  const scaleDownY = Math.max(1, Math.ceil(origHeight / maxCanvasSize));

  // Scale down the dimensions
  let width = Math.ceil(origWidth / scaleDownX);
  let height = Math.ceil(origHeight / scaleDownY);

  // If scaled dimensions are too small, scale them up for better visibility
  const minCanvasSize = 200;
  const scaleUpFactorX =
    width < minCanvasSize ? Math.ceil(minCanvasSize / width) : 1;
  const scaleUpFactorY =
    height < minCanvasSize ? Math.ceil(minCanvasSize / height) : 1;

  // Final scale factors for plotting conversions
  const scaleX = scaleDownX / scaleUpFactorX;
  const scaleY = scaleDownY / scaleUpFactorY;

  width *= scaleUpFactorX;
  height *= scaleUpFactorY;

  console.log(
    `Final canvas size: ${[width, height]}, scale factors: ${[scaleX, scaleY]}`,
  );

  // Create canvas
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(0, 0, width, height);

  // Draw lines between consecutive points (horizontal or vertical only)
  ctx.strokeStyle = "#000000";
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let i = 0; i < points.length - 1; i++) {
    const p1 = points[i];
    const p2 = points[i + 1];

    const x1 = Math.floor((p1.x - minX) / scaleX);
    const y1 = Math.floor((p1.y - minY) / scaleY);
    const x2 = Math.floor((p2.x - minX) / scaleX);
    const y2 = Math.floor((p2.y - minY) / scaleY);

    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
  }
  // Connect last point to first point
  const first = points[0];
  const last = points[points.length - 1];
  const firstX = Math.floor((first.x - minX) / scaleX);
  const firstY = Math.floor((first.y - minY) / scaleY);
  const lastX = Math.floor((last.x - minX) / scaleX);
  const lastY = Math.floor((last.y - minY) / scaleY);
  ctx.moveTo(lastX, lastY);
  ctx.lineTo(firstX, firstY);
  ctx.stroke();

  return canvas;
}

console.log(part1(lines, "base.png"));
console.log("-----------------");
console.log(part2(lines, "base_2.png"));
console.log("-----------------");
console.log(part1(lines2, "full.png"));
console.log(part2(lines2, "full_2.png"));
