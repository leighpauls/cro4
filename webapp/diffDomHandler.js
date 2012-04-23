var scraper = require("./scraper.js");
var utils = require("./utils.js");

exports.handleConnection = function(socket, browserSockets) {

	// boss browser reporting a head
	socket.on('diff-init', function (diffInit) {

		// boss browser reporting in save the page data
		socket.set('tab-context', {
			tabId: diffInit.tabId,
			ocs: diffInit.ocs, 
			path: diffInit.path
		}, function() {
			scraper.scrapeDiff(diffInit.ocs, diffInit.path, diffInit.diff, function (scrapedDiff) {
				diffInit.diff = scrapedDiff;
				
				// send initial update to all other browsers
				utils.forEachBut(browserSockets, socket, function(soc) {
					soc.emit('diff-init', diffInit);
				});
			});
		});
	});

	socket.on('diff-partial-init', function (diffPartialInit) {
		// do any url scraping or re-write nessisary
		scraper.scrapeDiff(diffPartialInit.ocs, diffPartialInit.path, diffPartialInit.diff, function(scrapedDiffs) {
			diffPartialInit.diff = scrapedDiffs;
			// send to all other browsers
			utils.forEachBut(browserSockets, socket, function(soc) {
				soc.emit('diff-partial-init', diffPartialInit);
			});
		});
	});

	// boss browser reporting a head
	socket.on('diff-update', function(diffUpdate) {
		// do any url scraping or re-write nessisary
		socket.get('tab-context', function(err, context) {
			scraper.scrapeDiff(context.ocs, context.path, diffUpdate.diff, function(scrapedDiffs) {
				diffUpdate.diff = scrapedDiffs;
				// send to all other browsers
				utils.forEachBut(browserSockets, socket, function(soc) {
					soc.emit('diff-update', diffUpdate);
				});
			});
		});
	});
	
};