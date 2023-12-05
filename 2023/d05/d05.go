package main

import (
	"advent-of-code/common"
	"fmt"
	"log"
	"os"
	"strings"
)

type Range struct {
	From        string
	Into        string
	DestStart   int
	SourceStart int
	Size        int
}

type RangeMap map[string][]Range
type Ranges map[string]RangeMap

type SeedRange struct {
	Start int
	Size  int
}

func parseRange(body string) (string, string, []Range) {
	lines := strings.Split(body, "\n")
	from, to, found := strings.Cut(lines[0], "-to-")
	to = strings.TrimSuffix(to, " map:")
	if !found {
		panic(fmt.Sprintf("Could not find in %s", lines[0]))
	}
	res := make([]Range, 0, len(lines))

	for _, line := range lines[1:] {
		if line == "" {
			continue
		}

		itemsInts := aoc_common.IntList(line)
		// fmt.Printf("Line: '%s', items: %v\n", line, items)
		res = append(res, Range{from, to, itemsInts[0], itemsInts[1], itemsInts[2]})
	}

	// fmt.Printf("Parsed ranges: %v\n", res)
	return from, to, res
}

func parseFileInput(body string) ([]int, Ranges) {
	items := strings.Split(body, "\n\n")
	seeds := strings.TrimPrefix(items[0], "seeds: ")
	seedsList := aoc_common.IntList(seeds)

	ranges := make(Ranges)
	for _, item := range items[1:] {
		from, to, subr := parseRange(item)

		fromRange := ranges[from]
		if fromRange == nil {
			fromRange = make(RangeMap)
			ranges[from] = fromRange
		}

		fromRange[to] = subr
	}

	// fmt.Printf("Parsed all ranges: %s\n", pprint(ranges))

	return seedsList, ranges
}

func part1(iseeds []int, ranges Ranges) int {
	stage := "seed"

	seeds := make([]int, len(iseeds))
	copy(seeds, iseeds)
	for stage != "location" {

		// fmt.Printf("Stage: %s, ranges: %v\n", stage, seeds)
		var nextStage string
		var rangesList []Range
		for k, v := range ranges[stage] {
			nextStage = k
			rangesList = v
			break
		}

		for i, seed := range seeds {
			for _, rng := range rangesList {

				if seed >= rng.SourceStart && seed < rng.SourceStart+rng.Size {
					seeds[i] = rng.DestStart + (seed - rng.SourceStart)
					// fmt.Printf("Found mapping: %d->%d in range %q\n", seed, seeds[i], rng)
					break
				}
			}

		}

		stage = nextStage

	}

	// fmt.Printf("Final places: %v\n", seeds)
	// minimum spot
	return aoc_common.MinLst(seeds)
}

func intersect(amin int, asize int, bmin int, bsize int) *SeedRange {
	amax, bmax := amin+asize, bmin+bsize
	// fmt.Printf("1: %d, %d, %d  <------>  %d, %d, %d\n", amin, asize, amax, bmin, bsize, bmax)
	if amax < bmin || amin > bmax {
		return nil
	}
	newmin := max(amin, bmin)

	newsize := max(min(amax, bmax)-newmin, 0)
	// fmt.Printf("2: newmin: %d, newsize: %d\n", newmin, newsize)
	if newsize == 0 {
		return nil
	}
	// fmt.Printf("3\n")
	return &SeedRange{newmin, newsize}
}

func diff(a SeedRange, b SeedRange) []SeedRange {
	res := make([]SeedRange, 0)

	amax, bmax := a.Start+a.Size, b.Start+b.Size
	bOffset := b.Start - a.Start

	if a.Start == b.Start && a.Size == b.Size {
		return res
	}

	if a.Start < b.Start {
		res = append(res, SeedRange{a.Start, bOffset})
	}

	if bmax < amax {
		res = append(res, SeedRange{bmax, amax - bmax})
	}

	// fmt.Printf("%s - %s = %s", pprint1(a), pprint1(b), pprint1(res))
	return res
}

func part2(seeds []int, ranges Ranges) int {
	stage := "seed"

	seedRanges := make([]SeedRange, 0)

	for i := 0; i < len(seeds); i += 2 {
		seedRanges = append(seedRanges, SeedRange{seeds[i], seeds[i+1]})
	}

	for stage != "location" {

		// fmt.Printf("Stage: %s, seeds: %v\n", stage, seedRanges)
		var nextStage string
		var rangesList []Range
		for k, v := range ranges[stage] {
			nextStage = k
			rangesList = v
			break
		}

		newSeedRanges := make([]SeedRange, 0)

		for len(seedRanges) > 0 {
			seed := seedRanges[0]
			seedRanges = seedRanges[1:]

			rangeFound := false
			for _, rng := range rangesList {
				intersection := intersect(seed.Start, seed.Size, rng.SourceStart, rng.Size)
				if intersection != nil {
					newSeed := SeedRange{rng.DestStart + (intersection.Start - rng.SourceStart), intersection.Size}
					// fmt.Printf("Found mapping: %s->%s in range %s. New range: %s\n", pprint1(seed), pprint1(*intersection), pprint1(rng), pprint1(newSeed))
					newSeedRanges = append(newSeedRanges, newSeed)

					subSeeds := diff(seed, *intersection)
					// fmt.Printf("Subranges: %v\n", subSeeds)
					seedRanges = append(seedRanges, subSeeds...)

					rangeFound = true
				}
			}

			if !rangeFound {
				// fmt.Printf("Mapping not found: %s. Mapping to self", pprint1(seed))
				newSeedRanges = append(newSeedRanges, seed)
			}

		}

		// fmt.Printf("Moving to stage %s, ranges: %s\n", stage, pprint(newSeedRanges))
		seedRanges = newSeedRanges
		stage = nextStage
	}

	// fmt.Printf("Final places: %v\n", seedRanges)
	// minimum spot
	m := seedRanges[0].Start
	for _, s := range seedRanges[1:] {
		m = min(m, s.Start)
	}
	return m
}

func main() {
	content, err := os.ReadFile("./input")
	// content, err := os.ReadFile("./test")
	if err != nil {
		log.Fatal(err)
	}

	seeds, ranges := parseFileInput(string(content))
	fmt.Println("part1 ", part1(seeds, ranges))
	fmt.Println("part2 ", part2(seeds, ranges))
}
