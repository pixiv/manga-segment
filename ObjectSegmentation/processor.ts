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
            input.forPixels(output, (value: Rgb) => new Rgb([255 - value.r, 255 - value.g, 255 - value.b]));
        }

        // Binarize input to output using threshold value
        static binarize(input: Mat<Rgb>, output: Mat<Rgb>, threshold: number): void {
                input.forPixels(output, (value: Rgb) => (value.r < threshold && value.g < threshold && value.b < threshold) ? Rgb.black : Rgb.white);
        }

        // Convert input to output as a grayscale
        static convertToGray(input: Mat<Rgb>, output: Mat<Rgb>) {
            input.forPixels(output, (value: Rgb): Rgb => {
                var newValue = value.r * 0.2126 + value.g * 0.7152 + value.b * 0.0722;
                return new Rgb([newValue, newValue, newValue]);
            });
        }

        // Extract edges from input to output
        static extractEdge(input: Mat<Rgb>, output: Mat<Rgb>) {
            input.forPixelsWithPoint(output, (point: Point, value: Rgb): Rgb => {
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

        // Thinning by Zhang-Suen from http://www.hundredsoft.jp/win7blog/log/eid119.html
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
