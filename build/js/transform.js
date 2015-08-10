var stage = new createjs.Stage("mycanvas");
var originalPoints = [
    new createjs.Point(0, 0),
    new createjs.Point(500, 0),
    new createjs.Point(500, 500),
    new createjs.Point(0, 500),
    new createjs.Point(250, 250)
];
var points;
var bitmaps = [];
var faces;

var img = new Image();
img.src = "img/leg.jpg";
img.onload = init;

function init() {

    clonePoints();

    createFaces();

    createBitmaps();

    putPoints();


    stage.addEventListener("click", function(e){
        //console.log(e.target);
        if(e.target.image){//制御点以外をクリックした場合
            //ポイントの追加
            var newpoint = new createjs.Point(e.stageX, e.stageY);
            originalPoints.push(newpoint);
            clonePoints();

            stage.removeAllChildren();
            createFaces();
            createBitmaps();
            transformImage();
            putPoints();
            stage.update();
        }
    });
    stage.update();
}

function clonePoints() {
    points = [];
    originalPoints.forEach(function (point) {
        var pointClone = point.clone();
        pointClone.original = point;
        points.push(pointClone);
    });
}

function createFaces() {
    //ボロノイ変換関数
    var voronoi = d3.geom.voronoi()
        .x(function (d) {
            return d.x
        })
        .y(function (d) {
            return d.y
        });

    //ドロネー座標データ取得
    faces = voronoi.triangles(points);
    console.log(faces);

    //var faces = [
    //    [points[0], points[1], points[2]],
    //    [points[1], points[2], points[3]],
    //    [points[2], points[3], points[4]],
    //    [points[2], points[4], points[5]],
    //    [points[2], points[5], points[0]]
    //];
}

function createBitmaps() {
    bitmaps = [];
    faces.forEach(function(face){
        var bmp = new createjs.Bitmap(img);
        var shape = new createjs.Shape();
        shape.graphics.moveTo(face[0].x, face[0].y)
            .lineTo(face[1].x, face[1].y)
            .lineTo(face[2].x, face[2].y);
        bmp.mask = shape;
        bitmaps.push(bmp);
        stage.addChild(bmp);
    });
}

function putPoints() {
    //制御点の設置
    points.forEach(function(point, index){
        var circle = new createjs.Shape();
        circle.graphics.beginFill("DeepSkyBlue").drawCircle(0, 0, 10);
        circle.x = point.x;
        circle.y = point.y;
        circle.target = points[index];
        stage.addChild(circle);
        circle.addEventListener("pressmove", function(e){
            var circle = e.target;
            //circle.graphics.clear().beginFill("yellow").drawCircle(0, 0, 10);
            circle.x = circle.target.x = e.stageX;
            circle.y = circle.target.y = e.stageY;

            transformImage();
            stage.update();
        });
    });
}

function transformImage() {
    //アフィン変換行列を求め、パーツを描画
    faces.forEach(function(face, index){
        var points1 = [face[0].original, face[1].original, face[2].original];
        var points2 = [face[0], face[1], face[2]];
        var matrix = getAffineTransform(points1, points2);
        bitmaps[index].transformMatrix = bitmaps[index].mask.transformMatrix = matrix;
    });
}

function getAffineTransform(points1, points2){
    var a, b, c, d, tx, ty;

    // 連立方程式を解く
    a = (points2[0].x * points1[1].y + points2[1].x * points1[2].y + points2[2].x * points1[0].y - points2[0].x * points1[2].y - points2[1].x * points1[0].y - points2[2].x * points1[1].y) / (points1[0].x * points1[1].y + points1[1].x * points1[2].y + points1[2].x * points1[0].y - points1[0].x * points1[2].y - points1[1].x * points1[0].y - points1[2].x * points1[1].y);
    b = (points2[0].y * points1[1].y + points2[1].y * points1[2].y + points2[2].y * points1[0].y - points2[0].y * points1[2].y - points2[1].y * points1[0].y - points2[2].y * points1[1].y) / (points1[0].x * points1[1].y + points1[1].x * points1[2].y + points1[2].x * points1[0].y - points1[0].x * points1[2].y - points1[1].x * points1[0].y - points1[2].x * points1[1].y);
    c = (points1[0].x * points2[1].x + points1[1].x * points2[2].x + points1[2].x * points2[0].x - points1[0].x * points2[2].x - points1[1].x * points2[0].x - points1[2].x * points2[1].x) / (points1[0].x * points1[1].y + points1[1].x * points1[2].y + points1[2].x * points1[0].y - points1[0].x * points1[2].y - points1[1].x * points1[0].y - points1[2].x * points1[1].y);
    d = (points1[0].x * points2[1].y + points1[1].x * points2[2].y + points1[2].x * points2[0].y - points1[0].x * points2[2].y - points1[1].x * points2[0].y - points1[2].x * points2[1].y) / (points1[0].x * points1[1].y + points1[1].x * points1[2].y + points1[2].x * points1[0].y - points1[0].x * points1[2].y - points1[1].x * points1[0].y - points1[2].x * points1[1].y);
    tx = (points1[0].x * points1[1].y * points2[2].x + points1[1].x * points1[2].y * points2[0].x + points1[2].x * points1[0].y * points2[1].x - points1[0].x * points1[2].y * points2[1].x - points1[1].x * points1[0].y * points2[2].x - points1[2].x * points1[1].y * points2[0].x) / (points1[0].x * points1[1].y + points1[1].x * points1[2].y + points1[2].x * points1[0].y - points1[0].x * points1[2].y - points1[1].x * points1[0].y - points1[2].x * points1[1].y);
    ty = (points1[0].x * points1[1].y * points2[2].y + points1[1].x * points1[2].y * points2[0].y + points1[2].x * points1[0].y * points2[1].y - points1[0].x * points1[2].y * points2[1].y - points1[1].x * points1[0].y * points2[2].y - points1[2].x * points1[1].y * points2[0].y) / (points1[0].x * points1[1].y + points1[1].x * points1[2].y + points1[2].x * points1[0].y - points1[0].x * points1[2].y - points1[1].x * points1[0].y - points1[2].x * points1[1].y);

    var matrix = new createjs.Matrix2D(a, b, c, d, tx, ty);
    return matrix;
}

