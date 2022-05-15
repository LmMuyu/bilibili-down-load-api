const fs = require("fs");
const fse = require("fs-extra");
const path = require("path");
const axios = require("axios");

// 拼接下载时所需的referer字段
const getRefererByBvid = (bvid) => `https://www.bilibili.com/video/${bvid}`;
const supportedformats = new Map();
const writeCidJsonFnObj = {};

async function downloadApi(bvid, type) {
  const videourls = await getDownPaths(bvid, type);
  const videoPaths = [];

  try {
    for (const { url, title, exist } of videourls) {
      if (!exist) {
        const path = await request(url, type, bvid, title);
        videoPaths.push(path);
      } else {
        videoPaths.push(url);
      }
    }

    videourls.forEach((vidoeDetail) => {
      if (!vidoeDetail.exist) {
        emptyBvidWriteFn(bvid);
      }
    });

    return videoPaths;
  } catch (error) {
    console.log(error);
  }
}

function emptyBvidWriteFn(bvid) {
  if (writeCidJsonFnObj[bvid] && Array.isArray(writeCidJsonFnObj[bvid])) {
    writeCidJsonFnObj[bvid].forEach((writeFn) => writeFn());
  } else {
    console.log("writeCidJsonFnObj->" + bvid, writeCidJsonFnObj[bvid]);
  }
}

async function request(url, type, bvid, title) {
  const writeVideoPath = path.join(process.cwd(), "/roucress/video", `/${title}.${type}`);
  const referer = await getRefererByBvid(bvid);

  const videostream = await axios.get(url, {
    headers: {
      referer,
    },
    responseType: "stream",
  });

  const writeStream = fs.createWriteStream(writeVideoPath);
  videostream.data.pipe(writeStream);

  return new Promise((resolve, reject) => {
    writeStream.on("finish", resolve.bind(null, writeVideoPath));
    writeStream.on("error", reject);
  });
}

const getVideoDetailInfo = async (bvid) => {
  const res = await axios.get("https://api.bilibili.com/x/web-interface/view", {
    params: {
      bvid,
    },
  });
  return [res.data.data.pages.map((item) => item.cid), res.data.data.title];
};

async function getSupportFormats(bvid, cid) {
  const formats = supportedformats.get(bvid);

  if (formats) {
    return formats;
  }

  const params = {
    bvid,
    cid,
  };

  const res = await axios.get("https://api.bilibili.com/x/player/playurl", { params });
  return support_formats(bvid, res.data.data.support_formats);
}

async function getDownPaths(bvid, type) {
  const [cidlists, title] = await getVideoDetailInfo(bvid);
  const paths = [];

  for (const cid of cidlists) {
    const isthere = await thereCid(bvid, cid);

    if (isthere) {
      console.log("视频cid:" + cid + "已存在\n");
      const videoPath = path.join(process.cwd(), "/roucress/video", `${title}.${type}`);
      paths.push({ url: videoPath, title, cid, exist: true });
      continue;
    }

    const formatMap = await getSupportFormats(bvid, cid);

    if (!formatMap.has(type)) {
      console.log("视频格式错误\n");
      return [];
    }

    const params = {
      bvid,
      cid,
      qn: formatMap.get(type),
    };

    const res = await axios.get("https://api.bilibili.com/x/player/playurl", {
      params,
    });

    paths.push({ url: res.data.data.durl[0].url, title, cid });
  }

  return paths;
}

function support_formats(bvid, formats) {
  const has = supportedformats.has(bvid);

  if (has) {
    return supportedformats.get(bvid);
  }

  const formatMap = formats.reduce((map, next) => {
    return map.set(next.format, next.quality);
  }, new Map());

  supportedformats.set(bvid, formatMap);
  return formatMap;
}

async function thereCid(bvid, cid) {
  const cidfilepath = path.join(__dirname, "..", "/cid.json");
  const cidjson = JSON.parse((await fse.readFile(cidfilepath, "utf-8")).toString());
  const isthere = cidjson["cid"].indexOf(cid) > -1;

  if (!isthere) {
    cidjson.cid.push(cid);
    const write = () =>
      fs.writeFileSync(cidfilepath, JSON.stringify(cidjson), {
        encoding: "utf-8",
      });

    writeCidJsonFnObj[bvid]
      ? writeCidJsonFnObj[bvid].push(write)
      : (writeCidJsonFnObj[bvid] = [write]);
  }

  return isthere;
}

// "BV1cS4y1h7JK", "mp4";
module.exports = downloadApi;
