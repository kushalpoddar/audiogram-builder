var fonts = require("./settings/").fonts,
    _ = require("underscore"),
    Canvas = require("canvas");

console.log({fonts})
// Register custom fonts one time
if (Array.isArray(fonts)) {
  for(let font of fonts){
    Canvas.registerFont(font.file, _.pick(font, "family", "weight", "style"));
  }
}
