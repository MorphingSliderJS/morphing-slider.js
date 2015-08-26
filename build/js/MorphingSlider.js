"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var MorphingSlider = (function () {
    function MorphingSlider(stageURL) {
        _classCallCheck(this, MorphingSlider);

        this.stage = new createjs.Stage(stageURL);
        this.slides = [];
        this.easing = "linear";
        this.direction = true;
        this.duration = 500;
        this.interval = 1000;
        this.isAnimating = false;
        this.index = 0; //表示している画像のindex
        this.width = 0;
        this.height = 0;

        window.requestAnimationFrame = (function () {
            return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.msRequestAnimationFrame || window.oRequestAnimationFrame || function (f) {
                return window.setTimeout(f, 1000 / 60);
            };
        })();

        window.cancelAnimationFrame = (function () {
            return window.cancelAnimationFrame || window.cancelRequestAnimationFrame || window.webkitCancelAnimationFrame || window.webkitCancelRequestAnimationFrame || window.mozCancelAnimationFrame || window.mozCancelRequestAnimationFrame || window.msCancelAnimationFrame || window.msCancelRequestAnimationFrame || window.oCancelAnimationFrame || window.oCancelRequestAnimationFrame || function (id) {
                window.clearTimeout(id);
            };
        })();

        return this;
    }

    _createClass(MorphingSlider, {
        addSlide: {
            value: function addSlide(src, data, callback) {
                var _this = this;

                var image = new Image();
                image.src = src;
                var morphingImage = new MorphingSlider.Slide(image, data.points, data.faces);
                if (this.slides.length > 0) {
                    //最初以外は描画しない
                    morphingImage.hide();
                }
                this.stage.addChild(morphingImage.container);
                this.slides.push(morphingImage);
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
                //direction : trueで次、falseで前へ

                if (this.isAnimating || this.slides.length < 2) {
                    //アニメーションの重複を防ぐ
                    return this;
                }

                var startTime = new Date();

                var _direction = direction === undefined ? this.direction : direction; //デフォルトはMorphSliderでの設定値

                var afterIndex;
                if (_direction && this.slides.length === this.index + 1) {
                    //向きが通常でいま最後の画像なら
                    afterIndex = 0;
                } else if (!_direction && this.index === 0) {
                    //向きが逆でいま最初の画像なら
                    afterIndex = this.slides.length - 1;
                } else {
                    afterIndex = this.index + (_direction * 2 - 1);
                }
                var before = this.slides[this.index]; //いまのMorphingImage
                var after = this.slides[afterIndex]; //モーフィング後のMorphingImage

                //アニメーションするスライドだけ描画する
                before.show();
                after.show();

                this.stage.setChildIndex(after.container, this.stage.children.length - 1); //afterを最前面に

                var update = (function () {
                    var t = new Date() - startTime;
                    if (t > this.duration) {
                        //window.cancelAnimationFrame(af);
                        before.hide();
                        this.index = afterIndex;
                        this.isAnimating = false;
                        if (callback) {
                            callback.bind(this)();
                        }
                    } else {
                        var e = MorphingSlider.ease[this.easing](t / this.duration);
                        before.points.forEach(function (point, index) {
                            before.points[index].x = Math.round(after.originalPoints[index].x * e + before.originalPoints[index].x * (1 - e));
                            before.points[index].y = Math.round(after.originalPoints[index].y * e + before.originalPoints[index].y * (1 - e));
                            after.points[index].x = Math.round(before.originalPoints[index].x * (1 - e) + after.originalPoints[index].x * e);
                            after.points[index].y = Math.round(before.originalPoints[index].y * (1 - e) + after.originalPoints[index].y * e);
                        });

                        after.setAlpha(e);
                        before.update();
                        after.update();
                        this.stage.update();

                        window.requestAnimationFrame(update);
                    }
                }).bind(this);
                var af = window.requestAnimationFrame(update);

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
                }, _interval + this.duration);
            }
        },
        stop: {
            value: function stop() {
                clearInterval(this.timer);
            }
        },
        clear: {
            value: function clear() {
                this.slides = [];
                this.stage.clear();
                this.index = 0;
                this.stage.removeAllChildren();
                return this;
            }
        }
    });

    return MorphingSlider;
})();

MorphingSlider.Slide = (function () {
    function Slide(image, points, faces) {
        _classCallCheck(this, Slide);

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

    _createClass(Slide, {
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

    return Slide;
})();

MorphingSlider.ease = {
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