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
			tab = new BossTab({
				tabInfo: tabInfo,
				socket: socket,
				onCloseCb: function() {
					tabs.remove(tabId);
				}
			});
			tabs.put(tabId, tab);
		}
	});

	chrome.tabs.onCreated.addListener(function(chromeTab) {
		if (chromeTab.openerTabId
			&& !(/^http:\/\/cro4.com/g).test(chromeTab.url)) {
			// opened by someone other than me
			var tab = new BossTab({
				chromeTab: chromeTab,
				socket: socket,
				onCloseCb: function() {
					tabs.remove(tab.tabId);
				}
			});
			tabs.put(tab.tabId, tab);
		}
	});
});


