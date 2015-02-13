/// <reference path="cv.ts" />

"use strict"

import Rgb = Cv.Rgb;
import Mat = Cv.Mat;
import Segment = Cv.Segment;

module Gui {

    export class Converter {

        static jevent2point(jpoint: JQueryEventObject): Cv.Point {
            return new Cv.Point(Math.round(jpoint.clientX), Math.round(jpoint.clientY));
        }

        static json2stroke(stroke: Cv.Segment[], json: any) {
            stroke.length = 0;
            for (var member in json) {
                stroke.push(new Segment());
                Gui.Converter.extend(stroke[stroke.length - 1], json[member]);
            }
        }

        static json2scribbles(scribbles: Array<Cv.Segment[]>, colors: string[], json: any) {
            colors.length = 0;
            scribbles.length = 0;
            for (var member in json) {
                colors.push(Rgb.standards[member]);
                scribbles.push(new Array<Segment>());
                for (var submember in json[member]) {
                    var back = scribbles[scribbles.length - 1];
                    back.push(new Segment());
                    this.extend(back[back.length - 1], json[member][submember]);
                }
            }
        }

        protected static extend(target: any, source: any) {
            for (var member in source)
                if (typeof source[member] == "object")
                    this.extend(target[member], source[member]);
                else
                    target[member] = source[member];
        }

    }

    export class Scribbler {
        protected color: string = Cv.Rgb.standards[0];
        protected previous: Cv.Point = null;
        protected currentLabel: Cv.Label = 0;

        constructor(protected scribbles: Array<Cv.Segment[]>, protected colors: string[]) {
        }

        drawing(): boolean {
            return this.previous != null;
        }

        move(next: Cv.Point): Segment {
            var newSegment = new Segment(this.previous, next);
            newSegment.setLabel(this.currentLabel);
            this.scribbles[this.currentLabel].push(newSegment);
            this.previous = next;
            return newSegment;
        }

        start(point: Cv.Point): void {
            if (!this.colors || this.colors.indexOf(this.color) == -1) {
                this.colors.push(this.color);
                this.scribbles.push([]);
            }
            this.currentLabel = this.colors.indexOf(this.color);
            this.previous = point;
        }

        end(): void {
            this.previous = null;
        }

        label(): Cv.Label {
            return this.currentLabel;
        }

        createPalettes(): void {
            Cv.Rgb.standards.forEach((color) => {
                $("div#object_segmentation div").append(
                    $("<span/>")
                        .attr("id", color)
                        .css("background-color", color)
                        .on("click",(e) => {
                        $("#" + this.color).toggleClass("selected");
                        this.color = color;
                        $(e.target).toggleClass("selected");
                    })
                    );
            });
            $("#" + this.color, $("div#object_segmentation div")).toggleClass("selected");
        }

    }

    export class Visualizer {
        colors: string[];
        protected mat: Mat<Rgb>;
        protected scribbles: Array<Cv.Segment[]> = [];
        protected stroke: Cv.Segment[] = [];
        protected direction_map: Mat<Rgb> = new Mat<Rgb>();
        protected canvas: HTMLCanvasElement;
        protected context: CanvasRenderingContext2D;

        setCanvas(element: HTMLCanvasElement): void {
            this.canvas = element;
            this.context = element.getContext("2d");
            this.context.translate(0.5, 0.5);
        }

        setObjects(mat: Mat<Rgb>, scribbles: Array<Cv.Segment[]>, stroke: Cv.Segment[], directionMap: Mat<Rgb>): void {
            this.mat = mat;
            this.scribbles = scribbles;
            this.stroke = stroke;
            this.direction_map = directionMap;
        }

        update(): void {
            this.draw(new Mat(this.mat.width, this.mat.height, Rgb.white));
            if ($("#visible_direction_map").prop("checked")) {
                var mat: Mat<Rgb> = new Mat<Rgb>(this.direction_map.width, this.direction_map.height, Rgb.white);
                this.direction_map.forPixelsWithPoint(mat,(point, rgb) => Rgb.fromString(Rgb.standards[rgb.r]));
                this.draw(mat);
            } else {
                if ($("#visible_result").prop("checked"))
                    this.restore();
                else if ($("#visible_source").prop("checked"))
                    this.draw(this.mat);
                else if ($("#visible_stroke").prop("checked"))
                    this.draw(this.stroke);
                if ($("#visible_scribbles").prop("checked"))
                    this.draw(this.scribbles);
            }
        }

        restore(): void {
            var mat: Mat<Rgb> = new Mat(this.mat.width, this.mat.height, Rgb.white);
            this.stroke.forEach((segment) => mat.draw(segment, Rgb.fromString((segment.label() < 0) ? 'black' : this.colors[segment.label()])));
            var imageData: ImageData = this.context.getImageData(0, 0, this.canvas.width, this.canvas.height);
            Cv.Processor.restore(mat, this.direction_map);
            mat.copyTo(imageData);
            this.context.putImageData(imageData, 0, 0);
        }

        draw(mat: Mat<Rgb>): void;
        draw(segments: Array<Cv.Segment[]>): void;
        draw(segments: Cv.Segment[]): void;
        draw(segment: Segment): void;
        // Dummy for overloading
        draw(arg: any): void {
            if (arg instanceof Array) {
                arg.forEach((element: any) => {
                    this.draw(element);
                });
            } else if (arg instanceof Mat) {
                var mat: Mat<Rgb> = arg;
                this.canvas.width = mat.width;
                this.canvas.height = mat.height;
                var imageData: ImageData = this.context.getImageData(0, 0, this.canvas.width, this.canvas.height);
                mat.copyTo(imageData);
                this.context.putImageData(imageData, 0, 0);
            }
            else if (arg instanceof Segment) {
                var segment: Segment = arg;
                if (segment) {
                    this.context.strokeStyle = (segment.label() < 0) ? 'black' : this.colors[segment.label()];
                    this.context.lineWidth = 3;
                    this.context.beginPath();
                    this.context.moveTo(segment.start.x, segment.start.y);
                    this.context.lineTo(segment.end.x, segment.end.y);
                    this.context.stroke();
                    this.context.closePath();
                }
            }
        }

        download(): void {
            location.href = this.canvas.toDataURL();
        }

        getLabels(): number[] {
            var labels: number[] = [];
            this.stroke.forEach((segment) => labels.push(segment.label()));
            return labels;
        }

    }

}
