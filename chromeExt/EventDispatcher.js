/*
* Object responsible for applying input events to the document recived from 
* the monkey browsers
* @param getDomFromId {function(ID){...}} a function which takes an id and returns the corrisponding DOM node
*/
function EventDispatcher( getDomFromId ) {

	this.getDomFromId = getDomFromId;
}

EventDispatcher.prototype.applyEvent = function ( e ) {
	// keyboard events need to be handled specifically by cro4 browser features
	if ( e.type.toLowerCase() === 'keydown' ) {
		document.cro4FireKeyboardUpDown( e.keyCode, false, e.altKey, e.ctrlKey, e.metaKey, e.shiftKey );
	} else if ( e.type.toLowerCase() === 'keyup' ) {
		document.cro4FireKeyboardUpDown( e.keyCode, true, e.altKey, e.ctrlKey, e.metaKey, e.shiftKey );
	} else if ( e.type.toLowerCase() === 'keypress' ) {
		document.cro4FireKeyboardPress( e.charCode, e.altKey, e.ctrlKey, e.metaKey, e.shiftKey );
	} else {
		// TODO: handle other input events more specifically
		var domNode = this.getDomFromId( e.targetId );
		$( domNode ).simulate( e.type, e.simulateOptions);
	}
};

