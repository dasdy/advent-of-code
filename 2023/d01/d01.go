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

func numIncludingWords(line string) int {
	result := 0
	r := strings.NewReplacer("one", "o1e", "two", "t2o", "three", "t3e", "four",
		"f4r", "five", "f5e", "six", "s6x", "seven", "s7n", "eight", "e8t", "nine", "n9e")
	line = r.Replace(r.Replace(line))
	result += 10 * int(line[strings.IndexAny(line, "123456789")]-'0')
	result += int(line[strings.LastIndexAny(line, "123456789")] - '0')
	return result
}

func numFromLine(line string) int {
	var firstDigit int
	for _, c := range line {
		if unicode.IsDigit(c) {
			firstDigit = int(c) - int('0')
			break
		}

	}

	var secondDigit int
	for i := len(line) - 1; i >= 0; i-- {
		c := line[i]
		if c >= byte('0') && c <= byte('9') {
			secondDigit = int(c) - int('0')
			break
		}
	}

	return firstDigit*10 + secondDigit

}

func sumAllLines(lines []string) int {
	res := 0

	for _, line := range lines {
		res += numIncludingWords(line)
		// res += numFromLine(line)
	}
	return res
}

func main() {
	lines, err := (linesFromFile("./input"))
	if err != nil {
		log.Fatal(err)
	}

	fmt.Println(len(lines))

	// fmt.Println(numFromLine("1abc2"))
	// fmt.Println(numFromLine("pqr3stu8vw"))
	// fmt.Println(numFromLine("a1b2c3d4e5f"))
	// fmt.Println(numFromLine("treb7uchet"))
	// fmt.Println(numIncludingWords("two1nine"))
	// fmt.Println(numIncludingWords("eightwothree"))
	// fmt.Println(numIncludingWords("abcone2threexyz"))
	// fmt.Println(numIncludingWords("xtwone3four"))
	// fmt.Println(numIncludingWords("4nineeightseven2"))
	// fmt.Println(numIncludingWords("zoneight234"))
	// fmt.Println(numIncludingWords("7pqrstsixteen"))
	// fmt.Println(numIncludingWords("1sevenine"))
	fmt.Println(sumAllLines(lines))
}
