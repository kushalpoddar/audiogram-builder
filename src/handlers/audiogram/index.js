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

function Audiogram(job) {

  // Unique audiogram ID
  this.id = job.id;

  // Settings
  this.settings = job

  // File locations to use
  this.dir = path.join(serverSettings.workingDirectory, this.id);

  this.audioPath = path.join(this.dir, "audio");
  this.videoPath = path.join(this.dir, "video.mp4");
  this.frameDir = path.join(this.dir, "frames");

  this.profiler = new Profiler();

  return this;

}

// Get the waveform data from the audio file, split into frames
Audiogram.prototype.getWaveform = function(cb) {

  var self = this;

  probe(this.audioPath, function(err, data){
    if (err) {
      return cb(err);
    }

    self.profiler.size(data.duration);
    self.numFrames = Math.floor(data.duration * self.settings.theme.framesPerSecond)

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

  initializeCanvas(self.id, self.settings.theme).then((renderer) => {
    drawFrames(renderer, {
      width: self.settings.theme.width,
      height: self.settings.theme.height,
      numFrames: self.numFrames,
      frameDir: self.frameDir,
      caption: self.settings.caption,
      waveform: self.waveform,
      tick: function() {
        self.framesComplete = (self.framesComplete || 0) + 1
      }
    }, cb);
  }).catch(err => {
    return cb(err);
  })

};

// Combine the frames and audio into the final video with FFmpeg
Audiogram.prototype.combineFrames = function(cb) {

  combineFrames({
    framePath: path.join(this.frameDir, "%06d.png"),
    audioPath: this.audioPath,
    videoPath: this.videoPath,
    framesPerSecond: this.settings.theme.framesPerSecond
  }, cb);

};

// Master render function, queue up steps in order
Audiogram.prototype.render = function(cb) {

  const self = this
  const q = queue(1);

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

    return cb(err);

  });

  return this;

};

module.exports = Audiogram;
