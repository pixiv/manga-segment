/// <reference path="scripts/typings/jquery/jquery.d.ts" />
/// <reference path="core.ts">
/// <reference path="processor.ts">
/// <reference path="gui.ts">
"use strict";
var Segment = Core.Segment;
var Point = Core.Point;
var Stroke = Core.Stroke;
var Mat = Core.Mat;
var Processor = Core.Processor;
var Rgb = Core.Rgb;

var drawFlag = false;
var strokes;
var stroke;

function convert(jpoint) {
    return new Point(jpoint.clientX, jpoint.clientY);
}

$(window).load(function () {
    var image = new Image();
    image.src = "images/x.png";
    var element = $("#main")[0];
    var context = element.getContext('2d');
    $(image).load(function () {
        element.width = image.width;
        element.height = image.height;
        var context = element.getContext('2d');
        context.drawImage(image, 0, 0);
    });
    $("#main").bind("mousemove", function (e) {
        if (drawFlag) {
            if (stroke.empty()) {
                var painter = new Gui.Painter(element);
                painter.draw(new Segment(stroke.points[stroke.points.length - 1], convert(e)));
            }
            stroke.points.push(convert(e));
        }
    });
    $("#main").bind("mousedown", function (e) {
        drawFlag = true;
        stroke.points.push(convert(e));
    });
    $("#main").bind("mouseup", function () {
        drawFlag = false;
        strokes.push(stroke.clone());
        stroke.clear();
    });
    $("#strokes").bind("click", function () {
        var message = "";
        strokes.forEach(function (line) {
            line.points.forEach(function (point) {
                message += "(" + point.x + ", " + point.y + "), ";
            });
            message += "\n";
        });
        alert(message);
    });
    $("#Vectorize").bind("click", function () {
        var imageData = context.getImageData(0, 0, element.width, element.height);
        var mat = new Mat(imageData);
        strokes = Processor.vectorize(mat);
    });
    $("#GetEdge").bind("click", function () {
        var imageData = context.getImageData(0, 0, element.width, element.height);
        Processor.extractEdge(imageData, imageData);
        context.putImageData(imageData, 0, 0);
    });
    $("#Binarize").bind("click", function () {
        var imageData = context.getImageData(0, 0, element.width, element.height);
        Processor.binarize(imageData, imageData, 200);
        context.putImageData(imageData, 0, 0);
    });
    $("#thinning").bind("click", function () {
        var imageData = context.getImageData(0, 0, element.width, element.height);
        Processor.invert(imageData, imageData);
        Processor.thinning(imageData, imageData);
        Processor.invert(imageData, imageData);
        context.putImageData(imageData, 0, 0);
    });
    $("#toGray").bind("click", function () {
        var imageData = context.getImageData(0, 0, element.width, element.height);
        Processor.toGray(imageData, imageData);
        context.putImageData(imageData, 0, 0);
    });
    $("#Label").bind("click", function () {
        var segments;
        strokes.forEach(function (stroke) {
            segments.concat(stroke.segments());
        });
    });
});
//# sourceMappingURL=main.js.map
