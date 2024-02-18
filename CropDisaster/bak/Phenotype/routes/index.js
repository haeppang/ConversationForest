var express = require('express');
var router = express.Router();
var path = require('path');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.sendFile(path.join(__dirname, '../views/index.html'));
});

router.get('/search', function(req, res, next) {
  res.sendFile(path.join(__dirname, '../views/search.html'));
});

router.get('/formComponent', function(req, res, next) {
  res.sendFile(path.join(__dirname, '../views/form-elements-component.html'));
});

router.get('/tempIndex', function(req, res, next) {
  res.sendFile(path.join(__dirname, '../views/tempIndex.html'));
});

router.get('/imageView', function(req, res, next) {
  res.sendFile(path.join(__dirname, '../views/imageview.html'));
});

router.get('/singleView', function(req, res, next) {
  res.sendFile(path.join(__dirname, '../views/singleview.html'));
});

module.exports = router;
