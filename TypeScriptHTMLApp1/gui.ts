"use strict"

module Gui {

    export class Painter {
        private colors: string[] = ['red', 'blue', 'green', 'yellow', 'orange', 'purple'];
        private current: number;
        scribbles: Stroke[] = new Array<Stroke>();
        segments: Segment[] = new Array<Segment>();
        drawing: boolean = false;
        context: CanvasRenderingContext2D;

        constructor(private canvas: HTMLCanvasElement) {
            this.colors.forEach(() => this.scribbles.push(new Stroke()));
            this.context = this.canvas.getContext('2d');
        }

        private stroke(): Stroke {
            return this.scribbles[this.current];
        }

        draw(point: Point): void {
            if (this.drawing) {
                if (this.stroke().points == null)
                    this.stroke().points = Array<Point>();
                else if (this.stroke().points[this.stroke().points.length - 1] != null)
                    this.drawSegment(new Segment(this.stroke().points[this.stroke().points.length - 1], point));
                this.stroke().points.push(point);
            }
        }

        startDrawing(): void {
            this.drawing = true;
        }

        endDrawing(): void {
            this.drawing = false;
            this.stroke().points.push(null);
        }

        // Draw a line from previous to current
        private drawSegment(segment: Segment) {
            var context = this.canvas.getContext("2d");
            context.strokeStyle = this.colors[this.current];
            context.lineWidth = 3;
            context.beginPath();
            context.moveTo(segment.start.x, segment.start.y);
            context.lineTo(segment.end.x, segment.end.y);
            context.stroke();
            context.closePath();
        }

        updateImage(handler: (input: Mat, output: Mat) => void): void {
            var imageData: ImageData = this.context.getImageData(0, 0, this.canvas.width, this.canvas.height);
            var mat = new Mat(imageData);
            handler(mat, mat);
            this.context.putImageData(imageData, 0, 0);
        }

        processImage(handler: (input: Mat) => void): void {
            var imageData: ImageData = this.context.getImageData(0, 0, this.canvas.width, this.canvas.height);
            var mat = new Mat(imageData);
            handler(mat);
        }

        drawImage(image: HTMLImageElement): void {
            this.canvas.width = image.width;
            this.canvas.height = image.height;
            var context = this.canvas.getContext('2d');
            context.drawImage(image, 0, 0);
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
