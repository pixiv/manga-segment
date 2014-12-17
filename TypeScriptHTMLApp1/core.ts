"use strict"

module Core {

    //セグメントに振るラベル
    export class Label {
        //数値で初期化
        constructor(private id: number) {
        }
        //数値へのキャスト
        toNumber(): number {
            return this.id;
        }
    }

    //RGB色
    export class Rgb {
        //色定数
        public static white = new Rgb(255, 255, 255);
        public static black = new Rgb(0, 0, 0);
        //RGB値で初期化
        constructor(public r: number, public g: number, public b: number) {
        }
        //色を成分ごとに加算する
        add(color: Rgb) {
            this.r += color.r;
            this.g += color.g;
            this.b += color.b;
        }
        //色を成分ごとに加算した色を返す
        added(color: Rgb): Rgb {
            return new Rgb(this.r + color.r, this.g + color.g, this.b + color.b);
        }
        //色を成分ごとに乗算する
        multiplied(num: number): Rgb {
            return new Rgb(this.r * num, this.g * num, this.b * num);
        }
        //成分ごとに正負反転した色を返す
        inverse(): Rgb {
            return new Rgb(-this.r, -this.g, -this.b);
        }
        //等色かどうかを返す
        is(rgb: Rgb): boolean {
            return this.r == rgb.r && this.g == rgb.g && this.b == rgb.b;
        }
    }

    //点
    export class Point {
        //座標で初期化
        constructor(public x: number, public y: number) {
        }
        //座標を成分ごとに加算する
        add(point: Point) {
            this.x += point.x;
            this.y += point.y;
        }
        //座標を成分ごとに加算した点を返す
        added(point: Point): Point {
            return new Point(this.x + point.x, this.y + point.y);
        }
        //点との距離を返す
        norm(point: Point): number {
            return Math.sqrt(
                Math.pow(this.x - point.x, 2)
                + Math.pow(this.y - point.y, 2)
                );
        }
        //複製を返す
        clone(): Point {
            return new Point(this.x, this.y);
        }
        //成分ごとに正負反転した点を返す
        inverse(): Point {
            return new Point(-this.x, -this.y);
        }
        //等しいかどうかを返す
        is(point: Point): boolean {
            return this.x == point.x && this.y == point.y;
        }
        toString(): string {
            return "(" + this.x + ", " + this.y + ")";
        }
    }

    //セグメント
    export class Segment {
        label: Label = new Label(-1);
        //始点と終点で初期化
        constructor(public start: Point, public end: Point) {
        }
        //重心を返す
        center(): Point {
            return this.start.added(this.end);
        }
        toString(): string {
            return "[ " + this.start.toString() + " ~ " + this.end.toString() + ": " + this.label.toNumber() + " ]";
        }
    }

    //ストローク
    export class Stroke {
        //点群で初期化
        constructor(public points?: Array<Point>) {
        }
        //空にする
        clear(): void {
            this.points.length = 0;
        }
        //複製を返す
        clone(): Stroke {
            return new Stroke(this.points);
        }
        //空かどうかを返す
        empty(): boolean {
            return this.points.length == 0;
        }
        toString(): string {
            return this.points == null ? "" : this.points.toString();
        }
        //セグメント群に変換する
        segments(label: number): Array<Segment> {
            var segments: Array<Segment> = [];
            var gap: boolean = true;
            var previous: Point;
            this.points.forEach((point) => {
                if (point == null) {
                    gap = true;
                } else {
                    if (gap) {
                        gap = false;
                    } else {
                        var segment = new Segment(previous, point);
                        segment.label = new Label(label);
                        segments.push(segment);
                    }
                    previous = point;
                }
            });
            return segments;
        }
    }

    //画像
    export class Mat {
        //横縦の長さ
        public width: number;
        public height: number;
        //画素の値
        public data: Uint8Array;

        //縦横と画素値で初期化
        constructor(width: number, height: number, data: Uint8Array);
        //ImageDataからのキャスト
        constructor(imageData: ImageData);
        //オーバーロードのためのダミー
        constructor(arg1: any, arg2?: number, arg3?: Uint8Array) {
            if (arg1 instanceof ImageData) {
                this.width = arg1.width;
                this.height = arg1.height;
                this.data = arg1.data;
            } else {
                this.width = arg1;
                this.height = arg2;
                this.data = arg3;
            }
        }

        //点に対応する画素値を返す
        at(point: Point): Rgb;
        //点に画素値を設定する
        at(point: Point, value: Rgb);
        //インデックスに対応する画素値を返す
        at(index: number): Rgb;
        //インデックスに画素値を設定する
        at(index: number, value: Rgb);
        //オーバーロードのためのダミー
        at(arg1: any, arg2?: any): Rgb {
            //点ならインデックスに変換する
            var index: number = (arg1 instanceof Point) ? this.point2Index(arg1) : arg1;
            if (arg2 instanceof Rgb) {
                //画素値を設定する
                this.data[index * 4] = arg2.r;
                this.data[index * 4 + 1] = arg2.g;
                this.data[index * 4 + 2] = arg2.b;
                this.data[index * 4 + 3] = 255;
            } else {
                //画素値を返す
                return new Rgb(this.data[index * 4], this.data[index * 4 + 1], this.data[index * 4 + 2]);
            }
        }

        //複製を返す
        clone(): Mat {
            return new Mat(this.width, this.height, this.data);
        }

        //画素を走査して処理する
        forPixels(output: Mat, handler: (point: Point, value: Rgb) => Rgb);
        //画素を走査して処理する
        forPixels(handler: (point: Point, value: Rgb) => void);
        //オーバーロードのためのダミー
        forPixels(arg1: any, arg2?: any) {
            if (arg1 instanceof Mat) {
                //画素を走査して処理する
                for (var y = 0; y < this.height; y++) {
                    for (var x = 0; x < this.width; x++) {
                        arg1.at(new Point(x, y), arg2(new Point(x, y), this.at(new Point(x, y))));
                    }
                }
            } else {
                //画素を走査して処理する
                for (var y = 0; y < this.height; y++) {
                    for (var x = 0; x < this.width; x++) {
                        arg1(new Point(x, y), this.at(new Point(x, y)));
                    }
                }
            }
        }

        //点が画像の内側かどうかを返す
        isInside(point: Point): boolean {
            return 0 < point.x && 0 < point.y && point.x < this.width && point.y < this.height;
        }

        //点をインデックスに変換する
        private point2Index(point: Point): number {
            return point.y * this.width + point.x;
        }

        //インデックスを点に変換する
        private index2Point(index: number): Point {
            return new Point(index % this.width, (index - index % this.width) / this.width);
        }

    }

}
