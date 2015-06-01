import EasingFunctions from './easing.js';
import MorphingSlider from './MorphingSlider.js';
import MorphingImage from './MorphingImage.js';
import Editor from './Editor.js';

//テスト用
import testJSON from './../../build/js/test.js';

var stage, ms;

var App = React.createClass({
    getInitialState: function() {
        if(localStorage.state){
            return JSON.parse(localStorage.state);
        } else {

            //テスト用-------------------------------------------------------
            //localStorage.state = JSON.stringify(testJSON);
            //return testJSON;
            //--------------------------------------------------------------
            //
            return {
                images: [],
                movingPoint: -1,
                editingImage: -1,
                movingPointRect: null,
                baseIndex: 0,//基準画像
                width: 0,
                height: 0,
                transformEasing: linear,
                alphaEasing: linear,
                dulation: 200,
                index: 0
            }
        }
    },
    componentDidMount: function() {
        stage = new createjs.Stage("viewer-canvas");
        ms = new MorphingSlider(stage);
    },
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
                this.addImage(e.target.result);
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
    addImage: function(dataURL) {
        var newImage = {
            src: dataURL,
            index: this.state.images.length
        };
        this.setState({images: this.state.images.concat([newImage])}, () => {
            var imageDOM = React.findDOMNode(this.refs.editor.refs.images.refs["Image" + newImage.index].refs.img);//Reactによりレンダー済みのDOM
            var width = imageDOM.width, height = imageDOM.height;
            var points, faces;
            if(newImage.index>0){
                points = this.state.images[this.state.baseIndex].points.concat(); //基準画像の物をコピー
                faces = this.state.images[this.state.baseIndex].faces.concat(); //基準画像の物をコピー
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
    handleMouseMove: function(e) {
        if(this.state.movingPoint>=0){
            var rect = this.state.movingPointRect,
                x = e.clientX - rect.left,
                y = e.clientY - rect.top;

            //はみ出ないように
            x = x < 0 ? 0 : x;
            x = x > rect.width ? rect.width : x;
            y = y < 0 ? 0 : y;
            y = y > rect.height ? rect.height : y;

            this.movePoint({x: x, y: y});
        }
    },
    handleMouseUp: function() {
        if(this.state.editingImage>-1) {
            this.setState({editingImage: -1, movingPoint: -1});
        }
    },
    movePoint: function(point) {
        var images = this.state.images.concat();
        images[this.state.editingImage].points[this.state.movingPoint] = point;
        this.setState({images: images});
    },
    startMovingPoint: function(editingImage, movingPoint, movingPointRect) {
        this.setState({editingImage: editingImage, movingPoint: movingPoint, movingPointRect: movingPointRect});
    },
    addPoint: function(index, point){
        if(index===this.state.baseIndex) {//基準画像ならPoint追加
            var images = this.state.images.concat();
            var baseImage = images[this.state.baseIndex];
            baseImage.points.push(point);
            baseImage.faces = this.createFaces(baseImage.points);//facesを作り直す
            images.forEach((image, index) => {//他のimageにもpointとfaceを追加
                if (this.state.baseIndex !== index) {
                    images[index].points.push({x: point.x, y: point.y});
                    images[index].faces = baseImage.faces;
                }
            });
            this.setState({images: images});
        }
    },
    removePoint: function(imageIndex, pointIndex) {//Pointの削除
        if(imageIndex === this.state.baseIndex) {//基準画像なら削除
            var images = this.state.images.concat();
            var baseImage = images[this.state.baseIndex];
            baseImage.points.splice(pointIndex, 1);
            baseImage.faces = this.createFaces(baseImage.points);//facesを作り直す
            images.forEach((image, index) => {//他のimageのpointを削除、faceを更新
                if (this.state.baseIndex !== index) {
                    images[index].points.splice(pointIndex, 1);
                    images[index].faces = baseImage.faces;
                }
            });
            this.setState({images: images});
        }
    },
    removeImage: function(index) {
        var images = this.state.images.concat();
        images.splice(index, 1);

        //*****基準画像を削除した場合の処理が必要*****

        this.setState({images: images});
    },
    changeTransformEasing: function(){
        var value = React.findDOMNode(this.refs.transformEasingSelect).options[select.selectedIndex].value;
        ms.transformEasing = value;
        this.setState({transformEasing: value});
    },
    changeAlphaEasing: function(){
        var value = React.findDOMNode(this.refs.alphaEasingSelect).options[select.selectedIndex].value;
        ms.alphaEasing = value;
        this.setState({alphaEasing: value});
    },
    changeDulation: function(){
        var value = React.findDOMNode(this.refs.dulationInput).value;
        ms.dulation = value;
        this.setState({dulation: value});
    },
    //play: function(){
    //    if(!ms.isAnimating) {
    //        ms.clear();
    //        this.state.images.forEach((image, index) => {
    //            var imageDOM = React.findDOMNode(this.refs.editor.refs.images.refs["Image" + index].refs.img);//Reactによりレンダー済みのDOM
    //            var mi = new MorphingImage(imageDOM, image.points, image.faces);
    //            ms.addImage(mi);
    //        });
    //        setTimeout(function(){ //1秒後にplay
    //            ms.play();
    //        }, 1000);
    //    }
    //},
    stop: function(){
        ms.stop();
    },
    next: function(){
        ms.morph(true, () => {
            this.setState({index:ms.index});
        });
    },
    prev: function(){
        ms.morph(false, () => {
            this.setState({index:ms.index});
        });
    },
    createFaces: function(points) {
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
    },
    togglePreview: function() {
        if(!this.state.isPreviewing){
            this.preview();
        }
        this.setState({isPreviewing: !this.state.isPreviewing});
    },
    preview: function() {
        if(!ms.isAnimating) {
            ms.clear();
            this.state.images.forEach((image, index) => {
                var imageDOM = React.findDOMNode(this.refs.editor.refs.images.refs["Image" + index].refs.img);//Reactによりレンダー済みのDOM
                var mi = new MorphingImage(imageDOM, image.points, image.faces);
                ms.addImage(mi);
            });
            this.setState({width: ms.width, height: ms.height}, function(){
                ms.stage.update();
            });
        }
    },
    save: function() {//ひとまずlocalStrageに保存
        localStorage.state = JSON.stringify(this.state);
    },
    render: function() {
        var easings = Object.keys(EasingFunctions).map(function(name){
            return (
                <option value={name}>{name}</option>
            );
        });
        var points = this.state.images.map((image, index) => {
            if(this.state.index === index) {
                return (
                    <div className="viewer-point viewer-point-now"></div>
                )
            } else {
                return (
                    <div className="viewer-point"></div>
                )
            }
        });
        return (
            <div id="app" onMouseMove={this.handleMouseMove} onMouseUp={this.handleMouseUp} onDrop={this.handleFileSelect} onDragOver={this.handleDragOver}>
                <Editor images={this.state.images} movingPoint={this.state.movingPoint} addImage={this.addImage} ref="editor" startMovingPoint={this.startMovingPoint} addPoint={this.addPoint} removePoint={this.removePoint} removeImage={this.removeImage}></Editor>
                <div id="viewer-container" className={"viewer-container-" + (this.state.isPreviewing ? "opened" : "closed")}>
                    <div id="viewer">
                        <div id="viewer-slider" style={{width: this.state.width}}>
                            <button id="viewer-next-button" onClick={this.next} style={{top: this.state.height/2}}>Next</button>
                            <button id="viewer-prev-button" onClick={this.prev} style={{top: this.state.height/2}}>Prev</button>
                            <canvas id="viewer-canvas" width={this.state.width} height={this.state.height}></canvas>
                        </div>
                        <div id="viewer-option" style={{width: this.state.width}}>
                            <label>Transform Easing: <select ref="transformEasingSelect" id="transform-easing-select" onChange={this.changeTransformEasing}>{easings}</select></label>
                            <label>Alpha Easing: <select ref="alphaEasingSelect" id="alpha-easing-select" onChange={this.changeAlphaEasing}>{easings}</select></label>
                            <label>Dulation: <input ref="dulationInput" type="number" id="dulation-input" min="100" onChange={this.changeDulation} value={this.state.dulation}></input></label>
                            <div id="viewer-points">
                                {points}
                            </div>
                        </div>
                    </div>
                </div>
                <button id="preview-button" onClick={this.togglePreview}>Preview</button>
                <button id="save-button" onClick={this.save}>Save</button>
            </div>
        );
    }
});

export default App;