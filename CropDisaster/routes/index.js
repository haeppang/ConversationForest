var express = require("express")
var router = express.Router()
var path = require("path")

/* GET home page. */
router.get("/", function (req, res, next) {
  res.sendFile(path.join(__dirname, "../views/index.html"))
})

router.get("/input", function (req, res, next) {
  res.sendFile(path.join(__dirname, "../views/input.html"))
})

router.get("/search", function (req, res, next) {
  res.sendFile(path.join(__dirname, "../views/search.html"))
})

router.get("/imageview", function (req, res, next) {
  res.sendFile(path.join(__dirname, "../views/imageview.html"))
})



router.get("/index2", function (req, res, next) {
  res.sendFile(path.join(__dirname, "../views/index2.html"))
})

router.get("/bak", function (req, res, next) {
  res.sendFile(path.join(__dirname, "../views/index_bak.html"))
})
router.get("/test", function (req, res, next) {
  res.sendFile(path.join(__dirname, "../views/test.html"))
})

module.exports = router
