/// <reference path="core.ts" />

"use strict"

module Labeler {

    enum Feature {
        Proximity,
        Direction
    };
    var Features: Array<Feature> = [Feature.Proximity, Feature.Direction];

    export class Parameters {
        default_energy: number;
        ramda: number; // デ－タ項と平滑化項の係数
        feature_on: boolean[]; // 特徴量が有効かどうか
        sigma_smooth: number[]; // 平滑化項の調整のための分散
        sigma_data: number[]; // データ項の調整のための分散
        max_prox: number; // セグメント間で許容される最大距離
    }

    export class NearestScribbles {

        constructor(private seeds: Array<Segments>, public target: Array<Segment>) {
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
        protected parameters: Parameters;
        protected firstTIme = true;

        constructor(private seeds: Array<Segments>, public target: Array<Segment>) {
        }

        run() {
            var segments_count = this.target.length;
            this.parameters.max_prox = this.parameters.sigma_smooth[Feature.Proximity] * Math.sqrt(Math.log(this.parameters.default_energy * this.parameters.sigma_smooth[Feature.Proximity]));
            var confidence: number[];
            var cap_source: number[], cap_sink: number[];
            if (this.firstTIme) {
                this.firstTIme = false;
            }
            switch (this.seeds.length) {
                case 0:	//マウス入力なし
                    {
                        var flowNetwork = new FlowNetwork();
                        for (var i = 0; i < segments_count; i++) {
                            flowNetwork.addEdge(2, 3, 3);
                            var max = flowNetwork.maxFlow('s', 't');
                            //	graph.add_node();
                            //            cap_source.push_back(this.dataTerm());
                            //            cap_sink.push_back(this.dataTerm());
                            //	graph.add_tweights(i, cap_source[i], cap_sink[i]);
                            //            for (var j = 0; j < i; j++)
                            //		graph.add_edge(i, j, smooth(i, j), smooth(i, j));
                        }
                        //graph.maxflow();
                        //ラベルを振る
                        for (var i = 0; i < segments_count; i++) {
                            if (!this.target[i].labeled()) {
                                //this.target[i].setLabel(graph.what_segment(i) == GraphType::SOURCE ? (Label)0 : Label::None);
                            }
                        }
                        break;
                    }
                case 1:	//マウス入力が１つの場合
                    {
                        //for (var i = 0; i < segments_count; i++) {
                        //    if (4 < this.dataTerm(this.target[i], get_stroke_with(this.seeds, 0)))
                        //        this.target[i].setLabel(new Label(0));
                        //}
                        break;
                    }
                default: // マウス入力が２つ以上の場合
                    {
                        //for (var l = count_labels(this.seeds) - 1; 0 < l; l--) {
                        //    if (_adaptive_prox)
                        //        this.parameters.sigma_data[Feature.Proximity] = get_stroke_with(this.seeds, l).length() / 4 / 2;
                        //    var unlabeled_num = _seg_ptrs.size();
                        //GraphType *graph = new GraphType(unlabeled_num, unlabeled_num * unlabeled_num);
                        //for (var i = 0; i < _seg_ptrs.size(); i++) {
                        //	graph.add_node();
                        //            cap_source.push_back(this.dataTerm(_seg_ptrs.at(i), get_stroke_with(seeds, l)));
                        //            cap_sink.push_back(this.dataTerm(_seg_ptrs.at(i), get_stroke_with(seeds, 0, l - 1)));
                        //	graph.add_tweights(i, cap_source.back(), cap_sink.back());
                        //            for (var j = 0; j < i; j++) {
                        //                var cap = smoothness_term(_seg_ptrs.at(i), _seg_ptrs.at(j));
                        //		graph.add_edge(i, j, cap, cap);
                        //            }
                        //}
                        //graph.maxflow();
                        //	auto itr2 = _seg_ptrs.begin();
                        //        var node_i = 0;
                        //        while (itr2 != _seg_ptrs.end()) {
                        //		if (graph.what_segment(node_i++) == GraphType::SOURCE) {
                        //                (*itr2).setLabel(l);
                        //                itr2 = _seg_ptrs.erase(itr2);
                        //		}
                        //		else {
                        //                itr2++;
                        //            }
                        //        }
                        //        delete graph;
                        //        _data_source.push_back(cap_source);
                        //        _data_sink.push_back(cap_sink);
                        //        write_log_data(count_labels(seeds) - l - 1);
                        //    }
                        ////まだラベルがないセグメントはラベル0とする
                        //for (auto &seg_ptr : _seg_ptrs) {
                        //        seg_ptr.setLabel(0);
                        //    }
                        //    // 確信度を設定する
                        //    for (var i = 0; i < segments_count; i++) {
                        //        if (_confidence[i] == 0 && (cap_source[i] != 4 || cap_sink[i] != 4))
                        //            _confidence[i] = 1;
                        //        if (_confidence[i] == 0)
                        //            this.target[i].set_confidence(0);
                        //    }
                        //    // 確信度が低い部分を最近傍で近似する
                        //    for (var i = 0; i < segments_count; i++) {
                        //        if (_confidence[i] == 0) {
                        //            Segment * seg;
                        //            Coodinate < double> pos = this.target[i].position();
                        //		double dist = (output().mat.cols + output().mat.rows) * 2;
                        //            for (var j = 0; j < segments_count; j++) {
                        //                if (norm(output().strokes.segment(j).position() - pos) < dist && output().strokes.segment(j).labeled()) {
                        //                    seg = output().strokes.segment(j);
                        //                    dist = norm(output().strokes.segment(j).position() - pos);
                        //                }
                        //            }
                        //            this.target[i].setLabel(seg.label());
                        //}
                    }
            }
        }

        value(type: Feature, s1: Segment, s2: Segment): number {
            switch (type) {
                case Feature.Proximity:
                    return s1.center().norm(s2.center());
                case Feature.Direction:
                    return 1 - Math.abs(s1.direction().innerProduct(s2.direction()));
            }
        }

        fall_off(x: number, type: Feature, is_data_term: boolean): number {
            if (is_data_term) {
                if (type == Feature.Proximity)
                    return Math.exp(-x * x / Math.pow(this.parameters.sigma_data[type], 2.0)) / this.parameters.sigma_data[type];
                return Math.exp(-x * x / Math.pow(this.parameters.sigma_data[type], 2.0));
            }
            else {
                return Math.exp(-x * x / Math.pow(this.parameters.sigma_smooth[type], 2.0));
            }
        }

        smoothness_term(s1: Segment, s2: Segment): number {
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

        dataTerm(s1: Segment, segments: Segments): number {
            var max_affinity = this.parameters.default_energy, affinity;
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
