function UrlBarControls(tabManager, socket) {
	var me = this;
	this.tabManager = tabManager;
	this.socket = socket;

	this.urls = new StrMap();

	this.focused = false;

	$('.omni-box')
		.on('keydown', function(e) {
			// on the return key
			if (e.which == 13) {
				me.goToUrl( $(e.target).val() );
			}
		})
		.on('focus', function() {
			me.focused = true;
		})
		.on('blur', function() {
			me.focused = false;
		});

	this.socket.on('report-tab-url', function(urlInfo) {
		me.urls.put(urlInfo.tabId, urlInfo.url);
		if (me.tabManager.getCurrentTabId() === urlInfo.tabId) {
			// I need to update the url immediately
			me.setOmniValue(urlInfo.url);
		}
	});

	// ask the tab manager to call me whenever the tab has been changed
	$(this.tabManager).on('tab-changed', function() {
		var tabId = me.tabManager.getCurrentTabId(),
		newValue = "";
		if (tabId) {
			newValue = me.urls.get(tabId);
		}
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

UrlBarControls.prototype.hasFocus = function() {
	return this.focused;
};