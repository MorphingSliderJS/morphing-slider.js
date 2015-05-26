(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _AppJs = require('./App.js');

var _AppJs2 = _interopRequireDefault(_AppJs);

React.render(React.createElement(_AppJs2['default'], null), document.getElementById('app-container'));

},{"./App.js":2}],2:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _easingJs = require('./easing.js');

var _easingJs2 = _interopRequireDefault(_easingJs);

var _MorphingSliderJs = require('./MorphingSlider.js');

var _MorphingSliderJs2 = _interopRequireDefault(_MorphingSliderJs);

var _MorphingImageJs = require('./MorphingImage.js');

var _MorphingImageJs2 = _interopRequireDefault(_MorphingImageJs);

var _EditorJs = require('./Editor.js');

var _EditorJs2 = _interopRequireDefault(_EditorJs);

var stage, ms;

var App = React.createClass({
    displayName: 'App',

    getInitialState: function getInitialState() {
        if (localStorage.state) {
            return JSON.parse(localStorage.state);
        } else {
            return {
                images: [],
                movingPoint: -1,
                editingImage: -1,
                movingPointRect: null,
                baseIndex: 0 //基準画像
            };
        }
    },
    componentDidMount: function componentDidMount() {
        stage = new createjs.Stage('mycanvas');
        ms = new _MorphingSliderJs2['default'](stage);
    },
    handleFileSelect: function handleFileSelect(evt) {
        var _this = this;

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
                _this.addImage(e.target.result);
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
    addImage: function addImage(dataURL) {
        var _this2 = this;

        var newImage = {
            src: dataURL,
            index: this.state.images.length
        };
        this.setState({ images: this.state.images.concat([newImage]) }, function () {
            var imageDOM = React.findDOMNode(_this2.refs.editor.refs.images.refs['Image' + newImage.index].refs.img); //Reactによりレンダー済みのDOM
            var width = imageDOM.width,
                height = imageDOM.height;
            var points, faces;
            if (newImage.index > 0) {
                points = _this2.state.images[_this2.state.baseIndex].points.concat(); //基準画像の物をコピー
                faces = _this2.state.images[_this2.state.baseIndex].faces.concat(); //基準画像の物をコピー
            } else {
                //初期設定
                points = [{ x: 0, y: 0 }, { x: width, y: 0 }, { x: width, y: height }, { x: 0, y: height }, { x: width / 2, y: height / 2 }];
                faces = [[0, 1, 4], [1, 2, 4], [2, 3, 4], [3, 4, 0]];
            }
            var images = _this2.state.images.concat();
            images[newImage.index].points = points;
            images[newImage.index].faces = faces;
            images[newImage.index].width = width;
            images[newImage.index].height = height;
            _this2.setState({ images: images });
        });
    },
    handleMouseMove: function handleMouseMove(e) {
        if (this.state.movingPoint >= 0) {
            var rect = this.state.movingPointRect,
                x = e.clientX - rect.left,
                y = e.clientY - rect.top;

            //はみ出ないように
            x = x < 0 ? 0 : x;
            x = x > rect.width ? rect.width : x;
            y = y < 0 ? 0 : y;
            y = y > rect.height ? rect.height : y;

            this.movePoint({ x: x, y: y });
        }
    },
    handleMouseUp: function handleMouseUp() {
        if (this.state.editingImage > -1) {
            this.setState({ editingImage: -1, movingPoint: -1 });
        }
    },
    movePoint: function movePoint(point) {
        var images = this.state.images.concat();
        images[this.state.editingImage].points[this.state.movingPoint] = point;
        this.setState({ images: images });
    },
    startMovingPoint: function startMovingPoint(editingImage, movingPoint, movingPointRect) {
        this.setState({ editingImage: editingImage, movingPoint: movingPoint, movingPointRect: movingPointRect });
    },
    addPoint: function addPoint(index, point) {
        var _this3 = this;

        if (index === this.state.baseIndex) {
            //基準画像ならPoint追加
            var images = this.state.images.concat();
            var baseImage = images[this.state.baseIndex];
            baseImage.points.push(point);
            baseImage.faces = this.createFaces(baseImage.points); //facesを作り直す
            images.forEach(function (image, index) {
                //他のimageにもpointとfaceを追加
                if (_this3.state.baseIndex !== index) {
                    images[index].points.push({ x: point.x, y: point.y });
                    images[index].faces = baseImage.faces;
                }
            });
            this.setState({ images: images });
        }
    },
    removePoint: function removePoint(imageIndex, pointIndex) {
        var _this4 = this;

        //Pointの削除
        if (imageIndex === this.state.baseIndex) {
            //基準画像なら削除
            var images = this.state.images.concat();
            var baseImage = images[this.state.baseIndex];
            baseImage.points.splice(pointIndex, 1);
            baseImage.faces = this.createFaces(baseImage.points); //facesを作り直す
            images.forEach(function (image, index) {
                //他のimageのpointを削除、faceを更新
                if (_this4.state.baseIndex !== index) {
                    images[index].points.splice(pointIndex, 1);
                    images[index].faces = baseImage.faces;
                }
            });
            this.setState({ images: images });
        }
    },
    removeImage: function removeImage(index) {
        var images = this.state.images.concat();
        images.splice(index, 1);

        //*****基準画像を削除した場合の処理が必要*****

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

        if (!ms.isAnimating) {
            ms.clear();
            this.state.images.forEach(function (image, index) {
                var imageDOM = React.findDOMNode(_this5.refs.editor.refs.images.refs['Image' + index].refs.img); //Reactによりレンダー済みのDOM
                var mi = new _MorphingImageJs2['default'](imageDOM, image.points, image.faces);
                ms.addImage(mi);
            });
            setTimeout(function () {
                ms.play();
            }, 1000);
        }
    },
    createFaces: function createFaces(points) {
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
    },
    save: function save() {
        //ひとまずlocalStrageに保存
        localStorage.state = JSON.stringify(this.state);
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
            { id: 'app', onMouseMove: this.handleMouseMove, onMouseUp: this.handleMouseUp, onDrop: this.handleFileSelect, onDragOver: this.handleDragOver },
            React.createElement(_EditorJs2['default'], { images: this.state.images, movingPoint: this.state.movingPoint, addImage: this.addImage, ref: 'editor', startMovingPoint: this.startMovingPoint, addPoint: this.addPoint, removePoint: this.removePoint, removeImage: this.removeImage }),
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
                React.createElement('input', { ref: 'dulationInput', type: 'number', id: 'dulation-input', onChange: this.changeDulation })
            ),
            React.createElement(
                'button',
                { id: 'save-button', onClick: this.save },
                'Save'
            )
        );
    }
});

exports['default'] = App;
module.exports = exports['default'];

},{"./Editor.js":3,"./MorphingImage.js":6,"./MorphingSlider.js":7,"./easing.js":10}],3:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var _ImagesJs = require("./Images.js");

var _ImagesJs2 = _interopRequireDefault(_ImagesJs);

var Editor = React.createClass({
    displayName: "Editor",

    render: function render() {
        return React.createElement(
            "div",
            { id: "editor" },
            React.createElement(_ImagesJs2["default"], { images: this.props.images, movingPoint: this.props.movingPoint, ref: "images", startMovingPoint: this.props.startMovingPoint, addPoint: this.props.addPoint, removePoint: this.props.removePoint, removeImage: this.props.removeImage })
        );
    }
});

exports["default"] = Editor;
module.exports = exports["default"];

},{"./Images.js":5}],4:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var _PointsJs = require("./Points.js");

var _PointsJs2 = _interopRequireDefault(_PointsJs);

Image = React.createClass({
    displayName: "Image",

    removeImage: function removeImage() {
        //indexをAppに送って削除
        this.props.removeImage(this.props.index);
    },
    getJSONString: function getJSONString() {
        //PointsとFacesを表示
        return JSON.stringify({
            points: this.props.image.points,
            faces: this.props.image.faces
        });
    },
    render: function render() {
        return React.createElement(
            "div",
            { className: "editor-image-container" },
            React.createElement(_PointsJs2["default"], { index: this.props.index, movingPoint: this.props.movingPoint, width: this.props.image.width, height: this.props.image.height, points: this.props.image.points ? this.props.image.points : [], startMovingPoint: this.props.startMovingPoint, addPoint: this.props.addPoint, removePoint: this.props.removePoint }),
            React.createElement("img", { src: this.props.image.src, ref: "img" }),
            React.createElement(
                "button",
                { className: "editor-image-remove-button", onClick: this.removeImage },
                "×"
            ),
            React.createElement("textarea", { value: this.getJSONString(), readOnly: true })
        );
    }
});

exports["default"] = Image;
module.exports = exports["default"];

},{"./Points.js":9}],5:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var _ImageJs = require("./Image.js");

var _ImageJs2 = _interopRequireDefault(_ImageJs);

var Images = React.createClass({
    displayName: "Images",

    render: function render() {
        var _this = this;

        var images = this.props.images.map(function (image, index) {
            return React.createElement(_ImageJs2["default"], { ref: "Image" + index, key: "image-container-" + index, index: index, image: image, movingPoint: _this.props.movingPoint, startMovingPoint: _this.props.startMovingPoint, addPoint: _this.props.addPoint, removePoint: _this.props.removePoint, removeImage: _this.props.removeImage });
        });
        return React.createElement(
            "div",
            { id: "editor-images" },
            images
        );
    }
});

exports["default"] = Images;
module.exports = exports["default"];

},{"./Image.js":4}],6:[function(require,module,exports){
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

},{}],7:[function(require,module,exports){
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
        this.index = 0; //表示している画像のindex
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
            var before = this.images[this.index];
            var after = this.images[this.index + 1];
            var timer = setInterval(function () {
                var e = _easingJs2["default"][_this2.transformEasing](t / total);
                before.points.forEach(function (point, index) {
                    before.points[index].x = after.originalPoints[index].x * e + before.originalPoints[index].x * (1 - e);
                    before.points[index].y = after.originalPoints[index].y * e + before.originalPoints[index].y * (1 - e);
                    after.points[index].x = before.originalPoints[index].x * (1 - e) + after.originalPoints[index].x * e;
                    after.points[index].y = before.originalPoints[index].y * (1 - e) + after.originalPoints[index].y * e;
                });

                e = _easingJs2["default"][_this2.alphaEasing](t / total);
                before.setAlpha(1 - e);
                after.setAlpha(e);
                console.log(e);
                before.update();
                after.update();
                _this2.stage.update();

                t++;
                if (t > total) {
                    if (_this2.index >= _this2.images.length - 2) {
                        //終了
                        _this2.index = 0;
                        _this2.isAnimating = false;
                        clearInterval(timer);
                    } else {
                        //次のモーフィングへ
                        _this2.index++;
                        before = after;
                        after = _this2.images[_this2.index + 1];
                        t = 0;
                    }
                }
            }, interval);
            this.isAnimating = true;
            return this;
        }
    }, {
        key: "clear",
        value: function clear() {
            this.images = [];
            this.stage.clear();
            this.stage.removeAllChildren();
            return this;
        }
    }]);

    return MorphingSlider;
})();

exports["default"] = MorphingSlider;
module.exports = exports["default"];

},{"./easing.js":10}],8:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
var Point = React.createClass({
    displayName: "Point",

    getInitialState: function getInitialState() {
        return {
            isMouseDown: false
        };
    },
    handleMouseDown: function handleMouseDown(e) {
        this.props.startMovingPoint(this.props.index);
    },
    handleDoubleClick: function handleDoubleClick() {
        //ダブルクリックでPointの削除（ただし、基準画像のみ）
        this.props.removePoint(this.props.index);
    },
    render: function render() {
        return React.createElement("div", { className: "editor-image-point" + (this.props.isMoving ? " moving" : ""), style: {
                left: this.props.x,
                top: this.props.y
            }, onMouseDown: this.handleMouseDown, onDoubleClick: this.handleDoubleClick, onDragStart: function (e) {
                e.preventDefault();
            } });
    }
});

exports["default"] = Point;
module.exports = exports["default"];

},{}],9:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var _PointJs = require("./Point.js");

var _PointJs2 = _interopRequireDefault(_PointJs);

var Points = React.createClass({
    displayName: "Points",

    startMovingPoint: function startMovingPoint(index) {
        //どの画像のどのポイントを動かし始めたかをAppに届ける
        var rect = React.findDOMNode(this.refs.div).getBoundingClientRect();
        this.props.startMovingPoint(this.props.index, index, rect);
    },
    handleClick: function handleClick(e) {
        //Point以外の場所をクリックしたらaddPoint（Appで基準画像かどうか判断）
        if (e.target === React.findDOMNode(this.refs.div)) {
            //Pointをクリックした場合もhandleClickされるので、ふるい分け
            var rect = e.target.getBoundingClientRect();
            this.props.addPoint(this.props.index, { x: e.clientX - rect.left, y: e.clientY - rect.top });
        }
    },
    removePoint: function removePoint(index) {
        //基準画像ならPointの削除
        this.props.removePoint(this.props.index, index);
    },
    render: function render() {
        var _this = this;

        var points = this.props.points.map(function (point, index) {
            return React.createElement(_PointJs2["default"], { key: "points-" + _this.props.index + "-" + index, isMoving: _this.props.movingPoint === index, index: index, x: point.x, y: point.y, startMovingPoint: _this.startMovingPoint, removePoint: _this.removePoint });
        });
        return React.createElement(
            "div",
            { ref: "div", className: "editor-image-points-container", onMouseMove: this.handleMouseMove, onMouseUp: this.handleMouseUp, onClick: this.handleClick, style: { width: this.props.width, height: this.props.height } },
            points
        );
    }
});

exports["default"] = Points;
module.exports = exports["default"];

},{"./Point.js":8}],10:[function(require,module,exports){
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
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMveWFtYW1vdG9ub2Rva2EvRGVza3RvcC9pbWFnZS1tb3JwaGluZy9zcmMvanMvbWFpbjIuanMiLCIvVXNlcnMveWFtYW1vdG9ub2Rva2EvRGVza3RvcC9pbWFnZS1tb3JwaGluZy9zcmMvanMvQXBwLmpzIiwiL1VzZXJzL3lhbWFtb3Rvbm9kb2thL0Rlc2t0b3AvaW1hZ2UtbW9ycGhpbmcvc3JjL2pzL0VkaXRvci5qcyIsIi9Vc2Vycy95YW1hbW90b25vZG9rYS9EZXNrdG9wL2ltYWdlLW1vcnBoaW5nL3NyYy9qcy9JbWFnZS5qcyIsIi9Vc2Vycy95YW1hbW90b25vZG9rYS9EZXNrdG9wL2ltYWdlLW1vcnBoaW5nL3NyYy9qcy9JbWFnZXMuanMiLCIvVXNlcnMveWFtYW1vdG9ub2Rva2EvRGVza3RvcC9pbWFnZS1tb3JwaGluZy9zcmMvanMvTW9ycGhpbmdJbWFnZS5qcyIsIi9Vc2Vycy95YW1hbW90b25vZG9rYS9EZXNrdG9wL2ltYWdlLW1vcnBoaW5nL3NyYy9qcy9Nb3JwaGluZ1NsaWRlci5qcyIsIi9Vc2Vycy95YW1hbW90b25vZG9rYS9EZXNrdG9wL2ltYWdlLW1vcnBoaW5nL3NyYy9qcy9Qb2ludC5qcyIsIi9Vc2Vycy95YW1hbW90b25vZG9rYS9EZXNrdG9wL2ltYWdlLW1vcnBoaW5nL3NyYy9qcy9Qb2ludHMuanMiLCIvVXNlcnMveWFtYW1vdG9ub2Rva2EvRGVza3RvcC9pbWFnZS1tb3JwaGluZy9zcmMvanMvZWFzaW5nLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7OztxQkNBZ0IsVUFBVTs7OztBQUUxQixLQUFLLENBQUMsTUFBTSxDQUNSLDZDQUFXLEVBQ1gsUUFBUSxDQUFDLGNBQWMsQ0FBQyxlQUFlLENBQUMsQ0FDM0MsQ0FBQzs7Ozs7Ozs7Ozs7d0JDTDBCLGFBQWE7Ozs7Z0NBQ2QscUJBQXFC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QyxDQUFDLENBQUMsR0FBRyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBLElBQUssT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUEsQUFBQyxDQUFDO0FBQzlXLGFBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBLElBQUssT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUEsQUFBQyxDQUFDO0FBQzlXLGFBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBLElBQUssT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUEsQUFBQyxDQUFDO0FBQzlXLGFBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBLElBQUssT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUEsQUFBQyxDQUFDO0FBQzlXLGNBQUUsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBLElBQUssT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUEsQUFBQyxDQUFDO0FBQ3pjLGNBQUUsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBLElBQUssT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUEsQUFBQyxDQUFDOztBQUV6Yyxn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RSxxQkFBVSxDQUFDLEVBQUU7QUFBRSxlQUFPLENBQUMsR0FBQyxDQUFDLEdBQUMsQ0FBQyxHQUFDLENBQUMsQ0FBQTtLQUFFOztBQUU1QyxnQkFBWSxFQUFFLHNCQUFVLENBQUMsRUFBRTtBQUFFLGVBQU8sQ0FBQyxHQUFDLEFBQUMsRUFBRSxDQUFDLEdBQUUsQ0FBQyxHQUFDLENBQUMsR0FBQyxDQUFDLENBQUE7S0FBRTs7QUFFbkQsa0JBQWMsRUFBRSx3QkFBVSxDQUFDLEVBQUU7QUFBRSxlQUFPLENBQUMsR0FBQyxHQUFFLEdBQUcsQ0FBQyxHQUFDLENBQUMsR0FBQyxDQUFDLEdBQUMsQ0FBQyxHQUFDLENBQUMsR0FBRyxDQUFDLEdBQUMsQ0FBQyxHQUFFLEVBQUUsQ0FBQyxBQUFDLEdBQUMsQ0FBQyxHQUFDLENBQUMsR0FBQyxDQUFDLENBQUE7S0FBRTs7QUFFMUUsZUFBVyxFQUFFLHFCQUFVLENBQUMsRUFBRTtBQUFFLGVBQU8sQ0FBQyxHQUFDLENBQUMsR0FBQyxDQUFDLEdBQUMsQ0FBQyxHQUFDLENBQUMsQ0FBQTtLQUFFOztBQUU5QyxnQkFBWSxFQUFFLHNCQUFVLENBQUMsRUFBRTtBQUFFLGVBQU8sQ0FBQyxHQUFDLEFBQUMsRUFBRSxDQUFDLEdBQUUsQ0FBQyxHQUFDLENBQUMsR0FBQyxDQUFDLEdBQUMsQ0FBQyxDQUFBO0tBQUU7O0FBRXJELGtCQUFjLEVBQUUsd0JBQVUsQ0FBQyxFQUFFO0FBQUUsZUFBTyxDQUFDLEdBQUMsR0FBRSxHQUFHLEVBQUUsR0FBQyxDQUFDLEdBQUMsQ0FBQyxHQUFDLENBQUMsR0FBQyxDQUFDLEdBQUMsQ0FBQyxHQUFHLENBQUMsR0FBQyxFQUFFLEdBQUUsRUFBRSxDQUFDLEFBQUMsR0FBQyxDQUFDLEdBQUMsQ0FBQyxHQUFDLENBQUMsR0FBQyxDQUFDLENBQUE7S0FBRTtDQUNuRixDQUFDOztxQkFFYSxlQUFlIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsImltcG9ydCBBcHAgZnJvbSAnLi9BcHAuanMnO1xuXG5SZWFjdC5yZW5kZXIoXG4gICAgPEFwcD48L0FwcD4sXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2FwcC1jb250YWluZXInKVxuKTsiLCJpbXBvcnQgRWFzaW5nRnVuY3Rpb25zIGZyb20gJy4vZWFzaW5nLmpzJztcbmltcG9ydCBNb3JwaGluZ1NsaWRlciBmcm9tICcuL01vcnBoaW5nU2xpZGVyLmpzJztcbmltcG9ydCBNb3JwaGluZ0ltYWdlIGZyb20gJy4vTW9ycGhpbmdJbWFnZS5qcyc7XG5pbXBvcnQgRWRpdG9yIGZyb20gJy4vRWRpdG9yLmpzJztcblxudmFyIHN0YWdlLCBtcztcblxudmFyIEFwcCA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcbiAgICBnZXRJbml0aWFsU3RhdGU6IGZ1bmN0aW9uKCkge1xuICAgICAgICBpZihsb2NhbFN0b3JhZ2Uuc3RhdGUpe1xuICAgICAgICAgICAgcmV0dXJuIEpTT04ucGFyc2UobG9jYWxTdG9yYWdlLnN0YXRlKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgaW1hZ2VzOiBbXSxcbiAgICAgICAgICAgICAgICBtb3ZpbmdQb2ludDogLTEsXG4gICAgICAgICAgICAgICAgZWRpdGluZ0ltYWdlOiAtMSxcbiAgICAgICAgICAgICAgICBtb3ZpbmdQb2ludFJlY3Q6IG51bGwsXG4gICAgICAgICAgICAgICAgYmFzZUluZGV4OiAwIC8v5Z+65rqW55S75YOPXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9LFxuICAgIGNvbXBvbmVudERpZE1vdW50OiBmdW5jdGlvbigpIHtcbiAgICAgICAgc3RhZ2UgPSBuZXcgY3JlYXRlanMuU3RhZ2UoXCJteWNhbnZhc1wiKTtcbiAgICAgICAgbXMgPSBuZXcgTW9ycGhpbmdTbGlkZXIoc3RhZ2UpO1xuICAgIH0sXG4gICAgaGFuZGxlRmlsZVNlbGVjdDogZnVuY3Rpb24oZXZ0KSB7XG4gICAgICAgIGV2dC5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgZXZ0LnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICAgICAgY29uc29sZS5sb2coZXZ0KTtcbiAgICAgICAgdmFyIGZpbGVzID0gZXZ0LmRhdGFUcmFuc2Zlci5maWxlczsgLy8gRmlsZUxpc3Qgb2JqZWN0XG4gICAgICAgIGNvbnNvbGUubG9nKGZpbGVzKTtcblxuICAgICAgICAvLyBMb29wIHRocm91Z2ggdGhlIEZpbGVMaXN0IGFuZCByZW5kZXIgaW1hZ2UgZmlsZXMgYXMgdGh1bWJuYWlscy5cbiAgICAgICAgZm9yICh2YXIgaSA9IDAsIGZpbGU7IGZpbGUgPSBmaWxlc1tpXTsgaSsrKSB7XG5cbiAgICAgICAgICAgIC8vIE9ubHkgcHJvY2VzcyBpbWFnZSBmaWxlcy5cbiAgICAgICAgICAgIGlmICghZmlsZS50eXBlLm1hdGNoKCdpbWFnZS4qJykpIHtcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdmFyIHJlYWRlciA9IG5ldyBGaWxlUmVhZGVyKCk7XG5cbiAgICAgICAgICAgIC8vIENsb3N1cmUgdG8gY2FwdHVyZSB0aGUgZmlsZSBpbmZvcm1hdGlvbi5cbiAgICAgICAgICAgIHJlYWRlci5vbmxvYWQgPSAoZSkgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGUpO1xuICAgICAgICAgICAgICAgIHRoaXMuYWRkSW1hZ2UoZS50YXJnZXQucmVzdWx0KTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gUmVhZCBpbiB0aGUgaW1hZ2UgZmlsZSBhcyBhIGRhdGEgVVJMLlxuICAgICAgICAgICAgcmVhZGVyLnJlYWRBc0RhdGFVUkwoZmlsZSk7XG4gICAgICAgIH1cbiAgICB9LFxuICAgIGhhbmRsZURyYWdPdmVyOiBmdW5jdGlvbihldnQpIHtcbiAgICAgICAgZXZ0LnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICBldnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgZXZ0LmRhdGFUcmFuc2Zlci5kcm9wRWZmZWN0ID0gJ2NvcHknOyAvLyBFeHBsaWNpdGx5IHNob3cgdGhpcyBpcyBhIGNvcHkuXG4gICAgfSxcbiAgICBhZGRJbWFnZTogZnVuY3Rpb24oZGF0YVVSTCkge1xuICAgICAgICB2YXIgbmV3SW1hZ2UgPSB7XG4gICAgICAgICAgICBzcmM6IGRhdGFVUkwsXG4gICAgICAgICAgICBpbmRleDogdGhpcy5zdGF0ZS5pbWFnZXMubGVuZ3RoXG4gICAgICAgIH07XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe2ltYWdlczogdGhpcy5zdGF0ZS5pbWFnZXMuY29uY2F0KFtuZXdJbWFnZV0pfSwgKCkgPT4ge1xuICAgICAgICAgICAgdmFyIGltYWdlRE9NID0gUmVhY3QuZmluZERPTU5vZGUodGhpcy5yZWZzLmVkaXRvci5yZWZzLmltYWdlcy5yZWZzW1wiSW1hZ2VcIiArIG5ld0ltYWdlLmluZGV4XS5yZWZzLmltZyk7Ly9SZWFjdOOBq+OCiOOCiuODrOODs+ODgOODvOa4iOOBv+OBrkRPTVxuICAgICAgICAgICAgdmFyIHdpZHRoID0gaW1hZ2VET00ud2lkdGgsIGhlaWdodCA9IGltYWdlRE9NLmhlaWdodDtcbiAgICAgICAgICAgIHZhciBwb2ludHMsIGZhY2VzO1xuICAgICAgICAgICAgaWYobmV3SW1hZ2UuaW5kZXg+MCl7XG4gICAgICAgICAgICAgICAgcG9pbnRzID0gdGhpcy5zdGF0ZS5pbWFnZXNbdGhpcy5zdGF0ZS5iYXNlSW5kZXhdLnBvaW50cy5jb25jYXQoKTsgLy/ln7rmupbnlLvlg4/jga7nianjgpLjgrPjg5Tjg7xcbiAgICAgICAgICAgICAgICBmYWNlcyA9IHRoaXMuc3RhdGUuaW1hZ2VzW3RoaXMuc3RhdGUuYmFzZUluZGV4XS5mYWNlcy5jb25jYXQoKTsgLy/ln7rmupbnlLvlg4/jga7nianjgpLjgrPjg5Tjg7xcbiAgICAgICAgICAgIH0gZWxzZSB7Ly/liJ3mnJ/oqK3lrppcbiAgICAgICAgICAgICAgICBwb2ludHMgPSBbXG4gICAgICAgICAgICAgICAgICAgIHt4OjAsIHk6MH0sIHt4OndpZHRoLCB5OjB9LCB7eDp3aWR0aCwgeTpoZWlnaHR9LCB7eDowLCB5OmhlaWdodH0sIHt4OndpZHRoLzIsIHk6aGVpZ2h0LzJ9XG4gICAgICAgICAgICAgICAgXTtcbiAgICAgICAgICAgICAgICBmYWNlcyA9IFtbMCwgMSwgNF0sIFsxLCAyLCA0XSwgWzIsIDMsIDRdLCBbMywgNCwgMF1dO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdmFyIGltYWdlcyA9IHRoaXMuc3RhdGUuaW1hZ2VzLmNvbmNhdCgpO1xuICAgICAgICAgICAgaW1hZ2VzW25ld0ltYWdlLmluZGV4XS5wb2ludHMgPSBwb2ludHM7XG4gICAgICAgICAgICBpbWFnZXNbbmV3SW1hZ2UuaW5kZXhdLmZhY2VzID0gZmFjZXM7XG4gICAgICAgICAgICBpbWFnZXNbbmV3SW1hZ2UuaW5kZXhdLndpZHRoID0gd2lkdGg7XG4gICAgICAgICAgICBpbWFnZXNbbmV3SW1hZ2UuaW5kZXhdLmhlaWdodCA9IGhlaWdodDtcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe2ltYWdlczogaW1hZ2VzfSk7XG4gICAgICAgIH0pO1xuICAgIH0sXG4gICAgaGFuZGxlTW91c2VNb3ZlOiBmdW5jdGlvbihlKSB7XG4gICAgICAgIGlmKHRoaXMuc3RhdGUubW92aW5nUG9pbnQ+PTApe1xuICAgICAgICAgICAgdmFyIHJlY3QgPSB0aGlzLnN0YXRlLm1vdmluZ1BvaW50UmVjdCxcbiAgICAgICAgICAgICAgICB4ID0gZS5jbGllbnRYIC0gcmVjdC5sZWZ0LFxuICAgICAgICAgICAgICAgIHkgPSBlLmNsaWVudFkgLSByZWN0LnRvcDtcblxuICAgICAgICAgICAgLy/jga/jgb/lh7rjgarjgYTjgojjgYbjgatcbiAgICAgICAgICAgIHggPSB4IDwgMCA/IDAgOiB4O1xuICAgICAgICAgICAgeCA9IHggPiByZWN0LndpZHRoID8gcmVjdC53aWR0aCA6IHg7XG4gICAgICAgICAgICB5ID0geSA8IDAgPyAwIDogeTtcbiAgICAgICAgICAgIHkgPSB5ID4gcmVjdC5oZWlnaHQgPyByZWN0LmhlaWdodCA6IHk7XG5cbiAgICAgICAgICAgIHRoaXMubW92ZVBvaW50KHt4OiB4LCB5OiB5fSk7XG4gICAgICAgIH1cbiAgICB9LFxuICAgIGhhbmRsZU1vdXNlVXA6IGZ1bmN0aW9uKCkge1xuICAgICAgICBpZih0aGlzLnN0YXRlLmVkaXRpbmdJbWFnZT4tMSkge1xuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7ZWRpdGluZ0ltYWdlOiAtMSwgbW92aW5nUG9pbnQ6IC0xfSk7XG4gICAgICAgIH1cbiAgICB9LFxuICAgIG1vdmVQb2ludDogZnVuY3Rpb24ocG9pbnQpIHtcbiAgICAgICAgdmFyIGltYWdlcyA9IHRoaXMuc3RhdGUuaW1hZ2VzLmNvbmNhdCgpO1xuICAgICAgICBpbWFnZXNbdGhpcy5zdGF0ZS5lZGl0aW5nSW1hZ2VdLnBvaW50c1t0aGlzLnN0YXRlLm1vdmluZ1BvaW50XSA9IHBvaW50O1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtpbWFnZXM6IGltYWdlc30pO1xuICAgIH0sXG4gICAgc3RhcnRNb3ZpbmdQb2ludDogZnVuY3Rpb24oZWRpdGluZ0ltYWdlLCBtb3ZpbmdQb2ludCwgbW92aW5nUG9pbnRSZWN0KSB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe2VkaXRpbmdJbWFnZTogZWRpdGluZ0ltYWdlLCBtb3ZpbmdQb2ludDogbW92aW5nUG9pbnQsIG1vdmluZ1BvaW50UmVjdDogbW92aW5nUG9pbnRSZWN0fSk7XG4gICAgfSxcbiAgICBhZGRQb2ludDogZnVuY3Rpb24oaW5kZXgsIHBvaW50KXtcbiAgICAgICAgaWYoaW5kZXg9PT10aGlzLnN0YXRlLmJhc2VJbmRleCkgey8v5Z+65rqW55S75YOP44Gq44KJUG9pbnTov73liqBcbiAgICAgICAgICAgIHZhciBpbWFnZXMgPSB0aGlzLnN0YXRlLmltYWdlcy5jb25jYXQoKTtcbiAgICAgICAgICAgIHZhciBiYXNlSW1hZ2UgPSBpbWFnZXNbdGhpcy5zdGF0ZS5iYXNlSW5kZXhdO1xuICAgICAgICAgICAgYmFzZUltYWdlLnBvaW50cy5wdXNoKHBvaW50KTtcbiAgICAgICAgICAgIGJhc2VJbWFnZS5mYWNlcyA9IHRoaXMuY3JlYXRlRmFjZXMoYmFzZUltYWdlLnBvaW50cyk7Ly9mYWNlc+OCkuS9nOOCiuebtOOBmVxuICAgICAgICAgICAgaW1hZ2VzLmZvckVhY2goKGltYWdlLCBpbmRleCkgPT4gey8v5LuW44GuaW1hZ2XjgavjgoJwb2ludOOBqGZhY2XjgpLov73liqBcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5zdGF0ZS5iYXNlSW5kZXggIT09IGluZGV4KSB7XG4gICAgICAgICAgICAgICAgICAgIGltYWdlc1tpbmRleF0ucG9pbnRzLnB1c2goe3g6IHBvaW50LngsIHk6IHBvaW50Lnl9KTtcbiAgICAgICAgICAgICAgICAgICAgaW1hZ2VzW2luZGV4XS5mYWNlcyA9IGJhc2VJbWFnZS5mYWNlcztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe2ltYWdlczogaW1hZ2VzfSk7XG4gICAgICAgIH1cbiAgICB9LFxuICAgIHJlbW92ZVBvaW50OiBmdW5jdGlvbihpbWFnZUluZGV4LCBwb2ludEluZGV4KSB7Ly9Qb2ludOOBruWJiumZpFxuICAgICAgICBpZihpbWFnZUluZGV4ID09PSB0aGlzLnN0YXRlLmJhc2VJbmRleCkgey8v5Z+65rqW55S75YOP44Gq44KJ5YmK6ZmkXG4gICAgICAgICAgICB2YXIgaW1hZ2VzID0gdGhpcy5zdGF0ZS5pbWFnZXMuY29uY2F0KCk7XG4gICAgICAgICAgICB2YXIgYmFzZUltYWdlID0gaW1hZ2VzW3RoaXMuc3RhdGUuYmFzZUluZGV4XTtcbiAgICAgICAgICAgIGJhc2VJbWFnZS5wb2ludHMuc3BsaWNlKHBvaW50SW5kZXgsIDEpO1xuICAgICAgICAgICAgYmFzZUltYWdlLmZhY2VzID0gdGhpcy5jcmVhdGVGYWNlcyhiYXNlSW1hZ2UucG9pbnRzKTsvL2ZhY2Vz44KS5L2c44KK55u044GZXG4gICAgICAgICAgICBpbWFnZXMuZm9yRWFjaCgoaW1hZ2UsIGluZGV4KSA9PiB7Ly/ku5bjga5pbWFnZeOBrnBvaW5044KS5YmK6Zmk44CBZmFjZeOCkuabtOaWsFxuICAgICAgICAgICAgICAgIGlmICh0aGlzLnN0YXRlLmJhc2VJbmRleCAhPT0gaW5kZXgpIHtcbiAgICAgICAgICAgICAgICAgICAgaW1hZ2VzW2luZGV4XS5wb2ludHMuc3BsaWNlKHBvaW50SW5kZXgsIDEpO1xuICAgICAgICAgICAgICAgICAgICBpbWFnZXNbaW5kZXhdLmZhY2VzID0gYmFzZUltYWdlLmZhY2VzO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7aW1hZ2VzOiBpbWFnZXN9KTtcbiAgICAgICAgfVxuICAgIH0sXG4gICAgcmVtb3ZlSW1hZ2U6IGZ1bmN0aW9uKGluZGV4KSB7XG4gICAgICAgIHZhciBpbWFnZXMgPSB0aGlzLnN0YXRlLmltYWdlcy5jb25jYXQoKTtcbiAgICAgICAgaW1hZ2VzLnNwbGljZShpbmRleCwgMSk7XG5cbiAgICAgICAgLy8qKioqKuWfuua6lueUu+WDj+OCkuWJiumZpOOBl+OBn+WgtOWQiOOBruWHpueQhuOBjOW/heimgSoqKioqXG5cbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7aW1hZ2VzOiBpbWFnZXN9KTtcbiAgICB9LFxuICAgIGNoYW5nZVRyYW5zZm9ybUVhc2luZzogZnVuY3Rpb24oKXtcbiAgICAgICAgdmFyIHNlbGVjdCA9IFJlYWN0LmZpbmRET01Ob2RlKHRoaXMucmVmcy50cmFuc2Zvcm1FYXNpbmdTZWxlY3QpO1xuICAgICAgICBtcy50cmFuc2Zvcm1FYXNpbmcgPSBzZWxlY3Qub3B0aW9uc1tzZWxlY3Quc2VsZWN0ZWRJbmRleF0udmFsdWU7XG4gICAgfSxcbiAgICBjaGFuZ2VBbHBoYUVhc2luZzogZnVuY3Rpb24oKXtcbiAgICAgICAgdmFyIHNlbGVjdCA9IFJlYWN0LmZpbmRET01Ob2RlKHRoaXMucmVmcy5hbHBoYUVhc2luZ1NlbGVjdCk7XG4gICAgICAgIG1zLmFscGhhRWFzaW5nID0gc2VsZWN0Lm9wdGlvbnNbc2VsZWN0LnNlbGVjdGVkSW5kZXhdLnZhbHVlO1xuICAgIH0sXG4gICAgY2hhbmdlRHVsYXRpb246IGZ1bmN0aW9uKCl7XG4gICAgICAgIHZhciBpbnB1dCA9IFJlYWN0LmZpbmRET01Ob2RlKHRoaXMucmVmcy5kdWxhdGlvbklucHV0KTtcbiAgICAgICAgbXMuZHVsYXRpb24gPSBpbnB1dC52YWx1ZTtcbiAgICB9LFxuICAgIHBsYXk6IGZ1bmN0aW9uKCl7XG4gICAgICAgIGlmKCFtcy5pc0FuaW1hdGluZykge1xuICAgICAgICAgICAgbXMuY2xlYXIoKTtcbiAgICAgICAgICAgIHRoaXMuc3RhdGUuaW1hZ2VzLmZvckVhY2goKGltYWdlLCBpbmRleCkgPT4ge1xuICAgICAgICAgICAgICAgIHZhciBpbWFnZURPTSA9IFJlYWN0LmZpbmRET01Ob2RlKHRoaXMucmVmcy5lZGl0b3IucmVmcy5pbWFnZXMucmVmc1tcIkltYWdlXCIgKyBpbmRleF0ucmVmcy5pbWcpOy8vUmVhY3Tjgavjgojjgorjg6zjg7Pjg4Djg7zmuIjjgb/jga5ET01cbiAgICAgICAgICAgICAgICB2YXIgbWkgPSBuZXcgTW9ycGhpbmdJbWFnZShpbWFnZURPTSwgaW1hZ2UucG9pbnRzLCBpbWFnZS5mYWNlcyk7XG4gICAgICAgICAgICAgICAgbXMuYWRkSW1hZ2UobWkpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAgICAgbXMucGxheSgpO1xuICAgICAgICAgICAgfSwgMTAwMCk7XG4gICAgICAgIH1cbiAgICB9LFxuICAgIGNyZWF0ZUZhY2VzOiBmdW5jdGlvbihwb2ludHMpIHtcbiAgICAgICAgLy/jg5zjg63jg47jgqTlpInmj5vplqLmlbBcbiAgICAgICAgdmFyIHZvcm9ub2kgPSBkMy5nZW9tLnZvcm9ub2koKVxuICAgICAgICAgICAgLngoZnVuY3Rpb24gKGQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZC54XG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgLnkoZnVuY3Rpb24gKGQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZC55XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAvL+ODieODreODjeODvOW6p+aomeODh+ODvOOCv+WPluW+l1xuICAgICAgICB2YXIgZmFjZXMgPSB2b3Jvbm9pLnRyaWFuZ2xlcyhwb2ludHMpO1xuICAgICAgICBmYWNlcy5mb3JFYWNoKGZ1bmN0aW9uKGZhY2UsIGluZGV4KXtcbiAgICAgICAgICAgIGZhY2VzW2luZGV4XSA9IFtcbiAgICAgICAgICAgICAgICBwb2ludHMuaW5kZXhPZihmYWNlc1tpbmRleF1bMF0pLFxuICAgICAgICAgICAgICAgIHBvaW50cy5pbmRleE9mKGZhY2VzW2luZGV4XVsxXSksXG4gICAgICAgICAgICAgICAgcG9pbnRzLmluZGV4T2YoZmFjZXNbaW5kZXhdWzJdKVxuICAgICAgICAgICAgXTtcbiAgICAgICAgfSlcblxuICAgICAgICByZXR1cm4gZmFjZXM7XG4gICAgfSxcbiAgICBzYXZlOiBmdW5jdGlvbigpIHsvL+OBsuOBqOOBvuOBmmxvY2FsU3RyYWdl44Gr5L+d5a2YXG4gICAgICAgIGxvY2FsU3RvcmFnZS5zdGF0ZSA9IEpTT04uc3RyaW5naWZ5KHRoaXMuc3RhdGUpO1xuICAgIH0sXG4gICAgcmVuZGVyOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGVhc2luZ3MgPSBPYmplY3Qua2V5cyhFYXNpbmdGdW5jdGlvbnMpLm1hcChmdW5jdGlvbihuYW1lKXtcbiAgICAgICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICAgICAgPG9wdGlvbiB2YWx1ZT17bmFtZX0+e25hbWV9PC9vcHRpb24+XG4gICAgICAgICAgICApO1xuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIDxkaXYgaWQ9XCJhcHBcIiBvbk1vdXNlTW92ZT17dGhpcy5oYW5kbGVNb3VzZU1vdmV9IG9uTW91c2VVcD17dGhpcy5oYW5kbGVNb3VzZVVwfSBvbkRyb3A9e3RoaXMuaGFuZGxlRmlsZVNlbGVjdH0gb25EcmFnT3Zlcj17dGhpcy5oYW5kbGVEcmFnT3Zlcn0+XG4gICAgICAgICAgICAgICAgPEVkaXRvciBpbWFnZXM9e3RoaXMuc3RhdGUuaW1hZ2VzfSBtb3ZpbmdQb2ludD17dGhpcy5zdGF0ZS5tb3ZpbmdQb2ludH0gYWRkSW1hZ2U9e3RoaXMuYWRkSW1hZ2V9IHJlZj1cImVkaXRvclwiIHN0YXJ0TW92aW5nUG9pbnQ9e3RoaXMuc3RhcnRNb3ZpbmdQb2ludH0gYWRkUG9pbnQ9e3RoaXMuYWRkUG9pbnR9IHJlbW92ZVBvaW50PXt0aGlzLnJlbW92ZVBvaW50fSByZW1vdmVJbWFnZT17dGhpcy5yZW1vdmVJbWFnZX0+PC9FZGl0b3I+XG4gICAgICAgICAgICAgICAgPGJ1dHRvbiBpZD1cInBsYXktYnV0dG9uXCIgb25DbGljaz17dGhpcy5wbGF5fT5QbGF5PC9idXR0b24+XG4gICAgICAgICAgICAgICAgPGNhbnZhcyBpZD1cIm15Y2FudmFzXCIgd2lkdGg9XCI1MDBcIiBoZWlnaHQ9XCI1MDBcIj48L2NhbnZhcz5cbiAgICAgICAgICAgICAgICA8bGFiZWw+VHJhbnNmb3JtIEVhc2luZzogPHNlbGVjdCByZWY9XCJ0cmFuc2Zvcm1FYXNpbmdTZWxlY3RcIiBpZD1cInRyYW5zZm9ybS1lYXNpbmctc2VsZWN0XCIgb25DaGFuZ2U9e3RoaXMuY2hhbmdlVHJhbnNmb3JtRWFzaW5nfT57ZWFzaW5nc308L3NlbGVjdD48L2xhYmVsPlxuICAgICAgICAgICAgICAgIDxsYWJlbD5BbHBoYSBFYXNpbmc6IDxzZWxlY3QgcmVmPVwiYWxwaGFFYXNpbmdTZWxlY3RcIiBpZD1cImFscGhhLWVhc2luZy1zZWxlY3RcIiBvbkNoYW5nZT17dGhpcy5jaGFuZ2VBbHBoYUVhc2luZ30+e2Vhc2luZ3N9PC9zZWxlY3Q+PC9sYWJlbD5cbiAgICAgICAgICAgICAgICA8bGFiZWw+RHVsYXRpb246IDxpbnB1dCByZWY9XCJkdWxhdGlvbklucHV0XCIgdHlwZT1cIm51bWJlclwiIGlkPVwiZHVsYXRpb24taW5wdXRcIiBvbkNoYW5nZT17dGhpcy5jaGFuZ2VEdWxhdGlvbn0+PC9pbnB1dD48L2xhYmVsPlxuICAgICAgICAgICAgICAgIDxidXR0b24gaWQ9XCJzYXZlLWJ1dHRvblwiIG9uQ2xpY2s9e3RoaXMuc2F2ZX0+U2F2ZTwvYnV0dG9uPlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICk7XG4gICAgfVxufSk7XG5cbmV4cG9ydCBkZWZhdWx0IEFwcDsiLCJpbXBvcnQgSW1hZ2VzIGZyb20gJy4vSW1hZ2VzLmpzJztcblxudmFyIEVkaXRvciA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcbiAgICByZW5kZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgPGRpdiBpZD1cImVkaXRvclwiPlxuICAgICAgICAgICAgICAgIDxJbWFnZXMgaW1hZ2VzPXt0aGlzLnByb3BzLmltYWdlc30gbW92aW5nUG9pbnQ9e3RoaXMucHJvcHMubW92aW5nUG9pbnR9IHJlZj1cImltYWdlc1wiIHN0YXJ0TW92aW5nUG9pbnQ9e3RoaXMucHJvcHMuc3RhcnRNb3ZpbmdQb2ludH0gYWRkUG9pbnQ9e3RoaXMucHJvcHMuYWRkUG9pbnR9IHJlbW92ZVBvaW50PXt0aGlzLnByb3BzLnJlbW92ZVBvaW50fSByZW1vdmVJbWFnZT17dGhpcy5wcm9wcy5yZW1vdmVJbWFnZX0+PC9JbWFnZXM+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgKVxuICAgIH1cbn0pO1xuXG5leHBvcnQgZGVmYXVsdCBFZGl0b3I7IiwiaW1wb3J0IFBvaW50cyBmcm9tICcuL1BvaW50cy5qcyc7XG5cbkltYWdlID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuICAgIHJlbW92ZUltYWdlOiBmdW5jdGlvbigpIHsvL2luZGV444KSQXBw44Gr6YCB44Gj44Gm5YmK6ZmkXG4gICAgICAgIHRoaXMucHJvcHMucmVtb3ZlSW1hZ2UodGhpcy5wcm9wcy5pbmRleCk7XG4gICAgfSxcbiAgICBnZXRKU09OU3RyaW5nOiBmdW5jdGlvbigpIHsvL1BvaW50c+OBqEZhY2Vz44KS6KGo56S6XG4gICAgICAgIHJldHVybiBKU09OLnN0cmluZ2lmeSh7XG4gICAgICAgICAgICBwb2ludHM6IHRoaXMucHJvcHMuaW1hZ2UucG9pbnRzLFxuICAgICAgICAgICAgZmFjZXM6IHRoaXMucHJvcHMuaW1hZ2UuZmFjZXNcbiAgICAgICAgfSk7XG4gICAgfSxcbiAgICByZW5kZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJlZGl0b3ItaW1hZ2UtY29udGFpbmVyXCI+XG4gICAgICAgICAgICAgICAgPFBvaW50cyBpbmRleD17dGhpcy5wcm9wcy5pbmRleH0gbW92aW5nUG9pbnQ9e3RoaXMucHJvcHMubW92aW5nUG9pbnR9IHdpZHRoPXt0aGlzLnByb3BzLmltYWdlLndpZHRofSBoZWlnaHQ9e3RoaXMucHJvcHMuaW1hZ2UuaGVpZ2h0fSBwb2ludHM9e3RoaXMucHJvcHMuaW1hZ2UucG9pbnRzID8gdGhpcy5wcm9wcy5pbWFnZS5wb2ludHMgOiBbXX0gc3RhcnRNb3ZpbmdQb2ludD17dGhpcy5wcm9wcy5zdGFydE1vdmluZ1BvaW50fSBhZGRQb2ludD17dGhpcy5wcm9wcy5hZGRQb2ludH0gcmVtb3ZlUG9pbnQ9e3RoaXMucHJvcHMucmVtb3ZlUG9pbnR9PjwvUG9pbnRzPlxuICAgICAgICAgICAgICAgIDxpbWcgc3JjPXt0aGlzLnByb3BzLmltYWdlLnNyY30gcmVmPVwiaW1nXCI+PC9pbWc+XG4gICAgICAgICAgICAgICAgPGJ1dHRvbiBjbGFzc05hbWU9XCJlZGl0b3ItaW1hZ2UtcmVtb3ZlLWJ1dHRvblwiIG9uQ2xpY2s9e3RoaXMucmVtb3ZlSW1hZ2V9PsOXPC9idXR0b24+XG4gICAgICAgICAgICAgICAgPHRleHRhcmVhIHZhbHVlPXt0aGlzLmdldEpTT05TdHJpbmcoKX0gcmVhZE9ubHk+PC90ZXh0YXJlYT5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICApO1xuICAgIH1cbn0pO1xuXG5leHBvcnQgZGVmYXVsdCBJbWFnZTsiLCJpbXBvcnQgSW1hZ2UgZnJvbSAnLi9JbWFnZS5qcyc7XG5cbnZhciBJbWFnZXMgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG4gICAgcmVuZGVyOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGltYWdlcyA9IHRoaXMucHJvcHMuaW1hZ2VzLm1hcCgoaW1hZ2UsIGluZGV4KSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgICAgIDxJbWFnZSByZWY9e1wiSW1hZ2VcIitpbmRleH0ga2V5PXtcImltYWdlLWNvbnRhaW5lci1cIiArIGluZGV4fSBpbmRleD17aW5kZXh9IGltYWdlPXtpbWFnZX0gbW92aW5nUG9pbnQ9e3RoaXMucHJvcHMubW92aW5nUG9pbnR9IHN0YXJ0TW92aW5nUG9pbnQ9e3RoaXMucHJvcHMuc3RhcnRNb3ZpbmdQb2ludH0gYWRkUG9pbnQ9e3RoaXMucHJvcHMuYWRkUG9pbnR9IHJlbW92ZVBvaW50PXt0aGlzLnByb3BzLnJlbW92ZVBvaW50fSByZW1vdmVJbWFnZT17dGhpcy5wcm9wcy5yZW1vdmVJbWFnZX0+PC9JbWFnZT5cbiAgICAgICAgICAgICk7XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgPGRpdiBpZD1cImVkaXRvci1pbWFnZXNcIj5cbiAgICAgICAgICAgICAgICB7aW1hZ2VzfVxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICk7XG4gICAgfVxufSk7XG5cbmV4cG9ydCBkZWZhdWx0IEltYWdlczsiLCJjbGFzcyBNb3JwaGluZ0ltYWdlIHtcbiAgICBjb25zdHJ1Y3RvcihpbWFnZSwgcG9pbnRzLCBmYWNlcykge1xuICAgICAgICB0aGlzLmRvbUVsZW1lbnQgPSBpbWFnZTtcblxuICAgICAgICB0aGlzLm9yaWdpbmFsUG9pbnRzID0gcG9pbnRzO1xuICAgICAgICB0aGlzLnBvaW50cyA9IFtdOyAvL+aPj+eUu+OBmeOCi+mam+OBruWLleeahOOBquW6p+aomVxuICAgICAgICB0aGlzLl9jbG9uZVBvaW50cygpO1xuXG4gICAgICAgIHRoaXMuZmFjZXMgPSBmYWNlcztcblxuICAgICAgICB0aGlzLmJpdG1hcHMgPSBbXTtcbiAgICAgICAgdGhpcy5fYWRkQml0bWFwcygpO1xuXG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbiAgICBfY2xvbmVQb2ludHMoKSB7XG4gICAgICAgIHRoaXMub3JpZ2luYWxQb2ludHMuZm9yRWFjaCgocG9pbnQsIGluZGV4KSA9PiB7IC8v5a++5b+c44GZ44KL5bqn5qiZ44KS5L+d5oyB44GZ44KLXG4gICAgICAgICAgICB0aGlzLnBvaW50c1tpbmRleF0gPSB7eDogcG9pbnQueCwgeTogcG9pbnQueX07XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBfYWRkQml0bWFwcygpIHtcbiAgICAgICAgdGhpcy5mYWNlcy5mb3JFYWNoKChmYWNlKSA9PiB7XG4gICAgICAgICAgICB2YXIgYm1wID0gbmV3IGNyZWF0ZWpzLkJpdG1hcCh0aGlzLmRvbUVsZW1lbnQpO1xuICAgICAgICAgICAgdmFyIHNoYXBlID0gbmV3IGNyZWF0ZWpzLlNoYXBlKCk7XG4gICAgICAgICAgICBzaGFwZS5ncmFwaGljcy5tb3ZlVG8odGhpcy5wb2ludHNbZmFjZVswXV0ueCwgdGhpcy5wb2ludHNbZmFjZVswXV0ueSlcbiAgICAgICAgICAgICAgICAubGluZVRvKHRoaXMucG9pbnRzW2ZhY2VbMV1dLngsIHRoaXMucG9pbnRzW2ZhY2VbMV1dLnkpXG4gICAgICAgICAgICAgICAgLmxpbmVUbyh0aGlzLnBvaW50c1tmYWNlWzJdXS54LCB0aGlzLnBvaW50c1tmYWNlWzJdXS55KTtcbiAgICAgICAgICAgIGJtcC5tYXNrID0gc2hhcGU7XG4gICAgICAgICAgICB0aGlzLmJpdG1hcHMucHVzaChibXApO1xuICAgICAgICB9KTtcbiAgICB9XG4gICAgc2V0QWxwaGEoYSkge1xuICAgICAgICB0aGlzLmJpdG1hcHMuZm9yRWFjaCgoYm1wLCBpbmRleCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5iaXRtYXBzW2luZGV4XS5hbHBoYSA9IGE7XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICB1cGRhdGUoKSB7XG4gICAgICAgIC8v44Ki44OV44Kj44Oz5aSJ5o+b6KGM5YiX44KS5rGC44KB44CB44OR44O844OE44KS5o+P55S7XG4gICAgICAgIHRoaXMuZmFjZXMuZm9yRWFjaCgoZmFjZSwgaW5kZXgpID0+IHtcbiAgICAgICAgICAgIHZhciBwb2ludHMxID0gW3RoaXMub3JpZ2luYWxQb2ludHNbZmFjZVswXV0sIHRoaXMub3JpZ2luYWxQb2ludHNbZmFjZVsxXV0sIHRoaXMub3JpZ2luYWxQb2ludHNbZmFjZVsyXV1dO1xuICAgICAgICAgICAgdmFyIHBvaW50czIgPSBbdGhpcy5wb2ludHNbZmFjZVswXV0sIHRoaXMucG9pbnRzW2ZhY2VbMV1dLCB0aGlzLnBvaW50c1tmYWNlWzJdXV07XG4gICAgICAgICAgICB2YXIgbWF0cml4ID0gdGhpcy5fZ2V0QWZmaW5lVHJhbnNmb3JtKHBvaW50czEsIHBvaW50czIpO1xuICAgICAgICAgICAgdGhpcy5iaXRtYXBzW2luZGV4XS50cmFuc2Zvcm1NYXRyaXggPSB0aGlzLmJpdG1hcHNbaW5kZXhdLm1hc2sudHJhbnNmb3JtTWF0cml4ID0gbWF0cml4O1xuICAgICAgICB9KTtcbiAgICB9XG4gICAgX2dldEFmZmluZVRyYW5zZm9ybShwb2ludHMxLCBwb2ludHMyKXtcbiAgICAgICAgdmFyIGEsIGIsIGMsIGQsIHR4LCB0eTtcblxuICAgICAgICAvLyDpgKPnq4vmlrnnqIvlvI/jgpLop6PjgY9cbiAgICAgICAgYSA9IChwb2ludHMyWzBdLnggKiBwb2ludHMxWzFdLnkgKyBwb2ludHMyWzFdLnggKiBwb2ludHMxWzJdLnkgKyBwb2ludHMyWzJdLnggKiBwb2ludHMxWzBdLnkgLSBwb2ludHMyWzBdLnggKiBwb2ludHMxWzJdLnkgLSBwb2ludHMyWzFdLnggKiBwb2ludHMxWzBdLnkgLSBwb2ludHMyWzJdLnggKiBwb2ludHMxWzFdLnkpIC8gKHBvaW50czFbMF0ueCAqIHBvaW50czFbMV0ueSArIHBvaW50czFbMV0ueCAqIHBvaW50czFbMl0ueSArIHBvaW50czFbMl0ueCAqIHBvaW50czFbMF0ueSAtIHBvaW50czFbMF0ueCAqIHBvaW50czFbMl0ueSAtIHBvaW50czFbMV0ueCAqIHBvaW50czFbMF0ueSAtIHBvaW50czFbMl0ueCAqIHBvaW50czFbMV0ueSk7XG4gICAgICAgIGIgPSAocG9pbnRzMlswXS55ICogcG9pbnRzMVsxXS55ICsgcG9pbnRzMlsxXS55ICogcG9pbnRzMVsyXS55ICsgcG9pbnRzMlsyXS55ICogcG9pbnRzMVswXS55IC0gcG9pbnRzMlswXS55ICogcG9pbnRzMVsyXS55IC0gcG9pbnRzMlsxXS55ICogcG9pbnRzMVswXS55IC0gcG9pbnRzMlsyXS55ICogcG9pbnRzMVsxXS55KSAvIChwb2ludHMxWzBdLnggKiBwb2ludHMxWzFdLnkgKyBwb2ludHMxWzFdLnggKiBwb2ludHMxWzJdLnkgKyBwb2ludHMxWzJdLnggKiBwb2ludHMxWzBdLnkgLSBwb2ludHMxWzBdLnggKiBwb2ludHMxWzJdLnkgLSBwb2ludHMxWzFdLnggKiBwb2ludHMxWzBdLnkgLSBwb2ludHMxWzJdLnggKiBwb2ludHMxWzFdLnkpO1xuICAgICAgICBjID0gKHBvaW50czFbMF0ueCAqIHBvaW50czJbMV0ueCArIHBvaW50czFbMV0ueCAqIHBvaW50czJbMl0ueCArIHBvaW50czFbMl0ueCAqIHBvaW50czJbMF0ueCAtIHBvaW50czFbMF0ueCAqIHBvaW50czJbMl0ueCAtIHBvaW50czFbMV0ueCAqIHBvaW50czJbMF0ueCAtIHBvaW50czFbMl0ueCAqIHBvaW50czJbMV0ueCkgLyAocG9pbnRzMVswXS54ICogcG9pbnRzMVsxXS55ICsgcG9pbnRzMVsxXS54ICogcG9pbnRzMVsyXS55ICsgcG9pbnRzMVsyXS54ICogcG9pbnRzMVswXS55IC0gcG9pbnRzMVswXS54ICogcG9pbnRzMVsyXS55IC0gcG9pbnRzMVsxXS54ICogcG9pbnRzMVswXS55IC0gcG9pbnRzMVsyXS54ICogcG9pbnRzMVsxXS55KTtcbiAgICAgICAgZCA9IChwb2ludHMxWzBdLnggKiBwb2ludHMyWzFdLnkgKyBwb2ludHMxWzFdLnggKiBwb2ludHMyWzJdLnkgKyBwb2ludHMxWzJdLnggKiBwb2ludHMyWzBdLnkgLSBwb2ludHMxWzBdLnggKiBwb2ludHMyWzJdLnkgLSBwb2ludHMxWzFdLnggKiBwb2ludHMyWzBdLnkgLSBwb2ludHMxWzJdLnggKiBwb2ludHMyWzFdLnkpIC8gKHBvaW50czFbMF0ueCAqIHBvaW50czFbMV0ueSArIHBvaW50czFbMV0ueCAqIHBvaW50czFbMl0ueSArIHBvaW50czFbMl0ueCAqIHBvaW50czFbMF0ueSAtIHBvaW50czFbMF0ueCAqIHBvaW50czFbMl0ueSAtIHBvaW50czFbMV0ueCAqIHBvaW50czFbMF0ueSAtIHBvaW50czFbMl0ueCAqIHBvaW50czFbMV0ueSk7XG4gICAgICAgIHR4ID0gKHBvaW50czFbMF0ueCAqIHBvaW50czFbMV0ueSAqIHBvaW50czJbMl0ueCArIHBvaW50czFbMV0ueCAqIHBvaW50czFbMl0ueSAqIHBvaW50czJbMF0ueCArIHBvaW50czFbMl0ueCAqIHBvaW50czFbMF0ueSAqIHBvaW50czJbMV0ueCAtIHBvaW50czFbMF0ueCAqIHBvaW50czFbMl0ueSAqIHBvaW50czJbMV0ueCAtIHBvaW50czFbMV0ueCAqIHBvaW50czFbMF0ueSAqIHBvaW50czJbMl0ueCAtIHBvaW50czFbMl0ueCAqIHBvaW50czFbMV0ueSAqIHBvaW50czJbMF0ueCkgLyAocG9pbnRzMVswXS54ICogcG9pbnRzMVsxXS55ICsgcG9pbnRzMVsxXS54ICogcG9pbnRzMVsyXS55ICsgcG9pbnRzMVsyXS54ICogcG9pbnRzMVswXS55IC0gcG9pbnRzMVswXS54ICogcG9pbnRzMVsyXS55IC0gcG9pbnRzMVsxXS54ICogcG9pbnRzMVswXS55IC0gcG9pbnRzMVsyXS54ICogcG9pbnRzMVsxXS55KTtcbiAgICAgICAgdHkgPSAocG9pbnRzMVswXS54ICogcG9pbnRzMVsxXS55ICogcG9pbnRzMlsyXS55ICsgcG9pbnRzMVsxXS54ICogcG9pbnRzMVsyXS55ICogcG9pbnRzMlswXS55ICsgcG9pbnRzMVsyXS54ICogcG9pbnRzMVswXS55ICogcG9pbnRzMlsxXS55IC0gcG9pbnRzMVswXS54ICogcG9pbnRzMVsyXS55ICogcG9pbnRzMlsxXS55IC0gcG9pbnRzMVsxXS54ICogcG9pbnRzMVswXS55ICogcG9pbnRzMlsyXS55IC0gcG9pbnRzMVsyXS54ICogcG9pbnRzMVsxXS55ICogcG9pbnRzMlswXS55KSAvIChwb2ludHMxWzBdLnggKiBwb2ludHMxWzFdLnkgKyBwb2ludHMxWzFdLnggKiBwb2ludHMxWzJdLnkgKyBwb2ludHMxWzJdLnggKiBwb2ludHMxWzBdLnkgLSBwb2ludHMxWzBdLnggKiBwb2ludHMxWzJdLnkgLSBwb2ludHMxWzFdLnggKiBwb2ludHMxWzBdLnkgLSBwb2ludHMxWzJdLnggKiBwb2ludHMxWzFdLnkpO1xuXG4gICAgICAgIHZhciBtYXRyaXggPSBuZXcgY3JlYXRlanMuTWF0cml4MkQoYSwgYiwgYywgZCwgdHgsIHR5KTtcbiAgICAgICAgcmV0dXJuIG1hdHJpeDtcbiAgICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IE1vcnBoaW5nSW1hZ2U7IiwiaW1wb3J0IEVhc2luZ0Z1bmN0aW9ucyBmcm9tIFwiLi9lYXNpbmcuanNcIjtcblxuY2xhc3MgTW9ycGhpbmdTbGlkZXIge1xuICAgIGNvbnN0cnVjdG9yKHN0YWdlKSB7XG4gICAgICAgIHRoaXMuaW1hZ2VzID0gW107XG4gICAgICAgIHRoaXMuc3RhZ2UgPSBzdGFnZTtcbiAgICAgICAgdGhpcy50cmFuc2Zvcm1FYXNpbmcgPSB0aGlzLmFscGhhRWFzaW5nID0gXCJsaW5lYXJcIjtcbiAgICAgICAgdGhpcy5kdWxhdGlvbiA9IDIwMDtcbiAgICAgICAgdGhpcy5pc0FuaW1hdGluZyA9IGZhbHNlO1xuICAgICAgICB0aGlzLmluZGV4ID0gMDsvL+ihqOekuuOBl+OBpuOBhOOCi+eUu+WDj+OBrmluZGV4XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbiAgICBhZGRJbWFnZShtb3JwaGluZ0ltYWdlKSB7XG4gICAgICAgIG1vcnBoaW5nSW1hZ2UuYml0bWFwcy5mb3JFYWNoKChibXAsIGluZGV4KSA9PiB7XG4gICAgICAgICAgICBpZih0aGlzLmltYWdlcy5sZW5ndGg+MCl7Ly/mnIDliJ3ku6XlpJbjga/mj4/nlLvjgZfjgarjgYRcbiAgICAgICAgICAgICAgICBtb3JwaGluZ0ltYWdlLmJpdG1hcHNbaW5kZXhdLmFscGhhID0gMDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuc3RhZ2UuYWRkQ2hpbGQobW9ycGhpbmdJbWFnZS5iaXRtYXBzW2luZGV4XSk7XG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLmltYWdlcy5wdXNoKG1vcnBoaW5nSW1hZ2UpO1xuICAgICAgICB0aGlzLnN0YWdlLnVwZGF0ZSgpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG4gICAgcGxheSgpIHtcbiAgICAgICAgaWYodGhpcy5pc0FuaW1hdGluZyB8fCB0aGlzLmltYWdlcy5sZW5ndGg8Mil7IC8v44Ki44OL44Oh44O844K344On44Oz44Gu6YeN6KSH44KS6Ziy44GQXG4gICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgfVxuICAgICAgICB2YXIgdCA9IDA7XG4gICAgICAgIHZhciB0b3RhbCA9IHRoaXMuZHVsYXRpb24qNjAvMTAwMDtcbiAgICAgICAgdmFyIGludGVydmFsID0gMTAwMC82MDsgLy82MGZwc1xuICAgICAgICB2YXIgYmVmb3JlID0gdGhpcy5pbWFnZXNbdGhpcy5pbmRleF07XG4gICAgICAgIHZhciBhZnRlciA9IHRoaXMuaW1hZ2VzW3RoaXMuaW5kZXgrMV07XG4gICAgICAgIHZhciB0aW1lciA9IHNldEludGVydmFsKCgpID0+IHtcbiAgICAgICAgICAgIHZhciBlID0gRWFzaW5nRnVuY3Rpb25zW3RoaXMudHJhbnNmb3JtRWFzaW5nXSh0L3RvdGFsKTtcbiAgICAgICAgICAgIGJlZm9yZS5wb2ludHMuZm9yRWFjaCgocG9pbnQsIGluZGV4KSA9PiB7XG4gICAgICAgICAgICAgICAgYmVmb3JlLnBvaW50c1tpbmRleF0ueCA9IGFmdGVyLm9yaWdpbmFsUG9pbnRzW2luZGV4XS54ICogZSArIGJlZm9yZS5vcmlnaW5hbFBvaW50c1tpbmRleF0ueCAqICgxLWUpO1xuICAgICAgICAgICAgICAgIGJlZm9yZS5wb2ludHNbaW5kZXhdLnkgPSBhZnRlci5vcmlnaW5hbFBvaW50c1tpbmRleF0ueSAqIGUgKyBiZWZvcmUub3JpZ2luYWxQb2ludHNbaW5kZXhdLnkgKiAoMS1lKTtcbiAgICAgICAgICAgICAgICBhZnRlci5wb2ludHNbaW5kZXhdLnggPSBiZWZvcmUub3JpZ2luYWxQb2ludHNbaW5kZXhdLnggKiAoMS1lKSArIGFmdGVyLm9yaWdpbmFsUG9pbnRzW2luZGV4XS54ICogZTtcbiAgICAgICAgICAgICAgICBhZnRlci5wb2ludHNbaW5kZXhdLnkgPSBiZWZvcmUub3JpZ2luYWxQb2ludHNbaW5kZXhdLnkgKiAoMS1lKSArIGFmdGVyLm9yaWdpbmFsUG9pbnRzW2luZGV4XS55ICogZTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBlID0gRWFzaW5nRnVuY3Rpb25zW3RoaXMuYWxwaGFFYXNpbmddKHQvdG90YWwpO1xuICAgICAgICAgICAgYmVmb3JlLnNldEFscGhhKDEtZSk7XG4gICAgICAgICAgICBhZnRlci5zZXRBbHBoYShlKTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGUpO1xuICAgICAgICAgICAgYmVmb3JlLnVwZGF0ZSgpO1xuICAgICAgICAgICAgYWZ0ZXIudXBkYXRlKCk7XG4gICAgICAgICAgICB0aGlzLnN0YWdlLnVwZGF0ZSgpO1xuXG4gICAgICAgICAgICB0Kys7XG4gICAgICAgICAgICBpZih0PnRvdGFsKXtcbiAgICAgICAgICAgICAgICBpZih0aGlzLmluZGV4ID49IHRoaXMuaW1hZ2VzLmxlbmd0aCAtIDIpIHsgLy/ntYLkuoZcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5pbmRleCA9IDA7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuaXNBbmltYXRpbmcgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgY2xlYXJJbnRlcnZhbCh0aW1lcik7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHsgLy/mrKHjga7jg6Ljg7zjg5XjgqPjg7PjgrDjgbhcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5pbmRleCsrO1xuICAgICAgICAgICAgICAgICAgICBiZWZvcmUgPSBhZnRlcjtcbiAgICAgICAgICAgICAgICAgICAgYWZ0ZXIgPSB0aGlzLmltYWdlc1t0aGlzLmluZGV4KzFdO1xuICAgICAgICAgICAgICAgICAgICB0ID0gMDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sIGludGVydmFsKTtcbiAgICAgICAgdGhpcy5pc0FuaW1hdGluZyA9IHRydWU7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbiAgICBjbGVhcigpIHtcbiAgICAgICAgdGhpcy5pbWFnZXMgPSBbXTtcbiAgICAgICAgdGhpcy5zdGFnZS5jbGVhcigpO1xuICAgICAgICB0aGlzLnN0YWdlLnJlbW92ZUFsbENoaWxkcmVuKCk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgTW9ycGhpbmdTbGlkZXI7IiwidmFyIFBvaW50ID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuICAgIGdldEluaXRpYWxTdGF0ZTogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBpc01vdXNlRG93bjogZmFsc2VcbiAgICAgICAgfVxuICAgIH0sXG4gICAgaGFuZGxlTW91c2VEb3duOiBmdW5jdGlvbihlKSB7XG4gICAgICAgIHRoaXMucHJvcHMuc3RhcnRNb3ZpbmdQb2ludCh0aGlzLnByb3BzLmluZGV4KTtcbiAgICB9LFxuICAgIGhhbmRsZURvdWJsZUNsaWNrOiBmdW5jdGlvbigpIHsvL+ODgOODluODq+OCr+ODquODg+OCr+OBp1BvaW5044Gu5YmK6Zmk77yI44Gf44Gg44GX44CB5Z+65rqW55S75YOP44Gu44G/77yJXG4gICAgICAgIHRoaXMucHJvcHMucmVtb3ZlUG9pbnQodGhpcy5wcm9wcy5pbmRleCk7XG4gICAgfSxcbiAgICByZW5kZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9e1wiZWRpdG9yLWltYWdlLXBvaW50XCIgKyAodGhpcy5wcm9wcy5pc01vdmluZyA/IFwiIG1vdmluZ1wiIDogXCJcIil9IHN0eWxlPXtcbiAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgbGVmdDogdGhpcy5wcm9wcy54LFxuICAgICAgICAgICAgICAgICAgICAgICAgdG9wOiB0aGlzLnByb3BzLnlcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0gb25Nb3VzZURvd249e3RoaXMuaGFuZGxlTW91c2VEb3dufSBvbkRvdWJsZUNsaWNrPXt0aGlzLmhhbmRsZURvdWJsZUNsaWNrfSBvbkRyYWdTdGFydD17ZnVuY3Rpb24oZSl7ZS5wcmV2ZW50RGVmYXVsdCgpO319PjwvZGl2PlxuICAgICAgICApXG4gICAgfVxufSk7XG5cbmV4cG9ydCBkZWZhdWx0IFBvaW50OyIsImltcG9ydCBQb2ludCBmcm9tICcuL1BvaW50LmpzJztcblxudmFyIFBvaW50cyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcbiAgICBzdGFydE1vdmluZ1BvaW50OiBmdW5jdGlvbihpbmRleCkgey8v44Gp44Gu55S75YOP44Gu44Gp44Gu44Od44Kk44Oz44OI44KS5YuV44GL44GX5aeL44KB44Gf44GL44KSQXBw44Gr5bGK44GR44KLXG4gICAgICAgIHZhciByZWN0ID0gUmVhY3QuZmluZERPTU5vZGUodGhpcy5yZWZzLmRpdikuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgICAgIHRoaXMucHJvcHMuc3RhcnRNb3ZpbmdQb2ludCh0aGlzLnByb3BzLmluZGV4LCBpbmRleCwgcmVjdCk7XG4gICAgfSxcbiAgICBoYW5kbGVDbGljazogZnVuY3Rpb24oZSkgey8vUG9pbnTku6XlpJbjga7loLTmiYDjgpLjgq/jg6rjg4Pjgq/jgZfjgZ/jgolhZGRQb2ludO+8iEFwcOOBp+Wfuua6lueUu+WDj+OBi+OBqeOBhuOBi+WIpOaWre+8iVxuICAgICAgICBpZihlLnRhcmdldD09PVJlYWN0LmZpbmRET01Ob2RlKHRoaXMucmVmcy5kaXYpKSB7Ly9Qb2ludOOCkuOCr+ODquODg+OCr+OBl+OBn+WgtOWQiOOCgmhhbmRsZUNsaWNr44GV44KM44KL44Gu44Gn44CB44G144KL44GE5YiG44GRXG4gICAgICAgICAgICB2YXIgcmVjdCA9IGUudGFyZ2V0LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgICAgICAgICAgdGhpcy5wcm9wcy5hZGRQb2ludCh0aGlzLnByb3BzLmluZGV4LCB7eDogZS5jbGllbnRYIC0gcmVjdC5sZWZ0LCB5OiBlLmNsaWVudFkgLSByZWN0LnRvcH0pO1xuICAgICAgICB9XG4gICAgfSxcbiAgICByZW1vdmVQb2ludDogZnVuY3Rpb24oaW5kZXgpIHsvL+Wfuua6lueUu+WDj+OBquOCiVBvaW5044Gu5YmK6ZmkXG4gICAgICAgIHRoaXMucHJvcHMucmVtb3ZlUG9pbnQodGhpcy5wcm9wcy5pbmRleCwgaW5kZXgpO1xuICAgIH0sXG4gICAgcmVuZGVyOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIHBvaW50cyA9IHRoaXMucHJvcHMucG9pbnRzLm1hcCgocG9pbnQsIGluZGV4KSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gKDxQb2ludCBrZXk9e1wicG9pbnRzLVwiICsgdGhpcy5wcm9wcy5pbmRleCArIFwiLVwiICsgaW5kZXh9IGlzTW92aW5nPXsodGhpcy5wcm9wcy5tb3ZpbmdQb2ludCA9PT0gaW5kZXgpfSBpbmRleD17aW5kZXh9IHg9e3BvaW50Lnh9IHk9e3BvaW50Lnl9IHN0YXJ0TW92aW5nUG9pbnQ9e3RoaXMuc3RhcnRNb3ZpbmdQb2ludH0gcmVtb3ZlUG9pbnQ9e3RoaXMucmVtb3ZlUG9pbnR9PjwvUG9pbnQ+KVxuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIDxkaXYgcmVmPVwiZGl2XCIgY2xhc3NOYW1lPVwiZWRpdG9yLWltYWdlLXBvaW50cy1jb250YWluZXJcIiBvbk1vdXNlTW92ZT17dGhpcy5oYW5kbGVNb3VzZU1vdmV9IG9uTW91c2VVcD17dGhpcy5oYW5kbGVNb3VzZVVwfSBvbkNsaWNrPXt0aGlzLmhhbmRsZUNsaWNrfSBzdHlsZT17e3dpZHRoOiB0aGlzLnByb3BzLndpZHRoLCBoZWlnaHQ6IHRoaXMucHJvcHMuaGVpZ2h0fX0+XG4gICAgICAgICAgICAgICAge3BvaW50c31cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICApO1xuICAgIH1cbn0pO1xuXG5leHBvcnQgZGVmYXVsdCBQb2ludHM7IiwidmFyIEVhc2luZ0Z1bmN0aW9ucyA9IHtcbiAgICAvLyBubyBlYXNpbmcsIG5vIGFjY2VsZXJhdGlvblxuICAgIGxpbmVhcjogZnVuY3Rpb24gKHQpIHsgcmV0dXJuIHQgfSxcbiAgICAvLyBhY2NlbGVyYXRpbmcgZnJvbSB6ZXJvIHZlbG9jaXR5XG4gICAgZWFzZUluUXVhZDogZnVuY3Rpb24gKHQpIHsgcmV0dXJuIHQqdCB9LFxuICAgIC8vIGRlY2VsZXJhdGluZyB0byB6ZXJvIHZlbG9jaXR5XG4gICAgZWFzZU91dFF1YWQ6IGZ1bmN0aW9uICh0KSB7IHJldHVybiB0KigyLXQpIH0sXG4gICAgLy8gYWNjZWxlcmF0aW9uIHVudGlsIGhhbGZ3YXksIHRoZW4gZGVjZWxlcmF0aW9uXG4gICAgZWFzZUluT3V0UXVhZDogZnVuY3Rpb24gKHQpIHsgcmV0dXJuIHQ8LjUgPyAyKnQqdCA6IC0xKyg0LTIqdCkqdCB9LFxuICAgIC8vIGFjY2VsZXJhdGluZyBmcm9tIHplcm8gdmVsb2NpdHlcbiAgICBlYXNlSW5DdWJpYzogZnVuY3Rpb24gKHQpIHsgcmV0dXJuIHQqdCp0IH0sXG4gICAgLy8gZGVjZWxlcmF0aW5nIHRvIHplcm8gdmVsb2NpdHlcbiAgICBlYXNlT3V0Q3ViaWM6IGZ1bmN0aW9uICh0KSB7IHJldHVybiAoLS10KSp0KnQrMSB9LFxuICAgIC8vIGFjY2VsZXJhdGlvbiB1bnRpbCBoYWxmd2F5LCB0aGVuIGRlY2VsZXJhdGlvblxuICAgIGVhc2VJbk91dEN1YmljOiBmdW5jdGlvbiAodCkgeyByZXR1cm4gdDwuNSA/IDQqdCp0KnQgOiAodC0xKSooMip0LTIpKigyKnQtMikrMSB9LFxuICAgIC8vIGFjY2VsZXJhdGluZyBmcm9tIHplcm8gdmVsb2NpdHlcbiAgICBlYXNlSW5RdWFydDogZnVuY3Rpb24gKHQpIHsgcmV0dXJuIHQqdCp0KnQgfSxcbiAgICAvLyBkZWNlbGVyYXRpbmcgdG8gemVybyB2ZWxvY2l0eVxuICAgIGVhc2VPdXRRdWFydDogZnVuY3Rpb24gKHQpIHsgcmV0dXJuIDEtKC0tdCkqdCp0KnQgfSxcbiAgICAvLyBhY2NlbGVyYXRpb24gdW50aWwgaGFsZndheSwgdGhlbiBkZWNlbGVyYXRpb25cbiAgICBlYXNlSW5PdXRRdWFydDogZnVuY3Rpb24gKHQpIHsgcmV0dXJuIHQ8LjUgPyA4KnQqdCp0KnQgOiAxLTgqKC0tdCkqdCp0KnQgfSxcbiAgICAvLyBhY2NlbGVyYXRpbmcgZnJvbSB6ZXJvIHZlbG9jaXR5XG4gICAgZWFzZUluUXVpbnQ6IGZ1bmN0aW9uICh0KSB7IHJldHVybiB0KnQqdCp0KnQgfSxcbiAgICAvLyBkZWNlbGVyYXRpbmcgdG8gemVybyB2ZWxvY2l0eVxuICAgIGVhc2VPdXRRdWludDogZnVuY3Rpb24gKHQpIHsgcmV0dXJuIDErKC0tdCkqdCp0KnQqdCB9LFxuICAgIC8vIGFjY2VsZXJhdGlvbiB1bnRpbCBoYWxmd2F5LCB0aGVuIGRlY2VsZXJhdGlvblxuICAgIGVhc2VJbk91dFF1aW50OiBmdW5jdGlvbiAodCkgeyByZXR1cm4gdDwuNSA/IDE2KnQqdCp0KnQqdCA6IDErMTYqKC0tdCkqdCp0KnQqdCB9XG59O1xuXG5leHBvcnQgZGVmYXVsdCBFYXNpbmdGdW5jdGlvbnM7Il19
