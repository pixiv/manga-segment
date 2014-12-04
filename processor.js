// Extract edges from input to output
function extractEdge(input, output) {
    var w = input.width, h = input.height;
    var inputData = input.data;
    var outputData = output.data;
    for (var y = 1; y < h - 1; y += 1) {
        for (var x = 1; x < w - 1; x += 1) {
            for (var c = 0; c < 3; c += 1) {
                var i = (y * w + x) * 4 + c;
                outputData[i] = 127 + -inputData[i - w * 4 - 4] - inputData[i - w * 4] - inputData[i - w * 4 + 4] +
                                      -inputData[i - 4] + 8 * inputData[i] - inputData[i + 4] +
                                      -inputData[i + w * 4 - 4] - inputData[i + w * 4] - inputData[i + w * 4 + 4];
            }
            outputData[(y * w + x) * 4 + 3] = 255; // alpha
        }
    }
}

// Thinning by Zhang-Suen from http://www.hundredsoft.jp/win7blog/log/eid119.html
var thinning = function (imageData) {
    var w = imageData.width;
    var h = imageData.height;
    var ind = imageData.data;

    var x, y, rAry;
    var bFlag = true;

    for (var k = 0; k < 100 && bFlag; k++) {
        if (!(k & 1)) {
            bFlag = false;
        }
        rAry = new Uint8Array(ind);
        for (y = 1; y < h - 1; y++) {
            for (x = 1; x < w - 1; x++) {
                var i = (y * w + x) * 4;
                if (rAry[i]) {
                    var a, b, p1, p2, p3, p4, p5, p6, p7, p8, p9;
                    // [p9 p2 p3]
                    // [p8 p1 p4]
                    // [p7 p6 p5]
                    p1 = 1;
                    p2 = (rAry[i - w * 4]) ? 1 : 0;
                    p3 = (rAry[i - w * 4 + 4]) ? 1 : 0;
                    p4 = (rAry[i + 4]) ? 1 : 0;
                    p5 = (rAry[i + w * 4 + 4]) ? 1 : 0;
                    p6 = (rAry[i + w * 4]) ? 1 : 0;
                    p7 = (rAry[i + w * 4 - 4]) ? 1 : 0;
                    p8 = (rAry[i - 4]) ? 1 : 0;
                    p9 = (rAry[i - w * 4 - 4]) ? 1 : 0;
                    a = 0;
                    if (!p2 && p3) { a++; }
                    if (!p3 && p4) { a++; }
                    if (!p4 && p5) { a++; }
                    if (!p5 && p6) { a++; }
                    if (!p6 && p7) { a++; }
                    if (!p7 && p8) { a++; }
                    if (!p8 && p9) { a++; }
                    if (!p9 && p2) { a++; }
                    b = p2 + p3 + p4 + p5 + p6 + p7 + p8 + p9;

                    if (a == 1 && 2 <= b && b <= 6) {
                        if ((!(k & 1) && p2 * p4 * p6 == 0 && p4 * p6 * p8 == 0)
                         || ((k & 1) && p2 * p4 * p8 == 0 && p2 * p6 * p8 == 0)) {
                            ind[i] = ind[i + 1] = ind[i + 2] = 0;
                            bFlag = true;
                        }
                    }
                }
            }
        }
    }
};

