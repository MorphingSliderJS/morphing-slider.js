import Point from './Point.js';

var Points = React.createClass({
    startMovingPoint: function(index) {//どの画像のどのポイントを動かし始めたかをAppに届ける
        var rect = React.findDOMNode(this.refs.div).getBoundingClientRect();
        this.props.startMovingPoint(this.props.index, index, rect);
    },
    handleClick: function(e) {//Point以外の場所をクリックしたらaddPoint（Appで基準画像かどうか判断）
        if(e.target.className!=="editor-image-point") {//Pointをクリックした場合もhandleClickされるので、ふるい分け
            var rect = e.target.getBoundingClientRect();
            this.props.addPoint(this.props.index, {x: Math.round(e.clientX - rect.left), y: Math.round(e.clientY - rect.top)});
            console.log("add");
        }
    },
    removePoint: function(index) {//基準画像ならPointの削除
        this.props.removePoint(this.props.index, index);
    },
    render: function() {
        var points = this.props.points.map((point, index) => {
            return (<Point key={"points-" + this.props.index + "-" + index} isMoving={(this.props.movingPoint === index)} index={index} x={point.x} y={point.y} startMovingPoint={this.startMovingPoint} removePoint={this.removePoint}></Point>)
        });
        var faces = this.props.faces.map((face) => {//三角形の描画
            var a = this.props.points[face[0]];
            var b = this.props.points[face[1]];
            var c = this.props.points[face[2]];
            var path = "M" + a.x + " " + a.y + " L" + b.x + " " + b.y + " L" + c.x + " " + c.y + "Z";
            return (<path stroke="rgba(0,0,0,0.1)" fill="none" d={path}></path>);
        });
        return (
            <div ref="div" className="editor-image-points-container" onMouseMove={this.handleMouseMove} onMouseUp={this.handleMouseUp} onClick={this.handleClick} style={{width: this.props.width, height: this.props.height}}>
                {points}
                <svg viewBox={"0 0 " + this.props.width + " " + this.props.height}>
                    {faces}
                </svg>
            </div>
        );
    }
});

export default Points;