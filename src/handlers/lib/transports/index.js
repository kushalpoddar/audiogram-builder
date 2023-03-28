var extend = require("underscore").extend,
    serverSettings = require("../settings/"),
    s3 = require("./s3")(serverSettings)

module.exports = extend({}, s3);
