
class MorphingSlider {
    constructor(stage) {
        this.images = [];
        this.stage = stage;
        this.transformEasing = this.alphaEasing = "linear";
        this.direction = true;
        this.dulation = 200;
        this.isAnimating = false;
        this.index = 0;//表示している画像のindex
        this.width = 0;
        this.height = 0;
        return this;
    }
    addImage(image, data) {
        var morphingImage = new MorphingImage(image, data.points, data.faces);
        if(this.images.length>0) {//最初以外は描画しない
            morphingImage.setAlpha(0);
        }
        this.stage.addChild(morphingImage.container);
        this.images.push(morphingImage);
        this.stage.update();
        this.width = this.stage.canvas.width = this.width > morphingImage.domElement.width ? this.width : morphingImage.domElement.width;
        this.height = this.stage.canvas.height = this.height > morphingImage.domElement.height ? this.height : morphingImage.domElement.height;
        return this;
    }
    morph(direction, callback) { //direction : trueで次、falseで前へ
        if(this.isAnimating || this.images.length<2){ //アニメーションの重複を防ぐ
            return this;
        }

        var _direction = (direction === undefined) ? this.direction : direction;//デフォルトはMorphSliderでの設定値

        var t = 0;
        var interval = 16.66; //60fps
        var total = this.dulation/interval;

        var afterIndex;
        if(_direction && this.images.length === this.index + 1) {//向きが通常でいま最後の画像なら
            afterIndex = 0;
        } else if(!_direction && this.index === 0){//向きが逆でいま最初の画像なら
            afterIndex = this.images.length - 1;
        } else {
            afterIndex = this.index+(_direction*2-1);
        }
        var before = this.images[this.index]; //いまのMorphingImage
        var after = this.images[afterIndex]; //モーフィング後のMorphingImage

        this.stage.setChildIndex(after.container, this.stage.children.length-1);//afterを最前面に
        var timer = setInterval(() => {
            var e = EasingFunctions[this.transformEasing](t/total);
            before.points.forEach((point, index) => {
                before.points[index].x = after.originalPoints[index].x * e + before.originalPoints[index].x * (1-e);
                before.points[index].y = after.originalPoints[index].y * e + before.originalPoints[index].y * (1-e);
                after.points[index].x = before.originalPoints[index].x * (1-e) + after.originalPoints[index].x * e;
                after.points[index].y = before.originalPoints[index].y * (1-e) + after.originalPoints[index].y * e;
            });

            e = EasingFunctions[this.alphaEasing](t/total);
            //before.setAlpha(1-e);
            after.setAlpha(e);
            before.update();
            after.update();
            this.stage.update();

            t++;
            if(t>total){
                this.index = afterIndex;
                clearInterval(timer);
                this.isAnimating = false;
                if(callback) {
                    callback.bind(this)();
                }
            }
        }, interval);
        this.isAnimating = true;
        return this;
    }
    play(direction, interval, callback) { //続けてモーフィング direction: true=>前へ false=>後へ, interval: モーフィング間隔
        this.direction = (direction === undefined) ? true : direction;//デフォルトは前に進む
        var _interval = (interval === undefined) ? 2000 : interval;//デフォルトは前に進む
        var _callback = (callback === undefined) ? function(){ return null; } : callback;
        _interval+=this.dulation;
        this.morph(direction, callback);//最初
        this.timer = setInterval(()=>{
            this.morph.bind(this)(direction, callback);
        }, _interval);//次
    }
    stop() {
        clearInterval(this.timer);
    }
    clear() {
        this.images = [];
        this.stage.clear();
        this.index = 0;
        this.stage.removeAllChildren();
        return this;
    }
}

class MorphingImage {
    constructor(image, points, faces) {
        this.domElement = image;

        this.originalPoints = points;
        this.points = []; //描画する際の動的な座標
        this._clonePoints();

        this.faces = faces;

        this.container = new createjs.Container();
        this._addBitmaps();

        return this;
    }
    _clonePoints() {
        this.originalPoints.forEach((point, index) => { //対応する座標を保持する
            this.points[index] = {x: point.x, y: point.y};
        });
    }
    _addBitmaps() {
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
    setAlpha(a) {
        this.container.alpha = a;
    }
    update() {
        //アフィン変換行列を求め、パーツを描画
        this.faces.forEach((face, index) => {
            var points1 = [this.originalPoints[face[0]], this.originalPoints[face[1]], this.originalPoints[face[2]]];
            var points2 = [this.points[face[0]], this.points[face[1]], this.points[face[2]]];
            var matrix = this._getAffineTransform(points1, points2);
            this.container.children[index].transformMatrix = this.container.children[index].mask.transformMatrix = matrix;
        });
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

        var matrix = new createjs.Matrix2D(a, b, c, d, tx, ty);
        return matrix;
    }
}

var EasingFunctions = {
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