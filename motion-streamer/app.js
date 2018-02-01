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
	console.log('[ZEROMQ]\t Publisher bound to port: '+zmq_port);

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
	console.log('[HTTP]\t\t listening on *:3000');
});

// VISUALIZER - NO TW
app.get('/cloudvr_server', function (req, res) {
	res.sendFile(__dirname+'/cloudvr_server.html');
});
app.get('/cloudvr_client', function (req, res) {
	res.sendFile(__dirname+'/cloudvr_client.html');
});
// END

// VISUALIZE - TW
app.get('/cloudvr_client_tw', function (req, res) {
	res.sendFile(__dirname+'/cloudvr_client_tw.html');
});
app.get('/cloudvr_server_tw', function (req, res) {
	res.sendFile(__dirname+'/cloudvr_server_tw.html');
});
// END

// Direct Input
app.get('/cloudvr_client_direct', function (req, res) {
	res.sendFile(__dirname+'/cloudvr_client_direct.html');
});
app.get('/cloudvr_server_direct', function (req, res) {
	res.sendFile(__dirname+'/cloudvr_server_direct.html');
});
// END

app.get('/load_data', function (req, res) {
	console.log(req.query.file);
	res.sendFile(__dirname+'/Traces/500/'+req.query.file);
});

io.on('connection', function(socket_io) {
	console.log('[SOCKETIO]\t computer connected: '+socket_io.request.connection.remoteAddress);
	socket_io.on('disconnect', function() {
		console.log('[SOCKETIO]\t computer disconnected: '+socket_io.request.connection.remoteAddress);
	});
	socket_io.on('vr_data', function(msg) {
		var motion_data = new Float32Array(msg.motion_data);
		writeLog(msg.timestamp+msg.motion_data+","+motion_data+"\n", "client");
		socket_io.broadcast.emit('vr_data', msg);
		console.log(msg.orientation);
		zmq_sock.send(","+msg.timestamp+msg.orientation+",");
		// test offline
		//var dummy_msg = ",1505989085647.636,-0.08498956263065338,-0.7713844776153564,0.0481448620557785,0.6288281679153442,";
		//zmq_sock.send(dummy_msg);
	});
});
