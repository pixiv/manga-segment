/// <reference path="core.ts" />

"use strict"

module Core {

    export class Processor {

        static for_image(imageData: ImageData, handler: (data: Uint8Array, index: number) => void) {
            var w = imageData.width;
            var h = imageData.height;
            var uint8Array = imageData.data;
            for (var y = 1; y < h - 1; y += 1) {
                for (var x = 1; x < w - 1; x += 1) {
                    handler(uint8Array, (y * w + x) * 4);
                }
            }
        }

        //static for_images(input: ImageData, output: ImageData, handler: (value: number) => number) {
        //    var w = input.width;
        //    var h = input.height;
        //    var inputData = input.data;
        //    var outputData = output.data;
        //    for (var y = 1; y < h - 1; y += 1) {
        //        for (var x = 1; x < w - 1; x += 1) {
        //            for (var c = 0; c < 3; c += 1) {
        //                var i = (y * w + x) * 4 + c;
        //                outputData[i] = handler(inputData[i]);
        //            }
        //            outputData[(y * w + x) * 4 + 3] = inputData[(y * w + x) * 4 + 3]
        //        }
        //    }
        //}

        // Invert input to output
        static invert(input: Mat, output: Mat) {
            input.forPixels(output, (point: Point, value: Rgb) => new Rgb(255 - value.r, 255 - value.g, 255 - value.b));
        }

        // Binarize input to output using threshold value
        static binarize(input: Mat, output: Mat, threshold: number) {
            input.forPixels(output, (point: Point, value: Rgb) => new Rgb(value.r < threshold ? 0 : 255, value.g < threshold ? 0 : 255, value.b < threshold ? 0 : 255));
        }

        // Convert input to output as a grayscale
        static toGray(input: Mat, output: Mat) {
            var outputData = output.data;
            this.for_image(input, (data: Uint8Array, index: number) => {
                var g = data[index] * 0.2126 + data[index + 1] * 0.7152 + data[index + 2] * 0.0722;
                outputData[index] = outputData[index + 1] = outputData[index + 2] = g;
                outputData[index + 3] = data[index + 3];
            });
        }

        // Extract edges from input to output
        static extractEdge(input: Mat, output: Mat) {
            var w = input.width
            var h = input.height;
            var outputData = output.data;
            this.for_image(input, (data: Uint8Array, index: number) => {
                for (var c = 0; c < 3; c += 1) {
                    var i = index + c;
                    outputData[i] = 127 + -data[i - w * 4 - 4] - data[i - w * 4] - data[i - w * 4 + 4] +
                    -data[i - 4] + 8 * data[i] - data[i + 4] +
                    -data[i + w * 4 - 4] - data[i + w * 4] - data[i + w * 4 + 4];
                }
                outputData[i + 3] = 255; // alpha
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
            var distpt: Point;
            var originalImage: Mat = mat.clone();
            var width: number = mat.width;
            var directions: Array<Point> = [new Point(1, 0), new Point(1, 1), new Point(0, 1), new Point(-1, 1)];
            mat.forPixels((point: Point, value: Rgb) => {
                if (originalImage.at(point).is(Rgb.black)) {
                    directions.forEach((direction) => {
                        distpt = point.clone();
                        mat.at(distpt, Rgb.black);
                        while (mat.at(distpt).is(Rgb.black)) {
                            mat.at(distpt, Rgb.white);
                            distpt.add(direction);
                            if (!mat.isInside(distpt))
                                break;
                        }
                        distpt.add(direction.inverse());
                        if (!point.is(distpt)) {
                            segments.push(new Segment(point, distpt));
                        }
                    });
                }
            });
        }
    }
}
