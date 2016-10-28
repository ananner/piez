var PiezController = {};
PiezController.current_page = new Page();
chrome.storage.local.get('piezCurrentState', function(result) {
    PiezController.current_display_mode = result['piezCurrentState'] || 'piezModeImSimple';
    showSummaryTable(PiezController.current_display_mode); //choose correct summary header before page actually loads
});
var port = chrome.runtime.connect({name:'piez'});

function parseImResponse(http_transaction) {
    ParseHeaders(http_transaction, PiezController.current_page, PiezController.current_display_mode);
    Report(PiezController.current_page, PiezController.current_display_mode);
}

function newPageRequest(url) {
    hideDetails(PiezController.current_display_mode);
    PiezController.current_page = new Page();
    port.postMessage({
        type: "update-piez-analytics"
    });
    chrome.storage.local.get('piezCurrentState', function(result) {
        PiezController.current_display_mode = result['piezCurrentState'] || 'piezModeImSimple';
        if (PiezController.current_display_mode === 'piezModeA2') {
            PiezController.current_page.A2Started = true;
            displayA2Loading(PiezController.current_page, PiezController.current_display_mode);
            port.postMessage({type:'a2PageLoad'});
        }
    });
}

window.onload = function() {
    port.postMessage({type:'inspectedTab', tab: chrome.devtools.inspectedWindow.tabId});
    chrome.devtools.network.onRequestFinished.addListener(parseImResponse);
    chrome.devtools.network.onNavigated.addListener(newPageRequest);
};


port.onMessage.addListener(function(message) {
    switch(message.type) {
        case 'a2PageLoaded':
            chrome.devtools.network.getHAR(function(har) {
                PiezController.current_page.pageLoaded = true;
                if (PiezController.current_display_mode === 'piezModeA2') {
                    ParsePageA2(har, PiezController.current_page);
                }
                Report(PiezController.current_page, PiezController.current_display_mode);
            });
            break;
        default:
            console.log('unexpected message on background port: ', message);
            break;
    }
});
