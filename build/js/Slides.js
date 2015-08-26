"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var Slide = _interopRequire(require("./Slide.js"));

var Slides = React.createClass({
    displayName: "Slides",

    render: function render() {
        var _this = this;

        var slides = this.props.slides.map(function (slide, index) {
            return React.createElement(Slide, { ref: "Slide" + index, key: "slide-container-" + index, index: index, slide: slide, movingPoint: _this.props.movingPoint, startMovingPoint: _this.props.startMovingPoint, addPoint: _this.props.addPoint, removePoint: _this.props.removePoint, removeSlide: _this.props.removeSlide });
        });
        return React.createElement(
            "div",
            { id: "editor-slides" },
            slides
        );
    }
});

module.exports = Slides;