/// <reference path="core.ts" />

"use strict"

module Core {

    export class Labeler {
        public source: Array<Segment>;
        public seeds: Array<Segment>;

        setNearest(offset: number): void {
            this.source.forEach((segment) => {
                var minNorm: number = -1;
                var nearestSeed;
                this.seeds.forEach((seed) => {
                    if (minNorm < 0 || segment.center().norm(seed.center()) < minNorm) {
                        nearestSeed = seed;
                        minNorm = segment.center().norm(seed.center());
                    }
                });
                if (minNorm < offset)
                    segment.label = nearestSeed.label;
            });
        }
    }
}
