"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var MorphingSlider = (function () {
    function MorphingSlider(stageURL) {
        _classCallCheck(this, MorphingSlider);

        this.stage = new createjs.Stage(stageURL);
        this.images = [];
        this.transformEasing = this.alphaEasing = "linear";
        this.direction = true;
        this.dulation = 200;
        this.interval = 1000;
        this.isAnimating = false;
        this.index = 0; //表示している画像のindex
        this.width = 0;
        this.height = 0;
        return this;
    }

    _createClass(MorphingSlider, {
        addSlide: {
            value: function addSlide(src, data, callback) {
                var _this = this;

                var image = new Image();
                image.src = src;
                var morphingImage = new MorphingImage(image, data.points, data.faces);
                if (this.images.length > 0) {
                    //最初以外は描画しない
                    morphingImage.setAlpha(0);
                }
                this.stage.addChild(morphingImage.container);
                this.images.push(morphingImage);
                image.onload = function () {
                    _this.width = _this.stage.canvas.width = _this.width > image.width ? _this.width : image.width;
                    _this.height = _this.stage.canvas.height = _this.height > image.height ? _this.height : image.height;
                    _this.stage.update();
                    if (callback !== undefined) {
                        callback.bind(_this)();
                    }
                };
                return this;
            }
        },
        morph: {
            value: function morph(direction, callback) {
                var _this = this;

                //direction : trueで次、falseで前へ
                if (this.isAnimating || this.images.length < 2) {
                    //アニメーションの重複を防ぐ
                    return this;
                }

                var _direction = direction === undefined ? this.direction : direction; //デフォルトはMorphSliderでの設定値

                var t = 0;
                var interval = 16.66; //60fps
                var total = this.dulation / interval;

                var afterIndex;
                if (_direction && this.images.length === this.index + 1) {
                    //向きが通常でいま最後の画像なら
                    afterIndex = 0;
                } else if (!_direction && this.index === 0) {
                    //向きが逆でいま最初の画像なら
                    afterIndex = this.images.length - 1;
                } else {
                    afterIndex = this.index + (_direction * 2 - 1);
                }
                var before = this.images[this.index]; //いまのMorphingImage
                var after = this.images[afterIndex]; //モーフィング後のMorphingImage

                this.stage.setChildIndex(after.container, this.stage.children.length - 1); //afterを最前面に
                var timer = setInterval(function () {
                    var e = EasingFunctions[_this.transformEasing](t / total);
                    before.points.forEach(function (point, index) {
                        before.points[index].x = after.originalPoints[index].x * e + before.originalPoints[index].x * (1 - e);
                        before.points[index].y = after.originalPoints[index].y * e + before.originalPoints[index].y * (1 - e);
                        after.points[index].x = before.originalPoints[index].x * (1 - e) + after.originalPoints[index].x * e;
                        after.points[index].y = before.originalPoints[index].y * (1 - e) + after.originalPoints[index].y * e;
                    });

                    e = EasingFunctions[_this.alphaEasing](t / total);
                    //before.setAlpha(1-e);
                    after.setAlpha(e);
                    before.update();
                    after.update();
                    _this.stage.update();

                    t++;
                    if (t > total) {
                        _this.index = afterIndex;
                        clearInterval(timer);
                        _this.isAnimating = false;
                        if (callback) {
                            callback.bind(_this)();
                        }
                    }
                }, interval);
                this.isAnimating = true;
                return this;
            }
        },
        play: {
            value: function play(direction, interval, callback) {
                var _this = this;

                //続けてモーフィング direction: true=>前へ false=>後へ, interval: モーフィング間隔
                var _direction = direction === undefined ? this.direction : direction;
                var _interval = interval === undefined ? this.interval : interval;
                var _callback = callback === undefined ? function () {
                    return null;
                } : callback;
                this.timer = setInterval(function () {
                    _this.morph.bind(_this)(_direction, callback);
                }, _interval + this.dulation);
            }
        },
        stop: {
            value: function stop() {
                clearInterval(this.timer);
            }
        },
        clear: {
            value: function clear() {
                this.images = [];
                this.stage.clear();
                this.index = 0;
                this.stage.removeAllChildren();
                return this;
            }
        }
    });

    return MorphingSlider;
})();

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

                this.faces.forEach(function (face) {
                    var bmp = new createjs.Bitmap(_this.domElement);
                    var shape = new createjs.Shape();
                    shape.graphics.moveTo(_this.points[face[0]].x, _this.points[face[0]].y).lineTo(_this.points[face[1]].x, _this.points[face[1]].y).lineTo(_this.points[face[2]].x, _this.points[face[2]].y);
                    bmp.mask = shape;
                    _this.container.addChild(bmp);
                });
            }
        },
        setAlpha: {
            value: function setAlpha(a) {
                this.container.alpha = a;
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

var EasingFunctions = {
    // no easing, no acceleration
    linear: function linear(t) {
        return t;
    },
    // accelerating from zero velocity
    easeInQuad: function easeInQuad(t) {
        return t * t;
    },
    // decelerating to zero velocity
    easeOutQuad: function easeOutQuad(t) {
        return t * (2 - t);
    },
    // acceleration until halfway, then deceleration
    easeInOutQuad: function easeInOutQuad(t) {
        return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    },
    // accelerating from zero velocity
    easeInCubic: function easeInCubic(t) {
        return t * t * t;
    },
    // decelerating to zero velocity
    easeOutCubic: function easeOutCubic(t) {
        return --t * t * t + 1;
    },
    // acceleration until halfway, then deceleration
    easeInOutCubic: function easeInOutCubic(t) {
        return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
    },
    // accelerating from zero velocity
    easeInQuart: function easeInQuart(t) {
        return t * t * t * t;
    },
    // decelerating to zero velocity
    easeOutQuart: function easeOutQuart(t) {
        return 1 - --t * t * t * t;
    },
    // acceleration until halfway, then deceleration
    easeInOutQuart: function easeInOutQuart(t) {
        return t < 0.5 ? 8 * t * t * t * t : 1 - 8 * --t * t * t * t;
    },
    // accelerating from zero velocity
    easeInQuint: function easeInQuint(t) {
        return t * t * t * t * t;
    },
    // decelerating to zero velocity
    easeOutQuint: function easeOutQuint(t) {
        return 1 + --t * t * t * t * t;
    },
    // acceleration until halfway, then deceleration
    easeInOutQuint: function easeInOutQuint(t) {
        return t < 0.5 ? 16 * t * t * t * t * t : 1 + 16 * --t * t * t * t * t;
    }
};