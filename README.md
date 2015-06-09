# image-morphing

## 目的
WebのUIとして気軽に使えるような画像のモーフィング効果を作る！  
ECサイトのモデル写真のスライドをモーフィングにする。

## 実装の目標
２枚以上の画像に対して、対応する点を与えると（たとえば、顔の位置をそれぞれ）モーフィングする。    
テクスチャマッピングによる画像の変形と、透明度を変化させるフェードイン・アウトを組み合わせることで実現できる（のではないかと思う）。

## テクスチャマッピング
画像を複数の三角形に分割し、アフィン変換によりそれぞれを歪ませ描画することで実現する。  
[Canvasを使った例1](http://akibahideki.com/blog/html5-canvas-1/canvas.html)  
[Canvasを使った例2](http://jsdo.it/yaju3D/oZC3)  
上の例など多くは格子状に並べた三角形を使っているので簡単だが、任意の点で画像を分割したい（任意の座標を持つ三角形で分割したい）ので、  
３点の変換前・変換後の座標からアフィン変換行列を求めるという処理が必要になる。  
これは[こちら](http://masabloggers.blogspot.jp/2013/01/php_19.html)を参考にして実装した。

## ドロネー図
テクスチャマッピングの際に分割する三角形を任意の点（ぽちぽちクリックして）から生成したい場合、  
ドロネー図（ドロネー三角形分割）を利用することになる。  
[ドロネー図 - Wikipedia](http://ja.wikipedia.org/wiki/%E3%83%89%E3%83%AD%E3%83%8D%E3%83%BC%E5%9B%B3)  
ドロネー図の実装は結構ややこしい（頑張れば自分で書けるけどめんどくさいレベル）ので、d3.jsのメソッドを使うことにした。  

MorphingSlider.js
====

MorphingSliderJS is the library for morphing animation on website with JavaScript and Canvas.
![Demo gif of morphing animation](https://github.com/MorphingSliderJS/MorphingSliderJS/wiki/images/demo.gif)

## Description
You can put morphing animations in to your website by configuring continuous images and their corresponding points.
![Defining corresponding points](https://github.com/MorphingSliderJS/MorphingSliderJS/wiki/images/sample.png)
This is realized by triangulating each image and transforming them.
So you need to prepare HTMLImageObjects and the data of points and faces (triangles), which created by Morphing Editor.

## Morphing Editor
[Here](https://image-morphing.herokuapp.com/)

###How to Use

## Requirement
This library depends on easelJS and d3.js
*easelJS* http://www.createjs.com/
*d3.js* http://d3js.org/

## Usage
Load easelJS, d3.js, and MorphingSlider.js.
#### index.html
    <canvas id="mySlider"></canvas>

    <script src="easeljs-0.8.1.js"></sctipt>
    <script src="d3.js"></sctipt>
    <script src="MorphingSlider.js"></sctipt>

## Install

## Contribution

## Author
[mildsummer](https://github.com/mildsummer)
