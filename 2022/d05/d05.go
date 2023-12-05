package main

import (
	aoc_common "advent-of-code/common"
	"fmt"
	"strconv"
	"strings"
)

func stacksFromDesc(lines []string) [][]string {
	// find amount of stacks
	stackCount := 0
	stackDefLinesCount := 0
	for i, line := range lines {
		if line == "" {
			stackDefLinesCount = i
			items := strings.Split(lines[i-1], " ")
			for _, item := range items {
				if item != "" {
					stackCount += 1
				}
			}

			break
		}
	}
	stackDefLines := lines[0:stackDefLinesCount]
	stacks := make([][]string, stackCount)
	for i := range stacks {
		stacks[i] = make([]string, 0)
	}
	// Form stacks
	for i := len(stackDefLines) - 2; i >= 0; i-- {
		line := stackDefLines[i]
		stackItem := 0
		for stackItem < stackCount {
			if line[stackItem*4] == '[' {
				item := line[stackItem*4 : stackItem*4+3]
				stacks[stackItem] = append(stacks[stackItem], item)
			}

			stackItem += 1
		}
	}

	for i, stack := range stacks {
		fmt.Printf("Stack %d: %s\n", i, stack)
	}
	// parse commands
	commandList := lines[stackDefLinesCount+1:]
	for _, commandLine := range commandList {
		parts := strings.Split(commandLine, " ")
		count, _ := strconv.Atoi(parts[1])
		from, _ := strconv.Atoi(parts[3])
		to, _ := strconv.Atoi(parts[5])

		from--
		to--
		if from == to {
			continue
		}
		// Part 1
		// for c := 0; c < count; c++ {
		// 	fromStack := stacks[from]
		// 	pop := fromStack[len(fromStack)-1]
		// 	stacks[from] = fromStack[0 : len(fromStack)-1]
		// 	stacks[to] = append(stacks[to], pop)
		// }

		// Part 2
		fromStack := stacks[from]
		pop := fromStack[len(fromStack)-count:]

		stacks[from] = fromStack[0 : len(fromStack)-count]
		stacks[to] = append(stacks[to], pop...)

		fmt.Printf("Got command: %d, %d, %d\n", count, from, to)
	}

	// apply commands

	for i, stack := range stacks {
		fmt.Printf("Stack %d: %s\n", i, stack)
	}

	return nil
}

func main() {
	lines, err := aoc_common.LinesFromFile("./input")
	if err != nil {
		panic("No input file")
	}

	stacksFromDesc(lines)
}
