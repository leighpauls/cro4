var socket = io.connect('http://cro4.com');
socket.on('connect', function() {

	// keep track of the tabId, indexed by chrome tab id #
	var tabIdLookup = {};
	
	// a tab has just connected to me for it's input stream
	chrome.extension.onConnect.addListener(function(port) {
		var tabId = tabIdLookup[port.sender.tab.id];
		// listen for input from the server
		var inputListener = function(inputEvent) {
			if (inputEvent.tabId === tabId) {
				port.postMessage({
					'input-event': inputEvent
				});
			}
		};
		socket.on('input-event', inputListener);
		
		// stop listening for input when the tab disconnects
		port.onDisconnect.addListener(function() {
			socket.removeListener('input-event', inputListener );
		});
	});

	// a tab wants to push it's status to it's monkeys
	chrome.extension.onRequest.addListener(function(request, sender) {
		if (request) {
			var tabId = tabIdLookup[sender.tab.id];
			if (request.diffDomUpdate) {
				request.diffDomUpdate.tabId = tabId;
				socket.emit('diff-update', request.diffDomUpdate);
			}
			if (request.diffDomInit) {
				request.diffDomInit.tabId = tabId;
				socket.emit('diff-init', request.diffDomInit);
			}
		}
	});

	socket.on('tab-created', function(tabInfo) {
		chrome.tabs.create({
			url: 'http://google.com',
			active: false
		}, function(tab) {
			tabIdLookup[tab.id] = tabInfo.tabId;
		});
	});

});


