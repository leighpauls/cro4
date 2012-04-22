var scraper = require("./scraper.js");
var utils = require("./utils.js");

exports.handleConnection = function(socket, browserSockets) {

	// boss browser reporting a head
	socket.on('diff-init', function (diffDomInit) {

		// boss browser reporting in save the page data
		socket.set('tab-context', {
			tabId: diffDomInit.tabId,
			ocs: diffDomInit.ocs, 
			path: diffDomInit.path
		}, function() {
			scraper.scrapeDiff(diffDomInit.ocs, diffDomInit.path, diffDomInit.diff, function (scrapedDiff) {
				diffDomInit.diff = scrapedDiff;
				
				// send initial update to all other browsers
				utils.forEachBut(browserSockets, socket, function(soc) {
					soc.emit('diff-init', diffDomInit);
				});
			});
		});
	});


	// boss browser reporting a head
	socket.on('diff-update', function(diffDomUpdate) {
		// do any url scraping or re-write nessisary
		socket.get('tab-context', function(err, context) {
			scraper.scrapeDiff(context.ocs, context.path, diffDomUpdate.diff, function(scrapedDiffs) {
				// send to all other browsers
				utils.forEachBut(browserSockets, socket, function(soc) {
					soc.emit('diff-update', {diff: scrapedDiffs});
				});
			});
		});
	});
	
};