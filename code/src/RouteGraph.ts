import RouteNode from './RouteNode';
import Vector from './Vector';

export default class RouteGraph {
    nodes: RouteNode[];

    constructor(nodes: RouteNode[]) {
        this.nodes = nodes;
    }

    // get the closest node in the graph to a given arbitrary position on the screen
    getClosestNodeTo(position: Vector): RouteNode {
        let closest: RouteNode = this.nodes[0];
        let minDist: number = this.nodes[0].position.distanceTo(position);
        for (const node of this.nodes) {
            let d: number = node.position.distanceTo(position);
            if (d < minDist) {
                minDist = d;
                closest = node;
            }
        }
        return closest;
    }


    // shitty randomized routing algo. doesnt find shortest route, but provides variety
    getRoute(from: RouteNode, to: RouteNode): RouteNode[] {
        if (from === to) {
            return [];
        }

        let currentNode: RouteNode = from;
        let currRoute: RouteNode[] = [from];
        let visitedNodes: RouteNode[] = [from];
        while (currentNode !== to) { // if target is reached, end the search
            let collapse: boolean = false;
            for (let i = 0, len = currentNode.neighbours.length; i < len; i++) {
                let n: RouteNode = currentNode.neighbours[i];
                if (!visitedNodes.includes(n)) {
                    currentNode = n;
                    break;
                } else if (i === len-1) {
                    currentNode = currRoute[currRoute.length-2];
                    currRoute.pop();
                    collapse = true;
                }
            }
            if (!collapse) {
                currRoute.push(currentNode);
                visitedNodes.push(currentNode);
            }
        }

        return currRoute;
    }
}
