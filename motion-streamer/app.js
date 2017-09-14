var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var path = require('path');
var fs = require('fs');

// Add Zeromq to communicate with C++
var zmq = require('zeromq');
var sock = zmq.socket('pub');
var zmq_addr = '127.0.0.1';
var zmq_port = 5556;
sock.bindSync('tcp://'+zmq_addr+':'+zmq_port);
console.log('[ZEROMQ] Publisher bound to port: '+zmq_port);


var rateControl = 10;
var buffer = 0;
var file_name = new Date().getTime() / 1000;

function writeLog(msg) {
	fs.appendFile(__dirname+"/"+file_name+".log", msg, function(err) {
	    if(err) {
	        return console.log(err);
	    }

	    // console.log("The file was saved!");
	});
}

app.use(express.static(path.join(__dirname, 'public')));

http.listen(3000, function () {
	console.log('listening on *:3000');
});

app.get('/cloudvr_client', function (req, res) {
	res.sendFile(__dirname+'/cloudvr_client.html');
});

app.get('/cloudvr_server', function (req, res) {
	res.sendFile(__dirname+'/cloudvr_server.html');
});

app.get('/dot', function (req, res) {
	res.sendFile(__dirname+'/dot.html');
});

app.get('/threejs', function (req, res) {
	res.sendFile(__dirname+'/threejs.html');
});

app.get('/webgl', function (req, res) {
	res.sendFile(__dirname+'/2.html');
});

app.get('/yaw', function (req, res) {
	res.sendFile(__dirname+'/yaw.html');
});

app.get('/pitch', function (req, res) {
	res.sendFile(__dirname+'/pitch.html');
});

app.get('/roll', function (req, res) {
	res.sendFile(__dirname+'/roll.html');
});

io.on('connection', function(socket) {
	console.log('[SOCKETIO] computer connected');
	socket.on('disconnect', function() {
		console.log('[SOCKETIO] computer disconnected');
	});
	socket.on('vr_data', function(msg) {
		var motion_data = new Float32Array(msg.motion_data);
		var orientation = new Float32Array(msg.orientation);
		// writeLog("CLIENT: "+msg.timestamp+" - "+motion_data+"\n");
		var leftViewMatrix = motion_data.slice(16*0,16*1);
		console.log(leftViewMatrix);
		socket.broadcast.emit('vr_data', msg);
		sock.send(msg.timestamp);
		// io.emit('vr_data', msg);
	});
	socket.on('vr_data_server', function(msg) {
		var motion_data = new Float32Array(msg.motion_data);
		// writeLog("SERVER: "+msg.timestamp+" - "+motion_data+"\n");
		socket.broadcast.emit('vr_data_server', msg);
	});
});
