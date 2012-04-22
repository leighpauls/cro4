function serializeXml(node) {
	var type = node.nodeType;
	if (1 === type) {
		// I'm an element
		var res = {
			isElem: true
		};
		res.name = node.tagName;

		var attrRes = {};
		var attributes = node.attributes;
		for (var i = 0; i < attributes.length; i++) {
			var curAttrib = attributes[i];
			attrRes[curAttrib.name] = curAttrib.value;
		}
		res.at = attrRes;

		var childRes = [];
		var children = node.childNodes;
		for (var i = 0; i < children.length; i++) {
			var curChild = serializeXml(children[i]);
			// if the result is non-null, add it
			if (curChild !== null) {
				childRes.push(curChild);
			}
		}
		res.ch = childRes;
		return res;
	} else if (3 === type) {
		return node.data;
	}

	//console.trace("node type made no sense");
	// ignore all other types, they make no sense
	// or are meaningless
	return null;
}

function doReportForever() {
	var fullReport = {
		"head": serializeXml(document.head),
		"body": serializeXml(document.body),
		"ocs": document.location.origin, // origin content server
		"path": document.location.pathname // path to base relative to OCS
	};
	chrome.extension.sendRequest({ 'reportDom': fullReport });
	//window.setTimeout(doReportForever, 2000);
}


$(document).ready(function() {
	window.setTimeout(doReportForever, 1000);
	//doReportForever();

});