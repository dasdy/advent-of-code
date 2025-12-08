import * as fs from "fs";

const lines = fs.readFileSync("input_base", "utf-8").trim().split("\n");
const lines2 = fs.readFileSync("input_full", "utf-8").trim().split("\n");

type Point = {
  x: number;
  y: number;
  z: number;
};

type Pair = {
  a: GroupedPoint;
  b: GroupedPoint;
  distance: number;
};

type GroupedPoint = {
  p: Point;
  group: number;
};

type Circuit = {
  points: GroupedPoint[];
};

function parsePoint(line: string): Point {
  let numbers = line
    .trim()
    .split(",")
    .map((x) => parseInt(x));
  return {
    x: numbers[0],
    y: numbers[1],
    z: numbers[2],
  };
}

function parseInput(lines: string[]): Point[] {
  return lines.map(parsePoint);
}

function measureDistance(a: Point, b: Point): number {
  let x = a.x - b.x;
  let y = a.y - b.y;
  let z = a.z - b.z;
  return x * x + y * y + z * z;
}

function makePairs(points: GroupedPoint[]): Pair[] {
  let result: Pair[] = [];
  for (let i = 0; i < points.length; i++) {
    for (let j = i + 1; j < points.length; j++) {
      result.push({
        a: points[i],
        b: points[j],
        distance: measureDistance(points[i].p, points[j].p),
      });
    }
  }
  result.sort((a, b) => a.distance - b.distance);
  return result;
}

interface Circuits {
  [id: number]: Circuit;
}

function mergeCircuits(circuits: Circuits, master: number, target: number) {
  if (master === target) return;
  let masterCircuit = circuits[master];
  let targetCircuit = circuits[target];

  for (let p of targetCircuit.points) {
    p.group = master;
  }
  masterCircuit.points = masterCircuit.points.concat(targetCircuit.points);
  delete circuits[target];
}

function part1(lines: string[], toConnect: number) {
  let points = parseInput(lines);
  let groupedPoints = points.map((p, i) => ({ p: p, group: i }));
  let circuits: Circuits = Object.fromEntries(
    groupedPoints.map((item, i) => [i, { points: [item] }]),
  );
  let pairs = makePairs(groupedPoints);

  for (let i = 0; i < Math.min(toConnect, pairs.length); i++) {
    let pair = pairs[i];
    mergeCircuits(circuits, pair.a.group, pair.b.group);
  }

  let circuitList = Object.values(circuits);
  circuitList.sort((a, b) => b.points.length - a.points.length);

  let mult = 1;
  for (let i = 0; i < 3; i++) {
    console.log(`Circuit ${i} (${circuitList[i].points.length})`);
    mult *= circuitList[i].points.length;
  }
  console.log(`total: ${mult}`);
}

function part2(lines: string[]) {
  let points = parseInput(lines);
  let groupedPoints = points.map((p, i) => ({ p: p, group: i }));
  let circuits: Circuits = Object.fromEntries(
    groupedPoints.map((item, i) => [i, { points: [item] }]),
  );
  let pairs = makePairs(groupedPoints);

  let i = 0;
  let pair = pairs[0];
  while (Object.keys(circuits).length > 1) {
    pair = pairs[i];
    mergeCircuits(circuits, pair.a.group, pair.b.group);
    // console.log(`iter: ${i}; circuit count: ${Object.keys(circuits).length}`);
    i++;
  }

  console.log(
    `pair ${i - 1}: ${JSON.stringify(pair)}; ${pair.a.p.x * pair.b.p.x}`,
  );
}

let start = performance.now();
console.log(part1(lines, 10));
console.log(part2(lines));
console.log(part1(lines2, 1000));
console.log(part2(lines2));
let end = performance.now();

console.log(`naive approach took ${end - start}ms`);

type SetNode = {
  p: Point;
  parent: number;
  ix: number;
  rank: number;
};

function findParent(x: SetNode, set: SetNode[]) {
  if (x.parent == x.ix) {
    return x.ix;
  }
  x.parent = findParent(set[x.parent], set);
  return x.parent;
}

function unionSets(a: SetNode, b: SetNode, set: SetNode[]) {
  let aP = set[findParent(a, set)];
  let bP = set[findParent(b, set)];

  if (aP.rank < bP.rank) {
    [aP, bP] = [bP, aP];
  }

  bP.parent = aP.ix;

  if (aP.rank === bP.rank) {
    aP.rank++;
  }
}

function disjointSetSolution(lines: string[], part1Count: number) {
  // reuse some code, but make merging faster using disjoint set algorithm
  let points: Point[] = parseInput(lines);
  // group is not modified here, just leaving it as-s to avoid messing with makePairs function.
  let groupedPoints = points.map((p, i: number) => ({ p: p, group: i }));
  let pairs: Pair[] = makePairs(groupedPoints);

  // Initialize: every point is within its own set
  let unionFind: SetNode[] = [];
  for (let i = 0; i < groupedPoints.length; i++) {
    let newElem = {
      p: points[i],
      ix: i,
      parent: i,
      rank: 0,
    };
    unionFind.push(newElem);
  }

  // As soon as setCount == 1 => we have united all points into one circuit.
  let setCount = points.length;
  for (let i = 0; i < pairs.length; i++) {
    let pair = pairs[i];
    let aSet = unionFind[pair.a.group];
    let bSet = unionFind[pair.b.group];

    if (findParent(aSet, unionFind) !== findParent(bSet, unionFind)) {
      // parents different => will unify...
      setCount--;
    }
    unionSets(aSet, bSet, unionFind);

    if (i === part1Count) {
      // Part 1: find three largest sets after N merges.

      // I miss defaultdict :(
      let sizes = [];
      for (let j = 0; j < unionFind.length; j++) {
        sizes.push(0);
      }

      // Pretty much just unionFind.groupBy(_.parent)
      for (let j = 0; j < unionFind.length; j++) {
        let s = findParent(unionFind[j], unionFind);
        sizes[s]++;
      }
      sizes.sort((x, y) => y - x);

      console.log(
        `items: ${sizes[0]}*${sizes[1]}*${sizes[2]}=${sizes[0] * sizes[1] * sizes[2]}`,
      );
    }

    if (setCount === 1) {
      console.log(
        `pair ${i}: ${JSON.stringify(pair)}; ${pair.a.p.x * pair.b.p.x}`,
      );

      break;
    }
  }
}

start = performance.now();
console.log(disjointSetSolution(lines, 10));
console.log(disjointSetSolution(lines2, 1000));
end = performance.now();
console.log(`disjoint set took ${end - start}ms`);
