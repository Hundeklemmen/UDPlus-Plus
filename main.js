console.log("Uddata++ starting");

//Changes the current Uddata+ logo to the transparent version that allows the color of the navbar to be visible.
$("#navbar>div>div>a>img").attr("src",chrome.extension.getURL("resources/UddataLogo.png"));

//Define the variable curtheme to contain the current theme
var curtheme = "Default";

var homeworkList = ["lektie"];

// <---- HOMEWORK MARKING
//Function for marking the homework
function markHomework(){
	$('.skemaBrikGruppe>g>g>text>title').each(function(index) {
		var toMark = false;
		var arrayLength = homeworkList.length;
		for (var i=0; i < arrayLength; i++) {
			if ($(this).text().toUpperCase().includes(homeworkList[i].toUpperCase())) toMark = true;
		}
		if (toMark) {
			if (typeof themes[curtheme] === "undefined" || typeof themes[curtheme]["homeworkMark"] === "undefined"){
				var homeworkColour = "#ED2939";
			} else {
				var homeworkColour = themes[curtheme]["homeworkMark"];
			}
			$(this).parent().parent().parent().find('rect').each(function () { this.style.setProperty("fill", homeworkColour, 'important' ); });
		}
	});
}

//We need to use this function to load all the settings
function loadSettings() {

	//Keywords for checking homework
	getStorage({homeworkWords: "lektie,forbered"}, function(obj) {
		if (!chrome.runtime.error) {
			homeworkList = obj.homeworkWords.split(",");
			//We have to remove the empty elements, or everything will be matched as homework.
			for (var i=0; i < homeworkList.length; i++) {
				homeworkList[i] = homeworkList[i].replace(/\s/g, "");
				if (homeworkList[i] == "") homeworkList.splice(i, 1);
			}
			if (homeworkList == [""]) homeworkList.splice(0, 1);
		}
	});

	//Get the homework setting
	var homeworkCheckerInterval;
	getStorage('homework', function (obj) {
		if (!chrome.runtime.error) {
			//If the schedule object exists and the homework setting is true, setup interval to mark
			if (window.location.href.indexOf("skema")) {
				if(obj.homework){
					//Interval to mark homework, they will be marked when they load in
					clearInterval(homeworkCheckerInterval);
					homeworkCheckerInterval = setInterval(function() {
						markHomework();
					}, 250);
				}
			}
		}
	});

	getStorage('theme', function (obj) {
		if (!chrome.runtime.error) {
			curtheme = obj.theme;
			runTheme();
		}
	});

}

//Save the language selected on Uddata+
if($("#language > a").html() == "English"){
	setStorage({"lang": "dansk"});
}else{
	setStorage({"lang": "engelsk"});
}


//On the download on class notes, we set the title attribute to the download attribute. Then, if the full title ends up in the overflow, you can mouse over it to see it anyway.
function setTitleToDownload() {
	$( "a[download]" ).each(function( index ) {
		$(this).attr("title", $(this).attr("download"));
	});
}
setInterval(setTitleToDownload, 250);

loadSettings();

chrome.storage.onChanged.addListener(function(changes, namespace) {
	//Try to import the theme from the settings storage
	loadSettings();
});


//Changes color off each element in the current theme
function runTheme(){
	$('.UDPPCustom').remove();
	for (var T in themes[curtheme]) {
		if(T != "homeworkMark"){
			changeColor(colorElements[T], themes[curtheme][T]);
		}
	}
}

//When the document is ready remove the sidebar collapse button, which is broken
$(document).ready(function(){
	$("#sidebar-collapse").show();
	getStorage('hideSidebarCollapse', function (obj) {
		if (!chrome.runtime.error) {
			if(obj.hideSidebarCollapse){
				$("#sidebar-collapse").hide();
			}
		}
	});
});

//Wait for change in theme from popup
chrome.runtime.onMessage.addListener(
		function(request, sender, sendResponse) {
			if (request.type == "theme"){
				curtheme = request.theme;
				location.reload();
			}
		}
		);



//The ++Settings menu button
var extraMenu = '<li><a ontouchend="javascript:uddata_activ_menu(\'id_settings\');" href="#" id="id_settings"><i class="icon-wrench"></i> <span class="menu-text" title="Settings">++ Settings</span></a></li>';

//Finds the left navbar and appends extraMenu
$('html body.hoverable div#wrapper div#wrapcontent div.main-container.container-fluid div#sidebar.sidebar ul.nav.nav-list').append(extraMenu);

//Adds the function of sending a message to the background script, to the ++settings button
$('#id_settings').click(function(){
	chrome.runtime.sendMessage({optionsClick: true});
});
