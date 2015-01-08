/// <reference path="optimizer.ts" />

"use strict"

module Labeler {

    enum Feature {
        Proximity,
        Direction
    };
    var Features: Array<Feature> = [Feature.Proximity, Feature.Direction];

    export class Parameters {
        default_energy: number = 0.0001;
        ramda: number = 4; // デ－タ項と平滑化項の係数
        feature_on: boolean[] = [true, true]; // 特徴量が有効かどうか
        sigma_smooth: number[] = [10.0, 0.1]; // 平滑化項の調整のための分散
        sigma_data: number[] = [90, 0.3]; // データ項の調整のための分散
        max_prox: number; // セグメント間で許容される最大距離
    }

    export class NearestScribbles {

        constructor(protected seeds: Array<Segments>, public target: Array<Segment>) {
        }

        setNearest(offset: number): void {
            this.target.forEach((targetSegment) => {
                var minNorm: number = -1;
                var nearestSeed: Segment;
                this.seeds.forEach((seed) => {
                    seed.forEach((seedSegment) => {
                        if (minNorm < 0 || targetSegment.center().norm(seedSegment.center()) < minNorm) {
                            nearestSeed = seedSegment;
                            minNorm = targetSegment.center().norm(seedSegment.center());
                        }
                    });
                });
                if (minNorm < offset)
                    targetSegment.setLabel(nearestSeed.label);
            });
        }
    }

    export class SmartScribbles {
        protected parameters: Parameters = new Parameters;
        protected firstTIme = true;

        constructor(private seeds: Array<Segments>, public target: Array<Segment>) {
        }

        run() {
            var NODENUM = this.target.length + 2;
            var SOURCE = this.target.length;
            var SINK = this.target.length + 1;
            this.parameters.max_prox = this.parameters.sigma_smooth[Feature.Proximity] * Math.sqrt(Math.log(this.parameters.default_energy * this.parameters.sigma_smooth[Feature.Proximity]));
            var confidence: number[];
            var edges: number[][] = [];
            for (var i = 0; i < NODENUM; i++)
                edges[i] = [];
            var capacity: number[][] = [];
            for (var i = 0; i < NODENUM; i++)
                capacity[i] = new Array<number>(NODENUM);
            if (this.firstTIme) {
                this.firstTIme = false;
            }
            switch (this.seeds.length) {
                case 0:
                case 1:	//マウス入力が１つの場合
                    return;
                default: // マウス入力が２つ以上の場合
                    {
                        for (var l = this.seeds.length - 1; 0 < l; l--) {
                            var connected: Segment[] = [];
                            for (var ll = 0; ll <= l - 1; ll++)
                                Array.prototype.push.apply(connected, this.seeds[ll]);
                            for (var i = 0; i < this.target.length; i++) {
                                capacity[i][SOURCE] = capacity[SOURCE][i] = this.dataTerm(this.target[i], this.seeds[l]);
                                if (0 < capacity[i][SOURCE]) {
                                    edges[i].push(SOURCE);
                                    edges[SOURCE].push(i);
                                }
                                capacity[i][SINK] = capacity[SINK][i] = this.dataTerm(this.target[i], connected);
                                if (0 < capacity[i][SINK]) {
                                    edges[i].push(SINK);
                                    edges[SINK].push(i);
                                }
                                for (var j = 0; j < i; j++) {
                                    capacity[i][j] = capacity[j][i] = this.smoothness_term(this.target[i], this.target[j]);
                                    if (0 < capacity[i][j]) {
                                        edges[i].push(j);
                                        edges[j].push(i);
                                    }
                                }
                                capacity[i][i] = 0;
                            }
                            var optimizer = new Optimizer.EdmondsKarp(edges, capacity);
                            for (var node in optimizer.findMinCut(SOURCE, SINK)) {
                                if (node < this.target.length)
                                    this.target[node].setLabel(new Label(l));
                            }
                        }
                        // Assign 0 to unlabeled segments
                        for (var k in this.target) {
                            if (!this.target[k].labeled())
                                this.target[k].setLabel(new Label(0));
                        }
                    }
            }
        }

        private value(type: Feature, s1: Segment, s2: Segment): number {
            switch (type) {
                case Feature.Proximity:
                    return s1.center().norm(s2.center());
                case Feature.Direction:
                    return 1 - Math.abs(s1.direction().innerProduct(s2.direction()));
            }
        }

        private fall_off(x: number, type: Feature, is_data_term: boolean): number {
            if (is_data_term) {
                if (type == Feature.Proximity)
                    return Math.exp(-x * x / Math.pow(this.parameters.sigma_data[type], 2.0)) / this.parameters.sigma_data[type];
                return Math.exp(-x * x / Math.pow(this.parameters.sigma_data[type], 2.0));
            }
            else {
                return Math.exp(-x * x / Math.pow(this.parameters.sigma_smooth[type], 2.0));
            }
        }

        private smoothness_term(s1: Segment, s2: Segment): number {
            if (s1.center().norm(s2.center()) < Math.pow(this.parameters.max_prox, 2))
                return 0;
            else {
                var value = 1;
                Features.forEach((feature) => {
                    if (this.parameters.feature_on[feature])
                        value *= this.fall_off(this.value(feature, s1, s2), feature, false);
                });
                return value / this.parameters.default_energy;
            }
        }

        private dataTerm(s1: Segment, segments: Segments): number {
            var max_affinity = this.parameters.default_energy, affinity: number;
            segments.forEach((segment) => {
                affinity = 1;
                Features.forEach((feature) => {
                    if (this.parameters.feature_on[feature])
                        affinity *= this.fall_off(this.value(feature, s1, segment), feature, true);
                    max_affinity = Math.max(max_affinity, affinity);
                });
            });
            return this.parameters.ramda * max_affinity / this.parameters.default_energy;
        }

    }
}
