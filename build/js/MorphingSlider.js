"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var EasingFunctions = _interopRequire(require("./easing.js"));

var MorphingSlider = (function () {
    function MorphingSlider() {
        _classCallCheck(this, MorphingSlider);

        this.images = [];
        this.easing = linear;
    }

    _createClass(MorphingSlider, {
        addImage: {
            value: function addImage(morphingImage) {
                this.images.push(morphingImage);
            }
        },
        play: {
            value: function play() {
                var _this = this;

                var t = 0;
                var total = 300;
                var timer = setInterval(function () {
                    if (t >= 300) {
                        clearInterval(timer);
                    }

                    var e = EasingFunctions[_this.easing](t / total);

                    _this.images[0].points.forEach(function (point, index) {
                        _this.images[0].points[index].x = _this.images[1].originalPoints[index].x * e + _this.images[0].originalPoints[index].x * (1 - e);
                        _this.images[0].points[index].y = _this.images[1].originalPoints[index].y * e + _this.images[0].originalPoints[index].y * (1 - e);
                        _this.images[1].points[index].x = _this.images[0].originalPoints[index].x * (1 - e) + _this.images[1].originalPoints[index].x * e;
                        _this.images[1].points[index].y = _this.images[0].originalPoints[index].y * (1 - e) + _this.images[1].originalPoints[index].y * e;
                    });
                    console.log(_this.images[0].points[4].original);
                    _this.images[0].setAlpha((total - t) / total);
                    _this.images[1].setAlpha(t / total);
                    _this.images[0].update();
                    _this.images[1].update();
                    t++;
                }, 6);
            }
        },
        setEasing: {
            value: function setEasing(easing) {
                this.easing = easing;
            }
        },
        clear: {
            value: function clear() {
                this.images = [];
            }
        }
    });

    return MorphingSlider;
})();

module.exports = MorphingSlider;