//$(document).ready(function () {
(function() {

	var encoder = new DiffDomEncoder(function(diff) {
		//console.log(diff);
		port.postMessage({
			'diffUpdate': { diff: diff }
		});
	});
	var dispatcher = new EventDispatcher(function(id) {
		return encoder.getDomNodeFromId(id);
	});

	var port = chrome.extension.connect();
	port.postMessage({
		'diffInit': encoder.getDiffInit()
	});


	port.onMessage.addListener(function(request, sender) {
		if (request) {
			if (request.inputEvent) {
				dispatcher.applyEvent(request.inputEvent);
			}
			if (request.pleasePartialInit) {
				port.postMessage({
					'diffPartialInit': encoder.partialInit()
				});
			}
			if (request.historyMove) {
				history.go(request.historyMove.dist);
			}
		}
	});
})();
