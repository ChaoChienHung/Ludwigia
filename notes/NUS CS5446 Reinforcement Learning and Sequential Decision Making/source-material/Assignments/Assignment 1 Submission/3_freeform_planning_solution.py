"""Assignment 1 - Problem 3 bonus free-form planning template.

* Group Member 1:
    - Name: Chao Chien Hung
    - Matric number: A0327301U

* Group Member 2:
    - Name: Yao Tianhao
    - Matric number: A0274850Y

Problem 3 uses exactly the same passenger schema, batching protocol, timing
model, and utility objective as Problem 2. Only the implementation method is
free: no HTN representation is required. The Python standard library, NumPy,
SciPy, OR-Tools, and PuLP are available in the grading environment. LLM tools
may assist development, but the submitted policy should not call a live LLM
API during grading.

References:
1. https://www.geeksforgeeks.org/dsa/branch-and-bound-algorithm/
2. https://www.geeksforgeeks.org/dsa/difference-between-backtracking-and-branch-n-bound-technique/
3. https://www.geeksforgeeks.org/dsa/introduction-to-branch-and-bound-data-structures-and-algorithms-tutorial/
4. https://arxiv.org/abs/math/0102188

"""

from __future__ import annotations

from itertools import islice
from numbers import Integral
from typing import Any, Sequence


REQUEST_KEYS = {"start", "goal", "deadline", "base_utility", "late_penalty"}


def validate_config(config: dict[str, Any]) -> None:
    """Validate the shared Problem 2/3 configuration schema."""
    required = {"num_levels", "elevator_start", "capacity", "requests"}
    if not isinstance(config, dict) or set(config) != required:
        raise ValueError(f"config must contain exactly these keys: {sorted(required)}")
    num_levels = config["num_levels"]
    elevator_start = config["elevator_start"]
    capacity = config["capacity"]
    requests = config["requests"]
    if not isinstance(num_levels, int) or isinstance(num_levels, bool) or num_levels < 1:
        raise ValueError("num_levels must be a positive integer")
    if (
        not isinstance(elevator_start, int)
        or isinstance(elevator_start, bool)
        or not 0 <= elevator_start < num_levels
    ):
        raise ValueError("elevator_start must name an existing floor")
    if not isinstance(capacity, int) or isinstance(capacity, bool) or capacity < 1:
        raise ValueError("capacity must be a positive integer")
    if not isinstance(requests, (list, tuple)):
        raise ValueError("requests must be a list or tuple")
    for request in requests:
        if not isinstance(request, dict) or set(request) != REQUEST_KEYS:
            raise ValueError(
                "each request must contain exactly: start, goal, deadline, "
                "base_utility, late_penalty"
            )
        for key in REQUEST_KEYS:
            value = request[key]
            if not isinstance(value, int) or isinstance(value, bool):
                raise ValueError(f"request {key} must be an integer")
        if not 0 <= request["start"] < num_levels:
            raise ValueError("request start must name an existing floor")
        if not 0 <= request["goal"] < num_levels:
            raise ValueError("request goal must name an existing floor")
        if request["deadline"] < 0:
            raise ValueError("deadline must be non-negative")
        if request["base_utility"] <= 0:
            raise ValueError("base_utility must be positive")
        if request["late_penalty"] <= 0:
            raise ValueError("late_penalty must be positive")


def validate_order(config: dict[str, Any], order: Sequence[int]) -> list[int]:
    """Return a normalized permutation of every passenger index."""
    count = len(config["requests"])
    try:
        values = list(islice(iter(order), count + 1))
    except TypeError as error:
        raise ValueError("order must be an iterable of passenger indices") from error
    if (
        len(values) != count
        or any(not isinstance(x, Integral) or isinstance(x, bool) for x in values)
        or sorted(int(x) for x in values) != list(range(count))
    ):
        raise ValueError("order must contain every passenger index exactly once")
    return [int(x) for x in values]


def service_batches(
    config: dict[str, Any], order: Sequence[int]
) -> list[list[int]]:
    """Filter initially reached passengers and form deterministic batches."""
    order = validate_order(config, order)
    active = [
        index
        for index in order
        if config["requests"][index]["start"]
        != config["requests"][index]["goal"]
    ]
    capacity = config["capacity"]
    return [
        active[start : start + capacity]
        for start in range(0, len(active), capacity)
    ]


def evaluate_service_order(
    config: dict[str, Any], order: Sequence[int]
) -> dict[str, Any]:
    """Evaluate an order using the grader-owned Problem 2 timing rules."""
    validate_config(config)
    order = validate_order(config, order)
    batches = service_batches(config, order)
    floor = config["elevator_start"]
    elapsed = 0
    travel = 0
    completion = [0] * len(config["requests"])
    for batch in batches:
        for index in batch:
            target = config["requests"][index]["start"]
            distance = abs(floor - target)
            travel += distance
            elapsed += distance + 3
            floor = target
        for index in batch:
            target = config["requests"][index]["goal"]
            distance = abs(floor - target)
            travel += distance
            elapsed += distance + 2
            completion[index] = elapsed
            elapsed += 1
            floor = target
    utilities = [
        max(
            0,
            request["base_utility"]
            - request["late_penalty"]
            * max(0, time - request["deadline"]),
        )
        for request, time in zip(config["requests"], completion)
    ]
    return {
        "order": order,
        "batches": batches,
        "completion_times": completion,
        "utilities": utilities,
        "total_utility": sum(utilities),
        "sum_completion_time": sum(completion),
        "total_travel": travel,
        "finish_time": elapsed,
    }


# COPY-FLAG-1-START

def choose_service_order(config: dict[str, Any]) -> list[int]:
    """Return every passenger index exactly once.

    Replace this valid baseline with any algorithm you choose. A hidden test is
    accepted if the returned order reaches at least 98% of the optimal total
    utility within the 2-second process limit.
    """
    import itertools
    import random
    import time

    validate_config(config)
    requests = config["requests"]
    count = len(requests)
    if count <= 1:
        return list(range(count))

    active_indices = [
        i for i in range(count)
        if requests[i]["start"] != requests[i]["goal"]
    ]
    reached_indices = [
        i for i in range(count)
        if requests[i]["start"] == requests[i]["goal"]
    ]
    m = len(active_indices)
    if m <= 1:
        return list(range(count))

    capacity = config["capacity"]
    elevator_start = config["elevator_start"]
    passengers = [requests[i] for i in active_indices]

    def eval_order(order_active: list[int]) -> int:
        fl = elevator_start
        t = 0
        tot_u = 0
        for b_start in range(0, m, capacity):
            b_end = min(b_start + capacity, m)
            for i in range(b_start, b_end):
                p = passengers[order_active[i]]
                t += abs(fl - p["start"]) + 3
                fl = p["start"]
            for i in range(b_start, b_end):
                p = passengers[order_active[i]]
                t += abs(fl - p["goal"]) + 2
                lat = max(0, t - p["deadline"])
                tot_u += max(0, p["base_utility"] - p["late_penalty"] * lat)
                t += 1
                fl = p["goal"]
        return tot_u

    best_u = -1
    best_order_active = list(range(m))

    # Exact Branch and Bound for m <= 10
    if m <= 10:
        # Heuristic initial seeds
        seeds = [
            sorted(range(m), key=lambda i: passengers[i]["deadline"]),
            sorted(range(m), key=lambda i: passengers[i]["deadline"] - abs(passengers[i]["start"] - passengers[i]["goal"])),
            sorted(range(m), key=lambda i: -passengers[i]["base_utility"]),
            list(range(m)),
        ]
        for s in seeds:
            u = eval_order(s)
            if u > best_u:
                best_u = u
                best_order_active = list(s)

        memo: dict[tuple[int, int], tuple[int, int]] = {}

        def bnb(mask: int, cur_fl: int, cur_t: int, cur_u: int, cur_order: list[int]) -> None:
            nonlocal best_u, best_order_active
            if mask == (1 << m) - 1:
                if cur_u > best_u:
                    best_u = cur_u
                    best_order_active = list(cur_order)
                return

            key = (mask, cur_fl)
            if key in memo:
                prev_t, prev_u = memo[key]
                if prev_t <= cur_t and prev_u >= cur_u:
                    return
            memo[key] = (cur_t, cur_u)

            # Upper bound on unserved passengers
            rem_ub = 0
            for i in range(m):
                if not (mask & (1 << i)):
                    p = passengers[i]
                    earliest_t = cur_t + abs(cur_fl - p["start"]) + 5 + abs(p["start"] - p["goal"])
                    lat = max(0, earliest_t - p["deadline"])
                    rem_ub += max(0, p["base_utility"] - p["late_penalty"] * lat)

            if cur_u + rem_ub <= best_u:
                return

            unserved = [i for i in range(m) if not (mask & (1 << i))]
            k = min(capacity, len(unserved))

            branches = []
            for batch in itertools.permutations(unserved, k):
                fl, t = cur_fl, cur_t
                u_gain = 0
                new_mask = mask
                for idx in batch:
                    new_mask |= (1 << idx)
                    t += abs(fl - passengers[idx]["start"]) + 3
                    fl = passengers[idx]["start"]
                for idx in batch:
                    t += abs(fl - passengers[idx]["goal"]) + 2
                    lat = max(0, t - passengers[idx]["deadline"])
                    u_gain += max(0, passengers[idx]["base_utility"] - passengers[idx]["late_penalty"] * lat)
                    t += 1
                    fl = passengers[idx]["goal"]
                branches.append((u_gain, batch, new_mask, fl, t))

            branches.sort(key=lambda x: x[0], reverse=True)
            for u_gain, batch, new_mask, fl, t in branches:
                bnb(new_mask, fl, t, cur_u + u_gain, cur_order + list(batch))

        bnb(0, elevator_start, 0, 0, [])

    else:
        # Scale m >= 11: Multi-Seed Heuristic + Iterated Local Search with hard time budget
        start_time = time.time()
        deadline_time = start_time + 1.65

        # Multi-seed initialization
        seeds = [
            sorted(range(m), key=lambda i: passengers[i]["deadline"]),
            sorted(range(m), key=lambda i: passengers[i]["deadline"] - abs(passengers[i]["start"] - passengers[i]["goal"])),
            sorted(range(m), key=lambda i: -passengers[i]["base_utility"]),
        ]

        # Greedy insertion seed
        g_seq: list[int] = []
        for idx in sorted(range(m), key=lambda i: passengers[i]["deadline"]):
            b_pos = 0
            b_val = -1
            for pos in range(len(g_seq) + 1):
                cand = g_seq[:pos] + [idx] + g_seq[pos:]
                rem = [x for x in range(m) if x not in cand]
                u = eval_order(cand + rem)
                if u > b_val:
                    b_val = u
                    b_pos = pos
            g_seq.insert(b_pos, idx)
        seeds.append(g_seq)

        for s in seeds:
            u = eval_order(s)
            if u > best_u:
                best_u = u
                best_order_active = list(s)

        # Local search function with 2-opt swaps and relocate operations
        def local_search(order: list[int], cur_u: int) -> tuple[list[int], int]:
            improved = True
            while improved and time.time() < deadline_time:
                improved = False
                for i in range(m):
                    for j in range(i + 1, m):
                        order[i], order[j] = order[j], order[i]
                        u = eval_order(order)
                        if u > cur_u:
                            cur_u = u
                            improved = True
                            break
                        order[i], order[j] = order[j], order[i]
                    if improved:
                        break
                if not improved:
                    for i in range(m):
                        val = order.pop(i)
                        for j in range(m):
                            order.insert(j, val)
                            u = eval_order(order)
                            if u > cur_u:
                                cur_u = u
                                improved = True
                                break
                            order.pop(j)
                        if improved:
                            break
                        order.insert(i, val)
            return order, cur_u

        best_order_active, best_u = local_search(best_order_active, best_u)

        # Iterated Local Search (ILS) with random perturbations
        cur_order = list(best_order_active)
        cur_u = best_u
        while time.time() < deadline_time:
            cand = list(cur_order)
            num_swaps = random.randint(2, 4)
            for _ in range(num_swaps):
                a, b = random.sample(range(m), 2)
                cand[a], cand[b] = cand[b], cand[a]
            cand, cand_u = local_search(cand, eval_order(cand))
            if cand_u > best_u:
                best_u = cand_u
                best_order_active = list(cand)
                cur_order = list(cand)
                cur_u = cand_u
            elif cand_u > cur_u * 0.95 and random.random() < 0.25:
                cur_order = list(cand)
                cur_u = cand_u

    return [active_indices[i] for i in best_order_active] + reached_indices

# COPY-FLAG-1-END


def main() -> None:
    config = {
        "num_levels": 5,
        "elevator_start": 2,
        "capacity": 2,
        "requests": [
            {"start": 0, "goal": 4, "deadline": 16,
             "base_utility": 100, "late_penalty": 8},
            {"start": 3, "goal": 1, "deadline": 12,
             "base_utility": 80, "late_penalty": 12},
        ],
    }
    order = choose_service_order(config)
    print("Service order:", order)
    print("Evaluation:", evaluate_service_order(config, order))


if __name__ == "__main__":
    main()
