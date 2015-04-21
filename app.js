'use strict';

var Keeper = require('bitkeeper-js');
var server = require('./');
var conf = require('./conf/config.json')
var keeperConf = conf.keeper;
var minimist = require('minimist');
var path = require('path');
var argv = minimist(process.argv.slice(2));

var DHT = Keeper.DHT;
var dhtConf = {
  bootstrap: keeperConf.bootstrap || false
};

if (keeperConf.nodeId) dhtConf.nodeId = keeperConf.nodeId;

keeperConf.dht = new DHT(dhtConf);
keeperConf.dht.listen(keeperConf.dhtPort);
keeperConf.storage = path.resolve(keeperConf.storage);
console.log('STORAGE: ' + keeperConf.storage);

var port = argv.port || conf.port;
var keeper = new Keeper(keeperConf);
keeper.seedStored();
keeper.on('ready', function() {
  keeper.mapPorts()
    .catch(function(err) {
      console.log('Failed to map dht+torrent ports, continuing...');
    })
    .finally(function() {
      console.log('Bitkeeper is ready, starting server...');
      server.create(keeper, port);
    });
});
