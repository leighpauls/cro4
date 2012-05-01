// for informing browsers about all currently open tabs
// useful for new tabs and new browsers being opened
// typically actived by please-report-tabs
// relay -> webapp -> browser
report-tabs: {
	tabIds: [ids] // list of tab ids
}

// ask the chrome ext to send a list of the currently active tabIds
// webapp -> relay
please-report-tabs: {}

// Tell the world that a tab has closed
// typically as a response to please-close-tab
// relay -> webapp -> browser
tab-closed: {
	tabId: id
}

// ask the boss to close a tab
// browser -> webapp -> relay
please-close-tab: {
	tabId: id
}

// tell the webapp at a new browser has oped on this port
// browser -> webapp
browser-opened: {}


// tell the world that a new tab has been created
// the tab should spawn a new boss tab or connect to an existing one
// depending on the existance of the tabId
// frame -> webapp -> relay
tab-created: {
	tabId: id
}

// A complete refresh is required on frames with this tabId.
// could be for a new tab, or a page change
// boss -> relay -> webapp (scraped) -> frame
diff-init: {
	tabId: id,
	headId: id,
	bodyId: id,
	ocs: string,
	path: string,
	diff: [jNode],
	url: url
}

// a differential update for the frames with this tabId, for typical 
// page changes
// boss -> relay -> webapp (scraped) -> frame
diff-update: {
	tabId: id
	diff: [jNode],
	url: url
}

// user input event, as triggered by the user
// frame -> webapp (filtered) -> relay -> boss
input-event: {
	tabId: id,
	targetId: id, // jnode target (possibly expired)
	type: string, // dom event type
	// other event-specific info, determined by the type...
}

// move the boss forward/back
// browser -> webapp -> relay
history-forward: {
	tabId: id,
	dist: Number // the distance to move the browser
}

// ask the boss to go to this url
// browser -> webapp -> relay
please-go-to-url: {
	url: url,
	tabId: id
}

// tell all the monkies what the url is
// typically triggered by an init, partial init, or diff update
// relay -> webapp -> browser
report-tab-url: {
	url: url,
	tabId: id
}