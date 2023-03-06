const patterns = require("./patterns.js")
const textWrapper = require("./text-wrapper.js");

module.exports = function (t) {

  let renderer = {},
    backgroundImage,
    logoImage,
    designImages,
    wrapText,
    theme,
    captions;

  renderer.backgroundImage = function (_) {
    if (!arguments.length) return backgroundImage;
    backgroundImage = _;
    return this;
  };

  renderer.logoImage = function (_) {
    if (!arguments.length) return logoImage;
    logoImage = _;
    return this;
  };

  renderer.processCaptions = function(_){
    if (!arguments.length) return captions;
    
    captions = _.split("\n\n").map(block => {
      const child_arr = block.split("\n")
      const timestamps = child_arr[1].split(" --> ").map(t => ((new Date(`1970-01-01T${t.replace(",", ".")}Z`)).getTime()/1000))
      return {
        text : child_arr[2],
        start : parseInt(Math.round(timestamps[0]*theme.framesPerSecond)),
        end : parseInt(Math.round(timestamps[1]*theme.framesPerSecond))
      }
    });
    
    return this;
  }

  renderer.designImages = function (_) {
    if (!arguments.length) return designImages;
    designImages = _;
    return this;
  };

  renderer.theme = function (_) {
    if (!arguments.length) return theme;

    theme = _;

    // Default colors
    theme.backgroundColor = theme.backgroundColor || "#fff";
    theme.waveColor = theme.waveColor || theme.foregroundColor || "#000";
    theme.captionColor = theme.captionColor || theme.foregroundColor || "#000";

    // Default wave dimensions
    if (typeof theme.waveTop !== "number") theme.waveTop = 0;
    if (typeof theme.waveBottom !== "number") theme.waveBottom = theme.height;
    if (typeof theme.waveLeft !== "number") theme.waveLeft = 0;
    if (typeof theme.waveRight !== "number") theme.waveRight = theme.width;

    wrapText = textWrapper(theme);

    return this;
  };

  // Draw the frame
  renderer.drawFrame = function (context, options) {

    context.patternQuality = "best";

    // Draw the background image and/or background color
    context.clearRect(0, 0, theme.width, theme.height);

    if (theme.backgroundColor) {
      context.fillStyle = theme.backgroundColor;
      context.fillRect(0, 0, theme.width, theme.height);
    }

    if (theme.backgroundGradientColor1 && theme.backgroundGradientColor2) {
      const gradient = context.createLinearGradient(theme.width/2, 0, theme.width/2, theme.height);

      gradient.addColorStop(0, theme.backgroundGradientColor1);
      gradient.addColorStop(1, theme.backgroundGradientColor2);
      context.fillStyle = gradient;
      context.fillRect(0, 0, theme.width, theme.height);
    }

    if (backgroundImage) {
      context.drawImage(backgroundImage, 0, 0, theme.width, theme.height);
    }

    if (logoImage) {
      context.drawImage(logoImage, 0, 0, theme.width, theme.height);
    }

    if(designImages && designImages.length){
      const themeImages = theme.design.elements.filter(e => e.type === "IMAGE")
      for(let eleIndex in designImages){
        const ele = designImages[eleIndex]
        context.drawImage(ele, theme.width*(themeImages[eleIndex].boxXPerc), theme.width*(themeImages[eleIndex].boxYPerc), theme.width*(themeImages[eleIndex].boxWPerc), theme.width*(themeImages[eleIndex].boxHPerc));
      }
    }

    patterns[theme.pattern || "wave"](context, options.waveform, theme);

    // Write the caption
    if (options.caption) {
      wrapText(context, options.caption);
    }

    return this;

  };

  if (t) {
    renderer.theme(t);
  }

  return renderer;

}
