/// <reference path="scripts/typings/jquery/jquery.d.ts" />
function edge() {
    var canvas = document.getElementsByTagName('canvas')[0];
    canvas.width = image.width;
    canvas.height = image.height;

    var context = canvas.getContext('2d');

    // canvas にイメージを描画
    context.drawImage(image, 0, 0);

    // 操作するイメージデータを取得
    var input = context.getImageData(0, 0, canvas.width, canvas.height);

    // データを入れる空のスレートを取得
    var output = context.createImageData(canvas.width, canvas.height);

    // 便宜上、いくつかの変数のエイリアスを用意する
    // input.width と input.height は、canvas.width と canvas.height と
    // 同じではないかもしれないため、
    // ここでは、input.width と input.height を使う点に注意
    // （特に高解像度ディスプレイで違いが出るだろう）
    var w = input.width, h = input.height;
    var inputData = input.data;
    var outputData = output.data;

    for (var y = 1; y < h - 1; y += 1) {
        for (var x = 1; x < w - 1; x += 1) {
            for (var c = 0; c < 3; c += 1) {
                var i = (y * w + x) * 4 + c;
                outputData[i] = 127 + -inputData[i - w * 4 - 4] - inputData[i - w * 4] - inputData[i - w * 4 + 4] + -inputData[i - 4] + 8 * inputData[i] - inputData[i + 4] + -inputData[i + w * 4 - 4] - inputData[i + w * 4] - inputData[i + w * 4 + 4];
            }
            outputData[(y * w + x) * 4 + 3] = 255; // alpha
        }
    }

    // 操作後にイメージデータを入れる
    context.putImageData(output, 0, 0);
}

var image = new Image();

window.onload = function () {
    image.onload = edge;
    image.src = "image.jpg";
};
//# sourceMappingURL=app.js.map
