"use strict";
var Cv;
(function (Cv) {
    Cv.None = -1;
    var Rgb = (function () {
        function Rgb(values) {
            this.r = values[0];
            this.g = values[1];
            this.b = values[2];
        }
        Rgb.prototype.is = function (rgb) {
            return this.r == rgb.r && this.g == rgb.g && this.b == rgb.b;
        };
        // Clone RGB
        Rgb.prototype.clone = function () {
            return new Rgb([this.r, this.g, this.b]);
        };
        // Add each value
        Rgb.prototype.add = function (color) {
            this.r += color.r;
            this.g += color.g;
            this.b += color.b;
            return this;
        };
        // Subtract each value
        Rgb.prototype.sub = function (color) {
            this.r -= color.r;
            this.g -= color.g;
            this.b -= color.b;
            return this;
        };
        // Multiply each value
        Rgb.prototype.multiply = function (num) {
            this.r += num;
            this.g += num;
            this.b += num;
            return this;
        };
        Rgb.fromString = function (name) {
            switch (name) {
                case 'black':
                    return Rgb.black;
                    break;
                case 'red':
                    return Rgb.red;
                    break;
                case 'blue':
                    return Rgb.blue;
                    break;
                case 'lime':
                    return Rgb.lime;
                    break;
                case 'yellow':
                    return Rgb.yellow;
                    break;
                case 'aqua':
                    return Rgb.aqua;
                    break;
                case 'fuchsia':
                    return Rgb.fuchsia;
                    break;
                case 'green':
                    return Rgb.green;
                    break;
                case 'navy':
                    return Rgb.navy;
                    break;
            }
        };
        Rgb.white = new Rgb([255, 255, 255]);
        Rgb.black = new Rgb([0, 0, 0]);
        Rgb.red = new Rgb([255, 0, 0]);
        Rgb.blue = new Rgb([0, 0, 255]);
        Rgb.lime = new Rgb([0, 255, 0]);
        Rgb.yellow = new Rgb([255, 255, 0]);
        Rgb.aqua = new Rgb([0, 255, 255]);
        Rgb.fuchsia = new Rgb([255, 0, 255]);
        Rgb.green = new Rgb([0, 128, 0]);
        Rgb.navy = new Rgb([0, 0, 128]);
        Rgb.standards = ['red', 'blue', 'fuchsia', 'green', 'navy'];
        return Rgb;
    })();
    Cv.Rgb = Rgb;
    // 2D Point
    var Point = (function () {
        function Point(x, y) {
            this.x = x;
            this.y = y;
        }
        Point.prototype.is = function (point) {
            return this.x == point.x && this.y == point.y;
        };
        Point.prototype.clone = function () {
            return new Point(this.x, this.y);
        };
        // Add each value
        Point.prototype.add = function (point) {
            this.x += point.x;
            this.y += point.y;
            return this;
        };
        // Subtract each value
        Point.prototype.sub = function (point) {
            this.x -= point.x;
            this.y -= point.y;
            return this;
        };
        // Multiply each value
        Point.prototype.multiply = function (scale) {
            this.x *= scale;
            this.y *= scale;
            return this;
        };
        Point.prototype.innerProduct = function (vector) {
            return this.x * vector.x + this.y * vector.y;
        };
        // Distance from the give point
        Point.prototype.norm = function (point) {
            if (point === void 0) { point = Point.Origin; }
            return Math.sqrt(Math.pow(this.x - point.x, 2) + Math.pow(this.y - point.y, 2));
        };
        // Normalize to 1-length Point
        Point.prototype.normalize = function () {
            return (this.norm() == 0) ? this : this.multiply(1 / this.norm());
        };
        Point.prototype.toString = function () {
            return "(" + this.x + ", " + this.y + ")";
        };
        Point.Origin = new Point(0, 0);
        Point.Up = new Point(0, -1);
        Point.UpRight = new Point(1, -1);
        Point.Right = new Point(1, 0);
        Point.DownRight = new Point(1, 1);
        Point.Down = new Point(0, 1);
        Point.DownLeft = new Point(-1, 1);
        Point.Left = new Point(-1, 0);
        Point.UpLeft = new Point(-1, -1);
        Point.None = new Point(Infinity, Infinity);
        return Point;
    })();
    Cv.Point = Point;
    //セグメント
    var Segment = (function () {
        // Initialized by a start point and an end point
        function Segment(start, end) {
            if (start === void 0) { start = Point.None; }
            if (end === void 0) { end = Point.None; }
            this.start = start;
            this.end = end;
            this._label = Cv.None;
        }
        // Center point
        Segment.prototype.center = function () {
            return this.start.clone().add(this.end).multiply(0.5);
        };
        Segment.prototype.direction = function () {
            return this.end.clone().sub(this.start).normalize();
        };
        Segment.prototype.label = function () {
            return this._label;
        };
        Segment.prototype.labeled = function () {
            return this._label != Cv.None;
        };
        Segment.prototype.setLabel = function (newLabel) {
            this._label = newLabel;
        };
        Segment.prototype.toString = function () {
            return "[ " + this.start.toString() + " ~ " + this.end.toString() + ": " + this._label + " ]";
        };
        return Segment;
    })();
    Cv.Segment = Segment;
    // Image as a matrix
    var Mat = (function () {
        // Dummy for overloading
        function Mat(arg1, arg2, arg3) {
            if (!arg1) {
                this.width = 0;
                this.height = 0;
            }
            else if (arg1 instanceof Mat) {
                this.width = arg1.width;
                this.height = arg1.height;
                this.data = new Uint8Array(this.width * this.height * 4);
                this.forPixels(this, function () { return arg3; });
            }
            else if (arg1 instanceof ImageData) {
                this.width = arg1.width;
                this.height = arg1.height;
                this.data = arg1.data;
            }
            else if (arg3 instanceof Array) {
                this.width = arg1;
                this.height = arg2;
                this.data = arg3;
            }
            else {
                this.width = arg1;
                this.height = arg2;
                this.data = new Uint8Array(this.width * this.height * 4);
                this.forPixels(this, function () { return arg3; });
            }
        }
        Mat.prototype.point2Index = function (point) {
            return point.y * this.width + point.x;
        };
        Mat.prototype.index2Point = function (index) {
            return new Point(index % this.width, (index - index % this.width) / this.width);
        };
        // Create a new Mat and copy the data
        Mat.prototype.clone = function () {
            var newData = [];
            for (var i = 0; i < this.data.length; i++)
                newData.push(this.data[i]);
            return new Mat(this.width, this.height, newData);
        };
        // Cast for ImageData
        Mat.prototype.copyTo = function (imageData) {
            for (var i = 0; i < this.data.length; i++)
                imageData.data[i] = this.data[i];
        };
        Mat.prototype.isInside = function (point) {
            return 0 < point.x && 0 < point.y && point.x < this.width && point.y < this.height;
        };
        // Dummy for overloading
        Mat.prototype.at = function (arg1, arg2) {
            // if a point given, get index
            var index = (arg1 instanceof Point) ? this.point2Index(arg1) : arg1;
            if (arg2 instanceof Rgb) {
                // Set values
                this.data[index * 4] = arg2.r;
                this.data[index * 4 + 1] = arg2.g;
                this.data[index * 4 + 2] = arg2.b;
                this.data[index * 4 + 3] = 255;
            }
            else {
                // Return values
                return new Rgb([this.data[index * 4], this.data[index * 4 + 1], this.data[index * 4 + 2]]);
            }
        };
        //Draw a segment by a color
        Mat.prototype.draw = function (segment, value) {
            var direction = segment.end.clone().sub(segment.start);
            direction.multiply(1 / (direction.x == 0 ? direction.y == 0 ? 1 : Math.abs(direction.y) : Math.abs(direction.x)));
            for (var p = segment.start.clone(); !p.is(segment.end); p.add(direction))
                this.at(p, value);
            this.at(p, value);
        };
        // Dummy for overloading
        Mat.prototype.forPixels = function (arg1, arg2) {
            if (arg1 instanceof Mat) {
                for (var index = 0; index < this.width * this.height; index++)
                    arg1.at(index, arg2(this.at(index)));
            }
            else {
                for (var index = 0; index < this.width * this.height; index++)
                    arg1(this.at(index));
            }
        };
        // Dummy for overloading
        Mat.prototype.forPixelsWithPoint = function (arg1, arg2) {
            if (arg1 instanceof Mat) {
                for (var index = 0; index < this.width * this.height; index++)
                    arg1.at(index, arg2(this.index2Point(index), this.at(index)));
            }
            else {
                for (var index = 0; index < this.width * this.height; index++)
                    arg1(this.index2Point(index), this.at(index));
            }
        };
        // Dummy for overloading
        Mat.prototype.forInnerPixels = function (handler) {
            for (var index = this.width; index < this.width * this.height - this.width; index++)
                if (0 < index % this.width && index % this.width < this.width - 1)
                    handler(index);
        };
        Mat.prototype.toString = function () {
            var str = "";
            for (var i = 0; i < this.data.length; i++)
                str += String(this.data[i]) + ", ";
            return str;
        };
        return Mat;
    })();
    Cv.Mat = Mat;
    var Processor = (function () {
        function Processor() {
        }
        Processor.invert = function (input, output) {
            if (output)
                input.forPixels(output, function (value) { return new Rgb([255 - value.r, 255 - value.g, 255 - value.b]); });
            else {
                var output = input.clone();
                input.forPixels(output, function (value) { return new Rgb([255 - value.r, 255 - value.g, 255 - value.b]); });
                return output;
            }
        };
        Processor.binarize = function (input, arg2, arg3) {
            if (arg3) {
                var threshold = arg3;
                input.forPixels(arg2, function (value) { return (value.r < threshold && value.g < threshold && value.b < threshold) ? Rgb.black : Rgb.white; });
            }
            else {
                var threshold = arg2;
                var output = input.clone();
                input.forPixels(output, function (value) { return (value.r < threshold && value.g < threshold && value.b < threshold) ? Rgb.black : Rgb.white; });
                return output;
            }
        };
        // Convert input to output as a grayscale
        Processor.convertToGray = function (input, output) {
            input.forPixels(output, function (value) {
                var newValue = value.r * 0.2126 + value.g * 0.7152 + value.b * 0.0722;
                return new Rgb([newValue, newValue, newValue]);
            });
        };
        // Extract edges from input to output
        Processor.extractEdge = function (input, output) {
            input.forPixelsWithPoint(output, function (point, value) {
                return new Rgb([127, 127, 127]).sub(input.at(point.clone().add(Point.UpLeft))).sub(input.at(point.clone().add(Point.Up))).sub(input.at(point.clone().add(Point.UpRight))).sub(input.at(point.clone().add(Point.Left))).sub(value.clone().multiply(8)).sub(input.at(point.clone().add(Point.Right))).sub(input.at(point.clone().add(Point.DownLeft))).sub(input.at(point.clone().add(Point.Down))).sub(input.at(point.clone().add(Point.DownRight)));
            });
        };
        // Thinning
        Processor.thinning = function (input, output, directionMap) {
            var w = input.width;
            var h = input.height;
            input.forPixels(output, function (value) { return value; });
            input.forPixels(directionMap, function (value) { return Rgb.white; });
            var outputData = output.data;
            var directionData = directionMap.data;
            var rAry = [];
            var bFlag = true;
            for (var k = 0; bFlag; k++) {
                bFlag = !!(k & 1);
                for (var i = 0; i < outputData.length / 4; i++)
                    rAry[i] = outputData[i * 4] == 0;
                output.forInnerPixels(function (index) {
                    if (!rAry[index])
                        return;
                    // [p[7] p[0] p[1]]
                    // [p[6] p[@] p[2]]
                    // [p[5] p[4] p[3]]
                    var p = [];
                    p[0] = rAry[index - w];
                    p[1] = rAry[index - w + 1];
                    p[2] = rAry[index + 1];
                    p[3] = rAry[index + w + 1];
                    p[4] = rAry[index + w];
                    p[5] = rAry[index + w - 1];
                    p[6] = rAry[index - 1];
                    p[7] = rAry[index - w - 1];
                    var a = p.filter(function (v, i) { return !p[i] && p[i + 1 < 8 ? i + 1 : 0]; }).length;
                    var b = p.filter(function (v) { return v; }).length;
                    if (a == 1 && 2 <= b && b <= 6) {
                        if ((!(k & 1) && !(p[0] && p[2] && p[4]) && !(p[2] && p[4] && p[6])) || ((k & 1) && !(p[0] && p[2] && p[6]) && !(p[0] && p[4] && p[6]))) {
                            outputData[index * 4] = outputData[index * 4 + 1] = outputData[index * 4 + 2] = 255;
                            bFlag = true;
                        }
                    }
                });
                for (var i = 0; i < outputData.length / 4; i++) {
                    if (rAry[i] == (outputData[i * 4] != 0)) {
                        var p = [];
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
        };
        // Restore labels by a thinning direction map
        Processor.restore = function (source, directionMap) {
            var _this = this;
            var nonvalid = [];
            directionMap.forPixelsWithPoint(function (point, direction) {
                if (direction.r < 8 && source.at(point).is(Rgb.white)) {
                    var p = point.clone();
                    var distColor = Rgb.white;
                    while (distColor.is(Rgb.white)) {
                        var nextDirectionPoint = _this.direction2point(directionMap.at(p).r);
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
                                p2.add(_this.direction2point(directionMap.at(p2).r));
                            }
                        }
                    }
                }
            });
        };
        Processor.direction2point = function (direction) {
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
        };
        // Vectorize input
        Processor.vectorize = function (mat, segments) {
            var directions = [Point.Right, Point.DownRight, Point.Down, Point.DownLeft];
            var remaining = mat.clone();
            remaining.forPixelsWithPoint(function (start, value) {
                if (remaining.at(start).is(Rgb.black)) {
                    var found = false;
                    directions.forEach(function (direction) {
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
        };
        return Processor;
    })();
    Cv.Processor = Processor;
})(Cv || (Cv = {}));
//# sourceMappingURL=cv.js.map