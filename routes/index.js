var express = require('express');
var router = express.Router();
var path = require('path');


/* GET home page. */
router.get('/', function(req, res, next) {
  res.sendFile(path.join(__dirname, '../views/index.html'));
});

router.get('/index2', function(req, res, next) {
  res.sendFile(path.join(__dirname, '../views/index2.html'));
});

router.get('/bak', function(req, res, next) {
  res.sendFile(path.join(__dirname, '../views/index_bak.html'));
});

router.get('/login', function(req, res, next) {
  res.sendFile(path.join(__dirname, '../views/login.html'));
});

router.get('/register', function(req, res, next) {
  res.sendFile(path.join(__dirname, '../views/register.html'));
});

module.exports = router;
