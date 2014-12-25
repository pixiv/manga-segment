/// <reference path="scripts/typings/jquery/jquery.d.ts" />
/// <reference path="processor.ts" />
/// <reference path="gui.ts" />
/// <reference path="labeler.ts" />

"use strict"

import Processor = Core.Processor;
import Rgb = Core.Rgb;
import Label = Core.Label;

$(window).on("load", () => {
    var source: Mat;
    var scribbles: Array<Segments> = new Array<Array<Segment>>();
    var stroke: Segments = new Array<Segment>();
    var colors: string[] = [];

    var scribbler: Gui.Scribbler = new Gui.Scribbler(scribbles, colors);
    var nearestScribble: Labeler.NearestScribbles = new Labeler.NearestScribbles(scribbles, stroke);
    var smartScribble: Labeler.SmartScribbles = new Labeler.SmartScribbles(scribbles, stroke);
    var visualizer = new Gui.Visualizer();
    visualizer.setCanvas(<HTMLCanvasElement> $("#canvas")[0]);
    visualizer.usingColors = colors;
    visualizer.scribbles_layer.object = scribbles;
    visualizer.scribbles_layer.visible = true;
    visualizer.stroke_layer.object = stroke;
    visualizer.stroke_layer.visible = true;

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
    image.src = "images/test.png";
    $(image).on("load", () => {
        this.canvas.width = image.width;
        this.canvas.height = image.height;
        this.canvas.getContext('2d').drawImage(image, 0, 0);
        var imageData: ImageData = this.canvas.getContext('2d').getImageData(0, 0, this.canvas.width, this.canvas.height);
        source = new Mat(imageData);
        visualizer.mat_layer.object = source;
        visualizer.mat_layer.visible = true;
        visualizer.update();
    });

    $("#main").on({
        "mousemove": (e) => {
            if (scribbler.drawing())
                visualizer.draw(scribbler.move(Gui.convert(e)));
        },
        "mousedown": (e) => scribbler.start(Gui.convert(e)),
        "mouseup": () => {
            scribbler.end();
            $("#scribble_text").text(JSON.stringify(scribbles));
        }
    });

    $("#source").on("click", () => {
        visualizer.mat_layer.visible = $("#source").prop("checked");
        visualizer.update();
    });

    $("#stroke").on("click", () => {
        visualizer.stroke_layer.visible = $("#stroke").prop("checked");
        visualizer.update();
    });

    $("#scribble").on("click", () => {
        visualizer.scribbles_layer.visible = $("#scribble").prop("checked");
        visualizer.update();
    });

    $("#vectorize").on("click", () => {
        Processor.vectorize(source, stroke);
        $("#stroke_text").text(JSON.stringify(stroke));
        $("#source_text").text(source.toString());
    });

    $("#edge").on("click", () => {
        Processor.extractEdge(source, source);
        visualizer.update();
    });

    $("#binarize").on("click", () => {
        Processor.binarize(source, source, 200);
        visualizer.update();
    });

    $("#thinning").on("click", () => {
        Processor.invert(source, source);
        Processor.thinning(source, source);
        Processor.invert(source, source);
        visualizer.update();
        $("#source_text").text(source.toString());
    });

    $("#gray").on("click", () => {
        Processor.convertToGray(source, source);
        visualizer.update();
    });

    $("#labeling").on("click", () => {
        nearestScribble.setNearest(50);
        smartScribble.run();
        visualizer.update();
        $("#source_text").text(source.toString());
        $("#stroke_text").text(JSON.stringify(stroke));
    });

    $("#save").on("click", () => visualizer.download());

});
