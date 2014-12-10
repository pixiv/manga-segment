/// <reference path="core.ts">
"use strict";
var Core;
(function (Core) {
    var Processor = (function () {
        function Processor() {
        }
        // Copy input to output
        Processor.copy = function (input, output) {
            this.for_images(input, output, function (value) {
                return value;
            });
        };

        Processor.for_image = function (imageData, handler) {
            var w = imageData.width;
            var h = imageData.height;
            var uint8Array = imageData.data;
            for (var y = 1; y < h - 1; y += 1) {
                for (var x = 1; x < w - 1; x += 1) {
                    handler(uint8Array, (y * w + x) * 4);
                }
            }
        };

        Processor.for_images = function (input, output, handler) {
            var w = input.width;
            var h = input.height;
            var inputData = input.data;
            var outputData = output.data;
            for (var y = 1; y < h - 1; y += 1) {
                for (var x = 1; x < w - 1; x += 1) {
                    for (var c = 0; c < 3; c += 1) {
                        var i = (y * w + x) * 4 + c;
                        outputData[i] = handler(inputData[i]);
                    }
                    outputData[(y * w + x) * 4 + 3] = inputData[(y * w + x) * 4 + 3];
                }
            }
        };

        // Invert input to output
        Processor.invert = function (input, output) {
            this.for_images(input, output, function (value) {
                return 255 - value;
            });
        };

        // Binarize input to output using threshold value
        Processor.binarize = function (input, output, threshold) {
            this.for_images(input, output, function (value) {
                return value < threshold ? 0 : 255;
            });
        };

        // Convert input to output as a grayscale
        Processor.toGray = function (input, output) {
            var outputData = output.data;
            this.for_image(input, function (data, index) {
                var g = data[index] * 0.2126 + data[index + 1] * 0.7152 + data[index + 2] * 0.0722;
                outputData[index] = outputData[index + 1] = outputData[index + 2] = g;
                outputData[index + 3] = data[index + 3];
            });
        };

        // Extract edges from input to output
        Processor.extractEdge = function (input, output) {
            var w = input.width;
            var h = input.height;
            var outputData = output.data;
            this.for_image(input, function (data, index) {
                for (var c = 0; c < 3; c += 1) {
                    var i = index + c;
                    outputData[i] = 127 + -data[i - w * 4 - 4] - data[i - w * 4] - data[i - w * 4 + 4] + -data[i - 4] + 8 * data[i] - data[i + 4] + -data[i + w * 4 - 4] - data[i + w * 4] - data[i + w * 4 + 4];
                }
                outputData[i + 3] = 255; // alpha
            });
        };

        // Thinning by Zhang-Suen from http://www.hundredsoft.jp/win7blog/log/eid119.html
        Processor.thinning = function (input, output) {
            var w = input.width;
            var h = input.height;
            var inputData = input.data;
            var outputData = output.data;
            var x, y, rAry;
            for (var i = 0; i < outputData.length; i++)
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
                            if (!p2 && p3) {
                                a++;
                            }
                            if (!p3 && p4) {
                                a++;
                            }
                            if (!p4 && p5) {
                                a++;
                            }
                            if (!p5 && p6) {
                                a++;
                            }
                            if (!p6 && p7) {
                                a++;
                            }
                            if (!p7 && p8) {
                                a++;
                            }
                            if (!p8 && p9) {
                                a++;
                            }
                            if (!p9 && p2) {
                                a++;
                            }
                            b = p2 + p3 + p4 + p5 + p6 + p7 + p8 + p9;

                            if (a == 1 && 2 <= b && b <= 6) {
                                if ((!(k & 1) && p2 * p4 * p6 == 0 && p4 * p6 * p8 == 0) || ((k & 1) && p2 * p4 * p8 == 0 && p2 * p6 * p8 == 0)) {
                                    outputData[i] = outputData[i + 1] = outputData[i + 2] = 0;
                                    bFlag = true;
                                }
                            }
                        }
                    }
                }
            }
        };

        // Vectorize input
        Processor.vectorize = function (mat) {
            var segments;
            var distpt;
            var originalImage = mat.clone();
            var width = mat.width;
            var directions = [new Core.Point(1, 0), new Core.Point(1, 1), new Core.Point(0, 1), new Core.Point(-1, 1)];
            mat.forPixels(function (point, value) {
                if (originalImage.at(point).is(Core.Rgb.black)) {
                    directions.forEach(function (direction) {
                        distpt = point.clone();
                        mat.at(distpt, Core.Rgb.black);
                        while (mat.at(distpt).is(Core.Rgb.black)) {
                            mat.at(distpt, Core.Rgb.white);
                            distpt.add(direction);
                            if (!mat.isInside(distpt))
                                break;
                        }
                        distpt.add(direction.inverse());
                        if (!point.is(distpt)) {
                            segments.push(new Core.Stroke([point, distpt]));
                        }
                    });
                }
            });
            return segments;
        };
        return Processor;
    })();
    Core.Processor = Processor;
})(Core || (Core = {}));
//# sourceMappingURL=processor.js.map
