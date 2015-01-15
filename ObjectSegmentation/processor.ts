/// <reference path="core.ts" />

import Segment = Core.Segment;
import Segments = Core.Segments;
import Point = Core.Point;
import Mat = Core.Mat;

"use strict"

module Core {

    export class Processor {

        // Invert input to output
        static invert(input: Mat<Rgb>, output: Mat<Rgb>) {
            input.forPixels(output, (value: Rgb) => new Rgb(255 - value.r, 255 - value.g, 255 - value.b));
        }

        // Binarize input to output using threshold value
        static binarize(input: Mat<Rgb>, output: Mat<Rgb>, threshold: number) {
            input.forPixels(output, (value: Rgb) => (value.r < threshold && value.g < threshold && value.b < threshold) ? Rgb.black : Rgb.white);
        }

        // Convert input to output as a grayscale
        static convertToGray(input: Mat<Rgb>, output: Mat<Rgb>) {
            input.forPixels(output, (value: Rgb): Rgb => {
                var grayValue = value.r * 0.2126 + value.g * 0.7152 + value.b * 0.0722;
                return new Rgb(grayValue, grayValue, grayValue);
            });
        }

        // Extract edges from input to output
        static extractEdge(input: Mat<Rgb>, output: Mat<Rgb>) {
            input.forPixelsWithPoint(output, (point: Point, value: Rgb): Rgb => {
                return new Rgb(127, 127, 127)
                    .add(input.at(point.added(new Point(-1, -1))).invert())
                    .add(input.at(point.added(new Point(0, -1))).invert())
                    .add(input.at(point.added(new Point(+1, -1))).invert())
                    .add(input.at(point.added(new Point(-1, 0))).invert())
                    .add(value.multiplied(8))
                    .add(input.at(point.added(new Point(+1, 0))).invert())
                    .add(input.at(point.added(new Point(-1, +1))).invert())
                    .add(input.at(point.added(new Point(0, +1))).invert())
                    .add(input.at(point.added(new Point(+1, +1))).invert())
            });
        }

        // Thinning by Zhang-Suen from http://www.hundredsoft.jp/win7blog/log/eid119.html
        static thinning(input: Mat<Rgb>, output: Mat<Rgb>, directionMap: Mat<Rgb>) {
            var w = input.width;
            var h = input.height;
            var outputData = output.data;
            input.forPixels(output, value => value);
            var rAry: boolean[] = [];
            var bFlag = true;

            for (var k = 0; bFlag; k++) {
                bFlag = !!(k & 1);
                for (var i: number = 0; i < outputData.length / 4; i++)
                    rAry[i] = outputData[i * 4] == 0;
                output.forInnerPixels((index) => {
                    if (rAry[index])
                        return;
                    // [p9 p2 p[1]]
                    // [p8 p1 p[2]]
                    // [p[5] p[4] p[3]]
                    var p: boolean[] = [];
                    p[0] = !rAry[index - w];
                    p[1] = !rAry[index - w + 1];
                    p[2] = !rAry[index + 1];
                    p[3] = !rAry[index + w + 1];
                    p[4] = !rAry[index + w];
                    p[5] = !rAry[index + w - 1];
                    p[6] = !rAry[index - 1];
                    p[7] = !rAry[index - w - 1];
                    var a = 0;
                    for (var i = 0; i < 8; i++)
                        if (!p[i] && p[i + 1 < 8 ? i + 1 : 0])
                            a++;
                    var b = 0;
                    for (var i = 0; i < 8; i++)
                        b += p[i] ? 1 : 0;
                    if (a == 1 && 2 <= b && b <= 6) {
                        if ((!(k & 1) && !(p[0] && p[2] && p[4]) && !(p[2] && p[4] && p[6]))
                            || ((k & 1) && !(p[0] && p[2] && p[6]) && !(p[0] && p[4] && p[6]))) {
                            outputData[index * 4] = outputData[index * 4 + 1] = outputData[index * 4 + 2] = 0;
                            bFlag = true;
                        }
                    }
                });
            }
        }

        // Vectorize input
        static vectorize(mat: Mat<Rgb>, segments: Array<Segment>) {
            var directions: Array<Point> = [new Point(1, 0), new Point(1, 1), new Point(0, 1), new Point(-1, 1)];
            var remaining: Mat<Rgb> = mat.clone();
            var end: Point;
            remaining.forPixelsWithPoint((start: Point, value: Rgb) => {
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
                        end.add(direction.inverted());
                        if (!start.is(end)) {
                            segments.push(new Segment(start, end));
                        }
                    });
                }
            });
        }

    }
}
