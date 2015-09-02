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

var _EditorJs = require('./Editor.js');

var _EditorJs2 = _interopRequireDefault(_EditorJs);

//テスト用
//import testJSON from './../../build/js/test.js';

var stage, ms;

var App = React.createClass({
    displayName: 'App',

    getInitialState: function getInitialState() {
        if (localStorage.state) {
            return JSON.parse(localStorage.state);
        } else {

            //テスト用-------------------------------------------------------
            //localStorage.state = JSON.stringify(testJSON);
            //return testJSON;
            //--------------------------------------------------------------

            return {
                slides: [],
                movingPoint: -1,
                editingSlide: -1,
                movingPointRect: null,
                baseIndex: 0, //基準画像
                width: 0,
                height: 0,
                transformEasing: 'linear',
                alphaEasing: 'linear',
                duration: 200,
                interval: 1000,
                index: 0,
                isPlaying: false
            };
        }
    },
    componentDidMount: function componentDidMount() {
        ms = new MorphingSlider('viewer-canvas');
    },
    handleFileSelect: function handleFileSelect(evt) {
        var _this = this;

        evt.stopPropagation();
        evt.preventDefault();

        console.log(evt);
        var files = evt.dataTransfer.files; // FileList object
        console.log(files);

        // Loop through the FileList and render slide files as thumbnails.
        for (var i = 0, file; file = files[i]; i++) {

            // Only process slide files.
            if (!file.type.match('image.*')) {
                continue;
            }

            var reader = new FileReader();

            // Closure to capture the file information.
            reader.onload = function (e) {
                console.log(e);
                _this.addSlide(e.target.result);
            };

            // Read in the slide file as a data URL.
            reader.readAsDataURL(file);
        }
    },
    handleDragOver: function handleDragOver(evt) {
        evt.stopPropagation();
        evt.preventDefault();
        evt.dataTransfer.dropEffect = 'copy'; // Explicitly show this is a copy.
    },
    addSlide: function addSlide(dataURL) {
        var _this2 = this;

        var newSlide = {
            src: dataURL,
            index: this.state.slides.length
        };
        this.setState({ slides: this.state.slides.concat([newSlide]) }, function () {
            var slideDOM = React.findDOMNode(_this2.refs.editor.refs.slides.refs['Slide' + newSlide.index].refs.img); //Reactによりレンダー済みのDOM
            var width = slideDOM.width,
                height = slideDOM.height;
            var points, faces;
            if (newSlide.index > 0) {
                points = _this2.state.slides[_this2.state.baseIndex].points.concat(); //基準画像の物をコピー
                faces = _this2.state.slides[_this2.state.baseIndex].faces.concat(); //基準画像の物をコピー
            } else {
                //初期設定
                points = [{ x: 0, y: 0 }, { x: width, y: 0 }, { x: width, y: height }, { x: 0, y: height }, { x: width / 2, y: height / 2 }];
                faces = [[0, 1, 4], [1, 2, 4], [2, 3, 4], [3, 4, 0]];
            }
            var slides = _this2.state.slides.concat();
            slides[newSlide.index].points = points;
            slides[newSlide.index].faces = faces;
            slides[newSlide.index].width = width;
            slides[newSlide.index].height = height;
            _this2.setState({ slides: slides });
        });
    },
    handleMouseMove: function handleMouseMove(e) {
        if (this.state.movingPoint >= 0) {
            var rect = this.state.movingPointRect,
                x = Math.round(e.clientX - rect.left),
                y = Math.round(e.clientY - rect.top);

            //はみ出ないように
            x = x < 0 ? 0 : x;
            x = x > rect.width ? rect.width : x;
            y = y < 0 ? 0 : y;
            y = y > rect.height ? rect.height : y;

            this.movePoint({ x: x, y: y });
        }
    },
    handleMouseUp: function handleMouseUp() {
        if (this.state.editingSlide > -1) {
            this.setState({ editingSlide: -1, movingPoint: -1 });
        }
    },
    movePoint: function movePoint(point) {
        var slides = this.state.slides.concat();
        slides[this.state.editingSlide].points[this.state.movingPoint] = point;
        this.setState({ slides: slides });
    },
    startMovingPoint: function startMovingPoint(editingSlide, movingPoint, movingPointRect) {
        this.setState({ editingSlide: editingSlide, movingPoint: movingPoint, movingPointRect: movingPointRect });
    },
    addPoint: function addPoint(index, point) {
        var _this3 = this;

        console.log(index);
        if (index === this.state.baseIndex) {
            //基準画像ならPoint追加
            var slides = this.state.slides.concat();
            var baseSlide = slides[this.state.baseIndex];
            baseSlide.points.push(point);
            baseSlide.faces = this.createFaces(baseSlide.points); //facesを作り直す
            slides.forEach(function (slide, index) {
                //他のslideにもpointとfaceを追加
                if (_this3.state.baseIndex !== index) {
                    slides[index].points.push({ x: point.x, y: point.y });
                    slides[index].faces = baseSlide.faces;
                }
            });
            this.setState({ slides: slides });
        }
    },
    removePoint: function removePoint(slideIndex, pointIndex) {
        var _this4 = this;

        //Pointの削除
        if (slideIndex === this.state.baseIndex) {
            //基準画像なら削除
            var slides = this.state.slides.concat();
            var baseSlide = slides[this.state.baseIndex];
            baseSlide.points.splice(pointIndex, 1);
            baseSlide.faces = this.createFaces(baseSlide.points); //facesを作り直す
            slides.forEach(function (slide, index) {
                //他のslideのpointを削除、faceを更新
                if (_this4.state.baseIndex !== index) {
                    slides[index].points.splice(pointIndex, 1);
                    slides[index].faces = baseSlide.faces;
                }
            });
            this.setState({ slides: slides });
        }
    },
    removeSlide: function removeSlide(index) {
        var slides = this.state.slides.concat();
        slides.splice(index, 1);

        //*****基準画像を削除した場合の処理が必要*****

        this.setState({ slides: slides });
    },
    changeEasing: function changeEasing() {
        var select = React.findDOMNode(this.refs.easingSelect);
        var value = select.options[select.selectedIndex].value;
        ms.easing = value;
        this.setState({ easing: value });
    },
    changeduration: function changeduration() {
        var value = React.findDOMNode(this.refs.durationInput).value * 1;
        ms.duration = value;
        this.setState({ duration: value });
    },
    changeInterval: function changeInterval() {
        var value = React.findDOMNode(this.refs.intervalInput).value * 1;
        ms.interval = value;
        this.setState({ interval: value });
    },
    play: function play() {
        var _this5 = this;

        if (this.state.isPlaying) {
            ms.stop();
            this.setState({ isPlaying: false });
        } else {
            ms.play(true, this.state.interval, function () {
                _this5.setState({ index: ms.index });
            });
            this.setState({ isPlaying: true });
        }
    },
    next: function next() {
        var _this6 = this;

        ms.morph(true, function () {
            _this6.setState({ index: ms.index });
        });
    },
    prev: function prev() {
        var _this7 = this;

        ms.morph(false, function () {
            _this7.setState({ index: ms.index });
        });
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
    togglePreview: function togglePreview() {
        if (!this.state.isPreviewing) {
            this.preview();
        }
        this.setState({ isPreviewing: !this.state.isPreviewing });
    },
    preview: function preview() {
        var _this8 = this;

        if (!ms.isAnimating) {
            ms.clear();
            this.state.slides.forEach(function (slide, index) {
                //var slideDOM = React.findDOMNode(this.refs.editor.refs.slides.refs["Slide" + index].refs.img);//Reactによりレンダー済みのDOM
                ms.addSlide(slide.src, slide, function () {
                    _this8.setState({ width: ms.width, height: ms.height });
                });
            });
        }
    },
    save: function save() {
        //ひとまずlocalStrageに保存
        localStorage.state = JSON.stringify(this.state);
    },
    render: function render() {
        var _this9 = this;

        var easings = Object.keys(_easingJs2['default']).map(function (name) {
            return React.createElement(
                'option',
                { value: name },
                name
            );
        });
        var points = this.state.slides.map(function (slide, index) {
            if (_this9.state.index === index) {
                return React.createElement('div', { className: 'viewer-point viewer-point-now' });
            } else {
                return React.createElement('div', { className: 'viewer-point' });
            }
        });
        var editorWidth = 0;
        this.state.slides.forEach(function (slide) {
            editorWidth += slide.width + 40;
        });
        return React.createElement(
            'div',
            { id: 'app', onMouseMove: this.handleMouseMove, onMouseUp: this.handleMouseUp, onDrop: this.handleFileSelect, onDragOver: this.handleDragOver },
            React.createElement(_EditorJs2['default'], { width: editorWidth, slides: this.state.slides, movingPoint: this.state.movingPoint, addSlide: this.addSlide, ref: 'editor', startMovingPoint: this.startMovingPoint, addPoint: this.addPoint, removePoint: this.removePoint, removeSlide: this.removeSlide }),
            React.createElement('div', { className: 'clear' }),
            React.createElement(
                'div',
                { id: 'viewer-container', className: 'viewer-container-' + (this.state.isPreviewing ? 'opened' : 'closed') },
                React.createElement(
                    'div',
                    { id: 'viewer' },
                    React.createElement(
                        'div',
                        { id: 'viewer-slider', style: { width: this.state.width } },
                        React.createElement(
                            'button',
                            { id: 'viewer-next-button', onClick: this.next, style: { top: this.state.height / 2 } },
                            'Next'
                        ),
                        React.createElement(
                            'button',
                            { id: 'viewer-prev-button', onClick: this.prev, style: { top: this.state.height / 2 } },
                            'Prev'
                        ),
                        React.createElement(
                            'div',
                            { id: 'viewer-play-button-container', style: { height: this.state.height, width: this.state.width } },
                            React.createElement('div', { id: 'viewer-play-button', className: this.state.isPlaying ? 'viewer-play-button-pause' : '', onClick: this.play, style: { top: this.state.height / 2, left: this.state.width / 2 } })
                        ),
                        React.createElement('canvas', { id: 'viewer-canvas', width: this.state.width, height: this.state.height })
                    ),
                    React.createElement(
                        'div',
                        { id: 'viewer-option', style: { width: this.state.width } },
                        React.createElement(
                            'label',
                            null,
                            'Easing: ',
                            React.createElement(
                                'select',
                                { ref: 'easingSelect', id: 'easing-select', onChange: this.changeEasing },
                                easings
                            )
                        ),
                        React.createElement(
                            'label',
                            null,
                            'Duration: ',
                            React.createElement('input', { ref: 'durationInput', type: 'number', id: 'duration-input', min: '100', onChange: this.changeduration, value: this.state.duration })
                        ),
                        React.createElement(
                            'label',
                            null,
                            'Interval of Autoplay: ',
                            React.createElement('input', { ref: 'intervalInput', type: 'number', id: 'interval-input', min: '0', onChange: this.changeInterval, value: this.state.interval })
                        ),
                        React.createElement(
                            'div',
                            { id: 'viewer-points' },
                            points
                        )
                    )
                )
            ),
            React.createElement(
                'button',
                { id: 'preview-button', onClick: this.togglePreview },
                'Preview'
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

},{"./Editor.js":3,"./easing.js":8}],3:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var _SlidesJs = require("./Slides.js");

var _SlidesJs2 = _interopRequireDefault(_SlidesJs);

var Editor = React.createClass({
    displayName: "Editor",

    render: function render() {
        return React.createElement(
            "div",
            { id: "editor", style: { width: this.props.width } },
            React.createElement(_SlidesJs2["default"], { slides: this.props.slides, movingPoint: this.props.movingPoint, ref: "slides", startMovingPoint: this.props.startMovingPoint, addPoint: this.props.addPoint, removePoint: this.props.removePoint, removeSlide: this.props.removeSlide })
        );
    }
});

exports["default"] = Editor;
module.exports = exports["default"];

},{"./Slides.js":7}],4:[function(require,module,exports){
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
        return React.createElement("div", { className: "editor-slide-point" + (this.props.isMoving ? " moving" : ""), style: {
                left: this.props.x,
                top: this.props.y
            }, onMouseDown: this.handleMouseDown, onDoubleClick: this.handleDoubleClick, onDragStart: function (e) {
                e.preventDefault();
            } });
    }
});

exports["default"] = Point;
module.exports = exports["default"];

},{}],5:[function(require,module,exports){
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
        if (e.target.className !== "editor-slide-point") {
            //Pointをクリックした場合もhandleClickされるので、ふるい分け
            var rect = e.target.getBoundingClientRect();
            this.props.addPoint(this.props.index, { x: Math.round(e.clientX - rect.left), y: Math.round(e.clientY - rect.top) });
            console.log("add");
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
        var faces = this.props.faces.map(function (face) {
            //三角形の描画
            var a = _this.props.points[face[0]];
            var b = _this.props.points[face[1]];
            var c = _this.props.points[face[2]];
            var path = "M" + a.x + " " + a.y + " L" + b.x + " " + b.y + " L" + c.x + " " + c.y + "Z";
            return React.createElement("path", { stroke: "rgba(0,0,0,0.1)", fill: "none", d: path });
        });
        return React.createElement(
            "div",
            { ref: "div", className: "editor-slide-points-container", onMouseMove: this.handleMouseMove, onMouseUp: this.handleMouseUp, onClick: this.handleClick, style: { width: this.props.width, height: this.props.height } },
            points,
            React.createElement(
                "svg",
                { viewBox: "0 0 " + this.props.width + " " + this.props.height },
                faces
            )
        );
    }
});

exports["default"] = Points;
module.exports = exports["default"];

},{"./Point.js":4}],6:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var _PointsJs = require("./Points.js");

var _PointsJs2 = _interopRequireDefault(_PointsJs);

var Slide = React.createClass({
    displayName: "Slide",

    removeSlide: function removeSlide() {
        //indexをAppに送って削除
        this.props.removeSlide(this.props.index);
    },
    getJSONString: function getJSONString() {
        //PointsとFacesを表示
        return JSON.stringify({
            points: this.props.slide.points,
            faces: this.props.slide.faces
        });
    },
    render: function render() {
        return React.createElement(
            "div",
            { className: "editor-slide-container", style: { width: this.props.slide.width } },
            React.createElement(_PointsJs2["default"], { index: this.props.index, movingPoint: this.props.movingPoint, width: this.props.slide.width ? this.props.slide.width : 0, height: this.props.slide.height ? this.props.slide.height : 0,
                points: this.props.slide.points ? this.props.slide.points : [],
                faces: this.props.slide.faces ? this.props.slide.faces : [],
                startMovingPoint: this.props.startMovingPoint, addPoint: this.props.addPoint, removePoint: this.props.removePoint }),
            React.createElement("img", { src: this.props.slide.src, ref: "img" }),
            React.createElement("textarea", { className: "editor-slide-data", value: this.getJSONString(), readOnly: true }),
            React.createElement(
                "button",
                { className: "editor-slide-remove-button", onClick: this.removeSlide },
                "×"
            )
        );
    }
});

exports["default"] = Slide;
module.exports = exports["default"];

},{"./Points.js":5}],7:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var _SlideJs = require("./Slide.js");

var _SlideJs2 = _interopRequireDefault(_SlideJs);

var Slides = React.createClass({
    displayName: "Slides",

    render: function render() {
        var _this = this;

        var slides = this.props.slides.map(function (slide, index) {
            return React.createElement(_SlideJs2["default"], { ref: "Slide" + index, key: "slide-container-" + index, index: index, slide: slide, movingPoint: _this.props.movingPoint, startMovingPoint: _this.props.startMovingPoint, addPoint: _this.props.addPoint, removePoint: _this.props.removePoint, removeSlide: _this.props.removeSlide });
        });
        return React.createElement(
            "div",
            { id: "editor-slides" },
            slides
        );
    }
});

exports["default"] = Slides;
module.exports = exports["default"];

},{"./Slide.js":6}],8:[function(require,module,exports){
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
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMveWFtYW1vdG9ub2Rva2EvRGVza3RvcC9pbWFnZS1tb3JwaGluZy9zcmMvanMvbWFpbi5qcyIsIi9Vc2Vycy95YW1hbW90b25vZG9rYS9EZXNrdG9wL2ltYWdlLW1vcnBoaW5nL3NyYy9qcy9BcHAuanMiLCIvVXNlcnMveWFtYW1vdG9ub2Rva2EvRGVza3RvcC9pbWFnZS1tb3JwaGluZy9zcmMvanMvRWRpdG9yLmpzIiwiL1VzZXJzL3lhbWFtb3Rvbm9kb2thL0Rlc2t0b3AvaW1hZ2UtbW9ycGhpbmcvc3JjL2pzL1BvaW50LmpzIiwiL1VzZXJzL3lhbWFtb3Rvbm9kb2thL0Rlc2t0b3AvaW1hZ2UtbW9ycGhpbmcvc3JjL2pzL1BvaW50cy5qcyIsIi9Vc2Vycy95YW1hbW90b25vZG9rYS9EZXNrdG9wL2ltYWdlLW1vcnBoaW5nL3NyYy9qcy9TbGlkZS5qcyIsIi9Vc2Vycy95YW1hbW90b25vZG9rYS9EZXNrdG9wL2ltYWdlLW1vcnBoaW5nL3NyYy9qcy9TbGlkZXMuanMiLCIvVXNlcnMveWFtYW1vdG9ub2Rva2EvRGVza3RvcC9pbWFnZS1tb3JwaGluZy9zcmMvanMvZWFzaW5nLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7OztxQkNBZ0IsVUFBVTs7OztBQUUxQixLQUFLLENBQUMsTUFBTSxDQUNSLDZDQUFXLEVBQ1gsUUFBUSxDQUFDLGNBQWMsQ0FBQyxlQUFlLENBQUMsQ0FDM0MsQ0FBQzs7Ozs7Ozs7Ozs7d0JDTDBCLGFBQWE7Ozs7d0JBQ3RCLGFBQWE7Ozs7Ozs7QUFLaEMsSUFBSSxLQUFLLEVBQUUsRUFBRSxDQUFDOztBQUVkLElBQUksR0FBRyxHQUFHLEtBQUssQ0FBQyxXQUFXLENBQUM7OztBQUN4QixtQkFBZSxFQUFFLDJCQUFXO0FBQ3hCLFlBQUcsWUFBWSxDQUFDLEtBQUssRUFBQztBQUNsQixtQkFBTyxJQUFJLENBQUMsS0FBSyxDQUFDLFlBQVksQ0FBQyxLQUFLLENBQUMsQ0FBQztTQUN6QyxNQUFNOzs7Ozs7O0FBT0gsbUJBQU87QUFDSCxzQkFBTSxFQUFFLEVBQUU7QUFDViwyQkFBVyxFQUFFLENBQUMsQ0FBQztBQUNmLDRCQUFZLEVBQUUsQ0FBQyxDQUFDO0FBQ2hCLCtCQUFlLEVBQUUsSUFBSTtBQUNyQix5QkFBUyxFQUFFLENBQUM7QUFDWixxQkFBSyxFQUFFLENBQUM7QUFDUixzQkFBTSxFQUFFLENBQUM7QUFDVCwrQkFBZSxFQUFFLFFBQVE7QUFDekIsMkJBQVcsRUFBRSxRQUFRO0FBQ3JCLHdCQUFRLEVBQUUsR0FBRztBQUNiLHdCQUFRLEVBQUUsSUFBSTtBQUNkLHFCQUFLLEVBQUUsQ0FBQztBQUNSLHlCQUFTLEVBQUUsS0FBSzthQUNuQixDQUFBO1NBQ0o7S0FDSjtBQUNELHFCQUFpQixFQUFFLDZCQUFXO0FBQzFCLFVBQUUsR0FBRyxJQUFJLGNBQWMsQ0FBQyxlQUFlLENBQUMsQ0FBQztLQUM1QztBQUNELG9CQUFnQixFQUFFLDBCQUFTLEdBQUcsRUFBRTs7O0FBQzVCLFdBQUcsQ0FBQyxlQUFlLEVBQUUsQ0FBQztBQUN0QixXQUFHLENBQUMsY0FBYyxFQUFFLENBQUM7O0FBRXJCLGVBQU8sQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDakIsWUFBSSxLQUFLLEdBQUcsR0FBRyxDQUFDLFlBQVksQ0FBQyxLQUFLLENBQUM7QUFDbkMsZUFBTyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQzs7O0FBR25CLGFBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLElBQUksRUFBRSxJQUFJLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFOzs7QUFHeEMsZ0JBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsRUFBRTtBQUM3Qix5QkFBUzthQUNaOztBQUVELGdCQUFJLE1BQU0sR0FBRyxJQUFJLFVBQVUsRUFBRSxDQUFDOzs7QUFHOUIsa0JBQU0sQ0FBQyxNQUFNLEdBQUcsVUFBQyxDQUFDLEVBQUs7QUFDbkIsdUJBQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDZixzQkFBSyxRQUFRLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQzthQUNsQyxDQUFBOzs7QUFHRCxrQkFBTSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsQ0FBQztTQUM5QjtLQUNKO0FBQ0Qsa0JBQWMsRUFBRSx3QkFBUyxHQUFHLEVBQUU7QUFDMUIsV0FBRyxDQUFDLGVBQWUsRUFBRSxDQUFDO0FBQ3RCLFdBQUcsQ0FBQyxjQUFjLEVBQUUsQ0FBQztBQUNyQixXQUFHLENBQUMsWUFBWSxDQUFDLFVBQVUsR0FBRyxNQUFNLENBQUM7S0FDeEM7QUFDRCxZQUFRLEVBQUUsa0JBQVMsT0FBTyxFQUFFOzs7QUFDeEIsWUFBSSxRQUFRLEdBQUc7QUFDWCxlQUFHLEVBQUUsT0FBTztBQUNaLGlCQUFLLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsTUFBTTtTQUNsQyxDQUFDO0FBQ0YsWUFBSSxDQUFDLFFBQVEsQ0FBQyxFQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxFQUFDLEVBQUUsWUFBTTtBQUNoRSxnQkFBSSxRQUFRLEdBQUcsS0FBSyxDQUFDLFdBQVcsQ0FBQyxPQUFLLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsT0FBTyxHQUFHLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDdkcsZ0JBQUksS0FBSyxHQUFHLFFBQVEsQ0FBQyxLQUFLO2dCQUFFLE1BQU0sR0FBRyxRQUFRLENBQUMsTUFBTSxDQUFDO0FBQ3JELGdCQUFJLE1BQU0sRUFBRSxLQUFLLENBQUM7QUFDbEIsZ0JBQUcsUUFBUSxDQUFDLEtBQUssR0FBQyxDQUFDLEVBQUM7QUFDaEIsc0JBQU0sR0FBRyxPQUFLLEtBQUssQ0FBQyxNQUFNLENBQUMsT0FBSyxLQUFLLENBQUMsU0FBUyxDQUFDLENBQUMsTUFBTSxDQUFDLE1BQU0sRUFBRSxDQUFDO0FBQ2pFLHFCQUFLLEdBQUcsT0FBSyxLQUFLLENBQUMsTUFBTSxDQUFDLE9BQUssS0FBSyxDQUFDLFNBQVMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxNQUFNLEVBQUUsQ0FBQzthQUNsRSxNQUFNOztBQUNILHNCQUFNLEdBQUcsQ0FDTCxFQUFDLENBQUMsRUFBQyxDQUFDLEVBQUUsQ0FBQyxFQUFDLENBQUMsRUFBQyxFQUFFLEVBQUMsQ0FBQyxFQUFDLEtBQUssRUFBRSxDQUFDLEVBQUMsQ0FBQyxFQUFDLEVBQUUsRUFBQyxDQUFDLEVBQUMsS0FBSyxFQUFFLENBQUMsRUFBQyxNQUFNLEVBQUMsRUFBRSxFQUFDLENBQUMsRUFBQyxDQUFDLEVBQUUsQ0FBQyxFQUFDLE1BQU0sRUFBQyxFQUFFLEVBQUMsQ0FBQyxFQUFDLEtBQUssR0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFDLE1BQU0sR0FBQyxDQUFDLEVBQUMsQ0FDNUYsQ0FBQztBQUNGLHFCQUFLLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQzthQUN4RDtBQUNELGdCQUFJLE1BQU0sR0FBRyxPQUFLLEtBQUssQ0FBQyxNQUFNLENBQUMsTUFBTSxFQUFFLENBQUM7QUFDeEMsa0JBQU0sQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQztBQUN2QyxrQkFBTSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDO0FBQ3JDLGtCQUFNLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUM7QUFDckMsa0JBQU0sQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQztBQUN2QyxtQkFBSyxRQUFRLENBQUMsRUFBQyxNQUFNLEVBQUUsTUFBTSxFQUFDLENBQUMsQ0FBQztTQUNuQyxDQUFDLENBQUM7S0FDTjtBQUNELG1CQUFlLEVBQUUseUJBQVMsQ0FBQyxFQUFFO0FBQ3pCLFlBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxXQUFXLElBQUUsQ0FBQyxFQUFDO0FBQ3pCLGdCQUFJLElBQUksR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLGVBQWU7Z0JBQ2pDLENBQUMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQztnQkFDckMsQ0FBQyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7OztBQUd6QyxhQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQ2xCLGFBQUMsR0FBRyxDQUFDLEdBQUcsSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQztBQUNwQyxhQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQ2xCLGFBQUMsR0FBRyxDQUFDLEdBQUcsSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQzs7QUFFdEMsZ0JBQUksQ0FBQyxTQUFTLENBQUMsRUFBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUMsQ0FBQyxDQUFDO1NBQ2hDO0tBQ0o7QUFDRCxpQkFBYSxFQUFFLHlCQUFXO0FBQ3RCLFlBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxZQUFZLEdBQUMsQ0FBQyxDQUFDLEVBQUU7QUFDM0IsZ0JBQUksQ0FBQyxRQUFRLENBQUMsRUFBQyxZQUFZLEVBQUUsQ0FBQyxDQUFDLEVBQUUsV0FBVyxFQUFFLENBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQztTQUN0RDtLQUNKO0FBQ0QsYUFBUyxFQUFFLG1CQUFTLEtBQUssRUFBRTtBQUN2QixZQUFJLE1BQU0sR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxNQUFNLEVBQUUsQ0FBQztBQUN4QyxjQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxZQUFZLENBQUMsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxXQUFXLENBQUMsR0FBRyxLQUFLLENBQUM7QUFDdkUsWUFBSSxDQUFDLFFBQVEsQ0FBQyxFQUFDLE1BQU0sRUFBRSxNQUFNLEVBQUMsQ0FBQyxDQUFDO0tBQ25DO0FBQ0Qsb0JBQWdCLEVBQUUsMEJBQVMsWUFBWSxFQUFFLFdBQVcsRUFBRSxlQUFlLEVBQUU7QUFDbkUsWUFBSSxDQUFDLFFBQVEsQ0FBQyxFQUFDLFlBQVksRUFBRSxZQUFZLEVBQUUsV0FBVyxFQUFFLFdBQVcsRUFBRSxlQUFlLEVBQUUsZUFBZSxFQUFDLENBQUMsQ0FBQztLQUMzRztBQUNELFlBQVEsRUFBRSxrQkFBUyxLQUFLLEVBQUUsS0FBSyxFQUFDOzs7QUFDNUIsZUFBTyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQztBQUNuQixZQUFHLEtBQUssS0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLFNBQVMsRUFBRTs7QUFDN0IsZ0JBQUksTUFBTSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLE1BQU0sRUFBRSxDQUFDO0FBQ3hDLGdCQUFJLFNBQVMsR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsQ0FBQztBQUM3QyxxQkFBUyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7QUFDN0IscUJBQVMsQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLENBQUM7QUFDckQsa0JBQU0sQ0FBQyxPQUFPLENBQUMsVUFBQyxLQUFLLEVBQUUsS0FBSyxFQUFLOztBQUM3QixvQkFBSSxPQUFLLEtBQUssQ0FBQyxTQUFTLEtBQUssS0FBSyxFQUFFO0FBQ2hDLDBCQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFDLENBQUMsRUFBRSxLQUFLLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxLQUFLLENBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQztBQUNwRCwwQkFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLEtBQUssR0FBRyxTQUFTLENBQUMsS0FBSyxDQUFDO2lCQUN6QzthQUNKLENBQUMsQ0FBQztBQUNILGdCQUFJLENBQUMsUUFBUSxDQUFDLEVBQUMsTUFBTSxFQUFFLE1BQU0sRUFBQyxDQUFDLENBQUM7U0FDbkM7S0FDSjtBQUNELGVBQVcsRUFBRSxxQkFBUyxVQUFVLEVBQUUsVUFBVSxFQUFFOzs7O0FBQzFDLFlBQUcsVUFBVSxLQUFLLElBQUksQ0FBQyxLQUFLLENBQUMsU0FBUyxFQUFFOztBQUNwQyxnQkFBSSxNQUFNLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsTUFBTSxFQUFFLENBQUM7QUFDeEMsZ0JBQUksU0FBUyxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxDQUFDO0FBQzdDLHFCQUFTLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxVQUFVLEVBQUUsQ0FBQyxDQUFDLENBQUM7QUFDdkMscUJBQVMsQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLENBQUM7QUFDckQsa0JBQU0sQ0FBQyxPQUFPLENBQUMsVUFBQyxLQUFLLEVBQUUsS0FBSyxFQUFLOztBQUM3QixvQkFBSSxPQUFLLEtBQUssQ0FBQyxTQUFTLEtBQUssS0FBSyxFQUFFO0FBQ2hDLDBCQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxVQUFVLEVBQUUsQ0FBQyxDQUFDLENBQUM7QUFDM0MsMEJBQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxLQUFLLEdBQUcsU0FBUyxDQUFDLEtBQUssQ0FBQztpQkFDekM7YUFDSixDQUFDLENBQUM7QUFDSCxnQkFBSSxDQUFDLFFBQVEsQ0FBQyxFQUFDLE1BQU0sRUFBRSxNQUFNLEVBQUMsQ0FBQyxDQUFDO1NBQ25DO0tBQ0o7QUFDRCxlQUFXLEVBQUUscUJBQVMsS0FBSyxFQUFFO0FBQ3pCLFlBQUksTUFBTSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLE1BQU0sRUFBRSxDQUFDO0FBQ3hDLGNBQU0sQ0FBQyxNQUFNLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyxDQUFDOzs7O0FBSXhCLFlBQUksQ0FBQyxRQUFRLENBQUMsRUFBQyxNQUFNLEVBQUUsTUFBTSxFQUFDLENBQUMsQ0FBQztLQUNuQztBQUNELGdCQUFZLEVBQUUsd0JBQVU7QUFDcEIsWUFBSSxNQUFNLEdBQUcsS0FBSyxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDO0FBQ3ZELFlBQUksS0FBSyxHQUFHLE1BQU0sQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLGFBQWEsQ0FBQyxDQUFDLEtBQUssQ0FBQztBQUN2RCxVQUFFLENBQUMsTUFBTSxHQUFHLEtBQUssQ0FBQztBQUNsQixZQUFJLENBQUMsUUFBUSxDQUFDLEVBQUMsTUFBTSxFQUFFLEtBQUssRUFBQyxDQUFDLENBQUM7S0FDbEM7QUFDRCxrQkFBYyxFQUFFLDBCQUFVO0FBQ3RCLFlBQUksS0FBSyxHQUFHLEtBQUssQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQyxLQUFLLEdBQUMsQ0FBQyxDQUFDO0FBQy9ELFVBQUUsQ0FBQyxRQUFRLEdBQUcsS0FBSyxDQUFDO0FBQ3BCLFlBQUksQ0FBQyxRQUFRLENBQUMsRUFBQyxRQUFRLEVBQUUsS0FBSyxFQUFDLENBQUMsQ0FBQztLQUNwQztBQUNELGtCQUFjLEVBQUUsMEJBQVU7QUFDdEIsWUFBSSxLQUFLLEdBQUcsS0FBSyxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDLEtBQUssR0FBQyxDQUFDLENBQUM7QUFDL0QsVUFBRSxDQUFDLFFBQVEsR0FBRyxLQUFLLENBQUM7QUFDcEIsWUFBSSxDQUFDLFFBQVEsQ0FBQyxFQUFDLFFBQVEsRUFBRSxLQUFLLEVBQUMsQ0FBQyxDQUFDO0tBQ3BDO0FBQ0QsUUFBSSxFQUFFLGdCQUFVOzs7QUFDWixZQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsU0FBUyxFQUFFO0FBQ3JCLGNBQUUsQ0FBQyxJQUFJLEVBQUUsQ0FBQztBQUNWLGdCQUFJLENBQUMsUUFBUSxDQUFDLEVBQUMsU0FBUyxFQUFFLEtBQUssRUFBQyxDQUFDLENBQUM7U0FDckMsTUFBTTtBQUNILGNBQUUsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxFQUFFLFlBQU07QUFDckMsdUJBQUssUUFBUSxDQUFDLEVBQUMsS0FBSyxFQUFFLEVBQUUsQ0FBQyxLQUFLLEVBQUMsQ0FBQyxDQUFDO2FBQ3BDLENBQUMsQ0FBQztBQUNILGdCQUFJLENBQUMsUUFBUSxDQUFDLEVBQUMsU0FBUyxFQUFFLElBQUksRUFBQyxDQUFDLENBQUM7U0FDcEM7S0FDSjtBQUNELFFBQUksRUFBRSxnQkFBVTs7O0FBQ1osVUFBRSxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsWUFBTTtBQUNqQixtQkFBSyxRQUFRLENBQUMsRUFBQyxLQUFLLEVBQUMsRUFBRSxDQUFDLEtBQUssRUFBQyxDQUFDLENBQUM7U0FDbkMsQ0FBQyxDQUFDO0tBQ047QUFDRCxRQUFJLEVBQUUsZ0JBQVU7OztBQUNaLFVBQUUsQ0FBQyxLQUFLLENBQUMsS0FBSyxFQUFFLFlBQU07QUFDbEIsbUJBQUssUUFBUSxDQUFDLEVBQUMsS0FBSyxFQUFDLEVBQUUsQ0FBQyxLQUFLLEVBQUMsQ0FBQyxDQUFDO1NBQ25DLENBQUMsQ0FBQztLQUNOO0FBQ0QsZUFBVyxFQUFFLHFCQUFTLE1BQU0sRUFBRTs7QUFFMUIsWUFBSSxPQUFPLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FDMUIsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxFQUFFO0FBQ1osbUJBQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQTtTQUNiLENBQUMsQ0FDRCxDQUFDLENBQUMsVUFBVSxDQUFDLEVBQUU7QUFDWixtQkFBTyxDQUFDLENBQUMsQ0FBQyxDQUFBO1NBQ2IsQ0FBQyxDQUFDOzs7QUFHUCxZQUFJLEtBQUssR0FBRyxPQUFPLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0FBQ3RDLGFBQUssQ0FBQyxPQUFPLENBQUMsVUFBUyxJQUFJLEVBQUUsS0FBSyxFQUFDO0FBQy9CLGlCQUFLLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FDWCxNQUFNLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUMvQixNQUFNLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUMvQixNQUFNLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUNsQyxDQUFDO1NBQ0wsQ0FBQyxDQUFBOztBQUVGLGVBQU8sS0FBSyxDQUFDO0tBQ2hCO0FBQ0QsaUJBQWEsRUFBRSx5QkFBVztBQUN0QixZQUFHLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxZQUFZLEVBQUM7QUFDeEIsZ0JBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQztTQUNsQjtBQUNELFlBQUksQ0FBQyxRQUFRLENBQUMsRUFBQyxZQUFZLEVBQUUsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLFlBQVksRUFBQyxDQUFDLENBQUM7S0FDM0Q7QUFDRCxXQUFPLEVBQUUsbUJBQVc7OztBQUNoQixZQUFHLENBQUMsRUFBRSxDQUFDLFdBQVcsRUFBRTtBQUNoQixjQUFFLENBQUMsS0FBSyxFQUFFLENBQUM7QUFDWCxnQkFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLFVBQUMsS0FBSyxFQUFFLEtBQUssRUFBSzs7QUFFeEMsa0JBQUUsQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLEdBQUcsRUFBRSxLQUFLLEVBQUUsWUFBTTtBQUNoQywyQkFBSyxRQUFRLENBQUMsRUFBQyxLQUFLLEVBQUUsRUFBRSxDQUFDLEtBQUssRUFBRSxNQUFNLEVBQUUsRUFBRSxDQUFDLE1BQU0sRUFBQyxDQUFDLENBQUM7aUJBQ3ZELENBQUMsQ0FBQzthQUNOLENBQUMsQ0FBQztTQUNOO0tBQ0o7QUFDRCxRQUFJLEVBQUUsZ0JBQVc7O0FBQ2Isb0JBQVksQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7S0FDbkQ7QUFDRCxVQUFNLEVBQUUsa0JBQVc7OztBQUNmLFlBQUksT0FBTyxHQUFHLE1BQU0sQ0FBQyxJQUFJLHVCQUFpQixDQUFDLEdBQUcsQ0FBQyxVQUFTLElBQUksRUFBQztBQUN6RCxtQkFDSTs7a0JBQVEsS0FBSyxFQUFFLElBQUksQUFBQztnQkFBRSxJQUFJO2FBQVUsQ0FDdEM7U0FDTCxDQUFDLENBQUM7QUFDSCxZQUFJLE1BQU0sR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsVUFBQyxLQUFLLEVBQUUsS0FBSyxFQUFLO0FBQ2pELGdCQUFHLE9BQUssS0FBSyxDQUFDLEtBQUssS0FBSyxLQUFLLEVBQUU7QUFDM0IsdUJBQ0ksNkJBQUssU0FBUyxFQUFDLCtCQUErQixHQUFPLENBQ3hEO2FBQ0osTUFBTTtBQUNILHVCQUNJLDZCQUFLLFNBQVMsRUFBQyxjQUFjLEdBQU8sQ0FDdkM7YUFDSjtTQUNKLENBQUMsQ0FBQztBQUNILFlBQUksV0FBVyxHQUFHLENBQUMsQ0FBQztBQUNwQixZQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsVUFBUyxLQUFLLEVBQUM7QUFDckMsdUJBQVcsSUFBSSxLQUFLLENBQUMsS0FBSyxHQUFHLEVBQUUsQ0FBQztTQUNuQyxDQUFDLENBQUM7QUFDSCxlQUNJOztjQUFLLEVBQUUsRUFBQyxLQUFLLEVBQUMsV0FBVyxFQUFFLElBQUksQ0FBQyxlQUFlLEFBQUMsRUFBQyxTQUFTLEVBQUUsSUFBSSxDQUFDLGFBQWEsQUFBQyxFQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsZ0JBQWdCLEFBQUMsRUFBQyxVQUFVLEVBQUUsSUFBSSxDQUFDLGNBQWMsQUFBQztZQUMzSSw2Q0FBUSxLQUFLLEVBQUUsV0FBVyxBQUFDLEVBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxBQUFDLEVBQUMsV0FBVyxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsV0FBVyxBQUFDLEVBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxRQUFRLEFBQUMsRUFBQyxHQUFHLEVBQUMsUUFBUSxFQUFDLGdCQUFnQixFQUFFLElBQUksQ0FBQyxnQkFBZ0IsQUFBQyxFQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsUUFBUSxBQUFDLEVBQUMsV0FBVyxFQUFFLElBQUksQ0FBQyxXQUFXLEFBQUMsRUFBQyxXQUFXLEVBQUUsSUFBSSxDQUFDLFdBQVcsQUFBQyxHQUFVO1lBQzNRLDZCQUFLLFNBQVMsRUFBQyxPQUFPLEdBQU87WUFDN0I7O2tCQUFLLEVBQUUsRUFBQyxrQkFBa0IsRUFBQyxTQUFTLEVBQUUsbUJBQW1CLElBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxZQUFZLEdBQUcsUUFBUSxHQUFHLFFBQVEsQ0FBQSxBQUFDLEFBQUM7Z0JBQ3hHOztzQkFBSyxFQUFFLEVBQUMsUUFBUTtvQkFDWjs7MEJBQUssRUFBRSxFQUFDLGVBQWUsRUFBQyxLQUFLLEVBQUUsRUFBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLEVBQUMsQUFBQzt3QkFDckQ7OzhCQUFRLEVBQUUsRUFBQyxvQkFBb0IsRUFBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLElBQUksQUFBQyxFQUFDLEtBQUssRUFBRSxFQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sR0FBQyxDQUFDLEVBQUMsQUFBQzs7eUJBQWM7d0JBQ3BHOzs4QkFBUSxFQUFFLEVBQUMsb0JBQW9CLEVBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxJQUFJLEFBQUMsRUFBQyxLQUFLLEVBQUUsRUFBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLEdBQUMsQ0FBQyxFQUFDLEFBQUM7O3lCQUFjO3dCQUNwRzs7OEJBQUssRUFBRSxFQUFDLDhCQUE4QixFQUFDLEtBQUssRUFBRSxFQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sRUFBRSxLQUFLLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLEVBQUMsQUFBQzs0QkFDL0YsNkJBQUssRUFBRSxFQUFDLG9CQUFvQixFQUFDLFNBQVMsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLFNBQVMsR0FBQywwQkFBMEIsR0FBQyxFQUFFLEFBQUMsRUFBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLElBQUksQUFBQyxFQUFDLEtBQUssRUFBRSxFQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sR0FBQyxDQUFDLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxHQUFDLENBQUMsRUFBQyxBQUFDLEdBQU87eUJBQ2pMO3dCQUNOLGdDQUFRLEVBQUUsRUFBQyxlQUFlLEVBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxBQUFDLEVBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxBQUFDLEdBQVU7cUJBQ3RGO29CQUNOOzswQkFBSyxFQUFFLEVBQUMsZUFBZSxFQUFDLEtBQUssRUFBRSxFQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssRUFBQyxBQUFDO3dCQUNyRDs7Ozs0QkFBZTs7a0NBQVEsR0FBRyxFQUFDLGNBQWMsRUFBQyxFQUFFLEVBQUMsZUFBZSxFQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsWUFBWSxBQUFDO2dDQUFFLE9BQU87NkJBQVU7eUJBQVE7d0JBQ3BIOzs7OzRCQUFpQiwrQkFBTyxHQUFHLEVBQUMsZUFBZSxFQUFDLElBQUksRUFBQyxRQUFRLEVBQUMsRUFBRSxFQUFDLGdCQUFnQixFQUFDLEdBQUcsRUFBQyxLQUFLLEVBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxjQUFjLEFBQUMsRUFBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLEFBQUMsR0FBUzt5QkFBUTt3QkFDbks7Ozs7NEJBQTZCLCtCQUFPLEdBQUcsRUFBQyxlQUFlLEVBQUMsSUFBSSxFQUFDLFFBQVEsRUFBQyxFQUFFLEVBQUMsZ0JBQWdCLEVBQUMsR0FBRyxFQUFDLEdBQUcsRUFBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLGNBQWMsQUFBQyxFQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsQUFBQyxHQUFTO3lCQUFRO3dCQUM3Szs7OEJBQUssRUFBRSxFQUFDLGVBQWU7NEJBQ2xCLE1BQU07eUJBQ0w7cUJBQ0o7aUJBQ0o7YUFDSjtZQUNOOztrQkFBUSxFQUFFLEVBQUMsZ0JBQWdCLEVBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxhQUFhLEFBQUM7O2FBQWlCO1lBQ3pFOztrQkFBUSxFQUFFLEVBQUMsYUFBYSxFQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsSUFBSSxBQUFDOzthQUFjO1NBQ3hELENBQ1I7S0FDTDtDQUNKLENBQUMsQ0FBQzs7cUJBRVksR0FBRzs7Ozs7Ozs7Ozs7O3dCQ3hTQyxhQUFhOzs7O0FBRWhDLElBQUksTUFBTSxHQUFHLEtBQUssQ0FBQyxXQUFXLENBQUM7OztBQUMzQixVQUFNLEVBQUUsa0JBQVc7QUFDZixlQUNJOztjQUFLLEVBQUUsRUFBQyxRQUFRLEVBQUMsS0FBSyxFQUFFLEVBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxFQUFDLEFBQUM7WUFDOUMsNkNBQVEsTUFBTSxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxBQUFDLEVBQUMsV0FBVyxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsV0FBVyxBQUFDLEVBQUMsR0FBRyxFQUFDLFFBQVEsRUFBQyxnQkFBZ0IsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLGdCQUFnQixBQUFDLEVBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxBQUFDLEVBQUMsV0FBVyxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsV0FBVyxBQUFDLEVBQUMsV0FBVyxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsV0FBVyxBQUFDLEdBQVU7U0FDcFAsQ0FDVDtLQUNKO0NBQ0osQ0FBQyxDQUFDOztxQkFFWSxNQUFNOzs7Ozs7Ozs7QUNackIsSUFBSSxLQUFLLEdBQUcsS0FBSyxDQUFDLFdBQVcsQ0FBQzs7O0FBQzFCLG1CQUFlLEVBQUUsMkJBQVc7QUFDeEIsZUFBTztBQUNILHVCQUFXLEVBQUUsS0FBSztTQUNyQixDQUFBO0tBQ0o7QUFDRCxtQkFBZSxFQUFFLHlCQUFTLENBQUMsRUFBRTtBQUN6QixZQUFJLENBQUMsS0FBSyxDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUM7S0FDakQ7QUFDRCxxQkFBaUIsRUFBRSw2QkFBVzs7QUFDMUIsWUFBSSxDQUFDLEtBQUssQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQztLQUM1QztBQUNELFVBQU0sRUFBRSxrQkFBVztBQUNmLGVBQ0ksNkJBQUssU0FBUyxFQUFFLG9CQUFvQixJQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxHQUFHLFNBQVMsR0FBRyxFQUFFLENBQUEsQUFBQyxBQUFDLEVBQUMsS0FBSyxFQUM1RTtBQUNJLG9CQUFJLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO0FBQ2xCLG1CQUFHLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO2FBQ3BCLEFBQ0osRUFBQyxXQUFXLEVBQUUsSUFBSSxDQUFDLGVBQWUsQUFBQyxFQUFDLGFBQWEsRUFBRSxJQUFJLENBQUMsaUJBQWlCLEFBQUMsRUFBQyxXQUFXLEVBQUUsVUFBUyxDQUFDLEVBQUM7QUFBQyxpQkFBQyxDQUFDLGNBQWMsRUFBRSxDQUFDO2FBQUMsQUFBQyxHQUFPLENBQ3hJO0tBQ0o7Q0FDSixDQUFDLENBQUM7O3FCQUVZLEtBQUs7Ozs7Ozs7Ozs7Ozt1QkN4QkYsWUFBWTs7OztBQUU5QixJQUFJLE1BQU0sR0FBRyxLQUFLLENBQUMsV0FBVyxDQUFDOzs7QUFDM0Isb0JBQWdCLEVBQUUsMEJBQVMsS0FBSyxFQUFFOztBQUM5QixZQUFJLElBQUksR0FBRyxLQUFLLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMscUJBQXFCLEVBQUUsQ0FBQztBQUNwRSxZQUFJLENBQUMsS0FBSyxDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxFQUFFLEtBQUssRUFBRSxJQUFJLENBQUMsQ0FBQztLQUM5RDtBQUNELGVBQVcsRUFBRSxxQkFBUyxDQUFDLEVBQUU7O0FBQ3JCLFlBQUcsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxTQUFTLEtBQUcsb0JBQW9CLEVBQUU7O0FBQzFDLGdCQUFJLElBQUksR0FBRyxDQUFDLENBQUMsTUFBTSxDQUFDLHFCQUFxQixFQUFFLENBQUM7QUFDNUMsZ0JBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxFQUFFLEVBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUMsQ0FBQyxDQUFDO0FBQ25ILG1CQUFPLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDO1NBQ3RCO0tBQ0o7QUFDRCxlQUFXLEVBQUUscUJBQVMsS0FBSyxFQUFFOztBQUN6QixZQUFJLENBQUMsS0FBSyxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsQ0FBQztLQUNuRDtBQUNELFVBQU0sRUFBRSxrQkFBVzs7O0FBQ2YsWUFBSSxNQUFNLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLFVBQUMsS0FBSyxFQUFFLEtBQUssRUFBSztBQUNqRCxtQkFBUSw0Q0FBTyxHQUFHLEVBQUUsU0FBUyxHQUFHLE1BQUssS0FBSyxDQUFDLEtBQUssR0FBRyxHQUFHLEdBQUcsS0FBSyxBQUFDLEVBQUMsUUFBUSxFQUFHLE1BQUssS0FBSyxDQUFDLFdBQVcsS0FBSyxLQUFLLEFBQUUsRUFBQyxLQUFLLEVBQUUsS0FBSyxBQUFDLEVBQUMsQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDLEFBQUMsRUFBQyxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUMsQUFBQyxFQUFDLGdCQUFnQixFQUFFLE1BQUssZ0JBQWdCLEFBQUMsRUFBQyxXQUFXLEVBQUUsTUFBSyxXQUFXLEFBQUMsR0FBUyxDQUFDO1NBQ3hPLENBQUMsQ0FBQztBQUNILFlBQUksS0FBSyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxVQUFDLElBQUksRUFBSzs7QUFDdkMsZ0JBQUksQ0FBQyxHQUFHLE1BQUssS0FBSyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNuQyxnQkFBSSxDQUFDLEdBQUcsTUFBSyxLQUFLLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ25DLGdCQUFJLENBQUMsR0FBRyxNQUFLLEtBQUssQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDbkMsZ0JBQUksSUFBSSxHQUFHLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQztBQUN6RixtQkFBUSw4QkFBTSxNQUFNLEVBQUMsaUJBQWlCLEVBQUMsSUFBSSxFQUFDLE1BQU0sRUFBQyxDQUFDLEVBQUUsSUFBSSxBQUFDLEdBQVEsQ0FBRTtTQUN4RSxDQUFDLENBQUM7QUFDSCxlQUNJOztjQUFLLEdBQUcsRUFBQyxLQUFLLEVBQUMsU0FBUyxFQUFDLCtCQUErQixFQUFDLFdBQVcsRUFBRSxJQUFJLENBQUMsZUFBZSxBQUFDLEVBQUMsU0FBUyxFQUFFLElBQUksQ0FBQyxhQUFhLEFBQUMsRUFBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLFdBQVcsQUFBQyxFQUFDLEtBQUssRUFBRSxFQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssRUFBRSxNQUFNLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLEVBQUMsQUFBQztZQUM3TSxNQUFNO1lBQ1A7O2tCQUFLLE9BQU8sRUFBRSxNQUFNLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLEdBQUcsR0FBRyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxBQUFDO2dCQUM3RCxLQUFLO2FBQ0o7U0FDSixDQUNSO0tBQ0w7Q0FDSixDQUFDLENBQUM7O3FCQUVZLE1BQU07Ozs7Ozs7Ozs7Ozt3QkN2Q0YsYUFBYTs7OztBQUVoQyxJQUFJLEtBQUssR0FBRyxLQUFLLENBQUMsV0FBVyxDQUFDOzs7QUFDMUIsZUFBVyxFQUFFLHVCQUFXOztBQUNwQixZQUFJLENBQUMsS0FBSyxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDO0tBQzVDO0FBQ0QsaUJBQWEsRUFBRSx5QkFBVzs7QUFDdEIsZUFBTyxJQUFJLENBQUMsU0FBUyxDQUFDO0FBQ2xCLGtCQUFNLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsTUFBTTtBQUMvQixpQkFBSyxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLEtBQUs7U0FDaEMsQ0FBQyxDQUFDO0tBQ047QUFDRCxVQUFNLEVBQUUsa0JBQVc7QUFDZixlQUNJOztjQUFLLFNBQVMsRUFBQyx3QkFBd0IsRUFBQyxLQUFLLEVBQUUsRUFBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsS0FBSyxFQUFDLEFBQUM7WUFDM0UsNkNBQVEsS0FBSyxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxBQUFDLEVBQUMsV0FBVyxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsV0FBVyxBQUFDLEVBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxLQUFLLEdBQUcsQ0FBQyxBQUFDLEVBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxNQUFNLEdBQUcsQ0FBQyxBQUFDO0FBQ3hMLHNCQUFNLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLE1BQU0sR0FBRyxFQUFFLEFBQUM7QUFDL0QscUJBQUssRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsS0FBSyxHQUFHLEVBQUUsQUFBQztBQUM1RCxnQ0FBZ0IsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLGdCQUFnQixBQUFDLEVBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxBQUFDLEVBQUMsV0FBVyxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsV0FBVyxBQUFDLEdBQVU7WUFDcEksNkJBQUssR0FBRyxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLEdBQUcsQUFBQyxFQUFDLEdBQUcsRUFBQyxLQUFLLEdBQU87WUFDaEQsa0NBQVUsU0FBUyxFQUFDLG1CQUFtQixFQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsYUFBYSxFQUFFLEFBQUMsRUFBQyxRQUFRLE1BQUEsR0FBWTtZQUN6Rjs7a0JBQVEsU0FBUyxFQUFDLDRCQUE0QixFQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsV0FBVyxBQUFDOzthQUFXO1NBQ2xGLENBQ1I7S0FDTDtDQUNKLENBQUMsQ0FBQzs7cUJBRVksS0FBSzs7Ozs7Ozs7Ozs7O3VCQzNCRixZQUFZOzs7O0FBRTlCLElBQUksTUFBTSxHQUFHLEtBQUssQ0FBQyxXQUFXLENBQUM7OztBQUMzQixVQUFNLEVBQUUsa0JBQVc7OztBQUNmLFlBQUksTUFBTSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxVQUFDLEtBQUssRUFBRSxLQUFLLEVBQUs7QUFDakQsbUJBQ0ksNENBQU8sR0FBRyxFQUFFLE9BQU8sR0FBQyxLQUFLLEFBQUMsRUFBQyxHQUFHLEVBQUUsa0JBQWtCLEdBQUcsS0FBSyxBQUFDLEVBQUMsS0FBSyxFQUFFLEtBQUssQUFBQyxFQUFDLEtBQUssRUFBRSxLQUFLLEFBQUMsRUFBQyxXQUFXLEVBQUUsTUFBSyxLQUFLLENBQUMsV0FBVyxBQUFDLEVBQUMsZ0JBQWdCLEVBQUUsTUFBSyxLQUFLLENBQUMsZ0JBQWdCLEFBQUMsRUFBQyxRQUFRLEVBQUUsTUFBSyxLQUFLLENBQUMsUUFBUSxBQUFDLEVBQUMsV0FBVyxFQUFFLE1BQUssS0FBSyxDQUFDLFdBQVcsQUFBQyxFQUFDLFdBQVcsRUFBRSxNQUFLLEtBQUssQ0FBQyxXQUFXLEFBQUMsR0FBUyxDQUMvUjtTQUNMLENBQUMsQ0FBQztBQUNILGVBQ0k7O2NBQUssRUFBRSxFQUFDLGVBQWU7WUFDbEIsTUFBTTtTQUNMLENBQ1I7S0FDTDtDQUNKLENBQUMsQ0FBQzs7cUJBRVksTUFBTTs7Ozs7Ozs7O0FDakJyQixJQUFJLGVBQWUsR0FBRzs7QUFFbEIsVUFBTSxFQUFFLGdCQUFVLENBQUMsRUFBRTtBQUFFLGVBQU8sQ0FBQyxDQUFBO0tBQUU7O0FBRWpDLGNBQVUsRUFBRSxvQkFBVSxDQUFDLEVBQUU7QUFBRSxlQUFPLENBQUMsR0FBQyxDQUFDLENBQUE7S0FBRTs7QUFFdkMsZUFBVyxFQUFFLHFCQUFVLENBQUMsRUFBRTtBQUFFLGVBQU8sQ0FBQyxJQUFFLENBQUMsR0FBQyxDQUFDLENBQUEsQUFBQyxDQUFBO0tBQUU7O0FBRTVDLGlCQUFhLEVBQUUsdUJBQVUsQ0FBQyxFQUFFO0FBQUUsZUFBTyxDQUFDLEdBQUMsR0FBRSxHQUFHLENBQUMsR0FBQyxDQUFDLEdBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFDLENBQUMsQ0FBQyxHQUFDLENBQUMsR0FBQyxDQUFDLENBQUEsR0FBRSxDQUFDLENBQUE7S0FBRTs7QUFFbEUsZUFBVyxFQUFFLHFCQUFVLENBQUMsRUFBRTtBQUFFLGVBQU8sQ0FBQyxHQUFDLENBQUMsR0FBQyxDQUFDLENBQUE7S0FBRTs7QUFFMUMsZ0JBQVksRUFBRSxzQkFBVSxDQUFDLEVBQUU7QUFBRSxlQUFPLEFBQUMsRUFBRSxDQUFDLEdBQUUsQ0FBQyxHQUFDLENBQUMsR0FBQyxDQUFDLENBQUE7S0FBRTs7QUFFakQsa0JBQWMsRUFBRSx3QkFBVSxDQUFDLEVBQUU7QUFBRSxlQUFPLENBQUMsR0FBQyxHQUFFLEdBQUcsQ0FBQyxHQUFDLENBQUMsR0FBQyxDQUFDLEdBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFDLENBQUMsQ0FBQSxJQUFHLENBQUMsR0FBQyxDQUFDLEdBQUMsQ0FBQyxDQUFBLEFBQUMsSUFBRSxDQUFDLEdBQUMsQ0FBQyxHQUFDLENBQUMsQ0FBQSxBQUFDLEdBQUMsQ0FBQyxDQUFBO0tBQUU7O0FBRWhGLGVBQVcsRUFBRSxxQkFBVSxDQUFDLEVBQUU7QUFBRSxlQUFPLENBQUMsR0FBQyxDQUFDLEdBQUMsQ0FBQyxHQUFDLENBQUMsQ0FBQTtLQUFFOztBQUU1QyxnQkFBWSxFQUFFLHNCQUFVLENBQUMsRUFBRTtBQUFFLGVBQU8sQ0FBQyxHQUFDLEFBQUMsRUFBRSxDQUFDLEdBQUUsQ0FBQyxHQUFDLENBQUMsR0FBQyxDQUFDLENBQUE7S0FBRTs7QUFFbkQsa0JBQWMsRUFBRSx3QkFBVSxDQUFDLEVBQUU7QUFBRSxlQUFPLENBQUMsR0FBQyxHQUFFLEdBQUcsQ0FBQyxHQUFDLENBQUMsR0FBQyxDQUFDLEdBQUMsQ0FBQyxHQUFDLENBQUMsR0FBRyxDQUFDLEdBQUMsQ0FBQyxHQUFFLEVBQUUsQ0FBQyxBQUFDLEdBQUMsQ0FBQyxHQUFDLENBQUMsR0FBQyxDQUFDLENBQUE7S0FBRTs7QUFFMUUsZUFBVyxFQUFFLHFCQUFVLENBQUMsRUFBRTtBQUFFLGVBQU8sQ0FBQyxHQUFDLENBQUMsR0FBQyxDQUFDLEdBQUMsQ0FBQyxHQUFDLENBQUMsQ0FBQTtLQUFFOztBQUU5QyxnQkFBWSxFQUFFLHNCQUFVLENBQUMsRUFBRTtBQUFFLGVBQU8sQ0FBQyxHQUFDLEFBQUMsRUFBRSxDQUFDLEdBQUUsQ0FBQyxHQUFDLENBQUMsR0FBQyxDQUFDLEdBQUMsQ0FBQyxDQUFBO0tBQUU7O0FBRXJELGtCQUFjLEVBQUUsd0JBQVUsQ0FBQyxFQUFFO0FBQUUsZUFBTyxDQUFDLEdBQUMsR0FBRSxHQUFHLEVBQUUsR0FBQyxDQUFDLEdBQUMsQ0FBQyxHQUFDLENBQUMsR0FBQyxDQUFDLEdBQUMsQ0FBQyxHQUFHLENBQUMsR0FBQyxFQUFFLEdBQUUsRUFBRSxDQUFDLEFBQUMsR0FBQyxDQUFDLEdBQUMsQ0FBQyxHQUFDLENBQUMsR0FBQyxDQUFDLENBQUE7S0FBRTtDQUNuRixDQUFDOztxQkFFYSxlQUFlIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsImltcG9ydCBBcHAgZnJvbSAnLi9BcHAuanMnO1xuXG5SZWFjdC5yZW5kZXIoXG4gICAgPEFwcD48L0FwcD4sXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2FwcC1jb250YWluZXInKVxuKTsiLCJpbXBvcnQgRWFzaW5nRnVuY3Rpb25zIGZyb20gJy4vZWFzaW5nLmpzJztcbmltcG9ydCBFZGl0b3IgZnJvbSAnLi9FZGl0b3IuanMnO1xuXG4vL+ODhuOCueODiOeUqFxuLy9pbXBvcnQgdGVzdEpTT04gZnJvbSAnLi8uLi8uLi9idWlsZC9qcy90ZXN0LmpzJztcblxudmFyIHN0YWdlLCBtcztcblxudmFyIEFwcCA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcbiAgICBnZXRJbml0aWFsU3RhdGU6IGZ1bmN0aW9uKCkge1xuICAgICAgICBpZihsb2NhbFN0b3JhZ2Uuc3RhdGUpe1xuICAgICAgICAgICAgcmV0dXJuIEpTT04ucGFyc2UobG9jYWxTdG9yYWdlLnN0YXRlKTtcbiAgICAgICAgfSBlbHNlIHtcblxuICAgICAgICAgICAgLy/jg4bjgrnjg4jnlKgtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgICAgICAgICAvL2xvY2FsU3RvcmFnZS5zdGF0ZSA9IEpTT04uc3RyaW5naWZ5KHRlc3RKU09OKTtcbiAgICAgICAgICAgIC8vcmV0dXJuIHRlc3RKU09OO1xuICAgICAgICAgICAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIHNsaWRlczogW10sXG4gICAgICAgICAgICAgICAgbW92aW5nUG9pbnQ6IC0xLFxuICAgICAgICAgICAgICAgIGVkaXRpbmdTbGlkZTogLTEsXG4gICAgICAgICAgICAgICAgbW92aW5nUG9pbnRSZWN0OiBudWxsLFxuICAgICAgICAgICAgICAgIGJhc2VJbmRleDogMCwvL+Wfuua6lueUu+WDj1xuICAgICAgICAgICAgICAgIHdpZHRoOiAwLFxuICAgICAgICAgICAgICAgIGhlaWdodDogMCxcbiAgICAgICAgICAgICAgICB0cmFuc2Zvcm1FYXNpbmc6IFwibGluZWFyXCIsXG4gICAgICAgICAgICAgICAgYWxwaGFFYXNpbmc6IFwibGluZWFyXCIsXG4gICAgICAgICAgICAgICAgZHVyYXRpb246IDIwMCxcbiAgICAgICAgICAgICAgICBpbnRlcnZhbDogMTAwMCxcbiAgICAgICAgICAgICAgICBpbmRleDogMCxcbiAgICAgICAgICAgICAgICBpc1BsYXlpbmc6IGZhbHNlXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9LFxuICAgIGNvbXBvbmVudERpZE1vdW50OiBmdW5jdGlvbigpIHtcbiAgICAgICAgbXMgPSBuZXcgTW9ycGhpbmdTbGlkZXIoXCJ2aWV3ZXItY2FudmFzXCIpO1xuICAgIH0sXG4gICAgaGFuZGxlRmlsZVNlbGVjdDogZnVuY3Rpb24oZXZ0KSB7XG4gICAgICAgIGV2dC5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgZXZ0LnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICAgICAgY29uc29sZS5sb2coZXZ0KTtcbiAgICAgICAgdmFyIGZpbGVzID0gZXZ0LmRhdGFUcmFuc2Zlci5maWxlczsgLy8gRmlsZUxpc3Qgb2JqZWN0XG4gICAgICAgIGNvbnNvbGUubG9nKGZpbGVzKTtcblxuICAgICAgICAvLyBMb29wIHRocm91Z2ggdGhlIEZpbGVMaXN0IGFuZCByZW5kZXIgc2xpZGUgZmlsZXMgYXMgdGh1bWJuYWlscy5cbiAgICAgICAgZm9yICh2YXIgaSA9IDAsIGZpbGU7IGZpbGUgPSBmaWxlc1tpXTsgaSsrKSB7XG5cbiAgICAgICAgICAgIC8vIE9ubHkgcHJvY2VzcyBzbGlkZSBmaWxlcy5cbiAgICAgICAgICAgIGlmICghZmlsZS50eXBlLm1hdGNoKCdpbWFnZS4qJykpIHtcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdmFyIHJlYWRlciA9IG5ldyBGaWxlUmVhZGVyKCk7XG5cbiAgICAgICAgICAgIC8vIENsb3N1cmUgdG8gY2FwdHVyZSB0aGUgZmlsZSBpbmZvcm1hdGlvbi5cbiAgICAgICAgICAgIHJlYWRlci5vbmxvYWQgPSAoZSkgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGUpO1xuICAgICAgICAgICAgICAgIHRoaXMuYWRkU2xpZGUoZS50YXJnZXQucmVzdWx0KTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gUmVhZCBpbiB0aGUgc2xpZGUgZmlsZSBhcyBhIGRhdGEgVVJMLlxuICAgICAgICAgICAgcmVhZGVyLnJlYWRBc0RhdGFVUkwoZmlsZSk7XG4gICAgICAgIH1cbiAgICB9LFxuICAgIGhhbmRsZURyYWdPdmVyOiBmdW5jdGlvbihldnQpIHtcbiAgICAgICAgZXZ0LnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICBldnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgZXZ0LmRhdGFUcmFuc2Zlci5kcm9wRWZmZWN0ID0gJ2NvcHknOyAvLyBFeHBsaWNpdGx5IHNob3cgdGhpcyBpcyBhIGNvcHkuXG4gICAgfSxcbiAgICBhZGRTbGlkZTogZnVuY3Rpb24oZGF0YVVSTCkge1xuICAgICAgICB2YXIgbmV3U2xpZGUgPSB7XG4gICAgICAgICAgICBzcmM6IGRhdGFVUkwsXG4gICAgICAgICAgICBpbmRleDogdGhpcy5zdGF0ZS5zbGlkZXMubGVuZ3RoXG4gICAgICAgIH07XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe3NsaWRlczogdGhpcy5zdGF0ZS5zbGlkZXMuY29uY2F0KFtuZXdTbGlkZV0pfSwgKCkgPT4ge1xuICAgICAgICAgICAgdmFyIHNsaWRlRE9NID0gUmVhY3QuZmluZERPTU5vZGUodGhpcy5yZWZzLmVkaXRvci5yZWZzLnNsaWRlcy5yZWZzW1wiU2xpZGVcIiArIG5ld1NsaWRlLmluZGV4XS5yZWZzLmltZyk7Ly9SZWFjdOOBq+OCiOOCiuODrOODs+ODgOODvOa4iOOBv+OBrkRPTVxuICAgICAgICAgICAgdmFyIHdpZHRoID0gc2xpZGVET00ud2lkdGgsIGhlaWdodCA9IHNsaWRlRE9NLmhlaWdodDtcbiAgICAgICAgICAgIHZhciBwb2ludHMsIGZhY2VzO1xuICAgICAgICAgICAgaWYobmV3U2xpZGUuaW5kZXg+MCl7XG4gICAgICAgICAgICAgICAgcG9pbnRzID0gdGhpcy5zdGF0ZS5zbGlkZXNbdGhpcy5zdGF0ZS5iYXNlSW5kZXhdLnBvaW50cy5jb25jYXQoKTsgLy/ln7rmupbnlLvlg4/jga7nianjgpLjgrPjg5Tjg7xcbiAgICAgICAgICAgICAgICBmYWNlcyA9IHRoaXMuc3RhdGUuc2xpZGVzW3RoaXMuc3RhdGUuYmFzZUluZGV4XS5mYWNlcy5jb25jYXQoKTsgLy/ln7rmupbnlLvlg4/jga7nianjgpLjgrPjg5Tjg7xcbiAgICAgICAgICAgIH0gZWxzZSB7Ly/liJ3mnJ/oqK3lrppcbiAgICAgICAgICAgICAgICBwb2ludHMgPSBbXG4gICAgICAgICAgICAgICAgICAgIHt4OjAsIHk6MH0sIHt4OndpZHRoLCB5OjB9LCB7eDp3aWR0aCwgeTpoZWlnaHR9LCB7eDowLCB5OmhlaWdodH0sIHt4OndpZHRoLzIsIHk6aGVpZ2h0LzJ9XG4gICAgICAgICAgICAgICAgXTtcbiAgICAgICAgICAgICAgICBmYWNlcyA9IFtbMCwgMSwgNF0sIFsxLCAyLCA0XSwgWzIsIDMsIDRdLCBbMywgNCwgMF1dO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdmFyIHNsaWRlcyA9IHRoaXMuc3RhdGUuc2xpZGVzLmNvbmNhdCgpO1xuICAgICAgICAgICAgc2xpZGVzW25ld1NsaWRlLmluZGV4XS5wb2ludHMgPSBwb2ludHM7XG4gICAgICAgICAgICBzbGlkZXNbbmV3U2xpZGUuaW5kZXhdLmZhY2VzID0gZmFjZXM7XG4gICAgICAgICAgICBzbGlkZXNbbmV3U2xpZGUuaW5kZXhdLndpZHRoID0gd2lkdGg7XG4gICAgICAgICAgICBzbGlkZXNbbmV3U2xpZGUuaW5kZXhdLmhlaWdodCA9IGhlaWdodDtcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe3NsaWRlczogc2xpZGVzfSk7XG4gICAgICAgIH0pO1xuICAgIH0sXG4gICAgaGFuZGxlTW91c2VNb3ZlOiBmdW5jdGlvbihlKSB7XG4gICAgICAgIGlmKHRoaXMuc3RhdGUubW92aW5nUG9pbnQ+PTApe1xuICAgICAgICAgICAgdmFyIHJlY3QgPSB0aGlzLnN0YXRlLm1vdmluZ1BvaW50UmVjdCxcbiAgICAgICAgICAgICAgICB4ID0gTWF0aC5yb3VuZChlLmNsaWVudFggLSByZWN0LmxlZnQpLFxuICAgICAgICAgICAgICAgIHkgPSBNYXRoLnJvdW5kKGUuY2xpZW50WSAtIHJlY3QudG9wKTtcblxuICAgICAgICAgICAgLy/jga/jgb/lh7rjgarjgYTjgojjgYbjgatcbiAgICAgICAgICAgIHggPSB4IDwgMCA/IDAgOiB4O1xuICAgICAgICAgICAgeCA9IHggPiByZWN0LndpZHRoID8gcmVjdC53aWR0aCA6IHg7XG4gICAgICAgICAgICB5ID0geSA8IDAgPyAwIDogeTtcbiAgICAgICAgICAgIHkgPSB5ID4gcmVjdC5oZWlnaHQgPyByZWN0LmhlaWdodCA6IHk7XG5cbiAgICAgICAgICAgIHRoaXMubW92ZVBvaW50KHt4OiB4LCB5OiB5fSk7XG4gICAgICAgIH1cbiAgICB9LFxuICAgIGhhbmRsZU1vdXNlVXA6IGZ1bmN0aW9uKCkge1xuICAgICAgICBpZih0aGlzLnN0YXRlLmVkaXRpbmdTbGlkZT4tMSkge1xuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7ZWRpdGluZ1NsaWRlOiAtMSwgbW92aW5nUG9pbnQ6IC0xfSk7XG4gICAgICAgIH1cbiAgICB9LFxuICAgIG1vdmVQb2ludDogZnVuY3Rpb24ocG9pbnQpIHtcbiAgICAgICAgdmFyIHNsaWRlcyA9IHRoaXMuc3RhdGUuc2xpZGVzLmNvbmNhdCgpO1xuICAgICAgICBzbGlkZXNbdGhpcy5zdGF0ZS5lZGl0aW5nU2xpZGVdLnBvaW50c1t0aGlzLnN0YXRlLm1vdmluZ1BvaW50XSA9IHBvaW50O1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtzbGlkZXM6IHNsaWRlc30pO1xuICAgIH0sXG4gICAgc3RhcnRNb3ZpbmdQb2ludDogZnVuY3Rpb24oZWRpdGluZ1NsaWRlLCBtb3ZpbmdQb2ludCwgbW92aW5nUG9pbnRSZWN0KSB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe2VkaXRpbmdTbGlkZTogZWRpdGluZ1NsaWRlLCBtb3ZpbmdQb2ludDogbW92aW5nUG9pbnQsIG1vdmluZ1BvaW50UmVjdDogbW92aW5nUG9pbnRSZWN0fSk7XG4gICAgfSxcbiAgICBhZGRQb2ludDogZnVuY3Rpb24oaW5kZXgsIHBvaW50KXtcbiAgICAgICAgY29uc29sZS5sb2coaW5kZXgpO1xuICAgICAgICBpZihpbmRleD09PXRoaXMuc3RhdGUuYmFzZUluZGV4KSB7Ly/ln7rmupbnlLvlg4/jgarjgolQb2ludOi/veWKoFxuICAgICAgICAgICAgdmFyIHNsaWRlcyA9IHRoaXMuc3RhdGUuc2xpZGVzLmNvbmNhdCgpO1xuICAgICAgICAgICAgdmFyIGJhc2VTbGlkZSA9IHNsaWRlc1t0aGlzLnN0YXRlLmJhc2VJbmRleF07XG4gICAgICAgICAgICBiYXNlU2xpZGUucG9pbnRzLnB1c2gocG9pbnQpO1xuICAgICAgICAgICAgYmFzZVNsaWRlLmZhY2VzID0gdGhpcy5jcmVhdGVGYWNlcyhiYXNlU2xpZGUucG9pbnRzKTsvL2ZhY2Vz44KS5L2c44KK55u044GZXG4gICAgICAgICAgICBzbGlkZXMuZm9yRWFjaCgoc2xpZGUsIGluZGV4KSA9PiB7Ly/ku5bjga5zbGlkZeOBq+OCgnBvaW5044GoZmFjZeOCkui/veWKoFxuICAgICAgICAgICAgICAgIGlmICh0aGlzLnN0YXRlLmJhc2VJbmRleCAhPT0gaW5kZXgpIHtcbiAgICAgICAgICAgICAgICAgICAgc2xpZGVzW2luZGV4XS5wb2ludHMucHVzaCh7eDogcG9pbnQueCwgeTogcG9pbnQueX0pO1xuICAgICAgICAgICAgICAgICAgICBzbGlkZXNbaW5kZXhdLmZhY2VzID0gYmFzZVNsaWRlLmZhY2VzO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7c2xpZGVzOiBzbGlkZXN9KTtcbiAgICAgICAgfVxuICAgIH0sXG4gICAgcmVtb3ZlUG9pbnQ6IGZ1bmN0aW9uKHNsaWRlSW5kZXgsIHBvaW50SW5kZXgpIHsvL1BvaW5044Gu5YmK6ZmkXG4gICAgICAgIGlmKHNsaWRlSW5kZXggPT09IHRoaXMuc3RhdGUuYmFzZUluZGV4KSB7Ly/ln7rmupbnlLvlg4/jgarjgonliYrpmaRcbiAgICAgICAgICAgIHZhciBzbGlkZXMgPSB0aGlzLnN0YXRlLnNsaWRlcy5jb25jYXQoKTtcbiAgICAgICAgICAgIHZhciBiYXNlU2xpZGUgPSBzbGlkZXNbdGhpcy5zdGF0ZS5iYXNlSW5kZXhdO1xuICAgICAgICAgICAgYmFzZVNsaWRlLnBvaW50cy5zcGxpY2UocG9pbnRJbmRleCwgMSk7XG4gICAgICAgICAgICBiYXNlU2xpZGUuZmFjZXMgPSB0aGlzLmNyZWF0ZUZhY2VzKGJhc2VTbGlkZS5wb2ludHMpOy8vZmFjZXPjgpLkvZzjgornm7TjgZlcbiAgICAgICAgICAgIHNsaWRlcy5mb3JFYWNoKChzbGlkZSwgaW5kZXgpID0+IHsvL+S7luOBrnNsaWRl44GucG9pbnTjgpLliYrpmaTjgIFmYWNl44KS5pu05pawXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuc3RhdGUuYmFzZUluZGV4ICE9PSBpbmRleCkge1xuICAgICAgICAgICAgICAgICAgICBzbGlkZXNbaW5kZXhdLnBvaW50cy5zcGxpY2UocG9pbnRJbmRleCwgMSk7XG4gICAgICAgICAgICAgICAgICAgIHNsaWRlc1tpbmRleF0uZmFjZXMgPSBiYXNlU2xpZGUuZmFjZXM7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHtzbGlkZXM6IHNsaWRlc30pO1xuICAgICAgICB9XG4gICAgfSxcbiAgICByZW1vdmVTbGlkZTogZnVuY3Rpb24oaW5kZXgpIHtcbiAgICAgICAgdmFyIHNsaWRlcyA9IHRoaXMuc3RhdGUuc2xpZGVzLmNvbmNhdCgpO1xuICAgICAgICBzbGlkZXMuc3BsaWNlKGluZGV4LCAxKTtcblxuICAgICAgICAvLyoqKioq5Z+65rqW55S75YOP44KS5YmK6Zmk44GX44Gf5aC05ZCI44Gu5Yem55CG44GM5b+F6KaBKioqKipcblxuICAgICAgICB0aGlzLnNldFN0YXRlKHtzbGlkZXM6IHNsaWRlc30pO1xuICAgIH0sXG4gICAgY2hhbmdlRWFzaW5nOiBmdW5jdGlvbigpe1xuICAgICAgICB2YXIgc2VsZWN0ID0gUmVhY3QuZmluZERPTU5vZGUodGhpcy5yZWZzLmVhc2luZ1NlbGVjdCk7XG4gICAgICAgIHZhciB2YWx1ZSA9IHNlbGVjdC5vcHRpb25zW3NlbGVjdC5zZWxlY3RlZEluZGV4XS52YWx1ZTtcbiAgICAgICAgbXMuZWFzaW5nID0gdmFsdWU7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe2Vhc2luZzogdmFsdWV9KTtcbiAgICB9LFxuICAgIGNoYW5nZWR1cmF0aW9uOiBmdW5jdGlvbigpe1xuICAgICAgICB2YXIgdmFsdWUgPSBSZWFjdC5maW5kRE9NTm9kZSh0aGlzLnJlZnMuZHVyYXRpb25JbnB1dCkudmFsdWUqMTtcbiAgICAgICAgbXMuZHVyYXRpb24gPSB2YWx1ZTtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7ZHVyYXRpb246IHZhbHVlfSk7XG4gICAgfSxcbiAgICBjaGFuZ2VJbnRlcnZhbDogZnVuY3Rpb24oKXtcbiAgICAgICAgdmFyIHZhbHVlID0gUmVhY3QuZmluZERPTU5vZGUodGhpcy5yZWZzLmludGVydmFsSW5wdXQpLnZhbHVlKjE7XG4gICAgICAgIG1zLmludGVydmFsID0gdmFsdWU7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe2ludGVydmFsOiB2YWx1ZX0pO1xuICAgIH0sXG4gICAgcGxheTogZnVuY3Rpb24oKXtcbiAgICAgICAgaWYodGhpcy5zdGF0ZS5pc1BsYXlpbmcpIHtcbiAgICAgICAgICAgIG1zLnN0b3AoKTtcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe2lzUGxheWluZzogZmFsc2V9KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIG1zLnBsYXkodHJ1ZSwgdGhpcy5zdGF0ZS5pbnRlcnZhbCwgKCkgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe2luZGV4OiBtcy5pbmRleH0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHtpc1BsYXlpbmc6IHRydWV9KTtcbiAgICAgICAgfVxuICAgIH0sXG4gICAgbmV4dDogZnVuY3Rpb24oKXtcbiAgICAgICAgbXMubW9ycGgodHJ1ZSwgKCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7aW5kZXg6bXMuaW5kZXh9KTtcbiAgICAgICAgfSk7XG4gICAgfSxcbiAgICBwcmV2OiBmdW5jdGlvbigpe1xuICAgICAgICBtcy5tb3JwaChmYWxzZSwgKCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7aW5kZXg6bXMuaW5kZXh9KTtcbiAgICAgICAgfSk7XG4gICAgfSxcbiAgICBjcmVhdGVGYWNlczogZnVuY3Rpb24ocG9pbnRzKSB7XG4gICAgICAgIC8v44Oc44Ot44OO44Kk5aSJ5o+b6Zai5pWwXG4gICAgICAgIHZhciB2b3Jvbm9pID0gZDMuZ2VvbS52b3Jvbm9pKClcbiAgICAgICAgICAgIC54KGZ1bmN0aW9uIChkKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGQueFxuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIC55KGZ1bmN0aW9uIChkKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGQueVxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgLy/jg4njg63jg43jg7zluqfmqJnjg4fjg7zjgr/lj5blvpdcbiAgICAgICAgdmFyIGZhY2VzID0gdm9yb25vaS50cmlhbmdsZXMocG9pbnRzKTtcbiAgICAgICAgZmFjZXMuZm9yRWFjaChmdW5jdGlvbihmYWNlLCBpbmRleCl7XG4gICAgICAgICAgICBmYWNlc1tpbmRleF0gPSBbXG4gICAgICAgICAgICAgICAgcG9pbnRzLmluZGV4T2YoZmFjZXNbaW5kZXhdWzBdKSxcbiAgICAgICAgICAgICAgICBwb2ludHMuaW5kZXhPZihmYWNlc1tpbmRleF1bMV0pLFxuICAgICAgICAgICAgICAgIHBvaW50cy5pbmRleE9mKGZhY2VzW2luZGV4XVsyXSlcbiAgICAgICAgICAgIF07XG4gICAgICAgIH0pXG5cbiAgICAgICAgcmV0dXJuIGZhY2VzO1xuICAgIH0sXG4gICAgdG9nZ2xlUHJldmlldzogZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmKCF0aGlzLnN0YXRlLmlzUHJldmlld2luZyl7XG4gICAgICAgICAgICB0aGlzLnByZXZpZXcoKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnNldFN0YXRlKHtpc1ByZXZpZXdpbmc6ICF0aGlzLnN0YXRlLmlzUHJldmlld2luZ30pO1xuICAgIH0sXG4gICAgcHJldmlldzogZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmKCFtcy5pc0FuaW1hdGluZykge1xuICAgICAgICAgICAgbXMuY2xlYXIoKTtcbiAgICAgICAgICAgIHRoaXMuc3RhdGUuc2xpZGVzLmZvckVhY2goKHNsaWRlLCBpbmRleCkgPT4ge1xuICAgICAgICAgICAgICAgIC8vdmFyIHNsaWRlRE9NID0gUmVhY3QuZmluZERPTU5vZGUodGhpcy5yZWZzLmVkaXRvci5yZWZzLnNsaWRlcy5yZWZzW1wiU2xpZGVcIiArIGluZGV4XS5yZWZzLmltZyk7Ly9SZWFjdOOBq+OCiOOCiuODrOODs+ODgOODvOa4iOOBv+OBrkRPTVxuICAgICAgICAgICAgICAgIG1zLmFkZFNsaWRlKHNsaWRlLnNyYywgc2xpZGUsICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7d2lkdGg6IG1zLndpZHRoLCBoZWlnaHQ6IG1zLmhlaWdodH0pO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9LFxuICAgIHNhdmU6IGZ1bmN0aW9uKCkgey8v44Gy44Go44G+44GabG9jYWxTdHJhZ2Xjgavkv53lrZhcbiAgICAgICAgbG9jYWxTdG9yYWdlLnN0YXRlID0gSlNPTi5zdHJpbmdpZnkodGhpcy5zdGF0ZSk7XG4gICAgfSxcbiAgICByZW5kZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgZWFzaW5ncyA9IE9iamVjdC5rZXlzKEVhc2luZ0Z1bmN0aW9ucykubWFwKGZ1bmN0aW9uKG5hbWUpe1xuICAgICAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgICAgICA8b3B0aW9uIHZhbHVlPXtuYW1lfT57bmFtZX08L29wdGlvbj5cbiAgICAgICAgICAgICk7XG4gICAgICAgIH0pO1xuICAgICAgICB2YXIgcG9pbnRzID0gdGhpcy5zdGF0ZS5zbGlkZXMubWFwKChzbGlkZSwgaW5kZXgpID0+IHtcbiAgICAgICAgICAgIGlmKHRoaXMuc3RhdGUuaW5kZXggPT09IGluZGV4KSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ2aWV3ZXItcG9pbnQgdmlld2VyLXBvaW50LW5vd1wiPjwvZGl2PlxuICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ2aWV3ZXItcG9pbnRcIj48L2Rpdj5cbiAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICB2YXIgZWRpdG9yV2lkdGggPSAwO1xuICAgICAgICB0aGlzLnN0YXRlLnNsaWRlcy5mb3JFYWNoKGZ1bmN0aW9uKHNsaWRlKXtcbiAgICAgICAgICAgIGVkaXRvcldpZHRoICs9IHNsaWRlLndpZHRoICsgNDA7XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgPGRpdiBpZD1cImFwcFwiIG9uTW91c2VNb3ZlPXt0aGlzLmhhbmRsZU1vdXNlTW92ZX0gb25Nb3VzZVVwPXt0aGlzLmhhbmRsZU1vdXNlVXB9IG9uRHJvcD17dGhpcy5oYW5kbGVGaWxlU2VsZWN0fSBvbkRyYWdPdmVyPXt0aGlzLmhhbmRsZURyYWdPdmVyfT5cbiAgICAgICAgICAgICAgICA8RWRpdG9yIHdpZHRoPXtlZGl0b3JXaWR0aH0gc2xpZGVzPXt0aGlzLnN0YXRlLnNsaWRlc30gbW92aW5nUG9pbnQ9e3RoaXMuc3RhdGUubW92aW5nUG9pbnR9IGFkZFNsaWRlPXt0aGlzLmFkZFNsaWRlfSByZWY9XCJlZGl0b3JcIiBzdGFydE1vdmluZ1BvaW50PXt0aGlzLnN0YXJ0TW92aW5nUG9pbnR9IGFkZFBvaW50PXt0aGlzLmFkZFBvaW50fSByZW1vdmVQb2ludD17dGhpcy5yZW1vdmVQb2ludH0gcmVtb3ZlU2xpZGU9e3RoaXMucmVtb3ZlU2xpZGV9PjwvRWRpdG9yPlxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiY2xlYXJcIj48L2Rpdj5cbiAgICAgICAgICAgICAgICA8ZGl2IGlkPVwidmlld2VyLWNvbnRhaW5lclwiIGNsYXNzTmFtZT17XCJ2aWV3ZXItY29udGFpbmVyLVwiICsgKHRoaXMuc3RhdGUuaXNQcmV2aWV3aW5nID8gXCJvcGVuZWRcIiA6IFwiY2xvc2VkXCIpfT5cbiAgICAgICAgICAgICAgICAgICAgPGRpdiBpZD1cInZpZXdlclwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBpZD1cInZpZXdlci1zbGlkZXJcIiBzdHlsZT17e3dpZHRoOiB0aGlzLnN0YXRlLndpZHRofX0+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPGJ1dHRvbiBpZD1cInZpZXdlci1uZXh0LWJ1dHRvblwiIG9uQ2xpY2s9e3RoaXMubmV4dH0gc3R5bGU9e3t0b3A6IHRoaXMuc3RhdGUuaGVpZ2h0LzJ9fT5OZXh0PC9idXR0b24+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPGJ1dHRvbiBpZD1cInZpZXdlci1wcmV2LWJ1dHRvblwiIG9uQ2xpY2s9e3RoaXMucHJldn0gc3R5bGU9e3t0b3A6IHRoaXMuc3RhdGUuaGVpZ2h0LzJ9fT5QcmV2PC9idXR0b24+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBpZD1cInZpZXdlci1wbGF5LWJ1dHRvbi1jb250YWluZXJcIiBzdHlsZT17e2hlaWdodDogdGhpcy5zdGF0ZS5oZWlnaHQsIHdpZHRoOiB0aGlzLnN0YXRlLndpZHRofX0+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgaWQ9XCJ2aWV3ZXItcGxheS1idXR0b25cIiBjbGFzc05hbWU9e3RoaXMuc3RhdGUuaXNQbGF5aW5nP1widmlld2VyLXBsYXktYnV0dG9uLXBhdXNlXCI6XCJcIn0gb25DbGljaz17dGhpcy5wbGF5fSBzdHlsZT17e3RvcDogdGhpcy5zdGF0ZS5oZWlnaHQvMiwgbGVmdDogdGhpcy5zdGF0ZS53aWR0aC8yfX0+PC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPGNhbnZhcyBpZD1cInZpZXdlci1jYW52YXNcIiB3aWR0aD17dGhpcy5zdGF0ZS53aWR0aH0gaGVpZ2h0PXt0aGlzLnN0YXRlLmhlaWdodH0+PC9jYW52YXM+XG4gICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgaWQ9XCJ2aWV3ZXItb3B0aW9uXCIgc3R5bGU9e3t3aWR0aDogdGhpcy5zdGF0ZS53aWR0aH19PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxsYWJlbD5FYXNpbmc6IDxzZWxlY3QgcmVmPVwiZWFzaW5nU2VsZWN0XCIgaWQ9XCJlYXNpbmctc2VsZWN0XCIgb25DaGFuZ2U9e3RoaXMuY2hhbmdlRWFzaW5nfT57ZWFzaW5nc308L3NlbGVjdD48L2xhYmVsPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxsYWJlbD5EdXJhdGlvbjogPGlucHV0IHJlZj1cImR1cmF0aW9uSW5wdXRcIiB0eXBlPVwibnVtYmVyXCIgaWQ9XCJkdXJhdGlvbi1pbnB1dFwiIG1pbj1cIjEwMFwiIG9uQ2hhbmdlPXt0aGlzLmNoYW5nZWR1cmF0aW9ufSB2YWx1ZT17dGhpcy5zdGF0ZS5kdXJhdGlvbn0+PC9pbnB1dD48L2xhYmVsPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxsYWJlbD5JbnRlcnZhbCBvZiBBdXRvcGxheTogPGlucHV0IHJlZj1cImludGVydmFsSW5wdXRcIiB0eXBlPVwibnVtYmVyXCIgaWQ9XCJpbnRlcnZhbC1pbnB1dFwiIG1pbj1cIjBcIiBvbkNoYW5nZT17dGhpcy5jaGFuZ2VJbnRlcnZhbH0gdmFsdWU9e3RoaXMuc3RhdGUuaW50ZXJ2YWx9PjwvaW5wdXQ+PC9sYWJlbD5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGlkPVwidmlld2VyLXBvaW50c1wiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7cG9pbnRzfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgIDxidXR0b24gaWQ9XCJwcmV2aWV3LWJ1dHRvblwiIG9uQ2xpY2s9e3RoaXMudG9nZ2xlUHJldmlld30+UHJldmlldzwvYnV0dG9uPlxuICAgICAgICAgICAgICAgIDxidXR0b24gaWQ9XCJzYXZlLWJ1dHRvblwiIG9uQ2xpY2s9e3RoaXMuc2F2ZX0+U2F2ZTwvYnV0dG9uPlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICk7XG4gICAgfVxufSk7XG5cbmV4cG9ydCBkZWZhdWx0IEFwcDsiLCJpbXBvcnQgU2xpZGVzIGZyb20gJy4vU2xpZGVzLmpzJztcblxudmFyIEVkaXRvciA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcbiAgICByZW5kZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgPGRpdiBpZD1cImVkaXRvclwiIHN0eWxlPXt7d2lkdGg6IHRoaXMucHJvcHMud2lkdGh9fT5cbiAgICAgICAgICAgICAgICA8U2xpZGVzIHNsaWRlcz17dGhpcy5wcm9wcy5zbGlkZXN9IG1vdmluZ1BvaW50PXt0aGlzLnByb3BzLm1vdmluZ1BvaW50fSByZWY9XCJzbGlkZXNcIiBzdGFydE1vdmluZ1BvaW50PXt0aGlzLnByb3BzLnN0YXJ0TW92aW5nUG9pbnR9IGFkZFBvaW50PXt0aGlzLnByb3BzLmFkZFBvaW50fSByZW1vdmVQb2ludD17dGhpcy5wcm9wcy5yZW1vdmVQb2ludH0gcmVtb3ZlU2xpZGU9e3RoaXMucHJvcHMucmVtb3ZlU2xpZGV9PjwvU2xpZGVzPlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgIClcbiAgICB9XG59KTtcblxuZXhwb3J0IGRlZmF1bHQgRWRpdG9yOyIsInZhciBQb2ludCA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcbiAgICBnZXRJbml0aWFsU3RhdGU6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgaXNNb3VzZURvd246IGZhbHNlXG4gICAgICAgIH1cbiAgICB9LFxuICAgIGhhbmRsZU1vdXNlRG93bjogZnVuY3Rpb24oZSkge1xuICAgICAgICB0aGlzLnByb3BzLnN0YXJ0TW92aW5nUG9pbnQodGhpcy5wcm9wcy5pbmRleCk7XG4gICAgfSxcbiAgICBoYW5kbGVEb3VibGVDbGljazogZnVuY3Rpb24oKSB7Ly/jg4Djg5bjg6vjgq/jg6rjg4Pjgq/jgadQb2ludOOBruWJiumZpO+8iOOBn+OBoOOBl+OAgeWfuua6lueUu+WDj+OBruOBv++8iVxuICAgICAgICB0aGlzLnByb3BzLnJlbW92ZVBvaW50KHRoaXMucHJvcHMuaW5kZXgpO1xuICAgIH0sXG4gICAgcmVuZGVyOiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPXtcImVkaXRvci1zbGlkZS1wb2ludFwiICsgKHRoaXMucHJvcHMuaXNNb3ZpbmcgPyBcIiBtb3ZpbmdcIiA6IFwiXCIpfSBzdHlsZT17XG4gICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxlZnQ6IHRoaXMucHJvcHMueCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHRvcDogdGhpcy5wcm9wcy55XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9IG9uTW91c2VEb3duPXt0aGlzLmhhbmRsZU1vdXNlRG93bn0gb25Eb3VibGVDbGljaz17dGhpcy5oYW5kbGVEb3VibGVDbGlja30gb25EcmFnU3RhcnQ9e2Z1bmN0aW9uKGUpe2UucHJldmVudERlZmF1bHQoKTt9fT48L2Rpdj5cbiAgICAgICAgKVxuICAgIH1cbn0pO1xuXG5leHBvcnQgZGVmYXVsdCBQb2ludDsiLCJpbXBvcnQgUG9pbnQgZnJvbSAnLi9Qb2ludC5qcyc7XG5cbnZhciBQb2ludHMgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG4gICAgc3RhcnRNb3ZpbmdQb2ludDogZnVuY3Rpb24oaW5kZXgpIHsvL+OBqeOBrueUu+WDj+OBruOBqeOBruODneOCpOODs+ODiOOCkuWLleOBi+OBl+Wni+OCgeOBn+OBi+OCkkFwcOOBq+WxiuOBkeOCi1xuICAgICAgICB2YXIgcmVjdCA9IFJlYWN0LmZpbmRET01Ob2RlKHRoaXMucmVmcy5kaXYpLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgICAgICB0aGlzLnByb3BzLnN0YXJ0TW92aW5nUG9pbnQodGhpcy5wcm9wcy5pbmRleCwgaW5kZXgsIHJlY3QpO1xuICAgIH0sXG4gICAgaGFuZGxlQ2xpY2s6IGZ1bmN0aW9uKGUpIHsvL1BvaW505Lul5aSW44Gu5aC05omA44KS44Kv44Oq44OD44Kv44GX44Gf44KJYWRkUG9pbnTvvIhBcHDjgafln7rmupbnlLvlg4/jgYvjganjgYbjgYvliKTmlq3vvIlcbiAgICAgICAgaWYoZS50YXJnZXQuY2xhc3NOYW1lIT09XCJlZGl0b3Itc2xpZGUtcG9pbnRcIikgey8vUG9pbnTjgpLjgq/jg6rjg4Pjgq/jgZfjgZ/loLTlkIjjgoJoYW5kbGVDbGlja+OBleOCjOOCi+OBruOBp+OAgeOBteOCi+OBhOWIhuOBkVxuICAgICAgICAgICAgdmFyIHJlY3QgPSBlLnRhcmdldC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICAgICAgICAgIHRoaXMucHJvcHMuYWRkUG9pbnQodGhpcy5wcm9wcy5pbmRleCwge3g6IE1hdGgucm91bmQoZS5jbGllbnRYIC0gcmVjdC5sZWZ0KSwgeTogTWF0aC5yb3VuZChlLmNsaWVudFkgLSByZWN0LnRvcCl9KTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiYWRkXCIpO1xuICAgICAgICB9XG4gICAgfSxcbiAgICByZW1vdmVQb2ludDogZnVuY3Rpb24oaW5kZXgpIHsvL+Wfuua6lueUu+WDj+OBquOCiVBvaW5044Gu5YmK6ZmkXG4gICAgICAgIHRoaXMucHJvcHMucmVtb3ZlUG9pbnQodGhpcy5wcm9wcy5pbmRleCwgaW5kZXgpO1xuICAgIH0sXG4gICAgcmVuZGVyOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIHBvaW50cyA9IHRoaXMucHJvcHMucG9pbnRzLm1hcCgocG9pbnQsIGluZGV4KSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gKDxQb2ludCBrZXk9e1wicG9pbnRzLVwiICsgdGhpcy5wcm9wcy5pbmRleCArIFwiLVwiICsgaW5kZXh9IGlzTW92aW5nPXsodGhpcy5wcm9wcy5tb3ZpbmdQb2ludCA9PT0gaW5kZXgpfSBpbmRleD17aW5kZXh9IHg9e3BvaW50Lnh9IHk9e3BvaW50Lnl9IHN0YXJ0TW92aW5nUG9pbnQ9e3RoaXMuc3RhcnRNb3ZpbmdQb2ludH0gcmVtb3ZlUG9pbnQ9e3RoaXMucmVtb3ZlUG9pbnR9PjwvUG9pbnQ+KVxuICAgICAgICB9KTtcbiAgICAgICAgdmFyIGZhY2VzID0gdGhpcy5wcm9wcy5mYWNlcy5tYXAoKGZhY2UpID0+IHsvL+S4ieinkuW9ouOBruaPj+eUu1xuICAgICAgICAgICAgdmFyIGEgPSB0aGlzLnByb3BzLnBvaW50c1tmYWNlWzBdXTtcbiAgICAgICAgICAgIHZhciBiID0gdGhpcy5wcm9wcy5wb2ludHNbZmFjZVsxXV07XG4gICAgICAgICAgICB2YXIgYyA9IHRoaXMucHJvcHMucG9pbnRzW2ZhY2VbMl1dO1xuICAgICAgICAgICAgdmFyIHBhdGggPSBcIk1cIiArIGEueCArIFwiIFwiICsgYS55ICsgXCIgTFwiICsgYi54ICsgXCIgXCIgKyBiLnkgKyBcIiBMXCIgKyBjLnggKyBcIiBcIiArIGMueSArIFwiWlwiO1xuICAgICAgICAgICAgcmV0dXJuICg8cGF0aCBzdHJva2U9XCJyZ2JhKDAsMCwwLDAuMSlcIiBmaWxsPVwibm9uZVwiIGQ9e3BhdGh9PjwvcGF0aD4pO1xuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIDxkaXYgcmVmPVwiZGl2XCIgY2xhc3NOYW1lPVwiZWRpdG9yLXNsaWRlLXBvaW50cy1jb250YWluZXJcIiBvbk1vdXNlTW92ZT17dGhpcy5oYW5kbGVNb3VzZU1vdmV9IG9uTW91c2VVcD17dGhpcy5oYW5kbGVNb3VzZVVwfSBvbkNsaWNrPXt0aGlzLmhhbmRsZUNsaWNrfSBzdHlsZT17e3dpZHRoOiB0aGlzLnByb3BzLndpZHRoLCBoZWlnaHQ6IHRoaXMucHJvcHMuaGVpZ2h0fX0+XG4gICAgICAgICAgICAgICAge3BvaW50c31cbiAgICAgICAgICAgICAgICA8c3ZnIHZpZXdCb3g9e1wiMCAwIFwiICsgdGhpcy5wcm9wcy53aWR0aCArIFwiIFwiICsgdGhpcy5wcm9wcy5oZWlnaHR9PlxuICAgICAgICAgICAgICAgICAgICB7ZmFjZXN9XG4gICAgICAgICAgICAgICAgPC9zdmc+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgKTtcbiAgICB9XG59KTtcblxuZXhwb3J0IGRlZmF1bHQgUG9pbnRzOyIsImltcG9ydCBQb2ludHMgZnJvbSAnLi9Qb2ludHMuanMnO1xuXG52YXIgU2xpZGUgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG4gICAgcmVtb3ZlU2xpZGU6IGZ1bmN0aW9uKCkgey8vaW5kZXjjgpJBcHDjgavpgIHjgaPjgabliYrpmaRcbiAgICAgICAgdGhpcy5wcm9wcy5yZW1vdmVTbGlkZSh0aGlzLnByb3BzLmluZGV4KTtcbiAgICB9LFxuICAgIGdldEpTT05TdHJpbmc6IGZ1bmN0aW9uKCkgey8vUG9pbnRz44GoRmFjZXPjgpLooajnpLpcbiAgICAgICAgcmV0dXJuIEpTT04uc3RyaW5naWZ5KHtcbiAgICAgICAgICAgIHBvaW50czogdGhpcy5wcm9wcy5zbGlkZS5wb2ludHMsXG4gICAgICAgICAgICBmYWNlczogdGhpcy5wcm9wcy5zbGlkZS5mYWNlc1xuICAgICAgICB9KTtcbiAgICB9LFxuICAgIHJlbmRlcjogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImVkaXRvci1zbGlkZS1jb250YWluZXJcIiBzdHlsZT17e3dpZHRoOiB0aGlzLnByb3BzLnNsaWRlLndpZHRofX0+XG4gICAgICAgICAgICAgICAgPFBvaW50cyBpbmRleD17dGhpcy5wcm9wcy5pbmRleH0gbW92aW5nUG9pbnQ9e3RoaXMucHJvcHMubW92aW5nUG9pbnR9IHdpZHRoPXt0aGlzLnByb3BzLnNsaWRlLndpZHRoID8gdGhpcy5wcm9wcy5zbGlkZS53aWR0aCA6IDB9IGhlaWdodD17dGhpcy5wcm9wcy5zbGlkZS5oZWlnaHQgPyB0aGlzLnByb3BzLnNsaWRlLmhlaWdodCA6IDB9XG4gICAgICAgICAgICAgICAgICAgICAgICBwb2ludHM9e3RoaXMucHJvcHMuc2xpZGUucG9pbnRzID8gdGhpcy5wcm9wcy5zbGlkZS5wb2ludHMgOiBbXX1cbiAgICAgICAgICAgICAgICAgICAgICAgIGZhY2VzPXt0aGlzLnByb3BzLnNsaWRlLmZhY2VzID8gdGhpcy5wcm9wcy5zbGlkZS5mYWNlcyA6IFtdfVxuICAgICAgICAgICAgICAgICAgICAgICAgc3RhcnRNb3ZpbmdQb2ludD17dGhpcy5wcm9wcy5zdGFydE1vdmluZ1BvaW50fSBhZGRQb2ludD17dGhpcy5wcm9wcy5hZGRQb2ludH0gcmVtb3ZlUG9pbnQ9e3RoaXMucHJvcHMucmVtb3ZlUG9pbnR9PjwvUG9pbnRzPlxuICAgICAgICAgICAgICAgIDxpbWcgc3JjPXt0aGlzLnByb3BzLnNsaWRlLnNyY30gcmVmPVwiaW1nXCI+PC9pbWc+XG4gICAgICAgICAgICAgICAgPHRleHRhcmVhIGNsYXNzTmFtZT1cImVkaXRvci1zbGlkZS1kYXRhXCIgdmFsdWU9e3RoaXMuZ2V0SlNPTlN0cmluZygpfSByZWFkT25seT48L3RleHRhcmVhPlxuICAgICAgICAgICAgICAgIDxidXR0b24gY2xhc3NOYW1lPVwiZWRpdG9yLXNsaWRlLXJlbW92ZS1idXR0b25cIiBvbkNsaWNrPXt0aGlzLnJlbW92ZVNsaWRlfT7DlzwvYnV0dG9uPlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICk7XG4gICAgfVxufSk7XG5cbmV4cG9ydCBkZWZhdWx0IFNsaWRlOyIsImltcG9ydCBTbGlkZSBmcm9tICcuL1NsaWRlLmpzJztcblxudmFyIFNsaWRlcyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcbiAgICByZW5kZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgc2xpZGVzID0gdGhpcy5wcm9wcy5zbGlkZXMubWFwKChzbGlkZSwgaW5kZXgpID0+IHtcbiAgICAgICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICAgICAgPFNsaWRlIHJlZj17XCJTbGlkZVwiK2luZGV4fSBrZXk9e1wic2xpZGUtY29udGFpbmVyLVwiICsgaW5kZXh9IGluZGV4PXtpbmRleH0gc2xpZGU9e3NsaWRlfSBtb3ZpbmdQb2ludD17dGhpcy5wcm9wcy5tb3ZpbmdQb2ludH0gc3RhcnRNb3ZpbmdQb2ludD17dGhpcy5wcm9wcy5zdGFydE1vdmluZ1BvaW50fSBhZGRQb2ludD17dGhpcy5wcm9wcy5hZGRQb2ludH0gcmVtb3ZlUG9pbnQ9e3RoaXMucHJvcHMucmVtb3ZlUG9pbnR9IHJlbW92ZVNsaWRlPXt0aGlzLnByb3BzLnJlbW92ZVNsaWRlfT48L1NsaWRlPlxuICAgICAgICAgICAgKTtcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICA8ZGl2IGlkPVwiZWRpdG9yLXNsaWRlc1wiPlxuICAgICAgICAgICAgICAgIHtzbGlkZXN9XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgKTtcbiAgICB9XG59KTtcblxuZXhwb3J0IGRlZmF1bHQgU2xpZGVzOyIsInZhciBFYXNpbmdGdW5jdGlvbnMgPSB7XG4gICAgLy8gbm8gZWFzaW5nLCBubyBhY2NlbGVyYXRpb25cbiAgICBsaW5lYXI6IGZ1bmN0aW9uICh0KSB7IHJldHVybiB0IH0sXG4gICAgLy8gYWNjZWxlcmF0aW5nIGZyb20gemVybyB2ZWxvY2l0eVxuICAgIGVhc2VJblF1YWQ6IGZ1bmN0aW9uICh0KSB7IHJldHVybiB0KnQgfSxcbiAgICAvLyBkZWNlbGVyYXRpbmcgdG8gemVybyB2ZWxvY2l0eVxuICAgIGVhc2VPdXRRdWFkOiBmdW5jdGlvbiAodCkgeyByZXR1cm4gdCooMi10KSB9LFxuICAgIC8vIGFjY2VsZXJhdGlvbiB1bnRpbCBoYWxmd2F5LCB0aGVuIGRlY2VsZXJhdGlvblxuICAgIGVhc2VJbk91dFF1YWQ6IGZ1bmN0aW9uICh0KSB7IHJldHVybiB0PC41ID8gMip0KnQgOiAtMSsoNC0yKnQpKnQgfSxcbiAgICAvLyBhY2NlbGVyYXRpbmcgZnJvbSB6ZXJvIHZlbG9jaXR5XG4gICAgZWFzZUluQ3ViaWM6IGZ1bmN0aW9uICh0KSB7IHJldHVybiB0KnQqdCB9LFxuICAgIC8vIGRlY2VsZXJhdGluZyB0byB6ZXJvIHZlbG9jaXR5XG4gICAgZWFzZU91dEN1YmljOiBmdW5jdGlvbiAodCkgeyByZXR1cm4gKC0tdCkqdCp0KzEgfSxcbiAgICAvLyBhY2NlbGVyYXRpb24gdW50aWwgaGFsZndheSwgdGhlbiBkZWNlbGVyYXRpb25cbiAgICBlYXNlSW5PdXRDdWJpYzogZnVuY3Rpb24gKHQpIHsgcmV0dXJuIHQ8LjUgPyA0KnQqdCp0IDogKHQtMSkqKDIqdC0yKSooMip0LTIpKzEgfSxcbiAgICAvLyBhY2NlbGVyYXRpbmcgZnJvbSB6ZXJvIHZlbG9jaXR5XG4gICAgZWFzZUluUXVhcnQ6IGZ1bmN0aW9uICh0KSB7IHJldHVybiB0KnQqdCp0IH0sXG4gICAgLy8gZGVjZWxlcmF0aW5nIHRvIHplcm8gdmVsb2NpdHlcbiAgICBlYXNlT3V0UXVhcnQ6IGZ1bmN0aW9uICh0KSB7IHJldHVybiAxLSgtLXQpKnQqdCp0IH0sXG4gICAgLy8gYWNjZWxlcmF0aW9uIHVudGlsIGhhbGZ3YXksIHRoZW4gZGVjZWxlcmF0aW9uXG4gICAgZWFzZUluT3V0UXVhcnQ6IGZ1bmN0aW9uICh0KSB7IHJldHVybiB0PC41ID8gOCp0KnQqdCp0IDogMS04KigtLXQpKnQqdCp0IH0sXG4gICAgLy8gYWNjZWxlcmF0aW5nIGZyb20gemVybyB2ZWxvY2l0eVxuICAgIGVhc2VJblF1aW50OiBmdW5jdGlvbiAodCkgeyByZXR1cm4gdCp0KnQqdCp0IH0sXG4gICAgLy8gZGVjZWxlcmF0aW5nIHRvIHplcm8gdmVsb2NpdHlcbiAgICBlYXNlT3V0UXVpbnQ6IGZ1bmN0aW9uICh0KSB7IHJldHVybiAxKygtLXQpKnQqdCp0KnQgfSxcbiAgICAvLyBhY2NlbGVyYXRpb24gdW50aWwgaGFsZndheSwgdGhlbiBkZWNlbGVyYXRpb25cbiAgICBlYXNlSW5PdXRRdWludDogZnVuY3Rpb24gKHQpIHsgcmV0dXJuIHQ8LjUgPyAxNip0KnQqdCp0KnQgOiAxKzE2KigtLXQpKnQqdCp0KnQgfVxufTtcblxuZXhwb3J0IGRlZmF1bHQgRWFzaW5nRnVuY3Rpb25zOyJdfQ==
