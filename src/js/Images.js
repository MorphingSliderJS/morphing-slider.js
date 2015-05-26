import Image from './Image.js';

var Images = React.createClass({
    render: function() {
        var images = this.props.images.map((image, index) => {
            return (
                <Image ref={"Image"+index} key={"image-container-" + index} index={index} image={image} movingPoint={this.props.movingPoint} startMovingPoint={this.props.startMovingPoint} addPoint={this.props.addPoint} removePoint={this.props.removePoint} removeImage={this.props.removeImage}></Image>
            );
        });
        return (
            <div id="editor-images">
                {images}
            </div>
        );
    }
});

export default Images;