
exports.handleConnection = function(socket, browserSockets) {
	socket.on( 'input-event', function(inputEvent) {
		// TODO: per-session abuse filtering
		for (var i = 0; i < browserSockets.length; ++i) {
			if (browserSockets[i] !== socket) {
				browserSockets[i].emit('input-event', inputEvent);
			}
		}
	});
};