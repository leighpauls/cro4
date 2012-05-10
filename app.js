exports.runApp = function (portNum) {

	var express = require('express');
	var sio = require('socket.io');
	var socketHandler = require('./webapp/socketHandler.js');
	var app = express.createServer();

	app.configure(function() {
		app.use('/common', express.static(__dirname + '/common'));
		app.use('/frame', express.static(__dirname + '/frame'));
		app.use('/browser', express.static(__dirname + '/browser'));
		app.use(express.logger());
		app.use(express.errorHandler({dumpExceptions: true, showStack: true}));
	});

	app.get('/', function(req, res) {
		res.send('hello from express in chromate!!');
	});

	// allow socket.io to deliver it's client
	app.listen(portNum);

	// actually listen for socket connections
	var io = sio.listen(app);

	io.configure(function() {
		io.set('log level', 1);
	});

	io.sockets.on('connection', socketHandler.handleSocket);


};