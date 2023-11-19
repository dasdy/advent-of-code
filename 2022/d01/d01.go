package main

import (
	"bufio"
	"fmt"
	"log"
	"os"
	"slices"
	"strconv"
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
	lines, err := (linesFromFile("./input1.txt"))
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
