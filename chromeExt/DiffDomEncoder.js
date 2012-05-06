
function DiffDomEncoder (updateHandler) {

	this.updateHandler = updateHandler;
	// a queue of nodes which should be diff'ed on the next cycle
	this.modifiedNodes = [];

	// start with the jnode of a blank page
	var headId = null;
	this.jNodeMap = {};
	if (document.head) {
		this.jNodeMap[headId] = this.headJNode;
		this.headJNode = this.createJNodeElement(document.head);
		headId = this.headJNode.id;
	}

	this.bodyJNode = this.createJNodeElement(document.body);
	var bodyId = this.bodyJNode.id;
	this.jNodeMap[bodyId] = this.bodyJNode;

	this.diffInit = {
		headId: headId,
		bodyId: bodyId,
		diff: this.doDiff(),
		ocs: location.origin,
		path: location.pathname
	};

	this.doUpdateCycle();
}

DiffDomEncoder.prototype.doUpdateCycle = function() {
	var me = this,
	nextJNode;
	
	if (this.modifiedNodes.length > 0) {
		this.updateHandler(this.doDiff(this.modifiedNodes));
	}
	this.modifiedNodes = [];
	
	setTimeout(function() {
		me.doUpdateCycle();
	}, 500);
};

DiffDomEncoder.prototype.partialInit = function() {
	return {
		headId: (this.headJNode ? this.headJNode.id : null),
		bodyId: this.bodyJNode.id,
		diff: this.getLastFullStateDiff(),
		ocs: location.origin,
		path: location.pathname
	};
};

DiffDomEncoder.prototype.getLastFullStateDiff = function() {
	var res = [];
	if (this.headJNode) {
		res.push(DiffDomEncoder.getSendableDiffEntry(this.headJNode));
	}
	res.push(DiffDomEncoder.getSendableDiffEntry(this.bodyJNode));
	return res;
};

DiffDomEncoder.prototype.getDomNodeFromId = function( id ) {
	return this.jNodeMap[ id ].domNode;
}

DiffDomEncoder.prototype.getDiffInit = function () {
	return this.diffInit;
}

// removes the unsendable data (domNodes) and passes on the rest of the
// data for update
DiffDomEncoder.getSendableDiffEntry = function(jNode) {
	var res = {},
	name, i;

	for (name in jNode) {
		if ('domNode' === name) {
			continue;
		}
		if ('children' === name) {
			res.children = [];
			for (i = 0; i < jNode.children.length; ++i) {
				res.children.push(DiffDomEncoder.getSendableDiffEntry(jNode.children[i]));
			}
			continue;
		}
		res[name] = jNode[name];
	}
	return res;
}


DiffDomEncoder.prototype.doDiff = function(rootJNodes) {
	var diffList = [],
	jNodeMap = this.jNodeMap,
	me = this;

	rootJNodes = rootJNodes || [this.headJNode, this.bodyJNode];

	for (var q = 0; q < rootJNodes.length; ++q) {
		if (rootJNodes[q]) {
			diffNode(rootJNodes[q]);
		}
	}

	return diffList;

	function diffNode(jNode) {
		var i;

		if (compareAndUpdate(jNode)) {
			// update the entire subtree
			diffList.push(DiffDomEncoder.getSendableDiffEntry(jNode));
		} else if ('elem' === jNode.nodeType) {
			// no changes, recurse over all the children
			for (i = 0; i < jNode.children.length; ++i) {
				diffNode(jNode.children[i]);
			}
		}
	}

	function compareAndUpdate(jNode) {
		if (jNode.nodeType === 'elem') {
			return compareAndUpdateElement(jNode);
		} else if (jNode.nodeType === 'text') {
			return compareAndUpdateText(jNode);
		}
	}

	function compareAndUpdateElement(jNode) {
		var changed = false,
		curAttrName, curAttrDomValue,
		curDomAttr,
		domChildren = jNode.domNode.childNodes,
		childrenChanged = false,
		domAttrs = jNode.domNode.attributes,
		i;

		// compare each old attribute against the current values
		for (curAttrName in jNode.attr) {
			curAttrDomValue = jNode.domNode.getAttribute(curAttrName);
			if (jNode.attr[curAttrName] !== curAttrDomValue) {
				changed = true;
				jNode.attr[curAttrName] = curAttrDomValue;
			}
		}
		// compare each current attribute against the old values
		for (i = 0; i < domAttrs.length; ++i) {
			curDomAttr = domAttrs[i];
			curAttrDomValue = curDomAttr.value;
			curAttrName = curDomAttr.name;
			if (jNode.attr[curAttrName] !== curAttrDomValue) {
				changed = true;
				jNode.attr[curAttrName] = curAttrDomValue;
			}
		}
		
		if (haveChildrenChanged(jNode)) {
			// I need to update the children nodes
			changed = true;
			// kill all the children, and create new ones
			rebuildChildren(jNode);
		}
		return changed;
	}
	
	/**
     * Checks to see if the child entries have changed, disregarding comment nodes
     * and other bullshit like that
    **/
	function haveChildrenChanged(jNode) {
		var jIndex = 0,
		domIndex,
		domChildren = jNode.domNode.childNodes,
		jChildren = jNode.children,
		curDomNode;

		for (domIndex = 0; domIndex < domChildren.length; ++domIndex) {
			// for each dom element
			curDomNode = domChildren[domIndex];

			if (curDomNode.nodeType === 3 || curDomNode.nodeType === 1) {
				// this is a node that I care about
				if (jIndex >= jChildren.length || jChildren[jIndex].domNode !== curDomNode) {
					// I've run out of jChildren, or they do not match up
					return true;
				}
				++jIndex;
			}
		}
		// If I didn't get to the end of the jList
		if (jChildren.length !== jIndex) {
			return true;
		}
		return false;
	}

	function compareAndUpdateText(jNode) {
		var domText = jNode.domNode.nodeValue;
		if (domText !== jNode.text) {
			jNode.text = domText;
			return true;
		}
		return false;
	}

	function rebuildChildren(jNode) {
		var domChildren = jNode.domNode.childNodes,
		i, nextNode;

		for (i = 0; i < jNode.domNode.attributes.length; ++i) {
			$(jNode.domNode.attributes[i]).unbind('DOMSubtreeModified', jNode.updateHandler);
			$(jNode.domNode.attributes[i]).on('DOMSubtreeModified', jNode.updateHandler);
		}

		// TODO: figure out how to prune the jNodeMap without leaving hanging ID's
		// over a network-round-trip-time input update period
		// remove all of the event handlers
		for (i = 0; i < jNode.children.length; ++i) {
			$(jNode.children[i].domNode).unbind('DOMSubtreeModified', jNode.updateHandler);
		}
		jNode.children = [];

		for (i = 0; i < domChildren.length; ++i) {
			nextNode = createFromDomNode(domChildren[i]);
			if (nextNode) {
				// only worry about real nodes, don't care about comments, etc
				jNode.children.push(nextNode);
			}
		}
	}

	function createFromDomNode(domNode) {
		var res = null,
		nodeType = domNode.nodeType;

		if (1 === nodeType) {
			// it's an element
			res = me.createJNodeElement(domNode);

			// add to the global map
			jNodeMap[res.id] = res;
			
			compareAndUpdateElement(res);
		} else if (3 === nodeType) {
			// it's a text node
			res = me.createJNodeText(domNode);

			// add to the global map
			jNodeMap[res.id] = res;
		}
			
		return res;		
	}
};

DiffDomEncoder.prototype.createJNodeElement = function(domNode) {
	var me = this,
	res = {
		id: generateId(),
		nodeType: 'elem',
		attr: {},
		children: [],
		domNode: domNode,
		tagName: domNode.tagName,
		updateHandler: function(e) {
			e.stopPropagation();
			// update from this node
			me.modifiedNodes.push(res);
		}
	},
	i;

	$(domNode).on("DOMSubtreeModified", res.updateHandler);
	// add listeners to each of the attributes too
	for (i = 0; i < domNode.attributes.length; ++i) {
		$(domNode.attributes[i]).on("DOMSubtreeModified", res.updateHandler);
	}

	return res;
}

DiffDomEncoder.prototype.createJNodeText = function(domNode) {
	var me = this,
	res = {
		id: generateId(),
		domNode: domNode,
		nodeType: 'text',
		text: domNode.nodeValue,
		updateHandler: function(e) {
			e.stopPropagation();
			// update from this node
			me.modifiedNodes.push(res);
		}
	};


	$(domNode).on("DOMSubtreeModified", res.updateHandler);
	return res;
}