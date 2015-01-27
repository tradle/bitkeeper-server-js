'use strict';

var Keeper = require('bitkeeper-js');
var server = require('./');
var minimist = require('minimist');
var fs = require('fs');
var path = require('path');
var argv = minimist(process.argv);

var configPath;
if (argv.keeper)
  configPath = path.join(__dirname, argv.keeper)
else
  configPath = path.join(__dirname, 'node_modules/bitkeeper-js/conf/config.json');

var config = fs.readFileSync(configPath, {
  encoding: 'utf8'
});
config = JSON.parse(config);

if (argv.dht === 'false') {
  // don't connect to the bittorrent-dht
  // hack for testing
  var DHT = require('bittorrent-dht/client');
  var dhtConf = {};
  if (config.bootstrap) dhtConf.bootstrap = config.bootstrap;
  if (config.nodeId) dhtConf.nodeId = config.nodeId;

  config.dht = new DHT(dhtConf);
}

var port = argv.port || require('./conf/config.json').port;

var keeper = new Keeper(config);
keeper.seedStored();
keeper.on('ready', function () {
  console.log('Bitkeeper is ready, starting server...');
  server.create(keeper, port);
});