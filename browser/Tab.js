// args:
// TabID - Id of this tab, made up, or reported by the server
// selectTab function(Tab) - show this tab when called
// closeTab function(Tab) - close this tab when called
function Tab(args) {
	var me = this;
	this.tabId = args.tabId;

	this.iframe = $('<iframe>')
		.attr('src',
			  'http://cro4.com/frame/monkeyFrame.html#t=' + this.tabId)
		.addClass('content-frame')
		.css('display', 'none'); // hidden by default

	this.tabTitle = $('<div>')
		.addClass('helem', 'tab-title')
		.text('New Frame!') // TODO: find the title
		.on('click', function () {
			args.selectTab();
		});

	this.closeButton = $('<div>')
		.addClass('helem')
		.text('[X]')
		.on('click', function () {
			args.closeTab();
		});

	this.tabTitle.append(this.closeButton);

	$('.frame-area').append(this.iframe);
	$('.tab-list').append(this.tabTitle);
}

Tab.prototype.select = function() {
	// TODO: take control of the forward/back/omnibox
	this.iframe.css('display', 'block');
};

Tab.prototype.unselect = function() {
	// TODO: release control of the forward/back/omnibox
	this.iframe.css('display', 'none');
};

Tab.prototype.remove = function() {
	this.iframe.remove();
	this.tabTitle.remove();
};

Tab.prototype.getTabId = function() { return this.tabId; };
