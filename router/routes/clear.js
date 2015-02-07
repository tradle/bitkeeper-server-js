'use strict';

var express = require('express');
var router = express.Router();

router.post('/', function (req, res) {
  req.app.get('keeper')
    .clear()
    .then(function () {
      res.status(200).end();
    })
    .catch(function(err) {
      throw err;
    })
});

module.exports = router;