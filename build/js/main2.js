(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _easingJs = require('./easing.js');

var _easingJs2 = _interopRequireDefault(_easingJs);

var _MorphingSliderJs = require('./MorphingSlider.js');

var _MorphingSliderJs2 = _interopRequireDefault(_MorphingSliderJs);

var _MorphingImageJs = require('./MorphingImage.js');

var _MorphingImageJs2 = _interopRequireDefault(_MorphingImageJs);

var img1 = document.getElementById('model1');
var img2 = document.getElementById('model2');

var images = [img1, img2];

img2.onload = init;

d3.select('#transform-easing-select').selectAll('option').data(Object.keys(_easingJs2['default'])).enter().append('option').attr('value', function (d) {
    return d;
}).html(function (d) {
    return d;
});
d3.select('#alpha-easing-select').selectAll('option').data(Object.keys(_easingJs2['default'])).enter().append('option').attr('value', function (d) {
    return d;
}).html(function (d) {
    return d;
});

function init() {

    var points = [new createjs.Point(0, 0), new createjs.Point(img1.width, 0), new createjs.Point(img1.width, img1.height), new createjs.Point(0, img1.height), new createjs.Point(img1.width / 2, img1.height / 2)];

    var points2 = [new createjs.Point(0, 0), new createjs.Point(img2.width, 0), new createjs.Point(img2.width, img2.height), new createjs.Point(0, img2.height), new createjs.Point(img2.width / 2, img2.height / 2)];

    var faces = createFaces(points);
    var faces2 = createFaces(points2);
    var stage = new createjs.Stage('mycanvas');
    var mi = new _MorphingImageJs2['default'](img1, points, faces, stage);
    var mi2 = new _MorphingImageJs2['default'](img2, points2, faces2, stage);
    var ms = new _MorphingSliderJs2['default']();
    ms.addImage(mi);
    ms.addImage(mi2);
    drawPoint();

    var playButton = document.getElementById('play-button');
    playButton.addEventListener('click', function () {
        if (ms.isAnimating) {
            return false;
        }
        ms.clear();
        mi = new _MorphingImageJs2['default'](img1, points, faces, stage);
        mi2 = new _MorphingImageJs2['default'](img2, points2, faces2, stage);
        ms.addImage(mi);
        ms.addImage(mi2);
        ms.play();
    });

    img1.addEventListener('click', function (e) {
        var rect = e.target.getBoundingClientRect();
        var point = new createjs.Point(e.clientX - rect.left, e.clientY - rect.top);
        points.push(point);
        points2.push(point.clone());
        faces = createFaces(points);
        faces2 = createFaces(points2);
        drawPoint();
    });

    function drawPoint() {
        d3.select('#container1 .points').selectAll('div').data(points).enter().append('div').style('left', function (d) {
            return d.x + 'px';
        }).style('top', function (d) {
            return d.y + 'px';
        }).call(d3.behavior.drag().on('drag', function (d, i) {
            points[i].x = d3.event.x;
            points[i].y = d3.event.y;
            d3.select(this).style('left', points[i].x + 'px').style('top', points[i].y + 'px');
        }));
        d3.select('#container2 .points').selectAll('div').data(points2).enter().append('div').style('left', function (d) {
            return d.x + 'px';
        }).style('top', function (d) {
            return d.y + 'px';
        }).call(d3.behavior.drag().on('drag', function (d, i) {
            points2[i].x = d3.event.x;
            points2[i].y = d3.event.y;
            d3.select(this).style('left', points2[i].x + 'px').style('top', points2[i].y + 'px');
        }));
    }

    //イージングの切り替え
    document.getElementById('transform-easing-select').addEventListener('change', function () {
        ms.transformEasing = this.options[this.selectedIndex].value;
    });
    document.getElementById('alpha-easing-select').addEventListener('change', function () {
        ms.alphaEasing = this.options[this.selectedIndex].value;
    });

    //アニメーション時間の設定
    var dulationInput = document.getElementById('dulation-input');
    dulationInput.value = ms.dulation;
    document.getElementById('dulation-button').addEventListener('click', function () {
        ms.dulation = dulationInput.value;
    });
}

function createFaces(points) {
    //ボロノイ変換関数
    var voronoi = d3.geom.voronoi().x(function (d) {
        return d.x;
    }).y(function (d) {
        return d.y;
    });

    //ドロネー座標データ取得
    var faces = voronoi.triangles(points);
    faces.forEach(function (face, index) {
        faces[index] = [points.indexOf(faces[index][0]), points.indexOf(faces[index][1]), points.indexOf(faces[index][2])];
    });

    return faces;
}

var Point = React.createClass({
    displayName: 'Point',

    getInitialState: function getInitialState() {
        return {
            isMouseDown: false
        };
    },
    handleMouseDown: function handleMouseDown(e) {
        this.props.startMovingPoint(this.props.index);
    },
    render: function render() {
        return React.createElement('div', { className: 'editor-image-point', style: {
                left: this.props.x,
                top: this.props.y
            }, id: 'editor-image-point-' + this.props.key, onMouseDown: this.handleMouseDown });
    }
});

var Points = React.createClass({
    displayName: 'Points',

    getInitialState: function getInitialState() {
        return {
            movingPoint: -1 //動かしているポイントのインデックス
        };
    },
    handleMouseMove: function handleMouseMove(e) {
        if (this.state.movingPoint >= 0) {
            console.log(e.target);
            var rect = React.findDOMNode(this.refs.div).getBoundingClientRect();
            this.props.movePoint(this.props.index, this.state.movingPoint, { x: e.clientX - rect.left, y: e.clientY - rect.top });
        }
    },
    handleMouseUp: function handleMouseUp() {
        this.setState({ movingPoint: -1 });
    },
    startMovingPoint: function startMovingPoint(index) {
        this.setState({ movingPoint: index });
    },
    render: function render() {
        var _this = this;

        var points = this.props.points.map(function (point, index) {
            return React.createElement(Point, { key: 'points-' + _this.props.index + '-' + index, index: index, x: point.x, y: point.y, startMovingPoint: _this.startMovingPoint });
        });
        return React.createElement(
            'div',
            { ref: 'div', className: 'editor-image-points-container', onMouseMove: this.handleMouseMove, onMouseUp: this.handleMouseUp, style: { width: this.props.width, height: this.props.height } },
            points
        );
    }
});

var Images = React.createClass({
    displayName: 'Images',

    render: function render() {
        var _this2 = this;

        var images = this.props.images.map(function (image, index) {
            return React.createElement(
                'div',
                { className: 'editor-image-container', key: 'image-container-' + index },
                React.createElement(Points, { index: index, width: image.width, height: image.height, points: image.points ? image.points : [], movePoint: _this2.props.movePoint }),
                React.createElement('img', { index: index, src: image.src, ref: 'image' + index, onDrop: function (e) {
                        e.preventDefault();
                    } })
            );
        });
        return React.createElement(
            'div',
            { id: 'editor-images' },
            images
        );
    }
});

var Editor = React.createClass({
    displayName: 'Editor',

    handleFileSelect: function handleFileSelect(evt) {
        var _this3 = this;

        evt.stopPropagation();
        evt.preventDefault();

        console.log(evt);
        var files = evt.dataTransfer.files; // FileList object
        console.log(files);

        // Loop through the FileList and render image files as thumbnails.
        for (var i = 0, file; file = files[i]; i++) {

            // Only process image files.
            if (!file.type.match('image.*')) {
                continue;
            }

            var reader = new FileReader();

            // Closure to capture the file information.
            reader.onload = function (e) {
                console.log(e);
                _this3.props.addImage(e.target.result);
            };

            // Read in the image file as a data URL.
            reader.readAsDataURL(file);
        }
    },
    handleDragOver: function handleDragOver(evt) {
        evt.stopPropagation();
        evt.preventDefault();
        evt.dataTransfer.dropEffect = 'copy'; // Explicitly show this is a copy.
    },
    render: function render() {
        return React.createElement(
            'div',
            { id: 'editor' },
            React.createElement(Images, { images: this.props.images, ref: 'images', movePoint: this.props.movePoint }),
            React.createElement('div', { id: 'editor-dropzone', onDrop: this.handleFileSelect, onDragOver: this.handleDragOver })
        );
    }
});

var App = React.createClass({
    displayName: 'App',

    getInitialState: function getInitialState() {
        return {
            images: []
        };
    },
    addImage: function addImage(dataURL) {
        var _this4 = this;

        console.log(dataURL);
        var newImage = {
            src: dataURL,
            index: this.state.images.length
        };
        this.setState({ images: this.state.images.concat([newImage]) }, function () {
            var imageDOM = React.findDOMNode(_this4.refs.editor.refs.images.refs['image' + newImage.index]); //Reactによりレンダー済みのDOM
            var width = imageDOM.width,
                height = imageDOM.height;
            var points, faces;
            if (newImage.index > 0) {
                points = _this4.state.images[0].points.concat();
            } else {
                points = [{ x: 0, y: 0 }, { x: width, y: 0 }, { x: width, y: height }, { x: 0, y: height }, { x: width / 2, y: height / 2 }];
            }
            var images = _this4.state.images.concat();
            images[newImage.index].points = points;
            images[newImage.index].width = width;
            images[newImage.index].height = height;
            _this4.setState({ images: images });
        });
    },
    movePoint: function movePoint(firstIndex, secondIndex, point) {
        console.log(secondIndex);
        var images = this.state.images.concat();
        images[firstIndex].points[secondIndex] = point;
        console.log(images);
        this.setState({ images: images });
    },
    render: function render() {
        return React.createElement(
            'div',
            { id: 'app' },
            React.createElement(Editor, { images: this.state.images, addImage: this.addImage, ref: 'editor', movePoint: this.movePoint }),
            React.createElement('canvas', { id: 'viewer', width: this.state.images[0] ? this.state.images[0].width : 300, height: this.state.images[0] ? this.state.images[0].height : 300 })
        );
    }
});

React.render(React.createElement(App, null), document.getElementById('app-container'));

},{"./MorphingImage.js":2,"./MorphingSlider.js":3,"./easing.js":4}],2:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

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

    _createClass(MorphingImage, [{
        key: "_clonePoints",
        value: function _clonePoints() {
            var _this = this;

            this.originalPoints.forEach(function (point, index) {
                //対応する座標を保持する
                _this.points[index] = point.clone();
            });
        }
    }, {
        key: "_addBitmaps",
        value: function _addBitmaps() {
            var _this2 = this;

            this.faces.forEach(function (face) {
                var bmp = new createjs.Bitmap(_this2.domElement);
                var shape = new createjs.Shape();
                shape.graphics.moveTo(_this2.points[face[0]].x, _this2.points[face[0]].y).lineTo(_this2.points[face[1]].x, _this2.points[face[1]].y).lineTo(_this2.points[face[2]].x, _this2.points[face[2]].y);
                bmp.mask = shape;
                _this2.bitmaps.push(bmp);
                _this2.stage.addChild(bmp);
            });
        }
    }, {
        key: "setAlpha",
        value: function setAlpha(a) {
            var _this3 = this;

            this.bitmaps.forEach(function (bmp, index) {
                _this3.bitmaps[index].alpha = a;
            });
        }
    }, {
        key: "update",
        value: function update() {
            var _this4 = this;

            //アフィン変換行列を求め、パーツを描画
            this.faces.forEach(function (face, index) {
                var points1 = [_this4.originalPoints[face[0]], _this4.originalPoints[face[1]], _this4.originalPoints[face[2]]];
                var points2 = [_this4.points[face[0]], _this4.points[face[1]], _this4.points[face[2]]];
                var matrix = _this4._getAffineTransform(points1, points2);
                _this4.bitmaps[index].transformMatrix = _this4.bitmaps[index].mask.transformMatrix = matrix;
            });
            this.stage.update();
        }
    }, {
        key: "_getAffineTransform",
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
    }]);

    return MorphingImage;
})();

exports["default"] = MorphingImage;
module.exports = exports["default"];

},{}],3:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _easingJs = require("./easing.js");

var _easingJs2 = _interopRequireDefault(_easingJs);

var MorphingSlider = (function () {
    function MorphingSlider() {
        _classCallCheck(this, MorphingSlider);

        this.images = [];
        this.transformEasing = this.alphaEasing = "linear";
        this.dulation = 200;
        this.isAnimating = false;
        return this;
    }

    _createClass(MorphingSlider, [{
        key: "addImage",
        value: function addImage(morphingImage) {
            this.images.push(morphingImage);
            return this;
        }
    }, {
        key: "play",
        value: function play() {
            var _this = this;

            if (this.isAnimating) {
                //アニメーションの重複を防ぐ
                return this;
            }
            var t = 0;
            var total = this.dulation * 60 / 1000;
            var interval = 1000 / 60; //60fps
            var timer = setInterval(function () {
                if (t >= total) {
                    clearInterval(timer);
                    _this.isAnimating = false;
                }

                var e = _easingJs2["default"][_this.transformEasing](t / total);
                _this.images[0].points.forEach(function (point, index) {
                    _this.images[0].points[index].x = _this.images[1].originalPoints[index].x * e + _this.images[0].originalPoints[index].x * (1 - e);
                    _this.images[0].points[index].y = _this.images[1].originalPoints[index].y * e + _this.images[0].originalPoints[index].y * (1 - e);
                    _this.images[1].points[index].x = _this.images[0].originalPoints[index].x * (1 - e) + _this.images[1].originalPoints[index].x * e;
                    _this.images[1].points[index].y = _this.images[0].originalPoints[index].y * (1 - e) + _this.images[1].originalPoints[index].y * e;
                });

                e = _easingJs2["default"][_this.alphaEasing](t / total);
                _this.images[0].setAlpha(1 - e);
                _this.images[1].setAlpha(e);
                _this.images[0].update();
                _this.images[1].update();
                t++;
            }, interval);
            this.isAnimating = true;
            return this;
        }
    }, {
        key: "clear",
        value: function clear() {
            this.images = [];
            return this;
        }
    }]);

    return MorphingSlider;
})();

exports["default"] = MorphingSlider;
module.exports = exports["default"];

},{"./easing.js":4}],4:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
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

exports["default"] = EasingFunctions;
module.exports = exports["default"];

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvdXNlcjEvRGVza3RvcC9pbWFnZS1tb3JwaGluZy9zcmMvanMvbWFpbjIuanMiLCIvVXNlcnMvdXNlcjEvRGVza3RvcC9pbWFnZS1tb3JwaGluZy9zcmMvanMvTW9ycGhpbmdJbWFnZS5qcyIsIi9Vc2Vycy91c2VyMS9EZXNrdG9wL2ltYWdlLW1vcnBoaW5nL3NyYy9qcy9Nb3JwaGluZ1NsaWRlci5qcyIsIi9Vc2Vycy91c2VyMS9EZXNrdG9wL2ltYWdlLW1vcnBoaW5nL3NyYy9qcy9lYXNpbmcuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7O3dCQ0E0QixhQUFhOzs7O2dDQUNkLHFCQUFxQjs7OzsrQkFDdEIsb0JBQW9COzs7O0FBRTlDLElBQUksSUFBSSxHQUFHLFFBQVEsQ0FBQyxjQUFjLENBQUMsUUFBUSxDQUFDLENBQUM7QUFDN0MsSUFBSSxJQUFJLEdBQUcsUUFBUSxDQUFDLGNBQWMsQ0FBQyxRQUFRLENBQUMsQ0FBQzs7QUFFN0MsSUFBSSxNQUFNLEdBQUcsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUM7O0FBRTFCLElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDOztBQUVuQixFQUFFLENBQUMsTUFBTSxDQUFDLDBCQUEwQixDQUFDLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSx1QkFBaUIsQ0FBQyxDQUFDLEtBQUssRUFBRSxDQUMvRixNQUFNLENBQUMsUUFBUSxDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxVQUFTLENBQUMsRUFBQztBQUN2QyxXQUFPLENBQUMsQ0FBQztDQUNaLENBQUMsQ0FBQyxJQUFJLENBQUMsVUFBUyxDQUFDLEVBQUM7QUFDZixXQUFPLENBQUMsQ0FBQztDQUNaLENBQUMsQ0FBQztBQUNQLEVBQUUsQ0FB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QUFDLElBQUksQ0FBQyxFQUFFLENBQUMsUUFBUSxDQUFDLElBQUksRUFBRSxDQUNyQixFQUFFLENBQUMsTUFBTSxFQUFFLFVBQVMsQ0FBQyxFQUFDLENBQUMsRUFBRTtBQUN0QixrQkFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztBQUN6QixrQkFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztBQUN6QixjQUFFLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLEtBQUssQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxLQUFLLENBQUMsS0FBSyxFQUFFLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUM7U0FDdEYsQ0FBQyxDQUFDLENBQUM7QUFDUixVQUFFLENBQUMsTUFBTSxDQUFDLHFCQUFxQixDQUFDLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsS0FBSyxDQUFDLE1BQU0sRUFBRSxVQUFTLENBQUMsRUFBQztBQUMzRyxtQkFBTyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQztTQUNyQixDQUFDLENBQUMsS0FBSyxDQUFDLEtBQUssRUFBRSxVQUFTLENBQUMsRUFBQztBQUN2QixtQkFBTyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQztTQUNyQixDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFLENBQ3JCLEVBQUUsQ0FBQyxNQUFNLEVBQUUsVUFBUyxDQUFDLEVBQUMsQ0FBQyxFQUFFO0FBQ3RCLG1CQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FB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Q0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQSxJQUFLLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBLEFBQUMsQ0FBQztBQUM5VyxhQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQSxJQUFLLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBLEFBQUMsQ0FBQztBQUM5VyxhQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQSxJQUFLLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBLEFBQUMsQ0FBQztBQUM5VyxhQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQSxJQUFLLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBLEFBQUMsQ0FBQztBQUM5VyxjQUFFLEdBQUcsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQSxJQUFLLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBLEFBQUMsQ0FBQztBQUN6YyxjQUFFLEdBQUcsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQSxJQUFLLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxPQUFPLENBQUMs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OlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJpbXBvcnQgRWFzaW5nRnVuY3Rpb25zIGZyb20gJy4vZWFzaW5nLmpzJztcbmltcG9ydCBNb3JwaGluZ1NsaWRlciBmcm9tICcuL01vcnBoaW5nU2xpZGVyLmpzJztcbmltcG9ydCBNb3JwaGluZ0ltYWdlIGZyb20gJy4vTW9ycGhpbmdJbWFnZS5qcyc7XG5cbnZhciBpbWcxID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJtb2RlbDFcIik7XG52YXIgaW1nMiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibW9kZWwyXCIpO1xuXG52YXIgaW1hZ2VzID0gW2ltZzEsIGltZzJdO1xuXG5pbWcyLm9ubG9hZCA9IGluaXQ7XG5cbmQzLnNlbGVjdChcIiN0cmFuc2Zvcm0tZWFzaW5nLXNlbGVjdFwiKS5zZWxlY3RBbGwoXCJvcHRpb25cIikuZGF0YShPYmplY3Qua2V5cyhFYXNpbmdGdW5jdGlvbnMpKS5lbnRlcigpXG4gICAgLmFwcGVuZChcIm9wdGlvblwiKS5hdHRyKFwidmFsdWVcIiwgZnVuY3Rpb24oZCl7XG4gICAgICAgIHJldHVybiBkO1xuICAgIH0pLmh0bWwoZnVuY3Rpb24oZCl7XG4gICAgICAgIHJldHVybiBkO1xuICAgIH0pO1xuZDMuc2VsZWN0KFwiI2FscGhhLWVhc2luZy1zZWxlY3RcIikuc2VsZWN0QWxsKFwib3B0aW9uXCIpLmRhdGEoT2JqZWN0LmtleXMoRWFzaW5nRnVuY3Rpb25zKSkuZW50ZXIoKVxuICAgIC5hcHBlbmQoXCJvcHRpb25cIikuYXR0cihcInZhbHVlXCIsIGZ1bmN0aW9uKGQpe1xuICAgICAgICByZXR1cm4gZDtcbiAgICB9KS5odG1sKGZ1bmN0aW9uKGQpe1xuICAgICAgICByZXR1cm4gZDtcbiAgICB9KTtcblxuZnVuY3Rpb24gaW5pdCgpIHtcblxuICAgIHZhciBwb2ludHMgPSBbXG4gICAgICAgIG5ldyBjcmVhdGVqcy5Qb2ludCgwLCAwKSxcbiAgICAgICAgbmV3IGNyZWF0ZWpzLlBvaW50KGltZzEud2lkdGgsIDApLFxuICAgICAgICBuZXcgY3JlYXRlanMuUG9pbnQoaW1nMS53aWR0aCwgaW1nMS5oZWlnaHQpLFxuICAgICAgICBuZXcgY3JlYXRlanMuUG9pbnQoMCwgaW1nMS5oZWlnaHQpLFxuICAgICAgICBuZXcgY3JlYXRlanMuUG9pbnQoaW1nMS53aWR0aCAvIDIsIGltZzEuaGVpZ2h0IC8gMilcbiAgICBdO1xuXG4gICAgdmFyIHBvaW50czIgPSBbXG4gICAgICAgIG5ldyBjcmVhdGVqcy5Qb2ludCgwLCAwKSxcbiAgICAgICAgbmV3IGNyZWF0ZWpzLlBvaW50KGltZzIud2lkdGgsIDApLFxuICAgICAgICBuZXcgY3JlYXRlanMuUG9pbnQoaW1nMi53aWR0aCwgaW1nMi5oZWlnaHQpLFxuICAgICAgICBuZXcgY3JlYXRlanMuUG9pbnQoMCwgaW1nMi5oZWlnaHQpLFxuICAgICAgICBuZXcgY3JlYXRlanMuUG9pbnQoaW1nMi53aWR0aCAvIDIsIGltZzIuaGVpZ2h0IC8gMilcbiAgICBdO1xuXG4gICAgdmFyIGZhY2VzID0gY3JlYXRlRmFjZXMocG9pbnRzKTtcbiAgICB2YXIgZmFjZXMyID0gY3JlYXRlRmFjZXMocG9pbnRzMik7XG4gICAgdmFyIHN0YWdlID0gbmV3IGNyZWF0ZWpzLlN0YWdlKFwibXljYW52YXNcIik7XG4gICAgdmFyIG1pID0gbmV3IE1vcnBoaW5nSW1hZ2UoaW1nMSwgcG9pbnRzLCBmYWNlcywgc3RhZ2UpO1xuICAgIHZhciBtaTIgPSBuZXcgTW9ycGhpbmdJbWFnZShpbWcyLCBwb2ludHMyLCBmYWNlczIsIHN0YWdlKTtcbiAgICB2YXIgbXMgPSBuZXcgTW9ycGhpbmdTbGlkZXIoKTtcbiAgICBtcy5hZGRJbWFnZShtaSk7XG4gICAgbXMuYWRkSW1hZ2UobWkyKTtcbiAgICBkcmF3UG9pbnQoKTtcblxuICAgIHZhciBwbGF5QnV0dG9uID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJwbGF5LWJ1dHRvblwiKTtcbiAgICBwbGF5QnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGlmKG1zLmlzQW5pbWF0aW5nKXtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICBtcy5jbGVhcigpO1xuICAgICAgICBtaSA9IG5ldyBNb3JwaGluZ0ltYWdlKGltZzEsIHBvaW50cywgZmFjZXMsIHN0YWdlKTtcbiAgICAgICAgbWkyID0gbmV3IE1vcnBoaW5nSW1hZ2UoaW1nMiwgcG9pbnRzMiwgZmFjZXMyLCBzdGFnZSk7XG4gICAgICAgIG1zLmFkZEltYWdlKG1pKTtcbiAgICAgICAgbXMuYWRkSW1hZ2UobWkyKTtcbiAgICAgICAgbXMucGxheSgpO1xuICAgIH0pO1xuXG4gICAgaW1nMS5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgdmFyIHJlY3QgPSBlLnRhcmdldC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICAgICAgdmFyIHBvaW50ID0gbmV3IGNyZWF0ZWpzLlBvaW50KGUuY2xpZW50WCAtIHJlY3QubGVmdCwgZS5jbGllbnRZIC0gcmVjdC50b3ApO1xuICAgICAgICBwb2ludHMucHVzaChwb2ludCk7XG4gICAgICAgIHBvaW50czIucHVzaChwb2ludC5jbG9uZSgpKTtcbiAgICAgICAgZmFjZXMgPSBjcmVhdGVGYWNlcyhwb2ludHMpO1xuICAgICAgICBmYWNlczIgPSBjcmVhdGVGYWNlcyhwb2ludHMyKTtcbiAgICAgICAgZHJhd1BvaW50KCk7XG4gICAgfSk7XG5cbiAgICBmdW5jdGlvbiBkcmF3UG9pbnQoKSB7XG4gICAgICAgIGQzLnNlbGVjdChcIiNjb250YWluZXIxIC5wb2ludHNcIikuc2VsZWN0QWxsKFwiZGl2XCIpLmRhdGEocG9pbnRzKS5lbnRlcigpLmFwcGVuZChcImRpdlwiKS5zdHlsZShcImxlZnRcIiwgZnVuY3Rpb24oZCl7XG4gICAgICAgICAgICByZXR1cm4gZC54ICsgXCJweFwiO1xuICAgICAgICB9KS5zdHlsZShcInRvcFwiLCBmdW5jdGlvbihkKXtcbiAgICAgICAgICAgIHJldHVybiBkLnkgKyBcInB4XCI7XG4gICAgICAgIH0pLmNhbGwoZDMuYmVoYXZpb3IuZHJhZygpXG4gICAgICAgICAgICAub24oXCJkcmFnXCIsIGZ1bmN0aW9uKGQsaSkge1xuICAgICAgICAgICAgICAgIHBvaW50c1tpXS54ID0gZDMuZXZlbnQueDtcbiAgICAgICAgICAgICAgICBwb2ludHNbaV0ueSA9IGQzLmV2ZW50Lnk7XG4gICAgICAgICAgICAgICAgZDMuc2VsZWN0KHRoaXMpLnN0eWxlKFwibGVmdFwiLCBwb2ludHNbaV0ueCArIFwicHhcIikuc3R5bGUoXCJ0b3BcIiwgcG9pbnRzW2ldLnkgKyBcInB4XCIpO1xuICAgICAgICAgICAgfSkpO1xuICAgICAgICBkMy5zZWxlY3QoXCIjY29udGFpbmVyMiAucG9pbnRzXCIpLnNlbGVjdEFsbChcImRpdlwiKS5kYXRhKHBvaW50czIpLmVudGVyKCkuYXBwZW5kKFwiZGl2XCIpLnN0eWxlKFwibGVmdFwiLCBmdW5jdGlvbihkKXtcbiAgICAgICAgICAgIHJldHVybiBkLnggKyBcInB4XCI7XG4gICAgICAgIH0pLnN0eWxlKFwidG9wXCIsIGZ1bmN0aW9uKGQpe1xuICAgICAgICAgICAgcmV0dXJuIGQueSArIFwicHhcIjtcbiAgICAgICAgfSkuY2FsbChkMy5iZWhhdmlvci5kcmFnKClcbiAgICAgICAgICAgIC5vbihcImRyYWdcIiwgZnVuY3Rpb24oZCxpKSB7XG4gICAgICAgICAgICAgICAgcG9pbnRzMltpXS54ID0gZDMuZXZlbnQueDtcbiAgICAgICAgICAgICAgICBwb2ludHMyW2ldLnkgPSBkMy5ldmVudC55O1xuICAgICAgICAgICAgICAgIGQzLnNlbGVjdCh0aGlzKS5zdHlsZShcImxlZnRcIiwgcG9pbnRzMltpXS54ICsgXCJweFwiKS5zdHlsZShcInRvcFwiLCBwb2ludHMyW2ldLnkgKyBcInB4XCIpO1xuICAgICAgICAgICAgfSkpO1xuICAgIH1cblxuICAgIC8v44Kk44O844K444Oz44Kw44Gu5YiH44KK5pu/44GIXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJ0cmFuc2Zvcm0tZWFzaW5nLXNlbGVjdFwiKS5hZGRFdmVudExpc3RlbmVyKFwiY2hhbmdlXCIsIGZ1bmN0aW9uKCl7XG4gICAgICAgIG1zLnRyYW5zZm9ybUVhc2luZyA9IHRoaXMub3B0aW9uc1t0aGlzLnNlbGVjdGVkSW5kZXhdLnZhbHVlO1xuICAgIH0pO1xuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiYWxwaGEtZWFzaW5nLXNlbGVjdFwiKS5hZGRFdmVudExpc3RlbmVyKFwiY2hhbmdlXCIsIGZ1bmN0aW9uKCl7XG4gICAgICAgIG1zLmFscGhhRWFzaW5nID0gdGhpcy5vcHRpb25zW3RoaXMuc2VsZWN0ZWRJbmRleF0udmFsdWU7XG4gICAgfSk7XG5cbiAgICAvL+OCouODi+ODoeODvOOCt+ODp+ODs+aZgumWk+OBruioreWumlxuICAgIHZhciBkdWxhdGlvbklucHV0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJkdWxhdGlvbi1pbnB1dFwiKTtcbiAgICBkdWxhdGlvbklucHV0LnZhbHVlID0gbXMuZHVsYXRpb247XG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJkdWxhdGlvbi1idXR0b25cIikuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGZ1bmN0aW9uKCl7XG4gICAgICAgIG1zLmR1bGF0aW9uID0gZHVsYXRpb25JbnB1dC52YWx1ZTtcbiAgICB9KTtcblxuXG59XG5cbmZ1bmN0aW9uIGNyZWF0ZUZhY2VzKHBvaW50cykge1xuICAgIC8v44Oc44Ot44OO44Kk5aSJ5o+b6Zai5pWwXG4gICAgdmFyIHZvcm9ub2kgPSBkMy5nZW9tLnZvcm9ub2koKVxuICAgICAgICAueChmdW5jdGlvbiAoZCkge1xuICAgICAgICAgICAgcmV0dXJuIGQueFxuICAgICAgICB9KVxuICAgICAgICAueShmdW5jdGlvbiAoZCkge1xuICAgICAgICAgICAgcmV0dXJuIGQueVxuICAgICAgICB9KTtcblxuICAgIC8v44OJ44Ot44ON44O85bqn5qiZ44OH44O844K/5Y+W5b6XXG4gICAgdmFyIGZhY2VzID0gdm9yb25vaS50cmlhbmdsZXMocG9pbnRzKTtcbiAgICBmYWNlcy5mb3JFYWNoKGZ1bmN0aW9uKGZhY2UsIGluZGV4KXtcbiAgICAgICAgZmFjZXNbaW5kZXhdID0gW1xuICAgICAgICAgICAgcG9pbnRzLmluZGV4T2YoZmFjZXNbaW5kZXhdWzBdKSxcbiAgICAgICAgICAgIHBvaW50cy5pbmRleE9mKGZhY2VzW2luZGV4XVsxXSksXG4gICAgICAgICAgICBwb2ludHMuaW5kZXhPZihmYWNlc1tpbmRleF1bMl0pXG4gICAgICAgIF07XG4gICAgfSlcblxuICAgIHJldHVybiBmYWNlcztcbn1cblxudmFyIFBvaW50ID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuICAgIGdldEluaXRpYWxTdGF0ZTogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBpc01vdXNlRG93bjogZmFsc2VcbiAgICAgICAgfVxuICAgIH0sXG4gICAgaGFuZGxlTW91c2VEb3duOiBmdW5jdGlvbihlKSB7XG4gICAgICAgIHRoaXMucHJvcHMuc3RhcnRNb3ZpbmdQb2ludCh0aGlzLnByb3BzLmluZGV4KTtcbiAgICB9LFxuICAgIHJlbmRlcjogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImVkaXRvci1pbWFnZS1wb2ludFwiIHN0eWxlPXtcbiAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgbGVmdDogdGhpcy5wcm9wcy54LFxuICAgICAgICAgICAgICAgICAgICAgICAgdG9wOiB0aGlzLnByb3BzLnlcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0gaWQ9e1wiZWRpdG9yLWltYWdlLXBvaW50LVwiICsgdGhpcy5wcm9wcy5rZXl9IG9uTW91c2VEb3duPXt0aGlzLmhhbmRsZU1vdXNlRG93bn0+PC9kaXY+XG4gICAgICAgIClcbiAgICB9XG59KTtcblxudmFyIFBvaW50cyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcbiAgICBnZXRJbml0aWFsU3RhdGU6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgbW92aW5nUG9pbnQ6IC0xIC8v5YuV44GL44GX44Gm44GE44KL44Od44Kk44Oz44OI44Gu44Kk44Oz44OH44OD44Kv44K5XG4gICAgICAgIH1cbiAgICB9LFxuICAgIGhhbmRsZU1vdXNlTW92ZTogZnVuY3Rpb24oZSkge1xuICAgICAgICBpZih0aGlzLnN0YXRlLm1vdmluZ1BvaW50Pj0wKXtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGUudGFyZ2V0KTtcbiAgICAgICAgICAgIHZhciByZWN0ID0gUmVhY3QuZmluZERPTU5vZGUodGhpcy5yZWZzLmRpdikuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgICAgICAgICB0aGlzLnByb3BzLm1vdmVQb2ludCh0aGlzLnByb3BzLmluZGV4LCB0aGlzLnN0YXRlLm1vdmluZ1BvaW50LCB7eDogZS5jbGllbnRYIC0gcmVjdC5sZWZ0LCB5OiBlLmNsaWVudFkgLSByZWN0LnRvcH0pO1xuICAgICAgICB9XG4gICAgfSxcbiAgICBoYW5kbGVNb3VzZVVwOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7bW92aW5nUG9pbnQ6IC0xfSk7XG4gICAgfSxcbiAgICBzdGFydE1vdmluZ1BvaW50OiBmdW5jdGlvbihpbmRleCkge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHttb3ZpbmdQb2ludDogaW5kZXh9KTtcbiAgICB9LFxuICAgIHJlbmRlcjogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBwb2ludHMgPSB0aGlzLnByb3BzLnBvaW50cy5tYXAoKHBvaW50LCBpbmRleCkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuICg8UG9pbnQga2V5PXtcInBvaW50cy1cIiArIHRoaXMucHJvcHMuaW5kZXggKyBcIi1cIiArIGluZGV4fSBpbmRleD17aW5kZXh9IHg9e3BvaW50Lnh9IHk9e3BvaW50Lnl9IHN0YXJ0TW92aW5nUG9pbnQ9e3RoaXMuc3RhcnRNb3ZpbmdQb2ludH0+PC9Qb2ludD4pXG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgPGRpdiByZWY9XCJkaXZcIiBjbGFzc05hbWU9XCJlZGl0b3ItaW1hZ2UtcG9pbnRzLWNvbnRhaW5lclwiIG9uTW91c2VNb3ZlPXt0aGlzLmhhbmRsZU1vdXNlTW92ZX0gb25Nb3VzZVVwPXt0aGlzLmhhbmRsZU1vdXNlVXB9IHN0eWxlPXt7d2lkdGg6IHRoaXMucHJvcHMud2lkdGgsIGhlaWdodDogdGhpcy5wcm9wcy5oZWlnaHR9fT5cbiAgICAgICAgICAgICAgICB7cG9pbnRzfVxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICk7XG4gICAgfVxufSk7XG5cbnZhciBJbWFnZXMgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG4gICAgcmVuZGVyOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGltYWdlcyA9IHRoaXMucHJvcHMuaW1hZ2VzLm1hcCgoaW1hZ2UsIGluZGV4KSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZWRpdG9yLWltYWdlLWNvbnRhaW5lclwiIGtleT17XCJpbWFnZS1jb250YWluZXItXCIgKyBpbmRleH0+XG4gICAgICAgICAgICAgICAgICAgIDxQb2ludHMgaW5kZXg9e2luZGV4fSB3aWR0aD17aW1hZ2Uud2lkdGh9IGhlaWdodD17aW1hZ2UuaGVpZ2h0fSBwb2ludHM9e2ltYWdlLnBvaW50cyA/IGltYWdlLnBvaW50cyA6IFtdfSBtb3ZlUG9pbnQ9e3RoaXMucHJvcHMubW92ZVBvaW50fT48L1BvaW50cz5cbiAgICAgICAgICAgICAgICAgICAgPGltZyBpbmRleD17aW5kZXh9IHNyYz17aW1hZ2Uuc3JjfSByZWY9e1wiaW1hZ2VcIiArIGluZGV4fSBvbkRyb3A9e2Z1bmN0aW9uKGUpe2UucHJldmVudERlZmF1bHQoKTt9fT48L2ltZz5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICk7XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgPGRpdiBpZD1cImVkaXRvci1pbWFnZXNcIj5cbiAgICAgICAgICAgICAgICB7aW1hZ2VzfVxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICk7XG4gICAgfVxufSk7XG5cbnZhciBFZGl0b3IgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG4gICAgaGFuZGxlRmlsZVNlbGVjdDogZnVuY3Rpb24oZXZ0KSB7XG4gICAgICAgIGV2dC5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgZXZ0LnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICAgICAgY29uc29sZS5sb2coZXZ0KTtcbiAgICAgICAgdmFyIGZpbGVzID0gZXZ0LmRhdGFUcmFuc2Zlci5maWxlczsgLy8gRmlsZUxpc3Qgb2JqZWN0XG4gICAgICAgIGNvbnNvbGUubG9nKGZpbGVzKTtcblxuICAgICAgICAvLyBMb29wIHRocm91Z2ggdGhlIEZpbGVMaXN0IGFuZCByZW5kZXIgaW1hZ2UgZmlsZXMgYXMgdGh1bWJuYWlscy5cbiAgICAgICAgZm9yICh2YXIgaSA9IDAsIGZpbGU7IGZpbGUgPSBmaWxlc1tpXTsgaSsrKSB7XG5cbiAgICAgICAgICAgIC8vIE9ubHkgcHJvY2VzcyBpbWFnZSBmaWxlcy5cbiAgICAgICAgICAgIGlmICghZmlsZS50eXBlLm1hdGNoKCdpbWFnZS4qJykpIHtcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdmFyIHJlYWRlciA9IG5ldyBGaWxlUmVhZGVyKCk7XG5cbiAgICAgICAgICAgIC8vIENsb3N1cmUgdG8gY2FwdHVyZSB0aGUgZmlsZSBpbmZvcm1hdGlvbi5cbiAgICAgICAgICAgIHJlYWRlci5vbmxvYWQgPSAoZSkgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGUpO1xuICAgICAgICAgICAgICAgIHRoaXMucHJvcHMuYWRkSW1hZ2UoZS50YXJnZXQucmVzdWx0KTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gUmVhZCBpbiB0aGUgaW1hZ2UgZmlsZSBhcyBhIGRhdGEgVVJMLlxuICAgICAgICAgICAgcmVhZGVyLnJlYWRBc0RhdGFVUkwoZmlsZSk7XG4gICAgICAgIH1cbiAgICB9LFxuICAgIGhhbmRsZURyYWdPdmVyOiBmdW5jdGlvbihldnQpIHtcbiAgICAgICAgZXZ0LnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICBldnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgZXZ0LmRhdGFUcmFuc2Zlci5kcm9wRWZmZWN0ID0gJ2NvcHknOyAvLyBFeHBsaWNpdGx5IHNob3cgdGhpcyBpcyBhIGNvcHkuXG4gICAgfSxcbiAgICByZW5kZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgPGRpdiBpZD1cImVkaXRvclwiPlxuICAgICAgICAgICAgICAgIDxJbWFnZXMgaW1hZ2VzPXt0aGlzLnByb3BzLmltYWdlc30gcmVmPVwiaW1hZ2VzXCIgbW92ZVBvaW50PXt0aGlzLnByb3BzLm1vdmVQb2ludH0+PC9JbWFnZXM+XG4gICAgICAgICAgICAgICAgPGRpdiBpZD1cImVkaXRvci1kcm9wem9uZVwiIG9uRHJvcD17dGhpcy5oYW5kbGVGaWxlU2VsZWN0fSBvbkRyYWdPdmVyPXt0aGlzLmhhbmRsZURyYWdPdmVyfT48L2Rpdj5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICApXG4gICAgfVxufSk7XG5cbnZhciBBcHAgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG4gICAgZ2V0SW5pdGlhbFN0YXRlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGltYWdlczogW11cbiAgICAgICAgfVxuICAgIH0sXG4gICAgYWRkSW1hZ2U6IGZ1bmN0aW9uKGRhdGFVUkwpIHtcbiAgICAgICAgY29uc29sZS5sb2coZGF0YVVSTCk7XG4gICAgICAgIHZhciBuZXdJbWFnZSA9IHtcbiAgICAgICAgICAgIHNyYzogZGF0YVVSTCxcbiAgICAgICAgICAgIGluZGV4OiB0aGlzLnN0YXRlLmltYWdlcy5sZW5ndGhcbiAgICAgICAgfTtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7aW1hZ2VzOiB0aGlzLnN0YXRlLmltYWdlcy5jb25jYXQoW25ld0ltYWdlXSl9LCAoKSA9PiB7XG4gICAgICAgICAgICB2YXIgaW1hZ2VET00gPSBSZWFjdC5maW5kRE9NTm9kZSh0aGlzLnJlZnMuZWRpdG9yLnJlZnMuaW1hZ2VzLnJlZnNbXCJpbWFnZVwiICsgbmV3SW1hZ2UuaW5kZXhdKTsvL1JlYWN044Gr44KI44KK44Os44Oz44OA44O85riI44G/44GuRE9NXG4gICAgICAgICAgICB2YXIgd2lkdGggPSBpbWFnZURPTS53aWR0aCwgaGVpZ2h0ID0gaW1hZ2VET00uaGVpZ2h0O1xuICAgICAgICAgICAgdmFyIHBvaW50cywgZmFjZXM7XG4gICAgICAgICAgICBpZihuZXdJbWFnZS5pbmRleD4wKXtcbiAgICAgICAgICAgICAgICBwb2ludHMgPSB0aGlzLnN0YXRlLmltYWdlc1swXS5wb2ludHMuY29uY2F0KCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHBvaW50cyA9IFtcbiAgICAgICAgICAgICAgICAgICAge3g6MCwgeTowfSwge3g6d2lkdGgsIHk6MH0sIHt4OndpZHRoLCB5OmhlaWdodH0sIHt4OjAsIHk6aGVpZ2h0fSwge3g6d2lkdGgvMiwgeTpoZWlnaHQvMn1cbiAgICAgICAgICAgICAgICBdO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdmFyIGltYWdlcyA9IHRoaXMuc3RhdGUuaW1hZ2VzLmNvbmNhdCgpO1xuICAgICAgICAgICAgaW1hZ2VzW25ld0ltYWdlLmluZGV4XS5wb2ludHMgPSBwb2ludHM7XG4gICAgICAgICAgICBpbWFnZXNbbmV3SW1hZ2UuaW5kZXhdLndpZHRoID0gd2lkdGg7XG4gICAgICAgICAgICBpbWFnZXNbbmV3SW1hZ2UuaW5kZXhdLmhlaWdodCA9IGhlaWdodDtcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe2ltYWdlczogaW1hZ2VzfSk7XG4gICAgICAgIH0pO1xuICAgIH0sXG4gICAgbW92ZVBvaW50OiBmdW5jdGlvbihmaXJzdEluZGV4LCBzZWNvbmRJbmRleCwgcG9pbnQpIHtcbiAgICAgICAgY29uc29sZS5sb2coc2Vjb25kSW5kZXgpO1xuICAgICAgICB2YXIgaW1hZ2VzID0gdGhpcy5zdGF0ZS5pbWFnZXMuY29uY2F0KCk7XG4gICAgICAgIGltYWdlc1tmaXJzdEluZGV4XS5wb2ludHNbc2Vjb25kSW5kZXhdID0gcG9pbnQ7XG4gICAgICAgIGNvbnNvbGUubG9nKGltYWdlcyk7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe2ltYWdlczogaW1hZ2VzfSk7XG4gICAgfSxcbiAgICByZW5kZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgPGRpdiBpZD1cImFwcFwiPlxuICAgICAgICAgICAgICAgIDxFZGl0b3IgaW1hZ2VzPXt0aGlzLnN0YXRlLmltYWdlc30gYWRkSW1hZ2U9e3RoaXMuYWRkSW1hZ2V9IHJlZj1cImVkaXRvclwiIG1vdmVQb2ludD17dGhpcy5tb3ZlUG9pbnR9PjwvRWRpdG9yPlxuICAgICAgICAgICAgICAgIDxjYW52YXMgaWQ9XCJ2aWV3ZXJcIiB3aWR0aD17dGhpcy5zdGF0ZS5pbWFnZXNbMF0gPyB0aGlzLnN0YXRlLmltYWdlc1swXS53aWR0aCA6IDMwMH0gaGVpZ2h0PXt0aGlzLnN0YXRlLmltYWdlc1swXSA/IHRoaXMuc3RhdGUuaW1hZ2VzWzBdLmhlaWdodCA6IDMwMH0+PC9jYW52YXM+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgKTtcbiAgICB9XG59KTtcblxuUmVhY3QucmVuZGVyKFxuICAgIDxBcHA+PC9BcHA+LFxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdhcHAtY29udGFpbmVyJylcbik7IiwiY2xhc3MgTW9ycGhpbmdJbWFnZSB7XG4gICAgY29uc3RydWN0b3IoaW1hZ2UsIHBvaW50cywgZmFjZXMsIHN0YWdlKSB7XG4gICAgICAgIHRoaXMuZG9tRWxlbWVudCA9IGltYWdlO1xuICAgICAgICB0aGlzLnN0YWdlID0gc3RhZ2U7XG5cbiAgICAgICAgdGhpcy5vcmlnaW5hbFBvaW50cyA9IHBvaW50cztcbiAgICAgICAgdGhpcy5wb2ludHMgPSBbXTsgLy/mj4/nlLvjgZnjgovpmpvjga7li5XnmoTjgarluqfmqJlcbiAgICAgICAgdGhpcy5fY2xvbmVQb2ludHMoKTtcblxuICAgICAgICB0aGlzLmZhY2VzID0gZmFjZXM7XG5cbiAgICAgICAgdGhpcy5iaXRtYXBzID0gW107XG4gICAgICAgIHRoaXMuX2FkZEJpdG1hcHMoKTtcblxuICAgIH1cbiAgICBfY2xvbmVQb2ludHMoKSB7XG4gICAgICAgIHRoaXMub3JpZ2luYWxQb2ludHMuZm9yRWFjaCgocG9pbnQsIGluZGV4KSA9PiB7IC8v5a++5b+c44GZ44KL5bqn5qiZ44KS5L+d5oyB44GZ44KLXG4gICAgICAgICAgICB0aGlzLnBvaW50c1tpbmRleF0gPSBwb2ludC5jbG9uZSgpO1xuICAgICAgICB9KTtcbiAgICB9XG4gICAgX2FkZEJpdG1hcHMoKSB7XG4gICAgICAgIHRoaXMuZmFjZXMuZm9yRWFjaCgoZmFjZSkgPT4ge1xuICAgICAgICAgICAgdmFyIGJtcCA9IG5ldyBjcmVhdGVqcy5CaXRtYXAodGhpcy5kb21FbGVtZW50KTtcbiAgICAgICAgICAgIHZhciBzaGFwZSA9IG5ldyBjcmVhdGVqcy5TaGFwZSgpO1xuICAgICAgICAgICAgc2hhcGUuZ3JhcGhpY3MubW92ZVRvKHRoaXMucG9pbnRzW2ZhY2VbMF1dLngsIHRoaXMucG9pbnRzW2ZhY2VbMF1dLnkpXG4gICAgICAgICAgICAgICAgLmxpbmVUbyh0aGlzLnBvaW50c1tmYWNlWzFdXS54LCB0aGlzLnBvaW50c1tmYWNlWzFdXS55KVxuICAgICAgICAgICAgICAgIC5saW5lVG8odGhpcy5wb2ludHNbZmFjZVsyXV0ueCwgdGhpcy5wb2ludHNbZmFjZVsyXV0ueSk7XG4gICAgICAgICAgICBibXAubWFzayA9IHNoYXBlO1xuICAgICAgICAgICAgdGhpcy5iaXRtYXBzLnB1c2goYm1wKTtcbiAgICAgICAgICAgIHRoaXMuc3RhZ2UuYWRkQ2hpbGQoYm1wKTtcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIHNldEFscGhhKGEpIHtcbiAgICAgICAgdGhpcy5iaXRtYXBzLmZvckVhY2goKGJtcCwgaW5kZXgpID0+IHtcbiAgICAgICAgICAgIHRoaXMuYml0bWFwc1tpbmRleF0uYWxwaGEgPSBhO1xuICAgICAgICB9KTtcbiAgICB9XG4gICAgdXBkYXRlKCkge1xuICAgICAgICAvL+OCouODleOCo+ODs+WkieaPm+ihjOWIl+OCkuaxguOCgeOAgeODkeODvOODhOOCkuaPj+eUu1xuICAgICAgICB0aGlzLmZhY2VzLmZvckVhY2goKGZhY2UsIGluZGV4KSA9PiB7XG4gICAgICAgICAgICB2YXIgcG9pbnRzMSA9IFt0aGlzLm9yaWdpbmFsUG9pbnRzW2ZhY2VbMF1dLCB0aGlzLm9yaWdpbmFsUG9pbnRzW2ZhY2VbMV1dLCB0aGlzLm9yaWdpbmFsUG9pbnRzW2ZhY2VbMl1dXTtcbiAgICAgICAgICAgIHZhciBwb2ludHMyID0gW3RoaXMucG9pbnRzW2ZhY2VbMF1dLCB0aGlzLnBvaW50c1tmYWNlWzFdXSwgdGhpcy5wb2ludHNbZmFjZVsyXV1dO1xuICAgICAgICAgICAgdmFyIG1hdHJpeCA9IHRoaXMuX2dldEFmZmluZVRyYW5zZm9ybShwb2ludHMxLCBwb2ludHMyKTtcbiAgICAgICAgICAgIHRoaXMuYml0bWFwc1tpbmRleF0udHJhbnNmb3JtTWF0cml4ID0gdGhpcy5iaXRtYXBzW2luZGV4XS5tYXNrLnRyYW5zZm9ybU1hdHJpeCA9IG1hdHJpeDtcbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMuc3RhZ2UudXBkYXRlKCk7XG4gICAgfVxuICAgIF9nZXRBZmZpbmVUcmFuc2Zvcm0ocG9pbnRzMSwgcG9pbnRzMil7XG4gICAgICAgIHZhciBhLCBiLCBjLCBkLCB0eCwgdHk7XG5cbiAgICAgICAgLy8g6YCj56uL5pa556iL5byP44KS6Kej44GPXG4gICAgICAgIGEgPSAocG9pbnRzMlswXS54ICogcG9pbnRzMVsxXS55ICsgcG9pbnRzMlsxXS54ICogcG9pbnRzMVsyXS55ICsgcG9pbnRzMlsyXS54ICogcG9pbnRzMVswXS55IC0gcG9pbnRzMlswXS54ICogcG9pbnRzMVsyXS55IC0gcG9pbnRzMlsxXS54ICogcG9pbnRzMVswXS55IC0gcG9pbnRzMlsyXS54ICogcG9pbnRzMVsxXS55KSAvIChwb2ludHMxWzBdLnggKiBwb2ludHMxWzFdLnkgKyBwb2ludHMxWzFdLnggKiBwb2ludHMxWzJdLnkgKyBwb2ludHMxWzJdLnggKiBwb2ludHMxWzBdLnkgLSBwb2ludHMxWzBdLnggKiBwb2ludHMxWzJdLnkgLSBwb2ludHMxWzFdLnggKiBwb2ludHMxWzBdLnkgLSBwb2ludHMxWzJdLnggKiBwb2ludHMxWzFdLnkpO1xuICAgICAgICBiID0gKHBvaW50czJbMF0ueSAqIHBvaW50czFbMV0ueSArIHBvaW50czJbMV0ueSAqIHBvaW50czFbMl0ueSArIHBvaW50czJbMl0ueSAqIHBvaW50czFbMF0ueSAtIHBvaW50czJbMF0ueSAqIHBvaW50czFbMl0ueSAtIHBvaW50czJbMV0ueSAqIHBvaW50czFbMF0ueSAtIHBvaW50czJbMl0ueSAqIHBvaW50czFbMV0ueSkgLyAocG9pbnRzMVswXS54ICogcG9pbnRzMVsxXS55ICsgcG9pbnRzMVsxXS54ICogcG9pbnRzMVsyXS55ICsgcG9pbnRzMVsyXS54ICogcG9pbnRzMVswXS55IC0gcG9pbnRzMVswXS54ICogcG9pbnRzMVsyXS55IC0gcG9pbnRzMVsxXS54ICogcG9pbnRzMVswXS55IC0gcG9pbnRzMVsyXS54ICogcG9pbnRzMVsxXS55KTtcbiAgICAgICAgYyA9IChwb2ludHMxWzBdLnggKiBwb2ludHMyWzFdLnggKyBwb2ludHMxWzFdLnggKiBwb2ludHMyWzJdLnggKyBwb2ludHMxWzJdLnggKiBwb2ludHMyWzBdLnggLSBwb2ludHMxWzBdLnggKiBwb2ludHMyWzJdLnggLSBwb2ludHMxWzFdLnggKiBwb2ludHMyWzBdLnggLSBwb2ludHMxWzJdLnggKiBwb2ludHMyWzFdLngpIC8gKHBvaW50czFbMF0ueCAqIHBvaW50czFbMV0ueSArIHBvaW50czFbMV0ueCAqIHBvaW50czFbMl0ueSArIHBvaW50czFbMl0ueCAqIHBvaW50czFbMF0ueSAtIHBvaW50czFbMF0ueCAqIHBvaW50czFbMl0ueSAtIHBvaW50czFbMV0ueCAqIHBvaW50czFbMF0ueSAtIHBvaW50czFbMl0ueCAqIHBvaW50czFbMV0ueSk7XG4gICAgICAgIGQgPSAocG9pbnRzMVswXS54ICogcG9pbnRzMlsxXS55ICsgcG9pbnRzMVsxXS54ICogcG9pbnRzMlsyXS55ICsgcG9pbnRzMVsyXS54ICogcG9pbnRzMlswXS55IC0gcG9pbnRzMVswXS54ICogcG9pbnRzMlsyXS55IC0gcG9pbnRzMVsxXS54ICogcG9pbnRzMlswXS55IC0gcG9pbnRzMVsyXS54ICogcG9pbnRzMlsxXS55KSAvIChwb2ludHMxWzBdLnggKiBwb2ludHMxWzFdLnkgKyBwb2ludHMxWzFdLnggKiBwb2ludHMxWzJdLnkgKyBwb2ludHMxWzJdLnggKiBwb2ludHMxWzBdLnkgLSBwb2ludHMxWzBdLnggKiBwb2ludHMxWzJdLnkgLSBwb2ludHMxWzFdLnggKiBwb2ludHMxWzBdLnkgLSBwb2ludHMxWzJdLnggKiBwb2ludHMxWzFdLnkpO1xuICAgICAgICB0eCA9IChwb2ludHMxWzBdLnggKiBwb2ludHMxWzFdLnkgKiBwb2ludHMyWzJdLnggKyBwb2ludHMxWzFdLnggKiBwb2ludHMxWzJdLnkgKiBwb2ludHMyWzBdLnggKyBwb2ludHMxWzJdLnggKiBwb2ludHMxWzBdLnkgKiBwb2ludHMyWzFdLnggLSBwb2ludHMxWzBdLnggKiBwb2ludHMxWzJdLnkgKiBwb2ludHMyWzFdLnggLSBwb2ludHMxWzFdLnggKiBwb2ludHMxWzBdLnkgKiBwb2ludHMyWzJdLnggLSBwb2ludHMxWzJdLnggKiBwb2ludHMxWzFdLnkgKiBwb2ludHMyWzBdLngpIC8gKHBvaW50czFbMF0ueCAqIHBvaW50czFbMV0ueSArIHBvaW50czFbMV0ueCAqIHBvaW50czFbMl0ueSArIHBvaW50czFbMl0ueCAqIHBvaW50czFbMF0ueSAtIHBvaW50czFbMF0ueCAqIHBvaW50czFbMl0ueSAtIHBvaW50czFbMV0ueCAqIHBvaW50czFbMF0ueSAtIHBvaW50czFbMl0ueCAqIHBvaW50czFbMV0ueSk7XG4gICAgICAgIHR5ID0gKHBvaW50czFbMF0ueCAqIHBvaW50czFbMV0ueSAqIHBvaW50czJbMl0ueSArIHBvaW50czFbMV0ueCAqIHBvaW50czFbMl0ueSAqIHBvaW50czJbMF0ueSArIHBvaW50czFbMl0ueCAqIHBvaW50czFbMF0ueSAqIHBvaW50czJbMV0ueSAtIHBvaW50czFbMF0ueCAqIHBvaW50czFbMl0ueSAqIHBvaW50czJbMV0ueSAtIHBvaW50czFbMV0ueCAqIHBvaW50czFbMF0ueSAqIHBvaW50czJbMl0ueSAtIHBvaW50czFbMl0ueCAqIHBvaW50czFbMV0ueSAqIHBvaW50czJbMF0ueSkgLyAocG9pbnRzMVswXS54ICogcG9pbnRzMVsxXS55ICsgcG9pbnRzMVsxXS54ICogcG9pbnRzMVsyXS55ICsgcG9pbnRzMVsyXS54ICogcG9pbnRzMVswXS55IC0gcG9pbnRzMVswXS54ICogcG9pbnRzMVsyXS55IC0gcG9pbnRzMVsxXS54ICogcG9pbnRzMVswXS55IC0gcG9pbnRzMVsyXS54ICogcG9pbnRzMVsxXS55KTtcblxuICAgICAgICB2YXIgbWF0cml4ID0gbmV3IGNyZWF0ZWpzLk1hdHJpeDJEKGEsIGIsIGMsIGQsIHR4LCB0eSk7XG4gICAgICAgIHJldHVybiBtYXRyaXg7XG4gICAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBNb3JwaGluZ0ltYWdlOyIsImltcG9ydCBFYXNpbmdGdW5jdGlvbnMgZnJvbSBcIi4vZWFzaW5nLmpzXCI7XG5cbmNsYXNzIE1vcnBoaW5nU2xpZGVyIHtcbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgdGhpcy5pbWFnZXMgPSBbXTtcbiAgICAgICAgdGhpcy50cmFuc2Zvcm1FYXNpbmcgPSB0aGlzLmFscGhhRWFzaW5nID0gXCJsaW5lYXJcIjtcbiAgICAgICAgdGhpcy5kdWxhdGlvbiA9IDIwMDtcbiAgICAgICAgdGhpcy5pc0FuaW1hdGluZyA9IGZhbHNlO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG4gICAgYWRkSW1hZ2UobW9ycGhpbmdJbWFnZSkge1xuICAgICAgICB0aGlzLmltYWdlcy5wdXNoKG1vcnBoaW5nSW1hZ2UpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG4gICAgcGxheSgpIHtcbiAgICAgICAgaWYodGhpcy5pc0FuaW1hdGluZyl7IC8v44Ki44OL44Oh44O844K344On44Oz44Gu6YeN6KSH44KS6Ziy44GQXG4gICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgfVxuICAgICAgICB2YXIgdCA9IDA7XG4gICAgICAgIHZhciB0b3RhbCA9IHRoaXMuZHVsYXRpb24qNjAvMTAwMDtcbiAgICAgICAgdmFyIGludGVydmFsID0gMTAwMC82MDsgLy82MGZwc1xuICAgICAgICB2YXIgdGltZXIgPSBzZXRJbnRlcnZhbCgoKSA9PiB7XG4gICAgICAgICAgICBpZih0Pj10b3RhbCl7XG4gICAgICAgICAgICAgICAgY2xlYXJJbnRlcnZhbCh0aW1lcik7XG4gICAgICAgICAgICAgICAgdGhpcy5pc0FuaW1hdGluZyA9IGZhbHNlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB2YXIgZSA9IEVhc2luZ0Z1bmN0aW9uc1t0aGlzLnRyYW5zZm9ybUVhc2luZ10odC90b3RhbCk7XG4gICAgICAgICAgICB0aGlzLmltYWdlc1swXS5wb2ludHMuZm9yRWFjaCgocG9pbnQsIGluZGV4KSA9PiB7XG4gICAgICAgICAgICAgICAgdGhpcy5pbWFnZXNbMF0ucG9pbnRzW2luZGV4XS54ID0gdGhpcy5pbWFnZXNbMV0ub3JpZ2luYWxQb2ludHNbaW5kZXhdLnggKiBlICsgdGhpcy5pbWFnZXNbMF0ub3JpZ2luYWxQb2ludHNbaW5kZXhdLnggKiAoMS1lKTtcbiAgICAgICAgICAgICAgICB0aGlzLmltYWdlc1swXS5wb2ludHNbaW5kZXhdLnkgPSB0aGlzLmltYWdlc1sxXS5vcmlnaW5hbFBvaW50c1tpbmRleF0ueSAqIGUgKyB0aGlzLmltYWdlc1swXS5vcmlnaW5hbFBvaW50c1tpbmRleF0ueSAqICgxLWUpO1xuICAgICAgICAgICAgICAgIHRoaXMuaW1hZ2VzWzFdLnBvaW50c1tpbmRleF0ueCA9IHRoaXMuaW1hZ2VzWzBdLm9yaWdpbmFsUG9pbnRzW2luZGV4XS54ICogKDEtZSkgKyB0aGlzLmltYWdlc1sxXS5vcmlnaW5hbFBvaW50c1tpbmRleF0ueCAqIGU7XG4gICAgICAgICAgICAgICAgdGhpcy5pbWFnZXNbMV0ucG9pbnRzW2luZGV4XS55ID0gdGhpcy5pbWFnZXNbMF0ub3JpZ2luYWxQb2ludHNbaW5kZXhdLnkgKiAoMS1lKSArIHRoaXMuaW1hZ2VzWzFdLm9yaWdpbmFsUG9pbnRzW2luZGV4XS55ICogZTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBlID0gRWFzaW5nRnVuY3Rpb25zW3RoaXMuYWxwaGFFYXNpbmddKHQvdG90YWwpO1xuICAgICAgICAgICAgdGhpcy5pbWFnZXNbMF0uc2V0QWxwaGEoMS1lKTtcbiAgICAgICAgICAgIHRoaXMuaW1hZ2VzWzFdLnNldEFscGhhKGUpO1xuICAgICAgICAgICAgdGhpcy5pbWFnZXNbMF0udXBkYXRlKCk7XG4gICAgICAgICAgICB0aGlzLmltYWdlc1sxXS51cGRhdGUoKTtcbiAgICAgICAgICAgIHQrKztcbiAgICAgICAgfSwgaW50ZXJ2YWwpO1xuICAgICAgICB0aGlzLmlzQW5pbWF0aW5nID0gdHJ1ZTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuICAgIGNsZWFyKCkge1xuICAgICAgICB0aGlzLmltYWdlcyA9IFtdO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IE1vcnBoaW5nU2xpZGVyOyIsInZhciBFYXNpbmdGdW5jdGlvbnMgPSB7XG4gICAgLy8gbm8gZWFzaW5nLCBubyBhY2NlbGVyYXRpb25cbiAgICBsaW5lYXI6IGZ1bmN0aW9uICh0KSB7IHJldHVybiB0IH0sXG4gICAgLy8gYWNjZWxlcmF0aW5nIGZyb20gemVybyB2ZWxvY2l0eVxuICAgIGVhc2VJblF1YWQ6IGZ1bmN0aW9uICh0KSB7IHJldHVybiB0KnQgfSxcbiAgICAvLyBkZWNlbGVyYXRpbmcgdG8gemVybyB2ZWxvY2l0eVxuICAgIGVhc2VPdXRRdWFkOiBmdW5jdGlvbiAodCkgeyByZXR1cm4gdCooMi10KSB9LFxuICAgIC8vIGFjY2VsZXJhdGlvbiB1bnRpbCBoYWxmd2F5LCB0aGVuIGRlY2VsZXJhdGlvblxuICAgIGVhc2VJbk91dFF1YWQ6IGZ1bmN0aW9uICh0KSB7IHJldHVybiB0PC41ID8gMip0KnQgOiAtMSsoNC0yKnQpKnQgfSxcbiAgICAvLyBhY2NlbGVyYXRpbmcgZnJvbSB6ZXJvIHZlbG9jaXR5XG4gICAgZWFzZUluQ3ViaWM6IGZ1bmN0aW9uICh0KSB7IHJldHVybiB0KnQqdCB9LFxuICAgIC8vIGRlY2VsZXJhdGluZyB0byB6ZXJvIHZlbG9jaXR5XG4gICAgZWFzZU91dEN1YmljOiBmdW5jdGlvbiAodCkgeyByZXR1cm4gKC0tdCkqdCp0KzEgfSxcbiAgICAvLyBhY2NlbGVyYXRpb24gdW50aWwgaGFsZndheSwgdGhlbiBkZWNlbGVyYXRpb25cbiAgICBlYXNlSW5PdXRDdWJpYzogZnVuY3Rpb24gKHQpIHsgcmV0dXJuIHQ8LjUgPyA0KnQqdCp0IDogKHQtMSkqKDIqdC0yKSooMip0LTIpKzEgfSxcbiAgICAvLyBhY2NlbGVyYXRpbmcgZnJvbSB6ZXJvIHZlbG9jaXR5XG4gICAgZWFzZUluUXVhcnQ6IGZ1bmN0aW9uICh0KSB7IHJldHVybiB0KnQqdCp0IH0sXG4gICAgLy8gZGVjZWxlcmF0aW5nIHRvIHplcm8gdmVsb2NpdHlcbiAgICBlYXNlT3V0UXVhcnQ6IGZ1bmN0aW9uICh0KSB7IHJldHVybiAxLSgtLXQpKnQqdCp0IH0sXG4gICAgLy8gYWNjZWxlcmF0aW9uIHVudGlsIGhhbGZ3YXksIHRoZW4gZGVjZWxlcmF0aW9uXG4gICAgZWFzZUluT3V0UXVhcnQ6IGZ1bmN0aW9uICh0KSB7IHJldHVybiB0PC41ID8gOCp0KnQqdCp0IDogMS04KigtLXQpKnQqdCp0IH0sXG4gICAgLy8gYWNjZWxlcmF0aW5nIGZyb20gemVybyB2ZWxvY2l0eVxuICAgIGVhc2VJblF1aW50OiBmdW5jdGlvbiAodCkgeyByZXR1cm4gdCp0KnQqdCp0IH0sXG4gICAgLy8gZGVjZWxlcmF0aW5nIHRvIHplcm8gdmVsb2NpdHlcbiAgICBlYXNlT3V0UXVpbnQ6IGZ1bmN0aW9uICh0KSB7IHJldHVybiAxKygtLXQpKnQqdCp0KnQgfSxcbiAgICAvLyBhY2NlbGVyYXRpb24gdW50aWwgaGFsZndheSwgdGhlbiBkZWNlbGVyYXRpb25cbiAgICBlYXNlSW5PdXRRdWludDogZnVuY3Rpb24gKHQpIHsgcmV0dXJuIHQ8LjUgPyAxNip0KnQqdCp0KnQgOiAxKzE2KigtLXQpKnQqdCp0KnQgfVxufTtcblxuZXhwb3J0IGRlZmF1bHQgRWFzaW5nRnVuY3Rpb25zOyJdfQ==
