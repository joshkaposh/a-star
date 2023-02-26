export class Grid_Node {
    col: number;
    row: number;
    id: number;
    walkable: boolean;
    neighbours: Grid_Node[];

    constructor(column: number, row: number, index: number, walkable = true) {
        this.id = index;
        this.col = column;
        this.row = row;

        this.walkable = walkable;
        this.neighbours = [];

    }

    equals(node: Grid_Node) {
        return this.id === node.id;
    }

    addNeighbours(maxCols: number, maxRows: number, getNode: (col: number, row: number) => Grid_Node) {
        if (this.col + 1 < maxCols) this.neighbours.push(getNode(this.col + 1, this.row));
        if (this.col - 1 >= 0) this.neighbours.push(getNode(this.col - 1, this.row));
        if (this.row + 1 < maxRows) this.neighbours.push(getNode(this.col, this.row + 1));
        if (this.row - 1 >= 0) this.neighbours.push(getNode(this.col, this.row - 1));

        if (this.row - 1 >= 0 && this.col - 1 >= 0) this.neighbours.push(getNode(this.col - 1, this.row - 1));
        if (this.row - 1 >= 0 && this.col + 1 < maxCols) this.neighbours.push(getNode(this.col + 1, this.row - 1));
        if (this.row + 1 < maxRows && this.col + 1 < maxCols) this.neighbours.push(getNode(this.col + 1, this.row + 1));
        if (this.row + 1 < maxRows && this.col - 1 >= 0) this.neighbours.push(getNode(this.col - 1, this.row + 1));
    }

}

export default class Grid {
    nodes: Grid_Node[]
    cols: number;
    rows: number;
    width: number;
    height: number;
    tilesizeX: number;
    tilesizeY: number;

    constructor(cols: number, rows: number, tilesizeX: number, tilesizeY: number) {
        this.nodes = [];
        this.cols = cols;
        this.rows = rows;
        this.width = cols * tilesizeX;
        this.height = rows * tilesizeY;
        this.tilesizeX = tilesizeX;
        this.tilesizeY = tilesizeY;

        this.#generateGrid();
    }

    get first() {
        return this.nodes[0]
    }


    get last() {
        return this.nodes.at(-1)
    }

    getNode(col: number, row: number) {
        return this.nodes[row * this.cols + col];
    }

    getNodeXY(x: number, y: number) {
        return this.getNode(Math.floor(x / this.tilesizeX), Math.floor(y / this.tilesizeY))
    }

    #addNeighboursToNodes() {
        for (let i = 0; i < this.nodes.length; i++) {
            this.nodes[i].addNeighbours(this.cols, this.rows, this.getNode.bind(this))
        }
    }

    #generateGrid() {
        if (this.nodes.length !== 0) this.nodes.length = 0;

        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                const index = row * this.cols + col;
                this.nodes.push(new Grid_Node(col, row, index));
            }
        }

        this.#addNeighboursToNodes();
    }
}
