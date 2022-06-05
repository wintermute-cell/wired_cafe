import WVector from './WVector';

export default class RouteNode {
    position: WVector;
    neighbours: RouteNode[];

    constructor(x: number, y: number) {
        this.position = new WVector(x, y);
        this.neighbours = [];
    }

    addNeighbour(n: RouteNode) {
        this.neighbours.push(n);
    }

    // addNeighbour in both directions
    addBidNeighbour(n: RouteNode) {
        this.neighbours.push(n);
        n.neighbours.push(this);
    }
}
