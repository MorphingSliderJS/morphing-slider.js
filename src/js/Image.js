import Points from './Points.js';

Image = React.createClass({
    removeImage: function() {//indexをAppに送って削除
        this.props.removeImage(this.props.index);
    },
    getJSONString: function() {//PointsとFacesを表示
        return JSON.stringify({
            points: this.props.image.points,
            faces: this.props.image.faces
        });
    },
    render: function() {
        return (
            <div className="editor-image-container">
                <Points index={this.props.index} movingPoint={this.props.movingPoint} width={this.props.image.width} height={this.props.image.height} points={this.props.image.points ? this.props.image.points : []} startMovingPoint={this.props.startMovingPoint} addPoint={this.props.addPoint} removePoint={this.props.removePoint}></Points>
                <img src={this.props.image.src} ref="img"></img>
                <button className="editor-image-remove-button" onClick={this.removeImage}>×</button>
                <textarea value={this.getJSONString()} readOnly></textarea>
            </div>
        );
    }
});

export default Image;