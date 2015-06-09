import Slides from './Slides.js';

var Editor = React.createClass({
    render: function() {
        return (
            <div id="editor">
                <Slides slides={this.props.slides} movingPoint={this.props.movingPoint} ref="slides" startMovingPoint={this.props.startMovingPoint} addPoint={this.props.addPoint} removePoint={this.props.removePoint} removeSlide={this.props.removeSlide}></Slides>
            </div>
        )
    }
});

export default Editor;