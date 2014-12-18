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

    export class Visualizer {
        mats: Array<[Mat, boolean]> = [];
        scribbles: [Array<Segments>, boolean];
        stroke: [Segments, boolean];
        usingColors: string[];
        protected canvas: HTMLCanvasElement;
        protected context: CanvasRenderingContext2D;

        draw(): void;
        draw(mat: Mat): void;
        draw(segments: Segments): void;
        // Draw a line from previous to label
        draw(segment: Segment): void;
        // Dummy for overloading
        draw(arg?: any): void {
            if (!arg) {
                this.mats.forEach((mat) => {
                    if (mat[0] && mat[1])
                        this.draw(mat[0]);
                });
                if (this.scribbles[0] && this.scribbles[1])
                    this.scribbles[0].forEach((scribble) => {
                        if (scribble)
                            this.draw(scribble);
                    });
                if (this.stroke[0] && this.stroke[1])
                    this.stroke[0].forEach((segments) => {
                        if (segments)
                            this.draw(segments);
                    });
            } else if (arg instanceof Mat) {
                var mat: Mat = arg;
                this.canvas.width = mat.width;
                this.canvas.height = mat.height;
                var imageData: ImageData = this.context.getImageData(0, 0, this.canvas.width, this.canvas.height);
                mat.copyTo(imageData);
                this.context.putImageData(imageData, 0, 0);
            }
            else if (arg instanceof Array) {
                arg.forEach((segment) => this.draw(segment));
            }
            else if (arg instanceof Segment) {
                if (0 <= arg.label.toNumber()) {
                    this.context.strokeStyle = this.usingColors[arg.label.toNumber()];
                    this.context.lineWidth = 3;
                    this.context.beginPath();
                    this.context.moveTo(arg.start.x, arg.start.y);
                    this.context.lineTo(arg.end.x, arg.end.y);
                    this.context.stroke();
                    this.context.closePath();
                }
            }
        }

        setCanvas(element: HTMLCanvasElement): void {
            this.canvas = element;
            this.context = element.getContext("2d");
        }

    }

}
