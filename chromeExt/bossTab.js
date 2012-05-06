function BossTab(args) {
	if (args.tabInfo) {
		this.tabId = args.tabInfo.tabId;
	} else {
		this.tabId = generateId();
	}
	this.socket = args.socket;
	this.onCloseCb = args.onCloseCb;

	this.chromeTabId = null;
	this.port = null;
	
	this.url = null;

	this.addListeners();

	var me = this;

	var chromeTabInit = function(chromeTab) {
		me.chromeTabId = chromeTab.id;
		me.reportSelf();

		me.url = chromeTab.url;
		me.sendUrlUpdate();
	}
	
	if (args.chromeTab) {
		chromeTabInit(args.chromeTab);
	} else {
		chrome.tabs.create({
			url: 'http://google.com',
			active: false
		}, chromeTabInit);
	}
}

BossTab.prototype.onBossOutput = function(request) {
	if (request) {
		// append the tabId to the request and send it on
		if (request.diffUpdate) {
			request.diffUpdate.tabId = this.tabId;
			this.socket.emit('diff-update', request.diffUpdate);
			this.sendUrlUpdate();
		}
		if (request.diffInit) {
			request.diffInit.tabId = this.tabId;
			this.socket.emit('diff-init', request.diffInit);
		}
		if (request.diffPartialInit) {
			request.diffPartialInit.tabId = this.tabId;
			this.socket.emit('diff-partial-init', request.diffPartialInit);
			this.sendUrlUpdate();
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

BossTab.prototype.sendUrlUpdate = function() {
	if (this.url) {
		// only try to send if the url already exists
		this.socket.emit('report-tab-url', {
			url: this.url,
			tabId: this.tabId
		});
	}
};