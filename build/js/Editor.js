"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var Slides = _interopRequire(require("./Slides.js"));

var Editor = React.createClass({
    displayName: "Editor",

    render: function render() {
        return React.createElement(
            "div",
            { id: "editor", style: { width: this.props.width } },
            React.createElement(Slides, { slides: this.props.slides, movingPoint: this.props.movingPoint, ref: "slides", startMovingPoint: this.props.startMovingPoint, addPoint: this.props.addPoint, removePoint: this.props.removePoint, removeSlide: this.props.removeSlide })
        );
    }
});

module.exports = Editor;