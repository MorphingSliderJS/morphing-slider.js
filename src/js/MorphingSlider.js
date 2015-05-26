import EasingFunctions from "./easing.js";

class MorphingSlider {
    constructor(stage) {
        this.images = [];
        this.stage = stage;
        this.transformEasing = this.alphaEasing = "linear";
        this.dulation = 200;
        this.isAnimating = false;
        this.index = 0;//表示している画像のindex
        return this;
    }
    addImage(morphingImage) {
        morphingImage.bitmaps.forEach((bmp, index) => {
            if(this.images.length>0){//最初以外は描画しない
                morphingImage.bitmaps[index].alpha = 0;
            }
            this.stage.addChild(morphingImage.bitmaps[index]);
        });
        this.images.push(morphingImage);
        this.stage.update();
        return this;
    }
    play() {
        if(this.isAnimating || this.images.length<2){ //アニメーションの重複を防ぐ
            return this;
        }
        var t = 0;
        var total = this.dulation*60/1000;
        var interval = 1000/60; //60fps
        var before = this.images[this.index];
        var after = this.images[this.index+1];
        var timer = setInterval(() => {
            var e = EasingFunctions[this.transformEasing](t/total);
            before.points.forEach((point, index) => {
                before.points[index].x = after.originalPoints[index].x * e + before.originalPoints[index].x * (1-e);
                before.points[index].y = after.originalPoints[index].y * e + before.originalPoints[index].y * (1-e);
                after.points[index].x = before.originalPoints[index].x * (1-e) + after.originalPoints[index].x * e;
                after.points[index].y = before.originalPoints[index].y * (1-e) + after.originalPoints[index].y * e;
            });

            e = EasingFunctions[this.alphaEasing](t/total);
            before.setAlpha(1-e);
            after.setAlpha(e);
            console.log(e);
            before.update();
            after.update();
            this.stage.update();

            t++;
            if(t>total){
                if(this.index >= this.images.length - 2) { //終了
                    this.index = 0;
                    this.isAnimating = false;
                    clearInterval(timer);
                } else { //次のモーフィングへ
                    this.index++;
                    before = after;
                    after = this.images[this.index+1];
                    t = 0;
                }
            }
        }, interval);
        this.isAnimating = true;
        return this;
    }
    clear() {
        this.images = [];
        this.stage.clear();
        this.stage.removeAllChildren();
        return this;
    }
}

export default MorphingSlider;