var MorphingSlider = MorphingSlider || {};

MorphingSlider.CanvasSlider = (function () {

  //フレームレートを表示
  var stats = new Stats();
  stats.setMode( 0 ); // 0: fps, 1: ms, 2: mb

  // align top-left
  stats.domElement.style.position = 'absolute';
  stats.domElement.style.left = '0px';
  stats.domElement.style.top = '0px';

  document.body.appendChild( stats.domElement );

  var MorphingPiece = (function () {

    var min = Math.min;
    var max = Math.max;

    var MorphingPiece = function (p1, p2, p3) {

      this.p1 = p1;
      this.p2 = p2;
      this.p3 = p3;

      this.matrix = {a: 1, b: 0, c: 0, d: 1, tx: 0, ty: 0};

      return this;

    };

    return MorphingPiece;

  })();

  var MorphingImage = (function () {

    var MorphingImage = function (image, points, faces) {

      this.domElement = image;

      this.originalPoints = points;
      this.points = []; //描画する際の動的な座標
      this._clonePoints();

      this.faces = faces;

      this.pieces = [];
      this._addPieces();

      this.position = 0;

      return this;

    };

    MorphingImage.prototype._clonePoints = function () {

      var self = this;
      var width = this.domElement.width;
      var height = this.domElement.height;

      this.originalPoints.forEach(function (point, index) { //対応する座標を保持する
        self.points[index] = [point[0] * width, point[1] * height];
        self.originalPoints[index] = [point[0] * width, point[1] * height];
      });

      return this;

    };

    MorphingImage.prototype._addPieces = function () {

      var self = this;

      if (window.navigator.userAgent.toLowerCase().indexOf('chrome') < 0) {
        this.faces.forEach(function (face) {
          //Chrome以外のブラウザだとメッシュのすき間が見えてしまうのを改善する
          var n = 1.01;//拡大率
          var g = {
            x: (self.points[face[0]][0] + self.points[face[1]][0] + self.points[face[2]][0]) / 3,
            y: (self.points[face[0]][1] + self.points[face[1]][1] + self.points[face[2]][1]) / 3
          };//重心
          var d = {x: g.x * (n - 1), y: g.y * (n - 1)};//座標のずれ

          var piece = new MorphingPiece([self.points[face[0]][0] * n - d.x, self.points[face[0]][1] * n - d.y],
            [self.points[face[1]][0] * n - d.x, self.points[face[1]][1] * n - d.y],
            [self.points[face[2]][0] * n - d.x, self.points[face[2]][1] * n - d.y]);

          self.pieces.push(piece);
        });
      } else {
        this.faces.forEach(function (face) {
          var piece = new MorphingPiece([self.points[face[0]][0], self.points[face[0]][1]],
            [self.points[face[1]][0], self.points[face[1]][1]],
            [self.points[face[2]][0], self.points[face[2]][1]]);

          self.pieces.push(piece);
        });
      }

      return this;

    };

    MorphingImage.prototype.update = function () {

      var self = this;
      var width = this.domElement.width;
      var height = this.domElement.height;

      //アフィン変換行列を求め、パーツを描画
      this.faces.forEach(function (face, index) {
        var points1 = [self.originalPoints[face[0]], self.originalPoints[face[1]], self.originalPoints[face[2]]];
        var points2 = [self.points[face[0]], self.points[face[1]], self.points[face[2]]];
        self.pieces[index].matrix = getAffineTransform(points1, points2);
      });

      return this;

    };

    function getAffineTransform (points1, points2) {

      var a, b, c, d, tx, ty;

      // 連立方程式を解く
      a = (points2[0][0] * points1[1][1] + points2[1][0] * points1[2][1] + points2[2][0] * points1[0][1] - points2[0][0] * points1[2][1] - points2[1][0] * points1[0][1] - points2[2][0] * points1[1][1]) / (points1[0][0] * points1[1][1] + points1[1][0] * points1[2][1] + points1[2][0] * points1[0][1] - points1[0][0] * points1[2][1] - points1[1][0] * points1[0][1] - points1[2][0] * points1[1][1]);
      b = (points2[0][1] * points1[1][1] + points2[1][1] * points1[2][1] + points2[2][1] * points1[0][1] - points2[0][1] * points1[2][1] - points2[1][1] * points1[0][1] - points2[2][1] * points1[1][1]) / (points1[0][0] * points1[1][1] + points1[1][0] * points1[2][1] + points1[2][0] * points1[0][1] - points1[0][0] * points1[2][1] - points1[1][0] * points1[0][1] - points1[2][0] * points1[1][1]);
      c = (points1[0][0] * points2[1][0] + points1[1][0] * points2[2][0] + points1[2][0] * points2[0][0] - points1[0][0] * points2[2][0] - points1[1][0] * points2[0][0] - points1[2][0] * points2[1][0]) / (points1[0][0] * points1[1][1] + points1[1][0] * points1[2][1] + points1[2][0] * points1[0][1] - points1[0][0] * points1[2][1] - points1[1][0] * points1[0][1] - points1[2][0] * points1[1][1]);
      d = (points1[0][0] * points2[1][1] + points1[1][0] * points2[2][1] + points1[2][0] * points2[0][1] - points1[0][0] * points2[2][1] - points1[1][0] * points2[0][1] - points1[2][0] * points2[1][1]) / (points1[0][0] * points1[1][1] + points1[1][0] * points1[2][1] + points1[2][0] * points1[0][1] - points1[0][0] * points1[2][1] - points1[1][0] * points1[0][1] - points1[2][0] * points1[1][1]);
      tx = (points1[0][0] * points1[1][1] * points2[2][0] + points1[1][0] * points1[2][1] * points2[0][0] + points1[2][0] * points1[0][1] * points2[1][0] - points1[0][0] * points1[2][1] * points2[1][0] - points1[1][0] * points1[0][1] * points2[2][0] - points1[2][0] * points1[1][1] * points2[0][0]) / (points1[0][0] * points1[1][1] + points1[1][0] * points1[2][1] + points1[2][0] * points1[0][1] - points1[0][0] * points1[2][1] - points1[1][0] * points1[0][1] - points1[2][0] * points1[1][1]);
      ty = (points1[0][0] * points1[1][1] * points2[2][1] + points1[1][0] * points1[2][1] * points2[0][1] + points1[2][0] * points1[0][1] * points2[1][1] - points1[0][0] * points1[2][1] * points2[1][1] - points1[1][0] * points1[0][1] * points2[2][1] - points1[2][0] * points1[1][1] * points2[0][1]) / (points1[0][0] * points1[1][1] + points1[1][0] * points1[2][1] + points1[2][0] * points1[0][1] - points1[0][0] * points1[2][1] - points1[1][0] * points1[0][1] - points1[2][0] * points1[1][1]);

      return {a: a, b: b, c: c, d: d, tx: tx, ty: ty};

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

  var CanvasSlider = function (options) {

    this.direction = (options && typeof(options.direction) === 'boolean') ? options.direction : true;

    this.easing = (options && typeof(options.easing) === 'string') ? options.easing : 'linear';

    this.duration = (options && typeof(options.duration) === 'number') ? options.duration : 500;

    this.interval = (options && typeof(options.interval) === 'number') ? options.interval : 500;

    this.index = 0;//the index of the displayed image

    this.width = this.height = 0;

    this.isAnimating = false;

    this.canvas = document.createElement('canvas');

    document.body.appendChild(this.canvas);

    this.context = this.canvas.getContext('2d');

    this.images = [];

    this._renderedImages = [];

    return this;

  };

  CanvasSlider.prototype.setFaces = function (faces) {

    this.faces = faces;

    return this;

  };

  CanvasSlider.prototype.addSlide = function (src, data, callback) {

    if (typeof(src) !== "string") {
      return this;
    }

    var self = this;

    var image = new Image();
    image.src = src;

    image.onload = function () {
      var morphingImage = new MorphingImage(image, data, self.faces);

      if (self.images.length === 0) {
        self._renderedImages = [morphingImage];
      }

      self.images.push(morphingImage);

      self.width = self.canvas.width = self.width > image.width ? self.width : image.width;
      self.height = self.canvas.height = self.height > image.height ? self.height : image.height;

      self.render();

      if (typeof(callback) === "function") {
        callback.call(self);
      }
    };

    return this;

  };

  CanvasSlider.prototype.morph = function (callback) { //direction : trueで次、falseで前へ

    if (this.isAnimating || this.images.length < 2) { //アニメーションの重複を防ぐ
      return this;
    }

    var self = this;

    var startTime = new Date();

    var afterIndex = (this.index + (this.direction * 2 - 1) + this.images.length) % this.images.length;

    var before = this.images[this.index]; //いまのMorphingImage
    var after = this.images[afterIndex]; //モーフィング後のMorphingImage

    this._renderedImages = [before, after];

    before.points.forEach(function (point, index) {
      before.points[index] = [after.originalPoints[index][0], after.originalPoints[index][1]];
      after.points[index] = [before.originalPoints[index][0], before.originalPoints[index][1]];
    });

    //matrixを計算
    before.update();
    after.update();

    var update = function () {
      stats.begin();
      var t = new Date() - startTime;
      if (t > this.duration) {
        this.index = afterIndex;
        this.isAnimating = false;
        if (callback) {
          callback.bind(this)();
        }
      } else {
        var position = ease[this.easing](t / this.duration);

        after.position = 1 - position;
        before.position = position;

        this.render();

        stats.end();
        window.requestAnimationFrame(update);
      }
    }.bind(this);

    var af = window.requestAnimationFrame(update);

    this.isAnimating = true;

    return this;

  };

  CanvasSlider.prototype.play = function (callback) {

    var self = this;
    var _callback = ((typeof(callback) === 'function') ? callback : null);

    this.timer = setInterval(function () {
      self.morph.call(self, _callback);
    }, this.interval + this.duration);

    this.morph(_callback);

    return this;

  };

  CanvasSlider.prototype.stop = function () {

    clearInterval(this.timer);

    return this;

  };

  CanvasSlider.prototype.render = function () {

    var context = this.context;
    //context.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this._renderedImages.forEach(function (image, index) {
      var position = image.position;

      if(index == 1) {
        context.globalAlpha = 1 - position;
      } else {
        context.globalAlpha = 1;
      }

      image.pieces.forEach(function (piece) {
        var matrix = piece.matrix;
        context.save();
        context.setTransform((1 - position) + matrix.a * position, matrix.b * position, matrix.c * position, (1 - position) + matrix.d * position, matrix.tx * position, matrix.ty * position);
        context.beginPath();
        context.moveTo(piece.p1[0], piece.p1[1]);
        context.lineTo(piece.p2[0], piece.p2[1]);
        context.lineTo(piece.p3[0], piece.p3[1]);
        context.closePath();
        context.clip();
        context.drawImage(image.domElement, 0, 0);
        context.restore();
      });
    });


  };

  return CanvasSlider;

})();