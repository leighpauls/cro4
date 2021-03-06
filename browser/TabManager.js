function TabManager(socket) {
	var me = this;
	this.tabs = new StrMap();
	this.socket = socket;
	this.currentTab = null;

	this.newTabButton = $('.new-tab-button')
		.on('click', function() {
			me.createTab();
		});
	
	socket.on("report-tabs", function(reportTabInfo) {
		var tabIds = reportTabInfo.tabIds
		, i;
		for ( i = 0; i < tabIds.length; ++i) {
			if (!me.hasTab(tabIds[i])) {
				me.createTab(tabIds[i]);
			}
		}
	});
	
	// when another browser closes a tab
	socket.on("tab-closed", function(closeInfo) {
		me.closeTab(closeInfo.tabId);
	});

	// ask the server to give me the tabs
	this.socket.emit("browser-opened", {});
}

TabManager.prototype.hasTab = function(tabId) {
	return this.tabs.get(tabId) ? true : false;
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
			// tell the boss that the tab is closing
			me.socket.emit("please-close-tab", {
				tabId: tabId
			});
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

	$(this).trigger('tab-changed');
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
		$(this).trigger('tab-changed');
	}
	// stop rendering the tab
	closingTab.remove();

	// forget the tab
	this.tabs.remove(tabId);
};

TabManager.prototype.getCurrentTabId = function() {
	if (this.currentTab) {
		return this.currentTab.getTabId();
	}
	return null;
};
