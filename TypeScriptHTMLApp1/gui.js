"use strict";
// Draw a line from previous to current
var Gui;
(function (Gui) {
    var Painter = (function () {
        function Painter(canvas) {
            this.canvas = canvas;
        }
        Painter.prototype.draw = function (segment) {
            var context = this.canvas.getContext("2d");
            context.strokeStyle = "rgba(255,0,0,1)";
            context.lineWidth = 3;
            context.beginPath();
            context.moveTo(segment.start.x, segment.start.y);
            context.lineTo(segment.end.x, segment.end.y);
            context.stroke();
            context.closePath();
        };
        return Painter;
    })();
    Gui.Painter = Painter;
})(Gui || (Gui = {}));
//# sourceMappingURL=gui.js.map
