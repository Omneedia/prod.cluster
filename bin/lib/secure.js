module.exports = function(Config, TRUSTED_HOSTS, cb) {

    var shelljs = require('shelljs');

    // Configure iptables
    console.log('- Securing network');
    shelljs.exec('iptables -P INPUT ACCEPT', { silent: false });
    shelljs.exec('iptables -P OUTPUT ACCEPT', { silent: false });
    shelljs.exec('iptables -P FORWARD ACCEPT', { silent: false });
    shelljs.exec('iptables -F INPUT', { silent: false });
    shelljs.exec('iptables -F OUTPUT', { silent: false });
    shelljs.exec('iptables -F FORWARD', { silent: false });

    for (var i = 0; i < TRUSTED_HOSTS.length; i++) {
        shelljs.exec('iptables -A INPUT -s ' + TRUSTED_HOSTS[i] + ' -p tcp --destination-port ' + Config["db.port"] + ' -m state --state NEW,ESTABLISHED -j ACCEPT', { silent: false });
        shelljs.exec('iptables -A OUTPUT -d ' + TRUSTED_HOSTS[i] + ' -p tcp --source-port ' + Config["db.port"] + ' -m state --state ESTABLISHED -j ACCEPT', { silent: false });
        shelljs.exec('iptables -A INPUT -s ' + TRUSTED_HOSTS[i] + ' -p tcp --destination-port ' + Config['session.port'] + ' -m state --state NEW,ESTABLISHED -j ACCEPT', { silent: false });
        shelljs.exec('iptables -A OUTPUT -d ' + TRUSTED_HOSTS[i] + ' -p tcp --source-port ' + Config['session.port'] + ' -m state --state ESTABLISHED -j ACCEPT', { silent: false });
        /*
        shelljs.exec('iptables -A INPUT -s '+TRUSTED_HOSTS[i]+' -p tcp --destination-port 443 -m state --state NEW,ESTABLISHED -j ACCEPT',{silent:false});
        shelljs.exec('iptables -A OUTPUT -d '+TRUSTED_HOSTS[i]+' -p tcp --source-port 443 -m state --state ESTABLISHED -j ACCEPT',{silent:false});
        */
    };
    shelljs.exec('iptables -A INPUT -p tcp --dport ' + Config["db.port"] + ' -j DROP', { silent: false });
    // shelljs.exec('iptables -A INPUT -p tcp --dport 443 -j DROP',{silent:false});
    shelljs.exec('iptables -A INPUT -p tcp --dport ' + Config['session.port'] + ' -j DROP', { silent: false });
    shelljs.exec('iptables -A OUTPUT -p tcp --source-port ' + Config["db.port"] + ' -j DROP', { silent: false });
    shelljs.exec('iptables -A OUTPUT -p tcp --source-port ' + Config['session.port'] + ' -j DROP', { silent: false });

    shelljs.exec('iptables -A INPUT -s 127.0.0.1 -p tcp --destination-port 61208 -m state --state NEW,ESTABLISHED -j ACCEPT', { silent: false });
    shelljs.exec('iptables -A OUTPUT -d 127.0.0.1 -p tcp --source-port 61208 -m state --state ESTABLISHED -j ACCEPT', { silent: false });
    shelljs.exec('iptables -A INPUT -p tcp --dport 61208 -j DROP', { silent: false });

    cb();

}