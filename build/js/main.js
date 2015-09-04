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
            localStorage.state = JSON.stringify(testJSON);
            return testJSON;
            //--------------------------------------------------------------
            //
            //
            //return {
            //    slides: [],
            //    movingPoint: -1,
            //    editingSlide: -1,
            //    movingPointRect: null,
            //    baseIndex: 0,//基準画像
            //    width: 0,
            //    height: 0,
            //    transformEasing: "linear",
            //    alphaEasing: "linear",
            //    duration: 200,
            //    interval: 1000,
            //    index: 0,
            //    isPlaying: false
            //}
        }
    },
    componentDidMount: function componentDidMount() {
        ms = new MorphingSlider(document.getElementById('viewer-slider'));
    },
    handleFileSelect: function handleFileSelect(evt) {
        var _this = this;

        evt.stopPropagation();
        evt.preventDefault();

        var files = evt.dataTransfer.files; // FileList object

        // Loop through the FileList and render slide files as thumbnails.
        for (var i = 0, file; file = files[i]; i++) {

            // Only process slide files.
            if (!file.type.match('image.*')) {
                continue;
            }

            var reader = new FileReader();

            // Closure to capture the file information.
            reader.onload = function (e) {
                _this.addSlide(e.target.result, file.name);
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
    addSlide: function addSlide(dataURL, name) {
        var _this2 = this;

        var newSlide = {
            src: dataURL,
            index: this.state.slides.length,
            name: name
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

        ms.direction = true;
        if (this.state.isPlaying) {
            ms.stop();
            this.setState({ isPlaying: false });
        } else {
            ms.play(function () {
                _this5.setState({ index: ms.index });
            });
            this.setState({ isPlaying: true });
        }
    },
    next: function next() {
        var _this6 = this;

        ms.direction = true;
        ms.morph(function () {
            _this6.setState({ index: ms.index });
        });
    },
    prev: function prev() {
        var _this7 = this;

        ms.direction = false;
        ms.morph(function () {
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
            ms.setFaces(this.state.slides[this.state.baseIndex].faces);
            this.state.slides.forEach(function (slide) {
                var points = slide.points.map(function (point) {
                    return [point.x / slide.width, point.y / slide.height];
                });
                ms.addSlide(slide.src, points, function () {
                    _this8.setState({ width: ms.width, height: ms.height });
                });
            });
        }
    },
    save: function save() {
        //ひとまずlocalStrageに保存
        localStorage.state = JSON.stringify(this.state);
    },
    getCode: function getCode() {
        return 'var morphingSlider = new MorphingSlider(\'[CONTAINER_ID]\');\n' + 'morphingSlider.setFaces(' + JSON.stringify(this.state.slides[this.state.baseIndex].faces) + ')\n' + 'morphingSlider.interval = ' + this.state.interval + ';\n' + 'morphingSlider.duration = ' + this.state.duration + ';\n' + 'morphingSlider.easing = \'' + this.state.easing + '\';\n';
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
            React.createElement('textarea', { className: 'code', value: this.getCode(), readOnly: true }),
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
                        )
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
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _PointsJs = require('./Points.js');

var _PointsJs2 = _interopRequireDefault(_PointsJs);

var Slide = React.createClass({
    displayName: 'Slide',

    removeSlide: function removeSlide() {
        //indexをAppに送って削除
        this.props.removeSlide(this.props.index);
    },
    getJSONString: function getJSONString() {
        //PointsとFacesを表示
        var width = this.props.slide.width;
        var height = this.props.slide.height;
        var round = Math.round;
        if (this.props.slide.points) {
            var points = this.props.slide.points.map(function (point) {
                return [round(point.x / width * 100) / 100, round(point.y / height * 100) / 100];
            });
            return 'morphingSlider.addSlide(' + this.props.slide.name + ', ' + JSON.stringify(points) + ');';
        } else {
            return '';
        }
    },
    render: function render() {
        return React.createElement(
            'div',
            { className: 'editor-slide-container', style: { width: this.props.slide.width } },
            React.createElement(_PointsJs2['default'], { index: this.props.index, movingPoint: this.props.movingPoint, width: this.props.slide.width ? this.props.slide.width : 0, height: this.props.slide.height ? this.props.slide.height : 0,
                points: this.props.slide.points ? this.props.slide.points : [],
                faces: this.props.slide.faces ? this.props.slide.faces : [],
                startMovingPoint: this.props.startMovingPoint, addPoint: this.props.addPoint, removePoint: this.props.removePoint }),
            React.createElement('img', { src: this.props.slide.src, ref: 'img' }),
            React.createElement('textarea', { className: 'editor-slide-data', value: this.getJSONString(), readOnly: true }),
            React.createElement(
                'button',
                { className: 'editor-slide-remove-button', onClick: this.removeSlide },
                '×'
            )
        );
    }
});

exports['default'] = Slide;
module.exports = exports['default'];

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
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMveWFtYW1vdG9ub2Rva2EvRGVza3RvcC9pbWFnZS1tb3JwaGluZy9zcmMvanMvbWFpbi5qcyIsIi9Vc2Vycy95YW1hbW90b25vZG9rYS9EZXNrdG9wL2ltYWdlLW1vcnBoaW5nL3NyYy9qcy9BcHAuanMiLCIvVXNlcnMveWFtYW1vdG9ub2Rva2EvRGVza3RvcC9pbWFnZS1tb3JwaGluZy9zcmMvanMvRWRpdG9yLmpzIiwiL1VzZXJzL3lhbWFtb3Rvbm9kb2thL0Rlc2t0b3AvaW1hZ2UtbW9ycGhpbmcvc3JjL2pzL1BvaW50LmpzIiwiL1VzZXJzL3lhbWFtb3Rvbm9kb2thL0Rlc2t0b3AvaW1hZ2UtbW9ycGhpbmcvc3JjL2pzL1BvaW50cy5qcyIsIi9Vc2Vycy95YW1hbW90b25vZG9rYS9EZXNrdG9wL2ltYWdlLW1vcnBoaW5nL3NyYy9qcy9TbGlkZS5qcyIsIi9Vc2Vycy95YW1hbW90b25vZG9rYS9EZXNrdG9wL2ltYWdlLW1vcnBoaW5nL3NyYy9qcy9TbGlkZXMuanMiLCIvVXNlcnMveWFtYW1vdG9ub2Rva2EvRGVza3RvcC9pbWFnZS1tb3JwaGluZy9zcmMvanMvZWFzaW5nLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7OztxQkNBZ0IsVUFBVTs7OztBQUUxQixLQUFLLENBQUMsTUFBTSxDQUNSLDZDQUFXLEVBQ1gsUUFBUSxDQUFDLGNBQWMsQ0FBQyxlQUFlLENBQUMsQ0FDM0MsQ0FBQzs7Ozs7Ozs7Ozs7d0JDTDBCLGFBQWE7Ozs7d0JBQ3RCLGFBQWE7Ozs7Ozs7QUFLaEMsSUFBSSxLQUFLLEVBQUUsRUFBRSxDQUFDOztBQUVkLElBQUksR0FBRyxHQUFHLEtBQUssQ0FBQyxXQUFXLENBQUM7OztBQUN4QixtQkFBZSxFQUFFLDJCQUFXO0FBQ3hCLFlBQUcsWUFBWSxDQUFDLEtBQUssRUFBQztBQUNsQixtQkFB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RSxxQkFBVSxDQUFDLEVBQUU7QUFBRSxlQUFPLENBQUMsR0FBQyxDQUFDLEdBQUMsQ0FBQyxHQUFDLENBQUMsQ0FBQTtLQUFFOztBQUU1QyxnQkFBWSxFQUFFLHNCQUFVLENBQUMsRUFBRTtBQUFFLGVBQU8sQ0FBQyxHQUFDLEFBQUMsRUFBRSxDQUFDLEdBQUUsQ0FBQyxHQUFDLENBQUMsR0FBQyxDQUFDLENBQUE7S0FBRTs7QUFFbkQsa0JBQWMsRUFBRSx3QkFBVSxDQUFDLEVBQUU7QUFBRSxlQUFPLENBQUMsR0FBQyxHQUFFLEdBQUcsQ0FBQyxHQUFDLENBQUMsR0FBQyxDQUFDLEdBQUMsQ0FBQyxHQUFDLENBQUMsR0FBRyxDQUFDLEdBQUMsQ0FBQyxHQUFFLEVBQUUsQ0FBQyxBQUFDLEdBQUMsQ0FBQyxHQUFDLENBQUMsR0FBQyxDQUFDLENBQUE7S0FBRTs7QUFFMUUsZUFBVyxFQUFFLHFCQUFVLENBQUMsRUFBRTtBQUFFLGVBQU8sQ0FBQyxHQUFDLENBQUMsR0FBQyxDQUFDLEdBQUMsQ0FBQyxHQUFDLENBQUMsQ0FBQTtLQUFFOztBQUU5QyxnQkFBWSxFQUFFLHNCQUFVLENBQUMsRUFBRTtBQUFFLGVBQU8sQ0FBQyxHQUFDLEFBQUMsRUFBRSxDQUFDLEdBQUUsQ0FBQyxHQUFDLENBQUMsR0FBQyxDQUFDLEdBQUMsQ0FBQyxDQUFBO0tBQUU7O0FBRXJELGtCQUFjLEVBQUUsd0JBQVUsQ0FBQyxFQUFFO0FBQUUsZUFBTyxDQUFDLEdBQUMsR0FBRSxHQUFHLEVBQUUsR0FBQyxDQUFDLEdBQUMsQ0FBQyxHQUFDLENBQUMsR0FBQyxDQUFDLEdBQUMsQ0FBQyxHQUFHLENBQUMsR0FBQyxFQUFFLEdBQUUsRUFBRSxDQUFDLEFBQUMsR0FBQyxDQUFDLEdBQUMsQ0FBQyxHQUFDLENBQUMsR0FBQyxDQUFDLENBQUE7S0FBRTtDQUNuRixDQUFDOztxQkFFYSxlQUFlIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsImltcG9ydCBBcHAgZnJvbSAnLi9BcHAuanMnO1xuXG5SZWFjdC5yZW5kZXIoXG4gICAgPEFwcD48L0FwcD4sXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2FwcC1jb250YWluZXInKVxuKTsiLCJpbXBvcnQgRWFzaW5nRnVuY3Rpb25zIGZyb20gJy4vZWFzaW5nLmpzJztcbmltcG9ydCBFZGl0b3IgZnJvbSAnLi9FZGl0b3IuanMnO1xuXG4vL+ODhuOCueODiOeUqFxuLy9pbXBvcnQgdGVzdEpTT04gZnJvbSAnLi8uLi8uLi9idWlsZC9qcy90ZXN0LmpzJztcblxudmFyIHN0YWdlLCBtcztcblxudmFyIEFwcCA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcbiAgICBnZXRJbml0aWFsU3RhdGU6IGZ1bmN0aW9uKCkge1xuICAgICAgICBpZihsb2NhbFN0b3JhZ2Uuc3RhdGUpe1xuICAgICAgICAgICAgcmV0dXJuIEpTT04ucGFyc2UobG9jYWxTdG9yYWdlLnN0YXRlKTtcbiAgICAgICAgfSBlbHNlIHtcblxuICAgICAgICAgICAgLy/jg4bjgrnjg4jnlKgtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgICAgICAgICBsb2NhbFN0b3JhZ2Uuc3RhdGUgPSBKU09OLnN0cmluZ2lmeSh0ZXN0SlNPTik7XG4gICAgICAgICAgICByZXR1cm4gdGVzdEpTT047XG4gICAgICAgICAgICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgICAgICAgICAvL1xuICAgICAgICAgICAgLy9cbiAgICAgICAgICAgIC8vcmV0dXJuIHtcbiAgICAgICAgICAgIC8vICAgIHNsaWRlczogW10sXG4gICAgICAgICAgICAvLyAgICBtb3ZpbmdQb2ludDogLTEsXG4gICAgICAgICAgICAvLyAgICBlZGl0aW5nU2xpZGU6IC0xLFxuICAgICAgICAgICAgLy8gICAgbW92aW5nUG9pbnRSZWN0OiBudWxsLFxuICAgICAgICAgICAgLy8gICAgYmFzZUluZGV4OiAwLC8v5Z+65rqW55S75YOPXG4gICAgICAgICAgICAvLyAgICB3aWR0aDogMCxcbiAgICAgICAgICAgIC8vICAgIGhlaWdodDogMCxcbiAgICAgICAgICAgIC8vICAgIHRyYW5zZm9ybUVhc2luZzogXCJsaW5lYXJcIixcbiAgICAgICAgICAgIC8vICAgIGFscGhhRWFzaW5nOiBcImxpbmVhclwiLFxuICAgICAgICAgICAgLy8gICAgZHVyYXRpb246IDIwMCxcbiAgICAgICAgICAgIC8vICAgIGludGVydmFsOiAxMDAwLFxuICAgICAgICAgICAgLy8gICAgaW5kZXg6IDAsXG4gICAgICAgICAgICAvLyAgICBpc1BsYXlpbmc6IGZhbHNlXG4gICAgICAgICAgICAvL31cbiAgICAgICAgfVxuICAgIH0sXG4gICAgY29tcG9uZW50RGlkTW91bnQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICBtcyA9IG5ldyBNb3JwaGluZ1NsaWRlcihkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInZpZXdlci1zbGlkZXJcIikpO1xuICAgIH0sXG4gICAgaGFuZGxlRmlsZVNlbGVjdDogZnVuY3Rpb24oZXZ0KSB7XG4gICAgICAgIGV2dC5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgZXZ0LnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICAgICAgdmFyIGZpbGVzID0gZXZ0LmRhdGFUcmFuc2Zlci5maWxlczsgLy8gRmlsZUxpc3Qgb2JqZWN0XG5cbiAgICAgICAgLy8gTG9vcCB0aHJvdWdoIHRoZSBGaWxlTGlzdCBhbmQgcmVuZGVyIHNsaWRlIGZpbGVzIGFzIHRodW1ibmFpbHMuXG4gICAgICAgIGZvciAodmFyIGkgPSAwLCBmaWxlOyBmaWxlID0gZmlsZXNbaV07IGkrKykge1xuXG4gICAgICAgICAgICAvLyBPbmx5IHByb2Nlc3Mgc2xpZGUgZmlsZXMuXG4gICAgICAgICAgICBpZiAoIWZpbGUudHlwZS5tYXRjaCgnaW1hZ2UuKicpKSB7XG4gICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHZhciByZWFkZXIgPSBuZXcgRmlsZVJlYWRlcigpO1xuXG4gICAgICAgICAgICAvLyBDbG9zdXJlIHRvIGNhcHR1cmUgdGhlIGZpbGUgaW5mb3JtYXRpb24uXG4gICAgICAgICAgICByZWFkZXIub25sb2FkID0gKGUpID0+IHtcbiAgICAgICAgICAgICAgICB0aGlzLmFkZFNsaWRlKGUudGFyZ2V0LnJlc3VsdCwgZmlsZS5uYW1lKTtcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIC8vIFJlYWQgaW4gdGhlIHNsaWRlIGZpbGUgYXMgYSBkYXRhIFVSTC5cbiAgICAgICAgICAgIHJlYWRlci5yZWFkQXNEYXRhVVJMKGZpbGUpO1xuICAgICAgICB9XG4gICAgfSxcbiAgICBoYW5kbGVEcmFnT3ZlcjogZnVuY3Rpb24oZXZ0KSB7XG4gICAgICAgIGV2dC5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgZXZ0LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIGV2dC5kYXRhVHJhbnNmZXIuZHJvcEVmZmVjdCA9ICdjb3B5JzsgLy8gRXhwbGljaXRseSBzaG93IHRoaXMgaXMgYSBjb3B5LlxuICAgIH0sXG4gICAgYWRkU2xpZGU6IGZ1bmN0aW9uKGRhdGFVUkwsIG5hbWUpIHtcbiAgICAgICAgdmFyIG5ld1NsaWRlID0ge1xuICAgICAgICAgICAgc3JjOiBkYXRhVVJMLFxuICAgICAgICAgICAgaW5kZXg6IHRoaXMuc3RhdGUuc2xpZGVzLmxlbmd0aCxcbiAgICAgICAgICAgIG5hbWU6IG5hbWVcbiAgICAgICAgfTtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7c2xpZGVzOiB0aGlzLnN0YXRlLnNsaWRlcy5jb25jYXQoW25ld1NsaWRlXSl9LCAoKSA9PiB7XG4gICAgICAgICAgICB2YXIgc2xpZGVET00gPSBSZWFjdC5maW5kRE9NTm9kZSh0aGlzLnJlZnMuZWRpdG9yLnJlZnMuc2xpZGVzLnJlZnNbXCJTbGlkZVwiICsgbmV3U2xpZGUuaW5kZXhdLnJlZnMuaW1nKTsvL1JlYWN044Gr44KI44KK44Os44Oz44OA44O85riI44G/44GuRE9NXG4gICAgICAgICAgICB2YXIgd2lkdGggPSBzbGlkZURPTS53aWR0aCwgaGVpZ2h0ID0gc2xpZGVET00uaGVpZ2h0O1xuICAgICAgICAgICAgdmFyIHBvaW50cywgZmFjZXM7XG4gICAgICAgICAgICBpZihuZXdTbGlkZS5pbmRleD4wKXtcbiAgICAgICAgICAgICAgICBwb2ludHMgPSB0aGlzLnN0YXRlLnNsaWRlc1t0aGlzLnN0YXRlLmJhc2VJbmRleF0ucG9pbnRzLmNvbmNhdCgpOyAvL+Wfuua6lueUu+WDj+OBrueJqeOCkuOCs+ODlOODvFxuICAgICAgICAgICAgICAgIGZhY2VzID0gdGhpcy5zdGF0ZS5zbGlkZXNbdGhpcy5zdGF0ZS5iYXNlSW5kZXhdLmZhY2VzLmNvbmNhdCgpOyAvL+Wfuua6lueUu+WDj+OBrueJqeOCkuOCs+ODlOODvFxuICAgICAgICAgICAgfSBlbHNlIHsvL+WIneacn+ioreWumlxuICAgICAgICAgICAgICAgIHBvaW50cyA9IFtcbiAgICAgICAgICAgICAgICAgICAge3g6MCwgeTowfSwge3g6d2lkdGgsIHk6MH0sIHt4OndpZHRoLCB5OmhlaWdodH0sIHt4OjAsIHk6aGVpZ2h0fSwge3g6d2lkdGgvMiwgeTpoZWlnaHQvMn1cbiAgICAgICAgICAgICAgICBdO1xuICAgICAgICAgICAgICAgIGZhY2VzID0gW1swLCAxLCA0XSwgWzEsIDIsIDRdLCBbMiwgMywgNF0sIFszLCA0LCAwXV07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB2YXIgc2xpZGVzID0gdGhpcy5zdGF0ZS5zbGlkZXMuY29uY2F0KCk7XG4gICAgICAgICAgICBzbGlkZXNbbmV3U2xpZGUuaW5kZXhdLnBvaW50cyA9IHBvaW50cztcbiAgICAgICAgICAgIHNsaWRlc1tuZXdTbGlkZS5pbmRleF0uZmFjZXMgPSBmYWNlcztcbiAgICAgICAgICAgIHNsaWRlc1tuZXdTbGlkZS5pbmRleF0ud2lkdGggPSB3aWR0aDtcbiAgICAgICAgICAgIHNsaWRlc1tuZXdTbGlkZS5pbmRleF0uaGVpZ2h0ID0gaGVpZ2h0O1xuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7c2xpZGVzOiBzbGlkZXN9KTtcbiAgICAgICAgfSk7XG4gICAgfSxcbiAgICBoYW5kbGVNb3VzZU1vdmU6IGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgaWYodGhpcy5zdGF0ZS5tb3ZpbmdQb2ludD49MCl7XG4gICAgICAgICAgICB2YXIgcmVjdCA9IHRoaXMuc3RhdGUubW92aW5nUG9pbnRSZWN0LFxuICAgICAgICAgICAgICAgIHggPSBNYXRoLnJvdW5kKGUuY2xpZW50WCAtIHJlY3QubGVmdCksXG4gICAgICAgICAgICAgICAgeSA9IE1hdGgucm91bmQoZS5jbGllbnRZIC0gcmVjdC50b3ApO1xuXG4gICAgICAgICAgICAvL+OBr+OBv+WHuuOBquOBhOOCiOOBhuOBq1xuICAgICAgICAgICAgeCA9IHggPCAwID8gMCA6IHg7XG4gICAgICAgICAgICB4ID0geCA+IHJlY3Qud2lkdGggPyByZWN0LndpZHRoIDogeDtcbiAgICAgICAgICAgIHkgPSB5IDwgMCA/IDAgOiB5O1xuICAgICAgICAgICAgeSA9IHkgPiByZWN0LmhlaWdodCA/IHJlY3QuaGVpZ2h0IDogeTtcblxuICAgICAgICAgICAgdGhpcy5tb3ZlUG9pbnQoe3g6IHgsIHk6IHl9KTtcbiAgICAgICAgfVxuICAgIH0sXG4gICAgaGFuZGxlTW91c2VVcDogZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmKHRoaXMuc3RhdGUuZWRpdGluZ1NsaWRlPi0xKSB7XG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHtlZGl0aW5nU2xpZGU6IC0xLCBtb3ZpbmdQb2ludDogLTF9KTtcbiAgICAgICAgfVxuICAgIH0sXG4gICAgbW92ZVBvaW50OiBmdW5jdGlvbihwb2ludCkge1xuICAgICAgICB2YXIgc2xpZGVzID0gdGhpcy5zdGF0ZS5zbGlkZXMuY29uY2F0KCk7XG4gICAgICAgIHNsaWRlc1t0aGlzLnN0YXRlLmVkaXRpbmdTbGlkZV0ucG9pbnRzW3RoaXMuc3RhdGUubW92aW5nUG9pbnRdID0gcG9pbnQ7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe3NsaWRlczogc2xpZGVzfSk7XG4gICAgfSxcbiAgICBzdGFydE1vdmluZ1BvaW50OiBmdW5jdGlvbihlZGl0aW5nU2xpZGUsIG1vdmluZ1BvaW50LCBtb3ZpbmdQb2ludFJlY3QpIHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7ZWRpdGluZ1NsaWRlOiBlZGl0aW5nU2xpZGUsIG1vdmluZ1BvaW50OiBtb3ZpbmdQb2ludCwgbW92aW5nUG9pbnRSZWN0OiBtb3ZpbmdQb2ludFJlY3R9KTtcbiAgICB9LFxuICAgIGFkZFBvaW50OiBmdW5jdGlvbihpbmRleCwgcG9pbnQpe1xuICAgICAgICBjb25zb2xlLmxvZyhpbmRleCk7XG4gICAgICAgIGlmKGluZGV4PT09dGhpcy5zdGF0ZS5iYXNlSW5kZXgpIHsvL+Wfuua6lueUu+WDj+OBquOCiVBvaW506L+95YqgXG4gICAgICAgICAgICB2YXIgc2xpZGVzID0gdGhpcy5zdGF0ZS5zbGlkZXMuY29uY2F0KCk7XG4gICAgICAgICAgICB2YXIgYmFzZVNsaWRlID0gc2xpZGVzW3RoaXMuc3RhdGUuYmFzZUluZGV4XTtcbiAgICAgICAgICAgIGJhc2VTbGlkZS5wb2ludHMucHVzaChwb2ludCk7XG4gICAgICAgICAgICBiYXNlU2xpZGUuZmFjZXMgPSB0aGlzLmNyZWF0ZUZhY2VzKGJhc2VTbGlkZS5wb2ludHMpOy8vZmFjZXPjgpLkvZzjgornm7TjgZlcbiAgICAgICAgICAgIHNsaWRlcy5mb3JFYWNoKChzbGlkZSwgaW5kZXgpID0+IHsvL+S7luOBrnNsaWRl44Gr44KCcG9pbnTjgahmYWNl44KS6L+95YqgXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuc3RhdGUuYmFzZUluZGV4ICE9PSBpbmRleCkge1xuICAgICAgICAgICAgICAgICAgICBzbGlkZXNbaW5kZXhdLnBvaW50cy5wdXNoKHt4OiBwb2ludC54LCB5OiBwb2ludC55fSk7XG4gICAgICAgICAgICAgICAgICAgIHNsaWRlc1tpbmRleF0uZmFjZXMgPSBiYXNlU2xpZGUuZmFjZXM7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHtzbGlkZXM6IHNsaWRlc30pO1xuICAgICAgICB9XG4gICAgfSxcbiAgICByZW1vdmVQb2ludDogZnVuY3Rpb24oc2xpZGVJbmRleCwgcG9pbnRJbmRleCkgey8vUG9pbnTjga7liYrpmaRcbiAgICAgICAgaWYoc2xpZGVJbmRleCA9PT0gdGhpcy5zdGF0ZS5iYXNlSW5kZXgpIHsvL+Wfuua6lueUu+WDj+OBquOCieWJiumZpFxuICAgICAgICAgICAgdmFyIHNsaWRlcyA9IHRoaXMuc3RhdGUuc2xpZGVzLmNvbmNhdCgpO1xuICAgICAgICAgICAgdmFyIGJhc2VTbGlkZSA9IHNsaWRlc1t0aGlzLnN0YXRlLmJhc2VJbmRleF07XG4gICAgICAgICAgICBiYXNlU2xpZGUucG9pbnRzLnNwbGljZShwb2ludEluZGV4LCAxKTtcbiAgICAgICAgICAgIGJhc2VTbGlkZS5mYWNlcyA9IHRoaXMuY3JlYXRlRmFjZXMoYmFzZVNsaWRlLnBvaW50cyk7Ly9mYWNlc+OCkuS9nOOCiuebtOOBmVxuICAgICAgICAgICAgc2xpZGVzLmZvckVhY2goKHNsaWRlLCBpbmRleCkgPT4gey8v5LuW44Guc2xpZGXjga5wb2ludOOCkuWJiumZpOOAgWZhY2XjgpLmm7TmlrBcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5zdGF0ZS5iYXNlSW5kZXggIT09IGluZGV4KSB7XG4gICAgICAgICAgICAgICAgICAgIHNsaWRlc1tpbmRleF0ucG9pbnRzLnNwbGljZShwb2ludEluZGV4LCAxKTtcbiAgICAgICAgICAgICAgICAgICAgc2xpZGVzW2luZGV4XS5mYWNlcyA9IGJhc2VTbGlkZS5mYWNlcztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe3NsaWRlczogc2xpZGVzfSk7XG4gICAgICAgIH1cbiAgICB9LFxuICAgIHJlbW92ZVNsaWRlOiBmdW5jdGlvbihpbmRleCkge1xuICAgICAgICB2YXIgc2xpZGVzID0gdGhpcy5zdGF0ZS5zbGlkZXMuY29uY2F0KCk7XG4gICAgICAgIHNsaWRlcy5zcGxpY2UoaW5kZXgsIDEpO1xuXG4gICAgICAgIC8vKioqKirln7rmupbnlLvlg4/jgpLliYrpmaTjgZfjgZ/loLTlkIjjga7lh6bnkIbjgYzlv4XopoEqKioqKlxuXG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe3NsaWRlczogc2xpZGVzfSk7XG4gICAgfSxcbiAgICBjaGFuZ2VFYXNpbmc6IGZ1bmN0aW9uKCl7XG4gICAgICAgIHZhciBzZWxlY3QgPSBSZWFjdC5maW5kRE9NTm9kZSh0aGlzLnJlZnMuZWFzaW5nU2VsZWN0KTtcbiAgICAgICAgdmFyIHZhbHVlID0gc2VsZWN0Lm9wdGlvbnNbc2VsZWN0LnNlbGVjdGVkSW5kZXhdLnZhbHVlO1xuICAgICAgICBtcy5lYXNpbmcgPSB2YWx1ZTtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7ZWFzaW5nOiB2YWx1ZX0pO1xuICAgIH0sXG4gICAgY2hhbmdlZHVyYXRpb246IGZ1bmN0aW9uKCl7XG4gICAgICAgIHZhciB2YWx1ZSA9IFJlYWN0LmZpbmRET01Ob2RlKHRoaXMucmVmcy5kdXJhdGlvbklucHV0KS52YWx1ZSoxO1xuICAgICAgICBtcy5kdXJhdGlvbiA9IHZhbHVlO1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtkdXJhdGlvbjogdmFsdWV9KTtcbiAgICB9LFxuICAgIGNoYW5nZUludGVydmFsOiBmdW5jdGlvbigpe1xuICAgICAgICB2YXIgdmFsdWUgPSBSZWFjdC5maW5kRE9NTm9kZSh0aGlzLnJlZnMuaW50ZXJ2YWxJbnB1dCkudmFsdWUqMTtcbiAgICAgICAgbXMuaW50ZXJ2YWwgPSB2YWx1ZTtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7aW50ZXJ2YWw6IHZhbHVlfSk7XG4gICAgfSxcbiAgICBwbGF5OiBmdW5jdGlvbigpe1xuICAgICAgICBtcy5kaXJlY3Rpb24gPSB0cnVlO1xuICAgICAgICBpZih0aGlzLnN0YXRlLmlzUGxheWluZykge1xuICAgICAgICAgICAgbXMuc3RvcCgpO1xuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7aXNQbGF5aW5nOiBmYWxzZX0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgbXMucGxheSgoKSA9PiB7XG4gICAgICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7aW5kZXg6IG1zLmluZGV4fSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe2lzUGxheWluZzogdHJ1ZX0pO1xuICAgICAgICB9XG4gICAgfSxcbiAgICBuZXh0OiBmdW5jdGlvbigpe1xuICAgICAgICBtcy5kaXJlY3Rpb24gPSB0cnVlO1xuICAgICAgICBtcy5tb3JwaCgoKSA9PiB7XG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHtpbmRleDptcy5pbmRleH0pO1xuICAgICAgICB9KTtcbiAgICB9LFxuICAgIHByZXY6IGZ1bmN0aW9uKCl7XG4gICAgICAgIG1zLmRpcmVjdGlvbiA9IGZhbHNlO1xuICAgICAgICBtcy5tb3JwaCgoKSA9PiB7XG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHtpbmRleDptcy5pbmRleH0pO1xuICAgICAgICB9KTtcbiAgICB9LFxuICAgIGNyZWF0ZUZhY2VzOiBmdW5jdGlvbihwb2ludHMpIHtcbiAgICAgICAgLy/jg5zjg63jg47jgqTlpInmj5vplqLmlbBcbiAgICAgICAgdmFyIHZvcm9ub2kgPSBkMy5nZW9tLnZvcm9ub2koKVxuICAgICAgICAgICAgLngoZnVuY3Rpb24gKGQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZC54XG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgLnkoZnVuY3Rpb24gKGQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZC55XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAvL+ODieODreODjeODvOW6p+aomeODh+ODvOOCv+WPluW+l1xuICAgICAgICB2YXIgZmFjZXMgPSB2b3Jvbm9pLnRyaWFuZ2xlcyhwb2ludHMpO1xuICAgICAgICBmYWNlcy5mb3JFYWNoKGZ1bmN0aW9uKGZhY2UsIGluZGV4KXtcbiAgICAgICAgICAgIGZhY2VzW2luZGV4XSA9IFtcbiAgICAgICAgICAgICAgICBwb2ludHMuaW5kZXhPZihmYWNlc1tpbmRleF1bMF0pLFxuICAgICAgICAgICAgICAgIHBvaW50cy5pbmRleE9mKGZhY2VzW2luZGV4XVsxXSksXG4gICAgICAgICAgICAgICAgcG9pbnRzLmluZGV4T2YoZmFjZXNbaW5kZXhdWzJdKVxuICAgICAgICAgICAgXTtcbiAgICAgICAgfSlcblxuICAgICAgICByZXR1cm4gZmFjZXM7XG4gICAgfSxcbiAgICB0b2dnbGVQcmV2aWV3OiBmdW5jdGlvbigpIHtcbiAgICAgICAgaWYoIXRoaXMuc3RhdGUuaXNQcmV2aWV3aW5nKXtcbiAgICAgICAgICAgIHRoaXMucHJldmlldygpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe2lzUHJldmlld2luZzogIXRoaXMuc3RhdGUuaXNQcmV2aWV3aW5nfSk7XG4gICAgfSxcbiAgICBwcmV2aWV3OiBmdW5jdGlvbigpIHtcbiAgICAgICAgaWYoIW1zLmlzQW5pbWF0aW5nKSB7XG4gICAgICAgICAgICBtcy5jbGVhcigpO1xuICAgICAgICAgICAgbXMuc2V0RmFjZXModGhpcy5zdGF0ZS5zbGlkZXNbdGhpcy5zdGF0ZS5iYXNlSW5kZXhdLmZhY2VzKTtcbiAgICAgICAgICAgIHRoaXMuc3RhdGUuc2xpZGVzLmZvckVhY2goKHNsaWRlKSA9PiB7XG4gICAgICAgICAgICAgICAgdmFyIHBvaW50cyA9IHNsaWRlLnBvaW50cy5tYXAoKHBvaW50KT0+e1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gW3BvaW50LnggLyBzbGlkZS53aWR0aCwgcG9pbnQueSAvIHNsaWRlLmhlaWdodF07XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgbXMuYWRkU2xpZGUoc2xpZGUuc3JjLCBwb2ludHMsICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7d2lkdGg6IG1zLndpZHRoLCBoZWlnaHQ6IG1zLmhlaWdodH0pO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9LFxuICAgIHNhdmU6IGZ1bmN0aW9uKCkgey8v44Gy44Go44G+44GabG9jYWxTdHJhZ2Xjgavkv53lrZhcbiAgICAgICAgbG9jYWxTdG9yYWdlLnN0YXRlID0gSlNPTi5zdHJpbmdpZnkodGhpcy5zdGF0ZSk7XG4gICAgfSxcbiAgICBnZXRDb2RlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIFwidmFyIG1vcnBoaW5nU2xpZGVyID0gbmV3IE1vcnBoaW5nU2xpZGVyKCdbQ09OVEFJTkVSX0lEXScpO1xcblwiXG4gICAgICAgICAgICArIFwibW9ycGhpbmdTbGlkZXIuc2V0RmFjZXMoXCIgKyBKU09OLnN0cmluZ2lmeSh0aGlzLnN0YXRlLnNsaWRlc1t0aGlzLnN0YXRlLmJhc2VJbmRleF0uZmFjZXMpICsgXCIpXFxuXCJcbiAgICAgICAgICAgICsgXCJtb3JwaGluZ1NsaWRlci5pbnRlcnZhbCA9IFwiICsgdGhpcy5zdGF0ZS5pbnRlcnZhbCArIFwiO1xcblwiXG4gICAgICAgICAgICArIFwibW9ycGhpbmdTbGlkZXIuZHVyYXRpb24gPSBcIiArIHRoaXMuc3RhdGUuZHVyYXRpb24gKyBcIjtcXG5cIlxuICAgICAgICAgICAgKyBcIm1vcnBoaW5nU2xpZGVyLmVhc2luZyA9ICdcIiArIHRoaXMuc3RhdGUuZWFzaW5nICsgXCInO1xcblwiXG4gICAgfSxcbiAgICByZW5kZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgZWFzaW5ncyA9IE9iamVjdC5rZXlzKEVhc2luZ0Z1bmN0aW9ucykubWFwKGZ1bmN0aW9uKG5hbWUpe1xuICAgICAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgICAgICA8b3B0aW9uIHZhbHVlPXtuYW1lfT57bmFtZX08L29wdGlvbj5cbiAgICAgICAgICAgICk7XG4gICAgICAgIH0pO1xuICAgICAgICB2YXIgcG9pbnRzID0gdGhpcy5zdGF0ZS5zbGlkZXMubWFwKChzbGlkZSwgaW5kZXgpID0+IHtcbiAgICAgICAgICAgIGlmKHRoaXMuc3RhdGUuaW5kZXggPT09IGluZGV4KSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ2aWV3ZXItcG9pbnQgdmlld2VyLXBvaW50LW5vd1wiPjwvZGl2PlxuICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ2aWV3ZXItcG9pbnRcIj48L2Rpdj5cbiAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICB2YXIgZWRpdG9yV2lkdGggPSAwO1xuICAgICAgICB0aGlzLnN0YXRlLnNsaWRlcy5mb3JFYWNoKGZ1bmN0aW9uKHNsaWRlKXtcbiAgICAgICAgICAgIGVkaXRvcldpZHRoICs9IHNsaWRlLndpZHRoICsgNDA7XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgPGRpdiBpZD1cImFwcFwiIG9uTW91c2VNb3ZlPXt0aGlzLmhhbmRsZU1vdXNlTW92ZX0gb25Nb3VzZVVwPXt0aGlzLmhhbmRsZU1vdXNlVXB9IG9uRHJvcD17dGhpcy5oYW5kbGVGaWxlU2VsZWN0fSBvbkRyYWdPdmVyPXt0aGlzLmhhbmRsZURyYWdPdmVyfT5cbiAgICAgICAgICAgICAgICA8RWRpdG9yIHdpZHRoPXtlZGl0b3JXaWR0aH0gc2xpZGVzPXt0aGlzLnN0YXRlLnNsaWRlc30gbW92aW5nUG9pbnQ9e3RoaXMuc3RhdGUubW92aW5nUG9pbnR9IGFkZFNsaWRlPXt0aGlzLmFkZFNsaWRlfSByZWY9XCJlZGl0b3JcIiBzdGFydE1vdmluZ1BvaW50PXt0aGlzLnN0YXJ0TW92aW5nUG9pbnR9IGFkZFBvaW50PXt0aGlzLmFkZFBvaW50fSByZW1vdmVQb2ludD17dGhpcy5yZW1vdmVQb2ludH0gcmVtb3ZlU2xpZGU9e3RoaXMucmVtb3ZlU2xpZGV9PjwvRWRpdG9yPlxuICAgICAgICAgICAgICAgIDx0ZXh0YXJlYSBjbGFzc05hbWU9XCJjb2RlXCIgdmFsdWU9e3RoaXMuZ2V0Q29kZSgpfSByZWFkT25seT48L3RleHRhcmVhPlxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiY2xlYXJcIj48L2Rpdj5cbiAgICAgICAgICAgICAgICA8ZGl2IGlkPVwidmlld2VyLWNvbnRhaW5lclwiIGNsYXNzTmFtZT17XCJ2aWV3ZXItY29udGFpbmVyLVwiICsgKHRoaXMuc3RhdGUuaXNQcmV2aWV3aW5nID8gXCJvcGVuZWRcIiA6IFwiY2xvc2VkXCIpfT5cbiAgICAgICAgICAgICAgICAgICAgPGRpdiBpZD1cInZpZXdlclwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBpZD1cInZpZXdlci1zbGlkZXJcIiBzdHlsZT17e3dpZHRoOiB0aGlzLnN0YXRlLndpZHRofX0+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPGJ1dHRvbiBpZD1cInZpZXdlci1uZXh0LWJ1dHRvblwiIG9uQ2xpY2s9e3RoaXMubmV4dH0gc3R5bGU9e3t0b3A6IHRoaXMuc3RhdGUuaGVpZ2h0LzJ9fT5OZXh0PC9idXR0b24+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPGJ1dHRvbiBpZD1cInZpZXdlci1wcmV2LWJ1dHRvblwiIG9uQ2xpY2s9e3RoaXMucHJldn0gc3R5bGU9e3t0b3A6IHRoaXMuc3RhdGUuaGVpZ2h0LzJ9fT5QcmV2PC9idXR0b24+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBpZD1cInZpZXdlci1wbGF5LWJ1dHRvbi1jb250YWluZXJcIiBzdHlsZT17e2hlaWdodDogdGhpcy5zdGF0ZS5oZWlnaHQsIHdpZHRoOiB0aGlzLnN0YXRlLndpZHRofX0+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgaWQ9XCJ2aWV3ZXItcGxheS1idXR0b25cIiBjbGFzc05hbWU9e3RoaXMuc3RhdGUuaXNQbGF5aW5nP1widmlld2VyLXBsYXktYnV0dG9uLXBhdXNlXCI6XCJcIn0gb25DbGljaz17dGhpcy5wbGF5fSBzdHlsZT17e3RvcDogdGhpcy5zdGF0ZS5oZWlnaHQvMiwgbGVmdDogdGhpcy5zdGF0ZS53aWR0aC8yfX0+PC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgaWQ9XCJ2aWV3ZXItb3B0aW9uXCIgc3R5bGU9e3t3aWR0aDogdGhpcy5zdGF0ZS53aWR0aH19PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxsYWJlbD5FYXNpbmc6IDxzZWxlY3QgcmVmPVwiZWFzaW5nU2VsZWN0XCIgaWQ9XCJlYXNpbmctc2VsZWN0XCIgb25DaGFuZ2U9e3RoaXMuY2hhbmdlRWFzaW5nfT57ZWFzaW5nc308L3NlbGVjdD48L2xhYmVsPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxsYWJlbD5EdXJhdGlvbjogPGlucHV0IHJlZj1cImR1cmF0aW9uSW5wdXRcIiB0eXBlPVwibnVtYmVyXCIgaWQ9XCJkdXJhdGlvbi1pbnB1dFwiIG1pbj1cIjEwMFwiIG9uQ2hhbmdlPXt0aGlzLmNoYW5nZWR1cmF0aW9ufSB2YWx1ZT17dGhpcy5zdGF0ZS5kdXJhdGlvbn0+PC9pbnB1dD48L2xhYmVsPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxsYWJlbD5JbnRlcnZhbCBvZiBBdXRvcGxheTogPGlucHV0IHJlZj1cImludGVydmFsSW5wdXRcIiB0eXBlPVwibnVtYmVyXCIgaWQ9XCJpbnRlcnZhbC1pbnB1dFwiIG1pbj1cIjBcIiBvbkNoYW5nZT17dGhpcy5jaGFuZ2VJbnRlcnZhbH0gdmFsdWU9e3RoaXMuc3RhdGUuaW50ZXJ2YWx9PjwvaW5wdXQ+PC9sYWJlbD5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGlkPVwidmlld2VyLXBvaW50c1wiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7cG9pbnRzfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgIDxidXR0b24gaWQ9XCJwcmV2aWV3LWJ1dHRvblwiIG9uQ2xpY2s9e3RoaXMudG9nZ2xlUHJldmlld30+UHJldmlldzwvYnV0dG9uPlxuICAgICAgICAgICAgICAgIDxidXR0b24gaWQ9XCJzYXZlLWJ1dHRvblwiIG9uQ2xpY2s9e3RoaXMuc2F2ZX0+U2F2ZTwvYnV0dG9uPlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICk7XG4gICAgfVxufSk7XG5cbmV4cG9ydCBkZWZhdWx0IEFwcDsiLCJpbXBvcnQgU2xpZGVzIGZyb20gJy4vU2xpZGVzLmpzJztcblxudmFyIEVkaXRvciA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcbiAgICByZW5kZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgPGRpdiBpZD1cImVkaXRvclwiIHN0eWxlPXt7d2lkdGg6IHRoaXMucHJvcHMud2lkdGh9fT5cbiAgICAgICAgICAgICAgICA8U2xpZGVzIHNsaWRlcz17dGhpcy5wcm9wcy5zbGlkZXN9IG1vdmluZ1BvaW50PXt0aGlzLnByb3BzLm1vdmluZ1BvaW50fSByZWY9XCJzbGlkZXNcIiBzdGFydE1vdmluZ1BvaW50PXt0aGlzLnByb3BzLnN0YXJ0TW92aW5nUG9pbnR9IGFkZFBvaW50PXt0aGlzLnByb3BzLmFkZFBvaW50fSByZW1vdmVQb2ludD17dGhpcy5wcm9wcy5yZW1vdmVQb2ludH0gcmVtb3ZlU2xpZGU9e3RoaXMucHJvcHMucmVtb3ZlU2xpZGV9PjwvU2xpZGVzPlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgIClcbiAgICB9XG59KTtcblxuZXhwb3J0IGRlZmF1bHQgRWRpdG9yOyIsInZhciBQb2ludCA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcbiAgICBnZXRJbml0aWFsU3RhdGU6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgaXNNb3VzZURvd246IGZhbHNlXG4gICAgICAgIH1cbiAgICB9LFxuICAgIGhhbmRsZU1vdXNlRG93bjogZnVuY3Rpb24oZSkge1xuICAgICAgICB0aGlzLnByb3BzLnN0YXJ0TW92aW5nUG9pbnQodGhpcy5wcm9wcy5pbmRleCk7XG4gICAgfSxcbiAgICBoYW5kbGVEb3VibGVDbGljazogZnVuY3Rpb24oKSB7Ly/jg4Djg5bjg6vjgq/jg6rjg4Pjgq/jgadQb2ludOOBruWJiumZpO+8iOOBn+OBoOOBl+OAgeWfuua6lueUu+WDj+OBruOBv++8iVxuICAgICAgICB0aGlzLnByb3BzLnJlbW92ZVBvaW50KHRoaXMucHJvcHMuaW5kZXgpO1xuICAgIH0sXG4gICAgcmVuZGVyOiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPXtcImVkaXRvci1zbGlkZS1wb2ludFwiICsgKHRoaXMucHJvcHMuaXNNb3ZpbmcgPyBcIiBtb3ZpbmdcIiA6IFwiXCIpfSBzdHlsZT17XG4gICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxlZnQ6IHRoaXMucHJvcHMueCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHRvcDogdGhpcy5wcm9wcy55XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9IG9uTW91c2VEb3duPXt0aGlzLmhhbmRsZU1vdXNlRG93bn0gb25Eb3VibGVDbGljaz17dGhpcy5oYW5kbGVEb3VibGVDbGlja30gb25EcmFnU3RhcnQ9e2Z1bmN0aW9uKGUpe2UucHJldmVudERlZmF1bHQoKTt9fT48L2Rpdj5cbiAgICAgICAgKVxuICAgIH1cbn0pO1xuXG5leHBvcnQgZGVmYXVsdCBQb2ludDsiLCJpbXBvcnQgUG9pbnQgZnJvbSAnLi9Qb2ludC5qcyc7XG5cbnZhciBQb2ludHMgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG4gICAgc3RhcnRNb3ZpbmdQb2ludDogZnVuY3Rpb24oaW5kZXgpIHsvL+OBqeOBrueUu+WDj+OBruOBqeOBruODneOCpOODs+ODiOOCkuWLleOBi+OBl+Wni+OCgeOBn+OBi+OCkkFwcOOBq+WxiuOBkeOCi1xuICAgICAgICB2YXIgcmVjdCA9IFJlYWN0LmZpbmRET01Ob2RlKHRoaXMucmVmcy5kaXYpLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgICAgICB0aGlzLnByb3BzLnN0YXJ0TW92aW5nUG9pbnQodGhpcy5wcm9wcy5pbmRleCwgaW5kZXgsIHJlY3QpO1xuICAgIH0sXG4gICAgaGFuZGxlQ2xpY2s6IGZ1bmN0aW9uKGUpIHsvL1BvaW505Lul5aSW44Gu5aC05omA44KS44Kv44Oq44OD44Kv44GX44Gf44KJYWRkUG9pbnTvvIhBcHDjgafln7rmupbnlLvlg4/jgYvjganjgYbjgYvliKTmlq3vvIlcbiAgICAgICAgaWYoZS50YXJnZXQuY2xhc3NOYW1lIT09XCJlZGl0b3Itc2xpZGUtcG9pbnRcIikgey8vUG9pbnTjgpLjgq/jg6rjg4Pjgq/jgZfjgZ/loLTlkIjjgoJoYW5kbGVDbGlja+OBleOCjOOCi+OBruOBp+OAgeOBteOCi+OBhOWIhuOBkVxuICAgICAgICAgICAgdmFyIHJlY3QgPSBlLnRhcmdldC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICAgICAgICAgIHRoaXMucHJvcHMuYWRkUG9pbnQodGhpcy5wcm9wcy5pbmRleCwge3g6IE1hdGgucm91bmQoZS5jbGllbnRYIC0gcmVjdC5sZWZ0KSwgeTogTWF0aC5yb3VuZChlLmNsaWVudFkgLSByZWN0LnRvcCl9KTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiYWRkXCIpO1xuICAgICAgICB9XG4gICAgfSxcbiAgICByZW1vdmVQb2ludDogZnVuY3Rpb24oaW5kZXgpIHsvL+Wfuua6lueUu+WDj+OBquOCiVBvaW5044Gu5YmK6ZmkXG4gICAgICAgIHRoaXMucHJvcHMucmVtb3ZlUG9pbnQodGhpcy5wcm9wcy5pbmRleCwgaW5kZXgpO1xuICAgIH0sXG4gICAgcmVuZGVyOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIHBvaW50cyA9IHRoaXMucHJvcHMucG9pbnRzLm1hcCgocG9pbnQsIGluZGV4KSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gKDxQb2ludCBrZXk9e1wicG9pbnRzLVwiICsgdGhpcy5wcm9wcy5pbmRleCArIFwiLVwiICsgaW5kZXh9IGlzTW92aW5nPXsodGhpcy5wcm9wcy5tb3ZpbmdQb2ludCA9PT0gaW5kZXgpfSBpbmRleD17aW5kZXh9IHg9e3BvaW50Lnh9IHk9e3BvaW50Lnl9IHN0YXJ0TW92aW5nUG9pbnQ9e3RoaXMuc3RhcnRNb3ZpbmdQb2ludH0gcmVtb3ZlUG9pbnQ9e3RoaXMucmVtb3ZlUG9pbnR9PjwvUG9pbnQ+KVxuICAgICAgICB9KTtcbiAgICAgICAgdmFyIGZhY2VzID0gdGhpcy5wcm9wcy5mYWNlcy5tYXAoKGZhY2UpID0+IHsvL+S4ieinkuW9ouOBruaPj+eUu1xuICAgICAgICAgICAgdmFyIGEgPSB0aGlzLnByb3BzLnBvaW50c1tmYWNlWzBdXTtcbiAgICAgICAgICAgIHZhciBiID0gdGhpcy5wcm9wcy5wb2ludHNbZmFjZVsxXV07XG4gICAgICAgICAgICB2YXIgYyA9IHRoaXMucHJvcHMucG9pbnRzW2ZhY2VbMl1dO1xuICAgICAgICAgICAgdmFyIHBhdGggPSBcIk1cIiArIGEueCArIFwiIFwiICsgYS55ICsgXCIgTFwiICsgYi54ICsgXCIgXCIgKyBiLnkgKyBcIiBMXCIgKyBjLnggKyBcIiBcIiArIGMueSArIFwiWlwiO1xuICAgICAgICAgICAgcmV0dXJuICg8cGF0aCBzdHJva2U9XCJyZ2JhKDAsMCwwLDAuMSlcIiBmaWxsPVwibm9uZVwiIGQ9e3BhdGh9PjwvcGF0aD4pO1xuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIDxkaXYgcmVmPVwiZGl2XCIgY2xhc3NOYW1lPVwiZWRpdG9yLXNsaWRlLXBvaW50cy1jb250YWluZXJcIiBvbk1vdXNlTW92ZT17dGhpcy5oYW5kbGVNb3VzZU1vdmV9IG9uTW91c2VVcD17dGhpcy5oYW5kbGVNb3VzZVVwfSBvbkNsaWNrPXt0aGlzLmhhbmRsZUNsaWNrfSBzdHlsZT17e3dpZHRoOiB0aGlzLnByb3BzLndpZHRoLCBoZWlnaHQ6IHRoaXMucHJvcHMuaGVpZ2h0fX0+XG4gICAgICAgICAgICAgICAge3BvaW50c31cbiAgICAgICAgICAgICAgICA8c3ZnIHZpZXdCb3g9e1wiMCAwIFwiICsgdGhpcy5wcm9wcy53aWR0aCArIFwiIFwiICsgdGhpcy5wcm9wcy5oZWlnaHR9PlxuICAgICAgICAgICAgICAgICAgICB7ZmFjZXN9XG4gICAgICAgICAgICAgICAgPC9zdmc+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgKTtcbiAgICB9XG59KTtcblxuZXhwb3J0IGRlZmF1bHQgUG9pbnRzOyIsImltcG9ydCBQb2ludHMgZnJvbSAnLi9Qb2ludHMuanMnO1xuXG52YXIgU2xpZGUgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG4gICAgcmVtb3ZlU2xpZGU6IGZ1bmN0aW9uKCkgey8vaW5kZXjjgpJBcHDjgavpgIHjgaPjgabliYrpmaRcbiAgICAgICAgdGhpcy5wcm9wcy5yZW1vdmVTbGlkZSh0aGlzLnByb3BzLmluZGV4KTtcbiAgICB9LFxuICAgIGdldEpTT05TdHJpbmc6IGZ1bmN0aW9uKCkgey8vUG9pbnRz44GoRmFjZXPjgpLooajnpLpcbiAgICAgICAgdmFyIHdpZHRoID0gdGhpcy5wcm9wcy5zbGlkZS53aWR0aDtcbiAgICAgICAgdmFyIGhlaWdodCA9IHRoaXMucHJvcHMuc2xpZGUuaGVpZ2h0O1xuICAgICAgICB2YXIgcm91bmQgPSBNYXRoLnJvdW5kO1xuICAgICAgICBpZih0aGlzLnByb3BzLnNsaWRlLnBvaW50cykge1xuICAgICAgICAgICAgdmFyIHBvaW50cyA9IHRoaXMucHJvcHMuc2xpZGUucG9pbnRzLm1hcCgocG9pbnQpPT4ge1xuICAgICAgICAgICAgICAgIHJldHVybiBbcm91bmQocG9pbnQueCAvIHdpZHRoICogMTAwKSAvIDEwMCwgcm91bmQocG9pbnQueSAvIGhlaWdodCAqIDEwMCkgLyAxMDBdO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICByZXR1cm4gJ21vcnBoaW5nU2xpZGVyLmFkZFNsaWRlKCcgKyB0aGlzLnByb3BzLnNsaWRlLm5hbWUgKyAnLCAnICsgSlNPTi5zdHJpbmdpZnkocG9pbnRzKSArICcpOyc7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gJyc7XG4gICAgICAgIH1cbiAgICB9LFxuICAgIHJlbmRlcjogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImVkaXRvci1zbGlkZS1jb250YWluZXJcIiBzdHlsZT17e3dpZHRoOiB0aGlzLnByb3BzLnNsaWRlLndpZHRofX0+XG4gICAgICAgICAgICAgICAgPFBvaW50cyBpbmRleD17dGhpcy5wcm9wcy5pbmRleH0gbW92aW5nUG9pbnQ9e3RoaXMucHJvcHMubW92aW5nUG9pbnR9IHdpZHRoPXt0aGlzLnByb3BzLnNsaWRlLndpZHRoID8gdGhpcy5wcm9wcy5zbGlkZS53aWR0aCA6IDB9IGhlaWdodD17dGhpcy5wcm9wcy5zbGlkZS5oZWlnaHQgPyB0aGlzLnByb3BzLnNsaWRlLmhlaWdodCA6IDB9XG4gICAgICAgICAgICAgICAgICAgICAgICBwb2ludHM9e3RoaXMucHJvcHMuc2xpZGUucG9pbnRzID8gdGhpcy5wcm9wcy5zbGlkZS5wb2ludHMgOiBbXX1cbiAgICAgICAgICAgICAgICAgICAgICAgIGZhY2VzPXt0aGlzLnByb3BzLnNsaWRlLmZhY2VzID8gdGhpcy5wcm9wcy5zbGlkZS5mYWNlcyA6IFtdfVxuICAgICAgICAgICAgICAgICAgICAgICAgc3RhcnRNb3ZpbmdQb2ludD17dGhpcy5wcm9wcy5zdGFydE1vdmluZ1BvaW50fSBhZGRQb2ludD17dGhpcy5wcm9wcy5hZGRQb2ludH0gcmVtb3ZlUG9pbnQ9e3RoaXMucHJvcHMucmVtb3ZlUG9pbnR9PjwvUG9pbnRzPlxuICAgICAgICAgICAgICAgIDxpbWcgc3JjPXt0aGlzLnByb3BzLnNsaWRlLnNyY30gcmVmPVwiaW1nXCI+PC9pbWc+XG4gICAgICAgICAgICAgICAgPHRleHRhcmVhIGNsYXNzTmFtZT1cImVkaXRvci1zbGlkZS1kYXRhXCIgdmFsdWU9e3RoaXMuZ2V0SlNPTlN0cmluZygpfSByZWFkT25seT48L3RleHRhcmVhPlxuICAgICAgICAgICAgICAgIDxidXR0b24gY2xhc3NOYW1lPVwiZWRpdG9yLXNsaWRlLXJlbW92ZS1idXR0b25cIiBvbkNsaWNrPXt0aGlzLnJlbW92ZVNsaWRlfT7DlzwvYnV0dG9uPlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICk7XG4gICAgfVxufSk7XG5cbmV4cG9ydCBkZWZhdWx0IFNsaWRlOyIsImltcG9ydCBTbGlkZSBmcm9tICcuL1NsaWRlLmpzJztcblxudmFyIFNsaWRlcyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcbiAgICByZW5kZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgc2xpZGVzID0gdGhpcy5wcm9wcy5zbGlkZXMubWFwKChzbGlkZSwgaW5kZXgpID0+IHtcbiAgICAgICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICAgICAgPFNsaWRlIHJlZj17XCJTbGlkZVwiK2luZGV4fSBrZXk9e1wic2xpZGUtY29udGFpbmVyLVwiICsgaW5kZXh9IGluZGV4PXtpbmRleH0gc2xpZGU9e3NsaWRlfSBtb3ZpbmdQb2ludD17dGhpcy5wcm9wcy5tb3ZpbmdQb2ludH0gc3RhcnRNb3ZpbmdQb2ludD17dGhpcy5wcm9wcy5zdGFydE1vdmluZ1BvaW50fSBhZGRQb2ludD17dGhpcy5wcm9wcy5hZGRQb2ludH0gcmVtb3ZlUG9pbnQ9e3RoaXMucHJvcHMucmVtb3ZlUG9pbnR9IHJlbW92ZVNsaWRlPXt0aGlzLnByb3BzLnJlbW92ZVNsaWRlfT48L1NsaWRlPlxuICAgICAgICAgICAgKTtcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICA8ZGl2IGlkPVwiZWRpdG9yLXNsaWRlc1wiPlxuICAgICAgICAgICAgICAgIHtzbGlkZXN9XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgKTtcbiAgICB9XG59KTtcblxuZXhwb3J0IGRlZmF1bHQgU2xpZGVzOyIsInZhciBFYXNpbmdGdW5jdGlvbnMgPSB7XG4gICAgLy8gbm8gZWFzaW5nLCBubyBhY2NlbGVyYXRpb25cbiAgICBsaW5lYXI6IGZ1bmN0aW9uICh0KSB7IHJldHVybiB0IH0sXG4gICAgLy8gYWNjZWxlcmF0aW5nIGZyb20gemVybyB2ZWxvY2l0eVxuICAgIGVhc2VJblF1YWQ6IGZ1bmN0aW9uICh0KSB7IHJldHVybiB0KnQgfSxcbiAgICAvLyBkZWNlbGVyYXRpbmcgdG8gemVybyB2ZWxvY2l0eVxuICAgIGVhc2VPdXRRdWFkOiBmdW5jdGlvbiAodCkgeyByZXR1cm4gdCooMi10KSB9LFxuICAgIC8vIGFjY2VsZXJhdGlvbiB1bnRpbCBoYWxmd2F5LCB0aGVuIGRlY2VsZXJhdGlvblxuICAgIGVhc2VJbk91dFF1YWQ6IGZ1bmN0aW9uICh0KSB7IHJldHVybiB0PC41ID8gMip0KnQgOiAtMSsoNC0yKnQpKnQgfSxcbiAgICAvLyBhY2NlbGVyYXRpbmcgZnJvbSB6ZXJvIHZlbG9jaXR5XG4gICAgZWFzZUluQ3ViaWM6IGZ1bmN0aW9uICh0KSB7IHJldHVybiB0KnQqdCB9LFxuICAgIC8vIGRlY2VsZXJhdGluZyB0byB6ZXJvIHZlbG9jaXR5XG4gICAgZWFzZU91dEN1YmljOiBmdW5jdGlvbiAodCkgeyByZXR1cm4gKC0tdCkqdCp0KzEgfSxcbiAgICAvLyBhY2NlbGVyYXRpb24gdW50aWwgaGFsZndheSwgdGhlbiBkZWNlbGVyYXRpb25cbiAgICBlYXNlSW5PdXRDdWJpYzogZnVuY3Rpb24gKHQpIHsgcmV0dXJuIHQ8LjUgPyA0KnQqdCp0IDogKHQtMSkqKDIqdC0yKSooMip0LTIpKzEgfSxcbiAgICAvLyBhY2NlbGVyYXRpbmcgZnJvbSB6ZXJvIHZlbG9jaXR5XG4gICAgZWFzZUluUXVhcnQ6IGZ1bmN0aW9uICh0KSB7IHJldHVybiB0KnQqdCp0IH0sXG4gICAgLy8gZGVjZWxlcmF0aW5nIHRvIHplcm8gdmVsb2NpdHlcbiAgICBlYXNlT3V0UXVhcnQ6IGZ1bmN0aW9uICh0KSB7IHJldHVybiAxLSgtLXQpKnQqdCp0IH0sXG4gICAgLy8gYWNjZWxlcmF0aW9uIHVudGlsIGhhbGZ3YXksIHRoZW4gZGVjZWxlcmF0aW9uXG4gICAgZWFzZUluT3V0UXVhcnQ6IGZ1bmN0aW9uICh0KSB7IHJldHVybiB0PC41ID8gOCp0KnQqdCp0IDogMS04KigtLXQpKnQqdCp0IH0sXG4gICAgLy8gYWNjZWxlcmF0aW5nIGZyb20gemVybyB2ZWxvY2l0eVxuICAgIGVhc2VJblF1aW50OiBmdW5jdGlvbiAodCkgeyByZXR1cm4gdCp0KnQqdCp0IH0sXG4gICAgLy8gZGVjZWxlcmF0aW5nIHRvIHplcm8gdmVsb2NpdHlcbiAgICBlYXNlT3V0UXVpbnQ6IGZ1bmN0aW9uICh0KSB7IHJldHVybiAxKygtLXQpKnQqdCp0KnQgfSxcbiAgICAvLyBhY2NlbGVyYXRpb24gdW50aWwgaGFsZndheSwgdGhlbiBkZWNlbGVyYXRpb25cbiAgICBlYXNlSW5PdXRRdWludDogZnVuY3Rpb24gKHQpIHsgcmV0dXJuIHQ8LjUgPyAxNip0KnQqdCp0KnQgOiAxKzE2KigtLXQpKnQqdCp0KnQgfVxufTtcblxuZXhwb3J0IGRlZmF1bHQgRWFzaW5nRnVuY3Rpb25zOyJdfQ==
