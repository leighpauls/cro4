

$(document).ready(function () {
	

	var socket = io.connect("http://cro4.com");
	var tabManager = new TabManager(socket);
	var historyControls = new HistoryControls(tabManager, socket);
	
});