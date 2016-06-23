/*!
 * Hexun Media Technical department
 * @author zhanglin
 * @version 1.0.0
 */
var commentSource = 1;
var articleSource = 1;
//var articleId = /.*\/(.*)\.html$/.exec(location.href)[1];
var articleId = window.location.href.split('.html')[0].split('/')[4];
var articleUrl = location.href;
var articleTitle = $("h1").text();
var vcode = "";
var article = {

	//评论
	comments: function(){
		$(".content").autosize();
		$(".formContent .content").val("");
		var fc = "formContent", rc = "replyContent";
		$("." + fc).click(function(){
			$(this).addClass("nobg");
		});
		$("." + fc + " .content").blur(function(){
			if ($(this).val() == ""){
				$(this).parent().removeClass("nobg");
			}
		});

		//写评论-事件绑定
		$(".formSubmit .bn").live('click', function(event){
			article.setCommentsend($(this),$(this).attr("data"));
		});

		//回复-事件绑定
		$(".commentsItem .reply").live('click', function(event){
			if ($(this).data("state") == true){
				var replyToStr = "回复@" + $(this).siblings(".region").text();
				var isUser = $(this).siblings(".region").has("a").length;
				var placeholder;
				isUser !=0? placeholder = $(this).siblings(".region").children("a").text():placeholder = $(this).siblings(".region").text();
				$(this).parents(".text").append('<div class="replyBox"><div class="replyContent"><textarea class="content" placeholder="回复@'+placeholder+'"></textarea></div><div class="formSubmit clearfix"><span class="bn" data="reply">提 交</span><span class="tip">还可输入<i class="maxNum">500</i>字</span> </div></div>');
				$(this).data("state",false);
			}else{
				$(this).parents(".text").children(".replyBox").remove();
				$(this).data("state",true);
			}
			$(".content").autosize();
			setMaxNum();
		});
		
		//点赞
		$(".commentsItem .praise").live('click', function(event){
			if (articleTop.loginState == 0){
				alert("请登录!");
			}
			var commentid = $(this).parents(".commentsItem").attr("did");
			article.setPraise(commentid);
		});
		
		//列多按钮
		$(".showAllComments").click(function(){
			$(".commentsItem").removeClass("h");
			$(this).hide();
		});

		this.getCommentsList();
	},

	//写评论-发送
	setCommentsend:function(sendBn,obj){
		if (articleTop.loginState == 0){
			alert("请登录后评论!");
			if (obj != "only"){sendBn.parents(".replyBox").remove()};
		}else {
			if (obj == "only"){
				var articleCentent = $("#content").val();
				articleCentent = articleCentent.replace('<','&lt').replace('>','&gt');
				var parentid = 0;
				var parentuserid = 0;
			}else {
				var articleCentent = sendBn.parent().siblings(".replyContent").children(".content").val();
				articleCentent = articleCentent.replace('<','&lt').replace('>','&gt');
				var parentid = sendBn.parents(".commentsItem").attr("did");
				var parentuserid = sendBn.parents(".commentsItem").attr("uid");
			};
			var postUrl = this.commentsApi.postComment;
			$.ajax({
				type: "GET",
				url: postUrl,
				scriptCharset: "utf-8" ,
				data:{
					commentsource: commentSource,
					articlesource: articleSource,
					articleid: articleId,
					url: articleUrl,
					title: articleTitle,
					comment: articleCentent,
					parentid: parentid,
					parentuserid: parentuserid,
					Vcode: vcode
				},
				dataType: "jsonp",
				jsonpCallback: 'callback',
				success: function(data){
					if (data.status == 1){
						article.getCommentsList();
						if (obj == "only"){
							$("#content").val("");
							sendBn.parent().siblings(".formContent").removeClass("nobg");
						}
					}else {
						alert(data.revdata.msg);
					}
				}
			});
		}
	},

	//接口
	commentsApi: function(){
		return {
			checklogin:"http://reg.tool.hexun.com/wapreg/checklogin.aspx?format=json",
			postComment:"http://comment.tool.hexun.com/Comment/PostComment.do",
			getComment:"http://comment.tool.hexun.com/Comment/GetComment.do"
		};
	}(),
	
	setPraise:function(commentid){
			$.ajax({
				type: "GET",
				url: "http://comment.tool.hexun.com/Comment/praise.do",
				scriptCharset: "utf-8" ,
				data: {
					commentsource: 1,
					commentid: commentid
				},
				dataType: "jsonp",
				success: function(data){
					if (data.revdata.msg == "已赞") {
						alert(data.revdata.msg)
					}else {
						article.getCommentsList();
					}
				}
			});
	},
	
	//评论-列表
	getCommentsList: function(){
		var pageSize = 100;
		var pageNum = 1;
		var dataUrl = this.commentsApi.getComment + "?commentsource=" + commentSource + "&articlesource=" + articleSource + "&articleid=" + articleId + "&pagesize=" + pageSize + "&pagenum=" + pageNum;
		this.jsonp(dataUrl,this.bindCommentsList);
		setMaxNum();
	},
	
	//评论-列表数据
	bindCommentsList:function(data){
		article.bindCommentsHideList(data);
		var commentsBox = $("#commentsBox");
		var commentsLength = data.revdata.commentcount;
		if (commentsLength == 0){
			$(".commentsTit").hide();
			$(".showAllComments").hide();
		}else {
			$(".commentsTit").show();
		}
		if (commentsLength >= 2){
			$(".showAllComments").show();
		}else {
			$(".showAllComments").hide();
		}
		$(".showAllComments").find("i").text(commentsLength-3);
		$("#commentsSum").text(commentsLength);
		var s = [];
		for (i = 0; i < commentsLength; i++){
			if (i > 2){
				s.push('<div class="commentsItem clearfix h"');
			}else {
				s.push('<div class="commentsItem clearfix"');
			}
			s.push(' id="'+data.revdata.articledata[i].parentid+'" uid="'+data.revdata.articledata[i].userid+'" did="'+data.revdata.articledata[i].id+'">');
			if (articleTop.loginState == 0){
				s.push('<div class="pic"><img src="'+data.revdata.articledata[i].logo+'"></div>');
			}else {
				s.push('<div class="pic"><a href="http://hexun.com/'+data.revdata.articledata[i].userid+'" target="_blank"><img src="'+data.revdata.articledata[i].logo+'"></a></div>');
			}
			s.push('<div class="text"><div class="tip clearfix">');
			if (articleTop.loginState == 0){
				s.push('<span class="region">'+data.revdata.articledata[i].poststr+'网友'+data.revdata.articledata[i].postip+'</span>');
			}else {
				if (data.revdata.articledata[i].parentid == 0){
					s.push('<span class="region"><a href="http://hexun.com/'+data.revdata.articledata[i].userid+'" target="_blank">'+data.revdata.articledata[i].username+'</a></span>');
				}else {
					var pUserName = $("#commentsHideUserName span[id='"+data.revdata.articledata[i].parentuserid+"']").eq(0).text();
					s.push('<span class="region"><a href="http://hexun.com/'+data.revdata.articledata[i].userid+'" target="_blank">'+data.revdata.articledata[i].username+'</a>&nbsp;&nbsp;回复&nbsp;&nbsp;<a href="http://hexun.com/'+data.revdata.articledata[i].parentuserid+'" target="_blank">'+pUserName+'</a></span>');
				}
			}
			s.push('<span class="time">'+article.getCommentDate(data.revdata.articledata[i].posttime)+'</span><span class="reply">回复</span><span class="praise">(<i>'+data.revdata.articledata[i].praisecount+'</i>)</span></div>');
			s.push('<div class="txt">'+data.revdata.articledata[i].content+'</div>');
			s.push('</div>');
			s.push('</div>');
		};
		commentsBox.html(s.join(''));
		$(".reply").data("state",true);

	},
	
	//评论-隐藏用户名列表
	bindCommentsHideList:function(data){
		var commentsLength = data.revdata.commentcount;
		var s = [];
		for (i = 0; i < commentsLength; i++){
			s.push('<span id="'+data.revdata.articledata[i].userid+'">'+data.revdata.articledata[i].username+'</span>');
		}
		$("#commentsHideUserName").html(s.join(''));
	},
	
	//评论-格式化时间戳
	getCommentDate: function(unixTime){
		var time = new Date(unixTime);
		var year=time.getFullYear();
		var month=time.getMonth()+1;
		var date=time.getDate();
		var hours=time.getHours();
		var min=time.getMinutes();
		var sec=time.getSeconds();
		month=month>9?month:"0"+month;
		date=date>9?date:"0"+date;
		hours=hours>9?hours:"0"+hours;
		min=min>9?min:"0"+min;
		sec=sec>9?sec:"0"+sec;
		var str=year+"-"+month+"-"+date+" "+hours+":"+min+":"+sec;
		return str;
	},
	
	jsonp: function(url,callback){
		var url = (url.indexOf('?') != -1) ? (url + '&') : (url + '?');
		var time = new Date().getTime();
		var name = 'hx_' + time;
		url += 'callback=' + name  ;
		window[name] = callback;		
		var road = document.createElement('script');
		road.type = 'text/javascript';
		road.charset = "utf-8";
		road.src = url;
		document.getElementsByTagName('head')[0].appendChild(road);
		if (road.readyState) {
			road.onreadystatechange = function () {
				if (road.readyState == 'loaded' || road.readyState == 'complete') {
					road.onreadystatechange = null;
					document.getElementsByTagName('head')[0].removeChild(road);
					window[name] = 'undefined';
					try {
						delete window[name];
					}
					catch (e) { }
					}
				}
		} else {
			road.onload = function () {
				document.getElementsByTagName('head')[0].removeChild(road);
				window[name] = 'undefined';
				try { delete window[name]; }
				catch (e) { }
			}
		}
	},

	//分享-微信
	share:function(){
		var wbData = {
			"www":{"hx":"http://t.hexun.com/2346857/default.html", "sina":"http://weibo.com/hexunwang", "qq":"http://t.qq.com/hexunguanfang"},
			"news":{"hx":"http://t.hexun.com/2346857/default.html", "sina":"http://weibo.com/hexunwang", "qq":"http://t.qq.com/hexunguanfang"},
			"shoucang":{"hx":"http://t.hexun.com/2346857/default.html", "sina":"http://weibo.com/hexunshoucang", "qq":"http://t.qq.com/hexunshoucang"},
			"book":{"hx":"http://t.hexun.com/2346857/default.html", "sina":"http://weibo.com/hexunbook", "qq":"http://t.qq.com/hexunbook"},
			"bschool":{"hx":"http://t.hexun.com/19598352/default.html", "sina":"http://weibo.com/hexunbschool", "qq":"http://t.qq.com/hexunbschool"},
			"tech":{"hx":"http://t.hexun.com/14538324/default.html", "sina":"http://weibo.com/u/2491786247", "qq":"http://t.qq.com/tech-hexun"},
			"opinion":{"hx":"http://t.hexun.com/19585644/default.html", "sina":"http://weibo.com/hexunpinglun", "qq":"http://t.qq.com/hexunopinion"},
			"stock":{"hx":"http://t.hexun.com/6001649/default.html", "sina":"http://weibo.com/hexungupiao", "qq":"http://t.qq.com/hexunstock"},
			"funds":{"hx":"http://t.hexun.com/17659324/default.html", "sina":"http://weibo.com/hexunwangjijin", "qq":"http://t.qq.com/hexunwangjijin"},
			"hk":{"hx":"http://t.hexun.com/6001649/default.html", "sina":"http://e.weibo.com/u/2793891431", "qq":"http://1.t.qq.com/hexunganggu"},
			"pe":{"hx":"http://t.hexun.com/17659324/default.html", "sina":"http://e.weibo.com/u/2812234601", "qq":"http://t.qq.com/hexunwangpe"},
			"forex":{"hx":"http://t.hexun.com/17636433/default.html", "sina":"http://weibo.com/hexunforex", "qq":"http://t.qq.com/hexunforex"},
			"bond":{"hx":"http://t.hexun.com/2346857/default.html", "sina":"http://weibo.com/hexunwang", "qq":"http://t.qq.com/hexunguanfang"},
			"gold":{"hx":"http://t.hexun.com/17470996/default.html", "sina":"http://weibo.com/hexungold", "qq":"http://t.qq.com/hexungold"},
			"money":{"hx":"http://t.hexun.com/18451433/default.html", "sina":"http://weibo.com/hexunmoney", "qq":"http://t.qq.com/hexunmoney"},
			"tax":{"hx":"http://t.hexun.com/2346857/default.html", "sina":"http://weibo.com/hexunwang", "qq":"http://t.qq.com/hexunguanfang"},
			"bank":{"hx":"http://t.hexun.com/2346857/default.html", "sina":"http://weibo.com/hexunbank", "qq":"http://t.qq.com/hexun-bank"},
			"trust":{"hx":"http://t.hexun.com/2346857/default.html", "sina":"http://weibo.com/u/2554287635", "qq":"http://t.qq.com/hexun-trust"},
			"insurance":{"hx":"http://t.hexun.com/18451515/default.html", "sina":"http://e.weibo.com/hexunbaoxian", "qq":"http://t.qq.com/hexun-insurance"},
			"pension":{"hx":"http://t.hexun.com/18451515/default.html", "sina":"http://e.weibo.com/hexunbaoxian", "qq":"http://t.qq.com/hexun-insurance"},
			"futures":{"hx":"http://t.hexun.com/17635132/default.html", "sina":"http://weibo.com/hexunfutures", "qq":"http://t.qq.com/hexunguanfang"},
			"qizhi":{"hx":"http://t.hexun.com/17635132/default.html", "sina":"http://weibo.com/hexunfutures", "qq":"http://t.qq.com/hexunguanfang"},
			"xianhuo":{"hx":"http://t.hexun.com/17635132/default.html", "sina":"http://weibo.com/hexunfutures", "qq":"http://t.qq.com/hexunguanfang"},
			"gzqh":{"hx":"http://t.hexun.com/17635132/default.html", "sina":"http://weibo.com/hexunfutures", "qq":"http://t.qq.com/hexunguanfang"},
			"auto":{"hx":"http://t.hexun.com/2346857/default.html", "sina":"http://weibo.com/hexunauto", "qq":"http://t.qq.com/hexunauto"},
			"lux":{"hx":"http://t.hexun.com/2346857/default.html", "sina":"http://weibo.com/hexunwang", "qq":"http://t.qq.com/hexunguanfang"},
			"house":{"hx":"http://t.hexun.com/2346857/default.html", "sina":"http://weibo.com/u/1743396651", "qq":"http://t.qq.com/hexunguanfang"}
		};
		var url=document.location.href, currentChannel = url.split(".")[0].replace("http://",""), defaultChannel = "www", defaultChannelData = wbData[defaultChannel];
		for (var c in wbData){
			if (c == currentChannel){
				defaultChannel = c;
				defaultChannelData = wbData[c];
			}
		}
		var bds_config = {'snsKey':{'tsina':'1362842923'}}; //20130507 
		document.getElementById("share").innerHTML = '<div id="socialTool" class="creater_share"><div class="hxshare"><cite id="bdshare" class="bdshare_t bds_tools get-codes-bdshare clearfix"><a class="bds_tsina" id="bds_tsina" title="分享到新浪微博" href="#"></a><a class="bds_qzone" id="bds_qzone"></a></cite><cite class="weixin"><span class="wxPop" id="wxPop"><img id="wxAppLogo" class="app" width="100" height="100"><i class="closeBtn" title="关闭" onclick="this.parentNode.style.display=\'none\';document.getElementById(\'wxJianTou\').style.display=\'none\'"></i><b class="text">用微信扫描二维码<br>分享至好友和朋友圈</b></span><span class="wxJianTou" id="wxJianTou"></span><span class="wxLogo"><a id="wxLogo" href="javascript:void(0)" title="" onmouseover="document.getElementById(\'wxPop\').style.display=\'block\';document.getElementById(\'wxJianTou\').style.display=\'block\';document.getElementById(\'wxAppLogo\').src=\'http://app.hexun.com/qr.do?url=\\'+url+'\'"></a></span></cite></span></cite></div>';
		document.write('<script type="text/javascript" id="bdshare_js" data="type=tools&amp;uid=657298" ><\/script>');
		document.write('<script type="text/javascript" id="bdshell_js"><\/script>');
		document.getElementById("bdshell_js").src = "http://bdimg.share.baidu.com/static/js/shell_v2.js?cdnversion=" + new Date().getHours();
	}(),

	showAll:function(){
		articleHeight = $(".art_contextBox").height();
		if (articleHeight < 2100){
			$(".showAll").hide();
		}
		$(".showAll").click(function(event){
			$(this).hide();
			$(".art_contextBox").css({"max-height":"none"});
		});
	}()

};

//字数提示
var setMaxNum = function(){
	$(".content").on('paste cut keydown keyup focus blur', function(event){
		var nConBox = $(".content");
		var bSend = false;
		var maxNum = 500;
		var iLen = 0;
		var iLen1 = 0;
		var oMaxNum = $(this).parent().siblings(".formSubmit").find(".maxNum");
		var countTxt = $(this).parent().find(".tip");
		for (i = 0; i < $(this).val().length; i++) {
			if (nConBox.val().charCodeAt(i) < 128){
				iLen1 += 1 / 2;
			} else {
				iLen1 += 1;
			}
			iLen = Math.ceil(iLen1);
		}
		oMaxNum.html(maxNum - iLen);
		maxNum - iLen >= 0 ? (oMaxNum.css("color", ""), bSend = true,countTxt.html('还可输入 <strong class="maxNum">'+(maxNum - iLen)+'</strong> 字')) : (oMaxNum.css("color", "#f60"), bSend = false,countTxt.html('已超出 <strong class="maxNum">'+-(maxNum - iLen)+'</strong> 字'))
	});
}

var articleIframe = {
	stock: "http://open.tool.hexun.com/MongodbNewsService/hexunIndex/cd.jsp",
	funds: "http://www.hexun.com/hxpage-lck/",
	trust: "http://www.hexun.com/hxpage-lck/",
	money: "http://www.hexun.com/hxpage-lck/",
	futures: "http://open.tool.hexun.com/MongodbNewsService/hexunIndex/zgqhds.jsp",
	dazong: "http://open.tool.hexun.com/MongodbNewsService/hexunIndex/zgqhds.jsp",
	qizhi: "http://open.tool.hexun.com/MongodbNewsService/hexunIndex/zgqhds.jsp",
	xianhuo: "http://open.tool.hexun.com/MongodbNewsService/hexunIndex/zgqhds.jsp",
	crudeoil: "http://open.tool.hexun.com/MongodbNewsService/hexunIndex/zgqhds.jsp",
	insurance: "http://open.tool.hexun.com/MongodbNewsService/hexunIndex/fxb.jsp",
	pension: "http://open.tool.hexun.com/MongodbNewsService/hexunIndex/fxb.jsp",
	zhongchou: "http://open.tool.hexun.com/MongodbNewsService/hexunIndex/hxzt.jsp",
	p2p: "http://open.tool.hexun.com/MongodbNewsService/hexunIndex/hxzt.jsp",
	iof: "http://open.tool.hexun.com/MongodbNewsService/hexunIndex/hxzt.jsp",
	auto: "http://www.hexun.com/hxpage-hcd/",
	haiwai: "http://open.tool.hexun.com/MongodbNewsService/hexunIndex/hfd.jsp",
	house: "http://open.tool.hexun.com/MongodbNewsService/hexunIndex/hfd.jsp",
	book: "http://open.tool.hexun.com/MongodbNewsService/hexunIndex/zcyhsk.jsp",
	other: "http://www.hexun.com/hxpage-jrtj/"
};

var rightIframe = document.getElementById("rightIframe");
var articleDomain = location.href.split("//")[1].split(".com")[0];
if (articleDomain.indexOf("stock") != -1){
	rightIframe.src = articleIframe.stock;
}else if(articleDomain.indexOf("funds") != -1) {
	rightIframe.src = articleIframe.funds;
}else if(articleDomain.indexOf("trust") != -1) {
	rightIframe.src = articleIframe.trust;
}else if(articleDomain.indexOf("futures") != -1) {
	rightIframe.src = articleIframe.futures;
}else if(articleDomain.indexOf("dazong") != -1) {
	rightIframe.src = articleIframe.dazong;
}else if(articleDomain.indexOf("qizhi") != -1) {
	rightIframe.src = articleIframe.qizhi;
}else if(articleDomain.indexOf("xianhuo") != -1) {
	rightIframe.src = articleIframe.xianhuo;
}else if(articleDomain.indexOf("crudeoil") != -1) {
	rightIframe.src = articleIframe.crudeoil;
}else if(articleDomain.indexOf("insurance") != -1) {
	rightIframe.src = articleIframe.insurance;
}else if(articleDomain.indexOf("pension") != -1) {
	rightIframe.src = articleIframe.pension;
}else if(articleDomain.indexOf("zhongchou") != -1) {
	rightIframe.src = articleIframe.zhongchou;
}else if(articleDomain.indexOf("p2p") != -1) {
	rightIframe.src = articleIframe.p2p;
}else if(articleDomain.indexOf("iof") != -1) {
	rightIframe.src = articleIframe.iof;
}else if(articleDomain.indexOf("auto") != -1) {
	rightIframe.src = articleIframe.auto;
}else if(articleDomain.indexOf("haiwai") != -1) {
	rightIframe.src = articleIframe.haiwai;
}else if(articleDomain.indexOf("house") != -1) {
	rightIframe.src = articleIframe.house;
}else if(articleDomain.indexOf("book") != -1) {
	rightIframe.src = articleIframe.book;
}else if(articleDomain.indexOf("money") != -1) {
	rightIframe.src = articleIframe.money;
}else {
	rightIframe.src = articleIframe.other;
}
$(function(){article.comments()});







