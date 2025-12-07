import * as fs from "fs";
import chalk from "chalk";
import convert from "color-convert";

const lines = fs.readFileSync("input_base", "utf-8").trim().split("\n");
const lines2 = fs.readFileSync("input_full", "utf-8").trim().split("\n");

type SplitOutput = {
  line: number[];
  totalSplits: number;
};

const RAY = "|";
const SPLIT = "^";
const EMPTY = ".";
const START = "S";

function toNumber(s: string): number[] {
  let res = [];
  for (let i = 0; i < s.length; i++) {
    if (s[i] === RAY || s[i] == START) {
      res.push(1);
    } else if (s[i] === SPLIT) {
      res.push(-1);
    } else {
      res.push(0);
    }
  }
  return res;
}

function moveTachyon(previous: number[], current: number[]): SplitOutput {
  if (previous.length !== current.length) {
    console.error(
      `wtf? lines have length ${previous.length} and ${current.length}`,
    );
    return undefined;
  }

  let totalSplits = 0;
  for (let i = 0; i < previous.length; i++) {
    let previousCh = previous[i];
    let currentCh = current[i];

    if (previousCh > 0 && currentCh >= 0) {
      current[i] = previousCh + current[i];
    } else if (previousCh > 0 && currentCh <= 0) {
      let splitSuccessful = false;

      if (i > 0) {
        current[i - 1] += previousCh;
        splitSuccessful = true;
      }

      if (i < previous.length) {
        current[i + 1] += previousCh;
        splitSuccessful = true;
      }

      if (splitSuccessful) totalSplits++;
    }
  }

  return {
    line: current,
    totalSplits: totalSplits,
  };
}

function propagateScreen(lines: string[]) {
  let currentLine = toNumber(lines[0]);
  console.log(`${toStr(currentLine)}; 0; 0`);
  let successfulSplits = 0;

  for (let i = 1; i < lines.length; i++) {
    let newLine = toNumber(lines[i]);
    let propagated = moveTachyon(currentLine, newLine);
    successfulSplits += propagated.totalSplits;
    let universes = currentLine.reduce((x, y) => x + (y > 0 ? y : 0));
    console.log(
      `${toStrPretty(propagated.line)}; ${i}: ${successfulSplits}; ${universes};`,
    );
    currentLine = propagated.line;
  }
}

// pretty-printing things
function toStr(line: number[]): string {
  let res = "";
  for (let i = 0; i < line.length; i++) {
    if (line[i] > 0) {
      res += RAY;
    } else if (line[i] < 0) {
      res += SPLIT;
    } else {
      res += EMPTY;
    }
  }
  return res;
}

function toStrPretty(arr: number[]): string {
  // Log scaling objects because full input gets pretty large.
  // Also, clipping min to ignore `0` values. This also forces to set `max` to a value larger than `min` to work around getting silly
  // colors at the start of pipeline
  const min = Math.log(Math.max(Math.min(...arr), 1));
  const max = Math.log(Math.max(2, ...arr));

  return arr
    .map((num) => {
      if (num === 0) {
        return EMPTY;
      } else if (num < 0) {
        return SPLIT;
      } else {
        return colorByValue(Math.log(num), min, max, "|");
      }
    })
    .join("");
}

const HUE_YELLOW = 60;
const HUE_GREEN = 120;

function colorByValue(
  value: number,
  min: number,
  max: number,
  text: string,
): string {
  // scale to [0-1]
  const t = Math.min(1, Math.max(0, (value - min) / (max - min)));

  let hue: number;
  if (t < 0.5) {
    //[0;0.5] => [HUE_YELLOW; HUE_GREEN]
    hue = HUE_GREEN - t * 2 * HUE_YELLOW;
  } else {
    //[0.5;1] => [HUE_YELLOW; HUE_RED] (red is 0, so it's not explicitly mentioned here)
    hue = HUE_YELLOW - (t - 0.5) * 2 * HUE_YELLOW;
  }

  // const rgb = hslToRgb(hue, 100, 50);
  const rgb = convert.hsl.rgb(hue, 100, 50);
  const hex = convert.rgb.hex(rgb[0], rgb[1], rgb[2]);

  return chalk.hex(hex)(text);
}
// end-pretty-printing things

propagateScreen(lines);
propagateScreen(lines2);
