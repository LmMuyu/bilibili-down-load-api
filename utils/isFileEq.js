const { basename } = require("path");

module.exports = function (prefile, curfile) {
  return basename(prefile) === curfile;
};
