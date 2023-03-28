const fs = require("fs")
const fsPromises = fs.promises;
const path = require("path")
const Canvas = require("canvas")
const svg_to_png = require('svg-to-png');
const getRenderer = require("../renderer/");

const initializeCanvas = async (job_id, theme) => {
  try {
    console.log("JOB", job_id)
    // Fonts pre-registered in bin/worker
    const renderer = getRenderer(theme);

    if (theme.backgroundImage) {
      
      // Convert SVG to PNG
      console.log("21111", path.join(__dirname, "..", "settings", "backgrounds", theme.backgroundImage))
      console.log("11111", path.join(__dirname, "..", "media", "theme", job_id))
      await svg_to_png.convert(path.join(__dirname, "..", "settings", "backgrounds", theme.backgroundImage), path.join(__dirname, "..", "media", "theme", job_id))
      
      // Load background image from file (done separately so renderer code can work in browser too)
      const raw = await fsPromises.readFile(path.join(__dirname, "..", "media", "theme", job_id, path.basename(theme.backgroundImage.replace(".svg", ".png"))))

      const bg = new Canvas.Image;
      bg.src = raw;
      renderer.backgroundImage(bg);
    }

    if(theme.srtLocalPath){
      const srtFile = await fsPromises.readFile(theme.srtLocalPath, "utf-8")

      renderer.processCaptions(srtFile)
    }

    return renderer

  } catch (err) {
    console.log(err)
    return err
  }
}

module.exports = initializeCanvas;
