"use strict"

module Gui {

    export class Painter {
        source: Mat;
        private colors: string[] = ['red', 'blue', 'green', 'yellow', 'orange', 'purple'];
        private current: number;
        private context: CanvasRenderingContext2D;
        private previous: Point = null;
        scribble: Segments = new Array<Segment>();
        stroke: Segments = new Array<Segment>();

        constructor(private canvas: HTMLCanvasElement, private image: HTMLImageElement) {
            this.context = this.canvas.getContext('2d');
            this.canvas.width = image.width;
            this.canvas.height = image.height;
            this.context.drawImage(image, 0, 0);
            var imageData: ImageData = this.context.getImageData(0, 0, this.canvas.width, this.canvas.height);
            this.source = new Mat(imageData);
        }

        add(point: Point): void {
            if (this.previous != null) {
                var newSegment = new Segment(this.previous, point);
                newSegment.label = new Core.Label(this.current);
                this.scribble.push(newSegment);
                this.previous = point;
            }
        }

        startDrawing(point: Point): void {
            this.previous = point;
        }

        endDrawing(): void {
            this.previous = null;
        }

        draw(): void;
        draw(mat: Mat): void;
        draw(segments: Segments): void;
        // Draw a line from previous to current
        draw(segment: Segment): void;
        // Dummy for overloading
        draw(arg?: any): void {
            if (!arg) {
                this.draw(this.source);
                this.draw(this.scribble);
            }
            else if (arg instanceof Mat) {
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
                    this.context.strokeStyle = this.colors[arg.label.toNumber()];
                    this.context.lineWidth = 3;
                    this.context.beginPath();
                    this.context.moveTo(arg.start.x, arg.start.y);
                    this.context.lineTo(arg.end.x, arg.end.y);
                    this.context.stroke();
                    this.context.closePath();
                }
            }
        }

        createPalettes($element: JQuery) {
            this.colors.forEach((color) => {
                $element.append(
                    $("<span/>")
                        .attr("id", color)
                        .css("background-color", color)
                        .on("click", (e) => {
                            $("#" + this.colors[this.current], $element).toggleClass("selected");
                            this.current = this.colors.indexOf(color);
                            $("#" + this.colors[this.current], $element).toggleClass("selected");
                        })
                    );
            });
            this.current = 0;
            $("#" + this.colors[this.current], $element).toggleClass("selected");
        }
    }

}
