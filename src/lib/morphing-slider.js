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
