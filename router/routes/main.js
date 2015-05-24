var express = require('express')
var router = express.Router()
var concat = require('concat-stream')

router.put('/:key', function (req, res) {
  var key = req.params.key
  var keeper = req.app.get('keeper')

  req.pipe(concat(function (val) {
    keeper.put(key, val).done(function (resp) {
      res.status(200).json(resp)
    })
  }))
})

router.get('/:keys', function (req, res) {
  var keys = req.params.keys.split(',')

  req.app.get('keeper')
    .get(keys)
    .done(function (results) {
      // results = results.map(function(r) { return r.value })

      var value = keys.length === 1 ? results[0] : results
      if (typeof value === 'undefined') {
        res.status(404).end()
      } else {
        res.status(200).send(value)
      }
    })
})

module.exports = router
