import Point from './Point.js';

var Points = React.createClass({
    startMovingPoint: function(index) {//どの画像のどのポイントを動かし始めたかをAppに届ける
        var rect = React.findDOMNode(this.refs.div).getBoundingClientRect();
        this.props.startMovingPoint(this.props.index, index, rect);
    },
    handleClick: function(e) {//Point以外の場所をクリックしたらaddPoint（Appで基準画像かどうか判断）
        if(e.target===React.findDOMNode(this.refs.div)) {//Pointをクリックした場合もhandleClickされるので、ふるい分け
            var rect = e.target.getBoundingClientRect();
            this.props.addPoint(this.props.index, {x: e.clientX - rect.left, y: e.clientY - rect.top});
        }
    },
    removePoint: function(index) {//基準画像ならPointの削除
        this.props.removePoint(this.props.index, index);
    },
    render: function() {
        var points = this.props.points.map((point, index) => {
            return (<Point key={"points-" + this.props.index + "-" + index} isMoving={(this.props.movingPoint === index)} index={index} x={point.x} y={point.y} startMovingPoint={this.startMovingPoint} removePoint={this.removePoint}></Point>)
        });
        return (
            <div ref="div" className="editor-image-points-container" onMouseMove={this.handleMouseMove} onMouseUp={this.handleMouseUp} onClick={this.handleClick} style={{width: this.props.width, height: this.props.height}}>
                {points}
            </div>
        );
    }
});

export default Points;