//是否启用
function ghost(noActivated) {
	var tmp = !noActivated;
	$("#walkUsername").each(function () {
		$(this).attr('disabled', tmp);
	});
	// The control manipulability.
	$("#walkPassword").each(function () {
		$(this).attr('disabled', tmp);
	});

	chrome.extension.getBackgroundPage().remind();

}

//判断是否打开新增提醒页面
function loadWindowList(xh) {
	var windowidList = [];
	var windowurlList = [];
	chrome.windows.getAll({
		populate : true
	},
		function (windowList) {
		for (var i = 0; i < windowList.length; i++) {
			windowidList.push(String(windowList[i].id));
			for (var j = 0; j < windowList[i].tabs.length; j++) {
				windowurlList.push(windowList[i].tabs[j].url);

			}
			windowurlList.push(windowList[i].url);

		}
		if ((windowidList.indexOf(localStorage.add_window) > -1 && xh == -1) || windowurlList.indexOf(window.location.href.replace('options', 'add').replace('#', '') + '?xh=' + xh) > -1) {
			chrome.windows.update(parseInt(localStorage.add_window, 10), {
				focused : true
			});

		} else {
			openaddHtml(xh);

		}

	});

}

//打开提醒页面
function openaddHtml(xh) {
	var ileft = (window.screen.width - 730) / 2;
	var iheight = 800;
	if (window.height <= 800) {
		iheight = window.height;

	}
	chrome.windows.create({
		url : "add.html?xh=" + xh + "",
		left : ileft,
		width : 730,
		height : iheight,
		type : "popup"
	},
		function (window) {
		localStorage.add_window = window.id;
	});

}

//删除行
function delRow() {
	if ($("a[name='checkSel'][class='divCheckBoxSel']").length === 0) {
		$("#tipinfo").text('没有选择行');
		showtip('tip', 'tipinfo');
		setTimeout(function () {
			closetip('tip');
		},
			2000);

	} else {
		$("a[name='checkSel'][class='divCheckBoxSel']").each(function () {
			var myDB = chrome.extension.getBackgroundPage().myDB;
			var storeName = localStorage.storeName;
			var delId = $(this).attr('id').replace($(this).attr('name') + '-', '');
			chrome.extension.getBackgroundPage().deleteDataByKey(myDB.db, storeName, delId);
			$("a[name='checkSel'][class='divCheckBoxSel']").parent().parent().fadeOut(600, function () {
				$("a[name='checkSel'][class='divCheckBoxSel']").parent().parent().remove();
			});

		});

	}

}

//checkBOX加载
function clickCbx() {
	$("#remindTab").on("click", "a[name='checkSel']",
		function () {
		if ($(this).hasClass('divCheckBoxSel')) {
			$(this).removeClass('divCheckBoxSel').addClass('divCheckBoxNoSel');

		} else {
			$(this).removeClass().addClass('divCheckBoxSel');

		}

	});
	$("#remindTab").on("click", "a[id='checkAllSel']",
		function () {
		if ($(this).hasClass('divCheckBoxSel')) {
			$(this).removeClass().addClass('divCheckBoxNoSel');
			$("a[name='checkSel']").removeClass().addClass('divCheckBoxNoSel');

		} else {
			$(this).removeClass().addClass('divCheckBoxSel');
			$("a[name='checkSel']").removeClass().addClass('divCheckBoxSel');

		}

	});

	$("#remindTab").on('change', "input[name='isuse']",
		function () {
		var zt;
		var myDB = chrome.extension.getBackgroundPage().myDB;
		var storeName = localStorage.storeName;
		var transaction = myDB.db.transaction(storeName, 'readwrite');
		var store = transaction.objectStore(storeName);
		var updateId = $(this).attr('id').replace($(this).attr('name') + '-', '');
		var request = store.get(updateId);
		if ($(this).is(':checked')) {
			$(this).parent().css('background', '#26ca28');
			zt = true;

		} else {
			$(this).parent().css('background', '#bbbbbb');
			zt = false;

		}
		request.onsuccess = function (e) {
			var remindinfo = e.target.result;
			remindinfo.state = zt;
			store.put(remindinfo);
			chrome.extension.getBackgroundPage().remind();

		};

	});

}
//提醒列表加载
function tab_ready() {
	var cunt = 0;
	var myDB = chrome.extension.getBackgroundPage().myDB;
	var storeName = localStorage.storeName;
	var transaction = myDB.db.transaction(storeName, 'readwrite');
	var store = transaction.objectStore(storeName);
	var cursorRequest = store.openCursor();
	$("tbody").empty();
	cursorRequest.onsuccess = function (e) {
		var cursor = e.target.result;
		if (cursor) {
			//console.log(cursor.value.hour);
			if (cursor.key !== '') {
				var id = cursor.key;
				var state = cursor.value.state;
				var hour = cursor.value.hour;
				var minute = cursor.value.minute;
				var title = cursor.value.title;
				var content = cursor.value.content;
				var url = cursor.value.url;
				var weeks = cursor.value.timefrequencys;
				var remindWeek = "";
				var isuse;
				var isuesid = "isuse-" + id;
				var timeid = "time-" + id;
				var checkSelid = "checkSel-" + id;
				if (weeks == '-1') {
					remindWeek = '一次';

				} else {
					if (weeks.split(',').length == 7) {
						remindWeek = '每天';

					} else {
						var weekarry = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
						for (var j = 0; j < weeks.split(',').length; j++) {
							remindWeek += weekarry[parseInt(weeks.split(',')[j], 10)] + ' ';

						}

					}

				}
				if (state) {
					isuse = 'checked="true"';

				} else {
					isuse = "";
				}
				var newRow = $('<tr><th><a name="checkSel" id=' + checkSelid + ' class="divCheckBoxNoSel"></a></th><th><div id="sliding" class="labelBox"><input type="checkbox"  id=' + isuesid + ' name="isuse" ' + isuse + '><label for=' + isuesid + ' class="check"></label></div></th><th><a id=' + timeid + ' name=time href="#" >' + hour + ':' + minute + '(' + remindWeek + ')</a></th><th><div name="title"    >' + title + '</div></th><th><div  name="content" >' + content + '</div></th><th><a name="addrs" href=' + url + ' target="_blank" >' + url + '</a></th></tr>');
				//$("table[name='remindTab']").empty();
				
				$("table[name='remindTab']").append(newRow);
				$("a[name='time']").each(function () {
					$(this).off().on('click',
						function () {
						loadWindowList($(this).attr('id').replace('time-', ''));

					});

				});
				$("input[name='isuse']").each(function () {
					if ($(this).is(':checked')) {
						$(this).parent().css('background', '#26ca28');

					} else {
						$(this).parent().css('background', '#bbbbbb');

					}

				});

			}
			cursor.
			continue();

		}

	};

}
//将内容下载到本地
function downloadFile(fileName, content) {
	var aLink = document.createElement('a');
	var blob = new Blob([content]);
	var evt = document.createEvent("HTMLEvents");
	evt.initEvent("click", false, false);
	aLink.download = fileName;
	aLink.href = URL.createObjectURL(blob);
	aLink.dispatchEvent(evt);

}

//弹出框加载
function Dialog_ready() {
	//提交按钮
	$("#dialog").on('click', "#ok",
		function () {
		var content = [];
		var str = $("#inportcontent").val();
		if ($.trim(str) === "") {
			$("#tipinfo").text('导入的文件内容为空！');
			showtip('tip', 'tipinfo');
			setTimeout(function () {
				closetip('tip');
			},
				2000);
			return false;

		}
		content = str.split('\n');
		var info = "";
		var reminds = [];
		for (var i = 0; i < content.length; i++) {
			var new_arry = content[i].split('~');
			if (new_arry.length != 8) {
				if (i === 0) {
					info = i + 1;

				} else {
					info += '、' + (i + 1);

				}

			} else {
				var remind = {
					id : new_arry[0],
					hour : new_arry[1],
					minute : new_arry[2],
					title : new_arry[3],
					content : new_arry[4],
					url : new_arry[5],
					state : new_arry[6],
					timefrequencys : new_arry[7]
				};
				reminds.push(remind);

			}

		}
		var myDB = chrome.extension.getBackgroundPage().myDB;
		var storeName = localStorage.storeName;
		chrome.extension.getBackgroundPage().addData(myDB.db, storeName, reminds);
		if (info === "") {
			setTimeout(function () {
				location.reload();
			},
				100);

		} else {
			if (info.length > 20) {
				$("#tipinfo").text('错误行数太多，请检查文件是否正确.');
				showtip('tip', 'tipinfo');
				setTimeout(function () {
					closetip('tip');
				},
					2000);

			} else {
				$("#tipinfo").text('第' + info + '行' + '存在问题.');
				showtip('tip', 'tipinfo');
				setTimeout(function () {
					closetip('tip');
				},
					2000);

			}
		}

	});

	//上传按钮
	$("#dialog").on('click', "#upFileBtn",
		function () {
		$("#upfile").click();

	});
	$("#dialog").on('change', "#upfile",
		function () {
		var resultFile = $("#upfile")[0].files[0];
		if (resultFile) {
			var reader = new FileReader();
			reader.readAsText(resultFile, 'utf-8');
			reader.onload = function (e) {
				var textarea = '<textarea id="inportcontent" rows="6" readonly="readonly" wrap="off"></textarea>';
				var urlData = this.result;
				$("#drop_div")[0].innerHTML = "";
				$("#drop_div").append(textarea);
				$("#inportcontent")[0].innerHTML = urlData;

			};

		}

	});

	//拖拽上传


	$('#dialog').on(
		'dragover',
		function (e) {
		e.preventDefault(); //阻止默认事件
		e.stopPropagation(); //不再派发事件

	});
	$('#dialog').on(
		'dragenter',
		function (e) {
		e.preventDefault();
		e.stopPropagation();

	});
	$("#dialog").on('drop',
		function (e) {
		if (e.originalEvent.dataTransfer) {
			if (e.originalEvent.dataTransfer.files.length) {
				e.preventDefault();
				e.stopPropagation();
				if (e.originalEvent.dataTransfer.files[0].type.indexOf('text') === -1) {
					$("#tipinfo").text("您拖入的不是txt文件");
					showtip('tip', 'tipinfo');
					setTimeout(function () {
						closetip('tip');
					},
						2000);
					return false;

				}
				var reader = new FileReader();
				reader.readAsText(e.originalEvent.dataTransfer.files[0], 'utf-8');
				reader.onload = function (e) {
					var textarea = '<textarea id="inportcontent" rows="6" readonly="readonly" wrap="off"></textarea>';
					var urlData = this.result;
					$("#drop_div")[0].innerHTML = "";
					$("#drop_div").append(textarea);
					$("#inportcontent")[0].innerHTML = urlData;

				};

			}

		}

	});

	//关闭按钮
	$("#dialog").on('click', "#close",
		function () {
		hideDialog('dialog');
		hideOverlay();
		$("#dialog").empty();

	});

}

//按钮加载
function button_ready() {
	//增加按钮
	$("#addbtn").click(function () {
		loadWindowList('-1');

	});
	//删除按钮
	$("#delbtn").click(function () {
		delRow();

	});
	//导出按钮
	$("#exportbtn").click(function () {
		var myDB = chrome.extension.getBackgroundPage().myDB;
		var storeName = localStorage.storeName;
		var transaction = myDB.db.transaction(storeName, 'readwrite');
		var store = transaction.objectStore(storeName);
		var cursorRequest = store.openCursor();
		var i = 0;
		var str = "";
		cursorRequest.onsuccess = function (e) {
			var cursor = e.target.result;
			if (cursor) {
				if (i === 0) {
					str = chrome.extension.getBackgroundPage().guid() + '~' + cursor.value.hour + '~' + cursor.value.minute + '~' + cursor.value.title + '~' + cursor.value.content + '~' + cursor.value.url + '~' + cursor.value.state + '~' + cursor.value.timefrequencys;

				} else {
					str = str + '\r\n' + chrome.extension.getBackgroundPage().guid() + '~' + cursor.value.hour + '~' + cursor.value.minute + '~' + cursor.value.title + '~' + cursor.value.content + '~' + cursor.value.url + '~' + cursor.value.state + '~' + cursor.value.timefrequencys;

				}
				i++;
				cursor.
				continue();

			}

		};
		setTimeout(function () {
			if (i === 0) {
				$("#tipinfo").text('没有可以导出的内容');
				showtip('tip', 'tipinfo');
				setTimeout(function () {
					closetip('tip');
				},
					2000);

			} else {
				downloadFile('chrome提醒列表的备份文件.txt', str);

			}

		},
			100);

	});
	//导入按钮
	$("#inportbtn").click(function () {
		var addconfig = '<p><a id="close" href="#"><b>关闭</b></a><a  style="margin-left:310px;color:white" id="ok" href="#"><b>提交</b></a></p><div class="fileInput"><input type="file" name="upfile" id="upfile" accept="text/plain" class="upfile" /><input class="upFileBtn" type="button" id="upFileBtn" value="上传" /></div><div id="drop_div"  ><br>点击浏览导入配置文件<br>或<br>将配置文件拖拽到这里</div >';
		showOverlay();
		$("#dialog").append(addconfig);
		showDialog('dialog');

	});
	//保存按钮
	$("a[name='Savebtn']").click(function () {
		var loginPage = "http://oa.walkinfo.com.cn:8002/oa/login.aspx";
		localStorage.walkUsername = $("#walkUsername").val();
		localStorage.walkPassword = $("#walkPassword").val();
		chrome.extension.getBackgroundPage().conEMail();
		chrome.extension.getBackgroundPage().taskNotification();
		chrome.extension.getBackgroundPage().remind();
		$("#tipinfo").text('保存成功');
		showtip('tip', 'tipinfo');
		setTimeout(function () {
			closetip('tip');
		},2000);
		chrome.tabs.getAllInWindow(function (tabs) {
			tabs.forEach(function (e) {
				if (e.url == loginPage) {
					chrome.tabs.reload(e.id,
						function () {
						console.log("刷新成功");
						window.close();
					});

				}

			});

		});

	});

}

function connect_google() {
	$.ajax({
		url : 'https://www.google.com.hk',
		type : 'GET',
		timeout : 50000,
		beforeSend : function () {
			$("a[name='connect_google']").html('正在连接google.com.hk......');

		},
		success : function () {
			localStorage.conn_google = true;
			$("a[name='connect_google']").html('成功连接google服务器，支持中、英、日、韩语音');

		},
		error : function () {
			localStorage.conn_google = false;
			chrome.extension.getBackgroundPage().getGoogleHosts("https://gghost.de/archives/28.html");
			$("a[name='connect_google']").html('无法连接google服务器，只支持中、英语音');

		}

	});

}

//页面加载
$(document).ready(function () {
		$('#options').fullpage({
			'verticalCentered':false,
			'controlArrowColor':'#3385ff',
			'loopHorizontal':false,
			'slidesNavPosition':'middle',
		});
	connect_google();
	tab_ready();
	button_ready();
	clickCbx();
	Dialog_ready();
	// 页面text加载
	if (localStorage.walkUsername !== '') {
		$("#walkUsername").parent().addClass('input--filled');
		
	}else{
		$("#tipinfo").text("请输入公司OA的用户名和密码");
					showtip('tip', 'tipinfo');
					setTimeout(function () {
						closetip('tip');
					},
						5000);
	}
	if (localStorage.walkPassword !== '') {
		$("#walkPassword").parent().addClass('input--filled');
	}

	$("input[name='input']").focus(function () {
		if (!$(this).parent().hasClass('input--filled')) {
			$(this).parent().addClass('input--filled');

		}

	});
	$("input[name='input']").blur(function () {
		if ($.trim($(this).val()) === '') {
			$(this).parent().removeClass('input--filled');

		}

	});
	/*
	chrome.tts.getVoices(
	function(voices) {
	for (var i = 0; i < voices.length; i++) {
	console.log('Voice ' + i + ':');
	console.log('  name: ' + voices[i].voiceName);
	console.log('  lang: ' + voices[i].lang);
	console.log('  gender: ' + voices[i].gender);
	console.log('  extension id: ' + voices[i].extensionId);
	console.log('  event types: ' + voices[i].eventTypes);
	}
	}); */

	// Initialize the option controls.
	var form_isActivated = $("input[name='isActivated']");
	form_isActivated.attr("checked", JSON.parse(localStorage.isActivated));
	$("#tts").attr("checked", JSON.parse(localStorage.isSpeak));
	$("#isDownload").attr("checked", JSON.parse(localStorage.isDownload));
	$("#walkUsername").attr("value", localStorage.walkUsername);
	$("#walkPassword").attr("value", localStorage.walkPassword);
	ghost(form_isActivated.is(':checked'));
	// Set the display activation and frequency.
	form_isActivated.change(function () {
		var tmp = form_isActivated.is(':checked');
		localStorage.isActivated = tmp;
		ghost(tmp);

	});
	$("#tts").change(function () {
		localStorage.isSpeak = $("#tts").is(':checked');

	});
	$("#isDownload").change(function () {
		localStorage.isDownload = $("#isDownload").is(':checked');
	});

	chrome.runtime.onMessage.addListener(function(message, sender, sendResponse){
    if(message=='reflash_tab'){
		tab_ready();
		chrome.extension.getBackgroundPage().remind();
        sendResponse('ok');
    }
});
});

