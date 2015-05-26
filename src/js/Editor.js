import Images from './Images.js';

var Editor = React.createClass({
    render: function() {
        return (
            <div id="editor">
                <Images images={this.props.images} movingPoint={this.props.movingPoint} ref="images" startMovingPoint={this.props.startMovingPoint} addPoint={this.props.addPoint} removePoint={this.props.removePoint} removeImage={this.props.removeImage}></Images>
            </div>
        )
    }
});

export default Editor;