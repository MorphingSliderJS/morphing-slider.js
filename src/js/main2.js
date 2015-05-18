import EasingFunctions from './easing.js';
import MorphingSlider from './MorphingSlider.js';
import MorphingImage from './MorphingImage.js';

var img1 = document.getElementById("model1");
var img2 = document.getElementById("model2");
img2.onload = init;

d3.select("#transform-easing-select").selectAll("option").data(Object.keys(EasingFunctions)).enter()
    .append("option").attr("value", function(d){
        return d;
    }).html(function(d){
        return d;
    });
d3.select("#alpha-easing-select").selectAll("option").data(Object.keys(EasingFunctions)).enter()
    .append("option").attr("value", function(d){
        return d;
    }).html(function(d){
        return d;
    });

function init() {

    var points = [
        new createjs.Point(0, 0),
        new createjs.Point(img1.width, 0),
        new createjs.Point(img1.width, img1.height),
        new createjs.Point(0, img1.height),
        new createjs.Point(img1.width / 2, img1.height / 2)
    ];

    var points2 = [
        new createjs.Point(0, 0),
        new createjs.Point(img2.width, 0),
        new createjs.Point(img2.width, img2.height),
        new createjs.Point(0, img2.height),
        new createjs.Point(img2.width / 2, img2.height / 2)
    ];

    var faces = createFaces(points);
    var faces2 = createFaces(points2);
    var stage = new createjs.Stage("mycanvas");
    var mi = new MorphingImage(img1, points, faces, stage);
    var mi2 = new MorphingImage(img2, points2, faces2, stage);
    var ms = new MorphingSlider();
    ms.addImage(mi);
    ms.addImage(mi2);
    drawPoint();

    var playButton = document.getElementById("play-button");
    playButton.addEventListener("click", function () {
        ms.clear();
        mi = new MorphingImage(img1, points, faces, stage);
        mi2 = new MorphingImage(img2, points2, faces2, stage);
        ms.addImage(mi);
        ms.addImage(mi2);
        ms.play();
    });

    img1.addEventListener("click", function (e) {
        var rect = e.target.getBoundingClientRect();
        var point = new createjs.Point(e.clientX - rect.left, e.clientY - rect.top);
        points.push(point);
        points2.push(point.clone());
        faces = createFaces(points);
        faces2 = createFaces(points2);
        drawPoint();
    });

    function drawPoint() {
        d3.select("#container1 .points").selectAll("div").data(points).enter().append("div").style("left", function(d){
            return d.x + "px";
        }).style("top", function(d){
            return d.y + "px";
        }).call(d3.behavior.drag()
            .on("drag", function(d,i) {
                points[i].x = d3.event.x;
                points[i].y = d3.event.y;
                d3.select(this).style("left", points[i].x + "px").style("top", points[i].y + "px");
            }));
        d3.select("#container2 .points").selectAll("div").data(points2).enter().append("div").style("left", function(d){
            return d.x + "px";
        }).style("top", function(d){
            return d.y + "px";
        }).call(d3.behavior.drag()
            .on("drag", function(d,i) {
                points2[i].x = d3.event.x;
                points2[i].y = d3.event.y;
                d3.select(this).style("left", points2[i].x + "px").style("top", points2[i].y + "px");
            }));
    }

    //イージングの切り替え
    document.getElementById("transform-easing-select").addEventListener("change", function(){
        ms.transformEasing = this.options[this.selectedIndex].value;
    });
    document.getElementById("alpha-easing-select").addEventListener("change", function(){
        ms.alphaEasing = this.options[this.selectedIndex].value;
    });

    //アニメーション時間の設定
    var dulationInput = document.getElementById("dulation-input");
    dulationInput.value = ms.dulation;
    document.getElementById("dulation-button").addEventListener("click", function(){
        ms.dulation = dulationInput.value;
    });


}

function createFaces(points) {
    //ボロノイ変換関数
    var voronoi = d3.geom.voronoi()
        .x(function (d) {
            return d.x
        })
        .y(function (d) {
            return d.y
        });

    //ドロネー座標データ取得
    var faces = voronoi.triangles(points);
    faces.forEach(function(face, index){
        faces[index] = [
            points.indexOf(faces[index][0]),
            points.indexOf(faces[index][1]),
            points.indexOf(faces[index][2])
        ];
    })

    return faces;
}