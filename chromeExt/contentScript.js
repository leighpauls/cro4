$(document).ready(function () {

	var encoder = new DiffDomEncoder();
	var dispatcher = new EventDispatcher(function(id) {
		return encoder.getDomNodeFromId(id);
	});
			
	chrome.extension.sendRequest({
		'diffInit': encoder.getDiffInit()
	});

	var port = chrome.extension.connect();
	port.onMessage.addListener(function(request, sender) {
		if (request) {
			if (request.inputEvent) {
				console.log(request.inputEvent);
				dispatcher.applyEvent(request.inputEvent);
			}
			if (request.pleasePartialInit) {
				chrome.extension.sendRequest({
					'diffPartialInit': encoder.partialInit()
				});
			}
			if (request.historyMove) {
				history.go(request.historyMove.dist);
			}
		}
	});
	
	$(document.body).keypress(function(e) {
		var diff;
		
		if (119 === e.keyCode && encoder) {
			diff = encoder.doDiff();
			console.log(diff);
			chrome.extension.sendRequest({
				'diffUpdate': { diff: diff }
			});
		}
	});
});
