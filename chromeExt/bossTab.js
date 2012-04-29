function BossTab(tabInfo, socket, onCloseCb) {
	this.tabId = tabInfo.tabId;
	this.socket = socket;
	this.onCloseCb = onCloseCb;

	this.chromeTab = null;
	this.port = null;

	this.addListeners();

	var me = this;

	chrome.tabs.create({
		url: 'http://google.com',
		active: false
	}, function (chromeTab) {
		me.chromeTab = chromeTab;

		me.reportSelf();
	});
}

BossTab.prototype.onBossOutput = function(request) {
	if (request) {
		// append the tabId to the request and send it on
		if (request.diffUpdate) {
			request.diffUpdate.tabId = this.tabId;
			this.socket.emit('diff-update', request.diffUpdate);
		}
		if (request.diffInit) {
			request.diffInit.tabId = this.tabId;
			this.socket.emit('diff-init', request.diffInit);
		}
		if (request.diffPartialInit) {
			request.diffPartialInit.tabId = this.tabId;
			this.socket.emit('diff-partial-init', request.diffPartialInit);
		}
	}
};

BossTab.prototype.partialInit = function() {
	if (this.port) {
		// only need to bother re-initing if the port hasn't been made yet
		this.port.postMessage({
			pleasePartialInit: {}
		});
	}
};

BossTab.prototype.reportSelf = function() {
	this.socket.emit('report-tabs', {
		tabIds: [this.tabId]
	});
};