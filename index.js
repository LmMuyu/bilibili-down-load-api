const bilibiliDownLoadApi = require("./ilb/bilibilb");
const ffmpeg = require("./ilb/ffmpeg");

async function down(bv, type, options) {
  const videoPaths = await bilibiliDownLoadApi(bv, type);

  if (options && Object.prototype.toString.call(options) === "[object Object]") {
    const openffmpeg = options.openFFmpeg;

    if (openffmpeg) {
      return videoPaths.map((path) => ffmpeg(path, options));
    } else {
      return videoPaths;
    }
  }
}

// down("BV1cS4y1h7JK", "mp4", {
//   openFFmpeg: true,
//   output: "./roucress",
//   type: "webm",
//   sourceFile: {
//     isremove: true,
//   },
// });

down("BV1YL4y1F7iE", "mp4");
module.exports = down;
