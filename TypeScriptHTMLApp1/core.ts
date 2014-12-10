"use strict"

module Core {

    export class Label {
        constructor(public id: number) {
        }
        toNumber(): number {
            return this.id;
        }
    }

    export class Rgb {
        public static white = new Rgb(255, 255, 255);
        public static black = new Rgb(0, 0, 0);
        constructor(public r: number, public g: number, public b: number) {
        }
        is(rgb: Rgb): boolean {
            return this.r == rgb.r && this.g == rgb.g && this.b == rgb.b;
        }
    }

    export class Rgba {
        constructor(public r: number, public g: number, public b: number, public a: number) {
        }
    }

    export class Point {
        constructor(public x: number, public y: number) {
        }
        add(point: Point) {
            this.x += point.x;
            this.y += point.y;
        }
        clone(): Point {
            return new Point(this.x, this.y);
        }
        inverse(): Point {
            return new Point(-this.x, -this.y);
        }
        is(point: Point): boolean {
            return this.x == point.x && this.y == point.y;
        }
    }

    export class Segment {
        constructor(public start: Point, public end: Point) {
        }
    }

    export class Stroke {
        constructor(public points?: Array<Point>) {
        }
        clear(): void {
            this.points.length = 0;
        }
        clone(): Stroke {
            return new Stroke(this.points);
        }
        empty(): boolean {
            return this.points.length == 0;
        }
        segments(): Array<Segment> {
            var segments: Array<Segment>;
            var first: boolean = true;
            var previous: Point;
            this.points.forEach((point) => {
                if (first) {
                    first = false;
                } else {
                    segments.push(new Segment(previous, point));
                }
                previous = point;
            });
            return segments;
        }
    }

    export class Mat {

        public width: number;
        public height: number;
        public data: Uint8Array;

        constructor(width: number, height: number, data: Uint8Array);
        constructor(imageData: ImageData);
        constructor(arg1: any, arg2?: number, arg3?: Uint8Array) {
            if (arg1 instanceof ImageData) {
                this.width = arg1.width;
                this.height = arg1.height;
                this.data = arg1.data;
            } else {
                this.width = arg1;
                this.height = arg2;
                this.data = arg3;
            }
        }

        copyTo(imageData: ImageData) {
            for (var i: number = 0; i < this.data.length; i++)
                imageData.data[i] = this.data[i];
        }

        at(point: Point): Rgb;
        at(point: Point, value: Rgb);
        at(index: number): Rgb;
        at(index: number, value: Rgb);
        at(arg1: any, arg2?: any): Rgb {
            var index: number = (arg1 instanceof Point) ? this.point2Index(arg1) : arg1;
            if (arg2 instanceof Rgb) {
                this.data[index * 4] = arg2.r;
                this.data[index * 4 + 1] = arg2.g;
                this.data[index * 4 + 2] = arg2.b;
            } else {
                return new Rgb(this.data[index * 4], this.data[index * 4 + 1], this.data[index * 4 + 2]);
            }
        }

        clone(): Mat {
            return new Mat(this.width, this.height, this.data);
        }

        forPixels(handler: (point: Point, value: Rgb) => void) {
            for (var y = 0; y < this.height; y++) {
                for (var x = 0; x < this.width; x++) {
                    handler(new Point(x, y), this.at(new Point(x, y)));
                }
            }
        }

        isInside(point: Point): boolean {
            return 0 < point.x && 0 < point.y && point.x < this.width && point.y < this.height;
        }

        private point2Index(point: Point): number {
            return point.y * this.width + point.x;
        }

        private index2Point(index: number): Point {
            return new Point(index % this.width, (index - index % this.width) / this.width);
        }

    }

}
