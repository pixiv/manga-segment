/// <reference path="scripts/typings/jquery/jquery.d.ts" />
var image = new Image();

window.onload = function () {
    //image.onload = edge;
    image.addEventListener("load", function () {
        SetPixelSample.Program.run();
    }, true);
    image.src = "image.jpg";
};

//function edge() {
//    var canvas = document.getElementsByTagName('canvas')[0];
//    canvas.width = image.width;
//    canvas.height = image.height;
//    var context = canvas.getContext('2d');
//    // canvas にイメージを描画
//    context.drawImage(image, 0, 0);
//    // 操作するイメージデータを取得
//    var input = context.getImageData(0, 0, canvas.width, canvas.height);
//    // データを入れる空のスレートを取得
//    var output = context.createImageData(canvas.width, canvas.height);
//    // 便宜上、いくつかの変数のエイリアスを用意する
//    // input.width と input.height は、canvas.width と canvas.height と
//    // 同じではないかもしれないため、
//    // ここでは、input.width と input.height を使う点に注意
//    // （特に高解像度ディスプレイで違いが出るだろう）
//    var w = input.width, h = input.height;
//    var inputData = input.data;
//    var outputData = output.data;
//    // エッジ検出
//    for (var y = 1; y < h - 1; y += 1) {
//        for (var x = 1; x < w - 1; x += 1) {
//            for (var c = 0; c < 3; c += 1) {
//                var i = (y * w + x) * 4 + c;
//                outputData[i] = 127 + -inputData[i - w * 4 - 4] - inputData[i - w * 4] - inputData[i - w * 4 + 4] +
//                -inputData[i - 4] + 8 * inputData[i] - inputData[i + 4] +
//                -inputData[i + w * 4 - 4] - inputData[i + w * 4] - inputData[i + w * 4 + 4];
//            }
//            outputData[(y * w + x) * 4 + 3] = 255; // alpha
//        }
//    }
//    // 操作後にイメージデータを入れる
//    context.putImageData(output, 0, 0);
//}
var SetPixelSample;
(function (SetPixelSample) {
    var Program = (function () {
        function Program() {
        }
        Program.run = function () {
            var canvas = document.querySelector("canvas");
            var context = canvas.getContext("2d");
            context.drawImage(image, 0, 0);
            //var imageData = context.getImageData(0, 0, canvas.width, canvas.height);
            //// ImageData を描画
            //context.putImageData(imageData, 0, 0);
        };

        // ImageData のランダムな座標のピクセルをランダムな色にする
        Program.setRandomPixels = function (canvas, imageData) {
            for (var index = 0; index < 100000; index++) {
                var x = Program.randomInteger(canvas.height);
                var y = Program.randomInteger(canvas.width);
                var red = Program.randomInteger(0x100);
                var green = Program.randomInteger(0x100);
                var blue = Program.randomInteger(0x100);
                Program.setPixel(imageData, x, y, red, green, blue);
            }
        };

        // 疑似乱数 (0 から value 未満の整数)
        Program.randomInteger = function (value) {
            return Math.floor(value * Math.random());
        };

        // ImageData の指定した座標の 1 ピクセルを指定した色にする
        Program.setPixel = function (imageData, x, y, red, green, blue, alpha) {
            if (typeof alpha === "undefined") { alpha = 0xff; }
            // 指定した座標のピクセルが ImageData の data のどの位置にあるかを計算
            var index = (x + y * imageData.width) * 4;

            // その位置から、赤、緑、青、アルファ値の順で1バイトずつ書き込むことで、ピクセルがその色になる
            imageData.data[index + 0] = red;
            imageData.data[index + 1] = green;
            imageData.data[index + 2] = blue;
            imageData.data[index + 3] = alpha;
        };
        return Program;
    })();
    SetPixelSample.Program = Program;
})(SetPixelSample || (SetPixelSample = {}));
//# sourceMappingURL=edge.js.map
