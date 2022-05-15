const fse = require("fs-extra");

async function fileWriteJson(path, data) {
  if (fse.existsSync(path) && path.endsWith(".json")) {
    try {
      await fse.writeFile(path, data);
    } catch (error) {
      console.log(error);
    }
  }
}

function fileReadJson(path) {
  if (fse.existsSync(path) && path.endsWith(".json")) {
    try {
      const jsondata = fse.readFileSync(path, data).toString();
      return JSON.parse(jsondata);
    } catch (error) {
      console.log(error);
    }
  }
}

module.exports = {
  fileReadJson,
  fileWriteJson,
};
