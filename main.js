
var debug;
$(function(){
	
	debug = (document.location.href.substr(0,4) == "file");
	
	SetRoot();
	
	ReadList();	
	ShuffleJSONList();
	
	SetInformation();
	
	AppendUnit();
	
	$("#serachBtn").click(function(){
		Search($("#search").val());
		$("#search").blur();
	});
	
	$("#search").keypress(function(e){
		if(e.which == 13){
			if ($("#search").val() == ""){
				root.html("");
				AppendUnit();
			}
			else{				
				Search($("#search").val());
			}
			$("#search").blur();
		}	
	})
	
	$("#backAllList").hide();
	$("#backAllList").click(function(){		
		root.html("");
		AppendUnit();
	});
});

function SetInformation(){
	
	$("#updateTime").text(information["update_time"]);
	$("#bulletin").text(information["bulletin"]);
	$("#hotTags").html(MakeTags(information["hot_tags"]));
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
	"vedio_link"
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
	""
];

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
	if (unitList[inx]["status"] == "") 	return null;
	
	clone = clone.replace("[id]","unit-" + inx).replace("[index]",inx);
	
	for (var i=0; i<unitPropertyList.length;i++){
		var unitProperty = unitList[inx][unitPropertyList[i]];
		if (unitProperty == "") unitProperty = unitDefaultProperty[i];
		
		if (unitPropertyList[i] == "tags") unitProperty = MakeTags(unitProperty);
		
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
	
	$("#backAllList").hide();
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
	
	root.html("");
	
	$("#search").val(txt);
	$("#backAllList").show();
	
	var conf_count = 0;
	for ( var i=0; i<unitList.length; i++ ){
		
		var unit = unitList[i];		
		if (unit != null){
			
			var conf = false;
			for(var p=0; p<unitPropertyList.length ;p++){
				var property = unitPropertyList[p];
				
				if (property=="description") continue;
				if (property=="picture") continue;
				if (property=="site_link") continue;
				if (property=="vedio_link") continue;
				
				if (unit[property].toUpperCase().indexOf(txt.toUpperCase()) != -1){
					conf = true;
					break;
				}
			}
			
			if(conf == true){			
				conf_count++;
				var unit = CreateUnit(i);
				$("#root").append(unit);
			}			
		}		
	}
	
	if (conf_count == 0){
		$("#root").append("<br><br><div style='opacity:0.5;'><h3>糟糕</h3><p>找不到符合的資料</p></div><br>");
	}
	else{
		RegEvent();
	}
		GoTop();	GoTop();
	
}



function RegEvent(){
	
	$(".unit").each(function(){
		$(this).click(function(){
			$(this).toggleClass("fold");
		});
	});
	
	$(".tags p").each(function(){
		$(this).click(function(){
			var str = $(this).text();			
			Search(str);
		});
	})
	
	$(".university p").each(function(){
		$(this).click(function(){
			var str = $(this).text();			
			Search(str);
		});
	})
}


function GoTop(){	
	$("html,body").animate({scrollTop: 0}, 300);
}













