'use strict'

if (process.env.UTP) {
  require('multiplex-utp')
}

var crypto = require('crypto')
var path = require('path')
var externalIP = require('external-ip')()
var minimist = require('minimist')
var Keeper = require('bitkeeper-js')
var Server = require('./')
var conf = require('./conf/config.json')
var keeperConf = conf.keeper
var argv = minimist(process.argv.slice(2))
var DHT = Keeper.DHT
var port = argv.port || conf.port

getNodeId(init)

function getNodeId (cb) {
  if (keeperConf.nodeId) cb(keeperConf.nodeId)
  else {
    externalIP(function (err, ip) {
      if (err) cb()
      else cb(crypto.createHash('sha256').update(ip + ':' + port).digest().slice(0, 20))
    })
  }
}

function init (nodeId) {
  var dhtConf = {
    bootstrap: keeperConf.bootstrap || false
  }

  if (nodeId) dhtConf.nodeId = nodeId

  keeperConf.seedStored = false
  keeperConf.dht = new DHT(dhtConf)
  keeperConf.dht.listen(keeperConf.dhtPort)
  keeperConf.storage = path.resolve(keeperConf.storage)
  console.log('STORAGE: ' + keeperConf.storage)

  var keeper = new Keeper(keeperConf)
  keeper.on('ready', function () {
    keeper.seedStored()
    var server = Server.create({
      keeper: keeper,
      readonly: argv.readonly,
      port: port
    })

    server.once('close', keeper.destroy.bind(keeper))
  })
}
