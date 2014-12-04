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
        index(width: number): number {
            return this.y * width + this.x;
        }
    }

    export interface Line extends Array<Point> { }

    export interface Stroke extends Array<Line> { }


}
