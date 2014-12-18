/// <reference path="core.ts" />

"use strict"

module Core {

    export class Processor {

        // Invert input to output
        static invert(input: Mat, output: Mat) {
            input.forPixels(output, (point: Point, value: Rgb) => new Rgb(255 - value.r, 255 - value.g, 255 - value.b));
        }

        // Binarize input to output using threshold value
        static binarize(input: Mat, output: Mat, threshold: number) {
            input.forPixels(output, (point: Point, value: Rgb) => new Rgb(value.r < threshold ? 0 : 255, value.g < threshold ? 0 : 255, value.b < threshold ? 0 : 255));
        }

        // Convert input to output as a grayscale
        static convertToGray(input: Mat, output: Mat) {
            input.forPixels(output, (point: Point, value: Rgb): Rgb => {
                var grayValue = value.r * 0.2126 + value.g * 0.7152 + value.b * 0.0722;
                return new Rgb(grayValue, grayValue, grayValue);
            });
        }

        // Extract edges from input to output
        static extractEdge(input: Mat, output: Mat) {
            input.forPixels(output, (point: Point, value: Rgb): Rgb => {
                return new Rgb(127, 127, 127)
                    .added(input.at(point.added(new Point(-1, -1))).inverse())
                    .added(input.at(point.added(new Point(0, -1))).inverse())
                    .added(input.at(point.added(new Point(+1, -1))).inverse())
                    .added(input.at(point.added(new Point(-1, 0))).inverse())
                    .added(value.multiplied(8))
                    .added(input.at(point.added(new Point(+1, 0))).inverse())
                    .added(input.at(point.added(new Point(-1, +1))).inverse())
                    .added(input.at(point.added(new Point(0, +1))).inverse())
                    .added(input.at(point.added(new Point(+1, +1))).inverse())
            });
        }

        // Thinning by Zhang-Suen from http://www.hundredsoft.jp/win7blog/log/eid119.html
        static thinning(input: Mat, output: Mat) {
            var w = input.width;
            var h = input.height;
            var inputData = input.data;
            var outputData = output.data;
            var x, y, rAry;
            for (var i: number = 0; i < outputData.length; i++)
                outputData[i] = inputData[i];
            var bFlag = true;

            for (var k = 0; k < 100 && bFlag; k++) {
                if (!(k & 1)) {
                    bFlag = false;
                }
                rAry = new Uint8Array(outputData);
                for (y = 1; y < h - 1; y++) {
                    for (x = 1; x < w - 1; x++) {
                        var i = (y * w + x) * 4;
                        if (rAry[i]) {
                            var a, b, p1, p2, p3, p4, p5, p6, p7, p8, p9;
                            // [p9 p2 p3]
                            // [p8 p1 p4]
                            // [p7 p6 p5]
                            p1 = 1;
                            p2 = (rAry[i - w * 4]) ? 1 : 0;
                            p3 = (rAry[i - w * 4 + 4]) ? 1 : 0;
                            p4 = (rAry[i + 4]) ? 1 : 0;
                            p5 = (rAry[i + w * 4 + 4]) ? 1 : 0;
                            p6 = (rAry[i + w * 4]) ? 1 : 0;
                            p7 = (rAry[i + w * 4 - 4]) ? 1 : 0;
                            p8 = (rAry[i - 4]) ? 1 : 0;
                            p9 = (rAry[i - w * 4 - 4]) ? 1 : 0;
                            a = 0;
                            if (!p2 && p3) { a++; }
                            if (!p3 && p4) { a++; }
                            if (!p4 && p5) { a++; }
                            if (!p5 && p6) { a++; }
                            if (!p6 && p7) { a++; }
                            if (!p7 && p8) { a++; }
                            if (!p8 && p9) { a++; }
                            if (!p9 && p2) { a++; }
                            b = p2 + p3 + p4 + p5 + p6 + p7 + p8 + p9;

                            if (a == 1 && 2 <= b && b <= 6) {
                                if ((!(k & 1) && p2 * p4 * p6 == 0 && p4 * p6 * p8 == 0)
                                    || ((k & 1) && p2 * p4 * p8 == 0 && p2 * p6 * p8 == 0)) {
                                    outputData[i] = outputData[i + 1] = outputData[i + 2] = 0;
                                    bFlag = true;
                                }
                            }
                        }
                    }
                }
            }
        }

        // Vectorize input
        static vectorize(mat: Mat, segments: Array<Segment>) {
            var directions: Array<Point> = [new Point(1, 0), new Point(1, 1), new Point(0, 1), new Point(-1, 1)];
            var remaining: Mat = mat.clone();
            var end: Point;
            remaining.forPixels((start: Point, value: Rgb) => {
                if (remaining.at(start).is(Rgb.black)) {
                    directions.forEach((direction) => {
                        end = start.clone();
                        remaining.at(end, Rgb.black);
                        while (remaining.at(end).is(Rgb.black)) {
                            remaining.at(end, Rgb.white);
                            end.add(direction);
                            if (!remaining.isInside(end))

                                break;
                        }
                        end.add(direction.inverse());
                        if (!start.is(end)) {
                            segments.push(new Segment(start, end));
                        }
                    });
                }
            });
        }

    }
}
