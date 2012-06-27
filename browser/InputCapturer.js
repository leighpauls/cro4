function InputCapturer( soc, tabManager, urlBarControls) {
	
	$(document).on('keydown keyup keypress', function(e) {
		var tabId = tabManager.getCurrentTabId();
		// only send keyboard data if there is a tab and the url bar is not focused
		if (tabId && !urlBarControls.hasFocus()) {
			soc.emit( 'input-event', {
				tabId: tabId,
				type: e.type,
				keyCode: e.originalEvent.keyCode,
				charCode: e.originalEvent.charCode,
				ctrlKey: e.originalEvent.ctrlKey,
				altKey: e.originalEvent.altKey,
				shiftKey: e.originalEvent.shiftKey,
				metaKey: e.originalEvent.metaKey
			});
		}
	});
}

