var fs = require("fs"),
  path = require("path"),
  Canvas = require("canvas"),
  queue = require("d3").queue;

function drawFrames(renderer, options, cb) {

  // At a time 10 tasks would be processed in parallel
  const frameQueue = queue(10)
  let canvases = [];

  // Creating 10 canvases
  for (var i = 0; i < 10; i++) {
    canvases.push(Canvas.createCanvas(options.width, options.height));
  }

  console.log("options.numFrames", options.numFrames)

  const words = renderer.processCaptions()
  const endFrames = words.map(obj => obj.end)
  
  dynamic_captions = []
  for (i = 0; i < options.numFrames; i++) {
    // Find the largest block
    const ind = endFrames.findIndex(f => i < f)
    dynamic_captions.push(ind)
  }

  // Adding all frames as a task in queue
  for (var i = 0; i < options.numFrames; i++) {
    frameQueue.defer(drawFrame, i);
  }

  frameQueue.awaitAll(cb);

  function drawFrame(frameNumber, frameCallback) {

    const canvas = canvases.pop()
    const context = canvas.getContext("2d");

    renderer.drawFrame(context, {
      caption: words[dynamic_captions[frameNumber]].text,
      waveform: options.waveform[frameNumber],
      frame: frameNumber
    });
    // renderer.drawFrame(context, {
    //   caption: options.caption,
    //   waveform: options.waveform[frameNumber],
    //   frame: frameNumber
    // });

    canvas.toBuffer(function (err, buf) {

      if (err) {
        return cb(err);
      }

      fs.writeFile(path.join(options.frameDir, (frameNumber + 1).toString().padStart(6, '0') + ".png"), buf, function (writeErr) {

        if (writeErr) {
          return frameCallback(writeErr);
        }

        if (options.tick) {
          options.tick();
        }

        canvases.push(canvas);

        return frameCallback(null);

      });

    });

  }

}

module.exports = drawFrames;
