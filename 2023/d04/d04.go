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

func countScore(line string) int {
	matches := winCards(line)
	if matches == 0 {
		return 0
	}
	score := 1
	for i := 1; i < matches; i++ {
		score *= 2
	}
	return score
}

func winCards(line string) int {
	// "Card 1: 41 48 83 86 17 | 83 86  6 31 17  9 48 53"
	winStr, myStr, found := strings.Cut(strings.Split(line, ":")[1], "|")
	if !found {
		panic(fmt.Sprintf("Could not parse line '%s'", line))
	}

	winNumbers := make(map[int]bool)
	for _, winDigit := range strings.Split(winStr, " ") {
		asInt, err := strconv.Atoi(winDigit)
		if err != nil {
			continue
		}
		winNumbers[asInt] = true
	}

	matches := make(map[int]bool)
	for _, winDigit := range strings.Split(myStr, " ") {
		asInt, err := strconv.Atoi(winDigit)
		if err != nil {
			continue
		}

		if winNumbers[asInt] {
			matches[asInt] = true
		}
	}

	return len(matches)
}

func sumAllLines(lines []string) int {
	res := 0

	for _, line := range lines {
		res += countScore(line)
	}
	return res
}

func countWinCards(lines []string) int {
	cardCount := make(map[int]int)

	for ix, line := range lines {
		gameId := ix + 1
		cardCount[gameId]++
		cards := cardCount[gameId]

		newCards := winCards(line)
		for c := 0; c < newCards; c++ {
			cardCount[c+gameId+1] += cards
		}
	}

	// v, _ := json.Marshal(cardCount)
	// fmt.Printf("%s\n", v)

	res := 0

	for _, v := range cardCount {
		res += v
	}

	return res
}
func main() {
	lines, err := (linesFromFile("./input"))
	if err != nil {
		log.Fatal(err)
	}

	// fmt.Println(1, countScore("Card 1: 41 48 83 86 17 | 83 86  6 31 17  9 48 53"))
	// fmt.Println(2, countScore("Card 2: 13 32 20 16 61 | 61 30 68 82 17 32 24 19"))
	// fmt.Println(3, countScore("Card 3:  1 21 53 59 44 | 69 82 63 72 16 21 14  1"))
	// fmt.Println(4, countScore("Card 4: 41 92 73 84 69 | 59 84 76 51 58  5 54 83"))
	// fmt.Println(5, countScore("Card 5: 87 83 26 28 32 | 88 30 70 12 93 22 82 36"))
	// fmt.Println(6, countScore("Card 6: 31 18 13 56 72 | 74 77 10 23 35 67 36 11"))
	fmt.Println("part1", sumAllLines(lines))
	// fmt.Println(1, winCards("Card 1: 41 48 83 86 17 | 83 86  6 31 17  9 48 53"))
	// fmt.Println(2, winCards("Card 2: 13 32 20 16 61 | 61 30 68 82 17 32 24 19"))
	// fmt.Println(3, winCards("Card 3:  1 21 53 59 44 | 69 82 63 72 16 21 14  1"))
	// fmt.Println(4, winCards("Card 4: 41 92 73 84 69 | 59 84 76 51 58  5 54 83"))
	// fmt.Println(5, winCards("Card 5: 87 83 26 28 32 | 88 30 70 12 93 22 82 36"))
	// fmt.Println(6, winCards("Card 6: 31 18 13 56 72 | 74 77 10 23 35 67 36 11"))
	// fmt.Println("example: ", countWinCards([]string{
	// 	("Card 1: 41 48 83 86 17 | 83 86  6 31 17  9 48 53"),
	// 	("Card 2: 13 32 20 16 61 | 61 30 68 82 17 32 24 19"),
	// 	("Card 3:  1 21 53 59 44 | 69 82 63 72 16 21 14  1"),
	// 	("Card 4: 41 92 73 84 69 | 59 84 76 51 58  5 54 83"),
	// 	("Card 5: 87 83 26 28 32 | 88 30 70 12 93 22 82 36"),
	// 	("Card 6: 31 18 13 56 72 | 74 77 10 23 35 67 36 11"),
	// }))

	fmt.Println("part2", countWinCards(lines))
}
