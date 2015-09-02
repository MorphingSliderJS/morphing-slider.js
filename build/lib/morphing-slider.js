var MorphingSlider = MorphingSlider || {};

MorphingSlider = function(container, options) {

  var detector = {
    canCanvas: function () {
      return !!window.CanvasRenderingContext2D;
    },
    canWebGL: function () {
      try {
        return !!window.WebGLRenderingContext && !!document.createElement('canvas').getContext('experimental-webgl');
      } catch(e) {
        return false;
      }
    }
  };

  if(detector.canWebGL()) {
    return new MorphingSlider.WebGLSlider(container, options)
  } else if(detector.canCanvas()) {
    return new MorphingSlider.CanvasSlider(container, options);
  }

  return {};

};

MorphingSlider._easings = {
  linear: function (t) {
    return t
  },
  easeInQuad: function (t) {
    return t * t
  },
  easeOutQuad: function (t) {
    return t * (2 - t)
  },
  easeInOutQuad: function (t) {
    return t < .5 ? 2 * t * t : -1 + (4 - 2 * t) * t
  },
  easeInCubic: function (t) {
    return t * t * t
  },
  easeOutCubic: function (t) {
    return (--t) * t * t + 1
  },
  easeInOutCubic: function (t) {
    return t < .5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1
  },
  easeInQuart: function (t) {
    return t * t * t * t
  },
  easeOutQuart: function (t) {
    return 1 - (--t) * t * t * t
  },
  easeInOutQuart: function (t) {
    return t < .5 ? 8 * t * t * t * t : 1 - 8 * (--t) * t * t * t
  },
  easeInQuint: function (t) {
    return t * t * t * t * t
  },
  easeOutQuint: function (t) {
    return 1 + (--t) * t * t * t * t
  },
  easeInOutQuint: function (t) {
    return t < .5 ? 16 * t * t * t * t * t : 1 + 16 * (--t) * t * t * t * t
  }
};

(function () {

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

  var easings = MorphingSlider._easings;

  MorphingSlider.CanvasSlider = function (container, options) {

    this.direction = (options && typeof options.direction === 'boolean') ? options.direction : true;

    this.easing = (options && typeof options.easing === 'string') ? options.easing : 'linear';

    this.duration = (options && typeof options.duration === 'number') ? options.duration : 500;

    this.interval = (options && typeof options.interval === 'number') ? options.interval : 500;

    this.index = 0;//the index of the displayed image

    this.width = this.height = 0;

    this.isAnimating = false;

    this.canvas = document.createElement('canvas');

    if(container && container.appendChild) {
      container.appendChild(this.canvas);
    } else {
      document.body.appendChild(this.canvas);
    }

    this.context = this.canvas.getContext('2d');

    this.images = [];

    this._renderedImages = [];

    return this;

  };

  MorphingSlider.CanvasSlider.prototype.setFaces = function (faces) {

    this.faces = faces;

    return this;

  };

  MorphingSlider.CanvasSlider.prototype.addSlide = function (src, data, callback) {

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

      self._render();

      if (typeof(callback) === "function") {
        callback.call(self);
      }
    };

    return this;

  };

  MorphingSlider.CanvasSlider.prototype.morph = function (callback) { //direction : trueで次、falseで前へ

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
        var position = easings[this.easing](delta / this.duration);

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

  MorphingSlider.CanvasSlider.prototype.play = function (callback) {

    var self = this;
    var _callback = ((typeof(callback) === 'function') ? callback : null);

    this.timer = setInterval(function () {
      self.morph.call(self, _callback);
    }, this.interval + this.duration);

    this.morph(_callback);

    return this;

  };

  MorphingSlider.CanvasSlider.prototype.stop = function () {

    clearInterval(this.timer);

    return this;

  };

  MorphingSlider.CanvasSlider.prototype._render = function () {

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

    return this;

  };

})();

(function() {

    var vertexShaderString = 'uniform float mixAmount;' +
        'attribute vec2 basePosition;' +
        'attribute vec2 targetPosition;' +
        'varying vec2 vBasePosition;' +
        'varying vec2 vTargetPosition;' +
        'varying float vMixAmount;' +
        'void main() {' +
        'vBasePosition = basePosition;' +
        'vTargetPosition = targetPosition;' +
        'vMixAmount = mixAmount;' +
        'vec3 newPosition = vec3(mix(basePosition, targetPosition, mixAmount), 1.0);' +
        'gl_Position = vec4(newPosition, 1.0);' +
        '}';

    var fragmentShaderString = 'uniform sampler2D baseTexture;' +
        'uniform sampler2D targetTexture;' +
        'varying vec2 vBasePosition;' +
        'varying vec2 vTargetPosition;' +
        'varying float vMixAmount;' +
        'void main()' +
        '{' +
        'vec2 colorPosition = vec2((vBasePosition.x + 1.0) / 2.0, (vBasePosition.y + 1.0) / 2.0);' +
        'vec2 colorTargetPosition = vec2((vTargetPosition.x + 1.0) / 2.0, (vTargetPosition.y + 1.0) / 2.0);' +
        'gl_FragColor = mix(texture2D( baseTexture, colorPosition ), texture2D( targetTexture, colorTargetPosition ), vMixAmount);' +
        '}';

    var easings = MorphingSlider._easings;

    MorphingSlider.WebGLSlider = function (container, options) {

        this.direction = (options && typeof options.direction === 'boolean') ? options.direction : true;

        this.easing = (options && typeof options.easing === 'string') ? options.easing : 'linear';

        this.duration = (options && typeof options.duration === 'number') ? options.duration : 500;

        this.interval = (options && typeof options.interval === 'number') ? options.interval : 500;

        this.index = 0;//the index of the displayed image

        this.width = this.height = 0;

        this.isAnimating = false;

        this._textures = [];

        this._vectors = [];

        this._threeObjects = {};

        this._threeObjects.scene = new THREE.Scene();

        this._threeObjects.camera = new THREE.PerspectiveCamera(60, 1);
        this._threeObjects.scene.add(this._threeObjects.camera);

        this._threeObjects.renderer = new THREE.WebGLRenderer();

        var uniforms = {
            baseTexture: {type: "t", value: null},
            targetTexture: {type: "t", value: null},
            mixAmount: {type: "f", value: 0.0}
        };

        var attributes = {
            basePosition: {type: 'v2', value: []},
            targetPosition: {type: 'v2', value: []}
        };

        var geometry = new THREE.Geometry();

        var mat = new THREE.ShaderMaterial({
            vertexShader: vertexShaderString,
            fragmentShader: fragmentShaderString,
            uniforms: uniforms,
            attributes: attributes
        });

        this._threeObjects.mesh = new THREE.Mesh(geometry, mat);

        if(container && container.appendChild) {
            container.appendChild(this._threeObjects.renderer.domElement);
        } else {
            document.body.appendChild(this._threeObjects.renderer.domElement);
        }

        return this;

    };

    MorphingSlider.WebGLSlider.prototype.setFaces = function (faces) {

        this.faces = faces;

        return this;

    };

    MorphingSlider.WebGLSlider.prototype.addSlide = function (src, data, callback) {

        if (typeof(src) !== "string") {
            return this;
        }

        var self = this;
        var texture = new THREE.ImageUtils.loadTexture(src, THREE.UVMapping, function () {
            self.width = self.width > texture.image.width ? self.width : texture.image.width;
            self.height = self.height > texture.image.height ? self.height : texture.image.height;
            self._threeObjects.renderer.setSize(self.width, self.height);

            texture.minFilter = THREE.LinearFilter;

            if (self._textures.length === 0) {
                var cameraZ = -(self.height / 2) / Math.tan((self._threeObjects.camera.fov * Math.PI / 180) / 2);
                self._threeObjects.camera.position.set(0, 0, -cameraZ);
                var material = new THREE.SpriteMaterial({map: texture});
                var sprite = new THREE.Sprite(material);
                sprite.scale.set(self.height, self.height, 1);
                self._threeObjects.scene.add(sprite);
                self._threeObjects.renderer.render(self._threeObjects.scene, self._threeObjects.camera);
                self._threeObjects.scene.remove(sprite);
                material.dispose();

                data.forEach(function (point, index) {
                    self._threeObjects.mesh.geometry.vertices[index] = new THREE.Vector3(Math.round((point[0] * 2 - 1) * 100) / 100, Math.round(((1 - point[1]) * 2 - 1) * 100) / 100, 1.0);
                });

                self.faces.forEach(function (face, index) {
                    self._threeObjects.mesh.geometry.faces[index] = new THREE.Face3(face[0], face[1], face[2]);
                });
            }

            self._textures.push(texture);

            if (typeof(callback) === "function") {
                callback.call(self);
            }

            var vectors = [];
            data.forEach(function (point) {
                vectors.push(new THREE.Vector2(Math.round((point[0] * 2 - 1) * 100) / 100, Math.round(((1 - point[1]) * 2 - 1) * 100) / 100));
            });
            self._vectors.push(vectors);

        });

        return this;

    };

    MorphingSlider.WebGLSlider.prototype.morph = function (callback) { //direction : trueで次、falseで前へ

        if (this.isAnimating || this._textures.length < 2) { //アニメーションの重複を防ぐ
            return this;
        }

        var self = this;

        var startTime = new Date();

        var afterIndex = (this.index + (this.direction * 2 - 1) + this._textures.length) % this._textures.length;

        self._threeObjects.scene.add(self._threeObjects.mesh);

        var uniforms = this._threeObjects.mesh.material.uniforms;
        var attributes = this._threeObjects.mesh.material.attributes;

        uniforms.baseTexture.value = this._textures[this.index]; //いまのMorphingImage
        uniforms.targetTexture.value = this._textures[afterIndex]; //モーフィング後のMorphingImage

        this._vectors[this.index].forEach(function (vector, index) {
            attributes.basePosition.value[index] = self._vectors[self.index][index].clone();
        });

        this._vectors[afterIndex].forEach(function (vector, index) {
            attributes.targetPosition.value[index] = self._vectors[afterIndex][index].clone();
        });

        attributes.basePosition.needsUpdate = true;
        attributes.targetPosition.needsUpdate = true;

        var update = function () {
            var delta = new Date() - startTime;
            if (delta > self.duration) {
                self._threeObjects.mesh.material.uniforms.mixAmount.value = 1.0;
                self._threeObjects.renderer.render(self._threeObjects.scene, self._threeObjects.camera);
                self.index = afterIndex;
                self.isAnimating = false;
                if (typeof(callback) === "function") {
                    callback.call(self);
                }
            } else {
                self._threeObjects.mesh.material.uniforms.mixAmount.value = easings[self.easing](delta / self.duration);
                self._threeObjects.renderer.render(self._threeObjects.scene, self._threeObjects.camera);
                window.requestAnimationFrame(update);
            }
        };

        var af = window.requestAnimationFrame(update);

        this.isAnimating = true;

        return this;

    };

    MorphingSlider.WebGLSlider.prototype.play = function (callback) { //続けてモーフィング direction: true=>前へ false=>後へ, interval: モーフィング間隔

        var self = this;
        var _callback = ((typeof(callback) === 'function') ? callback : null);

        this.timer = setInterval(function () {
            self.morph.call(self, _callback);
        }, this.interval + this.duration);

        this.morph(_callback);

        return this;

    };

    MorphingSlider.WebGLSlider.prototype.stop = function () {

        clearInterval(this.timer);

        return this;

    };

})();
