const path = require("path")
const d3 = require("d3")
const queue = d3.queue
const mkdirp = require("mkdirp")
const rimraf = require("rimraf")
const serverSettings = require("../lib/settings/")
const transports = require("../lib/transports/")
const Profiler = require("../lib/profiler.js")
const probe = require("../lib/probe.js")
const getWaveform = require("./waveform.js")
const initializeCanvas = require("./initialize-canvas.js")
const drawFrames = require("./draw-frames.js")
const combineFrames = require("./combine-frames.js")

function Audiogram(id) {

  // Unique audiogram ID
  this.id = id;

  // File locations to use
  this.dir = path.join(serverSettings.workingDirectory, this.id);

  this.audioPath = path.join(this.dir, "audio");
  this.videoPath = path.join(this.dir, "video.mp4");
  this.frameDir = path.join(this.dir, "frames");

  console.log({id : this.id, dir : this.dir, audioPath : this.audioPath, videoPath : this.videoPath, frameDir : this.frameDir })

  this.profiler = new Profiler();

  return this;

}

// Get the waveform data from the audio file, split into frames
Audiogram.prototype.getWaveform = function(cb) {

  var self = this;

  this.status("probing");

  probe(this.audioPath, function(err, data){
    if (err) {
      return cb(err);
    }

    self.profiler.size(data.duration);
    self.set("numFrames", self.numFrames = Math.floor(data.duration * self.settings.theme.framesPerSecond));
    self.status("waveform");

    getWaveform(self.audioPath, {
      numFrames: self.numFrames,
      samplesPerFrame: self.settings.theme.samplesPerFrame,
      channels: data.channels
    }, function(waveformErr, waveform){

      return cb(waveformErr, self.waveform = waveform);

    });


  });

};

// Initialize the canvas and draw all the frames
Audiogram.prototype.drawFrames = function(cb) {

  var self = this;

  this.status("renderer");

  initializeCanvas(this.settings.theme, function(err, renderer){

    if (err) {
      return cb(err);
    }

    self.status("frames");

    drawFrames(renderer, {
      width: self.settings.theme.width,
      height: self.settings.theme.height,
      numFrames: self.numFrames,
      frameDir: self.frameDir,
      caption: self.settings.caption,
      waveform: self.waveform,
      tick: function() {
        transports.incrementField(self.id, "framesComplete");
      }
    }, cb);

  });

};

// Combine the frames and audio into the final video with FFmpeg
Audiogram.prototype.combineFrames = function(cb) {

  this.status("combine");

  combineFrames({
    framePath: path.join(this.frameDir, "%06d.png"),
    audioPath: this.audioPath,
    videoPath: this.videoPath,
    framesPerSecond: this.settings.theme.framesPerSecond
  }, cb);

};

// Master render function, queue up steps in order
Audiogram.prototype.render = function(cb) {

  var self = this,
      q = queue(1);

  this.status("audio-download");

  // Set up tmp directory
  q.defer(mkdirp, this.frameDir);

  // Download the stored audio file
  q.defer(transports.downloadAudio, "audio/" + this.id, this.audioPath);

  // Get the audio waveform data
  q.defer(this.getWaveform.bind(this));

  // Draw all the frames
  q.defer(this.drawFrames.bind(this));

  // Combine audio and frames together with ffmpeg
  q.defer(this.combineFrames.bind(this));

  // Upload video to S3 or move to local storage
  q.defer(transports.uploadVideo, this.videoPath, "video/" + this.id + ".mp4");

  // Delete working directory
  q.defer(rimraf, this.dir);

  // Final callback, results in a URL where the finished video is accessible
  q.await(function(err){

    if (!err) {
      self.set("url", transports.getURL(self.id));
    }

    return cb(err);

  });

  return this;

};

Audiogram.prototype.set = function(field, value) {
  transports.setField(this.id, field, value);
  return this;
};

// Convenience method for .set("status")
Audiogram.prototype.status = function(value) {
  this.profiler.start(value);
  return this.set("status", value);
};

module.exports = Audiogram;
