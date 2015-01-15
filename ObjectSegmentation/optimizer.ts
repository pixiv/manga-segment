/// <reference path="core.ts" />

"use strict"

module Optimizer {

    export class EdmondsKarp {
        node_count: number;
        flow: number[][] = [];

        constructor(public edges: number[][], public capacity: number[][]) {
            this.node_count = this.capacity.length;
            for (var j = 0; j < this.node_count; j++) {
                var row: number[] = [];
                for (var k = 0; k < this.node_count; k++)
                    row.push(0);
                this.flow.push(row);
            }
        }

        maxflow(s: number, t: number): number {
            this.calculateFlow(s, t);
            return this.flow[s].reduce((v, w) => v + w);
        }

        minCut(s: number, t: number): number[] {
            this.calculateFlow(s, t);
            var result: number[] = [];
            this.findPositiveNodes(s, result);
            return result;
        }

        // Finds nodes in the side of source
        findPositiveNodes(source: number, result: number[]) {
            result.push(source);
            for (var index in this.capacity[source]) {
                if (this.flow[source][index] < this.capacity[source][index] && result.indexOf(index) < 0) {
                    Array.prototype.push.apply(result, this.findPositiveNodes(index, result));
                }
            }
        }

        private calculateFlow(s: number, t: number): void {
            while (true) {
                var parent: number[] = [];
                for (var k = 0; k < this.node_count; k++)
                    parent.push(-1);
                parent[s] = s;
                var M: number[] = [];
                for (var k = 0; k < this.node_count; k++)
                    M.push(0);
                M[s] = Infinity;
                var queue = [s];
                var _break = false;
                while (0 < queue.length && !_break) {
                    var u = queue.pop();
                    for (var i in this.edges[u]) {
                        var v = this.edges[u][i];
                        if (this.capacity[u][v] - this.flow[u][v] > 0 && parent[v] == -1) {
                            parent[v] = u;
                            M[v] = Math.min(M[u], this.capacity[u][v] - this.flow[u][v]);
                            if (v != t) {
                                queue.push(v);
                            } else {
                                while (parent[v] != v) {
                                    u = parent[v];
                                    this.flow[u][v] += M[t];
                                    this.flow[v][u] -= M[t];
                                    v = u;
                                }
                                _break = true;
                                break;
                            }
                        }
                    }
                }
                if (parent[t] == -1) {
                    return;
                }
            }
        }
    }

    // Represents an edge from source to sink with capacity
    class Edge {
        public reverseEdge: Edge = null;
        public flow: number = 0;
        constructor(public source: number, public sink: number, public capacity: number) {
        }
        toString() {
            return "(" + this.source + ", " + this.sink + ") : " + this.capacity + " @ " + this.flow + "\n";
        }
    }

    class ResidualEdge {
        constructor(public edge: Edge, public residual: number) {
        }
        toString() {
            return this.edge.toString() + ": " + this.residual;
        }
    }

    // Main class to manage the network
    export class FordFulkerson {
        constructor(edges: number[][], capacity: number[][]) {
            for (var i = 0; i < capacity.length; i++) {
                for (var j = 0; j < i; j++) {
                    this.addEdge(i, j, capacity[i][j]);
                }
            }
        }

        public edges: Array<Array<Edge>> = [];

        addEdge(source: number, sink: number, capacity: number) {
            if (source == sink) return;
            // Create the two edges = one being the reverse of the other
            var edge: Edge = new Edge(source, sink, capacity);
            var reverseEdge: Edge = new Edge(sink, source, 0);
            // Make sure we setup the pointer to the reverse edge
            edge.reverseEdge = reverseEdge;
            reverseEdge.reverseEdge = edge;
            if (this.edges[source] === undefined) this.edges[source] = [];
            if (this.edges[sink] === undefined) this.edges[sink] = [];
            this.edges[source].push(edge);
            this.edges[sink].push(reverseEdge);
        }

        // Is this edge/residual capacity combination in the path already?
        private findEdgeInPath(path: ResidualEdge[], edge: Edge, residual: number): boolean {
            for (var p = 0; p < path.length; p++)
                if (path[p].edge == edge && path[p].residual == residual)
                    return true;
            return false;
        }

        // Finds a path from source to sink
        findPath(source: number, sink: number, path: ResidualEdge[]): ResidualEdge[] {
            if (source == sink)
                return path;
            for (var i = 0; i < this.edges[source].length; i++) {
                var edge = this.edges[source][i];
                var residual = edge.capacity - edge.flow;
                // If we have capacity && we haven't already visited this edge, visit it
                if (residual > 0 && !this.findEdgeInPath(path, edge, residual)) {
                    // get a copy of path
                    var tpath = path.slice(0);
                    // add the ResidualEdge
                    tpath.push(new ResidualEdge(edge, residual));
                    var result = this.findPath(edge.sink, sink, tpath);
                    if (result != null)
                        return result;
                }
            }
            return null;
        }

        // Finds nodes in the side of source
        findPositiveNodes(source: number, result: number[]) {
            result.push(source);
            this.edges[source].forEach((edge) => {
                if (0 < edge.capacity && result.indexOf(edge.sink) < 0) {
                    Array.prototype.push.apply(result, this.findPositiveNodes(edge.sink, result));
                }
            });
        }

        findMinCut(source: number, sink: number): number[] {
            var path: ResidualEdge[];
            path = this.findPath(source, sink, []);
            while (path != null) {
                var flow = 999999;
                // Find the minimum flow
                path.forEach((redge) => {
                    if (redge.residual < flow)
                        flow = redge.residual;
                });
                // Apply the flow to the edge && the reverse edge
                path.forEach((redge) => {
                    redge.edge.flow += flow;
                    redge.edge.reverseEdge.flow -= flow;
                });
                path = this.findPath(source, sink, []);
            }
            this.edges.forEach((subedges) => {
                subedges.forEach((edge) => {
                    edge.capacity -= edge.flow;
                });
            });
            var result: number[] = [];
            this.findPositiveNodes(source, result);
            return result;
        }

        // Find the max flow in this network
        maxFlow(source: number, sink: number) {
            var path: ResidualEdge[];
            path = this.findPath(source, sink, []);
            while (path != null) {
                var flow = 999999;
                // Find the minimum flow
                path.forEach((redge) => {
                    if (redge.residual < flow)
                        flow = redge.residual;
                });
                // Apply the flow to the edge && the reverse edge
                path.forEach((redge) => {
                    redge.edge.flow += flow;
                    redge.edge.reverseEdge.flow -= flow;
                });
                path = this.findPath(source, sink, []);
            }
            var sum = 0;
            this.edges[source].forEach((edge) => sum += edge.flow);
            return sum;
        }
    }

}
