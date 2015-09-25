'use strict'

if (process.env.UTP) {
  require('multiplex-utp')
}

var crypto = require('crypto')
var path = require('path')
var externalIP = require('external-ip')()
var minimist = require('minimist')
var Keeper = require('bitkeeper-js')
var server = require('./')
var conf = require('./conf/config.json')
var keeperConf = conf.keeper
var argv = minimist(process.argv.slice(2))
var DHT = Keeper.DHT

getNodeId(init)

function getNodeId (cb) {
  if (keeperConf.nodeId) cb(keeperConf.nodeId)
  else {
    externalIP(function (err, ip) {
      if (err) cb()
      else cb(crypto.createHash('sha256').update(ip).digest().slice(0, 20))
    })
  }
}

function init (nodeId) {
  var dhtConf = {
    bootstrap: keeperConf.bootstrap || false
  }

  if (nodeId) dhtConf.nodeId = nodeId

  keeperConf.dht = new DHT(dhtConf)
  keeperConf.dht.listen(keeperConf.dhtPort)
  keeperConf.storage = path.resolve(keeperConf.storage)
  console.log('STORAGE: ' + keeperConf.storage)

  var port = argv.port || conf.port
  var keeper = new Keeper(keeperConf)
  keeper.on('ready', function () {
    keeper.seedStored()
    server.create(keeper, port)
  })
}
