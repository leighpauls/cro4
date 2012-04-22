
report-tabs: {
	tabIds: [ids] // list of tab ids
}


close-tab: {
	tabId: id
}

browser-opened: {}

tab-created: {
	tabId: id
}

diff-init: {
	tabId: id,
	headId: id,
	bodyId: id,
	ocs: string,
	path: string,
	diff: [jNode]
}

diff-update: {
	diff: [jNode]
}
