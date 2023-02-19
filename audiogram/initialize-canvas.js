const fs = require("fs")
const path = require("path")
const Canvas = require("canvas")
const getRenderer = require("../renderer/");

function initializeCanvas(theme, cb) {

  // Fonts pre-registered in bin/worker
  var renderer = getRenderer(theme);

  if (!theme.backgroundImage) {
    return cb(null, renderer);
  }

  // Load background image from file (done separately so renderer code can work in browser too)
  fs.readFile(path.join(__dirname, "..", "settings", "backgrounds", theme.backgroundImage), function(err, raw){

    if (err) {
      return cb(err);
    }

    var bg = new Canvas.Image;
    bg.src = raw;
    renderer.backgroundImage(bg);

    return cb(null, renderer);

  });

}

module.exports = initializeCanvas;