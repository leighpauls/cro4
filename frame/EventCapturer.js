// Keeps monitors for input events, and sends them on to the master through the socket

function EventCapturer( soc, tabId ) {
	var me = this;
	this.soc = soc;
	this.tabId = tabId;

	$(window).on('resize', function (e) {
		me.sendResize();
	});
}

EventCapturer.prototype.sendResize = function() {
	this.soc.emit( 'input-event', {
		tabId: this.tabId,
		type: 'resize',
		width: window.innerWidth,
		height: window.innerHeight
	});
}


EventCapturer.prototype.attachToNode = function ( domNode, id ) {
	var me = this;

	$(domNode).on('mousedown mouseup click dblclick', function (e) {
		// mouse events with preventDefault
		if (e.target === e.currentTarget) {
			// only send the top level events
			me.sendInputEvent(e, id);
			e.stopPropagation();
			e.preventDefault();
		}
	});

	$(domNode).on('mouseover mouseout mousemove', function (e) {
		// events without preventDefault
		if (e.target === e.currentTarget) {
			// only send the top level events
			me.sendInputEvent(e, id);
		}
	});	
};

EventCapturer.prototype.sendInputEvent = function(e, id) {
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