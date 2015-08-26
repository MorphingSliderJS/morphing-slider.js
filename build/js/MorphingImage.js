"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var MorphingImage = (function () {
    function MorphingImage(image, points, faces) {
        _classCallCheck(this, MorphingImage);

        this.domElement = image;

        this.originalPoints = points;

        this.points = []; //描画する際の動的な座標
        this._clonePoints();

        this.faces = faces;

        this.container = new createjs.Container();

        this._addBitmaps();
        //this.container.children = this.container.children.concat(this.container.children);

        return this;
    }

    _createClass(MorphingImage, {
        _clonePoints: {
            value: function _clonePoints() {
                var _this = this;

                this.originalPoints.forEach(function (point, index) {
                    //対応する座標を保持する
                    _this.points[index] = { x: point.x, y: point.y };
                });
            }
        },
        _addBitmaps: {
            value: function _addBitmaps() {
                var _this = this;

                //シェイプの作成
                if (window.navigator.userAgent.toLowerCase().indexOf("chrome") < 0) {
                    this.faces.forEach(function (face) {
                        var bmp = new createjs.Bitmap(_this.domElement);
                        var shape = new createjs.Shape();

                        //Chrome以外のブラウザだとメッシュのすき間が見えてしまうのを改善する
                        var n = 1.01; //拡大率
                        var g = {
                            x: (_this.points[face[0]].x + _this.points[face[1]].x + _this.points[face[2]].x) / 3,
                            y: (_this.points[face[0]].y + _this.points[face[1]].y + _this.points[face[2]].y) / 3
                        }; //重心
                        var d = { x: g.x * (n - 1), y: g.y * (n - 1) }; //座標のずれ

                        shape.graphics.moveTo(_this.points[face[0]].x * n - d.x, _this.points[face[0]].y * n - d.y).lineTo(_this.points[face[1]].x * n - d.x, _this.points[face[1]].y * n - d.y).lineTo(_this.points[face[2]].x * n - d.x, _this.points[face[2]].y * n - d.y);
                        bmp.mask = shape;
                        _this.container.addChild(bmp);
                    });
                } else {
                    console.log("chrome");
                    this.faces.forEach(function (face) {
                        var bmp = new createjs.Bitmap(_this.domElement);
                        var shape = new createjs.Shape();
                        shape.graphics.moveTo(_this.points[face[0]].x, _this.points[face[0]].y).lineTo(_this.points[face[1]].x, _this.points[face[1]].y).lineTo(_this.points[face[2]].x, _this.points[face[2]].y);
                        bmp.mask = shape;
                        _this.container.addChild(bmp);
                    });
                }
            }
        },
        setAlpha: {
            value: function setAlpha(a) {
                this.container.alpha = a;
                return this;
            }
        },
        show: {
            value: function show() {
                this.container.visible = true;
                return this;
            }
        },
        hide: {
            value: function hide() {
                this.container.visible = false;
                return this;
            }
        },
        update: {
            value: function update() {
                var _this = this;

                //アフィン変換行列を求め、パーツを描画
                this.faces.forEach(function (face, index) {
                    var points1 = [_this.originalPoints[face[0]], _this.originalPoints[face[1]], _this.originalPoints[face[2]]];
                    var points2 = [_this.points[face[0]], _this.points[face[1]], _this.points[face[2]]];
                    var matrix = _this._getAffineTransform(points1, points2);
                    _this.container.children[index].transformMatrix = _this.container.children[index].mask.transformMatrix = matrix;
                });
                return this;
            }
        },
        _getAffineTransform: {
            value: function _getAffineTransform(points1, points2) {
                var a, b, c, d, tx, ty;

                // 連立方程式を解く
                a = (points2[0].x * points1[1].y + points2[1].x * points1[2].y + points2[2].x * points1[0].y - points2[0].x * points1[2].y - points2[1].x * points1[0].y - points2[2].x * points1[1].y) / (points1[0].x * points1[1].y + points1[1].x * points1[2].y + points1[2].x * points1[0].y - points1[0].x * points1[2].y - points1[1].x * points1[0].y - points1[2].x * points1[1].y);
                b = (points2[0].y * points1[1].y + points2[1].y * points1[2].y + points2[2].y * points1[0].y - points2[0].y * points1[2].y - points2[1].y * points1[0].y - points2[2].y * points1[1].y) / (points1[0].x * points1[1].y + points1[1].x * points1[2].y + points1[2].x * points1[0].y - points1[0].x * points1[2].y - points1[1].x * points1[0].y - points1[2].x * points1[1].y);
                c = (points1[0].x * points2[1].x + points1[1].x * points2[2].x + points1[2].x * points2[0].x - points1[0].x * points2[2].x - points1[1].x * points2[0].x - points1[2].x * points2[1].x) / (points1[0].x * points1[1].y + points1[1].x * points1[2].y + points1[2].x * points1[0].y - points1[0].x * points1[2].y - points1[1].x * points1[0].y - points1[2].x * points1[1].y);
                d = (points1[0].x * points2[1].y + points1[1].x * points2[2].y + points1[2].x * points2[0].y - points1[0].x * points2[2].y - points1[1].x * points2[0].y - points1[2].x * points2[1].y) / (points1[0].x * points1[1].y + points1[1].x * points1[2].y + points1[2].x * points1[0].y - points1[0].x * points1[2].y - points1[1].x * points1[0].y - points1[2].x * points1[1].y);
                tx = (points1[0].x * points1[1].y * points2[2].x + points1[1].x * points1[2].y * points2[0].x + points1[2].x * points1[0].y * points2[1].x - points1[0].x * points1[2].y * points2[1].x - points1[1].x * points1[0].y * points2[2].x - points1[2].x * points1[1].y * points2[0].x) / (points1[0].x * points1[1].y + points1[1].x * points1[2].y + points1[2].x * points1[0].y - points1[0].x * points1[2].y - points1[1].x * points1[0].y - points1[2].x * points1[1].y);
                ty = (points1[0].x * points1[1].y * points2[2].y + points1[1].x * points1[2].y * points2[0].y + points1[2].x * points1[0].y * points2[1].y - points1[0].x * points1[2].y * points2[1].y - points1[1].x * points1[0].y * points2[2].y - points1[2].x * points1[1].y * points2[0].y) / (points1[0].x * points1[1].y + points1[1].x * points1[2].y + points1[2].x * points1[0].y - points1[0].x * points1[2].y - points1[1].x * points1[0].y - points1[2].x * points1[1].y);

                return new createjs.Matrix2D(a, b, c, d, tx, ty);
            }
        }
    });

    return MorphingImage;
})();

module.exports = MorphingImage;