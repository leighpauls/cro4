BossTab.prototype.addListeners = function() {

	function delegate(context, func) {
		return function() {
			func.apply(context, arguments);
		};
	}

	// add listeners here, remove them in this.closeListeners
	// to prevent hanging events
	var me = this;
	
	var tabRemovedListener = function(chromeTabId) {
		// make sure that this close event is for me
		if (chromeTabId === me.chromeTab.id) {
			// tell the monkeys that I'm gone now
			socket.emit('tab-closed', { tabId: me.tabId });

			// remove all of my listeners
			me.removeListeners();

			// tell my owner that I've closed
			if (me.onCloseCb) {
				me.onCloseCb();
			}
		}
	};

	var portConnectListener = function(port) {
		if (port.sender.tab.id === me.chromeTab.id) {
			// this is trying to connect to me
			me.port = port;
			port.onDisconnect.addListener(function() {
				me.port = null;
			});
			port.onMessage.addListener(function(request) {
				me.onBossOutput(request);
			});
		}
	};

	var monkeyInputListener = function (inputEvent) {
		if (me.tabId === inputEvent.tabId && me.port) {
			// this if for me, and I have a tab to send it to
			me.port.postMessage({
				inputEvent: inputEvent
			});
		}
	};

	var reportTabsListener = function(pleaseReportInfo) {
		socket.emit('report-tabs', {
			tabIds: [me.tabId]
		});
	};

	var closeTabListener = function(pleaseCloseInfo) {
		if (me.tabId === pleaseCloseInfo.tabId) {
			// it's actually trying to close me
			chrome.tabs.remove(me.chromeTab.id);
		}
	};

	var historyMoveListener = function(historyInfo) {
		if (me.tabId === historyInfo.tabId) {
			if (me.port) {
				me.port.postMessage({
					historyMove: historyInfo
				});
			}
		}
	};

	var goToUrlListener = function(urlInfo) {
		if (me.tabId === urlInfo.tabId) {
			chrome.tabs.update(me.chromeTab.id, {
				url: urlInfo.url
			});
		}
	};

	chrome.tabs.onRemoved.addListener(tabRemovedListener);
	chrome.extension.onConnect.addListener(portConnectListener);
	this.socket.on('input-event', monkeyInputListener);
	this.socket.on('please-report-tabs', reportTabsListener);
	this.socket.on('please-close-tab', closeTabListener);
	this.socket.on('history-move', historyMoveListener);
	this.socket.on('please-go-to-url', goToUrlListener);

	this.removeListeners = function() {
		chrome.tabs.onRemoved.removeListener(tabRemovedListener);
		chrome.extension.onConnect.removeListener(portConnectListener);
		this.socket.removeListener('input-event', monkeyInputListener);
		this.socket.removeListener('please-report-tabs', reportTabsListener);
		this.socket.removeListener('please-close-tab', closeTabListener);
		this.socket.removeListener('history-move', historyMoveListener);
		this.socket.removeListener('please-go-to-url', goToUrlListener);
	}
};
