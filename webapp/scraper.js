/**
 * Creates a modifed version of the diff so without any relative URLS
 * so that only absolue calls are made to the OCS.
 *
*/
exports.scrapeDiff = function (ocs, path, diffs, callback) {
	// path to be appeneded to relative urls
	var relPath = (/^.*\//g).exec(path),
	relScheme = (/^.*:/g).exec(ocs);

	scrapeChildList(diffs);

	callback(diffs);

	// iterates over the children, scraping them recursively as subtrees
	function scrapeChildList(diffList) {
		for (var i = 0; i < diffList.length; ++i) {
			if (!scrapeSubtree(diffList[i])) {
				// the node wants to be removed
				diffList.splice(i, 1);
				--i;
			}
		}
	}

	// returns false if this node should be deleted
	function scrapeSubtree(diffEntry) {
		var tagName;
		if (diffEntry.nodeType === 'elem') {
			tagName = diffEntry.tagName;
			// I only care about elements
			if (tagName.toLowerCase() === 'script') {
				// I'm script, remove me
				return false;
			}
	
			scrapeAttributes(diffEntry);
			

			// look at the inside of a <style> tag
			if ('style' === diffEntry.tagName.toLowerCase()) {
				// look for any text node children, and absolutify them
				for (var i = 0; i < diffEntry.children.length; ++i) {
					if ('text' === diffEntry.children[i].type) {
						diffEntry.children[i].text = absolutifyStyle(diffEntry.children[i].text);
					}
				}
			}

			// recurse over my children
			scrapeChildList(diffEntry.children);
		}
		// I'm a text node, or a harmless element
		return true;
	}
	

	function scrapeAttributes(diffEntry) {
		var  href, src, style;
		// attribiutes which are always urls
		href = diffEntry.attr.href;
		if (href) {
			diffEntry.attr.href = absolutifyUrl(href);
		}
		src = diffEntry.attr.src;
		if (src) {
			diffEntry.attr.src = absolutifyUrl(src);
		}
		// fix urls in tag-level styles
		style = diffEntry.attr.style;
		if (style) {
			diffEntry.attr.style = absolutifyStyle(style);
		}

		// remove event attributes
		// TODO: find an exaustive list of events for here
		var eventAttrs = ["onload", "onclick", "onmousedown", "onmouseup"];
		for (var i = 0; i < eventAttrs.length; ++i) {
			if ( diffEntry.attr[ eventAttrs[ i ]]) {
				diffEntry.attr[ eventAttrs[ i ]] = "";
			}
		}
	}

	function absolutifyUrl(url) {
		// if it is already absolute or a dumb javascript href
		if ((/^(https?|javascript):\/\//g).test(url)) {
			return url;
		}

		// if it's relative to the OCS
		if ('/' === url[0]) {
			if ('/' === url[1]) {
				// scheme-relative path
				return relScheme + url;
			}
			// ocs-relative path, just add the ocs
			return ocs + url;
		}
		// it must be reative to ocs+relPath
		// TODO: this is actually relative to the <base> tag in the document, deal with this later
		return ocs + relPath + url;
	}

	function absolutifyStyle(style) {
		// TODO: make an actual parser instead of this pile of regexp shit
		var lastEndPoint = 0;
		while (true) {
			// look for single quotes
			var nextPoint = style.indexOf("url('", lastEndPoint);
			if (nextPoint >= 0) {
				// move inside of the string
				nextPoint += 5;
				var endPoint = style.indexOf("'", nextPoint);
				if (endPoint < 0) {
					// fail case, whatever, this is a shit prototype implementation
					lastEndPoint = nextPoint;
					continue;
				}

				// make an absolute URL
				var rawUrl = style.substr(nextPoint, endPoint - nextPoint);
				var absUrl = absolutifyUrl(rawUrl);

				// splice the string to use the new url
				style = style.substr(0, nextPoint) + absUrl + style.substr(endPoint);
				// set the next point accordind to the length of the absolute string
				lastEndPoint = nextPoint + absUrl.length;
				continue;
			}
			// look for double quotes
			nextPoint = style.indexOf('url("', lastEndPoint);
			if (nextPoint >= 0) {
				// move inside of the string
				nextPoint += 5;
				var endPoint = style.indexOf('"', nextPoint);
				if (endPoint < 0) {
					// fail case, whatever, this is a shit prototype implementation
					lastEndPoint = nextPoint;
					continue;
				}

				// make an absolute URL
				var rawUrl = style.substr(nextPoint, endPoint - nextPoint);
				var absUrl = absolutifyUrl(rawUrl);

				// splice the string to use the new url
				style = style.substr(0, nextPoint) + absUrl + style.substr(endPoint);
				// set the next point accordind to the length of the absolute string
				lastEndPoint = nextPoint + absUrl.length;
				continue;
			}
			// look for no quotes
			nextPoint = style.indexOf('url(', lastEndPoint);
			if (nextPoint >= 0) {
				// move inside of the string
				nextPoint += 4;
				var endPoint = style.indexOf(')', nextPoint);
				if (endPoint < 0) {
					// fail case, whatever, this is a shit prototype implementation
					lastEndPoint = nextPoint;
					continue;
				}

				// make an absolute URL
				var rawUrl = style.substr(nextPoint, endPoint - nextPoint);
				var absUrl = absolutifyUrl(rawUrl);

				// splice the string to use the new url
				style = style.substr(0, nextPoint) + absUrl + style.substr(endPoint);
				// set the next point accordind to the length of the absolute string
				lastEndPoint = nextPoint + absUrl.length;
				continue;
			}
			
			break;
		}
		return style;
	}

}

