"use strict"

module Cv {

    export type Label = number;
    export var None: Label = -1;

    interface IColor {
    }

    interface Color extends IColor {
        new (values: number[]): Color;
    }

    export class Rgb implements IColor {
        public static white = new Rgb([255, 255, 255]);
        public static black = new Rgb([0, 0, 0]);
        public static red = new Rgb([255, 0, 0]);
        public static blue = new Rgb([0, 0, 255]);
        public static lime = new Rgb([0, 255, 0]);
        public static yellow = new Rgb([255, 255, 0]);
        public static aqua = new Rgb([0, 255, 255]);
        public static fuchsia = new Rgb([255, 0, 255]);
        public static green = new Rgb([0, 128, 0]);
        public static navy = new Rgb([0, 0, 128]);
        public static standards = ['red', 'blue', 'lime', 'yellow', 'aqua', 'fuchsia', 'green', 'navy'];

        public r: number;
        public b: number;
        public g: number;

        constructor(values: number[]) {
            this.r = values[0];
            this.g = values[1];
            this.b = values[2];
        }

        is(rgb: Rgb): boolean {
            return this.r == rgb.r && this.g == rgb.g && this.b == rgb.b;
        }

        // Clone RGB
        clone(): Rgb {
            return new Rgb([this.r, this.g, this.b]);
        }

        // Add each value
        add(color: Rgb): Rgb {
            this.r += color.r;
            this.g += color.g;
            this.b += color.b;
            return this;
        }

        // Subtract each value
        sub(color: Rgb): Rgb {
            this.r -= color.r;
            this.g -= color.g;
            this.b -= color.b;
            return this;
        }
        
        // Multiply each value
        multiply(num: number): Rgb {
            this.r += num;
            this.g += num;
            this.b += num;
            return this;
        }

        static fromString(name: string): Rgb {
            switch (name) {
                case 'red': return Rgb.red; break;
                case 'blue': return Rgb.blue; break;
                case 'lime': return Rgb.lime; break;
                case 'yellow': return Rgb.yellow; break;
                case 'aqua': return Rgb.aqua; break;
                case 'fuchsia': return Rgb.fuchsia; break;
                case 'green': return Rgb.green; break;
                case 'navy': return Rgb.navy; break;
            }
        }
    }

    // 2D Point
    export class Point {

        public static Origin = new Point(0, 0);
        public static Up = new Point(0, -1);
        public static UpRight = new Point(1, -1);
        public static Right = new Point(1, 0);
        public static DownRight = new Point(1, 1);
        public static Down = new Point(0, 1);
        public static DownLeft = new Point(-1, 1);
        public static Left = new Point(-1, 0);
        public static UpLeft = new Point(-1, -1);
        public static None = new Point(Infinity, Infinity);

        constructor(public x: number, public y: number) {
        }
        
        is(point: Point): boolean {
            return this.x == point.x && this.y == point.y;
        }

        clone(): Point {
            return new Point(this.x, this.y);
        }

        // Add each value
        add(point: Point): Point {
            this.x += point.x;
            this.y += point.y;
            return this;
        }
        
        // Subtract each value
        sub(point: Point): Point {
            this.x -= point.x;
            this.y -= point.y;
            return this;
        }

        // Multiply each value
        multiply(scale: number): Point {
            this.x *= scale;
            this.y *= scale;
            return this;
        }

        innerProduct(vector: Point): number {
            return this.x * vector.x + this.y * vector.y;
        }

        // Distance from the give point
        norm(point: Point = Point.Origin): number {
            return Math.sqrt(Math.pow(this.x - point.x, 2) + Math.pow(this.y - point.y, 2));
        }

        normalize(): Point {
            return (this.norm() == 0) ? this : this.multiply(1 / this.norm());
        }

        toString(): string {
            return "(" + this.x + ", " + this.y + ")";
        }
    }

    //セグメント
    export class Segment {

        protected _label: Label = None;

        // Initialized by a start point and an end point
        constructor(public start: Point = Point.None, public end: Point = Point.None) {
        }

        // Center point
        center(): Point {
            return this.start.clone().add(this.end).multiply(0.5);
        }

        direction(): Point {
            return this.end.clone().sub(this.start).normalize();
        }

        label(): Label {
            return this._label;
        }

        labeled(): boolean {
            return this._label != None;
        }

        setLabel(newLabel: Label): void {
            this._label = newLabel;
        }

        toString(): string {
            return "[ " + this.start.toString() + " ~ " + this.end.toString() + ": " + this._label + " ]";
        }

    }

    // Image as a matrix
    export class Mat<T extends IColor> {
        public width: number;
        public height: number;
        // Pixel values
        public data: Uint8Array;

        protected point2Index(point: Point): number {
            return point.y * this.width + point.x;
        }

        protected index2Point(index: number): Point {
            return new Point(index % this.width,(index - index % this.width) / this.width);
        }

        constructor();
        constructor(width: number, height: number, data: number[]);
        constructor(width: number, height: number, value: T);
        // Cast from ImageData
        constructor(imageData: ImageData);
        // Dummy for overloading
        constructor(arg1?: any, arg2?: number, arg3?: any) {
            if (!arg1) {
                this.width = 0;
                this.height = 0;
            } else if (arg1 instanceof ImageData) {
                this.width = arg1.width;
                this.height = arg1.height;
                this.data = arg1.data;
            } else if (arg3 instanceof Array) {
                this.width = arg1;
                this.height = arg2;
                this.data = arg3;
            } else {
                this.width = arg1;
                this.height = arg2;
                this.data = new Uint8Array(this.width * this.height * 4);
                this.forPixels(this,() => arg3);
            }
        }

        clone(): Mat<T> {
            var newData: number[] = [];
            for (var i = 0; i < this.data.length; i++)
                newData.push(this.data[i]);
            return new Mat<T>(this.width, this.height, newData);
        }

        // Cast for ImageData
        copyTo(imageData: ImageData): void {
            for (var i = 0; i < this.data.length; i++)
                imageData.data[i] = this.data[i];
        }

        isInside(point: Point): boolean {
            return 0 < point.x && 0 < point.y && point.x < this.width && point.y < this.height;
        }

        // The pixel value at the given point
        at(point: Point): T;
        // Set the pixel value to the given point
        at(point: Point, value: T): void;
        // The pixel value at the given index
        at(index: number): T;
        // Set the pixel value to the given index
        at(index: number, value: T): void;
        // Dummy for overloading
        at(arg1: any, arg2?: any): any {
            // if a point given, get index
            var index: number = (arg1 instanceof Point) ? this.point2Index(arg1) : arg1;
            if (arg2 instanceof Rgb) {
                // Set values
                this.data[index * 4] = arg2.r;
                this.data[index * 4 + 1] = arg2.g;
                this.data[index * 4 + 2] = arg2.b;
                this.data[index * 4 + 3] = 255;
            } else {
                // Return values
                return new Rgb([this.data[index * 4], this.data[index * 4 + 1], this.data[index * 4 + 2]]);
            }
        }

        //Draw a segment by a color
        draw(segment: Segment, value: T): void {
            var direction = segment.end.clone().sub(segment.start);
            direction.multiply(1 / (direction.x == 0 ? direction.y == 0 ? 1 : Math.abs(direction.y) : Math.abs(direction.x)));
            for (var p: Point = segment.start.clone(); !p.is(segment.end); p.add(direction))
                this.at(p, value);
            this.at(p, value);
        }

        // Apply a process to the image with raster scanning
        forPixels(output: Mat<T>, handler: (value: T) => T): void;
        forPixels(handler: (value: T) => void): void;
        // Dummy for overloading
        forPixels(arg1: any, arg2?: any) {
            if (arg1 instanceof Mat) {
                for (var index = 0; index < this.width * this.height; index++)
                    arg1.at(index, arg2(this.at(index)));
            } else {
                for (var index = 0; index < this.width * this.height; index++)
                    arg1(this.at(index));
            }
        }

        // Apply a process to the image with raster scanning
        forPixelsWithPoint(output: Mat<T>, handler: (point: Point, value: T) => T): void;
        forPixelsWithPoint(handler: (point: Point, value: T) => void): void;
        // Dummy for overloading
        forPixelsWithPoint(arg1: any, arg2?: any) {
            if (arg1 instanceof Mat) {
                for (var index = 0; index < this.width * this.height; index++)
                    arg1.at(index, arg2(this.index2Point(index), this.at(index)));
            } else {
                for (var index = 0; index < this.width * this.height; index++)
                    arg1(this.index2Point(index), this.at(index));
            }
        }

        // Dummy for overloading
        forInnerPixels(handler: (index: number) => void): void {
            for (var index = this.width; index < this.width * this.height - this.width; index++)
                if (0 < index % this.width && index % this.width < this.width - 1)
                    handler(index);
        }

        toString(): string {
            var str = "";
            for (var i = 0; i < this.data.length; i++)
                str += String(this.data[i]) + ", ";
            return str;
        }

    }

    export class Processor {

        // Invert input to output
        static invert(input: Mat<Rgb>, output: Mat<Rgb>) {
            input.forPixels(output,(value: Rgb) => new Rgb([255 - value.r, 255 - value.g, 255 - value.b]));
        }

        // Binarize input to output using threshold value
        static binarize(input: Mat<Rgb>, output: Mat<Rgb>, threshold: number): void {
            input.forPixels(output,(value: Rgb) => (value.r < threshold && value.g < threshold && value.b < threshold) ? Rgb.black : Rgb.white);
        }

        // Convert input to output as a grayscale
        static convertToGray(input: Mat<Rgb>, output: Mat<Rgb>) {
            input.forPixels(output,(value: Rgb): Rgb => {
                var newValue = value.r * 0.2126 + value.g * 0.7152 + value.b * 0.0722;
                return new Rgb([newValue, newValue, newValue]);
            });
        }

        // Extract edges from input to output
        static extractEdge(input: Mat<Rgb>, output: Mat<Rgb>) {
            input.forPixelsWithPoint(output,(point: Point, value: Rgb): Rgb => {
                return new Rgb([127, 127, 127])
                    .sub(input.at(point.clone().add(Point.UpLeft)))
                    .sub(input.at(point.clone().add(Point.Up)))
                    .sub(input.at(point.clone().add(Point.UpRight)))
                    .sub(input.at(point.clone().add(Point.Left)))
                    .sub(value.clone().multiply(8))
                    .sub(input.at(point.clone().add(Point.Right)))
                    .sub(input.at(point.clone().add(Point.DownLeft)))
                    .sub(input.at(point.clone().add(Point.Down)))
                    .sub(input.at(point.clone().add(Point.DownRight)))
            });
        }

        // Thinning by Zhang-Suen
        static thinning(input: Mat<Rgb>, output: Mat<Rgb>, directionMap: Mat<Rgb>) {
            const w = input.width;
            const h = input.height;
            var outputData = output.data;
            var directionData = directionMap.data;
            input.forPixels(output, value => value);
            input.forPixels(directionMap, value => Rgb.white);
            var rAry: boolean[] = [];
            var bFlag = true;

            for (var k = 0; bFlag; k++) {
                bFlag = !!(k & 1);
                for (var i: number = 0; i < outputData.length / 4; i++)
                    rAry[i] = outputData[i * 4] == 0;
                output.forInnerPixels((index) => {
                    if (!rAry[index])
                        return;
                    // [p[7] p[0] p[1]]
                    // [p[6] p[@] p[2]]
                    // [p[5] p[4] p[3]]
                    var p: boolean[] = [];
                    p[0] = rAry[index - w];
                    p[1] = rAry[index - w + 1];
                    p[2] = rAry[index + 1];
                    p[3] = rAry[index + w + 1];
                    p[4] = rAry[index + w];
                    p[5] = rAry[index + w - 1];
                    p[6] = rAry[index - 1];
                    p[7] = rAry[index - w - 1];
                    const a = p.filter((v, i) => !p[i] && p[i + 1 < 8 ? i + 1 : 0]).length;
                    const b = p.filter(v => v).length;
                    if (a == 1 && 2 <= b && b <= 6) {
                        if ((!(k & 1) && !(p[0] && p[2] && p[4]) && !(p[2] && p[4] && p[6]))
                            || ((k & 1) && !(p[0] && p[2] && p[6]) && !(p[0] && p[4] && p[6]))) {
                            outputData[index * 4] = outputData[index * 4 + 1] = outputData[index * 4 + 2] = 255;
                            bFlag = true;
                        }
                    }
                });
                for (var i: number = 0; i < outputData.length / 4; i++) {
                    if (rAry[i] == (outputData[i * 4] != 0)) {
                        var p: boolean[] = [];
                        p[0] = outputData[(i - w) * 4] == 0;
                        p[1] = outputData[(i - w + 1) * 4] == 0;
                        p[2] = outputData[(i + 1) * 4] == 0;
                        p[3] = outputData[(i + w + 1) * 4] == 0;
                        p[4] = outputData[(i + w) * 4] == 0;
                        p[5] = outputData[(i + w - 1) * 4] == 0;
                        p[6] = outputData[(i - 1) * 4] == 0;
                        p[7] = outputData[(i - w - 1) * 4] == 0;
                        var q = p.lastIndexOf(true);
                        directionData[i * 4] = directionData[i * 4 + 1] = directionData[i * 4 + 2] = q;
                    }
                }
            }
        }

        // Restore labels by a thinning direction map
        static restore(source: Mat<Rgb>, directionMap: Mat<Rgb>) {
            var nonvalid: Point[] = [];
            directionMap.forPixelsWithPoint((point, direction) => {
                if (direction.r < 8 && source.at(point).is(Rgb.white)) {
                    var p = point.clone();
                    var distColor = Rgb.white;
                    while (distColor.is(Rgb.white)) {
                        var nextDirectionPoint = this.direction2point(directionMap.at(p).r);
                        if (nextDirectionPoint.is(Point.None)) {
                            nonvalid.push(p);
                            return;
                        }
                        p.add(nextDirectionPoint);
                        distColor = source.at(p);
                        if (!distColor.is(Rgb.white)) {
                            var p2 = point.clone();
                            while (source.at(p2).is(Rgb.white)) {
                                source.at(p2, distColor);
                                p2.add(this.direction2point(directionMap.at(p2).r));
                            }
                        }
                    }
                }
            });
        }

        protected static direction2point(direction: number): Point {
            switch (direction) {
                case 0: return Point.Up;
                case 1: return Point.UpRight;
                case 2: return Point.Right;
                case 3: return Point.DownRight;
                case 4: return Point.Down;
                case 5: return Point.DownLeft;
                case 6: return Point.Left;
                case 7: return Point.UpLeft;
                default: return Point.None;
            }
        }

        // Vectorize input
        static vectorize(mat: Mat<Rgb>, segments: Array<Segment>) {
            const directions: Array<Point> = [Point.Right, Point.DownRight, Point.Down, Point.DownLeft];
            var remaining = mat.clone();
            remaining.forPixelsWithPoint((start: Point, value: Rgb) => {
                if (remaining.at(start).is(Rgb.black)) {
                    var found = false;
                    directions.forEach((direction) => {
                        var end = start.clone();
                        remaining.at(end, Rgb.black);
                        while (remaining.at(end).is(Rgb.black)) {
                            remaining.at(end, Rgb.white);
                            end.add(direction);
                            if (!remaining.isInside(end))
                                break;
                        }
                        end.sub(direction);
                        if (!start.is(end)) {
                            segments.push(new Segment(start, end));
                            found = true;
                        }
                    });
                    if (!found)
                        segments.push(new Segment(start, start));
                }
            });
        }

    }

}