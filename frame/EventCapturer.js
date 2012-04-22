// Keeps monitors for input events, and sends them on to the master through the socket

function EventCapturer( soc, tabId ) {
	this.soc = soc;
	this.tabId = tabId;
}

EventCapturer.prototype.attachToNode = function ( domNode, id ) {
	var tabId = this.tabId;
	var soc = this.soc;
	
	// TODO: find the rest of the events to be handled here
	$(domNode).on('mousedown mouseup click', function (e) {
		if (e.target === e.currentTarget) {
			console.log("Base Event ID: " + id);
			console.log(e);

			// TODO: send data based on the event type
			soc.emit( 'input-event', { 
				tabId: tabId,
				targetId: id,
				type: e.type,
				pageX: e.pageX,
				pageY: e.pageY,
				which: e.which
			});

			e.stopPropagation();
			e.preventDefault();
		} else {
			// TODO: debug, remove
			console.log("propagated event, should not be here: " + id);
		}
	});
};