/// <reference path="scripts/typings/jquery/jquery.d.ts" />
/// <reference path="core.ts">
/// <reference path="processor.ts">
/// <reference path="gui.ts">

"use strict"

import Point = Core.Point;
import Line = Core.Line;
import Processor = Core.Processor;

var drawFlag: boolean = false;
var lines: Line[] = [];
var points: Line = [];

function convert(jpoint: JQueryEventObject): Point {
    return new Point(jpoint.clientX, jpoint.clientY);
}

$(window).load(() => {
    var image: HTMLImageElement = new Image();
    image.src = "images/x.png";
    var element = <HTMLCanvasElement> $("#main")[0];
    var context = element.getContext('2d');
    $(image).load(() => {
        element.width = image.width;
        element.height = image.height;
        var context = element.getContext('2d');
        context.drawImage(image, 0, 0);
    });
    $("#main").bind("mousemove", (e) => {
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
    $("#main").bind("mouseup", () => {
        drawFlag = false;
        lines.push(points.concat());
        points.length = 0;
    });
    $("#lines").bind("click", () => {
        var message : string = "";
        lines.forEach((line) => {
            line.forEach((point) => {
                message += "(" + point.x + ", " + point.y + "), ";
            });
            message += "\n";
        });
        alert(message);
    });
    $("#Vectorize").bind("click", () => {
        var imageData: ImageData = context.getImageData(0, 0, element.width, element.height);
        Processor.vectorize(imageData, lines);
        context.putImageData(imageData, 0, 0);
    });
    $("#GetEdge").bind("click", () => {
        var imageData: ImageData = context.getImageData(0, 0, element.width, element.height);
        Processor.extractEdge(imageData, imageData);
        context.putImageData(imageData, 0, 0);
    });
    $("#Binarize").bind("click", () => {
        var imageData: ImageData = context.getImageData(0, 0, element.width, element.height);
        Processor.binarize(imageData, imageData, 200);
        context.putImageData(imageData, 0, 0);
    });
    $("#thinning").bind("click", () => {
        var imageData: ImageData = context.getImageData(0, 0, element.width, element.height);
        Processor.invert(imageData, imageData);
        Processor.thinning(imageData, imageData);
        Processor.invert(imageData, imageData);
        context.putImageData(imageData, 0, 0);
    });
    $("#toGray").bind("click", () => {
        var imageData: ImageData = context.getImageData(0, 0, element.width, element.height);
        Processor.toGray(imageData, imageData);
        context.putImageData(imageData, 0, 0);
    });
});
