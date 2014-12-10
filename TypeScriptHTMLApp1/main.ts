/// <reference path="scripts/typings/jquery/jquery.d.ts" />
/// <reference path="core.ts">
/// <reference path="processor.ts">
/// <reference path="gui.ts">

"use strict"

import Segment = Core.Segment;
import Point = Core.Point;
import Stroke = Core.Stroke;
import Mat = Core.Mat;
import Processor = Core.Processor;
import Rgb = Core.Rgb;

var drawFlag: boolean = false;
var strokes: Stroke[];
var stroke: Stroke;

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
    $("#main").bind("mouseup", () => {
        drawFlag = false;
        strokes.push(stroke.clone());
        stroke.clear();
    });
    $("#strokes").bind("click", () => {
        var message: string = "";
        strokes.forEach((line) => {
            line.points.forEach((point) => {
                message += "(" + point.x + ", " + point.y + "), ";
            });
            message += "\n";
        });
        alert(message);
    });
    $("#Vectorize").bind("click", () => {
        var imageData: ImageData = context.getImageData(0, 0, element.width, element.height);
        var mat: Mat = new Mat(imageData);
        strokes = Processor.vectorize(mat);
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
    $("#Label").bind("click", () => {
        var segments: Array<Segment>;
        strokes.forEach((stroke) => {
            segments.concat(stroke.segments());
        });
    });
});
