/*!
 * Hexun Media Technical department
 * @author zhanglin
 * @version 1.0.0
 */

var API = {
	//检测登录
	checklogin: "http://reg.tool.hexun.com/wapreg/checklogin.aspx?format=json&encode=no", 
	//登录
	ajaxlogin: "https://reg.hexun.com/rest/ajaxlogin.aspx", 
	//用户未读消息
	userMessage: "http://sqcount.tool.hexun.com/common/userMessageCount", 
	//用户未读通知
	userNotify: "http://sqcount.tool.hexun.com/common/userMessageActice", 
	//沪深
	stock: "http://webstock.quote.hermes.hexun.com/gb/a/quotelist?code=", 
	//恒生
	hk: "http://webhkstock.quote.hermes.hexun.com/gb/hk/quotelist?code=", 
	//环球
	global: "http://webglobal.hermes.hexun.com/gb/global_index/quotelist?code=", 
	//原油
	oil: "http://webftglobal.hermes.hexun.com/gb/inter_futures/quotelist?code=",
	//外汇
	forex: "http://webforex.hermes.hexun.com/gb/forex/quotelist?code=",
	//金价
	gold: "http://quote.forex.hexun.com/rest1/quote_jsonx.ashx?list=XAUUSD",
	//存款
	deposit: "http://data.bank.hexun.com/rest/yh_ckll_json.ashx",
	//贷款
	loan: "http://data.bank.hexun.com/rest/yh_dkll_json.ashx",
	//参数
	column: "&column=code,name,price,updownrate,priceweight",
	//用户未读信息数
	userInfo: 0 
};

//右侧IFRAME
API.iframe = {
	//书库
	library: {
		noLogin: "http://open.tool.hexun.com/MongodbNewsService/hexunIndex/zcyhsk.jsp?islogin=0",
		isLogin: "http://open.tool.hexun.com/MongodbNewsService/hexunIndex/zcyhsk.jsp?islogin=1"
	},
	//明博
	mBo: {
		noLogin: "http://open.tool.hexun.com/MongodbNewsService/hexunIndex/cjmb.jsp",
		isLogin: "http://open.tool.hexun.com/MongodbNewsService/hexunIndex/cjmb-logined.jsp"
	}
};



//数据
var stockData = {

	//股指链接
	setDataLink: function(str){
		var urlText = "";  
		switch (str) {  
			case "shanghai" :
				urlText += "http://stockdata.stock.hexun.com/indexhq_000001_1.shtml";  
				break;  
			case "shenzhen" :
				urlText += "http://stockdata.stock.hexun.com/indexhq_399001_2.shtml";  
				break;  
			case "shanghaiFunds" :
				urlText += "http://stockdata.stock.hexun.com/indexhq_000011_1.shtml";  
				break;  
			case "shenzhenFunds" :
				urlText += "http://stockdata.stock.hexun.com/indexhq_399305_2.shtml";  
				break;  
			case "NYMEXCLcv1" :
				urlText += "http://indexfutures.futures.hexun.com/?code=CLcv1";  
				break;  
			case "ICELCOcv1" :
				urlText += "http://indexfutures.futures.hexun.com/?code=LCOcv1";  
				break;  
			case "deposit" :
				urlText += "http://data.bank.hexun.com/ll/ckll.aspx";  
				break;  
			case "loan" :
				urlText += "http://data.bank.hexun.com/ll/dkll.aspx";  
				break;  
			case "Gbond" :
				urlText += "http://stockdata.stock.hexun.com/indexhq_000012_1.shtml";  
				break;  
			case "QYbond" :
				urlText += "http://stockdata.stock.hexun.com/indexhq_000013_1.shtml";  
				break;  
			case "goldData" :
				urlText += "http://gold.hexun.com/hjxh/";  
				break;  
			case "onshoreForex" :
				urlText += "http://quote.forex.hexun.com/USDCNY.shtml";
				break;  
			case "offshoreForex" :
				urlText += "http://quote.forex.hexun.com/USDCNH.shtml";  
				break;  
		}  
		return urlText;
	},

	//A股指数
	aStock: function(){
		index.jsonp.call(stockData,API.stock + "sse000001,szse399001,sse000011,szse399305,SSE000012,SSE000013" + API.column,function(data){
			stockData.execute("setStock","shanghai-top",data,0);
			stockData.execute("setStock","shenzhen-top",data,1);
			stockData.execute("exponential","shanghaiFunds",data,2);
			stockData.execute("exponential","shenzhenFunds",data,3);
			stockData.execute("exponential","Gbond",data,4);
			stockData.execute("exponential","QYbond",data,5);
			stockData.execute("hkStock");
		});
	},

	//恒生指数
	hkStock: function(){
		index.jsonp.call(stockData,API.hk + "hkex90001"+ API.column,function(data){
			stockData.execute("setStock","hk-top",data,0);
			stockData.execute("oStock");
		});
	},

	//环球指数
	oStock: function(){
		index.jsonp.call(stockData,API.global + "NYSE.DJI,NASDAQ.IXIC" + API.column,function(data){
			stockData.execute("setStock","NYSE-top",data,0);
			stockData.execute("setStock","NASDAQ-top",data,1);
			stockData.execute("oilStock");
		});
	},

	//原油数据
	oilStock: function(){
		index.jsonp.call(stockData,API.oil + "NYMEXCLcv1,ICELCOcv1" + API.column,function(data){
			stockData.execute("exponential","NYMEXCLcv1",data,0);
			stockData.execute("exponential","ICELCOcv1",data,1);
			stockData.execute("forexStock");
		});
	},

	//外汇数据
	forexStock: function(){
		index.jsonp.call(stockData,API.forex + "FOREXUSDCNY,FOREXUSDCNH" + API.column + ",UpDown",function(data){
			stockData.execute("exponential","onshoreForex",data,0);
			stockData.execute("exponential","offshoreForex",data,1);
			stockData.execute("goldStock");
		});
	},

	//金价数据
	goldStock: function(){
		index.jsonp(API.gold,function(data){
			var _price = data[0].Price;
			var _gold = _price * index.todayUSDCNY / 31.1035;
			//index.todayUSDCNY = -239023.9293;
			var _obj = $("#goldData");
			var _UpDownPrice = data[0].UpDownPrice;
			if (_UpDownPrice > 0){
				_obj.addClass("red");
			};
			if (_UpDownPrice < 0){
				_obj.addClass("green");
			};
			if (index.todayUSDCNY <= 0){
				_obj.html("<strong>今日金价</strong><p><a href='" + stockData.setDataLink('goldData') + "'><i>--</i>人民币/克</a></p>");
			}else{
				_obj.html("<strong>今日金价</strong><p><a href='" + stockData.setDataLink('goldData') + "'><i>" + index.toDecimal(_gold,100,2) + "</i>人民币/克</a></p>");
			};
		});
	},

	//存款利率数据
	deposit: function(){
		index.jsonp(API.deposit,function(){
			$("#deposit").text(arguments[0].zczq1y);
			stockData.loan();
		});
	},

	//贷款利率数据
	loan: function(){
		index.jsonp(API.loan,function(){
			$("#loan").text(arguments[0].data1);
		});
	},

	//全球股指
	setStock: function(){
		var _data = arguments[1],i = arguments[2],_UpDown = _data.Data[0][i][3],_obj = $("#"+arguments[0]),_price = _data.Data[0][i][2],_PriceWeight = _data.Data[0][i][4];
		var testNum = 0;
		var _str = [];
		if (_price <= 0){
			_str.push("--");
		}else {
			_str.push(index.toDecimal(_data.Data[0][i][2]/_PriceWeight,100,2));
			_str.push(" ");
			if (_UpDown > 0){
				_obj.addClass("red");
				_str.push("+");
			};
			if (_UpDown < 0){
				_obj.addClass("green");
			};
			_str.push(index.toDecimal(_data.Data[0][i][3]/100,100,2));
			_str.push("%");
		};
		_obj.text(_str.join(''));
		if (_data.Data[0][i][1] == "上证指数"){this.exponential("shanghai",_data,0,_PriceWeight)};
		if (_data.Data[0][i][1] == "深证成指"){this.exponential("shenzhen",_data,1,_PriceWeight)};
	},

	//指数数据
	exponential: function(){
		var _data = arguments[1],i = arguments[2],_UpDown = _data.Data[0][i][3],_obj = $("#"+arguments[0]),_price = _data.Data[0][i][2],_PriceWeight = _data.Data[0][i][4];
		var _str = [];
		var testNum = 0;
		_str.push("<a href='"+stockData.setDataLink(arguments[0])+"'>");
		//名称
		if (_UpDown > 0){_obj.addClass("up")};
		if (_UpDown < 0){_obj.addClass("down")};
		if (_data.Data[0][i][0] == "000011"){
			_str.push("<span>上证基金指数</span>");
		}else if(_data.Data[0][i][0] == "399305"){
			_str.push("<span>深证基金指数</span>");
		}else if(_data.Data[0][i][0] == "USDCNY"){
			_str.push("<span>在岸人民币</span>");
			index.todayUSDCNY = _data.Data[0][i][2] / 10000;
		}else {
			_str.push("<span>" + _data.Data[0][i][1] + "</span>");
		};
		_str.push("<strong>");
		//价
		if (_price <= 0){
			_str.push("--");
		}else {
			if (_data.Data[0][i][0] == "USDCNY" || _data.Data[0][i][0] == "USDCNH"){
				_str.push(index.checkData(index.toDecimal(_data.Data[0][i][2]/_PriceWeight,10000,4)));
				var _forexUpDown = _data.Data[0][i][5];
				if (_forexUpDown > 0){_obj.addClass("up")};
				if (_forexUpDown < 0){_obj.addClass("down")};
			}else {
				_str.push(index.toDecimal(_data.Data[0][i][2]/_PriceWeight,100,2));
			};
		};
		_str.push("</strong>");
		_str.push("<u>");
		//涨跌
		if (_price <= 0){
			_str.push("--</u>");
		}else {
			if (_UpDown > 0){
				_str.push("+");
			};
			_str.push(index.toDecimal(_data.Data[0][i][3]/100,100,2) + "%</u>");
		};
		_str.push("</a>");
		_obj.html(_str.join(''));
	},

	//每N秒请求指数
	AUTO: function(){setInterval('stockData.aStock()',10000)},
 
	execute: function (name) {
		return stockData[name] && stockData[name].apply(stockData, [
		].slice.call(arguments, 1));
	}

};

//其它
var index = {

	onload: function(){
		this.scrollTop();
		stockData.execute("aStock");
		stockData.execute("AUTO");
		this.isTop();
	},

	isTop: function(){
		var sTop = $(document).scrollTop();
		if (sTop > 0){
			$('#t-float').addClass('float-fixed');
		}
	},
	
	checkData: function(sum){
		var s;
		if (sum <= 0){
			s = "--";
		}else {
			s = sum;
		};
		return s;
	},

	toDecimal :function(x,m,d){  
		var f = parseFloat(x);
		if (isNaN(f)){
			return false;
		}  
		var f = Math.round(x*m)/m;
		var s = f.toString();
		var rs = s.indexOf('.'); 
		if (rs < 0){
			rs = s.length;
			s += '.';
		}
		while (s.length <= rs + d){
			s += '0';  
		}
		return s;
	},

	isLogin:function(){
		this.jsonp(API.checklogin,function(data){
			index.loginDomType(data.islogin,data.nickname);
		});
	},

	setUserMessage: function(){
		this.jsonp(API.userMessage,function(data){
			var _userMessage = $("#userMessageCount");
			var _userMessageCount = data.result.num;
			_userMessage.text(_userMessageCount);
			if (_userMessageCount > 0){
				_userMessage.addClass("red");
				API.userInfo = API.userInfo + 1;
			};
			index.setUserNotify();
		});
	},

	setUserNotify: function(){
		this.jsonp(API.userNotify,function(data){
			var _userNotify = $("#userNotifyCount");
			var _userNotifyCount = data.result.num;
			_userNotify.text(_userNotifyCount);
			if (_userNotifyCount > 0){
				_userNotify.addClass("red");
				API.userInfo = API.userInfo + 1;
			};
			if (API.userInfo > 0){
				index.setUserTip(API.userInfo);
			};
		});
	},
	
	//右侧iframe
	rightIframe: function(){
		var libraryIfr = document.getElementById("libraryIfr");
		var publicClassNoLogin = document.getElementById("publicClassNoLogin");
		var publicClassIsLogin = document.getElementById("publicClassIsLogin");
		var mBoIfr = document.getElementById("mBoIfr");
		if (arguments[0] == "True"){
			libraryIfr.src = API.iframe.library.isLogin;
			mBoIfr.src = API.iframe.mBo.isLogin;
			publicClassIsLogin.style.display = "block";
			publicClassNoLogin.style.display = "none";
		}else {
			libraryIfr.src = API.iframe.library.noLogin;
			mBoIfr.src = API.iframe.mBo.noLogin;
			publicClassIsLogin.style.display = "none";
			publicClassNoLogin.style.display = "block";
		}
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
			$(".username").text(decodeURI(name));
			$("#longinBox,.loginBn,.toolbarCR .bn:eq(1)").hide();
			$(".YesLogin").show();
			this.setUserMessage();
		}else {
			$(".loginBn,.toolbarCR .bn:eq(1)").show();
			$(".YesLogin").hide();
		}
		this.rightIframe(state);
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
		//this.logining();
		var name = $.trim($("#name").val());
		var pwd = $.trim($("#pwd").val());
		if (name == "用户名/手机/邮箱" || name == ""){
			$("#loginError").find("u").text("用户名不能为空！");
			$('#loginError').css("visibility","visible");
			return false;
		}
		if (pwd == "******" || pwd == ""){
			$("#loginError").find("u").text("密码不能为空！");
			$('#loginError').css("visibility","visible");
			return false;
		}
		var ischeck = 1;
		if(document.getElementById("check").checked==true){
			ischeck = 1;
		}else{
			ischeck = 0;
		};
		jQuery.ajax({dataType:"jsonp",type:"get",url:API.ajaxlogin,data:{username:escape(name),password:pwd,loginstate:ischeck,act:"login"},
			success:function(str){
				index.HandleLoginGo(str);
			},
			error: function (msg) {
				index.HandleLoginGo(msg);
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
						index.loginGo();
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
			index.mousout($('#' + fid), $('#' + zid));
		}else{
			$('#' + zid).slideDown(1);
		};
		$('#' + zid + ' li').click(function(){
			var $this = $(this);
			$('#' + fid).find('.s-name').html($this.find('a').html());
			index.mousout($('#' + fid), $('.hover #' + zid));
			if(typeof (result) != 'undefined' && w != ''){
				try{
					index.setResltEval($this.attr('valt'), result);
				}
				catch(e){};
			};
		});
		$('#' + fid).mouseleave(function(){
			index.mousout($('#' + fid), $('#' + zid));
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
	},

	setTab: function(name,cursel,n){
		for(var i=1;i<=n;i++){
			var menu=document.getElementById(name+i);
			var con=document.getElementById("con_"+name+"_"+i);
			menu.className=i==cursel?"s":"";
			con.style.display=i==cursel?"block":"none";
		}
	}
	
};
$(function(){index.onload()});
function ScrollPic(scrollContId, arrLeftId, arrRightId, dotListId, listType) {
  this.scrollContId = scrollContId;
  this.arrLeftId = arrLeftId;
  this.arrRightId = arrRightId;
  this.dotListId = dotListId;
  this.listType = listType;
  this.dotClassName = 'dotItem';
  this.dotOnClassName = 'current';
  this.dotObjArr = [];
  this.listEvent = 'onclick';
  this.circularly = true;
  this.pageWidth = 0;
  this.frameWidth = 0;
  this.speed = 10;
  this.space = 10;
  this.upright = false;
  this.pageIndex = 0;
  this.autoPlay = true;
  this.autoPlayTime = 5;
  this._autoTimeObj;
  this._scrollTimeObj;
  this._state = 'ready';
  this.stripDiv = document.createElement('DIV');
  this.lDiv01 = document.createElement('DIV');
  this.lDiv02 = document.createElement('DIV');
};
ScrollPic.prototype = {
  pageLength: 0,
  touch: true,
  scrollLeft: 0,
  eof: false,
  bof: true,
  initialize: function () {
    var thisTemp = this;
    if (!this.scrollContId) {
      throw new Error('必须指定scrollContId.');
      return
    }
    this.scDiv = this.$(this.scrollContId);
    if (!this.scDiv) {
      throw new Error('scrollContId不是正确的对象.(scrollContId = "' + this.scrollContId + '")');
      return
    }
    this.scDiv.style[this.upright ? 'height' : 'width'] = this.frameWidth + 'px';
    this.scDiv.style.overflow = 'hidden';
    this.lDiv01.innerHTML = this.scDiv.innerHTML;
    this.scDiv.innerHTML = '';
    this.scDiv.appendChild(this.stripDiv);
    this.stripDiv.appendChild(this.lDiv01);
    if (this.circularly) {
      this.stripDiv.appendChild(this.lDiv02);
      this.lDiv02.innerHTML = this.lDiv01.innerHTML;
      this.bof = false;
      this.eof = false
    }
    this.stripDiv.style.overflow = 'hidden';
    this.stripDiv.style.zoom = '1';
    this.stripDiv.style[this.upright ? 'height' : 'width'] = '32766px';
    this.lDiv01.style.overflow = 'hidden';
    this.lDiv01.style.zoom = '1';
    this.lDiv02.style.overflow = 'hidden';
    this.lDiv02.style.zoom = '1';
    if (!this.upright) {
      this.lDiv01.style.cssFloat = 'left';
      this.lDiv01.style.styleFloat = 'left'
    }
    this.lDiv01.style.zoom = '1';
    if (this.circularly && !this.upright) {
      this.lDiv02.style.cssFloat = 'left';
      this.lDiv02.style.styleFloat = 'left'
    }
    this.lDiv02.style.zoom = '1';
    this.addEvent(this.scDiv, 'mouseover', function () {
      thisTemp.stop()
    });
    this.addEvent(this.scDiv, 'mouseout', function () {
      thisTemp.play()
    });
    if (this.arrLeftId) {
      this.alObj = this.$(this.arrLeftId);
      if (this.alObj) {
        this.addEvent(this.alObj, 'mousedown', function (e) {
          thisTemp.rightMouseDown();
          e = e || event;
          thisTemp.preventDefault(e)
        });
        this.addEvent(this.alObj, 'mouseup', function () {
          thisTemp.rightEnd()
        });
        this.addEvent(this.alObj, 'mouseout', function () {
          thisTemp.rightEnd()
        })
      }
    }
    if (this.arrRightId) {
      this.arObj = this.$(this.arrRightId);
      if (this.arObj) {
        this.addEvent(this.arObj, 'mousedown', function (e) {
          thisTemp.leftMouseDown();
          e = e || event;
          thisTemp.preventDefault(e)
        });
        this.addEvent(this.arObj, 'mouseup', function () {
          thisTemp.leftEnd()
        });
        this.addEvent(this.arObj, 'mouseout', function () {
          thisTemp.leftEnd()
        })
      }
    }
    var pages = Math.ceil(this.lDiv01[this.upright ? 'offsetHeight' : 'offsetWidth'] / this.frameWidth),
    i,
    tempObj;
    this.pageLength = pages;
    if (this.dotListId) {
      this.dotListObj = this.$(this.dotListId);
      this.dotListObj.innerHTML = '';
      if (this.dotListObj) {
        for (i = 0; i < pages; i++) {
          tempObj = document.createElement('span');
          this.dotListObj.appendChild(tempObj);
          this.dotObjArr.push(tempObj);
          if (i == this.pageIndex) {
            tempObj.className = this.dotOnClassName
          } else {
            tempObj.className = this.dotClassName
          }
          if (this.listType == 'number') {
            tempObj.innerHTML = i + 1
          } else if (typeof (this.listType) == 'string') {
            tempObj.innerHTML = this.listType
          } else {
            tempObj.innerHTML = ''
          }
          tempObj.title = '第' + (i + 1) + '页';
          tempObj.num = i;
          tempObj[this.listEvent] = function () {
            thisTemp.pageTo(this.num)
          }
        }
      }
    }
    this.scDiv[this.upright ? 'scrollTop' : 'scrollLeft'] = 0;
    if (this.autoPlay) {
      this.play()
    }
    this._scroll = this.upright ? 'scrollTop' : 'scrollLeft';
    this._sWidth = this.upright ? 'scrollHeight' : 'scrollWidth';
    if (typeof (this.onpagechange) === 'function') {
      this.onpagechange()
    }
  },
  leftMouseDown: function () {
    if (this._state != 'ready') {
      return
    }
    var thisTemp = this;
    this._state = 'floating';
    clearInterval(this._scrollTimeObj);
    this._scrollTimeObj = setInterval(function () {
      thisTemp.moveLeft()
    }, this.speed);
    this.moveLeft()
  },
  rightMouseDown: function () {
    if (this._state != 'ready') {
      return
    }
    var thisTemp = this;
    this._state = 'floating';
    clearInterval(this._scrollTimeObj);
    this._scrollTimeObj = setInterval(function () {
      thisTemp.moveRight()
    }, this.speed);
    this.moveRight()
  },
  moveLeft: function () {
    if (this._state != 'floating') {
      return
    }
    if (this.circularly) {
      if (this.scDiv[this._scroll] + this.space >= this.lDiv01[this._sWidth]) {
        this.scDiv[this._scroll] = this.scDiv[this._scroll] + this.space - this.lDiv01[this._sWidth]
      } else {
        this.scDiv[this._scroll] += this.space
      }
    } else {
      if (this.scDiv[this._scroll] + this.space >= this.lDiv01[this._sWidth] - this.frameWidth) {
        this.scDiv[this._scroll] = this.lDiv01[this._sWidth] - this.frameWidth;
        this.leftEnd()
      } else {
        this.scDiv[this._scroll] += this.space
      }
    }
    this.accountPageIndex()
  },
  moveRight: function () {
    if (this._state != 'floating') {
      return
    }
    if (this.circularly) {
      if (this.scDiv[this._scroll] - this.space <= 0) {
        this.scDiv[this._scroll] = this.lDiv01[this._sWidth] + this.scDiv[this._scroll] - this.space
      } else {
        this.scDiv[this._scroll] -= this.space
      }
    } else {
      if (this.scDiv[this._scroll] - this.space <= 0) {
        this.scDiv[this._scroll] = 0;
        this.rightEnd()
      } else {
        this.scDiv[this._scroll] -= this.space
      }
    }
    this.accountPageIndex()
  },
  leftEnd: function () {
    if (this._state != 'floating' && this._state != 'touch') {
      return
    }
    this._state = 'stoping';
    clearInterval(this._scrollTimeObj);
    var fill = this.pageWidth - this.scDiv[this._scroll] % this.pageWidth;
    this.move(fill)
  },
  rightEnd: function () {
    if (this._state != 'floating' && this._state != 'touch') {
      return
    }
    this._state = 'stoping';
    clearInterval(this._scrollTimeObj);
    var fill = - this.scDiv[this._scroll] % this.pageWidth;
    this.move(fill)
  },
  move: function (num, quick) {
    var thisTemp = this;
    var thisMove = num / 5;
    var theEnd = false;
    if (!quick) {
      if (thisMove > this.space) {
        thisMove = this.space
      }
      if (thisMove < - this.space) {
        thisMove = - this.space
      }
    }
    if (Math.abs(thisMove) < 1 && thisMove != 0) {
      thisMove = thisMove >= 0 ? 1 : - 1
    } else {
      thisMove = Math.round(thisMove)
    }
    var temp = this.scDiv[this._scroll] + thisMove;
    if (thisMove > 0) {
      if (this.circularly) {
        if (this.scDiv[this._scroll] + thisMove >= this.lDiv01[this._sWidth]) {
          this.scDiv[this._scroll] = this.scDiv[this._scroll] + thisMove - this.lDiv01[this._sWidth]
        } else {
          this.scDiv[this._scroll] += thisMove
        }
      } else {
        if (this.scDiv[this._scroll] + thisMove >= this.lDiv01[this._sWidth] - this.frameWidth) {
          this.scDiv[this._scroll] = this.lDiv01[this._sWidth] - this.frameWidth;
          this._state = 'ready';
          theEnd = true
        } else {
          this.scDiv[this._scroll] += thisMove
        }
      }
    } else {
      if (this.circularly) {
        if (this.scDiv[this._scroll] + thisMove < 0) {
          this.scDiv[this._scroll] = this.lDiv01[this._sWidth] + this.scDiv[this._scroll] + thisMove
        } else {
          this.scDiv[this._scroll] += thisMove
        }
      } else {
        if (this.scDiv[this._scroll] + thisMove <= 0) {
          this.scDiv[this._scroll] = 0;
          this._state = 'ready';
          theEnd = true
        } else {
          this.scDiv[this._scroll] += thisMove
        }
      }
    }
    this.accountPageIndex();
    if (theEnd) {
      this.accountPageIndex('end');
      return
    }
    num -= thisMove;
    if (Math.abs(num) == 0) {
      this._state = 'ready';
      if (this.autoPlay) {
        this.play()
      }
      this.accountPageIndex();
      return
    } else {
      clearTimeout(this._scrollTimeObj);
      this._scrollTimeObj = setTimeout(function () {
        thisTemp.move(num, quick)
      }, this.speed)
    }
  },
  pre: function () {
    if (this._state != 'ready') {
      return
    }
    this._state = 'stoping';
    this.move( - this.pageWidth)
  },
  next: function (reStar) {
    if (this._state != 'ready') {
      return
    }
    this._state = 'stoping';
    if (this.circularly) {
      this.move(this.pageWidth)
    } else {
      if (this.scDiv[this._scroll] >= this.lDiv01[this._sWidth] - this.frameWidth) {
        this._state = 'ready';
        if (reStar) {
          this.pageTo(0)
        }
      } else {
        this.move(this.pageWidth)
      }
    }
  },
  play: function () {
    var thisTemp = this;
    if (!this.autoPlay) {
      return
    }
    clearInterval(this._autoTimeObj);
    this._autoTimeObj = setInterval(function () {
      thisTemp.next(true)
    }, this.autoPlayTime * 1000)
  },
  stop: function () {
    clearInterval(this._autoTimeObj)
  },
  pageTo: function (num) {
    if (this.pageIndex == num) {
      return
    }
    if (num < 0) {
      num = this.pageLength - 1
    }
    clearTimeout(this._scrollTimeObj);
    clearInterval(this._scrollTimeObj);
    this._state = 'stoping';
    var fill = num * this.frameWidth - this.scDiv[this._scroll];
    this.move(fill, true)
  },
  accountPageIndex: function (type) {
    var pageIndex = Math.round(this.scDiv[this._scroll] / this.frameWidth);
    if (pageIndex >= this.pageLength) {
      pageIndex = 0
    }
    this.scrollLeft = this.scDiv[this._scroll];
    var scrollMax = this.lDiv01[this._sWidth] - this.frameWidth;
    if (!this.circularly) {
      this.eof = this.scrollLeft >= scrollMax;
      this.bof = this.scrollLeft <= 0
    }
    if (type == 'end' && typeof (this.onmove) === 'function') {
      this.onmove()
    }
    if (pageIndex == this.pageIndex) {
      return
    }
    this.pageIndex = pageIndex;
    if (this.pageIndex > Math.floor(this.lDiv01[this.upright ? 'offsetHeight' : 'offsetWidth'] / this.frameWidth)) {
      this.pageIndex = 0
    }
    var i;
    for (i = 0; i < this.dotObjArr.length; i++) {
      if (i == this.pageIndex) {
        this.dotObjArr[i].className = this.dotOnClassName
      } else {
        this.dotObjArr[i].className = this.dotClassName
      }
    }
    if (typeof (this.onpagechange) === 'function') {
      this.onpagechange()
    }
  },
  $: function (objName) {
    if (document.getElementById) {
      return eval('document.getElementById("' + objName + '")')
    } else {
      return eval('document.all.' + objName)
    }
  },
  isIE: navigator.appVersion.indexOf('MSIE') != - 1 ? true : false,
  addEvent: function (obj, eventType, func) {
    if (obj.attachEvent) {
      obj.attachEvent('on' + eventType, func)
    } else {
      obj.addEventListener(eventType, func, false)
    }
  },
  delEvent: function (obj, eventType, func) {
    if (obj.detachEvent) {
      obj.detachEvent('on' + eventType, func)
    } else {
      obj.removeEventListener(eventType, func, false)
    }
  },
  preventDefault: function (e) {
    if (e.preventDefault) {
      e.preventDefault()
    } else {
      e.returnValue = false
    }
  }
};

