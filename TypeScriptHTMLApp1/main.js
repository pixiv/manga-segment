/// <reference path="scripts/typings/jquery/jquery.d.ts" />
/// <reference path="core.ts">
/// <reference path="processor.ts">
/// <reference path="gui.ts">
"use strict";
var Point = Core.Point;

var Processor = Core.Processor;

var drawFlag = false;
var lines = [];
var points = [];

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
            if (points.length != 0) {
                var painter = new Gui.Painter(element);
                painter.draw(points[points.length - 1], convert(e));
            }
            points.push(convert(e));
        }
    });
    $("#main").bind("mousedown", function (e) {
        drawFlag = true;
        points.push(convert(e));
    });
    $("#main").bind("mouseup", function () {
        drawFlag = false;
        lines.push(points.concat());
        points.length = 0;
    });
    $("#lines").bind("click", function () {
        var message = "";
        lines.forEach(function (line) {
            line.forEach(function (point) {
                message += "(" + point.x + ", " + point.y + "), ";
            });
            message += "\n";
        });
        alert(message);
    });
    $("#Vectorize").bind("click", function () {
        var imageData = context.getImageData(0, 0, element.width, element.height);
        Processor.vectorize(imageData, lines);
        context.putImageData(imageData, 0, 0);
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
});
//# sourceMappingURL=main.js.map
