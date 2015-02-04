/// <reference path="scripts/typings/jquery/jquery.d.ts" />
/// <reference path="gui.ts" />
/// <reference path="labeler.ts" />
"use strict";
var _this = this;
var Processor = Cv.Processor;
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
    visualizer.setCanvas($("#canvas")[0]);
    var image = new Image();
    image.src = "images/lovehina01_040_2_bin.png";
    $(image).on("load", function () {
        _this.canvas.width = image.width;
        _this.canvas.height = image.height;
        _this.canvas.getContext('2d').drawImage(image, 0, 0);
        var imageData = _this.canvas.getContext('2d').getImageData(0, 0, _this.canvas.width, _this.canvas.height);
        source = new Mat(imageData);
        var directionMap = new Mat(source.width, source.height, Rgb.black);
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
        $.getJSON("images/x_bin.js", function (json) { return Gui.Converter.json2stroke(stroke, json); }).done(function () {
            $("#stroke_text").text(JSON.stringify(stroke));
            visualizer.update();
        });
    }
    if (input_file) {
        $.getJSON("images/x_input.js", function (json) { return Gui.Converter.json2scribbles(scribbles, colors, json); }).done(function () {
            $("#scribble_text").text(JSON.stringify(scribbles));
            visualizer.update();
        });
    }
    $("#canvas").on({
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
    $("#source").on("click", function () {
        visualizer.setVisibility();
        visualizer.update();
    });
    $("#scribbles").on("click", function () {
        visualizer.setVisibility();
        visualizer.update();
    });
    $("#stroke").on("click", function () {
        visualizer.setVisibility();
        visualizer.update();
    });
    $("#direction_map").on("click", function () {
        visualizer.setVisibility();
        visualizer.update();
    });
});
//# sourceMappingURL=main.js.map