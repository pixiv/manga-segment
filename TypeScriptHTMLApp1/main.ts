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
    var painter = new Gui.Painter(<HTMLCanvasElement> $("#main")[0]);
    painter.createPalettes($("#palettes"));
    var image: HTMLImageElement = new Image();
    image.src = "images/x.png";
    $(image).load(() => painter.drawImage("#main", image));
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
    $("#Scribbles").on("click", () => {
        alert(painter.scribbles.toString());
    });
    $("#Segments").on("click", () => {
        alert(painter.segments.toString());
    });
    $("#Vectorize").on("click", () => {
        painter.processImage((input) => Processor.vectorize(input, painter.segments));
    });
    $("#GetEdge").on("click", () => {
        painter.updateImage((input, output) => Processor.extractEdge(input, output));
    });
    $("#Binarize").on("click", () => {
        painter.updateImage((input, output) => Processor.binarize(input, output, 200));
    });
    $("#thinning").on("click", () => {
        painter.updateImage((input, output) => {
            Processor.invert(input, output);
            Processor.thinning(output, output);
            Processor.invert(output, output);
        });
    });
    $("#toGray").on("click", () => {
        painter.updateImage((input, output) => Processor.toGray(input, output));
    });
    $("#Label").on("click", () => {
        var segments: Array<Segment>;
        painter.scribbles.forEach((stroke) => {
            segments.concat(stroke.segments());
        });
        var labeler: Labeler;
        labeler.source = painter.segments;
        labeler.seeds = segments;
    });
});
