import EasingFunctions from './easing.js';
import MorphingSlider from './MorphingSlider.js';
import MorphingImage from './MorphingImage.js';

var stage, ms;

function createFaces(points) {
    //ボロノイ変換関数
    var voronoi = d3.geom.voronoi()
        .x(function (d) {
            return d.x
        })
        .y(function (d) {
            return d.y
        });

    //ドロネー座標データ取得
    var faces = voronoi.triangles(points);
    faces.forEach(function(face, index){
        faces[index] = [
            points.indexOf(faces[index][0]),
            points.indexOf(faces[index][1]),
            points.indexOf(faces[index][2])
        ];
    })

    return faces;
}

var Point = React.createClass({
    getInitialState: function() {
        return {
            isMouseDown: false
        }
    },
    handleMouseDown: function(e) {
        this.props.startMovingPoint(this.props.index);
    },
    render: function() {
        return (
            <div className="editor-image-point" style={
                    {
                        left: this.props.x,
                        top: this.props.y
                    }
                } onMouseDown={this.handleMouseDown}></div>
        )
    }
});

var Points = React.createClass({
    getInitialState: function() {
        return {
            movingPoint: -1 //動かしているポイントのインデックス
        }
    },
    handleMouseMove: function(e) {
        if(this.state.movingPoint>=0){
            var rect = React.findDOMNode(this.refs.div).getBoundingClientRect(),
                x = e.clientX - rect.left,
                y = e.clientY - rect.top;

            //はみ出ないように
            x = x < 0 ? 0 : x;
            x = x > rect.width ? rect.width : x;
            y = y < 0 ? 0 : y;
            y = y > rect.height ? rect.height : y;

            this.props.movePoint(this.props.index, this.state.movingPoint, {x: x, y: y});
        }
    },
    handleMouseUp: function() {
        this.setState({movingPoint: -1});
    },
    startMovingPoint: function(index) {
        this.setState({movingPoint: index});
    },
    handleClick: function(e) {//基準画像のポイント以外の場所をクリックしたらaddPoint
        if(this.props.index < 1 && e.target === React.findDOMNode(this.refs.div)){
            var rect = e.target.getBoundingClientRect();
            this.props.addPoint({x: e.clientX - rect.left, y: e.clientY - rect.top});
        }
    },
    render: function() {
        var points = this.props.points.map((point, index) => {
            return (<Point key={"points-" + this.props.index + "-" + index} index={index} x={point.x} y={point.y} startMovingPoint={this.startMovingPoint}></Point>)
        });
        return (
            <div ref="div" className="editor-image-points-container" onMouseMove={this.handleMouseMove} onMouseUp={this.handleMouseUp} onClick={this.handleClick} style={{width: this.props.width, height: this.props.height}}>
                {points}
            </div>
        );
    }
});

var Images = React.createClass({
    render: function() {
        var images = this.props.images.map((image, index) => {
            return (
                <div className="editor-image-container" key={"image-container-" + index}>
                    <Points index={index} width={image.width} height={image.height} points={image.points ? image.points : []} movePoint={this.props.movePoint} addPoint={this.props.addPoint}></Points>
                    <img index={index} src={image.src} ref={"image" + index} onDrop={function(e){e.preventDefault();}}></img>
                </div>
            );
        });
        return (
            <div id="editor-images">
                {images}
            </div>
        );
    }
});

var Editor = React.createClass({
    handleFileSelect: function(evt) {
        evt.stopPropagation();
        evt.preventDefault();

        console.log(evt);
        var files = evt.dataTransfer.files; // FileList object
        console.log(files);

        // Loop through the FileList and render image files as thumbnails.
        for (var i = 0, file; file = files[i]; i++) {

            // Only process image files.
            if (!file.type.match('image.*')) {
                continue;
            }

            var reader = new FileReader();

            // Closure to capture the file information.
            reader.onload = (e) => {
                console.log(e);
                this.props.addImage(e.target.result);
            }

            // Read in the image file as a data URL.
            reader.readAsDataURL(file);
        }
    },
    handleDragOver: function(evt) {
        evt.stopPropagation();
        evt.preventDefault();
        evt.dataTransfer.dropEffect = 'copy'; // Explicitly show this is a copy.
    },
    render: function() {
        return (
            <div id="editor">
                <Images images={this.props.images} ref="images" movePoint={this.props.movePoint} addPoint={this.props.addPoint}></Images>
                <div id="editor-dropzone" onDrop={this.handleFileSelect} onDragOver={this.handleDragOver}></div>
            </div>
        )
    }
});

var App = React.createClass({
    getInitialState: function() {
        return {
            images: []
        }
    },
    componentDidMount: function() {
        stage = new createjs.Stage("mycanvas");
        ms = new MorphingSlider(stage);
    },
    addImage: function(dataURL) {
        console.log(dataURL);
        var newImage = {
            src: dataURL,
            index: this.state.images.length
        };
        this.setState({images: this.state.images.concat([newImage])}, () => {
            var imageDOM = React.findDOMNode(this.refs.editor.refs.images.refs["image" + newImage.index]);//Reactによりレンダー済みのDOM
            var width = imageDOM.width, height = imageDOM.height;
            var points, faces;
            if(newImage.index>0){
                points = this.state.images[0].points.concat();
                faces = this.state.images[0].faces.concat();
            } else {//初期設定
                points = [
                    {x:0, y:0}, {x:width, y:0}, {x:width, y:height}, {x:0, y:height}, {x:width/2, y:height/2}
                ];
                faces = [[0, 1, 4], [1, 2, 4], [2, 3, 4], [3, 4, 0]];
            }
            var images = this.state.images.concat();
            images[newImage.index].points = points;
            images[newImage.index].faces = faces;
            images[newImage.index].width = width;
            images[newImage.index].height = height;
            this.setState({images: images});
        });
    },
    movePoint: function(firstIndex, secondIndex, point) {
        var images = this.state.images.concat();
        images[firstIndex].points[secondIndex] = point;
        this.setState({images: images});
    },
    addPoint: function(point){
        var images = this.state.images.concat();
        images[0].points.push(point);
        images[0].faces = createFaces(images[0].points);//facesを作り直す
        for(var i=1, l=images.length;i<l; i++){//他のimageにもpointとfaceを追加
            images[i].points.push({x: point.x, y: point.y});
            images[i].faces = images[0].faces;
        }
        console.log(point);
        this.setState({images: images});
    },
    changeTransformEasing: function(){
        var select = React.findDOMNode(this.refs.transformEasingSelect);
        ms.transformEasing = select.options[select.selectedIndex].value;
    },
    changeAlphaEasing: function(){
        var select = React.findDOMNode(this.refs.alphaEasingSelect);
        ms.alphaEasing = select.options[select.selectedIndex].value;
    },
    changeDulation: function(){
        var input = React.findDOMNode(this.refs.dulationInput);
        ms.dulation = input.value;
    },
    play: function(){
        console.log("play");
        if(!ms.isAnimating) {
            ms.clear();
            console.log(this.state.images);
            this.state.images.forEach((image, index) => {
                var imageDOM = React.findDOMNode(this.refs.editor.refs.images.refs["image" + index]);//Reactによりレンダー済みのDOM
                var mi = new MorphingImage(imageDOM, image.points, image.faces);
                ms.addImage(mi);
            });
            setTimeout(function(){
                ms.play();
            }, 1000);
        }
    },
    render: function() {
        var easings = Object.keys(EasingFunctions).map(function(name){
            return (
                <option value={name}>{name}</option>
                    );
        });
        return (
            <div id="app">
                <Editor images={this.state.images} addImage={this.addImage} ref="editor" movePoint={this.movePoint} addPoint={this.addPoint}></Editor>
                <button id="play-button" onClick={this.play}>Play</button>
                <canvas id="mycanvas" width="500" height="500"></canvas>
                <label>Transform Easing: <select ref="transformEasingSelect" id="transform-easing-select" onChange={this.changeTransformEasing}>{easings}</select></label>
                <label>Alpha Easing: <select ref="alphaEasingSelect" id="alpha-easing-select" onChange={this.changeAlphaEasing}>{easings}</select></label>
                <label>Dulation: <input ref="dulationInput" type="number" id="dulation-input" onChange={this.changeDulation}></input><button id="dulation-button">OK</button></label>
            </div>
        );
    }
});

React.render(
    <App></App>,
    document.getElementById('app-container')
);