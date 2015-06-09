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
            <div className="editor-image-container" style={{width: this.props.image.width}}>
                <Points index={this.props.index} movingPoint={this.props.movingPoint} width={this.props.image.width ? this.props.image.width : 0} height={this.props.image.height ? this.props.image.height : 0}
                        points={this.props.image.points ? this.props.image.points : []}
                        faces={this.props.image.faces ? this.props.image.faces : []}
                        startMovingPoint={this.props.startMovingPoint} addPoint={this.props.addPoint} removePoint={this.props.removePoint}></Points>
                <img src={this.props.image.src} ref="img"></img>
                <textarea className="editor-image-data" value={this.getJSONString()} readOnly></textarea>
                <button className="editor-image-remove-button" onClick={this.removeImage}>×</button>
            </div>
        );
    }
});

export default Image;