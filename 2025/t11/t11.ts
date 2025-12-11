import * as fs from "fs";
import convert from "color-convert";

const lines = fs.readFileSync("input_base", "utf-8").trim().split("\n");
const lines2 = fs.readFileSync("input_base_2", "utf-8").trim().split("\n");
const lines3 = fs.readFileSync("input_full", "utf-8").trim().split("\n");

type LineOutput = {
  source: string;
  outputs: string[];
};

function parseLine(line: string): LineOutput {
  let [source, outputsFull] = line.split(":");
  let outputs = outputsFull.split(" ");

  return {
    source: source,
    outputs: outputs.filter((x) => x.length > 0),
  };
}

function toDot(edges: LineOutput[]) {
  console.log("digraph {");
  edges.forEach((x) =>
    x.outputs.forEach((o) => console.log(`  ${x.source} -> ${o};`)),
  );
  console.log(`   you [style=filled, color=green, fontcolor=white];`);
  console.log(`   svr [style=filled, color=green, fontcolor=white];`);
  console.log(`   dac [style=filled, color=green, fontcolor=white];`);
  console.log(`   fft [style=filled, color=green, fontcolor=white];`);
  console.log(`   out [color=red];`);
  console.log("}");
}

function parseOutput(lines: string[]) {
  let outputConf = lines.map(parseLine);

  // toDot(outputConf);
  return outputConf;
}

function countPathsAux(
  graph: Record<string, string[]>,
  from: string,
  target: string,
  cache: Map<string, number>,
): number {
  if (from === target) {
    return 1;
  }
  const key = `${from}`;

  if (cache.has(key)) {
    return cache.get(key)!;
  }

  let sum = 0;
  for (let o of graph[from] || []) {
    sum += countPathsAux(graph, o, target, cache);
  }

  cache.set(key, sum);

  return sum;
}

function countPaths(
  lines: string[],
  start: string,
  end: string,
  outfile: string | null = null,
) {
  let edges = parseOutput(lines);
  let asDict: Record<string, string[]> = {};
  for (let l of edges) {
    asDict[l.source] = l.outputs;
  }

  let cache = new Map();
  let res = countPathsAux(asDict, start, end, cache);
  toDotColored(edges, cache, outfile);

  return res;
}

function countPathsPt2Aux(
  graph: Record<string, string[]>,
  from: string,
  hasToVisit: string[],
  target: string,
  currentPath: string,
  cache: Map<string, number>,
): number {
  if (from === target) {
    if (hasToVisit.length === 0) return 1;
    return 0;
  }

  // only 2 items in the list - no need to sort now
  const visitKey = hasToVisit.slice().join(",");
  const key = `${from}|${visitKey}`;
  if (cache.has(key)) {
    return cache.get(key)!;
  }

  let toVisitIx = hasToVisit.indexOf(from);
  if (toVisitIx >= 0) {
    hasToVisit = hasToVisit.filter((x) => x !== from);
  }

  let sum = 0;
  for (let o of graph[from]) {
    sum += countPathsPt2Aux(
      graph,
      o,
      hasToVisit,
      target,
      currentPath + `->${o}`,
      cache,
    );
  }

  cache.set(key, sum);

  return sum;
}

function countPathsVisiting(
  lines: string[],
  start: string,
  visiting: string[],
  end: string,
  outfile: string | null = null,
) {
  let edges = parseOutput(lines);
  let asDict: Record<string, string[]> = {};
  for (let l of edges) {
    asDict[l.source] = l.outputs;
  }

  let cache = new Map<string, number>();
  let count = countPathsPt2Aux(asDict, start, visiting, end, "", cache);
  // Aggregate counts by node only, ignoring the "|visit" suffix
  let aggregated = new Map<string, number>();
  cache.forEach((val, key) => {
    let node = key.split("|")[0];
    aggregated.set(node, (aggregated.get(node) ?? 0) + val);
  });

  toDotColored(edges, aggregated, outfile);

  return count;
}

function toDotColored(
  edges: LineOutput[],
  edgeValues: Map<string, number>,
  outfile: string | null,
) {
  // Determine maximum value for scaling the gradient
  let maxVal = 0;
  edgeValues.forEach((val) => {
    if (val > maxVal) maxVal = val;
  });
  maxVal = Math.log(maxVal);

  let ln = "";

  ln += "digraph {\n";

  edges.forEach((x) => {
    x.outputs.forEach((o) => {
      const key = x.source;
      const val = Math.log(edgeValues.get(key) ?? 1);

      let color: string;

      if (val === 0) {
        // Black
        color = "#000000";
      } else if (val === 1) {
        // Green in RGB
        color = "#00ff00";
      } else {
        // Scale value between 0 and max to change hue between green and red
        // Green hue in HSL ~ 120°, Red ~ 0°. Saturation=100%, Lightness=50%
        const hue = 120 - (120 * val) / maxVal; // 120 → green, 0 → red
        const rgb = convert.hsl.hex([hue, 100, 50]);
        color = `#${rgb}`;
      }

      ln += `  ${x.source} -> ${o} [color="${color}"];\n`;
    });
  });

  // Optionally: style nodes specially
  ln += `you [style=filled, color=green, fontcolor=white];\n`;
  ln += `svr [style=filled, color=green, fontcolor=white];\n`;
  ln += `dac [style=filled, color=green, fontcolor=white];\n`;
  ln += `fft [style=filled, color=green, fontcolor=white];\n`;
  ln += `out [color=red];`;
  ln += "}\n";

  // Output routing
  if (outfile) {
    fs.writeFileSync(outfile, ln, "utf8");
  }
}

function part2UsingPart1(
  lines: string[],
  start: string,
  visiting: string[],
  end: string,
): number {
  // This graph does not have cycles. This means that if we know the order we have to visit the nodes,
  // the result will be just the product of paths between each pair of nodes in chain start -> [visiting] -> end
  let edges = parseOutput(lines);
  let asDict: Record<string, string[]> = {};
  for (let l of edges) {
    asDict[l.source] = l.outputs;
  }

  let mult = 1;
  let path = [start].concat(visiting).concat([end]);
  for (let i = 0; i < path.length - 1; i++) {
    mult *= countPaths(lines, path[i], path[i + 1]);
  }
  return mult;
}

console.log(`Part 1, test output: ${countPaths(lines, "you", "out")}`);
console.log(`Part 1, real output: ${countPaths(lines3, "you", "out")}`);

console.log(`Part 1.5, paths svr->out: ${countPaths(lines3, "svr", "out")}`);
console.log(`Part 1.5, paths svr->fft: ${countPaths(lines3, "svr", "fft")}`);
console.log(`Part 1.5, paths svr->dac: ${countPaths(lines3, "svr", "dac")}`);
console.log(`Part 1.5, paths fft->dac: ${countPaths(lines3, "fft", "dac")}`);
console.log(`Part 1.5, paths dac->out: ${countPaths(lines3, "dac", "out")}`);
//
console.log(
  `Part 2, test ouput: ${countPathsVisiting(lines2, "svr", ["fft", "dac"], "out")}`,
);
console.log(
  `Part 2, real output: ${countPathsVisiting(lines3, "svr", ["fft", "dac"], "out", "./part2-full.dot")}`,
);
console.log(
  `Part 2, using part 1: ${part2UsingPart1(lines3, "svr", ["fft", "dac"], "out")}`,
);
