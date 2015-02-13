/// <reference path="optimizer.ts" />
"use strict";
var Labeler;
(function (Labeler) {
    var Feature;
    (function (Feature) {
        Feature[Feature["Proximity"] = 0] = "Proximity";
        Feature[Feature["Direction"] = 1] = "Direction";
    })(Feature || (Feature = {}));
    ;
    var Features = [0 /* Proximity */, 1 /* Direction */];
    var Parameters = (function () {
        function Parameters() {
            this.expandingStep = 5;
            this.default_energy = 0.001;
            this.ramda = 4; // The ratio between Data term and Smoothness term
            this.feature_on = [true, true]; // Whether the feature is enabled
            this.sigma_smooth = [10, 0.1]; // Sigma for smoothing term
            this.sigma_data = [90, 0.3]; // Sigma for data term
        }
        return Parameters;
    })();
    var FirstStep = (function () {
        function FirstStep(seeds, target) {
            this.seeds = seeds;
            this.parameters = new Parameters;
            this.target = [];
            for (var i = 0; i < target.length; i++) {
                this.target.push(target[i]);
            }
        }
        FirstStep.prototype.expandAreaUntil = function (maxSegmentsNum) {
            this.setLabels();
            for (var offset = this.parameters.expandingStep; maxSegmentsNum < this.target.length; offset += this.parameters.expandingStep)
                for (var i = 0; i < this.target.length; i++) {
                    if (this.target[i].center().norm(this.nearests[i].center()) < offset) {
                        this.target[i].setLabel(this.nearests[i].label());
                        this.target.splice(i, 1);
                        this.nearests.splice(i, 1);
                    }
                }
        };
        FirstStep.prototype.setLabels = function () {
            this.nearests = [];
            for (var i = 0; i < this.target.length; i++) {
                var targetSegment = this.target[i];
                var minNorm = Infinity;
                var nearestSeed;
                this.seeds.forEach(function (seed) {
                    seed.forEach(function (seedSegment) {
                        var currentNorm = targetSegment.center().norm(seedSegment.center());
                        if (currentNorm < minNorm) {
                            nearestSeed = seedSegment;
                            minNorm = currentNorm;
                        }
                    });
                });
                this.nearests[i] = nearestSeed;
            }
        };
        return FirstStep;
    })();
    Labeler.FirstStep = FirstStep;
    var SecondStep = (function () {
        function SecondStep(seeds, target) {
            this.seeds = seeds;
            this.target = target;
            this.parameters = new Parameters;
            this.firstTIme = true;
            this.edges = [];
            this.capacity = [];
        }
        SecondStep.prototype.setLabels = function () {
            var _this = this;
            this.parameters.max_prox = this.parameters.sigma_smooth[0 /* Proximity */] * Math.sqrt(Math.log(this.parameters.default_energy * this.parameters.sigma_smooth[0 /* Proximity */]));
            this.NODENUM = this.target.length + 2;
            this.SOURCE = this.target.length;
            this.SINK = this.target.length + 1;
            for (var i = 0; i < this.NODENUM; i++)
                this.capacity[i] = new Array(this.NODENUM);
            for (var i = 0; i < this.NODENUM; i++)
                this.edges[i] = [];
            var confidence;
            this.firstTIme = false;
            if (this.seeds.length < 2)
                return;
            for (var id = this.seeds.length - 1; 0 < id; id--) {
                var others = this.join(this.seeds, id);
                for (var i = 0; i < this.target.length; i++) {
                    this.capacity[i][this.SOURCE] = 0;
                    this.capacity[this.SOURCE][i] = this.data_term(this.target[i], this.seeds[id]);
                    if (0 < this.capacity[this.SOURCE][i]) {
                        this.edges[this.SOURCE].push(i);
                    }
                    this.capacity[i][this.SINK] = this.data_term(this.target[i], others);
                    this.capacity[this.SINK][i] = 0;
                    if (0 < this.capacity[i][this.SINK]) {
                        this.edges[i].push(this.SINK);
                    }
                    for (var j = 0; j < i; j++) {
                        this.capacity[i][j] = this.capacity[j][i] = this.smoothness_term(this.target[i], this.target[j]);
                        if (0 < this.capacity[i][j]) {
                            this.edges[i].push(j);
                            this.edges[j].push(i);
                        }
                    }
                    this.capacity[i][i] = 0;
                }
                this.capacity[this.SINK][this.SOURCE] = 0;
                this.capacity[this.SOURCE][this.SINK] = 0;
                var optimizer = new Optimizer.EdmondsKarp(this.edges, this.capacity);
                var label = id;
                $("#status").html($("#status").html() + 'Graph constructed<br />');
                optimizer.minCut(this.SOURCE, this.SINK).forEach(function (node) {
                    if (node < _this.target.length)
                        _this.target[node].setLabel(label);
                });
                $("#status").html($("#status").html() + 'Optimized<br />');
            }
            var label = 0;
            for (var k in this.target) {
                if (!this.target[k].labeled())
                    this.target[k].setLabel(label);
            }
        };
        // Calculate the feature value
        SecondStep.prototype.value = function (feature, s1, s2) {
            switch (feature) {
                case 0 /* Proximity */:
                    return s1.center().norm(s2.center());
                case 1 /* Direction */:
                    return 1 - Math.abs(s1.direction().innerProduct(s2.direction()));
            }
        };
        // Fall off funciton
        SecondStep.prototype.fall_off = function (x, type, is_data_term) {
            if (is_data_term)
                if (type == 0 /* Proximity */)
                    return Math.exp(-x * x / Math.pow(this.parameters.sigma_data[type], 2.0)) / this.parameters.sigma_data[type];
                else
                    return Math.exp(-x * x / Math.pow(this.parameters.sigma_data[type], 2.0));
            else
                return Math.exp(-x * x / Math.pow(this.parameters.sigma_smooth[type], 2.0));
        };
        SecondStep.prototype.smoothness_term = function (s1, s2) {
            var _this = this;
            if (Math.pow(this.parameters.max_prox, 2) < s1.center().norm(s2.center()))
                return 0;
            else {
                var value = 1;
                Features.forEach(function (feature) {
                    if (_this.parameters.feature_on[feature])
                        value *= _this.fall_off(_this.value(feature, s1, s2), feature, false);
                });
                if (value / this.parameters.default_energy < 1)
                    return 0;
                return Math.round(value / this.parameters.default_energy);
            }
        };
        SecondStep.prototype.data_term = function (s1, segments) {
            var _this = this;
            var max_affinity = this.parameters.default_energy, affinity;
            segments.forEach(function (segment) {
                affinity = 1;
                Features.forEach(function (feature) {
                    if (_this.parameters.feature_on[feature])
                        affinity *= _this.fall_off(_this.value(feature, s1, segment), feature, true);
                });
                max_affinity = Math.max(max_affinity, affinity);
            });
            return Math.round(this.parameters.ramda * max_affinity / this.parameters.default_energy);
        };
        // Return a joined segments except the segment with the index
        SecondStep.prototype.join = function (source, excludedIndex) {
            var connected = [];
            for (var index = 0; index < source.length; index++)
                if (index != excludedIndex)
                    Array.prototype.push.apply(connected, this.seeds[index]);
            return connected;
        };
        return SecondStep;
    })();
    Labeler.SecondStep = SecondStep;
})(Labeler || (Labeler = {}));
//# sourceMappingURL=labeler.js.map