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
        Point.prototype.index = function (width) {
            return this.y * width + this.x;
        };
        return Point;
    })();
    Core.Point = Point;
})(Core || (Core = {}));
//# sourceMappingURL=core.js.map
