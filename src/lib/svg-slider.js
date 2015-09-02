//作りかけ。重くて使い物にならないので中止。

MorphingSlider.SVGSlider = (function () {

  var MorphingPiece = (function () {

    var min = Math.min;
    var max = Math.max;
    var NS = "http://www.w3.org/2000/svg";
    var id = 0;

    var MorphingPiece = function (image, p1, p2, p3) {

      this.p1 = p1;
      this.p2 = p2;
      this.p3 = p3;

      this.matrix = {a: 1, b: 0, c: 0, d: 1, tx: 0, ty: 0};

      var svg = document.createElementNS(NS, 'svg');
      svg.setAttribute('width', image.width);
      svg.setAttribute('height', image.height);
      svg.setAttribute('viewBox', '0 0 ' + image.width + ' ' + image.height);
      var defs = document.createElementNS(NS, 'defs');
      var clipPath = document.createElementNS(NS, 'clipPath');
      clipPath.setAttribute('id', id);
      var path = document.createElementNS(NS, 'path');
      path.setAttribute("d", "M" + p1[0] + ',' + p1[1] + ' L' + p2[0] + ',' + p2[1] + ' L' + p3[0] + ',' + p3[1] + 'Z');
      clipPath.appendChild(path);
      defs.appendChild(clipPath);
      svg.appendChild(defs);
      var imageNode = document.createElementNS(NS, 'image');
      imageNode.href.baseVal = image.getAttribute('src');
      imageNode.setAttribute('clip-path', 'url(#' + id + ')');
      imageNode.setAttribute('x', 0);
      imageNode.setAttribute('y', 0);
      imageNode.setAttribute('width', image.width + 'px');
      imageNode.setAttribute('height', image.height + 'px');

      svg.style.position = 'absolute';
      svg.style.transformOrigin = '0% 0%';

      svg.appendChild(imageNode);

      id++;

      this.svg = svg;

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
      this._createPieces();

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

    MorphingImage.prototype._createPieces = function () {

      var self = this;

      this.div = document.createElement('div');

      if (window.navigator.userAgent.toLowerCase().indexOf('chrome') < 0) {
        this.faces.forEach(function (face) {
          //Chrome以外のブラウザだとメッシュのすき間が見えてしまうのを改善する
          var n = 1.01;//拡大率
          var g = {
            x: (self.points[face[0]][0] + self.points[face[1]][0] + self.points[face[2]][0]) / 3,
            y: (self.points[face[0]][1] + self.points[face[1]][1] + self.points[face[2]][1]) / 3
          };//重心
          var d = {x: g.x * (n - 1), y: g.y * (n - 1)};//座標のずれ

          var piece = new MorphingPiece(self.domElement, [self.points[face[0]][0] * n - d.x, self.points[face[0]][1] * n - d.y],
            [self.points[face[1]][0] * n - d.x, self.points[face[1]][1] * n - d.y],
            [self.points[face[2]][0] * n - d.x, self.points[face[2]][1] * n - d.y]);

          self.pieces.push(piece);
          self.div.appendChild(piece.svg);
        });
      } else {
        this.faces.forEach(function (face) {
          var piece = new MorphingPiece(self.domElement, [self.points[face[0]][0], self.points[face[0]][1]],
            [self.points[face[1]][0], self.points[face[1]][1]],
            [self.points[face[2]][0], self.points[face[2]][1]]);

          self.pieces.push(piece);
          self.div.appendChild(piece.svg);
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

  var SVGSlider = function (container, options) {

    this.direction = (options && typeof options.direction === 'boolean') ? options.direction : true;

    this.easing = (options && typeof options.easing === 'string') ? options.easing : 'linear';

    this.duration = (options && typeof options.duration === 'number') ? options.duration : 500;

    this.interval = (options && typeof options.interval === 'number') ? options.interval : 500;

    this.index = 0;//the index of the displayed image

    this.width = this.height = 0;

    this.isAnimating = false;

    this.div = document.createElement('div');

    if(container && container.appendChild) {
      container.appendChild(this.div);
    } else {
      document.body.appendChild(this.div);
    }

    this.images = [];

    this._renderedImages = [];

    return this;

  };

  SVGSlider.prototype.setFaces = function (faces) {

    this.faces = faces;

    return this;

  };

  SVGSlider.prototype.addSlide = function (src, data, callback) {

    if (typeof(src) !== "string") {
      return this;
    }

    var self = this;

    var image = new Image();
    image.src = src;

    image.onload = function () {
      var morphingImage = new MorphingImage(image, data, self.faces);
      self.div.appendChild(morphingImage.div);

      if (self.images.length === 0) {
        self._renderedImages = [morphingImage];
      }

      self.images.push(morphingImage);

      self.width = self.div.style.width = self.width > image.width ? self.width : image.width;
      self.height = self.div.style.height = self.height > image.height ? self.height : image.height;

      self._render();

      if (typeof(callback) === "function") {
        callback.call(self);
      }
    };

    return this;

  };

  SVGSlider.prototype.morph = function (callback) { //direction : trueで次、falseで前へ

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
      var delta = new Date() - startTime;
      if (delta > this.duration) {
        this.index = afterIndex;
        this.isAnimating = false;
        if (callback) {
          callback.bind(this)();
        }
      } else {
        var position = ease[this.easing](delta / this.duration);

        after.position = 1 - position;
        before.position = position;

        this._render();

        window.requestAnimationFrame(update);
      }
    }.bind(this);

    var af = window.requestAnimationFrame(update);

    this.isAnimating = true;

    return this;

  };

  SVGSlider.prototype.play = function (callback) {

    var self = this;
    var _callback = ((typeof(callback) === 'function') ? callback : null);

    this.timer = setInterval(function () {
      self.morph.call(self, _callback);
    }, this.interval + this.duration);

    this.morph(_callback);

    return this;

  };

  SVGSlider.prototype.stop = function () {

    clearInterval(this.timer);

    return this;

  };

  SVGSlider.prototype._render = function () {

    this._renderedImages.forEach(function (image, index) {
      var position = image.position;

      if(index == 1) {
        image.div.style.opacity = 1 - position;
      } else {
        image.div.style.opacity = 1;
      }

      image.pieces.forEach(function (piece) {
        var matrix = piece.matrix;
        piece.svg.style.transform = 'translateZ(0) matrix(' + ((1 - position) + matrix.a * position) + ', ' + matrix.b * position + ', ' + matrix.c * position + ', ' + ((1 - position) + matrix.d * position) + ', ' + matrix.tx * position + ', ' + matrix.ty * position + ')';
      });
    });

    return this;

  };

  return SVGSlider;

})();
