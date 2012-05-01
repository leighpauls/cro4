function UrlBarControls(tabManager, socket) {
	var me = this;
	this.tabManager = tabManager;
	this.socket = socket;

	$('.omni-box').on('keydown', function(e) {
		// on the return key
		if (e.which == 13) {
			me.goToUrl( $(e.target).val() );
		}
	});

	// TODO: ask the tab manager to call me whenever the tab has been changed
	// so that i can change the url bar for that tab
}

UrlBarControls.prototype.goToUrl = function(url) {
	this.socket.emit('please-go-to-url', {
		url: url,
		tabId: this.tabManager.getCurrentTabId()
	});
};