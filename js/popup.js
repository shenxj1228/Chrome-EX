$(document).ready(function() {
    $('#login').click(function() {
        chrome.extension.getBackgroundPage().checkMainTab();

    });
	$('#refresh').click(function(){
		localStorage.taskrows='';
		chrome.extension.getBackgroundPage().first_time='';
		chrome.extension.getBackgroundPage().conEMail();
		chrome.extension.getBackgroundPage().taskNotification();
		window.close();
	});
	var mailcount=localStorage.mailCount;
	$('#mail').text(mailcount);
    var taskrows = JSON.parse(localStorage.taskrows);
    if (taskrows.length == 0) {
        var text = '<div style="-webkit-margin-after: 1em;">没有需要办理的事项</div>';
        $(text).appendTo('#taskList');

    } else {
        for (var i = 0; i < taskrows.length; i++) {
            var atxt = taskrows[i].JJR + "→(^o^)→" + taskrows[i].AJMC;
            var a = "<a style='-webkit-margin-after: 1em;' name='tasklink' href='#' instanceid="+taskrows[i].INSTANCEID+" stepid="+taskrows[i].StepID+" >" + atxt + "</a>";
            $(a).appendTo('#taskList');
		}
		
    }
	$("a[name='tasklink']").one("click", 
    function() {
        var insid = $(this).attr('instanceid');
        var stepid = $(this).attr('stepid');
        OpenDoingWin(insid, stepid);

    });
	$("#showhosts").click(function(){
	$("#hosts").slideToggle(500);
	});
});

function OpenDoingWin(receiveNo, stepID) {
    localStorage.PostAction = "taskID:" + receiveNo + '~' + stepID;
    chrome.extension.getBackgroundPage().checkMainTab();

}