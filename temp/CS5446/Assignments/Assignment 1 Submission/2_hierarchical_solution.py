"""Assignment 1 - Problem 2 hierarchical-planning submission template.

* Group Member 1:
    - Name: Chao Chien Hung
    - Matric number: A0327301U

* Group Member 2:
    - Name: Yao Tianhao
    - Matric number: A0274850Y

References:
1. https://www.geeksforgeeks.org/dsa/branch-and-bound-algorithm/
2. https://www.geeksforgeeks.org/dsa/difference-between-backtracking-and-branch-n-bound-technique/
3. https://www.geeksforgeeks.org/dsa/introduction-to-branch-and-bound-data-structures-and-algorithms-tutorial/
    
"""

from __future__ import annotations

from itertools import islice
from numbers import Integral
from typing import Any, Sequence

from unified_planning.model.htn import HierarchicalProblem, Method
from unified_planning.shortcuts import (
    BoolType,
    Equals,
    Fluent,
    InstantaneousAction,
    Not,
    Object,
    OneshotPlanner,
    UserType,
)


# The representation below is fixed. Hidden tests change values, not the schema.
# Each request is a dictionary with exactly these five keys.
REQUEST_KEYS = {"start", "goal", "deadline", "base_utility", "late_penalty"}


def validate_config(config: dict[str, Any]) -> None:
    """Validate the public Problem 2 configuration schema."""
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
    """Return a normalized passenger permutation, safely rejecting bad iterables."""
    passenger_count = len(config["requests"])
    try:
        values = list(islice(iter(order), passenger_count + 1))
    except TypeError as error:
        raise ValueError("order must be an iterable of passenger indices") from error
    if (
        len(values) != passenger_count
        or any(
            not isinstance(index, Integral) or isinstance(index, bool)
            for index in values
        )
        or sorted(int(index) for index in values) != list(range(passenger_count))
    ):
        raise ValueError("order must contain every passenger index exactly once")
    return [int(index) for index in values]


def service_batches(config: dict[str, Any], order: Sequence[int]) -> list[list[int]]:
    """Split active passengers into consecutive capacity-sized batches."""
    order = validate_order(config, order)
    active = [
        index
        for index in order
        if config["requests"][index]["start"]
        != config["requests"][index]["goal"]
    ]
    capacity = config["capacity"]
    return [active[start : start + capacity] for start in range(0, len(active), capacity)]


def evaluate_service_order(config: dict[str, Any], order: Sequence[int]) -> dict[str, Any]:
    """Replay deterministic capacity batches using the external time model.

    Moving from floor ``a`` to floor ``b`` takes ``abs(a - b)`` time units.
    For each batch, all passengers board in order before anyone exits; they then
    exit in the same order. Opening, closing, loading, and unloading each take
    one time unit. Completion is measured immediately after unloading.
    """
    validate_config(config)
    order = validate_order(config, order)
    batches = service_batches(config, order)
    passenger_count = len(config["requests"])

    current_floor = config["elevator_start"]
    current_time = 0
    total_travel = 0
    completion_times = [0] * passenger_count

    for batch in batches:
        for index in batch:
            start = config["requests"][index]["start"]
            distance = abs(current_floor - start)
            total_travel += distance
            current_time += distance + 3  # move; open, load, close
            current_floor = start

        for index in batch:
            goal = config["requests"][index]["goal"]
            distance = abs(current_floor - goal)
            total_travel += distance
            current_time += distance + 2  # move; open, unload
            completion_times[index] = current_time
            current_time += 1  # close before the next task
            current_floor = goal

    utilities = []
    for request, completion_time in zip(config["requests"], completion_times):
        lateness = max(0, completion_time - request["deadline"])
        utilities.append(
            max(0, request["base_utility"] - request["late_penalty"] * lateness)
        )

    return {
        "order": order,
        "batches": batches,
        "completion_times": completion_times,
        "utilities": utilities,
        "total_utility": sum(utilities),
        "sum_completion_time": sum(completion_times),
        "max_completion_time": max(completion_times, default=0),
        "total_travel": total_travel,
        "finish_time": current_time,
    }


# COPY-FLAG-1-START

def choose_service_order(config: dict[str, Any]) -> list[int]:
    """Return a permutation of passenger indices.

    The starter policy is deliberately valid but usually suboptimal. Replace it
    with your own policy. The quality objective is maximum total utility.
    """
    import itertools
    import time

    validate_config(config)
    requests = config["requests"]
    passenger_count = len(requests)

    # Fast exit if sorting is unnecessary
    if passenger_count <= 1:
        return list(range(passenger_count))

    # Separate passengers who need moving from those already at their destination
    active_indices = [
        i for i in range(passenger_count)
        if requests[i]["start"] != requests[i]["goal"]
    ]
    reached_indices = [
        i for i in range(passenger_count)
        if requests[i]["start"] == requests[i]["goal"]
    ]
    
    m = len(active_indices)
    if m == 0:
        return list(range(passenger_count))

    capacity = config["capacity"]
    elevator_start = config["elevator_start"]
    passengers = [requests[i] for i in active_indices]

    def eval_order(order_active):
        """
        Simulates the elevator serving a specific permutation of passengers in batches.
        """
        fl = elevator_start
        t = 0
        tot_u = 0

        # Process passengers in chunks constrained by elevator capacity
        for b_start in range(0, m, capacity):
            b_end = min(b_start + capacity, m)

            # Phase 1: Pick up all passengers in the current batch sequentially
            for i in range(b_start, b_end):
                p = passengers[order_active[i]]
                t += abs(fl - p["start"]) + 3   # Travel time + boarding delay
                fl = p["start"]

            # Phase 2: Drop off all passengers in the current batch sequentially
            for i in range(b_start, b_end):
                p = passengers[order_active[i]]
                t += abs(fl - p["goal"]) + 2    # Travel time + alighting delay

                # Calculate utility decay based on how late they arrive
                lat = max(0, t - p["deadline"]) 
                tot_u += max(0, p["base_utility"] - p["late_penalty"] * lat)

                t += 1  # Standard post-dropoff delay
                fl = p["goal"]

        return tot_u

    # Initialization & Heuristic Seeding    
    best_u = -1
    best_order_active = list(range(m))

    # Seeds 1-4: Standard sorts by urgency, distance/urgency ratio, highest value, and original order
    seeds = [
        sorted(range(m), key=lambda i: passengers[i]["deadline"]),
        sorted(range(m), key=lambda i: passengers[i]["deadline"] - abs(passengers[i]["start"] - passengers[i]["goal"])),
        sorted(range(m), key=lambda i: -passengers[i]["base_utility"]),
        list(range(m)),
    ]

    # Greedy Insertion
    # Iteratively builds an order by testing the "next most urgent" passenger in every 
    # possible slot of the currently built sequence to maximize intermediate utility.
    greedy_seq: list[int] = []
    for idx in sorted(range(m), key=lambda i: passengers[i]["deadline"]):
        b_pos = 0
        b_val = -1
        for pos in range(len(greedy_seq) + 1):
            cand = greedy_seq[:pos] + [idx] + greedy_seq[pos:]
            rem = [x for x in range(m) if x not in cand]
            u = eval_order(cand + rem)
            if u > b_val:
                b_val = u
                b_pos = pos
        greedy_seq.insert(b_pos, idx)
    seeds.append(greedy_seq)

    # Evaluate all seeds and track the absolute best baseline
    for s in seeds:
        u = eval_order(s)
        if u > best_u:
            best_u = u
            best_order_active = list(s)

    # Exact Optimization (Branch and Bound)
    # Only execute the exponential search if passenger count is mathematically feasible
    if m <= 10:
        # Memoization maps: (served_passengers_bitmask, current_floor) -> (time_taken, utility_achieved)
        # Used for State Dominance check below.
        memo: dict[tuple[int, int], tuple[int, int]] = {}

        def bnb(mask: int, cur_fl: int, cur_t: int, cur_u: int, cur_order: list[int]) -> None:
            nonlocal best_u, best_order_active

            # Base case: All active passengers (bits in mask) have been successfully served
            if mask == (1 << m) - 1:
                if cur_u > best_u:
                    best_u = cur_u
                    best_order_active = list(cur_order)
                return

            # State Dominance Pruning
            # If we've reached this exact subset of passengers at this floor before, 
            # and we did it faster (prev_t <= cur_t) with better/equal utility, abort this branch.
            key = (mask, cur_fl)
            if key in memo:
                prev_t, prev_u = memo[key]
                if prev_t <= cur_t and prev_u >= cur_u:
                    return
            memo[key] = (cur_t, cur_u)

            # Optimistic Upper Bound Pruning
            # Estimate the absolute best possible utility we could squeeze out of unserved passengers
            rem_ub = 0
            for i in range(m):
                if not (mask & (1 << i)):   # If bit 'i' is 0, passenger is unserved
                    p = passengers[i]
                    # Calculate "perfect routing" time ignoring all other passengers entirely
                    earliest_t = cur_t + abs(cur_fl - p["start"]) + 5 + abs(p["start"] - p["goal"])
                    lat = max(0, earliest_t - p["deadline"])
                    rem_ub += max(0, p["base_utility"] - p["late_penalty"] * lat)

            # If current score + perfectly optimistic future score can't beat our known best, stop exploring
            if cur_u + rem_ub <= best_u:
                return

            # Determine the next batch size (either a full elevator or whoever is left)
            unserved = [i for i in range(m) if not (mask & (1 << i))]
            k = min(capacity, len(unserved))

            # Generate all valid permutations of size `k` to represent the next elevator batch
            branches = []
            for batch in itertools.permutations(unserved, k):
                fl, t = cur_fl, cur_t
                u_gain = 0
                new_mask = mask

                # Simulate batch pickup sequence
                for idx in batch:
                    new_mask |= (1 << idx)  # Flip bit to mark passenger as served
                    t += abs(fl - passengers[idx]["start"]) + 3
                    fl = passengers[idx]["start"]

                # Simulate batch dropoff sequence
                for idx in batch:
                    t += abs(fl - passengers[idx]["goal"]) + 2
                    lat = max(0, t - passengers[idx]["deadline"])
                    u_gain += max(0, passengers[idx]["base_utility"] - passengers[idx]["late_penalty"] * lat)
                    t += 1
                    fl = passengers[idx]["goal"]

                branches.append((u_gain, batch, new_mask, fl, t))

            # Sort branches to explore paths with the highest immediate utility gain first.
            # This finds better global `best_u` faster, making the Upper Bound pruner more aggressive.
            branches.sort(key=lambda x: x[0], reverse=True)
            for u_gain, batch, new_mask, fl, t in branches:
                bnb(new_mask, fl, t, cur_u + u_gain, cur_order + list(batch))

        # Kick off B&B: mask=0 (nobody served), starting floor, time=0, utility=0, empty order
        bnb(0, elevator_start, 0, 0, [])

    # Reconstruct the final output array: active passengers in best order + anyone already at their goal
    return [active_indices[i] for i in best_order_active] + reached_indices


# COPY-FLAG-1-END


def generate_hierarchical(config: dict[str, Any]) -> HierarchicalProblem:
    """Build the elevator HTN for ``config`` using ``choose_service_order``."""
    validate_config(config)
    order = choose_service_order(config)
    # Validate the policy before any UP objects are constructed.
    evaluate_service_order(config, order)

    problem = HierarchicalProblem("ElevatorHTNProblem")

    Loc = UserType("Loc")
    Floor = UserType("Floor", father=Loc)
    Elevator = UserType("Elevator", father=Loc)
    Person = UserType("Person")
    Count = UserType("Count")

    floors = [Object(f"floor{i}", Floor) for i in range(config["num_levels"])]
    people = [Object(f"person{i + 1}", Person) for i in range(len(config["requests"]))]
    elevator = Object("elevator", Elevator)
    counts = [Object(f"c{i}", Count) for i in range(config["capacity"] + 1)]
    problem.add_objects(floors + people + [elevator] + counts)

    at_person = Fluent("at_person", Loc, person=Person)
    at_elevator = Fluent("at_elevator", Floor, elevator=Elevator)
    elevator_door_open = Fluent("elevator_door_open", BoolType(), elevator=Elevator)
    destination = Fluent("destination", Floor, person=Person)
    reached = Fluent("reached", BoolType(), person=Person)
    lift_count = Fluent("lift_count", BoolType(), count=Count)
    next_count = Fluent("next_count", BoolType(), current=Count, next=Count)
    problem.add_fluent(at_person)
    problem.add_fluent(at_elevator)
    problem.add_fluent(elevator_door_open)
    problem.add_fluent(destination)
    problem.add_fluent(reached, default_initial_value=False)
    problem.add_fluent(lift_count, default_initial_value=False)
    problem.add_fluent(next_count, default_initial_value=False)

    for person, request in zip(people, config["requests"]):
        problem.set_initial_value(at_person(person), floors[request["start"]])
        problem.set_initial_value(destination(person), floors[request["goal"]])
        if request["start"] == request["goal"]:
            problem.set_initial_value(reached(person), True)
    problem.set_initial_value(at_elevator(elevator), floors[config["elevator_start"]])
    problem.set_initial_value(elevator_door_open(elevator), False)
    problem.set_initial_value(lift_count(counts[0]), True)
    for index in range(config["capacity"]):
        problem.set_initial_value(next_count(counts[index], counts[index + 1]), True)

    move_elevator = InstantaneousAction(
        "move_elevator", elevator=Elevator, start=Floor, end=Floor
    )
    load = InstantaneousAction(
        "load",
        elevator=Elevator,
        person=Person,
        floor=Floor,
        current=Count,
        next=Count,
    )
    unload = InstantaneousAction(
        "unload",
        elevator=Elevator,
        person=Person,
        floor=Floor,
        previous=Count,
        current=Count,
    )
    open_door = InstantaneousAction("open_door", elevator=Elevator)
    close_door = InstantaneousAction("close_door", elevator=Elevator)

    # COPY-FLAG-2-START

    # Add the exact preconditions and effects listed in Task 2. Do not add
    # extra guards such as start != end or not reached on unload.
    # move_elevator
    move_elevator.add_precondition(Equals(at_elevator(move_elevator.parameter("elevator")), move_elevator.parameter("start")))
    move_elevator.add_precondition(Not(elevator_door_open(move_elevator.parameter("elevator"))))
    move_elevator.add_effect(at_elevator(move_elevator.parameter("elevator")), move_elevator.parameter("end"))

    # load
    load.add_precondition(Equals(at_elevator(load.parameter("elevator")), load.parameter("floor")))
    load.add_precondition(Equals(at_person(load.parameter("person")), load.parameter("floor")))
    load.add_precondition(elevator_door_open(load.parameter("elevator")))
    load.add_precondition(lift_count(load.parameter("current")))
    load.add_precondition(next_count(load.parameter("current"), load.parameter("next")))
    load.add_precondition(Not(reached(load.parameter("person"))))
    load.add_effect(at_person(load.parameter("person")), load.parameter("elevator"))
    load.add_effect(lift_count(load.parameter("current")), False)
    load.add_effect(lift_count(load.parameter("next")), True)

    # unload
    unload.add_precondition(Equals(at_elevator(unload.parameter("elevator")), unload.parameter("floor")))
    unload.add_precondition(Equals(at_person(unload.parameter("person")), unload.parameter("elevator")))
    unload.add_precondition(elevator_door_open(unload.parameter("elevator")))
    unload.add_precondition(Equals(destination(unload.parameter("person")), unload.parameter("floor")))
    unload.add_precondition(lift_count(unload.parameter("current")))
    unload.add_precondition(next_count(unload.parameter("previous"), unload.parameter("current")))
    unload.add_effect(at_person(unload.parameter("person")), unload.parameter("floor"))
    unload.add_effect(reached(unload.parameter("person")), True)
    unload.add_effect(lift_count(unload.parameter("current")), False)
    unload.add_effect(lift_count(unload.parameter("previous")), True)

    # open_door
    open_door.add_precondition(Not(elevator_door_open(open_door.parameter("elevator"))))
    open_door.add_effect(elevator_door_open(open_door.parameter("elevator")), True)

    # close_door
    close_door.add_precondition(elevator_door_open(close_door.parameter("elevator")))
    close_door.add_effect(elevator_door_open(close_door.parameter("elevator")), False)

    # COPY-FLAG-2-END

    problem.add_actions(
        [move_elevator, load, unload, open_door, close_door]
    )

    pickup_person = problem.add_task(
        "pickup_person", person=Person, start_floor=Floor
    )
    deliver_person = problem.add_task(
        "deliver_person", person=Person, goal_floor=Floor
    )
    confirm_reached = problem.add_task(
        "confirm_reached", person=Person, goal_floor=Floor
    )

    # COPY-FLAG-3-START

    # Add the five methods using the exact signatures, preconditions, and
    # ordered decompositions listed in Task 3.
    # 1. method_pickup_from_other_floor
    m1 = Method(
        "method_pickup_from_other_floor",
        elevator=Elevator,
        person=Person,
        elevator_floor=Floor,
        start_floor=Floor,
        current=Count,
        next=Count,
    )
    m1.set_task(pickup_person, m1.parameter("person"), m1.parameter("start_floor"))
    m1.add_precondition(Equals(at_person(m1.parameter("person")), m1.parameter("start_floor")))
    m1.add_precondition(Equals(at_elevator(m1.parameter("elevator")), m1.parameter("elevator_floor")))
    m1.add_precondition(Not(Equals(m1.parameter("elevator_floor"), m1.parameter("start_floor"))))
    m1.add_precondition(Not(elevator_door_open(m1.parameter("elevator"))))
    m1.add_precondition(lift_count(m1.parameter("current")))
    m1.add_precondition(next_count(m1.parameter("current"), m1.parameter("next")))
    m1.add_precondition(Not(reached(m1.parameter("person"))))
    t1 = m1.add_subtask(move_elevator, m1.parameter("elevator"), m1.parameter("elevator_floor"), m1.parameter("start_floor"))
    t2 = m1.add_subtask(open_door, m1.parameter("elevator"))
    t3 = m1.add_subtask(load, m1.parameter("elevator"), m1.parameter("person"), m1.parameter("start_floor"), m1.parameter("current"), m1.parameter("next"))
    t4 = m1.add_subtask(close_door, m1.parameter("elevator"))
    m1.set_ordered(t1, t2, t3, t4)
    problem.add_method(m1)

    # 2. method_pickup_from_current_floor
    m2 = Method(
        "method_pickup_from_current_floor",
        elevator=Elevator,
        person=Person,
        start_floor=Floor,
        current=Count,
        next=Count,
    )
    m2.set_task(pickup_person, m2.parameter("person"), m2.parameter("start_floor"))
    m2.add_precondition(Equals(at_person(m2.parameter("person")), m2.parameter("start_floor")))
    m2.add_precondition(Equals(at_elevator(m2.parameter("elevator")), m2.parameter("start_floor")))
    m2.add_precondition(Not(elevator_door_open(m2.parameter("elevator"))))
    m2.add_precondition(lift_count(m2.parameter("current")))
    m2.add_precondition(next_count(m2.parameter("current"), m2.parameter("next")))
    m2.add_precondition(Not(reached(m2.parameter("person"))))
    t1 = m2.add_subtask(open_door, m2.parameter("elevator"))
    t2 = m2.add_subtask(load, m2.parameter("elevator"), m2.parameter("person"), m2.parameter("start_floor"), m2.parameter("current"), m2.parameter("next"))
    t3 = m2.add_subtask(close_door, m2.parameter("elevator"))
    m2.set_ordered(t1, t2, t3)
    problem.add_method(m2)

    # 3. method_deliver_to_other_floor
    m3 = Method(
        "method_deliver_to_other_floor",
        elevator=Elevator,
        person=Person,
        elevator_floor=Floor,
        goal_floor=Floor,
        previous=Count,
        current=Count,
    )
    m3.set_task(deliver_person, m3.parameter("person"), m3.parameter("goal_floor"))
    m3.add_precondition(Equals(at_person(m3.parameter("person")), m3.parameter("elevator")))
    m3.add_precondition(Equals(destination(m3.parameter("person")), m3.parameter("goal_floor")))
    m3.add_precondition(Equals(at_elevator(m3.parameter("elevator")), m3.parameter("elevator_floor")))
    m3.add_precondition(Not(Equals(m3.parameter("elevator_floor"), m3.parameter("goal_floor"))))
    m3.add_precondition(Not(elevator_door_open(m3.parameter("elevator"))))
    m3.add_precondition(lift_count(m3.parameter("current")))
    m3.add_precondition(next_count(m3.parameter("previous"), m3.parameter("current")))
    t1 = m3.add_subtask(move_elevator, m3.parameter("elevator"), m3.parameter("elevator_floor"), m3.parameter("goal_floor"))
    t2 = m3.add_subtask(open_door, m3.parameter("elevator"))
    t3 = m3.add_subtask(unload, m3.parameter("elevator"), m3.parameter("person"), m3.parameter("goal_floor"), m3.parameter("previous"), m3.parameter("current"))
    t4 = m3.add_subtask(close_door, m3.parameter("elevator"))
    m3.set_ordered(t1, t2, t3, t4)
    problem.add_method(m3)

    # 4. method_deliver_at_current_floor
    m4 = Method(
        "method_deliver_at_current_floor",
        elevator=Elevator,
        person=Person,
        goal_floor=Floor,
        previous=Count,
        current=Count,
    )
    m4.set_task(deliver_person, m4.parameter("person"), m4.parameter("goal_floor"))
    m4.add_precondition(Equals(at_person(m4.parameter("person")), m4.parameter("elevator")))
    m4.add_precondition(Equals(destination(m4.parameter("person")), m4.parameter("goal_floor")))
    m4.add_precondition(Equals(at_elevator(m4.parameter("elevator")), m4.parameter("goal_floor")))
    m4.add_precondition(Not(elevator_door_open(m4.parameter("elevator"))))
    m4.add_precondition(lift_count(m4.parameter("current")))
    m4.add_precondition(next_count(m4.parameter("previous"), m4.parameter("current")))
    t1 = m4.add_subtask(open_door, m4.parameter("elevator"))
    t2 = m4.add_subtask(unload, m4.parameter("elevator"), m4.parameter("person"), m4.parameter("goal_floor"), m4.parameter("previous"), m4.parameter("current"))
    t3 = m4.add_subtask(close_door, m4.parameter("elevator"))
    m4.set_ordered(t1, t2, t3)
    problem.add_method(m4)

    # 5. method_confirm_reached
    m5 = Method(
        "method_confirm_reached",
        person=Person,
        goal_floor=Floor,
    )
    m5.set_task(confirm_reached, m5.parameter("person"), m5.parameter("goal_floor"))
    m5.add_precondition(reached(m5.parameter("person")))
    m5.add_precondition(Equals(at_person(m5.parameter("person")), m5.parameter("goal_floor")))
    m5.add_precondition(Equals(destination(m5.parameter("person")), m5.parameter("goal_floor")))
    problem.add_method(m5)

    # COPY-FLAG-3-END

    # COPY-FLAG-4-START

    # Filter initially reached passengers, split the remaining order into
    # capacity-sized batches, add all pickups followed by all deliveries for
    # each batch, append confirm_reached tasks, and totally order the network.
    active_indices = [
        index for index in order
        if config["requests"][index]["start"] != config["requests"][index]["goal"]
    ]
    reached_indices = [
        index for index in order
        if config["requests"][index]["start"] == config["requests"][index]["goal"]
    ]
    capacity = config["capacity"]
    batches = [
        active_indices[start : start + capacity]
        for start in range(0, len(active_indices), capacity)
    ]

    subtasks = []
    for batch in batches:
        for idx in batch:
            subtasks.append(
                problem.task_network.add_subtask(
                    pickup_person, people[idx], floors[config["requests"][idx]["start"]]
                )
            )
        for idx in batch:
            subtasks.append(
                problem.task_network.add_subtask(
                    deliver_person, people[idx], floors[config["requests"][idx]["goal"]]
                )
            )

    for idx in reached_indices:
        subtasks.append(
            problem.task_network.add_subtask(
                confirm_reached, people[idx], floors[config["requests"][idx]["goal"]]
            )
        )

    if subtasks:
        problem.task_network.set_ordered(*subtasks)

    # COPY-FLAG-4-END

    return problem


def solve(problem: HierarchicalProblem, verbose: bool = False):
    """Solve and return the planner result (printing it for notebook use)."""
    with OneshotPlanner(problem_kind=problem.kind) as planner:
        result = planner.solve(problem, timeout=10)
    if result.plan is not None:
        print("Plan:", repr(result.plan) if verbose else str(result.plan))
    else:
        print(result.status)
    return result


def main() -> None:
    config = {
        "num_levels": 5,
        "elevator_start": 2,
        "capacity": 2,
        "requests": [
            {"start": 0, "goal": 4, "deadline": 16, "base_utility": 100, "late_penalty": 8},
            {"start": 3, "goal": 1, "deadline": 12, "base_utility": 80, "late_penalty": 12},
            {"start": 2, "goal": 2, "deadline": 0, "base_utility": 30, "late_penalty": 5},
        ],
    }
    order = choose_service_order(config)
    print("Service order:", order)
    print("External evaluation:", evaluate_service_order(config, order))
    solve(generate_hierarchical(config))


if __name__ == "__main__":
    main()
