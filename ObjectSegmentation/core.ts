"use strict"

module Core {

    //セグメントに振るラベル
    export type Label = number;

    class Color<T> {
        constructor(public r: T, public g: T, public b: T) {
        }
    }

    //RGB色
    export class Rgb extends Color<number> {
        //色定数
        public static white = new Rgb(255, 255, 255);
        public static black = new Rgb(0, 0, 0);
        public static red = new Rgb(255, 0, 0);
        public static blue = new Rgb(0, 0, 255);
        public static lime = new Rgb(0, 255, 0);
        public static yellow = new Rgb(255, 255, 0);
        public static aqua = new Rgb(0, 255, 255);
        public static fuchsia = new Rgb(255, 0, 255);
        public static green = new Rgb(0, 128, 0);
        public static navy = new Rgb(0, 0, 128);
        public static standards = ['red', 'blue', 'lime', 'yellow', 'aqua', 'fuchsia', 'green', 'navy'];

        //RGB値で初期化
        constructor(r: number, g: number, b: number) {
            super(r, g, b);
        }
        //色を成分ごとに加算する
        add(color: Rgb): Rgb {
            this.r += color.r;
            this.g += color.g;
            this.b += color.b;
            return this;
        }
        //複製を返す
        clone(): Rgb {
            return new Rgb(this.r, this.g, this.b);
        }
        //色を成分ごとに減算する
        sub(color: Rgb): Rgb {
            this.r -= color.r;
            this.g -= color.g;
            this.b -= color.b;
            return this;
        }
        //色を成分ごとに乗算する
        multiply(num: number): Rgb {
            this.r += num;
            this.g += num;
            this.b += num;
            return this;
        }
        //等色かどうかを返す
        is(rgb: Rgb): boolean {
            return this.r == rgb.r && this.g == rgb.g && this.b == rgb.b;
        }
        static fromString(name: string): Rgb {
            switch (name) {
                case 'red': return Rgb.red; break;
                case 'blue': return Rgb.blue; break;
                case 'lime': return Rgb.lime; break;
                case 'yellow': return Rgb.yellow; break;
                case 'aqua': return Rgb.aqua; break;
                case 'fuchsia': return Rgb.fuchsia; break;
                case 'green': return Rgb.green; break;
                case 'navy': return Rgb.navy; break;
            }
        }
    }

    //点
    export class Point {
        public static Origin = new Point(0, 0);
        public static Up = new Point(0, -1);
        public static UpRight = new Point(1, -1);
        public static Right = new Point(1, 0);
        public static DownRight = new Point(1, 1);
        public static Down = new Point(0, 1);
        public static DownLeft = new Point(-1, 1);
        public static Left = new Point(-1, 0);
        public static UpLeft = new Point(-1, -1);
        public static None = new Point(Infinity, Infinity);
        //座標で初期化
        constructor(public x: number, public y: number) {
        }
        //座標を成分ごとに加算する
        add(point: Point): Point {
            this.x += point.x;
            this.y += point.y;
            return this;
        }
        //座標を成分ごとに加算する
        sub(point: Point): Point {
            this.x -= point.x;
            this.y -= point.y;
            return this;
        }
        //複製を返す
        clone(): Point {
            return new Point(this.x, this.y);
        }
        innerProduct(vector: Point): number {
            return this.x * vector.x + this.y * vector.y;
        }
        //等しいかどうかを返す
        is(point: Point): boolean {
            return this.x == point.x && this.y == point.y;
        }
        multiply(scale: number): Point {
            this.x *= scale;
            this.y *= scale;
            return this;
        }
        //点との距離を返す
        norm(point: Point = Point.Origin): number {
            return Math.sqrt(Math.pow(this.x - point.x, 2) + Math.pow(this.y - point.y, 2));
        }
        normalize(): Point {
            return (this.norm() == 0) ? this : this.multiply(1 / this.norm());
        }
        toString(): string {
            return "(" + this.x + ", " + this.y + ")";
        }
    }

    //セグメント
    export class Segment {
        protected _label: Label = -1;
        //始点と終点で初期化
        constructor(public start: Point = Point.None, public end: Point = Point.None) {
        }
        //重心を返す
        center(): Point {
            return this.start.clone().add(this.end).multiply(0.5);
        }
        direction(): Point {
            return this.end.clone().sub(this.start).normalize();
        }
        label(): Label {
            return this._label;
        }
        labeled(): boolean {
            return this._label != -1;
        }
        toString(): string {
            return "[ " + this.start.toString() + " ~ " + this.end.toString() + ": " + this._label + " ]";
        }
        setLabel(newLabel: Label): void {
            this._label = newLabel;
        }
    }

    export interface Segments extends Array<Segment> { };

    //画像
    export class Mat<T> {
        protected dummy: T;
        //横縦の長さ
        public width: number;
        public height: number;
        //画素の値
        public data: Uint8Array;

        constructor();
        //縦横と画素値で初期化
        constructor(width: number, height: number, data: number[]);
        constructor(width: number, height: number, value: T);
        //ImageDataからのキャスト
        constructor(imageData: ImageData);
        //オーバーロードのためのダミー
        constructor(arg1?: any, arg2?: number, arg3?: any) {
            if (!arg1) {
                this.width = 0;
                this.height = 0;
            } else if (arg1 instanceof ImageData) {
                this.width = arg1.width;
                this.height = arg1.height;
                this.data = arg1.data;
            } else if (arg3 instanceof Array) {
                this.width = arg1;
                this.height = arg2;
                this.data = arg3;
            } else {
                this.width = arg1;
                this.height = arg2;
                this.data = new Uint8Array(this.width * this.height * 4);
                this.forPixels(this,() => arg3);
            }
        }

        //点に対応する画素値を返す
        at(point: Point): T;
        //点に画素値を設定する
        at(point: Point, value: T): void;
        //インデックスに対応する画素値を返す
        at(index: number): T;
        //インデックスに画素値を設定する
        at(index: number, value: T): void;
        //オーバーロードのためのダミー
        at(arg1: any, arg2?: any): any {
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
        clone(): Mat<T> {
            var newData: number[] = [];
            for (var i = 0; i < this.data.length; i++)
                newData.push(this.data[i]);
            return new Mat<T>(this.width, this.height, newData);
        }

        draw(segment: Segment, value: T): void {
            var direction = segment.end.clone().sub(segment.start);
            direction.multiply(1 / (direction.x == 0 ? direction.y == 0 ? 1 : Math.abs(direction.y) : Math.abs(direction.x)));
            for (var p: Point = segment.start.clone(); !p.is(segment.end); p.add(direction))
                this.at(p, value);
            this.at(p, value);
        }

        //画素を走査して処理する
        forPixels(output: Mat<T>, handler: (value: T) => T): void;
        //画素を走査して処理する
        forPixels(handler: (value: T) => void): void;
        //オーバーロードのためのダミー
        forPixels(arg1: any, arg2?: any) {
            if (arg1 instanceof Mat) {
                //画素を走査して処理する
                for (var index = 0; index < this.width * this.height; index++)
                    arg1.at(index, arg2(this.at(index)));
            } else {
                //画素を走査して処理する
                for (var index = 0; index < this.width * this.height; index++)
                    arg1(this.at(index));
            }
        }

        //画素を走査して処理する
        forPixelsWithPoint(output: Mat<T>, handler: (point: Point, value: T) => T): void;
        //画素を走査して処理する
        forPixelsWithPoint(handler: (point: Point, value: T) => void): void;
        //オーバーロードのためのダミー
        forPixelsWithPoint(arg1: any, arg2?: any) {
            if (arg1 instanceof Mat) {
                //画素を走査して処理する
                for (var index = 0; index < this.width * this.height; index++)
                    arg1.at(index, arg2(this.index2Point(index), this.at(index)));
            } else {
                //画素を走査して処理する
                for (var index = 0; index < this.width * this.height; index++)
                    arg1(this.index2Point(index), this.at(index));
            }
        }

        //画素を走査して処理する
        forInnerPixels(handler: (index: number) => void): void {
            for (var index = this.width; index < this.width * this.height - this.width; index++)
                if (0 < index % this.width && index % this.width < this.width - 1)
                    handler(index);
        }

        //点が画像の内側かどうかを返す
        isInside(point: Point): boolean {
            return 0 < point.x && 0 < point.y && point.x < this.width && point.y < this.height;
        }

        copyTo(imageData: ImageData): void {
            for (var i = 0; i < this.data.length; i++)
                imageData.data[i] = this.data[i];
        }

        toString(): string {
            var str = "";
            for (var i = 0; i < this.data.length; i++)
                str += String(this.data[i]) + ", ";
            return str;
        }

        //点をインデックスに変換する
        protected point2Index(point: Point): number {
            return point.y * this.width + point.x;
        }

        //インデックスを点に変換する
        protected index2Point(index: number): Point {
            return new Point(index % this.width,(index - index % this.width) / this.width);
        }

    }

}
