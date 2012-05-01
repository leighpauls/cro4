// Takes differential DOM updates from the master and displays them locally on the monkey

function DiffDomDecoder (diffInit, capturer) {
	// member variables
	this.capturer = capturer;
	this.tabId = diffInit.tabId;
	this.nodeMap = {};

	this.configureRootNodes( diffInit );

	// update everything
	this.update(diffInit.diff);
}

DiffDomDecoder.prototype.tryReinit = function( diffInit ) {
	// if this is my tabId
	if ( diffInit.tabId === this.tabId ) {
		// do the re-init
		this.clearRootNodes();
		this.configureRootNodes( diffInit );
		this.update( diffInit.diff );
	}
};

DiffDomDecoder.prototype.clearRootNodes = function() {
	// kill all attributes and added children
	var thisObject = this;
	clearNode( document.head );
	clearNode( document.body );

	function clearNode( domNode ) {
		var children = domNode.children,
		attrs = domNode.attributes;
		//reomve child nodes
		while ( children.length > 0 ) {
			domNode.removeChild( children[ 0 ]);
		}
		// remove the attributes
		while ( attrs.length > 0 ) {
			domNode.removeAttribute( attrs[0].nodeName );
		}
	}
};

DiffDomDecoder.prototype.configureRootNodes = function( diffInit ) {
	// create the default root elements
	this.nodeMap[diffInit.headId] = {
		isElem: true,
		domNode: document.head,
		id: diffInit.headId
	};
	this.headId = diffInit.headId;
	this.nodeMap[diffInit.bodyId] = {
		isElem: true,
		domNode: document.body,
		id: diffInit.bodyId
	};
	this.bodyId = diffInit.bodyId;
};

// updates the DOM and local data according to the diff
DiffDomDecoder.prototype.update = function (diffList) {
	var nodeMap = this.nodeMap,
	capturer = this.capturer,
	i;

	for (i = 0; i < diffList.length; ++i) {
		updateNode(diffList[i]);
	}

	function updateNode(diffEntry) {
		// the node that this is called on should always exist
		if ('elem' === diffEntry.nodeType) {
			updateElement(diffEntry);
		} else if ('text' === diffEntry.nodeType) {
			updateText(diffEntry);
		}
	}

	function updateElement(diffEntry) {
		// the node this is called on should always exist and be an element node
		var jNode = nodeMap[diffEntry.id],
		domNode = jNode.domNode,
		curAttrName,
		i, curChildJNode;

		// remove all unspecified attributes
		for (i = 0; i < domNode.attributes.length; ++i) {
			if (!diffEntry.attr[domNode.attributes[i].name]) {
				domNode.removeAttribute(domNode.attributes[i].name);
			}
		}

		// set all specified attributes
		for (curAttrName in diffEntry.attr) {
			domNode.setAttribute(curAttrName, diffEntry.attr[curAttrName]);
		}
		
		// remove all the existing children
		while (domNode.hasChildNodes()) {
			// TODO: remove child jNodes based on ID
			domNode.removeChild(domNode.firstChild);
		}

		// create new children
		for (i = 0; i < diffEntry.children.length; ++i) {
			// TODO: keep track of child ID's
			curChildJNode = createNode(diffEntry.children[i]);
			domNode.appendChild(curChildJNode.domNode);
		}
	}

	function updateText(diffEntry) {
		// the node this is called on should always exist, and be a text node
		var jNode = nodeMap[diffEntry.id];
		jNode.domNode.nodeValue = diffEntry.text;
	}

	function createNode(diffEntry) {
		// the node this is called for should not exist yet
		if ('elem' === diffEntry.nodeType) {
			return createElement(diffEntry);
		} else if ('text' === diffEntry.nodeType) {
			return createText(diffEntry);
		}
	}

	function createElement(diffEntry) {
		// this should be called on a node that does not yet exist
		var jNode = {
			id: diffEntry.id,
			domNode: document.createElement(diffEntry.tagName)
		};

		nodeMap[diffEntry.id] = jNode;
		updateElement(diffEntry);

		capturer.attachToNode(jNode.domNode, jNode.id);

		return jNode;
	}

	function createText(diffEntry) {
		var jNode = {
			id: diffEntry.id,
			domNode: document.createTextNode(diffEntry.text)
		};

		capturer.attachToNode(jNode.domNode, jNode.id);

		nodeMap[diffEntry.id] = jNode;
		// currently no need to call updateText()???
		return jNode;
	}

}
