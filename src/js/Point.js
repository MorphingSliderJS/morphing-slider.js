var Point = React.createClass({
    getInitialState: function() {
        return {
            isMouseDown: false
        }
    },
    handleMouseDown: function(e) {
        this.props.startMovingPoint(this.props.index);
    },
    handleDoubleClick: function() {//ダブルクリックでPointの削除（ただし、基準画像のみ）
        this.props.removePoint(this.props.index);
    },
    render: function() {
        return (
            <div className={"editor-slide-point" + (this.props.isMoving ? " moving" : "")} style={
                    {
                        left: this.props.x,
                        top: this.props.y
                    }
                } onMouseDown={this.handleMouseDown} onDoubleClick={this.handleDoubleClick} onDragStart={function(e){e.preventDefault();}}></div>
        )
    }
});

export default Point;