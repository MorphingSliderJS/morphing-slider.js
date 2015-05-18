"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var MorphingImage = (function () {
    function MorphingImage(image, points, faces, stage) {
        _classCallCheck(this, MorphingImage);

        this.domElement = image;
        this.stage = stage;

        this.originalPoints = points;
        this.points = []; //描画する際の動的な座標
        this._clonePoints();

        this.faces = faces;

        this.bitmaps = [];
        this._addBitmaps();
    }

    _createClass(MorphingImage, {
        _clonePoints: {
            value: function _clonePoints() {
                var _this = this;

                this.originalPoints.forEach(function (point, index) {
                    //対応する座標を保持する
                    _this.points[index] = point.clone();
                });
            }
        },
        _addBitmaps: {
            value: function _addBitmaps() {
                var _this = this;

                this.faces.forEach(function (face) {
                    var bmp = new createjs.Bitmap(_this.domElement);
                    var shape = new createjs.Shape();
                    shape.graphics.moveTo(_this.points[face[0]].x, _this.points[face[0]].y).lineTo(_this.points[face[1]].x, _this.points[face[1]].y).lineTo(_this.points[face[2]].x, _this.points[face[2]].y);
                    bmp.mask = shape;
                    _this.bitmaps.push(bmp);
                    _this.stage.addChild(bmp);
                });
            }
        },
        setAlpha: {
            value: function setAlpha(a) {
                var _this = this;

                this.bitmaps.forEach(function (bmp, index) {
                    _this.bitmaps[index].alpha = a;
                });
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
                    _this.bitmaps[index].transformMatrix = _this.bitmaps[index].mask.transformMatrix = matrix;
                });
                this.stage.update();
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

                var matrix = new createjs.Matrix2D(a, b, c, d, tx, ty);
                return matrix;
            }
        }
    });

    return MorphingImage;
})();

module.exports = MorphingImage;