#!/usr/bin/env node

// Require settings first, for validation
require("./lib/settings/");

const Audiogram = require("./audiogram/")

// Can only register fonts once, double-registering throws an error
require("./lib/register-fonts.js");

function render(job) {

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

    setTimeout(pluckJob, delay());

  });

}

function delay() {
   return transports.workerDelay ? transports.workerDelay() : 0;
}


render({ id : Date.now().toString() })