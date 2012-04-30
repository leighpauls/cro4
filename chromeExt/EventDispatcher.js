/*
* Object responsible for applying input events to the document recived from 
* the monkey browsers
* @param getDomFromId {function(ID){...}} a function which takes an id and returns the corrisponding DOM node
*/
function EventDispatcher( getDomFromId ) {

	this.getDomFromId = getDomFromId;
}

EventDispatcher.prototype.applyEvent = function ( e ) {
	// TODO: handle based on the event type
	var domNode = this.getDomFromId( e.targetId );
	$( domNode ).simulate( e.type, {
		clientX: e.pageX,
		clientY: e.pageY,
		which: e.which
	});
	
}