var MorphingSlider = MorphingSlider || {};

MorphingSlider.CanvasSlider = (function(){

    var CanvasSlider = function(options) {

        this.direction = (options && typeof(options.direction) === 'boolean') ? options.direction : true;

        this.easing = (options && typeof(options.easing) === 'string') ? options.easing : 'linear';

        this.duration = (options && typeof(options.duration) === 'number') ? options.duration : 500;

        this.interval = (options && typeof(options.interval) === 'number') ? options.interval : 500;

        this.index = 0;//the index of the displayed image

        this.width = this.height = 0;

        this.isAnimating = false;

        var canvas = document.createElement('canvas');
        document.body.appendChild(canvas);
        this.stage = new createjs.Stage(canvas);

        this.images = [];

        return this;

    };

    var MorphingImage = (function() {

        var MorphingImage = function(image, points, faces) {

            this.domElement = image;

            this.originalPoints = points;
            this.points = []; //描画する際の動的な座標
            this._clonePoints();

            this.faces = faces;

            this.container = new createjs.Container();
            this._addBitmaps();

            return this;

        };

        MorphingImage.prototype._clonePoints = function() {

            var self = this;
            var width = this.domElement.width;
            var height = this.domElement.height;

            this.originalPoints.forEach(function(point, index) { //対応する座標を保持する
                self.points[index] = [point[0] * width, point[1] * height];
                self.originalPoints[index] = [point[0] * width, point[1] * height];
            });

            return this;
        };

        MorphingImage.prototype._addBitmaps = function() {

            var self = this;
            var width = this.domElement.width;
            var height = this.domElement.height;

            this.faces.forEach(function(face) {
                var bmp = new createjs.Bitmap(self.domElement);
                var shape = new createjs.Shape();
                shape.graphics.moveTo(self.points[face[0]][0], self.points[face[0]][1])
                    .lineTo(self.points[face[1]][0], self.points[face[1]][1])
                    .lineTo(self.points[face[2]][0], self.points[face[2]][1]);
                bmp.mask = shape;
                self.container.addChild(bmp);
            });

            return this;
        };

        MorphingImage.prototype.setAlpha = function(a) {

            this.container.alpha = a;

            return this;

        };

        MorphingImage.prototype.show = function() {

            this.container.visible = true;

            return this;

        };

        MorphingImage.prototype.hide = function() {

            this.container.visible = false;

            return this;

        };

        MorphingImage.prototype.update = function() {

            var self = this;
            var width = this.domElement.width;
            var height = this.domElement.height;

            //アフィン変換行列を求め、パーツを描画
            this.faces.forEach(function(face, index) {
                var points1 = [self.originalPoints[face[0]], self.originalPoints[face[1]], self.originalPoints[face[2]]];
                var points2 = [self.points[face[0]], self.points[face[1]], self.points[face[2]]];
                var matrix = getAffineTransform(points1, points2);
                self.container.children[index].transformMatrix = self.container.children[index].mask.transformMatrix = matrix;
            });

            return this;
        };

        var getAffineTransform = function(points1, points2) {

            var a, b, c, d, tx, ty;

            // 連立方程式を解く
            a = (points2[0][0] * points1[1][1] + points2[1][0] * points1[2][1] + points2[2][0] * points1[0][1] - points2[0][0] * points1[2][1] - points2[1][0] * points1[0][1] - points2[2][0] * points1[1][1]) / (points1[0][0] * points1[1][1] + points1[1][0] * points1[2][1] + points1[2][0] * points1[0][1] - points1[0][0] * points1[2][1] - points1[1][0] * points1[0][1] - points1[2][0] * points1[1][1]);
            b = (points2[0][1] * points1[1][1] + points2[1][1] * points1[2][1] + points2[2][1] * points1[0][1] - points2[0][1] * points1[2][1] - points2[1][1] * points1[0][1] - points2[2][1] * points1[1][1]) / (points1[0][0] * points1[1][1] + points1[1][0] * points1[2][1] + points1[2][0] * points1[0][1] - points1[0][0] * points1[2][1] - points1[1][0] * points1[0][1] - points1[2][0] * points1[1][1]);
            c = (points1[0][0] * points2[1][0] + points1[1][0] * points2[2][0] + points1[2][0] * points2[0][0] - points1[0][0] * points2[2][0] - points1[1][0] * points2[0][0] - points1[2][0] * points2[1][0]) / (points1[0][0] * points1[1][1] + points1[1][0] * points1[2][1] + points1[2][0] * points1[0][1] - points1[0][0] * points1[2][1] - points1[1][0] * points1[0][1] - points1[2][0] * points1[1][1]);
            d = (points1[0][0] * points2[1][1] + points1[1][0] * points2[2][1] + points1[2][0] * points2[0][1] - points1[0][0] * points2[2][1] - points1[1][0] * points2[0][1] - points1[2][0] * points2[1][1]) / (points1[0][0] * points1[1][1] + points1[1][0] * points1[2][1] + points1[2][0] * points1[0][1] - points1[0][0] * points1[2][1] - points1[1][0] * points1[0][1] - points1[2][0] * points1[1][1]);
            tx = (points1[0][0] * points1[1][1] * points2[2][0] + points1[1][0] * points1[2][1] * points2[0][0] + points1[2][0] * points1[0][1] * points2[1][0] - points1[0][0] * points1[2][1] * points2[1][0] - points1[1][0] * points1[0][1] * points2[2][0] - points1[2][0] * points1[1][1] * points2[0][0]) / (points1[0][0] * points1[1][1] + points1[1][0] * points1[2][1] + points1[2][0] * points1[0][1] - points1[0][0] * points1[2][1] - points1[1][0] * points1[0][1] - points1[2][0] * points1[1][1]);
            ty = (points1[0][0] * points1[1][1] * points2[2][1] + points1[1][0] * points1[2][1] * points2[0][1] + points1[2][0] * points1[0][1] * points2[1][1] - points1[0][0] * points1[2][1] * points2[1][1] - points1[1][0] * points1[0][1] * points2[2][1] - points1[2][0] * points1[1][1] * points2[0][1]) / (points1[0][0] * points1[1][1] + points1[1][0] * points1[2][1] + points1[2][0] * points1[0][1] - points1[0][0] * points1[2][1] - points1[1][0] * points1[0][1] - points1[2][0] * points1[1][1]);

            return new createjs.Matrix2D(a, b, c, d, tx, ty);

        };

        return MorphingImage;

    })();

    var ease = {
        // no easing, no acceleration
        linear: function (t) {
            return t
        },
        // accelerating from zero velocity
        easeInQuad: function (t) {
            return t * t
        },
        // decelerating to zero velocity
        easeOutQuad: function (t) {
            return t * (2 - t)
        },
        // acceleration until halfway, then deceleration
        easeInOutQuad: function (t) {
            return t < .5 ? 2 * t * t : -1 + (4 - 2 * t) * t
        },
        // accelerating from zero velocity
        easeInCubic: function (t) {
            return t * t * t
        },
        // decelerating to zero velocity
        easeOutCubic: function (t) {
            return (--t) * t * t + 1
        },
        // acceleration until halfway, then deceleration
        easeInOutCubic: function (t) {
            return t < .5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1
        },
        // accelerating from zero velocity
        easeInQuart: function (t) {
            return t * t * t * t
        },
        // decelerating to zero velocity
        easeOutQuart: function (t) {
            return 1 - (--t) * t * t * t
        },
        // acceleration until halfway, then deceleration
        easeInOutQuart: function (t) {
            return t < .5 ? 8 * t * t * t * t : 1 - 8 * (--t) * t * t * t
        },
        // accelerating from zero velocity
        easeInQuint: function (t) {
            return t * t * t * t * t
        },
        // decelerating to zero velocity
        easeOutQuint: function (t) {
            return 1 + (--t) * t * t * t * t
        },
        // acceleration until halfway, then deceleration
        easeInOutQuint: function (t) {
            return t < .5 ? 16 * t * t * t * t * t : 1 + 16 * (--t) * t * t * t * t
        }
    };

    CanvasSlider.prototype.setFaces = function (faces) {

        this.faces = faces;

        return this;

    };

    CanvasSlider.prototype.addSlide = function(src, data, callback) {

        if (typeof(src) !== "string") {
            return this;
        }

        var self = this;

        var image = new Image();
        image.src = src;

        image.onload = function() {
            var morphingImage = new MorphingImage(image, data, self.faces);
            if (self.images.length > 0) {//最初以外は描画しない
                morphingImage.setAlpha(0);
            }
            self.stage.addChild(morphingImage.container);
            self.images.push(morphingImage);
            self.width = self.stage.canvas.width = self.width > image.width ? self.width : image.width;
            self.height = self.stage.canvas.height = self.height > image.height ? self.height : image.height;
            self.stage.update();

            if (typeof(callback) === "function") {
                callback.call(self);
            }
        };

        return this;

    };

    CanvasSlider.prototype.morph = function(callback) { //direction : trueで次、falseで前へ

        if (this.isAnimating || this.images.length < 2) { //アニメーションの重複を防ぐ
            return this;
        }

        var self = this;

        var startTime = new Date();

        var afterIndex = (this.index + (this.direction * 2 - 1) + this.images.length) % this.images.length;

        var before = this.images[this.index]; //いまのMorphingImage
        var after = this.images[afterIndex]; //モーフィング後のMorphingImage

        this.stage.setChildIndex(after.container, this.stage.children.length-1);//afterを最前面に

        this.stage.setChildIndex(after.container, this.stage.children.length-1);//afterを最前面に

        var update = function() {
            var t = new Date() - startTime;
            if(t>this.duration){
                //window.cancelAnimationFrame(af);
                //before.hide();
                this.index = afterIndex;
                this.isAnimating = false;
                if(callback) {
                    callback.bind(this)();
                }
            } else {
                var e = ease[this.easing](t / this.duration);
                before.points.forEach(function(point, index) {
                    before.points[index][0] = Math.round(after.originalPoints[index][0] * e + before.originalPoints[index][0] * (1 - e));
                    before.points[index][1] = Math.round(after.originalPoints[index][1] * e + before.originalPoints[index][1] * (1 - e));
                    after.points[index][0] = Math.round(before.originalPoints[index][0] * (1 - e) + after.originalPoints[index][0] * e);
                    after.points[index][1] = Math.round(before.originalPoints[index][1] * (1 - e) + after.originalPoints[index][1] * e);
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

    };

    CanvasSlider.prototype.play = function (callback) { //続けてモーフィング direction: true=>前へ false=>後へ, interval: モーフィング間隔

        var self = this;

        this.timer = setInterval(function () {
            self.morph.call(self, ((typeof(callback) === 'function') ? [callback] : null));
        }, this.interval + this.duration);

        return this;

    };

    CanvasSlider.prototype.stop = function () {

        clearInterval(this.timer);

        return this;

    };

    return CanvasSlider;

})();