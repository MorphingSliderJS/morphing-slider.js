import EasingFunctions from "./easing.js";
import MorphingImage from "./MorphingImage.js";

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
    play(direction, interval) { //続けてモーフィング direction: true=>前へ false=>後へ, interval: モーフィング間隔
        this.direction = (direction === undefined) ? true : direction;//デフォルトは前に進む
        var _interval = (interval === undefined) ? 2000 : interval;//デフォルトは前に進む
        _interval+=this.dulation;
        this.morph.bind(this)();//最初
        this.timer = setInterval(this.morph.bind(this), _interval);//次
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

export default MorphingSlider;