/** 
Omneedia Cluster
v 1.0.0 (reboot)
**/

var cluster = require('cluster');
var os = require('os');
var fs = require('fs');


var networkInterfaces = require('os').networkInterfaces();

var IP = [];
for (var e in networkInterfaces) IP.push(networkInterfaces[e][0].address);

function ERROR(message) {

    console.log(' ');
    console.log(' GURU-MEDITATION:' + message);
    console.log(' ');
    process.exit();

}

var CONFIG = __dirname + '/../config/';
CLUSTER_DEFAULT = {
    "port": "9191",
    "port.session": "24333",
    "port.db": "3334",
    "threads": "*",
    "label": "cluster.yourdomain.com",
    "url": "https://cluster.yourdomain.com"
};

require('./lib/utils/dates.js')();
require('./lib/utils/db')();
require('./lib/utils/fs')();
require('./lib/utils/crypto')();
var NET = require('./lib/utils/net');

var startMaster = require("./lib/Master");
var startThreads = require('./lib/Threads');

function loadConfig(type, _default, cb) {
    fs.readFile(CONFIG + type + '.json', function(e, b) {
        if (e) {
            fs.writeFile(CONFIG + type + '.json', JSON.stringify(_default, null, 4));
            return cb(_default);
        };
        try {
            cb(JSON.parse(b.toString('utf-8')));
        } catch (e) {
            ERROR('[INIT] ' + type + ' configuration error');
        }
    });
};

var line = "server_names_hash_bucket_size  512;\nserver_names_hash_max_size 512;\nclient_max_body_size 2000M;";
fs.writeFile(__dirname + '/../config/engines/nginx/conf.d/omneedia.conf', line, function() {
    loadConfig('trustedhosts', [], function(TRUSTED_HOSTS) {
        loadConfig('cluster', CLUSTER_DEFAULT, function(Config) {
            if (cluster.isMaster) startMaster(TRUSTED_HOSTS, NET, cluster, Config);
            else startThreads(TRUSTED_HOSTS, NET, cluster, Config);
        });
    })
});