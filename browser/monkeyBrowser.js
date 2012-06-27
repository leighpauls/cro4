

$(document).ready(function () {
	

	var socket = io.connect("http://cro4.com");
	var tabManager = new TabManager(socket);
	var historyControls = new HistoryControls(tabManager, socket);
	var urlBarControls = new UrlBarControls(tabManager, socket);
	var inputCapturer = new InputCapturer(socket, tabManager, urlBarControls);
	
});