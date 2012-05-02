function UrlBarControls(tabManager, socket) {
	var me = this;
	this.tabManager = tabManager;
	this.socket = socket;

	this.urls = new StrMap();

	$('.omni-box').on('keydown', function(e) {
		// on the return key
		if (e.which == 13) {
			me.goToUrl( $(e.target).val() );
		}
	});

	this.socket.on('report-tab-url', function(urlInfo) {
		me.urls.put(urlInfo.tabId, urlInfo.url);
		if (me.tabManager.getCurrentTabId() === urlInfo.tabId) {
			// I need to update the url immediately
			me.setOmniValue(urlInfo.url);
		}
	});

	// ask the tab manager to call me whenever the tab has been changed
	$(this.tabManager).on('tab-changed', function(tabId) {
		var newValue = me.urls.get(tabId) || "";
		me.setOmniValue(newValue);
	});
}

UrlBarControls.prototype.setOmniValue = function(newUrl) {
	$('.omni-box').val(newUrl);
};

UrlBarControls.prototype.goToUrl = function(url) {
	this.socket.emit('please-go-to-url', {
		url: url,
		tabId: this.tabManager.getCurrentTabId()
	});
};