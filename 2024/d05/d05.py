from collections import defaultdict

# with open('input_base')as f:
with open("input_full") as f:
    lines = f.readlines()

orders = []

good_combos = defaultdict(list)
bad_combos = defaultdict(list)
for line in lines:
    if "|" in line:
        a, b = line.split("|")
        a, b = int(a), int(b.strip())
        good_combos[a].append(b)
        bad_combos[b].append(a)

    elif len(line.strip()) > 0:
        orders.append([int(x) for x in line.strip().split(",")])


def ix(lst: list, i, item):
    try:
        return lst.index(item, 0, i + 1)
    except ValueError:
        return -1


def to_swap_ix(graph, item, seen_lst, j):
    for banned_preceding in graph[item]:
        if (bad_j := ix(seen_lst, j, banned_preceding)) >= 0:
            return bad_j

    return None


def fix_order(graph, order):
    made_swap = True
    swaps_made = 0

    # Page ordering rules do not have any loops => they can be ordered by something
    # like a bubble sort: For each number i, look at numbers j to the left
    # and if rule i|j exists, swap those items.

    while made_swap:
        made_swap = False
        for j in range(len(order)):
            item = order[j]
            if item not in graph:
                continue

            new_ix = to_swap_ix(graph, item, order, j)
            if new_ix is not None:
                order[j], order[new_ix] = order[new_ix], order[j]
                swaps_made += 1
                made_swap = True

    if not swaps_made:
        return 0
    return middle(order)


def order_ok(graph, seen_items, item):
    if item not in graph:
        return True
    for banned_preceding in graph.get(item, []):
        if banned_preceding in seen_items:
            return False
    return True


def check_order(order, graph):
    seen_items = []
    for item in order:
        if order_ok(graph, seen_items, item):
            seen_items.append(item)
        else:
            return False
    return True


def middle(order):
    return order[len(order) // 2]


part1, part2 = 0, 0
for i, o in enumerate(orders):
    if check_order(o, good_combos):
        part1 += middle(o)
    part2 += fix_order(good_combos, o)


print(f"{part1=}, {part2=}")
