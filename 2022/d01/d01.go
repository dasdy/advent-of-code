package main

import (
	aoc_common "advent-of-code/common"
	"fmt"
	"log"
	"slices"
	"strconv"
)

func weights(lines []string) ([]int, error) {
	result := make([]int, 0)
	intermediateAcc := 0
	for _, line := range lines {
		lineInt, err := strconv.Atoi(line)
		if err != nil {
			result = append(result, intermediateAcc)
			intermediateAcc = 0
		} else {
			intermediateAcc += lineInt
		}

	}
	return result, nil
}

func topWeight(weights []int) int {
	return slices.Max(weights)
}

func topThree(weights []int) int {
	slices.Sort[[]int](weights)
	return weights[len(weights)-1] + weights[len(weights)-2] + weights[len(weights)-3]
}

func main() {
	lines, err := aoc_common.LinesFromFile("./input1.txt")
	if err != nil {
		log.Fatal(err)
	}
	actualWeights, err := weights(lines)
	if err != nil {
		log.Fatal(err)
	}
	fmt.Println(topWeight(actualWeights))
	fmt.Println(topThree(actualWeights))
}
