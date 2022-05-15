const { spawn } = require("child_process");
const { join, basename } = require("path");
const removeSourceFile = require("../utils/removeSourceFile");
const fse = require("fs-extra");

function ffmpeg(path, options) {
  const args = argsArray(path, options);
  const cdm = spawn("ffmpeg", args, {});

  cdm.stdout.on("data", (data) => {
    console.log(data);
    process.stdout.write(data.toString());
  });

  cdm.stdout.setEncoding("utf-8");
  cdm.stdout.on("error", (err) => {
    console.log(err);
  });

  cdm.stdout.on("end", () => {
    console.log("stdout关闭");

    const removeSfile = options.sourceFile.isremove;
    const outputPath = args[args.length - 1];

    if (fse.existsSync(outputPath) && removeSfile) {
      removeSourceFile(path);
    } else {
      if (removeSfile) {
        console.log(`视频无法通过ffmpeg转换为${options.type},请查看参数`);
      }
    }
  });

  cdm.on("exit", () => {
    console.log("子进程关闭:pid=" + cdm.pid);
  });

  cdm.once("error", (err) => {
    console.log(err);
  });
}

ffmpeg.formats = function () {
  return new Promise((resolve, reject) => {
    const child = spawn("ffmpeg", ["-codecs"]);

    function _resolve(chunk) {
      resolve(chunk.toString());
    }

    child.stdout.on("data", _resolve);
    child.stderr.setEncoding("utf-8");
    child.stderr.on("error", reject);
  });
};

function argsArray(path, options) {
  const args = ["-y"];

  const baseFile = basename(path);
  const filen = baseFile.split(".")[0];

  const type = options.type;
  const fileName = options.filename ?? filen;
  const outputPath = options.output ?? path.replace(filen, "");

  const vIencode = options.vIencode;
  const aIencode = options.aIencode;

  const vOencode = options.vOencode;
  const aOencode = options.aOencode;

  if (!type) {
    return console.error("无视频编码");
  }

  if (vIencode) {
    args.push(...["-c:v", vIencode]);
  }

  if (aIencode) {
    args.push(...["-c:a", aIencode]);
  }

  args.push(...["-i", path]);

  if (vOencode) {
    args.push(...["-c:v", vOencode]);
  }

  if (aOencode) {
    args.push(...["-c:a", aOencode]);
  }

  const outeputPath = `${join(process.cwd(), outputPath, "/" + fileName)}.${type}`;
  args.push(outeputPath);
  return args;
}

module.exports = ffmpeg;
