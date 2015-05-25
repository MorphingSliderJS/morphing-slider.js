(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _easingJs = require('./easing.js');

var _easingJs2 = _interopRequireDefault(_easingJs);

var _MorphingSliderJs = require('./MorphingSlider.js');

var _MorphingSliderJs2 = _interopRequireDefault(_MorphingSliderJs);

var _MorphingImageJs = require('./MorphingImage.js');

var _MorphingImageJs2 = _interopRequireDefault(_MorphingImageJs);

var stage, ms;

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
            }, onMouseDown: this.handleMouseDown });
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
            var rect = React.findDOMNode(this.refs.div).getBoundingClientRect(),
                x = e.clientX - rect.left,
                y = e.clientY - rect.top;

            //はみ出ないように
            x = x < 0 ? 0 : x;
            x = x > rect.width ? rect.width : x;
            y = y < 0 ? 0 : y;
            y = y > rect.height ? rect.height : y;

            this.props.movePoint(this.props.index, this.state.movingPoint, { x: x, y: y });
        }
    },
    handleMouseUp: function handleMouseUp() {
        this.setState({ movingPoint: -1 });
    },
    startMovingPoint: function startMovingPoint(index) {
        this.setState({ movingPoint: index });
    },
    handleClick: function handleClick(e) {
        //基準画像のポイント以外の場所をクリックしたらaddPoint
        if (this.props.index < 1 && e.target === React.findDOMNode(this.refs.div)) {
            var rect = e.target.getBoundingClientRect();
            this.props.addPoint({ x: e.clientX - rect.left, y: e.clientY - rect.top });
        }
    },
    render: function render() {
        var _this = this;

        var points = this.props.points.map(function (point, index) {
            return React.createElement(Point, { key: 'points-' + _this.props.index + '-' + index, index: index, x: point.x, y: point.y, startMovingPoint: _this.startMovingPoint });
        });
        return React.createElement(
            'div',
            { ref: 'div', className: 'editor-image-points-container', onMouseMove: this.handleMouseMove, onMouseUp: this.handleMouseUp, onClick: this.handleClick, style: { width: this.props.width, height: this.props.height } },
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
                React.createElement(Points, { index: index, width: image.width, height: image.height, points: image.points ? image.points : [], movePoint: _this2.props.movePoint, addPoint: _this2.props.addPoint }),
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
            React.createElement(Images, { images: this.props.images, ref: 'images', movePoint: this.props.movePoint, addPoint: this.props.addPoint }),
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
    componentDidMount: function componentDidMount() {
        stage = new createjs.Stage('mycanvas');
        ms = new _MorphingSliderJs2['default'](stage);
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
                faces = _this4.state.images[0].faces.concat();
            } else {
                //初期設定
                points = [{ x: 0, y: 0 }, { x: width, y: 0 }, { x: width, y: height }, { x: 0, y: height }, { x: width / 2, y: height / 2 }];
                faces = [[0, 1, 4], [1, 2, 4], [2, 3, 4], [3, 4, 0]];
            }
            var images = _this4.state.images.concat();
            images[newImage.index].points = points;
            images[newImage.index].faces = faces;
            images[newImage.index].width = width;
            images[newImage.index].height = height;
            _this4.setState({ images: images });
        });
    },
    movePoint: function movePoint(firstIndex, secondIndex, point) {
        var images = this.state.images.concat();
        images[firstIndex].points[secondIndex] = point;
        this.setState({ images: images });
    },
    addPoint: function addPoint(point) {
        var images = this.state.images.concat();
        images[0].points.push(point);
        images[0].faces = createFaces(images[0].points); //facesを作り直す
        for (var i = 1, l = images.length; i < l; i++) {
            //他のimageにもpointとfaceを追加
            images[i].points.push({ x: point.x, y: point.y });
            images[i].faces = images[0].faces;
        }
        console.log(point);
        this.setState({ images: images });
    },
    changeTransformEasing: function changeTransformEasing() {
        var select = React.findDOMNode(this.refs.transformEasingSelect);
        ms.transformEasing = select.options[select.selectedIndex].value;
    },
    changeAlphaEasing: function changeAlphaEasing() {
        var select = React.findDOMNode(this.refs.alphaEasingSelect);
        ms.alphaEasing = select.options[select.selectedIndex].value;
    },
    changeDulation: function changeDulation() {
        var input = React.findDOMNode(this.refs.dulationInput);
        ms.dulation = input.value;
    },
    play: function play() {
        var _this5 = this;

        console.log('play');
        if (!ms.isAnimating) {
            ms.clear();
            console.log(this.state.images);
            this.state.images.forEach(function (image, index) {
                var imageDOM = React.findDOMNode(_this5.refs.editor.refs.images.refs['image' + index]); //Reactによりレンダー済みのDOM
                var mi = new _MorphingImageJs2['default'](imageDOM, image.points, image.faces);
                ms.addImage(mi);
            });
            setTimeout(function () {
                ms.play();
            }, 1000);
        }
    },
    render: function render() {
        var easings = Object.keys(_easingJs2['default']).map(function (name) {
            return React.createElement(
                'option',
                { value: name },
                name
            );
        });
        return React.createElement(
            'div',
            { id: 'app' },
            React.createElement(Editor, { images: this.state.images, addImage: this.addImage, ref: 'editor', movePoint: this.movePoint, addPoint: this.addPoint }),
            React.createElement(
                'button',
                { id: 'play-button', onClick: this.play },
                'Play'
            ),
            React.createElement('canvas', { id: 'mycanvas', width: '500', height: '500' }),
            React.createElement(
                'label',
                null,
                'Transform Easing: ',
                React.createElement(
                    'select',
                    { ref: 'transformEasingSelect', id: 'transform-easing-select', onChange: this.changeTransformEasing },
                    easings
                )
            ),
            React.createElement(
                'label',
                null,
                'Alpha Easing: ',
                React.createElement(
                    'select',
                    { ref: 'alphaEasingSelect', id: 'alpha-easing-select', onChange: this.changeAlphaEasing },
                    easings
                )
            ),
            React.createElement(
                'label',
                null,
                'Dulation: ',
                React.createElement('input', { ref: 'dulationInput', type: 'number', id: 'dulation-input', onChange: this.changeDulation }),
                React.createElement(
                    'button',
                    { id: 'dulation-button' },
                    'OK'
                )
            )
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
    function MorphingImage(image, points, faces) {
        _classCallCheck(this, MorphingImage);

        this.domElement = image;

        this.originalPoints = points;
        this.points = []; //描画する際の動的な座標
        this._clonePoints();

        this.faces = faces;

        this.bitmaps = [];
        this._addBitmaps();

        return this;
    }

    _createClass(MorphingImage, [{
        key: "_clonePoints",
        value: function _clonePoints() {
            var _this = this;

            this.originalPoints.forEach(function (point, index) {
                //対応する座標を保持する
                _this.points[index] = { x: point.x, y: point.y };
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
    function MorphingSlider(stage) {
        _classCallCheck(this, MorphingSlider);

        this.images = [];
        this.stage = stage;
        this.transformEasing = this.alphaEasing = "linear";
        this.dulation = 200;
        this.isAnimating = false;
        return this;
    }

    _createClass(MorphingSlider, [{
        key: "addImage",
        value: function addImage(morphingImage) {
            var _this = this;

            morphingImage.bitmaps.forEach(function (bmp, index) {
                if (_this.images.length > 0) {
                    //最初以外は描画しない
                    morphingImage.bitmaps[index].alpha = 0;
                }
                _this.stage.addChild(morphingImage.bitmaps[index]);
            });
            this.images.push(morphingImage);
            this.stage.update();
            return this;
        }
    }, {
        key: "play",
        value: function play() {
            var _this2 = this;

            if (this.isAnimating || this.images.length < 2) {
                //アニメーションの重複を防ぐ
                return this;
            }
            var t = 0;
            var total = this.dulation * 60 / 1000;
            var interval = 1000 / 60; //60fps
            var timer = setInterval(function () {
                if (t >= total) {
                    clearInterval(timer);
                    _this2.isAnimating = false;
                }

                var e = _easingJs2["default"][_this2.transformEasing](t / total);
                _this2.images[0].points.forEach(function (point, index) {
                    _this2.images[0].points[index].x = _this2.images[1].originalPoints[index].x * e + _this2.images[0].originalPoints[index].x * (1 - e);
                    _this2.images[0].points[index].y = _this2.images[1].originalPoints[index].y * e + _this2.images[0].originalPoints[index].y * (1 - e);
                    _this2.images[1].points[index].x = _this2.images[0].originalPoints[index].x * (1 - e) + _this2.images[1].originalPoints[index].x * e;
                    _this2.images[1].points[index].y = _this2.images[0].originalPoints[index].y * (1 - e) + _this2.images[1].originalPoints[index].y * e;
                });

                e = _easingJs2["default"][_this2.alphaEasing](t / total);
                _this2.images[0].setAlpha(1 - e);
                _this2.images[1].setAlpha(e);
                _this2.images[0].update();
                _this2.images[1].update();
                _this2.stage.update();

                t++;
            }, interval);
            this.isAnimating = true;
            return this;
        }
    }, {
        key: "clear",
        value: function clear() {
            this.images = [];
            this.stage.clear();
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
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMveWFtYW1vdG9ub2Rva2EvRGVza3RvcC9pbWFnZS1tb3JwaGluZy9zcmMvanMvbWFpbjIuanMiLCIvVXNlcnMveWFtYW1vdG9ub2Rva2EvRGVza3RvcC9pbWFnZS1tb3JwaGluZy9zcmMvanMvTW9ycGhpbmdJbWFnZS5qcyIsIi9Vc2Vycy95YW1hbW90b25vZG9rYS9EZXNrdG9wL2ltYWdlLW1vcnBoaW5nL3NyYy9qcy9Nb3JwaGluZ1NsaWRlci5qcyIsIi9Vc2Vycy95YW1hbW90b25vZG9rYS9EZXNrdG9wL2ltYWdlLW1vcnBoaW5nL3NyYy9qcy9lYXNpbmcuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7O3dCQ0E0QixhQUFhOzs7O2dDQUNkLHFCQUFxQjs7OzsrQkFDdEIsb0JBQW9COzs7O0FBRTlDLElBQUksS0FBSyxFQUFFLEVBQUUsQ0FBQzs7QUFFZCxTQUFTLFdBQVcsQ0FBQyxNQUFNLEVBQUU7O0FBRXpCLFFBQUksT0FBTyxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLENBQzFCLENBQUMsQ0FBQyxVQUFVLENBQUMsRUFBRTtBQUNaLGVBQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQTtLQUNiLENBQUMsQ0FDRCxDQUFDLENBQUMsVUFBVSxDQUFDLEVBQUU7QUFDWixlQUFPLENBQUMsQ0FBQyxDQUFDLENBQUE7S0FDYixDQUFDLENBQUM7OztBQUdQLFFBQUksS0FBSyxHQUFHLE9BQU8sQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLENBQUM7QUFDdEMsU0FBSyxDQUFDLE9BQU8sQ0FBQyxVQUFTLElBQUksRUFBRSxLQUFLLEVBQUM7QUFDL0IsYUFBSyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQ1gsTUFBTSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENB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QzthQUMzRixDQUFDLENBQUM7U0FDTjs7O2VBQ2tCLDZCQUFDLE9BQU8sRUFBRSxPQUFPLEVBQUM7QUFDakMsZ0JBQUksQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUM7OztBQUd2QixhQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQSxJQUFLLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBLEFBQUMsQ0FBQztBQUM5VyxhQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQSxJQUFLLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBLEFBQUMsQ0FBQztBQUM5VyxhQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQSxJQUFLLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBLEFBQUMsQ0FBQztBQUM5VyxhQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQSxJQUFLLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBLEFBQUMsQ0FBQztBQUM5VyxjQUFFLEdBQUcsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQSxJQUFLLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBLEFBQUMsQ0FBQztBQUN6YyxjQUFFLEdBQUcsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQSxJQUFLLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FB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QUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsVUFBQyxLQUFLLEVBQUUsS0FBSyxFQUFLO0FBQzVDLDJCQUFLLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxHQUFHLE9BQUssTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLGNBQWMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLE9BQUssTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLGNBQWMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFDLENBQUMsQ0FBQSxBQUFDLENBQUM7QUFDN0gsMkJBQUssTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEdBQUcsT0FBSyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsY0FBYyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsT0FBSyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsY0FBYyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUMsQ0FBQyxDQUFBLEFBQUMsQ0FBQztBQUM3SCwyQkFBSyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsR0FBRyxPQUFLLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxjQUFjLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBQyxDQUFDLENBQUEsQUFBQyxHQUFHLE9BQUssTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLGNBQWMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQzdILDJCQUFLLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxHQUFHLE9BQUssTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLGNBQWMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFDLENBQUMsQ0FBQSxBQUFDLEdBQUcsT0FBSyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsY0FBYyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7aUJBQ2hJLENBQUMsQ0FBQzs7QUFFSCxpQkFBQyxHQUFHLHNCQUFnQixPQUFLLFdBQVcsQ0FBQyxDQUFDLENBQUMsR0FBQyxLQUFLLENBQUMsQ0FBQztBQUMvQyx1QkFBSyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsR0FBQyxDQUFDLENBQUMsQ0FBQztBQUM3Qix1QkFBSyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQzNCLHVCQUFLLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQztBQUN4Qix1QkFBSyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxFQUFFLENBQUM7QUFDeEIsdUJBQUssS0FBSyxDQUFDLE1BQU0sRUFBRSxDQUFDOztBQUVwQixpQkFBQyxFQUFFLENBQUM7YUFDUCxFQUFFLFFBQVEsQ0FBQyxDQUFDO0FBQ2IsZ0JBQUksQ0FBQyxXQUFXLEdBQUcsSUFBSSxDQUFDO0FBQ3hCLG1CQUFPLElBQUksQ0FBQztTQUNmOzs7ZUFDSSxpQkFBRztBQUNKLGdCQUFJLENBQUMsTUFBTSxHQUFHLEVBQUUsQ0FBQztBQUNqQixnQkFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLEVBQUUsQ0FBQztBQUNuQixtQkFBTyxJQUFJLENBQUM7U0FDZjs7O1dBekRDLGNBQWM7OztxQkE0REwsY0FBYzs7Ozs7Ozs7O0FDOUQ3QixJQUFJLGVBQWUsR0FBRzs7QUFFbEIsVUFBTSxFQUFFLGdCQUFVLENBQUMsRUFBRTtBQUFFLGVBQU8sQ0FBQyxDQUFBO0tBQUU7O0FBRWpDLGNBQVUsRUFBRSxvQkFBVSxDQUFDLEVBQUU7QUFBRSxlQUFPLENBQUMsR0FBQyxDQUFDLENBQUE7S0FBRTs7QUFFdkMsZUFBVyxFQUFFLHFCQUFVLENBQUMsRUFBRTtBQUFFLGVBQU8sQ0FBQyxJQUFFLENBQUMsR0FBQyxDQUFDLENBQUEsQUFBQyxDQUFBO0tBQUU7O0FBRTVDLGlCQUFhLEVBQUUsdUJBQVUsQ0FBQyxFQUFFO0FBQUUsZUFBTyxDQUFDLEdBQUMsR0FBRSxHQUFHLENBQUMsR0FBQyxDQUFDLEdBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFDLENBQUMsQ0FBQyxHQUFDLENBQUMsR0FBQyxDQUFDLENBQUEsR0FBRSxDQUFDLENBQUE7S0FBRTs7QUFFbEUsZUFBVyxFQUFFLHFCQUFVLENBQUMsRUFBRTtBQUFFLGVBQU8sQ0FBQyxHQUFDLENBQUMsR0FBQyxDQUFDLENBQUE7S0FBRTs7QUFFMUMsZ0JBQVksRUFBRSxzQkFBVSxDQUFDLEVBQUU7QUFBRSxlQUFPLEFBQUMsRUFBRSxDQUFDLEdBQUUsQ0FBQyxHQUFDLENBQUMsR0FBQyxDQUFDLENBQUE7S0FBRTs7QUFFakQsa0JBQWMsRUFBRSx3QkFBVSxDQUFDLEVBQUU7QUFBRSxlQUFPLENBQUMsR0FBQyxHQUFFLEdBQUcsQ0FBQyxHQUFDLENBQUMsR0FBQyxDQUFDLEdBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFDLENBQUMsQ0FBQSxJQUFHLENBQUMsR0FBQyxDQUFDLEdBQUMsQ0FBQyxDQUFBLEFBQUMsSUFBRSxDQUFDLEdBQUMsQ0FBQyxHQUFDLENBQUMsQ0FBQSxBQUFDLEdBQUMsQ0FBQyxDQUFBO0tBQUU7O0FBRWhGLGVBQVcsRUFBRSxxQkFBVSxDQUFDLEVBQUU7QUFBRSxlQUFPLENBQUMsR0FBQyxDQUFDLEdBQUMsQ0FBQyxHQUFDLENBQUMsQ0FBQTtLQUFFOztBQUU1QyxnQkFBWSxFQUFFLHNCQUFVLENBQUMsRUFBRTtBQUFFLGVBQU8sQ0FBQyxHQUFDLEFBQUMsRUFBRSxDQUFDLEdBQUUsQ0FBQyxHQUFDLENBQUMsR0FBQyxDQUFDLENBQUE7S0FBRTs7QUFFbkQsa0JBQWMsRUFBRSx3QkFBVSxDQUFDLEVBQUU7QUFBRSxlQUFPLENBQUMsR0FBQyxHQUFFLEdBQUcsQ0FBQyxHQUFDLENBQUMsR0FBQyxDQUFDLEdBQUMsQ0FBQyxHQUFDLENBQUMsR0FBRyxDQUFDLEdBQUMsQ0FBQyxHQUFFLEVBQUUsQ0FBQyxBQUFDLEdBQUMsQ0FBQyxHQUFDLENBQUMsR0FBQyxDQUFDLENBQUE7S0FBRTs7QUFFMUUsZUFBVyxFQUFFLHFCQUFVLENBQUMsRUFBRTtBQUFFLGVBQU8sQ0FBQyxHQUFDLENBQUMsR0FBQyxDQUFDLEdBQUMsQ0FBQyxHQUFDLENBQUMsQ0FBQTtLQUFFOztBQUU5QyxnQkFBWSxFQUFFLHNCQUFVLENBQUMsRUFBRTtBQUFFLGVBQU8sQ0FBQyxHQUFDLEFBQUMsRUFBRSxDQUFDLEdBQUUsQ0FBQyxHQUFDLENBQUMsR0FBQyxDQUFDLEdBQUMsQ0FBQyxDQUFBO0tBQUU7O0FBRXJELGtCQUFjLEVBQUUsd0JBQVUsQ0FBQyxFQUFFO0FBQUUsZUFBTyxDQUFDLEdBQUMsR0FBRSxHQUFHLEVBQUUsR0FBQyxDQUFDLEdBQUMsQ0FBQyxHQUFDLENBQUMsR0FBQyxDQUFDLEdBQUMsQ0FBQyxHQUFHLENBQUMsR0FBQyxFQUFFLEdBQUUsRUFBRSxDQUFDLEFBQUMsR0FBQyxDQUFDLEdBQUMsQ0FBQyxHQUFDLENBQUMsR0FBQyxDQUFDLENBQUE7S0FBRTtDQUNuRixDQUFDOztxQkFFYSxlQUFlIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsImltcG9ydCBFYXNpbmdGdW5jdGlvbnMgZnJvbSAnLi9lYXNpbmcuanMnO1xuaW1wb3J0IE1vcnBoaW5nU2xpZGVyIGZyb20gJy4vTW9ycGhpbmdTbGlkZXIuanMnO1xuaW1wb3J0IE1vcnBoaW5nSW1hZ2UgZnJvbSAnLi9Nb3JwaGluZ0ltYWdlLmpzJztcblxudmFyIHN0YWdlLCBtcztcblxuZnVuY3Rpb24gY3JlYXRlRmFjZXMocG9pbnRzKSB7XG4gICAgLy/jg5zjg63jg47jgqTlpInmj5vplqLmlbBcbiAgICB2YXIgdm9yb25vaSA9IGQzLmdlb20udm9yb25vaSgpXG4gICAgICAgIC54KGZ1bmN0aW9uIChkKSB7XG4gICAgICAgICAgICByZXR1cm4gZC54XG4gICAgICAgIH0pXG4gICAgICAgIC55KGZ1bmN0aW9uIChkKSB7XG4gICAgICAgICAgICByZXR1cm4gZC55XG4gICAgICAgIH0pO1xuXG4gICAgLy/jg4njg63jg43jg7zluqfmqJnjg4fjg7zjgr/lj5blvpdcbiAgICB2YXIgZmFjZXMgPSB2b3Jvbm9pLnRyaWFuZ2xlcyhwb2ludHMpO1xuICAgIGZhY2VzLmZvckVhY2goZnVuY3Rpb24oZmFjZSwgaW5kZXgpe1xuICAgICAgICBmYWNlc1tpbmRleF0gPSBbXG4gICAgICAgICAgICBwb2ludHMuaW5kZXhPZihmYWNlc1tpbmRleF1bMF0pLFxuICAgICAgICAgICAgcG9pbnRzLmluZGV4T2YoZmFjZXNbaW5kZXhdWzFdKSxcbiAgICAgICAgICAgIHBvaW50cy5pbmRleE9mKGZhY2VzW2luZGV4XVsyXSlcbiAgICAgICAgXTtcbiAgICB9KVxuXG4gICAgcmV0dXJuIGZhY2VzO1xufVxuXG52YXIgUG9pbnQgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG4gICAgZ2V0SW5pdGlhbFN0YXRlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGlzTW91c2VEb3duOiBmYWxzZVxuICAgICAgICB9XG4gICAgfSxcbiAgICBoYW5kbGVNb3VzZURvd246IGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgdGhpcy5wcm9wcy5zdGFydE1vdmluZ1BvaW50KHRoaXMucHJvcHMuaW5kZXgpO1xuICAgIH0sXG4gICAgcmVuZGVyOiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZWRpdG9yLWltYWdlLXBvaW50XCIgc3R5bGU9e1xuICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsZWZ0OiB0aGlzLnByb3BzLngsXG4gICAgICAgICAgICAgICAgICAgICAgICB0b3A6IHRoaXMucHJvcHMueVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSBvbk1vdXNlRG93bj17dGhpcy5oYW5kbGVNb3VzZURvd259PjwvZGl2PlxuICAgICAgICApXG4gICAgfVxufSk7XG5cbnZhciBQb2ludHMgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG4gICAgZ2V0SW5pdGlhbFN0YXRlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIG1vdmluZ1BvaW50OiAtMSAvL+WLleOBi+OBl+OBpuOBhOOCi+ODneOCpOODs+ODiOOBruOCpOODs+ODh+ODg+OCr+OCuVxuICAgICAgICB9XG4gICAgfSxcbiAgICBoYW5kbGVNb3VzZU1vdmU6IGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgaWYodGhpcy5zdGF0ZS5tb3ZpbmdQb2ludD49MCl7XG4gICAgICAgICAgICB2YXIgcmVjdCA9IFJlYWN0LmZpbmRET01Ob2RlKHRoaXMucmVmcy5kaXYpLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLFxuICAgICAgICAgICAgICAgIHggPSBlLmNsaWVudFggLSByZWN0LmxlZnQsXG4gICAgICAgICAgICAgICAgeSA9IGUuY2xpZW50WSAtIHJlY3QudG9wO1xuXG4gICAgICAgICAgICAvL+OBr+OBv+WHuuOBquOBhOOCiOOBhuOBq1xuICAgICAgICAgICAgeCA9IHggPCAwID8gMCA6IHg7XG4gICAgICAgICAgICB4ID0geCA+IHJlY3Qud2lkdGggPyByZWN0LndpZHRoIDogeDtcbiAgICAgICAgICAgIHkgPSB5IDwgMCA/IDAgOiB5O1xuICAgICAgICAgICAgeSA9IHkgPiByZWN0LmhlaWdodCA/IHJlY3QuaGVpZ2h0IDogeTtcblxuICAgICAgICAgICAgdGhpcy5wcm9wcy5tb3ZlUG9pbnQodGhpcy5wcm9wcy5pbmRleCwgdGhpcy5zdGF0ZS5tb3ZpbmdQb2ludCwge3g6IHgsIHk6IHl9KTtcbiAgICAgICAgfVxuICAgIH0sXG4gICAgaGFuZGxlTW91c2VVcDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe21vdmluZ1BvaW50OiAtMX0pO1xuICAgIH0sXG4gICAgc3RhcnRNb3ZpbmdQb2ludDogZnVuY3Rpb24oaW5kZXgpIHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7bW92aW5nUG9pbnQ6IGluZGV4fSk7XG4gICAgfSxcbiAgICBoYW5kbGVDbGljazogZnVuY3Rpb24oZSkgey8v5Z+65rqW55S75YOP44Gu44Od44Kk44Oz44OI5Lul5aSW44Gu5aC05omA44KS44Kv44Oq44OD44Kv44GX44Gf44KJYWRkUG9pbnRcbiAgICAgICAgaWYodGhpcy5wcm9wcy5pbmRleCA8IDEgJiYgZS50YXJnZXQgPT09IFJlYWN0LmZpbmRET01Ob2RlKHRoaXMucmVmcy5kaXYpKXtcbiAgICAgICAgICAgIHZhciByZWN0ID0gZS50YXJnZXQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgICAgICAgICB0aGlzLnByb3BzLmFkZFBvaW50KHt4OiBlLmNsaWVudFggLSByZWN0LmxlZnQsIHk6IGUuY2xpZW50WSAtIHJlY3QudG9wfSk7XG4gICAgICAgIH1cbiAgICB9LFxuICAgIHJlbmRlcjogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBwb2ludHMgPSB0aGlzLnByb3BzLnBvaW50cy5tYXAoKHBvaW50LCBpbmRleCkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuICg8UG9pbnQga2V5PXtcInBvaW50cy1cIiArIHRoaXMucHJvcHMuaW5kZXggKyBcIi1cIiArIGluZGV4fSBpbmRleD17aW5kZXh9IHg9e3BvaW50Lnh9IHk9e3BvaW50Lnl9IHN0YXJ0TW92aW5nUG9pbnQ9e3RoaXMuc3RhcnRNb3ZpbmdQb2ludH0+PC9Qb2ludD4pXG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgPGRpdiByZWY9XCJkaXZcIiBjbGFzc05hbWU9XCJlZGl0b3ItaW1hZ2UtcG9pbnRzLWNvbnRhaW5lclwiIG9uTW91c2VNb3ZlPXt0aGlzLmhhbmRsZU1vdXNlTW92ZX0gb25Nb3VzZVVwPXt0aGlzLmhhbmRsZU1vdXNlVXB9IG9uQ2xpY2s9e3RoaXMuaGFuZGxlQ2xpY2t9IHN0eWxlPXt7d2lkdGg6IHRoaXMucHJvcHMud2lkdGgsIGhlaWdodDogdGhpcy5wcm9wcy5oZWlnaHR9fT5cbiAgICAgICAgICAgICAgICB7cG9pbnRzfVxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICk7XG4gICAgfVxufSk7XG5cbnZhciBJbWFnZXMgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG4gICAgcmVuZGVyOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGltYWdlcyA9IHRoaXMucHJvcHMuaW1hZ2VzLm1hcCgoaW1hZ2UsIGluZGV4KSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZWRpdG9yLWltYWdlLWNvbnRhaW5lclwiIGtleT17XCJpbWFnZS1jb250YWluZXItXCIgKyBpbmRleH0+XG4gICAgICAgICAgICAgICAgICAgIDxQb2ludHMgaW5kZXg9e2luZGV4fSB3aWR0aD17aW1hZ2Uud2lkdGh9IGhlaWdodD17aW1hZ2UuaGVpZ2h0fSBwb2ludHM9e2ltYWdlLnBvaW50cyA/IGltYWdlLnBvaW50cyA6IFtdfSBtb3ZlUG9pbnQ9e3RoaXMucHJvcHMubW92ZVBvaW50fSBhZGRQb2ludD17dGhpcy5wcm9wcy5hZGRQb2ludH0+PC9Qb2ludHM+XG4gICAgICAgICAgICAgICAgICAgIDxpbWcgaW5kZXg9e2luZGV4fSBzcmM9e2ltYWdlLnNyY30gcmVmPXtcImltYWdlXCIgKyBpbmRleH0gb25Ecm9wPXtmdW5jdGlvbihlKXtlLnByZXZlbnREZWZhdWx0KCk7fX0+PC9pbWc+XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICApO1xuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIDxkaXYgaWQ9XCJlZGl0b3ItaW1hZ2VzXCI+XG4gICAgICAgICAgICAgICAge2ltYWdlc31cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICApO1xuICAgIH1cbn0pO1xuXG52YXIgRWRpdG9yID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuICAgIGhhbmRsZUZpbGVTZWxlY3Q6IGZ1bmN0aW9uKGV2dCkge1xuICAgICAgICBldnQuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgIGV2dC5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gICAgICAgIGNvbnNvbGUubG9nKGV2dCk7XG4gICAgICAgIHZhciBmaWxlcyA9IGV2dC5kYXRhVHJhbnNmZXIuZmlsZXM7IC8vIEZpbGVMaXN0IG9iamVjdFxuICAgICAgICBjb25zb2xlLmxvZyhmaWxlcyk7XG5cbiAgICAgICAgLy8gTG9vcCB0aHJvdWdoIHRoZSBGaWxlTGlzdCBhbmQgcmVuZGVyIGltYWdlIGZpbGVzIGFzIHRodW1ibmFpbHMuXG4gICAgICAgIGZvciAodmFyIGkgPSAwLCBmaWxlOyBmaWxlID0gZmlsZXNbaV07IGkrKykge1xuXG4gICAgICAgICAgICAvLyBPbmx5IHByb2Nlc3MgaW1hZ2UgZmlsZXMuXG4gICAgICAgICAgICBpZiAoIWZpbGUudHlwZS5tYXRjaCgnaW1hZ2UuKicpKSB7XG4gICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHZhciByZWFkZXIgPSBuZXcgRmlsZVJlYWRlcigpO1xuXG4gICAgICAgICAgICAvLyBDbG9zdXJlIHRvIGNhcHR1cmUgdGhlIGZpbGUgaW5mb3JtYXRpb24uXG4gICAgICAgICAgICByZWFkZXIub25sb2FkID0gKGUpID0+IHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlKTtcbiAgICAgICAgICAgICAgICB0aGlzLnByb3BzLmFkZEltYWdlKGUudGFyZ2V0LnJlc3VsdCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIFJlYWQgaW4gdGhlIGltYWdlIGZpbGUgYXMgYSBkYXRhIFVSTC5cbiAgICAgICAgICAgIHJlYWRlci5yZWFkQXNEYXRhVVJMKGZpbGUpO1xuICAgICAgICB9XG4gICAgfSxcbiAgICBoYW5kbGVEcmFnT3ZlcjogZnVuY3Rpb24oZXZ0KSB7XG4gICAgICAgIGV2dC5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgZXZ0LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIGV2dC5kYXRhVHJhbnNmZXIuZHJvcEVmZmVjdCA9ICdjb3B5JzsgLy8gRXhwbGljaXRseSBzaG93IHRoaXMgaXMgYSBjb3B5LlxuICAgIH0sXG4gICAgcmVuZGVyOiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIDxkaXYgaWQ9XCJlZGl0b3JcIj5cbiAgICAgICAgICAgICAgICA8SW1hZ2VzIGltYWdlcz17dGhpcy5wcm9wcy5pbWFnZXN9IHJlZj1cImltYWdlc1wiIG1vdmVQb2ludD17dGhpcy5wcm9wcy5tb3ZlUG9pbnR9IGFkZFBvaW50PXt0aGlzLnByb3BzLmFkZFBvaW50fT48L0ltYWdlcz5cbiAgICAgICAgICAgICAgICA8ZGl2IGlkPVwiZWRpdG9yLWRyb3B6b25lXCIgb25Ecm9wPXt0aGlzLmhhbmRsZUZpbGVTZWxlY3R9IG9uRHJhZ092ZXI9e3RoaXMuaGFuZGxlRHJhZ092ZXJ9PjwvZGl2PlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgIClcbiAgICB9XG59KTtcblxudmFyIEFwcCA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcbiAgICBnZXRJbml0aWFsU3RhdGU6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgaW1hZ2VzOiBbXVxuICAgICAgICB9XG4gICAgfSxcbiAgICBjb21wb25lbnREaWRNb3VudDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHN0YWdlID0gbmV3IGNyZWF0ZWpzLlN0YWdlKFwibXljYW52YXNcIik7XG4gICAgICAgIG1zID0gbmV3IE1vcnBoaW5nU2xpZGVyKHN0YWdlKTtcbiAgICB9LFxuICAgIGFkZEltYWdlOiBmdW5jdGlvbihkYXRhVVJMKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKGRhdGFVUkwpO1xuICAgICAgICB2YXIgbmV3SW1hZ2UgPSB7XG4gICAgICAgICAgICBzcmM6IGRhdGFVUkwsXG4gICAgICAgICAgICBpbmRleDogdGhpcy5zdGF0ZS5pbWFnZXMubGVuZ3RoXG4gICAgICAgIH07XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe2ltYWdlczogdGhpcy5zdGF0ZS5pbWFnZXMuY29uY2F0KFtuZXdJbWFnZV0pfSwgKCkgPT4ge1xuICAgICAgICAgICAgdmFyIGltYWdlRE9NID0gUmVhY3QuZmluZERPTU5vZGUodGhpcy5yZWZzLmVkaXRvci5yZWZzLmltYWdlcy5yZWZzW1wiaW1hZ2VcIiArIG5ld0ltYWdlLmluZGV4XSk7Ly9SZWFjdOOBq+OCiOOCiuODrOODs+ODgOODvOa4iOOBv+OBrkRPTVxuICAgICAgICAgICAgdmFyIHdpZHRoID0gaW1hZ2VET00ud2lkdGgsIGhlaWdodCA9IGltYWdlRE9NLmhlaWdodDtcbiAgICAgICAgICAgIHZhciBwb2ludHMsIGZhY2VzO1xuICAgICAgICAgICAgaWYobmV3SW1hZ2UuaW5kZXg+MCl7XG4gICAgICAgICAgICAgICAgcG9pbnRzID0gdGhpcy5zdGF0ZS5pbWFnZXNbMF0ucG9pbnRzLmNvbmNhdCgpO1xuICAgICAgICAgICAgICAgIGZhY2VzID0gdGhpcy5zdGF0ZS5pbWFnZXNbMF0uZmFjZXMuY29uY2F0KCk7XG4gICAgICAgICAgICB9IGVsc2Ugey8v5Yid5pyf6Kit5a6aXG4gICAgICAgICAgICAgICAgcG9pbnRzID0gW1xuICAgICAgICAgICAgICAgICAgICB7eDowLCB5OjB9LCB7eDp3aWR0aCwgeTowfSwge3g6d2lkdGgsIHk6aGVpZ2h0fSwge3g6MCwgeTpoZWlnaHR9LCB7eDp3aWR0aC8yLCB5OmhlaWdodC8yfVxuICAgICAgICAgICAgICAgIF07XG4gICAgICAgICAgICAgICAgZmFjZXMgPSBbWzAsIDEsIDRdLCBbMSwgMiwgNF0sIFsyLCAzLCA0XSwgWzMsIDQsIDBdXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZhciBpbWFnZXMgPSB0aGlzLnN0YXRlLmltYWdlcy5jb25jYXQoKTtcbiAgICAgICAgICAgIGltYWdlc1tuZXdJbWFnZS5pbmRleF0ucG9pbnRzID0gcG9pbnRzO1xuICAgICAgICAgICAgaW1hZ2VzW25ld0ltYWdlLmluZGV4XS5mYWNlcyA9IGZhY2VzO1xuICAgICAgICAgICAgaW1hZ2VzW25ld0ltYWdlLmluZGV4XS53aWR0aCA9IHdpZHRoO1xuICAgICAgICAgICAgaW1hZ2VzW25ld0ltYWdlLmluZGV4XS5oZWlnaHQgPSBoZWlnaHQ7XG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHtpbWFnZXM6IGltYWdlc30pO1xuICAgICAgICB9KTtcbiAgICB9LFxuICAgIG1vdmVQb2ludDogZnVuY3Rpb24oZmlyc3RJbmRleCwgc2Vjb25kSW5kZXgsIHBvaW50KSB7XG4gICAgICAgIHZhciBpbWFnZXMgPSB0aGlzLnN0YXRlLmltYWdlcy5jb25jYXQoKTtcbiAgICAgICAgaW1hZ2VzW2ZpcnN0SW5kZXhdLnBvaW50c1tzZWNvbmRJbmRleF0gPSBwb2ludDtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7aW1hZ2VzOiBpbWFnZXN9KTtcbiAgICB9LFxuICAgIGFkZFBvaW50OiBmdW5jdGlvbihwb2ludCl7XG4gICAgICAgIHZhciBpbWFnZXMgPSB0aGlzLnN0YXRlLmltYWdlcy5jb25jYXQoKTtcbiAgICAgICAgaW1hZ2VzWzBdLnBvaW50cy5wdXNoKHBvaW50KTtcbiAgICAgICAgaW1hZ2VzWzBdLmZhY2VzID0gY3JlYXRlRmFjZXMoaW1hZ2VzWzBdLnBvaW50cyk7Ly9mYWNlc+OCkuS9nOOCiuebtOOBmVxuICAgICAgICBmb3IodmFyIGk9MSwgbD1pbWFnZXMubGVuZ3RoO2k8bDsgaSsrKXsvL+S7luOBrmltYWdl44Gr44KCcG9pbnTjgahmYWNl44KS6L+95YqgXG4gICAgICAgICAgICBpbWFnZXNbaV0ucG9pbnRzLnB1c2goe3g6IHBvaW50LngsIHk6IHBvaW50Lnl9KTtcbiAgICAgICAgICAgIGltYWdlc1tpXS5mYWNlcyA9IGltYWdlc1swXS5mYWNlcztcbiAgICAgICAgfVxuICAgICAgICBjb25zb2xlLmxvZyhwb2ludCk7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe2ltYWdlczogaW1hZ2VzfSk7XG4gICAgfSxcbiAgICBjaGFuZ2VUcmFuc2Zvcm1FYXNpbmc6IGZ1bmN0aW9uKCl7XG4gICAgICAgIHZhciBzZWxlY3QgPSBSZWFjdC5maW5kRE9NTm9kZSh0aGlzLnJlZnMudHJhbnNmb3JtRWFzaW5nU2VsZWN0KTtcbiAgICAgICAgbXMudHJhbnNmb3JtRWFzaW5nID0gc2VsZWN0Lm9wdGlvbnNbc2VsZWN0LnNlbGVjdGVkSW5kZXhdLnZhbHVlO1xuICAgIH0sXG4gICAgY2hhbmdlQWxwaGFFYXNpbmc6IGZ1bmN0aW9uKCl7XG4gICAgICAgIHZhciBzZWxlY3QgPSBSZWFjdC5maW5kRE9NTm9kZSh0aGlzLnJlZnMuYWxwaGFFYXNpbmdTZWxlY3QpO1xuICAgICAgICBtcy5hbHBoYUVhc2luZyA9IHNlbGVjdC5vcHRpb25zW3NlbGVjdC5zZWxlY3RlZEluZGV4XS52YWx1ZTtcbiAgICB9LFxuICAgIGNoYW5nZUR1bGF0aW9uOiBmdW5jdGlvbigpe1xuICAgICAgICB2YXIgaW5wdXQgPSBSZWFjdC5maW5kRE9NTm9kZSh0aGlzLnJlZnMuZHVsYXRpb25JbnB1dCk7XG4gICAgICAgIG1zLmR1bGF0aW9uID0gaW5wdXQudmFsdWU7XG4gICAgfSxcbiAgICBwbGF5OiBmdW5jdGlvbigpe1xuICAgICAgICBjb25zb2xlLmxvZyhcInBsYXlcIik7XG4gICAgICAgIGlmKCFtcy5pc0FuaW1hdGluZykge1xuICAgICAgICAgICAgbXMuY2xlYXIoKTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKHRoaXMuc3RhdGUuaW1hZ2VzKTtcbiAgICAgICAgICAgIHRoaXMuc3RhdGUuaW1hZ2VzLmZvckVhY2goKGltYWdlLCBpbmRleCkgPT4ge1xuICAgICAgICAgICAgICAgIHZhciBpbWFnZURPTSA9IFJlYWN0LmZpbmRET01Ob2RlKHRoaXMucmVmcy5lZGl0b3IucmVmcy5pbWFnZXMucmVmc1tcImltYWdlXCIgKyBpbmRleF0pOy8vUmVhY3Tjgavjgojjgorjg6zjg7Pjg4Djg7zmuIjjgb/jga5ET01cbiAgICAgICAgICAgICAgICB2YXIgbWkgPSBuZXcgTW9ycGhpbmdJbWFnZShpbWFnZURPTSwgaW1hZ2UucG9pbnRzLCBpbWFnZS5mYWNlcyk7XG4gICAgICAgICAgICAgICAgbXMuYWRkSW1hZ2UobWkpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAgICAgbXMucGxheSgpO1xuICAgICAgICAgICAgfSwgMTAwMCk7XG4gICAgICAgIH1cbiAgICB9LFxuICAgIHJlbmRlcjogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBlYXNpbmdzID0gT2JqZWN0LmtleXMoRWFzaW5nRnVuY3Rpb25zKS5tYXAoZnVuY3Rpb24obmFtZSl7XG4gICAgICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgICAgIDxvcHRpb24gdmFsdWU9e25hbWV9PntuYW1lfTwvb3B0aW9uPlxuICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIDxkaXYgaWQ9XCJhcHBcIj5cbiAgICAgICAgICAgICAgICA8RWRpdG9yIGltYWdlcz17dGhpcy5zdGF0ZS5pbWFnZXN9IGFkZEltYWdlPXt0aGlzLmFkZEltYWdlfSByZWY9XCJlZGl0b3JcIiBtb3ZlUG9pbnQ9e3RoaXMubW92ZVBvaW50fSBhZGRQb2ludD17dGhpcy5hZGRQb2ludH0+PC9FZGl0b3I+XG4gICAgICAgICAgICAgICAgPGJ1dHRvbiBpZD1cInBsYXktYnV0dG9uXCIgb25DbGljaz17dGhpcy5wbGF5fT5QbGF5PC9idXR0b24+XG4gICAgICAgICAgICAgICAgPGNhbnZhcyBpZD1cIm15Y2FudmFzXCIgd2lkdGg9XCI1MDBcIiBoZWlnaHQ9XCI1MDBcIj48L2NhbnZhcz5cbiAgICAgICAgICAgICAgICA8bGFiZWw+VHJhbnNmb3JtIEVhc2luZzogPHNlbGVjdCByZWY9XCJ0cmFuc2Zvcm1FYXNpbmdTZWxlY3RcIiBpZD1cInRyYW5zZm9ybS1lYXNpbmctc2VsZWN0XCIgb25DaGFuZ2U9e3RoaXMuY2hhbmdlVHJhbnNmb3JtRWFzaW5nfT57ZWFzaW5nc308L3NlbGVjdD48L2xhYmVsPlxuICAgICAgICAgICAgICAgIDxsYWJlbD5BbHBoYSBFYXNpbmc6IDxzZWxlY3QgcmVmPVwiYWxwaGFFYXNpbmdTZWxlY3RcIiBpZD1cImFscGhhLWVhc2luZy1zZWxlY3RcIiBvbkNoYW5nZT17dGhpcy5jaGFuZ2VBbHBoYUVhc2luZ30+e2Vhc2luZ3N9PC9zZWxlY3Q+PC9sYWJlbD5cbiAgICAgICAgICAgICAgICA8bGFiZWw+RHVsYXRpb246IDxpbnB1dCByZWY9XCJkdWxhdGlvbklucHV0XCIgdHlwZT1cIm51bWJlclwiIGlkPVwiZHVsYXRpb24taW5wdXRcIiBvbkNoYW5nZT17dGhpcy5jaGFuZ2VEdWxhdGlvbn0+PC9pbnB1dD48YnV0dG9uIGlkPVwiZHVsYXRpb24tYnV0dG9uXCI+T0s8L2J1dHRvbj48L2xhYmVsPlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICk7XG4gICAgfVxufSk7XG5cblJlYWN0LnJlbmRlcihcbiAgICA8QXBwPjwvQXBwPixcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYXBwLWNvbnRhaW5lcicpXG4pOyIsImNsYXNzIE1vcnBoaW5nSW1hZ2Uge1xuICAgIGNvbnN0cnVjdG9yKGltYWdlLCBwb2ludHMsIGZhY2VzKSB7XG4gICAgICAgIHRoaXMuZG9tRWxlbWVudCA9IGltYWdlO1xuXG4gICAgICAgIHRoaXMub3JpZ2luYWxQb2ludHMgPSBwb2ludHM7XG4gICAgICAgIHRoaXMucG9pbnRzID0gW107IC8v5o+P55S744GZ44KL6Zqb44Gu5YuV55qE44Gq5bqn5qiZXG4gICAgICAgIHRoaXMuX2Nsb25lUG9pbnRzKCk7XG5cbiAgICAgICAgdGhpcy5mYWNlcyA9IGZhY2VzO1xuXG4gICAgICAgIHRoaXMuYml0bWFwcyA9IFtdO1xuICAgICAgICB0aGlzLl9hZGRCaXRtYXBzKCk7XG5cbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuICAgIF9jbG9uZVBvaW50cygpIHtcbiAgICAgICAgdGhpcy5vcmlnaW5hbFBvaW50cy5mb3JFYWNoKChwb2ludCwgaW5kZXgpID0+IHsgLy/lr77lv5zjgZnjgovluqfmqJnjgpLkv53mjIHjgZnjgotcbiAgICAgICAgICAgIHRoaXMucG9pbnRzW2luZGV4XSA9IHt4OiBwb2ludC54LCB5OiBwb2ludC55fTtcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIF9hZGRCaXRtYXBzKCkge1xuICAgICAgICB0aGlzLmZhY2VzLmZvckVhY2goKGZhY2UpID0+IHtcbiAgICAgICAgICAgIHZhciBibXAgPSBuZXcgY3JlYXRlanMuQml0bWFwKHRoaXMuZG9tRWxlbWVudCk7XG4gICAgICAgICAgICB2YXIgc2hhcGUgPSBuZXcgY3JlYXRlanMuU2hhcGUoKTtcbiAgICAgICAgICAgIHNoYXBlLmdyYXBoaWNzLm1vdmVUbyh0aGlzLnBvaW50c1tmYWNlWzBdXS54LCB0aGlzLnBvaW50c1tmYWNlWzBdXS55KVxuICAgICAgICAgICAgICAgIC5saW5lVG8odGhpcy5wb2ludHNbZmFjZVsxXV0ueCwgdGhpcy5wb2ludHNbZmFjZVsxXV0ueSlcbiAgICAgICAgICAgICAgICAubGluZVRvKHRoaXMucG9pbnRzW2ZhY2VbMl1dLngsIHRoaXMucG9pbnRzW2ZhY2VbMl1dLnkpO1xuICAgICAgICAgICAgYm1wLm1hc2sgPSBzaGFwZTtcbiAgICAgICAgICAgIHRoaXMuYml0bWFwcy5wdXNoKGJtcCk7XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBzZXRBbHBoYShhKSB7XG4gICAgICAgIHRoaXMuYml0bWFwcy5mb3JFYWNoKChibXAsIGluZGV4KSA9PiB7XG4gICAgICAgICAgICB0aGlzLmJpdG1hcHNbaW5kZXhdLmFscGhhID0gYTtcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIHVwZGF0ZSgpIHtcbiAgICAgICAgLy/jgqLjg5XjgqPjg7PlpInmj5vooYzliJfjgpLmsYLjgoHjgIHjg5Hjg7zjg4TjgpLmj4/nlLtcbiAgICAgICAgdGhpcy5mYWNlcy5mb3JFYWNoKChmYWNlLCBpbmRleCkgPT4ge1xuICAgICAgICAgICAgdmFyIHBvaW50czEgPSBbdGhpcy5vcmlnaW5hbFBvaW50c1tmYWNlWzBdXSwgdGhpcy5vcmlnaW5hbFBvaW50c1tmYWNlWzFdXSwgdGhpcy5vcmlnaW5hbFBvaW50c1tmYWNlWzJdXV07XG4gICAgICAgICAgICB2YXIgcG9pbnRzMiA9IFt0aGlzLnBvaW50c1tmYWNlWzBdXSwgdGhpcy5wb2ludHNbZmFjZVsxXV0sIHRoaXMucG9pbnRzW2ZhY2VbMl1dXTtcbiAgICAgICAgICAgIHZhciBtYXRyaXggPSB0aGlzLl9nZXRBZmZpbmVUcmFuc2Zvcm0ocG9pbnRzMSwgcG9pbnRzMik7XG4gICAgICAgICAgICB0aGlzLmJpdG1hcHNbaW5kZXhdLnRyYW5zZm9ybU1hdHJpeCA9IHRoaXMuYml0bWFwc1tpbmRleF0ubWFzay50cmFuc2Zvcm1NYXRyaXggPSBtYXRyaXg7XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBfZ2V0QWZmaW5lVHJhbnNmb3JtKHBvaW50czEsIHBvaW50czIpe1xuICAgICAgICB2YXIgYSwgYiwgYywgZCwgdHgsIHR5O1xuXG4gICAgICAgIC8vIOmAo+eri+aWueeoi+W8j+OCkuino+OBj1xuICAgICAgICBhID0gKHBvaW50czJbMF0ueCAqIHBvaW50czFbMV0ueSArIHBvaW50czJbMV0ueCAqIHBvaW50czFbMl0ueSArIHBvaW50czJbMl0ueCAqIHBvaW50czFbMF0ueSAtIHBvaW50czJbMF0ueCAqIHBvaW50czFbMl0ueSAtIHBvaW50czJbMV0ueCAqIHBvaW50czFbMF0ueSAtIHBvaW50czJbMl0ueCAqIHBvaW50czFbMV0ueSkgLyAocG9pbnRzMVswXS54ICogcG9pbnRzMVsxXS55ICsgcG9pbnRzMVsxXS54ICogcG9pbnRzMVsyXS55ICsgcG9pbnRzMVsyXS54ICogcG9pbnRzMVswXS55IC0gcG9pbnRzMVswXS54ICogcG9pbnRzMVsyXS55IC0gcG9pbnRzMVsxXS54ICogcG9pbnRzMVswXS55IC0gcG9pbnRzMVsyXS54ICogcG9pbnRzMVsxXS55KTtcbiAgICAgICAgYiA9IChwb2ludHMyWzBdLnkgKiBwb2ludHMxWzFdLnkgKyBwb2ludHMyWzFdLnkgKiBwb2ludHMxWzJdLnkgKyBwb2ludHMyWzJdLnkgKiBwb2ludHMxWzBdLnkgLSBwb2ludHMyWzBdLnkgKiBwb2ludHMxWzJdLnkgLSBwb2ludHMyWzFdLnkgKiBwb2ludHMxWzBdLnkgLSBwb2ludHMyWzJdLnkgKiBwb2ludHMxWzFdLnkpIC8gKHBvaW50czFbMF0ueCAqIHBvaW50czFbMV0ueSArIHBvaW50czFbMV0ueCAqIHBvaW50czFbMl0ueSArIHBvaW50czFbMl0ueCAqIHBvaW50czFbMF0ueSAtIHBvaW50czFbMF0ueCAqIHBvaW50czFbMl0ueSAtIHBvaW50czFbMV0ueCAqIHBvaW50czFbMF0ueSAtIHBvaW50czFbMl0ueCAqIHBvaW50czFbMV0ueSk7XG4gICAgICAgIGMgPSAocG9pbnRzMVswXS54ICogcG9pbnRzMlsxXS54ICsgcG9pbnRzMVsxXS54ICogcG9pbnRzMlsyXS54ICsgcG9pbnRzMVsyXS54ICogcG9pbnRzMlswXS54IC0gcG9pbnRzMVswXS54ICogcG9pbnRzMlsyXS54IC0gcG9pbnRzMVsxXS54ICogcG9pbnRzMlswXS54IC0gcG9pbnRzMVsyXS54ICogcG9pbnRzMlsxXS54KSAvIChwb2ludHMxWzBdLnggKiBwb2ludHMxWzFdLnkgKyBwb2ludHMxWzFdLnggKiBwb2ludHMxWzJdLnkgKyBwb2ludHMxWzJdLnggKiBwb2ludHMxWzBdLnkgLSBwb2ludHMxWzBdLnggKiBwb2ludHMxWzJdLnkgLSBwb2ludHMxWzFdLnggKiBwb2ludHMxWzBdLnkgLSBwb2ludHMxWzJdLnggKiBwb2ludHMxWzFdLnkpO1xuICAgICAgICBkID0gKHBvaW50czFbMF0ueCAqIHBvaW50czJbMV0ueSArIHBvaW50czFbMV0ueCAqIHBvaW50czJbMl0ueSArIHBvaW50czFbMl0ueCAqIHBvaW50czJbMF0ueSAtIHBvaW50czFbMF0ueCAqIHBvaW50czJbMl0ueSAtIHBvaW50czFbMV0ueCAqIHBvaW50czJbMF0ueSAtIHBvaW50czFbMl0ueCAqIHBvaW50czJbMV0ueSkgLyAocG9pbnRzMVswXS54ICogcG9pbnRzMVsxXS55ICsgcG9pbnRzMVsxXS54ICogcG9pbnRzMVsyXS55ICsgcG9pbnRzMVsyXS54ICogcG9pbnRzMVswXS55IC0gcG9pbnRzMVswXS54ICogcG9pbnRzMVsyXS55IC0gcG9pbnRzMVsxXS54ICogcG9pbnRzMVswXS55IC0gcG9pbnRzMVsyXS54ICogcG9pbnRzMVsxXS55KTtcbiAgICAgICAgdHggPSAocG9pbnRzMVswXS54ICogcG9pbnRzMVsxXS55ICogcG9pbnRzMlsyXS54ICsgcG9pbnRzMVsxXS54ICogcG9pbnRzMVsyXS55ICogcG9pbnRzMlswXS54ICsgcG9pbnRzMVsyXS54ICogcG9pbnRzMVswXS55ICogcG9pbnRzMlsxXS54IC0gcG9pbnRzMVswXS54ICogcG9pbnRzMVsyXS55ICogcG9pbnRzMlsxXS54IC0gcG9pbnRzMVsxXS54ICogcG9pbnRzMVswXS55ICogcG9pbnRzMlsyXS54IC0gcG9pbnRzMVsyXS54ICogcG9pbnRzMVsxXS55ICogcG9pbnRzMlswXS54KSAvIChwb2ludHMxWzBdLnggKiBwb2ludHMxWzFdLnkgKyBwb2ludHMxWzFdLnggKiBwb2ludHMxWzJdLnkgKyBwb2ludHMxWzJdLnggKiBwb2ludHMxWzBdLnkgLSBwb2ludHMxWzBdLnggKiBwb2ludHMxWzJdLnkgLSBwb2ludHMxWzFdLnggKiBwb2ludHMxWzBdLnkgLSBwb2ludHMxWzJdLnggKiBwb2ludHMxWzFdLnkpO1xuICAgICAgICB0eSA9IChwb2ludHMxWzBdLnggKiBwb2ludHMxWzFdLnkgKiBwb2ludHMyWzJdLnkgKyBwb2ludHMxWzFdLnggKiBwb2ludHMxWzJdLnkgKiBwb2ludHMyWzBdLnkgKyBwb2ludHMxWzJdLnggKiBwb2ludHMxWzBdLnkgKiBwb2ludHMyWzFdLnkgLSBwb2ludHMxWzBdLnggKiBwb2ludHMxWzJdLnkgKiBwb2ludHMyWzFdLnkgLSBwb2ludHMxWzFdLnggKiBwb2ludHMxWzBdLnkgKiBwb2ludHMyWzJdLnkgLSBwb2ludHMxWzJdLnggKiBwb2ludHMxWzFdLnkgKiBwb2ludHMyWzBdLnkpIC8gKHBvaW50czFbMF0ueCAqIHBvaW50czFbMV0ueSArIHBvaW50czFbMV0ueCAqIHBvaW50czFbMl0ueSArIHBvaW50czFbMl0ueCAqIHBvaW50czFbMF0ueSAtIHBvaW50czFbMF0ueCAqIHBvaW50czFbMl0ueSAtIHBvaW50czFbMV0ueCAqIHBvaW50czFbMF0ueSAtIHBvaW50czFbMl0ueCAqIHBvaW50czFbMV0ueSk7XG5cbiAgICAgICAgdmFyIG1hdHJpeCA9IG5ldyBjcmVhdGVqcy5NYXRyaXgyRChhLCBiLCBjLCBkLCB0eCwgdHkpO1xuICAgICAgICByZXR1cm4gbWF0cml4O1xuICAgIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgTW9ycGhpbmdJbWFnZTsiLCJpbXBvcnQgRWFzaW5nRnVuY3Rpb25zIGZyb20gXCIuL2Vhc2luZy5qc1wiO1xuXG5jbGFzcyBNb3JwaGluZ1NsaWRlciB7XG4gICAgY29uc3RydWN0b3Ioc3RhZ2UpIHtcbiAgICAgICAgdGhpcy5pbWFnZXMgPSBbXTtcbiAgICAgICAgdGhpcy5zdGFnZSA9IHN0YWdlO1xuICAgICAgICB0aGlzLnRyYW5zZm9ybUVhc2luZyA9IHRoaXMuYWxwaGFFYXNpbmcgPSBcImxpbmVhclwiO1xuICAgICAgICB0aGlzLmR1bGF0aW9uID0gMjAwO1xuICAgICAgICB0aGlzLmlzQW5pbWF0aW5nID0gZmFsc2U7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbiAgICBhZGRJbWFnZShtb3JwaGluZ0ltYWdlKSB7XG4gICAgICAgIG1vcnBoaW5nSW1hZ2UuYml0bWFwcy5mb3JFYWNoKChibXAsIGluZGV4KSA9PiB7XG4gICAgICAgICAgICBpZih0aGlzLmltYWdlcy5sZW5ndGg+MCl7Ly/mnIDliJ3ku6XlpJbjga/mj4/nlLvjgZfjgarjgYRcbiAgICAgICAgICAgICAgICBtb3JwaGluZ0ltYWdlLmJpdG1hcHNbaW5kZXhdLmFscGhhID0gMDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuc3RhZ2UuYWRkQ2hpbGQobW9ycGhpbmdJbWFnZS5iaXRtYXBzW2luZGV4XSk7XG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLmltYWdlcy5wdXNoKG1vcnBoaW5nSW1hZ2UpO1xuICAgICAgICB0aGlzLnN0YWdlLnVwZGF0ZSgpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG4gICAgcGxheSgpIHtcbiAgICAgICAgaWYodGhpcy5pc0FuaW1hdGluZyB8fCB0aGlzLmltYWdlcy5sZW5ndGg8Mil7IC8v44Ki44OL44Oh44O844K344On44Oz44Gu6YeN6KSH44KS6Ziy44GQXG4gICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgfVxuICAgICAgICB2YXIgdCA9IDA7XG4gICAgICAgIHZhciB0b3RhbCA9IHRoaXMuZHVsYXRpb24qNjAvMTAwMDtcbiAgICAgICAgdmFyIGludGVydmFsID0gMTAwMC82MDsgLy82MGZwc1xuICAgICAgICB2YXIgdGltZXIgPSBzZXRJbnRlcnZhbCgoKSA9PiB7XG4gICAgICAgICAgICBpZih0Pj10b3RhbCl7XG4gICAgICAgICAgICAgICAgY2xlYXJJbnRlcnZhbCh0aW1lcik7XG4gICAgICAgICAgICAgICAgdGhpcy5pc0FuaW1hdGluZyA9IGZhbHNlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB2YXIgZSA9IEVhc2luZ0Z1bmN0aW9uc1t0aGlzLnRyYW5zZm9ybUVhc2luZ10odC90b3RhbCk7XG4gICAgICAgICAgICB0aGlzLmltYWdlc1swXS5wb2ludHMuZm9yRWFjaCgocG9pbnQsIGluZGV4KSA9PiB7XG4gICAgICAgICAgICAgICAgdGhpcy5pbWFnZXNbMF0ucG9pbnRzW2luZGV4XS54ID0gdGhpcy5pbWFnZXNbMV0ub3JpZ2luYWxQb2ludHNbaW5kZXhdLnggKiBlICsgdGhpcy5pbWFnZXNbMF0ub3JpZ2luYWxQb2ludHNbaW5kZXhdLnggKiAoMS1lKTtcbiAgICAgICAgICAgICAgICB0aGlzLmltYWdlc1swXS5wb2ludHNbaW5kZXhdLnkgPSB0aGlzLmltYWdlc1sxXS5vcmlnaW5hbFBvaW50c1tpbmRleF0ueSAqIGUgKyB0aGlzLmltYWdlc1swXS5vcmlnaW5hbFBvaW50c1tpbmRleF0ueSAqICgxLWUpO1xuICAgICAgICAgICAgICAgIHRoaXMuaW1hZ2VzWzFdLnBvaW50c1tpbmRleF0ueCA9IHRoaXMuaW1hZ2VzWzBdLm9yaWdpbmFsUG9pbnRzW2luZGV4XS54ICogKDEtZSkgKyB0aGlzLmltYWdlc1sxXS5vcmlnaW5hbFBvaW50c1tpbmRleF0ueCAqIGU7XG4gICAgICAgICAgICAgICAgdGhpcy5pbWFnZXNbMV0ucG9pbnRzW2luZGV4XS55ID0gdGhpcy5pbWFnZXNbMF0ub3JpZ2luYWxQb2ludHNbaW5kZXhdLnkgKiAoMS1lKSArIHRoaXMuaW1hZ2VzWzFdLm9yaWdpbmFsUG9pbnRzW2luZGV4XS55ICogZTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBlID0gRWFzaW5nRnVuY3Rpb25zW3RoaXMuYWxwaGFFYXNpbmddKHQvdG90YWwpO1xuICAgICAgICAgICAgdGhpcy5pbWFnZXNbMF0uc2V0QWxwaGEoMS1lKTtcbiAgICAgICAgICAgIHRoaXMuaW1hZ2VzWzFdLnNldEFscGhhKGUpO1xuICAgICAgICAgICAgdGhpcy5pbWFnZXNbMF0udXBkYXRlKCk7XG4gICAgICAgICAgICB0aGlzLmltYWdlc1sxXS51cGRhdGUoKTtcbiAgICAgICAgICAgIHRoaXMuc3RhZ2UudXBkYXRlKCk7XG5cbiAgICAgICAgICAgIHQrKztcbiAgICAgICAgfSwgaW50ZXJ2YWwpO1xuICAgICAgICB0aGlzLmlzQW5pbWF0aW5nID0gdHJ1ZTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuICAgIGNsZWFyKCkge1xuICAgICAgICB0aGlzLmltYWdlcyA9IFtdO1xuICAgICAgICB0aGlzLnN0YWdlLmNsZWFyKCk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgTW9ycGhpbmdTbGlkZXI7IiwidmFyIEVhc2luZ0Z1bmN0aW9ucyA9IHtcbiAgICAvLyBubyBlYXNpbmcsIG5vIGFjY2VsZXJhdGlvblxuICAgIGxpbmVhcjogZnVuY3Rpb24gKHQpIHsgcmV0dXJuIHQgfSxcbiAgICAvLyBhY2NlbGVyYXRpbmcgZnJvbSB6ZXJvIHZlbG9jaXR5XG4gICAgZWFzZUluUXVhZDogZnVuY3Rpb24gKHQpIHsgcmV0dXJuIHQqdCB9LFxuICAgIC8vIGRlY2VsZXJhdGluZyB0byB6ZXJvIHZlbG9jaXR5XG4gICAgZWFzZU91dFF1YWQ6IGZ1bmN0aW9uICh0KSB7IHJldHVybiB0KigyLXQpIH0sXG4gICAgLy8gYWNjZWxlcmF0aW9uIHVudGlsIGhhbGZ3YXksIHRoZW4gZGVjZWxlcmF0aW9uXG4gICAgZWFzZUluT3V0UXVhZDogZnVuY3Rpb24gKHQpIHsgcmV0dXJuIHQ8LjUgPyAyKnQqdCA6IC0xKyg0LTIqdCkqdCB9LFxuICAgIC8vIGFjY2VsZXJhdGluZyBmcm9tIHplcm8gdmVsb2NpdHlcbiAgICBlYXNlSW5DdWJpYzogZnVuY3Rpb24gKHQpIHsgcmV0dXJuIHQqdCp0IH0sXG4gICAgLy8gZGVjZWxlcmF0aW5nIHRvIHplcm8gdmVsb2NpdHlcbiAgICBlYXNlT3V0Q3ViaWM6IGZ1bmN0aW9uICh0KSB7IHJldHVybiAoLS10KSp0KnQrMSB9LFxuICAgIC8vIGFjY2VsZXJhdGlvbiB1bnRpbCBoYWxmd2F5LCB0aGVuIGRlY2VsZXJhdGlvblxuICAgIGVhc2VJbk91dEN1YmljOiBmdW5jdGlvbiAodCkgeyByZXR1cm4gdDwuNSA/IDQqdCp0KnQgOiAodC0xKSooMip0LTIpKigyKnQtMikrMSB9LFxuICAgIC8vIGFjY2VsZXJhdGluZyBmcm9tIHplcm8gdmVsb2NpdHlcbiAgICBlYXNlSW5RdWFydDogZnVuY3Rpb24gKHQpIHsgcmV0dXJuIHQqdCp0KnQgfSxcbiAgICAvLyBkZWNlbGVyYXRpbmcgdG8gemVybyB2ZWxvY2l0eVxuICAgIGVhc2VPdXRRdWFydDogZnVuY3Rpb24gKHQpIHsgcmV0dXJuIDEtKC0tdCkqdCp0KnQgfSxcbiAgICAvLyBhY2NlbGVyYXRpb24gdW50aWwgaGFsZndheSwgdGhlbiBkZWNlbGVyYXRpb25cbiAgICBlYXNlSW5PdXRRdWFydDogZnVuY3Rpb24gKHQpIHsgcmV0dXJuIHQ8LjUgPyA4KnQqdCp0KnQgOiAxLTgqKC0tdCkqdCp0KnQgfSxcbiAgICAvLyBhY2NlbGVyYXRpbmcgZnJvbSB6ZXJvIHZlbG9jaXR5XG4gICAgZWFzZUluUXVpbnQ6IGZ1bmN0aW9uICh0KSB7IHJldHVybiB0KnQqdCp0KnQgfSxcbiAgICAvLyBkZWNlbGVyYXRpbmcgdG8gemVybyB2ZWxvY2l0eVxuICAgIGVhc2VPdXRRdWludDogZnVuY3Rpb24gKHQpIHsgcmV0dXJuIDErKC0tdCkqdCp0KnQqdCB9LFxuICAgIC8vIGFjY2VsZXJhdGlvbiB1bnRpbCBoYWxmd2F5LCB0aGVuIGRlY2VsZXJhdGlvblxuICAgIGVhc2VJbk91dFF1aW50OiBmdW5jdGlvbiAodCkgeyByZXR1cm4gdDwuNSA/IDE2KnQqdCp0KnQqdCA6IDErMTYqKC0tdCkqdCp0KnQqdCB9XG59O1xuXG5leHBvcnQgZGVmYXVsdCBFYXNpbmdGdW5jdGlvbnM7Il19
