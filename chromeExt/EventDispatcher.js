/*
* Object responsible for applying input events to the document recived from 
* the monkey browsers
* @param getDomFromId {function(ID){...}} a function which takes an id and returns the corrisponding DOM node
*/
function EventDispatcher( getDomFromId ) {

	this.getDomFromId = getDomFromId;
}

EventDispatcher.prototype.applyEvent = function ( e ) {
	var typeLowerCase = e.type.toLowerCase();
	// keyboard events need to be handled specifically by cro4 browser features
	if ( typeLowerCase === 'keydown' ) {
		document.cro4FireKeyboardUpDown( e.keyCode, false, e.altKey, e.ctrlKey, e.metaKey, e.shiftKey );
	} else if ( typeLowerCase === 'keyup' ) {
		document.cro4FireKeyboardUpDown( e.keyCode, true, e.altKey, e.ctrlKey, e.metaKey, e.shiftKey );
	} else if ( typeLowerCase === 'keypress' ) {
		document.cro4FireKeyboardPress( e.charCode, e.altKey, e.ctrlKey, e.metaKey, e.shiftKey );
	} else if ( typeLowerCase === 'resize' ) {
		// resize the inner panel to these dimensions
		cro4ResizeTo( e.width + window.outerWidth - window.innerWidth,
					  e.height + window.outerHeight - window.innerHeight );
	} else {
		// TODO: handle other input events more specifically
		var domNode = this.getDomFromId( e.targetId );
		$( domNode ).simulate( e.type, e.simulateOptions);
	}
};

