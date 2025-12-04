
import numpy as np
from scipy.signal import convolve2d

def parse_grid(text: str) -> np.ndarray:
    lines = [line.strip() for line in text.strip().splitlines() if line.strip()]
    arr = np.array([[c == '@' for c in line] for line in lines], dtype=bool)
    return arr

def count_neighbors(arr: np.ndarray) -> np.ndarray:
    kernel = np.array([[1, 1, 1],
                       [1, 0, 1],
                       [1, 1, 1]], dtype=np.int64)
    a = arr.astype(np.int64)

    counts = convolve2d(
        a, kernel,
        mode='same',
        boundary='fill',
        fillvalue=0
    )

    return counts

def part1(grid):
    counts = count_neighbors(grid)
    to_remove = grid & (counts < 4)
    print(np.sum(to_remove))


def part2(grid):
    total = 0
    removed = True
    i = 0
    while removed:
        removed = False
        i += 1
        counts = count_neighbors(grid)

        to_remove = grid & (counts < 4)
        print(f"at iteration {i} ({total} total)")
        found = np.sum(to_remove)
        total += found
        if found > 0:
            removed = True
        grid[to_remove] = False
    print(total)



if __name__ == "__main__":
    with open('input_full', 'r')as f:
    # with open('input_sample', 'r')as f:
        text = f.read()
    grid = parse_grid(text)
    print(grid.shape)

    part1(grid)
    part2(grid)
