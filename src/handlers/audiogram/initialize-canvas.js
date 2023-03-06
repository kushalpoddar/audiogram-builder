const fs = require("fs")
const fsPromises = fs.promises;
const path = require("path")
const Canvas = require("canvas")
const svg_to_png = require('svg-to-png');
const getRenderer = require("../renderer/");

const initializeCanvas = async (theme) => {
  try {
    // Fonts pre-registered in bin/worker
    const renderer = getRenderer(theme);

    if (theme.design && theme.design.elements) {
      const design_elements = await Promise.all(theme.design.elements.filter(e => e.type == "IMAGE").map(e => fsPromises.readFile(path.join(__dirname, "..", "settings", "backgrounds", e.path))))
      const design_images = design_elements.map(ele => {
        const ele_img = new Canvas.Image
        ele_img.src = ele
        return ele_img
      })

      renderer.designImages(design_images)
    }

    if (theme.backgroundImage) {
      
      // Convert SVG to PNG
      await svg_to_png.convert(path.join(__dirname, "..", "settings", "backgrounds", theme.backgroundImage), path.join(__dirname, "..", "settings", "backgrounds"))
      
      // Load background image from file (done separately so renderer code can work in browser too)
      const raw = await fsPromises.readFile(path.join(__dirname, "..", "settings", "backgrounds", path.basename(theme.backgroundImage.replace(".svg", ".png"))))

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
