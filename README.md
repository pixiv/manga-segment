Interactive Manga Segmention
====

ラフな線を描くだけで，漫画のコマ画像を領域分割します．

## 説明
漫画のコマ画像に，ユーザーがラフに線を描くと，それを基に画像内のオブジェクトを分離します．
画像内のオブジェクトは，キャラクターや吹き出し，背景などを指します．
線には色を指定でき，異なる色で描いた線はそれぞれ別のオブジェクトとみなされます．

以下の論文の TypeScript による実装です．

Y. Aramaki, et al. "Interactive segmentation for manga." ACM SIGGRAPH 2014 Posters.

## デモ
http://inside.pixiv.net/

## 要件
TypeScript 1.4+ (Visual Studio 2013+)

Javascript は，Chrome 40+ / Firefox 35+ / Internet Explorer 11+ で実行可能です．

## 使い方
TypeScript は，Visual Studio で ObjectSegmentation.sln を開いてビルドすることで Javascript に変換されます．

ブラウザで index.html を開くことで，画像が読み込まれます．
その画像の上に，分けたい部分毎に色の異なる線を描くと，画像内のオブジェクトが分割された状態で表示されます．
さらに線を加えていくと，その度に結果が更新されます．

## ライセンス

[MIT](http://opensource.org/licenses/mit-license.php)

## 作者

[arayuji](https://github.com/arayuji)
