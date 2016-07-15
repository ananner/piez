beforeSendCallback = function(details) {
	if(details.url.indexOf('http') != -1) {
		chrome.cookies.set({ url: getCookiesUrl(details.url), name: "im-debug", value: "basic" });
	}
	return {requestHeaders: details.requestHeaders};
};

var onMessageListener = function(message, sender, sendResponse) {
		switch(message.type) {
				case "bglog":
						console.log(message.obj);
				break;
		}
		return true;
}

var piezToggle = new PiezToggle();
chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {
		switch(request.type) {
				case "piez-off":
					piezToggle.turnPiezOff();
					break;
				case "piez-simple":
					piezToggle.turnPiezOnSimple();
					break;
				case "piez-advanced":
					piezToggle.turnPiezOnAdvanced();
					break;
				case "use-piez-on-page":
					chrome.tabs.getSelected(null, function(tab) {
							logUrlAnalytics(tab);
					});
					break;
		}
		return true;
});

var getCookiesUrl = function(href) {
	var link = document.createElement("a");
	link.href = href;
	return('http://' + link.hostname);
}

var logUrlAnalytics = function(tab) {
	(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
	(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
	m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
	})(window,document,'script','https://www.google-analytics.com/analytics.js','ga');

	ga('create', 'UA-62551710-2', 'auto');
	ga('set', 'checkProtocolTask', function(){});
	ga('require', 'displayfeatures');
	ga('send', 'pageview', tab.url);
}