// Keeps monitors for input events, and sends them on to the master through the socket

function EventCapturer( soc, tabId ) {
	this.soc = soc;
	this.tabId = tabId;
}

EventCapturer.prototype.attachToNode = function ( domNode, id ) {
	var me = this;

	$(domNode).on('mousedown mouseup click dblclick', function (e) {
		// mouse events with preventDefault
		if (e.target === e.currentTarget) {
			// only send the top level events
			me.sendMouseEvent(e, id);
			e.stopPropagation();
			e.preventDefault();
		}
	});

	$(domNode).on('mouseover mouseout mousemove', function (e) {
		// mouse events without preventDefault
		if (e.target === e.currentTarget) {
			// only send the top level events
			me.sendMouseEvent(e, id);
		}
	});
	
};

EventCapturer.prototype.sendMouseEvent = function(e, id) {
	this.soc.emit( 'input-event', { 
		tabId: this.tabId,
		targetId: id,
		type: e.type,
		simulateOptions: {
			clientX: e.pageX,
			clientY: e.pageY,
			button: e.originalEvent.button,
			ctrlKey: e.originalEvent.ctrlKey,
			altKey: e.originalEvent.altKey,
			shiftKey: e.originalEvent.shiftKey,
			metaKey: e.originalEvent.metaKey
		}
	});
	
};