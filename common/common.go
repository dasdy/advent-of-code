package aoc_common

import (
	"bufio"
	"encoding/json"
	"os"
	"strconv"
	"strings"
)

func LinesFromFile(p string) ([]string, error) {
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

func Pprint(v any) string {
	rangesStr, _ := json.MarshalIndent(v, "", "  ")

	return string(rangesStr)
}
func Pprint1(v any) string {
	rangesStr, _ := json.Marshal(v)

	return string(rangesStr)
}

func MinLst(vals []int) int {
	m := vals[0]
	for _, s := range vals[1:] {
		m = min(m, s)
	}

	return m
}

func IntList(line string) []int {
	items := strings.Split(line, " ")
	itemsInts := make([]int, 0, 3)
	for _, item := range items {
		v, _ := strconv.Atoi(item)
		itemsInts = append(itemsInts, v)
	}
	return itemsInts
}
