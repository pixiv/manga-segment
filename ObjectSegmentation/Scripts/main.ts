/// <reference path="typings/jquery/jquery.d.ts" />
/// <reference path="gui.ts" />
/// <reference path="labeler.ts" />

"use strict"

$(window).on("load",() => {
    var source: Mat<Rgb>;
    var scribbles: Array<Segment[]> = [];
    var stroke: Segment[] = [];
    var stroke_file: string;
    var input_file: string;
    var colors: string[] = [];
    var calculating = false;

    var scribbler: Gui.Scribbler = new Gui.Scribbler(scribbles, colors);
    scribbler.createPalettes();

    var visualizer = new Gui.Visualizer();
    visualizer.setCanvas(<HTMLCanvasElement> $("div#object_segmentation canvas")[0]);

    var image: HTMLImageElement = new Image();
    image.src = $("div#object_segmentation span").text();

    $(image).on("load",() => {
        var canvas = <HTMLCanvasElement> $("div#object_segmentation canvas")[0];
        canvas.width = image.width;
        canvas.height = image.height;
        canvas.getContext('2d').drawImage(image, 0, 0);
        var imageData: ImageData = canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height);
        source = new Mat<Rgb>(imageData);
        var directionMap = new Mat<Rgb>(source.width, source.height, Rgb.black);
        var thinned = source.clone();
        Cv.Processor.binarize(thinned, thinned, 200);
        Cv.Processor.thinning(thinned, thinned, directionMap);
        Cv.Processor.vectorize(thinned, stroke);
        visualizer.setObjects(source, scribbles, stroke, directionMap);
        visualizer.colors = colors;
        visualizer.update();
    });

    if (stroke_file) {
        $.getJSON(stroke_file,(json) => Gui.Converter.json2stroke(stroke, json))
            .done(() => {
            visualizer.update();
        });
    }

    if (input_file) {
        $.getJSON(input_file,(json) => Gui.Converter.json2scribbles(scribbles, colors, json))
            .done(() => {
            visualizer.update();
        });
    }

    $("div#object_segmentation canvas").on({
        "mousemove": (e: JQueryEventObject) => {
            if (scribbler.drawing())
                visualizer.draw(scribbler.move(Gui.Converter.jevent2point(e)));
        },
        "mousedown": (e: JQueryEventObject) => scribbler.start(Gui.Converter.jevent2point(e)),
        "mouseup mouseleave": () => {
            if (scribbler.drawing()) {
                scribbler.end();
                if (!calculating) {
                    calculating = true;
                    for (var i in stroke)
                        stroke[i].setLabel(Cv.None);
                    var firstStep = new Labeler.FirstStep(scribbles, stroke);
                    firstStep.expandAreaUntil(700);
                    var secondStep = new Labeler.SecondStep(scribbles, firstStep.target);
                    secondStep.setLabels();
                    visualizer.update();
                    calculating = false;
                }
            }
        }
    });

    $("form#layers input").on("click",() => {
        visualizer.update();
    });

});
