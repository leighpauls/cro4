

$(document).ready(function () {
	

	var socket = io.connect("http://cro4.com")
	, tabManager = new TabManager();
	
	tabManager.prepareSocket(socket);


	// Tell the server that I need tid's
	socket.emit("browser-opened");

});