/// <reference path="scripts/typings/jquery/jquery.d.ts" />
/// <reference path="processor.ts" />
/// <reference path="gui.ts" />
/// <reference path="labeler.ts" />

"use strict"

import Processor = Core.Processor;
import Rgb = Core.Rgb;
import Label = Core.Label;

$(window).on("load", () => {
    var source: Mat<Rgb>;
    //var binary: Core.SimpleMat<boolean>;
    var directionMap: Mat<Rgb>;
    var scribbles: Array<Segments> = new Array<Array<Segment>>();
    var stroke: Segments = new Array<Segment>();
    var stroke_file: string;
    var input_file: string;
    var colors: string[] = [];

    var scribbler: Gui.Scribbler = new Gui.Scribbler(scribbles, colors);
    scribbler.createPalettes();

    var nearestScribble: Labeler.NearestScribbles = new Labeler.NearestScribbles(scribbles, stroke);
    var smartScribble: Labeler.SmartScribbles = new Labeler.SmartScribbles(scribbles, stroke);

    var visualizer = new Gui.Visualizer();
    visualizer.setCanvas(<HTMLCanvasElement> $("#canvas")[0]);

    var image: HTMLImageElement = new Image();
    image.src = "images/lovehina01_040_2_bin.png";
    $(image).on("load", () => {
        this.canvas.width = image.width;
        this.canvas.height = image.height;
        this.canvas.getContext('2d').drawImage(image, 0, 0);
        var imageData: ImageData = this.canvas.getContext('2d').getImageData(0, 0, this.canvas.width, this.canvas.height);
        source = new Mat<Rgb>(imageData);
        directionMap = new Mat<Rgb>(source.width, source.height, Rgb.black);
        Processor.binarize(source, source, 200);
        Processor.thinning(source, source, directionMap);
        Processor.vectorize(source, stroke);
        $("#stroke_text").text(JSON.stringify(stroke));
        visualizer.setObjects(source, scribbles, stroke, directionMap);
        visualizer.setVisibility();
        visualizer.colors = colors;
        visualizer.update();
    });

    if (stroke_file != undefined) {
        $.getJSON("images/x_bin.js", (json) => Gui.Loader.json2stroke(stroke, json))
            .done(() => {
                $("#stroke_text").text(JSON.stringify(stroke));
                visualizer.update();
            });
    }

    if (input_file != undefined) {
        $.getJSON("images/x_input.js", (json) => Gui.Loader.json2scribbles(scribbles, colors, json))
            .done(() => {
                $("#scribble_text").text(JSON.stringify(scribbles));
                visualizer.update();
            });
    }

    $("#main").on({
        "mousemove": (e: JQueryEventObject) => {
            if (scribbler.drawing())
                visualizer.draw(scribbler.move(Gui.convert(e)));
        },
        "mousedown": (e: JQueryEventObject) => scribbler.start(Gui.convert(e)),
        "mouseup mouseleave": () => {
            scribbler.end();
            $("#scribble_text").text(JSON.stringify(scribbles));
        }
    });

    $("#visibility_source").on("click", () => {
        visualizer.setVisibility();
        visualizer.update();
    });

    $("#visibility_scribbles").on("click", () => {
        visualizer.setVisibility();
        visualizer.update();
    });

    $("#visibility_stroke").on("click", () => {
        visualizer.setVisibility();
        visualizer.update();
    });

    $("#visibility_direction_map").on("click", () => {
        visualizer.setVisibility();
        visualizer.update();
    });

    $("#edge").on("click", () => {
        Processor.extractEdge(source, source);
        visualizer.update();
    });

    $("#gray").on("click", () => {
        Processor.convertToGray(source, source);
        visualizer.update();
    });

    $("#binarize").on("click", () => {
        Processor.binarize(source, source, 200);
        visualizer.update();
    });

    $("#thinning").on("click", () => {
        Processor.thinning(source, source, directionMap);
        visualizer.update();
    });

    $("#vectorize").on("click", () => {
        Processor.vectorize(source, stroke);
        $("#stroke_text").text(JSON.stringify(stroke));
    });

    $("#labeling").on("click", () => {
        //nearestScribble.setNearest(200);
        alert('1st');
        smartScribble.run();
        visualizer.update();
        alert('2nd');
        visualizer.restore();
        $("#label_text").text(JSON.stringify(visualizer.getLabels()));
        $("#stroke_text").text(JSON.stringify(stroke));
        //for (var j in smartScribble.capacity) {
        //    var newTr = $("<tr></tr>");
        //    for (var k in smartScribble.capacity[j]) {
        //        newTr.append('<td>' + smartScribble.capacity[j][k] + '</td>');
        //    }
        //    $('table#optimization_text').append(newTr);
        //}
        $("#optimization_text").text(JSON.stringify(smartScribble.capacity));
    });

    $("#save").on("click", () => visualizer.download());

});
