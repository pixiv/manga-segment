/// <reference path="scripts/typings/jquery/jquery.d.ts" />
/// <reference path="processor.ts" />
/// <reference path="gui.ts" />
/// <reference path="labeler.ts" />

"use strict"

import Processor = Core.Processor;
import Rgb = Core.Rgb;
import Label = Core.Label;

$(window).on("load",() => {
    var source: Mat<Rgb>;
    var scribbles: Array<Segments> = new Array<Array<Segment>>();
    var stroke: Segments = new Array<Segment>();
    var stroke_file: string;
    var input_file: string;
    var colors: string[] = [];
    var calculating = false;

    var scribbler: Gui.Scribbler = new Gui.Scribbler(scribbles, colors);
    scribbler.createPalettes();

    var visualizer = new Gui.Visualizer();
    visualizer.setCanvas(<HTMLCanvasElement> $("#canvas")[0]);

    var image: HTMLImageElement = new Image();
    image.src = "images/lovehina01_040_2_bin.png";

    $(image).on("load",() => {
        this.canvas.width = image.width;
        this.canvas.height = image.height;
        this.canvas.getContext('2d').drawImage(image, 0, 0);
        var imageData: ImageData = this.canvas.getContext('2d').getImageData(0, 0, this.canvas.width, this.canvas.height);
        source = new Mat<Rgb>(imageData);
        var directionMap = new Mat<Rgb>(source.width, source.height, Rgb.black);
        var thinned = source.clone();
        Processor.binarize(thinned, thinned, 200);
        Processor.thinning(thinned, thinned, directionMap);
        Processor.vectorize(thinned, stroke);
        $("#stroke_text").text(JSON.stringify(stroke));
        visualizer.setObjects(source, scribbles, stroke, directionMap);
        visualizer.setVisibility();
        visualizer.colors = colors;
        visualizer.update();
        $("#status").html($("#status").html() + 'Loaded<br />');
    });

    if (stroke_file) {
        $.getJSON("images/x_bin.js",(json) => Gui.Loader.json2stroke(stroke, json))
            .done(() => {
            $("#stroke_text").text(JSON.stringify(stroke));
            visualizer.update();
        });
    }

    if (input_file) {
        $.getJSON("images/x_input.js",(json) => Gui.Loader.json2scribbles(scribbles, colors, json))
            .done(() => {
            $("#scribble_text").text(JSON.stringify(scribbles));
            visualizer.update();
        });
    }

    $("#canvas").on({
        "mousemove": (e: JQueryEventObject) => {
            if (scribbler.drawing())
                visualizer.draw(scribbler.move(Gui.convert(e)));
        },
        "mousedown": (e: JQueryEventObject) => scribbler.start(Gui.convert(e)),
        "mouseup mouseleave": () => {
            if (scribbler.drawing()) {
                scribbler.end();
                if (!calculating) {
                    calculating = true;
                    Labeler.reset(stroke);
                    var nearestScribble: Labeler.NearestScribbles = new Labeler.NearestScribbles(scribbles, stroke);
                    nearestScribble.expandNearest(1000);
                    var smartScribble: Labeler.SmartScribbles = new Labeler.SmartScribbles(scribbles, nearestScribble.target);
                    smartScribble.run();
                    visualizer.update();
                    visualizer.restore();
                    calculating = false;
                }
            }
        }
    });

    $("#source").on("click",() => {
        visualizer.setVisibility();
        visualizer.update();
    });

    $("#scribbles").on("click",() => {
        visualizer.setVisibility();
        visualizer.update();
    });

    $("#stroke").on("click",() => {
        visualizer.setVisibility();
        visualizer.update();
    });

    $("#direction_map").on("click",() => {
        visualizer.setVisibility();
        visualizer.update();
    });

});
