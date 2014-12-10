"use strict";
var Core;
(function (Core) {
    var Label = (function () {
        function Label(id) {
            this.id = id;
        }
        Label.prototype.toNumber = function () {
            return this.id;
        };
        return Label;
    })();
    Core.Label = Label;

    var Rgb = (function () {
        function Rgb(r, g, b) {
            this.r = r;
            this.g = g;
            this.b = b;
        }
        Rgb.prototype.is = function (rgb) {
            return this.r == rgb.r && this.g == rgb.g && this.b == rgb.b;
        };
        Rgb.white = new Rgb(255, 255, 255);
        Rgb.black = new Rgb(0, 0, 0);
        return Rgb;
    })();
    Core.Rgb = Rgb;

    var Rgba = (function () {
        function Rgba(r, g, b, a) {
            this.r = r;
            this.g = g;
            this.b = b;
            this.a = a;
        }
        return Rgba;
    })();
    Core.Rgba = Rgba;

    var Point = (function () {
        function Point(x, y) {
            this.x = x;
            this.y = y;
        }
        Point.prototype.add = function (point) {
            this.x += point.x;
            this.y += point.y;
        };
        Point.prototype.clone = function () {
            return new Point(this.x, this.y);
        };
        Point.prototype.inverse = function () {
            return new Point(-this.x, -this.y);
        };
        Point.prototype.is = function (point) {
            return this.x == point.x && this.y == point.y;
        };
        return Point;
    })();
    Core.Point = Point;

    var Segment = (function () {
        function Segment(start, end) {
            this.start = start;
            this.end = end;
        }
        return Segment;
    })();
    Core.Segment = Segment;

    var Stroke = (function () {
        function Stroke(points) {
            this.points = points;
        }
        Stroke.prototype.clear = function () {
            this.points.length = 0;
        };
        Stroke.prototype.clone = function () {
            return new Stroke(this.points);
        };
        Stroke.prototype.empty = function () {
            return this.points.length == 0;
        };
        Stroke.prototype.segments = function () {
            var segments;
            var first = true;
            var previous;
            this.points.forEach(function (point) {
                if (first) {
                    first = false;
                } else {
                    segments.push(new Segment(previous, point));
                }
                previous = point;
            });
            return segments;
        };
        return Stroke;
    })();
    Core.Stroke = Stroke;

    var Mat = (function () {
        function Mat(arg1, arg2, arg3) {
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
        Mat.prototype.copyTo = function (imageData) {
            for (var i = 0; i < this.data.length; i++)
                imageData.data[i] = this.data[i];
        };

        Mat.prototype.at = function (arg1, arg2) {
            var index = (arg1 instanceof Point) ? this.point2Index(arg1) : arg1;
            if (arg2 instanceof Rgb) {
                this.data[index * 4] = arg2.r;
                this.data[index * 4 + 1] = arg2.g;
                this.data[index * 4 + 2] = arg2.b;
            } else {
                return new Rgb(this.data[index * 4], this.data[index * 4 + 1], this.data[index * 4 + 2]);
            }
        };

        Mat.prototype.clone = function () {
            return new Mat(this.width, this.height, this.data);
        };

        Mat.prototype.forPixels = function (handler) {
            for (var y = 0; y < this.height; y++) {
                for (var x = 0; x < this.width; x++) {
                    handler(new Point(x, y), this.at(new Point(x, y)));
                }
            }
        };

        Mat.prototype.isInside = function (point) {
            return 0 < point.x && 0 < point.y && point.x < this.width && point.y < this.height;
        };

        Mat.prototype.point2Index = function (point) {
            return point.y * this.width + point.x;
        };

        Mat.prototype.index2Point = function (index) {
            return new Point(index % this.width, (index - index % this.width) / this.width);
        };
        return Mat;
    })();
    Core.Mat = Mat;
})(Core || (Core = {}));
//# sourceMappingURL=core.js.map
