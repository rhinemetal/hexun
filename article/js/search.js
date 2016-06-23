 (function(self) {
    var doc = document;
    var keysName = 'keys';

    function empty(string) {
        return string.replace(/\s+/g, '');
    }
    var JsSearch = {
        Class: function(name, base, members, staticMembers) {
            var e;
            var names = empty(name).split('.');
            var klassName = names.pop();
            var _this = self;
            var klass = members && members[klassName] ?
                eval('(function(){ return function(){ this.' + klassName + '.apply(this, arguments);}})()') :
                eval('(function(){ return function(){ } })()');
            var prototype = klass.prototype;
            klass.name__ = name;
            klass.base__ = [];
            if (base) {
                klass.base__ = klass.base__.concat(base.base__);
                klass.base__.push(base);
                JsSearch.extend(prototype, base.prototype);
            }
            for (var i in members) {
                var j = members[i];
                if (typeof j == 'function') {
                    j.belongs = klass;
                    var o = prototype[i];
                    if (o && o.belongs)
                        prototype[o.belongs.name__.replace(/\./g, '$') + '$' + i] = o;
                }
                prototype[i] = j;
            }
            JsSearch.extend(klass, staticMembers);
            while (e = names.shift())
                _this = _this[e] || (_this[e] = {});
            if (_this[klassName])
                throw JsSearch.Error(name + ' class redefined');
            _this[klassName] = klass;
            if (klass[klassName])
                klass[klassName]();
            return klass;
        },

		ajax:function(url,callback){
			JsSearch.jsonpn++;
			var head0 = document.getElementsByTagName('head')[0];
			var scriptEle = document.createElement('script');
			scriptEle.charset = "gb2312";
			var time = (new Date).getTime();
			var fname = 'hx_json' + JsSearch.jsonpn + time;
			scriptEle.type = "text/javascript";
			url += url.indexOf('?') != -1 ? '&' : '?';
			url += 'callback=' + fname;
			window[fname] = callback;
			//document.title = url;
			scriptEle.src = url;
			head0.appendChild(scriptEle);
			if (scriptEle.readyState) {
				scriptEle.onreadystatechange = function () {
					if (scriptEle.readyState == 'loaded' || scriptEle.readyState == 'complete') {
						scriptEle.onreadystatechange = null;
						document.getElementsByTagName('head')[0].removeChild(scriptEle);
						try {
							delete callback;
						}
						catch (e) {
						}
					}
				}
			}
			else {
				scriptEle.onload = function () {
					document.getElementsByTagName('head')[0].removeChild(scriptEle);
					try {
						delete callback;
					}
					catch (e) {
					}
				}
			}		
		
		
		},
		   
		//动态加载script
		loadScript:function(url,id,callback) {
		  var script = document.createElement('script');
		  script.type = 'text/javascript';
		  if(id!='') script.id= id;
		  if(script.readyState) {
			  script.onreadystatechange = function() {
				   if(script.readyState == 'loaded' || script.readyState == 'complete') {
						callback();
					   }
				  }
			  }
		  else {
			  script.onload = function() {callback();};
			  }
		  script.src = url;
		  document.getElementsByTagName('head')[0].appendChild(script);	   
		},

		httpAjax:function(obj){
			var oAjax=null;
			
			if(window.ActiveXObject){
				oAjax=new ActiveXObject("Msxml2.XMLHTTP") || new ActiveXObject("Microsoft.XMLHTTP");
			}
			else if(window.XMLHttpRequest){
				oAjax=new XMLHttpRequest();
			}
			
			oAjax.open(obj.type, obj.url, true);
			
			oAjax.onreadystatechange=function (){
				//4 请求完成
				if(oAjax.readyState==4){
					if(oAjax.status==200){//成功
						if(obj.success){
							obj.success(oAjax.responseText);
						}
					}
					else{//失败
						if(obj.faild){
							obj.faild(oAjax.status);
						}
					}
				}
			};
			
			oAjax.send();
		
		
		},

        extend: function(obj, extd) {
            for (var i in extd)
                obj[i] = extd[i];
            return obj;
        },
		
		getID:function(element){
			var el;
			if(typeof element == 'string') el = document.getElementById(element);
			else el = element;
			if(!el) return null;
			else return el;		
		},

		getAbsPoint:function(e){
			var x = e.offsetLeft;
			var y = e.offsetTop;
			while(e = e.offsetParent){
				x += e.offsetLeft;y += e.offsetTop;
			}
			return {'x': x, 'y': y};
		},
		
		getCurrentStyle:function(e,v){
			return e.currentStyle ? e.currentStyle[v] : document.defaultView.getComputedStyle(e,null)[v];
		},
		
		isIE67:function(){
			var agent = navigator.userAgent.toLowerCase();
			var regStr_ie = /msie (\d+)/gi;
			if(agent.indexOf("msie") > 0){
				var ie6=navigator.userAgent.indexOf("MSIE 6.0")>0;
				var ie7=navigator.userAgent.indexOf("MSIE 7.0")>0;
				if(ie6 || ie7){
					return true;
				}
			}
			return false;
		},

		trim:function(str){
			return str.replace(/^\s+|\s+$/g,'');
		},

        Error: function(msg) {
            return new Error(msg);
        },
        noop: function() { }    
    };
    self.JsSearch = JsSearch;
    self.Class = JsSearch.Class;
	JsSearch.jsonpn=0;
} (window));

 
JsSearch.extend(String.prototype,{
	getQuery:function(name){ 
	　　var reg = new RegExp("(^|&)"+ name +"=([^&]*)(&|$)");
	　　var r = this.substr(this.indexOf("\?")+1).match(reg); 
	　　if (r!=null) return r[2]; return null; 
	},
	isNum:function(){
		var r = new RegExp("^[0-9]*[1-9][0-9]*$");
		return r.test(this);
	},
	format:function(){
		var _arguments=arguments;
		var val=this;
		for(var i=0,_len=_arguments.length;i<_len;i++){
			var re=new RegExp("\\{"+i+"\\}",'gm');
			val=val.replace(re,_arguments[i]);
		}
		return val;	
	}
});

Class("hexun.common.Search",'',{
	Search:function(option){
		
	},
	
	singleList:	{
		"基金":{
			"urlList":[
				//非货币
				["搜索与<span>{0}</span>相关的非货币理财型基金净值走势","http://jingzhi.funds.hexun.com/database/jzzs.aspx?fundcode={0}"],
				["搜索与<span>{0}</span>相关的基金公告","http://jingzhi.funds.hexun.com/fundsreport/list.aspx?fundcode={0}"],
				["搜索与<span>{0}</span>相关的基金经理","http://jingzhi.funds.hexun.com/{0}/jingli.shtml"],
				["搜索与<span>{0}</span>相关的业绩报告","http://jingzhi.funds.hexun.com/fundsreport/list.aspx?fundcode={0}&type=3"],
				["搜索与<span>{0}</span>相关的的新闻","http://news.search.hexun.com/cgi-bin/search/info_search.cgi?key={0}&f=0"]
			],
			"urlList2":[
				//40、70 货币市场和创新理财的需要用这个
				["搜索与<span>{0}</span>相关的货币理财型基金净值走势","http://jingzhi.funds.hexun.com/database/jzzshb.aspx?fundcode={0}"],
				["搜索与<span>{0}</span>相关的基金公告","http://jingzhi.funds.hexun.com/fundsreport/list.aspx?fundcode={0}"],
				["搜索与<span>{0}</span>相关的基金经理","http://jingzhi.funds.hexun.com/{0}/jingli.shtml"],
				["搜索与<span>{0}</span>相关的业绩报告","http://jingzhi.funds.hexun.com/fundsreport/list.aspx?fundcode={0}&type=3"],
				["搜索与<span>{0}</span>相关的的新闻","http://news.search.hexun.com/cgi-bin/search/info_search.cgi?key={0}&f=0"]
			]
		},

		"债券":{
			"urlList":[
				["搜索与<span>{0}</span>相关的基本资料","http://bond.money.hexun.com/all_bond/{0}.shtml"],
				["搜索与<span>{0}</span>相关的新闻","http://news.search.hexun.com/cgi-bin/search/info_search.cgi?key={0}&f=0"]
			]
		},

		"期货":{
			"urlList":[
				["搜索与<span>{0}</span>相关的成交持仓","http://quote.futures.hexun.com/quote/{0}.shtml"],
				["搜索与<span>{0}</span>相关的基本资料","http://quote.futures.hexun.com/info/{0}.shtml"],
				["搜索与<span>{0}</span>相关的新闻","http://news.search.hexun.com/cgi-bin/search/info_search.cgi?key={0}&f=0"]
			]
		},

		"现货":{
			"urlList":[
				["搜索与<span>{0}</span>相关的基本资料","http://quote.futures.hexun.com/info/{0}.shtml"],
				["搜索与<span>{0}</span>相关的新闻","http://news.search.hexun.com/cgi-bin/search/info_search.cgi?key={0}&f=0"]
			]
		},
			
		"A股":{
			"urlList":[
				["搜索与<span>{0}</span>相关的资金流向","http://vol.stock.hexun.com/{0}.shtm"],
				["搜索与<span>{0}</span>相关的主力控盘","http://stockdata.stock.hexun.com/zlkp/s{0}.shtml"],
				["搜索与<span>{0}</span>相关的龙虎榜","http://stockdata.stock.hexun.com/lhb/gg{0}.shtml"],
				["搜索与<span>{0}</span>相关的大宗交易","http://stockdata.stock.hexun.com/dzjy/{0}.shtml"],
				["搜索与<span>{0}</span>相关的机构持仓","http://stockdata.stock.hexun.com/jgcc/s{0}.shtml"],
				["搜索与<span>{0}</span>相关的新闻","http://news.search.hexun.com/cgi-bin/search/info_search.cgi?key={0}&f=0"]
			]
		}

	},

	defaultMessage:{
		/*
			默认关键字
		*/
		0:"输入代码/名称/拼音",
		1:"输入代码/名称/拼音",
		2:"输入代码/名称/拼音",
		3:"输入债券代码或简称",
		4:"输入期货代码或简称",
		5:"输入外汇代码或简称",
		6:"输入理财代码或简称",
		7:"输入信托代码或简称",
		8:"输入保险代码或简称",
		9:"输入新闻关键字",
		10:"输入更多代码或简称",
		11:"输入关键字",
		12:"输入关键字"
	},
	
	enumerateType:{
		0:"all",//全部
		1:"stock",//股票
		2:"fund",//基金
		3:"bond",//债券
		4:"future",//期货
		5:"forex",//外汇
		6:"finance",//理财
		7:"trust",//信托
		8:"insurance",//保险
		9:"hong",//宏观
		10:"news",//新闻
		11:"blog",//博客
		12:"tv",//视频
		13:"guba"//股吧
	},
	
	enumerateTypeIndex:{
		"all":0,
		"stock":1,
		"fund":2,
		"bond":3,
		"future":4,
		"forex":5,
		"finance":6,
		"trust":7,
		"insurance":8,
		"hong":9,
		"news":10,
		"blog":11,
		"tv":12,
		"guba":13

	},
	/*
		***当前搜索模块的索引
		0:全部,1:股票,2:基金,3:债券，4：期货
		5：外汇，6：理财，7：信托，8：保险
		9：新闻，10：更多
		*/
	
	currentSearchIndex:0,
	step:-1,//设置联想功能的默认步数

	init:function(options){
		/*
			options
			inputID:搜索框的id,
			containerID:将数据存放的容器ID,
			url:请求地址,
			config:配置文件变量名
		*/
		this.setDefault();
		var inputID=options.inputID;
		var url=options.url || "http://so.hexun.com/ajax.do";//http://data.stock.hexun.com/include/AjaxSearch2011.ashx//老接口
		var containerID=options.containerID;
		this.config=options.config;
		this.input=JsSearch.getID(inputID);
		var btnSearchID=options.searchBtnID;
		this.btnSearch=JsSearch.getID(btnSearchID);
		var stockkeyID = options.stockKeyID || 'stockkey';
		this.stockKey = JsSearch.getID(stockkeyID);
		var stockType = options.stockType || 'stocktype';
		this.stockType = JsSearch.getID(stockType);
		this.btnListID=options.btnID || null;
		this.searchContainer=options.searchContainer || null;

		//控制样式
		this.formID=options && options.formID || "hexunsearch2015";
		this.boxWidth=options && options.boxWidth || 2;
		this.boxHeight=options && options.boxHeight || 2;
		this.boxColor=options && options.boxColor || "#ddd";
		this.zIndex=options && options.zIndex || 999;
		if(options && options.boxWidth==0){
			this.boxWidth =0;
		}
		if(options && options.boxHeight==0){
			this.boxHeight =0;
		}

		this.url=url;
		this.container=JsSearch.getID(containerID) || document.body;
		this.gaper=this.options.gaper;
		this.maxRow=this.options.maxRow;
		this.scriptId=this.options.scripId;
		this.common=this.options.common;
		this.timer=null;
		var openNewPage=options.openNewPage || false;
		var notForm=options.notForm || false; //false是form,true则是非form,默认是form.非form采用get请求，form则默认post. 
		this.target=openNewPage?"_blank" :"_self";
		this.fragment = document.createDocumentFragment();
		this.oldValue = JsSearch.trim(this.input.value).toUpperCase();
		this.scriptId="hxSuggest_ids";
		this.drawPanel();
		this.isIE67=JsSearch.isIE67();
		this.hasData=true;
		this.isFormPost = !notForm;
		if(this.btnListID){
			this.bindTopClick();
			this.setCurrentIndex();
		}
		else{
			//如果没有btnListID[没有上边的切换标签],需要根据域名设置当前搜索联想的type
			this.setDefaultType();
		}
	},

	setDefaultType:function(){
		var host=window.location.host;
		var config=this.config;
		var typeList=config.typeList;
		var enumerateTypeIndex=this.enumerateTypeIndex;
		var _type=typeList[host];
		if(_type){
			this.currentSearchIndex=enumerateTypeIndex[_type];
		}
		else {
			//有的直接判断，没有的，再二次判断，看是否属于二级域名
			var stype=this.getConfigHost(host);
			if(stype){
				this.currentSearchIndex=enumerateTypeIndex[stype];
			}
			else{
				this.currentSearchIndex=0;
			}
		}

		//向input框里动态推内容
		this.getInputContent();
	},

	getInputContent:function(){
		var _this=this;
		var index=this.currentSearchIndex;
		var enumerateType=this.enumerateType;
		var type=enumerateType[index];
		var url="http://so.hexun.com/hot.do?type="+type;
		
		JsSearch.ajax(url,function(data){
			_this.setInputContent(data);
		});
		
		//_this.setInputContent({result:this.defaultMessage[index]});
	},
	
	setInputContent:function(data){
		var _data=data[0];
		var _name=_data.name;
		var input=this.input;
		this.defaultname = _name;
		input.value=_name;
	},

	getConfigHost:function(host){
		var _host=host;
		var config=this.config;
		var _typeList=config.typeList;
		var stype="all";
		for(var item in _typeList){
			if(_host.indexOf(item)>-1){
				stype = _typeList[item];
				break;
			}
		}
		return stype;
	},

	setCurrentIndex:function(){
		var list=this.enumerateTypeIndex;
		var _location=window.location.href
		var _type=_location.getQuery("type");
		if(_type){
			_type=_type.toLowerCase();
		}

		var currentIndex=list[_type] || 0;
		this.currentSearchIndex=currentIndex;
		//this.currentKey=_key;
		//var _key=decodeURI(key);


		//设置
		var btnListID=this.btnListID;
		var btnList=JsSearch.getID(btnListID).getElementsByTagName("a");
		for(var i=0;i<btnList.length;i++){
			btnList[i].className="";
		}
		btnList[currentIndex].className="on";
	},

	bindTopClick:function(){
		var _this=this;
		var btnListID=this.btnListID;
		var btnList=JsSearch.getID(btnListID).getElementsByTagName("a");
		for(var i=0;i<btnList.length;i++){
			btnList[i].currentIndex=i;
			btnList[i].onclick=function(){
				for(var j=0;j<btnList.length;j++){
					btnList[j].className="";
				}
				_this.currentSearchIndex=this.currentIndex;
				this.className="on";
				_this.checkOpenPage();
			
				return false;
			}
		}
	},

	checkOpenPage:function(){
		var index=this.currentSearchIndex;
		var type=this.enumerateType[index];
		var val=this.input.value;
		if(val==""){
			var url="http://so.hexun.com/?type="+type;
			window.open(url,"_self");
			return false;
		}
		
		this.openPage();
		//var url="http://so.hexun.com/default.do?key="+val+"&type="+type;
		//window.open(url,"_self");

	},

    //设定默认值
    setDefault:function(options){
	   this.options = {
		   //查找间隙
		   gaper:100,
		   //最大显示条数
		   maxRow:10,
		   //加载script的固定ID标示
		   scriptId:'hxSuggest_ids',
		   //通用
		   common:false,
		   tempObj:''
	   };
	  JsSearch.extend(this.options,options||{});
	},

	drawPanel:function(){
		this.conPanel = document.createElement('div');
		this.conPanel.style.display="none";
		this.conPanel.className='searchPanel';
		//this.conPanel.style.position="absoute";
		with(this.conPanel.style){
			position="absolute";
			zIndex=this.zIndex;
		}

		this.fragment.appendChild(this.conPanel);
		this.container.appendChild(this.fragment);
		this.addEvent();
	},

	addEvent:function(){
		var input=this.input;
		var _this=this;
		/*
		input.onfocus=function(){
			var value=JsSearch.trim(this.value);
			var currentSearchIndex=_this.currentSearchIndex;
			var defaultMessage=_this.defaultMessage[currentSearchIndex];
			if(value == defaultMessage || value=='输入代码、名称或简写') {
				this.value = '';
				this.color = '#000';
			}

			_this.openSearch();

		}
		*/
		this.bind(input,"focus",function(){
			var value=JsSearch.trim(this.value);
			var currentSearchIndex=_this.currentSearchIndex;
			var defaultMessage=_this.defaultMessage[currentSearchIndex];
			if(value == defaultMessage || value=='输入代码、名称或简写' || value==_this.defaultname) {
				this.value = '';
				this.color = '#000';
			}

			_this.openSearch();			
		});

		this.bind(input,"blur",function(){
			_this.oldValue = '';
			clearInterval(_this.timer);
			_this.conPanel.style.display="none";	
			/*
			//开启智能提示
			var value=JsSearch.trim(this.value);
			var currentSearchIndex=_this.currentSearchIndex;
			var defaultMessage=_this.defaultMessage[currentSearchIndex];
			if(value == '' && currentSearchIndex !=0){
				this.value=defaultMessage;
			}
			*/
		});

		/*
		input.onblur=function(){
			_this.oldValue = '';
			clearInterval(_this.timer);
			_this.conPanel.style.display="none";
		}
		*/

		//这里写keydown事件
		input.onkeydown=function(ev){
			_this.keyEvent(ev);
		}

		var btnSearch=this.btnSearch;
		btnSearch.onclick=function(){
			_this.openPage();
		}
	},


	bind:function(obj,handle,fn){
		if(obj.addEventListener){
			obj.addEventListener(handle,fn,false);
		}
		else if(obj.attachEvent) {
			obj.attachEvent('on'+handle,function(){
				fn.call(obj);
			});
		}
		else{
			obj["on"+handle]=fn;
		}	
	},

	openPage:function(){
		var input=this.input;
		var val=input.value;
		var currentSearchIndex=this.currentSearchIndex;
		var type=this.enumerateType[currentSearchIndex];
		var hasData=this.hasData;
		var _type=type;
		var _val=encodeURI(val);
		var url="http://so.hexun.com/default.do?type="+_type;
		if(val==""){
			url="http://so.hexun.com/?type="+type;
			window.open(url,"_self");
			return false;
		}

		if(!hasData){
			_type="all";
		}

		url="http://so.hexun.com/default.do?type="+_type;

		if(type=="news"){
			//url="http://news.search.hexun.com/cgi-bin/search/info_search.cgi?key="+val+"&f=0";
			url="http://news.search.hexun.com/news?key="+val;
		}
		else if(type=="blog"){
			url="http://blog.search.hexun.com/blog?key="+val;
		}
		else if(type=="tv"){
			url="http://video.search.hexun.com/tv?key="+val;
		}
		else if(type=="guba"){
			url="http://guba.hexun.com/search/ResultAll.aspx?key="+val;
		}
		//window.open(url,this.target);
		var form=document.getElementById(this.formID);
		/*防范CSRF恶意攻击*/
		var expires = new Date((new Date()).getTime()+1000); 
		document.cookie="hexun_search_wzkf="+escape("hexun_search_wzkf")+((expires==null) ? "" : ";expires="+expires.toGMTString()) +";path=/; domain=hexun.com"; 
		/*防范CSRF恶意攻击 e*/
		if(!form){
			form=document.getElementById("hexunsearch");
			if(!form)
				{
				var tmpFormAction = url;
				var tmpForm = $("<form></form>");
			    tmpForm.attr('action',tmpFormAction);
			    tmpForm.attr('method','post');
			    var temInputKey = $("<input type='hidden' name='key' />");
			    var tempInputType = $("<input type='hidden' name='type' />");
			    temInputKey.val(val);
			    tempInputType.val(_type);
			    tmpForm.append(temInputKey);
			    tmpForm.append(tempInputType);
			    tmpForm.css('display','none');
			    tmpForm.appendTo("body");
			    tmpForm.submit();
			    return false;
				}
		}

		
		/*var keyInput=document.getElementById("stockkey");
		var typeInput=document.getElementById("stocktype");*/
		keyInput = this.stockKey;
		typeInput = this.stockType;
		keyInput.value=val;
		typeInput.value=_type;
		form.action=url;
		form.target=this.target;
		form.submit();

	},

	openSearch:function(){
		var _this=this;
		_this.common=true;
		this.timer = setInterval(function(){
			var value=_this.input.value;
			if(_this.input.value!=''&& value!=_this.oldValue){
				_this.oldValue=_this.input.value;
				_this.getValue(value);
			}
			else if(value=='') {
				_this.oldValue = value;
				_this.conPanel.innerHTML = '';
				_this.conPanel.style.display="none";
			}
		},100);
		
	},

	getValue:function(value){
		var _this=this;
		var currentSearchIndex=this.currentSearchIndex;
		var type=this.enumerateType[currentSearchIndex] || null;
		if(!type || type == "news" || type == "blog" || type == "tv" || type == "guba"){
			return false;
		}
		var url=this.url+"?key="+value+"&type="+type;
		var id=this.scriptID;
		JsSearch.loadScript(url,id,function(){
			if(hxSuggest_JsonData) {
			   _this.conPanel.innerHTML = '';
			   _this.setValue(hxSuggest_JsonData);
			}
		});
	},

	getUrl:function(_data){
		var urlConfigList=this.config;

		
		var stocktype=_data.stocktype;
		var type=_data.type;
		var flag=_data.flag;
		var code=_data.code;
		var parentCode=_data.parentCode;
		var market=_data.market;
		var id=_data.id;
		var ppType =_data.ppType;

		if(stocktype==5){
			//中证指数 以0开头和以3开头的,如果是其它的,需要另行判断		
			var _index=(''+code).substring(0,1);
			var _url=(urlConfigList[stocktype]["littleTypeUrl"][_index]).format(code);
			return _url;

		}
		else if(stocktype==8 || stocktype==1500){
			//债券
			var _index=(''+flag).substring(0,5);
			if(urlConfigList[stocktype]["littleTypeUrl"][_index]){
				var _url=(urlConfigList[stocktype]["littleTypeUrl"][_index]).format(code);
				return _url;
			}
		}
		else if(stocktype==13){
			//需要取出market=3确定它是港股指数
			if(market==3){
				var _url=(urlConfigList[stocktype]["littleTypeUrl"][market]).format(code);
				return _url;
			}
			
		}
		else if(stocktype==67){
			//保险
			var _url=(urlConfigList[stocktype]["littleTypeUrl"][flag]).format(id);
			return _url;
		}
		else if(stocktype==92 || stocktype==265) {
			//银行理财和信托时，需要传的是ID规则
			var _url=(urlConfigList[stocktype]["url"]).format(id);
			return _url;
		}else if(stocktype==1600) {
			//宏观传的是父类和子类code
			var _url=(urlConfigList[stocktype]["url"]).format(code,parentCode);
			return _url;
		}else if(stocktype==1301 || stocktype==1302)
			{
			var _url=(urlConfigList[stocktype]["url"]).format(_data.innerCode);
			return _url;
			}
		var _url=(urlConfigList[stocktype]["url"]).format(code);
		return _url;
	},

	setValue:function(data){
		var arr=[];
		var _data=data;
		var currentHoveClass="";
		arr.push('<ul>');
		if(_data.length<=0){
			this.hasData=false;//当没有数据时，点搜索，要跳到全部来搜索全部的内容
			// arr.push('<li>');
			// arr.push('<span style="padding:2px 10px;display:inline-block;">没有您要的数据</span>');
			// arr.push('</li>');
			this.conPanel.style.border="none";
			this.conPanel.style.display="none";
			console.log(this.conPanel)
		}
		else{
			this.hasData=true;
			this.conPanel.style.border="solid 1px #a00";
		}
		for(var i=0;i<_data.length;i++){
			//currentHoveClass=i==0?"hov":"";
			var stocktype=_data[i].stocktype;
			var type=_data[i].type;
			var flag=_data[i].flag;
			var code=_data[i].code;
			var parentCode=_data[i].parentCode;
			var market=_data[i].market;
			var id=_data[i].id;
			var url=this.getUrl(_data[i]);
			arr.push('<li href="'+url+'" class="'+currentHoveClass+'" data-temp="'+_data[i].name+'_'+_data[i].code+'_1">');
			if(_data[i].code!="")
				{				
				arr.push('<span class="searc_code"><font style="color:#aa0000"></font>'+this.setContentColor(_data[i].code)+'</span>');
				arr.push('<span class="searc_companysearc_code">'+this.setContentColor(_data[i].name)+'</span>');
				}else{
				arr.push('<span class="searc_code">'+this.setContentColor(_data[i].name)+'</span>');		
					
				}

			arr.push('</li>');
		}
		if(_data.length==1){
			var urlConfigList=this.config;
			var _type=data[0].type;
			var _code=data[0].code;
			var _name=data[0].name;
			var _stocktype=data[0].stocktype;
			var _flag=data[0].flag;
			var singleList=urlConfigList[_stocktype];
			var _list=singleList["singleLinkList"];
			if(_list){
				var urlList=singleList["singleLinkList"];//这里要进行判断
				if(flag==40||flag==70){
					//urlList=_list.urlList2;
					urlList=singleList["singleLinkListSpecial"];
				}
				for(var i=0;i<urlList.length;i++){
					var _title=urlList[i][0].format(_name);
					var _url=urlList[i][1].format(_code);
					arr.push('<li href='+_url+'>');
					arr.push('<span style="padding:2px 10px;display:inline-block;">'+_title+'</span>');
					arr.push('</li>');
				}
				//var newsUrl="http://news.search.hexun.com/cgi-bin/search/info_search.cgi?key={0}&f=0".format(_name);
				var newsUrl="http://news.search.hexun.com/news?key={0}".format(_name);
				var newsTitle="搜索{0}相关新闻".format(_name);
				if(!singleList.hideNews)
					{
					arr.push('<li href='+newsUrl+'>');
					arr.push('<span style="padding:2px 10px;display:inline-block;">'+newsTitle+'</span>');
					arr.push('</li>');
					}

			}
			
		}
		arr.push('</ul>');
		this.conPanel.innerHTML = arr.join('');
		this.bindListEvent();
	},
	
	setContentColor:function(val){
		var _value=this.input.value.toUpperCase();
		var val=val.replace(_value,'<span style="color:#f00;">'+_value+'</span>');
		return val;
	},

	bindListEvent:function(){
		var _this=this;
		this.step=-1;//-1为默认文本框里的内容，不做任何经过处理
		var conPanel=this.conPanel;
		var aLi=conPanel.getElementsByTagName("li");
		for(var i=0;i<aLi.length;i++){
			aLi[i].onmouseover=function(){
				for(var j=0;j<aLi.length;j++){
					aLi[j].className="";
				}
				var _data_temp=this.getAttribute("data-temp");
				var _data_href=this.getAttribute("href");
				if(_data_temp||_data_href){
					this.className="hov";
				}
			}

			aLi[i].onmousedown=function(ev){
				var oEvent=window.event || ev;
				oEvent.cancelBubble=true;
				var _temp=this.getAttribute("data-temp");
				//if(_temp){
					//var name=_temp.split("_");
					//_this.input.value=name[1];
				//}
				var _url=this.getAttribute("href");
				if(_url){
					window.open(_url,"_blank");//由_this.target修改为_blank
					clearInterval(_this.timer);
					_this.conPanel.style.display="none";
					//window.focus();
					_this.input.blur();
					return false;
				}
				
			}
		}

		this.show();
	},
	

	//键盘事件
	keyEvent:function(e) {
		var _this=this;
		var e = e?e:window.event;
		var conPanel=this.conPanel;
		var aLiList=conPanel.getElementsByTagName('li');
		if(typeof this.conPanel =='undefined' &&  this.conPanel.display == 'none') {
			return false;
		}
		if(e.keyCode == 38) {
			//向上
			var len = aLiList.length;
			if(len>=1) {
				this.step = (this.step==0)?(len-1):(this.step-1);
				this.selectRow(this.step);
			}
		}
		if(e.keyCode == 40) {
			//向下
			var len = aLiList.length;
			if(len>=1) {
				this.step = (this.step==len-1)?0:(this.step+1);
				this.selectRow(this.step);
			}
		}
		if(e.keyCode==13){
			if(this.step<0){
				//没有做任何选择，等同于点击搜索按钮
				//做搜索跳转，并将内容传出
				this.openPage();
				return false;
			}

			var currentLi=aLiList[this.step];
			var _temp=currentLi.getAttribute("data-temp");
			//if(_temp){
				//var name=_temp.split("_");
				//this.input.value=name[1];

				//return false;
				
			//}
			var _url=currentLi.getAttribute("href");
			if(_url){
				window.open(_url,"_blank");
				clearInterval(_this.timer);
				_this.conPanel.style.display="none";
					//window.focus();
				_this.input.blur();
			}
			else{
				/**
					*这种情况是只有一列数据，并且没有任何关联提示的，有且只有一条有效代码时执行
					*修改后，这种情况不会出现
				*/
				alert("代码输入错误");
				this.tempSingleList=true;//这里可以设置一个戳，来表示是否是只有一列数据，当enter后，跳转页面。
			}
			return false;
		}
	},

	selectRow:function(step){
		var liList=this.conPanel.getElementsByTagName("li");
		if(liList.length==1){
			var currentLi=liList[0];
			var _temp=currentLi.getAttribute("data-temp");
			if(!_temp){
				return false;
			}
		}
		for(var i=0;i<liList.length;i++){
			liList[i].className="";
		}
		liList[step].className="hov";
	},

	show:function(){
		this.conPanel.style.display="block";
		var isIE67=this.isIE67;
		var inputWidth=this.input.offsetWidth;
		var inputHeight=this.input.offsetHeight;
		var btnSearch=this.btnSearch;
		var searchContainer=this.searchContainer;

		var containerWidth=this.input.parentNode.offsetWidth;

		if(searchContainer){
			containerWidth=JsSearch.getID(searchContainer).offsetWidth;
		}

		var searchBtnWidth=btnSearch.offsetWidth;
		var curWidth=containerWidth-searchBtnWidth-3;

		var inputPoint=JsSearch.getAbsPoint(this.input);
		var _x=inputPoint.x;
		var _y=inputPoint.y;
		var conPanel=this.conPanel;
		var h=conPanel.offsetHeight;
		//conPanel.style.width=inputWidth+2+"px";
		//conPanel.style.width=curWidth+"px";
		if(isIE67){
			//conPanel.style.left=_x+"px";
			//conPanel.style.left="0px";
			//conPanel.style.top=_y+inputHeight+(2*this.boxHeight)+"px";
		}
		else{
			//conPanel.style.left=_x-this.boxWidth+"px";
			//conPanel.style.left="0px";
			//conPanel.style.top=_y+inputHeight+this.boxHeight+"px";
		}

		this.conPanel.style.borderColor=this.boxColor;
		
	}

},{
	_instance:null,

	get:function(){
		//if(!this._instance){
		this._instance=new hexun.common.Search();
		//}
		return this._instance;
	}	
});

var resetSearchH = function(){
	var windowHeight = document.documentElement.clientHeight || document.body.clientHeight;
	var footer = document.getElementById("footer_2014");
	if (footer){windowHeight < 750 ? footer.style.display = "none":footer.style.display = "block"}
}
