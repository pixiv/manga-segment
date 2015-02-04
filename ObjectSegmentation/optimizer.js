/// <reference path="cv.ts" />
"use strict";
var Optimizer;
(function (Optimizer) {
    var EdmondsKarp = (function () {
        function EdmondsKarp(edges, capacity) {
            this.edges = edges;
            this.capacity = capacity;
            this.flow = [];
            this.node_count = this.capacity.length;
            for (var j = 0; j < this.node_count; j++) {
                var row = [];
                for (var k = 0; k < this.node_count; k++)
                    row.push(0);
                this.flow.push(row);
            }
        }
        EdmondsKarp.prototype.maxflow = function (s, t) {
            this.calculateFlow(s, t);
            return this.flow[s].reduce(function (v, w) { return v + w; });
        };
        EdmondsKarp.prototype.minCut = function (s, t) {
            this.calculateFlow(s, t);
            var result = [];
            this.findPositiveNodes(s, result);
            return result;
        };
        // Finds nodes in the side of source
        EdmondsKarp.prototype.findPositiveNodes = function (source, result) {
            result.push(source);
            for (var index in this.capacity[source])
                if (this.flow[source][index] < this.capacity[source][index] && result.indexOf(index) < 0)
                    Array.prototype.push.apply(result, this.findPositiveNodes(index, result));
        };
        EdmondsKarp.prototype.calculateFlow = function (s, t) {
            while (true) {
                var parent = [];
                for (var k = 0; k < this.node_count; k++)
                    parent.push(-1);
                parent[s] = s;
                var M = [];
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
                            }
                            else {
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
        };
        return EdmondsKarp;
    })();
    Optimizer.EdmondsKarp = EdmondsKarp;
})(Optimizer || (Optimizer = {}));
//# sourceMappingURL=optimizer.js.map