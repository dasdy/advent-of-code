package main

import (
	aoc_common "advent-of-code/common"
	"fmt"
	"path"
	"strconv"
	"strings"
)

type File struct {
	name string
	size int
}

type Tree struct {
	fullPath string
	files    []File
	subdirs  []*Tree
	parent   *Tree
	dirSize  int
}

func (t *Tree) size() int {
	dirSize := t.dirSize

	for _, subdir := range t.subdirs {
		dirSize += subdir.size()
	}
	return dirSize
}

func processCommand(line string, currentTree *Tree) *Tree {
	if line == "$ cd .." {
		return currentTree.parent
	}

	if line == "$ ls" {
		return currentTree
	}

	// strip "$ cd " prefix
	dirname := line[5:]
	// fullPath := fmt.Sprintf("%s/%s", currentTree.fullPath, dirname)
	fullPath := path.Join(currentTree.fullPath, dirname)
	for _, subdir := range currentTree.subdirs {
		if subdir.fullPath == fullPath {
			return subdir
		}
	}
	newSubtree := &Tree{fullPath, make([]File, 0), make([]*Tree, 0), currentTree, 0}

	// add the new directory to currentTree
	currentTree.subdirs = append(currentTree.subdirs, newSubtree)
	return newSubtree
}

func executeCommand(line string, currentTree *Tree) *Tree {
	if line[0] == '$' {
		// fmt.Printf("Found command: %s\n", line)
		return processCommand(line, currentTree)
	}

	// fmt.Println("Processing non-command: ", line)
	// ignore directories, we track them separately
	if len(line) >= 3 && line[:3] == "dir" {
		return currentTree
	}

	// This is a file!
	parts := strings.Split(line, " ")
	size, err := strconv.Atoi(parts[0])
	if err != nil {
		fmt.Printf("Size error at '%s': %s", parts[0], err)
	}

	for _, file := range currentTree.files {
		if file.name == parts[1] {
			return currentTree
		}
	}
	currentTree.files = append(currentTree.files, File{parts[1], size})
	currentTree.dirSize += size

	return currentTree
}

func findSmallDirectories(lines []string) int {
	// Part 1
	// smallEnough := 100000
	// smallDirsWeight := 0

	initTree := Tree{"/", make([]File, 0), make([]*Tree, 0), nil, 0}
	curTree := &initTree
	for _, line := range lines {
		curTree = executeCommand(line, curTree)
		// fmt.Printf("curTree :%s, %d, %+v\n", curTree.fullPath, curTree.dirSize, curTree.files)
	}

	stack := []*Tree{&initTree}

	resultingSizes := make([]int, 0, 20)
	totalSize := initTree.size()
	atLeast := 30000000 - (70000000 - totalSize)
	// fmt.Println("TotalSize: ", totalSize, "AtLeast: ", atLeast)
	currentTargetSize := totalSize
	for len(stack) > 0 {
		pop := stack[0]
		stack = stack[1:]
		stack = append(stack, pop.subdirs...)

		actualSize := pop.size()
		// fmt.Printf("Size of dir %s: %d\n", pop.fullPath, actualSize)
		// Part 1
		// if actualSize < smallEnough {
		// 	smallDirsWeight += actualSize
		// }

		// Part 2
		if actualSize >= atLeast {
			resultingSizes = append(resultingSizes, actualSize)
		}
		if actualSize >= atLeast && currentTargetSize > actualSize {
			currentTargetSize = actualSize
		}
	}

	// return smallDirsWeight
	return currentTargetSize
}

func main() {
	lines, err := aoc_common.LinesFromFile("./input")
	if err != nil {
		panic("No input file")
	}

	// initTree := Tree{"/", make([]File, 0), make([]*Tree, 0), nil, 0}
	//
	// newTree := executeCommand("$ cd somedir", &initTree)
	//
	// executeCommand("100 somef", newTree)
	// executeCommand("200 otherf", &initTree)
	// fmt.Printf("newTree :%s, %d, %+v\n", newTree.fullPath, newTree.dirSize, newTree.files)
	// fmt.Printf("root :%s, %d, %+v\n", initTree.fullPath, initTree.dirSize, initTree.files)
	// fmt.Printf("Total size of small dirs: %d\n", findSmallDirectories(lines))
	fmt.Printf("Size of directory to delete for update to fit: %d\n", findSmallDirectories(lines))
}
