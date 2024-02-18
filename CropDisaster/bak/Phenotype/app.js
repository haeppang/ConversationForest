var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var indexRouter = require('./routes/index')
const { application } = require('express');
var fs = require("fs")
var app = express();
var mysql = require('mysql')
var url = require("url");
var AdmZip = require("adm-zip");
var sharp = require("sharp");
var exec = require('child_process').exec,
    child;

const { JSDOM } = require("jsdom");
const res = require('express/lib/response');
const { window } = new JSDOM("");
const $ = require("jquery")(window);
const superagent = require('superagent');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'node_modules/chart.js')));
app.use('/', indexRouter)
app.use('/users', express.static('/mnt/hdd2/web'));
app.use('/oldUsers', express.static('/mnt/hdd1'));

// 클라이언트가 입력한 데이터 받아와 DB에 입력
app.post('/Upload_Data', function(req, res) {
    // mySQL Connection
    var connection = mysql.createConnection({
        host: "phenome.iptime.org",
        port: "23306",
        user: "choi",
        password: "1518",
        database: "Phenotype"
    })
    var species = req.body.species;
    var res_purpose = req.body.res_purpose;
    var res_type = req.body.res_type;
    var admin = req.body.admin;
    var res_stdate = req.body.res_stdate;
    var res_eddate = req.body.res_eddate;
    var res_name = req.body.res_name;
    var type = req.body.type;
    var nodes = JSON.parse(req.body.node);

    console.log(nodes);
    superagent.post('192.168.0.97:8080/move')
        .query({ species:req.body.species,
            res_purpose:req.body.res_purpose,
            res_type:req.body.res_type,
            res_admin:req.body.admin,
            res_stdate:req.body.res_stdate,
            res_eddate:req.body.res_eddate,
            res_name:req.body.res_name,
            type:req.body.type,
            'nodes':req.body.node
         })
        .end((err, res) => {
        if (err) console.log(err);
        // console.log(res.body.url);
        // console.log(res.body.explanation);
    });

    // var sql = "INSERT INTO Research (`species`, `res_purpose`, `res_type`,`res_admin`, `res_stdate`, `res_eddate`, `res_name`, `type`) VALUES (" +
    //     (species == undefined ? null : ("'" + species + "'")) + ", " +
    //     (res_purpose == undefined ? null : ("'" + res_purpose + "'")) + ", " +
    //     (res_type == "0" ? null : ("'" + res_type + "'")) + ", " +
    //     (admin == undefined ? null : ("'" + admin + "'")) + ", " +
    //     (res_stdate == (undefined || '') ? null : ("'" + res_stdate + "'")) + ", " +
    //     (res_eddate == (undefined || '') ? null : ("'" + res_eddate + "'")) + ", " +
    //     (res_name == undefined ? null : ("'" + res_name + "'")) + ", " +
    //     (type == undefined ? null : ("'" + type + "'")) + ")";

    // connection.query(sql, function(err, result) {
    //     if (err) throw err;

    //     console.log(nodes[0] + " " + nodes[0].split(".")[1]);

    //     var base_folder = '/mnt/hdd1/temp';
    //     var targetfolder = '/mnt/hdd2/web/' + result.insertId;
    //     fs.mkdirSync(targetfolder);
    //     var cnt = 0;

    //     var name;
    //     var tempName;
    //     var imagePath;
    //     var label;
    //     var angle;
    //     var tempTime;
    //     var time;

    //     $.each(nodes, function(i, v) {
    //         exec("mv " + path.join(base_folder, v) + " " + targetfolder, function(mverr, stdout, stderr) {
    //             if (mverr) throw mverr;
    //         });
    //         console.log(nodes);
    //         if (v.split(".")[1] == undefined) { // 폴더 선택시
    //             fs.readdir(path.join(targetfolder, v), function(err, filelist) {
    //                 $.each(filelist, function(j, v2) {
    //                     name = v2;
    //                     tempName = name.split("_");
    //                     imagePath = targetfolder + v + "/" + name;
    //                     label = tempName[2] + "_" + tempName[3] + "_" + tempName[4];
    //                     angle = tempName[5] + "_" + tempName[6];
    //                     tempTime = tempName[7].split(".");
    //                     time = tempTime[0];

    //                     var sql2 = "INSERT INTO Image (`Research_ID`, `Image_Name`, `Image_Path` ,`Label_Name`, `Angle`, `Time`) VALUES (" +
    //                         result.insertId + ", '" + name + "', '" + imagePath + "', '" + label + "', '" + angle + "', '" + time + "')";
    //                     console.log(sql2);
            
    //                     connection.query(sql2, function(err2, result2) {
    //                         if (err2) throw err2;
    //                         console.log(result2.insertId);
            
    //                         var csvname = v["Image_Name"].split(".")[0] + ".csv";
    //                         var csvpath = v["Image_Path"].split(".")[0] + ".csv"
            
    //                         // var temppath = "/mnt/hdd1/temp/210615/RDA_RICE_A_05_14_VIS_SV090_2021-06-15.csv";
                            
    //                         fs.exists(csvpath, function(exists) {
    //                             if (exists) {
    //                                 var csv = fs.readFileSync(csvpath);
    //                                 var csvdata = csv.toString();
    //                                 var area = csvdata.split(",")[4];
    //                                 var convex = csvdata.split(",")[7];
    //                                 var centerX = csvdata.split(",")[5];
    //                                 var centerY = csvdata.split(",")[6];
            
    //                                 var sql3 = "INSERT INTO Phenotype_Data (Image_ID, area, convex_area, center_x, center_y) VALUES (" +
    //                                     result2.insertId + ", " + area + ", " + convex + ", " + centerX + ", " + centerY + ")";
            
    //                                 connection.query(sql3, function(err3, result3) {
    //                                     if (err3) throw err3;      
    //                                     if (cnt == nodes.length) {
    //                                         connection.end();
    //                                         res.send("success");
    //                                     }
    //                                 });
    //                             }
    //                             else {
    //                                 if (cnt == nodes.length) {
    //                                     connection.end();
    //                                     res.send("success");
    //                                 }
    //                             }
    //                         })
    //                     })
    //                 })
                    
    //                 // console.log(name + "\n" + imagePath + "\n" + label + "\n" + angle + "\n" + time);

                    
    //             })
    //         } else { // 파일 선택시
    //             var temp = v.split("/");
    //             name = temp[temp.length - 1];
    //             tempName = name.split("_");
    //             imagePath = targetfolder + v;
    //             label = tempName[2] + "_" + tempName[3] + "_" + tempName[4];
    //             angle = tempName[5] + "_" + tempName[6];
    //             tempTime = tempName[7].split(".");
    //             time = tempTime[0];

    //             // console.log(name + "\n" + imagePath + "\n" + label + "\n" + angle + "\n" + time);

    //             var sql2 = "INSERT INTO Image (`Research_ID`, `Image_Name`, `Image_Path` ,`Label_Name`, `Angle`, `Time`) VALUES (" +
    //                 result.insertId + ", '" + name + "', '" + imagePath + "', '" + label + "', '" + angle + "', '" + time + "')";
    //             console.log(sql2);

    //             connection.query(sql2, function(err2, result2) {
    //                 if (err2) throw err2;
    //                 console.log(result2.insertId);
    //                 cnt++;

    //                 var csvname = v["Image_Name"].split(".")[0] + ".csv";
    //                 var csvpath = v["Image_Path"].split(".")[0] + ".csv"

    //                 // var temppath = "/mnt/hdd1/temp/210615/RDA_RICE_A_05_14_VIS_SV090_2021-06-15.csv";
                    
    //                 fs.exists(csvpath, function(exists) {
    //                     if (exists) {
    //                         var csv = fs.readFileSync(csvpath);
    //                         var csvdata = csv.toString();
    //                         var area = csvdata.split(",")[4];
    //                         var convex = csvdata.split(",")[7];
    //                         var centerX = csvdata.split(",")[5];
    //                         var centerY = csvdata.split(",")[6];

    //                         var sql3 = "INSERT INTO Phenotype_Data (Image_ID, area, convex_area, center_x, center_y) VALUES (" +
    //                             result2.insertId + ", " + area + ", " + convex + ", " + centerX + ", " + centerY + ")";

    //                         connection.query(sql3, function(err3, result3) {
    //                             if (err3) throw err3;      
    //                             if (cnt == nodes.length) {
    //                                 connection.end();
    //                                 res.send("success");
    //                             }
    //                         });
    //                     }
    //                     else {
    //                         if (cnt == nodes.length) {
    //                             connection.end();
    //                         }
    //                     }
    //                 })
    //             })
    //         }

    //     })

    // });
});


// Upload file list
app.get("/searchFile", function(req, res) {
    var base_folder = '/mnt/hdd1/temp';
    var folder = req.query.folder;

    fs.readdir(path.join(base_folder, folder), function(err, filelist) {
        if (err) {
            throw err;
        }

        var fsData = [];
        $.each(filelist, function(i, data) {
            
            if (fs.lstatSync(path.join(base_folder, folder, data)).isDirectory()) {
                fsData.unshift({
                    text: data,
                    href: path.join(folder, data),
                    nodes: []
                })
            } else {
                if (path.extname(data) == '.png') {
                    fsData.push({
                        text: data,
                        href: path.join(folder, data)
                    })
                }
                
            }
        })

        res.send(fsData);
    })
})


//table set
app.get('/onloadTable', (req, res) => {
    // mySQL Connection
    var connection = mysql.createConnection({
        host: "phenome.iptime.org",
        port: "23306",
        user: "choi",
        password: "1518",
        database: "Phenotype"
    })

    var res_type = req.query.res_type;
    var admin = req.query.admin;
    var res_stdate = req.query.res_stdate;
    var res_eddate = req.query.res_eddate;
    var sql = "SELECT * FROM Research"

    if (res_type != (undefined || "0") || admin != (undefined || "") ||
        res_stdate != (undefined || "") || res_eddate != (undefined || "")) {
        sql += " WHERE " +
            (admin == (undefined || "") ? "" : ("res_admin = '" + admin + "'")) +
            (res_type == (undefined || "0") ? "" : (admin != (undefined || "") ? (" AND res_type = '" + res_type + "'") : (" res_type = '" + res_type + "'")));


        if (res_stdate == (undefined || "")) "";
        else {
            if (admin != (undefined || "") || res_type != (undefined || "0")) sql += " AND ";
            sql += "res_stdate >= '" + res_stdate + "'";
        }

        if (res_eddate == (undefined || "")) "";
        else {
            if (admin != (undefined || "") || res_type != (undefined || "0") || res_stdate == (undefined || "")) sql += " AND ";;
            sql += "res_eddate <= '" + res_eddate + "'";
        }
    }

    connection.query(sql, function(err, data) {
        if (err) throw err;
        connection.end();
        res.send(data);
    });

});


// app.post('/onloadChart', function(req, res) {
//     // mySQL Connection
//     var connection = mysql.createConnection({
//         host: "phenome.iptime.org",
//         port: "23306",
//         user: "choi",
//         password: "1518",
//         database: "Phenotype"
//     });
//     // 수치데이터 

//     var id = req.body.res_id;

//     var sql1 = "SELECT Image_ID, Image_Path, Label_Name, Angle FROM Image WHERE Research_ID = " + id;

//     connection.query(sql1, function(err, result) {
//         if (err) throw err;
//         var Imageid = [];
//         var temp = [];
//         $.each(result, function(i, v) {
//             Imageid.push(v.Image_ID);
//             temp.push({
//                 ImageID: v["Image_ID"],
//                 Image_Path: v["Image_Path"],
//                 Label_Name: v["Label_Name"],
//                 Angle: v["Angle"],
//             })
//             if (result.length == Imageid.length) {
//                 var sql2 = "SELECT * FROM Phenotype_Data WHERE Image_ID in (" + Imageid.join(", ") + ");";
//                 connection.query(sql2, function(err2, result2) {
//                     if (err2) throw err2;
//                     var datas = [];
//                     console.log(result2);
//                     $.each(result2, function(j, v2) {

//                         var ind = temp.findIndex((v) => { return v.ImageID == v2.Image_ID });
//                         datas.push({
//                             ImageID: temp[ind]["ImageID"],
//                             Image_Path: temp[ind]["Image_Path"],
//                             Label_Name: temp[ind]["Label_Name"],
//                             Angle: temp[ind]["Angle"],
//                             long_axis: v2["long_axis"],
//                             short_axis: v2["short_axis"],
//                             area: v2["area"],
//                             convex_area: v2["convex_area"],
//                             center_x: v2["center_x"],
//                             center_y: v2["center_y"],
//                             time: v2["time"],
//                         })

//                         if (datas.length == result2.length) {
//                             connection.end();
//                             res.send(datas);
//                         }
//                     })
//                 })
//             }
//         })
//     })
// });


app.post('/onloadChart', function(req, res) {
    // mySQL Connection
    var connection = mysql.createConnection({
        host: "phenome.iptime.org",
        port: "23306",
        user: "choi",
        password: "1518",
        database: "Phenotype"
    });
    // 수치데이터 

    var id = req.body.res_id;

    var sql1 = "SELECT Image_ID, Image_Path, Label_Name, Angle, Time FROM Image WHERE Research_ID = " + id;

    connection.query(sql1, function(err, result) {
        if (err) throw err;
        var Imageid = [];
        var temp = [];
        $.each(result, function(i, v) {
            Imageid.push(v.Image_ID);
            temp.push({
                ImageID: v["Image_ID"],
                Image_Path: v["Image_Path"],
                Label_Name: v["Label_Name"],
                Angle: v["Angle"],
                time: v["Time"],
            })
            if (result.length == Imageid.length) {
                var sql2 = "SELECT * FROM Phenotype_Data as pd Right OUTER JOIN Image ON pd.Image_ID = Image.Image_ID where Research_ID = " + id + ";";
                connection.query(sql2, function(err2, result2) {
                    if (err2) throw err2;
                    var datas = [];
                    $.each(result2, function(j, v2) {
                        var ind = temp.findIndex((v) => { return v.ImageID == v2.Image_ID });
                        datas.push({
                            ImageID: temp[ind]["ImageID"],
                            Image_Path: temp[ind]["Image_Path"],
                            Label_Name: temp[ind]["Label_Name"],
                            Angle: temp[ind]["Angle"],
                            time: temp[ind]["time"],
                            long_axis: v2["long_axis"],
                            short_axis: v2["short_axis"],
                            area: v2["area"],
                            convex_area: v2["convex_area"],
                            center_x: v2["center_x"],
                            center_y: v2["center_y"],
                            
                        })

                        if (datas.length == result2.length) {
                            connection.end();
                            res.send(datas);
                        }
                    })
                })

            }
        })
    })
});



app.post('/onloadEnvir', function(req, res) {
    var connection = mysql.createConnection({
        host: "phenome.iptime.org",
        port: "23306",
        user: "choi",
        password: "1518",
        database: "Phenotype"
    });

    var id = req.body.res_id;

    var sql = "SELECT temp, humidity, insolation, time FROM Environmental WHERE res_id = " + id;

    connection.query(sql, function(err, result) {
        if (err) throw err;
        var datas = [];

        $.each(result, function(i, v) {
            datas.push({
                temp : v["temp"],
                hum : v["humidity"],
                insol : v["insolation"],
                time : v["time"]
            })

            if (result.length == datas.length) {
                connection.end();        
                res.send(datas);
            }
        })
    });
});


app.post('/onloadColor', function(req, res) {
    var connection = mysql.createConnection({
        host: "phenome.iptime.org",
        port: "23306",
        user: "choi",
        password: "1518",
        database: "Phenotype"
    });

    var sql = "SELECT imageid, val FROM Color"

    connection.query(sql, function(err, result) {
        if (err) throw err;
        var datas = [];

        $.each (result, function(i, v) {
            datas.push({
                imgid : v["imageid"],
                val : v["val"],
            })
            if (result.length == datas.length) {
                connection.end();
                res.send(datas);
            }
        })
    })
})


app.get('/onloadImage', function(req, res) {
    var wid = JSON.parse(req.query.wid);
    var tmp_path = req.query.imagePath;
    var tmp = tmp_path.split("/")
    var file = tmp[tmp.length-1]

    if (wid == 0) {
        var sendPath = path.join("/", tmp.slice(4, tmp.length - 1).join("/"), file);
        fs.readFile(tmp_path, (err) => {
            if (err) throw err;
            res.send(sendPath);
        })
    }
    else {
        fs.readFile(tmp_path, function(err, data) {
            if (err) throw err;

            var resize_path = tmp_path.split(".")[0] + "_" +  wid + "." + tmp_path.split(".")[tmp_path.split(".").length - 1];
            var resize_file = resize_path.split("/mnt/hdd2/web")[resize_path.split("/mnt/hdd2/web").length - 1];
            fs.exists(resize_path, function(exists) {
                if (exists) res.send(resize_file)
                else {
                    sharp(data)
                    .resize({ width:wid})
                    .withMetadata()
                    .toBuffer((err2, buffer) => {
                        if (err2) throw err2;
                        fs.writeFile(resize_path, buffer, (err3) => {
                            if (err3) throw err3;
                            res.send(resize_file);
                        })
                    })               
                }
            })       
        })
    }
})


app.get('/exportImage', function(req, res) {
    var file = null;
    try { file = JSON.parse(req.query.file);
    } catch { file = req.query.file; }
    var zip = new AdmZip();

    $.each(file, (i, v) => {
        zip.addLocalFile(v);
        if(i == file.length-1){
            zip.writeZip(path.join(__dirname,"../downFile/temp.zip"));
            res.download(path.join(__dirname,"../downFile/temp.zip"))
        }
    })
})


// catch 404 and forward to error handler
app.use(function(req, res, next) {
    next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});



module.exports = app;
