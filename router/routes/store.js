var debug = require('debug')('bitkeeper-server:store')
var express = require('express')
var router = express.Router()
var concat = require('concat-stream')
var utils = require('@tradle/utils')

module.exports = router

router.put('/:key', function (req, res) {
  var isReadOnly = req.app.get('readonly')
  if (isReadOnly) {
    throw utils.httpError(403, 'This keeper is read-only')
  }

  var key = req.params.key
  var keeper = req.app.get('keeper')

  req.pipe(concat(function (val) {
    keeper.put(key, val)
      .then(function (resp) {
        res.status(200).json(resp)
      })
      .catch(function (err) {
        debug('failed to put to keeper', err.message, err.stack)
        res.status(501).send('Something went wrong')
      })
  }))
})

router.get('/:keys', function (req, res) {
  var keys = req.params.keys.split(',')

  req.app.get('keeper')
    .get(keys)
    .then(function (results) {
      // results = results.map(function(r) { return r.value })

      var value = keys.length === 1 ? results[0] : results
      if (typeof value === 'undefined') {
        res.status(404).send('Keys not found: ' + keys.join(', '))
      } else {
        res.status(200).send(value)
      }
    })
    .catch(function (err) {
      debug('value not found', err)
      res.status(404).send('Not found')
    })
})

router.delete('/:key', function (req, res) {
  res.status(404) // not supported for now

// var key = req.params.key
// var keeper = req.app.get('keeper')
// keeper.delete(key)
})

