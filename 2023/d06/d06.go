package main

import "fmt"

type Race struct {
	time     int
	distance int
}

func waysToBeatRecord(race Race) int {

	ways := 0

	for i := 1; i < race.time; i++ {
		leftTime := race.time - i

		if i*leftTime >= race.distance {
			// if ways%1000 == 0 {
			// 	fmt.Printf("Beats: %d, %v; %.2f%%\n", i, race, 100*float32(i)/float32(race.time))
			// }
			ways++
		}
	}
	return ways
}

func collectSum(tasks []Race) int {
	res := 1
	for _, task := range tasks {

		res *= waysToBeatRecord(task)
	}
	return res

}

func main() {
	exampleTask := []Race{
		{7, 9},
		{15, 40},
		{30, 200},
	}

	testTask := []Race{
		{40, 233},
		{82, 1011},
		{84, 1110},
		{92, 1487},
	}

	testTaskPt2 := []Race{
		{40828492, 233101111101487},
	}

	fmt.Println("Part0: ", collectSum(exampleTask))
	fmt.Println("Part1: ", collectSum(testTask))
	fmt.Println("Part2: ", collectSum(testTaskPt2))
}
