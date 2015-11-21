'use strict'

var path = require('path')
var minimist = require('minimist')
var Keeper = require('@tradle/offline-keeper')
var Server = require('./')
var conf = require('./conf/config.json')
var keeperConf = conf.keeper
var argv = minimist(process.argv.slice(2))
var port = argv.port || conf.port

keeperConf.storage = path.resolve(keeperConf.storage)
console.log('STORAGE: ' + keeperConf.storage)

var keeper = new Keeper(keeperConf)
argv.keeper = keeper
argv.port = port
var server = Server.create(argv)

  // whichever happens first
server.once('close', keeper.close.bind(keeper))
