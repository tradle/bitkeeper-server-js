'use strict'

var Keeper = require('bitkeeper-js')
var server = require('./')
var conf = require('./conf/config.json')
var keeperConf = conf.keeper
var minimist = require('minimist')
var genNodeId = require('bittorrent-nodeid')
var externalIP = require('external-ip')()
var path = require('path')
var argv = minimist(process.argv.slice(2))

var DHT = Keeper.DHT

getNodeId(init)

function getNodeId(cb) {
	if (keeperConf.nodeId) cb(keeperConf.nodeId)
	else {
		externalIP(function(err, ip) {
			cb(ip && genNodeId(ip, 1))
		})
	}
}

function init(nodeId) {
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
	keeper.seedStored()
	keeper.on('ready', function () {
	  console.log('Bitkeeper is ready, starting server...')
	  server.create(keeper, port)
	})
}
