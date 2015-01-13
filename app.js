
'use strict';

var Keeper = require('bitkeeper-js');
var server = require('./');
var minimist = require('minimist');
var fs = require('fs');
var path = require('path');
var debug = require('debug')('bitkeeper-server');
var argv = minimist(process.argv);

var configPath;
if (argv.keeper)
  configPath = path.join(__dirname, argv.keeper);
else
  configPath = path.join(__dirname + 'node_modules/bitkeeper-js/conf/config.json');

var config = fs.readFileSync(configPath, { encoding: 'utf8' });
config = JSON.parse(config);

if (argv.dht === 'false') {
  // don't connect to the bittorrent-dht
  config.dht = new (require('bittorrent-dht/client'))({ bootstrap: false });
}

var port = argv.port || require('./conf/config.json').port;

var keeper = new Keeper(config);
keeper.on('ready', function() {
  debug('Bitkeeper is ready, starting server...');
  start();
});

function start() {
  server.create(keeper, port, function() {
    debug('Bitkeeper server running on port ' + port);
  });
}

