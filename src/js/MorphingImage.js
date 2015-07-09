class MorphingImage {
    constructor(image, points, faces) {
        this.domElement = image;

        this.originalPoints = points;

        this.points = []; //描画する際の動的な座標
        this._clonePoints();

        this.faces = faces;

        this.container = new createjs.Container();

        this._addBitmaps();
        //this.container.children = this.container.children.concat(this.container.children);

        return this;
    }
    _clonePoints() {
        this.originalPoints.forEach((point, index) => { //対応する座標を保持する
            this.points[index] = {x: point.x, y: point.y};
        });
    }
    _addBitmaps() {//シェイプの作成
        if(window.navigator.userAgent.toLowerCase().indexOf('chrome') < 0) {
            this.faces.forEach((face) => {
                var bmp = new createjs.Bitmap(this.domElement);
                var shape = new createjs.Shape();

                //Chrome以外のブラウザだとメッシュのすき間が見えてしまうのを改善する
                var n = 1.01;//拡大率
                var g = {
                    x: (this.points[face[0]].x + this.points[face[1]].x + this.points[face[2]].x) / 3,
                    y: (this.points[face[0]].y + this.points[face[1]].y + this.points[face[2]].y) / 3
                };//重心
                var d = {x: g.x * (n - 1), y: g.y * (n - 1)};//座標のずれ

                shape.graphics.moveTo(this.points[face[0]].x * n - d.x, this.points[face[0]].y * n - d.y)
                    .lineTo(this.points[face[1]].x * n - d.x, this.points[face[1]].y * n - d.y)
                    .lineTo(this.points[face[2]].x * n - d.x, this.points[face[2]].y * n - d.y);
                bmp.mask = shape;
                this.container.addChild(bmp);
            });
        } else {
            console.log("chrome");
            this.faces.forEach((face) => {
                var bmp = new createjs.Bitmap(this.domElement);
                var shape = new createjs.Shape();
                shape.graphics.moveTo(this.points[face[0]].x, this.points[face[0]].y)
                    .lineTo(this.points[face[1]].x, this.points[face[1]].y)
                    .lineTo(this.points[face[2]].x, this.points[face[2]].y);
                bmp.mask = shape;
                this.container.addChild(bmp);
            });
        }
    }
    setAlpha(a) {
        this.container.alpha = a;
        return this;
    }
    show() {
        this.container.visible = true;
        return this;
    }
    hide() {
        this.container.visible = false;
        return this;
    }
    update() {
        //アフィン変換行列を求め、パーツを描画
        this.faces.forEach((face, index) => {
            var points1 = [this.originalPoints[face[0]], this.originalPoints[face[1]], this.originalPoints[face[2]]];
            var points2 = [this.points[face[0]], this.points[face[1]], this.points[face[2]]];
            var matrix = this._getAffineTransform(points1, points2);
            this.container.children[index].transformMatrix = this.container.children[index].mask.transformMatrix = matrix;
        });
        return this;
    }
    _getAffineTransform(points1, points2){
        var a, b, c, d, tx, ty;

        // 連立方程式を解く
        a = (points2[0].x * points1[1].y + points2[1].x * points1[2].y + points2[2].x * points1[0].y - points2[0].x * points1[2].y - points2[1].x * points1[0].y - points2[2].x * points1[1].y) / (points1[0].x * points1[1].y + points1[1].x * points1[2].y + points1[2].x * points1[0].y - points1[0].x * points1[2].y - points1[1].x * points1[0].y - points1[2].x * points1[1].y);
        b = (points2[0].y * points1[1].y + points2[1].y * points1[2].y + points2[2].y * points1[0].y - points2[0].y * points1[2].y - points2[1].y * points1[0].y - points2[2].y * points1[1].y) / (points1[0].x * points1[1].y + points1[1].x * points1[2].y + points1[2].x * points1[0].y - points1[0].x * points1[2].y - points1[1].x * points1[0].y - points1[2].x * points1[1].y);
        c = (points1[0].x * points2[1].x + points1[1].x * points2[2].x + points1[2].x * points2[0].x - points1[0].x * points2[2].x - points1[1].x * points2[0].x - points1[2].x * points2[1].x) / (points1[0].x * points1[1].y + points1[1].x * points1[2].y + points1[2].x * points1[0].y - points1[0].x * points1[2].y - points1[1].x * points1[0].y - points1[2].x * points1[1].y);
        d = (points1[0].x * points2[1].y + points1[1].x * points2[2].y + points1[2].x * points2[0].y - points1[0].x * points2[2].y - points1[1].x * points2[0].y - points1[2].x * points2[1].y) / (points1[0].x * points1[1].y + points1[1].x * points1[2].y + points1[2].x * points1[0].y - points1[0].x * points1[2].y - points1[1].x * points1[0].y - points1[2].x * points1[1].y);
        tx = (points1[0].x * points1[1].y * points2[2].x + points1[1].x * points1[2].y * points2[0].x + points1[2].x * points1[0].y * points2[1].x - points1[0].x * points1[2].y * points2[1].x - points1[1].x * points1[0].y * points2[2].x - points1[2].x * points1[1].y * points2[0].x) / (points1[0].x * points1[1].y + points1[1].x * points1[2].y + points1[2].x * points1[0].y - points1[0].x * points1[2].y - points1[1].x * points1[0].y - points1[2].x * points1[1].y);
        ty = (points1[0].x * points1[1].y * points2[2].y + points1[1].x * points1[2].y * points2[0].y + points1[2].x * points1[0].y * points2[1].y - points1[0].x * points1[2].y * points2[1].y - points1[1].x * points1[0].y * points2[2].y - points1[2].x * points1[1].y * points2[0].y) / (points1[0].x * points1[1].y + points1[1].x * points1[2].y + points1[2].x * points1[0].y - points1[0].x * points1[2].y - points1[1].x * points1[0].y - points1[2].x * points1[1].y);

        return new createjs.Matrix2D(a, b, c, d, tx, ty);
    }
}

export default MorphingImage;
