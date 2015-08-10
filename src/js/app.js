import EasingFunctions from './easing.js';
import MorphingSlider from './MorphingSlider.js';
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
            localStorage.state = JSON.stringify(testJSON);
            return testJSON;
            //--------------------------------------------------------------
            //
            //
            //return {
            //    slides: [],
            //    movingPoint: -1,
            //    editingSlide: -1,
            //    movingPointRect: null,
            //    baseIndex: 0,//基準画像
            //    width: 0,
            //    height: 0,
            //    transformEasing: "linear",
            //    alphaEasing: "linear",
            //    duration: 200,
            //    interval: 1000,
            //    index: 0,
            //    isPlaying: false
            //}
        }
    },
    componentDidMount: function() {
        ms = new MorphingSlider("viewer-canvas");
    },
    handleFileSelect: function(evt) {
        evt.stopPropagation();
        evt.preventDefault();

        console.log(evt);
        var files = evt.dataTransfer.files; // FileList object
        console.log(files);

        // Loop through the FileList and render slide files as thumbnails.
        for (var i = 0, file; file = files[i]; i++) {

            // Only process slide files.
            if (!file.type.match('image.*')) {
                continue;
            }

            var reader = new FileReader();

            // Closure to capture the file information.
            reader.onload = (e) => {
                console.log(e);
                this.addSlide(e.target.result);
            }

            // Read in the slide file as a data URL.
            reader.readAsDataURL(file);
        }
    },
    handleDragOver: function(evt) {
        evt.stopPropagation();
        evt.preventDefault();
        evt.dataTransfer.dropEffect = 'copy'; // Explicitly show this is a copy.
    },
    addSlide: function(dataURL) {
        var newSlide = {
            src: dataURL,
            index: this.state.slides.length
        };
        this.setState({slides: this.state.slides.concat([newSlide])}, () => {
            var slideDOM = React.findDOMNode(this.refs.editor.refs.slides.refs["Slide" + newSlide.index].refs.img);//Reactによりレンダー済みのDOM
            var width = slideDOM.width, height = slideDOM.height;
            var points, faces;
            if(newSlide.index>0){
                points = this.state.slides[this.state.baseIndex].points.concat(); //基準画像の物をコピー
                faces = this.state.slides[this.state.baseIndex].faces.concat(); //基準画像の物をコピー
            } else {//初期設定
                points = [
                    {x:0, y:0}, {x:width, y:0}, {x:width, y:height}, {x:0, y:height}, {x:width/2, y:height/2}
                ];
                faces = [[0, 1, 4], [1, 2, 4], [2, 3, 4], [3, 4, 0]];
            }
            var slides = this.state.slides.concat();
            slides[newSlide.index].points = points;
            slides[newSlide.index].faces = faces;
            slides[newSlide.index].width = width;
            slides[newSlide.index].height = height;
            this.setState({slides: slides});
        });
    },
    handleMouseMove: function(e) {
        if(this.state.movingPoint>=0){
            var rect = this.state.movingPointRect,
                x = Math.round(e.clientX - rect.left),
                y = Math.round(e.clientY - rect.top);

            //はみ出ないように
            x = x < 0 ? 0 : x;
            x = x > rect.width ? rect.width : x;
            y = y < 0 ? 0 : y;
            y = y > rect.height ? rect.height : y;

            this.movePoint({x: x, y: y});
        }
    },
    handleMouseUp: function() {
        if(this.state.editingSlide>-1) {
            this.setState({editingSlide: -1, movingPoint: -1});
        }
    },
    movePoint: function(point) {
        var slides = this.state.slides.concat();
        slides[this.state.editingSlide].points[this.state.movingPoint] = point;
        this.setState({slides: slides});
    },
    startMovingPoint: function(editingSlide, movingPoint, movingPointRect) {
        this.setState({editingSlide: editingSlide, movingPoint: movingPoint, movingPointRect: movingPointRect});
    },
    addPoint: function(index, point){
        console.log(index);
        if(index===this.state.baseIndex) {//基準画像ならPoint追加
            var slides = this.state.slides.concat();
            var baseSlide = slides[this.state.baseIndex];
            baseSlide.points.push(point);
            baseSlide.faces = this.createFaces(baseSlide.points);//facesを作り直す
            slides.forEach((slide, index) => {//他のslideにもpointとfaceを追加
                if (this.state.baseIndex !== index) {
                    slides[index].points.push({x: point.x, y: point.y});
                    slides[index].faces = baseSlide.faces;
                }
            });
            this.setState({slides: slides});
        }
    },
    removePoint: function(slideIndex, pointIndex) {//Pointの削除
        if(slideIndex === this.state.baseIndex) {//基準画像なら削除
            var slides = this.state.slides.concat();
            var baseSlide = slides[this.state.baseIndex];
            baseSlide.points.splice(pointIndex, 1);
            baseSlide.faces = this.createFaces(baseSlide.points);//facesを作り直す
            slides.forEach((slide, index) => {//他のslideのpointを削除、faceを更新
                if (this.state.baseIndex !== index) {
                    slides[index].points.splice(pointIndex, 1);
                    slides[index].faces = baseSlide.faces;
                }
            });
            this.setState({slides: slides});
        }
    },
    removeSlide: function(index) {
        var slides = this.state.slides.concat();
        slides.splice(index, 1);

        //*****基準画像を削除した場合の処理が必要*****

        this.setState({slides: slides});
    },
    changeTransformEasing: function(){
        var select = React.findDOMNode(this.refs.transformEasingSelect);
        var value = select.options[select.selectedIndex].value;
        ms.transformEasing = value;
        this.setState({transformEasing: value});
    },
    changeAlphaEasing: function(){
        var select = React.findDOMNode(this.refs.alphaEasingSelect);
        var value = select.options[select.selectedIndex].value;
        ms.alphaEasing = value;
        this.setState({alphaEasing: value});
    },
    changeduration: function(){
        var value = React.findDOMNode(this.refs.durationInput).value*1;
        ms.duration = value;
        this.setState({duration: value});
    },
    changeInterval: function(){
        var value = React.findDOMNode(this.refs.intervalInput).value*1;
        ms.interval = value;
        this.setState({interval: value});
    },
    play: function(){
        if(this.state.isPlaying) {
            ms.stop();
            this.setState({isPlaying: false});
        } else {
            ms.play(true, this.state.interval, () => {
                this.setState({index: ms.index});
            });
            this.setState({isPlaying: true});
        }
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
            this.state.slides.forEach((slide, index) => {
                //var slideDOM = React.findDOMNode(this.refs.editor.refs.slides.refs["Slide" + index].refs.img);//Reactによりレンダー済みのDOM
                ms.addSlide(slide.src, slide, () => {
                    this.setState({width: ms.width, height: ms.height});
                });
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
        var points = this.state.slides.map((slide, index) => {
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
        var editorWidth = 0;
        this.state.slides.forEach(function(slide){
            editorWidth += slide.width + 40;
        });
        return (
            <div id="app" onMouseMove={this.handleMouseMove} onMouseUp={this.handleMouseUp} onDrop={this.handleFileSelect} onDragOver={this.handleDragOver}>
                <Editor width={editorWidth} slides={this.state.slides} movingPoint={this.state.movingPoint} addSlide={this.addSlide} ref="editor" startMovingPoint={this.startMovingPoint} addPoint={this.addPoint} removePoint={this.removePoint} removeSlide={this.removeSlide}></Editor>
                <div className="clear"></div>
                <div id="viewer-container" className={"viewer-container-" + (this.state.isPreviewing ? "opened" : "closed")}>
                    <div id="viewer">
                        <div id="viewer-slider" style={{width: this.state.width}}>
                            <button id="viewer-next-button" onClick={this.next} style={{top: this.state.height/2}}>Next</button>
                            <button id="viewer-prev-button" onClick={this.prev} style={{top: this.state.height/2}}>Prev</button>
                            <div id="viewer-play-button-container" style={{height: this.state.height, width: this.state.width}}>
                                <div id="viewer-play-button" className={this.state.isPlaying?"viewer-play-button-pause":""} onClick={this.play} style={{top: this.state.height/2, left: this.state.width/2}}></div>
                            </div>
                            <canvas id="viewer-canvas" width={this.state.width} height={this.state.height}></canvas>
                        </div>
                        <div id="viewer-option" style={{width: this.state.width}}>
                            <label>Transform Easing: <select ref="transformEasingSelect" id="transform-easing-select" onChange={this.changeTransformEasing}>{easings}</select></label>
                            <label>Alpha Easing: <select ref="alphaEasingSelect" id="alpha-easing-select" onChange={this.changeAlphaEasing}>{easings}</select></label>
                            <label>duration: <input ref="durationInput" type="number" id="duration-input" min="100" onChange={this.changeduration} value={this.state.duration}></input></label>
                            <label>Interval of Autoplay: <input ref="intervalInput" type="number" id="interval-input" min="0" onChange={this.changeInterval} value={this.state.interval}></input></label>
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