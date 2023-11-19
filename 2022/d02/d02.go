package main

import (
	"bufio"
	"fmt"
	"log"
	"os"
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

func pointsOneGame(round string) int {
	outcome := 0
	selfMoveWorth := 0
	oppMoveWorth := 0

	moves := strings.Fields(round)
	if len(moves) < 2 {
		return 0
	}

	oppMove, selfMove := moves[0], moves[1]
	// X - Rock, Y - Paper, Z - Csissors
	if selfMove == "X" {
		selfMoveWorth = 1
	} else if selfMove == "Y" {
		selfMoveWorth = 2
	} else if selfMove == "Z" {
		selfMoveWorth = 3
	} else {
		panic("unexpected thing")
	}

	// X - Rock, Y - Paper, Z - Csissors
	if oppMove == "A" {
		oppMoveWorth = 1
	} else if oppMove == "B" {
		oppMoveWorth = 2
	} else if oppMove == "C" {
		oppMoveWorth = 3
	} else {
		panic("unexpected thing")
	}

	if oppMoveWorth == selfMoveWorth {
		outcome = 3
	} else if oppMoveWorth < selfMoveWorth && !(oppMoveWorth == 1 && selfMoveWorth == 3) {
		outcome = 6
	} else if oppMoveWorth == 3 && selfMoveWorth == 1 {
		outcome = 6
	} else {
		outcome = 0
	}

	return outcome + selfMoveWorth
}

func pointsOneGamePt2(round string) int {
	outcome := 0
	selfMoveWorth := 0
	oppMoveWorth := 0

	moves := strings.Fields(round)
	if len(moves) < 2 {
		return 0
	}

	oppMove, selfMove := moves[0], moves[1]
	// X - lose, Y - draw, Z - win
	if selfMove == "X" {
		outcome = 0
	} else if selfMove == "Y" {
		outcome = 3
	} else if selfMove == "Z" {
		outcome = 6
	} else {
		panic("unexpected thing")
	}

	// X - Rock, Y - Paper, Z - Csissors
	if oppMove == "A" {
		oppMoveWorth = 1
	} else if oppMove == "B" {
		oppMoveWorth = 2
	} else if oppMove == "C" {
		oppMoveWorth = 3
	} else {
		panic("unexpected thing")
	}

	if selfMove == "Y" {
		selfMoveWorth = oppMoveWorth
	} else if selfMove == "X" {
		selfMoveWorth = oppMoveWorth - 1
		if selfMoveWorth == 0 {
			selfMoveWorth = 3
		}
	} else if selfMove == "Z" {
		selfMoveWorth = oppMoveWorth + 1
		if selfMoveWorth == 4 {
			selfMoveWorth = 1
		}
	} else {
		panic("unexpected thing 3")
	}

	return outcome + selfMoveWorth
}
func pointsPerSet(rounds []string) []int {
	res := 0
	res2 := 0
	for _, line := range rounds {
		res += pointsOneGame(line)
		res2 += pointsOneGamePt2(line)
	}
	return []int{res, res2}
}

func main() {
	fmt.Println("\n\nX")
	fmt.Println(pointsOneGame("A X"))
	fmt.Println(pointsOneGame("B X"))
	fmt.Println(pointsOneGame("C X"))

	fmt.Println("\n\nY")
	fmt.Println(pointsOneGame("A Y"))
	fmt.Println(pointsOneGame("B Y"))
	fmt.Println(pointsOneGame("C Y"))

	fmt.Println("\n\nZ")
	fmt.Println(pointsOneGame("A Z"))
	fmt.Println(pointsOneGame("B Z"))
	fmt.Println(pointsOneGame("C Z"))

	fmt.Println("\n\nX")
	fmt.Println(pointsOneGamePt2("A X"))
	fmt.Println(pointsOneGamePt2("B X"))
	fmt.Println(pointsOneGamePt2("C X"))

	fmt.Println("\n\nY")
	fmt.Println(pointsOneGamePt2("A Y"))
	fmt.Println(pointsOneGamePt2("B Y"))
	fmt.Println(pointsOneGamePt2("C Y"))

	fmt.Println("\n\nZ")
	fmt.Println(pointsOneGamePt2("A Z"))
	fmt.Println(pointsOneGamePt2("B Z"))
	fmt.Println(pointsOneGamePt2("C Z"))

	v, _ := linesFromFile("./input")
	fmt.Println(pointsPerSet(v))
}
