const fse = require("fs-extra");

async function removeSourceFile(path) {
  if (fse.existsSync(path)) {
    try {
      await fse.remove(path);
      return true;
    } catch (error) {
      console.log(error);
      console.log("文件删除失败");
      return false;
    }
  } else {
    console.log("文件不存在");
    return true;
  }
}

module.exports = removeSourceFile;
