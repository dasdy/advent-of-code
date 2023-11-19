package main

import (
	"bufio"
	"fmt"
	"log"
	"os"
	"strings"
	"unicode"
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

func charToPriority(k rune) int {
	lowerA := 'a'
	higherA := 'A'
	if unicode.IsLower(k) {
		return int(k) - int(lowerA) + 1
	} else {
		return int(k) - int(higherA) + 27

	}
}

func charCounts(line string) map[rune]int {
	result := make(map[rune]int)
	for _, c := range line {
		v := result[c]

		result[c] = v + 1
	}
	return result
}

func priority(line string) int {
	midpoint := len(line) / 2
	firstHalf, secondHalf := line[0:midpoint], line[midpoint:]

	firstMap, secondMap := charCounts(firstHalf), charCounts(secondHalf)

	for k := range firstMap {
		v2 := secondMap[k]
		if v2 != 0 {
			// fmt.Printf("Found this: %c(%d), %c\n", k, int(k), v2)
			return charToPriority(k)
		}

	}

	return 0
}

func oneGroupBadge(lines []string) int {
	resultSet := charCounts(lines[0])
	for _, line := range lines[1:] {

		charMap := charCounts(line)

		for k := range resultSet {
			if charMap[k] == 0 {
				delete(resultSet, k)
			}
		}
	}
	if len(resultSet) > 1 {
		fmt.Println("Got >1 badges", lines)
	}
	for k := range resultSet {
		return charToPriority(k)
	}
	fmt.Println("got lines:[", strings.Join(lines, ";"), "]")
	panic("Could not get a common char")
}

func prioritiesTotal(lines []string) int {
	res := 0
	for _, line := range lines {
		res += priority(line)
	}
	return res

}

func groupPrioritiesTotal(lines []string) int {
	res := 0
	for i := 0; i < len(lines); i += 3 {
		res += oneGroupBadge([]string{lines[i], lines[i+1], lines[i+2]})
	}
	return res
}

func main() {
	lines, err := linesFromFile("./input")
	if err != nil {
		panic("No input file")
	}

	fmt.Println("Total of priorities:", prioritiesTotal(lines))
	fmt.Println("Group badges sum:", groupPrioritiesTotal(lines))
}
