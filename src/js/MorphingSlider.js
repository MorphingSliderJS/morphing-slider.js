class MorphingSlider {
    constructor(stageURL) {
        this.stage = new createjs.Stage(stageURL);
        this.slides = [];
        this.easing = "linear";
        this.direction = true;
        this.duration = 500;
        this.interval = 1000;
        this.isAnimating = false;
        this.index = 0;//表示している画像のindex
        this.width = 0;
        this.height = 0;

        window.requestAnimationFrame = (function() {
            return window.requestAnimationFrame ||
                window.webkitRequestAnimationFrame ||
                window.mozRequestAnimationFrame ||
                window.msRequestAnimationFrame ||
                window.oRequestAnimationFrame ||
                function(f) { return window.setTimeout(f, 1000 / 60); };
        }());

        window.cancelAnimationFrame = (function() {
            return window.cancelAnimationFrame ||
                window.cancelRequestAnimationFrame ||
                window.webkitCancelAnimationFrame ||
                window.webkitCancelRequestAnimationFrame ||
                window.mozCancelAnimationFrame ||
                window.mozCancelRequestAnimationFrame ||
                window.msCancelAnimationFrame ||
                window.msCancelRequestAnimationFrame ||
                window.oCancelAnimationFrame ||
                window.oCancelRequestAnimationFrame ||
                function(id) { window.clearTimeout(id); };
        }());

        return this;
    }
    addSlide(src, data, callback) {
        var image = new Image();
        image.src = src;
        var morphingImage = new MorphingSlider.Slide(image, data.points, data.faces);
        if (this.slides.length > 0) {//最初以外は描画しない
            morphingImage.hide();
        }
        this.stage.addChild(morphingImage.container);
        this.slides.push(morphingImage);
        image.onload = () => {
            this.width = this.stage.canvas.width = this.width > image.width ? this.width : image.width;
            this.height = this.stage.canvas.height = this.height > image.height ? this.height : image.height;
            this.stage.update();
            if(callback!==undefined) {
                callback.bind(this)();
            }
        };
        return this;
    }
    morph(direction, callback) { //direction : trueで次、falseで前へ

        if(this.isAnimating || this.slides.length<2){ //アニメーションの重複を防ぐ
            return this;
        }

        var startTime = new Date();

        var _direction = (direction === undefined) ? this.direction : direction;//デフォルトはMorphSliderでの設定値

        var afterIndex;
        if(_direction && this.slides.length === this.index + 1) {//向きが通常でいま最後の画像なら
            afterIndex = 0;
        } else if(!_direction && this.index === 0){//向きが逆でいま最初の画像なら
            afterIndex = this.slides.length - 1;
        } else {
            afterIndex = this.index+(_direction*2-1);
        }
        var before = this.slides[this.index]; //いまのMorphingImage
        var after = this.slides[afterIndex]; //モーフィング後のMorphingImage

        //アニメーションするスライドだけ描画する
        before.show();
        after.show();

        this.stage.setChildIndex(after.container, this.stage.children.length-1);//afterを最前面に

        var update = function() {
            var t = new Date() - startTime;
            if(t>this.duration){
                //window.cancelAnimationFrame(af);
                before.hide();
                this.index = afterIndex;
                this.isAnimating = false;
                if(callback) {
                    callback.bind(this)();
                }
            } else {
                var e = MorphingSlider.ease[this.easing](t / this.duration);
                before.points.forEach((point, index) => {
                    before.points[index].x = Math.round(after.originalPoints[index].x * e + before.originalPoints[index].x * (1 - e));
                    before.points[index].y = Math.round(after.originalPoints[index].y * e + before.originalPoints[index].y * (1 - e));
                    after.points[index].x = Math.round(before.originalPoints[index].x * (1 - e) + after.originalPoints[index].x * e);
                    after.points[index].y = Math.round(before.originalPoints[index].y * (1 - e) + after.originalPoints[index].y * e);
                });

                after.setAlpha(e);
                before.update();
                after.update();
                this.stage.update();

                window.requestAnimationFrame(update);
            }
        }.bind(this);
        var af = window.requestAnimationFrame(update);

        this.isAnimating = true;
        return this;
    }
    play(direction, interval, callback) { //続けてモーフィング direction: true=>前へ false=>後へ, interval: モーフィング間隔
        var _direction = (direction === undefined) ? this.direction : direction;
        var _interval = (interval === undefined) ? this.interval : interval;
        var _callback = (callback === undefined) ? function(){ return null; } : callback;
        this.timer = setInterval(()=>{
            this.morph.bind(this)(_direction, callback);
        }, _interval + this.duration);
    }
    stop() {
        clearInterval(this.timer);
    }
    clear() {
        this.slides = [];
        this.stage.clear();
        this.index = 0;
        this.stage.removeAllChildren();
        return this;
    }
}

MorphingSlider.Slide = class Slide {
    constructor(image, points, faces) {
        this.domElement = image;

        this.originalPoints = points;

        this.points = []; //描画する際の動的な座標
        this._clonePoints();

        this.faces = faces;

        this.container = new createjs.Container();

        this._addBitmaps();
        //this.container.children = this.container.children.concat(this.container.children);

        return this;
    }
    _clonePoints() {
        this.originalPoints.forEach((point, index) => { //対応する座標を保持する
            this.points[index] = {x: point.x, y: point.y};
        });
    }
    _addBitmaps() {//シェイプの作成
        if(window.navigator.userAgent.toLowerCase().indexOf('chrome') < 0) {
            this.faces.forEach((face) => {
                var bmp = new createjs.Bitmap(this.domElement);
                var shape = new createjs.Shape();

                //Chrome以外のブラウザだとメッシュのすき間が見えてしまうのを改善する
                var n = 1.01;//拡大率
                var g = {
                    x: (this.points[face[0]].x + this.points[face[1]].x + this.points[face[2]].x) / 3,
                    y: (this.points[face[0]].y + this.points[face[1]].y + this.points[face[2]].y) / 3
                };//重心
                var d = {x: g.x * (n - 1), y: g.y * (n - 1)};//座標のずれ

                shape.graphics.moveTo(this.points[face[0]].x * n - d.x, this.points[face[0]].y * n - d.y)
                    .lineTo(this.points[face[1]].x * n - d.x, this.points[face[1]].y * n - d.y)
                    .lineTo(this.points[face[2]].x * n - d.x, this.points[face[2]].y * n - d.y);
                bmp.mask = shape;
                this.container.addChild(bmp);
            });
        } else {
            console.log("chrome");
            this.faces.forEach((face) => {
                var bmp = new createjs.Bitmap(this.domElement);
                var shape = new createjs.Shape();
                shape.graphics.moveTo(this.points[face[0]].x, this.points[face[0]].y)
                    .lineTo(this.points[face[1]].x, this.points[face[1]].y)
                    .lineTo(this.points[face[2]].x, this.points[face[2]].y);
                bmp.mask = shape;
                this.container.addChild(bmp);
            });
        }
    }
    setAlpha(a) {
        this.container.alpha = a;
        return this;
    }
    show() {
        this.container.visible = true;
        return this;
    }
    hide() {
        this.container.visible = false;
        return this;
    }
    update() {
        //アフィン変換行列を求め、パーツを描画
        this.faces.forEach((face, index) => {
            var points1 = [this.originalPoints[face[0]], this.originalPoints[face[1]], this.originalPoints[face[2]]];
            var points2 = [this.points[face[0]], this.points[face[1]], this.points[face[2]]];
            var matrix = this._getAffineTransform(points1, points2);
            this.container.children[index].transformMatrix = this.container.children[index].mask.transformMatrix = matrix;
        });
        return this;
    }
    _getAffineTransform(points1, points2){
        var a, b, c, d, tx, ty;

        // 連立方程式を解く
        a = (points2[0].x * points1[1].y + points2[1].x * points1[2].y + points2[2].x * points1[0].y - points2[0].x * points1[2].y - points2[1].x * points1[0].y - points2[2].x * points1[1].y) / (points1[0].x * points1[1].y + points1[1].x * points1[2].y + points1[2].x * points1[0].y - points1[0].x * points1[2].y - points1[1].x * points1[0].y - points1[2].x * points1[1].y);
        b = (points2[0].y * points1[1].y + points2[1].y * points1[2].y + points2[2].y * points1[0].y - points2[0].y * points1[2].y - points2[1].y * points1[0].y - points2[2].y * points1[1].y) / (points1[0].x * points1[1].y + points1[1].x * points1[2].y + points1[2].x * points1[0].y - points1[0].x * points1[2].y - points1[1].x * points1[0].y - points1[2].x * points1[1].y);
        c = (points1[0].x * points2[1].x + points1[1].x * points2[2].x + points1[2].x * points2[0].x - points1[0].x * points2[2].x - points1[1].x * points2[0].x - points1[2].x * points2[1].x) / (points1[0].x * points1[1].y + points1[1].x * points1[2].y + points1[2].x * points1[0].y - points1[0].x * points1[2].y - points1[1].x * points1[0].y - points1[2].x * points1[1].y);
        d = (points1[0].x * points2[1].y + points1[1].x * points2[2].y + points1[2].x * points2[0].y - points1[0].x * points2[2].y - points1[1].x * points2[0].y - points1[2].x * points2[1].y) / (points1[0].x * points1[1].y + points1[1].x * points1[2].y + points1[2].x * points1[0].y - points1[0].x * points1[2].y - points1[1].x * points1[0].y - points1[2].x * points1[1].y);
        tx = (points1[0].x * points1[1].y * points2[2].x + points1[1].x * points1[2].y * points2[0].x + points1[2].x * points1[0].y * points2[1].x - points1[0].x * points1[2].y * points2[1].x - points1[1].x * points1[0].y * points2[2].x - points1[2].x * points1[1].y * points2[0].x) / (points1[0].x * points1[1].y + points1[1].x * points1[2].y + points1[2].x * points1[0].y - points1[0].x * points1[2].y - points1[1].x * points1[0].y - points1[2].x * points1[1].y);
        ty = (points1[0].x * points1[1].y * points2[2].y + points1[1].x * points1[2].y * points2[0].y + points1[2].x * points1[0].y * points2[1].y - points1[0].x * points1[2].y * points2[1].y - points1[1].x * points1[0].y * points2[2].y - points1[2].x * points1[1].y * points2[0].y) / (points1[0].x * points1[1].y + points1[1].x * points1[2].y + points1[2].x * points1[0].y - points1[0].x * points1[2].y - points1[1].x * points1[0].y - points1[2].x * points1[1].y);

        return new createjs.Matrix2D(a, b, c, d, tx, ty);
    }
}

MorphingSlider.ease = {
    // no easing, no acceleration
    linear: function (t) { return t },
    // accelerating from zero velocity
    easeInQuad: function (t) { return t*t },
    // decelerating to zero velocity
    easeOutQuad: function (t) { return t*(2-t) },
    // acceleration until halfway, then deceleration
    easeInOutQuad: function (t) { return t<.5 ? 2*t*t : -1+(4-2*t)*t },
    // accelerating from zero velocity
    easeInCubic: function (t) { return t*t*t },
    // decelerating to zero velocity
    easeOutCubic: function (t) { return (--t)*t*t+1 },
    // acceleration until halfway, then deceleration
    easeInOutCubic: function (t) { return t<.5 ? 4*t*t*t : (t-1)*(2*t-2)*(2*t-2)+1 },
    // accelerating from zero velocity
    easeInQuart: function (t) { return t*t*t*t },
    // decelerating to zero velocity
    easeOutQuart: function (t) { return 1-(--t)*t*t*t },
    // acceleration until halfway, then deceleration
    easeInOutQuart: function (t) { return t<.5 ? 8*t*t*t*t : 1-8*(--t)*t*t*t },
    // accelerating from zero velocity
    easeInQuint: function (t) { return t*t*t*t*t },
    // decelerating to zero velocity
    easeOutQuint: function (t) { return 1+(--t)*t*t*t*t },
    // acceleration until halfway, then deceleration
    easeInOutQuint: function (t) { return t<.5 ? 16*t*t*t*t*t : 1+16*(--t)*t*t*t*t }
};