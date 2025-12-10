import * as fs from "fs";
import { init } from "z3-solver";

const lines = fs.readFileSync("input_base", "utf-8").trim().split("\n");
const lines2 = fs.readFileSync("input_full", "utf-8").trim().split("\n");

type Button = number[];

type Machine = {
  lamps: number;
  targetState: string;
  buttons: Button[];
  joltages: number[];
};

function parseButtons(buttonLst: string) {
  const regex = /\((\d+(?:,\d+)*)\)/g;
  const matches = [];
  let match;

  while ((match = regex.exec(buttonLst)) !== null) {
    matches.push(match[1].split(",").map((x) => parseInt(x)));
  }
  return matches;
}

function emptyLightState(length: number): boolean[] {
  let res = [];
  for (let i = 0; i < length; i++) {
    res.push(false);
  }
  return res;
}
function emptyJoltState(length: number): number[] {
  let res = [];
  for (let i = 0; i < length; i++) {
    res.push(0);
  }
  return res;
}

function stateToStr(state: boolean[]): string {
  return state.map((x) => (x ? "#" : ".")).join("");
}
function strToState(state: string): boolean[] {
  return state.split("").map((x) => x === "#");
}

function switchLights(state: boolean[], button: number[]): boolean[] {
  let stateStr = stateToStr(state);
  let stateCopy = strToState(stateStr);
  for (let i = 0; i < button.length; i++) {
    stateCopy[button[i]] = !stateCopy[button[i]];
  }

  // console.log(`[${button}]: ${stateStr} => ${stateToStr(stateCopy)}`);

  return stateCopy;
}

function parseLine(line: string): Machine {
  let match = line.match(/\[([.#]+)\] (.+) {([\d,]+)}/);

  let targetState = match[1];

  let buttons = parseButtons(match[2]);
  let joltages = match[3].split(",").map((x) => parseInt(x));

  return {
    lamps: targetState.length,
    targetState: targetState,
    buttons: buttons,
    joltages: joltages,
  };
}

function combinations<T>(items: T[]): T[][] {
  const result: T[][] = [];
  const n = items.length;

  // Iterate from 1 to 2^n - 1 to generate all possible subsets
  // Each number represents a unique combination where a set bit
  // indicates the presence of an element from the original array.
  let end = 1 << n;
  for (let i = 1; i < end; i++) {
    const currentCombination: T[] = [];
    for (let j = 0; j < n; j++) {
      // Check if the j-th bit is set in i
      if ((i >> j) & 1) {
        currentCombination.push(items[j]);
      }
    }
    result.push(currentCombination);
  }

  // Sort the combinations by their length (shorter combinations first)
  result.sort((a, b) => a.length - b.length);

  return result;
}

function shortestLightsCombo(machine: Machine): number {
  let startState = emptyLightState(machine.lamps);
  let sequences = combinations(machine.buttons);
  // console.log(sequences);

  for (let s of sequences) {
    // console.log(`applying: ${JSON.stringify(s)}`);
    let endState = startState;
    for (let i = 0; i < s.length; i++) {
      endState = switchLights(endState, s[i]);
    }
    if (stateToStr(endState) === machine.targetState) {
      console.log(`looks good! ${JSON.stringify(s)}`);
      return s.length;
    }
  }

  return -1;
}

function part1(lines: string[]) {
  let sum = 0;
  for (let l of lines) {
    sum += shortestLightsCombo(parseLine(l));
    console.log(`Part 1 sum::::${sum}`);
  }
}

part1(lines);
part1(lines2);

function switchJoltages(state: number[], button: number[]) {
  let stateCopy = state.map((x) => x);
  for (let i = 0; i < button.length; i++) {
    stateCopy[button[i]]++;
  }

  // console.log(`[${button}]: ${state.join(",")} => ${stateCopy.join(",")}`);

  return stateCopy;
}

function compareJoltages(state: number[], targetState: number[]) {
  let nonEqualFound = false;
  for (let i = 0; i < state.length; i++) {
    if (state[i] > targetState[i]) return 1;
    if (state[i] < targetState[i]) nonEqualFound = true;
  }
  return nonEqualFound ? -1 : 0;
}

type QueueItem = {
  state: number[];
  buttonPresses: number[][];
  buttonToPress: number;
};

function visitedStateHash(i: QueueItem): string {
  return `${JSON.stringify(i.state)}:${i.buttonToPress}`;
}

// First naive approach - obviously does not work since we have like 74+ button presses to reach the goal
function shortestJoltageCombo(machine: Machine) {
  let startState = emptyJoltState(machine.lamps);
  let queue: QueueItem[] = [];

  let visitedStates = new Set<string>();
  for (let i = 0; i < machine.buttons.length; i++) {
    queue.push({
      state: startState,
      buttonPresses: [],
      buttonToPress: i,
    });
  }

  let maxKp = 0;
  while (queue.length > 0) {
    let item = queue.shift();

    if (maxKp < item.buttonPresses.length) {
      maxKp = item.buttonPresses.length;
      console.log(`Items of length ${maxKp}`);
    }

    let itemHash = visitedStateHash(item);

    if (visitedStates.has(itemHash)) {
      continue;
    }
    let buttonToPress = machine.buttons[item.buttonToPress];

    let newState = switchJoltages(item.state, buttonToPress);

    let compareRes = compareJoltages(newState, machine.joltages);
    if (compareRes === 0) {
      console.log(
        `found! (${item.buttonPresses.length + 1}) ${JSON.stringify(item.buttonPresses)} + [${buttonToPress}] == [${machine.joltages}]`,
      );
      return item.buttonPresses.length + 1;
    } else if (compareRes > 0) {
      continue;
    } else if (compareRes < 0) {
      for (let i = 0; i < machine.buttons.length; i++) {
        queue.push({
          state: newState,
          buttonPresses: item.buttonPresses.concat([buttonToPress]),
          buttonToPress: i,
        });
      }
    }
    visitedStates.add(itemHash);
  }
}

async function shortestJoltageComboILP(machine: Machine) {
  let buttons = machine.buttons;
  let joltages = machine.joltages;
  const { Context } = await init();
  const { Int, Optimize } = Context("main");

  const vars = buttons.map((_, i) => Int.const(`x${i}`));
  const opt = new Optimize();

  // everything should be a non-negative integer
  for (let v of vars) {
    opt.add(v.ge(0));
  }

  // lampToButtons[lamp_id] = <list of button ids (aka variable ids) that can influence it>
  // Essentially, this is the encoding of left part of linear equations system, where all
  // variables add up. Each equation is assigned to a lamp, and end joltage[lamp_id] is right hand
  // of those linear equations
  let lampToButtons = joltages.map((_) => Array());
  for (let i = 0; i < buttons.length; i++) {
    let b = buttons[i];
    for (let j = 0; j < b.length; j++) {
      lampToButtons[b[j]].push(vars[i]);
    }
  }

  // Sum of presses of each button that influences lamp j should be equal to joltage
  for (let i = 0; i < joltages.length; i++) {
    let joltage = joltages[i];
    let columnConstraint = lampToButtons[i]
      .reduce((x, y) => x.add(y))
      .eq(joltage);
    opt.add(columnConstraint);
  }

  const total = vars.reduce((acc, p) => acc.add(p));

  opt.minimize(total);

  await opt.check();
  const model = opt.model();

  let part2 = BigInt(0);
  let i = 0;
  for (const p of vars) {
    i++;
    const valAst = model.get(p) as any;
    console.log(`${i - 1} (${buttons[i - 1]}) == ${valAst.value()}`);
    part2 += valAst.value();
  }

  return Number(part2);
}

async function part2(lines: string[]) {
  let sum = 0;
  for (let i = 0; i < lines.length; i++) {
    let l = lines[i];
    sum += await shortestJoltageComboILP(parseLine(l));
    console.log(
      `${i + 1}/${lines.length} (${((100 * (1 + i)) / lines.length).toFixed(2)}%) sum::::${sum}`,
    );
  }
}

// console.log(shortestJoltageComboELS(parseLine(lines[0])));
console.log(part2(lines));
console.log(part2(lines2));
