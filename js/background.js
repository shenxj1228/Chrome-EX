var loadCount = 0;
var timeout_arry = [];
var first_time;
var mailError = "";
localStorage.mailCount = "无法连接";
var myDB = {
	name : "OA_EX",
	version : 1,
	db : null
};
if (!localStorage.storeName) {
	localStorage.storeName = "t_remind";
}
if (!localStorage.main_tab) {
	localStorage.main_tab = "";
}
if (!localStorage.PostAction) {
	localStorage.PostAction = "";
}
if (!localStorage.walkUsername) {
	localStorage.walkUsername = "";
}
if (!localStorage.walkPassword) {
	localStorage.walkPassword = "";
}
if (!localStorage.conn_google) {
	localStorage.conn_google = false;
}
if (!localStorage.add_window) {
	localStorage.add_window = "";
}
if (!localStorage.isActivated) {
	localStorage.isActivated = true;
}
if (!localStorage.isSpeak) {
	localStorage.isSpeak = true;
}
if (!localStorage.arrywinID) {
	localStorage.arrywinID = "";
}
if (!localStorage.taskrows) {
	localStorage.taskrows = "";
}
if (!localStorage.hostversion) {
	localStorage.hostversion = "";
}
//打开数据库
function openDB(callback) {
	var version = myDB.version || 1;
	var indexedDB = window.indexedDB || window.webkitIndexedDB || window.mozIndexedDB || window.msIndexedDB;
	var request = indexedDB.open(myDB.name, version);
	request.onerror = function (e) {
		console.log(e.currentTarget.error.message);

	};
	request.onsuccess = function (e) {
		myDB.db = e.target.result;
		if(typeof callback == "function") 
			callback();
	};
	request.onupgradeneeded = function (e) {
		myDB.db = e.target.result;
		if (!myDB.db.objectStoreNames.contains(localStorage.storeName)) {
			myDB.db.createObjectStore(localStorage.storeName, {
				keyPath : "id"
			});

		}
		console.log('DB version changed to ' + myDB.version);
	};
}
//关闭数据库
function closeDB(db) {
	myDB.db.close();

}
//删除数据库
function deleteDB(name) {
	indexedDB.deleteDatabase(name);

}
//增加数据
function addData(db, storeName, reminds) {
	var store = db.transaction(storeName, 'readwrite').objectStore(storeName);
	for (var i = 0; i < reminds.length; i++) {
		store.add(reminds[i]);
	}

}
/*查询数据
function getDataByKey(db,storeName,id){
var transaction=db.transaction(storeName,'readwrite');
var store=transaction.objectStore(storeName);
var request=store.get(id);
request.onsuccess=function(e){
var result=e.target.result;
};
} */
//更新数据
function updateDataByKey(db, storeName, id, key, value) {
	var transaction = db.transaction(storeName, 'readwrite');
	var store = transaction.objectStore(storeName);
	var request = store.get(id);
	request.onsuccess = function (e) {
		var remindinfo = e.target.result;
		remindinfo.key = value;
		store.put(remindinfo);

	};

}
//删除数据
function deleteDataByKey(db, storeName, id) {
	var transaction = db.transaction(storeName, 'readwrite');
	var store = transaction.objectStore(storeName);
	store.delete (id);

}

//产生guid
function guid() {
	return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g,
		function (c) {
		var r = Math.random() * 16 | 0,
		v = c == 'x' ? r : (r & 0x3 | 0x8);
		return v.toString(16);

	});

}

//分辨语言
function Distinguishlanguage(str) {
	var hwkeycode = /[\uac00-\ud7ff]/gi;
	var rwkeycode = /[\u0800-\u4e00]/gi;
	var zwkeycode = /[\u4e00-\u9fa5]/gi;
	var ywkeycode = /[\u2E80-\u9FFF]/gi;
	if (str.match(hwkeycode)) {
		return 'ko-KR';
		//韩语

	} else if (str.match(rwkeycode)) {
		return 'ja-JP';
		//日语

	} else if (str.match(zwkeycode)) {
		return 'zh_CN';
		//汉语

	} else {
		return 'en_US';
		//英语

	}

}
//组合时间
function getTimeString(hh, mm) {
	var ampm = hh >= 12 ? 'PM' : 'AM';
	hh = (hh % 12);
	if (hh === 0)
		hh = 12;
	return hh + ':' + mm + ' ' + ampm;

}

//产生提示
function ts(value, index) {
	var now = new Date();
	var PercentTime = (function getPercentTime() {
		var nowSeconds = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();
		var differenceSeconds = parseInt(value.hour, 10) * 3600 + parseInt(value.minute, 10) * 60 - nowSeconds;
		if (differenceSeconds < 0) {
			differenceSeconds = differenceSeconds + 24 * 3600;
		}
		return differenceSeconds * 1000;

	})();
	var state = value.state;
	var Arrweek = value.timefrequencys.split(',');
	var hours = value.hour;
	var minutes = value.minute;
	var title = value.title;
	var body = value.content;
	var orderWeek = new Date(now.getTime() + PercentTime).getDay().toString();
	var cunt = value.timefrequencys;
	if ((Arrweek.indexOf(orderWeek) >= 0 || cunt == "-1") && state === true) {
		var speakingtxt = "";
		var voice = "";
		var clickMe = "";
		var lang = Distinguishlanguage(title);
		var time = getTimeString(hours, minutes);
		if (JSON.parse(localStorage.conn_google)) {
			switch (lang) {
			case 'ko-KR':
				speakingtxt = '이제' + time + "," + title;
				voice = 'Google 한국의';
				clickMe = '로 이동 합니다';
				break;
			case 'ja-JP':
				speakingtxt = '今' + time + "," + title;
				voice = 'Google 日本人';
				clickMe = 'に移動するにはクリック';
				break;
			case 'zh_CN':
				speakingtxt = '现在是' + time + "，" + title;
				voice = 'Google 中国的';
				clickMe = '点击前往';
				break;
			case 'en_US':
				speakingtxt = 'There is' + time + " now, " + title;
				voice = 'Google US English';
				lang = '';
				clickMe = 'Click to GO';
				break;

			}

		} else {
			speakingtxt = "现在是:" + hours + '时，' + minutes + '分。' + "," + title;
			lang = 'zh_CN';
			voice = 'native';
			clickMe = '点击前往';

		}
		var addurl = value.url;
		timeout_arry[index] = window.setTimeout(
				function () {
				if (cunt == "-1") {
					updatestate(value.id);

				}
				if (addurl === "") {
					ShowNotification({
						id : "tz",
						title : title,
						icon : "../images/tx.png",
						message : body
					});

				} else {
					ShowNotification({
						id : "tz",
						title : title + '(' + clickMe + ')',
						icon : "../images/tx.png",
						message : body,
						callback :
						function () {
							window.open(addurl);
						}
					});

				}
				speak(speakingtxt, lang, voice);
			},
				PercentTime);

	}

}

function remind() {
	if (timeout_arry.length > 0) {
		for (var j = 0; j < timeout_arry.length; j++) {
			clearTimeout(timeout_arry[j]);

		}
		timeout_arry = [];

	}
	if (JSON.parse(localStorage.isActivated)) {
		var transaction = myDB.db.transaction(localStorage.storeName, 'readwrite');
		var store = transaction.objectStore(localStorage.storeName);
		var cursorRequest = store.openCursor();
		var i = 0;
		cursorRequest.onsuccess = function (e) {
			var cursor = e.target.result;
			if (cursor) {
				//console.log(cursor.value.hour);
				ts(cursor.value, i);
				i++;
				cursor.
				continue();

			}

		};

	}

}

//加载页面
window.onload = function () {
	//删除右键菜单
	chrome.contextMenus.removeAll();
	//清除周期性方法
	window.clearInterval();
	//取消tts朗读
	chrome.tts.stop();
	if (!myDB.db) {
		openDB(function () {
			remind();
			conEMail();
			setInterval(function () {
				conEMail();
				taskNotification();
				connect_google(function(){getGoogleHosts("https://gghost.de/archives/28.html");});
			}, 180000);
		if (!localStorage.version) {
			window.open('./options.html');
			localStorage.version = "true";
		}
		});
		
	} else {
		remind();
		conEMail();
		setInterval(function () {
			conEMail();
			taskNotification();
			remind();
			connect_google(function(){getGoogleHosts("https://gghost.de/archives/28.html");});
		}, 180000);
		if (!localStorage.version) {
			window.open('./options.html');
			localStorage.version = "true";
		}
	}
	chrome.runtime.requestUpdateCheck(function (status, details) {
		if (status === 'update_available') {
			chrome.runtime.restart();
		}
	});
	loadMenu();
};

//修改提醒状态
function updatestate(xh) {
	var transaction = myDB.db.transaction(localStorage.storeName, 'readwrite');
	var store = transaction.objectStore(localStorage.storeName);
	var request = store.get(xh);
	request.onsuccess = function (e) {
		var remindinfo = e.target.result;
		remindinfo.state = false;
		store.put(remindinfo);
		reloadOptionHtml('/options.html');
	};

}

//getMail
function conEMail() {
	if (JSON.parse(localStorage.isActivated)) {
		if (localStorage.walkUsername !== "" && localStorage.walkPassword !== "") {
			httpRequest("https://mail.walkinfo.com.cn/owa/auth/owaauth.dll", 'POST', 'destination=https://mail.walkinfo.com.cn/owa/&username=' + localStorage.walkUsername + '&password=' + localStorage.walkPassword + '&flags=0&forcedownlevel=0&trusted=0&isUtf8=1', function (response) {
				if (response == "NETerror") {
					if (mailError === '') {
						mailError = ShowNotification({
								id : "mail",
								title : '邮件网站证书错误(点我进入邮箱)',
								icon : '../images/error.png',
								message : '请手动打开一次邮箱',
								callback :
								function () {
									window.open("https://mail.walkinfo.com.cn/owa/");
								}
							});
					}
				} else {
					mailError = '';
					httpRequest("https://mail.walkinfo.com.cn/owa/", 'GET', '', function (responsetxt) {
						if (responsetxt != "NETerror") {
							var re = new RegExp('收件箱 </a><span class="unrd">');
							responsetxt = responsetxt.replace(/Inbox/g, "收件箱");

							if (re.test(responsetxt)) {
								var s_num = responsetxt.indexOf('收件箱 </a><span class="unrd">') + ('收件箱 </a><span class="unrd">').length;
								var e_num = responsetxt.substr(s_num).indexOf('<');
								var value = responsetxt.substr(s_num + 1, e_num - 2);
								localStorage.mailCount = value;
								var bdgtext = (parseInt(value, 10) + JSON.parse(localStorage.taskrows).length).toString();
								chrome.browserAction.setBadgeText({
									'text' : bdgtext
								});
								var s_time = responsetxt.indexOf('sc frst') + ('">').length;
								var e_time = responsetxt.substr(s_time).indexOf('<');
								var newfirst_time = responsetxt.substr(s_time, e_time);
								if (newfirst_time != first_time) {
									first_time = newfirst_time;
									speak('您有' + value + '封新邮件', 'zh_CN', 'native');
									ShowNotification({
										id : "mail",
										title : '新邮件(点我打开)',
										icon : '../images/mail.png',
										message : '您收到' + value + '封新邮件',
										callback : function () {
											window.open("https://mail.walkinfo.com.cn/owa/");
										}
									});
								}
							} else {
								localStorage.mailCount = 0;
							}
							chrome.browserAction.setPopup({
								popup : 'popup.html'
							});
						}
					});

				}
			});
		}
	}
}



//连接google
function connect_google(callback) {
	$.ajax({
		url : 'https://www.google.com.hk',
		type : 'GET',
		timeout : 50000,
		beforeSend : function () {
		},
		success : function () {
			localStorage.conn_google = true;
		},
		error : function () {
			localStorage.conn_google = false;
			//console.log('false');
			callback();
		}

	});

}

//getGoogleHosts
function getGoogleHosts(addurl){
	httpRequest(addurl,'GET','',function(response){
		if (response != "NETerror") {
			var downloadURL=$(response).find(".article-content>p>a").attr("href");
			//console.log(downloadURL.split("/").pop());
			if(downloadURL.split("/").pop()==localStorage.hostversion){
			}
			else{
			if(confirm("您的hosts无法访问google，是否下载hosts？\x0d更新方法(windows):将文件下载替换'C:/\Windows/\System32/\drivers/\etc/\hosts")){
			if(downloadURL.indexOf('txt')>0){
				chrome.downloads.download({url:downloadURL,filename:"hosts",conflictAction:"overwrite",saveAs:true},function(){});
			}else{
				chrome.downloads.download({url:downloadURL,conflictAction:"overwrite",saveAs:true},function(){});
			}
			localStorage.hostversion=downloadURL.split("/").pop();
			}
			}
		}else{
			console.log("从"+downloadURL+"获取hosts文件失败");
		}
	});
}

//刷新扩展选项页面
function reloadOptionHtml(pathname) {
	var str = window.location.host + pathname;
	chrome.windows.getAll({
		populate : true
	}, function (windowList) {
		for (var i = 0; i < windowList.length; i++) {
			windowList[i].tabs.forEach(function (e) {
				if (e.url.indexOf(str) > -1) {
					chrome.tabs.reload(e.id);
				}
			});
		}
	});
}

//语音主方法
function speak(speakingtxt, language, voice) {
	if (JSON.parse(localStorage.isSpeak)) {
		chrome.tts.speak(speakingtxt, {
			lang : language,
			rate : 1.0,
			voiceName : voice,
			enqueue : true
		}, function () {
			if (chrome.runtime.lastError) {
				console.log('Error: ' + chrome.runtime.lastError.message);
			}
		});
	}
}

//弹出通知的方法
function ShowNotification(myNotification) {
	var title = myNotification.title;
	var icon = myNotification.icon;
	var message = myNotification.message;
	var notifica_id = myNotification.id;
	var click_function = myNotification.callback;
	var delayTime = myNotification.delayTime;
	var re = /^[0-9]*[1-9][0-9]*$/;
	chrome.notifications.create(notifica_id, {
		type : 'basic',
		iconUrl : icon,
		title : re.test(delayTime) ? (title + '（' + delayTime / 1000 + 's后自动关闭）') : title,
		message : message
	}, function (notificationId) {
		chrome.notifications.onClicked.addListener(function (id) {
			if (id == notificationId) {
				if (click_function) {
					click_function();
				}
				chrome.notifications.clear(id, function () {});
			}
		});
		if (re.test(delayTime)) {
			setTimeout(function () {
				chrome.notifications.clear(notificationId, function () {});
			}, delayTime);
		}
	});

}

//更新tab页
function updateTab(tabId, info, tab) {
	chrome.tabs.getSelected(null,
		function (tab) {
		var ary = (tab.url).split("/");
		if (info.status == "complete") {
			chrome.tabs.onUpdated.removeListener(updateTab);
			if (ary.pop() == "MainFrame.aspx") {
				localStorage.main_tab = tabId;

				ShowNotification({
					id : 'login',
					title : '登录成功',
					icon : '../images/check.png',
					message : '自动登录成功！',
					delayTime : 3000
				});

			}

		}
		//if

	});

}

function checkMainTab() {
	chrome.windows.getAll({
		populate : true
	},
		function (windowList) {
		var arrTabID = [];
		var arrTabUrl = [];
		for (var i = 0; i < windowList.length; i++) {
			windowList[i].tabs.forEach(function (e) {
				arrTabID.push(e.id);
				arrTabUrl.push(e.url);

			});

		}
		if (arrTabID.indexOf(parseInt(localStorage.main_tab, 10)) > -1 && arrTabUrl[arrTabID.indexOf(parseInt(localStorage.main_tab, 10))].indexOf("oa.walkinfo.com.cn:8002/oa/Frame/MainFrame.aspx") > -1) {
			chrome.tabs.update(parseInt(localStorage.main_tab, 10), {
				selected : true
			});
			chrome.tabs.reload(parseInt(localStorage.main_tab, 10));

		} else {

			window.open("http://oa.walkinfo.com.cn:8002/oa/login.aspx");

		}

	});

}

//添加关闭页面刷新事件
function removeWindow() {
	//console.log('添加关闭刷新事件');
	chrome.windows.onRemoved.addListener(function (windowId) {
		if ($.inArray(windowId, JSON.parse(localStorage.arrywinID)) > -1) {
			//console.log('添加关闭刷新事件');
			taskNotification();

		}

	});

}

//连接login.js
chrome.extension.onConnect.addListener(function (port) {
	console.assert(port.name == "knockknock");
	var logininfo = "_logininfo:" + localStorage.isActivated + "," + localStorage.walkUsername + "," + localStorage.walkPassword;
	port.onMessage.addListener(function (msg) {
		if (msg.joke == "Knock knock") {
			port.postMessage({
				question : logininfo + ',' + localStorage.PostAction
			});

		} else if (msg.answer.substr(0, 2) == "wo") {
			//console.log("wo接入成功");
			ShowNotification({
				id : 'log',
				title : '' + msg.answer.substr(2) + '的日志填写成功',
				icon : '../images/check.png',
				message : '点我查看' + msg.answer.substr(2) + '的日志',
				callback : function () {
					readlog(msg.answer.substr(2));
				},
				delayTime : 7000
			});
		} else if (msg.answer == "loginbad") {
			//console.log("loginbad接入成功");
			ShowNotification({
				id : 'login',
				title : '登录失败',
				icon : '../images/error.png',
				message : '自动登录失败,点我打开设置用户名密码！',
				callback : function () {
					window.open("../options.html");
				},
				delayTime : 10000
			});
		} else if (msg.answer == "login") {
			//console.log("login接入成功");
			//port.postMessage({question: "loginok"});
			chrome.tabs.onUpdated.addListener(updateTab);

		} else if (msg.answer == "RefreshTask") {
			//console.log('收到刷新');
			var todotaskPage = "/oa/Task/DoingTask.aspx";
			chrome.windows.getAll({
				populate : true
			},
				function (windowList) {
				for (var i = 0; i < windowList.length; i++) {
					windowList[i].tabs.forEach(function (e) {
						if (e.url.indexOf(todotaskPage) > -1) {
							var temparry = [];
							temparry.push(windowList[i].id);
							localStorage.arrywinID = JSON.stringify(temparry);
							//console.log('arrywinID：' + arrywinID.join(','));

						}

					});

				}

			});
			removeWindow();

		} else if (msg.answer == "clear") {
			localStorage.PostAction = "";

		} else {
			console.log("未知接入:" + msg.answer);
			port.postMessage({
				question : ""
			});
			//setTimeout(function(){notification.cancel();},1000);

		}

	});

});

//发送httpRequest
function httpRequest(url, type, data, callback) {
	var xhr = new XMLHttpRequest();
	xhr.open(type, url, true);
	xhr.onreadystatechange = function () {
		if (xhr.readyState == 4 && xhr.status == 200) {
			callback(xhr.responseText);

		} else if (xhr.status != 200) {
			callback('NETerror');

		} else {}

	};
	xhr.send(data);

}

//OA提醒，标记符号刷新
function taskNotification() {
	//console.log('移除关闭刷新事件');
	if (JSON.parse(localStorage.isActivated)) {
		chrome.windows.onRemoved.removeListener(removeWindow);
		if (localStorage.walkUsername !== "") {
			var TaskList = "http://oa.walkinfo.com.cn:8002/oa/Task/TaskList.ashx?action=GetDoingTaskList&loginName=";
			httpRequest(TaskList + localStorage.walkUsername, 'GET', '',
				function (response) {

				if (response == "NETerror") {
					console.log(response);
				} else {
					var badgeNum = $.parseJSON(response).total + (localStorage.mailCount == 'loading...' ? 0 : parseInt(localStorage.mailCount, 10));
					var newtaskrows = [];
					var temp = [];
					if (badgeNum > 0) {

						chrome.browserAction.setBadgeText({
							'text' : badgeNum.toString()
						});
					} else {
						chrome.browserAction.setBadgeText({
							'text' : ''
						});
					}
					if (loadCount === 0) {
						localStorage.taskrows = JSON.stringify($.parseJSON(response).rows);
						if ($.parseJSON(response).total > 0) {
							ShowNotification({
								id : "task",
								title : 'OA提醒',
								icon : '../images/128.png',
								message : '您有***' + $.parseJSON(response).total + '***个需处理事项',
								callback :
								function () {
									localStorage.PostAction = "taskID:";
									checkMainTab();
								}
							});
							speak('您有***' + $.parseJSON(response).total + '***个需处理事项', 'zh_CN', 'native');

						} else {
							ShowNotification({
								id : "task",
								title : 'OA提醒',
								icon : '../images/128.png',
								message : '您没有需处理的事项',
								callback : function () {
									localStorage.PostAction = "taskID:";
									checkMainTab();
								},
								delayTime : 2000
							});
							speak('您没有需处理的事项', 'zh_CN', 'native');

						}

					} else {
						newtaskrows = $.parseJSON(response).rows;
						for (var j = 0; j < newtaskrows.length; j++) {
							if ($.inArray(newtaskrows[j], JSON.parse(localStorage.taskrows)) < 0) {
								//console.log('newtaskID[j]' + newtaskID[j]);
								temp.push(newtaskrows[j]);
							}

						}
						localStorage.taskrows = JSON.stringify(newtaskrows);
						if (temp.length > 0) {
							ShowNotification({
								id : "task",
								title : 'OA提醒',
								icon : '../images/128.png',
								message : '您收到' + temp.length + '个新的待处理事项',
								callback : function () {
									localStorage.PostAction = "taskID:";
									checkMainTab();
								}
							});
							speak('您收到' + temp.length + '个新的需处理事项', 'zh_CN', 'native');

						}

					}
					loadCount++;

				}

			});
			chrome.browserAction.setPopup({
				popup : 'popup.html'
			});
		}

	}
}

//填写今天的日志
function writelog() {
	var now = new Date();
	//当前时间
	var year = now.getFullYear();
	//年
	var month = now.getMonth() + 1;
	//月
	var day = now.getDate();
	//日
	var key = year + "-" + month + "-" + day;
	localStorage.PostAction = "myWorklogwrite:" + key;
	checkMainTab();
}

//查看今天的日志
function readlog(lq) {
	var now = new Date();
	//当前时间
	var year = now.getFullYear();
	//年
	var month = now.getMonth() + 1;
	//月
	var day = now.getDate();
	//日
	var key = year + "-" + month + "-" + day;
	if (typeof lq != 'object') {
		key = lq;
	}
	localStorage.PostAction = "myWorklogread:" + key;
	checkMainTab();

}

//打开我的工作日志
function myworklog() {
	localStorage.PostAction = "myWorklog:";
	checkMainTab();
}

//打开创建OA任务页面
function cteatetask() {
	localStorage.PostAction = "createTask:";
	checkMainTab();
}

//进入邮箱
function loginMail() {
	chrome.tabs.create({
		url : 'https://mail.walkinfo.com.cn/owa/',
		selected : true
	});
}

//创建右键快捷键
function loadMenu() {
	var parent = chrome.contextMenus.create({
			"title" : "我的功能",
			"contexts" : ["page"]
		});
	var wlog = chrome.contextMenus.create({
			"title" : "填写当天日志",
			"parentId" : parent,
			"onclick" : writelog
		});
	var rlog = chrome.contextMenus.create({
			"title" : "查看当天日志",
			"parentId" : parent,
			"onclick" : readlog
		});
	var MyWorkLog = chrome.contextMenus.create({
			"title" : "我的工作日志",
			"parentId" : parent,
			"onclick" : myworklog
		});
	var CreateTask = chrome.contextMenus.create({
			"title" : "新建任务",
			"parentId" : parent,
			"onclick" : cteatetask
		});
	var LoginMail = chrome.contextMenus.create({
			"title" : "进入邮箱",
			"parentId" : parent,
			"onclick" : loginMail
		});

}
