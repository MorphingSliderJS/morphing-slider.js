"use strict";

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

module.exports = Point;