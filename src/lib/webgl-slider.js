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
