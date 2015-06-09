import Points from './Points.js';

var Slide = React.createClass({
    removeSlide: function() {//indexをAppに送って削除
        this.props.removeSlide(this.props.index);
    },
    getJSONString: function() {//PointsとFacesを表示
        return JSON.stringify({
            points: this.props.slide.points,
            faces: this.props.slide.faces
        });
    },
    render: function() {
        return (
            <div className="editor-slide-container" style={{width: this.props.slide.width}}>
                <Points index={this.props.index} movingPoint={this.props.movingPoint} width={this.props.slide.width ? this.props.slide.width : 0} height={this.props.slide.height ? this.props.slide.height : 0}
                        points={this.props.slide.points ? this.props.slide.points : []}
                        faces={this.props.slide.faces ? this.props.slide.faces : []}
                        startMovingPoint={this.props.startMovingPoint} addPoint={this.props.addPoint} removePoint={this.props.removePoint}></Points>
                <img src={this.props.slide.src} ref="img"></img>
                <textarea className="editor-slide-data" value={this.getJSONString()} readOnly></textarea>
                <button className="editor-slide-remove-button" onClick={this.removeSlide}>×</button>
            </div>
        );
    }
});

export default Slide;