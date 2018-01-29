var zmq = require('zeromq');
var sock = zmq.socket('pub');


var addr = '127.0.0.1';
var port = 5556;
sock.bindSync('tcp://'+addr+':'+port);
console.log('Publisher bound to port: '+port);

setInterval(function () {
	var msg = new Date().getTime() / 1000;
	console.log('[Publisher] sending message: '+msg);
	sock.send(msg);
}, 500);