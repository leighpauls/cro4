function HistoryControls(tabManager, socket) {
	var me = this;
	this.tabManager = tabManager;
	this.socket = socket;

	$('.back-button')
		.on('click', function() {
			me.moveHistory(-1);
		});
	
	$('.forward-button')
		.on('click', function() {
			me.moveHistory(1);
		});
}

HistoryControls.prototype.moveHistory = function(dist) {
	this.socket.emit('history-move', {
		tabId: this.tabManager.getCurrentTabId(),
		dist: dist
	});
		
};