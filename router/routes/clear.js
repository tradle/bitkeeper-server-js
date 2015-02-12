'use strict';

var express = require('express');
var router = express.Router();

router.post('/', function (req, res) {
  req.app.get('keeper')
    .clear()
    .done(function () {
      res.status(200).end();
    });
});

module.exports = router;
