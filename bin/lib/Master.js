module.exports = function(TRUSTED_HOSTS, NET, cluster, Config) {
    var fs = require('fs');
    var numCPUs = require('os').cpus().length;
    var net = require('net');

    if (Config.threads != "*") {
        numCPUs = Config.threads * 1;
    };

    function init() {
        console.log('');
        console.log('Omneedia Cluster started at ' + NET.getIPAddress() + ":" + Config.port + " (" + numCPUs + " threads)");

        console.log(' ');
        require('./secure')(Config, TRUSTED_HOSTS, function() {
            console.log('- Starting engines');
            require('./engines')(Config, function() {
                process.on('exit', function() {
                    var shelljs = require('shelljs');
                    shelljs.exec('fuser -k ' + Config["port.session"] + '/tcp', { silent: true });
                    shelljs.exec('fuser -k ' + Config["port.db"] + '/tcp', { silent: true });
                    shelljs.exec(__dirname + '/../nginx/nginx -s quit', { silent: true });
                    console.log(' ');
                    console.log('* All engines stopped.');
                    console.log('* Cluster stopped.');
                    console.log(' ');
                });
                process.on('SIGINT', process.exit); // catch ctrl-c
                process.on('SIGTERM', process.exit); // catch kill             
                var workers = [];

                var worker_index = function(ip, len) {
                    var s = '';
                    for (var i = 0, _len = ip.length; i < _len; i++) {
                        if (ip[i] !== '.') {
                            s += ip[i];
                        }
                    };
                    if (s.indexOf(':') > -1) s = s.substr(s.lastIndexOf(':') + 1, 255);
                    return Number(s) % len;
                };

                // Helper function for spawning worker at index 'i'.
                var spawn = function(i) {
                    workers[i] = cluster.fork();
                    workers[i].on('exit', function(worker, code, signal) {
                        console.log('! respawning worker', i);
                        spawn(i);
                    });
                };

                // Spawn workers.
                for (var i = 0; i < numCPUs; i++) {
                    spawn(i);
                };

                var server = net.createServer({ pauseOnConnect: true }, function(connection) {
                    var worker = workers[worker_index(connection.remoteAddress, numCPUs)];
                    worker.send('sticky-session:connection', connection);
                }).listen(Config.port);

                console.log('- Cluster online.');

            });

        });

    };

    fs.stat(__dirname + "/cluster.lock", function(e, s) {
        if (s) fs.unlink(__dirname + "/cluster.lock", init);
        else init();
    });

};