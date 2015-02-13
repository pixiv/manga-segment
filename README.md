Interactive Manga Segmention
====

ラフな線を描くだけで，漫画のコマ画像を領域分割します．

## 説明
漫画のコマ画像に，ユーザーがラフに線を描くと，それを基に画像内のオブジェクトを分離します．
画像内のオブジェクトは，キャラクターや吹き出し，背景などを指します．
線には色を指定でき，異なる色で描いた線はそれぞれ別のオブジェクトとみなされます．

以下の論文の TypeScript による実装で，基本的な画像処理から関数の最適化までを，ブラウザ上で実現しています．

Y. Aramaki, et al. "Interactive segmentation for manga." ACM SIGGRAPH 2014 Posters.

## 要件
JQuery 2.1.1+，TypeScript 1.4+ (Visual Studio 2013+)

サンプルは，Chrome 40+ / Firefox 35+ / Internet Explorer 11+ で実行可能です．

## 使い方
### とにかくサンプルを動かす
ブラウザで index.html を開くことで，画像が読み込まれます．
その画像の上に，分けたい部分毎に色の異なる線を描くと，画像内のオブジェクトが分割された状態で表示されます．
さらに線を加えていくと，その度に結果が更新されます．

### Javascript を HTMLに組み込む
JQuery と共に以下のコンパイル済みの Javascript を読み込み，

    <script src="Scripts/cv.js"></script>
    <script src="Scripts/labeling.js"></script>
    <script src="Scripts/ui.js"></script>

以下のタグを任意の場所に配置してください．

    <div id="object_segmentation"></div>

### Typescript を編集してコンパイルする
TypeScript は，Visual Studio で ObjectSegmentation.sln を開けば，編集・コンパイルできます．


## ライセンス

[MIT](http://opensource.org/licenses/mit-license.php)

## 作者

[arayuji](https://github.com/arayuji)
