package main

import (
	aoc_common "advent-of-code/common"
	"fmt"
	"log"
	"regexp"
	"strconv"
	"strings"
)

func oneLine(line string) int {
	re := regexp.MustCompile(`Game (\d+): (.+)`)
	matches := re.FindStringSubmatch(line)
	rest := matches[2]
	subGames := strings.Split(rest, ";")

	colorsSeen := make(map[string]int, 0)
	for _, part := range subGames {
		parts := strings.Split(strings.TrimSpace(part), ",")
		for _, p := range parts {
			p = strings.TrimSpace(p)
			var amtStr, color string
			fmt.Sscanf(p, "%s %s", &amtStr, &color)

			amt, _ := strconv.Atoi(amtStr)

			amtCur := colorsSeen[color]
			if amt > amtCur {
				colorsSeen[color] = amt
			}
		}
	}
	// Part 1
	// if colorsSeen["red"] <= 12 && colorsSeen["green"] <= 13 && colorsSeen["blue"] <= 14 {
	// gameIndex, _ := strconv.Atoi(matches[1])
	// 	return gameIndex
	// }
	//
	// return 0
	// Part 2
	return colorsSeen["red"] * colorsSeen["green"] * colorsSeen["blue"]
}

func sumAllLines(lines []string) int {
	res := 0

	for _, line := range lines {
		res += oneLine(line)
	}
	return res
}

func main() {
	lines, err := aoc_common.LinesFromFile("./input")
	if err != nil {
		log.Fatal(err)
	}

	fmt.Println(len(lines))
	fmt.Println(oneLine("Game 1: 3 blue, 4 red; 1 red, 2 green, 6 blue; 2 green"))
	fmt.Println(oneLine("Game 2: 1 blue, 2 green; 3 green, 4 blue, 1 red; 1 green, 1 blue"))
	fmt.Println(oneLine("Game 3: 8 green, 6 blue, 20 red; 5 blue, 4 red, 13 green; 5 green, 1 red"))
	fmt.Println(oneLine("Game 4: 1 green, 3 red, 6 blue; 3 green, 6 red; 3 green, 15 blue, 14 red"))
	fmt.Println(oneLine("Game 5: 6 red, 1 blue, 3 green; 2 blue, 1 red, 2 green"))
	fmt.Println("Part 1 is: ", sumAllLines(lines))
}
