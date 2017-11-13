module.exports = function(Config, cb) {

    var path = require('path');
    var fs = require('fs');

    function makedirs(dirs, i, cb) {
        if (!dirs[i]) return cb();
        fs.mkdir(dirs[i], function() {
            makedirs(dirs, i + 1, cb);
        });
    };
    var DIRS = [
        __dirname + path.sep + '..' + path.sep + '..' + path.sep + 'logs',
        __dirname + path.sep + '..' + path.sep + '..' + path.sep + 'logs' + path.sep + 'engines',
        __dirname + path.sep + '..' + path.sep + '..' + path.sep + 'logs' + path.sep + 'engines' + path.sep + 'mysql',
        __dirname + path.sep + '..' + path.sep + '..' + path.sep + 'logs' + path.sep + 'engines' + path.sep + 'mongodb',
        __dirname + path.sep + '..' + path.sep + '..' + path.sep + 'logs' + path.sep + 'engines' + path.sep + 'nginx',
        __dirname + path.sep + '..' + path.sep + '..' + path.sep + 'var' + path.sep + "data",
        __dirname + path.sep + '..' + path.sep + '..' + path.sep + 'config' + path.sep + "engines" + path.sep + "nginx",
        __dirname + path.sep + '..' + path.sep + '..' + path.sep + 'config' + path.sep + "engines" + path.sep + "nginx" + path.sep + "conf.d",
        __dirname + path.sep + '..' + path.sep + '..' + path.sep + 'config' + path.sep + "engines" + path.sep + "nginx" + path.sep + "sites",
        __dirname + path.sep + '..' + path.sep + '..' + path.sep + 'config' + path.sep + "engines" + path.sep + "nginx" + path.sep + "sandbox",
        __dirname + path.sep + '..' + path.sep + '..' + path.sep + 'config' + path.sep + "engines" + path.sep + "nginx" + path.sep + "production"
    ];

    fs.readFile(__dirname + path.sep + 'nginx.tpl', function(e, b) {
        makedirs(DIRS, 0, function() {

            console.log('   - Starting MySQL process...');

            var exec = require('child_process').execFile;

            var dmysql = exec(__dirname + path.sep + '..' + path.sep + 'mysql' + path.sep + 'bin' + path.sep + 'mysqld', [
                "--defaults-file=" + __dirname + path.sep + '..' + path.sep + '..' + path.sep + 'config' + path.sep + "engines" + path.sep + "mysql" + path.sep + "my.cnf",
                "-b", __dirname + path.sep + ".." + path.sep + "mysql",
                "--datadir=" + __dirname + path.sep + ".." + path.sep + ".." + path.sep + "var" + path.sep + "db" + path.sep,
                "--user=root",
                "--port=" + Config["port.db"],
                "--daemonize"
            ]);

            console.log('   done.');

            console.log('   - Starting MongoD process.');

            var dmongo = exec(__dirname + path.sep + '..' + path.sep + 'mongodb' + path.sep + 'bin' + path.sep + 'mongod', [
                "--port", Config['port.session'],
                "--verbose",
                "--logpath", __dirname + path.sep + '..' + path.sep + '..' + path.sep + 'logs' + path.sep + "engines" + path.sep + "mongodb" + path.sep + "mongod.log",
                "--dbpath", __dirname + path.sep + '..' + path.sep + '..' + path.sep + 'var' + path.sep + "data"
            ]);

            console.log('   done.');

            console.log('   - Starting NginX process.');

            fs.writeFile(__dirname + path.sep + '..' + path.sep + '..' + path.sep + 'config' + path.sep + "engines" + path.sep + "nginx" + path.sep + "nginx.conf", b.toString('utf-8'), function() {
                var dnginx = exec(__dirname + path.sep + '..' + path.sep + 'nginx' + path.sep + 'nginx', [
                    "-c", __dirname + path.sep + '..' + path.sep + '..' + path.sep + 'config' + path.sep + "engines" + path.sep + "nginx" + path.sep + "nginx.conf",
                    "-p", __dirname + path.sep + '..' + path.sep + '..' + path.sep
                ]);

                console.log('   done.');

                cb();
            })

        });

    });




}