"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var Points = _interopRequire(require("./Points.js"));

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
            React.createElement(Points, { index: this.props.index, movingPoint: this.props.movingPoint, width: this.props.slide.width ? this.props.slide.width : 0, height: this.props.slide.height ? this.props.slide.height : 0,
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

module.exports = Slide;