//点
var Point = function (x, y) {
    this.x = x;
    this.y = y;
};


var image = new Image();
var drawFlag = false;
var lines = [];
var points = [];

$(window).load(function () {
    $(image).load(function () {
        var element = $("#main")[0];
        element.width = image.width;
        element.height = image.height;
        var context = element.getContext('2d');
        context.drawImage(image, 0, 0);
        // Read the image in advance.
        var input = context.getImageData(0, 0, element.width, element.height);
        var output = context.createImageData(element.width, element.height);
        extractEdge(input, output);
        context.putImageData(output, 0, 0);
    });
    image.src = "image.jpg";
    $("#main").bind("mousemove", function (e) {
        if (drawFlag) {
            if (points.length != 0) {
                drawLine(points[points.length - 1], e);
            }
            points.push(e);
        }
    });
    $("#main").bind("mousedown", function (e) {
        drawFlag = true;
        points.push(e);
    });
    $("#main").bind("mouseup", function () {
        drawFlag = false;
        lines.push(points.concat());
        points.length = 0;
    });
    $("#lines").bind("click", function () {
        var message = "";
        lines.forEach(function (line) {
            line.forEach(function (point) {
                message += "(" + point.clientX + ", " + point.clientY + "), ";
            });
            message += "\n";
        });
        alert(message);
    });
});

// Draw a line from previous to current
function drawLine(previous, current) {
    var can = document.getElementById("main");
    var context = can.getContext("2d");
    context.strokeStyle = "rgba(255,0,0,1)";
    context.lineWidth = 3;
    context.beginPath();
    context.moveTo(previous.clientX, previous.clientY);
    context.lineTo(current.clientX, current.clientY);
    context.stroke();
    context.closePath();
}
