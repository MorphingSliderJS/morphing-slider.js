import EasingFunctions from "./easing.js";
import MorphingImage from "./MorphingImage.js";

class MorphingSlider {
    constructor(stageURL) {
        this.stage = new createjs.Stage(stageURL);
        this.slides = [];
        this.transformEasing = this.alphaEasing = "linear";
        this.direction = true;
        this.dulation = 500;
        this.interval = 1000;
        this.isAnimating = false;
        this.index = 0;//表示している画像のindex
        this.width = 0;
        this.height = 0;
        return this;
    }
    addSlide(src, data, callback) {
        var image = new Image();
        image.src = src;
        var morphingImage = new MorphingImage(image, data.points, data.faces);
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
      var time1 = new Date();
      console.log(this.dulation);
        if(this.isAnimating || this.slides.length<2){ //アニメーションの重複を防ぐ
            return this;
        }

        var _direction = (direction === undefined) ? this.direction : direction;//デフォルトはMorphSliderでの設定値

        var t = 0;
        var interval = 16.66; //60fps
        var total = this.dulation/interval;

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

        var timer = setInterval(() => {
            var e = EasingFunctions[this.transformEasing](t/total);
            before.points.forEach((point, index) => {
                before.points[index].x = after.originalPoints[index].x * e + before.originalPoints[index].x * (1-e);
                before.points[index].y = after.originalPoints[index].y * e + before.originalPoints[index].y * (1-e);
                after.points[index].x = before.originalPoints[index].x * (1-e) + after.originalPoints[index].x * e;
                after.points[index].y = before.originalPoints[index].y * (1-e) + after.originalPoints[index].y * e;
            });

            e = EasingFunctions[this.alphaEasing](t/total);

            after.setAlpha(e);
            before.update();
            after.update();
            this.stage.update();

            t++;
            if(t>total){
                var time2 = new Date();
                console.log(time2- time1);
                clearInterval(timer);
                before.hide();
                this.index = afterIndex;
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
        var _direction = (direction === undefined) ? this.direction : direction;
        var _interval = (interval === undefined) ? this.interval : interval;
        var _callback = (callback === undefined) ? function(){ return null; } : callback;
        this.timer = setInterval(()=>{
            this.morph.bind(this)(_direction, callback);
        }, _interval + this.dulation);
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

export default MorphingSlider;
