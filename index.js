'use strict'

var typeforce = require('typeforce')
var express = require('express')
var debug = require('debug')('bitkeeper-server')

var domain = require('domain')
var utils = require('tradle-utils')
// var ports = require('promise-ports')
var router = require('./router')
// var request = require('request')

function createServer (options, callback) {
  typeforce({
    keeper: 'Object',
    port: 'Number',
    readonly: '?Boolean'
  }, options)

  var keeper = options.keeper
  var port = options.port
  var app = express()
  if (options.readonly) {
    app.set('readonly', true)
  }

  // var mapping

  app.set('keeper', keeper)
  app.use(function (req, res, next) {
    var requestDomain = domain.create()
    requestDomain.add(req)
    requestDomain.add(res)
    requestDomain.on('error', function (err) {
      debug('Uncaught error, processing in domain error handler: ' + err.message)
      errorHandler(err, req, res)
    })

    res.on('close', requestDomain.dispose.bind(requestDomain))
    requestDomain.run(next)
  })

  app.use(function (req, res, next) {
    if (req.hostname !== 'localhost' && req.hostname !== '127.0.0.1') {
      throw utils.httpError(400, 'Only local requests permitted')
    }

    next()
  })

  /**
   * Routes
   */
  router(app)

  /**
   * Error Handling
   */
  app.use(errorHandler)

  // client.externalIp(function(err, ip) {
  //   console.log('External ip', ip)
  //   keeper.externalIp(ip)
  // })

  // var ttl = 144000

  process.on('exit', cleanup)
  process.on('SIGINT', cleanup)
  process.on('SIGTERM', cleanup)
  process.on('uncaughtException', function (err) {
    console.log('Uncaught exception, caught in process catch-all: ' + err.message)
    console.log(err.stack)
  })

  // if (require.main === global.module) {
  // run directly, not as sub-app

  // var mappingIntervalId = setInterval(createPortMapping, ttl)
  // var pubPort = port
  var privPort = port
  var serverIsUp
  // var portPromise = createPortMapping()
  // portPromise.done(checkReady)

  var server = app.listen(privPort, function () {
    serverIsUp = true
    checkReady()
  })

  function checkReady () {
    if (serverIsUp
      // && portPromise.inspect().state === 'fulfilled'
      && callback) {
      callback(null, app, server)
    }
  }

  function errorHandler (err, req, res, next) {
    if (res.finished) return

    var code = err.code || 500
    var msg = 'code' in err ? err.message : 'There was an error with your request. Please contact support@tradle.io'

    // log('Error:' + err.message)
    res.status(code).json({
      code: code,
      message: msg
    }, null, 2)
  }

  // function createPortMapping () {
  //   return ports.mapPort({
  //       public: pubPort,
  //       private: privPort,
  //       hijack: true
  //     })
  //     .then(function () {
  //       mapping = {
  //         public: pubPort,
  //         private: privPort
  //       }
  //     })
  //     .catch(function (err) {
  //       console.error('Failed to create port mapping, but continuing', err)
  //       clearInterval(mappingIntervalId)
  //     // process.exit()
  //     })
  // }

  function cleanup () {
    if (!server) return

    debug('CLEANUP')
    if (server) {
      try {
        server.close()
      } catch (err) {}
      server = null
    }

    // if (mapping) {
    //   clearInterval(mappingIntervalId)
    //   ports.unmapPort(mapping['public'])
    //   mapping = null
    // }

    setTimeout(process.exit.bind(process), 1000)
  }

  return app
}

module.exports = {
  create: createServer
}
