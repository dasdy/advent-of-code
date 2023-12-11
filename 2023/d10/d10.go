package main

import (
	aoc_common "advent-of-code/common"
	"fmt"
)

func nextPosition(fromI int, fromJ int, cellI int, cellJ int, cellVal byte) (bool, int, int) {
	if cellVal == '.' {
		return false, 0, 0
	}
	if cellVal == 'S' {
		return false, 0, 0
	}
	if cellVal == '|' {
		if fromI > cellI && fromJ == cellJ {
			return true, cellI - 1, cellJ
		}
		if fromI < cellI && fromJ == cellJ {
			return true, cellI + 1, cellJ
		}

	}
	if cellVal == '-' {
		if fromJ > cellJ && fromI == cellI {
			return true, cellI, cellJ - 1
		}
		if fromJ < cellJ && fromI == cellI {
			return true, cellI, cellJ + 1
		}

	}
	if cellVal == 'L' {
		// NORTH and EAST (12 to 3)

		// 3 -> 12
		if fromI == cellI && fromJ > cellJ {
			return true, cellI - 1, cellJ
		}

		// 12 -> 3
		if fromI < cellI && fromJ == cellJ {
			return true, cellI, cellJ + 1
		}

	}
	if cellVal == 'J' {
		// NORTH and WEST (12 to 9)

		// 9 -> 12
		if fromI == cellI && fromJ < cellJ {
			return true, cellI - 1, cellJ
		}

		// 12 -> 9
		if fromI < cellI && fromJ == cellJ {
			return true, cellI, cellJ - 1
		}

	}
	if cellVal == '7' {
		// SOUTH and WEST (6-9)

		// 9 -> 6
		if fromI == cellI && fromJ < cellJ {
			return true, cellI + 1, cellJ
		}

		// 6 -> 9
		if fromI > cellI && fromJ == cellJ {
			return true, cellI, cellJ - 1
		}

	}
	if cellVal == 'F' {
		// SOUTH and EAST (6-3)

		// 3 -> 6
		if fromI == cellI && fromJ > cellJ {
			return true, cellI + 1, cellJ
		}

		// 6 -> 3
		if fromI > cellI && fromJ == cellJ {
			return true, cellI, cellJ + 1
		}

	}

	fmt.Printf("Unknown technology bleat. from: (%d,%d), charat (%c), (%d,%d)\n", fromI, fromJ, cellVal, cellI, cellJ)
	return false, 0, 0
}

type Position struct {
	I int `json:"i"`
	J int `json:"j"`
}

type PosPair struct {
	From   Position
	To     Position
	Length int
}

func furthestDistance(lines []string) int {
	var startI, startJ int

	iMAX := len(lines)
	jMAX := len(lines[0])
	for i, line := range lines {
		for j, r := range line {
			if r == 'S' {
				startI = i
				startJ = j
				break
			}
		}
	}
	fmt.Printf("Start: %d,%d\n", startI, startJ)

	startPosition := Position{startI, startJ}
	positions := []PosPair{
		{startPosition, Position{startI - 1, startJ}, 1},
		{startPosition, Position{startI + 1, startJ}, 1},
		{startPosition, Position{startI, startJ - 1}, 1},
		{startPosition, Position{startI, startJ + 1}, 1},
	}

	seen := make(map[Position]int)

	for len(positions) > 0 {

		fmt.Println("====================")
		curPosition := positions[0]

		if _, ok := seen[curPosition.To]; ok == true {
			fmt.Printf("Found! %v\n", curPosition.To)

			fmt.Printf("Map of seen: { \n")
			for k, v := range seen {
				fmt.Printf("%s -> %d\n", aoc_common.Pprint1(k), v)
			}

			fmt.Println("}")
			return curPosition.Length
		}

		positions = positions[1:]
		if curPosition.To.I < 0 || curPosition.To.J < 0 || curPosition.To.J >= iMAX || curPosition.To.J >= jMAX {
			continue
		}
		char := lines[curPosition.To.I][curPosition.To.J]
		fmt.Printf("Looking at: %v(%c); stack: %s\n", curPosition, char, aoc_common.Pprint1(positions))
		ok, nextI, nextJ := nextPosition(curPosition.From.I, curPosition.From.J, curPosition.To.I, curPosition.To.J, char)

		if !ok {
			continue
		}

		seen[curPosition.To] = curPosition.Length
		fmt.Printf("New position. From: %v, char: %c, next: (%d,%d)\n", curPosition, char, nextI, nextJ)
		positions = append(positions, PosPair{curPosition.To, Position{nextI, nextJ}, curPosition.Length + 1})
	}

	return 0
}

func main() {
	// inputLines, err := aoc_common.LinesFromFile("test1")
	// inputLines, err := aoc_common.LinesFromFile("test2")
	// inputLines, err := aoc_common.LinesFromFile("test3")
	inputLines, err := aoc_common.LinesFromFile("input")
	if err != nil {
		panic("Could not find input file")
	}

	fmt.Printf("Furthest distance: %d\n", furthestDistance(inputLines))
}
