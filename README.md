![Top image](https://github.com/MorphingSliderJS/morphing-slider.js/wiki/images/top.jpg)
MorphingSlider.js
====

MorphingSliderJS is the library for morphing animation on website with JavaScript and Canvas.
![Demo gif of morphing animation](https://github.com/MorphingSliderJS/morphing-slider.js/wiki/images/demo.gif)

## Description
You can put morphing animations in to your website by configuring continuous images and their corresponding points.
![Defining corresponding points](https://github.com/MorphingSliderJS/morphing-slider.js/wiki/images/sample.png)
This is realized by triangulating each image and transforming them.
So you need to prepare data of points and faces (triangles) created by [Morphing Editor](https://morphing-slider.herokuapp.com/).

## Morphing Editor
[Here](https://morphing-slider.herokuapp.com/)

## Requirement
This library depends on easelJS.  
*easelJS* http://www.createjs.com/

## Usage
Load easelJS and MorphingSlider.js.
#### index.html
    <canvas id="mySlider"></canvas>

    <script src="easeljs-0.8.1.js"></sctipt>
    <script src="MorphingSlider.js"></sctipt>

#### app.js
    var ms = new MorphingSlider("mySlider");
    
    ms.addSlide("path/to/image/1.jpg", {"points":[{"x":0,"y":0},{"x":………);
    ms.addSlide("path/to/image/2.jpg", {"points":[{"x":0,"y":0},{"x":………);
    
    ms.play();

## Documentation

### Constructor

**MorphingSlider** ( canvas_id )

***Parameters:***

_canvas_id_ String  
The string id of a canvas object in the current document.

### Methods

**play** ( [direction], [interval], [callback] )

Plays the morphing at a certain interval automatically.

***Parameters:***

_[direction]_ Boolean  
The direction of morphing. If _true_, the slider morphs in regular order, and if _false, it morphs in reverse order.

_[interval]_ Number  
A number determining the interval of autoplay by milliseconds.

_[callback]_ Function  
A function called when every morphing has finished.

**stop** ()

Stops the autoplay.  

**morph** ( [direction], [callback] )

Plays the morphing ones.

***Parameters:***

_[direction]_ Boolean  
The direction of morphing. If _true_, the slider morphs in regular order, and if _false_, it morphs in reverse order.

_[callback]_ Function  
A function called when the morphing has finished.

**addSlide** ( imgURL, data, [callback] )

Adds a slide image and data.

***Parameters:***

_imgURL_ String  
The URL to a image to add.

_data_ Object  
The data of points and faces prepared by [the morphing editor](https://image-morphing.herokuapp.com/).

_[callback]_ Function  
A function called when the image has loaded.

**removeSlide** ( index )

Removes a slide image and data.

***Parameters:***

_index_ Number  
The index of a slider to be removed.

**clear** ()

Removes all slide images and data.

### Properties

**direction** Boolean  
The direction of morphing (default value is _true_)  

**dulation** Number  
The dulation time of morphing by milliseconds (default value is _500_)  

**interval** Number  
The interval time of autoplay by milliseconds (default value is _1000_)  

**easing** String  
The name of easingFunction used for the morphing animation.  
Supports following: _linear, easeInQuad, easeOutQuad, easeInOutQuad, easeInCubic, easeOutCubic, easeInOutCubic, easeInQuart, easeOutQuart, easeInOutQuart, easeInQuint, easeOutQuint, easeInOutQuint_

**width** _[readonly]_  
The width of the slider. It is the max of all slides'.

**height** _[readonly]_  
The width of the slider. It is the max of all slides'.

**index** Number _[readonly]_  
The index of the displaying slide.

**isAnimating** Boolean _[readonly]_  
Wheather or not the morphing is playing.

**stage** Stage _[final][readonly]_  
The Stage object of easelJS.  

**slides** Array _[readonly]_  
The array of slides.  

## Install

## Contribution

## Author
[mildsummer](https://github.com/mildsummer)
