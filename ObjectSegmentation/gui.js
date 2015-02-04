/// <reference path="cv.ts" />
"use strict";
var Rgb = Cv.Rgb;
var Mat = Cv.Mat;
var Segment = Cv.Segment;
var Gui;
(function (Gui) {
    var Converter = (function () {
        function Converter() {
        }
        Converter.jevent2point = function (jpoint) {
            return new Cv.Point(Math.round(jpoint.clientX), Math.round(jpoint.clientY));
        };
        Converter.json2stroke = function (stroke, json) {
            stroke.length = 0;
            for (var member in json) {
                stroke.push(new Segment());
                Gui.Converter.extend(stroke[stroke.length - 1], json[member]);
            }
        };
        Converter.json2scribbles = function (scribbles, colors, json) {
            colors.length = 0;
            scribbles.length = 0;
            for (var member in json) {
                colors.push(Rgb.standards[member]);
                scribbles.push(new Array());
                for (var submember in json[member]) {
                    var back = scribbles[scribbles.length - 1];
                    back.push(new Segment());
                    this.extend(back[back.length - 1], json[member][submember]);
                }
            }
        };
        Converter.extend = function (target, source) {
            for (var member in source)
                if (typeof source[member] == "object")
                    this.extend(target[member], source[member]);
                else
                    target[member] = source[member];
        };
        return Converter;
    })();
    Gui.Converter = Converter;
    var Scribbler = (function () {
        function Scribbler(scribbles, colors) {
            this.scribbles = scribbles;
            this.colors = colors;
            this.color = Cv.Rgb.standards[0];
            this.previous = null;
            this.currentLabel = 0;
        }
        Scribbler.prototype.drawing = function () {
            return this.previous != null;
        };
        Scribbler.prototype.move = function (next) {
            var newSegment = new Segment(this.previous, next);
            newSegment.setLabel(this.currentLabel);
            this.scribbles[this.currentLabel].push(newSegment);
            this.previous = next;
            return newSegment;
        };
        Scribbler.prototype.start = function (point) {
            if (!this.colors || this.colors.indexOf(this.color) == -1) {
                this.colors.push(this.color);
                this.scribbles.push([]);
            }
            this.currentLabel = this.colors.indexOf(this.color);
            this.previous = point;
        };
        Scribbler.prototype.end = function () {
            this.previous = null;
        };
        Scribbler.prototype.label = function () {
            return this.currentLabel;
        };
        Scribbler.prototype.createPalettes = function () {
            var _this = this;
            Cv.Rgb.standards.forEach(function (color) {
                $("#palettes").append($("<span/>").attr("id", color).css("background-color", color).on("click", function (e) {
                    $("#" + _this.color).toggleClass("selected");
                    _this.color = color;
                    $(e.target).toggleClass("selected");
                }));
            });
            $("#" + this.color, $("#palettes")).toggleClass("selected");
        };
        return Scribbler;
    })();
    Gui.Scribbler = Scribbler;
    var Layer = (function () {
        function Layer() {
        }
        return Layer;
    })();
    var Visualizer = (function () {
        function Visualizer() {
            this.mat_layer = new Layer();
            this.scribbles_layer = new Layer();
            this.stroke_layer = new Layer();
            this.direction_map_layer = new Layer();
        }
        Visualizer.prototype.setCanvas = function (element) {
            this.canvas = element;
            this.context = element.getContext("2d");
            this.context.translate(0.5, 0.5);
        };
        Visualizer.prototype.setObjects = function (mat, scribbles, stroke, directionMap) {
            this.mat_layer.object = mat;
            this.scribbles_layer.object = scribbles;
            this.stroke_layer.object = stroke;
            this.direction_map_layer.object = directionMap;
        };
        Visualizer.prototype.setVisibility = function () {
            this.mat_layer.visible = $("#source").prop("checked");
            this.scribbles_layer.visible = $("#scribbles").prop("checked");
            this.stroke_layer.visible = $("#stroke").prop("checked");
            this.direction_map_layer.visible = $("#direction_map").prop("checked");
        };
        Visualizer.prototype.update = function () {
            this.draw(new Mat(this.mat_layer.object.width, this.mat_layer.object.height, Rgb.white));
            if (this.direction_map_layer.visible) {
                var mat = new Mat();
                this.direction_map_layer.object.forPixelsWithPoint(mat, function (point, rgb) { return Rgb.fromString(Rgb.standards[rgb.r]); });
            }
            else {
                if (this.mat_layer.visible)
                    this.draw(this.mat_layer.object);
                if (this.scribbles_layer.visible)
                    this.draw(this.scribbles_layer.object);
                if (this.stroke_layer.visible)
                    this.draw(this.stroke_layer.object);
            }
        };
        Visualizer.prototype.restore = function () {
            var _this = this;
            var mat = new Mat(this.mat_layer.object.width, this.mat_layer.object.height, Rgb.white);
            this.stroke_layer.object.forEach(function (segment) { return mat.draw(segment, Rgb.fromString(_this.colors[segment.label()])); });
            var imageData = this.context.getImageData(0, 0, this.canvas.width, this.canvas.height);
            Processor.restore(mat, this.direction_map_layer.object);
            mat.copyTo(imageData);
            this.context.putImageData(imageData, 0, 0);
        };
        // Dummy for overloading
        Visualizer.prototype.draw = function (arg) {
            var _this = this;
            if (arg instanceof Array) {
                arg.forEach(function (element) {
                    _this.draw(element);
                });
            }
            else if (arg instanceof Mat) {
                var mat = arg;
                this.canvas.width = mat.width;
                this.canvas.height = mat.height;
                var imageData = this.context.getImageData(0, 0, this.canvas.width, this.canvas.height);
                mat.copyTo(imageData);
                this.context.putImageData(imageData, 0, 0);
            }
            else if (arg instanceof Segment) {
                var segment = arg;
                if (segment) {
                    this.context.strokeStyle = (segment.label() < 0) ? 'black' : this.colors[segment.label()];
                    this.context.lineWidth = 1;
                    this.context.beginPath();
                    this.context.moveTo(segment.start.x, segment.start.y);
                    this.context.lineTo(segment.end.x, segment.end.y);
                    this.context.stroke();
                    this.context.closePath();
                }
            }
        };
        Visualizer.prototype.download = function () {
            location.href = this.canvas.toDataURL();
        };
        Visualizer.prototype.getLabels = function () {
            var labels = [];
            this.stroke_layer.object.forEach(function (segment) { return labels.push(segment.label()); });
            return labels;
        };
        return Visualizer;
    })();
    Gui.Visualizer = Visualizer;
})(Gui || (Gui = {}));
//# sourceMappingURL=gui.js.map