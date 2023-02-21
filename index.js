#!/usr/bin/env node
const path = require("path")
// Require settings first, for validation
require("./lib/settings/");

const mkdirp = require("mkdirp");
const Audiogram = require("./audiogram/")

// Can only register fonts once, double-registering throws an error
require("./lib/register-fonts.js");

function render(job) {

  // Creating a directory
  // const k = path.join(__dirname, "media", "audio", job.id)
  // mkdirp(k)
  var audiogram = new Audiogram(job.id);

  audiogram.settings = job;

  audiogram.render(function(err){

    if (err) {
      audiogram.status("error");
      audiogram.set("error", err.toString());
      throw err;
    }

    audiogram.status("ready");

    if (process.env.SPAWNED) {
      return transports.quit();
    }

  });

}

function delay() {
   return transports.workerDelay ? transports.workerDelay() : 0;
}


render({ id : "7d473f70-acdb-11ed-a757-8dafd375cf36", theme : {
  "width": 1280,
  "height": 720,
  "framesPerSecond": 20,
  "maxDuration": 300,
  "samplesPerFrame": 128,
  "pattern": "wave",
  "waveTop": 150,
  "waveBottom": 420,
  "captionTop": 470,
  "captionFont": "300 52px 'Source Sans Pro'",
  "captionLineHeight": 52,
  "captionLineSpacing": 7,
  "captionLeft": 200,
  "captionRight": 1080
} })