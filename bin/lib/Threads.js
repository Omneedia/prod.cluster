module.exports = function(TRUSTED_HOSTS, NET, cluster, Config) {

    var express = require('express');
    var app = express();
    var server = app.listen(0, Config['cluster.ip']);

    var io = require('socket.io')(server);

    var date = new Date();
    console.log("   * thread started @ " + date + " #" + process.pid);

    // IO Adapter
    var mongo = require('socket.io-adapter-mongo');
    io.adapter(mongo('mongodb://' + Config['cluster.ip'] + ':' + Config["session.port"] + '/io'));
    var IO = require('./io');
    io.on('connection', IO);

    app.get('/', function(req, res) {
        res.writeHead(200, { 'Content-Type': 'application/json', 'charset': 'utf-8' });
        var fs = require('fs');
        fs.readFile(__dirname + '/../package.json', function(e, r) {
            r = JSON.parse(r.toString('utf-8'));
            res.end(JSON.stringify({
                omneedia: {
                    cluster: {
                        version: r.version
                    }
                }
            }, null, 4));
        });
        return;
    });

    app.get('/stats', function(req, res) {
        res.writeHead(200, { 'Content-Type': 'text/html', 'charset': 'utf-8' });
        var fs = require('fs');
        fs.readFile(__dirname + '/tpl/stats.tpl', function(e, r) {
            res.end(r.toString('utf-8'));
        });
    });

    app.get('/stats/(*)', function(req, res) {
        res.writeHead(200, { 'Content-Type': 'application/json', 'charset': 'utf-8' });
        var request = require('request');
        request('http://127.0.0.1:61208/api/2/all', function(e, r, b) {
            var b = b.toString('utf-8');
            if (req.params[0] == "json") b = JSON.stringify(JSON.parse(b), null, 4);
            return res.end(b);
        });
    });

    process.on('message', function(message, connection) {
        if (message !== 'sticky-session:connection') {
            return;
        }

        // Emulate a connection event on the server by emitting the
        // event with the connection the master sent us.
        server.emit('connection', connection);

        connection.resume();
    });
};