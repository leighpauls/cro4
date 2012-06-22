function HistoryControls(tabManager, socket) {
	var me = this;
	this.tabManager = tabManager;
	this.socket = socket;

	// handle the on-page history controls
	$('.back-button')
		.on('click', function() {
			me.moveHistory(-1);
		});
	
	$('.forward-button')
		.on('click', function() {
			me.moveHistory(1);
		});

	// handle the plain browser history controls
	this.onHistoryPop = function(e) {
		// figure out how far I moved
		var dist = e.state.historyPoint - me.historyPoint;
		me.moveHistory(dist);
	};
	this.onResetBackup = function(e) {
		me.historyPoint = e.state.historyPoint;
		window.onpopstate = me.onHistoryPop;
	};

	this.historyPoint = 0;
	this.resetHistoryState();
}



/*
* safely configures the history state to capture forward and back actions from the browser
*/
HistoryControls.prototype.resetHistoryState = function() {
	// disable the event handler
	window.onpopstate = this.onResetBackup;

	window.history.replaceState({ historyPoint: this.historyPoint -1 },
								"", "#" + (this.historyPoint -1));
	window.history.pushState({ historyPoint: this.historyPoint },
							 "", "#" + this.historyPoint);
	window.history.pushState({ historyPoint: this.historyPoint + 1},
							 "", "#" + (this.historyPoint + 1));

	// back up to the right spot
	window.history.back();
}

HistoryControls.prototype.moveHistory = function(dist) {
	this.socket.emit('history-move', {
		tabId: this.tabManager.getCurrentTabId(),
		dist: dist
	});
	
	this.historyPoint += dist;
	this.resetHistoryState();
};