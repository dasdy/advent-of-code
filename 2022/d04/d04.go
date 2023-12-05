package main

import (
	aoc_common "advent-of-code/common"
	"fmt"
	"strconv"
	"strings"
)

func isContained(a Range, b Range) bool {
	return a.max >= b.max && a.min <= b.min
}

func isOverlapping(a Range, b Range) bool {
	return a.max >= b.min && a.min <= b.max
}

type Range struct {
	min int
	max int
}

func hasOverlaps(lint string) bool {
	vals := strings.Split(lint, ",")
	ranges := make([]Range, 0)

	for _, r := range vals {
		limits := strings.Split(r, "-")
		rmin, _ := strconv.Atoi(limits[0])
		rmax, _ := strconv.Atoi(limits[1])
		ranges = append(ranges, Range{rmin, rmax})
	}

	// Part 1
	// return isContained(ranges[0], ranges[1]) || isContained(ranges[1], ranges[0])
	// Part 2
	return isOverlapping(ranges[0], ranges[1])
}

func countOverlaps(lines []string) int {
	res := 0
	for _, line := range lines {
		if hasOverlaps(line) {
			res += 1
		} else {
		}
	}
	return res
}

func main() {
	lines, err := aoc_common.LinesFromFile("./input")
	if err != nil {
		panic("No input file")
	}

	fmt.Println("OverlappingRows: ", countOverlaps(lines))
}
