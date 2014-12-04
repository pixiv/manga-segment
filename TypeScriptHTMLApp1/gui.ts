"use strict"

// Draw a line from previous to current
module Gui {
    export class Painter {
        constructor(private canvas: HTMLCanvasElement) {
        }
        draw(previous: Point, current: Point) {
            var context = this.canvas.getContext("2d");
            context.strokeStyle = "rgba(255,0,0,1)";
            context.lineWidth = 3;
            context.beginPath();
            context.moveTo(previous.x, previous.y);
            context.lineTo(current.x, current.y);
            context.stroke();
            context.closePath();
        }
    }
}
