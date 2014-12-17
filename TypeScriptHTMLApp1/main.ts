/// <reference path="scripts/typings/jquery/jquery.d.ts" />
/// <reference path="core.ts" />
/// <reference path="processor.ts" />
/// <reference path="gui.ts" />
/// <reference path="labeler.ts" />

"use strict"

import Segment = Core.Segment;
import Segments = Core.Segments;
import Point = Core.Point;
import Points = Core.Points;
import Mat = Core.Mat;
import Processor = Core.Processor;
import Rgb = Core.Rgb;
import Labeler = Core.Labeler;

function convert(jpoint: JQueryEventObject): Point {
    return new Point(Math.round(jpoint.clientX), Math.round(jpoint.clientY));
}

$(window).on("load", () => {
    var image: HTMLImageElement = new Image();
    image.src = "images/x.png";
    var painter;
    $(image).on("load", () => {
        painter = new Gui.Painter(<HTMLCanvasElement> $("#canvas")[0], image)
        painter.draw();
        painter.createPalettes($("#palettes"));
    });
    $("#main").on({
        "mousemove": (e) => {
            painter.add(convert(e));
            painter.draw();
        },
        "mousedown": (e) => painter.startDrawing(convert(e)),
        "mouseup": () => painter.endDrawing()
    });
    $("#stroke").on("click", () => {
        painter.draw(painter.source);
        if ($("#stroke").prop("checked"))
            painter.draw(painter.stroke);
        if ($("#scribble").prop("checked"))
            painter.draw(painter.scribble);
    });
    $("#scribble").on("click", () => {
        painter.draw(painter.source);
        if ($("#scribble").prop("checked"))
            painter.draw(painter.scribble);
    });
    $("#stroke_text").on("click", () => {
        $("#text").text(painter.stroke.toString());
    });
    $("#scribble_text").on("click", () => {
        $("#text").text(painter.scribble.toString());
    });
    $("#vectorize").on("click", () => {
        Processor.vectorize(painter.source, painter.stroke);
    });
    $("#edge").on("click", () => {
        Processor.extractEdge(painter.source, painter.source);
        painter.draw();
    });
    $("#binarize").on("click", () => {
        Processor.binarize(painter.source, painter.source, 200);
        painter.draw();
    });
    $("#thinning").on("click", () => {
        Processor.invert(painter.source, painter.source);
        Processor.thinning(painter.source, painter.source);
        Processor.invert(painter.source, painter.source);
    });
    $("#gray").on("click", () => {
        Processor.convertToGray(painter.source, painter.source);
    });
    $("#labeling").on("click", () => {
        var labeler: Labeler = new Labeler;
        labeler.source = painter.stroke;
        labeler.seeds = painter.scribble;
        labeler.setNearest(50);
    });
});
