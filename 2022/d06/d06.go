package main

import (
	aoc_common "advent-of-code/common"
	"fmt"
)

func firstSignal(p string) int {
	// Part 1
	// headerLen := 4
	// Part 2
	headerLen := 14
	for i := 0; i < len(p)-headerLen; i++ {
		// arrays are fast enough here
		occuredChars := make([]byte, 0, headerLen)

		foundDup := false
		for j := 0; !foundDup && j < headerLen; j++ {
			c := p[i+j]

			// just check if we have seen the value before
			for _, c2 := range occuredChars {
				if c == c2 {
					foundDup = true
					break
				}
			}
			// else remember the char
			if !foundDup {
				occuredChars = append(occuredChars, c)
			}
		}
		if !foundDup {
			return i + headerLen

		}
	}
	return 0
}

func main() {
	lines, err := aoc_common.LinesFromFile("./input")
	if err != nil {
		panic("No input file")
	}

	fmt.Println("1", firstSignal("mjqjpqmgbljsphdztnvjfqwrcgsmlb"))
	fmt.Println("2", firstSignal("bvwbjplbgvbhsrlpgdmjqwftvncz"))
	fmt.Println("3", firstSignal("nppdvjthqldpwncqszvftbrmjlhg"))
	fmt.Println("4", firstSignal("nznrnfrfntjfmvfwmzdfjlvtqnbhcprsg"))
	fmt.Println("5", firstSignal("zcfzfwzzqfrljwzlrfnpqdbhtmscgvjw"))
	fmt.Println("6", firstSignal(lines[0]))
}
