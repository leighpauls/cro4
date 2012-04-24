// TODO: RE-WRITE THE VILE PIECE OF SHIT THAT IS THIS FILE!!!!!!!!

var socket = io.connect('http://cro4.com');
socket.on('connect', function() {

	// keep track of the tabId, indexed by chrome tab id #
	var tabIdLookup = new StrMap();
	// ports indexed by tabId
	var ports = new StrMap();
	var tabsExist = new StrMap();

	chrome.tabs.onRemoved.addListener(function(chromeTabId) {
		var tabId = tabIdLookup.get(chromeTabId);
		if (tabId) { // may be null if it's not a tab that I made
			socket.emit('tab-closed', { tabId: tabId });
			tabsExist.put(tabId, false);
			tabIdLookup.remove(chromeTabId);
		}
	});
	
	// a tab has just connected to me for it's input stream
	chrome.extension.onConnect.addListener(function(port) {
		var chromeId = port.sender.tab.id;
		var tabId = tabIdLookup.get(chromeId);
		ports.put(tabId, port);
		// listen for input from the server
		var inputListener = function(inputEvent) {
			if (inputEvent.tabId === tabId) {
				port.postMessage({
					inputEvent: inputEvent
				});
			}
		};
		socket.on('input-event', inputListener);
		
		// stop listening for input when the tab disconnects
		port.onDisconnect.addListener(function() {
			ports.remove(tabId);
			socket.removeListener('input-event', inputListener );
		});
	});

	// a tab wants to push it's status to it's monkeys
	chrome.extension.onRequest.addListener(function(request, sender) {
		if (request) {
			var tabId = tabIdLookup.get(sender.tab.id);
			if (request.diffUpdate) {
				request.diffUpdate.tabId = tabId;
				socket.emit('diff-update', request.diffUpdate);
			}
			if (request.diffInit) {
				request.diffInit.tabId = tabId;
				socket.emit('diff-init', request.diffInit);
			}
			if (request.diffPartialInit) {
				request.diffPartialInit.tabId = tabId;
				socket.emit('diff-partial-init', request.diffPartialInit);
			}
		}
	});

	socket.on('tab-created', function(tabInfo) {
		if (tabsExist.get(tabInfo.tabId)) {
			var port = ports.get(tabInfo.tabId);
			// tab already exists here, just tell it to re-init
			if (port) {
				// if there is a port, I need to re-init,
				// otherwise, there's an init comming
				port.postMessage({
					pleasePartialInit: {}
				});
			}
		} else {
			// new tab, I need to create it here
			chrome.tabs.create({
				url: 'http://google.com',
				active: false
			}, function(tab) {
				tabsExist.put(tabInfo.tabId, true);
				tabIdLookup.put(tab.id, tabInfo.tabId);
				// force this tab to be sent to all the browsers
				reportTabs({
					tabIds: [tabInfo.tabId]
				});
			});
		}
	});

	socket.on('please-report-tabs', function(pleaseReportInfo) {
		reportTabs(pleaseReportInfo);
	});

	socket.on('please-close-tab', function(pleaseCloseInfo) {
		var tabId = pleaseCloseInfo.tabId;
		if (tabId) {
			chrome.tabs.remove(ports.get(tabId).tab.id);
		}
	});

	socket.on('history-move', function(historyInfo) {
		var tabId = historyInfo.tabId;
		if (tabId) {
			var port = ports.get(tabId);
			if (port) {
				port.postMessage({
					historyMove: historyInfo
				});
			}
		}
	});

	function reportTabs(pleaseReportInfo) {
		var tabList = pleaseReportInfo.tabIds;
		if (!tabList) {
			tabList = [];
			for (var i = 0; i < tabIdLookup.length(); ++i) {
				tabList.push(tabIdLookup.atIndex(i));
			}
		}
		socket.emit('report-tabs', {
			tabIds: tabList
		});
	}

});


