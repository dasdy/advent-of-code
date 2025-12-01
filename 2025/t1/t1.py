with open('inp_full.txt', 'r') as f:
# with open('inp_base.txt', 'r') as f:
    lines = f.readlines()

def part1(lines):
    start = 50
    zeros = 0
    for l in lines:
        mult = 1
        if l[0] == 'L':
            mult = -1
        smth = int(l[1:]) % 100
        start += mult * smth
        # print(f'{prev} + {l.strip()} = {start}', end='')
        if start < 0:
            start = 100 + start
        elif start > 99:
            start = start - 100

        if start == 0:
            zeros += 1
        # print(f'({start}); zeros: {zeros}')

    print(zeros)

def part2(lines):
    start = 50
    zeros = 0
    for l in lines:
        mult = 1
        if l[0] == 'L':
            mult = -1
        prev = start
        clicks = int(l[1:])
        zeros += clicks // 100
        smth =  clicks % 100

        start += mult * smth
        # print(f'{prev} + {l.strip()} = {start}', end='')

        if prev != 0 and (start <= 0 or start > 99):
            zeros += 1
        if start < 0:
            start = 100 + start
        elif start > 99:
            start = start - 100
        # print(f'({start}); zeros: {zeros}')
        # if clicks > 100:
            # print(f"+ {clicks // 100} rotations")

    print(zeros)

part1(lines)
part2(lines)
