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
import NearestScribbles = Labeler.NearestScribbles;
import Label = Core.Label;

$(window).on("load", () => {
    var source: Mat;
    var scribbles: Array<Segments> = new Array<Array<Segment>>();
    var stroke: Segments = new Array<Segment>();
    var colors: string[] = [];

    var scribbler: Gui.Scribbler = new Gui.Scribbler(scribbles, colors);
    var nearestScribble: NearestScribbles = new NearestScribbles(scribbles, stroke);
    var visualizer = new Gui.Visualizer();
    visualizer.setCanvas(<HTMLCanvasElement> $("#canvas")[0]);
    visualizer.usingColors = colors;
    visualizer.scribbles = [scribbles, true];
    visualizer.stroke = [stroke, true];

    // Create palettes
    Gui.colors.forEach((color) => {
        $("#palettes").append(
            $("<span/>")
                .attr("id", color)
                .css("background-color", color)
                .on("click", (e) => {
                    $("#" + scribbler.color).toggleClass("selected");
                    scribbler.setColor(color);
                    $(e.target).toggleClass("selected");
                })
            );
    });
    $("#" + scribbler.color, $("#palettes")).toggleClass("selected");

    var image: HTMLImageElement = new Image();
    image.src = "images/x.png";
    $(image).on("load", () => {
        this.canvas.width = image.width;
        this.canvas.height = image.height;
        this.canvas.getContext('2d').drawImage(image, 0, 0);
        var imageData: ImageData = this.canvas.getContext('2d').getImageData(0, 0, this.canvas.width, this.canvas.height);
        source = new Mat(imageData);
        visualizer.mats.push([source, true]);
        visualizer.draw();
    });

    $("#main").on({
        "mousemove": (e) => {
            if (scribbler.drawing())
                visualizer.draw(scribbler.move(Gui.convert(e)));
        },
        "mousedown": (e) => scribbler.start(Gui.convert(e)),
        "mouseup": () => {
            scribbler.end();
            $("#scribble_text").text(scribbles.toString());
        }
    });

    $("#source").on("click", () => {
        visualizer.mats[0][1] = $("#source").prop("checked");
        visualizer.draw();
    });

    $("#stroke").on("click", () => {
        visualizer.stroke[1] = $("#stroke").prop("checked");
        visualizer.draw();
    });

    $("#scribble").on("click", () => {
        visualizer.scribbles[1] = $("#scribble").prop("checked");
        visualizer.draw();
    });

    $("#vectorize").on("click", () => {
        Processor.vectorize(source, stroke);
        $("#stroke_text").text(stroke.toString());
    });

    $("#edge").on("click", () => {
        Processor.extractEdge(source, source);
        visualizer.draw();
    });

    $("#binarize").on("click", () => {
        Processor.binarize(source, source, 200);
        visualizer.draw();
    });

    $("#thinning").on("click", () => {
        Processor.invert(source, source);
        Processor.thinning(source, source);
        Processor.invert(source, source);
        visualizer.draw();
    });

    $("#gray").on("click", () => {
        Processor.convertToGray(source, source);
        visualizer.draw();
    });

    $("#labeling").on("click", () => {
        nearestScribble.setNearest(50);
        visualizer.draw();
        $("#source_text").text(source.toString());
        $("#stroke_text").text(stroke.toString());
    });

});
