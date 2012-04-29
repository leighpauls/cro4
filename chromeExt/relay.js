// TODO: RE-WRITE THE VILE PIECE OF SHIT THAT IS THIS FILE!!!!!!!!

var socket = io.connect('http://cro4.com');
socket.on('connect', function() {
	var tabs = new StrMap();

	socket.on('tab-created', function(tabInfo) {
		var tabId = tabInfo.tabId,
		tab = tabs.get(tabId);

		if (tab) {
			// already exists
			tab.partialInit();
		} else {
			tab = new BossTab(tabInfo, socket);
			tabs.put(tabId, tab, function() {
				tabs.remove(tabId);
			});
		}
	});

});


