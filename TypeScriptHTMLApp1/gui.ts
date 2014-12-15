"use strict"

module Gui {

    //export class Converter {

    //    static toString(point: Point): string;
    //    static toString(segment: Segment): string;
    //    static toString(strokes: Stroke[]): string;
    //    static toString(segments: Segment[]): string;
    //    static toString(arg: any): string {
    //        var text: string = "";
    //        if (arg instanceof Point) {
    //            if (arg != undefined)
    //                text += "(" + arg.x + ", " + arg.y + "), ";
    //            else
    //                text += "\n";
    //        } else if (arg instanceof Segment) {
    //            if (arg != undefined)
    //                text += this.toString(arg.start) + this.toString(arg.end);
    //            else
    //                text += "\n";
    //        //} else if (arg instanceof (Array<Segment>)) {
    //        //    arg.forEach((segment) => {
    //        //        if (segment != undefined)
    //        //            text += this.toString(segment);
    //        //        else
    //        //            text += "\n";
    //        //    });
    //        //} else if (arg instanceof Stroke[]) {
    //        //    arg.forEach((stroke) => {
    //        //        if (stroke.points != undefined)
    //        //            stroke.points.forEach((point) => text += this.toString(point));
    //        //    });
    //        }
    //        return text;
    //    }

    //}

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

        drawImage(selector: string, image: HTMLImageElement): void {
            var element = <HTMLCanvasElement> $(selector)[0];
            element.width = image.width;
            element.height = image.height;
            var context = element.getContext('2d');
            context.drawImage(image, 0, 0);
        }

        createPalettes($element: JQuery) {
            this.colors.forEach((color) => {
                $element.append(
                    $("<span/>")
                        .addClass("palette")
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
