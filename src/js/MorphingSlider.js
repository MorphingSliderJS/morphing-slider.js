import EasingFunctions from "./easing.js";

class MorphingSlider {
    constructor(stage) {
        this.images = [];
        this.stage = stage;
        this.transformEasing = this.alphaEasing = "linear";
        this.dulation = 200;
        this.isAnimating = false;
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
        var timer = setInterval(() => {
            if(t>=total){
                clearInterval(timer);
                this.isAnimating = false;
            }

            var e = EasingFunctions[this.transformEasing](t/total);
            this.images[0].points.forEach((point, index) => {
                this.images[0].points[index].x = this.images[1].originalPoints[index].x * e + this.images[0].originalPoints[index].x * (1-e);
                this.images[0].points[index].y = this.images[1].originalPoints[index].y * e + this.images[0].originalPoints[index].y * (1-e);
                this.images[1].points[index].x = this.images[0].originalPoints[index].x * (1-e) + this.images[1].originalPoints[index].x * e;
                this.images[1].points[index].y = this.images[0].originalPoints[index].y * (1-e) + this.images[1].originalPoints[index].y * e;
            });

            e = EasingFunctions[this.alphaEasing](t/total);
            this.images[0].setAlpha(1-e);
            this.images[1].setAlpha(e);
            this.images[0].update();
            this.images[1].update();
            this.stage.update();

            t++;
        }, interval);
        this.isAnimating = true;
        return this;
    }
    clear() {
        this.images = [];
        this.stage.clear();
        return this;
    }
}

export default MorphingSlider;