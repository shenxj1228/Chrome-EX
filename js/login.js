function getParam(name) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
    //构造一个含有目标参数的正则表达式对象
    var r = window.location.search.substr(1).match(reg);
    //匹配目标参数
    if (r !== null) return unescape(r[2]);
    return null;
    //返回参

}
$(document).ready(function load() {
    var oaloginRelativePath = "/oa/login.aspx";
    var mailloginRelativePath = "/owa/auth/logon.aspx";
    var Worklogadd = "http://oa.walkinfo.com.cn:8002/oa/Work/WorkLogadd.aspx?logrq=";
    var Workloglist = "http://oa.walkinfo.com.cn:8002/oa/Work/WorkDaylist.aspx?logrq=";
    var workaddRelativePath = "/oa/Work/WorkLogadd.aspx";
    var workaddPath = "http://oa.walkinfo.com.cn:8002/oa/Work/WorkLogadd.aspx";
    var oamainframeRelativePath = "/oa/Frame/MainFrame.aspx";
    var mailPage = "https://mail.walkinfo.com.cn/owa/";
    var todotaskPage = "/oa/Task/DoingTask.aspx";
    var sendtaskPage = "/oa/Task/SendTask.aspx";
    var logrq = 'logrq';
    var port = chrome.extension.connect({
        name: "knockknock"
    });
    port.postMessage({
        joke: "Knock knock"
    });
    port.onMessage.addListener(function(msg) {
        if (msg.question.indexOf("_logininfo:") > -1) {
            var message = msg.question.replace("_logininfo:", "");
            var arr = String(message).split(",");
            if (arr[0] == "true") {
                if (window.location.pathname == oaloginRelativePath) {
                    port.postMessage({
                        answer: "login"
                    });
                    document.getElementById("UserName").value = arr[1];
                    document.getElementById("PassWord").value = arr[2];
                    document.getElementById("Button1").click();
                    if (document.getElementById("MSG").innerText !== "")
                    {
                        port.postMessage({
                            answer: "loginbad"
                        });

                    }

                }
                if (window.location.pathname == mailloginRelativePath) {

                    document.getElementById("username").value = arr[1];
                    document.getElementById("password").value = arr[2];
                    document.querySelector('input[type=submit]').click();

                }

                if (arr[3].indexOf("taskID:") > -1) {
                    if (window.location.pathname == oamainframeRelativePath) {
                        document.getElementById('right').src = "http://oa.walkinfo.com.cn:8002/oa/Task/TodoTask.aspx";
                        if (arr[3].replace('taskID:', '') !== "") {
                            var taskID = arr[3].replace('taskID:', '').split('~');
                            var url = "http://oa.walkinfo.com.cn:8002/oa/Task/DoingTask.aspx?LCSLID=" + taskID[0] + "&STEPID=" + taskID[1] + "&ISQuery=0&ISCreat=0";
                            port.postMessage({
                                answer: "clear"
                            });
                            window.open(url, "单据详情", "toolbar=no,menubar=no,scrollbars=yes, resizable=no,location=no,status=no,width=900,height=780");

                        } else {
                            port.postMessage({
                                answer: "clear"
                            });

                        }

                    }

                }
                if (arr[3].indexOf("createTask:") > -1) {

                    if (window.location.pathname == oamainframeRelativePath) {
                       document.getElementById('right').src = "http://oa.walkinfo.com.cn:8002/oa/Task/CreateTask.aspx";
                        port.postMessage({
                            answer: "clear"
                        });

                    }

                }
                if (arr[3].indexOf("myWorklog") > -1) {
                    if (window.location.pathname == oamainframeRelativePath) {
                        document.getElementById('right').src = "http://oa.walkinfo.com.cn:8002/oa/Work/WorkLog.aspx";
                        if (arr[3].replace('myWorklog').replace(/(^\s*)|(\s*$)/g, "") !== "") {
							var rq;
                            if (arr[3].indexOf('myWorklogwrite:') > -1) {
                                 rq = arr[3].replace('myWorklogwrite:', '');
                                window.open(Worklogadd + rq, "新建日志", "toolbar=no,menubar=no,scrollbars=yes, resizable=no,location=no, status=no,width=800,height=800");
                                //window.open(Worklogadd+rq,"新建日志","toolbar=no,menubar=no,scrollbars=yes, resizable=no,location=yes, status=no,width=800,height="+window.screen.height+""); 

                            }
                            if (arr[3].indexOf('myWorklogread:') > -1) {
                                 rq = arr[3].replace('myWorklogread:', '');
                                window.open(Workloglist + rq, "查看日志", "toolbar=no,menubar=no,scrollbars=yes, resizable=no,location=no, status=no,width=830,height=" + window.screen.height + "");

                            }

                        }
                        port.postMessage({
                            answer: "clear"
                        });

                    }


                }

            }
            if (window.location.pathname == workaddRelativePath || window.location.pathname == workaddPath) {
                document.getElementsByTagName('form')[0].addEventListener('submit', 
                function() {
                    port.postMessage({
                        answer: "wo" + getParam(logrq)
                    });
                    window.opener.document.getElementById("right").contentWindow.location.reload();
                    window.opener = null;
                    window.open('', '_self');
                    window.close();

                });

            }
            if (window.location.pathname == todotaskPage) {
                port.postMessage({
                    answer: "RefreshTask"
                });

            }
            if (window.location.pathname == oamainframeRelativePath) {
                document.getElementsByName('UP').document.querySelector("a[href=\"" + mailPage + "\"]").target = "_blank";

            }
            if (window.location.pathname == sendtaskPage) {
                port.postMessage({
                    answer: "RefreshTask"
                });

            }

        }
        else if (msg.question == "loginok") {

            }
        else {
            alert("未知通信");

        }

    });


});