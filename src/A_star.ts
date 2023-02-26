import PriorityQueue from './PriorityQueue'
import { Grid_Node } from './Grid';
// type Grid_Node = {
//     x: number
//     y: number;
//     equals: (node: Grid_Node) => boolean;
//     neighbours: Grid_Node[];
// }

function distance(a: Grid_Node, b: Grid_Node) {

    let x = a.col - b.col;
    let y = a.row - b.row;
    return Math.sqrt(x * x + y * y);
}

class Path {
    #path = new Map();
    #rebuilt_path: Grid_Node[] = [];

    get rebuiltPath() {
        return this.#rebuilt_path;
    }

    get path() {
        return this.#path;
    }

    add(parent: Grid_Node, node: Grid_Node) {
        this.#path.set(node, parent);
    }

    rebuild(currentNode: Grid_Node) {
        this.#rebuilt_path.length = 0;
        this.#rebuilt_path.push(currentNode);

        while (this.#path.has(currentNode)) {
            currentNode = this.#path.get(currentNode);
            this.#rebuilt_path.push(currentNode);
        }
        return this.#rebuilt_path;
    }
}

export default class A_Star {
    openSet = new PriorityQueue<Grid_Node>(Infinity);
    closedSet = new Map();
    path = new Path();
    costs = {
        g: new Map(),
        f: new Map()
    }
    finished = false;
    failure = false;

    heuristic: (a: Grid_Node, b: Grid_Node) => number

    constructor(heuristic = distance) {
        this.heuristic = heuristic;
    }

    start_new_path(start: Grid_Node, end: Grid_Node) {
        this.openSet.clear();
        this.closedSet.clear();
        this.path = new Path();
        this.costs.f.clear();
        this.costs.g.clear();

        this.costs.g.set(start, 0);
        this.costs.f.set(start, this.heuristic(start, end));
        this.openSet.add(start, this.costs.f.get(start));
    }

    find_path(start: Grid_Node, goal: Grid_Node) {
        this.start_new_path(start, goal);

        let current: Grid_Node;
        const { g, f } = this.costs;
        //! begin pathfinding
        while (!this.openSet.isEmpty) {
            //! keep going
            current = this.openSet.peek();
            //! get node from openSet with lowest fCost
            if (typeof current !== 'number' && current.equals(goal)) {
                //! reached the goal
                console.log("FINISHED!!");
                this.finished = true;
                return this.path.rebuild(current);
            }

            this.openSet.remove();
            this.closedSet.set(current, current);

            let neighbours = current.neighbours;

            for (let i = 0; i < neighbours.length; i++) {
                let neighbour = neighbours[i];

                if (!this.closedSet.has(neighbour) && neighbour.walkable) {
                    //! ignore if neighbour was already evaluated
                    let tempG = g.get(current) + distance(current, neighbour);

                    if (!g.has(neighbour) || tempG < g.get(neighbour)) {
                        //! best recorded gCost so far;
                        g.set(neighbour, tempG);
                        f.set(neighbour, this.heuristic(neighbour, goal) + g.get(neighbour));
                        this.path.add(current, neighbour);
                    }
                    if (!this.openSet.contains(neighbour)) {
                        this.openSet.add(neighbour, f.get(neighbour));
                    }
                }
            }
        }
        //! no solution
        return false;
    }
}
