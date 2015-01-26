﻿/// <reference path="processor.ts" />

"use strict"

module Gui {

    export function convert(jpoint: JQueryEventObject): Point {
        return new Point(Math.round(jpoint.clientX), Math.round(jpoint.clientY));
    }

    var colors: string[] = Core.Rgb.standards;

    export class Loader {
        static json2stroke(stroke: Segments, json: any) {
            stroke.length = 0;
            for (var member in json) {
                stroke.push(new Segment());
                Gui.Loader.extend(stroke[stroke.length - 1], json[member]);
            }
        }

        static json2scribbles(scribbles: Array<Segments>, colors: string[], json: any) {
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
        color: string = colors[0];
        protected previous: Point = null;
        protected currentLabel: Label = new Core.Label(0);

        constructor(protected scribbles: Array<Segments>, protected usingColors: string[]) {
        }

        drawing(): boolean {
            return this.previous != null;
        }

        move(next: Point): Segment {
            var newSegment = new Segment(this.previous, next);
            newSegment.setLabel(this.currentLabel);
            this.scribbles[this.currentLabel.toNumber()].push(newSegment);
            this.previous = next;
            return newSegment;
        }

        start(point: Point): void {
            if (!this.usingColors || this.usingColors.indexOf(this.color) == -1) {
                this.usingColors.push(this.color);
                this.scribbles.push([]);
            }
            this.currentLabel = new Label(this.usingColors.indexOf(this.color));
            this.previous = point;
        }

        end(): void {
            this.previous = null;
        }

        label(): Label {
            return this.currentLabel;
        }

        createPalettes(): void {
            colors.forEach((color) => {
                $("#palettes").append(
                    $("<span/>")
                        .attr("id", color)
                        .css("background-color", color)
                        .on("click", (e) => {
                            $("#" + this.color).toggleClass("selected");
                            this.color = color;
                            $(e.target).toggleClass("selected");
                        })
                    );
            });
            $("#" + this.color, $("#palettes")).toggleClass("selected");
        }

    }

    class Layer<T> {
        object: T;
        visible: boolean;
    }

    export class Visualizer {
        protected mat_layer: Layer<Mat<Rgb>> = new Layer<Mat<Rgb>>();
        protected scribbles_layer: Layer<Array<Segments>> = new Layer<Array<Segments>>();
        protected stroke_layer: Layer<Segments> = new Layer<Segments>();
        protected direction_map_layer: Layer<Mat<Rgb>> = new Layer<Mat<Rgb>>();
        colors: string[];
        protected canvas: HTMLCanvasElement;
        protected context: CanvasRenderingContext2D;

        restore(): void {
            var mat: Mat<Rgb> = new Mat(this.mat_layer.object.width, this.mat_layer.object.height, Rgb.white);
            this.stroke_layer.object.forEach((segment) => mat.draw(segment, Rgb.fromString(this.colors[segment.label.toNumber()])));
            var imageData: ImageData = this.context.getImageData(0, 0, this.canvas.width, this.canvas.height);
            Processor.restore(mat, this.direction_map_layer.object);
            mat.copyTo(imageData);
            this.context.putImageData(imageData, 0, 0);
        }

        setObjects(mat: Mat<Rgb>, scribbles: Array<Segments>, stroke: Segments, directionMap: Mat<Rgb>): void {
            this.mat_layer.object = mat;
            this.scribbles_layer.object = scribbles;
            this.stroke_layer.object = stroke;
            this.direction_map_layer.object = directionMap;
        }

        setVisibility(): void {
            this.mat_layer.visible = $("#visibility_source").prop("checked");
            this.scribbles_layer.visible = $("#visibility_scribbles").prop("checked");
            this.stroke_layer.visible = $("#visibility_stroke").prop("checked");
            this.direction_map_layer.visible = $("#visibility_direction_map").prop("checked");
        }

        update(): void {
            this.draw(new Mat(this.mat_layer.object.width, this.mat_layer.object.height, Rgb.white));
            if (this.direction_map_layer.visible) {
                var mat: Mat<Rgb> = new Mat<Rgb>();
                this.direction_map_layer.object.forPixelsWithPoint(mat, (point, rgb) => {
                    switch (rgb.r) {
                        case 0: return new Rgb(0, 0, 255);
                        case 1: return new Rgb(0, 255, 255);
                        case 2: return new Rgb(0, 255, 0);
                        case 3: return new Rgb(255, 255, 0);
                        case 4: return new Rgb(255, 0, 0);
                        case 5: return new Rgb(255, 0, 255);
                        case 6: return new Rgb(128, 0, 255);
                        case 7: return new Rgb(255, 0, 128);
                        default: mat.at(point);
                    }
                });
            } else {
                if (this.mat_layer.visible)
                    this.draw(this.mat_layer.object);
                if (this.scribbles_layer.visible)
                    this.draw(this.scribbles_layer.object);
                if (this.stroke_layer.visible)
                    this.draw(this.stroke_layer.object);
            }
        }

        draw(mat: Mat<Rgb>): void;
        draw(segments: Array<Segments>): void;
        draw(segments: Segments): void;
        // Draw a line from previous to label
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
                    this.context.strokeStyle = (segment.label.toNumber() < 0) ? 'black' : this.colors[segment.label.toNumber()];
                    this.context.lineWidth = 1;
                    this.context.beginPath();
                    this.context.moveTo(segment.start.x, segment.start.y);
                    this.context.lineTo(segment.end.x, segment.end.y);
                    this.context.stroke();
                    this.context.closePath();
                }
            }
        }

        setCanvas(element: HTMLCanvasElement): void {
            this.canvas = element;
            this.context = element.getContext("2d");
            this.context.translate(0.5, 0.5);
        }

        download(): void {
            location.href = this.canvas.toDataURL();
        }

        getLabels(): number[] {
            var n: number[] = [];
            for (var i = 0; i < this.stroke_layer.object.length; i++) {
                n.push(this.stroke_layer.object[i].label.toNumber());
            }
            return n;
        }

    }

}
