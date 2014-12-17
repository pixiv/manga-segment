/// <reference path="scripts/typings/jquery/jquery.d.ts" />
/// <reference path="core.ts" />
/// <reference path="processor.ts" />
/// <reference path="gui.ts" />
/// <reference path="labeler.ts" />

"use strict"

import Segment = Core.Segment;
import Point = Core.Point;
import Stroke = Core.Stroke;
import Mat = Core.Mat;
import Processor = Core.Processor;
import Rgb = Core.Rgb;
import Labeler = Core.Labeler;

function convert(jpoint: JQueryEventObject): Point {
    return new Point(jpoint.clientX, jpoint.clientY);
}

$(window).on("load", () => {
    var painter = new Gui.Painter(<HTMLCanvasElement> $("#canvas")[0]);
    painter.createPalettes($("#palettes"));
    var image: HTMLImageElement = new Image();
    image.src = "images/x.png";
    $(image).on("load", () => painter.drawImage(image));
    $("#main").on("mousemove", (e) => {
        painter.draw(convert(e));
    });
    $("#main").on("mousedown", (e) => {
        painter.startDrawing();
        painter.draw(convert(e));
    });
    $("#main").on("mouseup", () => {
        painter.endDrawing();
    });
    $("#scribbles").on("click", () => {
        $("#text").text(painter.scribbles.toString());
    });
    $("#strokes").on("click", () => {
        $("#text").text(painter.segments.toString());
    });
    $("#vectorize").on("click", () => {
        painter.processImage((input) => Processor.vectorize(input, painter.segments));
    });
    $("#edge").on("click", () => {
        painter.updateImage((input, output) => Processor.extractEdge(input, output));
    });
    $("#binarize").on("click", () => {
        painter.updateImage((input, output) => Processor.binarize(input, output, 200));
    });
    $("#thinning").on("click", () => {
        painter.updateImage((input, output) => {
            Processor.invert(input, output);
            Processor.thinning(output, output);
            Processor.invert(output, output);
        });
    });
    $("#gray").on("click", () => {
        painter.updateImage((input, output) => Processor.convertToGray(input, output));
    });
    $("#labeling").on("click", () => {
        var scribbleSegments: Array<Segment>;
        var label: number;
        painter.scribbles.forEach((stroke) => {
            scribbleSegments.concat(stroke.segments(label++));
        });
        var labeler: Labeler;
        labeler.source = painter.segments;
        labeler.seeds = scribbleSegments;
    });
});
