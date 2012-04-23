
$(document).ready(function(){
	// get the hashparams
	var hashSegments = window.location.href.slice( window.location.href.indexOf( '#' ) + 1 ).split( '&' );
	var hashParams = new StrMap();
	for (var i = 0; i < hashSegments.length; ++i) {
		var parts = hashSegments[i].split( '=' );
		hashParams.put(unescape(parts[0]), unescape(parts[1]));
	}

	var tabId = hashParams.get('t') || generateId();


	var domDecoder = null;
	var socket = io.connect();
	var capturer = new EventCapturer(socket, tabId);


	socket.on('connect', function() {

		socket.on('diff-init', function(diffInit) {
			if (null === domDecoder) {
				if (tabId === diffInit.tabId) {
					// Make a new diffDomDecoder if I don't have one yet
					domDecoder = new DiffDomDecoder(diffInit, capturer);
				}
			} else {
				// otherwise, see if it's a page change
				domDecoder.tryReinit(diffInit);
			}
		});

		socket.on('diff-partial-init', function(diffPartialInit) {
			if (null === domDecoder && tabId === diffPartialInit.tabId) {
				// I'm actually expecting this partial
				domDecoder = new DiffDomDecoder(diffPartialInit, capturer);
			}
		});

		socket.on('diff-update', function(diffUpdate) {
			domDecoder.update(diffUpdate.diff);
		});

		// request the tab to be created
		socket.emit('tab-created', {
			tabId: tabId
		});
	
	});
});

