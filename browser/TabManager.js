function TabManager() {
	var me = this;
	this.tabs = new StrMap();
	this.socket = null;
	this.currentTab = null;

	this.newTabButton = $('.new-tab-button')
		.on('click', function() {
			me.createTab();
		});
}

// loads the events into the socket that need to be handled here
TabManager.prototype.prepareSocket = function(socket) {
	var me = this;
	
	this.socket = socket;
	
	socket.on("report-tabs", function(reportTabInfo) {
		var tabIds = reportTabInfo.tabIds
		, i;
		for ( i = 0; i < tabIds.length; ++i) {
			me.createTab(tabIds[i]);
		}
	});
	
	// when another browser closes a tab
	socket.on("close-tab", function(closeInfo) {
		this.closeTab(closeInfo.tabId);
	});

	// ask the server to give me the tabs
	this.socket.emit("browser-opened", {});
};

TabManager.prototype.createTab = function(tabId) {
	var me = this
	, newTab;

	if (!tabId) {
		// this is a new tab
		tabId = generateId();
	}

	newTab = new Tab({
		tabId: tabId,
		selectTab: function () {
			me.selectTab(tabId);
		},
		closeTab: function () {
			me.closeTab(tabId);
		}
	});

	// no need to inform the server that I'm opening,
	// the frame will do that for me

	// add the tab ui elements
	this.tabs.put(tabId, newTab);

	// set as default tab if needed
	if (!this.currentTab) {
		this.selectTab(tabId);
	}
};

TabManager.prototype.selectTab = function(tabId) {
	var i, selectedTab;

	if (this.currentTab) {
		this.currentTab.unselect();
	}

	selectedTab = this.tabs.get(tabId);
	selectedTab.select();

	this.currentTab = selectedTab;
};

TabManager.prototype.closeTab = function(tabId) {
	var closingTab = this.tabs.get(tabId);

	if (!closingTab) {
		// I've already closed it
		return;
	}
	
	// unselect the tab if applicable
	if (this.currentTab === closingTab) {
		closingTab.unselect();
		this.currentTab = null;
	}
	// stop rendering the tab
	closingTab.remove();

	// forget the tab
	this.tabs.remove(tabId);

	// tell the boss that the tab is closing
	this.socket.emit("close-tab", {
		tabId: tabId
	});
};
