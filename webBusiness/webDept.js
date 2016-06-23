var webDept = {

	Id : function(element){return document.getElementById(element)},

	getClassNames : function (classStr,tagName){ 
		if (document.getElementsByClassName) { 
			return document.getElementsByClassName(classStr) 
		}else { 
			var nodes = document.getElementsByTagName(tagName),ret = []; 
			for(i = 0; i < nodes.length; i++) { 
				if(hasClass(nodes[i],classStr)){ 
					ret.push(nodes[i]) 
				} 
			} 
			return ret; 
		} 
		function hasClass(tagStr,classStr){ 
			var arr=tagStr.className.split(/\s+/ ); 
			for (var i=0;i<arr.length;i++){ 
				if (arr[i]==classStr){ 
					return true ; 
				} 
			} 
			return false ; 
		} 
	},

	Jsonp : function(url,callback){
		var url = (url.indexOf('?') != -1) ? (url + '&') : (url + '?');
		var time = new Date().getTime();
		var name = 'hx_' + time;
		url += 'callback=' + name  ;
		window[name] = callback;		
		var road = document.createElement('script');
		road.type = 'text/javascript';
		road.charset = "gb2312";
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

	getHotData : function(){
		webDept.Jsonp("http://qhyyt.hexun.com/company/topeightcompany.html",function(data){
			var _s = [];
			for (var i in data){
				_s.push('<div class="list">');
				_s.push('<div class="d1">');
				_s.push('<a href="'+data[i].url+'" title="'+data[i].company+'" target="_blank"><span class="a1">');
				_s.push(data[i].company+'</span>');
				_s.push('&nbsp;&nbsp;&nbsp;'+data[i].name+'</a>');
				_s.push('</div>');
				_s.push('<div class="d2"><div class="d2Txt">');
				_s.push('<div><div class="star"><div class="star'+data[i].starrank+'"></div></div>');
				_s.push('<span class="comment">'+data[i].comment_number+'封点评</span></div>');
				_s.push('<div style="clear:both">');
				_s.push('<table><col width="40"><col width="300">');
				_s.push('<tr><td class="blue" valign="top">地址：</td><td>'+data[i].address+'</td></tr>');
				_s.push('<tr><td class="blue" valign="top">标签：</td><td>'+data[i].tag+'</td></tr>');
				_s.push('<tr><td class="blue" valign="top">活动：</td><td>');
				_s.push(data[i].title==null?'--':data[i].title);
				_s.push('</td></tr></table>');
				_s.push('</div>');
				_s.push('</div></div>');
				_s.push('</div>');
			}
			webDept.Id("hotDept").innerHTML = _s.join('');
			webDept.bindEvent();
		});
	},

	getAreaData : function(city,top,left){
		webDept.Id("webDeptTip").innerHTML = "数据加载...";
		webDept.Id("webDeptTip").style.top = top+"px";
		webDept.Id("webDeptTip").style.left = left+"px";
		webDept.Id("webDeptTip").style.display = "block";
		webDept.Jsonp("http://qhyyt.hexun.com/company/getcompanybyarea.html?prov="+city,function(data){
			var _s = [];
			_s.push('<div id="closeBox" onclick="webDept.areaClose()">关闭</div>');
			_s.push('<a href="'+data.more+'" target="_blank" id="areaMore">更多>></a>');
			_s.push('<div class="areaBoxTitle">'+city+'</div>');
			_s.push('<ul>');
			for (var i in data.list){
				_s.push('<li><a href="'+data.list[i].url+'" target="_blank" title="'+data.list[i].name+'">'+data.list[i].name+'</a></li>');
				_s.push('');
			}
			_s.push('</ul>');
			webDept.Id("webDeptTip").innerHTML = _s.join('');
		});
	},

	areaClose : function(){
		webDept.Id("webDeptTip").style.display = "none";
	},

	hotAddClass : function(e){
		e.className = "list s";
	},

	hotDelClass : function(e){
		e.className = "list";
	},

	bindEvent:function(){
		var _List = webDept.getClassNames('list' , 'div'); 
		for (i = 0; i < _List.length; i++){
			_List[i].onmousemove = function(){
				webDept.hotAddClass(this);
			}
			_List[i].onmouseout = function(){
				webDept.hotDelClass(this);
			}
		}
	}

}
webDept.getHotData();




