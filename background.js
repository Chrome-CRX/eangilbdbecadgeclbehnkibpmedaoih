//TODO: string comparison?
var mode = 2; //global variables
var tempMode = 0;

function allow() {
	tempMode = 1;
}

function updateIcon(mode){
	if (mode == 2) chrome.browserAction.setIcon({path:"images/iconRIGHT.png"});
	else if (mode == 0) chrome.browserAction.setIcon({path:"images/iconOFF.png"});
	else chrome.browserAction.setIcon({path:"images/iconLEFT.png"});
}

function initContext() {
	chrome.contextMenus.create({"title": "Allow next duplicate", "id": "Allow next duplicate", "contexts": ["all"]});
	chrome.contextMenus.onClicked.addListener(({contextMenuId}) => {if (contextMenuId == "Allow next duplicate") {allow()}});
}

//Initializes mode;
$(document).ready( function() {
	mode = localStorage["mode"];
	if (!mode) mode = 2;
	
	clickMode = localStorage["rightclick"];
	if (!clickMode || clickMode == 0) initContext();
	
	chrome.tabs.getAllInWindow(null, function(tabs) {
		var myURLs = new Array(); 
		for (var i = tabs.length-1; i >= 0 ; i--){
			if (myURLs.indexOf(tabs[i].url) == -1) { //Keep one copy of the URL
			  myURLs.push(tabs[i].url);
			  deDup(tabs[i].id, null, tabs[i]);
			}
		}
	});
	updateIcon(mode);
});

function safe(list, URL1, URL2){
	var word = "";
	for (var i = 0; i < list.length; i++) {
		word = list[i];
		if (URL2.indexOf(word) != -1) return 1;
	} 
	return 0;
}

//Prevents duplicates
chrome.tabs.onUpdated.addListener(deDup);


function deDup(tabId, changeInfo, tab) {
	mode = localStorage["mode"];
	if (!mode) mode = 2;
	if (mode == 0) return;
	if (changeInfo && !changeInfo.url) return;
	
	var list = new Array();
	if (!localStorage.getItem("ignore")) list = [];
	else list = localStorage.getItem("ignore").split('&#3;');
	
	//TODO: santize url for comparison
	
	chrome.tabs.getAllInWindow(null, function(tabs) {
		var numDeletedToLeft=0;
		for (var i = tabs.length-1; i >= 0 ; i--){
			if (tabs[i].id == tab.id) continue;
			if (tabs[i].url === tab.url) {
				if (safe(list, tabs[i].url, tab.url) == 1) continue;
				if (tabs[i].pinned && mode == 2) continue;
				if (tempMode == 1) {
					tempMode = 0;
					return;
				}
				if (mode == 1 && tab.url != "chrome://newtab/") { //Remove new duplicate (Work around for omnibar focus on new tabs: Handled with mode = 2) 
					if (tabs[i].index < tab.index) numDeletedToLeft++;
					chrome.tabs.remove(tabId);
					tabId = tabs[i].id; //removes all exisiting duplicates
				} else { //Remove old duplicate
					chrome.tabs.remove(tabs[i].id);
				}
			}
		}
		if (mode == 1 && tab.url != "chrome://newtab/") {
			chrome.tabs.move(tabId, {'index':tab.index-numDeletedToLeft});
			if (tab.selected && tabId != tab.id) chrome.tabs.update(tabId, {'selected':true}); //Ensures changing selected tab only once
		}
	});
}

//Changes mode
chrome.browserAction.onClicked.addListener(function() {
	if (mode == 2) mode = 0;
	else if (mode == 0) mode = 1;
	else mode = 2;
	updateIcon(mode);
	localStorage["mode"] = mode;
});
