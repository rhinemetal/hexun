/*!
 * Hexun Media Technical department
 * @author zhanglin
 * @version 1.0.0
 */
var articleTop = {

	api: function(){
		var o = {};
		o.checklogin  = "http://reg.tool.hexun.com/wapreg/checklogin.aspx?format=json&encode=no"; //检测登录
		o.ajaxlogin   = "https://reg.hexun.com/rest/ajaxlogin.aspx"; //登录
		o.userMessage = "http://sqcount.tool.hexun.com/common/userMessageCount";//用户未读消息
		o.userNotify  = "http://sqcount.tool.hexun.com/common/userMessageActice";//用户未读通知
		o.userInfo    = 0;//用户未读信息数
		return o;
	}(),

	isLogin:function(){
		this.jsonp(articleTop.api.checklogin,function(data){
			articleTop.loginDomType(data.islogin,data.nickname);
		});
	},

	setUserMessage: function(){
		this.jsonp(articleTop.api.userMessage,function(data){
			var _userMessage = $("#userMessageCount");
			var _userMessageCount = data.result.num;
			_userMessage.text(_userMessageCount);
			if (_userMessageCount > 0){
				_userMessage.addClass("red");
				articleTop.api.userInfo = articleTop.api.userInfo + 1;
			};
			articleTop.setUserNotify();
		});
	},

	setUserNotify: function(){
		this.jsonp(articleTop.api.userNotify,function(data){
			var _userNotify = $("#userNotifyCount");
			var _userNotifyCount = data.result.num;
			_userNotify.text(_userNotifyCount);
			if (_userNotifyCount > 0){
				_userNotify.addClass("red");
				articleTop.api.userInfo = articleTop.api.userInfo + 1;
			};
			if (articleTop.api.userInfo > 0){
				articleTop.setUserTip(articleTop.api.userInfo);
			};
		});
	},
	
	setUserTip: function(count){
		$(".menu .tip").show();
		$(".YesLogin .round").show();
	},

	jsonp: function(url,callback){
		$.ajax({
			type:"GET",
			dataType:"jsonp",
			url:url,
			async:false,
			success:callback
		});
	},
	
	logining:function(){//正在登录
		$("#loginError span").addClass("r");
		$('#loginError').css("visibility","visible");
		$('#loginError u').html("登录中...")
	},

	loginDomType:function(state,name){
		$(".menu li").hover(function(event){
			$(this).addClass("s");
			$(this).siblings("").removeClass("s");
		});
		if (state == "True"){
			articleTop.loginState = 1;
			$(".username").text(decodeURI(name));
			$("#longinBox,.loginBn,.toolbarCR .bn:eq(1)").hide();
			$(".YesLogin").show();
			this.setUserMessage();
		}else {
			articleTop.loginState = 0;
			$(".loginBn,.toolbarCR .bn:eq(1)").show();
			$(".YesLogin").hide();
		}
	},

	HandleLoginGo:function(str){
		if(str.state=="Y"){
			$('#loginError u').html(str.msg);
			this.loginDomType("True",str.user.nickname);
			this.setUserMessage();
		}else{
			$("#loginError span").removeClass("r");
			$('#loginError u').html("登录超时，稍后再试");
		};
		if(str.state=="N"){
			$('#loginError u').html(str.msg);//失败后dom操作
			if(str.msg=="密码输入错误"){$("#pwd").addClass("error")};
			if(str.msg=="用户名不存在"){$("#name").addClass("error")};
		};
	},
	showlonginBox:function(){
		if($("#longinBox").css("display")=="block"){
			$("#longinBox").hide();
		}else{
			$("#longinBox").show();
		}
	},

	hideBox: function(obj){$("#"+obj).hide()},
	showBox: function(obj){$("#"+obj).show()},
	
	loginGo:function(){
		this.logining();
		var name = $.trim($("#name").val());
		var pwd = $.trim($("#pwd").val());
		var ischeck = 1;
		if(document.getElementById("check").checked==true){
			ischeck = 1;
		}else{
			ischeck = 0;
		};
		jQuery.ajax({dataType:"jsonp",type:"get",url:articleTop.api.ajaxlogin,data:{username:escape(name),password:pwd,loginstate:ischeck,act:"login"},
			success:function(str){
				articleTop.HandleLoginGo(str);
			},
			error: function (msg) {
				articleTop.HandleLoginGo(msg);
			}
		});
	},
	focusBtn:function(obj,type){
		$('#loginError').css("visibility","hidden");
		if(type==1){
			if(obj.id=="pwd"){
				$("#pwd").keydown(function (e){
					var curKey = e.which;
					if (curKey == 13){
						articleTop.loginGo();
						return false;
					}
				}); 
			};
			obj.className="foncusOn";
			if(obj.value=="用户名/手机/邮箱" && obj.id=="name"){
				obj.value="";
			};
			if(obj.value=="******" && obj.id=="pwd"){
				obj.value="";
			}
		}else{
			obj.className="";
			if(obj.id=="name" && obj.value==""){
				obj.value="用户名/手机/邮箱";
			};
			if(obj.id=="pwd" && obj.value==""){
				obj.value="******";
			}
		}
	},
	
	scrollTop: function(){
		$(window).scroll(function(){
			if ($('#topFullWidthBanner').html() != ''){
				if ($(window).scrollTop() > $('#topFullWidthBanner').height()){
					$('#t-float').addClass('float-fixed');
				}else{
					$('#t-float').removeClass('float-fixed');
					$('#t-float').css('top', '0');
					$('#t-float').attr('style', '');
				};
			}else{
				if($(window).scrollTop() > 0){
					$('#t-float').addClass('float-fixed');
				}else{
					$('#t-float').removeClass('float-fixed');
				}
			}
		});
		$(".YesLogin").hover(function(event){
			$(".menu").show();
			$(".username").addClass("usernameHove");
		},function(){
			$(".menu").hide();
			$(".username").removeClass("usernameHove");
		});
		$(".navL .more").hover(function(event){
			$(".mLink").show();
			$(".navL .more .bn").addClass("bnHover");
		},function(){
			$(".mLink").hide();
			$(".navL .more .bn").removeClass("bnHover");
		});

	},

	selectMenuList: function(fid, zid, result, w){
		if (typeof (w) != 'undefined' && w != 0 && w != ''){
			$('#' + zid).css('width', w);
		}else{
			$('#' + zid).css('width', $('#' + fid).width());
		};
		if ($('#' + zid).height() > 99 && zid != 'sitlist'){
			$('#' + zid).css('height', '99');
			$('#' + zid).css('overflow-y', 'auto');
			$('#' + zid).css('overflow-x', 'hidden');
		};
		$('#' + fid).addClass('hover');
		if ($('#' + zid).css('display') == 'block'){
			articleTop.mousout($('#' + fid), $('#' + zid));
		}else{
			$('#' + zid).slideDown(1);
		};
		$('#' + zid + ' li').click(function(){
			var $this = $(this);
			$('#' + fid).find('.s-name').html($this.find('a').html());
			articleTop.mousout($('#' + fid), $('.hover #' + zid));
			if(typeof (result) != 'undefined' && w != ''){
				try{
					articleTop.setResltEval($this.attr('valt'), result);
				}
				catch(e){};
			};
		});
		$('#' + fid).mouseleave(function(){
			articleTop.mousout($('#' + fid), $('#' + zid));
		});
		$(document).click(function(e){
			var drag = $('#' + fid),
			dragel = $('#' + fid) [0],
			target = e.target;
			if (dragel !== target && !$.contains(dragel, target)){
				$('#' + zid).hide();
			};
		});
		return false;
	},
	setResltEval: function(value,result){
		var hs=eval(result)//回调函数
		var option ={ret:function(data){hs(data)}};
		option.ret(value);
	},
	mousout: function(lid,tid){
		var timer;
		clearTimeout(timer);
		timer = setTimeout(function(){lid.removeClass("hover");tid.hide();},200);
		tid.hover(function(){
		clearTimeout(timer);
		});
	}
	
};
$(function(){articleTop.isLogin()})










