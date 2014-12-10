"use strict"

// Draw a line from previous to current
module Gui {
    export class Painter {
        constructor(private canvas: HTMLCanvasElement) {
        }
        draw(segment: Segment) {
            var context = this.canvas.getContext("2d");
            context.strokeStyle = "rgba(255,0,0,1)";
            context.lineWidth = 3;
            context.beginPath();
            context.moveTo(segment.start.x, segment.start.y);
            context.lineTo(segment.end.x, segment.end.y);
            context.stroke();
            context.closePath();
        }
    }
}
