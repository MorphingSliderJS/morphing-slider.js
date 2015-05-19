import EasingFunctions from "./easing.js";

class MorphingSlider {
    constructor() {
        this.images = [];
        this.transformEasing = this.alphaEasing = "linear";
        this.dulation = 200;
        this.isAnimating = false;
        return this;
    }
    addImage(morphingImage) {
        this.images.push(morphingImage);
        return this;
    }
    play() {
        if(this.isAnimating){ //アニメーションの重複を防ぐ
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
            t++;
        }, interval);
        this.isAnimating = true;
        return this;
    }
    clear() {
        this.images = [];
        return this;
    }
}

export default MorphingSlider;