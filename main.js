
var debug;
$(function(){
	
	debug = (document.location.href.substr(0,4) == "file");
	
	SetRoot();
	
	ReadList();	
	ShuffleJSONList();
	
	SetInformation();
	
	$("#searchShow").hide();
	
	SetSearchSetting_Sample();
	AppendUnit();
	
	HashCheck();
	
	$("#serachBtn").click(function(){
		StartSearch();
	});
	
	$("#search").keypress(function(e){
		if(e.which == 13){
			StartSearch();
		}	
	})
	
	$("#toolBarToggle").click(function(){
		$("#toolBar").toggle();
	});
	
	
	$("#backAllList").click(function(){	
		$(".unit").show();
		$("#searchShow").hide();		
		$("#cantSearch").hide();
	});
	
	$(window).bind("hashchange",function(){
		HashCheck();
	});
	
});

function StartSearch(){
	if ($("#search").val() == ""){
		root.html("");
		AppendUnit();
	}
	else{				
		SetSearchSetting_Sample();
		Search($("#search").val());
	}
	$("#search").blur();
}
function SetInformation(){
	
	$("#updateTime").text(information["update_time"]);
	$("#bulletin").html(information["bulletin"]);
	$("#hotTags").html(MakeTags(information["hot_tags"]));
}

function HashCheck(){
	
	if(location.hash == "") return false;
	
	var url_hash = location.hash.replace("#","");
	url_hash = decodeURIComponent(url_hash);	//解碼
			//encodeURIComponent(url_hash));	//轉碼
	
	var sp = url_hash.indexOf("=");
	if (sp != -1){
		var head = url_hash.substring(0, sp);
		var tail = url_hash.substr(sp + 1);

		var searchHeadList = head.split(",");
		SetSearchSetting(searchHeadList);
		Search(tail);
	}
	
	return true;
}

function RegEvent(){
	
	$(".unit").each(function(){
		$(this).click(function(){
			$(this).toggleClass("fold");
		});
	});	
	
	$(".university p:first-child, .tags p").each(function(){
		$(this).click(function(){
			var str = $(this).text();
			SetSearchSetting_Sample();
			Search(str);
		});
	})	
	
	$(".linkDiv a[href='']").addClass("deadLink").removeAttr("href");
	
}


function GoTop(){	
	$("html,body").animate({scrollTop: 0}, 300);
}

var unitPropertyList = [
	"title",
	"type",
	"tags",
	"university",
	"department",
	"team",
	"description",
	"picture",
	"site_link",
	"vedio_link",
	"id"
];
var unitDefaultProperty = [
	"沒有標題",
	"",
	"",
	"？",
	"？",
	"未知的團隊",
	"尚無內容。",
	"pic/mango_sq.svg",
	"",
	"",
	""
];
var SearchSetting;

function SetSearchSetting(T){
	
	if (Array.isArray(T) == true){
		SetSearchSetting(false);		
		for(var i=0;i<T.length;i++){
			SearchSetting[T[i]] = true;
		}
	}
	else{
		for(var i=0;i<unitPropertyList.length;i++){
			SearchSetting[unitPropertyList[i]] = (T == true);
		}
	}
}	

function SetSearchSetting_Sample(){	
	SearchSetting = {
		"title":true,
		"type":true,
		"tags":true,
		"university":true,
		"department":true,
		"team":true,
		"description":false,
		"picture":false,
		"site_link":false,
		"vedio_link":false,
		"id":true
	};
}


var model;
var root;
	
function SetRoot(){
	root = $("#root");
	model = root.html();
	root.html("");
}

function CreateUnit(inx){			
	var clone = model;
	
	
	if (unitList[inx] == null) 			return null;
	if (unitList[inx]["id"] == "") 		return null;
	
	
	for (var i=0; i<unitPropertyList.length;i++){
		
		
		var unitProperty = unitList[inx][unitPropertyList[i]];
		if (unitProperty == "") unitProperty = unitDefaultProperty[i];
		
		if (unitPropertyList[i] == "tags") unitProperty = MakeTags(unitProperty);	
		if (unitPropertyList[i] == "id") clone = clone.replace(/\[id]/g,unitProperty).replace("[index]",inx);
		
		clone = clone.replace("[" + unitPropertyList[i] + "]", unitProperty);
		
	}	
	return clone;	
}

function MakeTags(tags){
	
	if (tags == "") return "";
	
	var arr = tags.split(" ");
	var ret = "";	
	
	for (var i=0;i<arr.length;i++){
		if (arr[i] != ""){
			ret += "<p>" + arr[i] + "</p>";
		}
	}
	
	return ret;
}

function AppendUnit(){	
	
	for ( var i=0; i<unitList.length; i++ ){
		var unit = CreateUnit(i);
		if (unit != null){
			root.append(unit);
		}
	}
	RegEvent();
	GoTop();
	
}



var unitList;
var information;

function ReadList(){
		
	$.get({
		url:"data.json",
		dataType: "json",
		timeout: 1000,
		error: function() {
			$("#welcomeMsgWord").text("讀取資料失敗，請重新整理");
		},
		success: function(data) {
			unitList = data["Mango"];
			information = data["Information"]
			WelcomLogoFade();
		},
		async :false
	});
	
}

function WelcomLogoFade(){	
	
	if (debug){
		$("#welcome").hide();
	}
	else{
		var n = (Math.random()*1000) + 1000;
		$("#welcome").delay(n).fadeOut(500);
	}
	
}

function ShuffleJSONList(){
	unitList =  Shuffle(unitList);
}
function Shuffle(array) {
	var currentIndex = array.length, temporaryValue, randomIndex ;

	while (0 !== currentIndex) {
		randomIndex = Math.floor(Math.random() * currentIndex);
		currentIndex -= 1;

		temporaryValue = array[currentIndex];
		array[currentIndex] = array[randomIndex];
		array[randomIndex] = temporaryValue;
	}

	return array;
}



function Search(txt){	
	
	if (txt == "") 		return;
			
	$(".searchTxt").text(txt);
	$("#searchShow").show();
	
	var list = [];
	for ( var i=0; i<unitList.length; i++ ){
		
		var unit = unitList[i];
		
		if (unit == null) 		continue;
		if (unit["id"] == "") 	continue;		
			
		for(var p=0; p<unitPropertyList.length ;p++){
			var property = unitPropertyList[p];
			if (SearchSetting[property] == false) continue;
			if (unit[property].toUpperCase().indexOf(txt.toUpperCase()) != -1){
				list.push(i);
				break;
			}
		}	
	}
	
	if (list.length > 0){
		MakeList(list);
		$("#cantSearch").hide();
	}
	else{
		$(".unit").hide();
		$("#cantSearch").show();
	}
		
	GoTop();
		
}

function MakeList(arr){
	
	$(".unit").hide();
	for (var i=0;i<arr.length;i++){
		$("#" + unitList[arr[i]]["id"]).show();
	}
}















