package main

import (
	aoc_common "advent-of-code/common"
	"fmt"
	"strings"
)

func linesToInts(lines []string) [][]int {
	res := make([][]int, len(lines))

	for i, line := range lines {
		res[i] = make([]int, len(line))

		for j, c := range line {
			charAsInt := int(c - '0')
			res[i][j] = charAsInt
		}
	}

	return res
}

func visibilityMap(visibilities [][]bool) string {
	res := strings.Builder{}
	for _, row := range visibilities {
		for _, c := range row {
			if c {
				res.WriteRune('X')
			} else {
				res.WriteRune('.')
			}
		}
		res.WriteString("\n")
	}
	return res.String()
}

// PART 1
func countVisibleTrees(lines []string) int {
	asInts := linesToInts(lines)

	visibleFromLeft := leftVisibilityMap(asInts)
	// fmt.Printf("Left:\n%s\n", visibilityMap(visibleFromLeft))
	visibleFromRight := rightVisibilityMap(asInts)
	// fmt.Printf("Right:\n%s\n", visibilityMap(visibleFromRight))
	visibleFromUp := upVisibilityMap(asInts)
	// fmt.Printf("Up:\n%s\n", visibilityMap(visibleFromUp))
	visibleFromDown := downVisibilityMap(asInts)
	// fmt.Printf("Down:\n%s\n", visibilityMap(visibleFromDown))

	return combineVisibilityMaps(visibleFromDown, visibleFromUp, visibleFromLeft, visibleFromRight)
}

func combineVisibilityMaps(visibleFromDown [][]bool, visibleFromUp [][]bool, visibleFromLeft [][]bool, visibleFromRight [][]bool) int {
	res := 0
	for i, row := range visibleFromDown {
		for j, cell := range row {
			if !cell || !visibleFromUp[i][j] || !visibleFromLeft[i][j] || !visibleFromRight[i][j] {
				res++
			}
		}
	}
	return res
}

func downVisibilityMap(asInts [][]int) [][]bool {
	res := make([][]bool, len(asInts))

	for i, line := range asInts {
		res[i] = make([]bool, len(line))
	}

	rows, cols := len(asInts), len(asInts[0])
	for col := 0; col < cols; col++ {
		currentHeight := asInts[rows-1][col]

		for row := rows - 2; row >= 0; row-- {
			cellHeight := asInts[row][col]
			if currentHeight >= cellHeight {
				res[row][col] = true
			} else {
				currentHeight = cellHeight
			}
		}
	}

	return res
}

func upVisibilityMap(asInts [][]int) [][]bool {
	res := make([][]bool, len(asInts))
	rows, cols := len(asInts), len(asInts[0])

	for i, line := range asInts {
		res[i] = make([]bool, len(line))
	}

	for col := 0; col < cols; col++ {
		currentHeight := asInts[0][col]

		for row := 1; row < rows; row++ {
			cellHeight := asInts[row][col]
			if currentHeight >= cellHeight {
				res[row][col] = true
			} else {
				currentHeight = cellHeight
			}
		}
	}

	return res
}

func rightVisibilityMap(asInts [][]int) [][]bool {
	res := make([][]bool, len(asInts))

	for i, line := range asInts {
		res[i] = make([]bool, len(line))
	}

	rows, cols := len(asInts), len(asInts[0])
	for row := 0; row < rows; row++ {
		currentHeight := asInts[row][cols-1]

		for col := cols - 2; col >= 0; col-- {
			cellHeight := asInts[row][col]
			if currentHeight >= cellHeight {
				res[row][col] = true
			} else {
				currentHeight = cellHeight
			}
		}
	}

	return res
}

func leftVisibilityMap(asInts [][]int) [][]bool {
	res := make([][]bool, len(asInts))

	for i, line := range asInts {
		res[i] = make([]bool, len(line))
	}

	rows, cols := len(asInts), len(asInts[0])
	for row := 0; row < rows; row++ {
		currentHeight := asInts[row][0]

		for col := 1; col < cols; col++ {
			cellHeight := asInts[row][col]
			if currentHeight >= cellHeight {
				res[row][col] = true
			} else {
				currentHeight = cellHeight
			}
		}
	}

	return res
}

// PART 2

func calcScenicScore(visibleFromDown [][]int, visibleFromUp [][]int, visibleFromLeft [][]int, visibleFromRight [][]int) int {
	res := 0
	for i, row := range visibleFromDown {
		for j, cell := range row {
			cellScore := cell * visibleFromUp[i][j] * visibleFromRight[i][j] * visibleFromLeft[i][j]

			if cellScore > res {
				res = cellScore
			}
		}
	}
	return res
}

func findBestScenicScore(lines []string) int {
	asInts := linesToInts(lines)

	visibleFromLeft := leftVisibilityCounts(asInts)
	// fmt.Printf("left: %+v\n", visibleFromLeft)
	visibleFromRight := rightVisibilityCounts(asInts)
	// fmt.Printf("right: %+v\n", visibleFromRight)
	visibleFromUp := upVisibilityCounts(asInts)
	// fmt.Printf("up: %+v\n", visibleFromUp)
	visibleFromDown := downVisibilityCounts(asInts)
	// fmt.Printf("down: %+v\n", visibleFromDown)

	return calcScenicScore(visibleFromDown, visibleFromUp, visibleFromLeft, visibleFromRight)
}

func downVisibilityCounts(asInts [][]int) [][]int {
	res := make([][]int, len(asInts))

	for i, line := range asInts {
		res[i] = make([]int, len(line))
	}

	rows, cols := len(asInts), len(asInts[0])
	for col := 0; col < cols; col++ {
		for row := 0; row < rows; row++ {
			offsetIx, visible := row-1, 0
			cellHeight := asInts[row][col]
			for offsetIx >= 0 {

				visible++
				if asInts[offsetIx][col] >= cellHeight {
					break
				}
				offsetIx--

			}
			res[row][col] = visible
		}
	}

	return res
}

func upVisibilityCounts(asInts [][]int) [][]int {
	res := make([][]int, len(asInts))

	for i, line := range asInts {
		res[i] = make([]int, len(line))
	}

	rows, cols := len(asInts), len(asInts[0])
	for col := 0; col < cols; col++ {
		for row := 0; row < rows; row++ {
			offsetIx, visible := row+1, 0
			cellHeight := asInts[row][col]
			for offsetIx < rows {

				visible++
				if asInts[offsetIx][col] >= cellHeight {
					break
				}
				offsetIx++

			}
			res[row][col] = visible
		}
	}

	return res
}

func rightVisibilityCounts(asInts [][]int) [][]int {
	res := make([][]int, len(asInts))

	for i, line := range asInts {
		res[i] = make([]int, len(line))
	}

	rows, cols := len(asInts), len(asInts[0])
	for col := 0; col < cols; col++ {
		for row := 0; row < rows; row++ {
			offsetIx, visible := col-1, 0
			cellHeight := asInts[row][col]
			for offsetIx >= 0 {

				visible++
				if asInts[row][offsetIx] >= cellHeight {
					break
				}
				offsetIx--

			}
			res[row][col] = visible
		}
	}

	return res

}

func leftVisibilityCounts(asInts [][]int) [][]int {
	res := make([][]int, len(asInts))

	for i, line := range asInts {
		res[i] = make([]int, len(line))
	}

	rows, cols := len(asInts), len(asInts[0])
	for col := 0; col < cols; col++ {
		for row := 0; row < rows; row++ {
			offsetIx, visible := col+1, 0
			cellHeight := asInts[row][col]
			for offsetIx < cols {

				visible++
				if asInts[row][offsetIx] >= cellHeight {
					break
				}
				offsetIx++

			}
			res[row][col] = visible
		}
	}

	return res
}

func main() {
	lines, err := aoc_common.LinesFromFile("./input")
	if err != nil {
		panic("No input file")
	}

	fmt.Println("Visible for test input", countVisibleTrees([]string{
		"30373",
		"25512",
		"65332",
		"33549",
		"35390",
	}))

	fmt.Println("Scenic score: ", findBestScenicScore([]string{
		"30373",
		"25512",
		"65332",
		"33549",
		"35390",
	}))
	fmt.Println("Visible trees for input", countVisibleTrees(lines))
	fmt.Println("Scenic score for input", findBestScenicScore(lines))

}
