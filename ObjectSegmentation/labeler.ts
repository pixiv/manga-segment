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
        sigma_smooth: number[] = [10, 0.1]; // 平滑化項の調整のための分散
        sigma_data: number[] = [90, 0.3]; // データ項の調整のための分散
        max_prox: number; // セグメント間で許容される最大距離
    }

    export class NearestScribbles {

        constructor(protected seeds: Array<Segments>, public target: Array<Segment>) {
        }

        setNearest(offset: number): void {
            for (var i = 0; i < this.target.length; i++) {
                var targetSegment = this.target[i];
                var minNorm: number = Infinity;
                var nearestSeed: Segment;
                this.seeds.forEach((seed) => {
                    seed.forEach((seedSegment) => {
                        var currentNorm = targetSegment.center().norm(seedSegment.center());
                        if (currentNorm < minNorm) {
                            nearestSeed = seedSegment;
                            minNorm = currentNorm;
                        }
                    });
                });
                if (minNorm < offset)
                    targetSegment.setLabel(nearestSeed.label);
            }
        }
    }

    export class SmartScribbles {
        protected parameters: Parameters = new Parameters;
        protected firstTIme = true;
        protected NODENUM: number;
        protected SOURCE: number;
        protected SINK: number;
        public edges: number[][] = [];
        public capacity: number[][] = [];

        constructor(private seeds: Array<Segments>, public target: Array<Segment>) {
        }

        run() {
            this.parameters.max_prox = Infinity;//this.parameters.sigma_smooth[<number>Feature.Proximity] * Math.sqrt(Math.log(this.parameters.default_energy * this.parameters.sigma_smooth[<number>Feature.Proximity]));
            this.NODENUM = this.target.length + 2;
            this.SOURCE = this.target.length;
            this.SINK = this.target.length + 1;
            for (var i = 0; i < this.NODENUM; i++)
                this.capacity[i] = new Array<number>(this.NODENUM);
            for (var i = 0; i < this.NODENUM; i++)
                this.edges[i] = [];
            var confidence: number[];
            this.firstTIme = false;
            switch (this.seeds.length) {
                case 0:
                case 1:	//マウス入力が１つの場合
                    return;
                default: // マウス入力が２つ以上の場合
                    {
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
                            var label = new Label(id);
                            optimizer.minCut(this.SOURCE, this.SINK).forEach((node) => {
                                if (node < this.target.length)
                                    this.target[node].setLabel(label);
                            });
                        }
                        // Assign 0 to unlabeled segments
                        var label = new Label(0);
                        for (var k in this.target) {
                            if (!this.target[k].labeled())
                                this.target[k].setLabel(label);
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
            //if (x < Math.pow(10, -10))
            //    return 0;
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
            if (Math.pow(this.parameters.max_prox, 2) < s1.center().norm(s2.center()))
                return 0;
            else {
                var value = 1;
                Features.forEach((feature) => {
                    if (this.parameters.feature_on[feature])
                        value *= this.fall_off(this.value(feature, s1, s2), feature, false);
                });
                if (value / this.parameters.default_energy < 1)
                    return 0;
                return Math.round(value / this.parameters.default_energy);
            }
        }

        private data_term(s1: Segment, segments: Segments): number {
            var max_affinity = this.parameters.default_energy, affinity: number;
            segments.forEach((segment) => {
                affinity = 1;
                Features.forEach((feature) => {
                    if (this.parameters.feature_on[feature])
                        affinity *= this.fall_off(this.value(feature, s1, segment), feature, true);
                });
                max_affinity = Math.max(max_affinity, affinity);
            });
            return Math.round(this.parameters.ramda * max_affinity / this.parameters.default_energy);
        }

        private join(source: Segments[], excludedIndex: number): Segments {
            var connected: Segments = [];
            for (var index = 0; index < source.length; index++)
                if (index != excludedIndex)
                    Array.prototype.push.apply(connected, this.seeds[index]);
            return connected;
        }
    }
}
