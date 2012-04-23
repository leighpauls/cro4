

$(document).ready(function () {
	

	var socket = io.connect("http://cro4.com")
	, tabManager = new TabManager();
	
	tabManager.prepareSocket(socket);

});