
var debug;
$(function(){
	
	debug = (document.location.href.substr(0,4) == "file");
	
	SetRoot();
	
	ReadList();	
	ShuffleJSONList();
	
	SetInformation();
	
	$("#vedioViewer").hide();
	$("#searchShow").hide();
	$("#explain").hide();
	
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
		
	$("#searchShow").click(function(){	
		$(".unit").show();
		$("#searchShow").hide();		
		$("#cantSearch").hide();
	});
	
	$("#playerBack").click(function(){
		$("#vedioViewer").fadeOut(500,function(){
			$("#player").attr("src","");
		});
	});
	
	$("#explainBtn").click(function(){
		$("#explain").toggle();
	});
	
	$(".vedioView-link[view-index!='']").click(function(){
		var id = $(this).attr("view-index");
		id= "https://www.youtube.com/embed/" + id ;//+ "&autoplay=1";
		$("#player").attr("src",id);
		$("#vedioViewer").fadeIn(500);
	})
	
	
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
	
	
	var T = information["update_time"].split("/");
	var now = new Date();
	var update = new Date(now.getFullYear(),parseInt(T[0])-1,parseInt(T[1]));
	var ago = (now - update)/86400000;
	
	var updateTime = "不知道什麼時候更新的。";
	if (ago < (3 / 24))
		updateTime = "幾小時前更新。";
	else if (ago < 1)
		updateTime = "今天剛更新。";
	else if (ago < 2)
		updateTime = "昨天才更新。";
	else if (ago < 3)
		updateTime = "前天更新。";
	else if (ago < 4)
		updateTime = "三天前更新。";
	else if (ago < 5)
		updateTime = "四天前更新。";
	else if (ago < 7)
		updateTime = "大約一周前更新。";
	else if (ago < 14)
		updateTime = "大約數周前更新。";
	else if (ago < 30)
		updateTime = "大約一個月前更新。";
	
	
	$("#updateTime").text(updateTime);
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
	
	var viewID = GetViewID(unitList[inx]["vedio_link"]);
	
	clone = clone.replace("[view-index]",viewID);
	
	
	return clone;	
}
function GetViewID(vediolink){
	
	//ViewPlayer
	var viewID = "";
	
	if (vediolink != "") {
		var n,e;
		
		var titlelist = [
			"youtube.com/watch?v=",
			"https://youtu.be/"
		]
		var s_title;		
		for (var i=0 ; i <titlelist.length;i++){			
			s_title = titlelist[i];
			var ind = vediolink.indexOf(s_title);
			if (ind != -1) break;
		}		
		n = ind + s_title.length;
		
		if (ind != -1){
			
			e = vediolink.indexOf("&");
			if (e == -1)	e = vediolink.length;	
						
			viewID = vediolink.substring(n,e);
			//alert(vediolink + "\n" + n + " - " + e + " : " + viewID);
		}
	}
	
	return viewID;
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















