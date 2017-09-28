// HTTP and SocketIO 
var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var path = require('path');
var fs = require('fs');

// Add Zeromq to communicate with C++
var zmq = require('zeromq');
var zmq_sock = zmq.socket('pub');
var zmq_addr = '127.0.0.1';
var zmq_port = 5556;
zmq_sock.bindSync('tcp://'+zmq_addr+':'+zmq_port);
console.log('[ZEROMQ] Publisher bound to port: '+zmq_port);

// Log to file
var rateControl = 10;
var buffer = 0;
var file_name = new Date().getTime() / 1000;
var log_enabled = false;
function writeLog(msg, type) {
	if (log_enabled) {
		fs.appendFile(__dirname+"/"+file_name+"_"+type+".csv", msg, function(err) {
		    if(err) {
		        return console.log(err);
		    }
		});
	}
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

io.on('connection', function(socket_io) {
	console.log('[SOCKETIO] computer connected');
	socket_io.on('disconnect', function() {
		console.log('[SOCKETIO] computer disconnected');
	});
	socket_io.on('vr_data', function(msg) {
		var motion_data = new Float32Array(msg.motion_data);
		// var orientation = new Float32Array(msg.orientation);
		writeLog(msg.timestamp+msg.orientation+","+motion_data+"\n", "client");
		// socket_io.broadcast.emit('vr_data', msg);
		// test offline
		var dummy_msg = ",1505989085647.636,-0.08498956263065338,-0.7713844776153564,0.0481448620557785,0.6288281679153442,";
		zmq_sock.send(dummy_msg);
	});
	// socket_io.on('vr_data_server', function(msg) {
	// 	var motion_data = new Float32Array(msg.motion_data);
	// 	writeLog(msg.timestamp+","+motion_data+"\n", "server");
	// 	socket_io.broadcast.emit('vr_data_server', msg);
	// });
});

while (1) {
	var dummy_msg = ",1505989085647.636,-0.08498956263065338,-0.7713844776153564,0.0481448620557785,0.6288281679153442,";
	zmq_sock.send(dummy_msg);
}
