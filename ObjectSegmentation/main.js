/// <reference path="scripts/typings/jquery/jquery.d.ts" />
/// <reference path="gui.ts" />
/// <reference path="labeler.ts" />
"use strict";
$(window).on("load", function () {
    var source;
    var scribbles = new Array();
    var stroke = new Array();
    var stroke_file;
    var input_file;
    var colors = [];
    var calculating = false;
    var scribbler = new Gui.Scribbler(scribbles, colors);
    scribbler.createPalettes();
    var visualizer = new Gui.Visualizer();
    visualizer.setCanvas($("div#object_segmentation canvas")[0]);
    var image = new Image();
    image.src = $("div#object_segmentation span").text();
    $(image).on("load", function () {
        var canvas = $("div#object_segmentation canvas")[0];
        canvas.width = image.width;
        canvas.height = image.height;
        canvas.getContext('2d').drawImage(image, 0, 0);
        var imageData = canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height);
        source = new Mat(imageData);
        var directionMap = new Mat(source.width, source.height, Rgb.black);
        var thinned = source.clone();
        Cv.Processor.binarize(thinned, thinned, 200);
        Cv.Processor.thinning(thinned, thinned, directionMap);
        Cv.Processor.vectorize(thinned, stroke);
        visualizer.setObjects(source, scribbles, stroke, directionMap);
        visualizer.setVisibility();
        visualizer.colors = colors;
        visualizer.update();
    });
    if (stroke_file) {
        $.getJSON(stroke_file, function (json) { return Gui.Converter.json2stroke(stroke, json); }).done(function () {
            visualizer.update();
        });
    }
    if (input_file) {
        $.getJSON(input_file, function (json) { return Gui.Converter.json2scribbles(scribbles, colors, json); }).done(function () {
            visualizer.update();
        });
    }
    $("div#object_segmentation canvas").on({
        "mousemove": function (e) {
            if (scribbler.drawing())
                visualizer.draw(scribbler.move(Gui.Converter.jevent2point(e)));
        },
        "mousedown": function (e) { return scribbler.start(Gui.Converter.jevent2point(e)); },
        "mouseup mouseleave": function () {
            if (scribbler.drawing()) {
                scribbler.end();
                if (!calculating) {
                    calculating = true;
                    for (var i in stroke)
                        stroke[i].setLabel(Cv.None);
                    var nearestScribble = new Labeler.NearestScribbles(scribbles, stroke);
                    nearestScribble.expandNearest(1000);
                    var smartScribble = new Labeler.SmartScribbles(scribbles, nearestScribble.target);
                    smartScribble.run();
                    visualizer.update();
                    visualizer.restore();
                    calculating = false;
                }
            }
        }
    });
    $("input#visible_source").on("click", function () {
        visualizer.setVisibility();
        visualizer.update();
    });
    $("input#visible_scribbles").on("click", function () {
        visualizer.setVisibility();
        visualizer.update();
    });
    $("input#visible_stroke").on("click", function () {
        visualizer.setVisibility();
        visualizer.update();
    });
    $("input#visible_direction_map").on("click", function () {
        visualizer.setVisibility();
        visualizer.update();
    });
});
//# sourceMappingURL=main.js.map