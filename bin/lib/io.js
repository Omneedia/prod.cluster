module.exports = function(socket) {
    function Token(text) {
        var date = new Date().toMySQL().split(' ')[0];
        var d = require('crypto').createHash('md5').update(date).digest('hex');
        if (text == d) return true;
        else return false;
    };

    function io(socket) {
        if (socket.handshake.query.engine)
            console.log('* Service [' + socket.handshake.query.engine.toUpperCase() + '] ' + socket.id + ' connected from ' + socket.handshake.address);
        else
            console.log('+ Client ' + socket.id + ' connected from ' + socket.handshake.address);
    };

    if (socket.handshake.query.iokey) {
        if (Token(socket.handshake.query.iokey)) io(socket)
        else {
            console.log('* Unauthorized - ' + socket.id + ' from ' + socket.handshake.address);
            socket.disconnect('* Unauthorized');
        }
        return;
    };

    console.log('* Unauthorized - ' + socket.id + ' from ' + socket.handshake.address);
    socket.disconnect('* Unauthorized');
}