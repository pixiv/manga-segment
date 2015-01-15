"use strict"

module Gui {

    export function convert(jpoint: JQueryEventObject): Point {
        return new Point(Math.round(jpoint.clientX), Math.round(jpoint.clientY));
    }

    export var colors: string[] = ['red', 'blue', 'green', 'yellow', 'orange', 'purple'];

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

        setColor(color: string) {
            this.color = color;
        }
    }

    class Layer<T> {
        object: T;
        visible: boolean;
    }

    export class Visualizer {
        mat_layer: Layer<Mat<Rgb>> = new Layer<Mat<Rgb>>();
        scribbles_layer: Layer<Array<Segments>> = new Layer<Array<Segments>>();
        stroke_layer: Layer<Segments> = new Layer<Segments>();
        usingColors: string[];
        protected canvas: HTMLCanvasElement;
        protected context: CanvasRenderingContext2D;

        update(): void {
            this.draw(new Mat(this.mat_layer.object.width, this.mat_layer.object.height, Rgb.white));
            this.draw(this.mat_layer);
            this.draw(this.scribbles_layer);
            this.draw(this.stroke_layer);
        }

        draw(mat_layer: Layer<Mat<Rgb>>): void;
        draw(mat: Mat<Rgb>): void;
        draw(segments: Layer<Array<Segments>>): void;
        draw(segments: Layer<Segments>): void;
        draw(segments: Segments): void;
        // Draw a line from previous to label
        draw(segment: Segment): void;
        // Dummy for overloading
        draw(arg: any): void {
            if (arg instanceof Array) {
                arg.forEach((element: any) => {
                    this.draw(element);
                });
            } else if (arg instanceof Layer) {
                if (arg.visible) {
                    this.draw(arg.object);
                }
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
                    this.context.strokeStyle = (segment.label.toNumber() < 0) ? 'black' : this.usingColors[segment.label.toNumber()];
                    this.context.lineWidth = 3;
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
        }

        download(): void {
            location.href = this.canvas.toDataURL();
        }

    }

}
