import EasingFunctions from './easing.js';
import MorphingSlider from './MorphingSlider.js';
import MorphingImage from './MorphingImage.js';

var img1 = document.getElementById("model1");
var img2 = document.getElementById("model2");

var images = [img1, img2];

img2.onload = init;

d3.select("#transform-easing-select").selectAll("option").data(Object.keys(EasingFunctions)).enter()
    .append("option").attr("value", function(d){
        return d;
    }).html(function(d){
        return d;
    });
d3.select("#alpha-easing-select").selectAll("option").data(Object.keys(EasingFunctions)).enter()
    .append("option").attr("value", function(d){
        return d;
    }).html(function(d){
        return d;
    });

function init() {

    var points = [
        new createjs.Point(0, 0),
        new createjs.Point(img1.width, 0),
        new createjs.Point(img1.width, img1.height),
        new createjs.Point(0, img1.height),
        new createjs.Point(img1.width / 2, img1.height / 2)
    ];

    var points2 = [
        new createjs.Point(0, 0),
        new createjs.Point(img2.width, 0),
        new createjs.Point(img2.width, img2.height),
        new createjs.Point(0, img2.height),
        new createjs.Point(img2.width / 2, img2.height / 2)
    ];

    var faces = createFaces(points);
    var faces2 = createFaces(points2);
    var stage = new createjs.Stage("mycanvas");
    var mi = new MorphingImage(img1, points, faces, stage);
    var mi2 = new MorphingImage(img2, points2, faces2, stage);
    var ms = new MorphingSlider();
    ms.addImage(mi);
    ms.addImage(mi2);
    drawPoint();

    var playButton = document.getElementById("play-button");
    playButton.addEventListener("click", function () {
        if(ms.isAnimating){
            return false;
        }
        ms.clear();
        mi = new MorphingImage(img1, points, faces, stage);
        mi2 = new MorphingImage(img2, points2, faces2, stage);
        ms.addImage(mi);
        ms.addImage(mi2);
        ms.play();
    });

    img1.addEventListener("click", function (e) {
        var rect = e.target.getBoundingClientRect();
        var point = new createjs.Point(e.clientX - rect.left, e.clientY - rect.top);
        points.push(point);
        points2.push(point.clone());
        faces = createFaces(points);
        faces2 = createFaces(points2);
        drawPoint();
    });

    function drawPoint() {
        d3.select("#container1 .points").selectAll("div").data(points).enter().append("div").style("left", function(d){
            return d.x + "px";
        }).style("top", function(d){
            return d.y + "px";
        }).call(d3.behavior.drag()
            .on("drag", function(d,i) {
                points[i].x = d3.event.x;
                points[i].y = d3.event.y;
                d3.select(this).style("left", points[i].x + "px").style("top", points[i].y + "px");
            }));
        d3.select("#container2 .points").selectAll("div").data(points2).enter().append("div").style("left", function(d){
            return d.x + "px";
        }).style("top", function(d){
            return d.y + "px";
        }).call(d3.behavior.drag()
            .on("drag", function(d,i) {
                points2[i].x = d3.event.x;
                points2[i].y = d3.event.y;
                d3.select(this).style("left", points2[i].x + "px").style("top", points2[i].y + "px");
            }));
    }

    //イージングの切り替え
    document.getElementById("transform-easing-select").addEventListener("change", function(){
        ms.transformEasing = this.options[this.selectedIndex].value;
    });
    document.getElementById("alpha-easing-select").addEventListener("change", function(){
        ms.alphaEasing = this.options[this.selectedIndex].value;
    });

    //アニメーション時間の設定
    var dulationInput = document.getElementById("dulation-input");
    dulationInput.value = ms.dulation;
    document.getElementById("dulation-button").addEventListener("click", function(){
        ms.dulation = dulationInput.value;
    });


}

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
                } id={"editor-image-point-" + this.props.key} onMouseDown={this.handleMouseDown}></div>
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
            console.log(e.target);
            var rect = React.findDOMNode(this.refs.div).getBoundingClientRect();
            this.props.movePoint(this.props.index, this.state.movingPoint, {x: e.clientX - rect.left, y: e.clientY - rect.top});
        }
    },
    handleMouseUp: function() {
        this.setState({movingPoint: -1});
    },
    startMovingPoint: function(index) {
        this.setState({movingPoint: index});
    },
    render: function() {
        var points = this.props.points.map((point, index) => {
            return (<Point key={"points-" + this.props.index + "-" + index} index={index} x={point.x} y={point.y} startMovingPoint={this.startMovingPoint}></Point>)
        });
        return (
            <div ref="div" className="editor-image-points-container" onMouseMove={this.handleMouseMove} onMouseUp={this.handleMouseUp} style={{width: this.props.width, height: this.props.height}}>
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
                    <Points index={index} width={image.width} height={image.height} points={image.points ? image.points : []} movePoint={this.props.movePoint}></Points>
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
                <Images images={this.props.images} ref="images" movePoint={this.props.movePoint}></Images>
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
            } else {
                points = [
                    {x:0, y:0}, {x:width, y:0}, {x:width, y:height}, {x:0, y:height}, {x:width/2, y:height/2}
                ];
            }
            var images = this.state.images.concat();
            images[newImage.index].points = points;
            images[newImage.index].width = width;
            images[newImage.index].height = height;
            this.setState({images: images});
        });
    },
    movePoint: function(firstIndex, secondIndex, point) {
        console.log(secondIndex);
        var images = this.state.images.concat();
        images[firstIndex].points[secondIndex] = point;
        console.log(images);
        this.setState({images: images});
    },
    render: function() {
        return (
            <div id="app">
                <Editor images={this.state.images} addImage={this.addImage} ref="editor" movePoint={this.movePoint}></Editor>
                <canvas id="viewer" width={this.state.images[0] ? this.state.images[0].width : 300} height={this.state.images[0] ? this.state.images[0].height : 300}></canvas>
            </div>
        );
    }
});

React.render(
    <App></App>,
    document.getElementById('app-container')
);