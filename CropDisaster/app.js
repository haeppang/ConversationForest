var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var bodyParser = require("body-parser");
var logger = require("morgan");
var indexRouter = require("./routes/index");
var app = express();
var mysql = require("mysql");
var fs = require("fs");
var multer = require("multer");
var AdmZip = require("adm-zip");

// const upload = multer({ dest: "uploads/" })
const { JSDOM } = require("jsdom");
const { window } = new JSDOM("");
const $ = require("jquery")(window);
const superagent = require("superagent");
const moment = require("moment");

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "public/tempdata")); // cb 콜백함수를 통해 전송된 파일 저장 디렉토리 설정
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
    // if (req._parsedOriginalUrl.pathname == "/upload_count") {
    //   cb(null, new Date().valueOf() + path.extname(file.originalname))
    // } else {
    // }
  },
});
var upload = multer({
  storage: storage,
});
// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/users", express.static("/mnt/hdd2/CropDisaster"));

app.get("/onloadEnvir", function (req, res) {
  var connection = mysql.createConnection({
    host: "phenome.iptime.org",
    port: "63306",
    user: "oogis",
    password: "oogis320",
    database: "Enviromental",
  });
  var sql =
    "SELECT from_unixtime(`time@timestamp`, '%Y-%m-%d %H:%i:%s') AS times, data_format_0, data_format_1, data_format_2, data_format_3\
  FROM Enviromental.`GMOCMT_Inside Data_data` order by times desc limit 1440;";

  connection.query(sql, function (err, data) {
    if (err) throw err;
    connection.end();
    res.send(data);
  });
});

app.get("/searchFile", function (req, res) {
  var base_folder = "/mnt/hdd1/2022_NIA";
  var folder = req.query.folder;
  var id = req.query.id;

  fs.readdir(path.join(base_folder, folder), function (err, filelist) {
    if (err) throw err;

    var fsData = [];
    $.each(filelist, function (i, data) {
      if (fs.lstatSync(path.join(base_folder, folder, data)).isDirectory()) {
        fsData.unshift({
          text: data,
          href: path.join(folder, data),
          nodes: [],
        });
      } else {
        if ((path.extname(data) == ".png" || path.extname(data) == ".jpg") && id == "treeview_info") {
          fsData.push({
            text: data,
            href: path.join(folder, data),
          });
        }
      }
    });
    res.send(fsData);
  });
});

app.post("/Upload_Data", function (req, res) {
  // mySQL Connection
  var connection = mysql.createConnection({
    host: "phenome.iptime.org",
    port: "23306",
    user: "choi",
    password: "1518",
    database: "CropDisaster",
  });
  // var species = req.body.species
  // var res_purpose = req.body.res_purpose
  // var res_type = req.body.res_type
  // var admin = req.body.admin
  // var res_stdate = req.body.res_stdate
  // var res_eddate = req.body.res_eddate
  // var res_name = req.body.res_name
  // var type = req.body.type
  // var nodes = JSON.parse(req.body.node)
  var text = "error";
  superagent
    .post("192.168.0.97:8000/move")
    .query({
      species: req.body.species,
      res_purpose: req.body.res_purpose,
      res_type: req.body.res_type,
      res_admin: req.body.admin,
      res_stdate: req.body.res_stdate,
      res_eddate: req.body.res_eddate,
      res_name: req.body.res_name,
      type: req.body.type,
      nodes: req.body.node,
    })
    .end((err, res) => {
      if (err) throw err;
    });
});

app.get("/getResearch", function (req, res) {
  var name = req.query.name;
  var admin = req.query.admin;
  var stdate = req.query.res_stdate;
  var eddate = req.query.res_eddate;

  var sql = "SELECT * FROM Research";
  if (name != (undefined || "") || admin != (undefined || "") || stdate != (undefined || "") || eddate != (undefined || "")) {
    sql +=
      " WHERE " +
      (admin == (undefined || "") ? "" : "res_admin = '" + admin + "'") +
      (name == (undefined || "") ? "" : admin != (undefined || "") ? " AND res_name = '" + name + "'" : " res_name = '" + name + "'");

    if (stdate == (undefined || "")) "";
    else {
      if (admin != (undefined || "") || name != (undefined || "")) sql += " AND ";
      sql += "res_stdate >= '" + stdate + "'";
    }
    if (eddate == (undefined || "")) "";
    else {
      if (admin != (undefined || "") || name != (undefined || "") || stdate == (undefined || "")) sql += " AND ";
      sql += "res_eddate <= '" + eddate + "'";
    }
  }
  var connection = mysql.createConnection({
    host: "phenome.iptime.org",
    port: "23306",
    user: "choi",
    password: "1518",
    database: "CropDisaster",
  });

  connection.query(sql, function (err, data) {
    if (err) throw err;
    connection.end();
    res.send(data);
  });
});

app.post("/get_envir", upload.any("file"), function (req, res) {
  superagent
    .post("192.168.0.97:8000/getEnvir")
    .query({ files: req.files[0].path })
    .end((err, result) => {
      if (err) throw err;
    });
});

app.post("/get_water", upload.any("file"), function (req, res) {
  superagent
    .post("192.168.0.97:8000/getWater")
    .query({ files: req.files[0].path, id: req.body.id })
    .end((err, result) => {
      if (err) throw err;
    });
});

app.post("/get_name", upload.any("file"), function (req, res) {
  superagent
    .post("192.168.0.97:8000/getGrouping")
    .query({ files: req.files[0].path, id: req.body.id })
    .end((err, result) => {
      if (err) throw err;
    });
});

app.get("/onloadTable", (req, res) => {
  // mySQL Connection
  var connection = mysql.createConnection({
    host: "phenome.iptime.org",
    port: "23306",
    user: "choi",
    password: "1518",
    database: "CropDisaster",
  });

  var res_type = req.query.res_type;
  var admin = req.query.admin;
  var res_stdate = req.query.res_stdate;
  var res_eddate = req.query.res_eddate;
  var sql = "SELECT * FROM Research";

  if (res_type != (undefined || "0") || admin != (undefined || "") || res_stdate != (undefined || "") || res_eddate != (undefined || "")) {
    sql +=
      " WHERE " +
      (admin == (undefined || "") ? "" : "res_admin = '" + admin + "'") +
      (res_type == (undefined || "0") ? "" : admin != (undefined || "") ? " AND res_type = '" + res_type + "'" : " res_type = '" + res_type + "'");

    if (res_stdate == (undefined || "")) "";
    else {
      if (admin != (undefined || "") || res_type != (undefined || "0")) sql += " AND ";
      sql += "res_stdate >= '" + res_stdate + "'";
    }

    if (res_eddate == (undefined || "")) "";
    else {
      if (admin != (undefined || "") || res_type != (undefined || "0") || res_stdate == (undefined || "")) sql += " AND ";
      sql += "res_eddate <= '" + res_eddate + "'";
    }
  }

  connection.query(sql, function (err, data) {
    if (err) throw err;
    connection.end();
    res.send(data);
  });
});


app.get("/getStatus", function(req, res) {
  var connection = mysql.createConnection({
    host: "phenome.iptime.org",
    port: "23306",
    user: "choi",
    password: "1518",
    database: "CropDisaster",
  });
  var sql = "SELECT * FROM status";

  connection.query(sql, function (err, result) {
    if (err) throw err;
    res.send(result);
  })
})


app.post("/onloadChart", function (req, res) {
  // mySQL Connection
  var connection = mysql.createConnection({
    host: "phenome.iptime.org",
    port: "23306",
    user: "choi",
    password: "1518",
    database: "CropDisaster",
  });

  var id = req.body.res_id;
  var sql1 = "SELECT * FROM Image WHERE res_id = " + id;

  connection.query(sql1, function (err, result) {
    if (err) throw err;

    var tmp_id = [];
    var tmp = [];
    $.each(result, function (i, v) {
      tmp_id.push(v.img_id);
      tmp.push({
        img_id: v["img_id"],
        img_name: v["img_name"],
        img_path: v["img_path"],
        label: v["label"],
        angle: v["angle"],
        time: v["time"],
      });

      if (i == result.length - 1) {
        var sql2 = "SELECT * FROM parameter WHERE img_id in(" + tmp_id + ");";

        connection.query(sql2, function (err2, result2) {
          if (err) throw err;

          var data = [];
          $.each(result2, function (i2, v2) {
            var idx = tmp.findIndex((v) => {
              return v.img_id == v2.img_id;
            });

            data.push({
              img_id: tmp[idx]["img_id"],
              img_name: tmp[idx]["img_name"],
              img_path: tmp[idx]["img_path"],
              time: tmp[idx]["time"],
              label: tmp[idx]["label"],
              angle: tmp[idx]["angle"],
              dt0: v2["dt_format_0"],
              dt1: v2["dt_format_1"],
              dt2: v2["dt_format_2"],
              dt3: v2["dt_format_3"],
              dt4: v2["dt_format_4"],
              dt5: v2["dt_format_5"],
              dt6: v2["dt_format_6"],
              dt7: v2["dt_format_7"],
              dt8: v2["dt_format_8"],
              dt9: v2["dt_format_9"],
              dt10: v2["dt_format_10"],
              dt11: v2["dt_format_11"],
              dt12: v2["dt_format_12"],
              dt13: v2["dt_format_13"],
              dt14: v2["dt_format_14"],
              dt15: v2["dt_format_15"],
              dt16: v2["dt_format_16"],
              dt17: v2["dt_format_17"],
              dt18: v2["dt_format_18"],
              dt19: v2["dt_format_19"],
              dt20: v2["dt_format_20"],
              dt21: v2["dt_format_21"],
              dt22: v2["dt_format_22"],
            });
            if (i2 == result2.length - 1) {
              connection.end();
              res.send(data);
            }
          });
        });
      }
    });
  });
});

app.get("/onloadGrouping", function (req, res) {
  var connection = mysql.createConnection({
    host: "phenome.iptime.org",
    port: "23306",
    user: "choi",
    password: "1518",
    database: "CropDisaster",
  });
  var id = req.query.res_id;
  var sql = "SELECT `group`, label FROM label_grouping WHERE res_id = " + id;

  connection.query(sql, function (err, result) {
    if (err) throw err;
    res.send(result);
  });
});

app.get("/dataAttribute", function (req, res) {
  var connection = mysql.createConnection({
    host: "phenome.iptime.org",
    port: "23306",
    user: "choi",
    password: "1518",
    database: "CropDisaster",
  });

  var sql = "SELECT dt_format_index, comment FROM parameter_definition;";

  connection.query(sql, function (err, result) {
    if (err) throw err;
    res.send(result);
  });
});

app.post("/onloadEnvir", function (req, res) {
  var connection = mysql.createConnection({
    host: "phenome.iptime.org",
    port: "23306",
    user: "choi",
    password: "1518",
    database: "CropDisaster",
  });

  var stdate = req.body.stdate;
  var eddate = req.body.eddate;

  var sql = "SELECT temp, humidity, insolation, co2, time FROM Enviromental WHERE time between '" + stdate + "' AND '" + eddate + "'";

  connection.query(sql, function (err, result) {
    if (err) throw err;
    var datas = [];

    $.each(result, function (i, v) {
      datas.push({
        temp: v.temp,
        hum: v.humidity,
        insol: v.insolation,
        co2: v.co2,
        time: v.time,
      });

      if (result.length == datas.length) {
        connection.end();
        res.send(datas);
      }
    });
  });
});

app.post("/onloadColor", function (req, res) {
  var id = JSON.parse(req.body.id);
  var connection = mysql.createConnection({
    host: "phenome.iptime.org",
    port: "23306",
    user: "choi",
    password: "1518",
    database: "CropDisaster",
  });

  var sql = "SELECT img_id, value FROM color where img_id in (" + id + ")";

  connection.query(sql, function (err, result) {
    if (err) throw err;
    var datas = [];

    $.each(result, function (i, v) {
      datas.push({
        imgid: v.img_id,
        val: v.value,
      });
      if (result.length == datas.length) {
        connection.end();
        res.send(datas);
      }
    });
  });
});

app.post("/onloadWater", function (req, res) {
  var connection = mysql.createConnection({
    host: "phenome.iptime.org",
    port: "23306",
    user: "choi",
    password: "1518",
    database: "CropDisaster",
  });

  var id = req.body.res_id;

  var sql = "SELECT * FROM water WHERE res_id = " + id;

  connection.query(sql, function (err, result) {
    if (err) throw err;
    var datas = [];

    $.each(result, function (i, v) {
      datas.push({
        label: v.label,
        time: v.time,
        amount: v.amount,
        before: v.before,
        after: v.after,
      });

      if (result.length == datas.length) {
        connection.end();
        res.send(datas);
      }
    });
  });
});

app.get("/GetMask", function (req, res) {
  //이미지 처리 서버에 선택한 색상 영역만 가시화한 이미지를 생성 요청
  superagent
    .post("192.168.0.97:8000/masking")
    .query({ images: req.query.image, hmin: req.query.hmin, hmax: req.query.hmax, savedir: path.join(__dirname, "public", "images"), resize: req.query.resize })
    .end((err, result) => {
      console.log(result);
      if (err) console.log(err);
      else res.send(result.body.filename);
    });
});

app.get("/GetAugment", function (req, res) {
  //이미지 처리 서버에 선택한 색상 영역만 가시화한 이미지를 생성 요청
  superagent
    .post("192.168.0.97:8000/augment")
    .query({ images: req.query.image, hmin: req.query.hmin, hmax: req.query.hmax, savedir: path.join(__dirname, "public", "images"), resize: req.query.resize })
    .end((err, result) => {
      console.log(result);
      if (err) console.log(err);
      else res.send(result.body.filename);
    });
});

app.post("/GetCrop", function (req, res) {
  //이미지 처리 서버에 선택한 색상 영역만 가시화한 이미지를 생성 요청
  superagent
    .get("192.168.0.97:8000/crop")
    .query({ imagejson: req.body.image, resid: req.body.resid })
    .end((err, result) => {
      console.log(result.body.filenames);
      if (err) throw err;
      else res.send(result.body.filenames);
    });
});

app.post("/GetColor", function (req, res) {
  //이미지 처리 서버에 선택한 색상 영역만 가시화한 이미지를 생성 요청
  superagent
    .post("192.168.0.97:8000/color")
    .query({
      savedir: path.join(__dirname, "public", "images"),
      images: req.body.image,
      hmin: req.body.hmin,
      hmax: req.body.hmax,
      resize: req.body.resize,
      txtcolor: req.body.color,
      crop: req.body.crop,
      resid: req.body.id
    })
    .end((err, result) => {
      // console.log(result)
      if (err) throw err;
      else res.send(result.body.filename);
    });
});

app.post("/GetArea", function (req, res) {
  //이미지 처리 서버에 선택한 색상 영역만 가시화한 이미지를 생성 요청
  superagent
    .post("192.168.0.97:8000/area")
    .query({ img_ids: req.body.id, hmin: req.body.hmin, hmax: req.body.hmax })
    .end((err, result) => {
      // console.log(result)
      if (err) throw err;
      else res.send(result.body.area);
    });
});

app.get("/exportImage", function (req, res) {
  var file = null;
  try { file = JSON.parse(req.query.file);
  } catch { file = req.query.file; }
  var zip = new AdmZip();

  $.each(file, (i, v) => {
    zip.addLocalFile(v);
    if (i == file.length - 1) {
      zip.writeZip(path.join(__dirname, "../downFile/temp.zip"));
      res.download(path.join(__dirname, "../downFile/temp.zip"));
    }
  });
});

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

function DeleteFile() {
  //이미지 처리 서버에서 생성한 이미지를 1일 간격으로 삭제
  fs.readdir(path.join(__dirname, "public", "images"), function (err, filelist) {
    if (err) throw err;
    curTime = moment();
    $.each(filelist, function (i, data) {
      console.log(data);
      fileTime = moment(data.split("_")[0], "YYYYMMDDHHmmSS");
      if (curTime.diff(fileTime, "days") > 0) {
        fs.unlink(path.join(__dirname, "public", "images", data), function (err) {
          if (err) {
            console.log(err);
          }
        });
      }
    });
  });
  setTimeout(DeleteFile, 3600000);
}
DeleteFile();
module.exports = app;
