var express = require('express');
var sio = require('socket.io');
var diffDom = require('./diffDomHandler.js');
var eventHandler = require('./eventHandler.js');

var utils = require('./utils.js');

var browserSockets = [];

exports.handleSocket = function(socket) {
	// keep track of the socket
	browserSockets.push(socket);
	console.log("Connection opened");

	diffDom.handleConnection( socket, browserSockets );
	eventHandler.handleConnection( socket, browserSockets );

	socket.on('tab-created', function(tabInfo) {
		utils.forEachBut(browserSockets, socket, function (soc) {
			soc.emit('tab-created', tabInfo);
		});
	});

	socket.on('browser-opened', function(browserInfo) {
		utils.forEachBut(browserSocket, socket, function(soc) {
			sock.emit('please-report-tabs', {});
		});
	});

	// connection closed
	socket.on('disconnect', function() {
		console.log("connection closed");
		// stop keeping track of the socket
		for (var i = 0; i < browserSockets.length; i++) {
			if (browserSockets[i] === socket) {
				browserSockets.splice(i, 1);
				break;
			}
		}
	});
};