"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var Point = _interopRequire(require("./Point.js"));

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
            return React.createElement(Point, { key: "points-" + _this.props.index + "-" + index, isMoving: _this.props.movingPoint === index, index: index, x: point.x, y: point.y, startMovingPoint: _this.startMovingPoint, removePoint: _this.removePoint });
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

module.exports = Points;