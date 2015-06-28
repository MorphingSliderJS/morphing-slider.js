import Slide from './Slide.js';

var Slides = React.createClass({
    render: function() {
        var slides = this.props.slides.map((slide, index) => {
            return (
                <Slide ref={"Slide"+index} key={"slide-container-" + index} index={index} slide={slide} movingPoint={this.props.movingPoint} startMovingPoint={this.props.startMovingPoint} addPoint={this.props.addPoint} removePoint={this.props.removePoint} removeSlide={this.props.removeSlide}></Slide>
            );
        });
        return (
            <div id="editor-slides">
                {slides}
            </div>
        );
    }
});

export default Slides;