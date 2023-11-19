package main

import (
	"bufio"
	"fmt"
	"log"
	"os"
	"strconv"
	"strings"
)

func linesFromFile(p string) ([]string, error) {
	log.Println(os.Getwd())
	file, err := os.Open(p)
	if err != nil {
		return nil, err
	}
	defer file.Close()

	scanner := bufio.NewScanner(file)
	res := make([]string, 0)
	for scanner.Scan() {
		res = append(res, scanner.Text())
	}
	return res, nil
}

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
	lines, err := linesFromFile("./input")
	if err != nil {
		panic("No input file")
	}

	fmt.Println("OverlappingRows: ", countOverlaps(lines))
}
